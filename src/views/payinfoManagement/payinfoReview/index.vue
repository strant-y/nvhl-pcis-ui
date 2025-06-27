<!-- 缴费信息审核 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
    />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { deleteFactorBykey, getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import moment from "moment";
import { PcisQueryService } from "@/views/payinfoManagement/service/pcis-query-service";
const pcisQueryService = new PcisQueryService();
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
// const departmentTree = defineAsyncComponent(
//   () => import("@/components/common/DepartmentTree.vue")
// );
import DepartmentTree from "@/pcis/prodRef/commodityRef/DepartmentTree.vue";
// 缴费信息审核-详情
const detail = defineAsyncComponent(
  () => import("./payment-information-management-detail.vue")
);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "缴费信息审核",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery();
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          freeEditRef.value?.resetFields();
          handleQuery(true);
          // freeEditRef.value?.resetForm();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "AccDpt",
        inputtype: "rtselect",
        title: "机构部门",
        btnWidth: 10,
        itemWidth: 2,
        // rules: [getRules("required", {
        //   trigger: 'change'
        // })],
        showExBtn: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            dzmodal
              .open(DepartmentTree, { type: "Issuer", data: {} })
              .then((res) => {
                if (res.body) {
                  const selectObj = res.body;
                  freeEditRef.value?.setValue("AccDpt", selectObj.id);
                  setFormItem("AccDpt", {
                    loadData: [
                      {
                        label: selectObj.name,
                        value: selectObj.id,
                      },
                    ],
                  });
                }
              });
          },
        },
      },
      {
        prop: "LoadSub",
        inputtype: "rtcheckbox",
        title: "包含下级机构",
        showKey: [5],
        defaultValue: 1,
        keymap: {
          y: 1,
          n: 0,
        },
      },
      {
        prop: "CDateTyp",
        inputtype: "rtselect",
        title: "日期类型",
        loadData: [
          { label: "核保日期", value: "1" },
          { label: "起保日期", value: "2" },
          { label: "缴费处理日期", value: "3" },
        ],
        rules: [getRules("required", {})],
      },
      {
        prop: "dateRange",
        inputtype: "rtdatepicker",
        title: "日期起止期",
        // itemWidth: 2,
        clearable: true,
        rules: [getRules("required", {})],
        type: "datetimerange",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        // defaultValue: [
        //   moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format(
        //     "YYYY-MM-DD 00:00:00"
        //   ),
        //   moment(new Date()).format("YYYY-MM-DD 23:59:59"),
        // ],
      },
      {
        prop: "CBillTyp",
        inputtype: "rtselect",
        title: "单据类型",
        clearable:true,
        loadData: [
          { label: "投保单号", value: "1" },
          { label: "交易号", value: "3" },
        ],
        defaultValue: "3",
      },
      {
        prop: "CBillNoStart",
        inputtype: "rtinput",
        title: "单据号起",
        clearable: true,
      },
      {
        prop: "CBillNoEnd",
        inputtype: "rtinput",
        title: "单据号止",
        clearable: true,
      },
      {
        prop: "CKindNo",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "KIND_LIST_GRT",
        params: { cOperId: user.value.opCde, cDptCde: user.value.companyId },
        clearable: true,
        func: (val: any) => {
            // 更新产品下拉选
            setFormItem("CProdNo", {
                codeParam: {
                    cParCde: val,
                    cOperId: user.value?.opCde,
                    cDptCde: user.value?.companyId,
                },
            });
            freeEditRef.value?.setValue("CProdNo", null);
        },
      },
        {
            prop: "CProdNo",
            inputtype: "rtselect",
            title: "条款",
            itemWidth: 1,
            filterable: true,
            clearable: true,
            typeCode: "TERM_LIST_IN_GUIDE_NEW",
            codeParam: {
                cOperId: user.value?.opCde,
                cDptCde: user.value?.companyId,
            },
            func: (val) => {
            },
        },
    ],
  })
);

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    editFlag: true,
    editList: ["cStatus"],
    tableBtnType: "btn",
    tableBtnWidth: 90,
    tableBtnPosition: "right",
    tableBtnFixed: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "处理",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {
          dzmodal
            .open(detail, { type: "edit", data: { cUniqueNo: row.cUniqueNo } })
            .then((res) => {
              if (res.type === "ok") {
                handleQuery(true);
              }
            });
        },
      }),
    ],

    fromSchema: [
      {
        prop: "cPayTyp",
        inputtype: "rtselect",
        title: "缴费类型",
        minWidth: 180,
        fixed: "left",
        typeCode: "CHARGE_TYPE_CACHE",
        param: { cCde: ["2", "3", "5", "99"] },
        // formatter: (val) => {
        //   const CStatusList = [
        //     { value: "2", label: "支票缴费" },
        //     { value: "5", label: "转账" },
        //   ];
        //   const result = CStatusList.find((item) => item.value === val);
        //   return result ? result.label : val;
        // },
      },
      {
        prop: "cChqueNo",
        inputtype: "rtinput",
        title: "交易号",
        minWidth: 180,
      },
      {
        prop: "nPrm",
        inputtype: "rtnumber",
        title: "保费",
        minWidth: 180,
      },
      {
        prop: "nTax",
        inputtype: "rtnumber",
        title: "车船税",
        minWidth: 180,
      },
      {
        prop: "nPayAmt",
        inputtype: "rtnumber",
        title: "缴费金额",
        minWidth: 180,
      },
      {
        prop: "cTermName",
        inputtype: "rtinput",
        title: "条款",
        minWidth: 180,
      },
      // {
      //   prop: "d",
      //   inputtype: "rtinput",
      //   title: "保额",
      //   minWidth: 180,
      // },
      // {
      //   prop: "d",
      //   inputtype: "rtinput",
      //   title: "保险起止日期",
      //   minWidth: 180,
      // },
    ],
  })
);

onMounted(async () => {
  nextTick(() => {
    freeEditRef.value?.setValue("CDateTyp", "1");
    freeEditRef.value?.setValue("dateRange", [
      moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format(
        "YYYY-MM-DD 00:00:00"
      ),
      moment(new Date()).format("YYYY-MM-DD 23:59:59"),
    ]);

    freeEditRef.value?.setValue("AccDpt", user.value['companyId']);
    setFormItem("AccDpt", {
      loadData: [
        {
          label: user.value['companyCnm'],
          value: user.value['companyId'],
        },
      ],
    });
    freeEditRef.value?.setValue("LoadSub", 1);
  });
  // handleQuery(true);
});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

// 绑定特殊验证器
const exRules = {
  byrtInput: (rule: any, value: any, callback: any) => {
    const r = freeEditRef.value?.getFromValue();
    if (r["name"]) {
      callback();
    } else {
      callback("姓名");
    }
  },
};

/** 查询 */
function handleQuery(flag?: boolean) {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      const tmArr = freeEditRef.value?.getValue("dateRange");
      const startDate = Date.parse(tmArr[0]);
      const endDate = Date.parse(tmArr[1]);
      // if (startDate - endDate > 0) {
      //   ElMessage.warning('日期起期不能大于日期止期');
      //   return;
      // }
      if (endDate - startDate >= 7 * 1000 * 60 * 60 * 24) {
        ElMessage.warning("日期时间范围请控制在7天以内");
        return;
      }

      const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
      const s = freeEditRef.value?.getFromValue(); //获取表单数据

      const param = Object.assign(
        {
          // sortField: 'name', // 涉及排序
          // sortOrder: sortValue, // 涉及排序
          allow_anonymous: true,
          CurrentUser: user.value.opCde,
          CurrentUserOrg: user.value.companyId,
        },
        s,
        r
      );
      pcisQueryService.getPayConfirmInfoAuditList(param).then((res: any) => {
        const { code, data, msg } = res;
        if (res.code === 200) {
          const pageData = res.data;
          if (pageData) {
            pageresult.list = [];
            pageresult.list = data.result;
            pageresult.total = data.total;
          }
        } else {
          ElMessage.error("后台服务异常,请联系管理员");
        }
      });
    }
  });
}
//给表单下拉项赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          for (let key in obj.btnItems) {
            item.btnItems[key] = obj.btnItems[key];
          }
        }else{
          Object.assign(item, obj);
        }
      }
    });
  }
}
</script>

<style scoped></style>

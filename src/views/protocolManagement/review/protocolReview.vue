<!-- ECargo 协议录入 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @page-change="handleQuery(false)"
        @selection-change="handleSelectionChange"
    />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store";
import { useValidator } from "@/typings/useValidator";
import { useRouter, useRoute } from "vue-router";
const { getRules } = useValidator();
const route = useRoute();
const router = useRouter();
import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { deleteFactorBykey, getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import moment from "moment";
import { initMultiCodeList } from "@/api/code-list-service"; // 代码列表服务
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
import { codeListViewStore } from "@/store";
const policyService = new PolicyService();
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
import cargoApi from '@/api/cargo'

const codeListStore = codeListViewStore();

const params = route.query.data ? JSON.parse(route.query.data) : {};
const dataSet = ref<any>([]); // 数据集合
const planSet = ref<any>([]); //结果集

const selectedRows = ref<any[]>([]);
const btnTitle = ref<any>([{ label: "" }, { label: "" }]);
const formconfig1 = reactive<AppFreeEditConfig>(
    createAppFreeEditConfig({
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
            freeEditRef.value?.setFormValue({
              cKindNo: "",
              cStatus: "",
            });
            handleQuery(true);
            // freeEditRef.value?.resetForm();
          },
        }),
      ],
      fromSchema: [
        {
          prop: "cDptCde",
          inputtype: "rtselect",
          title: "承保机构",
          btnWidth: 20,
          itemWidth: 1,
          rules: [{ "type": "required" }],
          showExBtn: true,
          btnItems: {
            icon: "Search",
            type: "primary"
          },
          loadData: [
            {
              "label": "永安保险总公司",
              "value": "0200000000000"
            }
          ]
        },
        {
          prop: "CLoadSub",
          inputtype: "rtcheckbox",
          title: "是否包含下级",
          defaultValue: 1,
          keymap: {
            y: 1,
            n: 0,
          },
          itemWidth: 2,
        },
        {
          prop: "cKindNo",
          inputtype: "rtselect",
          title: "产品大类",
          itemWidth: 1,
          rules: [{ type: "required" }],
          typeCode: "KIND_LIST_GRT",
          child: "cProdNo",
          filterable: true,
          clearable: true,
          codeParam: {
            cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
            cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
          },
          func: (val: string) => {
            codeListStore
                .queryCodeList({
                  codeListName: "TERM_LIST_IN_GUIDE_NEW",
                  codeListParam:{
                    cParCde: val,
                    cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
                    cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
                  },
                })
                .then((res) => {
                  setFormItem("cProdNo", {
                    loadData: res,
                  });
                });
          },
        },
        {
          prop: "cProdNo",
          inputtype: "rtselect",
          title: "条款",
          itemWidth: 1,
          rules: [{ type: "required" }],
          filterable: true,
          clearable: true,
          // typeCode: "TERM_LIST_IN_GUIDE_NEW",
          // codeParam: {
          //   cParCde: cPard.value,
          //   cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          //   cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
          // },
          func: (val: string) => {},
        },
        {
          prop: "CAppNme",
          inputtype: "rtinput",
          title: "投保人名称",
          clearable: true,
        },
        {
          prop: "CInsuredNme",
          inputtype: "rtinput",
          title: "被保人姓名",
          clearable: true,
        },
        {
          prop: "TEffectTm",
          inputtype: "rtdatepicker",
          title: "生效日期",
          itemWidth: 1,
          clearable: true,
          type: "datetimerange",
          format: "YYYY-MM-DD HH:mm:ss",
          valueFormat: "YYYY-MM-DD HH:mm:ss",
          defaultValue: [
            moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format(
                "YYYY-MM-DD 00:00:00"
            ),
            moment(new Date()).format("YYYY-MM-DD 23:59:59"),
          ],
        }
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
      showSelection: true,
      tableBtn: [
        createFreeButtonBase({
          id: "score",
          link: true,
          tooltip: "查看",
          type: "danger",
          size: "large",
          icon: "View",
          tableClick: (row) => {
            console.log(row);
            toDtl(row, 'view');
          },
        }),
        createFreeButtonBase({
          id: "score",
          link: true,
          tooltip: "编辑",
          type: "success",
          size: "large",
          icon: "Edit",
          tableClick: (row) => {
            console.log(row);
            toDtl(row, 'edit');
          },
        }),
      ],
      tableBtnPosition: "left",
      tableBtnType: "icon",
      tableBtnWidth: "auto",
      title: "协议列表",

      fromSchema: [
        {
          prop: "cAgreementNo",
          inputtype: "rtinput",
          title: "协议号",
          minWidth: 180,
        },
        {
          prop: "cPlyNo",
          inputtype: "rtinput",
          title: "客户编号",
          minWidth: 180,
        },
        {
          prop: "cEdrNo",
          inputtype: "rtinput",
          title: "客户名称",
          minWidth: 180,
        },
        {
          prop: "cAgreementDptCde",
          inputtype: "rtinput",
          title: "出单机构",
          minWidth: 120,
        },
        {
          prop: "tEffectTm",
          inputtype: "rtinput",
          title: "生效日期",
          minWidth: 120,
        },
        {
          prop: "tExpireTm",
          inputtype: "rtinput",
          title: "协议止期",
          minWidth: 120,
        },
        {
          prop: "cStatus",
          inputtype: "rtinput",
          title: "协议状态",
          minWidth: 120,
        },
        {
          prop: "cIsValid",
          inputtype: "rtinput",
          title: "有效",
          minWidth: 180,
        },
        {
          prop: "nPayBalance",
          inputtype: "rtinput",
          title: "缴费余额",
          minWidth: 120,
        },
      ],
    })
);

onMounted(async () => {

});

function toDtl(row: any, type: string) {
  router.push({path: "/protocolManagement/reviewDtl", query: {param: JSON.stringify(row), type: type}});
}

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

// 绑定特殊验证器
const exRules = {};

/** 查询 */
function handleQuery(flag?: boolean) {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      const param = {
        ...{
          queryTab: "review",
          CurrentUser: user.value?.opCde,
          CurrentUserOrg: user.value?.companyId,
        },
        ...freeEditRef.value?.getFromValue(),
      };
      cargoApi.query(param)
          .then((res: any) => {
            if (res && res.code === 200) {
              const pageData = res.data;
              if (pageData) {
                pageresult.list = pageData.list;
                pageresult.total = pageData.total;
              }
            }
          })
          .catch((err: any) => {
            ElMessage.error({
              message: "后台服务异常,请联系管理员",
              duration: 3000,
            });
          });
    }
  });
  pageresult.list = [
    {
      cAgreementNo: '1234567890',
      cClientNo: '222',
      cClientNme: '张三',
      cDptCde: '0200000000000',
      tEffectTm: '2025-01-01 00:00:00',
      tExpireTm: '2026-01-01 00:00:00',
      cStatus: '正常',
      nPayBalance: 100,
    },
    {
      cAgreementNo: '1234567890',
      cClientNo: '222',
      cClientNme: '张三',
      cDptCde: '0200000000000',
      tEffectTm: '2025-01-01 00:00:00',
      tExpireTm: '2026-01-01 00:00:00',
      cStatus: '正常',
      nPayBalance: 100,
    },
  ]
  pageresult.total = 2;
}

// 选中事件
function handleSelectionChange(rows: any) {
  selectedRows.value = rows;
}


function setValue(key: string, value: any) {
  freeEditRef?.value?.setValue(key, value);
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
//给表格表单项赋值
function setTableFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    tableconfig.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        Object.assign(item, obj);
      }
    });
  }
}

</script>

<style scoped></style>

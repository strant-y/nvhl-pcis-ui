<!-- 缴费信息审核 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
    >
    <!-- policyInfo 列的具名插槽 -->
      <template #column-policyInfo="{ row, column, index }">
        <div class="policy-info-cell">
          <div v-if="row.cAppNo" class="policy-number-row">
            <span v-html="row.cAppNo"></span>
            <el-icon class="copy-icon" @click="copyText(row.cAppNo)">
              <DocumentCopy />
            </el-icon>
          </div>
          <!-- <div v-if="row.cPlyNo" class="policy-number-row">
            <span v-html="row.cPlyNo"></span>
            <el-icon class="copy-icon" @click="copyText(row.cPlyNo)">
              <DocumentCopy />
            </el-icon>
          </div> -->
        </div>
      </template>
      <template #column-InsurancePeriod="{ row, column, index }">
        <div class="policy-info-cell">
          <div v-if="row.tInsrncBgnTm" class="policy-period-row">
            <span v-html="row.tInsrncBgnTm"></span>
          </div>
          <div v-if="row.tInsrncEndTm" class="policy-period-row">
            <span v-html="row.tInsrncEndTm"></span>
          </div>
        </div>
      </template>
      <template #column-cTermName="{ row, column, index }">
        <el-tooltip :content="row.cTermName" placement="top">
          <span v-html="row.cTermName || ''" class="twoLine"></span>
        </el-tooltip>
      </template>
  </app-table>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { DocumentCopy } from "@element-plus/icons-vue";
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
    fromUi: {labelWidth: '105px'},
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
        format: "YYYY-MM-DD",
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
        // defaultValue: 3,
        loadData: [
          { label: "申请单号", value: "1" },
          { label: "交易号", value: "3" },
        ],
      
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
    tableBtnWidth: 95,
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
        // hideBtns: (row: any) => {
        //     if (
        //         row.cPlyNo === "" || row.cPlyNo === null
        //     ) {
        //         return false;
        //     } else {
        //         return true;
        //     }
        // },
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
        prop: "policyInfo",
        inputtype: "rtinput",
        title: "申请单号",
        lengthNum: 21,
        lengthIsNumber: true,
        fixed: "left",
        slotName: "policyInfo"
      },
      {
        prop: "cPayTyp",
        inputtype: "rtselect",
        title: "缴费类型",
        lengthNum: 9,
        fixed: "left",
        typeCode: "CHARGE_TYPE_CACHE",
        param: { cCde: ["2", "3", "5", "99"] },
      },
      {
        prop: "cChqueNo",
        inputtype: "rtinput",
        title: "交易号",
        // lengthNum: 18,
        // lengthIsNumber: true,
        align: "left",
      },
      {
        prop: "nPrm",
        inputtype: "rtnumber",
        title: "保费",
        lengthNum: 12,
        lengthIsNumber: true,
        align: "left"
      },
      // {
      //   prop: "nTax",
      //   inputtype: "rtnumber",
      //   title: "车船税",
      //   minWidth: 180,
      // },
      {
        prop: "nPayAmt",
        inputtype: "rtnumber",
        title: "缴费金额",
        lengthNum: 12,
        lengthIsNumber: true,
        align: "left"
      },
      {
        prop: "cTermName",
        inputtype: "rtinput",
        title: "条款",
        slotName: "cTermName",
        align: 'left',
        lengthNum: 25,
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
          label: user.value['companyId'] + ' ' + user.value['companyCnm'],
          value: user.value['companyId'],
        },
      ],
    });
    freeEditRef.value?.setValue("LoadSub", 1);
    freeEditRef.value?.setValue("CBillTyp", '3');
  });
  // handleQuery(true);
});

// 绑定方法
const method = {
  func1: () => {
  },
};
// 添加 copyText 方法
const copyText = (text: any) => {
  if (!text) {
    ElMessage.warning('没有可复制的内容');
    return;
  }

  // 检查 navigator.clipboard 是否存在
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(
        () => {
          ElMessage.success('复制成功');
        },
        () => {
          ElMessage.error('复制失败');
        }
    );
  } else {
    // 使用 document.execCommand('copy') 方法作为备选方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      const result = document.execCommand('copy');
      if (result) {
        ElMessage.success('复制成功');
      } else {
        ElMessage.error('复制失败');
      }
    } catch (err) {
      ElMessage.error('复制失败，请稍后再试');
    } finally {
      document.body.removeChild(textarea); // 清理创建的 textarea 元素
    }
  }
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
      if(tmArr[1]) {
        tmArr[1] = moment(tmArr[1]).format("YYYY-MM-DD 23:59:59")
      }
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
        r,
        {dateRange: tmArr}
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

<style scoped>
.copy-icon {
  margin-left: 5px;
  cursor: pointer;
  color: #409eff;
}
.twoLine {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-break: break-all;
  overflow: hidden;
}
</style>

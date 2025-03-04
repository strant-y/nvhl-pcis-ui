<!-- 配置 -->
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
import { PcisQueryService } from "../service/pcis-query-service";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { log } from "console";
const pcisQueryService = new PcisQueryService();
const dzmodal = useDzModal();
const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
);

const payConfirmInfoChange = defineAsyncComponent(
  () => import("./pay-confirm-info-change.vue")
);
const payConfirmInfoRegister = defineAsyncComponent(
  () => import("./pay-confirm-info-register.vue")
);
const payConfirmInfoDetailRead = defineAsyncComponent(
  () => import("./pay-confirm-info-detail-read.vue")
);
const tableRef = ref<AppTableMethod | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "缴费类型转换",
        func: async () => {
          // 准备参数并调用服务 mock数据
          const param = {
            CUniqueNo: "",
          };
          pcisQueryService
            .befChangeSts(param)
            .then((res) => {
              const { code, data, msg } = res;
              if (200 === code) {
                console.log("缴费类型转换 弹窗");
              } else {
                //ElMessage.error(msg);
              }
            })
            .finally(() => {
              dzmodal.open(payConfirmInfoChange, { type: "" }).then((res) => {
                if (res.type === "ok") {
                  console.log("审核");
                }
              });
            });
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "支票登记",
        func: async () => {
          dzmodal.open(payConfirmInfoRegister, { type: "" }).then((res) => {
            if (res.type === "ok") {
              console.log("审核");
            }
          });
        },
      }),
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
            COpgrpCde: "",
          });
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "导出Excel",
        func: async () => {
          console.log("导出Excel");
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "打印缴费通知书",
        func: async () => {
          console.log("打印缴费通知书");
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
        rules: [getRules("required", {})],
        param: { CDptCde: "" }, //待添加
        showExBtn: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            dzmodal
              .open(departmentTree, { type: "Issuer", data: {} })
              .then((res) => {
                if (res.type === "ok") {
                }
              });
          },
        },
      },
      {
        prop: "LoadSub",
        inputtype: "rtcheckbox",
        title: "是否包含下级",
      },
      {
        prop: "CPayStatus",
        inputtype: "rtinput",
        rules: [getRules("required", {})],
        title: "缴费状态",
      },
      {
        prop: "CKindNo",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "KIND_LIST_GRT",
      },
      {
        prop: "CProdNo",
        inputtype: "rtselect",
        title: "产品",
        typeCode: "PROD_LIST_GRT",
      },
      {
        prop: "CAppNmeInvest",
        inputtype: "rtinput",
        title: "投保人",
      },
      {
        prop: "CPayTyp",
        inputtype: "rtselect",
        title: "缴费类型",
        typeCode: "CPAY_TYP",
      },
      {
        prop: "CCombinationNo",
        inputtype: "rtinput",
        title: "组合产品申请单号",
      },
      {
        prop: "CBillTyp",
        inputtype: "rtselect",
        title: "单据类型",
        typeCode: "CBILL_TYP",
      },
      {
        prop: "CBillNoStart",
        inputtype: "rtinput",
        title: "单据号起",
      },
      {
        prop: "CBillNoStart",
        inputtype: "rtinput",
        title: "单据号起",
      },
      {
        prop: "CBillNoEnd",
        inputtype: "rtinput",
        title: "单据号止",
      },
      {
        prop: "CDateTyp",
        inputtype: "rtselect",
        title: "日期类型",
        typeCode: "CDATE_TYP",
      },
      {
        prop: "dateRange",
        inputtype: "rtdatepicker",
        title: "日期起止期",
        typeCode: "CDATE_TYP",
      },
      {
        prop: "CSlsNme",
        inputtype: "rtinput",
        title: "业务员名称",
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
    showSelection: true,
    tableBtnType: "btn",
    tableBtnWidth: 150,
    tableBtnPosition: "right",
    tableBtnFixed: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "详情",
        type: "success",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          dzmodal.open(payConfirmInfoDetailRead, { type: "" }).then((res) => {
            if (res.type === "ok") {
              console.log("详情");
            }
          });
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "文档",
        type: "success",
        size: "large",
        icon: "Document",
        tableClick: (row) => {
          console.log("编辑");
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "投保单号",
      },
      {
        prop: "nTms",
        inputtype: "rtinput",
        title: "期次",
      },
      {
        prop: "cAppNmeInvest",
        inputtype: "rtinput",
        title: "投保人名称",
      },
      {
        prop: "cPayTyp",
        inputtype: "rtinput",
        title: "缴费类型",
      },
      {
        prop: "cPaySequence",
        inputtype: "rtinput",
        title: "无线pos缴费序号",
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "保费金额",
      },
      {
        prop: "nPayAmt",
        inputtype: "rtinput",
        title: "应缴金额",
      },
      {
        prop: "cCheckSts",
        inputtype: "rtinput",
        title: "处理状态",
      },
      {
        prop: "tBgnTm",
        inputtype: "rtinput",
        title: "起保日期",
      },
      {
        prop: "cUniqueNo",
        inputtype: "rtinput",
        title: "收据流水号",
      },
      {
        prop: "cBatchNo",
        inputtype: "rtinput",
        title: "批号",
      },
      {
        prop: "cPayStatus",
        inputtype: "rtinput",
        title: "缴费状态",
      },
      {
        prop: "tUdrTm",
        inputtype: "rtinput",
        title: "核保日期",
      },
      {
        prop: "cChargeCde",
        inputtype: "rtinput",
        title: "操作员",
      },
    ],
  })
);
onMounted(async () => {});

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
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  pcisQueryService
    .getPayConfirmInfoList(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = [];
        pageresult.list = data.result;
        pageresult.total = data.total;
      } else {
        //ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
</script>

<style scoped></style>

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
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });
const dzmodal = useDzModal();
// const kindEdit = defineAsyncComponent(() => import("./kindEdit.vue"));
const tableRef = ref<AppTableMethod | null>(null);
const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
);
const EpolicyQueryGrpDialog = defineAsyncComponent(
  // 清单查询
  () => import("../common/EpolicyQueryGrpDialog.vue")
);
const ElectronicInsurancePolicy = defineAsyncComponent(
  // 生成电子保单
  () => import("../common/ElectronicInsurancePolicy.vue")
);
const EpolicyGeneratElecInvoice = defineAsyncComponent(
  // 开具电子发票
  () => import("../common/EpolicyGeneratElecInvoice.vue")
);

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
          handleQuery();
          // freeEditRef.value?.resetForm();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "机构部门",
        btnWidth: 10,
        itemWidth: 2,
        rules: [{ type: "required" }],
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
        prop: "cStatus",
        inputtype: "rtradio",
        title: "包含下级机构",
        loadData: [
          { label: "是", value: 1 },
          { label: "否", value: 0 },
        ],
      },
      {
        prop: "CPlyType",
        inputtype: "rtselect",
        title: "单证类型",
        loadData: [
          { label: "电子保单", value: "PLY" },
          { label: "电子批单", value: "EDR" },
        ],
        func: (val: any) => {
          console.log(val, tableconfig.titleBtns);
          if (val == "PLY") {
            tableconfig.titleBtns[1].label = "生成电子保单";
            tableconfig.titleBtns[2].label = "电子保单下载";
          }
          if (val == "EDR") {
            tableconfig.titleBtns[1].label = "生成电子批单";
            tableconfig.titleBtns[2].label = "电子批单下载";
          }
        },
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "use_mrk" },
        clearable: true,
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "产品",
        typeCode: "PROD_LIST_GRT",
        params: {
          cParCde: "",
          cOperId: user.value.opCde,
          cDptCde: user.value.companyId,
        },
        clearable: true,
      },
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        clearable: true,
      },
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
        clearable: true,
      },
      {
        prop: "CAppCertfCde",
        inputtype: "rtinput",
        title: "投保人证件号码",
        clearable: true,
      },
      {
        prop: "CAppNo",
        inputtype: "rtinput",
        title: "投保单号",
        clearable: true,
      },
      {
        prop: "CInsuredNme",
        inputtype: "rtinput",
        title: "被保人姓名",
        clearable: true,
      },
      {
        prop: "CInsuredCertfCde",
        inputtype: "rtinput",
        title: "被保人证件号码",
        clearable: true,
      },
      {
        prop: "CBatchNo",
        inputtype: "rtinput",
        title: "导入保单批次号",
        clearable: true,
      },
      {
        prop: "tm",
        inputtype: "rtdatepicker",
        type: "daterange",
        format: "YYYY-MM-DD HH:mm:ss",
        title: "签单日期",
        clearable: true,
      },
      {
        prop: "CProjectLabel",
        inputtype: "rtinput",
        title: "项目标签",
        clearable: true,
      },
      {
        prop: "CResvTxt5",
        inputtype: "rtinput",
        title: "车牌号",
        clearable: true,
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
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "团单个打电子保单",
        type: "primary",
        func: function (row: any) {
          dzmodal
            .open(EpolicyQueryGrpDialog, { type: "edit", data: row })
            .then((res) => {
              if (res.type === "ok") {
                handleQuery();
              }
            });
        },
      }),
      createFreeButtonBase({
        id: "score",
        label: "生成电子保单",
        type: "primary",
        func: function (row: any) {
          dzmodal
            .open(ElectronicInsurancePolicy, { type: "edit", data: row })
            .then((res) => {
              if (res.type === "ok") {
                handleQuery();
              }
            });
        },
      }),
      createFreeButtonBase({
        id: "score",
        label: "电子保单下载",
        type: "primary",
        func: function (row: any) {},
      }),
      createFreeButtonBase({
        id: "score",
        label: "电子保单获取",
        type: "warning",
        func: function (row: any) {},
      }),
      createFreeButtonBase({
        id: "score",
        label: "开具电子发票",
        type: "warning",
        func: function (row: any) {
          dzmodal
            .open(EpolicyGeneratElecInvoice, { type: "edit", data: row })
            .then((res) => {
              if (res.type === "ok") {
                handleQuery();
              }
            });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "投保单号",
        minWidth: 180,
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        minWidth: 180,
      },
      {
        prop: "cEdrNo",
        inputtype: "rtinput",
        title: "批单号",
        minWidth: 180,
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人姓名",
        minWidth: 120,
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "保险费",
        minWidth: 120,
      },
      {
        prop: "cProdNmeCn",
        inputtype: "rtinput",
        title: "产品",
        minWidth: 120,
      },
      {
        prop: "cSlsNme",
        inputtype: "rtinput",
        title: "业务员名称",
        minWidth: 120,
      },
      {
        prop: "tAppTm",
        inputtype: "rtinput",
        title: "投保申请日期",
        minWidth: 180,
      },
      {
        prop: "tInsrncBgnTm",
        inputtype: "rtinput",
        title: "保险起期",
        minWidth: 120,
      },
      {
        prop: "tInsrncEndTm",
        inputtype: "rtinput",
        title: "保险止期",
        minWidth: 120,
      },
      {
        prop: "tUdrTm",
        inputtype: "rtinput",
        title: "核保日期",
        minWidth: 120,
      },
      // {
      //   prop: "cDptCde",
      //   inputtype: "rtinput",
      //   title: "承保机构",
      // },
      // {
      //   prop: "cMobile",
      //   inputtype: "rtinput",
      //   title: "投保人手机号",
      // },
      // {
      //   prop: "cEmail",
      //   inputtype: "rtinput",
      //   title: "投保人邮箱",
      // },
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
  getBasicKindList(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = [];
        pageresult.list = data.result;
        pageresult.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
</script>

<style scoped></style>

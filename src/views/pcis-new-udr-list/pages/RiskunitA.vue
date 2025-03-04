<!-- 配置 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef1" />

    <app-table
      :tableConfig="tableconfig1"
      v-model:pageresult="pageresult1"
      ref="tableRef1"
      @selection-change="handleSelectionChange1"
      @page-change="handleQuery1(false)"
    />

    <app-table
      :tableConfig="tableconfig2"
      v-model:pageresult="pageresult2"
      ref="tableRef2"
      @selection-change="handleSelectionChange2"
      @page-change="handleQuery2(false)"
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

const freeEditRef1 = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { deleteFactorBykey, getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const tableRef1 = ref<AppTableMethod | null>(null);
const tableRef2 = ref<AppTableMethod | null>(null);
const ViewContInfoComponent = defineAsyncComponent(
  () => import("@/views/pcis-new-udr-list/common/ViewContInfoComponent.vue")
);
const removeIds1 = ref([]); // 删除用户ID集合 用于批量删除
const removeIds2 = ref([]); // 删除用户ID集合 用于批量删除
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "风险累积信息",
    // endBtnsPosition: "right",
    // endBtns: [
    //   createFreeButtonBase({
    //     type: "primary",
    //     label: "查询",
    //     func: async () => {
    //       handleQuery1();
    //     },
    //   }),
    //   createFreeButtonBase({
    //     label: "重置",
    //     func: () => {
    //       freeEditRef1.value?.setFormValue({
    //         cKindNo: "",
    //         cStatus: "",
    //       });
    //       handleQuery1();
    //       // freeEditRef.value?.resetForm();
    //     },
    //   }),
    // ],
    fromSchema: [
      {
        prop: "NSeqNo",
        inputtype: "rtinput",
        title: "序号",
        clearable: true,
      },
      {
        prop: "CRiskUnitNme",
        inputtype: "rtinput",
        title: "风险单位名称",
        clearable: true,
      },
      {
        prop: "CRiskLvlCde",
        inputtype: "rtinput",
        title: "风险等级",
        clearable: true,
      },
      {
        prop: "NAmt",
        inputtype: "rtnumber",
        title: "保额",
        min: 0,
        max: 999999999999999999,
        step: 1,
        clearable: true,
      },
      {
        prop: "CAmtCur",
        inputtype: "rtinput",
        title: "保额币种",
        clearable: true,
        typeCode: "FIN_CUR_CACHE_TWO",
        param: {},
      },
      {
        prop: "NPrm",
        inputtype: "rtnumber",
        title: "净保费",
        min: 0,
        max: 999999999999999999.99,
        step: 0.01,
        clearable: true,
      },
      {
        prop: "CPrmCur",
        inputtype: "rtselect",
        title: "保费币种",
        clearable: true,
        typeCode: "FIN_CUR_CACHE_TWO",
        param: {},
      },
      {
        prop: "NRmbAmt",
        inputtype: "rtnumber",
        title: "折人民币保额",
        min: 0,
        max: 999999999999999999.99,
        step: 0.000001,
        clearable: true,
      },
      {
        prop: "NRmbChgRate",
        inputtype: "rtinput",
        title: "折人民币汇率",
        clearable: true,
      },
      {
        prop: "CCedPrmWay",
        inputtype: "rtselect",
        title: "分出方式",
        clearable: true,
        loadData: [
          { label: "毛保费分出", value: "G" },
          { label: "净保费分出", value: "N" },
        ],
      },
      {
        prop: "NRiPrm",
        inputtype: "rtinput",
        title: "折再保保费",
        clearable: true,
      },
      {
        prop: "CRiprmCur",
        inputtype: "rtselect",
        title: "再保保费币种",
        clearable: true,
        typeCode: "FIN_CUR_CACHE_TWO",
        param: {},
      },
      {
        prop: "NRicurChgRate",
        inputtype: "rtinput",
        title: "折再保币种汇率",
        clearable: true,
      },
      {
        prop: "NTaxAmt",
        inputtype: "rtinput",
        title: "增值税",
        clearable: true,
      },
      {
        prop: "NAmtVar",
        inputtype: "rtinput",
        title: "批单保额变化",
        clearable: true,
      },
      {
        prop: "NPrmVar",
        inputtype: "rtinput",
        title: "保批单保费变化",
        clearable: true,
      },
      {
        prop: "CRiprmCur",
        inputtype: "rtinput",
        title: "增值税率",
        clearable: true,
      },
      {
        prop: "CVatMrk",
        inputtype: "rtselect",
        title: "营改增标识",
        clearable: true,
        loadData: [
          { label: "否", value: "0" },
          { label: "是", value: "1" },
        ],
      },
      {
        prop: "NCiAmt",
        inputtype: "rtselect",
        title: "共保标识",
        clearable: true,
        lodaData: [
          { label: "非共保业务", value: "0" },
          { label: "内部共保（我方主共）", value: "1" },
          { label: "内部共保（我方从共）", value: "2" },
          { label: "外部共保（我方主共）", value: "3" },
          { label: "外部共保（我方从共）", value: "4" },
          { label: "内部共保", value: "5" },
        ],
      },
      {
        prop: "NCiPrpt",
        inputtype: "rtinput",
        title: "共保比例",
        clearable: true,
      },
      {
        prop: "NCiAmt",
        inputtype: "rtinput",
        title: "共保保额",
        clearable: true,
      },
      {
        prop: "CRiprmCur",
        inputtype: "rtinput",
        title: "共保保费",
        clearable: true,
      },
      {
        prop: "NContaintaxPrm",
        inputtype: "rtinput",
        title: "毛保费",
        clearable: true,
      },
      {
        prop: "NContaintaxPrmVar",
        inputtype: "rtinput",
        title: "毛保费变化量",
        clearable: true,
      },
      {
        prop: "NRetAmt",
        inputtype: "rtinput",
        title: "自留额",
        clearable: true,
      },
      {
        prop: "NRetPrpt",
        inputtype: "rtinput",
        title: "自留比例",
        clearable: true,
      },
      {
        prop: "NAmtVar",
        inputtype: "rtselect",
        title: "临分标志",
        clearable: true,
        loadData: [
          { label: "否", value: "0" },
          { label: "是", value: "1" },
        ],
      },
      {
        prop: "NFacEnterRetLmt",
        inputtype: "rtinput",
        title: "进入临分自留额限额",
        clearable: true,
      },
      {
        prop: "CRemark",
        inputtype: "rtinput",
        title: "备注",
        itemWidth: 3,
        clearable: true,
      },
    ],
  })
);

const pageresult1 = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableconfig1 = reactive<AppTableConfig>(
  createTableEditConfig({
    title: "风险单位信息",
    // editFlag: true,
    // tableBtnType: "btn",
    // tableBtnWidth: 220,
    // tableBtnPosition: "right",
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "拆分",
        type: "primary",
        func: function () {
          console.log("导出操作");
        },
      }),
      createFreeButtonBase({
        id: "score",
        label: "删除",
        type: "primary",
        func: function () {
          console.log("导出操作");
        },
      }),
      createFreeButtonBase({
        id: "score",
        label: "保存风险单位",
        type: "primary",
        func: function () {
          console.log("导出操作");
        },
      }),
      createFreeButtonBase({
        id: "score",
        label: "分保试算",
        type: "primary",
        func: function () {
          console.log("导出操作");
        },
      }),
    ],
    fromSchema: [
      {
        prop: "NSeqNo",
        inputtype: "rtinput",
        title: "序号",
        minWidth: 180,
        fixed: "left",
      },
      {
        prop: "CRiskUnitNme",
        inputtype: "rtinput",
        title: "风险单位名称",
        minWidth: 180,
        fixed: "left",
      },
      {
        prop: "CRiskLvlCde",
        inputtype: "rtinput",
        title: "风险等级",
        minWidth: 180,
      },
      {
        prop: "CCedPrmWay",
        inputtype: "rtinput",
        title: "分出方式",
        minWidth: 180,
      },
      {
        prop: "NRiPrm",
        inputtype: "rtinput",
        title: "折再保保费",
        minWidth: 180,
      },
      {
        prop: "NTaxAmt",
        inputtype: "rtinput",
        title: "增值税",
        minWidth: 180,
      },
      {
        prop: "NRates",
        inputtype: "rtinput",
        title: "增值税率",
        minWidth: 180,
      },
      {
        prop: "NContaintaxPrm",
        inputtype: "rtinput",
        title: "毛保费",
        minWidth: 180,
      },
      {
        prop: "NContaintaxPrmVar",
        inputtype: "rtinput",
        title: "毛保费变化量",
        minWidth: 180,
      },
      {
        prop: "CVatMrk",
        inputtype: "rtinput",
        title: "营改增标识",
        minWidth: 180,
      },
      {
        prop: "NRetAmt",
        inputtype: "rtinput",
        title: "自留额",
        minWidth: 180,
      },
      {
        prop: "NRetPrpt",
        inputtype: "rtinput",
        title: "自留比例",
        minWidth: 180,
      },
      {
        prop: "CFacMrk",
        inputtype: "rtinput",
        title: "临分标志",
        minWidth: 180,
      },
      {
        prop: "NFacEnterRetLmt",
        inputtype: "rtinput",
        title: "进入临分自留额限额",
        minWidth: 180,
      },
      {
        prop: "CRemark",
        inputtype: "rtinput",
        title: "备注",
        minWidth: 180,
      },
    ],
  })
);

const pageresult2 = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableconfig2 = reactive<AppTableConfig>(
  createTableEditConfig({
    title: "合约分出情况",
    editFlag: true,
    // tableBtnType: "btn",
    // tableBtnWidth: 220,
    // tableBtnPosition: "right",
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "查看比例合约",
        type: "primary",
        func: function () {
          console.log("导出操作");
          dzmodal
            .open(ViewContInfoComponent, { type: "Issuer", data: {} })
            .then((res) => {
              if (res.type === "ok") {
              }
            });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CContId",
        inputtype: "rtinput",
        title: "合约标识号",
        minWidth: 180,
        fixed: "left",
      },
      {
        prop: "CContCde",
        inputtype: "rtinput",
        title: "合约名称",
        minWidth: 180,
      },
      {
        prop: "NCedAmt",
        inputtype: "rtinput",
        title: "分出保额",
        minWidth: 180,
      },
      {
        prop: "NCedPrm",
        inputtype: "rtinput",
        title: "分出保费",
        minWidth: 180,
      },
      {
        prop: "NCedPrpt",
        inputtype: "rtinput",
        title: "分出比例(%)",
        minWidth: 180,
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
    // const r = freeEditRef.value?.getFromValue();
    // if (r["name"]) {
    //   callback();
    // } else {
    //   callback("姓名");
    // }
  },
};

/** 查询 */
function handleQuery1(flag?: boolean) {
  const r = tableRef1.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef1.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  getBasicKindList(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult1.list = [];
        pageresult1.list = data.result;
        pageresult1.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
function handleQuery2(flag?: boolean) {
  const r = tableRef2.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef2.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  getBasicKindList(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult2.list = [];
        pageresult2.list = data.result;
        pageresult2.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}

// 多选事件
function handleSelectionChange1(selection: any) {
  console.log("selection", selection);
  removeIds1.value = selection.map((item: any) => item.cPkId);
}

function handleSelectionChange2(selection: any) {
  console.log("selection", selection);
  removeIds2.value = selection.map((item: any) => item.cPkId);
}
</script>

<style scoped></style>

<!-- 发起风勘-编辑 -->
<template>
  <div>
    <el-dialog v-model="maindialogVisible" width="90%" title="历史赔案">
      <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />

    </el-dialog>
  </div>
  <!-- 查看明细 -->
  <el-dialog v-if="dialogVisible" v-model="dialogVisible" title="查看明细" width="90%">
    <app-table :tableConfig="tableconfig1" v-model:pageresult="pageresult1" ref="tableRef" />
  </el-dialog>

  <!-- 赔案明细 -->
  <el-dialog v-if="dialogVisibleDetail" v-model="dialogVisibleDetail" title="赔案明细" width="90%">
    <app-table :tableConfig="tableconfig2" v-model:pageresult="pageresult2" ref="tableRef" />
  </el-dialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { defineComponent, ref } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElTabs, ElTabPane, ElTable, ElTableColumn } from 'element-plus';

import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";

import { PcisQueryService } from "@/views/payinfoManagement/service/pcis-query-service";
import { defineEmits, onMounted } from "vue";

import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();

const emits = defineEmits(["ok", "cancel"]);
const pcisQueryService = new PcisQueryService();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const { getRules } = useValidator();

// const tabS = ref('01')
// const activeTab = ref('01');
// const detailTableData = ref();
const maindialogVisible = ref(true)
// const dialogVisible = ref(false)
// const dialogVisibleDetail = ref(false)


const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          // loadData()

          handleQuery();
        },
      }),
      createFreeButtonBase({
        type: "info",
        label: "返回",

        func: async () => {
          handleReturn()
        },
      }),
    ],
 
    fromSchema: [
            {
                prop: "DistSummary.cPlanNo",
                inputtype: "rtinput",
                title: "方案号",
            },
            {
                prop: "DistSummary.nInsuredHeadcount",
                inputtype: "rtinput",
                title: "投保雇员人数",
            },

            {
                prop: "DistSummary.nAnnualSalary",
                inputtype: "rtinput",
                title: "年工资总额（必填）元",
                // rules:[getRules("required", {})]
                // rules: [getRules("idCard", {})],
            },
            {
                prop: "DistSummary.cJobRole",
                inputtype: "rtinput",
                title: "岗位（非必填）",
            }
        ],
    // [
    //   {
    //     prop: "policyHolderName",
    //     inputtype: "rtinput",
    //     title: "投保人名称",
    //     disabled: true,
    //   },
    //   {
    //     prop: "policyHolderId",
    //     // inputtype: "rtinput",
    //     title: "投保人证件类型",
    //     inputtype: "rtselect",
    //     typeCode: "NATURAL_CERTIFICATE_ALL",
    //     disabled: true,
    //   },
    //   {
    //     prop: "insuredName",
    //     inputtype: "rtinput",
    //     title: "投保人证件号码",
    //     // rules: [getRules("idCard", {})],
    //     disabled: true,
    //   },
    //   {
    //     prop: "insuredId",
    //     inputtype: "rtselect",
    //     title: "查询类型",
    //     // disabled: true,
    //   },
    // ],
  })
);




onMounted(() => {

console.log(opertaor.getDataAll())
let DataAll = opertaor.getDataAll()['applicant']
nextTick(() => {


  // handleQuery();
})

});







const handleReturn = () => {
  maindialogVisible.value = false
};
const closeDetailDialog = () => {
  dialogVisible.value = false
}
const closeClaimCaseDetailDialog = () => {
  dialogVisibleDetail.value = false
}





</script>

<style scoped lang="scss">
.demo-form-inline {
  margin-bottom: 20px;
}

.tabsSty {
  margin-top: 10px;
}

.tableBtn {
  text-align: right;
  margin-bottom: 10px;
}
</style>

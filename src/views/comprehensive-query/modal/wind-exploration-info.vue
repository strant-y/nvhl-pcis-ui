<!-- 发起风勘-查询 -->
<template>
  <div>
    <el-dialog v-model="maindialogVisible" width="70%" title="风勘查询">
      <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
        <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef" />
    </el-dialog>
  </div>
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
const maindialogVisible = ref(true)
const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          // loadData()

          windSave();
        },
      }),
    //   createFreeButtonBase({
    //     type: "info",
    //     label: "返回",

    //     func: async () => {
    //       handleReturn()
    //     },
    //   }),
    ],
 
    fromSchema: [
            {
                prop: "DistSummary.cPlanNo",
                inputtype: "rtinput",
                title: "风勘号",
            },
            {
                prop: "DistSummary.nInsuredHeadcount",
                inputtype: "rtinput",
                title: "投保人",
            },

            {
                prop: "DistSummary.nAnnualSalary",
                inputtype: "rtinput",
                title: "被保人",
                // rules:[getRules("required", {})]
                // rules: [getRules("idCard", {})],
            },
        ],
  })
);

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    isPage: false,
    showSelection: false,
    tableBtnType: "btn",
    tableBtnWidth: 110,
    tableBtnPosition: "right",
    tableBtnTitle: '详情',
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "查看报告",
        type: "success",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          viewDetails(row)
        },
      }),
    ],
    fromSchema: [
      {
        prop: "year",
        inputtype: 'rtinput',
        title: "序号",
      },
      {
        prop: "nPrm",
        inputtype: 'rtinput',
        title: "风勘时间",
      },
      {
        prop: "claimAmount",
        inputtype: 'rtinput',
        title: "环节",
      },
       
    ],
  })
);




onMounted(() => {

console.log(opertaor.getDataAll())
let DataAll = opertaor.getDataAll()['applicant']
nextTick(() => {


  // handleQuery();
})

});

// 请求接口
const windSave = () => {
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
 
  let params = { ...s }
  console.log('params', params)
  pcisQueryService.sendTaskCreat(params).then((res: any) => {
  //   console.log('数据---‘',res)
  //   if (res.code === 200) {
  //     if(res.data !==null){
         
  //     }else{
  //         ElMessage.success(res.msg )
  //     }
  //   } else {
  //     ElMessage.error({ message: res.msg, duration: 3000 });
  //   }
  });

}




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

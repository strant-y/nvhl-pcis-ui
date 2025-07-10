<!-- 发起风勘-编辑 -->
<template>
  <div>
    <el-dialog v-model="maindialogVisible" width="80%" title="人工发起风勘">
      <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
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
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "发起",
        func: async () => {
          // loadData()

          windSave();
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
                prop: "tSurveyStart",
                inputtype: "rtdatepicker",
                title: "开始时间",
                format: "YYYY-MM-DD HH:mm:ss",
                rules:[getRules("required", {})],
                type: "datetime",
                 itemWidth:1.5
            },
            {
                prop: "tSurveyEnd",
                inputtype: "rtdatepicker",
                title: "结束时间",
                format: "YYYY-MM-DD HH:mm:ss",
                type: "datetime",
                rules:[getRules("required", {})],
                  itemWidth:1.5
            },

            {
                prop: "cRespondent",
                inputtype: "rtinput",
                 itemWidth:1.5,
                title: "联系人",
            },
            {
                prop: "cRespondentPon",
                inputtype: "rtinput",
                title: "联系电话",
                 itemWidth:1.5,
                rules: [getRules("phoneNo", {})], 
            },
             {
                prop: "cNotes",
                inputtype: "rtinput",
                title: "备注",
                 type: "textarea",
                 rows: 4,
                itemWidth: 3, 
                // itemWidth:2
            }
        ],
  })
);

// cInquiryNumber	String	255	Y		询价单号	
// tSurveyStart	Date	255	Y		发起时间	
// tSurveyEnd	Date	255	Y		结束时间	
// cRespondent	String	255	N		联系人	
// cRespondentPon	String	255	N		联系人电话	
// cNotes


onMounted(() => {


let DataAll = opertaor.getDataAll()['applicant']
nextTick(() => {


  // handleQuery();
})

});

// 请求接口
const windSave = () => {

  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const cinquiry = opertaor.getDataAll()['plyBase'];
  console.log(cinquiry['Base.cInquiryNo'], opertaor.getDataAll())
// :   Base.cInquiryNo cinquiry['Base.cInquiryNo']
// "121012504000000009"
  let params = {  
    cInquiryNumber: cinquiry['Base.cInquiryNo'],
    ...s }
    console.log('params', params)
  pcisQueryService.sendTaskCreat(params).then((res: any) => {
    console.log('数据---‘',res)
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

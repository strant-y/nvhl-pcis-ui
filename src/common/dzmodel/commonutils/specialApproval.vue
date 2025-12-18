<template>
  <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />

  <app-table
    :tableConfig="tableconfig"
    v-model:pageresult="pageresult"
    ref="distTableRef" >
  </app-table>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";

const { getRules } = useValidator();
import { ref, defineProps } from "vue";
const emits = defineEmits(["handleClose"]);

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
});
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
import { yesOrNo, size, inputtype, freeCol, typeMap } from "@/utils/utilKey";
import { createFreeButtonBase } from "@/shared/button-config";
import { platUploadFile,getplatData,specialApply,specialSearchResult } from "@/api/plat";

const pageresult = reactive<Pageresult>({
  result: "",
  list: [],
  total: 0,
});
const platRespList = ref<any[]>([]);
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    title: "特批历史申请结果查询",
    titleBtnPosition: "right",
    titleBtns: [
      createFreeButtonBase({
        id: "add-edrItem",
        icon:"Search",
        link:true,
        type: "success",
        func: function () {
          queryData();
        }
      }),
    ],
    fromSchema: [
      {
        prop: "approvalComment",
        title: "审核意见",
        inputtype: "rtselect",
        loadData: [
          { value: "01", label: "审核通过" },
          { value: "02", label: "审核不通过" },
        ],
      },
      {
        prop: "approvalStatus",
        title: "审核状态",
        inputtype: "rtselect",
        loadData: [
          { value: "01", label: "待审核" },
          { value: "02", label: "审核通过" },
          { value: "03", label: "审核不通过" },
        ],
      },
      {
        prop: "specialApprovalCode",
        title: "特批码",
        inputtype: "rtinput",
      },
      {
        prop: "approvalDes",
        title: "审核意见描述",
        inputtype: "rtinput",
        type: "textarea",
      },
    ],
  })
);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "center",
    fromUi:{
        cols: 2
    },
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "特批申请",
        func: () => {
          freeEditRef.value?.validate().then((r) => { 
            if(r){
              const params = freeEditRef.value?.getFromValue();
              if(params.nprm === 0 ){
                ElMessage.error("0金额保单,不能发起特批申请!");
                return ;
              }
              specialApply(params).then((res) => { 
                const {resultCode ,resultMsg} = res;
                if(resultCode === "00"){
                  ElMessage.success("特批申请成功!");
                }else{
                  ElMessage.error(resultMsg);
                }
              });
            }
            
          });
            
        },
      }),
      createFreeButtonBase({
        type: "success",
        label: "特批结果查询",
        func: () => {
          const params = freeEditRef.value?.getFromValue();
            specialSearchResult(params).then((res) => { 
              const {resultCode ,resultMsg} = res;
              if(resultCode === "00"){
                queryData();
              }else if(resultCode === "210"){ //审批中,仅做提醒
                queryData();
                ElMessage.info(resultMsg);
              }else{
                ElMessage.error(resultMsg);
              }
            });
        },
      }),
      createFreeButtonBase({
        type: "info",
        label: "返回",
        func: () => {
          emits("handleClose");
        },
      }),
    ],
    fromSchema: [
        {
        prop: "cspecialApprovalCode",
        inputtype: "rtinput",
        title: "特批码",
        disabled: true,
        func:(value)=>{
          console.log(value);
        }
      },
      {
        prop: "cappNo",
        inputtype: "rtinput",
        title: "申请单号",
        rules: [getRules("required", {})],
        disabled: true,
      },
      {
        prop: "cappNme",
        inputtype: "rtinput",
        rules: [getRules("required", {})],
        title: "投保人名称",
        disabled: true,
      },
      {
        prop: "ccertfCde",
        inputtype: "rtinput",
        rules: [getRules("required", {})],
        title: "投保人证件号码",
        disabled: true,
      },
      {
        prop: "namt",
        inputtype: "rtnumber",
        rules: [getRules("required", {})],
        title: "总保险金额",
        disabled: true,
      },
      {
        prop: "nprm",
        inputtype: "rtnumber",
        rules: [getRules("required", {})],
        title: "总含税保费",
        disabled: true,
      },
      {
        prop: "specialBizType",
        inputtype: "rtselect",
        rules: [getRules("required", {})],
        title: "特批业务类型",
        loadData: [
          {
            label: "共方代收保费业务",
            value: "07",
          },
          {
            label: "其他需要事前报备的特殊业务",
            value: "99",
          },
        ],
      },
      {
        prop: "upload_but",
        inputtype: "rtUpload",
        title: "特批文件",
        itemWidth: 2,
        btnWidth: 60,
        beforeUpload: (file: any) => { 
          const appNo = freeEditRef.value?.getValue("cappNo");
          if(!appNo){
            ElMessage.error("投保单号不能为空,请先保存后,再进行特批申请!");
            return false;
          }
        },
        uploadfunc: (file: any) => {
          const appNo = freeEditRef.value?.getValue("cappNo");
          const formData = new FormData();
          formData.append("file", file);
          formData.append("appNo", appNo);
          platUploadFile(formData).then((res) => { 
          }); 
        },
      },
      {
        prop: "cspecialMsg",
        inputtype: "rtinput",
        type: "textarea",
        itemWidth:2,
        rows:5,
        title: "特批说明",
      },
    ],
  })
);

onMounted(async () => {
  queryData();
});

const checkList = {
  cappNme:'投保人名称',
  ccertfCde:'投保人证件号码',
  namt:'总保险金额',
  nprm:'总含税保费'
};
function queryData() { 
  getplatData({cAppNo: props.data.appNo}).then((res) => { 
    platRespList.value = res.data.platRespList;
    delete res.data.platRespList; // 将结果独立出来,不送入form表单
    pageresult.list = platRespList.value;
    freeEditRef.value?.setFormValue(res.data);
    let showmsg = "";
    if(props.data.type === 'mypage'){
      Object.keys(checkList).forEach(che => { 
        console.log(res);
        if(res.data[che] !== props.data.datacheck[che]){
          showmsg += checkList[che] + ",";
        }
      })
      // checkList.forEach(res => {
      //   if(res.data[res] !== props.data.datacheck[res]){
      //     showmsg += 
      //   }
      // })
      if(showmsg){
        ElMessage.warning(showmsg+"与页面数据不一致,请及时保存数据!");
      }
    }
  });
}

</script>

<style scoped></style>

<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="insuredEditRef" />
  <comDialog ref="dialog"></comDialog>
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const dialog = ref<DialogMethod | null>(null);
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
const opertaor = dataOpertaor();
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const insuredEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive(createAppFreeEditConfig({}));

onMounted(() => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
});

// 绑定方法
const method = {
  // func demo
  func1: () => {},
  funccopyvalue:()=>{
      const tabref = opertaor.getTableRefs();
      const applicantValue=tabref['webPlyApplicant'].getFromValue()
      const insuredValue={}
      for(const k in applicantValue){
          const key='Insured.'+k.split('.')[1]
          if(k.split('.')[1]=='cAppNme'){
              insuredValue['Insured.cInsuredNme']=applicantValue['Applicant.cAppNme']
          }else{
              insuredValue[key]=applicantValue[k];
          }
      }
      setFormValue(insuredValue)
  },
  funcquery: () => {
      const param = opertaor.getParam();
      console.log(param)
      console.log(dialog.value)
      dialog.value?.open(
          "querycustomerView",
          {
              type: "show",
              data: {
                  cProdNo: param.cProdNo,
              },
          },
          {
              isOk: (selectdata: any) => {
                  console.log('a',selectdata)
              },
          },
          { title: "选择客户信息", width: 85 }
      );
  },
  funcconfirm: ()=>{
      insuredEditRef.value?.validate().then((isValid) => {
          console.log(isValid)
          if (isValid) {
              // handleQuery();
              ElMessage.success("客户信息已经存在");
          } else {
              ElMessage.error("请填写必填项");
          }
      });
  },
    funcreset: ()=>{
        const tabref = opertaor.getTableRefs();
        const InsuredValue=tabref['webPlyInsured'].getFromValue()
        for (const k in InsuredValue){
            InsuredValue[k]=null
        }
    }
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return insuredEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  insuredEditRef?.value?.setFormValue(value);
}

function validate() {
  return insuredEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  insuredEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return insuredEditRef?.value?.getValue(key);
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>

<style scoped></style>

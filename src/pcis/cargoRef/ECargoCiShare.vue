<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="tgtobjEditRef" />
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { useProductStore } from "@/store/modules/prod";

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});
// ECargoBase.nCiJntAmt  //共保总保额
// ECargoBase.nCiJntPrm  共保总保费
// ECargoBase.nJiJntAmt  联保总保额
// ECargoBase.nJiJntPrm  联保总保费
const tgtobjEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));

const idxParam = inject('idxParam');
const formPage = idxParam?.formPage;
const param = idxParam?.param;

onMounted(() => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
  watchEffect(() => {
    const cCiMrk = formPage.getFormDataById('AgreementBase')['ECargoECargoBase.cCiMrk'];
    if(cCiMrk === "1"){
      setValue("ECargoBase.cCiInpTyp", '600001');
    }else if(cCiMrk === "2"){
      setValue("ECargoBase.cCiInpTyp", '600004');
    }else if(cCiMrk === "3"){
      setValue("ECargoBase.cCiInpTyp", '600001');
    }else if(cCiMrk === "4"){
      setValue("ECargoBase.cCiInpTyp", '600004');
    }else if(cCiMrk === "5"){
      setValue("ECargoBase.cCiInpTyp", '600005');
    }
  })
});

// 绑定方法
const method = {
  // func demo
  func1: () => {},
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return tgtobjEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  tgtobjEditRef?.value?.setFormValue(value);
}

function validate() {
  return tgtobjEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  tgtobjEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return tgtobjEditRef?.value?.getValue(key);
}
function getFormconfig(){
  return formconfig1;
}


defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig,
});
</script>

<style scoped></style>

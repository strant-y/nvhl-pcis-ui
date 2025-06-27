<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="baseEditRef" />
  <comDialog ref="dialog"></comDialog>
  <input
      type="file"
      ref="fileInputRef"
      style="display: none"
      @change="handleFileChange"
  />
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { codeListViewStore } from "@/store";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const dialog = ref<DialogMethod | null>(null);
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const baseEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive(createAppFreeEditConfig({}));
import { useRoute } from "vue-router";
const route = useRoute();
const fileInputRef = ref(null);
const codeListStore = codeListViewStore();
const idxParam = inject('idxParam');
const formPage = idxParam?.formPage;
const param = idxParam?.param;

onMounted(() => {
  const formconfig11 = formInit(
      JSON.stringify(props.pageSchema),
      method,
      getRules
  );
  Object.assign(formconfig1, formconfig11);
});

// 绑定方法
const method = {
  // func demo
  funcquery: () => {},

  cCiMrkChange: (val: string) => {
    idxParam.ciJiMrk = val;
    const ciAgreementECargo = formPage.getComponentRefById('AgreementCiTcp');
    if(ciAgreementECargo) {
      ciAgreementECargo.cCiMrkChangeFun({cCiMrk: val})
    }
    const cargoCiRef = formPage.getComponentRefById('AgreementCi');
    if (!!cargoCiRef) {
      cargoCiRef.initCiInfo({
        cCiMrk: val
      });
    }
  }
};


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
        } else {
          Object.assign(item, obj);
        }
      }
    });
  }
}


function getFormValue() {
  return baseEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  baseEditRef?.value?.setFormValue(value);
}

function validate() {
  return baseEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  baseEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return baseEditRef?.value?.getValue(key);
}

function getFormConfig(){
  return formconfig1;
}

function getFormBtn() {
  return baseEditRef?.value?.getFormBtn();
}
function setDisabledAll(isDisabled: boolean) {
  baseEditRef?.value?.setDisabledAll(isDisabled);
  const formBtn = getFormBtn();
  if(formBtn && Object.keys(formBtn).length > 0) {
    Object.keys(formBtn).forEach((key: any) => {formBtn[key].hidden = isDisabled;})
  }
}

defineExpose({
  getFormValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormBtn,
  getFormConfig,
  setDisabledAll
});
</script>

<style scoped></style>

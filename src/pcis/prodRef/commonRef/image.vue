<template>
    <app-free-edit :freeEditConfig="formconfig1" ref="imageEditRef" />
  </template>
  
  <script setup lang="ts">
  import {
    AppFreeEditMethod,
    createAppFreeEditConfig,
  } from "@/shared/app-free-edit-config";
  import { formInit } from "@/shared/from-init";
  import { dataOpertaor } from "@/store/modules/data-opertaor";
  const opertaor = dataOpertaor();
  
  const props = defineProps({
    pageSchema: {
      type: [Object],
      required: true,
    },
  });
  
  const imageEditRef = ref<AppFreeEditMethod | null>(null);
  
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
  
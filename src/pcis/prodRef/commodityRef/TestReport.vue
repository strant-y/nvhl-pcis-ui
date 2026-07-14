<!-- 商品配置-》测试报告 -->
<template>
  <div class="componenFrom">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    </div>
  </template>
  
  <script setup lang="ts">
  import { title } from 'process';
  import { defineComponent, ref, reactive, onMounted } from 'vue';
  
  
  import {
    AppFreeEditConfig,
    AppFreeEditMethod,
    createAppFreeEditConfig,
  } from "@/shared/app-free-edit-config";
  import { useValidator } from "@/typings/useValidator";
  const { getRules } = useValidator();
  
  const someProp = defineProps({
    someProp: {
      type: String,
      required: false
    },
  })
 
  const freeEditRef = ref<AppFreeEditMethod | null>(null);
  const formconfig1 = reactive<AppFreeEditConfig>(
    createAppFreeEditConfig({
      endBtnsPosition: "right",
      title: "测试报告",
      fromUi: {
        cols: 1
      },
      fromSchema: [
       
        {
          prop: "cTestReport",
          inputtype: "rtinput",
          type: "textarea",
          rows: 4,
          title: "说明",
          clearable: true,
        },
      ],
    })
  );
  
  onMounted(() => {
  
  });
  function getFromValue() {
    return freeEditRef?.value?.getFromValue();
  }
  
  function setFormValue(value: any) {
    freeEditRef?.value?.setFormValue(value);
  }
  
  function validate() {
    return freeEditRef?.value?.validate();
  }
  
  function setValue(key: string, value: any) {
    freeEditRef?.value?.setValue(key, value);
  }
  
  function getValue(key: string) {
    return freeEditRef?.value?.getValue(key);
  }
  function setDisabledAll(key: string) {
    return  freeEditRef.value?.setDisabledAll();
  }
  defineExpose({
    getFromValue,
    setFormValue,
    validate,
    setValue,
    getValue,
    setDisabledAll
  });
  </script>
  
  <style scoped lang="scss"></style>
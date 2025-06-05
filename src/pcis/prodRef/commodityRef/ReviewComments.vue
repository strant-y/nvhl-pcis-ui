<!-- 商品配置-》审核信息 -->
<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
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
const reviewOptions = ref([
  { value: '2', label: '发测试' },
  { value: '3', label: '发测试(信息补充)' },
  { value: '0', label: '驳回' }
]) //责任
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    title: "审核信息",
    fromUi: {
      cols: 1
    },
    fromSchema: [
      {
        prop: "cUndrStatus",
        inputtype: "rtselect",
        title: "审核意见",
        // typeCode: "BAS_COMM_CODE_OUT_CDE",
        // codeParam: { cParCde: "commodity_status" },
        clearable: true,
        rules: [getRules("required", {})],
        loadData: reviewOptions,
        func: (row: any) => {
          if (row) {
            for (const item of reviewOptions.value) {
              if (item['value'] === row) {
                setValue('cUndrDesc', item['label'])
                break;
              }
            }
          }
        }
      },
      {
        prop: "cUndrDesc",
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



function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          for (let key in obj.btnItems) {
            item.btnItems[key] = obj.btnItems[key];
          }
        }else{
          Object.assign(item, obj);
        }
      }
    });
  }
}

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
  setFormItem,
  setDisabledAll
});
</script>

<style scoped lang="scss"></style>
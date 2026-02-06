<template>
  <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { useValidator } from "@/typings/useValidator";
import {idxParamKey, useIdxParam} from "@/views/pcis/support/useIdxParam";
const { getRules } = useValidator();
const freeEditRef = ref<AppFreeEditMethod | null>(null);

const idxParam = inject(idxParamKey, useIdxParam());
const formPage = idxParam?.formPage;
const param = idxParam?.param;
const user = idxParam?.user;

onMounted(() => {

});

const formconfig1 = reactive<AppFreeEditConfig>(
    createAppFreeEditConfig({
      title: "审核信息",
      endBtnsPosition: "right",
      fromSchema: [
        {
          prop: "cChkOpinion",
          inputtype: "rtselect",
          title: "审核意见",
          loadData: [
            {label: '同意'},
            {label: '退回'},
          ],
          rules: [getRules("required", {})],
          itemWidth: 1,
          valueSpan: 10,
          clearable: true,
        },
        {},
        {
          prop: "cChkSuggest",
          inputtype: "rtinput",
          type: "textarea",
          title: "审核建议",
          rows: 4,
          itemWidth: 2,
        },
      ],
      fromUi: createFromUiConfig({
        cols: 2,
      }),

    })
);
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
        }else{
          Object.assign(item, obj);
        }
      }
    });
  }
}

function getFormValue() {
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
function getFormConfig(){
  return formconfig1;
}
function getFormBtn() {
  return freeEditRef?.value?.getFormBtn();
}
function setDisabledAll(isDisabled: boolean) {
  freeEditRef?.value?.setDisabledAll(isDisabled);
}
defineExpose({
  getFormValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormConfig,
  getFormBtn,
  setDisabledAll
});
</script>

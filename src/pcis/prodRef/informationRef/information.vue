<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="informationEditRef" />
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
  compKey: {
    type: String,
    required: false,
  },
});

const informationEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive(createAppFreeEditConfig({}));

onMounted(async () => {
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
  func1: () => {
    console.log(getRules);
  },
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return informationEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  informationEditRef?.value?.setFormValue(value);
}

function validate() {
  return informationEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  informationEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return informationEditRef?.value?.getValue(key);
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
  getFormconfig
});
</script>

<style scoped></style>

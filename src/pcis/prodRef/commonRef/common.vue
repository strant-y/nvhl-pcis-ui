<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="commonEditRef" />
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const commonEditRef = ref<AppFreeEditMethod | null>(null);

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
  return commonEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  commonEditRef?.value?.setFormValue(value);
}

function validate() {
  return commonEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  commonEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return commonEditRef?.value?.getValue(key);
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

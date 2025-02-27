<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="applicantEditRef" />
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

const applicantEditRef = ref<AppFreeEditMethod | null>(null);
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();

const formconfig1 = reactive(createAppFreeEditConfig({}));

onMounted(() => {
  console.log(props.pageSchema);
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
  functest: () => {
    console.log(11111 + "点击了");
    const tabref = opertaor.getTableRefs();
    console.log(tabref);
  },
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return applicantEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  applicantEditRef?.value?.setFormValue(value);
}

function validate() {
  return applicantEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  applicantEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return applicantEditRef?.value?.getValue(key);
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

<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="plyBaseEditRef" />
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

const plyBaseEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));

onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
  nextTick(() => {
      // DOM 更新后执行
      initializationPlyBase()
  });
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
function initializationPlyBase(){
    const baseobj={}
    baseobj['Base.cRenewMrk']='0'
    setFormValue(baseobj)
}

function getFromValue() {
  return plyBaseEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  plyBaseEditRef?.value?.setFormValue(value);
}

function validate() {
  return plyBaseEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  plyBaseEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return plyBaseEditRef?.value?.getValue(key);
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

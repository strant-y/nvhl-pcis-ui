<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="tgtobjEditRef" />
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
import { useProductStore } from "@/store/modules/prod";
const productStore = useProductStore();

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

// const nJiJntPrm = ref("0.00");   //联保总保费
// const nJiJntAmt = ref("0.00");   //联保总保额
// const nCiJntAmt = ref("0.00");   //共保总保额
// const nCiJntPrm = ref("0.00");   //共保总保费

// 响应式引用 store 中的值
const nJiJntPrm = ref(productStore.nPrm);  // 联保总保费
const nCiJntPrm = ref(productStore.nAmt);  // 共保总保费


// 监听 store 中的变化并更新本地变量
watchEffect(() => {
  nJiJntPrm.value = productStore.nPrm;
  nCiJntPrm.value = productStore.nAmt;
});

const tgtobjEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));

onMounted(() => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
  nextTick(() => {
  });
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
  getFormconfig
});
</script>

<style scoped></style>

<template>
  <app-grid-edit :gridEditConfig="formconfig1" ref="distEditRef" />
</template>

<script setup lang="ts">
import {
  AppGridEditMethod,
  createAppGridEditConfig,
} from "@/shared/app-grid-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const distEditRef = ref<AppGridEditMethod | null>(null);
const formconfig1 = reactive(createAppGridEditConfig({}));

onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
  // addFakeData();
});

// 绑定方法
const method = {
  // func demo
  func1: () => {},
  funcadd: () => {
    addFakeData();
  },
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return distEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  distEditRef?.value?.setFormValue(value);
}

function validate() {
  return distEditRef?.value?.validate();
}

function getTableValue(rowId: number, key: string) {
  distEditRef?.value?.getTableValue(rowId, key);
}
function addFakeData() {
  if (distEditRef.value) {
    const fakeData = {
      // 假数据示例
      NSeqNo: "示例数据1",
      CCoinsurerCde: "示例数据2",
      cCiSubComp: "示例数据3",
    };
    distEditRef.value.addRowByData(fakeData); // 设置新行的数据
  }
}
onMounted(() => {});
defineExpose({
  getFromValue,
  setFormValue,
  validate,
  getTableValue,
});
</script>

<style scoped></style>

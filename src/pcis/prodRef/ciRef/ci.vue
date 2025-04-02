<template>
  <app-grid-edit :gridEditConfig="formconfig1" ref="cvrgEditRef" />
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

const cvrgEditRef = ref<AppGridEditMethod | null>(null);
const formconfig1 = reactive(createAppGridEditConfig({}));

onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
  addFakeData();
});

// 绑定方法
const method = {
  // func demo
  func1: () => {},
  funcadd: () => {
    cvrgEditRef?.value?.addRow();
  },
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return cvrgEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  cvrgEditRef?.value?.setFormValue(value);
}

function validate() {
  return cvrgEditRef?.value?.validate();
}

function getTableValue(rowId: number, key: string) {
  cvrgEditRef?.value?.getTableValue(rowId, key);
}
function addFakeData() {
  if (cvrgEditRef.value) {
    cvrgEditRef.value.addRow(); // 添加新行
    const rowId = cvrgEditRef.value.getRowCount() - 1; // 获取最后一行的ID
    const fakeData = {
      // 假数据示例
      NSeqNo: "示例数据1",
      CCoinsurerCde: "示例数据2",
      cCiSubComp: "示例数据3",
    };
    cvrgEditRef.value.setRowData(rowId, fakeData); // 设置新行的数据
  }
}

function setDisabledAll() {
  formconfig1.dragFlag = false;
}
onMounted(() => {});
defineExpose({
  getFromValue,
  setFormValue,
  validate,
  getTableValue,
  setDisabledAll,
});
</script>

<style scoped></style>

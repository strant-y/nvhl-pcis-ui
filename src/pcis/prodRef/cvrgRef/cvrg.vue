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
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);

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

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  getTableValue,
});
</script>

<style scoped></style>

<template>
  <app-grid-edit :gridEditConfig="formconfig1" ref="acctinfoEditRef" />
</template>

<script setup lang="ts">
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
import {
  AppGridEditMethod,
  createAppGridEditConfig,
} from "@/shared/app-grid-edit-config";

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

const acctinfoEditRef = ref<AppGridEditMethod | null>(null);
const formconfig1 = reactive(createAppGridEditConfig({}));

onMounted(() => {
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
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return acctinfoEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  acctinfoEditRef?.value?.setFormValue(value);
}

function validate() {
  return acctinfoEditRef?.value?.validate();
}

function getTableValue(rowId: number, key: string) {
  acctinfoEditRef?.value?.getTableValue(rowId, key);
}
function getFormconfig(){
  return formconfig1;
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  getTableValue,
  formconfig1
});
</script>

<style scoped></style>

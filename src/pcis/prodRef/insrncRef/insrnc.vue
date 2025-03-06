<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="insrncEditRef" />
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import moment from "moment";
import dayjs from "dayjs";
const opertaor = dataOpertaor();
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const insrncEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive(createAppFreeEditConfig({}));
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
  bgnTmFn:(v)=>{
      const tabref = opertaor.getTableRefs();
      const baseBefore=tabref['webPlyBase1'].getFromValue()
      const tm=moment(baseBefore['Base.tInsrncEndTm']).diff(moment(v), 'days')
      baseBefore['Base.cTmSysCde']=tm
      setFormValue(baseBefore)
  },
  endTmFn:(v)=>{
      const tabref = opertaor.getTableRefs();
      const baseBefore=tabref['webPlyBase1'].getFromValue()
      const tm=moment(v).diff(moment(baseBefore['Base.tInsrncBgnTm']), 'days')
      baseBefore['Base.cTmSysCde']=tm
      setFormValue(baseBefore)
  },
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return insrncEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  insrncEditRef?.value?.setFormValue(value);
}

function validate() {
  return insrncEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  insrncEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return insrncEditRef?.value?.getValue(key);
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

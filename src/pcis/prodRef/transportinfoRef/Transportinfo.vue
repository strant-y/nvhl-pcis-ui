<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="transportEditRef" />
</template>

<script setup lang="ts">
import {AppFreeEditMethod, createAppFreeEditConfig,} from "@/shared/app-free-edit-config";
import {formInit} from "@/shared/from-init";
import {dataOpertaor} from "@/store/modules/data-opertaor";
import {useProductStore} from "@/store/modules/prod";
import {useValidator} from "@/typings/useValidator";

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const { getRules } = useValidator();
const productStore = useProductStore();
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

const transportEditRef = ref<AppFreeEditMethod | null>(null);

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

};
// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return transportEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  transportEditRef?.value?.setFormValue(value);
}

function validate() {
  return transportEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  transportEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return transportEditRef?.value?.getValue(key);
}
const setFormItem = (key, obj) => {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.loadData && obj.loadData) {
          let newBtnItems = null;
          if (obj.loadData.length != 0) {
            for (let key in obj.loadData) {
              item.loadData[key] = obj.loadData[key];
            }
          } else {
            item.loadData = obj.loadData;
          }
          newBtnItems = item.loadData;
          newBtnItems && (obj.loadData = newBtnItems);
        }
        Object.assign(item, obj);
      }
    });
  }
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

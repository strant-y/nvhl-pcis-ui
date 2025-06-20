<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="tgtobjEditRef" />
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

const idxParam = inject('idxParam');
const formPage = idxParam?.formPage;
const param = idxParam?.param;

// 监听 cCiMrk 的变化并更新本地变量

const tgtobjEditRef = ref<AppFreeEditMethod | null>(null);

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







const cCiMrkChangeFun = (data: any) => {
  const { cCiMrk  } = data;
  // formconfig1.value?.fromSchema?.forEach((item) => {
  //   item.hidden = false;
  // });
  if (cCiMrk === "3" || cCiMrk === "4") {
    formconfig1.fromSchema?.forEach((item) => {
      const prop = item.prop;
      if (
          prop === "ECargoBase.cCiAgtNo" ||
          prop === "ECargoBase.nCiJntAmt" ||
          prop === "ECargoBase.nCiJntPrm"
      ) {
        item.hidden = false; // 显示共保字段
      } else {
        item.hidden = true; // 隐藏其他字段
      }
    });
  } else if (cCiMrk === "5") {
    formconfig1.fromSchema?.forEach((item) => {
      const prop = item.prop;
      if (
          prop === "ECargoBase.cJiAgtNo" ||
          prop === "ECargoBase.nJiJntAmt" ||
          prop === "ECargoBase.nJiJntPrm"
      ) {
        item.hidden = false; // 显示联保字段
      } else {
        item.hidden = true; // 隐藏其他字段
      }
    });
  }
}




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
  getFormconfig,
  cCiMrkChangeFun
});
</script>

<style scoped></style>

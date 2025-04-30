<template>
  <app-grid-edit :gridEditConfig="formconfig1" ref="payinfoEditRef" />
</template>

<script setup lang="ts">
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
import {
  AppGridEditMethod,
  createAppGridEditConfig,
} from "@/shared/app-grid-edit-config";

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const payinfoEditRef = ref<AppGridEditMethod | null>(null);
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
  funcpayadd: () => {
      payinfoEditRef?.value?.addRow();
      const val=getFromValue()
      val.items.forEach((key,index) => { 
          key['Pay.nTms']=index+1
      });
  },
  funcpaydel: () => {
      const selData=payinfoEditRef?.value?.getSelectRow()
      if (!selData) {
          ElMessage.error("请选择要删除的数据!");
          return;
      }
      const editIndex=selData['_dataId']
      payinfoEditRef?.value?.delRow(editIndex);
      const val=getFromValue()
      val.items.forEach((key,index) => {
          key['Pay.nTms']=index+1
      });
  },
     //缴费止期控制
  // tPayEndTmDisabled: (date: any) => {
  //   return  date.getTime() <new Date( opertaor.getTableRefs()["insrnc"].getValue("Base.tInsrncEndTm").replace(/-/g, '/')).getTime()
  // },
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return payinfoEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  payinfoEditRef?.value?.setFormValue(value);
}

function validate() {
  return payinfoEditRef?.value?.validate();
}

function getTableValue(rowId: number, key: string) {
  payinfoEditRef?.value?.getTableValue(rowId, key);
}

function getFormconfig(){
  return formconfig1;
}
//给表单赋值
function setFormItem(key, obj) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        Object.assign(item, obj);
      }
    });
  }
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  getTableValue,
  getFormconfig,
  setFormItem
});
</script>

<style scoped></style>

<template>
  <app-grid-edit :gridEditConfig="formconfig1" ref="ciEditRef" />
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

const ciEditRef = ref<AppGridEditMethod | null>(null);
const formconfig1 = reactive(createAppGridEditConfig({}));

onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
  ciAdd();
});

// 绑定方法
const method = {
  // func demo
  func1: () => {},
  ciAdd: () => {
    ciEditRef?.value?.addRow();
    const val=getFromValue()
    console.log(val,'val')
    val.forEach((key,index) => { 
        key['Ci.nTms']=index+1
    });
  },
  ciDelete:()=>{
    const selData=ciEditRef?.value?.getSelectRow()
      if (!selData) {
          ElMessage.error("请选择要删除的数据!");
          return;
      }
      const editIndex=selData['_dataId']
      ciEditRef?.value?.delRow(editIndex);
      const val=getFromValue()
      val.forEach((key,index) => {
          key['Ci.nTms']=index+1
      });
  }
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return ciEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  ciEditRef?.value?.setFormValue(value);
}

function validate() {
  return ciEditRef?.value?.validate();
}

function getTableValue(rowId: number, key: string) {
  ciEditRef?.value?.getTableValue(rowId, key);
}
function ciAdd() {
  if (ciEditRef.value) {
    ciEditRef.value.addRow(); // 添加新行
    // const rowId = ciEditRef.value.getRowCount() - 1; // 获取最后一行的ID
    // const fakeData = {
    //   // 假数据示例
    //   NSeqNo: "示例数据1",
    //   CCoinsurerCde: "示例数据2",
    //   cCiSubComp: "示例数据3",
    // };
    // ciEditRef.value.setRowData(rowId, fakeData); // 设置新行的数据
  }
}

function getFormconfig(){
  return formconfig1;
}
defineExpose({
  getFromValue,
  setFormValue,
  validate,
  getTableValue,
  getFormconfig,
});
</script>

<style scoped></style>

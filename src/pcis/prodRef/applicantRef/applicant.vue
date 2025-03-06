<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="applicantEditRef" />
  <comDialog ref="dialog"></comDialog>
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
const dialog = ref<DialogMethod | null>(null);
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const applicantEditRef = ref<AppFreeEditMethod | null>(null);
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();

const formconfig1 = reactive(createAppFreeEditConfig({}));
const formData = ref<any[]>([]);
onMounted(() => {
  console.log(props.pageSchema);
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
  funcquery: () => {
    console.log(11111 + "点击了");
    // const tabref = opertaor.getTableRefs();
    // console.log(tabref);
      const param = opertaor.getParam();
      console.log(param)
      console.log(dialog.value)
      dialog.value?.open(
          "querycustomerView",
          {
              type: "show",
              data: {
                  cProdNo: param.cProdNo,
              },
          },
          {
              isOk: (selectdata: any) => {
                  console.log('a',selectdata)
              },
          },
          { title: "选择客户信息", width: 85 }
      );
  },
  funcconfirm: ()=>{
      applicantEditRef.value?.validate().then((isValid) => {
          console.log(isValid)
          if (isValid) {
              // handleQuery();
              ElMessage.success("客户信息已经存在");
          } else {
              ElMessage.error("请填写必填项");
          }
      });
  },
  funcreset: ()=>{
      const tabref = opertaor.getTableRefs();
      const applicantValue=tabref['applicant'].getFromValue()
      console.log(applicantValue)
      for (const k in applicantValue){
          applicantValue[k]=null
      }
  }
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return applicantEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  applicantEditRef?.value?.setFormValue(value);
}

function validate() {
  return applicantEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  applicantEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return applicantEditRef?.value?.getValue(key);
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

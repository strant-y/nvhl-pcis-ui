<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="applicantEditRef" />
  <comDialog ref="dialog"></comDialog>
  <input
      type="file"
      ref="fileInputRef"
      style="display: none"
      @change="handleFileChange"
  />
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { codeListViewStore } from "@/store";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { qryCustomer } from "@/api/query";

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const codeListStore = codeListViewStore();
const dialog = ref<DialogMethod | null>(null);

const idxParam = inject('idxParam');
const formPage = idxParam?.formPage;
const param = idxParam?.param;

const applicantEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive(createAppFreeEditConfig({}));
const formData = ref<any[]>([]);
const cClntAddr = ref<any>(null);
const fileInputRef = ref(null);
const fileInputType = ref();
import { readFile } from "@/api/file";
const tCertfDate = ref<any[]>([]);
onMounted(() => {
  const formconfig11 = formInit(
      JSON.stringify(props.pageSchema),
      method,
      getRules
  );
  console.log(3838, formconfig11);
  Object.assign(formconfig1, formconfig11);
  nextTick(() => {
    //是否小微企业，默认非必填、只读
    setFormItem("Applicant.cIsMicroEntpris", {
      rules: null,
      disabled: true,
    });
  });
});

//  根据 客户名称 / 被保人性质/ 证件类型 / 证件号码 获取客户信息
const checkUser = () => {
  if (param.cRecordType !== 1) {
    return false;
  }
  const applicantValue = formPage.getFormDataById('applicant')
//  只要4个有值 去请求客户信息
  if (
      applicantValue["Applicant.cAppNme"]&&
      applicantValue["Applicant.cClntMrk"] !== null &&
      applicantValue["Applicant.cCertfCde"] &&
      applicantValue["Applicant.cCertfCls"]
  ) {
    const param = {
      coustName: applicantValue["Applicant.cAppNme"],
      coustMrk: applicantValue["Applicant.cClntMrk"],
      coustType:applicantValue["Applicant.cCertfCls"],
      coustCode: applicantValue["Applicant.cCertfCde"],
      personnelType:"Applicant"
    }
    qryCustomer(param)
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
            if(data){
              formPage.setFormDataById('applicant', data[0])
            }
          } else {
            // ElMessage.error(msg);
          }
        })
        .finally(() => {});
  }
};

function handleFileChange() {

}

// 绑定方法
const method = {
  // func demo

}

//给表单下拉项赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          for (let key in obj.btnItems) {
            item.btnItems[key] = obj.btnItems[key];
          }
        } else {
          Object.assign(item, obj);
        }
      }
    });
  }
}

function getFormValue() {
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

function getFormConfig(){
  return formconfig1;
}
function getFormBtn() {
  return applicantEditRef?.value?.getFormBtn();
}
function setDisabledAll(isDisabled: boolean) {
  applicantEditRef?.value?.setDisabledAll(isDisabled);
}
defineExpose({
  getFormValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormConfig,
  getFormBtn,
  setDisabledAll
});
</script>

<style scoped></style>

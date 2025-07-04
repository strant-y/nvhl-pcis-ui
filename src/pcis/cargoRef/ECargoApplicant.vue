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
const codeListStore = codeListViewStore();
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { useProductStore } from "@/store/modules/prod";
const dialog = ref<DialogMethod | null>(null);
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const applicantEditRef = ref<AppFreeEditMethod | null>(null);
import { getAddressStr,qryCustomer } from "@/api/query";
const formconfig1 = reactive(createAppFreeEditConfig({}));
const formData = ref<any[]>([]);
const cClntAddr = ref<any>(null);
import { useRoute } from "vue-router";
const route = useRoute();
const fileInputRef = ref(null);
const fileInputType = ref();
import { readFile } from "@/api/file";
const tCertfDate = ref<any[]>([]);
const idxParam = inject('idxParam');
const formPage = idxParam?.formPage;

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
    // 处理邮编
    setFormItem("Applicant.cZipCde", {
      rules: [
        getRules("signlessInt", {}),
        getRules("specifyLength", { len: 6 }),
      ],
    });
    //移动手机校验
    setFormItem("Applicant.cMobile", { rules: [getRules("phoneNo", {})] });
    // 传真校验
    setFormItem("Applicant.cFax", { rules: [getRules("faxNumber", {})] });

    setFormItem("Applicant.cGreenIndustryCustomers",{disabled: true});
    setFormItem("Applicant.cGreenIndustryList",{disabled: true});

  });
});
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


// 绑定方法
const method = {
  // func demo
  funcquery: () => {},
  // 客户姓名
  funCheckUser:()=>{
  },
  funcconfirm: () => {
    applicantEditRef.value?.validate().then((isValid) => {
      if (isValid) {
        // handleQuery();
        ElMessage.success("客户信息已经存在");
      } else {
        ElMessage.error("请填写必填项");
      }
    });
  },
  funcreset: () => {
  },
  funcNdustryCate: () => {
    // const param = opertaor.getParam();
    dialog.value?.open(
      "ndustryCateModal",
      {
        type: "show",
        method: {
          getdbClickData: (data) => {
            setFormItem("ECargoApplicant.cTrdCde", {
              loadData: [{ label: data.cnm, value: data.cde }],
            });
           // setValue("Applicant.cTrdCde", data.cnm);
            setValue("ECargoApplicant.cTrdCde", data.cde);
            dialog.value?.handleClose();
          },
        },
      },
      {},
      { title: "国民经济行业分类", width: 85 }
    );
  },
  cOccupCdeChange: () => {
    // const param = opertaor.getParam();
    dialog.value?.open(
      "cOccupCdeModal",
      {
        type: "show",
        method: {
          getdbClickData: (data) => {
            setFormItem("ECargoApplicant.cOccupCde", {
              loadData: [{ label: `${data.cde} ${data.cnm}`, value: data.cde }],
            });
            setValue("ECargoApplicant.cOccupCde", data.cde);
            dialog.value?.handleClose();
          },
        },
      },
      {
        isOk: (selectdata: any) => {},
      },
      { title: "职业", width: 85 }
    );
  },
};



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
function getFormconfig() {
  return formconfig1;
}
function handleFileChange(event: Event) {
  const fileInput = event.target as HTMLInputElement;
}
function getFormConfig(){
  return formconfig1;
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
  setDisabledAll
});
</script>

<style scoped></style>

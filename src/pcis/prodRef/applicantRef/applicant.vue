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
import { useValidator } from "@/typings/useValidator";
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
import moment from "moment";
const { getRules } = useValidator();
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
import { debug } from "console";
const opertaor = dataOpertaor();

const formconfig1 = reactive(createAppFreeEditConfig({}));
const formData = ref<any[]>([]);
onMounted(() => {
  console.log(props.pageSchema);
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    getRules
  );
  Object.assign(formconfig1, formconfig11);
});
//给表单下拉项赋值
// function setFormItem(key, obj) {
//   if (obj && Object.keys(obj).length) {
//     formconfig1.fromSchema?.forEach((item) => {
//       if (item.prop === key) {
//         Object.assign(item, obj);
//       }
//     });
//   }
// }
function setFormItem(key, obj) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      console.log("000", item);
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.loadData && obj.loadData) {
          let newBtnItems = null;
          for (let key in obj.loadData) {
            item.loadData[key] = obj.loadData[key];
          }
          newBtnItems = item.loadData;
          newBtnItems && (obj.loadData = newBtnItems);
        }
        Object.assign(item, obj);
      }
    });
  }
}
// 绑定方法
const method = {
  // func demo
  funcquery: () => {
    const param = opertaor.getParam();
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
          console.log("a", selectdata);
        },
      },
      { title: "选择客户信息", width: 70 }
    );
  },
  funcconfirm: () => {
    applicantEditRef.value?.validate().then((isValid) => {
      console.log(isValid);
      if (isValid) {
        // handleQuery();
        ElMessage.success("客户信息已经存在");
      } else {
        ElMessage.error("请填写必填项");
      }
    });
  },
  funcreset: () => {
    const tabref = opertaor.getTableRefs();
    const applicantValue = tabref["applicant"].getFromValue();
    for (const k in applicantValue) {
      applicantValue[k] = null;
    }
  },
  cardTypeChange: (val) => {
    if (val == "120001") {
      setFormItem("Applicant.cCertfCde", {
        rules: [getRules("required", {}), getRules("idCard", {})],
      });
    } else {
      setFormItem("Applicant.cCertfCde", {
        rules: [getRules("required", {})],
      });
    }
  },
  InsureChange: (val) => {
    if (val == "0") {
      setValue("Applicant.cCertfCls", "");
      setFormItem("Insured.cCntrNme", { hidden: true });
      codeListStore
        .queryCodeList({
          codeListName: "UN_NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          setFormItem("Applicant.cCertfCls", {
            loadData: res,
            rules: [getRules("required", {})],
          });
        });
    } else {
      setValue("Applicant.cCertfCls", "");
      codeListStore
        .queryCodeList({
          codeListName: "NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          setFormItem("Applicant.cCertfCls", {
            loadData: res,
            rules: [getRules("required", {})],
          });
        });
    }
  },
  funcNdustryCate: () => {
    const param = opertaor.getParam();
    dialog.value?.open(
      "ndustryCateModal",
      {
        type: "show",
        data: {},
      },
      {
        isOk: (selectdata: any) => {
          console.log("a", selectdata);
        },
      },
      { title: "国民经济行业分类", width: 85 }
    );
  },
  tCertMrkChecked: (val) => {
    if (val == "1") {
      setValue(
        "Applicant.tCertfBgnDate",
        moment(new Date("2099-12-31")).format("YYYY-MM-DD HH:mm:ss")
      );
      setValue(
        "Applicant.tCertfEndDate",
        moment(new Date("2099-12-31")).format("YYYY-MM-DD HH:mm:ss")
      );
    } else {
      setValue("Applicant.tCertfBgnDate", "");
      setValue("Applicant.tCertfEndDate", "");
    }
  },
  mobileChange: (val) => {
    if (val) {
      setFormItem("Applicant.cMobile", { rules: [getRules("phoneNo", {})] });
    }
  },
  // change: () => {},
};

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

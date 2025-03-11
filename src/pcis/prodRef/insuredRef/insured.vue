<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="insuredEditRef" />
  <comDialog ref="dialog"></comDialog>
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const dialog = ref<DialogMethod | null>(null);
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
const opertaor = dataOpertaor();
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const insuredEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive(createAppFreeEditConfig({}));

onMounted(() => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
});
function setFormItem(key, obj) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        Object.assign(item, obj);
      }
    });
  }
}
// 绑定方法
const method = {
  // func demo
  func1: () => {},
  funccopyvalue: () => {
    const tabref = opertaor.getTableRefs();
    const applicantValue = tabref["applicant"].getFromValue();
    const insuredValue = {};
    for (const k in applicantValue) {
      const key = "Insured." + k.split(".")[1];
      if (k.split(".")[1] == "cAppNme") {
        insuredValue["Insured.cInsuredNme"] = applicantValue["Insured.cAppNme"];
      } else {
        insuredValue[key] = applicantValue[k];
      }
    }
    setFormValue(insuredValue);
  },
  funcquery: () => {
    const param = opertaor.getParam();
    console.log(param);
    console.log(dialog.value);
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
      { title: "选择客户信息", width: 85 }
    );
  },
  funcconfirm: () => {
    insuredEditRef.value?.validate().then((isValid) => {
      console.log(isValid);
      if (isValid) {
        // handleQuery();
        ElMessage.success("客户信息已经存在");
      } else {
        ElMessage.error("请填写必填项");
      }
    });
  },
  cardTypeChange: (val) => {
    if (val == "120001") {
      setFormItem("Insured.cCertfCde", {
        rules: [getRules("required", {}), getRules("idCard", {})],
      });
      setFormItem("Insured.tCertfBgnDate", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.tCertfEndDate", {
        rules: [getRules("required", {})],
      });
    } else if (val == "110002" || val == "110007") {
      setFormItem("Insured.tCertfBgnDate", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.tCertfEndDate", {
        rules: [getRules("required", {})],
      });
    } else {
      setFormItem("Insured.cCertfCde", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.tCertfBgnDate", null);
      setFormItem("Insured.tCertfEndDate", null);
    }
  },
  InsureChange: (val) => {
    if (val == "0") {
      setValue("Insured.cCertfCls", "");
      setFormItem("Insured.cCntrNme", { rules: [getRules("required", {})] });
      setFormItem("Insured.cCntrCertfCde", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.cIsMicro", {
        disabled: true,
      });
      setFormItem("Insured.cIsIndvduBiz", {
        disabled: true,
      });
      codeListStore
        .queryCodeList({
          codeListName: "UN_NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          setFormItem("Insured.cCertfCls", {
            loadData: res,
            rules: [getRules("required", {})],
          });
        });
    } else {
      setFormItem("Insured.cIsMicro", {
        disabled: false,
      });
      setFormItem("Insured.cIsIndvduBiz", {
        disabled: false,
      });
      setValue("Insured.cCertfCls", "");
      setFormItem("Insured.cCntrNme", { rules: null });
      setFormItem("Insured.cCntrCertfCde", { rules: null });
      codeListStore
        .queryCodeList({
          codeListName: "NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          setFormItem("Insured.cCertfCls", {
            loadData: res,
            rules: [getRules("required", {})],
          });
        });
    }
  },
  funcreset: () => {
    const tabref = opertaor.getTableRefs();
    const InsuredValue = tabref["insured"].getFromValue();
    for (const k in InsuredValue) {
      InsuredValue[k] = null;
    }
  },
  funcNdustryCate: () => {
    dialog.value?.open(
      "ndustryCateModal",
      {},
      {},
      { title: "国民经济行业分类", width: "70" }
    );
  },
  cOccupCdeChange: () => {
    const param = opertaor.getParam();
    dialog.value?.open(
      "cOccupCdeModal",
      {
        type: "show",
        data: {},
      },
      {
        isOk: (selectdata: any) => {
          console.log("a", selectdata);
        },
      },
      { title: "职业", width: 85 }
    );
  },
  tCertMrkChecked: (val) => {
    if (val === "1") {
      setValue("Insured.tCertfBgnDate", "2099-12-31");
      setValue("Insured.tCertfEndDate", "2099-12-31");
    }
  },
  mobileChange: (val) => {
    if (val) {
      setFormItem("Insured.cMobile", { rules: [getRules("phoneNo", {})] });
    }
  },
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return insuredEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  insuredEditRef?.value?.setFormValue(value);
}

function validate() {
  return insuredEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  insuredEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return insuredEditRef?.value?.getValue(key);
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

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
import { ru } from "element-plus/es/locale";
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
function setFormItem(key, obj) {
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
      setFormItem("Applicant.tCertfBgnDate", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.tCertfEndDate", {
        rules: [getRules("required", {})],
      });
    } else if (val == "110002" || val == "110007") {
      setFormItem("Applicant.tCertfBgnDate", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.tCertfEndDate", {
        rules: [getRules("required", {})],
      });
    } else {
      setFormItem("Applicant.cCertfCde", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.tCertfBgnDate", null);
      setFormItem("Applicant.tCertfEndDate", null);
    }
  },
  InsureChange: (val) => {
    if (val == "0") {
      setValue("Applicant.cCertfCls", "");
      setFormItem("Applicant.cCntrNme", { rules: [getRules("required", {})] });
      setFormItem("Applicant.cCntrCertfCde", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.cIsMicro", {
        disabled: true,
      });
      setFormItem("Applicant.cIsIndvduBiz", {
        disabled: true,
      });
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
      setFormItem("Applicant.cIsMicro", {
        disabled: false,
      });
      setFormItem("Applicant.cIsIndvduBiz", {
        disabled: false,
      });
      setValue("Applicant.cCertfCls", "");
      setFormItem("Applicant.cCntrNme", { rules: null });
      setFormItem("Applicant.cCntrCertfCde", { rules: null });
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
        method: {
          getdbClickData: (data) => {
            setFormItem("Applicant.cTrdCde", {
              loadData: [{ label: data.cnm, value: data.cde }],
            });
            setValue("Applicant.cTrdCde", data.cnm);
            dialog.value?.handleClose();
          },
        },
      },
      {},
      { title: "国民经济行业分类", width: 85 }
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
        isOk: (selectdata: any) => {},
      },
      { title: "职业", width: 85 }
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
  handleClose: (val) => {},
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

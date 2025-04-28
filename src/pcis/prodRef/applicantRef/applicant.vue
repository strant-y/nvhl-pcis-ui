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

import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
import moment from "moment";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { useProductStore } from "@/store/modules/prod";
const productStore = useProductStore();
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
import { getDefaultCompilerOptions } from "typescript";
import { getAddressStr } from "@/api/query";
const opertaor = dataOpertaor();

const formconfig1 = reactive(createAppFreeEditConfig({}));
const formData = ref<any[]>([]);
const cClntAddr = ref<any>(null);
onMounted(() => {
  console.log(props.pageSchema);
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    getRules
  );
  Object.assign(formconfig1, formconfig11);
  nextTick(() => {
    //是否小微企业，默认非必填、只读
    setFormItem("Applicant.cIsMicroEntpris", {
      rules: null,
      disabled: true,
    });
  });
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
          if (selectdata?.sel) {
            const selobj = JSON.parse(JSON.stringify(selectdata?.sel));
            const newobj = {};
            Object.keys(selobj).forEach((key) => {
              if (key != "_dataId") {
                const k = opertaor.firstCharLower(key);
                newobj["Applicant." + k] = selobj[key];
              }
            });
            console.log(newobj);
            newobj["Applicant.cAppNme"] = newobj["Applicant.cClntNme"];
            setFormValue(newobj);
            setFormItem("Applicant.cAppNme", {
              disabled: true,
            });
            setFormItem("Applicant.cClntMrk", {
              disabled: true,
            });
            setFormItem("Applicant.cCertfCls", {
              disabled: true,
            });
            setFormItem("Applicant.cCertfCde", {
              disabled: true,
            });
          }
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
    console.log(332);
    const tabref = opertaor.getTableRefs();
    const applicantValue = tabref["applicant"].getFromValue();
    for (const k in applicantValue) {
      applicantValue[k] = null;
    }
    setFormItem("Applicant.cAppNme", {
      disabled: false,
    });
    setFormItem("Applicant.cClntMrk", {
      disabled: false,
    });
    setFormItem("Applicant.cCertfCls", {
      disabled: false,
    });
    setFormItem("Applicant.cCertfCde", {
      disabled: false,
    });

    tabref["applicant"].setFormValue(applicantValue);
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
      if (val == "110002") {
        //证件类型是“营业执照”，参加社会统筹标志变化为必填
        // 参加社会统筹标志
        setFormItem("Applicant.cParticiinsocTyp", {
          rules: [getRules("required", {})],
        });
      }
    } else {
      setFormItem("Applicant.cCertfCde", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.tCertfBgnDate", null);
      setFormItem("Applicant.tCertfEndDate", null);
      // 参加社会统筹标志
      setFormItem("Applicant.cParticiinsocTyp", {
        rules: null,
      });
    }
  },
  //投保人性质(0是法人1是个人)
  InsureChange: (val) => {
    if (val == "0") {
      productStore.setcClntMrk(val);
      console.log("000000000", productStore.$state.cClntMrk);
      setValue("Applicant.cCertfCls", "");
      setFormItem("Applicant.cCntrNme", { rules: [getRules("required", {})] });
      setFormItem("Applicant.cParticiinsocTyp", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.cCntrCertfCde", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.cWorkDpt", {
        disabled: false,
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.cIsMicroEntpris", {
        disabled: false,
      });
      //是否个体工商户
      setValue("Applicant.cIsIndvduBiz", "");
      setFormItem("Applicant.cIsIndvduBiz", {
        disabled: true,
      });
      // 是否绿色产业客户
      setFormItem("Applicant.cGreenIndustryCustomers", {
        rules: [getRules("required", {})],
        disabled: false,
      });
      // 参加社会统筹标志
      setFormItem("Applicant.cParticiinsocTyp", {
        rules: [getRules("required", {})],
      });
      //注册地址
      setFormItem("Applicant.cRegisteredcapDre", {
        rules: [getRules("required", {})],
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
      setFormItem("Applicant.cWorkDpt", { disabled: true, rules: null });
      setFormItem("Applicant.cIsMicroEntpris", {
        disabled: true,
      });
      //参加社会统筹标志
      setFormItem("Applicant.cParticiinsocTyp", {
        rules: null,
      });
      //注册地址
      setFormItem("Applicant.cRegisteredcapDre", { rules: null });
      //是否个体工商户
      setFormItem("Applicant.cIsIndvduBiz", {
        disabled: false,
      });
      // 是否绿色产业客户
      setFormItem("Applicant.cGreenIndustryCustomers", {
        rules: null,
        disabled: true,
      });
      setValue("Applicant.cGreenIndustryCustomers", "");
      setValue("Applicant.cIsMicroEntpris", "");
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
        method: {
          getdbClickData: (data) => {
            setFormItem("Applicant.cOccupCde", {
              loadData: [{ label: data.cnm, value: data.cde }],
            });
            setValue("Applicant.cOccupCde", data.cnm);
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
  emailChange: (val) => {
    if (val) {
      setFormItem("Applicant.cEmail", { rules: [getRules("email", {})] });
    }
  },
  cCountryChange: (val) => {
    setValue("Applicant.cCity", "");
    setValue("Applicant.cProvince", "");
    setValue("Applicant.cCounty", "");
    if (val) {
      codeListStore
        .queryCodeList({
          codeListName: "WEB_BAS_AREA",
          codeListParam: { cParCde: val, cType: "1" },
        })
        .then((res) => {
          const objData = {
            loadData: res,
          };
          setFormItem("Applicant.cProvince", objData);
        });
    }
  },
  cProvinceChange: (val) => {
    setValue("Applicant.cCity", "");
    setValue("Applicant.cCounty", "");
    if (val) {
      codeListStore
        .queryCodeList({
          codeListName: "WEB_BAS_AREA",
          codeListParam: { cParCde: val, cType: "2" },
        })
        .then((res) => {
          const objData = {
            loadData: res,
          };
          setFormItem("Applicant.cCity", objData);
        });
    }
  },
  cCityChange: (val) => {
    setValue("Applicant.cCounty", "");
    codeListStore
      .queryCodeList({
        codeListName: "WEB_BAS_AREA",
        codeListParam: { cParCde: val, cType: "3" },
      })
      .then((res) => {
        const objData = {
          loadData: res,
        };
        setFormItem("Applicant.cCounty", objData);
      });
  },
  handleClose: (val) => {},
  // 是否绿色产业客户change
  ApplicantIsGreen: (val) => {
    // 控制绿色产业细分列表是否必填
    if (val == "1") {
      setFormItem("Applicant.cGreenIndustryList", {
        rules: [getRules("required", {})],
      });
    } else {
      setFormItem("Applicant.cGreenIndustryList", { rules: null });
    }
  },
  // 证件号码change
  cCertfCdeChange: (val) => {
    if (val) {
      const certfCde = applicantEditRef.value?.getValue("Applicant.cCertfCde");
      if (certfCde && certfCde.length === 18) {
        const birthYear = parseInt(certfCde.substring(6, 10), 10);
        const birthMonth = parseInt(certfCde.substring(10, 12), 10);
        const birthDay = parseInt(certfCde.substring(12, 14), 10);
        const birthday = `${birthYear}-${birthMonth.toString().padStart(2, "0")}-${birthDay.toString().padStart(2, "0")}`;
        const sexCode = parseInt(certfCde.substring(16, 17), 10);
        const sex = sexCode % 2 === 0 ? "2" : "1"; // 1: 男, 2: 女
        const age = new Date().getFullYear() - birthYear;
        setValue("Applicant.tBirthday", birthday);
        setValue("Applicant.nAge", age);
        setValue("Applicant.cSex", sex);
      }
    }
  },
  //注册地市是否同上
  isSameChange: (val) => {
    console.log(val, "0000");
    if (val == "1") {
      // 获取常驻地址的值
      // const residenceAddr = applicantEditRef.value?.getValue(
      //   "Applicant.cResidenceAddr"
      // );
      // console.log("00009999", residenceAddr);
      // applicantEditRef.value?.setValue(
      //   "Applicant.cRegisteredcapDre",
      //   residenceAddr
      // );
    } else {
    }
  },
  //注册地址
  getCountry: (val: any) => {
    setRegisterAdd();
  },
  //常住地址
  getAllProp: (val: any) => {
    setregistAdd();
  },
  //注册地址(input)
  getcSuffixAddr:(val: any)=>{
    setRegisterAdd();
  },
  //常住地址(input)
  getcRegisterSuffixAddr: (val: any) => {
    setregistAdd();
  },
};

function setregistAdd() {
  const ads = applicantEditRef?.value?.getValue('Applicant.AllProp');
  const a =  applicantEditRef?.value?.getValue("Applicant.cRegisterSuffixAddr") || "";
  if(ads){
    getAddressStr({ address: ads }).then((res: any) => {
    const { code, data, msg } = res;
    if (code === 200) {
      const b = data['addStr'] + a;
      setAddressStr("Applicant.cClntAddr", b);
    }
  });
  }else{
    setAddressStr("Applicant.cClntAddr", a);
  }
}

function setRegisterAdd() {
  const ads = applicantEditRef?.value?.getValue('Applicant.Prop');
  const a =  applicantEditRef?.value?.getValue("Applicant.cSuffixAddr") || "";
  if(ads){
    getAddressStr({ address: ads }).then((res: any) => {
    const { code, data, msg } = res;
    if (code === 200) {
      const b = data['addStr'] + a;
      setAddressStr("Applicant.cRegisteredcapDre", b);
    }
  });
  }else{
    setAddressStr("Applicant.cRegisteredcapDre", a);
  }
}
function setAddressStr(key: any, data: any) {
  applicantEditRef?.value?.setValue(key, data);
}

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
function getFormconfig() {
  return formconfig1;
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig,
});
</script>

<style scoped></style>

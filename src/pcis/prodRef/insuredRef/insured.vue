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
import { useValidator } from "@/typings/useValidator";
import moment from "moment";
import { codeListViewStore } from "@/store";
import { useProductStore } from "@/store/modules/prod";
const productStore = useProductStore();
const opertaor = dataOpertaor();
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});
const { getRules } = useValidator();
const codeListStore = codeListViewStore();
const insuredEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive(createAppFreeEditConfig({}));

onMounted(() => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules,
    getRules
  );
  Object.assign(formconfig1, formconfig11);
  nextTick(() => {
    //是否小微企业，默认非必填、只读
    setFormItem("Insured.cIsMicroEntpris", {
      rules: null,
      disabled: true,
    });
  });
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
//  根据 客户名称 / 被保人性质/ 证件类型 / 证件号码 获取客户信息
const checkUser = () => {
  let obj = {};
  const tabref = opertaor.getTableRefs();
  const applicantValue = tabref["insured"].getFromValue();
  //  只要4个有值 去请求客户信息
  if (
    applicantValue["Insured.cClntMrk"] !== null &&
    applicantValue["Insured.cClntMrk"] !== undefined &&
    applicantValue["Insured.cClntMrk"] !== "" &&
    applicantValue["Insured.cAppNme"] &&
    applicantValue["Insured.cCertfCde"] &&
    applicantValue["Insured.cCertfCls"]
  ) {
    console.log("根据4个选项 请求客户代码");

    //  obj = {'Insured.cCertfCde':'9000000504'}
    // obj['Insured.cInsuredCde'] = '0008'
    // obj['Insured.cAppCde'] = '0009'

    //  tabref ['insured'].setFormValue(obj);
  }

  //  cClntMrk  被保人性质
  //  cAppNme  客户名称
  //  cCertfCde    身份号码
  //  cCertfCls   身份证类型
  console.log("checkUser", applicantValue);
};

// 绑定方法
const method = {
  func: () => {},
  func1: () => {},
  funCheckUser: () => {
    checkUser(); // 根据名称  被保人性质 证件类型 证件号码查询用户信息
  },
  funccopyvalue: () => {
    const tabref = opertaor.getTableRefs();
    const applicantValue = tabref["applicant"].getFromValue();
    // const applicantValue2 = tabref["insured"].getFromValue();
    let insuredValue = {};
    console.log("applicant---data", applicantValue);
    console.log("insured----data", insuredValue);

    for (const k in applicantValue) {
      switch (k) {
        case "Applicant.cAppNme":
          insuredValue["Insured.cAppNme"] = applicantValue[k];
          break;
        case "Applicant.cCertfCde":
          insuredValue["Insured.cCertfCde"] = applicantValue[k];
          break;
        case "Applicant.cCertfCls":
          insuredValue["Insured.cCertfCls"] = applicantValue[k];
          break;
        case "Applicant.nAge":
          insuredValue["Insured.nAge"] = applicantValue[k];
          break;
        case "Applicant.cSex":
          insuredValue["Insured.cSex"] = applicantValue[k];
          break;
        case "Applicant.cStkMrk":
          insuredValue["Insured.cStkMrk"] = applicantValue[k];
          break;
        case "Applicant.tBirthday":
          insuredValue["Insured.tBirthday"] = applicantValue[k];
          break;
        case "Applicant.cCertfCls":
          insuredValue["Insured.cCertfCls"] = applicantValue[k];
          break;
        case "Applicant.cClntMrk":
          insuredValue["Insured.cClntMrk"] = applicantValue[k];
          break;
        case "Applicant.tCertfBgnDate":
          insuredValue["Insured.tCertfBgnDate"] = applicantValue[k];
          break;
        case "Applicant.tCertfEndDate":
          insuredValue["Insured.tCertfEndDate"] = applicantValue[k];
          break;
        case "Applicant.cLongendTyp":
          insuredValue["Insured.cLongendTyp"] = applicantValue[k];
          break;

        case "Applicant.cIsBranch":
          insuredValue["Insured.cIsBranch"] = applicantValue[k];
          break;
        case "Applicant.tBirthday":
          insuredValue["Insured.tBirthday"] = applicantValue[k];
          break;
        case "Applicant.cSex":
          insuredValue["Insured.cSex"] = applicantValue[k];
          break;
        case "Applicant.cNation":
          insuredValue["Insured.cNation"] = applicantValue[k];
          break;

        case "Applicant.cOccupTyp":
          insuredValue["Insured.cOccupTyp"] = applicantValue[k];
          break;
        // case 'Applicant.cClntMrk':
        // insuredValue['Insured.cClntMrk'] =  applicantValue[k]
        // break;
        case "Applicant.cMrg":
          insuredValue["Insured.cMrg"] = applicantValue[k];
          break;
        case "Applicant.cCity":
          insuredValue["Insured.cCity"] = applicantValue[k];
          break;
        case "Applicant.cCountry":
          insuredValue["Insured.cCountry"] = applicantValue[k];
          break;
        case "Applicant.cCounty":
          insuredValue["Insured.cCounty"] = applicantValue[k];
          break;
        case "Applicant.cProvince":
          insuredValue["Insured.cProvince"] = applicantValue[k];
          break;
        case "Applicant.cRegisterSuffixAddr":
          insuredValue["Insured.cRegisterSuffixAddr"] = applicantValue[k];
          break;
        case "Applicant.cRegisteredcapDre":
          insuredValue["Insured.cRegisteredcapDre"] = applicantValue[k];
          break;
        case "Applicant.cZipCde":
          insuredValue["Insured.cZipCde"] = applicantValue[k];
          break;
        case "Applicant.cFax":
          insuredValue["Insured.cFax"] = applicantValue[k];
          break;
        case "Applicant.cEmail":
          insuredValue["Insured.cEmail"] = applicantValue[k];
          break;
        case "Applicant.cTrdCde":
          insuredValue["Insured.cTrdCde"] = applicantValue[k];
          break;
        case "Applicant.nEntprisPeopTtl":
          insuredValue["Insured.nEntprisPeopTtl"] = applicantValue[k];
          break;
        case "Applicant.cIsIndvduBiz":
          insuredValue["Insured.cIsIndvduBiz"] = applicantValue[k];
          break;
        case "Applicant.cTel":
          insuredValue["Insured.cTel"] = applicantValue[k];
          break;
        case "Applicant.cMobile":
          insuredValue["Insured.cMobile"] = applicantValue[k];
          break;
        case "Applicant.cWorkDpt":
          insuredValue["Insured.cWorkDpt"] = applicantValue[k];
          break;
        case "Applicant.cCntrNme":
          insuredValue["Insured.cCntrNme"] = applicantValue[k];
          break;
        case "Applicant.cOperaterCertfTyp":
          insuredValue["Insured.cOperaterCertfTyp"] = applicantValue[k];
          break;
        case "Applicant.tOperaterCertfEndTm":
          insuredValue["Insured.tOperaterCertfEndTm"] = applicantValue[k];
          break;
        case "Applicant.cGreenIndustryCustomers":
          insuredValue["Insured.cGreenIndustryCustomers"] = applicantValue[k];
          break;
        case "Applicant.cRelateNo":
          insuredValue["Insured.cRelateNo"] = applicantValue[k];
          break;
        case "Applicant.cEdubackgroudTyp":
          insuredValue["Insured.cEdubackgroudTyp"] = applicantValue[k];
          break;
        case "Applicant.cGreenIndustryList":
          insuredValue["Insured.cGreenIndustryList"] = applicantValue[k];
          break;
        case "Applicant.nYearincomeNum":
          insuredValue["Insured.nYearincomeNum"] = applicantValue[k];
          break;
        case "Applicant.cFirmscaleTyp":
          insuredValue["Insured.cFirmscaleTyp"] = applicantValue[k];
          break;
        case "Applicant.cGridCode":
          insuredValue["Insured.cGridCode"] = applicantValue[k];
          break;
        case "Applicant.tEstablishingDate":
          insuredValue["Insured.tEstablishingDate"] = applicantValue[k];
          break;
        case "Applicant.cParticiinsocTyp":
          insuredValue["Insured.cParticiinsocTyp"] = applicantValue[k];
          break;
        case "Applicant.cRealnameAuthFlag":
          insuredValue["Insured.cRealnameAuthFlag"] = applicantValue[k];
          break;
        case "Applicant.nRegisteredCapital":
          insuredValue["Insured.nRegisteredCapital"] = applicantValue[k];
          break;
        case "Applicant.cRatioTyp":
          insuredValue["Insured.cRatioTyp"] = applicantValue[k];
          break;
        case "Applicant.cConpersonNme":
          insuredValue["Insured.cConpersonNme"] = applicantValue[k];
          break;
        case "Applicant.cLegalNme":
          insuredValue["Insured.cLegalNme"] = applicantValue[k];
          break;
        case "Applicant.cLegalCertfCde":
          insuredValue["Insured.cLegalCertfCde"] = applicantValue[k];
          break;
        case "Applicant.tLegalCertfEndTm":
          insuredValue["Insured.tLegalCertfEndTm"] = applicantValue[k];
          break;
        case "Applicant.cOrganizationCode":
          insuredValue["Insured.cOrganizationCode"] = applicantValue[k];
          break;
        case "Applicant.cTaxRegistrationNo":
          insuredValue["Insured.cTaxRegistrationNo"] = applicantValue[k];
          break;
        case "Applicant.cBuslicenceNo":
          insuredValue["Insured.cBuslicenceNo"] = applicantValue[k];
          break;
        case "Applicant.cShareholderName":
          insuredValue["Insured.cShareholderName"] = applicantValue[k];
          break;
        case "Applicant.cShareholderCode":
          insuredValue["Insured.cShareholderCode"] = applicantValue[k];
          break;
        case "Applicant.cBusinessScope":
          insuredValue["Insured.cBusinessScope"] = applicantValue[k];
          break;
        default:
          insuredValue[k] = applicantValue[k];
      }
    }

    // console.log(355,InsuredValue)

    // const insuredValue =applicantValue;

    // for (const k in applicantValue) {
    //   const key = "Insured." + k.split(".")[1];
    //   if (k.split(".")[1] == "cAppNme") {
    //     insuredValue["Insured.cInsuredNme"] =
    //       applicantValue["Applicant.cAppNme"];
    //   } else if (k.split(".")[1] == "cAppCde") {
    //     insuredValue["Insured.cInsuredCde"] =
    //       applicantValue["Applicant.cAppCde"];
    //   } else {
    //     insuredValue[key] = applicantValue[k];
    //   }
    // }
    // setFormValue(insuredValue);

    // console.log(555,insuredValue)

    tabref["insured"].setFormValue(insuredValue);
  },
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
                newobj["Insured." + k] = selobj[key];
              }
            });
            console.log(newobj);
            newobj["Insured.cInsuredNme"] = newobj["Insured.cClntNme"];
            newobj["Insured.cInsuredCde"] = newobj["Insured.cAppCde"];
            setFormValue(newobj);
            setFormItem("Insured.cInsuredNme", {
              disabled: true,
            });
            setFormItem("Insured.cClntMrk", {
              disabled: true,
            });
            setFormItem("Insured.cCertfCls", {
              disabled: true,
            });
            setFormItem("Insured.cCertfCde", {
              disabled: true,
            });
          }
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
    // console.log('btn3')
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
  //被保人性质change事件
  cClntMrkFunc: (val) => {
    checkUser();
    // val  0法人 1个人
    if (val == "0") {
      setValue("Insured.cCertfCls", "");
      setFormItem("Insured.cCntrNme", { rules: [getRules("required", {})] });
      setFormItem("Insured.cCntrCertfCde", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.cIsMicroEntpris", {
        disabled: false,
      });
      //是否个体工商户
      setValue("Insured.cIsIndvduBiz", "");
      setFormItem("Insured.cIsIndvduBiz", {
        disabled: true,
      });
      // 是否绿色产业客户
      setFormItem("Insured.cGreenIndustryCustomers", {
        rules: [getRules("required", {})],
        disabled: false,
      });
      // 参加社会统筹标志
      setFormItem("Insured.cParticiinsocTyp", {
        rules: [getRules("required", {})],
      });
      //注册地址
      setFormItem("Insured.cRegisteredcapDre", {
        rules: [getRules("required", {})],
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
      setFormItem("Insured.cIsMicroEntpris", {
        disabled: true,
      });
      //是否个体工商户
      setFormItem("Insured.cIsIndvduBiz", {
        disabled: false,
      });
      setFormItem("Applicant.cWorkDpt", { disabled: true, rules: null });
      //注册地址
      setFormItem("Applicant.cRegisteredcapDre", { rules: null });
      setFormItem("Applicant.cIsIndvduBiz", {
        disabled: false,
      });
      // 是否绿色产业客户
      setFormItem("Insured.cGreenIndustryCustomers", {
        rules: null,
        disabled: true,
      });
      // 参加社会统筹标志
      setFormItem("Insured.cParticiinsocTyp", {
        rules: null,
      });

      setValue("Insured.cGreenIndustryCustomers", "");
      setValue("Insured.cIsMicroEntpris", "");
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
    console.log("重置");
    const tabref = opertaor.getTableRefs();
    const InsuredValue = tabref["insured"].getFromValue();

    console.log(111, InsuredValue);
    // return false
    for (const k in InsuredValue) {
      InsuredValue[k] = null;
    }
    setFormItem("Insured.cInsuredNme", {
      disabled: false,
    });
    setFormItem("Insured.cClntMrk", {
      disabled: false,
    });
    setFormItem("Insured.cCertfCls", {
      disabled: false,
    });
    setFormItem("Insured.cCertfCde", {
      disabled: false,
    });

    tabref["insured"].setFormValue(InsuredValue);
  },
  funcNdustryCate: () => {
    dialog.value?.open(
      "ndustryCateModal",
      {
        type: "show",
        method: {
          getdbClickData: (data) => {
            setFormItem("Insured.cTrdCde", {
              loadData: [{ label: data.cnm, value: data.cde }],
            });
            setValue("Insured.cTrdCde", data.cnm);
            dialog.value?.handleClose();
          },
        },
      },
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
        method: {
          getdbClickData: (data) => {
            setFormItem("Insured.cOccupCde", {
              loadData: [{ label: data.cnm, value: data.cde }],
            });
            setValue("Insured.cOccupCde", data.cnm);
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
    console.log(1123);
    if (val == "1") {
      setValue(
        "Insured.tCertfBgnDate",
        moment(new Date("2099-12-31")).format("YYYY-MM-DD HH:mm:ss")
      );
      setValue(
        "Insured.tCertfEndDate",
        moment(new Date("2099-12-31")).format("YYYY-MM-DD HH:mm:ss")
      );
    } else {
      setValue("Insured.tCertfBgnDate", "");
      setValue("Insured.tCertfEndDate", "");
    }
  },
  mobileChange: (val) => {
    if (val) {
      setFormItem("Insured.cMobile", { rules: [getRules("phoneNo", {})] });
    }
  },
  // 是否绿色产业客户change
  InsuredIsGreen: (val) => {
    // 控制绿色产业细分列表是否必填
    if (val == "1") {
      setFormItem("Insured.cGreenIndustryList", {
        rules: [getRules("required", {})],
      });
    } else {
      setFormItem("Insured.cGreenIndustryList", { rules: null });
    }
  },
  //证件类型change
  InsuredCCertfCls: (val) => {
    checkUser();
    if (val == "110002") {
      //证件类型是“营业执照”，参加社会统筹标志变化为必填
      // 参加社会统筹标志
      setFormItem("Insured.cParticiinsocTyp", {
        rules: [getRules("required", {})],
      });
    } else {
      // 参加社会统筹标志
      setFormItem("Insured.cParticiinsocTyp", {
        rules: null,
      });
    }
  },
  emailChange: (val) => {
    if (val) {
      setFormItem("Insured.cEmail", { rules: [getRules("email", {})] });
    }
  },
  cCountryChange: (val) => {
    setValue("Insured.cCity", "");
    setValue("Insured.cProvince", "");
    setValue("Insured.cCounty", "");
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
          setFormItem("Insured.cProvince", objData);
        });
    }
  },
  cProvinceChange: (val) => {
    setValue("Insured.cCity", "");
    setValue("Insured.cCounty", "");
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
          setFormItem("Insured.cCity", objData);
        });
    }
  },
  cCityChange: (val) => {
    setValue("Insured.cCounty", "");
    codeListStore
      .queryCodeList({
        codeListName: "WEB_BAS_AREA",
        codeListParam: { cParCde: val, cType: "3" },
      })
      .then((res) => {
        const objData = {
          loadData: res,
        };
        setFormItem("Insured.cCounty", objData);
      });
  },
  cCertfCdeChange: (val) => {
    checkUser();
    const tabref = opertaor.getTableRefs();

    if (val) {
      // const certfCde = applicantEditRef.value?.getValue("Insured.cCertfCde");
      const certfCde = tabref["insured"].getFromValue()["Insured.cCertfCde"];
      if (certfCde && certfCde.length === 18) {
        const birthYear = parseInt(certfCde.substring(6, 10), 10);
        const birthMonth = parseInt(certfCde.substring(10, 12), 10);
        const birthDay = parseInt(certfCde.substring(12, 14), 10);
        const birthday = `${birthYear}-${birthMonth.toString().padStart(2, "0")}-${birthDay.toString().padStart(2, "0")}`;
        const sexCode = parseInt(certfCde.substring(16, 17), 10);
        const sex = sexCode % 2 === 0 ? "2" : "1"; // 1: 男, 2: 女
        const age = new Date().getFullYear() - birthYear;
        setValue("Insured.tBirthday", birthday);
        setValue("Insured.nAge", age);
        setValue("Insured.cSex", sex);
      }
    }
  },
  //注册地市是否同上
  isSameChange: (val) => {
    console.log(val, "0000");
  },
  hidPerson: () => {
    console.log(productStore.$state.cClntMrk, "00000000000000000000");
    // productStore.$state.cClntMrk == "0";
    // setFormItem("Insured.cCntrNme", { hidden: false });
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

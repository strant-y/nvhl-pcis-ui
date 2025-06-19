<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="insuredEditRef" />
  <comDialog ref="dialog"></comDialog>
  <input type="file" ref="fileInputRef" style="display: none" @change="handleFileChange" />
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import dayjs from "dayjs";

const dialog = ref<DialogMethod | null>(null);
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { useValidator } from "@/typings/useValidator";
import moment from "moment";
import { codeListViewStore } from "@/store";
import { useProductStore } from "@/store/modules/prod";
import { getAddressStr, qryCustomer } from "@/api/query";

import { descryptParameter, encryptParameter } from "@/utils/encipher";
import { useRouter, useRoute } from 'vue-router';
const route = useRoute();
const query = ref(route.query);
const router = useRouter();
const param = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}");



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
// import { useRoute } from "vue-router";
// const route = useRoute();
const fileInputRef = ref(null);
const fileInputType = ref();
import { readFile } from "@/api/file";
const user = JSON.parse(sessionStorage.getItem("user"));
const tCertfDate = ref<any[]>([]);
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
  //【国民经济行业分类】初始化必填，只有法人时才必填，现在个人也是必填了（老系统需求：040001/042002/043004/043005/043011五款产品不区分法人个人投保，国民经济行业分类都必填，其他产品只有法人才必填）
  const cProdNo = route.params.param.cProdNo;
  if (
    cProdNo === "040001" ||
    cProdNo === "042002" ||
    cProdNo === "043004" ||
    cProdNo === "043005" ||
    cProdNo === "043011"
  ) {
    setFormItem("Insured.cTrdCde", { rules: null });
  }
  if (!cProdNo.startsWith("05")) {
    setFormItem("Insured.cShareholderNature", { hidden: true, rules: null });
    setFormItem("Insured.cShareholderCode", { hidden: true, rules: null });
    setFormItem("Insured.cShareholderName", { hidden: true, rules: null });
    setFormItem("Insured.cShareholderCategory", { hidden: true, rules: null });
  }

  // 处理邮编
  setFormItem("Insured.cZipCde", {
           'maxlength':6,
    rules: [getRules("signlessInt", {}), getRules("specifyLength", { len: 6 })],
  });
  // 移动电话
  setFormItem("Insured.cMobile", { rules: [getRules("phoneNo", {})] });

  // 传真校验
  setFormItem("Insured.cFax", { rules: [getRules("faxNumber", {})] });
  // 法人身份证
  setFormItem("Insured.cLegalCertfCde", { rules: [getRules("idCard", {})] });


});
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

// 解析身份证
const idAnalysis = (id:string)=>{
      // const certfCde = tabref["insured"].getFromValue()["Insured.cCertfCde"];
      //   if (certfCde && certfCde.length === 18) {
          const birthYear = parseInt(id.substring(6, 10), 10);
          const birthMonth = parseInt(id.substring(10, 12), 10);
          const birthDay = parseInt(id.substring(12, 14), 10);
          const birthday = `${birthYear}-${birthMonth.toString().padStart(2, "0")}-${birthDay.toString().padStart(2, "0")}`;
          const sexCode = parseInt(id.substring(16, 17), 10);
          const sex = sexCode % 2 === 0 ? "2" : "1"; // 1: 男, 2: 女
          const age = new Date().getFullYear() - birthYear;

          setValue("Insured.cNation", "1"); // 国籍
          setValue("Insured.tBirthday", birthday);
          setValue("Insured.nAge", age);
          setValue("Insured.cSex", sex);
        // }
}



//  根据 客户名称 / 被保人性质/ 证件类型 / 证件号码 获取客户信息
const checkUser = () => {
  // 自定义录单 进入 可以查询用户信息
  if (param.cRecordType !== 1) {
    return false;
  }

  const tabref = opertaor.getTableRefs();
  const applicantValue = tabref["insured"].getFromValue();
  //  只要4个有值 去请求客户信息
  if (
    applicantValue["Insured.cInsuredNme"] &&
    applicantValue["Insured.cClntMrk"] !== null &&
    applicantValue["Insured.cCertfCde"] &&
    applicantValue["Insured.cCertfCls"]
  ) {
    const param = {
      coustName: applicantValue["Insured.cInsuredNme"],
      coustMrk: applicantValue["Insured.cClntMrk"],
      coustType: applicantValue["Insured.cCertfCls"],
      coustCode: applicantValue["Insured.cCertfCde"],
      personnelType: "Insured"
    }
    qryCustomer(param)
      .then((res) => {
        const { code, data, msg } = res;
        if (200 === code) {
          console.log('客户数据', res)
          if (data) {
            tabref['insured'].setFormValue(data[0])
          }
        } else {
        }
      })
      .finally(() => { });
  }
};

// 绑定方法
const method = {
  func: () => { },
  func1: () => { },
  funCheckUser: () => {
    checkUser(); // 根据名称  被保人性质 证件类型 证件号码查询用户信息
  },
  funccopyvalue: () => {
    const tabref = opertaor.getTableRefs();
    const applicantValue = tabref["applicant"].getFromValue();
    console.log(applicantValue);
    let insuredValue: any = {};
    for (const k in applicantValue) {
      if (k === "Applicant.cCertfCls") {
        setTimeout(() => {
          setValue("Insured.cCertfCls", applicantValue[k]);
        }, 0);
      } else if (k === "Applicant.cAppCde") {
        insuredValue["Insured.cInsuredCde"] = applicantValue[k];
      } else if (k === "Applicant.cAppNme") {
        insuredValue["Insured.cInsuredNme"] = applicantValue[k];
      } else if (k.startsWith("Applicant")) {
        const nk = k.replace("Applicant", "Insured");
        insuredValue[nk] = applicantValue[k];
      }
    }
    console.log(insuredValue);
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

            newobj["Insured.cInsuredNme"] = newobj["Insured.cClntNme"];
            newobj["Insured.cInsuredCde"] = newobj["Insured.cAppCde"];
            setFormValue(newobj);
            if (!param.initFlag) {
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
          }
        },
      },
      { title: "选择客户信息", width: 85 }
    );
  },

  funcconfirm: () => {
    insuredEditRef.value?.validate().then((isValid) => {
      if (isValid) {
        // handleQuery();
        ElMessage.success("客户信息已经存在");
      } else {
        ElMessage.error("请填写必填项");
      }
    });
  },

  //被保人性质change事件
  cClntMrkFunc: (val) => {
    const param = opertaor.getParam();
    const tabref = opertaor.getTableRefs();
    const InsuredValue = tabref["insured"].getFromValue();
    console.log("---------------", InsuredValue);
    checkUser();
    // val  0法人 1个人
    if (val == "0") {
      // setValue("Insured.cCertfCls", "");
      setFormItem("Insured.cCntrNme", { rules: [getRules("required", {})] });
      setFormItem("Insured.cCntrCertfCde", {
        rules: [getRules("required", {})],
      });
      //是否个体工商户
      setValue("Insured.cIsIndvduBiz", "");
      setFormItem("Insured.cIsIndvduBiz", {
        rules: null,
      });
      // 是否绿色产业客户
      setFormItem("Insured.cGreenIndustryCustomers", {
        rules: [getRules("required", {})],
      });
      if (!param.initFlag) {
        setFormItem("Insured.cIsMicroEntpris", {
          disabled: false,
        });
        setFormItem("Insured.cIsIndvduBiz", {
          disabled: true,
        });
        setFormItem("Insured.cGreenIndustryCustomers", {
          disabled: false,
        });
      }
      // 参加社会统筹标志
      setFormItem("Insured.cParticiinsocTyp", {
        rules: [getRules("required", {})],
      });
      //注册地址
      setFormItem("Insured.cRegisteredcapDre", {
        rules: [getRules("required", {})],
      });
      // 为法人 国民经济行业必填
      setFormItem("Insured.cTrdCde", {
        rules: [getRules("required", {})],
      });


      // // 移动电话
      // setFormItem("Insured.cMobile", { rules: [getRules("phoneNo", {})] });
      let cMobile = getValue('Insured.cMobile');  // 移动 
      let cTel = getValue('Insured.cTel');  // 固定电话    
      if(!cMobile &&  !cTel ){
         setFormItem("Insured.cMobile", {
          rules: [getRules("required", {}), getRules("phoneNo", {})],
        });
      }else  if(cMobile){
        setFormItem("Insured.cTel", { rules: [getRules("phone", {})] });
        setFormItem("Insured.cMobile", { rules: [getRules("required", {}), getRules("phoneNo", {})]})
      } else if(cTel){
        setFormItem("Insured.cTel", { rules: [getRules("required", {}),getRules("phone", {})] });
        setFormItem("Insured.cMobile", { rules: [ getRules("phoneNo", {})]})
      }


      codeListStore
        .queryCodeList({
          codeListName: "UN_NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          if (
            !res.some((item) =>
              Object.values(item).includes(getValue("Insured.cCertfCls"))
            )
          ) {
            setValue("Insured.cCertfCls", "");
          }
          setFormItem("Insured.cCertfCls", {
            loadData: [],
          });
          setFormItem("Insured.cCertfCls", {
            loadData: res,
            rules: [getRules("required", {})],
          });
        });

      setFormItem("Insured.cWorkDpt", {
        rules: [getRules("required", {})],
      });

      // cCntrNme 办理人  cOperaterCertfTyp办理证件  cOperaterCertfCde 办理人员证件号码  tOperaterCertfEndTm有效期
      setFormItem("Insured.cCntrNme", {
        hidden: true,
      });
      setFormItem("Insured.cOperaterCertfTyp", {
        hidden: true,
      });
      setFormItem("Insured.cOperaterCertfCde", {
        hidden: true,
      });

      setFormItem("Insured.tOperaterCertfEndTm", {
        hidden: true,
      });
    } else {
      if (!param.initFlag) {
        setFormItem("Insured.cWorkDpt", {
          disabled: false,
        });
        setFormItem("Insured.cIsMicroEntpris", {
          disabled: true,
        });
        setFormItem("Insured.cIsIndvduBiz", {
          disabled: false,
        });
        setFormItem("Insured.cGreenIndustryCustomers", {
          disabled: true,
        });
      }

      //是否个体工商户
      setFormItem("Insured.cIsIndvduBiz", {
        rules: [getRules("required", {})],
      });

      // 单位性质
      setFormItem("Insured.cWorkDpt", { rules: null });

      //注册地址
      setFormItem("Insured.cRegisteredcapDre", { rules: null });

      // 是否绿色产业客户
      setFormItem("Insured.cGreenIndustryCustomers", {
        rules: null,
        disabled:true,
      });
           // 是否绿色详情
      setFormItem("Insured.cGreenIndustryList", {
        rules: null,
        disabled: true,
      });

      // 参加社会统筹标志
      setFormItem("Insured.cParticiinsocTyp", {
        rules: null,
      });

            // 为法人  企业成立日期
      setFormItem("Insured.tEstablishingDate", {
        rules: null,
      });

      setValue("Insured.cGreenIndustryCustomers", "");
      setValue('Insured.cGreenIndustryList','')

      setValue("Insured.cIsMicroEntpris", "");
      // setValue("Insured.cCertfCls", "");
      setFormItem("Insured.cCntrNme", { rules: null });
      setFormItem("Insured.cCntrCertfCde", { rules: null });

      // 为法人 国民经济行业必填
      setFormItem("Insured.cTrdCde", {
        rules: null,
      });
      // 是否分支机构
      setValue("Insured.cIsBranch", "1");

      // 个人 移动电话必填  
      setFormItem("Insured.cMobile", {
        rules: [ getRules("required", {}), getRules("phoneNo", {})],
      });
      setFormItem("Insured.cTel", { rules: [getRules("phone", {})] });


      codeListStore
        .queryCodeList({
          codeListName: "NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          if (
            !res.some((item) =>
              Object.values(item).includes(getValue("Insured.cCertfCls"))
            )
          ) {
            setValue("Insured.cCertfCls", "");
          }
          setFormItem("Insured.cCertfCls", {
            loadData: [],
          });
          setFormItem("Insured.cCertfCls", {
            loadData: res,
            rules: [getRules("required", {})],
          });
        });
      // 处理办理人
      setFormItem("Insured.cCntrNme", {
        hidden: false,
      });
      setFormItem("Insured.cOperaterCertfTyp", {
        hidden: false,
      });
      setFormItem("Insured.cOperaterCertfCde", {
        hidden: false,
      });

      setFormItem("Insured.tOperaterCertfEndTm", {
        hidden: false,
      });
    }
  },
  //大股东性质change事件
  funcShareholderNature: (val) => {
    if (val == "1") {
      // setFormItem("Insured.cShareholderNature", {
      //   rules: [getRules("required", {})],
      // });
      codeListStore
        .queryCodeList({
          codeListName: "NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          if (
            !res.some((item) =>
              Object.values(item).includes(
                getValue("Insured.cShareholderCategory")
              )
            )
          ) {
            setValue("Insured.cShareholderCategory", "");
          }
          setFormItem("Insured.cShareholderCategory", {
            loadData: [],
          });
          setFormItem("Insured.cShareholderCategory", {
            loadData: res,
          });
        });
    } else {
      codeListStore
        .queryCodeList({
          codeListName: "UN_NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          if (
            !res.some((item) =>
              Object.values(item).includes(
                getValue("Insured.cShareholderCategory")
              )
            )
          ) {
            setValue("Insured.cShareholderCategory", "");
          }
          setFormItem("Insured.cShareholderCategory", {
            loadData: [],
          });
          setFormItem("Insured.cShareholderCategory", {
            loadData: res,
          });
        });
    }
  },
  // 是否个体工商户
  cIsIndvduBizChange: (val: any) => {
    console.log("111", val);
    if (val == "1") {
      setFormItem("Insured.cOccupCde", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.cTrdCde", {
        rules: [getRules("required", {})],
      });
    } else if (val == "0") {
      setFormItem("Insured.cOccupCde", {
        rules: [],
      });
      setFormItem("Insured.cTrdCde", {
        rules: [],
      });
    }
  },
  funcreset: () => {
    // 客户重置
    const param = opertaor.getParam();
    const tabref = opertaor.getTableRefs();
    const InsuredValue = tabref["insured"].getFromValue();
    for (const k in InsuredValue) {
      console.log("---", k);
      // 反洗钱不清空
      if (k !== "Applicant.cCustRiskRank" && k !== "Insured.cCustRiskRank") {
        InsuredValue[k] = null;
      }
    }
    if (!param.initFlag) {
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
    }

    tCertfDate.value = [];
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
            setValue("Insured.cOccupCde", data.cde + data.cnm);
            dialog.value?.handleClose();
          },
        },
      },
      {
        isOk: (selectdata: any) => { },
      },
      { title: "职业", width: 85 }
    );
  },
  tCertMrkChecked: (val) => {
    const param = opertaor.getParam();
    if (val == "1") {
      // setValue(
      //   "Insured.tCertfBgnDate",
      //   moment(new Date("2099-12-31")).format("YYYY-MM-DD HH:mm:ss")
      // );
      setValue(
        "Insured.tCertfEndDate",
        moment(new Date("2099-12-31")).format("YYYY-MM-DD HH:mm:ss")
      );
      if (!param.initFlag) {
        setFormItem("Insured.tCertfEndDate", { disabled: true });
      }
    } else {
      setValue("Insured.tCertfBgnDate", tCertfDate.value[0] || "");
      setValue("Insured.tCertfEndDate", tCertfDate.value[1] || "");
      if (!param.initFlag) {
        setFormItem("Insured.tCertfEndDate", { disabled: false });
      }
    }
  },
  mobileChange: (val) => {
    let cClntMrk =  getValue('Insured.cClntMrk'); // 法人  1个人  0法人
    if (cClntMrk &&  val) {
      setFormItem("Insured.cMobile", {
        rules: [getRules("required", {}), getRules("phoneNo", {})],
      });
      setFormItem("Insured.cTel", { rules: [getRules("phone", {})] });
    }
  },
  // 固定电话
  cTelChange: (val) => {
    let cClntMrk =  getValue('Insured.cClntMrk'); // 法人  1个人  0法人
    let cMobile = getValue('Insured.cMobile');  // 移动 

    if (cClntMrk =='0' && val && !cMobile) {
      setFormItem("Insured.cTel", {
        rules: [getRules("phone", {}), getRules("required", {})],
      });
      setFormItem("Insured.cMobile", { rules: getRules("phoneNo", {}) });
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
      setFormItem("Insured.cGreenIndustryList", { rules: null,  disabled: true, });
      setValue('Insured.cGreenIndustryList','')
    }
  },

  //证件类型change
  InsuredCCertfCls: (val: any) => {
    console.log(val)
    checkUser();
    const param = opertaor.getParam();
    console.log(param)
    if (!param.initFlag) {
      setFormItem("Insured.cNation", {
        disabled: false,
      });
      setFormItem("Insured.tBirthday", {
        disabled: false,
      });
      setFormItem("Insured.nAge", {
        disabled: false,
      });
      setFormItem("Insured.cSex", {
        disabled: false,
      });
    }

    if (val == "120001") {
      setValue('Insured.cCertfCde','')  //选身份证时清空
      setFormItem("Insured.cCertfCde", {
        rules: [getRules("required", {}), getRules("idCard", {})],
      });
      setFormItem("Insured.tCertfBgnDate", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.tCertfEndDate", {
        rules: [getRules("required", {})],
      });
      setValue("Insured.cNation", "1"); // 国籍
      if (!param.initFlag) {
        setFormItem("Insured.cNation", {
          disabled: true,
        });
        setFormItem("Insured.tBirthday", {
          disabled: true,
        });
        setFormItem("Insured.nAge", {
          disabled: true,
        });
        setFormItem("Insured.cSex", {
          disabled: true,
        });
        setFormItem("Insured.cTaxRegistrationNo", {
          disabled: false,
        
      });
      }
    } else if (val == "110002") {
      setFormItem("Insured.tCertfBgnDate", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.tCertfEndDate", {
        rules: [getRules("required", {})],
      });
    } else if (val == "110007") {
      setFormItem("Insured.tCertfBgnDate", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.tCertfEndDate", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.cCertfCde", {
        rules: [getRules("socialCode", {})],
      });

      // 为法人  企业成立日期
      setFormItem("Insured.tEstablishingDate", {
        rules: [getRules("required", {})],
      });

      // 税务登记证号
      setFormItem("Insured.cTaxRegistrationNo", {
          disabled: true,
      });



    } else {
      setFormItem("Insured.cCertfCde", {
        rules: [getRules("required", {}),getRules("passPort", {})],
      });
      setFormItem("Insured.tCertfBgnDate", { rules: null });
      setFormItem("Insured.tCertfEndDate", { rules: null });

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
  // 证件号码 change
  cCertfCdeChange: (val) => {
    checkUser();
    const tabref = opertaor.getTableRefs();

    const cCertfCls = tabref["insured"].getFromValue()["Insured.cCertfCls"];

    if (cCertfCls == "120001") {
      if (val) {
        const certfCde = tabref["insured"].getFromValue()["Insured.cCertfCde"];
        if (certfCde && certfCde.length === 18) {
          idAnalysis(certfCde)
        }
      }
    }else if(cCertfCls =='110007'){
      setValue('Insured.cTaxRegistrationNo',val)
    }
  },

  //注册地市是否同上
  isSameChange: (val) => {
    if (val == "1") {
      const ads = insuredEditRef?.value?.getValue("Insured.AllProp");
      const a =
        insuredEditRef?.value?.getValue("Insured.cRegisterSuffixAddr") || "";

      insuredEditRef?.value?.setValue("Insured.Prop", ads);
      insuredEditRef?.value?.setValue("Insured.cSuffixAddr", a);
    }
  },
  hidPerson: () => {
    // productStore.$state.cClntMrk == "0";
    // setFormItem("Insured.cCntrNme", { hidden: false });
  },
  //注册地址
  getProp: (val: any) => {
    setRegisterAdd();
  },
  //常住地址
  getAllProp: (val: any) => {
    setregistAdd();
  },
  //注册地址(input)
  getcSuffixAddr: (val: any) => {
    setRegisterAdd();
  },
  //常住地址(input)
  getcRegisterSuffixAddr: (val: any) => {
    setregistAdd();
  },
  // 读取身份证
  readIdCard: (val: any) => {
    fileInputRef.value?.click();
    fileInputType.value = "1";
  },
  // 读取外国人永久居留身份证
  readGreenCard: (val: any) => {
    fileInputRef.value?.click();
    fileInputType.value = "2";
  },
    // 单位性质
  cWorkDptChange:(val:any)=>{
      console.log('单位性质',val)
      if(val =='350'){
        setFormItem("Insured.cGcidCode", {
              rules: [getRules("required", {}),getRules("leiCode", {})],
            });
      }else if(val){
        setFormItem("Insured.cGcidCode", {
              rules: [getRules("leiCode", {})],
            });
      }
  },
    // 证件有效起期
  tCertfBgnDateDisable:(date:any)=>{
    const fs = insuredEditRef?.value?.getFromValue();
    if (JSON.stringify(fs) !== '{}') {
 
      const endDate = new Date(fs["Insured.tCertfEndDate"] || '')   // 结束时间 
      let minDate = dayjs(endDate).valueOf();
      return   date.getTime() > minDate
    }else{
        return true;
    }

  },
  // 证件有效止期
  tCertfEndDateDisable:(date:any)=>{
    const fs = insuredEditRef?.value?.getFromValue();
    if (JSON.stringify(fs) !== '{}') {
      const startDate = new Date(fs["Insured.tCertfBgnDate"] || '')   // 开始时间   

      let maxDate = dayjs(startDate).valueOf();
        return   date.getTime() < maxDate
    }else{
        return true;
    }
  }
};

function setregistAdd() {
  const ads = insuredEditRef?.value?.getValue("Insured.AllProp");
  const a =
    insuredEditRef?.value?.getValue("Insured.cRegisterSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        setAddressStr("Insured.cClntAddr", b);
      }
    });
  } else {
    setAddressStr("Insured.cClntAddr", a);
  }
}

function setRegisterAdd() {
  const ads = insuredEditRef?.value?.getValue("Insured.Prop");
  const a = insuredEditRef?.value?.getValue("Insured.cSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        setAddressStr("Insured.cRegisteredcapDre", b);
      }
    });
  } else {
    setAddressStr("Insured.cRegisteredcapDre", a);
  }
}

function setAddressStr(key: any, data: any) {
  insuredEditRef?.value?.setValue(key, data);
}

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
function handleFileChange(event: Event) {
  const fileInput = event.target as HTMLInputElement;
  if (fileInput.files && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    // 处理文件上传逻辑
    const param = {
      file: file,
      type: fileInputType.value,
    };
    readFile(param)
      .then((res: any) => {
        if (res.code === 200 && res.data && res.data.result) {
          tCertfDate.value = [];
          if (fileInputType.value === "1") {
            // 身份证
            const result = res.data.result.item_list;
            const keys = result.map((item: any) => item.key);
            let cardInfo = {};
            keys.forEach((key: any) => {
              const value = result.find((item: any) => item.key === key).value;
              cardInfo[key] = value;
            });
            console.log('身份证’，',cardInfo )
            if (cardInfo["id_number"])
              setValue("Insured.cCertfCde", cardInfo["id_number"]);
            
            if (cardInfo["name"])
              setValue("Insured.cInsuredNme", cardInfo["name"]);
            if (cardInfo["sex"])
              setValue("Insured.cSex", cardInfo["sex"] === "男" ? "1" : "2");
            if (cardInfo["date_of_birth"])
              setValue(
                "Insured.tBirthday",
                cardInfo["date_of_birth"]
                  .replace(/(年|月)/g, "-")
                  .replace("日", "")
              );
            if (cardInfo["validate_date"]) {
              tCertfDate.value = cardInfo["validate_date"].split("-");
              setValue(
                "Insured.tCertfBgnDate",
                cardInfo["validate_date"].split("-")[0]
              );
              if (cardInfo["validate_date"].split("-")[1] === "长期") {
                setValue("Insured.cLongendTyp", "1");
              } else {
                setValue("Insured.cLongendTyp", "0");
                setValue(
                  "Insured.tCertfEndDate",
                  cardInfo["validate_date"].split("-")[1]
                );
              }
            }
            setValue("Insured.cCertfCls", "120001");
            setValue("Insured.cClntMrk", "1");
              if (cardInfo["id_number"])
              idAnalysis(cardInfo["id_number"])
          }
          if (fileInputType.value === "2") {
            // 外国人永久居留身份证
            const cardInfo = res.data.result.details;
            setValue(
              "Insured.cCertfCde",
              cardInfo["id_number"]["value"] || null
            );
            setValue("Insured.cInsuredNme", cardInfo["name"]["value"] || null);
            setValue(
              "Insured.cSex",
              cardInfo["sex"]["value"]
                ? cardInfo["sex"]["value"].split("/")[0] === "男"
                  ? "1"
                  : "2"
                : null
            );
            setValue(
              "Insured.tBirthday",
              cardInfo["date_of_birth"]["value"]
                ? cardInfo["date_of_birth"]["value"].replace(".", "-")
                : null
            );
            if (cardInfo["period_of_validity"]["value"]) {
              tCertfDate.value =
                cardInfo["period_of_validity"]["value"].split("-");
              setValue("Insured.cLongendTyp", "0");
              setValue(
                "Insured.tCertfBgnDate",
                cardInfo["period_of_validity"]["value"].split("-")[0] || null
              );
              setValue(
                "Insured.tCertfEndDate",
                cardInfo["period_of_validity"]["value"].split("-")[1] || null
              );
            }
            setValue("Insured.cCertfCls", "19");
            setValue("Insured.cClntMrk", "1");
          }
          checkUser();
        }
      })
      .catch((err) => {
        ElMessage.error(err);
      });
    fileInputRef.value.value = ""; // 清空文件输入框的值
  }
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

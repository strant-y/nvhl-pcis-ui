<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="insuredEditRef" />
  <comDialog ref="dialog"></comDialog>
  <input type="file" ref="fileInputRef" style="display:none" @change="handleFileChange" />
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
import { getAddressStr } from "@/api/query";
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
import { useRoute } from "vue-router";
const route = useRoute();
const fileInputRef = ref(null);
const fileInputType = ref();
import { readFile } from "@/api/file";
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
  if (cProdNo === "040001" || cProdNo === "042002" || cProdNo === "043004" || cProdNo === "043005" || cProdNo === "043011") {
    setFormItem("Applicant.cTrdCde", { rules: null });
  }
  if(!cProdNo.startsWith("05")){
      setFormItem("Insured.cShareholderNature", { hidden: true, rules: null });
      setFormItem("Insured.cShareholderCode", { hidden: true, rules: null });
      setFormItem("Insured.cShareholderName", { hidden: true, rules: null });
      setFormItem("Insured.cShareholderCategory", { hidden: true, rules: null });
    }

    // 处理邮编 
    setFormItem("Insured.cZipCde", {  rules: [ getRules("signlessInt", {}), getRules("specifyLength", {len: 6})], });
    // 移动电话
    setFormItem("Insured.cMobile", { rules: [getRules("phoneNo", {})] });
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


    //  obj = {'Insured.cCertfCde':'9000000504'}
    // obj['Insured.cInsuredCde'] = '0008'
    // obj['Insured.cAppCde'] = '0009'

    //  tabref ['insured'].setFormValue(obj);
  }

  //  cClntMrk  被保人性质
  //  cAppNme  客户名称
  //  cCertfCde    身份号码
  //  cCertfCls   身份证类型

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
    const applicantValue2 = tabref["insured"].getFromValue();
    let insuredValue = {};
    console.log("applicant---data", applicantValue);
    console.log("insured----data", applicantValue2);

    for (const k in applicantValue) {
      switch (k) {


        case "Applicant.cAppCde":
          insuredValue["Insured.cInsuredCde"] = applicantValue[k];
          break;
        case "Applicant.cAppNme":
          insuredValue["Insured.cInsuredNme"] = applicantValue[k];
          break;


        case "Applicant.cCertfCde":
          insuredValue["Insured.cCertfCde"] = applicantValue[k];
          break;
        case "Applicant.cCertfCls":
          // insuredValue["Insured.cCertfCls"] = applicantValue[k];

          setTimeout(() => {
            setValue("Insured.cCertfCls", applicantValue[k]);
          }, 0)



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
        // case "Applicant.cCertfCls":
        //   insuredValue["Insured.cCertfCls"] = applicantValue[k];

        //   setValue("Insured.cCertfCls", "");
        //   break;
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

        case "Applicant.cSuffixAddr":
          insuredValue["Insured.cSuffixAddr"] = applicantValue[k];
          break;
        case "Applicant.cCustRiskRank":
          insuredValue["Insured.cCustRiskRank"] = applicantValue[k];
          break;
        case "Applicant.cRegisterCity":
          insuredValue["Insured.cRegisterCity"] = applicantValue[k];
          break;

        case "Applicant.cRegisterCountry":
          insuredValue["Insured.cRegisterCountry"] = applicantValue[k];
          break;
        case "Applicant.cRegisterCounty":
          insuredValue["Insured.cRegisterCounty"] = applicantValue[k];
          break;
        case "Applicant.cRegisterProvince":
          insuredValue["Insured.cRegisterProvince"] = applicantValue[k];
          break;
        case "Applicant.isSame":
          insuredValue["Insured.isSame"] = applicantValue[k];
          break;
        case "Applicant.cOccupCde":
          insuredValue["Insured.cOccupCde"] = applicantValue[k];
          break;
        case "Applicant.cGcidCode":
          insuredValue["Insured.cGcidCode"] = applicantValue[k];
          break;
        case "Applicant.cLegalRepresentative":
          insuredValue["Insured.cLegalRepresentative"] = applicantValue[k];
          break;
        case "Applicant.cRealnameAuthType":
          insuredValue["Insured.cRealnameAuthType"] = applicantValue[k];
          break;
        case "Applicant.cShareholderNature":
          insuredValue["Insured.cShareholderNature"] = applicantValue[k];
          break;
        case "Applicant.cMrgCde":
          insuredValue["Insured.cMrgCde"] = applicantValue[k];
          break;





        default:
          insuredValue[k] = applicantValue[k];
      }
    }

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
    const tabref = opertaor.getTableRefs();
    const InsuredValue = tabref["insured"].getFromValue();
    console.log('---------------', InsuredValue)
    checkUser();
    // val  0法人 1个人
    if (val == "0") {
   
      // setValue("Insured.cCertfCls", "");
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
        rules:null
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
      // 为法人 国民经济行业必填
      setFormItem("Insured.cTrdCde", {
        rules: [getRules("required", {})],
      });

        // 移动电话
        setFormItem("Insured.cMobile", { rules: [getRules("phoneNo", {}) ]});

      codeListStore
        .queryCodeList({
          codeListName: "UN_NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          if (!res.some(item => Object.values(item).includes(getValue("Insured.cCertfCls")))) {
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
        disabled: false,
        rules: [getRules("required", {})],
      });

      // cCntrNme 办理人  cOperaterCertfTyp办理证件  cOperaterCertfCde 办理人员证件号码  tOperaterCertfEndTm有效期
      setFormItem("Insured.cCntrNme", {
        hidden: true
      });
      setFormItem("Insured.cOperaterCertfTyp", {
        hidden: true
      });
      setFormItem("Insured.cOperaterCertfCde", {
        hidden: true
      });

      setFormItem("Insured.tOperaterCertfEndTm", {
        hidden: true
      });


    } else {

      setFormItem("Insured.cIsMicroEntpris", {
        disabled: true,
      });
      //是否个体工商户
      setFormItem("Insured.cIsIndvduBiz", {
        rules: [getRules("required", {})],
        disabled: false,
      });

      // 单位性质
      setFormItem("Insured.cWorkDpt", {  rules: null });


      //注册地址
      setFormItem("Insured.cRegisteredcapDre", { rules: null });

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
      // setValue("Insured.cCertfCls", "");
      setFormItem("Insured.cCntrNme", { rules: null });
      setFormItem("Insured.cCntrCertfCde", { rules: null });

      // 为法人 国民经济行业必填
      setFormItem("Insured.cTrdCde", {
        rules: null
      });
        // 是否分支机构
      setValue("Insured.cIsBranch", '1');

      // 个人 移动电话必填          
      setFormItem("Insured.cMobile", {
        rules: [getRules("required", {}),getRules("phoneNo", {})],
      });
      codeListStore
        .queryCodeList({
          codeListName: "NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          if (!res.some(item => Object.values(item).includes(getValue("Insured.cCertfCls")))) {
            setValue("Insured.cCertfCls", "");
          }
          setFormItem("Applicant.cCertfCls", {
            loadData: [],
          });
          setFormItem("Insured.cCertfCls", {
            loadData: res,
            rules: [getRules("required", {})],
          });
        });
      // 处理办理人
      setFormItem("Insured.cCntrNme", {
        hidden: false
      });
      setFormItem("Insured.cOperaterCertfTyp", {
        hidden: false
      });
      setFormItem("Insured.cOperaterCertfCde", {
        hidden: false
      });

      setFormItem("Insured.tOperaterCertfEndTm", {
        hidden: false
      });

    }
  },
  //大股东性质change事件
  funcShareholderNature:(val)=>{
    if(val=='1'){
      // setFormItem("Insured.cShareholderNature", {
      //   rules: [getRules("required", {})],
      // });
      codeListStore
        .queryCodeList({
          codeListName: "NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          if (!res.some(item => Object.values(item).includes(getValue("Insured.cShareholderCategory")))) {
            setValue("Insured.cShareholderCategory", "");
          }
          setFormItem("Insured.cShareholderCategory", {
            loadData: [],
          });
          setFormItem("Insured.cShareholderCategory", {
            loadData: res,
          });
        });
    }else{
      codeListStore
        .queryCodeList({
          codeListName: "UN_NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          if (!res.some(item => Object.values(item).includes(getValue("Insured.cShareholderCategory")))) {
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
    console.log('111',val)
    if (val == '1') {
      setFormItem("Insured.cOccupCde", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.cTrdCde", {
        rules: [getRules("required", {})],
      });
    } else {
      setFormItem("Insured.cOccupCde", {
        rules: [],
      });
      setFormItem("Insured.cTrdCde", {
        rules: []
      });
    }
  },
  funcreset: () => {
    // 客户重置
    console.log(112)
    const tabref = opertaor.getTableRefs();
    const InsuredValue = tabref["insured"].getFromValue();
    for (const k in InsuredValue) {
      console.log('---',k)
        // 反洗钱不清空
        if(k !== 'Applicant.cCustRiskRank' && k !== 'Insured.cCustRiskRank'){
                                                     
          InsuredValue[k] = null;
        }
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
    tCertfDate.value = []
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
        isOk: (selectdata: any) => { },
      },
      { title: "职业", width: 85 }
    );
  },
  tCertMrkChecked: (val) => {

    if (val == "1") {
      // setValue(
      //   "Insured.tCertfBgnDate",
      //   moment(new Date("2099-12-31")).format("YYYY-MM-DD HH:mm:ss")
      // );
      setValue(
        "Insured.tCertfEndDate",
        moment(new Date("2099-12-31")).format("YYYY-MM-DD HH:mm:ss")
      );
      setFormItem("Insured.tCertfEndDate", { disabled: true, });
    } else {
      setValue("Insured.tCertfBgnDate", tCertfDate.value[0] || "");
      setValue("Insured.tCertfEndDate", tCertfDate.value[1] || "");
      setFormItem("Insured.tCertfEndDate", { disabled: false, });
    }
  },
  mobileChange: (val) => {
    if (val) {
      setFormItem("Insured.cMobile", { rules: [getRules("required", {}),getRules("phoneNo", {})] });
      setFormItem("Insured.cTel", { rules: [getRules('phone',{}) ]});
    }
  },
  // 固定电话
  cTelChange:(val)=>{
    console.log(val, '11')
    if (val) {
      setFormItem("Insured.cTel", { rules: [getRules('phone',{}),getRules("required", {})]});
      setFormItem("Insured.cMobile",  { rules: getRules("phoneNo", {})});
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
  InsuredCCertfCls: (val: any) => {
    checkUser();
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
      setValue("Insured.cNation", '1');  // 国籍
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
      setFormItem("Insured.tCertfBgnDate",  { rules :null});
      setFormItem("Insured.tCertfEndDate",  { rules :null});

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
  // 身份号码 change
  cCertfCdeChange: (val) => {
    checkUser();
    const tabref = opertaor.getTableRefs();

    const cCertfCls = tabref["insured"].getFromValue()['Insured.cCertfCls'];

    if (cCertfCls == '120001') {
      if (val) {
        const certfCde = tabref["insured"].getFromValue()["Insured.cCertfCde"];
        if (certfCde && certfCde.length === 18) {
          const birthYear = parseInt(certfCde.substring(6, 10), 10);
          const birthMonth = parseInt(certfCde.substring(10, 12), 10);
          const birthDay = parseInt(certfCde.substring(12, 14), 10);
          const birthday = `${birthYear}-${birthMonth.toString().padStart(2, "0")}-${birthDay.toString().padStart(2, "0")}`;
          const sexCode = parseInt(certfCde.substring(16, 17), 10);
          const sex = sexCode % 2 === 0 ? "2" : "1"; // 1: 男, 2: 女
          const age = new Date().getFullYear() - birthYear;

          setValue("Insured.cNation", '1');  // 国籍
          setValue("Insured.tBirthday", birthday);
          setValue("Insured.nAge", age);
          setValue("Insured.cSex", sex);
        }
      }
    }
  },



  //注册地市是否同上
  isSameChange: (val) => {
    if (val == "1") {
      const ads = insuredEditRef?.value?.getValue('Insured.AllProp');
      const a = insuredEditRef?.value?.getValue("Insured.cRegisterSuffixAddr") || "";

      insuredEditRef?.value?.setValue('Insured.Prop', ads);
      insuredEditRef?.value?.setValue('Insured.cSuffixAddr', a);
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
};

function setregistAdd() {
  const ads = insuredEditRef?.value?.getValue('Insured.AllProp');
  const a = insuredEditRef?.value?.getValue("Insured.cRegisterSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data['addStr'] : "") + a;
        setAddressStr("Insured.cClntAddr", b);
      }
    });
  } else {
    setAddressStr("Insured.cClntAddr", a);
  }
}

function setRegisterAdd() {
  const ads = insuredEditRef?.value?.getValue('Insured.Prop');
  const a = insuredEditRef?.value?.getValue("Insured.cSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data['addStr'] : "") + a;
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
    }
    readFile(param).then((res:any) => {
      if(res.code === 200 && res.data && res.data.result) {
        tCertfDate.value = []
        if(fileInputType.value === "1") {// 身份证
          const result = res.data.result.item_list;
          const keys = result.map((item:any) => item.key);
          let cardInfo = {};
          keys.forEach((key:any) => {
            const value = result.find((item:any) => item.key === key).value;
            cardInfo[key] = value;
          });
          if(cardInfo['id_number']) setValue("Insured.cCertfCde", cardInfo['id_number']);
          if(cardInfo['name']) setValue("Insured.cInsuredNme", cardInfo['name']);
          if(cardInfo['sex']) setValue("Insured.cSex", cardInfo['sex'] === '男' ? '1':'2');
          if(cardInfo['date_of_birth']) setValue("Insured.tBirthday", cardInfo['date_of_birth'].replace(/(年|月)/g,'-').replace('日',''));
          if(cardInfo['validate_date']) {
            tCertfDate.value = cardInfo['validate_date'].split("-")
            setValue("Insured.tCertfBgnDate", cardInfo['validate_date'].split("-")[0]);
            if(cardInfo['validate_date'].split("-")[1] === "长期") {
              setValue("Insured.cLongendTyp", "1")
            } else {
              setValue("Insured.cLongendTyp", "0")
              setValue("Insured.tCertfEndDate", cardInfo['validate_date'].split("-")[1]);
            }
          } 
          setValue("Insured.cCertfCls", '120001');
          setValue("Insured.cClntMrk", '1');
        }
        if(fileInputType.value === "2") {// 外国人永久居留身份证
          const cardInfo = res.data.result.details;
          setValue("Insured.cCertfCde", cardInfo['id_number']['value'] || null);
          setValue("Insured.cInsuredNme", cardInfo['name']['value'] || null);
          setValue("Insured.cSex", cardInfo['sex']['value'] ? cardInfo['sex']['value'].split('/')[0] === '男' ? '1':'2' : null);
          setValue("Insured.tBirthday", cardInfo['date_of_birth']['value'] ? cardInfo['date_of_birth']['value'].replace('.','-') : null);
          if(cardInfo['period_of_validity']['value']) {
            tCertfDate.value = cardInfo['period_of_validity']['value'].split("-")
            setValue("Insured.cLongendTyp", "0")
            setValue("Insured.tCertfBgnDate", cardInfo['period_of_validity']['value'].split("-")[0] || null);
            setValue("Insured.tCertfEndDate", cardInfo['period_of_validity']['value'].split("-")[1] || null);
          }
          setValue("Insured.cCertfCls", '19');
          setValue("Insured.cClntMrk", '1');
        }
      }
    }).catch(err => {
      ElMessage.error(err);
    })
    fileInputRef.value.value = ''; // 清空文件输入框的值
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

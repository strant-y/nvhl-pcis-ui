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
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
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
import { getAddressStr,qryCustomer } from "@/api/query";
const formconfig1 = reactive(createAppFreeEditConfig({}));
const formData = ref<any[]>([]);
const cClntAddr = ref<any>(null);
import { useRoute } from "vue-router";
const route = useRoute();
const fileInputRef = ref(null);
const fileInputType = ref();
import { readFile } from "@/api/file";
import moment from "moment/moment";
const tCertfDate = ref<any[]>([]);
const idxParam = inject('idxParam');
const formPage = idxParam?.formPage;
const initFlag = computed(() => formPage.init);
const  cWorkDptList =['310','320','330','340','350','360']  // 单位性质带企业的ID
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
    setFormItem("ECargoApplicant.cIsMicroEntpris", {
      rules: null,
      disabled: true,
    });
    // 处理邮编
    setFormItem("ECargoApplicant.cZipCde", {
      rules: [
        getRules("signlessInt", {}),
        getRules("specifyLength", { len: 6 }),
      ],
    });
    //移动手机校验
    setFormItem("ECargoApplicant.cMobile", { rules: [getRules("phoneNo", {})] });
    // 传真校验
    setFormItem("ECargoApplicant.cFax", { rules: [getRules("faxNumber", {})] });

    setFormItem("ECargoApplicant.cGreenIndustryCustomers",{disabled: true});
    setFormItem("ECargoApplicant.cGreenIndustryList",{disabled: true});
    if(!getValue('ECargoApplicant.cCustRiskRank')){
      setValue('ECargoApplicant.cCustRiskRank','925104')
    }
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
  // 客户重置
  funcreset: () => {
    const applicantValue = getFormValue();
    for (const k in applicantValue) {
      // 反洗钱不清空
      if (k !== "ECargoApplicant.cCustRiskRank") {
        applicantValue[k] = null;
      }
    }
    if (!initFlag.value) {
      setFormItem("ECargoApplicant.cAppNme", {
        disabled: false,
      });
      setFormItem("ECargoApplicant.cClntMrk", {
        disabled: false,
      });
      setFormItem("ECargoApplicant.cCertfCls", {
        disabled: false,
      });
      setFormItem("ECargoApplicant.cCertfCde", {
        disabled: false,
      });
    }
    setFormValue(applicantValue);
  },
  ApplicantIsGreen:(val:any)=>{
    if(val === '1' && !idxParam.readonly){
      setFormItem('ECargoApplicant.cGreenIndustryList',{rules: [getRules("required", {})],disabled: false })
    }else {
      setFormItem('ECargoApplicant.cGreenIndustryList',{rules: null,disabled: true })
    }
  },
  //注册地市是否同上
   isSameChange : (val:any) => {
    if (val == "1") {
      const ads = getValue("ECargoApplicant.Prop");
      const a = getValue("ECargoApplicant.cSuffixAddr") || "";
      const b = getValue("ECargoApplicant.cClntAddr") || '';

      setValue("ECargoApplicant.RegisterProp", ads);
      setValue("ECargoApplicant.cRegisterSuffixAddr", a);
      setValue("ECargoApplicant.cRegisteredcapDre", b);
    }
  },
  tCertMrkChecked:(val:any)=>{
    if (val == "1") {
      setValue(
          "ECargoApplicant.tCertfEndDate",
          moment(new Date("2099-12-31")).format("YYYY-MM-DD HH:mm:ss")
      );
      setFormItem("ECargoApplicant.tCertfEndDate", { disabled: true });

    } else {
        setValue("ECargoApplicant.tCertfEndDate", "");
       setFormItem("ECargoApplicant.tCertfEndDate", { disabled: false });
    }
  },
  // func demo
  funcquery: () => {},
  // 客户姓名
  funCheckUser:()=>{
		checkUser();
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
  // 证件号码change
  cCertfCdeChange: (val) => {
    const cCertfCls = formPage.getFormDataById("AgreementApplicant")["ECargoApplicant.cCertfCls"];
    console.log(cCertfCls,"cCertfCls")
    if (cCertfCls == "120001") {
      if (val) {
        const certfCde = applicantEditRef.value?.getValue(
          "ECargoApplicant.cCertfCde"
        );
        if (certfCde && certfCde.length === 18) {
            // idAnalysis(val)
        }
      }
    }
    checkUser();
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
           // setValue("ECargoApplicant.cTrdCde", data.cnm);
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
  //常住地址
  getCountry: (val: any,row:any) => {
    setregistAdd();
  },
  //常住地址(input)
  getcSuffixAddr: (val: any) => {
    setregistAdd();
  },
  
  //注册地址
  getAllProp: (val: any) => {
    setRegisterAdd();
  },
  //注册地址(input)
  getcRegisterSuffixAddr: (val: any) => {
    setRegisterAdd();
  },
  funcShareholderNature:(val:any)=>{
    if (val == "0") {
      codeListStore
          .queryCodeList({
            codeListName: "UN_NATURAL_CERTIFICATE_CACHE",
            codeListParam: {},
          })
          .then((res) => {
            if (
                !res.some((item) =>
                    Object.values(item).includes(getValue("ECargoApplicant.cCertfCls"))
                )
            ) {
              setValue("ECargoApplicant.cShareholderCategory", "");
            }
            setFormItem("ECargoApplicant.cShareholderCategory", {
              loadData: [],
            });
            setFormItem("ECargoApplicant.cShareholderCategory", {
              loadData: res,
              rules: [getRules("required", {})],
            });
          });
    }else {
      codeListStore
          .queryCodeList({
            codeListName: "NATURAL_CERTIFICATE_CACHE",
            codeListParam: {},
          })
          .then((res) => {
            if (
                !res.some((item) =>
                    Object.values(item).includes(getValue("ECargoApplicant.cCertfCls"))
                )
            ) {
              setValue("ECargoApplicant.cShareholderCategory", "");
            }
            setFormItem("ECargoApplicant.cShareholderCategory", {
              loadData: [],
            });
            setFormItem("ECargoApplicant.cShareholderCategory", {
              loadData: res,
              rules: [getRules("required", {})],
            });
          });
    }
  },
  cIsBranch:(val:any)=>{
    //ECargoApplicant.cClntMrk 投保人性质 ，ECargoApplicant.cIsBranch 分支机构  ECargoApplicant.cWorkDpt 企业单位性质
    if ( (getValue('ECargoApplicant.cClntMrk') && getValue('ECargoApplicant.cClntMrk') === '0') && (getValue('ECargoApplicant.cIsBranch') && getValue('ECargoApplicant.cIsBranch') === '0') && (getValue('ECargoApplicant.cWorkDpt') && ['310','320','330','340','350','360'].includes(getValue('ECargoApplicant.cWorkDpt')))){
      setFormItem("ECargoApplicant.nRegisteredCapital", {
        rules: [getRules("required", {})],
      });
    }else {
      setFormItem("ECargoApplicant.nRegisteredCapital", {
        rules: null
      });
    }
  },
  cWorkDptChange:(val:any)=>{
    //ECargoApplicant.cClntMrk 投保人性质 ，ECargoApplicant.cIsBranch 分支机构  ECargoApplicant.cWorkDpt 企业单位性质
    if ( (getValue('ECargoApplicant.cClntMrk') && getValue('ECargoApplicant.cClntMrk') === '0') && (getValue('ECargoApplicant.cIsBranch') && getValue('ECargoApplicant.cIsBranch') === '0') && (getValue('ECargoApplicant.cWorkDpt') && ['310','320','330','340','350','360'].includes(getValue('ECargoApplicant.cWorkDpt')))){
      setFormItem("ECargoApplicant.nRegisteredCapital", {
        rules: [getRules("required", {})],
      });
    }else {
      setFormItem("ECargoApplicant.nRegisteredCapital", {
        rules: null
      });
    }
  },
	//投保人性质(0是法人 1是个人)
  InsureChange: async (val:any) => {
    console.log('vvvvvvv',val)
    const param = opertaor.getParam();

    if (val == "0") {
      if ( (getValue('ECargoApplicant.cClntMrk') && getValue('ECargoApplicant.cClntMrk') === '0') && (getValue('ECargoApplicant.cIsBranch') && getValue('ECargoApplicant.cIsBranch') === '0') && (getValue('ECargoApplicant.cWorkDpt') && ['310','320','330','340','350','360'].includes(getValue('ECargoApplicant.cWorkDpt')))){
        setFormItem("ECargoApplicant.nRegisteredCapital", {
          rules: [getRules("required", {})],
        });
      }else {
        setFormItem("ECargoApplicant.nRegisteredCapital", {
          rules: null
        });
      }
      setFormItem("ECargoApplicant.tBirthday", {
        rules: null
      });
      setFormItem("ECargoApplicant.nAge", {
        rules: null
      });
      setFormItem("ECargoApplicant.cSex", {
        rules: null
      });
      // ECargoApplicant.cWorkDpt
      productStore.setcClntMrk(val);
      // 办理人
      setFormItem("ECargoApplicant.cCntrNme", { rules: [getRules("required", {})] });
      setFormItem("ECargoApplicant.tOperaterCertfEndTm", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.cOperaterCertfTyp", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.cOperaterCertfCde", {
        rules: [getRules("required", {})],
      });

      setFormItem("ECargoApplicant.cParticiinsocTyp", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.cCntrCertfCde", {
        rules: [getRules("required", {})],
      });

      
      if (!param.initFlag && !idxParam.readonly) {
        setFormItem("ECargoApplicant.cWorkDpt", {
        disabled: false,
      });
      setFormItem("ECargoApplicant.cIsMicroEntpris", {
        disabled: false,
      });
      // setFormItem("ECargoApplicant.cIsIndvduBiz", {
      //   disabled: true,
      // });
      // 是否绿色产业客户
      setFormItem("ECargoApplicant.cGreenIndustryCustomers", {
        disabled: false,
      });
      }
      setFormItem("ECargoApplicant.cWorkDpt", {
        rules: [getRules("required", {})],
      });
      // 是否绿色产业客户
      setFormItem("ECargoApplicant.cGreenIndustryCustomers", {
        rules: [getRules("required", {})],
      });

      // 参加社会统筹标志
      setFormItem("ECargoApplicant.cParticiinsocTyp", {
        rules: [getRules("required", {})],
      });
      //注册地址
      setFormItem("ECargoApplicant.cRegisteredcapDre", {
        rules: [getRules("required", {})],
      });
 
      //实名认证方式
      let cWorkDpt = getValue('ECargoApplicant.cWorkDpt')
      if(cWorkDptList.includes(cWorkDpt)){
          setFormItem("ECargoApplicant.cRealnameAuthType", {
            rules: [getRules("required", {})],
          });
      }else{
          setFormItem("ECargoApplicant.cRealnameAuthType", {
            rules: [],
          });
      }
   		// 是否个体工商户
      setFormItem("ECargoApplicant.cIsIndvduBiz", {rules: []});
      // setValue("ECargoApplicant.cIsIndvduBiz", "");

 
   
      let cMobile = getValue('ECargoApplicant.cMobile');  // 移动 
      let cTel = getValue('ECargoApplicant.cTel');  // 固定电话    
      if(!cMobile &&  !cTel ){
         setFormItem("ECargoApplicant.cMobile", {
          rules: [getRules("required", {}), getRules("phoneNo", {})],
        });
      }else  if(cMobile){
        setFormItem("ECargoApplicant.cTel", { rules: [getRules("phone", {})] });
        setFormItem("ECargoApplicant.cMobile", { rules: [getRules("required", {}), getRules("phoneNo", {})]})
      } else if(cTel){
        setFormItem("ECargoApplicant.cTel", { rules: [getRules("required", {}),getRules("phone", {})] });
        setFormItem("ECargoApplicant.cMobile", { rules: [ getRules("phoneNo", {})]})
      }
         // 为法人 国民经济行业必填
      setFormItem("ECargoApplicant.cTrdCde", {
        rules: [getRules("required", {})],
      });

      // 性别 、年龄、生日个人必填
      setFormItem("ECargoApplicant.tBirthday", {
        rules: [],
      });
      setFormItem("ECargoApplicant.nAge", {
      rules: [],
      });
      setFormItem("ECargoApplicant.cSex", {
        rules: [],
      });


           codeListStore
        .queryCodeList({
          codeListName: "UN_NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          if (
            !res.some((item) =>
              Object.values(item).includes(getValue("ECargoApplicant.cCertfCls"))
            )
          ) {
            setValue("ECargoApplicant.cCertfCls", "");
          }
          setFormItem("ECargoApplicant.cCertfCls", {
            loadData: [],
          });
          setFormItem("ECargoApplicant.cCertfCls", {
            loadData: res,
            rules: [getRules("required", {})],
          });
        });
    } else {
      setFormItem("ECargoApplicant.tBirthday", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.nAge", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.cSex", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.cWorkDpt", { rules: null });
      setFormItem("ECargoApplicant.cIsMicroEntpris", {
        disabled: true,
      });
      //参加社会统筹标志
      setFormItem("ECargoApplicant.cParticiinsocTyp", {
        rules: null,
      });
      //注册地址
      setFormItem("ECargoApplicant.cRegisteredcapDre", { rules: null });
      //是否个体工商户
      // setFormItem("ECargoApplicant.cIsIndvduBiz", {
      //   disabled: false,
      // });
      // 是否绿色产业客户
      setFormItem("ECargoApplicant.cGreenIndustryCustomers", {
        rules: null,
        disabled: true,
      });

         // 是否绿色详情
      setFormItem("ECargoApplicant.cGreenIndustryList", {
        rules: null,
        disabled: true,
      });
      setValue("ECargoApplicant.cGreenIndustryCustomers", "");
      setValue("ECargoApplicant.cGreenIndustryList", "");

      // 为法人  企业成立日期
      setFormItem("ECargoApplicant.tEstablishingDate", {
        rules: null,
      });
 
      setValue("ECargoApplicant.cIsMicroEntpris", "");
      //是否分支机构
      setValue("ECargoApplicant.cIsBranch", "1");

      setFormItem("ECargoApplicant.cCntrNme", { rules: null });
      setFormItem("ECargoApplicant.tOperaterCertfEndTm", { rules: null });
      setFormItem("ECargoApplicant.cOperaterCertfTyp", { rules: null });
      setFormItem("ECargoApplicant.cOperaterCertfCde", { rules: null });

      setFormItem("ECargoApplicant.cCntrCertfCde", { rules: null });


      // 国民行业分类  
      const cProdNo = param.cProdNo;
      if (
      cProdNo === "040001" ||
      cProdNo === "042002" ||
      cProdNo === "043004" ||
      cProdNo === "043005" ||
      cProdNo === "043011"
    ) {
      setFormItem("ECargoApplicant.cTrdCde", { rules: [getRules("required", {})], });
      
    }else{
      setFormItem("ECargoApplicant.cTrdCde", {
        rules: [],
      });
    }
    

      //实名认证方式
      setFormItem("ECargoApplicant.cRealnameAuthType", {
        rules: [],
      });

      // 个人 移动电话必填  
      setFormItem("ECargoApplicant.cMobile", {
        rules: [ getRules("required", {}), getRules("phoneNo", {})],
      });
      setFormItem("ECargoApplicant.cTel", { rules: [getRules("phone", {})] });
      setFormItem("ECargoApplicant.cIsIndvduBiz", {
        rules: [getRules("required", {})],
      });

      // 性别 、年龄、生日个人必填
      setFormItem("ECargoApplicant.tBirthday", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.nAge", {
      rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.cSex", {
        rules: [getRules("required", {})],
      });

      codeListStore
        .queryCodeList({
          codeListName: "NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          if (
            !res.some((item) =>
              Object.values(item).includes(getValue("ECargoApplicant.cCertfCls"))
            )
          ) {
            setValue("ECargoApplicant.cCertfCls", "");
          }
          setFormItem("ECargoApplicant.cCertfCls", {
            loadData: [],
          });
          setFormItem("ECargoApplicant.cCertfCls", {
            loadData: res,
            rules: [getRules("required", {})],
          });
        });
    }

      checkUser();
  },
	// 证件类型
	cardTypeChange: (val:any) => {
    checkUser();
    // 清除报错信息
    clearValidate('ECargoApplicant.cCertfCde')  
      // freeEditRef.value?.clearValidate('phoneNo');
    const param = opertaor.getParam();

    if (!param.initFlag) {
      setFormItem("ECargoApplicant.cNation", {
        disabled: false,
      });
      setFormItem("ECargoApplicant.tBirthday", {
        disabled: false,
      });
      setFormItem("ECargoApplicant.nAge", {
        disabled: false,
      });
      setFormItem("ECargoApplicant.cSex", {
        disabled: false,
      });
    }

    if (val == "120001") { 
      
      // setValue('ECargoApplicant.cCertfCde','')  //选身份证时清空
      setFormItem("ECargoApplicant.cCertfCde", {
        rules: [getRules("required", {}), getRules("idCard", {})],
      });
      setFormItem("ECargoApplicant.tCertfBgnDate", {
        rules: [getRules("required", {})],
      });

      setFormItem("ECargoApplicant.tCertfEndDate", {
        rules: [getRules("required", {})],
      });

      setValue("ECargoApplicant.cNation", "1"); // 国籍
      // setValue("ECargoApplicant.tBirthday", null);
      // setValue("ECargoApplicant.nAge", null);
      // setValue("ECargoApplicant.cSex", null);

      if (!param.initFlag) {
        setFormItem("ECargoApplicant.cNation", {
          disabled: true,
        });
        setFormItem("ECargoApplicant.tBirthday", {
          disabled: true,
        });
        setFormItem("ECargoApplicant.nAge", {
          disabled: true,
        });
        setFormItem("ECargoApplicant.cSex", {
          disabled: true,
        });
      }
    } else if (val == "110002") {
      setFormItem("ECargoApplicant.tCertfEndDate", {
        rules: [getRules("required", {})],
      });
        //证件类型是“营业执照”，参加社会统筹标志变化为必填
        // 参加社会统筹标志
        setFormItem("ECargoApplicant.cParticiinsocTyp", {
          rules: [getRules("required", {})],
        });
        
    } else if ( val == "110007") {   
      setFormItem("ECargoApplicant.tCertfBgnDate", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.tCertfEndDate", {
        rules: [getRules("required", {})],
      });

      // 统一社会信用代码校验
        setFormItem("ECargoApplicant.cCertfCde", {
        rules: [getRules("required", {}),getRules("socialCode", {})],
      });

            // 为法人  企业成立日期
      setFormItem("ECargoApplicant.tEstablishingDate", {
        rules: [getRules("required", {})],
      });
    } else if(val == "19"){
      // 外国人证件号
      setFormItem("ECargoApplicant.cCertfCde", {
        rules: [getRules("required", {}),getRules("ariCard", {})],
      });
    } else {
      setFormItem("ECargoApplicant.cCertfCde", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.tCertfBgnDate", { rules: null });
      setFormItem("ECargoApplicant.tCertfEndDate", { rules: null });
      // 参加社会统筹标志
      setFormItem("ECargoApplicant.cParticiinsocTyp", {
        rules: null,
      });
    }
  },
};


//  根据 客户名称 / 被保人性质/ 证件类型 / 证件号码 获取客户信息
const checkUser = () => {
  // 自定义录单 方案配置 模版 进入 可以查询用户信息  
  // if (param.pageType !== "app" &&  param.pageType !== "copy" && param.pageType !== "template" && param.cAppStatus !=='1') {
  //   return false;
  // }
const applicantValue = formPage.getFormDataById("AgreementApplicant")
//  只要4个有值 去请求客户信息
if (
  applicantValue["ECargoApplicant.cAppNme"]&&
  applicantValue["ECargoApplicant.cClntMrk"] !== null &&
  applicantValue["ECargoApplicant.cCertfCde"] &&
  applicantValue["ECargoApplicant.cCertfCls"]
) {
  const param = {
    coustName: applicantValue["ECargoApplicant.cAppNme"],
    coustMrk: applicantValue["ECargoApplicant.cClntMrk"],
    coustType:applicantValue["ECargoApplicant.cCertfCls"],
    coustCode: applicantValue["ECargoApplicant.cCertfCde"],
    personnelType:"ECargoApplicant"
    // personnelType:"Applicant"
  }
  qryCustomer(param)
    .then((res:any) => {
      const { code, data, msg } = res;
      if (200 === code) {
        if(data){
          console.log('客户数据', data)
					const result:any = {};
  				// for (const key in data[0]) {
					// 	if (data[0].hasOwnProperty(key)) {
							// 仅替换以 "Applicant." 开头的键
							// if (key.startsWith('Applicant.')) {
							// 	const newKey = key.replace('Applicant.', 'ECargoApplicant.');
							// 	result[newKey] = data[0][key];
							// } else {
							// 	result[key] = data[0][key];
							// }
					// 	}
					// }
					Object.keys(result).forEach((key) => { 
						if(result[key]){
							setValue(key, result[key]);
						}
					});
          
          setValue('ECargoApplicant.cAppCde', data[0]['ECargoApplicant.cCargoAppCde']);
          let userId = getValue('ECargoApplicant.cCertfCde')
          idAnalysis(userId)
        }
      } else {
        // ElMessage.error(msg);
      }
    })
    .finally(() => {});
  }
};
// 解析身份证
const idAnalysis = (id:string)=>{
      const applicantValue = formPage.getFormDataById("AgreementApplicant") //tabref["AgreementApplicant"].getFormValue();
      if (  id.length !== 18 || (applicantValue["ECargoApplicant.cCertfCls"] !=='120001' && applicantValue["ECargoApplicant.cCertfCls"] !=='19')) {
        return false
      }
          const birthYear = parseInt(id.substring(6, 10), 10);
          const birthMonth = parseInt(id.substring(10, 12), 10);
          const birthDay = parseInt(id.substring(12, 14), 10);
          const birthday = `${birthYear}-${birthMonth.toString().padStart(2, "0")}-${birthDay.toString().padStart(2, "0")}`;
          const sexCode = parseInt(id.substring(16, 17), 10);
          const sex = sexCode % 2 === 0 ? "2" : "1"; // 1: 男, 2: 女
          const age = new Date().getFullYear() - birthYear;

          setValue("ECargoApplicant.cNation", "1"); // 国籍
          setValue("ECargoApplicant.tBirthday", birthday);
          setValue("ECargoApplicant.nAge", age);
          setValue("ECargoApplicant.cSex", sex);
         
          clearValidate('ECargoApplicant.cCertfCde')  
}
function setregistAdd() {
  const ads = applicantEditRef?.value?.getValue("ECargoApplicant.Prop");
  const a = applicantEditRef?.value?.getValue("ECargoApplicant.cSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        setAddressStr("ECargoApplicant.cClntAddr", b);
      }
    });
  } else {
    setAddressStr("ECargoApplicant.cClntAddr", a);
  }
}

function setRegisterAdd() {
  const ads = applicantEditRef?.value?.getValue("ECargoApplicant.RegisterProp");
  const a = applicantEditRef?.value?.getValue("ECargoApplicant.cRegisterSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        console.log(b);
        setAddressStr("ECargoApplicant.cRegisteredcapDre", b);
      }
    });
  } else {
    setAddressStr("ECargoApplicant.cRegisteredcapDre", a);
  }
}

function clearValidate(key:any=null) {
  applicantEditRef?.value?.clearValidate(key);
}
function setAddressStr(key: any, data: any) {
  applicantEditRef?.value?.setValue(key, data);
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
function addProvide<T>(key: InjectionKey<T> | string, value: T)  {
  applicantEditRef?.value?.addProvide(key, value);
}
defineExpose({
  getFormValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormConfig,
  setDisabledAll,
  addProvide
});
</script>

<style scoped></style>

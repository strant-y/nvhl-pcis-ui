<template>
  <div>
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
		<comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
import { qryCustomer } from "@/api/query";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { createFreeButtonBase } from "@/shared/button-config";
import { codeListViewStore, dataOpertaor } from "@/store";
import {getAddressStr} from "@/api/query";
// import {FormPage} from "@/views/protocolManagement/utils/form-page";
import moment from "moment";
const dialog = ref<DialogMethod | null>(null);
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import cargoApi from "@/api/cargo";
import {ElMessage} from "element-plus";
import {ref} from "vue";
import {useValidator} from "@/typings/useValidator";
import dayjs from "dayjs";
import { setCapitalRequiredRule, disablePastDates } from "@/utils/InsuranceCoverageRules";
import { rule } from "postcss";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const { getRules } = useValidator();
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const cWorkDptList = ['310', '320', '330', '340', '350', '360']  // 单位性质带企业的ID
const props = defineProps({ 
  data: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
  handleQuery: {
    type: Function,
    required: false,
  },
  rowData: {
    type: Object,
    default: () => ({}),
  },
});

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const params = opertaor.getParam();
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);

const getCComponentTable = () => {
    return 'InsuredDist';
};
const cComponentTable = getCComponentTable();

// const dataParams = ref({});
const emits = defineEmits(["handleClose"]);
const formconfig1 = ref<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "新增信息",
    fromSchema: [],
    fromUi: createFromUiConfig(props.data.fromUi),
    titleBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "确定",
        func: async () => {
          const isValid = await freeEditRef.value?.validate();
          if(isValid){
            const s = freeEditRef.value?.getFromValue();
            if(typeof props.method.isOk == 'function'){
              props.method.isOk(s);
              emits("handleClose");
              return;
            }
          }
        },
      }),
      createFreeButtonBase({
        label: "取消",
        func: () => {
          emits("handleClose");
        },
      }),
    ],
  })
);

const rateDetail = ref({
  cExchCde: '1',
  nAmtExch:[],
  cPrmCur:[]
})

const init = ref(true)
const toFixTwo = (val:any)=> parseFloat(val.toFixed(2))
onMounted(async  () => {
  // dataParams.value = formPage.getAllFormData();

  let newSchema = [];

  for(let i = 0; props.data.fromSchema && i < props.data.fromSchema.length; i++){

    let item = JSON.parse(JSON.stringify(props.data.fromSchema[i]));
    if (props.data.fromSchema[i]["tableClick"]) {
      item["tableClick"] = props.data.fromSchema[i]["tableClick"];
    }
    if(['InsuredDist.tCertfBgnDate'].includes(item.prop)) {
      item["disabledDate"] = tCertfBgnDateDisable;
    }
    if(['InsuredDist.tCertfEndDate'].includes(item.prop)) {
      item["disabledDate"] = tCertfEndDateDisable;
    }
    if(['InsuredDist.cInsuredNme'].includes(item.prop)) {
      item["func"] = funCheckUser;
    }
    if(['InsuredDist.cCertfCls'].includes(item.prop)) {
      item["func"] = InsuredCCertfCls;
    }
    if(['InsuredDist.cCertfCde'].includes(item.prop)) {
      item["func"] = cCertfCdeChange;
    }
    if(['InsuredDist.cLongendTyp'].includes(item.prop)) {
      item["func"] = tCertMrkChecked;
    }
    if(['InsuredDist.cIsSame'].includes(item.prop)) {
      item["func"] = isSameChange;
    }
    if(['InsuredDist.cClntMrk'].includes(item.prop)) {
      item["func"] = cClntMrkFunc;
    }
    if(['InsuredDist.cIsIndvduBiz'].includes(item.prop)) {
      item["func"] = cIsIndvduBizChange;
    }
    if(['InsuredDist.ClntAddrAddress'].includes(item.prop)) {
      if(item.groupList.length>0){
        item.groupList[0]["func"] = getCountryInsured
        item.groupList[1]["func"] = getcSuffixAddr
      }
    }
    if(['InsuredDist.RegisterAddress'].includes(item.prop)){
      if(item.groupList.length>0){
        item.groupList[0]["func"] = getAllPropInsured
        item.groupList[1]["func"] = getcRegisterSuffixAddr
      }
    }

    if(['InsuredDist.tOperaterCertfEndTm'].includes(item.prop)) {
      item["disabledDate"] = tOEndTmDisable;
    }
		// 企业成立日期
		if (['InsuredDist.tEstablishingDate'].includes(item.prop)) {
      item["func"] = tEstablishingDateChange;
    }
    // 单位性质
    if(['InsuredDist.cWorkDpt'].includes(item.prop)) {
      item["func"] = cWorkDptChange;
    }

		if(['InsuredDist.cOccupCde'].includes(item.prop)) {
      item["btnItems"]["func"] = cOccupCdeChange;
      item["btnItems"]["disabled"] = false;
    }
    if(['InsuredDist.cTrdCde'].includes(item.prop)) {
      item["btnItems"]["func"] = funcNdustryCate;
			item["btnItems"]["disabled"] = false;
    }
    if(item.cShowLocation === '1'){
      item["hidden"] = true;
		}
		if(params.cEdrType === '1' && (props.data.title == "编辑" || props.data.title == "新增")){
      item.disabled = false;
      if(item.inputtype === 'rtinputgroup'){
        item.groupList.forEach(data => {
          data.disabled = false;
        })
      }
    }
    newSchema.push(item);
  }
  formconfig1.value.fromSchema = newSchema;
  formconfig1.value.title = props.data.title;
	if (props.data.title == "编辑") {
		setFormItem("InsuredDist.cInsuredCde", { disabled: true });
    setTimeout(() => {
      freeEditRef.value?.setFormValue(props.data.rowData);
    }, 100);
  } else if(props.data.title == '详情'){
    setTimeout(() => {
      freeEditRef.value?.setFormValue(props.data.rowData);
      freeEditRef.value?.setDisabledAll();
    }, 100);
  }
	setTimeout(() => {
		let cCustRiskRank = getValue("InsuredDist.cCustRiskRank")
		if(!cCustRiskRank){
			setValue("InsuredDist.cCustRiskRank","925104");
		}
  }, 100);
  console.log(' formconfig1.value', formconfig1.value)
	nextTick(()=>{
		setFormItem("InsuredDist.cMobile", { rules: [getRules("phoneNo", {})] })
		setFormItem("InsuredDist.cTel", { rules: [getRules("phone", {})] });
		setTimeout(() => {
			init.value = false
    }, 500);
	})
});

const funccopyvalue = () => {
  const applicantValue = formPage.getFormDataById('applicant')
  let insuredValue: any = {};

  // 同投保人时 客户信息需要禁用   客户名称 被保人性质 证件类型 证件号码  证件有效起 止期
  setFormItem('InsuredDist.cInsuredNme',{
    disabled:true
  })
  setFormItem('InsuredDist.cClntMrk',{
    disabled:true
  })
  setFormItem('InsuredDist.cCertfCde',{
    disabled:true
  })
  setFormItem('InsuredDist.cCertfCls',{
    disabled:true
  })
  setFormItem('InsuredDist.tCertfBgnDate',{
    disabled:true
  })
  setFormItem('InsuredDist.tCertfEndDate',{
    disabled:true
  })
  setFormItem('InsuredDist.cLongendTyp',{
    disabled:true
  })
  for (const k in applicantValue) {
    if (k === "Applicant.cCertfCls") {
      setTimeout(() => {
        setValue("InsuredDist.cCertfCls", applicantValue[k]);
      }, 0);
    } else if (k === "Applicant.cAppCde") {
      insuredValue["InsuredDist.cInsuredCde"] = applicantValue[k];
    } else if (k === "Applicant.cAppNme") {
      insuredValue["InsuredDist.cInsuredNme"] = applicantValue[k];
    } else if (k.startsWith("Applicant")) {
      const nk = k.replace("Applicant", "InsuredDist");
      insuredValue[nk] = applicantValue[k];
    }
  }
  setFormValue(insuredValue);
}
// 客户重置
const funcreset = () => {
  const InsuredDistValue = getFromValue();
  for (const k in InsuredDistValue) {
    // 反洗钱不清空
    if (k !== "InsuredDist.cCustRiskRank") {
      InsuredDistValue[k] = null;
    }
  }
  // if (!init.value) {
    setFormItem("InsuredDist.cInsuredNme", {
      disabled: false,
    });
    setFormItem("InsuredDist.cClntMrk", {
      disabled: false,
    });
    setFormItem("InsuredDist.cCertfCls", {
      disabled: false,
    });
    setFormItem("InsuredDist.cCertfCde", {
      disabled: false,
    });
    setFormItem('InsuredDist.tCertfBgnDate',{
      disabled:false
    })
    setFormItem('InsuredDist.tCertfEndDate',{
      disabled:false
    })
    setFormItem('InsuredDist.cLongendTyp',{
      disabled:false
    })
  // }
  setFormValue(InsuredDistValue);
}
const tCertMrkChecked = (val:any)=>{
  if (val == "1") {
    setValue(
        "InsuredDist.tCertfEndDate",
        moment(new Date("2099-12-31")).format("YYYY-MM-DD HH:mm:ss")
    );
    setFormItem("InsuredDist.tCertfEndDate", { disabled: true });

  } else {
    setValue("InsuredDist.tCertfEndDate", "");
    setFormItem("InsuredDist.tCertfEndDate", { disabled: false });
  }
}
//  根据 客户名称 / 被保人性质/ 证件类型 / 证件号码 获取客户信息
const checkUser = () => {
  // 自定义录单 方案配置 模版 进入 可以查询用户信息
  // if (param.pageType !== "app" &&  param.pageType !== "copy" && param.pageType !== "template" && param.cAppStatus !=='1') {
  //   return false;
  // }
  const applicantValue = freeEditRef.value?.getFromValue()
//  只要4个有值 去请求客户信息
  if (
      applicantValue["InsuredDist.cInsuredNme"]&&
      applicantValue["InsuredDist.cCertfCls"] &&
      applicantValue["InsuredDist.cCertfCde"]
  ) {
    const param = {
      coustName: applicantValue["InsuredDist.cInsuredNme"],
      coustType:applicantValue["InsuredDist.cCertfCls"],
      coustCode: applicantValue["InsuredDist.cCertfCde"],
      // personnelType:"InsuredDist"
      personnelType:"Applicant"
    }
    qryCustomer(param)
        .then((res:any) => {
          const { code, data, msg } = res;
          if (200 === code) {
            if(data){
              const result:any = {};
              // for (const key in data[0]) {
              // 	if (data[0].hasOwnProperty(key)) {
              // 仅替换以 "Applicant." 开头的键
              // if (key.startsWith('Applicant.')) {
              // 	const newKey = key.replace('Applicant.', 'InsuredDist.');
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

              setValue('InsuredDist.cInsuredCde', data[0]['Applicant.cAppCde']);
              let userId = getValue('InsuredDist.cCertfCde')
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
  const applicantValue = freeEditRef.value?.getFromValue()
  if (  id.length !== 18 || (applicantValue["InsuredDist.cCertfCls"] !=='111' && applicantValue["InsuredDist.cCertfCls"] !=='553')) {
    return false
  }
  const birthYear = parseInt(id.substring(6, 10), 10);
  const birthMonth = parseInt(id.substring(10, 12), 10);
  const birthDay = parseInt(id.substring(12, 14), 10);
  const birthday = `${birthYear}-${birthMonth.toString().padStart(2, "0")}-${birthDay.toString().padStart(2, "0")}`;
  const sexCode = parseInt(id.substring(16, 17), 10);
  const sex = sexCode % 2 === 0 ? "2" : "1"; // 1: 男, 2: 女
  const age = new Date().getFullYear() - birthYear;

  setValue("InsuredDist.cNation", "CHN"); // 国籍
  setValue("InsuredDist.tBirthday", birthday);
  setValue("InsuredDist.nAge", age);
  setValue("InsuredDist.cSex", sex);
}
const funCheckUser = (val:any)=>{
  checkUser();
}
// 证件类型change
 const InsuredCCertfCls =(val:any) => {
 
    checkUser();
    clearValidate('InsuredDist.cCertfCde')  // 清除报错信息
			setFormItem("InsuredDist.tEstablishingDate", { disabled: true, rules: null });
			clearValidate('InsuredDist.tEstablishingDate')  // 清除报错信息
   if (val == "111") {

     // setValue('InsuredDist.cCertfCde','')  //选身份证时清空
     setFormItem("InsuredDist.cCertfCde", {
       rules: [getRules("required", {}), getRules("idCard", {})],
     });
     setFormItem("InsuredDist.tCertfBgnDate", {
       rules: [getRules("required", {})],
     });

     setFormItem("InsuredDist.tCertfEndDate", {
       rules: [getRules("required", {})],
     });

     setValue("InsuredDist.cNation", "CHN"); // 国籍

     setFormItem("InsuredDist.tBirthday", {
       disabled: true,
     });
     setFormItem("InsuredDist.nAge", {
       disabled: true,
     });
     setFormItem("InsuredDist.cSex", {
       disabled: true,
     });
     setFormItem("InsuredDist.cNation", {
       disabled: true,
     });

   } else if (val == "110002") {
     setFormItem("InsuredDist.tCertfEndDate", {
       rules: [getRules("required", {})],
     });
     //证件类型是“营业执照”，参加社会统筹标志变化为必填
     setFormItem("InsuredDist.tBirthday", {
       disabled: false,
     });
     setFormItem("InsuredDist.nAge", {
       disabled: false,
     });
     setFormItem("InsuredDist.cSex", {
       disabled: false,
     });
     setFormItem("InsuredDist.cNation", {
       disabled: false,
     });
   } else if ( val == "01") {
     setFormItem("InsuredDist.tCertfBgnDate", {
       rules: [getRules("required", {})],
     });
     setFormItem("InsuredDist.tCertfEndDate", {
       rules: [getRules("required", {})],
     });

     // 统一社会信用代码校验
     setFormItem("InsuredDist.cCertfCde", {
       rules: [getRules("required", {}),getRules("socialCode", {})],
     });

     // 为法人  企业成立日期
     setFormItem("InsuredDist.tEstablishingDate", {
				disabled: false,
				rules: [getRules("required", {})],
     });
 
     setFormItem("InsuredDist.tBirthday", {
       disabled: false,
     });
     setFormItem("InsuredDist.nAge", {
       disabled: false,
     });
     setFormItem("InsuredDist.cSex", {
       disabled: false,
     });
     setFormItem("InsuredDist.cNation", {
       disabled: false,
     });
   } else if(val == "553"){
     // 外国人证件号
     setFormItem("InsuredDist.cCertfCde", {
       rules: [getRules("required", {}),getRules("ariCard", {})],
     });

     setFormItem("InsuredDist.tBirthday", {
       disabled: false,
     });
     setFormItem("InsuredDist.nAge", {
       disabled: false,
     });
     setFormItem("InsuredDist.cSex", {
       disabled: false,
     });
     setFormItem("InsuredDist.cNation", {
       disabled: false,
     });
   } else {
     setFormItem("InsuredDist.cCertfCde", {
       rules: [getRules("required", {})],
     });
     setFormItem("InsuredDist.tCertfBgnDate", { rules: null });
     setFormItem("InsuredDist.tCertfEndDate", { rules: null });

     setFormItem("InsuredDist.tBirthday", {
       disabled: false,
     });
     setFormItem("InsuredDist.nAge", {
       disabled: false,
     });
     setFormItem("InsuredDist.cSex", {
       disabled: false,
     });
     setFormItem("InsuredDist.cNation", {
       disabled: false,
			});
		}
	 // 回显不执行下方操作
		if (init.value && props.data.title !== '新增') return;
		// 切换清空
		if (val) {
			const fieldsToClear = ["InsuredDist.tBirthday", "InsuredDist.nAge", "InsuredDist.cCertfCde", "InsuredDist.tEstablishingDate"];
			fieldsToClear.forEach((field:any) => {
				setValue(field, null);
				setTimeout(() => {
					clearValidate(field);
				}, 10);
			});
		}
}
// 证件号码change
const cCertfCdeChange =() => {
  checkUser();
}
const getCountryInsured = ()=>{
  setregistAdd()
}
const getcSuffixAddr = ()=>{
  setregistAdd()
}
const getAllPropInsured = ()=>{
  setRegisterAdd()
}
const getcRegisterSuffixAddr = ()=>{
  setRegisterAdd()
}
function setregistAdd() {
  const ads = getValue("InsuredDist.ClntAddrProp");
  const a = getValue("InsuredDist.cSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        setValue("InsuredDist.cClntAddr", b);
      }
    });
  } else {
    setValue("InsuredDist.cClntAddr", a);
  }
}
const cIsIndvduBizChange = (val:any)=>{
  if(val === '1'){
    setFormItem('InsuredDist.cTrdCde',{ rules: [getRules("required", {})]})
  }else{
    setFormItem('InsuredDist.cTrdCde',{ rules: null})
  }
}
//企业成立时间事件改变
const tEstablishingDateChange = (val:any) => {
	const tableParam = opertaor.getTableRefs();
  const tAppTm = tableParam["insrnc"].getFromValue()["Base.tAppTm"]  //投保日期
  const tIssueTm = tableParam["insrnc"].getFromValue()["Base.tIssueTm"]   //签单日期
  if (val && tAppTm && tIssueTm) {
    const establishingDate = new Date(val).getTime();
    const appTm = new Date(tAppTm).getTime();
    const issueTm = new Date(tIssueTm).getTime();
		const foundingDay = new Date('1949-10-01').getTime();
    if (establishingDate > issueTm) {
      ElMessage.error("企业成立时间小于保单签单时间，请关注!");
    }
    if (establishingDate > appTm) {
      ElMessage.error("企业成立时间小于投保日期，请重新填写!");
			setValue("InsuredDist.tEstablishingDate", null);
			clearValidate('InsuredDist.tEstablishingDate')  // 清除报错信息
		}
		const cClntMrk = getValue('InsuredDist.cClntMrk'); // 法人  1个人  0法人
		const cWorkDpt = getValue('InsuredDist.cWorkDpt')
		const isSpecialCase = cWorkDptList.includes(cWorkDpt);
		if (cClntMrk == '0' && !!isSpecialCase) {
			if (establishingDate < foundingDay) {
				ElMessage.error("企业成立时间大于1949-10-01，请重新填写!");
				setValue("InsuredDist.tEstablishingDate", null);
				clearValidate('InsuredDist.tEstablishingDate')  // 清除报错信息
			}
		}
  }
}
// 被保人性质
 const cClntMrkFunc = (val:any)=>{
  console.log(val)
    if(val === '0'){
      setFormItem("InsuredDist.tBirthday", {
         rules: null
      });
        //注册地址
      // setFormItem("InsuredDist.RegisterProp", { rules: [getRules("required", {})] })
      // setFormItem("InsuredDist.cRegisterSuffixAddr", { rules: [getRules("required", {})] })
      setFormItem("InsuredDist.cRegisteredcapDre", { rules: [getRules("required", {})] })
      clearValidate('InsuredDist.tBirthday')
      setFormItem("InsuredDist.nAge", {
        rules: null
      });
      clearValidate('InsuredDist.nAge')

      setFormItem("InsuredDist.cSex", {
        rules: null
      });
      clearValidate('InsuredDist.cSex')

      // setFormItem("InsuredDist.cCntrNme", { rules: [getRules("required", {})] });
      setFormItem("InsuredDist.cCntrCertfCde", {
        rules: [getRules("required", {})],
      });

      setValue("InsuredDist.cIsIndvduBiz", "");
      setFormItem("InsuredDist.cIsIndvduBiz", {
        rules: null,
      });

      setFormItem("InsuredDist.cGreenIndustryCustomers", {
        rules: [getRules("required", {})],
      });

     setFormItem("InsuredDist.cParticiinsocTyp", {
        rules: [getRules("required", {})],
      });

       setFormItem("InsuredDist.RegisterProp", {
        rules: [getRules("required", {})],
      });

      setFormItem("InsuredDist.cTrdCde", {
        rules: [getRules("required", {})],
      });

      setFormItem("InsuredDist.cWorkDpt", {
        rules: [getRules("required", {})],
      });
      // 单位性质 --为企业做必填校验
      const cWorkDpt = getValue('InsuredDist.cWorkDpt');
      const isSpecialCase = cWorkDptList.includes(cWorkDpt);
      const requiredRule = [getRules("required", {})];
      //实名认证方式
      setFormItem("InsuredDist.cRealnameAuthType", {
        rules: isSpecialCase ? requiredRule : []
      });
      // 法定代表人/责任人
      setFormItem("InsuredDist.cLegalRepresentative", {
        rules: isSpecialCase ? requiredRule : []
      });
      // 企业成立日
			if (!init.value && !isSpecialCase) {
				setValue("InsuredDist.tEstablishingDate", null);
				clearValidate('InsuredDist.tEstablishingDate')  // 清除报错信息
			}
      setFormItem("InsuredDist.tEstablishingDate", {
				disabled: !init.value && isSpecialCase ? false : true,
        rules: isSpecialCase ? requiredRule : []
      });
      // 移动电话
      let cMobile = getValue('InsuredDist.cMobile');  // 移动 
      let cTel = getValue('InsuredDist.cTel');  // 固定电话    
      if (!cMobile && !cTel) {
        setFormItem("InsuredDist.cMobile", {
          rules: [getRules("required", {}), getRules("phoneNo", {})],
        });
      } else if (cMobile) {
        setFormItem("InsuredDist.cTel", { rules: [getRules("phone", {})] });
        setFormItem("InsuredDist.cMobile", { rules: [getRules("required", {}), getRules("phoneNo", {})] })
      } else if (cTel) {
        setFormItem("InsuredDist.cTel", { rules: [getRules("required", {}), getRules("phone", {})] });
        setFormItem("InsuredDist.cMobile", { rules: [getRules("phoneNo", {})] })
      }

         codeListStore
        .queryCodeList({
          codeListName: "UN_NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          if (
            !res.some((item) =>
              Object.values(item).includes(getValue("InsuredDist.cCertfCls"))
            )
          ) {
            // setValue("Insured.cCertfCls", "");
          }
          freeEditRef.value?.addCodeListMap({
            code: "InsuredDist.cCertfCls",
            list: res
          })
          setValue('InsuredDist.cCertfCls', '01')
        });
    }else{

      // 性别 、年龄、生日个人必填
      setFormItem("InsuredDist.tBirthday", {
        rules: [getRules("required", {})],
      });
      setFormItem("InsuredDist.nAge", {
        rules: [getRules("required", {})],
      });
      setFormItem("InsuredDist.cSex", {
        rules: [getRules("required", {})],
      });
   
      //是否个体工商户
      setFormItem("InsuredDist.cIsIndvduBiz", {
        rules: [getRules("required", {})],
      });

      // 单位性质
      setFormItem("InsuredDist.cWorkDpt", { rules: null });

      //注册地址
      setFormItem("InsuredDist.cRegisteredcapDre", { rules: null });
      setFormItem("InsuredDist.RegisterProp", {
        rules: null,
      });

      // 是否绿色产业客户
      setFormItem("InsuredDist.cGreenIndustryCustomers", {
        rules: null,
        disabled: true,
      });
      // 是否绿色详情
      setFormItem("InsuredDist.cGreenIndustryList", {
        rules: null,
        disabled: true,
      });

      // 参加社会统筹标志
      setFormItem("InsuredDist.cParticiinsocTyp", {
        rules: null,
      });

      //实名认证方式
      setFormItem("InsuredDist.cRealnameAuthType", {
        rules: [],
      });
      // 法定代表人/责任人
      setFormItem("InsuredDist.cLegalRepresentative", {
        rules: []
      });
      //企业成立日期
			if (!init.value) { 
				setValue("InsuredDist.tEstablishingDate", null);
				clearValidate('InsuredDist.tEstablishingDate')  // 清除报错信息
			}
      setFormItem("InsuredDist.tEstablishingDate", {
				disabled: true,
        rules: [],
      });

      setFormItem("InsuredDist.cCntrNme", { rules: null });
      setFormItem("InsuredDist.cCntrCertfCde", { rules: null });
      //是否分支机构
      if (!getValue('InsuredDist.cIsBranch')) {
        setValue("InsuredDist.cIsBranch", "1");
      }
      // 个人 移动电话必填  
      setFormItem("InsuredDist.cMobile", {
        rules: [getRules("required", {}), getRules("phoneNo", {})],
      });
      setFormItem("InsuredDist.cTel", { rules: [getRules("phone", {})] });
      codeListStore
        .queryCodeList({
          codeListName: "NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          if (
            !res.some((item) =>
              Object.values(item).includes(getValue("InsuredDist.cCertfCls"))
            )
          ) {
            if (getValue('InsuredDist.cCertfCls')) {
              setValue("InsuredDist.cCertfCls", "");
            }
          }
          freeEditRef.value?.addCodeListMap({
            code: "InsuredDist.cCertfCls",
            list: res
          })

        });
    }
  }
//注册地市是否同上
const isSameChange = (val:any) => {
	if (val == "1") {
		const ads = getValue("InsuredDist.ClntAddrProp");
		const a = getValue("InsuredDist.cSuffixAddr") || "";

		setValue("InsuredDist.RegisterProp", ads);
		setValue("InsuredDist.cRegisterSuffixAddr", a);
	}
}

function setRegisterAdd() {
  const ads = getValue("InsuredDist.RegisterProp");
  const a = getValue("InsuredDist.cRegisterSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        console.log(b);
        setValue("InsuredDist.cRegisteredcapDre", b);
      }
    });
  } else {
    setValue("InsuredDist.cRegisteredcapDre", a);
  }
}

// 证件有效起期
const tCertfBgnDateDisable= (date: any) => {
  const fs = getFromValue();
  if (fs && JSON.stringify(fs) !== '{}') {

    const endDate = new Date(fs["InsuredDist.tCertfEndDate"] || '')   // 结束时间
    let minDate = dayjs(endDate).valueOf();
    return date.getTime() > minDate
  } else {
    return true;
  }

}
    // 证件有效止期
const tCertfEndDateDisable = (date: any) => {
  const fs = getFromValue();
  if (fs && JSON.stringify(fs) !== '{}') {
    const startDate = new Date(fs["InsuredDist.tCertfBgnDate"] || '')   // 开始时间
    let maxDate = dayjs(startDate).valueOf();
    return date.getTime() < maxDate
  } else {
    return true;
  }
}
  //根据获取的职业类别查询职业等级并绑定下拉框
const getDistoccupType = (val: string|any[]) => {
  if(!val || val.length < 3) return;
  codeListStore.queryCodeList({
    codeListName: "Occupt_ZYLB",
    codeListParam: {cParCde: val.at(-1)},
  }).then((res) => {
    const item = freeEditRef.value?.getFromSchemaItem('Dist.cOccupationalLevel')
    //给表单下拉项赋值
    item.itemConfig.loadData = res
  });
};
const funcNdustryCate = () => {
    // const param = opertaor.getParam();
    dialog.value?.open(
      "ndustryCateModal",
      {
        type: "show",
        method: {
          getdbClickData: (data) => {
            setFormItem("InsuredDist.cTrdCde", {
              loadData: [{ label: data.cnm, value: data.cde }],
            });
           // setValue("Applicant.cTrdCde", data.cnm);
            setValue("InsuredDist.cTrdCde", data.cde);
            dialog.value?.handleClose();
          },
        },
      },
      {},
      { title: "国民经济行业分类", width: 85 }
    );
};
const cOccupCdeChange = () => {
    // const param = opertaor.getParam();
    dialog.value?.open(
      "cOccupCdeModal",
      {
        type: "show",
        method: {
          getdbClickData: (data:any) => {
            setFormItem("InsuredDist.cOccupCde", {
              loadData: [{ label: `${data.cde} ${data.cnm}`, value: data.cde }],
            });
            setValue("InsuredDist.cOccupCde", data.cde);
            dialog.value?.handleClose();
          },
        },
      },
      {
        isOk: (selectdata: any) => {},
      },
      { title: "职业", width: 85 }
    );
}

  // 单位性质
  const cWorkDptChange = (val: any) => {
    console.log(val)
    // setCapitalRequiredRule(getValue, setFormItem, 'Insured');

    const clientNature = getValue('InsuredDist.cClntMrk');
    const isSpecialCase = cWorkDptList.includes(val) && clientNature === '0';
    const requiredRule = [getRules("required", {})];
    //实名认证方式
    setFormItem("InsuredDist.cRealnameAuthType", {
      rules: isSpecialCase ? requiredRule : []
    });
    // 法定代表人/责任人
    setFormItem("InsuredDist.cLegalRepresentative", {
      rules: isSpecialCase ? requiredRule : []
    });
    // 企业成立日
    setFormItem("InsuredDist.tEstablishingDate", {
			disabled: !init.value && isSpecialCase ? false : true,
      rules: isSpecialCase ? requiredRule : []
    });
		if (!init.value && !isSpecialCase) {
			setValue("InsuredDist.tEstablishingDate", null);
			clearValidate('InsuredDist.tEstablishingDate')  // 清除报错信息
		}

    const leiCodeRule = [getRules("leiCode", {})];
    if (val === '350') {
      setFormItem("InsuredDist.cGcidCode", {
        rules: [...requiredRule, ...leiCodeRule]
      });
    } else if (val) {
      setFormItem("InsuredDist.cGcidCode", {
        rules: leiCodeRule
      });
    }
  }

// 办理人员止期 禁用处理
const tOEndTmDisable =(date: any) => {
  return disablePastDates(date);
}


//给表单下拉项赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.value.fromSchema?.forEach((item) => {
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
function getFromValue() {
  return freeEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  freeEditRef?.value?.setFormValue(value);
}
function validate() {
  return freeEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  freeEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return freeEditRef?.value?.getValue(key);
}
function clearValidate(key = null) {
  freeEditRef?.value?.clearValidate(key);
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  clearValidate,
});
</script>

<style scoped></style>

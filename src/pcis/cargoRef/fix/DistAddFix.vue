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
import {FormPage} from "@/views/protocolManagement/utils/form-page";
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

const idxParam = inject('idxParam');
const formPage: FormPage = idxParam?.formPage;
const initFlag = computed(() => formPage.init);
const codeListStore = codeListViewStore();

const getCComponentTable = () => {
    return 'InsuredDist';
};
const cComponentTable = getCComponentTable();

const dataParams:any = ref({});
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
const distContactList:Array<string> = ['DistECargo.PartProp','Tgt.cSuffixAddr','DistECargo.Prop','DistECargo.cSuffixAddr','DistECargo.JingyingProp','DistECargo.cDetailedAddress']
const rateDetail = ref({
  cExchCde: '1',
  nAmtExch:[],
  cPrmCur:[]
})
const toFixTwo = (val:any)=> parseFloat(val.toFixed(2))
onMounted(async  () => {
  dataParams.value = formPage.getAllFormData();

  let newSchema = [];

  for(let i = 0; props.data.fromSchema && i < props.data.fromSchema.length; i++){

    let item = JSON.parse(JSON.stringify(props.data.fromSchema[i]));
        console.log('清单777')
    if(['DistECargo.AllOccup'].includes(item.prop)) {
      item["func"] = getDistoccupType;
    }else if (props.data.fromSchema[i]["func"]) {

    }
    if (props.data.fromSchema[i]["tableClick"]) {
      item["tableClick"] = props.data.fromSchema[i]["tableClick"];
    }
    if(['ECargoGoodsTgt.nGoodsValue'].includes(item.prop)) {
      item["func"] = goodsValue;
    }
    if(['ECargoGoodsTgt.nAdditiveRatio'].includes(item.prop)) {
      item["func"] = bonusRatio;
    }
    if(['ECargoInsuredDist.tCertfBgnDate'].includes(item.prop)) {
      item["disabledDate"] = tCertfBgnDateDisable;
    }
    if(['ECargoInsuredDist.tCertfEndDate'].includes(item.prop)) {
      item["disabledDate"] = tCertfEndDateDisable;
    }
    if(['ECargoGoodsTgt.cPrmCur'].includes(item.prop)) {
      item["typeCode"] = ''
      const result:any =  await cargoApi.getRate({cEcAgrAppNo:props.data.cEcAgrAppNo})
      if(result?.code == 200){
        rateDetail.value = {...result.data.data[0].rateDetail}
        nextTick(()=>{
          item['loadData'] = rateDetail.value?.cPrmCur
        })
      }else{
        ElMessage.error(result.msg);
        return
      }
      item["func"] = cAmtCurChange;
    }
		// 运输信息-币种 添加change事件
    if(['ECargoTransportDist.cCurrency'].includes(item.prop)) {
      item["func"] = cAmtCurChange1;
    }
		// 运输信息-航次运输限额 添加change事件 
    if(['ECargoTransportDist.nTransportLimit'].includes(item.prop)) {
      item["func"] = nTransportLimitchange
    }
    if(['ECargoInsuredDist.cInsuredNme'].includes(item.prop)) {
      item["func"] = funCheckUser;
    }
    // 证件类型
    if(['ECargoInsuredDist.cCertfCls'].includes(item.prop)) {
      item["func"] = InsuredCCertfCls;
    }
    if(['ECargoInsuredDist.cCertfCde'].includes(item.prop)) {
      item["func"] = cCertfCdeChange;
    }
    if(['ECargoInsuredDist.cLongendTyp'].includes(item.prop)) {
      item["func"] = tCertMrkChecked;
    }
    if(['ECargoInsuredDist.cIsSame'].includes(item.prop)) {
      item["func"] = isSameChange;
    }
    if(['ECargoInsuredDist.cClntMrk'].includes(item.prop)) {
      item["func"] = cClntMrkFunc;
    }
    // 是否个体工商户
    if(['ECargoInsuredDist.cIsIndvduBiz'].includes(item.prop)) {
      item["func"] = cIsIndvduBizChange;
    }
    // 常住地址
    if(['ECargoInsuredDist.cRegisterAddress'].includes(item.prop)) {
      if(item.groupList.length>0){
        item.groupList[0]["func"] = getCountryInsured
        item.groupList[1]["func"] = getcSuffixAddr
      }
    }
    // 注册地址
    if(['ECargoInsuredDist.Address'].includes(item.prop)){
      if(item.groupList.length>0){
        item.groupList[0]["func"] = getAllPropInsured
        item.groupList[1]["func"] = getcRegisterSuffixAddr
      }
    }

    if(['ECargoInsuredDist.tOperaterCertfEndTm'].includes(item.prop)) {
      item["disabledDate"] = tOEndTmDisable;
    }
    // 单位性质
    if(['ECargoInsuredDist.cWorkDpt'].includes(item.prop)) {
      item["func"] = cWorkDptChange;
    }
    // 证件有效期止期
    if(['ECargoInsuredDist.tCertfEndDate'].includes(item.prop)) {
      item["func"] = tCertfEndDateChange;
    }
    // 企业成立日期
    if(['ECargoInsuredDist.tEstablishingDate'].includes(item.prop)) {
      item["func"] = tEstablishingDateChange;
    }
    // 被保人性质
    if(['ECargoInsuredDist.cClntMrk'].includes(item.prop)) {
      item["func"] = cClntMrkFunc;
    }
    // 大股东性质
    if(['ECargoInsuredDist.cShareholderNature'].includes(item.prop)) {
      item["func"] = funcShareholderNature;
    }
    // 移动电话
    if(['ECargoInsuredDist.cMobile'].includes(item.prop)) {
      item["func"] = mobileChange;
    }
    // 固定电话
    if(['ECargoInsuredDist.cTel'].includes(item.prop)) {
      item["func"] = cTelChange;
    }
    // 电子邮箱
    if(['ECargoInsuredDist.cEmail'].includes(item.prop)) {
      item["func"] = emailChange;
    }
    // 是否分支机构
    if(['ECargoInsuredDist.cIsBranch'].includes(item.prop)) {
      item["func"] = cIsBranchChange;
    }
    // 办理人员证件种类
    if(['ECargoInsuredDist.cOperaterCertfTyp'].includes(item.prop)) {
      item["func"] = cOperaterCertfTypChange;
    }

    //  if(['ECargoInsuredDist.cClntMrk'].includes(item.prop)){
       
    //  item["func"] = cardTypeChange;
       
    // }

// 

		if(['ECargoInsuredDist.cOccupCde'].includes(item.prop)) {
      item["btnItems"]["func"] = cOccupCdeChange;
      item["btnItems"]["disabled"] = false;
    }
    if(['ECargoInsuredDist.cTrdCde'].includes(item.prop)) {
      item["btnItems"]["func"] = funcNdustryCate;
			item["btnItems"]["disabled"] = false;
    }
    // if(item.prop !=='DistECargo.nSeqNo'){
    //     item['rules'] = [{ required: true, message: '该项为必填项', trigger: 'blur' }];
    // }else if(item.prop !=='DistECargo.cSchoolName' && item.prop !=='DistECargo.cSchoolAddress'){
    //   item['rules'] =null;
    // }
    // item["disabled"] = false;
    if(item.cShowLocation === '1'){
      item["hidden"] = true;
    }

    // 遍历groupList数组把函数赋值给fromSchema
    if (props.data.fromSchema[i]["groupList"] && props.data.fromSchema[i]["groupList"].length>0) {
      props.data.fromSchema[i]["groupList"].forEach((data:any,index:number,arr:any) =>{
        //  040001经营场所地址 040005 学校地址 040021 经营场所地址 042003 学校地址 043013 标的坐落地址 043020 房屋所在地区 045001工程项目地址
        if(distContactList.includes(data.prop)){
          item["groupList"][index]['func'] = function (){
            return setcDetailedAddress(arr,JSON.parse(JSON.stringify(props.data.fromSchema[i+1])))
          }
        }
      })
    }
    newSchema.push(item);
  }
  formconfig1.value.fromSchema = newSchema;
  formconfig1.value.title = props.data.title;
  if(props.data?.compKey &&  props.data?.compKey === 'AgreementDistInsured'){
    formconfig1.value.titleBtns?.unshift( createFreeButtonBase({
      type: "primary",
      label: "同投保人",
      func:  () => {
        funccopyvalue()
      },
    }),)
    formconfig1.value.titleBtns?.unshift( createFreeButtonBase({
      type: "primary",
      label: "客户重置",
      func:  () => {
        funcreset()
      },
    }),)
  }
  if (props.data.title == "编辑") {
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
		let cCustRiskRank = getValue("ECargoInsuredDist.cCustRiskRank")
		if(!cCustRiskRank){
			setValue("ECargoInsuredDist.cCustRiskRank","925104");
		}
	}, 100);
  setTimeout(() => {
    let cCustRiskRank = getValue("ECargoGoodsTgt.cPrmCur")
    if(!cCustRiskRank){
      setValue("ECargoGoodsTgt.cPrmCur","CNY");
    }
  }, 100);
  setTimeout(() => {
    setValue('ECargoGoodsTgt.cExchCde',rateDetail.value.cExchCde)
  }, 100);
  console.log(' formconfig1.value', formconfig1.value)
  nextTick(()=>{
    setFormItem("ECargoInsuredDist.cMobile", { rules: [getRules("phoneNo", {})] })
    setFormItem("ECargoInsuredDist.cTel", { rules: [getRules("phone", {})] });
  })
  setValue("ECargoInsuredDist.cNation", "CHN"); // 国籍默认中国

  setFormItem("ECargoInsuredDist.cSafetyStandardizationLevel", { hidden: true });
  setFormItem("ECargoInsuredDist.cCreditRating", { hidden: true });
  setFormItem("ECargoInsuredDist.cIsLargeMediumEnterprise", { hidden: true });
  // 处理邮编
  setFormItem("ECargoInsuredDist.cZipCde", {
    'maxlength': 6,
    rules: [getRules("signlessInt", {}), getRules("specifyLength", { len: 6 })],
  });
  // 移动电话
  setFormItem("ECargoInsuredDist.cMobile", { rules: [getRules("phoneNo", {})] });
  // 固话
  setFormItem("ECargoInsuredDist.cTel", { rules: [getRules("phone", {})] });
  // 传真校验
  setFormItem("ECargoInsuredDist.cFax", { rules: [getRules("faxNumber", {})] });
  // 法人身份证
  setFormItem("ECargoInsuredDist.cGcidCode", {
    rules: [getRules("leiCode", {})],
  });
  // 关联交易审批单编号
  setFormItem("ECargoInsuredDist.cRelateNo", { rules: [getRules("txnApprovalNo", {})] });
  // 经常居住地校验
  setFormItem("ECargoInsuredDist.cHabitualResidence", { rules: [getRules("valiAddress", {})] });
});

const funccopyvalue = () => {
  const applicantValue = formPage.getFormDataById('AgreementApplicant')
  let insuredValue: any = {};

  // 同投保人时 客户信息需要禁用   客户名称 被保人性质 证件类型 证件号码  证件有效起 止期
  setFormItem('ECargoInsuredDist.cInsuredNme',{
    disabled:true
  })
  setFormItem('ECargoInsuredDist.cClntMrk',{
    disabled:true
  })
  setFormItem('ECargoInsuredDist.cCertfCde',{
    disabled:true
  })
  setFormItem('ECargoInsuredDist.cCertfCls',{
    disabled:true
  })
  setFormItem('ECargoInsuredDist.tCertfBgnDate',{
    disabled:true
  })
  setFormItem('ECargoInsuredDist.tCertfEndDate',{
    disabled:true
  })
  setFormItem('ECargoInsuredDist.cLongendTyp',{
    disabled:true
  })
  for (const k in applicantValue) {
    if (k === "ECargoApplicant.cCertfCls") {
      setTimeout(() => {
        setValue("ECargoInsuredDist.cCertfCls", applicantValue[k]);
      }, 0);
    } else if (k === "ECargoApplicant.cAppCde") {
      insuredValue["ECargoInsuredDist.cInsuredCde"] = applicantValue[k];
    } else if (k === "ECargoApplicant.cAppNme") {
      insuredValue["ECargoInsuredDist.cInsuredNme"] = applicantValue[k];
    } else if (k.startsWith("ECargoApplicant")) {
      const nk = k.replace("ECargoApplicant", "ECargoInsuredDist");
      insuredValue[nk] = applicantValue[k];
    }
  }
  setFormValue(insuredValue);
}
// 客户名称
const funCheckUser = (val:any)=>{
  if (val) {
    // 去除首位空格
    setValue("ECargoInsuredDist.cInsuredNme", val.trim())
    checkUser(); // 根据名称  被保人性质 证件类型 证件号码查询用户信息
  }
}
//证件有效期止期时间事件改变
const tCertfEndDateChange = (val:any) => {
  const tcertfEndDate = getFromValue()?.["ECargoInsuredDist.TcertfEndDate"]  //证件有效止期
  const tIssueTm = dataParams.value?.["AgreementBase"]?.["ECargoBase.tIssueTm"] //签单日期
  const tinsrncBgnTm = dataParams.value?.["AgreementBase"]?.["ECargoBase.tInsrncBgnTm"] //协议开始日期
  if (val && tIssueTm && tinsrncBgnTm) {
    // 统一转换为日期对象进行比较
    const certfEndDate = new Date(val).getTime();
    const issueTm = new Date(tIssueTm).getTime();
    const insrncBgnTm = new Date(tinsrncBgnTm).getTime();
    if (certfEndDate < issueTm) {
      ElMessage.error("被保人证件有效期小于签单时间，请关注!");
      setValue("Insured.tCertfEndDate", '');
    }
    if (certfEndDate < insrncBgnTm) {
      ElMessage.error("被保人证件有效期小于协议开始时间，请关注!");
    }
  }
}
//企业成立时间事件改变
const tEstablishingDateChange = (val:any) => {
  const tAppTm = dataParams.value?.["AgreementBase"]?.["ECargoBase.tAppTm"]  //协议投保日期
  const tIssueTm = dataParams.value?.["AgreementBase"]?.["ECargoBase.tIssueTm"]  //签单日期
  if (val && tAppTm && tIssueTm) {
    const establishingDate = new Date(val).getTime();
    const appTm = new Date(tAppTm).getTime();
    const issueTm = new Date(tIssueTm).getTime();
    if (establishingDate > issueTm) {
      ElMessage.error("企业成立时间小于保单签单时间，请关注!");
    }
    if (establishingDate > appTm) {
      ElMessage.error("企业成立时间小于协议投保日期，请关注!");
    }
  }
}
//被保人性质change事件
const cClntMrkFunc = (val:any) => {
  console.log(val)
  checkUser();
  // val  0法人 1个人
  if (val == "0") {
    // 被保人是法人，出生日期、年龄、性别、国籍、职业类别、经营范围、婚姻状况隐藏
    setFormItem("ECargoInsuredDist.tBirthday", {
      hidden: true,
    });
    setFormItem("ECargoInsuredDist.nAge", {
      hidden: true,
    });
    setFormItem("ECargoInsuredDist.cSex", {
      hidden: true,
    });
    setFormItem("ECargoInsuredDist.cNation", {
      hidden: true,
    });
    setFormItem("ECargoInsuredDist.cOccupTyp", {
      hidden: true,
    });
    setFormItem("ECargoInsuredDist.cBusinessScope", {
      hidden: true,
    });
    setFormItem("ECargoInsuredDist.cMrgCde", {
      hidden: true,
      rules: null
    });
    setFormItem("ECargoInsuredDist.cIsBranch", {
      hidden: false,
    });
    setFormItem("ECargoInsuredDist.cStkMrk", {
      hidden: false,
    });
    setFormItem("ECargoInsuredDist.cEnterpriseTel", {
      rules: [getRules("required", {})],
    });

    setCapitalRequiredRule(getValue, setFormItem, 'ECargoInsuredDist');
    setFormItem("ECargoInsuredDist.tBirthday", {
      rules: null
    });
    clearValidate('ECargoInsuredDist.tBirthday')
    setFormItem("ECargoInsuredDist.nAge", {
      rules: null
    });
    clearValidate('ECargoInsuredDist.nAge')
    setFormItem("ECargoInsuredDist.cSex", {
      rules: null
    });
    clearValidate('ECargoInsuredDist.cSex')

    setFormItem("ECargoInsuredDist.cCntrCertfCde", {
      rules: [getRules("required", {})],
    });
    //是否个体工商户
    setValue("ECargoInsuredDist.cIsIndvduBiz", "");
    setFormItem("ECargoInsuredDist.cIsIndvduBiz", {
      rules: null,
    });
    // 是否绿色产业客户
    setFormItem("ECargoInsuredDist.cGreenIndustryCustomers", {
      rules: [getRules("required", {})],
    });
    if (!initFlag || props.data.title === '新增') {
      setFormItem("ECargoInsuredDist.cIsMicroEntpris", {
        disabled: false,
      });
      setFormItem("ECargoInsuredDist.cIsIndvduBiz", {
        disabled: true,
      });
      setFormItem("ECargoInsuredDist.cGreenIndustryCustomers", {
        disabled: false,
      });
      if (getValue('ECargoInsuredDist.cGreenIndustryCustomers') == '1') {
        setFormItem("ECargoInsuredDist.cGreenIndustryList", {
          rules: [getRules("required", {})],
          disabled: false,
        });
      }
    }
    // 参加社会统筹标志
    setFormItem("ECargoInsuredDist.cParticiinsocTyp", {
      rules: [getRules("required", {})],
    });
    setFormItem("ECargoInsuredDist.RegisterProp", {
      rules: [getRules("required", {})],
    });
    setFormItem("ECargoInsuredDist.cRegisterSuffixAddr", {
      rules: [getRules("required", {})],
    });
    setFormItem("ECargoInsuredDist.cIsMicroEntpris", {
      rules: [getRules("required", {})],
    });
    setFormItem("ECargoInsuredDist.nRegisteredCapital", {
      rules: [getRules("required", {})],
    });
    setFormItem("ECargoInsuredDist.cFirmscaleTyp", {
      rules: [getRules("required", {})],
    });
    setFormItem("ECargoInsuredDist.cLegalRepresentative", {
      rules: [getRules("required", {})],
    });

    // 为法人 国民经济行业必填
    setFormItem("ECargoInsuredDist.cTrdCde", {
      rules: [getRules("required", {})],
    });

    // 单位性质 --为企业做必填校验
    const cWorkDpt = getValue('ECargoInsuredDist.cWorkDpt');
    const isSpecialCase = cWorkDptList.includes(cWorkDpt);
    const requiredRule = [getRules("required", {})];
    //实名认证方式
    setFormItem("ECargoInsuredDist.cRealnameAuthType", {
      rules: isSpecialCase ? requiredRule : []
    });
    // 法定代表人/责任人
    setFormItem("ECargoInsuredDist.cLegalRepresentative", {
      rules: isSpecialCase ? requiredRule : []
    });
    // 企业成立日
    setFormItem("ECargoInsuredDist.tEstablishingDate", {
      rules: isSpecialCase ? requiredRule : []
    });

    // 移动电话
    let cMobile = getValue('ECargoInsuredDist.cMobile');  // 移动 
    let cTel = getValue('ECargoInsuredDist.cTel');  // 固定电话    
    if (!cMobile && !cTel) {
      setFormItem("ECargoInsuredDist.cMobile", {
        rules: [getRules("required", {}), getRules("phoneNo", {})],
      });
    } else if (cMobile) {
      setFormItem("ECargoInsuredDist.cTel", { rules: [getRules("phone", {})] });
      setFormItem("ECargoInsuredDist.cMobile", { rules: [getRules("required", {}), getRules("phoneNo", {})] })
    } else if (cTel) {
      setFormItem("ECargoInsuredDist.cTel", { rules: [getRules("required", {}), getRules("phone", {})] });
      setFormItem("ECargoInsuredDist.cMobile", { rules: [getRules("phoneNo", {})] })
    }

    setFormItem("ECargoInsuredDist.cEdubackgroudTyp", {
      rules: [],
    });
    setFormItem("ECargoInsuredDist.nYearincomeNum", {
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
            Object.values(item).includes(getValue("ECargoInsuredDist.cCertfCls"))
          )
        ) {
          // setValue("Insured.cCertfCls", "");
        }
        freeEditRef.value?.addCodeListMap({
          code: "ECargoInsuredDist.cCertfCls",
          list: res
        })
        setValue('ECargoInsuredDist.cCertfCls', '01')
      });

    setFormItem("ECargoInsuredDist.cWorkDpt", {
      rules: [getRules("required", {})],
    });
  } else {
    setFormItem("ECargoInsuredDist.tBirthday", {
      hidden: false,
    });
    setFormItem("ECargoInsuredDist.nAge", {
      hidden: false,
    });
    setFormItem("ECargoInsuredDist.cSex", {
      hidden: false,
    });
    setFormItem("ECargoInsuredDist.cNation", {
      hidden: false,
    });
    setFormItem("ECargoInsuredDist.cOccupTyp", {
      hidden: false,
    });
    setFormItem("ECargoInsuredDist.cBusinessScope", {
      hidden: false,
    });
    setFormItem("ECargoInsuredDist.cMrgCde", {
      hidden: false,
      rules: [getRules("required", {})],
    });
    // 被保人是个人，是否分支机构、 股东客户隐藏
    setFormItem("ECargoInsuredDist.cIsBranch", {
      hidden: true,
    });
    setFormItem("ECargoInsuredDist.cStkMrk", {
      hidden: true,
    });
    setFormItem("ECargoInsuredDist.tBirthday", {
      rules: [getRules("required", {})],
    });
    setFormItem("ECargoInsuredDist.nAge", {
      rules: [getRules("required", {})],
    });
    setFormItem("ECargoInsuredDist.cSex", {
      rules: [getRules("required", {})],
    });
    setFormItem("ECargoInsuredDist.cEnterpriseTel", {
      rules: [],
    });
    if (!initFlag || props.data.title === '新增') {
      setFormItem("ECargoInsuredDist.cWorkDpt", {
        disabled: false,
      });
      setFormItem("ECargoInsuredDist.cIsMicroEntpris", {
        disabled: true,
      });
      setFormItem("ECargoInsuredDist.cIsIndvduBiz", {
        disabled: false,
      });
      setFormItem("ECargoInsuredDist.cGreenIndustryCustomers", {
        disabled: true,
      });
    }

    setFormItem("ECargoInsuredDist.cCntrNme", { rules: null });
    setFormItem("ECargoInsuredDist.tOperaterCertfEndTm", { rules: null });
    setFormItem("ECargoInsuredDist.cOperaterCertfTyp", { rules: null });
    setFormItem("ECargoInsuredDist.cOperaterCertfCde", { rules: null });


    //是否个体工商户
    setFormItem("ECargoInsuredDist.cIsIndvduBiz", {
      rules: [getRules("required", {})],
    });

    // 单位性质
    setFormItem("ECargoInsuredDist.cWorkDpt", { rules: null });

    //注册地址
    setFormItem("ECargoInsuredDist.cRegisteredcapDre", { rules: null });
    setFormItem("ECargoInsuredDist.RegisterProp", {
      rules: null,
    });
    setFormItem("ECargoInsuredDist.cRegisterSuffixAddr", {
      rules: null,
    });

    // 是否绿色产业客户
    setFormItem("ECargoInsuredDist.cGreenIndustryCustomers", {
      rules: null,
      disabled: true,
    });
    // 是否绿色详情
    setFormItem("ECargoInsuredDist.cGreenIndustryList", {
      rules: null,
      disabled: true,
    });

    // 参加社会统筹标志
    setFormItem("ECargoInsuredDist.cParticiinsocTyp", {
      rules: null,
    });


    //实名认证方式
    setFormItem("ECargoInsuredDist.cRealnameAuthType", {
      rules: [],
    });
    // 法定代表人/责任人
    setFormItem("ECargoInsuredDist.cLegalRepresentative", {
      rules: []
    });
    //企业成立日期
    setFormItem("ECargoInsuredDist.tEstablishingDate", {
      rules: [],
    });

    setFormItem("ECargoInsuredDist.cCntrNme", { rules: null });
    setFormItem("ECargoInsuredDist.cCntrCertfCde", { rules: null });
    setFormItem("ECargoInsuredDist.cIsMicroEntpris", {
      rules: [],
    });
    setFormItem("ECargoInsuredDist.nRegisteredCapital", {
      rules: [],
    });
    setFormItem("ECargoInsuredDist.cFirmscaleTyp", {
      rules: [],
    });
    setFormItem("ECargoInsuredDist.cLegalRepresentative", {
      rules: [],
    });

    //是否分支机构
    if (!getValue('ECargoInsuredDist.cIsBranch')) {
      setValue("ECargoInsuredDist.cIsBranch", "1");
    }


    // 个人 移动电话必填  
    setFormItem("ECargoInsuredDist.cMobile", {
      rules: [getRules("required", {}), getRules("phoneNo", {})],
    });
    setFormItem("ECargoInsuredDist.cTel", { rules: [getRules("phone", {})] });
    
    // 个人 客户学历必填
    setFormItem("ECargoInsuredDist.cEdubackgroudTyp", {
      rules: [getRules("required", {})],
    });
    // 个人 年收入（单位：万元）必填
    setFormItem("ECargoInsuredDist.nYearincomeNum", {
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
            Object.values(item).includes(getValue("ECargoInsuredDist.cCertfCls"))
          )
        ) {
          if (getValue('ECargoInsuredDist.cCertfCls')) {
            setValue("ECargoInsuredDist.cCertfCls", "");
          }
        }
        freeEditRef.value?.addCodeListMap({
          code: "ECargoInsuredDist.cCertfCls",
          list: res
        })

      });
  }
}
// 大股东性质change事件
const funcShareholderNature = (val:any) => {
  if (val == "1") {
    codeListStore
      .queryCodeList({
        codeListName: "NATURAL_CERTIFICATE_CACHE",
        codeListParam: {},
      })
      .then((res) => {
        if (
          !res.some((item) =>
            Object.values(item).includes(
              getValue("ECargoInsuredDist.cShareholderCategory")
            )
          )
        ) {
          setValue("ECargoInsuredDist.cShareholderCategory", "");
        }
        setFormItem("ECargoInsuredDist.cShareholderCategory", {
          loadData: [],
        });
        setFormItem("ECargoInsuredDist.cShareholderCategory", {
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
              getValue("ECargoInsuredDist.cShareholderCategory")
            )
          )
        ) {
          setValue("ECargoInsuredDist.cShareholderCategory", "");
        }
        setFormItem("ECargoInsuredDist.cShareholderCategory", {
          loadData: [],
        });
        setFormItem("ECargoInsuredDist.cShareholderCategory", {
          loadData: res,
        });
      });
  }
}
// 是否个体工商户
const cIsIndvduBizChange = (val: any) => {
  if (val == "1") {
    setFormItem("ECargoInsuredDist.cOccupCde", { rules: [getRules("required", {})] });
    setFormItem("ECargoInsuredDist.cOccupCde", { btnItems: { disabled: false } });
    setFormItem("ECargoInsuredDist.cTrdCde", { rules: [getRules("required", {})] });
    setFormItem("ECargoInsuredDist.cTrdCde", { btnItems: { disabled: false } });
  } else if (val == "0") {
    setFormItem("ECargoInsuredDist.cOccupCde", { rules: [] });
    setFormItem("ECargoInsuredDist.cTrdCde", { rules: [] });
    setFormItem("ECargoInsuredDist.cOccupCde", { btnItems: { disabled: true } });
    setFormItem("ECargoInsuredDist.cTrdCde", { btnItems: { disabled: true } });
    setValue("ECargoInsuredDist.cOccupCde", null);
    setValue("ECargoInsuredDist.cTrdCde", null);
  } else {
    setFormItem("ECargoInsuredDist.cOccupCde", { btnItems: { disabled: false } });
    setFormItem("ECargoInsuredDist.cTrdCde", { btnItems: { disabled: false } });
    setFormItem("ECargoInsuredDist.cTrdCde", { rules: [getRules("required", {})] })
  }
}
// 客户重置
const funcreset = () => {
  const ECargoInsuredDistValue = getFromValue();
  for (const k in ECargoInsuredDistValue) {
    // 反洗钱不清空
    if (k !== "ECargoInsuredDist.cCustRiskRank") {
      ECargoInsuredDistValue[k] = null;
    }
  }
  if (!initFlag || props.data.title === '新增') {
    setFormItem("ECargoInsuredDist.cInsuredNme", {
      disabled: false,
    });
    setFormItem("ECargoInsuredDist.cClntMrk", {
      disabled: false,
    });
    setFormItem("ECargoInsuredDist.cCertfCls", {
      disabled: false,
    });
    setFormItem("ECargoInsuredDist.cCertfCde", {
      disabled: false,
    });
    setFormItem('ECargoInsuredDist.tCertfBgnDate',{
      disabled:false
    })
    setFormItem('ECargoInsuredDist.tCertfEndDate',{
      disabled:false
    })
    setFormItem('ECargoInsuredDist.cLongendTyp',{
      disabled:false
    })
  }
  setFormValue(ECargoInsuredDistValue);
}
// 国民经济行业分类
const funcNdustryCate = () => {
  dialog.value?.open(
    "ndustryCateModal",
    {
      type: "show",
      method: {
        getdbClickData: (data:any) => {
          setFormItem("ECargoInsuredDist.cTrdCde", {
            loadData: [{ label: data.cnm, value: data.cde }],
          });
          setValue("ECargoInsuredDist.cTrdCde", data.cde);
          dialog.value?.handleClose();
        },
      },
    },
    {},
    { title: "国民经济行业分类", width: 85 }
  );
}
// 职业
const cOccupCdeChange = () => {
  dialog.value?.open(
    "cOccupCdeModal",
    {
      type: "show",
      method: {
        getdbClickData: (data:any) => {
          setFormItem("ECargoInsuredDist.cOccupCde", {
            loadData: [{ label: `${data.cde} ${data.cnm}`, value: data.cde }],
          });
          setValue("ECargoInsuredDist.cOccupCde", data.cde);
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
const tCertMrkChecked = (val:any)=>{
  if (val == "1") {
    setValue(
        "ECargoInsuredDist.tCertfEndDate",
        moment(new Date("2099-12-31")).format("YYYY-MM-DD HH:mm:ss")
    );
    setFormItem("ECargoInsuredDist.tCertfEndDate", { disabled: true });

  } else {
    setValue("ECargoInsuredDist.tCertfBgnDate", "");
    setValue("ECargoInsuredDist.tCertfEndDate", "");
    if (!initFlag || props.data.title === '新增') {
      setFormItem("ECargoInsuredDist.tCertfEndDate", { disabled: false });
    }
  }
}
// 移动电话
const mobileChange = (val:any) => {
  let cClntMrk = getValue('ECargoInsuredDist.cClntMrk'); // 法人  1个人  0法人
	let cTel = getValue('ECargoInsuredDist.cTel'); // 固定电话
	clearValidate('ECargoInsuredDist.cTel')
  if (cClntMrk && val) {
    setFormItem("ECargoInsuredDist.cMobile", {
      rules: [getRules("required", {}), getRules("phoneNo", {})],
    });
    setFormItem("ECargoInsuredDist.cTel", { rules: [getRules("phone", {})] });
  }
	if (cClntMrk == '0' && !val && cTel) {
    setFormItem("ECargoInsuredDist.cMobile", {
      rules: [getRules("phoneNo", {})],
    });
    setFormItem("ECargoInsuredDist.cTel", { rules: [getRules("required", {}), getRules("phone", {})] });
  }
  setValue('ECargoInsuredDist.cEnterpriseTel', val)
}
// 固定电话
const cTelChange = (val:any) => {
  let cClntMrk = getValue('ECargoInsuredDist.cClntMrk'); // 法人  1个人  0法人
  let cMobile = getValue('ECargoInsuredDist.cMobile');  // 移动 

  if (cClntMrk == '0' && val && !cMobile) {
    setFormItem("ECargoInsuredDist.cTel", {
      rules: [getRules("phone", {}), getRules("required", {})],
    });
    setFormItem("ECargoInsuredDist.cMobile", { rules: getRules("phoneNo", {}) });
  }
}
// 证件类型change
const InsuredCCertfCls =(val:any) => {
  if (!initFlag || props.data.title === '新增') {
    checkUser(); // 调用客户信息接口
    clearValidate('ECargoInsuredDist.cCertfCde'); // 清除报错信息
  }
  const personFields = ['cNation', 'tBirthday', 'nAge', 'cSex'];
  personFields.forEach(field => {
    setFormItem(`ECargoInsuredDist.${field}`, { disabled: false });
  });
  setFormItem("ECargoInsuredDist.tCertfBgnDate", { rules: null });
  setFormItem("ECargoInsuredDist.tCertfEndDate", { rules: null });
  setFormItem("ECargoInsuredDist.tEstablishingDate", { rules: null });

  if (val == "111") {
    setFormItem("ECargoInsuredDist.cCertfCde", {
      rules: [getRules("required", {}), getRules("idCard", {})],
    });
    setFormItem("ECargoInsuredDist.tCertfBgnDate", {
      rules: [getRules("required", {})],
    });
    setFormItem("ECargoInsuredDist.tCertfEndDate", {
      rules: [getRules("required", {})],
    });
    setValue("ECargoInsuredDist.cNation", "CHN"); // 国籍

    personFields.forEach(field => {
      setFormItem(`ECargoInsuredDist.${field}`, { disabled: true });
    });
  } else if (val == "110002") {
    setFormItem("ECargoInsuredDist.tCertfBgnDate", {
      rules: [getRules("required", {})],
    });
    setFormItem("ECargoInsuredDist.cCertfCde", {
      rules: [getRules("required", {}), getRules("passPort", {})],
    });
   } else if ( val == "01") {
    setFormItem("ECargoInsuredDist.tCertfBgnDate", {
      rules: [getRules("required", {})],
    });
    setFormItem("ECargoInsuredDist.tCertfEndDate", {
      rules: [getRules("required", {})],
    });
    setFormItem("ECargoInsuredDist.cCertfCde", {
      rules: [getRules("required", {}), getRules("socialCode", {})],
    });
  } else if (val === '07') {
    // 护照
    setFormItem("ECargoInsuredDist.cCertfCde", {
      rules: [getRules("required", {}), getRules("passPort", {})],
    });
  } else if(val == "553"){
    // 外国人证件号
    setFormItem("ECargoInsuredDist.cCertfCde", {
      rules: [getRules("required", {}),getRules("ariCard", {})],
    });
  } else {
    setFormItem("ECargoInsuredDist.cCertfCde", {
      rules: [getRules("required", {})],
    });
  }
  // 回显不执行下方操作
  if (initFlag && props.data.title !== '新增') return;
  // 切换清空
  if (val) {
    const fieldsToClear = ["ECargoInsuredDist.tBirthday", "ECargoInsuredDist.nAge", "ECargoInsuredDist.cCertfCde"];
    fieldsToClear.forEach((field:any) => {
      setValue(field, null);
      setTimeout(() => {
        clearValidate(field);
      }, 10);
    });
  }
}
// 证件号码change
const cCertfCdeChange =(val:any) => {
  setTimeout(() => {
    if (initFlag && props.data.title !== '新增') {
      return;
    }
    checkUser();
    const cCertfCls = getFromValue()["ECargoInsuredDist.cCertfCls"];
    if (cCertfCls == "111") {
      if (val) {
        const certfCde = getFromValue()["ECargoInsuredDist.cCertfCde"];
        freeEditRef.value?.validateField('ECargoInsuredDist.cCertfCde').then((isValid) => {
          if (isValid) {
            idAnalysis(val)
          }
        })
      }
    } else if (cCertfCls == '01') {
      // setValue('ECargoInsuredDist.cTaxRegistrationNo', val)
      // setValue('ECargoInsuredDist.cOrganizationCode', val)
    }
  }, 10)
}
// 电子邮箱
const emailChange = (val:any) => {
  if (val) {
    setFormItem("ECargoInsuredDist.cEmail", { rules: [getRules("email", {})] });
  }
}
//注册地址是否同上
const isSameChange = (val:any) => {
  if(initFlag && props.data.title !== '新增') {
    return;
  }
	if (val == "1") {
		const ads = getValue("ECargoInsuredDist.Prop");
		const a = getValue("ECargoInsuredDist.cSuffixAddr") || "";

		setValue("ECargoInsuredDist.RegisterProp", ads);
		setValue("ECargoInsuredDist.cRegisterSuffixAddr", a);
	}
}
//常住地址
const getCountryInsured = (val:any)=>{
  setregistAdd()
}
//常住地址(input)
const getcSuffixAddr = (val: any) => {
  setregistAdd();
}
//注册地址
const getAllPropInsured = (val:any)=>{
  setRegisterAdd()
}
//注册地址(input)
const getcRegisterSuffixAddr = (val: any) => {
  setRegisterAdd();
}
// 是否分支机构
const cIsBranchChange = (val: any) => {
  if (val) {
    setCapitalRequiredRule(getValue, setFormItem, 'ECargoInsuredDist');
  }
}
// 单位性质
const cWorkDptChange = (val: any) => {
  setCapitalRequiredRule(getValue, setFormItem, 'ECargoInsuredDist');

  const clientNature = getValue('ECargoInsuredDist.cClntMrk');
  const isSpecialCase = cWorkDptList.includes(val) && clientNature === '0';
  const requiredRule = [getRules("required", {})];
  //实名认证方式
  // setFormItem("ECargoInsuredDist.cRealnameAuthType", {
  //   rules: isSpecialCase ? requiredRule : []
  // });
  // 法定代表人/责任人
  setFormItem("ECargoInsuredDist.cLegalRepresentative", {
    rules: isSpecialCase ? requiredRule : []
  });
  // 企业成立日
  setFormItem("ECargoInsuredDist.tEstablishingDate", {
    rules: isSpecialCase ? requiredRule : []
  });
  if (val =='310' || val =='320' || val =='330' || val =='340' || val =='350'|| val =='360') { 
    setFormItem("ECargoInsuredDist.nRegisteredCapital", {
      rules: [getRules("required", {})],
    });
    setFormItem("ECargoInsuredDist.cFirmscaleTyp", {
      rules: [getRules("required", {})],
    });
  }else{
    setFormItem("ECargoInsuredDist.nRegisteredCapital", {
      rules: []
    });
    setFormItem("ECargoInsuredDist.cFirmscaleTyp", {
      rules: []
    });
  }

  const leiCodeRule = [getRules("leiCode", {})];
  if (val === '350') {
    setFormItem("ECargoInsuredDist.cGcidCode", {
      rules: [...requiredRule, ...leiCodeRule]
    });
  } else if (val) {
    setFormItem("ECargoInsuredDist.cGcidCode", {
      rules: leiCodeRule
    });
  }
}
// 办理人员证件种类
const cOperaterCertfTypChange = (val: any) => {
  // 清除报错信息
  clearValidate('ECargoInsuredDist.cOperaterCertfCde')
  let cClntMrk = getValue('ECargoInsuredDist.cClntMrk');  // 投保人性质 
  let baseRules: any[] = [];
  type RuleType = "orgCode" | "socialCode" | "idCard" | "passPort" | "ariCard" | "required";
  const ruleMap: Record<string, RuleType> = {
    "110001": "orgCode",
    "01": "socialCode",
    "111": "idCard",
    "07": "passPort",
    "553": "ariCard",
  };
  baseRules = ruleMap[val] ? [getRules(ruleMap[val], {})] : [];
  if (cClntMrk == '0') {
    baseRules = [getRules("required", {}), ...baseRules]
  }

  setFormItem("ECargoInsuredDist.cOperaterCertfCde", {
    rules: baseRules,
  });
}
// 证件有效起期
const tCertfBgnDateDisable= (date: any) => {
  const fs = getFromValue();
  if (fs && JSON.stringify(fs) !== '{}') {

    const endDate = new Date(fs["ECargoInsuredDist.tCertfEndDate"] || '')   // 结束时间
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
    const startDate = new Date(fs["ECargoInsuredDist.tCertfBgnDate"] || '')   // 开始时间
    let maxDate = dayjs(startDate).valueOf();
    return date.getTime() < maxDate
  } else {
    return true;
  }
}
// 办理人证件有效止期 小于当前时间
const tOEndTmDisable =(date: any) => {
  return disablePastDates(date);
}

function setregistAdd() {
  const ads = getValue("ECargoInsuredDist.Prop");
  const a = getValue("ECargoInsuredDist.cSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        setValue("ECargoInsuredDist.cClntAddr", b);
        setAddressStr("ECargoInsuredDist.cHabitualResidence", b);
      }
    });
  } else {
    setValue("ECargoInsuredDist.cClntAddr", a);
    setAddressStr("ECargoInsuredDist.cHabitualResidence", a);
  }
}

function setRegisterAdd() {
  const ads = getValue("ECargoInsuredDist.RegisterProp");
  const a = getValue("ECargoInsuredDist.cRegisterSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        console.log(b);
        setValue("ECargoInsuredDist.cRegisteredcapDre", b);
      }
    });
  } else {
    setValue("ECargoInsuredDist.cRegisteredcapDre", a);
  }
}

function setAddressStr(key: any, data: any) {
  freeEditRef?.value?.setValue(key, data);
}

const setcDetailedAddress = (prop:any,aftProp:any)=> {
  const ads = freeEditRef?.value?.getValue(prop[0].prop);
  const a = freeEditRef?.value?.getValue(prop[1].prop) || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        freeEditRef?.value?.setValue(aftProp.prop, b);
      }
    });
  } else {
    freeEditRef?.value?.setValue(aftProp.prop, a);
  }
};
//  根据 客户名称 / 被保人性质/ 证件类型 / 证件号码 获取客户信息
const checkUser = () => {
  // 自定义录单 方案配置 模版 进入 可以查询用户信息
  // if (param.pageType !== "app" &&  param.pageType !== "copy" && param.pageType !== "template" && param.cAppStatus !=='1') {
  //   return false;
  // }
  const applicantValue = freeEditRef.value?.getFromValue()
//  只要4个有值 去请求客户信息
  if (
      applicantValue["ECargoInsuredDist.cInsuredNme"]&&
      applicantValue["ECargoInsuredDist.cCertfCls"] &&
      applicantValue["ECargoInsuredDist.cCertfCde"]
  ) {
    const param = {
      coustName: applicantValue["ECargoInsuredDist.cInsuredNme"],
      coustType:applicantValue["ECargoInsuredDist.cCertfCls"],
      coustCode: applicantValue["ECargoInsuredDist.cCertfCde"],
      personnelType:"ECargoInsuredDist"
      // personnelType:"Applicant"
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
              // 	const newKey = key.replace('Applicant.', 'ECargoInsuredDist.');
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

              setValue('ECargoInsuredDist.cInsuredCde', data[0]['ECargoInsuredDist.cCargoAppCde']);
              setValue('ECargoInsuredDist.cCertfCde', data[0]['ECargoInsuredDist.cCargoCertfCde']);
              let userId = getValue('ECargoInsuredDist.cCertfCde')
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
  const applicantValue = freeEditRef.value?.getFromValue() //tabref["AgreementApplicant"].getFormValue();
  if ( !id || id.length !== 18 || (applicantValue["ECargoInsuredDist.cCertfCls"] !=='111' && applicantValue["ECargoInsuredDist.cCertfCls"] !=='553')) {
    return false
  }
  const birthYear = parseInt(id.substring(6, 10), 10);
  const birthMonth = parseInt(id.substring(10, 12), 10);
  const birthDay = parseInt(id.substring(12, 14), 10);
  const birthday = `${birthYear}-${birthMonth.toString().padStart(2, "0")}-${birthDay.toString().padStart(2, "0")}`;
  const sexCode = parseInt(id.substring(16, 17), 10);
  const sex = sexCode % 2 === 0 ? "2" : "1"; // 1: 男, 2: 女
  const age = new Date().getFullYear() - birthYear;

  setValue("ECargoInsuredDist.cNation", "CHN"); // 国籍
  setValue("ECargoInsuredDist.tBirthday", birthday);
  setValue("ECargoInsuredDist.nAge", age);
  setValue("ECargoInsuredDist.cSex", sex);
}


//总保额币种下拉事件
const cAmtCurChange = (val: any)=>{
  const foundItem:any = rateDetail.value.nAmtExch.find((item:any) => item.label === val);
  setValue("ECargoGoodsTgt.nAmtExch", foundItem.value);
  setValue('ECargoGoodsTgt.nRmbLimit',toFixTwo(Number(getValue('ECargoGoodsTgt.nInsuranceAmount'))*getValue('ECargoGoodsTgt.nAmtExch')))
  setValue('ECargoGoodsTgt.cExchCde',rateDetail.value.cExchCde)
  // if (val !== "CNY") {
  //   codeListStore
  //       .queryCodeList({
  //         codeListName: "WEB_BAS_CHGRATE",
  //         codeListParam: { value: val },
  //       })
  //       .then((res) => {
  //         console.log("0000000", res);
  //         setValue("ECargoGoodsTgt.nAmtExch", res[0].currency_rate);
  //         setValue('ECargoGoodsTgt.nRmbLimit',Number(getValue('ECargoGoodsTgt.nInsuranceAmount'))*getValue('ECargoGoodsTgt.nAmtExch'))
  //       });
  // } else {
  //   setValue("ECargoGoodsTgt.nAmtExch", "1.000000");
  //   setValue('ECargoGoodsTgt.nRmbLimit',Number(getValue('ECargoGoodsTgt.nInsuranceAmount')))
  // }
}
// 运输信息币种change事件
const cAmtCurChange1 = (val: any)=>{
  if (val !== "CNY") {
    codeListStore
        .queryCodeList({
          codeListName: "WEB_BAS_CHGRATE",
          codeListParam: { value: val },
        })
        .then((res) => {
          console.log("0000000", res);
          setValue("ECargoTransportDist.nAmtExch", res[0].currency_rate);
          setValue('ECargoTransportDist.nRmbLimit',
						Number(getValue('ECargoTransportDist.nTransportLimit')*getValue('ECargoTransportDist.nAmtExch'))
					)
        });
  } else {
    setValue("ECargoTransportDist.nAmtExch", "1.000000");
    setValue('ECargoTransportDist.nRmbLimit', Number(getValue('ECargoTransportDist.nTransportLimit')))
  }
} 
// 运输信息航次运输限额change事件
const nTransportLimitchange = (val:any)=>{
  const goodsValueData = getValue('ECargoTransportDist.nAmtExch')
  if(goodsValueData){
    setValue('ECargoTransportDist.nRmbLimit',Number(goodsValueData * val))
  }
}
const bonusRatio = (val:any)=>{
  const bonusRatioData =  getValue('ECargoGoodsTgt.nAdditiveRatio')
  const goodsValueData = getValue('ECargoGoodsTgt.nGoodsValue')
 if( goodsValueData){
    setValue('ECargoGoodsTgt.nInsuranceAmount',toFixTwo(goodsValueData * (1 + bonusRatioData/100)))
 }
  if(getValue('ECargoGoodsTgt.nInsuranceAmount')){
    setValue('ECargoGoodsTgt.nRmbLimit',toFixTwo(Number(getValue('ECargoGoodsTgt.nInsuranceAmount'))*getValue('ECargoGoodsTgt.nAmtExch')))
  }
}
const goodsValue = (val:any)=>{
  const bonusRatioData =  getValue('ECargoGoodsTgt.nAdditiveRatio')
  const goodsValueData = getValue('ECargoGoodsTgt.nGoodsValue')
  if(goodsValueData){
    setValue('ECargoGoodsTgt.nInsuranceAmount',toFixTwo(goodsValueData * (1 + bonusRatioData/100)))
  }
  if(getValue('ECargoGoodsTgt.nInsuranceAmount')){
    setValue('ECargoGoodsTgt.nRmbLimit',toFixTwo(Number(getValue('ECargoGoodsTgt.nInsuranceAmount'))*getValue('ECargoGoodsTgt.nAmtExch')))
  }
}
  //根据获取的职业类别查询职业等级并绑定下拉框
const getDistoccupType = (val) => {
  if(!val || val.length < 3) return;
  codeListStore.queryCodeList({
    codeListName: "Occupt_ZYLB",
    codeListParam: {cParCde: val.at(-1)},
  }).then((res) => {
    const item = freeEditRef.value?.getFromSchemaItem('DistECargo.cOccupationalLevel')
    //给表单下拉项赋值
    item.itemConfig.loadData = res
  });
};

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

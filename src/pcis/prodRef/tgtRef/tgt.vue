<!-- 标的信息 -->
<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="tgtEditRef" />
  <comDialog ref="dialog"></comDialog>
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useProductStore } from "@/store/modules/prod";
import { rule } from "postcss";
import { useValidator } from "@/typings/useValidator";
import { syncDist ,selectDist,checkAppBase } from "@/api/prod";

const wagesInfo = defineAsyncComponent(
  () => import("@/views/comprehensive-query/modal/wages-info-model.vue")
);
const countryInfo = defineAsyncComponent(
  () => import("@/views/comprehensive-query/modal/country-info-modal.vue")
);
const surveyInfo = defineAsyncComponent(
  () => import("@/views/comprehensive-query/modal/survey-info-modal.vue")
);

import { useDzModal } from "@/common/dzmodel/DzModalService";
import moment from "moment";

import { descryptParameter, encryptParameter } from "@/utils/encipher";
import { useRouter, useRoute } from 'vue-router';
import {DialogMethod} from "@/common/dzmodel/ComDialogConf";
import dayjs from "dayjs";
import {getAddressStr} from "@/api/query";
const route = useRoute();
const query = ref(route.query);
const router = useRouter();
const param = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}");


const dzmodal = useDzModal();
const { getRules } = useValidator();
const opertaor = dataOpertaor();
const params = opertaor.getParam();
const productStore = useProductStore()
const dialog = ref<DialogMethod | null>(null);

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
  compKey: {
    type: String,
    required: false,
  },
});

const tgtEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));

const distContactList:Array<string> = ['Tgt.DispatchProp','Tgt.cDispatchAddress',"Tgt.DepartureAirportProp","Tgt.cDepartureAirportAddress",
  "Tgt.TransitProp","Tgt.cTransitAddress","Tgt.DestinationAirportProp","Tgt.cDestinationAirportAddress",
  "Tgt.DestinationProp","Tgt.cDestinationAddress"]

onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );

  console.log('------------',props.pageSchema)
  
  for(let i = 0; formconfig11.fromSchema && i < formconfig11.fromSchema.length; i++){
    // 遍历groupList数组把函数赋值给fromSchema
    if (formconfig11.fromSchema[i]["groupList"] && formconfig11.fromSchema[i]["groupList"].length>0) {
      formconfig11.fromSchema[i]["groupList"].forEach((data:any,index:number,arr:any) =>{
        if(distContactList.includes(data.prop)){
          formconfig11.fromSchema[i]["groupList"][index]['func'] = function (){
            return setcDetailedAddress(arr,JSON.parse(JSON.stringify(formconfig11.fromSchema[i+1])))
          }
        }
      })
    }
  }
  Object.assign(formconfig1, formconfig11);
  if(params.cProdNo === '045001'){
    setFormItem("Tgt.cInsuranceMethod", {typeCode: 'InsuranceMethod045001'});
  }
  // 约定保期内服务次数正整数
  setFormItem("Tgt.nAgreeFrequency", {
    rules: [getRules("signlessInt", {})],
  });
  setFormItem("Tgt.nCarsNumber", {
    rules: [getRules("required", {'trigger':'blur'}),getRules("positiveNumber", {})],
  });

  setFormItem("Tgt.cContactNumber", {
    rules: [getRules("phoneNo", {})],
  });
  setFormItem("Tgt.cLicenseNumber", {
    rules: [getRules("vehiclePlate", {})],
  });
});

const wagesInfoModel = () => {
  let cRegisteredLogo = opertaor.getDataAll()['tgt']['Tgt.cRegisteredLogo'];  // 记名投保标志 是 获取清单汇总   否可以自己修改添加
  let cAppNo = opertaor.getDataAll()['plyBase']['Base.cAppNo'];
  let cInquiryNo = opertaor.getDataAll()['plyBase']['Base.cInquiryNo'];
  dzmodal.open(wagesInfo, { type: "edit", data: { cAppNo: cAppNo, cRegisteredLogo: cRegisteredLogo, cInquiryNo: cInquiryNo, pageName: route.params.param?.pageName } }).then((res: any) => {
    if (res.type === "ok") {
      // setFormItem('Tgt.nTotalSalary',
      setValue("Tgt.nTotalSalary", res.body)
    }
  });
}
//水运规则
const tgtWaterMatterList:Array<string> = ["Tgt.cShipName","Tgt.cTransportVoyage","Tgt.cTransportationName","Tgt.tConstructionYear","Tgt.nTransportationTotalTonnage","Tgt.cShipRegistration","Tgt.nTransportationShipAge","Tgt.cShipType","Tgt.cShipClassOne","Tgt.cShipClassTwo","Tgt.cShipClassThree","Tgt.cOldshipSurcharge"]
//水运外其他规则
const tgtOtherMatterList:Array<string> = ["Tgt.cLicenseNumber","Tgt.cFrameNumber","Tgt.cTransitMode"]
//非水运隐藏
const tgtIsWaterMatterList:Array<string> = ["Tgt.cTowing","Tgt.cWholeShip","Tgt.cShipName","Tgt.cTransportVoyage","Tgt.nTotalTonnage","Tgt.nShipAge","Tgt.cTransportationName","Tgt.tConstructionYear","Tgt.nTransportationTotalTonnage","Tgt.cShipRegistration","Tgt.nTransportationShipAge","Tgt.cShipType","Tgt.cShipClassOne","Tgt.cShipClassTwo","Tgt.cShipClassThree","Tgt.cOldshipSurcharge"]
const setIsRule = ()=>{
  if(getValue("Tgt.cTowing") === '1'){
    setFormItem("Tgt.cShipType", {
      typeCode: 'Ship_Type',
      codeParam: { 'cMapCde': '1' },
    });
  }else {
    setFormItem("Tgt.cShipType", {
      typeCode: 'Ship_Type',
      codeParam: { },
    });
  }
  if(getValue("Tgt.cTowing") === '1' || getValue("Tgt.cWholeShip") === '1'){
    tgtWaterMatterList.forEach(item =>{
      setFormItem(item, {
        rules: [getRules("required", {})],
      });
    })
  }else if(getValue("Tgt.cTowing") === '0' || getValue("Tgt.cWholeShip") === '0'){
    tgtWaterMatterList.forEach(item =>{
      setFormItem(item, {
        rules: null,
      });
    })
  }
}

 const  funcdistadd=  () => {

  };
function calculateCarAge(initialDateStr:any) {
  const initialDate = new Date(initialDateStr);
  const currentDate = new Date();

  // 计算时间差（毫秒）
  const diffTime = currentDate - initialDate;

  // 获取初登年份
  const year = initialDate.getFullYear();

  // 判断是否为闰年
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const daysInYear = isLeapYear ? 366 : 365;

  // 计算车龄（年）
  const carAge = diffTime / (1000 * 60 * 60 * 24) / daysInYear;

  // 四舍五入保留一位小数
  const roundedAge = Number(carAge.toFixed(1));

  // 如果小于0.5，返回0.5，否则返回原值
  return roundedAge < 0.5 ? 0.5 : roundedAge;
}
//计算两个日期年份差
function calAgeDif(val1:any,val2:any) {
  const date1 = new Date(val1);
  const date2 = new Date(val2);

  const diffInMilliseconds = Math.abs(date1 - date2);
  const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25; // 考虑闰年平均一年365.25天

  const diffInYears = diffInMilliseconds / millisecondsInYear;

  return Math.round(diffInYears)
}
const guaranteeMethodList = ['Tgt.cCollateralName','Tgt.cPledgeNumber','Tgt.cPledgeAddress','Tgt.cItemNumber','Tgt.nFaceValue','Tgt.cApplicationLine','Tgt.cBankApply','Tgt.cAcceptor','Tgt.cMaturityWeek','Tgt.cDueWeek','Tgt.tTicketStartingandending','Tgt.cConfirmingBank']
const cMortgageList =['Tgt.cMortgageName','Tgt.cMortgageNumber','Tgt.cCollateralAddress']
const setcDetailedAddress = (prop:any,aftProp:any)=> {
  const ads = getValue(prop[0].prop);
  const a = getValue(prop[1].prop) || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        setValue(aftProp.prop, b);
      }
    });
  } else {
     setValue(aftProp.prop, a);
  }
};
// 绑定方法
const method = {
  getcNavigationAreaChange:()=>{
    dialog.value?.open('navigationAreaTips', null,
        null,{width: 50,title:'航行区域提示'});
  },
  getcInsuranceIndustryChange:(val:string)=>{
    if(val === '8'){
      setFormItem('Tgt.cIndustryRemarks', {
        rules: [getRules("required", {})],
      });
    }else{
      setFormItem('Tgt.cIndustryRemarks', {
        rules: null
      });
    }
  },
  getcIsExcludingChange:()=>{
    dialog.value?.open('reinsuranceTips', null,
        null,{width: 45,title:'水险再保提示'});
  },
  getcSanctionAreasChange:()=>{
    dialog.value?.open('detailsKnows', null,
        null,{width: 45,title:'战争及罢工险核保限制和运输地国家限制'});
  },
  gettCompletionYearChange:(val:string)=>{
    const currentYear = new Date().getFullYear();
    setValue('Tgt.nShipAge',currentYear - Number(val))
  },
  gettCompletionDateChange:(val:string)=>{
    const insrnc = opertaor.getTableRefByKey( "insrnc").getFromValue()
    setValue('Tgt.nServiceLife',calAgeDif(insrnc['Base.tAppTm'],val))
  },
  getcGuaranteeMethodChange:(val:string)=>{
    //担保方式选择"质押贷款"时带出
    if(val === 'B05Assure004'){
      guaranteeMethodList.forEach(item=>{
        setFormItem(item, {
          hidden: false,
        });
      })
    }else{
      guaranteeMethodList.forEach(item=>{
        setFormItem(item, {
          hidden: true,
        });
      })
    }
    // 担保方式选择"抵押贷款"时带出
    if(val === 'B05Assure003'){
      cMortgageList.forEach(item=>{
        setFormItem(item, {
          hidden: false,
        });
      })
    }else{
      cMortgageList.forEach(item=>{
        setFormItem(item, {
          hidden: true,
        });
      })
    }
    // 担保方式选择"保证贷款 "时带出
    if(val === 'B05Assure002'){
      setFormItem('Tgt.cTypeName', {
        hidden: false,
      });
    }else{
      setFormItem('Tgt.cTypeName', {
        hidden: true,
      });
    }
  },
  // 是否单项工程 
  getcIsSingleChange:(val:string)=>{
    console.log(val)
    if(val=== '1'){
      // 工程总造价 （元）
      setFormItem('Tgt.nTotalCost', {
        rules: [getRules("required", {})],
      });
      setFormItem('Tgt.nSurveyPrice', {
        rules: [getRules("required", {})],
      });
      setFormItem('Tgt.Prop', {
        rules: [getRules("required", {})],
      });
      setFormItem('Tgt.cSuffixAddr', {
        rules: [getRules("required", {})],
      });

       if(params.cProdNo==='042001'){
        formconfig1.fromUi.groupBy[1].hidden = false
          setFormItem('Tgt.cProjectName', {
             hidden: false,
           rules: [getRules("required", {})],
          });
    
          setFormItem('Tgt.nTotalCost', {
          hidden: false,
           rules: [getRules("required", {})],
          });
    
          setFormItem('Tgt.nTotalDesign', {
          hidden: false,
           rules: [getRules("required", {})],
          });
          setFormItem('Tgt.ProjectAddress', {
          hidden: false,
           rules: [getRules("required", {})],
          });
      }

    }else {

      // Tgt.cProjectName

      setFormItem('Tgt.nTotalCost', {
        rules: null
      });
      setFormItem('Tgt.nSurveyPrice', {
        rules: null
      });
      setFormItem('Tgt.Prop', {
        rules: null
      });
      setFormItem('Tgt.cSuffixAddr', {
        rules: null
      }); 


      if(params.cProdNo==='042001' && val=== '0'){
        formconfig1.fromUi.groupBy[1].hidden = true
          setFormItem('Tgt.cProjectName', {
             hidden: true,
             rules: null
          });
    
          setFormItem('Tgt.nTotalCost', {
            hidden: true,
            rules: null
          });
    
          setFormItem('Tgt.nTotalDesign', {
            hidden: true,
            rules: null
          });
          setFormItem('Tgt.ProjectAddress', {
            hidden: true,
            rules: null
          });
      }
      
 
    }
    
  },
  getcTransportationToolsChange:(val:string)=>{
    if(val=== '02'){
      setFormItem('Tgt.cPlateNumber', {
        rules: [getRules("required", {})],
      });
    }else {
      setFormItem('Tgt.cPlateNumber', {
        rules: null
      });
    }
  },
  funccDetailsAccident:()=>{
    dialog.value?.open('detailsAccident', {
          selectedData: getValue("Tgt.cFinanceCde"), //需要把自定义的过滤掉，只传过去从模板中选择的
        },
        {
          getSelected(selectdata: any) {
            setValue("Tgt.cFinanceCde",selectdata.map(item => item.value).join(','))
            setValue("Tgt.cDetailsAccident",selectdata.map((item, index) => `${index + 1}. ${item.label}`).join('\n'))
          },
        },{width: 45});
  },
  getcMemberLogoChange:(val:string)=>{
    console.log('val',val)
    if(val=== '1'){
      setFormItem('Tgt.cBareboatLessee', {
        rules: [getRules("required", {})],
      });


      setFormItem('Tgt.P&I_CLUB', {rules: [getRules("required", {})]})
      // setFormItem('Tgt.cBareboatLessee', {
      //   rules: [getRules("required", {})],
      // });
    }else {
      setFormItem('Tgt.cBareboatLessee', {
        rules: null
      });
       setFormItem('Tgt.P&I_CLUB', {rules: []})
    }
  },
  getcRentalLogoChange:(val:string)=>{
    if(val=== '1'){
      setFormItem('Tgt.cBareboatLessee', {
        rules: [getRules("required", {})],
      });
      
    }else {
      setFormItem('Tgt.cBareboatLessee', {
        rules: null
      });
    }
  },
  getcMortgageMarkChange:(val:string)=>{
    if(val=== '1'){
      setFormItem('Tgt.cShipMortgagee', {
        rules: [getRules("required", {})],
      });
      setFormItem('Tgt.nMortgageAmount', {
        rules: [getRules("required", {})],
      });
    }else {
      setFormItem('Tgt.cShipMortgagee', {
        rules: null
      });
      setFormItem('Tgt.nMortgageAmount', {
        rules: null
      });
    }
  },
  gettInitialDateChange:(val:string)=>{
  setValue("Tgt.cVehicleAge",calculateCarAge(val))
  },
  getcShippingMethodChange:(val:string)=>{
    if(val === 'NV591001'){
      tgtIsWaterMatterList.forEach(item =>{
        setFormItem(item, {
          hidden: false,
        });
      })
      tgtOtherMatterList.forEach(item =>{
        setFormItem(item, {
          hidden: true,
        });
      })
    }else{
      tgtIsWaterMatterList.forEach(item =>{
        setFormItem(item, {
          hidden: true,
        });
      })
      tgtOtherMatterList.forEach(item =>{
        setFormItem(item, {
          hidden: false,
        });
      })
    }
    if(val === 'NV591003'){
      tgtOtherMatterList.forEach(item =>{
        setFormItem(item, {
          rules: [getRules("required", {})],
        });
      })
    }else {
      tgtOtherMatterList.forEach(item =>{
        setFormItem(item, {
          rules: null,
        });
      })
    }
  },
  getcShippingTypeChange:(val:string)=>{
    if(val === '04'){
      setFormItem("Tgt.cRailwayMode", {
        rules: [getRules("required", {})],
      });
    }else{
      setFormItem("Tgt.cRailwayMode", {
        rules: [],
      });
    }
  },
  getcTransportChange:(val:string)=>{
    if(val === '1'){
      setFormItem("Tgt.cTransportTools", {
        readonly: '0',
      });
    }else {
      setValue("Tgt.cTransportTools", '')
      setFormItem("Tgt.cTransportTools", {
        readonly: '1',
      });
    }
 },
  getcTowingChange:(val:string)=>{
    setIsRule()
 },
  getcWholeShipChange:(val:string)=>{
     setIsRule()
  },
  // func demo
  func1: () => {
    console.log(getRules);
  },
  //投保乘客座位总数改变事件
  changenTotalInsured: () => {
    setValue("Tgt.nSeatCapacity", Number(getValue("Tgt.nTotalInsured")) + Number(getValue("Tgt.nInsuredcompanySeats")))
  },
  //投保司乘人员座位总数改变事件
  changenInsuredcompanySeats: () => {
    setValue("Tgt.nSeatCapacity", Number(getValue("Tgt.nTotalInsured")) + Number(getValue("Tgt.nInsuredcompanySeats")))
  },
  //是否单项工程change事件
  cIsSingleFunc: (val) => {
    console.log('123123',vals)

    if (val == '1') {
      let obj = {
        rules: [getRules("required", {})],
        hidden: false
      }
      singChange(obj)
    } else {
      let obj = {
        rules: null,
        hidden: true
      }
      singChange(obj)
    }
    //把数据存在store，清单信息组件的是否必填根据这个来
    productStore.setCIsSingle(val)
  },
  funcInsuranceChange: (val) => {
    groupCheck();
    //根据投保方式得选择对应控制必填项
    if (val == '613002') {
      setFormItem("Tgt.nEngineeringCost", {
        rules: [getRules("required", { blur: true })],
      });
      setFormItem("Tgt.nProjectArea", { rules: null });
      setFormItem("Tgt.nLaborPrice", { rules: null });
    } else if (val == '613003') {
      setFormItem("Tgt.nEngineeringCost", { rules: null });
      setFormItem("Tgt.nProjectArea", {
        rules: [getRules("required", { blur: true })],
      });
      setFormItem("Tgt.nLaborPrice", { rules: null });
    } else if (val == '613004') {
      setFormItem("Tgt.nEngineeringCost", { rules: null });
      setFormItem("Tgt.nProjectArea", { rules: null });
      setFormItem("Tgt.nLaborPrice", {
        rules: [getRules("required", { blur: true })],
      });
    }
    const cvrgref = opertaor.getTableRefByKey("cvrg");
    if (cvrgref.showFlush) {
      cvrgref.showFlush();
    }
  },
  cDeterminingChange: (val:any) => {
    const cvrgref = opertaor.getTableRefByKey("cvrg");
    if (cvrgref.showFlush) {
      cvrgref.showFlush();
    }
    // 直接限额制 投保雇员年工资总额非必填
    if(val === "0") {
      setFormItem("Tgt.nTotalSalary", {
        rules: [],
      });
    } else {
      setFormItem("Tgt.nTotalSalary", {
        rules: [getRules("required", { blur: true })],
      });
    }
  },
  industryTypeChange:(val:any)=>{
    groupCheck();
  },
  wagesInfoBtn: () => {

    let cRegisteredLogo = opertaor.getDataAll()['tgt']['Tgt.cRegisteredLogo'];  // 记名投保标志 是 获取清单汇总   否可以自己修改添加
    // let cAppNo = opertaor.getDataAll()['plyBase']['Base.cAppNo'];   //申请单号
    let cAppNo = "";
    if(route.params.param?.pageName === "priceInquiry") {
      cAppNo = opertaor.getDataAll()['plyBase']['Base.cInquiryNo']
    } else if (opertaor.getDataAll()['applicant'] && opertaor.getDataAll()['applicant']['Applicant.cAppNo']) {
      cAppNo = opertaor.getDataAll()['applicant']['Applicant.cAppNo']
    } else {
      cAppNo = opertaor.getDataAll()['plyBase']['Base.cAppNo'];
    }

    if (cRegisteredLogo !== "1" && cRegisteredLogo !== "0") {
      ElMessage.error('请选择“记名投保标志”！')
      return false;
    }

    if (!cAppNo) {
      ElMessage.error("请先保存申请单!")
      return false;
    }

    // 获取总额方式  没有数据给进行提示
    if (cRegisteredLogo == 1) {
      const param = {
        cComponentTable: "EmployeeDist",
      }
      if(route.params.param?.pageName === "priceInquiry") {
        param['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
      } else {
        param['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
      }
      if(route.params.param?.pageType && route.params.param?.pageType === "EDR_APP_NEW_SCENE") {
        param['voType'] = "ply"
      }
      selectDist(param).then((res: any) => {
        const { code, data, msg } = res;
        if (code == 200) {
          if (data['data'].length > 0) {
            wagesInfoModel();

          } else {
            ElMessage.error('雇员清单不能为空！'); 
          }
        }

      });
    } else {
      // wagesInfoModel();
      funcdistadd();

        // const alldata: any = opertaor.getDataAll();
    // let baseFlag = alldata['plyBase']["Base.cAppNo"];

 
    const param = {};
    if(route.params.param?.pageName === "priceInquiry") {
      param['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
    } else {
      param['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
    }
    checkAppBase(param).then((res: any) => {
      if (res.code === 200) {
        wagesInfoModel();
      } else {
        ElMessage.error("请先保存申请单!");
      }
    });
    }
  },
 // 工程造价
  nEngineeringCostChange: (val) => {
    if (val) {
      setFormItem('Tgt.nLaborPrice', {
        rules: null
      })

      setFormItem('Tgt.nProjectArea', {
        rules: null,
      })
      setFormItem('Tgt.nEngineeringCost', {
        rules: [getRules("required", {})],
      })
    }
  },
  // 工程面积(㎡)
  nProjectAreaChange: (val) => {
    if (val) {

      setFormItem('Tgt.nLaborPrice', {
        rules: null
      })

      setFormItem('Tgt.nProjectArea', {
        rules: [getRules("required", {})],
      })
      setFormItem('Tgt.nEngineeringCost', {
        rules: null,
      })
    }
  },
  // 劳务分包合同价格（元）
  nLaborPriceChange: (val) => {
    if (val) {

      setFormItem('Tgt.nLaborPrice', {
        rules: [getRules("required", {})],
      })

      setFormItem('Tgt.nProjectArea', {
        rules: null,
      })
      setFormItem('Tgt.nEngineeringCost', {
        rules: null,
      })
    }


  },
  // 是否含隧道
  cIncludeBridgesChange: (val) => {
    if (val == 1) {
      setFormItem('Tgt.nBridgeProportion', {
        rules: [getRules("required", {})],
      })
      setFormItem('Tgt.nTunnelProportion', {
        rules: [getRules("required", {})],
      })
    } else {
      setFormItem('Tgt.nBridgeProportion', {
        rules: null,
      })
      setFormItem('Tgt.nTunnelProportion', {
        rules: null,
      })
    }
  },
  // 计划开工日期
  tPlannedDateChange: (v) => {
    const start = getValue("Tgt.tPlannedDate");
    const end = getValue("Tgt.tPlannedCompletion");
    const tm = moment(end).diff(moment(v), "days");
    if (!end || !v) {
      return;
    }
    if (tm < 0) {
      ElMessage.warning("竣工日期不能小于开工日期");
      setValue("Tgt.tPlannedDate", null);
      return;
    }
    setValue("Tgt.nContractDuration", tm);

  },
  // 计划竣工日期 
  tPlannedCompletionChange: (v) => {
    const start = getValue("Tgt.tPlannedDate");
    const end = getValue("Tgt.tPlannedCompletion");
    if (!start || !v) {
      return;
    }
    const tm = moment(v).diff(moment(start), "days");
    if (tm < 0) {
      ElMessage.warning("竣工日期不能小于开工日期");
      setValue("Tgt.tPlannedCompletion", null);
      return;
    }
    setValue("Tgt.nContractDuration", tm);
  },

  ShipClassOneChange:(val: any)=>{
    console.log(val)
    clearValidate('Tgt.cShipClassThree');
    const param = opertaor.getParam();
    if(!param.initFlag){
      if(val=='01'){
        setValue("Tgt.cShipClassTwo", null);
        setValue("Tgt.cShipClassThree", null);
      }
    }
    if(val=='01'){ //rules: [getRules("required", {})]
       setFormItem('Tgt.cShipClassTwo', {disabled:true,rules: null});
       setFormItem('Tgt.cShipClassThree',{disabled:false,rules: [getRules("required", {})]})
       
    }else{
      setFormItem('Tgt.cShipClassTwo', {disabled:false,rules: [getRules("required", {})]});
    
    } 
    if(val=='02'){
      setFormItem('Tgt.cShipClassThree',{disabled:true,rules: null})
      setFormItem('Tgt.cShipClassTwo', {codeParam:{classone:'level1'},typeCode:'Ship_Class_Level2'});
        setValue("Tgt.cShipClassThree", null);
    }
    if(val=='03'){
      setFormItem('Tgt.cShipClassThree',{disabled:true,rules: null})
      setFormItem('Tgt.cShipClassTwo', {codeParam:{classone:'level2'},typeCode:'Ship_Class_Level2',});

      // Tgt.cShipClassTwo
     
      console.log('2222', getValue('Tgt.cShipClassTwo'))
        setValue("Tgt.cShipClassThree", null);
    }

 
  },
  cShipClassTwoChange:(val:any)=>{
     clearValidate('Tgt.cShipClassThree');
    if(val==='15'){
        setFormItem('Tgt.cShipClassThree',{disabled:false,rules: [getRules("required", {})]})
        
    }else if(val){
       setFormItem('Tgt.cShipClassThree',{disabled:true,rules:null})
        setValue("Tgt.cShipClassThree", null);
    }
  },
  // 核定座位总数
  nSeatsNumberChange: (v) => {
    // Tgt.nSeatsNumber 核定总数
    // Tgt.nSeatCapacity 投保总数
    // const start = getValue("Tgt.tPlannedDate");

    // Tgt.P&I_CLUB
    const nSeatCapacity = getValue("Tgt.nSeatCapacity");

    if (v !== nSeatCapacity) {
      ElMessage.warning("核定座位总数和投保座位数总数不一致！");
    }
  },

  // 起运港国家 弹框
  countryFun: () => {
    dzmodal.open(countryInfo, { type: "departure", data: {} }).then((res: any) => {

      if (res.type === "ok") {
        // setFormItem('Tgt.nTotalSalary',
        setValue("Tgt.cDeparturePortCountry",res.body.countryCn)
        setValue("Tgt.cDeparturePortProvince",res.body.portCn)
        setValue("Tgt.cDeparturePort",res.body.countryCn +'/'+  res.body.portCn)
      }
    });
  },
  // 中转地国家 按钮
  cTransitCountryFun: () => {
    dzmodal.open(countryInfo, { type: "departure", data: {} }).then((res: any) => {

      if (res.type === "ok") {
        setValue("Tgt.cTransitCountry", res.body.countryCn);
        setValue("Tgt.cTransitProvince", res.body.portCn);
        setValue("Tgt.cTransitDetail", res.body.countryCn +'/'+ res.body.portCn);
      };
    });
  },
  // 目的港国家 按钮
  cDestinationPortCountryFun: () => {
    dzmodal.open(countryInfo, { type: "departure", data: {} }).then((res: any) => {

      if (res.type === "ok") {
        setValue("Tgt.cDestinationPortCountry", res.body.countryCn);
        setValue("Tgt.cDestinationPortProvince", res.body.portCn);
        setValue("Tgt.cDestinationPort", res.body.countryCn +'/'+ res.body.portCn);
      };
    });

  },
  // // 起运港国家 按钮
  cDestinationCountryFunc: () => {
    dzmodal.open(countryInfo, { type: "departure", data: {} }).then((res: any) => {

      if (res.type === "ok") {
        setValue("Tgt.cDestinationCountry", res.body.countryCn);
        setValue("Tgt.cDestinationProvince", res.body.portCn);
        setValue("Tgt.cDestinationDetail", res.body.countryCn +'/'+ res.body.portCn);
      };
    });
  },
  // 起运地国家 按钮
  cDispatchCountryFunc: () => {
    dzmodal.open(countryInfo, { type: "departure", data: {} }).then((res: any) => {

      if (res.type === "ok") {
        setValue("Tgt.cDispatchCountry", res.body.countryCn);
        setValue("Tgt.cDispatchProvince", res.body.portCn);
        setValue("Tgt.cDispatchDetail", res.body.countryCn +'/'+ res.body.portCn);
      };
    });
  },
  // 起运机场国家
  cDepartureAirportCountryFunc:()=>{
        dzmodal.open(countryInfo, { type: "departure", data: {} }).then((res: any) => {

      if (res.type === "ok") {
        setValue("Tgt.cDepartureAirportCountry", res.body.countryCn);
        setValue("Tgt.cDepartureAirportProvince", res.body.portCn);
        setValue("Tgt.cDepartureAirport", res.body.countryCn +'/'+ res.body.portCn);
      };
    });

  },

  // 目的地机场国家
  cDestinationAirportCountryFunc:()=>{
        dzmodal.open(countryInfo, { type: "departure", data: {} }).then((res: any) => {

      if (res.type === "ok") {
        setValue("Tgt.cDestinationAirportCountry", res.body.countryCn);
        setValue("Tgt.cDestinationAirportProvince", res.body.portCn);
        setValue("Tgt.cDestinationAirport", res.body.countryCn +'/'+ res.body.portCn);
      };
    });

  },

  //  检验代理人  按钮
  cCheckerCdeFunc: () => {
    dzmodal.open(surveyInfo, { type: "departure", data: {} }).then((res: any) => {
      if (res.type === "ok") {

        setValue("Tgt.cCheckerCde",res.body.cSryDoc);   // 代理人
        setValue("Tgt.cAddr",res.body.cAddr);   // 大洲
        // setValue("Tgt.cCountry",res.body.id);  // ?国家
        setValue("Tgt.cAraCde",res.body.cAraCde); // ?国家
        setValue("Tgt.cCtyCnm", res.body.cCtyCnm);  // 城市
        setValue("Tgt.cCode",  res.body.cSrvyCde);  // 城市
      };
    });
  },
  // 建造完成年份
  tCompletionYearChange:(val:any)=>{
    if(val){
        const currentYear = new Date().getFullYear();
        const targetYear = new Date(val).getFullYear();
        setValue('Tgt.nShipAge',currentYear - targetYear)
    }
  },
    // 标的信息--证件类型
  cCertificateTypeChange:(val:any)=>{
      // 道路运输
      if(val==='1'){
// setFormItem("Tgt.cCertificateNo", { rules: [getRules("required", {}),getRules("idCard", {})]})  //证件号
        setFormItem("Tgt.cCertificateNo", { rules: [getRules("required", {}),getRules("roadTransportLicense", {})]})  //证件号
        
      }else if(val==='2'){
        //  网络预约出租汽车经营许可证
        setFormItem("Tgt.cCertificateNo", { rules: [getRules("required", {}),getRules("onlineTaxiLicense", {})]})  //证件号

      }else if(val==='3'){
          //  网络预约出租汽车运输证 
           setFormItem("Tgt.cCertificateNo", { rules: [getRules("required", {}),getRules("onlineTaxiTransportLicense", {})]})  //证件号
    
      }
      
      
  },
    // 证件有效起期
  tStartDateDisable:(date:any)=>{
    const fs = tgtEditRef?.value?.getFromValue(); 
    if (fs && JSON.stringify(fs) !== '{}') {
      const endDate = new Date(fs["Tgt.tEndDate"] || '')   // 结束时间 
      let minDate = dayjs(endDate).valueOf();
      return   date.getTime() > minDate
    }else{
        return true;
    }
  },
  // 证件有效止期
  tEndDateDisable:(date:any)=>{
    const fs = tgtEditRef?.value?.getFromValue();
    if (  fs && JSON.stringify(fs) !== '{}') {
      const startDate = new Date(fs["Tgt.tStartDate"] || '')   // 开始时间   
      let maxDate = dayjs(startDate).valueOf();
        return   date.getTime() < maxDate
    }else{
        return true;
    }
  },

// 是否记名投保
cIsinsuranceRegisteredChange:(val:any)=>{
    if(val=='0'){
        setFormItem('Tgt.cPracticeType',{
          rules:[getRules("required", {})]
        })
    }else{
        setFormItem('Tgt.cPracticeType',{
          rules:[]
        })
    }
},
// 投保行业
getcInsuranceIndustryChange:(val:any)=>{
    console.log('val-=--',val)
    if(val ==='8'){
       setFormItem('Tgt.cIndustryRemarks',{
          rules:[getRules("required", {})]
       })
    }else{
        setFormItem('Tgt.cIndustryRemarks',{
          rules:[]
       })
    }
},
// 工程地址级联change
getPropChange:(val:any) => {
  setregistAdd()
},
// 工程地址输入框change
getcSuffixAddrChange:(val:any) => {
  setregistAdd()
},


getAddressstr:(val:any, row: any, pitem: any) => {
  let getv1 = '';  //集联地址
  let getv2 = '';  //字符串地址
  let setv = '';  //需要设置的目标地址

  let r = false;
  formconfig1.fromSchema?.forEach((item: any) => { 
    if(r){
      setv = item;
      r = false;
    }
    if(item.inputtype === 'rtinputgroup'){
      for(let i = 0 ; i<item.groupList.length ; i++ ){
        if(pitem.prop === item.groupList[i].prop){
          r = true;
        }
      }
      if(r){
        getv1 = item.groupList.filter((it: any)=> it.inputtype === 'rtcascader');
        getv2 = item.groupList.filter((it: any)=> it.inputtype === 'rtinput');
      }
    }
  })
  setAddressBykey(getv1,getv2,setv);
}
};

function setAddressBykey(getv1: any, getv2: any , setv: any) {
   const a = tgtEditRef?.value?.getValue(getv1[0].prop);
   const b = tgtEditRef?.value?.getValue(getv2[0].prop);

   const setS = setv.prop;
   if (a) {
    getAddressStr({ address: a }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const c = (data ? data["addStr"] : "") + (b ? b: "");
        setValue(setS, c);
      }
    });
   }else{
    setValue(setS, b);
   }
};

function setregistAdd() {
  const ads = tgtEditRef?.value?.getValue("Tgt.Prop");
  const a = tgtEditRef?.value?.getValue("Tgt.cSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        setValue("Tgt.cProjectAddress", b);
      }
    });
  } else {
    setValue("Tgt.cProjectAddress", a);
  }
}

function singChange(obj) {
  setFormItem("Tgt.cProjectName", obj) //工程名称
  setFormItem("Tgt.nTotalCost", obj) //工程总造价 （元）
  setFormItem("Tgt.nTotalDesign", obj) //设计总价（元）
  setFormItem("Tgt.cProjectAddress", obj) //工程地址
  setValue('Tgt.cProjectName', '')
  setValue('Tgt.nTotalCost', '')
  setValue('Tgt.nTotalDesign', '')
  setValue('Tgt.cProjectAddress', '')
}

function groupCheck() {
  if (params.cProdNo === '043009' || params.cProdNo === '045001'
      ||params.cProdNo === '049035' || params.cProdNo === '049036'
      ||params.cProdNo === '049037' || params.cProdNo === '049040'
      ||params.cProdNo === '049041' 
    ){
    const cInsuranceMethod = getValue("Tgt.cInsuranceMethod");
    const cIndustryType = getValue("Tgt.cIndustryType");
    const plyBase = opertaor.getTableRefByKey('plyBase');
    let subSidiary = null;
    if(plyBase){
      subSidiary = plyBase.getValue('Base.cDptCde');
      subSidiary = subSidiary.substring(0,6);
    }

    let h = true;
    if(cIndustryType === '15' && (subSidiary === '024101' || subSidiary === '026201' || subSidiary === '024201'
      || subSidiary === '023702' || subSidiary === '026401' )){
      h = false;
    }else{
      if(cInsuranceMethod !== '613001'){
        h = false;
      }
    }

    formconfig1.fromUi.groupBy.forEach(item => {
      if(item.id == 'group2'){
        item.hidden = h;
      }
    });
  }
}

// 绑定特殊验证器
const exRules = {};
function getFromValue() {
  return tgtEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  tgtEditRef?.value?.setFormValue(value);
}

function validate() {
  return tgtEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  tgtEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return tgtEditRef?.value?.getValue(key);
}
function clearValidate(key=null) {
  tgtEditRef?.value?.clearValidate(key);
}

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
const terms1 = ['00425000277','00425000278','00425000279','00425000282','00425000283'];
const terms2 = ['00425000281','00425000280'];
function change403009(v){
  if(terms1.includes(v)){
    setValue("Tgt.cInsuranceMethod", "613001");
    setFormItem("Tgt.cInsuranceMethod",{disabled:true});
  }
  if(terms2.includes(v)){
    setValue("Tgt.cInsuranceMethod", "613001");
    setFormItem("Tgt.cInsuranceMethod",{disabled:true});
  }
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
  change403009,
  clearValidate,
});
</script>

<style scoped></style>

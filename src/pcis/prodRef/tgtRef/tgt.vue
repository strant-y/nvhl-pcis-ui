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
import { syncDist, selectDist, checkAppBase, queryNrmbAmt, getProductTemplate} from "@/api/prod";
import { productListA, productListB, productListC, cIntegrityStatementData, guaranteeTypeMap } from "./productList";
import Decimal from "decimal.js";
const wagesInfo = defineAsyncComponent(
  () => import("@/views/comprehensive-query/modal/wages-info-model.vue")
);
const surveyInfo = defineAsyncComponent(
  () => import("@/views/comprehensive-query/modal/survey-info-modal.vue")
);
const cumulative = defineAsyncComponent(
  () => import("@/views/comprehensive-query/modal/cumulative-risk.vue")
);

import { useDzModal } from "@/common/dzmodel/DzModalService";
import moment from "moment";

import { descryptParameter, encryptParameter } from "@/utils/encipher";
import { useRouter, useRoute } from 'vue-router';
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import dayjs from "dayjs";
import { getAddressStr, policyRatio } from "@/api/query";
import { codeListViewStore } from "@/store";
import { idxParamKey, IdxParamProps, useIdxParam } from "@/views/pcis/support/useIdxParam";

import { distRequiredMap } from '@/views/pcis/my-page/requiredDistMap';
import { eventBus } from "@/utils/event-bus";
import {codelistQuery} from "@/api/dict";
const route = useRoute();
const query = ref(route.query);
const router = useRouter();
const param = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}");
const dzmodal = useDzModal();


const { getRules } = useValidator();
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const params = opertaor.getParam();
const productStore = useProductStore()
const dialog = ref<DialogMethod | null>(null);
let insuranceCoverageFlag = false;

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
const whichType = ref('')
const tgtEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));

const distContactList: Array<string> = ['Tgt.DispatchProp', 'Tgt.cDispatchAddress', "Tgt.DepartureAirportProp", "Tgt.cDepartureAirportAddress",
  "Tgt.TransitProp", "Tgt.cTransitAddress", "Tgt.DestinationAirportProp", "Tgt.cDestAirportAddr",
  "Tgt.DestinationProp", "Tgt.cDestinationAddress"]

onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );


  for (let i = 0; formconfig11.fromSchema && i < formconfig11.fromSchema.length; i++) {
    // 遍历groupList数组把函数赋值给fromSchema
    if (formconfig11.fromSchema[i]["groupList"] && formconfig11.fromSchema[i]["groupList"].length > 0) {
      formconfig11.fromSchema[i]["groupList"].forEach((data: any, index: number, arr: any) => {
        if (distContactList.includes(data.prop)) {
          formconfig11.fromSchema[i]["groupList"][index]['func'] = function () {
            return setcDetailedAddress(arr, JSON.parse(JSON.stringify(formconfig11.fromSchema[i + 1])))
          }
        }
      })
    }
  }
  // 建设信息工程累计保额按钮 只在核保页面展示
  formconfig11.titleBtns?.forEach((item:any) => {
    if(item.id === "insurance_coverage") {
      if(param.pageType === "PLY_UW_PROCESS_SCENE" && param?.pageName !== "priceInquiry") {
        item.hidden = false
      } else {
        item.hidden = true
      }
    }
  })
  Object.assign(formconfig1, formconfig11);
  if (params.cProdNo === '045001') {
    setFormItem("Tgt.cInsuranceMethod", { typeCode: 'InsuranceMethod045001' });
  }
  // Tgt.cShippingType
  // 运输方式  020011  020013 这两种产品 非必填
  if (params.cProdNo === '020011' || params.cProdNo === '020013' || params.cProdNo === '043012' || params.cProdNo === '110006') {
    setFormItem("Tgt.cShippingType", { rules: [] });
  } else {
    setFormItem("Tgt.cShippingType", { rules: [getRules("required", { 'trigger': 'blur' })] });
  }

  //  020001 起运港 目的港 必填其他非必填
  if (params.cProdNo === '020001') {
    setFormItem("Tgt.cDeparturePort", { rules: [getRules("required", { 'trigger': 'blur' })] });
    setFormItem("Tgt.cDestinationPort", { rules: [getRules("required", { 'trigger': 'blur' })] });
  }

  // 040005 办学许可证号
  const requiredRulesNo = ['020018','020013'];// 必填加号码校验的产品
  const rulesNo = ['020002','020006','020009','020014'];// 号码校验的产品
  const requiredNo = ['041011','049001']// 必填校验的产品
  if (requiredRulesNo.includes(params.cProdNo)) {
    setFormItem("Tgt.cLicenseNumber", {
      rules: [getRules("required", { 'trigger': 'blur' }), getRules("vehiclePlate", {})],
    });
  } else if(rulesNo.includes(params.cProdNo)) {
    setFormItem("Tgt.cLicenseNumber", {
      rules: [getRules("vehiclePlate", {})],
    });
  } else if(requiredNo.includes(params.cProdNo)) {
    setFormItem("Tgt.cLicenseNumber", {
      rules: [getRules("required", {})],
    });
  } else {
    setFormItem("Tgt.cLicenseNumber", { rules: [] });
  }

  //040008  040011  呼号必填
  if (params.cProdNo === '040011' || params.cProdNo === '040008') {
    setFormItem("Tgt.cCallSign", { rules: [getRules("required", { 'trigger': 'blur' })] });
  }

  // 主机功率(单位:千瓦(KW)) 非必填
  const nHostPowers = ['110004', '110003', '040011', '040008'];
  const iscHostRequired = nHostPowers.includes(params.cProdNo);
  setFormItem("Tgt.nHostPower", {
    rules: iscHostRequired ? [] : [getRules("required", { trigger: 'blur' })]
  });

  // 询价出单 核定座位总数 非必填
  console.log('询价查询---', params)
  if (params.cProdNo === '043002' && params.pageName === "priceInquiry") {
    setFormItem("Tgt.nSeatsNumber", {
      rules: []
    });
  }

  // 040011、040008产品--标的信息--航行区域为非必填
  if (params.cProdNo === '040011' || params.cProdNo === '040008') {
    setFormItem("Tgt.cNavigationArea", {
      rules: []
    });
  }
  
  // 041007 被监护人数必填
  if(params.cProdNo === '041007') {
    setFormItem("Tgt.nGuardianshipNumber", { rules: [getRules("required", {})] })
  }
  // 089030 建筑结构非必填
  if(params.cProdNo === '089030') {
    setFormItem("Tgt.cBuildingStructure", { rules: [] })
  }
  // 010021 承保区域必填 其他非必填，010023不走这个逻辑
	if (params.cProdNo !== '010023') { 
		if(params.cProdNo === '010021') {
			setFormItem("Tgt.cUnderwritingArea", { rules: [getRules("required", {})] })
		} else {
				setFormItem("Tgt.cUnderwritingArea", { rules: [] })
		}
  }
  // 040014、110001、110003、110004 船舶种类必填
  if(params.cProdNo === '040014' || params.cProdNo === '110001' || params.cProdNo === '110003' || params.cProdNo === '110004') {
    setFormItem("Tgt.ShipClassProp", { rules: [getRules("required", {})] })
  } else {
    setFormItem("Tgt.ShipClassProp", { rules: [] })
  }
  // 040014、110003、110005、110001 制造用途必填
  if(params.cProdNo === '040014' || params.cProdNo === '110001' || params.cProdNo === '110003' || params.cProdNo === '110005') {
    setFormItem("Tgt.cManufacturingPurpose", { rules: [getRules("required", {})] })
  } else {
    setFormItem("Tgt.cManufacturingPurpose", { rules: [] })
  }
  // 110006 船龄非只读
  if(params.cProdNo === '110006') {
    setFormItem("Tgt.nShipAge", { readonly: false, disabled: false })
	}
	// Tgt.cGreenPowerType\Tgt.cGreenPowerOther隐藏
	const cGreendHideNo = ['040008','040011','040014','040015','041013','110001','110002','110003','110004','110005']// 需要隐藏产品
	if (cGreendHideNo.includes(params.cProdNo) && params.pageType == "app") {
    setFormItem("Tgt.cGreenPowerType", { hidden: true })
    setFormItem("Tgt.cGreenPowerOther", { hidden: true })
	}

  //  运输工具名称
  const cTransportationNames = ['020003', '020011', '020013', '020019', '020021'];
	const isNonRequired = cTransportationNames.includes(params.cProdNo);

	// 风险累积按钮核保切是规定产品展示
	const isAccumulatedRiskProduct = ["110001", "110003", "040008", "040011", "040015",]
	formconfig11.titleBtns?.forEach((item: any) => {
		const isInList = isAccumulatedRiskProduct.includes(params.cProdNo);
    const startsWith02 = params.cProdNo?.substring(0, 2) === "02";
    const isCorrectPage = params.pageType === "PLY_UW_PROCESS_SCENE";

    // 满足：(在列表中 OR 以02开头) AND 在指定页面 → 展示（hidden = false）
    if ((isInList || startsWith02) && isCorrectPage) {
      item.hidden = false;
    } else {
      item.hidden = true;
    }
	})

  setFormItem("Tgt.cTransportationName", {
    rules: isNonRequired ? [] : [getRules("required", { trigger: 'blur' })]
  });

  // 车牌号校验
  setFormItem("Tgt.cTransportLicenseNumber", {
    rules: [getRules("vehiclePlate", {})],
  });
  // 约定保期内服务次数正整数
  setFormItem("Tgt.nAgreeFrequency", {
    rules: [getRules("signlessInt", {})],
  });
  setFormItem("Tgt.nCarsNumber", {
    rules: [getRules("required", { 'trigger': 'blur' }), getRules("positiveNumber", {})],
  });

  setFormItem("Tgt.cContactNumber", {
    rules: [getRules("phoneNo", {})],
  });
  selectType()
  // 020019、020020、020021三款产品标的信息全部非必填
  if(['020019','020020','020021'].includes(params.cProdNo)) {
    formconfig11.fromSchema?.forEach((item:any) => {
      if(item.rules?.length > 0) {
        item.rules.forEach((i:any, index:any) => {
          if(i.required === true) {
            item.rules.splice(index, 1)
          }
        })
      }
    })
  }
  // 059902 “借款金额”要素，只有“担保方式”选择“质押贷款”时 才会带出
  if(params.cProdNo === '059902') {
    method.getcGuaranteeMethodChange('');
	}
	// 019904  089031 农户缴费比例大于等于2%
  if(params.cProdNo === '019904' || params.cProdNo === '089031') {
    setFormItem("Tgt.nCentralSubsidyRate", {rules: [getRules("required", {}), { validator: createSumValidator('Tgt.nCentralSubsidyRate'), trigger: 'blur' }],});
    setFormItem("Tgt.nProvincialSubsidyRate", {rules: [getRules("required", {}), { validator: createSumValidator('Tgt.nProvincialSubsidyRate'), trigger: 'blur' }],});
    setFormItem("Tgt.nCitySubsidyRate", {rules: [getRules("required", {}), { validator: createSumValidator('Tgt.nCitySubsidyRate'), trigger: 'blur' }],});
    setFormItem("Tgt.nCountySubsidyRate", {rules: [getRules("required", {}), { validator: createSumValidator('Tgt.nCountySubsidyRate'), trigger: 'blur' }],});
    setFormItem("Tgt.nOtherSubsidyRate", {rules: [getRules("required", {}), { validator: createSumValidator('Tgt.nOtherSubsidyRate'), trigger: 'blur' }],});
    setFormItem("Tgt.nFarmerPaymentRate", {rules: [getRules("required", {}), { validator: createSumValidator('Tgt.nFarmerPaymentRate'), trigger: 'blur' }, getRules("farmerPaymentRateRule", {})],});
  }
  nextTick(() => {
    // 货物信息回填到标的信息的产品
    const ProdNo = ['020001', '020002', '020003', '020004', '020005', '020006', '020007', '020009', '020011', '020013', '020015', '020016', '020017']
    if(ProdNo.includes(params.cProdNo)) {
      eventBus.on('goodsMxChange', handelGoodsMx);
    }
    if (!getValue('Tgt.cDispatchDetail')) {
      setFormItem('Tgt.cDispatchDetail', { disabled: true })
    } else {
      setFormItem('Tgt.cDispatchDetail', { disabled: false })
    }
    if (!getValue('Tgt.cDeparturePort')) {
      setFormItem('Tgt.cDeparturePort', { disabled: true })
    } else {
      setFormItem('Tgt.cDeparturePort', { disabled: false })
    }
    if (!getValue('Tgt.cDestinationDetail')) {
      setFormItem('Tgt.cDestinationDetail', { disabled: true })
    } else {
      setFormItem('Tgt.cDestinationDetail', { disabled: false })
    }
    if (!getValue('Tgt.cDestinationPort')) {
      setFormItem('Tgt.cDestinationPort', { disabled: true })
    } else {
      setFormItem('Tgt.cDestinationPort', { disabled: false })
		}
		// 047002 诚信声明、保函类别没值的时候回填固定值，诚信声明、保函详细根据内容自动调整输入框高度
		if (params.cProdNo === '047002') {
			setFormItem('Tgt.cIntegrityStatement', { autosize: true,rules: [getRules("NoAsterisk", {sym: "*"})] })
			setFormItem('Tgt.cGuaranteeLetter', { autosize: true,rules: [getRules("NoAsterisk", {sym: "*"})] }) // 保函详细
			setFormItem('Tgt.cGuaranteeInstitution', { rules: [getRules("NoAsterisk", {sym: "x"})] }) // 保函详细
			if (!getValue('Tgt.cIntegrityStatement') && (params.pageType == "app" || params.pageType == "copy" && params.pageType == "template")) {
				setValue('Tgt.cIntegrityStatement', cIntegrityStatementData.value)
				setValue('Tgt.cGuaranteeType', 'BL_047002_01')
			}
		}
    eventBus.on('setUnDisabledDone', (val:any) => {
      if(val) {
        const data = getFromValue();
        const cShipClassOne = data['Tgt.cShipClassOne']
        const cShipClassTwo = data['Tgt.cShipClassTwo']
        if(cShipClassOne == '02' || cShipClassOne == '03') {
          setFormItem('Tgt.cShipClassThree', { disabled: true, rules: null })
        }
        if(cShipClassTwo && cShipClassTwo != '15') {
          setFormItem('Tgt.cShipClassThree', { disabled: true, rules: null })
        }
      }
    })
    for (let i = 0; formconfig11.fromSchema && i < formconfig11.fromSchema.length; i++) {
    // 遍历groupList数组把函数赋值给fromSchema
    if (formconfig11.fromSchema[i]["groupList"] && formconfig11.fromSchema[i]["groupList"].length > 0) {
      formconfig11.fromSchema[i]["groupList"].forEach((data: any, index: number, arr: any) => {
        if (distContactList.includes(data.prop)) {
          formconfig11.fromSchema[i]["groupList"][index]['func'] = function () {
            return setcDetailedAddress(arr, JSON.parse(JSON.stringify(formconfig11.fromSchema[i + 1])))
          }
        }
      })
    }
  }
  })
});
function hasEnglish(str: any) {
  return /[a-zA-Z]/.test(str);
}
const handelGoodsMx = (val: any) => {
  console.log(val)
  if (val.length > 0) {
    setValue('Tgt.cGoodsNo',val.map(obj => obj['Dist.cGoodsNo']).join(','))
    setValue('Tgt.nGoodsNum',val.reduce((sum, obj) => sum + (obj['Dist.nNum'] || 0), 0))
    setValue('Tgt.nInvoicceValue',val.reduce((sum, obj) => sum + (obj['Dist.nInvoiceValue'] || 0), 0))
    setValue('Tgt.cInvoiceNum',val[0]['Dist.cInvoiceNum'])
    setValue('Tgt.cWaybillNumber',val[0]['Dist.cBillNum'])
    setValue('Tgt.nAdditiveCoefficient', val[0]['Dist.nAdditiveCoefficient'])
    setValue('Tgt.cTradeNum', val[0]['Dist.cTradeNum'])
    setValue('Tgt.cLadingNum', val[0]['Dist.cBillNum'])
    setValue('Tgt.cCreditNum', val[0]['Dist.cLetterNum'])
  } else {
    setValue('Tgt.nAdditiveCoefficient', '')
    setValue('Tgt.cTradeNum', '')
    setValue('Tgt.cLadingNum', '')
    setValue('Tgt.cCreditNum', '')
    setValue('Tgt.cGoodsNo','')
    setValue('Tgt.nGoodsNum','')
    setValue('Tgt.nInvoicceValue','')
    setValue('Tgt.cInvoiceNum','')
    setValue('Tgt.cWaybillNumber','')
  }
}
const selectType = () => {
  if (productListA.value.includes(params.cProdNo)) {
    whichType.value = 'A'
  } else if (productListB.value.includes(params.cProdNo)) {
    whichType.value = 'B'
  } else if (productListC.value.includes(params.cProdNo)) {
    whichType.value = 'C'
  }
}
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
//水运规则    "Tgt.cTransportationName",
const tgtWaterMatterList: Array<string> = ["Tgt.cShipName", "Tgt.cTransportVoyage", "Tgt.tConstructionYear", "Tgt.nTransTotalTon", "Tgt.cShipRegistration", "Tgt.nTransportationShipAge", "Tgt.cShipType", "Tgt.cShipClassOne", "Tgt.cShipClassTwo", "Tgt.cShipClassThree", "Tgt.cOldshipSurcharge","Tgt.cLicenseNumber","Tgt.cFrameNumber"]
//水运外其他规则
const tgtOtherMatterList: Array<string> = ["Tgt.cLicenseNumber", "Tgt.cFrameNumber", "Tgt.cTransitMode"]
//非水运隐藏
const tgtIsWaterMatterList: Array<string> = ["Tgt.cTowing", "Tgt.cWholeShip", "Tgt.cShipName", "Tgt.cTransportVoyage", "Tgt.nTotalTonnage", "Tgt.nShipAge", "Tgt.cTransportationName", "Tgt.tConstructionYear", "Tgt.nTransTotalTon", "Tgt.cShipRegistration", "Tgt.nTransportationShipAge", "Tgt.cShipType", "Tgt.cShipClassOne", "Tgt.cShipClassTwo", "Tgt.cShipClassThree", "Tgt.cOldshipSurcharge"]
const setIsRule = () => {
  if (getValue("Tgt.cTowing") === '1') {
    codeListStore
      .queryCodeList(
        {
          codeListName: "Ship_Type",
          codeListParam: {
            remark: "1"
          },
        },
      )
      .then((res) => {
        console.log(123123, res)
        tgtEditRef.value?.addCodeListMap({
          code: "Tgt.cShipType",
          list: [

            { label: '半潜驳', value: '7', codeKind: 'codeKind' },
            { label: '拖船', value: '8', codeKind: 'codeKind' }
          ]
        })
      });
  } else {
    codeListStore
      .queryCodeList(
        {
          codeListName: "Ship_Type",
          codeListParam: {},
        },
      )
      .then((res) => {

        tgtEditRef.value?.addCodeListMap({
          code: "Tgt.cShipType",
          list: res
        })
      });

  }
  if (getValue("Tgt.cTowing") === '1' || getValue("Tgt.cWholeShip") === '1') {
    tgtWaterMatterList.forEach(item => {
      setFormItem(item, {
        rules: [getRules("required", {})],
      });
    })
  } else if (getValue("Tgt.cTowing") === '0' || getValue("Tgt.cWholeShip") === '0') {
    tgtWaterMatterList.forEach(item => {
      setFormItem(item, {
        rules: null,
      });
    })
  }
}

const funcdistadd = () => {

};
function calculateCarAge(initialDateStr: any) {
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
function calAgeDif(val1: any, val2: any) {
  const date1 = new Date(val1);
  const date2 = new Date(val2);

  const diffInMilliseconds = Math.abs(date1 - date2);
  const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25; // 考虑闰年平均一年365.25天

  const diffInYears = diffInMilliseconds / millisecondsInYear;

  return Math.round(diffInYears)
}
const guaranteeMethodList = ['Tgt.cCollateralName', 'Tgt.cPledgeNumber', 'Tgt.cPledgeAddress', 'Tgt.cItemNumber', 'Tgt.nFaceValue', 'Tgt.cApplicationLine', 'Tgt.cBankApply', 'Tgt.cAcceptor', 'Tgt.cMaturityWeek', 'Tgt.cDueWeek', 'Tgt.tTicketStartingandending', 'Tgt.cConfirmingBank','Tgt.nLoanAmount']
const cMortgageList = ['Tgt.cMortgageName', 'Tgt.cMortgageNumber', 'Tgt.cCollateralAddress']
const setcDetailedAddress = (prop: any, aftProp: any) => {
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
  cDestCountryChange: (val: any) => {
    const getFormconfig = opertaor.getTableRefs()['AgentTgt'].getFormconfig()
    getFormconfig.fromSchema?.forEach((item: any) => {
      if (item.prop == "Tgt.cPayCur" && (val === 'CHINA' || val === '中国')) {
        item.disabled = false;
      } else if (item.prop == "Tgt.cPayCur") {
				item.disabled = true;
				opertaor.getTableRefs()['AgentTgt']?.setValue('Tgt.cPayCur', 'CNY')
      }
    });
  },
  getcNavigationAreaChange: () => {
    dialog.value?.open('navigationAreaTips', null,
      null, { width: 50, title: '航行区域提示' });
  },

  getcIsExcludingChange: () => {
    dialog.value?.open('reinsuranceTips', null,
      null, { width: 45, title: '水险再保提示' });
  },
  getcSanctionAreasChange: () => {
    dialog.value?.open('detailsKnows', null,
      null, { width: 45, title: '战争及罢工险核保限制和运输地国家限制' });
	},
	getcBuildingStructureChange: () => {
    dialog.value?.open('cBuildStrKnows', null,
      null, { width: 45, title: '建筑结构' });
  },
  gettCompletionYearChange: (val: string) => {
    const currentYear = new Date().getFullYear();
    setValue('Tgt.nShipAge', currentYear - Number(val))
  },
  gettCompletionDateChange: (val: string) => {
    const insrnc = opertaor.getTableRefByKey("insrnc").getFromValue()
    setValue('Tgt.nServiceLife', calAgeDif(insrnc['Base.tAppTm'], val))
  },
  getcGuaranteeMethodChange: (val: string) => {
    const param = opertaor.getParam();
    //担保方式选择"质押贷款"时带出
    if (val === 'B05Assure004') {
      guaranteeMethodList.forEach(item => {
        setFormItem(item, {
          hidden: false,
        });
      })
    } else {
      guaranteeMethodList.forEach(item => {
        setFormItem(item, {
          hidden: true,
        });
        if (param.initFlag) return
        setValue(item, '');
      })
    }
    // 担保方式选择"抵押贷款"时带出
    if (val === 'B05Assure003') {
      cMortgageList.forEach(item => {
        setFormItem(item, {
          hidden: false,
        });
      })
    } else {
      cMortgageList.forEach(item => {
        setFormItem(item, {
          hidden: true,
        });
        if (param.initFlag) return
        setValue(item, '');
      })
    }
    // 担保方式选择"保证贷款 "时带出
    if (val === 'B05Assure002') {
      setFormItem('Tgt.cTypeName', {
        hidden: false,
      });
    } else {
      setFormItem('Tgt.cTypeName', {
        hidden: true,
      });
      if (param.initFlag) return
      setValue('Tgt.cTypeName', '');
    }
  },
  // 是否单项工程 
  getcIsSingleChange: (val: string) => {
    if (val === '1') {
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

      if (params.cProdNo === '042001') {
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
      // 工程名称、工程总造价、勘察造价、勘察项目地址必填
      if (params.cProdNo === '041012') {
        setFormItem('Tgt.cProjectName', {
          rules: [getRules("required", {})],
        });
        setFormItem('Tgt.nTotalCost', {
          rules: [getRules("required", {})],
        });
        setFormItem('Tgt.nSurveyPrice', {
          rules: [getRules("required", {})],
        });
        setFormItem('Tgt.SurveyProjectProp', {
          rules: [getRules("required", {})],
        });
      }

    } else {
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

      if (params.cProdNo === '042001' && val === '0') {
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

      if (params.cProdNo === '041012') {
        setFormItem('Tgt.cProjectName', {
          rules: null,
        });
        setFormItem('Tgt.nTotalCost', {
          rules: null,
        });
        setFormItem('Tgt.nSurveyPrice', {
          rules: null,
        });
        setFormItem('Tgt.SurveyProjectProp', {
          rules: null,
        });
      }
    }

  },
  getcTransportationToolsChange: (val: string) => {
    if (val === '02') {
      setFormItem('Tgt.cPlateNumber', {
        rules: [getRules("required", {})],
      });
    } else {
      setFormItem('Tgt.cPlateNumber', {
        rules: null
      });
    }
  },

  getcMemberLogoChange: (val: string) => {
    if (val === '1') {
      // setFormItem('Tgt.cBareboatLessee', {
      //   rules: [getRules("required", {})],
      // });
      setFormItem('Tgt.P&I_CLUB', { rules: [getRules("required", {})] })
    } else {
      // setFormItem('Tgt.cBareboatLessee', {
      //   rules: null
      // });
      setFormItem('Tgt.P&I_CLUB', { rules: [] })
    }
  },
  getcRentalLogoChange: (val: string) => {
    if (val === '1') {
      setFormItem('Tgt.cBareboatLessee', {
        rules: [getRules("required", {})],
      });
      setFormItem('Tgt.nHostPower', {
        rules: [],
      });
    } else {
      setFormItem('Tgt.cBareboatLessee', {
        rules: null
      });
      const nHostPowers = ['110004', '110003', '040011', '040008'];
      const iscHostRequired = nHostPowers.includes(params.cProdNo);
      setFormItem("Tgt.nHostPower", {
        rules: iscHostRequired ? [] : [getRules("required", { trigger: 'blur' })]
      });
      // setFormItem('Tgt.nHostPower', {
      //   rules: [getRules("required", {})],
      // });
    }
  },
  getcMortgageMarkChange: (val: string) => {
    if (val === '1') {
      setFormItem('Tgt.cShipMortgagee', {
        rules: [getRules("required", {})],
      });
      setFormItem('Tgt.nMortgageAmount', {
        rules: [getRules("required", {})],
      });
    } else {
      setFormItem('Tgt.cShipMortgagee', {
        rules: null
      });
      setFormItem('Tgt.nMortgageAmount', {
        rules: null
      });
    }
  },
  gettInitialDateChange: (val: string) => {
    setValue("Tgt.cVehicleAge", calculateCarAge(val))
  },
  getcShippingMethodChange: (val: string) => {
    console.log('val', val)
    // if(val === 'NV591001'){
    if(params.cProdNo === '020009') {
      if (val === '11') {
        tgtIsWaterMatterList.forEach(item => {
          setFormItem(item, {
            hidden: false,
          });
        })
        tgtOtherMatterList.forEach(item => {
          setFormItem(item, {
            hidden: true,
          });
        })
      } else {
        tgtIsWaterMatterList.forEach(item => {
          setFormItem(item, {
            hidden: true,
          });
        })
        tgtOtherMatterList.forEach(item => {
          setFormItem(item, {
            hidden: false,
          });
        })
      }
    }
    // if(val === 'NV591003'){
    if (val === '12') {
      tgtOtherMatterList.forEach(item => {
        setFormItem(item, {
          rules: [getRules("required", {})],
        });
      })
    } else {
      tgtOtherMatterList.forEach(item => {
        setFormItem(item, {
          rules: null,
        });
      })
    }
  },

  getcShippingTypeChange: (val: string) => {
    console.log(val);
    if (val === '04') {
      setFormItem("Tgt.cRailwayMode", {
        rules: [getRules("required", {})],
      });
    } else {
      setFormItem("Tgt.cRailwayMode", {
        rules: [],
      });
    }
  },
  getcTransportChange: (val: string) => {
    console.log(val)
    const requiredRule = [getRules("required", {})];
    const vehiclePlate = [getRules("vehiclePlate", {})];
    setFormItem("Tgt.cTransportTools", {
      rules: val === '1' ? requiredRule : [],
    });
    if (val !== '1') {
      clearValidate('Tgt.cTransportTools')
    }
    setFormItem("Tgt.cTransportLicenseNumber", {
      rules: val === '1' ? [...requiredRule, ...vehiclePlate] : [...vehiclePlate],
    });
    setFormItem("Tgt.cTransBrandModel", {
      rules: val === '1' ? requiredRule : [],
    });
    setFormItem("Tgt.cTransportEngineNumber", {
      rules: val === '1' ? requiredRule : [],
    });
    setFormItem("Tgt.cTransportFrameNumber", {
      rules: val === '1' ? requiredRule : [],
    });

    setFormItem("Tgt.cTransportTools", {
      disabled: val === '1' ? requiredRule : [],
    });
    setFormItem("Tgt.cTransportTools", {
      disabled: val === '1' ? false : true,
    });
    setFormItem("Tgt.cTransitAirportName", {
      rules: val === '1' ? requiredRule : [],
    });

    setFormItem("Tgt.cTransportVoyageNumber", {
      rules: val === '1' ? requiredRule : [],
    });
  },
  getcTowingChange: (val: string) => {
    setIsRule()
  },
  getcWholeShipChange: (val: string) => {
    setIsRule()
  },
  func1: () => {
  },
  //投保乘客座位总数改变事件
  changenTotalInsured: (val: any) => {
    console.log('触发11')
    if (val || val == 0) {
      setValue("Tgt.nSeatCapacity", Number(getValue("Tgt.nTotalInsured")) + Number(getValue("Tgt.nInsuredcompanySeats")))

      const termref = opertaor.getTableRefByKey("cvrg");
      const termrefList = termref.getFromValue();

      interface Item {
        nInsuredHeadcount?: number | null | string;
      }
      for (let i = 0; i < termrefList.length; i++) {
        const term = termrefList[i];
        if (term['Term.cRdrTyp'] == '0') { // 判断是主条款
          termref?.setTermData({
            termNo: term['Term.cUniqueTermNo'],
            planNo: term['Term.cPlanNo'],
            factorProp: 'Term.nSeatTotal',
          }, val);
        }
      }
    }
  },

  //投保司乘人员座位总数改变事件
  changenInsuredcompanySeats: (val: any) => {
    console.log('触发12')

    if (val || val == 0) {
      setValue("Tgt.nSeatCapacity", Number(getValue("Tgt.nTotalInsured")) + Number(getValue("Tgt.nInsuredcompanySeats")))
      const termref = opertaor.getTableRefByKey("cvrg");
      const terms = termref.getFromValue();
      console.log('terms', terms);


      for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        console.log(term)
        if (term['Term.cRdrTyp'] == '1' && term['Term.cClauseCategory'] == '1') { // 判断是附加条款
          termref?.setTermData({
            termNo: term['Term.cUniqueTermNo'],
            planNo: term['Term.cPlanNo'],
            factorProp: 'Term.nInsuredcompanySeats',
          }, val);
        }
      }


      // termref?.setTermData({
      //   termNo:"00425000085",
      //   planNo:'P1',
      //   factorProp: 'Term.nSeatTotal',
      // },123);   
    }
  },

  // 投保座位总数
  nSeatCapacityChange: (val: any) => {

  },

  //是否单项工程change事件
  cIsSingleFunc: (val) => {
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
  funcInsuranceChange: (val:any) => {
    const param = opertaor.getParam();

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
    if (param.initFlag) return
    // 投保方式选择按工程造价投保、按建筑面积投保、按劳务合同价投保，短期费率类型默认按日，短期费率系数固定为1
    const baseRef = opertaor.getTableRefByKey('base'); 
    const disableValue = ['613002', '613003', '613004'].includes(val);
    baseRef.setFormItem("Base.cRatioTyp", { disabled: disableValue });
    if(disableValue) {
      baseRef.setValue('Base.cRatioTyp', '2'); 
      baseRef.setValue('Base.nRatioCoef', Number(1).toFixed(6));
    } else {
      const baseBefore = opertaor.getTableRefByKey("insrnc")?.getFromValue();
      const baseBefore2 = opertaor.getTableRefByKey("base")?.getFromValue();
      let prodNo = params.cProdNo;

      let param = {
        bgnTm: baseBefore["Base.tInsrncBgnTm"],
        endTm: baseBefore["Base.tInsrncEndTm"],
        prodNo,
        ratioType: baseBefore2 ? baseBefore2['Base.cRatioTyp'] : null
      }
      policyRatio(param).then((res: any) => {
        const { code, data, msg } = res;
        if (code === 200) {
          baseRef.setValue('Base.nRatioCoef', Number(data).toFixed(6))
        }
      });
    }
  },
  cDeterminingChange: (val: any) => {
    const cvrgref = opertaor.getTableRefByKey("cvrg");
    if (cvrgref.showFlush) {
      cvrgref.showFlush();
    }
    // 直接限额制 投保雇员年工资总额非必填
    if (val === "0") {
      setFormItem("Tgt.nTotalSalary", {
        rules: [],
      });
    } else {
      setFormItem("Tgt.nTotalSalary", {
        rules: [getRules("required", { blur: true })],
      });
    }
  },
  industryTypeChange: (val: any) => {
    groupCheck();
  },
  wagesInfoBtn: () => {

    let cRegisteredLogo = opertaor.getDataAll()['tgt']['Tgt.cRegisteredLogo'];  // 记名投保标志 是 获取清单汇总   否可以自己修改添加
    // let cAppNo = opertaor.getDataAll()['plyBase']['Base.cAppNo'];   //申请单号
    let cAppNo = "";
    if (route.params.param?.pageName === "priceInquiry") {
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
      if (route.params.param?.pageName === "priceInquiry") {
        param['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
      } else {
        param['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
      }
      if (route.params.param?.pageType && route.params.param?.pageType === "EDR_APP_NEW_SCENE") {
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
      const param = {};
      if (route.params.param?.pageName === "priceInquiry") {
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

  ShipClassOneChange: (val: any) => {
    console.log('船111', val)
    clearValidate('Tgt.cShipClassThree');
    const param = opertaor.getParam();
    if (!param.initFlag) {
      if (val == '01') {
        setValue("Tgt.cShipClassTwo", null);
        setValue("Tgt.cShipClassThree", null);
      } else if(val == '02' || val == '03') {
        setValue("Tgt.cShipClassThree", null);
      }
    }
    if (val == '01') { //rules: [getRules("required", {})]
      setFormItem('Tgt.cShipClassTwo', { disabled: true, rules: null });
      setFormItem('Tgt.cShipClassThree', { disabled: false, rules: [getRules("required", {})] })

    } else {
      if (val) {
        setFormItem('Tgt.cShipClassTwo', { disabled: false, rules: [getRules("required", {})] });
      }
    }
    if (val == '02' || val == '03') {
      setFormItem('Tgt.cShipClassThree', { disabled: true, rules: null })
      let cShipClassTwo = getValue('Tgt.cShipClassTwo');
      codeListStore
        .queryCodeList(
          {
            codeListName: "Ship_Class_Level2",
            codeListParam: {
              classone: val == '02' ? 'level1' : 'level2'
            },
          },
        )
        .then((res) => {
          tgtEditRef.value?.addCodeListMap({
            code: "Tgt.cShipClassTwo",
            list: res
          })
          if (res.length > 0) {
            let delData = true;
            res.forEach((item: any) => {
              if (item['value'] == cShipClassTwo) {
                delData = false;
              }
            })

            // 判断是否有可以清空的数据
            if (delData) {
              setValue('Tgt.cShipClassTwo', null)
            }
          }
        });
    }
  },
  cShipClassTwoChange: (val: any) => {
    clearValidate('Tgt.cShipClassThree');
    if (val === '15') {
      setFormItem('Tgt.cShipClassThree', { disabled: false, rules: [getRules("required", {})] })

    } else if (val) {
      setFormItem('Tgt.cShipClassThree', { disabled: true, rules: null })
    }
    if (!params.initFlag) {
      if (val && val !== '15') {
        setValue("Tgt.cShipClassThree", null);
      }
    }
  },
  // 核定座位总数
  nSeatsNumberChange: (v) => {
    const nSeatCapacity = getValue("Tgt.nSeatCapacity");
    if (v !== nSeatCapacity) {
      ElMessage.warning("核定座位总数和投保座位数总数不一致！");
    }
  },

  // 起运港国家 弹框
  countryFun: () => {
    let isYW = false
    if (getValue("Tgt.cDeparturePortCountry")) {
      isYW = hasEnglish(getValue("Tgt.cDeparturePortCountry"))
    }
    dialog.value?.open(
      "countryInfoModal",
      { type: "departure", data: { whichType: whichType.value, isYW } },
      {
        isOk: (res: any) => {
          setFormItem('Tgt.cDeparturePort', { disabled: false })
          if (res.cType === '1') {
            if (res.isCN) {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDeparturePortCountry", res.cCountryCn);
                setValue("Tgt.cDeparturePortProvince", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn);
                setValue("Tgt.cDeparturePort", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn + ',' + res.cCountryCn);
              } else {
                setValue("Tgt.cDeparturePortCountry", res.cCountryCn);
                setValue("Tgt.cDeparturePortProvince", res.cCityCn);
                setValue("Tgt.cDeparturePort", res.cCityCn + ',' + res.cCountryCn);
              }
            } else {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDeparturePortCountry", res.cCountryEn);
                setValue("Tgt.cDeparturePortProvince", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn);
                setValue("Tgt.cDeparturePort", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn + ',' + res.cCountryEn);
              } else {
                setValue("Tgt.cDeparturePortCountry", res.cCountryEn);
                setValue("Tgt.cDeparturePortProvince", res.cCityEn);
                setValue("Tgt.cDeparturePort", res.cCityEn + ',' + res.cCountryEn);
              }
            }
          } else {
            if (res.isCN) {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDeparturePortCountry", res.cCountryCn);
                setValue("Tgt.cDeparturePortProvince", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn);
                setValue("Tgt.cDeparturePort", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn + ',' + res.cCountryCn);
              } else {
                setValue("Tgt.cDeparturePortCountry", res.cCountryCn);
                setValue("Tgt.cDeparturePortProvince", res.cAirportCity);
                setValue("Tgt.cDeparturePort", res.cAirportCity + ',' + res.cCountryCn);
              }
            } else {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDeparturePortCountry", res.cCountryEn);
                setValue("Tgt.cDeparturePortProvince", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn);
                setValue("Tgt.cDeparturePort", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn + ',' + res.cCountryEn);
              } else {
                setValue("Tgt.cDeparturePortCountry", res.cCountryEn);
                setValue("Tgt.cDeparturePortProvince", res.cAirportEn);
                setValue("Tgt.cDeparturePort", res.cAirportEn + ',' + res.cCountryEn);
              }
            }
          }
        },
      },
      { width: "80" }
    );
  },
  // 中转地国家 按钮
  cTransitCountryFun: () => {
    let isYW = false
    if (getValue("Tgt.cTransitCountry")) {
      isYW = hasEnglish(getValue("Tgt.cTransitCountry"))
    }
    dialog.value?.open(
      "countryInfoModal",
      { type: "departure", data: { whichType: whichType.value, isYW } },
      {
        isOk: (res: any) => {
          setFormItem('Tgt.cTransitDetail', { disabled: false })
          if (res.cType === '1') {
            if (res.isCN) {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cTransitCountry", res.cCountryCn);
                setValue("Tgt.cTransitProvince", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn);
                setValue("Tgt.cTransitDetail", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn + ',' + res.cCountryCn);
              } else {
                setValue("Tgt.cTransitCountry", res.cCountryCn);
                setValue("Tgt.cTransitProvince", res.cCityCn);
                setValue("Tgt.cTransitDetail", res.cCityCn + ',' + res.cCountryCn);
              }
            } else {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cTransitCountry", res.cCountryEn);
                setValue("Tgt.cTransitProvince", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn);
                setValue("Tgt.cTransitDetail", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn + ',' + res.cCountryEn);
              } else {
                setValue("Tgt.cTransitCountry", res.cCountryEn);
                setValue("Tgt.cTransitProvince", res.cCityEn);
                setValue("Tgt.cTransitDetail", res.cCityEn + ',' + res.cCountryEn);
              }
            }
          } else {
            if (res.isCN) {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cTransitCountry", res.cCountryCn);
                setValue("Tgt.cTransitProvince", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn);
                setValue("Tgt.cTransitDetail", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn + ',' + res.cCountryCn);
              } else {
                setValue("Tgt.cTransitCountry", res.cCountryCn);
                setValue("Tgt.cTransitProvince", res.cAirportCity);
                setValue("Tgt.cTransitDetail", res.cAirportCity + ',' + res.cCountryCn);
              }
            } else {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cTransitCountry", res.cCountryEn);
                setValue("Tgt.cTransitProvince", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn);
                setValue("Tgt.cTransitDetail", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn + ',' + res.cCountryEn);
              } else {
                setValue("Tgt.cTransitCountry", res.cCountryEn);
                setValue("Tgt.cTransitProvince", res.cAirportEn);
                setValue("Tgt.cTransitDetail", res.cAirportEn + ',' + res.cCountryEn);
              }
            }
          }
        },
      },
      { width: "80" }
    );
  },
  // 目的港国家 按钮
  cDestinationPortCountryFun: () => {
    let isYW = false
    if (getValue("Tgt.cDestinationPortCountry")) {
      isYW = hasEnglish(getValue("Tgt.cDestinationPortCountry"))
    }
    dialog.value?.open(
      "countryInfoModal",
      { type: "departure", data: { whichType: whichType.value, isYW } },
      {
        isOk: (res: any) => {
          setFormItem('Tgt.cDestinationPort', { disabled: false })
          if (res.cType === '1') {
            if (res.isCN) {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDestinationPortCountry", res.cCountryCn);
                setValue("Tgt.cDestinationPortProvince", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn);
                setValue("Tgt.cDestinationPort", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn + ',' + res.cCountryCn);
              } else {
                setValue("Tgt.cDestinationPortCountry", res.cCountryCn);
                setValue("Tgt.cDestinationPortProvince", res.cCityCn);
                setValue("Tgt.cDestinationPort", res.cCityCn + ',' + res.cCountryCn);
              }
            } else {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDestinationPortCountry", res.cCountryEn);
                setValue("Tgt.cDestinationPortProvince", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn);
                setValue("Tgt.cDestinationPort", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn + ',' + res.cCountryEn);
              } else {
                setValue("Tgt.cDestinationPortCountry", res.cCountryEn);
                setValue("Tgt.cDestinationPortProvince", res.cCityEn);
                setValue("Tgt.cDestinationPort", res.cCityEn + ',' + res.cCountryEn);
              }
            }
          } else {
            if (res.isCN) {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDestinationPortCountry", res.cCountryCn);
                setValue("Tgt.cDestinationPortProvince", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn);
                setValue("Tgt.cDestinationPort", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn + ',' + res.cCountryCn);
              } else {
                setValue("Tgt.cDestinationPortCountry", res.cCountryCn);
                setValue("Tgt.cDestinationPortProvince", res.cAirportCity);
                setValue("Tgt.cDestinationPort", res.cAirportCity + ',' + res.cCountryCn);
              }
            } else {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDestinationPortCountry", res.cCountryEn);
                setValue("Tgt.cDestinationPortProvince", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn);
                setValue("Tgt.cDestinationPort", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn + ',' + res.cCountryEn);
              } else {
                setValue("Tgt.cDestinationPortCountry", res.cCountryEn);
                setValue("Tgt.cDestinationPortProvince", res.cAirportEn);
                setValue("Tgt.cDestinationPort", res.cAirportEn + ',' + res.cCountryEn);
              }
            }
          }
        },
      },
      { width: "80" }
    );
  },
  // // 起运港国家 按钮
  cDestinationCountryFunc: () => {
    setValue("Tgt.cDestinationDetail", null);
    setValue("Tgt.cDestinationCountry", null);
    setValue("Tgt.cDestinationProvince", null);

    let isYW = false
    if (getValue("Tgt.cDestinationCountry")) {
      isYW = hasEnglish(getValue("Tgt.cDestinationCountry"))
    }
    dialog.value?.open(
      "countryInfoModal",
      { type: "departure", data: { whichType: whichType.value, isYW } },
      {
        isOk: (res: any) => {
          if (getValue('Tgt.cDestAirportCountry') && getValue('Tgt.cDestAirportCountry') != res.cCountryCn && getValue('Tgt.cDestAirportCountry') != res.cCountryEn) {
            ElMessage.error('目的地国家和目的地机场国家要求一致')
            return
          }
          setFormItem('Tgt.cDestinationDetail', { disabled: false })
          if (res.cType === '1') {
            if (res.isCN) {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDestinationCountry", res.cCountryCn);
                setValue("Tgt.cDestinationProvince", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn);
                setValue("Tgt.cDestinationDetail", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn + ',' + res.cCountryCn);
              } else {
                setValue("Tgt.cDestinationCountry", res.cCountryCn);
                setValue("Tgt.cDestinationProvince", res.cCityCn);
                setValue("Tgt.cDestinationDetail", res.cCityCn + ',' + res.cCountryCn);
              }
            } else {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDestinationCountry", res.cCountryEn);
                setValue("Tgt.cDestinationProvince", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn);
                setValue("Tgt.cDestinationDetail", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn + ',' + res.cCountryEn);
              } else {
                setValue("Tgt.cDestinationCountry", res.cCountryEn);
                setValue("Tgt.cDestinationProvince", res.cCityEn);
                setValue("Tgt.cDestinationDetail", res.cCityEn + ',' + res.cCountryEn);
              }
            }
          } else {
            if (res.isCN) {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDestinationCountry", res.cCountryCn);
                setValue("Tgt.cDestinationProvince", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn);
                setValue("Tgt.cDestinationDetail", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn + ',' + res.cCountryCn);
              } else {
                setValue("Tgt.cDestinationCountry", res.cCountryCn);
                setValue("Tgt.cDestinationProvince", res.cAirportCity);
                setValue("Tgt.cDestinationDetail", res.cAirportCity + ',' + res.cCountryCn);
              }
            } else {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDestinationCountry", res.cCountryEn);
                setValue("Tgt.cDestinationProvince", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn);
                setValue("Tgt.cDestinationDetail", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn + ',' + res.cCountryEn);
              } else {
                setValue("Tgt.cDestinationCountry", res.cCountryEn);
                setValue("Tgt.cDestinationProvince", res.cAirportEn);
                setValue("Tgt.cDestinationDetail", res.cAirportEn + ',' + res.cCountryEn);
              }
            }
          }
        },
      },
      { width: "80" }
    );
  },
  // 起运地国家 按钮
  cDispatchCountryFunc: () => {
    setValue("Tgt.cDispatchDetail", null);
    setValue("Tgt.cDispatchCountry", null);
    setValue("Tgt.cDispatchProvince", null);
    let isYW = false
    if (getValue("Tgt.cDispatchCountry")) {
      isYW = hasEnglish(getValue("Tgt.cDispatchCountry"))
    }
    dialog.value?.open(
      "countryInfoModal",
      { type: "departure", data: { whichType: whichType.value, isYW } },
      {
        isOk: (res: any) => {
          if (getValue('Tgt.cDepartureAirportCountry') && getValue('Tgt.cDepartureAirportCountry') != res.cCountryCn && getValue('Tgt.cDepartureAirportCountry') != res.cCountryEn) {
            ElMessage.error('起运地国家和起运机场国家要求一致')
            return
          }
          setFormItem('Tgt.cDispatchDetail', { disabled: false })
          if (res.cType === '1') {
            if (res.isCN) {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDispatchCountry", res.cCountryCn);
                setValue("Tgt.cDispatchProvince", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn);
                setValue("Tgt.cDispatchDetail", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn + ',' + res.cCountryCn);
              } else {
                setValue("Tgt.cDispatchCountry", res.cCountryCn);
                setValue("Tgt.cDispatchProvince", res.cCityCn);
                setValue("Tgt.cDispatchDetail", res.cCityCn + ',' + res.cCountryCn);
              }
            } else {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDispatchCountry", res.cCountryEn);
                setValue("Tgt.cDispatchProvince", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn);
                setValue("Tgt.cDispatchDetail", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn + ',' + res.cCountryEn);
              } else {
                setValue("Tgt.cDispatchCountry", res.cCountryEn);
                setValue("Tgt.cDispatchProvince", res.cCityEn);
                setValue("Tgt.cDispatchDetail", res.cCityEn + ',' + res.cCountryEn);
              }
            }
          } else {
            if (res.isCN) {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDispatchCountry", res.cCountryCn);
                setValue("Tgt.cDispatchProvince", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn);
                setValue("Tgt.cDispatchDetail", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn + ',' + res.cCountryCn);
              } else {
                setValue("Tgt.cDispatchCountry", res.cCountryCn);
                setValue("Tgt.cDispatchProvince", res.cAirportCity);
                setValue("Tgt.cDispatchDetail", res.cAirportCity + ',' + res.cCountryCn);
              }
            } else {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDispatchCountry", res.cCountryEn);
                setValue("Tgt.cDispatchProvince", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn);
                setValue("Tgt.cDispatchDetail", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn + ',' + res.cCountryCnEn);
              } else {
                setValue("Tgt.cDispatchCountry", res.cCountryEn);
                setValue("Tgt.cDispatchProvince", res.cAirportEn);
                setValue("Tgt.cDispatchDetail", res.cAirportEn + ',' + res.cCountryEn);
              }
            }
            // setValue("Tgt.cDispatchCountry", res.cCountryEn);
            // setValue("Tgt.cDispatchProvince", res.cAirportEn);
            // setValue("Tgt.cDispatchDetail", res.cAirportEn +','+ res.cCountryEn );
          }
        },
      },
      { width: "80" }
    );
  },
  // 起运机场国家
  cDepartureAirportCountryFunc: () => {
    setValue("Tgt.cDepartureAirport", null);
    setValue("Tgt.cDepartureAirportCountry", null);
    setValue("Tgt.cDepartureAirportProvince", null);
    let isYW = false
    if (getValue("Tgt.cDepartureAirportCountry")) {
      isYW = hasEnglish(getValue("Tgt.cDepartureAirportCountry"))
    }
    dialog.value?.open(
      "countryInfoModal",
      { type: "departure", data: { whichType: whichType.value, isYW } },
      {
        isOk: (res: any) => {
          if (getValue('Tgt.cDispatchCountry') && getValue('Tgt.cDispatchCountry') != res.cCountryCn && getValue('Tgt.cDispatchCountry') != res.cCountryEn) {
            ElMessage.error('起运地国家和起运机场国家要求一致')
            return
          }
          setFormItem('Tgt.cDepartureAirport', { disabled: false })
          if (res.cType === '1') {
            if (res.isCN) {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDepartureAirportCountry", res.cCountryCn);
                setValue("Tgt.cDepartureAirportProvince", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn);
                setValue("Tgt.cDepartureAirport", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn + ',' + res.cCountryCn);
              } else {
                setValue("Tgt.cDepartureAirportCountry", res.cCountryCn);
                setValue("Tgt.cDepartureAirportProvince", res.cCityCn);
                setValue("Tgt.cDepartureAirport", res.cCityCn + ',' + res.cCountryCn);
              }
            } else {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDepartureAirportCountry", res.cCountryEn);
                setValue("Tgt.cDepartureAirportProvince", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn);
                setValue("Tgt.cDepartureAirport", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn + ',' + res.cCountryEn);
              } else {
                setValue("Tgt.cDepartureAirportCountry", res.cCountryEn);
                setValue("Tgt.cDepartureAirportProvince", res.cCityEn);
                setValue("Tgt.cDepartureAirport", res.cCityEn + ',' + res.cCountryEn);
              }
            }
          } else {
            if (res.isCN) {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDepartureAirportCountry", res.cCountryCn);
                setValue("Tgt.cDepartureAirportProvince", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn);
                setValue("Tgt.cDepartureAirport", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn + ',' + res.cCountryCn);
              } else {
                setValue("Tgt.cDepartureAirportCountry", res.cCountryCn);
                setValue("Tgt.cDepartureAirportProvince", res.cAirportCity);
                setValue("Tgt.cDepartureAirport", res.cAirportCity + ',' + res.cCountryCn);
              }
            } else {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDepartureAirportCountry", res.cCountryEn);
                setValue("Tgt.cDepartureAirportProvince", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn);
                setValue("Tgt.cDepartureAirport", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn + ',' + res.cCountryEn);
              } else {
                setValue("Tgt.cDepartureAirportCountry", res.cCountryEn);
                setValue("Tgt.cDepartureAirportProvince", res.cAirportEn);
                setValue("Tgt.cDepartureAirport", res.cAirportEn + ',' + res.cCountryEn);
              }
            }
          }
        },
      },
      { width: "80" }
    );
  },

  // 目的地机场国家
  cDestinationAirportCountryFunc: () => {
    setValue("Tgt.cDestinationAirport", null);
    setValue("Tgt.cDestAirportCountry", null);
    setValue("Tgt.cDestAirportProvince", null);
    let isYW = false
    if (getValue("Tgt.cDestAirportCountry")) {
      isYW = hasEnglish(getValue("Tgt.cDestAirportCountry"))
    }
    dialog.value?.open(
      "countryInfoModal",
      { type: "departure", data: { whichType: whichType.value, isYW } },
      {
        isOk: (res: any) => {
          if (getValue('Tgt.cDestinationCountry') && getValue('Tgt.cDestinationCountry') != res.cCountryCn && getValue('Tgt.cDestinationCountry') != res.cCountryEn) {
            ElMessage.error('目的地国家和目的地机场国家要求一致')
            return
          }
          setFormItem('Tgt.cDestinationDetail', { disabled: false })
          if (res.cType === '1') {
            if (res.isCN) {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDestAirportCountry", res.cCountryCn);
                setValue("Tgt.cDestAirportProvince", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn);
                setValue("Tgt.cDestinationAirport", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn + ',' + res.cCountryCn);
              } else {
                setValue("Tgt.cDestAirportCountry", res.cCountryCn);
                setValue("Tgt.cDestAirportProvince", res.cCityCn);
                setValue("Tgt.cDestinationAirport", res.cCityCn + ',' + res.cCountryCn);
              }
            } else {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDestAirportCountry", res.cCountryEn);
                setValue("Tgt.cDestAirportProvince", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn);
                setValue("Tgt.cDestinationAirport", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn + ',' + res.cCountryEn);
              } else {
                setValue("Tgt.cDestAirportCountry", res.cCountryEn);
                setValue("Tgt.cDestAirportProvince", res.cCityEn);
                setValue("Tgt.cDestinationAirport", res.cCityEn + ',' + res.cCountryEn);
              }
            }
          } else {
            if (res.isCN) {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDestAirportCountry", res.cCountryCn);
                setValue("Tgt.cDestAirportProvince", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn);
                setValue("Tgt.cDestinationAirport", res.cProvinceCn + '/' + res.cCityCn + '/' + res.cDistrictCn + '/' + res.cAddressCn + ',' + res.cCountryCn);
              } else {
                setValue("Tgt.cDestAirportCountry", res.cCountryCn);
                setValue("Tgt.cDestAirportProvince", res.cAirportCity);
                setValue("Tgt.cDestinationAirport", res.cAirportCity + ',' + res.cCountryCn);
              }
            } else {
              if (res.cCountryEn == 'CHINA') {
                setValue("Tgt.cDestAirportCountry", res.cCountryEn);
                setValue("Tgt.cDestAirportProvince", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn);
                setValue("Tgt.cDestinationAirport", res.cProvinceEn + '/' + res.cCityEn + '/' + res.cDistrictEn + '/' + res.cAddressEn + ',' + res.cCountryEn);
              } else {
                setValue("Tgt.cDestAirportCountry", res.cCountryEn);
                setValue("Tgt.cDestAirportProvince", res.cAirportEn);
                setValue("Tgt.cDestinationAirport", res.cAirportEn + ',' + res.cCountryEn);
              }
            }
          }
        },
      },
      { width: "80" }
    );
  },

  //  检验代理人  按钮
  cCheckerCdeFunc: () => {
    dzmodal.open(surveyInfo, { type: "departure", data: {} }).then((res: any) => {
      if (res.type === "ok") {

        setValue("Tgt.cCheckerCde", res.body.cSryDoc);   // 代理人
        setValue("Tgt.cAddr", res.body.cAddr);   // 大洲
        // setValue("Tgt.cCountry",res.body.id);  // ?国家
        setValue("Tgt.cAraCde", res.body.cAraCde); // ?国家
        setValue("Tgt.cCtyCnm", res.body.cCtyCnm);  // 城市
        setValue("Tgt.cCode", res.body.cSrvyCde);  // 城市
      };
    });
  },
  // 建造完成年份
  tCompletionYearChange: (val: any) => {
    if (val) {
      const currentYear = new Date().getFullYear();
      const targetYear = new Date(val).getFullYear();
      setValue('Tgt.nShipAge', currentYear - targetYear)
    }
  },
  // 标的信息--证件类型
  cCertificateTypeChange: (val: any) => {
    // 道路运输
    // if (val === '1') {
    //   setFormItem("Tgt.cCertificateNo", { rules: [getRules("required", {}), getRules("roadTransportLicense", {})] })  //证件号
    // } else if (val === '2') {
    //   //  网络预约出租汽车经营许可证
    //   setFormItem("Tgt.cCertificateNo", { rules: [getRules("required", {}), getRules("onlineTaxiLicense", {})] })  //证件号
    // } else if (val === '3') {
    //   //  网络预约出租汽车运输证
    //   setFormItem("Tgt.cCertificateNo", { rules: [getRules("required", {}), getRules("onlineTaxiTransportLicense", {})] })  //证件号
    // }
    if (val) {
      setFormItem("Tgt.cCertificateNo", { rules: [getRules("required", {}), getRules("roadTransportLicense", {})] })  //证件号
    }

  },
  // 证件有效起期
  tStartDateDisable: (date: any) => {
    const fs = tgtEditRef?.value?.getFromValue();
    if (fs && JSON.stringify(fs) !== '{}') {
      const endDate = new Date(fs["Tgt.tEndDate"] || '')   // 结束时间 
      let minDate = dayjs(endDate).valueOf();
      return date.getTime() > minDate
    } else {
      return true;
    }
  },
  // 证件有效止期
  tEndDateDisable: (date: any) => {
    const fs = tgtEditRef?.value?.getFromValue();
    if (fs && JSON.stringify(fs) !== '{}') {
      const startDate = new Date(fs["Tgt.tStartDate"] || '')   // 开始时间   
      let maxDate = dayjs(startDate).valueOf();
      return date.getTime() < maxDate
    } else {
      return true;
    }
  },

  // 是否记名投保
  cIsinsuranceRegisteredChange: (val: any) => {
    if (val == '0') {
      setFormItem('Tgt.cPracticeType', {
        rules: [getRules("required", {})]
      })
    } else {
      setFormItem('Tgt.cPracticeType', {
        rules: []
      })
    }
  },
  // 投保行业
  getcInsuranceIndustryChange: (val: any) => {
    if (val === '8') {
      setFormItem('Tgt.cIndustryRemarks', {
        rules: [getRules("required", {})]
      })
    } else {
      setFormItem('Tgt.cIndustryRemarks', {
        rules: []
      })
    }
  },
  // 工程地址级联change
  getPropChange: (val: any) => {
    setregistAdd()
  },
  // 工程地址输入框change
  getcSuffixAddrChange: (val: any) => {
    setregistAdd()
  },


  getAddressstr: (val: any, row: any, pitem: any) => {
    let getv1 = '';  //集联地址
    let getv2 = '';  //字符串地址
    let setv = '';  //需要设置的目标地址

    let r = false;
    formconfig1.fromSchema?.forEach((item: any) => {
      if (r) {
        setv = item;
        r = false;
      }
      if (item.inputtype === 'rtinputgroup') {
        for (let i = 0; i < item.groupList.length; i++) {
          if (pitem.prop === item.groupList[i].prop) {
            r = true;
          }
        }
        if (r) {
          getv1 = item.groupList.filter((it: any) => it.inputtype === 'rtcascader');
          getv2 = item.groupList.filter((it: any) => it.inputtype === 'rtinput');
        }
      }
    })
    setAddressBykey(getv1, getv2, setv);
  },
  // 工程起期
  tProjectStartChange: (v: any) => {
    console.log(1112, v)
    const start = getValue("Tgt.tProjectStart");
    const end = getValue("Tgt.tProjectEnd");
    if (!end || !v) {
      return;
    }
    // const tmDay = moment(end).diff(moment(start), "days");
    const tm = moment(end).diff(moment(start), "seconds")
    if (tm < 0) {
      ElMessage.warning("“工程起期”不能小于“工程止期”");
      setFormValue({
        "Tgt.tProjectStart": null,
      });
      return;
    }
    setFormValue({
      "Tgt.nContractDuration": moment(end).add(1, 'second').diff(moment(start), "days"),
    });
  },
  // 工程止期
  tProjectEndChange: (v: any) => {
    const start = getValue("Tgt.tProjectStart");
    if (!start || !v) {
      return;
    }
    const startTime = moment(v).diff(moment(start), "days");
    if (startTime < 0) {
      ElMessage.warning("“工程止期”不能小于“工程起期”");
      setFormValue({
        "Tgt.tProjectEnd": null,
      });
      return;
    }
    const formattedDate = moment(v).format('YYYY-MM-DD') + ' 23:59:59';
    setFormValue({
      "Tgt.nContractDuration": moment(formattedDate).add(1, 'second').diff(moment(start), "days"),
      "Tgt.tProjectEnd": formattedDate, // 更新日期字段
    });
  },

  // // 工程起期禁用
  // tProjectStartDis:(val:any)=>{
  // //  console.log('工程1',val)
  // },

  // 工程止期禁用
  tProjectEndDis: (date: any) => {
    const fs = tgtEditRef?.value?.getFromValue();
    if (fs) {
      const startDate = new Date(fs["Tgt.tProjectStart"])   // 开始时间   1
      return date.getTime() < startDate.getTime()
    } else {
      return true;
    }
  },
  // 是否铁路联运
  cRailwayIntermodalChange: (val: any) => {
    console.log('是否联运', val)
    if (val === '1') {
      setValue('Tgt.cRailwayMode', '02')
    }

  },
  // 特种设备种类
  cEquipmentTypesFunc: () => {
    dialog.value?.open(
      "specialCateModal",
      {
        type: "show",
        method: {
          getdbClickData: (data:any) => {
            setFormItem("Tgt.cEquipmentCategory", {
              loadData: [{ label: data.cnm, value: data.cde }],
            });
            setValue("Tgt.cEquipmentCategory", `${data.cde}${data.cnm}`);
            dialog.value?.handleClose();
          },
        },
      },
      {},
      {  width: 85 }
    );
  },
  // 行业性质(弹框与国民经济行业分类一样)
  funcNdustryCate: () => {
    dialog.value?.open(
      "ndustryCateModal",
      {
        type: "show",
        method: {
          getdbClickData: (data:any) => {
            setFormItem("Tgt.cIndustryNature", {
              loadData: [{ label: data.cnm, value: data.cde }],
            });
            setValue("Tgt.cIndustryNature", data.cde);
            dialog.value?.handleClose();
          },
        },
      },
      {},
      { title: "行业性质", width: "70" }
    );
  },
  // 是否为上市公司
  cIsListedChange: (val:any) => {
    if(val === "1") {// 选是 上市时间 上市地点 股票代码必填
      setFormItem("Tgt.tListingTime", { rules: [getRules("required", {})] })
      setFormItem("Tgt.cListingLocation", { rules: [getRules("required", {})] })
      setFormItem("Tgt.cStockCode", { rules: [getRules("required", {})] })
    } else {
      setFormItem("Tgt.tListingTime", { rules: [] })
      setFormItem("Tgt.cListingLocation", { rules: [] })
      setFormItem("Tgt.cStockCode", { rules: [] })
    }
  },
  // 是否包含退市后责任（run-off）
  cIncludeDelistingChange: (val:any) => {
    if(val === "1") {// 选是 ___年必填
      setFormItem("Tgt.cSpecificYears", { rules: [getRules("required", {})] })
    } else {
      setFormItem("Tgt.cSpecificYears", { rules: [] })
    }
  },
  // 企业类别
  cEnterpriseCategoryChange: (val:any) => {
    if(val === "NV04900104") {// 选其他 所属行业必填
      setFormItem("Tgt.cIndustryAffiliation", { rules: [getRules("required", {})] })
    } else {
      setFormItem("Tgt.cIndustryAffiliation", { rules: [] })
    }
  },
  // 工程勘察资质
  cSurveyQualificationChange: (val:any) => {
    if(val === "2" || val === "3" || val === "4") {// 选专业XX资质 工程勘察专业类型必填
      setFormItem("Tgt.cEngineeringType", { rules: [getRules("required", {})] })
    } else {
      setFormItem("Tgt.cEngineeringType", { rules: [] })
    }
  },
  // 计划开工日期
  tCommencementDateChange:(v:any)=>{
    const end = getValue("Tgt.tCompletionDate");
    const tm = moment(end).diff(moment(v), "days");
    if (!end || !v) {
      return;
    }
    if (tm < 0) {
      ElMessage.warning("计划完工日期不能小于计划开工日期");
      setValue("Tgt.tCommencementDate", null);
      return;
    }
    setValue("Tgt.tConstructionPeriod", tm + 1);
  },
  // 计划完工日期
  tCompletionDateChange:(v:any)=>{
    const start = getValue("Tgt.tCommencementDate");
    if (!start || !v) {
      return;
    }
    const tm = moment(v).diff(moment(start), "days");
    if (tm < 0) {
      ElMessage.warning("划完工日期不能小于划开工日期");
      setValue("Tgt.tCompletionDate", null);
      return;
    }
    setValue("Tgt.tConstructionPeriod", tm + 1);
  },
  // 运输范围
  cToolTransportationScopeChange:(val:any)=>{
    if(val === "Transport02001802") {// 省内运输 省份/直辖市必填
      setFormItem("Tgt.cMunicipalityDirectly", { rules: [getRules("required", {})] })
    } else {
      setFormItem("Tgt.cMunicipalityDirectly", { rules: [] })
    }
	},
	// 是否绿色动力能源
	cGreenPowerFlagfun: (val: any) => {
		if (!params.initFlag) {
			setValue("Tgt.cGreenPowerType", null);
			setValue("Tgt.cGreenPowerOther", null);
		}
		if (val === "01") {// 是否绿色动力能源 选择是(01)---展示 绿色动力能源类型选择框
      setFormItem("Tgt.cGreenPowerType", { hidden: false, rules: [getRules("required", {})] })
		} else {
			setFormItem("Tgt.cGreenPowerType", { hidden: true, rules: [] })
			setFormItem("Tgt.cGreenPowerOther", { hidden: true, rules: [] })
    }
	},
	// 绿色动力能源类型
	cGreenPowerTypefun: (val: any) => {
		if (!params.initFlag) {
			setValue("Tgt.cGreenPowerOther", null);
		}
		if (val === "05") {// 绿色动力能源类型 选择其他（05）---展示 其他输入框切必填
      setFormItem("Tgt.cGreenPowerOther", { hidden: false, rules: [getRules("required", {})] })
		} else {
      setFormItem("Tgt.cGreenPowerOther", { hidden: true, rules: [] })
    }
	},
  // 累计保额按钮
  insuranceCoverageFunc:() => {
    if(!insuranceCoverageFlag) {
      insuranceCoverageFlag = true
      queryNrmbAmt({cAppNo: param.cAppNo}).then((res:any) => {
        if(res.code == '1') {
          ElMessage.warning({ message: res.message, duration: 3000 });
        } else {
          ElMessage.error(res.message)
        }
        insuranceCoverageFlag = false
      }).catch((err:any) => {
        ElMessage.error(err.message)
        insuranceCoverageFlag = false
      })
    }
  },
	// 建设工程信息-保险凭证类别
	cCertificateTypefun: async (val) => {
		setFormItem('Tgt.cCertificateDetailed', { autosize: true })
		const param = opertaor.getParam();
		if (param.initFlag) return
		const cCertificateTypeProd = ["059011", "059012", "059013", "059015", "059016", "059017", "059018", "059019", "059020"]
		if (cCertificateTypeProd.includes(params.cProdNo)) {
			try {
				const res = await getProductTemplate({prodNo:params.cProdNo,isCommon:val});
				if (res.code !== '200') {
					ElMessage.error(res.msg || '连接失败！');
					return;
				}
				setValue("Tgt.cCertificateTitle", res.data.cCertificateTitle) // 保险凭证标题
				setValue("Tgt.cCertificateInstitution", res.data.cInsuranceCompany) // 保险凭证机构
				setValue("Tgt.cCertificateDetailed", res.data.textTemplate) // 保险凭证详细
			} catch (err) {
				console.error('查询异常:', err);
				ElMessage.error('系统异常，请稍后重试');
			}
		}
	},
	// 风险累积
	getCumulativeRisk: () => {
		const isAccumulatedRiskProduct = ["110001", "110003", "040008", "040011", "040015",]
		let data1 = getFromValue()
		let data = {}
		const isInList = isAccumulatedRiskProduct.includes(params.cProdNo);
		const startsWith02 = params.cProdNo?.substring(0, 2) === "02";
		if (isInList) { // 船舶
			data.nType = 1
			data.cShipName = data1["Tgt.cShipName"] // 船名
		} else if (startsWith02) { // 货运
			data.nType = 2
			data.cShipName = data1["Tgt.cTransportationName"] // 船名
			data.cTransportVoyage = data1["Tgt.cVoyageNumber"] // 航次
		}
		dzmodal.open(cumulative, { type: "departure", data: data }).then((res: any) => {
			if (res.type === "ok") {
			};
		});
	},
	// 占用性质
	cTargetTypeNaturefun: (val) => {
		if (val[0] == '13' || val[0] == '12') {
			setFormItem('Tgt.cDurabilityLevel', {rules: [getRules("required", {})] });
			setFormItem('Tgt.cResistanceRating', {rules: [getRules("required", {})] });
			setFormItem('Tgt.cMainClassification', {rules: [getRules("required", {})] });
		} else {
			setFormItem('Tgt.cDurabilityLevel', {rules: [] });
			setFormItem('Tgt.cResistanceRating', {rules: [] });
			setFormItem('Tgt.cMainClassification', {rules: [] });
		}
    if(val) {
      codelistQuery({ codeListName: 'Subject_Type', codeListParam: { cParCde: val } }).then((res:any) => {
        if(res.code === 200 && res.data?.length > 0) {
          setFormItem('Tgt.cTargetType', { loadData: res.data });
        }
      });
    } else {
      setFormItem('Tgt.cTargetType', { loadData: [] });
    }
    const param = opertaor.getParam();
    if (param.initFlag) return
		setValue('Tgt.cTargetType', "");// 标的类型
	},
  // 担保金额
  nGuaranteeAmountChange: (val:any) => {
    const cProdNos = ['059011','059015','059016','059012','059014','059019',,'059021','059023','059901','059903','059904','059911','059914','059930','059018','059020','059013','059910','059017'];
    if(cProdNos.includes(params.cProdNo)) {
      const nAmt = opertaor.getTableRefByKey('base')?.getValue('Base.nAmt') || 0;
      if(val !== 0 && val !== nAmt) {
        ElMessage.warning('担保金额只能为0或等于保险金额');
        setValue('Tgt.nGuaranteeAmount', 0);
      }
    }
  },
	// 047002 保函类别
	cGuaranteeTypeChange: async(val: any) => {
		const param = opertaor.getParam();
		if (param.initFlag) return
		const codes = guaranteeTypeMap[val];
  
		if (!codes) {
			console.warn('未找到匹配的保函类别', val);
			return;
		}

		const [code1, code2, code3] = codes;

		try {
			// 并行调用三个接口
			const [res1, res2, res3] = await Promise.all([
				codeListStore.queryCodeList({ codeListName: code1 }),
				codeListStore.queryCodeList({ codeListName: code2 }),
				codeListStore.queryCodeList({ codeListName: code3 })
			]);

			// 根据实际返回结构提取你需要的值
			// 假设接口返回 { data: [...] }，且你只需要第一个项的 name 字段（请按实际调整！）
			// 如果返回的是纯数组，直接 res1[0]?.name

			// 示例：假设返回的是 { list: [...] } 或直接是数组
			const getValue1 = (response) => {
				// 根据你的实际 API 返回结构调整！
				const list = Array.isArray(response) ? response : response?.data || response?.list || [];
				// 假设取第一个的 label 字段，或你可以返回整个 list 让前端选择
				return list.length > 0 ? list[0].label || list[0].name || '' : '';
			};
			setValue('Tgt.cGuaranteeTitle', getValue1(res1)) // 保函标题
			setValue('Tgt.cGuaranteeInstitution', getValue1(res2)) // 保函机构
			setValue('Tgt.cGuaranteeLetter', getValue1(res3)) // 保函详细
			console.log('担保信息已更新:', getFromValue());
		} catch (error) {
			console.error('加载担保码表失败:', error);
			// 可选：重置字段或显示错误
			setValue('Tgt.cGuaranteeTitle', null) // 保函标题
			setValue('Tgt.cGuaranteeInstitution', null) // 保函机构
			setValue('Tgt.cGuaranteeLetter', null) // 保函详细
		}
	},
  // 是否施工联合体
  cIsConsortiumFunc: (val:any) => {
    eventBus.emit('setMap-cUnionMembers', val)
  },
	// 是否出具蓝卡
	cBlueCardChange: async (val: any) => {
		const param = opertaor.getParam();
		if (param.initFlag) return
		setValue('Tgt.cMaritimeAdministration', null) // 海事局名称
		if (val == '1') {
			try {
				const [res1] = await Promise.all([
					codeListStore.queryCodeList({ codeListName: 'MS040008' }),
				]);
				const getValue1 = (response) => {
					const list = Array.isArray(response) ? response : response?.data || response?.list || [];
					return list.length > 0 ? list[0].label || list[0].name || '' : '';
				};
				setValue('Tgt.cMaritimeAdministration', getValue1(res1)) // 海事局名称
			} catch (error) {
				setValue('Tgt.cMaritimeAdministration', null) // 海事局名称
			}
		}
	},
  // 融资性保证险
  cFinancingGuaranteeBtnFunc:() => {
    dialog.value?.open('cFinancingGuarantee', {
      selectedData: getValue("Tgt.cFinancingGuaranteeCode"), //需要把自定义的过滤掉，只传过去从模板中选择的
    },
      {
        getSelected(selectdata: any) {
          setValue("Tgt.cFinancingGuaranteeCode", selectdata.map((item:any) => item.value).join(','))
          setValue("Tgt.cFinancingGuarantee", selectdata.map((item:any) => `${item.value}. ${item.label}`).join('\n'))
        },
      }, { width: 45 });
  },
};

const subsidyFields = [
  { key: 'Tgt.nCentralSubsidyRate', label: '中央财政补贴比例' },
  { key: 'Tgt.nProvincialSubsidyRate', label: '省财政补贴比例' },
  { key: 'Tgt.nCitySubsidyRate', label: '地市财政补贴比例' },
  { key: 'Tgt.nCountySubsidyRate', label: '县(区)补贴比例' },
  { key: 'Tgt.nOtherSubsidyRate', label: '其他补贴比例' },
  { key: 'Tgt.nFarmerPaymentRate', label: '农户缴费比例' }
];
// 019904  089031产品六个比例之和为100%
const createSumValidator = (currentFieldKey) => {
  return (rule, value, callback) => {
		// 辅助函数：获取值并转为 Decimal
    const getDataValue = (key) => {
      let val = getValue(key);
      clearValidate(key)
      if (val === '' || val === null || val === undefined) return null;
      
      const num = new Decimal(val);
      if (num.isNaN()) return null;
      
      return num;
    };

    const values = [];
    let hasEmpty = false;

    for (let field of subsidyFields) {
      const rawVal = getDataValue(field.key);
      
      if (rawVal === null) {
        hasEmpty = true;
        break;
      }

      // 【核心逻辑】：
      // 1. times(100): 将前端的小数 (0.2) 转为百分比数值 (20)
      // 2. 不做任何 toDecimalPlaces 处理，保留原始精度
      const percentVal = rawVal.times(100);
      
      values.push(percentVal);
    }

    // 如果有空值，跳过校验
    if (hasEmpty) {
      return callback();
    }

    // D. 计算总和 (纯累加，无精度截断)
    const sum = values.reduce((acc, curr) => acc.plus(curr), new Decimal(0));

    // E. 严格判断是否等于 100
    // Decimal 的 equals 方法会进行精确比较
    if (!sum.equals(100)) {
      return callback(new Error(`所有比例之和必须严格等于 100%。当前计算总和为 ${sum.toNumber()}%`));
    }

    return callback();
  };
};

function setAddressBykey(getv1: any, getv2: any, setv: any) {
  const a = tgtEditRef?.value?.getValue(getv1[0]?.prop);
  const b = tgtEditRef?.value?.getValue(getv2[0]?.prop);

  const setS = setv.prop;
  if (a) {
    getAddressStr({ address: a }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const c = (data ? data["addStr"] : "") + (b ? b : "");
        setValue(setS, c);
      }
    });
  } else {
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
    || params.cProdNo === '049035' || params.cProdNo === '049036'
    || params.cProdNo === '049037' || params.cProdNo === '049040'
    || params.cProdNo === '049041'
  ) {
    const cInsuranceMethod = getValue("Tgt.cInsuranceMethod");
    const cIndustryType = getValue("Tgt.cIndustryType");
    const plyBase = opertaor.getTableRefByKey('plyBase');
    let subSidiary = null;
    if (plyBase) {
      subSidiary = plyBase.getValue('Base.cDptCde');
      subSidiary = subSidiary?.substring(0, 6);
    }

    let h = true;
    if (cIndustryType === '15' && (subSidiary === '024101' || subSidiary === '026201' || subSidiary === '024201'
      || subSidiary === '023702' || subSidiary === '026401')) {
      h = false;
    } else {
      if (cInsuranceMethod !== '613001') {
        h = false;
      }
    }

    formconfig1.fromUi.groupBy.forEach(item => {
      if (item.id == 'group2') {
        item.hidden = h;
      }
    });
    // 按人数投保时清空group2的数据
    if(h === true) {
      formconfig1.fromSchema?.forEach((item) => {
        if (item.group === 'group2') {
          setValue(item.prop, null);
        }
      });
    }
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
function clearValidate(key = null) {
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
        }else {
          Object.assign(item, obj);
          if(item.inputtype==='rtinputgroup'){
              Object.assign(item.groupList[0], obj);
              Object.assign(item.groupList[1], obj);
          }
        }
      }
    });
  }
}
const terms1 = ['00425000277', '00425000278', '00425000279', '00425000282', '00425000283'];
const terms2 = ['00425000281', '00425000280'];
function change403009(v) {
  if (terms1.includes(v)) {
    setValue("Tgt.cInsuranceMethod", "613001");
    setFormItem("Tgt.cInsuranceMethod", { disabled: true });
  }
  if (terms2.includes(v)) {
    setValue("Tgt.cInsuranceMethod", "613001");
    setFormItem("Tgt.cInsuranceMethod", { disabled: true });
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
  setFormItem,
});
</script>

<style scoped></style>

<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="baseEditRef" />
  <comDialog ref="dialogRef"></comDialog>
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { codeListViewStore } from "@/store";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { formatDate } from "@/utils/date";
import { policyRatio,validShanDong } from "@/api/query";
import { useRoute } from "vue-router";
const route = useRoute();
import { ratio } from "@/api/prod"
import dayjs from "dayjs";
import { eventBus } from '@/utils/event-bus'
import { idxParamKey, IdxParamProps, useIdxParam } from "@/views/pcis/support/useIdxParam";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { lessThan6Months } from "@/utils/date";
import { getDeptOptions } from "@/api/dept";
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());

const opertaor = dataOpertaor(idxParam.opertaorProps);
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const dialogRef = ref<DialogMethod | null>(null);
const params = opertaor.getParam();
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

const baseEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive(createAppFreeEditConfig({}));
const sessionData = ref();
const fixSpecData = ref([]); //存储已选择的特别约定数据
onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);

  if (sessionStorage.getItem("toMyPageData")) {
    sessionData.value = JSON.parse(sessionStorage.getItem("toMyPageData"));
  }
  setValue("Base.nAmtRmbExch", "1.000000");
  setValue("Base.nPrmRmbExch", "1.000000");
  setValue("Base.cCumulativeLimitManual", "0");
  setValue("Base.cAccidentLimitManual", "0");
  // 隐藏短期费率类型
  // setFormItem("Base.cRatioTyp", { 
  //   hidden: true
  // });

  // 短期费率类型,以下产品只支持按日的短期费率类型
  const disabledProducts = [
    "040016", "059014", "059015", "070002", "043021",
    "120008", "059018", "059017", "059016", "043020",
    "049019", "049020"
  ];

  const isDisabled = disabledProducts.includes(params.cProdNo);
  // setFormItem("Base.cRatioTyp", { 
  //   disabled: isDisabled
  // });
  if (params?.cRecordType === 9 || params.cPolicySource == 9) {
    setFormItem('Base.cRatioTyp', { hidden: true })
    setFormItem('Base.nRatioCoef', { hidden: true })
		opertaor.setDisabledAll(['plyBase','applicant'])
  }
  // 02的产品，除了020014、020018、020019、020019、020021之外的产品 不需要短期费率系数
  const hidenRatioCoefProdNoMap = ['020014','020018','020019','020019','020021'];
  if(params.cProdNo?.slice(0,2) === "02" && !hidenRatioCoefProdNoMap.includes(params.cProdNo)){
    setFormItem('Base.nRatioCoef', { hidden: true })
  }
  // 历史数据补全-短期费率类型可编辑
  if((params?.pageType === 'EDR_APP_NEW_SCENE' || params?.pageType === 'TEMPORARY_DEPOSIT') && (params.cTransMrk == '1' || params.cRsnCde === '99' || params.cEdrRsnBundle === '99' || params.cEdrRsnBundleCde === '99')) {
    setFormItem('Base.cRatioTyp', { disabled: false })
  }
  formconfig11.fromSchema?.forEach((item:any) => {
    if(item.prop === "Base.groupAmtCur") {
      item.labelLength = 11
    }
    if(item.prop === "Base.groupAmtExch") {
      item.labelLength = 13
      // item.groupList[1].minWidth = "88px"
    }
    if(item.prop === "Base.nRmbAmt") {
      item.labelLength = 15
    }
    if(item.prop === "Base.groupPrmExch") {
      // item.groupList[1].minWidth = "88px"
    }
  })
  nextTick(async() => {
		// 协议出单-收费方式、付费约定、缴费期数设置不可编辑
		//回显出单机构
		let label = params.cDptCnm
		 if (!params.cDptCnm) {
			const response = await getDeptOptions(params.cDptCde);
			if (response.data.length>0) {
				label = response.data[0]["label"]
			}
		}
		setFormItem("Base.cDptCde", {
      loadData: [
        { value: params.cDptCde, label: `${params.cDptCde} ${label || ''}` },
      ],
    });
    //回显服务机构数据
    setFormItem("Base.cIntroDptcde", {
      loadData: [
        { value: params.cDptCde, label: `${params.cDptCde} ${label || ''}` },
      ],
    });		
  if(params.cRecordType == 9) {
    setFormItem('Base.cFinTyp',{
      disabled:  true
    })
    setFormItem('Base.cInstMrk',{
      disabled:  true
    })
    setFormItem('Base.nPayNum',{
      disabled:  true,
      btnItems: {
        disabled: true
      }
    })
  }
    eventBus.on('setUnDisabledDone', () => {
      nextTick(() => {
        if(['10','ZQ','JQ','07','08','80'].includes(params.cRsnCde)) {
          // 【是否修改累计赔偿限额】为否，增加/减少清单信息、增加/减少保额批改，【修改后的累计赔偿限额】可以放开编辑
          if(getValue('Base.cCumulativeLimitManual') == '0') {
            setFormItem("Base.nAmt", { disabled: false });
          }
          // 【是否修改每次事故赔偿限额】为否，增加/减少清单信息、增加/减少保额批改，【每次事故赔偿限额】【修改后的每次事故赔偿限额】可以放开编辑
          if(getValue('Base.cAccidentLimitManual') == '0') {
            setFormItem("Base.nModifiedAccidentLimit", { disabled: false });
          }
        }
      })
    })
  })
});

// 获取我司比例
const getOwnShare = () => {
  let ownShare = 0;
  const data = opertaor.getDataAll();
  let ciArr = data['ci']
  //  const cCiMrk = data.plyBase?.['Base.cCiMrk'];
  if (ciArr && ciArr.length > 0) {
    ciArr.forEach((item: any) => {
      const CDptMrk = item['Ci.cCoinsurerCde']
      if (!!CDptMrk && CDptMrk === "327001") {
        ownShare += Number(item['Ci.nCiShare'])
      }
    })
  }
  return ownShare;
}

// 拆分事件
const nPayNumberFun = () => {
  const tabref = opertaor.getTableRefs();
  const baseBefore = tabref["base"].getFromValue();
  const baseData = opertaor.getDataAll()['base']['needCalc'];
  const payinfoRef = opertaor.getTableRefByKey("payinfo").getFromValue();
  console.log('opertaor', baseData, opertaor.getDataAll(), baseBefore)

  if (!baseData && payinfoRef.length < 1) {
    ElMessage.error("请先进行保费计算!");
    return false
  }

  if (Number(getValue("Base.nPayNum")) > 12) {
    ElMessage.warning("拆分最多为12期！");
    return false
  }
  if (getValue("Base.nPayNum") != '') {

    // 拆分 添加特约信息
    if(getValue('Base.cInstMrk') =='5')eventBus.emit('add-special');

              
    const data = opertaor.getDataAll();
    let nCiShare = Number(getOwnShare()) || 1;
    const totalAmount = Number(data['base']['Base.nPrm']) || 0;
    const splitCount = Number(data.base?.['Base.nPayNum']) || 0;

    const totalCent = Math.round(totalAmount * 100);
    const result = ref<number[]>([]);
    const quotient = Math.floor(totalCent / splitCount);
    const remainder = totalCent % splitCount;
    // const validSplitCount = Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(Number(splitCount) || 0)));
    // result.value = Array(validSplitCount).fill(quotient);
    result.value = Array(splitCount).fill(quotient);
    if (remainder > 0) {
      result.value[splitCount - 1] += remainder;
    }

    result.value = result.value.map(cent => parseFloat((cent / 100).toFixed(8)));
    const totalOwnPrm = parseFloat((totalAmount * nCiShare).toFixed(2)); // 总我司保费
    const ownPrmList = [];
    let baseOwnTotal = 0; // 前n-1期我司保费总和

    // 计算前n-1期我司保费
    for (let i = 0; i < splitCount - 1; i++) {
      const ownPrm = parseFloat((result.value[i] * nCiShare).toFixed(2));
      ownPrmList.push(ownPrm);
      baseOwnTotal += ownPrm;
    }

    // 最后一期我司保费 = 总我司保费 - 前n-1期总和（确保总额匹配）
    if (splitCount >= 1) {
      const lastOwnPrm = parseFloat((totalOwnPrm - baseOwnTotal).toFixed(2));
      ownPrmList.push(lastOwnPrm);
    }

    let val = {}
    let valArr = []
    for (let i = 0; i < Number(getValue("Base.nPayNum")); i++) {
      let BgnTmDate = new Date(opertaor.getTableRefs()["insrnc"].getValue("Base.tInsrncBgnTm"))   // 开始时间
      let startDate = new Date(BgnTmDate);
      let endDate = new Date(BgnTmDate)
      if (getValue("Base.cInstMrk") == '5') {
        startDate.setDate(BgnTmDate.getDate() + i * 15);
        endDate.setDate(BgnTmDate.getDate() + (i + 1) * 15);
      } else {
        startDate.setDate(BgnTmDate.getDate() + i * 30);
        endDate.setDate(BgnTmDate.getDate() + (i + 1) * 30);
      }

      let tInsrncBgnTm = formatDate(startDate, 'yyyy-MM-dd HH:mm:ss')
      // let tPayEndTm = formatDate(endDate,'yyyy-MM-dd HH:mm:ss')

      let tPayEndTm = dayjs(endDate).add(-1, 'second').format("YYYY-MM-DD HH:mm:ss")
      val = {
        "_dataId": "",
        "Pay.nTms": i + 1,
        "Pay.cPayorCde": opertaor.getTableRefs()["applicant"].getValue("Applicant.cAppCde"),
        "Pay.tPayBgnTm": tInsrncBgnTm,
        "Pay.tPayEndTm": tPayEndTm,
        "Pay.nOwnPrm":  ownPrmList[i],   // 我司
        // "Pay.nOwnPrm": result.value[i] ? parseFloat((result.value[i] * nCiShare).toFixed(8)) : 0,   // 我司
        // "Pay.nOwnPrm": result.value[i] || 0 ,   // 我司
        "Pay.cPayorNme": opertaor.getTableRefs()["applicant"].getValue("Applicant.cAppNme"),
        "Pay.nPayablePrm": result.value[i] || 0, // 应收
        "Pay.nPrmVar": result.value[i]     // 差额
      }
      valArr.push(val)
     
    }
    // 投保单期且保险期间小于30天，缴费止期等于保险止期
    const insrnc = opertaor.getTableRefByKey("insrnc");
    if(valArr.length === 1 && getValue("Base.nPayNum") == 1 && insrnc?.getValue("Base.cTmSysCde") && Number(insrnc?.getValue("Base.cTmSysCde")) < 30) {
      valArr[0]["Pay.tPayEndTm"] = dayjs(insrnc?.getValue("Base.tInsrncEndTm")).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    }

 
    //   let num = 0;
    //   valArr.forEach((item: any) => {
    //     item['Pay.nPayablePrm'] = item['Pay.nPayablePrm'] || 0;
    //     item['Pay.nOwnPrm'] = item['Pay.nPayablePrm'] ? parseFloat((item['Pay.nPayablePrm'] * nCiShare).toFixed(8)) : 0
    //     num += item['Pay.nOwnPrm']
    //   })

    //   const cCiMrk = ['0', '5'].includes(data.plyBase?.['Base.cCiMrk']);  // 是否   联共保
    //   if (!cCiMrk) {
    //     const nCiOwnPrm = data.ciMasterAgreement?.['Base.nCiOwnPrm']   // 联共保 我司保费
    //     let differNum = nCiOwnPrm - num // 差额
    //     valArr[valArr.length - 1]['Pay.nOwnPrm'] = valArr[valArr.length - 1]['Pay.nOwnPrm'] + differNum
    //   }

    console.log('数据', valArr)

    opertaor.getTableRefByKey("payinfo").setFormValue(valArr);
  }
}

// 山东拆分事件
const shanDongFun = () => {
  const plyBase = opertaor.getTableRefByKey('plyBase')?.getFromValue();
  const applicant = opertaor.getTableRefByKey('applicant')?.getFromValue();
  const insrnc = opertaor.getTableRefByKey('insrnc')?.getFromValue();
  const base  = opertaor.getTableRefByKey('base')?.getFromValue();
  const baseData = opertaor.getDataAll()['base']['needCalc'];
  const payinfoRef = opertaor.getTableRefByKey("payinfo").getFromValue();
  if (!baseData && payinfoRef.length < 1) {
    ElMessage.error("请先进行保费计算!");
    return true;
  }
  const totalPrm = Number(base['Base.nPrm'] || 0);
  if (totalPrm <= 100_000) 
  return true;

  const totalCent = Math.round(totalPrm * 100)  // 总保费→分
  // 拆分 添加特约信息
  if(getValue('Base.cInstMrk') =='5')eventBus.emit('add-special');
  
 
  /* ---------- 2. 计算保险期限（自然年） ---------- */
  const tmStart = dayjs(insrnc['Base.tInsrncBgnTm']);
  const tmEndRaw  = dayjs(insrnc['Base.tInsrncEndTm']);     // 页面值
  const tmEnd   = dayjs(insrnc['Base.tInsrncEndTm']).add(1, 'second');

  const wholeYears = tmEnd.diff(tmStart, 'year'); 
  const maxPhase = 4 + Math.max(0, wholeYears - 1);

  /* ---------- 3. 取期数---------- */
  const nPayNum = Number(base['Base.nPayNum'] || 0)  // "1"  缴费期数
  if (nPayNum < 2) return true;   // 只处理分期业务
  if ( nPayNum > maxPhase) {
    const remainDays = tmEnd
        .subtract(wholeYears, 'year')
        .diff(tmStart, 'day')
    const yearTxt = wholeYears === 0 ? '' : `${wholeYears}年`
    const dayTxt  = remainDays === 0 ? '' : `${remainDays}天`
    ElMessage.error(
        `山东见费业务保险期限为${yearTxt}${dayTxt}，最多允许拆分 ${maxPhase} 期`
    )
    // 设置值
    opertaor.getTableRefByKey('base').setValue("Base.nPayNum", maxPhase);
    return true
  }
  /* ---------- 4. 首期规则 ---------- */
  const firstCent = Math.max(Math.round(totalCent * 0.25), 5_000_000 ); // 25% 或 5 万取高
  
  /* ---------- 5. 生成计划 ---------- */
  const restCent = totalCent - firstCent;
  const avgRest = restCent / (nPayNum - 1);    // 理论平均值
  const floor = Math.round(avgRest * 0.95);    // ±5% 边界
  const ceil  = Math.round(avgRest * 1.05);

  // 首期
  const cents = [];
  cents.push(firstCent);                               

  /* 中间期 */
  for (let i = 1; i < nPayNum - 1; i++) {
    cents.push(Math.round(avgRest));
  }

  /* 末期（剩余）*/
  let lastRaw = restCent - Math.round(avgRest) * (nPayNum - 2);
  cents.push(lastRaw);         

  /* 尾差±1 分*/
  let diff = totalCent - cents.reduce((a, b) => a + b, 0);
  for (let i = cents.length - 1; diff !== 0; i--) {
    const delta = diff > 0 ? 1 : -1;
    const next = cents[i] + delta;
    if (next >= floor && next <= ceil && next >= 0) {
        cents[i] = next;
        diff -= delta;
    }
  }
    
  /* 再钳位末期（仅末期）,转回元 */
  const lastIdx = cents.length - 1;
  cents[lastIdx] = Math.max(floor, Math.min(ceil, cents[lastIdx]));
  const plans = cents.map(v => v / 100);

  /* ---------- 6. 时间规则 ---------- */
  const lastPayMaxTm = tmEndRaw.subtract(30, 'day');   // 责任终止前 30 天

  const phaseDays = tmEnd.diff(tmStart, 'day') / nPayNum
  
  let val = {};
  let payinfoArr:any = [];
  for (let i = 0; i < nPayNum; i++) {
    // const payBgn = tmStart.add(i * phaseDays, 'day');
    // const payEnd = i === nPayNum - 1
    //   ? lastPayMaxTm
    //   : tmStart.add((i + 1) * phaseDays, 'day').subtract(1, 'second');

    const payBgn = i > 0 ? dayjs(payinfoArr[i - 1]['Pay.tPayEndTm']).add(1, 'day').startOf('day') : tmStart;
    // 分期缴费日期间隔最大值 = 应收保费 / 总保费 * 保险期间天数
    const days = Math.floor((plans[i] / Number(base['Base.nPrm'])) * Number(insrnc['Base.cTmSysCde']));
    const payEnd = i === nPayNum - 1 ? dayjs(insrnc['Base.tInsrncEndTm']).subtract(30, 'day') : dayjs(payBgn).add(days - 1, 'days').endOf('day');
    if (i === nPayNum - 1 && payEnd.isAfter(lastPayMaxTm)) {
      ElMessage.error('最后一期缴费时间不得晚于保险责任终止日前 30 个自然日')
      return true
    }
     val = {
        "_dataId": "",
        "Pay.nTms": i + 1,
        "Pay.cPayorCde": opertaor.getTableRefs()["applicant"].getValue("Applicant.cAppCde"),
        "Pay.cPayorNme": opertaor.getTableRefs()["applicant"].getValue("Applicant.cAppNme"),
        "Pay.tPayBgnTm": payBgn.format('YYYY-MM-DD HH:mm:ss'),
        "Pay.tPayEndTm": payEnd.format('YYYY-MM-DD HH:mm:ss'),
        "Pay.nOwnPrm":  plans[i],  // 我司
        "Pay.nPayablePrm": plans[i], // 应收
        "Pay.nPrmVar": plans[i]     // 差额
      }
      payinfoArr.push(val);
  }
  opertaor.getTableRefByKey('payinfo').setFormValue(payinfoArr);
}

// 绑定方法
const method = {
  func1: () => {
  },

  //缴费拆分按钮事件
  splitPayNumber: async () => {
    // 满足山东条件，按照山东拆分
    const isShandongCase = await judgeShandongCase();  
    if (isShandongCase) {
        // 山东见费提示语
        if (checkShanDong()) return;
        shanDongFun();
        return;
    }
    // 普通拆分
    nPayNumberFun();
  },
  //付费约定下拉事件
  cInstMrkChange(val: any) {
    console.log('付费约定', val)
    const param = opertaor.getParam();
    if (param.initFlag) {
      return;
    }
    if (val == '5') {
      setFormItem("Base.nPayNum", { disabled: false, max: 12 });
    } else if (val == '0') {
      setFormItem("Base.nPayNum", { disabled: true, });
      setValue('Base.nPayNum', 1)
      console.log('执行了吗')

      nPayNumberFun();
    }
    eventBus.emit('change-special', val)
  },
  //争议处理选择事件
  cDisptSttlCdeChange(val){
    const param = opertaor.getParam();
    if (param.initFlag) {
      return ;
    }
    if(val=='A'){
      // setFormItem("Base.cDisptSttlOrg", { disabled: false,rules: [getRules("required", {})] });
      setFormItem("Base.cDisptSttlOrg", { rules: [getRules("required", {})] });
      setValue("Base.cDisptSttlOrg", "提交____仲裁委员会");
    } else {
      setFormItem("Base.cDisptSttlOrg", { rules: [] });
      setValue("Base.cDisptSttlOrg", "");
    }

  },
  //总保费下拉事件
  cPrmCurChange: (val: any) => {
    if (val && idxParam && idxParam.getcPrmCur) {
      idxParam.getcPrmCur(val)
    }
    try {
      const getFormconfig = opertaor.getTableRefs()['AgentTgt']
			const cDestinationCountry = opertaor.getTableRefs()['tgt']?.getValue('Tgt.cDestinationCountry')
			if (!!cDestinationCountry && cDestinationCountry != 'CHINA' && cDestinationCountry != '中国') {
				getFormconfig?.setValue('Tgt.cPayCur', 'CNY')
			} else { 
				getFormconfig?.setValue('Tgt.cPayCur', val)
			}

    } catch (err) {
      console.log(err)
    }
    const param = opertaor.getParam();
    if (param.initFlag && !['orig', 'copy', 'template', 'inquiryToApp'].includes(param.pageType)) {
      return;
    }
    if (val !== "CNY") {
      codeListStore
        .queryCodeList({
          codeListName: "WEB_BAS_CHGRATE",
          codeListParam: { value: val },
        })
        .then((res) => {
          setValue("Base.nPrmRmbExch", res[0].currency_rate);
        });
    } else {
      setValue("Base.nPrmRmbExch", "1.000000");
    }
  },
  //总保额币种下拉事件
  cAmtCurChange(val: any) {
    if (val && idxParam && idxParam.setcAmtCur) {
      idxParam.setcAmtCur(val)
    }
    const param = opertaor.getParam();
    if (param.initFlag && !['orig', 'copy', 'template', 'inquiryToApp'].includes(param.pageType)) {
      return;
    }
    if (val !== "CNY") {
      codeListStore
        .queryCodeList({
          codeListName: "WEB_BAS_CHGRATE",
          codeListParam: { value: val },
        })
        .then((res) => {
          setValue("Base.nAmtRmbExch", res[0].currency_rate);
        });
    } else {
      setValue("Base.nAmtRmbExch", "1.000000");
    }
  },
  //保额汇率标识change事件
  cInsExchCdeChange(val: any) {

    if (val == "0") {// 协议汇率
      setFormItem("Base.nAmtRmbExch", { disabled: false });
      //           Base.nAmtRmbExch
    } else {// 实时汇率
      setFormItem("Base.nAmtRmbExch", { disabled: true });
      // setValue("Base.nAmtRmbExch", "1.000000");
      const cAmtCur = getValue("Base.cAmtCur")
      if (cAmtCur) {
        method.cAmtCurChange(cAmtCur)
      }
    }
  },
  //保费汇率标识change事件
  cPremExchCdeChange(val: any) {
    if (val == "0") {
      setFormItem("Base.nPrmRmbExch", { disabled: false });
    } else {
      setFormItem("Base.nPrmRmbExch", { disabled: true });
      // setValue("Base.nPrmRmbExch", "1.000000");
      const cPrmCur = getValue("Base.cPrmCur")
      if (cPrmCur) {
        method.cPrmCurChange(cPrmCur)
      }
    }
  },
  // 特别约定ICON事件
  selectCUnfixSpc: () => {
    dialogRef.value?.open(
      "prdFixSpec",
      {
        type: "show",
        data: {
          cProdNo: sessionData.value?.cProdNo,
          fixSpecData: fixSpecData.value, //之前选中的数据数组
        },
        method: {
          getSelected: (params) => {
            if (params && params.length) {
              fixSpecData.value = params;
              let i = 1;
              // let cSpecNo = '';
              let cUnfixSpc = "";
              params.forEach((value) => {
                // cSpecNo = '' === cSpecNo ? value['PrdFixSpec.CSpecNo'] : cSpecNo + '$$' + value['PrdFixSpec.CSpecNo'];
                cUnfixSpc =
                  "" === cUnfixSpc
                    ? i + "." + value["PrdFixSpec.CNmeCn"]
                    : cUnfixSpc + "\n" + i + "." + value["PrdFixSpec.CNmeCn"];
                setValue("Base.cUnfixSpc", cUnfixSpc);
                i++;
              });
            }
            dialogRef.value?.handleClose();
          },
        },
      },
      {
        isOk: (selectdata: any) => {
        },
      },
      { title: "特别约定", width: 85 }
    );
  },
  // 短期费率类型
  cRatioTypChange: (val: any) => {
    const tabref = opertaor.getTableRefs();
    const baseBefore = tabref["insrnc"].getFromValue();
    let prodNo = route.params.param?.cProdNo;
    let param = {
      bgnTm: baseBefore["Base.tInsrncBgnTm"],
      endTm: baseBefore["Base.tInsrncEndTm"],
      prodNo,
      ratioType: val
    }
    const tgt = tabref["tgt"]?.getFromValue();
    if(tgt?.['Tgt.cInsuranceMethod'] && ['613002', '613003', '613004'].includes(tgt?.['Tgt.cInsuranceMethod'])) {
      setValue("Base.nRatioCoef", Number(1).toFixed(6));
      return;
    }
    policyRatio(param).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        setValue("Base.nRatioCoef", Number(data).toFixed(6));
      }
    });
  },
  // 总保额(累计赔偿限额)change事件
  nAmtChange: (val: any) => {
    if (null != val) {
      const namtRmbExch = getValue('Base.nAmtRmbExch');
      if (!!namtRmbExch) {
        // 计算折人民币保额
        setValue("Base.nRmbAmt", numMulti(val, namtRmbExch));
      }
    }
  },
  // 总保费change事件
  nPrmChange: (val: any) => {
    if (null != val) {
      const nprmRmbExch = getValue('Base.nPrmRmbExch');
      if (!!nprmRmbExch) {
        // 计算折人民币保费
        setValue('Base.nRmbPrm', numMulti(val, nprmRmbExch))
      }
    }
  },
  // 修改后总保额(累计赔偿限额)change事件
  aAmtChange: (val: any) => {
    const namtExch = getValue('Base.nAmtRmbExch');
    if (!!namtExch) {
      // 计算折人民币保额
      setValue("Base.nRmbAmt", numMulti(namtExch, val));
    }
    const param = opertaor.getParam();
    if (param.initFlag) {
      return;
    }
    // 联共保主协议信息-共保总保额ciMasterAgreement
    if(val && getValue("Base.nCumulativeLimitModified") && val > Number(getValue("Base.nCumulativeLimitModified"))) {
      ElMessage.warning("修改后总保额(累计赔偿限额)不能大于总保额(累计赔偿限额！");
      setValue("Base.nAmt", getValue("Base.nCumulativeLimitModified"));
      return;
    }
    const cCiMrkMap = ['1', '2', '3', '4'];
    if(cCiMrkMap.includes(opertaor.getTableRefByKey('plyBase')?.getValue("Base.cCiMrk")) && getValue("Base.nCumulativeLimitModified") && getValue("Base.nCumulativeLimitModified") != val) {
      opertaor.getTableRefByKey('ciMasterAgreement')?.setValue("Base.nCiJntAmt", val);
      nextTick(() => {
        ElMessage.warning("共保总保额发生变化，请重新计算保费！");
      })
    }
  },
  // 总保额(累计赔偿限额)汇率change事件
  nAmtRmbExchChange: (val: any) => {
    if (!!val) {
      const namt = getValue('Base.nAmt');
      if (!!namt) {
        // 计算折人民币保额
        setValue("Base.nRmbAmt", numMulti(namt, val));
      }
    }
  },
  // 是否修改累计赔偿限额 是和否change事件
  nAmtLimitManualChange: (val: any) => {
    if(val == '0'){
      setFormItem("Base.nAmt", { disabled: true });
    } else{
      setFormItem("Base.nAmt", { disabled: false });
    }
  },
   // 是否修改每次事故赔偿限额
  cAccidentLimitChange: (val: any) => {
    if(val == '0'){ // 否 
        setFormItem("Base.nModifiedAccidentLimit", { rules: [], disabled: true });
    } else{  // 是 必填
        setFormItem("Base.nModifiedAccidentLimit", { rules: [getRules("required", {})], disabled: false });
    }
  },
  // 总保费汇率change事件
  nPrmRmbExchChange: (val: any) => {
    if (!!val) {
      const nprm = getValue('Base.nPrm');
      if (!!nprm) {
        // 计算折人民币保费
        setValue("Base.nRmbPrm", numMulti(nprm, val));
      }
    }
  },
};
/* ========== 山东校验点拆分提示语（阻断返回 true） ========== */
const checkShanDong = () => {
  const plyBase = opertaor.getTableRefByKey('plyBase')?.getFromValue();
  const applicant = opertaor.getTableRefByKey('applicant')?.getFromValue();
  const insrnc = opertaor.getTableRefByKey('insrnc')?.getFromValue();
  const base  = opertaor.getTableRefByKey('base')?.getFromValue();
  const baseData = opertaor.getDataAll()['base']['needCalc'];
  const payinfoRef = opertaor.getTableRefByKey("payinfo").getFromValue();
  const tInsrncBgnTmA = insrnc["Base.tInsrncBgnTm"];  // 起期
  const tInsrncEndTmA = insrnc["Base.tInsrncEndTm"];  // 止期
  const isShortTerm = lessThan6Months(tInsrncBgnTmA, tInsrncEndTmA);
  const cNeedfeeFlag = plyBase['Base.cNeedfeeFlag'];

  if (!baseData && payinfoRef.length < 1) {
    ElMessage.error("请先进行保费计算!");
    return true;
  }
  const cInstMrk = base['Base.cInstMrk'] || '0';
  const totalPrm = Number(base['Base.nPrm'] || 0);

  // 个人
  if ((applicant['Applicant.cClntMrk']) == '1' && ( cInstMrk == '5' || cNeedfeeFlag == '0')){
    ElMessageBox.alert(
    "根据山东省非车险业务“见费出单”实施方案，投保人是个人, 系统将更新为[见费出单][一次性缴费]！",
    "提示", 
    {
      confirmButtonText: "确定",
      type: "warning",
    })
    .then(() => {
      opertaor.getTableRefByKey("plyBase").setValue("Base.cNeedfeeFlag", '1');
      opertaor.getTableRefByKey("base").setValue("Base.cInstMrk", '0');
    })
    return true;
  }
  
  // 法人且小于10万元
  if (applicant['Applicant.cClntMrk'] == "0" && Number(totalPrm) <= 100000 && ( cInstMrk == '5' || cNeedfeeFlag == '0')) {
    ElMessageBox.alert(
    "根据山东省非车险业务“见费出单”实施方案，投保人为非个人且单张保单签单保费小于10万 元（含），系统将更新为[见费出单][一次性缴费]！",
    "提示", 
    {
      confirmButtonText: "确定",
      type: "warning",
    })
    .then(() => {
      opertaor.getTableRefByKey("plyBase").setValue("Base.cNeedfeeFlag", '1');
      opertaor.getTableRefByKey("base").setValue("Base.cInstMrk", '0');
    })
    return true;
  }
  // 短期业务
  if (isShortTerm && ( cInstMrk == '5' || cNeedfeeFlag == '0')) {
     ElMessageBox.alert(
    "根据山东省非车险业务“见费出单”实施方案，保险期限低于6个月的短期业务，系统将更新为[见费出单][一次性缴费]！",
    "提示", 
    {
      confirmButtonText: "确定",
      type: "warning",
    })
    .then(() => {
      opertaor.getTableRefByKey("plyBase").setValue("Base.cNeedfeeFlag", '1');
      opertaor.getTableRefByKey("base").setValue("Base.cInstMrk", '0');
    })
    return true;
  }
  // 小于10万元
  if (totalPrm <= 100_000 && ( cInstMrk == '5' || cNeedfeeFlag == '0')){ 
    ElMessageBox.alert(
    "根据山东省非车险业务“见费出单”实施方案，单张保单签单保费小于10万元（含），系统将更新为[见费出单][一次性缴费]！",
    "提示", 
    {
      confirmButtonText: "确定",
      type: "warning",
    })
    .then(() => {
      opertaor.getTableRefByKey("plyBase").setValue("Base.cNeedfeeFlag", '1');
      opertaor.getTableRefByKey("base").setValue("Base.cInstMrk", '0');
    })
    return true;
  };

  // 拆分期数提示
  const tmStart = dayjs(insrnc['Base.tInsrncBgnTm']);
  const tmEnd   = dayjs(insrnc['Base.tInsrncEndTm']).add(1, 'second');
  const wholeYears = tmEnd.diff(tmStart, 'year'); 
  const maxPhase = 4 + Math.max(0, wholeYears - 1);

  const nPayNum = Number(base['Base.nPayNum'] || 0)  // "1"  缴费期数
  // 只处理分期业务
  if (nPayNum == 1) {
    return true;
  }
  if (nPayNum > maxPhase) {
    const remainDays = tmEnd
        .subtract(wholeYears, 'year')
        .diff(tmStart, 'day')
    const yearTxt = wholeYears === 0 ? '' : `${wholeYears}年`
    const dayTxt  = remainDays === 0 ? '' : `${remainDays}天`
    ElMessage.error(
        `山东见费业务保险期限为${yearTxt}${dayTxt}，最多允许拆分 ${maxPhase} 期`
    )
    // 设置值
    opertaor.getTableRefByKey('base').setValue("Base.nPayNum", maxPhase);
    return true
  }
  return false; // 不阻断
}
const judgeShandongCase = async () => {
  const plyBaseData = opertaor.getTableRefByKey("plyBase").getFromValue();
  const applicantData = opertaor.getTableRefByKey("applicant").getFromValue();
  const insrncData = opertaor.getTableRefByKey("insrnc").getFromValue();
  const baseData = opertaor.getTableRefByKey("base").getFromValue();

  // 解构并统一命名
  const {
    "Base.cDptCde": cDptCdeA,  // cDptCde
    "Base.cCiMrk": cCiMrkA,   //cCiMrk
    "Base.cNeedfeeFlag": cNeedfeeFlagA,  // 是否见费出单  1 是  0否
  } = plyBaseData;

  const cProdNoA = plyBase['Base.cProdNo'] || route.params.param?.cProdNo;
  const AppcClntMrk = applicantData["Applicant.cClntMrk"]; // 0 法人 1个人
  const tInsrncBgnTmA = insrncData["Base.tInsrncBgnTm"];  // 1759420800000  起期
  const tInsrncEndTmA = insrncData["Base.tInsrncEndTm"];  // 1790956799000  止期 
  const cInstMrk = baseData['Base.cInstMrk'] || '0'; // 缴费次数 
  const basePrm = baseData["Base.cPrmCur"]; //承保基本信息 总保费币种   // "CNY"
  const nPayNum = Number(baseData['Base.nPayNum'] || 0)  // "1"  缴费期数

  // 机构是山东分公司
  if (!String(cDptCdeA).startsWith('02370') || String(cDptCdeA).startsWith('023702')) return false;
  // 币种是人民币
  if (!['人民币', 'CNY'].includes(basePrm)) return false;
  // 联共保业务类型
  const skipCiMrk = ['2', '4', '6'];
  if (skipCiMrk.includes(cCiMrkA)) return false;
  // 产品号
  const prodList = ['11', '08', '09', '01', '04', '05', '07', '12'];
  if (!prodList.includes(cProdNoA.slice(0, 2))) return false;
  // 特殊产品剔除
  const skipProducts = ['019904', '089031'];
  if (skipProducts.includes(cProdNoA)) return false;
  // 投保人性质不明确，剔除
  if (!['0', '1'].includes(AppcClntMrk)) {
    return false;
  }

  // 签单保费
  const totalPrm = Number(baseData['Base.nPrm'] || 0);

  // 接口校验
  let backEndParam = {};
  if (props.param?.pageName === 'priceInquiry') {
    backEndParam['cInquiryNo'] = opertaor.getTableRefByKey('plyBase')?.getValue('Base.cInquiryNo');
  } else {
    backEndParam['cAppNo'] = opertaor.getTableRefByKey('plyBase')?.getValue('Base.cAppNo') || props.param?.cAppNo;
  }
  const backendRes: any = await validShanDong(backEndParam);
  if (backendRes.code == 200 && backendRes.data == true) {
    return false; 
  }
  return true;
}

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return baseEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  baseEditRef?.value?.setFormValue(value);
}

function validate() {
  return baseEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  baseEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return baseEditRef?.value?.getValue(key);
}

// //给表单赋值
// function setFormItem(key: any, obj: any) {
//   if (obj && Object.keys(obj).length) {
//     formconfig1.fromSchema?.forEach((item) => {
//       if (item.prop === key) {
//         //控制尾部按钮的
//         if (item.btnItems && obj.btnItems) {
//           for (let key in obj.btnItems) {
//             item.btnItems[key] = obj.btnItems[key];
//           }
//         }else{
//           Object.assign(item, obj);
//         }
//       }
//     });
//   }
// }

function recursiveSetFormItem(items: FormItem[], targetKey: string, obj: Record<string, any>) {
  items.forEach((item) => {
    // 1. 如果当前项是分组（含groupList），先递归处理子项
    if (item.inputtype === 'rtinputgroup' && item.groupList && Array.isArray(item.groupList)) {
      recursiveSetFormItem(item.groupList, targetKey, obj);
    }
    if (item.prop === targetKey) {
      if (item.btnItems && obj.btnItems) {
        Object.entries(obj.btnItems).forEach(([btnKey, value]) => {
          if (item.btnItems!.hasOwnProperty(btnKey)) {
            item.btnItems![btnKey] = value;
          }
        });
      }
      const { btnItems: _, ...otherProps } = obj;
      Object.assign(item, otherProps);
      if (otherProps.rules) {
        item.rules = otherProps.rules;
      }
    }
  });
}


function setFormItem(key: string, obj: Record<string, any>): void {
  if (!key || !obj || typeof obj !== 'object' || Object.keys(obj).length === 0) {
    return;
  }

  if (!formconfig1.fromSchema || !Array.isArray(formconfig1.fromSchema)) {
    return;
  }

  // 调用递归方法处理所有项（包括嵌套的groupList）
  recursiveSetFormItem(formconfig1.fromSchema, key, obj);
}

function getFormconfig() {
  return formconfig1;
}

function numMulti(num1, num2) {
  let baseNum = 0;
  try {
    baseNum += num1.toString().split('.')[1].length;
  } catch (e) {
  }
  try {
    baseNum += num2.toString().split('.')[1].length;
  } catch (e) {
  }
  return Number(num1.toString().replace('.', '')) * Number(num2.toString().replace('.', '')) / Math.pow(10, baseNum);
}
function addProvide<T>(key: InjectionKey<T> | string, value: T) {
  baseEditRef?.value?.addProvide(key, value);
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig,
  nPayNumberFun,
  shanDongFun,
  addProvide,
  setFormItem
});
</script>

<style scoped></style>

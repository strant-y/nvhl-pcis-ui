<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="insrncEditRef" />
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import moment from "moment";
import dayjs from "dayjs";
import { useValidator } from "@/typings/useValidator";
import { formatDate, monthBetween, toDate } from "@/utils/date";
import { transpileModule } from "typescript";
import { policyRatio } from "@/api/query";
import { useRoute } from "vue-router";
import { idxParamKey, IdxParamProps, useIdxParam } from "@/views/pcis/support/useIdxParam";
import { getDelayCount, getNewSysDays, checkCdeptByCdptCde, checkCancelM1IsOff, qryTerminationDataList } from "@/api/prod/";
const route = useRoute();
const { getRules } = useValidator();
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
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
const edrbase = ref(null);
const insrncEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive(createAppFreeEditConfig({}));
const tInsrncEndTm = ref(null);
onMounted(() => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  // 保证险中保险期限的“签单时间”在页面隐藏。
  // 询价页面签单日期隐藏
  if((route.params.param?.cProdNo?.startsWith('05') || route.params.param?.pageName === "priceInquiry") && formconfig11.fromSchema?.length > 0) {
    formconfig11.fromSchema?.forEach((item:any) => {
      if(item.prop === 'Base.tIssueTm') {
        item.hidden = true
      }
    })
  }
	Object.assign(formconfig1, formconfig11);
	nextTick(() => {
		// 047002 索赔基础名称、有无报告/追溯没值的时候回填固定值
		if (route.params.param.cProdNo === '047002' && (route.params.param.pageType == "app" || route.params.param.pageType == "copy" && route.params.param.pageType == "template")) {
			if(!getValue('Base.cClaimName'))  setValue('Base.cClaimName', '1')
			if(!getValue('Base.cIsRetroSpect'))  setValue('Base.cIsRetroSpect', '0')
		}
  })
});

// 根据时间更改 短期费率系数 接口
const nRatioCoefFunc = () => {
  const tabref = opertaor.getTableRefs();
  if(tabref["tgt"]){
    // 当投保方式为按工程造价投保、按建筑面积投保、按劳务合同价投保 短期费率系数固定为1
    const tgtObj = tabref["tgt"]?.getFromValue();
    const InsureMethod = tgtObj["Tgt.cInsuranceMethod"];
    const specialMethod = ['613002', '613003', '613004']; 

    if(specialMethod.includes(InsureMethod)){
        opertaor.getTableRefByKey('base').setValue('Base.nRatioCoef', Number(1).toFixed(6));
        return;
    }
  }
  // 090001、090002、090003短期费率系数默认1
  if(['090001','090002','090003'].includes(route.params.param?.cProdNo)) {
    opertaor.getTableRefByKey('base').setValue('Base.nRatioCoef', Number(1).toFixed(6));
    return;
  }

  const baseBefore = tabref["insrnc"]?.getFromValue();
  const baseBefore2 = tabref["base"]?.getFromValue();
  let prodNo = route.params.param?.cProdNo;

  let param = {
    bgnTm: baseBefore["Base.tInsrncBgnTm"],
    endTm: baseBefore["Base.tInsrncEndTm"],
    prodNo,
    ratioType: baseBefore2 ? baseBefore2['Base.cRatioTyp'] : null
  }
  policyRatio(param).then((res: any) => {
    const { code, data, msg } = res;
    if (code === 200) {
      opertaor.getTableRefByKey('base').setValue('Base.nRatioCoef', Number(data).toFixed(6))
    }
  });
};

//免费延期 方法
const freeDelay = async (obj: any): Promise<boolean> => {
  const edrbase = opertaor.getFatherPage().getEdrbaseValue();
  const cRsnCde = edrbase['EdrBase.cEdrRsnBundleCde'];

  // 非免费延期场景（M1/M8） 
  if (cRsnCde !== 'M1' && cRsnCde !== 'M8') {
    return true;
  }

  try {
    // 基础参数准备
    const plyNo = edrbase['EdrBase.cPlyNo'];
    const cProdNo = edrbase['EdrBase.cProdNo'];
      const baseRef = opertaor.getTableRefByKey("plyBase");
    // const cust_data = plyNo = ${ plyNo }###CancelM1 = CancelM1;
    let newSysTmDay = 365, oldSysTmDay = 365;
    let newInsEndTm = '', oldInsEndTm = '';
    let newDelayDay = 0;

    //  获取保单时间数据
    const resDays = await getNewSysDays({ cPlyNo: plyNo });
    if (!resDays || resDays.code !== 200 || !resDays.res) {
      ElMessage.error("获取保单数据失败，无法进行免费延期");
      return false; // 拦截后续流程
    }
    const [name0, name1, name2, name3, name4] = resDays?.res.split('###');
    newSysTmDay = name0;
    newInsEndTm = name1;
    oldSysTmDay = name2;
    newDelayDay = name3;//延长天数
    oldInsEndTm = name4;//原始保单的保险止期

    // 获取表单基础数据
    const tabref = opertaor.getTableRefs();
    const baseBefore = tabref?.["insrnc"].getFromValue();
    console.log('base---', baseBefore)
    // 时间有效性校验
    const objDate = toDate(obj);
    const newInsEndTmDate = toDate(newInsEndTm);
    if (isNaN(objDate.getTime()) || isNaN(newInsEndTmDate.getTime())) {
      ElMessage.error("时间格式错误");
      return false; // 拦截
    }

    //止期只能延长
    if (objDate.getTime() < newInsEndTmDate.getTime()) {
      resetFreeDelayState(newInsEndTm, newSysTmDay);
      ElMessage.warning("免费延期只能延长保险止期，不能缩短");
      return false; // 拦截
    }

    //  分公司编码获取
    const cDptCde = edrbase['EdrBase.cDptCde'];
    const resCheck = await checkCdeptByCdptCde({ dptCde: cDptCde });
    const subSidiary = resCheck?.code === 200 ? resCheck.data : '';

    //  接口  开关校验
    const resOff = await qryTerminationDataList({ cPlyNo: plyNo, cOperType: 'CancelM1' })

    // 开关关闭：按产品规则拦截
    if (resOff?.data?.[0]?.cAppTyp === 'on') {

    } else {
      const nowTmSysCde = Number(baseBefore["Base.cTmSysCde"]) || 0;
      const nowDelayDay = parseInt(nowTmSysCde) - parseInt(newSysTmDay);
      const sumDelayDay = parseInt(nowTmSysCde) - parseInt(oldSysTmDay);
      const sxMonths = monthBetween(new Date(toDate(oldInsEndTm).getTime() + 86400000), objDate);
      const tMonths = monthBetween(new Date(newInsEndTmDate.getTime() + 86400000), objDate);

      // 产品 043009 规则
      if (cProdNo === '043009') {
        if (subSidiary === "0261010000000" && sxMonths > 24) {
          resetFreeDelayState(newInsEndTm, newSysTmDay);
          ElMessage.warning("陕西分公司免费延期最长不超过 2 年");
          return false; // 拦截
        } else if (subSidiary !== "0261010000000" && tMonths > 6) {
          resetFreeDelayState(newInsEndTm, newSysTmDay);
          ElMessage.warning("免费延期最长不超过 6 个月");
          return false; // 拦截
        }
      }
      // 其他产品规则
      else if (cProdNo !== '110002') {
        if (nowDelayDay > 180 || sumDelayDay > 180) {
          ElMessage.warning("延期天数超 180 天限制");
          return false; // 拦截
        } else if (nowDelayDay > 90) {
          ElMessage.warning("单次延期不超过 90 天");
          return false; // 拦截
        }
      }
    }
    // 所有规则通过：更新状态并放行
    const nowTmSysCde = Number(baseBefore["Base.cTmSysCde"]) || 0;
    const sumDelayDay = parseInt(nowTmSysCde) - parseInt(oldSysTmDay);
    opertaor.getFatherPage().setEdrValue('EdrBase.nDelayNum', sumDelayDay);
    // baseRef.setValue('Base.nRatioCoef',6666)
    return true;

  } catch (error) {
    console.error("免费延期校验异常", error);
    ElMessage.error("免费延期处理失败，请重试");
    return false; // 异常时拦截
  }
};

// 重置免费延期状态
const resetFreeDelayState = (newInsEndTm: string, newSysTmDay: string) => {
  setValue('Base.tInsrncEndTm', newInsEndTm);
  setValue('Base.cTmSysCde', newSysTmDay);
  opertaor.getFatherPage().setEdrValue('EdrBase.nDelayNum', 0);
};
// 绑定方法
const method = {
  func1: () => {

  },
  // 开始时间处理  不能小于结束时间
  tInsrncBgnTmDisabled: (date: any) => {

    const fs = insrncEditRef?.value?.getFromValue();
    if (fs) {
      const endDate = new Date(fs["Base.tInsrncEndTm"])   // 开始时间
      let minDate = dayjs(endDate).valueOf();
      if (route.params.param && route.params.param.cRsnCde && route.params.param.cRsnCde == "FZ") {
        // 如果批改原因是免费延期，当前保险止期日期之后的日期都可以选择
        return date.getTime() > minDate
      } else {
        return date.getTime() > minDate
      }
    } else {
      return true;
    }
  },
  // 结束时间禁止
  tInsrncEndTmDisabled: (date: any) => {
    const fs = insrncEditRef?.value?.getFromValue();
    if (fs) {
      const startDate = new Date(fs["Base.tInsrncBgnTm"])   // 开始时间   1
      let maxDate = dayjs(startDate).add(1, 'year').valueOf();
      if (route.params.param && route.params.param.cRsnCde && route.params.param.cRsnCde == "FZ") {
        // 如果批改原因是免费延期，当前保险止期日期之后的日期都可以选择
        return date.getTime() < maxDate
      } else {
        return date.getTime() < startDate.getTime()
        // || date.getTime() > maxDate
      }
    } else {
      return true;
    }
  },
  /* 关于保险期限的问题：
    1、录入起期，自动带出止期，期限按照365；
    2、如先录入非1年期，再修改起期，则按照既有的期限填入保险止期；
    3、如修改止期，则不直接带出起期，起期需要手动修改。天数还是自动填充。
  */
  bgnTmFn: (v: any) => {
    const param = opertaor.getParam();
    const isInit = param.initFlag; // 是否是初始化状态
    if (isInit) return;
    const tabref = opertaor.getTableRefs();
    const baseBefore = tabref?.["insrnc"].getFromValue();
    const startDate = dayjs(v); // 新的开始时间（v是用户选择的开始时间）
    let endDate = baseBefore["Base.tInsrncEndTm"]  // 结束时间
    let days = Number(baseBefore["Base.cTmSysCde"]); // 天数
    const isDaysEmpty = isNaN(days) || days <= 0;
    // 计算新的结束时间
    let newEndDate;
    if (!isDaysEmpty) {
      newEndDate = startDate.add(days, 'day').subtract(1, 'second').format("YYYY-MM-DD HH:mm:ss");
      days = dayjs(newEndDate).add(1, 'second').diff(startDate, 'day');
    } else if (!endDate) {
      newEndDate = startDate.add(1, 'year').subtract(1, 'second').format("YYYY-MM-DD HH:mm:ss");
      days = dayjs(newEndDate).add(1, 'second').diff(startDate, 'day');
    } else {
      newEndDate = dayjs(endDate).subtract(1, 'second').format("YYYY-MM-DD HH:mm:ss");
      days = dayjs(newEndDate).add(1, 'second').diff(startDate, 'day');
    }

    // 更新结束时间和天数
    baseBefore["Base.tInsrncEndTm"] = newEndDate;
    baseBefore["Base.cTmSysCde"] = days;


    // 起运日期不能大于 保险起期   020014 020018 不参与
    let tDepartureDate = baseBefore['Base.tDepartureDate']  //起运日期
    if (tDepartureDate) {
      const timestamp1 = new Date(tDepartureDate).getTime();
      const timestamp2 = new Date(v).getTime();
      let cProdNo = route.params.param?.cProdNo;
      if ((timestamp1 < timestamp2) && (cProdNo !== "020014" && cProdNo !== "020018" && cProdNo.startsWith('02'))) {
         ElMessage.warning("“起运日期”不能大于保险起期！");
        baseBefore["Base.tDepartureDate"] = ''
      }
    }

    setFormValue(baseBefore);
    nRatioCoefFunc()
  },
  endTmFn: async (v: any) => {
    const tabref = opertaor.getTableRefs();
    const baseBefore = tabref["insrnc"].getFromValue();
    const param = opertaor.getParam();
    const isInit = param.initFlag; // 是否是初始化状态
    // 059010 借款止期的值和保险止期一致
    if(route.params.param?.cProdNo === '059010') {
      setValue('Base.tRunEndTm', v)
    }
    // 如果批改原因是免费延期，根据保险止期的变化计算出延长天数
    if (route.params.param?.cRsnCde == "FZ" && tInsrncEndTm.value) {
      const days = moment(v).add(1, 'second').diff(moment(tInsrncEndTm.value), "days");
      opertaor.getFatherPage().setnDelayNum(days)
    }
    if (route.params.param?.cRsnCde == "FZ" && !tInsrncEndTm.value) {
      tInsrncEndTm.value = baseBefore["Base.tInsrncEndTm"]
    }
    if (isInit) return;
    // 根据保险起止期计算出保险期限共多少天
    const tm = moment(v).add(1, 'second').diff(moment(baseBefore["Base.tInsrncBgnTm"]), "days");
    baseBefore["Base.cTmSysCde"] = tm;   // 列表里面的 保险
    opertaor.getFatherPage().setTmDay(tm)
    setFormValue(baseBefore);
    nRatioCoefFunc()
    const isFreeDelayPass = await freeDelay(v);
    // 核心拦截逻辑：不满足免费延期条件，直接终止后续流程
    console.log('保险止期', getValue('Base.tInsrncEndTm'))
    if (!isFreeDelayPass) return;
  },
  // 索赔基础名称change事件
  suopeiFunc: (val: any) => {
    console.log('索赔基础名称', val)
    let cIsRetroSpect = getFromValue()['Base.cIsRetroSpect']      // 获取是否有追溯期/日期
    const p = opertaor.getParam();
    if (!p.initFlag) {
      // setFormItem("Base.tRunBgnTm", { disabled: false }); //追溯/日落起期
      // setFormItem("Base.tRunEndTm", { disabled: false }); //追溯/日落止期
    }
    setFormItem("Base.tReportBgnTm", { rules: null }); //延长报告期起始日期
    setFormItem("Base.tReportEndTm", { rules: null }); //延长报告期终止日期
    clearValidate("Base.tReportEndTm");
    clearValidate("Base.tReportBgnTm");

    //内索赔制 时，追溯/日落起止期必填
    if (val == "2") {
      if (cIsRetroSpect !== '0') {
        setFormItem("Base.tRunBgnTm", { rules: [getRules("required", {})] }); //追溯/日落起期
        setFormItem("Base.tRunEndTm", { rules: [getRules("required", {})] }); //追溯/日落止期
      } else {
        setFormItem("Base.tRunBgnTm", { rules: [] }); //追溯/日落起期
        setFormItem("Base.tRunEndTm", { rules: [] }); //追溯/日落止期
      }
      setFormItem("Base.tRunBgnTm", { hidden: false }); //追溯/日落起期
      setFormItem("Base.tRunEndTm", { hidden: false }); //追溯/日落止期
      setFormItem("Base.nTracingDays", { hidden: false }); //追溯/日落天数
      setFormItem("Base.tReportBgnTm", { hidden: true }); //延长报告期起始日期
      setFormItem("Base.tReportEndTm", { hidden: true }); //延长报告期终止日期
      setFormItem("Base.nReportDays", { hidden: true }); //延长报告期天数
    } else if (val == "1") {
      if (cIsRetroSpect !== '0') {
        setFormItem("Base.tReportEndTm", { rules: [getRules("required", {})], disabled: false, }); //延长报告期终止日期
        setFormItem("Base.tReportBgnTm", { rules: [getRules("required", {})], disabled: false, }); //延长报告期起始日期
      } else {
        setFormItem("Base.tRunBgnTm", { rules: [] }); //追溯/日落起期
        setFormItem("Base.tRunEndTm", { rules: [] }); //追溯/日落止期
        setFormItem("Base.tReportEndTm", { rules: [] }); //延长报告期终止日期
        setFormItem("Base.tReportBgnTm", { rules: [] }); //延长报告期起始日期
        clearValidate("Base.tReportEndTm");
        clearValidate("Base.tReportBgnTm");
      }


      //期内发生制时，报告起始、终止日期必填
      setFormItem("Base.tRunBgnTm", { hidden: true }); //追溯/日落起期
      setFormItem("Base.tRunEndTm", { hidden: true }); //追溯/日落止期
      setFormItem("Base.nTracingDays", { hidden: true }); //追溯/日落天数
      setFormItem("Base.tReportBgnTm", { hidden: false }); //延长报告期起始日期
      setFormItem("Base.tReportEndTm", { hidden: false }); //延长报告期终止日期Base.tReportEndTm
      setFormItem("Base.nReportDays", { hidden: false }); //延长报告期天数
    }
    // setValue("Base.cIsRetroSpect", "");
  },
  // 是否有追溯期/日落期 change事件
  isTermFunc: (val: any) => {
    console.log('期内', val)
    let cIsRetroSpect = getFromValue()['Base.cClaimName']      // 索赔基础名称  2 期内索赔制
    if (val == "1") {
      //选择 是 且索赔基础名称为内索赔制 时，追溯/日落起止期必填  期内索赔制  放开并且必填
      if (cIsRetroSpect == '2') {
        setFormItem("Base.tRunBgnTm", { rules: [getRules("required", {})], disabled: false, }); //追溯/日落起期
        setFormItem("Base.tRunEndTm", { rules: [getRules("required", {})], disabled: false, }); //追溯/日落止期
      } else {
        setFormItem("Base.tRunBgnTm", { rules: [], disabled: false, }); //追溯/日落起期
        setFormItem("Base.tRunEndTm", { rules: [], disabled: false, }); //追溯/日落止期

        setFormItem("Base.tReportBgnTm", { rules: [getRules("required", {})], disabled: false, }); //延长报告期起始日期
        setFormItem("Base.tReportEndTm", { rules: [getRules("required", {})], disabled: false, }); //延长报告期终止日期

      }
    } else if (val == "0") {
      setFormItem("Base.tRunBgnTm", { rules: [], disabled: true }); //追溯/日落起期
      setFormItem("Base.tRunEndTm", { rules: [], disabled: true }); //追溯/日落止期
      setFormValue({
        "Base.tRunBgnTm": "",
        "Base.tRunEndTm": "",
        "Base.nTracingDays": "",
      });

      setFormItem("Base.tReportBgnTm", { rules: [], disabled: true }); //延长报告期起始日期
      setFormItem("Base.tReportEndTm", { rules: [], disabled: true }); //延长报告期终止日期
      setFormValue({
        "Base.tReportBgnTm": "",
        "Base.tReportEndTm": "",
        "Base.nReportDays": "",
      });
      clearValidate("Base.tReportBgnTm");
      clearValidate("Base.tReportEndTm");
    }
  },
  // 追溯起期
  tRunBgnTmFn: (v) => {
    const start = getValue("Base.tRunBgnTm");
    const end = getValue("Base.tRunEndTm");
    if (!end || !v) {
      return;
    }
    const tmDay = moment(end).diff(moment(start), "days");
    const tm = moment(end).diff(moment(start), "seconds")
    if (tm < 0) {
      ElMessage.warning("追溯/日落止期不能小于追溯起期");
      setFormValue({
        "Base.tRunBgnTm": null,
      });
      return;
    }
    setFormValue({

      "Base.nTracingDays": moment(end).add(1, 'second').diff(moment(start), "days"),
      // "Base.nTracingDays":  moment(end).add(1,'second').diff(moment(start), "days")
    });
  },
  // 追溯止期
  tRunEndTmFn: (v) => {
    const start = getValue("Base.tRunBgnTm");
    const end = getValue("Base.tRunEndTm");
    const tInsrncBgnTm = getValue('Base.tInsrncBgnTm');  // 保险起期
    if (!v) {
      return;
    }
    const traceTime = moment(tInsrncBgnTm).diff(moment(v), "seconds")
    //校验追溯时间
    if (traceTime < 0) {
      ElMessage.warning("追溯期的止期|须早于保险起期！");
      setFormValue({
        "Base.tRunEndTm": null,
        "Base.nTracingDays": null
      });
      return;
    }
    if(start) {
      const tm = moment(v).diff(moment(start), "days");
      const startTime = moment(v).diff(moment(start), "days");
      if (startTime < 0) {
        ElMessage.warning("追溯/日落止期不能小于追溯起期");
        setFormValue({
          "Base.tRunEndTm": null,
        });
        return;
      }
      const formattedDate = moment(v).format('YYYY-MM-DD') + ' 23:59:59';
      setFormValue({
        "Base.nTracingDays": moment(formattedDate).add(1, 'second').diff(moment(start), "days"),
        "Base.tRunEndTm": formattedDate, // 更新日期字段
      });
    }
  },
  // 报告期起始日期处理
  reportBgnTmFn: (v: any) => {
    const start = getValue("Base.tReportBgnTm");
    const end = getValue("Base.tReportEndTm");
    const insEnd = getValue("Base.tInsrncEndTm"); // 保险止期

    const param = opertaor.getParam();
    const isInit = param.initFlag; // 是否是初始化状态
    if (!v || isInit) return;
    // 报告期起始日期必须大于保险止期
    if (insEnd && moment(v).isSameOrBefore(moment(insEnd))) {
      ElMessage.warning("报告期起始日期必须大于保险止期");
      setFormValue({
        "Base.tReportBgnTm": null,
        "Base.nReportDays": null
      });
      return;
    }

    // 终止日期不能小于起始日期（保留原有逻辑）
    if (end && moment(end).isBefore(moment(v))) {
      ElMessage.warning("报告终止日期不能小于起始日期");
      setFormValue({
        "Base.tReportEndTm": null,
        "Base.nReportDays": null
      });
      return;
    }

    //计算报告天数（若终止日期已存在）
    if (end) {
      const days = moment(end).add(1, 'second').diff(moment(v), "days");
      setFormValue({ "Base.nReportDays": days });
    }
  },

  // 报告期终止日期处理
  reportEndTmFn: (v: any) => {
    const start = getValue("Base.tReportBgnTm");
    const insEnd = getValue("Base.tInsrncEndTm"); // 保险止期
    const param = opertaor.getParam();
    const isInit = param.initFlag; // 是否是初始化状态

    if (!v || !start || isInit) return;

    // 先校验起始日期是否合规（必须大于保险止期）
    if (insEnd && moment(start).isSameOrBefore(moment(insEnd))) {
      ElMessage.warning("报告期起始日期必须大于保险止期，请先修正起始日期");
      setFormValue({
        "Base.tReportEndTm": null,
        "Base.nReportDays": null
      });
      return;
    }

    //校验：终止日期不能小于起始日期（保留原有逻辑）
    if (moment(v).isBefore(moment(start))) {
      ElMessage.warning("报告终止日期不能小于起始日期");
      setFormValue({
        "Base.tReportEndTm": null,
        "Base.nReportDays": null
      });
      return;
    }

    // 格式化终止日期并计算天数
    const formatEnd = moment(v).format("YYYY-MM-DD 23:59:59");
    const days = moment(formatEnd).add(1, 'second').diff(moment(start), "days");
    setFormValue({
      "Base.tReportEndTm": formatEnd,
      "Base.nReportDays": days
    });
  },

  // 起运日期控制
  tDepartureDateDis: (date: any) => {
    const cProdMap = ['020001', '020002', '020003', '020009', '020013'];
    const fs = insrncEditRef?.value?.getFromValue();
    if (fs) {
      const startDate = new Date(fs["Base.tInsrncBgnTm"])   // 开始时间   
      const before30Tm = dayjs(startDate).subtract(30, 'day').toDate().getTime();
      let cProdNo = route.params.param?.cProdNo
      if (cProdNo === "020014" || cProdNo === "020018") {
        return false;
      } else if(cProdMap.includes(cProdNo)) {// 这5个产品起运日期不能早于保险起期前30天(暂定)
        return date.getTime() < before30Tm
      } else {
        return date.getTime() < startDate.getTime()
      }
    } else {
      return false;
    }
  },

  // 借款起期
  tRunBgnTmChange: (v:any) => {
    const param = opertaor.getParam();
    const isInit = param.initFlag; // 是否是初始化状态
    if (isInit) return;
    const endTm = getValue('Base.tRunEndTm')
    if(v && endTm && dayjs(endTm).isBefore(dayjs(v))) {
      setValue('Base.tRunBgnTm', '')
      ElMessage.warning("借款起期不能大于借款止期")
    } else if (v && endTm) {
      const days = dayjs(endTm).add(1, 'second').diff(v, 'day')
      setValue('Base.cTmLoanTrm', days)
    } else if (!v || !endTm) {
      setValue('Base.cTmLoanTrm', '')
    }
  },
  // 保证期起期
  tGuaranteeBgnTmChange: (val:any) => {
    if (opertaor.getParam()?.initFlag) return;
    const bgnTm = val
    const endTm = getValue('Base.tGuaranteeEndTm')
    if(bgnTm && endTm && dayjs(bgnTm).isAfter(dayjs(endTm))) {
      ElMessage.warning('保证期起期不能大于保证期止期')
      setValue('Base.tGuaranteeBgnTm', "")
    }
  },
  // 保证期止期
  tGuaranteeEndTmChange: (val:any) => {
    if (opertaor.getParam()?.initFlag) return;
    const bgnTm = getValue('Base.tGuaranteeBgnTm')
    const endTm = val
    if(bgnTm && endTm && dayjs(bgnTm).isAfter(dayjs(endTm))) {
      ElMessage.warning('保证期止期不能小于保证期起期')
      setValue('Base.tGuaranteeEndTm', "")
    }
  },
  // 试车期起期
  tTrialBgnTmChange: (val:any) => {
    if (opertaor.getParam()?.initFlag) return;
    const bgnTm = val
    const endTm = getValue('Base.tTrialEndTm')
    if(bgnTm && endTm && dayjs(bgnTm).isAfter(dayjs(endTm))) {
      ElMessage.warning('试车期起期不能大于试车期止期')
      setValue('Base.tTrialBgnTm', "")
    }
  },
  // 试车期止期
  tTrialEndTmChange: (val:any) => {
    if (opertaor.getParam()?.initFlag) return;
    const bgnTm = getValue('Base.tTrialBgnTm')
    const endTm = val
    if(bgnTm && endTm && dayjs(bgnTm).isAfter(dayjs(endTm))) {
      ElMessage.warning('试车期止期不能小于试车期起期')
      setValue('Base.tTrialEndTm', "")
    }
  },
  // 工程起期
  tProjectBgnTmChange: (val:any) => {
    if (opertaor.getParam()?.initFlag) return;
    const bgnTm = val
    const endTm = getValue('Base.tProjectEndTm')
    if(bgnTm && endTm && dayjs(bgnTm).isAfter(dayjs(endTm))) {
      ElMessage.warning('工程起期不能大于工程止期')
      setValue('Base.tProjectBgnTm', "")
    }
  },
  // 工程止期
  tProjectEndTmChange: (val:any) => {
    if (opertaor.getParam()?.initFlag) return;
    const bgnTm = getValue('Base.tProjectBgnTm')
    const endTm = val
    if(bgnTm && endTm && dayjs(bgnTm).isAfter(dayjs(endTm))) {
      ElMessage.warning('工程止期不能小于工程起期')
      setValue('Base.tProjectEndTm', "")
    }
  },
  // 保险期限
  cTmSysCdeChange: (val:any) => {
    opertaor.getFatherPage().setTmDay(val || 0)
  },
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return insrncEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  insrncEditRef?.value?.setFormValue(value);
}

function validate() {
  return insrncEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  insrncEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return insrncEditRef?.value?.getValue(key);
}

//给表单赋值
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

function getFormconfig() {
  return formconfig1;
}
function addProvide<T>(key: InjectionKey<T> | string, value: T) {
  insrncEditRef?.value?.addProvide(key, value);
}

function clearValidate(key:any = null) {
  insrncEditRef?.value?.clearValidate(key);
}
defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig,
  addProvide,
  clearValidate,
  setFormItem,
});
</script>

<style scoped></style>

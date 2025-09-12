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
import { getDelayCount, getNewSysDays, checkCdeptByCdptCde, checkCancelM1IsOff } from "@/api/prod/";
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
  Object.assign(formconfig1, formconfig11);
});

// 根据时间更改 短期费率系数 接口
const nRatioCoefFunc = () => {
  const tabref = opertaor.getTableRefs();
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


//免费延期
const freeDelay = async (obj: any) => {
  return false;
  // //	tool.alert('延长的保期方法');	
  // 	if(isPlyEdrEditScene(scene)){

  const edrbase = opertaor.getFatherPage().getEdrbaseValue();
  const ss = opertaor.getFatherPage()
  let cRsnCde = edrbase['EdrBase.cEdrRsnBundleCde'];


  // edrbase['edrBase.NResvNum3'] = 112;
  // opertaor.getFormDataById('')

  console.log(edrbase)
  console.log('ssss', ss)
  console.log(opertaor.getTableRefByKey('edrBase'))
  // var cRsnCde = tool.getAttrValue(dw['edrBase'],'CEdrRsnBundleCde');
  if (cRsnCde == 'M1' || cRsnCde == 'M8') {
    var plyNo = edrbase['EdrBase.cPlyNo'];
    var newSysTmDay = 365;
    var oldSysTmDay = 365;
    var newDelayDay = 0;
    var newInsEndTm;
    var oldInsEndTm;
    // var cProdNo = tool.getAttrValue([dw["edrBase"]], "CProdNo");//产品	
    var cProdNo = edrbase['EdrBase.cProdNo'] //产品	
    var cust_data = "plyNo=" + plyNo + "###CancelM1=" + 'CancelM1';

    // if(tool.sendXmlByServiceNoCheck([], 'endorseAppBizAction', 'getNewSysDays', plyNo )){
    // 	var listDays = tool.getResultMsg();
    // 	var name = listDays.split('###');
    // 	newSysTmDay = name[0];//最新保单保险天数
    // 	newInsEndTm = name[1];//最新保单止期
    // 	oldSysTmDay = name[2];//原保单保险天数
    // 	newDelayDay = name[3];//延长天数
    // 	oldInsEndTm = name[4];//原始保单的保险止期
    // }
    const resDays = await getNewSysDays({ cPlyNo: plyNo });
        console.log('接口1',resDays,'参数---',plyNo)
    if (resDays?.code === 200) {
      var listDays = resDays
      var name = listDays.split('###');
      newSysTmDay = name[0];//最新保单保险天数
      newInsEndTm = name[1];//最新保单止期
      oldSysTmDay = name[2];//原保单保险天数
      newDelayDay = name[3];//延长天数
      oldInsEndTm = name[4];//原始保单的保险止期
    }

    const tabref = opertaor.getTableRefs();
    const baseBefore = tabref?.["insrnc"].getFromValue();


    // var nowTmSysCde =  tool.getAttrValue(dw['BaseBefore'],'Base.CTmSysCde');//当前批改最新保险天数
    // var nowDelayDay =  parseInt(nowTmSysCde) - parseInt(newSysTmDay);//当前批改延期天数
    // var sumDelayDay =  parseInt(nowTmSysCde) - parseInt(oldSysTmDay);//累计延期天数
    var nowTmSysCde = Number(baseBefore["Base.cTmSysCde"]); //当前批改最新保险天数
    var nowDelayDay = parseInt(nowTmSysCde) - parseInt(newSysTmDay);//当前批改延期天数
    var sumDelayDay = parseInt(nowTmSysCde) - parseInt(oldSysTmDay);//累计延期天数

    // if(!isLoadDwModel('theTabPage', dw['BaseAfter'])){
    // 	loadAllDwModel([dw["BaseAfter"]]);
    // 	loadAllDwData([dw["BaseAfter"]]);
    // }
    console.log('baseBefore', baseBefore)
    var newInsBgnTm = baseBefore['Base.tInsrncBgnTm']//原保单起期 	
    //  	var OldNRatioCoef = tool.getAttrValue(dw['edrBase'],"NRatioCoef");		    ? 	 
    var nMonths = monthBetween(toDate(newInsBgnTm), toDate(newInsEndTm));//保险月数
    var tMonths = monthBetween(toDate(newInsEndTm + 1), toDate(obj));//页面修改的延迟月数
    var sxMonths = monthBetween(toDate(oldInsEndTm + 1), toDate(obj));//原保单的止期到本次批改的止期的月数

    //获得当前承保机构的分公司编码。如：北京02、天津27、重庆15.
    var cDptCde = edrbase['EdrBase.cDptCde'] //机构部门

    const resCheck = await checkCdeptByCdptCde({ dptCde: cDptCde });
    const subSidiary = resCheck?.code === 200 ? resCheck.data : '';
    if (toDate(obj).getTime() - toDate(newInsEndTm).getTime() < 0) {
      setFormItem('Base.tInsrncEndTm', newInsEndTm)   // 
      setFormItem('Base.cTmSysCde', newSysTmDay)
      opertaor.getFatherPage().setEdrValue('EdrBase.NResvNum3', 0)

      // setFormItem('edrBase.NResvNum3',0)  
      // setFormItem('Base.NRatioCoef',newInsEndTm) ?

      //  tool.setAttrValue(dw['edrBase'],'NResvNum3',0);
      //  tool.setAttrValue(dw["BaseAfter"], "Base.NRatioCoef", OldNRatioCoef);	    

      ElMessage.warning("免费延期只能对保险止期进行延长操作!");
      return;
    }

    // var newInsBgnTm = tool.getAttrValue(dw['BaseBefore'],"Base.TInsrncBgnTm");//原保单起期 	
    //  	var OldNRatioCoef = tool.getAttrValue(dw['edrBase'],"NRatioCoef");		    ? 	      		       		  
    //     var nMonths = monthBetween(toDate(newInsBgnTm),toDate(newInsEndTm));//保险月数
    //     var tMonths = monthBetween(toDate(newInsEndTm+1),toDate(obj.value));//页面修改的延迟月数
    //     var sxMonths = monthBetween(toDate(oldInsEndTm+1),toDate(obj.value));//原保单的止期到本次批改的止期的月数
    //       //获得当前承保机构的分公司编码。如：北京02、天津27、重庆15.
    //       var cDptCde = tool.getAttrValue([dw["edrBase"]], "CDptCde");//机构部门
    //  var subSidiary ='';  //获取分公司机构代码
    // if(tool.sendXmlByServiceNoCheck([], 'policyAppBizAction','checkCdeptByCdptCde',cDptCde)){
    //     subSidiary = tool.getResultMsg();
    // }
    // if(toDate(obj.value).getTime()-toDate(newInsEndTm).getTime()<0 ){
    //    tool.setAttrValue(dw['BaseBefore'],'Base.TInsrncEndTm',newInsEndTm);
    //    tool.setAttrValue(dw['BaseBefore'],'Base.CTmSysCde',newSysTmDay);
    //    tool.setAttrValue(dw['edrBase'],'NResvNum3',0);
    //    tool.setAttrValue(dw["BaseAfter"], "Base.NRatioCoef", OldNRatioCoef);	    
    //    tool.alert('免费延期只能对保险止期进行延长操作!');
    //    return ;
    // }
    const resOff = await checkCancelM1IsOff({ cPlyNo: plyNo, CancelM1: cust_data });
    if (resOff.code == 200) {
      // tool.setAttrValue(dw['edrBase'],'NResvNum3',parseInt(sumDelayDay));  ？
      //  setFormItem('Base.NResvNum3',sumDelayDay)  
      opertaor.getFatherPage().setEdrValue('EdrBase.NResvNum3', sumDelayDay)

    } else {
      if (cProdNo == '043009') {
        if (subSidiary === "0261010000000") {//陕西分公司免费延期批改最长期限为1年，取消次数限制
          if (sxMonths > 24) {
            // tool.setAttrValue(dw['BaseBefore'],'Base.TInsrncEndTm',newInsEndTm);
            // tool.setAttrValue(dw['BaseBefore'],'Base.CTmSysCde',newSysTmDay);
            // tool.setAttrValue(dw['edrBase'],'NResvNum3',0);
            // tool.setAttrValue(dw["BaseAfter"], "Base.NRatioCoef", OldNRatioCoef);
            // tool.alert('延长的保期不允许超过2年！');
            setFormItem('Base.tInsrncEndTm', newInsEndTm)
            setFormItem('Base.cTmSysCde', newSysTmDay)
            opertaor.getFatherPage().setEdrValue('EdrBase.NResvNum3', 0)
            ElMessage.warning("延长的保期不允许超过2年！");
            return;
          }
        } else if (tMonths > 6) {
          // tool.setAttrValue(dw["BaseAfter"], "Base.NRatioCoef", OldNRatioCoef);
          // tool.alert('延长的保期不允许超过6个月');		 
          setFormItem('Base.tInsrncEndTm', newInsEndTm)
          setFormItem('Base.cTmSysCde', newSysTmDay)
          opertaor.getFatherPage().setEdrValue('EdrBase.NResvNum3', 0)
          ElMessage.warning("延长的保期不允许超过6个月");
          return;
        }
        opertaor.getFatherPage().setEdrValue('EdrBase.NResvNum3', nowDelayDay)
      } else if (cProdNo != '110002') {
        if (nowDelayDay > 180 || sumDelayDay > 180) {
          ElMessage.warning("延期天数已超过默认值！");
        } else if (nowDelayDay > 90) {
          ElMessage.warning("每次免费延期不能超过90天");
        }
        // tool.setAttrValue(dw['edrBase'],'NResvNum3',parseInt(sumDelayDay));
        setFormItem('edrBase.NResvNum3', sumDelayDay)
      }

    }



    // 			if(tool.sendXmlByService([],"endorseAppBizAction","checkCancelM1IsOff",cust_data)){
    // 				//任务表存在数据，则不校验倒签天数。
    // //				tool.alert('绕过延长的保期方法');	
    // 			    tool.setAttrValue(dw['edrBase'],'NResvNum3',parseInt(sumDelayDay));
    // 			}else{
    // 				if(prodNo=='043009'){
    // 				    if(subSidiary === "0261010000000"){//陕西分公司免费延期批改最长期限为1年，取消次数限制
    // 				        if(sxMonths > 24){
    //                             tool.setAttrValue(dw['BaseBefore'],'Base.TInsrncEndTm',newInsEndTm);
    //                             tool.setAttrValue(dw['BaseBefore'],'Base.CTmSysCde',newSysTmDay);
    //                             tool.setAttrValue(dw['edrBase'],'NResvNum3',0);
    //                             tool.setAttrValue(dw["BaseAfter"], "Base.NRatioCoef", OldNRatioCoef);
    //                             tool.alert('延长的保期不允许超过2年！');
    //                             return ;
    //                         }
    //                     }else if(tMonths > 6 ){
    // 						tool.setAttrValue(dw['BaseBefore'],'Base.TInsrncEndTm',newInsEndTm); 
    // 						tool.setAttrValue(dw['BaseBefore'],'Base.CTmSysCde',newSysTmDay);
    // 						tool.setAttrValue(dw['edrBase'],'NResvNum3',0);	
    // 						tool.setAttrValue(dw["BaseAfter"], "Base.NRatioCoef", OldNRatioCoef);
    // 						tool.alert('延长的保期不允许超过6个月');		          
    // 						return ;
    // 			        }
    // 			        tool.setAttrValue(dw['edrBase'],'NResvNum3',parseInt(nowDelayDay));			     
    // 				}else if(prodNo != '110002'){
    // 				    if(nowDelayDay > 180 || sumDelayDay >180){
    // 				    	tool.alert('延期天数已超过默认值！');
    // 				    }else if(nowDelayDay > 90 ){
    // 				    	tool.alert('每次免费延期不能超过90天!');
    // 				    }
    // 				    tool.setAttrValue(dw['edrBase'],'NResvNum3',parseInt(sumDelayDay));
    // 				}
    // 			}
  }
  // 	} 
}


// 绑定方法
const method = {
  // func demo
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

  bgnTmFn: (v) => {
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

    setFormValue(baseBefore);
    nRatioCoefFunc()
  },
  endTmFn: (v) => {
    // freeDelay(v)
    console.log('保险止期')
    const tabref = opertaor.getTableRefs();
    const baseBefore = tabref["insrnc"].getFromValue();
    if (route.params.param?.cRsnCde != "46") {
      // 如果批改原因是报停展期，保险止期延长报停起止期计算出的差值，保险期限维持不变
      const tm = moment(v).add(1, 'second').diff(moment(baseBefore["Base.tInsrncBgnTm"]), "days");
      baseBefore["Base.cTmSysCde"] = tm;   // 列表里面的 保险
      opertaor.getFatherPage().setTmDay(tm)
      setFormValue(baseBefore);
    }
    nRatioCoefFunc()
    // 如果批改原因是免费延期，根据保险止期的变化计算出延长天数
    if (route.params.param?.cRsnCde == "FZ" && tInsrncEndTm.value) {
      const days = moment(v).add(1, 'second').diff(moment(tInsrncEndTm.value), "days");
      opertaor.getFatherPage().setnDelayNum(days)
    }
    if (route.params.param?.cRsnCde == "FZ" && !tInsrncEndTm.value) {
      tInsrncEndTm.value = baseBefore["Base.tInsrncEndTm"]
    }
  },
  // 索赔基础名称change事件
  suopeiFunc: (val) => {
    let cIsRetroSpect = getFromValue()['Base.cIsRetroSpect']      // 获取是否有追溯期/日期
    const p = opertaor.getParam();
    if (!p.initFlag) {
      // setFormItem("Base.tRunBgnTm", { disabled: false }); //追溯/日落起期
      // setFormItem("Base.tRunEndTm", { disabled: false }); //追溯/日落止期
    }
    setFormItem("Base.tReportBgnTm", { rules: null }); //延长报告期起始日期
    setFormItem("Base.tReportEndTm", { rules: null }); //延长报告期终止日期

    if (val == "0") {
      //内索赔制 时，追溯/日落起止期必填
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
      }


      //期内发生制时，报告起始、终止日期必填

      setFormItem("Base.tRunBgnTm", { hidden: true }); //追溯/日落起期
      setFormItem("Base.tRunEndTm", { hidden: true }); //追溯/日落止期
      setFormItem("Base.nTracingDays", { hidden: true }); //追溯/日落天数

      setFormItem("Base.tReportBgnTm", { hidden: false }); //延长报告期起始日期
      setFormItem("Base.tReportEndTm", { hidden: false }); //延长报告期终止日期
      setFormItem("Base.nReportDays", { hidden: false }); //延长报告期天数
    }
    // setValue("Base.cIsRetroSpect", "");
  },
  // 是否有追溯期/日落期 change事件
  isTermFunc: (val) => {
    let cIsRetroSpect = getFromValue()['Base.cClaimName']      // 索赔基础名称  0 期内索赔制
    if (val == "1") {
      //选择 是 且索赔基础名称为内索赔制 时，追溯/日落起止期必填  期内索赔制  放开并且必填
      if (cIsRetroSpect == '0') {

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
    if (!start || !v) {
      return;
    }
    const tm = moment(v).diff(moment(start), "days");
    const startTime = moment(v).diff(moment(start), "days");
    if (startTime < 0) {
      ElMessage.warning("追溯/日落止期不能小于追溯起期");
      setFormValue({
        "Base.tRunEndTm": null,
      });
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
    const formattedDate = moment(v).format('YYYY-MM-DD') + ' 23:59:59';
    setFormValue({
      "Base.nTracingDays": moment(formattedDate).add(1, 'second').diff(moment(start), "days"),
      "Base.tRunEndTm": formattedDate, // 更新日期字段
    });
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
defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig,
  addProvide
});
</script>

<style scoped></style>

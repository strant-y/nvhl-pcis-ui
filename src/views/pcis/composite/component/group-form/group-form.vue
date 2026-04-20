<template>
  <!--  差异化产品组件 -->
  <div
    class="_group_item"
    v-for="(k, i) in groupConfig?.pageInfo"
    :key="i"
    :id="k.id"
  >
    <component
      v-show="!pageView.hiddenCompKeys.includes(k.pageKey)"
      :ref="(res: any) => {
        const pageK =
          k.pageKey === 'dist' || k.pageKey === 'distSummary'
            ? k.pageCode
            : k.pageKey;
        opertaor.addTableRef(pageK, res);
        if(res && res.addProvide){
          res.addProvide('domId',  k.id);
        }
      }"
      :is="k.pageType === 'custom' ? k.pageCode : k.pageKey + '-ref'"
      :pageSchema="k.pageSchema"
      :compKey="k.pageCode"
    />
  </div>
</template>
<script setup lang="ts">

import {CompositePageView, OpertaorPosit} from "@/views/pcis/support/composite.types";
import {idxParamKey, IdxParamProps} from "@/views/pcis/support/useIdxParam";
import {dataOpertaor} from "@/store";
import {lowercaseKeys, scrollByDomId} from "@/utils/common";
import dayjs from "dayjs";
import {ref} from "vue";

const props:any = defineProps({
  index: {
    type: Number,
  },
  groupId: {
    type: String,
  },
  groupConfig: {
    type: Object
  }
});

// 当前加载的组件索引
const currentIndex = ref(0);
const tmDay = ref(0);
const cacheKey = ref();
const edrbase = ref();
// 储存原始组件配置信息
const oldProductResData = ref<any[]>([]);

const userString = sessionStorage.getItem("user");
const user = userString ? JSON.parse(userString) : {};
const pageView = inject("pageView", ref(new CompositePageView()));
const idxParam: IdxParamProps = {
  opertaorProps: {
    id: props.groupId,
    type: OpertaorPosit,
    allDataFormat: pageView.value.allDataFormat,
    convertGetCommonConfig: pageView.value.convertGetCommonConfig,
  },
  cdeListViewProps: {
    id: props.groupId
  },
  handleAnchorClick: handleAnchorClick,
};
provide(idxParamKey, idxParam);
const opertaor = dataOpertaor(idxParam.opertaorProps);
opertaor.init();
opertaor.setFatherPage({
  currentIndex: currentIndex,
  lowercaseKeys: lowercaseKeys,
  getcacheKey: getcacheKey,
  setTmDay: setTmDay,
  setnDelayNum: setnDelayNum,
  getSaveDataParams: getSaveDataParams,
  getEdrbaseValue: getEdrbaseValue,
  getOldProductResData: getOldProductResData,
  savePlyInfo: savePlyInfo,
});

onBeforeMount(() => {
  oldProductResData.value = [{...props.groupConfig}];
  opertaor.setTableConfig([{...props.groupConfig}]);
  opertaor.setParam({
    ...props.groupConfig?.params,
    ...{}
  });
});

onMounted(() => {
});





function getcacheKey() {
  return cacheKey.value;
}

function setTmDay(tmday: any) {
  tmDay.value = tmday;
}
// 设置延长天数
function setnDelayNum(val:any) {
  edrbase.value?.setValue("EdrBase.nDelayNum", val)
}

function getEdrbaseValue(key:any) {
  return edrbase.value?.getFromValue() || {};
}

function getSaveDataParams() {
  const res = opertaor.getDataAll();
  const plyClauseObj: any = {
    cClauseCode: props.param?.cTermNo,
    cClauseName: props.param?.cTermNme,
  }
  /* 雇主责任险(取主条款项下的累积赔偿限额、每次事故赔偿限额和每人限额。若存在多个方案，累积赔偿限额、每次事故赔偿限额取累加数，每人赔偿限额取最大值) */
  if(props.param?.cProdNo === '040002') {
    plyClauseObj.nAmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nInsuranceAmount']));// 累积赔偿限额
    plyClauseObj.nOnceIndemLmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nAccidentLimit']));// 每次事故赔偿限额
    plyClauseObj.nPerIndemLmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nPersonLimit']));// 每人赔偿限额
  }
  /* 校方责任险(取主条款项下的累积赔偿限额、每次事故赔偿限额和每人赔偿限额。若有多个方案，累积赔偿限额、每次事故赔偿限额取累加数，每人赔偿限额取最大值) */
  if(props.param?.cProdNo === '040005') {
    plyClauseObj.nAmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nInsuranceAmount']));// 累积赔偿限额
    plyClauseObj.nOnceIndemLmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nAccidentLimit']));// 每次事故赔偿限额
    plyClauseObj.nPerIndemLmt = Math.max(...res.cvrg?.map((item:any) => item['Term.nPersonLimit']));// 每人赔偿限额
  }
  /* 律师责任险(取主条款项下的累积赔偿限额、每次事故赔偿限额。每位律师年度累积限额作为每人赔偿限额。若有多个方案，累积赔偿限额、每次事故赔偿限额取累加数，每人赔偿限额取最大值) */
  if(props.param?.cProdNo === '040007') {
    plyClauseObj.nAmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nInsuranceAmount']));// 累积赔偿限额
    plyClauseObj.nOnceIndemLmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nAccidentLimit']));// 每次事故赔偿限额
    plyClauseObj.nPerIndemLmt = Math.max(...res.cvrg?.map((item:any) => item['Term.nLawyerLimit']));// 每人赔偿限额
  }
  /* 注册会计师职业责任险(取主条款项下的累积赔偿限额、每次事故赔偿限额。每位会计师年度累积限额作为每人赔偿限额。若有多个方案，累积赔偿限额、每次事故赔偿限额取累加数，每人赔偿限额取最大值) */
  if(props.param?.cProdNo === "041001") {
    plyClauseObj.nAmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nInsuranceAmount']));// 累积赔偿限额
    plyClauseObj.nOnceIndemLmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nAccidentLimit']));// 每次事故赔偿限额
    plyClauseObj.nPerIndemLmt = Math.max(...res.cvrg?.map((item:any) => item['TermRisktgt.nAccountantLimit']));// 每人赔偿限额
  }
  /* 建设工程设计责任险(取主条款项下的累积赔偿限额、每次事故赔偿限额。没有每人赔偿限额，传空值。若有多个方案，每次事故累积赔偿限额、每次事故赔偿限额取累加数) */
  if(props.param?.cProdNo === "042001") {
    plyClauseObj.nAmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nInsuranceAmount']));// 累积赔偿限额
    plyClauseObj.nOnceIndemLmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nAccidentLimit']));// 每次事故赔偿限额
    plyClauseObj.nPerIndemLmt = "";
  }
  /* 道路客运承运人责任险(取主条款项下的累积赔偿限额、每次事故赔偿限额、每座赔偿限额作为每人赔偿限额。若有多个方案，每次事故累积赔偿限额、每次事故赔偿限额取累加数，每座赔偿限额取最大值) */
  if(props.param?.cProdNo === "043002") {
    plyClauseObj.nAmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nInsuranceAmount']));// 累积赔偿限额
    plyClauseObj.nOnceIndemLmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nAccidentLimit']));// 每次事故赔偿限额
    plyClauseObj.nPerIndemLmt = Math.max(...res.cvrg?.map((item:any) => item['Term.nSeatLimit']));// 每人赔偿限额
  }
  /* 道路货物运输承运人责任险(取主条款项下的累积赔偿限额、每次事故赔偿限额，没有每人赔偿限额，传空值。若有多个方案，每次事故累积赔偿限额、每次事故赔偿限额取累加数) */
  if(props.param?.cProdNo === "043016") {
    plyClauseObj.nAmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nInsuranceAmount']));// 累积赔偿限额
    plyClauseObj.nOnceIndemLmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nAccidentLimit']));// 每次事故赔偿限额
    plyClauseObj.nPerIndemLmt = "";
  }
  /* 除上述几个险种以外，其他险种plyClauseObj中不用传nAmt、nOnceIndemLmt、nPerIndemLmt这三个参数 */
  const param: any[] = [
    {
      "cPlyAppNo": res['applicant']['Applicant.cAppNo'],
      "cPlyNo": res['applicant']['Base.cPlyNo'] || "",
      "nEdrPrjNo": res['plyBase']['Base.nEdrPrjNo'],
      "cProdNo": props.param?.cProdNo,
      "cProdNme": props.param?.cProdNmeCn || props.param?.cProdNme,
      "tAppTm": props.param?.tAppTm || res['insrnc']['Base.tAppTm'],
      "tInsrncBgnTm": props.param?.tInsrncBgnTm || res['insrnc']['Base.tInsrncBgnTm'],
      "cStockMrk": res['insured']['Insured.cStkMrk'],
      "cDptCde": props.param?.cDptCde,
      "cAmtCur": res['base']['Base.cAmtCur'],
      "nRmbChgRate": res['base']['Base.nAmtRmbExch'],
      "nPrmCur": res['base']['Base.cPrmCur'],
      "nRicurChgRate":res['base']['Base.nPrmRmbExch'],
      "cCiMrk": props.param?.cCiMrk || res['plyBase']['Base.cCiMrk'],
      "cFacTyp": "0",// 临分类型（暂定默认传0）
      "cResvTxt1": "0",// 是否农银代理业务（暂定默认传0）
      "tAppCekTm": dayjs().format("YYYY-MM-DD HH:mm:ss"),
      "cSysSource": "3",
      "plyRiskUnitCvrgObjList": [
        {
          "nSeqNo": "1",
          "nAmt": res['base']['Base.nAmt'],
          "nPrm": res['base']['Base.nPrm'],
          "nNotaxPrm": res.payinfo[0]['Pay.nNotaxPrm'] || null,
          "nPrmVar":res.payinfo[0]['Pay.nPrmVar'],
          "nAddedTax": res.payinfo[0]['Pay.nAddedTax'] || null,
          "cTaxTyp":"VAT",
          "cRiskLvlCde": props.param?.cProdNo,
          "cRiskUnitNme": props.param?.cProdNmeCn || props.param?.cProdNme,
        }
      ],
      "plyClauseObj": plyClauseObj,
    }
  ]
  // cAppTyp = E 批单;cEdrType 批改类型 2 注销 3 退保
  if(props.param?.cAppTyp === "E" || props.param.cEdrType === "2" || props.param.cEdrType === "3") {
    param[0].cPlyNo = res['plyBase']['Base.cPlyNo']
    param[0].cEdrType = props.param?.cEdrType // 批改类型
    // param[0].tAppTm = res['insrnc']['Base.tAppTm']
    // param[0].tInsrncBgnTm = res['insrnc']['Base.tInsrncBgnTm']
    param[0].plyRiskUnitCvrgObjList[0].nAmt = edrbase.value?.getValue('EdrBase.nAmt')
    param[0].plyRiskUnitCvrgObjList[0].nPrm = edrbase.value?.getValue('EdrBase.nPrm')
  }
  return param;
}

/**
 * 投保单保存
 * **/
async function savePlyInfo() {
  // // if(props.param.cTransMrk !== '1'){
  let saveFlag = true;
  // const btn = getBtn("btn010102");
  // if(btn) {
  //   btn.loading = true;
  // }
  // // }
  // const res = opertaor.getDataAll();
  // // 点击保存之前的申请单号
  // // if(res['ci'] && res['ci'].length>0){
  // //   res['ci'].forEach((item:any)=>{
  // //     if(item['Ci.nCiShare']){
  // //       item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])/100;
  // //     }
  // //   })
  // // }
  //
  // let payList = res.payinfo;
  // if(payList && payList.length>0){
  //   const toCent = (amount:any) => {
  //     return Math.round(Number(amount) * 100); // 转为分并四舍五入
  //   };
  //   let totalCent = 0;
  //   payList.forEach((item:any) => {
  //     totalCent += toCent(item['Pay.nPayablePrm']);
  //   });
  //   const basePrmCent = toCent(res['base']['Base.nPrm']);
  //   if(totalCent !== basePrmCent){
  //     ElMessage.error('缴费计划“应收保费”不等于“总保费”请确认！')
  //     if(btn) {
  //       btn.loading = false;
  //     }
  //     return false;
  //   }
  // }
  //
  // // 特约信息中的使用分期缴费和使用一次缴费为二选一，提示用户删除某一个
  // if(!validateSpecialAgreement() && btn) {
  //   btn.loading = false;
  //   return false;
  // }
  //
  // if(!res['insrnc']['Base.tInsrncBgnTm'] || !res['insrnc']['Base.tInsrncEndTm']) {
  //   ElMessage.error('保险起期和保险止期不能为空！');
  //   if(btn) {
  //     btn.loading = false;
  //   }
  //   return false;
  // }
  //
  // res["user"] = user;
  // res["plyBase"]["Base.cDptCde"] = props.param.cDptCde;
  // res["plyBase"]["Base.cProdNo"] = props.param.cProdNo;
  // res["plyBase"]["Base.cGrpMrk"] = props.param.cGrpMrk;
  // res["plyBase"]["Base.tUpdTm"] = new Date().getTime();
  //
  // if(props.param?.pageType === "copy" && saveDistBatchFlag.value) {
  //   const cAppNo = res["plyBase"]["Base.cAppNo"];
  //   res["applicant"]["Applicant.cAppNo"] = cAppNo;
  //   if (!!res["insured"]) {
  //     res["insured"]["Insured.cAppNo"] = cAppNo;
  //     delete res["insured"]["Insured.cPkId"];
  //   }
  //   res["cvrg"] = res["cvrg"]?.map((item:any) => {
  //     delete item["Term.cPkId"];
  //     return {
  //       ...item,
  //       'Term.cAppNo': cAppNo,
  //       'Term.riskList': item['Term.riskList'] && Array.isArray(item['Term.riskList']) ? item['Term.riskList'].map((risk:any) => {
  //         delete risk['TermRisktgt.cPkId'];
  //         return {
  //           ...risk,
  //           'TermRisktgt.cAppNo': cAppNo,
  //         };
  //       }) : [],
  //     }
  //   });
  //   // 复制出单保存时增加入参，值为复制保单的保单号或申请单号
  //   res["plyBase"]["Base.cAssPlyNo"] = props.param?.cPlyNo || props.param?.cAppNo;
  // }
  //
  // if (res["cvrg"].length == 0) {
  //   ElMessage.error("请录入条款信息");
  //   if(btn) {
  //     btn.loading = false;
  //   }
  //   return false;
  // } else if(res["cvrg"].length > 0) {
  //   res["cvrg"].forEach((item:any) => {
  //     if(item['Term.cDistCodeNo'] && Array.isArray(item['Term.cDistCodeNo'])) {
  //       if(sessionStorage.getItem("getAddrSeqData")) {
  //         const getAddrSeqData = JSON.parse(sessionStorage.getItem("getAddrSeqData") || '[]')
  //         item['Term.cDistPkId'] = item['Term.cDistCodeNo'].map((item:any) => {
  //           return getAddrSeqData.find((i:any) => i.value === item)?.id
  //         })?.join(',')
  //       }
  //       item['Term.cDistCodeNo'] = item['Term.cDistCodeNo'].join(',')
  //     }
  //   })
  // }
  // // 判断是否为历史补全保单 (cTransMrk === '1')
  // if (props.param.cTransMrk === '1') {
  //   // 调用批单保存方法
  //   return await saveEdrPlyInfo();
  // }
  // console.log('res保存参数',res)
  // const resInfo: any = props.param?.pageName === "priceInquiry" ? await saveInquiry(res) : await saveAppPlyInfo(res);
  // console.log("saveAppPlyInfo-res", resInfo);
  // if(btn) {
  //   btn.loading = false;
  // }
  // if (resInfo["code"] == "200") {
  //   const ops: any = opertaor.convertData(resInfo);
  //   console.log("转换的数据", ops);
  //   ElMessage.success(resInfo.msg);
  //   const base = ops["base"];
  //   const plyBase = ops["plyBase"];
  //   const applicant = ops["applicant"];
  //   const insured = ops["insured"];
  //   if (base) {
  //     const baseRef = opertaor.getTableRefByKey("base");
  //     baseRef.setFormValue(base);
  //   }
  //   if (plyBase) {
  //     const plyBaseRef = opertaor.getTableRefByKey("plyBase");
  //     plyBaseRef.setFormValue(plyBase);
  //   }
  //   if (applicant) {
  //     const applicantRef = opertaor.getTableRefByKey("applicant");
  //     applicantRef.setFormValue(applicant);
  //   }
  //   if (insured) {
  //     const insuredRef = opertaor.getTableRefByKey("insured");
  //     insuredRef.setFormValue(insured);
  //   }
  //
  //
  //
  //   saveFlag = true;
  //   // if((props.param?.pageType === "orig") && saveDistBatchFlag.value) {
  //   //   // 保存清单
  //   // 	debugger
  //   //   const appNo = plyBase["Base.cAppNo"];
  //   //   saveDist(appNo);
  //   // }
  //
  //   // 保存后替换路由参数(判断如果保存前没有申请单号，保存后有申请单号就替换路由参数)
  //   if(props.param?.pageType === "app" || props.param?.pageType === "template" || props.param?.pageType === "copy" || props.param?.pageType === "inquiryToApp" || props.param.pageType === "orig") {
  //     const queryParam = {
  //       pageSize: 10,
  //       pageNum: 1,
  //       cDptCde: opertaor.getDataAll().plyBase["Base.cDptCde"],
  //       cLoadSub: "1",
  //       cDataTyp: "app",
  //       queryType: "1"
  //     }
  //     if(props.param?.pageName === "priceInquiry") {
  //       queryParam['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
  //       queryParam['tAppTmStart'] = dayjs(new Date()).add(2,'day').subtract(3, "month").format("YYYY-MM-DD 00:00:00")
  //       queryParam['tAppTmEnd'] = dayjs(new Date()).format("YYYY-MM-DD 23:59:59")
  //       getInquiryPolicyList(queryParam).then((res:any) => {
  //         if(res.data?.result && res.data?.result.length > 0) {
  //           sessionStorage.setItem('needCalcValue', JSON.stringify(needCalc.value))
  //           const data = res.data?.result[0];
  //           router.replace({
  //             path: "/pcis/my-page",
  //             query: {
  //               param: JSON.stringify({
  //                 ...data,
  //                 ...{ pageType: "TEMPORARY_DEPOSIT", pageName: 'priceInquiry' },
  //               }),
  //             },
  //           });
  //         }
  //       })
  //     } else {
  //       queryParam['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
  //       getAppPolicyList(queryParam).then((res:any) => {
  //         if(res.data?.result && res.data?.result.length > 0) {
  //           sessionStorage.setItem('needCalcValue', JSON.stringify(needCalc.value))
  //           const data = res.data?.result[0];
  //           router.replace({
  //             path: "/pcisapp/myPage",
  //             query: {
  //               param: JSON.stringify({
  //                 ...data,
  //                 ...{ pageType: "TEMPORARY_DEPOSIT" },
  //               }),
  //             },
  //           });
  //         }
  //       })
  //     }
  //   }
  //
  // } else {
  //   ElMessage.error(resInfo.msg);
  // }
  //
  return saveFlag;
};


function getTotalNum(arr: any[]) {
  return arr.reduce((acc, item) => {
    return Number(acc) + Number(item);
  }, 0);
}

function getOldProductResData() {
  // 根据条款获取清单方案号下拉选项
  if(oldProductResData.value && oldProductResData.value.length > 0) {
    oldProductResData.value[0]['pageInfo'].forEach((i:any) => {
      if(i.pageKey === "dist") {
        i.pageSchema.fromSchema.forEach((item:any) => {
          // 方案号下拉值
          if(item.prop == 'Dist.cPlanNo'){
            const termref = opertaor.getTableRefByKey("cvrg");
            item.typeCode = null;
            item.loadData = termref.getPlanNo();
          }
        })
      }
    })
  }
  return oldProductResData.value;
}

/**
 * 锚点点击事件
 */
function handleAnchorClick(event: any, selector: string) {
  if (event) {
    event.preventDefault();
  }
  // 先设置当前激活的锚点
  pageView.value.activeAnchorId.value = selector.substring(1); // 去掉#号
  const target: any = document.querySelector(selector);
  if (target) {
    scrollByDomId(selector)
    // const mainContent = document.querySelector('.main-content');
    // if (mainContent) {
    //   mainContent.scrollTo({
    //     top: target.offsetTop - 75, // 减去一些偏移量
    //     behavior: 'smooth'
    //   });
    // }
  }
}
</script>
<style lang="scss" scoped>
._group_item{
  margin-bottom: 10px;
}
</style>
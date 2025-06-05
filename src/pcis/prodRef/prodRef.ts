import Vue from "vue";

import commonRef from "./commonRef/common.vue";
import baseRef from "./baseRef/base.vue";
import applicantRef from "./applicantRef/applicant.vue";
import insuredRef from "./insuredRef/insured.vue";
import insrncRef from "./insrncRef/insrnc.vue";
import tgtobjRef from "./tgtobjRef/tgtobj.vue";
import payinfoRef from "./payinfoRef/payinfo.vue";
import acctinfoRef from "./acctinfoRef/acctinfo.vue";

import ciMasterAgreementRef from "./ciMasterAgreementRef/ciMasterAgreement.vue";
import ourCompanyCiShareRef from "./ourCompanyCiShareRef/ourCompanyCiShare.vue";
import ciRef from "./ciRef/ci.vue";

import distRef from "./distRef/dist.vue";
import distSummaryRef from "./distRef/distSummary.vue";
import tgtRef from "./tgtRef/tgt.vue";
import cvrgRef from "./cvrgRef/cvrg.vue";
import plyCvrg04Ref from "./cvrgRef/plyCvrg04.vue";
import plyCvrgPer from "./cvrgRef/plyCvrgPer.vue";
import plyCvrgCross from "./cvrgRef/plyCvrgCross.vue";
import plyCvrgPlanCross from "./cvrgRef/plyCvrgPlanCross.vue";
import plybaseRef from "./plyBaseRef/plybase.vue";
import baseafterRef from "./baseafterRef/baseafter.vue";
import informationRef from "./informationRef/information.vue";
import specialAgr from "./specialAgrRef/SpecialAgreement.vue"

import prodInfo from "./commonRef/prodInfo.vue";
import relatedMainInsurance from "./commonRef/relatedMainInsurance.vue";
import prodComponent from "./commonRef/prodComponent.vue";
import InruranceTypeBasicInfo from "./commonRef/inruranceTypeBasicInfo.vue";
import relatedTerms from "./commonRef/relatedTerms.vue";
import relatedRespons from "./commonRef/relatedRespons.vue";
import factoryrelatedAdditionalIns from "./commonRef/factoryrelatedAdditionalIns.vue";
import relatedAdditionalIns from "./commonRef/relatedAdditionalIns.vue";
import specialAgreement from "./commonRef/specialAgreement.vue";
import healthNotice from "./commonRef/HealthNotice.vue";
import relatedInsuranceLiability from "./commonRef/RelatedInsuranceLiability.vue";
import relatedBusinessRules from "./commonRef/RelatedBusinessRules.vue";
import relatedPremCalcuRules from "./commonRef/RelatedPremCalcuRules.vue";
import relatedPayOrderConf from "./commonRef/RelatedPayOrderConf.vue";
import planConfigration from "./commonRef/PlanConfigration.vue";
import rateConfiguration from "./commonRef/RateConfiguration.vue";
import InstituTaxRateAllocat from "./commonRef/InstituTaxRateAllocat.vue";
import assoCorrPreCalculFormula from "./commonRef/AssoCorrPreCalculFormula.vue";
import commodityBasicInfo from "./commodityRef/commodityBasicInfo.vue";
import relatedancillaryInfo from "./commodityRef/relatedancillaryInfo.vue";
import choosePlan from "./commodityRef/ChonsePlan.vue";
import relatedHealthNotify from "./commodityRef/RelatedHealthNotify.vue";
import fileList from "./commodityRef/FileList.vue";
import permissionAllo from "./commodityRef/PermissionAllo.vue";
import InsuranceRules from "./commodityRef/InsuranceRules.vue";
import ReviewComments from "./commodityRef/ReviewComments.vue";
import TestReport from "./commodityRef/TestReport.vue";
import commonProblem from "./commodityRef/CommonProblem.vue";
import healthNoticeAdd from "./commodityRef/HealthNoticeAdd.vue";
import clauseConf from "./clauseConfRef/clauseConf.vue";
import deductibleDist from "./deDuctibleRef/deductibleDist.vue"
// import prodaudit from "./commonRef/prodaudit.vue";
import clauseConfBasicInfo from "./commonRef/ClauseConfBasicInfo.vue";
import  ndustryCateModal  from "./commodityRef/ndustryCateModal.vue";
import  cOccupCdeModal  from "./commodityRef/cOccupCdeModal.vue";

import agentPre from "./commodityRef/agentPer.vue" //代理(经济)人
import agentWorker from "./commodityRef/agentWorker.vue" //代理业务员
import prdFixSpec from "./commodityRef/prd-fix-spec.vue" //特别约定
import deductibleFix from "./commodityRef/DeductibleFix.vue" //免赔条件选择
import underwriteRef from "./underwriteRef/underwrite.vue"
import edrbaseRef from "./edrbaseRef/edrbase.vue"
import edritemRef from "./edritemRef/edritem.vue"
import imageRef from "./commonRef/image.vue"; //影像信息

/**用于动态组件的映射生成 */
const componentMap = {
  commonRef: commonRef,
  baseRef: baseRef,
  applicantRef: applicantRef,
  tgtRef: tgtRef,
  cvrgRef: cvrgRef,
  webPlyCvrg04: plyCvrg04Ref,
  webPlyCvrgPer:plyCvrgPer,
  plyCvrgCross:plyCvrgCross,
  plyCvrgPlanCross:plyCvrgPlanCross,
  plyBaseRef: plybaseRef,
  insuredRef: insuredRef,
  tgtobjRef: tgtobjRef,
  payinfoRef: payinfoRef,
  acctinfoRef: acctinfoRef,
  distRef: distRef,
  distSummaryRef:distSummaryRef,
  deductibleDistRef:deductibleDist,
  ciRef: ciRef,
  ciMasterAgreementRef: ciMasterAgreementRef,
  ourCompanyCiShareRef: ourCompanyCiShareRef,
  insrncRef: insrncRef,
  baseafterRef: baseafterRef,
  informationRef: informationRef,
  SpecialAgreement: specialAgr, //录单页面中的特约信息组件
  underwriteRef: underwriteRef, //录单页面中的核保组件
  edrbaseRef: edrbaseRef, //录单页面中的批改信息组件
  edritemRef: edritemRef, //录单页面中的批改比较项组件
  imageRef:imageRef,


  prodInfoRef: prodInfo,
  // prodauditRef: prodaudit,
  relatedMainInsuranceRef: relatedMainInsurance,
  prodComponentRef: prodComponent,
  InruranceTypeBasicInfoRef:InruranceTypeBasicInfo,
  relatedResponsRef:relatedRespons,
  relatedTermsRef:relatedTerms,
  relatedAdditionalInsRef:relatedAdditionalIns,
  factoryrelatedAdditionalInsRef:factoryrelatedAdditionalIns,
  specialAgreementRef:specialAgreement,
  healthNoticeRef:healthNotice,
  relatedInsuranceLiabilityRef:relatedInsuranceLiability,
  relatedBusinessRulesRef:relatedBusinessRules,
  relatedPremCalcuRulesRef:relatedPremCalcuRules,
  relatedPayOrderConfRef:relatedPayOrderConf,
  planConfigrationRef:planConfigration,
  rateConfigurationRef:rateConfiguration,
  InstituTaxRateAllocatRef:InstituTaxRateAllocat,
  assoCorrPreCalculFormulaRef:assoCorrPreCalculFormula,
  commodityBasicInfoRef:commodityBasicInfo,
  relatedancillaryInfoRef:relatedancillaryInfo,
  choosePlanRef:choosePlan,
  relatedHealthNotifyRef:relatedHealthNotify,
  fileListRef:fileList,
  permissionAlloRef:permissionAllo,
  InsuranceRulesRef:InsuranceRules,
  ReviewCommentsRef:ReviewComments,
  TestReportRef:TestReport,
  commonProblemRef:commonProblem,
  healthNoticeAddRef:healthNoticeAdd,
  clauseConfRef:clauseConf,
  clauseConfBasicInfoRef:clauseConfBasicInfo,

  agentPre: agentPre,
  agentWorker: agentWorker,
  ndustryCateModal:ndustryCateModal,
  cOccupCdeModal:cOccupCdeModal,
  prdFixSpec: prdFixSpec,
  deductibleFix: deductibleFix,
};

const install = (Vue) => {
  Object.keys(componentMap).forEach((k, v) => {
    Vue.component(k, componentMap[k]);
  });
};

export default { install, componentMap };

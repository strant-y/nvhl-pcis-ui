import Vue from "vue";

import commonRef from "./commonRef/common.vue";
import baseRef from "./baseRef/base.vue";
import applicantRef from "./applicantRef/applicant.vue";
import insuredRef from "./insuredRef/insured.vue";
import insrncRef from "./insrncRef/insrnc.vue";
import tgtobjRef from "./tgtobjRef/tgtobj.vue";
import payinfoRef from "./payinfoRef/payinfo.vue";
import acctinfoRef from "./acctinfoRef/acctinfo.vue";
import accidentPrevRef from "./accidentPrevRef/accidentPrev.vue";

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
import term047005 from "./cvrgRef/term-047005.vue";

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
import  cRelatedInsuredModal  from "./commodityRef/cRelatedInsuredModal.vue";
import  cOccupCdeModal  from "./commodityRef/cOccupCdeModal.vue";

import agentPre from "./commodityRef/agentPer.vue" //代理(经济)人
import agentWorker from "./commodityRef/agentWorker.vue" //代理业务员
import ciagentPer from "./commodityRef/ciagentPer.vue" //代理(经济)人
import ciagentWorker from "./commodityRef/ciagentWorker.vue" //代理业务员
import eCargociagentPer from "./commodityRef/eCargoCiagentPer.vue" //代理(经济)人
import eCargociagentWorker from "./commodityRef/eCargoCiagentWorker.vue" //代理业务员
import cBrkrCdeModal from "./commodityRef/cBrkrCdeModal.vue"; //开户行
import prdFixSpec from "./commodityRef/prd-fix-spec.vue" //特别约定
import deductibleFix from "./commodityRef/DeductibleFix.vue" //免赔条件选择
import underwriteRef from "./underwriteRef/underwrite.vue"
import auditwriteRef from "./auditwriteRef/auditwrite.vue"
import edrbaseRef from "./edrbaseRef/edrbase.vue"
import edrexpRef from "./edrexpRef/edrexp.vue"; // 批改扩展信息
import edritemRef from "./edritemRef/edritem.vue"
import xyedrbaseRef from "./xyedrbaseRef/xyedrbase.vue"
import xyedritemRef from "./xyedritemRef/xyedritem.vue"
import imageRef from "./commonRef/image.vue"; //影像信息
import priceComponent from "./commonRef/priceComponent.vue";//询价页面配置
import epolicyWorker from './commodityRef/EPolicyWorker.vue' //在保证明
import detailsAccident from "./commodityRef/DetailsAccident.vue" //合同约定的事故预防服务项目详情
import detailsKnows from "./commodityRef/DetailsKnows.vue" //标的信息知识点提醒详情
import cBuildStrKnows from "./commodityRef/cBuildStrKnows.vue" //标的信息建筑结构提醒详情
import reinsuranceTips from "./commodityRef/ReinsuranceTips.vue" //水险再保提示详情
import navigationAreaTips from "./commodityRef/NavigationAreaTips.vue" //航行区域提示详情
import  specialCateModal  from "./commodityRef/specialCateModal.vue";
import AgentTgtRef from "./agentTgtRef/AgentTgt.vue"
import TransportinfoRef from "./transportinfoRef/Transportinfo.vue";
import PlyTermCommonRef from "./cvrgRef/plyTermCommon.vue";
import insuredDistRef from "./insuredDistRef/insuredDist.vue"; // 被保人清单

/** 组合出单公共组件 **/
import positeBase from "../../views/pcis/composite/component/posite-common/posite-base.vue";
import positeApplicant from "../../views/pcis/composite/component/posite-common/posite-applicant.vue";
import positeInsured from "../../views/pcis/composite/component/posite-common/posite-insured.vue";
import positePlybase from "../../views/pcis/composite/component/posite-common/posite-plybase.vue";
import positeCi from "../../views/pcis/composite/component/posite-common/posite-ci.vue";
/** **/

/**用于动态组件的映射生成 */
const componentMap = {
  commonRef: commonRef,
  baseRef: baseRef,
  applicantRef: applicantRef,
  tgtRef: tgtRef,
  accidentPrevRef:accidentPrevRef,
  cvrgRef: cvrgRef,
  webPlyCvrg04: plyCvrg04Ref,
  webPlyCvrgPer:plyCvrgPer,
  webPlyTermCommon:PlyTermCommonRef,
  plyCvrgCross:plyCvrgCross,
  plyCvrgPlanCross:plyCvrgPlanCross,
  term047005:term047005,
  plyBaseRef: plybaseRef,
  insuredRef: insuredRef,
  tgtobjRef: tgtobjRef,
  payinfoRef: payinfoRef,
  acctinfoRef: acctinfoRef,
  distRef: distRef,
  distSummaryRef:distSummaryRef,
  DeductibleDist:deductibleDist,
  ciRef: ciRef,
  ciMasterAgreementRef: ciMasterAgreementRef,
  ourCompanyCiShareRef: ourCompanyCiShareRef,
  insrncRef: insrncRef,
	insuredDistRef: insuredDistRef,
  baseafterRef: baseafterRef,
  informationRef: informationRef,
  SpecialAgreement: specialAgr, //录单页面中的特约信息组件
  underwriteRef: underwriteRef, //录单页面中的核保组件
  edrbaseRef: edrbaseRef, //录单页面中的批改信息组件
	edrexpRef: edrexpRef, //录单页面中的批改扩展信息组件
  edritemRef: edritemRef, //录单页面中的批改比较项组件
  xyedrbaseRef: xyedrbaseRef, //协议录单页面中的批改信息组件
  xyedritemRef: xyedritemRef, //协议录单页面中的批改比较项组件
  imageRef:imageRef,
  auditwriteRef:auditwriteRef,

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
  priceComponentRef: priceComponent, //询价页面配置

  agentPre: agentPre,
  agentWorker: agentWorker,
  ciagentPer: ciagentPer,
  cBrkrCdeModal:cBrkrCdeModal,
  ciagentWorker: ciagentWorker,
  eCargociagentPer: eCargociagentPer,
  eCargociagentWorker: eCargociagentWorker,
	ndustryCateModal: ndustryCateModal,
	cRelatedInsuredModal:cRelatedInsuredModal,
  cOccupCdeModal:cOccupCdeModal,
  prdFixSpec: prdFixSpec,
  deductibleFix: deductibleFix,
  epolicyWorker:epolicyWorker,
  detailsAccident:detailsAccident,
	detailsKnows: detailsKnows,
	cBuildStrKnows: cBuildStrKnows,
  reinsuranceTips:reinsuranceTips,
  navigationAreaTips:navigationAreaTips,
  specialCateModal:specialCateModal,
  AgentTgtRef:AgentTgtRef,
  TransportinfoRef:TransportinfoRef,

  positeBase: positeBase,
  positeApplicant: positeApplicant,
  positeInsured: positeInsured,
  positePlybase: positePlybase,
  positeCi: positeCi,

};

const install = (Vue) => {
  Object.keys(componentMap).forEach((k, v) => {
    Vue.component(k, componentMap[k]);
  });
};

export default { install, componentMap };

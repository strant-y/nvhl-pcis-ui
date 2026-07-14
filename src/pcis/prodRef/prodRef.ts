import Vue from "vue";

// 产品配置使用的组件
import prodaudit from "./commonRef/prodaudit.vue";
import prodInfo from "./commonRef/prodInfo.vue";
import relatedMainInsurance from "./commonRef/relatedMainInsurance.vue";
import prodComponent from "./commonRef/prodComponent.vue";
import specialAgreement from "./commonRef/specialAgreement.vue";
import relatedBusinessRules from "./commonRef/RelatedBusinessRules.vue";
import relatedPremCalcuRules from "./commonRef/RelatedPremCalcuRules.vue";
import relatedPayOrderConf from "./commonRef/RelatedPayOrderConf.vue";
import planConfigration from "./commonRef/PlanConfigration.vue";
import rateConfiguration from "./commonRef/RateConfiguration.vue";
import InstituTaxRateAllocat from "./commonRef/InstituTaxRateAllocat.vue";
import assoCorrPreCalculFormula from "./commonRef/AssoCorrPreCalculFormula.vue";

// 商品配置使用的组件
import commodityBasicInfo from "./commodityRef/commodityBasicInfo.vue";
import choosePlan from "./commodityRef/ChonsePlan.vue";
import permissionAllo from "./commodityRef/PermissionAllo.vue";
import InsuranceRules from "./commodityRef/InsuranceRules.vue";
import ReviewComments from "./commodityRef/ReviewComments.vue";
import TestReport from "./commodityRef/TestReport.vue";

// 条款配置使用的组件
import clauseConf from "./clauseConfRef/clauseConf.vue";
import clauseConfBasicInfo from "./commonRef/ClauseConfBasicInfo.vue";
import relatedTerms from "./commonRef/relatedTerms.vue";

// 其他通用组件（可能需要）
import prdFixSpec from "./commodityRef/prd-fix-spec.vue" //特别约定
import deductibleFix from "./commodityRef/DeductibleFix.vue" //免赔条件选择
import deductibleDist from "./deDuctibleRef/deductibleDist.vue"
import  ndustryCateModal  from "./commodityRef/ndustryCateModal.vue";
import  cRelatedInsuredModal  from "./commodityRef/cRelatedInsuredModal.vue";
import  cOccupCdeModal  from "./commodityRef/cOccupCdeModal.vue";

// 出单页面预览组件
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

import InruranceTypeBasicInfo from "./commonRef/inruranceTypeBasicInfo.vue";
import relatedRespons from "./commonRef/relatedRespons.vue";
import factoryrelatedAdditionalIns from "./commonRef/factoryrelatedAdditionalIns.vue";
import relatedAdditionalIns from "./commonRef/relatedAdditionalIns.vue";
import healthNotice from "./commonRef/HealthNotice.vue";
import relatedInsuranceLiability from "./commonRef/RelatedInsuranceLiability.vue";
import relatedancillaryInfo from "./commodityRef/relatedancillaryInfo.vue";
import relatedHealthNotify from "./commodityRef/RelatedHealthNotify.vue";
import fileList from "./commodityRef/FileList.vue";
import commonProblem from "./commodityRef/CommonProblem.vue";
import healthNoticeAdd from "./commodityRef/HealthNoticeAdd.vue";
import agentPre from "./commodityRef/agentPer.vue" //代理(经济)人
import agentWorker from "./commodityRef/agentWorker.vue" //代理业务员
import ciagentPer from "./commodityRef/ciagentPer.vue" //代理(经济)人
import ciagentWorker from "./commodityRef/ciagentWorker.vue" //代理业务员
import eCargociagentPer from "./commodityRef/eCargoCiagentPer.vue" //代理(经济)人
import eCargociagentWorker from "./commodityRef/eCargoCiagentWorker.vue" //代理业务员
import cBrkrCdeModal from "./commodityRef/cBrkrCdeModal.vue"; //开户行
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
import cFinancingGuarantee from "./commodityRef/cFinancingGuarantee.vue" //融资性保证险弹框组件

/** 组合出单公共组件 - 对应文件不存在，保持注释 **/
// import positeApplicant from "../../views/pcis/composite/component/posite-common/posite-applicant.vue";
// import positeInsured from "../../views/pcis/composite/component/posite-common/posite-insured.vue";
// import positePlybase from "../../views/pcis/composite/component/posite-common/posite-plybase.vue";
// import positeCi from "../../views/pcis/composite/component/posite-common/posite-ci.vue";
// import positeDeductible from "../../views/pcis/composite/component/posite-common/posite-deductible.vue";
// import customInsrnc from "../../views/pcis/composite/component/posite-common-custom/custom-Insrnc.vue";
// import positeCvrg from "../../views/pcis/composite/component/posite-common/posite-cvrg.vue";
// import customBase from "../../views/pcis/composite/component/posite-common-custom/custom-Base.vue";
// import customTgt from "../../views/pcis/composite/component/posite-common-custom/custom-Tgt.vue";
// import customPlan from "../../views/pcis/composite/component/posite-common-custom/custom-Plan.vue";
// import customDeductible from "../../views/pcis/composite/component/posite-common-custom/custom-Deductible.vue";
// import customSpecialAgreement from "../../views/pcis/composite/component/posite-common-custom/custom-SpecialAgreement.vue";

// import yjxPlan from "@/views/pcis/composite/component/posite-yjx/yjx-plan-base.vue" // 意健险团体成员数据
// import yjxGrpMember from "@/views/pcis/composite/component/posite-yjx/yjx-grp-member.vue" // 意健险团体成员数据

/**用于动态组件的映射生成 */
const componentMap = {
  // 产品配置使用的组件
  prodauditRef: prodaudit,
  prodInfoRef: prodInfo,
  relatedMainInsuranceRef: relatedMainInsurance,
  prodComponentRef: prodComponent,
  specialAgreementRef: specialAgreement,
  relatedBusinessRulesRef: relatedBusinessRules,
  relatedPremCalcuRulesRef: relatedPremCalcuRules,
  relatedPayOrderConfRef: relatedPayOrderConf,
  planConfigrationRef: planConfigration,
  rateConfigurationRef: rateConfiguration,
  InstituTaxRateAllocatRef: InstituTaxRateAllocat,
  assoCorrPreCalculFormulaRef: assoCorrPreCalculFormula,

  // 商品配置使用的组件
  commodityBasicInfoRef: commodityBasicInfo,
  choosePlanRef: choosePlan,
  permissionAlloRef: permissionAllo,
  InsuranceRulesRef: InsuranceRules,
  ReviewCommentsRef: ReviewComments,
  TestReportRef: TestReport,

  // 条款配置使用的组件
  clauseConfRef: clauseConf,
  clauseConfBasicInfoRef: clauseConfBasicInfo,
  relatedTermsRef: relatedTerms,

  // 其他通用组件
  prdFixSpec: prdFixSpec,
  deductibleFix: deductibleFix,
  DeductibleDist: deductibleDist,
  ndustryCateModal: ndustryCateModal,
  cRelatedInsuredModal: cRelatedInsuredModal,
  cOccupCdeModal: cOccupCdeModal,

  // 出单页面预览组件
  commonRef: commonRef,
  baseRef: baseRef,
  applicantRef: applicantRef,
  tgtRef: tgtRef,
  accidentPrevRef: accidentPrevRef,
  cvrgRef: cvrgRef,
  webPlyCvrg04: plyCvrg04Ref,
  webPlyCvrgPer: plyCvrgPer,
  webPlyTermCommon: PlyTermCommonRef,
  plyCvrgCross: plyCvrgCross,
  plyCvrgPlanCross: plyCvrgPlanCross,
  term047005: term047005,
  plyBaseRef: plybaseRef,
  insuredRef: insuredRef,
  tgtobjRef: tgtobjRef,
  payinfoRef: payinfoRef,
  acctinfoRef: acctinfoRef,
  distRef: distRef,
  distSummaryRef: distSummaryRef,
  ciRef: ciRef,
  ciMasterAgreementRef: ciMasterAgreementRef,
  ourCompanyCiShareRef: ourCompanyCiShareRef,
  insrncRef: insrncRef,
  insuredDistRef: insuredDistRef,
  baseafterRef: baseafterRef,
  informationRef: informationRef,
  SpecialAgreement: specialAgr,
  underwriteRef: underwriteRef,
  edrbaseRef: edrbaseRef,
  edrexpRef: edrexpRef,
  edritemRef: edritemRef,
  xyedrbaseRef: xyedrbaseRef,
  xyedritemRef: xyedritemRef,
  imageRef: imageRef,
  auditwriteRef: auditwriteRef,

  InruranceTypeBasicInfoRef: InruranceTypeBasicInfo,
  relatedResponsRef: relatedRespons,
  relatedAdditionalInsRef: relatedAdditionalIns,
  factoryrelatedAdditionalInsRef: factoryrelatedAdditionalIns,
  healthNoticeRef: healthNotice,
  relatedInsuranceLiabilityRef: relatedInsuranceLiability,
  relatedancillaryInfoRef: relatedancillaryInfo,
  relatedHealthNotifyRef: relatedHealthNotify,
  fileListRef: fileList,
  commonProblemRef: commonProblem,
  healthNoticeAddRef: healthNoticeAdd,
  priceComponentRef: priceComponent,

  agentPre: agentPre,
  agentWorker: agentWorker,
  ciagentPer: ciagentPer,
  ciagentWorker: ciagentWorker,
  eCargociagentPer: eCargociagentPer,
  eCargociagentWorker: eCargociagentWorker,
  cBrkrCdeModal: cBrkrCdeModal,
  epolicyWorker: epolicyWorker,
  detailsAccident: detailsAccident,
  detailsKnows: detailsKnows,
  cBuildStrKnows: cBuildStrKnows,
  reinsuranceTips: reinsuranceTips,
  navigationAreaTips: navigationAreaTips,
  specialCateModal: specialCateModal,
  AgentTgtRef: AgentTgtRef,
  TransportinfoRef: TransportinfoRef,
  cFinancingGuarantee: cFinancingGuarantee,

  // positeApplicant: positeApplicant,
  // positeInsured: positeInsured,
  // positePlybase: positePlybase,
  // positeCi: positeCi,
  // positeCvrg: positeCvrg,
  // positeDeductible: positeDeductible,
  // customBaseRef: customBase,
  // customInsrncRef: customInsrnc,
  // customTgtRef: customTgt,
  // customPlanRef: customPlan,
  // customDeductibleDistRef: customDeductible,
  // customSpecialAgreementRef: customSpecialAgreement,

  // yjxPlanRef: yjxPlan,
  // yjxGrpMemberRef: yjxGrpMember,
};

const install = (Vue) => {
  Object.keys(componentMap).forEach((k, v) => {
    Vue.component(k, componentMap[k]);
  });
};

export default { install, componentMap };

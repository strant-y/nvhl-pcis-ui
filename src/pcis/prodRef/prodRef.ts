import Vue from "vue";

import commonRef from "./commonRef/common.vue";
import baseRef from "./baseRef/base.vue";
import applicantRef from "./applicantRef/applicant.vue";
import insuredRef from "./insuredRef/insured.vue";
import insrncRef from "./insrncRef/insrnc.vue";
import tgtobjRef from "./tgtobjRef/tgtobj.vue";
import payinfoRef from "./payinfoRef/payinfo.vue";
import acctinfoRef from "./acctinfoRef/acctinfo.vue";
// import ciMasterAgreementRef from "./ciMasterAgreementRef/ciMasterAgreement.vue";
// import ourCompanyCiShareRef from "./ourCompanyCiShareRef/ourCompanyCiShare.vue";
// import ciRef from "./ciRef/ci.vue";
import distRef from "./distRef/dist.vue";
import tgtRef from "./tgtRef/tgt.vue";
import cvrgRef from "./cvrgRef/cvrg.vue";
import plyCvrg04Ref from "./cvrgRef/plyCvrg04.vue";
import plyCvrgPer from "./cvrgRef/plyCvrgPer.vue";
import plybaseRef from "./plyBaseRef/plybase.vue";
import baseafterRef from "./baseafterRef/baseafter.vue";
import informationRef from "./informationRef/information.vue";

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
import choosePlan from "./commodityRef/ChonsePlan.vue";
import relatedHealthNotify from "./commodityRef/RelatedHealthNotify.vue";
import fileList from "./commodityRef/FileList.vue";
import permissionAllo from "./commodityRef/PermissionAllo.vue";
import InsuranceRules from "./commodityRef/InsuranceRules.vue";
import commonProblem from "./commodityRef/CommonProblem.vue";
import healthNoticeAdd from "./commodityRef/HealthNoticeAdd.vue";
import clauseConf from "./clauseConfRef/clauseConf.vue";
import prodaudit from "./commonRef/prodaudit.vue";
import clauseConfBasicInfo from "./commonRef/ClauseConfBasicInfo.vue";

import agentPre from "./commodityRef/agentPer.vue" //代理(经济)人


/**用于动态组件的映射生成 */
const componentMap = {
  commonRef: commonRef,
  baseRef: baseRef,
  applicantRef: applicantRef,
  tgtRef: tgtRef,
  cvrgRef: cvrgRef,
  webPlyCvrg04: plyCvrg04Ref,
  webPlyCvrgPer:plyCvrgPer,
  plyBaseRef: plybaseRef,
  insuredRef: insuredRef,
  tgtobjRef: tgtobjRef,
  payinfoRef: payinfoRef,
  acctinfoRef: acctinfoRef,
  distRef: distRef,
  // ciRef: ciRef,
  // ciMasterAgreementRef: ciMasterAgreementRef,
  // ourCompanyCiShareRef: ourCompanyCiShareRef,
  insrncRef: insrncRef,
  baseafterRef: baseafterRef,
  informationRef: informationRef,


  prodInfoRef: prodInfo,
  prodauditRef: prodaudit,
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
  choosePlanRef:choosePlan,
  relatedHealthNotifyRef:relatedHealthNotify,
  fileListRef:fileList,
  permissionAlloRef:permissionAllo,
  InsuranceRulesRef:InsuranceRules,
  commonProblemRef:commonProblem,
  healthNoticeAddRef:healthNoticeAdd,
  clauseConfRef:clauseConf,
  clauseConfBasicInfoRef:clauseConfBasicInfo,

  agentPre: agentPre,
};

const install = (Vue) => {
  Object.keys(componentMap).forEach((k, v) => {
    Vue.component(k, componentMap[k]);
  });
};

export default { install, componentMap };

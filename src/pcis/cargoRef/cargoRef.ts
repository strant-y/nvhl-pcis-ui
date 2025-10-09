import ECargoGoodsTgt from '@/pcis/cargoRef/ECargoGoodsTgt.vue' //ECargo 清单
import ECargoTgtSummary from '@/pcis/cargoRef/ECargoTgtSummary.vue' //ECargo 标的总计
import ECargoCvrgECargo from '@/pcis/cargoRef/ECargoCvrg.vue' // 险别信息
import ECargoFeeWarn from '@/pcis/cargoRef/ECargoFeeWarn.vue' // 协议费用提醒
import ECargoApplicantECargo from '@/pcis/cargoRef/ECargoApplicant.vue' // 投保人信息
import ECargoBase from '@/pcis/cargoRef/ECargoBase.vue'; //
import ECargoCi from '@/pcis/cargoRef/ECargoCi.vue'; //
import ECargoCiAgreement from '@/pcis/cargoRef/ECargoCiAgreement.vue'; //
import ECargoCiShare from '@/pcis/cargoRef/ECargoCiShare.vue'; //
import ECargoReview from '@/pcis/cargoRef/ECargoReview.vue';
import ECargoSpecial from "@/pcis/cargoRef/ECargoSpecial.vue"; //
import AgreementDistInsured from "@/pcis/cargoRef/ECargoInsured.vue"; //
import AgreementDistTransport from "@/pcis/cargoRef/ECargoTransportDist.vue"; //
import ECargoAcctinfo from "@/pcis/cargoRef/ECargoAcctinfo.vue"; //
// import ECargoImagedInformation from "@/pcis/cargoRef/ECargoImagedInformation.vue"; //
import AgreementPayInfo from '@/pcis/cargoRef/ECargoPayInfo.vue' // 缴费计划

/**用于动态组件的映射生成 */
const componentMap = {
  AgreementCvrgRef:  markRaw(ECargoCvrgECargo),
  AgreementFeeWarnRef:  markRaw(ECargoFeeWarn),
  AgreementApplicantRef:  markRaw(ECargoApplicantECargo),
  AgreementBaseRef:  markRaw(ECargoBase),
  AgreementCiRef:  markRaw(ECargoCi),
  AgreementCiTcpRef:  markRaw(ECargoCiAgreement),
  AgreementCiShareRef:  markRaw(ECargoCiShare),
  AgreementReviewRef:  markRaw(ECargoReview),
  AgreementSpecialRef:  markRaw(ECargoSpecial),
  AgreementDistInsuredRef:  markRaw(AgreementDistInsured),
  AgreementDistGoodsRef: markRaw(ECargoGoodsTgt),
  AgreementTgtSummaryRef: markRaw(ECargoTgtSummary),
  AgreementAcctinfoRef: markRaw(ECargoAcctinfo),
  // AgreementImagedInformationRef: markRaw(ECargoImagedInformation),
  AgreementDistTransportRef:  markRaw(AgreementDistTransport),
  AgreementPayRef: markRaw(AgreementPayInfo)
};

const install = (Vue) => {
  Object.keys(componentMap).forEach((k, v) => {
    Vue.component(k, componentMap[k]);
  });
};

export default { install, componentMap };

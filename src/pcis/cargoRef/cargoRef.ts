import ECargoDistECargo from '@/pcis/cargoRef/ECargoDist.vue' //ECargo 清单
import ECargoCvrgECargo from '@/pcis/cargoRef/ECargoCvrg.vue' // 险别信息
import ECargoFeeWarn from '@/pcis/cargoRef/ECargoFeeWarn.vue' // 协议费用提醒
import ECargoApplicantECargo from '@/pcis/cargoRef/ECargoApplicant.vue' // 投保人信息
import ECargoBase from '@/pcis/cargoRef/ECargoBase.vue'; //
import ECargoCi from '@/pcis/cargoRef/ECargoCi.vue'; //
import ECargoCiAgreement from '@/pcis/cargoRef/ECargoCiAgreement.vue'; //
import ECargoCiShare from '@/pcis/cargoRef/ECargoCiShare.vue'; //
import ECargoReview from '@/pcis/cargoRef/ECargoReview.vue';
import ECargoSpecial from "@/pcis/cargoRef/ECargoSpecial.vue"; //

/**用于动态组件的映射生成 */
const componentMap = {
  distECargoRef: ECargoDistECargo,
  AgreementCvrgRef: ECargoCvrgECargo,
  AgreementFeeWarnRef: ECargoFeeWarn,
  AgreementApplicantRef: ECargoApplicantECargo,
  AgreementBaseRef: ECargoBase,
  AgreementCiRef: ECargoCi,
  AgreementCiTcpRef: ECargoCiAgreement,
  AgreementCiShareRef: ECargoCiShare,
  AgreementReviewRef: ECargoReview,
  AgreementSpecialRef: ECargoSpecial,
};

const install = (Vue) => {
  Object.keys(componentMap).forEach((k, v) => {
    Vue.component(k, componentMap[k]);
  });
};

export default { install, componentMap };

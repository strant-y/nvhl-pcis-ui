import ECargoDistECargo from './ECargoDist.vue' //ECargo 清单
import ECargoCvrgECargo from './ECargoCvrg.vue' // 险别信息
import ECargoFeeWarn from './ECargoFeeWarn.vue' // 协议费用提醒
import ECargoApplicantECargo from './ECargoApplicant.vue' // 投保人信息
import ECargoBase from './ECargoBase.vue'; //
import ECargoCi from './ECargoCi.vue'; //
import ECargoCiAgreement from './ECargoCiAgreement.vue'; //
import ECargoCiShare from './ECargoCiShare.vue'; //
import ECargoReview from './ECargoReview.vue'; //

/**用于动态组件的映射生成 */
const componentMap = {
  distECargoRef: ECargoDistECargo,
  AgreementCvrgERef: ECargoCvrgECargo,
  AgreementFeeWarnRef: ECargoFeeWarn,
  AgreementApplicantRef: ECargoApplicantECargo,
  AgreementBaseRef: ECargoBase,
  AgreementCiRef: ECargoCi,
  AgreementCiTcpRef: ECargoCiAgreement,
  AgreementCiShareRef: ECargoCiShare,
  AgreementReviewRef: ECargoReview,
};

const install = (Vue) => {
  Object.keys(componentMap).forEach((k, v) => {
    Vue.component(k, componentMap[k]);
  });
};

export default { install, componentMap };

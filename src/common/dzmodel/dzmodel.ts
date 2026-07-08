import Vue from "vue";

import ComDialog from "./ComDialog.vue";
import componentView from "./prodconfig/componentView.vue";
import componentCompare from "./prodconfig/componentCompare.vue";
import prodCopy from "./prodconfig/prodCopy.vue";
import prodFactoryEditor from "./prodconfig/prodFactoryEditor.vue";
import componentPageView from "./prodconfig/componentPageView.vue";
import DistFactorMap from "./prodconfig/DistFactorMap.vue";
import addtremView from "./prodconfig/addtremView.vue";
import riskFactorConfig from "./insuranceConInfo/riskFactorConfig.vue";
import distAdd from "./distmodel/distAdd.vue";

import termGroupConfig from "./insuranceConInfo/termGroupConfig.vue";
import termFactorConfig from "./insuranceConInfo/termFactorConfig.vue";
import querycustomerView from "./prodconfig/querycustomerView.vue";
import termRiskGroupConfig from "./insuranceConInfo/termRiskGroupConfig.vue";
import queryUtils from "./insuranceConInfo/queryUtils.vue";
import relatedAdditionalInsModal from "./insuranceConInfo/relatedAdditionalInsModal.vue";
import changeCiPolicynoComponent from "./edrList/change-ci-policyno-component.vue";
import countryInfoModal from "./distmodel/country-info-modal.vue";

import responsibilityModal from "./termconfigs/responsibilityModal.vue";

import componentEdit from "./componentModel/componentEdit.vue";

import edrItemEdit from "./edrItemEdit/edrItemEdit.vue";
import buttonEdit from "./commonutils/buttonEdit.vue";
import specialApproval from "./commonutils/specialApproval.vue";
import addtremComView from "./prodconfig/addtremComView.vue";
import addriskView from "./prodconfig/addriskView.vue";
import chooseProdDialog from "./prodconfig/chooseProdDialog.vue";

/**用于动态弹窗组件的映射生成 */
const componentMap = {
    comDialog:ComDialog,
    componentView:componentView,
    componentCompare:componentCompare,
    addriskView:addriskView,
    chooseProdDialog:chooseProdDialog,

    prodCopy:prodCopy,
    prodFactoryEditor:prodFactoryEditor,
    componentPageView:componentPageView,
    distFactorMap:DistFactorMap,

    distAdd: distAdd,
    countryInfoModal:countryInfoModal,

    responsibilityModal:responsibilityModal,

	
  
    addtremView:addtremView,
    addtremComView:addtremComView,
    riskFactorConfig:riskFactorConfig,
    termGroupConfig:termGroupConfig,
    termRiskGroupConfig:termRiskGroupConfig,
    termFactorConfig:termFactorConfig,
    querycustomerView:querycustomerView,
    relatedAdditionalInsModal:relatedAdditionalInsModal,
    changeCiPolicynoComponent:changeCiPolicynoComponent,
    queryUtils:queryUtils,

    buttonEdit:buttonEdit,
    specialApproval:specialApproval,
    edrItemEdit:edrItemEdit,

    componentEdit:componentEdit

};

const install = (Vue) => {
  Object.keys(componentMap).forEach((k,v) => {
    Vue.component(k, componentMap[k]);
  });
};

export default { install, componentMap };

import Vue from "vue";

import ComDialog from "./ComDialog.vue";
import componentView from "./prodconfig/componentView.vue";
import componentCompare from "./prodconfig/componentCompare.vue";
import prodCopy from "./prodconfig/prodCopy.vue";
import componentPageView from "./prodconfig/componentPageView.vue";
import addtremView from "./prodconfig/addtremView.vue";
import riskFactorConfig from "./insuranceConInfo/riskFactorConfig.vue";

/**用于动态弹窗组件的映射生成 */
const componentMap = {
    comDialog:ComDialog,
    componentView:componentView,
    componentCompare:componentCompare,
    prodCopy:prodCopy,
    componentPageView:componentPageView,
	
  
    addtremView:addtremView,
    riskFactorConfig:riskFactorConfig,


};

const install = (Vue) => {
  Object.keys(componentMap).forEach((k,v) => {
    Vue.component(k, componentMap[k]);
  });
};

export default { install, componentMap };

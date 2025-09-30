import Vue from "vue";

import selectIconPopover from "./select-icon-popover.vue";
/**用于动态组件的映射生成 */
const componentMap = {
  selectIconPopover: selectIconPopover,
};

const install = (Vue) => {
  Object.keys(componentMap).forEach((k,v) => {
    Vue.component(k, componentMap[k]);
  });
};

export default { install, componentMap };

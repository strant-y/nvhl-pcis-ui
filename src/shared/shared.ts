import Vue from "vue";
import AppFreeEdit from "./app-free-edit.vue"; // 表单基础组件
import AppGridEdit from "./app-grid-edit.vue"; // 数组表单基础组件
import DynamicForms from "./dynamic-form.vue"; // 动态表单组件
import FromItem from "./com-item/from-item.vue"; // 表单明细组件

// 表单明细实现组件
import RtButton from "./com-item/rt-button.vue";
import RtIcon from "./com-item/rt-icon.vue";
import RtInput from "./com-item/rt-input.vue";
import RtSelect from "./com-item/rt-select.vue";
import RtCascader from "./com-item/rt-cascader.vue";
import RtCascaderArea from "./com-item/rt-cascader-area.vue";
import RtSelectV2 from "./com-item/rt-select-v2.vue";
import RtNumber from "./com-item/rt-number.vue";
import RtDatePicker from "./com-item/rt-datePicker.vue";
import RtSwitch from "./com-item/rt-switch.vue";
import RtRadio from "./com-item/rt-radio.vue";
import RtTag from "./com-item/rt-tag.vue";
import RtCheckbox from "./com-item/rt-checkbox.vue";
import RtCheckboxGroup from "./com-item/rt-checkbox-group.vue";
import RtlTable from "./com-item/rt-table.vue";
import AppTable from "./app-table.vue";
import RtMytable from "./com-item/rt-mytable.vue";
import rtUpload from "./com-item/rt-upload.vue";

// 自定义表单声明
import MyCard from "./mytemplate/card.vue";

/**用于动态组件的映射生成 */
const componentMap = {
  AppFreeEdit: AppFreeEdit,
  AppGridEdit: AppGridEdit,
  DynamicForms: DynamicForms,
  FromItem: FromItem,
  AppTable: AppTable,

  rtButton: RtButton,
  rtIcon: RtIcon,
  rtinput: RtInput,
  rtselect: RtSelect,
  rtSelectV2: RtSelectV2,
  rtcascader: RtCascader,
  rtcascaderarea: RtCascaderArea,
  rtnumber: RtNumber,
  rtdatepicker: RtDatePicker,
  rtswitch: RtSwitch,
  rtradio: RtRadio,
  rttag: RtTag,
  rtcheckbox: RtCheckbox,
  rtcheckboxgroup: RtCheckboxGroup,
  rttable: RtlTable,
  rtMytable: RtMytable,
  rtUpload:rtUpload,
  
  myCard:MyCard
};

const install = (Vue) => {
  Object.keys(componentMap).forEach((k,v) => {
    Vue.component(k, componentMap[k]);
  });
};

export default { install, componentMap };

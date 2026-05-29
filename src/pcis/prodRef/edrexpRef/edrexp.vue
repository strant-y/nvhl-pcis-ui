<template>
  <div>
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="edrexpEditRef" />
  </div>
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { useValidator } from "@/typings/useValidator";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { NewUdrListService } from "@/views/pcis-new-udr-list/service/new-udr-list.service";
import { PcisQueryService } from "@/views/payinfoManagement/service/pcis-query-service";
import { codeListViewStore } from "@/store";
import dayjs from "dayjs";
import { debug } from "console";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
import { qryTerminationDataList, qryProdRuleList, queryLatestMrk, checkPlyChange } from "@/api/prod";
import Decimal from "decimal.js";

const pcisQueryService = new PcisQueryService();
const codeListStore = codeListViewStore();
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const { getRules } = useValidator();
const props = defineProps({
  // param: {
  //   type: [Object],
  // },
});
const params=opertaor.getParam();
const { getCUndrMrk, getBackClsList } = NewUdrListService();
const edrexpEditRef = ref<AppFreeEditMethod | null>(null);
const user = JSON.parse(sessionStorage.getItem("user") || '{}');
const rebackDay = ref(0);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "批改扩展信息",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "EdrBase.cSubtractPrmRsn",
        inputtype: "rtinput",
        title: "退保、减保或者办理保单贷款原因",
				disabled: true,
				type: "textarea",
        rows: 2,
      },
      {
        prop: "EdrBase.cNotBackAppRsn",
        inputtype: "rtinput",
        title: "未退还至投保人账户的原因",
				disabled: true,
				type: "textarea",
        rows: 2,
      },
      {
        prop: "EdrBase.cNotBackAppNo",
        inputtype: "rtinput",
        title: "反洗钱非投保人收款审批单号",
        disabled:true
      },
    ],
    fromUi: createFromUiConfig({
			cols: 1,
			labelWidth: '230px'
    }),
  })
);


function getFromValue() {
  return edrexpEditRef?.value?.getFromValue();
}

function setFormValue(val: any) {
  edrexpEditRef?.value?.setFormValue(val);
}

function validate() {
  return edrexpEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  edrexpEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return edrexpEditRef?.value?.getValue(key);
}
//给表单下拉项赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          for (let key in obj.btnItems) {
            item.btnItems[key] = obj.btnItems[key];
          }
        }else{
          Object.assign(item, obj);
        }
      }
    });
  }
}
onMounted(() => {});


function getFormconfig() {
  return formconfig1;
}
function addProvide<T>(key: InjectionKey<T> | string, value: T)  {
  edrexpEditRef?.value?.addProvide(key, value);
}
defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig,
	addProvide,
	setFormItem,
});
</script>

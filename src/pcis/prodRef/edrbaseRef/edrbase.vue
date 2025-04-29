<template>
  <div>
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="edrbaseEditRef" />
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
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
const opertaor = dataOpertaor();
const { getRules } = useValidator();
const props = defineProps({
  // param: {
  //   type: [Object],
  // },
});
const params=opertaor.getParam();
const { getCUndrMrk, getBackClsList } = NewUdrListService();
const edrbaseEditRef = ref<AppFreeEditMethod | null>(null);
const user = JSON.parse(sessionStorage.getItem("user"));
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "批改信息",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "EdrBase.cRatioTyp",
        inputtype: "rtselect",
        title: "短期费率类型",
        // loadData: [
        //     {value: '1', label: '按月'},
        //     {value: '2', label: '按日'},
        //     {value: '3', label: '不计'},
        // ],
        typeCode: "CRATIO_TYPE_CACHE",
        rules: [getRules("required", {})],
        clearable: true,
        func: (v) => {},
      },
      {
        prop: "EdrBase.cDptCde",
        inputtype: "rtselect",
        title: "机构部门",
        loadData: [],
        rules: [getRules("required", {})],
        itemWidth: 1,
        valueSpan: 10,
        clearable: true,
        disabled:true
      },
     {
        prop: "EdrBase.cProdNo",
        inputtype: "rtselect",
        title: "产品",
        typeCode: "PROD_LIST_IN_GUIDE",
        clearable: true,
        disabled:true
     },
      {
        prop: "EdrBase.cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
       disabled:true
      },
      {
        prop: "EdrBase.cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
        disabled:true
      },
      {
        prop: "EdrBase.cEdrNo",
        inputtype: "rtinput",
        title: "批单号",
        disabled:true
      },
      {
        prop: "EdrBase.nBefEdrAmt",
        inputtype: "rtinput",
        title: "原保额",
        disabled:true
      },
      {
        prop: "EdrBase.nAmt",
        inputtype: "rtinput",
        title: "现保额",
        disabled:true
      },
      {
        prop: "EdrBase.nAmtVar",
        inputtype: "rtinput",
        title: "保额变化",
        disabled:true
      },
      {
        prop: "EdrBase.nBefEdrPrm",
        inputtype: "rtinput",
        title: "原保费",
        disabled:true
      },
      {
        prop: "EdrBase.nPrm",
        inputtype: "rtinput",
        title: "现保费",
        disabled:true
      },
      {
        prop: "EdrBase.nPrmVar",
        inputtype: "rtinput",
        title: "保费变化",
        disabled:true
      },
      {
        prop: "EdrBase.tEdrAppTm",
        inputtype: "rtdatepicker",
        format:"YYYY-MM-DD HH:mm:ss",
        type :"datetime",
        title: "批改申请日期",
        disabled:true
      },
      {
        prop: "EdrBase.tEdrBgnTm",
        inputtype: "rtdatepicker",
        format:"YYYY-MM-DD HH:mm:ss",
        type :"datetime",
        title: "批单生效起期",
      },
      {
        prop: "EdrBase.cAppPrsnNme",
        inputtype: "rtinput",
        title: "申请人",
      },
      {
        prop: "EdrBase.cEdrMrk",
        inputtype: "rtselect",
        title: "申请类型",
        loadData: [
          { value: "3", label: "客户申请" },
          { value: "4", label: "内部批改" },
          { value: "6", label: "客户提供错误信息" },
          { value: "9", label: "其他" },
        ],
        rules: [getRules("required", {})],
        clearable: true,
        func: (v) => {},
      },
      {
        prop: "EdrBase.cEdrRsnBundleCde",
        inputtype: "rtselect",
        title: "批改原因",
        typeCode: "EDR_RSN_LIST",
        codeParam: { prodNo: params["cProdNo"] ,rsnTyp: params["cEdrType"],isGrp:params["cGrpMrk"] === "1" ? "1" : null,isPer: params["CGrpMrk"] === "1" ? "1" : null},
        rules: [getRules("required", {})],
        clearable: true,
        disabled: true,
        func: (v) => {},
      },
      {
        prop: "EdrBase.cEdrRsnDetail",
        inputtype: "rtcheckboxgroup",
        title: "批改原因详细",
        itemWidth: 2,
        expand: true,
        disabled: true,
        // loadData: [
        // { label: "投保单", value: "cAppNo" },
        // { label: "保单", value: "cPlyNo" },
        // { label: "批单", value: "cEdrNo" },
        // { label: "批改序号", value: "c" },
        // { label: "机构", value: "cDptCnm" },
        // { label: "二级分公司", value: "cSecondDptCnm" },
        // { label: "产品", value: "cProdNmeCn" },
        // { label: "条款", value: "cTermNme" },
        // { label: "核保人", value: "cUdrNme" },
        // { label: "核保通过日期", value: "tUdrTm" },
        // { label: "状态", value: "cAppStatus" },
        // { label: "项目大类", value: "k" },
        // { label: "项目中类", value: "l" },
        // { label: "项目子类", value: "m" },
        // { label: "询价单号", value: "n" },
        // ],
      },
      {
        prop: "EdrBase.edrFormula",
        inputtype: "rtinput",
        type: "textarea",
        title: "批改公式",
        rows: 4,
        itemWidth: 2,
      },
      {
        prop: "EdrBase.cEdrCtnt",
        inputtype: "rtinput",
        type: "textarea",
        title: "批文",
        rows: 6,
        itemWidth: 2,
      },
      {
          prop: "EdrBase.cEdrType",
          inputtype: "rtinput",
          hidden:true,
      },
      {
          prop: "EdrBase.cacheKey",
          inputtype: "rtinput",
          hidden:true,
      },
    ],
    fromUi: createFromUiConfig({
      cols: 2,
    }),
  })
);

function getFromValue() {
  return edrbaseEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  edrbaseEditRef?.value?.setFormValue(value);
}

function validate() {
  return edrbaseEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  edrbaseEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return edrbaseEditRef?.value?.getValue(key);
}
//给表单下拉项赋值
function setFormItem(key, obj) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        Object.assign(item, obj);
      }
    });
  }
}
onMounted(() => {
  nextTick(() => {
    setFormItem("EdrBase.cDptCde", {
        loadData: [
            { value: params.cDptCde, label: `${params.cDptCde} ${params.cDptCnm}` },
        ],
    });
    if(params["cEdrType"]!='1'){
        if(params["cEdrType"]=='3'){
            setFormItem("EdrBase.cEdrRsnDetail", { loadData: [{value:'s1',label:'全单退保'},{value:'s2',label:'一般退保'}] });
        }else if(params["cEdrType"]=='2'){
            setFormItem("EdrBase.cEdrRsnDetail", { loadData: [{value:'c1',label:'全单注销'}] });
        }
        setFormItem("EdrBase.cEdrRsnBundleCde", {typeCode:'', codeParam:'',loadData: [{value:'s1',label:'全单退保'},{value:'s2',label:'一般退保'},{value:'c1',label:'全单注销'}] });
    }else{
        const isGrp = params["cGrpMrk"] === "1" ? "1" : null;
        const isPer = params["CGrpMrk"] === "1" ? "1" : null;
        const param = {
            prodNo: params["cProdNo"],
            rsnTyp: params["cEdrType"],
            isGrp: isGrp,
            isPer: isPer,
            ZH: "ZH",
            FZ: "FZ",
        };
        if(params.cRsncde=='FZ'){
            param["calcMrk"] = '0'
        }
        codeListStore
            .queryCodeList({
                codeListName: "EDR_RSN_LIST",
                codeListParam: param,
            })
            .then((res) => {
                setFormItem("EdrBase.cEdrRsnDetail", { loadData: res });
            });
    }
  });
});

function getFormconfig() {
  return formconfig1;
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig,
});
</script>

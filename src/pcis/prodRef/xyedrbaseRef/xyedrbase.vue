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
import dayjs from "dayjs";
import { debug } from "console";
const codeListStore = codeListViewStore();
const opertaor = dataOpertaor('enteringDtl');
const { getRules } = useValidator();
const props = defineProps({
  // param: {
  //   type: [Object],
  // },
});
const idxParam = inject('idxParam');
const params= idxParam?.param
const { getCUndrMrk, getBackClsList } = NewUdrListService();
const edrbaseEditRef = ref<AppFreeEditMethod | null>(null);
const user = JSON.parse(sessionStorage.getItem("user"));
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "批改信息",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "EdrECargoBase.tRepStopExtBgnTm",
        inputtype: "rtdatepicker",
        type: "datetime",
        title: "报停起期",
        rules: [getRules("required", {})],
        clearable: true,
        hidden: params.cRsnCde != "46",
        disabledDate: (time: Date) => {
          const tInsrncBgnTm = params.tInsrncBgnTm;
          return time.getTime() < new Date(tInsrncBgnTm).getTime()
        },
        func: (v) => {
          const tRepStopExtEndTm = getValue("EdrECargoBase.tRepStopExtEndTm")
          if(v && tRepStopExtEndTm && new Date(v).getTime() > new Date(tRepStopExtEndTm).getTime()) {
            ElMessage.warning("报停起期不能晚于报停止期")
            setValue("EdrECargoBase.tRepStopExtBgnTm", null)
          } else if(v && tRepStopExtEndTm) {
            // 根据报停起期和止期计算相差天数，然后延长保险止期相应天数
            const time = dayjs(tRepStopExtEndTm).diff(dayjs(v))
            opertaor.getTableRefs().insrnc.setValue("Base.tInsrncEndTm", dayjs(params.tInsrncEndTm).add(time))
          }
        },
      },
      {
        prop: "EdrECargoBase.tRepStopExtEndTm",
        inputtype: "rtdatepicker",
        type: "datetime",
        title: "报停止期",
        rules: [getRules("required", {})],
        clearable: true,
        hidden: params.cRsnCde != "46",
        disabledDate: (time: Date) => {
          const tInsrncEndTm = params.tInsrncEndTm;
          return time.getTime() > new Date(tInsrncEndTm).getTime()
        },
        func: (v) => {
          const tRepStopExtBgnTm = getValue("EdrECargoBase.tRepStopExtBgnTm")
          if(v && tRepStopExtBgnTm && new Date(v).getTime() < new Date(tRepStopExtBgnTm).getTime()) {
            ElMessage.warning("报停止期不能早于报停起期")
            setValue("EdrECargoBase.tRepStopExtEndTm", null)
          } else if(v && tRepStopExtBgnTm) {
            // 根据报停起期和止期计算相差天数，然后延长保险止期相应天数
            const time = dayjs(v).diff(dayjs(tRepStopExtBgnTm))
            opertaor.getTableRefs().insrnc.setValue("Base.tInsrncEndTm", dayjs(params.tInsrncEndTm).add(time))
          }
        },
      },
      // {
      //   prop: "EdrECargoBase.NSurrRate",
      //   inputtype: "rtnumber",
      //   title: "手续费比例",
      //   clearable: true,
      //   hidden: params["cEdrType"] ==='1',
      //   func: (v:any) => {
      //     if(v){
      //       if(v<0 || v>1){
      //         ElMessage.warning("批改信息的手续费比例 必须为0~1.0之间!")
      //         setValue('EdrECargoBase.NSurrRate',0)
      //       }
      //     }
      //   },
      // },
      {
        prop: "EdrECargoBase.nBefEdrPrm",
        inputtype: "rtinput",
        title: "原保费",
        disabled:true,
        suffix: "元"
      },
      {
        prop: "EdrECargoBase.nPrm",
        inputtype: "rtinput",
        title: "现保费",
        disabled:true,
        suffix: "元"
      },
      {
        prop: "EdrECargoBase.nPrmVar",
        inputtype: "rtinput",
        min:-999999999999,
        title: "保费变化",
        disabled:true,
        suffix: "元"
      },
      {
        prop: "EdrECargoBase.tEdrAppTm",
        inputtype: "rtdatepicker",
        format:"YYYY-MM-DD HH:mm:ss",
        type :"datetime",
        title: "批改申请日期",
        disabled:true
      },
      {
        prop: "EdrECargoBase.tEdrBgnTm",
        inputtype: "rtdatepicker",
        format:"YYYY-MM-DD HH:mm:ss",
        type :"datetime",
        title: "批单生效起期",
        func: (v:any) => {
          if(v){
            // debugger
            console.log(v,params)
          }
        },
      },
      {
        prop: "EdrECargoBase.cEdrMrk",
        inputtype: "rtselect",
        title: "申请类型",
        loadData: [
          { value: "3", label: "客户申请" },
          { value: "4", label: "内部批改" },
          // { value: "6", label: "客户提供错误信息" },
          { value: "9", label: "其他" },
        ],
        rules: [getRules("required", {})],
        clearable: true,
        func: (v) => {},
      },
      {
        prop: "EdrECargoBase.cEdrRsnBundleCde",
        inputtype: "rtselect",
        title: "批改原因",
        typeCode: "EDR_RSN_LIST",
        codeParam: { prodNo: params["cProdNo"] ,rsnTyp: params["cEdrType"],isGrp:params["cGrpMrk"] === "1" ? "1" : null,isPer: params["CGrpMrk"] === "1" ? "1" : null,calcMrk:params["cGrpMrk"]},
        rules: [getRules("required", {})],
        clearable: true,
        disabled: true,
        func: (v) => {},
      },
      {
        prop: "EdrECargoBase.cEdrRsnDetail",
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
        prop: "EdrECargoBase.edrFormula",
        inputtype: "rtinput",
        type: "textarea",
        title: "批改公式",
        rows: 1,
        itemWidth: 3,
      },
      {
        prop: "EdrECargoBase.cEdrCtnt",
        inputtype: "rtinput",
        type: "textarea",
        title: "批文",
        rows: 4,
        itemWidth: 3,
        rules: [getRules("maxLength", {len:5000})],
      },
      {
          prop: "EdrECargoBase.cEdrType",
          inputtype: "rtinput",
          hidden:true,
      },
      {
          prop: "EdrECargoBase.cacheKey",
          inputtype: "rtinput",
          hidden:true,
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);

function getFromValue() {
  return edrbaseEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  const val = {
    ...value,
    "EdrECargoBase.nBefEdrAmt": value["EdrECargoBase.nBefEdrAmt"]?.toLocaleString(),
    "EdrECargoBase.nAmt": value["EdrECargoBase.nAmt"]?.toLocaleString(),
    "EdrECargoBase.nAmtVar": value["EdrECargoBase.nAmtVar"]?.toLocaleString(),
    "EdrECargoBase.nBefEdrPrm": value["EdrECargoBase.nBefEdrPrm"]?.toLocaleString(),
    "EdrECargoBase.nPrm": value["EdrECargoBase.nPrm"]?.toLocaleString(),
    "EdrECargoBase.nPrmVar": value["EdrECargoBase.nPrmVar"]?.toLocaleString(),
  }
  edrbaseEditRef?.value?.setFormValue(val);
}

function validate() {
  return edrbaseEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  if(key === "EdrECargoBase.nBefEdrAmt" ||
    key === "EdrECargoBase.nAmt" || 
    key === "EdrECargoBase.nAmtVar" || 
    key === "EdrECargoBase.nBefEdrPrm" || 
    key === "EdrECargoBase.nPrm" || 
    key === "EdrECargoBase.nPrmVar"
  ) {
    edrbaseEditRef?.value?.setValue(key, value.toLocaleString());
  } else {
    edrbaseEditRef?.value?.setValue(key, value);
  }
}

function getValue(key: string) {
  return edrbaseEditRef?.value?.getValue(key);
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
onMounted(() => {
  nextTick(() => {
    // 非涉费批改批改公式文本框隐藏
    // if(params.cRsnCde === "FZ") {
      setFormItem("EdrECargoBase.edrFormula", { hidden: true })
    // }
    setFormItem("EdrECargoBase.cDptCde", {
        loadData: [
            { value: params.cDptCde, label: `${params.cDptCde} ${params.cDptCnm}` },
        ],
    });
    if(params["cEdrType"]!='1'){
        if(params["cEdrType"]=='3'){
            setFormItem("EdrECargoBase.cEdrRsnDetail", { loadData: [{value:'s1',label:'全单退保'},{value:'s2',label:'一般退保'}] });
        }else if(params["cEdrType"]=='2'){
            setFormItem("EdrECargoBase.cEdrRsnDetail", { loadData: [{value:'c1',label:'全单注销'}] });
        }
        setFormItem("EdrECargoBase.cEdrRsnBundleCde", {typeCode:'', codeParam:'',loadData: [{value:'s1',label:'全单退保'},{value:'s2',label:'一般退保'},{value:'c1',label:'全单注销'}] });
    }else{
        const isGrp = params["cGrpMrk"] === "1" ? "1" : null;
        const isPer = params["CGrpMrk"] === "1" ? "1" : null;
        const param = {
            prodNo: "029900",
            rsnTyp: params["cEdrType"],
            isGrp: isGrp,
            isPer: isPer,
            ZH: "ZH",
            FZ: "FZ",
        };
        if(params.cRsnCde=='FZ'){
            param["calcMrk"] = '0'
        }else{
          param["calcMrk"] = '1'
        }
        codeListStore
            .queryCodeList({
                codeListName: "EDR_RSN_LIST_FZ",
                codeListParam: param,
            })
            .then((res) => {
                setFormItem("EdrECargoBase.cEdrRsnDetail", { loadData: res });
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

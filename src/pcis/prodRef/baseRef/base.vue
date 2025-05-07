<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="baseEditRef" />
  <comDialog ref="dialogRef"></comDialog>
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { formatDate } from "@/utils/date";
import { ratio } from "@/api/prod"
const opertaor = dataOpertaor();
import { useRoute } from "vue-router";
const route = useRoute();
const dialogRef = ref<DialogMethod | null>(null);
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const baseEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));
const sessionData = ref();
const fixSpecData = ref([]); //存储已选择的特别约定数据

onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
  nextTick(() => {
    setValue(
      "Base.cJuriCde",
      "本保单受中华人民共和国司法管辖（港、澳、台除外）"
    );
    setValue("Base.nRatioCoef", "1.000000");
  });
  if (sessionStorage.getItem("toMyPageData")) {
    sessionData.value = JSON.parse(sessionStorage.getItem("toMyPageData"));
  }
  // const value = getValue('Base.nAmt');
  // console.log("测试Base.nAmt得值");
  // console.log(value);
  
});

// 绑定方法
const method = {
  // func demo
  func1: () => {
    console.log(getRules);
  },

  //缴费拆分按钮事件
  splitPayNumber() {
    if (Number(getValue("Base.nPayNumber"))>12) {
      ElMessage.warning("拆分最多为12期！");
      return false
    }
    if(getValue("Base.nPayNumber")!=''){
      const totalAmount = Number(getValue("Base.nPrm"));
      const splitCount = Number(getValue("Base.nPayNumber"));
      const result = ref<number[]>([]);
      const quotient = Math.floor(totalAmount / splitCount);
      const remainder = totalAmount % splitCount;
      result.value = Array(splitCount).fill(quotient);
      if (remainder > 0) {
        result.value[0] += remainder;
      }
      let val= {}
      let valArr=[]
      for (let i = 0; i < Number(getValue("Base.nPayNumber")); i++) {
        let BgnTmDate = new Date(opertaor.getTableRefs()["insrnc"].getValue("Base.tInsrncBgnTm"))   // 开始时间
        let startDate = new Date(BgnTmDate); 
        let endDate = new Date(BgnTmDate);
        if (getValue("Base.cInstMrk")=='5') {
          startDate.setDate(BgnTmDate.getDate() + i * 15); 
          endDate.setDate(BgnTmDate.getDate() + (i + 1) * 15); 
        } else {
          startDate.setDate(BgnTmDate.getDate() + i * 30); 
          endDate.setDate(BgnTmDate.getDate() + (i + 1) * 30); 
        }
        let tInsrncBgnTm = formatDate(startDate, 'yyyy-MM-dd HH:mm:ss')
        let tPayEndTm = formatDate(endDate,'yyyy-MM-dd HH:mm:ss')
           val= { "_dataId": "", "Pay.nTms":i+1 , "Pay.cPayorCde": opertaor.getTableRefs()["applicant"].getValue("Applicant.cAppCde"), "Pay.tPayBgnTm": tInsrncBgnTm, "Pay.tPayEndTm": tPayEndTm, "Pay.nOwnPrm": result.value[i], "Pay.cPayorNme":opertaor.getTableRefs()["applicant"].getValue("Applicant.cAppNme"), "Pay.nPayablePrm": result.value[i] }
          valArr.push(val)
      }
      opertaor.getTableRefByKey("payinfo").setFormValue(valArr);
  }
},
cRatioTypChange(val){
    // if(val=='3'){
    //   setValue("Base.nRatioCoef", "1.000000");
    // }else{
    //   setValue("Base.nRatioCoef", "");
    // }
    let params = {
      bgnTm: opertaor.getTableRefs()["insrnc"].getValue("Base.tInsrncBgnTm"),
      endTm: opertaor.getTableRefs()["insrnc"].getValue("Base.tInsrncEndTm"),
      prodNo: route.params.param.cProdNo,
      ratioType:val,
    }
    ratio(params).then((res) => {
      if (res.data) {
        setValue("Base.nRatioCoef", res.data);
      }
    })
  },
  //付费约定下拉事件
  cInstMrkChange(val: any) {
    setValue("Base.nPayNumber", '1');
    if(val=='5'){
      setFormItem("Base.nPayNumber", { disabled: false });
    }else{
      setFormItem("Base.nPayNumber", { disabled: true });
    }
  },
  //争议处理选择事件
  cDisptSttlCdeChange(val){
    if(val=='A'){
      setFormItem("Base.cDisptSttlOrg", { disabled: false });
      setValue("Base.cDisptSttlOrg", "提交____仲裁委员会");
    }else{
      setFormItem("Base.cDisptSttlOrg", { disabled: true });
      setValue("Base.cDisptSttlOrg", "");
      
    }
    
  },
  //总保费下拉事件
  cPrmCurChange: (val: any) => {
    if (val !== "CNY") {
      codeListStore
        .queryCodeList({
          codeListName: "WEB_BAS_CHGRATE",
          codeListParam: { value: val },
        })
        .then((res) => {
          setValue("Base.nPrmRmbExch", res[0].currency_rate);
        });
    } else {
      setValue("Base.nPrmRmbExch", "1.000000");
    }
  },
  //总保额币种下拉事件
  cAmtCurChange(val: any) {
    if (val !== "CNY") {
      codeListStore
        .queryCodeList({
          codeListName: "WEB_BAS_CHGRATE",
          codeListParam: { value: val },
        })
        .then((res) => {
          console.log("0000000", res);
          setValue("Base.nAmtRmbExch", res[0].currency_rate);
        });
    } else {
      setValue("Base.nAmtRmbExch", "1.000000");
    }
  },
  //保额汇率标识change事件
  cInsExchCdeChange(val: any) {
    if (val == "0") {
      setFormItem("Base.nAmtRmbExch", { disabled: false });
    } else {
      setFormItem("Base.nAmtRmbExch", { disabled: true });
      setValue("Base.nAmtRmbExch", "1.000000");
    }
  },
  //保费汇率标识change事件
  cPremExchCdeChange(val: any) {
    if (val == "0") {
      setFormItem("Base.nPrmRmbExch", { disabled: false });
    } else {
      setFormItem("Base.nPrmRmbExch", { disabled: true });
      setValue("Base.nPrmRmbExch", "1.000000");
    }
  },
  // 特别约定ICON事件
  selectCUnfixSpc: () => {
    dialogRef.value?.open(
      "prdFixSpec",
      {
        type: "show",
        data: {
          cProdNo: sessionData.value?.cProdNo,
          fixSpecData: fixSpecData.value, //之前选中的数据数组
        },
        method: {
          getSelected: (params) => {
            if (params && params.length) {
              fixSpecData.value = params;
              let i = 1;
              // let cSpecNo = '';
              let cUnfixSpc = "";
              params.forEach((value) => {
                // cSpecNo = '' === cSpecNo ? value['PrdFixSpec.CSpecNo'] : cSpecNo + '$$' + value['PrdFixSpec.CSpecNo'];
                cUnfixSpc =
                  "" === cUnfixSpc
                    ? i + "." + value["PrdFixSpec.CNmeCn"]
                    : cUnfixSpc + "\n" + i + "." + value["PrdFixSpec.CNmeCn"];
                setValue("Base.cUnfixSpc", cUnfixSpc);
                i++;
              });
            }
            dialogRef.value?.handleClose();
          },
        },
      },
      {
        isOk: (selectdata: any) => {
          console.log("a", selectdata);
        },
      },
      { title: "特别约定", width: 85 }
    );
  },
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return baseEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  baseEditRef?.value?.setFormValue(value);
}

function validate() {
  return baseEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  baseEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return baseEditRef?.value?.getValue(key);
}

//给表单赋值
function setFormItem(key, obj) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        Object.assign(item, obj);
      }
    });
  }
}

function getFormconfig(){
  return formconfig1;
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig
});
</script>

<style scoped></style>

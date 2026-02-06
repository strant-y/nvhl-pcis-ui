<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="tgtobjEditRef" />
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { useProductStore } from "@/store/modules/prod";
import {idxParamKey, useIdxParam} from "@/views/pcis/support/useIdxParam";

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});
const tgtobjEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));

const idxParam = inject(idxParamKey, useIdxParam());
const formPage = idxParam?.formPage;
const param = idxParam?.param;

onMounted(() => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
  if(param?.pageType === "EDR_APP_NEW_SCENE" && (param?.cEdrType == '2' || param?.cEdrType == '3')){
    setTimeout(() => {
      formconfig1.fromSchema?.forEach((item) => {
        item.disabled = true;
      });
    }, 1000);
  }
});
  watchEffect(() => {
		const AgreementBase = formPage.getFormDataById('AgreementBase')
		if(AgreementBase && Object.keys(AgreementBase).length > 0){
			const cCiMrkValue = AgreementBase['ECargoBase.cCiMrk'];
      if(cCiMrkValue === "1"){
        setValue("ECargoBase.cCiInpTyp", '600001');
      }else if(cCiMrkValue === "2"){
        setValue("ECargoBase.cCiInpTyp", '600004');
      }else if(cCiMrkValue === "3"){
        setValue("ECargoBase.cCiInpTyp", '600001');
      }else if(cCiMrkValue === "4"){
        setValue("ECargoBase.cCiInpTyp", '600004');
      }else if(cCiMrkValue === "5"){
        setValue("ECargoBase.cCiInpTyp", '600005');
      }
    if (cCiMrkValue === "3" || cCiMrkValue === "4") {
      formconfig1.fromSchema?.forEach((item) => {
        const prop = item.prop;
        if (
          prop === "ECargoBase.cCiAgtNo" ||
          prop === "ECargoBase.nCiJntAmt" ||
          prop === "ECargoBase.nCiJntPrm" ||
          prop === "ECargoBase.nCiOwnAmt" ||
          prop === "ECargoBase.nCiOwnPrm" ||
          prop === "ECargoBase.cCiInpTyp" ||
          prop === "ECargoBase.cCiPriTyp" || 
          prop === "ECargoBase.cReceiptTitleNme" ||
          prop === "ECargoBase.cReceiptTitleCde"
        ) {
          item.hidden = false; // 显示共保字段
        } else {
          item.hidden = true; // 隐藏其他字段
        }
      });
      } else if (cCiMrkValue === "5" || cCiMrkValue === "6") {
        formconfig1.fromSchema?.forEach((item) => {
          const prop = item.prop;
          if (
            prop === "ECargoBase.cJiAgtNo" ||
            prop === "ECargoBase.nJiJntAmt" ||
            prop === "ECargoBase.nJiJntPrm" ||
            prop === "ECargoBase.nCiOwnPrm" ||
            prop === "ECargoBase.cCiInpTyp" ||
            prop === "ECargoBase.cCiPriTyp" || 
            prop === "ECargoBase.cReceiptTitleNme" ||
            prop === "ECargoBase.cReceiptTitleCde"
          ) {
            item.hidden = false; // 显示联保字段
          } else {
            item.hidden = true; // 隐藏其他字段
          }
        });
      }else if(cCiMrkValue === "1" || cCiMrkValue ==="2"){
        formconfig1.fromSchema?.forEach((item)=>{
          item.hidden = false;
        })
      }
		}
    
  })
// 绑定方法
const method = {
  // func demo
  func1: () => {},
    cJiAgtNoChange: (val) => {
    const isPositiveInteger = /^[A-Za-z0-9]+$/.test(val); // 是否为正整数（不含小数点、负号）
    const isValidLength = val.length <= 20;      // 长度不超过20

    if (!isPositiveInteger || !isValidLength) {
      ElMessage.error("请输入不超过20位的正整数和英文字母");
      // 清空当前字段的值
      tgtobjEditRef.value?.setValue("ECargoBase.cJiAgtNo", "");
    }
  },
  cCiAgtNoChange: (val) => {
    const isPositiveInteger = /^[A-Za-z0-9]+$/.test(val); // 是否为正整数（不含小数点、负号）
    const isValidLength = val.length <= 25;      // 长度不超过20
    if (!isPositiveInteger || !isValidLength) {
      ElMessage.error("请输入不超过25位的正整数和英文字母");
      // 清空当前字段的值
      tgtobjEditRef.value?.setValue("ECargoBase.cCiAgtNo", "");
    }
  },
  cReceiTitleCdeChange:(val)=>{
    if(val === '3127001'){
      setFormItem("ECargoBase.cReceiptTitleNme", {disabled: true})
      setValue("ECargoBase.cReceiptTitleNme","")
    }else{
      setFormItem("ECargoBase.cReceiptTitleNme", {disabled: false})
    }
  },
};

// 绑定特殊验证器
const exRules = {};

function getFormValue() {
  return tgtobjEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  tgtobjEditRef?.value?.setFormValue(value);
}

function validate() {
  return tgtobjEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  tgtobjEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return tgtobjEditRef?.value?.getValue(key);
}
function getFormConfig(){
  return formconfig1;
}
function getFormBtn() {
  return tgtobjEditRef?.value?.getFormBtn();
}
function setDisabledAll(isDisabled: boolean) {
  tgtobjEditRef?.value?.setDisabledAll(isDisabled);
  const formBtn = getFormBtn();
  if(formBtn && Object.keys(formBtn).length > 0) {
    Object.keys(formBtn).forEach((key: any) => {formBtn[key].hidden = isDisabled;})
  }
}
const setFormItem = (key, obj) => {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.loadData && obj.loadData) {
          let newBtnItems = null;
          if (obj.loadData.length != 0) {
            for (let key in obj.loadData) {
              item.loadData[key] = obj.loadData[key];
            }
          } else {
            item.loadData = obj.loadData;
          }
          newBtnItems = item.loadData;
          newBtnItems && (obj.loadData = newBtnItems);
        }
        Object.assign(item, obj);
      }
    });
  }
}
defineExpose({
  getFormValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormConfig,
  getFormBtn,
  setDisabledAll
});
</script>

<style scoped></style>

<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="tgtobjEditRef" />
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
import { useProductStore } from "@/store/modules/prod";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const productStore = useProductStore();
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
  compKey: {
    type: String,
    required: false,
  },
});
// 监听 cCiMrk 的变化并更新本地变量
watchEffect(() => {
  const cCiMrkValue = opertaor.getTableRefByKey("plyBase")?.getValue("Base.cCiMrk");
    if(cCiMrkValue === "1"){
        setValue("Base.cCiInpTyp", '600001');
      }else if(cCiMrkValue === "2"){
        setValue("Base.cCiInpTyp", '600004');
      }else if(cCiMrkValue === "3"){
        setValue("Base.cCiInpTyp", '600001');
      }else if(cCiMrkValue === "4"){
        setValue("Base.cCiInpTyp", '600004');
      }else if(cCiMrkValue === "5"){
        setValue("Base.cCiInpTyp", '600005');
      }
    if (cCiMrkValue === "3" || cCiMrkValue === "4") {
      formconfig1.fromSchema?.forEach((item) => {
        const prop = item.prop;
        if (
          prop === "Base.cCiAgtNo" ||
          prop === "Base.nCiJntAmt" ||
          prop === "Base.nCiJntPrm" ||
          prop === "Base.nCiOwnAmt" ||
          prop === "Base.nCiOwnPrm" ||
          prop === "Base.cCiInpTyp" ||
          prop === "Base.cCiPriTyp" || 
          prop === "Base.cReceiptTitleNme" ||
          prop === "Base.cReceiptTitleCde"
        ) {
          item.hidden = false; // 显示共保字段
        } else {
          item.hidden = true; // 隐藏其他字段
        }
      });
      } else if (cCiMrkValue === "5") {
        formconfig1.fromSchema?.forEach((item) => {
          const prop = item.prop;
          if (
            prop === "Base.cJiAgtNo" ||
            prop === "Base.nJiJntAmt" ||
            prop === "Base.nJiJntPrm" ||
            prop === "Base.nCiOwnPrm" ||
            prop === "Base.cCiInpTyp" ||
            prop === "Base.cCiPriTyp" || 
            prop === "Base.cReceiptTitleNme" ||
            prop === "Base.cReceiptTitleCde"
          ) {
            item.hidden = false; // 显示联保字段
          } else {
            item.hidden = true; // 隐藏其他字段
          }
        });
      }else if(cCiMrkValue === "1" || cCiMrkValue ==="2" || cCiMrkValue ==="6"){
        formconfig1.fromSchema?.forEach((item)=>{
          item.hidden = false;
        })
      }
    
});

const tgtobjEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));

onMounted(() => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
});

// 绑定方法
const method = {
  // func demo
  func1: () => {},
  cJiAgtNoChange: (val) => {
    const isPositiveInteger = /^\d+$/.test(val); // 是否为正整数（不含小数点、负号）
    const isValidLength = val.length <= 20;      // 长度不超过20

    if (!isPositiveInteger || !isValidLength) {
      ElMessage.error("请输入不超过20位的正整数");
      // 清空当前字段的值
      tgtobjEditRef.value?.setValue("Base.cJiAgtNo", "");
    }
  },
  cCiAgtNoChange: (val) => {
    const isPositiveInteger = /^\d+$/.test(val); // 是否为正整数（不含小数点、负号）
    const isValidLength = val.length <= 20;      // 长度不超过20
    if (!isPositiveInteger || !isValidLength) {
      ElMessage.error("请输入不超过20位的正整数");
      // 清空当前字段的值
      tgtobjEditRef.value?.setValue("Base.cCiAgtNo", "");
    }
  },
  cReceiTitleCdeChange:(val)=>{
    if(val === '3127001'){
      setFormItem("Base.cReceiptTitleNme", {disabled: true})
    }else{
      setFormItem("Base.cReceiptTitleNme", {disabled: false})
    }
  },
};
// 绑定特殊验证器
const exRules = {};

function getFromValue() {
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
function getFormconfig(){
  return formconfig1;
}
function addProvide<T>(key: InjectionKey<T> | string, value: T)  {
  tgtobjEditRef?.value?.addProvide(key, value);
}
defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig,
  addProvide
});
</script>

<style scoped></style>

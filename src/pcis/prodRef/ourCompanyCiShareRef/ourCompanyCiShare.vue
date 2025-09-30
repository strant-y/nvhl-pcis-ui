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
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
import { useProductStore } from "@/store/modules/prod";
import { set } from "lodash";
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
// Base.nCiJntAmt  //共保总保额
// Base.nCiJntPrm  共保总保费
// Base.nJiJntAmt  联保总保额
// Base.nJiJntPrm  联保总保费
const tgtobjEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));

onMounted(() => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
  // const cCiMrk = (opertaor.getTableRefByKey("plyBase")).getValue("Base.cCiMrk");
  watchEffect(() => {
    const cCiMrk = (opertaor.getTableRefByKey("plyBase")).getValue("Base.cCiMrk");
    if(cCiMrk === "1"){
      setValue("Base.cCiInpTyp", '600001');
    }else if(cCiMrk === "2"){
      setValue("Base.cCiInpTyp", '600004');
    }else if(cCiMrk === "3"){
      setValue("Base.cCiInpTyp", '600001');
    }else if(cCiMrk === "4"){
      setValue("Base.cCiInpTyp", '600004');
    }else if(cCiMrk === "5"){
      setValue("Base.cCiInpTyp", '600005');
    }
  })
});

// 绑定方法
const method = {
  // func demo
  func1: () => {},
  cReceiTitleCdeChange:(val)=>{
    if(val === '3127001'){
      setFormItem("Base.cReceiptTitleNme", {disabled: true})
    }else{
      setFormItem("Base.cReceiptTitleNme", {disabled: false})
    }
  },
};
//给表单下拉项赋值
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

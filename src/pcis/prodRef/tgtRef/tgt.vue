<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="tgtEditRef" />
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useProductStore } from "@/store/modules/prod";
import { rule } from "postcss";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const opertaor = dataOpertaor();
const productStore = useProductStore()

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const tgtEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));
onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
  nextTick(() => {
    //设置是否单项工程默认值：是
    setValue("Tgt.cIsSingle", '1')
  })
});

// 绑定方法
const method = {
  // func demo
  func1: () => {
    console.log(getRules);
  },
  //投保乘客座位总数改变事件
  changenTotalInsured: () => {
    setValue("Tgt.nSeatCapacity",Number(getValue("Tgt.nTotalInsured"))+Number(getValue("Tgt.nInsuredcompanySeats")))
  },
 //投保司乘人员座位总数改变事件
  changenInsuredcompanySeats: () => {
    setValue("Tgt.nSeatCapacity",Number(getValue("Tgt.nTotalInsured"))+Number(getValue("Tgt.nInsuredcompanySeats")))
  },
  //是否单项工程change事件
  cIsSingleFunc: (val) => {
    if(val == '1') {
      let obj = {
        rules: [getRules("required", {})],
        hidden: false
      }
      singChange(obj)
    } else {
      let obj = {
        rules: null,
        hidden: true
      }
      singChange(obj)
    }
    //把数据存在store，清单信息组件的是否必填根据这个来
    productStore.setCIsSingle(val)
  },
  funcInsuranceChange: ()=>{
    const cvrgref = opertaor.getTableRefByKey("cvrg");
    if(cvrgref.showFlush){
      cvrgref.showFlush();
    }
  },
  cDeterminingChange:()=>{
    const cvrgref = opertaor.getTableRefByKey("cvrg");
    if(cvrgref.showFlush){
      cvrgref.showFlush();
    }
  }
};

function singChange(obj) {
  setFormItem("Tgt.cProjectName", obj) //工程名称
  setFormItem("Tgt.nTotalCost", obj) //工程总造价 （元）
  setFormItem("Tgt.nTotalDesign", obj) //设计总价（元）
  setFormItem("Tgt.cProjectAddress", obj) //工程地址
  setFormValue({
    'Tgt.cProjectName': '',
    'Tgt.nTotalCost': '',
    'Tgt.nTotalDesign': '',
    'Tgt.cProjectAddress': '',
  })
}

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return tgtEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  tgtEditRef?.value?.setFormValue(value);
}

function validate() {
  return tgtEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  tgtEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return tgtEditRef?.value?.getValue(key);
}

//给表单下拉项赋值
function setFormItem(key, obj) {
    if (obj && Object.keys(obj).length) {
        formconfig1.fromSchema?.forEach(item => {
            if (item.prop === key) {
                Object.assign(item, obj)
            }
        })
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
  getFormconfig,
});
</script>

<style scoped></style>

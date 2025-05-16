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
const amlExtendInfo = defineAsyncComponent(
  () => import("@/views/comprehensive-query/modal/wages-info-model.vue")
);

import { useDzModal } from "@/common/dzmodel/DzModalService";
import moment from "moment";
const dzmodal = useDzModal();
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
    setValue("Tgt.nSeatCapacity", Number(getValue("Tgt.nTotalInsured")) + Number(getValue("Tgt.nInsuredcompanySeats")))
  },
  //投保司乘人员座位总数改变事件
  changenInsuredcompanySeats: () => {
    setValue("Tgt.nSeatCapacity", Number(getValue("Tgt.nTotalInsured")) + Number(getValue("Tgt.nInsuredcompanySeats")))
  },
  //是否单项工程change事件
  cIsSingleFunc: (val) => {
    if (val == '1') {
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
  funcInsuranceChange: () => {

    //根据投保方式得选择对应控制必填项
    if (getValue("Tgt.cInsuranceMethod") == '613002') {
      setFormItem("Tgt.nEngineeringCost", {
        rules: [getRules("required", { blur: true })],
      });
      setFormItem("Tgt.nProjectArea", { rules: null });
      setFormItem("Tgt.nLaborPrice", { rules: null });
    } else if (getValue("Tgt.cInsuranceMethod") == '613003') {
      setFormItem("Tgt.nEngineeringCost", { rules: null });
      setFormItem("Tgt.nProjectArea", {
        rules: [getRules("required", { blur: true })],
      });
      setFormItem("Tgt.nLaborPrice", { rules: null });
    } else if (getValue("Tgt.cInsuranceMethod") == '613004') {
      setFormItem("Tgt.nEngineeringCost", { rules: null });
      setFormItem("Tgt.nProjectArea", { rules: null });
      setFormItem("Tgt.nLaborPrice", {
        rules: [getRules("required", { blur: true })],
      });
    }
    const cvrgref = opertaor.getTableRefByKey("cvrg");
    if (cvrgref.showFlush) {
      cvrgref.showFlush();
    }
  },
  cDeterminingChange: () => {
    const cvrgref = opertaor.getTableRefByKey("cvrg");
    if (cvrgref.showFlush) {
      cvrgref.showFlush();
    }
  },
  wagesInfoBtn: () => {
    console.log('按钮 工资总额')
    dzmodal
      .open(amlExtendInfo, {})
      .then((res: any) => {
        if (res.type === "ok") {
        }
      });
  },
  // 工程造价
  nEngineeringCostChange: (val) => {
    console.log(val)
    if (val) {

      setFormItem('Tgt.nLaborPrice', {
        rules: null
      })

      setFormItem('Tgt.nProjectArea', {
        rules: null,
      })
      setFormItem('Tgt.nEngineeringCost', {
        rules: [getRules("required", {})],
      })
    }
  },
  // 工程面积(㎡)
  nProjectAreaChange: (val) => {
    console.log(val)
    if (val) {

      setFormItem('Tgt.nLaborPrice', {
        rules:null
      })

      setFormItem('Tgt.nProjectArea', {
        rules:  [getRules("required", {})],
      })
      setFormItem('Tgt.nEngineeringCost', {
        rules: null,
      })
    }
  },
  // 劳务分包合同价格（元）
  nLaborPriceChange: (val) => {
    console.log(val)
    if (val) {

      setFormItem('Tgt.nLaborPrice', {
        rules: [getRules("required", {})],
      })

      setFormItem('Tgt.nProjectArea', {
        rules: null,
      })
      setFormItem('Tgt.nEngineeringCost', {
        rules: null,
      })
    }


  },
  // 是否含隧道
  cIncludeBridgesChange:(val)=>{
    console.log(val)
    if(val ==1){
      setFormItem('Tgt.nBridgeProportion', {
        rules: [getRules("required", {})],
      })
      setFormItem('Tgt.nTunnelProportion', {
        rules: [getRules("required", {})],
      })
    }else{
      setFormItem('Tgt.nBridgeProportion', {
        rules: null,
      })
      setFormItem('Tgt.nTunnelProportion', {
        rules:null,
      })
    }
  },
  // 计划开工日期
  tPlannedDateChange:(v)=>{
    const start = getValue("Tgt.tPlannedDate");
    const end = getValue("Tgt.tPlannedCompletion");
    const tm = moment(end).diff(moment(v), "days"); 
    if (!end || !v) {
      return;
    }
    if (tm < 0) {
      ElMessage.warning("竣工日期不能小于开工日期");
      setFormValue({
        "Tgt.tPlannedDate": null,
      });
      return;
    }
    setFormValue({
      "Tgt.nContractDuration": tm,
    })

  },
  // 计划竣工日期 
  tPlannedCompletionChange:(v)=>{
    const start = getValue("Tgt.tPlannedDate");
    const end = getValue("Tgt.tPlannedCompletion");
    if (!start || !v) {
      return;
    }
    const tm = moment(v).diff(moment(start), "days");
    if (tm < 0) {
      ElMessage.warning("竣工日期不能小于开工日期");
      setFormValue({
        "Tgt.tPlannedCompletion": null,
      });
      return;
    }
    setFormValue({
      "Tgt.nContractDuration": tm,
    });
  },
  // 核定座位总数
  nSeatsNumberChange:(v)=>{
    // Tgt.nSeatsNumber 核定总数
    // Tgt.nSeatCapacity 投保总数
    // const start = getValue("Tgt.tPlannedDate");
    const nSeatCapacity = getValue("Tgt.nSeatCapacity");
    console.log( v, nSeatCapacity)
    if(v !== nSeatCapacity){
      ElMessage.warning("核定座位总数和投保座位数总数不一致！");
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

<style scoped></style>

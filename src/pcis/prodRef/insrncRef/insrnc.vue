<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="insrncEditRef" /> 
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import moment from "moment";
import dayjs from "dayjs";
import { useValidator } from "@/typings/useValidator";
import { formatDate } from "@/utils/date";
import { transpileModule } from "typescript";
import { policyRatio } from "@/api/query";
import { useRoute } from "vue-router";
const route = useRoute();
const { getRules } = useValidator();
const opertaor = dataOpertaor();
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const insrncEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive(createAppFreeEditConfig({}));
onMounted(() => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
  if(route.params.param.cRsnCde == "M1") {
    // 如果批改原因是免费延期，保险止期可以修改
    setFormItem("Base.tInsrncEndTm", { disabled: false });
  }
});

// 根据时间更改 短期费率系数 接口
const nRatioCoefFunc = ()=>{
    const tabref = opertaor.getTableRefs();
    const baseBefore = tabref["insrnc"].getFromValue();
    const baseBefore2 = tabref["base"].getFromValue();
    let prodNo = route.params.param.cProdNo; 

    let param = {
      bgnTm: baseBefore["Base.tInsrncBgnTm"],
      endTm: baseBefore["Base.tInsrncEndTm"],
      prodNo,
      ratioType:baseBefore2['Base.cRatioTyp']
    }
    policyRatio(param).then((res: any) => {
      const { code, data, msg } = res;      
      if (code === 200) {
        opertaor.getTableRefByKey('base').setValue('Base.nRatioCoef',Number(data).toFixed(6))
        }
    });
  };

// 绑定方法
const method = {
  // func demo
  func1: () => {
  
  },
  tInsrncBgnTmDisabled:(date:any)=>{ 
    const fs = insrncEditRef?.value?.getFromValue();
    if(fs){
      const startDate = new Date(fs["Base.tInsrncBgnTm"])   // 开始时间   1
      const maxDate = new Date(startDate);  // 创建开始时间副本   365 
      maxDate.setDate(startDate.getDate() + 365);  // 设置为今天起365天后的日期
      return  date.getTime() < startDate.getTime() || date.getTime() > maxDate.getTime()
    }else{
        return true;
    }
  },
  bgnTmFn: (v) => {   
 
    const tabref = opertaor.getTableRefs();
    const baseBefore = tabref["insrnc"].getFromValue();
    const tm = moment(baseBefore["Base.tInsrncEndTm"]).diff(moment(v), "days");  
    baseBefore["Base.cTmSysCde"] = tm;
    let startDate = new Date(baseBefore["Base.tInsrncBgnTm"])   // 开始时间
    let maxDate = new Date(startDate);  // 创建开始时间副本
    maxDate.setDate(startDate.getDate() + 365);  // 设置为今天起365天后的日期
    maxDate.setSeconds(maxDate.getSeconds() - 1);
    baseBefore["Base.tInsrncEndTm"] = formatDate(maxDate,'yyyy-MM-dd HH:mm:ss')
    setFormValue(baseBefore);
    nRatioCoefFunc()
  },
  endTmFn: (v) => {
    const tabref = opertaor.getTableRefs();
    const baseBefore = tabref["insrnc"].getFromValue();
    const tm =   moment(v).add(1, 'second').diff(moment(baseBefore["Base.tInsrncBgnTm"]), "days");
    baseBefore["Base.cTmSysCde"] = tm;   // 列表里面的 保险
    opertaor.getFatherPage().setTmDay(tm)
    setFormValue(baseBefore);
    nRatioCoefFunc()

  },
  // 索赔基础名称change事件
  suopeiFunc: (val) => {
     const p = opertaor.getParam();
    if (!p.initFlag) {
      setFormItem("Base.tRunBgnTm", { disabled: false }); //追溯/日落起期
      setFormItem("Base.tRunEndTm", { disabled: false }); //追溯/日落止期
    }
    setFormItem("Base.tRunBgnTm", { rules: null }); //追溯/日落起期
    setFormItem("Base.tRunEndTm", { rules: null }); //追溯/日落止期
    
    setFormItem("Base.tReportBgnTm", { rules: null }); //延长报告期起始日期
    setFormItem("Base.tReportEndTm", { rules: null }); //延长报告期终止日期
    if (val == "0") {
      //内索赔制 时，追溯/日落起止期必填
      setFormItem("Base.tRunBgnTm", { rules: [getRules("required", {})] }); //追溯/日落起期
      setFormItem("Base.tRunEndTm", { rules: [getRules("required", {})] }); //追溯/日落止期
    } else if (val == "1") {
      //期内发生制时，报告起始、终止日期必填
      setFormItem("Base.tReportBgnTm", { rules: [getRules("required", {})] }); //延长报告期起始日期
      setFormItem("Base.tReportEndTm", { rules: [getRules("required", {})] }); //延长报告期终止日期
    }
    setValue("Base.isRetroSpect", "");
  },
  // 是否有追溯期/日落期 change事件
  isTermFunc: (val) => {
    if (val == "1") {
      //选择 是 且索赔基础名称为内索赔制 时，追溯/日落起止期必填
      // setFormItem("Base.tRunBgnTm", {
      //   rules: [getRules("required", {})],
      //   disabled: false,
      // }); //追溯/日落起期
      // setFormItem("Base.tRunEndTm", {
      //   rules: [getRules("required", {})],
      //   disabled: false,
      // }); //追溯/日落止期
    } else if (val == "0") {
      // setFormItem("Base.tRunBgnTm", { rules: null, disabled: true }); //追溯/日落起期
      // setFormItem("Base.tRunEndTm", { rules: null, disabled: true }); //追溯/日落止期
      setFormValue({
        "Base.tRunBgnTm": "",
        "Base.tRunEndTm": "",
        "Base.nTracingDays": "",
      });
    } else {
      //是否有追溯期/日落期没有值时, 且索赔基础名称为内索赔制 时，追溯/日落起止期必填
      if (getValue("Base.claimName") == "0") {
        setFormItem("Base.tRunBgnTm", { rules: [getRules("required", {})] }); //追溯/日落起期
        setFormItem("Base.tRunEndTm", { rules: [getRules("required", {})] }); //追溯/日落止期
      } else {
        setFormItem("Base.tRunBgnTm", { rules: null }); //追溯/日落起期
        setFormItem("Base.tRunEndTm", { rules: null }); //追溯/日落止期
      }
    }
  },
  // 追溯起期
  tRunBgnTmFn: (v) => {
    const start = getValue("Base.tRunBgnTm");
    const end = getValue("Base.tRunEndTm");
    if (!end || !v) {
      return;
    }
    const tm = moment(end).diff(moment(v), "days");
    if (tm < 0) {
      ElMessage.warning("追溯/日落止期不能小于追溯起期");
      setFormValue({
        "Base.tRunBgnTm": null,
      });
      return;
    }
    setFormValue({
      "Base.nTracingDays": tm,
    });
  },
  // 追溯止期
  tRunEndTmFn: (v) => {
    const start = getValue("Base.tRunBgnTm");
    const end = getValue("Base.tRunEndTm");
    const tInsrncBgnTm = getValue('Base.tInsrncBgnTm');  // 保险起期
    if (!start || !v) {
      return;
    }
 
    const tm = moment(v).diff(moment(start), "days");
    // const traceTime = moment(v).diff(moment(tInsrncBgnTm), "days")
    const traceTime = moment(tInsrncBgnTm).diff(moment(v), "seconds")
 
    if (tm < 0) {
      ElMessage.warning("追溯/日落止期不能小于追溯起期");
      setFormValue({
        "Base.tRunEndTm": null,
      });
      return;
    }
 
    //校验追溯时间
    if (traceTime < 0) {
      ElMessage.warning("追溯期的止期|须早于保险起期！");
      setFormValue({
        "Base.tRunEndTm": null,
      });
      return;
    }



    const formattedDate = moment(v).format('YYYY-MM-DD') + ' 23:59:59';
 
    setFormValue({
      "Base.nTracingDays": tm,
      "Base.tRunEndTm": formattedDate, // 更新日期字段
    });
  },
  reportBgnTmFn: (v:any) => {
    const start = getValue("Base.tReportBgnTm");
    const end = getValue("Base.tReportEndTm");
    if (!end || !v) {
      return;
    }
    const tm = moment(end).diff(moment(v), "days");
    if (tm < 0) {
      ElMessage.warning("终止日期不能小于起始日期");
      setFormValue({
        "Base.tReportBgnTm": null,
      });
      return;
    }
    setFormValue({
      "Base.nReportDays": tm,
    });
  },
  // 延长报告期止期
  reportEndTmFn: (v:any) => {
    const start = getValue("Base.tReportBgnTm");
    const end = getValue("Base.tReportEndTm");
    if (!start || !v) {
      return;
    }
    const tm = moment(v).diff(moment(start), "days");
    if (tm < 0) {
      ElMessage.warning("终止日期不能小于起始日期");
      setFormValue({
        "Base.tReportEndTm": null,
      });
      return;
    }
    const formatReportEnd = moment(v).format('YYYY-MM-DD') + ' 23:59:59';
    setFormValue({
      "Base.nReportDays": tm,
      "Base.tReportEndTm":formatReportEnd,
    });
  },
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return insrncEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  insrncEditRef?.value?.setFormValue(value);
}

function validate() {
  return insrncEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  insrncEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return insrncEditRef?.value?.getValue(key);
}

//给表单赋值
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

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
  compKey: {
    type: String,
    required: false,
  },
});

const insrncEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive(createAppFreeEditConfig({}));
const tInsrncEndTm = ref(null);
onMounted(() => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
});

// 根据时间更改 短期费率系数 接口
const nRatioCoefFunc = () => {
  const tabref = opertaor.getTableRefs();
  const baseBefore = tabref["insrnc"].getFromValue();
  const baseBefore2 = tabref["base"].getFromValue();
  let prodNo = route.params.param.cProdNo;

  let param = {
    bgnTm: baseBefore["Base.tInsrncBgnTm"],
    endTm: baseBefore["Base.tInsrncEndTm"],
    prodNo,
    ratioType: baseBefore2['Base.cRatioTyp']
  }
  policyRatio(param).then((res: any) => {
    const { code, data, msg } = res;
    if (code === 200) {
      opertaor.getTableRefByKey('base').setValue('Base.nRatioCoef', Number(data).toFixed(6))
    }
  });
};

// 绑定方法
const method = {
  // func demo
  func1: () => {

  },
  // 开始时间处理  不能小于结束时间
  tInsrncBgnTmDisabled: (date: any) => {
    const fs = insrncEditRef?.value?.getFromValue();
    if (fs) {
      const endDate = new Date(fs["Base.tInsrncEndTm"])   // 开始时间
      let minDate = dayjs(endDate).valueOf();
      if(route.params.param && route.params.param.cRsnCde && route.params.param.cRsnCde == "FZ") {
        // 如果批改原因是免费延期，当前保险止期日期之后的日期都可以选择
        return  date.getTime() > minDate
      } else {
        return   date.getTime() > minDate
      }
    }else{
        return true;
    }
  },
  // 结束时间禁止
  tInsrncEndTmDisabled: (date: any) => {
    const fs = insrncEditRef?.value?.getFromValue();
    if (fs) {
      const startDate = new Date(fs["Base.tInsrncBgnTm"])   // 开始时间   1
      let maxDate = dayjs(startDate).add(1,'year').valueOf();
      if(route.params.param && route.params.param.cRsnCde && route.params.param.cRsnCde == "FZ") {
        // 如果批改原因是免费延期，当前保险止期日期之后的日期都可以选择
        return  date.getTime() < maxDate
      } else {
        return  date.getTime() < startDate.getTime() 
        // || date.getTime() > maxDate
      }
    }else{
        return true;
    }
  },

  bgnTmFn: (v) => {
    const tabref = opertaor.getTableRefs();
    const baseBefore = tabref["insrnc"].getFromValue();
    let startDate = new Date(baseBefore["Base.tInsrncBgnTm"])   // 开始时间
    let endDate = baseBefore["Base.tInsrncEndTm"]  // 结束时间
    let day = dayjs(startDate).add(1,'year')
    let tm = null;

    if (!endDate) {
      tm = moment(day.format("YYYY-MM-DD HH:mm:ss")).diff(moment(v), "days");
      baseBefore["Base.tInsrncEndTm"] = day.add(-1,'second').format("YYYY-MM-DD HH:mm:ss")
    }else{
      tm =  moment(endDate).add(1, 'second').diff(moment(baseBefore["Base.tInsrncBgnTm"]), "days");
    }
    baseBefore["Base.cTmSysCde"] = tm;   // 列表时间
    setFormValue(baseBefore);
    nRatioCoefFunc()
  },
  endTmFn: (v) => {
    const tabref = opertaor.getTableRefs();
    const baseBefore = tabref["insrnc"].getFromValue();
    if(route.params.param.cRsnCde != "46") {
      // 如果批改原因是报停展期，保险止期延长报停起止期计算出的差值，保险期限维持不变
      const tm =   moment(v).add(1, 'second').diff(moment(baseBefore["Base.tInsrncBgnTm"]), "days");
      console.log('天',tm)
      baseBefore["Base.cTmSysCde"] = tm;   // 列表里面的 保险
      opertaor.getFatherPage().setTmDay(tm)
      setFormValue(baseBefore);
    }
    nRatioCoefFunc()
    // 如果批改原因是免费延期，根据保险止期的变化计算出延长天数
    if(route.params.param.cRsnCde == "FZ" && tInsrncEndTm.value) {
      const days =   moment(v).add(1, 'second').diff(moment(tInsrncEndTm.value), "days");
      opertaor.getFatherPage().setnDelayNum(days)
    }
    if(route.params.param.cRsnCde == "FZ" && !tInsrncEndTm.value) {
      tInsrncEndTm.value = baseBefore["Base.tInsrncEndTm"]
    }
  },
  // 索赔基础名称change事件
  suopeiFunc: (val) => {
    console.log(val)
    let cIsRetroSpect = getFromValue()['Base.cIsRetroSpect']      // 获取是否有追溯期/日期
    console.log(cIsRetroSpect)
    const p = opertaor.getParam();

    console.log('数据---‘',getFromValue())
    if (!p.initFlag) {
      // setFormItem("Base.tRunBgnTm", { disabled: false }); //追溯/日落起期
      // setFormItem("Base.tRunEndTm", { disabled: false }); //追溯/日落止期
    }
    setFormItem("Base.tReportBgnTm", { rules: null }); //延长报告期起始日期
    setFormItem("Base.tReportEndTm", { rules: null }); //延长报告期终止日期

    if (val == "0") {
      //内索赔制 时，追溯/日落起止期必填
      if (cIsRetroSpect !== '0') {
        setFormItem("Base.tRunBgnTm", { rules: [getRules("required", {})] }); //追溯/日落起期
        setFormItem("Base.tRunEndTm", { rules: [getRules("required", {})] }); //追溯/日落止期
      }
      
      // setValue('Base.nReportDays','')
      // setValue('Base.tRunBgnTm','')
      // setValue('Base.tRunEndTm','')



      setFormItem("Base.tRunBgnTm", { rules: [getRules("required", {})] }); //追溯/日落起期
      setFormItem("Base.tRunEndTm", { rules: [getRules("required", {})] }); //追溯/日落止期
      setFormItem("Base.tRunBgnTm", {  hidden: false  }); //追溯/日落起期
      setFormItem("Base.tRunEndTm", {  hidden: false  }); //追溯/日落止期
      setFormItem("Base.nTracingDays", {  hidden: false  }); //追溯/日落天数


      setFormItem("Base.tReportBgnTm", {  hidden: true  }); //延长报告期起始日期
      setFormItem("Base.tReportEndTm", {  hidden: true  }); //延长报告期终止日期
      setFormItem("Base.nReportDays", {  hidden: true  }); //延长报告期天数



    } else if (val == "1") {
      // setValue('Base.nTracingDays','')    
      // setValue("Base.tReportBgnTm",'')
      // setValue("Base.tReportEndTm",'')  
      if (cIsRetroSpect !== '0') {
        console.log('1212')
        setFormItem("Base.tRunBgnTm", { rules: null }); //追溯/日落起期
        setFormItem("Base.tRunEndTm", { rules: null }); //追溯/日落止期
      }

      //期内发生制时，报告起始、终止日期必填
      setFormItem("Base.tReportBgnTm", { rules: [getRules("required", {})] }); //延长报告期起始日期
      setFormItem("Base.tReportEndTm", { rules: [getRules("required", {})] }); //延长报告期终止日期
      setFormItem("Base.tRunBgnTm", {  hidden: true  }); //追溯/日落起期
      setFormItem("Base.tRunEndTm", {  hidden: true  }); //追溯/日落止期
      setFormItem("Base.nTracingDays", {  hidden: true  }); //追溯/日落天数

      setFormItem("Base.tReportBgnTm", {  hidden: false  }); //延长报告期起始日期
      setFormItem("Base.tReportEndTm", {  hidden: false  }); //延长报告期终止日期
      setFormItem("Base.nReportDays", {  hidden: false  }); //延长报告期天数
    }
    setValue("Base.isRetroSpect", "");
  },
  // 是否有追溯期/日落期 change事件
  isTermFunc: (val) => {
    let cIsRetroSpect = getFromValue()['Base.cClaimName']      // 索赔基础名称  0 期内索赔制
    if (val == "1") {
      //选择 是 且索赔基础名称为内索赔制 时，追溯/日落起止期必填  期内索赔制  放开并且必填
      if (cIsRetroSpect == '0') {
        setFormItem("Base.tRunBgnTm", { rules: [getRules("required", {})], disabled: false, }); //追溯/日落起期
        setFormItem("Base.tRunEndTm", { rules: [getRules("required", {})], disabled: false, }); //追溯/日落止期
      } else {
        setFormItem("Base.tRunBgnTm", { rules: [], disabled: false, }); //追溯/日落起期
        setFormItem("Base.tRunEndTm", { rules: [], disabled: false, }); //追溯/日落止期
      }
    } else if (val == "0") {
      setFormItem("Base.tRunBgnTm", { rules: [], disabled: true }); //追溯/日落起期
      setFormItem("Base.tRunEndTm", { rules: [], disabled: true }); //追溯/日落止期
      setFormValue({
        "Base.tRunBgnTm": "",
        "Base.tRunEndTm": "",
        "Base.nTracingDays": "",
      });
    } 
  },
  // 追溯起期
  tRunBgnTmFn: (v) => {

    const start = getValue("Base.tRunBgnTm");
    const end = getValue("Base.tRunEndTm");
    if (!end || !v) {
      return;
    }
    console.log(moment(start),moment(start),moment(end))
    const tmDay = moment(end).diff(moment(start), "days");
    const tm = moment(end).diff(moment(start), "seconds")
    console.log(tm,tmDay)
    if (tm < 0) {
      ElMessage.warning("追溯/日落止期不能小于追溯起期");
      setFormValue({
        "Base.tRunBgnTm": null,
      });
      return;
    }
    setFormValue({

      "Base.nTracingDays":   moment(end).add(1,'second').diff(moment(start), "days"),
      // "Base.nTracingDays":  moment(end).add(1,'second').diff(moment(start), "days")
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

    const startTime = moment(v).diff(moment(start), "days");
    // console.log(traceTime)
    if (startTime < 0) {
      ElMessage.warning("追溯/日落止期不能小于追溯起期");
      setFormValue({
        "Base.tRunEndTm": null,
      });
      return;
    }

        const traceTime = moment(tInsrncBgnTm).diff(moment(v), "seconds")
    //校验追溯时间
    if (traceTime < 0) {
      ElMessage.warning("追溯期的止期|须早于保险起期！");
      setFormValue({
        "Base.tRunEndTm": null,
        "Base.nTracingDays":null
      });
      return;
    }



    const formattedDate = moment(v).format('YYYY-MM-DD') + ' 23:59:59';

    setFormValue({
      "Base.nTracingDays": moment(formattedDate).add(1,'second').diff(moment(start), "days"),
      "Base.tRunEndTm": formattedDate, // 更新日期字段
    });
  },
  reportBgnTmFn: (v: any) => {
    const start = getValue("Base.tReportBgnTm");
    const end = getValue("Base.tReportEndTm");
    if (!end || !v) {
      return;
    }
    const tm = moment(end).add(1,'second').diff(moment(v), "days");
    if (tm < 0) {
      ElMessage.warning("终止日期不能小于起始日期");
      setFormValue({
        "Base.tReportBgnTm": null,
        "Base.nTracingDays":null
      });
      return;
    }
    setFormValue({
      "Base.nReportDays": tm,
    });
  },
  // 延长报告期止期
  reportEndTmFn: (v: any) => {
    const start = getValue("Base.tReportBgnTm");
    const end = getValue("Base.tReportEndTm");
    if (!start || !v) {
      return;
    }
    const tm = moment(end).add(1,'second').diff(moment(start), "days");
    if (tm < 0) {
      ElMessage.warning("终止日期不能小于起始日期");
      setFormValue({
        "Base.tReportEndTm": null,
      });
      return;
    }
    const formatReportEnd  =   moment(v).format("YYYY-MM-DD 23:59:59");
    setFormValue({
      "Base.nReportDays": moment(formatReportEnd).add(1,'second').diff(moment(start), "days"),
      "Base.tReportEndTm": formatReportEnd,
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
        } else {
          Object.assign(item, obj);
        }
      }
    });
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
  getFormconfig
});
</script>

<style scoped></style>

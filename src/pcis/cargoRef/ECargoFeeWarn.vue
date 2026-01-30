<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="applicantEditRef" />
  <comDialog ref="dialog"></comDialog>
  <input
      type="file"
      ref="fileInputRef"
      style="display: none"
      @change="handleFileChange"
  />
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { codeListViewStore } from "@/store";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { qryCustomer } from "@/api/query";

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const dialog = ref<DialogMethod | null>(null);
const idxParam = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const formPage = idxParam?.formPage;
const param = idxParam?.param;

const applicantEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive(createAppFreeEditConfig({}));
const formData = ref<any[]>([]);
const cClntAddr = ref<any>(null);
const fileInputRef = ref(null);
const fileInputType = ref();
import { readFile } from "@/api/file";
import {idxParamKey, useIdxParam} from "@/views/pcis/support/useIdxParam";
const tCertfDate = ref<any[]>([]);
const initFlag = computed(() => param?.type ==='add' ? false : formPage.init && mountedFlag.value === false);
const mountedFlag = ref(false);
onMounted(() => {
  const formconfig11 = formInit(
      JSON.stringify(props.pageSchema),
      method,
      getRules
  );
  Object.assign(formconfig1, formconfig11);
  nextTick(() => {
    if(!getValue('ECargoBase.cWhInsExchCde')){
      setValue('ECargoBase.cWhInsExchCde','1')
    }
    if(!getValue('ECargoBase.cWhPremExchCde')){
      setValue('ECargoBase.cWhPremExchCde','1')
    }
    if(!getValue('ECargoBase.cPayWay')){
      setValue('ECargoBase.cPayWay','01')
    }
    const list:Array<string>= ["ECargoBase.nRecRemPrmVar","ECargoBase.nRecRemEstAmtVar","ECargoBase.nAmtRmbExch","ECargoBase.cInsExchCde", "ECargoBase.nPrmRmbExch","ECargoBase.cPremExchCde",'ECargoBase.nWhPrmRmbExch','ECargoBase.nWhAmtRmbExch']
     list.forEach(item =>{
       setFormItem(item, {
         hidden: true,
       });
     })
     if(param.cEdrFlag =='AY'){
       setFormItem('ECargoBase.nLowPrm', {hidden: true});
       setFormItem('ECargoBase.nReceivedPrmEx', {hidden: true});
     }
     else{
       setFormItem('ECargoBase.nLowPrm', {hidden: false});
       setFormItem('ECargoBase.nReceivedPrmEx', {hidden: false});
     }
    //  付费约定设置默认一次结清且不可编辑
    setFormItem('ECargoBase.cInstMrk', {disabled: true});
    setValue('ECargoBase.cInstMrk', "0");
    //  缴费期数默认1且不可编辑
    setFormItem('ECargoBase.nPayNum', {btnItems: {disabled: true}})
    setValue('ECargoBase.nPayNum', 1);
    // 初始化加载完成标识
    mountedFlag.value = true;
  });
});

//  根据 客户名称 / 被保人性质/ 证件类型 / 证件号码 获取客户信息
const checkUser = () => {
  if (param.cRecordType !== 1) {
    return false;
  }
  const applicantValue = formPage.getFormDataById('applicant')
//  只要4个有值 去请求客户信息
  if (
      applicantValue["Applicant.cAppNme"]&&
      applicantValue["Applicant.cClntMrk"] !== null &&
      applicantValue["Applicant.cCertfCde"] &&
      applicantValue["Applicant.cCertfCls"]
  ) {
    const param = {
      coustName: applicantValue["Applicant.cAppNme"],
      coustMrk: applicantValue["Applicant.cClntMrk"],
      coustType:applicantValue["Applicant.cCertfCls"],
      coustCode: applicantValue["Applicant.cCertfCde"],
      personnelType:"Applicant"
    }
    qryCustomer(param)
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
            if(data){
              formPage.setFormDataById('applicant', data[0])
            }
          } else {
            // ElMessage.error(msg);
          }
        })
        .finally(() => {});
  }
};

function handleFileChange() {

}

// 绑定方法
const method = {
  cPayWayChange:(val:any)=>{
    if(initFlag.value) return
    const list:Array<string>= ["ECargoBase.nLowPrm","ECargoBase.nReceivedPrmEx","ECargoBase.nReceivedPrm","ECargoBase.cReceivedRmb","ECargoBase.nReceivedRate","ECargoBase.nRmbReceivedPrm"]
    if(val !== '01'){
      // setFormItem('ECargoBase.nReceivedPrmEx',{rules: null })
      if(getValue('ECargoBase.nRmbAmt')){
        setValue('ECargoBase.nRecRemEstAmt',getValue('ECargoBase.nRmbAmt'))
      }
      if(getValue('ECargoBase.nRmbPrm')){
        setValue('ECargoBase.nRecRemPrm',getValue('ECargoBase.nRmbPrm') - (getValue('ECargoBase.nWhRmbPrm') || 0))
      }
      list.forEach(item => {
        setFormItem(item, {
          hidden: true,
        });
      })
    }else {
      // setFormItem('ECargoBase.nReceivedPrmEx',{ rules: [getRules("required", {})] })
      if(getValue('ECargoBase.nRmbAmt')){
        setValue('ECargoBase.nRecRemEstAmt',getValue('ECargoBase.nRmbAmt'))
      }
      if(getValue('ECargoBase.nRmbReceivedPrm')){
        setValue('ECargoBase.nRecRemPrm',getValue('ECargoBase.nRmbReceivedPrm') - (getValue('ECargoBase.nWhRmbPrm') || 0))
      }
      list.forEach(item => {
        setFormItem(item, {
          hidden: false,
        });
      })
    }
  },
  cReceivedRmbChange:(val:any)=>{
    console.log('param',initFlag.value)
    if(initFlag.value) return
    if (val !== "CNY") {
      codeListStore
          .queryCodeList({
            codeListName: "WEB_BAS_CHGRATE",
            codeListParam: { value: val },
          })
          .then((res) => {
            setValue('ECargoBase.nReceivedRate',res[0].currency_rate)
            setValue('ECargoBase.nRmbReceivedPrm',getValue('ECargoBase.nReceivedPrm') * res[0].currency_rate)
            // 协议剩余预收保费（人民币）
            if(getValue('ECargoBase.cPayWay') && getValue('ECargoBase.cPayWay') === '01'){
              setValue('ECargoBase.nWhPrmRmbExch',res[0].currency_rate)
              setValue('ECargoBase.cWhPrmCur',val)
              setValue('ECargoBase.nWhAmtRmbExch',res[0].currency_rate)
              setValue('ECargoBase.cWhAmtCur',val)
              setValue('ECargoBase.nRecRemPrm',getValue('ECargoBase.nRmbReceivedPrm')- (getValue('ECargoBase.nWhRmbPrm') || 0))
            }
          });
    } else {
      setValue('ECargoBase.nReceivedRate',"1.000000")
      setValue('ECargoBase.nRmbReceivedPrm',getValue('ECargoBase.nReceivedPrm') * 1)
      // 协议剩余预收保费（人民币）
      const agreementBaseRef = formPage?.getComponentRefById('AgreementBase')
      if(getValue('ECargoBase.cPayWay') && getValue('ECargoBase.cPayWay') === '01'){
        setValue('ECargoBase.nWhPrmRmbExch',"1.000000")
        setValue('ECargoBase.cWhPrmCur',val)
        setValue('ECargoBase.nWhAmtRmbExch',"1.000000")
        setValue('ECargoBase.cWhAmtCur',val)
        setValue('ECargoBase.nRecRemPrm',getValue('ECargoBase.nRmbReceivedPrm')- (getValue('ECargoBase.nWhRmbPrm') || 0))
      }
    }
  },
  nReceivedPrmChange:(val:any,data:any)=>{
    if(initFlag.value) return
     const nReceivedPrm =  sessionStorage.getItem("nReceivedPrm") ? JSON.parse(sessionStorage.getItem("nReceivedPrm") || '') : ''
    // props.type === 'EDR_APP_NEW_SCENE'
    if(nReceivedPrm['ECargoBase.nReceivedPrm'] && param?.cEdrType && param?.cEdrType == '1'){
     if(nReceivedPrm['ECargoBase.nReceivedPrm'] > val){
       ElMessage.error("预收保费不能小于原保费!");
       setValue('ECargoBase.nReceivedPrm',nReceivedPrm['ECargoBase.nReceivedPrm'])
       return
     }
    }
    if(val && getValue('ECargoBase.nReceivedRate')){
      setValue('ECargoBase.nRmbReceivedPrm',val * getValue('ECargoBase.nReceivedRate'))
      // 协议剩余预收保费（人民币）
      if(getValue('ECargoBase.cPayWay') && getValue('ECargoBase.cPayWay') === '01'){
        setValue('ECargoBase.nRecRemPrm',getValue('ECargoBase.nRmbReceivedPrm')- (getValue('ECargoBase.nWhRmbPrm') || 0))
      }
    }
    // 折人民币协议预收保费
    setValue('ECargoBase.nRmbReceivedPrm', val * getValue('ECargoBase.nReceivedRate'))
  },
  nWhAmtChange:(val:any)=>{
    if(initFlag.value) return
    if(val && getValue('ECargoBase.nWhAmtRmbExch')){
      setValue('ECargoBase.nWhRmbAmt',val * getValue('ECargoBase.nWhAmtRmbExch'))
      if(getValue('ECargoBase.nRmbAmt')){
         setValue('ECargoBase.nRecRemEstAmt',getValue('ECargoBase.nRmbAmt') - (getValue('ECargoBase.nWhRmbAmt') || 0) )
      }
    }
  },
  cWhAmtCurChange:(val:any)=>{
    if(initFlag.value) return
    if (val !== "CNY") {
      codeListStore
          .queryCodeList({
            codeListName: "WEB_BAS_CHGRATE",
            codeListParam: { value: val },
          })
          .then((res) => {
            setValue('ECargoBase.nWhAmtRmbExch',res[0].currency_rate)
            setValue('ECargoBase.nWhRmbAmt',getValue('ECargoBase.nWhAmt') * res[0].currency_rate)
            if(getValue('ECargoBase.nRmbAmt')){
              setValue('ECargoBase.nRecRemEstAmt',getValue('ECargoBase.nRmbAmt') - (getValue('ECargoBase.nWhRmbAmt') || 0) )
            }
            if(getValue('ECargoBase.cPayWay') && getValue('ECargoBase.cPayWay') === '01'){
              setValue('ECargoBase.nWhAmtRmbExch',res[0].currency_rate)
              setValue('ECargoBase.cWhAmtCur',val)
            }
          });
    } else {
      setValue('ECargoBase.nWhAmtRmbExch',"1.000000")
      setValue('ECargoBase.nWhRmbAmt',getValue('ECargoBase.nWhAmt') * 1)
      if(getValue('ECargoBase.nRmbAmt')){
        setValue('ECargoBase.nRecRemEstAmt',getValue('ECargoBase.nRmbAmt') - (getValue('ECargoBase.nWhRmbAmt') || 0) )
      }
      if(getValue('ECargoBase.cPayWay') && getValue('ECargoBase.cPayWay') === '01'){
        setValue('ECargoBase.nWhAmtRmbExch','1.000000')
        setValue('ECargoBase.cWhAmtCur',val)
      }
    }
  },
  nWhAmtRmbExchChange:(val:any)=>{
    if(initFlag.value) return
    if(val && getValue('ECargoBase.nWhAmt')){
      setValue('ECargoBase.nWhRmbAmt',val * getValue('ECargoBase.nWhAmt'))
      if(getValue('ECargoBase.nRmbAmt')){
        setValue('ECargoBase.nRecRemEstAmt',getValue('ECargoBase.nRmbAmt') - (getValue('ECargoBase.nWhRmbAmt') || 0) )
      }
    }
  },
  nWhPrmChange:(val:any)=>{
  if(val && getValue('ECargoBase.nWhPrmRmbExch')){
    setValue('ECargoBase.nWhRmbPrm',val * getValue('ECargoBase.nWhPrmRmbExch'))
   }
  },
  cWhPrmCurChange:(val:any)=>{
    if (val !== "CNY") {
      codeListStore
          .queryCodeList({
            codeListName: "WEB_BAS_CHGRATE",
            codeListParam: { value: val },
          })
          .then((res) => {
            setValue('ECargoBase.nWhPrmRmbExch',res[0].currency_rate)
            setValue('ECargoBase.nWhRmbPrm',getValue('ECargoBase.nWhPrm') * res[0].currency_rate)
          });
    } else {
      setValue('ECargoBase.nWhPrmRmbExch',"1.000000")
      setValue('ECargoBase.nWhRmbPrm',getValue('ECargoBase.nWhPrm') * 1)
    }
  },
  cAmtCurChange:(val:any)=>{
    if (val !== "CNY") {
      codeListStore
          .queryCodeList({
            codeListName: "WEB_BAS_CHGRATE",
            codeListParam: { value: val },
          })
          .then((res) => {
            setValue('ECargoBase.nAmtRmbExch',res[0].currency_rate)
          });
    } else {
      setValue('ECargoBase.nAmtRmbExch',"1.000000")
    }
  },
  cPrmCurChange:(val:any)=>{
    if (val !== "CNY") {
      codeListStore
          .queryCodeList({
            codeListName: "WEB_BAS_CHGRATE",
            codeListParam: { value: val },
          })
          .then((res) => {
            setValue('ECargoBase.nPrmRmbExch',res[0].currency_rate)
          });
    } else {
      setValue('ECargoBase.nPrmRmbExch',"1.000000")
    }
  },
  cPremExchCdeChange:(val:any)=>{
    if(val === '1'){
      setFormItem('ECargoBase.nWhPrmRmbExch',{'disabled': true})
    }else {
      setFormItem('ECargoBase.nWhPrmRmbExch',{'disabled': false})
    }
  },
  nWhPrmRmbExchChange:(val:any)=>{
    if(val && getValue('ECargoBase.nWhPrm')){
      setValue('ECargoBase.nWhRmbPrm',val * getValue('ECargoBase.nWhPrm'))
    }
  },
  cWhInsExchCdeChange:(val:any)=>{
    if(val === '1'){
      setFormItem('ECargoBase.nWhAmtRmbExch',{'disabled': true})
    }else {
      setFormItem('ECargoBase.nWhAmtRmbExch',{'disabled': false})
    }
  },
  //折人民币协议预收保费
  nRmbReceivedPrmChange:(val:any)=>{
		if (initFlag.value) return
		const AgreementBase = formPage?.getFormDataById('AgreementBase');
		const cCiMrk = AgreementBase?.['ECargoBase.cCiMrk'];  // 是否   联共保
    if(getValue('ECargoBase.cPayWay') && getValue('ECargoBase.cPayWay') === '01' && !!cCiMrk && cCiMrk == "0"){
			setValue('ECargoBase.nRecRemPrm',val - (getValue('ECargoBase.nWhRmbPrm') || 0))
    }
	},
	// 折人民币我司协议预收保费
	nCiOwnRmbReceivedPrmChange: (val: any) => {
		if (initFlag.value) return
		const AgreementBase = formPage?.getFormDataById('AgreementBase');
		const cCiMrk = AgreementBase?.['ECargoBase.cCiMrk'];  // 是否   联共保
    if(getValue('ECargoBase.cPayWay') && getValue('ECargoBase.cPayWay') === '01' && !!cCiMrk && cCiMrk != "0"){
       setValue('ECargoBase.nRecRemPrm',val - (getValue('ECargoBase.nWhRmbPrm') || 0))
    }
  },
  //折人民币预扣保费
  nWhRmbPrmChange:(val:any)=>{
    if(initFlag.value) return
    //ECargoBase.nRmbReceivedPrm
    const agreementBaseRef = formPage?.getComponentRefById('AgreementBase')
    if(getValue('ECargoBase.cPayWay') && getValue('ECargoBase.cPayWay') === '01'){
      setValue('ECargoBase.nRecRemPrm',getValue('ECargoBase.nRmbReceivedPrm') - (getValue('ECargoBase.nWhRmbPrm') || 0))
    }else {
      setValue('ECargoBase.nRecRemPrm',getValue('ECargoBase.nRmbPrm') - (getValue('ECargoBase.nWhRmbPrm') || 0))
    }
  },
  nRmbPrmChange:(val:any)=>{
    if(initFlag.value) return
    nextTick(()=>{
      const agreementBaseRef = formPage?.getComponentRefById('AgreementBase')
      if(getValue('ECargoBase.cPayWay') && getValue('ECargoBase.cPayWay') !== '01'){
        setValue('ECargoBase.nRecRemPrm', getValue('ECargoBase.nRmbPrm') - (getValue('ECargoBase.nWhRmbPrm') || 0))
      }
    })
  }
  // func demo

}
const setItemShow = ()=>{
  if(!getValue('ECargoBase.nAmt')){
    setFormItem('ECargoBase.AmtProp', {hidden: true})
  }
  if(!getValue('ECargoBase.nPrm')){
    setFormItem('ECargoBase.PrmProp', {hidden: true})
  }
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
        }else {
          Object.assign(item, obj);
          if(item.inputtype==='rtinputgroup'){
              Object.assign(item.groupList[0], obj);
              Object.assign(item.groupList[1], obj);
          }
        }
      }
    });
  }
}

function getFormValue() {
  return applicantEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  applicantEditRef?.value?.setFormValue(value);
}

function validate() {
  return applicantEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  applicantEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return applicantEditRef?.value?.getValue(key);
}

function getFormConfig(){
  return formconfig1;
}
function getFormBtn() {
  return applicantEditRef?.value?.getFormBtn();
}
function setDisabledAll(isDisabled: boolean) {
  applicantEditRef?.value?.setDisabledAll(isDisabled);
}
defineExpose({
  setFormItem,
  getFormValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormConfig,
  getFormBtn,
  setDisabledAll,
  setItemShow
});
</script>

<style scoped></style>

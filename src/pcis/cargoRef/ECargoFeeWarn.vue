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

const codeListStore = codeListViewStore();
const dialog = ref<DialogMethod | null>(null);

const idxParam = inject('idxParam');
const formPage = idxParam?.formPage;
const param = idxParam?.param;

const applicantEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive(createAppFreeEditConfig({}));
const formData = ref<any[]>([]);
const cClntAddr = ref<any>(null);
const fileInputRef = ref(null);
const fileInputType = ref();
import { readFile } from "@/api/file";
const tCertfDate = ref<any[]>([]);
onMounted(() => {
  const formconfig11 = formInit(
      JSON.stringify(props.pageSchema),
      method,
      getRules
  );
  console.log(3838, formconfig11);
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
    const list:Array<string>= ["ECargoBase.nAmtRmbExch","ECargoBase.cInsExchCde", "ECargoBase.nPrmRmbExch","ECargoBase.cPremExchCde"]
     list.forEach(item =>{
       setFormItem(item, {
         hidden: true,
       });
     })
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
    const list:Array<string>= ["ECargoBase.nLowPrm","ECargoBase.nReceivedPrm","ECargoBase.cReceivedRmb","ECargoBase.nReceivedRate","ECargoBase.nRmbReceivedPrm"]
    if(val !== '01'){
      list.forEach(item => {
        setFormItem(item, {
          hidden: true,
        });
      })
    }else {
      list.forEach(item => {
        setFormItem(item, {
          hidden: false,
        });
      })
    }
  },
  cReceivedRmbChange:(val:any)=>{
    if (val !== "CNY") {
      codeListStore
          .queryCodeList({
            codeListName: "WEB_BAS_CHGRATE",
            codeListParam: { value: val },
          })
          .then((res) => {
            setValue('ECargoBase.nReceivedRate',res[0].currency_rate)
            setValue('ECargoBase.nRmbReceivedPrm',getValue('ECargoBase.nReceivedPrm') * res[0].currency_rate)
          });
    } else {
      setValue('ECargoBase.nReceivedRate',"1.000000")
      setValue('ECargoBase.nRmbReceivedPrm',getValue('ECargoBase.nReceivedPrm') * 1)
    }
  },
  nReceivedPrmChange:(val:any)=>{
    if(val && getValue('ECargoBase.nReceivedRate')){
      setValue('ECargoBase.nRmbReceivedPrm',val * getValue('ECargoBase.nReceivedRate'))
    }
  },
  nWhAmtChange:(val:any)=>{
    if(val && getValue('ECargoBase.nWhAmtRmbExch')){
      setValue('ECargoBase.nWhRmbAmt',val * getValue('ECargoBase.nWhAmtRmbExch'))
      if(getValue('ECargoBase.nRmbAmt')){
         setValue('ECargoBase.nRecRemEstAmt',getValue('ECargoBase.nRmbAmt') - getValue('ECargoBase.nWhRmbAmt') )
      }
    }
  },
  cWhAmtCurChange:(val:any)=>{
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
              setValue('ECargoBase.nRecRemEstAmt',getValue('ECargoBase.nRmbAmt') - getValue('ECargoBase.nWhRmbAmt') )
            }
          });
    } else {
      setValue('ECargoBase.nWhAmtRmbExch',"1.000000")
      setValue('ECargoBase.nWhRmbAmt',getValue('ECargoBase.nWhAmt') * 1)
      if(getValue('ECargoBase.nRmbAmt')){
        setValue('ECargoBase.nRecRemEstAmt',getValue('ECargoBase.nRmbAmt') - getValue('ECargoBase.nWhRmbAmt') )
      }
    }
  },
  nWhAmtRmbExchChange:(val:any)=>{
    if(val && getValue('ECargoBase.nWhAmt')){
      setValue('ECargoBase.nWhRmbAmt',val * getValue('ECargoBase.nWhAmt'))
      if(getValue('ECargoBase.nRmbAmt')){
        setValue('ECargoBase.nRecRemEstAmt',getValue('ECargoBase.nRmbAmt') - getValue('ECargoBase.nWhRmbAmt') )
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
   //ECargoBase.nWhRmbPrm
    const agreementBaseRef = formPage.value?.getComponentRefById('AgreementBase')
    if(agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo') && agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo').slice(0,2) === 'YY'){
       setValue('ECargoBase.nRecRemPrm',val - getValue('ECargoBase.nWhRmbPrm'))
    }
  },
  //折人民币预扣保费
  nWhRmbPrmChange:(val:any)=>{
    //ECargoBase.nRmbReceivedPrm
    const agreementBaseRef = formPage.value?.getComponentRefById('AgreementBase')
    if(agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo') && agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo').slice(0,2) === 'YY'){
      setValue('ECargoBase.nRecRemPrm',getValue('ECargoBase.nRmbReceivedPrm') - val )
    }else if(agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo') && agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo').slice(0,2) === 'AY') {
      setValue('ECargoBase.nRecRemPrm',getValue('ECargoBase.nRmbPrm') - val )
    }
  },
  nRmbPrmChange:(val:any)=>{
    const agreementBaseRef = formPage.value?.getComponentRefById('AgreementBase')
    if(agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo') && agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo')?.slice(0,2) === 'AY'){
      setValue('ECargoBase.nRecRemPrm', val - getValue('ECargoBase.nWhRmbPrm') )
    }
  }
  // func demo

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
        } else {
          Object.assign(item, obj);
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
  setDisabledAll
});
</script>

<style scoped></style>

<!-- ECargo协议录入-->
<template>
  <detail-component :bth-list="bthList" :page-type =props.type ref="mainRef" />
</template>
<script setup lang="ts">
import cargoApi from '@/api/cargo';
import {createFreeButtonBase, FreeButtonBase} from "@/shared/button-config";
import {FormPage} from "@/views/protocolManagement/utils/form-page";
import detailComponent from "../components/detail-component.vue";
import {EnteringCompList} from "@/views/protocolManagement/utils/types";
import {useTagsViewStore} from "@/store";
import {useRouter} from "vue-router";
import { getECargoData } from "@/pcis/prodRef/dataInit";
const tagsViewStore = useTagsViewStore();
const router = useRouter();
const props = defineProps({
  param: {
    type: Object,
  },
  type: {
    type: String
  },
  cEdrType: {
    type: String
  }
});
const formPage = ref(new FormPage('enteringDtl'));
const resData = ref({});
const idxParam = reactive({
  formPage: formPage.value,
  param: { ...props.param, ...{}},
  user: JSON.parse(sessionStorage.getItem("user")),
  ciJiMrk: '0',
  readonly: computed(() => ['view','audit'].includes(props.type)),
});
provide('idxParam', idxParam);
const mainRef = ref(null);
const bthList = ref<Array<FreeButtonBase>>([]);

//投保页面
const basicBtn = [
  createFreeButtonBase({
    label: "保费计算",
    type: "primary",
    id: "count",
    func: () => {
      premiumCalculation();
    },
  }),
  createFreeButtonBase({
    label: "保存",
    type: "primary",
    id: "save",
    func: () => {
      save();
    },
  }),
  createFreeButtonBase({
    label: "提交",
    type: "primary",
    id: "submit",
    func: () => {
      submit();
    },
  }),
]
/**
 * 核保按钮
 * @type {FormButton[]}
 */
const uwBtn = [
  createFreeButtonBase({
    label: "提交",
    type: "warning",
    id: "btnUdr",
    func: () => {
      console.log('props',props.param)
      mainRef.value?.getUnderwriteRef().then((isValid) => {
        if (isValid) {
          const user = JSON.parse(sessionStorage.getItem("user"));
          let param = mainRef.value?.getUnderwriteValue()
          let sence = param.cUndrMrk === 'A' ? 'audit' : 'bounced'
          cargoApi.save({
            ...param,
            cEcAgrAppNo:props?.param?.cEcAgrAppNo,
            ...{user},
            sence
          }).then((res: any) => {
            if(res.code === 200) {
              ElMessage.success(res.msg)
              tagsViewStore.delView({"name": "enteringDtl",
                "title": "录入明细",
                "path": "/protocolManagement/enteringDtl",
                "fullPath": "/protocolManagement/enteringDtl"}).then((res: any) => {
                router.replace({ path: "/dashboard" });
              });
            }else {
              ElMessage.success(res.msg);
            }
          });

        } else {
          ElMessage.error("请填写必填项");
        }
      })
    },
  }),

  createFreeButtonBase({
    label: "任务痕迹",
    type: "primary",
    id:"trace",
    func: () => {

    },
  }),
  createFreeButtonBase({
    label: "核保信息",
    type: "primary",
    id:"underwriting",
    func: () => {

    },
  }),
];
/**
 * 一般批改按钮
 */
const edrBtn = [
  createFreeButtonBase({
    label: "原保单查看",
    type: "primary",
    func: () => {

    },
  }),
  createFreeButtonBase({
    label: "保费计算",
    type: "primary",
    id: "btnCalEdr",
    func: () => {

    },
  }),
  createFreeButtonBase({
    label: "保存",
    type: "primary",
    id: "saveEdr",
    func: () => {

    },
  }),
  createFreeButtonBase({
    label: "比较/生成批文",
    type: "primary",
    id: "btnCompare",
    func: () => {

    },
  }),
  createFreeButtonBase({
    label: "申请核保",
    type: "primary",
    id: "btnSubmitEdr",
    func: () => {

    },
  }),

];
/**
 * （退保/注销） 按钮
 * @type {FormButton[]}
 */
const edrSurrenderBtn = [
  createFreeButtonBase({
    id: "btn010101",
    label: "保费计算",
    type: "primary",
    func: () => {

    },
  }),
  createFreeButtonBase({
    id: "btn010102",
    label: "保存",
    type: "primary",
    func: () => {

    },
  }),
  createFreeButtonBase({
    id: "btnCompare",
    label: "比较/生成批文",
    type: "primary",
    func: () => {

    },
  }),
  createFreeButtonBase({
    id: "btn010103",
    label: "申请核保",
    type: "primary",
    func: () => {

    },
  }),
];
onBeforeMount(async () => {
  const res = await cargoApi.getECargoPageView({
      'compKeyList': EnteringCompList.map(item => item.tab)
  });
  console.log('getECargoPageView-res', res)
  const config = res.data;
  config[0].pageInfo.forEach((comp: any) => {
    const it = EnteringCompList.find(f => f.tab === comp.pageCode);
    comp['sort'] = it.sort;
  });
  // 排序
  config[0].pageInfo = config[0].pageInfo.sort((a, b) => a.sort - b.sort)
  // 页面初始化
  formPage.value?.setFormConfig(config);
  if( ['add','edit'].includes(props.type)){
    bthList.value = basicBtn
  }
  if(props.type === 'audit'){
    bthList.value = uwBtn
  }
  //批改
  if(props.type === 'EDR_APP_NEW_SCENE'){
    if(props.cEdrType === '1'){
      bthList.value = edrBtn
    }else{
      bthList.value = edrSurrenderBtn
    }
  }
  if(['view','edit','audit','EDR_APP_NEW_SCENE'].includes(props.type)){
    nextTick(()=>{
      query();
    })

  }
	if (props.type === "add") {
    const idata = getECargoData();
		nextTick(()=>{
			formPage.value?.setFormDataById('AgreementBase',idata)
			formPage.value?.setFormDataById('AgreementFeeWarn',{"ECargoBase.cPayWay":"01"})
		})
  }
  bthList.value.push(
      createFreeButtonBase({
        label: "返回",
        id:'back',
        func: () => {
          history.back();
        },
      }),
  );
  console.log('页面初始化',formPage.value)
});

onMounted(() => {
  console.log(idxParam.readonly);
});


function query() {
  cargoApi.init({
    ...idxParam.param,
    ...{}
  }).then((res: any) => {
    if(res.code === 200) {
      console.log('res........',res)
      ElMessage.success('查询成功');
      formPage.value?.setAllFormData({...res.data.composition,AgreementBase:res.data.composition?.AgreementBase[0],AgreementApplicant:res.data.composition?.AgreementApplicant[0],AgreementFeeWarn:res.data.composition?.AgreementBase[0]});
    }else {
      ElMessage.error(res.msg);
    }
  });
  if(idxParam.readonly === true) {
    formPage.value?.setPageReadOnly(true);
    if(props.type !== 'audit'){
      bthList.value.forEach((item:any)=>{
        if (item.id === 'back') return
        let submitBtn = formPage.value?.getPageBtnRefById(item?.id)?.getConfig();
        submitBtn.disabled = true;
      })
    }
  }
}
function isAllAValuesSame(arr:any,key:any) {
  const firstValue = arr[0][key];
  return arr.every(obj => obj[key] === firstValue);
}
const premiumCalculation = ()=>{
  //协议费用
  const AgreementFeeWarn = formPage.value?.getComponentRefById('AgreementFeeWarn');
  const allFromData = formPage.value?.getAllFormData();
  // 条款
  const AgreementCvrg = allFromData['AgreementCvrg']
  if(AgreementCvrg.length > 0){
    if(isAllAValuesSame(AgreementCvrg,'ECargoTerm.cFeeCurrency')){
      AgreementFeeWarn.setFormItem('ECargoBase.PrmProp',{hidden: false})
      AgreementFeeWarn.setValue('ECargoBase.cPrmCur',AgreementCvrg[0]['ECargoTerm.cFeeCurrency'])
      const sum = AgreementCvrg.reduce((total, current) => total + current['ECargoTerm.nInsuranceFee'], 0);
      AgreementFeeWarn.setValue('ECargoBase.nPrm',sum)
      const sum1 = AgreementCvrg.reduce((total, current) => total + current['ECargoTerm.nRmbFee'], 0);
      AgreementFeeWarn.setValue('ECargoBase.nRmbPrm',sum1)
    }else{
      AgreementFeeWarn.setFormItem('ECargoBase.PrmProp',{hidden: true})
    }
    if(isAllAValuesSame(AgreementCvrg,'ECargoTerm.cAmountCurrency')){
      AgreementFeeWarn.setFormItem('ECargoBase.AmtProp',{hidden: false})
      AgreementFeeWarn.setValue('ECargoBase.cAmtCur',AgreementCvrg[0]['ECargoTerm.cAmountCurrency'])
      const sum = AgreementCvrg.reduce((total, current) => total + current['ECargoTerm.nInsuranceAmount'], 0);
      AgreementFeeWarn.setValue('ECargoBase.nAmt',sum)
      const sum1 = AgreementCvrg.reduce((total, current) => total + current['ECargoTerm.nRmbAmount'], 0);
      AgreementFeeWarn.setValue('ECargoBase.nRmbAmt',sum1)
      if(AgreementFeeWarn.getValue('ECargoBase.nWhRmbAmt')){
        AgreementFeeWarn.setValue('ECargoBase.nRecRemEstAmt',sum1 - AgreementFeeWarn.getValue('ECargoBase.nWhRmbAmt'))
      }
    }else{
      AgreementFeeWarn.setFormItem('ECargoBase.AmtProp',{hidden: false})
    }
  }
}
function save() {
  const allFromData = formPage.value?.getAllFormData();
  const user = JSON.parse(sessionStorage.getItem("user"));
  console.log('allFromData',allFromData)
  cargoApi.save({
    ...allFromData,
    AgreementDistGoods:null,
    ...{},
    ...{user},
    sence:'save'
  }).then((res: any) => {
    if(res.code === 200) {
      ElMessage.success(res.msg)
      resData.value = res.res['composition']['ECargoBase'][0]
      const agreementBaseRef = formPage.value?.getComponentRefById('AgreementBase')
      agreementBaseRef.setValue('ECargoBase.cEcAgrNo', resData.value['ECargoBase.cEcAgrNo'])
      agreementBaseRef.setValue('ECargoBase.cEcAgrAppNo', resData.value['ECargoBase.cEcAgrAppNo'])
    }else {
      ElMessage.success(res.msg);
    }
  });
}

function submit() {
  const allFromData = formPage.value?.getAllFormData();
  const user = JSON.parse(sessionStorage.getItem("user"));
  // const { 
  //   'ECargoBase.cEcAgrNo': cEcAgrNo,
  //   'ECargoBase.cEcAgrAppNo': cEcAgrAppNo,
  // } = resData.value?.ECargoBase || {}

  // if (allFromData && allFromData.AgreementBase) {
  //   allFromData.AgreementBase = {
  //     ...allFromData.AgreementBase,
  //     'ECargoBase.cEcAgrNo': cEcAgrNo,
  //     'ECargoBase.cEcAgrAppNo': cEcAgrAppNo,
  //   };
  // }
  console.log('allFromData', allFromData);
  const agreementBaseRef = formPage.value?.getComponentRefById('AgreementBase')
  cargoApi.submit({
    ...allFromData,
    ...{},
    ...{user},
    sence:'arraigned',
    cEcAgrAppNo:agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo') || ''
  }).then((res: any) => {
    if(res.code === 200) {
      ElMessage.success(res.msg)
      formPage.value.setPageReadOnly(true);
      const submitBtn = formPage.value.getPageBtnRefById('submit')?.getConfig();
      submitBtn.disabled = true;
    }else {
      ElMessage.success(res.msg);
    }
  });
}
// 绑定特殊验证器
const exRules = {};

function getFormValue() {
  return cvrgEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  cvrgEditRef?.value?.setFormValue(value);
}

function validate() {
  return cvrgEditRef?.value?.validate();
}

function getTableValue(rowId: number, key: string) {
  cvrgEditRef?.value?.getTableValue(rowId, key);
}

function getFormConfig() {
  return formconfig1;
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
function getFormBtn() {
  return cvrgEditRef?.value?.getFormBtn();
}
function getTableBtn() {
  return cvrgEditRef?.value?.getTableBtn();
}
function setDisabledAll(isDisabled: boolean) {
  cvrgEditRef?.value?.setDisabledAll(isDisabled);
}
defineExpose({
  getFormValue,
  setFormValue,
  validate,
  getTableValue,
  getFormConfig,
  setFormItem,
  getFormBtn,
  setDisabledAll,
  getTableBtn
});
</script>
<style lang="scss" scoped>
</style>
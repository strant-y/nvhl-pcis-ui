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
import {getEdrRsnItem} from "@/api/query/index"
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
  opertaorId: 'enteringDtl',
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
      generateEndorse()
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
  //审核
  if(props.type === 'audit'){
    bthList.value = uwBtn
  }
  //批改
  if(props.type === 'EDR_APP_NEW_SCENE'){
    if(props.cEdrType == '1'){
      bthList.value = edrBtn
    }else{
      bthList.value = edrSurrenderBtn
    }
  }
  if(['view','edit','audit','EDR_APP_NEW_SCENE'].includes(props.type)){
    nextTick(async ()=>{
     await query();
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
/**
 * 获取批改项
 * **/
const getEdrRsnItemFun = (
    cProdNo: any,
    cDptCde: any,
    cRsnCde: any,
    cRsnDetailCde: any,
    cEdrType: any,
    cGrpMrk: any
) => {
  const res = {
    CProdNo: cProdNo,
    CDptCde: cDptCde,
    CRsnCde: cRsnCde,
    CRsnDetailCde: cRsnDetailCde,
    CEdrType: cEdrType,
    CGrpMrk: cGrpMrk,
  };
  getEdrRsnItem(res).then((res: any) => {
    if (res["code"] == "200") {
      const result = res["data"]["result"];
      const edrList: any[] = [];
      result.forEach((key: any) => {
        if (key["cOperTyp"] === "M") {
          edrList.push(key["cEdrItem"]);
        } else if (key["cOperTyp"] === "B") {
          edrList.push("Btn_" + key["cEdrItem"]);
        }
      });
      console.log('edrList', edrList)
      // console.log('edrList',edrList)
      formPage.value?.setUnDisabledByKeyList(edrList); // 根据list集合,放开需要的要素
      ElMessage.success(res.msg);
    } else {
      ElMessage.error(res.msg);
    }
  });
};
const tempFindBtn: any[] = [];
const userString = sessionStorage.getItem("user");
const user = userString ? JSON.parse(userString) : {};
/**
 * 获取button
 * @param id
 */
const getBtn = (id) => {
  if (tempFindBtn.length === 0) {
    for (const btnArr of bthList.value) {
      tempFindBtn.push(btnArr);
    }
  }
  return tempFindBtn.find((item) => {
    return id === item.id;
  });
};
/**
 * 生成批文
 * **/
const generateEndorse = () => {
  const btn = getBtn("btnCompare");
  btn.loading = true;
  const res = formPage.value?.getAllFormData();
  res["user"] = user;
  res["plyBase"] = {'Base.cDptCde':'','Base.cProdNo':''}
  res["plyBase"]["Base.cDptCde"] = props.param.cDptCde;
  res["plyBase"]["Base.cProdNo"] = '029900';
  res["EdrBase"] = mainRef.value?.getxyedrbaseRefValue();
  console.log(res);
  cargoApi.getEcargoEndorseChange(res).then((res) => {
    btn.loading = false;
    if (res["code"] == "200") {
      debugger
      // const cEdrCtnt = res["data"]["data"]["cEdrCtnt"]; //批文
      // const edrRsn = res["data"]["data"]["edrRsn"]; //批文
      // cacheKey.value = res["data"]["data"]["cacheKey"];
      // edrbase.value?.setValue("EdrBase.cEdrCtnt", cEdrCtnt);
      // edrbase.value?.setValue("EdrBase.cacheKey", cacheKey.value);
      // edrbase.value?.setValue("EdrBase.cEdrRsnDetail", edrRsn);
      // edritem.value?.handleQuery();
      ElMessage.success(res.msg);
    } else {
      ElMessage.error(res.msg);
    }
  });
};
function query() {
  cargoApi.init({
    ...idxParam.param,
    ...{}
  }).then((res: any) => {
    if(res.code === 200) {
      console.log('res........',res)
      ElMessage.success('查询成功');

      const pageInit = () => {
        if (props.type === 'EDR_APP_NEW_SCENE') {
          console.log('props.param', props.param)
          if (
              res["data"]["composition"]["AgreementBase"][0]["ECargoBase.cEdrRsnDetail"] !=
              "" &&
              res["data"]["composition"]["AgreementBase"][0]["ECargoBase.cEdrRsnDetail"] !=
              null
          ) {
            res["data"]["composition"]["AgreementBase"][0]["ECargoBase.cEdrRsnDetail"] =
                res["data"]["composition"]["AgreementBase"][0][
                    "ECargoBase.cEdrRsnDetail"
                    ].split(",");
          }
          res["data"]["composition"]["AgreementBase"][0]["ECargoBase.cRatioTyp"] = "2";
          res["data"]["composition"]["AgreementBase"][0]["ECargoBase.cEdrType"] =
              props.param["cEdrType"];
          res["data"]["composition"]["AgreementBase"][0]["ECargoBase.cEdrRsnBundleCde"] =
              props.param["cRsnCde"];
          if (props.param.cEdrType != "1") {
            res["data"]["composition"]["AgreementBase"][0]["ECargoBase.cEdrRsnDetail"] = [
              props.param["cRsnCde"],
            ];
          }
          const EdrBaseData = res["data"]["composition"]["AgreementBase"][0];
          mainRef.value?.setxyedrbaseRefData(EdrBaseData)
          if (props.param?.cEdrType == "1") {
            if (props.param["cRsnCde"] != "FZ") {
              mainRef.value?.setxyedrbaseRefValue("EdrBase.cEdrRsnDetail", [
                props.param["cRsnCde"],
              ]);
            }
            formPage.value?.setPageReadOnly(true, [], {
              success: (pageData: any) => {
                getEdrRsnItemFun(
                    "029900",
                    props.param["cDptCde"],
                    props.param["cRsnCde"],
                    props.param["cRsnCde"],
                    props.param["cEdrType"],
                    "0"
                )
                //
                // console.log('3333',opertaor.getTableRefByKey('acctinfo'))
                // // 用于处理 账户信息
                // let acctinfoInfo = opertaor.getTableRefByKey('acctinfo')
                // if(acctinfoInfo){
                //   acctinfoInfo.setDisabledAll(false);
                //   acctinfoInfo.setFormItem('Acctinfo.cAcctNme',{
                //     disabled: true
                //   })
                //   acctinfoInfo.setFormItem('Acctinfo.cBankCnaps',{
                //     disabled: true
                //   })
                //
                // }
              }
            });
          }
        }
      }
      formPage.value?.setAllFormData(
          {...res.data.composition,AgreementBase:res.data.composition?.AgreementBase[0],AgreementApplicant:res.data.composition?.AgreementApplicant[0],AgreementFeeWarn:res.data.composition?.AgreementBase[0]},
          {
            success: (pageData: any) => {
              pageInit()
            }
          }
      );

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
  const agreementBaseRef = formPage.value?.getComponentRefById('AgreementBase')
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
      //折人民币预估保费
      AgreementFeeWarn.setValue('ECargoBase.nRmbPrm',sum1)
      //协议剩余预收保费(人民币)
      if(AgreementFeeWarn.getValue('ECargoBase.cPayWay') && AgreementFeeWarn.getValue('ECargoBase.cPayWay') !== '01'){
        AgreementFeeWarn.setValue('ECargoBase.nRecRemPrm',sum1 - (AgreementFeeWarn.getValue('ECargoBase.nWhRmbPrm') || 0))
      }
    }else{
      const sum1 = AgreementCvrg.reduce((total, current) => total + current['ECargoTerm.nRmbFee'], 0);
      //折人民币预估保费
      AgreementFeeWarn.setValue('ECargoBase.nRmbPrm',sum1)
      //协议剩余预收保费(人民币)
      if(AgreementFeeWarn.getValue('ECargoBase.cPayWay') && AgreementFeeWarn.getValue('ECargoBase.cPayWay') !== '01'){
        AgreementFeeWarn.setValue('ECargoBase.nRecRemPrm',sum1 - (AgreementFeeWarn.getValue('ECargoBase.nWhRmbPrm') || 0))
      }
      AgreementFeeWarn.setFormItem('ECargoBase.PrmProp',{hidden: true})
    }
    if(isAllAValuesSame(AgreementCvrg,'ECargoTerm.cAmountCurrency')){
      AgreementFeeWarn.setFormItem('ECargoBase.AmtProp',{hidden: false})
      AgreementFeeWarn.setValue('ECargoBase.cAmtCur',AgreementCvrg[0]['ECargoTerm.cAmountCurrency'])
      const sum = AgreementCvrg.reduce((total, current) => total + current['ECargoTerm.nInsuranceAmount'], 0);
      AgreementFeeWarn.setValue('ECargoBase.nAmt',sum)
      const sum1 = AgreementCvrg.reduce((total, current) => total + current['ECargoTerm.nRmbAmount'], 0);
      // 折人民币预估保额
      AgreementFeeWarn.setValue('ECargoBase.nRmbAmt',sum1)
      //协议剩余实收（预估）保额（人民币）
        AgreementFeeWarn.setValue('ECargoBase.nRecRemEstAmt', sum1)
      if(AgreementFeeWarn.getValue('ECargoBase.nWhRmbAmt')){
        AgreementFeeWarn.setValue('ECargoBase.nRecRemEstAmt',sum1 - AgreementFeeWarn.getValue('ECargoBase.nWhRmbAmt'))
      }
    }else{
      const sum1 = AgreementCvrg.reduce((total, current) => total + current['ECargoTerm.nRmbAmount'], 0);
      // 折人民币预估保额
      AgreementFeeWarn.setValue('ECargoBase.nRmbAmt',sum1)
      //协议剩余实收（预估）保额（人民币）
        AgreementFeeWarn.setValue('ECargoBase.nRecRemEstAmt', sum1)
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

</script>
<style lang="scss" scoped>
</style>
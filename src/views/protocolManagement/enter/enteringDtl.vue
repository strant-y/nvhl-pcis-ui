<!-- ECargo协议录入-->
<template>
  <detail-component :bth-list="bthList" :page-type =props.type :page-way=props.way  ref="mainRef" />
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
import {eventBus} from "@/utils/event-bus";
import {ref} from "vue";
import {copyDist} from "@/api/prod";
import {encryptRouterParam} from "@/router";
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
import {checkAppBase} from "@/api/prod";
const policyService = new PolicyService();
const tagsViewStore = useTagsViewStore();
const router = useRouter();
const props = defineProps({
  param: {
    type: Object,
  },
  isActive: {
    type: String,
    default: '0' // 直接指定默认值
  },
  type: {
    type: String
  },
  payWay: {
    type: String
  },
  cEdrType: {
    type: String
  }
});
const cEcAgrAppNo = ref('')
const formPage = ref(new FormPage('enteringDtl'));
const resData = ref({});
const cacheKey = ref();
let idxParam = reactive({
  opertaorId: 'enteringDtl',
  opertaorProps: { id: 'enteringDtl' },
  formPage: formPage.value,
  param: { ...props.param, ...{cacheKey:cacheKey.value,acctinfoFlag:true,type:props?.type || props.param?.type}},
  user: JSON.parse(sessionStorage.getItem("user")),
  ciJiMrk: '0',
  readonly: computed(() => ['view','audit'].includes(props?.type || props.param?.type) || (props.type === 'EDR_APP_NEW_SCENE' &&  ['2','3'].includes(props.param?.cEdrType) )),
});

provide('idxParam', idxParam);
const mainRef = ref(null);
const bthList = ref<Array<FreeButtonBase>>([]);
const saveDistBatchFlag = ref(false);
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
  createFreeButtonBase({
    label: "影像管理",
    type: "success",
    id: "submit",
    func: () => {
      imageUploadManage();
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
          if(props.param?.cAppTyp === 'A'){
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
          }else {
            cargoApi.saveEdrEcargo({
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
          }
        } else {
          ElMessage.error("请填写必填项");
        }
      })
    },
  }),
  createFreeButtonBase({
    label: "影像查看",
    type: "success",
    id: "submit",
    func: () => {
      imageView();
    },
  }),
  // createFreeButtonBase({
  //   label: "任务痕迹",
  //   type: "primary",
  //   id:"trace",
  //   func: () => {
  //
  //   },
  // }),
  // createFreeButtonBase({
  //   label: "核保信息",
  //   type: "primary",
  //   id:"underwriting",
  //   func: () => {
  //
  //   },
  // }),
];
/**
 * 一般批改按钮
 */
const edrBtn = [
  createFreeButtonBase({
    label: "保费计算",
    type: "primary",
    id: "count",
    func: () => {
      premiumCalculation();
    },
  }),
  createFreeButtonBase({
    label: "原保单查看",
    type: "primary",
    func: () => {
      getPlyPolicyFun()
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
    label: "保存",
    type: "primary",
    id: "saveEdr",
    func: () => {
      saveEdrPlyInfo()
    },
  }),
  createFreeButtonBase({
    label: "申请核保",
    type: "primary",
    id: "btnSubmitEdr",
    func: () => {
      submitEdrToUndrFun();
    },
  }),
  createFreeButtonBase({
    label: "影像管理",
    type: "success",
    id: "submit",
    func: () => {
      imageUploadManage();
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
      premiumCalculation();
    },
  }),
  createFreeButtonBase({
    id: "btnCompare",
    label: "比较/生成批文",
    type: "primary",
    func: () => {
      getSurrenderPrecisFun();
    },
  }),
  createFreeButtonBase({
    id: "btn010102",
    label: "保存",
    type: "primary",
    func: () => {
      saveApplicationEdr()
    },
  }),
  createFreeButtonBase({
    id: "btn010103",
    label: "申请核保",
    type: "primary",
    func: () => {
      submitEdrToUndrSurrender();
    },
  }),
  createFreeButtonBase({
    label: "影像管理",
    type: "success",
    id: "submit",
    func: () => {
      imageUploadManage();
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
    if(props.param.cEdrType == '1'){
      bthList.value = edrBtn
    }else{
      bthList.value = edrSurrenderBtn
    }
    if( props.param.cEdrType == "3" || props.param.cEdrType == "2"){
      idxParam.param.acctinfoFlag = false
    }else {
      idxParam.param.acctinfoFlag = true
    }
  }
  if(['view','edit','audit','EDR_APP_NEW_SCENE'].includes(props.type || props.param?.type)){
    nextTick(async ()=>{
      const AgreementFeeWarn = formPage.value?.getComponentRefById('AgreementFeeWarn')
        AgreementFeeWarn.setFormItem("ECargoBase.cPayWay",  {
        typeCode: 'ECargo_Pay_Ways',
        codeParam: { payway: 'all' }
      })
      await query();
    })
  }
	if (props.type === "add") {
    const idata = getECargoData(idxParam);
        nextTick(()=>{
			formPage.value?.setFormDataById('AgreementBase',idata);
            // 新增选择预付
            if(props.payWay && props.payWay == '01'){
              // 设置默认值, 给表单下拉项赋值
              formPage.value?.setFormDataById('AgreementFeeWarn',{"ECargoBase.cPayWay": props.payWay })
              const AgreementFeeWarn = formPage.value?.getComponentRefById('AgreementFeeWarn')
              AgreementFeeWarn.setFormItem("ECargoBase.cPayWay", {
                typeCode: 'ECargo_Pay_Ways',
                codeParam: { payway: 'prepay' },
                disabled: true
              })
            }else{
              formPage.value?.setFormDataById('AgreementFeeWarn',{"ECargoBase.cPayWay": props.payWay })
              const AgreementFeeWarn = formPage.value?.getComponentRefById('AgreementFeeWarn')
              AgreementFeeWarn.setFormItem("ECargoBase.cPayWay",  {
                typeCode: 'ECargo_Pay_Ways',
                codeParam: { payway: 'nonPrepay' }
              })
            }
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
      console.log('edrList', result)
      formPage.value?.setUnDisabledByKeyList(result); // 根据list集合,放开需要的要素
      console.log('kebianji',formPage.value)
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
 * 批单退保注销申请核保
 */
const submitEdrToUndrSurrender = async () => {
  const result = await  mainRef.value?.getxyedrbaseValidate()
  if(!result){
    return ElMessage.error('请填写必填项')
  }
  const allFromData = formPage.value?.getAllFormData()
  const base = allFromData['AgreementBase'];
  const filter = [];
  if(base['ECargoBase.cCiMrk'] === '0') {
    filter.push(...['AgreementCiTcp', 'AgreementCiShare', 'AgreementCi'
      ,'AgreementAcctinfo','AgreementCiTcp'  // 临时关闭体条款校验
    ]);
  }
  const validateAll = await formPage.value?.validateAll(filter);
  if(!validateAll.flag) {
    ElMessage.warning(validateAll.msg);
    return;
  }
  const f = await saveApplicationEdr(); // 提交核保,需要默认执行一次保存操作
  if(f){
    const btn = getBtn("btn010103");
    btn.loading = true;
    const res = {};
    const base = formPage.value?.getFormDataById('AgreementBase');
    res["user"] = user;
    res["cEcAgrAppNo"] = base["ECargoBase.cEcAgrAppNo"];
    res["cEcAgrNo"] = base["ECargoBase.cEcAgrNo"];
    const edrInfo: any = await cargoApi.saveEdrEcargo({
      ...res,
      sence:'arraigned'
    })
    btn.loading = false;
    if(edrInfo["code"] == "200"){
      ElMessage.success(edrInfo.msg);
      // if(edrInfo['cDecision'] === '1' || edrInfo['cDecision'] === '2'){
        tagsViewStore.delView({"name": "enteringDtl",
          "title": "协议审核",
          "path": "/protocolManagement/enteringDtl",
          "fullPath": "/protocolManagement/enteringDtl"}).then((res: any) => {
          router.replace({ path: "/protocolManagement/protocolReview" });
        });
      // }
    }else {
      ElMessage.error(edrInfo.msg);
    }
  }
}
/**
 * 批单申请核保
 */
const submitEdrToUndrFun = async () => {
  const result = await  mainRef.value?.getxyedrbaseValidate()
  if(!result){
    return ElMessage.error('请填写必填项')
  }
  const allFromData = formPage.value?.getAllFormData()
  const base = allFromData['AgreementBase'];
  const filter = [];
  if(base['ECargoBase.cCiMrk'] === '0') {
    filter.push(...['AgreementCiTcp', 'AgreementCiShare', 'AgreementCi'
      ,'AgreementAcctinfo','AgreementCiTcp'  // 临时关闭体条款校验
    ]);
  }
  const validateAll = await formPage.value?.validateAll(filter);
  if(!validateAll.flag) {
    ElMessage.warning(validateAll.msg);
    return;
  }
  const isSuccess = premiumCalculation()
  if(!isSuccess){
    return  ElMessage.error('请先进行保费计算')
  }
  const f = await saveEdrPlyInfo(); // 提交核保,需要默认执行一次保存操作
  if(f){
    const btn = getBtn("btnSubmitEdr");
    btn.loading = true;
    const res = {};
    const base = formPage.value?.getFormDataById('AgreementBase');
    res["user"] = user;
    res["cEcAgrAppNo"] = base["ECargoBase.cEcAgrAppNo"];
    res["cEcAgrNo"] = base["ECargoBase.cEcAgrNo"];
    const edrInfo: any = await cargoApi.saveEdrEcargo({
      ...res,
      sence:'arraigned'
    })
    btn.loading = false;
    if(edrInfo["code"] == "200"){
      ElMessage.success(edrInfo.msg);
      // if(edrInfo['cDecision'] === '1' || edrInfo['cDecision'] === '2'){
        tagsViewStore.delView({"name": "enteringDtl",
          "title": "协议审核",
          "path": "/protocolManagement/enteringDtl",
          "fullPath": "/protocolManagement/enteringDtl"}).then((res: any) => {
          router.replace({ path: "/protocolManagement/protocolReview" });
        });
      // }
    }else {
      ElMessage.error(edrInfo.msg);
    }
  }
}
/**
 * 原保单查看
 * **/
const getPlyPolicyFun = () => {
  const params: any = {
    query: {
      param:  JSON.stringify({
        cEcAgrAppNo:cEcAgrAppNo.value,
        sence: 'policy',
        type: "view"
      })
    }
  };
  encryptRouterParam(params);
      const url =window.location.origin + "/#/protocolManagement/enteringDtl?param=" + params.query.param;
       console.log('url',url)
      window.open(url, "_blank");
};
/**
 * 退保保存
 * **/
const saveApplicationEdr = async  () => {
  let saveEdrFlag = false;
  const btn = getBtn("btn010102");
  btn.loading = true;
  const res = formPage.value?.getAllFormData();
  res["user"] = user;
  res["EdrEcargoBase"] = mainRef.value?.getxyedrbaseRefValue();
  res["EdrEcargoBase"]['EdrECargoBase.cEdrType'] = props.param?.cEdrType
  if (
      res["EdrEcargoBase"]["EdrEcargoBase.cEdrRsnDetail"] != null &&
      res["EdrEcargoBase"]["EdrEcargoBase.cEdrRsnDetail"] != "" &&
      Array.isArray(res["EdrEcargoBase"]["EdrEcargoBase.cEdrRsnDetail"])
  ) {
    res["EdrEcargoBase"]["EdrEcargoBase.cEdrRsnDetail"] =
        res["EdrEcargoBase"]["EdrEcargoBase.cEdrRsnDetail"].join();
  }
  
  const edrInfo: any = await cargoApi.saveEdrEcargo({
    ...res,
    AgreementDistGoods:null,
    AgreementTgtSummary:null,
    AgreementDistInsured:null,
    AgreementDistTransport:null,
    ...{},
    ...{user},
    sence:'save'
  })
  btn.loading = false;
  if(edrInfo["code"] == "200") {
    ElMessage.success(edrInfo.msg);
    const EdrBaseData = edrInfo["res"]["composition"]["ECargoBase"][0];
    formPage.value?.setFormDataById('AgreementBase',EdrBaseData)
    formPage.value?.setFormDataById('AgreementFeeWarn',{"ECargoBase.cEcAgrAppNo":EdrBaseData['ECargoBase.cEcAgrAppNo']})
    saveEdrFlag = true;
    cEcAgrAppNo.value = EdrBaseData['ECargoBase.cEcAgrAppNo']
    if(cEcAgrAppNo.value && !saveDistBatchFlag.value && props.isActive === '0'){
      const param:any =  idxParam.param
      const  val ={cEcAgrAppNo:param.cEcAgrAppNo,targetNo:cEcAgrAppNo.value,cRsnCde:param.cRsnCde,}
      const result:any =  await copyDist(val)
      if(result && result.code === 200) {
        console.log('copy成功')
        const dataRes:any = await cargoApi.init({
          ...idxParam.param,
          cEcAgrAppNo:cEcAgrAppNo.value,
          ...{}
        })
        if(dataRes.code === 200) {
          console.log('dataRes["data"]["composition"]["AgreementCvrg"]',dataRes["data"]["composition"]["AgreementCvrg"])
          formPage.value?.setFormDataById('AgreementCvrg',dataRes["data"]["composition"]["AgreementCvrg"])
        }
        eventBus.emit('goodsChange', cEcAgrAppNo.value);
        eventBus.emit('insuredChange', cEcAgrAppNo.value);
        eventBus.emit('transportChange', cEcAgrAppNo.value);
        saveDistBatchFlag.value = true
      } else {
        ElMessage.error(result.msg);
      }
    }
  } else {
    ElMessage.error(edrInfo.msg);
  }
  return saveEdrFlag;
}
/**
 * 批改单保存
 * **/
const saveEdrPlyInfo = async () => {
  let saveEdrFlag = false;
  const btn = getBtn("saveEdr");

  btn.loading = true;
  const res = formPage.value?.getAllFormData();
  res["user"] = user;
  res["EdrEcargoBase"] = mainRef.value?.getxyedrbaseRefValue();
  res["EdrEcargoBase"]['EdrECargoBase.cEdrType'] = props.param?.cEdrType
  if (
      res["EdrEcargoBase"]["EdrEcargoBase.cEdrRsnDetail"] != null &&
      res["EdrEcargoBase"]["EdrEcargoBase.cEdrRsnDetail"] != "" &&
      Array.isArray(res["EdrEcargoBase"]["EdrEcargoBase.cEdrRsnDetail"])
  ) {
    res["EdrEcargoBase"]["EdrEcargoBase.cEdrRsnDetail"] =
        res["EdrEcargoBase"]["EdrEcargoBase.cEdrRsnDetail"].join();
  }
  console.log('参数',res)
  const edrInfo: any = await cargoApi.saveEdrEcargo({
    ...res,
    AgreementDistGoods:null,
    AgreementTgtSummary:null,
    AgreementDistInsured:null,
    AgreementDistTransport:null,
    ...{},
    ...{user},
    sence:'save'
  })
  // 
  btn.loading = false;
  if(edrInfo["code"] == "200") {
    ElMessage.success(edrInfo.msg);
    console.log('返回的数据',edrInfo)
    // let dataForm:any ={...edrInfo.res.composition,AgreementBase:edrInfo.res.composition?.AgreementBase[0],AgreementApplicant:edrInfo.res.composition?.AgreementApplicant[0],AgreementFeeWarn:edrInfo.res.composition?.AgreementBase[0]}
    // delete dataForm.AgreementEdrEcargoBase
    // delete dataForm.AgreementDistGoods
    // delete dataForm.AgreementDistInsured
    // delete dataForm.AgreementDistTransport
    const EdrBaseData = edrInfo["res"]["composition"]["ECargoBase"][0];
    formPage.value?.setFormDataById('AgreementBase',EdrBaseData)
    formPage.value?.setFormDataById('AgreementFeeWarn',{"ECargoBase.cEcAgrAppNo":EdrBaseData['ECargoBase.cEcAgrAppNo']})
    //条款和特约
    formPage.value?.setFormDataById('AgreementSpecial',edrInfo["res"]["composition"]["ECargoSpecialAgreement"])
    formPage.value?.setFormDataById('AgreementCvrg',edrInfo["res"]["composition"]["ECargoTerm"])

    saveEdrFlag = true;
    cEcAgrAppNo.value = EdrBaseData['ECargoBase.cEcAgrAppNo']
        console.log('保存缓存的数据',edrInfo["res"]["composition"]["ECargoSpecialAgreement"])
   sessionStorage.setItem("AgreementSpecial", JSON.stringify(edrInfo["res"]["composition"]["ECargoSpecialAgreement"]));
    
    if(cEcAgrAppNo.value && !saveDistBatchFlag.value && props.isActive === '0'){
      const param:any =  idxParam.param
      const  val ={cEcAgrAppNo:param.cEcAgrAppNo,targetNo:cEcAgrAppNo.value,cRsnCde:param.cRsnCde,}
      // copyDist(val).then((res:any) => {
      //   if(res && res.code === 200) {
      //     console.log('copy成功')
      //   } else {
      //     ElMessage.error(res.msg);
      //   }
      // }).catch((err:any) => {
      //   ElMessage.error(err.msg);
      // })
     const result:any =  await copyDist(val)
      if(result && result.code === 200) {
        console.log('copy成功')
       const dataRes:any = await cargoApi.init({
          ...idxParam.param,
         cEcAgrAppNo:cEcAgrAppNo.value,
          ...{}
        })
          if(dataRes.code === 200) {
            console.log('dataRes["data"]["composition"]["AgreementCvrg"]',dataRes["data"]["composition"]["AgreementCvrg"])
            formPage.value?.setFormDataById('AgreementCvrg',dataRes["data"]["composition"]["AgreementCvrg"])
          }
        eventBus.emit('goodsChange', cEcAgrAppNo.value);
        eventBus.emit('insuredChange', cEcAgrAppNo.value);
        eventBus.emit('transportChange', cEcAgrAppNo.value);
        saveDistBatchFlag.value = true
      } else {
        ElMessage.error(result.msg);
      }
    }
   
  } else {
    ElMessage.error(edrInfo.msg);
  }
  return saveEdrFlag;
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
  res["EdrEcargoBase"] = mainRef.value?.getxyedrbaseRefValue();
  res["EdrEcargoBase"]['EdrECargoBase.cProdNo'] = '029900';
  res["EdrEcargoBase"]['EdrECargoBase.cEdrType'] = props.param?.cEdrType
  cargoApi.getEcargoEndorseChange(res).then((res) => {
    btn.loading = false;
    if (res["code"] == "200") {
      const cEdrCtnt = res["data"]["data"]["cEdrCtnt"]; //批文
      const edrRsn = res["data"]["data"]["edrRsn"]; //批文
      cacheKey.value = res["data"]["data"]["cacheKey"];
      mainRef.value?.setxyedrbaseRefValue("EdrECargoBase.cEdrCtnt", cEdrCtnt);
      mainRef.value?.setxyedrbaseRefValue("EdrECargoBase.cacheKey", cacheKey.value);
      mainRef.value?.setxyedrbaseRefValue("EdrECargoBase.cEdrRsnDetail", edrRsn);
      mainRef.value?.setxyedrbaseRefValue("cacheKey", cacheKey);
      idxParam.param.cacheKey = cacheKey.value
      mainRef.value?.getxyedritemValue();
      ElMessage.success(res.msg);
    } else {
      ElMessage.error(res.msg);
    }
  });
};
const getSurrenderPrecisFun = ()=>{
  const btn = getBtn("btnCompare");
  btn.loading = true;
  const res = formPage.value?.getAllFormData();
  res["user"] = user;
  res["plyBase"] = {'Base.cDptCde':'','Base.cProdNo':''}
  res["plyBase"]["Base.cDptCde"] = props.param.cDptCde;
  res["plyBase"]["Base.cProdNo"] = '029900';
  res["EdrEcargoBase"] = mainRef.value?.getxyedrbaseRefValue();
  res["EdrEcargoBase"]['EdrECargoBase.cProdNo'] = '029900';
  res["EdrEcargoBase"]['EdrECargoBase.cEdrType'] = props.param?.cEdrType
  cargoApi.getEcargoEndorseChange(res).then((res) => {
    btn.loading = false;
    if (res["code"] == "200") {
      const cEdrCtnt = res["data"]["data"]["cEdrCtnt"]; //批文
      const edrRsn = res["data"]["data"]["edrRsn"]; //批文
      cacheKey.value = res["data"]["data"]["cacheKey"];
      mainRef.value?.setxyedrbaseRefValue("EdrECargoBase.cEdrCtnt", cEdrCtnt);
      mainRef.value?.setxyedrbaseRefValue("EdrECargoBase.cacheKey", cacheKey.value);
      mainRef.value?.setxyedrbaseRefValue("EdrECargoBase.cEdrRsnDetail", edrRsn);
      mainRef.value?.setxyedrbaseRefValue("cacheKey", cacheKey);
      idxParam.param.cacheKey = cacheKey.value
      mainRef.value?.getxyedritemValue();
      ElMessage.success(res.msg);
    } else {
      ElMessage.error(res.msg);
    }
  });
}
function query() {
  console.log('idxParam.param',idxParam.param)
  lastDataQuery();
  cargoApi.init({
    ...idxParam.param,
    ...{}
  }).then((res: any) => {
    if(res.code === 200) {
      console.log('query-res',res)
      ElMessage.success('查询成功');
      cEcAgrAppNo.value = res["data"]["composition"]["AgreementBase"][0]['ECargoBase.cEcAgrAppNo'] || ''
      if(cEcAgrAppNo.value){
        eventBus.emit('goodsChange', cEcAgrAppNo.value);
        eventBus.emit('insuredChange', cEcAgrAppNo.value);
        eventBus.emit('transportChange', cEcAgrAppNo.value);
      }
      const pageInit = () => {
        //协议费用
        // const AgreementFeeWarn = formPage.value?.getComponentRefById('AgreementFeeWarn');
        // AgreementFeeWarn.setItemShow()
        if (props.type === 'EDR_APP_NEW_SCENE') {
         
          if (res["data"]["composition"]["AgreementEdrEcargoBase"]) {
            const EdrECargoBase = res["data"]["composition"]["AgreementEdrEcargoBase"][0];
              mainRef.value?.setxyedrbaseRefData({...EdrECargoBase,'EdrECargoBase.cEdrType':props.param?.cEdrType})
              mainRef.value?.setxyedrbaseRefValue("EdrECargoBase.cEdrRsnBundleCde",
              props.param["cRsnCde"] || props.param["cEdrRsnBundleCde"]);
            mainRef.value?.getxyedritemValue();
          }
          if (props.param.cEdrType != "1") {
            mainRef.value?.setxyedrbaseRefValue("EdrECargoBase.cEdrRsnDetail", [
              props.param["cRsnCde"] || props.param["cEdrRsnBundleCde"],
            ]);
          }
          if (props.param?.cEdrType == "1") {
            sessionStorage.setItem("nReceivedPrm", JSON.stringify(res["data"]["composition"]["AgreementBase"][0]));
            if (props.param["cRsnCde"] != "FZ") {
              mainRef.value?.setxyedrbaseRefValue("EdrECargoBase.cEdrRsnDetail", [
                props.param["cRsnCde"] || props.param["cEdrRsnBundleCde"],
              ]);
            }
          }
          formPage.value?.setPageReadOnly(true, [], {
            success: (pageData: any) => {
              getEdrRsnItemFun(
                  "029900",
                  props.param["cDptCde"],
                  props.param["cRsnCde"] || props.param["cEdrRsnBundleCde"],
                  props.param["cRsnCde"] || props.param["cEdrRsnBundleCde"],
                  props.param["cEdrType"],
                  "0"
              )
            }
          });
        }
      }
      let dataForm:any ={...res.data.composition,AgreementBase:res.data.composition?.AgreementBase[0],AgreementApplicant:res.data.composition?.AgreementApplicant[0],AgreementFeeWarn:res.data.composition?.AgreementBase[0] ,AgreementAcctinfo:res.data.composition?.AgreementAcctinfo[0]  }
      delete dataForm.AgreementEdrEcargoBase
      delete dataForm.AgreementDistGoods
      delete dataForm.AgreementTgtSummary
      delete dataForm.AgreementDistInsured
      delete dataForm.AgreementDistTransport
      if(props.type === 'EDR_APP_NEW_SCENE'){
        // 初始化时，将cPkId赋值给cRowId
        Object.keys(dataForm).forEach((key) => {
          if(key === 'AgreementSpecial' || key === 'AgreementCvrg'){
            const v = dataForm[key];
            const ls = [];
            if(v && v instanceof Array){
              for (const i in v) {
                let nd = {};
                const d = v[i];
                Object.keys(d).forEach((ks)=>{
                  if(ks && ks.endsWith("cPkId")){
                    const newks = ks;
                    const rowKs = ks.split(".")[0] + "." + "cRowId";
                    nd[rowKs] = d[ks];
                    nd[ks] = null;
                  }else if(ks && ks.endsWith("cRowId")){
                    // RowId上面已经操作了，下面不再进行操作
                  }else{
                    nd[ks] = d[ks];
                  }
                })
                ls.push(nd);
              }
              dataForm[key] = ls;
            }
          }
        })
      }
      if(props.type === 'EDR_APP_NEW_SCENE' && props.isActive === '0'){
        dataForm['AgreementBase']['ECargoBase.cEcAgrAppNo'] = ''
      }
      formPage.value?.setAllFormData( dataForm, {
        success: (pageData: any) => {
          pageInit()
        }
      });


       // 暂存数据
       console.log('缓存的数据',dataForm['AgreementSpecial'])
        sessionStorage.setItem("AgreementSpecial", JSON.stringify(dataForm['AgreementSpecial']));
    }else {
      ElMessage.error(res.msg);
    }
  });
  if(idxParam.readonly === true) {
    formPage.value?.setPageReadOnly(true);
    if(props.type !== 'audit'){
      if(props.type === 'EDR_APP_NEW_SCENE' &&  ['2','3'].includes(props.param?.cEdrType)) return
      bthList.value.forEach((item:any)=>{
        if (item.id === 'back') return
        let submitBtn = formPage.value?.getPageBtnRefById(item?.id)?.getConfig();
        submitBtn.disabled = true;
      })
    }
  }
}
function lastDataQuery() {
  if (props.type === 'EDR_APP_NEW_SCENE') {
    cargoApi.queryEcargoDetailsLast({
      ...idxParam.param,
    }).then((res: any) => {
      if(res.code === 200) {
        const dataForm:any ={...res.data.composition,AgreementBase:res.data.composition?.AgreementBase[0],AgreementApplicant:res.data.composition?.AgreementApplicant[0],AgreementFeeWarn:res.data.composition?.AgreementBase[0]}
        formPage.value?.setAllCompPrimevalData(dataForm)
      }
    });
  }
}
function isAllAValuesSame(arr:any,key:any) {
  // 检查是否有null或undefined和空的key
  if (arr.some(obj => obj[key] === null || obj[key] === undefined || obj[key] === '')) {
    return false;
  }
  const firstValue = arr[0][key];
  return arr.every(obj => obj[key] === firstValue);
}
const premiumCalculation = ()=>{
  let isBer = false
  let isBef = false
  let isSuccess = false
  debugger
  try {
    const agreementBaseRef = formPage.value?.getComponentRefById('AgreementBase')
    //协议费用
    const AgreementFeeWarn = formPage.value?.getComponentRefById('AgreementFeeWarn');
    const allFromData = formPage.value?.getAllFormData();
    // 条款
    const AgreementCvrg = allFromData['AgreementCvrg']
    if(AgreementCvrg.length > 0){
      if(isAllAValuesSame(AgreementCvrg,'ECargoTerm.cFeeCurrency')){
        isBef = true
        AgreementFeeWarn.setFormItem('ECargoBase.PrmProp',{hidden: false})
        AgreementFeeWarn.setValue('ECargoBase.cPrmCur',AgreementCvrg[0]['ECargoTerm.cFeeCurrency'])
        const sum = AgreementCvrg.reduce((total, current) => total + current['ECargoTerm.nInsuranceFee'], 0);
        AgreementFeeWarn.setValue('ECargoBase.nPrm',sum)
        const sum1 = AgreementCvrg.reduce((total, current) => total + current['ECargoTerm.nRmbFee'], 0);
        //折人民币预估保费
        AgreementFeeWarn.setValue('ECargoBase.nRmbPrm',sum1)
        //协议剩余预收保费(人民币)
        if(AgreementFeeWarn.getValue('ECargoBase.cPayWay') && AgreementFeeWarn.getValue('ECargoBase.cPayWay') !== '01'){
          AgreementFeeWarn.setValue('ECargoBase.nWhPrmRmbExch',AgreementCvrg[0]['ECargoTerm.nFeeRate'])
          AgreementFeeWarn.setValue('ECargoBase.cWhPrmCur',AgreementCvrg[0]['ECargoTerm.cFeeCurrency'])
          AgreementFeeWarn.setValue('ECargoBase.nRecRemPrm',sum1 - (AgreementFeeWarn.getValue('ECargoBase.nWhRmbPrm') || 0))
        }
      }else{
        isBef = false
        const sum1 = AgreementCvrg.reduce((total, current) => total + current['ECargoTerm.nRmbFee'], 0);
        //折人民币预估保费
        AgreementFeeWarn.setValue('ECargoBase.nRmbPrm',sum1)
        //协议剩余预收保费(人民币)
        if(AgreementFeeWarn.getValue('ECargoBase.cPayWay') && AgreementFeeWarn.getValue('ECargoBase.cPayWay') !== '01'){
          AgreementFeeWarn.setValue('ECargoBase.nRecRemPrm',sum1 - (AgreementFeeWarn.getValue('ECargoBase.nWhRmbPrm') || 0))
        }
        AgreementFeeWarn.setFormItem('ECargoBase.PrmProp',{hidden: false})
        AgreementFeeWarn.setValue('ECargoBase.nPrm',sum1)
        AgreementFeeWarn.setValue('ECargoBase.cPrmCur','CNY')
      }
      if(isAllAValuesSame(AgreementCvrg,'ECargoTerm.cOriginalCurrency')){
        isBer = true
        AgreementFeeWarn.setFormItem('ECargoBase.AmtProp',{hidden: false})
        AgreementFeeWarn.setValue('ECargoBase.cAmtCur',AgreementCvrg[0]['ECargoTerm.cOriginalCurrency'])
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
        if(AgreementFeeWarn.getValue('ECargoBase.cPayWay') && AgreementFeeWarn.getValue('ECargoBase.cPayWay') !== '01'){
          AgreementFeeWarn.setValue('ECargoBase.nWhPrmRmbExch',AgreementCvrg[0]['ECargoTerm.nOriginalRate'])
          AgreementFeeWarn.setValue('ECargoBase.cWhPrmCur',AgreementCvrg[0]['ECargoTerm.cOriginalCurrency'])
        }
      }else{
        isBer = false
        const sum1 = AgreementCvrg.reduce((total, current) => total + current['ECargoTerm.nRmbAmount'], 0);
        // 折人民币预估保额
        AgreementFeeWarn.setValue('ECargoBase.nRmbAmt',sum1)
        //协议剩余实收（预估）保额（人民币）
        AgreementFeeWarn.setValue('ECargoBase.nRecRemEstAmt', sum1)
        AgreementFeeWarn.setFormItem('ECargoBase.AmtProp',{hidden: false})
        AgreementFeeWarn.setValue('ECargoBase.nAmt',sum1)
        AgreementFeeWarn.setValue('ECargoBase.cAmtCur','CNY')
      }
      //退保和注销做逻辑处理 ECargoBase.nRecRemEstAmt --协议剩余实收（预估）保额（人民币）  ECargoBase.nRecRemPrm ---协议剩余预收保费（人民币）
      // nRecRemPrmVar剩余保费变化   nRecRemEstAmtVar剩余保额变化
      // cEdrType 注销 2 退保 3 pageType ---EDR_APP_NEW_SCENE
      if((props.param?.cEdrType == '2' || props.param?.cEdrType == '3') && (props.param?.pageType == 'EDR_APP_NEW_SCENE' || props?.type == 'EDR_APP_NEW_SCENE')){
        AgreementFeeWarn.setValue('ECargoBase.nRecRemPrmVar', AgreementFeeWarn.getValue('ECargoBase.nRecRemPrm') * -1)
        AgreementFeeWarn.setValue('ECargoBase.nRecRemEstAmtVar',AgreementFeeWarn.getValue('ECargoBase.nRecRemEstAmt') * -1)

        AgreementFeeWarn.setValue('ECargoBase.nRecRemEstAmt', 0)
        AgreementFeeWarn.setValue('ECargoBase.nRecRemPrm',0)
        console.log(11111,AgreementFeeWarn.getFormValue())
      }
      if(props.param?.pageType == 'EDR_APP_NEW_SCENE' || props?.type == 'EDR_APP_NEW_SCENE'){
        const pgxx = mainRef.value?.getxyedrbaseRefValue()
        if(isBef){
          const xbf =  parseFloat((AgreementFeeWarn.getValue('ECargoBase.nPrm') || 0).toFixed(2))
          let bfbhl = xbf - (pgxx['EdrECargoBase.nBefEdrPrm']*1 || 0)
          mainRef.value?.setxyedrbaseRefValue('EdrECargoBase.nPrm',xbf)
          mainRef.value?.setxyedrbaseRefValue('EdrECargoBase.nPrmVar',bfbhl)
        }else{
          const xbf =  parseFloat((AgreementFeeWarn.getValue('ECargoBase.nRmbPrm') || 0).toFixed(2))
          let bfbhl = xbf - (pgxx['EdrECargoBase.nBefEdrPrm']*1 || 0)
          mainRef.value?.setxyedrbaseRefValue('EdrECargoBase.nPrm',xbf)
          mainRef.value?.setxyedrbaseRefValue('EdrECargoBase.nPrmVar',bfbhl)
        }
        if(isBer){
          // parseFloat((AgreementFeeWarn.getValue('ECargoBase.nAmt') || 0).toFixed(2))
          const xbf =  parseFloat((AgreementFeeWarn.getValue('ECargoBase.nAmt') || 0).toFixed(2))
          let bfbhl = xbf - (pgxx['EdrECargoBase.nBefEdrAmt']*1 || 0)
          mainRef.value?.setxyedrbaseRefValue('EdrECargoBase.nAmt',xbf)
          mainRef.value?.setxyedrbaseRefValue('EdrECargoBase.nAmtVar',bfbhl)
        }else{
          const xbf =  parseFloat((AgreementFeeWarn.getValue('ECargoBase.nRmbAmt') || 0).toFixed(2))
          let bfbhl = xbf - (pgxx['EdrECargoBase.nBefEdrAmt']*1 || 0)
          mainRef.value?.setxyedrbaseRefValue('EdrECargoBase.nAmt',xbf)
          mainRef.value?.setxyedrbaseRefValue('EdrECargoBase.nAmtVar',bfbhl)
        }
      }
      const agreementCi =formPage.value?.getComponentRefById('AgreementCi');
      if(agreementCi){
        const formValue = agreementCi.getFormValue();
        if (formValue && formValue.length > 0) {
          // 触发第一行数据的 nCiShareChange 方法
          agreementCi.setValueByRowKey('ECargoCi.nCiShare', formValue[0]._dataId, formValue[0]['ECargoCi.nCiShare']);
        }
      }
      ElMessage.success('保费计算成功')
    }else {
      ElMessage.error('保费计算失败,请先添加条款!')
    }
    isSuccess = true
  }catch (err:any){
    ElMessage.error('保费计算失败！')
    isSuccess = false
  }
  return isSuccess
}
async function save() {
  let isOk = false
  // const allFromData = formPage.value?.getAllFormData();
  let processedData = { ...formPage.value?.getAllFormData() }; 
  const user = JSON.parse(sessionStorage.getItem("user"));
  // console.log('allFromData',allFromData)
  const base = processedData['AgreementBase'];
  if(!(processedData['AgreementBase'] && processedData['AgreementBase']['ECargoBase.cDptCde'])){
     return ElMessage.warning("请选择出单机构")
  }
  // 根据条件删除指定的对象
  
  if(base['ECargoBase.cCiMrk'] === '0') {
    // 如果是 '0'，删除 AgreementCiTcp、AgreementCiShare、AgreementCi、AgreementAcctinfo
    const { AgreementCiTcp, AgreementCiShare, AgreementCi, AgreementAcctinfo, ...rest } = processedData;
    processedData = rest;
  } else {
    // 否则只删除 AgreementAcctinfo
    const { AgreementAcctinfo, ...rest } = processedData;
    processedData = rest;
  }

 const res = await cargoApi.save({
    ...processedData,
    AgreementDistGoods:null,
   AgreementTgtSummary:null,
   AgreementDistInsured:null,
   AgreementDistTransport:null,
    ...{},
    ...{user},
    sence:'save'
  })
    if(res.code === 200) {
      isOk = true
      ElMessage.success(res.msg)
      resData.value = res.res['composition']['ECargoBase'][0]
      const agreementBaseRef = formPage.value?.getComponentRefById('AgreementBase')
      agreementBaseRef.setValue('ECargoBase.cEcAgrNo', resData.value['ECargoBase.cEcAgrNo'])
      agreementBaseRef.setValue('ECargoBase.cEcAgrAppNo', resData.value['ECargoBase.cEcAgrAppNo'])
      agreementBaseRef.setValue('ECargoBase.cAppTyp', resData.value['ECargoBase.cAppTyp'] || '')
    }else {
      isOk = false
      ElMessage.success(res.msg);
    }
    return isOk
}
// 影像上传管理
const imageUploadManage = () => {
  let param = {cEcAgrAppNo:''};
  const allFromData = formPage.value?.getAllFormData();
  const base = allFromData['AgreementBase'];
  param['cEcAgrAppNo'] = base["ECargoBase.cEcAgrAppNo"]
  checkAppBase(param).then((res:any) => {
    if (res.code === 200) {
      const cEdrType = props.param?.cEdrType;
      let bussNo;
      let plyNo;
      let appTyp;
      let CDptCde;
      let COprCde;
      if (cEdrType === "2" || cEdrType === "3") {
        // 批改类型 2 注销 3 退保
        const baseTab = allFromData['AgreementBase'];
        const edrBaseTab = allFromData['AgreementEdrEcargoBase'];
        bussNo = baseTab["ECargoBase.cEcAgrAppNo"];
        plyNo = edrBaseTab["EdrECargoBase.cPlyNo"];
        appTyp = edrBaseTab["EdrECargoBase.cAppTyp"];
        CDptCde = edrBaseTab["EdrECargoBase.cDptCde"];
        COprCde = user.opCde;
      } else {
        const baseTab = allFromData['AgreementBase'];
        bussNo = baseTab["ECargoBase.cEcAgrAppNo"];
        plyNo = baseTab["ECargoBase.cEcAgrNo"];
        appTyp = baseTab["ECargoBase.cAppTyp"];
        CDptCde = baseTab["ECargoBase.cDptCde"];
        COprCde = baseTab["ECargoBase.cOprCde"];
      }

      if (!bussNo) {
        ElMessage.warning("申请单号为空！");
        return;
      }

      if (!appTyp) {
        ElMessage.warning("保单类型为空！");
        return;
      }

      if (!CDptCde) {
        ElMessage.warning("机构为空！");
        return;
      }

      if (!COprCde) {
        ElMessage.warning("操作员为空！");
        return;
      }
      const data = {
        bussNo: bussNo,
        viewType: "upload",
        plyNo: plyNo,
        appTyp: appTyp,
        CDptCde: CDptCde,
        COprCde: COprCde,
      };
      policyService
          .imageInfoUpload(data)
          .then((res: any) => {
            if (res.code === 200) {
              window.open(res.url, "_blank");
            } else {
              ElMessage.error(res.msg);
            }
          })
          .catch((err: any) => {
            ElMessage.error(err);
          });
    } else {
      ElMessage.error("请先保存申请单!");
    }
  })
}
// 影像查看
const imageView = () => {
  let param = {cEcAgrAppNo:''};
  const allFromData = formPage.value?.getAllFormData();
  const base = allFromData['AgreementBase'];
  param['cEcAgrAppNo'] = base["ECargoBase.cEcAgrAppNo"]
  checkAppBase(param).then((res:any) => {
    if (res.code === 200) {
      showImagSys("manager");
    } else {
      ElMessage.error("请先保存申请单!");
    }
  });
}
function showImagSys(viewType: string) {
  let ParamNo;
  const CEdrType = props.param?.cEdrType;
  const allFromData = formPage.value?.getAllFormData();
  const base = allFromData['AgreementBase'];
  if ("jino" === viewType) {
    ParamNo = base["ECargoBase.CJiNo"];
    const CCiMrk = base["ECargoBase.cCiMrk"];
    if ("6" === CCiMrk) {
      if (!ParamNo) {
        ElMessage.warning("请核实从联单中的主联单申请单号是否正确！");
        return;
      }
    } else {
      ElMessage.warning("请核实是否为从联单！");
      return;
    }
  } else {
    if (CEdrType === "2" || CEdrType === "3") {
      const edrBaseTab = allFromData['AgreementEdrEcargoBase'];
      ParamNo = edrBaseTab["ECargoBase.cEcAgrAppNo"];
    } else {
      ParamNo = base["ECargoBase.cEcAgrAppNo"];
    }

    if (!ParamNo) {
      ElMessage.warning("申请单号为空！");
      return;
    }
  }
  policyService
      .imageInfoShow({ ParamNo: ParamNo })
      .then((res: any) => {
        if (res.code === 200) {
          window.open(res.url, "_blank");
        } else {
          ElMessage.error(res.msg);
        }
      })
      .catch((err: any) => {
        ElMessage.error(err);
      });
}
async function  submit() {
  const isSuccess = premiumCalculation()
  if(!isSuccess){
    return  ElMessage.error('请先进行保费计算')
  }
  const isOk =  await save()
  if(!isOk) return
  const allFromData = formPage.value?.getAllFormData()
  const base = allFromData['AgreementBase'];
  const filter = [];
  if(base['ECargoBase.cCiMrk'] === '0') {
    filter.push(...['AgreementCiTcp', 'AgreementCiShare', 'AgreementCi'
        ,'AgreementAcctinfo','AgreementCiTcp'  // 临时关闭体条款校验
    ]);
  }else{
    filter.push(...[
        'AgreementAcctinfo' // 临时关闭体条款校验
    ]);
  }
  // if(props.type === 'add' || props.type === 'edit'  || (props.type === 'EDR_APP_NEW_SCENE' && props?.param?.cEdrType == '1') ){
  //   filter.push('AgreementAcctinfo')
  // }
  const rv = await formPage.value?.validateAll(filter)
  if(!rv.flag){
   return  ElMessage.error(rv.msg);
  }
  const btn = getBtn("submit");
  btn.loading = true;
  const user = JSON.parse(sessionStorage.getItem("user"));
  const agreementBaseRef = formPage.value?.getComponentRefById('AgreementBase')
  cargoApi.submit({
    ...{user},
    sence:'arraigned',
    cEcAgrAppNo:agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo') || ''
  }).then((res: any) => {
    if(res.code === 200) {
      btn.loading = false;
      ElMessage.success(res.msg)
      formPage.value.setPageReadOnly(true);
      const submitBtn = formPage.value.getPageBtnRefById('submit')?.getConfig();
      submitBtn.disabled = true;
      tagsViewStore.delView({"name": "enteringDtl",
        "title": "录入明细",
        "path": "/protocolManagement/enteringDtl",
        "fullPath": "/protocolManagement/enteringDtl"}).then((res: any) => {
        router.replace({ path: "/protocolManagement/protocolEntering" });
      });
    }else {
      btn.loading = false;
      ElMessage.success(res.msg);
    }
  }).finally(() => {
    btn.loading = false;
  });
}
// 绑定特殊验证器
const exRules = {};

</script>
<style lang="scss" scoped>
</style>
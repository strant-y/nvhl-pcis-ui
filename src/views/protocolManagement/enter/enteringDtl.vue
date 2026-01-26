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
import { cloneDeep } from "lodash-es";
import moment from "moment";
import dayjs from "dayjs";
import Decimal from "decimal.js";
import {CommonConstants} from "@/constants/CommonConstants";
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
  user: JSON.parse(sessionStorage.getItem("user") || '{}'),
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
      imageManage();
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
  if( ['add','edit', 'orig'].includes(props.type)){
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
        AgreementFeeWarn?.setFormItem("ECargoBase.cPayWay",  {
        typeCode: 'ECargo_Pay_Ways',
        codeParam: { payway: 'all' }
      })
      await query();
    })
  }
	if (props.type === "add" || props.type === "orig") {
    const idata = getECargoData(idxParam);
    nextTick(()=>{
			formPage.value?.setFormDataById('AgreementBase',idata);
      // 新增选择预付
      if(props.payWay && props.payWay == '01'){
        // 设置默认值, 给表单下拉项赋值
        formPage.value?.setFormDataById('AgreementFeeWarn',{"ECargoBase.cPayWay": props.payWay })
        formPage.value?.setFormDataById('AgreementFeeWarn',{"ECargoBase.cReceivedRmb": "CNY" })
        const AgreementFeeWarn = formPage.value?.getComponentRefById('AgreementFeeWarn')
        AgreementFeeWarn.setFormItem("ECargoBase.cPayWay", {
          typeCode: 'ECargo_Pay_Ways',
          codeParam: { payway: 'prepay' },
          disabled: true
        })
      }else{
        formPage.value?.setFormDataById('AgreementFeeWarn',{"ECargoBase.cPayWay": props.payWay })
        formPage.value?.setFormDataById('AgreementFeeWarn',{"ECargoBase.cReceivedRmb": "CNY" })
        const AgreementFeeWarn = formPage.value?.getComponentRefById('AgreementFeeWarn')
        AgreementFeeWarn.setFormItem("ECargoBase.cPayWay",  {
          typeCode: 'ECargo_Pay_Ways',
          codeParam: { payway: 'nonPrepay' }
        })
      }
		})
	}
	// 协议续保
	if (props.type === "orig") {
		nextTick(() => {
			setTimeout(() => {
				props.param.res.res.composition = formPage.value?.convertData(props.param.res)
				console.log('query-ops',props.param.res)
				const res = props.param.res
			// 续保复制
			if (res) {
				cEcAgrAppNo.value = props.param.cEcAgrAppNo
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
						if (res["res"]["composition"]["AgreementEdrEcargoBase"]) {
							const EdrECargoBase = res["res"]["composition"]["AgreementEdrEcargoBase"][0];
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
							sessionStorage.setItem("nReceivedPrm", JSON.stringify(res["res"]["composition"]["AgreementBase"][0]));
							const newcEdrCtnt = res["res"]["composition"]["AgreementBase"][0]['ECargoBase.cCorrectContent']; //批文
							const cEdrRsnDetail = res["res"]["composition"]["AgreementBase"][0]['ECargoBase.cEdrRsnDetail'];
							const newcEdrRsnDetail = cEdrRsnDetail ? cEdrRsnDetail.split(',') : [props.param["cRsnCde"] || props.param["cEdrRsnBundleCde"]];
							if (props.param["cRsnCde"] != "FZ") {
							//   mainRef.value?.setxyedrbaseRefValue("EdrECargoBase.cEdrRsnDetail", [
							//     props.param["cRsnCde"] || props.param["cEdrRsnBundleCde"],
							//   ]);
								mainRef.value?.setxyedrbaseRefValue("EdrECargoBase.cEdrRsnDetail", newcEdrRsnDetail);
								mainRef.value?.setxyedrbaseRefValue("EdrECargoBase.cEdrCtnt", newcEdrCtnt);
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
				let dataForm: any = JSON.parse(JSON.stringify({ ...res.res.composition, AgreementBase: res.res.composition?.AgreementBase[0], AgreementApplicant: res.res.composition?.AgreementApplicant[0], AgreementFeeWarn: res.res.composition?.AgreementBase[0], AgreementAcctinfo: res.res.composition?.AgreementAcctinfo[0] }))
				delete dataForm.AgreementEdrEcargoBase
				delete dataForm.AgreementDistGoods
				delete dataForm.AgreementTgtSummary
				delete dataForm.AgreementDistInsured
				delete dataForm.AgreementDistTransport
				if (res.res.composition.AgreementTgtSummary.length > 0) {
					res.res.composition.AgreementTgtSummary.forEach(item => {
						const entries = Object.entries(item);
						Object.keys(item).forEach(k => delete item[k]);
						for (const [k, v] of entries) {
							item[k.replace(/^ECargoDistSummary\./, 'DistSummary.')] = v;
						}
					});
				}
				// const cEcAgrNo = res.res.composition.AgreementBase[0]['ECargoBase.cEcAgrNo']
				dataForm['AgreementBase']['ECargoBase.cRenewMrk'] = '1'
				dataForm['AgreementBase']['ECargoBase.cEcAgrNo'] = ''
				dataForm['AgreementBase']['ECargoBase.cOprCde'] = user.userName // 录单人为当前用户
				// dataForm['AgreementBase']['ECargoBase.cOrigPlyNo'] = cEcAgrNo
				dataForm.AgreementBase['ECargoBase.tOprTm'] = dayjs().format("YYYY-MM-DD 00:00:00")
				dataForm['AgreementBase']['ECargoBase.cAppStatus'] = ''
				dataForm['AgreementBase']['ECargoBase.cRiFacMrk'] = null
				dataForm['AgreementBase']['ECargoBase.cRiFacOpn'] = null
				dataForm['AgreementBase']['ECargoBase.cRiFacCde'] = null
				formPage.value?.setAllFormData( dataForm, {
					success: (pageData: any) => {
						pageInit()
					}
				});
				
				// 暂存数据
				console.log('缓存的数据',dataForm['AgreementSpecial'])
				sessionStorage.setItem("AgreementSpecial", JSON.stringify(dataForm['AgreementSpecial']));
				}
			}, 1000);
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
  }else{
    filter.push(...[
        'AgreementAcctinfo' // 临时关闭账号校验
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
  await nextTick()
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
  res["EdrECargoBase"] = mainRef.value?.getxyedrbaseRefValue();
  res["EdrECargoBase"]['EdrECargoBase.cEdrType'] = props.param?.cEdrType
  if (
      res["EdrECargoBase"]["EdrECargoBase.cEdrRsnDetail"] != null &&
      res["EdrECargoBase"]["EdrECargoBase.cEdrRsnDetail"] != "" &&
      Array.isArray(res["EdrECargoBase"]["EdrECargoBase.cEdrRsnDetail"])
  ) {
    res["EdrECargoBase"]["EdrECargoBase.cEdrRsnDetail"] =
        res["EdrECargoBase"]["EdrECargoBase.cEdrRsnDetail"].join();
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
				if (dataRes.code === 200) {
          console.log('dataRes["data"]["composition"]["AgreementCvrg"]',dataRes["data"]["composition"]["ECargoTerm"])
          formPage.value?.setFormDataById('AgreementCvrg',dataRes["data"]["composition"]["ECargoTerm"])
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
  res["EdrECargoBase"] = mainRef.value?.getxyedrbaseRefValue();
  res["EdrECargoBase"]['EdrECargoBase.cEdrType'] = props.param?.cEdrType
  if (
      res["EdrECargoBase"]["EdrECargoBase.cEdrRsnDetail"] != null &&
      res["EdrECargoBase"]["EdrECargoBase.cEdrRsnDetail"] != "" &&
      Array.isArray(res["EdrECargoBase"]["EdrECargoBase.cEdrRsnDetail"])
  ) {
    res["EdrECargoBase"]["EdrECargoBase.cEdrRsnDetail"] =
        res["EdrECargoBase"]["EdrECargoBase.cEdrRsnDetail"].join();
  }
  const resToSave = cloneDeep(res);
  resToSave.AgreementBase['ECargoBase.cOprCde'] = user.opCde;
  const edrInfo: any = await cargoApi.saveEdrEcargo({
    ...resToSave,
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
            console.log('dataRes["data"]["composition"]["AgreementCvrg"]',dataRes["data"]["composition"]["ECargoTerm"])
            formPage.value?.setFormDataById('AgreementCvrg',dataRes["data"]["composition"]["ECargoTerm"])
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
	const agreementBaseRef = formPage.value?.getComponentRefById('AgreementBase')
	const cEcAgrAppNo = agreementBaseRef['ECargoBase.cEcAgrAppNo']
	if (!cEcAgrAppNo && props.param["cRsnCde"] == 'Y01') {
		ElMessage.error("请先保存申请单!");
		return false
	}
  const btn = getBtn("btnCompare");
  btn.loading = true;
  const res = formPage.value?.getAllFormData();
  res["user"] = user;
  res["plyBase"] = {'Base.cDptCde':'','Base.cProdNo':''}
  res["plyBase"]["Base.cDptCde"] = props.param.cDptCde;
  res["plyBase"]["Base.cProdNo"] = '029900';
  res["EdrECargoBase"] = mainRef.value?.getxyedrbaseRefValue();
  res["EdrECargoBase"]['EdrECargoBase.cProdNo'] = '029900';
	res["EdrECargoBase"]['EdrECargoBase.cEdrType'] = props.param?.cEdrType
	// 协议批改获取批文不需要传被保人清单，运输信息，标的信息，标的信息汇总
	'AgreementDistInsured' in res && delete res['AgreementDistInsured'];
	'AgreementDistTransport' in res && delete res['AgreementDistTransport'];
	'AgreementDistGoods' in res && delete res['AgreementDistGoods'];
	'AgreementTgtSummary' in res && delete res['AgreementTgtSummary'];
	
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
const getSurrenderPrecisFun = () => {
	const agreementBaseRef = formPage.value?.getComponentRefById('AgreementBase')
	const cEcAgrAppNo = agreementBaseRef['ECargoBase.cEcAgrAppNo']
	if (!cEcAgrAppNo && props.param["cRsnCde"] == 'Y01') {
		ElMessage.error("请先保存申请单!");
		return false
	}
  const btn = getBtn("btnCompare");
  btn.loading = true;
  const res = formPage.value?.getAllFormData();
  res["user"] = user;
  res["plyBase"] = {'Base.cDptCde':'','Base.cProdNo':''}
  res["plyBase"]["Base.cDptCde"] = props.param.cDptCde;
  res["plyBase"]["Base.cProdNo"] = '029900';
  res["EdrECargoBase"] = mainRef.value?.getxyedrbaseRefValue();
  res["EdrECargoBase"]['EdrECargoBase.cProdNo'] = '029900';
	res["EdrECargoBase"]['EdrECargoBase.cEdrType'] = props.param?.cEdrType
	// 协议批改获取批文不需要传被保人清单，运输信息，标的信息，标的信息汇总
	'AgreementDistInsured' in res && delete res['AgreementDistInsured'];
	'AgreementDistTransport' in res && delete res['AgreementDistTransport'];
	'AgreementDistGoods' in res && delete res['AgreementDistGoods'];
	'AgreementTgtSummary' in res && delete res['AgreementTgtSummary'];
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
		if (res.code === 200) {
			const ops: any = formPage.value?.convertData(res)
      console.log('query-ops',ops)
      console.log('query-res',res)
      ElMessage.success('查询成功');
      cEcAgrAppNo.value = ops["AgreementBase"][0]['ECargoBase.cEcAgrAppNo'] || ''
      if(cEcAgrAppNo.value){
        eventBus.emit('goodsChange', cEcAgrAppNo.value);
        eventBus.emit('insuredChange', cEcAgrAppNo.value);
        eventBus.emit('transportChange', cEcAgrAppNo.value);
      }
      const pageInit = () => {
        //协议费用
        // const AgreementFeeWarn = formPage.value?.getComponentRefById('AgreementFeeWarn');
        // AgreementFeeWarn.setItemShow()
				// audit，E-协议审核批单展示批改信息和批改比较项，不能修改
        if (props.type === 'EDR_APP_NEW_SCENE' || (props.type === "audit" && props.param.cAppTyp == 'E')) {        
					// if (props.type === 'EDR_APP_NEW_SCENE') {        
          if (ops["AgreementEdrEcargoBase"]) {
            const EdrECargoBase = ops["AgreementEdrEcargoBase"][0];
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
            sessionStorage.setItem("nReceivedPrm", JSON.stringify(ops["AgreementBase"][0]));
            const newcEdrCtnt = ops["AgreementBase"][0]['ECargoBase.cCorrectContent']; //批文
            const cEdrRsnDetail = ops["AgreementBase"][0]['ECargoBase.cEdrRsnDetail'];
            const newcEdrRsnDetail = cEdrRsnDetail ? cEdrRsnDetail.split(',') : [props.param["cRsnCde"] || props.param["cEdrRsnBundleCde"]];
            if (props.param["cRsnCde"] != "FZ") {
            //   mainRef.value?.setxyedrbaseRefValue("EdrECargoBase.cEdrRsnDetail", [
            //     props.param["cRsnCde"] || props.param["cEdrRsnBundleCde"],
            //   ]);
              mainRef.value?.setxyedrbaseRefValue("EdrECargoBase.cEdrRsnDetail", newcEdrRsnDetail);
              mainRef.value?.setxyedrbaseRefValue("EdrECargoBase.cEdrCtnt", newcEdrCtnt);
            }
          }
          formPage.value?.setPageReadOnly(true, [], {
            success: (pageData: any) => {
							// audit，E-协议审核批单展示批改信息和批改比较项，不能修改
							if (props.type === "audit" && props.param.cAppTyp == 'E') return
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
      let dataForm:any ={...ops,AgreementBase:ops?.AgreementBase[0],AgreementApplicant:ops?.AgreementApplicant[0],AgreementFeeWarn:ops?.AgreementBase[0] ,AgreementAcctinfo:ops?.AgreementAcctinfo[0]  }
      delete dataForm.AgreementEdrEcargoBase
      delete dataForm.AgreementDistGoods
      delete dataForm.AgreementTgtSummary
      delete dataForm.AgreementDistInsured
      delete dataForm.AgreementDistTransport
      if(props.type === 'EDR_APP_NEW_SCENE' && props.param.cAppStatus !== '1'){
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
      // 协议暂存单进来要把代理经纪人、代理合作协议、代理业务员、代理业务执业证号、代理业务员机构代码、业务员员工号、业务员名称、业务员电话、业务员机构代码、业务员执业证号清空
      if(props.type === 'edit' && props.param?.cAppTyp === 'A') {
        const clearList = ['ECargoBase.cBrkrCde','ECargoBase.cAgtAgrNo','ECargoBase.cBrkSlsCde','ECargoBase.cCertfNo','ECargoBase.cBrkrDptcde','ECargoBase.cSlsId','ECargoBase.cSlsNme','ECargoBase.cSlsTel','ECargoBase.cSlsDptcde','ECargoBase.cSlsCde']
        clearList.forEach((item:any) => {
          if(dataForm['AgreementBase']?.[item]) {
            dataForm['AgreementBase'][item] = null;
          }
        })
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
			if (res.code === 200) {
				const ops: any = formPage.value?.convertData(res)
      	console.log('query-ops',ops)
        const dataForm:any ={...ops,AgreementBase:ops?.AgreementBase[0],AgreementApplicant:ops?.AgreementApplicant[0],AgreementFeeWarn:ops?.AgreementBase[0]}
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
  try {
    const agreementBaseRef = formPage.value?.getComponentRefById('AgreementBase')
    //协议费用
    const AgreementFeeWarn = formPage.value?.getComponentRefById('AgreementFeeWarn');
    const allFromData = formPage.value?.getAllFormData();
    const pgxx = mainRef.value?.getxyedrbaseRefValue()
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
      const cCiMrk = agreementBaseRef.value?.getValue('EdrECargoBase.cCiMrk');
      if(agreementCi && cCiMrk !='0'){
        const formValue = agreementCi.getFormValue();
        if (formValue && formValue.length > 0) {
          // 触发第一行数据的 nCiShareChange 方法
          agreementCi.setValueByRowKey('ECargoCi.nCiShare', formValue[0]._dataId, formValue[0]['ECargoCi.nCiShare']);
        }
      }
      if(props.type === 'EDR_APP_NEW_SCENE') {// 批改
        const nReceivedPrm = AgreementFeeWarn?.getFormValue()?.['ECargoBase.nReceivedPrm'] || 0;// 预收保费
        const nBefEdrReceivedPrm = mainRef.value?.getxyedrbaseRefValue()?.['EdrECargoBase.nBefEdrReceivedPrm'] || 0;// 原预收保费
        mainRef.value?.setxyedrbaseRefValue("EdrECargoBase.nReceivedPrm", nReceivedPrm);// 现预收保费
        mainRef.value?.setxyedrbaseRefValue("EdrECargoBase.nReceivedPrmVar", decimalMinus(nReceivedPrm, nBefEdrReceivedPrm));// 预收保费变化
      }
      if(props.param?.cEdrType == '3') {
        // 一般退保 修改后的预收保费不能大于原预收保费 YY
        if(props.param?.cRsnCde === 's2') {
          if(allFromData.AgreementFeeWarn?.['ECargoBase.nRmbReceivedPrm'] <= 0) {
            ElMessage.error('一般退保预收保费必须大于0！')
            return
          }
          if(allFromData.AgreementFeeWarn?.['ECargoBase.nRmbReceivedPrm'] >= pgxx['EdrECargoBase.nBefEdrReceivedPrm']) {
            ElMessage.error('一般退保预收保费不能大于原预收保费！')
            return
          }
        } else {// 全单退保 预收保费设置为0 YY
          AgreementFeeWarn.setValue('ECargoBase.nReceivedPrm',0)
        }
      }
      // 全单注销（YY:预收保费设置0  AY:预估保费设置0）
      if(props.param?.cEdrType == '2') {
        if(props.param?.cEdrFlag === "YY") {
          AgreementFeeWarn.setValue('ECargoBase.nReceivedPrm',0)
          mainRef.value?.setxyedrbaseRefValue("EdrECargoBase.nReceivedPrm", 0);// 现预收保费
          mainRef.value?.setxyedrbaseRefValue("EdrECargoBase.nReceivedPrmVar", decimalMinus(0, pgxx['EdrECargoBase.nBefEdrReceivedPrm']));// 预收保费变化
        } else {
          AgreementFeeWarn.setValue('ECargoBase.nPrm',0)// 预估保费
          AgreementFeeWarn.setValue('ECargoBase.nRmbPrm',0)// 折人民币预估保费
          mainRef.value?.setxyedrbaseRefValue('EdrECargoBase.nPrm',0)// 批改信息中的现保费
          mainRef.value?.setxyedrbaseRefValue('EdrECargoBase.nPrmVar',decimalMinus(0,pgxx['EdrECargoBase.nBefEdrPrm']))// 批改信息中的保费变化
        }
      }
      nextTick(() => {
        // 生成缴费计划
        const base = agreementBaseRef?.getFormValue();
        const applicant = formPage.value?.getComponentRefById('AgreementApplicant')?.getFormValue();
        const insrnc = AgreementFeeWarn?.getFormValue();
        const payList = formPage.value?.getComponentRefById('AgreementPay')?.getFormValue() || [];
        const payInfo = setPayInfo(base, applicant, insrnc, payList);
        formPage.value?.getComponentRefById('AgreementPay')?.setFormValue(payInfo);
      })
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
// 生成缴费计划内容
const setPayInfo = (base: any, applicant: any, insrnc: any, list: any) => {
  let payList: any[] = [];
  const pay: any = {};
  const edrbaseData = mainRef.value?.getxyedrbaseRefValue();
  if(props.type === 'EDR_APP_NEW_SCENE') {// 批改
    // 退保和注销直接在原有的条数上新增1条
    if(props.param?.cEdrType === '2' || props.param?.cEdrType === '3') {
      payList = [...list];
    } else {
      // 根据批改次数决定缴费计划生成几条（0 总共1条；1 总共2条，以此类推）
      if(edrbaseData && edrbaseData['EdrECargoBase.nEdrPrjNo'] >= 0 && list.length > 0) {
        payList = list.slice(0, edrbaseData['EdrECargoBase.nEdrPrjNo']);
      }
    }
  }
  pay["ECargoPay.nTms"] = payList.length + 1;
  if (applicant) {
    pay["ECargoPay.cPayorCde"] = applicant["ECargoApplicant.cAppCde"];
    pay["ECargoPay.cPayorNme"] = applicant["ECargoApplicant.cAppNme"];
  } else {
    pay["ECargoPay.cPayorCde"] = "";
    pay["ECargoPay.cPayorNme"] = "";
  }
  const eCargoCiList = formPage.value?.getComponentRefById('AgreementCi')?.getFormValue() || [];
  let share = 0;
  if(eCargoCiList && eCargoCiList.length > 0) {
    eCargoCiList.forEach((item:any) => {
      if (item["ECargoCi.cCoinsurerCde"] === "327001") {
        share += Number(item["ECargoCi.nCiShare"]) || 0;
      }
    })
  }
  if(props.type === 'EDR_APP_NEW_SCENE') {// 批改
    if(props.payWay == '01' || props.param?.cEdrFlag === "YY") {// YY：应收保费= 预收保费变化 * 预收保费汇率
      // pay["ECargoPay.nPayablePrm"] = decimalTimes(edrbaseData['EdrECargoBase.nReceivedPrmVar'], insrnc["ECargoBase.nReceivedRate"]);
      pay["ECargoPay.nPayablePrm"] = edrbaseData['EdrECargoBase.nReceivedPrmVar'];
    } else {// AY:应收保费= 预估保费变化 * 预估保费汇率
      // pay["ECargoPay.nPayablePrm"] = decimalTimes(edrbaseData['EdrECargoBase.nPrmVar'], insrnc["ECargoBase.nPrmRmbExch"]);
      pay["ECargoPay.nPayablePrm"] = edrbaseData['EdrECargoBase.nPrmVar']
    }
    // 我司保费: 应收保费 * 我司比例
    pay["ECargoPay.nOwnPrm"] = base["ECargoBase.cCiMrk"] == "0" ? pay["ECargoPay.nPayablePrm"] : decimalTimes(share, pay["ECargoPay.nPayablePrm"]);
    pay["ECargoPay.nPrmVar"] = pay["ECargoPay.nPayablePrm"];
  } else {
    if(props.payWay == '01') {// 预付
      // 应收保费: 折人名币预收保费
      pay["ECargoPay.nPayablePrm"] = insrnc["ECargoBase.nReceivedPrm"] ? insrnc["ECargoBase.nReceivedPrm"] : 0;
      // 我司保费: 折人民币我司协议剩余预收保费(应收保费 * 我司比例)
      pay["ECargoPay.nOwnPrm"] = base["ECargoBase.cCiMrk"] == "0" ? pay["ECargoPay.nPayablePrm"] : decimalTimes(share, pay["ECargoPay.nPayablePrm"]);
    } else {// 非预付
      // 应收保费: 折人名币预估保费
      pay["ECargoPay.nPayablePrm"] = insrnc["ECargoBase.nPrm"] ? insrnc["ECargoBase.nPrm"] : 0;
      // 我司保费: 折人民币我司预估保费(应收保费 * 我司比例)
      pay["ECargoPay.nOwnPrm"] = base["ECargoBase.cCiMrk"] == "0" ? pay["ECargoPay.nPayablePrm"] : decimalTimes(share, pay["ECargoPay.nPayablePrm"]);
    }
    pay["ECargoPay.nPrmVar"] = pay["ECargoPay.nPayablePrm"];
  }

  pay["ECargoPay.tPayBgnTm"] = moment(insrnc["ECargoBase.tAppTm"]).format(
    "YYYY-MM-DD HH:mm:ss"
  );
  pay["ECargoPay.tPayEndTm"] = moment(insrnc["ECargoBase.tInsrncBgnTm"]).add(29, 'days').endOf('day').format(
    "YYYY-MM-DD HH:mm:ss"
  );
  pay["ECargoPay.cProdNo"] = base["ECargoBase.cProdNo"];
  payList.push(pay);
  return payList;
};
async function save() {
  let isOk = false
  let processedData = { ...formPage.value?.getAllFormData() }; 
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
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
  const dataToSave = cloneDeep(processedData);
  // 如果AgreementBase和AgreementFeeWarn中的tInsrncBgnTm、tInsrncEndTm、tAppTm的入参值不一样，要修改成一样的
  const tInsrncBgnTm1 = dataToSave.AgreementBase['ECargoBase.tInsrncBgnTm']
  const tInsrncBgnTm2 = dataToSave.AgreementFeeWarn['ECargoBase.tInsrncBgnTm']
  if(tInsrncBgnTm1 && tInsrncBgnTm2 && new Date(tInsrncBgnTm1).getTime() !== new Date(tInsrncBgnTm2).getTime()) {
    dataToSave.AgreementFeeWarn['ECargoBase.tInsrncBgnTm'] = tInsrncBgnTm1
  }
  const tInsrncEndTm1 = dataToSave.AgreementBase['ECargoBase.tInsrncEndTm']
  const tInsrncEndTm2 = dataToSave.AgreementFeeWarn['ECargoBase.tInsrncEndTm']
  if(tInsrncEndTm1 && tInsrncEndTm2 && new Date(tInsrncEndTm1).getTime() !== new Date(tInsrncEndTm2).getTime()) {
    dataToSave.AgreementFeeWarn['ECargoBase.tInsrncEndTm'] = tInsrncEndTm1
  }
  const tAppTm1 = dataToSave.AgreementBase['ECargoBase.tAppTm']
  const tAppTm2 = dataToSave.AgreementFeeWarn['ECargoBase.tAppTm']
  if(tAppTm1 && tAppTm2 && new Date(tAppTm1).getTime() !== new Date(tAppTm2).getTime()) {
    dataToSave.AgreementFeeWarn['ECargoBase.tAppTm'] = tAppTm1
  }
	dataToSave.AgreementBase['ECargoBase.cOprCde'] = user.opCde;
	let params = {
    ...dataToSave,
    AgreementDistGoods:null,
   	AgreementTgtSummary:null,
   	AgreementDistInsured:null,
   	AgreementDistTransport:null,
    ...{},
    ...{user},
    sence:'save'
	}
	console.log('paramsparamsparamsparams',params)
  const res = await cargoApi.save(params)
    if(res.code === 200) {
      isOk = true
      ElMessage.success(res.msg)
      resData.value = res.res['composition']['ECargoBase'][0]
      const agreementBaseRef = formPage.value?.getComponentRefById('AgreementBase')
      agreementBaseRef.setValue('ECargoBase.cEcAgrNo', resData.value['ECargoBase.cEcAgrNo'])
      agreementBaseRef.setValue('ECargoBase.cEcAgrAppNo', resData.value['ECargoBase.cEcAgrAppNo'])
      agreementBaseRef.setValue('ECargoBase.cAppTyp', resData.value['ECargoBase.cAppTyp'] || '')
    	cEcAgrAppNo.value = resData.value['ECargoBase.cEcAgrAppNo']
    	if(cEcAgrAppNo.value && !saveDistBatchFlag.value && props.isActive === '0' && props.type === "orig"){
				const param: any = idxParam.param
				let data = param?.renewalComponent
				const val = {
					cEcAgrAppNo: param.cEcAgrAppNo,
					targetNo: cEcAgrAppNo.value,
					cRsnCde: param.cRsnCde,
					cComponentTables: data && typeof data === 'object' && !Array.isArray(data)? Object.keys(data).join(',') : '',
				}
     		const result:any = await copyDist(val)
      	if(result && result.code === 200) {
        	console.log('copy成功')
       		const dataRes:any = await cargoApi.init({
          	...idxParam.param,
         		cEcAgrAppNo:cEcAgrAppNo.value,
          	...{}
        	})
					if(dataRes.code === 200) {
						console.log('dataRes["data"]["composition"]["AgreementCvrg"]',dataRes["data"]["composition"]["ECargoTerm"])
						formPage.value?.setFormDataById('AgreementCvrg',dataRes["data"]["composition"]["ECargoTerm"])
					}
					eventBus.emit('goodsChange', cEcAgrAppNo.value);
					eventBus.emit('insuredChange', cEcAgrAppNo.value);
					eventBus.emit('transportChange', cEcAgrAppNo.value);
					saveDistBatchFlag.value = true
				} else {
					ElMessage.error(result.msg);
				}
			}
    }else {
      isOk = false
      ElMessage.success(res.msg);
    }
    return isOk
}
function imageManage() {
  const allFromData = formPage.value?.getAllFormData();
  const base = allFromData['AgreementBase'];
  if(base?.['ECargoBase.cOprCde'] == user.opCde) {
    imageUploadManage()
  } else {
    imageView()
  }
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
  await nextTick()
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

// 将1,000,000格式的数字转成可以计算的数值
function convertNumber(val:any) {
  if (val === null || val === undefined || val === '' || val === 0) {
    return val;
  }
  const num = Number(val.toString().replace(/,/g, ''));
  return isNaN(num) ? val : num;
}

function decimalTimes(a:any,b:any) {
  const v1 = convertNumber(a)
  const v2 = convertNumber(b)
  return new Decimal(v1).times(new Decimal(v2)).toNumber()
}

function decimalMinus(a:any,b:any) {
  const v1 = convertNumber(a)
  const v2 = convertNumber(b)
  return new Decimal(v1).minus(new Decimal(v2)).toNumber()
}


// 复制出单和模板出单清空原有的申请单号
const clearKeyMap = ["cPkId","cAppNo","tUpdTm","cEdrNo","cLatestMrk","nEdrPrjNo","tCrtTm","cPlyNo","cCrtCde","cUpdCde","cEcAgrNo"]
function clearCAppNo(res:any, mapList:any = clearKeyMap) {
	if(res instanceof Array) {
		res.forEach((item:any) => {
			item = clearCAppNo(item, mapList)
		})
	} else if(res instanceof Object) {
		for (const key in res) {
			if(res[key] instanceof Object || res[key] instanceof Array) {
				res[key] = clearCAppNo(res[key], mapList)
			} else if (res.hasOwnProperty(key)) {
				if(key.indexOf('.') !== -1) {
					const k0 = key.split('.')[0];
					const k1 = key.split('.')[1];
					if(mapList.indexOf(k1) !== -1) {
						res[`${k0}.${k1}`] = null
					}
				} else {
					if(key === "cEcAgrNo") {
						res[key] = null
					}
				}
			}
		}
	} else {
		res = null
	}
	return res;
}
</script>
<style lang="scss" scoped>
</style>
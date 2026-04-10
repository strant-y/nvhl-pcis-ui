<template>
  <div class="main-content"
       v-loading.fullscreen.lock="pageLoading"
       :element-loading-text="loadingText"
       element-loading-background="rgba(0, 0, 0, 0.6)"
  >
      <div class="left_content" v-if="anchorConfig">
        <div class="_anchor" style="overflow: auto">
          <anchor-collapse :anchor-list="anchorConfig" @collapse-change="activeChange"/>
        </div>
      </div>
      <div class="center_content">
        <div id="positeList" style="margin-bottom: 7px;" v-show="positeListShow">
          <posite-list ref="prodListRef" :prod-list="productList" @prod-list-change="prodListChange"/>
        </div>
        <template v-if="commonComp">
          <group-common
              :group-id="commonComp.groupId"
              :group-config="commonComp"
              :index="0"
          />
        </template>
        <template v-if="formComp">
          <group-form
              v-for="(group, idx) in formComp"
              :group-id="group.groupId"
              :group-config="group"
              :index="idx"
              :key="idx"
          />
        </template>
        <div class="fixed bottom-0 right-0 bottom-items">
          <!--新增的申请单号显示和复制按钮-->
          <!--      <div style="margin-right: auto; display: flex; align-items: center;">-->
          <!--        <div style="display: flex; align-items: center; background: #fff; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);white-space: nowrap; padding: 5px 10px;">-->
          <!--          组合单号   -->
          <!--          <span id="policyNumber" style="margin-left: 5px; margin-right: 5px; font-weight: bold;">-->
          <!--              {{ getNo }}-->
          <!--              </span>-->
          <!--          <el-tooltip :content="`点击复制${props.param?.pageName === 'priceInquiry' ? '询价单号' : '申请单号'}`" placement="top">-->
          <!--            <el-button @click="copyPolicyNumber" circle size="small" style="color: red;margin-right: 0;">-->
          <!--              <rt-icon :item="{ icon: 'DocumentCopy' }" style="font-size: 22px;" />-->
          <!--            </el-button>-->
          <!--          </el-tooltip>-->
          <!--        </div>-->
          <!--      </div>-->
          <template v-for="(bth, idx) in bthList"
                    :key="idx">
            <template v-if="bth.isdivider">
              <el-divider direction="vertical" />
            </template>
            <template v-else>
              <rt-button
                  :item="bth"
                  :loading="bth.loading"
              />
            </template>
          </template>
        </div>
      </div>
<!--    右侧悬浮按钮-->
<!--      <div class="right-sidebar-trigger">-->
<!--        <el-popover-->
<!--            placement="left"-->
<!--            trigger="click"-->
<!--            :width="120"-->
<!--            popper-class="action-menu-popper"-->
<!--        >-->
<!--          <template #reference>-->
<!--            <el-button-->
<!--                circle-->
<!--                class="menu-trigger"-->
<!--            >-->
<!--              <img src="@/assets/icons/ExpandLeft.svg" alt="Expand Left" width="30" height="30" />-->
<!--            </el-button>-->
<!--          </template>-->
<!--          <div class="btns-content">-->
<!--            <el-button-->
<!--                v-for="(btn, idx) in rightBtnList"-->
<!--                :key="idx"-->
<!--                :icon="btn.icon"-->
<!--                @click="btn.func"-->
<!--                style="margin-bottom: 1px;"-->
<!--                class="flex-center"-->
<!--            >-->
<!--              <svg-icon-->
<!--                  v-if="btn.svgIcon"-->
<!--                  :icon-class="btn.svgIcon"-->

<!--                  :size="(btn.iconSize || '16') + 'px'"-->
<!--                  style="margin-right: 8px; transition: all 0.3s"-->
<!--              />-->
<!--              <span>{{ btn.label }}</span>-->
<!--            </el-button>-->
<!--          </div>-->
<!--        </el-popover>-->
<!--      </div>-->
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import anchorCollapse from './component/anchor/anchor.vue';
import type {AnchorItem, GroupForm} from './component';
import {useDzModal} from "@/common/dzmodel/DzModalService";
import {
  CommonComponentMap,
  CompositePageConfigType,
  CompositePageView,
  POSITE_PAGE_TYPE_APP,
  POSITE_PAGE_TYPE_READ,
  POSITE_PAGE_TYPE_SAVE,
} from "@/views/pcis/support/composite.types";
import positeList from "@/views/pcis/composite/component/posite-list/index.vue";
import groupForm from "@/views/pcis/composite/component/group-form/group-form.vue";
import groupCommon from "@/views/pcis/composite/component/group-form/group-common.vue";
import {createFreeButtonBase, FreeButtonBase} from "@/shared/button-config";
import positeApi from "@/api/posite";
import {clearCodeListViewByPageKey, clearDataOpertaorByPageKey, useUserStore} from "@/store";
import { lessThan6Months, toDate } from "@/utils/date";
import dayjs from "dayjs";
import moment from "moment";
import {imageMethod} from "@/views/pcis/my-page/imageMethod";

//发票信息
const invoiceInfoModel = defineAsyncComponent(
    () => import("@/views/pcis-new-udr-list/common/invoice-info-model.vue")
);

//反洗钱
const amlExtendInfo = defineAsyncComponent(
    () => import("@/views/pcis-main/prodDef/common/aml-extend-info/index.vue")
);

const props:any = defineProps({
  param: {
    type: Object,
  },
});

const userStore = useUserStore();
const router = useRouter();
const dzmodal = useDzModal();
const pageView = ref<CompositePageView>(new CompositePageView());
pageView.value.autoAssignTabKeys.push(...['plyBase', 'insured', 'AgentTgt', 'base', 'tgt', 'applicant'])
provide("pageView", pageView);
const positeListShow = ref<boolean>(false);
const productList = ref<any[]>([]);
const pageLoading = ref<boolean>(false);
const loadingText = ref<string>('加载中...');
const rightBtnList = ref<FreeButtonBase[]>();
const prodListRef = ref();
const user = userStore.user;
let controlFlag = ""; // 用来处理反洗钱 页面窜窜以及显示

const commonComp = computed(() => pageView.value.pageConfig[0])
const formComp = computed(() => pageView.value.pageConfig.filter((item, idx) => idx > 0))
const anchorConfig = computed(() => pageView.value.anchorConfig)

const bthList = ref<FreeButtonBase[]>([
  createFreeButtonBase({
    label: "保费计算",
    type: "primary",
    id: "btn010101",
    func: () => {
      calcPremium()
    },
  }),
  createFreeButtonBase({
    label: "保存",
    type: "primary",
    id: "btn010102",
    func: () => {
      saveOpt()
    },
  }),
  createFreeButtonBase({
    label: "申请核保",
    type: "primary",
    id: "btn010103",
    func: () => {
      submitToUndrFn();
    },
  }),
  createFreeButtonBase({
    label: "发票信息",
    type: "success",
    id: "btn010104",
    func: () => {
      setTaxInfo();
    },
  }),
  createFreeButtonBase({
    label: "反洗钱扩展信息",
    type: "success",
    id: "btn010105",
    func: () => {
      setCusBenefitInfo({});
    },
  }),
  createFreeButtonBase({
    label: '影像管理',
    type: "warning",
    id: "btn010106",
    func: () => {
      imageMethod.showImage({});
    },
  }),
]);

const needCalc = ref(true);
const nPrmMap = reactive<Record<string, number>>({});
const nAmtMap = reactive<Record<string, number>>({});

const setNPrmMap = (prodNo: string, nPrm: number) => {
  nPrmMap[prodNo] = nPrm;
}
const getNPrmMap = (prodNo: string) => {
  return nPrmMap[prodNo];
}
const setNAmtMap = (prodNo: string, nAmt: number) => {
  nAmtMap[prodNo] = nAmt;
}
const getNAmtMap = (prodNo: string) => {
  return nAmtMap[prodNo];
}

/**
 * 页面结构数据组装完之后 组件开始加载之前执行
 * @param config
 */
pageView.value.beforeCreation = function(config: CompositePageConfigType) {
  return new Promise((resolve) => {
    const {anchorConfig, pageConfig} = config;
    const initType = props.param.initType;

    if(initType === POSITE_PAGE_TYPE_APP) {

    } else if (initType === POSITE_PAGE_TYPE_SAVE) {

    } else if (initType === POSITE_PAGE_TYPE_READ) {

    }

    anchorConfig.forEach((anchor: AnchorItem) => {

    })

    pageConfig.forEach((item: GroupForm) => {
      if(item.groupId.includes('000000')) {
        item.pageInfo.forEach(comp => {
          // 隐藏 申请单号
          comp
              .pageSchema
              ?.fromSchema
              ?.forEach((ys: any) => {
            if(ys.prop.includes('cAppNo')) {
              ys.hidden = true;
            }
          })
        })
      }else {
      }
    })
    console.info('### info anchorConfig', anchorConfig);
    console.info('### info pageConfig', pageConfig);
    resolve({
      anchorConfig: anchorConfig,
      pageConfig: pageConfig,
    });
  })
}

onBeforeMount(() => {
  console.log('props.param', props.param);
  if(props.param) {
    const initType = props.param.initType;
    const loading = openPageLoading();
    // 初始化模板信息
    initTemplateData();
    // 存储路由参数
    pageView.value.setPageParams(props.param);
    // 初始化页面结构
    pageView.value.buildPage(props.param.cProdDtlList).then((result: any) => {
      console.log('onBeforeMount - pageView.buildPage result: ', result);
      nextTick(() => {
        // 页面加载完后再显示产品列表组件
        positeListShow.value = true;
        if(initType === POSITE_PAGE_TYPE_APP) {
          // 申请
          appInit();
          loading.close();
        }else {
          // 暂存、 批改、核保、查看 查询
          positeApi.queryPositeInfo({...props.param, ...{queryType: initType}}).then((res: any) => {
            if (res.code === 200) {
              const resultData = res.data;
              if(initType === POSITE_PAGE_TYPE_SAVE) {
                saveInit(resultData)
              }else if(initType === POSITE_PAGE_TYPE_READ) {
                readInit(resultData)
              }
            } else {
              ElMessage.error(res.msg ? res.msg : "初始化请求异常");
            }
            loading.close();
          }).catch((err) => {
            ElMessage.error(err);
            loading.close();
          })
        }
      });
    })
  }
});

function appInit() {
  pageView.value.initPageData();
  inti06PlanData()
  console.log('appInit');
}
function saveInit(pageData: any) {
  const data = trimPageData(pageData);
  pageView.value.setPageAllData(data);
  inti06PlanData(data)
  console.log('saveInit', data);
}
function readInit(pageData: any) {
  const data = trimPageData(pageData);
  prodListRef.value?.setDisabledAll();
  pageView.value.setPageAllData(data);
  pageView.value.setPageDisabledAll();
  bthList.value.forEach((item: any) => {
    if(item && [
      'btn010101',
      'btn010102',
      'btn010103',
      'btn010104',
      'btn010105',
      'btn010106'
    ].includes(item.id)) {
      item.disabled = true;
    }
  })
  console.log('readInit', data);
}

/**
 * 意健险方案数据初始化
 */
const inti06PlanData = (data?: any) => {
  const prodList06 = productList.value.filter((prod: any) => prod.cKindNo === '06' && prod.cPlanNo)
  console.log('prodList06', prodList06)
  if(data) {
    const dataKeys = Object.keys(data)
    if(prodList06.some(prod => dataKeys.includes(prod.cProdNo))) {
      console.log('dataKeys', dataKeys)
      return;
    }
  }
  if(prodList06 && prodList06.length > 0) {
    positeApi.getYjxPlanInfo({
      planNo: prodList06.map(p => p.cPlanNo).join(',')
    }).then((res: any) => {
      console.log('getYjxPlanInfo-res', res)
      if(res.code === 200) {
        const planList: any[] = res.data
        prodList06.forEach((prod: any) => {
          const opertaor = pageView.value.getDataOpertaorByProdNo(prod.cProdNo)
          if(opertaor) {
            const yjxPlan = opertaor.getTableRefs()['yjxPlan']
            if(yjxPlan) {
              yjxPlan.setFormValue(planList.filter(p => p['PlanBase.cPlanNo'] === prod.cPlanNo))
            }
          }
        })
      }
    })
  }
}

const prodListChange = (list: any[]) => {
  console.log('prodListChange', prodListChange)
  const loading = openPageLoading();
  const newParams = getNewParams({
    cProdDtlList: list,
    cProdList: list.map((item: any) => item['cProdNo'])
  });
  router.replace({
    path: "/pcisapp/posite-page",
    query: {
      param: JSON.stringify({...newParams}),
    },
  }).then(() => {
    console.log('replace props.param', props.param);
    // 更新大页面工具中的公共参数
    pageView.value.setPageParams(props.param);
    pageView.value.buildPage(list).then((result: any) => {
      console.log('prodListChange - pageView.buildPage result: ', result);
      loading.close();
    })
  }).catch((err) => {
    console.error('prodListChange error ! ', err);
  })
};

const activeGroup = ref<AnchorItem[]>([
  {
    id: "000000",
    title: "000000-公共信息",
    children: []
  }
]);


// 处理锚点数据更新
const activeChange = (activeItems: AnchorItem[]) => {
  activeGroup.value[0] = activeItems[0];
};

/**
 * 保存
 */
const saveOpt = async (isret: boolean = true) => {
  const btn = getBtn('btn010102')
  btn.loading = true;
  const allData = pageView.value.getPageAllData();
  const params = {param: props.param, data: allData, user: userStore.user}
  console.log('saveOpt-params', params);
  const res = await positeApi.savePositeInfo(params)
  console.log('savePositeInfo-res', res);
  if(res.code === 200) {
    if(isret) {
      const pageData = trimPageData({...res.data});
      const cCombinationNo = productList.value[0]['cCombinationNo']
      const newParams = getNewParams({
        initType: POSITE_PAGE_TYPE_SAVE,
        cCombinationNo: cCombinationNo,
        cProdDtlList: productList.value,
      });
      router.replace({
        path: "/pcisapp/posite-page",
        query: {
          param: JSON.stringify({...newParams}),
        },
      }).then(() => {
        console.log('replace props.param', props.param);
        // 刷新页面
        pageView.value.setPageAllData(pageData);
        // 刷新页面参数
        pageView.value.updatePageParams(props.param, productList.value);

        ElMessage.success('保存成功')

        console.log('pageView.value.pageConfig', pageView.value.pageConfig)
      });
    }
  }else {
    ElMessage.error(res.msg)
  }
  btn.loading = false
}

const calcPremium = async () => {
  const allData = pageView.value.getPageAllData();
  const params = {param: props.param, data: allData, user: userStore.user}
  console.log('calcPremium-params', params);
  // const v = await pageView.value.validateAll()
  // if(!v.validate) {
  //   return;
  // }
  const loading = openPageLoading('计算中...');
  const groupIdList = pageView.value.pageConfig
      .map((group: GroupForm )=> group.groupId)
      .filter(groupId => !groupId.includes('000000') && !groupId.includes('060030'))
  groupIdList.forEach((groupId: string) => {
      const opertaor = pageView.value.getDataOpertaorByGroupId(groupId)
      calcBeforeVerify(opertaor)
  });
  const btn = getBtn('btn010101')
  btn.loading = true;
  positeApi.appCombinationCalc(params).then((res: any) => {
    console.log('calcPremium-res', res);
    if(res.code === 200) {
      const pageData = trimPageData({...res.data});
      pageView.value.setPageAllData(pageData);
      groupIdList.forEach(groupId => {
        const list = groupId.split('-');
        const prodNo = list[1]
        const opertaor = pageView.value.getDataOpertaorByGroupId(groupId)
        disposeAfter(opertaor, pageData[prodNo], prodNo, `[${prodNo}]产品，${res.msg}`)
      });
      // ElMessage.success('计算成功')
    }else {
      ElMessage.error(res.msg)
    }
    setTimeout(() => loading.close(), 500)
  }).finally(() => btn.loading = false);
}



/**
 * 计算前校验
 */
const calcBeforeVerify = (opertaor: any) => {
  const btn = getBtn("btn010101");
  if(btn && props.param.cRsnCde !== '99'){
    // const btn = getBtn("btn010101");
    btn.loading = true;
  }
  const res = opertaor.getDataAll();
  res["user"] = user;
  res["plyBase"]["Base.cDptCde"] = props.param.cDptCde;
  res["plyBase"]["Base.cProdNo"] = props.param.cProdNo;
  // if(res['ci'] && res['ci'].length>0){
  //   res['ci'].forEach((item:any)=>{
  //     if(item['Ci.nCiShare']){
  //       item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])/100;
  //     }
  //   })
  // }
  if (res["cvrg"].length == 0) {
    ElMessage.error("请录入条款信息");
    if (btn && props.param.cRsnCde !== '99') {
      btn.loading = false;
    }
    return;
  } else {
    res["cvrg"].forEach((item:any) => {
      if(item['Term.cDistCodeNo'] && Array.isArray(item['Term.cDistCodeNo'])) {
        if(sessionStorage.getItem("getAddrSeqData")) {
          const getAddrSeqData = JSON.parse(sessionStorage.getItem("getAddrSeqData") || '[]')
          item['Term.cDistPkId'] = item['Term.cDistCodeNo'].map((item:any) => {
            return getAddrSeqData.find((i:any) => i.value === item)?.id
          })?.join(',')
        }
        item['Term.cDistCodeNo'] = item['Term.cDistCodeNo'].join(',')
      }
    })
  }

  const termref = opertaor.getTableRefByKey("cvrg");
  const calccheck = termref.calcCheck();
  if(!calccheck['res']){
    ElMessage.error(calccheck['msg']);
    if (btn && props.param.cRsnCde !== '99') {
      btn.loading = false;
    }
    return;
  }
  if (!baseValite(opertaor)) {
    if (btn && props.param.cRsnCde !== '99') {
      btn.loading = false;
    }
    return;
  }
  // 校验标的信息中核定座位总数和投保座位数总数不一致！
  const tgtValue = opertaor.getTableRefByKey("tgt")?.getFromValue() || '';
  if(tgtValue && tgtValue["Tgt.nSeatCapacity"] !== tgtValue["Tgt.nSeatsNumber"]) {
    ElMessage.error("核定座位总数和投保座位数总数不一致！");
    if (btn && props.param.cRsnCde !== '99') {
      btn.loading = false;
    }
    return;
  }
};
const setPayInfo = (base: any, applicant: any, insrnc: any) => {
  const payList: any[] = [];
  const pay: any = {};
  pay["Pay.nTms"] = 1;
  if (applicant) {
    pay["Pay.cPayorCde"] = applicant["Applicant.cAppCde"];
    pay["Pay.cPayorNme"] = applicant["Applicant.cAppNme"];
  } else {
    pay["Pay.cPayorCde"] = "";
    pay["Pay.cPayorNme"] = "";
  }
  pay["Pay.nPayablePrm"] = base["Base.nPrm"] ? base["Base.nPrm"] : 0;

  pay["Pay.tPayBgnTm"] = moment(insrnc["Base.tAppTm"]).format(
      "YYYY-MM-DD HH:mm:ss"
  );
  pay["Pay.tPayEndTm"] = moment(insrnc["Base.tInsrncBgnTm"]).add(29, 'days').endOf('day').format(
      "YYYY-MM-DD HH:mm:ss"
  );
  pay["Pay.nOwnPrm"] = base["Base.nPrm"] ? base["Base.nPrm"] : 0;
  pay["Pay.cProdNo"] = base["Base.cProdNo"];
  pay["Pay.nPrmVar"] = !!base["Base.nPrm"] ? base["Base.nPrm"] : 0;
  payList.push(pay);
  return payList;
};

/**
 * 公共验证，保费计算和核保，都需要走的验证方法
 */
function baseValite(opertaor: any){
  let r = true;
  // 校验承包基本信息中的总保额和总保费币种须一致
  const baseValue = opertaor.getTableRefByKey("base").getFromValue();
  if(baseValue["Base.cAmtCur"] !== baseValue["Base.cPrmCur"]) {
    ElMessage.error("承保基本信息中的总保额币种和总保费币种须一致!");
    r = false;
  }
  if(props.param.cProdNo.startsWith('02') && !['020013','020014','020018','020015','020019','020020','020021'].includes(props.param.cProdNo)){
    const term = opertaor.getTableRefByKey("cvrg").getFromValue();
    term.forEach((item:any) => {
      if(item["Term.cRdrTyp"] === '0'){
        if( !item["Term.riskList"] || item["Term.riskList"].length === 0 ){
          ElMessage.error("至少需要一条责任信息!");
          r = false;
        }
      }
    });
  }
  return r;
}

const disposeAfter = (opertaor: any, ops: any, prodNo: string, msg: string) => {
  console.log("disposeAfter-opertaor", opertaor);
  console.log("disposeAfter-ops", ops);
  if(!opertaor){
    throw new Error("disposeAfter opertaor " + opertaor);
  }
  let shanDongFlag;
  const insrnc = opertaor.getTableRefByKey('insrnc')?.getFromValue();
  const base  = opertaor.getTableRefByKey('base')?.getFromValue();
  const plyBase = opertaor.getTableRefByKey('plyBase')?.getFromValue();
  const cDptCde = plyBase['Base.cDptCde'];
  const okProdPre = ['11','08','09','01','04','05','07','12'];
  ops.needCalc = true;
  ops["base"]["needCalc"] = true
  if (
      ops["base"]["Base.nPrm"] != undefined &&
      ops["base"]["Base.nPrm"] != null
  ) {
    ElMessage.success(msg + "保费为：" + ops["base"]["Base.nPrm"]);
    productList.value.forEach(prod => {
      if(prod.cProdNo === prodNo) {
        prod['nPrm'] = ops["base"]["Base.nPrm"]
      }
    })
  } else {
    ElMessage.success(msg + "保费为：0");
  }
  // if(ops['ci'] && ops['ci'].length>0){
  //   ops['ci'].forEach((item:any)=>{
  //     if(item['Ci.nCiShare']){
  //       item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])*100;
  //     }
  //   })
  // }
  if(ops['deductibleDist'] && ops['deductibleDist'].length > 0) {
    ops['deductibleDist'].forEach((item:any, index:any)=>{
      item.nSeqNo = index + 1;
    })
  }
  opertaor.setDataAll(ops);
  setNPrmMap(prodNo, ops["base"]["Base.nPrm"] ? ops["base"]["Base.nPrm"] : 0);
  setNAmtMap(prodNo, ops["base"]["Base.nAmt"] ? ops["base"]["Base.nAmt"] : 0);

  const nAmtVal = ops["base"]["Base.nAmt"];
  const nPrmVal = ops["base"]["Base.nPrm"];
  const nPrmRmbExch = ops["base"]["Base.nPrmRmbExch"];
  //
  // productStore.setnPrm(nPrmVal);
  // productStore.setnAmt(nAmtVal);
  if(opertaor.getTableRefByKey("ciMasterAgreement")) {
    opertaor
        .getTableRefByKey("ciMasterAgreement")
        .setValue("Base.nCiJntAmt", getNAmtMap(prodNo));
    opertaor
        .getTableRefByKey("ciMasterAgreement")
        .setValue("Base.nCiJntPrm", getNPrmMap(prodNo));
  }
  opertaor.getTableRefs()["base"].setValue("Base.nPrm", getNPrmMap(prodNo));
  opertaor.getTableRefs()["base"].setValue("Base.nRmbPrm", nPrmVal*nPrmRmbExch);

  //     opertaor
  // .getTableRefByKey("ourCompanyCiShare")
  // .setValue("Base.groupPrmCur", 122);
  //     opertaor
  // .getTableRefByKey("ourCompanyCiShare")
  // .setValue("Base.nPrm", 123);

  // 满足山东见费出单业务
  const cCiMrk = ops['plyBase']?.['Base.cCiMrk'];// 联共保
  const cInstMrk = ops['base']?.['Base.cInstMrk'] || '0';// 缴费方式
  const totalPrm = Number(ops['base']?.['Base.nPrm'] || 0);// 签单保费
  const cClntMrk = ops['applicant']?.['Applicant.cClntMrk'];// 投保人性质
  const tInsrncBgnTmA = ops['insrnc']?.["Base.tInsrncBgnTm"];// 保险期限起期
  const tInsrncEndTmA = ops['insrnc']?.["Base.tInsrncEndTm"];// 保险期限止期
  const basePrmCur = parseFloat(ops['base']?.["Base.nPrm"] || 0);//承保基本信息
  const basePrm = ops['base']?.["Base.cPrmCur"];//承保基本信息 总保费币种   // "CNY"
  const isShortTerm = lessThan6Months(tInsrncBgnTmA, tInsrncEndTmA);
  const nPayNum = Number(ops['base']?.['Base.nPayNum'] || 0)  // "1"  缴费期数
  const cNeedfeeFlag = ops['plyBase']?.['Base.cNeedfeeFlag'];
  // 不见费出单原因
  const cCanclfeersnCde = ops['plyBase']?.['Base.cCanclfeersnCde'];
  if(cDptCde.startsWith('02370') && !cDptCde.startsWith('023702') && okProdPre.some(item => prodNo.startsWith(item))
      && !(['019904','089031'].includes(prodNo)) && !(['2','4','6'].includes(cCiMrk)) && (basePrm == "CNY") && (['0', '1'].includes(cClntMrk))){
    shanDongFlag = true;
    if (cClntMrk == '1' && (base['Base.cInstMrk'] == '5'|| cNeedfeeFlag == '0')){
      ElMessageBox.alert(
          "根据山东省非车险业务“见费出单”实施方案，投保人是个人, 系统将更新为[见费出单][一次性缴费]！",
          "提示",
          {
            confirmButtonText: "确定",
            type: "warning",
          })
          .then(() => {
            opertaor.getTableRefByKey("plyBase").setValue("Base.cNeedfeeFlag", '1');
            opertaor.getTableRefByKey("base").setValue("Base.cInstMrk", '0');
          })
    } else if (cClntMrk == '0' && totalPrm <= 100_000 && (base['Base.cInstMrk'] == '5'|| cNeedfeeFlag == '0') && !needCalc.value){
      ElMessageBox.alert(
          "根据山东省非车险业务“见费出单”实施方案，投保人为非个人且单张保单签单保费小于10万元（含），系统将更新为[见费出单][一次性缴费]！",
          "提示",
          {
            confirmButtonText: "确定",
            type: "warning",
          })
          .then(() => {
            opertaor.getTableRefByKey("plyBase").setValue("Base.cNeedfeeFlag", '1');
            opertaor.getTableRefByKey("base").setValue("Base.cInstMrk", '0');
          })
    } else if (isShortTerm && (base['Base.cInstMrk'] == '5'|| cNeedfeeFlag == '0') && cCanclfeersnCde!='NVPSM04') {// NVPSM04 政府主导或财政支持的统保项目
      ElMessageBox.alert(
          "根据山东省非车险业务“见费出单”实施方案，保险期限低于6个月的短期业务，系统将更新为[见费出单][一次性缴费]！",
          "提示",
          {
            confirmButtonText: "确定",
            type: "warning",
          })
          .then(() => {
            opertaor.getTableRefByKey("plyBase").setValue("Base.cNeedfeeFlag", '1');
            opertaor.getTableRefByKey("base").setValue("Base.cInstMrk", '0');
          })
    } else {
      // 山东拆分只处理保费大于10万元业务，小于等于10万是一次性缴费
      if (totalPrm < 100_000){
        shanDongFlag = false;
      }
      // 山东拆分只处理分期业务, 1期走普通拆分
      if ( nPayNum < 2 ){
        shanDongFlag = false;
      }
      /* ---------- 计算保险期限（自然年） ---------- */
      const tmStart = dayjs(insrnc['Base.tInsrncBgnTm']);
      const tmEnd   = dayjs(insrnc['Base.tInsrncEndTm']).add(1, 'second');
      const wholeYears = tmEnd.diff(tmStart, 'year');
      const maxPhase = 4 + Math.max(0, wholeYears - 1);

      /* ---------- 取期数---------- */
      if (nPayNum > maxPhase) {
        const remainDays = tmEnd
            .subtract(wholeYears, 'year')
            .diff(tmStart, 'day')
        const yearTxt = wholeYears === 0 ? '' : `${wholeYears}年`
        const dayTxt  = remainDays === 0 ? '' : `${remainDays}天`
        ElMessageBox.alert(
            `山东见费业务保险期限为${yearTxt}${dayTxt}，最多允许拆分 ${maxPhase} 期`,
            "提示",
            {
              confirmButtonText: "确定",
              type: "warning",
            })
            .then(() => {
              opertaor.getTableRefByKey('base').setValue("Base.nPayNum", maxPhase);
              shanDongFlag = true;
              opertaor.getTableRefByKey("base").shanDongFun();
            })
      }
    }
  }

  const payInfo = setPayInfo(ops["base"], ops["applicant"], ops["insrnc"]);

  console.log("生成缴费计划内容", payInfo);
  opertaor.getTableRefs()["payinfo"]?.setFormValue(payInfo);
  // const ciInfo = setCiInfo(ops["base"]);
  // opertaor.getTableRefs()["ci"].setFormValue(ciInfo); //生产联共保信息
  needCalc.value = false;
  const baseRef = opertaor.getTableRefByKey("base");
  if(shanDongFlag){
    baseRef.shanDongFun();
  } else{
    baseRef.nPayNumberFun();
  }
}


const submitToUndrFn = async () => {
  const allData = pageView.value.getPageAllData();
  const params = {param: props.param, data: allData, user: userStore.user}
  console.log('submitToUndrFn-params', params);
  const v = await pageView.value.validateAll()
  if(!v.validate) {
    return;
  }
  await saveOpt(false)
  const loading = openPageLoading('提核中...');
  positeApi.submitCombination(params).then((res: any) => {
    console.log('submitCombination-res', res);
    if(res.code === 200) {
      // const pageData = trimPageData({...res.data});
      ElMessage.success(res.msg)
      const newParams = getNewParams({
        initType: POSITE_PAGE_TYPE_READ,
        cProdDtlList: res.data ?? productList.value
      });
      router.replace({
        path: "/pcisapp/posite-page",
        query: {
          param: JSON.stringify({...newParams}),
        },
      }).then(() => {
        console.log('replace props.param', props.param);
        initTemplateData();
        pageView.value.updatePageParams(props.param, productList.value);
        prodListRef.value?.setDisabledAll();
        pageView.value.setPageDisabledAll();
        bthList.value.forEach((item: any) => {
          if(item && [
            'btn010101',
            'btn010102',
            'btn010103',
            'btn010104',
            'btn010105',
            'btn010106'
          ].includes(item.id)) {
            item.disabled = true;
          }
        })
      });
    }else {
      ElMessage.error(res.msg)
    }
    setTimeout(() => loading.close(), 200)
  })
}


/**
 * 整理页面数据
 * @param pageData
 */
const trimPageData = (pageData: any) => {
  if(!pageData) return;
  const resultMap: any = {};
  const dataKeys = Object.keys(pageData);
  const prodList = productList.value.map((item: any) =>  {return{...item}});
  let cCombinationNo;
  for(const key of dataKeys) {
    if(!pageData[key]) return;
    const prodData = {...pageData[key]};
    console.log('trimPageData', key, prodData);
    if(key === '000000') {
      // 删除公共组件中的申请单号
      if(prodData['plyBase']) {
        delete prodData['plyBase']['Base.cAppNo']
      }
      if(prodData['base']) {
        delete prodData['base']['Base.cAppNo']
      }
      if(prodData['applicant']) {
        delete prodData['applicant']['Applicant.cAppNo']
      }
      if(prodData['insured']) {
        delete prodData['insured']['Insured.cAppNo']
      }
    }else if(prodData['plyBase']) {
      // 回填产品组件数据
      const plyBase = prodData['plyBase'][0];
      cCombinationNo = plyBase['Base.cCombinationNo'];
      const idx = prodList.findIndex(prodInfo => prodInfo.cProdNo === key);
      if(idx != -1) {
        prodList[idx]['cAppNo'] = plyBase['Base.cAppNo']
        prodList[idx]['cPlyNo'] = plyBase['Base.cPlyNo']
        prodList[idx]['cCombinationNo'] = cCombinationNo
      }
    }
    const opertaor = pageView.value.getDataOpertaorByProdNo(key);
    resultMap[key] = opertaor.convertData({res: {composition: prodData}})
  }
  // 意健险产品列表数据回填处理
  const keys06 = dataKeys.filter(key =>  key.startsWith('06'))
  if(cCombinationNo && keys06) {
    for(const key of keys06) {
      const idx = prodList.findIndex(prodInfo => prodInfo.cProdNo === key);
      if (idx != -1) {
        prodList[idx]['cCombinationNo'] = cCombinationNo
      }
    }
  }
  productList.value = prodList;
  return resultMap
}


const initTemplateData = () => {
  productList.value = props.param.cProdDtlList.map((item: any) => {
    return {
      cAppNo: item.cAppNo,
      cPlyNo: item.cPlyNo,
      cCombinationNo: item.cCombinationNo,
      cKindNo: item.cKindNo,
      cProdNo: item.cProdNo,
      cGrpMrk: item.cGrpMrk,
      nPrm: item.nPrm
    }
  });
  pageView.value.discardCompKeys.push(...['acctinfo', 'ci', 'ciMasterAgreement', 'ourCompanyCiShare'])
  // 初始化公共组件
  CommonComponentMap.set('applicant', 'positeApplicant');
  CommonComponentMap.set('insured', 'positeInsured');
  CommonComponentMap.set('plyBase', 'positePlybase');
  // CommonComponentMap.set('ci', 'positeCi');
  if (props.param.cCombinationType === '2') { // 组合方案
    CommonComponentMap.set("base", 'positeBase');
    CommonComponentMap.set('insrnc', 'positeInsrnc');
    CommonComponentMap.set('cvrg', 'positePlan');
    pageView.value.customCommonCompKeys.push(...["SpecialAgreement", "DeductibleDist"])
    pageView.value.hiddenCompKeys.push(...["payinfo"])
  }
}

const getNewParams = (param: any) => {
  return {
    ...props.param,
    ...param
  };
}


const openPageLoading = (text?: string) => {
  if(text) {
    loadingText.value = text
  }else {
    loadingText.value = '加载中...'
  }
  pageLoading.value = true
  return {
    close: () => {
      pageLoading.value = false
    }
  }
}



/**
 * 发票信息
 */
const setTaxInfo = () => {
  const prod = productList.value[0]
  if (!!prod.cAppNo) {
    dzmodal
        .open(invoiceInfoModel, { type: "Issuer", data: {} , opertaor: pageView.value.getDataOpertaorByProdNo(prod.cProdNo)})
        .then((res: any) => {
          if (res.type === "ok") {
          }
        });
  } else {
    ElMessage.error("请先保存单据");
    return;
  }
};


/**
 * 反洗钱扩展信息hide
 */
const setCusBenefitInfo = (val?: any) => {
  const validateIsFxq = () => {
    let res: any;
    const isFxq = productList.value.filter((item: any) => item.cKindNo !== '06')
      .some((item: any) => {
        const opertaor = pageView.value.getDataOpertaorByProdNo(item.cProdNo)
        const dataAll = opertaor.getDataAll()
        const appNo = dataAll["applicant"]["Applicant.cAppNo"]; // 单据编号
        const AppcClntMrk = dataAll["applicant"]["Applicant.cClntMrk"]; // 投保人 法人01
        const InscClntMrk = dataAll["insured"]["Insured.cClntMrk"]; // 被保人  法人01
        const baseValue = dataAll["base"]["Base.nRmbPrm"];//承保基本信息 折合人民币总保费
        const basePrmCur = dataAll["base"]["Base.cPrmCur"];//承保基本信息 总保费币种
        const basePrm = dataAll["base"]["Base.nPrm"];//承保基本信息 总保费
        let msg = val == 'view' ? '查看': '录入';
        //  单据保存才有 单据编号
        if (!appNo) {
          ElMessage.error("请先保存单据");
          return false;
        }

        //  投被保人性质 没有填写或者都为个人 提示
        if (AppcClntMrk == undefined || AppcClntMrk == null) {
          ElMessage.error(
              `投保人性质或被保人性质为[法人]时，才允许${msg}反洗钱扩展信息！`
          );
          return false;
        } else if (InscClntMrk == undefined || InscClntMrk === null) {
          ElMessage.error(
              `投保人性质或被保人性质为[法人]时，才允许${msg}反洗钱扩展信息！`
          );
          return false;
        } else if (AppcClntMrk === "1" && InscClntMrk === "1") {
          ElMessage.error(
              `投保人性质或被保人性质为[法人]时，才允许${msg}反洗钱扩展信息！`
          );
          return false;
        }
        // 币种为美元，大于2万可以录入反洗钱扩展信息，其他币种判断折合人民币大于20万
        if(basePrmCur == "USD"){
          if (basePrm < 10000) {
            ElMessage.error(
                `根据反洗钱相关规定，当前保单保费大于等于1万元，才允许${msg}反洗钱扩展信息！`
            );
            return false;
          }
        } else {
          if (baseValue < 50000) {
            ElMessage.error(
                `根据反洗钱相关规定，当前保单保费折合人民币大于等于5万元，才允许${msg}反洗钱扩展信息！`
            );
            return false;
          }
        }
        res = {
          AppcClntMrk,
          InscClntMrk,
          opertaor,
          idxParam: {opertaorProps: opertaor.getProps()},
          appNo
        };
        return true;
      })
    return isFxq ? res : false;
  }

  const result: any = validateIsFxq()
  if(!result) {
    return;
  }
  const {AppcClntMrk, InscClntMrk, idxParam, appNo} = result;
  //  显示标志   1：投保人 2：被保人  3：都展示
  if (AppcClntMrk == "0" && InscClntMrk == "0") {
    controlFlag = "3";
  } else if (AppcClntMrk == "0" && InscClntMrk == "1") {
    controlFlag = "1";
  } else if (AppcClntMrk == "1" && InscClntMrk == "0") {
    controlFlag = "2";
  }

  dzmodal
      .open(amlExtendInfo, { type: "Issuer", controlFlag, idxParam: idxParam,data: props.param, getNo: appNo })
      .then((res: any) => {
        if (res.type === "ok") {
        }
      });
};

/**
 * 获取button
 * @param id
 */
const getBtn = (id: any) => {
  const btn = bthList.value.find(item => {
    return id === item.id
  })
  if(btn) return btn;
  throw new Error(`${id} not found btn`);
}

onUnmounted(() => {
  // 页面卸载 清理store缓存
  pageView.value?.clear()
})
</script>

<style lang="scss" scoped>
.main-content {
  display: flex;
  min-height: calc(100vh - 72px);
  margin-bottom: 60px;
}
.select-prod {
  width: 100%;
  margin-bottom: 7px;
}
.left_content{
  position: fixed;
  top: 86px;
  left: 7px;
  background-color: white;
  overflow: hidden;
  flex-direction: column;
  border: 1px solid #d9dde3;
  border-radius: 3px;
  padding: 3px;
  ._anchor{
    height: 550px;
    overflow-y: auto;
  }
}
.center_content {
  flex: 1;
  padding: 10px;
  margin-left: 250px; /* 与侧边栏宽度保持一致 */
  max-width: calc(100% - 250px);
}

.bottom-items {
  z-index: 999;
  //width: calc(100% - 268px);
  width: 100%;
  height: 45px;
  background-color: white;
  border-top: 1px solid #d9dde3;
  //border-left: 1px solid #d9dde3;
  display: flex;
  justify-content: end;
  align-items: center;
  padding-right: 20px;
  .el-button {
    padding: 8px;
    margin-right: 8px;
    margin-left: 0;
  }
}
.right-sidebar-trigger {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
}
.btns-content {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  .flex-center {
    display: flex;
    align-items: center;
  }
}
</style>

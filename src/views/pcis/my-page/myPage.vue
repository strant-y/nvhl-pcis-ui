<!-- 用户管理 -->
<template>
  <div class="mypage-app">
    <el-container class="dynamic-container" ref="scrollContainer">
      <el-aside :width="(NavigaShow ? 200 : 100) + 'px'">
        <!-- <el-affix :offset="100"> -->
          <div class="navi_container">
            <div
              v-for="(pageConfig, v) in formconfig1"
              :key="v"
              class="NavigaList_card"
            >
              <el-anchor :bound="120" :offset="80">
                <el-anchor-link
                  v-if="edrbaseFlag"
                  @click="handleAnchorClick($event, `#edrbase`)"
                  class="isActive"
                >
                  <!-- <rt-icon
                    :item="{ icon: 'Tickets' }"
                  /> -->
                  <i :class="['icon','iconfont',iconMap['edrbase']]"></i>
                  <span class="icon-title" v-if="NavigaShow"
                    >批改信息</span
                  >
                </el-anchor-link>
                <el-anchor-link
                  v-if="edritemFlag"
                  @click="handleAnchorClick($event, `#edritem`)"
                >
                  <!-- <rt-icon
                    :item="{ icon: 'Tickets' }"
                  /> -->
                  <i :class="['icon','iconfont',iconMap['edritem']]"></i>
                  <span class="icon-title" v-if="NavigaShow"
                    >批改比较项</span
                  >
                </el-anchor-link>

                <el-anchor-link
                  v-for="(k, i) in pageConfig?.pageInfo"
                  :key="i"
                  :custom="true"
                  v-show="
                    k.pageKey !== 'acctinfo'
                      ? [
                          'ciMasterAgreement',
                          'ci',
                          'ourCompanyCiShare',
                        ].includes(k.pageKey)
                        ? isCiJiMrk
                        : acctinfoFlag
                      : true
                  "
                  @click="handleAnchorClick($event, `#${k.pageKey === 'dist' || k.pageKey === 'distSummary' ? k.pageCode : k.pageKey}`)"
                  :class="!edrbaseFlag && !edritemFlag && i === 0 ? 'isActive' : ''"
                >
                  <!-- <rt-icon
                    :item="{
                      icon:
                        k.icon && k.icon !== 'null' && k.icon !== ''
                          ? k.icon
                          : 'Tickets',
                    }"
                  /> -->
                  
                  <i :class="['icon','iconfont',iconMap[k.pageKey]]"></i>
                  <span class="icon-title" v-if="NavigaShow">
                    <template v-if="k.pageTtile && k.pageTtile.length > 7">
                      <el-tooltip
                        effect="dark"
                        :content="k.pageTtile"
                        placement="top-start"
                      >
                        {{ k.pageTtile.substring(0, 7) + "..." }}
                      </el-tooltip>
                    </template>
                    <template v-else>
                      {{ k.pageTtile }}
                    </template>
                  </span>
                </el-anchor-link>

                <el-anchor-link
                  :href="`#ciMasterAgreement`"
                  v-if="ciMasterAgreementFlag && isCiJiMrk"
                >
                  <!-- <rt-icon
                    :item="{ icon: 'Tickets' }"
                  /> -->
                  <i :class="['icon','iconfont',iconMap['ciMasterAgreement']]"></i>
                  <span class="icon-title" v-if="NavigaShow"
                    >联共保主协议信息</span
                  >
                </el-anchor-link>
                <el-anchor-link :href="`#ci`" v-if="ciFlag && isCiJiMrk">
                  <!-- <rt-icon
                    :item="{ icon: 'Tickets' }"
                  /> -->
                  <i :class="['icon','iconfont',iconMap['ci']]"></i>
                  <span class="icon-title" v-if="NavigaShow"
                    >联共保信息</span
                  >
                </el-anchor-link>
                <el-anchor-link
                  :href="`#ourCompanyCiShare`"
                  v-if="ourCompanyCiShareFlag && isCiJiMrk"
                >
                  <!-- <rt-icon
                    :item="{ icon: 'Tickets' }"
                  /> -->
                  <i :class="['icon','iconfont',iconMap['ourCompanyCiShare']]"></i>
                  <span class="icon-title" v-if="NavigaShow"
                    >我司联共保信息</span
                  >
                </el-anchor-link>
                <el-anchor-link
                  v-if="underwriteFlag"
                  @click="handleAnchorClick($event, `#underwriteurl`)"
                  style="opacity: 1;font-weight: 500;"
                >
                  <!-- <rt-icon
                    :item="{ icon: 'Tickets' }"
                  /> -->
                  <i :class="['icon','iconfont',iconMap['underwriteurl']]" style="color: var(--el-color-warning);"></i>
                  <span
                    class="icon-title"
                    v-if="NavigaShow"
                    style="color: var(--el-color-warning)"
                  >核保处理</span
                  >
                </el-anchor-link>
              </el-anchor>
            </div>
            <!-- <div class="NavigaList_card" style="margin-left: 5px">
              <rt-icon
                @click="NavigaShow = !NavigaShow"
                v-if="!NavigaShow"
                :item="{ icon: 'DArrowRight' }"
              />
              <rt-icon
                @click="NavigaShow = !NavigaShow"
                v-if="NavigaShow"
                :item="{ icon: 'DArrowLeft' }"
              />
            </div> -->
          </div>
        <!-- </el-affix> -->
      </el-aside>
      <el-main class="main-container">
        <div class="main-header">
          <div class="tp" style="background: #ebedfc">
            <span class="font-weight-500">条款：</span
            ><span class="publicStyle"
              >{{ props.param.cTermNo }}&nbsp;&nbsp;{{
                props.param.cTermNme
              }}</span
            >&nbsp;|&nbsp;<span class="font-weight-500">出单方式：</span
            ><span class="publicStyle">{{ getRecordTypeText(props.param.cPolicySource ?? props.param.cRecordType) }}</span>&nbsp;|
            <span class="publicStyle">{{productStore.cCiMrk === '0' ? '非共保业务' 
              : productStore.cCiMrk == '1' ? '外部共保我方主共_主联'
              : productStore.cCiMrk == '2' ? '外部共保我方从共_主联'
              : productStore.cCiMrk == '3' ? '外部共保我方主共_无联保'
              : productStore.cCiMrk == '4' ? '外部共保我方从共_无联保'
              : '司内联保_主联' }}</span> |
            <span class="publicStyle">{{
              props.param.cGrpMrk == "0" ? "个单" : "团单"
            }}</span
            >&nbsp;|&nbsp;<span class="font-weight-500">是否互联网出单:</span
            >&nbsp;<span class="publicStyle">{{
              props.param.cIsNet == "0" ? "是" : "否"
            }}</span>
          </div>
          <div class="btm" style="background: #ebedfc">
            <span class="font-weight-500">保险期限：</span
            ><span class="publicStyle">{{ tmDay }}</span
            >&nbsp;<span class="font-weight-500">天</span
            >&nbsp;|&nbsp;<span class="font-weight-500">保额：</span
            ><span class="publicStyle">{{ nAmt.toLocaleString() }}</span
            >&nbsp;<span class="font-weight-500">元</span>&nbsp;|&nbsp;<span
              class="font-weight-500"
              >保费为: </span
            ><span class="publicStyle">{{ nPrm.toLocaleString() }}</span
            >&nbsp;<span class="font-weight-500">元</span>&nbsp;
						<template v-if="props.param?.cRecordType === 9">
							|&nbsp;<span class="font-weight-500">剩余预收保费为: </span
							><span class="publicStyle">{{ nRecRemPrm.toLocaleString() }}</span
							>&nbsp;<span class="font-weight-500">元</span>
						</template>
          </div>
        </div>
        <div class="main-content">
          <div id="edrbase" v-if="edrbaseFlag" style="margin-bottom: 10px">
            <edrbaseRef :ref="(res: any) => {
              if(res && res.addProvide){
                res.addProvide('domId', 'edrbase');
              }
              edrbase = res
            }"></edrbaseRef>
          </div>
          <div id="edritem" v-if="edritemFlag" style="margin-bottom: 10px">
            <edritemRef
              :ref="(res: any) => {
                if(res && res.addProvide){
                  res.addProvide('domId', 'edritem');
                }
                edritem = res
              }"
            ></edritemRef>
          </div>
          <template v-for="(pageConfig, v) in formconfig1" :key="v">
            <div
              class="card_"
              v-for="(k, i) in pageConfig?.pageInfo"
              :key="i"
              :id="
                k.pageKey === 'dist' || k.pageKey === 'distSummary'
                  ? k.pageCode
                  : k.pageKey
              "
              v-show="
                k.pageKey !== 'acctinfo'
                  ? ['ciMasterAgreement', 'ci', 'ourCompanyCiShare'].includes(
                      k.pageKey
                    )
                    ? isCiJiMrk
                    : acctinfoFlag
                  : true
              "
            >
          <!-- {{ k.pageKey }} || {{ k.pageCode }} -->
              <component
                v-if="currentIndex >= i"
                :ref="
                  (res: any) => {
                    const pageK =
                      k.pageKey === 'dist' || k.pageKey === 'distSummary'
                        ? k.pageCode
                        : k.pageKey;
                    opertaor.addTableRef(pageK, res);
                    if(res && res.addProvide){
                      res.addProvide('domId',  k.pageKey === 'dist' || k.pageKey === 'distSummary' ? k.pageCode : k.pageKey);
                    }
                  }
                "
                :is="k.pageType === 'custom' ? k.pageCode : k.pageKey + '-ref'"
                :pageSchema="k.pageSchema"
                :compKey="k.pageCode"
           
              />
            </div>
          </template>
          <div id="ci" v-if="ciFlag" style="margin-bottom: 10px">
            <ciRef
              :ref="(res: any) => {
                ci = res
                if(res && res.addProvide){
                  res.addProvide('domId', 'ci');
                }
              }"
            ></ciRef>
          </div>
          <div
            id="ciMasterAgreement"
            v-if="ciMasterAgreementFlag"
            style="margin-bottom: 10px"
          >
            <ciMasterAgreementRef
              :ref="(res: any) => {
                if(res && res.addProvide){
                  res.addProvide('domId', 'ciMasterAgreement');
                }
                ciMasterAgreement = res
              }"
            />
          </div>
          <div
            id="ourCompanyCiShare"
            v-if="ourCompanyCiShareFlag"
            style="margin-bottom: 10px"
          >
            <ourCompanyCiShareRef
              :ref="(res: any) => {
                if(res && res.addProvide){
                  res.addProvide('domId', 'ourCompanyCiShare');
                }
                ourCompanyCiShare = res
              }"
            />
          </div>
          <div
            id="underwriteurl"
            v-if="underwriteFlag"
            style="margin-bottom: 10px"
          >
            <underwriteRef ref="underwrite" :pageData="pageData"></underwriteRef>
          </div>
          <el-backtop :target="'.main-content'" :right="100" :bottom="150" />
        </div>
        <div class="bottom-items">
          <!--新增的申请单号显示和复制按钮-->
          <div style="margin-right: 5px; width: 100%; display: flex; justify-content: flex-end; align-items: center;" v-if="pageLoaded">
            <div style="display: flex; align-items: center; background: #fff; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);white-space: nowrap;">
              {{ props.param?.pageName === "priceInquiry" ? "询价单号:" : "申请单号:" }}
              <span id="policyNumber" style="margin-left: 5px; margin-right: 5px; font-weight: bold;">
              {{ getNo }}
              </span>
              <el-tooltip :content="`点击复制${props.param?.pageName === 'priceInquiry' ? '询价单号' : '申请单号'}`" placement="top">
                <el-button @click="copyPolicyNumber" circle size="small" style="color: red;margin-right: 0;">
                  <rt-icon :item="{ icon: 'DocumentCopy' }" style="font-size: 22px;" />
                </el-button>
              </el-tooltip>
            </div>
          </div>
          <rt-button
            v-for="(bth, idx) in bthList"
            :item="bth"
            :key="idx"
            :loading="bth.loading"
          />
        </div>
      </el-main>
      <div class="right-btns">
        <div class="btns-content" v-if="rightBtnList.length > 0">
          <rt-button
            v-for="(bth, idx) in rightBtnList"
            :item="bth"
            :key="idx"
            :loading="bth.loading"
          />
        </div>
      </div>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { createFreeButtonBase, FreeButtonBase } from "@/shared/button-config";
import { getProductPage, getRenewalAppPolicy, distMapCollectCompKey } from "../../../api/prod/index";
import {
  getAppPlyInfoByAppNo,
  saveAppPlyInfo,
  generatelSingleNo,
  appCalc,
  submitToUndr,
  getAppPolicy,
  saveEdrAppPlyInfo,
  getEndorseChange,
  getEdrRsnItem,
  submitUnderwriting,
  calcEdr,
  submitUnderwritingEdr,
  submitEdrToUndr,
  calcSurrenEdr,
  saveSurrenEdr,
  getSurrenderPrecis,
  submitEdrSurrender,
  calculatePremium,
  getAppPolicyForCopy,
  saveInquiry,
  submitInquiry,
  submitUnderwrite,
  getInquiryPolicy,
	getisAllDone,
	isUndrClsBlackList,
  queryTermRateLimit,
	queryEcargoRelevancePolicyDetails
} from "../../../api/query/index";
import { checkFeeWindowType, selectDist, saveDistBatch, getReleaseInquiryPage, copyDist } from "@/api/prod";
import { dataOpertaor, useProductStore,useTagsViewStore } from "@/store";
import moment from "moment";
import {numAdd, numComparison, numMulti, numSubp, tool_fix} from "@/utils/Math";
import dayjs from "dayjs";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
import { useRouter, useRoute } from "vue-router";
import { getData } from "@/pcis/prodRef/dataInit";

import { iconMap } from './iconMap';
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();

const policyService = new PolicyService();
const productStore = useProductStore();
const { isCiJiMrk } = storeToRefs(productStore);

const route = useRoute();
const router = useRouter();
const tagsViewStore = useTagsViewStore();
const pageLoaded = ref(false);

import { NewUdrListService } from "@/views/pcis-new-udr-list/service/new-udr-list.service";
const { saveData } = NewUdrListService();
import {useUserStore} from "@/store";
import { pa } from "element-plus/es/locale";
import { initMultiCodeList } from "@/api/code-list-service";
import { forEach } from "lodash";
import {scrollByDomId} from "@/utils/common";
//额度明细弹窗
const limitDetails = defineAsyncComponent(
  () => import("@/views/pcis-new-udr-list/common/limitDetails.vue")
);
// 费用信息
const CostInformation = defineAsyncComponent(
  () => import("@/views/pcis-new-udr-list/pages/CostInformation.vue")
);
// 历次批单 弹框页面
const PreviousdrOpnList = defineAsyncComponent(
  () => import("@/views/pcis-new-udr-list/common/PreviousdrOpnList.vue")
);

//发票信息
const invoiceInfoModel = defineAsyncComponent(
  () => import("@/views/pcis-new-udr-list/common/invoice-info-model.vue")
);

//反洗钱
const amlExtendInfo = defineAsyncComponent(
  () => import("@/views/pcis-main/prodDef/common/aml-extend-info/index.vue")
);

//历史赔案
const historyClaimcaseModel = defineAsyncComponent(
  () => import("../../comprehensive-query/modal/history-claimcase-model.vue")
);
//发起风勘
const windExplorationModel = defineAsyncComponent(
  () => import("@/views/comprehensive-query/modal/wind-exploration-model.vue")
);
// 风勘查询
const windExplorationInfo = defineAsyncComponent(
  () => import("@/views/comprehensive-query/modal/wind-exploration-info.vue")
);

// 核保信息
const UndrOpnList = defineAsyncComponent(
  () => import("@/views/comprehensive-query/modal/UndrOpnList.vue")
);

// 任务痕迹
const TaskListVestige = defineAsyncComponent(
  () => import("@/views/pcis-new-udr-list/common/TaskListVestige.vue")
);
//复制出单
const copyPlyModel = defineAsyncComponent(
  () => import("@/views/pcis-new-udr-list/common/copy-ply-model.vue")
);
// 保存模板
const templateDialog = defineAsyncComponent(
  () => import("./templateDialog.vue")
);

const idxParam = {
  opertaorId: 'my-page',
  handleAnchorClick: handleAnchorClick,
};
provide('idxParam', idxParam);
const opertaor = dataOpertaor(idxParam.opertaorId);
opertaor.init();
const underwrite = ref(null);
const edrbase = ref(null);
const edritem = ref(null);

const ci = ref(null);
const ciMasterAgreement = ref(null);
const ourCompanyCiShare = ref(null);

const invoiceRef = ref(null);
const amlInfoRef = ref(null);

const historyClaRef = ref(null);
const sliceSide = ref([]);
const bottomBtnColor1 = "#3498DB";
const parseData = ref({})

const props:any = defineProps({
  param: {
    type: Object,
  },
});

opertaor.setParam(props.param);

// 当前加载的组件索引
const currentIndex = ref(0);
const NavigaShow = ref(true);
const formconfig1 = opertaor.getTableConfig();
const bthList = ref<Array<FreeButtonBase>>([]);
const rightBtnList = ref<Array<FreeButtonBase>>([]);
const tempFindBtn: any[] = [];
let underwriteFlag = ref(false);
let edrbaseFlag = ref(false);
let edritemFlag = ref(false);
let ciMasterAgreementFlag = ref(false); //
let ourCompanyCiShareFlag = ref(false); //
let ciFlag = ref(false); //
let acctinfoFlag = ref(true);

let needCalc = ref(true);
const userString = sessionStorage.getItem("user");
const user = userString ? JSON.parse(userString) : {};
const nAmt = ref("0.00");
const nPrm = ref("0.00");
const nRecRemPrm = ref("0.00");
const tmDay = ref(0);
const dzmodal = useDzModal();
const cacheKey = ref();
const pageData = ref({}); // 页面数据

let controlFlag = ""; // 用来处理反洗钱 页面窜窜以及显示

// 存所有可显示账户信息场景
const detailcodeList = [
  { id: "01", name: "变更投保数量" },
  { id: "05", name: "保费调整" },
  { id: "06", name: "赔款后保额恢复" },
  { id: "07", name: "增加保额" },
  { id: "08", name: "减少保额" },
  { id: "09", name: "增加条款" },
  { id: "10", name: "变更清单信息" },
  { id: "11", name: "减少条款" },
  { id: "12", name: "变更保险期限" },
  { id: "13", name: "更改客户信息" },
  { id: "17", name: "赔款后保额冲减" },
  { id: "20", name: "变更车辆信息" },
  { id: "26", name: "减少保费" },
  { id: "45", name: "费率调整" },
  { id: "46", name: "报停展期" },
  { id: "59", name: "增加销售额" },
  { id: "60", name: "减少销售额" },
  { id: "61", name: "增加保费" },
  { id: "ZQ", name: "增加清单信息" },
  { id: "c1", name: "全单注销" },
  { id: "s1", name: "全单退保" },
  { id: "s2", name: "一般退保" },
  { id: "JQ", name: "减少清单信息" },
  { id: "25", name: "货物明细表批改" },
  { id: "25", name: "增加保费" },
  { id: "27", name: "变更赔偿限额" },
];



// 用来处理 账户信息 哪些场景显示
const isDetailCde = () => {
  let cRsnCde = props.param['cRsnCde']? props.param['cRsnCde']: props.param['cEdrRsnBundleCde'];  // 判断 批改的用批改ID   综合查询的用cEdrRsnBundleCde
  return detailcodeList.some(item => item.id === cRsnCde);
};

const getNo = computed(() => {
  return edrbaseFlag.value ? edrbase.value?.getValue('EdrBase.cAppNo') : props.param?.pageName === "priceInquiry" ? opertaor.getTableRefByKey('plyBase')?.getValue('Base.cInquiryNo') || '暂无' : opertaor.getTableRefByKey('plyBase')?.getValue('Base.cAppNo') || '暂无'
})
// 储存原始组件配置信息
const oldProductResData = ref({})

onMounted(() => {
  console.log('param 路由---', props.param )
  initPage();
});
const getActualRecordType = computed(() => {
  // 优先使用 cPolicySource，如果不存在则使用 cRecordType
  return props.param.cPolicySource ?? props.param.cRecordType ?? '';
});
const getRecordTypeText = computed(() => {
  return (cRecordType: string) => {
    const actualRecordType = props.param.cPolicySource ?? props.param.cRecordType ?? cRecordType;
    const recordTypeMap: { [key: string]: string } = {
      '1': '核心页面出单',
      '5': '方案录单',
      '7': '模板录单',
      '9': '协议出单',
      '2':'核心导入',
      '3':'移动端出单',
      '4':'渠道出单',
      '6':'询报价转投保',
      '8':'复制出单',
      '10':'组合出单',
    };
    return recordTypeMap[cRecordType] || '未知录单方式';
  };
});


// watchEffect(() => {
//   const isShow = productStore.$state.cCiMrk !== "0";
//   ciMasterAgreementFlag.value = isShow;
//   console.log(ciMasterAgreementFlag.value,"000000000")
//   ciFlag.value = isShow;
//   ourCompanyCiShareFlag.value = isShow;
// });
/**
 * 发票信息
 */
const setTaxInfo = () => {
  console.log("发票信息", opertaor.getTableRefs());
  const tabref = opertaor.getTableRefs();
  const appLicantValue = tabref["applicant"].getFromValue()["Applicant.cAppNo"]; // 单据编号
  // const appLicantValue = tabref["plyBase"].getFromValue()["Base.cAppNo"]; // 单据编号
  
  console.log('Applicant.cAppNo',tabref["applicant"].getFromValue())
  console.log('Applicant.cAppNo',tabref['plyBase'].getFromValue())
  if (!!appLicantValue) {
    // invoiceRef.value?.isShow()
    // invoiceShow.value = true;

    dzmodal
      .open(invoiceInfoModel, { type: "Issuer", data: {} })
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
const setCusBenefitInfo = () => {
  const tabref = opertaor.getTableRefs();
  const appNo = tabref["applicant"].getFromValue()["Applicant.cAppNo"]; // 单据编号
  const AppcClntMrk = tabref["applicant"].getFromValue()["Applicant.cClntMrk"]; // 投保人 法人01
  const InscClntMrk = tabref["insured"].getFromValue()["Insured.cClntMrk"]; // 被保人  法人01
  const baseValue = opertaor.getTableRefByKey("base").getFromValue()["Base.nRmbPrm"];//承保基本信息 折合人民币总保费
  const basePrmCur = opertaor.getTableRefByKey("base").getFromValue()["Base.cPrmCur"];//承保基本信息 总保费币种
  const basePrm = opertaor.getTableRefByKey("base").getFromValue()["Base.nPrm"];//承保基本信息 总保费
	
  //  单据保存才有 单据编号
  if (!appNo) {
    ElMessage.error("请先保存单据");
    return;
  }

  //  投被保人性质 没有填写或者都为个人 提示
  if (AppcClntMrk == undefined || AppcClntMrk == null) {
    ElMessage.error(
      "投保人性质或被保人性质为[法人]时，才允许录入反洗钱扩展信息！"
    );
    return;
  } else if (InscClntMrk == undefined || InscClntMrk === null) {
    ElMessage.error(
      "投保人性质或被保人性质为[法人]时，才允许录入反洗钱扩展信息！"
    );
    return;
  } else if (AppcClntMrk === "1" && InscClntMrk === "1") {
    ElMessage.error(
      "投保人性质或被保人性质为[法人]时，才允许录入反洗钱扩展信息！"
    );
    return;
  }
	// 币种为美元，大于2万可以录入反洗钱扩展信息，其他币种判断折合人民币大于20万
	if(basePrmCur == "USD"){
		if (basePrm < 20000) {
			ElMessage.error(
					"根据反洗钱相关规定，当前保单保费大于等于2万元，才允许录入反洗钱扩展信息！"
			);
			return;
		}
	} else {
		if (baseValue < 200000) {
			ElMessage.error(
					"根据反洗钱相关规定，当前保单保费折合人民币大于等于20万元，才允许录入反洗钱扩展信息！"
			);
			return;
		}
	}


  //  显示标志   1：投保人 2：被保人  3：都展示
  if (AppcClntMrk == "0" && InscClntMrk == "0") {
    controlFlag = "3";
  } else if (AppcClntMrk == "0" && InscClntMrk == "1") {
    controlFlag = "1";
  } else if (AppcClntMrk == "1" && InscClntMrk == "0") {
    controlFlag = "2";
  }

  dzmodal
    .open(amlExtendInfo, { type: "Issuer", controlFlag })
    .then((res: any) => {
      if (res.type === "ok") {
      }
    });
};
/**
 * 历史赔案
 */
const historyClaimcaseFun = () => {
  dzmodal
    .open(historyClaimcaseModel, { type: "Issuer", data: {} })
    .then((res: any) => {
      if (res.type === "ok") {
      }
    });
};

// 发起风勘 方法
const startWindExploration = ()=>{
    dzmodal
    .open(windExplorationModel, { type: "Issuer", data: {...opertaor.getDataAll()} })
    .then((res: any) => {
      if (res.type === "ok") {
      }
    });
}
// 风勘查询
const getWindExploration = ()=>{
    dzmodal
    .open(windExplorationInfo, { type: "Issuer", data: {...opertaor.getDataAll()} })
    .then((res: any) => {
      if (res.type === "ok") {
      }
    });
}


//  复制保单
const copyPolicyFun = () => {
  dzmodal.open(copyPlyModel, { type: "", data: {...props.param,...opertaor.getDataAll()} }).then((res: any) => {
    if (res.type === "ok") {
      const param = {
        // ...props.param,
        ...res.body
      }
      router.push({
        path: "/pcis/my-page",
        query: {
          param: JSON.stringify(param),
        },
      });
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  });
  // dialogRef.value?.open(
  //       "copyPlyModel",
  //       {
  //         type: "show",
  //         data: {
  //         },
  //         method: {
  //           getSelected: (params) => {
  //             dialogRef.value?.handleClose();
  //           },
  //         },
  //       },
  //       {
  //         isOk: (selectdata: any) => {
  //           console.log("a", selectdata);
  //         },
  //       },
  //       { title: "复制保单", width: 85 }
  //     );
};

// 复制申请单号
const copyPolicyNumber = () => {
  const policyNumberElement = document.getElementById("policyNumber");
  if (!policyNumberElement) return;

  if(navigator.clipboard) {
    const text = policyNumberElement.innerText;
    navigator.clipboard.writeText(text).then(res => {
      ElMessage.success(props.param?.pageName === 'priceInquiry' ? '询价单号' : '申请单号' + '已成功复制到剪贴板！');
    }).catch(err => {
      ElMessage.error(props.param?.pageName === 'priceInquiry' ? '询价单号' : '申请单号' + "复制失败，请手动复制。");
    })
  } else {
    const range = document.createRange();
    range.selectNodeContents(policyNumberElement);

    const selection = window.getSelection();
    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(range);

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        ElMessage.success(props.param?.pageName === 'priceInquiry' ? '询价单号' : '申请单号' + '已成功复制到剪贴板！');
      } else {
        ElMessage.error(props.param?.pageName === 'priceInquiry' ? '询价单号' : '申请单号' + "复制失败，请手动复制。");
      }
    } catch (err) {
      ElMessage.error("当前浏览器不支持自动复制功能，请手动复制。");
    }

    // 清除选中内容
    selection.removeAllRanges();
  }
};

/**
 * 投保需要的按钮
 */
const basicBtn = [
  createFreeButtonBase({
    label: "保费计算",
    type: "primary",
    id: "btn010101",
    func: () => {
      // calcPremium()
      queryTermRateLimitFun(calcPremium)
    },
  }),
  createFreeButtonBase({
    label: "保存",
    type: "primary",
    id: "btn010102",
    func: () => {
      savePlyInfo();
    },
  }),
  createFreeButtonBase({
    label: "申请核保",
    type: "warning",
    id: "btn010103",
    func: () => {
      
      submitToUndrFn();
    },
  }),
  createFreeButtonBase({
    label: "发票信息",
    type: "primary",
    buttonColor: bottomBtnColor1,
    func: () => {
      setTaxInfo();
    },
  }),
  createFreeButtonBase({
    label: "反洗钱扩展信息",
    type: "primary",
    buttonColor: bottomBtnColor1,
    func: () => {
      setCusBenefitInfo();
    },
  }),

  // createFreeButtonBase({
  //   label: "历史赔案",
  //   type: "primary",
  //   func: () => {
  //     historyClaimcaseFun();
  //     // src\views\pcis-new-udr-list\common\history-claimcase-model.vue
  //   },
  // }),
];
const basicRightBtn = [
  createFreeButtonBase({
    label: "保存模板",
    type: "primary",
    buttonColor: bottomBtnColor1,
    icon: "Memo",
    func: () => {
      handleSaveTemplate()
    },
  }),
  createFreeButtonBase({
    label: "复制出单",
    type: "primary",
    buttonColor: bottomBtnColor1,
    icon: "CopyDocument",
    func: () => {
      copyPolicyFun();
    },
  }),
  createFreeButtonBase({
    label: "额度明细",
    type: "primary",
    buttonColor: bottomBtnColor1,
    icon: "Tickets",
    func: () => {
      openLimit();
    },
  }),
]
/**
 * 一般批改按钮
 */
const edrBtn = [
  createFreeButtonBase({
    label: "原保单查看",
    type: "primary",
    func: () => {
      getPlyPolicyFun();
    },
  }),
  createFreeButtonBase({
    label: "保费计算",
    type: "primary",
    id: "btnCalEdr",
    func: () => {
      // calcPremiumEdr();
      // 批改原因是否是费率变更
      if(props.param.cRsnCde === '45') {
        queryTermRateLimitFun(calcPremiumEdr)
      } else {
        calcPremiumEdr();
      }
    },
  }),
  createFreeButtonBase({
    label: "保存",
    type: "primary",
    id: "saveEdr",
    func: () => {
      saveEdrPlyInfo();
    },
  }),
  createFreeButtonBase({
    label: "比较/生成批文",
    type: "primary",
    id: "btnCompare",
    func: () => {
      generateEndorse();
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
      calcPremiumEdrSurrender();
    },
  }),
  createFreeButtonBase({
    id: "btn010102",
    label: "保存",
    type: "primary",
    func: () => {
      saveApplicationEdr();
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
    id: "btn010103",
    label: "申请核保",
    type: "primary",
    func: () => {
      submitEdrToUndrSurrender();
    },
  }),
];
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
      underwrite.value?.validate().then((isValid) => {
        if (isValid) {
          submitUnderwritingFn();
        } else {
          ElMessage.error("请填写必填项");
        }
      });
    },
  }),
];
/**
 * 数据初始化
 * @param data
 */
const initPage = async () => {
  const getProductRes = props.param?.pageName === "priceInquiry" ? await getReleaseInquiryPage({
    CProdNo: props.param.cProdNo,
    CGrpMrk: props.param.cGrpMrk,
  }) : await getProductPage({
    CProdNo: props.param.cProdNo,
    CGrpMrk: props.param.cGrpMrk,
  });

  // const getRenewalAppPolicyres = await getRenewalAppPolicy({
  //   cPlyNo: props.param.cPlyNo,
  //   queryTyp: props.param.queryTyp,
  // });

  if (props.param.pageType === "PLY_UW_PROCESS_SCENE") {
    underwriteFlag.value = true;
  } else {
    underwriteFlag.value = false;
  }
  if (
    props.param.pageType === "EDR_APP_NEW_SCENE" ||
    (props.param.pageType == "TEMPORARY_DEPOSIT" &&
      props.param.cAppTyp == "E") ||
    (props.param.pageType == "PLY_UW_PROCESS_SCENE" &&
      props.param.cAppTyp == "E") ||
    (props.param.pageType == "UW_READ_SCENE" && props.param.cAppTyp == "E") ||
    (props.param.pageType == "readonly" && props.param.cAppTyp == "E")
  ) {
    edrbaseFlag.value = true;
    edritemFlag.value = true;
    if (
      (props.param.pageType === "EDR_APP_NEW_SCENE" &&
        (props.param.cEdrType == "3" || props.param.cEdrType == "2")) ||
      (props.param.pageType === "TEMPORARY_DEPOSIT" &&
        (props.param.cEdrType == "3" || props.param.cEdrType == "2")) ||
      (props.param.pageType === "PLY_UW_PROCESS_SCENE" &&
        (props.param.cEdrType == "3" || props.param.cEdrType == "2"))
    ) {
      edritemFlag.value = false;
    }
  } else {
    edrbaseFlag.value = false;
    edritemFlag.value = false;
  }
  if (
    (props.param.pageType === "EDR_APP_NEW_SCENE" &&
      (props.param.cEdrType == "3" || props.param.cEdrType == "2")) ||
    (props.param.pageType === "TEMPORARY_DEPOSIT" &&
      (props.param.cEdrType == "3" || props.param.cEdrType == "2"))
  ) {
    //退保不显示产品组件信息
    acctinfoFlag.value = false;
  }
  // 页面初始化
  const formconfig11 = JSON.parse(getProductRes.data);
  oldProductResData.value = JSON.parse(getProductRes.data);
  // 初始化全页面下拉选一次性获取,解决页面响应效率
  const codeinit = getAllcodelist(formconfig11);
  let codeparam = [];
  
  Object.keys(codeinit).forEach(res =>{
    if(res !== "Occupt_ZYLB") {
      codeparam.push(codeinit[res]);
    }
  });
  await getInitParam(codeparam);
  // if(productStore.$state.cCiMrk == "0"){
  //   formconfig11[0].pageInfo = formconfig11[0].pageInfo.filter(
  //     (item) => item.pageTtile !== "联共保主协议信息" && item.pageTtile !== "联共保信息" && item.pageTtile !== "我司联共保份额信息"
  //   );
  // }else if(productStore.$state.cCiMrk !=="0"){
  // }

  //处理账户信息方面逻辑  根据isDetailcdeType 不包含这里的都不显示账户信息方面的内容
  let isDetailcdeType = isDetailCde();
  if (!isDetailcdeType) {
    formconfig11[0].pageInfo = formconfig11[0].pageInfo.filter(
      (item) => item.pageTtile !== "账户信息"
    );
  }
//   let isDetailcdeType = isDetailCde();
// if (!isDetailcdeType) {
//   formconfig11[0].pageInfo = formconfig11[0].pageInfo.filter(
//     (item) => item.pageTtile !== "账户信息"
//   );
// }

  console.log("页面初始化返回数据", formconfig11);
  if (props.param?.cAppTyp == "E") {
    if (props.param.cEdrType == "1") {
      opertaor.setReadOnly(formconfig11);
    }
  }
  // 只读场景,提前将配置设置为只读
  if (
    props.param?.pageType === "PLY_UW_PROCESS_SCENE" ||
    (props.param?.pageType === "EDR_APP_NEW_SCENE" &&
      props.param.cEdrType == "1") ||
    props.param?.pageType === "readonly" ||
    props.param?.pageType === "UW_READ_SCENE"
  ) {
    opertaor.setReadOnly(formconfig11);
    console.log(77,formconfig11)
  }

  opertaor.setTableConfig(formconfig11);
  renderComponents();
};

async function getInitParam(codeparam){
  const res = await initMultiCodeList(codeparam);
  if(res.code === 200){
    for(let i = 0; i < res.data.length ; i++){
      codeListStore.setOptionsToCacheMap(res.data[i]['key'],res.data[i]['data']);
    }
  }
  console.log(res);
}

const exlist = ['acctinfo','ci','ourCompanyCiShare'];
function getAllcodelist(formconfig11){
  let l = {};
  if(formconfig11?.[0].pageInfo){
    for(let i = 0; i < formconfig11[0].pageInfo.length; i++){
      if(exlist.includes(formconfig11[0].pageInfo[i]['pageKey'])){
        continue;
      }
      const schema = formconfig11[0].pageInfo[i].pageSchema;
      if(schema && schema.fromSchema && schema.fromSchema.length>0){
        for(let j = 0; j < schema.fromSchema.length; j++){
          const sc = schema.fromSchema[j]; 
          if((sc.inputtype === 'rtSelectV2' || sc.inputtype === 'rtselect') && !isDisabled(sc.disabled) && sc.typeCode){
            const k = sc.typeCode + (sc.codeParam?sc.codeParam:'');
            const m = {codeListName:sc.typeCode,codeListParam:sc.codeParam,source:k};
            l[k] = m;
          }
        }
      }
    }
  }
  return l;
}

function isDisabled(v: any){
if (
    v === true ||
    v === 1 ||
    v === "1"
  ) {
    return true;
  } else {
    return false;
  }
}

const dataInit:any = ref({});
/**
 * 逐个渲染组件
 */
function renderComponents() {
  const interval = setInterval(() => {
		if (props.param.pageType === "app") {
			const idata = getData();
			dataInit.value = opertaor.mapSetData(idata);
			// setTimeout(() => {
			//   // 基本信息预加载，降低空窗期
			//   opertaor.setDataAll(dataInit.value);
			// }, 100);
  	}
    if (currentIndex.value < formconfig1[0]?.pageInfo.length - 1) {
      currentIndex.value++;
    } else {
      loadAfter(); //页面加载完成之后,再加载后续所需的事件
      clearInterval(interval);
    }
  }, 50); // 延迟组件渲染,增加页面响应效率

}

/**
 * 页面加载后
 */
async function loadAfter() {
  if (props.param.pageType === "app") {
    //获取单号
    // getCAppNoFun();
    // 获取条款信息
    getPlanCvrg();
    if(props.param?.pageName === "priceInquiry") {
      // 询价单
      bthList.value.push(
        createFreeButtonBase({
          label: "保费计算",
          type: "primary",
          id: "btn010101",
          func: () => {
            // calcPremium();
            queryTermRateLimitFun(calcPremium)
          },
        }),
        createFreeButtonBase({
          label: "保存",
          type: "primary",
          id: "btn010102",
          func: () => {
            savePlyInfo();
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
          label: "发起风勘",
          type: "primary",
					func: () => {
						if (getNo.value == '暂无') {
							ElMessage.error('询价单号为空,请保存后操作!');
							return false;
						}
						startWindExploration(); 
					},
        }),
      );
    } else {
      bthList.value = basicBtn;
      rightBtnList.value = basicRightBtn;
    }
		// 协议出单请求被保人信息和条款信息,见费出单跟协议号返回的走并且不可修改，展示剩余预收保费字段
		if(props.param.cRecordType === 9){
			let params = {
				cEcAgrAppNo: props.param.cEcAgrAppNo, // 协议申请单号
				cProdNo: props.param.cProdNo, // 产品代码
				cTermNo: props.param.cTermNo, // 条款代码
				cInsuredCde: props.param.cInsuredCde, // 被保人代码
				insuredNme: props.param.cInsuredNme, // 被保人名称
			}
			const res: any = await queryEcargoRelevancePolicyDetails(params);
			if(res["code"] == 200){
				if(!!res.data.policyApplication?.composition){
					dataInit.value.insured = res.data.policyApplication?.composition?.insured[0] || {};
					dataInit.value.applicant = res.data.policyApplication?.composition?.applicant[0] || {};
					dataInit.value.cvrg = res.data.policyApplication?.composition?.cvrg || {};
					dataInit.value.plyBase["Base.cNeedfeeFlag"] = props.param.cNeedfeeFlag
					dataInit.value.plyBase["Base.cEcAgrNo"] = props.param.cEcAgrNo
					let plyBase = opertaor.getTableRefByKey('plyBase')
					if(plyBase){
						const getFormconfig = plyBase.getFormconfig();
						getFormconfig.fromSchema?.forEach((item:any) => {
							if(item.prop == "Base.cNeedfeeFlag"){
								item.disabled = true;
							}
						});
					}
					nRecRemPrm.value = res.data.policyApplication.nRecRemPrm 
				}
			} else {
				ElMessage.error({ message: res.msg, duration: 3000 });
				return false;
			}
		}
    nextTick(() => {
      opertaor.setDataAll(dataInit.value);
    });
  } else if (props.param.pageType === "TEMPORARY_DEPOSIT") {
    // 暂存单
    const cAppNo = props.param?.cInquiryNo || props.param?.cAppNo;
    await loadAppPlyInfo(cAppNo);
    if (props.param.cAppTyp == "E") {
      if (props.param.cEdrType == "1") {
        bthList.value = edrBtn;
        nextTick(() => {
          opertaor.setDisabledAll();
          getEdrRsnItemFun(
            props.param["cProdNo"],
            props.param["cDptCde"],
            props.param["cEdrRsnBundleCde"],
            props.param["cEdrRsnBundleCde"],
            props.param["cEdrType"],
            props.param["cGrpMrk"]
          );

          // 用于处理 账户信息
          let acctinfoInfo = opertaor.getTableRefByKey('acctinfo')
          console.log('669',acctinfoInfo)
          if(acctinfoInfo){
              console.log('670',acctinfoInfo)
              acctinfoInfo.setDisabledAll(false);  
              acctinfoInfo.setFormItem('Acctinfo.cAcctNme',{
                disabled: true
              })
              acctinfoInfo.setFormItem('Acctinfo.cBankCnaps',{
                disabled: true
              })
          }  
        });
        edritem.value?.handleQuery();
      } else {
        bthList.value = edrSurrenderBtn;
      }
    } else if (props.param.cAppTyp == "A") {
      bthList.value = basicBtn;
      rightBtnList.value = basicRightBtn;
			if(props.param?.pageName === "priceInquiry") {
				bthList.value.push(
					createFreeButtonBase({
						label: "发起风勘",
						type: "primary",
						func: () => {
							if (getNo.value == '暂无') {
								ElMessage.error('询价单号为空,请保存后操作!');
								return false;
							}
							startWindExploration(); 
						},
					}),
				)
			}
    }

     


  } else if (props.param.pageType === "PLY_APP_MODIFY_BOUNCED_SCENE") {
    // 投保单核保退回
    const cAppNo = props.param?.cInquiryNo || props.param?.cAppNo;
    await loadAppPlyInfo(cAppNo);
    bthList.value = basicBtn;
    rightBtnList.value = basicRightBtn;
  } else if (props.param.pageType === "EDR_APP_MODIFY_BOUNCED_SCENE") {
    // 批改单核保退回
    const cAppNo = props.param.cAppNo;
    await loadAppPlyInfo(cAppNo);
    bthList.value = edrBtn;
    nextTick(() => {
      opertaor.setDisabledAll();
      getEdrRsnItemFun(
        props.param["cProdNo"],
        props.param["cDptCde"],
        props.param["cEdrRsnBundleCde"],
        props.param["cEdrRsnBundleCde"],
        props.param["cEdrType"],
        props.param["cGrpMrk"]
      );
    });
    edritem.value?.handleQuery();
  } else if (props.param.pageType === "PLY_UW_PROCESS_SCENE") {
    const cAppNo = props.param?.cInquiryNo || props.param?.cAppNo;
    await loadAppPlyInfo(cAppNo);
    if (props.param.cAppTyp == "E") {
      edritem.value?.handleQuery();
      const getFormconfig = edrbase.value?.getFormconfig();
      getFormconfig.fromSchema?.forEach((item) => {
        item.disabled = true;
      });
    }
    bthList.value = uwBtn;
    rightBtnList.value = [
      createFreeButtonBase({
        label: "费用信息",
        type: "primary",
        id: "modFee",
        icon: "Money",
        func: () => {
          //获取费用信息类型接口（缺少渠道，保费，当前表单提交校验待后续补充）
          const params = {};
          if(props.param.pageName === "priceInquiry") {
            params["CInquiryNo"] = props.param.cInquiryNo;
            params["type"] = "inquiry";
          } else {
            params["CAppNo"] = props.param.cAppNo;
          }
          checkFeeWindowType(params).then((res: any) => {
            if (200 !== res["code"]) {
              ElMessage.error(res["msg"]);
            } else {
              if (!!res["data"]) {
                //typeFlag = res['data'];
              } else {
                ElMessage.error(res["msg"]);
              }
            }
          });
          dzmodal
            .open(CostInformation, { type: "Issuer", data: props.param })
            .then((res: any) => {
              if (res.type === "ok") {
              }
            });
        },
      }),
      createFreeButtonBase({
        label: "历次批单",
        type: "primary",
        id: "preOrder",
        icon: "Document",
        func: () => {
          if (props.param?.cAppTyp === "A") {
            ElMessage.warning("这是一张承保申请单，无法查看【本保单历次批单】");
            return;
          }
          dzmodal
            .open(PreviousdrOpnList, {
              type: "Issuer",
              objId: props.param?.plyNo,
              prodNo: props.param?.cProdNo,
            })
            .then((res: any) => {
              if (res.type === "ok") {
              }
            });
        },
      }),
      createFreeButtonBase({
        label: "任务痕迹",
        type: "primary",
        id: "taskVestige",
        icon: "SetUp",
        func: () => {
          dzmodal
            .open(TaskListVestige, {
              type: "Issuer",
              data: { objId: props.param?.cAppNo, sysType: props.param?.sysType },
            })
            .then((res: any) => {
              if (res.type === "ok") {
              }
            });
        },
      }),
      createFreeButtonBase({
        label: "核保信息",
        type: "primary",
        id: "undrInfo",
        icon: "DocumentChecked",
        func: () => {
          dzmodal
            .open(UndrOpnList, { type: "", CAppNo: props.param?.cAppNo })
            .then((res: any) => {
              if (res.type === "ok") {
              }
            });
        },
      }),
    ]
		// 核保只有询价单才展示风勘查询按钮
		if(props.param?.pageName === "priceInquiry") {
			bthList.value.push(
				createFreeButtonBase({
					label: "风勘查询",
					type: "primary",
					func: () => {
						getWindExploration(); 
					},
				}),
			)
		}
    //核保处理
    nextTick(() => {
      opertaor.setDisabledAll();
    });
  } else if (props.param.pageType === "EDR_APP_NEW_SCENE" || props.param.pageType === "TEMPORARY_DEPOSIT" ) {
    // 批改申请-新增
    const cAppNo = props.param.cAppNo;
    await loadAppPlyInfo(cAppNo);
    if (props.param.cEdrType == "1") {
      if (props.param["cRsnCde"] != "FZ") {
        edrbase.value?.setValue("EdrBase.cEdrRsnDetail", [
          props.param["cRsnCde"],
        ]);
      }
      nextTick(() => {
        opertaor.setDisabledAll();


        getEdrRsnItemFun(
          props.param["cProdNo"],
          props.param["cDptCde"],
          props.param["cRsnCde"],
          props.param["cRsnCde"],
          props.param["cEdrType"],
          props.param["cGrpMrk"]
        );

        console.log('3333',opertaor.getTableRefByKey('acctinfo'))
        // 用于处理 账户信息
        let acctinfoInfo = opertaor.getTableRefByKey('acctinfo')
        if(acctinfoInfo){
            acctinfoInfo.setDisabledAll(false);  
            acctinfoInfo.setFormItem('Acctinfo.cAcctNme',{
              disabled: true
            })
            acctinfoInfo.setFormItem('Acctinfo.cBankCnaps',{
              disabled: true
            })

        }
        //   CAcctNme
            // ?.value?.setDisabledAll(isDisabled);

      });
      bthList.value = edrBtn;
    } else {
      bthList.value = edrSurrenderBtn;
    }
  } else if (props.param.pageType === "readonly") {
    // 查询数据
    // const getAppPlyInfoRes = await getAppPlyInfoByAppNo({
    //   CAppNo: props.param.cAppNo,
    // });
    // console.log("getAppPlyInfoRes", getAppPlyInfoRes);
    // const data = getAppPlyInfoRes.data;
    const cAppNo = props.param?.cInquiryNo || props.param?.cAppNo;
    await loadAppPlyInfo(cAppNo);
    if (props.param.cAppTyp == "E") {
      edritem.value?.handleQuery();
      const getFormconfig = edrbase.value?.getFormconfig();
      getFormconfig.fromSchema?.forEach((item) => {
        item.disabled = true;
      });
    }
    
    nextTick(() => {
      opertaor.setDisabledAll();
    });
    nextTick(() => {
      // console.log(data);
      // opertaor.setDataAll(data);
      // set
      // page.getRefTab("base").setFormValue(lowercaseKeys(data["base"]));
      // let cvrgList = data["cvrg"];
      // cvrgList = cvrgList.map((item) => {
      //   item.nTgtNumFld8 = 10;
      //   return lowercaseKeys(item);
      // });
      // page.getRefTab("cvrg").setFormValue(cvrgList);
      // page.getRefTab("tgt").setFormValue(lowercaseKeys(data["tgt"]));
      // page
      //   .getRefTab("applicant")
      //   .setFormValue(lowercaseKeys(data["applicant"]));
    });
  } else if (props.param.pageType === "UW_READ_SCENE") {
    //核保查看
    nextTick(() => {
      opertaor.setDisabledAll();
    });
    const cAppNo = props.param?.cInquiryNo || props.param?.cAppNo;
    await loadAppPlyInfo(cAppNo);
    if (props.param.cAppTyp == "E") {
      edritem.value?.handleQuery();
      const getFormconfig = edrbase.value?.getFormconfig();
      getFormconfig.fromSchema?.forEach((item) => {
        item.disabled = true;
      });
    }
    nextTick(() => {
      opertaor.setDisabledAll();
    });
  } else if (props.param.pageType === "orig") {
    console.log('续保复制----')
    // 续保复制
    getAppPolicy({
      cAppNo: props.param.cAppNo,
      queryTyp: props.param.pageType,
     
    }).then((res) => {
      if (res) {
        const ops = opertaor.convertData(res);
        ops['plyBase']['Base.cRenewMrk'] = '1'
        ops['plyBase']['Base.cPlyNo'] = ''
        ops['insrnc']['Base.tAppTm'] = moment(new Date(Date.now())).format(
            "YYYY-MM-DD HH:mm:ss"
        )
        // ops['insrnc']['Base.tInsrncBgnTm'] = addOneYear(ops['insrnc']['Base.tInsrncBgnTm'])
        ops['insrnc']['Base.tInsrncBgnTm'] = dayjs(ops['insrnc']['Base.tInsrncBgnTm'])
            .add(1, "year")
            .format("YYYY-MM-DD HH:mm:ss");
        ops['insrnc']['Base.tInsrncEndTm'] = dayjs(ops['insrnc']['Base.tInsrncBgnTm'])
            .add(1, "year")
            .format("YYYY-MM-DD HH:mm:ss");
        ops['insrnc']['Base.cTmSysCde']= moment(ops['insrnc']['Base.tInsrncEndTm']).diff(
            moment(ops['insrnc']['Base.tInsrncBgnTm']),
            "days"
        );
        if(ops['ci'] && ops['ci'].length>0){
          ops['ci'].forEach((item:any)=>{
            if(item['Ci.nCiShare']){
              item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])*100;
            }
          })
        }
        opertaor.setDataAll(ops);
        // 获取原申请单号下的清单列表数据
        const distMap = formconfig1[0].pageInfo.filter((item:any) => {
          return item.pageKey === "dist";
        });
        distMap.forEach((item:any) => {
          getDistData(props.param?.cAppNo, item)
        });
        //获取单号
        // getCAppNoFun();
      }
    });
    bthList.value.push(
      createFreeButtonBase({
        label: "保存模板",
        type: "primary",
        buttonColor: bottomBtnColor1,
        func: () => {
          handleSaveTemplate()
        },
      }),
      createFreeButtonBase({
        label: "复制出单",
        type: "primary",
        buttonColor: bottomBtnColor1,
        func: () => {
          copyPolicyFun();
        },
      }),
      createFreeButtonBase({
        label: "保费计算",
        type: "primary",
        id: "btn010101",
        func: () => {
          // calcPremium();
          queryTermRateLimitFun(calcPremium)
        },
      }),
      createFreeButtonBase({
        label: "保存",
        type: "primary",
        id: "btn010102",
        func: () => {
          savePlyInfo();
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
        type: "primary",
        buttonColor: bottomBtnColor1,
        func: () => {
          setTaxInfo();
        },
      }),
      createFreeButtonBase({
        label: "反洗钱扩展信息",
        type: "primary",
        buttonColor: bottomBtnColor1,
        func: () => {
          setCusBenefitInfo();
        },
      }),
      createFreeButtonBase({
        label: "额度明细",
        type: "primary",
        buttonColor: bottomBtnColor1,
        func: () => {
          openLimit();
        },
      })
    );
  } else if (props.param.pageType === "copy") {
    getAppPolicyForCopy({
      cAppNo: props.param.cAppNo,
    }).then((res) => {
      if (res) {
        const ops = clearCAppNo(opertaor.convertData(res));
        // 保险期限 投保日期更新为当前日期 保险起期和保险止期重置为第二天0点至一年后
        if(ops.insrnc) {
          const beginTm = dayjs().add(1, 'day').format("YYYY-MM-DD 00:00:00")
          const endTm = dayjs().add(1, 'year').format("YYYY-MM-DD 23:59:59")
          ops.insrnc["Base.tInsrncBgnTm"] = beginTm;
          ops.insrnc["Base.tInsrncEndTm"] = endTm;
          ops.insrnc['Base.tAppTm'] = dayjs().format("YYYY-MM-DD HH:mm:ss")
        }
        // 条款信息中的cPkId删除
        if(ops.cvrg && ops.cvrg.length > 0) {
          ops.cvrg.forEach((item:any) => {
            delete item['Term.cPkId']
            item['Term.riskList'].forEach((i:any) => {
              delete i['Term.cPkId']
            })
          })
        }
        // 承包基本信息中的保额和保费也初始化为0
        if(ops.base) {
          ops.base['Base.nPrm'] = 0
          ops.base['Base.nAmt'] = 0
        }
        // 缴费计划列表清空
        if(ops.payinfo && ops.payinfo.length > 0) {
          ops.payinfo = []
        }
        // 特约信息
        if(ops.SpecialAgreement && ops.SpecialAgreement.length > 0) {
          ops.SpecialAgreement.forEach((item:any) => {
            delete item['SpecialAgreement.cPkId']
          })
        }
        // 免赔条件
        if(ops.deductibleDist && ops.deductibleDist.length > 0) {
          ops.deductibleDist.forEach((item:any) => {
            delete item['DeductibleDist.cPkId']
          })
        }
        // 保单基本信息 录单日期和签单日期默认为当前年月日
        if(ops.plyBase) {
          ops.plyBase['Base.tIssueTm'] = dayjs().format("YYYY-MM-DD 00:00:00")
          ops.plyBase['Base.tOprTm'] = dayjs().format("YYYY-MM-DD 00:00:00")
        }
        ops['plyBase']['Base.cPlyNo'] = ''
        if(ops['ci'] && ops['ci'].length>0){
          ops['ci'].forEach((item:any)=>{
            if(item['Ci.nCiShare']){
              item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])*100;
            }
          })
        }
        opertaor.setDataAll(ops);
        // 获取原申请单号下的清单列表数据
        const distMap = formconfig1[0].pageInfo.filter((item:any) => {
          return item.pageKey === "dist";
        });
        distMap.forEach((item:any) => {
          getDistData(props.param?.cAppNo, item)
        });
        //获取单号
        // getCAppNoFun();
      }
    });
    bthList.value.push(
      createFreeButtonBase({
        label: "保存模板",
        type: "primary",
        buttonColor: bottomBtnColor1,
        func: () => {
          handleSaveTemplate()
        },
      }),
      createFreeButtonBase({
        label: "复制出单",
        type: "primary",
        buttonColor: bottomBtnColor1,
        func: () => {
          copyPolicyFun();
        },
      }),
      createFreeButtonBase({
        label: "保费计算",
        type: "primary",
        id: "btn010101",
        func: () => {
          // calcPremium();
          queryTermRateLimitFun(calcPremium)
        },
      }),
      createFreeButtonBase({
        label: "保存",
        type: "primary",
        id: "btn010102",
        func: () => {
          savePlyInfo();
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
        type: "primary",
        buttonColor: bottomBtnColor1,
        func: () => {
          setTaxInfo();
        },
      }),
      createFreeButtonBase({
        label: "反洗钱扩展信息",
        type: "primary",
        buttonColor: bottomBtnColor1,
        func: () => {
          setCusBenefitInfo();
        },
      }),
      createFreeButtonBase({
        label: "额度明细",
        type: "primary",
        buttonColor: bottomBtnColor1,
        func: () => {
          openLimit();
        },
      })
    );
  } else if (props.param?.pageType === "template") {
    policyService.getTemplate(props.param?.cPkId).then((res:any) => {
      if (res["code"] == "200") {
        ElMessage.success('模板加载完成');
        const cTplCtnt = res['res'].cTplCtnt;
        // this.cTplNme = result['res'].cTplNme;
        // this.cTplDesc = result['res'].cDesc;
        // this.TplPkId = result['res'].cPkId;
        parseData.value = JSON.parse(cTplCtnt);
        const ops = clearCAppNo(JSON.parse(cTplCtnt));
        // 保险期限 投保日期更新为当前日期 保险起期和保险止期重置为第二天0点至一年后
        if(ops.insrnc) {
          const beginTm = dayjs().add(1, 'day').format("YYYY-MM-DD 00:00:00")
          const endTm = dayjs().add(1, 'year').format("YYYY-MM-DD 23:59:59")
          ops.insrnc["Base.tInsrncBgnTm"] = beginTm;
          ops.insrnc["Base.tInsrncEndTm"] = endTm;
          ops.insrnc['Base.tAppTm'] = dayjs().format("YYYY-MM-DD HH:mm:ss")
        }
        // 条款信息中的cPkId删除
        if(ops.cvrg && ops.cvrg.length > 0) {
          ops.cvrg.forEach((item:any) => {
            delete item['Term.cPkId']
            item['Term.riskList'].forEach((i:any) => {
              delete i['Term.cPkId']
            })
          })
        }
        // 承包基本信息中的保额和保费也初始化为0
        if(ops.base) {
          ops.base['Base.nPrm'] = 0
          ops.base['Base.nAmt'] = 0
        }
        // 缴费计划列表清空
        if(ops.payinfo && ops.payinfo.length > 0) {
          ops.payinfo = []
        }
        // 特约信息
        if(ops.SpecialAgreement && ops.SpecialAgreement.length > 0) {
          ops.SpecialAgreement.forEach((item:any) => {
            delete item['SpecialAgreement.cPkId']
          })
        }
        // 免赔条件
        if(ops.deductibleDist && ops.deductibleDist.length > 0) {
          ops.deductibleDist.forEach((item:any) => {
            delete item['DeductibleDist.cPkId']
          })
        }
        // 保单基本信息 录单日期和签单日期默认为当前年月日
        if(ops.plyBase) {
          ops.plyBase['Base.tIssueTm'] = dayjs().format("YYYY-MM-DD 00:00:00")
          ops.plyBase['Base.tOprTm'] = dayjs().format("YYYY-MM-DD 00:00:00")
        }
        if(ops['ci'] && ops['ci'].length>0){
          ops['ci'].forEach((item:any)=>{
            if(item['Ci.nCiShare']){
              item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])*100;
            }
          })
        }
        opertaor.setDataAll(ops);
        // 获取原申请单号下的清单列表数据
        const distMap = formconfig1[0].pageInfo.filter((item:any) => {
          return item.pageKey === "dist";
        });
        distMap.forEach((item:any) => {
          getDistData(parseData.value.plyBase['Base.cAppNo'], item)
        });
        //获取单号
        // getCAppNoFun();
      }
    }).catch((err:any) => {
      ElMessage.error(err);
    });
    bthList.value.push(
      createFreeButtonBase({
        label: "保费计算",
        type: "primary",
        id: "btn010101",
        func: () => {
          // calcPremium();
          queryTermRateLimitFun(calcPremium)
        },
      }),
      createFreeButtonBase({
        label: "保存",
        type: "primary",
        id: "btn010102",
        func: () => {
          savePlyInfo();
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
        type: "primary",
        buttonColor: bottomBtnColor1,
        func: () => {
          setTaxInfo();
        },
      }),
      createFreeButtonBase({
        label: "反洗钱扩展信息",
        type: "primary",
        buttonColor: bottomBtnColor1,
        func: () => {
          setCusBenefitInfo();
        },
      }),
    );
    rightBtnList.value.push(
      createFreeButtonBase({
        label: "保存模板",
        type: "primary",
        buttonColor: bottomBtnColor1,
        icon: "Memo",
        func: () => {
          handleSaveTemplate()
        },
      }),
      createFreeButtonBase({
        label: "复制出单",
        type: "primary",
        buttonColor: bottomBtnColor1,
        icon: "CopyDocument",
        func: () => {
          copyPolicyFun();
        },
      }),
      createFreeButtonBase({
        label: "额度明细",
        type: "primary",
        buttonColor: bottomBtnColor1,
        icon: "Tickets",
        func: () => {
          openLimit();
        },
      })
    )
  } else if (props.param?.pageType === "inquiryToApp") {
    getInquiryPolicy({ cInquiryNo: props.param?.cInquiryNo }).then((res:any) => {
      if (res["code"] == "200") {
        const clearKey = clearKeyMap.filter((item:any) => item !== "cAppNo")
        const ops = clearCAppNo(opertaor.convertData(res), clearKey);
        // 保险期限 投保日期更新为当前日期 保险起期和保险止期重置为第二天0点至一年后
        if(ops.insrnc) {
          const beginTm = dayjs().add(1, 'day').format("YYYY-MM-DD 00:00:00")
          const endTm = dayjs().add(1, 'year').format("YYYY-MM-DD 23:59:59")
          ops.insrnc["Base.tInsrncBgnTm"] = beginTm;
          ops.insrnc["Base.tInsrncEndTm"] = endTm;
          ops.insrnc['Base.tAppTm'] = dayjs().format("YYYY-MM-DD HH:mm:ss")
        }
        // 条款信息中的cPkId删除
        if(ops.cvrg && ops.cvrg.length > 0) {
          ops.cvrg.forEach((item:any) => {
            delete item['Term.cPkId']
            item['Term.riskList'].forEach((i:any) => {
              delete i['Term.cPkId']
            })
          })
        }
        // 承包基本信息中的保额和保费也初始化为0
        if(ops.base) {
          ops.base['Base.nPrm'] = 0
          ops.base['Base.nAmt'] = 0
        }
        // 缴费计划列表清空
        if(ops.payinfo && ops.payinfo.length > 0) {
          ops.payinfo = []
        }
        // 特约信息
        if(ops.SpecialAgreement && ops.SpecialAgreement.length > 0) {
          ops.SpecialAgreement.forEach((item:any) => {
            delete item['SpecialAgreement.cPkId']
          })
        }
        // 免赔条件
        if(ops.deductibleDist && ops.deductibleDist.length > 0) {
          ops.deductibleDist.forEach((item:any) => {
            delete item['DeductibleDist.cPkId']
          })
        }
        // 保单基本信息 录单日期和签单日期默认为当前年月日
        if(ops.plyBase) {
          ops.plyBase['Base.tIssueTm'] = dayjs().format("YYYY-MM-DD 00:00:00")
          ops.plyBase['Base.tOprTm'] = dayjs().format("YYYY-MM-DD 00:00:00")
        }
        ops['plyBase']['Base.cPlyNo'] = ''
        ops['plyBase']['Base.cAppStatus'] = ''
        if(ops['ci'] && ops['ci'].length>0){
          ops['ci'].forEach((item:any)=>{
            if(item['Ci.nCiShare']){
              item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])*100;
            }
          })
        }
        opertaor.setDataAll(ops);
        // 获取原申请单号下的清单列表数据
        const distMap = formconfig1[0].pageInfo.filter((item:any) => {
          return item.pageKey === "dist"
        });
        distMap.forEach((item:any) => {
          getDistData(props.param?.cInquiryNo, item)
        });
      }
    })
    bthList.value = basicBtn;
    rightBtnList.value = basicRightBtn;
  }

  bthList.value.push(
    createFreeButtonBase({
      label: "返回",
      func: () => {
        history.back();
      },
    }),
  
  );
  rightBtnList.value.push(
    createFreeButtonBase({
      label: "历史赔案",
      type: "primary",
      buttonColor: bottomBtnColor1,
      icon: "Histogram",
      func: () => {
        historyClaimcaseFun();
        // src\views\pcis-new-udr-list\common\history-claimcase-model.vue
      },
    }),
  )

  if(props.param?.showBtn === false){
    bthList.value = [];
  }
  pageLoaded.value = true;

}
function addOneYear(a:any) {
  // 将字符串转换为本地时间的日期对象
  let date = new Date(a.replace(' ', 'T'));

  // 获取当前年份
  let currentYear = date.getFullYear();

  // 获取当前月份和日期
  let currentMonth = date.getMonth();
  let currentDay = date.getDate();

  // 获取加一年后的年份
  let nextYear = currentYear + 1;

  // 设置加一年后的日期
  date.setFullYear(nextYear);

  // 检查是否跨年后的日期无效 (如闰年情况)
  if (date.getMonth() !== currentMonth || date.getDate() !== currentDay) {
    // 设置为下个月的最后一天，确保日期正确
    date.setMonth(currentMonth + 1, 0); // 设置为当前月最后一天
  }

  // 手动格式化日期为 'YYYY-MM-DD HH:MM:SS'
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, '0'); // 保证2位数
  let day = String(date.getDate()).padStart(2, '0'); // 保证2位数
  let hours = String(date.getHours()).padStart(2, '0');
  let minutes = String(date.getMinutes()).padStart(2, '0');
  let seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
// 获取清单数据并填充到列表
const getDistData = (appNo:any, item: any) => {
  const selData = {
    cComponentTable: item.pageCode.slice(0, -6),
    // cAppNo: appNo,
  };
  if(props.param?.pageType === "inquiryToApp" || props.param?.pageName === "priceInquiry") {
    selData.cInquiryNo = appNo;
  } else {
    selData.cAppNo = appNo;
  }
  if(props.param?.pageType && props.param?.pageType === "EDR_APP_NEW_SCENE") {
    selData.voType = "ply"
  }

  selectDist(selData).then((res: any) => {
    if (res.code === 200) {
      opertaor.getTableRefs()[item.pageCode].setTableData(res.data.data, res.data.total);
    }
  });
  // 调用接口查询清单对应的汇总的pageCode
  distMapCollectCompKey({
    cProdNo: route.params.param?.cProdNo,
    cComponentKey: item.pageCode,
  }).then((res) => {
    if(res) {
      // 根据获得的汇总的pageCode来查询汇总列表数据，如果没有返回值代表此清单没有对应的汇总列表
      selectDist({ ...selData, isSummary: '1'}).then((r: any) => {
        if (r.code === 200) {
          opertaor.getTableRefs()[res].setTableData(r.data.data);
        }
      });
    }
  });
}
const getCAppNoFun = () => {
  const res = {
    cProdNo: props.param.cProdNo,
    cDptCde: props.param.cDptCde,
    icVchTyp: props.param?.pageName === "priceInquiry" ? "INQUIRY_NUMBER" : "POLICY_NUMBER",
  };
  generatelSingleNo(res).then((res) => {
    console.log("generatelSingleNo-res", res);
    if (res["code"] == "200") {
      opertaor.getTableRefByKey("plyBase").setValue("Base.cAppNo", res["data"]);
    }
  });
};
const saveDistBatchFlag = ref(true);
// 批量保存清单
const saveDist = (appNo:any, cRsnCde?:any) => {
  const distMap = formconfig1[0].pageInfo.filter((item:any) => {
    return item.pageKey === "dist";
  });
  const params = {};
  if(cRsnCde) {
    params['cRsnCde'] = cRsnCde;
    params['cAppNo'] = props.param?.cOrgAppNo;
    params['targetNo'] = appNo;
  } else if(props.param?.pageType === "template") {
    params['cAppNo'] = parseData.value.plyBase['Base.cAppNo'];
    params['targetNo'] = appNo;
  } else if(props.param?.pageType === "inquiryToApp") {
    params['cInquiryNo'] = props.param?.cInquiryNo;
    params['targetNo'] = appNo;
  } else {
    params['cAppNo'] = props.param?.cAppNo;
    params['targetNo'] = appNo;
  }
  copyDist(params).then((res:any) => {
    if(res && res.code === 200) {
      distMap.forEach((item:any) => {
        opertaor.getTableRefs()[item.pageCode].handleQuery();
      });
      saveDistBatchFlag.value = false;
    } else {
      ElMessage.error(res.msg);
    }
  }).catch((err:any) => {
    ElMessage.error(err.msg);
  })
}
/**
 * 加载投保单明细
 */
const loadAppPlyInfo = async (CAppNo) => {
  const param = {
    scene: props.param.pageType,
  };
  if ("EDR_APP_NEW_SCENE" === props.param.pageType) {
    param["CPlyNo"] = CAppNo;
  } else if (props.param.pageName === "priceInquiry") {
    param["cInquiryNo"] = CAppNo;
  }else{
     param["cAppNo"] = CAppNo;
  }
  if(props.param?.cPkId) {// 查询模板明细
    const res = await policyService.getTemplate(props.param?.cPkId);

    if (res["code"] == "200") {
      const ops = opertaor.convertData(res);
      console.log("转换的数据", ops);
      if (res["res"]["composition"]["EdrBase"]) {
        const EdrBaseData = res["res"]["composition"]["EdrBase"][0];
        if (
          res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"] !=
            "" &&
          res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"] !=
            null
        ) {
          res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"] =
            res["res"]["composition"]["EdrBase"][0][
              "EdrBase.cEdrRsnDetail"
            ].split(",");
        }
        console.log("EdrBaseData", EdrBaseData);
        if ("EDR_APP_NEW_SCENE" === props.param.pageType) {
          res["res"]["composition"]["EdrBase"][0]["EdrBase.cRatioTyp"] = "2";
          res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrType"] =
            props.param["cEdrType"];
          res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnBundleCde"] =
            props.param["cRsnCde"];
          if (props.param.cEdrType != "1") {
            res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"] = [
              props.param["cRsnCde"],
            ];
          }
        }
        edrbase.value?.setFormValue(EdrBaseData);
      }
      ElMessage.success(res.msg);
      if(ops['ci'] && ops['ci'].length>0){
        ops['ci'].forEach((item:any)=>{
          if(item['Ci.nCiShare']){
            item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])*100;
          }
        })
      }
      opertaor.setDataAll(ops);
      // 展示保费和保额金额
      if (ops["base"]["Base.nPrm"] && ops["base"]["Base.nPrm"] > 0) {
        nPrm.value = ops["base"]["Base.nPrm"];
      }
      if (ops["base"]["Base.nAmt"] && ops["base"]["Base.nAmt"] > 0) {
        nAmt.value = ops["base"]["Base.nAmt"];
      }
      pageData.value = ops;
    }
  } else if(props.param?.cInquiryNo || props.param?.pageName === "priceInquiry") {
    // 询价单
    const res = await getInquiryPolicy(param);

    if (res["code"] == "200") {
      const ops = opertaor.convertData(res);
      console.log("转换的数据", ops);
      // 展示保费和保额金额
      if (ops["base"]["Base.nPrm"] && ops["base"]["Base.nPrm"] > 0) {
        nPrm.value = ops["base"]["Base.nPrm"];
      }
      if (ops["base"]["Base.nAmt"] && ops["base"]["Base.nAmt"] > 0) {
        nAmt.value = ops["base"]["Base.nAmt"];
      }
      pageData.value = ops;
      ElMessage.success(res.msg);
      if(ops['ci'] && ops['ci'].length>0){
        ops['ci'].forEach((item:any)=>{
          if(item['Ci.nCiShare']){
            item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])*100;
          }
        })
      }
      opertaor.setDataAll(ops);
      // 获取原申请单号下的清单列表数据
      const distMap = formconfig1[0].pageInfo.filter((item:any) => {
        return item.pageKey === "dist";
      });
      distMap.forEach((item:any) => {
        getDistData(ops.plyBase['Base.cInquiryNo'], item)
      });
    }
  } else {
    const res = await getAppPolicy(param);

    console.log("投保单明细", res);
    if (res["code"] == "200") {
      const ops = opertaor.convertData(res);
      console.log("转换的数据", ops);
      if (res["res"]["composition"]["EdrBase"]) {
        const EdrBaseData = res["res"]["composition"]["EdrBase"][0];
        if (
          res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"] !=
            "" &&
          res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"] !=
            null
        ) {
          res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"] =
            res["res"]["composition"]["EdrBase"][0][
              "EdrBase.cEdrRsnDetail"
            ].split(",");
        }
        console.log("EdrBaseData", EdrBaseData);
        if ("EDR_APP_NEW_SCENE" === props.param.pageType) {
          res["res"]["composition"]["EdrBase"][0]["EdrBase.cRatioTyp"] = "2";
          res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrType"] =
            props.param["cEdrType"];
          res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnBundleCde"] =
            props.param["cRsnCde"];
          if (props.param.cEdrType != "1") {
            res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"] = [
              props.param["cRsnCde"],
            ];
          }
          // 初始化时，将cPkId赋值给cRowId
          Object.keys(ops).forEach((key) => {
            if(key !== 'base' && key !== 'plyBase'){
              const v = ops[key];
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
                ops[key] = ls;
              }
            }
          })
        }
        edrbase.value?.setFormValue(EdrBaseData);
      }
      // 展示保费和保额金额
      if (ops["base"]["Base.nPrm"] && ops["base"]["Base.nPrm"] > 0) {
        nPrm.value = ops["base"]["Base.nPrm"];
      }
      if (ops["base"]["Base.nAmt"] && ops["base"]["Base.nAmt"] > 0) {
        nAmt.value = ops["base"]["Base.nAmt"];
      }
      if(ops['ci'] && ops['ci'].length>0){
        ops['ci'].forEach((item:any)=>{
          if(item['Ci.nCiShare']){
            item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])*100;
          }
        })
      }
      pageData.value = ops;
      ElMessage.success(res.msg);
      opertaor.setDataAll(ops);
    }
  }
};
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
 * 公共验证，保费计算和核保，都需要走的验证方法
 */
function baseValite(){
  let r = true;
    // 校验承包基本信息中的总保额和总保费币种须一致
  const baseValue = opertaor.getTableRefByKey("base").getFromValue();
  if(baseValue["Base.cAmtCur"] !== baseValue["Base.cPrmCur"]) {
    ElMessage.error("承保基本信息中的总保额币种和总保费币种须一致!");
    r = false;
  }
  return r;
}
/**
 * 投保保费计算
 */
const calcPremium = () => {
  const btn = getBtn("btn010101");
  btn.loading = true;
  const res = opertaor.getDataAll();
  res["user"] = user;
  res["plyBase"]["Base.cDptCde"] = props.param.cDptCde;
  res["plyBase"]["Base.cProdNo"] = props.param.cProdNo;
  if(res['ci'] && res['ci'].length>0){
    res['ci'].forEach((item:any)=>{
      if(item['Ci.nCiShare']){
        item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])/100;
      }
    })
  }
  console.log(res);
  if (res["cvrg"].length == 0) {
    ElMessage.error("请录入条款信息");
    btn.loading = false;
    return;
  }
  
  const termref = opertaor.getTableRefByKey("cvrg");
  const calccheck = termref.calcCheck();
  if(!calccheck['res']){
    console.log(calccheck);
    ElMessage.error(calccheck['msg']);
    btn.loading = false;
    return;
  }
  if (!baseValite()) {
    btn.loading = false;
    return;
  }
  // 校验标的信息中核定座位总数和投保座位数总数不一致！
  const tgtValue = opertaor.getTableRefByKey("tgt")?.getFromValue() || '';
  if(tgtValue && tgtValue["Tgt.nSeatCapacity"] !== tgtValue["Tgt.nSeatsNumber"]) {
    ElMessage.error("核定座位总数和投保座位数总数不一致！");
    btn.loading = false;
    return;
  }
  const appCalcFun = props.param?.pageName === "priceInquiry" ? calculatePremium(res) : appCalc(res);
  appCalcFun.then((res: any) => {
    btn.loading = false;
    console.log("appCalc-res", res);
    if (res["code"] == "200") {
      const ops: any = opertaor.convertData(res);
      ops.needCalc = true;
       ops["base"]["needCalc"] = true
      console.log("保费计算转换的数据", ops);
      if (
        ops["base"]["Base.nPrm"] != undefined &&
        ops["base"]["Base.nPrm"] != null
      ) {
        ElMessage.success(res.msg + "保费为：" + ops["base"]["Base.nPrm"]);
      } else {
        ElMessage.success(res.msg + "保费为：0");
      }
      if(ops['ci'] && ops['ci'].length>0){
        ops['ci'].forEach((item:any)=>{
          if(item['Ci.nCiShare']){
            item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])*100;
          }
        })
      }

      opertaor.setDataAll(ops);

      nPrm.value = ops["base"]["Base.nPrm"] ? ops["base"]["Base.nPrm"] : 0;
            nAmt.value = ops["base"]["Base.nAmt"] ? ops["base"]["Base.nAmt"] : 0;

      const nAmtVal = ops["base"]["Base.nAmt"];
      const nPrmVal = ops["base"]["Base.nPrm"];
      const nPrmRmbExch = ops["base"]["Base.nPrmRmbExch"];

      productStore.setnPrm(nPrmVal);
      productStore.setnAmt(nAmtVal);
      if(opertaor.getTableRefByKey("ciMasterAgreement")) {
        opertaor
          .getTableRefByKey("ciMasterAgreement")
          .setValue("Base.nCiJntAmt", nAmt.value);
        opertaor
          .getTableRefByKey("ciMasterAgreement")
          .setValue("Base.nCiJntPrm", nPrm.value);
      }
      // opertaor
      //   .getTableRefByKey("ciMasterAgreement")
      //   .setValue("Base.nJiJntAmt", nAmt.value);
      // opertaor
      //   .getTableRefByKey("ciMasterAgreement")
      //   .setValue("Base.nCiJntPrm", nPrm.value);
      // opertaor
      //   .getTableRefByKey("ciMasterAgreement")
      //   .setValue("Base.nJiJntPrm", nPrm.value);
      // opertaor
      //   .getTableRefByKey("ourCompanyCiShare")
      //   .setValue("Base.nCiOwnAmt", nAmt.value);
      // opertaor
      //   .getTableRefByKey("ourCompanyCiShare")
      //   .setValue("Base.nCiOwnPrm", nPrm.value);

        //承保 总保费  Base.nPrm * Base.nPrmRmbExch


        opertaor.getTableRefs()["base"].setValue("Base.nPrm", nPrm.value);
        opertaor.getTableRefs()["base"].setValue("Base.nRmbPrm", nPrmVal*nPrmRmbExch);
        console.log('到————————', nPrm.value)

        //     opertaor
        // .getTableRefByKey("ourCompanyCiShare")
        // .setValue("Base.groupPrmCur", 122);
        //     opertaor
        // .getTableRefByKey("ourCompanyCiShare")
        // .setValue("Base.nPrm", 123);

      const payInfo = setPayInfo(ops["base"], ops["applicant"], ops["insrnc"]);

      console.log("生成缴费计划内容", payInfo);
      opertaor.getTableRefs()["payinfo"]?.setFormValue(payInfo);
      // const ciInfo = setCiInfo(ops["base"]);
      // opertaor.getTableRefs()["ci"].setFormValue(ciInfo); //生产联共保信息
      needCalc.value = false;
      opertaor.getTableRefByKey("base").nPayNumberFun();

//  opertaor.getTableRefs()["base"].setValue("Base.groupPrmCur", 122);


    } else {
      ElMessage.error(res.msg);
    }
    // ElMessage.success(res.msg);
    // history.back();
  });
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
const setCiInfo = (base: any) => {
  const ciList: any[] = [];
  const ci: any = {};
  ci["Ci.nSeqNo"] = 1;
  ci["Ci.nCiShare"] = '1'
  ci["Ci.nCiAmt"] = base["Base.nAmt"];
  ci["Ci.nCiPrm"] = base["Base.nPrm"]  ? base["Base.nPrm"] : 0;
  ci["Ci.cChiefMrk"] = "1"
  ci["Ci.cIssueMrk"] = "1"
  ci["Ci.nPlyFee"]="0.00"
  ci["Ci.nPlyFeeRate"]="0.00"
  ci["Ci.cCoinsurerCde"] = "327001"
  ci["Ci.cCiSubComp"] = props.param.cDptCde
  ciList.push(ci)
  return ciList;
};


// 风勘校验方法
function getFKFunc() {
  
 const param = {
    scene: "EDR_APP_NEW_SCENE",
    CPlyNo: opertaor.getTableRefByKey("plyBase").getValue("Base.cPlyNo"),
  };
  getAppPolicy(param).then((res: any) => {
    console.log("投保单明细", res.code);
    ElMessage.error("风勘未结束，不允许询价提核！");
    return false;
    // if(res.code ==500){
    //    return true;
    // }else{

    // }
    
     
  });
  // return true;
}


/**
 * 投保申请核保
 */
const submitToUndrFn = async () => {  
 	if (needCalc.value) {
    ElMessage.error("请先进行保费计算!");
    return;
  }

  console.log('座位总数',opertaor.getTableRefByKey("tgt"))
  console.log('座位总数', opertaor.getDataAll())
  /**
   * 联共保判断
   */
  const CiMrk = opertaor.getTableRefByKey("plyBase").getValue('Base.cCiMrk')
  if ('1' === CiMrk || '2' === CiMrk || '5' === CiMrk) {
      const validCi = JointInsuranceCheck();
  }
	// 申请核保前判断是否灰黑名单
	const cInquiryNumber = opertaor.getTableRefByKey("plyBase").getValue("Base.cInquiryNo")
	const cAppNo = opertaor.getTableRefByKey("plyBase").getValue("Base.cAppNo")
	console.log('cInquiryNumbercInquiryNumbercInquiryNumber', cInquiryNumber);
	console.log('cAppNocAppNocAppNocAppNo', cAppNo);
	
	const res: any = await isUndrClsBlackList({ cInquiryNumber, cAppNo});
	console.log('判断是否灰黑名单返回的res', res);
	if(res.code == 200){
		if(res.msg != '校验通过'){
			ElMessage({
				message: res.msg.replace(/\n/g, '<br>'),
				dangerouslyUseHTMLString: true,
				type: 'warning'
			});
			return false;
		}
	} else {
		ElMessage.error({ message: res.msg, duration: 3000 });
		return false;
	}
	// 风勘校验
 	if( props.param?.pageName === "priceInquiry" ){
		// const cInquiryNumber = opertaor.getTableRefByKey("plyBase").getValue("Base.cInquiryNo")
    const res: any = await getisAllDone({ cInquiryNumber });
    console.log('判断是否可以核保返回的res', res);
    if(res.code == 200){
			if(res.data == false){
				ElMessage.warning("风勘未结束，不允许询价提核！");
      	return false;
			}
    } else {
			ElMessage.error({ message: res.msg, duration: 3000 });
			return false;
		}
 	}
  if (!baseValite()) {
    return;
  }
  if (!checkNAmt()) return;

   //  042001  是否单项工程逻辑
   if(props.param?.cProdNo==='042001'){
      let tableLenght = opertaor.getTableRefByKey("DesignDist").getTableData().length;  // 清单条数
      let cIsSingle =  opertaor.getTableRefByKey("tgt").getValue('Tgt.cIsSingle');      // 是否单项工程
      if(tableLenght ==0 && cIsSingle==0){
        ElMessage.warning("“是否单项工程”为否时，设计工程项目清单不能为空！");  
        return false;
      }
   }

   if(props.param?.cProdNo==='043002'){
      let tgtRef = opertaor.getTableRefByKey("tgt");
      let num1 = tgtRef.getValue('Tgt.nTotalInsured'); 
      let num2 = tgtRef.getValue('Tgt.nInsuredcompanySeats'); 
      let sum = tgtRef.getValue('Tgt.nSeatCapacity');
      console.log('总数',num1 + num2  !== sum,props.param?.cProdNo,num1,num2,sum)
      if(num1 + num2  !== sum){
        ElMessage.error("投保座位总数 = 投保乘客座位总数+投保司乘人员座位总数，请核对");
        return;
      }
    }


  const f = await savePlyInfo(); // 提交核保,需要默认执行一次保存操作
  if (f) {
    const btn = getBtn("btn010103");

    const res: any = {};
    nextTick(async () => {
      const rv = await opertaor.validateAll();
      if (!rv) {
        return;
      }
      // 调用再保险位接口
      // const s = await saveDataInfo()
      // if(!s) return;
      btn.loading = true;
      console.log(opertaor.getTableRefByKey("plyBase").getFromValue());
      const base = opertaor.getTableRefByKey("plyBase").getFromValue();
      res["user"] = user;
  
      // 询价单申请核保参数
      if(props.param?.pageName === "priceInquiry") {
        res["taskId"] = 0;
        res["openPolicy"] = null;
        res["cInquiryNo"] = base["Base.cInquiryNo"];
      } else {
        res["appNo"] = base["Base.cAppNo"];
      }

      // 询价单申请核保参数
      if(props.param?.pageName === "priceInquiry") {
        res["taskId"] = 0;
        res["openPolicy"] = null;
        res["cInquiryNo"] = base["Base.cInquiryNo"];
      } else {
        res["appNo"] = base["Base.cAppNo"];
      }

      console.log("申请核保参数-----", res);

      const params = opertaor.getParam();
      //:TODO 进行一次保费计算,如果发生保费变化,则告知需要进行保费计算
      // 校验承包基本信息中的总保额和总保费币种须一致
      const baseValue = opertaor.getTableRefByKey("base").getFromValue();
      if(baseValue["Base.cAmtCur"] !== baseValue["Base.cPrmCur"]) {
        ElMessage.error("承保基本信息中的总保额币种和总保费币种须一致!");
        btn.loading = false;
        return;
      }
      // 校验标的信息中核定座位总数和投保座位数总数不一致！
      const tgtValue = opertaor.getTableRefByKey("tgt")?.getFromValue() || '';
      if(tgtValue && tgtValue["Tgt.nSeatCapacity"] !== tgtValue["Tgt.nSeatsNumber"]) {
        ElMessage.error("核定座位总数和投保座位数总数不一致！");
        btn.loading = false;
        return;
      }
      //校验联共保信息
      const plyBasedata = opertaor.getTableRefByKey("plyBase").getFromValue();

      
      if(plyBasedata["Base.cCiMrk"] !== "0") {
        const ciValue = opertaor.getTableRefByKey("ci")?.getFromValue() || '';
        const isCiValid = validateCiInfo();
        if (!isCiValid) {
          btn.loading = false;
          return;
        }
      }
      const calcData: any = opertaor.getDataAll();
      calcData["user"] = user;
      calcData["plyBase"]["Base.cDptCde"] = params.cDptCde;
      calcData["plyBase"]["Base.cProdNo"] = params.cProdNo;
      if(calcData['ci'] && calcData['ci'].length>0){
        calcData['ci'].forEach((item:any)=>{
          if(item['Ci.nCiShare']){
            item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])/100;
          }
        })
      }
      console.log(calcData);
      // 重新进行保费计算
      const calBtn = getBtn("btn010101");
      try {
        calBtn.loading = true;
        const calcres: any = props.param?.pageName === "priceInquiry" ? await calculatePremium(calcData) : await appCalc(calcData);
        if (calcres.code === 200) {
          const newOp: any = opertaor.convertData(calcres);
          const newPrm = newOp.base["Base.nPrm"];
          const oldPrm = calcData.base["Base.nPrm"];
          const newAmt = newOp.base["Base.nAmt"];
          const oldAmt = calcData.base["Base.nAmt"];
          if (newPrm === oldPrm && newAmt === oldAmt) {
            const undr: any = props.param?.pageName === "priceInquiry" ? await submitInquiry(res) : await submitToUndr(res);
            btn.loading = false;
            console.log("submitToUndr-res", undr);
            if (undr["code"] == 200) {
              if(undr['cDecision'] !== '0'){
                ElMessage({
                  showClose: true,message:undr.msg,duration:6000,type: 'success'
                });
                // 申请核保成功后按钮设置为不可点击
                const btn = getBtn("btn010103");

                if(undr['cDecision'] === '1' || undr['cDecision'] === '2'){
                  tagsViewStore.delView({"name": "my-page",
                    "title": "申请单录入",
                    "path": "/pcis/my-page",
                    "fullPath": "/pcis/my-page"}).then((res: any) => {
                    router.replace({ path: "/dashboard" });
                  });
                }

              }else if(undr["cDecision"] == '0'){
                ElMessage.error(undr.msg);
              }else{
                ElMessage({
                  showClose: true,message:undr.msg,duration:6000,type: 'success'
                });
              }
                btn.disabled = true;
              //关闭当前tab页面
              // this.$router.back();

            } else {

              // 关联交易业务 时 股东客户改是  审批单号必填
              if(undr.msg ==='该笔业务为关联交易业务，请上传【关联交易审批单】，并录入【关联交易审批单编号】！'){
                    const appTabref = opertaor.getTableRefs()["applicant"];
                    const insTabref = opertaor.getTableRefs()["insured"];
  
                    appTabref.setValue("Applicant.cStkMrk", '1');
                    appTabref.setFormItem('Applicant.cRelateNo',{
                      rules:  [{ required: true, message: '该项为必填项', trigger: 'blur' }]
                    })
                                  
                    insTabref.setValue("Insured.cStkMrk", '1');
                    insTabref.setFormItem('Insured.cRelateNo',{
                      rules:  [{ required: true, message: '该项为必填项', trigger: 'blur' }]
                    })
                                  
                ElMessage.error(undr.msg);
              }else{
                 ElMessage.error(undr.msg);
              }
              



            }
          } else {
            needCalc.value = true;
            ElMessage.error("保额或保费发生变化,请重新进行保费计算!");
          }
        }
      } catch (err) {
        console.log("保费计算失败!" + err);
      } finally {
        btn.loading = false;
        calBtn.loading = false;
      }
    });
  }
};

/**
 * 额度明细弹窗
 */
const openLimit = () => {
  //获取投保人信息
  let operAppDatas = opertaor.getDataAll()["applicant"];
  //缴费明细非空逻辑校验
  if (
    operAppDatas["Applicant.cAppNme"] == null ||
    operAppDatas["Applicant.cAppNme"] === ""
  ) {
    ElMessage.error("投保人信息客户名称不能为空！");
    return;
  }
  if (
    operAppDatas["Applicant.cClntMrk"] == null ||
    operAppDatas["Applicant.cClntMrk"] === ""
  ) {
    ElMessage.error("投保人信息投保人性质不能为空！");
    return;
  }
  if (
    operAppDatas["Applicant.cCertfCde"] == null ||
    operAppDatas["Applicant.cCertfCde"] === ""
  ) {
    ElMessage.error("投保人信息证件号码不能为空！");
    return;
  }
  if (
    operAppDatas["Applicant.cRelateNo"] == null ||
    operAppDatas["Applicant.cRelateNo"] === ""
  ) {
    ElMessage.error("投保人信息关联交易审批单编号不能为空！");
    return;
  }
  //额度明细功能参数
  const limitParam = {
    CRelateNo: operAppDatas["Applicant.cRelateNo"], //关联交易审批单编号
    CClntMrk: operAppDatas["Applicant.cClntMrk"], //投保人性质
    CAppNme: operAppDatas["Applicant.cAppNme"], //客户名称
    CCertfCde: operAppDatas["Applicant.cCertfCde"], //身份证号
  };
  dzmodal
    .open(limitDetails, { type: "Issuer", data: limitParam })
    .then((res: any) => {
      if (res.type === "ok") {
      }
    });
};
/**
 * 投保单保存
 * **/
const savePlyInfo = async () => {
  let saveFlag = false;
  const btn = getBtn("btn010102");
  btn.loading = true;
  const res = opertaor.getDataAll();
  if(res['ci'] && res['ci'].length>0){
    res['ci'].forEach((item:any)=>{
      if(item['Ci.nCiShare']){
        item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])/100;
      }
    })
  }


  console.log('保费====',res)
  let payList = res.payinfo;
  // Base.nPrm
  // payinfo
  if(payList && payList.length>0){
      let numS =0;
        payList.forEach((item) => {
              numS+= item['Pay.nPayablePrm']
          });
      let formattedSum = Number(numS.toFixed(2));
      if(formattedSum>res['base']['Base.nPrm']){
        ElMessage.error('缴费计划“应收保费”之和大于整单保费！')
         btn.loading = false;
        return false;
      }
  }

  res["user"] = user;
  res["plyBase"]["Base.cDptCde"] = props.param.cDptCde;
  res["plyBase"]["Base.cProdNo"] = props.param.cProdNo;

  if(props.param?.pageType === "copy" && saveDistBatchFlag.value) {
    const cAppNo = res["plyBase"]["Base.cAppNo"];
    res["applicant"]["Applicant.cAppNo"] = cAppNo;
    res["insured"]["Insured.cAppNo"] = cAppNo;
    delete res["insured"]["Insured.cPkId"];
    res["cvrg"] = res["cvrg"].map((item:any) => {
      delete item["Term.cPkId"];
      return {
        ...item,
        'Term.cAppNo': cAppNo,
        'Term.riskList': item['Term.riskList'].map((risk:any) => {
          delete risk['TermRisktgt.cPkId'];
          return {
            ...risk,
            'TermRisktgt.cAppNo': cAppNo,
          };
        }),
      }
    });
  }

  console.log("保存参数-----1", res);
  if (res["cvrg"].length == 0) {
    ElMessage.error("请录入条款信息");
    btn.loading = false;
    return false;
  }

  const resInfo: any = props.param?.pageName === "priceInquiry" ? await saveInquiry(res) : await saveAppPlyInfo(res);
  console.log("saveAppPlyInfo-res", resInfo);
  btn.loading = false;
  if (resInfo["code"] == "200") {
    const ops: any = opertaor.convertData(resInfo);
    console.log("转换的数据", ops);
    ElMessage.success(resInfo.msg);
    const base = ops["base"];
    const plyBase = ops["plyBase"];
    const applicant = ops["applicant"];
    const insured = ops["insured"];
    if (base) {
      const baseRef = opertaor.getTableRefByKey("base");
      baseRef.setFormValue(base);
    }
    if (plyBase) {
      const plyBaseRef = opertaor.getTableRefByKey("plyBase");
      plyBaseRef.setFormValue(plyBase);
    }
    if (applicant) {
      const applicantRef = opertaor.getTableRefByKey("applicant");
      applicantRef.setFormValue(applicant);
    }
    if (insured) {
      const insuredRef = opertaor.getTableRefByKey("insured");
      insuredRef.setFormValue(insured);
    }



    saveFlag = true;
    if((props.param?.pageType === "copy" || props.param?.pageType === "template" || props.param?.pageType === "inquiryToApp") && saveDistBatchFlag.value) {
      // 保存清单
      const appNo = plyBase["Base.cAppNo"];
      saveDist(appNo);
    }

    // 保存后替换路由参数
    // router.replace({path: route.path, name: route.name, query: {
    //     param: JSON.stringify({
    //     ... route.params.param,
    //     ... {
    //       cAppNo: plyBase["Base.cAppNo"]
    //     }
    //   })
    // }});
  } else {
    ElMessage.error(resInfo.msg);
  }

  return saveFlag;
};
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
      opertaor.setUnDisabledByKeyList(edrList); // 根据list集合,放开需要的要素
      ElMessage.success(res.msg);
    } else {
      ElMessage.error(res.msg);
    }
  });
};
/**
 * 原保单查看
 * **/
const getPlyPolicyFun = () => {
  const param = {
    scene: "EDR_APP_NEW_SCENE",
    CPlyNo: opertaor.getTableRefByKey("plyBase").getValue("Base.cPlyNo"),
  };
  getAppPolicy(param).then((res: any) => {
    console.log("投保单明细", res);
    if (res["code"] == "200") {
      const en = JSON.stringify({
        cAppNo: res["res"]["composition"]["plyBase"][0]["Base.cAppNo"],
        cAppTyp: res["res"]["composition"]["plyBase"][0]["Base.cAppTyp"],
        cCiMrk: res["res"]["composition"]["plyBase"][0]["Base.cCiMrk"],
        cProdNo: res["res"]["composition"]["plyBase"][0]["Base.cProdNo"],
        cGrpMrk: res["res"]["composition"]["plyBase"][0]["Base.cGrpMrk"],
        cDptCde: res["res"]["composition"]["plyBase"][0]["Base.cDptCde"],
        pageType: "readonly",
        showBtn: false,
      });
      const query = new URLSearchParams({ param: en });
      const url =
        window.location.origin + "/#/pcis/my-page?" + query.toString();
      window.open(url, "_blank");
    }
  });
};
/**
 *批改单保费计算
 ***/
const calcPremiumEdr = () => {
    const res = opertaor.getDataAll();
    const dataAll = opertaor.getDataAll();
    const edrbaseData = edrbase.value?.getFromValue();
  console.log('保费计算',props.param)
  console.log('保费计算2',res)
  
 
  // 条款
  // const totalNum =  res['cvrg'].reduce((sum, item) => sum + (item['Term.nInsuranceAmount'] || 0), 0);
  const nInsuranceAmount:any = [];
  res['cvrg'].forEach((item:any) => {
    if(item['Term.cRdrTyp'] === '0') {// 主险 riskList不为空则取riskList里的nInsuranceAmount累加，否则取Term.nInsuranceAmount或Term.nAccidentLimit
      // 02系列产品 ? 从责任列表取nInsuranceAmount累加 : 只取条款里的nInsuranceAmount值
      if(props.param.cProdNo.slice(0,2) === "02") {
        if(item['Term.riskList'] && item['Term.riskList'].length > 0) {
          let num = 0;
          item['Term.riskList'].forEach((i:any) => {
            // nInsuranceAmount.push(i['TermRisktgt.nInsuranceAmount'] || 0)
            // 是否条款自带条则，0：否，1：是
            if(i['TermRisktgt.selfTermRisk'] === true) {
              num = num + (i['TermRisktgt.nInsuranceAmount'] || 0)
            }
          })
          if(num > 0) {
            nInsuranceAmount.push(num)
          } else {
            nInsuranceAmount.push(item['Term.nInsuranceAmount'] || item['Term.nAccidentLimit'] || 0)
          }
        } else {
          nInsuranceAmount.push(item['Term.nInsuranceAmount'] || item['Term.nAccidentLimit'] || 0)
        }
      } else {
        nInsuranceAmount.push(item['Term.nInsuranceAmount'] || item['Term.nAccidentLimit'] || 0)
      }
    } else if(item['Term.cClaimInclude'] === "1") {// 非主险 是否计入累计赔偿限额值为是则计入否则不计入
      nInsuranceAmount.push(item['Term.nInsuranceAmount'] || 0)
    }
  })
  const totalNum = nInsuranceAmount.reduce((sum, item) => sum + item, 0);
  let originalnAmt = 0;
  if(edrbaseData['EdrBase.nBefEdrAmt'] && typeof edrbaseData['EdrBase.nBefEdrAmt'] === 'number') {
    originalnAmt = edrbaseData['EdrBase.nBefEdrAmt']
  }
  if(edrbaseData['EdrBase.nBefEdrAmt'] && typeof edrbaseData['EdrBase.nBefEdrAmt'] === 'string') {
    originalnAmt = Number(edrbaseData['EdrBase.nBefEdrAmt'].replaceAll(',',''))
  }

  console.log('1212 ',originalnAmt ,totalNum)
  //  08 减少  
  if(props.param?.cRsnCde === '08'  && totalNum > originalnAmt ){
    ElMessage.warning("批改原因为“减少保额”，累计赔偿限额不能大于原有“保额”！");
    // 增加保额，
    return false;
  }
  //  07增加 
  if(props.param?.cRsnCde === '07'  && totalNum < originalnAmt ){
       ElMessage.warning("批改原因为“增加保额”，累计赔偿限额不能小于原有“保额”！");
    return false;
  }
 
  const btn = getBtn("btnCalEdr");
  btn.loading = true;

  res["user"] = user;
  res["plyBase"]["Base.cDptCde"] = props.param.cDptCde;
  res["plyBase"]["Base.cProdNo"] = props.param.cProdNo;
  res["EdrBase"] = edrbase.value?.getFromValue();
  if (
    res["EdrBase"]["EdrBase.cEdrRsnDetail"] != null &&
    res["EdrBase"]["EdrBase.cEdrRsnDetail"] != "" &&
    Array.isArray(res["EdrBase"]["EdrBase.cEdrRsnDetail"])
  ) {
    res["EdrBase"]["EdrBase.cEdrRsnDetail"] =
      res["EdrBase"]["EdrBase.cEdrRsnDetail"].join();
  }
  if(res['ci'] && res['ci'].length>0){
    res['ci'].forEach((item:any)=>{
      if(item['Ci.nCiShare']){
        item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])/100;
      }
    })
  }

  calcEdr(res).then((res) => {
    btn.loading = false;
    console.log("批改计算", res);
    if (res["code"] == "200") {
      const ops = opertaor.convertData(res);
      console.log("保费计算转换的数据", ops);
      ElMessage.success(
        res.msg +
          "保费为：" +
          ops["base"]["Base.nPrm"] +
          "; 保费变化量为：" +
          ops["plyBase"]["Base.nPrmVar"]
      );
      if(ops['ci'] && ops['ci'].length>0){
        ops['ci'].forEach((item:any)=>{
          if(item['Ci.nCiShare']){
            item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])*100;
          }
        })
      }
      opertaor.setDataAll(ops);
      nAmt.value = ops["base"]["Base.nAmt"] ? ops["base"]["Base.nAmt"]  : 0;
      nPrm.value = ops["base"]["Base.nPrm"] ? ops["base"]["Base.nPrm"] : 0;
      const EdrBaseData = res["res"]["composition"]["EdrBase"][0];
      res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"] =
        res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"]?.split(
          ","
        );
      edrbase.value?.setFormValue(EdrBaseData);
      const nPrmVar = ops["plyBase"]["Base.nPrmVar"]  || 0;

    
      const payinfoRef = opertaor.getTableRefs()["payinfo"];

      // 保费变化率 批改时 原始数据为0  （批改申请核保时用）
      payinfoRef.getFromValue().forEach((item:any)=>{
            item['Pay.nPrmVar'] = 0;
      })

      if (payinfoRef && payinfoRef.setFormValue) {
        let currentPayList = [...payinfoRef.getFromValue()]; // 获取当前列表
        //  缴费期数   + 批改次数

        // Base.nPayNumber
        let infoLength = dataAll['base']['Base.nPayNumber']+res['res']['composition']["EdrBase"][0]['EdrBase.nEdrPrjNo'];
                console.log('条数',infoLength ,currentPayList.length)
    
        if(currentPayList.length >=infoLength){
          currentPayList.pop();
        }
        // 处理 批改是保存多条问题 （需要再次修改 不成熟的改法）
        // currentPayList = currentPayList.filter(item => {
        //   return item['Pay.cAppNo'] && item.hasOwnProperty('Pay.cAppNo');
        // });
       
                let payInfo = setPayInfoEdr(
                ops["payinfo"],
                ops["base"],
                ops["applicant"],
                nPrmVar,
                ops["plyBase"],
                currentPayList.length+1
              );
               console.log(3034,payInfo)
            console.log('data--' ,currentPayList)
            console.log('data2--' ,payInfo)
            currentPayList.push(payInfo); // 插入新条目
            payinfoRef.setFormValue(currentPayList); // 更新表单数据
          }
      needCalc.value = false;
    } else {
      ElMessage.error(res.msg);
    }
    // ElMessage.success(res.msg);
    // history.back();
  });
};

// 获取我司比例
const getOwnShare =()=>{
   let ownShare = 0;
   const data = opertaor.getDataAll();
   let ciArr = data['ci']
  //  const cCiMrk = data.plyBase?.['Base.cCiMrk'];
  if(ciArr && ciArr.length>0){
    ciArr.forEach((item:any)=>{
      const CDptMrk = item['Ci.cCoinsurerCde']
      if(!!CDptMrk && CDptMrk ==="327001"){
        ownShare = numAdd(ownShare,item['Ci.nCiShare'])
      } 
   })
  }
  return ownShare;
}

const setPayInfoEdr = (payList, base, applicant, nPrmVar, plyBase,nTms) => {
  // const payListNew = [];
  const payListNew = [...payList];
  const data = opertaor.getDataAll();
  const cCiMrk = data.plyBase?.['Base.cCiMrk'];
  const nCiOwnPrm = ['1', '2', '3','4'].includes(cCiMrk)
  let nCiShare= 100;
  // console.log('nCiOwnPrm ',nCiOwnPrm,data)
  // console.log('nCiOwnPrm ',data.ci)
  // debugger 
  if(nCiOwnPrm){
       nCiShare = Number(getOwnShare()) || 100 ;
  }
  const pay = {};
  if (applicant) {
    pay["Pay.cPayorCde"] = applicant["Applicant.cAppCde"];
    pay["Pay.cPayorNme"] = applicant["Applicant.cAppNme"];
  } else {
    pay["Pay.cPayorCde"] = "";
    pay["Pay.cPayorNme"] = "";
  }
  pay["Pay.nPayablePrm"] = nPrmVar >0? nPrmVar : 0;
  pay["Pay.tPayBgnTm"] = plyBase["Base.tEdrAppTm"];
  pay["Pay.tPayEndTm"] = plyBase["Base.tEdrBgnTm"];



  pay["Pay.nOwnPrm"] = nPrmVar >0?  parseFloat((nPrmVar * (nCiShare/100)).toFixed(8))  : 0;
// debugger


  pay["Pay.cProdNo"] = base["Base.cProdNo"];
  pay["Pay.nPrmVar"] = nPrmVar >0? nPrmVar : 0;
  // for (const i in payList) {
  //   if (!!payList[i]["Pay.cPkId"]) {
  //     payListNew.push(payList[i]);
  //   }
  // }
  pay["Pay.nTms"] = nTms ||plyBase.length+1 ;
  // payListNew.push(pay);
  // return payListNew;
  return pay;
};
/**
 * 批改:注销退保保费计算
 */
const calcPremiumEdrSurrender = () => {
  const btn = getBtn("btn010101");
  btn.loading = true;
  const res = opertaor.getDataAll();
  res["user"] = user;
  res["EdrBase"] = edrbase.value?.getFromValue();
  if (
    res["EdrBase"]["EdrBase.cEdrRsnDetail"] != null &&
    res["EdrBase"]["EdrBase.cEdrRsnDetail"] != "" &&
    Array.isArray(res["EdrBase"]["EdrBase.cEdrRsnDetail"])
  ) {
    res["EdrBase"]["EdrBase.cEdrRsnDetail"] =
      res["EdrBase"]["EdrBase.cEdrRsnDetail"].join();
  }
  if(res['ci'] && res['ci'].length>0){
    res['ci'].forEach((item:any)=>{
      if(item['Ci.nCiShare']){
        item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])/100;
      }
    })
  }
  console.log(res);
  calcSurrenEdr(res).then((res: any) => {
    btn.loading = false;
    console.log("批改计算", res);
    if (res["code"] == "200") {
      ElMessage.success(
        res.msg +
          "保费为：" +
          res["res"]["composition"]["plyBase"][0]["Base.nPrm"] +
          "; 保费变化量为：" +
          res["res"]["composition"]["plyBase"][0]["Base.nPrmVar"]
      );
      nAmt.value = res["res"]["composition"]["EdrBase"][0]["EdrBase.nAmt"]
        ? res["res"]["composition"]["EdrBase"][0]["EdrBase.nAmt"]
        : 0;
      nPrm.value = res["res"]["composition"]["EdrBase"][0]["EdrBase.nPrm"]
        ? res["res"]["composition"]["EdrBase"][0]["EdrBase.nPrm"]
        : 0;
      const ops = opertaor.convertData(res);
      if(ops['ci'] && ops['ci'].length>0){
        ops['ci'].forEach((item:any)=>{
          if(item['Ci.nCiShare']){
            item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])*100;
          }
        })
      }
      opertaor.setDataAll(ops);
      if (res["res"]["composition"]["EdrBase"]) {
        const EdrBaseData = res["res"]["composition"]["EdrBase"][0];
        if (
          res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"] !=
            "" &&
          res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"] !=
            null
        ) {
          res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"] =
            res["res"]["composition"]["EdrBase"][0][
              "EdrBase.cEdrRsnDetail"
            ].split(",");
        }
        edrbase.value?.setFormValue(EdrBaseData);
      }
      needCalc.value = false;
    } else {
      ElMessage.error(res.msg);
    }
    // ElMessage.success(res.msg);
    // history.back();
  });
};
/**
 * 退保保存
 * **/
const saveApplicationEdr = () => {
  const btn = getBtn("btn010102");
  btn.loading = true;
  const res = {};
  res["user"] = user;
  res["appNo"] = edrbase.value?.getFromValue()["EdrBase.cAppNo"]
    ? edrbase.value?.getFromValue()["EdrBase.cAppNo"]
    : null;
  res["plyNo"] = edrbase.value?.getFromValue()["EdrBase.cPlyNo"];
  res["taskId"] = props.param.taskId ? props.param.taskId : null;
  // res["data"] = {};
  res["data"] = opertaor.getDataAll();
  res["data"]["EdrBase"] = edrbase.value?.getFromValue();
  res["data"]["EdrBase"]["EdrBase.cEdrRsnDetail"] =
    res["data"]["EdrBase"]["EdrBase.cEdrRsnDetail"].join();
  console.log(res);
  saveSurrenEdr(res).then((res) => {
    btn.loading = false;
    console.log("退保保存", res);
    if (res["code"] == "200") {
      const ops = opertaor.convertData(res);
      if(ops['ci'] && ops['ci'].length>0){
        ops['ci'].forEach((item:any)=>{
          if(item['Ci.nCiShare']){
            item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])*100;
          }
        })
      }
      opertaor.setDataAll(ops);
      if (res["res"]["composition"]["EdrBase"]) {
        const EdrBaseData = res["res"]["composition"]["EdrBase"][0];
        res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"] =
          res["res"]["composition"]["EdrBase"][0][
            "EdrBase.cEdrRsnDetail"
          ].split(",");
        edrbase.value?.setFormValue(EdrBaseData);
      }
      ElMessage.success(res.msg);
    } else {
      ElMessage.error(res.msg);
    }
    // ElMessage.success(res.msg);
    // history.back();
  });
};

/**
 * 退保生成批文
 * **/
const getSurrenderPrecisFun = () => {
  const btn = getBtn("btnCompare");
  btn.loading = true;
  const res = opertaor.getDataAll();
  res["user"] = user;
  res["EdrBase"] = edrbase.value?.getFromValue();
  console.log(res);
  getSurrenderPrecis(res).then((res) => {
    btn.loading = false;
    if (res["code"] == "200") {
      const cEdrCtnt = res["data"]["data"]["cEdrCtnt"]; //批文
      edrbase.value?.setValue("EdrBase.cEdrCtnt", cEdrCtnt);
      ElMessage.success(res.msg);
    } else {
      ElMessage.error(res.msg);
    }
  });
};

/**
 * 批改单申请核保(退保、注销)
 */
const submitEdrToUndrSurrender = async () => {
    const isAcctValid = await validateAcctinfo();
    // 账户信息校验
  if (!isAcctValid) {
    return; 
  }
  if (needCalc.value) {
    ElMessage.error("请先进行保费计算!");
    return;
  }
  // 调用再保险位接口
  // const s = await saveDataInfo()
  // if(!s) return;
  const btn = getBtn("btn010103");
  btn.loading = true;
  const res = {};
  res["user"] = user;
  res["appNo"] = edrbase.value?.getFromValue()["EdrBase.cAppNo"]
    ? edrbase.value?.getFromValue()["EdrBase.cAppNo"]
    : null;
  res["plyNo"] = edrbase.value?.getFromValue()["EdrBase.cPlyNo"];
  res["taskId"] = props.param.taskId ? props.param.taskId : null;
  res["data"] = opertaor.getDataAll();
  res["data"]["EdrBase"] = edrbase.value?.getFromValue();
  console.log(res);

  
  submitEdrSurrender(res).then((res) => {
    btn.loading = false;
    console.log("申请核保(退保、注销)", res);
    if (res["code"] == "200") {
      ElMessage.success(res.msg);
    } else {
      ElMessage.error(res.msg);
    }
    // ElMessage.success(res.msg);
    // history.back();
  });
};
/**
 * 批改单保存
 * **/
const saveEdrPlyInfo = async () => {
  let saveEdrFlag = false;
  const btn = getBtn("saveEdr");
  btn.loading = true;
  const res = opertaor.getDataAll();
  const dataALl = opertaor.getDataAll();
  res["user"] = user;
  res["plyBase"]["Base.cDptCde"] = props.param.cDptCde;
  res["plyBase"]["Base.cProdNo"] = props.param.cProdNo;
  res["EdrBase"] = edrbase.value?.getFromValue();
  if (
    res["EdrBase"]["EdrBase.cEdrRsnDetail"] != null &&
    res["EdrBase"]["EdrBase.cEdrRsnDetail"] != "" &&
    Array.isArray(res["EdrBase"]["EdrBase.cEdrRsnDetail"])
  ) {
    res["EdrBase"]["EdrBase.cEdrRsnDetail"] =
      res["EdrBase"]["EdrBase.cEdrRsnDetail"].join();
  }
  if(res['ci'] && res['ci'].length>0){
    res['ci'].forEach((item:any)=>{
      if(item['Ci.nCiShare']){
        item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])/100;
      }
    })
  }
  const edrInfo: any = await saveEdrAppPlyInfo(res)
  btn.loading = false;
  if(edrInfo["code"] == "200") {
    const ops = opertaor.convertData(edrInfo);
    console.log("转换的数据", ops);
    ElMessage.success(edrInfo.msg);
    if(ops['ci'] && ops['ci'].length>0){
      ops['ci'].forEach((item:any)=>{
        if(item['Ci.nCiShare']){
          item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])*100;
        }
      })
    }
    opertaor.setDataAll(ops);
    const EdrBaseData = edrInfo["res"]["composition"]["EdrBase"][0];
    // res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"] =
    //   res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"].split(
    //     ","
    //   );    //影响二次批改报错,先注释掉待调整
    edrbase.value?.setFormValue(EdrBaseData);
    saveEdrFlag = true;
    if(props.param.pageType === "EDR_APP_NEW_SCENE" && saveDistBatchFlag.value) {
      // 复制保单清单信息到批单中
      saveDist(EdrBaseData['EdrBase.cAppNo'], props.param?.cRsnCde)
    }
  } else {
    ElMessage.error(edrInfo.msg);
  }

  return saveEdrFlag;
};
/**
 * 生成批文
 * **/
const generateEndorse = async () => {
  const res = opertaor.getDataAll();
  const isAcctValid = await validateAcctinfo();
  // 账户信息校验
  if (!isAcctValid) {
    return; 
  }
  const btn = getBtn("btnCompare");
  btn.loading = true;
  res["user"] = user;
  res["plyBase"]["Base.cDptCde"] = props.param.cDptCde;
  res["plyBase"]["Base.cProdNo"] = props.param.cProdNo;
  res["EdrBase"] = edrbase.value?.getFromValue();
  if(res['ci'] && res['ci'].length>0){
    res['ci'].forEach((item:any)=>{
      if(item['Ci.nCiShare']){
        item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])/100;
      }
    })
  }
  console.log(res);
  getEndorseChange(res).then((res) => {
    btn.loading = false;
    if (res["code"] == "200") {
      const cEdrCtnt = res["data"]["data"]["cEdrCtnt"]; //批文
      const edrRsn = res["data"]["data"]["edrRsn"]; //批文
      cacheKey.value = res["data"]["data"]["cacheKey"];
      edrbase.value?.setValue("EdrBase.cEdrCtnt", cEdrCtnt);
      edrbase.value?.setValue("EdrBase.cacheKey", cacheKey.value);
      edrbase.value?.setValue("EdrBase.cEdrRsnDetail", edrRsn);
      edritem.value?.handleQuery();
      ElMessage.success(res.msg);
    } else {
      ElMessage.error(res.msg);
    }
  });
};

    /**
     * 验证账户信息表单
     */
  const validateAcctinfo = async () => {  
      let prmVar =  opertaor.getDataAll()['plyBase']['Base.nPrmVar']
      let refundInsurance  = ['s1','s2'].includes(props.param?.cRsnCde);  // 一般退保 全额退保也要验证
        // 保费变化量 < 0 说明批改之后保费减少, 此时需要设置账户信息
        if ((!!prmVar && prmVar < 0 ) || refundInsurance ) {
            const acctinfoRef =opertaor.getTableRefs()["acctinfo"];
             let acctinfoValidate =await opertaor.getTableRefByKey('acctinfo')?.validate()  // 账户信息 必填校验
              let isAcctinfo = isDetailCde(); // 是否有账户信息
                if(!acctinfoValidate && isAcctinfo) {
                  ElMessage.warning("请填写账户信息中的必填项")
                  return false;
                }
            // 收款人账号
            const CAcctNo = acctinfoRef.getValue('Acctinfo.cAcctNo')
            if (!!CAcctNo) {
            } else {
                ElMessage.error("收款人账号不能为空!");
                return false; 
            }

            // 收款人户名
            const CAcctNme = acctinfoRef.getValue('Acctinfo.cAcctNme')
            if (!!CAcctNme) {
            } else {
                ElMessage.error("收款人户名不能为空!");
                return false;
            }

            // 收款银行大类
            const CBankRelTyp = acctinfoRef.getValue('Acctinfo.cBankRelTyp')
            if (!!CBankRelTyp) {
            } else {
                ElMessage.error("收款银行大类不能为空!");
                return false;
            }
        }
        return true;
    }

/**
 * 批单申请核保
 */
const submitEdrToUndrFun = async () => {

  const isAcctValid = await validateAcctinfo();
    // 账户信息校验
  if (!isAcctValid) {
    return; 
  }
  if (needCalc.value) {
    ElMessage.error("请先进行保费计算!");
    return;
  }
  if (!baseValite()) {
    // btn.loading = false;
    return;
  }
  const edrBaseValidate = await edrbase.value?.validate();
  if(!edrBaseValidate) {
    ElMessage.warning("请填写批改信息中的必填项")
    return
  }
  // const rv = await opertaor.validateAll();
  // if (!rv) {
  //   return;
  // }
  // 账户信息校验
  //  let acctinfoValidate =await opertaor.getTableRefByKey('acctinfo')?.validate()  // 账户信息 必填校验
  //  let isAcctinfo = isDetailCde(); // 是否有账户信息
  //   if(!acctinfoValidate && isAcctinfo) {
  //     ElMessage.warning("请填写账户信息中的必填项")
  //     return
  //   }

  if (!checkNAmt()) return;
  const f = await saveEdrPlyInfo(); // 提交核保,需要默认执行一次保存操作
  if (f) {
    // const s = await saveDataInfo()
    // if(!s) return;
    const btn = getBtn("btnSubmitEdr");
    btn.loading = true;
    const res = {};
    const base = opertaor.getTableRefByKey("plyBase").getFromValue();
    res["user"] = user;
    res["appNo"] = base["Base.cAppNo"];
    res["plyNo"] = base["Base.cPlyNo"];
    res["taskId"] = props.param.taskId ? props.param.taskId : null;
    console.log(res);
    //进行一次保费计算,如果发生保费变化,则告知需要进行保费计算
    const calBtn = getBtn("btnCalEdr");
    calBtn.loading = true;
    setTimeout(async () => {
      try {
        const calcData = opertaor.getDataAll();
        const edrbaseData = edrbase.value?.getFromValue();
        // const totalNum =  calcData['cvrg'].reduce((sum, item) => sum + (item['Term.nInsuranceAmount'] || 0), 0);
        const nInsuranceAmount:any = [];
        calcData['cvrg'].forEach((item:any) => {
          if(item['Term.cRdrTyp'] === '0') {// 主险 riskList不为空则取riskList里的nInsuranceAmount累加，否则取Term.nInsuranceAmount
            // 02系列产品 ? 从责任列表取nInsuranceAmount累加 : 只取条款里的nInsuranceAmount值
            if(props.param.cProdNo.slice(0,2) === "02") {
              if(item['Term.riskList'] && item['Term.riskList'].length > 0) {
                let num = 0;
                item['Term.riskList'].forEach((i:any) => {
                  // nInsuranceAmount.push(i['TermRisktgt.nInsuranceAmount'] || 0)
                  // 是否条款自带条则，0：否，1：是
                  if(i['TermRisktgt.selfTermRisk'] === true) {
                    num = num + (i['TermRisktgt.nInsuranceAmount'] || 0)
                  }
                })
                if(num > 0) {
                  nInsuranceAmount.push(num)
                } else {
                  nInsuranceAmount.push(item['Term.nInsuranceAmount'] || item['Term.nAccidentLimit'] || 0)
                }
              } else {
                nInsuranceAmount.push(item['Term.nInsuranceAmount'] || item['Term.nAccidentLimit'] || 0)
              }
            } else {
              nInsuranceAmount.push(item['Term.nInsuranceAmount'] || item['Term.nAccidentLimit'] || 0)
            }
          } else if(item['Term.cClaimInclude'] === "1") {// 非主险 是否计入累计赔偿限额值为是则计入否则不计入
            nInsuranceAmount.push(item['Term.nInsuranceAmount'] || 0)
          }
        })
        const totalNum = nInsuranceAmount.reduce((sum, item) => sum + item, 0);
        let originalnAmt = 0;
        if(edrbaseData['EdrBase.nBefEdrAmt'] && typeof edrbaseData['EdrBase.nBefEdrAmt'] === 'number') {
          originalnAmt = edrbaseData['EdrBase.nBefEdrAmt']
        }
        if(edrbaseData['EdrBase.nBefEdrAmt'] && typeof edrbaseData['EdrBase.nBefEdrAmt'] === 'string') {
          originalnAmt = Number(edrbaseData['EdrBase.nBefEdrAmt'].replaceAll(',',''))
        }
        //  08 减少  
        if(props.param?.cRsnCde === '08'  && totalNum > originalnAmt ){
          ElMessage.warning("批改原因为“减少保额”，累计赔偿限额不能大于原有“保额”！");
          // 增加保额，
          return false;
        }
        //  07增加 
        if(props.param?.cRsnCde === '07'  && totalNum < originalnAmt ){
            ElMessage.warning("批改原因为“增加保额”，累计赔偿限额不能小于原有“保额”！");
          return false;
        }
        calcData["user"] = user;
        calcData["plyBase"]["Base.cDptCde"] = props.param?.cDptCde;
        calcData["plyBase"]["Base.cProdNo"] = props.param?.cProdNo;
        calcData["EdrBase"] = edrbase.value?.getFromValue();
        if (
          calcData["EdrBase"]["EdrBase.cEdrRsnDetail"] != null &&
          calcData["EdrBase"]["EdrBase.cEdrRsnDetail"] != "" &&
          Array.isArray(calcData["EdrBase"]["EdrBase.cEdrRsnDetail"])
        ) {
          calcData["EdrBase"]["EdrBase.cEdrRsnDetail"] =
            calcData["EdrBase"]["EdrBase.cEdrRsnDetail"].join();
        }
        if(calcData['ci'] && calcData['ci'].length>0){
          calcData['ci'].forEach((item:any)=>{
            if(item['Ci.nCiShare']){
              item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])/100;
            }
          })
        }
        const calcres: any = await calcEdr(calcData)
        if (calcres.code == "200") {
          const newOp: any = opertaor.convertData(calcres);
          const newPrm = newOp.base["Base.nPrm"];
          const oldPrm = calcData.base["Base.nPrm"];
          if (newPrm === oldPrm) {
            submitEdrToUndr(res).then((result) => {
              btn.loading = false;
              console.log("批改申请核保", result);
              // ElMessage.success(res.msg);
              // history.back();
              if (result["code"] == "200") {
                ElMessage.success(result.msg);
                btn.disabled = true;
                if(result['cDecision'] === '1' || result['cDecision'] === '2'){
                  tagsViewStore.delView({"name": "my-page",
                    "title": "申请单录入",
                    "path": "/pcis/my-page",
                    "fullPath": "/pcis/my-page"}).then((res: any) => {
                    router.replace({ path: "/dashboard" });
                  });
                }
              } else {
                ElMessage.error(result.msg);
              }
            });
          } else {
            needCalc.value = true;
            ElMessage.error("保费发生变化,请重新进行保费计算!");
          }
        }
      } catch (err) {
        console.log("保费计算失败!" + err);
      } finally {
        btn.loading = false;
        calBtn.loading = false;
      }
    },500)
  }
};
/**
 * 核保信息 提交
 */
const submitUnderwritingFn = async () => {
  // const btn = getBtn("btnUdr");
  // btn.loading = true;
  const res = underwrite.value.getFromValue();
  res["user"] = user;
  res["user"]["opRelCde"] = user.opCde;
  res["appNo"] = props.param.cAppNo;
  res["taskId"] = props.param.taskId;
  res["appTyp"] = props.param.cAppTyp;
  res["undrMrk"] = res["cUndrMrk"];
  res["cAntiLnderRisk"] = "0"; //关联交易确认
  res["cIsTransaction"] = "0"; //反洗钱风险
  res["CRiBesprakMrk"] = "0"; // 预约分保标志
  const parts = res["cBckOp"].split("-");
  res["backUndrClsCde"] = parts[0]; // 退回指定核保级别编码
  res["backUndrDptCde"] = parts[1]; // 退回指定核保级别机构编码
  res["backUndrDptCnm"] = parts[3]; // 退回机构名称

  if(props.param?.pageName === "priceInquiry") {
    res["inquiryNo"] = props.param.cInquiryNo;
  }
  console.log(res);
  if(res.cUndrMrk === "A") {//核保选项为同意时
    const deductibleDist = opertaor.getTableRefByKey("deductibleDist")?.getTableData();
    const insured = opertaor.getTableRefByKey("insured")?.getFromValue();
    const applicant = opertaor.getTableRefByKey("applicant")?.getFromValue();
    const plyBase = opertaor.getTableRefByKey("plyBase")?.getFromValue();
    const insrnc = opertaor.getTableRefByKey("insrnc")?.getFromValue();
    const edrbase = opertaor.getTableRefByKey("edrbase")?.getFromValue();
    if(plyBase['Base.cRiFacMrk'] === '2' && plyBase['Base.cRiFacCde'] === '1') {//如果临分标识为2，cRiFacCde值为1时，需要调查询临分状态接口，返回值为0,1,6阻断，其他继续核保
      // 调用接口查询临分状态(0未报价 1未确认 2已确认 3账单已生成 4部分账单已传财务 5账单全部已传财务 6没有临分数据)
      const param = {
        cAppNo: props.param?.cAppNo,
        cAppTyp: props.param?.cAppTyp,
        cPlyNo: props.param?.plyNo,
        nEdrPrjNo: plyBase['Base.nEdrPrjNo']
      }
      const queryFacSts = props.param?.pageName === "priceInquiry" ? await policyService.queryFacStsXJ(param) : await policyService.queryFacSts(param);
      if(queryFacSts && queryFacSts.code && (queryFacSts.code === "0" || queryFacSts.code === "1" || queryFacSts.code === "6")) {
        ElMessage.error(queryFacSts.message);
        return
      }
    }
    const param = {
      cAppNo: props.param?.cAppNo,// 保批单申请单号
      cDductDesc: deductibleDist && deductibleDist[0] ? deductibleDist[0]["DeductibleDist.cDeductibleContent"] : "",// 免赔约定
      cDocTyp: props.param?.cAppTyp,// 单证类型 A 保单 E 批单
      cDptCde: props.param?.cDptCde,// 机构代码
      cInsrntNme: insured['Insured.cInsuredNme'],//被保人名称
      cPlyNo: props.param?.plyNo,// 保单号
      cProdNme: props.param?.cTermNme,// 产品名称
      cProdNo: props.param?.cProdNo,//产品代码
      cStockMrk: props.param?.cGrpMrk == "0" ? insured['Insured.cStkMrk'] : applicant['Applicant.cStkMrk'],// 股东业务标志(团单1取投保人标识，个单0取被保人标识)
      // nAmtChgRate: "1.00",// 保额币种汇率
      nEdrPrjNo: plyBase['Base.nEdrPrjNo'],// 批改序号
      // nPrmChgRate: "1.00",// 保费币种汇率
      tAppTm: insrnc['Base.tAppTm'],// 投保日期
      tEdrBgnTm: edrbase?['EdrBase.tEdrBgnTm']:'',// 批改生效起期
      // tEdrEndTm: "2025-05-07 13:57:37",// 批改生效止期
      tInsrncBgnTm: insrnc['Base.tInsrncBgnTm'],// 保险起期
      tInsrncEndTm: insrnc['Base.tInsrncEndTm'],// 保险止期
    }
    // 调用强制临分
    const queryRiFacMrk = props.param?.pageName === "priceInquiry" ? await policyService.queryRiFacMrkXJ(param) : await policyService.queryRiFacMrk(param);
    if(queryRiFacMrk && queryRiFacMrk.code === '0') {
      ElMessage.error(queryRiFacMrk.message);
      underwrite.value?.setRiskunitDisabled()
      return
    }
  } else if(res.cUndrMrk === "B") {// 核保选项为退回给出单员时，如果已经触发自主临分，则提示需要再保确认并阻断，其他则直接提交核保
    // 先查询临分标识
    const queryCRiFacMrk = props.param?.pageName === "priceInquiry" ? await policyService.queryCRiFacMrkXJ({cAppNo: props.param?.cAppNo}) : await policyService.queryCRiFacMrk({cAppNo: props.param?.cAppNo});
    if(queryCRiFacMrk && queryCRiFacMrk.code === '200') {
      const cRiFacMrk = queryCRiFacMrk.data.cRiFacMrk;
      if(cRiFacMrk === '1' || cRiFacMrk === '2') {// 自主临分或强制临分
        // 自主临分
        ElMessage.warning("该申请单已进入再保流程，核保意见不允许选择‘退回’，如需退回，请线下联系再保部告知投保单号");
        return;
      }
    } else {
      ElMessage.error(queryCRiFacMrk.message);
      return;
    }
  }
  let submitUnder;
  // 询价单
  if (props.param?.pageName === "priceInquiry") {
    submitUnder = submitUnderwrite(res);
  } else if (props.param?.cAppTyp === "A") {
    submitUnder = submitUnderwriting(res);
  } else if (props.param?.cAppTyp === "E") submitUnder = submitUnderwritingEdr(res);

  submitUnder?.then((res:any) => {
    console.log("submitUnderwriting-res", res);
    // btn.loading = false;
    if (res["code"] == "200") {
      // const ops = opertaor.convertData(res);
      // console.log("转换的数据", ops);
      ElMessage.success(res.msg);
      // btn.disabled = true;
      if(res['cDecision'] === '1' || res['cDecision'] === '2'){
        tagsViewStore.delView({"name": "my-page",
          "title": "申请单录入",
          "path": "/pcis/my-page",
          "fullPath": "/pcis/my-page"}).then((res: any) => {
          router.replace({ path: "/dashboard" });
        });
      }
      // opertaor.setDataAll(ops);
      underwrite.value?.setRiskunitDisabled()
    } else {
      ElMessage.error(res.msg);
    }
    // ElMessage.success(res.msg);
    // history.back();
  });
};
/**
 * 投保申请核保时校验联共保信息
 */
const validateCiInfo = () => {
  const ciData = opertaor.getTableRefByKey("ci").getFromValue();
  const plyBaseData = opertaor.getTableRefByKey("plyBase").getFromValue();
  const cCiMrk = plyBaseData["Base.cCiMrk"];

  // 检查是否有共保信息
  if (!ciData || ciData.length === 0) {
    ElMessage.error("请录入共保信息!");
    return false;
  }
  // 统计永安保险公司的数量
  const yonganCount = ciData.filter(item => item['Ci.cCoinsurerCde'] === '327001').length;
  // 新增校验：统计非永安保险公司的数量
  const nonYonganCompanies = ciData.filter(item => item['Ci.cCoinsurerCde'] !== '327001')
    .map(item => item['Ci.cCoinsurerCde']);
  // 检查是否有重复的非永安共保公司代码
  const uniqueNonYongan = [...new Set(nonYonganCompanies)];
  if (nonYonganCompanies.length !== uniqueNonYongan.length) {
    ElMessage.error("不能添加两条共保公司相同的非永安数据！");
    return false;
  }
  // 验证主共主联场景（cCiMrk为1）
  if (cCiMrk === "1") {
    // 检查是否所有共保公司都是永安（不允许全部为永安）
    const allYongan = ciData.every(item => item['Ci.cCoinsurerCde'] === '327001');
    if (allYongan) {
      ElMessage.error("主共主联共保时，至少要有一条非永安的共保公司！");
      return false;
    }
    // 检查永安分公司数量（必须录入两个以上）
    // if (yonganCount <= 1) {
    //   ElMessage.error("联共保时必须录入永安两个以上分公司份额！");
    //   return false;
    // }
  } 
  // 验证其他场景
  else if (cCiMrk == "1" && yonganCount <= 1) {
    ElMessage.error("联共保时必须录入永安两个以上分公司份额！");
    return false;
  }

  // 验证主/从共保信息完整性
  let chiefMrkM = 0; // 主共保数量
  let chiefMrkS = 0; // 从共保数量
  let NCiShare = 0;  // 共保比例总和
  
  ciData.forEach(item => {
    if (item['Ci.cChiefMrk'] === '1') {
      chiefMrkM++;
    } else {
      chiefMrkS++;
    }
    NCiShare += parseFloat(item['Ci.nCiShare'] || 0);
  });
  
  // 主共保信息验证
  if (chiefMrkM === 0 || chiefMrkS === 0) {
    ElMessage.error("主共方有且仅有一个！");
    return false;
  }
  if (chiefMrkM > 1) {
    ElMessage.error("主共保信息只允许增加一条!");
    return false;
  }
  // 共保比例总和验证
  if (Math.abs(NCiShare - 100) > 0.000001) { // 使用容差比较
    ElMessage.error("共保比例和应为100!");
    return false;
  }
  return true;
};
const JointInsuranceCheck = ()=> {
    const ciData = opertaor.getTableRefByKey("ci").getFromValue()
    if (ciData && ciData.length > 0) {
        let CCoinsurerCdeNum = 0; // 分公司份额
        for (const ciRow of ciData) {
            if ("327001" === ciRow["Ci.cCoinsurerCde"]) {
                CCoinsurerCdeNum++;
            }
        }
        console.log(CCoinsurerCdeNum);
        if (CCoinsurerCdeNum <= 1) {
            ElMessage.error("联共保时必须录入永安两个以上分公司份额！")
            return;
        }
    }
    
}
// 将对象的属性首字母转换为小写
function lowercaseKeys<T extends object>(
  obj: T
): { [K in keyof T as Uncapitalize<string & K>]: T[K] } {
  // 创建一个新的对象
  const newObj = {} as { [K in keyof T as Uncapitalize<string & K>]: T[K] };
  // 遍历原始对象的属性
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // 将属性名的首字母转换为小写，并赋值
      const newKey = (key.charAt(0).toLowerCase() +
        key.slice(1)) as Uncapitalize<string & K>;
      newObj[newKey] = obj[key];
    }
  }
  return newObj;
}
function getcacheKey() {
  return cacheKey.value;
}

function setTmDay(tmday: any) {
  tmDay.value = tmday;
}

function getPlanCvrg() {
  if (props.param?.cIsPlan !== "1") {
    return;
  }
  const param = { cPlanNo: props.param?.cTermNo };
  policyService.getPlanCvrg(param).then((result: any) => {
    if (result["code"] === 200) {
      opertaor.getTableRefByKey("cvrg").setFormValue(result.data.cvrg);
    } else {
      ElMessage.error(result["msg"]);
    }
  });
}

// 检查保额
function checkNAmt() {
  if (props.param.cEdrType !== "2" && props.param.cEdrType !== "3") {
    // 批改类型 2 注销 3 退保
    if (
      nAmt.value === "0" ||
      nAmt.value === "0.00" ||
      nAmt.value === 0 ||
      nAmt.value === null
    ) {
      ElMessage({
        message: "非退保场景，保额不能为零，请检查页面数据!",
        type: "error",
        duration: 3000,
      });
      return false;
    }
  }
  return true;
}
// 联共保业务
function handleUpdateSide(data: any) {
  if (data === "0") {
    // 非共保业务
    sliceSide.value = formconfig1[0].pageInfo.filter((item: any) => {
      return (
        item.pageKey === "ciMasterAgreement" ||
        item.pageKey === "ci" ||
        item.pageKey === "ourCompanyCiShare"
      );
    });
    formconfig1[0].pageInfo = formconfig1[0].pageInfo.filter((item: any) => {
      return (
        item.pageKey !== "ciMasterAgreement" &&
        item.pageKey !== "ci" &&
        item.pageKey !== "ourCompanyCiShare"
      );
    });
  } else if (sliceSide.value.length > 0) {
    const index =
      formconfig1[0].pageInfo.findIndex(
        (item: any) => item.pageKey === "image"
      ) + 1;
    formconfig1[0].pageInfo.splice(index, 0, ...sliceSide.value);
    sliceSide.value = [];
  }
}
/**
 * 点击申请核保调用险位接口
 * **/
const saveDataInfo = async () => {
  let saveFlag = false;
  const param = getSaveDataParams();

  const resInfo: any = await saveData({param});
  if (resInfo["code"] === "1") {
    saveFlag = true;
  } else {
    ElMessage.error(resInfo["message"]);
  }

  return saveFlag;
};

function getTotalNum(arr: any[]) {
  return arr.reduce((acc, item) => {
    return Number(acc) + Number(item)
  }, 0);
}

/**
 * 锚点点击事件重写 
 * 避免触发路由
 */
function handleAnchorClick(event: any, targetId: string) {
  // 阻止默认的路由跳转行为
  if(event) {
    event.preventDefault();
  }
  // 获取目标元素的ID
  if (targetId) {
    scrollByDomId(targetId, "start");
  }
  if(document.querySelectorAll('.el-anchor__item') && document.querySelectorAll('.el-anchor__item').length > 0) {
    document.querySelectorAll('.el-anchor__item').forEach((item:any) => {
      item.classList.remove('isActive')
    })
  }
  if(event) {
    event.currentTarget.classList.add('isActive')
  }
}

opertaor.setFatherPage({
  currentIndex: currentIndex,
  lowercaseKeys: lowercaseKeys,
  getcacheKey: getcacheKey,
  setTmDay: setTmDay,
  setnDelayNum: setnDelayNum,
  getSaveDataParams: getSaveDataParams,
  getEdrbaseValue: getEdrbaseValue,
  getOldProductResData: getOldProductResData,
});

function getEdrbaseValue(key:any) {
  return edrbase.value?.getFromValue() || {};
}

function getOldProductResData() {
  oldProductResData.value[0]['pageInfo'].forEach((i:any) => {
    if(i.pageKey === "dist") {
      i.pageSchema.fromSchema.forEach((item:any) => {
        // 方案号下拉值
        if(item.prop == 'Dist.cPlanNo'){
          const termref = opertaor.getTableRefByKey("cvrg");
          item.typeCode = null;
          item.loadData = termref.getPlanNo();
        }
      })
    }
  })
  // 043010 记名投保选“是”，人员清单导入未校验所有字段必填
  if(opertaor.getDataAll()['tgt'] && opertaor.getDataAll()['tgt']['Tgt.cIsinsuranceRegistered'] === '1') {
    const data = deepClone(oldProductResData.value);
    data[0]['pageInfo'].forEach((item:any) => {
      if(
        item.pageCode === "EducatorDist043010" || 
        item.pageCode === "DoctorDist049031" || 
        item.pageCode === "EducatorDist042003" || 
        item.pageCode === "EmployeeDist040007" || 
        item.pageCode === "PersonnelDist040020" || 
        item.pageCode === "PersonnelDist041001" || 
        item.pageCode === "PersonnelDist049024"
      ) {
        item.pageSchema.fromSchema.forEach((item:any) => {
          item.rules = [{type: 'required'}]
        })
      }
    })
    return data;
  } else {
    return oldProductResData.value;
  }
}

// 保存模板
function handleSaveTemplate() {
  const res = opertaor.getDataAll();
  for (const key in res) {
    if (res[key]) {
      res[key] = clearCAppNoAndCPkId(res[key]);
      if(key === 'ci' && res[key].length > 0) {
        res[key].forEach((item:any)=>{
          if(item['Ci.nCiShare']){
            item['Ci.nCiShare'] = Number(item['Ci.nCiShare'])/100;
          }
        })
      }
    }
  }
  dzmodal
    .open(templateDialog, { type: "", data: {...res, cProdNo: props.param?.cProdNo} })
    .then((res: any) => {
      if (res.type === "ok") {
      }
    });
}

/**
 * 清空数据中的CAppNo 与CPkId
 */
function clearCAppNoAndCPkId(res:any) {
  for (const k in res) {
    if (res[k] instanceof Object) {
      res[k] = clearCAppNoAndCPkId(res[k]);
    } else {
      // 清空申请单号, 主键,保单标志,续保\复制单号 签单日期 录单日期  投保日期,主共保，联共保标志清空，联保号，开口保单协议号
      if (k.indexOf('NCiOwnPrm') !== -1 || k.indexOf('NCiOwnAmt') !== -1 ||
       k.indexOf('NCiJntPrm') !== -1 || k.indexOf('NCiJntAmt') !== -1 || k.indexOf('COcAgrEdrNo') !== -1 || k.indexOf('TAgreeStopTm') !== -1 || k.indexOf('TAgreeStartTm') !== -1 || k.indexOf('COcAgrNo') !== -1 || k.indexOf('CJiAgtNo') !== -1 || k.indexOf('CCiMrk') !== -1 || k.indexOf('CAppNo') !== -1 || k.indexOf('CPkId') !== -1 || k === 'Base.CRenewMrk' || k === 'Base.COrigPlyNo' || k === 'Base.TIssueTm' || k === 'Base.TOprTm' || k === 'Base.TAppTm' || k === 'Base.CTmSysCde' || k === 'Base.TInsrncBgnTm' || k === 'Base.TInsrncEndTm' || k === 'Base.TCrtTm' || k === 'Base.TUpdTm' || k === 'Base.CPrePlyNo') {
        res[k] = null;
      }
      if (props.param?.pageType !== "PLY_APP_NEW_PLAN_SCENE" && props.param?.pageType !== "PLY_APP_UPDATE_PLAN_SCENE" && (k === 'Base.CDptCde' || k === 'Base.CCiMrk' || k === 'Base.CGrpMrk')) {
        res[k] = null;
      }
    }
  }
  return res;
}

// 设置延长天数
function setnDelayNum(val:any) {
  edrbase.value?.setValue("EdrBase.nDelayNum", val)
}

function getSaveDataParams() {
  const res = opertaor.getDataAll();
  const plyClauseObj = {
    cClauseCode: props.param?.cTermNo,
    cClauseName: props.param?.cTermNme,
  }
  /* 雇主责任险(取主条款项下的累积赔偿限额、每次事故赔偿限额和每人限额。若存在多个方案，累积赔偿限额、每次事故赔偿限额取累加数，每人赔偿限额取最大值) */
  if(props.param?.cProdNo === '040002') {
    plyClauseObj.nAmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nInsuranceAmount']));// 累积赔偿限额
    plyClauseObj.nOnceIndemLmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nAccidentLimit']));// 每次事故赔偿限额
    plyClauseObj.nPerIndemLmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nPersonLimit']));// 每人赔偿限额
  }
  /* 校方责任险(取主条款项下的累积赔偿限额、每次事故赔偿限额和每人赔偿限额。若有多个方案，累积赔偿限额、每次事故赔偿限额取累加数，每人赔偿限额取最大值) */
  if(props.param?.cProdNo === '040005') {
    plyClauseObj.nAmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nInsuranceAmount']));// 累积赔偿限额
    plyClauseObj.nOnceIndemLmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nAccidentLimit']));// 每次事故赔偿限额
    plyClauseObj.nPerIndemLmt = Math.max(...res.cvrg?.map((item:any) => item['Term.nPersonLimit']));// 每人赔偿限额
  }
  /* 律师责任险(取主条款项下的累积赔偿限额、每次事故赔偿限额。每位律师年度累积限额作为每人赔偿限额。若有多个方案，累积赔偿限额、每次事故赔偿限额取累加数，每人赔偿限额取最大值) */
  if(props.param?.cProdNo === '040007') {
    plyClauseObj.nAmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nInsuranceAmount']));// 累积赔偿限额
    plyClauseObj.nOnceIndemLmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nAccidentLimit']));// 每次事故赔偿限额
    plyClauseObj.nPerIndemLmt = Math.max(...res.cvrg?.map((item:any) => item['Term.nLawyerLimit']));// 每人赔偿限额
  }
  /* 注册会计师职业责任险(取主条款项下的累积赔偿限额、每次事故赔偿限额。每位会计师年度累积限额作为每人赔偿限额。若有多个方案，累积赔偿限额、每次事故赔偿限额取累加数，每人赔偿限额取最大值) */
  if(props.param?.cProdNo === "041001") {
    plyClauseObj.nAmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nInsuranceAmount']));// 累积赔偿限额
    plyClauseObj.nOnceIndemLmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nAccidentLimit']));// 每次事故赔偿限额
    plyClauseObj.nPerIndemLmt = Math.max(...res.cvrg?.map((item:any) => item['TermRisktgt.nAccountantLimit']));// 每人赔偿限额
  }
  /* 建设工程设计责任险(取主条款项下的累积赔偿限额、每次事故赔偿限额。没有每人赔偿限额，传空值。若有多个方案，每次事故累积赔偿限额、每次事故赔偿限额取累加数) */
  if(props.param?.cProdNo === "042001") {
    plyClauseObj.nAmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nInsuranceAmount']));// 累积赔偿限额
    plyClauseObj.nOnceIndemLmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nAccidentLimit']));// 每次事故赔偿限额
    plyClauseObj.nPerIndemLmt = "";
  }
  /* 道路客运承运人责任险(取主条款项下的累积赔偿限额、每次事故赔偿限额、每座赔偿限额作为每人赔偿限额。若有多个方案，每次事故累积赔偿限额、每次事故赔偿限额取累加数，每座赔偿限额取最大值) */
  if(props.param?.cProdNo === "043002") {
    plyClauseObj.nAmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nInsuranceAmount']));// 累积赔偿限额
    plyClauseObj.nOnceIndemLmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nAccidentLimit']));// 每次事故赔偿限额
    plyClauseObj.nPerIndemLmt = Math.max(...res.cvrg?.map((item:any) => item['Term.nSeatLimit']));// 每人赔偿限额
  }
  /* 道路货物运输承运人责任险(取主条款项下的累积赔偿限额、每次事故赔偿限额，没有每人赔偿限额，传空值。若有多个方案，每次事故累积赔偿限额、每次事故赔偿限额取累加数) */
  if(props.param?.cProdNo === "043016") {
    plyClauseObj.nAmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nInsuranceAmount']));// 累积赔偿限额
    plyClauseObj.nOnceIndemLmt = getTotalNum(res.cvrg?.map((item:any) => item['Term.nAccidentLimit']));// 每次事故赔偿限额
    plyClauseObj.nPerIndemLmt = "";
  }
  /* 除上述几个险种以外，其他险种plyClauseObj中不用传nAmt、nOnceIndemLmt、nPerIndemLmt这三个参数 */
  const param = [
    {
      "cPlyAppNo": res['applicant']['Applicant.cAppNo'],
      "cPlyNo": res['applicant']['Base.cPlyNo'] || "",
      "nEdrPrjNo": res['plyBase']['Base.nEdrPrjNo'],
      "cProdNo": props.param?.cProdNo,
      "cProdNme": props.param?.cProdNmeCn || props.param?.cProdNme,
      "tAppTm": props.param?.tAppTm || res['insrnc']['Base.tAppTm'],
      "tInsrncBgnTm": props.param?.tInsrncBgnTm || res['insrnc']['Base.tInsrncBgnTm'],
      "cStockMrk": res['insured']['Insured.cStkMrk'],
      "cDptCde": props.param?.cDptCde,
      "cAmtCur": res['base']['Base.cAmtCur'],
      "nRmbChgRate": res['base']['Base.nAmtRmbExch'],
      "nPrmCur": res['base']['Base.cPrmCur'],
      "nRicurChgRate":res['base']['Base.nPrmRmbExch'],
      "cCiMrk": props.param?.cCiMrk || res['plyBase']['Base.cCiMrk'],
      "cFacTyp": "0",// 临分类型（暂定默认传0）
      "cResvTxt1": "0",// 是否农银代理业务（暂定默认传0）
      "tAppCekTm": dayjs().format("YYYY-MM-DD HH:mm:ss"),
      "cSysSource": "3",
      "plyRiskUnitCvrgObjList": [
        {
          "nSeqNo": "1",
          "nAmt": res['base']['Base.nAmt'],
          "nPrm": res['base']['Base.nPrm'],
          "nNotaxPrm": res.payinfo[0]['Pay.nNotaxPrm'] || null,
          "nPrmVar":res.payinfo[0]['Pay.nPrmVar'],
          "nAddedTax": res.payinfo[0]['Pay.nAddedTax'] || null,
          "cTaxTyp":"VAT",
          "cRiskLvlCde": props.param?.cProdNo,
          "cRiskUnitNme": props.param?.cProdNmeCn || props.param?.cProdNme,
        }
      ],
      "plyClauseObj": plyClauseObj,
    }
  ]
  // cAppTyp = E 批单;cEdrType 批改类型 2 注销 3 退保
  if(props.param?.cAppTyp === "E" || props.param.cEdrType === "2" || props.param.cEdrType === "3") {
    param[0].cPlyNo = res['plyBase']['Base.cPlyNo']
    param[0].cEdrType = props.param?.cEdrType // 批改类型
    // param[0].tAppTm = res['insrnc']['Base.tAppTm']
    // param[0].tInsrncBgnTm = res['insrnc']['Base.tInsrncBgnTm']
    param[0].plyRiskUnitCvrgObjList[0].nAmt = edrbase.value?.getValue('EdrBase.nAmt')
    param[0].plyRiskUnitCvrgObjList[0].nPrm = edrbase.value?.getValue('EdrBase.nPrm')
  }
   return param;
}

// 询价保存入参中cAppNo替换为cInquiryNo
function replacecInquiryNo(res:any) {
  let data = null;
  if(res instanceof Array) {
    data = [...res]
    data.forEach((item:any) => {
      item = replacecInquiryNo(item)
    })
  } else if(res instanceof Object) {
    data = {...res}
    for (const key in data) {
      if(data[key] instanceof Object || data[key] instanceof Array) {
        data[key] = replacecInquiryNo(data[key])
      } else if (data.hasOwnProperty(key)) {
        if(key.indexOf('.') !== -1) {
          const k0 = key.split('.')[0];
          const k1 = key.split('.')[1];
          if(k1.indexOf('cAppNo') !== -1) {
            data[`${k0}.cInquiryNo`] = data[key]
            delete data[key]
          }
        } else {
          if(key === "cAppNo") {
            data['cInquiryNo'] = data[key]
            delete data[key]
          }
        }
      }
    }
  } else {
    data = res
  }
  return data;
}

// 复制出单和模板出单清空原有的申请单号
const clearKeyMap = ["cPkId","cAppNo","tUpdTm","cEdrNo","cLatestMrk","nEdrPrjNo","tCrtTm"]
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
          if(key === "cAppNo") {
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

// 深拷贝
const  deepClone =(obj:any)=> {
  // 处理原始值和 null
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // 处理日期对象
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  // 处理数组
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  // 处理普通对象
  const clone = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  
  return clone;
}

/**
 * 保费计算前校验费率上限
 */
const queryTermRateLimitFun = (calcFun: any) => {
  const res = opertaor.getDataAll();
  res["user"] = user;
  // 批改:注销退保保费计算
  if(calcFun === calcPremiumEdrSurrender) {
    res["EdrBase"] = edrbase.value?.getFromValue();
    if (
      res["EdrBase"]["EdrBase.cEdrRsnDetail"] != null &&
      res["EdrBase"]["EdrBase.cEdrRsnDetail"] != ""
    ) {
      res["EdrBase"]["EdrBase.cEdrRsnDetail"] =
        res["EdrBase"]["EdrBase.cEdrRsnDetail"].join();
    }
  } else if(calcFun === calcPremium) {
    res["plyBase"]["Base.cDptCde"] = props.param?.cDptCde;
    res["plyBase"]["Base.cProdNo"] = props.param?.cProdNo;
  } else if(calcFun === calcPremiumEdr) { // 批改单保费计算
    res["plyBase"]["Base.cDptCde"] = props.param?.cDptCde;
    res["plyBase"]["Base.cProdNo"] = props.param?.cProdNo;
    res["EdrBase"] = edrbase.value?.getFromValue();
    if (
      res["EdrBase"]["EdrBase.cEdrRsnDetail"] != null &&
      res["EdrBase"]["EdrBase.cEdrRsnDetail"] != ""
    ) {
      res["EdrBase"]["EdrBase.cEdrRsnDetail"] =
        res["EdrBase"]["EdrBase.cEdrRsnDetail"].join();
    }
  }
  queryTermRateLimit(res).then((r:any) => {
    if(r.code === 200) {
      calcFun()
    } else if(r.msg || r.message) {
      const tableHtml = r.data.map((row:any) => {
        return `<tr><td>${row.cPlanNo}</td>
        <td>${row.cTermName}</td>
        <td>${row.cRiskName}</td>
        <td style="color:red;">${row.nRateVal}</td>
        <td>${row.cRateRange}</td></tr>`;
      }).join(''); // 将所有行合并成一个字符串
      const htmlContent = `
        <table border="1" class="messageBoxTable">
          <thead>
            <tr><th>方案号</th>
            <th>条款</th
            ><th>责任</th>
            <th>费率</th>
            <th>建议费率区间</th></tr>
          </thead>
          <tbody>
            ${tableHtml}
          </tbody>
        </table>
        <div>${r.msg || r.message}</div>
      `;
      ElMessageBox.confirm(htmlContent, "提示", {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        lockScroll: false,
        customClass: 'queryTermRateMessage'
      }).then(() => {
        calcFun()
      })
    }
  }).catch((err:any) => {
    ElMessage.error(err)
  })
}
</script>
<style lang="scss" scoped>
$btn-icon-color-1: #ff3e00;
$btn-icon-color-2: #0060ff;
$btn-icon-color-3: #4500ff;
$btn-icon-color-4: #ffb200;
$btn-icon-color-5: #00ff31;
$btn-icon-bg-color-1: rgb(253, 222, 212);
$btn-icon-bg-color-2: rgb(238, 244, 254);
$btn-icon-bg-color-3: rgb(234, 227, 253);
$btn-icon-bg-color-4: rgb(255, 242, 212);
$btn-icon-bg-color-5: rgb(230, 251, 234);
.bottom-items {
  height: 45px;
  background-color: #fff;
  display: flex;
  justify-content: end;
  align-items: center;
  // padding-right: 20px;
  .el-button {
    padding: 8px;
    margin-right: 8px;
    margin-left: 0;
  }
}
.NavigaList_card {
  display: inline-block; /* 设置为行内块元素 */
  vertical-align: middle; /* 垂直居中 */
}
.card_ {
  margin-bottom: 10px;
}

/* 用于包含行内块元素的容器 */
.navi_container {
  line-height: 50px; /* 与容器的高度相同，实现垂直居中 */
}
:deep(.el-main) {
  padding: 10px 10px 10px 10px;
}
.publicStyle {
  color: red;
}
.mypage-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: absolute;
  width: 100%;
}
.dynamic-container {
  height: calc(100vh - $navbar-height - 60px - 90px);
  overflow: auto;
}

.mypage-aside {
  background: var(--el-color-primary);
}

.el-anchor {
  background: transparent;
  // width: 130px;
  :deep(.el-anchor__list) {
    padding: 20px 10px;
  } 
  .el-anchor__item {
    margin-bottom: 20px;
    padding-left: 0;
    opacity: .6;
    &.isActive,&:hover {
      opacity: 1;
      // background: #ffffff1a;
    }
    :deep(a) {
      display: flex;
      flex-direction: row;
      align-items: center;
      color: #FFFFFF;
      padding: 0;
      .el-icon {
        font-size: 3rem!important;
        margin: 0 0 10px 0;
      }
      .iconfont {
        font-size: 1.2rem;
        color: #FFF;
        margin-right: 5px;
      }
      .icon-title {
        font-size: 14px;
      }
    }
  }
}
.el-aside {
  width: auto;
  background: var(--el-color-primary);
}
.font-weight-500 {
  font-weight: 500;
}
.main-container {
  display: flex;
  flex-direction: column;
  .main-header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: -10px;
  }
  .main-content {
    flex: 1;
    overflow: hidden;
    overflow-y: auto;
  }
}
:deep(.el-card__header) {
  padding: 10px 20px!important;
  .el-row {
    align-items: center;
    &:first-child {
      font-size: 16px;
      font-weight: 500;
    }
  }
}
.card-title-style {
  font-size: 16px;
  font-weight: 500;
}
:deep(.el-card__body) {
  padding: 10px 20px;
}

.right-btns {
  padding: 0 3rem;
  margin-top: 42px;
  min-width: calc(150px + 6rem);
  .btns-content {
    background: #FFFFFF;
    padding: 10px;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    align-items: start;
    width: 150px;
    .el-button {
      margin: 0 0 12px 0;
      border: none;
      background-color: transparent!important;
      color: #333;
      padding: 0;
      :deep(.el-icon) {
        width: 32px;
        height: 32px;
        padding: 6px;
        border-radius: 2px;
        margin-right: 10px!important;
        svg {
          width: 20px;
          height: 20px;
        }
      }
      &:last-child {
        margin-bottom: 0;
      }
      &:nth-child(5n + 1) {
        :deep(.el-icon) {
          background-color: $btn-icon-bg-color-1;
          svg {
            color: $btn-icon-color-1;
          }
        }
      }
      &:nth-child(5n + 2) {
        :deep(.el-icon) {
          background-color: $btn-icon-bg-color-2;
          svg {
            color: $btn-icon-color-2;
          }
        }
      }
      &:nth-child(5n + 3) {
        :deep(.el-icon) {
          background-color: $btn-icon-bg-color-3;
          svg {
            color: $btn-icon-color-3;
          }
        }
      }
      &:nth-child(5n + 4) {
        :deep(.el-icon) {
          background-color: $btn-icon-bg-color-4;
          svg {
            color: $btn-icon-color-4;
          }
        }
      }
      &:nth-child(5n + 5) {
        :deep(.el-icon) {
          background-color: $btn-icon-bg-color-5;
          svg {
            color: $btn-icon-color-5;
          }
        }
      }
    }
  }
}
</style>
<style>
.queryTermRateMessage {
  max-width: 80%;
  width: auto;
}
.queryTermRateMessage .el-message-box__message p {
  overflow-x: auto;
}
.queryTermRateMessage .messageBoxTable {
  text-align: center;
  border-collapse: collapse;
}
.queryTermRateMessage .messageBoxTable td,.queryTermRateMessage .messageBoxTable th {
  white-space: nowrap;
  border: 1px solid #000000;
  padding: 0 5px;
}
</style>

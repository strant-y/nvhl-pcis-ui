<!-- 用户管理 -->
<template>
  <div class="mypage-app">
    <el-container class="dynamic-container" ref="scrollContainer">
      <el-aside :width="(NavigaShow ? 200 : 100) + 'px'">
        <el-affix :offset="100">
          <div class="navi_container">
            <div
              v-for="(pageConfig, v) in formconfig1"
              :key="v"
              class="NavigaList_card"
            >
              <el-anchor :bound="120" :offset="80" style="margin-top: 40px">
                <el-anchor-link :href="`#underwriteurl`" v-if="underwriteFlag">
                  <rt-icon
                    style="margin-right: 14px"
                    :item="{ icon: 'Tickets' }"
                  />
                  <span style="font-size: 15px" v-if="NavigaShow"
                    >核保处理</span
                  >
                </el-anchor-link>
                <el-anchor-link
                  v-if="edrbaseFlag"
                  @click="handleAnchorClick($event, `#edrbase`)"
                >
                  <rt-icon
                    style="margin-right: 14px"
                    :item="{ icon: 'Tickets' }"
                  />
                  <span style="font-size: 15px" v-if="NavigaShow"
                    >批改信息</span
                  >
                </el-anchor-link>
                <el-anchor-link
                  v-if="edritemFlag"
                  @click="handleAnchorClick($event, `#edritem`)"
                >
                  <rt-icon
                    style="margin-right: 14px"
                    :item="{ icon: 'Tickets' }"
                  />
                  <span style="font-size: 15px" v-if="NavigaShow"
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
                >
                  <rt-icon
                    style="margin-right: 14px"
                    :item="{
                      icon:
                        k.icon && k.icon !== 'null' && k.icon !== ''
                          ? k.icon
                          : 'Tickets',
                    }"
                  />
                  <span style="font-size: 15px" v-if="NavigaShow">
                    <template v-if="k.pageTtile && k.pageTtile.length > 6">
                      <el-tooltip
                        effect="dark"
                        :content="k.pageTtile"
                        placement="top-start"
                      >
                        {{ k.pageTtile.substring(0, 6) + "..." }}
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
                  <rt-icon
                    style="margin-right: 14px"
                    :item="{ icon: 'Tickets' }"
                  />
                  <span style="font-size: 15px" v-if="NavigaShow"
                    >联共保主协议信息</span
                  >
                </el-anchor-link>
                <el-anchor-link :href="`#ci`" v-if="ciFlag && isCiJiMrk">
                  <rt-icon
                    style="margin-right: 14px"
                    :item="{ icon: 'Tickets' }"
                  />
                  <span style="font-size: 15px" v-if="NavigaShow"
                    >联共保信息</span
                  >
                </el-anchor-link>
                <el-anchor-link
                  :href="`#ourCompanyCiShare`"
                  v-if="ourCompanyCiShareFlag && isCiJiMrk"
                >
                  <rt-icon
                    style="margin-right: 14px"
                    :item="{ icon: 'Tickets' }"
                  />
                  <span style="font-size: 15px" v-if="NavigaShow"
                    >我司联共保信息</span
                  >
                </el-anchor-link>
              </el-anchor>
            </div>
            <div class="NavigaList_card" style="margin-left: 5px">
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
            </div>
          </div>
        </el-affix>
      </el-aside>
      <el-main>
        <el-affix
          :offset="80"
          style="text-align: center; padding: 5px; background: #ebedfc;width: 100%;"
        >
          <div class="tp" style="background: #ebedfc">
            <span style="font-weight: bold">条款：</span
            ><span class="publicStyle"
              >{{ props.param.cTermNo }}&nbsp;&nbsp;{{
                props.param.cTermNme
              }}</span
            >&nbsp;|&nbsp;<span style="font-weight: bold">出单方式：</span
            ><span class="publicStyle">核心页面出单</span>&nbsp;|
            <span class="publicStyle">{{productStore.cCiMrk === '0' ? '非共保业务' 
              : productStore.cCiMrk == '1' ? '外部共保我方主共_主联'
              : productStore.cCiMrk == '2' ? '外部共保我方从共_主联'
              : productStore.cCiMrk == '3' ? '外部共保我方主共_无联保'
              : productStore.cCiMrk == '4' ? '外部共保我方从共_无联保'
              : '司内联保_主联' }}</span> |
            <span class="publicStyle">{{
              props.param.cGrpMrk == "0" ? "个单" : "团单"
            }}</span
            >&nbsp;|&nbsp;<span style="font-weight: bold">是否互联网出单:</span
            >&nbsp;<span class="publicStyle">{{
              props.param.cIsNet == "0" ? "是" : "否"
            }}</span>
          </div>
          <div class="btm" style="background: #ebedfc">
            <span style="font-weight: bold">保险期限：</span
            ><span class="publicStyle">{{ tmDay }}</span
            >&nbsp;|&nbsp;<span style="font-weight: bold">保额：</span
            ><span class="publicStyle">{{ nAmt }}</span
            >&nbsp;<span style="font-weight: bold">元</span>&nbsp;|&nbsp;<span
              style="font-weight: bold"
              >保费为: </span
            ><span class="publicStyle">{{ nPrm }}</span
            >&nbsp;<span style="font-weight: bold">元</span>
          </div>
        </el-affix>
        <div
          id="underwriteurl"
          v-if="underwriteFlag"
          style="margin-bottom: 10px"
        >
          <underwriteRef ref="underwrite" :pageData="pageData"></underwriteRef>
        </div>

        <div id="edrbase" v-if="edrbaseFlag" style="margin-bottom: 10px">
          <edrbaseRef ref="edrbase"></edrbaseRef>
        </div>
        <div id="edritem" v-if="edritemFlag" style="margin-bottom: 10px">
          <edritemRef ref="edritem"></edritemRef>
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
          <!-- {{ k.pageKey }} -->
            <component
              v-if="currentIndex >= i"
              :ref="
                (res) => {
                  const pageK =
                    k.pageKey === 'dist' || k.pageKey === 'distSummary'
                      ? k.pageCode
                      : k.pageKey;
                  opertaor.addTableRef(pageK, res);
                }
              "
              :is="k.pageType === 'custom' ? k.pageCode : k.pageKey + '-ref'"
              :pageSchema="k.pageSchema"
            />
          </div>
        </template>
        <div id="ci" v-if="ciFlag" style="margin-bottom: 10px">
          <ciRef ref="ci"></ciRef>
        </div>
        <div
          id="ciMasterAgreement"
          v-if="ciMasterAgreementFlag"
          style="margin-bottom: 10px"
        >
          <ciMasterAgreementRef ref="ciMasterAgreement"></ciMasterAgreementRef>
        </div>
        <div
          id="ourCompanyCiShare"
          v-if="ourCompanyCiShareFlag"
          style="margin-bottom: 10px"
        >
          <ourCompanyCiShareRef ref="ourCompanyCiShare"></ourCompanyCiShareRef>
        </div>
        <el-backtop :target="'.el-main'" :right="100" :bottom="150" />
      </el-main>
    </el-container>

    <el-footer>
      <el-affix position="bottom" :offset="10">
        <div class="bottom-items">
          <!--新增的投保单号显示和复制按钮-->
          <div style="margin-right: 20px; width: 100%; display: flex; justify-content: flex-end; align-items: center;">
            <div style="display: flex; align-items: center; background: #fff; padding: 6px 12px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
              {{ props.param?.pageName === "priceInquiry" ? "询价单号:" : "投保单号:" }}
              <span id="policyNumber" style="margin-left: 5px; margin-right: 8px; font-weight: bold;">
               {{ opertaor.getTableRefByKey('plyBase')?.getValue('Base.cAppNo') || '暂无' }}
              </span>
              <el-tooltip :content="`点击复制${props.param?.pageName === 'priceInquiry' ? '询价单号' : '投保单号'}`" placement="top">
                <el-button @click="copyPolicyNumber" circle size="small" style="color: red;">
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
      </el-affix>
    </el-footer>
  </div>
</template>

<script setup lang="ts">
import { createFreeButtonBase, FreeButtonBase } from "@/shared/button-config";
import { getProductPage, getRenewalAppPolicy } from "../../../api/prod/index";
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
} from "../../../api/query/index";
import { checkFeeWindowType, selectDist, saveDistBatch, getReleaseInquiryPage } from "@/api/prod";
import { dataOpertaor, useProductStore } from "@/store";
import moment from "moment";
import dayjs from "dayjs";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
import { useRouter, useRoute } from "vue-router";
import { getData } from "@/pcis/prodRef/dataInit";

const policyService = new PolicyService();
const productStore = useProductStore();
const { isCiJiMrk } = storeToRefs(productStore);

const route = useRoute();
const router = useRouter();


import { NewUdrListService } from "@/views/pcis-new-udr-list/service/new-udr-list.service";
const { saveData } = NewUdrListService();
import {useUserStore} from "@/store";
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
  () => import("@/views/comprehensive-query/modal/history-claimcase-model.vue")
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
  () => import("@/views/pcis/my-page/templateDialog.vue")
);

const opertaor = dataOpertaor();
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

const props = defineProps({
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
const tmDay = ref(0);
const dzmodal = useDzModal();
const cacheKey = ref();
const pageData = ref({}); // 页面数据

let controlFlag = ""; // 用来处理反洗钱 页面窜窜以及显示

// 存所有可显示账户信息场景
let detailcodeArray = [
  "保费调整",
  "赔款后保额冲减",
  "赔款后保额恢复",
  "增加保额",
  "减少保额",
  "增加险别",
  "变更清单信息",
  "减少险别",
  "变更保险期限",
  "变更车辆信息",
  "渠道信息变更",
  "增减方案",
  "变更投保数量",
  "增加保费",
  "变更每亩保费",
  "减少保费",
  "费率调整",
  "报停展期",
  "增加销售额",
  "减少销售额",
  "增加保费",
  "其他",
  "更改客户信息",
  "变更工程造价",
  "减少被保险人",
  "变更建筑面积",
  "收费延期",
  "增加被保险人",
  "增加清单信息",
  "不记名补录被保险人",
  "全单注销",
  "全单退保",
  "一般退保",
  "当期退",
  "分期失效",
];
// 用来处理 账户信息 哪些场景显示
const isDetailCde = () => {
  return detailcodeArray.includes(props.param.cRsnDetailCde);
};

onMounted(() => {
  initPage();
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

// 复制投保单号
const copyPolicyNumber = () => {
  const policyNumberElement = document.getElementById("policyNumber");
  if (!policyNumberElement) return;

  const range = document.createRange();
  range.selectNode(policyNumberElement);

  const selection = window.getSelection();
  if (!selection) return;

  selection.removeAllRanges();
  selection.addRange(range);

  try {
    const successful = document.execCommand("copy");
    if (successful) {
      ElMessage.success("投保单号已成功复制到剪贴板！");
    } else {
      ElMessage.error("投保单号复制失败，请手动复制。");
    }
  } catch (err) {
    ElMessage.error("当前浏览器不支持自动复制功能，请手动复制。");
  }

  // 清除选中内容
  selection.removeAllRanges();
};

/**
 * 投保需要的按钮
 */
const basicBtn = [
  createFreeButtonBase({
    label: "保存模板",
    type: "primary",
    func: () => {
      handleSaveTemplate()
    },
  }),
  createFreeButtonBase({
    label: "复制出单",
    type: "primary",
    func: () => {
      copyPolicyFun();
    },
  }),
  createFreeButtonBase({
    label: "保费计算",
    type: "primary",
    id: "btn010101",
    func: () => {
      calcPremium();
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
    func: () => {
      setTaxInfo();
    },
  }),
  createFreeButtonBase({
    label: "反洗钱扩展信息",
    type: "primary",
    func: () => {
      setCusBenefitInfo();
    },
  }),
  createFreeButtonBase({
    label: "额度明细",
    type: "primary",
    func: () => {
      openLimit();
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
      calcPremiumEdr();
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
    label: "保存",
    type: "primary",
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
  createFreeButtonBase({
    label: "费用信息",
    type: "primary",
    id: "modFee",
    func: () => {
      //获取费用信息类型接口（缺少渠道，保费，当前表单提交校验待后续补充）
      checkFeeWindowType({ CAppNo: props.param.cAppNo }).then((res: any) => {
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
  // createFreeButtonBase({
  //   label: "历史赔案",
  //   type: "primary",
  //   func: () => {
  //     historyClaimcaseFun();
  //     // src\views\pcis-new-udr-list\common\history-claimcase-model.vue
  //   },
  // }),
  createFreeButtonBase({
    label: "任务痕迹",
    type: "primary",
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
    func: () => {
      dzmodal
        .open(UndrOpnList, { type: "", CAppNo: props.param?.cAppNo })
        .then((res: any) => {
          if (res.type === "ok") {
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
  }
  opertaor.setTableConfig(formconfig11);
  renderComponents();
};

const dataInit = ref({});
/**
 * 逐个渲染组件
 */
function renderComponents() {
  const interval = setInterval(() => {
    if (currentIndex.value < formconfig1[0]?.pageInfo.length - 1) {
      currentIndex.value++;
    } else {
      loadAfter(); //页面加载完成之后,再加载后续所需的事件
      clearInterval(interval);
    }
  }, 50); // 延迟组件渲染,增加页面响应效率
  
  if (props.param.pageType === "app") {
    const idata = getData();
    dataInit.value = opertaor.mapSetData(idata);
    setTimeout(() => {
      // 基本信息预加载，降低空窗期
      opertaor.setDataAll(dataInit.value);
    }, 100);
  }
}

/**
 * 页面加载后
 */
async function loadAfter() {
  if (props.param.pageType === "app") {
    //获取单号
    getCAppNoFun();
    // 获取条款信息
    getPlanCvrg();
    bthList.value = basicBtn;
    nextTick(() => {
      opertaor.setDataAll(dataInit.value);
    });
  } else if (props.param.pageType === "TEMPORARY_DEPOSIT") {
    // 暂存单
    const cAppNo = props.param.cAppNo;
    loadAppPlyInfo(cAppNo);
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
        });
        edritem.value?.handleQuery();
      } else {
        bthList.value = edrSurrenderBtn;
      }
    } else if (props.param.cAppTyp == "A") {
      bthList.value = basicBtn;
    }
  } else if (props.param.pageType === "PLY_APP_MODIFY_BOUNCED_SCENE") {
    // 投保单核保退回
    const cAppNo = props.param.cAppNo;
    loadAppPlyInfo(cAppNo);
    bthList.value = basicBtn;
  } else if (props.param.pageType === "EDR_APP_MODIFY_BOUNCED_SCENE") {
    // 批改单核保退回
    const cAppNo = props.param.cAppNo;
    loadAppPlyInfo(cAppNo);
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
    //核保处理
    nextTick(() => {
      opertaor.setDisabledAll();
    });
    const cAppNo = props.param.cAppNo;
    loadAppPlyInfo(cAppNo);
    if (props.param.cAppTyp == "E") {
      edritem.value?.handleQuery();
      const getFormconfig = edrbase.value?.getFormconfig();
      getFormconfig.fromSchema?.forEach((item) => {
        item.disabled = true;
      });
    }
    bthList.value = uwBtn;
  } else if (props.param.pageType === "EDR_APP_NEW_SCENE") {
    // 批改申请-新增
    const cAppNo = props.param.cAppNo;
    loadAppPlyInfo(cAppNo);
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
      });
      bthList.value = edrBtn;
    } else {
      bthList.value = edrSurrenderBtn;
    }
  } else if (props.param.pageType === "readonly") {
    nextTick(() => {
      opertaor.setDisabledAll();
    });
    // 查询数据
    // const getAppPlyInfoRes = await getAppPlyInfoByAppNo({
    //   CAppNo: props.param.cAppNo,
    // });
    // console.log("getAppPlyInfoRes", getAppPlyInfoRes);
    // const data = getAppPlyInfoRes.data;
    const cAppNo = props.param.cAppNo;
    loadAppPlyInfo(cAppNo);
    if (props.param.cAppTyp == "E") {
      edritem.value?.handleQuery();
      const getFormconfig = edrbase.value?.getFormconfig();
      getFormconfig.fromSchema?.forEach((item) => {
        item.disabled = true;
      });
    }
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
    const cAppNo = props.param.cAppNo;
    loadAppPlyInfo(cAppNo);
    if (props.param.cAppTyp == "E") {
      edritem.value?.handleQuery();
      const getFormconfig = edrbase.value?.getFormconfig();
      getFormconfig.fromSchema?.forEach((item) => {
        item.disabled = true;
      });
    }
  } else if (props.param.pageType === "orig") {
    getAppPolicy({
      cAppNo: props.param.cAppNo,
      queryTyp: props.param.pageType,
    }).then((res) => {
      if (res) {
        const ops = opertaor.convertData(res);
        ops['plyBase']['Base.cRenewMrk'] = '1'
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
        opertaor.setDataAll(ops);
        // 获取原投保单号下的清单列表数据
        const distMap = formconfig1[0].pageInfo.filter((item:any) => {
          return item.pageKey === "dist" || item.pageKey === "distSummary";
        });
        distMap.forEach((item:any) => {
          getDistData(props.param?.cAppNo, item)
        });
        //获取单号
        getCAppNoFun();
      }
    });
    bthList.value.push(
      createFreeButtonBase({
        label: "保存模板",
        type: "primary",
        func: () => {
          handleSaveTemplate()
        },
      }),
      createFreeButtonBase({
        label: "复制出单",
        type: "primary",
        func: () => {
          copyPolicyFun();
        },
      }),
      createFreeButtonBase({
        label: "保费计算",
        type: "primary",
        id: "btn010101",
        func: () => {
          calcPremium();
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
        func: () => {
          setTaxInfo();
        },
      }),
      createFreeButtonBase({
        label: "反洗钱扩展信息",
        type: "primary",
        func: () => {
          setCusBenefitInfo();
        },
      }),
      createFreeButtonBase({
        label: "额度明细",
        type: "primary",
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
        const ops = opertaor.convertData(res);
        // 保险期限 投保日期更新为当前日期 保险起期和保险止期重置为第二天0点至一年后
        if(ops.insrnc) {
          const beginTm = dayjs().add(1, 'day').format("YYYY-MM-DD 00:00:00")
          const endTm = dayjs(beginTm).add(1, 'year').format("YYYY-MM-DD 23:59:59")
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
        opertaor.setDataAll(ops);
        // 获取原投保单号下的清单列表数据
        const distMap = formconfig1[0].pageInfo.filter((item:any) => {
          return item.pageKey === "dist" || item.pageKey === "distSummary";
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
        func: () => {
          handleSaveTemplate()
        },
      }),
      createFreeButtonBase({
        label: "复制出单",
        type: "primary",
        func: () => {
          copyPolicyFun();
        },
      }),
      createFreeButtonBase({
        label: "保费计算",
        type: "primary",
        id: "btn010101",
        func: () => {
          calcPremium();
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
        func: () => {
          setTaxInfo();
        },
      }),
      createFreeButtonBase({
        label: "反洗钱扩展信息",
        type: "primary",
        func: () => {
          setCusBenefitInfo();
        },
      }),
      createFreeButtonBase({
        label: "额度明细",
        type: "primary",
        func: () => {
          openLimit();
        },
      })
    );
  } else if(props.param?.pageType === "template") {
    policyService.getTemplate(props.param?.cPkId).then((res:any) => {
      if (res["code"] == "200") {
        ElMessage.success('模板加载完成');
        const cTplCtnt = res['res'].cTplCtnt;
        // this.cTplNme = result['res'].cTplNme;
        // this.cTplDesc = result['res'].cDesc;
        // this.TplPkId = result['res'].cPkId;
        const ops = JSON.parse(cTplCtnt);
        // 保险期限 投保日期更新为当前日期 保险起期和保险止期重置为第二天0点至一年后
        if(ops.insrnc) {
          const beginTm = dayjs().add(1, 'day').format("YYYY-MM-DD 00:00:00")
          const endTm = dayjs(beginTm).add(1, 'year').format("YYYY-MM-DD 23:59:59")
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
        opertaor.setDataAll(ops);
        //获取单号
        getCAppNoFun();
      }
    }).catch((err:any) => {
      ElMessage.error(err);
    });
    bthList.value.push(
      createFreeButtonBase({
        label: "保存模板",
        type: "primary",
        func: () => {
          handleSaveTemplate()
        },
      }),
      createFreeButtonBase({
        label: "复制出单",
        type: "primary",
        func: () => {
          copyPolicyFun();
        },
      }),
      createFreeButtonBase({
        label: "保费计算",
        type: "primary",
        id: "btn010101",
        func: () => {
          calcPremium();
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
        func: () => {
          setTaxInfo();
        },
      }),
      createFreeButtonBase({
        label: "反洗钱扩展信息",
        type: "primary",
        func: () => {
          setCusBenefitInfo();
        },
      }),
      createFreeButtonBase({
        label: "额度明细",
        type: "primary",
        func: () => {
          openLimit();
        },
      })
    );
  }
  bthList.value.push(
    createFreeButtonBase({
    label: "历史赔案",
    type: "primary",
    func: () => {
      historyClaimcaseFun();
      // src\views\pcis-new-udr-list\common\history-claimcase-model.vue
    },
  }),
    createFreeButtonBase({
      label: "返回",
      func: () => {
        history.back();
      },
    }),
  
  );

  if(props.param?.showBtn === false){
    bthList.value = [];
  }
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
    cAppNo: appNo,
  };
  if(item.pageKey === "distSummary") {
    selData.isSummary = '1';
  }
  selectDist(selData).then((res: any) => {
    if (res.code === 200) {
      opertaor.getTableRefs()[item.pageCode].setTableData(res.data.data);
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
const saveDist = (appNo:any) => {
  const distMap = formconfig1[0].pageInfo.filter((item:any) => {
    return item.pageKey === "dist" || item.pageKey === "distSummary";
  });
  distMap.forEach((item:any) => {
    if(item.pageKey === "dist") {
      const data = opertaor.getTableRefs()[item.pageCode].getTableData();
      
      if(data && data.length > 0) {
        const param = {
          cComponentTable: item.pageCode.slice(0, -6),
          cAppNo: appNo,
          dist: data.map((item:any) => {
            return {
              ...item,
              'Dist.tOpeningTime': item['Dist.tOpeningTime'] ? dayjs(item['Dist.tOpeningTime']).format('YYYY-MM-DD') : null,
              'Dist.tCrtTm': item['Dist.tCrtTm'] ? dayjs(item['Dist.tCrtTm']).format('YYYY-MM-DD') : null,
              'Dist.tUpdTm': item['Dist.tUpdTm'] ? dayjs(item['Dist.tUpdTm']).format('YYYY-MM-DD') : null,
              'Dist.tValidityPeriod': item['Dist.tValidityPeriod'] ? dayjs(item['Dist.tUpdTm']).format('YYYY-MM-DD HH:mm:ss') : null
            };
          }),
        }
        saveDistBatch(param).then((res:any) => {
          if(res.code === 200) {
            // 批量保存清单成功后再查询一遍清单
            distMap.forEach((item:any) => {
              opertaor.getTableRefs()[item.pageCode].handleQuery();
            });
            saveDistBatchFlag.value = false;
          } else {
            ElMessage.error(res.msg);
          }
        }).catch((err:any) => {
          ElMessage.error(err);
        });
      }
    }
  });
}
/**
 * 加载投保单明细
 */
const loadAppPlyInfo = (CAppNo) => {
  const param = {
    scene: props.param.pageType,
  };
  if ("EDR_APP_NEW_SCENE" === props.param.pageType) {
    param["CPlyNo"] = CAppNo;
  } else {
    param["CAppNo"] = CAppNo;
  }
  if(props.param?.cPkId) {// 查询模板明细
    policyService.getTemplate(props.param?.cPkId).then((res:any) => {
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
            res["res"]["composition"]["EdrBase"][0]["EdrBase.cRatioTyp"] = "1";
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
    })
  } else {
    getAppPolicy(param).then((res) => {
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
            res["res"]["composition"]["EdrBase"][0]["EdrBase.cRatioTyp"] = "1";
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
        ElMessage.success(res.msg);
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
    });
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
  console.log(res);
  if (res["cvrg"].length == 0) {
    ElMessage.error("请录入条款信息");
    btn.loading = false;
    return;
  }
  if (!baseValite()) {
    btn.loading = false;
    return;
  }

  const appCalcFun = props.param?.pageName === "priceInquiry" ? calculatePremium(res) : appCalc(res);
  appCalcFun.then((res: any) => {
    btn.loading = false;
    console.log("appCalc-res", res);
    if (res["code"] == "200") {
      const ops: any = opertaor.convertData(res);
      console.log("保费计算转换的数据", ops);
      if (
        ops["base"]["Base.nPrm"] != undefined &&
        ops["base"]["Base.nPrm"] != null
      ) {
        ElMessage.success(res.msg + "保费为：" + ops["base"]["Base.nPrm"]);
      } else {
        ElMessage.success(res.msg + "保费为：0");
      }

      opertaor.setDataAll(ops);
      nAmt.value = ops["base"]["Base.nAmt"] ? ops["base"]["Base.nAmt"] : 0;
      nPrm.value = ops["base"]["Base.nPrm"] ? ops["base"]["Base.nPrm"] : 0;
      const nPrmVal = ops["base"]["Base.nPrm"];
      const nAmtVal = ops["base"]["Base.nAmt"];


// 
      productStore.setnPrm(nPrmVal);
      productStore.setnAmt(nAmtVal);
      opertaor
        .getTableRefByKey("ciMasterAgreement")
        .setValue("Base.nCiJntAmt", nAmt.value);
      opertaor
        .getTableRefByKey("ciMasterAgreement")
        .setValue("Base.nJiJntAmt", nAmt.value);
      opertaor
        .getTableRefByKey("ciMasterAgreement")
        .setValue("Base.nCiJntPrm", nPrm.value);
      opertaor
        .getTableRefByKey("ciMasterAgreement")
        .setValue("Base.nJiJntPrm", nPrm.value);
      opertaor
        .getTableRefByKey("ourCompanyCiShare")
        .setValue("Base.nCiOwnAmt", nAmt.value);
      opertaor
        .getTableRefByKey("ourCompanyCiShare")
        .setValue("Base.nCiOwnPrm", nPrm.value);
        
        //承保 总保费
        opertaor.getTableRefs()["base"].setValue("Base.nPrm", nPrm.value);
        console.log('到————————')

        //     opertaor
        // .getTableRefByKey("ourCompanyCiShare")
        // .setValue("Base.groupPrmCur", 122);
        //     opertaor
        // .getTableRefByKey("ourCompanyCiShare")
        // .setValue("Base.nPrm", 123);

      const payInfo = setPayInfo(ops["base"], ops["applicant"], ops["insrnc"]);

      console.log("生成缴费计划内容", payInfo);
      opertaor.getTableRefs()["payinfo"].setFormValue(payInfo);
      // const ciInfo = setCiInfo(ops["base"]);
      // opertaor.getTableRefs()["ci"].setFormValue(ciInfo); //生产联共保信息
      needCalc.value = false;

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
  pay["Pay.tPayEndTm"] = moment(insrnc["Base.tInsrncBgnTm"]).format(
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
  ci["Ci.cSubDptCde"] = props.param.cDptCde
  ciList.push(ci)
  return ciList;
};
/**
 * 投保申请核保
 */
const submitToUndrFn = async () => {
  if (needCalc.value) {
    ElMessage.error("请先进行保费计算!");
    return;
  }
  if (!baseValite()) {
    btn.loading = false;
    return;
  }
  if (!checkNAmt()) return;
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
      res["appNo"] = base["Base.cAppNo"];

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
      const calcData: any = opertaor.getDataAll();
      calcData["user"] = user;
      calcData["plyBase"]["Base.cDptCde"] = params.cDptCde;
      calcData["plyBase"]["Base.cProdNo"] = params.cProdNo;
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
          if (newPrm === oldPrm) {
            const undr: any = await submitToUndr(res);
            btn.loading = false;
            console.log("submitToUndr-res", undr);
            if (undr["code"] == 200) {
              if(!undr['cDecision'] === '0'){
                ElMessage.success(undr.msg);
                // 申请核保成功后按钮设置为不可点击
                const btn = getBtn("btn010103");
              }else if(undr["cDecision"] == '0'){
                ElMessage.error(undr.msg);
              }else{
                ElMessage.error(undr.msg);
              }
            } else {
              ElMessage.error(undr.msg);
            }
            btn.disabled = true;
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

  const resInfo: any = await saveAppPlyInfo(res);
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
    if(props.param?.pageType === "copy" && saveDistBatchFlag.value) {
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
  const btn = getBtn("btnCalEdr");
  btn.loading = true;
  const res = opertaor.getDataAll();
  res["user"] = user;
  res["plyBase"]["Base.cDptCde"] = props.param.cDptCde;
  res["plyBase"]["Base.cProdNo"] = props.param.cProdNo;
  res["EdrBase"] = edrbase.value?.getFromValue();
  if (
    res["EdrBase"]["EdrBase.cEdrRsnDetail"] != null &&
    res["EdrBase"]["EdrBase.cEdrRsnDetail"] != ""
  ) {
    res["EdrBase"]["EdrBase.cEdrRsnDetail"] =
      res["EdrBase"]["EdrBase.cEdrRsnDetail"].join();
  }
  console.log(res);
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
      opertaor.setDataAll(ops);
      nAmt.value = ops["base"]["Base.nAmt"] ? ops["base"]["Base.nAmt"] : 0;
      nPrm.value = ops["base"]["Base.nPrm"] ? ops["base"]["Base.nPrm"] : 0;
      const EdrBaseData = res["res"]["composition"]["EdrBase"][0];
      res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"] =
        res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"].split(
          ","
        );
      edrbase.value?.setFormValue(EdrBaseData);
      const nPrmVar = ops["plyBase"]["Base.nPrmVar"]  || 0;
      const payInfo = setPayInfoEdr(
        ops["payinfo"],
        ops["base"],
        ops["applicant"],
        nPrmVar,
        ops["plyBase"]
      );
      console.log("生成缴费计划内容", payInfo);
      opertaor.getTableRefs()["payinfo"].setFormValue(payInfo);
      needCalc.value = false;
    } else {
      ElMessage.error(res.msg);
    }
    // ElMessage.success(res.msg);
    // history.back();
  });
};
const setPayInfoEdr = (payList, base, applicant, nPrmVar, plyBase) => {
  const payListNew = [];
  const pay = {};
  if (applicant) {
    pay["Pay.cPayorCde"] = applicant["Applicant.cAppCde"];
    pay["Pay.cPayorNme"] = applicant["Applicant.cAppNme"];
  } else {
    pay["Pay.cPayorCde"] = "";
    pay["Pay.cPayorNme"] = "";
  }
  pay["Pay.nPayablePrm"] = nPrmVar;
  pay["Pay.tPayBgnTm"] = plyBase["Base.tEdrAppTm"];
  pay["Pay.tPayEndTm"] = plyBase["Base.tEdrBgnTm"];
  pay["Pay.nOwnPrm"] = nPrmVar;
  pay["Pay.cProdNo"] = base["Base.cProdNo"];
  pay["Pay.nPrmVar"] = nPrmVar;
  for (const i in payList) {
    if (!!payList[i]["Pay.cPkId"]) {
      payListNew.push(payList[i]);
    }
  }
  pay["Pay.nTms"] = payListNew.length + 1;
  payListNew.push(pay);
  return payListNew;
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
    res["EdrBase"]["EdrBase.cEdrRsnDetail"] != ""
  ) {
    res["EdrBase"]["EdrBase.cEdrRsnDetail"] =
      res["EdrBase"]["EdrBase.cEdrRsnDetail"].join();
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
const saveEdrPlyInfo = () => {
  const btn = getBtn("saveEdr");
  btn.loading = true;
  const res = opertaor.getDataAll();
  res["user"] = user;
  res["plyBase"]["Base.cDptCde"] = props.param.cDptCde;
  res["plyBase"]["Base.cProdNo"] = props.param.cProdNo;
  res["EdrBase"] = edrbase.value?.getFromValue();
  if (
    res["EdrBase"]["EdrBase.cEdrRsnDetail"] != null &&
    res["EdrBase"]["EdrBase.cEdrRsnDetail"] != ""
  ) {
    res["EdrBase"]["EdrBase.cEdrRsnDetail"] =
      res["EdrBase"]["EdrBase.cEdrRsnDetail"].join();
  }
  saveEdrAppPlyInfo(res).then((res) => {
    console.log("saveAppPlyInfo-res", res);
    btn.loading = false;
    if (res["code"] == "200") {
      const ops = opertaor.convertData(res);
      console.log("转换的数据", ops);
      ElMessage.success(res.msg);
      opertaor.setDataAll(ops);
      const EdrBaseData = res["res"]["composition"]["EdrBase"][0];
      // res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"] =
      //   res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"].split(
      //     ","
      //   );    //影响二次批改报错,先注释掉待调整
      edrbase.value?.setFormValue(EdrBaseData);
    } else {
      ElMessage.error(res.msg);
    }
    // ElMessage.success(res.msg);
    // history.back();
  });
};
/**
 * 生成批文
 * **/
const generateEndorse = () => {
  const btn = getBtn("btnCompare");
  btn.loading = true;
  const res = opertaor.getDataAll();
  res["user"] = user;
  res["plyBase"]["Base.cDptCde"] = props.param.cDptCde;
  res["plyBase"]["Base.cProdNo"] = props.param.cProdNo;
  res["EdrBase"] = edrbase.value?.getFromValue();
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
 * 批单申请核保
 */
const submitEdrToUndrFun = async () => {
  if (needCalc.value) {
    ElMessage.error("请先进行保费计算!");
    return;
  }
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
  submitEdrToUndr(res).then((res) => {
    btn.loading = false;
    console.log("批改申请核保", res);
    // ElMessage.success(res.msg);
    // history.back();
    if (res["code"] == "200") {
      ElMessage.success(res.msg);
    } else {
      ElMessage.error(res.msg);
    }
  });
};
/**
 * 核保信息 提交
 */
const submitUnderwritingFn = () => {
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
  res["backUndrDptCde"] = null; // 退回指定核保级别机构编码
  res["backUndrClsCde"] = null; // 退回指定核保级别编码
  res["backUndrDptCnm"] = null; // 退回指定核保人员名称
  console.log(res);
  // if(res.cUndrMrk === "A") {//核保选项为同意时，调用强制临分接口
  //   const deductibleDist = opertaor.getTableRefByKey("deductibleDist")?.getTableData();
  //   const insured = opertaor.getTableRefByKey("insured")?.getFromValue();
  //   const applicant = opertaor.getTableRefByKey("applicant")?.getFromValue();
  //   const plyBase = opertaor.getTableRefByKey("plyBase")?.getFromValue();
  //   const insrnc = opertaor.getTableRefByKey("insrnc")?.getFromValue();
  //   const edrbase = opertaor.getTableRefByKey("edrbase")?.getFromValue();
  //   const param = {
  //     cAppNo: props.param?.cAppNo,// 保批单申请单号
  //     cDductDesc: deductibleDist[0]?["DeductibleDist.cDeductibleContent"]:"",// 免赔约定
  //     cDocTyp: props.param?.cAppTyp,// 单证类型 A 保单 E 批单
  //     cDptCde: props.param?.cDptCde,// 机构代码
  //     cInsrntNme: insured['Insured.cInsuredNme'],//被保人名称
  //     cPlyNo: props.param?.plyNo,// 保单号
  //     cProdNme: props.param?.cTermNme,// 产品名称
  //     cProdNo: props.param?.cProdNo,//产品代码
  //     cStockMrk: props.param?.cGrpMrk == "0" ? insured['Insured.cStkMrk'] : applicant['Applicant.cStkMrk'],// 股东业务标志(团单1取投保人标识，个单0取被保人标识)
  //     // nAmtChgRate: "1.00",// 保额币种汇率
  //     nEdrPrjNo: plyBase['Base.nEdrPrjNo'],// 批改序号
  //     // nPrmChgRate: "1.00",// 保费币种汇率
  //     tAppTm: insrnc['Base.tAppTm'],// 投保日期
  //     tEdrBgnTm: edrbase?['EdrBase.tEdrBgnTm']:'',// 批改生效起期
  //     // tEdrEndTm: "2025-05-07 13:57:37",// 批改生效止期
  //     tInsrncBgnTm: insrnc['Base.tInsrncBgnTm'],// 保险起期
  //     tInsrncEndTm: insrnc['Base.tInsrncEndTm'],// 保险止期
  //   }
  //   const queryRiFacMrk = policyService.queryRiFacMrk(param)
  //   if(queryRiFacMrk && queryRiFacMrk.responseCode === '0') {
  //     ElMessage.error(queryRiFacMrk.message);
  //     return
  //   }
  // }
  let submitUnder;
  if (props.param.cAppTyp === "A") {
    submitUnder = submitUnderwriting(res);
  }
  if (props.param.cAppTyp === "E") submitUnder = submitUnderwritingEdr(res);

  submitUnder.then((res) => {
    console.log("submitUnderwriting-res", res);
    // btn.loading = false;
    if (res["code"] == "200") {
      // const ops = opertaor.convertData(res);
      // console.log("转换的数据", ops);
      ElMessage.success(res.msg);
      // opertaor.setDataAll(ops);
    } else {
      ElMessage.error(res.msg);
    }
    // ElMessage.success(res.msg);
    // history.back();
  });
};

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
  event.preventDefault();
  // 获取目标元素的ID
  if (targetId) {
    // 手动实现平滑滚动效果
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' // 可选值：'start', 'center', 'end', 'nearest'
      });
    }
  }
}

opertaor.setFatherPage({
  currentIndex: currentIndex,
  lowercaseKeys: lowercaseKeys,
  getcacheKey: getcacheKey,
  setTmDay: setTmDay,
  setnDelayNum: setnDelayNum,
  getSaveDataParams: getSaveDataParams
});

// 保存模板
function handleSaveTemplate() {
  const res = opertaor.getDataAll();
  for (const key in res) {
    if (res[key]) {
      res[key] = clearCAppNoAndCPkId(res[key]);
    }
  }
  dzmodal
    .open(templateDialog, { type: "", data: res })
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
      // 清空投保单号, 主键,保单标志,续保\复制单号 签单日期 录单日期  投保日期,主共保，联共保标志清空，联保号，开口保单协议号
      if (k.indexOf('NCiOwnPrm') !== -1 || k.indexOf('NCiOwnAmt') !== -1 || k.indexOf('NCiJntPrm') !== -1 || k.indexOf('NCiJntAmt') !== -1 || k.indexOf('COcAgrEdrNo') !== -1 || k.indexOf('TAgreeStopTm') !== -1 || k.indexOf('TAgreeStartTm') !== -1 || k.indexOf('COcAgrNo') !== -1 || k.indexOf('CJiAgtNo') !== -1 || k.indexOf('CCiMrk') !== -1 || k.indexOf('CAppNo') !== -1 || k.indexOf('CPkId') !== -1 || k === 'Base.CRenewMrk' || k === 'Base.COrigPlyNo' || k === 'Base.TIssueTm' || k === 'Base.TOprTm' || k === 'Base.TAppTm' || k === 'Base.CTmSysCde' || k === 'Base.TInsrncBgnTm' || k === 'Base.TInsrncEndTm' || k === 'Base.TCrtTm' || k === 'Base.TUpdTm' || k === 'Base.CPrePlyNo') {
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
</script>

<style lang="scss" scoped>
.bottom-items {
  height: 50px;
  background-color: #fff;
  display: flex;
  justify-content: end;
  align-items: center;
  padding-right: 20px;
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
}
.dynamic-container {
  height: calc(100vh - $navbar-height - 60px - 90px);
  overflow: auto;
}
</style>

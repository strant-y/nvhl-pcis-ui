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
                <el-anchor-link :href="`#edrbaseurl`" v-if="edrbaseFlag">
                  <rt-icon
                    style="margin-right: 14px"
                    :item="{ icon: 'Tickets' }"
                  />
                  <span style="font-size: 15px" v-if="NavigaShow"
                    >批改信息</span
                  >
                </el-anchor-link>
                <el-anchor-link :href="`#edritemurl`" v-if="edritemFlag">
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
        <el-backtop :right="100" :bottom="100" />
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
          <underwriteRef ref="underwrite"></underwriteRef>
        </div>

        <div id="edrbaseurl" v-if="edrbaseFlag" style="margin-bottom: 10px">
          <edrbaseRef ref="edrbase"></edrbaseRef>
        </div>
        <div id="edritemurl" v-if="edritemFlag" style="margin-bottom: 10px">
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
              @updateSide="handleUpdateSide"
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
      </el-main>
    </el-container>

    <el-footer>
      <el-affix position="bottom" :offset="10">
        <div class="bottom-items">
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
} from "../../../api/query/index";
import { checkFeeWindowType, selectDist, saveDistBatch, getReleaseInquiryPage } from "@/api/prod";
import { dataOpertaor, useProductStore } from "@/store";
import moment from "moment";
import dayjs from "dayjs";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
import { useRouter, useRoute } from "vue-router";
const policyService = new PolicyService();
const productStore = useProductStore();
const { isCiJiMrk } = storeToRefs(productStore);

const route = useRoute();
const router = useRouter();

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
  dzmodal.open(copyPlyModel, { type: "", data: {} }).then((res: any) => {
    if (res.type === "ok") {
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

/**
 * 投保需要的按钮
 */
const basicBtn = [
  createFreeButtonBase({
    label: "保存模板",
    type: "primary",
    func: () => {},
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
  createFreeButtonBase({
    label: "历史赔案",
    type: "primary",
    func: () => {
      historyClaimcaseFun();
      // src\views\pcis-new-udr-list\common\history-claimcase-model.vue
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
  createFreeButtonBase({
    label: "历史赔案",
    type: "primary",
    func: () => {
      historyClaimcaseFun();
      // src\views\pcis-new-udr-list\common\history-claimcase-model.vue
    },
  }),
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

  const getRenewalAppPolicyres = await getRenewalAppPolicy({
    cPlyNo: props.param.cPlyNo,
    queryTyp: props.param.queryTyp,
  });

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
      //保险期间初始化
      const baseBefore = {};
      baseBefore["Base.tAppTm"] = moment(new Date()).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      baseBefore["Base.tInsrncBgnTm"] = moment(
        new Date(Date.now() + 1 * 1000 * 60 * 60 * 24)
      ).format("YYYY-MM-DD 00:00:00");
      baseBefore["Base.tInsrncEndTm"] = dayjs(baseBefore["Base.tInsrncBgnTm"])
        .add(1, "year")
        .format("YYYY-MM-DD 23:59:59");
      const tm = moment(baseBefore["Base.tInsrncEndTm"]).diff(
        moment(baseBefore["Base.tInsrncBgnTm"]),
        "days"
      );
      baseBefore["Base.cTmSysCde"] = tm;
      tmDay.value = tm;
      opertaor.getTableRefByKey("insrnc").setFormValue(baseBefore);
      //保单基本信息初始化
      const baseobj = {};
      baseobj["Base.cRenewMrk"] = "0";
      baseobj["Base.cIsNet"] = "0";
      baseobj["Base.cPolicySource"] = "1";
      opertaor.getTableRefByKey("plyBase").setFormValue(baseobj);
      //承保信息初始化
      const baseafterobj = {};
      baseafterobj["Base.cRatioTyp"] = "2";
      baseafterobj["Base.cInstMrk"] = "0";
      baseafterobj["Base.cDisptSttlCde"] = "B";
      baseafterobj["Base.cInsExchCde"] = "1";
      baseafterobj["Base.cPremExchCde"] = "1";
      baseafterobj["Base.cPrmCur"] = "CNY";
      baseafterobj["Base.cAmtCur"] = "CNY";
      baseafterobj["Applicant.cStkMrk"] = "0";
      baseafterobj["Applicant.cCustRiskRank"] = "925104";
      baseafterobj["Insured.cStkMrk"] = "0";
      baseafterobj["Insured.cCustRiskRank"] = "925104";
      opertaor.getTableRefByKey("base").setFormValue(baseafterobj);
      opertaor.getTableRefByKey("applicant").setFormValue(baseafterobj);
      opertaor.getTableRefByKey("insured").setFormValue(baseafterobj);
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
  } else if (props.param.cPlyNo === "orig") {
    bthList.value.push(
      createFreeButtonBase({
        label: "保存模板",
        type: "primary",
        func: () => {
          console.log(1313);
        },
      }),
      createFreeButtonBase({
        label: "复制出单",
        type: "primary",
        func: () => {},
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
    getAppPolicy({
      cAppNo: props.param.cAppNo,
      queryTyp: props.param.pageType,
    }).then((res) => {
      if (res) {
        const ops = opertaor.convertData(res);
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
          console.log(13123);
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
      label: "返回",
      func: () => {
        history.back();
      },
    })
  );

  if(props.param?.showBtn === false){
    bthList.value = [];
  }
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
    icVchTyp: "POLICY_NUMBER",
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
    }
  });
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

  appCalc(res).then((res: any) => {
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
      const payInfo = setPayInfo(ops["base"], ops["applicant"], ops["insrnc"]);
      console.log("生成缴费计划内容", payInfo);
      opertaor.getTableRefs()["payinfo"].setFormValue(payInfo);
      const ciInfo = setCiInfo(ops["base"]);
      opertaor.getTableRefs()["ci"].setFormValue(ciInfo); //生产联共保信息
      needCalc.value = false;
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
  pay["Pay.nPayablePrm"] = base["Base.nPrm"];
  pay["Pay.tPayBgnTm"] = moment(insrnc["Base.tAppTm"]).format(
    "YYYY-MM-DD HH:mm:ss"
  );
  pay["Pay.tPayEndTm"] = moment(insrnc["Base.tInsrncBgnTm"]).format(
    "YYYY-MM-DD HH:mm:ss"
  );
  pay["Pay.nOwnPrm"] = base["Base.nPrm"];
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
  ci["Ci.nCiPrm"] = base["Base.nPrm"];
  ci["Ci.cChiefMrk"] = "1"
  ci["Ci.cIssueMrk"] = "1"
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
  if (!checkNAmt()) return;
  const f = await savePlyInfo(); // 提交核保,需要默认执行一次保存操作
  if (f) {
    const btn = getBtn("btn010103");

    const res: any = {};
    nextTick(async () => {
      const rv = await opertaor.validateAll();
      if (!rv) {
        ElMessage.error("存在未录入数据,请确认!");
        return;
      }
      btn.loading = true;
      console.log(opertaor.getTableRefByKey("plyBase").getFromValue());
      const base = opertaor.getTableRefByKey("plyBase").getFromValue();
      res["user"] = user;
      res["appNo"] = base["Base.cAppNo"];

      console.log("申请核保参数-----", res);

      const params = opertaor.getParam();
      //:TODO 进行一次保费计算,如果发生保费变化,则告知需要进行保费计算
      const calcData: any = opertaor.getDataAll();
      calcData["user"] = user;
      calcData["plyBase"]["Base.cDptCde"] = params.cDptCde;
      calcData["plyBase"]["Base.cProdNo"] = params.cProdNo;
      console.log(calcData);
      // 重新进行保费计算
      const calBtn = getBtn("btn010101");
      try {
        calBtn.loading = true;
        const calcres: any = await appCalc(calcData);
        if (calcres.code === 200) {
          const newOp: any = opertaor.convertData(calcres);
          const newPrm = newOp.base["Base.nPrm"];
          const oldPrm = calcData.base["Base.nPrm"];
          if (newPrm === oldPrm) {
            const undr: any = await submitToUndr(res);
            btn.loading = false;
            console.log("submitToUndr-res", undr);
            if (undr["code"] == "200") {
              ElMessage.success(undr.msg);
              // 申请核保成功后按钮设置为不可点击
              const btn = getBtn("btn010103");
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
    if (base) {
      const baseRef = opertaor.getTableRefByKey("base");
      baseRef.setFormValue(base);
    }
    if (plyBase) {
      const plyBaseRef = opertaor.getTableRefByKey("plyBase");
      plyBaseRef.setFormValue(plyBase);
    }
    saveFlag = true;
    if(props.param?.pageType === "copy" && saveDistBatchFlag.value) {
      // 保存清单
      const appNo = plyBase["Base.cAppNo"];
      saveDist(appNo);
    }

    // 保存后替换路由参数
    router.replace({path: route.path, name: route.name, query: {
        param: JSON.stringify({
        ... route.params.param,
        ... {
          cAppNo: plyBase["Base.cAppNo"]
        }
      })
    }});
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
      const nPrmVar = ops["plyBase"]["Base.nPrmVar"];
      const payInfo = setPayInfoEdr(
        ops["payinfo"],
        ops["base"],
        ops["applicant"],
        nPrmVar,
        ops["plyBase"]
      );
      console.log("生成缴费计划内容", payInfo);
      opertaor.getTableRefs()["payinfo"].setFormValue(payInfo);
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
const submitEdrToUndrSurrender = () => {
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
      res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"] =
        res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"].split(
          ","
        );
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
const submitEdrToUndrFun = () => {
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
});
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

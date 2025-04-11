<!-- 用户管理 -->
<template>
  <div>
    <el-container>
      <el-main>
        <el-container>
          <el-aside :width="(NavigaShow ? 200 : 100) + 'px'">
            <el-affix :offset="150">
              <div class="navi_container">
                <div
                  v-for="(pageConfig, v) in formconfig1"
                  :key="v"
                  class="NavigaList_card"
                >
                  <el-anchor :bound="120" :offset="80">
                    <el-anchor-link
                      :href="`#underwriteurl`"
                      v-if="underwriteFlag"
                    >
                      <rt-icon
                              style="margin-right: 14px"
                              :item="{icon: 'Tickets'}"
                      />
                      <span style="font-size: 15px" v-if="NavigaShow">核保处理</span>
                    </el-anchor-link>
                    <el-anchor-link :href="`#edrbaseurl`" v-if="edrbaseFlag">
                      <rt-icon
                              style="margin-right: 14px"
                              :item="{icon: 'Tickets'}"
                      />
                      <span style="font-size: 15px" v-if="NavigaShow">批改信息</span>
                    </el-anchor-link>
                    <el-anchor-link :href="`#edritemurl`" v-if="edritemFlag">
                      <rt-icon
                              style="margin-right: 14px"
                              :item="{icon: 'Tickets'}"
                      />
                      <span style="font-size: 15px" v-if="NavigaShow">批改比较项</span>
                    </el-anchor-link>
                    <el-anchor-link
                      v-for="(k, i) in pageConfig?.pageInfo"
                      :key="i"
                      :href="`#${k.pageKey}`"
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
                        {{ k.pageTtile }}
                      </span>
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
          <el-container>
            <el-header height="60px">
              <el-affix
                :offset="95"
                style="text-align: center; padding: 5px; background: #ebedfc"
              >
                <div class="tp" style="background: #ebedfc">
                  <span style="font-weight: bold">条款：</span
                  ><span class="publicStyle"
                    >{{ props.param.cTermNo }}&nbsp;&nbsp;{{
                      props.param.cNmeCn
                    }}</span
                  >&nbsp;|&nbsp;<span style="font-weight: bold">出单方式：</span
                  ><span class="publicStyle">核心出单</span>&nbsp;|
                  <span class="publicStyle">非共保业务</span> |
                  <span class="publicStyle">{{
                    props.param.cGrpMrk == "0" ? "个单" : "团单"
                  }}</span>
                </div>
                <div class="btm" style="background: #ebedfc">
                  <span style="font-weight: bold">保险期限：</span
                  ><span class="publicStyle">{{ tmDay }}</span
                  >&nbsp;|&nbsp;<span style="font-weight: bold">保额：</span
                  ><span class="publicStyle">{{ nAmt }}</span
                  >&nbsp;<span style="font-weight: bold">元</span
                  >&nbsp;|&nbsp;<span style="font-weight: bold">保费为: </span
                  ><span class="publicStyle">{{ nPrm }}</span
                  >&nbsp;<span style="font-weight: bold">元</span>
                </div>
              </el-affix>
            </el-header>
            <el-main>
       
              <div
                id="underwriteurl"
                v-if="underwriteFlag"
                style="margin-bottom: 10px"
              >
                <underwriteRef
                  :param="props.param"
                  ref="underwrite"
                ></underwriteRef>
              </div>
              <div
                id="edrbaseurl"
                v-if="edrbaseFlag"
                style="margin-bottom: 10px"
              >
                <edrbaseRef :param="props.param" ref="edrbase"></edrbaseRef>
              </div>
              <div
                id="edritemurl"
                v-if="edritemFlag"
                style="margin-bottom: 10px"
              >
                <edritemRef :param="props.param" ref="edritem"></edritemRef>
              </div>

   
              <template v-for="(pageConfig, v) in formconfig1" :key="v">
                <div
                  class="card_"
                  v-for="(k, i) in pageConfig?.pageInfo"
                  :key="i"
                  :id="k.pageKey"
                >
                  <component
                    v-if="currentIndex >= i"
                    :ref="
                      (res) => {
                        opertaor.addTableRef(k.pageKey, res);
                      }
                    "
                    :is="
                      k.pageType === 'custom' ? k.pageCode : k.pageKey + '-ref'
                    "
                    :pageSchema="k.pageSchema"
                    :edrAll="edrAll"
                  />
                </div>
              </template>
            </el-main>
          </el-container>
        </el-container>
      </el-main>
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
    </el-container>
    <el-backtop :right="100" :bottom="100" />
    <!-- <amlExtendInfo ></amlExtendInfo> -->
    <invoiceInfoModel  v-if="invoiceShow"  @ok="close" ></invoiceInfoModel>
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
} from "../../../api/query/index";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import moment from "moment";
import dayjs from "dayjs";
import { useDzModal } from "@/common/dzmodel/DzModalService";

// 发票信息
import invoiceInfoModel from "@/views/pcis-new-udr-list/common/invoice-info-model.vue"
//  反洗钱
import amlExtendInfo from "@/views/pcis-main/prodDef/common/aml-extend-info/index.vue"

const CostInformation = defineAsyncComponent(
  () => import("@/views/pcis-new-udr-list/pages/CostInformation.vue")
);
// 历次批单 弹框页面
const PreviousdrOpnList = defineAsyncComponent(
  () => import("@/views/pcis-new-udr-list/common/PreviousdrOpnList.vue")
);
const opertaor = dataOpertaor();
opertaor.init();
const underwrite = ref(null);
const edrbase = ref(null);
const edritem = ref(null);
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
const tempFindBtn = [];
let underwriteFlag = ref(false);
let edrbaseFlag = ref(false);
let edritemFlag = ref(false);
let edrAll = false;//判断是否为批改场景
const user = JSON.parse(sessionStorage.getItem("user"));
const nAmt = ref("0.00");
const nPrm = ref("0.00");
const tmDay = ref(0);
const dzmodal = useDzModal();
const cacheKey =ref();


// 发票显示
let invoiceShow = ref(false);

//关闭
const close = ()=>{
  invoiceShow.value = false;
}
 
onBeforeMount(() => {
  console.log("路由参数props.param", props.param);
  initPage();
});

 /**
  * 发票信息
  */
const setTaxInfo = ()=>{
  console.log('发票信息',opertaor.getTableRefs());
    const tabref = opertaor.getTableRefs();
    const appLicantValue =tabref["applicant"].getFromValue()['Applicant.cAppNo'];  // 单据编号     
        if (!!appLicantValue) {
          invoiceShow.value = true;
        } else {

            ElMessage.error('请先保存单据')
            return;
        }      
}
  


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
        console.log('反洗钱扩展信息');

        // router.push({ path: '/about', query: { name: 'Vue 3' } });
        // src\views\pcis-main\prodDef\common\aml-extend-info\index.vue

    },
  }),
  createFreeButtonBase({
    label: "额度明细",
    type: "primary",
    func: () => {},
  })
];
/**
 * 一般批改按钮
 */
const edrBtn = [
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
 * 退保按钮
 * @type {FormButton[]}
 */
const edrSurrenderBtn = [
    createFreeButtonBase({
        id: 'btn010101',
        label: '保费计算',
        type: 'primary',
        func: () => {
            calcPremiumEdrSurrender();
        },
    }),
    createFreeButtonBase({
      id: 'btn010102',
      label: '保存',
      type: 'primary',
      func: () => {
          saveApplicationEdr();
      },
    }),
    createFreeButtonBase({
        id: 'btnCompare',
        label: '比较/生成批文',
        type: 'primary',
        func: () => {
            getSurrenderPrecisFun();
        },
    }),
    createFreeButtonBase({
        id: 'btn010103',
        label: '申请核保',
        type: 'primary',
        func: () => {
            // submitEdrToUndrSurrender();
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
            dzmodal
                .open(PreviousdrOpnList, { type: "Issuer", data: {} })
                .then((res: any) => {
                    if (res.type === "ok") {
                    }
                });
        },
    }),
    createFreeButtonBase({
        label: "任务痕迹",
        func: () => {
            dzmodal
                .open(CostInformation, { type: "Issuer", data: {} })
                .then((res: any) => {
                    if (res.type === "ok") {
                    }
                });
        },
    })
]
/**
 * 数据初始化
 * @param data
 */
const initPage = async () => {
  const getProductRes = await getProductPage({
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
    (props.param.pageType == "TEMPORARY_DEPOSIT" && props.param.cAppTyp == "E")||
    (props.param.pageType == "PLY_UW_PROCESS_SCENE" && props.param.cAppTyp == "E")||
    (props.param.pageType == "UW_READ_SCENE" && props.param.cAppTyp == "E")||
    (props.param.pageType == "readonly" && props.param.cAppTyp == "E")
  ) {
    edrbaseFlag.value = true;
    edritemFlag.value = true;
    edrAll=true;
    if(props.param.pageType === "EDR_APP_NEW_SCENE"&&props.param.cEdrType=='3'){
        edritemFlag.value = false;
    }
  } else {
    edrbaseFlag.value = false;
    edritemFlag.value = false;
    edrAll=false;
  }
  if(props.param.pageType === 'EDR_APP_NEW_SCENE'&&props.param.cEdrType=='3'){
      //退保不显示产品组件信息
      const formconfig11 = [{groupId: "",pageInfo:[]}];
      console.log("页面初始化返回数据", formconfig11);
      opertaor.setTableConfig(formconfig11);
      renderComponents();
  }else{
      // 页面初始化
      const formconfig11 = JSON.parse(getProductRes.data);
      console.log("页面初始化返回数据", formconfig11);
      opertaor.setTableConfig(formconfig11);
      renderComponents();
  }
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
  }, 100); // 延迟组件渲染,增加页面响应效率
}

/**
 * 页面加载后
 */
async function loadAfter() {
  console.log("setPage");
  console.log(props.param);
  // page.getRefTab("base").setFormValue(lowercaseKeys(props.param));
  if (props.param.pageType === "app") {
    //获取单号
    getCAppNoFun();
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
      opertaor.getTableRefByKey("plyBase").setFormValue(baseobj);
      //承保信息初始化
      const baseafterobj = {};
      baseafterobj["Base.cRatioTyp"] = "3";
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
      bthList.value = edrBtn;
      setTimeout(() => {
        opertaor.setDisabledAll();
        getEdrRsnItemFun(
          props.param["cProdNo"],
          props.param["cDptCde"],
          props.param["cEdrRsnBundleCde"],
          props.param["cEdrRsnBundleCde"],
          props.param["cEdrType"],
          props.param["cGrpMrk"]
        );
      }, 3000);
      edritem.value?.handleQuery();
    } else if (props.param.cAppTyp == "A") {
      bthList.value = basicBtn;
    }
  } else if (props.param.pageType === "PLY_UW_PROCESS_SCENE") {
    //核保处理
    setTimeout(() => {
      opertaor.setDisabledAll();
    }, 3000);
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
    edrbase.value?.setValue("EdrBase.cRatioTyp", "1");
    edrbase.value?.setValue("EdrBase.cEdrRsnBundleCde", props.param["cRsnCde"]);
    edrbase.value?.setValue("EdrBase.cEdrType", props.param["cEdrType"]);
    if(props.param.cEdrType=='1'){
        if (props.param["cRsnCde"] != "FZ") {
            edrbase.value?.setValue("EdrBase.cEdrRsnDetail", [
                props.param["cRsnCde"],
            ]);
        }
        setTimeout(() => {
            opertaor.setDisabledAll();
            getEdrRsnItemFun(
                props.param["cProdNo"],
                props.param["cDptCde"],
                props.param["cRsnCde"],
                props.param["cRsnCde"],
                props.param["cEdrType"],
                props.param["cGrpMrk"]
            );
        }, 3000);
        bthList.value = edrBtn;
    }else{
        bthList.value = edrSurrenderBtn;
    }
    loadAppPlyInfo(cAppNo);
  } else if (props.param.pageType === "readonly") {
    setTimeout(() => {
      opertaor.setDisabledAll();
    }, 3000);
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
    setTimeout(() => {
      opertaor.setDisabledAll();
    }, 3000);
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
        func: () => {},
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
          console.log(2)
          setTaxInfo();
        },
      }),
      createFreeButtonBase({
        label: "反洗钱扩展信息",
        type: "primary",
        func: () => {},
      }),
      createFreeButtonBase({
        label: "额度明细",
        type: "primary",
        func: () => {},
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
      }
    });
    bthList.value.push(
      createFreeButtonBase({
        label: "保存模板",
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
          console.log(3)
          setTaxInfo();
        },
      }),
      createFreeButtonBase({
        label: "反洗钱扩展信息",
        type: "primary",
        func: () => {},
      }),
      createFreeButtonBase({
        label: "额度明细",
        type: "primary",
        func: () => {},
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
        edrbase.value?.setFormValue(EdrBaseData);
      }
      ElMessage.success(res.msg);
      opertaor.setDataAll(ops);
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
  appCalc(res).then((res) => {
    btn.loading = false;
    console.log("appCalc-res", res);
    if (res["code"] == "200") {
      const ops = opertaor.convertData(res);
      console.log("保费计算转换的数据", ops);
      ElMessage.success(res.msg + "保费为：" + ops["base"]["Base.nPrm"]);
      opertaor.setDataAll(ops);
      nAmt.value = ops["base"]["Base.nAmt"];
      nPrm.value = ops["base"]["Base.nPrm"];
      tmDay.value = ops["base"]["Base.cTmSysCde"];
      const payInfo = setPayInfo(ops["base"], ops["applicant"], ops["insrnc"]);
      console.log("生成缴费计划内容", payInfo);
      opertaor.getTableRefs()["payinfo"].setFormValue(payInfo);
    } else {
      ElMessage.error(res.msg);
    }
    // ElMessage.success(res.msg);
    // history.back();
  });
};
const setPayInfo = (base, applicant, insrnc) => {
  const payList = [];
  const pay = {};
  pay["Pay.nTms"] = 1;
  if (applicant) {
    pay["Pay.cPayorCde"] = applicant["Applicant.cAppCde"];
    pay["Pay.cPayorNme"] = applicant["Applicant.cAppNme"];
  } else {
    pay["Pay.cPayorCde"] = "";
    pay["Pay.cPayorNme"] = "";
  }
  pay["Pay.nPayablePrm"] = base["Base.nPrm"];
  pay["Pay.tPayBgnTm"] = insrnc["Base.tAppTm"];
  pay["Pay.tPayEndTm"] = insrnc["Base.tInsrncBgnTm"];
  pay["Pay.nOwnPrm"] = base["Base.nPrm"];
  pay["Pay.cProdNo"] = base["Base.cProdNo"];
  pay["Pay.nPrmVar"] = !!base["Base.nPrm"] ? base["Base.nPrm"] : 0;
  payList.push(pay);
  return payList;
};
/**
 * 投保申请核保
 */
const submitToUndrFn = () => {
  const btn = getBtn("btn010103");
  btn.loading = true;
  const res = {};
  console.log(opertaor.getTableRefByKey("plyBase").getFromValue());
  const base = opertaor.getTableRefByKey("plyBase").getFromValue();
  res["user"] = user;
  res["appNo"] = base["Base.cAppNo"];
  console.log(res);
  submitToUndr(res).then((res) => {
    btn.loading = false;
    console.log("submitToUndr-res", res);
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
 * 额度明细弹窗
 */


/**
 * 投保单保存
 * **/
const savePlyInfo = () => {
  const btn = getBtn("btn010102");
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
  saveAppPlyInfo(res).then((res) => {
    console.log("saveAppPlyInfo-res", res);
    btn.loading = false;
    if (res["code"] == "200") {
      const ops = opertaor.convertData(res);
      console.log("转换的数据", ops);
      ElMessage.success(res.msg);
      opertaor.setDataAll(ops);
    } else {
      ElMessage.error(res.msg);
    }
    // ElMessage.success(res.msg);
    // history.back();
  });
};
/**
 * 获取批改项
 * **/
const getEdrRsnItemFun = (
  cProdNo,
  cDptCde,
  cRsnCde,
  cRsnDetailCde,
  cEdrType,
  cGrpMrk
) => {
  const res = {
    CProdNo: cProdNo,
    CDptCde: cDptCde,
    CRsnCde: cRsnCde,
    CRsnDetailCde: cRsnDetailCde,
    CEdrType: cEdrType,
    CGrpMrk: cGrpMrk,
  };
  getEdrRsnItem(res).then((res) => {
    if (res["code"] == "200") {
      const result = res["data"]["result"];
      const edrList = [];
      result.forEach((key) => {
        edrList.push(key["cEdrItem"]);
      });
      opertaor.setUnDisabledByKeyList(edrList); // 根据list集合,放开需要的要素
      ElMessage.success(res.msg);
    } else {
      ElMessage.error(res.msg);
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
  res["EdrBase"]["EdrBase.cEdrRsnDetail"] =res["EdrBase"]["EdrBase.cEdrRsnDetail"].join();
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
      nAmt.value = ops["base"]["Base.nAmt"];
      nPrm.value = ops["base"]["Base.nPrm"];
      tmDay.value = ops["base"]["Base.cTmSysCde"];
      const EdrBaseData = res["res"]["composition"]["EdrBase"][0];
      res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"] =res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"].split( "," );
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
    const res = {};
    res["user"] = user;
    res["EdrBase"] = edrbase.value?.getFromValue();
    calcSurrenEdr(res).then((res) => {
        btn.loading = false;
        console.log("批改计算", res);
        if (res["code"] == "200") {
            const ops = opertaor.convertData(res);
            ElMessage.success(
                res.msg +"保费为：" + res['res']['composition']['plyBase'][0]['Base.nPrm'] +
                "; 保费变化量为：" +res['res']['composition']['plyBase'][0]["Base.nPrmVar"]
            );
            opertaor.setDataAll(ops);
            nAmt.value = res['res']['composition']['plyBase'][0]["Base.nAmt"];
            nPrm.value = res['res']['composition']['plyBase'][0]["Base.nPrm"];
            tmDay.value = res['res']['composition']['plyBase'][0]["Base.cTmSysCde"];
            if (res["res"]["composition"]["EdrBase"]) {
                const EdrBaseData = res["res"]["composition"]["EdrBase"][0];
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
const saveApplicationEdr=()=>{
    const btn = getBtn("btn010102");
    btn.loading = false;
    const res = {};
    res["user"] = user;
    res["appNo"] = edrbase.value?.getFromValue()['EdrBase.cAppNo']?edrbase.value?.getFromValue()['EdrBase.cAppNo']:null;
    res["plyNo"] = edrbase.value?.getFromValue()['EdrBase.cPlyNo'];
    res["taskId"] = props.param.taskId?props.param.taskId:null;
    res["data"] = {};
    res["data"]["EdrBase"] = edrbase.value?.getFromValue();
    console.log(res);
    saveSurrenEdr(res).then((res) => {
        btn.loading = false;
        console.log("退保保存", res);
        if (res["code"] == "200") {
            const ops = opertaor.convertData(res);
            opertaor.setDataAll(ops);
            if (res["res"]["composition"]["EdrBase"]) {
                const EdrBaseData = res["res"]["composition"]["EdrBase"][0];
                edrbase.value?.setFormValue(EdrBaseData);
            }
        } else {
            ElMessage.error(res.msg);
        }
        // ElMessage.success(res.msg);
        // history.back();
    });
}

/**
 * 退保生成批文
 * **/
const getSurrenderPrecisFun = () => {
    const btn = getBtn("btnCompare");
    btn.loading = true;
    const res = {};
    res["user"] = user;
    res["EdrBase"] = edrbase.value?.getFromValue();
    res["Acctinfo"]={"Acctinfo.cAcctNo":null,"Acctinfo.cAcctNme":"","Acctinfo.cBankRelTyp":null,"Acctinfo.cBankPro":null,"Acctinfo.cBankArea":null,"Acctinfo.cAppNo":null}
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
  res["EdrBase"]["EdrBase.cEdrRsnDetail"] =res["EdrBase"]["EdrBase.cEdrRsnDetail"].join();
  console.log(res);
  saveEdrAppPlyInfo(res).then((res) => {
    console.log("saveAppPlyInfo-res", res);
    btn.loading = false;
    if (res["code"] == "200") {
      const ops = opertaor.convertData(res);
      console.log("转换的数据", ops);
      ElMessage.success(res.msg);
      opertaor.setDataAll(ops);
      const EdrBaseData = res["res"]["composition"]["EdrBase"][0];
      res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"] =res["res"]["composition"]["EdrBase"][0]["EdrBase.cEdrRsnDetail"].split( "," );
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
  res["taskId"] = props.param.taskId?props.param.taskId:null;
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
  res["user"]["opRelCde"] = "10030892";
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

opertaor.setFatherPage({
  currentIndex: currentIndex,
  lowercaseKeys: lowercaseKeys,
  getcacheKey: getcacheKey,
  setTmDay: setTmDay,
});
</script>

<style scoped>
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
</style>

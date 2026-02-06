<!-- 用户管理 -->
<template>
  <div>
    <el-container>
      <el-main>
        <el-container>
          <el-aside>
            <template v-for="(pageConfig, v) in formconfig1" :key="v">
              <el-affix :offset="0">
                <el-anchor :bound="120" :offset="10" container="#main-container" ref="anchorRef">
                  <el-anchor-link
                    v-for="(k, i) in pageConfig?.pageInfo"
                    :key="i"
                    :href="`#${k.pageKey}`"
                  >
                    <i :class="['icon','iconfont',iconMap[k.pageKey]]"></i>
                    <div class="icon-title">
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
                    </div>
                  </el-anchor-link>
                </el-anchor>
              </el-affix>
            </template>
          </el-aside>
          <el-container>
            <el-main id="main-container" style="padding: 10px;">
              <template v-for="(pageConfig, v) in formconfig1" :key="v">
                <div
                  v-for="(k, i, index) in pageConfig?.pageInfo"
                  :key="i"
                  :id="k.pageKey"
                >
                  <component
                    v-if="currentIndex >= index"
                    :ref="
                      (res) => {
                        opertaor.addTableRef(k.pageKey, res);
                      }
                    "
                    :is="k.pageRef + '-ref'"
                  />
                </div>
              </template>
            </el-main>
          </el-container>
        </el-container>
      </el-main>
    </el-container>
    <el-backtop :right="100" :bottom="100" style="background-color: #dcf9fd" />
  </div>
</template>

<script setup lang="ts">
import { getProdInfos, getInquiryPage } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { dataParam } from "@/store/modules/dataParam";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
import { useRoute } from "vue-router";

const route = useRoute();
const dataparam = dataParam();
const idxParam: IdxParamProps = {
  opertaorProps: { id: route.name },
  cdeListViewProps: { id: route.name },
  // handleAnchorClick: handleAnchorClick,
};
provide(idxParamKey, idxParam);
const opertaor = dataOpertaor(idxParam.opertaorProps);
opertaor.init();

const props = defineProps({
  param: {
    type: Object,
  },
});

const param = props.param;
dataparam.setParam(param);

const formconfig1 = opertaor.getTableConfig();
// 当前加载的组件索引
const currentIndex = ref(0);
const prodauditConfig = {
  pageKey: "prodaudit",
  pageTtile: "产品审核",
  pageRef: "prodaudit",
};

opertaor.setTableConfig([
  {
    groupId: "",
    showGroupId: false,
    pageInfo: {
      prodaudit: {
        pageKey: "prodaudit",
        pageTtile: "产品审核",
        pageRef: "prodaudit",
      },
      prodInfo: {
        pageKey: "prodInfo",
        pageTtile: "产品基本信息",
        pageRef: "prodInfo",
      },
      relatedMainInsurance: {
        pageKey: "relatedMainInsurance",
        pageTtile: "关联主条款",
        pageRef: "relatedMainInsurance",
      },
      // factoryrelatedAdditionalIns: {
      //   pageKey: "factoryrelatedAdditionalIns",
      //   pageTtile: "关联附加条款",
      //   pageRef: "factoryrelatedAdditionalIns",
      // },
      specialAgreement: {
        pageKey: "specialAgreement",
        pageTtile: "关联特别约定",
        pageRef: "specialAgreement",
      },
      // healthNotice: {
      //   pageKey: "healthNotice",
      //   pageTtile: "关联健康告知",
      //   pageRef: "healthNotice",
      // },
      // relatedInsuranceLiability: {
      //   pageKey: "relatedInsuranceLiability",
      //   pageTtile: "关联条款责任",
      //   pageRef: "relatedInsuranceLiability",
      // },
      relatedBusinessRules: {
        pageKey: "relatedBusinessRules",
        pageTtile: "关联业务规则",
        pageRef: "relatedBusinessRules",
      },
      relatedPremCalcuRules: {
        pageKey: "relatedPremCalcuRules",
        pageTtile: "关联保费计算规则",
        pageRef: "relatedPremCalcuRules",
      },
      relatedPayOrderConf: {
        pageKey: "relatedPayOrderConf",
        pageTtile: "关联见费出单配置",
        pageRef: "relatedPayOrderConf",
      },
      planConfigration: {
        pageKey: "planConfigration",
        pageTtile: "计划配置",
        pageRef: "planConfigration",
      },
      rateConfiguration: {
        pageKey: "rateConfiguration",
        pageTtile: "费率配置",
        pageRef: "rateConfiguration",
      },
      InstituTaxRateAllocat: {
        pageKey: "InstituTaxRateAllocat",
        pageTtile: "机构税率配置",
        pageRef: "InstituTaxRateAllocat",
      },
      assoCorrPreCalculFormula: {
        pageKey: "assoCorrPreCalculFormula",
        pageTtile: "关联批改保费计算公式",
        pageRef: "assoCorrPreCalculFormula",
      },
      prodComponent: {
        pageKey: "prodComponent",
        pageTtile: "页面组件绑定",
        pageRef: "prodComponent",
      },
      // priceComponent: {
      //   pageKey: "priceComponent",
      //   pageTtile: "询价页面配置",
      //   pageRef: "priceComponent",
      // },
    },
  },
]);

const btns = {};
const anchorRef = ref(null);
onMounted(() => {
  formconfig1.forEach((ele) => {
    if (param.type !== "approve" || param.editType === "view") {
      delete ele.pageInfo.prodaudit;
    } else if (!ele.pageInfo.prodaudit) {
      ele.pageInfo.prodaudit = { ...prodauditConfig };
    }
  });
  renderComponents();
  nextTick(() => {
    const keys = Object.keys(formconfig1[0].pageInfo)
    const href = '#' + formconfig1[0].pageInfo[keys[0]]?.pageKey
    anchorRef.value[0]?.scrollTo(href);
  })
});

function renderComponents() {
  const interval = setInterval(() => {
    if (currentIndex.value < 15) {
      currentIndex.value++;
    } else {
      loadAfter(); //页面加载完成之后,再加载后续所需的事件
      clearInterval(interval);
    }
  }, 100); // 延迟组件渲染,增加页面响应效率
}
function loadAfter() {
  if (param.editType === "edit") {
    nextTick(() => {
      getProdInfos(param)
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
            setTimeout(() => {
              setData(data);
            }, 100);
          } else {
            ElMessage.error(msg);
          }
        })
        .finally(() => {});
      getInquiryPage(param)
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
            setTimeout(() => {
              setData({ priceComponent: data});
            }, 100);
          } else {
            ElMessage.error(msg);
          }
        })
        .finally(() => {});
    });
  }
}
// function fileterAside(val: string) {
//   pageconfig.forEach((element) => {
//     if (element.pageKey === "prodaudit") {
//     }
//   });
// }
function setData(datas: any) {
  Object.keys(datas).forEach((k) => {
    const ref = opertaor.getTableRefByKey(k);
    if(ref?.setFormValue) {
      ref.setFormValue(datas[k]);
    }
  });
}

const iconMap = {
  'prodInfo': 'icon-wenjianban1',
  'relatedMainInsurance': 'icon-zaibaoxinxi',
  'specialAgreement': 'icon-anjiantiaocha',
  'relatedBusinessRules': 'icon-lishiyijian',
  'relatedPremCalcuRules': 'icon-qitafeiyong',
  'relatedPayOrderConf': 'icon-yufuxinxi',
  'planConfigration': 'icon-xianbiexinxi',
  'rateConfiguration': 'icon-jiaonafeiyong',
  'InstituTaxRateAllocat': 'icon-jinetiaozheng',
  'assoCorrPreCalculFormula': 'icon-yishoubaodan',
  'prodComponent': 'icon-tiaoduxinxi',
  'priceComponent': 'icon-tiaodumingxi',
}
</script>

<style lang="scss" scoped>
.el-main {
  padding: 0;
  height: calc(100vh - 45px - 34px);
  overflow: hidden;
  overflow-y: auto;
  .el-aside {
    width: auto;
    .el-affix {
      height: 100%;
      background: var(--el-color-primary);
    }
  }
}
:deep(.el-anchor) {
  background: transparent;
  .el-anchor__list {
    padding: 20px 10px;
    .el-anchor__item {
      margin-bottom: 20px;
      .el-anchor__link {
        font-size: 14px;
        color: #FFF;
        text-align: center;
        padding: 0;
        opacity: 0.6;
        display: flex;
        &.isActive{
          background: var(--el-color-primary);
          :deep(a) {
            color: var(--menu-active-text);
            .iconfont {
              color: var(--menu-active-text);
            }
          }
        }
        &:hover {
          background: var(--menu-hover);
          :deep(a) {
            color: var(--el-color-primary);
            .iconfont {
              color: var(--el-color-primary);
            }
          }
        }
        .iconfont {
          font-size: 1.2rem;
          color: #FFF;
          margin-right: 5px;
        }
      }
    }
  }
}
</style>

<!-- 用户管理 -->
<template>
  <div :class="{ 'dialog-mode': param?.inDialog }">
    <el-container>
      <el-main>
    <el-container>
          <el-aside :class="{ collapsed: asideCollapsed }">
            <template v-for="(pageConfig, v) in formconfig1" :key="v">
              <el-affix :offset="0">
                
                <el-anchor :bound="120" :offset="10" container="#main-container" ref="anchorRef">
                  <el-anchor-link
                    v-for="(k, i) in pageConfig?.pageInfo"
                    :key="i"
                    :href="`#${k.pageKey}`"
                  >
                    <el-tooltip
                      effect="dark"
                      :content="k.pageTtile || ''"
                      placement="top-start"
                      :disabled="!(asideCollapsed || (k.pageTtile && k.pageTtile.length > 6))"
                    >
                      <div class="anchor-item">
                        <i :class="['icon', 'iconfont', iconMap[k.pageKey]]"></i>
                        <div v-if="!asideCollapsed" class="icon-title">
                          <template v-if="k.pageTtile && k.pageTtile.length > 6">
                            {{ k.pageTtile.substring(0, 6) + "..." }}
                          </template>
                          <template v-else>
                            {{ k.pageTtile }}
                          </template>
                        </div>
                      </div>
                    </el-tooltip>
                  </el-anchor-link>
                </el-anchor>
                <div class="aside-toggle" @click="toggleAside">
                  <el-icon>
                    <Fold v-if="!asideCollapsed" />
                    <Expand v-else />
                  </el-icon>
                </div>
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
    <el-backtop
      v-if="!param?.inDialog"
      :right="100"
      :bottom="100"
      style="background-color: #dcf9fd"
    />
  </div>
</template>

<script setup lang="ts">
import { getProdInfos } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { dataParam } from "@/store/modules/dataParam";
import { createCopyData } from "@/utils/copy";
import { idxParamKey, IdxParamProps } from "@/views/pcis/support/useIdxParam";
import { useRoute } from "vue-router";
import { Expand, Fold } from "@element-plus/icons-vue";

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
const asideCollapsed = ref(false);
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
      prodComponent: {
        pageKey: "prodComponent",
        pageTtile: "页面组件绑定",
        pageRef: "prodComponent",
      },
    },
  },
]);

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
  const total = formconfig1.reduce((sum, ele) => {
    return sum + Object.keys(ele.pageInfo || {}).length;
  }, 0);
  const interval = setInterval(() => {
    if (currentIndex.value < total - 1) {
      currentIndex.value++;
    } else {
      loadAfter(); //页面加载完成之后,再加载后续所需的事件
      clearInterval(interval);
    }
  }, 100); // 延迟组件渲染,增加页面响应效率
}
function loadAfter() {
  if (param.editType === "edit" || param.editType === "copy") {
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
    });
  }
}
function setData(datas: any) {
  Object.keys(datas).forEach((k) => {
    const ref = opertaor.getTableRefByKey(k);
    if(ref?.setFormValue) {
      const currentData =
        param.editType === "copy" ? createCopyData(datas[k], ["cProdNo"]) : datas[k];
      ref.setFormValue(currentData);
    }
  });
}

function toggleAside() {
  asideCollapsed.value = !asideCollapsed.value;
}

const iconMap = {
  'prodInfo': 'icon-wenjianban1',
  'relatedMainInsurance': 'icon-zaibaoxinxi',
  'specialAgreement': 'icon-anjiantiaocha',
  'prodComponent': 'icon-tiaoduxinxi',
}
</script>

<style lang="scss" scoped>
.el-main {
  padding: 0;
  height: calc(100vh - 45px - 34px);
  overflow: hidden;
  overflow-y: auto;
  .el-aside {
    width: 180px;
    transition: width 0.2s ease;
    .el-affix {
      height: 100%;
      background: var(--el-color-primary);
      position: relative;
    }
    &.collapsed {
      width: 64px;
    }
  }
}

.dialog-mode {
  .el-main {
    height: calc(78vh - 34px);
  }
}
:deep(.el-anchor) {
  background: transparent;
  .el-anchor__list {
    padding: 20px 10px 64px;
    .el-anchor__item {
      margin-bottom: 20px;
      .el-anchor__link {
        font-size: 14px;
        color: #FFF;
        text-align: center;
        padding: 0;
        opacity: 0.6;
        display: flex;
        align-items: center;
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

.aside-toggle {
  height: 34px;
  width: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  position: absolute;
  right: 10px;
  bottom: 10px;
}

.anchor-item {
  display: flex;
  align-items: center;
}

.el-aside.collapsed {
  :deep(.iconfont) {
    margin-right: 0;
  }
}
</style>

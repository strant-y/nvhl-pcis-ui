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
                    @prod-data-loaded="handleProdDataLoaded"
                    @prod-saved="handleProdSaved"
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
import { getProdInfos, associationTerm, associationSpec, saveProdPages } from "@/api/prod";
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
  if (param.editType === "edit" || param.editType === "copy" || param.editType === "view") {
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
    // 复制模式下，prodInfo 由组件自行查询并处理 cProdNo 清空逻辑，跳过父级赋值
    if (param.editType === "copy" && k === "prodInfo") {
      return;
    }
    const ref = opertaor.getTableRefByKey(k);
    if(ref?.setFormValue) {
      const currentData =
        param.editType === "copy" ? createCopyData(datas[k], ["cProdNo"]) : datas[k];
      ref.setFormValue(currentData);
    }
  });
}

/**
 * 复制模式下，产品基本信息数据加载完成后触发
 * 在此时清空产品编码，确保数据已回显
 */
function handleProdDataLoaded() {
  const prodInfoRef = opertaor.getTableRefByKey("prodInfo");
  if (prodInfoRef && typeof prodInfoRef.clearCopyProdNo === 'function') {
    prodInfoRef.clearCopyProdNo();
  }
}

/**
 * 复制模式下，产品基本信息保存成功后触发
 * 用新 cProdNo 将关联主条款、关联特别约定、页面组件绑定数据重新保存绑定
 * @param newProdNo 保存后返回的新产品编码
 */
function handleProdSaved(newProdNo: string) {
  const opCde = JSON.parse(sessionStorage.getItem("user") || "{}").opCde;

  // 保存关联主条款数据
  const relatedMainInsuranceRef = opertaor.getTableRefByKey("relatedMainInsurance");
  if (relatedMainInsuranceRef && typeof relatedMainInsuranceRef.getTableData === 'function') {
    const termList = relatedMainInsuranceRef.getTableData();
    if (termList && termList.length > 0) {
      // 提取条款编码，逗号拼接，与原始 associationTerm 调用方式一致
      const cTermNo = termList.map((item: any) => item.cTermNo).filter(Boolean).join(",");
      if (cTermNo) {
        const newParam = {
          userId: opCde,
          cCrtCde: opCde,
          cUpdCde: opCde,
          cTermNo,
          cProdNo: newProdNo,
          cTyp: "0",
        };
        associationTerm(newParam).then((res: any) => {
          if (res.code !== 200) {
            ElMessage.error(res.msg || "关联主条款保存失败");
          }
        });
      }
    }
  }

  // 保存关联特别约定数据
  const specialAgreementRef = opertaor.getTableRefByKey("specialAgreement");
  if (specialAgreementRef && typeof specialAgreementRef.getTableData === 'function') {
    const specList = specialAgreementRef.getTableData();
    if (specList && specList.length > 0) {
      // 清理旧关联字段，只保留创建新关联所需的字段
      const webPrdProdSpecRelDTOList = specList.map((item: any) => ({
        cSpecNo: item.cSpecNo,
        cNmeCn: item.cNmeCn,
        cIfEdit: item.cIfEdit === true || item.cIfEdit === "1" ? "1" : "0",
        cIfMust: item.cIfMust === true || item.cIfMust === "1" ? "1" : "0",
      }));
      const cSpecNo = specList.map((item: any) => item.cSpecNo).filter(Boolean).join(",");
      if (cSpecNo) {
        const newParam = {
          userId: opCde,
          cCrtCde: opCde,
          cUpdCde: opCde,
          webPrdProdSpecRelDTOList,
          cSpecNo,
          cProdNo: newProdNo,
        };
        associationSpec(newParam).then((res: any) => {
          if (res.code !== 200) {
            ElMessage.error(res.msg || "关联特别约定保存失败");
          }
        });
      }
    }
  }

  // 保存页面组件绑定数据
  const prodComponentRef = opertaor.getTableRefByKey("prodComponent");
  if (prodComponentRef && typeof prodComponentRef.getTableData === 'function') {
    const pages = prodComponentRef.getTableData();
    if (pages && pages.length > 0) {
      const prodInfoRef = opertaor.getTableRefByKey("prodInfo");
      const prodInfoData = prodInfoRef?.getFromValue() || {};
      prodInfoData.cProdNo = newProdNo;
      const params = Object.assign(prodInfoData, { pages });
      saveProdPages(params).then((res: any) => {
        if (res.code !== 200) {
          ElMessage.error(res.msg || "页面组件绑定保存失败");
        }
      });
    }
  }
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

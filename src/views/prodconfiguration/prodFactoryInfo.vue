
<template>
  <div :class="{ 'dialog-mode': param?.inDialog }">
    <el-container>
      <el-main>
    <el-container>
          <ProdSidebar
            ref="sidebarRef"
            :page-configs="formconfig1"
            :collapsed="asideCollapsed"
            :icon-map="iconMap"
            container="#main-container"
            @toggle="toggleAside"
          />
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
import ProdSidebar from "./components/ProdSidebar.vue";

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
const approvalProgressConfig = {
  pageKey: "approvalProgress",
  pageTtile: "审批进度",
  pageRef: "approvalProgress",
};
const currentApprovalConfig = {
  pageKey: "currentApproval",
  pageTtile: "当前审批",
  pageRef: "currentApprovalFlow",
};

opertaor.setTableConfig([
  {
    groupId: "",
    showGroupId: false,
    pageInfo: {
      approvalProgress: {
        pageKey: "approvalProgress",
        pageTtile: "审批进度",
        pageRef: "approvalProgress",
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
      currentApproval: {
        pageKey: "currentApproval",
        pageTtile: "当前审批",
        pageRef: "currentApprovalFlow",
      },
    },
  },
]);

const sidebarRef = ref(null);
onMounted(() => {
  formconfig1.forEach((ele) => {
    // 审批进度：仅在 approve 模式下显示（含查看），置于顶部
    if (param.type !== "approve") {
      delete ele.pageInfo.approvalProgress;
    } else if (!ele.pageInfo.approvalProgress) {
      ele.pageInfo.approvalProgress = { ...approvalProgressConfig };
    }
    // 当前审批：仅在 approve 模式下显示（含查看），置于底部
    if (param.type !== "approve") {
      delete ele.pageInfo.currentApproval;
    } else if (!ele.pageInfo.currentApproval) {
      ele.pageInfo.currentApproval = { ...currentApprovalConfig };
    }
  });
  renderComponents();
  nextTick(() => {
    const keys = Object.keys(formconfig1[0].pageInfo)
    const href = '#' + formconfig1[0].pageInfo[keys[0]]?.pageKey
    sidebarRef.value?.scrollTo(href);
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
      getProdInfos({...param, cProdNo: param.prodNo})
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
  'approvalProgress': 'icon-shenhelishi',
  'currentApproval': 'icon-shenhexinxi',
  'prodInfo': 'icon-wenjianban1',
  'relatedMainInsurance': 'icon-zaibaoxinxi',
  'specialAgreement': 'icon-anjiantiaocha',
  'prodComponent': 'icon-tiaoduxinxi',
}
</script>

<style lang="scss" scoped>
.el-main {
  padding: 0;
  height: calc(100vh - 45px - 44px);
  overflow: hidden;
  overflow-y: auto;
}

.dialog-mode {
  .el-main {
    height: calc(78vh - 34px);
  }
}
</style>

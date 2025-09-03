<template>
  <div class="main-content" v-loading="loading">
    <div class="left_content">
      <div class="_anchor" style="overflow: auto">
        <anchor-comp :anchor-list="pageView.anchorConfig" @collapse-change="activeChange"/>
      </div>
    </div>
    <div class="center_content">
      <div id="positeList" style="margin-bottom: 7px;">
        <posite-list v-show="positeListShow" :prod-list="productList" @prod-list-change="prodListChange"/>
      </div>
      <template v-if="pageView.pageConfig[0]">
        <group-common
            :group-id="pageView.pageConfig[0].groupId"
            :group-config="pageView.pageConfig[0]"
            :index="0"
        />
      </template>
      <template v-for="(group, idx) in pageView.pageConfig" :key="idx">
        <group-form
            v-if="idx > 0"
            :group-id="group.groupId"
            :group-config="group"
            :index="idx"
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
    <div class="right-sidebar-trigger">
      <el-popover
          placement="left"
          trigger="click"
          :width="120"
          popper-class="action-menu-popper"
      >
        <template #reference>
          <el-button
              circle
              class="menu-trigger"
          >
            <img src="@/assets/icons/ExpandLeft.svg" alt="Expand Left" width="30" height="30" />
          </el-button>
        </template>
        <div class="btns-content">
          <el-button
              v-for="(btn, idx) in rightBtnList"
              :key="idx"
              :icon="btn.icon"
              @click="btn.func"
              style="margin-bottom: 1px;"
              class="flex-center"
          >
            <svg-icon
                v-if="btn.svgIcon"
                :icon-class="btn.svgIcon"

                :size="(btn.iconSize || '16') + 'px'"
                style="margin-right: 8px; transition: all 0.3s"
            />
            <span>{{ btn.label }}</span>
          </el-button>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import anchorComp from './component/anchor/anchor.vue';
import type { AnchorItem } from './component';
import {useDzModal} from "@/common/dzmodel/DzModalService";
import {
  CompositePageView,
  POSITE_PAGE_TYPE_APP,
  POSITE_PAGE_TYPE_EDR,
  POSITE_PAGE_TYPE_READ,
  POSITE_PAGE_TYPE_SAVE,
  POSITE_PAGE_TYPE_UNDR,
} from "@/views/pcis/support/composite.types";
import positeList from "@/views/pcis/composite/component/posite-list/index.vue";
import groupForm from "@/views/pcis/composite/component/group-form/group-form.vue";
import groupCommon from "@/views/pcis/composite/component/group-form/group-common.vue";
import SvgIcon from "@/components/SvgIcon/index.vue";
import {createFreeButtonBase, FreeButtonBase} from "@/shared/button-config";
import positeApi from "@/api/posite";

const props:any = defineProps({
  param: {
    type: Object,
  },
});

const router = useRouter();
const dzmodal = useDzModal();
const pageView = ref<CompositePageView>(new CompositePageView());
provide("pageView", pageView);
const positeListShow = ref<boolean>(false);
const productList = ref<any[]>([]);
const loading = ref(false);

const rightBtnList = ref<FreeButtonBase[]>();

const bthList = ref<FreeButtonBase[]>([
  createFreeButtonBase({
    label: "保费计算",
    type: "primary",
    id: "btn010101",
    func: () => {
    },
  }),
  createFreeButtonBase({
    label: "保存",
    type: "primary",
    id: "btn010102",
    func: () => {
      const allData = pageView.value.getPageAllData();
      console.log('allData', allData);
      positeApi.savePositeInfo({param: props.param, data: allData}).then((res: any) => {
        console.log('savePositeInfo-res', res);
      });
    },
  }),
  createFreeButtonBase({
    label: "申请核保",
    type: "primary",
    id: "btn010103",
    func: () => {
    },
  }),
]);


onBeforeMount(() => {
  console.log('props.param', props.param);
  if(props.param) {
    const pageType = props.param.pageType;
    loading.value = true;
    // 初始化产品信息
    productList.value = props.param.cProdDtlList.map((item: any) => {
      return {
        cKindNo: item.cProdNo.substring(0, 2),
        cProdNo: item.cProdNo,
      }
    });
    // 存储路由参数
    pageView.value.setPageParams(props.param);
    // 初始化页面结构
    pageView.value.buildPage(props.param.cProdDtlList, pageBuildAfter).then((result: any) => {
      console.log('onBeforeMount - pageView.buildPage result: ', result);
      nextTick(() => {
        // 页面加载完后再显示产品列表组件
        positeListShow.value = true;
        if(pageType === POSITE_PAGE_TYPE_APP) {
          // 申请
          appInit();
          loading.value = false;
        }else {
          // 暂存、 批改、核保、查看 查询
          positeApi.queryPositeInfo({...props.param, ...{queryType: pageType}}).then((res: any) => {
            if (res && res.code === 200) {
              const resultData = res.data;
              if(pageType === POSITE_PAGE_TYPE_SAVE) {
                saveInit(resultData)
              }else if(pageType === POSITE_PAGE_TYPE_UNDR) {
                undrInit(resultData)
              }else if(pageType === POSITE_PAGE_TYPE_EDR) {
                edrInit(resultData)
              }else if(pageType === POSITE_PAGE_TYPE_READ) {
                readInit(resultData)
              }
            } else {
              ElMessage.error(res ? res.msg : "初始化请求异常");
            }
          }).catch((err) => {
            ElMessage.error(err);
          }).finally(() => {
            loading.value = false;
          });
        }
      });
    });
  }
});

/**
 * 页面结构数据组装完之后 组件开始加载之前执行
 * @param config
 */
const pageBuildAfter = (config: any) => {
  if(!config) return {};
  const {anchorConfig, pageConfig} = config;
  const pageType = props.param.pageType;
  if (pageType === POSITE_PAGE_TYPE_SAVE) {

  } else if (pageType === POSITE_PAGE_TYPE_UNDR) {

  } else if (pageType === POSITE_PAGE_TYPE_EDR) {

  } else if (pageType === POSITE_PAGE_TYPE_READ) {

  }
  return {
    anchorConfig: anchorConfig,
    pageConfig: pageConfig,
  }
};

function appInit() {
  console.log('appInit');
}
function saveInit(pageData: any) {
  pageView.value.setPageAllData(pageData);
  console.log('saveInit', pageData);
}
function edrInit(pageData: any) {
  pageView.value.setPageAllData(pageData);
  pageView.value.setPageDisabledAll();
  pageView.value.setPageUnDisabledByKeyList([]);
  console.log('edrInit', pageData);
}
function undrInit(pageData: any) {
  pageView.value.setPageAllData(pageData);
  pageView.value.setPageDisabledAll();
  console.log('undrInit', pageData);
}
function readInit(pageData: any) {
  pageView.value.setPageAllData(pageData);
  pageView.value.setPageDisabledAll();
  console.log('readInit', pageData);
}

const prodListChange = (list: any[]) => {
  loading.value = true;
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
  });
  pageView.value.buildPage(list, pageBuildAfter).then((result: any) => {
    console.log('prodListChange - pageView.buildPage result: ', result);
  }).finally(() => {
    loading.value = false;
  });
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

const getNewParams = (param: any) => {
  return {
    ...props.param,
    ...param
  };
}
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
  top: 89px;
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
  margin-left: 260px; /* 与侧边栏宽度保持一致 */
  max-width: calc(100% - 260px);
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

<template>
  <div class="mypage-app">
    <el-container class="dynamic-container" ref="scrollContainer">
      <el-aside :width="(NavigaShow ? 200 : 100) + 'px'">
        <!-- <el-affix :offset="100"> -->
          <div class="navi_container">
            <div
                v-for="(pageConfig, v) in formPage.config"
                :key="v"
                class="NavigaList_card"
            >
              <el-anchor :bound="120" :offset="80">
                <el-anchor-link
                    v-for="(k, i) in pageConfig?.pageInfo"
                    :key="i"
                    :custom="true"
                    v-show="['AgreementCiShare', 'AgreementCi', 'AgreementCiTcp'].includes(k.pageCode) ? isCiJiMrk : true"
                    @click="handleAnchorClick($event, `#${k.pageCode}`)"
                    :class="i === 0 ? 'isActive' : ''"
                >
                  <!-- <rt-icon
                      style="margin-right: 14px"
                      :item="{ icon: k.icon && k.icon !== 'null' && k.icon !== '' ? k.icon : 'Tickets', }"
                  /> -->
                  <i :class="['icon','iconfont',iconMap[k.pageKey]]"></i>
                  <span class="icon-title" v-if="NavigaShow">
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
      <el-main>
        <template v-for="(pageConfig, v) in formPage.config" :key="v">
          <div
              class="card_"
              v-for="(k, i) in pageConfig?.pageInfo"
              :key="i"
              :id="k.pageCode"
              v-show="['AgreementCiShare', 'AgreementCi', 'AgreementCiTcp'].includes(k.pageCode) ? isCiJiMrk : true"
          >
            <component
                :ref="(res: any) => {
                  formPage.setComponentRef(k.pageCode, res);
                }
              "
                :is="getConmpName(k)"
                :pageSchema="k.pageSchema"
            />
          </div>
        </template>
        <el-backtop :target="'.el-main'" :right="100" :bottom="150" />
        <el-affix position="bottom" :offset="10">
        <div class="bottom-items">
          <rt-button
              v-for="(bth, idx) in props.bthList"
              :item="bth"
              :key="idx"
              :loading="bth.loading"
              :ref="(res: any) => {
                formPage.setButtonRef(bth?.id as string, res);
              }"
          />
        </div>
      </el-affix>
      </el-main>
    </el-container>

    <!-- <el-footer>
      <el-affix position="bottom" :offset="10">
        <div class="bottom-items">
          <rt-button
              v-for="(bth, idx) in props.bthList"
              :item="bth"
              :key="idx"
              :loading="bth.loading"
              :ref="(res: any) => {
                formPage.setButtonRef(bth?.id as string, res);
              }"
          />
        </div>
      </el-affix>
    </el-footer> -->
  </div>
</template>

<script setup lang="ts">
import {computed} from "vue";
import { iconMap } from './iconMap';

const props = defineProps({
  bthList: {
    type: Array,
  }
});

const idxParam = inject('idxParam');
const formPage = idxParam?.formPage;
const isCiJiMrk = computed(() => !!idxParam.ciJiMrk && idxParam.ciJiMrk !== '0');

const getConmpName = (k: any) => {
  if( k.pageKey === 'ECargoDist' ) return k.pageKey + '-ref';
  if( k.pageType === 'custom' ) return k.pageCode + '-ref';
  // if( ['AgreementCvrg', 'AgreementBase', 'AgreementApplicant', 'AgreementCiTcp', 'AgreementCi', 'AgreementCiShare', 'AgreementSpecial', 'AgreementFeeWarn'].includes(k.pageCode))
  //   return k.pageCode + '-ref';
  return k.pageCode + '-ref';
}
const NavigaShow = ref(true);

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
        block: 'start' // 可选值：'start', 'center', 'end', 'nearest'
      });
    }
  }
  if(document.querySelectorAll('.el-anchor__item') && document.querySelectorAll('.el-anchor__item').length > 0) {
    document.querySelectorAll('.el-anchor__item').forEach((item:any) => {
      item.classList.remove('isActive')
    })
  }
  event.currentTarget.classList.add('isActive')
}
</script>
<style lang="scss" scoped>
.bottom-items {
  height: 45px;
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
  :deep(.el-anchor__list) {
    padding: 10px 5px;
  }
  .el-anchor__item {
    margin-bottom: 10px;
    padding-left: 0;
    border-radius: 8px;
    opacity: .6;
    &.isActive,&:hover {
      opacity: 1;
    }
    :deep(a) {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #FFFFFF;
      padding: 0;
      .el-icon {
        font-size: 3rem!important;
        margin: 0 0 10px 0;
      }
      .iconfont {
        font-size: 1.5rem;
        color: #FFF;
        margin: 5px 0;
      }
      .icon-title {
        font-size: 12px;
      }
    }
  }
}
.el-aside {
  width: auto;
  background: var(--el-color-primary);
}

</style>
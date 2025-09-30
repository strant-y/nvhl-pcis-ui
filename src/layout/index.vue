<template>
  <div class="wh-full" :class="classObj">
    <!-- 遮罩层 -->
    <div
      v-if="classObj.mobile && classObj.openSidebar"
      class="wh-full fixed-lt z-999 bg-black bg-opacity-30"
      @click="handleOutsideClick"
    ></div>

    <!-- 公用侧边栏 -->
    <Sidebar class="sidebar-container" />

    <!-- 混合布局 -->
    <div v-if="layout === 'mix'" class="mix-container">
      <div class="mix-container__left">
        <SidebarMenu :menu-list="mixLeftMenus" :base-path="activeTopMenuPath" />
        <div class="sidebar-toggle">
          <hamburger
            :is-active="appStore.sidebar.opened"
            @toggle-click="toggleSidebar"
          />
        </div>
      </div>

      <div :class="{ hasTagsView: showTagsView }" class="main-container">
        <div :class="{ 'fixed-header': fixedHeader }">
          <TagsView v-if="showTagsView && scrollYShowTagsView" />
        </div>
        <AppMain />
        <Settings v-if="defaultSettings.showSettings" />
      </div>
    </div>

    <!-- 左侧和顶部布局 -->
    <div v-else :class="{ hasTagsView: showTagsView }" class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }">
        <NavBar v-if="layout === 'left'" />
        <TagsView v-if="showTagsView && scrollYShowTagsView" />
      </div>
      <AppMain />
      <Settings v-if="defaultSettings.showSettings" />
    </div>
    <div>
    <!-- <CopyRight v-if="route.name === 'Dashboard'" /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore, useSettingsStore, usePermissionStore } from "@/store";
import defaultSettings from "@/settings";
import { useRoute } from "vue-router";
const route = useRoute();

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();

const fixedHeader = computed(() => settingsStore.fixedHeader); // 是否固定header
const showTagsView = computed(() => settingsStore.tagsView); // 是否显示tagsView
const layout = computed(() => settingsStore.layout); // 布局模式 left top mix
const activeTopMenuPath = computed(() => appStore.activeTopMenuPath); // 顶部菜单激活path
const mixLeftMenus = computed(() => permissionStore.mixLeftMenus); // 混合布局左侧菜单

watch(
  () => activeTopMenuPath.value,
  (newVal) => {
    permissionStore.setMixLeftMenus(newVal);
  },
  {
    deep: true,
    immediate: true,
  }
);

const classObj = computed(() => ({
  hideSidebar: !appStore.sidebar.opened,
  openSidebar: appStore.sidebar.opened,
  mobile: appStore.device === "mobile",
  "layout-left": layout.value === "left",
  "layout-top": layout.value === "top",
  "layout-mix": layout.value === "mix",
}));

const width = useWindowSize().width;
const WIDTH = 992; // 响应式布局容器固定宽度  大屏（>=1200px） 中屏（>=992px） 小屏（>=768px）

watchEffect(() => {
  if (width.value < WIDTH) {
    appStore.toggleDevice("mobile");
    appStore.closeSideBar();
  } else {
    appStore.toggleDevice("desktop");

    if (width.value >= 1200) {
      appStore.openSideBar();
    } else {
      appStore.closeSideBar();
    }
  }
});

function handleOutsideClick() {
  appStore.closeSideBar();
}

function toggleSidebar() {
  appStore.toggleSidebar();
}

// 控制TagsView显示时机
const scrollYShowTagsView = ref(true);
const handleScroll = () => {
  if (fixedHeader.value) {
    // 固定Header时再触发，放置页面抖动
    if (window.scrollY >= 250) {
      scrollYShowTagsView.value = false;
    } else if (window.scrollY <= 250) {
      scrollYShowTagsView.value = true;
    }
  }
};


// 设备像素比和缩放比例
const pixelRatio = ref(window.devicePixelRatio || 1);
const scaleRatio = ref(pixelRatio.value);

// 原始基准值（与CSS变量初始值对应）
const baseStyles = {
  menuTextSize: 13,
  cardTitleSize: 15,
  cardGroupHeaderTitleSize: 14,
  contentFontSize: 12,
  contentFontWeight: 450,
  contentHeight: 24,
  contentLineHeight: 24,
  labelFontSize: 12,
  labelFontWeight: 400
};

// 根据设备像素比更新CSS变量
const updateStylesByPixelRatio = (ratio: number) => {
  const root = document.documentElement;
  if(ratio <= 1.4) ratio = 0;
  // 计算缩放后的值（可根据需求调整计算逻辑）
  const scaled = {
    menuTextSize: baseStyles.menuTextSize - ratio * 0.2,
    cardTitleSize: baseStyles.cardTitleSize - ratio * 1.1,
    cardGroupHeaderTitleSize: baseStyles.cardGroupHeaderTitleSize - ratio * 1.1,

    contentFontSize: baseStyles.contentFontSize - ratio,
    contentHeight: baseStyles.contentHeight - ratio * 1.1,
    contentLineHeight: baseStyles.contentLineHeight - ratio * 1.1,
    labelFontSize: baseStyles.labelFontSize - ratio  * 1.1,
  };

  root.style.setProperty('--menu-text-size', `${scaled.menuTextSize}px`);
  root.style.setProperty('--card-header-title-size', `${scaled.cardTitleSize}px`);
  root.style.setProperty('--card-group-header-title-size', `${scaled.cardGroupHeaderTitleSize}px`);

  root.style.setProperty('--rt-form-content-font-size', `${scaled.contentFontSize}px`);
  root.style.setProperty('--rt-form-content-font-weight', baseStyles.contentFontWeight + "");
  root.style.setProperty('--rt-form-content-height', `${scaled.contentHeight}px`);
  root.style.setProperty('--rt-form-content-line-height', scaled.contentLineHeight + "px");
  root.style.setProperty('--rt-form-label-font-size', `${scaled.labelFontSize}px`);
  root.style.setProperty('--rt-form-label-font-weight', baseStyles.labelFontWeight + "");
};

// 处理窗口大小变化
const handleResize = () => {
  // 延迟更新，避免频繁触发
  const timer = setTimeout(() => {
    const newRatio = window.devicePixelRatio || 1;
    if (newRatio !== pixelRatio.value) {
      pixelRatio.value = newRatio;
      scaleRatio.value = newRatio;
      updateStylesByPixelRatio(newRatio);
    }
    clearTimeout(timer);
  }, 300);
};

onMounted(() => {
  if (showTagsView.value) {
    window.addEventListener("scroll", handleScroll);
  }
  // 初始设置
  updateStylesByPixelRatio(pixelRatio.value);
  // 监听窗口大小变化（可能影响像素比）
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (showTagsView.value) {
    window.removeEventListener("scroll", handleScroll);
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - $sidebar-width);
  transition: width 0.28s;
}

.sidebar-container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  width: $sidebar-width;
  height: 100%;
  overflow: hidden;
  background-color: $menu-background;
  transition: width 0.28s;

  :deep(.el-menu) {
    border: none;
  }
}

.main-container {
  // position: relative;
  // min-height: 100%;
  margin-left: $sidebar-width;
  transition: margin-left 0.28s;
  display: flex;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
}

.layout-top {
  .fixed-header {
    top: $navbar-height;
    width: 100%;
  }

  .sidebar-container {
    z-index: 999;
    display: flex;
    width: 100% !important;
    height: $navbar-height;

    :deep(.el-scrollbar) {
      flex: 1;
      height: $navbar-height;
    }

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title),
    :deep(.el-menu--horizontal) {
      height: $navbar-height;
      line-height: $navbar-height;
      font-size: $menu-text-size;
    }

    :deep(.el-menu--collapse) {
      width: 100%;
    }
  }

  .main-container {
    // min-height: calc(100vh - $navbar-height - 60px );
    padding-top: $navbar-height;
    margin-left: 0;
  }
}

.layout-mix {
  .sidebar-container {
    width: 100% !important;
    height: $navbar-height;

    :deep(.el-scrollbar) {
      flex: 1;
      height: $navbar-height;
    }

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title),
    :deep(.el-menu--horizontal) {
      height: $navbar-height;
      line-height: $navbar-height;

      span {
        font-size: 10px !important;
      }
    }

    :deep(.el-menu--horizontal.el-menu) {
      border: none;
    }
  }

  .mix-container {
    display: flex;
    height: 100%;
    padding-top: $navbar-height;

    .mix-container__left {
      // z-index: 150;
      position: relative;
      width: $sidebar-width;
      // height: 100%;

      :deep(.el-menu) {
        height: 100%;
        border: none;
      }

      .sidebar-toggle {
        position: absolute;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 99%;
        height: 45px;
        line-height: 45px;
        box-shadow: 0 0 6px -2px var(--el-color-primary);

        div:hover {
          background-color: var(--menu-background);
        }

        :deep(svg) {
          color: var(--el-color-primary) !important;
        }
      }
    }

    .main-container {
      flex: 1;
      min-width: 0;
      margin-left: 0;

      .fixed-header {
        top: $navbar-height;
      }
    }
  }
}

.hideSidebar {
  .fixed-header {
    left: $sidebar-width-collapsed;
    width: calc(100% - $sidebar-width-collapsed);
  }

  .main-container {
    margin-left: $sidebar-width-collapsed;
  }

  &.layout-top {
    .fixed-header {
      left: 0;
      width: 100%;
    }

    .main-container {
      margin-left: 0;
    }
  }

  &.layout-mix {
    .fixed-header {
      left: $sidebar-width-collapsed;
      width: calc(100% - $sidebar-width-collapsed);
    }

    .sidebar-container {
      width: 100% !important;
    }

    .mix-container {
      .mix-container__left {
        width: $sidebar-width-collapsed;
      }
    }
  }
}

.layout-left.hideSidebar {
  .sidebar-container {
    width: $sidebar-width-collapsed !important;
  }

  .main-container {
    margin-left: $sidebar-width-collapsed;
  }

  &.mobile {
    .sidebar-container {
      pointer-events: none;
      transition-duration: 0.3s;
      transform: translate3d(-210px, 0, 0);
    }

    .main-container {
      margin-left: 0;
    }
  }
}

.mobile {
  .fixed-header {
    left: 0;
    width: 100%;
  }

  .main-container {
    margin-left: 0;
  }

  &.layout-top {
    .sidebar-container {
      z-index: 999;
      display: flex;
      width: 100% !important;
      height: $navbar-height;

      :deep(.el-scrollbar) {
        flex: 1;
        min-width: 0;
        height: $navbar-height;
      }
    }

    .main-container {
      padding-top: $navbar-height;
      margin-left: 0;
      overflow: hidden;
    }

    // 顶部模式全局变量修改
    --el-menu-item-height: $navbar-height;
  }
}
</style>

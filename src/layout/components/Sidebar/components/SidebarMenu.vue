<!-- 左侧边菜单：包括左侧布局(left)、顶部布局(all)、混合布局(left) -->
<template>
  <el-menu
    :default-active="currentRoute.path"
    :collapse="false"
    :background-color="variables['menu-background']"
    :text-color="variables['menu-text']"
    :active-color="variables['menu-active-text']"
    :unique-opened="false"
    :collapse-transition="false"
    :mode="layout === 'top' ? 'horizontal' : 'vertical'"
  >
    <!-- <el-dropdown trigger="click">
      <span class="el-dropdown-link">
        <svg-icon icon-class="menu" />
        <span class="ml-1">系统菜单</span>
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </span>
      <template #dropdown>
        <div class="dropdownContent" :style="{ width:  dropdownContentWidth}">
          <div class="title-box">
            <div class="title">财险承保系统</div>
            <div class="desc">赋能财险业务高质量发展</div>
          </div>
          <div class="menu-list-box">
            <div v-for="item in dropdowmList" :key="item.path" class="menu-list-item">
              <div class="first-level-title">{{ item.meta.title }}</div>
              <div class="second-level-list">
                <span class="second-level-title">{{ i.meta.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-dropdown> -->
    <SidebarMenuItem
      v-for="route in menuList"
      :key="route.path"
      :item="route"
      :base-path="resolvePath(route.path)"
      :is-collapse="!appStore.sidebar.opened"
    />
  </el-menu>
</template>

<script lang="ts" setup>
import { useSettingsStore, useAppStore } from "@/store";
import { isExternal } from "@/utils/index";
import path from "path-browserify";
import variables from "@/styles/variables.module.scss";

const settingsStore = useSettingsStore();
const appStore = useAppStore();
const currentRoute = useRoute();
const layout = computed(() => settingsStore.layout);
const props = defineProps({
  menuList: {
    required: true,
    default: () => {
      return [];
    },
    type: Array<any>,
  },
  basePath: {
    type: String,
    required: true,
  },
});
const dropdownContentWidth = computed(() => {
  return window.innerWidth - 10 + 'px';
});
const dropdowmList = computed(() => {
  const list = props.menuList.filter((item:any) => {
    return item.path !== "/login" && item.path !== "/" && item.path !== "/redirect"
  })
  return list;
});

console.log(props.menuList);

/**
 * 解析路径
 *
 * @param routePath 路由路径 /user
 */
function resolvePath(routePath: string) {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }

  // 完整绝对路径 = 父级路径(/system) + 路由路径(/user)
  const fullPath = path.resolve(props.basePath, routePath);
  return fullPath;
}
</script>
<style lang="scss" scoped>
:deep(.el-sub-menu.is-active .el-sub-menu__title) {
  color: #FFFFFF!important;
  background: var(--el-color-primary);
}
.el-dropdown-link {
  padding: 0 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--menu-active-text);
}
.dropdownContent {
  background: #f5f5f5;
  max-height: 50vh;
  overflow-y: auto;
  display: flex;
  .title-box {
    width: 260px;
    padding: 70px 0 0 30px;
    .title {
      font-size: 34px;
      color: #333333;
      line-height: 48px;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .desc {
      font-size: 16px;
      color: #666666;
      line-height: 22px;
    }
  }
  .menu-list-box {
    padding: 30px;
    .menu-list-item {
      margin-bottom: 20px;
      .first-level-title {
        font-size: 14px;
        color: #333333;
        line-height: 20px;
        font-weight: 600;
      }
      .second-level-list {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        .second-level-title {
          font-size: 12px;
          color: #666666;
          line-height: 17px;
          margin-top: 8px;
        }
      }
    }
  }
}
</style>

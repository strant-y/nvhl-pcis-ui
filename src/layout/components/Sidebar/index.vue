<template>
  <div :class="{ 'has-logo': sidebarLogo }" class="navbar-border">
    <!--混合布局-->
    <div class="flex w-full" v-if="layout == 'mix'">
      <SidebarLogo v-if="sidebarLogo" :collapse="!appStore.sidebar.opened" />
      <SidebarMixTopMenu class="flex-1" />
      <NavbarRight />
    </div>
    <!--左侧布局 || 顶部布局 -->
    <template v-else>
      <SidebarLogo v-if="sidebarLogo" :collapse="!appStore.sidebar.opened" />
      <!-- <span class="el-dropdown-link">
        <svg-icon icon-class="homepage" />
        <AppLink :to="resolvePath('/', '/')">
          <span class="second-level-title">首页</span>
        </AppLink>
      </span> -->
      <el-dropdown popper-class="menuDropdowm">
        <span class="el-dropdown-link">
          <svg-icon icon-class="menu" />
          <span class="ml-1">系统菜单</span>
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <div class="dropdownContent">
            <div class="menu-list-box">
              <div class="menu-list">
                <template v-for="item in dropdowmList" :key="item.path">
                  <div class="menu-list-item" v-if="!item.meta?.hidden">
                    <div class="first-level-title">{{ item.meta.title }}</div>
                    <div class="second-level-list">
                      <template v-for="i in item.children" :key="i.path">
                        <AppLink v-if="i.meta && !i.meta.hidden" :to="resolvePath(i.path, item.path)">
                          <el-icon v-if="i.meta.icon && i.meta.icon.startsWith('el-icon')" class="sub-el-icon">
                            <component :is="i.meta.icon.replace('el-icon-', '')" />
                          </el-icon>
                          <svg-icon v-else-if="i.meta.icon" :icon-class="i.meta.icon" />
                          <svg-icon v-else icon-class="menu" />
                          <span class="second-level-title">{{ i.meta.title }}</span>
                        </AppLink>
                      </template>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </template>
      </el-dropdown>
      <el-scrollbar>
        <SidebarMenu :menu-list="shorMenuList" base-path="" />
      </el-scrollbar>
      <NavbarRight v-if="layout === 'top'" @shortMenu="getShortMenuList" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore, usePermissionStore, useAppStore } from "@/store";
import path from "path-browserify";
import { isExternal } from "@/utils/index";
import { getShortcutDataList } from "@/api/menu";

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();
const sidebarLogo = computed(() => settingsStore.sidebarLogo);
const layout = computed(() => settingsStore.layout);
const dropdowmList:any = ref([])
const basePath = "/"
const shorMenuList = ref([])

onMounted(() => {
  const roles = JSON.parse(sessionStorage.getItem("user") || "{}").roles;
  if(roles?.length > 0 && roles.find((item:any) => item.cOpgrpCde === "ROLE_00000173")) {// 外部系统查看保单详情
    return;
  }
  dropdowmList.value = permissionStore.routes.filter((item:any) => {
    return item.path !== "/login" && item.path !== "/" && item.path !== "/redirect"
  })
  getShortMenuList()
})

/**
 *  解析路由路径(相对路径 → 绝对路径)
 *
 * @param routePath 路由路径
 */
function resolvePath(routePath: string,parentPath: string) {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(parentPath)) {
    return parentPath;
  }

  // 完整路径(/system/user) = 父级路径(/system) + 路由路径(user)
  const fullPath = path.resolve(parentPath, routePath);
  return fullPath;
}

function getShortMenuList() {
  getShortcutDataList().then((res: any) => {
    if (res.code == 200) {
      shorMenuList.value = [];
      res.data.forEach((d: any, i: boolean) => {
        if (d.select && shorMenuList.value.length < 5 && d.url && d.cOpAct !== "Layout") {
          shorMenuList.value.push({
            path: d.url,
            meta: {
              title: d.label
            }
          });
        }
      });
    }
  });
}
</script>

<style lang="scss" scoped>
.has-logo {
  .el-scrollbar {
    height: calc(100vh - $navbar-height);
  }
  // has-logo 区域 el-menu 背景色：浅色模式纯白，暗黑模式跟随导航栏
  :deep(.el-menu) {
    background-color: var(--menu-bg-has-logo) !important;
  }
}

.navbar-border {
  display: flex;
  align-items: center;
  min-height: $navbar-height;
  background: var(--layout-header-bg);
  border-bottom: 1px solid var(--layout-border-color);
  box-shadow: var(--layout-header-shadow);
  backdrop-filter: blur(12px);
}

.el-dropdown-link {
  height: calc($navbar-height - 8px);
  margin: 0 8px;
  padding: 0 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--el-menu-text-color);
  gap: 6px;
  border-radius: var(--layout-menu-radius);
  transition: background-color 0.2s ease, color 0.2s ease;

  span {
    font-size: var(--menu-text-size);
  }

  &:hover {
    background: var(--layout-hover-bg);
    color: var(--layout-hover-text);
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 2px;
  }
}

:deep(.dropdownContent) {
  overflow-y: auto;
  display: flex;
  height: 60%;
}

// 左侧布局模式：侧栏纵向堆叠（logo → 系统菜单 → 滚动菜单区）
.layout-left .navbar-border {
  flex-direction: column;
  align-items: stretch;
  height: 100%;
  min-height: 100vh;
  background: transparent;
  border-bottom: none;
  box-shadow: none;
  backdrop-filter: none;

  .el-dropdown {
    display: block;
    margin: 8px 10px;
  }

  .el-dropdown-link {
    width: 100%;
    justify-content: flex-start;
  }

  .el-scrollbar {
    flex: 1;
    min-height: 0;
    width: 100%;
    height: auto;
  }
}
</style>
<style>
:deep(.el-dropdown) {
  //--el-dropdown-menu-box-shadow: none!important;
  //--el-dropdown-menuItem-hover-fill: none!important;
  //--el-dropdown-menuItem-hover-color: none!important;
}
:deep(.el-dropdown__popper.el-popper) {
  margin-top: -10px;
  background: transparent;
}
.el-dropdown__popper.menuDropdowm {
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  margin-left: 221px;
  margin-top: -8px;
  min-width: 700px;
  max-width: 60%;
  max-height: 80vh;
  overflow-y: auto;
  padding: 10px 0;
}
.menuDropdowm .el-popper__arrow {
  display: none;
}
.el-dropdown__popper.menuDropdowm .dropdownContent {
  overflow-y: auto;
  display: flex;
}
.el-dropdown__popper.menuDropdowm .menu-list-box {
  height: 100%;
  flex: 1;
}
.el-dropdown__popper.menuDropdowm .menu-list {
  height: 100%;
  overflow: auto;
}
.el-dropdown__popper.menuDropdowm .menu-list-box .menu-list-item {
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding: 10px 30px 0 30px;
}
.el-dropdown__popper.menuDropdowm .menu-list-box .first-level-title {
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 10px;
}
.el-dropdown__popper.menuDropdowm .menu-list-box .second-level-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px 10px;
}
.el-dropdown__popper.menuDropdowm .menu-list-box .second-level-list a {
  display: flex;
  align-items: center;
  min-height: 30px;
  padding: 0 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}
.el-dropdown__popper.menuDropdowm .menu-list-box .second-level-title{
  font-size: 12px;
  line-height: 17px;
  cursor: pointer;
  color: var(--el-text-color-regular);
}
.el-dropdown__popper.menuDropdowm .menu-list-box .el-icon,.el-dropdown__popper.menuDropdowm .menu-list-box .svg-icon {
  font-size: 12px;
  cursor: pointer;
  color: var(--el-text-color-secondary);
  margin-right: 5px;
}
.el-dropdown__popper.menuDropdowm .menu-list-box .second-level-list a:hover {
  background: var(--el-fill-color-light);
}
.el-dropdown__popper.menuDropdowm .menu-list-box .second-level-list a:hover .second-level-title{
  color: var(--el-color-primary);
}
.el-dropdown__popper.menuDropdowm .menu-list-box .second-level-list a:hover .el-icon{
  color: var(--el-color-primary);
}
.el-dropdown__popper.menuDropdowm .menu-list-box .second-level-list a:hover .svg-icon{
  color: var(--el-color-primary);
}
</style>

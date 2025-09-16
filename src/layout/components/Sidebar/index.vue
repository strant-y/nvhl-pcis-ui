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
      <span class="el-dropdown-link">
        <svg-icon icon-class="homepage" />
        <AppLink :to="resolvePath('/', '/')">
          <span class="second-level-title">首页</span>
        </AppLink>
      </span>
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
import { RouteRecordRaw } from "vue-router";
import router from "@/router";
import { getShortcutDataList, updateShortRoute } from "@/api/menu";

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();
const sidebarLogo = computed(() => settingsStore.sidebarLogo);
const layout = computed(() => settingsStore.layout);
const dropdowmList:any = ref([])
const basePath = "/"
const shorMenuList = ref([])

onMounted(() => {
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
        if (d.select && shorMenuList.value.length < 5) {
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
}
.navbar-border{
  background-color: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-light); /*边框阴影*/
}
.el-dropdown-link {
  padding: 0 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #000000;
  &:hover {
    background: var(--el-color-primary);
    color: #ffffff;
  }
}
:deep(.dropdownContent) {
  overflow-y: auto;
  display: flex;
  height: 60%;
}
</style>
<style>
:deep(.el-dropdown) {
  --el-dropdown-menu-box-shadow: none!important;
  --el-dropdown-menuItem-hover-fill: none!important;
  --el-dropdown-menuItem-hover-color: none!important;
}
:deep(.el-dropdown__popper.el-popper) {
  margin-top: -10px;
  background: transparent;
}
.el-dropdown__popper.menuDropdowm {
  box-shadow: none;
  background: rgba(0,0,0,.7);
  margin-left: 221px;
  margin-top: -12px;
  min-width: 700px;
  max-width: 60%;
  max-height: 80%;
  overflow-y: auto;
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
  border-bottom: 1px solid #888;
  padding: 20px 30px 0 30px;
}
.el-dropdown__popper.menuDropdowm .menu-list-box .first-level-title {
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 10px;
}
.el-dropdown__popper.menuDropdowm .menu-list-box .second-level-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  margin-bottom: 10px;
}
.el-dropdown__popper.menuDropdowm .menu-list-box .second-level-list a {
  margin-bottom: 5px;
}
.el-dropdown__popper.menuDropdowm .menu-list-box .second-level-title {
  font-size: 12px;
  line-height: 17px;
  margin-top: 8px;
  cursor: pointer;
  color: #ffffff;
}
</style>

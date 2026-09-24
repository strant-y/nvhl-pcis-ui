<template>
  <el-breadcrumb v-if="breadcrumbs.length > 1" class="flex-y-center">
    <transition-group
      enter-active-class="animate__animated animate__fadeInRight"
    >
      <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
        <span
          v-if="
            item.redirect === 'noredirect' || index === breadcrumbs.length - 1
          "
          >{{ translateRouteTitle(item.meta.title) }}</span
        >
        <a v-else @click.prevent="handleLink(item)">
          {{ translateRouteTitle(item.meta.title) }}
        </a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { RouteLocationMatched } from "vue-router";
import { compile } from "path-to-regexp";
import router from "@/router";
import { translateRouteTitle } from "@/utils/i18n";

const currentRoute = useRoute();
const pathCompile = (path: string) => {
  const { params } = currentRoute;
  const toPath = compile(path);
  return toPath(params);
};

const breadcrumbs = ref([] as Array<RouteLocationMatched>);

function getBreadcrumb() {
  let matched = currentRoute.matched.filter(
    (item) => item.meta && item.meta.title
  );
  const first = matched[0];
  if (!isDashboard(first)) {
    matched = [
      { path: "/dashboard", meta: { title: "dashboard" } } as any,
    ].concat(matched);
  }
  breadcrumbs.value = matched.filter((item) => {
    return item.meta && item.meta.title && item.meta.breadcrumb !== false;
  });
}

function isDashboard(route: RouteLocationMatched) {
  const name = route && route.name;
  if (!name) {
    return false;
  }
  return (
    name.toString().trim().toLocaleLowerCase() ===
    "Dashboard".toLocaleLowerCase()
  );
}

function handleLink(item: any) {
  const { redirect, path } = item;
  if (redirect) {
    router.push(redirect).catch((err) => {
      console.warn(err);
    });
    return;
  }
  router.push(pathCompile(path)).catch((err) => {
    console.warn(err);
  });
}

// flush: 'post'：等本次渲染提交完成后再读取，
// 确保业务页（如 plan-info）在 onMounted/onActivated 中重写的 meta.title 已生效，避免标题滞后
watch(
  () => currentRoute.path,
  (path) => {
    if (path.startsWith("/redirect/")) {
      return;
    }
    getBreadcrumb();
  },
  { flush: "post" }
);

onBeforeMount(() => {
  getBreadcrumb();
});

// 首次加载时业务页的 onMounted 晚于本组件执行，挂载队列刷新后再读一次以同步动态标题
onMounted(() => {
  nextTick(getBreadcrumb);
});
</script>

<style lang="scss" scoped>
// 飞书式面包屑：非当前灰色，当前深色 + 半粗
.el-breadcrumb {
  font-size: 13px;
  line-height: 18px;
}

:deep(.el-breadcrumb__inner),
:deep(.el-breadcrumb__inner a) {
  color: var(--el-text-color-secondary);
  font-weight: 400;
  transition: color 0.2s ease;
}

:deep(.el-breadcrumb__inner a:hover) {
  color: var(--el-color-primary);
}

// 当前页面：深色 + 半粗
:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner),
:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner span) {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

// 分隔符：更浅、更紧凑
:deep(.el-breadcrumb__separator) {
  margin: 0 6px;
  color: var(--el-text-color-placeholder);
}
</style>

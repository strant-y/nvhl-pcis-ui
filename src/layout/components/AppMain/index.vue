<template>
  <section class="app-main">
    <router-view v-if="isRouteView">
      <template #default="{ Component, route }">
        <transition
          enter-active-class="animate__animated animate__fadeIn"
          mode="out-in"
          name="expand"
        >
          <component :is="Component" :key="route.path"/>
        </transition>
      </template>
    </router-view>
    <transition
        enter-active-class="animate__animated animate__fadeIn"
        mode="out-in"
        name="expand"
    >
      <keep-alive :max="6">
        <component
            v-if="currentView"
            :is="currentView?.component"
            :key="currentView.componentKey"
            :param="currentView?.params?.param"
        />
      </keep-alive>
    </transition>
  </section>
</template>

<script setup lang="ts">
import { useTagsViewStore } from "@/store";
import { useRoute } from 'vue-router'
const route = useRoute();

const tagsViewStore = useTagsViewStore()
const { 
  visitedViews,  // 所有页面
  cachedViews,  // 缓存页面集合
} = storeToRefs(tagsViewStore);
const isRouteView = computed(() => !!visitedViews.value.find((v) => v.path === route.path && !v.keepAlive) );
// 缓存页面时 当前页面
const currentView = computed(() => cachedViews.value.find(f => f.path === route.path));

</script>

<style lang="scss" scoped>
.app-main {
  position: relative;
  width: 100%;
  min-height: calc(100vh - $navbar-height - 55px);
  overflow: hidden;
  background-color: var(--el-bg-color-page);
}

.hasTagsView .app-main {
  min-height: calc(100vh - $navbar-height - $tags-view-height);
}

.fixed-header + .app-main {
  min-height: 100vh;
  padding-top: $navbar-height;
}

.hasTagsView .fixed-header + .app-main {
  min-height: 100vh;
  padding-top: $navbar-height + $tags-view-height;
}

.layout-mix,
.layout-top {
  .fixed-header + .app-main {
    padding-top: 0;
  }
}

.layout-mix {
  .app-main {
    height: calc(100vh - $navbar-height);
    padding-top: 0;
    overflow-y: auto;
  }

  .hasTagsView .app-main {
    height: calc(100vh - $navbar-height - $tags-view-height - 55px);
    min-height: calc(100vh - $navbar-height - $tags-view-height - 55px);
  }

  .fixed-header + .app-main {
    min-height: calc(100vh - $navbar-height - 55px);
  }

  .hasTagsView .fixed-header + .app-main {
    height: calc(100vh - $navbar-height - 55px);
    min-height: calc(100vh - $navbar-height - 55px);
    padding-top: $tags-view-height;
  }
}

.layout-top {
  .hasTagsView .fixed-header + .app-main {
    padding-top: $tags-view-height;
  }
}

// 过渡动画样式
.expand-enter-active, .expand-leave-active {
  transition: all 0.2s;
}
.expand-enter, .expand-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>

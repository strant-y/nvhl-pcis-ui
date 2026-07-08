<template>
  <section class="app-main">
    <router-view>
      <template #default="{ Component, route }">
        <transition
          enter-active-class="animate__animated animate__fadeIn"
          name="expand"
        >
          <keep-alive :max="8" :include="cachedViews">
            <component :is="Component" :key="route.query.componentKey"/>
          </keep-alive>
        </transition>
      </template>
    </router-view>
  </section>
</template>

<script setup lang="ts">
import { useTagsViewStore } from "@/store";
const tagsViewStore = useTagsViewStore();
const {
  cachedViews, // 缓存页面集合
} = storeToRefs(tagsViewStore);
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
  min-height: calc(100vh - $navbar-height - $tags-view-height - 3px);
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

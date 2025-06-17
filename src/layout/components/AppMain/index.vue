<template>
  <section class="app-main">
    <router-view v-if="!currentView?.mode || currentView?.mode === '1'">
      <template #default="{ Component, route }">
        <transition
          enter-active-class="animate__animated animate__fadeIn"
          mode="out-in"
          name="expand"
        >
          <!-- <keep-alive :include="cachedViews"> -->
            <component :is="Component" :key="route.path"/>
          <!-- </keep-alive> -->
        </transition>
      </template>
    </router-view>

    <!-- 缓存组件状态模式-->
    <!-- <div v-for="view in compViews" :key="view.compKey">
      <transition name="expand" mode="out-in" enter-active-class="animate__animated animate__fadeIn">
        <keep-alive max="6">
          <component
            v-if="isActive(view)"
            :is="view.component"
            :key="view.compKey"
            :param="view.params?.param"
          />
        </keep-alive>
      </transition>
    </div> -->
      <transition name="expand" mode="out-in" enter-active-class="animate__animated animate__fadeIn">
        <keep-alive :max="4">
          <component
            v-if="isCompView"
            :is="currentView?.component"
            :key="currentView?.compKey"
            :param="currentView?.params?.param"
          />
        </keep-alive>
      </transition>
      <!-- 不活跃的标签完全卸载 -->
    <component 
      :is="currentView.component" 
      :key="compKey + '-no-cache'" 
      v-if="!isCompView"
    />
  </section>
</template>

<script setup lang="ts">
import { useTagsViewStore } from "@/store";
import { useRoute } from 'vue-router'
import { getCompByName } from '@/typings/views-component'
const route = useRoute();

const tagsViewStore = useTagsViewStore()
const { 
  visitedViews,  // 所有页面
  cachedViews,  // 缓存页面集合
} = storeToRefs(tagsViewStore);

const currentView = computed(() => visitedViews.value.find(f => f.path === route.path)); // 当前页面
const compViews = computed(() => visitedViews.value.filter(f => f.mode === '2')); // 组件视图

function isActive(view: TagView, idx: number) {
  return currentView.value?.path === view.path
}

const isCompView = () => {
  return compViews.value.some(f => f.compKey === currentView.value?.compKey)
};

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
  min-height: calc(100vh - $navbar-height - $tags-view-height  - 55px);
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

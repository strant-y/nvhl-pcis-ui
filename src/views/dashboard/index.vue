<template>
  <div class="dashboard-container">
    <!-- 欢迎横幅 -->
    <WelcomeBanner />

    <!-- 统计卡片 -->
    <StatCards />

    <!-- 内容网格：产品动态 + 快捷操作 -->
    <div class="content-grid">
      <ProductDynamics />
      <QuickActions />
    </div>

    <!-- 底部网格：项目进度 + 最新动态 + 我的待办 -->
    <div class="bottom-grid">
      <ProjectProgress />
      <RecentActivities />
      <TodoList />
    </div>
  </div>
</template>

<script setup lang="ts">
import WelcomeBanner from "./components/WelcomeBanner.vue";
import StatCards from "./components/StatCards.vue";
import ProductDynamics from "./components/ProductDynamics.vue";
import QuickActions from "./components/QuickActions.vue";
import ProjectProgress from "./components/ProjectProgress.vue";
import RecentActivities from "./components/RecentActivities.vue";
import TodoList from "./components/TodoList.vue";

defineOptions({ name: "Dashboard" });
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 24px;
  background: var(--dash-bg);
  min-height: 100%;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}
</style>

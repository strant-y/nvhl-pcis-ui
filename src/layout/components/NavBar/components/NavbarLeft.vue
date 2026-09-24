<template>
  <div class="navbar-left">
    <hamburger
      :is-active="appStore.sidebar.opened"
      @toggle-click="toggleSideBar"
    />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store";

const appStore = useAppStore();

function toggleSideBar() {
  appStore.toggleSidebar();
}
</script>

<style lang="scss" scoped>
.navbar-left {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
  color: var(--el-text-color-primary);

  :deep(.hamburger-container),
  :deep(.hamburger) {
    border-radius: var(--layout-menu-radius);
  }
}
</style>

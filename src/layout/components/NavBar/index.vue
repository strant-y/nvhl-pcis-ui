<template>
  <!-- 顶部导航栏 -->
  <div class="navbar-container navbar-border">
    <!-- 导航栏左侧 -->
    <NavbarLeft />
    <!-- 导航栏右侧 -->
    <NavbarRight />
  </div>
</template>

<style lang="scss" scoped>
.navbar-container {
  @apply flex-x-between;

  height: $navbar-height;
  padding: 0 16px 0 8px;
  background: var(--layout-header-bg);
  border-bottom: 1px solid var(--layout-border-color);
  backdrop-filter: blur(12px);
}

.navbar-border {
  box-shadow: var(--layout-header-shadow);
}
</style>

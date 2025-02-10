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
  background: var(--el-bg-color);
}
.navbar-border{
  background-color: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-light); /*边框阴影*/
}
</style>

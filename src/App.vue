<template>
  <el-config-provider :locale="locale" :size="size">
    <!-- 开启水印 -->
    <el-watermark
      v-if="watermarkEnabled"
      :width="calculatedWidth"
      :font="{ color: fontColor }"
      :content="content"
      :gap="[200, 200]"
      :zIndex="1000"
      class="wh-full"
    >
      <router-view />
    </el-watermark>
    <!-- 关闭水印 -->
    <router-view v-else />
  </el-config-provider>
</template>

<script setup lang="ts">
import { useAppStore, useSettingsStore, useUserStore } from "@/store";
import defaultSettings from "@/settings";
import { ThemeEnum } from "@/enums/ThemeEnum";

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const userStore = useUserStore();
const content = ref([]);
const ADDITIONAL_WIDTH = 100;
const locale = computed(() => appStore.locale);
const size = computed(() => appStore.size);
// const watermarkEnabled = computed(() => settingsStore.watermarkEnabled);
const watermarkEnabled = computed(() => true); // 水印修改为强制开启,缓存的页面,无法开启的问题

// 明亮/暗黑主题水印字体颜色适配
const fontColor = computed(() => {
  return settingsStore.theme === ThemeEnum.DARK
    ? "rgba(255, 255, 255, .15)"
    : "rgba(0, 0, 0, .15)";
});
const measureTextWidth = (text) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const metrics = context.measureText(text);
  return metrics.width;
};
const calculatedWidth = computed(() => {
  let textWidth = measureTextWidth(content.value[1]) + ADDITIONAL_WIDTH;
  let timeWidth = measureTextWidth(content.value[2]) + ADDITIONAL_WIDTH;
  return Math.max(textWidth, timeWidth);
});
watchEffect(() => {
  if (userStore.user) {
    const returntime = sessionStorage.getItem("returntime");
    const userInfo = userStore.user;
    let str = [];
    if (userInfo.opCnm?.length > 15) {
      str[0] = userInfo.opCnm?.substring(0, 15);
      str[1] = userInfo.opCnm?.substring(15, userInfo.opCnm?.length);
    } else {
      str[0] = userInfo.opCnm;
    }
    let cons1 = [userInfo.opCde, returntime];
    cons1.splice(1, 0, ...str);
    content.value = cons1;
  }
});
</script>
<style lang="scss">
#nprogress .bar {
  background: var(--el-color-primary) !important; // 跟主题色切换
}
::-webkit-scrollbar {
  width: 8px; /* 垂直滚动条宽度 */
  height: 8px; /* 水平滚动条高度 */
}

::-webkit-scrollbar-track {
  background: #f1f1f1; /* 轨道背景色 */
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #8b8b8b; /* 滑块颜色 */
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #636363; /* 滑块悬停颜色 */
}

* {
  font-family: var(--font-family),serif !important;
}

// 这些组件通常挂载在body下，需要单独指定
.el-select-dropdown,
.el-date-picker,
.el-dialog,
.el-tooltip__popper,
.el-message,
.el-message-box,
.el-notification {
  font-family: var(--font-family),serif !important;
}

::placeholder {
  font-family: var(--font-family),serif !important;
}

// 全局修改ElMessage样式
.el-message {
  margin-top: calc(35vh) !important; // 显示位置
  border: var(--rt-border) !important;
}
// 消息内容样式
.el-message__content,.el-message__icon {
  font-size: calc(var(--rt-form-content-font-size) + 1.25px) !important; /* 确保内容字体大小同步 */
}
// 成功提示消息背景色和字体颜色
.el-message--success {
  background: var(--el-color-primary-light-9);
  .el-message__content {
    color: var(--el-color-primary);
  }
  .el-message-icon--success {
    color: var(--el-color-primary);
  }
}
.el-message--warning{
	z-index: 99999 !important;
}
</style>
<style>
.el-popper .el-menu--horizontal.el-menu--popup-container {
  max-height: 60vh;
  overflow-y: auto;
}
</style>

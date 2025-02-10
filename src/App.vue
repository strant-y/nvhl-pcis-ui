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
</style>

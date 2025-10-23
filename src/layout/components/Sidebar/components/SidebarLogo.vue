<template>
  <div class="logo-container">
    <transition enter-active-class="animate__animated animate__fadeInLeft">
      <router-link v-if="collapse" class="wh-full flex-center" :to="!isRole173 ? '/' : ''">
        <!-- <img v-if="settingsStore.sidebarLogo" :src="logo" class="logo-image" /> -->
      </router-link>

      <router-link v-else class="wh-full logo-title-box" :to="!isRole173 ? '/' : ''">
        <img v-if="settingsStore.sidebarLogo" :src="logo" class="logo-image" />
        <!-- <span class="logo-title"> {{ defaultSettings.title }}</span> -->
      </router-link>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import defaultSettings from "@/settings";
import { useSettingsStore } from "@/store";

const settingsStore = useSettingsStore();

defineProps({
  collapse: {
    type: Boolean,
    required: true,
  },
});

const logo = ref(new URL(`../../../../assets/logo2.png`, import.meta.url).href);
const user = JSON.parse(sessionStorage.getItem("user") || "{}");
const isRole173 = user.roles?.length > 0 && user.roles.find((item:any) => item.cOpgrpCde === "ROLE_00000173");
</script>

<style lang="scss" scoped>
.logo-container {
  // width: 100%;
  height: $navbar-height;
  background-color: $sidebar-logo-background;
  padding: 0 20px;

  .logo-image {
    // margin-bottom: 5px;
    // width: 35px;
    // height: 32px;
    height: 24px;
  }

  .logo-title {
    // flex-shrink: 0; /* 防止容器在空间不足时缩小 */
    // margin-left: 10px;
    // font-size: 14px;
    // // font-weight: bold;
    // color: var(--menu-text);
    display: flex;
    align-items: center;
    font-size: 16px;
    color: rgb(255, 255, 255);
    height: 100%;
    &::before {
      content: "";
      width: 1px;
      height: 60%;
      background-color: rgb(255, 255, 255);
      margin: 0px 10px;
    }
  }
}

.layout-top,
.layout-mix {
  .logo-container {
    // width: $sidebar-width;
  }

  &.hideSidebar {
    .logo-container {
      // width: $sidebar-width-collapsed;
    }
  }
}

.logo-title-box {
  display: flex;
  align-items: center;
}
</style>

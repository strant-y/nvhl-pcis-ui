<template>
  <div class="welcome">
    <div class="welcome-content">
      <h2>欢迎回来，{{ userName }}</h2>
      <p>诚泰产品引擎系统 · 让保险产品配置更高效</p>
    </div>
    <div class="welcome-date">{{ dateStr }}</div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store";

const userStore = useUserStore();
const userName = computed(() => userStore.user?.opName || "管理员");

const dateStr = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const weekMap = ["日", "一", "二", "三", "四", "五", "六"];
  const week = weekMap[now.getDay()];
  return `${year}年${month}月${day}日 星期${week}`;
});
</script>

<style lang="scss" scoped>
.welcome {
  background: linear-gradient(135deg, #3a76c5 0%, #5ba0e6 60%, #7cbcf5 100%);
  border-radius: 12px;
  padding: 28px 32px;
  color: #fff;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &::after {
    content: "";
    position: absolute;
    right: -20px;
    top: -20px;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
  }

  &::before {
    content: "";
    position: absolute;
    right: 60px;
    bottom: -40px;
    width: 160px;
    height: 160px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
  }
}

.welcome-content {
  position: relative;
  z-index: 1;

  h2 {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  p {
    font-size: 14px;
    opacity: 0.85;
  }
}

.welcome-date {
  position: relative;
  z-index: 1;
  font-size: 13px;
  opacity: 0.7;
  white-space: nowrap;
}
</style>

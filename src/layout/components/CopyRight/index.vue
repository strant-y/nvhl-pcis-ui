<template>
  <div class="copyright">
    <div class="text">
      Copyright <svg-icon :icon-class="'copyright'" />
      {{ new Date().getFullYear() }} 软通动力 版权所有
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.copyright {
  display: block;
  padding: 15px 16px !important;
  /* margin: 48px 0 24px; */
  text-align: left !important;
  background: #f9f9f9;
  border-top: 2px solid #e2e2e2;
  width: 100%;
  .text {
    font-size: 14px !important;
    text-align: center;
  }
}
</style>

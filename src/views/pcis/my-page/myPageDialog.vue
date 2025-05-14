<!-- 用户管理 -->
<template>
  <el-dialog v-model="dialogVisible" width="90%" title="详情" top="10px">
    <myPage :param="props.param"></myPage>
    <template #footer>
      <rt-button :item="returnBtn"/>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { createFreeButtonBase } from "@/shared/button-config";
const myPage = defineAsyncComponent(() =>
  import("@/views/pcis/my-page/myPage.vue")
);
const dialogVisible = ref(true);

const props = defineProps({
  param: {
    type: Object,
  },
});

const returnBtn = createFreeButtonBase({
  type: "primary",
  label: "返回",
  func: () => {
    dialogVisible.value = false;
  },
});
</script>

<style lang="scss" scoped>
:deep(.el-affix) {
  width: 100%!important;
}
:deep(.el-aside) {
  display: none;
}
:deep(.bottom-items) {
  display: none;
}
</style>

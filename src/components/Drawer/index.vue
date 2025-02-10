<!-- 抽屉 -->
<template>
  <el-drawer
    v-model="drawerInfo.showMskFalg"
    :direction="openlocal"
    :width="width"
    :destroy-on-close="isDestroy"
    :close-on-click-modal="clickmaskFlag"
    :show-close="showCloseflag"
    @close="cancleHandle"
  >
    <template #header>
      <span class="custom-title">{{customTitle}}</span>
    </template>
    <slot name="content"></slot>
  </el-drawer>
</template>
<script setup>
  const props = defineProps({
    // 从那个方向打开
    openlocal: {
      type: String,
      default: 'rtl',
    },
    // 宽度
    width: {
      type: String,
      default: '200px',
    },
    // 标题
    customTitle: {
      type: String,
      required: true,
    },
    // 是否展示抽屉
    showMskFalg: {
      type: Boolean,
      default: false,
    },
    // 显示关闭图标
    showCloseflag: {
      type: Boolean,
      default: true,
    },
    //  点击蒙层是否允许关闭
    clickmaskFlag: {
      type: Boolean,
      default: true,
    },
    isDestroy: {
      type: Boolean,
      default: true,
    },
  })
  const drawerInfo = ref({
    showMskFalg: props.showMskFalg,
  })
  const emit = defineEmits(['update:showMskFalg'])
  const cancleHandle = () => {
    emit('update:showMskFalg')
  }
  watch(
    () => props.showMskFalg,
    (val) => {
      drawerInfo.value.showMskFalg = val
    }
  )
</script>
<style lang="scss" scoped>
.custom-title{
  font-size: 23px;
  color: var(--el-text-color);
}
</style>

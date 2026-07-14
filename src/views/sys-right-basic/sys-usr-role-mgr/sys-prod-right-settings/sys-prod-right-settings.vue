<template>
  <el-dialog v-model="dialogVisible" width="90%" class="system-dialog-scroll">
    <div style="margin-top: 1rem; margin-bottom: 1rem" align="left" v-if="propData">
      操作员: <b>{{ propData.cOperCnm }}[{{ propData.cOperId }}]</b> 操作机构：<b>{{ propData.cDptCnm }}[{{
        propData.cDptDispCde }}]</b>
    </div>
    <sys-usr-prod-info :getOperator="operatorData"></sys-usr-prod-info>
  </el-dialog>
</template>

<script setup lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { SysRoleMgrService } from '@/views/sys-right-basic/service/sys-role-mgr.service';
import SysUsrProdInfo from './sys-usr-prod-info/sys-usr-prod-info.vue';


const props = defineProps({
  operatorData: {
    required: true,
  },
});
const propData = ref(props.operatorData)
const dialogVisible = ref(true);
// 生命周期钩子
onMounted(() => {
  // 初始化逻辑
});

</script>

<style scoped lang="scss">
/* 添加样式 */
.system-dialog-scroll :deep(.el-dialog__body) {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>

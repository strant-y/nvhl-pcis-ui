<template>
  <el-card class="approval-progress-card" shadow="never">
    <template #header>
      <div class="card-header">
        <span class="card-title">审批进度</span>
      </div>
    </template>

    <el-steps
      :active="activeStep"
      align-center
      finish-status="success"
      process-status="process"
    >
      <el-step
        v-for="(item, index) in list"
        :key="index"
        :title="item.nodeName"
      >
        <template #description>
          <div class="step-content">

            <div class="approver">
              {{ item.approver || "--" }}
            </div>

            <div class="approve-time">
              {{ item.approveTime || "--" }}
            </div>

            <div class="status">
              <el-tag
                size="small"
                :type="getTagType(item.status)"
              >
                {{ item.status }}
              </el-tag>
            </div>

          </div>
        </template>
      </el-step>
    </el-steps>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface ApprovalStep {
  nodeName: string;
  approver?: string;
  approveTime?: string;
  status: "已完成" | "审批中" | "待审批";
}

const props = defineProps<{
  list: ApprovalStep[];
}>();

const activeStep = computed(() => {
  const index = props.list.findIndex((item) => item.status === "审批中");

  return index === -1 ? props.list.length : index + 1;
});

const getTagType = (status: string) => {
  switch (status) {
    case "已完成":
      return "success";

    case "审批中":
      return "primary";

    case "待审批":
      return "info";

    default:
      return "";
  }
};
</script>

<style scoped lang="scss">
.approval-progress-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.step-content {
  margin-top: 12px;
  text-align: center;
  line-height: 22px;
}

.approver {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.approve-time {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.status {
  margin-top: 8px;
}

:deep(.el-step__title) {
  font-size: 15px;
  font-weight: 600;
}

:deep(.el-step__description) {
  padding-right: 0;
}

:deep(.el-step__head.is-process) {
  color: #1677ff;
  border-color: #1677ff;
}

:deep(.el-step__title.is-process) {
  color: #1677ff;
}

:deep(.el-step__icon.is-text) {
  width: 34px;
  height: 34px;
}

:deep(.el-step.is-center .el-step__description) {
  padding-left: 10%;
  padding-right: 10%;
}
</style>
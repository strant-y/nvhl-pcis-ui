<template>
  <el-card class="current-approval-card" shadow="never">
    <template #header>
      <div class="card-header">
        <span>当前审批</span>

        <el-tag
          :type="getStatusType(data.status)"
          effect="light"
        >
          {{ data.status }}
        </el-tag>
      </div>
    </template>

    <!-- 当前审批人 -->
    <div class="approver-box">

      <el-avatar :size="58">
        {{ data.approver?.substring(0, 1) }}
      </el-avatar>

      <div class="approver-info">

        <div class="name">
          {{ data.approver }}
        </div>

        <div class="role">
          {{ data.role }}
        </div>

      </div>

    </div>

    <el-divider />

    <!-- 基本信息 -->

    <div class="info-list">

      <div class="info-item">

        <span class="label">
          当前节点
        </span>

        <span class="value">
          {{ data.nodeName }}
        </span>

      </div>

      <div class="info-item">

        <span class="label">
          接收时间
        </span>

        <span class="value">
          {{ data.receiveTime }}
        </span>

      </div>

      <div class="info-item">

        <span class="label">
          剩余时限
        </span>

        <span
          class="value warning"
        >
          {{ data.remainingTime }}
        </span>

      </div>

    </div>

    <el-divider />

    <!-- 审批意见 -->

    <div class="section-title">

      审批意见

    </div>

    <el-input

      v-if="!readonly"

      v-model="opinion"

      type="textarea"

      :rows="5"

      maxlength="500"

      show-word-limit

      resize="none"

      placeholder="请输入审批意见"

    />

    <div v-else class="opinion-readonly">

      {{ opinion || '--' }}

    </div>

    <!-- 操作 -->

    <div v-if="!readonly" class="footer">

      <el-button @click="emit('transfer')">

        转办

      </el-button>

      <el-button @click="emit('return')">

        退回

      </el-button>

      <el-button
        type="danger"
        @click="emit('reject')"
      >
        驳回
      </el-button>

      <el-button
        type="primary"
        @click="emit('approve')"
      >
        同意
      </el-button>

    </div>

  </el-card>
</template>

<script setup lang="ts">

import { ref } from "vue";

interface CurrentApproval {

  nodeName: string

  approver: string

  role: string

  receiveTime: string

  remainingTime: string

  status: string

}

defineProps<{

  data: CurrentApproval

  readonly?: boolean

}>()

const emit = defineEmits<{
  (e: 'approve'): void
  (e: 'reject'): void
  (e: 'return'): void
  (e: 'transfer'): void
}>()

const opinion = ref("")

const getStatusType = (status: string) => {

  switch (status) {

    case "审批中":

      return "primary"

    case "已完成":

      return "success"

    case "已驳回":

      return "danger"

    default:

      return "info"

  }

}

</script>

<style scoped lang="scss">

.current-approval-card{

  border-radius:8px;

}

.card-header{

  display:flex;

  justify-content:space-between;

  align-items:center;

}

.approver-box{

  display:flex;

  align-items:center;

}

.approver-info{

  margin-left:16px;

}

.name{

  font-size:18px;

  font-weight:600;

  color:#303133;

}

.role{

  margin-top:4px;

  color:#909399;

  font-size:13px;

}

.info-list{

  display:flex;

  flex-direction:column;

  gap:14px;

}

.info-item{

  display:flex;

  justify-content:space-between;

  align-items:center;

}

.label{

  color:#909399;

}

.value{

  color:#303133;

  font-weight:500;

}

.warning{

  color:#E6A23C;

}

.section-title{

  margin-bottom:12px;

  font-weight:600;

  font-size:15px;

}

.opinion-readonly{

  padding:12px;

  min-height:120px;

  background:#f5f7fa;

  border-radius:4px;

  color:#606266;

  line-height:1.6;

}

.footer{

  display:flex;

  justify-content:flex-end;

  gap:12px;

  margin-top:20px;

}

</style>
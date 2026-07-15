<template>
  <el-card class="business-info-card" shadow="never">
    <template #header>
      <div class="card-header">
        <div class="title">
          <el-icon><Document /></el-icon>
          <span>业务信息</span>
        </div>

        <el-tag
          :type="statusType"
          effect="light"
          round
        >
          {{ info.status }}
        </el-tag>
      </div>
    </template>

    <el-row :gutter="24">

      <el-col
        v-for="item in fields"
        :key="item.label"
        :xl="8"
        :lg="8"
        :md="12"
        :sm="24"
        :xs="24"
      >
        <div class="info-item">

          <div class="label">
            {{ item.label }}
          </div>

          <div class="value">
            {{ item.value }}
          </div>

        </div>
      </el-col>

    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Document } from '@element-plus/icons-vue'

interface BusinessInfo {

  code: string

  name: string

  type: string

  applicant: string

  department: string

  createTime: string

  status: string
}

const props = defineProps<{

  info: BusinessInfo

}>()

const fields = computed(() => [

  {
    label: '业务编号',
    value: props.info.code
  },

  {
    label: '业务名称',
    value: props.info.name
  },

  {
    label: '业务类型',
    value: props.info.type
  },

  {
    label: '申请人',
    value: props.info.applicant
  },

  {
    label: '申请部门',
    value: props.info.department
  },

  {
    label: '发起时间',
    value: props.info.createTime
  }

])

const statusType = computed(() => {

  switch (props.info.status) {

    case '审批中':
      return 'primary'

    case '已完成':
      return 'success'

    case '已驳回':
      return 'danger'

    default:
      return 'info'
  }

})
</script>

<style scoped lang="scss">

.business-info-card {

  border: none;

  border-radius: 10px;

  margin-bottom: 20px;

  box-shadow: 0 2px 12px rgba(0,0,0,.04);

}

.card-header {

  display: flex;

  justify-content: space-between;

  align-items: center;

}

.title {

  display: flex;

  align-items: center;

  gap: 8px;

  font-size: 16px;

  font-weight: 600;

  color: #303133;

}

.info-item {

  display: flex;

  flex-direction: column;

  margin-bottom: 24px;

}

.label {

  font-size: 13px;

  color: #909399;

  margin-bottom: 8px;

}

.value {

  font-size: 15px;

  color: #303133;

  font-weight: 500;

  word-break: break-all;

}

@media (max-width: 1200px) {

  .info-item {

    margin-bottom: 18px;

  }

}

</style>
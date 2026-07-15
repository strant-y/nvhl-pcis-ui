<template>
  <el-card class="approval-node-table" shadow="never">
    <template #header>
      <div class="card-header">
        <span>审批节点详情</span>

        <el-tag type="info" effect="plain">
          共 {{ tableData.length }} 个节点
        </el-tag>
      </div>
    </template>

    <el-table
      :data="tableData"
      stripe
      border
      style="width: 100%"
      empty-text="暂无审批数据"
    >
      <el-table-column
        type="index"
        width="60"
        label="序号"
        align="center"
      />

      <el-table-column
        prop="nodeName"
        label="审批节点"
        min-width="160"
      />

      <el-table-column
        prop="roleName"
        label="审批角色"
        width="140"
      />

      <el-table-column
        prop="approver"
        label="审批人"
        width="120"
      />

      <el-table-column
        prop="approveOpinion"
        label="审批意见"
        min-width="220"
        show-overflow-tooltip
      />

      <el-table-column
        prop="approveTime"
        label="审批时间"
        width="180"
      />

      <el-table-column
        label="审批状态"
        width="120"
        align="center"
      >
        <template #default="{ row }">

          <el-tag
            :type="getStatusType(row.status)"
            effect="light"
          >
            {{ row.status }}
          </el-tag>

        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">

interface ApprovalNode {

  nodeName: string

  roleName: string

  approver: string

  approveOpinion: string

  approveTime: string

  status: "已完成" | "审批中" | "待审批" | "已驳回"

}

defineProps<{

  tableData: ApprovalNode[]

}>()

const getStatusType = (status: string) => {

  switch (status) {

    case "已完成":
      return "success"

    case "审批中":
      return "primary"

    case "待审批":
      return "info"

    case "已驳回":
      return "danger"

    default:
      return ""
  }

}

</script>

<style scoped lang="scss">

.approval-node-table {

  border-radius: 8px;

}

.card-header {

  display: flex;

  justify-content: space-between;

  align-items: center;

  font-size: 16px;

  font-weight: 600;

}

:deep(.el-card__body){

  padding:20px;

}

:deep(.el-table){

  font-size:14px;

}

:deep(.el-table th){

  background:#fafafa;

  font-weight:600;

}

:deep(.el-table td){

  height:56px;

}

</style>
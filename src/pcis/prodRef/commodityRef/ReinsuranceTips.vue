<template>
  <div class="reinsurance-container">
    <!-- 最大承保能力模块 -->
    <el-card class="coverage-card">
      <template #header>
        <div class="card-header">
          <h2>合同最大承保能力,超限额需安排再保临分</h2>
<!--          <el-tag type="info">超限额需安排再保临分</el-tag>-->
        </div>
      </template>

      <el-table :data="max_coverage" stripe>
        <el-table-column prop="insuranceType" label="险种类型" />
        <el-table-column label="最大承保金额">
          <template #default="{row}">
            <span class="amount-highlight">{{ row.amount }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="retention-note">
        <el-icon><info-filled /></el-icon>
        最大自留额内的保单可直接获得超赔保障，不需安排临时分保
      </div>
    </el-card>

    <!-- 除外责任模块 -->
    <el-card class="exclusion-card">
      <template #header>
        <h2>再保除外责任</h2>
      </template>
      <div v-for="(item, index) in exclusions" :key="index" class="mb-3">
        <el-alert
            :description="`${index + 1}. ${item.amount}`"
            type="warning"
            show-icon
            :closable="false"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {
  Document,
  InfoFilled
} from '@element-plus/icons-vue'
import {insurancePolicies, sanctionCountry} from "@/api/dict";
const max_coverage = ref([])
const exclusions = ref([])
const activeExclusions = ref([1]) // 默认展开第一条

const refreshData = (reset = true) => {
  insurancePolicies().then((response) => {
    const {code,data,msg} = response
    if (code === 200) {
      console.log('response.data',data?.reReportNotification)
      max_coverage.value = data?.reReportNotification
      exclusions.value = data?.liabilityNotification
    } else {
      ElMessage.error(msg);
    }
  });
};
const handleCancel = () => {
  dialogVisible.value = false;
};

onMounted(() => {
  refreshData();
});
</script>

<style scoped>
.reinsurance-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount-highlight {
  font-weight: bold;
  color: #e6a23c;
  font-size: 1.1em;
}

.retention-note {
  margin-top: 15px;
  padding: 10px;
  background-color: #f0f9eb;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #67c23a;
}

.exclusion-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.exclusion-id {
  font-weight: bold;
  width: 24px;
}

.exclusion-content {
  padding: 10px 20px;
  line-height: 1.8;
}

.highlight-tags {
  margin: 12px 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.attachment-link {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
}

.sanction-item {
  border-left: 3px solid #f56c6c;
}
</style>
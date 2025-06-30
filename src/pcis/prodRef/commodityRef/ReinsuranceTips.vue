<template>
  <div class="reinsurance-container">
    <!-- 最大承保能力模块 -->
    <el-card class="coverage-card">
      <template #header>
        <div class="card-header">
          <h2>合同最大承保能力提醒</h2>
          <el-tag type="info">超限额需安排再保临分</el-tag>
        </div>
      </template>

      <el-table :data="max_coverage" stripe>
        <el-table-column prop="coverage_type" label="险种类型" />
        <el-table-column label="最大承保金额(元)">
          <template #default="{row}">
            <span class="amount-highlight">{{ row.amount }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="retention-note">
        <el-icon><info-filled /></el-icon>
        {{ retention_note }}
      </div>
    </el-card>

    <!-- 除外责任模块 -->
    <el-card class="exclusion-card">
      <template #header>
        <h2>再保除外责任提醒</h2>
      </template>

      <el-collapse v-model="activeExclusions" accordion>
        <el-collapse-item
            v-for="item in exclusions"
            :key="item.id"
            :name="item.id"
            :class="{'sanction-item': item.id === 8}"
        >
          <template #title>
            <div class="exclusion-title">
              <span class="exclusion-id">{{ item.id }}.</span>
              <strong>{{ item.title }}</strong>
              <el-tag v-if="item.id === 8" type="danger" size="small">含附件</el-tag>
            </div>
          </template>

          <div class="exclusion-content">
            <p>{{ item.content }}</p>

            <!-- 高亮国家/地区 -->
            <div v-if="item.highlight" class="highlight-tags">
              <el-tag
                  v-for="(country, idx) in item.highlight"
                  :key="idx"
                  type="danger"
                  effect="dark"
                  size="small"
              >
                {{ country }}
              </el-tag>
            </div>

            <!-- 附件下载 -->
            <div v-if="item.attachment" class="attachment-link">
              <el-link type="primary" :href="item.attachment" target="_blank">
                <el-icon><document /></el-icon> 查看受制裁地区清单
              </el-link>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  Document,
  InfoFilled
} from '@element-plus/icons-vue'

// 模拟后端数据
const data = ref({
  max_coverage: [
    {"coverage_type": "船舶油污责任险", "amount": "6000万"},
    {"coverage_type": "船舶险（内河、沿海）", "amount": "8000万"},
    {"coverage_type": "船舶险（远洋）", "amount": "1亿"},
    {"coverage_type": "船舶建造险", "amount": "2亿"},
    {"coverage_type": "货运险", "amount": "2亿"},
    {"coverage_type": "保赔险（内河、沿海）", "amount": "4500万"}
  ], // 填充上述JSON数据
  exclusions:  [
    {"id": 1, "title": "未申报超赔业务", "content": "未通过申报的超赔保险业务"},
    {"id": 2, "title": "合约/强制再保", "content": "合约或者强制再保险业务"},
    {"id": 3, "title": "特殊标的除外", "content": "飞行器、航空战争、卫星或者航天保险业务"},
    {"id": 4, "title": "墨西哥海湾风暴", "content": "所有因在“墨西哥海湾”发生的被命名的和/或编号的风暴所导致的损失"},
    {"id": 5, "title": "特定海域业务", "content": "所有从“墨西哥海湾”或“北海”起航的业务"},
    {
      "id": 6,
      "title": "俄乌冲突条款",
      "content": "本再保险合同不承担由俄乌冲突和/或此类冲突扩大直接导致的所有损失、损害、责任或费用...",
      "highlight": ["俄罗斯", "白俄罗斯", "乌克兰"]
    },
    {
      "id": 7,
      "title": "五常战争条款",
      "content": "本再保险合同不承担因英国、美国、法国、俄罗斯联邦、中华人民共和国和任何北约成员国之间爆发战争所引起的损失...",
      "countries": ["英国", "美国", "法国", "俄罗斯", "中国", "北约成员国"]
    },
    {
      "id": 8,
      "title": "受制裁地区业务",
      "content": "所有涉及受制裁的国家/地区的水险业务",
      "attachment": "/api/attachments/sanctioned-regions.pdf"
    }
  ],
  retention_note: '最大自留额内的保单可直接获得超赔保障，不需安排临时分保'
})

const max_coverage = ref(data.value.max_coverage)
const exclusions = ref(data.value.exclusions)
const retention_note = ref(data.value.retention_note)
const activeExclusions = ref([1]) // 默认展开第一条
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
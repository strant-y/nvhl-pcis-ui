<template>
  <div class="card recent-activities">
    <div class="card-header">
      <h3>最新动态</h3>
      <a class="more">更多 →</a>
    </div>
    <div class="card-body">
      <div
        v-for="(item, idx) in activities"
        :key="idx"
        class="timeline-item"
      >
        <div class="timeline-dot" :class="item.dotColor"></div>
        <div class="timeline-content">
          <div class="tl-title">{{ item.title }}</div>
          <div class="tl-time">{{ item.time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DotColor } from "../types";

interface ActivityItem {
  title: string;
  time: string;
  dotColor: DotColor;
}

const activities = ref<ActivityItem[]>([
  { title: "张三 完成「财产综合险」方案配置", time: "10分钟前", dotColor: "" },
  { title: "李四 提交「雇主责任险」核保规则审核", time: "30分钟前", dotColor: "green" },
  { title: "王五 更新「工程一切险」费率配置", time: "1小时前", dotColor: "orange" },
  { title: "赵六 完成基础数据映射对齐", time: "2小时前", dotColor: "" },
]);
</script>

<style lang="scss" scoped>
.card {
  background: var(--dash-card-bg);
  border-radius: 10px;
  border: 1px solid var(--dash-card-border);
  overflow: hidden;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--dash-table-border);
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    font-size: 15px;
    font-weight: 600;
    color: var(--dash-text-primary);
  }

  .more {
    font-size: 13px;
    color: var(--dash-accent-blue-color);
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}

.card-body {
  padding: 20px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.timeline-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dash-accent-blue-color);
  margin-top: 5px;
  flex-shrink: 0;

  &.green {
    background: var(--dash-accent-green-color);
  }
  &.orange {
    background: var(--dash-accent-orange-color);
  }
}

.timeline-content {
  .tl-title {
    font-size: 13px;
    color: var(--dash-text-secondary);
    margin-bottom: 2px;
  }

  .tl-time {
    font-size: 12px;
    color: var(--dash-text-muted);
  }
}
</style>

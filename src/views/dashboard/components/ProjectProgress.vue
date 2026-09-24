<template>
  <div class="card project-progress">
    <div class="card-header">
      <h3>项目进度</h3>
      <a class="more">详情 →</a>
    </div>
    <div class="card-body">
      <div
        v-for="item in progressList"
        :key="item.name"
        class="progress-item"
      >
        <div class="prog-header">
          <span class="prog-name">{{ item.name }}</span>
          <span class="prog-val">{{ item.percentage }}%</span>
        </div>
        <div class="progress-bar">
          <div class="fill" :class="item.barColor" :style="{ width: item.percentage + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BarColor } from "../types";

interface ProgressItem {
  name: string;
  percentage: number;
  barColor: BarColor;
}

const progressList = ref<ProgressItem[]>([
  { name: "一期承保开发", percentage: 78, barColor: "blue" },
  { name: "二期老核心开发", percentage: 45, barColor: "green" },
  { name: "三期信保开发", percentage: 12, barColor: "orange" },
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

.progress-item {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  .prog-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .prog-name {
    font-size: 13px;
    color: var(--dash-text-secondary);
  }

  .prog-val {
    font-size: 13px;
    color: var(--dash-text-muted);
  }
}

.progress-bar {
  height: 8px;
  background: var(--dash-progress-bg);
  border-radius: 4px;
  overflow: hidden;

  .fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s;

    &.blue {
      background: linear-gradient(90deg, #3a76c5, #5ba0e6);
    }
    &.green {
      background: linear-gradient(90deg, #52c41a, #73d13d);
    }
    &.orange {
      background: linear-gradient(90deg, #fa8c16, #ffa940);
    }
  }
}
</style>

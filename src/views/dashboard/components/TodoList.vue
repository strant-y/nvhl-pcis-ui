<template>
  <div class="card todo-list">
    <div class="card-header">
      <h3>我的待办</h3>
      <a class="more">全部 →</a>
    </div>
    <div class="card-body">
      <div
        v-for="(item, idx) in todoList"
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

interface TodoItem {
  title: string;
  time: string;
  dotColor: DotColor;
}

const todoList = ref<TodoItem[]>([
  { title: "审核「公众责任险」投保规则", time: "截止 2026-07-16", dotColor: "" },
  { title: "确认方案商品审批流程设计", time: "截止 2026-07-18", dotColor: "orange" },
  { title: "完成险别编码映射核验", time: "截止 2026-07-20", dotColor: "green" },
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

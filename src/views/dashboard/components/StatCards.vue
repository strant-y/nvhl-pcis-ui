<template>
  <div class="stats">
    <div
      v-for="item in statList"
      :key="item.label"
      class="stat-card"
    >
      <div class="label">
        <span class="icon" :style="{ background: item.iconBg, color: item.iconColor }">
          {{ item.icon }}
        </span>
        {{ item.label }}
      </div>
      <div class="value" :class="item.valueColor">{{ item.value }}</div>
      <div class="trend">
        <span :class="item.trendUp ? 'up' : 'down'">
          {{ item.trendUp ? "↑" : "↓" }} {{ item.trendValue }}
        </span>
        较上月
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface StatItem {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  valueColor: "blue" | "green" | "orange" | "purple";
  trendUp: boolean;
  trendValue: string;
}

const statList = ref<StatItem[]>([
  {
    icon: "📦",
    iconBg: "var(--dash-accent-blue-bg)",
    iconColor: "var(--dash-accent-blue-color)",
    label: "产品总数",
    value: 128,
    valueColor: "blue",
    trendUp: true,
    trendValue: "12%",
  },
  {
    icon: "📋",
    iconBg: "var(--dash-accent-green-bg)",
    iconColor: "var(--dash-accent-green-color)",
    label: "方案配置",
    value: 356,
    valueColor: "green",
    trendUp: true,
    trendValue: "8%",
  },
  {
    icon: "⚙",
    iconBg: "var(--dash-accent-orange-bg)",
    iconColor: "var(--dash-accent-orange-color)",
    label: "规则总数",
    value: "1,024",
    valueColor: "orange",
    trendUp: true,
    trendValue: "5%",
  },
  {
    icon: "✅",
    iconBg: "var(--dash-accent-purple-bg)",
    iconColor: "var(--dash-accent-purple-color)",
    label: "本月上线",
    value: 18,
    valueColor: "purple",
    trendUp: false,
    trendValue: "3%",
  },
]);
</script>

<style lang="scss" scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--dash-card-bg);
  border-radius: 10px;
  padding: 20px;
  border: 1px solid var(--dash-card-border);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px var(--dash-hover-shadow);
  }

  .label {
    font-size: 13px;
    color: var(--dash-text-muted);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;

    .icon {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
  }

  .value {
    font-size: 28px;
    font-weight: 700;
    color: var(--dash-text-primary);
    line-height: 1;

    &.blue {
      color: var(--dash-accent-blue-color);
    }
    &.green {
      color: var(--dash-accent-green-color);
    }
    &.orange {
      color: var(--dash-accent-orange-color);
    }
    &.purple {
      color: var(--dash-accent-purple-color);
    }
  }

  .trend {
    font-size: 12px;
    color: var(--dash-text-muted);
    margin-top: 8px;

    .up {
      color: #52c41a;
    }
    .down {
      color: #ff4d4f;
    }
  }
}
</style>

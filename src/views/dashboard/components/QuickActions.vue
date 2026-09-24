<template>
  <div class="card quick-actions">
    <div class="card-header">
      <h3>快捷操作</h3>
    </div>
    <div class="card-body">
      <div class="quick-links">
        <div
          v-for="action in actions"
          :key="action.title"
          class="quick-link"
          @click="handleClick(action)"
        >
          <div class="ql-icon" :class="action.iconColor">{{ action.icon }}</div>
          <div class="ql-text">
            <h4>{{ action.title }}</h4>
            <p>{{ action.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IconColor } from "../types";

interface QuickAction {
  icon: string;
  iconColor: IconColor;
  title: string;
  description: string;
  path?: string;
  query?: Record<string, string>;
}

const router = useRouter();

const actions = ref<QuickAction[]>([
  {
    icon: "📦",
    iconColor: "blue",
    title: "新建产品",
    description: "创建新产品方案",
    path: "/prodconfiguration/prodFactoryInfo",
    query: { editType: "add", title: "新增-产品配置" },
  },
  {
    icon: "📋",
    iconColor: "green",
    title: "方案配置",
    description: "配置产品方案规则",
    path: "/goodsConfig/commodity-main",
  },
  {
    icon: "🔍",
    iconColor: "orange",
    title: "数据核验",
    description: "核验基础数据映射",
    path: "/prodconfiguration/prodFactory",
  },
  {
    icon: "📊",
    iconColor: "purple",
    title: "报表中心",
    description: "查看数据统计报表",
    path: "/prodconfiguration/prodFactory",
  },
]);

function handleClick(action: QuickAction) {
  if (!action.path) return;
  router.push({
    path: action.path,
    query: action.query ? { param: JSON.stringify(action.query) } : undefined,
  });
}
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
}

.card-body {
  padding: 20px;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--dash-quick-link-bg);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;

  &:hover {
    background: var(--dash-quick-link-hover-bg);
    border-color: var(--dash-quick-link-hover-border);
  }

  .ql-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;

    &.blue {
      background: var(--dash-accent-blue-bg);
      color: var(--dash-accent-blue-color);
    }
    &.green {
      background: var(--dash-accent-green-bg);
      color: var(--dash-accent-green-color);
    }
    &.orange {
      background: var(--dash-accent-orange-bg);
      color: var(--dash-accent-orange-color);
    }
    &.purple {
      background: var(--dash-accent-purple-bg);
      color: var(--dash-accent-purple-color);
    }
  }

  .ql-text {
    h4 {
      font-size: 13px;
      font-weight: 500;
      color: var(--dash-text-primary);
      margin-bottom: 2px;
    }

    p {
      font-size: 12px;
      color: var(--dash-text-muted);
    }
  }
}
</style>

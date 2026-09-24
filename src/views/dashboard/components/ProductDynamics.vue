<template>
  <div class="card product-dynamics">
    <div class="card-header">
      <h3>近期产品动态</h3>
      <a class="more" @click="handleMore">查看全部 →</a>
    </div>
    <div class="card-body">
      <table class="dyn-table">
        <thead>
          <tr>
            <th>产品名称</th>
            <th>类型</th>
            <th>状态</th>
            <th>更新时间</th>
            <th>负责人</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in productList" :key="item.name">
            <td>{{ item.name }}</td>
            <td>{{ item.type }}</td>
            <td>
              <span class="badge" :class="item.statusType">{{ item.status }}</span>
            </td>
            <td>{{ item.updateTime }}</td>
            <td>{{ item.owner }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BadgeType } from "../types";

interface ProductItem {
  name: string;
  type: string;
  status: string;
  statusType: BadgeType;
  updateTime: string;
  owner: string;
}

const router = useRouter();

const productList = ref<ProductItem[]>([
  { name: "诚泰财产综合险", type: "财产险", status: "已上线", statusType: "green", updateTime: "2026-07-15", owner: "张三" },
  { name: "雇主责任险A款", type: "责任险", status: "配置中", statusType: "blue", updateTime: "2026-07-14", owner: "李四" },
  { name: "工程一切险", type: "财产险", status: "审核中", statusType: "orange", updateTime: "2026-07-14", owner: "王五" },
  { name: "公众责任险", type: "责任险", status: "已上线", statusType: "green", updateTime: "2026-07-13", owner: "赵六" },
  { name: "货运运输险", type: "财产险", status: "已下架", statusType: "red", updateTime: "2026-07-12", owner: "孙七" },
]);

function handleMore() {
  router.push({ path: "/prodconfiguration/prodFactory" });
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
  padding: 0;
}

.dyn-table {
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 10px 12px;
    font-size: 12px;
    color: var(--dash-text-muted);
    font-weight: 500;
    background: var(--dash-table-header-bg);
    border-bottom: 1px solid var(--dash-table-border);
  }

  td {
    padding: 12px;
    font-size: 13px;
    color: var(--dash-text-secondary);
    border-bottom: 1px solid var(--dash-table-row-border);
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: var(--dash-hover-bg);
  }
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;

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
  &.red {
    background: var(--dash-accent-red-bg);
    color: var(--dash-accent-red-color);
  }
}
</style>

<template>
  <div class="app-container">
    <div v-for="(item, index) in projectList" :key="index" class="project-item">
      <div class="project-title" @click="handleClick(item)">
        {{ item.title }}
      </div>
      <div v-if="item.children" class="sub-project">
        <div v-for="(subItem, subIndex) in item.children" :key="subIndex">
          <span>{{ subItem }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const projectList = ref([
  {
    title: "大型代理平台",
    children: ["商品配置-API"],
  },
  {
    title: "大流量的互联网平台保险",
    children: ["商品配置-H5"],
  },
  {
    title: "线下代理渠道的线上出单",
    children: ["商品配置-IE出单"],
  },
  {
    title: "线下业务人员移动端展业",
    children: ["商品配置-二维码"],
  },
  {
    title: "商品查询",
    children: ["商品配置-ALL"],
  },
]);

function handleClick(item) {
  // Handle click event
  console.log(`Clicked on ${item.title}`);
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-wrap: wrap;
}

.project-item {
  flex: 0 0 33.33%; /* 每个项目占据三分之一的宽度 */
  box-sizing: border-box;
  border: 1px solid #ccc; /* 添加边框 */
  padding: 10px;
  margin-bottom: 10px;
}

.project-title {
  color: orange;
  cursor: pointer;
}

.sub-project {
  margin-left: 20px;
}
</style>

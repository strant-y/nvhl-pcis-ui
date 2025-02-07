<template>
  <el-dialog :title="title" v-model="visible" @close="handleClose" :width="width+'%'">
    <component
      :is="contentComponent"
      :key="componentKey"
      v-if="contentComponent"
      :data="data"
      :method="method"
      @handleClose="handleClose"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
const visible = ref(false);
const title = ref("");
const width = ref("90");
const contentComponent = ref(null); //组件映射
const data = ref({});         //数据映射
const method = ref({});       // 方法映射
const componentKey = ref(0);    // 添加 key 属性

const handleClose = () => {
  contentComponent.value = null;
   componentKey.value += 1; // 改变 key 值以强制重新渲染
  visible.value = false;
};

const open = (c, d, m, t) => {
  if(d){
    data.value = d;
  }
  if(m){
    method.value = m;
  }
  contentComponent.value = c;
  visible.value = true;
  if (t?.title) {
    title.value = t.title;
  }
  if (t?.width) {
    width.value = t.width;
  }
  componentKey.value += 1; // 改变 key 值以强制重新渲染
};

defineExpose({
  open
});
</script>

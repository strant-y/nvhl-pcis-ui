<template>
  <el-dialog
    v-model="dialogVisible"
    title="编辑特约"
    width="80%"
  >
    <el-input
      v-model="filterText"
      style="width: 500px"
      placeholder="输入机构代码或者机构名称查询，机构名称查询不得少于5个字符"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel" class="custom-button">取消</el-button>
        <el-button type="primary" @click="handleSave" class="custom-button"
          >保存</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from "vue";
const dialogVisible = ref(true);
const props = defineProps(['data'])
const rowData = ref(props.data)
//rowData当前行数据
/**
 * 拿到特约内容字段，通过***分割为数组，然后在html部分直接循环该数组，
 * 如果数组项为***则特换为input输入框，等用户输入完成后，再把数组join合并为实际的特约内容，回显到特约组件
 * 
 * 
 */
console.log('rowData', rowData)
const handleCancel = () => {
  dialogVisible.value = false;
};
const handleSave = () => {
  dialogVisible.value = false;
};

</script>
<style scoped>
</style>

<template>
  <el-dialog v-model="dialogVisible" title="编辑免赔内容" width="80%">
    <div class="form-item">
      <div class="content-container">
        <div
          v-if="rowData['cIfMust'] !== '9'"
          v-for="(item, index) in cNmeCnArray"
          :key="index"
          class="content-item"
        >
          <el-input
            v-if="item === '**'"
            v-model="inputValues[index]"
            @input="updateCNmeCn(index, $event)"
            :class="`input-${index}`"
            placeholder="请输入"
            size="small"
            style="font-size: 13px;"
          ></el-input>
          <span v-else>{{ item }}</span>
        </div>
        <div style="width: 60%" v-else>
          <el-input
              type="textarea"
              v-model="rowData.cDeductibleContent"
              placeholder="请输入"
              size="small"
              style="font-size: 14px;"
          ></el-input>
        </div>
      </div>
    </div>
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
import { ref, watch, onMounted, computed } from "vue";
const dialogVisible = ref(true);
const props = defineProps(["data", "callback"]);
const rowData = ref(props.data);
//rowData当前行数据
/**
 * 拿到特约内容字段，通过***分割为数组，然后在html部分直接循环该数组，
 * 如果数组项为***则特换为input输入框，等用户输入完成后，再把数组join合并为实际的特约内容，回显到特约组件
 *
 *
 */
console.log("rowData", rowData);
onMounted(() => {
  console.log("cNmeCnArray", cNmeCnArray.value);
});

// 使用正则表达式分割字符串，保留分隔符 ** 作为单独的数组项
const cNmeCnArray = computed(() => rowData.value.cDeductibleContent.split(/(\*+)/));
// const inputValues = ref<string[]>([]);
const inputValues = ref(
  cNmeCnArray.value.map((item) => (item === "**" ? "" : item))
);

const updateCNmeCn = (index: number, value: string) => {
  inputValues.value[index] = value;
};
const handleCancel = () => {
  dialogVisible.value = false;
  props.callback({type: 'close'});
};
const handleSave = () => {
  dialogVisible.value = false;
  if(rowData.value['cIfMust'] === "9") {
    const parts = cNmeCnArray.value.map((item, idx) =>
        item === "**" ? inputValues.value[idx] : item
    );
    rowData.value.cDeductibleContent = parts.join("");
  }
  props.callback({type: 'ok', data: rowData.value});
};
</script>
<style scoped>
.form-item {
  margin-left: 30px;
  margin-top: 20px;
  margin-bottom: 20px;
  font-size: 16px; /* 统一字体大小 */
}

.el-row {
  display: flex;
  align-items: center;
}

.el-col {
  display: flex;
  align-items: center;
}


.dialog-footer {
  text-align: right;
  margin-top: 20px;
}

.custom-button {
  font-size: 16px; /* 统一按钮字体大小 */
}
/* 为每个输入框添加不同的边框样式 */
.input-0 .el-input__inner {
  border-color: red; /* 示例颜色 */
}

.input-1 .el-input__inner {
  border-color: blue; /* 示例颜色 */
}
.content-container {
  display: flex;
  flex-wrap: wrap;
}

.content-item {
  display: inline-block;
  margin-right: 5px; /* 调整间距 */
  height: 30px;
  display: flex;
  align-items: end;
}
</style>

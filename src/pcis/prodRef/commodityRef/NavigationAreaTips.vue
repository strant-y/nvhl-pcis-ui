<template>
  <div class="navigation-area-table">
    <el-table
        :data="tableData"
        border
        style="width: 100%"
        :span-method="objectSpanMethod"
        :show-header="false"
        :cell-style="{ padding: '8px' }"
    >
      <el-table-column prop="category" width="120">
        <template #default="{ row }">
          <div class="wrap-content">
            {{ row.category }}
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="area" width="200">
        <template #default="{ row }">
          <div class="wrap-content">
            {{ row.area }}
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="description">
        <template #default="{ row }">
          <div class="wrap-content">
            {{ row.description }}
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import {codelistQuery} from "@/api/dict";

const tableData = ref([]);
onMounted(() => {
  refreshData();
});
function transformAreaData(data) {
  const result = [];
  let currentKey = '';
  let currentCategory = '';

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const { label, value, tip } = item;

    // 如果是顶级分类（如 B01、B02、B03）
    if (/^B\d{2}$/.test(value)) {
      currentKey = value;
      currentCategory = label;
    } else {
      const next = data[i + 1];

      // 如果下一个是当前项的子项（value 以当前项开头且更长）
      if (next && next.value.startsWith(value)) {
        result.push({
          key: currentKey,
          category: currentCategory,
          area: label,
          description: next.tip || next.label
        });
        i++; // 跳过子项
      } else {
        result.push({
          key: currentKey,
          category: currentCategory,
          area: label,
          description: tip || label
        });
      }
    }
  }

  return result;
}
const spanArr = ref([]);
const refreshData = () => {
  const param = {
    codeListName: "Sailing_Area_Knowledge",
  }
  // 查询列表数据
  codelistQuery(param).then((response) => {
    if (response.code === 200) {
      tableData.value = transformAreaData(response.data)
      spanArr.value = getSpanArr(tableData.value)
    } else {
      ElMessage.error(response.msg);
    }
  });
};
// 合并单元格逻辑
const getSpanArr = (data) => {
  const spanArr = [];
  let pos = 0;

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      spanArr.push(1);
      pos = 0;
    } else {
      if (data[i].category === data[i - 1].category) {
        spanArr[pos] += 1;
        spanArr.push(0);
      } else {
        spanArr.push(1);
        pos = i;
      }
    }
  }
  return spanArr;
};


const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  if (columnIndex === 0) {
    const rowspan = spanArr.value[rowIndex];
    const colspan = rowspan > 0 ? 1 : 0;
    return {
      rowspan,
      colspan
    };
  }
};
</script>

<style scoped>
.navigation-area-table {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.wrap-content {
  white-space: normal;
  word-break: break-all;
  line-height: 1.5;
}

/* 调整表格行高以适应换行内容 */
:deep(.el-table .el-table__row) {
  height: auto;
}

:deep(.el-table .el-table__cell) {
  padding: 8px;
}
</style>
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

      <el-table-column prop="area" width="150">
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

const tableData = ref([
  {
    category: '国际海域',
    area: '近洋航区',
    description: '北纬55度至北回归线之间与东经142度以西的太平洋水域以及北回归线至赤道之间与东经99度以东，东经130度以西所包括的太平洋水域（俗称东南亚航线、中日韩航线）'
  },
  {
    category: '国际海域',
    area: '无限航区（远洋YY）',
    description: '海上任何通航水域包括世界各国的开放港口和国际通航运河及河流。'
  },
  {
    category: '国内海域',
    area: '遮蔽航区',
    description: '系指在沿海航区内，由海岸与岛屿、岛屿与岛屿围成的遮蔽条件较好、波浪较小的海域。在该海域内岛屿之间、岛屿与海岸之间的横跨距离应不超过10m mile。'
  },
  {
    category: '国内海域',
    area: '沿海航区',
    description: '系指台湾岛东海岸、台湾海峡东南海岸、海南岛东海岸及南海岸距岸不超过10m mile的海域和除上述海域外距岸不超过20m mile的海域；距有避风条件且有施救能力的沿海岛屿不超过20m mile的海域。'
  },
  {
    category: '国内海域',
    area: '近海航区',
    description: '系指中国渤海、黄海及东海岸距岸不超过200m mile的海域；台湾海峡：南海距岸不超过120m mile（台湾岛东海岸、海南岛东海岸及南海岸距岸不超过50m mile）的海域。'
  },
  {
    category: '国内海域',
    area: '远海航区',
    description: '系指国内航行超出近海航区的海域'
  },
  {
    category: '国内内河',
    area: '内河A级',
    description: '内河急流航段（在选择内河B级和内河C级的时候，允许选择内河J1级、内河J2级）'
  },
  {
    category: '国内内河',
    area: '内河B级',
    description: '内河J1级'
  },
  {
    category: '国内内河',
    area: '内河C级',
    description: '内河J2级'
  }
]);
onMounted(() => {
  refreshData();
});
const refreshData = () => {
  const param = {
    codeListName: "Sailing_Area",
  }
  // 查询列表数据
  codelistQuery(param).then((response) => {
    if (response.code === 200) {
      debugger
      console.log('response.data',response.data)
      list.value = response.data;
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

const spanArr = ref(getSpanArr(tableData.value));

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
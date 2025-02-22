<template>
  <div class="searchbar">
    <el-card shadow="never" class="table-container">
      <template #header>
        <template v-for="(item, index) in tableConfig.titleBtns" :key="index">
          <rt-button :item="item" />
        </template>
      </template>
      <div class="form-inner">
        <rttable
          v-model="dataList"
          :item="appgrideditConfig"
          ref="rttableFrom"
          @selection-change="handleSelectionChange"
          @status-change="handleStatusChange"
        />
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          layout="prev, pager, next, jumper"
          :total="pageresult.total"
          v-if="tableConfig.isPage"
          @size-change="pageChange"
          @current-change="pageChange"
        />
        <div
          style="margin-top: 20px"
          :style="{ textAlign: tableConfig.endBtnsPosition }"
          v-if="tableConfig.endBtns && tableConfig.endBtns.length > 0"
        >
          <template v-for="(item, index) in tableConfig.endBtns" :key="index">
            <rt-button :item="item" />
          </template>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { AppGridEditConfig } from "./app-grid-edit-config";
import { AppTableConfig } from "./app-table-config";
import { ref, reactive, defineEmits, defineProps, onMounted, watch } from "vue";

defineOptions({
  name: "AppTable",
  inheritAttrs: false,
});

const emits = defineEmits(["pageChange", "selection-change", "status-change"]); // 父组件监听事件，同步子组件值的变化给父组件

const queryParams = reactive<PageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const appgrideditConfig = reactive<AppGridEditConfig>({
  editFlag: false, //是否可以编辑
});
const dataList = ref<any>([]);
const rttableFrom = ref<any>(null);

const props = defineProps({
  tableConfig: {
    type: Object as () => AppTableConfig,
    required: true,
  },

  pageresult: {
    type: Object as () => Pageresult,
    required: true,
  },
  // 新增属性，用于接收默认选中的行数据
  defaultSelectedRows: {
    type: Array as () => any[],
    default: () => [],
  },
});

watch(
  () => props.tableConfig,
  (newTableConfig) => {
    Object.assign(appgrideditConfig, newTableConfig);
    appgrideditConfig.editFlag = false;
  },
  { deep: true }
);

watch(
  () => props.pageresult,
  (newPageresult) => {
    dataList.value = newPageresult.list;
    // 数据更新后，设置默认选中的行
    if (rttableFrom.value && props.defaultSelectedRows.length > 0) {
      rttableFrom.value.toggleRowSelection(props.defaultSelectedRows, true);
    }
  },
  { deep: true }
);

onMounted(() => {
  Object.assign(appgrideditConfig, props.tableConfig);
  appgrideditConfig.editFlag = false;
  // 组件挂载后，设置默认选中的行
  if (rttableFrom.value && props.defaultSelectedRows.length > 0) {
    console.log("设置默认选中的行", props.defaultSelectedRows);
    rttableFrom.value.toggleRowSelection(props.defaultSelectedRows, true);
  }
});

function handleSelectionChange(selectedRows: any[]) {
  emits("selection-change", selectedRows);
}
function handleStatusChange(row: any) {
  emits("status-change", row); // 触发事件并传递行对象
}

function pageChange() {
  emits("pageChange");
}

function getPartnerPage(flag = true) {
  if (flag) {
    queryParams.pageNum = 1;
  }
  return queryParams;
}

defineExpose({
  getPartnerPage,
});
</script>

<style scoped>
.searchbar {
  border: 1px solid #ddd;
  box-shadow: 0 0 2px rgb(0 0 0 / 30%);
}
</style>

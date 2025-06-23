<template>
  <div class="searchbar">
    <el-card shadow="never" class="table-container">
      <template
        #header
        v-if="
          tableConfig.showEdit ||
          tableConfig.formconfig?.titleBtns.length > 0 ||
          tableConfig.titleBtns.length > 0
        "
      >
        <el-row justify="space-between" v-if="tableConfig.showEdit">
          <el-col :span="24">
            <dynamic-forms
              :fromSchema="tableConfig.formconfig.fromSchema"
              :fromUi="tableConfig.formconfig.fromUi"
              ref="dynamicForm"
            />
          </el-col>
        </el-row>
        <el-row
          justify="space-between"
          v-if="tableConfig.formconfig?.titleBtns.length > 0"
        >
          <el-col :span="24" :style="{textAlign:tableConfig.titleBtnPosition}">
            <template
              v-for="(item, index) in tableConfig.formconfig?.titleBtns"
              :key="index"
            >
              <template v-if="!item.hidden">
                <rt-button :item="item" :ref="(res: any) => {btnMap[item?.id] = item}"/>
              </template>
            </template>
          </el-col>
        </el-row>
        <el-row justify="space-between" v-if="tableConfig.titleBtns.length > 0">
          <el-col :span="24" :style="{textAlign:tableConfig.titleBtnPosition}" >
            <template
              v-for="(item, index) in tableConfig.titleBtns"
              :key="index"
            >
              <template v-if="!item.hidden">
                <rt-button :item="item" :ref="(res: any) => {btnMap[item?.id] = item}"/>
              </template>
            </template>
          </el-col>
        </el-row>
      </template>
      <template
        #header
        v-else-if="
          tableConfig.fromUi.showTitleBar
            ? tableConfig.fromUi.showTitleBar
            : true
        "
      >
        <el-row justify="space-between">
          <el-col :span="4" v-if="!tableConfig.production">
            {{ tableConfig.title }}
          </el-col>
          <el-col :span="4" v-if="tableConfig.production">
            <el-tooltip :content="tableConfig.productionTitle">
              {{ tableConfig.title }}
            </el-tooltip>
          </el-col>
        </el-row>
      </template>
      <div class="form-inner">
        <rttable
          v-model="dataList"
          :item="appgrideditConfig"
          ref="rttableFrom"
          @selection-change="handleSelectionChange"
          @status-change="handleStatusChange"
          @row-click="handleRowClick"
        />
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          layout="total, prev, pager, next, jumper"
          :total="pageresult.total"
          v-if="tableConfig.isPage && pageresult.total > 0"
          @size-change="pageChange"
          @current-change="pageChange"
        />
        <div
          style="margin-top: 20px"
          :style="{ textAlign: tableConfig.endBtnsPosition }"
          v-if="tableConfig.endBtns && tableConfig.endBtns.length > 0"
        >
          <template v-for="(item, index) in tableConfig.endBtns" :key="index">
            <rt-button :item="item" :ref="(res: any) => { btnMap[item?.id] = item}"/>
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
import { dynamicFormMethod } from "./dynamic-form-config";

defineOptions({
  name: "AppTable",
  inheritAttrs: false,
});

const btnMap = ref({});
const emits = defineEmits(["pageChange", "selection-change", "status-change", "rowClick"]); // 父组件监听事件，同步子组件值的变化给父组件

const queryParams = reactive<PageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const appgrideditConfig = reactive<AppGridEditConfig>({
  editFlag: false, //是否可以编辑
});
const dynamicForm = ref<dynamicFormMethod | null>(null);
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
  },
  { deep: true }
);

onMounted(()=>{
  Object.assign(appgrideditConfig, props.tableConfig);
  appgrideditConfig.editFlag = false;
  nextTick(()=>{
    dataList.value = props.pageresult?.list;
  })
})



function handleSelectionChange(selectedRows: any[]) {
  emits("selection-change", selectedRows);
}
function handleStatusChange(val: any, row: any) {
  emits("status-change", val, row); // 传递当前行的数据
}
function handleRowClick(row: any) {
  emits("rowClick", row);
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
function getFromValue() {
  if (dynamicForm.value) {
    return dynamicForm?.value.getFromValue();
  } else {
    return null;
  }
}
function setFormSchema(rowId: string,props:any,schama:any,value:any){
  return rttableFrom.value?.setFormSchema(rowId,props,schama,value);
}
function setValueByRowKey(props:string ,rowId: any, value:any){
  return rttableFrom.value?.setValueByRowKey(props,rowId,value);
}
function getRowById(dataId: string) {
  return rttableFrom.value?.getRowById(dataId);
}

function getselectionData() {
  return rttableFrom.value?.getselectionData();
}

function getRowAllItemRefById(id: string) {
  return rttableFrom.value?.getRowAllItemRefById(id);
}

function clearSelection() {
  rttableFrom.value?.clearSelection();
}

function toggleRowSelection(row: any, selected: boolean) {
  rttableFrom.value?.toggleRowSelection(row, selected);
}

function getFormBtn() {
  return btnMap.value
}
function getTableBtn() {
  const map = ref({});
  appgrideditConfig.tableBtn?.forEach((btn: any) => {
    if(btn.id) {
      map.value[btn.id] = btn
    }
  });
  return map.value
}

defineExpose({
  getPartnerPage,
  getFromValue,
  setFormSchema,
  setValueByRowKey,
  getselectionData,
  getRowAllItemRefById,

  clearSelection,
  toggleRowSelection,
  getFormBtn,
  getTableBtn
});
</script>

<style lang="scss" scoped>
.searchbar {
  border: 1px solid #ddd;
  box-shadow: 0 0 2px rgb(0 0 0 / 30%);
}
.table-container ::v-deep .el-card__header {
  background-color: #d0f3fc4d !important;
}
.table-container {
  margin-top: 0px;
  margin-bottom: 0px;
}
</style>

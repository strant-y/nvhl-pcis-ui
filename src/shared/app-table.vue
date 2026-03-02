<template>
  <div class="searchbar">
    <el-card
        shadow="hover"
        :class="['card_container', 'table-container',tableConfig.titleBtns.length > 0 ? 'table_header_has-title-btns' : 'table_header']"
    >
      <template
          #header
          v-if="(tableConfig.title && tableConfig.title.length > 0 ) ||
              (tableConfig?.formconfig?.titleBtns?.filter(f => !f.hidden).length > 0) ||
              (tableConfig?.titleBtns?.filter(f => !f.hidden).length > 0)
          "
      >
        <el-row justify="space-between" v-if="tableConfig.showEdit && tableConfig.formconfig.fromSchema && tableConfig.formconfig.fromSchema.length > 0">
          <el-col :span="24">
            <dynamic-forms
              :fromSchema="tableConfig.formconfig.fromSchema"
              :fromUi="tableConfig.formconfig.fromUi"
              ref="dynamicForm"
            />
          </el-col>
        </el-row>
        <el-row
          style="padding-right: 3px;"
          justify="space-between"
          v-if="tableConfig.title || tableConfig.formconfig?.titleBtns.length > 0 || tableConfig?.titleBtns?.length > 0"
        >
          <el-col :span="5" v-if="tableConfig.title && tableConfig.title.length > 0">
            <span class="card-title-style">{{ tableConfig.title }}</span>
          </el-col>
          <el-col
              v-if="tableConfig.formconfig?.titleBtns.length > 0"
              :span="tableConfig.title && tableConfig.title.length > 0 ? 19 : 24"
              :style="{textAlign: tableConfig.tableBtnPosition ? tableConfig.tableBtnPosition : 'right', lineHeight: '20px'}"
          >
            <el-button-group>
              <template
                v-for="(item, index) in tableConfig.formconfig?.titleBtns"
                :key="index"
              >
                <template v-if="!item.hidden">
                  <rt-button :item="item" :ref="(res: any) => {btnMap[item?.id] = item}"/>
                </template>
              </template>
            </el-button-group>
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
          tableConfig.fromUi.showTitleBar && tableConfig.title && tableConfig.title.length > 0
        "
      >
        <el-row justify="space-between">
          <el-col :span="4" v-if="!tableConfig.production">
            <span class="card-title-style">{{ tableConfig.title }}</span>
          </el-col>
          <el-col :span="4" v-if="tableConfig.production">
            <el-tooltip :content="tableConfig.productionTitle">
              <span class="card-title-style">{{ tableConfig.title }}</span>
            </el-tooltip>
          </el-col>
        </el-row>
      </template>
      <div class="form-inner">
        <slot name="title-info"/>
        <rttable
          v-model="dataList"
          :item="appgrideditConfig"
          ref="rttableFrom"
          @selection-change="handleSelectionChange"
          @status-change="handleStatusChange"
          @row-click="handleRowClick"
        >
          <template v-for="(_, slotName) in $slots" #[slotName]="slotData">
            <slot :name="slotName" v-bind="slotData" />
          </template>
        </rttable>
        <el-config-provider :locale="enLocale">
          <el-pagination
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            layout="total, prev, pager, next, jumper"
            :total="pageresult.total"
            v-if="tableConfig.isPage && pageresult.total > 0"
            @size-change="pageChange"
            @current-change="pageChange"
          />
        </el-config-provider>
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
import zhCn from "element-plus/es/locale/lang/zh-cn";

defineOptions({
  name: "AppTable",
  inheritAttrs: false,
});
const enLocale = zhCn;
const codeListMap = ref<any>({});
const customMap = ref<any>({});
provide('codeListMap', codeListMap.value);
provide('customMap', customMap.value);
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
  emits("pageChange", queryParams);
}

function getPartnerPage(flag = true) {
  if (flag) {
    queryParams.pageNum = 1;
  }
  return queryParams;
}
function setPartnerPage(params: PageQuery) {
  if (params) {
    queryParams.pageNum = params.pageNum ? params.pageNum : 1;
    queryParams.pageSize = params.pageSize ? params.pageSize : 10;
  }
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
function getCodeListMap() {
  return codeListMap.value;
}
function addCodeListMap(data: any) {
  const {code, list} = data;
  if(!code || !list) {
    console.warn("setCodeListMap warn , code or list is empty!");
    return;
  }
  codeListMap.value[code] = list;
}
function setCodeListMap(map: any) {
  if(map) {
    Object.assign(codeListMap.value, map);
  }
}
function setRowFieldProp(rowId: string, field: string, prop: string, value: any) {
  return rttableFrom.value?.setRowFieldProp(rowId, field, prop, value);
}

function getTableValues(){
  return rttableFrom.value?.getTableValues();
}

defineExpose({
  getPartnerPage,
  getFromValue,
  setFormSchema,
  setValueByRowKey,
  getselectionData,
  getRowAllItemRefById,
  setPartnerPage,
  clearSelection,
  toggleRowSelection,
  getFormBtn,
  getTableBtn,
  getCodeListMap,
  addCodeListMap,
  setCodeListMap,
  setRowFieldProp,
  getTableValues,
});
</script>

<style lang="scss" scoped>
@import "@/styles/custom-index";
.searchbar {


}
.table-container ::v-deep .el-card__header {
  // background-color: #d0f3fc4d !important;
}
.table-container {
  margin-top: 0px;
  margin-bottom: 0px;
}
.table_header :deep(.el-card__header) {
  //height: 32px;
  //padding: 4px 0 4px 12px;
  //background: #ffffff;
}

.table_header_has-title-btns :deep(.el-card__header) {
  //padding: 10px 20px;
}
:deep(.el-card__body) {
  padding: 10px 20px;
}
</style>

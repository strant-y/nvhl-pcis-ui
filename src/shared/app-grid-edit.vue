<template>
  <div v-if="gridEditConfig" class="freeedit">
    <div class="searchbar">
      <el-row :gutter="16">
        <el-col :md="24">
          <el-card>
            <template #header>
              <el-row justify="space-between">
                <el-col :span="4" v-if="!gridEditConfig.production">
                  {{ gridEditConfig.title }}
                </el-col>
                <el-col :span="4" v-if="gridEditConfig.production">
                  <el-tooltip :content="gridEditConfig.productionTitle">
                    {{ gridEditConfig.title }}
                  </el-tooltip>
                </el-col>
                <el-col
                  :span="20"
                  style="text-align: right"
                  v-if="
                    gridEditConfig.titleBtns &&
                    gridEditConfig.titleBtns.length > 0
                  "
                >
                  <el-button-group>
                    <template
                      v-for="(item, index) in gridEditConfig.titleBtns"
                      :key="index"
                    >
                      <template v-if="!item.hidden">
                        <rt-button :item="item" :ref="(res: any) => {btnMap[item?.id] = item}"/>
                      </template>
                    </template>
                  </el-button-group>
                  <a
                    style="margin-left: 20px"
                    @click="showMyfrom = !showMyfrom"
                    v-if="
                      gridEditConfig.showMyfromBtm
                        ? gridEditConfig.showMyfromBtm
                        : false
                    "
                  >
                    <el-icon v-if="!showMyfrom"><ArrowUpBold /></el-icon>
                    <el-icon v-if="showMyfrom"><ArrowDownBold /></el-icon>
                    {{ showMyfrom ? "点击折叠" : "点击展开" }}
                  </a>
                </el-col>
              </el-row>
            </template>
            <div class="form-inner" v-if="showMyfrom">
              <rttable
                v-model="tableDatas"
                :item="gridEditConfig"
                :parentFromUi="gridEditConfig"
                @row-click="handleRowClick"
                ref="rttableFrom"
              />
              <div
                style="margin-top: 20px"
                :style="{ textAlign: gridEditConfig.endBtnsPosition }"
                v-if="
                  gridEditConfig.endBtns && gridEditConfig.endBtns.length > 0
                "
              >
                <template
                  v-for="(item, index) in gridEditConfig.endBtns"
                  :key="index"
                >
                  <template v-if="!item.hidden">
                    <rt-button :item="item" :ref="(res: any) => {btnMap[item?.id] = item}"/>
                  </template>
                </template>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AppGridEditConfig, AppGridEditMethod } from "./app-grid-edit-config";
import {ref} from "vue";
defineOptions({
  name: "AppGridEdit",
  inheritAttrs: false,
});
const emits = defineEmits([ "rowClick"]); // 父组件监听事件，同步子组件值的变化给父组件

const props = defineProps({
  gridEditConfig: {
    type: Object as () => AppGridEditConfig,
    required: true,
  },
});

const btnMap = ref({});
const { gridEditConfig } = toRefs(props);

const tableDatas = ref<any[] | undefined>([]);

const showMyfrom = ref(true);
showMyfrom.value = props.gridEditConfig?.showMyfrom
  ? props.gridEditConfig?.showMyfrom
  : true;

const rttableFrom = ref<AppGridEditMethod | null>(null);

function getFromValue() {
  return tableDatas.value;
}

function setFormValue(data: any) {
  tableDatas.value = data;
}
function validate() {
  const pro = rttableFrom.value?.tableExvalidate();
  return pro;
}

function handleRowClick(row: any) {
  emits("rowClick", row);
}

function getTableValue() {
  return tableDatas.value;
}

function addRow() {
  rttableFrom.value?.addRow();
}

function delRow(editIndex: any) {
  rttableFrom.value?.delRow(editIndex);
}

function addRowByData(data: any) {
  rttableFrom.value?.addRowByData(data);
}

function setDisabledAll() {
  if (
    props.gridEditConfig.titleBtns &&
    props.gridEditConfig.titleBtns.length > 0
  ) {
    props.gridEditConfig.titleBtns.forEach((item) => {
      item.hidden = true;
    });
  }
  if (props.gridEditConfig.endBtns && props.gridEditConfig.endBtns.length > 0) {
    props.gridEditConfig.endBtns.forEach((item) => {
      item.hidden = true;
    });
  }
  gridEditConfig.value.editFlag = false;
}

function getSelectRow() {
  return rttableFrom.value?.getSelectRow();
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
function setRowFieldProp(rowId: string, field: string, prop: string, value: any) {
  return rttableFrom.value?.setRowFieldProp(rowId, field, prop, value);
}

function getFormBtn() {
  return btnMap.value
}

function getTableBtn() {
  const btnMap = ref({});
  gridEditConfig.value.tableBtn?.forEach((btn: any) => {
    if(btn.id) {
      btnMap.value[btn.id] = btn
    }
  });
  return btnMap.value
}


defineExpose({
  getFromValue,
  setFormValue,
  validate,
  getTableValue,
  addRow,
  delRow,
  addRowByData,
  getSelectRow,
  setDisabledAll,
  setFormSchema,
  setValueByRowKey,
  getRowById,
  setRowFieldProp,
  getFormBtn,
  getTableBtn
});
</script>

<style scoped>
:deep(.el-card__header) {
  background-color: #e5f3fa;
  padding: 15px 20px;
}

.searchbar {
  border: 1px solid #ddd;
  box-shadow: 0 0 2px rgb(0 0 0 / 30%);
}
::v-deep .el-form-item {
  margin-bottom: 0px !important; /* 使内容显示更近紧促 */
}
</style>

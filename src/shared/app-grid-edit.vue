<template>
  <div v-if="gridEditConfig" class="freeedit">
    <div class="searchbar">
      <el-row :gutter="16">
        <el-col :md="24">
          <el-card shadow="hover" class="card_container">
            <template #header v-if=" gridEditConfig.fromUi.showTitleBar && gridEditConfig.title && gridEditConfig.title.length > 0">
              <el-row justify="space-between">
                <el-col :span="4" v-if="!gridEditConfig.production">
                  <span class="card-title-style">{{ gridEditConfig.title }}</span>
                </el-col>
                <el-col :span="4" v-if="gridEditConfig.production">
                  <el-tooltip :content="gridEditConfig.productionTitle">
                    <span class="card-title-style">{{ gridEditConfig.title }}</span>
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
                    <el-icon v-if="!showMyfrom" color="var(--el-text-color)"><ArrowUpBold/></el-icon>
                    <el-icon v-if="showMyfrom" color="var(--el-text-color)"><ArrowDownBold/></el-icon>
                    <span class="right-arrow_text">{{ showMyfrom ? "点击折叠" : "点击展开" }}</span>
                  </a>
                </el-col>
              </el-row>
            </template>
            <div class="form-inner" v-show="showMyfrom">
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
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
defineOptions({
  name: "AppGridEdit",
  inheritAttrs: false,
});
const emits = defineEmits([ "rowClick","updateDatas"]); // 父组件监听事件，同步子组件值的变化给父组件
const props = defineProps({
  gridEditConfig: {
    type: Object as () => AppGridEditConfig,
    required: true,
  },
});
const codeListMap = ref<any>({});
const customMap = ref<any>({});
provide('codeListMap', codeListMap.value);
provide('customMap', customMap.value);
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
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

const notFlush = ref(false);
function setFormValue(data: any) {
  notFlush.value = true;
  tableDatas.value = data;
  nextTick(()=>{
    notFlush.value = false;
  })
}
function validate() {
  return new Promise((resolve) => {
    rttableFrom.value?.tableExvalidate().then((valid: any) => {
      if(!valid) {
        if(idxParam && idxParam.handleAnchorClick && customMap.value?.domId) {
          idxParam.handleAnchorClick(undefined,`#${customMap.value?.domId}`)
        }
      }
      resolve(valid);
    });
  });
}
watch([() => tableDatas.value],([newFormData])=>{
  if(!notFlush.value){  // 增加不允许刷新机制,如果从上层下来的数据,不进行数据刷新
    emits("updateDatas", newFormData);
  }
},{
  deep:true
})

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
function spliceTableData(index: number, delCount: number, list: any[]) {
  rttableFrom.value?.spliceTableData(index, delCount, list);
}

function setDisabledAll(isDisabled: boolean = true) {
  if (
    props.gridEditConfig.titleBtns &&
    props.gridEditConfig.titleBtns.length > 0
  ) {
    props.gridEditConfig.titleBtns.forEach((item) => {
      item.hidden = isDisabled;
    });
  }
  if (props.gridEditConfig.endBtns && props.gridEditConfig.endBtns.length > 0) {
    props.gridEditConfig.endBtns.forEach((item) => {
      item.hidden = isDisabled;
    });
  }
	
  if (props.gridEditConfig.bottomBtn && Object.keys(props.gridEditConfig.bottomBtn).length > 0) {
    props.gridEditConfig.bottomBtn.hidden = isDisabled;
  }
  gridEditConfig.value.editFlag = !isDisabled;
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
function getRowAllItemRefById(rowId:string){
  return rttableFrom.value?.getRowAllItemRefById(rowId);
}

function getFormBtn() {
  return btnMap.value
}

function getTableBtn() {
  const btnMap = ref<any>({});
  if(gridEditConfig.value?.bottomBtn) {
    btnMap.value['bottomBtn'] = gridEditConfig?.value.bottomBtn
  }
  gridEditConfig.value.tableBtn?.forEach((btn: any) => {
    if(btn.id) {
      btnMap.value[btn.id] = btn
    }
  });
  return btnMap.value
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
const addProvide = <T>(key: InjectionKey<T> | string, value: T) => {
  customMap.value[key] = value;
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
  getTableBtn,
  getCodeListMap,
  setCodeListMap,
  addCodeListMap,
  getRowAllItemRefById,
  spliceTableData,
  addProvide
});
</script>

<style scoped>
:deep(.el-card__header) {
  height: 32px;
  padding: 4px 0 4px 12px;
}

.searchbar {
}
::v-deep .el-form-item {
  margin-bottom: 0px !important; /* 使内容显示更近紧促 */
}
</style>

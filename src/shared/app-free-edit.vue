<template>
  <div v-if="freeEditConfig" class="freeedit">
    <div class="searchbar">
      <el-row :gutter="16">
        <el-col :md="24">
          <el-card>
            <template
              #header
              v-if="
                freeEditConfig.fromUi.showTitleBar
                  ? freeEditConfig.fromUi.showTitleBar
                  : true
              "
            >
              <el-row justify="space-between">
                <el-col :span="4" v-if="!freeEditConfig.production">
                  {{ freeEditConfig.title }}
                </el-col>
                <el-col :span="4" v-if="freeEditConfig.production">
                  <el-tooltip :content="freeEditConfig.productionTitle">
                    {{ freeEditConfig.title }}
                  </el-tooltip>
                </el-col>
                <el-col
                  :span="20"
                  style="text-align: right"
                  v-if="
                    (freeEditConfig.titleBtns &&
                      freeEditConfig.titleBtns.length > 0) ||
                    (freeEditConfig.showMyfromBtm
                      ? freeEditConfig.showMyfromBtm
                      : false)
                  "
                >
                  <el-button-group>
                    <template
                      v-for="(item, index) in freeEditConfig.titleBtns"
                      :key="index"
                    >
                      <template v-if="!item.hidden">
                        <rt-button :item="item" :ref="(res: any) => {btnMap[item?.id] = item}"/>
                      </template>
                    </template>
                  </el-button-group>
                  <a
                    style="margin-left: 20px"
                    @click="changeMyfrom()"
                    v-if="
                      freeEditConfig.showMyfromBtm
                        ? freeEditConfig.showMyfromBtm
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
            <div class="form-inner" v-show="showMyfrom">
              <dynamic-forms
                :fromSchema="freeEditConfig.fromSchema"
                :fromUi="freeEditConfig.fromUi"
                ref="dynamicForm"
                @forms-data-update="updateDatas"
              />
              <el-card
                v-if="
                  freeEditConfig.superFromSchema &&
                  freeEditConfig.superFromSchema.length > 0
                "
              >
                <template #header>
                  <a @click="superFromState = !superFromState">
                    <el-icon v-if="!superFromState"><ArrowUpBold /></el-icon>
                    <el-icon v-if="superFromState"><ArrowDownBold /></el-icon>
                    {{
                      superFromState
                        ? freeEditConfig.superFromClose
                        : freeEditConfig.superFromShow
                    }}
                  </a>
                </template>
                <dynamic-forms
                  v-if="superFromState"
                  :fromSchema="freeEditConfig.superFromSchema"
                  :fromUi="
                    freeEditConfig.superFromUi
                      ? freeEditConfig.superFromUi
                      : freeEditConfig.fromUi
                  "
                  ref="superDynamicForm"
                  @forms-data-update="updateDatas"
                />
              </el-card>
              <div
                style="margin-top: 20px"
                :style="{ textAlign: freeEditConfig.endBtnsPosition }"
                v-if="
                  freeEditConfig.endBtns && freeEditConfig.endBtns.length > 0
                "
              >
                <template
                  v-for="(item, index) in freeEditConfig.endBtns"
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
import { AppFreeEditConfig, AppFreeEditMethod } from "./app-free-edit-config";
import {ref} from "vue";
defineOptions({
  name: "AppFreeEdit",
  inheritAttrs: false,
});

const props = defineProps({
  freeEditConfig: {
    type: Object as () => AppFreeEditConfig,
    required: true,
  },
});
const codeListMap = ref<any>({});
provide('codeListMap', codeListMap.value);
const btnMap = ref({});
const { freeEditConfig } = toRefs(props);
const emits = defineEmits(["updateDatas"]); // 父组件监听事件，同步子组件值的变化给父组件

const formData = ref({});   // 临时存储数据,用于折叠式,数据回显
function updateDatas(newDatas: any) {
  formData.value = newDatas;
  emits("updateDatas", newDatas);
}
function changeMyfrom() {
  showMyfrom.value = !showMyfrom.value;
  nextTick(() => {
    dynamicForm.value?.setFormValue(formData.value);
  });
}
const showMyfrom = ref(false);
showMyfrom.value = props.freeEditConfig?.showMyfrom
  ? props.freeEditConfig?.showMyfrom
  : false;

interface dynamicFormMethod {
  getFromValue: () => any;
  setFormValue: (data: any, noupdate?: boolean) => void;
  validate: () => any;
  setValue: (key: any, value: any) => void;
  getValue: (key: any) => any;
  checkKey: (key: any) => boolean;
  clearValidate: (key: string | null ) => any;
  resetFields: () => any;
  setDisabledAll: (isDisabled: boolean) => void;
  getFormBtn: () => any;
}
const dynamicForm = ref<dynamicFormMethod | null>(null);
const superDynamicForm = ref<dynamicFormMethod | null>(null);
const superFromState = ref(false);

superFromState.value = props.freeEditConfig?.showSuperior
  ? props.freeEditConfig?.showSuperior
  : false;

function getFromValue() {
  const d = dynamicForm.value?.getFromValue();
  if (superDynamicForm.value) {
    return {
      ...d,
      ...superDynamicForm.value?.getFromValue(),
    };
  } else {
    return d;
  }
}

function setFormValue(data: any, noupdate = false) {
  if (data === undefined) {
    data = {};
  }
  if (superDynamicForm.value) {
    let dy: Record<string, any> = {};
    let sp: Record<string, any> = {};
    Object.keys(data).forEach((k) => {
      if (superDynamicForm.value?.checkKey(k)) {
        sp[k] = data[k];
      }else{
        dy[k] = data[k];
      }
    });
    dynamicForm.value?.setFormValue(dy, noupdate);
    superDynamicForm.value?.setFormValue(sp, noupdate);
  } else {
    dynamicForm.value?.setFormValue(data, noupdate);
  }
}
function validate() {
  return dynamicForm.value?.validate();
}

//只清空报错信息
function clearValidate(key = null) {
  dynamicForm.value?.clearValidate(key);
}
// 初始化值和清空报错信息
function resetFields() {
  dynamicForm.value?.resetFields();
}

function getValue(key: any) {
  if (superDynamicForm.value?.checkKey(key)) {
    return superDynamicForm.value?.getValue(key);
  }else{
    return dynamicForm.value?.getValue(key);
  }
}
function setValue(key: any, value: any) {
  if (superDynamicForm.value?.checkKey(key)) {
    superDynamicForm.value?.setValue(key, value);
  }else {
    dynamicForm.value?.setValue(key, value);
  }
}
function setDisabledAll(isDisabled: boolean = true) {
  if (
    props.freeEditConfig.titleBtns &&
    props.freeEditConfig.titleBtns.length > 0
  ) {
    props.freeEditConfig.titleBtns.forEach((item) => {
      item.hidden = isDisabled;
    });
  }
  if (props.freeEditConfig.endBtns && props.freeEditConfig.endBtns.length > 0) {
    props.freeEditConfig.endBtns.forEach((item) => {
      item.hidden = isDisabled;
    });
  }
  dynamicForm.value?.setDisabledAll(isDisabled);
}

/**
 * 获取指定表单项
 * {id} 要素key
 */
function getFromSchemaItem(id: string) {
  const fromListRef = dynamicForm.value?.fromListRef;
  if(!!fromListRef) {
    return fromListRef.find( (item: any) => item.key === id)
  }else {
    return undefined;
  }
}

watch(
  () => freeEditConfig,
  (newVal) => {
    if (newVal) {
    }
  },
  {
    deep: true,
  }
);


function getFormBtn() {
  return btnMap.value
}
function getCodeListMap() {
  return codeListMap.value;
}
function addCodeListMap(data: any) {
  const {code, list} = data;
  codeListMap.value[code] = list;
}
function setCodeListMap(map: any) {
  if(map) {
    Object.assign(codeListMap.value, map);
  }
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  clearValidate,
  resetFields,
  setDisabledAll,
  getFromSchemaItem,
  getFormBtn,
  getCodeListMap,
  setCodeListMap,
  addCodeListMap
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
</style>

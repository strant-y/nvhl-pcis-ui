<template>
  <div v-if="freeEditConfig" class="freeedit free_container" :class="customClass">
    <div class="searchbar">
      <el-row :gutter="16">
        <el-col :md="24">
          <el-card shadow="hover" class="card_container">
            <template
              #header
              v-if=" freeEditConfig.fromUi.showTitleBar && freeEditConfig.title && freeEditConfig.title.length > 0"
            >
              <el-row justify="space-between">
                <el-col :span="4" v-if="!freeEditConfig.production">
                  <span class="card-title-style">{{ freeEditConfig.title }}</span>
                </el-col>
                <el-col :span="4" v-if="freeEditConfig.production">
                  <el-tooltip :content="freeEditConfig.productionTitle">
                    <span class="card-title-style">{{ freeEditConfig.title }}</span>
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
                    @click="showMyfrom = !showMyfrom"
                    v-if="
                      freeEditConfig.showMyfromBtm
                        ? freeEditConfig.showMyfromBtm
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
                style="margin-top: 10px; margin-right: 1.4%"
                :style="{ textAlign: freeEditConfig.endBtnsPosition }"
                v-if="
                  freeEditConfig.endBtns && freeEditConfig.endBtns.length > 0
                "
              >
                <el-button-group >
                  <template
                    v-for="(item, index) in freeEditConfig.endBtns"
                    :key="index"
                  >
                    <template v-if="!item.hidden">
                      <rt-button :item="item" :ref="(res: any) => {btnMap[item?.id] = item}"/>
                    </template>
                  </template>
                </el-button-group>
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
import {useScrollDetection} from "@/utils/common";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
defineOptions({
  name: "AppFreeEdit",
  inheritAttrs: false,
});

const props = defineProps({
  freeEditConfig: {
    type: Object as () => AppFreeEditConfig,
    required: true,
  },
  customClass: {
    type: String,
    default: "",
  },
});
const codeListMap = ref<any>({});
const customMap = ref<any>({});
provide('codeListMap', codeListMap.value);
provide('customMap', customMap.value);
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const btnMap = ref({});
const { freeEditConfig } = toRefs(props);
const emits = defineEmits(["updateDatas"]); // 父组件监听事件，同步子组件值的变化给父组件

const formData = ref({});   // 临时存储数据,用于折叠式,数据回显
function updateDatas(newDatas: any, prop: any) {
  formData.value = newDatas;
  emits("updateDatas", newDatas, prop); // 更新时,将更新最新数据,以及更新目标字段,返回
}

const showMyfrom = ref(false);
showMyfrom.value = props.freeEditConfig?.showMyfrom
  ? props.freeEditConfig?.showMyfrom
  : false;

interface dynamicFormMethod {
  getFromValue: () => any;
  setFormValue: (data: any, noupdate?: boolean) => void;
  validate: () => any;
  setValue: (key: any, value: any, noupdate?: boolean) => void;
  getValue: (key: any) => any;
  checkKey: (key: any) => boolean;
  clearValidate: (key: string | null ) => any;
  resetFields: () => any;
  setDisabledAll: (isDisabled: boolean) => void;
  getFormBtn: () => any;
  validateField: (fields: string | string[]) => any
  // getFormBtn: () => any;
}
const dynamicForm = ref<dynamicFormMethod | null>(null);
const superDynamicForm = ref<dynamicFormMethod | null>(null);
const superFromState = ref(false);

superFromState.value = props.freeEditConfig?.showSuperior
  ? props.freeEditConfig?.showSuperior
  : false;

function getFromValue() {
  const d = dynamicForm.value?.getFromValue();
  // 级联地址 表格显示问题处理
  freeEditConfig.value?.fromSchema?.forEach((item: any) => {
    if(item?.inputtype === "rtinputgroup") {
      const groupList = item.groupList
      const comp = getFromSchemaItem(groupList[0].prop);
      if(groupList && comp) {
        if(comp.itemRef && 'getTextValue' in comp.itemRef) {
          let text = comp.itemRef.getTextValue()?.replaceAll(' / ', '')
          if(groupList[1]?.prop) {
             text += d[groupList[1]?.prop]
          }
          d[item.prop] = text
        }
      }
    }
  });

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
  return new Promise((resolve) => {
    dynamicForm.value?.validate().then((valid: any) => {
      if(!valid) {
        const isScroll = useScrollDetection();
        if(idxParam && idxParam.handleAnchorClick && customMap.value?.domId && !isScroll) {
          idxParam.handleAnchorClick(undefined,`#${customMap.value?.domId}`)
        }
      }
      resolve(valid);
    });
  });
}

// 根据参数 选择需要校验内容
function validateField(fields:any) {
  return new Promise((resolve) => {
    dynamicForm.value?.validateField(fields).then((valid) => {
      // 校验失败时的处理（与原有validate逻辑保持一致）
      // if (!valid) {
      //   const isScroll = useScrollDetection();
      //   // 滚动到第一个错误字段位置（复用原有逻辑）
      //   if (idxParam && idxParam.handleAnchorClick && customMap.value?.domId && !isScroll) {
      //     idxParam.handleAnchorClick(undefined, `#${customMap.value?.domId}`);
      //   }
      // }
      // 返回校验结果
      resolve(valid);
    });
  });
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
function setValue(key: any, value: any, noupdate = false) {
  if (superDynamicForm.value?.checkKey(key)) {
    superDynamicForm.value?.setValue(key, value,noupdate);
  }else {
    dynamicForm.value?.setValue(key, value,noupdate);
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

const addProvide = <T>(key: InjectionKey<T> | string, value: T) => {
  customMap.value[key] = value;
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
  addCodeListMap,
  addProvide,
  validateField
});
</script>

<style scoped>
:deep(.el-card__header) {
  height: 32px;
  padding: 4px 0 4px 12px;
}

.searchbar {


}

:deep(.el-form-item) {
  margin-bottom: 5px;
}
:deep(.el-form-item__label-wrap) {
  margin-left: 0px;
}
.el-card__header .el-row {
  align-items: center;
}
:deep(.el-select__wrapper) {
  /* height: 28px; */
  min-height: 28px;
  line-height: 28px;
  padding: 4px 6px;
}
:deep(.el-select__input) {
  height: 20px;
}
:deep(.el-input__wrapper) {
  height: 28px;
  padding: 1px 5px;
}
:deep(.el-form-item__content .el-row) {
  align-items: baseline;
}
:deep(.el-form-item__content .el-button) {
  height: 28px;
}
:deep(.el-input-number.is-without-controls .el-input__wrapper) {
  padding: 1px 5px;
}
:deep(.el-card__body) {
  padding: 10px 20px;
}
</style>

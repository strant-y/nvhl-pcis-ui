<template>
  <div v-if="freeEditConfig" class="freeedit">
    <div class="searchbar">
      <el-row :gutter="16">
        <el-col :md="24">
          <el-card>
            <template #header v-if="freeEditConfig.fromUi.showTitleBar?freeEditConfig.fromUi.showTitleBar: true">
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
                      <rt-button :item="item" />
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
                    <el-icon v-if="!showMyfrom"><ArrowUpBold /></el-icon>
                    <el-icon v-if="showMyfrom"><ArrowDownBold /></el-icon>
                    {{ showMyfrom ? "点击折叠" : "点击展开" }}
                  </a>
                </el-col>
              </el-row>
            </template>
            <div class="form-inner" v-if="showMyfrom">
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
                  <rt-button :item="item" />
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

const { freeEditConfig } = toRefs(props);
const emits = defineEmits(["updateDatas"]); // 父组件监听事件，同步子组件值的变化给父组件

function updateDatas(newDatas: any) {
  emits("updateDatas", newDatas);
}
const showMyfrom = ref(true);
showMyfrom.value = props.freeEditConfig?.showMyfrom
  ? props.freeEditConfig?.showMyfrom
  : true;

interface dynamicFormMethod {
  getFromValue: () => any;
  setFormValue: (data: any) => void;
  validate: () => any;
  setValue: (key: any, value: any) => void;
  getValue: (key: any) => any;
  checkKey: (key: any) => boolean;
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

function setFormValue(data: any) {
  if (data === undefined) {
    data = {};
  }
  if (superDynamicForm.value) {
    let dy: Record<string, any> = {};
    let sp: Record<string, any> = {};
    Object.keys(data).forEach((k) => {
      if (dynamicForm.value?.checkKey(k)) {
        dy[k] = data[k];
      } else {
        if (superDynamicForm.value?.checkKey(k)) {
          sp[k] = data[k];
        }
      }
    });
    dynamicForm.value?.setFormValue(dy);
    superDynamicForm.value?.setFormValue(sp);
  } else {
    dynamicForm.value?.setFormValue(data);
  }
}
function validate() {
  return dynamicForm.value?.validate();
}
function getValue(key: any) {
  if (dynamicForm.value?.checkKey(key)) {
    return dynamicForm.value?.getValue(key);
  }
  if (superDynamicForm.value?.checkKey(key)) {
    return superDynamicForm.value?.getValue(key);
  }
}
function setValue(key: any, value: any) {
  if (dynamicForm.value?.checkKey(key)) {
    dynamicForm.value?.setValue(key, value);
  }
  if (superDynamicForm.value?.checkKey(key)) {
    superDynamicForm.value?.setValue(key, value);
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

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
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

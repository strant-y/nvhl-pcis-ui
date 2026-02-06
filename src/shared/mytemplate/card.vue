<template>
  <div class="freeedit card_container">
    <div class="searchbar">
      <el-card :class="getClass()" shadow="hover">
        <template #header>
          <el-row justify="space-between">
            <el-col :span="6" v-if="!cardConfig.production">
              <a
                style="margin-left: 20px"
                @click="showMyfrom = !showMyfrom"
                v-if="cardConfig.showInTitle ? cardConfig.showInTitle : false"
              >
                <el-icon v-if="!showMyfrom" color="var(--el-text-color)"><ArrowUpBold /></el-icon>
                <el-icon v-if="showMyfrom" color="var(--el-text-color)"><ArrowDownBold /></el-icon>
              </a>
              <span class="card-title-style">{{ cardConfig.title }}</span>
            </el-col>
            <el-col :span="6" v-if="cardConfig.production">
              <a
                style="margin-left: 20px"
                @click="showMyfrom = !showMyfrom"
                v-if="cardConfig.showInTitle ? cardConfig.showInTitle : false"
              >
                <el-icon v-if="!showMyfrom" color="var(--card-header-title-color)"><ArrowUpBold /></el-icon>
                <el-icon v-if="showMyfrom" color="var(--card-header-title-color)"><ArrowDownBold /></el-icon>
              </a>
              <el-tooltip :content="cardConfig.productionTitle">
                <span class="card-title-style">{{ cardConfig.title }}</span>
              </el-tooltip>
            </el-col>
            <el-col
              :span="18"
              style="text-align: right; padding-right: 10px;"
            >
              <!-- 控制cardConfig.showEdit状态的按钮 -->
              <template v-if="showMyfrom">
                <el-tooltip
                    :content="cardConfig.showEdit ? '隐藏查询条件' : '显示查询条件'"
                    placement="top"   effect="light">
                  <a class="toggle-edit-btn" @click="toggleShowEdit" v-if="hasShowEditTrue">
                  <el-icon>
                    <View v-if="!cardConfig.showEdit" />
                    <Hide v-else />
                  </el-icon>
                  </a>
                </el-tooltip>
              </template>
              <template
                v-if=" (cardConfig.titleBtns && cardConfig.titleBtns.length > 0) ||
                (cardConfig.showMyfromBtm ? cardConfig.showMyfromBtm : false)"
              >
                <el-button-group>
                  <template
                    v-for="(item, index) in cardConfig.titleBtns"
                    :key="index"
                  >
                  <template v-if="!item.hidden">
                    <rt-button :item="item" />
                  </template>
                  </template>
                </el-button-group>
                <a
                  style="margin-left: 10px"
                  @click="showMyfrom = !showMyfrom"
                  v-if="
                    cardConfig.showMyfromBtm ? cardConfig.showMyfromBtm : false
                  "
                >
                  <el-icon v-if="!showMyfrom" size="10" color="var(--card-header-title-color)"><ArrowUpBold/></el-icon>
                  <el-icon v-if="showMyfrom" size="10" color="var(--card-header-title-color)"><ArrowDownBold/></el-icon>
                  <span class="right-arrow_text">{{ showMyfrom ? "点击折叠" : "点击展开" }}</span>
                </a>
              </template>
            </el-col>
          </el-row>
        </template>

        <div class="form-inner" v-show="showMyfrom">
          <div v-if="cardConfig.showEdit">
            <app-free-edit :freeEditConfig="formconfig" ref="editRef"/>
          </div>
          <slot />
          <div
            style="margin-top: 20px"
            :style="{ textAlign: cardConfig.endBtnsPosition }"
            v-if="cardConfig.endBtns && cardConfig.endBtns.length > 0"
          >
            <template v-for="(item, index) in cardConfig.endBtns" :key="index">
              <template v-if="!item.hidden">
                <rt-button :item="item" />
              </template>
            </template>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { template } from "lodash";
import { createAppFreeEditConfig } from "../app-free-edit-config";
import { createAppGridEditConfig } from "../app-grid-edit-config";
import { CardConfig } from "./card-config";
import { View, Hide } from '@element-plus/icons-vue'; // 导入更多图标
const props = defineProps({
  cardConfig: {
    type: Object as () => CardConfig,
    required: true,
  },
});

const showMyfrom = ref(props.cardConfig.showMyfrom ?? true);
const hasShowEditTrue = ref(false); // 用于跟踪cardConfig.showEdit是否曾经为true

const formconfig = ref(createAppGridEditConfig({}));

const editRef = ref<AppFreeEditMethod | null>();
defineOptions({
  name: "MyCard",
  inheritAttrs: false,
});

// 添加切换showEdit状态的方法
function toggleShowEdit() {
  if (props.cardConfig.showEdit !== undefined) {
    props.cardConfig.showEdit = !props.cardConfig.showEdit;
  }
}

watch(
  () => props.cardConfig,
  (newVal, oldVal) => {
    // 当 cardConfig.showEdit 为 true 时，默认隐藏查询条件
    if (newVal?.showEdit) {
      hasShowEditTrue.value = true;
    }
    initEditConfig();
  },
  { deep: true }
);

function initEditConfig(){
  if(props.cardConfig.formconfig){
    formconfig.value = createAppFreeEditConfig(props.cardConfig.formconfig);
  }
}

function getFromValue() { 
  return editRef.value?.getFromValue();
}

function setFormValue(value: any) {
  editRef?.value?.setFormValue(value);
}
onMounted(() => {
  // 在组件挂载时检查cardConfig.showEdit是否为true
  nextTick(() => {
  if (props.cardConfig.showEdit === true) {
    hasShowEditTrue.value = true;
    props.cardConfig.showEdit = false;
  }
  })
});
// 外部切换组件隐藏显示:如果传参,直接按照参数进行设置,如果未传参,则自动反向设置
function changeMyForm(value: any) {
  if(value !== null && value !== undefined && typeof value === 'boolean'){
    showMyfrom.value = value;
  }else{
    showMyfrom.value = !showMyfrom.value;
  }
}

function getClass(){
  if(props.cardConfig.titleClass){
    return props.cardConfig.titleClass;
  }
}

defineExpose({
  getFromValue,
	setFormValue,
  changeMyForm
});

</script>

<style scoped>
:deep(.searchbar .el-card__header) {
  height: 32px;
  padding: 4px 0 4px 12px;
}

.searchbar {
  /* border: 1px solid #ddd; */
  /* box-shadow: 0 0 2px rgb(0 0 0 / 30%); */
}
:deep(.mainTitle .el-card__header) {
  /* background: #d1e7f7; */
}
:deep(.mainTitle) {
  box-shadow: none;
  border: 0;
  --el-card-border-color: transparent;
}

/* 按钮样式 */
.toggle-edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 20px;
  padding: 4px 10px;
  border-radius: 4px; /* 常用较小圆角 */
  color: #1a3e72; /* 深蓝色文字 */
  background-color: #f8fafc; /* 非常浅的背景 */
  border: 1px solid #cbd5e1; /* 精细的边框 */
  font-family: 'Segoe UI', system-ui, sans-serif; /* 清晰字体 */
  font-weight: 600; /* 稍重的字重 */
  font-size: 13px; /* 较小字号 */
  transition: all 0.2s ease;
  cursor: pointer;
  outline: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  position: relative;
  margin-right: 10px;
}

/* 悬停状态  */
.toggle-edit-btn:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: #0f2a5a; /* 更深的蓝色 */
}

/* 激活状态  */
.toggle-edit-btn:active {
  background-color: #e2e8f0;
  transform: scale(0.98);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 图标样式  */
.toggle-edit-btn .el-icon {
  color: #2563eb; /* 主色图标 */
  font-size: 14px; /* 稍小的图标 */
  transition: transform 0.2s ease;
}

/* 聚焦状态  */
.toggle-edit-btn:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 1px;
}

/* 文字样式 */
.toggle-text {
  letter-spacing: 0.3px;
}


.toggle-edit-btn::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 1px;
  background: rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.toggle-edit-btn:hover::after {
  background: rgba(0, 0, 0, 0.1);
  bottom: -3px;
}
</style>
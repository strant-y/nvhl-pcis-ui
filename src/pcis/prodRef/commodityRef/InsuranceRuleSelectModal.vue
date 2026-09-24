<!-- 关联投保规则配置弹窗 - 选择要素 + 拖拽排序 + 规则配置 -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="关联投保规则配置"
    width="900px"
    :close-on-click-modal="false"
    append-to-body
    class="rule-select-dialog"
    @close="handleCancel"
  >
    <div class="rule-select-body">
      <!-- 左侧: 元素库 -->
      <div class="element-library">
        <!-- 所属tab选择 & 搜索 -->
        <div class="library-header">
          <el-form :inline="true" size="small">
            <el-form-item label="所属tab" class="category-form-item">
              <el-select
                v-model="activeTab"
                placeholder="请选择"
                clearable
                @change="handleTabChange"
              >
                <el-option
                  v-for="tab in tabOptions"
                  :key="tab.value"
                  :label="tab.label"
                  :value="tab.value"
                />
              </el-select>
            </el-form-item>
          </el-form>
          <div class="search-row">
            <el-input
              v-model="searchKey"
              placeholder="要素Key"
              :prefix-icon="Search"
              clearable
              size="small"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
            <el-input
              v-model="searchName"
              placeholder="要素名称"
              :prefix-icon="Search"
              clearable
              size="small"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
            <el-button type="primary" size="small" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </div>
        </div>

        <!-- 元素列表 -->
        <div class="element-list" v-loading="loading">
          <div class="element-grid">
            <div
              v-for="item in elementList"
              :key="item.cPkId"
              class="element-card"
              :class="{ 'is-selected': isElementSelected(item.cPkId) }"
              @click="toggleElementSelection(item)"
            >
              <div class="element-card-content">
                <div class="element-card-name">{{ item.cFactorTitle }}</div>
                <div class="element-card-key">{{ item.cFactorProp }}</div>
              </div>
              <el-tag size="small" type="info" effect="plain">{{ getInputTypeLabel(item.cFactorInputtype) }}</el-tag>
              <el-icon v-if="isElementSelected(item.cPkId)" class="element-check-icon">
                <CircleCheckFilled />
              </el-icon>
            </div>
            <el-empty v-if="!loading && elementList.length === 0" description="未找到匹配的要素" :image-size="60" />
          </div>
          <!-- 分页 -->
          <div class="element-pagination" v-if="total > 0">
            <el-pagination
              v-model:current-page="pageNum"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next"
              size="small"
              @size-change="handlePageSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>

      <!-- 右侧: 已选要素 -->
      <div class="selected-panel">
        <div class="selected-header">
          <span class="selected-title">
            已选要素
            <span class="selected-count">({{ tempSelected.length }})</span>
          </span>
          <el-button text type="danger" size="small" @click="tempSelected = []" :disabled="!tempSelected.length">
            清空
          </el-button>
        </div>

        <div class="selected-list" ref="selectedListRef">
          <el-empty
            v-if="tempSelected.length === 0"
            description="拖拽或点击添加要素"
            :image-size="60"
          />
          <div
            v-for="(sel, index) in tempSelected"
            :key="sel.cPkId"
            class="selected-item"
            :data-id="sel.cPkId"
          >
            <div class="selected-item-index">{{ index + 1 }}</div>
            <div class="selected-item-info">
              <div class="selected-item-name">
                <span class="selected-item-title">{{ sel.cFactorTitle }}</span>
                <span v-if="getTabLabel(sel.cFactorTab)" class="selected-item-tab">
                  <el-icon :size="10"><Folder /></el-icon>
                  {{ getTabLabel(sel.cFactorTab) }}
                </span>
              </div>
              <div class="selected-item-key">{{ sel.cFactorProp }}</div>
            </div>
            <div class="selected-item-actions">
              <el-tooltip content="规则配置" placement="top">
                <el-button text size="small" @click.stop="openConfig(sel)">
                  <el-icon><Setting /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button text type="danger" size="small" @click.stop="removeElement(sel.cPkId)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
              <div v-if="hasConfig(sel)" class="config-dot"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认配置</el-button>
    </template>

    <!-- 规则配置弹窗 -->
    <InsuranceRuleConfigModal
      v-if="showConfigModal"
      :data="currentConfigItem"
      @ok="saveConfig"
      @cancel="showConfigModal = false"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from "vue";
import { Search, CircleCheckFilled, Setting, Delete, Folder } from "@element-plus/icons-vue";
import Sortable from "sortablejs";
import InsuranceRuleConfigModal from "./InsuranceRuleConfigModal.vue";
import { getDictOptions } from "@/api/dict";
import { getFactorList } from "@/api/prod";
import { inputtype } from "@/utils/utilKey";

const emits = defineEmits(["ok", "cancel"]);

const dialogVisible = ref(true);
const activeTab = ref("");
const searchKey = ref("");
const searchName = ref("");
const showConfigModal = ref(false);
const currentConfigItem = ref<any>(null);
const selectedListRef = ref<HTMLElement>();
let sortableInstance: Sortable | null = null;

/** 分页状态 */
const pageNum = ref(1);
const pageSize = ref(20);
const total = ref(0);

const props = defineProps<{
  data: any;
}>();

/** 所属tab选项（从字典tablist加载） */
const tabOptions = ref<any[]>([]);

/** 要素列表（从getFactorList接口加载） */
const elementList = ref<any[]>([]);
const loading = ref(false);

const tempSelected = ref<any[]>([]);

/** inputtype标签映射 */
const inputtypeMap: Record<string, string> = inputtype.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {} as Record<string, string>);

function getInputTypeLabel(type: string) {
  return inputtypeMap[type] || type;
}

/** 根据tab编码获取分类名称 */
function getTabLabel(tabCode: string) {
  if (!tabCode) return "";
  const tab = tabOptions.value.find((t: any) => t.value === tabCode);
  return tab ? tab.label : tabCode;
}

/** 加载所属tab字典 */
function loadTabOptions() {
  getDictOptions("tablist")
    .then((res) => {
      const { code, data } = res;
      if (200 === code && data) {
        tabOptions.value = data;
        // 默认选中第一个tab
        if (tabOptions.value.length > 0 && !activeTab.value) {
          activeTab.value = tabOptions.value[0].value;
          loadElementList();
        }
      }
    })
    .finally(() => {});
}

/** 加载要素列表（服务端分页 + 搜索） */
function loadElementList() {
  if (!activeTab.value) {
    elementList.value = [];
    total.value = 0;
    return;
  }
  loading.value = true;
  const param = {
    factorTab: activeTab.value,
    factorProp: searchKey.value || undefined,
    factortitle: searchName.value || undefined,
    pageNum: pageNum.value,
    pageSize: pageSize.value,
  };
  getFactorList(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.result)
              ? data.result
              : [];
        elementList.value = list;
        total.value = Number(data?.total ?? res.total ?? list.length ?? 0);
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

/** tab切换 */
function handleTabChange() {
  searchKey.value = "";
  searchName.value = "";
  pageNum.value = 1;
  loadElementList();
}

/** 搜索（重置到第一页） */
function handleSearch() {
  pageNum.value = 1;
  loadElementList();
}

/** 翻页 */
function handlePageChange() {
  loadElementList();
}

/** 切换每页条数 */
function handlePageSizeChange() {
  pageNum.value = 1;
  loadElementList();
}

// 初始化：从 props.data 获取已配置的要素
watch(
  () => props.data,
  (val) => {
    if (val && val.finalSelection) {
      tempSelected.value = JSON.parse(JSON.stringify(val.finalSelection));
    }
  },
  { immediate: true }
);

function isElementSelected(id: string) {
  return tempSelected.value.some((i) => i.cPkId === id);
}

function toggleElementSelection(item: any) {
  const index = tempSelected.value.findIndex((i) => i.cPkId === item.cPkId);
  if (index > -1) {
    removeElement(item.cPkId);
  } else {
    tempSelected.value.push({
      ...item,
      cFactorTab: item.cFactorTab || activeTab.value,
      config: {
        defaultValue: "",
        required: false,
        placeholder: item.cFactorPlaceholder || "",
        clearable: item.cFactorClearable || "0",
        disabled: item.cFactorDisabled || "0",
        readonly: item.cFactorReadonly || "0",
        size: item.cFactorSize || "default",
        // string类型
        maxLength: null,
        regex: "",
        // number类型
        min: null,
        max: null,
        step: null,
        precision: null,
        // select类型
        typeCode: item.cFactorTypeCode || "",
        loadData: item.cFactorLoadData || "",
        filterable: item.cFactorFilterable || "0",
        multiple: item.cFactorMultiple || "0",
        // date类型
        format: item.cFactorFormat || "",
        valueFormat: item.cFactorValueFormat || "",
        dateType: item.cFactorType || "date",
        // 扩展
        extJson: "",
      },
    });
  }
}

function removeElement(id: string) {
  tempSelected.value = tempSelected.value.filter((i) => i.cPkId !== id);
}

function openConfig(item: any) {
  currentConfigItem.value = item;
  showConfigModal.value = true;
}

function saveConfig(configData: any) {
  if (currentConfigItem.value) {
    currentConfigItem.value.config = { ...configData };
  }
  showConfigModal.value = false;
}

function hasConfig(item: any) {
  if (!item || !item.config) return false;
  return (
    item.config.required ||
    item.config.regex ||
    item.config.defaultValue ||
    item.config.min !== null ||
    item.config.max !== null ||
    item.config.maxLength
  );
}

function handleConfirm() {
  dialogVisible.value = false;
  emits("ok", tempSelected.value);
}

function handleCancel() {
  dialogVisible.value = false;
  emits("cancel");
}

function initSortable() {
  if (selectedListRef.value) {
    sortableInstance?.destroy();
    sortableInstance = Sortable.create(selectedListRef.value, {
      animation: 150,
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      handle: ".selected-item",
      onEnd: (evt) => {
        if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
          const item = tempSelected.value.splice(evt.oldIndex, 1)[0];
          tempSelected.value.splice(evt.newIndex, 0, item);
        }
      },
    });
  }
}

watch(
  () => tempSelected.value.length,
  () => {
    nextTick(() => initSortable());
  }
);

onMounted(() => {
  loadTabOptions();
  nextTick(() => initSortable());
});
</script>

<style scoped>
.rule-select-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.rule-select-body {
  display: flex;
  height: 480px;
  overflow: hidden;
}

/* 左侧元素库 */
.element-library {
  flex: 3;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--el-border-color-lighter);
}

.library-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-form-item {
    width: 60%;
    margin-bottom: 0 !important;
}

.category-form-item :deep(.el-select) {
  width: 100%;
}

.search-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-row .el-input {
  flex: 1;
}

.element-pagination {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  padding-bottom: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
  margin-top: 12px;
}

.element-list {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 16px 16px 0;
}

.element-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.element-card {
  position: relative;
  padding: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 80px;
}

.element-card:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.element-card.is-selected {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}

.element-card-content {
  flex: 1;
}

.element-card-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.element-card-key {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: monospace;
  margin-top: 4px;
}

.element-check-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  color: var(--el-color-primary);
  font-size: 18px;
}

/* 右侧已选面板 */
.selected-panel {
  flex: 2;
  display: flex;
  flex-direction: column;
  background: var(--el-fill-color-light);
}

.selected-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: #fff;
}

.selected-title {
  font-size: 14px;
  font-weight: 600;
}

.selected-count {
  color: var(--el-text-color-secondary);
  font-weight: 400;
  font-size: 12px;
}

.selected-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  background: #fff;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: move;
  transition: border-color 0.2s;
}

.selected-item:hover {
  border-color: var(--el-color-primary-light-5);
}

.selected-item-index {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: var(--el-fill-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.selected-item-info {
  flex: 1;
  min-width: 0;
}

.selected-item-name {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
}

.selected-item-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-item-tab {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 500;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 3px;
  padding: 0 5px;
  line-height: 16px;
}

.selected-item-key {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-item-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.config-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--el-color-success);
  margin-left: 4px;
}

.sortable-ghost {
  opacity: 0.4;
  background: var(--el-color-primary-light-9);
  border: 2px dashed var(--el-color-primary);
}

.sortable-chosen {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>

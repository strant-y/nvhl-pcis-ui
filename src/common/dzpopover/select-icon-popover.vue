<template>
  <div ref="popoverContentRef">
    <div class="header">
      <el-icon><Close @click="close()" /></el-icon>
    </div>
    <el-input
      v-model="searchText"
      placeholder="搜索图标"
      clearable
      @input="filterIcons"
    />
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="本地图标图标" name="svg">
        <el-scrollbar height="300px">
          <ul class="flex flex-wrap">
            <li
              v-for="(icon, index) in filteredSvgIcons"
              :key="'svg-' + index"
              class="icon-item"
              @click="selectIcon(icon)"
            >
              <el-tooltip :content="icon" placement="bottom" effect="light">
                <svg-icon :icon-class="icon" />
              </el-tooltip>
            </li>
          </ul>
        </el-scrollbar>
      </el-tab-pane>
      <el-tab-pane label="Element 图标" name="element">
        <el-scrollbar height="300px">
          <ul class="flex flex-wrap">
            <li
              v-for="(icon, index) in filteredEleIcons"
              :key="index"
              class="icon-item"
              @click="selectIcon(icon.name)"
            >
              <el-icon>
                <component :is="icon.name" />
              </el-icon>
            </li>
          </ul>
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { ElTabPane } from "element-plus";
const emits = defineEmits(["closepopover"]);

const props = defineProps({
  param: Object,
});

const searchText = ref(""); // 筛选的值
const activeTab = ref("svg"); // 默认激活的Tab
const filteredSvgIcons = ref<string[]>([]); // 过滤后的SVG图标名称集合
const filteredEleIcons = ref(); // 过滤后的element图标集合
const svgIcons: string[] = []; //  SVG图标集合
const elementIcons = ref(ElementPlusIconsVue); // Element Plus图标集合

function handleTabClick(tabPane: any) {
  activeTab.value = tabPane.name;
  filterIcons();
}
/**
 * icon 筛选
 */
function filterIcons() {
  if (activeTab.value === "svg") {
    // 过滤SVG图标逻辑
    filteredSvgIcons.value = searchText.value
      ? svgIcons.filter((iconName) => iconName.includes(searchText.value))
      : svgIcons;
  } else {
    // 过滤Element Plus图标逻辑
    console.log(111);
    if (!searchText.value) {
      filteredEleIcons.value = elementGetAll();
    }
    let newElement: { name: string }[] = [];
    Object.keys(ElementPlusIconsVue).forEach((key) => {
      if (key.includes(searchText.value)) {
        newElement.push({ name: key });
      }
    });
    filteredEleIcons.value = newElement;
  }
}

function elementGetAll() {
  let newElement: { name: string }[] = [];
  Object.keys(ElementPlusIconsVue).forEach((key) => {
    newElement.push({ name: key });
  });
  return newElement;
}

/**
 * 选择图标
 */
function selectIcon(iconName: string) {
  emits("closepopover", { type: "select", data: iconName });
}
function close() {
  emits("closepopover", { type: "close" });
}
/**
 * icon 加载
 */
function loadIcons() {
  const icons = import.meta.glob("../../assets/icons/*.svg");
  for (const path in icons) {
    const iconName = path.replace(/.*\/(.*)\.svg$/, "$1");
    svgIcons.push(iconName);
  }
  filteredSvgIcons.value = svgIcons;
  filteredEleIcons.value = elementGetAll();
}
onMounted(() => {
  loadIcons();
});
</script>

<style scoped>
.header {
  text-align: right;
  margin-bottom: 10px;
}
.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  margin: 4px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: all 0.3s;
}

.icon-item:hover {
  border-color: #409eff;
  scale: 1.2;
}
</style>

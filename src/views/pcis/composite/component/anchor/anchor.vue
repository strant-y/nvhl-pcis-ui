<!-- 组合出单导航目录 -->
<template>
  <div class="app-anchor">
    <el-collapse
        v-if="!!list && list.length > 0"
        ref="collapseRef"
        expand-icon-position="right"
        @change="collapseChange"
        accordion
    >
      <el-collapse-item
        class="item-collapse"
        v-for="(anchor, idx) in list"
        :name="anchor.id"
      >
        <template #title>
          <div class="anchor_title" @mouseenter="checkIfTruncated($event, anchor.title)">
            <el-text class="_title_text mx-1" truncated>
              {{  anchor.title }}
            </el-text>
          </div>
        </template>
        <div v-show="anchor.expanded && !!isChildren(anchor)">
          <anchor-child
            v-for="(child, idx) in anchor.children"
            :anchorItem="child"
            :activeId="activeId"
            :parentActive="parentActiveId.includes(anchor.id)"
            @item-click="handleItemClick"
          />
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script setup lang="ts">
import anchorChild from './anchorItem.vue'
import {defineProps, ref} from "vue";
import type {AnchorItem} from "@/views/pcis/composite/component";
import { throttle } from 'lodash-es';
import {checkIfTruncated, scrollByDomId} from "@/utils/common";
import {CompositePageView} from "@/views/pcis/support/composite.types";
const props = defineProps({
  anchorList: {
    type: Array<AnchorItem>,
    default: () => [],
    required: true
  },
  scrollOffset: {
    type: Number,
    default: 0,
    required: false
  },
  activeThreshold: {
    type: Number,
    default: 0,
    required: false
  },
});
const emit = defineEmits<{
  (e: 'collapse-change', item: AnchorItem[]): void;
}>();
const pageView = inject("pageView", ref(new CompositePageView()));
const list = ref<AnchorItem[]>([]);
const isClickScroll = ref<boolean>(false);
const allItemsLength = ref<number>(0);
const scrollTimer = ref<any>();
const collapseRef = ref<any>();

const isChildren = (item: AnchorItem): boolean | undefined => {
  return item && item.children && item.children.length > 0
};

// 当前激活项ID
const activeId = ref<string>('');
const parentActiveId = ref<string | string[]>('');

// 导航项点击
const handleItemClick = (item: AnchorItem, time: number = 500) => {
  isClickScroll.value = true;
  if(item) {
    scrollByDomId(item.href, 'center');
    activeId.value = item.id;
  }
  if (scrollTimer.value) clearTimeout(scrollTimer.value);
  scrollTimer.value = setTimeout(() => {
    isClickScroll.value = false; // 清除标记，恢复监听
  }, time);
};

// 根据ID查找导航项
const findItemById = (items: AnchorItem[], id: string): AnchorItem | null => {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.children && item.children.length > 0) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
};


// 监听滚动事件，更新激活项
const handleScroll = throttle(() => {
  if(isClickScroll.value) return;
  const scrollTop = window.scrollY + (props.scrollOffset);
  const threshold = props.activeThreshold;
  // 获取所有导航项对应的DOM元素
  const allItems = getAllItems(list.value);
  allItemsLength.value = allItems.length;
  const visibleItems = allItems
    .map(item => {
      const element = document.querySelector(item.href);
      if (!element) return null;

      const rect = element.getBoundingClientRect();
      return {
        item,
        top: rect.top + scrollTop, // 元素顶部绝对位置
        distance: Math.abs(rect.top - threshold) // 与阈值的距离
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance); // 按距离排序
  if (visibleItems.length > 0) {
    activeId.value = visibleItems[0].item.id;
  }
}, 100); // 节流，100ms触发一次

// 获取所有导航项（包括子项）
const getAllItems = (items: AnchorItem[]): AnchorItem[] => {
  let result: AnchorItem[] = [];
  items.forEach(item => {
    if(item && item.href) {
      result.push(item);
    }
    if (item.children && item.children.length > 0) {
      result = [...result, ...getAllItems(item.children)];
    }
  });
  return result;
};

function collapseChange(activeNames: string | string[]) {
  if(activeNames && activeNames !== 'p') {
    const oldIdx = list.value.findIndex((f: AnchorItem) => parentActiveId.value?.includes(f.id));
    const newIdx = list.value.findIndex((f: AnchorItem) => activeNames.includes(f.id));
    if(oldIdx === -1 && newIdx === -1) return;
    const filter = list.value.filter((f: AnchorItem) => activeNames.includes(f.id));
    if(filter.length > 0 && filter[0].children.length > 0) {
      handleItemClick(filter[0].children[0], 1500);
      emit('collapse-change', filter);
    }
    parentActiveId.value = activeNames;
  }
}

onMounted(() => {
  // 初始化
  if (props.anchorList) {
    list.value = props.anchorList
  }
  window.addEventListener('scroll', handleScroll);
  setTimeout(handleScroll, 1000);
});

// 监听activeId变化，自动展开包含激活项的折叠面板
watch(
  () => activeId.value,
  (newId) => {
    if (newId) {
      pageView.value.activeAnchorId.value = newId;
      const arr = newId.split('-');
      if(arr) {
        collapseRef.value.setActiveNames(arr[arr.length - 1]);
      }
    }
  }
);
watch(props.anchorList,
  (newVal) => {
    if (newVal) {
      list.value = props.anchorList
    }
  }
);

// 清理
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>
<style lang="scss" scoped>
.app-anchor{
  width: 235px;
  //border: #e1e4ea solid 1px;
}
.anchor_title{
  width: 90%;
  display: flex;
  align-items: center;
  ._title_text{
    margin-left: 10px;
    font-size: 14px;
  }
}
.item-collapse{
  margin-bottom: 3px;
}
/* 未展开状态 */
::v-deep .el-collapse-item__header {
  background-color: #f0f7ff; /* 淡蓝色背景 */
  border-bottom: 1px solid #e6f4ff;
  height: 35px;
}

/* 展开状 */
::v-deep .el-collapse-item.is-active .el-collapse-item__header {
  background-color: var(--el-color-primary);
  ._title_text {
    color: white;
  }
}

/* 折叠面板内容区域的背景 */
::v-deep .el-collapse-item__content {
  background-color: #f9fcff; /* 极淡的蓝色背景 */
  border-bottom: 1px solid #e6f4ff;
}
/* 鼠标悬停时的标题栏背景 */
::v-deep .el-collapse-item__header:hover {
  background-color: #c8e2f6;
}

/* 标题文字颜色 */
::v-deep .el-collapse-item__header__wrap {
  color: #1890ff;
}
</style>
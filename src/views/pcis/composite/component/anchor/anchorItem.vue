<template>
  <div class="link-item">
    <div
        :class="['anchor-link', isActive ? 'active-link':'']"
        @click.stop="handleClick"
    >
      <el-row justify="space-between" class="_link_row">
        <el-col :span="2" style="margin-top: 3px">
          <slot v-if="$slots['icon']" name="icon"></slot>
          <span v-else><Menu size="18px" /></span>
        </el-col>
        <el-col align="start" :span="20">
          <div @mouseenter="checkIfTruncated($event, item.title)">
            <slot v-if="$slots['title']" name="title"></slot>
            <el-text v-else class="_title mx-1" truncated >
              {{  item.title }}
            </el-text>
          </div>
        </el-col>
        <el-col :span="2">
          <slot name="right"></slot>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';
import type { AnchorItem } from '../index';
import {Menu} from '@element-plus/icons-vue'
import {checkIfTruncated} from "@/utils/common";

const props = defineProps<{
  anchorItem: AnchorItem;
  activeId: string;
}>();


// 组件事件
const emit = defineEmits<{
  (e: 'item-click', item: AnchorItem): void;
}>();

const item = computed<AnchorItem>(() => props.anchorItem);

// 当前项是否激活
const isActive = computed(() => {
  return item.value && item.value.id === props.activeId;
});

// 处理导航项点击
const handleClick = () => {
  emit('item-click', item.value);
};

</script>

<style lang="scss" scoped>
.link-item{
  width: 200px;
  height: 30px;
  padding-left: 20px;

  &:hover{
    background-color: var(--menu-active-text);
  }
}

.anchor-header:hover {
  background-color: #f5f7fa;
}

.anchor-link {
  display: block;
  width: 100%;
  color: #606266;
  text-decoration: none;
  padding: 4px 0;
  transition: all 0.2s;

  ._link_row {
    text-align: center;
  }

  ._title{
    font-size: 14px;
    margin-left: 5px;
  }
}
._title:hover {
  color: var(--el-color-primary);
  cursor: pointer;
}
.anchor-link:hover {
  color: var(--el-color-primary);
  cursor: pointer;
}

/* 激活状态样式 */
.anchor-link.active-link {
  color: var(--el-color-primary);
  font-weight: 500;
  ._title{
    color: var(--el-color-primary);
    font-weight: 500;
  }
}

</style>

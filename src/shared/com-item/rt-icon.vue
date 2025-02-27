<template>
  <el-icon v-if="item.icon" :size="item.iconSize ? item.iconSize : '16'">
    <template v-if="checkEleicon(item.icon)">
      <component
        :is="renderIcon(item.icon)"
        :color="item.iconColor ? item.iconColor : undefined"
        @click="handleChange"
      />
    </template>
    <template v-else>
      <svg-icon
        :style="{
          width: item.iconSize ? item.iconSize + 'px' : '16px',
          height: item.iconSize ? item.iconSize + 'px' : '16px',
        }"
        :icon-class="item.icon"
      />
    </template>
  </el-icon>
</template>

<script setup lang="ts">
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
type IconNames = keyof typeof ElementPlusIconsVue;

const props = defineProps({
  item: {
    type: Object as () => Record<string, any>,
    required: true,
  },
  parentFromUi: {
    type: Object as () => Record<string, any>,
    required: false,
  },
});
const emits = defineEmits(["click"]); // 父组件监听事件，同步子组件值的变化给父组件
function handleChange() {
  emits("click");
  if (!props.item.isBtn) {
    //如果是从btn透传上来的,则只执行btn上的方法,防止重复触发
    props.item.func ? props.item.func() : null;
  }
}
const renderIcon = (iconName: string) => {
  const iconComponent = ElementPlusIconsVue[iconName as IconNames];
  if (iconComponent) {
    return h(resolveComponent(iconComponent.name));
  }
  return null;
};

const checkEleicon = (iconName: string) => {
  const iconComponent = ElementPlusIconsVue[iconName as IconNames];
  if (iconComponent) {
    return true;
  }
  return false;
};
</script>

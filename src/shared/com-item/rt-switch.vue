<template>
  <el-switch
    ref="switchRef"
    :size="item.size"
    :disabled="
      (item.readonly
        ? typeof item.readonly === 'boolean'
          ? item.readonly
          : item.readonly === 1 || item.readonly === '1'
            ? true
            : false
        : false) ||
      (item.disabled
        ? typeof item.disabled === 'boolean'
          ? item.disabled
          : item.disabled === 1 || item.disabled === '1'
            ? true
            : false
        : false) ||
      showLabel
    "
    :loading="item.loading"
    :activeText="item.activeText"
    :inactiveText="item.inactiveText"
    :width="item.width"
    :inlinePrompt="
      item.inlinePrompt
        ? typeof item.inlinePrompt === 'boolean'
          ? item.inlinePrompt
          : item.inlinePrompt === 1 || item.inlinePrompt === '1'
            ? true
            : false
        : false
    "
    v-model="selectedValue"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
type IconNames = keyof typeof ElementPlusIconsVue;

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
  },
  item: {
    type: Object as () => Record<string, any>,
    required: true,
  },
  showLabel: {
    type: Boolean,
    default: false,
  },
  parentFromUi: {
    type: Object as () => Record<string, any>,
    required: false,
  },
  row: {
    // 新增属性，用于接收当前行的数据
    type: Object as () => Record<string, any>,
    required: false,
  },
});

const emits = defineEmits(["update:modelValue", "valueChange"]); // 父组件监听事件，同步子组件值的变化给父组件

const selectedValue = ref<boolean>(false);

watch([() => props.modelValue], ([newModelValue]) => {
  if (props.item.keymap) {
    selectedValue.value = newModelValue === props.item.keymap["y"];
  } else if (typeof newModelValue === "boolean") {
    selectedValue.value = newModelValue;
  }
  // }
});

function handleChange(val?: string | number | boolean) {
  let res = val;
  if (props.item.keymap) {
    //存在独立编码时,使用独立编码进行回填
    if (val) {
      res = props.item.keymap["y"];
    } else {
      res = props.item.keymap["n"];
    }
  }
  emits("valueChange", res, props.parentFromUi);
  emits("update:modelValue", res);
  console.log("rt-switch", res, props);
  // props.item.func ? props.item.func(res) : null;
  props.item.func ? props.item.func(res, props.row) : null; // 传递当前行的数据
}

onMounted(() => {});

const renderIcon = (iconName: string) => {
  const iconComponent = ElementPlusIconsVue[iconName as IconNames];
  if (iconComponent) {
    return h(resolveComponent(iconComponent.name));
  }
  return null;
};
</script>

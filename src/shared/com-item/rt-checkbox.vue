<template>
  <el-checkbox
    ref="checkboxRef"
    v-model="selectedValue"
    :disabled="
      (item.readonly
        ? typeof item.readonly === 'boolean'
          ? item.readonly
          : item.readonly === 1
            ? true
            : false
        : false) ||
      (item.disabled
        ? typeof item.disabled === 'boolean'
          ? item.disabled
          : item.disabled === 1
            ? true
            : false
        : false)
    "
    :border="
      item.border
        ? typeof item.border === 'boolean'
          ? item.border
          : item.border === 1
            ? true
            : false
        : false
    "
    :size="item.size"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
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

const emits = defineEmits(["update:item", "update:modelValue", "valueChange"]); // 父组件监听事件，同步子组件值的变化给父组件
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
  emits("valueChange", res);
  emits("update:modelValue", res);
  props.item.func ? props.item.func(res) : null;
}
onMounted(() => {
  // 初始化组件数据
  if (props.item) {
  }
});
</script>

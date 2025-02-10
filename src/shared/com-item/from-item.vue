<template>
  <component
    ref="itemRef"
    :is="getcomRef(item.inputtype)"
    v-model="value"
    :item="item"
    :showLabel="showLabel"
    :parentFromUi="parentFromUi"
    @value-change="handleChange"
  />
</template>

<script setup lang="ts">
import shared from "../shared";
const props = defineProps({
  modelValue: {
    type: [Object, String, Number, Boolean, Array],
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
});
const itemRef = ref("itemRef");
const value = ref<any>();

const emits = defineEmits(["update:modelValue", "updateMethod"]); // 父组件监听事件，同步子组件值的变化给父组件
function handleChange(val?: any) {
  emits("update:modelValue", val);
  emits("updateMethod");
}

watch([() => props.modelValue], ([newModelValue]) => {
  value.value = newModelValue;
});
function tableExvalidate() {
  if (typeof itemRef.value.tableExvalidate === "function") {
    return itemRef.value.tableExvalidate();
  } else {
    return null;
  }
}

function updateOption(newOption: any) {
  if (itemRef.value.updateOption) {
    itemRef.value.updateOption(newOption);
  }
}

function getcomRef(type: any) {
  return shared.componentMap[type];
}

defineExpose({
  tableExvalidate,
  updateOption,
});

onMounted(() => {
  value.value = props.modelValue;
});
</script>

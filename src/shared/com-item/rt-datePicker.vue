<template>
  <el-date-picker
    ref="datepickerRef"
    v-if="!showLabel"
    v-model="vInput"
    :type="item.type ? item.type : 'date'"
    :readonly="
      item.readonly
        ? typeof item.readonly === 'boolean'
          ? item.readonly
          : item.readonly === 1
            ? true
            : false
        : false
    "
    :disabled="
      item.disabled
        ? typeof item.disabled === 'boolean'
          ? item.disabled
          : item.disabled === 1
            ? true
            : false
        : false
    "
    :placeholder="item.placeholder"
    :disabledDate="item.disabledDate"
    :shortcuts="item.shortcuts"
    :size="item.size"
    :format="item.format ? item.format : 'YYYY-MM-DD'"
    :clearable="
      item.clearable
        ? typeof item.clearable === 'boolean'
          ? item.clearable
          : item.clearable === 1
            ? true
            : false
        : false
    "
    :editable="
      item.editable
        ? typeof item.editable === 'boolean'
          ? item.editable
          : item.editable === 1
            ? true
            : false
        : false
    "
    :dateFormat="item.dateFormat ? item.format : 'YYYY-MM-DD'"
    :timeFormat="item.timeFormat ? item.format : 'YYYY-MM-DD'"
    :valueFormat="item.valueFormat ? item.valueFormat : getValueFormat()"
    @change="handleChange"
  />
  <span v-else>
    {{ vInput }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: [Number, String],
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
const vInput = ref<number | string>();
watch([() => props.modelValue], ([newModelValue]) => {
  vInput.value = newModelValue;
});
function handleChange(val?: string | undefined) {
  emits("valueChange", val);
  emits("update:modelValue", val);
  props.item.func ? props.item.func(val) : null;
}

function getValueFormat() {
  switch (props.item.type) {
    case "date":
      return "YYYY-MM-DD";
    case "datetime":
      return "YYYY-MM-DD HH:mm:ss";
    case "year":
      return "YYYY";
    case "month":
      return "YYYY-MM";
    default:
      return "YYYY-MM-DD";
  }
}

onMounted(() => {
  vInput.value = props.modelValue;
});
onMounted(() => {});
</script>

<style>
.el-date-editor {
  width: 100% !important;
}
</style>

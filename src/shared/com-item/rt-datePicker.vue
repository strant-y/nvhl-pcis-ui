<template>
  <el-date-picker
    ref="datepickerRef"
    v-if="!showLabel"
    v-model="vInput"
    :class="isReQuired() ? 're-quired-flag' : ''"
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
    :disabledDate="
      item.disabledDate && typeof item.disabledDate === 'function'
        ? item.disabledDate
        : (data) => false
    "
    :shortcuts="item.shortcuts"
    :size="item.size"
    :format="item.format ? item.format : getValueFormat()"
    :clearable="
      item.clearable
        ? typeof item.clearable === 'boolean'
          ? item.clearable
          : item.clearable === 1
            ? true
            : false
        : false
    "
    :dateFormat="'YYYY-MM-DD'"
    :timeFormat="'HH:mm:ss'"
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
    type: [Number, String, Array],
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
  // props.item.func ? props.item.func(val) : null;
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

function isReQuired() {
  if(props.item.required === '1' || props.item.required === 1 || props.item.required === true){
    return true;
  }
  const rule = props.item.rules;
  let r = false;
  if (rule && rule.length > 0) {
    for (const key in rule) {
      if (rule[key].required) {
        r = true;
      }
    }
  }
  return r;
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

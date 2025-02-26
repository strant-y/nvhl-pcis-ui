<template>
  <el-input-number
    v-if="!showLabel"
    ref="inputNumberRef"
    v-model="vInput"
    :readonly="
      item.readonly
        ? typeof item.readonly === 'boolean'
          ? item.readonly
          : item.readonly === 1 || item.readonly === '1'
            ? true
            : false
        : false
    "
    :placeholder="item.placeholder"
    :disabled="
      item.disabled
        ? typeof item.disabled === 'boolean'
          ? item.disabled
          : item.disabled === 1 || item.disabled === '1'
            ? true
            : false
        : false
    "
    :min="item.min"
    :max="item.max"
    :step="item.step"
    :step-strictly="item.stepStrictly"
    :size="item.size"
    :precision="item.precision"
    :controls="item.controls ? item.controls : false"
    controls-position="right"
    @change="handleChange"
  >
    <template #prefix v-if="item.prefix">
      <span>{{ item.prefix }}</span>
    </template>
    <template #suffix v-if="item.suffix">
      <span>{{ item.suffix }}</span>
    </template>
  </el-input-number>
  <span v-else>
    {{
      (item.prefix ? item.prefix : "") +
      (vInput ? vInput : "") +
      (item.suffix ? item.suffix : "")
    }}
  </span>
</template>

<script setup lang="ts">
const emits = defineEmits(["update:modelValue", "valueChange"]); // 父组件监听事件，同步子组件值的变化给父组件

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
});

const vInput = ref<number | undefined>();
watch([() => props.modelValue], ([newModelValue]) => {
  vInput.value = newModelValue ? Number(newModelValue) : undefined;
});

function handleChange(val?: string | number | undefined) {
  emits("update:modelValue", val);
  emits("valueChange", val);
  props.item.func ? props.item.func(val) : null;
}

onMounted(() => {
  vInput.value = props.modelValue ? Number(props.modelValue) : undefined;
});

onMounted(() => {});
</script>

<style scoped>
.el-input-number {
  width: 100%;
}
::v-deep .el-input__inner {
  text-align: left !important;
}
</style>

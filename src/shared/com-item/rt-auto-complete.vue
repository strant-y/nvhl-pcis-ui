<template>
  <template v-if="!showLabel">
    <el-autocomplete
      v-model="vInput"
      :class="[...customClass, ...(isRequired() ? ['re-quired-flag'] : [])]"
      :placeholder="item.placeholder || '请输入'"
      :disabled="isDisabled()"
      :readonly="isReadonly()"
      :clearable="isClearable()"
      :maxlength="item.maxlength"
      :size="item.size"
      :fetch-suggestions="fetchSuggestions"
      :trigger-on-focus="item.triggerOnFocus !== false"
      :debounce="item.debounce || 300"
      @input="handleInput"
      @change="handleChange"
      @select="handleSelect"
    >
      <template #default="{ item: suggestion }">
        <div>{{ suggestion.label || suggestion.value }}</div>
      </template>
    </el-autocomplete>
  </template>
  <el-text v-else class="mx-1" truncated>{{ vInput || "" }}</el-text>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: [String, Number],
  },
  item: {
    type: Object as () => Record<string, any>,
    required: true,
  },
  showLabel: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(["update:modelValue", "valueChange"]);
const vInput = ref<string | number | undefined>();
const customClass = ref<string[]>([]);

watch(
  () => props.modelValue,
  (value) => {
    vInput.value = value;
  },
  { immediate: true },
);

function fetchSuggestions(
  query: string,
  callback: (suggestions: any[]) => void,
) {
  const fetcher = props.item.fetchSuggestions;
  if (typeof fetcher === "function") {
    const result = fetcher(query, callback);
    if (result && typeof result.then === "function") {
      result
        .then((suggestions: any[]) => callback(suggestions || []))
        .catch(() => callback([]));
    } else if (Array.isArray(result)) {
      callback(result);
    }
    return;
  }

  const source = Array.isArray(props.item.loadData) ? props.item.loadData : [];
  const keyword = (query || "").toLowerCase();
  callback(
    source.filter((option: any) =>
      String(option.label || option.value || "")
        .toLowerCase()
        .includes(keyword),
    ),
  );
}

function handleInput(value: string | number) {
  emits("update:modelValue", value);
  emits("valueChange", value);
}

function handleChange(value: string | number) {
  emits("update:modelValue", value);
  emits("valueChange", value);
}

function handleSelect(option: any) {
  const value = option?.value ?? option;
  vInput.value = value;
  emits("update:modelValue", value);
  emits("valueChange", value);
}

function isRequired() {
  if (
    props.item.required === true ||
    props.item.required === 1 ||
    props.item.required === "1"
  ) {
    return true;
  }
  return Boolean(props.item.rules?.some((rule: any) => rule.required));
}

function isDisabled() {
  return (
    props.item.disabled === true ||
    props.item.disabled === 1 ||
    props.item.disabled === "1"
  );
}

function isReadonly() {
  return (
    props.item.readonly === true ||
    props.item.readonly === 1 ||
    props.item.readonly === "1"
  );
}

function isClearable() {
  return (
    props.item.clearable === true ||
    props.item.clearable === 1 ||
    props.item.clearable === "1"
  );
}

function setCustomClass(classes: string[]) {
  customClass.value = classes;
}

defineExpose({ setCustomClass });
</script>

<style scoped>
.el-autocomplete {
  width: 100%;
}
</style>

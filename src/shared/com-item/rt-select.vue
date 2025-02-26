<template>
  <!-- 下拉选择框-->
  <el-select
    v-if="!showLabel"
    ref="selectRef"
    v-model="selectedValue"
    :placeholder="item.placeholder ? item.placeholder : '请选择'"
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
        : false)
    "
    :clearable="
      item.clearable
        ? typeof item.clearable === 'boolean'
          ? item.clearable
          : item.clearable === 1 || item.clearable === '1'
            ? true
            : false
        : false
    "
    :size="item.size"
    :filterable="item.filterable"
    :multiple="
      item.multiple
        ? typeof item.multiple === 'boolean'
          ? item.multiple
          : item.multiple === 1 || item.multiple === '1'
            ? true
            : false
        : false
    "
    @change="handleChange"
  >
    <template
      #label="{ label, value }"
      v-if="
        item.tag
          ? typeof item.tag === 'boolean'
            ? item.tag
            : item.tag === 1 || item.tag === '1'
              ? true
              : false
          : false
      "
    >
      <el-tag :color="getColor(value)" effect="dark">{{ label }}</el-tag>
    </template>
    <el-option
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      :disabled="option.disabled ? option.disabled : false"
      :value="option.value"
    >
      <template
        v-if="
          item.tag
            ? typeof item.tag === 'boolean'
              ? item.tag
              : item.tag === 1 || item.tag === '1'
                ? true
                : false
            : false
        "
      >
        <el-tag :color="option.color" effect="dark">{{ option.label }}</el-tag>
      </template>
    </el-option>
    <template #empty>
      {{ "暂无数据" }}
    </template>
  </el-select>
  <span v-else>
    <template
      v-if="
        item.tag
          ? typeof item.tag === 'boolean'
            ? item.tag
            : item.tag === 1 || item.tag === '1'
              ? true
              : false
          : false
      "
    >
      <el-tag
        v-for="v in getValues()"
        :key="v.color"
        :color="v.color"
        effect="dark"
        >{{ v.label }}</el-tag
      >
    </template>
    <template v-else>
      {{ getLabel() }}
    </template>
  </span>
</template>

<script setup lang="ts">
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
const props = defineProps({
  modelValue: {
    type: [String, Number, Array<any>, Boolean],
  },
  unAuthor: {
    type: Boolean,
    default: false,
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

interface OptionTypeBySelect extends OptionType {
  color?: string;
  disabled?: boolean;
}

const options: Ref<OptionTypeBySelect[]> = ref([]); // 字典下拉数据源

const selectRef = ref({});

const emits = defineEmits(["update:item", "update:modelValue", "valueChange"]); // 父组件监听事件，同步子组件值的变化给父组件

const selectedValue = ref<string | number | Array<any> | boolean | undefined>();

function getValues() {
  if (typeof selectedValue.value === "object" && props.item.multiple) {
    const se = options.value.filter((item) => {
      if (selectedValue.value?.includes(item.value)) {
        return item.value;
      }
    });
    return se;
  } else {
    const se = options.value.find((item) => item.value === selectedValue.value);
    if (se) {
      return [se];
    } else {
      return [];
    }
  }
}

function getColor(v) {
  const se = options.value.find((item) => item.value === v);
  if (se) {
    return se.color;
  } else {
    return undefined;
  }
}

watch([options, () => props.modelValue], ([newOptions, newModelValue]) => {
  // if (newOptions == null || newOptions.length === 0) {
  //   return;
  // } // 下拉数据源加载未完成不回显
  if (newModelValue == undefined) {
    selectedValue.value = undefined;
    return;
  }
  selectedValue.value = newModelValue;
  // }
});

/**
 * 页面数据监听
 */
watch(
  () => props.item,
  (newValue, oldValue) => {
    if (props.item.loadData) {
      options.value = newValue.loadData;
    }
    if (props.item.typeCode) {
      codeListStore.queryCodeList(
          {
            codeListName: props.item.typeCode,
            codeListParam: props.item.params ? props.item.params : undefined
          },
          props.unAuthor,
          props.item.cache ? props.item.cache : true
        )
        .then((res) => (options.value = res))
        .catch((err) => {
          console.error(err);
          options.value = [];
        });
    }
  },
  { deep: true }
);
function handleChange(val?: string | number | Array<any> | undefined) {
  const option = options.value.find((item) => item.value === val);
  emits("valueChange", val);
  emits("update:modelValue", val);
  props.item.func ? props.item.func(val, option) : null;
}
function getLabel() {
  if (options.value && options.value.length > 0) {
    const se = options.value.find((item) => item.value === selectedValue.value);
    if (se) {
      return se.label;
    }
  }
}

onMounted(() => {
  // 初始化组件数据
  if (props.item) {
    if (!props.item.loadData && !!props.item.typeCode) {
      codeListStore.queryCodeList(
          {
            codeListName: props.item.typeCode,
            codeListParam: props.item.params ? props.item.params : undefined
          },
          props.unAuthor,
          props.item.cache ? props.item.cache : true
        )
        .then((res) => (options.value = res))
        .catch((err) => {
          console.error(err);
          options.value = [];
        });
    } else {
      options.value = props.item.loadData;
    }
  }
});

function updateOption(newOption: any) {
  options.value = newOption;
}

defineExpose({
  updateOption,
});
</script>

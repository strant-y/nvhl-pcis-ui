<template>
  <!-- 下拉选择框-->
  <el-select
    ref="selectRef"
    v-if="type === 'select' || !type"
    v-model="selectedValue"
    :placeholder="placeholder"
    :disabled="readonly || disabled"
    :clearable="clearable"
    filterable
    :multiple="multiple"
    :style="{ height, width }"
    :class="props.class"
    @change="handleChange"
  >
    <el-option
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    />
  </el-select>
  <!--多选-->
  <el-checkbox-group
    v-if="type === 'multiple'"
    v-model="selectedValue"
    :class="props.class"
    @change="handleChange"
  >
    <el-checkbox
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      :value="option.value"
      :disabled="readonly || disabled"
    />
  </el-checkbox-group>
  <!--  单选-->
  <el-radio-group
    v-if="type === 'radio'"
    v-model="selectedValue"
    :class="props.class"
    @change="handleChange"
  >
    <el-radio
      v-for="option in options"
      :value="option.value"
      :label="option.label"
      :key="option.value"
      :disabled="readonly || disabled"
      size="large"
    />
  </el-radio-group>
</template>

<script setup lang="ts">
import { codeListViewStore } from "@/store";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const props = defineProps({
  // 复选框类型 单选 多选
  type: {
    type: String,
    default: "select",
  },
  // 字典查询编码
  typeCode: {
    type: String,
    default: "",
  },
  modelValue: {
    type: [String, Number, Array<any>],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  // 不使用字典 用静态数据
  loadData: {
    type: Array,
    default: undefined,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: "请选择",
  },
  unAuthor: {
    type: Boolean,
    default: false,
  },
  width: {
    type: String,
    default: "100%",
  },
  height: {
    type: String,
    default: "100%",
  },
  // 是否添加到codeListViewStore缓存
  clearable: {
    type: Boolean,
    default: false,
  },
  // 是否添加到codeListViewStore缓存
  cache: {
    type: Boolean,
    default: true,
  },
  class: {
    type: String,
  },
  // 下拉选时，是否支持多选
  multiple: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits([
  "update:loadData",
  "update:modelValue",
  "dataChange",
]); // 父组件监听事件，同步子组件值的变化给父组件
defineExpose({ showMemu });
const options: Ref<OptionType[]> = ref([]); // 字典下拉数据源

const selectedValue = ref<string | number | Array<any> | undefined>();

const selectRef = ref({});

watch([options, () => props.modelValue], ([newOptions, newModelValue]) => {
  if (newOptions == null || newOptions.length === 0) return; // 下拉数据源加载未完成不回显
  if (newModelValue == undefined) {
    selectedValue.value = undefined;
    return;
  }
  // if (typeof newOptions[0].value === "number") {
  //   selectedValue.value = Number(newModelValue);
  // } else if (typeof newOptions[0].value === "string") {
  //   selectedValue.value = String(newModelValue);
  // } else {
  selectedValue.value = newModelValue;
  // }
});

/**
 * 页面数据监听
 */
watch(
  () => props.loadData,
  (newValue, oldValue) => {
    options.value = newValue;
  }
);
watch(
  () => props.typeCode,
  (newValue, oldValue) => {
    codeListStore
      .queryCodeListByCode(newValue, props.unAuthor, props.cache)
      .then((res) => (options.value = res))
      .catch((err) => {
        console.error(err);
        options.value = [];
      });
  }
);
function handleChange(val?: string | number | Array<any> | undefined) {
  const option = options.value.find((item) => item.value === val);
  emits("dataChange", val, option);
  emits("update:modelValue", val, option);
  emits("update:loadData", val, option);
}
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
function showMemu() {
  if (selectRef.value) {
    selectRef.value.toggleMenu();
  }
}
onMounted(() => {
  // 初始化组件数据
  if (!props.loadData && !!props.typeCode) {
    // 根据字典类型编码(typeCode)获取字典选项
    codeListStore
      .queryCodeListByCode(props.typeCode, props.unAuthor, props.cache)
      .then((res) => (options.value = res))
      .catch((err) => {
        console.error(err);
        options.value = [];
      });
  } else {
    options.value = props.loadData;
  }
});
</script>

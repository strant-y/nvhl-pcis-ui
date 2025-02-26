<template>
  <el-checkbox-group
    ref="radioRef"
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
        : false) ||
      showLabel
    "
    @change="handleChange"
    :size="item.size"
  >
    <template v-if="item.type === 'button'">
      <el-checkbox-button
        v-for="option in options"
        :value="option.value"
        :key="option.value"
      >
        {{ option.label }}
      </el-checkbox-button>
    </template>
    <template v-else>
      <el-checkbox
        v-for="option in options"
        :value="option.value"
        :key="option.value"
        :label="option.label"
        :border="
          item.border
            ? typeof item.border === 'boolean'
              ? item.border
              : item.border === 1
                ? true
                : false
            : false
        "
      />
    </template>
  </el-checkbox-group>
</template>

<script setup lang="ts">
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { codeListViewStore } from "@/store";

type IconNames = keyof typeof ElementPlusIconsVue;

const props = defineProps({
  modelValue: {
    type: [Array<string>, Array<number>],
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

const options: Ref<OptionType[]> = ref([]); // 字典下拉数据源
const selectedValue = ref<string[] | number[] | undefined>();

watch([options, () => props.modelValue], ([newOptions, newModelValue]) => {
  if (newOptions == null || newOptions.length === 0) return; // 下拉数据源加载未完成不回显
  if (newModelValue == undefined) {
    selectedValue.value = undefined;
    return;
  }
  selectedValue.value = newModelValue;
});
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
            codeListParam: props.item.params
          },
          false,
          props.item.cache ? props.item.cache : true
        )
        .then((res) => (options.value = res))
        .catch((err) => {
          console.error(err);
          options.value = [];
        });
    }
  }
);
function handleChange(val?: string | number | Array<any> | undefined) {
  const option = options.value.find((item) => item.value === val);
  emits("valueChange", val, option);
  emits("update:modelValue", val, option);
  emits("update:item", val, option);
  props.item.func ? props.item.func(val, option) : null;
}
const codeListStore = codeListViewStore();

onMounted(() => {
  // 初始化组件数据
  if (props.item) {
    if (!props.item.loadData && !!props.item.typeCode) {
      codeListStore.queryCodeList(
          {
            codeListName: props.item.typeCode,
            codeListParam: props.item.params
          },
          false,
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
</script>

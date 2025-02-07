<template>
  <template v-if="selectedValue">
    <el-tag
      ref="tagRef"
      :size="item.size"
      :color="getColor()"
      :effect="item.effect ? item.effect : 'dark'"
      :type="getType()"
      :round="item.round ? item.round : false"
    >
      {{ getValueLabel() }}
    </el-tag>
  </template>
</template>

<script setup lang="ts">
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
const props = defineProps({
  modelValue: {
    type: [String],
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

const selectedValue = ref<string>();
interface OptionTypeBySelect extends OptionType {
  color?: string;
  type?: "primary" | "success" | "warning" | "info" | "danger" | undefined;
}

const options: Ref<OptionTypeBySelect[]> = ref([]); // 字典下拉数据源

watch([options, () => props.modelValue], ([newOptions, newModelValue]) => {
  if (newOptions == null || newOptions.length === 0) return; // 下拉数据源加载未完成不回显
  selectedValue.value = newModelValue;
});

watch(
  () => props.item,
  (newValue, oldValue) => {
    if (props.item.loadData) {
      options.value = newValue.loadData;
    }
    if (props.item.typeCode) {
      codeListStore
        .queryCodeListByCode(
          newValue.typeCode,
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

function getValueLabel() {
  const option = options.value.find(
    (item) => item.value === selectedValue.value
  );
  if (option) {
    return option.label;
  }
}

function getType() {
  const option = options.value.find(
    (item) => item.value === selectedValue.value
  );
  if (option) {
    return option.type ? option.type : "primary";
  }
}

function getColor() {
  const option = options.value.find(
    (item) => item.value === selectedValue.value
  );
  if (option) {
    return option.color ? option.color : undefined;
  }
}

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

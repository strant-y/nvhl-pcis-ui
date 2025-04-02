<!-- 多级的级联选择器，如省市区 -->
<template>
  <!-- 下拉选择框-->
  <el-cascader
    v-if="!showLabel"
    ref="cascaderRef"
    style="width: 100%"
    v-model="selectedValue"
    :props="cascprops"
    :placeholder="item.placeholder ? item.placeholder : '请选择'"
    :options="options"
    :show-all-levels="false"
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
        : false) ||
      showLabel
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
    :showAllLevels="item.showAllLevels"
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
    <template #empty>
      {{ "暂无数据" }}
    </template>
  </el-cascader>
</template>

<script setup lang="ts">
import { codeListViewStore } from "@/store";
import { CascaderProps } from "element-plus";

const codeListStore = codeListViewStore();
const props = defineProps({
  modelValue: {
    type: [String, Number, Array<any>],
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
});

interface OptionTypeBySelect extends OptionType {
  color?: string;
  disabled?: boolean;
}

const options: Ref<OptionTypeBySelect[]> = ref([]); // 字典下拉数据源

const cascaderRef = ref();

const emits = defineEmits(["update:item", "update:modelValue", "valueChange"]); // 父组件监听事件，同步子组件值的变化给父组件

const selectedValue = ref<string | number | Array<any> | undefined>();

const cascprops: CascaderProps = {
  lazy: true,
  lazyLoad(node, resolve) {
    const { level, value } = node;
    if (level !== 0) {
      codeListStore
        .queryCodeList(
          {
            codeListName: props.item.typeCode,
            codeListParam: { cParCde: value },
          },
          props.unAuthor,
          props.item.cache ? props.item.cache : true
        )
        .then((res: any) => {
          const l =
            typeof props.item.cascaderprops === "string"
              ? JSON.parse(props.item.cascaderprops)
              : props.item.cascaderprops;
          res.forEach((e: any) => {
            e.leaf = level >= (l && l.length > 0 ? l.length - 1 : 5);
          });
          resolve(res);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      // 初始化不在这里懒加载
      resolve([]);
    }
  },
};

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
  [() => props.item.loadData, () => props.item.typeCode],
  ([newloadData, newtypeCode]) => {
    if (newloadData) {
      options.value = newloadData;
    }
    if (newtypeCode) {
      uploadOption();
    }
  },
  { deep: true }
);
function handleChange(val?: string | number | Array<any> | undefined) {
  emits("valueChange", val);
  emits("update:modelValue", val);
  props.item.func ? props.item.func(val) : null;
}

function uploadOption() {
  codeListStore
    .queryCodeList(
      {
        codeListName: props.item.typeCode,
        codeListParam: getParam(),
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

onMounted(() => {
  // 初始化组件数据
  if (props.item) {
    if (props.item.loadData) {
      options.value = props.item.loadData;
    } else if (props.item.typeCode) {
      codeListStore
        .queryCodeList(
          {
            codeListName: props.item.typeCode,
            codeListParam: getParam(),
          },
          props.unAuthor,
          props.item.cache ? props.item.cache : true
        )
        .then((res) => {
          options.value = res;
        })
        .catch((err) => {
          console.error(err);
          options.value = [];
        });
    }
  }
});

function updateOption(newOption: any) {
  options.value = newOption;
}

function getParam() {
  let p: any = {};
  if (props.item.codeParam && typeof props.item.codeParam === "string") {
    p = JSON.parse(props.item.codeParam);
  } else {
    p = props.item.codeParam;
  }

  if (props.item.disabled) {
    if (!p) {
      p = { value: selectedValue.value };
    } else {
      p.value = selectedValue.value;
    }
  }
  return p;
}

defineExpose({
  updateOption,
});
</script>

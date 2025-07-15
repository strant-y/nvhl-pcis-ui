<!-- 多级的级联选择器，如省市区 -->
<template>
  <!-- 下拉选择框-->
  <div class="cascader_" v-show="!props.showLabel">
    <el-cascader
      ref="cascaderRef"
      v-model="selectedValue"
      class="cascader_"
      :class="isReQuired() ? 're-quired-flag' : ''"
      :props="cascprops"
      :placeholder="item.placeholder ? item.placeholder : '请选择'"
      :options="options"
      :show-all-levels="false"
      :disabled="isReadonly() || isDisabled() || showLabel"
      :clearable="isClearable()"
      :size="item.size"
      :filterable="item.filterable"
      :showAllLevels="item.showAllLevels"
      :multiple="isMultiple()"
      @change="handleChange"
    >
      <template #empty>
        {{ "暂无数据" }}
      </template>
    </el-cascader>
  </div>

  <div v-if="props.showLabel">
    <span>{{ displayText }}</span>
  </div>
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

const codeListMap = inject<any>('codeListMap');

const options: Ref<OptionTypeBySelect[]> = ref([]); // 字典下拉数据源

const cascaderRef = ref();

const emits = defineEmits(["update:item", "update:modelValue", "valueChange"]); // 父组件监听事件，同步子组件值的变化给父组件

const selectedValue = ref<string | number | Array<any> | undefined>();

const displayText = computed(() => cascaderRef.value?.presentText);

const cascprops: CascaderProps = {
  lazy: true,
  checkStrictly: props.item.checkStrictly
    ? typeof props.item.checkStrictly === "boolean"
      ? props.item.checkStrictly
      : props.item.checkStrictly === "1" || props.item.checkStrictly === 1
        ? true
        : false
    : false,
  lazyLoad(node, resolve) {
    const { level, value } = node;
    if (level !== 0 && !!value) {
      const list = codeListMap[`${props.item.typeCode}-${level}-${value}`];
      if(list) {
        resolve(list);
        return;
      }
      const codeListParam = {};
      // 批改原因级联
      if(props.item.typeCode === "EDR_RSN_LIST_NEW") {
        codeListParam.rsnTyp = value.split('-')[0]
        codeListParam.kindNo = value.split('-')[1]
      } else {
        codeListParam.cParCde = value
      }
      codeListStore
        .queryCodeList(
          {
            codeListName: props.item.typeCode,
            codeListParam: codeListParam,
          },
          props.unAuthor,
          props.item.cache ? props.item.cache : true
        )
        .then((res: any) => {
          const l =
            typeof props.item.cascaderprops === "string"
              ? JSON.parse(props.item.cascaderprops)
              : props.item.cascaderprops;
          if(props.item.typeCode === "EDR_RSN_LIST_NEW") {
            res.forEach((e: any) => {
              e.leaf = level >= 1;
            });
          } else {
            res.forEach((e: any) => {
              e.leaf = level >= (l && l.length > 0 ? l.length - 1 : 5);
            });
          }
          codeListMap[`${props.item.typeCode}-${level}-${value}`] = res;
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
  if (!getParam() || Object.keys(getParam()).length === 0) return;
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
  selectedValue.value = props.modelValue;
  // 初始化组件数据
  if (props.item) {
    if (props.item.loadData) {
      options.value = props.item.loadData;
    } else if (
      props.item.typeCode &&
      props.modelValue &&
      getParam() &&
      Object.keys(getParam()).length > 0
    ) {
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

function isReQuired() {
  // 如果是禁用状态,默认带底色
  if (
    props.item.disabled === true ||
    props.item.disabled === "1" ||
    props.item.disabled === 1
  ) {
    return false;
  }
  if (
    props.item.required === "1" ||
    props.item.required === 1 ||
    props.item.required === true
  ) {
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

function isReadonly() {
  if (
    props.item.readonly === true ||
    props.item.readonly === 1 ||
    props.item.readonly === "1"
  ) {
    return true;
  } else {
    return false;
  }
}
function isClearable() {
  if (
    props.item.clearable === true ||
    props.item.clearable === 1 ||
    props.item.clearable === "1"
  ) {
    return true;
  } else {
    return false;
  }
}
function isDisabled() {
  if (
    props.item.disabled === true ||
    props.item.disabled === 1 ||
    props.item.disabled === "1"
  ) {
    return true;
  } else {
    return false;
  }
}
function isMultiple(){
  if(props.item.multiple === true || props.item.multiple === 1 || props.item.multiple === '1'){
    return true;
  }else{
    return false;
  }
}
function updateOption(newOption: any) {
  options.value = newOption;
}

function getParam() {
  if (props.item.codeParam && typeof props.item.codeParam === "string") {
    return JSON.parse(props.item.codeParam);
  } else {
    return props.item.codeParam;
  }
}

defineExpose({
  updateOption,
});
</script>
<style lang="scss">
.cascader_ {
  width: 100%;
}
</style>

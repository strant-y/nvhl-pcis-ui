<template>
  <!-- 下拉选择框-->
  <el-select
    v-if="!showLabel"
    ref="selectRef"
    :class="isReQuired() ? 're-quired-flag' : ''"
    v-model="selectedValue"
    :placeholder="item.placeholder ? item.placeholder : '请选择'"
    :disabled="isReadonly() || isDisabled() "
    :clearable="isClearable()"
    :size="item.size"
    :filterable="item.filterable != null ? item.filterable : true"
    :multiple="isMultiple()"
    :collapse-tags="isMultiple()"
    :collapse-tags-tooltip="isMultiple()"
    :max-collapse-tags="isMultiple() ? 3 : null"
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

watch([() => props.modelValue], ([newModelValue]) => {
  // if (options.value == null || options.value.length === 0) return; // 下拉数据源加载未完成不回显
  if (newModelValue == undefined) {
    selectedValue.value = undefined;
    return;
  }
  let nd = null;
  try  {
    const s: string = newModelValue;
    if(typeof s === "string" &&s.trim().startsWith('[') && s.trim().endsWith(']')){
      nd = JSON.parse(newModelValue);
    }else{
      nd = newModelValue;
    }
  }catch(e) {
    nd = newModelValue;
  }
  selectedValue.value = nd;
  if (props.item.typeCode && options.value.length === 0) {
    uploadOption();
  }else if(props.item.typeCode && props.item.disabled){  // 如果是禁用项,则固定刷新下拉选
    uploadOption();
  }
});

watch(
  () => props.item.disabled,
  (newData, oldData) => {
    if (oldData && !newData) {
      //如果true 改 false,则做一次重新option获取
      nextTick(() => {
        if (props.item.typeCode) {
          console.log(getParam());
          uploadOption();
        }
      });
    }
  },
  { deep: true }
);
/**
 * 页面数据监听
 */
watch(
  [() => props.item.loadData],
  ([newloadData]) => {
    if (newloadData) {
      options.value = newloadData;
    }
  },
  { deep: true }
);

watch(
  [() => props.item.typeCode],
  ([newtypeCode]) => {
    if (newtypeCode) {
      uploadOption();
    }
  },
  { deep: true }
);

watch(
  [() => props.item.codeParam],
  ([newCodeParam]) => {
    if (newCodeParam) {
      uploadOption();
    }
  },
  { deep: true }
);

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
    .then((res) => {
      if (res) {
        options.value = res;
      }
    })
    .catch((err) => {
      console.error(err);
      options.value = [];
    });
}
function isMultiple(){
  if(props.item.multiple === true || props.item.multiple === 1 || props.item.multiple === '1'){
    return true;
  }else{
    return false;
  }
}
function isReadonly(){
  if(props.item.readonly === true || props.item.readonly === 1 || props.item.readonly === '1'){
    return true;
  }else{
    return false;
  }
}
function isClearable(){
  if(props.item.clearable === true || props.item.clearable === 1 || props.item.clearable === '1'){
    return true;
  }else{
    return false;
  }
}
function isDisabled(){
  if(props.item.disabled === true || props.item.disabled === 1 || props.item.disabled === '1'){
    return true;
  }else{
    return false;
  }
}

function handleChange(val?: string | number | Array<any> | undefined) {
  const option = options.value.find((item) => item.value === val);
  emits("valueChange", val);
  emits("update:modelValue", val);
  // props.item.func ? props.item.func(val, option) : null;
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
    if (!props.item.loadData && !props.item.typeCode) {
      options.value = [];
    } else if (!props.item.loadData && !!props.item.typeCode) {
      if (props.item.disabled) {
        //如果属性被标记为不可读,则初始化不自动加载下拉选,但是值变更的时候,再额外触发下拉选
        return;
      }
      uploadOption();
    } else {
      options.value = props.item.loadData;
    }
  }
});

function updateOption(newOption: any) {
  options.value = newOption;
}
function isReQuired() {
  // 如果是禁用状态,默认带底色
  if(props.item.disabled === true || props.item.disabled === '1' || props.item.disabled === 1){
    return false;
  }
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

function getParam() {
  let p: any = {};
  if (props.item.codeParam && typeof props.item.codeParam === "string") {
    p = JSON.parse(props.item.codeParam);
  } else {
    if (props.item.codeParam) {
      p = JSON.parse(JSON.stringify(props.item.codeParam));
    }
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

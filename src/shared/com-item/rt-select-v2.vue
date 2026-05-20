<template>
  <!-- 重构为v2版本的下拉选择框-->
  <template v-if="!showLabel">
    <el-tooltip
      :content="changeContent ? changeContent : getLabel()"
      :disabled="!changeContent && (getLabel() ? false : true)"
      placement="top"
    >
      <el-select-v2
        ref="selectV2Ref"
        v-model="selectedValue"
        :class="[
          ...customClass,
          ...[isReQuired() ? 're-quired-flag' : '']
        ]"
        :placeholder="item.placeholder ? item.placeholder : '请选择'"
        :disabled="isReadonly() || isDisabled()"
        :clearable="isClearable()"
        :size="item.size"
        value-key="label"
        :filterable="item.filterable != null ? item.filterable : true"
        :multiple="isMultiple()"
        :collapse-tags="isMultiple()"
        :collapse-tags-tooltip="isMultiple()"
        :max-collapse-tags="isMultiple() ? 3 : null"
        :options="options"
        @visible-change="showOptions"
        @change="handleChange"
        :style="{'min-width': item.minWidth || '50px'}"
        :fit-input-width="fitInputWidth()"
        popper-class="rt-select-popper"
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
        <!------ 这里注意下,这个item和上层item重复了,但是又不能重命名,所以只能这样用了 -------->
        <template
          #default="{ item }"
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
          <el-tag :color="item.color" effect="dark">{{ item.label }}</el-tag>
        </template>
      </el-select-v2>
    </el-tooltip>
  </template>
  <div class="width-100" v-else>
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
      <el-text class="mx-1" truncated @click="checkIfTruncated($event, selectLabel)">
        {{ selectLabel }}
      </el-text>
    </template>
  </div>
</template>

<script setup lang="ts">
import { codeListViewStore } from "@/store";
import {checkIfTruncated} from "@/utils/common";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const codeListMap = inject<any>('codeListMap', {});
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
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
  wvalue: {
    type: [String, Number, Array<any>, Boolean],
    required: false,
  }
});

interface OptionTypeBySelect extends OptionType {
  color?: string;
  disabled?: boolean;
}

const options: Ref<OptionTypeBySelect[]> = ref([]); // 字典下拉数据源

const selectV2Ref = ref("selectV2Ref");

const emits = defineEmits(["update:item", "update:modelValue", "valueChange"]); // 父组件监听事件，同步子组件值的变化给父组件

const selectedValue = ref<string | number | Array<any> | Boolean | undefined>();

function getValues() {
  if (typeof selectedValue.value === "object" && props.item.multiple) {
    const se = options.value.filter((item) => {
      if (selectedValue.value.includes(item.value)) {
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

const customClass = ref<string[]>([]);
const changeContent = ref<string | undefined>();

watch([() => props.modelValue], ([newModelValue]) => {
  // if (options.value == null || options.value.length === 0) return; // 下拉数据源加载未完成不回显
  if (newModelValue == undefined) {
    selectedValue.value = undefined;
    return;
  }
  let nd = null;
  try {
    const s: string = newModelValue;
    if (
      typeof s === "string" &&
      s.trim().startsWith("[") &&
      s.trim().endsWith("]")
    ) {
      nd = JSON.parse(newModelValue);
    } else {
      nd = newModelValue;
    }
  } catch (e) {
    nd = newModelValue;
  }
  selectedValue.value = nd;
  if (props.item.typeCode && options.value.length === 0) {
    uploadOption();
  } else if (props.item.typeCode && props.item.disabled) {
    // 如果是禁用项,则固定刷新下拉选
    uploadOption();
  }
});

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
  () => props.wvalue,
  (n,o) => {
    selectedValue.value = n;
  },
  { deep: true }
);

watch(
  () => props.item.disabled,
  (newData, oldData) => {
    if (oldData && !newData) {
      //如果true 改 false,则做一次重新option获取
      nextTick(() => {
        if (props.item.typeCode) {
          uploadOption();
        }
      });
    }
  },
  { deep: true }
);

watch(
  [() => props.item.typeCode],
  ([newtypeCode,old]) => {
    if (newtypeCode !== old) {
      uploadOption();
    }
  },
  { deep: true }
);

watch(
  [() => props.item.codeParam],
  ([newCodeParam,old]) => {
    if (newCodeParam !== old) {
      uploadOption();
    }
  },
  { deep: true }
);

watch(() => props.showLabel ,
  (newShowLabel) => {
    if (!newShowLabel && props.item.typeCode && Object.keys(getParam()).length > 0) {
      uploadOption();
    }
  }
);

function getCodeListMapToOption(): boolean {
  const rowId = props.row && props.row._dataId ? props.row._dataId : '';
  if(!!codeListMap) {
    if(!!codeListMap[props.item.typeCode + rowId]) {
      options.value = codeListMap[props.item.typeCode + rowId];
      return true;
    }else if(!!codeListMap[props.item.prop + rowId]) {
      options.value = codeListMap[props.item.prop + rowId];
      return true;
    }
  }
  return false;
}
function uploadOption() {
  if(getCodeListMapToOption()) return;
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
        if(!!codeListMap && (!getParam() || Object.keys(getParam()).length === 0)) {
          const rowId = props.row && props.row._dataId ? props.row._dataId : '';
          codeListMap[props.item.prop + rowId] = res;
        }
      }
    })
    .catch((err) => {
      console.error(err);
      options.value = [];
    });
}
function handleChange(val?: string | number | Array<any> | undefined) {
  const option = options.value.find((item) => item.value === val);
  emits("valueChange", val);
  emits("update:modelValue", val);
  // props.item.func ? props.item.func(val, option) : null;
}
const selectLabel = computed(() => {
  return getLabel();
})
function getLabel(val: any = undefined): any {
  let values = val;
  if(!values) {
    values = selectedValue.value;
  }
  getCodeListMapToOption();
  if (options.value && options.value.length > 0) {
    let se = null;
    if(!Array.isArray(values)){
      const s = options.value.find((item) => item.value === values);
      if (s) {
        se = s.label;
      }
    }else{
      if(values && values.length > 0){
        let str = "";
        values.forEach((i) => {
          const s = options.value.find((item) => {
            return item.value === i
          });
          str += (s?.label+",");
        });
        str = str.substring(0,str.length-1);
        se = str;
      }
    }
    if(se){
      return se;
    }else{
      return null;
    }
  }
}

function showOptions(visible: boolean){
  if(visible){
    if(getCodeListMapToOption()) {
    }else if (props.item.typeCode && options.value.length === 0) {
      uploadOption();
    } else if (props.item.typeCode && props.item.disabled) {
      // 如果是禁用项,则固定刷新下拉选
      uploadOption();
    }
  }
}

onMounted(() => {
  if(props.wvalue){
    selectedValue.value = props.wvalue;
  }
  // 初始化组件数据
  if (props.item) {
    if(getCodeListMapToOption()) return;
    if (!props.item.loadData && !props.item.typeCode) {
      options.value = [];
    } else if (!!props.item.typeCode) {
      if (props.item.disabled) {
        //如果属性被标记为不可读,则初始化不自动加载下拉选,但是值变更的时候,再额外触发下拉选
        return;
      }
      // uploadOption();
    } else {
      options.value = props.item.loadData;
    }
  }
});
function isMultiple() {
  if (
    props.item.multiple === true ||
    props.item.multiple === 1 ||
    props.item.multiple === "1"
  ) {
    return true;
  } else {
    return false;
  }
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
function getParam() {
  let p: any = {};
  if (props.item.codeParam && typeof props.item.codeParam === "string") {
    p = JSON.parse(props.item.codeParam);
  } else {
    if (props.item.codeParam) {
      p = JSON.parse(JSON.stringify(props.item.codeParam));
    }
  }

  if (props.item.disabled || props.showLabel) {
    if (!p) {
      p = { value: selectedValue.value };
    } else if(!Array.isArray(selectedValue.value)) {
      p.value = selectedValue.value;
    }
    // 做特殊处理--特种设备清单信息-特种设备种类
    if(props.item.typeCode == 'Search_Equipment_List'){
      p = { cCde: selectedValue.value };
    }
  }
  return p;
}

function setCustomClass(classs: string[]) {
  customClass.value = classs;
}
function setChangeInfo(content: any) {
  if(content) {
    changeContent.value = (content.text ? getLabel(content.text) : '') + ' 变更为 ' +  getLabel();
  }else {
    changeContent.value = undefined;
  }
}

function fitInputWidth() {
  return false;
}

onUnmounted(() => {
  if(Object.keys(codeListMap).length > 0) {
    const rowId = props.row && props.row._dataId ? props.row._dataId : '';
    delete codeListMap[props.item.typeCode + rowId];
    delete codeListMap[props.item.prop + rowId];
  }
});
defineExpose({
  setCustomClass,
  setChangeInfo
})
</script>
<style lang="scss" scoped>
:deep(.el-select__wrapper) {
  padding: 4px 6px;
}
</style>
<style>
.rt-select-popper .el-select-dropdown {
  width: auto!important;
}
.rt-select-popper .el-select-dropdown__item {
  width: auto!important;
  min-width: 100%;
}
</style>
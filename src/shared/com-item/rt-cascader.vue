<!-- 多级的级联选择器，如省市区 -->
<template>
  <!-- 下拉选择框-->
  <el-tooltip
      :content="changeContent"
      :disabled="!changeContent"
      placement="top"
  >
    <div class="cascader_" v-show="!props.showLabel">
      <el-cascader
        ref="cascaderRef"
        v-model="selectedValue"
        :class="[
          'cascader_',
          ...customClass,
          ...[isReQuired() ? 're-quired-flag' : '']
        ]"
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
        @visible-change="visibleChange"
      >
        <template #empty>
          {{ "暂无数据" }}
        </template>
        <template #default="{ node, data }">
          <span :style="{'font-weight': data.value === 'FZ' ? 'bold' : 'normal'}">{{ data.label }}</span>
        </template>
      </el-cascader>
    </div>
  </el-tooltip>
  <div class="width-100" v-if="props.showLabel">
     <el-text class="mx-1" truncated @click="checkIfTruncated($event, displayText)">{{ displayText }}</el-text>
  </div>
</template>

<script setup lang="ts">
import { codeListViewStore } from "@/store";
import { CascaderProps } from "element-plus";
import {CommonConstants} from "@/constants/CommonConstants";
import {checkIfTruncated} from "@/utils/common";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

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

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);

const codeListMap = inject<any>('codeListMap', {});

const options: Ref<OptionTypeBySelect[]> = ref([]); // 字典下拉数据源

const cascaderRef = ref();

const emits = defineEmits(["update:item", "update:modelValue", "valueChange"]); // 父组件监听事件，同步子组件值的变化给父组件

const selectedValue = ref<string | number | Array<any> | undefined>();

const displayText = computed(() => cascaderRef.value?.presentText);

const customClass = ref<string[]>([]);

const changeContent = ref<string | undefined>();

// 添加一个标志，标识数据是否已加载
const isDataLoaded = ref(false);

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
    if(props.item.lazyLoad && typeof props.item.lazyLoad === CommonConstants.TYPE_OF_FUNCTION) {
      props.item.lazyLoad(node, resolve, props.row);
    }else {
      lazyLoadFun(node, resolve);
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
  ([newloadData, newtypeCode],[oldloadData, oldtypeCode]) => {
    if (newloadData) {
      updateOption(newloadData);
    }
    if (newtypeCode !== oldtypeCode) {
      uploadOption();
    }
  },
  { deep: true }
);

watch(codeListMap, (newOptions, oldOptions) => {
  if(newOptions) {
    getCodeListMapToOption();
  }
});

function handleChange(val?: string | number | Array<any> | undefined) {
  emits("valueChange", val);
  emits("update:modelValue", val);
  // props.item.func ? props.item.func(val, props.row, codeListMap) : null;
}
function visibleChange(visible: boolean) {
  if (visible) {
    getCodeListMapToOption();
  }
}

function uploadOption() {
  clearCheckedNodes();
  if(getCodeListMapToOption()) {
    // 优先查 codeListMap.value
  } else if (!getParam() || Object.keys(getParam()).length === 0) return;
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
    if(getCodeListMapToOption()) {
      // 优先查 codeListMap.value
		} else if (props.item.loadData) {
			const hasCHN = props.item.loadData.some(item => item.value === 'CHN');

      if (hasCHN) {
        // 3. 只有当存在 CHN 时，才进行特殊处理
        const processedData = props.item.loadData.map(item => {
          // 规则：如果是 CHN，则 isLeaf = false (允许展开)
          //       如果不是 CHN (无论是 HKG, MAC 还是其他)，则 isLeaf = true (直接选中)
          const isLeaf = item.value !== 'CHN';

          return {
            ...item,
            leaf: isLeaf
          };
        });
        
        options.value = processedData;
      } else {
        options.value = props.item.loadData;
      }
      isDataLoaded.value = true;
    } else if (
      props.item.typeCode &&
      props.modelValue &&
      getParam() &&
      Object.keys(getParam()).length > 0
    ) {
      // 只有在没有缓存数据且需要加载时才请求数据
      if (!isDataLoaded.value) {
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
  }
});

function lazyLoadFun(node: any, resolve: Function) {
  const { level, value } = node;
  if (level !== 0 && !!value) {
    // 一般批改安全生产责任险的选项和别的不一样，所以不取缓存数据，每次都请求接口获取
    const list = node.label !== "一般批改" ? codeListMap[`${props.item.typeCode}-${level}-${value}`] : '';
    if(list) {
      resolve(list);
      return;
    }
    const codeListParam = {};
    let codeListName = props.item.typeCode; // 默认使用配置的typeCode
    // 批改原因级联
    if(props.item.typeCode === "EDR_RSN_LIST_NEW" || props.item.typeCode ==='EDR_RSN_LIST_YY' || props.item.typeCode ==='EDR_RSN_LIST_AY') {
      codeListParam.rsnTyp = value.split('-')[0]
      codeListParam.kindNo = value.split('-')[1]
      if (props.row && props.row.cProdNo) {
        codeListParam.prodNo = props.row.cProdNo;
        codeListParam.cTransMrk = props.row.cTransMrk;
      }
      if(codeListParam.rsnTyp == '2' || codeListParam.rsnTyp == '3'){
        codeListName = "EDR_RSN_LIST_CANCEL";
      }
    } else {
      codeListParam.cParCde = value
    }
    codeListStore
        .queryCodeList(
            {
              // codeListName: props.item.typeCode,
              codeListName: codeListName,
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
          if(props.item.typeCode === "EDR_RSN_LIST_NEW" || props.item.typeCode ==='EDR_RSN_LIST_YY' ||  props.item.typeCode ==='EDR_RSN_LIST_AY') {
            res.forEach((e: any) => {
              e.leaf = level >= 1;
            });
          } else {
            res.forEach((e: any) => {
              if(e.counts !== null && e.counts !==undefined && e.counts === 0){
                e.leaf = true;
              }else{
                e.leaf = level >= (l && l.length > 0 ? l.length - 1 : 5);
              }
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
// 清空选中的节点
function clearCheckedNodes() {
  if(cascaderRef.value && cascaderRef.value.cascaderPanelRef) {
    cascaderRef.value.cascaderPanelRef?.clearCheckedNodes();
  }
}
function updateOption(newOption: any) {
  clearCheckedNodes();
  options.value = newOption;
}
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
function getParam() {
  if (props.item.codeParam && typeof props.item.codeParam === "string") {
    return JSON.parse(props.item.codeParam);
  } else {
    return props.item.codeParam;
  }
}

function getTextValue() {
  return displayText.value;
}
function setCustomClass(classs: string[]) {
  customClass.value = classs;
}
function setChangeInfo(content: any) {
  if(content) {
    let text = content.text;
    // TODO 将content.text code值翻译为label
    changeContent.value = (text ? text : '') + ' 变更为 ' +  getTextValue();
  }else {
    changeContent.value = undefined;
  }
}


// onUnmounted(() => {
//   if(Object.keys(codeListMap).length > 0) {
//     const rowId = props.row && props.row._dataId ? props.row._dataId : '';
//     delete codeListMap[props.item.typeCode + rowId];
//     delete codeListMap[props.item.prop + rowId];
//   }
// });
// 添加一个方法用于手动清除缓存（可选）
function clearCache() {
  if(Object.keys(codeListMap).length > 0) {
    const rowId = props.row && props.row._dataId ? props.row._dataId : '';
    delete codeListMap[props.item.typeCode + rowId];
    delete codeListMap[props.item.prop + rowId];
  }
  isDataLoaded.value = false;
}
defineExpose({
  updateOption,
  getTextValue,
  setCustomClass,
  setChangeInfo,
  clearCheckedNodes,
  clearCache
});
</script>
<style lang="scss">
.cascader_ {
  width: 100%;
}
</style>

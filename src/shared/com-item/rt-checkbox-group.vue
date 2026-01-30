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
        :checked="option.checked"
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
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

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
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);

const emits = defineEmits(["update:item", "update:modelValue", "valueChange"]); // 父组件监听事件，同步子组件值的变化给父组件

const options: Ref<OptionType[]> = ref([]); // 字典下拉数据源
const selectedValue = ref<string[] | number[] | undefined>();

watch([options, () => props.modelValue], ([newOptions, newModelValue]) => {
  if (newModelValue == undefined) {
    selectedValue.value = undefined;
    return;
  }
  selectedValue.value = newModelValue;
  if (props.item.typeCode && options.value.length === 0) {
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
function handleChange(val?: string | number | Array<any> | undefined) {
  const option = options.value.find((item) => item.value === val);
  emits("valueChange", val, option);
  emits("update:modelValue", val, option);
  emits("update:item", val, option);
  // props.item.func ? props.item.func(val, option) : null;
}

function uploadOption() {
  codeListStore
    .queryCodeList(
      {
        codeListName: props.item.typeCode,
        codeListParam: getParam(),
      },
      false,
      props.item.cache ? props.item.cache : true
    )
    .then((res) => {
      if(res){
        options.value = res;
      }
    })
    .catch((err) => {
      console.error(err);
      options.value = [];
    });
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
</script>

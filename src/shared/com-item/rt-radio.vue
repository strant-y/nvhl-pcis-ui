<template>
  <el-radio-group
    ref="radioRef"
    v-model="selectedValue"
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
    @change="handleChange"
    :size="item.size"
  >
    <template v-if="item.type === 'button'">
      <el-radio-button
        v-for="option in options"
        :value="option.value"
        :key="option.value"
      >
        {{ option.label }}
      </el-radio-button>
    </template>
    <template v-else>
      <el-radio
        v-for="option in options"
        :value="option.value"
        :key="option.value"
        :border="
          item.border
            ? typeof item.border === 'boolean'
              ? item.border
              : item.border === 1 || item.border === '1'
                ? true
                : false
            : false
        "
      >
        {{ option.label }}
      </el-radio>
    </template>
  </el-radio-group>
</template>

<script setup lang="ts">
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { codeListViewStore } from "@/store";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

type IconNames = keyof typeof ElementPlusIconsVue;

const vInput = ref<string | number | undefined>();
const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
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

const options: Ref<OptionType[]> = ref([]); // 字典下拉数据源

const selectedValue = ref<string | number | boolean>();

const emits = defineEmits(["update:item", "update:modelValue", "valueChange"]); // 父组件监听事件，同步子组件值的变化给父组件

watch([options, () => props.modelValue], ([newOptions, newModelValue]) => {
  if (newOptions == null || newOptions.length === 0) return; // 下拉数据源加载未完成不回显
  if (newModelValue == undefined) {
    selectedValue.value = undefined;
    return;
  }
  selectedValue.value = newModelValue;
  if (props.item.typeCode && options.value.length === 0) {
    uploadOption();
  }
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
  }
);
function handleChange(val?: string | number | boolean | undefined) {
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
      if (res) {
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
    if (!props.item.loadData && !!props.item.typeCode) {
      codeListStore
        .queryCodeList(
          {
            codeListName: props.item.typeCode,
            codeListParam: props.item.codeParam,
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

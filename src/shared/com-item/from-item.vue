<template>
  <component
    ref="itemRef"
    :is="getcomRef(item.inputtype)"
    v-model="value"
    :item="item"
    :showLabel="showLabel"
    :parentFromUi="parentFromUi"
    @value-change="handleChange"
    :row="row"
  />
</template>

<script setup lang="ts">
import shared from "../shared";
const props = defineProps({
  modelValue: {
    type: [Object, String, Number, Boolean, Array],
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
    type: Object as () => Record<string, any>,
    required: false,
  },
});
const itemRef = ref("itemRef");
const value = ref<any>();
const key = computed(() => props.item.prop );
const itemConfig = computed(() => props.item );
const initFlag = ref(false);

const emits = defineEmits(["update:modelValue", "updateMethod"]); // 父组件监听事件，同步子组件值的变化给父组件
function handleChange(val?: any) {
  emits("update:modelValue", val);
  emits("updateMethod");
}

watch([() => props.modelValue], ([newModelValue]) => {
  value.value = newModelValue;
  if(!initFlag.value && !!newModelValue) {
    init(true)
  }
  props.item.func ? props.item.func(newModelValue, props.row) : null;
});
function tableExvalidate() {
  if (typeof itemRef.value.tableExvalidate === "function") {
    return itemRef.value.tableExvalidate();
  } else {
    return null;
  }
}

function updateOption(newOption: any) {
  if (itemRef.value.updateOption) {
    itemRef.value.updateOption(newOption);
  }
}

function getcomRef(type: any) {
  return shared.componentMap[type];
}

defineExpose({
  tableExvalidate,
  updateOption,
  key,
  value,
  itemConfig
});

onMounted(() => {
  value.value = props.modelValue;
  if(props.item.defaultValue){
    value.value = props.item.defaultValue;
  }
  init(false);
});

/**
 * 初始化数据变化触发
 * value 组件绑定的value
 * rowData 表格当前行的数据
 * config 当前组件的配置信息
 * itemRef 表单项ref
 */
function init(is: boolean) {
  if(props.item.onInit) {
    props.item.onInit({
      value: props.modelValue,
      rowData: props.row,
      config: props.item,
      itemRef: itemRef.value
    });
    initFlag.value = is;
  }
}
</script>

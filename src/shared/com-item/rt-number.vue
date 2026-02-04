<template>
  <template v-if="!showLabel">
    <el-tooltip
        :content="changeContent || vInput && item.precision ? vInput.toFixed(item.precision) : vInput"
        :disabled="!changeContent && !vInput"
        placement="top"
    >
      <el-input-number
          ref="inputNumberRef"
          v-model="vInput"
          :class="[
          ...customClass,
          ...[isReQuired() ? 're-quired-flag' : '']
      ]"
          :readonly="isReadonly()"
          :placeholder="item.placeholder"
          :disabled="isDisabled()"
          :min="item.min!=null && item.min !=undefined ?  item.min : 0"
          :max="item.max!=null && item.max !=undefined ?  item.max : 99999999999999999999"
          :step="item.step"
          :step-strictly="item.stepStrictly"
          :size="item.size"
          :precision="item.precision"
          :controls="item.controls ? item.controls : false"
          controls-position="right"
          @change="handleChange"
          :style="{maxWidth: item.maxWidth || ''}"
      >
        <template #prefix v-if="item.prefix">
          <span>{{ item.prefix }}</span>
        </template>
        <template #suffix v-if="item.suffix">
          <span>{{ item.suffix }}</span>
        </template>
      </el-input-number>
    </el-tooltip>
  </template>
  <span v-else style="width: 100%;">
    {{
      (item.prefix ? item.prefix : "") +
      (vInput ? vInput : "") +
      (item.suffix ? item.suffix : "")
    }}
  </span>
</template>

<script setup lang="ts">
const emits = defineEmits(["update:modelValue", "valueChange"]); // 父组件监听事件，同步子组件值的变化给父组件

const props = defineProps({
  modelValue: {
    type: [Number, String],
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
const customClass = ref<string[]>([]);
const changeContent = ref<string | undefined>();
const vInput = ref<number | undefined>();
watch([() => props.modelValue], ([newModelValue]) => {
  vInput.value = newModelValue !== null && newModelValue != undefined ? Number(newModelValue) : undefined;
});

function handleChange(val?: string | number | undefined) {
  emits("update:modelValue", val);
  emits("valueChange", val);
  // props.item.func ? props.item.func(val) : null;
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

onMounted(() => {
  vInput.value = props.modelValue ? Number(props.modelValue) : undefined;
});

function setCustomClass(classs: string[]) {
  customClass.value = classs;
}
function setChangeInfo(content: any) {
  if(content) {
    changeContent.value = (content.text ? content.text : '') + ' 变更为 ' + vInput.value;
  }else {
    changeContent.value = undefined;
  }
}
defineExpose({
  setCustomClass,
  setChangeInfo
});
</script>

<style scoped>
.el-input-number {
  width: 100%;
}
::v-deep .el-input__inner {
  text-align: left !important;
}
:deep(.el-input__wrapper) {
  padding: 1px 5px!important;
}
</style>

<template>
  <template v-if="!showLabel">
    <el-tooltip
        :content="!!changeContent ? changeContent : (!!vInput && vInput !== 'undefined' ? vInput : '')"
        :disabled="!changeContent && (!vInput || vInput === 'undefined' || vInput === '' || vInput === '0')"
        placement="top"
    >
      <el-input
        ref="inputRef"
        :placeholder="item.placeholder"
        :size="item.size"
        :type="
          item.type === 'color' || item.type === 'number' ? 'text' : item.type
        "
        :class="[
            ...customClass,
            ...[isReQuired() ? 're-quired-flag' : '']
        ]"
        :showPassword="item.showPassword"
        :rows="item.rows"
        :style="
          item.type === 'color'
            ? { width: 'calc(100% - 32px)' }
            : item.type === 'icon'
              ? { width: 'calc(100% - 48px)' }
              : { width: '100%' }
        "
        :maxlength="item.maxlength"
        :minlength="item.minlength"
        :readonly="
          item.type === 'color' || item.type === 'icon'
            ? true
            : item.readonly
              ? typeof item.readonly === 'boolean'
                ? item.readonly
                : item.readonly === 1 || item.readonly === '1'
                  ? true
                  : false
              : false
        "
        :disabled="
          item.disabled
            ? typeof item.disabled === 'boolean'
              ? item.disabled
              : item.disabled === 1 || item.disabled === '1'
                ? true
                : false
            : false
        "
        :autosize="item.autosize"
        :clearable="
          item.clearable
            ? typeof item.clearable === 'boolean'
              ? item.clearable
              : item.clearable === 1 || item.clearable === '1'
                ? true
                : false
            : false
        "
        :formatter="
          item.type === 'number'
            ? (value) => {
                if (value == null) return '';
                let num = value.replace(/[^0-9.-]/g, '');
                const parts = `${num}`.split('.');
                const integerPart = parts[0].replace(
                  /\B(?=(\d{3})+(?!\d))/g,
                  ','
                );
                const decimalPart = parts.length > 1 ? `.${parts[1]}` : '';
                return integerPart + decimalPart;
              }
            : (value) => value
        "
        :parser="
          item.type === 'number'
            ? (value) => {
              return value?.replace(/,/g, '') ?? ''
            }
            : (value) => value
        "
        v-model="vInput"
        @change="handleChange"
      >
        <template #suffix v-if="item.suffix">
          {{ item.suffix }}
        </template>
        <template #suffix v-else-if="item.suffixIcon">
          <el-icon>
            <component :is="renderIcon(item.suffixIcon)" />
          </el-icon>
        </template>
        <template #prefix v-if="item.prefix">
          {{ item.prefix }}
        </template>
        <template #prefix v-else-if="item.prefixIcon">
          <el-icon>
            <component :is="renderIcon(item.prefixIcon)" />
          </el-icon>
        </template>
        <template #prepend v-if="item.prepend">
          {{ item.prepend }}
        </template>
        <template #prepend v-else-if="item.prependIcon">
          <el-icon>
            <component :is="renderIcon(item.prependIcon)" />
          </el-icon>
        </template>
        <template #append v-else-if="item.append">
          {{ item.append }}
        </template>
        <template #append v-else-if="item.appendIcon">
          <el-icon>
            <component :is="renderIcon(item.appendIcon)" />
          </el-icon>
        </template>
      </el-input>
    </el-tooltip>

    <template v-if="item.type === 'color'">
      <el-color-picker v-model="vInput" @change="handleChange" />
    </template>
    <template v-if="item.type === 'icon'">
      <rt-button
        :item="{
          icon: 'Paperclip',
          popover: 'selectIconPopover',
          popoverWidth: 500,
          position: item.popoverposition?.popoverposition || 'left-start',
        }"
        @closepopover="
          (rev) => {
            vInput = rev;
            handleChange(rev);
          }
        "
      />
    </template>
  </template>
  <span v-else>
    <template v-if="item.type === 'icon'">
      <rt-icon :item="{ icon: vInput }" />
    </template>
    <template v-else>
      {{ vInput }}
    </template>
  </span>
</template>

<script setup lang="ts">
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
type IconNames = keyof typeof ElementPlusIconsVue;
const props = defineProps({
  modelValue: {
    type: [String, Number],
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

function isReQuired(){
  // 如果是禁用状态,默认带底色
  if(props.item.disabled === true || props.item.disabled === '1' || props.item.disabled === 1){
    return false;
  }
  if(props.item.required === '1' || props.item.required === 1 || props.item.required === true){
    return true;
  }
  const rule = props.item.rules;
  let r = false;
  if(rule && rule.length > 0){
    for (const key in rule) {
      if(rule[key].required){
        r = true;
      }
    }
  }
  return r;
}
const emits = defineEmits(["update:modelValue", "valueChange"]); // 父组件监听事件，同步子组件值的变化给父组件
const vInput = ref<string | Number | undefined>();
const customClass = ref<string[]>([]);
const changeContent = ref<string | undefined>();
watch([() => props.modelValue], ([newModelValue]) => {
  let n = null;
  if (props.item.type === "number") {
    if(props.item.precision && newModelValue){
      n = Number(newModelValue).toFixed(props.item.precision);
    }else{
      n = newModelValue + "";
    }
  }else{
    n = newModelValue;
  }
  
  vInput.value = n;
});

function handleChange(val?: string | undefined | null) {
  let nv = 0;
  if (props.item.type === "number") {
    nv = val ? Number(val.replace(/[^\d.-]/g, '')) : null;
    let Max = 99999999999;
    if(props.item.max || props.item.max === 0){
      Max = props.item.max;
    }
    if(nv > Max){
      nv = Max;
      vInput.value = nv + "";
    }
    let Min = 0;
    if(props.item.min || props.item.min === 0){
      Min = props.item.min;
    }
    if(nv < Min){
      nv = Min;
      vInput.value = nv + "";
    }
    emits("valueChange", nv);
    emits("update:modelValue", nv);
  } else {
    emits("valueChange", val);
    emits("update:modelValue", val);
  }
  // props.item.func ? props.item.func(val) : null;
}

onMounted(() => {
  if (props.item.type === "number") {
      vInput.value = props.modelValue + "";
    }else{
      vInput.value = props.modelValue;
    }
  
});

const renderIcon = (iconName: string) => {
  const iconComponent = ElementPlusIconsVue[iconName as IconNames];
  if (iconComponent) {
    return h(resolveComponent(iconComponent.name));
  }
  return null;
};
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

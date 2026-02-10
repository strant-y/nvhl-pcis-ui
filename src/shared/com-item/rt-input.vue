<template>
  <template v-if="!showLabel">
    <el-tooltip
        :disabled="!changeContent && (!vInput || vInput === 'undefined' || vInput === '' || vInput === '0' || vInput === 'null' || item.type === 'textarea')"
        placement="top"
    >
      <template #content>
        <div style="display: flex;align-items: center;font-size: 13px">
          <span v-if="changeContent">{{`${changeContent} &nbsp; 变更为 &nbsp; ${vInput}`}}</span>
          <span v-else>{{!!vInput && vInput !== 'undefined' ? vInput : ''}}</span>
          <el-icon
            v-if="changeContent"
            style="margin-left: 10px;"
            size="17"
            title="恢复"
            color="orange"
            @click="tooltipIconClick"
          >
            <RefreshLeft />
          </el-icon>
        </div>
      </template>
      <el-input
        ref="inputRef"
        :placeholder="item.placeholder"
        :size="item.size"
        :type="
          ( item.type !== 'textarea' && item.type !== 'password') ? 'text' : item.type
        "
        :class="[
            ...customClass,
            ...[isReQuired() ? 're-quired-flag' : '']
        ]"
        :showPassword="item.showPassword"
        :rows="item.rows"
        :style="
          item.type === 'color' ?
            { width: 'calc(100% - 32px)' } :
              (item.type === 'icon' ? { width: 'calc(100% - 48px)' } : { width: '100%', minWidth: item.minWidth || '50px', maxWidth: item.maxWidth || '' })
        "
        :maxlength="item.maxlength"
        :minlength="item.minlength"
        :show-word-limit="
          item.showWordLimit ? 
            typeof item.showWordLimit === 'boolean' ? 
              item.showWordLimit : 
              (item.showWordLimit === '1' ||  item.showWordLimit === 1) ? true : false
            : false "
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
                if (value === null || value === '' || value === undefined) return '';
                let num = value.replace(/[^0-9.-]/g, '');
                const parts = `${num}`.split('.');
                const integerPart = parts[0].replace(
                  /\B(?=(\d{3})+(?!\d))/g,
                  ','
                );
                const decimalPart = parts.length > 1 ? `.${parts[1]}` : '';
                return integerPart + decimalPart;
              }
            :(item.type === 'percent' || item.type === 'permill') ?(value) => { // 格式化,仅允许数字录入
              if (value === null || value === '' || value === undefined) return '';
              let num = value.replace(/[^0-9.-]/g, '');
              return num;
            }: (value) => value
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
        @input="handleInput"
        @blur="handleBlur(vInput)"
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
  <div class="width-100" v-else>
    <template v-if="item.type === 'icon'">
      <rt-icon :item="{ icon: vInput }" />
    </template>
    <template v-else>
      <!-- 添加图标显示 -->
      <el-icon v-if="item.prefixIcon" >
        <component :is="renderIcon(item.prefixIcon)" />
      </el-icon>
      <span v-if="item.prefix" style="vertical-align: top;">{{ item.prefix }}</span>
      <el-text class="mx-1" truncated @click="checkIfTruncated($event, vInput)" @dblclick="item.dblFunc ? item.dblFunc(vInput, row) : ()=>{}">
        {{vInput !== 'undefined' && vInput !== 'null' ? vInput : ''}}
      </el-text>
      <!-- 添加复制图标 -->
      <el-icon
        v-if="item.showCopyIcon"
        style="margin-left: 5px; cursor: pointer; color: #409eff;"
        @click="copyToClipboard(vInput)"
      >
        <CopyDocument />
      </el-icon>
    </template>
  </div>
</template>

<script setup lang="ts">
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import {checkIfTruncated} from "@/utils/common";
import Decimal from "decimal.js";
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
  }else if (props.item.type === "percent") {
    n = (newModelValue || newModelValue == 0)? (new Decimal(newModelValue).times(100).toString() + "") : "";
  }else if (props.item.type === "permill") {
    n = newModelValue? (new Decimal(newModelValue).times(1000).toString() + "") : "";
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
  } else if (props.item.type === "percent") {
    nv = val ? Number(val) : null;
    if(nv){
      nv = Number(new Decimal(nv).div(100).toString());
    }
    emits("valueChange", nv);
    emits("update:modelValue", nv);
  } else if (props.item.type === "permill") {
    nv = val ? Number(val) : null;
    if(nv){
      nv = Number(new Decimal(nv).div(1000).toString());
    }
    emits("valueChange", nv);
    emits("update:modelValue", nv);
  }else {
    emits("valueChange", val);
    emits("update:modelValue", val);
  }
  // props.item.func ? props.item.func(val) : null;
  if(handleInputFlag.value === true && props.item?.funcBlur) {
    props.item.funcBlur(val)
  }
}

onMounted(() => {
  if (props.item.type === "number") {
    vInput.value = props.modelValue + "";
  }else if (props.item.type === "percent") {
    vInput.value = props.modelValue? (new Decimal(props.modelValue).times(100).toString() + "") : "";
  }else if (props.item.type === "permill") {
    vInput.value = props.modelValue? (new Decimal(props.modelValue).times(1000).toString() + "") : "";
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
    changeContent.value = content ? content.text : undefined;
}
function tooltipIconClick() {
  const text = changeContent.value;
  changeContent.value = undefined;
  vInput.value = undefined;
  nextTick(() => {
    handleChange(text);
  })
}

// 复制到剪贴板方法
function copyToClipboard(text:any) {
  if (!text) {
    // 如果文本为空，给出提示
    alert('没有可复制的内容');
    return;
  }

  try {
    // 使用 Clipboard API（现代浏览器）
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        ElMessage.success('复制成功');
      }).catch(() => {
        // 如果 Clipboard API 失败，使用备选方案
        fallbackCopyTextToClipboard(text);
      });
    } else {
      // 旧版浏览器使用备选方案
      fallbackCopyTextToClipboard(text);
    }
  } catch (error) {
    ElMessage.error('复制失败');
  }
}

// 备选复制方法
function fallbackCopyTextToClipboard(text:any) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // 避免滚动到底部
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      ElMessage.success('复制成功');
    } else {
      ElMessage.error('复制失败');
    }
  } catch (err) {
    ElMessage.error('复制失败');
  }

  document.body.removeChild(textArea);
}

function handleBlur(val:any) {
  if(props.item?.funcBlur) {
    props.item.funcBlur(val)
  }
}
const handleInputFlag = ref(false);
function handleInput() {
  if(props.item?.funcBlur) {
    handleInputFlag.value = true;
  }
}
defineExpose({
  setCustomClass,
  setChangeInfo
});
</script>
<style lang="scss" scoped>
:deep(.el-input__wrapper) {
  padding: 1px 5px;
}
</style>

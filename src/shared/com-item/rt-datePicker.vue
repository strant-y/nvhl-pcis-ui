<template>
  <template v-if="!showLabel">
    <el-tooltip
        :content="changeContent"
        :disabled="!changeContent"
        placement="top"
    >
      <el-date-picker
          ref="datepickerRef"
          v-model="vInput"
          :class="[
            'custom-date-picker',
            ...customClass,
            ...[isReQuired() ? 're-quired-flag' : '']
          ]"
          :type="item.type ? item.type : 'date'"
          :readonly="
          item.readonly
            ? typeof item.readonly === 'boolean'
              ? item.readonly
              : item.readonly === 1
                ? true
                : false
            : false
        "
          :disabled="
          item.disabled
            ? typeof item.disabled === 'boolean'
              ? item.disabled
              : item.disabled === 1
                ? true
                : false
            : false
        "
          :placeholder="item.placeholder"
          :disabledDate="
          item.disabledDate && typeof item.disabledDate === 'function'
            ? item.disabledDate
            : (data) => false
        "
          :shortcuts="item.shortcuts"
          :size="item.size"
          :format="item.format ? item.format : getValueFormat()"
          :clearable="
          item.clearable
            ? typeof item.clearable === 'boolean'
              ? item.clearable
              : item.clearable === 1
                ? true
                : false
            : false
        "
          :dateFormat="'YYYY-MM-DD'"
          :timeFormat="'HH:mm:ss'"
          :valueFormat="item.valueFormat ? item.valueFormat : getValueFormat()"
					:default-time="item.defaultTime"
          @change="handleChange"
          @blur="blur"
          :style="{width: '100%'}"
          :unlink-panels="true"
      />
    </el-tooltip>
  </template>
  <el-text v-else class="mx-1" truncated @click="checkIfTruncated($event, vInputShow())">
    {{ vInputShow() }}
  </el-text>
</template>

<script setup lang="ts">
import moment from "moment";
import {checkIfTruncated} from "@/utils/common";
const props = defineProps({
  modelValue: {
    type: [Number, String, Array],
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

const emits = defineEmits(["update:modelValue", "valueChange"]); // 父组件监听事件，同步子组件值的变化给父组件
const vInput = ref<number | string>();
const customClass = ref<string[]>([]);
const changeContent = ref<string | undefined>();
const vInputShow = ()=> {
  const value = props.modelValue;
  const format = props.item.valueFormat
    ? props.item.valueFormat
    : getValueFormat();
  if (format && value) {
    return moment(new Date(value)).format(format)
  } else {
    return "";
  }
};
watch([() => props.modelValue], ([newModelValue]) => {
  if(typeof newModelValue === "number") {
    vInput.value = moment(newModelValue).format(getValueFormat());
  } else if(props.item.type === 'year') {
    vInput.value = newModelValue?.toString();
  } else {
    vInput.value = newModelValue;
  }
});
function blur(v: any) {
  const value = v.target.value;
  if (!value && value === "") {
    return;
  }
  const format = props.item.valueFormat
    ? props.item.valueFormat
    : getValueFormat();
  if (format) {
    const wordsList = format.match(/[a-zA-Z]+/g);
    if (wordsList && wordsList.length > 0) {
      let le = 0;
      let nv = format;
      for (const key in wordsList) {
        const w = wordsList[key];
        const v = value.substring(le, le + w.length);
        nv = nv.replace(w, v);
        le = le + w.length;
      }
      const s = moment(nv).isValid();
      if (s) {
        vInput.value = nv;
        handleChange(nv);
      }
    }
  }
}
function handleChange(val?: string | undefined) {
  emits("valueChange", val);
  emits("update:modelValue", val);
  // props.item.func ? props.item.func(val) : null;
}

function getValueFormat() {
  switch (props.item.type) {
    case "date":
      return "YYYY-MM-DD";
    case "datetime":
      return "YYYY-MM-DD HH:mm:ss";
    case "year":
      return "YYYY";
    case "month":
      return "YYYY-MM";
    default:
      return "YYYY-MM-DD";
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

onMounted(() => {
  vInput.value = props.modelValue;
});

function setCustomClass(classs: string[]) {
  customClass.value = classs;
}
function setChangeInfo(content: any) {
  if(content) {
    changeContent.value = (content.text ? content.text : '') + ' 变更为 ' +  vInputShow();
  }else {
    changeContent.value = undefined;
  }
}
defineExpose({
  setCustomClass,
  setChangeInfo
});
</script>

<style>
.el-date-editor {
  width: 100% !important;
}
.el-tooltip__popper { z-index: 9999 !important; }
</style>

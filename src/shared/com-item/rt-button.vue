<template>
  <template v-if="item">
    <template v-if="item.popover">
      <el-popover
          :visible="visible"
          :width="item.popoverWidth ? item.popoverWidth : 200"
          :placement="item.position ? item.position : 'bottom'"
      >
        <template #reference>
          <el-button
              ref="buttonRef"
              :type="item.type"
              :size="item.size"
              :placeholder="item.placeholder"
              :loading="item.loading"
              :link="
            item.link
              ? typeof item.link === 'boolean'
                ? item.link
              : item.link === 1 || item.link === '1'
                  ? true
                : false
              : false
          "
              :circle="
            item.circle
              ? typeof item.circle === 'boolean'
                ? item.circle
              : item.circle === 1 || item.circle === '1'
                  ? true
                : false
              : false
          "
              :style="{
            backgroundColor: item.buttonColor,
            borderColor: item.buttonColor,
            ...style,
            ...item.btnStyle,
          }"
              @click="visible = !visible"
          >
            <!-- 将isBtn透传,防止出现icon方法重复执行  -->
            <rt-icon v-if="item.icon" :item="{ ...item, isBtn: true }" />
            {{ item.label }}</el-button
          >
        </template>
        <component
            :is="item.popover"
            :param="item"
            @closepopover="closepopover"
        />
      </el-popover>
    </template>
    <template v-else>
      <!-- 使用el-tooltip包装el-button以支持tooltip功能 -->
      <el-tooltip
          v-if="item.tooltip"
          :content="item.tooltip"
          :placement="item.tooltipPosition || 'top'"
          effect="light"
      >
        <el-button
            ref="buttonRef"
            :type="item.type"
            :size="item.size"
            :loading="item.loading"
            :disabled="
          item.disabled ||
          (typeof item.disabled === 'function' ? item.disabled(row) : false)
        "
            :placeholder="item.placeholder"
            :link="
          item.link
            ? typeof item.link === 'boolean'
              ? item.link
            : item.link === 1 || item.link === '1'
                ? true
              : false
            : false
        "
            :circle="
          item.circle
            ? typeof item.circle === 'boolean'
              ? item.circle
            : item.circle === 1 || item.circle === '1'
                ? true
              : false
            : false
        "
            :style="{
          backgroundColor: item.buttonColor,
          borderColor: item.buttonColor,
          ...style,
          ...item.btnStyle,
        }"
            @click="handleChange"
        >
          <!-- 将isBtn透传,防止出现icon方法重复执行  -->
          <rt-icon
              :style="{ marginRight: item.label ? '5px' : null }"
              v-if="item.icon"
              :item="{ ...item, isBtn: true }"
          />
          {{ item.label }}</el-button
        >
      </el-tooltip>

      <!-- 原有的不带tooltip的按钮 -->
      <el-button
          v-else
          ref="buttonRef"
          :type="item.type"
          :size="item.size"
          :disabled="
        item.disabled ||
        (typeof item.disabled === 'function' ? item.disabled(row) : false)
      "
          :placeholder="item.placeholder"
          :link="
        item.link
          ? typeof item.link === 'boolean'
            ? item.link
          : item.link === 1 || item.link === '1'
              ? true
            : false
          : false
      "
          :circle="
        item.circle
          ? typeof item.circle === 'boolean'
            ? item.circle
          : item.circle === 1 || item.circle === '1'
              ? true
            : false
          : false
      "
          :style="{
        backgroundColor: item.buttonColor,
        borderColor: item.buttonColor,
        ...style,
        ...item.btnStyle,
      }"
          :loading="item.loading"
          @click="handleChange"
      >
        <!-- 将isBtn透传,防止出现icon方法重复执行  -->
        <rt-icon
            :style="{ marginRight: item.label ? '5px' : null }"
            v-if="item.icon"
            :item="{ ...item, isBtn: true }"
        />
        {{ item.label }}</el-button
      >
    </template>
  </template>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from "vue";
import request from "@/utils/request";
const props = defineProps({
  modelValue: {
    type: Object,
    required: false,
  },
  item: {
    type: Object as () => Record<string, any>,
    required: true,
  },
  parentFromUi: {
    type: Object as () => Record<string, any>,
    required: false,
  },
  style: {
    type: Object,
    required: false,
  },
  row: {
    // 新增属性，用于接收当前行的数据
    type: Object as () => Record<string, any>,
    required: false,
  },
  parentItem:{
    type: Object as () => Record<string, any>,
    required: false,
  }
});
// console.log(props.row, "props.row");
const disabled = ref(false);
const visible = ref(false);
function closepopover(value: any) {
  visible.value = false;
  if (value.type === "select") {
    emits("closepopover", value.data);
  }
  props.item.func ? props.item.func(value) : null;
}
const emits = defineEmits(["click", "closepopover"]); // 父组件监听事件，同步子组件值的变化给父组件
function handleChange() {
  emits("click");

  if (props.item?.label === "雇主反欺诈风险态势") {
    request
      .post("/jumpFraud/jumpEmployList", {})
      .then((res: any) => {
        if (res?.code === 200 && res?.data) {
          window.open(res.data, "_blank");
        } else {
          ElMessage.error(res?.msg || "雇主反欺诈风险态势查询失败");
        }
      })
      .catch((err: any) => {
        ElMessage.error(err?.message || "雇主反欺诈风险态势查询失败");
      });
    return;
  }

  // 将item和row传递给父组件,证明我是用哪个要素执行的func表格时，额外传递对应行数据，证明我是哪一行的按钮
  (props.item.func && typeof props.item.func === "function") ? props.item.func(props.parentItem,props.row) : null;
}

function getConfig() {
  return props.item
}
onBeforeMount(() => {
  if(!props.item) {
    console.warn('!!! props.item is undefined');
  }
})
defineExpose({
  getConfig
})
</script>
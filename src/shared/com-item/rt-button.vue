<template>
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
          :link="item.link ? item.link : false"
          :circle="item.circle ? item.circle : false"
          :style="{
            backgroundColor: item.buttonColor,
            borderColor: item.buttonColor,
            ...style,
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
    <el-button
      ref="buttonRef"
      :type="item.type"
      :size="item.size"
      :disabled="
        item.disabled ||
        (typeof item.disabled === 'function' ? item.disabled(row) : false)
      "
      :placeholder="item.placeholder"
      :link="item.link ? item.link : false"
      :circle="item.circle ? item.circle : false"
      :style="{
        backgroundColor: item.buttonColor,
        borderColor: item.buttonColor,
        ...style,
      }"
      @click="handleChange"
    >
      <!-- 将isBtn透传,防止出现icon方法重复执行  -->
      <rt-icon v-if="item.icon" :item="{ ...item, isBtn: true }" />
      {{ item.label }}</el-button
    >
  </template>
</template>

<script setup lang="ts">
const props = defineProps({
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
  props.item.func ? props.item.func() : null;
}
</script>

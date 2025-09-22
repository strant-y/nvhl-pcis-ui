<template>
  <el-select
    class="theme-select"
    v-model="currentColor"
    placeholder="主题"
    style="width: 100px"
    :disabled="props.modelValue === ThemeEnum.DARK"
  >
    <el-option
      v-for="item in colors"
      :key="item.value"
      :label="item.label"
      :value="item.value"

    >
      <div class="flex items-center">
        <el-tag :class="item.value" style="margin-right: 8px" size="small" />
        <span>{{ item.label }}</span>
      </div>
    </el-option>
    <template #tag>
      <el-tag v-for="color in value" :key="color" :color="color" />
    </template>
  </el-select>
</template>

<script lang="ts" setup>

import {ThemeEnum} from "@/enums/ThemeEnum";

const props = defineProps({
  modelValue: String,
});

const emit = defineEmits(["update:modelValue"]);


const currentColor = ref(props.modelValue === 'light' ? 'default':props.modelValue);

watch(currentColor, (newValue) => {
  emit("update:modelValue", newValue);
});

const colors = [
  {
    value: 'default',
    label: '默认',
  },
  {
    value: 'orange',
    label: '橙黄',
  },
  {
    value: 'green',
    label: '草绿',
  }
];
</script>

<style scoped>
.theme-select {
  border: none !important;
  box-shadow: none !important;
}
.el-tag {
  border: none;
  aspect-ratio: 1;
}

.default{
  background: #3a76c6;
  color: white;
}
.orange{
  /* background: #ff8c03; */
  background: #f57c10;
  color: white;
}
.green{
  background: #09d067;
  color: white;
}
</style>

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
    value: 'linen',
    label: '藏青',
  },
  {
    value: 'simple',
    label: '简约',
  },
  {
    value: 'graceful',
    label: '淡雅',
  },
  {
    value: 'sentimental',
    label: '青春',
  },
  {
    value: 'summer',
    label: '夏天',
  },
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
  background: linear-gradient(to right,  #f0f5f9, #FF8C00);
  color: white;
}
.sentimental{
  background: linear-gradient(to right,  #bad7df, #FFAAA6);
  color: white;
}
.simple{
  background: linear-gradient(to right,  #52616b, #c9d6df);
  color: white;
}
.linen{
  background: linear-gradient(to right,  #1d566e, #62929a);
  color: white;
}
.graceful{
  background: linear-gradient(to right,  #596e79, #c7b198);
  color: white;
}
.summer{
  background: linear-gradient(to right,  #40bfc1, #ff6f5e);
  color: white;
}
</style>

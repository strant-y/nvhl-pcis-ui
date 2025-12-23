<!-- 配置 -->
<template>
  <el-dialog v-model="dialogVisible" width="75%" title="请选择续保复用信息">
    <div>
      <el-radio-group v-model="reuseType">
        <el-radio value="1">全量复用</el-radio>
        <el-radio value="2">部分复用</el-radio>
      </el-radio-group>
    </div>
    <div>
      <el-checkbox-group
        v-model="selectedValue"
        :disabled="reuseType === '1'"
      >
        <el-checkbox
            v-for="option in props.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
            :disabled=isOptionDisabled(option.value)
        />
      </el-checkbox-group>
    </div>
    <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
      <rt-button
        :item="{
          label: '取消',
          func: () => {
            canceled()
          },
        }"
      />
      <rt-button
          :item="{
          type: 'primary',
          label: '确认',
          func: () => {
            confirm();
          },
        }"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { ref } from "vue";
const emits = defineEmits(["ok", "cancel"]);
const dialogVisible = ref(true);
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  options: {
    type: Array,
    required: true,
  },
  selected: {
    type: Array,
    required: true,
  },
  cPlyNo: {
    type: String,
    required: true,
  }
});

const reuseType = ref('1')
const selectedValue:any = ref([])

onMounted(() => {
  selectedValue.value = props.selected
});
// 需要禁用的选项列表
const disabledOptions = ['plyBase', 'AgreementBase'];

// 检查选项是否应该被禁用
const isOptionDisabled = (value: string) => {
  return disabledOptions.includes(value);
};

function canceled() {
  dialogVisible.value = false
  emits('cancel')
}

function confirm() {
  if(selectedValue.value.length > 0) {
    const component:any = {}
    selectedValue.value.forEach((item:any) => {
      component[item] = props.options.find((i:any) => i.value === item)?.label
    })
    emits('ok', { component })
    dialogVisible.value = false
  } else {
    ElMessage.warning("请选择要复用的信息！")
  }
}
</script>

<style lang="scss" scoped>
</style>

<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
</template>

<script setup lang="ts">
import { title } from 'process';
import { defineComponent, ref, reactive, onMounted } from 'vue';
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

const someProp = defineProps({
  someProp: {
    type: String,
    required: false
  },
})
const reviewOptions = ref([
  {
    label: '通过',
    value: '1'
  },
  {
    label: '驳回',
    value: '0'
  }
]) //责任
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    title: "审核信息",
    fromUi: {
      cols: 1
    },
    fromSchema: [
      {
        prop: "status",
        inputtype: "rtselect",
        title: "审核意见",
        loadData: reviewOptions,
        clearable: true,
        rules: [getRules("required", {})],
      },
      {
        prop: "remark",
        inputtype: "rtinput",
        type: "textarea",
        rows: 4,
        title: "说明",
        clearable: true,
      },
    ],
  })
);

onMounted(() => {
  
});

</script>

<style scoped lang="scss"></style>

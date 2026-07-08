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
    value: '2'
  },
  {
    label: '驳回',
    value: '0'
  }
]) //责任
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    title: "审核信息",
    fromUi: {
      cols: 1
    },
    fromSchema: [
      {
        prop: "cUndrStatus",
        inputtype: "rtselect",
        title: "审核意见",
        loadData: reviewOptions,
        clearable: true,
        rules: [getRules("required", {})],
      },
      {
        prop: "cUndrDesc",
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
function getFromValue() {
    return freeEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
    freeEditRef?.value?.setFormValue(value);
}

function validate() {
    return freeEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
    freeEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
    return freeEditRef?.value?.getValue(key);
}
function setDisabledAll(isDisabled: boolean = true) {
    freeEditRef?.value?.setDisabledAll(isDisabled);
}
defineExpose({
    getFromValue,
    setFormValue,
    validate,
    setValue,
    getValue,
    setDisabledAll,
});
</script>

<style scoped lang="scss"></style>

<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="baseEditRef" />
  <comDialog ref="dialogRef"></comDialog>
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
const opertaor = dataOpertaor();
const dialogRef = ref<DialogMethod | null>(null);
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const baseEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));
const sessionData = ref()
const fixSpecData = ref([]) //存储已选择的特别约定数据

onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
  nextTick(() => {
    setValue('Base.cJuriCde', '本保单受中华人民共和国司法管辖（港、澳、台除外）')
  })
  if(sessionStorage.getItem('toMyPageData')) {
    sessionData.value = JSON.parse(sessionStorage.getItem('toMyPageData'))
  }
});

// 绑定方法
const method = {
  // func demo
  func1: () => {
    console.log(getRules);
  },
  // 特别约定ICON事件
  selectCUnfixSpc: () => {
    dialogRef.value?.open(
        "prdFixSpec",
        {
            type: "show",
            data: {
              cProdNo: sessionData.value?.cProdNo,
              fixSpecData: fixSpecData.value //之前选中的数据数组
            },
            method: {
              getSelected: (params) => {
                if(params && params.length) {
                  fixSpecData.value = params
                  let i = 1;
                  // let cSpecNo = '';
                  let cUnfixSpc = '';
                  params.forEach(value => {
                      // cSpecNo = '' === cSpecNo ? value['PrdFixSpec.CSpecNo'] : cSpecNo + '$$' + value['PrdFixSpec.CSpecNo'];
                      cUnfixSpc = '' === cUnfixSpc ? i + '.' + value['PrdFixSpec.CNmeCn'] : cUnfixSpc + '\n' + i + '.' + value['PrdFixSpec.CNmeCn'];
                      setValue('Base.cUnfixSpc', cUnfixSpc)
                      i++;
                  });
                }
                dialogRef.value?.handleClose()
              }
            },
        },
        {
            isOk: (selectdata: any) => {
                console.log('a',selectdata)
            },
        },
        { title: "特别约定", width: 85 }
    );
  }
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return baseEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  baseEditRef?.value?.setFormValue(value);
}

function validate() {
  return baseEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  baseEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return baseEditRef?.value?.getValue(key);
}

//给表单下拉项赋值
function setFormItem(key, obj) {
    if (obj && Object.keys(obj).length) {
        formconfig1.fromSchema?.forEach(item => {
            if (item.prop === key) {
                Object.assign(item, obj)
            }
        })
    }
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>

<style scoped></style>

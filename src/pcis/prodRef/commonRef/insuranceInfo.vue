<template>
  <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";
import { saveProdInfo } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useRoute } from "vue-router";
import { descryptParameter, encryptParameter } from "@/utils/encipher";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);

const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}");

const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "险别基本信息",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "保存",
        func: async () => {
          const s = freeEditRef.value?.getFromValue(); //获取表单数据
          saveProdInfo(s)
            .then((res) => {
              const { code, data, msg } = res;
              if (200 === code) {
                ElMessage.success("保存成功");
              } else {
                ElMessage.error(msg);
              }
            })
            .finally(() => {});
        },
      }),
      createFreeButtonBase({
        label: "返回",
        func: () => {},
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtinput",
        title: "险别代码",
        rules: [getRules("required", {})],
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "产品大类编码",
        rules: [getRules("required", {})],
        loaddata: [
          {
            label: "意外险",
            value: "1",
            // type: "success",
          },
          {
            label: "医疗险",
            value: "2",
            // type: "info",
          },
        ],
        // loadData: opertaor.getProdKindList(),
      },
      {
        prop: "cProdNme",
        inputtype: "rtinput",
        title: "中文名称",
        rules: [getRules("required", {})],
      },
      {
        prop: "cProdNme",
        inputtype: "rtinput",
        title: "英文名称",
        rules: [getRules("required", {})],
      },
      {
        prop: "cProdNme",
        inputtype: "rtinput",
        title: "险别显示码",
        rules: [getRules("required", {})],
      },
      {
        prop: "cProdNme",
        inputtype: "rtselect",
        title: "主险/附加险",
        rules: [getRules("required", {})],
        loadData: [
          {
            label: "主险",
            value: "1",
          },
          {
            label: "附加险",
            value: "2",
          },
        ],
      },
      {
        prop: "cProdNme",
        inputtype: "rtselect",
        title: "是否计入总保额",
        loadData: [
          {
            label: "是",
            value: "1",
          },
          {
            label: "否",
            value: "2",
          },
        ],
      },
      {
        prop: "cProdNme",
        inputtype: "rtselect",
        title: "是否免税",
        loadData: [
          {
            label: "是",
            value: "1",
          },
          {
            label: "否",
            value: "2",
          },
        ],
      },
      {
        prop: "cProdNme",
        inputtype: "rtselect",
        title: "健康险意外险类型",
        loadData: [
          {
            label: "是",
            value: "1",
          },
          {
            label: "否",
            value: "2",
          },
        ],
      },
      {
        prop: "cProdNme",
        inputtype: "rtselect",
        title: "意健险13大类",
        loadData: [
          {
            label: "是",
            value: "1",
          },
          {
            label: "否",
            value: "2",
          },
        ],
      },
      {
        prop: "cProdNme",
        inputtype: "rtselect",
        title: "启用标志",
        loadData: [
          {
            label: "是",
            value: "1",
          },
          {
            label: "否",
            value: "2",
          },
        ],
      },
      {
        prop: "cProdNme",
        inputtype: "rtselect",
        title: "险别用途",
        loadData: [
          {
            label: "是",
            value: "1",
          },
          {
            label: "否",
            value: "2",
          },
        ],
      },
      {
        prop: "cProdNme",
        inputtype: "rtinput",
        type: "textarea",
        title: "险别描述",
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);

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

function setDisa() {
  formconfig1.fromSchema?.forEach((e) => {
    if (e.prop === "cProdNo" || e.prop === "cKindNo") {
      e.disabled = true;
    }
  });
}

onMounted(() => {
  if (param.editType === "edit") {
    setDisa();
  }
});

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>

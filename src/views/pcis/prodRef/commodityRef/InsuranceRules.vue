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
import { saveProInfo } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
import { useDzModal } from "@/views/dzmodel/DzModalService";
const dzmodal = useDzModal();
import { useRoute } from "vue-router";
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");

const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "投保规则",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "保存",
        func: async () => {
          const s = freeEditRef.value?.getFromValue(); //获取表单数据
          saveProInfo(s)
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
        prop: "NMaxPieces",
        inputtype: "rtinput",
        title: "份数上限（含）",
        rules: [getRules("required", {})],
      },
      {
        prop: "NMinAge",
        inputtype: "rtinput",
        title: "被保人年龄下限（含）",
        rules: [getRules("required", {})],
      },
      {
        prop: "NDispOrd",
        inputtype: "rtinput",
        title: "被保人年龄上限（含）",
      },
      {
        prop: "CSex",
        inputtype: "rtselect",
        title: "被保人性别",
        // codeType: "Sex_List",
        // params: "",
        loadData: [
          { label: "男", value: "男" },
          { label: "女", value: "女" },
        ],
      },
      {
        prop: "CSocialSec",
        inputtype: "rtinput",
        title: "被保人是否有社保",
      },
      {
        prop: "NAppMinAge",
        inputtype: "rtinput",
        title: "投保人年龄下限（含）",
      },
      {
        prop: "NAppMaxAge",
        inputtype: "rtinput",
        title: "投保人年龄上限（含）",
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

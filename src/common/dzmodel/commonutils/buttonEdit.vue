<template>
  <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";

const { getRules } = useValidator();
import { ref, defineProps } from "vue";
const emits = defineEmits(["handleClose"]);

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
});

const dialogVisible = ref(true);

import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { yesOrNo, size, inputtype, freeCol, typeMap } from "@/utils/utilKey";
import { createFreeButtonBase } from "@/shared/button-config";

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "按钮配置",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "确定",
        func: () => {
          save();
        },
      }),
      createFreeButtonBase({
        type: "danger",
        label: "删除",
        func: () => {
          deleteBtn();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "id",
        inputtype: "rtinput",
        title: "按钮ID",
      },
      {
        prop: "label",
        inputtype: "rtinput",
        title: "按钮内容",
      },
      {
        prop: "size",
        inputtype: "rtselect",
        title: "按钮尺寸",
        loadData: size,
      },
      {
        prop: "type",
        inputtype: "rtselect",
        title: "按钮类型",
        clearable: true,
        loadData: typeMap.rttag,
      },
      {
        prop: "func",
        inputtype: "rtinput",
        title: "绑定方法名",
      },
      {
        prop: "tableClick",
        inputtype: "rtinput",
        title: "table层事件绑定",
      },
      {
        prop: "icon",
        inputtype: "rtinput",
        title: "按钮图标",
        showExBtn: true,
        btnWidth: 20,
        btnItems: createFreeButtonBase({
          icon: "Paperclip",
          popover: "selectIconPopover",
          popoverWidth: 500,
          position: "bottom-end",
        }),
      },
      {
        prop: "link",
        inputtype: "rtselect",
        title: "是否链接按钮",
        loadData: yesOrNo,
      },
      {
        prop: "tooltip",
        inputtype: "rtinput",
        title: "悬浮文字提示",
      },
      {
        prop: "iconSize",
        inputtype: "rtinput",
        title: "图标尺寸",
      },
      {
        prop: "buttonColor",
        inputtype: "rtinput",
        type: "color",
        title: "按钮自定义底色",
      },
      {
        prop: "iconColor",
        inputtype: "rtinput",
        type: "color",
        title: "按钮图标自定义底色",
      },
    ],
  })
);

onMounted(async () => {
  console.log(props.data);
  setTimeout(() => {
    freeEditRef.value?.setFormValue(props.data.data);
  }, 30);
});

/** 保存 */
function save() {
  props.method.isOk( { type: "success", data: freeEditRef.value?.getFromValue() });
  emits("handleClose");
}
function deleteBtn() {
  props.method.isOk( { type: "delete" });
  emits("handleClose");
}
</script>

<style scoped></style>

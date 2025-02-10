<template>
  <el-row>
    <el-col :span="12">
      <app-free-edit v-if="isFree1" v-model:freeEditConfig="freeconfig1" />
      <app-grid-edit v-else v-model:gridEditConfig="gridconfig1" />
    </el-col>
    <el-col :span="12">
      <app-free-edit v-if="isFree2" v-model:freeEditConfig="freeconfig2" />
      <app-grid-edit v-else v-model:gridEditConfig="gridconfig2" />
    </el-col>
  </el-row>
  
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";

const { getRules } = useValidator();
import { ref, defineProps } from "vue";
const emits = defineEmits(["handleClose"]);
const isFree1 = ref(true);
const isFree2 = ref(true);
const showMsg = ref('组件预览');
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  method:{
    type: Object,
    default: () => ({})
  }
});
const fromref = ref<FormInstance>();
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { AppGridEditConfig, createAppGridEditConfig, createGridFromUiConfig } from "@/shared/app-grid-edit-config";
import { FormInstance, FormRules } from "element-plus";
import { copyComponent } from "@/api/prod";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const freeconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "组件预览",
    endBtnsPosition: "right",
    fromSchema: [
    ],
  })
);
const freeconfig2 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "组件预览",
    endBtnsPosition: "right",
    fromSchema: [
    ],
  })
);
const gridconfig1 = reactive<AppGridEditConfig>(
  createAppGridEditConfig({
    title: "组件预览",
    tableBtnPosition: "left",
    titleBtns: [],
    endBtns: [],
    tableBtn: [],
    fromSchema: [],
  })
);
const gridconfig2 = reactive<AppGridEditConfig>(
  createAppGridEditConfig({
    title: "组件预览",
    tableBtnPosition: "left",
    titleBtns: [],
    endBtns: [],
    tableBtn: [],
    fromSchema: [],
  })
);

// 绑定方法
const method = {};

// 绑定特殊验证器
const exRules = {};

onMounted(async () => {
  const formconfig = formInit(
    JSON.stringify(JSON.parse(props.data.data)),
    method,
    exRules
  );
  let i = 0;
  for(var k in formconfig){
    i++;
    const fconfig = JSON.parse(formconfig[k]);
    if(i === 1){
      if(fconfig.ifFree === 'free'){
        isFree1.value = true;
        Object.assign(freeconfig1, fconfig);
      }else{
        isFree1.value = false;
        Object.assign(gridconfig1, fconfig);
      }
    }
    if(i === 2){
      if(fconfig.ifFree === 'free'){
        isFree2.value = true;
        Object.assign(freeconfig2, fconfig);
      }else{
        isFree2.value = false;
        Object.assign(gridconfig2, fconfig);
      }
    }
  }
});

function fail(){
  emits("handleClose");
}

</script>

<style scoped>
.container {
  width: 300px; /* 设置固定宽度 */
  height: 250px; /* 设置固定高度 */
  overflow-y: auto; /* 开启垂直滚动条 */
}
.drag-container {
  height: 100%; /* 让列表填充整个容器高度 */
}
.list-item {
  border: 1px solid #ccc; /* 设置列表项边框 */
  padding: 10px; /* 设置列表项内边距 */
  margin-top: 5px; /* 设置列表项间的间隔 */
  background-color: #fff; /* 设置列表项背景色 */
  cursor: move; /* 设置移动指针样式 */
}
</style>

<template>
  <div>
    <app-free-edit v-if="isFree" v-model:freeEditConfig="freeconfig1" />
    <app-grid-edit v-else v-model:gridEditConfig="gridconfig1" />
    <div style="margin-top: 12px;" v-if="isCopy">
      <el-form :model="newCom" label-width="120px" :rules="rules" ref="fromref">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-text class="mx-1" size="large" type="primary">是否继续按照以上组件预览继续复制?</el-text>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="新组件主键" prop="newComponentKey">
              <el-input v-model="newCom.newComponentKey" placeholder="请输入新组件主键" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="1">
          </el-col>
          <el-col :span="4">
            <el-button @click="copy" type="primary">复制</el-button>
            <el-button @click="fail">取消</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";

const { getRules } = useValidator();
import { ref, defineProps } from "vue";
const emits = defineEmits(["handleClose"]);
const isFree = ref(true);
const isCopy = ref(false);
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
const newCom = reactive({
  newComponentKey: '',
})
const rules = reactive<FormRules>({
  newComponentKey: [
    { required: true, trigger: 'change', message: "请输入新组件主键" },
],
});
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
  let config = {};
  for(var k in formconfig){
    config = formconfig[k];
  }
  const fconfig = JSON.parse(config);
  if(fconfig.ifFree === 'free'){
    isFree.value = true;
    Object.assign(freeconfig1, fconfig);
  }else{
    isFree.value = false;
    Object.assign(gridconfig1, fconfig);
  }
  if(props.data.type === 'copy'){
    isCopy.value = true;
    showMsg.value = '复制组件';
  }else{
    isCopy.value = false;
    showMsg.value = '组件预览';
  }
});

async function copy(){
  await fromref.value?.validate((valid, fields) => {
    if (valid) {
      console.log("submit!");
      const param = {
        oldComponentKey: props.data.conKey,
        newComponentKey: newCom.newComponentKey,
      };
      copyComponent(param).then((res: any) => {
        if (res.code === 200 ) {
          ElMessage.success("复制成功!");
          props.method.isOk();
          emits("handleClose");
        }else{
          ElMessage.error(res.msg);
        }
      });
    } else {
      console.log("error submit!", fields);
    }
  });
}

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

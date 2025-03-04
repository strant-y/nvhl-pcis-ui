<template>
  <div>
    <div style="margin-bottom: 12px">
      <el-form :model="newCom" label-width="120px" :rules="rules" ref="fromref">
        <el-row :gutter="20">
          <el-col :span="10"> </el-col>
          <el-col :span="14">
            <el-text class="mx-1" size="large" type="primary"
              >请录入新的产品编码并继续复制!</el-text
            >
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="20"> </el-col>
          <el-col :span="4">
            <el-button @click="copy" type="primary">复制</el-button>
            <el-button @click="fail">取消</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <prodInfo ref="prodInfoRef"></prodInfo>
    <prodComponent ref="compoentRef"></prodComponent>
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import prodInfo from "@/pcis/prodRef/commonRef/prodInfo.vue";
import prodComponent from "@/pcis/prodRef/commonRef/prodComponent.vue";

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
const fromref = ref<FormInstance>();
const prodInfoRef = ref("prodInfoRef");
const compoentRef = ref("compoentRef");
// const rules = reactive<FormRules>({
//   newComponentKey: [
//     { required: true, trigger: 'change', message: "请输入新组件主键" },
// ],
// });
import { formInit } from "@/shared/from-init";
import { FormInstance, FormRules } from "element-plus";
import { copyComponent, copyProInfo, getProdInfos } from "@/api/prod";

// 绑定方法
const method = {};

// 绑定特殊验证器
const exRules = {};

onMounted(async () => {
  nextTick(() => {
    prodInfoRef.value.copyInitProdNo(props.data.prodNo);
    getProdInfos({ prodNo: props.data.prodNo })
      .then((res) => {
        const { code, data, msg } = res;
        if (200 === code) {
          console.log(data);
          for (const k in data) {
            if (k === "prodComponent") {
              compoentRef.value.copyInitProdNo(data[k]);
            }
          }
        } else {
          ElMessage.error(msg);
        }
      })
      .finally(() => {});
    // compoentRef.value.setFormValue(props.data.prodNo);
  });
});

async function copy() {
  const info = prodInfoRef.value?.getFromValue(); //获取表单数据
  const coms = compoentRef.value?.getFromValue(); //获取表单数据
  prodInfoRef.value?.validate().then((res) => {
    if (!res) {
      return;
    }
    copyProInfo({ info: info, coms: coms })
      .then((res) => {
        const { code, data, msg } = res;
        if (200 === code) {
          ElMessage.success("复制成功");
          setTimeout(() => {
            emits("handleClose");
          }, 500);
        } else {
          ElMessage.error(msg);
        }
      })
      .finally(() => {});
  });

  // await fromref.value?.validate((valid, fields) => {
  //   if (valid) {
  //     console.log("submit!");
  //     const param = {
  //       oldComponentKey: props.data.conKey,
  //       newComponentKey: newCom.newComponentKey,
  //     };
  //     copyComponent(param).then((res: any) => {
  //       if (res.code === 200 ) {
  //         ElMessage.success("复制成功!");
  //         props.method.isOk();
  //         emits("handleClose");
  //       }else{
  //         ElMessage.error(res.msg);
  //       }
  //     });
  //   } else {
  //     console.log("error submit!", fields);
  //   }
  // });
}

function fail() {
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

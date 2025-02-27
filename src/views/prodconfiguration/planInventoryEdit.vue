<template>
  <el-dialog
    v-model="dialogVisible"
    title=""
    width="80%"
    @update:model-value="handleVisibleUpdate"
  >
    <app-free-edit v-model:freeEditConfig="formconfig" ref="freeEditRef" />
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleSave">确定</el-button>
        <el-button @click="handleCancel">返回</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { ref, reactive } from "vue";
import { savePrdTermInfo } from "@/api/prod"; // api接口

const props = defineProps<{
  visible: boolean;
}>();
const dialogVisible = ref(true);

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "联共保清单信息",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "CKindNo",
        inputtype: "rtinput",
        title: "方案编号",
      },
      {
        prop: "CCvrgTyp",
        inputtype: "rtinput",
        title: "序号",
      },
      {
        prop: "CTermNo",
        inputtype: "rtinput",
        title: "出单机构",
      },
      {
        prop: "CNmeCn",
        inputtype: "rtinput",
        title: "代理(经纪)人代码",
      },
      {
        prop: "CNmeEn",
        inputtype: "rtinput",
        title: "代理(经纪)人名称",
      },
      {
        prop: "CFilingNo",
        inputtype: "rtinput",
        title: "代理协议号",
      },
      {
        prop: "CRegisteredNo",
        inputtype: "rtinput",
        title: "代理业务员代码",
      },
      {
        prop: "CIsInternet",
        inputtype: "rtinput",
        title: "代理业务员名称",
      },
      {
        prop: "TFilingTm",
        inputtype: "rtinput",
        title: "业务员代码",
      },
      {
        prop: "TFeedbackTm",
        inputtype: "rtselect",
        title: "状态",
      },
      {
        prop: "NFeeUpper",
        inputtype: "rtinput",
        title: "备用字段2",
      },
      {
        prop: "NFeeUpper",
        inputtype: "rtinput",
        title: "备用字段3",
      },
      {
        prop: "NFeeUpper",
        inputtype: "rtinput",
        title: "备用字段4",
      },
      {
        prop: "NFeeUpper",
        inputtype: "rtinput",
        title: "备用字段5",
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);

const handleSave = async () => {
  const formData = freeEditRef.value?.getFromValue();
  if (formData) {
    try {
      await savePrdTermInfo(formData); // 调用保存接口
      ElMessage.success("保存成功");
      dialogVisible.value = false;
    } catch (error) {
      ElMessage.error("保存失败");
    }
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
};
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

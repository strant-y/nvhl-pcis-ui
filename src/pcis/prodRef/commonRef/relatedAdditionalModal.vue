<template>
  <el-dialog
    :model-value="visible"
    title=""
    width="80%"
    @update:model-value="handleVisibleUpdate"
  >
    <app-free-edit v-model:freeEditConfig="formconfig" ref="freeEditRef" />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
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

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "save"): void;
}>();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "关联条款",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "riskClassCode",
        inputtype: "rtselect",
        title: "条款代码",
        row: 3,
      },
      {
        prop: "mainSubFlag",
        inputtype: "rtselect",
        title: "承保机构",
        row: 3,
        loadData: [
          {
            label: "主险",
            value: "1",
          },
          {
            label: "附险",
            value: "2",
          },
        ],
      },
      {
        prop: "clauseCode",
        inputtype: "rtinput",
        title: "产品代码",
      },
      {
        prop: "clauseName",
        inputtype: "rtdatepicker",
        title: "有效起期",
      },
      {
        prop: "englishName",
        inputtype: "rtdatepicker",
        title: "有效期止",
      },
      {
        prop: "recordNumber",
        inputtype: "rtinput",
        title: "备案号",
      },
      {
        prop: "enableFlag",
        inputtype: "rtselect",
        title: "团个单标识",
        loadData: [
          {
            label: "启用",
            value: "1",
          },
          {
            label: "禁用",
            value: "0",
          },
        ],
      },
      {
        prop: "internetFlag",
        inputtype: "rtselect",
        title: "有效状态",
        loadData: [
          {
            label: "有效",
            value: "1",
          },
          {
            label: "无效",
            value: "0",
          },
        ],
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
      //   await saveTerm(formData); // 调用保存接口
      ElMessage.success("保存成功");
      emit("save");
      handleVisibleUpdate(false);
    } catch (error) {
      ElMessage.error("保存失败");
    }
  }
};

const handleCancel = () => {
  handleVisibleUpdate(false);
};

const handleVisibleUpdate = (value: boolean) => {
  emit("update:visible", value);
};
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

<template>
  <el-dialog
    v-model="dialogVisible"
    title=""
    width="70%"
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
import { ElMessage, rowContextKey } from "element-plus";
import { saveHealthNotify } from "@/api/prod";

const props = defineProps<{
  visible: boolean;
}>();
const dialogVisible = ref(true);
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save"): void;
}>();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "公共问题新增",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "cAsk",
        inputtype: "rtinput",
        type: "textarea",
        title: "问题",
        row: 4,
      },
      {
        prop: "cQuestion",
        inputtype: "rtinput",
        type: "textarea",
        title: "答案",
        row: 4,
      },
    ],
    fromUi: createFromUiConfig({
      cols: 1,
    }),
  })
);

const handleSave = async () => {
  const formData = freeEditRef.value?.getFromValue();
  if (formData) {
    try {
      await saveHealthNotify(formData); //保存接口调用
      ElMessage.success("保存成功");
      emit("save");
      dialogVisible.value = false;
    } catch (error) {
      ElMessage.error("保存失败");
    }
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
};

const handleVisibleUpdate = (value: boolean) => {
  emit("update:visible", value);
};
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

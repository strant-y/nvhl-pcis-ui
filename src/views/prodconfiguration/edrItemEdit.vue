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
        <el-button type="primary" @click="handleSave">保存</el-button>
        <el-button @click="handleCancel">取消</el-button>
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
const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "save"): void;
}>();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "配置批改项",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "CKindNo",
        inputtype: "rtselect",
        title: "产品大类",
      },
      {
        prop: "CCvrgTyp",
        inputtype: "rtinput",
        title: "批改原因编号",
      },
      {
        prop: "CTermNo",
        inputtype: "rtinput",
        title: "批改原因名称",
      },
      {
        prop: "CNmeCn",
        inputtype: "rtselect",
        title: "批改原因类别",
      },
      {
        prop: "CNmeEn",
        inputtype: "rtselect",
        title: "是否计算保费",
      },
      {
        prop: "CFilingNo",
        inputtype: "rtselect",
        title: "是否团单",
      },
      {
        prop: "CRegisteredNo",
        inputtype: "rtselect",
        title: "是否个单",
      },
      {
        prop: "CEnableFlag",
        inputtype: "rtselect",
        title: "启用标志",
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
        prop: "CDesc",
        inputtype: "rtinput",
        type: "textarea",
        btnWidth: 20,
        itemWidth: 3,
        rows: 4,
        title: "批文模板",
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
      emit("save");
      handleVisibleUpdate(false);
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

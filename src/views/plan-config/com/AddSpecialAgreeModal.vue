<!-- 新增特约弹窗（方案配置专用）- 确定时调用 saveAssociationPlanSpec 接口新增并绑定方案特约 -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="新增特约"
    width="80%"
    @update:model-value="handleVisibleUpdate"
  >
    <app-free-edit v-model:freeEditConfig="formconfig" ref="freeEditRef" />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleConfirm">确定</el-button>
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
import { ElMessage } from "element-plus";
import { useValidator } from "@/typings/useValidator";
import { saveAssociationPlanSpec } from "@/api/prod";

const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);

const props = defineProps<{
  data: {
    cProdNo: string;
    cPlanNo: string;
  };
}>();

const dialogVisible = ref(true);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const submitLoading = ref(false);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "新增特约",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "cSpecNo",
        inputtype: "rtinput",
        title: "特约代码",
        disabled: true,
      },
      {
        prop: "cNmeEn",
        inputtype: "rtinput",
        title: "英文名称",
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "启用标识",
        rules: [getRules("required", { change: "启用标识不能为空" })],
        loadData: [
          {
            label: "是",
            value: "1",
          },
          {
            label: "否",
            value: "0",
          },
        ],
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        type: "textarea",
        title: "特约内容",
        itemWidth: 3,
        rows: 4,
        rules: [
          {
            required: true,
            message: "请输入特约内容",
            trigger: "blur",
          },
        ],
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);

/** 确定 - 调用 saveAssociationPlanSpec 接口新增并绑定方案特约，成功后通知父组件刷新列表 */
const handleConfirm = async () => {
  const formData = freeEditRef.value?.getFromValue();
  if (!formData?.cNmeCn) {
    ElMessage.error("请输入特约内容");
    return;
  }

  if (!props.data?.cPlanNo) {
    ElMessage.error("方案编号为空，无法新增特约");
    return;
  }

  const param = {
    CProdNo: props.data?.cProdNo || "",
    CPlanNo: props.data.cPlanNo,
    CNmeCn: formData.cNmeCn,
    CNmeEn: formData?.cNmeEn || "",
    CStatus: formData?.cStatus || "",
  };

  submitLoading.value = true;
  try {
    const res = await saveAssociationPlanSpec(param);
    const { code, msg } = res;
    if (200 === code) {
      ElMessage.success("新增特约成功");
      emits("ok", {});
      dialogVisible.value = false;
    } else {
      ElMessage.error(msg || "新增特约失败");
    }
  } catch (e) {
    ElMessage.error("新增特约失败");
  } finally {
    submitLoading.value = false;
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
};

function handleVisibleUpdate(val: boolean) {
  if (!val) {
    emits("cancel", {});
  }
}
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

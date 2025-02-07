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
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
import { saveProdEdrRsnInfo } from "@/api/prod"; // api接口

const props = defineProps<{
  data: Object;
  type: String;
}>();
const dialogVisible = ref(true);
const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "save"): void;
}>();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "增加批改原因",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "CKindNo",
        inputtype: "rtselect",
        title: "产品大类",
      },
      {
        prop: "cRsnCde",
        inputtype: "rtinput",
        title: "批改原因编号",
      },
      {
        prop: "cRsnNme",
        inputtype: "rtinput",
        title: "批改原因名称",
      },
      {
        prop: "cRsnTyp",
        inputtype: "rtselect",
        title: "批改原因类别",
      },
      {
        prop: "cNmeEn",
        inputtype: "rtselect",
        title: "是否计算保费",
      },
      {
        prop: "cFilingNo",
        inputtype: "rtselect",
        title: "是否团单",
      },
      {
        prop: "cRegisteredNo",
        inputtype: "rtselect",
        title: "是否个单",
      },
      {
        prop: "cEnableFlag",
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
        prop: "cDesc",
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
  const param = Object.assign({ type: props.type }, formParam);
  if (formData) {
    try {
      await saveProdEdrRsnInfo(param); // 调用保存接口
      ElMessage.success("保存成功");
      dialogVisible.value = false;
    } catch (error) {
      ElMessage.error("保存失败");
    }
  }
};
onMounted(async () => {
  if (props.type === "edit" && props.data) {
    setTimeout(() => {
      freeEditRef.value?.setFormValue(props.data);
    }, 50);
  }
});
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

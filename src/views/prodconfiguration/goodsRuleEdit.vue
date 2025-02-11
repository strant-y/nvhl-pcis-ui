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
// import { ElMessage } from "element-plus";
import { savePrdTermInfo, initMultiCodeList } from "@/api/prod"; // api接口

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
    title: "业务规则配置",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "CDptCde",
        inputtype: "rtinput",
        title: "机构代码",
        typeCode: "PLYDPT_LIST_1",
        params: { cIsValid: "1", userOrg: "0200000000000" },
      },
      {
        prop: "CRuleTyp",
        inputtype: "rtcheckbox",
        title: "是否临时规则",
      },
      {
        prop: "CPrd",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "KIND_LIST_CACHE",
        params: { codeListParam: "" },
        child: "CProdNo",
      },
      {
        prop: "CProdNo",
        inputtype: "rtselect",
        title: "产品",
        typeCode: "PROD_LIST",
        params: { cParCde: "" },
      },
      {
        prop: "CRuleCde",
        inputtype: "rtinput",
        title: "规则名称",
      },
      {
        prop: "CRuleValue",
        inputtype: "rtinput",
        title: "规则值",
      },
      {
        prop: "TStaTm",
        inputtype: "rtdatepicker",
        title: "规则生效起期",
      },
      {
        prop: "TEndTm",
        inputtype: "rtdatepicker",
        title: "规则生效止期",
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

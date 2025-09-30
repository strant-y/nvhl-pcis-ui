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
import { excelsave } from "@/api/prod"; // api接口

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
    title: "模板配置信息",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "CProdNo",
        inputtype: "rtselect",
        title: "产品代码",
        typeCode: "NVHL_PROD_LIST_CACHE",
        // codeParam: { cParCde: "" },
      },
      {
        prop: "NSeqNo",
        inputtype: "rtinput",
        title: "序号",
      },
      {
        prop: "CName",
        inputtype: "rtinput",
        title: "列代码",
      },
      {
        prop: "CLabel",
        inputtype: "rtinput",
        title: "列标题",
      },
      {
        prop: "CType",
        inputtype: "rtselect",
        title: "字段类型",
      },
      {
        prop: "CCode",
        inputtype: "rtinput",
        title: "数据字典key",
      },
      {
        prop: "CParam",
        inputtype: "rtinput",
        title: "参数",
      },
      {
        prop: "CVoClass",
        inputtype: "rtselect",
        title: "VO实例类全类型",
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
        prop: "CDtoClass",
        inputtype: "rtselect",
        title: "DTO实例类全类",
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
        prop: "CValidator",
        inputtype: "rtselect",
        title: "验证器",
        // btnWidth: 20,
        itemWidth: 2,
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
        prop: "CIsReplace",
        inputtype: "rtselect",
        title: "替换列标志",
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
      await excelsave(formData); // 调用保存接口
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

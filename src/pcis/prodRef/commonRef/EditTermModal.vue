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
import { saveCvrgRelTerm } from "@/api/prod"; // api接口

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
    title: "关联条款",
    endBtnsPosition: "right",
    fromSchema: [
      // {
      //   prop: "cKindNo",
      //   inputtype: "rtinput",
      //   title: "险类代码",
      // },
      // {
      //   prop: "cCvrgTyp",
      //   inputtype: "rtselect",
      //   title: "主附险标识",
      //   loadData: [
      //     {
      //       label: "主险",
      //       value: "1",
      //     },
      //     {
      //       label: "附加险",
      //       value: "2",
      //     },
      //   ],
      // },
      {
        prop: "cTermNo",
        inputtype: "rtinput",
        title: "条款代码",
      },
      // {
      //   prop: "cNmeCn",
      //   inputtype: "rtinput",
      //   title: "条款名称",
      //   rules: [
      //     {
      //       required: true,
      //       message: "请输入条款名称",
      //       trigger: "blur",
      //     },
      //   ],
      // },
      // {
      //   prop: "cNmeEn",
      //   inputtype: "rtinput",
      //   title: "英文名称",
      // },
      // {
      //   prop: "cFilingNo",
      //   inputtype: "rtinput",
      //   title: "备案号",
      // },
      // {
      //   prop: "cRegisteredNo",
      //   inputtype: "rtinput",
      //   title: "注册号",
      // },
      // {
      //   prop: "cEnableFlag",
      //   inputtype: "rtselect",
      //   title: "启用标志",
      //   loadData: [
      //     {
      //       label: "启用",
      //       value: "1",
      //     },
      //     {
      //       label: "禁用",
      //       value: "0",
      //     },
      //   ],
      // },
      // {
      //   prop: "cIsInternet",
      //   inputtype: "rtselect",
      //   title: "是否互联网",
      //   loadData: [
      //     {
      //       label: "是",
      //       value: "1",
      //     },
      //     {
      //       label: "否",
      //       value: "0",
      //     },
      //   ],
      // },
      {
        prop: "tStrTm",
        inputtype: "rtdatepicker",
        title: "有效起期",
      },
      {
        prop: "tEndTm",
        inputtype: "rtdatepicker",
        title: "有效止期",
      },
      {
        prop: "cGrpMrk",
        inputtype: "rtselect",
        title: "团个单标识",
        loadData: [
          {
            label: "个单",
            value: "1",
          },
          {
            label: "团单",
            value: "2",
          },
          {
            label: "家庭单",
            value: "3",
          },
        ],
      },
      {
        prop: "cIsValid",
        inputtype: "rtselect",
        title: "有效状态",
        loadData: [
          {
            label: "有效",
            value: "1",
          },
          {
            label: "无效",
            value: "2",
          },
        ],
      },
      // {
      //   prop: "nFeeUpper",
      //   inputtype: "rtinput",
      //   title: "条款费率上限",
      // },
      // {
      //   prop: "nFeeLower",
      //   inputtype: "rtinput",
      //   title: "条款费率下限",
      // },
      // {
      //   prop: "cIsExist",
      //   inputtype: "rtselect",
      //   title: "条款文件是否存在",
      //   loadData: [
      //     {
      //       label: "存在",
      //       value: "1",
      //     },
      //     {
      //       label: "不存在",
      //       value: "0",
      //     },
      //   ],
      // },
      // {
      //   prop: "cUseDpt",
      //   inputtype: "rtselect",
      //   title: "适用机构",
      // },
      // {
      //   prop: "cDesc",
      //   inputtype: "rtinput",
      //   type: "textarea",
      //   title: "条款描述",
      //   rows: 2,
      // },
      // {
      //   prop: "termFile",
      //   inputtype: "rtupload",
      //   title: "上传条款文件",
      // },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);

const handleSave = async () => {
  const formData = freeEditRef.value?.getFromValue();
  const param = Object.assign({ type: props.type }, formData);
  if (formData) {
    try {
      await saveCvrgRelTerm(param); // 调用保存接口
      ElMessage.success("保存成功");
      dialogVisible.value = false;
    } catch (error) {
      ElMessage.error("保存失败");
    }
  } else {
    ElMessage.error("请完善表单信息");
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

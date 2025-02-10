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
import { TypeComponents } from "element-plus/es/utils";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const props = defineProps({
  data: Object,
  type: String,
});

const dialogVisible = ref(true);

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "增加条款",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "险类代码",
        typeCode: "KIND_LIST_CACHE",
        params: { codeListParam: "" },
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cTermNo",
        inputtype: "rtinput",
        title: "条款代码",
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "条款名称",
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cNmeEn",
        inputtype: "rtinput",
        title: "英文名称",
      },
      {
        prop: "cFilingNo",
        inputtype: "rtinput",
        title: "备案号",
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "cRegisteredNo",
        inputtype: "rtinput",
        title: "注册号",
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "cEnableFlag",
        inputtype: "rtselect",
        title: "启用标志",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "use_mrk" },
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cIsInternet",
        inputtype: "rtselect",
        title: "是否互联网",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "yes_no" },
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "termRateLower",
        inputtype: "rtnumber",
        title: "费率上限",
        precision: 8,
        placeholder: "1.00000000",
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "termRateUpper",
        inputtype: "rtnumber",
        title: "费率下限",
        precision: 8,
        placeholder: "1.00000000",
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "averageCostRate",
        inputtype: "rtnumber",
        title: "平均费用率",
        precision: 8,
        placeholder: "1.00000000",
        // type: "number",
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "costRateUpper",
        inputtype: "rtnumber",
        precision: 8,
        placeholder: "1.00000000",
        step: 0.01,
        max: 999999,
        stepStrictly: true,
        min: 0,
        title: "费用率上限",
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "cRdrTyp",
        inputtype: "rtselect",
        title: "主险/附加险",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "RdrTyp" },
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "additionalInsuranceType",
        inputtype: "rtselect",
        title: "附加险类型",
        typeCode: "additional_insurance",
        params: { cParCde: "add_type" },
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "tFilingTm",
        inputtype: "rtdatepicker",
        title: "备案日期",
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "tFeedbackTm",
        inputtype: "rtdatepicker",
        title: "反馈日期",
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cIsExist",
        inputtype: "rtselect",
        title: "条款文件是否存在",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "yes_no" },
        rules: [getRules("required", { change: true })],
      },
      // {
      //   prop: "cClassOfClause",
      //   inputtype: "rtselect",
      //   title: "条款类别",
      //   typeCode: "ClassOfClause",
      //   params: { cParCde: "" },
      // },
      {
        prop: "cWebsite",
        inputtype: "rtinput",
        title: "官网链接",
        btnWidth: 20,
        itemWidth: 3,
      },
      {
        prop: "cDesc",
        inputtype: "rtinput",
        type: "textarea",
        btnWidth: 20,
        itemWidth: 3,
        rows: 4,
        title: "条款描述",
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);

const handleSave = async () => {
  const isValid = await freeEditRef.value?.validate();
  if (!isValid) return;
  const formData = freeEditRef.value?.getFromValue();
  const datas = { ...formData, type: props.type };
  if (formData) {
    try {
      await savePrdTermInfo(datas); // 调用保存接口
      ElMessage.success("保存成功");
    } catch (error) {
      ElMessage.error("保存失败");
    }
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
};
onMounted(async () => {
  if (props.type === "edit" && props.data) {
    setTimeout(() => {
      freeEditRef.value?.setFormValue(props.data);
    }, 50);
  }
});
const handleVisibleUpdate = (value: boolean) => {};
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

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
import { savePrdTermInfo } from "@/api/prod"; // api接口
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const opertaor = dataOpertaor();
const tabref = opertaor.getTableRefByKey("inruranceTypeBasicInfo");
const props = defineProps<{
  data: Object;
  type: String;
}>();
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
      },
      {
        prop: "cCvrgTyp",
        inputtype: "rtselect",
        title: "主附险标识",
        loadData: [
          {
            label: "主险",
            value: "1",
          },
          {
            label: "附加险",
            value: "2",
          },
        ],
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
        defaultValue: "1",
      },
      {
        prop: "cIsInternet",
        inputtype: "rtselect",
        title: "是否互联网",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "yes_no" },
        rules: [getRules("required", { blur: true })],
        defaultValue: "0",
      },
      {
        prop: "tFilingTm",
        inputtype: "rtdatepicker",
        title: "备案日期",
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "tFeedbackTm",
        inputtype: "rtdatepicker",
        title: "反馈日期",
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "nFeeUpper",
        inputtype: "rtinput",
        title: "条款费率上限",
      },
      {
        prop: "nFeeLower",
        inputtype: "rtinput",
        title: "条款费率下限",
      },
      {
        prop: "cIsExist",
        inputtype: "rtselect",
        title: "条款文件是否存在",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "yes_no" },
        rules: [getRules("required", { blur: true })],
        defaultValue: "0",
      },
      {
        prop: "cUseDpt",
        inputtype: "rtselect",
        title: "适用机构",
      },
      {
        prop: "cWebsite",
        inputtype: "rtinput",
        title: "官网链接",
        itemWidth: 2,
      },
      {
        prop: "cClassOfClause",
        inputtype: "rtselect",
        title: "条款类别",
        typeCode: "ClassOfClause",
        // params: { cParCde: "" },
      },
      {
        prop: "cDesc",
        inputtype: "rtinput",
        type: "textarea",
        title: "条款描述",
        rows: 2,
        btnWidth: 20,
        itemWidth: 3,
      },
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
  const isValid = await freeEditRef.value?.validate();
  if (!isValid) return;
  // const tabref = opertaor.getTableRefByKey("inruranceTypeBasicInfo");
  const formData = freeEditRef.value?.getFromValue();
  const cCvrgNo = tabref.getFromValue().cCvrgNo;
  console.log(cCvrgNo, "cCvrgNo");
  const param = Object.assign(formData, { cCvrgNo: cCvrgNo, type: props.type });
  if (formData) {
    try {
      await savePrdTermInfo(param); // 调用保存接口
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
  } else {
    setTimeout(() => {
      freeEditRef.value?.setFormValue({
        cEnableFlag: "1",
        cIsInternet: "0",
        cIsExist: "0",
        cKindNo: tabref.getFromValue().cKindNo,
      });
    }, 100);
    // fromSchema?.forEach((e) => {
    //   if (e.prop === "cKindNo") {
    //     e.disabled = true;
    //   }
    // });
  }
});
const handleCancel = () => {
  dialogVisible.value = false;
};
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

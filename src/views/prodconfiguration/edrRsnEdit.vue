<template>
  <el-dialog v-model="dialogVisible" title="" width="80%">
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
import { saveProdEdrRsnInfo, getProdEdrRsnInfo } from "@/api/prod"; // api接口
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const props = defineProps<{
  data: Object;
  type: String;
}>();
const dialogVisible = ref(true);
const emit = defineEmits<{}>();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "增加批改原因",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        typeCode: "KIND_LIST_CACHE",
        params: { codeListParam: "" },
        title: "产品大类",
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cRsnCde",
        inputtype: "rtinput",
        title: "批改原因编号",
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cRsnNme",
        inputtype: "rtinput",
        title: "批改原因名称",
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cRsnTyp",
        inputtype: "rtselect",
        title: "批改原因类别",
        rules: [getRules("required", { change: true })],
        loadData: [
          { value: "1", label: "一般批改" },
          { value: "2", label: "注销批改" },
          { value: "3", label: "退保批改" },
          { value: "4", label: "变更保险期限" },
          { value: "5", label: "批改分期" },
        ],
        defaultValue: "2",
      },
      {
        prop: "cNmeEn",
        inputtype: "rtselect",
        title: "是否计算保费",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "yes_no" },
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cFilingNo",
        inputtype: "rtselect",
        title: "是否团单",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "yes_no" },
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cRegisteredNo",
        inputtype: "rtselect",
        title: "是否个单",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "yes_no" },
        rules: [getRules("required", { change: true })],
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
        prop: "cRsnTxt",
        inputtype: "rtinput",
        type: "textarea",
        btnWidth: 20,
        itemWidth: 3,
        rows: 4,
        title: "批文模板",
        rules: [getRules("required", { blur: true })],
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
  const param = Object.assign({ type: props.type }, formData);
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
  if (props.type === "edit") {
    getProdEdrRsnInfo({ cPkId: props.data.cPkId })
      .then((res) => {
        const { code, data, msg } = res;
        if (200 === code) {
          freeEditRef.value?.setFormValue(data);
        } else {
          ElMessage.error(msg);
        }
      })
      .finally(() => {});
  }
});
const handleCancel = () => {
  dialogVisible.value = false;
};
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

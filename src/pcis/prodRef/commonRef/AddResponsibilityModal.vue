<template>
  <el-dialog v-model="dialogVisible" title="" width="80%">
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
import { ref, reactive, defineEmits } from "vue";
import { ElMessage } from "element-plus";
import { saveRiskInfo, saveCvrgRiskRel } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const opertaor = dataOpertaor();
const props = defineProps<{
  data: Object;
  type: string;
}>();
const emits = defineEmits(["ok", "cancel"]);
const dialogVisible = ref(true);
const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "增加责任",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "大类代码",
        typeCode: "KIND_LIST_CACHE",
        codeParam: { codeListParam: "" },
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "cRiskNo",
        inputtype: "rtinput",
        title: "责任代码",
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "中文名称",
        rules: [getRules("required", { blur: true })],
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
        rules: [getRules("required", { blur: true })],
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "use_mrk" },
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
  const tabref = opertaor.getTableRefByKey("clauseConfBasicInfo");
  const opCde = JSON.parse(sessionStorage.getItem("user")).opCde;
  const cTermNo = tabref.getFromValue().cTermNo;
  const formData = freeEditRef.value?.getFromValue();
  const param = { ...formData, type: props.type, cRiskCls: "1" };
  formData.cCrtCde = opCde;
  formData.cUpdCde = opCde;
  const objStr = [formData];
  const params = { rel: objStr, isAdd: props.type, cTermNo: cTermNo };
  if (formData) {
    try {
      saveRiskInfo(param).then((res) => {
        ElMessage.success(res.msg);
      });
      saveCvrgRiskRel(params);
      emits("ok", {});
      dialogVisible.value = false;
    } catch (error) {}
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
};
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

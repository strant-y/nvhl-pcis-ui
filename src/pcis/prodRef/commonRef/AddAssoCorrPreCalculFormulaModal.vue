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
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { saveEdrFormula } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const tabref = opertaor.getTableRefByKey("prodInfo");

const props = defineProps<{
  data: Object;
  type: string;
}>();
const dialogVisible = ref(true);

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "批改保费计算公式新增",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "cFormuId",
        inputtype: "rtinput",
        title: "公式ID",
        rules: [getRules("required", { change: "公式ID不能为空" })],
      },
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "大类",
        rules: [getRules("required", { change: "大类不能为空" })],
        loadData: [
          {
            value: "1",
            label: "人身险",
          },
        ],
      },
      {
        prop: "cFormutxtCn",
        inputtype: "rtinput",
        title: " 中文公式",
        rules: [getRules("required", { change: "中文公式不能为空" })],
      },
      {
        prop: "cFormutxtEn",
        inputtype: "rtinput",
        title: " 计算公式",
        rules: [getRules("required", { change: "计算公式不能为空" })],
      },
      {
        prop: "cIsValid",
        inputtype: "rtselect",
        title: " 启用标识",
        rules: [getRules("required", { change: "启用标识不能为空" })],
        loadData: [
          {
            value: "0",
            label: "启用",
          },
          {
            value: "1",
            label: "禁用",
          },
        ],
      },
      {
        prop: "cDesc",
        inputtype: "rtinput",
        type: "textarea",
        title: " 描述",
        rows: 2,
        itemWidth: 3,
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
  const user = JSON.parse(sessionStorage.getItem("user"));
  const newParam = {
    ...formData,
    cCrtCde: user.opCde,
    cUpdCde: user.opCde,
    cProdNo: tabref.getFromValue().cProdNo,
  };
  if (newParam) {
    try {
      await saveEdrFormula(newParam); //保存接口调用
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
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

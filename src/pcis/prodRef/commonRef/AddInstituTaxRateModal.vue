<template>
  <el-dialog
    v-model="dialogVisible"
    title="添加条款机构税率信息"
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
import { reactive, ref } from "vue";
import { useValidator } from "@/typings/useValidator";
import { saveProdTaxRateInfo } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";

const { getRules } = useValidator();
// import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const emits = defineEmits(["ok", "cancel"]);
// const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const props = defineProps<{
  data: Object;
  type: String;
  idxParam: Object;
}>();
const dialogVisible = ref(true);
const opertaor = dataOpertaor(props.idxParam?.opertaorProps);
const tabref = opertaor.getTableRefByKey("prodInfo");

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "条款机构税率配置信息",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "cCvrgNo",
        inputtype: "rtselect",
        title: "条款代码及名称",
        rules: [getRules("required", { change: "条款代码及名称不能为空" })],
        typeCode: "Cvrg_LIST",
        codeParam: { cProdNo: tabref?.getFromValue()?.cProdNo },
        // loadData: [
        //   {
        //     label: "060615航空旅客意外伤害保险",
        //     value: "060615",
        //   },
        // ],
      },
      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "机构代码",
        rules: [getRules("required", { change: "机构代码不能为空" })],
        typeCode: "PLYDPT_LIST_1",
        codeParam: { cIsValid: "1", userOrg: "0200000000000" },
      },
      {
        prop: "nCvrgTaxRate",
        inputtype: "rtinput",
        title: " 税率",
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);
const handleSave = async () => {
  const formData = freeEditRef.value?.getFromValue();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const newParam = {
    ...formData,
    cCrtCde: user.opCde,
    cUpdCde: user.opCde,
    cProdNo: tabref.getFromValue().cProdNo,
  };
  if (formData) {
    try {
      await saveProdTaxRateInfo(newParam); //保存接口调用
      emits("ok", {});
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

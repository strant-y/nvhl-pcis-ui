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
const emits = defineEmits(["ok", "cancel"]);
import { saveEdrFormulaRel } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
// import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
// const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const props = defineProps<{
  data: Object;
  type: string;
  idxParam: Object;
}>();
const dialogVisible = ref(true);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const opertaor = dataOpertaor(props.idxParam?.opertaorProps);
const tabref = opertaor.getTableRefByKey("prodInfo");

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "关联批改保费计算公式",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "cFormuId",
        inputtype: "rtselect",
        title: "计算公式",
        rules: [getRules("required", { change: "计算公式不能为空" })],
        typeCode: "ALL_EDRFORMU_SELECT",
        codeParam: { cParCde: "06" },
      },
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "大类",
        rules: [getRules("required", { change: "大类不能为空" })],
        loadData: [
          {
            label: "人身险",
            value: "1",
          },
        ],
      },
      {
        prop: "cCvrgNo",
        inputtype: "rtselect",
        title: " 险别代码",
        typeCode: "Cvrg_LIST",
      },
      {
        prop: "cRsnCde",
        inputtype: "rtselect",
        title: " 批改原因",
        rules: [getRules("required", { change: "批改原因不能为空" })],
        typeCode: "EDR_RSN_LIST_KIND",
      },
      {
        prop: "cSpecParam",
        inputtype: "rtinput",
        title: " 其他计算因子",
      },
      {
        prop: "cIsValid",
        inputtype: "rtselect",
        title: " 启用标识",
        rules: [getRules("required", { change: "启用标识不能为空" })],
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
        prop: "cProdNo",
        inputtype: "rtselect",
        title: " 产品编码",
        rules: [getRules("required", { change: "产品编码不能为空" })],
        disabled: true,
        loadData: [
          {
            label: "060010 航空旅客意外伤害险",
            value: "060010",
          },
          {
            label: "060011 航空旅客意外险",
            value: "060011",
          },
        ],
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
      await saveEdrFormulaRel(newParam); //保存接口调用
      emits("ok", {});
      ElMessage.success("保存成功");
      dialogVisible.value = false;
    } catch (error) {
      ElMessage.error("保存失败");
    }
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
};
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

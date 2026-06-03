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
import { defineProps, onMounted, reactive, ref } from "vue";
import { savePrdRuleInfo } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const emits = defineEmits(["ok", "cancel"]);
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
// import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

// const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const props = defineProps<{
  data: Object;
  type: String;
  idxParam: Object;
}>();
const opertaor = dataOpertaor(props.idxParam?.opertaorProps);
const tabref = opertaor.getTableRefByKey("prodInfo");
const dialogVisible = ref(true);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "新增业务规则",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "机构代码",
        rules: [getRules("required", { change: "机构代码不能为空" })],
        typeCode: "PLYDPT_LIST_1",
        codeParam: { cIsValid: "1", userOrg: "0200000000000" },
      },
      {
        prop: "cInstFlag",
        inputtype: "rtcheckbox",
        title: "允许分期付款",
        keymap: {
          y: "1",
          n: "0",
        },
      },
      {
        prop: "nDqdDays",
        inputtype: "rtinput",
        title: "倒签天数",
      },
      {
        prop: "nDpdDays",
        inputtype: "rtinput",
        title: "倒批天数",
      },
      {
        prop: "nAppntProp",
        inputtype: "rtinput",
        title: "退费控制比例",
      },
      {
        prop: "cPlynoFlag",
        inputtype: "rtcheckbox",
        title: "允许手工录单",
        keymap: {
          y: "1",
          n: "0",
        },
      },
      {
        prop: "cAutoUdr",
        inputtype: "rtcheckbox",
        title: "允许自动核保",
        keymap: {
          y: "1",
          n: "0",
        },
      },
      {
        prop: "cPlyPrmcalFlg",
        inputtype: "rtselect",
        title: "投保保费计算规则",
        rules: [getRules("required", { change: "投保保费计算规则不能为空" })],
        loadData: [
          { value: "0", label: "手工录入保费" },
          { value: "1", label: "通用规则计算保费" },
          { value: "2", label: "通过JS管控计算保费" },
        ],
      },
      {
        prop: "cEdrPrmcalFlg",
        inputtype: "rtselect",
        title: "批改保费计算规则",
        rules: [getRules("required", { change: "批改保费计算规则不能为空" })],
        loadData: [
          { value: "0", label: "手工录入保费" },
          { value: "1", label: "通用规则计算保费" },
          { value: "2", label: "通过JS管控计算保费" },
        ],
      },
      {
        prop: "cJfcdFlag",
        inputtype: "rtcheckbox",
        title: "是否见费出单",
        keymap: {
          y: "1",
          n: "0",
        },
      },
      {
        prop: "cNeedfeeUpdate",
        inputtype: "rtcheckbox",
        title: "见费出单是否只读",
        keymap: {
          y: "1",
          n: "0",
        },
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
      await savePrdRuleInfo(newParam); //保存接口调用
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
  } else {
    setTimeout(() => {
      freeEditRef.value?.setFormValue({
        cPlyPrmcalFlg: "1",
        cEdrPrmcalFlg: "1",
      });
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

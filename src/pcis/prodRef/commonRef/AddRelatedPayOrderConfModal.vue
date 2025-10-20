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
import dayjs from "dayjs";
const emits = defineEmits(["ok", "cancel"]);
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { savePaySeemoneyConfigInfo } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
// import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
// const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
// const opertaor = dataOpertaor(idxParam.opertaorProps);
const props = defineProps<{
  data: Object;
  type: string;
  idxParam: Object;
}>();
const opertaor = dataOpertaor(props.idxParam?.opertaorProps);
const tabref = opertaor.getTableRefByKey("prodInfo");
const dialogVisible = ref(true);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "新增关联见费出单",
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
        prop: "cPayTyp",
        inputtype: "rtselect",
        title: "缴费类型",
        rules: [getRules("required", { change: "缴费类型不能为空" })],
        typeCode: "CHARGE_TYPE_CACHE",
        codeParam: {},
      },
      {
        prop: "cIsValid",
        inputtype: "rtcheckbox",
        title: "是否有效",
        keymap: {
          y: "1",
          n: "0",
        },
      },
      {
        prop: "nControlDays",
        inputtype: "rtinput",
        title: "缴费控制天数",
      },
      {
        prop: "tBgnTm",
        inputtype: "rtdatepicker",
        title: "生效日期",
        rules: [getRules("required", { change: "生效日期不能为空" })],
      },
      {
        prop: "tAdbTm",
        inputtype: "rtdatepicker",
        title: "失效日期",
        rules: [getRules("required", { change: "失效日期不能为空" })],
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
  if (newParam) {
    try {
      await savePaySeemoneyConfigInfo(newParam); //保存接口调用
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
        tBgnTm: dayjs().format("YYYY-MM-DD"),
        tAdbTm: dayjs().add(1, "year").format("YYYY-MM-DD"),
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

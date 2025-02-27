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

import { ref, reactive, defineEmits, defineProps } from "vue";
const emits = defineEmits(["ok", "cancel"]);
import { saveCvrgRelTerm } from "@/api/prod"; // api接口
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const tabref = opertaor.getTableRefByKey("inruranceTypeBasicInfo");
const props = defineProps<{
  data: Object;
  type: string;
}>();
const dialogVisible = ref(true);

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "关联条款",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "cTermNo",
        inputtype: "rtselect",
        title: "条款代码",
        btnWidth: 20,
        itemWidth: 2,
        typeCode: "ALL_CTERMNO_SELECT",
        codeParam: { cParCde: "01" },
        rules: [getRules("required", {})],
      },
      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "承保机构",
        btnWidth: 20,
        itemWidth: 2,
        rules: [getRules("required", {})],
        // showExBtn: true,
        // btnItems: {
        //   icon: "Search",
        //   type: "primary",
        // },
        loadData: [
          {
            label: "营总销售团队1",
            value: "0251010013000",
          },
        ],
      },
      {
        prop: "cProdNo",
        inputtype: "rtinput",
        title: "产品代码",
      },
      {
        prop: "tStrTm",
        inputtype: "rtdatepicker",
        title: "有效起期",
      },
      {
        prop: "tEndTm",
        inputtype: "rtdatepicker",
        title: "有效期止",
      },
      // {
      //   prop: "recordNumber",
      //   inputtype: "rtinput",
      //   title: "备案号",
      // },
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
            value: "0",
          },
          {
            label: "家庭单",
            value: "0",
          },
        ],
      },
      {
        prop: "cIsValid",
        inputtype: "rtselect",
        title: "有效状态",
        rules: [getRules("required", {})],
        loadData: [
          {
            label: "有效",
            value: "1",
          },
          {
            label: "无效",
            value: "0",
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
  const isValid = await freeEditRef.value?.validate();
  if (!isValid) return;
  const formData = freeEditRef.value?.getFromValue();
  const cCvrgNo = tabref.getFromValue().cCvrgNo;
  console.log(cCvrgNo, "cCvrgNo");
  const newParam = Object.assign(formData, {
    cCvrgNo: cCvrgNo,
  });
  if (formData) {
    try {
      await saveCvrgRelTerm(newParam); // 调用保存接口
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

const handleVisibleUpdate = (value: boolean) => {
  emit("update:visible", value);
};
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

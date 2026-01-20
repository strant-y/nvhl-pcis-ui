<template>
  <el-dialog
    v-model="dialogVisible"
    title="添加产品方案条款费率信息"
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
const emits = defineEmits(["ok", "cancel"]);
import { useValidator } from "@/typings/useValidator";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
const { getRules } = useValidator();
import { saveProdPlanCvrgFeeInfo } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
// import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
import { rule } from "postcss";
// const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
// const a = tabref.getFromValue().cProdNo;
// console.log(a, "000000000000000000000000000000000000000000");
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
    title: "产品方案费率信息",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "cPlanNo",
        inputtype: "rtselect",
        title: "方案号",
        rules: [getRules("required", { change: "方案号不能为空" })],
        typeCode: "QryPlanNoByProdNo",
        codeParam: { cProdNo: tabref?.getFromValue()?.cProdNo },
      },
      {
        prop: "cTermNo",
        inputtype: "rtselect",
        title: "条款代码",
        rules: [getRules("required", { change: "条款代码不能为空" })],
        typeCode: "Cvrg_LIST",
        codeParam: { cProdNo: tabref?.getFromValue()?.cProdNo },
      },
      {
        prop: "cSocialSec",
        inputtype: "rtselect",
        title: "有无社保",
        loadData: yesOrNo,
        // typeCode: "WEB_SYS_STA_DICT",
        // codeParam: { cParCde: "yes_no" },
      },
      {
        prop: "cAgeBegin",
        inputtype: "rtinput",
        title: "年龄(周岁)起",
      },
      {
        prop: "cAgeEnd",
        inputtype: "rtinput",
        title: "年龄(周岁)止",
      },
      {
        prop: "nAmt",
        inputtype: "rtinput",
        title: "保额",
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "保费",
      },
      {
        prop: "nPerAmt",
        inputtype: "rtinput",
        title: "每人保额",
      },
      {
        prop: "nPerPrm",
        inputtype: "rtinput",
        title: "每人保费",
      },
      {
        prop: "nRate",
        inputtype: "rtinput",
        title: "费率（‰）",
      },
      {
        prop: "nResvNum6",
        inputtype: "rtinput",
        title: "加费比例(%)",
      },
      {
        prop: "cTgtTxtFld17",
        inputtype: "rtselect",
        title: "是否高风险项目",
        loadData: yesOrNo,
      },
      // {
      //   prop: "cTgtTxtFld18",
      //   inputtype: "rtselect",
      //   title: "高风险项目",
      //   disabled: true,
      // loadData: [
      //   { label: "是", value: "1" },
      //   { label: "否", value: "2" },
      // ],
      // },
      {
        prop: "nDductAmt",
        inputtype: "rtinput",
        title: "免赔额",
      },
      {
        prop: "nResvNum5",
        inputtype: "rtinput",
        title: "次免赔额",
      },
      {
        prop: "nIndemLmt",
        inputtype: "rtinput",
        title: "年度累计赔偿限额",
      },
      {
        prop: "cTgtTxtFld40",
        inputtype: "rtinput",
        title: "是否免核保",
      },
      {
        prop: "nNetPrm",
        inputtype: "rtinput",
        title: "净保费",
      },
      {
        prop: "cIsInstallment",
        inputtype: "rtselect",
        title: "是否分期",
        loadData: yesOrNo,
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "是否有效",
        loadData: yesOrNo,
        defaultValue: "1",
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
      await saveProdPlanCvrgFeeInfo(newParam); //保存接口调用
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
      freeEditRef.value?.setFormValue({ cStatus: "1" });
    }, 100);
  }
});
const handleCancel = () => {
  dialogVisible.value = false;
};
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

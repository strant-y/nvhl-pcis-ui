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
        <el-button type="primary" @click="handleSave">确定</el-button>
        <el-button @click="handleCancel">返回</el-button>
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
import { savePrdRuleInfo, initMultiCodeList } from "@/api/prod"; // api接口 savePrdTermInfo savePrdRuleInfo
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const props = defineProps<{
  visible: boolean,
  data:{
    type: [Object],
    required: true,
  },
}>();


const dialogVisible = ref(true);
const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "save"): void;
}>();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "业务规则配置",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "cDptCde",
        title: "机构代码",
        inputtype: "rtinput",

        // typeCode: "PLYDPT_LIST_1",
        // codeParam: { cIsValid: "1", userOrg: "0200000000000" },
        disabled: true,
        rules: [getRules("required", {})],
      },
      {
        prop: "cRuleTyp",
        inputtype: "rtcheckbox",
        title: "是否临时规则",
      },
      {
        prop: "cPrd",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "KIND_LIST_CACHE",
        codeParam: { codeListParam: "" },
        rules: [getRules("required", {})],
        child: "CProdNo",
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "产品",
        typeCode: "PROD_LIST",
        codeParam: { cParCde: "" },
        rules: [getRules("required", {})],
      },
      {
        prop: "cRuleCde",
        inputtype: "rtinput",
        title: "规则名称",
      },
      {
        prop: "cRuleValue",
        inputtype: "rtinput",
        title: "规则值",
      },
      {
        prop: "tStaTm",
        inputtype: "rtdatepicker",
        title: "规则生效起期",
        rules: [getRules("required", {})],
      },
      {
        prop: "tEndTm",
        inputtype: "rtdatepicker",
        title: "规则生效止期",
        rules: [getRules("required", {})],
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);


onMounted(() => {
  console.log('數據===',props.data)
  // setFormValue(props.data)
  setTimeout(() => {
  freeEditRef.value?.setFormValue(props.data);
    
  }, 0);
});

const handleSave = async () => {
  const formData = freeEditRef.value?.getFromValue();
  if (formData) {
    try {
            
     const res =  await savePrdRuleInfo(formData); // 调用保存接口
    //  if(res.code == 200){
    //   ElMessage.success("保存成功");
    //  }else{
    //   ElMessage.success(res.msg);
    //  }
            console.log('保存res===',res)
            ElMessage.success(res.msg);
      emit("save");
      handleVisibleUpdate(false);
      dialogVisible.value = false;
    } catch (error) {
      ElMessage.error("保存失败");
    }
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
};

const handleVisibleUpdate = (value: boolean) => {
  emit("update:visible", value);
};

function getFromValue() {
  return freeEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  freeEditRef?.value?.setFormValue(value);
}

function validate() {
  return freeEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  freeEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return freeEditRef?.value?.getValue(key);
}
 

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue, 
});
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

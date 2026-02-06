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
import { saveProdRuleInfo, initMultiCodeList } from "@/api/prod"; // api接口 savePrdTermInfo savePrdRuleInfo
import { useValidator } from "@/typings/useValidator";
import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore();
const user = ref(userStore.user);
const { getRules } = useValidator();
const props = defineProps<{
  visible: boolean,
  data:{
    type: [Object],
    required: true,
  },
  type: string;
}>();


const dialogVisible = ref(true);
const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "save"): void;
  (e: "ok"): void;
}>();
const cProdNoOptions = ref<any[]>([]);

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
        typeCode: "KIND_LIST_GRT",
        codeParam: { codeListParam: "" },
        rules: [getRules("required", {})],
        child: "CProdNo",
        func: (val: any) => {
          // 更新产品下拉选
          setFormItem("cProdNo", {
            codeParam: {
              cParCde: val,
              cOperId: user.value?.opCde,
              cDptCde: user.value?.companyId,
            },
          });
          freeEditRef.value?.setValue("cProdNo", null);
        },
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "产品",
        typeCode: "PROD_LIST",
        codeParam: { cParCde: "999" },
        rules: [getRules("required", {})],
      },
      {
        prop: "cRuleCde",
        inputtype: "rtselect",
        title: "规则名称",
				clearable: true,
				typeCode: "RULE_CODE",
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
  if(props.type === "edit") {
    nextTick(() => {
      freeEditRef.value?.setFormValue({
        ...props.data,
        cRuleTyp: props.data.cRuleTyp === "1" ? true : false,
      });
    }).then(() => {
      freeEditRef.value?.setValue("cProdNo", props.data.cProdNo);
    });
  } else {
    nextTick(() => {
      freeEditRef.value?.setValue("cDptCde", props.data.cDptCde);
    })
  }
});

const handleSave = async () => {
  freeEditRef.value?.validate().then((valid:boolean) => {
    if(valid) {
      const formData = {
        ...freeEditRef.value?.getFromValue(),
        cRuleTyp: freeEditRef.value?.getValue("cRuleTyp") ? "1" : "0",
      }
      if(props.type === "add") {
        formData.type = "add"
      }
      saveProdRuleInfo(formData).then((res:any) => {
        if (res.code == 200) {
          ElMessage.success("保存成功");
          emit("ok");
          dialogVisible.value = false;
        } else {
          ElMessage.error(res.msg);
        }
      }).catch((err:any) => {
        ElMessage.error(err);
      });
    }
  });
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
function setFormItem(prop: string, config: any) {
  formconfig.fromSchema?.forEach((item) => {
    if (item.prop === prop) {
        Object.assign(item, config);
    }
  });
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

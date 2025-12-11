<template>
  <el-dialog
    v-model="dialogVisible"
    title=""
    width="50%"
    @update:model-value="handleVisibleUpdate"
  >
    <app-free-edit v-model:freeEditConfig="formconfig" ref="freeEditRef" />
    <template #footer v-if="disabledBtn">
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
import { ElMessage } from "element-plus";
import { PcisQueryService } from "@/views/payinfoManagement/service/pcis-query-service";
import { useValidator } from "@/typings/useValidator";

const pcisQueryService = new PcisQueryService();
const { getRules } = useValidator();
const props = defineProps<{
	CAppNo: {
    // 申请单号
    type: String,
    default: "",
	},
	cFeedback: {
    // 反馈意见选项
    type: String,
    default: "",
	},
	cFailMsg: {
    // 失败原因
    type: String,
    default: "",
  },
}>();
const dialogVisible = ref(true);
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "ok"): void;
}>();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const disabledBtn = ref(false)
const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "反馈意见",
    endBtnsPosition: "right",
    fromSchema: [
			{
        prop: "cFeedback",
        inputtype: "rtselect",
				title: "反馈意见",
				clearable: true,
				typeCode: "feed_back",
				itemWidth: 2,
				func: (val: any) => {
          if (val === "03") {
						setFormItem("cFailMsg", { hidden: false });
					} else {
						setValue("cFailMsg", '')
            setFormItem("cFailMsg", { hidden: true });
          }
        },
				rules: [getRules("required", {})],
			},
      {
        prop: "cFailMsg",
        inputtype: "rtinput",
        type: "textarea",
				title: "失败原因",
				maxlength: 200,
				itemWidth: 3,
				hidden: true,
				rules: [getRules("required", {})],
      },
    ],
  })
);

const handleSave = () => {
	let formData = freeEditRef.value?.getFromValue();
	formData.cInquiryNo = props.CAppNo
	if (formData) {
		pcisQueryService
			.inquiryFeedback(formData)
			.then((res: any) => {
				if (res.code === 200) {
					ElMessage.success("保存成功");
      		emit("ok");
      		dialogVisible.value = false;
				} else {
					ElMessage.error( res.msg ||"保存失败");
				}
			})
			.catch((err) => {
				ElMessage.error(err);
			});
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
};

const handleVisibleUpdate = (value: boolean) => {
  emit("update:visible", value);
};

onMounted(() => {
	setTimeout(() => {
		freeEditRef.value?.setFormValue({
			cFeedback: props.cFeedback,
			cFailMsg: props.cFailMsg,
		});
		if (props.cFeedback || props.cFailMsg) {
			disabledBtn.value = false
			setDisabledAll(true)
		} else {
			disabledBtn.value = true
		}
	}, 30);
});

//给表单下拉项赋值
function setFormItem(key, obj) {
  if (obj && Object.keys(obj).length) {
    formconfig.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        Object.assign(item, obj);
      }
    });
  }
}
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

function setDisabledAll(isDisabled: boolean) {
  freeEditRef?.value?.setDisabledAll(isDisabled);
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
	getValue,
	setDisabledAll,
});
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

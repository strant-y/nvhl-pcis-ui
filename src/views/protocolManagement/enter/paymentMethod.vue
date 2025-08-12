<template>
    <el-dialog
      v-model="dialogVisible"
      width="55%"
      title="选择付费方式"
      @close="closeDialog"
    >
    <div style="height:60px">
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="付费方式" prop="paymentMethod">
          <el-select v-model="formData.paymentMethod" placeholder="请选择付费方式">
            <el-option
                v-for="(item, index) in paymentMethodList"
                :key="index"
                :value="item.value"
                :label="item.label"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="confirm">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { ref } from "vue";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {codelistQuery} from "@/api/dict";
const paymentMethodList = ref([
    {label:'预付', value:'01'},
    {label:'非预付', value:'02'}
]);

const emits = defineEmits(["ok", "cancel"]);
const dialogVisible = ref(true);

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
});
const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);
const formData = reactive<DictTypeForm>({
    paymentMethod: ''
});

const rules = reactive({
  paymentMethod: [{ required: true, message: "请选择付费方式", trigger: "change" }],
});

onMounted(() => {
  
});


// 绑定方法
const method = {};

// 确定
function confirm() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      const param = formData.paymentMethod;
      if (param) {
        closeDialog();
        emits("ok", { param });
      }
    }
  });
}

/** 关闭弹窗 */
function closeDialog() {
  dialogVisible.value = false;
  resetForm();
}

/**  重置表单 */
function resetForm() {
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.paymentMethod = undefined;
}

</script>

<style scoped>

</style>

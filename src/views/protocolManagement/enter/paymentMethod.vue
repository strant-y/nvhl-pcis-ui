<template>
    <el-dialog
      v-model="dialogVisible"
      width="55%"
      title="选择付费方式"
      @close="closeDialog"
    >
    <div style="height:150px">
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="付费方式" prop="paymentMethod">
          <el-select-v2 v-model="formData.paymentMethod" size="large" :options="paymentMethodList" placeholder="请选择付费方式">
            <!-- <el-option
                v-for="(item, index) in paymentMethodList"
                :key="index"
                :value="item.value"
                :label="item.label"
            /> -->
          </el-select-v2>
        </el-form-item>
        <el-form-item
          id="dptCde"
          v-if="isZGS"
          label="分公司"
          prop="dptCde"
        >
            <el-select-v2
                v-model="formData.dptCde"
                :options="dptCdeList"
                placeholder="分公司"
                size="large"
                filterable
                @change="getCDptCdeList"
            />
        </el-form-item>
        <el-form-item
          id="cDptCde"
          label="承保机构"
          prop="cDptCde"
        >
            <el-select-v2
                v-model="formData.cDptCde"
                :options="cDptCdeList"
                placeholder="承保机构"
                size="large"
                :loading="cDptCdeLoading"
                filterable
                clearable
                @change="selectedItem"
            />
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
import { listChrDepts } from "@/api/dept";
import {useUserStore} from "@/store";
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
    paymentMethod: '',
    cDptCde: "",
    cDptCnm: "",
    dptCde:"",
});
const userStore = useUserStore();
const dptCdeList = ref<any[]>([]);
const cDptCdeList = ref<any[]>([]);
const selectTreeItem = ref({});

const isZGS = computed(()=>'0200000000000' === userStore.user.companyId);
const rules = reactive({
  paymentMethod: [{ required: true, message: "请选择付费方式", trigger: "change" }],
  dptCde: [{ required: true, message: "请选择分公司", trigger: "change" }],
  cDptCde: [{ required: true, message: "请选择出单机构", trigger: "change" }],
});
// 查询分公司机构
const getDptCdeList = ()=> {
    if(isZGS.value) {
        listChrDepts({cDptCde: userStore.user.companyId, cDptCls: '1'}).then(({data, code}) => {
            if (code === 200) {
                dptCdeList.value = data.map((item) => ({
                    value: item.cDptCde,
                    label: item.cDptCnm,
                }));
            }
        }).catch(err => console.error(err));
    }
    dptCdeList.value?.push({
        label: userStore.user.companyCnm,
        value: userStore.user.companyId,
    });
};

// 查询出单机构
const cDptCdeLoading = ref(false);
const getCDptCdeList = (data: any)=> {
    cDptCdeLoading.value = true;
    listChrDepts({cDptRelCde: data,cSignDptMrk: '1',cDptCls: '2'}).then(({data, code}) => {
        if (code === 200) {
            cDptCdeList.value = data.map((item) => ({
                value: item.cDptCde,
                label: item.cDptCnm,
            }));

          // 清空已选择的承保机构
          formData.cDptCde = "";
          formData.cDptCnm = "";
        }
        cDptCdeLoading.value = false;
    }).catch(err => console.error(err));
};

onMounted(() => {
  nextTick(() => {
      if(isZGS.value) {
          getDptCdeList();
      }else {
          getCDptCdeList(userStore.user.companyId);
      }
  });
});
//当前选中的机构item
function selectedItem(value) {
    const item = cDptCdeList.value.filter(f => f.value === value)[0];
    selectTreeItem.value = item;
    formData.cDptCnm = item?.label;
    formData.cDptCde = item?.value;
}

// 绑定方法
const method = {};

// 确定
function confirm() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      const param = formData.paymentMethod;
      const dptCde = formData.dptCde;
      const cDptCde = formData.cDptCde;
      if (param) {
        closeDialog();
        emits("ok", { param,dptCde,cDptCde });
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

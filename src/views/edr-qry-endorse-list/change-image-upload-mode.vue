<template>
  <el-dialog title="变更影像上传方式" v-model="dialogVisible" width="90%">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
import { useUserStore } from "@/store/modules/user";

import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { useValidator } from "@/typings/useValidator";
import { createFreeButtonBase } from "@/shared/button-config";

const props = defineProps({
  parameter: {
    type: Object,
    default: () => ({}),
  },
})
const emits = defineEmits(['ok'])
const { getRules } = useValidator();
const dialogVisible = ref(true)
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const userStore = useUserStore();
const formData = reactive<any>({});
const originalImageUploadMode = ref<any>('');
const policyService = new PolicyService();
const user = userStore.user;
// formData.CUpdCde = user['opCde'];

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "确定",
        func: async () => {
          confirm();
        },
      }),
      createFreeButtonBase({
        label: "取消",
        func: () => {
          dialogVisible.value = false
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CImageUploadMode",
        inputtype: "rtselect",
        title: "影像上传方式",
        clearable: true,
        typeCode: "RatioTyp_List",
        codeParam: { 'C_PAR_CDE': "036" },
        rules: [getRules("required", {})],
      },
    ],
  })
);

// 查询保单的影像上传方式
const fetchImageUploadModeByPlyNo = async () => {
  const plyNo = props.parameter.plyNo || '';
  formData.CPlyNo = plyNo;
  const param = { CPlyNo: plyNo };
  const response = await policyService.getImageUploadModeByPlyNo(param);
  if (response.code === 200) {
    originalImageUploadMode.value = response.data;
    formData.CImageUploadMode = response.data;
    freeEditRef.value?.setValue('CImageUploadMode',response.data)
  } else {
    ElMessage.error('查询保单的影像上传方式失败！');
  }
};

const confirm = () => {
  freeEditRef.value?.validate().then(async(isValid) => {
    if (!isValid) {
      ElMessage.warning('请选择影像上传方式');
      return;
    }
    if (freeEditRef.value?.getValue('CImageUploadMode') === originalImageUploadMode.value) {
      ElMessage.warning('影像上传方式没有变化, 请重新选择!');
      return;
    }

    const param = {
      CPlyNo: formData.CPlyNo,
      CImageUploadMode: freeEditRef.value?.getValue('CImageUploadMode'),
      CUpdCde: formData.CUpdCde,
    };
    const response = await policyService.updateImageUploadModeByPlyNo(param);
    if (response.code === 200) {
      ElMessage.success('修改影像上传方式成功！');
      close();
    } else {
      ElMessage.error('修改影像上传方式失败！');
    }
  });
};

const close = () => {
  emits('ok', '');
};

onMounted(() => {
  formData.CUpdCde = user['opCde']
  fetchImageUploadModeByPlyNo();
});

</script>

<style scoped lang="scss">
/* Add your styles here */
</style>

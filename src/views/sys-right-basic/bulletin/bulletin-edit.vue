<template>
  <el-dialog :title="props.addOrEdit" v-model="dialogVisible" width="90%">
		<el-config-provider :locale="enLocale">
      	<app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
		</el-config-provider>
  </el-dialog>
</template>

<script setup lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { ElForm, ElFormItem, ElInput, ElDatePicker, ElSelect, ElOption, ElButton, ElMessage, ElMessageBox, FormRules } from 'element-plus';
import { useUserStore } from "@/store/modules/user";
import { BulletinService } from '../service/bulletin.service';
import { AppKey } from '@/constants/api';
import { getListByCode } from '@/api/code-list-service';
// 引入 ConfigProvider 组件
import { ElConfigProvider } from 'element-plus';
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { useValidator } from "@/typings/useValidator";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
const enLocale = zhCn; // 在 script setup 中直接使用

const props = defineProps({
  pkId: {
    type: String,
    default: '',
  },
  addOrEdit: {
    type: String,
  }
})
const emits = defineEmits(['ok'])
const userStore = useUserStore();
const { getRules } = useValidator();
const bulletinService = new BulletinService()
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "保存",
        func: async () => {
          handleSave();
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "发布并保存",
        func: async () => {
          handlePublishAndSave();
        },
      }),
      createFreeButtonBase({
        type: "",
        label: "返回",
        func: async () => {
          handleCancel();
        },
      }),
    ],
    fromUi: {
      cols: 2
    },
    fromSchema: [
      {
        prop: "CContent",
        inputtype: "rtinput",
        type: "textarea",
        itemWidth: 2,
        rows: 4,
        title: "内容",
        clearable: true,
        rules: [getRules("required", {}), getRules("numbtween", {min: 1, max: 1000, message: '内容长度不能超过 1000 个字符'})],
      },
      {
        prop: "TDeadline",
        inputtype: "rtdatepicker",
        title: "截止时间",
        type: "datetime",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        rules: [getRules("required", {})],
      },
      {
        prop: "CStatus",
        inputtype: "rtselect",
        title: "发布状态",
				loadData: [
					{value: "pub1", label: "暂存"},
					{value: "pub2", label: "发布"}
				],
        clearable: true,
        rules: [getRules("required", {})],
      },
      {
        prop: "CReceive",
        inputtype: "rtselect",
        title: "接收人",
        typeCode: "ROLE_LIST",
        params: { },
        clearable: true,
      },
    ],
  })
);
const dialogVisible = ref(true)
const user = ref(userStore.user);

const handleSave = () => {
  const CStatus = freeEditRef.value?.getValue('CStatus');
   
  freeEditRef.value?.validate().then((isValid) => {
    if (!isValid) {
      ElMessage.warning('表单验证失败,请修正');
      return;
    }
    if (CStatus === 'pub2') {
      ElMessage.warning('直接发布公告请点击【发布并保存】');
      return;
    }
    const s = freeEditRef.value?.getFromValue(); //获取表单数据
    const param = Object.assign(s, {
      CCrtCde: user.value.opCde,
      CUpdCde: user.value.opCde,
    });

    bulletinService.saveBulletin(param).then((res: any) => {
      if (res.code === 200) {
        ElMessage.success(res.msg);
        dialogVisible.value = false
        emits('ok')
      } else {
        ElMessage.error(res.msg);
      }
    });
  });
};

const handlePublishAndSave = () => {
  const CStatus = freeEditRef.value?.getValue('CStatus');
  freeEditRef.value?.validate().then((isValid) => {
    if (!isValid) {
      ElMessage.warning('表单验证失败,请修正');
      return;
    }

    if (CStatus !== 'pub2') {
      ElMessage.warning('请将状态设置为已发布');
      return;
    }

    const s = freeEditRef.value?.getFromValue(); //获取表单数据
    const param = Object.assign(s, {
      CCrtCde: user.value.opCde,
      CUpdCde: user.value.opCde,
    });

    bulletinService.saveBulletin(param).then((res: any) => {
      if (res.code === 200) {
        ElMessage.success('发布成功');
        dialogVisible.value = false
        emits('ok')
      } else {
        ElMessage.error(res.msg);
      }
    });
  });
};

const handleCancel = () => {
  dialogVisible.value = false
  emits('ok')
};

onMounted(() => {
  //编辑时回显
  if (props.pkId) {
    bulletinService.getBulletinInfo({ id: props.pkId }).then((res: any) => {
      if (res.code === 200) {
        if (res.data) {
          freeEditRef.value?.setValue('CContent', res.data.cContent);
          freeEditRef.value?.setValue('TDeadline', res.data.tDeadline);
          freeEditRef.value?.setValue('CStatus', res.data.cStatus);
          freeEditRef.value?.setValue('CReceive', res.data.cReceive);
          freeEditRef.value?.setValue('CPkId', res.data.cPkId);
        }
      }
    });
  }
});

</script>

<style scoped lang="scss">
/* 添加样式 */
</style>

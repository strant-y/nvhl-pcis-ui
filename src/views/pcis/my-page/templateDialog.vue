<!-- 保存模板 -->
<template>
  <el-dialog v-model="dialogVisible" width="90%" title="保存模板">
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="templateFreeEditRef" />
  </el-dialog>
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { useValidator } from "@/typings/useValidator";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
import { createFreeButtonBase } from "@/shared/button-config";
const { getRules } = useValidator();
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
const policyService = new PolicyService();
const dialogVisible = ref(true);

const props = defineProps({
  data: {
    type: Object,
  },
});
const templateFreeEditRef = ref<AppFreeEditMethod | null>(null);
const user = JSON.parse(sessionStorage.getItem("user") || "{}");

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "模板信息",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "保存",
        func: () => {
          confirmBtnFn()
        },
      }),
      createFreeButtonBase({
        type: "default",
        label: "返回",
        func: () => {
          dialogVisible.value = false;
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cTplNme",
        inputtype: "rtinput",
        type: "rtinput",
        title: "模板名称",
        itemWidth: 3,
        rules: [getRules("required", {})],
      },
      {
        prop: "cDesc",
        inputtype: "rtinput",
        type: "rtinput",
        title: "模板描述",
        itemWidth: 3,
      },
    ],
  })
);

function confirmBtnFn() {
  templateFreeEditRef.value?.validate().then((r:boolean) => {
    if (r) {
      const param = {
        ...templateFreeEditRef.value?.getFromValue(),
        cProdNo: props.data?.cProdNo,
        cTermNo: props.data?.cTermNo,
        cCrtCde: user.opCde,
        cUpdCde: user.opCde,
        cTplCtnt: JSON.stringify(props.data),
      };
      if (props.data?.cPkId) {
          param['cPkId'] = props.data?.cPkId;
      }
      policyService.saveOrUpdateTemplate(param).then((result:any) => {
        if(result.code === 200) {
          ElMessage.success("模板保存成功");
          dialogVisible.value = false;
        } else {
          ElMessage.error(result.msg);
        }
      }).catch((error:any) => {
        ElMessage.error(error);
      });
    }
  });
}
</script>

<style lang="scss" scoped>
</style>

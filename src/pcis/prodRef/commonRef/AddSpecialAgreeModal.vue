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
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { saveAssociationSpec } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useValidator } from "@/typings/useValidator";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const tabref = opertaor.getTableRefByKey("prodInfo");
const props = defineProps<{
  data: Object;
  type: string;
}>();
const dialogVisible = ref(true);
const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "增加特约",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "cSpecNo",
        inputtype: "rtinput",
        title: "特约代码",
        disabled: true,
      },
      {
        prop: "cNmeEn",
        inputtype: "rtinput",
        title: "英文名称",
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "启用标识",
        rules: [getRules("required", { change: "启用标识不能为空" })],
        loadData: [
          {
            label: "是",
            value: "1",
          },
          {
            label: "否",
            value: "0",
          },
        ],
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        type: "textarea",
        title: "特约内容",
        itemWidth: 3,
        rows: 4,
        rules: [
          {
            required: true,
            message: "请输入特约内容",
            trigger: "blur",
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
  const formData = freeEditRef.value?.getFromValue();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const newParam = {
    ...formData,
    cCrtCde: user.opCde,
    cUpdCde: user.opCde,
    cProdNo: tabref.getFromValue().cProdNo,
  };
  if (newParam) {
    saveAssociationSpec(newParam)
      .then((res) => {
        const { code, data, msg } = res;
        if (200 === code) {
          emits("ok", {});
          ElMessage.success("保存成功");
          dialogVisible.value = false;
        } else {
          ElMessage.error(msg);
        }
      })
      .finally(() => {});
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
};
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

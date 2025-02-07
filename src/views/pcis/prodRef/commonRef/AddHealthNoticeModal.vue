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
import { saveHealthNotify } from "@/api/prod";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { rule } from "postcss";
const emits = defineEmits(["ok", "cancel"]);
const opertaor = dataOpertaor();
const tabref = opertaor.getTableRefByKey("prodInfo");
const props = defineProps<{
  data: Object;
  type: string;
}>();
const dialogVisible = ref(true);
const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "增加健康告知",
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "cDispCde",
        inputtype: "rtinput",
        title: "显示码",
      },
      {
        prop: "cLevel",
        inputtype: "rtselect",
        title: "层级",
        rules: [getRules("required", { change: "层级不能为空" })],
        loadData: [
          {
            value: "0",
            label: "一级",
          },
          {
            value: "1",
            label: "二级",
          },
        ],
        // typeCode: "WEB_PRD_HEALTH_NOTIFY_ROOT",
        // params: { cProdNo: tabref.getFromValue().cProdNo, value: "ROOT" },
      },

      {
        prop: "cParPkId",
        inputtype: "rtselect",
        title: "上级显示码",
        typeCode: "WEB_PRD_HEALTH_NOTIFY_ROOT",
        params: { cProdNo: tabref.getFromValue().cProdNo },
        disabled: true,
      },
      {
        prop: "nDispOrd",
        inputtype: "rtinput",
        title: "显示顺序",
      },
      {
        prop: "healthType",
        inputtype: "rtselect",
        title: "类型",
        rules: [getRules("required", { change: "类型不能为空" })],
        loadData: [
          {
            value: "note",
            label: "说明",
          },
          {
            value: "question",
            label: "问题",
          },
        ],
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
        prop: "cDesc",
        inputtype: "rtinput",
        type: "textarea",
        title: "健康告知内容",
        itemWidth: 2,
        rows: 3,
        rules: [getRules("required", { change: "健康告知内容不能为空" })],
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
    cParPkId: "ROOT",
  };
  if (formData) {
    try {
      await saveHealthNotify(newParam); //保存接口调用
      emits("ok", {});
      ElMessage.success("保存成功");
      dialogVisible.value = false;
    } catch (error) {
      ElMessage.error("保存失败");
    }
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
};
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

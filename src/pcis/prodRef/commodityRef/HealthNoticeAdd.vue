<template>
  <el-dialog v-model="dialogVisible" title="" width="80%">
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
import { saveHealthNotify } from "@/api/prod";
import { useRoute } from "vue-router";
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");
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
        prop: "CCommodityNo",
        inputtype: "rtinput",
        title: "商品编号",
      },
      {
        prop: "CType",
        inputtype: "rtselect",
        title: "健康告知类型",
        loadData: [
          {
            label: "说明",
            value: "1",
          },
          {
            label: "问题",
            value: "2",
          },
        ],
      },
      {
        prop: "CParPkId",
        inputtype: "rtselect",
        title: "上层健康告知信息",
        loadData: [
          {
            label: "一级",
            value: "1",
          },
          {
            label: "二级",
            value: "2",
          },
        ],
      },
      {
        prop: "NDispOrd",
        inputtype: "rtinput",
        title: "健康告知显示顺序",
      },
      {
        prop: "CDispCde",
        inputtype: "rtinput",
        title: "健康告知显示码",
      },
      {
        prop: "CStatus",
        inputtype: "rtselect",
        title: "启用标识",
        loadData: [
          {
            label: "启用",
            value: "1",
          },
          {
            label: "禁用",
            value: "0",
          },
        ],
      },
      {
        prop: "CDesc",
        inputtype: "rtinput",
        type: "textarea",
        title: "健康告知内容",
        itemWidth: 3,
        rows: 3,
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);

const handleSave = async () => {
  const formData = freeEditRef.value?.getFromValue();
  if (formData) {
    try {
      await saveHealthNotify(formData); //保存接口调用
      ElMessage.success("保存成功");
      emit("save");
      dialogVisible.value = false;
    } catch (error) {
      ElMessage.error("保存失败");
    }
  }
};
onMounted(() => {
  settimeout(() => {
    freeEditRef.value?.setFormValue({ CStatus: "1", CParPkId: "1" });
  }, 50);
});
const handleCancel = () => {
  dialogVisible.value = false;
};
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

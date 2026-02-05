<template>
  <el-dialog
      v-model="dialogVisible"
      title="关联特约修改"
      width="80%"
      @update:model-value="handleVisibleUpdate"
  >
    <app-table
        :tableConfig="tableConfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
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
import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import {
  getCvrgRiskRelList,
  delRiskRel,
  associationSpec,
  getUnbindSpecRefProd, editSpecStatus,
} from "@/api/prod";
import {ref, reactive, defineEmits, defineProps, onMounted} from "vue";
const emits = defineEmits(["ok", "cancel"]);
const props = defineProps<{
  data: Object;
  type: String;
}>();
const dialogVisible = ref(true);

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const { getRules } = useValidator();


const pageresult = reactive<Pageresult>({
  result: "",
  list: [],
  total: 0,
});

const tableConfig = reactive<AppTableConfig>(
    createTableEditConfig({
      fromSchema: [
        {
          prop: "cSpecNo",
          title: "特别约定代码",
          width: "200",
          inputtype: "rtinput",
        },
        {
          prop: "cNmeCn",
          title: "特约内容",
					inputtype: "rtinput",
					align: "left"
        },
        {
          prop: "cIfEdit",
          title: "是否可编辑",
          inputtype: "rtcheckbox",
          width: "100",
          keymap:{
            y:"1",
            n:'0'
          }
        },
        {
          prop: "cIfMust",
          title: "是否必选",
          inputtype: "rtcheckbox",
          width: "100",
          keymap:{
            y:"1",
            n:'0'
          }
        },
      ],
    })
);
onMounted(() => {
  pageresult.list = []
  nextTick(() => {
    pageresult.list = [{...props.data}]
    console.log('pageresult.list',pageresult.list[0])
  })
});
const handleConfirm = () => {
  console.log('pageresult.list',pageresult.list[0])
  editSpecStatus(pageresult.list[0])
      .then((res) => {
        const { code, data, msg } = res;
        if (200 === code) {
          emits("ok", {});
          ElMessage.success(msg);
          dialogVisible.value = false;
        } else {
          ElMessage.error(msg);
        }
      })
      .finally(() => {});
};

const handleCancel = () => {
  dialogVisible.value = false;
};
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="新增查询"
    width="80%"
    @update:model-value="handleVisibleUpdate"
  >
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableConfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
      @selection-change="handleSelectionChange"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handelCancel">取消</el-button>
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
import { associationCvrg, getListByCommodityNoPlanNo } from "@/api/prod";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { ref, reactive, defineEmits, defineProps } from "vue";

const dialogVisible = ref(true);
const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "confirm", selectedRows: any[]): void;
}>();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);

const { getRules } = useValidator();

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "查询条件",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery();
          // const s = queryFormRef.value?.getFromValue(); // 获取表单数据
          // 调用查询接口并更新 pageresult
          console.log("查询条件:", s);
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          queryFormRef.value?.resetFields();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "商品号_方案号",
      },
    ],
    fromUi: createFromUiConfig({
      cols: 1,
    }),
  })
);

const pageresult = reactive<Pageresult>({
  result: "",
  list: [],
  total: 0,
});

const tableConfig = reactive<AppTableConfig>(
  createTableEditConfig({
    selection: true,
    fromSchema: [
      {
        prop: "cKindNo",
        title: "商品号_方案号",
        inputtype: "rtinput",
      },
      {
        prop: "cCvrgNo",
        title: "险种",
        inputtype: "rtinput",
      },
      {
        prop: "cNmeCn",
        title: "机构",
        inputtype: "rtinput",
      },
      {
        prop: "cNmeCn",
        title: "分公司机构",
        inputtype: "rtinput",
      },
    ],
  })
);

const selectedRows = ref<any[]>([]);
/**
 * 分页查询
 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  getListByCommodityNoPlanNo(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = [];
        pageresult.list = data.result;
        pageresult.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}

const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows;
};
const handelCancel = () => {
  dialogVisible.value = false;
};
const handleConfirm = () => {
  emit("confirm", selectedRows.value);
  const param = selectedRows.value;
  associationCvrg(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        emits("ok", {});
        ElMessage.success("保存成功");
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
  handleVisibleUpdate(false);
};

const handleVisibleUpdate = (value: boolean) => {
  emit("update:visible", value);
};
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

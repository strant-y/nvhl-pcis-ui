<!-- 关联特约弹窗（方案配置专用）- 确定时调用 associationPlanSpec 接口保存 -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="关联特约"
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
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleConfirm">确认</el-button>
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
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { getUnbindSpecRefPlan, associationPlanSpec } from "@/api/prod";
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElMessage } from "element-plus";

const emits = defineEmits(["ok", "cancel"]);

const props = defineProps<{
  data: {
    cProdNo: string;
    cPlanNo: string;
  };
}>();

const dialogVisible = ref(true);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const submitLoading = ref(false);

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
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          freeEditRef.value?.resetFields();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cSpecNo",
        inputtype: "rtinput",
        title: "特约代码",
      },
      {
        prop: "cNmeEn",
        inputtype: "rtinput",
        title: "英文名",
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "特约内容",
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
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
    maxHeight: "280",
    fromSchema: [
      {
        prop: "checked",
        title: "是否选中",
        inputtype: "rtcheckbox",
        width: "100",
        func: (val) => {
          selectedRows.value = val;
        },
      },
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
        align: "left",
      },
    ],
  })
);

const selectedRows = ref<any[]>([]);

/** 分页查询待关联方案特约列表 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag);
  const s = freeEditRef.value?.getFromValue();
  const param = {
    CProdNo: props.data?.cProdNo,
    CPlanNo: props.data?.cPlanNo,
    CSpecNo: s?.cSpecNo || "",
    CNmeCn: s?.cNmeCn || "",
    CNmeEn: s?.cNmeEn || "",
    pageNum: r?.pageNum || 1,
    pageSize: r?.pageSize || 10,
  };
  getUnbindSpecRefPlan(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = [];
        pageresult.list = data.result;
        pageresult.total = data.total;
        pageresult.list.forEach((item) => {
          item.checked = false;
        });
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}

function handleSelectionChange(_rows: any[]) {
  // 使用 checked 列控制选中，此处不需要处理
}

onMounted(() => {
  nextTick(() => {
    handleQuery();
  });
});

/** 确认 - 调用 associationPlanSpec 接口保存关联特约，成功后通知父组件刷新列表 */
const handleConfirm = async () => {
  const selectedItems = pageresult.list.filter((item) => item.checked == true);
  if (selectedItems.length === 0) {
    ElMessage.warning("请选择至少一项特约");
    return;
  }

  if (!props.data?.cPlanNo) {
    ElMessage.error("方案编号为空，无法关联特约");
    return;
  }

  // 构建 webPlanSpecialAgreementList 保存参数
  const webPlanSpecialAgreementList = selectedItems.map((item) => ({
    cSpecialCode: item.cSpecNo,
    cSpecialName: item.cNmeEn || "",
    cSpecialContent: item.cNmeCn || "",
    cIfEdit: "0",
    cIfMust: "0",
    cIfFix: item.cIfFix || "0",
    cStatus: "0",
  }));

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const param = {
    CPlanNo: props.data.cPlanNo,
    userId: user.opCde || "",
    webPlanSpecialAgreementList,
  };

  submitLoading.value = true;
  try {
    const res = await associationPlanSpec(param);
    const { code, msg } = res;
    if (200 === code) {
      ElMessage.success("关联特约成功");
      emits("ok", {});
      dialogVisible.value = false;
    } else {
      ElMessage.error(msg || "关联特约失败");
    }
  } catch (e) {
    ElMessage.error("关联特约失败");
  } finally {
    submitLoading.value = false;
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
};

function handleVisibleUpdate(val: boolean) {
  if (!val) {
    emits("cancel", {});
  }
}
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

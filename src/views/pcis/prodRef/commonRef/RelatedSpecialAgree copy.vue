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
  getUnbindSpecRefProd,
} from "@/api/prod";
import { ref, reactive, defineEmits, defineProps } from "vue";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
const props = defineProps<{
  data: Object;
  type: String;
}>();
const dialogVisible = ref(true);

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const tabref = opertaor.getTableRefByKey("prodInfo");
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
          const s = freeEditRef.value?.getFromValue(); // 获取表单数据
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
    selection: true,
    fromSchema: [
      {
        prop: "cSpecNo",
        title: "特别约定代码",
        inputtype: "rtinput",
      },
      {
        prop: "cNmeEn",
        title: "英文名",
        inputtype: "rtinput",
      },
      {
        prop: "cNmeCn",
        title: "特约内容",
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
  const param = Object.assign(s, r, {
    cProdNo: tabref.getFromValue().cProdNo,
  });
  getUnbindSpecRefProd(param)
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
function handleSelectionChange(rows: any[]) {
  selectedRows.value = rows;
}

const handleConfirm = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请选择至少一项");
    return;
  }
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const param = selectedRows.value.map((item) => item.CSpecNo).join(",");
  const newParam = {
    cCrtCde: user.opCde,
    cUpdCde: user.opCde,
    CSpecNo: param,
    cProdNo: tabref.getFromValue().cProdNo,
    CTyp: "2",
  };
  associationSpec(newParam)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        ElMessage.success("保存成功");
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

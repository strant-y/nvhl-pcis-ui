<template>
  <el-dialog
    v-model="dialogVisible"
    title="关联附加险"
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
import { ref, reactive, defineEmits, defineProps } from "vue";
import { getCvrgToRelList, saveCvrgRel } from "@/api/prod";

const props = defineProps<{
  visible: boolean;
}>();

const dialogVisible = ref(true);

import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const tabref = opertaor.getTableRefByKey("inruranceTypeBasicInfo");
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
          console.log("查询条件:");
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
        title: "大类代码",
        loadData: [
          {
            label: "0101",
            value: "1",
          },
          {
            label: "0203",
            value: "2",
          },
        ],
      },
      {
        prop: "cRiskNo",
        inputtype: "rtinput",
        title: "责任代码",
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "中文名称",
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
    showSelection: true,
    fromSchema: [
      {
        prop: "cKindNo",
        title: "大类代码",
        inputtype: "rtinput",
      },
      {
        prop: "cRiskNo",
        title: "责任代码",
        inputtype: "rtinput",
      },
      {
        prop: "cNmeCn",
        title: "中文名称",
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
    CRdrTyp: "1",
    cCvrgNo: tabref.getFromValue().cCvrgNo,
  });
  getCvrgToRelList(param)
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
const handleCancel = () => {
  dialogVisible.value = false;
};
const handleConfirm = () => {
  if (!selectedRows.value.length) {
    ElMessage.error("请选择要关联的附加险");
    return;
  }
  const opCde = JSON.parse(sessionStorage.getItem("user")).opCde;
  const cCvrgNo = tabref.getFromValue().cCvrgNo;
  const newArr = selectedRows.value.map((item) => {
    console.log(item, "item");
    item.cCrtCde = opCde;
    item.cUpdCde = opCde;
    item.cCvrgRdrCde = item.cCvrgNo;
    item.cCvrgNo = cCvrgNo;
    item.cRdrTyp = "1";
    return item;
  });
  const paramData = { cCvrgNo: cCvrgNo, rel: newArr };
  saveCvrgRel(paramData)
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

const handleVisibleUpdate = (value: boolean) => {
  emit("update:visible", value);
};
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

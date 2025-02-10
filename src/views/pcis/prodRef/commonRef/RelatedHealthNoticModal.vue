<template>
  <el-dialog
    v-model="dialogVisible"
    title="关联健康告知"
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
import { getUnbindHealthNotify, saveHealthNotifyRel } from "@/api/prod";
const emits = defineEmits(["ok", "cancel"]);
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
        prop: "cDesc",
        inputtype: "rtinput",
        title: "健康告知内容",
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
        prop: "cDispCde",
        title: "显示码",
        inputtype: "rtinput",
      },
      {
        prop: "cDesc",
        title: "健康告知内容",
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
  getUnbindHealthNotify(param)
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

const handleConfirm = () => {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const param = pageresult.list.map((item) => item.CRelPkId).join(",");
  const newParam = {
    userId: user.opCde,
    cCrtCde: user.opCde,
    cUpdCde: user.opCde,
    cRelPkId: [param],
    cProdNo: tabref.getFromValue().cProdNo,
  };
  saveHealthNotifyRel(newParam)
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
};

const handleCancel = () => {
  dialogVisible.value = false;
};
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

<template>
  <el-dialog
    v-model="dialogVisible"
    title=""
    width="80%"
    @update:model-value="handleVisibleUpdate"
  >
    <app-free-edit v-model:freeEditConfig="formconfig" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
      @selection-change="handleSelectionChange"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useDzModal } from "@/views/dzmodel/DzModalService";
const showBtnConfig = ref(false);
const dialogVisible = ref(true);
const showView = ref(false);
const dzmodal = useDzModal();
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useRoute } from "vue-router";
import { createFreeButtonBase } from "@/shared/button-config";
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { ref, reactive } from "vue";
const emits = defineEmits(["ok", "cancel"]);
import { saveRiskInfo } from "@/api/prod";
import { l } from "vite/dist/node/types.d-jgA8ss1A";
import { fa } from "element-plus/es/locale";

const props = defineProps<{
  data: Object;
  type: string;
}>();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "添加计划配置",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "保存",
        func: () => {
          save();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNme",
        inputtype: "rtselect",
        title: "险种大类",
        loadData: [],
      },
      {
        prop: "cProdNme",
        inputtype: "rtselect",
        title: "险种名称",
      },
      {
        prop: "cPlanCn",
        inputtype: "rtinput",
        title: "方案名称",
      },
      {
        prop: "cPlanNo",
        inputtype: "rtselect",
        title: "方案类型",
      },
      {
        prop: "cNmeEn",
        inputtype: "rtdatepicker",
        title: "启用日期",
      },
      {
        prop: "cNmeEn",
        inputtype: "rtdatepicker",
        title: "失效日期",
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
      await saveRiskInfo(formData); //保存接口调用
      emits("ok", {});
      ElMessage.success("保存成功");
      dialogVisible(false);
    } catch (error) {
      ElMessage.error("保存失败");
    }
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
};

const tableRef = ref<AppTableMethod | null>(null);
const pageresult = reactive<Pageresult>({
  result: "",
  list: [],
  total: 0,
});
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    titleBtns: [
      createFreeButtonBase({
        id: "add-responsibility",
        label: "新增",
        type: "success",
        func: function () {
          showAddPlanConfigurationModal.value = true;
        },
      }),
    ],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        type: "danger",
        tooltip: "删除",
        icon: "Delete",
        link: true,
        tableClick: (row) => {
          delRiskRel(row)
            .then((res) => {
              const { code, data, msg } = res;
              if (200 === code) {
                ElMessage.success("删除成功");
                handleQuery();
              } else {
                ElMessage.error(msg);
              }
            })
            .finally(() => {});
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cProdNo",
        title: "产品代码",
        inputtype: "rtinput",
      },
      {
        prop: "cProdNme",
        inputtype: "rtinput",
        title: "产品名称",
      },
      {
        prop: "cCvrgNo",
        title: "险别代码",
        inputtype: "rtinput",
      },
      {
        prop: "cNmeCn",
        title: "责任",
        inputtype: "rtinput",
      },
      {
        prop: "cRiskNo",
        title: "保额",
        inputtype: "rtinput",
      },
      {
        prop: "cNmeCn",
        title: "费率（‰）",
        inputtype: "rtinput",
      },
      {
        prop: "cNmeCn",
        title: "保费",
        inputtype: "rtinput",
      },
    ],
  })
);
/** 查询 */
function handleQuery() {
  const r = tableRef.value?.getPartnerPage(); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  getCvrgRiskRelList(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = data.result;
        pageresult.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

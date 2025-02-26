<!--核保人批量配置-业务员-员工信息--->
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
// const publicProblem = defineAsyncComponent(() => import("./PublicProblem.vue"));
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
import { getCvrgRiskRelList, saveRiskInfo } from "@/api/prod";

const props = defineProps<{
  visible: boolean;
}>();

const emits = defineEmits(["updateDatas", "update:modelValue", "save", "update:visible"]);

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "业务员-员工信息",
    endBtnsPosition: "right",
    // endBtns: [
    //   createFreeButtonBase({
    //     type: "primary",
    //     label: "选择产品",
    //     func: () => {
    //       save();
    //     },
    //   }),
    // ],
    fromSchema: [
      {
        prop: "CDptCde",
        inputtype: "rtselect",
        title: "员工代码",
      },
      {
        prop: "cPlanCn",
        inputtype: "rtselect",
        title: "员工名称",
      },
      {
        prop: "cPlanCn",
        inputtype: "rtselect",
        title: "员工所属机构",
      },
      // {
      //   prop: "cPlanCn",
      //   inputtype: "rtselect",
      //   title: "核保任职级别",
      // },
      // {
      //   prop: "cPlanCn",
      //   inputtype: "rtdatetimepicker",
      //   title: "任职起期",
      // },
      // {
      //   prop: "cPlanCn",
      //   inputtype: "rtdatetimepicker",
      //   title: "任职止期",
      // },
      // {
      //   prop: "cPlanCn",
      //   inputtype: "rtcheckbox",
      //   title: "核保提醒",
      // },
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
      ElMessage.success("保存成功");
      emits("save");
      // dialogVisible(false);
    } catch (error) {
      ElMessage.error("保存失败");
    }
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
};

const handleVisibleUpdate = (value: boolean) => {
  emits("update:visible", value);
};

const tableRef = ref<AppTableMethod | null>(null);
const pageresult = reactive<Pageresult>({
  result: "",
  list: [],
  total: 0,
});
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    // titleBtns: [
    //   createFreeButtonBase({
    //     id: "add-responsibility",
    //     label: "公共问题新增",
    //     type: "success",
    //     func: function () {
    //       dzmodal.open(publicProblem, { type: "add", data: {} }).then((res) => {
    //         if (res.type === "ok") {
    //           handleQuery();
    //         }
    //       });
    //     },
    //   }),
    // ],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    // tableBtn: [
    //   createFreeButtonBase({
    //     id: "score",
    //     type: "danger",
    //     tooltip: "删除",
    //     icon: "Delete",
    //     link: true,
    //     tableClick: (row) => {},
    //   }),
    // ],
    fromSchema: [
      {
        prop: "cBsnsTyp",
        title: "编号",
        inputtype: "rtinput",
      },
      {
        prop: "cChaType",
        title: "员工代码",
        inputtype: "rtinput",
      },
      {
        prop: "cChaSubtype",
        title: "员工名称",
        inputtype: "rtinput",
      },
      {
        prop: "cChaCde",
        title: "所属机构",
        inputtype: "rtselect",
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
    .then((res: any) => {
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

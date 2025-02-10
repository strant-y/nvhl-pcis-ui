<!--商品配置-出单权限分配-业务员-->
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
const publicProblem = defineAsyncComponent(() => import("./PublicProblem.vue"));
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
import { saveRiskInfo } from "@/api/prod";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save"): void;
}>();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "代理查询",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: () => {
          save();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CDptCde",
        inputtype: "rtselect",
        title: "机构代码",
      },
      {
        prop: "cPlanCn",
        inputtype: "rtselect",
        title: "业务类型",
      },
      {
        prop: "cPlanCn",
        inputtype: "rtselect",
        title: "业务来源",
      },
      {
        prop: "cPlanCn",
        inputtype: "rtselect",
        title: "渠道中级分类",
      },
      {
        prop: "cPlanCn",
        inputtype: "rtselect",
        title: "渠道子类",
      },
      {
        prop: "cPlanCn",
        inputtype: "rtinput",
        title: "编码",
      },
      {
        prop: "cPlanCn",
        inputtype: "rtinput",
        title: "代理(经纪)名称",
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
      ElMessage.success("保存成功");
      emit("save");
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
  emit("update:visible", value);
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
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        type: "danger",
        tooltip: "删除",
        icon: "Delete",
        link: true,
        tableClick: (row) => {
          //   delRiskRel(row)
          //     .then((res) => {
          //       const { code, data, msg } = res;
          //       if (200 === code) {
          //         ElMessage.success("删除成功");
          //         handleQuery();
          //       } else {
          //         ElMessage.error(msg);
          //       }
          //     })
          //     .finally(() => {});
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CBsnsTyp",
        title: "渠道分类",
      },
      {
        prop: "CChaType",
        title: "渠道中级分类",
      },
      {
        prop: "CChaSubtype",
        title: "渠道子类",
      },
      {
        prop: "CChaCde",
        title: "代理编码",
      },
      {
        prop: "CChaNme",
        title: "代理(经纪)名称",
      },
      {
        prop: "CDptCnm",
        title: "代理机构",
      },
      {
        prop: "CAgtAgrNo",
        title: "代理(经纪)协议",
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
        pageresult.list = data.data;
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

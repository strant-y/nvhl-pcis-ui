<template>
  <div class="app-container">
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
    />
  </div>
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
import { saveProdInfo } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
import { useDzModal } from "@/views/dzmodel/DzModalService";
const dzmodal = useDzModal();
const commodityHistory = defineAsyncComponent(
  () => import("./commodityHistory.vue")
);
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useRoute } from "vue-router";
import { ref, reactive, onMounted } from "vue";
import { qryProdTermList, qryCommodityBasePage } from "@/api/prod";
import router from "@/router";

const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");

const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "业务员二维码分配",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        icon: "Search",
        func: async () => {
          handleQuery();
        },
      }),
      createFreeButtonBase({
        label: "重置",
        icon: "RefreshRight",
        func: () => {},
      }),
    ],

    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "险种大类",
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "险种名称",
      },
      {
        prop: "cCommodityNo",
        inputtype: "rtinput",
        title: "商品编号",
      },
      {
        prop: "cCommodityCn",
        inputtype: "rtinput",
        title: "商品名称",
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "状态",
      },
      {
        prop: "cCommodityType",
        inputtype: "rtselect",
        title: "商品类型",
      },
      {
        prop: "cPlatformCn",
        inputtype: "rtinput",
        title: "平台名称",
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

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {
          console.log(row);
          dzmodal
            .open(commodityHistory, { type: "edit", data: row })
            .then((res) => {
              if (res.type === "ok") {
                handleQuery();
              }
            });
        },
      }),
      createFreeButtonBase({
        id: "score",
        tooltip: "查看",
        icon: "View",
        link: true,
        tableClick: (row) => {
          router.push({
            path: "/goodsConfig/commodityEdit",
            query: {
              param: JSON.stringify({
                editType: "view",
                prodNo: row.cProdNo,
              }),
            },
          });
        },
      }),
      createFreeButtonBase({
        id: "score",
        tooltip: "审核历史",
        icon: "history",
        link: true,
        tableClick: (row) => {},
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtinput",
        title: "险种大类",
      },
      {
        prop: "cProdNo",
        inputtype: "rtinput",
        title: "险种名称",
      },
      {
        prop: "cCommodityNo",
        inputtype: "rtinput",
        title: "商品编号",
      },
      {
        prop: "cCommodityCn",
        inputtype: "rtinput",
        title: "商品名称",
      },
      {
        prop: "cPlatformCn",
        inputtype: "rtinput",
        title: "平台名称",
      },
      {
        prop: "cIsOpenCommodity",
        title: "是否全国性商品",
        inputtype: "rtinput",
      },
      {
        prop: "cStatus",
        title: "状态",
        inputtype: "rtinput",
      },
      {
        prop: "cEnableStatus",
        inputtype: "rtswitch",
        title: "启用状态",
      },
    ],
  })
);
const showRelatedTermsModal = ref(false);
const showAddTermModal = ref(false);

const handleRelatedTermsModalConfirm = (selectedRows: any[]) => {
  console.log("选中的条款:", selectedRows);
  // 处理选中的条款
};
const handleAddTermSave = () => {
  handleQuery(); // 刷新列表
};

const handleEdit = (index: number, row: any) => {
  // 编辑逻辑
  console.log("编辑", row);
};

const handleDelete = (index: number, row: any) => {
  ElMessageBox.confirm("此操作将永久删除该条款, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 删除逻辑
      console.log("删除", row);
      // 可以在这里调用 API 删除数据
    })
    .catch(() => {
      // 取消删除
    });
};

function getFromValue() {
  return freeEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  freeEditRef?.value?.setFormValue(value);
}

function validate() {
  return freeEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  freeEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return freeEditRef?.value?.getValue(key);
}

function setDisa() {
  formconfig1.fromSchema?.forEach((e) => {
    if (e.prop === "cProdNo" || e.prop === "cKindNo") {
      e.disabled = true;
    }
  });
}
/** 查询 */
function handleQuery() {
  const r = tableRef.value?.getPartnerPage(); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  qryCommodityBasePage(param)
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
onMounted(() => {
  if (param.editType === "edit") {
    setDisa();
  }
});

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

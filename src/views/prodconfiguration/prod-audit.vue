<template>
  <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
  <app-table
    :tableConfig="tableconfig"
    v-model:pageresult="pageresult"
    ref="tableRef"
    @page-change="handleQuery(false)"
  />
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
// const excelTempEdit = defineAsyncComponent(() => import("./excelTempEdit.vue"));
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useRoute } from "vue-router";
import { ref, reactive, onMounted } from "vue";
import { getProdList } from "@/api/prod";
import { inputtype } from "@/utils/utilKey";

const route = useRoute();
const router = useRouter();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");

const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "产品审核",
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
        typeCode: "KIND_LIST_CACHE",
        params: { codeListParam: "" },
        title: "产品大类",
      },
      {
        prop: "cProdNo",
        inputtype: "rtinput",
        title: "产品代码",
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "产品名称",
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "use_mrk" },
        title: "启用标识",
      },
      {
        prop: "cAuditStatus",
        inputtype: "rtselect",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "PROD_AUDIT_STATUS" },
        title: "审核状态",
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
    // titleBtns: [
    //   createFreeButtonBase({
    //     id: "add-edrRsn",
    //     label: "新增",
    //     type: "success",
    //     func: function () {
    //       dzmodal.open(excelTempEdit, { type: "add", data: {} }).then((res) => {
    //         if (res.type === "ok") {
    //           handleQuery();
    //         }
    //       });
    //     },
    //   }),
    // ],
    editList: ["cStatus"],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "edit-edrRsn",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {
          router.push({
            path: "/prodconfiguration/prodFactoryInfo",
            query: {
              param: JSON.stringify({
                editType: "edit",
                prod: row,
                prodNo: row.cProdNo,
              }),
            },
          });
        },
      }),
      createFreeButtonBase({
        id: "View-edrItem",
        link: true,
        tooltip: "查看",
        type: "success",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          router.push({
            path: "/prodconfiguration/prodFactoryInfo",
            query: {
              param: JSON.stringify({
                editType: "view",
                prodNo: row.cProdNo,
              }),
            },
          });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        title: "大类编号",
        inputtype: "rtinput",
      },
      {
        prop: "cKindNme",
        title: "大类名称",
        inputtype: "rtinput",
      },

      {
        prop: "cProdNo",
        title: "产品编号",
        inputtype: "rtinput",
      },
      {
        prop: "cDispCde",
        title: "产品显示码",
        inputtype: "rtinput",
      },
      {
        prop: "cProdNme",
        title: "产品名称",
        inputtype: "rtinput",
      },
      {
        prop: "cStatus",
        inputtype: "rtswitch",
        title: "启用标识",
        keymap: {
          y: "1",
          n: "0",
        },
        activeText: "启用",
        inactiveText: "禁用",
        inlinePrompt: true,
        change: (val) => {
          console.log(val);
        },
      },
      {
        prop: "cAuditStatus",
        title: "审核状态",
        inputtype: "rtselect",
      },
    ],
  })
);

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
  getProdList(param)
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

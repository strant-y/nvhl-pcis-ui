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
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useRoute } from "vue-router";
import { ref, reactive, onMounted } from "vue";
import { getProFactoryList, changeStatus } from "@/api/prod";
import { descryptParameter } from "@/utils/encipher";
const route = useRoute();
const router = useRouter();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}");

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
        func: () => {
          freeEditRef.value.setFormValue({
            cKindNo: "",
            cProdNo: "",
            cNmeCn: "",
            cStatus: "",
            cAuditStatus: "",
          });
          handleQuery();
        },
      }),
    ],

    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        typeCode: "KIND_LIST_GRT",
        codeParam: { codeListParam: "" },
        title: "产品大类",
      },
      {
        prop: "cProdNo",
        inputtype: "rtinput",
        title: "产品编码",
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
        codeParam: { cParCde: "use_mrk" },
        title: "启用标识",
      },
      {
        prop: "cAuditStatus",
        inputtype: "rtselect",
        title: "审核状态",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "PROD_AUDIT_STATUS" },
        clearable: true,
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
        hideBtns: (row) =>
          row.cAuditStatus === "audit",
        tableClick: (row) => {
          router.push({
            path: "/prodconfiguration/prodFactoryInfo",
            query: {
              param: JSON.stringify({
                type: "approve",
                editType: "edit",
                prod: row,
                prodNo: row.cProdNo,
              }),
            },
          });
        },
      }),
      createFreeButtonBase({
        id: "view",
        link: true,
        tooltip: "查看",
        type: "primary",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          router.push({
            path: "/prodconfiguration/prodFactoryInfo",
            query: {
              param: JSON.stringify({
                type: "approve",
                editType: "view",
                prod: row,
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
        inputtype: "rtselect",
        typeCode: "KIND_LIST_GRT",
        codeParam: { codeListParam: "" },
      },
      {
        prop: "cKindNme",
        title: "产品大类名称",
        inputtype: "rtinput",
      },

      {
        prop: "cProdNo",
        title: "产品编码",
        inputtype: "rtinput",
      },
      {
        prop: "cDispCde",
        title: "产品显示码",
        inputtype: "rtinput",
      },
      {
        prop: "cNmeCn",
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
        func: async (val, row) => {
          await changeStatus({
            cProdNo: row.cProdNo,
            cStatus: val,
          }).then((res) => {
            if (res.code === 200) {
              handleQuery();
            }
          });
        },
      },
      {
        prop: "cAuditStatus",
        inputtype: "rttag",
        title: "审核状态",
        loadData: [
          {
            label: "已提交",
            value: "submit",
            color: "#67C23A",
          },
          {
            label: "未提交",
            value: "unsubmit",
            color: "#14CCCC",
          },
          {
            label: "已审核",
            value: "audit",
            color: "##409EFF",
          },
        ],
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
  getProFactoryList(param)
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

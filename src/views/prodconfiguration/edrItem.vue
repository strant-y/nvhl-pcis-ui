<template>
  <div class="app-container">
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
    />
    <comDialog ref="dialog"></comDialog>
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
import { DialogMethod } from "../../common/dzmodel/ComDialogConf";

const opertaor = dataOpertaor();
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();

import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useRoute } from "vue-router";
import { ref, reactive, onMounted } from "vue";
import { qryProdEdrRsnItemList, delProdEdrRsnItem } from "@/api/prod";
import { inputtype } from "@/utils/utilKey";

const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");

const userStr = sessionStorage.getItem("user");
const user: any = typeof userStr === "string" ? JSON.parse(userStr) : null;

const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const dialog = ref<DialogMethod | null>(null);
const cPard = ref(null);

const selectedKindNo = ref<string | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "批改项配置",
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
          freeEditRef.value?.resetFields();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "产品大类",
        itemWidth: 1,
        rules: [getRules("required", {})],
        typeCode: "KIND_LIST_GRT",
        child: "cProdNo",
        codeParam: {
          cOperId: user?.opCde,
          cDptCde: user?.companyId,
        },
        filterable: true,
        clearable: true,
        func: (row: any) => {
          // 更新产品下拉选
          setFormItem("CProdNo", {
            codeParam: {
              cParCde: row,
              cOperId: user?.opCde,
              cDptCde: user?.companyId,
            },
          });
          freeEditRef.value?.setValue("CProdNo", null);
          // 更新批改项下拉选
          setFormItem("CRsnCde", {
            codeParam: {
              kindNo: row,
            },
          });
          freeEditRef.value?.setValue("CRsnCde", null);
        },
      },
      {
        prop: "CProdNo",
        inputtype: "rtselect",
        title: "产品",
        itemWidth: 1,
        rules: [getRules("required", {})],
        filterable: true,
        clearable: true,
        typeCode: "PROD_LIST_IN_GUIDE",
        codeParam: {
          cParCde: "999",
        },
      },
      {
        prop: "CGrpMrk",
        inputtype: "rtselect",
        rules: [getRules("required", {})],
        title: "是否团单",
        loadData: [
          { value: "0", label: "否" },
          { value: "1", label: "是" },
          { value: "2", label: "家庭单" },
        ],
      },
      {
        prop: "CRsnCde",
        inputtype: "rtselect",
        rules: [getRules("required", {})],
        title: "批改原因",
        typeCode: "EDR_RSN_LIST_KIND_PG",
        codeParam: {
          kindNo: "999",
        },
        filterable: true,
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
    titleBtns: [
      createFreeButtonBase({
        id: "add-edrItem",
        label: "配置",
        type: "success",
        func: function () {
          const s = freeEditRef.value?.getFromValue();
          const cRsnCde = s["CRsnCde"];
          const cProdNo = s["CProdNo"];
          const cGrpMrk = s["CGrpMrk"];
          if (
            cRsnCde == null ||
            cRsnCde == "" ||
            cProdNo == null ||
            cProdNo == ""
          ) {
            ElMessage.error("请先选择险种和批改原因");
            return;
          }
          dialog.value?.open(
            "edrItemEdit",
            { cRsnCde: cRsnCde, cProdNo: cProdNo, cGrpMrk: cGrpMrk },
            {
              isOk: () => {
                handleQuery();
              },
            },
            { title: "要素绑定" }
          );
        },
      }),
    ],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "del-edrItem",
        link: true,
        tooltip: "删除",
        type: "danger",
        size: "large",
        icon: "Delete",
        tableClick: (row) => {
          const param = { CPkId: row.cPkId };
          delProdEdrRsnItem(param)
            .then((res: any) => {
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
        title: "产品",
        inputtype: "rtselect",
        typeCode: "PROD_LIST_IN_GUIDE",
      },
      {
        prop: "cRsnCde",
        title: "批改原因编号",
        inputtype: "rtinput",
      },
      {
        prop: "cOperTyp",
        title: "操作类型",
        inputtype: "rtselect",
        loadData: [
          { value: "M", label: "元素修改" },
          { value: "B", label: "按钮" },
        ],
      },
      {
        prop: "cFactorTitle",
        title: "元素名称",
        inputtype: "rtinput",
      },
      {
        prop: "cEdrItem",
        title: "批改项",
        inputtype: "rtinput",
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
function resetFields() {
  return freeEditRef?.value?.resetFields();
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
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  param["pageNo"] = param["pageNum"];
  qryProdEdrRsnItemList(param)
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
onMounted(() => {
  nextTick(() => {
    freeEditRef.value?.setValue("CGrpMrk", "0");
  });
  if (param.editType === "edit") {
    setDisa();
  }
});
function setFormItem(prop: string, config: any) {
  formconfig1.fromSchema?.forEach((item) => {
    if (item.prop === prop) {
      Object.assign(item, config);
    }
  });
}

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
.app-container {
  padding: 6px 30px;
}
</style>

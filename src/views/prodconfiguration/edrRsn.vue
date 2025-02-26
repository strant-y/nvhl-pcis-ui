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
import { qryProdEdrRsnList } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
import { useDzModal } from "@/views/dzmodel/DzModalService";
const dzmodal = useDzModal();
const edrRsnEdit = defineAsyncComponent(() => import("./edrRsnEdit.vue"));
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useRoute } from "vue-router";
import { ref, reactive, onMounted } from "vue";
import { qryProdTermList, changeProdEdrRsnStatus } from "@/api/prod";
import { inputtype } from "@/utils/utilKey";

const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");

const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "批改原因配置",
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
        prop: "cRsnCde",
        inputtype: "rtinput",
        title: "批改原因编号",
      },
      {
        prop: "cRsnTyp",
        inputtype: "rtselect",
        title: "批改原因类别",
        loadData: [
          { value: "1", label: "一般批改" },
          { value: "2", label: "注销批改" },
          { value: "3", label: "退保批改" },
          { value: "4", label: "变更保险期限" },
          { value: "5", label: "批改分期" },
        ],
      },
      {
        prop: "cRsnNme",
        inputtype: "rtinput",
        title: "批改原因名称",
      },
      {
        prop: "cIsValid",
        inputtype: "rtselect",
        title: "启用标志",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "use_mrk" },
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
        id: "add-edrRsn",
        label: "增加",
        type: "success",
        func: function () {
          dzmodal.open(edrRsnEdit, { type: "add", data: {} }).then((res) => {
            if (res.type === "ok") {
              handleQuery();
            }
          });
        },
      }),
    ],
    editList: ["cIsValid"],
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
          console.log(row);
          dzmodal.open(edrRsnEdit, { type: "edit", data: row }).then((res) => {
            if (res.type === "ok") {
              handleQuery();
            }
          });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        title: "险类",
        inputtype: "rtinput",
      },
      {
        prop: "cRsnCde",
        title: "批改原因编号",
        inputtype: "rtinput",
      },
      {
        prop: "cRsnNme",
        title: "批改原因名称",
        inputtype: "rtinput",
      },
      {
        prop: "cRsnTyp",
        title: "批改原因类别",
        inputtype: "rtinput",
      },
      {
        prop: "cIsValid",
        title: "启用标志",
        inputtype: "rtswitch",
        keymap: {
          y: "1",
          n: "0",
        },
        activeText: "启用",
        inactiveText: "禁用",
        inlinePrompt: true,
        func: async (val, row) => {
          const res = await changeProdEdrRsnStatus({
            cIsValid: val,
            cPkId: row.cPkId,
          });
          if (res.code === 200) {
            ElMessage.success(res.msg);
            handleQuery();
          }
        },
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
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  qryProdEdrRsnList(param)
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

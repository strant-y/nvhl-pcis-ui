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
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const clauseConfAdd = defineAsyncComponent(() => import("./ClauseConfAdd.vue"));
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useRoute } from "vue-router";
import { ref, reactive, onMounted } from "vue";
import { qryProdTermList } from "@/api/prod";
import { descryptParameter, encryptParameter } from "@/utils/encipher";
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}");

const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "关联条款",
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
        prop: "CTermNo",
        inputtype: "rtinput",
        title: "条款代码",
      },
      {
        prop: "CNmeCn",
        inputtype: "rtinput",
        title: "条款名称",
      },
      {
        prop: "CDptCde",
        inputtype: "rtinput",
        title: "机构代码",
      },
      {
        prop: "CProdNo",
        inputtype: "rtinput",
        title: "产品代码",
      },
      {
        prop: "CGrpMrk",
        inputtype: "rtselect",
        title: "团个单标识",
        loadData: [
          {
            label: "个单",
            value: "1",
          },
          {
            label: "团单",
            value: "2",
          },
          {
            label: "家庭单",
            value: "3",
          },
        ],
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
        id: "add-relatedTerms",
        label: "增加条款",
        type: "success",
        func: function () {
          dzmodal.open(clauseConfAdd, { type: "add", data: {} }).then((res) => {
            if (res.type === "ok") {
              handleQuery();
            }
          });
        },
      }),
    ],
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
          dzmodal
            .open(clauseConfAdd, { type: "edit", data: row })
            .then((res) => {
              if (res.type === "ok") {
                handleQuery();
              }
            });
        },
      }),
      createFreeButtonBase({
        id: "score",
        type: "danger",
        tooltip: "删除",
        icon: "Delete",
        link: true,
        tableClick: (row) => {
          deleteFactorBykey(row)
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
        prop: "riskClassCode",
        title: "险类代码",
      },
      {
        prop: "clauseCode",
        title: "条款代码",
      },
      {
        prop: "clauseName",
        title: "条款名称",
      },
      {
        prop: "orgCode",
        title: "机构代码",
      },
      {
        prop: "productCode",
        title: "产品代码",
      },
      {
        prop: "effectiveStartDate",
        title: "有效起期",
      },
      {
        prop: "effectiveEndDate",
        title: "有效止期",
      },
      {
        prop: "groupIndividualFlag",
        title: "团个单标识",
      },
      {
        prop: "validFlag",
        title: "有效标志",
      },
      {
        prop: "enableFlag",
        title: "启用标志",
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
  qryProdTermList(param)
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

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
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const AddTermModal = defineAsyncComponent(() => import("./AddTermModal.vue"));
const EditTermModal = defineAsyncComponent(() => import("./EditTermModal.vue"));
const RelatedTermsModal = defineAsyncComponent(
  () => import("./RelatedTermsModal.vue")
);
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useRoute } from "vue-router";
import { ref, reactive, onMounted } from "vue";
import { qryProdTermList } from "@/api/prod";

const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");

const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const tabref = opertaor.getTableRefByKey("inruranceTypeBasicInfo");
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
        prop: "cTermNo",
        inputtype: "rtinput",
        title: "条款代码",
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "条款名称",
      },
      {
        prop: "cDptCde",
        inputtype: "rtinput",
        title: "机构代码",
      },
      {
        prop: "cProdNo",
        inputtype: "rtinput",
        title: "产品代码",
      },
      {
        prop: "cGrpMrk",
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
        id: "score",
        label: "关联条款",
        type: "success",
        func: function () {
          if (tabref.getFromValue().cCvrgNo == null) {
            ElMessage.error("请完善基本信息!");
            return;
          } else {
            dzmodal
              .open(RelatedTermsModal, { type: "add", data: {} })
              .then((res) => {
                if (res.type === "ok") {
                  handleQuery();
                }
              });
          }
        },
      }),
      createFreeButtonBase({
        id: "add-relatedTerms",
        label: "增加条款",
        type: "success",
        func: function () {
          if (tabref.getFromValue().cCvrgNo == null) {
            ElMessage.error("请完善基本信息!");
            return;
          } else {
            dzmodal
              .open(AddTermModal, { type: "add", data: {} })
              .then((res) => {
                if (res.type === "ok") {
                  handleQuery();
                }
              });
          }
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
            .open(RelatedTermsModal, { type: "edit", data: row })
            .then((res) => {
              if (res.type === "ok") {
                handleQuery();
              }
            });
        },
      }),
      // createFreeButtonBase({
      //   id: "score",
      //   type: "danger",
      //   tooltip: "删除",
      //   icon: "Delete",
      //   link: true,
      //   tableClick: (row) => {
      //     deleteFactorBykey(row)
      //       .then((res) => {
      //         const { code, data, msg } = res;
      //         if (200 === code) {
      //           ElMessage.success("删除成功");
      //           handleQuery();
      //         } else {
      //           ElMessage.error(msg);
      //         }
      //       })
      //       .finally(() => {});
      //   },
      // }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        title: "险类代码",
        inputtype: "rtinput",
        width: 150,
      },
      {
        prop: "cTermNo",
        title: "条款代码",
        width: 150,
        inputtype: "rtinput",
      },
      {
        prop: "cNmeCn",
        width: 300,
        title: "条款名称",
        inputtype: "rtinput",
      },
      {
        prop: "cCrtCde",
        title: "机构代码",
        inputtype: "rtinput",
        width: 150,
      },
      {
        prop: "cProdNo",
        title: "产品代码",
        inputtype: "rtinput",
        width: 150,
      },
      {
        prop: "tStrTm",
        title: "有效起期",
        inputtype: "rtinput",
        width: 150,
      },
      {
        prop: "tEndTm",
        title: "有效止期",
        inputtype: "rtinput",
        width: 150,
      },
      {
        prop: "cGrpMrk",
        title: "团个单标识",
        inputtype: "rtinput",
        width: 150,
      },
      {
        prop: "cIsValid",
        title: "有效标志",
        inputtype: "rtinput",
        width: 150,
      },
      {
        prop: "cEnableFlag",
        title: "启用标志",
        inputtype: "rtselect",
        width: 150,
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
function handleQuery(flag?: boolean) {
  const tabref = opertaor.getTableRefByKey("inruranceTypeBasicInfo");
  if (tabref.getFromValue().cCvrgNo == null) {
    ElMessage.error("请完善基本信息!");
    return;
  } else {
    const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
    const s = freeEditRef.value?.getFromValue(); //获取表单数据
    const param = Object.assign(s, r, {
      cCvrgNo: tabref.getFromValue().cCvrgNo,
    });
    qryProdTermList(param)
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
}
onMounted(() => {
  if (param.type === "edit") {
    setTimeout(() => {
      handleQuery();
    }, 200);
    // setDisa();
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

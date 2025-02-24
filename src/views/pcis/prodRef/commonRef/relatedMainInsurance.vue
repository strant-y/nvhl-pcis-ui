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
import {
  qryProdRelCvrgList,
  unAssociationCvrg,
  qryProdRelTermList,
  unAssociationTerm,
} from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useDzModal } from "@/views/dzmodel/DzModalService";
const dzmodal = useDzModal();
const MaininsuranceModal = defineAsyncComponent(
  () => import("./MaininsuranceModal.vue")
);
const opertaor = dataOpertaor();
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { ref, reactive, onMounted } from "vue";

import { useRoute } from "vue-router";
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");

const { getRules } = useValidator();
const tableRef = ref<AppTableMethod | null>(null);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tabref = opertaor.getTableRefByKey("prodInfo");
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "关联主条款",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery();
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          freeEditRef.value.setFormValue({
            cKindNo: "",
            cNmeCn: "",
            cTermNo: "",
            cKindNme: "",
          });
          handleQuery();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNme",
        inputtype: "rtselect",
        title: "业务大类",
        typeCode: "KIND_LIST_CACHE",
        params: { codeListParam: "" },
      },
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
        label: "关联主条款",
        type: "success",
        func: function () {
          if (tabref.getFromValue().cProdNo == null) {
            ElMessage.error("产品代码为空,请保存后操作!");
            return;
          } else {
            dzmodal
              .open(MaininsuranceModal, { type: "add", data: {} })
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
        type: "danger",
        tooltip: "删除",
        icon: "Delete",
        link: true,
        tableClick: (row) => {
          const userId = sessionStorage.getItem("user").opCde;
          const delParam = { ...row, cCrtCde: userId, cUpdCde: userId };
          unAssociationTerm(delParam)
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
        prop: "cKindNme",
        title: "业务大类",
        inputtype: "rtinput",
      },
      {
        prop: "cTermNo",
        title: "条款代码",
        inputtype: "rtinput",
      },
      {
        prop: "cNmeCn",
        title: "条款名称",
        inputtype: "rtinput",
      },
    ],
  })
);

const handleDelete = (index: number, row: any) => {
  ElMessageBox.confirm("此操作将永久删除该条款, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      unAssociationTerm(row)
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
function getFormValue() {
  return freeEditRef?.value?.getFormValue();
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
  const c = tabref.getFromValue().cProdNo;
  if (tabref.getFromValue().cProdNo == null) {
    ElMessage.error("产品代码为空,请保存后操作!");
    return;
  } else {
    const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
    const s = freeEditRef.value?.getFromValue(); //获取表单数据
    const param = Object.assign(s, r, { cProdNo: c, cRdrTyp: "0" });
    qryProdRelTermList(param)
      .then((res) => {
        const { code, data, msg } = res;
        if (200 === code) {
          pageresult.list = [];
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
  if (param.editType == "edit") {
    setTimeout(() => {
      handleQuery();
    }, 200);
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

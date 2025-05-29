<!--险别配置--关联附加险弹框-->
<template>
  <div class="">
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
import { qryProdRelCvrgList, deleteTermRel } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { dataParam } from "@/store/modules/dataParam";
const opertaor = dataOpertaor();
const dataparam = dataParam();
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useRoute } from "vue-router";
import { ref, reactive, onMounted } from "vue";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const RelatedAdditionalInsModal = defineAsyncComponent(
  () => import("./RelatedAdditionalInsModal.vue")
);
const dialog = ref<DialogMethod | null>(null);
import { getCvrgRelList, delCvrgRel, queryTermRelList } from "@/api/prod";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { RefSymbol } from "@vue/reactivity";
const tabref = opertaor.getTableRefByKey("clauseConfBasicInfo");
const param = dataparam.getParam();
const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "关联附加条款",
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
          freeEditRef.value?.setFormValue({
            cKindNo: "",
            cTermNo: "",
            cNmeCn: "",
          });
          handleQuery();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "大类代码",
        typeCode: "KIND_LIST_ALL",
        codeParam: { cStatus: "1" },
      },
      {
        prop: "cTermRdrCde",
        inputtype: "rtinput",
        title: "条款代码",
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "中文名称",
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
        label: "关联附加条款",
        type: "success",
        func: function () {
          const tabref = opertaor.getTableRefByKey("clauseConfBasicInfo");
          if (tabref.getFromValue().cTermNo == null) {
            ElMessage.error("请完善基本信息后操作!");
            return;
          } else {
            dialog.value?.open(
            "relatedAdditionalInsModal",
            {
              termInfo: tabref.getFromValue(),
            },
            {
              isOk: () => {
                handleQuery();
              },
            },
            { title: "选择条款", width: 70 }
          );
            // dzmodal
            //   .open(RelatedAdditionalInsModal, { type: "add", data: {} })
            //   .then((res) => {
            //     if (res.type === "ok") {
            //       handleQuery();
            //     }
            //   });
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
          handleDelete(row.index, row);
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        title: "大类代码",
        inputtype: "rtinput",
      },
      {
        prop: "cTermNo",
        title: "条款代码",
        inputtype: "rtinput",
      },
      {
        prop: "cNmeCn",
        title: "中文名称",
        inputtype: "rtinput",
      },
    ],
  })
);

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
      deleteTermRel(row)
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
    })
    .catch(() => {
      // 取消删除
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
  const tabref = opertaor.getTableRefByKey("clauseConfBasicInfo");
  if (tabref.getFromValue().cTermNo == null) {
    ElMessage.error("请完善基本信息后在操作!");
    return;
  } else {
    const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
    const s = freeEditRef.value?.getFromValue(); //获取表单数据
    const termInfo = tabref.getFromValue();
    const param = Object.assign(s, r, {cTermNo: termInfo['cTermNo']});
    queryTermRelList(param)
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
function getQueryList(flag?: boolean) {
  const tabref = opertaor.getTableRefByKey("clauseConfBasicInfo");
  if (tabref.getFromValue().cTermNo == null) {
    ElMessage.error("请完善基本信息后在操作!");
    return;
  } else {
    const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
    const s = freeEditRef.value?.getFromValue(); //获取表单数据
    const termInfo = tabref.getFromValue();
    const param = Object.assign(s, r, {cTermNo: termInfo['cTermNo']});
    queryTermRelList(param)
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
    }, 300);
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

<template>
  <div class="callComponentCalls">
    <app-free-edit custom-class="componentCalls"  v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
    custom-class="tableComponentCalls"
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
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const dialog = ref<DialogMethod | null>(null);
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { ref, reactive, onMounted } from "vue";
import {
  getCvrgRiskRelList,
  saveCvrgRiskRel,
  delRiskRel,
  deleteTermRiskRel,
  queryTermRiskRelList,
} from "@/api/prod";

import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const AddResponsibilityModal = defineAsyncComponent(
  () => import("./AddResponsibilityModal.vue")
);
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { dataParam } from "@/store/modules/dataParam";
const paramparam = dataParam();
const param =  paramparam.getParam();

const { getRules } = useValidator();
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "关联责任",
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
        prop: "cRiskNo",
        inputtype: "rtinput",
        title: "责任代码",
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
const tableRef = ref<AppTableMethod | null>(null);
const pageresult = reactive<Pageresult>({
  result: "",
  list: [],
  total: 0,
});

function getClauseConfBasicInfoRef() {
  return opertaor.getTableRefByKey("clauseConfBasicInfo");
}

function getCurrentTermNo() {
  if (param.type === "edit") {
    return param.row.cTermNo;
  }
  return getClauseConfBasicInfoRef()?.getFromValue?.().cTermNo;
}

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "关联责任",
        type: "success",
        func: function () {
          const clauseConfBasicInfo = opertaor.getTableRefByKey(
            "clauseConfBasicInfo"
          );
          if (clauseConfBasicInfo.getFromValue().cTermNo == null) {
            ElMessage.error("请完善基本信息!");
            return;
          } else {
            // dzmodal
            //   .open(ResponsibilityModal, { type: "add", data: {} })
            //   .then((res) => {
            //     if (res.type === "ok") {
            //       handleQuery();
            //     }
            //   });
            dialog.value?.open(
            "responsibilityModal",
            {
              type: "add", data: {},
            },
            {
              isOk: () => {
                handleQuery();
              },
            },
            { title: "关联责任", width: 80 }
          );
          }
        },
      }),
      createFreeButtonBase({
        id: "add-responsibility",
        label: "增加责任",
        type: "success",
        func: function () {
          const clauseConfBasicInfo = opertaor.getTableRefByKey(
            "clauseConfBasicInfo"
          );
          if (clauseConfBasicInfo.getFromValue().cTermNo == null) {
            ElMessage.error("请完善基本信息!");
            return;
          } else {
            dzmodal
              .open(AddResponsibilityModal, { type: "add", data: {}, idxParam: idxParam })
              .then((res) => {
                if (res.type === "ok") {
                  handleQuery();
                }
              });
          }
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "要素绑定",
        func: () => {
          const clauseConfBasicInfo = opertaor.getTableRefByKey(
            "clauseConfBasicInfo"
          );
          dialog.value?.open(
            "riskFactorConfig",
            {
              termObj: clauseConfBasicInfo.getFromValue(),
            },
            {},
            { title: "责任要素绑定", width: "95" }
          );
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
          const params = Object.assign(row, {
            cTermNo: getCurrentTermNo(),
          });
          deleteTermRiskRel(params)
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
        prop: "cRiskNo",
        title: "责任代码",
        inputtype: "rtinput",
      },
      {
        prop: "cNmeCn",
        title: "中文名称",
        inputtype: "rtinput",
      },
      {
        prop: "cNmeEn",
        title: "英文名称",
        inputtype: "rtinput",
      },
      {
        prop: "cIsCommon",
        title: "公共信息",
        inputtype: "rtswitch",
        width:40,
        keymap:{
          y:'1',
          n:'0'
        }
      },
    ],
  })
);

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
  const term = getCurrentTermNo();
  if (!term || term === '') {
    ElMessage.error("请完善基本信息后在操作!");
    return;
  } else {
    const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
    const s = freeEditRef.value?.getFromValue(); //获取表单数据
    const param = Object.assign(s, r, {
      cTermNo: term,
    });
    queryTermRiskRelList(param)
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
    handleQuery();
  }
});

/**
 * 获取当前表格中的关联责任数据
 * 复制模式保存时，由父组件调用获取数据并重新绑定到新条款代码
 */
function getTableData() {
  return pageresult.list;
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  /** 暴露查询方法，供父组件在复制模式下调用 */
  handleQuery,
  /** 暴露获取表格数据方法，供父组件在复制保存时调用 */
  getTableData,
});
</script>
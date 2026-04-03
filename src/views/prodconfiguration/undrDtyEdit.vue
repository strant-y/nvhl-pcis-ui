<template>
  <div>
    <el-dialog v-model="dialogVisible" title="" width="80%">
      <el-config-provider :locale="enLocale">
        <app-free-edit
          v-model:freeEditConfig="formconfig"
          ref="freeEditRef"
          @row-click="handleRowClick"
        />
      </el-config-provider>
      <app-grid-edit v-model:gridEditConfig="gridconfig" ref="gridEditRef" />
      <!-- <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @page-change="handleQuery(false)"
        @refreshParent="handleQuery(false)"
      /> -->
    </el-dialog>
    <!-- <comDialog ref="dialog"></comDialog> -->
  </div>
</template>

<script setup lang="ts">
import { createFreeButtonBase } from "@/shared/button-config";
import { useRoute } from "vue-router";
import DepartmentTree from "@/pcis/prodRef/commodityRef/DepartmentTree.vue";
import BusinessCvrgTree from "@/pcis/prodRef/commodityRef/BusinessCvrgTree.vue";
import undrDtyBussiness from "./undrDtyBussiness.vue";
import { getPageViewByPage, getProdList, saveProdPages, saveBatchUndrDtyInfo } from "@/api/prod";
import {
  AppGridEditConfig,
  AppGridEditMethod,
  createAppGridEditConfig,
  createGridFromUiConfig,
} from "@/shared/app-grid-edit-config";
import { descryptParameter, encryptParameter } from "@/utils/encipher";

const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}");
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();

const dialog = ref<DialogMethod | null>(null);
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const dialogVisible = ref(true);
const gridEditRef = ref<AppGridEditMethod | null>(null);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const cDptCde = ref("");
import zhCn from "element-plus/es/locale/lang/zh-cn";
const enLocale = zhCn;

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "配置核保人任职信息",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "选择产品",
        func: async () => {
          const isValid = await freeEditRef.value?.validate();
          if (!isValid) return false;
          dzmodal.open(BusinessCvrgTree, {cUndrClsCde: freeEditRef.value?.getValue("cUndrClsCde")}).then((res:any) => {
            if (res.type == "ok") {
              const selectObj = res.body?.filter((item:any) => item.parentCode);
              selectObj.forEach((item, index) => {
                gridEditRef.value?.addRowByData({
                  cProdNo: item.code,
                  cProdNme: item.value,
                  cUndrClsCde: freeEditRef.value?.getValue("cUndrClsCde"),
                  cKindNo: item.parentCode,
                  cStatus: "1",
                });
              });
              console.log("子组件传过来的值", res);
            }
          });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cEmpCde",
        inputtype: "rtinput",
        title: "员工代码",
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "CEmpCnm",
        inputtype: "rtinput",
        title: "员工名称",
        showExBtn: true,
        rules: [getRules("required", { change: true })],
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            dzmodal
              .open(undrDtyBussiness, { onRowClick: handleRowClick })
              .then((res) => {
                if (res.type == "ok") {
                  const selectObj = res.body;
                  let obj = {
                    loadData: [
                      {
                        label: selectObj.cEmpCnm,
                        value: selectObj.cEmpCde,
                      },
                    ],
                  };
                  freeEditRef.value?.setValue("CEmpCnm", selectObj.cEmpCnm);
                  freeEditRef.value?.setValue("cEmpCde", selectObj.cEmpCde);
                }
              });
          },
        },
      },
      {
        prop: "cDptCnm",
        inputtype: "rtselect",
        title: "核保任职机构",
        rules: [getRules("required", { change: true })],
        showExBtn: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            dzmodal.open(DepartmentTree, {}).then((res) => {
              if (res.body) {
                const selectObj = res.body;
                let obj = {
                  loadData: [
                    {
                      label: selectObj.name,
                      value: selectObj.id,
                    },
                  ],
                };
                freeEditRef.value?.setValue("cDptCnm", selectObj.name);
                cDptCde.value = selectObj.id;
              }
            });
          },
        },
      },
      {
        prop: "cUndrClsCde",
        inputtype: "rtselect",
        title: "核保任职级别",
        codeParam: {},
        typeCode: "UNDR_CLS_CDE_FOR_KIND",
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "tDutyStrtTm",
        inputtype: "rtdatepicker",
        title: "任职起期",
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "tDutyEndTm",
        inputtype: "rtdatepicker",
        title: "任职止期",
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "isWechatPrompt",
        inputtype: "rtcheckbox",
        title: "核保提醒",
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);
const gridconfig = reactive<AppGridEditConfig>(
  createAppGridEditConfig({
    title: "页面配置",
    // showSelection: true,  // 是否显示多选框
    editFlag: true, //是否可以编辑
    tableBtnWidth: "200",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "新增",
        func: async function () {
          gridEditRef.value?.addRowByData({ cGrpMrk: "0" });
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "删除",
        func: async function () {
          const selData = gridEditRef?.value?.getSelectRow();
          if (!selData) {
            ElMessage.error("请选择要删除的数据!");
            return;
          }
          const editIndex = selData["_dataId"];
          gridEditRef?.value?.delRow(editIndex);
        },
      }),
      createFreeButtonBase({
        label: "保存",
        type: "primary",
        func: function () {
          let s = freeEditRef.value?.getFromValue();
          const pages = gridEditRef.value?.getTableValue();
          const params = Object.assign(s, { items: pages, cDptCde: cDptCde.value });
          saveBatchUndrDtyInfo(params)
            .then((res) => {
              const { code, data, msg } = res;
              if (200 === code) {
                ElMessage.success("保存成功");
                dialogVisible.value = false;
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
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "Query_Kind_List",
        codeParam: {},
        // codeParam: { kindNo: "06", cStatus: "1" },
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "产品",
        typeCode: "PROD_LIST",
        codeParam: {},
        // codeParam: { cParCde: "06" },
      },
      {
        prop: "cUndrClsCde",
        inputtype: "rtselect",
        title: "核保人级别",
        typeCode: "UNDR_CLS_CDE_FOR_KIND",
        codeParam: {},
        // codeParam: { cParCde: "06" },
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "是否启用",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "yes_no" },
      },
    ],
    fromUi: createGridFromUiConfig({
      cols: 3,
    }),
  })
);
const handleRowClick = (rowData: any) => {
  // if (rowData.CEmpCnm) {
  //   freeEditRef.value?.setValue("CEmpCnm", rowData.CEmpCnm);
  // }
};
function copyInitProdNo(v: any) {
  gridconfig.endBtns = [];
  gridEditRef?.value?.setFormValue(v);
}

function setFormValue(value: any) {
  gridEditRef?.value?.setFormValue(value);
}
function getFromValue() {
  return gridEditRef?.value?.getFromValue();
}
defineExpose({
  setFormValue,
  getFromValue,
  copyInitProdNo,
});
</script>

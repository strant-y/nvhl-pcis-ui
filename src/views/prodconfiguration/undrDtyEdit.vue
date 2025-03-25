<template>
  <div>
    <el-dialog v-model="dialogVisible" title="" width="80%">
      <app-free-edit v-model:freeEditConfig="formconfig" ref="freeEditRef" />
      <app-grid-edit v-model:gridEditConfig="gridconfig" ref="gridEditRef" />
    </el-dialog>
    <comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
import { createFreeButtonBase } from "@/shared/button-config";
import { useRoute } from "vue-router";
import DepartmentTree from "@/pcis/prodRef/commodityRef/DepartmentTree.vue";
import BusinessCvrgTree from "@/pcis/prodRef/commodityRef/BusinessCvrgTree.vue";
import undrDtyBussiness from "./undrDtyBussiness.vue";
import { useValidator } from "@/typings/useValidator";
import { getPageViewByPage, getProdList, saveProdPages } from "@/api/prod";
import {
  AppGridEditConfig,
  AppGridEditMethod,
  createAppGridEditConfig,
  createGridFromUiConfig,
} from "@/shared/app-grid-edit-config";
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();

const dialog = ref<DialogMethod | null>(null);
const { getRules } = useValidator();
const dialogVisible = ref(true);
const gridEditRef = ref<AppGridEditMethod | null>(null);
const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "配置核保人任职信息",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "选择产品",
        func: () => {
          dzmodal.open(BusinessCvrgTree, {}).then((res) => {
            if (res) {
              console.log("子组件传过来的值", res);
            }
          });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cDptCde",
        inputtype: "rtinput",
        title: "员工代码",
      },
      {
        prop: "cPlanCn",
        inputtype: "rtinput",
        title: "员工名称",
        showExBtn: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            // dialog.value?.open(
            //   "undrDtyBussiness",
            //   {
            //     type: "show",
            //     method: {
            //       getdbClickData: (data) => {
            //         dialog.value?.handleClose();
            //       },
            //     },
            //   },
            //   {
            //     isOk: (selectdata: any) => {},
            //   },
            //   { title: "员工列表", width: 85 }
            // );
            dzmodal.open(undrDtyBussiness, {}).then((res) => {
              if (res) {
              }
            });
          },
        },
      },
      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "核保任职机构",
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
                freeEditRef.value?.setValue("cDptCde", selectObj.name);
              }
            });
          },
        },
      },
      {
        prop: "cPlanCn",
        inputtype: "rtselect",
        title: "核保任职级别",
        codeParam: { cParCde: "06" },
        typeCode: "UNDR_CLS_CDE_FOR_KIND",
      },
      {
        prop: "cPlanCn",
        inputtype: "rtdatepicker",
        title: "任职起期",
      },
      {
        prop: "cPlanCn",
        inputtype: "rtdatepicker",
        title: "任职止期",
      },
      {
        prop: "cPlanCn",
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
        label: "保存",
        type: "primary",
        func: function () {
          const prodInfo = opertaor?.getTableRefByKey("prodInfo");
          const prodInfoData = prodInfo.getFromValue();
          const pages = gridEditRef.value?.getTableValue();
          const params = Object.assign(prodInfoData, { pages: pages });
          saveProdPages(params)
            .then((res) => {
              const { code, data, msg } = res;
              if (200 === code) {
                ElMessage.success("保存成功");
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
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "产品",
        loadData: [
          {
            label: "是",
            value: "1",
          },
          {
            label: "否",
            value: "0",
          },
        ],
      },
      {
        prop: "cGrpMrk",
        inputtype: "rtselect",
        title: "核保人级别",
        loadData: [
          {
            label: "是",
            value: "1",
          },
          {
            label: "否",
            value: "0",
          },
        ],
      },
      {
        prop: "cGrpMrk",
        inputtype: "rtselect",
        title: "是否启用",
        loadData: [
          {
            label: "是",
            value: "1",
          },
          {
            label: "否",
            value: "0",
          },
        ],
      },
    ],
    fromUi: createGridFromUiConfig({
      cols: 3,
    }),
  })
);

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

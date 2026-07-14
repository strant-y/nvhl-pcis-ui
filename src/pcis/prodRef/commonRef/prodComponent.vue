<template>
  <div class="componenFrom">
    <app-grid-edit v-model:gridEditConfig="gridconfig" ref="gridEditRef" />
    <comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";
import { getPageViewByPage, getProdList, saveProdPages } from "@/api/prod";
import {
  AppGridEditConfig,
  AppGridEditMethod,
  createAppGridEditConfig,
  createGridFromUiConfig,
} from "@/shared/app-grid-edit-config";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { dataParam } from "@/store/modules/dataParam";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const dataparam = dataParam();
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
const dzmodal = useDzModal();
const prodPageComponent = defineAsyncComponent(
  () => import("./prodPageComponent.vue")
);

const prodPageComFactor = defineAsyncComponent(
  () => import("./prodPageComFactor.vue")
);
const jsonArrayEdit = defineAsyncComponent(
  () => import("@/common/dzmodel/jsonArrayEdit.vue")
);
const dialog = ref<DialogMethod | null>(null);
const { getRules } = useValidator();
const param = dataparam.getParam();

const gridEditRef = ref<AppGridEditMethod | null>(null);

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
          gridEditRef.value?.addRowByData({cGrpMrk:'0'});
        },
      }),
      createFreeButtonBase({
        label: "保存",
        type: "primary",
        func: function () {
          const prodInfo = opertaor?.getTableRefByKey("prodInfo");
          const prodInfoData = prodInfo?.getFromValue();
          const pages = gridEditRef.value?.getTableValue();
          const params = Object.assign(prodInfoData, { pages: pages });
          saveProdPages(params)
            .then((res) => {
              const { code, data, msg } = res;
              if (200 === code) {
                ElMessage.success("保存成功");
                dataparam.getParam()?.onSaved?.(params);
              } else {
                ElMessage.error({ message: msg, duration: 1000 });
              }
            })
            .finally(() => {});
        },
      }),
      createFreeButtonBase({
        label: "组件关联",
        type: "primary",
        func: function () {
          const prodInfo = opertaor?.getTableRefByKey("prodInfo");
          const prodInfoData = prodInfo?.getFromValue();
          const r = gridEditRef.value?.getSelectRow();
          if (!r) {
            ElMessage.error({ message: "请选择一行数据", duration: 1000 });
            return;
          }
          dzmodal
            .open(prodPageComponent, {
              type: "edit",
              data: { prodInfo: prodInfoData, pageSelect: r },
            })
            .then((res) => {
              if (res.type === "ok") {
              }
            });
        },
      }),
      createFreeButtonBase({
        label: "组件要素绑定",
        type: "primary",
        func: function () {
          const prodInfo = opertaor?.getTableRefByKey("prodInfo");
          const prodInfoData = prodInfo?.getFromValue();
          const r = gridEditRef.value?.getSelectRow();
          if (!r) {
            ElMessage.error({ message: "请选择一行数据", duration: 1000 });
            return;
          }
          dzmodal
            .open(prodPageComFactor, {
              type: "edit",
              data: { prodInfo: prodInfoData, pageSelect: r },
            })
            .then((res) => {
              if (res.type === "ok") {
              }
            });
        },
      }),
      createFreeButtonBase({
        type: "success",
        label: "预览",
        func: () => {
          const r = gridEditRef.value?.getSelectRow();
          if (!r) {
            ElMessage.error({ message: "请选择一行数据", duration: 1000 });
            return;
          }
          dialog.value?.open(
            "componentPageView",
            {
              param: {
                cProdNo: r.cProdNo,
                cPageCde: r.cPkId,
              },
            },
            {},
            { title: "页面预览", width: "95" }
          );
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cPageNme",
        inputtype: "rtinput",
        title: "页面名称",
      },
      {
        prop: "cGrpMrk",
        inputtype: "rtselect",
        title: "团个单",
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
      prop: "cExParams",
      inputtype: "rtinput",
      type: "textarea",
      itemWidth: 2,
      title: "额外配置参数",
      showExBtn: true,
      btnWidth: 10,
      readonly: true,
      btnItems: createFreeButtonBase({
        icon: "Edit",
        func: () => {
          const r = gridEditRef.value?.getSelectRow();
          const ck = r.cExParams;
          let l = [];
          const d = ck?JSON.parse(ck):{};
          if(d && Object.keys(d).length > 0){
            Object.keys(d).forEach((key) => {
              l.push({
                key: key,
                value: d[key],
              });
            });
          };
          dzmodal
            .open(jsonArrayEdit, {
              data: JSON.stringify(l),
              inititle: ["key", "value"],
            })
            .then((res) => {
              if (res.type === "ok") {
                let nk = {};
                JSON.parse(res.body).forEach((element) => {
                  nk[element.key] = element.value;
                });
                gridEditRef.value?.setValueByRowKey("cExParams", r._dataId ,nk?JSON.stringify(nk):"");
              }
            });
        },
      }),
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

/**
 * 获取当前表格中的页面组件绑定数据
 * 复制模式保存时，由父组件调用获取数据并重新绑定到新产品编码
 */
function getTableData() {
  return gridEditRef.value?.getTableValue();
}

onMounted(() => {
  // view 模式下禁用操作按钮（预览除外）和表格编辑
  if (param?.editType === "view") {
    gridconfig.endBtns.forEach((btn) => {
      // 预览按钮在查看模式下保持可用
      if (btn.label !== "预览") {
        btn.disabled = true;
      }
    });
    gridconfig.editFlag = false;
    // 禁用表格内字段编辑
    gridconfig.fromSchema?.forEach((e) => {
      e.disabled = true;
    });
  }
});

defineExpose({
  setFormValue,
  getFromValue,
  copyInitProdNo,
  /** 暴露获取表格数据方法，供父组件在复制保存时调用 */
  getTableData,
});
</script>

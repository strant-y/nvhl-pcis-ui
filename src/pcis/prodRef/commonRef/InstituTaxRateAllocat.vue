<!--机构税率配置-->
<template>
  <div class="">
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
  deleteCvrgFeeByProdNo,
  delProdTaxRateInfoById,
  qryProdTaxRateInfoPage,
  deleteProdTaxRateByProdNo,
} from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { dataParam } from "@/store/modules/dataParam";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { onMounted, reactive, ref } from "vue";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
import { useRoute } from "vue-router";

const dzmodal = useDzModal();
const AddInstituTaxRateModal = defineAsyncComponent(
  () => import("./AddInstituTaxRateModal.vue")
);
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const dataparam = dataParam();
const tabref = opertaor.getTableRefByKey("prodInfo");
const param = dataparam.getParam();

const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "上传机构税率",
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
          freeEditRef.value.setFormValue({
            cTermNo: "",
            cDptCde: "",
          });
          handleQuery();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cTermNo",
        inputtype: "rtinput",
        title: "条款代码",
      },
      {
        prop: "cDptCde",
        inputtype: "rtinput",
        title: "机构代码",
        // typeCode: "Cvrg_LIST",
        // codeParam: { cProdNo: tabref.getFromValue().cProdNo },
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
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    titleBtns: [
      createFreeButtonBase({
        id: "ratetemp",
        label: "费率模版",
        type: "success",
        func: function () {},
      }),
      createFreeButtonBase({
        id: "rate-export",
        label: "全量导入",
        type: "success",
        func: function () {},
      }),
      createFreeButtonBase({
        id: "add-rateconfigruation",
        label: "新增",
        type: "success",
        func: function () {
          if (tabref?.getFromValue()?.cProdNo == null) {
            ElMessage.error("产品编码为空！请保存后操作");
            return;
          } else {
            dzmodal
              .open(AddInstituTaxRateModal, { type: "add", data: {}, idxParam: idxParam })
              .then((res) => {
                if (res.type === "ok") {
                  handleQuery();
                }
              });
          }
        },
      }),
      createFreeButtonBase({
        id: "del-rateconfigruation",
        label: "全量删除",
        type: "success",
        func: function () {
          deleteProdTaxRateByProdNo({ cProdNo: tabref?.getFromValue()?.cProdNo })
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
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        type: "success",
        tooltip: "编辑",
        icon: "Edit",
        link: true,
        tableClick: (row) => {
          dzmodal
            .open(AddInstituTaxRateModal, { type: "edit", data: row, idxParam: idxParam })
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
          delProdTaxRateInfoById(row)
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
        prop: "cProdNo",
        title: "产品编码",
        inputtype: "rtinput",
      },
      {
        prop: "cTermNo",
        title: "条款代码及名称",
        inputtype: "rtinput",
      },
      {
        prop: "cDptCde",
        title: "机构代码",
        inputtype: "rtinput",
      },
      {
        prop: "nCvrgTaxRate",
        title: "税率",
        inputtype: "rtinput",
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
    e.disabled = true;
  });
}
/** 查询 */
function handleQuery(flag?: boolean) {
  let prod = '';
  if(param.editType === "edit"){
    prod = param.prodNo;
  }else{
    prod = tabref.getFromValue().cProdNo;
  }
  if (!prod || prod === '') {
    ElMessage.error("产品编码为空！请保存后操作");
    return;
  } else {
    const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
    const s = freeEditRef.value?.getFromValue(); //获取表单数据
    const param = Object.assign(s, r, { cProdNo: prod });
    qryProdTaxRateInfoPage(param)
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
  if (param.editType === "edit") {
    handleQuery();
  } else if (param.editType === "view") {
    setDisa();
    tableconfig.titleBtns.forEach((btn) => {
      btn.disabled = true;
    });
    tableconfig.tableBtn.forEach((btn) => {
      btn.disabled = true;
    });
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

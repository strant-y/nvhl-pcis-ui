<!--费率配置-->
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
const { getRules } = useValidator();
import { useDzModal } from "@/common/dzmodel/DzModalService";

const dzmodal = useDzModal();
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { dataParam } from "@/store/modules/dataParam";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const dataparam = dataParam();
const tabref = opertaor.getTableRefByKey("prodInfo");
// const productNo = tabref.getFormValue().cProdNo;
const AddRateConfModal = defineAsyncComponent(
  () => import("./AddRateConfModal.vue")
);

import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { ref, reactive, onMounted } from "vue";
import {
  saveProdInfo,
  qryProdCvrgFeeInfoPage,
  deleteCvrgFeeByProdNo,
  qryProdTermFeeInfoPage,
  query,
  getRiskList,
  saveCvrgRiskRel,
  delProdPlanCvrgFeeInfoById,
  deleteFeeRateByProdNo,
} from "@/api/prod";

import { useRoute } from "vue-router";
const param = dataparam.getParam();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "上传费率表",
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
            cPlanNo: "",
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
        prop: "cPlanNo",
        inputtype: "rtinput",
        title: "方案号",
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
          if (tabref.getFromValue().cProdNo == null) {
            ElMessage.error("产品编码为空！请保存后操作");
            return;
          } else {
            dzmodal
              .open(AddRateConfModal, { type: "add", data: {}, idxParam: idxParam })
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
          deleteFeeRateByProdNo({ cProdNo: tabref.getFromValue().cProdNo })
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
        type: "primary",
        tooltip: "查看",
        icon: "View",
        link: true,
        tableClick: (row) => {
          dzmodal
            .open(AddRateConfModal, { type: "edit", data: row })
            .then((res) => {
              if (res.type === "ok") {
                handleQuery();
              }
            });
        },
      }),
      createFreeButtonBase({
        id: "score",
        type: "success",
        tooltip: "编辑",
        icon: "Edit",
        link: true,
        tableClick: (row) => {
          dzmodal
            .open(AddRateConfModal, { type: "edit", data: row, idxParam: idxParam })
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
          delProdPlanCvrgFeeInfoById(row)
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
        width: 120,
      },
      {
        prop: "cTermNo",
        title: "条款代码",
        inputtype: "rtinput",
        width: 120,
      },
      {
        prop: "cPlanNo",
        title: "方案号",
        inputtype: "rtinput",
        width: 120,
      },
      {
        prop: "cSocialSec",
        title: "有无社保",
        inputtype: "rtinput",
        width: 120,
      },
      {
        prop: "cAgeBegin",
        title: "年龄(周岁)起",
        inputtype: "rtinput",
        width: 120,
      },
      {
        prop: "cAgeEnd",
        title: "年龄(周岁)止",
        inputtype: "rtinput",
        width: 120,
      },
      {
        prop: "nAmt",
        title: "保额",
        inputtype: "rtinput",
        width: 120,
      },
      {
        prop: "nPrm",
        title: "保费",
        inputtype: "rtinput",
        width: 120,
      },
      {
        prop: "nPerAmt",
        title: "每人保额",
        inputtype: "rtinput",
        width: 120,
      },
      {
        prop: "nPerPrm",
        title: "每人保费",
        inputtype: "rtinput",
        width: 120,
      },
      {
        prop: "cTgtTxtFld17",
        title: "是否高风险项目",
        inputtype: "rtinput",
        width: 130,
      },
      {
        prop: "cTgtTxtFld18",
        title: "高风险项目",
        inputtype: "rtinput",
        width: 120,
      },
      {
        prop: "nResvNum6",
        title: "加费比例(%)",
        inputtype: "rtinput",
        width: 120,
      },
      {
        prop: "nIndemLmt",
        title: "年度累计赔偿限额",
        inputtype: "rtinput",
        width: 150,
      },
      {
        prop: "nDductAmt",
        title: "免赔额",
        inputtype: "rtinput",
        width: 120,
      },
      {
        prop: "nRate",
        title: "费率（‰）",
        inputtype: "rtinput",
        width: 120,
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
    qryProdTermFeeInfoPage(param)
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

<!--关联批改保费计算公式-->
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
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { onMounted, reactive, ref } from "vue";
import { getEdrFormulaRel, delEdrFormulaRel } from "@/api/prod";
import { dataParam } from "@/store/modules/dataParam";
import { useRoute } from "vue-router";

const dzmodal = useDzModal();
const RelatedAssoCorrPreCalculFormulaModal = defineAsyncComponent(
  () => import("./RelatedAssoCorrPreCalculFormulaModal.vue")
);
const AddAssoCorrPreCalculFormulaModal = defineAsyncComponent(
  () => import("./AddAssoCorrPreCalculFormulaModal.vue")
);
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const dataparam = dataParam();
const tabref = opertaor.getTableRefByKey("prodInfo");
const param = dataparam.getParam();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "关联批改保费计算公式",
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
            cCvrgNo: "",
          });
          handleQuery();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cCvrgNo",
        inputtype: "rtselect",
        title: "险别代码",
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
        id: "relate-rules",
        label: "关联批改保费计算公式",
        type: "success",
        func: function () {
          dzmodal
            .open(RelatedAssoCorrPreCalculFormulaModal, {
              type: "related",
              data: {},
              idxParam: idxParam
            })
            .then((res) => {
              if (res.type === "ok") {
                handleQuery();
              }
            });
        },
      }),
      createFreeButtonBase({
        id: "add-rateconfigruation",
        label: "新增批改保费计算公式",
        type: "success",
        func: function () {
          dzmodal
            .open(AddAssoCorrPreCalculFormulaModal, { type: "add", data: {}, idxParam: idxParam })
            .then((res) => {
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
        type: "success",
        tooltip: "编辑",
        icon: "Edit",
        link: true,
        tableClick: (row) => {
          dzmodal
            .open(AddAssoCorrPreCalculFormulaModal, { type: "edit", data: row, idxParam: idxParam })
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
          delEdrFormulaRel(row)
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
        prop: "cRsnCde",
        title: "批改原因",
        inputtype: "rtinput",
      },
      {
        prop: "cCvrgNo",
        title: "关联险别代码",
        inputtype: "rtinput",
      },
      {
        prop: "cFormuId",
        title: "批改保费计算公式ID",
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
function handleQuery() {
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
    const r = tableRef.value?.getPartnerPage(); //获取分页数据
    const s = freeEditRef.value?.getFromValue(); //获取表单数据
    const param = Object.assign(s, r, { cProdNo: prod });
    getEdrFormulaRel(param)
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
    setTimeout(() => {
      handleQuery();
    }, 600);
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

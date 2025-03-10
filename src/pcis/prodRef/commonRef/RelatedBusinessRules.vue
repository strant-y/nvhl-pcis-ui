<!--关联业务规则-->
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
import { qryRefProdAndRuleList } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const AddBusinessRulesModal = defineAsyncComponent(
  () => import("./AddBusinessRulesModal.vue")
);
const opertaor = dataOpertaor();
const tabref = opertaor.getTableRefByKey("prodInfo");
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { ref, reactive, onMounted } from "vue";
import {
  query,
  getRiskList,
  saveCvrgRiskRel,
  delPrdRuleInfo,
} from "@/api/prod";

import { useRoute } from "vue-router";
// import { setTimeout } from "node:timers/promises";
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");

const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "关联业务规则",
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
            cDptCde: "",
          });
          handleQuery();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "机构代码",
        typeCode: "PLYDPT_LIST_1",
        codeParam: { cIsValid: "1", userOrg: "0200000000000" },
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
        id: "add-responsibility",
        label: "新增",
        type: "success",
        func: function () {
          if (tabref.getFromValue().cProdNo == null) {
            ElMessage.error("产品代码为空！请保存后操作");
            return;
          } else {
            dzmodal
              .open(AddBusinessRulesModal, { type: "add", data: {} })
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
            .open(AddBusinessRulesModal, { type: "edit", data: row })
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
          delPrdRuleInfo(row)
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
        prop: "cDptNme",
        title: "机构名称",
        inputtype: "rtinput",
        width: 200,
      },
      {
        prop: "cDptCde",
        title: "机构代码",
        inputtype: "rtinput",
        width: 200,
      },
      {
        prop: "cInstFlag",
        title: "允许分期付款",
        inputtype: "rtinput",
        width: 150,
      },
      {
        prop: "nDqdDays",
        title: "倒签天数",
        inputtype: "rtinput",
        width: 100,
      },
      {
        prop: "nDpdDays",
        title: "倒批单",
        inputtype: "rtinput",
        width: 150,
      },
      {
        prop: "cAutoUdr",
        title: "允许自动核保",
        inputtype: "rtinput",
        width: 150,
      },
      {
        prop: "cPlyPrmcalFlg",
        title: "投保保费计算规则",
        inputtype: "rtinput",
        width: 200,
      },
      {
        prop: "cEdrPrmcalFlg",
        title: "批改保费计算规则",
        inputtype: "rtinput",
        width: 200,
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
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const c = tabref.getFromValue().cProdNo;
  const param = Object.assign(s, r, { cProdNo: c });
  if (c == null) {
    ElMessage.error("产品代码为空！请保存后操作");
    return;
  } else {
    qryRefProdAndRuleList(param)
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

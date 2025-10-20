<!--计划配置-->
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
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { getPlanBasePage } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { dataParam } from "@/store/modules/dataParam";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const dataparam = dataParam();
const tabref = opertaor.getTableRefByKey("prodInfo");
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { ref, reactive, onMounted } from "vue";
const AddPlanConfigurationModal = defineAsyncComponent(
  () => import("./AddPlanConfigurationModal.vue")
);
const dzmodal = useDzModal();
const param = dataparam.getParam();

const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "计划配置",
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
            cPlanNo: "",
            cPlanCn: "",
          });
          handleQuery();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cPlanNo",
        inputtype: "rtinput",
        title: "方案编号",
      },
      {
        prop: "cPlanCn",
        inputtype: "rtinput",
        title: "方案名称",
      },
      // {
      //   prop: "cNmeCn",
      //   inputtype: "rtinput",
      //   title: "特约内容",
      // },
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
        id: "add-planConf",
        label: "新增",
        type: "success",
        func: function () {
          dzmodal
            .open(AddPlanConfigurationModal, { type: "add", data: {} })
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
        type: "danger",
        tooltip: "删除",
        icon: "Delete",
        link: true,
        tableClick: (row) => {
          delRiskRel(row)
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
        title: "产品大类",
        inputtype: "rtinput",
      },
      {
        prop: "cProdNme",
        title: "产品名称",
        inputtype: "rtinput",
      },
      {
        prop: "cPlanNo",
        title: "方案编号",
        inputtype: "rtinput",
      },
      {
        prop: "cPlanCn",
        title: "方案名称",
        inputtype: "rtinput",
      },
      {
        prop: "cOrigin",
        title: "来源",
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
        getPlanBasePage(param)
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
    formconfig1.fromSchema?.forEach((e) => {
      if (e.prop === "cProdNo" || e.prop === "cKindNo") {
        e.disabled = true;
      }
    });
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

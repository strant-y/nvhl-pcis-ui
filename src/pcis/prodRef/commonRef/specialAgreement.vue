<!--特别约定-->
<template>
  <div class="">
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
      @refreshParent="handleQuery(false)"
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
import { qryRefProdAndSpecList } from "@/api/prod";
import { dataParam } from "@/store/modules/dataParam";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const RelatedSpecialAgree = defineAsyncComponent(
  () => import("./RelatedSpecialAgree.vue")
);
const AddSpecialAgreeModal = defineAsyncComponent(
  () => import("./AddSpecialAgreeModal.vue")
);
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
const dataparam = dataParam();
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
  unAssociationSpec,
} from "@/api/prod";
const param = dataparam.getParam();
const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tabref = opertaor.getTableRefByKey("prodInfo");
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "关联特别约定",
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
            cSpecNo: "",
            cNmeEn: "",
            cNmeCn: "",
          });
          handleQuery();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cSpecNo",
        inputtype: "rtinput",
        title: "特约代码",
      },
      {
        prop: "cNmeEn",
        inputtype: "rtinput",
        title: "英文名称",
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "特约内容",
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
        id: "score",
        label: "关联特约",
        type: "success",
        func: function () {
          if (tabref.getFromValue().cProdNo == null) {
            ElMessage.error("产品代码为空,请保存后操作!");
            return;
          } else {
            dzmodal
              .open(RelatedSpecialAgree, { type: "add", data: {} })
              .then((res) => {
                if (res.type === "ok") {
                  handleQuery();
                }
              });
          }
        },
      }),
      createFreeButtonBase({
        id: "add-responsibility",
        label: "增加特约",
        type: "success",
        func: function () {
          dzmodal
            .open(AddSpecialAgreeModal, { type: "add", data: {} })
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
          const ids = row.cSpecrelPkId;
          const c = sessionStorage.getItem("user").opCde;
          const delParam = { ids: ids, cCrtCde: c, cUpdCde: c };
          unAssociationSpec(delParam)
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
        prop: "cSpecNo",
        title: "特约代码",
        inputtype: "rtinput",
        width: 200,
      },
      // {
      //   prop: "cNmeEn",
      //   title: "英文名称",
      //   inputtype: "rtinput",
      // },
      {
        prop: "cNmeCn",
        title: "特约内容",
        inputtype: "rtinput",
      },
      {
        prop: "cIfEdit",
        title: "是否可编辑",
        inputtype: "rtcheckbox",
        width: "100",
        func: (val) => {
          return val === "1" ? true : false;
        },
      },
      {
        prop: "cIfMust",
        title: "是否必选",
        inputtype: "rtcheckbox",
        width: "100",
        func: (val, row) => {
          console.log("改变状态的row", row);
          return val === "1" ? true : false;
        },
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
  if (tabref.getFromValue().cProdNo == null) {
    ElMessage.error("产品代码为空,请保存后操作!");
    return;
  } else {
    qryRefProdAndSpecList(param)
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

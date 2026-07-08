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
const UpdateSpecialAgreement = defineAsyncComponent(
    () => import("./UpdateSpecialAgreement.vue")
);
import { dataOpertaor } from "@/store/modules/data-opertaor";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
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
      // {
      //   prop: "cNmeEn",
      //   inputtype: "rtinput",
      //   title: "英文名称",
      // },
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
    showSelection: true,
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "关联特约",
        type: "success",
        func: function () {
          if (!assertCopyTargetReady()) {
            return;
          }
          if (tabref.getFromValue().cProdNo == null) {
            ElMessage.error("产品编码为空,请保存后操作!");
            return;
          } else {
            dzmodal
              .open(RelatedSpecialAgree, { type: "add", data: {}, idxParam: idxParam })
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
            .open(AddSpecialAgreeModal, { type: "add", data: {}, idxParam: idxParam })
            .then((res) => {
              if (res.type === "ok") {
                handleQuery();
              }
            });
        },
      }),
      createFreeButtonBase({
        id: "del-responsibility",
        label: "删除",
        type: "danger",
        func: function () {
          if (!assertCopyTargetReady()) {
            return;
          }
          const selectDate = tableRef.value?.getselectionData()
          const webPrdProdSpecRelDTOList = selectDate.map(item => item.cSpecrelPkId)
          if(webPrdProdSpecRelDTOList.length === 0){
            ElMessage.error("请先选中要删除的数据!");
            return
          }
          ElMessageBox.confirm("是否继续删除数据?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
              .then(() => {
                // 删除逻辑
                console.log("删除",webPrdProdSpecRelDTOList);
                // 可以在这里调用 API 删除数据
                unAssociationSpec( webPrdProdSpecRelDTOList)
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
              })
              .catch(() => {
                // 取消删除
              });
        },
      }),
    ],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [
      // createFreeButtonBase({
      //   id: "score",
      //   type: "danger",
      //   tooltip: "删除",
      //   icon: "Delete",
      //   link: true,
      //   tableClick: (row) => {
      //     const ids = row.cSpecrelPkId;
      //     const c = sessionStorage.getItem("user").opCde;
      //     const delParam = { ids: ids, cCrtCde: c, cUpdCde: c };
      //     unAssociationSpec(delParam)
      //       .then((res) => {
      //         const { code, data, msg } = res;
      //         if (200 === code) {
      //           ElMessage.success("删除成功");
      //           handleQuery();
      //         } else {
      //           ElMessage.error(msg);
      //         }
      //       })
      //       .finally(() => {});
      //   },
      // }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "修改",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {
          if (!assertCopyTargetReady()) {
            return;
          }
          dzmodal.open(UpdateSpecialAgreement, {
            type: "update",
            data: row,
            title: '关联特约修改',
            CEmpCde: ''
          }).then((res) => {
            if (res.type === "ok") {
              handleQuery();
            }
          });
        },
      })
    ],
    fromSchema: [
      {
        prop: "cSpecNo",
        title: "特约代码",
        inputtype: "rtinput",
        width: 200,
      },
      {
        prop: "cNmeCn",
        title: "特约内容",
				inputtype: "rtinput",
				align: 'left'
      },
      {
        prop: "cIfEdit",
        title: "是否可编辑",
        inputtype: "rtcheckbox",
        width: "100",
        disabled: true,
        keymap:{
          y:"1",
          n:'0'
        }
      },
      {
        prop: "cIfMust",
        title: "是否必选",
        inputtype: "rtcheckbox",
        width: "100",
        disabled: true,
        keymap:{
          y:"1",
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
    e.disabled = true;
  });
}
function getSourceProdNo() {
  return param?.prodNo || param?.prod?.cProdNo || "";
}
function getTargetProdNo() {
  return tabref?.getFromValue?.()?.cProdNo || "";
}
function getActiveProdNo() {
  const sourceProdNo = getSourceProdNo();
  const targetProdNo = getTargetProdNo();
  if (param.editType === "edit") {
    return sourceProdNo;
  }
  if (param.editType === "copy") {
    return targetProdNo && targetProdNo !== sourceProdNo ? targetProdNo : sourceProdNo;
  }
  return targetProdNo;
}
function assertCopyTargetReady() {
  if (param.editType !== "copy") {
    return true;
  }
  const sourceProdNo = getSourceProdNo();
  const targetProdNo = getTargetProdNo();
  if (!targetProdNo || targetProdNo === sourceProdNo) {
    ElMessage.error("复制模式请先录入并保存新的产品编码后操作!");
    return false;
  }
  return true;
}
/** 查询 */
function handleQuery(flag?: boolean) {
  const prod = getActiveProdNo();
  if (!prod || prod === '') {
    ElMessage.error("产品编码为空,请保存后操作!");
    return;
  } else {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r, { cProdNo: prod });
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
  if (param.editType === "edit" || param.editType === "copy") {
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

<!-- 核保人批量任职配置 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
      @selection-change="handleSelectionChange"
    />
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import DepartmentTree from "@/pcis/prodRef/commodityRef/DepartmentTree.vue";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import {
  qryBatchUndrDtyList,
  delBatchUndrDtyInfo,
  delSelectedUndrDtyInfo,
  expExcelUndrDty,
} from "@/api/prod";
import { template } from "lodash";
const dzmodal = useDzModal();
import { useUserStore } from "@/store";
import { codeListViewStore } from "@/store";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";


const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);

const undrDtyEdit = defineAsyncComponent(() => import("./undrDtyEdit.vue"));
const tableRef = ref<AppTableMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "核保人批量任职配置",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery();
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          freeEditRef.value?.resetFields();
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "批量作废",
        func: () => {
          if (!selectedRows.value.length) {
            ElMessage.error("请选择要作废的数据");
          } else {
            const param = selectedRows.value
              .map((item) => item.cPkId)
              .join(",");
            let arrData = param.split(",");
            delSelectedUndrDtyInfo({
              undrDtyPkIds: arrData,
              flag: "cancellation",
            })
              .then((res) => {
                const { code, data, msg } = res;
                if (200 === code) {
                  ElMessage.success(msg);
                  handleQuery();
                } else {
                  ElMessage.error(msg);
                }
              })
              .finally(() => {});
          }
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "删除所有",
        func: () => {
          delSelectedUndrty();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "核保任职机构",
        disabled: true,
        showExBtn: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            dzmodal.open(DepartmentTree, {}).then((res) => {
              if (res.body) {
                const selectObj = res.body;
								freeEditRef.value?.setValue(
									"cDptCde",
									selectObj.id
								);
								setFormItem("cDptCde", {
									loadData: [
										{
											label: selectObj.name,
											value: selectObj.id,
										},
									],
								});
              }
            });
          },
        },
        clearable: true,
      },
      {
        prop: "cEmpCde",
        inputtype: "rtinput",
        title: "员工代码",
        clearable: true,
      },
      {
        prop: "cUndrClsCde",
        inputtype: "rtselect",
        title: "核保人级别",
        typeCode: "UNDR_CLS_CDE",
        codeParam: {},
        clearable: true,
      },
      {
        prop: "CKindNo",
        inputtype: "rtselect",
        title: "产品大类",
        // typeCode: "WEB_SYS_STA_DICT",
        typeCode: "KIND_LIST_GRT",
        codeParam: {
          cOperId: JSON.parse(sessionStorage.getItem("user") || '{}').opCde,
          cDptCde: JSON.parse(sessionStorage.getItem("user") || '{}').companyId,
        },
        clearable: true,
        func: (val:any) => {
          setFormItem("CProdNo", {
            loadData: [],
          });
          freeEditRef.value?.setValue("CProdNo", null);
          if(val) {
            codeListStore
              .queryCodeList({
                codeListName: "PROD_LIST_GRT",
                codeListParam:{
                  cParCde: val,
                  cOperId: JSON.parse(sessionStorage.getItem("user") || '{}').opCde,
                  cDptCde: JSON.parse(sessionStorage.getItem("user") || '{}').companyId,
                },
              })
              .then((res) => {
                setFormItem("CProdNo", {
                  loadData: res,
                });
              });
          }
        }
      },
      {
        prop: "CProdNo",
        inputtype: "rtselect",
        title: "产品",
        // typeCode: "PROD_LIST_GRT",
        // params: {
        //   cParCde: "",
        //   cOperId: user.value.opCde,
        //   cDptCde: user.value.companyId,
        // },
        // loadData: [],
        clearable: true,
      },
      {
        prop: "tDutyStrtTm",
        inputtype: "rtdatepicker",
        title: "任职起期",
        clearable: true,
      },
      {
        prop: "tDutyEndTm",
        inputtype: "rtdatepicker",
        title: "任职止期",
        clearable: true,
      },
    ],
  })
);

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
const selectedRows = ref<any[]>([]);

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    showSelection: true,
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "配置",
        type: "success",
        // icon: "Plus",
        func: function () {
          dzmodal.open(undrDtyEdit, { type: "add", data: {} }).then((res) => {
            if (res.type === "ok") {
              handleQuery();
            }
          });
        },
      }),
      createFreeButtonBase({
        id: "score",
        label: "导出",
        type: "primary",
        func: () => {},
      }),
      createFreeButtonBase({
        id: "score",
        label: "Excel导入",
        type: "primary",
        func: () => {},
      }),
      createFreeButtonBase({
        id: "score",
        label: "模板下载",
        type: "primary",
        func: () => {
          const params = freeEditRef.value?.getFromValue();
          expExcelUndrDty(params).then((res) => {});
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
        tooltip: "删除",
        type: "danger",
        size: "large",
        icon: "Delete",
        tableClick: (row) => {
          delBatchUndrDtyInfo(row)
            .then((res) => {
              const { code, data, msg } = res;
              if (200 === code) {
                ElMessage.success(msg);
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
        prop: "cEmpCde",
        inputtype: "rtinput",
        title: "员工代码",
      },
      {
        prop: "cDptCde",
        inputtype: "rtinput",
        title: "核保任职机构",
        // typeCode: "KIND_LIST_CACHE",
        // codeParam: { codeListParam: "" },
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "产品",
        typeCode: "PROD_LIST_GRT",
        // typeCode: "KIND_LIST_CACHE",
        codeParam: {
          cParCde: "",
          cOperId: user.value.opCde,
          cDptCde: user.value.companyId,
        },
      },
      {
        prop: "cUndrClsCde",
        inputtype: "rtselect",
        title: "核保人级别",
        typeCode: "UNDR_CLS_CDE",
        codeParam: {},
        // typeCode: "KIND_LIST_CACHE",
        // codeParam: { codeListParam: "" },
      },
      {
        prop: "tDutyStrtTm",
        inputtype: "rtdatepicker",
        title: "任职起期",
      },
      {
        prop: "tDutyEndTm",
        inputtype: "rtdatepicker",
        title: "任职止期",
      },
    ],
  })
);

onMounted(async () => {});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

// 绑定特殊验证器
const exRules = {
  byrtInput: (rule: any, value: any, callback: any) => {
    const r = freeEditRef.value?.getFromValue();
    if (r["name"]) {
      callback();
    } else {
      callback("姓名");
    }
  },
};
function handleSelectionChange(rows: any[]) {
  selectedRows.value = rows;
}
function delSelectedUndrty(params: type) {
  if (!selectedRows.value.length) {
    ElMessage.error("请选择要删除的数据");
  } else {
    const param = selectedRows.value.map((item) => item.cPkId).join(",");
    let arrData = param.split(",");
    delSelectedUndrDtyInfo({ undrDtyPkIds: arrData })
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
  }
}
/** 查询 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  qryBatchUndrDtyList(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = [];
        pageresult.list = data.result;
        pageresult.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}

//给表单下拉项赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          for (let key in obj.btnItems) {
            item.btnItems[key] = obj.btnItems[key];
          }
        }else{
          Object.assign(item, obj);
        }
      }
    });
  }
}
</script>

<style scoped></style>

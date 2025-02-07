<!--商品配置-关联健康告知列表-->
<template>
  <div>
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
import { useDzModal } from "@/views/dzmodel/DzModalService";
import { getPlanBasePage } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { ref, reactive, onMounted } from "vue";
const healthNoticeAdd = defineAsyncComponent(
  () => import("./HealthNoticeAdd.vue")
);
import { query, getRiskList, saveCvrgRiskRel } from "@/api/prod";
const dzmodal = useDzModal();

import { useRoute } from "vue-router";
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");

const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "关联健康告知",
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
        func: () => {},
      }),
    ],
    fromSchema: [
      {
        prop: "CPlanNo",
        inputtype: "rtinput",
        title: "健康告知内容",
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
        id: "add-planConf",
        label: "健康告知模板",
        type: "success",
        func: function () {
          // dzmodal
          //   .open(AddPlanConfigurationModal, { type: "add", data: {} })
          //   .then((res) => {
          //     if (res.type === "ok") {
          //       handleQuery();
          //     }
          //   });
        },
      }),
      createFreeButtonBase({
        id: "export",
        label: "全量导入",
        type: "export",
        func: function () {
          // dzmodal
          //   .open(AddPlanConfigurationModal, { type: "add", data: {} })
          //   .then((res) => {
          //     if (res.type === "ok") {
          //       handleQuery();
          //     }
          //   });
        },
      }),
      createFreeButtonBase({
        id: "add-Notice",
        label: "新增告知",
        type: "success",
        func: function () {
          dzmodal
            .open(healthNoticeAdd, { type: "add", data: {} })
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
        link: true,
        tooltip: "查看",
        type: "success",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          console.log(row);
          dzmodal.open(factorEdit, { type: "view", data: row }).then((res) => {
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
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {
          console.log(row);
          dzmodal.open(factorEdit, { type: "edit", data: row }).then((res) => {
            if (res.type === "ok") {
              handleQuery();
            }
          });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cPlanNo",
        title: "健康告知显示顺序",
      },
      {
        prop: "cPlanCn",
        title: "健康告知类型",
      },
      {
        prop: "cProdNme",
        title: "健康告知内容",
      },
      {
        prop: "cOrigin",
        title: "状态",
      },
    ],
  })
);
const responsibilities = ref([
  { name: "责任A", code: "001" },
  { name: "责任B", code: "002" },
]);

const handleResponsibilityModalConfirm = (payload: any) => {
  if (payload.action === "confirm") {
    console.log("选中的责任:", payload.rows);
    saveSelectedResponsibilities(payload.rows);
  } else if (payload.action === "delete") {
    console.log("删除的责任:", payload.row);
  }
};
const handleSave = () => {
  handleQuery(); // 刷新table列表
};
// 保存选中的责任
const saveSelectedResponsibilities = (rows: Array<any>) => {
  {
    // 调用 saveCvrgRiskRel 接口
    saveCvrgRiskRel(rows)
      .then((res) => {
        const { code, data, msg } = res;
        if (code === 200) {
          ElMessage.success("保存成功");
          handleQuery(); // 刷新父组件的列表
        } else {
          ElMessage.error(msg);
        }
      })
      .catch((err) => {
        ElMessage.error("保存失败");
      });
  }
};
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
    if (e.prop === "cProdNo" || e.prop === "cKindNo") {
      e.disabled = true;
    }
  });
}
/** 查询 */
function handleQuery() {
  const r = tableRef.value?.getPartnerPage(); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  getPlanBasePage(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = data.data;
        pageresult.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
onMounted(() => {
  if (param.editType === "edit") {
    setDisa();
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

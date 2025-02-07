<!--健康告知-->
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
import { getUnbindHealthNotify } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useDzModal } from "@/views/dzmodel/DzModalService";
const dzmodal = useDzModal();
const RelatedHealthNoticModal = defineAsyncComponent(
  () => import("./RelatedHealthNoticModal.vue")
);
const AddHealthNoticeModal = defineAsyncComponent(
  () => import("./AddHealthNoticeModal.vue")
);
const opertaor = dataOpertaor();
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
  delHealthNotify,
} from "@/api/prod";

import { useRoute } from "vue-router";
// import { setTimeout } from "timers/promises";
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");

const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tabref = opertaor.getTableRefByKey("prodInfo");
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
        prop: "cDesc",
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
        id: "score",
        label: "关联健康告知",
        type: "success",
        func: function () {
          if (tabref.getFromValue().cProdNo == null) {
            ElMessage.error("产品代码为空,请保存后操作!");
            return;
          } else {
            dzmodal
              .open(RelatedHealthNoticModal, { type: "add", data: {} })
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
        label: "增加告知",
        type: "success",
        func: function () {
          dzmodal
            .open(AddHealthNoticeModal, { type: "add", data: {} })
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
          delHealthNotify(row)
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
        prop: "cDispCde",
        title: "显示码",
        inputtype: "rtinput",
      },
      {
        prop: "cDesc",
        title: "健康告知内容",
        inputtype: "rtinput",
      },
    ],
  })
);
const handleSave = () => {
  handleQuery(); // 刷新table列表
};
// 保存选中的责任
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
  const c = tabref.getFromValue().cProdNo;
  const param = Object.assign(s, r, { cProdNo: c });
  if (c == null) {
    ElMessage.error("产品代码为空,请保存后操作!");
    return;
  } else {
    getUnbindHealthNotify(param)
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
    }, 100);
    // setDisa();
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

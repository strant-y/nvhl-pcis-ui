<!-- 配置 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
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
const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { log } from "console";
const dzmodal = useDzModal();
//const searchPlanEcargo = defineAsyncComponent(() => import("./search-plan-ecargo.vue"));
const tableRef = ref<AppTableMethod | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          console.log("确认");
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          freeEditRef.value?.setFormValue({
            COpgrpCde: "",
          });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "业务机构",
        btnWidth: 10,
        itemWidth: 2,
        rules: [getRules("required", {})],
        param: { CDptCde: "" }, //待添加
        showExBtn: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            dzmodal
              .open(departmentTree, { type: "Issuer", data: {} })
              .then((res) => {
                if (res.type === "ok") {
                }
              });
          },
        },
      },
      {
        prop: "CLoadSub",
        inputtype: "rtcheckbox",
        title: "是否包含下级",
      },
      {
        prop: "cKindNo",
        inputtype: "rtcascader",
        typeCode: "KIND_LIST_CACHE",
        param: { cStatus: "1" },
        title: "产品大类",
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "产品",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "use_mrk" },
      },
      {
        prop: "",
        inputtype: "rtinput",
        title: "批改申请号",
      },
      {
        prop: "",
        inputtype: "rtinput",
        title: "保单号",
      },
      {
        prop: "",
        inputtype: "rtdatepicker",
        title: "批改申请日期",
        type: "daterange",
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
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    isPage: "false",
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtnFixed: "right",
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
            .open(chatsMgrEdit, { type: "edit", data: row })
            .then((res) => {
              if (res.type === "ok") {
                handleQuery();
              }
            });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CCoinsurerNme",
        inputtype: "rtinput",
        title: "保险公司",
      },
      {
        prop: "CAppNo",
        inputtype: "rtinput",
        title: "批改申请单号",
      },
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "保单号",
      },
      {
        prop: "CEdrNo",
        inputtype: "rtinput",
        title: "批单号",
      },
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
      },
      {
        prop: "CProdNmeCn",
        inputtype: "rtinput",
        title: "产品",
      },
      {
        prop: "TEdrAppTm",
        inputtype: "rtinput",
        title: "批改申请日期",
      },
      {
        prop: "ErrorMessage",
        inputtype: "rtinput",
        title: "失败原因",
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
</script>

<style scoped></style>

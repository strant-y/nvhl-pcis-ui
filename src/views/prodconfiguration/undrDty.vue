<!-- 核保人批量任职配置 -->
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

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { qryBatchUndrDtyList, delBatchUndrDtyInfo } from "@/api/prod";
import { template } from "lodash";
const dzmodal = useDzModal();

const undrEdit = defineAsyncComponent(() => import("./undrEdit.vue"));
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
        func: () => {},
      }),
      createFreeButtonBase({
        type: "primary",
        label: "删除所有",
        func: () => {},
      }),
    ],
    fromSchema: [
      {
        prop: "cDptCde",
        inputtype: "rtinput",
        title: "核保任职机构",
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
        clearable: true,
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "产品大类",
        clearable: true,
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "产品",
        clearable: true,
      },
      {
        prop: "cUndrClsCnm",
        inputtype: "rtdatetime",
        title: "任职起止期",
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

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "配置",
        type: "success",
        // icon: "Plus",
        func: function () {
          dzmodal.open(undrEdit, { type: "add", data: {} }).then((res) => {
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
        tooltip: "删除",
        type: "danger",
        size: "large",
        icon: "Delete",
        tableClick: (row) => {
          delBatchUndrDtyInfo(row)
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
        prop: "cEmpCde",
        inputtype: "rtinput",
        title: "员工代码",
      },
      {
        prop: "cDptCde",
        inputtype: "rtinput",
        title: "核保任职机构",
      },
      {
        prop: "cProdNo",
        inputtype: "rtinput",
        title: "产品",
      },
      {
        prop: "cUndrClsCde",
        inputtype: "rtinput",
        title: "核保人级别",
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
</script>

<style scoped></style>

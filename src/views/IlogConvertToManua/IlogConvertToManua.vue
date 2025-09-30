<!-- ILOG强制转人工 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef1" />
    <app-free-edit :freeEditConfig="formconfig2" ref="freeEditRef2" />
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

const freeEditRef1 = ref<AppFreeEditMethod | null>(null);
const freeEditRef2 = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { deleteFactorBykey, getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const kindEdit = defineAsyncComponent(() => import("./kindEdit.vue"));
const tableRef = ref<AppTableMethod | null>(null);
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "ILOG强制转人工核保申请",
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtinput",
        title: "转人工投保单\批改单号",
        labelWidth: 200,
        clearable: true,
      },
      {
        prop: "B",
        inputtype: "rtselect",
        title: "转人工状态",
        clearable: true,
        loadData :[
          { label:'是',value:1 },
          { label:'否',value:0 },
        ]
      },
    ],
  })
);

const formconfig2 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "ILOG强制转人工核保查询",
    fromSchema: [
    {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "机构部门",
        btnWidth: 10,
        itemWidth: 2,
        rules: [{ type: "required" }],
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
        prop: "cStatus",
        inputtype: "rtradio",
        title: "包含下级机构",
        loadData :[
          { label:'是',value:1 },
          { label:'否',value:0 },
        ]
      },
      {
        prop: "tm",
        inputtype: "rtdatepicker",
        title: "转人工申请日期",
        clearable: true,
        itemWidth: 2,
        type: "datetimerange",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
      },
      {
        prop: "cKindNo",
        inputtype: "rtinput",
        title: "申请单号",
        labelWidth: 200,
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
    editFlag: true,
    editList: ["cStatus"],

    fromSchema: [
      {
        prop: "a",
        inputtype: "rtinput",
        title: "单据类型",
        minWidth: 180,
        fixed: 'left',
      },
      {
        prop: "b",
        inputtype: "rtinput",
        title: "申请单号",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "是否转人工状态",
        minWidth: 180,
      },
      {
        prop: "d",
        inputtype: "rtdatepicker",
        title: "修改时间",
        minWidth: 180,
      },
      {
        prop: "e",
        inputtype: "rtinput",
        title: "修改人",
        minWidth: 180,
      },
      {
        prop: "f",
        inputtype: "rtdatepicker",
        title: "创建时间",
        minWidth: 180,
      },
      {
        prop: "g",
        inputtype: "rtinput",
        title: "创建人",
        minWidth: 180,
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
    const r = freeEditRef1.value?.getFromValue();
    if (r["name"]) {
      callback();
    } else {
      callback("姓名");
    }
  },
};

</script>

<style scoped></style>

<!-- 申请单查询 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
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
import { getAppPlyList } from "@/api/query";

const router = useRouter();
const componentEdit = defineAsyncComponent(() => import("./appPlyQuery.vue"));
const tableRef = ref<AppTableMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "申请单查询",
    production: true,
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
    ],
    fromSchema: [
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
        itemWidth: 1,
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
    title: "申请单列表",
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
          openPlyDtl(row);
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
      },
      {
        prop: "cAppCde",
        inputtype: "rtinput",
        title: "申请人",
      },
      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "机构",
        loadData: [
          {
            label: "营总销售团队1",
            value: "0251010013000",
          },
        ],
      },
      {
        prop: "cBsnsTyp",
        inputtype: "rtselect",
        title: "业务来源",
        typeCode: "CBsnsTypCode",
      },
      {
        prop: "tAppTm",
        inputtype: "rtinput",
        title: "申请时间",
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
function handleQuery() {
  const r = tableRef.value?.getPartnerPage(); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  getAppPlyList(param)
    .then((res) => {
      const { code, data, msg } = res;
      console.log("getAppPlyList-res", res);
      pageresult.list = data;
      pageresult.total = 10;
      ElMessage.success(msg);
    })
    .finally(() => {});
}


const openPlyDtl = (param: any) => {
  router.push({
    path: "/pcis/my-page",
    query: { param: JSON.stringify({...param, ...{pageType: "readonly"}}) }
  });
}

</script>

<style scoped></style>

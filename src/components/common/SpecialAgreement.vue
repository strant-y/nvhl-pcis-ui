<!-- 特别约定组件 -->
<template>
  <div class="app-container">
    <rt-mytable
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

import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import { deleteFactorBykey, getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const tableRef = ref<MyTableMethod | null>(null);
const kindEdit = defineAsyncComponent(
  () => import("@/components/common/commons/agreementList.vue")
);
const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
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
    title: "特别约定信息",
    showSelection: true,
    editFlag: true,
    editList: ["b"],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "新增",
        type: "success",
        func: function () {
          const data = {
            a: pageresult.list.length + 1,
          };
          data.a += 1;
          dzmodal.open(kindEdit, { type: "Issuer", data: data }).then((res) => {
            if (res.type === "ok") {
            } 
          });
        },
      }),
    ],
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {
          console.log(row);
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "删除",
        type: "danger",
        size: "large",
        icon: "Delete",
        tableClick: (row) => {
          const list = tableRef.value?.getFromValue() || pageresult.list;
          const i = list.findIndex((item) => item.id === row.id);
          if (i !== -1) list.splice(i, 1);
        },
      }),
    ],
    fromSchema: [
      {
        prop: "a",
        inputtype: "rtinput",
        title: "序号",
        dragFlag: true,
      },
      {
        prop: "b",
        inputtype: "rtinput",
        type: "textarea",
				title: "特约内容",
				align: "left",
        rows: 2,
        dragFlag: true,
      },
    ],
  })
);

onMounted(async () => {
  // 获取列表数据
  handleQuery(true);
  tableRef.value?.setFormValue([
    { id: 12, a: "ss", b: "2342" },
    { id: 11, a: "asdas", b: "43" },
  ]);
});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

/** 查询 */
function handleQuery(flag?: boolean) {
  // const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  // const param = Object.assign(r);
  // getBasicKindList(param)
  //   .then((res) => {
  //     const { code, data, msg } = res;
  //     if (200 === code) {
  //       pageresult.list = [];
  //       pageresult.list = data.result;
  //       pageresult.total = data.total;
  //     } else {
  //       ElMessage.error(msg);
  //     }
  //   })
  //   .finally(() => {});
}
</script>

<style scoped></style>

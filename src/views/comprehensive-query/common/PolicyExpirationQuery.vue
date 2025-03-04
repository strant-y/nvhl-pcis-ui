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
import { useUserStore } from "@/store";
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
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { deleteFactorBykey, getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
);
// const TaskListVestige = defineAsyncComponent(
//   () => import("@/views/pcis-new-udr-list/common/TaskListVestige.vue")
// );
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
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
          freeEditRef.value?.setFormValue({
            cKindNo: "",
            cStatus: "",
          });
          handleQuery();
          // freeEditRef.value?.resetForm();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "orgCde",
        inputtype: "rtselect",
        title: "核保机构",
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
        isShow: false,
        loadData: [
          { label: "是", value: 1 },
          { label: "否", value: 0 },
        ],
      },
      {
        prop: "objday",
        inputtype: "rtnumber",
        min: 0,
        title: "保单到期剩余天数",
        rules: [getRules("required", {})],
        clearable: true,
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "KIND_LIST_GRT",
        params: { cOperId: user.value.opCde, cDptCde: user.value.companyId },
        clearable: true,
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "产品",
        typeCode: "PROD_LIST_GRT",
        params: {
          cParCde: "",
          cOperId: user.value.opCde,
          cDptCde: user.value.companyId,
        },
        clearable: true,
      },
      {
        prop: "objId",
        inputtype: "rtinput",
        title: "保单号",
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
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "查看",
        type: "danger",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          // dzmodal
          //     .open(TaskListVestige, { type: "Issuer", data: {} })
          //     .then((res) => {
          //       if (res.type === "ok") {
          //       }
          //     });
        },
      }),
    ],

    fromSchema: [
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "机构",
      },
      {
        prop: "cProdNmeCn",
        inputtype: "rtinput",
        title: "产品",
      },
      {
        prop: "nExpirationDays",
        inputtype: "rtinput",
        title: "保单到期剩余天数",
      },
    ],
  })
);

onMounted(async () => {
  pageresult.list = [{}];
});

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
  getBasicKindList(param)
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

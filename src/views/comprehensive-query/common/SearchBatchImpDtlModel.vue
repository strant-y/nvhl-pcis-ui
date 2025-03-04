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
import { getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
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
        prop: "cBatchNo",
        inputtype: "rtinput",
        title: "批次号",
        clearable: true,
      },
      {
        prop: "cStatus",
        inputtype: "rtinput",
        title: "状态",
        clearable: true,
        loadData: [
          { label: "失败", value: 1 },
          { label: "成功", value: 0 },
        ],
      },
      {
        prop: "cApplicantNme",
        inputtype: "rtinput",
        title: "投保人名称",
        clearable: true,
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
        clearable: true,
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        clearable: true,
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
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
          //     .open('组件', { type: "Issuer", data: {} })
          //     .then((res) => {
          //       if (res.type === "ok") {
          //       }
          //     });
        },
      }),
    ],

    fromSchema: [
      {
        prop: "cBatchNo",
        inputtype: "rtinput",
        title: "批次号",
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "投保单号",
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
      },
      {
        prop: "cApplicantNme",
        inputtype: "rtinput",
        title: "投保人名称",
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
      },
      {
        prop: "cMsg",
        inputtype: "rtinput",
        title: "消息",
      },
      {
        prop: "cStatus",
        inputtype: "rtinput",
        title: "状态",
      },
    ],
  })
);

onMounted(async () => {
  pageresult.list = [{}, {}];
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

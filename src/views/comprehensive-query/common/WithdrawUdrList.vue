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
        prop: "appCde",
        inputtype: "rtinput",
        title: "投保人",
        clearable: true,
      },
      {
        prop: "objId",
        inputtype: "rtinput",
        title: "申请单号",
        clearable: true,
      },
      {
        prop: "dateRange",
        inputtype: "rtdatepicker",
        title: "投保日期",
        itemWidth: 2,
        clearable: true,
        type: "datetimerange",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
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
        tooltip: "撤回",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {},
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "承保流程",
        type: "danger",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          dzmodal
            .open(TaskListVestige, { type: "Issuer", data: {} })
            .then((res) => {
              if (res.type === "ok") {
              }
            });
        },
      }),
    ],

    fromSchema: [
      {
        prop: "objId",
        inputtype: "rtinput",
        title: "投保单号",
      },
      {
        prop: "uwDptName",
        inputtype: "rtinput",
        title: "承保机构",
      },
      {
        prop: "prodName",
        inputtype: "rtinput",
        title: "产品名称",
      },
      {
        prop: "appCde",
        inputtype: "rtinput",
        title: "投保人",
      },
      {
        prop: "bsTm1",
        inputtype: "rtdatepicker",
        title: "投保日期",
      },
      {
        prop: "preUserName",
        inputtype: "rtinput",
        title: "任务提交人",
      },
      {
        prop: "preDptName",
        inputtype: "rtinput",
        title: "任务提交部门",
        minWidth: 220,
      },
      {
        prop: "crtTm",
        inputtype: "rtdatepicker",
        title: "提交时间",
      },
      {
        prop: "curtUserName",
        inputtype: "rtinput",
        title: "任务接收人",
      },
      {
        prop: "state",
        inputtype: "rtinput",
        title: "任务状态",
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

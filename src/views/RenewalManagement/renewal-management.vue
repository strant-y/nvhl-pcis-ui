<!-- 配置 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @selection-change="handleSelectionChange"
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
    title: "续保管理",
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
          handleQuery(true);
          // freeEditRef.value?.resetForm();
        },
      }),
      createFreeButtonBase({
        label: "导出",
        func: () => {},
      }),
    ],
    fromSchema: [
      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "机构部门",
        rules: [getRules("required", {})],
        btnWidth: 10,
        itemWidth: 2,
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
        loadData: [
          { label: "是", value: 1 },
          { label: "否", value: 0 },
        ],
      },
      {
        prop: "tm",
        inputtype: "rtdatepicker",
        title: "保险起止期",
        rules: [getRules("required", {})],
        itemWidth: 2,
        clearable: true,
        type: "datetimerange",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "条款",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "use_mrk" },
        clearable: true,
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "产品",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "use_mrk" },
        clearable: true,
      },
      {
        prop: "appCde",
        inputtype: "rtinput",
        title: "投保人名称",
        clearable: true,
      },
      {
        prop: "appCde",
        inputtype: "rtinput",
        title: "投保单号",
        clearable: true,
      },
      {
        prop: "appCde",
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
    tableBtnWidth: 140,
    tableBtnPosition: "right",
    tableBtnFixed: "right",
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
          dzmodal.open(kindEdit, { type: "edit", data: row }).then((res) => {
            if (res.type === "ok") {
              // handleQuery();
            }
          });
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "一键续保",
        type: "success",
        size: "large",
        icon: "Document",
        tableClick: (row) => {},
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "跳转",
        type: "success",
        size: "large",
        icon: "Document",
        tableClick: (row) => {},
      }),
    ],

    fromSchema: [
      {
        prop: "a",
        inputtype: "rtinput",
        title: "二级机构",
        minWidth: 180,
        fixed: "left",
      },
      {
        prop: "b",
        inputtype: "rtinput",
        title: "三级机构",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "投保单号",
        minWidth: 180,
      },
      {
        prop: "d",
        inputtype: "rtinput",
        title: "保单号",
        minWidth: 180,
      },
      {
        prop: "d",
        inputtype: "rtinput",
        title: "投保人姓名",
        minWidth: 180,
      },
      {
        prop: "d",
        inputtype: "rtinput",
        title: "条款",
        minWidth: 180,
      },
      {
        prop: "d",
        inputtype: "rtinput",
        title: "保额",
        minWidth: 180,
      },
      {
        prop: "d",
        inputtype: "rtinput",
        title: "保险起止日期",
        minWidth: 180,
      },
    ],
  })
);

onMounted(async () => {
  //首页跳转过来的逻辑 Start
  if (sessionStorage.getItem("renewPolicy")) {
    //首页 暂存任务跳转过来的,选中投保单
    const homeJumpData = JSON.parse(sessionStorage.getItem("renewPolicy"));
    await nextTick();
    freeEditRef.value.setValue("tm", [
      homeJumpData.startBsTm1,
      homeJumpData.endBsTm1,
    ]);
    if (homeJumpData.hasOwnProperty("objId")) {
      //投保单号
      freeEditRef.value.setValue("appCde", homeJumpData.objId);
    }
  }
  //首页跳转过来的逻辑 End
});
onUnmounted(() => {
  //组件销毁，清除sessionStorage数据
  sessionStorage.getItem("renewPolicy") &&
    sessionStorage.removeItem("renewPolicy");
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

const handleQuery = (flag = true) => {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      refreshData(flag);
    } else {
      ElMessage.error("请填写必填项");
    }
  });
};

/** 查询 */
function refreshData(flag?: boolean) {
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

// 多选事件
function handleSelectionChange(selection: any) {
  console.log("selection", selection);
  removeIds.value = selection.map((item: any) => item.cPkId);
}
</script>

<style scoped></style>

<!-- 配置 -->
<template>
  <div class="app-container">
    <el-tabs @tab-click="handleTabClick" v-model="activeName">
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.key"
        :label="tab.name"
        :name="tab.key"
      >
        <div v-if="Number(tab.key) <= 4">
          <app-free-edit
            :freeEditConfig="formconfig1"
            :ref="freeEditRef[Number(tab.key) - 1]"
          />
          <app-table
            :tableConfig="tableconfig"
            v-model:pageresult="pageresult"
            :ref="'tableRef' + currentTabKey"
            @selection-change="handleSelectionChange"
            @page-change="handleQuery(false)"
          />
        </div>

        <template v-if="Number(tab.key) == 5">
          <withdraw-udrList></withdraw-udrList>
        </template>
        <template v-if="Number(tab.key) == 6">
          <return-udrList :homeJumpData="homeJumpData"></return-udrList>
        </template>
        <template v-if="Number(tab.key) == 7">
          <policy-expirationQuery></policy-expirationQuery>
        </template>
        <template v-if="Number(tab.key) == 8">
          <search-batchImpDtl-model></search-batchImpDtl-model>
        </template>
        <template v-if="Number(tab.key) == 9">
          <combination-query></combination-query>
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { AppKey } from "@/constants/api";
import { useUserStore } from "@/store";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

import { ref, watch } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
const freeEditRef = ref([
  ref<AppFreeEditMethod | null>(null),
  ref<AppFreeEditMethod | null>(null),
  ref<AppFreeEditMethod | null>(null),
  ref<AppFreeEditMethod | null>(null),
]);
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
import { now } from "lodash";
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });

const activeName = ref("1");
const homeJumpData = ref({}); //接收首页的参数，用于查询条件回显

// 变更列
const colChange = defineAsyncComponent(() => import("../modal/colChange.vue"));
// tab操作按钮
const kindEdit = defineAsyncComponent(
  // 编辑 查看
  () => import("../modal/kindEdit.vue")
);
const PrintView = defineAsyncComponent(
  // 单据打印
  () => import("../modal/PrintView.vue")
);
const EpolicyQueryGrpDialog = defineAsyncComponent(
  // 团单成员
  () => import("../modal/EpolicyQueryGrpDialog.vue")
);
const HistoryClaimcaseModel = defineAsyncComponent(
  // 历史赔案
  () => import("../modal/history-claimcase-model.vue")
);
const TaskListVestige = defineAsyncComponent(
  // 任务痕迹
  () => import("../modal/TaskListVestige.vue")
);
const UndrOpnList = defineAsyncComponent(
  // 核保信息
  () => import("../modal/UndrOpnList.vue")
);

const tableRef = ref([
  ref<AppTableMethod | null>(null),
  ref<AppTableMethod | null>(null),
  ref<AppTableMethod | null>(null),
  ref<AppTableMethod | null>(null),
]);
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
);

// tab 页面切换 5-9
const WithdrawUdrList = defineAsyncComponent(
  // 投保待撤回任务
  () => import("../common/WithdrawUdrList.vue")
);
const ReturnUdrList = defineAsyncComponent(
  // 待修改单查询
  () => import("../common/ReturnUdrList.vue")
);
const PolicyExpirationQuery = defineAsyncComponent(
  // 保单到期查询
  () => import("../common/PolicyExpirationQuery.vue")
);
const SearchBatchImpDtlModel = defineAsyncComponent(
  // 批量导入查询
  () => import("../common/SearchBatchImpDtlModel.vue")
);
const CombinationQuery = defineAsyncComponent(
  // 产品组合出单查询
  () => import("../common/CombinationQuery.vue")
);

const tabs = ref<Array<any>>([
  {
    name: "询价单",
    key: "1",
  },
  {
    name: "投保单",
    key: "2",
  },
  {
    name: "保单",
    key: "3",
  },
  {
    name: "批单",
    key: "4",
  },
  {
    name: "投保待撤回任务",
    key: "5",
  },
  {
    name: "待修改单查询",
    key: "6",
  },
  {
    name: "保单到期查询",
    key: "7",
  },
  {
    name: "批量导入查询",
    key: "8",
  },
  {
    name: "产品组合出单查询",
    key: "9",
  },
]); //tabs数组
const currentTabName = ref("暂存任务"); //tabs默认值
const currentTabKey = ref(0); //tabs默认值

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
          handleQuery(true);
          // freeEditRef.value?.resetForm();
        },
      }),
      createFreeButtonBase({
        label: "导出",
        func: () => {},
      }),
      createFreeButtonBase({
        label: "变更列",
        func: () => {
          dzmodal
            .open(colChange, { type: "edit", data: modalForm })
            .then((res) => {
              if (res.type === "ok") {
                tableCol.value.map((item) => {
                  res.body.arr.forEach((e: any) => {
                    if (item.prop == e) {
                      tableObj.notWaitObj.fromSchema.push(item);
                    }
                  });
                });
                handleQuery(true);
              }
            });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "查询条件",
        clearable: true,
      },
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
        loadData: [
          { label: "是", value: 1 },
          { label: "否", value: 0 },
        ],
      },
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "二级分公司",
        clearable: true,
      },
      {
        prop: "CPlyNo",
        inputtype: "rtselect",
        title: "列表类型",
        clearable: true,
        loadData: [
          { label: "全部", value: "app" },
          { label: "最新", value: "ply" },
        ],
      },
      {
        prop: "CProdCatCde",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "KIND_LIST_GRT",
        params: { cOperId: user.value.opCde, cDptCde: user.value.companyId },
        clearable: true,
      },
      {
        prop: "CProdCatCde",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "KIND_LIST_GRT",
        params: { cOperId: user.value.opCde, cDptCde: user.value.companyId },
        clearable: true,
      },
      {
        prop: "bsType",
        inputtype: "rtselect",
        title: "状态",
        loadData: [
          { label: "投保单", value: "A" },
          { label: "批改申请单", value: "E" },
          { label: "方案", value: "P" },
        ],
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
        title: "询价单号",
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
        title: "保单号/批单号",
        clearable: true,
      },
      {
        prop: "bsType",
        inputtype: "rtselect",
        title: "申请单类型",
        minWidth: 180,
        loadData: [
          { label: "投保单", value: "A" },
          { label: "批改申请单", value: "E" },
        ],
      },
      {
        prop: "appCde",
        inputtype: "rtinput",
        title: "被保人名称",
        clearable: true,
      },
      {
        prop: "tm1",
        inputtype: "rtdatepicker",
        title: "签单日期",
        clearable: true,
        type: "daterange",
      },
    ],
    showSuperior: true,
    superFromSchema: [
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        title: "人员姓名",
        clearable: true,
      },
      {
        prop: "objId",
        inputtype: "rtinput",
        title: "证件号",
        clearable: true,
      },
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "车牌号",
        clearable: true,
      },
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "发动机号",
        clearable: true,
      },
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "工程类型",
        clearable: true,
      },
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "工程名称",
        clearable: true,
      },
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "工程地址",
        clearable: true,
      },
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "行业类型",
        clearable: true,
      },
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "经营地址",
        clearable: true,
      },
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "项目大类",
        clearable: true,
      },
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "项目中类",
        clearable: true,
      },
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "项目子类",
        clearable: true,
      },
    ],
  })
);

// {
//         prop: "undrClsCde",
//         inputtype: "rtselect",
//         title: "核保级别",
//         typeCode: "WEB_SYS_STA_DICT",
//         params: { cDptCde: user.value.companyId, cEmpCde: user.value.opCde },
//         clearable: true,
//       },
//       {
//         prop: "prodNo",
//         inputtype: "rtinput",
//         title: "条款",
//         typeCode: "CVRG_TERM_LIST",
//         params: { cvrgNo: 'empty' },
//         labelWidth: 200,
//         clearable: true,
//       },
//       {
//         prop: "CAppNme",
//         inputtype: "rtinput",
//         title: "投保人名称",
//         clearable: true,
//       },

//       {
//         prop: "objId",
//         inputtype: "rtinput",
//         title: "申请单号",
//         clearable: true,
//       },
//       {
//         prop: "CPlyNo",
//         inputtype: "rtinput",
//         title: "保单号",
//         clearable: true,
//       },

//       {
//         prop: "tm2",
//         inputtype: "rtdatepicker",
//         title: "提核日期",
//         clearable: true,
//         type: "daterange",
//       },
const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const modalForm = [
  {
    prop: "bsType",
    inputtype: "rtcheckboxgroup",
    title: "",
    itemWidth: 3,
    loadData: [
      { label: "保单", value: "a" },
      { label: "批单", value: "b" },
      { label: "批改序号", value: "c" },
      { label: "机构", value: "d" },
      { label: "二级分公司", value: "e" },
      { label: "产品", value: "f" },
      { label: "条款", value: "g" },
      { label: "核保人", value: "h" },
      { label: "核保通过日期", value: "i" },
      { label: "状态", value: "j" },
      { label: "项目大类", value: "k" },
      { label: "项目中类", value: "l" },
      { label: "项目子类", value: "m" },
      { label: "询价单号", value: "n" },
    ],
  },
];

// 变更列数据
const tableCol = ref<Array<any>>([
  { title: "保单", prop: "a", inputtype: "rtinput", minWidth: 180 },
  { title: "批单", prop: "b", inputtype: "rtinput", minWidth: 180 },
  { title: "批改序号", prop: "c", inputtype: "rtinput", minWidth: 180 },
  { title: "机构", prop: "d", inputtype: "rtinput", minWidth: 180 },
  { title: "二级分公司", prop: "e", inputtype: "rtinput", minWidth: 180 },
  { title: "产品", prop: "f", inputtype: "rtinput", minWidth: 180 },
  { title: "条款", prop: "g", inputtype: "rtinput", minWidth: 180 },
  { title: "核保人", prop: "h", inputtype: "rtinput", minWidth: 180 },
  {
    title: "核保通过日期",
    prop: "i",
    inputtype: "rtdatepicker",
    minWidth: 180,
  },
  { title: "状态", prop: "j", inputtype: "rtinput", minWidth: 180 },
  { title: "项目大类", prop: "k", inputtype: "rtinput", minWidth: 180 },
  { title: "项目中类", prop: "l", inputtype: "rtinput", minWidth: 180 },
  { title: "项目子类", prop: "m", inputtype: "rtinput", minWidth: 180 },
  { title: "询价单号", prop: "n", inputtype: "rtinput", minWidth: 180 },
]);

const formobj = {
  // 查询单 投保单 保单 批单 针对不同tab的查询项
  form1: {
    url: "",
  },
  form2: {
    url: "",
  },
  form3: {
    url: "",
  },
  form4: {
    url: "",
  },
};

const tableObj = {
  // 查询单 投保单 保单 批单
  notWaitObj: {
    // 默认好像就2个不参与显示/隐藏
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
        tableClick: (row) => {},
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {
          console.log(row);
          dzmodal.open(kindEdit, { type: "edit", data: row }).then((res) => {
            if (res.type === "ok") {
              handleQuery();
            }
          });
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "删除",
        type: "danger",
        size: "large",
        icon: "Delete",
        tableClick: (row) => {},
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "单据打印",
        type: "danger",
        size: "large",
        icon: "Delete",
        tableClick: (row) => {
          dzmodal
            .open(PrintView, { type: "edit", data: modalForm })
            .then((res) => {
              if (res.type === "ok") {
                console.log("res", res);
                handleQuery(true);
              }
            });
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "团单成员",
        type: "danger",
        size: "large",
        icon: "Delete",
        tableClick: (row) => {
          dzmodal
            .open(EpolicyQueryGrpDialog, { type: "edit", data: modalForm })
            .then((res) => {
              if (res.type === "ok") {
                console.log("res", res);
                handleQuery(true);
              }
            });
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "历史赔案",
        type: "danger",
        size: "large",
        icon: "Delete",
        tableClick: (row) => {
          dzmodal
            .open(HistoryClaimcaseModel, { type: "edit", data: modalForm })
            .then((res) => {
              if (res.type === "ok") {
                console.log("res", res);
                handleQuery(true);
              }
            });
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "任务痕迹",
        type: "danger",
        size: "large",
        icon: "Delete",
        tableClick: (row) => {
          dzmodal
            .open(TaskListVestige, { type: "edit", data: modalForm })
            .then((res) => {
              if (res.type === "ok") {
                console.log("res", res);
                handleQuery(true);
              }
            });
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "核保信息",
        type: "danger",
        size: "large",
        icon: "Delete",
        tableClick: (row) => {
          dzmodal
            .open(UndrOpnList, { type: "edit", data: modalForm })
            .then((res) => {
              if (res.type === "ok") {
                console.log("res", res);
                handleQuery(true);
              }
            });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cAppNo",
        inputtype: "table",
        title: "保额",
      },
      {
        prop: "cAppNo",
        inputtype: "table",
        title: "保费",
      },
    ],
  },
};

let tableconfig = reactive<AppTableConfig>(
  createTableEditConfig(tableObj.notWaitObj)
);

//tabs切换
const handleTabClick = (tab: any) => {
  currentTabName.value = tab.props.label;
  const i = tabs.value.findIndex((item) => item.name === tab.props.label);
  currentTabKey.value = i;
  console.log("keys", currentTabKey.value);
  let url = "";
  if (Number(i) <= 3) {
    tableconfig = reactive<AppTableConfig>(
      createTableEditConfig(tableObj.notWaitObj)
    );
  }
  tabs.value.forEach((item) => {
    if (item.name === tab.props.label) {
      url = item.url;
    }
  });
};

onMounted(async () => {
  pageresult.list = [{}];

  //首页跳转过来的逻辑 Start
  if (sessionStorage.getItem(AppKey.query.pcis_query_app)) {
    //首页 暂存任务跳转过来的,选中投保单
    homeJumpData.value = JSON.parse(
      sessionStorage.getItem(AppKey.query.pcis_query_app)
    );
    activeName.value = "2";
    await nextTick();
    freeEditRef.value[1].value[0].setValue("bsType", "A");
    freeEditRef.value[1].value[0].setValue("tm1", [
      homeJumpData.value.TIssueTmStart,
      homeJumpData.value.TIssueTmEnd,
    ]);
    if (homeJumpData.value.hasOwnProperty("CAppNo")) {
      //投保单号
      freeEditRef.value[1].value[0].setValue(
        "appCde",
        homeJumpData.value.CAppNo
      );
    }
    await nextTick();
    handleQuery(true); //跳转过来自动查数据
  } else if (sessionStorage.getItem(AppKey.query.pcis_query_returnudrlist)) {
    //首页 待修改任务跳转过来的，选中待修改单
    homeJumpData.value = JSON.parse(
      sessionStorage.getItem(AppKey.query.pcis_query_returnudrlist)
    );
    activeName.value = "6";
  }
  //首页跳转过来的逻辑 End
});
onUnmounted(() => {
  //组件销毁，清除sessionStorage数据
  sessionStorage.getItem(AppKey.query.pcis_query_app) &&
    sessionStorage.removeItem(AppKey.query.pcis_query_app);
  sessionStorage.getItem(AppKey.query.pcis_query_returnudrlist) &&
    sessionStorage.removeItem(AppKey.query.pcis_query_returnudrlist);
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
  // 此处数组ref赋值，获取都有问题，暂时隐藏
  console.log("tableRef", tableRef);
  console.log("freeEditRef", freeEditRef);
  // const tableRefs = tableRef.value[currentTabKey.value];
  // const freeEditRefs = freeEditRef.value[currentTabKey.value];
  // const r = tableRefs.value?.getPartnerPage(flag); //获取分页数据
  // const s = freeEditRefs.value?.getFromValue(); //获取表单数据
  // const param = Object.assign(s, r);
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

// 多选事件
function handleSelectionChange(selection: any) {
  console.log("selection", selection);
  removeIds.value = selection.map((item: any) => item.cPkId);
}
</script>

<style scoped></style>

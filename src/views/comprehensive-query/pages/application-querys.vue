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
        <!--<div v-if="Number(tab.key) <= 4">-->
          <!--<app-free-edit-->
            <!--:freeEditConfig="formconfig1"-->
            <!--:ref="freeEditRef[Number(tab.key) - 1]"-->
          <!--/>-->
          <!--<app-table-->
            <!--:tableConfig="tableconfig"-->
            <!--v-model:pageresult="pageresult"-->
            <!--:ref="tableRef[Number(tab.key) - 1]"-->
            <!--@selection-change="handleSelectionChange"-->
            <!--@page-change="handleQuery(false)"-->
          <!--/>-->
        <!--</div>-->
        <template v-if="Number(tab.key) == 1">
          <Inquiry-Sheet
                  :refreshData="nowTab === 0 ? true : false"
          ></Inquiry-Sheet>
        </template>
        <template v-if="Number(tab.key) == 2">
          <Applicant-Query
                  :refreshData="nowTab === 1 ? true : false"
          ></Applicant-Query>
        </template>
        <template v-if="Number(tab.key) == 3">
          <Ply-Query
                  :refreshData="nowTab === 2 ? true : false"
          ></Ply-Query>
        </template>
        <template v-if="Number(tab.key) == 4">
          <Edr-Query
                  :refreshData="nowTab === 3 ? true : false"
          ></Edr-Query>
        </template>
        <template v-if="Number(tab.key) == 5">
          <withdraw-udrList
            :refreshData="nowTab === 4 ? true : false"
          ></withdraw-udrList>
        </template>
        <template v-if="Number(tab.key) == 6">
          <return-udrList
            :refreshData="nowTab === 5 ? true : false"
            :homeJumpData="homeJumpData"
          ></return-udrList>
        </template>
        <template v-if="Number(tab.key) == 7">
          <policy-expirationQuery
            :refreshData="nowTab === 6 ? true : false"
          ></policy-expirationQuery>
        </template>
        <template v-if="Number(tab.key) == 8">
          <search-batchImpDtl-model
            :refreshData="nowTab === 7 ? true : false"
          ></search-batchImpDtl-model>
        </template>
        <template v-if="Number(tab.key) == 9">
          <combination-query
            :refreshData="nowTab === 8 ? true : false"
          ></combination-query>
        </template>
        <template v-if="Number(tab.key) == 10">
          <e-policy-query
            :refreshData="nowTab === 9 ? true : false"
          ></e-policy-query>
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
import { deleteFactorBykey, getBasicKindList, query } from "@/api/prod";
import { getAppPolicyList, qryEndorseList, delTmpPolicy } from "@/api/query";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
import { now } from "lodash";
import { useRoute } from "vue-router";
import moment, { localeData } from "moment";
import dayjs from "dayjs";
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });
const route = useRoute();
const router = useRouter();
const activeName = ref("1");
const queryType = ref("1");
const homeJumpData = ref({}); //接收首页的参数，用于查询条件回显
let addrowArr = [
  "cAppNo",
  "cPlyNo",
  "cEdrNo",
  "cDptCnm",
  "cSecondDptCnm",
  "cProdNmeCn",
  "cTermNme",
  "cUdrNme",
  "tUdrTm",
];
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
// const departmentTree = defineAsyncComponent(
//   () => import("@/components/common/DepartmentTree.vue")
// );
// import DepartmentTree from "../commodityRef/DepartmentTree.vue";
import DepartmentTree from "@/pcis/prodRef/commodityRef/DepartmentTree.vue";

// tab 页面切换 1-9
const InquirySheet = defineAsyncComponent(
    // 投保待撤回任务
    () => import("../common/InquirySheetQuery.vue")
);
// tab 页面切换 2-9
const ApplicantQuery = defineAsyncComponent(
    // 投保待撤回任务
    () => import("../common/ApplicantQuery.vue")
);
// tab 页面切换 3-9
const PlyQuery = defineAsyncComponent(
    // 综合查询保单
    () => import("../common/PlyQuery.vue")
);
// tab 页面切换 4-9
const EdrQuery = defineAsyncComponent(
    // 投保待撤回任务
    () => import("../common/EdrQuery.vue")
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
const EPolicyQuery = defineAsyncComponent(
  // 生成电子保单查询
  () => import("../common/EPolicyQuery.vue")
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
  {
    name: "生成电子保单查询",
    key: "10",
  }
]); //tabs数组
const currentTabName = ref("暂存任务"); //tabs默认值
const currentTabKey = ref(0); //tabs默认值
const nowTab = ref(1);
const cPard = ref(null);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          const freeEditRefs = freeEditRef.value[currentTabKey.value];
          freeEditRefs.value[0].validate().then((isValid) => {
            if (isValid) {
              handleQuery();
            }
          });
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          const freeEditRefs = freeEditRef.value[currentTabKey.value];
          const s = freeEditRefs.value[0].getFromValue(); //获取表单数据
          for (const k in s) {
            s[k] = null;
          }
          // handleQuery(true);
          // freeEditRef.value?.resetForm();
        },
      }),
      createFreeButtonBase({
        label: "导出",
        func: () => {},
      }),
      createFreeButtonBase({
        label: "展开",
        func: () => {
          const freeEditRefs = freeEditRef.value[currentTabKey.value];
          const s = freeEditRefs.value[0].getFromValue(); //获取表单数据
          if (s["cKindNo"] == "09") {
            formconfig1.fromSchema?.forEach((item) => {
              if (
                item.prop === "CProjectName" ||
                item.prop === "CDetailedAddress" ||
                item.prop === "cPrjCtgTyp" ||
                item.prop === "cPrjCtgMidTyp" ||
                item.prop === "cPrjCtgSubTyp"
              ) {
                item.hidden = false;
              }
              if (item.prop === "CDetailedAddress") {
                item.title = "工程地址";
              }
            });
          } else if (s["cKindNo"] == "08") {
            formconfig1.fromSchema?.forEach((item) => {
              if (
                item.prop === "CDetailedAddress" ||
                item.prop === "cPrjCtgTyp" ||
                item.prop === "cPrjCtgMidTyp" ||
                item.prop === "cPrjCtgSubTyp"
              ) {
                item.hidden = false;
              }
              if (item.prop === "CDetailedAddress") {
                item.title = "家庭坐落地址";
              }
            });
          } else if (s["cKindNo"] == "04") {
            if (s["cProdNo"] == "040002") {
              formconfig1.fromSchema?.forEach((item) => {
                if (
                  item.prop === "CEmployeeName" ||
                  item.prop === "CIdentificationNumber" ||
                  item.prop === "CPlateNo" ||
                  item.prop === "CEngineNo" ||
                  item.prop === "cPrjCtgTyp" ||
                  item.prop === "cPrjCtgMidTyp" ||
                  item.prop === "cPrjCtgSubTyp"
                ) {
                  item.hidden = false;
                }
                if (item.prop === "CEmployeeName") {
                  item.title = "雇员名称";
                }
              });
            } else if (s["cProdNo"] == "043009") {
              formconfig1.fromSchema?.forEach((item) => {
                if (
                  item.prop === "CEmployeeName" ||
                  item.prop === "CIndustryType" ||
                  item.prop === "CProjectType" ||
                  item.prop === "CProjectName" ||
                  item.prop === "CDetailedAddress" ||
                  item.prop === "CIdentificationNumber" ||
                  item.prop === "cPrjCtgTyp" ||
                  item.prop === "cPrjCtgMidTyp" ||
                  item.prop === "cPrjCtgSubTyp"
                ) {
                  item.hidden = false;
                }
                if (item.prop === "CEmployeeName") {
                  item.title = "人员姓名";
                }
                if (item.prop === "CDetailedAddress") {
                  item.title = "经营地址";
                }
              });
            } else {
              formconfig1.fromSchema?.forEach((item) => {
                if (
                  item.prop === "cPrjCtgTyp" ||
                  item.prop === "cPrjCtgMidTyp" ||
                  item.prop === "cPrjCtgSubTyp"
                ) {
                  item.hidden = false;
                }
              });
            }
          }
        },
      }),
      createFreeButtonBase({
        label: "变更列",
        func: () => {
          modalForm[0].loadData.forEach((i: any) => {
            tableObj.notWaitObj.fromSchema.forEach((s: any) => {
              if (i.value == s.prop) {
                i.checked = true;
              }
            });
          });
          dzmodal
            .open(colChange, { type: "edit", data: modalForm })
            .then((res) => {
              if (res.type === "ok") {
                const propArr = [];
                tableObj.notWaitObj.fromSchema.forEach((s: any) => {
                  propArr.push(s.prop);
                });
                const delrowArr = [];
                if (addrowArr.length === 0) {
                  addrowArr = [...res.body];
                } else {
                  for (let i = addrowArr.length - 1; i >= 0; i--) {
                    const element = addrowArr[i];
                    if (!res.body.includes(element)) {
                      delrowArr.push(element);
                      addrowArr.splice(i, 1); // 从后往前删除，避免索引偏移
                    }
                  }
                  addrowArr = [...new Set([...addrowArr, ...res.body])];
                  modalForm[0].loadData.forEach((i: any) => {
                    delrowArr.forEach((s: any) => {
                      if (i.value == s) {
                        i.checked = false;
                      }
                    });
                  });
                }
                if (delrowArr.length == "0") {
                  tableCol.value.map((item) => {
                    res.body.forEach((e: any) => {
                      if (item.prop == e && propArr.indexOf(e) < 0) {
                        tableObj.notWaitObj.fromSchema.push(item);
                      }
                    });
                  });
                } else {
                  for (
                    let i = tableObj.notWaitObj.fromSchema.length - 1;
                    i >= 0;
                    i--
                  ) {
                    const element = tableObj.notWaitObj.fromSchema[i].prop;
                    if (delrowArr.includes(element)) {
                      tableObj.notWaitObj.fromSchema.splice(i, 1); // 从后往前删除，避免索引偏移
                    }
                  }
                  tableCol.value.map((item) => {
                    res.body.forEach((e: any) => {
                      if (item.prop == e && propArr.indexOf(e) < 0) {
                        tableObj.notWaitObj.fromSchema.push(item);
                      }
                    });
                  });
                }
                handleQuery(true);
              }
            });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cQueryStr",
        inputtype: "rtinput",
        title: "查询条件",
        placeholder:
          "申请单号 保单号 批单号 产品名称 被保人名称 被保人证件号码 手机号码 被保人地址 投保人名称",
        btnWidth: 10,
        itemWidth: 2,
        showExBtn: true,
        btnItems: {
          // icon: "Search",
          label: "搜索",
          type: "primary",
          func: () => {
            handleQuery(true);
          },
        },
      },
      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "承保机构",
        btnWidth: 10,
        itemWidth: 2,
        showExBtn: true,
        rules: [getRules("required", {})],
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            dzmodal
              .open(DepartmentTree, { type: "Issuer", data: {} })
              .then((res) => {
                if (res.body) {
                  const selectObj = res.body;
                  let obj = {
                    loadData: [
                      {
                        label: selectObj.name,
                        value: selectObj.id,
                      },
                    ],
                  };
                  freeEditRef.value[currentTabKey.value].value[0].setValue(
                    "cDptCde",
                    selectObj.id
                  );
                  setFormItem("cDptCde", {
                    loadData: [
                      {
                        label: `${selectObj.id}${selectObj.name}`,
                        value: selectObj.id,
                      },
                    ],
                  });
                }
              });
          },
        },
      },
      {
        prop: "cLoadSub",
        inputtype: "rtradio",
        title: "包含下级机构",
        loadData: [
          { label: "是", value: 1 },
          { label: "否", value: 0 },
        ],
        defaultValue: 1,
      },
      {
        prop: "cSecondDptCde",
        inputtype: "rtselect",
        title: "二级分公司",
        clearable: true,
      },
      {
        prop: "cDataTyp",
        inputtype: "rtselect",
        title: "列表类型",
        clearable: true,
        rules: [getRules("required", {})],
        loadData: [
          { label: "全部", value: "app" },
          { label: "最新", value: "ply" },
        ],
      },
      // {
      //   prop: "cPlyNo",
      //   inputtype: "rtselect",
      //   title: "单据状态",
      //   clearable: true,
      //   rules: [getRules("required", {})],
      //   loadData: [
      //     { label: "投保待撤回任务", value: "1" },
      //     { label: "待修改单查询", value: "2" },
      //     { label: "保单到期查询", value: "3" },
      //     { label: "批量导入查询", value: "4" },
      //     { label: "产品组合出单", value: "5" },
      //   ],
      // },
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "产品大类",
        itemWidth: 1,
        rules: [{ type: "required" }],
        typeCode: "KIND_LIST_GRT",
        child: "cProdNo",
        filterable: true,
        clearable: true,
        codeParam: {
          cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        },
        func: (val) => {
          cPard.value = val;
          formconfig1.fromSchema?.forEach((item) => {
            if (
              item.prop === "CEmployeeName" ||
              item.prop === "CIdentificationNumber" ||
              item.prop === "CPlateNo" ||
              item.prop === "CEngineNo" ||
              item.prop === "CIndustryType" ||
              item.prop === "CProjectName" ||
              item.prop === "CDetailedAddress" ||
              item.prop === "CProjectType" ||
              item.prop === "cPrjCtgTyp" ||
              item.prop === "cPrjCtgMidTyp" ||
              item.prop === "cPrjCtgSubTyp"
            ) {
              item.hidden = true;
            }
          });
        },
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "条款",
        itemWidth: 1,
        rules: [{ type: "required" }],
        filterable: true,
        clearable: true,
        typeCode: "TERM_LIST_IN_GUIDE_NEW",
        codeParam: {
          cParCde: cPard.value,
          cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        },
        func: (val) => {
          formconfig1.fromSchema?.forEach((item) => {
            if (
              item.prop === "CEmployeeName" ||
              item.prop === "CIdentificationNumber" ||
              item.prop === "CPlateNo" ||
              item.prop === "CEngineNo" ||
              item.prop === "CIndustryType" ||
              item.prop === "CProjectName" ||
              item.prop === "CDetailedAddress" ||
              item.prop === "CProjectType" ||
              item.prop === "cPrjCtgTyp" ||
              item.prop === "cPrjCtgMidTyp" ||
              item.prop === "cPrjCtgSubTyp"
            ) {
              item.hidden = true;
            }
          });
        },
      },
      {
        prop: "cAppStatus",
        inputtype: "rtselect",
        title: "状态",
        // rules: [getRules("required", {})],
        clearable: true,
        loadData: [
          { label: "暂存", value: "1" },
          { label: "已提核", value: "2" },
          { label: "核保退回/撤回", value: "3" },
          { label: "核保通过", value: "4" },
          { label: "已出保单", value: "5" },
          { label: "已做失效操作", value: "6" },
          { label: "已提交未接收", value: "7" },
          { label: "见费出单退回", value: "8" },
        ],
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "投保单号",
        clearable: true,
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号/批单号",
        clearable: true,
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
        clearable: true,
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
        clearable: true,
      },
      // {
      //   prop: "appCde",
      //   inputtype: "rtinput",
      //   title: "询价单号",
      //   clearable: true,
      // },
      {
        prop: "cAppTyp",
        inputtype: "rtselect",
        title: "申请单类型",
        minWidth: 180,
        clearable: true,
        loadData: [
          { label: "投保", value: "A" },
          { label: "批改", value: "E" },
        ],
        func: (val) => {
          if (val === "A") {
            // 投保
            formconfig1.fromSchema?.forEach((item) => {
              if (item.prop === "tAppTm") {
                item.hidden = false; // 显示投保日期
                item.rules = [getRules("required", {})]; // 设置必填规则
              } else if (item.prop == "tIssueTm" || item.prop == "tEdrAppTm") {
                item.hidden = true;
              }
            });
          } else if (val === "E") {
            // 批改
            formconfig1.fromSchema?.forEach((item) => {
              if (item.prop === "tEdrAppTm") {
                item.hidden = false; // 显示批改申请日期
                item.rules = [getRules("required", {})]; // 设置必填规则
              } else if (item.prop == "tAppTm") {
                item.hidden = true;
              } else if (item.prop == "tIssueTm") {
                item.hidden = true;
              }
            });
          }
        },
      },
      {
        prop: "tIssueTm",
        inputtype: "rtdatepicker",
        title: "签单日期",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        clearable: true,
        type: "datetimerange",
      },
      {
        prop: "tAppTm",
        inputtype: "rtdatepicker",
        title: "投保日期",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        clearable: true,
        type: "datetimerange",
      },
      {
        prop: "tEdrAppTm",
        inputtype: "rtdatepicker",
        title: "批改申请日期",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        clearable: true,
        type: "datetimerange",
      },
      {
        prop: "seeBilling",
        inputtype: "rtselect",
        title: "是否见费出单",
        minWidth: 180,
        clearable: true,
        loadData: [
          { label: "是", value: "1" },
          { label: "否", value: "0" },
        ],
      },
      {
        prop: "CEmployeeName",
        inputtype: "rtinput",
        title: "雇员名称",
        clearable: true,
        hidden: true,
      },
      // {
      //     prop: "cCntrNme",
      //     inputtype: "rtinput",
      //     title: "人员姓名",
      //     clearable: true,
      //     hidden: true,
      // },
      {
        prop: "CIdentificationNumber",
        inputtype: "rtinput",
        title: "证件号",
        clearable: true,
        hidden: true,
      },
      {
        prop: "CPlateNo",
        inputtype: "rtinput",
        title: "车牌号",
        clearable: true,
        hidden: true,
      },
      {
        prop: "CEngineNo",
        inputtype: "rtinput",
        title: "发动机号",
        clearable: true,
        hidden: true,
      },
      {
        prop: "CIndustryType",
        inputtype: "rtselect",
        title: "行业类型",
        typeCode: "HANGYE_TYPE",
        clearable: true,
        hidden: true,
      },
      {
        prop: "CProjectName",
        inputtype: "rtinput",
        title: "工程名称",
        clearable: true,
        hidden: true,
      },
      {
        prop: "CProjectType",
        inputtype: "rtinput",
        title: "工程类型",
        clearable: true,
        hidden: true,
      },
      {
        prop: "CDetailedAddress",
        inputtype: "rtinput",
        title: "家财地址",
        clearable: true,
        hidden: true,
      },
      {
        prop: "cPrjCtgTyp",
        inputtype: "rtselect",
        title: "项目大类",
        clearable: true,
        filterable: true,
        hidden: true,
        typeCode: "CPrjCtgTyp_List",
        codeParam: { CRangeCde: user.value.companyId, cLev: 1 },
        func: (v) => {
          formconfig1.fromSchema?.forEach((item) => {
            if (item.prop === "cPrjCtgMidTyp") {
              freeEditRef.value[currentTabKey.value].value[0].setValue(
                "cPrjCtgMidTyp",
                ""
              );
              freeEditRef.value[currentTabKey.value].value[0].setValue(
                "cPrjCtgSubTyp",
                ""
              );
              item.typeCode = "CPrjCtgTyp_List";
              item.codeParam = {
                CRangeCde: user.value.companyId,
                cLev: 2,
                CParCde: v,
              };
            }
          });
        },
      },
      {
        prop: "cPrjCtgMidTyp",
        inputtype: "rtselect",
        title: "项目中类",
        clearable: true,
        filterable: true,
        hidden: true,
        func: (v) => {
          formconfig1.fromSchema?.forEach((item) => {
            if (item.prop === "cPrjCtgSubTyp") {
              freeEditRef.value[currentTabKey.value].value[0].setValue(
                "cPrjCtgSubTyp",
                ""
              );
              item.typeCode = "CPrjCtgTyp_List";
              item.codeParam = {
                CRangeCde: user.value.companyId,
                cLev: 3,
                CParCde: v,
              };
            }
          });
        },
      },
      {
        prop: "cPrjCtgSubTyp",
        inputtype: "rtselect",
        title: "项目子类",
        clearable: true,
        filterable: true,
        hidden: true,
      },
    ],
    showSuperior: false,
    superFromSchema: [],
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

//给表单下拉项赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          for (let key in obj.btnItems) {
            item.btnItems[key] = obj.btnItems[key];
          }
        }else{
          Object.assign(item, obj);
        }
      }
    });
  }
}
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
      { label: "投保单", value: "cAppNo" },
      { label: "保单", value: "cPlyNo" },
      { label: "批单", value: "cEdrNo" },
      { label: "批改序号", value: "c" },
      { label: "机构", value: "cDptCnm" },
      { label: "二级分公司", value: "cSecondDptCnm" },
      { label: "产品", value: "cProdNmeCn" },
      { label: "条款", value: "cTermNme" },
      { label: "核保人", value: "cUdrNme" },
      { label: "核保通过日期", value: "tUdrTm" },
      { label: "状态", value: "cAppStatus" },
      { label: "项目大类", value: "k" },
      { label: "项目中类", value: "l" },
      { label: "项目子类", value: "m" },
      { label: "询价单号", value: "n" },
    ],
  },
];

// 变更列数据
const tableCol = ref<Array<any>>([
  { title: "投保单", prop: "cAppNo", inputtype: "rtinput", minWidth: 180 },
  { title: "保单", prop: "cPlyNo", inputtype: "rtinput", minWidth: 180 },
  { title: "批单", prop: "cEdrNo", inputtype: "rtinput", minWidth: 180 },
  { title: "批改序号", prop: "c", inputtype: "rtinput", minWidth: 180 },
  { title: "机构", prop: "cDptCnm", inputtype: "rtinput", minWidth: 180 },
  {
    title: "二级分公司",
    prop: "cSecondDptCnm",
    inputtype: "rtinput",
    minWidth: 180,
  },
  { title: "产品", prop: "cProdNmeCn", inputtype: "rtinput", minWidth: 180 },
  { title: "条款", prop: "cTermNme", inputtype: "rtinput", minWidth: 180 },
  { title: "核保人", prop: "cUdrNme", inputtype: "rtinput", minWidth: 180 },
  {
    title: "核保通过日期",
    prop: "tUdrTm",
    inputtype: "rtdatepicker",
    minWidth: 180,
  },
  { title: "状态", prop: "cAppStatus", inputtype: "rtinput", minWidth: 180 },
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
        hideBtns: (row: any) => {
          if (
            row.cAppStatus != "1" &&
            row.cAppStatus != "3" &&
            row.cAppStatus != "8"
          ) {
            return false;
          } else {
            return true;
          }
        },
        tableClick: async (row) => {
          console.log(row);
          const r = await row;
          if (r) {
            const data = row;
            router.push({
              path: "/pcis/my-page",
              query: {
                param: JSON.stringify({ ...data, ...{ pageType: "readonly" } }),
              },
            });
          } else {
            ElMessage.warning("请检查表单！");
          }
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        hideBtns: (row: any) => {
          if (
            row.cAppStatus == "1" ||
            row.cAppStatus == "3" ||
            row.cAppStatus == "8"
          ) {
            return false;
          } else {
            return true;
          }
        },
        tableClick: async (row) => {
          console.log(row);
          const r = await row;
          if (r) {
            const data = row;
            router.push({
              path: "/pcis/my-page",
              query: {
                param: JSON.stringify({
                  ...data,
                  ...{ pageType: "TEMPORARY_DEPOSIT" },
                }),
              },
            });
          } else {
            ElMessage.warning("请检查表单！");
          }
        },
      }),
      createFreeButtonBase({
        id: "copy",
        link: true,
        iconColor: "#02D05F",
        tooltip: "复制",
        size: "large",
        icon: "DocumentCopy",
        hideBtns: (row: any) => {
          if (
            row.cAppStatus == "1" ||
            row.cAppStatus == "5"
          ) {
            return false;
          } else {
            return true;
          }
        },
        tableClick: async (row) => {
          console.log(row);
          const r = await row;
          if (r) {
            const data = row;
            console.log("0000000000000", data);
            router.push({
              path: "/pcis/my-page",
              query: {
                param: JSON.stringify({ ...data, ...{ pageType: "copy" } }),
              },
            });
          } else {
            ElMessage.warning("请检查表单！");
          }
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "删除",
        type: "danger",
        size: "large",
        icon: "Delete",
        hideBtns: (row: any) => {
          if (
            row.cAppStatus == "1" ||
            row.cAppStatus == "3" ||
            row.cAppStatus == "8"
          ) {
            return false;
          } else {
            return true;
          }
        },
        tableClick: (row) => {
          ElMessageBox.confirm("确认删除数据?", "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }).then(function () {
            const delResult = delTmpPolicy({ cAppNo: row.cAppNo });
            delResult.then((res: any) => {
              if (null != res && null != res["code"]) {
                if (res["code"] === 200) {
                  ElMessage.success({ message: res.msg, duration: 3000 });
                  handleQuery(true);
                } else {
                  ElMessage.error({ message: res.msg, duration: 3000 });
                }
              }
            });
          });
        },
      }),
      // createFreeButtonBase({
      //   id: "score",
      //   link: true,
      //   tooltip: "单据打印",
      //   type: "danger",
      //   size: "large",
      //   icon: "Delete",
      //   tableClick: (row) => {
      //     dzmodal
      //       .open(PrintView, { type: "edit", data: modalForm })
      //       .then((res) => {
      //         if (res.type === "ok") {
      //           console.log("res", res);
      //           handleQuery(true);
      //         }
      //       });
      //   },
      // }),
      // createFreeButtonBase({
      //   id: "score",
      //   link: true,
      //   tooltip: "团单成员",
      //   type: "danger",
      //   size: "large",
      //   icon: "Delete",
      //   tableClick: (row) => {
      //     dzmodal
      //       .open(EpolicyQueryGrpDialog, { type: "edit", data: modalForm })
      //       .then((res) => {
      //         if (res.type === "ok") {
      //           console.log("res", res);
      //           handleQuery(true);
      //         }
      //       });
      //   },
      // }),
      // createFreeButtonBase({
      //   id: "score",
      //   link: true,
      //   tooltip: "历史赔案",
      //   type: "danger",
      //   size: "large",
      //   icon: "Delete",
      //   tableClick: (row) => {
      //     dzmodal
      //       .open(HistoryClaimcaseModel, { type: "edit", data: modalForm })
      //       .then((res) => {
      //         if (res.type === "ok") {
      //           console.log("res", res);
      //           handleQuery(true);
      //         }
      //       });
      //   },
      // }),
      // createFreeButtonBase({
      //   id: "score",
      //   link: true,
      //   tooltip: "任务痕迹",
      //   type: "danger",
      //   size: "large",
      //   icon: "Delete",
      //   tableClick: (row) => {
      //     dzmodal
      //       .open(TaskListVestige, { type: "edit", data: modalForm })
      //       .then((res) => {
      //         if (res.type === "ok") {
      //           console.log("res", res);
      //           handleQuery(true);
      //         }
      //       });
      //   },
      // }),
      // createFreeButtonBase({
      //   id: "score",
      //   link: true,
      //   tooltip: "核保信息",
      //   type: "danger",
      //   size: "large",
      //   icon: "Delete",
      //   tableClick: (row) => {
      //     dzmodal
      //       .open(UndrOpnList, { type: "edit", data: modalForm })
      //       .then((res) => {
      //         if (res.type === "ok") {
      //           console.log("res", res);
      //           handleQuery(true);
      //         }
      //       });
      //   },
      // }),
    ],
    fromSchema: [
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "投保单",
        minWidth: 180,
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单",
        minWidth: 180,
      },
      {
        prop: "cEdrNo",
        inputtype: "rtinput",
        title: "批单",
        minWidth: 180,
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "机构",
        minWidth: 180,
      },
      {
        prop: "cSecondDptCnm",
        inputtype: "rtinput",
        title: "二级分公司",
        minWidth: 180,
      },
      {
        prop: "cProdNmeCn",
        inputtype: "rtinput",
        title: "产品",
        minWidth: 180,
      },
      {
        prop: "cTermNo",
        inputtype: "rtinput",
        title: "条款",
        minWidth: 180,
      },
      {
        prop: "cUdrNme",
        inputtype: "rtinput",
        title: "核保人",
        minWidth: 180,
      },
      {
        prop: "tUdrTm",
        inputtype: "rtinput",
        title: "核保通过日期",
        minWidth: 180,
      },
      {
        prop: "nAmt",
        inputtype: "rtinput",
        title: "保额",
        minWidth: 100,
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "保费",
        minWidth: 100,
      },
      {
        prop: "cAppStatus",
        inputtype: "rtselect",
        title: "状态",
        minWidth: 100,
        loadData: [
          { label: "暂存", value: "1" },
          { label: "已提核", value: "2" },
          { label: "核保退回/撤回", value: "3" },
          { label: "核保通过", value: "4" },
          { label: "已出保单", value: "5" },
          { label: "已做失效操作", value: "6" },
          { label: "已提交未接收", value: "7" },
          { label: "见费出单退回", value: "8" },
        ],
        hideBtns: (row: any) => {
          if (
            queryType.value == "2" ||
            queryType.value == "3" ||
            queryType.value == "4"
          ) {
            return false;
          } else {
            return true;
          }
        },
      },
    ],
  },
};

let tableconfig = reactive<AppTableConfig>(
  createTableEditConfig(tableObj.notWaitObj)
);

//tabs切换
const handleTabClick = (tab: any) => {
  queryType.value = tab.props.name;
  currentTabName.value = tab.props.label;
  const i = tabs.value.findIndex((item) => item.name === tab.props.label);
  currentTabKey.value = i;
  nowTab.value = i;
  let url = "";
  if (Number(i) <= 3) {
    tableconfig = reactive<AppTableConfig>(
      createTableEditConfig(tableObj.notWaitObj)
    );
    formconfig1.fromSchema?.forEach((item) => {
      if (
        item.prop === "CEmployeeName" ||
        item.prop === "CIdentificationNumber" ||
        item.prop === "CPlateNo" ||
        item.prop === "CEngineNo" ||
        item.prop === "CIndustryType" ||
        item.prop === "CProjectName" ||
        item.prop === "CDetailedAddress" ||
        item.prop === "CProjectType" ||
        item.prop === "cPrjCtgTyp" ||
        item.prop === "cPrjCtgMidTyp" ||
        item.prop === "cPrjCtgSubTyp"
      ) {
        item.hidden = true;
      }
      // if (Number(i) == 1) {
      //   if (item.prop === "tIssueTm") {
      //     item.title = "投保日期";
      //   }
      // } else {
      //   if (item.prop === "tIssueTm") {
      //     item.title = "签单日期";
      //   }
      // }
      // if (Number(i) == 2) {
      //   if (item.prop === "cAppTyp") {
      //     item.disabled = true;
      //     freeEditRef.value[i].value[0].setValue("cAppTyp", "A");
      //   }
      // } else if (Number(i) == 3) {
      //   if (item.prop === "cAppTyp") {
      //     item.disabled = true;
      //     freeEditRef.value[i].value[0].setValue("cAppTyp", "E");
      //   }
      // } else {
      //   if (item.prop === "cAppTyp") {
      //     item.disabled = false;
      //   }
      // }
    });

    //复制出单报错，导致页面渲染不了，暂时注释掉
    // freeEditRef.value[i].value[0].setValue("tIssueTm", [
    //   dayjs(new Date()).subtract(3, "month").format("YYYY-MM-DD 00:00:00"),
    //   moment(new Date()).format("YYYY-MM-DD 23:59:59"),
    // ]);
    // freeEditRef.value[i].value[0].setValue("tAppTm", [
    //   dayjs(new Date()).subtract(3, "month").format("YYYY-MM-DD 00:00:00"),
    //   moment(new Date()).format("YYYY-MM-DD 23:59:59"),
    // ]);
    // freeEditRef.value[i].value[0].setValue("tEdrAppTm", [
    //   dayjs(new Date()).subtract(3, "month").format("YYYY-MM-DD 00:00:00"),
    //   moment(new Date()).format("YYYY-MM-DD 23:59:59"),
    // ]);
  }
  // 控制申请单类型字段的显示和隐藏
  formconfig1.fromSchema?.forEach((item) => {
    if (item.prop === "cAppTyp") {
      item.disabled = queryType.value === "3" || queryType.value === "4";
    }
  });
  pageresult.list = [];
  tabs.value.forEach((item) => {
    if (item.name === tab.props.label) {
      url = item.url;
    }
  });
};

onMounted(async () => {
  formconfig1.fromSchema?.forEach((item) => {
    if (
      // item.prop === "tIssueTm"
      item.prop === "tAppTm" ||
      item.prop === "tEdrAppTm"
    ) {
      item.hidden = true; // 隐藏所有日期字段
      item.rules = []; // 清除必填规则
    }
  });

  // freeEditRef?.value[0].value[0].setValue("cDptCde", "0200000000000");
  // freeEditRef?.value[1].value[0].setValue("cDptCde", "0200000000000");
  // freeEditRef?.value[2].value[0].setValue("cDptCde", "0200000000000");
  // freeEditRef?.value[3].value[0].setValue("cDptCde", "0200000000000");

  setFormItem("cDptCde", {
    loadData: [
      {
        label: "0200000000000永安保险公总司",
        value: "0200000000000",
      },
    ],
  });
  pageresult.list = [];

  //首页跳转过来的逻辑 Start
  if (sessionStorage.getItem(AppKey.query.pcis_query_app)) {
    //首页 暂存任务跳转过来的,选中投保单
    homeJumpData.value = JSON.parse(
      sessionStorage.getItem(AppKey.query.pcis_query_app)
    );
    activeName.value = "2";
    await nextTick();
    freeEditRef.value[1].value[0].setValue("seeBilling", "A");
    freeEditRef.value[1].value[0].setValue("tIssueTm", [
      homeJumpData.value.TIssueTmStart,
      homeJumpData.value.TIssueTmEnd,
    ]);
    if (homeJumpData.value.hasOwnProperty("CAppNo")) {
      //投保单号
      freeEditRef.value[1].value[0].setValue(
        "cAppNo",
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
  } else {
    freeEditRef.value[0].value[0].setValue("tIssueTm", [
      dayjs(new Date()).subtract(3, "month").format("YYYY-MM-DD 00:00:00"),
      moment(new Date()).format("YYYY-MM-DD 23:59:59"),
    ]);
    // freeEditRef.value[0].value[0].setValue("tAppTm", [
    //   dayjs(new Date()).subtract(3, "month").format("YYYY-MM-DD 00:00:00"),
    //   moment(new Date()).format("YYYY-MM-DD 23:59:59"),
    // ]);
    // freeEditRef.value[0].value[0].setValue("tEdrAppTm", [
    //   dayjs(new Date()).subtract(3, "month").format("YYYY-MM-DD 00:00:00"),
    //   moment(new Date()).format("YYYY-MM-DD 23:59:59"),
    // ]);
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

/** 查询 */
function handleQuery(flag?: boolean) {
  // 此处数组ref赋值，获取都有问题，暂时隐藏
  const tableRefs = tableRef.value[currentTabKey.value];
  const freeEditRefs = freeEditRef.value[currentTabKey.value];
  const r = tableRefs.value[0]?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRefs.value[0].getFromValue(); //获取表单数据
  if (s.cLoadSub == null) {
    s.cLoadSub = "1";
  }
  pageresult.list = [];
  if (
    (s["cAppNo"] == null || s["cAppNo"] == "") &&
    (s["cPlyNo"] == null || s["cPlyNo"] == "") &&
    (s["cAppNme"] == null || s["cAppNme"] == "")
  ) {
    const startTemp =
      s.tIssueTm && s.tIssueTm.length > 1 ? s.tIssueTm[0] : null;
    if (null == startTemp || undefined === startTemp) {
      ElMessage.warning("签单日期不能为空");
      return;
    }
    const start = dayjs(startTemp);
    const endTemp = s.tIssueTm && s.tIssueTm.length > 1 ? s.tIssueTm[1] : null;
    if (null == endTemp || undefined === endTemp) {
      ElMessage.warning("签单日期不能为空");
      return;
    }
    const end = dayjs(endTemp);
    if (end.isBefore(start)) {
      ElMessage.warning("签单日期起期不能大于签单日期止期");
      return;
    }
    if (end.diff(start, "year", true) > 2) {
      ElMessage.warning("签单日期时间范围请控制在两年内");
      return;
    }
  }
  // 提取投保日期的开始时间和结束时间
  const tAppTmStart = s.tAppTm && s.tAppTm.length > 1 ? s.tAppTm[0] : null;
  const tAppTmEnd = s.tAppTm && s.tAppTm.length > 1 ? s.tAppTm[1] : null;
  // 提取批改申请日期的开始时间和结束时间
  const tEdrAppTmStart =
    s.tEdrAppTm && s.tEdrAppTm.length > 1 ? s.tEdrAppTm[0] : null;
  const tEdrAppTmEnd =
    s.tEdrAppTm && s.tEdrAppTm.length > 1 ? s.tEdrAppTm[1] : null;
  // 提取签单日期的开始时间和结束时间
  const tIssueTmStart =
    s.tIssueTm && s.tIssueTm.length > 1 ? s.tIssueTm[0] : null;
  const tIssueTmEnd =
    s.tIssueTm && s.tIssueTm.length > 1 ? s.tIssueTm[1] : null;

  // if (currentTabKey.value == "0") {
  const param = Object.assign(s, r);
  param["pageNo"] = param["pageNum"];
  param["tAppTmStart"] = tAppTmStart; // 添加投保开始时间
  param["tAppTmEnd"] = tAppTmEnd; // 添加投保结束时间
  param["tEdrAppTmStart"] = tEdrAppTmStart; // 添加批改开始时间
  param["tEdrAppTmEnd"] = tEdrAppTmEnd; // 添加批改结束时间
  param["tIssueTmStart"] = tIssueTmStart; // 添加签单开始时间
  param["tIssueTmEnd"] = tIssueTmEnd; // 添加签单结束时间
  param["queryType"] = queryType.value;
  getAppPolicyList(param)
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
  // }
  // else if (currentTabKey.value == "1") {
  //   const param = Object.assign(s, r);
  //   param["pageNo"] = param["pageNum"];
  //   param["user"] = JSON.parse(sessionStorage.getItem("user"));
  //   console.log(param);
  //   qryEndorseList(param)
  //     .then((res) => {
  //       const { code, data, msg } = res;
  //       if (200 === code) {
  //         pageresult.list = [];
  //         pageresult.list = data.result;
  //         pageresult.total = data.total;
  //         console.log(pageresult.list);
  //         console.log(pageresult.total);
  //       } else {
  //         ElMessage.error(msg);
  //       }
  //     })
  //     .finally(() => {});
  // }
}

// 多选事件
function handleSelectionChange(selection: any) {
  console.log("selection", selection);
  removeIds.value = selection.map((item: any) => item.cPkId);
}
// function getFromValue() {
//   return freeEditRef?.value?.getFromValue();
// }

// function setFormValue(value: any) {
//   freeEditRef?.value?.setFormValue(value);
// }

// function validate() {
//   return freeEditRef?.value?.validate();
// }

// function setValue(key: string, value: any) {
//   freeEditRef?.value?.setValue(key, value);
// }

// function getValue(key: string) {
//   return freeEditRef?.value?.getValue(key);
// }
</script>

<style scoped>
.app-container {
  padding: 6px 30px;
}
/* /deep/ .el-form {
  padding: 5px 30px;
} */
</style>

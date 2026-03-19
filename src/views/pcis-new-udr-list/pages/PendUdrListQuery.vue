<!-- 核保任务查询 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @selection-change="handleSelectionChange"
      @page-change="handleQuery(false)"
    >
      <template #column-nPrm="{ row, column, index }">
        <span>¥ {{ row.nPrm.toLocaleString() }}</span>
      </template>
      <template #column-cDptCnm="{ row, column, index }">
        <span v-html="row.cDptCnm || ''" class="twoLine"></span>
      </template>
      <template #column-cTermNme="{ row, column, index }">
        <span v-html="row.cTermNme || ''" class="twoLine"></span>
      </template>
      <template #column-cAppNme="{ row, column, index }">
        <span v-html="row.cAppNme || ''" class="twoLine"></span>
      </template>
      <template #column-cInsuredNme="{ row, column, index }">
        <span v-html="row.cInsuredNme || ''" class="twoLine"></span>
      </template>
      <template #column-cAppNoInfo="{ row, column, index }">
        <div class="policy-info-cell">
          <div class="policy-number-row">
            <span
              v-html="row.cAppNo"
              class="primmaryColor"
            ></span>
            <el-icon
              class="copy-icon"
              @click="copyText(row.cAppNo)"
            >
              <DocumentCopy />
            </el-icon>
          </div>
        </div>
      </template>
    </app-table>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store";
import { useValidator } from "@/typings/useValidator";
import { useRoute, useRouter, RouteRecordRaw } from "vue-router";
import { cloneDeep } from "lodash-es";
import {
  SCENE_EDR_APP_MODIFY_UNSUBMIT,
  SCENE_PLAN_READ,
  SCENE_PLY_APP_MODIFY_UNSUBMIT,
  SCENE_PLY_APP_READ,
  SCENE_PLY_APP_READBEARER,
  SCENE_TEMPORARY_DEPOSITBEARER,
  SCENE_PLAN_UW_PROCESS,
  SCENE_PLY_UW_PROCESS,
  SCENE_PLY_UW_PROCESSBEARER,
} from "@/constants/tab-constants";
import { AppKey } from "@/constants/api";
const { getRules } = useValidator();
const router = useRouter();
const route = useRoute();
import { ref, watch } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { now } from "lodash";
import { getListByCode } from "@/api/code-list-service";
import { PcisQueryService } from "@/views/payinfoManagement/service/pcis-query-service";
import { NewUdrListService } from "@/views/pcis-new-udr-list/service/new-udr-list.service";
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
import { codeListViewStore } from "@/store";

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const pcisQueryService = new PcisQueryService();
const policyService = new PolicyService();
const {
  getBaseInfoByAppNo,
  getBackUdrList,
  getNewUdrList,
  removeReceived,
  checkEdrPocly,
  hasReceived,
  getAppTask,
} = NewUdrListService();
import moment from "moment";
import { Row } from "element-plus/es/components/table-v2/src/components";
import { submitUnderwriting } from "../../../api/query/index";
import { getProdEnableList } from "@/api/prod";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
// import { saveAs } from 'file-saver';
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });
const roles = ref(userStore.user.roles);
const clsCde = ref(""); // 核保机构
const dzmodal = useDzModal();
const kindEdit = defineAsyncComponent(
  () => import("../../pcis-new-udr-list/pages/kindEdit.vue")
);
const tableRef = ref<AppTableMethod | null>(null);
const departmentTree = defineAsyncComponent(
  () => import("@/pcis/prodRef/commodityRef/DepartmentTree.vue")
);
// 任务痕迹列表 弹框页面
const TaskListVestige = defineAsyncComponent(
  () => import("../common/TaskListVestige.vue")
);
// 费用信息 弹框页面
const CostInformation = defineAsyncComponent(
  () => import("./CostInformation.vue")
);
// 历次批单 弹框页面
const PreviousdrOpnList = defineAsyncComponent(
  () => import("../common/PreviousdrOpnList.vue")
);

const udrTypeValue = ref<string>(); // 单据状态 值
const undrClsListOptions = ref<Array<any>>([]); // 核保级别 下拉数据
const selectData = ref([]); // 删除用户ID集合 用于批量删除
const kindData: any = computed(() => {
  return prodTotalDatas.value.map((item: any) => ({
    label: item.code + " " + item.value,
    value: item.code,
    list: item.list,
  }));
});
const cProdData = ref([]);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "核保任务查询",
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
          setFormItem("companyId", {
            loadData: [
              {
                label: user.value.companyCnm,
                value: user.value.companyId,
              },
            ],
          });
          freeEditRef.value?.setFormValue({
            cAppNme: "",
            cInsuredNme: "",
            companyId: user.value.companyId,
            cLoadSub: '0',
            cKindNo: null,
            cAppNo: "",
            cPlyNo: "",
            tm1: [
              moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format(
                "YYYY-MM-DD 00:00:00"
              ),
              moment(new Date()).format("YYYY-MM-DD 23:59:59"),
            ],
            tm2: [],
            udrType: "1",
            undrClsCde: null,
          });
          handleQuery();
        },
      }),
      createFreeButtonBase({
        label: "批量退回",
        func: () => {
          if (selectData.value.length < 1) {
            ElMessage.warning("所选记录为空！");
            return;
          }
          if (selectData.value.length > 5) {
            ElMessage.warning("所选数据最多为5条！");
            return;
          }
          let obj = {};
          Object.keys(selectData.value).forEach((k) => {
            obj[selectData.value[k]["objId"]] = selectData.value[k]["curtTask"];
          });
          const res = {};
          res["user"] = JSON.parse(sessionStorage.getItem("user"));
          res["user"]["opRelCde"] = "10030892";
          res["appNoAndTaskIdMap"] = obj;
          res["cUndrMrk"] = "BB";
          res["undrMrk"] = "BB";
          res["cAntiLnderRisk"] = "0"; //关联交易确认
          res["cIsTransaction"] = "0"; //反洗钱风险
          res["CRiBesprakMrk"] = "0"; // 预约分保标志
          res["backUndrDptCde"] = null; // 退回指定核保级别机构编码
          res["backUndrClsCde"] = null; // 退回指定核保级别编码
          res["backUndrDptCnm"] = null; // 退回指定核保人员名称
          formconfig1.endBtns[2].loading = true;
          submitUnderwriting(res).then((result: any) => {
            if (result["code"] == "200") {
              ElMessage.success(result.msg);
              handleQuery();
            } else {
              ElMessage.error(result.msg);
            }
            formconfig1.endBtns[2].loading = false;
          });
        },
      }),
      createFreeButtonBase({
        label: "导出",
        func: () => {
          // 只有5有
          freeEditRef.value?.validate().then((isValid: boolean) => {
            if (isValid) {
              exportDown();
            } else {
              ElMessage.error("请填写必填项");
            }
          });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "udrType",
        inputtype: "rtSelectV2",
        title: "单据状态",
        minWidth: 180,
        loadData: [
          { label: "待核保任务", value: "1" },
          { label: "暂存任务", value: "2" },
          { label: "已上报任务", value: "3" },
          { label: "核保退回任务", value: "4" },
          { label: "核保通过任务", value: "5" },
        ],
      },
      {
        prop: "companyId",
        inputtype: "rtSelectV2",
        title: "核保机构",
        rules: [getRules("required", {})],
        btnWidth: 10,
        // itemWidth: 2,
        showExBtn: true,
        loadData: [
          {
            label: user.value.companyCnm,
            value: user.value.companyId,
          },
        ],
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            dzmodal
              .open(departmentTree, { type: "Issuer", data: {} })
              .then((res: any) => {
                if (res.type === "ok") {
                  if (res.body) {
                    setFormItem("companyId", {
                      loadData: [
                        {
                          label: res.body.name,
                          value: res.body.id,
                        },
                      ],
                    });
                    freeEditRef.value?.setValue("companyId", res.body.id);
                  }
                }
              });
          },
        },
      },
      {
        prop: "cLoadSub",
        inputtype: "rtcheckbox",
        title: "包含下级机构",
        defaultValue: '0',
        keymap: {
          y: '1',
          n: '0',
        },
      },
      {
        prop: "cKindNo",
        inputtype: "rtSelectV2",
        title: "产品大类",
        clearable: true,
        multiple: true,
        filterable: true,
        loadData: kindData,
        func: (val: any) => {
          if (val && val.length > 0) {
            let options: any = [];
            kindData.value.forEach((item: any) => {
              if (val.includes(item.value)) {
                const list = item.list.map((item: any) => ({
                  label: item.code + " " + item.value,
                  value: item.code,
                  list: item.list,
                }));
                options = options.concat(list);
              }
            });
            cProdData.value = options;
            setFormItem("cProdNo", { loadData: options });
            freeEditRef.value?.setValue("cProdNo", null);
          } else {
            setFormItem("cProdNo", { loadData: [] });
            freeEditRef.value?.setValue("cProdNo", null);
          }
        },
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "产品名称",
        itemWidth: 1,
        filterable: true,
        clearable: true,
        multiple: true,
        func: (val: any) => {
          if (val && val.length > 0) {
            let options: any = [];
            cProdData.value.forEach((item: any) => {
              if (val.includes(item.value)) {
                const list = item.list.map((item: any) => ({
                  label: item.code + " " + item.value,
                  value: item.code,
                  list: item.list,
                }));
                options = options.concat(list);
              }
            });
            setFormItem("cTermNo", { loadData: options });
            freeEditRef.value?.setValue("cTermNo", null);
          } else {
            setFormItem("cTermNo", { loadData: [] });
            freeEditRef.value?.setValue("cTermNo", null);
          }
        },
      },
      {
        prop: "cTermNo",
        inputtype: "rtselect",
        title: "条款名称",
        itemWidth: 1,
        filterable: true,
        clearable: true,
        multiple: true,
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "投保/批改申请单号",
        clearable: true,
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号/批单号",
        clearable: true,
      },
      {
        prop: "undrClsCde",
        inputtype: "rtSelectV2",
        title: "核保级别",
        typeCode: "undrClsList",
        codeParam: { cDptCde: user.value.companyId, cEmpCde: user.value.opCde },
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
      {
        prop: "tm1",
        inputtype: "rtdatepicker",
        title: "申请日期",
        format: "YYYY-MM-DD",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        clearable: true,
        type: "datetimerange",
        rules: [getRules("required", {})],
      },
      {
        prop: "tm2",
        inputtype: "rtdatepicker",
        title: "签单日期",
        format: "YYYY-MM-DD",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        clearable: true,
        type: "datetimerange",
      },
    ],
  })
);

const tableBtns = [
  createFreeButtonBase({
    id: "score",
    link: true,
    tooltip: "接收",
    type: "info",
    size: "large",
    icon: "Message",
    iconSize: "25",
    // hideBtns: (row: any) => {
    //   if (row.udrType === "1") {
    //     return false;
    //   } else {
    //     return true;
    //   }
    // },
    hidden: true,
    tableClick: (row) => {
      //待核保任务 接收
      handle_hasReceived(row);
    },
  }),
  createFreeButtonBase({
    id: "score",
    link: true,
    tooltip: "修改",
    type: "success",
    size: "large",
    icon: "Edit",
    iconSize: "25",
    hideBtns: (row: any) => {
      if (row.udrType === "2") {
        return false;
      } else {
        return true;
      }
    },
    tableClick: (row) => {
      if (row.state == "1") updateUdr(row);
    },
  }),
  createFreeButtonBase({
    id: "score",
    link: true,
    tooltip: "取消接收",
    type: "info",
    size: "large",
    icon: "Release",
    iconSize: "25",
    hideBtns: (row: any) => {
      if (row.udrType === "2") {
        return false;
      } else {
        return true;
      }
    },
    tableClick: (row) => {
      handleWorkFlow(row, "removeReceived");
    },
  }),
  createFreeButtonBase({
    id: "score",
    link: true,
    tooltip: "撤回",
    type: "danger",
    size: "large",
    icon: "return",
    iconSize: "25",
    hideBtns: (row: any) => {
      if (row.udrType === "3" && !!row.curtTask) {
        return false;
      } else {
        return true;
      }
    },
    tableClick: (row) => {
      // showDetails(row)
      const res = {};
      res["cUndrMrk"] = "W";
      res["undrMrk"] = "W";
      res["user"] = JSON.parse(sessionStorage.getItem("user"));
      res["user"]["opRelCde"] = "10030892";
      res["appNo"] = row.cAppNo;
      res["taskId"] = row.curtTask;
      res["appTyp"] = row.cAppTyp;
      res["cAntiLnderRisk"] = "0"; //关联交易确认
      res["cIsTransaction"] = "0"; //反洗钱风险
      res["CRiBesprakMrk"] = "0"; // 预约分保标志
			res["backUndrDptCde"] = row.tPreDptCde; // 退回指定核保级别机构编码
      res["backUndrClsCde"] = row.level; // 退回指定核保级别编码
      res["backUndrDptCnm"] = row.tPreDptName // 退回指定核保人员名称
      let submitUnder;
      submitUnder = submitUnderwriting(res);
      submitUnder.then((res) => {
        if (res["code"] == "200") {
          ElMessage.success(res.msg);
          handleQuery();
        } else {
          ElMessage.error(res.msg);
        }
      });
    },
  }),
  createFreeButtonBase({
    id: "score",
    link: true,
    tooltip: "查看",
    type: "primary",
    size: "large",
    icon: "View",
    iconSize: "25",
    hideBtns: (row: any) => {
      if (row.udrType === "3" || row.udrType === "4" || row.udrType === "5") {
        return false;
      } else {
        return true;
      }
    },
    tableClick: (row) => {
      showDetails(row);
    },
  }),
  createFreeButtonBase({
    id: "score",
    link: true,
    tooltip: "承保流程",
    type: "danger",
    size: "large",
    icon: "Refresh",
    iconSize: "25",
    hideBtns: (row: any) => {
      if (row.udrType === "3" || row.udrType === "4" || row.udrType === "5") {
        return false;
      } else {
        return true;
      }
    },
    tableClick: (row) => {
      let data;
      if (row.udrType === "3" || row.udrType === "4" || row.udrType === "5") {
        data = { objId: row.objId, sysType: row.objExt };
      } else {
        data = {
          objId: row.cAppNo,
          sysType:
            !!row["cAppTyp"] &&
            ("A" === row["cAppTyp"] || "P" === row["cAppTyp"])
              ? "U"
              : "E",
        };
      }
      dzmodal
        .open(TaskListVestige, { type: "Issuer", data })
        .then((res) => {
          if (res.type === "ok") {
            refreshData(true);
          }
        });
    },
  }),
]

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
    showSelection: true,
    tableBtnType: "btn",
    tableBtnWidth: 80,
    fixed: true,
    tableBtnPosition: "right",
    rowDbClickFun:(row:any)=> rowDbClick(row),
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "接收",
        type: "info",
        size: "large",
        icon: "Message",
        iconSize: "25",
        // hideBtns: (row: any) => {
        //   if (row.udrType === "1") {
        //     return false;
        //   } else {
        //     return true;
        //   }
        // },
        hidden: true,
        tableClick: (row) => {
          //待核保任务 接收
          handle_hasReceived(row);
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "修改",
        type: "success",
        size: "large",
        icon: "Edit",
        iconSize: "25",
        hideBtns: (row: any) => {
          if (row.udrType === "2") {
            return false;
          } else {
            return true;
          }
        },
        tableClick: (row) => {
          if (row.state == "1") updateUdr(row);
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "取消接收",
        type: "info",
        size: "large",
        icon: "Release",
        iconSize: "25",
        hideBtns: (row: any) => {
          if (row.udrType === "2") {
            return false;
          } else {
            return true;
          }
        },
        tableClick: (row) => {
          handleWorkFlow(row, "removeReceived");
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "撤回",
        type: "danger",
        size: "large",
        icon: "return",
        iconSize: "25",
        hideBtns: (row: any) => {
          if (row.udrType === "3" && !!row.curtTask) {
            return false;
          } else {
            return true;
          }
        },
        tableClick: (row) => {
          // showDetails(row)
          const res = {};
          res["cUndrMrk"] = "W";
          res["undrMrk"] = "W";
          res["user"] = JSON.parse(sessionStorage.getItem("user"));
          res["user"]["opRelCde"] = "10030892";
          res["appNo"] = row.cAppNo;
          res["taskId"] = row.curtTask;
          res["appTyp"] = row.cAppTyp;
          res["cAntiLnderRisk"] = "0"; //关联交易确认
          res["cIsTransaction"] = "0"; //反洗钱风险
          res["CRiBesprakMrk"] = "0"; // 预约分保标志
          res["backUndrDptCde"] = row.tPreDptCde; // 退回指定核保级别机构编码
          res["backUndrClsCde"] = row.level; // 退回指定核保级别编码
          res["backUndrDptCnm"] = row.tPreDptName // 退回指定核保人员名称
          let submitUnder;
          submitUnder = submitUnderwriting(res);
          submitUnder.then((res) => {
            if (res["code"] == "200") {
              ElMessage.success(res.msg);
              handleQuery();
            } else {
              ElMessage.error(res.msg);
            }
          });
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "查看",
        type: "primary",
        size: "large",
        icon: "View",
        iconSize: "25",
        hideBtns: (row: any) => {
          if (row.udrType === "3" || row.udrType === "4" || row.udrType === "5") {
            return false;
          } else {
            return true;
          }
        },
        tableClick: (row) => {
          showDetails(row);
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "承保流程",
        type: "danger",
        size: "large",
        icon: "Refresh",
        iconSize: "25",
        hideBtns: (row: any) => {
          if (row.udrType === "3" || row.udrType === "4" || row.udrType === "5") {
            return false;
          } else {
            return true;
          }
        },
        tableClick: (row) => {
          let data;
          if (row.udrType === "3" || row.udrType === "4" || row.udrType === "5") {
            data = { objId: row.objId, sysType: row.objExt };
          } else {
            data = {
              objId: row.cAppNo,
              sysType:
                !!row["cAppTyp"] &&
                ("A" === row["cAppTyp"] || "P" === row["cAppTyp"])
                  ? "U"
                  : "E",
            };
          }
          dzmodal
            .open(TaskListVestige, { type: "Issuer", data })
            .then((res) => {
              if (res.type === "ok") {
                refreshData(true);
              }
            });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "baseType",
        inputtype: "rtinput",
        lengthNum: 4,
        title: "任务类型",
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
        slotName: "cAppNoInfo",
        lengthNum: 21,
        lengthIsNumber: true,
        fixed: "left",
      },
      {
        prop: "preDptName",
        inputtype: "rtinput",
        title: "分公司",
        lengthNum: 3,
        formatter:(val:any) => {
          if(val?.split("分公司").length > 1) {
            return val?.split("分公司")[0]
          } else {
            return val?.slice(0,2)
          }
        }
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "承保机构",
        slotName: "cDptCnm",
        align: 'left',
        lengthNum: 20,
      },
      {
        prop: "udrClsCde",
        inputtype: "rtinput",
        title: "当前核保级别",
        align: 'left',
        lengthNum: 12,
      },
      {
        prop: "cTermNme",
        inputtype: "rtinput",
        title: "条款名称",
        slotName: "cTermNme",
        align: 'left',
        lengthNum: 25,
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
        slotName: "cAppNme",
        align: 'left',
        // lengthNum: 12,
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
        slotName: "cInsuredNme",
        align: 'left',
        // lengthNum: 12,
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "保费",
        align: 'left',
        lengthNum: 12,
        lengthIsNumber: true,
        formatter:(val:any) => {
          return val.toLocaleString()
        }
      },
      {
        prop: "crtTm",
        inputtype: "rtdatepicker",
        title: "提核时间",
        type: "datetimerange", // 显示日期和时间选择器
        format: "YYYY-MM-DD HH:mm:ss", // 显示在界面上的格式
        valueFormat: "YYYY-MM-DD HH:mm:ss", // 传递给后端的值格式
        lengthNum: 17,
        lengthIsNumber: true,
      },
      {
        prop: "preUserName",
        inputtype: "rtinput",
        title: "任务提交人",
        align: 'left',
        // lengthNum: 5,
      },
      // {
      //   prop: "cMinUndrCls",
      //   inputtype: "rtinput",
      //   title: "最小可核级别",
      //   align: 'left',
      //   lengthNum: 12,
      // },
      // {
      //   prop: "state",
      //   inputtype: "rtselect",
      //   title: "任务状态",
      //   lengthNum: 5,
      //   align: "left",
      //   loadData: [
      //     { label: "未接收", value: "0" },
      //     { label: "已接收", value: "1" },
      //     { label: "暂存", value: "2" },
      //     { label: "已完成", value: "3" },
      //     { label: "已撤回", value: "4" },
      //     { label: "已解除接收", value: "5" },
      //     { label: "已退回", value: "6" },
      //     { label: "已申请改派", value: "7" },
      //     { label: "已改派", value: "8" },
      //     { label: "已委托", value: "9" },
      //     { label: "已重做", value: "10" },
      //     { label: "已上报", value: "11" },
      //   ],
      // },
    ],
  })
);

//切换产品大类 获取对应 核保级别 下拉数据
const loadUndrClsListOptions = async (cProdNo: string) => {
  const response = await getListByCode("undrClsList", {
    cDptCde: user.value.companyId,
    cEmpCde: user.value.opCde,
    cProdNo,
  });
  // undrClsListOptions.value = response.map(item => ({ value: item.value, label: item.label }));
  // if(response.data.length>0) {
  //   response.data.map((item: any) => {value: item.value, label: item.label});
  // }

  // getListByCode('undrClsList',{
  //   cDptCde: user.value.companyId, cEmpCde: user.value.opCde, cProdNo
  // }).then((res) => {
  //   const {msg,data,code} = res;
  //   data.map((item: any) => {value: item.value, label: item.label

  //   })
  //   // undrClsListOptions.value = data.map(item => ({ value: item.value, label: item.label }));
  // })
};

const changeForm = (val: any) => {
  console.log(val);
  // freeEditRef.value?.resetFields();
  // resetForm();
  freeEditRef.value?.setFormValue({
    udrType: val,
  });
  nextTick(() => {
    formObj.notWaitObj.fromSchema.value = [];
    if (val == "1" || val == "2") {
      formObj.notWaitObj.endBtns.forEach((key) => {
        if (key.label == "批量退回") {
          key.hidden = false;
        }
      });
    } else {
      formObj.notWaitObj.endBtns.forEach((key) => {
        if (key.label == "批量退回") {
          key.hidden = true;
        }
      });
    }
    allForm.value.map((item: any, index: number) => {
      const isVal = item.showKey.findIndex((vals: any) => vals == val);

      if (isVal !== -1) {
        if (item.prop == "tm1") {
          item.rules =
            val == 3 || val == 4 || val == 5 ? [getRules("required", {})] : [];
        }
        if (item.prop == "tm2") {
          item.rules = val == 1 || val == 2 ? [getRules("required", {})] : [];
        }
        formObj.notWaitObj.fromSchema.value.push(item);
      }
    });
  });
};

const prodTotalDatas = ref([]);
onBeforeMount(() => {
	let params = {
		level: 2,
		type: 1,
		cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
		cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
	}
  getProdEnableList(params).then((res: any) => {
    if (res.data && res.data.length > 0) {
      prodTotalDatas.value = res.data;
    }
  });
});

onMounted(async () => {
  setFormItem("companyId", {
    loadData: [
      {
        label: user.value.companyCnm,
        value: user.value.companyId,
      },
    ],
  });
  const param = {
    companyId: user.value.companyId,
    cLoadSub: '0',
    tm1: [
      moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format(
        "YYYY-MM-DD 00:00:00"
      ),
      moment(new Date()).format("YYYY-MM-DD 23:59:59"),
    ],
    udrType: "1",
  }
  if (sessionStorage.getItem("navToOrderUdrListQuery")) {
    param['udrType'] = JSON.parse(
      sessionStorage.getItem("navToOrderUdrListQuery") || "{}"
    )?.udrType
  }
	freeEditRef.value?.setFormValue(param);
	// 点击消息跳转过来
	let params = route.params

  //首页跳转过来的逻辑 Start
  if (sessionStorage.getItem(AppKey.query.pcis_query_newudrlist)) {
    //首页点击搜索跳转过来的
    const homeJumpData = JSON.parse(
      sessionStorage.getItem(AppKey.query.pcis_query_newudrlist)|| '{}'
    );
    if (homeJumpData.hasOwnProperty("objId")) {
      //申请单号
      freeEditRef.value?.setValue("cAppNo", homeJumpData.objId);
      handleQuery();
    }
  } else if(sessionStorage.getItem('navToOrderUdrListQuery')) {
    // 首页点击更多跳转过来的
    const homeJumpData = JSON.parse(
      sessionStorage.getItem('navToOrderUdrListQuery') || '{}'
    );
    if(homeJumpData.hasOwnProperty("udrType")) {
      //申请单号
      freeEditRef.value?.setValue("udrType", homeJumpData.udrType);
      handleQuery();
    }
	} else if (!!params && params.param?.appNo) {
		freeEditRef.value?.setValue("cAppNo", params.param.appNo);
		handleQuery();
  } else {
    handleQuery();
  }
  //首页跳转过来的逻辑 End
});

onUnmounted(() => {
  //组件销毁，清除sessionStorage数据
  sessionStorage.getItem(AppKey.query.pcis_query_newudrlist) &&
    sessionStorage.removeItem(AppKey.query.pcis_query_newudrlist);
  sessionStorage.getItem("navToOrderUdrListQuery") &&
    sessionStorage.removeItem("navToOrderUdrListQuery");
});

onActivated(() => {
  handleQuery();
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

// 导出
const exportDown = () => {
  const CAppNo = freeEditRef.value?.getValue("CAppNo");
  const CPlyNo = freeEditRef.value?.getValue("CPlyNo");
  // 查询条件：申请单号，保单号任何一个有值时，都无需做其他查询条件校验
  if (!CAppNo && !CPlyNo) {
    // 查询时间段验证
    const date1 = freeEditRef.value?.getValue("tm1"); //投保日期
    const startTemp = date1[0];
    // if (null == startTemp.value || undefined === startTemp.value) {
    //     this._loading = false;
    //     this.msg.warning('投保起期不能为空');
    //     return;
    // }
    const start = Date.parse(startTemp.value);
    const endTemp = date1[1];
    // if (null == endTemp.value || undefined === endTemp.value) {
    //     this._loading = false;
    //     this.msg.warning('投保止期不能为空');
    //     return;
    // }
    const end = Date.parse(endTemp.value);
    // if (start - end > 0) {
    //     // this._loading = false;
    //     this.msg.warning('投保起期不能大于投保止期');
    //     return;
    // }
    if (
      new Date(date1[1]).getTime() - new Date(date1[0]).getTime() >=
      31 * 1000 * 60 * 60 * 24
    ) {
      // this._loading = false;
      ElMessage.warning("投保日期范围请控制在30天以内");
      return;
    }
  }
  const r = tableRef.value?.getPartnerPage(true); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = {
    pageNo: 1,
    pageSize: 2000,
    sortField: "name",
    bsType: "A",
    CAppStatus: "4",
    // CUdrCde: this.user.opCde, // 已核保查询去掉人员限制
    // sortOrder: this._sortValue,
    CurrentUser: user.value.opCde,
    CurrentUserOrg: user.value.companyId,
    CType: "undrList",
    CLoadSub: freeEditRef.value?.getValue("CLoadSub"),
  };
  formconfig1.endBtns[3].loading = true;
  policyService
    .excelDown(param)
    .then((res: any) => {
      formconfig1.endBtns[3].loading = false;
      if (res.size <= 0) {
        ElMessage.error({ message: "下载出错", duration: 3000 });
        return;
      }
      const fileName = "queryList.xls";
      // saveAs(res, decodeURI(fileName));
    })
    .catch((error: any) => {
      console.log("出错了", error);
      ElMessage.error({ message: "下载出错", duration: 3000 });
      formconfig1.endBtns[3].loading = false;
    });
};

// 校验表单查询
const handleQuery = (flag = true) => {
  freeEditRef.value?.validate().then((isValid: boolean) => {
    if (isValid) {
      refreshData(flag);
    } else {
      ElMessage.error("请填写必填项");
    }
  });
};

/** 查询 */
function refreshData(flag?: boolean) {
  const date1 = freeEditRef.value?.getValue("tm1"); //申请日期
  const date2 = freeEditRef.value?.getValue("tm2"); //签单日期
  if(date1 && date1[1]) {
    date1[1] = moment(date1[1]).format("YYYY-MM-DD 23:59:59")
  }
  if(date2 && date2[1]) {
    date2[1] = moment(date2[1]).format("YYYY-MM-DD 23:59:59")
  }
  let roleCde = "";
  roles.value?.length &&
    roles.value.forEach((role) => {
      roleCde = roleCde === "" ? role : `${roleCde},${role}`;
    });
  roleCde = "ROLE_00000152";
  if (
    date1 &&
    date1.length == 2 &&
    new Date(date1[1]).getTime() - new Date(date1[0]).getTime() >=
      7 * 1000 * 60 * 60 * 24
  ) {
    ElMessage.warning("申请日期范围请控制在7天以内");
    return;
  }
  if (
    date2 &&
    date2.length == 2 &&
    new Date(date2[1]).getTime() - new Date(date2[0]).getTime() >=
      31 * 1000 * 60 * 60 * 24
  ) {
    ElMessage.warning("签单日期范围请控制在30天以内");
    return;
  }
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const params = {
    ...r,
    ...s,
    tm1: date1,
    tm2: date2,
    cDptCde: user.value.companyId,
  };
  
  // 提取申请日期的开始时间和结束时间
  const tAppTmBgn = s.tm1 && s.tm1.length > 1 ? s.tm1[0] : null;
  const tAppTmEnd = s.tm1 && s.tm1.length > 1 ? s.tm1[1] : null;
  // 提取签单日期的开始时间和结束时间
  const tIssueTmBgn = s.tm2 && s.tm2.length > 1 ? s.tm2[0] : null;
  const tIssueTmEnd = s.tm2 && s.tm2.length > 1 ? s.tm2[1] : null;

  params["tAppTmBgn"] = tAppTmBgn; // 添加申请开始时间
  params["tAppTmEnd"] = tAppTmEnd; // 添加申请结束时间
  params["tIssueTmBgn"] = tIssueTmBgn; // 添加签单开始时间
  params["tIssueTmEnd"] = tIssueTmEnd; // 添加签单结束时间

  delete params.tm1;
  delete params.tm2;
  formconfig1.endBtns[0].loading = true;
  getAppTask(params)
    .then((res: any) => {
      // loading.value = false;
      if (res && res.code === 200) {
        ElMessage.success({ message: "查询完毕！", duration: 3000 });
        if(params.udrType === "1") {
          tableconfig.tableBtn = []
        } else {
          tableconfig.tableBtn = tableBtns
        }
        pageresult.list = res.data || [];
        pageresult.total = res.total || 0;
        if(flag) {
          selectData.value = []
        } else {
          if(pageresult.list.length > 0 && selectData.value?.length > 0) {
            nextTick(() => {
              tableRef.value?.clearSelection();
              pageresult.list.forEach((row:any) => {
                if (selectData.value?.find((item:any) => item.curtTask === row.curtTask)) {
                  tableRef.value?.toggleRowSelection(row, true);
                }
              });
            })
          }
        }
      } else {
        ElMessage.error({ message: res.msg, duration: 3000 });
      }
      formconfig1.endBtns[0].loading = false;
    })
    .catch((error: any) => {
      ElMessage.error({ message: error.msg, duration: 3000 });
      formconfig1.endBtns[0].loading = false;
    });
}

// 修改 暂存任务
function updateUdr(row: any) {
  const {
    objId,
    curtTask,
    cAppTyp,
    prodNo,
    cRelateBusi,
    cEdrRsnBundleCde,
    plyNo,
  } = row;
  if (row.cAppTyp === "P") {
    // 方案不校验倒签
    if (row.cProdNo === "000000") {
      const data = {
        CPlanNo: row.objId,
        TaskId: row.curtTask,
        scene: SCENE_PLAN_UW_PROCESS,
        CProdNo: "000000",
        cAppTyp: row.cAppTyp,
      };
      const en = JSON.stringify(data);
      router.push({
        path: "/index/pcis-combination/new-udr-list/combination-main",
        query: { data: en },
      });
    } else {
      const en = JSON.stringify({
        CPlanNo: row.objId,
        TaskId: row.curtTask,
        "Base.CProdNo": row.cProdNo,
        scene: SCENE_PLAN_UW_PROCESS,
        cAppTyp: row.cAppTyp,
      });
      router.push({
        path: "/index/sys-right-basic/configPlan/detail",
        query: { data: en },
      });
    }
  } else {
    // 关联交易业务，接收时给出提示
    if (
      row.cRelateBusi &&
      row.cEdrRsnBundleCde !== "s1" &&
      row.cEdrRsnBundleCde !== "s2" &&
      row.cEdrRsnBundleCde !== "c1"
    ) {
      ElMessageBox.alert(
        "该笔业务为关联交易业务，请检查是否已上传【关联交易审批单】！",
        "提示",
        {
          confirmButtonText: "确认",
        }
      );
    }
    // 批改核保调用理赔接口校验团单在途赔案
    if (row.cAppTyp === "E" && row.plyNo) {
      // 暂时注销  保证批改可核保
      checkEdrPocly({ CPlyNo: row.plyNo }).then(async (res: any) => {
        if (res && res.code === 200 && res.msg.indexOf("出险时间") > 0) {
          const confirmRes = await ElMessageBox.confirm(
            res.msg + "\n是否继续核保？",
            "提示",
            {
              confirmButtonText: "确认",
              cancelButtonText: "取消",
              type: "info",
            }
          ).catch(() => false);
          if (!confirmRes) {
            return;
          }
        }
        updateUdrDetail(row);
      });
    } else {
      updateUdrDetail(row);
    }
  }
}

// 查看详情
function updateUdrDetail(row: any) {
  getBaseInfoByAppNo({ appNo: row.cAppNo }).then((r: any) => {
    if (r.code !== 200) {
      ElMessage.error({ message: r.msg, duration: 6000 });
    } else {
      if (row.cAppTyp === "A") {
        const en = JSON.stringify({
          // scene: SCENE_PLY_UW_PROCESS,
          cAppNo: row.cAppNo,
          taskId: row.curtTask,
          cAppTyp: row.cAppTyp,
          cProdNo: row.cProdNo,
          cCiMrk: r.data.cCiMrk,
          cGrpMrk: r.data.cGrpMrk,
          cDptCde: r.data.cDptCde,
          cDptCnm: row.uwDptName,
          pageType: "PLY_UW_PROCESS_SCENE",
          sysType: row.objExt,
          plyNo: row.plyNo === "*" ? "" : row.plyNo,
          cTermNo: row.cTermNo,
          cTermNme: row.cTermNme,
          cProdNmeCn: row.cProdNmeCn,
          cPolicySource: row.cPolicySource,
          cRelateBusi: row.cRelateBusi,
          cEdrRsnBundleCde: row.cEdrRsnBundleCde,
          nRecRemPrm: row.nRecRemPrm,
          nRecRemEstAmt: row.nRecRemEstAmt,
				});
				let query = {
					param: en
				}
				if (row.udrType == '1' || row.udrType == '2') {
					query.title = '申请单审核'
				}
        router.push({
          path: "/pcisapp/myPage",
          query
        });
      } else {
        const en = JSON.stringify({
          scene:
            r.data.cEdrRsnBundleCde === "BL"
              ? SCENE_PLY_UW_PROCESSBEARER
              : SCENE_PLY_UW_PROCESS,
          cAppNo: row.objId ? row.objId : row.cAppNo,
          taskId: row.curtTask,
          cAppTyp: row.cAppTyp,
          cProdNo: row.cProdNo,
          cCiMrk: r.data.cCiMrk,
          cRsnCde: r.data.cEdrRsnBundleCde,
          cEdrType: r.data.cEdrType,
          cGrpMrk: r.data.cGrpMrk,
          cDptCde: r.data.cDptCde,
          cDptCnm: row.uwDptName,
          pageType: "PLY_UW_PROCESS_SCENE",
          sysType: row.objExt,
          plyNo: row.plyNo,
          cTermNo: row.cTermNo,
          cTermNme: row.cTermNme,
          cProdNmeCn: row.cProdNmeCn,
          cPolicySource: row.cPolicySource,
          cRelateBusi: row.cRelateBusi,
          cEdrRsnBundleCde: row.cEdrRsnBundleCde,
          nRecRemPrm: row.nRecRemPrm,
          nRecRemEstAmt: row.nRecRemEstAmt,
        });
				let query = {
					param: en
				}
				if (row.udrType == '1' || row.udrType == '2') {
					query.title = '申请单审核'
				}
        router.push({
          path: "/pcisapp/myPage",
          query
        });
      }
    }
  });
}

// 工作流处理
function handleWorkFlow(row: any, type: any) {
  const param = {
    taskId: row.curtTask,
    user: user.value,
  };

  let udrData;
  // 接收 / 取消接收
  if (type === "handleReceived") {
    udrData = hasReceived(param);
  }
  if (type === "removeReceived") udrData = removeReceived(param);
  udrData &&
    udrData
      .then((result: any) => {
        if (result.code !== 200) {
          ElMessage.error({ message: result.msg, duration: 3000 });
        } else {
          if (type === "handleReceived") {
            if (row.cAppTyp === "P") {
              const en = JSON.stringify({
                CPlanNo: row.objId,
                TaskId: row.curtTask,
                "Base.CProdNo": row.cProdNo,
                scene: SCENE_PLAN_UW_PROCESS,
                cAppTyp: row.cAppTyp,
                cTermNo: row.cTermNo,
                cTermNme: row.cTermNme,
                cProdNmeCn: row.cProdNmeCn,
                cPolicySource: row.cPolicySource,
                cRelateBusi: row.cRelateBusi,
                cEdrRsnBundleCde: row.cEdrRsnBundleCde,
              });
							let query = {
								param: en
							}
							if (row.udrType == '1' || row.udrType == '2') {
								query.title = '申请单审核'
							}
							router.push({
								path: "/pcisapp/myPage",
								query
							});
            } else {
              // 详情
              updateUdrDetail(row);
            }
          }
          if (type === "removeReceived") {
            if (result.msg === "解除接收成功!") {
              ElMessage.success({ message: result.msg, duration: 3000 });
            } else {
              ElMessage.warning({ message: result.msg, duration: 3000 });
            }
            refreshData(true);
          }
        }
      })
      .catch((error: any) => {
        console.log("出错了", error);
        ElMessage.error({
          message: "后台服务异常,请联系管理员",
          duration: 3000,
        });
      });
}

// 接收按钮 待核保任务
function handle_hasReceived(row: any) {
  const {
    objId,
    curtTask,
    cAppTyp,
    prodNo,
    cRelateBusi,
    cEdrRsnBundleCde,
    plyNo,
    cTermNme,
    cTermNo,
  } = row;
  // 关联交易业务，接收时给出提示
  if (
    cRelateBusi &&
    cEdrRsnBundleCde !== "s1" &&
    cEdrRsnBundleCde !== "s2" &&
    cEdrRsnBundleCde !== "c1"
  ) {
    ElMessageBox.alert(
      "该笔业务为关联交易业务，请检查是否已上传【关联交易审批单】！",
      "提示",
      {
        confirmButtonText: "确认",
      }
    );
  }

  if (cAppTyp === "P") {
    // 方案不校验倒签
    if ("000000" === prodNo) {
      const param = {
        taskId: curtTask,
        user: user.value,
      };
      const flag = hasReceived(param);
      flag.then((result) => {
        if (200 !== result["code"]) {
          ElMessage.error({ message: result.msg, duration: 3000 });
        } else {
          const data = {
            CPlanNo: objId,
            TaskId: curtTask,
            scene: SCENE_PLAN_UW_PROCESS,
            CProdNo: "000000",
            cAppTyp: row.cAppTyp,
            cTermNme: row.cTermNme,
            cTermNo: row.cTermNo,
            cPolicySource: row.cPolicySource,
            cRelateBusi: row.cRelateBusi,
            cEdrRsnBundleCde: row.cEdrRsnBundleCde,
          };
          const en = JSON.stringify(data);
					let query = {
						param: en
					}
					if (row.udrType == '1' || row.udrType == '2') {
						query.title = '申请单审核'
					}
					router.push({
						path: "/pcisapp/myPage",
						query
					});
        }
      });
    } else {
      handleWorkFlow(row, "handleReceived");
    }
  } else if (cAppTyp === "E" && !!plyNo) {
    checkEdrPocly({ CPlyNo: plyNo }).then(async (res) => {
      if (!!res && !!res["code"]) {
        if (res["code"] === 200 && res["msg"].indexOf("出险时间") > 0) {
          const confirmRes = await ElMessageBox.confirm(
            res.msg + "\n是否继续核保？",
            "提示",
            {
              confirmButtonText: "确认",
              cancelButtonText: "取消",
              type: "info",
            }
          ).catch(() => false);
          if (!confirmRes) {
            return;
          }
        }
        handleWorkFlow(row, "handleReceived");
      }
    });
  } else {
    handleWorkFlow(row, "handleReceived");
  }
}

// 多选事件
function handleSelectionChange(selection: any) {
	selectData.value = selection
}

// 详情 核保通过任务
function showDetails(row: any) {
  let cAppTyp = row.cAppTyp ? row.cAppTyp : row.cAppTyp;
  if (cAppTyp === "P") {
    if (row.cProdNo === "000000") {
      const param = {
        CPlanNo: row.cAppNo,
        CPlanMrk: row.cPlanMrk,
        scene: SCENE_PLAN_READ,
      };
      const en = JSON.stringify(param);
      router.push({
        path: "/index/pcis-combination/configPlan/combination-main",
        query: { data: en },
      });
    } else {
      const en = JSON.stringify({
        CPlanNo: row.cAppNo,
        // 'Base.CProdNo': plan['PrdProdPlan.CProdNo'],
        // 'Base.CGrpMrk': plan['PrdProdPlan.CGrpMrk'],
        CPlanMrk: row.cPlanMrk,
        "Base.CProdNo": row.cProdNo,
        "Base.CGrpMrk": row.cGrpMrk,
        scene: SCENE_PLAN_READ,
      });
      router.push({
        path: "/index/sys-right-basic/configPlan/detail",
        query: { data: en },
      });
    }
  } else {
    getBaseInfoByAppNo({ appNo: row.objId ? row.objId : row.cAppNo }).then(
      (r: any) => {
        if (r.code !== 200) {
          ElMessage.error({ message: r.msg, duration: 6000 });
        } else {
          if (cAppTyp === "A") {
            const en = JSON.stringify({
              // scene: SCENE_PLY_UW_PROCESS,
              cAppNo: row.objId ? row.objId : row.cAppNo,
              taskId: row.curtTask,
              cAppTyp: row.cAppTyp ? row.cAppTyp : row.cAppTyp,
              cProdNo: row.cProdNo ? row.cProdNo : row.cProdNo,
              cCiMrk: r.data.cCiMrk,
              cGrpMrk: r.data.cGrpMrk,
              cDptCde: r.data.cDptCde,
              cDptCnm: row.uwDptName ? row.uwDptName : row.cDptCnm,
              pageType: "UW_READ_SCENE",
              cTermNme: row.cTermNme,
              cTermNo: row.cTermNo,
              cProdNmeCn: row.cProdNmeCn,
              cPolicySource: row.cPolicySource,
              nRecRemPrm: row.nRecRemPrm,
              nRecRemEstAmt: row.nRecRemEstAmt,
            });
						let query = {
							param: en
						}
						if (row.udrType == '1' || row.udrType == '2') {
							query.title = '申请单审核'
						}
						router.push({
							path: "/pcisapp/myPage",
							query
						});
          } else {
            const en = JSON.stringify({
              cAppNo: row.objId ? row.objId : row.cAppNo,
              taskId: row.curtTask,
              cAppTyp: row.cAppTyp ? row.cAppTyp : row.cAppTyp,
              cProdNo: row.cProdNo ? row.cProdNo : row.cProdNo,
              cCiMrk: r.data.cCiMrk,
              cRsnCde: r.data.cEdrRsnBundleCde,
              cEdrType: r.data.cEdrType,
              cGrpMrk: r.data.cGrpMrk,
              cDptCde: r.data.cDptCde,
              cDptCnm: row.uwDptName ? row.uwDptName : row.cDptCnm,
              pageType: "UW_READ_SCENE",
              cTermNme: row.cTermNme,
              cTermNo: row.cTermNo,
              cProdNmeCn: row.cProdNmeCn,
              cPolicySource: row.cPolicySource,
              nRecRemPrm: row.nRecRemPrm,
              nRecRemEstAmt: row.nRecRemEstAmt,
            });
						let query = {
							param: en
						}
						if (row.udrType == '1' || row.udrType == '2') {
							query.title = '申请单审核'
						}
						router.push({
							path: "/pcisapp/myPage",
							query
						});
          }
        }
      }
    );
  }
}

// 编辑 核保通过任务
function handleEdit(row: any) {
  const cAppTyp = row.cAppTyp;
  let scene = SCENE_PLY_APP_MODIFY_UNSUBMIT;
  if (!!cAppTyp && cAppTyp === "E") {
    scene =
      row.cEdrRsnBundleCde === "BL"
        ? SCENE_TEMPORARY_DEPOSITBEARER
        : SCENE_EDR_APP_MODIFY_UNSUBMIT;
  }
  const en = JSON.stringify({
    scene: scene,
    cAppNo: row.objId ? row.objId : row.cAppNo,
    cProdNo: row.cProdNo,
    cAppTyp: row.cAppTyp,
    cJiMrk: row.cJiMrk,
    cDptCde: row.cDptCde,
    cDptCnm: row.uwDptName,
    cCiMrk: row.cCiMrk,
    cGrpMrk: row.cGrpMrk,
    cRsnCde: row.cEdrRsnBundleCde,
    cTermNme: row.cTermNme,
    cTermNo: row.cTermNo,
    pageType: "PLY_UW_PROCESS_SCENE",
    cProdNmeCn: row.cProdNmeCn,
    cPolicySource: row.cPolicySource,
  });
	let query = {
		param: en
	}
	if (row.udrType == '1' || row.udrType == '2') {
		query.title = '申请单审核'
	}
	router.push({
		path: "/pcisapp/myPage",
		query
	});
}

// 删除  核保通过任务
function handleDelete(id?: string) {
  ElMessageBox.confirm("确认删除数据?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(function () {
    const delResult = pcisQueryService.delTmpPolicy({ cAppNo: id });
    delResult.then((res: any) => {
      if (null != res && null != res["code"]) {
        if (res["code"] === 200) {
          ElMessage.info({ message: res.msg, duration: 3000 });
          refreshData(true);
        } else {
          ElMessage.error({ message: res.msg, duration: 3000 });
        }
      }
    });
  });
}

// 行双击事件
function rowDbClick(row:any) {
  if(row.udrType === "1") {// 待核保任务
    handle_hasReceived(row)
  } else if(row.udrType === "2") {// 暂存任务
    if (row.state == "1") {
      updateUdr(row);
    }
  } else if(row.udrType === "4") {// 核保退回任务
    showDetails(row);
  } else if(row.udrType === "5") {// 核保通过任务
    showDetails(row);
  }
}

function formatTwoLine(text, num=7) {
  if (!text) return '';
  const len = text.length;
  const maxLen = num * 2 - 1;
  if (len <= maxLen) {
    return `${text.slice(0, num)}<br/>${text.slice(num)}`;
  }
  return `${text.slice(0, num)}<br/>${text.slice(num, maxLen)}…`;
}

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
        } else {
          Object.assign(item, obj);
        }
      }
    });
  }
}

// 添加 copyText 方法
const copyText = (text: any) => {
  if (!text) {
    ElMessage.warning('没有可复制的内容');
    return;
  }

  // 检查 navigator.clipboard 是否存在
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(
        () => {
          ElMessage.success('复制成功');
        },
        () => {
          ElMessage.error('复制失败');
        }
    );
  } else {
    // 使用 document.execCommand('copy') 方法作为备选方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      const result = document.execCommand('copy');
      if (result) {
        ElMessage.success('复制成功');
      } else {
        ElMessage.error('复制失败');
      }
    } catch (err) {
      ElMessage.error('复制失败，请稍后再试');
    } finally {
      document.body.removeChild(textarea); // 清理创建的 textarea 元素
    }
  }
};
</script>

<style lang="scss" scoped>
:deep(.el-table td.el-table__cell div.cell .el-divider--vertical:last-child) {
  display: none;
}
:deep(.el-button-group .el-button) {
  width: 80px;
}
.twoLine {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-break: break-all;
  overflow: hidden;
}

.copy-icon {
  margin-left: 5px;
  cursor: pointer;
  color: #409eff;
}

.policy-info-cell {
  display: flex;
  flex-direction: column;
  // gap: 4px;
}

.policy-number-row {
  display: flex;
  align-items: center;
  line-height: 16px;
}

.policy-number-row span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.primmaryColor {
  color: var(--el-color-primary);
  cursor: pointer;
}
:deep(.el-table thead th) {
  font-weight: 600!important;
}
</style>

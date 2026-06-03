<!-- 综合查询-批单 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
    >
	  <!-- policyInfo 列的具名插槽 -->
      <template #column-policyInfo="{ row, column, index }">
        <div class="policy-info-cell">
          <div v-if="row.cAppNo" class="policy-number-row">
            <span v-html="row.cAppNo"></span>
            <el-icon class="copy-icon" @click="copyText(row.cAppNo)">
              <DocumentCopy />
            </el-icon>
          </div>
          <div v-if="row.cPlyNo" class="policy-number-row">
            <span v-html="row.cPlyNo"></span>
            <el-icon class="copy-icon" @click="copyText(row.cPlyNo)">
              <DocumentCopy />
            </el-icon>
          </div>
        </div>
      </template>
      <template #column-InsurancePeriod="{ row, column, index }">
        <div class="policy-info-cell">
          <div v-if="row.tInsrncBgnTm" class="policy-period-row">
            <span>{{ row.tInsrncBgnTm }}</span>
          </div>
          <div v-if="row.tInsrncEndTm" class="policy-period-row">
            <span>{{ row.tInsrncEndTm }}</span>
          </div>
        </div>
      </template>
       <!-- ES查询 查询条件高亮 -->
      <template #column-cAppNme="{ row }">
        <span v-html="row.cAppNme || ''"></span>
      </template>
      <template #column-cEdrNo="{ row }">
        <span v-html="row.cEdrNo || ''"></span>
      </template>
      <template #column-cInsuredNme="{ row }">
        <span v-html="row.cInsuredNme || ''"></span>
      </template>
      <template #column-cClntAddr="{ row }">
        <span v-html="row.cClntAddr || ''"></span>
      </template>
      <template #column-cNmeCn="{ row }">
        <span v-html="row.cNmeCn || ''"></span>
      </template>
      <template #column-tUdrTm="{ row }">
        <span v-html="row.tUdrTm || ''"></span>
      </template>
      <template #column-tIssueTm="{ row }">
        <span v-html="row.tIssueTm || ''"></span>
      </template>
      <template #column-nEdrPrjNo="{ row }">
        <span v-html="row.nEdrPrjNo || ''"></span>
      </template>
      <template #column-cDptCnm="{ row }">
        <span v-html="row.cDptCnm || ''"></span>
      </template>
      <template #column-cProdNmeCn="{ row }">
        <span v-html="row.cProdNmeCn || ''"></span>
      </template>
      <template #column-cSecondDptCnm="{ row }">
        <span v-html="row.cSecondDptCnm || ''"></span>
      </template>
      <template #column-cTermNme="{ row }">
        <span v-html="row.cTermNme || ''"></span>
      </template>
      <template #column-nAmt="{ row }">
        <span v-html="row.nAmt || ''"></span>
      </template>
      <template #column-nPrm="{ row }">
        <span v-html="row.nPrm || ''"></span>
      </template>
      <template #column-cUdrNme="{ row }">
        <span v-html="row.cUdrNme || ''"></span>
      </template>

	</app-table>
  </div>
</template>

<script setup lang="ts">
import { AppKey } from "@/constants/api";
import { useUserStore } from "@/store";
import { useValidator } from "@/typings/useValidator";
import { useRouter, useRoute } from "vue-router";
const { getRules } = useValidator();
const router = useRouter();
const route = useRoute();
import { codeListViewStore } from "@/store";
import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { DocumentCopy } from "@element-plus/icons-vue";
import { getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import moment from "moment";
import {
  SCENE_PLY_APP_MODIFY_UNSUBMIT,
  SCENE_TEMPORARY_DEPOSITBEARER,
  SCENE_EDR_APP_MODIFY_UNSUBMIT,
} from "@/constants/tab-constants";
import { PcisQueryService } from "@/views/payinfoManagement/service/pcis-query-service";
import dayjs from "dayjs";
const pcisQueryService = new PcisQueryService();
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
import DepartmentTree from "@/pcis/prodRef/commodityRef/DepartmentTree.vue";
import { getAppPolicyList, qryEndorseList, delTmpPolicy, queryInsuredList } from "@/api/query";
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
const policyService = new PolicyService();
// 变更列
const colChange = defineAsyncComponent(() => import("../modal/colChange.vue"));
const PrintView = defineAsyncComponent(() => import("../modal/PrintView.vue"))

let cTermNoList = ref<any>([]);  // 条款数据
let cTermNo = '';    // 条款编码
let ESOriginalData = ref<any>([]);  // ES查询原始数据，转化成驼峰为适配操作列

const props = defineProps({
  refreshData: {
    type: Boolean,
    default: false,
  },
});
const homeJumpData = ref({}); //接收首页的参数，用于查询条件回显
const queryType = ref("1");
import { FIELD_MAP } from '@/constants/fieldMaps';
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

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
const cPard = ref(null);
function extractCode(str:string) {
  // 匹配 "P+数字" 或 "纯数字"
  const pattern = /^(P\d+|\d+)/;
  return str.match(pattern)?.[0] || "";
}
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
      endBtnsPosition: "right",
      endBtns: [
          createFreeButtonBase({
              type: "primary",
              label: "查询",
              func: async () => {
                  const freeEditRefs = freeEditRef.value;
                  freeEditRefs.validate().then((isValid) => {
                      if (isValid) {
                          handleQuery();
                      }
                  });
              },
          }),
          createFreeButtonBase({
              label: "重置",
              func: () => {
                  const freeEditRefs = freeEditRef.value;
                  const s = freeEditRefs?.getFromValue(); //获取表单数据
                  for (const k in s) {
                      s[k] = null;
                  }
                  freeEditRefs?.setFormValue({
                    ...s,
                    cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
                    cLoadSub: 1,
                    tIssueTm: [
                        dayjs(new Date()).subtract(3, "month").format("YYYY-MM-DD 00:00:00"),
                        moment(new Date()).format("YYYY-MM-DD 23:59:59"),
                    ]
                  })
              },
          }),
          createFreeButtonBase({
              label: "导出",
              func: () => {},
          }),
          createFreeButtonBase({
              label: "展开",
              func: () => {
                  const freeEditRefs = freeEditRef.value;
                  const s = freeEditRefs.getFromValue(); //获取表单数据
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
                  "投保/批改申请单号 保单号 批单号 产品名称 条款名称 投/被保人名称 投/被保人证件号码",
              btnWidth: 10,
              itemWidth: 2,
              showExBtn: true,
              btnItems: {
                  // icon: "Search",
                  label: "搜索",
                  type: "primary",
                  func: () => {
                    esSearch(true);
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
                                  console.log(freeEditRef.value)
                                  freeEditRef.value.setValue(
                                      "cDptCde",
                                      selectObj.id
                                  );
                                  setFormItem("cDptCde", {
                                      loadData: [
                                          {
                                              label: selectObj.name,
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
        //   {
        //       prop: "cSecondDptCde",
        //       inputtype: "rtselect",
        //       title: "二级分公司",
        //       clearable: true,
        //   },
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
              filterable: true,
              clearable: true,
              codeParam: {
                  cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
                  cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
              },
              func: (val) => {
                  cPard.value = val;
                  setValue("cProdNo","")
                  cTermNo = "";      // 重置条款编码
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
                  codeListStore
                    .queryCodeList({
                        codeListName: "TERM_LIST_IN_GUIDE_SEARCH",
                        codeListParam:{
                        cParCde: cPard.value,
                        cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
                        cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
                    },
                    })
                    .then((res) => {
                        cTermNoList.value = res;
                        setFormItem("cProdNo", {
                            loadData: res,
                        });
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
    
              func: (val:any) => {

                if(val){
                        if(cTermNoList.value.length>0){
                            cTermNoList.value.forEach((ele) => {
                                if(ele['value']  === val){
                                    cTermNo =extractCode(ele['label'])
                                }
                            });
                        }     
                } else {
                    cTermNo = "";
                }
                 
                  console.log('条款编码',cTermNo)
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
              title: "申请单号",
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
                  } else if(!val) {
                    // 清空选中值
                    formconfig1.fromSchema?.forEach((item) => {
                        if (item.prop === "tAppTm" || item.prop === "tEdrAppTm") {
                            item.hidden = true; // 隐藏投保日期、批改申请日期
                        } else if (item.prop == "tIssueTm") {
                            item.hidden = false; // 显示签单日期
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
              typeCode: "Hangye_Type",
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
                          freeEditRef.value.setValue(
                              "cPrjCtgMidTyp",
                              ""
                          );
                          freeEditRef.value.setValue(
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
                          freeEditRef.value.setValue(
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
  })
);

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
            { label: "保单号", value: "cPlyNo" },
            { label: "批单号", value: "cEdrNo" },
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
    { title: "保单号", prop: "cPlyNo", inputtype: "rtinput", minWidth: 180 },
    { title: "批单号", prop: "cEdrNo", inputtype: "rtinput", minWidth: 180 },
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

// 定义两套列配置
const esSearchColumns = [
   {
    prop: "policyInfo",
    inputtype: "rtinput",
    title: "申请单号/保单号",
    minWidth: 200,
    fixed: "left",
    slotName: "policyInfo"
   },
   {
    prop: "cEdrNo",
    inputtype: "rtinput",
    title: "批单",
    minWidth: 180,
    slotName: "cEdrNo"
   },
   {
    prop: "nEdrPrjNo",
    inputtype: "rtinput",
    title: "批改序号",
    minWidth: 180,
    slotName: "nEdrPrjNo"
   },
   {
    prop: "cNmeCn",
    inputtype: "rtinput",
    title: "产品名称",
    minWidth: 180,
    slotName: "cNmeCn"
   },
   {
    prop: "cInsuredNme",
    inputtype: "rtinput",
    title: "被保人名称",
    minWidth: 180,
    slotName: "cInsuredNme"
   },
   {
    prop: "cInsuredCde",
    inputtype: "rtinput",
    title: "被保人证件号码",
    minWidth: 180,
   },
   {
    prop: "cMobile",
    inputtype: "rtinput",
    title: "手机号码",
    minWidth: 180,
   },
   {
    prop: "cClntAddr",
    inputtype: "rtinput",
    title: "被保人地址",
    minWidth: 180,
    slotName: "cClntAddr"
   },
   {
    prop: "cAppNme",
    inputtype: "rtinput",
    title: "投保人名称",
    minWidth: 180,
    slotName: "cAppNme"
   },
   {
    prop: "tUdrTm",
    inputtype: "rtinput",
    title: "核保日期",
    minWidth: 180,
    slotName: "tUdrTm"
   },
   {
    prop: "InsurancePeriod",
    inputtype: "rtinput",
    title: "保险期间",
    minWidth: 180,
    slotName: "InsurancePeriod"
   },
   {
    prop: "cAppStatus",
    inputtype: "rtselect",
    title: "保单状态",
    minWidth: 120,
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
];
const normalQueryColumns = [
        {
            prop: "policyInfo",
            inputtype: "rtinput",
            title: "申请单号/保单号",
            minWidth: 180,
            fixed: "left",
            slotName: "policyInfo"
        },
        {
            prop: "cAppNo",
            inputtype: "rtinput",
            title: "申请单号",
            minWidth: 180,
            isShow:false
        },
        {
            prop: "cPlyNo",
            inputtype: "rtinput",
            title: "保单号",
            minWidth: 180,
            isShow:false
        },
        {
            prop: "cEdrNo",
            inputtype: "rtinput",
            title: "批单号",
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
            prop: "cTermNme",
            inputtype: "rtinput",
            title: "条款名称",
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
];
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
                            path: "/pcisapp/pcisappView",
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
                        const data = row;if(row['cEdrRsnBundleCde']){
                            data.cRsnCde = row['cEdrRsnBundleCde'];
                        }
                        router.push({
                            path: "/pcisapp/myPage",
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
                    // 联保单不显示复制按钮
                    if (row.cCiMrk === "联保单") {
                        return true;
                    } else {
                        return false;
                    }
                },
                tableClick: async (row) => {
                    console.log(row);
                    const r = await row;
                    if (r) {
                        // 校验出单机构是否复合复制单的机构要求
                        const queryProdDptCdeParam:any = { cDptCde:  user.value.companyId }
                        if(row.cRenewMrk === "1") {
                            queryProdDptCdeParam['cPlyNo'] = row.cPlyNo
                        } else {
                            queryProdDptCdeParam['cProdNo'] = row.cProdNo
                        }
                        const queryProdDptCde:any = await policyService.queryProdDptCde(queryProdDptCdeParam)
                        if(queryProdDptCde.data !== true) {
                            ElMessage.error(queryProdDptCde.msg)
                            return
                        }
                        row.cPolicySource = '8'
                        const data = row;
                        console.log("0000000000000", data);
                        router.push({
                            path: "/pcisapp/myPage",
                            query: {
                                param: JSON.stringify({ ...data, ...{ pageType: "copy", cAppTyp: 'A' } }),
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
            createFreeButtonBase({
                id: "score",
                link: true,
                tooltip: "打印",
                type: "primary",
                size: "large",
                icon: "Printer",
                hideBtns: (row:any) => {
                    if(row.cAppStatus == '5' || row.cAppStatus == '6') {
                        return false
                    } else {
                        return true
                    }
                },
                tableClick: (row) => {
                  dzmodal
                    .open(PrintView, { type: "edit", data: row })
                    .then((res:any) => {

                    })
                },
            }),
        ],
        fromSchema:[]
    },
};
let tableconfig = reactive<AppTableConfig>(
    createTableEditConfig(tableObj.notWaitObj)
);
tableconfig.fixed= true;

onMounted(async () => {
    // 初始设置为普通查询列
    setTableColumns(false);
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
    freeEditRef.value.setValue("cDptCde", JSON.parse(sessionStorage.getItem("user")).companyId);
    setFormItem("cDptCde", {
        loadData: [
            {
                label: JSON.parse(sessionStorage.getItem("user")).companyId+JSON.parse(sessionStorage.getItem("user")).companyCnm,
                value: JSON.parse(sessionStorage.getItem("user")).companyId,
            },
        ],
    });
    pageresult.list = [];
    freeEditRef.value.setValue("tIssueTm", [
        dayjs(new Date()).subtract(3, "month").format("YYYY-MM-DD 00:00:00"),
        moment(new Date()).format("YYYY-MM-DD 23:59:59"),
    ]);
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

function setTableColumns(isEsSearch: boolean) {
  const newColumns = isEsSearch ? esSearchColumns : normalQueryColumns;
  
  // 创建新的配置对象
  const newConfig = {
    ...tableObj.notWaitObj,
    fromSchema: newColumns
  };
  // 重新赋值触发响应式更新
  Object.assign(tableconfig, newConfig);
}

// ES查询
function esSearch(flag?: boolean) {
  const tableRefs = tableRef.value;
  const freeEditRefs = freeEditRef.value;
  const r = tableRefs.getPartnerPage(flag); //获取分页数据
  const s = freeEditRefs.getFromValue(); //获取表单数据

  if (!s.cQueryStr || !s.cQueryStr.trim()) {
    ElMessage.warning("查询条件不能为空");
    return;
  }
  // ES搜索的列配置
  setTableColumns(true);

  if (s.cLoadSub == null) {
    s.cLoadSub = "1";
  }
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
  param["cTermNo"] = cTermNo;        // 条款编码
  param["IndexName"] = 'ply_insured_ik';        // es
  param["IndexType"] = 'ply_insured_info';       // es

  queryInsuredList(param)
      .then((res) => {
        const { code, data, msg } = res;
        if (200 === code) {
          let convertedData = [];
          // ES查询原始数据，转化成驼峰为适配操作列
          ESOriginalData.value = data.result;
          convertedData = ESOriginalData.value.map(item => {
            const newItem = {};
             for (const key in item) {
                if (FIELD_MAP[key]) {
                   newItem[FIELD_MAP[key]] = item[key]; // 转换字段名
                } else {
                   newItem[key] = item[key]; // 部分保持原样
                }
            }
            return newItem;
          })
          pageresult.list = [];
          pageresult.list = convertedData;
          pageresult.total = data.total;
        } else {
          ElMessage.error(msg);
        }
      })
      .finally(() => {});
}

/** 查询 */
function handleQuery(flag?: boolean) {
    // 设置查询的列配置
    setTableColumns(false);
    const tableRefs = tableRef.value;
    const freeEditRefs = freeEditRef.value;
    const r = tableRefs.getPartnerPage(flag); //获取分页数据
    const s = freeEditRefs.getFromValue(); //获取表单数据
    if (s.cLoadSub == null) {
        s.cLoadSub = "1";
    }
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
}

// 多选事件
function handleSelectionChange(selection: any) {
  console.log("selection", selection);
  removeIds.value = selection.map((item: any) => item.cPkId);
}

// 查看详情
function handleDetail(row: any) {
  const src = {
    scene: "SCENE_PLY_APP_MODIFY_UNSUBMIT",
    CCombiNo: row.cCombinationNo,
    CAppTyp: row.cAppTyp,
  };
  const en = JSON.stringify(src);
  router.push({
    path: "/index/pcis-combination-query/detail",
    query: {
      data: en,
    },
  });
}

// 编辑
function handleEdit(row: any) {
  const CAppTyp = row.cAppTyp;
  let scene = SCENE_PLY_APP_MODIFY_UNSUBMIT;
  if (CAppTyp === "E") {
    scene =
      row.cEdrRsnBundleCde === "BL"
        ? SCENE_TEMPORARY_DEPOSITBEARER
        : SCENE_EDR_APP_MODIFY_UNSUBMIT;
  }
  const src = {
    scene: scene,
    CCombiNo: row.cCombinationNo,
    CAppTyp: CAppTyp,
  };
  const en = JSON.stringify(src);
  router.push({
    path: "/index/pcis-combination-application/edit",
    query: {
      data: en,
    },
  });
}

// 删除
function handleDelete(row: any) {
  ElMessageBox.confirm("该数据删除之后将无法恢复。", "确认要删除吗？", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      pcisQueryService
        .delTmpCombinaton({ combinationNo: row.cCombinationNo })
        .then((res: any) => {
          if (res.code === 200) {
            ElMessage.info({ message: res.msg, duration: 3000 });
            handleQuery(true);
          } else {
            ElMessage.error({ message: res.msg, duration: 3000 });
          }
        });
    })
    .catch((err) => {
      console.log(err);
    });
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
        }else{
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
function setValue(key: string, value: any) {
    freeEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return freeEditRef?.value?.getValue(key);
}
defineExpose({
  setValue,
  getValue,
});
</script>

<style scoped>
.copy-icon {
  margin-left: 5px;
  cursor: pointer;
  color: #409eff;
}

.policy-info-cell {
  display: flex;
  flex-direction: column;
}

.policy-number-row {
  display: flex;
  align-items: center;
  height: 16px;
}

.policy-number-row span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}
:deep(.el-table th:nth-child(1) .cell) {
    white-space: pre-line;
}
</style>

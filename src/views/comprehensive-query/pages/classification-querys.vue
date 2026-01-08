<!-- 查询 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" class="freeEditClass" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false, isESBool)"
    >
      <!-- policyInfo 列的具名插槽 -->
       <template #column-policyInfo="{ row, column, index }">
        <div class="policy-info-cell">
          <!-- 投保 (申请单号/保单号)-->
          <template v-if="cAppType == 'A'">
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
          </template>
          <!-- 批改 (保单号)-->
          <template v-else="cAppType == 'E'">
            <div v-if="row.cPlyNo" class="policy-number-row">
                <span v-html="row.cPlyNo"></span>
                <el-icon class="copy-icon" @click="copyText(row.cPlyNo)">
                   <DocumentCopy />
                </el-icon>
            </div>
          </template>
        </div>
       </template>

       <template #column-policyInfoXJ="{ row, column, index }">
        <div class="policy-info-cell">
          <!-- 询价 -->
          <template v-if="cAppType == 'I' || row.tabtyp == 'A' || row.tabtyp == 'I'">
            <div v-if="row.cAppNo" class="policy-number-row">
                <span v-html="row.cAppNo"></span>
                <el-icon class="copy-icon" @click="copyText(row.cAppNo)">
                    <DocumentCopy />
                </el-icon>
            </div>
            <div v-if="row.cInquiryNo" class="policy-number-row">
                <span v-html="row.cInquiryNo"></span>
                <el-icon class="copy-icon" @click="copyText(row.cInquiryNo)">
                   <DocumentCopy />
                </el-icon>
            </div>
            </template>
        </div>
       </template>
       <template #column-cEdrNo="{ row }">
        <div class="policy-info-cell">
          <template v-if="cAppType == 'A' || cAppType == 'I'">
            <div v-if="row.cEdrNo" class="policy-number-row">
                <span v-html="row.cEdrNo"></span>
                <el-icon class="copy-icon" @click="copyText(row.cEdrNo)">
                    <DocumentCopy />
                </el-icon>
            </div>
          </template>
          <template v-else>
            <div v-if="row.cAppNo" class="policy-number-row">
               <span v-html="row.cAppNo"></span>
                <el-icon class="copy-icon" @click="copyText(row.cAppNo)">
                    <DocumentCopy />
                </el-icon>
            </div>
            <div v-if="row.cEdrNo" class="policy-number-row">
                <span v-html="row.cEdrNo"></span>
                <el-icon class="copy-icon" @click="copyText(row.cEdrNo)">
                    <DocumentCopy />
                </el-icon>
            </div>
          </template>
        </div>
      </template>
      <template #column-InsurancePeriod="{ row, column, index }">
        <div class="policy-info-cell">
          <div v-if="row.tInsrncBgnTm" class="policy-period-row">
            <span v-html="row.tInsrncBgnTm"></span>
          </div>
          <div v-if="row.tInsrncEndTm" class="policy-period-row">
            <span v-html="row.tInsrncEndTm"></span>
          </div>
        </div>
      </template>
      <!-- 展示成2行，第1行7个字，第2行6个字 + 超出部分用...代替，鼠标放上去可展示全部 -->
      <template #column-cDptCnm="{ row, column, index }">
        <el-tooltip :content="row.cDptCnm" placement="top">
          <span v-html="row.cDptCnm || ''" class="twoLine"></span>
        </el-tooltip>
      </template>
      <template #column-cTermNme="{ row, column, index }">
        <el-tooltip :content="row.cTermNme" placement="top">
          <span v-html="row.cTermNme || ''" class="twoLine"></span>
        </el-tooltip>
      </template>
      <template #column-cSecondDptCnm="{ row, column, index }">
        <span v-html="row.cSecondDptCnm ? row.cSecondDptCnm.split('分公司')[0] : ''"></span>
      </template>
      <template #column-cAppNme="{ row, column, index }">
        <el-tooltip :content="row.cAppNme" placement="top">
          <span v-html="row.cAppNme || ''" class="twoLine"></span>
        </el-tooltip>
      </template>
      <template #column-cInsuredNme="{ row, column, index }">
        <el-tooltip :content="row.cInsuredNme" placement="top">
          <span v-html="row.cInsuredNme || ''" class="twoLine"></span>
        </el-tooltip>
      </template>
      <!-- ES查询 查询条件高亮 -->
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
      <template #column-cProdNmeCn="{ row }">
        <el-tooltip :content="row.cProdNmeCn" placement="top">
            <span v-html="row.cProdNmeCn || ''" class="twoLine"></span>
        </el-tooltip>
      </template>
      <template #column-nAmt="{ row }">
        <span v-html="row.nAmt.toLocaleString() || ''"></span>
      </template>
      <template #column-nPrm="{ row }">
        <span v-html="row.nPrm.toLocaleString() || ''"></span>
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
import { DocumentCopy } from "@element-plus/icons-vue";
const { getRules } = useValidator();
const router = useRouter();
const route = useRoute();
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
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
const roles = user.roles;
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
import DepartmentTree from "@/pcis/prodRef/commodityRef/DepartmentTree.vue";
import {getAppPolicyList, getInquiryPolicyList, qryEndorseList, delTmpPolicy, queryInsuredList, getCustomUserList, CustomUserList, qryPolicyNewList} from "@/api/query";
// 变更列
const colChange = defineAsyncComponent(() => import("../modal/colChange.vue"));
const PrintView = defineAsyncComponent(() => import("../modal/PrintView.vue"));
// 任务痕迹
const TaskListVestige = defineAsyncComponent(
    () => import("@/views/pcis-new-udr-list/common/TaskListVestige.vue")
);
const policyService = new PolicyService();

let cTermNoList = ref<any>([]);  // 条款数据
let cTermNo = '';    // 条款编码
let ESOriginalData = ref<any>([]);  // ES查询原始数据，转化成驼峰为适配操作列
let userColumnConfig = ref<any[]>([]); // 保存用户自定义列配置
let colChangeCPkId = ref(''); // 变更列参数

let isESCode = ref('0'); // 是否es查询 1 不是0 默认否
let isESBool = ref(false); // 是否es查询布尔

// 用于缓存用户的完整勾选状态（包括原始列 + 扩展列）
let userAllCheckedColumns = ref<string[]>([]);
let isJumpingFromHome = ref(false); // 是否正在处理首页跳转
let isInitLocked = ref(true); // 加锁初始化 不查询，解决初始化快请求查询内容被【全量查询慢请求】覆盖问题
let isCopyButtonVisible = ref(false); // 复制按钮是否显示

const props = defineProps({
  refreshData: {
    type: Boolean,
    default: false,
  },
});
const homeJumpData = ref({}); //接收首页的参数，用于查询条件回显
const queryType = ref("1");
const cAppType = ref("A");
import { FIELD_MAP } from '@/constants/fieldMaps';
import {saveAs} from "file-saver";
const cPard = ref(null);
import { cannotCopy } from '@/utils/cannotCopyPlyNo';
// 核保信息
const UndrOpnList = defineAsyncComponent(
  () => import("@/views/comprehensive-query/modal/UndrOpnList.vue")
);

watch(() => {
  const freeEditRefs = freeEditRef.value;
  return freeEditRefs?.getFromValue()?.cAppTyp;
}, (newVal) => {
  updatePolicyInfoTitle(newVal);
}, { immediate: false });

function extractCode(str:string) {
  // 匹配 "P+数字" 或 "纯数字"
  const pattern = /^(P\d+|\d+)/;
  return str.match(pattern)?.[0] || "";
}

const allCAppStatus = [
  {label: "暂存", value: "1"},
  {label: "已提核", value: "2"},
  {label: "核保退回/撤回", value: "3"},
  {label: "已核待缴费", value: "4"},
  {label: "已出单", value: "5"},
{ label: "已做失效操作", value: "6" },
  {label: "见费出单退回", value: "8"},
]

const inquiryStatus = [
  {label: "暂存", value: "1"},
  {label: "已提交", value: "2"},
  {label: "询价退回/撤回", value: "3"},
  {label: "询价通过", value: "5"},
]

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
                  freeEditRefs?.validate().then((isValid:boolean) => {
                      if (isValid) {
                          handleQuery(false);
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
                  const appTm = [
                    dayjs(new Date()).subtract(6, "days").format("YYYY-MM-DD 00:00:00"),
                    moment(new Date()).format("YYYY-MM-DD 23:59:59"),
                  ]
                  freeEditRefs?.setFormValue({
                    ...s,
                    cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
                    cLoadSub: '1',
                    tIssueTm: [
                        dayjs(new Date()).subtract(6, "days").format("YYYY-MM-DD 00:00:00"),
                        moment(new Date()).format("YYYY-MM-DD 23:59:59"),
                    ],
                    tAppTm: appTm,
                    cDataTyp:"app",
                    cAppTyp:"A",
                  })
                  setValue("tEdrAppTm", appTm)
                  setValue("tInquiryTm", appTm)
              },
          }),
          createFreeButtonBase({
              label: "导出",
              func: async () => {
                  const freeEditRefs = freeEditRef.value;
                  freeEditRefs?.validate().then((isValid:boolean) => {
                      if (isValid) {
                          exportFileList(false);
                      }
                  });
              },
          }),
          createFreeButtonBase({
              label: "展开",
              func: () => {
                  const freeEditRefs = freeEditRef.value;
                  const s = freeEditRefs.getFromValue(); //获取表单数据
                  // 公共
                  formconfig1.fromSchema?.forEach((item) => {
                    if (
                        item.prop === "cPrjCtgTyp" ||
                        item.prop === "cPrjCtgMidTyp" ||
                        item.prop === "cPrjCtgSubTyp"
                    ) {
                        item.hidden = false;
                    }
                  });
                  if (s["cKindNo"] == "01") {
                      if (s["prodCNmeCn"] == "010006") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                  item.prop === "cEngineNumber"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "010009") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                  item.prop === "cLicenseNumber"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "010022") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                  item.prop === "cIdentificationNumber" ||
                                  item.prop === "cCustomerName"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "019003") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                  item.prop === "cEngineNumber"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      }
                  }
                  if (s["cKindNo"] == "04") {
                      if (s["prodCNmeCn"] == "040001") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                  item.prop === "cDetailedAddress"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "040002") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                 item.prop === "cIdentificationNumber" ||
                                 item.prop === "cEmployeeName"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "040005") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                 item.prop === "cIdentificationNumber" ||
                                 item.prop === "cWardName" ||
                                 item.prop === "cDetailedAddress"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "040006") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cIdentificationNumber" ||
                                item.prop === "cFullName" ||
                                item.prop === "cLicenseNumber"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "040007") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cIdentificationNumber" ||
                                item.prop === "cDetailedAddress" ||
                                item.prop === "cEmployeeName" ||
                                item.prop === "cLicenseNumber"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "040013") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cEngineeringCategory" ||
                                item.prop === "cProjectAddress" ||
                                item.prop === "cBuildingAddress" ||
                                item.prop === "cCreditCode"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "040016") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cIdentificationNumber" ||
                                item.prop === "cFullName" ||
                                item.prop === "cDetailedAddress"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "040019") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cOrganizationName"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "040020") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cIdentificationNumber" ||
                                item.prop === "cFullName" ||
                                item.prop === "cLicenseNumber"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "040021") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cDetailedAddress"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "041001") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cFullName" ||
                                item.prop === "cIdentificationNumber" ||
                                item.prop === "cLicenseNumber" ||
                                item.prop === "cDetailedAddress"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "041007") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                 item.prop === "cIdentificationNumber" ||
                                 item.prop === "cWardName"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "041015") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                  item.prop === "cDetailedAddress" ||
                                  item.prop === "cCoachStaff"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "042002") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                  item.prop === "cDetailedAddress"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "042003") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cSchoolAddress" ||
                                item.prop === "cIdentificationNumber" ||
                                item.prop === "cWardName"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "043001") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cLicenseNumber" 
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "043002") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cVinCode" || 
                                item.prop === "cPlateNumber"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "043004" || s["prodCNmeCn"] == "043005") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cDetailedAddress" 
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "043009") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cIdentificationNumber" ||
                                item.prop === "cEmployeeName" ||
                                item.prop === "cDetailedAddress"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "043010") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                  item.prop === "cIdentificationNumber" ||
                                  item.prop === "cWardName"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "043011") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                  item.prop === "cDetailedAddress"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "043013") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                  item.prop === "cDetailedAddress"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "043020") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cIdentificationNumber" ||
                                item.prop === "cDetailedAddress" ||
                                item.prop === "cFullName"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "045001") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cEmployeeName" ||
                                item.prop === "cIdentificationNumber" ||
                                item.prop === "cDetailedAddress"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "047001") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cDriverName" ||
                                item.prop === "cIdentificationNumber"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "047002" || s["prodCNmeCn"] == "049001" ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cDetailedAddress"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if ( s["prodCNmeCn"] == "049020" ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                 item.prop === "cWardName" ||
                                 item.prop === "cIdentificationNumber"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if ( s["prodCNmeCn"] == "049021" ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                 item.prop === "cProvince"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if ( s["prodCNmeCn"] == "049024" ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cIdentificationNumber" ||
                                item.prop === "cFullName" ||
                                item.prop === "cDetailedAddress" ||
                                item.prop === "cLicenseNumber"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if ( s["prodCNmeCn"] == "049026" ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cDetailedAddress"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if ( s["prodCNmeCn"] == "049027" ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cFullName" ||
                                item.prop === "cIdentificationNumber"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if ( s["prodCNmeCn"] == "049028" ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cProvince"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if ( s["prodCNmeCn"] == "049029" ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cLicenseNumber" ||
                                item.prop === "cEmployeeName" ||
                                item.prop === "cIdentificationNumber"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if ( s["prodCNmeCn"] == "049030" ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cDetailedAddress"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if ( s["prodCNmeCn"] == "049031" ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cFullName" ||
                                item.prop === "cIdentificationNumber" ||
                                item.prop === "cLicenseNumber" ||
                                item.prop === "cDetailedAddress"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if ( s["prodCNmeCn"] == "049033" ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cDetailedAddress" ||
                                item.prop === "cIdentificationNumber" ||
                                item.prop === "cFullName"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } 
                  }
                  if (s["cKindNo"] == "05") {
                      if (s["prodCNmeCn"] == "059003") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                  item.prop === "cIdentificationNumber" ||
                                  item.prop === "cEmployeeName"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "059902" || s["prodCNmeCn"] == "059903" 
                      || s["prodCNmeCn"] == "059904" || s["prodCNmeCn"] == "059906" || s["prodCNmeCn"] == "059907" 
                      || s["prodCNmeCn"] == "059908" || s["prodCNmeCn"] == "059910" || s["prodCNmeCn"] == "059912" 
                      || s["prodCNmeCn"] == "059913" || s["prodCNmeCn"] == "059914" || s["prodCNmeCn"] == "059915"
                      ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                 item.prop === "cIdentificationNumber" ||
                                 item.prop === "cBorrowerName"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } 
                  }
                  if (s["cKindNo"] == "07") {
                      if (s["prodCNmeCn"] == "070001" || s["prodCNmeCn"] == "070005") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                  item.prop === "cCustomerName" ||
                                  item.prop === "cLicenseNumber"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "070002" ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                 item.prop === "cDetailedAddress" 
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } 
                  }
                  if (s["cKindNo"] == "08") {
                      if (s["prodCNmeCn"] == "080002") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                  item.prop === "cMembersNames"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "080003" ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cIdentificationNumber" ||
                                item.prop === "cFullName" ||
                                item.prop === "cMembersNames"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "080007" || s["prodCNmeCn"] == "080008" || s["prodCNmeCn"] == "089005") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cDetailedAddress"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "080011" ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cIdentificationNumber" ||
                                item.prop === "cFullName"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "089030" ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cDetailAddr"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "089031" ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cMembersNames"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } 
                  }
                  if (s["cKindNo"] == "09") {
                      if (s["prodCNmeCn"] == "090001" || s["prodCNmeCn"] == "090002" || s["prodCNmeCn"] == "090003"  ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                  item.prop === "cDetailedAddress"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      }
                  }
                  if (s["cKindNo"] == "12") {
                      if (s["prodCNmeCn"] == "120001" ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                  item.prop === "cHolderName" ||
                                  item.prop === "cCarrierName"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } 
                  }
                  if (s["cKindNo"] == "13") {
                      if (s["prodCNmeCn"] == "130001" || s["prodCNmeCn"] == "130002" || s["prodCNmeCn"] == "130003") {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                  item.prop === "cIdNumber" ||
                                  item.prop === "cBorrowerName"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } 
                  }
                  if (s["cKindNo"] == "16") {
                      if (s["prodCNmeCn"] == "169001" ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                  item.prop === "cEngineNumber"
                              ) {
                                  item.hidden = false;
                              }
                          });
                      } else if (s["prodCNmeCn"] == "169002" ) {
                          formconfig1.fromSchema?.forEach((item) => {
                              if (
                                item.prop === "cIdentificationNumber" ||
                                item.prop === "cFullName" ||
                                item.prop === "cMembersNames"
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
            func: async () => {
                // 构建弹窗所需格式
                let modalData: any[] = [];
                modalData = [{
                    prop: 'bsType',
                    inputtype: 'rtcheckboxgroup',
                    itemWidth: 3,
                    loadData: buildAllCheckboxData() // 完整勾选状态
                }];

                dzmodal.open(colChange, { type: "edit", data: modalData, userSaved: !!colChangeCPkId.value })
                .then(async (res) => {
                    if (res.type === "ok") {
                    const selectedProps = res.body.body; // 用户选中的列
                    userAllCheckedColumns.value = selectedProps; // 更新缓存
                    
                    // 保存到接口
                    const saveParam = {
                        cPkId: colChangeCPkId.value || null,
                        content: [{
                            prop: 'bsType',
                            inputtype: 'rtcheckboxgroup',
                            loadData: buildAllCheckboxData() // 用最新状态保存
                        }],
                        type: 'search',
                        cCrtCde: JSON.parse(sessionStorage.getItem("user")).opCde,
                    };
                    try {
                        const saveRes = await CustomUserList(saveParam);
                        if (saveRes.code == 200) {
                          ElMessage.success("列配置已更新");
                          colChangeCPkId.value = saveRes.data.data.cPkId || '';
                          
                          applyCheckedColumns(selectedProps); // 更新表头
                        } else {
                          ElMessage.error(saveRes.msg || "保存失败");
                        }
                    } catch (error) {
                          ElMessage.error("保存失败");
                    }
                    }
                });
            }
          })
      ],
      fromSchema: [
          {
              prop: "cQueryStr",
              inputtype: "rtinput",
              title: "查询条件",
              placeholder:
                  "询价/投保/批改申请单号 询价单号 保单号 批单号 产品名称 条款名称 投/被保人名称 投/被保人证件号码",
              btnWidth: 10,
              itemWidth: 2,
              showExBtn: true,
              btnItems: {
                  label: "搜索",
                  type: "primary",
                  btnStyle: {'font-size': '16px'},
                  func: () => {
                    handleQuery(true, true);
                  },
              },
          },
          {
              prop: "cDptCde",
              inputtype: "rtselect",
              title: "机构部门",
              btnWidth: 10,
              itemWidth: 2,
              showExBtn: true,
              rules: [getRules("required", {})],
              btnItems: {
                  icon: "Search",
                  type: "primary",
                  btnStyle: {width: '100%'},
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
              title: "是否包含下级",
              loadData: [
                  { label: "是", value: '1' },
                  { label: "否", value: '0' },
              ],
              defaultValue: '1',
          },
          {
              prop: "cKindNo",
              inputtype: "rtselect",
              title: "产品大类",
              itemWidth: 1,
              rules: [{ type: "required" }],
              typeCode: "KIND_LIST_GRT",
              child: "prodCNmeCn",
              filterable: true,
              clearable: true,
              codeParam: {
                  cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
                  cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
              },
              func: (val) => {
                  setValue("prodCNmeCn","")
                  setValue("cProjectName","")
                  setValue("cDetailedAddress","")
                  cTermNo = "";      // 重置条款编码
                  cPard.value = val;
                  formconfig1.fromSchema?.forEach((item) => {
                      if (
                          item.prop === "cEmployeeName" ||
                          item.prop === "cIdentificationNumber" ||
                          item.prop === "cDetailedAddress"||
                          item.prop === "cEngineNumber"||
                          item.prop === "cLicenseNumber" ||
                          item.prop === "cCustomerName" ||
                          item.prop === "cWardName" ||
                          item.prop === "cFullName" ||
                          item.prop === "cProjectAddress" ||
                          item.prop === "cBuildingAddress" ||
                          item.prop === "cCreditCode" ||
                          item.prop === "cOrganizationName" ||
                          item.prop === "cCoachStaff" ||
                          item.prop === "cSchoolAddress" ||
                          item.prop === "cProvince" ||
                          item.prop === "cDriverName" ||
                          item.prop === "cMembersNames" ||
                          item.prop === "cDetailAddr" ||
                          item.prop === "cHolderName" ||
                          item.prop === "cCarrierName" ||
                          item.prop === "cIdNumber" ||
                          item.prop === "cBorrowerName"||
                          item.prop === "cPrjCtgTyp" ||
                          item.prop === "cPrjCtgMidTyp" ||
                          item.prop === "cPrjCtgSubTyp" ||
                          item.prop === "cVinCode" ||
                          item.prop === "cPlateNumber"
                      ) {
                          item.hidden = true;
                      }
                  });
                  codeListStore
                    .queryCodeList({
                        codeListName: "PROD_LIST_GRT",
                        codeListParam:{
                        cParCde: cPard.value,
                        cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
                        cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
                    },
                    })
                    .then((res) => {
                        cTermNoList.value = res;
                        setFormItem("prodCNmeCn", {
                            loadData: res,
                        });
                    });
              },
          },
          {
             prop: "prodCNmeCn",
             inputtype: "rtselect",
             title: "产品名称",
             clearable: true,
             child: "cProdNo",
             filterable: true,
             func: (val) => {
                  setValue("cProdNo","")
                  cTermNo = "";      // 重置条款编码
                  formconfig1.fromSchema?.forEach((item) => {
                      if (
                          item.prop === "cEmployeeName" ||
                          item.prop === "cIdentificationNumber" ||
                          item.prop === "cDetailedAddress"||
                          item.prop === "cEngineNumber"||
                          item.prop === "cLicenseNumber" ||
                          item.prop === "cCustomerName" ||
                          item.prop === "cWardName" ||
                          item.prop === "cFullName" ||
                          item.prop === "cProjectAddress" ||
                          item.prop === "cBuildingAddress" ||
                          item.prop === "cCreditCode" ||
                          item.prop === "cOrganizationName" ||
                          item.prop === "cCoachStaff" ||
                          item.prop === "cSchoolAddress" ||
                          item.prop === "cProvince" ||
                          item.prop === "cDriverName" ||
                          item.prop === "cMembersNames" ||
                          item.prop === "cDetailAddr" ||
                          item.prop === "cHolderName" ||
                          item.prop === "cCarrierName" ||
                          item.prop === "cIdNumber" ||
                          item.prop === "cBorrowerName"||
                          item.prop === "cPrjCtgTyp" ||
                          item.prop === "cPrjCtgMidTyp" ||
                          item.prop === "cPrjCtgSubTyp" ||
                          item.prop === "cVinCode" ||
                          item.prop === "cPlateNumber"
                      ) {
                          item.hidden = true;
                      }
                  });
                  codeListStore
                    .queryCodeList({
                        codeListName: "TERM_LIST_IN_GUIDE_SEARCH",
                        codeListParam:{
                        value: val,
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
              title: "条款名称",
              itemWidth: 1,
              rules: [{ type: "required" }],
              filterable: true,
              clearable: true,
              func: (val:any) => {
                if(val){
                        if(cTermNoList.value.length>0){
                            cTermNoList.value.forEach((ele) => {
                                if(ele['value']  === val){
                                    cTermNo = extractCode(ele['label'])
                                }
                            });
                        }
                } else {
                    cTermNo = "";
                }
                console.log('条款编码',cTermNo)
                formconfig1.fromSchema?.forEach((item) => {
                      if (
                          item.prop === "cEmployeeName" ||
                          item.prop === "cIdentificationNumber" ||
                          item.prop === "cDetailedAddress"||
                          item.prop === "cEngineNumber"||
                          item.prop === "cLicenseNumber" ||
                          item.prop === "cCustomerName" ||
                          item.prop === "cWardName" ||
                          item.prop === "cFullName" ||
                          item.prop === "cProjectAddress" ||
                          item.prop === "cBuildingAddress" ||
                          item.prop === "cCreditCode" ||
                          item.prop === "cOrganizationName" ||
                          item.prop === "cCoachStaff" ||
                          item.prop === "cSchoolAddress" ||
                          item.prop === "cProvince" ||
                          item.prop === "cDriverName" ||
                          item.prop === "cMembersNames" ||
                          item.prop === "cDetailAddr" ||
                          item.prop === "cHolderName" ||
                          item.prop === "cCarrierName" ||
                          item.prop === "cIdNumber" ||
                          item.prop === "cBorrowerName"||
                          item.prop === "cPrjCtgTyp" ||
                          item.prop === "cPrjCtgMidTyp" ||
                          item.prop === "cPrjCtgSubTyp" ||
                          item.prop === "cVinCode" ||
                          item.prop === "cPlateNumber"
                      ) {
                          item.hidden = true;
                      }
                });
              },
          },
          {
              prop: "cAppNo",
              inputtype: "rtinput",
              title: "询价/投保/批改申请单号",
              clearable: true,
              labelLength: 12,
          },
          {
              prop: "cPlyNo",
              inputtype: "rtinput",
              title: "询价单号/保单号/批单号",
              clearable: true,
              labelLength: 12,
          },
          {
              prop: "cAppTyp",
              inputtype: "rtselect",
              title: "任务类型",
              minWidth: 180,
              loadData: [
                  { label: "投保", value: "A" },
                  { label: "批改", value: "E" },
                  { label: "询价", value: "I" },
              ],
              func: (val:any) => {
                  if (val === "A") {
                      // 投保
                      formconfig1.fromSchema?.forEach((item) => {
                          if (item.prop === "tAppTm") {
                              item.hidden = false; // 显示投保日期
                              // 设置默认值为最近7天
                              const endDate = moment(new Date()).format("YYYY-MM-DD 23:59:59");
                              const startDate = moment(new Date()).subtract(6, "days").format("YYYY-MM-DD 00:00:00");
                            //   freeEditRef.value?.setValue("tAppTm", [startDate, endDate]);
                          } else if (item.prop == "tEdrAppTm" || item.prop == "tInquiryTm") {
                              item.hidden = true;
                          } else if (item.prop == "cPlyNo" || item.prop == "cDataTyp") {
                             item.hidden = false;
                          } else if (item.prop === "cAppStatus") {
                            item.loadData = allCAppStatus;
                          }
                      });
                      // 初始化不查询
                      if (isInitLocked.value) return; 
                      // 从首页跳转过来不查询
                      if (!isJumpingFromHome.value) {
                        handleQuery(true);
                      }
                  } else if (val === "E") {
                      // 批改
                      formconfig1.fromSchema?.forEach((item) => {
                          if (item.prop === "tEdrAppTm") {
                              item.hidden = false; // 显示批改申请日期
                            // 设置默认值为最近7天
                            const endDate = moment(new Date()).format("YYYY-MM-DD 23:59:59");
                            const startDate = moment(new Date()).subtract(6, "days").format("YYYY-MM-DD 00:00:00");
                            // freeEditRef.value?.setValue("tEdrAppTm", [startDate, endDate]);
                          } else if (item.prop == "tAppTm" || item.prop == "tInquiryTm") {
                            item.hidden = true;
                          } else if (item.prop == "cPlyNo" || item.prop == "cDataTyp") {
                            item.hidden = false;
                          } else if (item.prop === "cAppStatus") {
                            item.loadData = allCAppStatus;
                          }
                      });
                      handleQuery(true);
                  } else if (val === "I") {
                      // 询价
                      formconfig1.fromSchema?.forEach((item) => {
                          if (item.prop === "tInquiryTm") {
                              item.hidden = false; // 显示询价日期，询价单号
                            // 设置默认值为最近7天
                            const endDate = moment(new Date()).format("YYYY-MM-DD 23:59:59");
                            const startDate = moment(new Date()).subtract(6, "days").format("YYYY-MM-DD 00:00:00");
                            // freeEditRef.value?.setValue("tInquiryTm", [startDate, endDate]);
                          } else if (item.prop == "tAppTm" || item.prop == "tEdrAppTm" || item.prop == "cDataTyp" ) {
                              item.hidden = true;
                          } else if (item.prop == "cPlyNo") {
                              item.hidden = false;
                          } else if (item.prop === "cAppStatus") {
                            // item.loadData = allCAppStatus.filter(o => o.value !== "4");
                            item.loadData = inquiryStatus
                          }
                      });
                       handleQuery(true);

                  } else if(!val) {
                    // 清空选中值
                    formconfig1.fromSchema?.forEach((item) => {
                        if (item.prop === "tEdrAppTm" || item.prop === "tInquiryTm") {
                            item.hidden = true; //批改申请日期、询价日期、询价单号
                        } else if (item.prop == "tAppTm") {
                            item.hidden = false; // 默认显示投保日期
                        } else if (item.prop == "cPlyNo" || item.prop == "cDataTyp") {
                            item.hidden = false;
                        } 
                    });
                     handleQuery(true);
                  }
              },
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
              prop: "cAppStatus",
              inputtype: "rtselect",
              title: "任务状态",
              clearable: true,
              loadData: [
                  { label: "暂存", value: "1" },
                  { label: "已提核", value: "2" },
                  { label: "核保退回/撤回", value: "3" },
                  { label: "已核待缴费", value: "4" },
                  { label: "已出单", value: "5" },
                  { label: "见费出单退回", value: "8" },
              ],
          },
          {
              prop: "tAppTm",
              inputtype: "rtdatepicker",
              title: "申请日期",  // 投保日期
              format: "YYYY-MM-DD",
              valueFormat: "YYYY-MM-DD HH:mm:ss",
              clearable: true,
              type: "datetimerange",
            //   rules: [getRules("required", {})],
              func: (val:any) => {
                if(val) {
                  setValue("tEdrAppTm", val)
                  setValue("tInquiryTm", val)
                }
              }
          },
          {
              prop: "tEdrAppTm",
              inputtype: "rtdatepicker",
              title: "申请日期", // 批改申请日期
              format: "YYYY-MM-DD",
              valueFormat: "YYYY-MM-DD HH:mm:ss",
              clearable: true,
              type: "datetimerange",
            //   rules: [getRules("required", {})],
              func: (val:any) => {
                if(val) {
                  setValue("tAppTm", val)
                  setValue("tInquiryTm", val)
                }
              }
          },
          {
              prop: "tInquiryTm",
              inputtype: "rtdatepicker",
              title: "申请日期",  // 询价投保日期
              format: "YYYY-MM-DD",
              valueFormat: "YYYY-MM-DD HH:mm:ss",
              clearable: true,
              type: "datetimerange",
              hidden: true,
            //   rules: [getRules("required", {})],
              func: (val:any) => {
                if(val) {
                  setValue("tEdrAppTm", val)
                  setValue("tAppTm", val)
                }
              }
          },
          {
              prop: "tIssueTm",
              inputtype: "rtdatepicker",
              title: "签单日期",
              format: "YYYY-MM-DD",
              valueFormat: "YYYY-MM-DD HH:mm:ss",
              clearable: true,
              type: "datetimerange",
          },
          {
              prop: "cDataTyp",
              inputtype: "rtselect",
              title: "查询范围",
              clearable: true,
              loadData: [
                  { label: "全部保批单", value: "app" },
                  { label: "最新保批单", value: "ply" },
              ],
          },
          {
              prop: "cEmployeeName",
              inputtype: "rtinput",
              title: "雇员名称",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cWardName",
              inputtype: "rtinput",
              title: "清单人员姓名",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cIdentificationNumber",
              inputtype: "rtinput",
              title: "清单人员证件号",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cDetailedAddress",
              inputtype: "rtinput",
              title: "地址",
              clearable: true,
              hidden: true,
          },
          // 新
          {
              prop: "cEngineNumber",
              inputtype: "rtinput",
              title: "发动机号",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cLicenseNumber",
              inputtype: "rtinput",
              title: "车牌号",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cCustomerName",
              inputtype: "rtinput",
              title: "客户名称",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cFullName",
              inputtype: "rtinput",
              title: "雇员姓名",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cProjectAddress",
              inputtype: "rtinput",
              title: "项目地址",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cBuildingAddress",
              inputtype: "rtinput",
              title: "工程地址",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cCreditCode",
              inputtype: "rtinput",
              title: "统一社会信用代码证号",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cOrganizationName",
              inputtype: "rtinput",
              title: "组织名称",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cCoachStaff",
              inputtype: "rtinput",
              title: "教练人员",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cSchoolAddress",
              inputtype: "rtinput",
              title: "学校地址",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cProvince",
              inputtype: "rtinput",
              title: "申报机构所在省",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cDriverName",
              inputtype: "rtinput",
              title: "驾驶员",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cMembersNames",
              inputtype: "rtinput",
              title: "被保险家庭成员姓名",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cDetailAddr",
              inputtype: "rtinput",
              title: "标的地址",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cHolderName",
              inputtype: "rtinput",
              title: "持票人姓名",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cCarrierName",
              inputtype: "rtinput",
              title: "承运人名称",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cIdNumber",
              inputtype: "rtinput",
              title: "借款人证件号码",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cBorrowerName",
              inputtype: "rtinput",
              title: "借款人名称",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cVinCode",
              inputtype: "rtinput",
              title: "车架号",
              clearable: true,
              hidden: true,
          },
          {
              prop: "cPlateNumber",
              inputtype: "rtinput",
              title: "车牌号",
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
                 if(v){
                    setValue("cPrjCtgMidTyp","");
                    setValue("cPrjCtgSubTyp","")
                    formconfig1.fromSchema?.forEach((item) => {
                        if (item.prop === "cPrjCtgMidTyp") {
                            item.typeCode = "CPrjCtgTyp_List";
                            item.codeParam = {
                                CRangeCde: user.value.companyId,
                                cLev: 2,
                                CParCde: v,
                            };
                        }
                    });
                 }
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
                 if(v){
                  setValue("cPrjCtgSubTyp","")
                  formconfig1.fromSchema?.forEach((item) => {
                      if (item.prop === "cPrjCtgSubTyp") {
                          item.typeCode = "CPrjCtgTyp_List";
                          item.codeParam = {
                              CRangeCde: user.value.companyId,
                              cLev: 3,
                              CParCde: v,
                          };
                      }
                  });
                 }
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

// 原始列配置
const normalQueryColumns = [
    {
        prop: "policyInfo",
        inputtype: "rtinput",
        title: "申请单号/保单号",
        lengthNum: 21,
        lengthIsNumber: true,
        fixed: "left",
        slotName: "policyInfo"
    },
    {
        prop: "policyInfoXJ",
        inputtype: "rtinput",
        title: "询价申请单号/询价单号",
        lengthNum: 21,
        lengthIsNumber: true,
        fixed: "left",
        slotName: "policyInfoXJ"
    },
    {
        prop: "cEdrNo",
        inputtype: "rtinput",
        title: "批改申请单号/批单号",
        lengthNum: 21,
        lengthIsNumber: true,
        fixed: "left",
        slotName: "cEdrNo"
    },
    {
        prop: "cSecondDptCnm",
        inputtype: "rtinput",
        title: "分公司",
        lengthNum: 3,
        formatter:(val:any)=>{
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
        lengthNum: 12,
    },
    {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
        slotName: "cAppNme",
        align: 'left',
        lengthNum: 12,
    },
    {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
        slotName: "cInsuredNme",
        align: 'left',
        lengthNum: 12,
    },
    {
        prop: "cProdNmeCn",
        inputtype: "rtinput",
        title: "产品名称",
        lengthNum: 13,
        slotName: "cProdNmeCn",
        align: 'left',
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
        prop: "nAmt",
        inputtype: "rtinput",
        title: "保额",
        lengthNum: 13,
        lengthIsNumber: true,
        slotName: "nAmt",
        align: 'left',
    },
    {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "保费",
        lengthNum: 12,
        lengthIsNumber: true,
        prefix: "¥ ",
        slotName: "nPrm",
        align: 'left'
    },
    {
        prop: "tIssueTm",
        inputtype: "rtinput",
        title: "签单日期",
        lengthNum: 17,
        lengthIsNumber: true,
        sortable: true,
        slotName: "tIssueTm"
    },
    {
        prop: "InsurancePeriod",
        inputtype: "rtinput",
        title: "保险期间",
        lengthNum: 17,
        lengthIsNumber: true,
        slotName: "InsurancePeriod",
        align: 'left'
    },
    {
        prop: "cAppStatus",
        inputtype: "rtinput",
        title: "任务状态",
        lengthNum: 7,
        align: "left",
        loadData: [
            { label: "暂存", value: "1" },
            { label: "已提核", value: "2" },
            { label: "核保退回/撤回", value: "3" },
            { label: "已核待缴费", value: "4" },
            { label: "已出单", value: "5" },
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
        formatter:(val:any, row:any) => {
            if(row.taskTyp === "I") {
                return inquiryStatus.find((item:any) => item.value === val)?.label
            } else {
                return allCAppStatus.find((item:any) => item.value === val)?.label
            }
        }
    },
    {
        prop: "nEdrPrjNo",
        inputtype: "rtinput",
        title: "批改序号",
        maxWidth: 120,
        lengthNum: 4,
        slotName: "nEdrPrjNo"
    },
    {
        prop: "cRsnCde",
        inputtype: "rtinput",
        title: " 批改原因",
        typeCode: "EDR_RSN_LIST_KIND",
        align: 'left',
        lengthNum: 8,
				formatter: (val:any, row:any) => {
					return row.cRsnCdeText || "";
				},
    }
]
// 扩展列（仅用于变更列弹窗，默认未勾选）
const extendColumns = [
  { prop: 'cCiMrk', inputtype: "rtselect", title: '共保类型', optional: true, align: 'left', lengthNum: 12, loadData: [
        { label: "非共保业务", value: "0" },
        { label: "外部共保我方主共_主联", value: "1" },
        { label: '外部共保我方从共_主联', value: "2" },
        { label: "外部共保我方主共_无联保", value: "3" },
        { label: "外部共保我方从共_无联保", value: "4" },
        { label: "司内联保_主联", value: "5" },
        { label: "联保单", value: "6" },
    ] 
  },
  { prop: 'tCrtTm', inputtype: "rtinput", title: '申请日期', lengthNum: 17, lengthIsNumber: true, optional: true, sortable: true, rules: [getRules("required", {})]},
  { prop: 'tUdrTm', inputtype: "rtinput", title: '核保日期', lengthNum: 17, lengthIsNumber: true, optional: true, sortable: true, slotName: "tUdrTm" },
  { prop: 'cPrjCtgTyp', inputtype: "rtinput", title: '项目大类', lengthNum: 12, optional: true, align: 'left', },
  { prop: 'cPrjCtgMidTyp', inputtype: "rtinput", title: '项目中类', lengthNum: 12, optional: true, align: 'left', },
  { prop: 'cPrjCtgSubTyp', inputtype: "rtinput", title: '项目子类', lengthNum: 12, optional: true, align: 'left', },
  { prop: 'nInsuranceVariation', inputtype: "rtinput", title: '保额变化量', lengthNum: 14, optional: true,align: 'left',formatter:(val:any) => {return val?.toLocaleString()} },
  { prop: 'nPremiumVariation', inputtype: "rtinput", title: '保费变化量', lengthNum: 13, optional: true,align: 'left',formatter:(val:any) => {return val?.toLocaleString()} },
  { prop: 'CSlsNme', inputtype: "rtinput", title: '录单员', optional: true, align: 'left',lengthNum: 4 },
  { prop: 'cUdrNme', inputtype: "rtinput", title: '核保人', optional: true, slotName: "cUdrNme", align: 'left',lengthNum: 4},
  { prop: 'cPrnNo', inputtype: "rtinput", title: '保批单印刷号', optional: true, lengthNum: 18, lengthIsNumber: true},
  { prop: 'invoiceNum', inputtype: "rtinput", title: '保费发票号', optional: true,lengthNum: 18, lengthIsNumber: true },
];

const tableObj = {
    // 查询单 投保单 保单 批单
    notWaitObj: {
        defaultSort: { prop: 'tIssueTm', order: 'descending' },
        defaultSort: { prop: 'tCrtTm', order: 'descending' },
        defaultSort: { prop: 'tUdrTm', order: 'descending' },
        tableBtnType: "btn",
        tableBtnWidth: 95,
        tableBtnPosition: "right",
        rowDbClickFun: (row:any) => handleRowDoubleClick(row),
        tableBtn: [
            createFreeButtonBase({
                id: "score",
                link: true,
                tooltip: "查看",
                type: "danger",
                size: "large",
                icon: "View",
                hideBtns: (row: any) => {
                    return false;
                },
                tableClick: async (row) => {
                    const r = await row;

                    // 把ES带html的字段洗净
                    const cleanRow = {
                        ...r,
                        cAppNo: stripHtml(r.cAppNo),
                        cPlyNo: stripHtml(r.cPlyNo),
                        cEdrNo: stripHtml(r.cEdrNo),
                        cDptCnm: stripHtml(r.cDptCnm),
                        nEdrPrjNo: stripHtml(r.nEdrPrjNo),
                        cInquiryNo: stripHtml(r.cInquiryNo),
                        tInsrncBgnTm: stripHtml(r.tInsrncBgnTm),
                        tInsrncEndTm: stripHtml(r.tInsrncEndTm),
                        cTermNme: stripHtml(r.cTermNme),
                        cSecondDptCnm: stripHtml(r.cSecondDptCnm),
                        cAppNme: stripHtml(r.cAppNme),
                        cInsuredNme: stripHtml(r.cInsuredNme),
                        cClntAddr: stripHtml(r.cClntAddr),
                        cNmeCn: stripHtml(r.cNmeCn),
                        tUdrTm: stripHtml(r.tUdrTm),
                        tIssueTm: stripHtml(r.tIssueTm),
                        cProdNmeCn: stripHtml(r.cProdNmeCn),
                        nAmt: stripHtml(r.nAmt),
                        nPrm: stripHtml(r.nPrm),
                        cUdrNme: stripHtml(r.cUdrNme),
                    };
                    if (cleanRow) {
                        const data = cleanRow;
                        router.push({
                            path: !!row["taskTyp"] && ("I" == row["taskTyp"] ) ? "/pcisapp/priceView" : "/pcisapp/pcisappView",
                            query: {
                                param: JSON.stringify({ ...data, ...{ pageType: "readonly", pageName: !!row["taskTyp"] && ("I" == row["taskTyp"] ) ? "priceInquiry": "" } }),
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
                    // 联保单6不显示复制按钮;询价单没有复制;核保岗隐藏复制按钮
                    if (row.cCiMrk === "6" || row.taskTyp === "I" || !isCopyButtonVisible.value || row.cPlyNo?.length > 18 || cannotCopy(row.cPlyNo) || row.canCopy != 1) {
                        return true;
                    } else {
                        return false;
                    }
                },
                tableClick: async (row) => {
                    const r = await row;
                    // 把ES带html的字段洗净
                    const cleanRow = {
                        ...r,
                        cAppNo: stripHtml(r.cAppNo),
                        cPlyNo: stripHtml(r.cPlyNo),
                        cEdrNo: stripHtml(r.cEdrNo),
                        cDptCnm: stripHtml(r.cDptCnm),
                        nEdrPrjNo: stripHtml(r.nEdrPrjNo),
                        cInquiryNo: stripHtml(r.cInquiryNo),
                        tInsrncBgnTm: stripHtml(r.tInsrncBgnTm),
                        tInsrncEndTm: stripHtml(r.tInsrncEndTm),
                        cTermNme: stripHtml(r.cTermNme),
                        cSecondDptCnm: stripHtml(r.cSecondDptCnm),
                        cAppNme: stripHtml(r.cAppNme),
                        cInsuredNme: stripHtml(r.cInsuredNme),
                        cClntAddr: stripHtml(r.cClntAddr),
                        cNmeCn: stripHtml(r.cNmeCn),
                        tUdrTm: stripHtml(r.tUdrTm),
                        tIssueTm: stripHtml(r.tIssueTm),
                        cProdNmeCn: stripHtml(r.cProdNmeCn),
                        nAmt: stripHtml(r.nAmt),
                        nPrm: stripHtml(r.nPrm),
                        cUdrNme: stripHtml(r.cUdrNme),
                    };
                    if (cleanRow) {
                        // 校验出单机构是否复合复制单的机构要求
                        const queryProdDptCdeParam:any = { cDptCde:  user.value.companyId, cProdNo: cleanRow.cProdNo }
                        if(cleanRow.cRenewMrk === "1") {
                            queryProdDptCdeParam['cPlyNo'] = cleanRow.cPlyNo
                        }
                        const queryProdDptCde:any = await policyService.queryProdDptCde(queryProdDptCdeParam)
                        if(queryProdDptCde.data !== true) {
                            ElMessage.error(queryProdDptCde.msg)
                            return
                        }
                        cleanRow.cPolicySource = '8'
                        router.push({
                            path: "/pcisapp/myPage",
                            query: {
                                param: JSON.stringify({ ...cleanRow, pageType: 'copy', cAppTyp: 'A' }),
                            },
                        });
                    } else {
                        ElMessage.warning("请检查表单！");
                    }
                },
            }),
            createFreeButtonBase({
                id: "taskVestige",
                link: true,
                tooltip: "任务痕迹",
                type: "info",
                size: "large",
                icon: "SetUp",
                hideBtns: (row:any) => {
                    if(row.cAppStatus == '1') {
                        return true
                    } else {
                        return false
                    }
                },
                tableClick: (row) => {
                    dzmodal
                        .open(TaskListVestige, { type: "Issuer",
                            data: { objId: row["taskTyp"] === "I" ? row.cInquiryNo : row.cAppNo, sysType:!!row["cAppTyp"] && ("A" === row["cAppTyp"] )
                                  ? "U"
                                  : "E" } })
                        .then((res:any) => {

                        })
                },
            }),
            createFreeButtonBase({
                id: "score",
                link: true,
                tooltip: "打印",
                type: "primary",
                size: "large",
                icon: "Printer",
                // hideBtns: (row:any) => {
                //     if(row.cAppStatus == '5' || row.cAppStatus == '6') {
                //         return false
                //     } else {
                //         return true
                //     }
                // },
                tableClick: (row) => {
                  dzmodal
                    .open(PrintView, { type: "edit", data: row })
                    .then((res:any) => {

                    })
                },
            }),
            createFreeButtonBase({
                id: "taskVestige",
                link: true,
                tooltip: "核保信息",
                type: "info",
                size: "large",
                icon: "DocumentChecked",
                hideBtns: (row:any) => {
                    if(row.cAppStatus == '1') {
                        return true
                    } else {
                        return false
                    }
                },
                tableClick: (row) => {
                    dzmodal
                        .open(UndrOpnList, { type: "", CAppNo: row.taskTyp === "I" ? row.cInquiryNo : row.cAppNo })
                        .then((res: any) => {
                            if (res.type === "ok") {
                            }
                        });
                },
            }),
            // createFreeButtonBase({
            //     id: "score",
            //     link: true,
            //     tooltip: "询价转投保",
            //     type: "primary",
            //     size: "large",
            //     icon: "Right",
            //     hideBtns: (row: any) => {
            //         // 询价转投保按钮只在状态为"已出保单"时可见
            //         if (
            //             row.cAppStatus == "5" && row.canConvert === "1"
            //         ) {
            //             return false;
            //         } else {
            //             return true;
            //         }
            //     },
            //     tableClick: (row) => {
            //         row.cPolicySource = '6'
            //         router.push({
            //             path: "/pcisapp/myPage",
            //             query: {
            //                 param: JSON.stringify({ ...row, ...{ pageType: "inquiryToApp" } }),
            //             },
            //         });
            //     },
            // }),
        ],
        fromSchema: []
    },
};

let tableconfig = reactive<AppTableConfig>(
  createTableEditConfig(tableObj.notWaitObj)
);
tableconfig.fixed = true;

onMounted(async () => {
    // 检测首页跳转并加锁
    const hasJumpData = sessionStorage.getItem(AppKey.query.pcis_query_search);
    if (hasJumpData) {
        isJumpingFromHome.value = true;  // 加锁，避免 cAppTyp.func 再触发
    }
    formconfig1.fromSchema?.forEach((item) => {
        if (
         item.prop === "tInquiryTm" ||
         item.prop === "tEdrAppTm"
        ) {
            item.hidden = true; // 隐藏批改申请日期，询价投保日期，默认投保日期
            // item.rules = []; // 清除必填规则
        }
    });
    freeEditRef.value?.setValue("cDataTyp","app") ; // 列表类型默认值 为全部保批单
    freeEditRef.value?.setValue("cAppTyp","A") ; // 任务类型默认值 为投保
    freeEditRef.value?.setValue("cLoadSub",'1')
    freeEditRef.value?.setValue("cDptCde", JSON.parse(sessionStorage.getItem("user")).companyId);
    setFormItem("cDptCde", {
        loadData: [
            {
                label: JSON.parse(sessionStorage.getItem("user")).companyId+JSON.parse(sessionStorage.getItem("user")).companyCnm,
                value: JSON.parse(sessionStorage.getItem("user")).companyId,
            },
        ],
    });
    pageresult.list = [];
    freeEditRef.value?.setValue("tIssueTm", [
        dayjs(new Date()).subtract(6, "days").format("YYYY-MM-DD 00:00:00"),
        moment(new Date()).format("YYYY-MM-DD 23:59:59"),
    ]);
    // 申请日期默认展示投保日期
    freeEditRef.value?.setValue("tAppTm", [
        dayjs(new Date()).subtract(6, "days").format("YYYY-MM-DD 00:00:00"),
        moment(new Date()).format("YYYY-MM-DD 23:59:59"),
    ]);

    // 加载用户列配置
    const userCfg = await loadUserColumns();
    let checkedProps = [];

    if (userCfg) {
        checkedProps = userCfg; // 使用用户配置的字段名列表
    } else {
        checkedProps = normalQueryColumns.map(c => c.prop); // 默认列
    }
    await applyCheckedColumns(checkedProps);
    // 判断用户出单岗 or 核保岗 // 出单岗 ROLE_00000008 ROLE_00000563  // 核保岗 ROLE_00000152
    updateCopyBtnVisible();

    // 首页跳转过来时需要查
    if (hasJumpData) {
        const { CAppNo } = JSON.parse(hasJumpData);
        setValue("cQueryStr", CAppNo);      
        await handleQuery(true, true);         // ← 首页跳转只查 1 次
        isJumpingFromHome.value = false;
        sessionStorage.removeItem(AppKey.query.pcis_query_search);
    }
    // 初始化完成后解锁
    isInitLocked.value = false; 
});

onUnmounted(() => {
  //组件销毁，清除sessionStorage数据
  sessionStorage.getItem(AppKey.query.pcis_query_search) && sessionStorage.removeItem(AppKey.query.pcis_query_search);
});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};
// 绑定特殊验证器
const exRules = {};

const updateCopyBtnVisible = () => {
  const userRoles = userStore.user?.roles || [];
  isCopyButtonVisible.value = userRoles.includes("ROLE_00000008") || userRoles.includes("ROLE_00000563"); // 出单岗 ROLE_00000008 ROLE_00000563 
};

/** 查询 */
async function handleQuery(flag?: boolean, isEs = false) {
  const freeEditRefs = freeEditRef.value;
  const s = freeEditRefs.getFromValue();
  const appType = s.cAppTyp || 'A';
  cAppType.value = appType;
  isESCode.value = isEs ? '1':'0'; // 记录是否是ES查询
  isESBool.value = isESCode.value == '1'? true: false;

  if (appType === 'I') {
    await queryI(flag, isEs);
  } else {
    await queryAE(flag, isEs);
  }
}

// 投保/批改：普通 + ES 共用
async function queryAE( flag?: boolean, isEs = false) {
    const tableRefs = tableRef.value;
    const freeEditRefs = freeEditRef.value;
    const r = tableRefs.getPartnerPage(flag); //获取分页数据
    const s = freeEditRefs.getFromValue(); //获取表单数据 
    if(s.tIssueTm && s.tIssueTm[1]) {
        s.tIssueTm[1] = dayjs(s.tIssueTm[1]).format("YYYY-MM-DD 23:59:59")
    }
    if(s.tAppTm && s.tAppTm[1]) {
        s.tAppTm[1] = dayjs(s.tAppTm[1]).format("YYYY-MM-DD 23:59:59")
    }
    if(s.tEdrAppTm && s.tEdrAppTm[1]) {
        s.tEdrAppTm[1] = dayjs(s.tEdrAppTm[1]).format("YYYY-MM-DD 23:59:59")
    }
    if (s.cLoadSub == null) {
        s.cLoadSub = "1";
    }
    // 使用公共方法处理展开列传参
    const { expandFlag, expandVal } = processExpandParams(s);
    pageresult.list = [];
    // 清空多余参数
    delete s.cProdNo;
    if (
        (s["cAppNo"] == null || s["cAppNo"] == "") &&
        (s["cPlyNo"] == null || s["cPlyNo"] == "") &&
        (s["cAppNme"] == null || s["cAppNme"] == "")
    ) {
        const startTemp = s.tIssueTm && s.tIssueTm.length > 1 ? s.tIssueTm[0] : null;
        const start = dayjs(startTemp);
        const endTemp = s.tIssueTm && s.tIssueTm.length > 1 ? s.tIssueTm[1] : null;
        const end = dayjs(endTemp);

        if (end.isBefore(start)) {
            ElMessage.warning("签单日期起期不能大于签单日期止期");
            return;
        }
        if (end.diff(start, "month", true) > 3) {
            ElMessage.warning("签单日期时间范围请控制在3个月内");
            return;
        }
    }

    if (
        (s["cAppNo"] == null || s["cAppNo"] == "") &&
        (s["cPlyNo"] == null || s["cPlyNo"] == "") &&
        (s["cAppNme"] == null || s["cAppNme"] == "") && 
        (s["cAppTyp"] == 'A')
    ) {
        const startTemp =
            s.tAppTm && s.tAppTm.length > 1 ? s.tAppTm[0] : null;
        const tIssueTemp = s.tIssueTm && s.tIssueTm.length > 1 ? s.tIssueTm[0] : null;
        if ((null == startTemp || undefined === startTemp) && (null == tIssueTemp || undefined === tIssueTemp)) {
            ElMessage.warning("申请日期和签单日期至少选择一个");
            return;
        }
        const start = dayjs(startTemp);
        const endTemp = s.tAppTm && s.tAppTm.length > 1 ? s.tAppTm[1] : null;
        const end = dayjs(endTemp);
        if (end.isBefore(start)) {
            ElMessage.warning("申请日期起期不能大于申请日期止期");
            return;
        }
        if (end.diff(start, "month", true) > 3) {
            ElMessage.warning("申请日期时间范围请控制在3个月内");
            return;
        }
    }

    if (
        (s["cAppNo"] == null || s["cAppNo"] == "") &&
        (s["cPlyNo"] == null || s["cPlyNo"] == "") &&
        (s["cAppNme"] == null || s["cAppNme"] == "")&& 
        (s["cAppTyp"] == 'E')
    ) {
        const startTemp =
            s.tEdrAppTm && s.tEdrAppTm.length > 1 ? s.tEdrAppTm[0] : null;
        const tIssueTemp = s.tIssueTm && s.tIssueTm.length > 1 ? s.tIssueTm[0] : null;
        if ((null == startTemp || undefined === startTemp) && (null == tIssueTemp || undefined === tIssueTemp)) {
            ElMessage.warning("申请日期和签单日期至少选择一个");
            return;
        }
        const start = dayjs(startTemp);
        const endTemp = s.tEdrAppTm && s.tEdrAppTm.length > 1 ? s.tEdrAppTm[1] : null;
        const end = dayjs(endTemp);
        if (end.isBefore(start)) {
            ElMessage.warning("申请日期起期不能大于申请日期止期");
            return;
        }
        if (end.diff(start, "month", true) > 3) {
            ElMessage.warning("申请日期时间范围请控制在3个月内");
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
    param["expandFlag"] = expandFlag;  // 扩展列标识    
    param["expandVal"] = expandVal;    // 扩展列字段  

    // 清空询价日期参数
    param.tInquiryTm = null;
    param["tInquiryTmStart"] = null;
    param["tInquiryTmEnd"] = null;

    if(s.cAppTyp == 'A'){
      // 清空批改日期参数
      param.tEdrAppTm = null;
      param["tEdrAppTmStart"] = null;
      param["tEdrAppTmEnd"] = null
    }

    if(s.cAppTyp == 'E'){
      // 清空投保日期参数
      param.tAppTm = null;
      param["tAppTmStart"] = null;
      param["tAppTmEnd"] = null
    }
    // ES 必须填查询关键字
    if (isEs && !param.cQueryStr?.trim()) {
        ElMessage.warning('查询条件不能为空');
        return;
    }
    // ES 额外索引
    if (isESBool.value) {
        param.IndexName = 'ply_insured_ik';
        param.IndexType = 'ply_insured_info';
    }

    console.log('param----------', param);
    if(isEs) {
        setFormItem('cQueryStr',{btnItems: {loading: true}})
    } else {
        formconfig1.endBtns[0].loading = true
    }
    if (isESBool.value) {
      queryInsuredList(param)
      .then((res) => {
        setFormItem('cQueryStr',{btnItems: {loading: false}})
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
    }else{
        qryPolicyNewList(param)
        .then((res:any) => {
            formconfig1.endBtns[0].loading = false
            const { code, data, msg } = res;
            if (200 === code) {
                pageresult.list = [];
                pageresult.list = data.result;
                pageresult.total = data.total;
                if(data.code == '0') {
                    ElMessage.error(data.message)
                }
            } else {
                ElMessage.error(msg);
            }
        })
    }
}

// 询价：普通 + ES 共用
async function queryI(flag?: boolean, isEs = false) {
    const tableRefs = tableRef.value;
    const freeEditRefs = freeEditRef.value;
    const r = tableRefs.getPartnerPage(flag); //获取分页数据
    const s = freeEditRefs.getFromValue(); //获取表单数据
    if(s.tInquiryTm && s.tInquiryTm[1]) {
        s.tInquiryTm[1] = dayjs(s.tInquiryTm[1]).format("YYYY-MM-DD 23:59:59")
    }
    if (s.cLoadSub == null) {
        s.cLoadSub = "1";
    }
    const { expandFlag, expandVal } = processExpandParams(s);
    pageresult.list = [];
    // 清空其他日期参数
    s.tAppTm = null;
    s.tEdrAppTm = null;
    s.tIssueTm = null;
    // 删除列表类型
    delete s.cDataTyp;
    delete s.cProdNo;

    if (
        (s["cAppNo"] == null || s["cAppNo"] == "") &&
        (s["cPlyNo"] == null || s["cPlyNo"] == "") &&
        (s["cAppNme"] == null || s["cAppNme"] == "")
    ) {
        const startTemp =
            s.tInquiryTm && s.tInquiryTm.length > 1 ? s.tInquiryTm[0] : null;
        const tIssueTemp = s.tIssueTm && s.tIssueTm.length > 1 ? s.tIssueTm[0] : null;
        if ((null == startTemp || undefined === startTemp) && (null == tIssueTemp || undefined === tIssueTemp)) {
            ElMessage.warning("申请日期和签单日期至少选择一个");
            return;
        }
        const start = dayjs(startTemp);
        const endTemp = s.tInquiryTm && s.tInquiryTm.length > 1 ? s.tInquiryTm[1] : null;
        const end = dayjs(endTemp);
        if (end.isBefore(start)) {
            ElMessage.warning("申请日期起期不能大于申请日期止期");
            return;
        }
        if (end.diff(start, "month", true) > 3) {
            ElMessage.warning("申请日期时间范围请控制在3个月内");
            return;
        }
    }
    // 提取申请日期的开始时间和结束时间
    const tInquiryTmStart = s.tInquiryTm && s.tInquiryTm.length > 1 ? s.tInquiryTm[0] : null;
    const tInquiryTmEnd = s.tInquiryTm && s.tInquiryTm.length > 1 ? s.tInquiryTm[1] : null;

    const param = Object.assign(s, r);
    param["pageNo"] = param["pageNum"];
    param["tInquiryTmStart"] = tInquiryTmStart; 
    param["tInquiryTmEnd"] = tInquiryTmEnd; 
    param["queryType"] = queryType.value;
    param["cTermNo"] = cTermNo;        // 条款编码
    param["expandFlag"] = expandFlag;  // 扩展列标识    
    param["expandVal"] = expandVal;    // 扩展列字段  

      // 清空其他日期参数
    param["tAppTmStart"] = null;
    param["tAppTmEnd"] = null;
    param["tEdrAppTmStart"] = null;
    param["tEdrAppTmEnd"] = null;
    param["tIssueTmStart"] = null;
    param["tIssueTmEnd"] = null;

    // ES 必须填查询关键字
    if (isEs && !param.cQueryStr?.trim()) {
        ElMessage.warning('查询条件不能为空');
        return;
    }
    // ES 额外索引
    if (isESBool.value) {
        param.IndexName = 'ply_inquiry_ik';
        param.IndexType = 'ply_inquiry_info';
    }
    if(isEs) {
        setFormItem('cQueryStr',{btnItems: {loading: true}})
    } else {
        formconfig1.endBtns[0].loading = true
    }

    if (isESBool.value) {
     queryInsuredList(param)
      .then((res) => {
        setFormItem('cQueryStr',{btnItems: {loading: false}})
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
    }else{
      qryPolicyNewList(param)
        .then((res:any) => {
            formconfig1.endBtns[0].loading = false
            const { code, data, msg } = res;
            if (200 === code) {
                pageresult.list = [];
                pageresult.list = data.result;
                pageresult.total = data.total;
                if(data.code == '0') {
                    ElMessage.error(data.message)
                }
            } else {
                ElMessage.error(msg);
            }
        })
    }
}

// 导出
async function exportFileList(flag?: boolean) {
  const freeEditRefs = freeEditRef.value;
  const s = freeEditRefs?.getFromValue();
  const appType = s.cAppTyp || 'A';
  cAppType.value = appType;

  if (appType === 'I') {
    await exportI(flag, isESCode.value);
  } else {
    await exportAE(flag, isESCode.value);
  }
}

// 投保/批改 导出
async function exportAE( flag?: boolean, isEs) {
    const tableRefs = tableRef.value;
    const freeEditRefs = freeEditRef.value;
    const r = tableRefs?.getPartnerPage(flag); //获取分页数据
    const s = freeEditRefs?.getFromValue(); //获取表单数据
    if(s.tIssueTm && s.tIssueTm[1]) {
        s.tIssueTm[1] = dayjs(s.tIssueTm[1]).format("YYYY-MM-DD 23:59:59")
    }
    if(s.tAppTm && s.tAppTm[1]) {
        s.tAppTm[1] = dayjs(s.tAppTm[1]).format("YYYY-MM-DD 23:59:59")
    }
    if(s.tEdrAppTm && s.tEdrAppTm[1]) {
        s.tEdrAppTm[1] = dayjs(s.tEdrAppTm[1]).format("YYYY-MM-DD 23:59:59")
    }
    if (s.cLoadSub == null) {
        s.cLoadSub = "1";
    }
    const { expandFlag, expandVal } = processExpandParams(s);
    // pageresult.list = [];
    // 清空多余参数
    delete s.cProdNo;
    if (
        (s["cAppNo"] == null || s["cAppNo"] == "") &&
        (s["cPlyNo"] == null || s["cPlyNo"] == "") &&
        (s["cAppNme"] == null || s["cAppNme"] == "")
    ) {
        const startTemp = s.tIssueTm && s.tIssueTm.length > 1 ? s.tIssueTm[0] : null;
        const start = dayjs(startTemp);
        const endTemp = s.tIssueTm && s.tIssueTm.length > 1 ? s.tIssueTm[1] : null;
        const end = dayjs(endTemp);

        if (end.isBefore(start)) {
            ElMessage.warning("签单日期起期不能大于签单日期止期");
            return;
        }
        if (end.diff(start, "month", true) > 3) {
            ElMessage.warning("签单日期时间范围请控制在3个月内");
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
    param["expandFlag"] = expandFlag;  // 扩展列标识    
    param["expandVal"] = expandVal;    // 扩展列字段

    param["type"] = 'search';
    param["cCrtCde"] = JSON.parse(sessionStorage.getItem("user") || '{}').opCde;
    param["ises"] = isEs;

    // 清空询价日期参数
    param.tInquiryTm = null;
    param["tInquiryTmStart"] = null;
    param["tInquiryTmEnd"] = null;
    
    if(s.cAppTyp == 'A'){
      // 清空批改日期参数
      param.tEdrAppTm = null;
      param["tEdrAppTmStart"] = null;
      param["tEdrAppTmEnd"] = null
    }

    if(s.cAppTyp == 'E'){
      // 清空投保日期参数
      param.tAppTm = null;
      param["tAppTmStart"] = null;
      param["tAppTmEnd"] = null
    }
    // ES 必须填查询关键字
    if (isESBool.value && !param.cQueryStr?.trim()) {
        ElMessage.warning('查询条件不能为空');
        return;
    }
    // ES 额外索引
    if (isESBool.value) {
        param.IndexName = 'ply_insured_ik';
        param.IndexType = 'ply_insured_info';
    }
    formconfig1.endBtns[2].loading = true
    policyService.searchFileDown(param).then((res: any) => {
        formconfig1.endBtns[2].loading = false
        if (res.size <= 0) {
            ElMessage.error({ message: '下载出错', duration: 3000 });
            return;
        }
        const fileName = `查询信息.xls`;
        const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' });
        saveAs(blob, fileName);
    }).catch((err: any) => {
        formconfig1.endBtns[2].loading = false
        ElMessage.error({ message: err, duration: 3000 });
    });
}

// 询价 导出
async function exportI(flag?: boolean, isEs = false) {
    const tableRefs = tableRef.value;
    const freeEditRefs = freeEditRef.value;
    const r = tableRefs?.getPartnerPage(flag); //获取分页数据
    const s = freeEditRefs?.getFromValue(); //获取表单数据
    if (s.cLoadSub == null) {
        s.cLoadSub = "1";
    }
    const { expandFlag, expandVal } = processExpandParams(s);
    // pageresult.list = [];
    // 清空其他日期参数
    s.tAppTm = null;
    s.tEdrAppTm = null;
    s.tIssueTm = null;
    // 删除列表类型
    delete s.cDataTyp;
    delete s.cProdNo;

    if (
        (s["cAppNo"] == null || s["cAppNo"] == "") &&
        (s["cPlyNo"] == null || s["cPlyNo"] == "") &&
        (s["cAppNme"] == null || s["cAppNme"] == "")
    ) {
        const startTemp =
            s.tInquiryTm && s.tInquiryTm.length > 1 ? s.tInquiryTm[0] : null;
        const tIssueTemp = s.tIssueTm && s.tIssueTm.length > 1 ? s.tIssueTm[0] : null;
        if ((null == startTemp || undefined === startTemp) && (null == tIssueTemp || undefined === tIssueTemp)) {
            ElMessage.warning("申请日期和签单日期至少选择一个");
            return;
        }
        const start = dayjs(startTemp);
        const endTemp = s.tInquiryTm && s.tInquiryTm.length > 1 ? s.tInquiryTm[1] : null;
        const end = dayjs(endTemp);
        if (end.isBefore(start)) {
            ElMessage.warning("申请日期起期不能大于申请日期止期");
            return;
        }
        if (end.diff(start, "month", true) > 3) {
            ElMessage.warning("申请日期时间范围请控制在3个月内");
            return;
        }
    }
    // 提取申请日期的开始时间和结束时间
    const tInquiryTmStart = s.tInquiryTm && s.tInquiryTm.length > 1 ? s.tInquiryTm[0] : null;
    const tInquiryTmEnd = s.tInquiryTm && s.tInquiryTm.length > 1 ? s.tInquiryTm[1] : null;

    const param = Object.assign(s, r);
    param["pageNo"] = param["pageNum"];
    param["tInquiryTmStart"] = tInquiryTmStart; 
    param["tInquiryTmEnd"] = tInquiryTmEnd; 
    param["queryType"] = queryType.value;
    param["cTermNo"] = cTermNo;        // 条款编码
    param["expandFlag"] = expandFlag;  // 扩展列标识    
    param["expandVal"] = expandVal;    // 扩展列字段 

    param["type"] = 'search';
    param["cCrtCde"] = JSON.parse(sessionStorage.getItem("user") || '{}').opCde;
    param["ises"] = isEs;

    // 清空其他日期参数
    param["tAppTmStart"] = null;
    param["tAppTmEnd"] = null;
    param["tEdrAppTmStart"] = null;
    param["tEdrAppTmEnd"] = null;
    param["tIssueTmStart"] = null;
    param["tIssueTmEnd"] = null;
    
    // ES 必须填查询关键字
    if (isESBool.value && !param.cQueryStr?.trim()) {
        ElMessage.warning('查询条件不能为空');
        return;
    }
    // ES 额外索引
    if (isESBool.value) {
        param.IndexName = 'ply_inquiry_ik';
        param.IndexType = 'ply_inquiry_info';
    }
    formconfig1.endBtns[2].loading = true

    policyService.searchFileDown(param).then((res: any) => {
        formconfig1.endBtns[2].loading = false
        if (res.size <= 0) {
            ElMessage.error({ message: '下载出错', duration: 3000 });
            return;
        }
        const fileName = `查询信息.xls`;
        const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' });
        saveAs(blob, fileName);
    }).catch((err: any) => {
        formconfig1.endBtns[2].loading = false
        ElMessage.error({ message: err, duration: 3000 });
    });
}

// 把原始列 + 扩展列 合并成弹窗需要的数据
function buildAllCheckboxData() {
    // 获取当前表格的实际列配置
    const currentColumns = tableconfig.fromSchema || [];
    const currentProps = currentColumns.map(col => col.prop);

    /* 如果用户曾经保存过配置，则以保存结果为准；否则用“原始列”作为默认显示 */
    const savedProps = userAllCheckedColumns.value.length
    ? userAllCheckedColumns.value
    : normalQueryColumns.map(c => c.prop);

    const all = [
        ...normalQueryColumns.map(col => ({
            label: col.title,
            value: col.prop,
            checked: savedProps.includes(col.prop),
        })),
        ...extendColumns.map(col => ({
            label: col.title,
            value: col.prop,
            checked: savedProps.includes(col.prop),
        }))
    ];
    return all;
}

// 加载列配置
async function loadUserColumns() {
    const param = {
        type: 'search',
        cCrtCde: JSON.parse(sessionStorage.getItem("user")).opCde
    };
    const res = await getCustomUserList(param);

    if (res.code === 200 && res.data?.data?.contents?.[0]?.loadData) {
        colChangeCPkId.value = res.data.data.cPkId || '';
        const userData = res.data.data.contents[0].loadData;
        const checkedFields = userData.filter((i) => i.checked).map((i) => i.value);

        userAllCheckedColumns.value = checkedFields; // 缓存完整勾选状态
        return checkedFields;
    }

    // 无配置时，默认使用原始列
    const defaultChecked = normalQueryColumns.map(c => c.prop);
    userAllCheckedColumns.value = defaultChecked;
    return defaultChecked;
}

// 更新表格第一列标题
function updatePolicyInfoTitle(cAppTyp: string) {
  const targetColumn = tableconfig.fromSchema?.find(col => col.prop == 'policyInfo');
  cAppType.value = cAppTyp;

  if (targetColumn) {
    if (cAppTyp === 'E') {
      targetColumn.title = '保单号';
    } else {
      targetColumn.title = '申请单号/保单号';
    }
  }
}

// 多选事件
function handleSelectionChange(selection: any) {
  removeIds.value = selection.map((item: any) => item.cPkId);
}

// ES查询在点击行数据的复制按钮时，去掉所有 HTML 标签，返回纯文本
function stripHtml(html: string): string {
  if (typeof html !== 'string') {return String(html ?? '')}; 
  return html.replace(/<[^>]+>/g, '');
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
// table表格的双击事件
const handleRowDoubleClick = (row:any) => {
    const data = row;
    router.push({
        path: !!row["taskTyp"] && ("I" == row["taskTyp"] ) ? "/pcisapp/priceView" : "/pcisapp/pcisappView",
        query: {
            param: JSON.stringify({ ...data, ...{ pageType: "readonly", pageName: !!row["taskTyp"] && ("I" == row["taskTyp"] ) ? "priceInquiry": "" } }),
        },
    });
};
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

// 根据选中字段过滤最终表头
async function applyCheckedColumns(props: string[]) {
    const finalColumns = [
        ...normalQueryColumns.filter(col => props.includes(col.prop)),
        ...extendColumns.filter(col => props.includes(col.prop))
    ];
    // 更新第一列标题
    const policyInfoCol = finalColumns.find(col => col.prop === 'policyInfo');
    if (policyInfoCol) {
      const currentAppType = freeEditRef.value?.getFromValue()?.cAppTyp;
      if (currentAppType === 'E') {
        policyInfoCol.title = '保单号';
      } else {
        policyInfoCol.title = '申请单号/保单号';
      }
    }
    const newConfig = {
        ...tableObj.notWaitObj,
        fromSchema: finalColumns
    };

    Object.assign(tableconfig, newConfig); 
}

// 提取公共方法：处理展开列传参逻辑
function processExpandParams(formData) {
    let expandFlag = 0;
    let expandVal = {};
    const s = formData;
    // 01的逻辑
    if (s["cKindNo"] == "01") {
        if (s["prodCNmeCn"] == "010006" && s["cEngineNumber"]) {
            expandFlag = 1;
            expandVal = { "cEngineNumber": s["cEngineNumber"] };
        } else if (s["prodCNmeCn"] == "010009" && s["cLicenseNumber"]) {
            expandFlag = 1;
            expandVal = { "cLicenseNumber": s["cLicenseNumber"] };
        } else if (s["prodCNmeCn"] == "010022" && (s["cIdentificationNumber"] || s["cCustomerName"])) {
            expandFlag = 1;
            expandVal = {
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cCustomerName": s["cCustomerName"]
            };
        } else if (s["prodCNmeCn"] == "019003" && s["cEngineNumber"]) {
            expandFlag = 1;
            expandVal = { "cEngineNumber": s["cEngineNumber"] };
        }
    }
    // 04的逻辑
    if (s["cKindNo"] == "04") {
        if (s["prodCNmeCn"] == "040001" && s["cDetailedAddress"]) {
            expandFlag = 1;
            expandVal = { "cDetailedAddress": s["cDetailedAddress"] };
        } else if (s["prodCNmeCn"] == "040002" && (s["cIdentificationNumber"] || s["cEmployeeName"])) {
            expandFlag = 1;
            expandVal = {
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cEmployeeName": s["cEmployeeName"]
            };
        } else if (s["prodCNmeCn"] == "040005" && (s["cIdentificationNumber"] || s["cWardName"] || s["cDetailedAddress"])) {
            expandFlag = 1;
            expandVal = {
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cWardName": s["cWardName"],
                "cDetailedAddress": s["cDetailedAddress"]
            };
        } else if (s["prodCNmeCn"] == "040006" && (s["cIdentificationNumber"] || s["cFullName"] || s["cLicenseNumber"])) {
            expandFlag = 1;
            expandVal = {
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cFullName": s["cFullName"],
                "cLicenseNumber": s["cLicenseNumber"]
            };
        } else if (s["prodCNmeCn"] == "040007" && (s["cIdentificationNumber"] || s["cDetailedAddress"] || s["cEmployeeName"] || s["cLicenseNumber"])) {
            expandFlag = 1;
            expandVal = {
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cDetailedAddress": s["cDetailedAddress"],
                "cEmployeeName": s["cEmployeeName"],
                "cLicenseNumber": s["cLicenseNumber"]
            };
        } else if (s["prodCNmeCn"] == "040013" && (s["cEngineeringCategory"] || s["cProjectAddress"] || s["cBuildingAddress"] || s["cCreditCode"])) {
            expandFlag = 1;
            expandVal = {
                "cEngineeringCategory": s["cEngineeringCategory"],
                "cProjectAddress": s["cProjectAddress"],
                "cBuildingAddress": s["cBuildingAddress"],
                "cCreditCode": s["cCreditCode"]
            };
        } else if (s["prodCNmeCn"] == "040016" && (s["cIdentificationNumber"] || s["cFullName"] || s["cDetailedAddress"])) {
            expandFlag = 1;
            expandVal = {
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cFullName": s["cFullName"],
                "cDetailedAddress": s["cDetailedAddress"]
            };
        } else if (s["prodCNmeCn"] == "040019" && s["cOrganizationName"]) {
            expandFlag = 1;
            expandVal = { "cOrganizationName": s["cOrganizationName"] };
        } else if (s["prodCNmeCn"] == "040020" && (s["cIdentificationNumber"] || s["cFullName"] || s["cLicenseNumber"])) {
            expandFlag = 1;
            expandVal = {
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cFullName": s["cFullName"],
                "cLicenseNumber": s["cLicenseNumber"]
            };
        } else if (s["prodCNmeCn"] == "040021" && s["cDetailedAddress"]) {
            expandFlag = 1;
            expandVal = { "cDetailedAddress": s["cDetailedAddress"] };
        } else if (s["prodCNmeCn"] == "041001" && (s["cFullName"] || s["cIdentificationNumber"] || s["cLicenseNumber"] || s["cDetailedAddress"])) {
            expandFlag = 1;
            expandVal = {
                "cFullName": s["cFullName"],
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cLicenseNumber": s["cLicenseNumber"],
                "cDetailedAddress": s["cDetailedAddress"]
            };
        } else if (s["prodCNmeCn"] == "041007" && (s["cIdentificationNumber"] || s["cWardName"])) {
            expandFlag = 1;
            expandVal = {
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cWardName": s["cWardName"]
            };
        } else if (s["prodCNmeCn"] == "041015" && (s["cDetailedAddress"] || s["cCoachStaff"])) {
            expandFlag = 1;
            expandVal = {
                "cDetailedAddress": s["cDetailedAddress"],
                "cCoachStaff": s["cCoachStaff"]
            };
        } else if (s["prodCNmeCn"] == "042002" && s["cDetailedAddress"]) {
            expandFlag = 1;
            expandVal = { "cDetailedAddress": s["cDetailedAddress"] };
        } else if (s["prodCNmeCn"] == "042003" && (s["cSchoolAddress"] || s["cIdentificationNumber"] || s["cWardName"])) {
            expandFlag = 1;
            expandVal = {
                "cSchoolAddress": s["cSchoolAddress"],
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cWardName": s["cWardName"]
            };
        } else if (s["prodCNmeCn"] == "043001" && s["cLicenseNumber"]) {
            expandFlag = 1;
            expandVal = { "cLicenseNumber": s["cLicenseNumber"] };
        } else if (s["prodCNmeCn"] == "043002" && (s["cVinCode"] || s["cPlateNumber"])) {
            expandFlag = 1;
            expandVal = { 
                "cVinCode": s["cVinCode"],
                "cPlateNumber": s["cPlateNumber"],
            };
        } else if ((s["prodCNmeCn"] == "043004" || s["prodCNmeCn"] == "043005") && s["cDetailedAddress"]) {
            expandFlag = 1;
            expandVal = { "cDetailedAddress": s["cDetailedAddress"] };
        } else if (s["prodCNmeCn"] == "043009" && (s["cIdentificationNumber"] || s["cEmployeeName"] || s["cDetailedAddress"])) {
            expandFlag = 1;
            expandVal = {
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cEmployeeName": s["cEmployeeName"],
                "cDetailedAddress": s["cDetailedAddress"]
            };
        } else if (s["prodCNmeCn"] == "043010" && (s["cIdentificationNumber"] || s["cWardName"])) {
            expandFlag = 1;
            expandVal = {
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cWardName": s["cWardName"]
            };
        } else if (s["prodCNmeCn"] == "043011" && s["cDetailedAddress"]) {
            expandFlag = 1;
            expandVal = { "cDetailedAddress": s["cDetailedAddress"] };
        } else if (s["prodCNmeCn"] == "043013" && s["cDetailedAddress"]) {
            expandFlag = 1;
            expandVal = { "cDetailedAddress": s["cDetailedAddress"] };
        } else if (s["prodCNmeCn"] == "043020" && (s["cIdentificationNumber"] || s["cDetailedAddress"] || s["cFullName"])) {
            expandFlag = 1;
            expandVal = {
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cDetailedAddress": s["cDetailedAddress"],
                "cFullName": s["cFullName"]
            };
        } else if (s["prodCNmeCn"] == "045001" && (s["cEmployeeName"] || s["cIdentificationNumber"] || s["cDetailedAddress"])) {
            expandFlag = 1;
            expandVal = {
                "cEmployeeName": s["cEmployeeName"],
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cDetailedAddress": s["cDetailedAddress"]
            };
        } else if (s["prodCNmeCn"] == "047001" && (s["cDriverName"] || s["cIdentificationNumber"])) {
            expandFlag = 1;
            expandVal = {
                "cDriverName": s["cDriverName"],
                "cIdentificationNumber": s["cIdentificationNumber"]
            };
        } else if ((s["prodCNmeCn"] == "047002" || s["prodCNmeCn"] == "049001") && s["cDetailedAddress"]) {
            expandFlag = 1;
            expandVal = { "cDetailedAddress": s["cDetailedAddress"] };
        } else if (s["prodCNmeCn"] == "049020" && (s["cWardName"] || s["cIdentificationNumber"])) {
            expandFlag = 1;
            expandVal = {
                "cWardName": s["cWardName"],
                "cIdentificationNumber": s["cIdentificationNumber"]
            };
        } else if (s["prodCNmeCn"] == "049021" && s["cProvince"]) {
            expandFlag = 1;
            expandVal = { "cProvince": s["cProvince"] };
        } else if (s["prodCNmeCn"] == "049024" && (s["cIdentificationNumber"] || s["cFullName"] || s["cDetailedAddress"] || s["cLicenseNumber"])) {
            expandFlag = 1;
            expandVal = {
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cFullName": s["cFullName"],
                "cDetailedAddress": s["cDetailedAddress"],
                "cLicenseNumber": s["cLicenseNumber"]
            };
        } else if (s["prodCNmeCn"] == "049026" && s["cDetailedAddress"]) {
            expandFlag = 1;
            expandVal = { "cDetailedAddress": s["cDetailedAddress"] };
        } else if (s["prodCNmeCn"] == "049027" && (s["cFullName"] || s["cIdentificationNumber"])) {
            expandFlag = 1;
            expandVal = {
                "cFullName": s["cFullName"],
                "cIdentificationNumber": s["cIdentificationNumber"]
            };
        } else if (s["prodCNmeCn"] == "049028" && s["cProvince"]) {
            expandFlag = 1;
            expandVal = { "cProvince": s["cProvince"] };
        } else if (s["prodCNmeCn"] == "049029" && (s["cLicenseNumber"] || s["cEmployeeName"] || s["cIdentificationNumber"])) {
            expandFlag = 1;
            expandVal = {
                "cLicenseNumber": s["cLicenseNumber"],
                "cEmployeeName": s["cEmployeeName"],
                "cIdentificationNumber": s["cIdentificationNumber"]
            };
        } else if (s["prodCNmeCn"] == "049030" && s["cDetailedAddress"]) {
            expandFlag = 1;
            expandVal = { "cDetailedAddress": s["cDetailedAddress"] };
        } else if (s["prodCNmeCn"] == "049031" && (s["cFullName"] || s["cIdentificationNumber"] || s["cLicenseNumber"] || s["cDetailedAddress"])) {
            expandFlag = 1;
            expandVal = {
                "cFullName": s["cFullName"],
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cLicenseNumber": s["cLicenseNumber"],
                "cDetailedAddress": s["cDetailedAddress"]
            };
        } else if (s["prodCNmeCn"] == "049033" && (s["cDetailedAddress"] || s["cIdentificationNumber"] || s["cFullName"])) {
            expandFlag = 1;
            expandVal = {
                "cDetailedAddress": s["cDetailedAddress"],
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cFullName": s["cFullName"]
            };
        }
    }
    // 05的逻辑
    if (s["cKindNo"] == "05") {
        if (s["prodCNmeCn"] == "059003" && (s["cIdentificationNumber"] || s["cEmployeeName"])) {
            expandFlag = 1;
            expandVal = {
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cEmployeeName": s["cEmployeeName"]
            };
        } else if (
            ["059902", "059903", "059904", "059906", "059907", "059908", "059910", "059912", "059913", "059914", "059915"].includes(s["prodCNmeCn"]) &&
            (s["cIdentificationNumber"] || s["cBorrowerName"])
        ) {
            expandFlag = 1;
            expandVal = {
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cBorrowerName": s["cBorrowerName"]
            };
        }
    }
    // 07的逻辑
    if (s["cKindNo"] == "07") {
        if ((s["prodCNmeCn"] == "070001" || s["prodCNmeCn"] == "070005") && (s["cCustomerName"] || s["cLicenseNumber"])) {
            expandFlag = 1;
            expandVal = {
                "cCustomerName": s["cCustomerName"],
                "cLicenseNumber": s["cLicenseNumber"]
            };
        } else if (s["prodCNmeCn"] == "070002" && s["cDetailedAddress"]) {
            expandFlag = 1;
            expandVal = { "cDetailedAddress": s["cDetailedAddress"] };
        }
    }
    // 08的逻辑
    if (s["cKindNo"] == "08") {
        if (s["prodCNmeCn"] == "080002" && s["cMembersNames"]) {
            expandFlag = 1;
            expandVal = { "cMembersNames": s["cMembersNames"] };
        } else if (s["prodCNmeCn"] == "080003" && (s["cIdentificationNumber"] || s["cFullName"] || s["cMembersNames"])) {
            expandFlag = 1;
            expandVal = {
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cFullName": s["cFullName"],
                "cMembersNames": s["cMembersNames"]
            };
        } else if (["080007", "080008", "089005"].includes(s["prodCNmeCn"]) && s["cDetailedAddress"]) {
            expandFlag = 1;
            expandVal = { "cDetailedAddress": s["cDetailedAddress"] };
        } else if (s["prodCNmeCn"] == "080011" && (s["cIdentificationNumber"] || s["cFullName"])) {
            expandFlag = 1;
            expandVal = {
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cFullName": s["cFullName"]
            };
        } else if (s["prodCNmeCn"] == "089030" && s["cDetailAddr"]) {
            expandFlag = 1;
            expandVal = { "cDetailAddr": s["cDetailAddr"] };
        } else if (s["prodCNmeCn"] == "089031" && s["cMembersNames"]) {
            expandFlag = 1;
            expandVal = { "cMembersNames": s["cMembersNames"] };
        }
    }
    // 09的逻辑
    if (s["cKindNo"] == "09") {
        if (["090001", "090002", "090003"].includes(s["prodCNmeCn"]) && s["cDetailedAddress"]) {
            expandFlag = 1;
            expandVal = { "cDetailedAddress": s["cDetailedAddress"] };
        }
    }
    // 12的逻辑
    if (s["cKindNo"] == "12") {
        if (s["prodCNmeCn"] == "120001" && (s["cHolderName"] || s["cCarrierName"])) {
            expandFlag = 1;
            expandVal = {
                "cHolderName": s["cHolderName"],
                "cCarrierName": s["cCarrierName"]
            };
        }
    }
    // 13的逻辑
    if (s["cKindNo"] == "13") {
        if (["130001", "130002", "130003"].includes(s["prodCNmeCn"]) && (s["cIdNumber"] || s["cBorrowerName"])) {
            expandFlag = 1;
            expandVal = {
                "cIdNumber": s["cIdNumber"],
                "cBorrowerName": s["cBorrowerName"]
            };
        }
    }
    // 16的逻辑
    if (s["cKindNo"] == "16") {
        if (s["prodCNmeCn"] == "169001" && s["cEngineNumber"]) {
            expandFlag = 1;
            expandVal = { "cEngineNumber": s["cEngineNumber"] };
        } else if (s["prodCNmeCn"] == "169002" && (s["cIdentificationNumber"] || s["cFullName"] || s["cMembersNames"])) {
            expandFlag = 1;
            expandVal = {
                "cIdentificationNumber": s["cIdentificationNumber"],
                "cFullName": s["cFullName"],
                "cMembersNames": s["cMembersNames"]
            };
        }
    }
    return { expandFlag, expandVal };
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
  cursor: pointer;
  color: #409eff;
  margin-left: 5px;
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

:deep(.el-table__body .el-table__row .el-table__cell:first-child .cell) {
    white-space: break-spaces;
}
/* :deep(.el-table th:nth-child(1) .cell) {
    white-space: pre-line;
} */
.twoLine {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-break: break-all;
  overflow: hidden;
}
:deep(.el-table thead th) {
    font-weight: 600!important;
}
</style>

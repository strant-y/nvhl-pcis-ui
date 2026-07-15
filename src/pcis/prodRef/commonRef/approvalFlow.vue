<template>
  <div class="approval-flow-container">
    <!-- 业务信息 -->
    <BusinessInfo :info="businessInfo" />

    <!-- 审批进度 -->
    <ApprovalProgress :list="approvalProgressList" />

    <!-- 当前审批 + 审批节点明细 -->
    <el-row :gutter="20" class="approval-bottom-section">
      <el-col :xs="24" :sm="24" :md="10" :lg="9" :xl="8">
        <CurrentApproval
          :data="currentApprovalData"
          :readonly="isReadonly"
          @approve="handleApprove"
          @reject="handleReject"
          @return="handleReturn"
          @transfer="handleTransfer"
        />
      </el-col>
      <el-col :xs="24" :sm="24" :md="14" :lg="15" :xl="16">
        <ApprovalNodeTable :tableData="approvalNodeList" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from "vue";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { dataParam } from "@/store/modules/dataParam";
import {
  idxParamKey,
  IdxParamProps,
  useIdxParam,
} from "@/views/pcis/support/useIdxParam";
import { saveProdAudit } from "@/api/prod";
import BusinessInfo from "@/pcis/approvalComponents/BusinessInfo.vue";
import ApprovalProgress from "@/pcis/approvalComponents/ApprovalProgress.vue";
import CurrentApproval from "@/pcis/approvalComponents/CurrentApproval.vue";
import ApprovalNodeTable from "@/pcis/approvalComponents/ApprovalNodeTable.vue";

const dataparam = dataParam();
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const router = useRouter();

const param = dataparam.getParam();

/** 是否只读（查看模式） */
const isReadonly = computed(() => param?.editType === "view");

/* ------------------ 响应式数据 ------------------ */

// 业务信息
const businessInfo = reactive({
  code: "",
  name: "",
  type: "",
  applicant: "",
  department: "",
  createTime: "",
  status: "待审批",
});

// 审批进度列表
const approvalProgressList = ref<
  { nodeName: string; approver?: string; approveTime?: string; status: "已完成" | "审批中" | "待审批" }[]
>([]);

// 当前审批数据
const currentApprovalData = reactive({
  nodeName: "",
  approver: "",
  role: "",
  receiveTime: "",
  remainingTime: "",
  status: "审批中",
});

// 审批节点列表
const approvalNodeList = ref<
  {
    nodeName: string;
    roleName: string;
    approver: string;
    approveOpinion: string;
    approveTime: string;
    status: "已完成" | "审批中" | "待审批" | "已驳回";
  }[]
>([]);

/* ------------------ 数据加载 ------------------ */

/** 从 prodInfo 组件获取产品基本信息，构建 BusinessInfo */
function buildBusinessInfoFromProdInfo() {
  const prodInfoRef = opertaor.getTableRefByKey("prodInfo");
  if (prodInfoRef && typeof prodInfoRef.getFromValue === "function") {
    const prodData = prodInfoRef.getFromValue();
    if (prodData) {
      businessInfo.code = prodData.cProdNo || "--";
      businessInfo.name = prodData.cNmeCn || "--";
      businessInfo.type = prodData.cKindNme || prodData.cKindNo || "--";
      businessInfo.createTime = prodData.tCrtTm || prodData.createTime || "--";

      // 状态映射
      const auditStatus = prodData.cAuditStatus || param?.prod?.cAuditStatus;
      const statusMap: Record<string, string> = {
        submit: "审批中",
        unsubmit: "待审批",
        audit: "已完成",
      };
      businessInfo.status = statusMap[auditStatus] || "待审批";
    }
  }

  // 申请人 & 部门从 sessionStorage 获取
  try {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    businessInfo.applicant = user.opCde ? `${user.opNme || user.opCde}` : "--";
    businessInfo.department = user.opOrgNme || user.opOrg || "--";
  } catch {
    businessInfo.applicant = "--";
    businessInfo.department = "--";
  }
}

/** 初始化默认审批流程数据（模拟） */
function initDefaultApprovalData() {
  // 审批进度
  approvalProgressList.value = [
    { nodeName: "提交申请", approver: businessInfo.applicant, approveTime: businessInfo.createTime, status: "已完成" },
    { nodeName: "初审", status: "已完成", approver: "系统管理员", approveTime: "--" },
    { nodeName: "复核", status: "审批中", approver: "", approveTime: "" },
    { nodeName: "终审", status: "待审批", approver: "", approveTime: "" },
  ];

  // 当前审批
  currentApprovalData.nodeName = "复核";
  currentApprovalData.approver = businessInfo.applicant || "待分配";
  currentApprovalData.role = "复核员";
  currentApprovalData.receiveTime = businessInfo.createTime || "--";
  currentApprovalData.remainingTime = "3天 0小时";
  currentApprovalData.status = businessInfo.status === "已完成" ? "已完成" : "审批中";

  // 审批节点明细
  approvalNodeList.value = [
    {
      nodeName: "提交申请",
      roleName: "申请人",
      approver: businessInfo.applicant || "--",
      approveOpinion: "产品审核提交",
      approveTime: businessInfo.createTime || "--",
      status: "已完成",
    },
    {
      nodeName: "初审",
      roleName: "初审员",
      approver: "系统管理员",
      approveOpinion: "初审通过",
      approveTime: "--",
      status: "已完成",
    },
    {
      nodeName: "复核",
      roleName: "复核员",
      approver: businessInfo.applicant || "待分配",
      approveOpinion: "",
      approveTime: "",
      status: "审批中",
    },
    {
      nodeName: "终审",
      roleName: "终审员",
      approver: "",
      approveOpinion: "",
      approveTime: "",
      status: "待审批",
    },
  ];
}

/* ------------------ 事件处理 ------------------ */

/** 同意 */
function handleApprove() {
  ElMessageBox.confirm("确认同意该审批节点？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "success",
  })
    .then(() => {
      const cProdNo = param?.prod?.cProdNo || businessInfo.code;
      saveProdAudit({
        cProdNo,
        cAuditType: "audit",
        cAuditDesc: "审核通过",
      }).then((res) => {
        if (res.code === 200) {
          ElMessage.success("审批通过");
          router.push("/prodconfiguration/prod-audit");
        } else {
          ElMessage.error(res.msg || "操作失败");
        }
      });
    })
    .catch(() => {});
}

/** 驳回 */
function handleReject() {
  ElMessageBox.confirm("确认驳回该审批？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const cProdNo = param?.prod?.cProdNo || businessInfo.code;
      saveProdAudit({
        cProdNo,
        cAuditType: "unsubmit",
        cAuditDesc: "审批驳回",
      }).then((res) => {
        if (res.code === 200) {
          ElMessage.success("已驳回");
          router.push("/prodconfiguration/prod-audit");
        } else {
          ElMessage.error(res.msg || "操作失败");
        }
      });
    })
    .catch(() => {});
}

/** 退回 */
function handleReturn() {
  ElMessage.info("退回功能待对接");
}

/** 转办 */
function handleTransfer() {
  ElMessage.info("转办功能待对接");
}

/* ------------------ defineExpose 契约 ------------------ */

function getFromValue() {
  return {
    businessInfo: { ...businessInfo },
    approvalProgressList: approvalProgressList.value,
    currentApprovalData: { ...currentApprovalData },
    approvalNodeList: approvalNodeList.value,
  };
}

function setFormValue(data: any) {
  if (!data) return;

  // 兼容后端返回的完整审批流程数据
  if (data.businessInfo) Object.assign(businessInfo, data.businessInfo);
  if (data.approvalProgressList) approvalProgressList.value = data.approvalProgressList;
  if (data.currentApprovalData) Object.assign(currentApprovalData, data.currentApprovalData);
  if (data.approvalNodeList) approvalNodeList.value = data.approvalNodeList;

  // 同时尝试从 prodInfo 构建业务信息（兜底）
  nextTick(() => {
    if (!businessInfo.code) {
      buildBusinessInfoFromProdInfo();
    }
    if (approvalProgressList.value.length === 0) {
      initDefaultApprovalData();
    }
  });
}

function validate() {
  return Promise.resolve(true);
}

function setValue(key: string, value: any) {
  if (key === "businessInfo") Object.assign(businessInfo, value);
  else if (key === "approvalProgressList") approvalProgressList.value = value;
  else if (key === "currentApprovalData") Object.assign(currentApprovalData, value);
  else if (key === "approvalNodeList") approvalNodeList.value = value;
}

function getValue(key: string) {
  if (key === "businessInfo") return businessInfo;
  if (key === "approvalProgressList") return approvalProgressList.value;
  if (key === "currentApprovalData") return currentApprovalData;
  if (key === "approvalNodeList") return approvalNodeList.value;
  return undefined;
}

onMounted(() => {
  // 轮询等待 prodInfo 数据加载完成后再构建审批数据
  const maxRetries = 10;
  let retryCount = 0;
  const tryLoad = () => {
    const prodInfoRef = opertaor.getTableRefByKey("prodInfo");
    if (prodInfoRef && typeof prodInfoRef.getFromValue === "function") {
      const prodData = prodInfoRef.getFromValue();
      if (prodData && prodData.cProdNo) {
        buildBusinessInfoFromProdInfo();
        initDefaultApprovalData();
        return;
      }
    }
    retryCount++;
    if (retryCount < maxRetries) {
      setTimeout(tryLoad, 300);
    } else {
      // 超时后使用默认数据兜底
      buildBusinessInfoFromProdInfo();
      initDefaultApprovalData();
    }
  };
  setTimeout(tryLoad, 500);
});

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>

<style scoped lang="scss">
.approval-flow-container {
  padding: 0 0 20px 0;
}

.approval-bottom-section {
  margin-top: 4px;
}
</style>

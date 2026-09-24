<template>
  <div class="approval-progress-container">
    <!-- 业务信息 -->
    <BusinessInfo :info="businessInfo" />

    <!-- 审批进度 -->
    <ApprovalProgress :list="approvalProgressList" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { dataParam } from "@/store/modules/dataParam";
import {
  idxParamKey,
  IdxParamProps,
  useIdxParam,
} from "@/views/pcis/support/useIdxParam";
import BusinessInfo from "@/pcis/approvalComponents/BusinessInfo.vue";
import ApprovalProgress from "@/pcis/approvalComponents/ApprovalProgress.vue";

const dataparam = dataParam();
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);

const param = dataparam.getParam();

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

/** 初始化默认审批进度数据（模拟） */
function initDefaultApprovalData() {
  approvalProgressList.value = [
    { nodeName: "提交申请", approver: businessInfo.applicant, approveTime: businessInfo.createTime, status: "已完成" },
    { nodeName: "初审", status: "已完成", approver: "系统管理员", approveTime: "--" },
    { nodeName: "复核", status: "审批中", approver: "", approveTime: "" },
    { nodeName: "终审", status: "待审批", approver: "", approveTime: "" },
  ];
}

/* ------------------ defineExpose 契约 ------------------ */

function getFromValue() {
  return {
    businessInfo: { ...businessInfo },
    approvalProgressList: approvalProgressList.value,
  };
}

function setFormValue(data: any) {
  if (!data) return;

  if (data.businessInfo) Object.assign(businessInfo, data.businessInfo);
  if (data.approvalProgressList) approvalProgressList.value = data.approvalProgressList;

  // 兜底：从 prodInfo 构建业务信息
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
}

function getValue(key: string) {
  if (key === "businessInfo") return businessInfo;
  if (key === "approvalProgressList") return approvalProgressList.value;
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
.approval-progress-container {
  padding: 0 0 20px 0;
}
</style>

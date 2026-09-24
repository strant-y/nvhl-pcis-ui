<template>
  <div class="current-approval-flow-container">
    <el-row :gutter="20">
      <!-- 左：审批节点明细 -->
      <el-col :xs="24" :sm="24" :md="14" :lg="15" :xl="16">
        <ApprovalNodeTable :tableData="approvalNodeList" />
      </el-col>
      <!-- 右：当前审批 -->
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

/** 获取业务信息（从 approvalProgress 组件或 prodInfo 获取） */
function getBusinessInfo() {
  // 优先从 approvalProgress 组件获取
  const progressRef = opertaor.getTableRefByKey("approvalProgress");
  if (progressRef && typeof progressRef.getValue === "function") {
    const info = progressRef.getValue("businessInfo");
    if (info && info.code) return info;
  }
  // 兜底从 prodInfo 获取
  const prodInfoRef = opertaor.getTableRefByKey("prodInfo");
  if (prodInfoRef && typeof prodInfoRef.getFromValue === "function") {
    const prodData = prodInfoRef.getFromValue();
    if (prodData) return { code: prodData.cProdNo || "", applicant: "" };
  }
  return { code: param?.prod?.cProdNo || "", applicant: "" };
}

/* ------------------ 数据初始化 ------------------ */

/** 初始化默认审批数据（模拟） */
function initDefaultApprovalData() {
  const info = getBusinessInfo();

  // 当前审批
  currentApprovalData.nodeName = "复核";
  currentApprovalData.approver = info.applicant || "待分配";
  currentApprovalData.role = "复核员";
  currentApprovalData.receiveTime = info.createTime || "--";
  currentApprovalData.remainingTime = "3天 0小时";
  currentApprovalData.status = info.status === "已完成" ? "已完成" : "审批中";

  // 审批节点明细
  approvalNodeList.value = [
    {
      nodeName: "提交申请",
      roleName: "申请人",
      approver: info.applicant || "--",
      approveOpinion: "产品审核提交",
      approveTime: info.createTime || "--",
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
      approver: info.applicant || "待分配",
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

/** 同意（审核通过） */
function handleApprove(opinion: string = "") {
  ElMessageBox.confirm("确认同意该审批节点？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "success",
  })
    .then(() => {
      const cProdNo = param?.prod?.cProdNo || getBusinessInfo().code;
      saveProdAudit({
        cProdNo,
        cAuditType: "audit",
        cAuditDesc: opinion || "审核通过",
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

/** 驳回（退回） */
function handleReject(opinion: string = "") {
  ElMessageBox.confirm("确认驳回该审批？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const cProdNo = param?.prod?.cProdNo || getBusinessInfo().code;
      saveProdAudit({
        cProdNo,
        cAuditType: "unsubmit",
        cAuditDesc: opinion || "审批驳回",
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
function handleReturn(opinion: string = "") {
  ElMessageBox.confirm("确认退回该审批？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const cProdNo = param?.prod?.cProdNo || getBusinessInfo().code;
      saveProdAudit({
        cProdNo,
        cAuditType: "unsubmit",
        cAuditDesc: opinion || "审批退回",
      }).then((res) => {
        if (res.code === 200) {
          ElMessage.success("已退回");
          router.push("/prodconfiguration/prod-audit");
        } else {
          ElMessage.error(res.msg || "操作失败");
        }
      });
    })
    .catch(() => {});
}

/** 转办 */
function handleTransfer() {
  ElMessage.info("转办功能待对接");
}

/* ------------------ defineExpose 契约 ------------------ */

function getFromValue() {
  return {
    currentApprovalData: { ...currentApprovalData },
    approvalNodeList: approvalNodeList.value,
  };
}

function setFormValue(data: any) {
  if (!data) return;

  if (data.currentApprovalData) Object.assign(currentApprovalData, data.currentApprovalData);
  if (data.approvalNodeList) approvalNodeList.value = data.approvalNodeList;

  // 兜底初始化
  nextTick(() => {
    if (approvalNodeList.value.length === 0) {
      initDefaultApprovalData();
    }
  });
}

function validate() {
  return Promise.resolve(true);
}

function setValue(key: string, value: any) {
  if (key === "currentApprovalData") Object.assign(currentApprovalData, value);
  else if (key === "approvalNodeList") approvalNodeList.value = value;
}

function getValue(key: string) {
  if (key === "currentApprovalData") return currentApprovalData;
  if (key === "approvalNodeList") return approvalNodeList.value;
  return undefined;
}

onMounted(() => {
  // 轮询等待 prodInfo / approvalProgress 数据加载完成后再构建审批数据
  const maxRetries = 10;
  let retryCount = 0;
  const tryLoad = () => {
    const info = getBusinessInfo();
    if (info && info.code && info.code !== "--") {
      initDefaultApprovalData();
      return;
    }
    retryCount++;
    if (retryCount < maxRetries) {
      setTimeout(tryLoad, 300);
    } else {
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
.current-approval-flow-container {
  padding: 0 0 20px 0;
}
</style>

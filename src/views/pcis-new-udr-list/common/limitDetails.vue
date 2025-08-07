<!-- 核保任务查询 历次批单 -->
<template>
  <el-dialog v-model="dialogVisible" width="90%" title="额度明细">
    <el-row>
    <el-col :span="12"  class="col-center">
      <el-form-item label="关联交易审批单总额度">
        <el-input v-model="NRestPrm" placeholder="请输入金额" disabled style="width: 300px;"/>
        <span class="unit">（元）</span>
      </el-form-item>
    </el-col>
    <el-col :span="12"  class="col-center">
      <el-form-item label="剩余额度">
        <el-input v-model="NRelatePrm" placeholder="请输入金额" disabled style="width: 300px;"/>
        <span class="unit">（元）</span>
      </el-form-item>
    </el-col>
  </el-row>
    <div>
      <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @page-change="handleQuery(false)"
      />
    </div>
    <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
      <rt-button
        :item="{
          label: '返回',
          func: () => {
            dialogVisible = false;
          },
        }"
      />
    </div>
  </el-dialog>
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
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
import { PcisEdrQueryService } from '@/views/edr-qry-endorse-list/service/pcis-edr-query-service';
// import { saveAs } from 'file-saver';
const policyService = new PolicyService();
const pcisEdrQueryService = new PcisEdrQueryService();
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const dialogVisible = ref(true);
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: '',opCde: '' });

const props = defineProps({
  data: Object,
  type: String,
});

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
let NRestPrm =ref(""); 
let NRelatePrm =ref(""); 

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    fromSchema: [
     {
        prop: "cSeqNo",
        inputtype: "rtinput",
        title: "关联交易审批单编号",
        minWidth: 180,
        fixed: 'left',
      },
      {
        prop: "cRelateNo",
        inputtype: "rtinput",
        title: "关联交易审批单编号",
        minWidth: 180,
        fixed: 'left',
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
        minWidth: 180,
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        minWidth: 180,
      },
      {
        prop: "cEdrNo",
        inputtype: "rtinput",
        title: "批单号",
        minWidth: 180,
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
        minWidth: 180,
      },
      {
        prop: "cCerCde",
        inputtype: "rtdatepicker",
        title: "证件号码",
        minWidth: 180,
      },
      {
        prop: "nUsePrm",
        inputtype: "rtdatepicker",
        title: "已用额度（元）",
        minWidth: 180,
      },
      {
        prop: "tIssueTm",
        inputtype: "rtdatepicker",
        title: "签单日期",
        minWidth: 180,
      },
    ],
  })
);

onMounted(async () => {
  pageresult.list = [];
  pageresult.total = 1;
  handleQuery(true)
});

/** 查询 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const param = Object.assign({
    CRelateNo :props.data?.CRelateNo,
    CClntMrk:props.data?.CClntMrk,
    CAppNme: props.data?.CAppNme,
    CCertfCde:props.data?.CCertfCde,
    pageNum: 1,
    pageSize: 10
  }, r);
  console.log(param)
  pcisEdrQueryService.getRelationDataInfo(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        if (data != null) {
        pageresult.list = [];
        pageresult.list = data.result;
        pageresult.total = data.total;
        NRestPrm.value =data.NRestPrm;
          NRelatePrm.value = data.NRelatePrm;
        } else {
          ElMessageBox.confirm(msg, "提示", {
            showCancelButton: false,
          confirmButtonText: "确定",
          type: "warning",
        })
          .then(() => {
            dialogVisible.value = false
          })
          .catch(() => {
            // 取消
            dialogVisible.value = false
          });
        }
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
</script>

<style scoped>
.unit {
  margin-left: 5px;
}
.col-center {
  display: flex;
  justify-content: center;
}
</style>

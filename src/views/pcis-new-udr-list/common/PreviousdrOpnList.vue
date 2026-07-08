<!-- 历史保批单 -->
<template>
  <el-dialog v-model="dialogVisible" width="90%" title="历史保批单">
    <div>
      <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @selection-change="handleSelectionChange"
        @page-change="handleQuery(false)"
      >
        <template #column-cAppNo="{ row, column, index }">
          <span @click="turnToDetail(row.cAppNo)" class="primaryColor">{{ row.cAppNo }}</span>
        </template>
      </app-table>
    </div>
    <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
      <rt-button
        :item="{
          type: 'primary',
          label: '导出',
          disabled: pageresult.list?.length < 1,
          loading: exportLoading,
          func: () => {
            handleExport();
          },
        }"
      />
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
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { getBasicKindList } from "@/api/prod";
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
import { PcisEdrQueryService } from '@/views/edr-qry-endorse-list/service/pcis-edr-query-service';
import { getAppPolicyList } from "@/api/query";
import {encryptRouterParam} from "@/router";
import { saveAs } from 'file-saver';
const policyService = new PolicyService();
const pcisEdrQueryService = new PcisEdrQueryService();
const tableRef = ref<AppTableMethod | null>(null);
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const dialogVisible = ref(true);
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: '',opCde: '' });

const props = defineProps({
  objId: {// 申请单号
    type: String,
    required: true,
  },
  prodNo: {// 产品编码
    type: String,
    required: true,
  },
   
});

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtnFixed: "right",
    tableBtn: [],
    fromSchema: [
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
        fixed: 'left',
        slotName: "cAppNo"
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
      },
      {
        prop: "cEdrNo",
        inputtype: "rtinput",
        title: "批单号",
      },
      {
        prop: "cEdrRsnBundleCde",
        inputtype: "rtinput",
        title: "批改原因",
      },
      {
        prop: "nEdrPrjNo",
        inputtype: "rtinput",
        title: "批单序号",
        lengthNum: 4,
      },
      {
        prop: "nPrmVar",
        inputtype: "rtinput",
				type: "number",
        title: "保费变化",
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人",
      },
      {
        prop: "tUdrTm",
        inputtype: "rtinput",
        title: "核保日期",
      },
      {
        prop: "tInsrncBgnTm",
        inputtype: "rtinput",
        title: "保险起期",
      },
      {
        prop: "tInsrncEndTm",
        inputtype: "rtinput",
        title: "保险止期",
      },
      {
        prop: "tEdrBgnTm",
        inputtype: "rtinput",
        title: "批改生效起期",
      },
      {
        prop: "tEdrEndTm",
        inputtype: "rtinput",
        title: "批改生效止期",
      },
    ],
  })
);

onMounted(async () => {
  if(props.objId) {
    handleQuery(true)
  }
});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};


/** 查询 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(
    {
      CPlyNo: props.objId,
      CDataTyp: "claim",
      endorsementFlag: 1,
      pageSize: 10,
      pageNum: 1,
    },
    r
  );
  pcisEdrQueryService
    .qryEndorseList(param)
    .then((res:any) => {
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

// 导出
const exportLoading = ref(false);
function handleExport() {
  exportLoading.value = true
  const params = {
    pageNo: 1,
    pageSize: 1000,
    cPlyNo: props.objId,
    CDataTyp: 'claim',
    CAppTyp: 'E',
    prodNo: props.prodNo,
    CurrentUser: user.value.opCde,
    CurrentUserOrg: user.value.companyId,
    CType: 'edrHistory',
  };
  policyService.excelDown(params).then((res: any) => {
    exportLoading.value = false
    if (res.size <= 0) {
      ElMessage.error({ message: '下载出错', duration: 3000 });
      return;
    }
    const fileName = `${props.objId}历史保批单.xls`;
    const blob = new Blob([res.data], {
      responseType:res.headers["content-type"]
      // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8",
    });
    saveAs(blob, fileName);
  }).catch((err: any) => {
    exportLoading.value = false
    ElMessage.error({ message: err, duration: 3000 });
  });
}

function turnToDetail(cAppNo:any) {
  if(cAppNo) {
    getAppPolicyList({
      cAppNo: cAppNo,
      pageSize: 10,
      pageNum: 1,
      cLoadSub: "1",
      queryType: "1",
      cDataTyp: "app",
    }).then((res: any) => {
      if (res.data?.result && res.data?.result.length > 0) {
        const data = res.data?.result[0];
        const params: any = {
          query: {
            param:  JSON.stringify({
              ...data,
              cAppNo: data.cAppNo,
              cAppTyp: data.cAppTyp,
              cCiMrk: data.cCiMrk,
              cProdNo: data.cProdNo,
              cGrpMrk: data.cGrpMrk,
              cDptCde: data.cDptCde,
              cTermNo: data.cTermNo,
              cTermNme: data.cTermNme,
              cPolicySource:data.cPolicySource,
              pageType: "readonly",
              showBtn: true,
            })
          }
        };
        encryptRouterParam(params);
        const url = window.location.origin + "/#/pcisapp/pcisappView?param=" + params.query.param;
        window.open(url, "_blank");
      }
    });
  }
}
</script>

<style lang="scss" scoped>
.primaryColor {
  color: var(--el-color-primary);
  cursor: pointer;
}
:deep(.el-table td.el-table__cell div) {
  display: flex;
  align-items: center;
  justify-content: center;
  span {
    margin-top: 0!important;
  }
}
</style>

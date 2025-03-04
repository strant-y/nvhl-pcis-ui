<!-- 配置 -->
<template>
  <el-dialog v-model="dialogVisible" width="90%" title="历次批单">
    <div>
      <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @selection-change="handleSelectionChange"
        @page-change="handleQuery(false)"
      />
    </div>
    <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
      <rt-button
        :item="{
          type: 'primary',
          label: '导出',
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
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
import { PcisEdrQueryService } from "@/views/edr-qry-endorse-list/service/pcis-edr-query-service";
// import { saveAs } from 'file-saver';
const policyService = new PolicyService();
const pcisEdrQueryService = new PcisEdrQueryService();
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const dialogVisible = ref(true);
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });

const props = defineProps({
  objId: {
    // 申请单号
    type: String,
    required: true,
  },
  prodNo: {
    // 产品代码
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
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "查看",
        type: "success",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          // 弹框
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        minWidth: 180,
        fixed: "left",
      },
      {
        prop: "cEdrNo",
        inputtype: "rtinput",
        title: "批单号",
        minWidth: 180,
      },
      {
        prop: "cEdrRsnBundleCde",
        inputtype: "rtinput",
        title: "批改原因",
        minWidth: 180,
      },
      {
        prop: "nPrmVar",
        inputtype: "rtinput",
        title: "保费变化",
        minWidth: 180,
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人",
        minWidth: 180,
      },
      {
        prop: "tNextEdrBgnTm",
        inputtype: "rtdatepicker",
        title: "批改生效日期",
        minWidth: 180,
      },
    ],
  })
);

onMounted(async () => {
  pageresult.list = [
    {
      cPlyNo: "保单号",
      cEdrNo: "批单号",
      cEdrRsnBundleCde: "批改原因",
      nPrmVar: "保费变化",
      cAppNme: "投保人",
      tNextEdrBgnTm: "批改生效日期",
    },
  ];
  pageresult.total = 1;
  console.log("pageresult.list", pageresult.list);

  handleQuery(true);
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
    },
    r
  );
  pcisEdrQueryService
    .qryEndorseList(param)
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

// 导出
function handleExport() {
  const params = {
    pageNo: 1,
    pageSize: 1000,
    CPlyNo: props.objId,
    CDataTyp: "claim",
    CAppTyp: "E",
    prodNo: props.prodNo,
    CurrentUser: user.value.opCde,
    CurrentUserOrg: user.value.companyId,
    CType: "edrHistory",
  };
  policyService
    .excelDown(params)
    .then((res: any) => {
      if (res.size <= 0) {
        ElMessage.error({ message: "下载出错", duration: 3000 });
        return;
      }
      const fileName = `${props.objId}历次批单.xls`;
      // saveAs(res, decodeURI(fileName));
    })
    .catch((err: any) => {
      ElMessage.error({ message: err, duration: 3000 });
    });
}
</script>

<style scoped></style>

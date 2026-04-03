<!-- 核保任务查询 任务痕迹 -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="风险单位列表"
    width="70%"
    style="max-height:80%;display: flex;flex-direction: column;"
    class="task-list-dialog"
  >
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @selection-change="handleSelectionChange"
      @page-change="handleQuery(false)"
    />
    <template #footer>
      <rt-button
        :item="{
          type: 'primary',
          label: '返回',
          func: () => {
            dialogVisible = false;
          },
        }"
      />
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
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
import { getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
import { NewUdrListService } from "@/views/pcis-new-udr-list/service/new-udr-list.service";
const { riskQueryDataPage } = NewUdrListService();
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
import { getAppPolicyList } from "@/api/query";
import {encryptRouterParam} from "@/router";
const tableRef = ref<AppTableMethod | null>(null);
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const dialogVisible = ref(true);
const route = useRoute();
const params:any = route.query.param

const props = defineProps({
  data: Object,
});

const handleCancel = () => {
  dialogVisible.value = false;
};

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    fromSchema: [
      {
        prop: "cRiskUnitNme",
        inputtype: "rtinput",
        title: "风险单位名称",
      },
      {
        prop: "cDetailedAddress",
        inputtype: "rtinput",
        title: "标的地址",
      },
      {
        prop: "cRiskLvlCde",
        inputtype: "rtinput",
        title: "风险等级",
      },
      {
        prop: "nAmt",
				inputtype: "rtinput",
				type: "number",
        title: "我司保额",
        lengthNum: 4,
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
				type: "number",
        title: "我司保费",
      },
      {
        prop: "nRetAmt",
        inputtype: "rtinput",
				type: "number",
        title: "自留额",
      },
    ],
  })
);

onMounted(async () => {
  nextTick(() => {
    handleQuery(true);
  });
});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

/** 查询 */
async function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const param = Object.assign(
    {
      cAppNo: props.data?.objId,
      pageSize: 10,
      pageNum: 1,
    },
    r
  );
  const riskQueryInfo:any = await riskQueryDataPage(param)
  if(riskQueryInfo && riskQueryInfo.code === "1") {
    pageresult.list = riskQueryInfo.result.map((item: any, index: number) => ({
      ...item,
      index,
    }));
    pageresult.total = riskQueryInfo.total || 0;
  } else {
    ElMessage.error(riskQueryInfo.message);
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



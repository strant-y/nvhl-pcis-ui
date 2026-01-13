<!-- 核保任务查询 任务痕迹 -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="历史保单列表"
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
    >
      <template #column-cAppNo="{ row, column, index }">
        <span @click="turnToDetail(row.cAppNo)" class="primaryColor">{{ row.cAppNo }}</span>
      </template>
    </app-table>
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
const { getHistoryList } = NewUdrListService();
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
import { getAppPolicyList } from "@/api/query";
import {encryptRouterParam} from "@/router";
const tableRef = ref<AppTableMethod | null>(null);
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const dialogVisible = ref(true);

const props = defineProps({
  data: Object,
});

const handleCancel = () => {
  dialogVisible.value = false;
};
const tabs = ref([
  { name: '时间轴' },
  { name: '表格' }
])
const currentTab = ref('时间轴')

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
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
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
        prop: "nEdrPrjNo",
        inputtype: "rtinput",
        title: "批单序号",
        lengthNum: 4,
      },
      {
        prop: "tUdrTm",
        inputtype: "rtinput",
        title: "核保日期",
      },
      {
        prop: "tInsrncBgnTm",
        inputtype: "input",
        title: "保险起期",
      },
      {
        prop: "tInsrncEndTm",
        inputtype: "input",
        title: "保险止期",
      },
      {
        prop: "tEdrBgnTm",
        inputtype: "input",
        title: "批改生效起期",
      },
      {
        prop: "tEdrEndTm",
        inputtype: "input",
        title: "批改生效起期",
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
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const param = Object.assign(
    {
      cPlyNo: props.data?.objId,
      pageSize: 10,
      pageNum: 1,
    },
    r
  );
  getHistoryList(param)
    .then((res: any) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = data.result || [];
        pageresult.total = data.total || 0;
      } else {
        ElMessage.error(msg);
      }
    })
    .catch((err) => {
      ElMessage.error(err);
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
              showBtn: false,
            })
          }
        };
        encryptRouterParam(params);
        const url = window.location.origin + "/#/pcis/my-page?param=" + params.query.param;
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



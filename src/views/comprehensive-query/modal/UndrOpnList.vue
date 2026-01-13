<!-- 核保信息 -->
<template>
  <el-dialog v-model="dialogVisible" width="60%" title="核保信息" class="undr-opn-list-dialog">
    <el-tabs @tab-click="handleTabClick">
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.name"
        :label="tab.name"
      >
      </el-tab-pane>
    </el-tabs>
    <div class="content">
      <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @selection-change="handleSelectionChange"
        @page-change="handleQuery(false)"
        v-show="currentTab === '表格'"
      >
        <template #column-CUndrOpn="{row}">
          <div>{{ row.CUndrOpn }}</div>
        </template>
      </app-table>
      <el-timeline v-show="currentTab === '时间轴'">
        <el-timeline-item
          v-for="(activity, index) in pageresult.list"
          :key="index"
          type="primary"
          :hollow="true"
        >
          <div>
            {{ activity.CUndrMrk }}
          </div>
          <div>{{ activity.CUndrCnm }}</div>
          <div>核保时间：{{ activity.TUpdTm?.replace('T',' ') }}</div>
          <div>核保意见：{{ activity.CUndrOpn }}</div>
        </el-timeline-item>
      </el-timeline>
    </div>
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
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { PcisQueryService } from "@/views/payinfoManagement/service/pcis-query-service";
const pcisQueryService = new PcisQueryService();
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const dialogVisible = ref(true);
const props = defineProps({
  CAppNo: {
    // 申请单号
    type: String,
    default: "",
  },
});
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
        prop: "CUndrCnm",
        inputtype: "rtinput",
        title: "核保人名称",
        fixed: "left",
      },
      {
        prop: "CUndrMrk",
        inputtype: "rtinput",
        title: "核保选项",
        lengthNum: 6,
      },
      // {
      //   prop: "CAntiLnderRisk",
      //   inputtype: "rtselect",
      //   title: "反洗钱风险",
      //   lengthNum: 5,
      //   loadData: [
      //     { value: "0", label: "低" },
      //     { value: "1", label: "中" },
      //     { value: "2", label: "高" },
      //   ],
      // },
      {
        prop: "TUpdTm",
        // inputtype: "rtdatepicker", 
        inputtype: "rtinput",
        title: "核保时间",
        lengthNum: 19,
        lengthIsNumber: true,
      },
      {
        prop: "CUndrOpn",
        inputtype: "rtinput",
        title: "核保意见",
        align: "left",
        slotName: "CUndrOpn"
      },
    ],
  })
);

onMounted(async () => {
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
      appNo: props.CAppNo,
      pageSize: 10,
      pageNum: 1,
    },
    s,
    r
  );
  pcisQueryService
    .getUndrOpnList(param)
    .then((res: any) => {
      if (200 === res.code) {
        pageresult.list = [];
        pageresult.list = res.data.map((item:any) => ({
          ...item,
          TUpdTm: item.TUpdTm?.replaceAll('T',' ')
        }));
        pageresult.total = res.total;
      } else {
        ElMessage.error(res.msg);
      }
    })
    .catch((err) => {
      ElMessage.error(err);
    });
}

function handleTabClick(tab:any) {
  currentTab.value = tab.props.label
}
</script>

<style lang="scss">
.undr-opn-list-dialog {
  max-height:80%;
  display: flex;
  flex-direction: column;
  .el-dialog__body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .content {
      flex: 1;
      overflow-y: auto;
      .el-timeline {
        padding-left: 5px;
      }
    }
  }
}
</style>

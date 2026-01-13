<!-- 核保任务查询 任务痕迹 -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="任务痕迹列表"
    width="70%"
    style="max-height:80%;display: flex;flex-direction: column;"
    class="task-list-dialog"
  >
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
        <template #column-preDptName="{ row, column, index }">
          <el-tooltip :content="row.preDptName" placement="top">
            <span v-html="row.preDptName || ''" class="twoLine"></span>
          </el-tooltip>
        </template>
        <template #column-dptName="{ row, column, index }">
          <el-tooltip :content="row.dptName" placement="top">
            <span v-html="row.dptName || ''" class="twoLine"></span>
          </el-tooltip>
        </template>
        <template #column-preUserName="{ row, column, index }">
          <el-tooltip :content="row.preUserName" placement="top">
            <span v-html="row.preUserName || ''" class="twoLine"></span>
          </el-tooltip>
        </template>
        <template #column-operName="{ row, column, index }">
          <el-tooltip :content="row.operName" placement="top">
            <span v-html="row.operName || ''" class="twoLine"></span>
          </el-tooltip>
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
            {{ activity.curtTaskName }}
          </div>
          <div>{{ activity.curtUserName }}</div>
          <div>接收时间：{{ activity.acptTm?.replace('T',' ') }}</div>
          <div>完成时间：{{ activity.cmptTm?.replace('T',' ')}}</div>
          <div>下一级机构：{{ activity.dptName }}</div>
          <div>下一级级别：{{ activity.level }}</div>
        </el-timeline-item>
      </el-timeline>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel" class="custom-button">返回</el-button>
      </span>
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
import { NewUdrListService } from "@/views/pcis-new-udr-list/service/new-udr-list.service";
const { getTaskVestige } = NewUdrListService();
const dzmodal = useDzModal();
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
    editFlag: true,
    editList: ["cStatus"],

    fromSchema: [
      {
        prop: "curtTaskName",
        inputtype: "rtinput",
        title: "任务名称",
        width: 62,
        fixed: "left",
        align: "left",
      },
      {
        prop: "type",
        inputtype: "rtinput",
        title: "任务类型",
        width: 62,
        align: "left",
        formatter: (val: any) => { 
          if (val === '0') {
            return "新任务";
          } else if (val === '8') {
            return "上报任务";
          }else if (val === '7') {
            return "重做任务";
          } else if(val === '1') {
            return "退回任务";
          } else if(val === '2') {
            return "撤回任务";
          } else {
            return val;
          }
        }
      },
      {
        prop: "curtUserName",
        inputtype: "rtinput",
        title: "接收人",
        width: 62,
        align: "left",
      },
      {
        prop: "acptTm",
        inputtype: "rtdatepicker",
        title: "接收时间",
        width: 145,
        format: "YYYY-MM-DD HH:mm:ss",
        type: "datetime",
      },
      {
        prop: "cmptTm",
        inputtype: "rtdatepicker",
        title: "完成时间",
        width: 145,
        format: "YYYY-MM-DD HH:mm:ss",
        type: "datetime",
      },
      {
        prop: "preDptName",
        inputtype: "rtinput",
        title: "任务分发机构",
        width: 146,
        align: "left",
        slotName: "preDptName"
      },
      {
        prop: "preUserName",
        inputtype: "rtinput",
        title: "任务分发人",
        width: 104,
        align: "left",
        slotName: "preUserName"
      },
      {
        prop: "crtTm",
        inputtype: "rtdatepicker",
        title: "任务分发时间",
        width: 145,
        format: "YYYY-MM-DD HH:mm:ss",
        type: "datetime",
      },
      {
        prop: "dptName",
        inputtype: "rtinput",
        title: "下一级机构",
        width: 146,
        align: "left",
        slotName: "dptName"
      },
      {
        prop: "opgrpName",
        inputtype: "rtinput",
        title: "下一级角色",
        align: "left",
        width: 75,
      },
      {
        prop: "level",
        inputtype: "rtinput",
        title: "下一级级别",
        align: "left",
        width: 75,
      },
      {
        prop: "operName",
        inputtype: "rtinput",
        title: "下一级操作员",
        width: 104,
        align: "left",
        slotName: "operName"
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
      objId: props.data?.objId,
      sysType: props.data?.sysType,
      pageSize: 10,
      pageNum: 1,
    },
    r
  );
  getTaskVestige(param)
    .then((res: any) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = data;
        pageresult.total = res.totalCount;
      } else {
        ElMessage.error(msg);
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

<style scoped>
:deep(.el-table td.el-table__cell div.cell),:deep(.el-text.is-truncated) {
  vertical-align: middle;
}
.twoLine {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-break: break-all;
  overflow: hidden;
}
:deep(.el-card__header) {
  display: none;
}
:deep(.el-card__body) {
  padding: 15px;
}
</style>
<style lang="scss">
.task-list-dialog {
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

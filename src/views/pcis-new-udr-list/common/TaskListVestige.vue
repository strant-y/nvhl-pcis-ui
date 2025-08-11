<!-- 核保任务查询 任务痕迹 -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="任务痕迹列表"
    custom-class="custom-dialog"
    width="70%"
  >
    <div class="app-container">
      <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @selection-change="handleSelectionChange"
        @page-change="handleQuery(false)"
      />
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
        minWidth: 100,
        fixed: "left",
      },
      {
        prop: "type",
        inputtype: "rtinput",
        title: "任务类型",
        minWidth: 100,
        formatter: (val: any) => {
          if (val === '0') {
            return "新任务";
          } else if (val === '8') {
            return "任务上报";
          }else if (val === '7') {
            return "任务退回";
          } else {
            return val;
          }
        }
      },
      {
        prop: "curtUserName",
        inputtype: "rtinput",
        title: "接收人",
        minWidth: 120,
      },
      {
        prop: "acptTm",
        inputtype: "rtdatepicker",
        title: "接收时间",
        minWidth: 150,
        format: "YYYY-MM-DD HH:mm:ss",
        type: "datetime",
      },
      {
        prop: "cmptTm",
        inputtype: "rtdatepicker",
        title: "完成时间",
        minWidth: 150,
        format: "YYYY-MM-DD HH:mm:ss",
        type: "datetime",
      },
      {
        prop: "preDptName",
        inputtype: "rtinput",
        title: "任务分发机构",
        minWidth: 180,
      },
      {
        prop: "preUserName",
        inputtype: "rtinput",
        title: "任务分发人",
        minWidth: 120,
      },
      {
        prop: "crtTm",
        inputtype: "rtdatepicker",
        title: "任务分发时间",
        minWidth: 150,
        format: "YYYY-MM-DD HH:mm:ss",
        type: "datetime",
      },
      {
        prop: "dptName",
        inputtype: "rtinput",
        title: "下一级机构",
        minWidth: 180,
      },
      {
        prop: "opgrpName",
        inputtype: "rtinput",
        title: "下一级角色",
        minWidth: 180,
      },
      {
        prop: "level",
        inputtype: "rtinput",
        title: "下一级级别",
        minWidth: 180,
      },
      {
        prop: "operName",
        inputtype: "rtinput",
        title: "下一级操作员",
        minWidth: 180,
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
</script>

<style scoped></style>

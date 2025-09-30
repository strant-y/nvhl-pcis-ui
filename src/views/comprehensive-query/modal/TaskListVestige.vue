<!-- 综合查询-任务痕迹 -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="任务痕迹列表"
    custom-class="custom-dialog"
    width="80%"
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
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const dialogVisible = ref(true);

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
        minWidth: 180,
        fixed: 'left',
      },
      {
        prop: "type",
        inputtype: "rtinput",
        title: "任务类型",
        minWidth: 180,
      },
      {
        prop: "curtUserName",
        inputtype: "rtinput",
        title: "接收人",
        minWidth: 180,
      },
      {
        prop: "acptTm",
        inputtype: "rtdatepicker",
        title: "接收时间",
        minWidth: 180,
      },
      {
        prop: "cmptTm",
        inputtype: "rtdatepicker",
        title: "完成时间",
        minWidth: 180,
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
        minWidth: 180,
      },
      {
        prop: "crtTm",
        inputtype: "rtdatepicker",
        title: "任务分发时间",
        minWidth: 180,
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
  handleQuery();
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
  const param = Object.assign(s, r);
  getBasicKindList(param)
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

</script>

<style scoped></style>

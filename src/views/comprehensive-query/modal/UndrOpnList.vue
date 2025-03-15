<!-- 核保信息 -->
<template>
  <el-dialog v-model="dialogVisible" width="90%" title="核保信息">
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
import { PcisQueryService } from "@/views/payinfo/service/pcis-query-service";
const pcisQueryService = new PcisQueryService();
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const dialogVisible = ref(true);
const props = defineProps({
  CAppNo: {// 申请单号
    type: String,
    default: "",
  }
})
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
        minWidth: 180,
        fixed: 'left',
      },
      {
        prop: "CUndrMrk",
        inputtype: "rtinput",
        title: "核保选项",
        minWidth: 180,
      },
      {
        prop: "CAntiLnderRisk",
        inputtype: "rtselect",
        title: "反洗钱风险",
        minWidth: 180,
        loadData:[
          {value: '0', label: '低'},
          {value: '1', label: '中'},
          {value: '2', label: '高'}
        ]
      },
      {
        prop: "TUpdTm",
        inputtype: "rtdatepicker",
        title: "核保时间",
        minWidth: 180,
      },
      {
        prop: "CUndrOpn",
        inputtype: "rtinput",
        title: "核保意见",
        minWidth: 180,
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
  const param = Object.assign({
    appNo: props.CAppNo
  },s, r);
  pcisQueryService.getUndrOpnList(param)
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

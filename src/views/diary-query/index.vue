<!-- 配置 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
      @page-change="handleQuery(false)" />
    <el-dialog v-model="dialogVisible" title="入参" @close="dialogVisible = false">
      {{ dialogParams }}
    </el-dialog>
  </div>
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
import moment from 'moment';
import { PcisQueryService } from '@/views/payinfo/service/pcis-query-service';
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { log } from "console";
const pcisQueryService = new PcisQueryService();
const dzmodal = useDzModal();
const chatsMgrEdit = defineAsyncComponent(() => import("../sys-right-basic/chats-mgr/chats-mgr-edit.vue"));
const dialogVisible = ref(false);
const dialogParams = ref({});
const tableRef = ref<AppTableMethod | null>(null);
const cTerminalData = [
  { value: '0', label: 'PC端' },
  { value: '1', label: '移动端' }
]
const startTm = moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format('YYYY-MM-DD 00:00:00')
const endTm = moment(new Date(Date.now())).format('YYYY-MM-DD 23:59:59')
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "",
    endBtnsPosition: "right",
    // fromUi: {
    //     cols: 2
    // },
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery();
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          freeEditRef.value?.resetFields()
          nextTick(()=>{
            freeEditRef.value?.setValue('cTimeStart', startTm)
            freeEditRef.value?.setValue('cTimeEnd', endTm)
          })
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cIpStart",
        inputtype: "rtinput",
        title: "IP起"
      },
      {
        prop: "cIpEnd",
        inputtype: "rtinput",
        title: "IP止"
      },
      {
        prop: "cTerminal",
        inputtype: "rtselect",
        title: "终端类型",
        loadData: cTerminalData,
      },
      {
        prop: "cTimeStart",
        inputtype: "rtdatepicker",
        title: "操作日期起期",
        type: 'date',
        rules: [getRules("required", {})],
        format: "YYYY-MM-DD 00:00:00",
        valueFormat: "YYYY-MM-DD 00:00:00",
        defaultValue: new Date(Date.now() - 6 * 1000 * 60 * 60 * 24),
        func: (val) => {
          if (!!val) {
            const dates = moment(new Date(Date.parse(val))).format('YYYY-MM-DD 23:59:59');
            const endDates = moment(dates).add(6, 'day').format('YYYY-MM-DD 23:59:59');
            freeEditRef.value?.setValue('cTimeEnd', endDates)
          }
        }
      },
      {
        prop: "cTimeEnd",
        inputtype: "rtdatepicker",
        title: "操作日期止期",
        type: 'date',
        rules: [getRules("required", {})],
        format: "YYYY-MM-DD 23:59:59",
        valueFormat: "YYYY-MM-DD 23:59:59",
        defaultValue: new Date(Date.now()),
      }
    ],
  })
);

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
          dialogParams.value = row.CParamIn;
          dialogVisible.value = true;
        },
      })
    ],
    fromSchema: [
      {
        prop: "CIp",
        inputtype: "rtinput",
        title: "Ip",
      },
      {
        prop: "CUrl",
        inputtype: "rtinput",
        title: "Url",
      },
      {
        prop: "CTime",
        inputtype: "rtinput",
        title: "时间",
      },
      {
        prop: "CTerminal",
        inputtype: "rtinput",
        title: "终端",
        formatter: (val)=>{
          const result = cTerminalData.find(item => item.value === val);
          return result ? result.label : val;
        }
      }
    ],
  })
);
onMounted(async () => {
  nextTick(()=>{
    freeEditRef.value?.setValue('cTimeStart', startTm)
    freeEditRef.value?.setValue('cTimeEnd', endTm)
  })
 });

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};
/** 查询 */
function handleQuery(flag?: boolean) {
  freeEditRef.value?.validate().then((isValid) => {
    if (!isValid) {
      return false;
    } else {
      const form = freeEditRef.value?.getFromValue(); //获取表单数据
      const start = Date.parse(form.cTimeStart);
      const end = Date.parse(form.cTimeEnd);
      if (start - end > 0) {
          ElMessage.warning('操作起期不能大于操作止期');
          return;
      }
      if (end - start >= 7 * 1000 * 60 * 60 * 24) {
          ElMessage.warning('操作时间范围请控制在7天以内');
          return;
      }
      const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
      const s = freeEditRef.value?.getFromValue(); //获取表单数据
      const param = Object.assign(s, r);
      pcisQueryService.getDiaryList(param)
        .then((res) => {
          const { code, data, msg, total } = res;
          if (200 === code) {
            pageresult.list = [];
            pageresult.list = data;
            pageresult.total = total;
          } else {
            //ElMessage.error(msg);
          }
        })
        .finally(() => { });
    }
  });

}
</script>

<style scoped></style>

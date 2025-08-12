<!-- 发起风勘-查询 -->
<template>
  <div>
    <el-dialog v-model="maindialogVisible" width="70%" title="风勘查询">
      <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
        <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { defineComponent, ref } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElTabs, ElTabPane, ElTable, ElTableColumn } from 'element-plus';

import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";

import { PcisQueryService } from "@/views/payinfoManagement/service/pcis-query-service";
import { defineEmits, onMounted } from "vue";

import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => {{
      return {};
    }},
  },
});
const emits = defineEmits(["ok", "cancel"]);
const pcisQueryService = new PcisQueryService();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const { getRules } = useValidator();
const maindialogVisible = ref(true)
const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          windSave();
        },
      }),
    ],
    fromSchema: [
			{
				prop: "cAppNme",
				inputtype: "rtinput",
				title: "投保人",
			},
			{
				prop: "cInsuredNme",
				inputtype: "rtinput",
				title: "被保人",
			},
			{
				prop: "taskNo",
				inputtype: "rtinput",
				title: "任务号",
			},
		],
  })
);

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    isPage: false,
    showSelection: false,
    tableBtnType: "btn",
    tableBtnWidth: 110,
    tableBtnPosition: "right",
    tableBtnTitle: '详情',
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "查看报告",
        type: "success",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          viewDetails(row)
        },
      }),
    ],
    fromSchema: [
      {
        prop: "nSeqNo",
        inputtype: 'rtinput',
        title: "序号",
      },
      {
        prop: "time",
        inputtype: 'rtinput',
        title: "风勘时间",
      },
      {
        prop: "cSegment",
        inputtype: 'rtselect',
        title: "环节",
				typeCode: 'Segment',
      },
       
    ],
  })
);

onMounted(() => {
	nextTick(() => {
		windSave()
	})
});

// 查询风勘任务
const windSave = () => {
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  let params = { ...s, cInquiryNumber: props.data.plyBase['Base.cInquiryNo'] }
  pcisQueryService.getTaskList(params).then((res: any) => {
		const { code, data, msg } = res;
    if (code == 200) {
      if(data !== null){
				data.forEach((item: any, index: number) => {
          item.nSeqNo = index + 1;
					item.time = item.tSurveyStart?.split(' ')[0] + ' - ' + item.tSurveyEnd?.split(' ')[0]
        });
        pageresult.list = data;
        pageresult.total = data.total;
      }else{
				pageresult.list = [];
        pageresult.total = 0;
        ElMessage.warning(msg)
      }
    } else {
			pageresult.list = [];
      pageresult.total = 0;
      ElMessage.error({ message: msg, duration: 3000 });
    }
  });
}

// 关闭弹窗
const handleReturn = () => {
  maindialogVisible.value = false
};

// 风勘查询---获取风勘任务详情
const viewDetails = (row: any) => {
  let params = {
    taskNo: row.taskNo,
  }

  pcisQueryService.getTaskUrl(params).then((res: any) => {
    if (res.code == 200 && !!res.data) {
			window.open(res.data, '_blank');
    } else {
      ElMessage.error({ message: res.msg, duration: 3000 });
    }
  });
};
</script>

<style scoped lang="scss">
.demo-form-inline {
  margin-bottom: 20px;
}

.tabsSty {
  margin-top: 10px;
}

.tableBtn {
  text-align: right;
  margin-bottom: 10px;
}
</style>

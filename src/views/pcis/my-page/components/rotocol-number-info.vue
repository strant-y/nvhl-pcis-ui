<!-- 协议号-查询 -->
<template>
  <div>
    <el-dialog v-model="maindialogVisible" width="70%" title="协议号查询">
      <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
        <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef" @page-change="handleQuery(false)" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { defineComponent, ref, defineEmits, onMounted  } from 'vue';

import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

import { createFreeButtonBase } from "@/shared/button-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";

import { PcisQueryService } from "@/views/payinfoManagement/service/pcis-query-service";

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
          handleQuery();
        },
      }),
			createFreeButtonBase({
        label: "重置",
        func: () => {
          freeEditRef.value?.resetFields();
          handleQuery(true);
        },
      }),
    ],
    fromSchema: [
			{
				prop: "cEcAgrNo",
				inputtype: "rtinput",
				title: "协议单号",
			},
			{
				prop: "cAppNme",
				inputtype: "rtinput",
				title: "投保人客户名称",
			},
			{
				prop: "insuredNme",
				inputtype: "rtinput",
				title: "被保险人名称",
			},
		],
  })
);

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    tableBtnType: "btn",
    tableBtnWidth: 110,
    tableBtnPosition: "right",
    tableBtnTitle: '详情',
    tableBtn: [],
    fromSchema: [
      {
        prop: "nSeqNo",
        inputtype: 'rtinput',
        title: "序号",
      },
      {
        prop: "cEcAgrNo",
        inputtype: 'rtinput',
        title: "协议号",
      },
      {
        prop: "cAppNme",
        inputtype: 'rtinput',
        title: "投保人客户名称",
      }
    ],
		rowDbClickFun:(row: any)=>{
      emits("ok", row);
      maindialogVisible.value = false
    }
  })
);

onMounted(() => {
	nextTick(() => {
		handleQuery()
	})
});

// 查询协议号
const handleQuery = (flag?: boolean) => {
	const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const params = Object.assign(s,r);
  pcisQueryService.queryEcargoRelevancePolicy(params).then((res: any) => {
		const { code, data, msg } = res;
    if (200 === code) {
				data.data.forEach((item: any, index: number) => {
          item.nSeqNo = index + 1;
        });
        pageresult.list = [];
        pageresult.list = data.data;
        pageresult.total = data.total;
      } else {
        ElMessage.error(msg);
      }
  }).finally(() => {});
}

// 关闭弹窗
const handleReturn = () => {
  maindialogVisible.value = false
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

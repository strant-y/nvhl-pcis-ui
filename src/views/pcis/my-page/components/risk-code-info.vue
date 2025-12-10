<!-- 协议号-查询 -->
<template>
  <div>
    <el-dialog v-if="maindialogVisible" v-model="maindialogVisible" width="70%" title="责任编码查询">
        <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef" />
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

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
		isPage: false,
    fromSchema: [
      {
        prop: "nSeqNo",
        inputtype: 'rtinput',
        title: "序号",
      },
			{
        prop: "code",
        inputtype: 'rtinput',
        title: "责任编码",
      },
      {
        prop: "value",
        inputtype: 'rtinput',
        title: "责任名称",
      },
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

// 查询产品编码
const handleQuery = () => {
	props.data.codelist.forEach((item: any, index: number) => {
		item.nSeqNo = index + 1;
	});
	pageresult.list = [];
	pageresult.list = props.data.codelist;
	pageresult.total = props.data.codelist.length;
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

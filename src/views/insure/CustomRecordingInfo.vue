<template>
	<div class="">
    <el-form ref="freeEditRef" :model="formconfig1">
      <el-form-item label="条款列表" prop="name" >
        <el-input v-model="formconfig1.name" placeholder="请输入条款名称" clearable="">
          <template #append>
            <el-button icon="Search" @click="handleQuery(true)"/>
          </template>
        </el-input>
      </el-form-item>
    </el-form>

    <div class="tableRecordingInfo">
      <app-table class="tableRecordingInfo" :tableConfig="tableconfig"
        v-model:pageresult="pageresult" ref="tableRef"
        @page-change="handleQuery(false)"/>
    </div>
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

const freeEditRef = ref(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
	AppTableConfig,
	AppTableMethod,
	createTableEditConfig,
} from "@/shared/app-table-config";
import { SysOpMgrService } from '@/views/sys-right-basic/service/sys-op-mgr.service';
import { max } from "lodash";
import func from "vue-temp/vue-editor-bridge";
const emits = defineEmits(["rowClick"]);
const props = defineProps({
  datas:{
    type: Array,
    default: () => ([]),    
  }
})
const sysOpMgrService = new SysOpMgrService();
const formconfig1 = reactive({
  name: ""
})

const tableRef = ref<AppTableMethod | null>(null);

const pageresult = reactive<Pageresult>({
	result: "",
	/** 数据列表 */
	list: [],
	/** 总数 */
	total: 0,
});
const tableconfig = reactive<AppTableConfig>(
	createTableEditConfig({
    tableBtnType: "btn",
    tableBtnWidth: 80,
    tableBtnPosition: "left",
    tableBtnTitle:'常用',
    highlightCurrentRow: true,
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        disabled: false,
        type: "success",
        size: "large",
        icon: "StarFilled",
        iconSize: '20',
        iconColor:'rgb(250, 219, 20)',
        hideBtns:(row: any) => {
          if(!row.code) return false;
        },
        tableClick: (row) => {
          row.code = !row.code;
          console.log('取消常用，请求更新当前列表',row)
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        disabled: false,
        type: "info",
        size: "large",
        icon: "StarFilled",
        iconSize: '20',
        hideBtns:(row: any) => {
          if(row.code) return false;
        },
        tableClick: (row) => {
          row.code = !row.code;
          console.log('点击常用，请求更新当前列表',row)
        },
      }),
    ],
		fromSchema: [
			{
				prop: "code",
				inputtype: "rtinput",
				title: "条款代码",
			},
			{
				prop: "value",
				inputtype: "rtinput",
				title: "条款名称",
			},
			// {
			// 	prop: "cOpType",
			// 	inputtype: "rtinput",
			// 	title: "主附险标识",
			// }
		],
	})
);
onMounted(async () => { 
  init();
});

watch(() => props.datas, (newVal: any) => {
  if (newVal) {
    init();
    // handleQuery(true);
  }
})

function init() {
  formconfig1.name = '';
  pageresult.list = props.datas;
  pageresult.total = props.datas.length;
}

/** 查询 */
function handleQuery(flag = true) {
  console.log("查询",flag);
	const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = formconfig1; //获取表单数据
  const param = Object.assign(s, r);
  sysOpMgrService.qrySysOpList(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = [];
        pageresult.list = data.result;
        pageresult.total = data.total;
      } else {
        //ElMessage.error(msg);
      }
    })
    .finally(() => { });
}

</script>

<style scoped>
.tableRecordingInfo >>> .el-table__body tr.current-row>td.el-table__cell {
  background-color: #ffaaa64d;
}
</style>

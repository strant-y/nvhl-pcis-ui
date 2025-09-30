<!-- 配置 -->
<template>
	<div class="app-container">
		<app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
		<app-table
			:tableConfig="tableconfig"
			v-model:pageresult="pageresult"
			ref="tableRef"
			@page-change="handleQuery(false)"
		/>
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
import { SysOperatorPlanService } from '../service/sys-operator-plan.service';
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { log } from "console";
const sysOperatorPlanService = new SysOperatorPlanService();
const dzmodal = useDzModal();
const searchPlanEcargo = defineAsyncComponent(() => import("./search-plan-ecargo.vue"));
const tableRef = ref<AppTableMethod | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(
	createAppFreeEditConfig({
		title: "操作员查询",
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
          freeEditRef.value?.resetFields()
				},
			}),
		],
		fromSchema: [
			{
				prop: "cOperId",
				inputtype: "rtinput",
				title: "操作员代码"
			},
			{
				prop: "cOperCnm",
				inputtype: "rtinput",
				title: "操作员名称"
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
		//showSelection:true,
		// titleBtns: [
		// 	createFreeButtonBase({
		// 		id: "score",
		// 		label: "新增",
		// 		type: "success",
		// 		func: function () {
		// 			dzmodal.open(searchPlanEcargo, { type: "add" }).then((res) => {                
		// 				if (res.type === "ok") {
		// 				handleQuery();
		// 				}
		// 			});
		// 		},
		// 	}),
		// ],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtnFixed: "right",
    tableBtnTitle: '配置项',
    tableBtn: [
    createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {
        dzmodal.open(searchPlanEcargo, { type: "update", data: row }).then((res) => {                
            if (res.type === "ok") {
              handleQuery();
            }
        });
        },
    })
    ],
		fromSchema: [
			{
				prop: "cChaEmpCde",
        inputtype: "rtinput",
				title: "操作员代码",
			},
			{
				prop: "cChaEmpNme",
        inputtype: "rtinput",
				title: "操作员名称",
			},
			{
				prop: "cDptCde",
        inputtype: "rtinput",
				title: "所属机构代码",
			},
			{
				prop: "cDptCnm",
        inputtype: "rtinput",
				title: "所属机构名称",
			},
			{
				prop: "cStatus",
        inputtype: "rtinput",
				title: "是否有效标识",
        formatter: (val)=>{
          const CStatusList = [{value: '1', label: '有效'}, {value: '2', label: '无效'}]
          const result = CStatusList.find(item => item.value === val);
          return result ? result.label : val;
        }
			}
		],
	})
);
onMounted(async () => {});

// 绑定方法
const method = {
	func1: () => {
		console.log(getRules);
	},
};

// 绑定特殊验证器
const exRules = {
	byrtInput: (rule: any, value: any, callback: any) => {
		const r = freeEditRef.value?.getFromValue();
		if (r["name"]) {
			callback();
		} else {
			callback("姓名");
		}
	},
};

/** 查询 */
function handleQuery(flag?: boolean) {
  	//模拟数据
  //   pageresult.list = [{
	// 	cChaEmpCde: 'cChaEmpCde',
	// 	cChaEmpNme: 'cChaEmpNme',
	// 	cDptCde: '1',
	// 	cDptCnm: 'cDptCnm',
	// 	cStatus: '1',
	// }];
	const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
	const s = freeEditRef.value?.getFromValue(); //获取表单数据
	const param = Object.assign(s, r);	
	sysOperatorPlanService.qryEcargoOperatorList(param)
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

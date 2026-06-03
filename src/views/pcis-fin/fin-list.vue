<!-- 配置 -->
<template>
	<div class="app-container">
		<app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
		<app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
			@page-change="handleQuery(false)" />
		<check-list  :data="rowData"/>
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
import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore();
const user = ref(userStore.user);
import moment from 'moment';

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
	AppTableConfig,
	AppTableMethod,
	createTableEditConfig,
} from "@/shared/app-table-config";
import { FinService } from './service/fin.service';
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { log } from "console";
const finService = new FinService();
const dzmodal = useDzModal();
const departmentTree = defineAsyncComponent(
	() => import("./DepartmentTree.vue")
);
const startTm = moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format('YYYY-MM-DD')
const endTm = moment(new Date(Date.now())).format('YYYY-MM-DD')
const finEdit = defineAsyncComponent(() => import("./fin-edit.vue"));
const finCheck = defineAsyncComponent(() => import("./fin-check.vue"));
const checkList = defineAsyncComponent(() => import("./check-list.vue"));
const tableRef = ref<AppTableMethod | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(
	createAppFreeEditConfig({
		title: "资金退票查询",
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
					nextTick(() => {
						reset()
					})
				},
			}),
		],
		fromSchema: [
			{
				prop: "cDptCde",
				inputtype: "rtselect",
				title: "业务机构",
				btnWidth: 10,
				itemWidth: 2,
				rules: [getRules("required", {
					trigger: 'change'
				})],
				showExBtn: true,
				disabled: true,
				btnItems: {
					icon: "Search",
					type: "primary",
					func: () => {
						dzmodal
							.open(departmentTree, { type: "Issuer", data: {} })
							.then((res) => {
								if (res.type === "ok") {
									const selectObj = res.body;
									freeEditRef.value.setValue(
										"cDptCde",
										selectObj.id
									);
									setFormItem("cDptCde", {
										loadData: [
											{
												label: selectObj.name,
												value: selectObj.id,
											},
										],
									});
								}
							});
					},
				},
			},
			{
				prop: "cPlyNo",
				inputtype: "rtinput",
				title: "保单号"
			},
			{
				prop: "cEdrNo",
				inputtype: "rtinput",
				title: "批单号"
			},
			{
				prop: "tUnTmStart",
				inputtype: "rtdatepicker",
				rules: [getRules("required", {})],
				format: "YYYY-MM-DD",
				valueFormat: "YYYY-MM-DD",
				defaultValue: new Date(Date.now() - 6 * 1000 * 60 * 60 * 24),
				title: "退票日期起"
			},
			{
				prop: "tUnTmEnd",
				inputtype: "rtdatepicker",
				rules: [getRules("required", {})],
				format: "YYYY-MM-DD",
				valueFormat: "YYYY-MM-DD",
				defaultValue: new Date(Date.now()),
				title: "退票日期止"
			},
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
const rowData = ref(null);
const tableconfig = reactive<AppTableConfig>(
	createTableEditConfig({
		fromSchema: [
			{
				prop: "cCustSeq",
				inputtype: "rtinput",
				title: "业务唯一流水号",
			},
			{
				prop: "cPlyNo",
				inputtype: "rtinput",
				title: "保单号",
			},
			{
				prop: "cEdrNo",
				inputtype: "rtinput",
				title: "批单号",
			},
			{
				prop: "cAcctNme",
				inputtype: "rtinput",
				title: "账户名",
			},
			{
				prop: "cAcctNo",
				inputtype: "rtinput",
				title: "账户",
			},
			{
				prop: "cBankPro",
				inputtype: "rtinput",
				title: "银行省",
			},
			{
				prop: "cBankArea",

				inputtype: "rtinput",
				title: "银行市",
			},
			{
				prop: "cBankCounty",
				inputtype: "rtinput",
				title: "银行县",
			},
			{
				prop: "cBankCde",
				inputtype: "rtinput",
				title: "开户行代码",
			},
			{
				prop: "cBankCnaps",
				inputtype: "rtinput",
				title: "CNAPS号",
			},
			{
				prop: "cBankAddr",
				inputtype: "rtinput",
				title: "开户行地址",
			},
			{
				prop: "cPubPri",
				inputtype: "rtselect",
				title: "对公对私",
				loadData: [
					{ label: "对公", value: "1" },
					{ label: "对私", value: "2" },
				],
			},
			{
				prop: "cExamCde",
				inputtype: "rtinput",
				title: "审核人",
			}
		],

		rowDbClickFun(row) {
			rowData.value = row;
		},
	})
);
onMounted(async () => {
	nextTick(() => {
		reset()
	})
});

const reset = () => {
	freeEditRef.value?.setValue('tUnTmStart', startTm)
	freeEditRef.value?.setValue('tUnTmEnd', endTm)
	setFormItem("cDptCde", {
		loadData: [
		{
			label: user.value.companyId + user.value.companyCnm ,
			value: user.value.companyId,
		},
		],
	});

	setValue('cDptCde',user.value.companyId)
}

// 绑定方法
const method = {
	func1: () => {
	},
};
/** 查询 */
function handleQuery(flag?: boolean) {
	//模拟数据
	// pageresult.list = [{
	// 	CCustSeq: '111',
	// 	CPlyNo: '222',
	// 	CEdrNo: '333',
	// 	CStatus: '1',
	// 	CDepartmentCode: '1',
	// 	CCustomerNameCn: '1',
	// 	CCustAccountNo: '1',
	// 	CBankProvince: '1',
	// 	CBankCity: '1',
	// 	CBankName: '1',
	// 	CIspayPublic: '1',
	// 	CResult: '1',
	// 	CId: '22'
	// }];
	freeEditRef.value?.validate().then((isValid) => {
		if (!isValid) {
			return false;
		} else {
			const form = freeEditRef.value?.getFromValue(); //获取表单数据
			if (!form.cPlyNo && !form.cEdrNo) {
				const start = Date.parse(form.tUnTmStart);
				const end = Date.parse(form.tUnTmEnd);
				if (start - end > 0) {
					ElMessage.warning('退票起期不能大于退票止期');
					return;
				}
				if (end - start >= 7 * 1000 * 60 * 60 * 24) {
					ElMessage.warning('退票时间范围请控制在7天以内');
					return;
				}
			}
			const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
			const s = freeEditRef.value?.getFromValue(); //获取表单数据
			const param = Object.assign(s, r, {
				// cCustSeq: '',
				CAppTyp:"A",
				SysCode:"POLY_CASU",
				sortField: 'name',
				CurrentUser: user.value['opCde'],
				CurrentUserOrg: user.value['companyId']
			});
			finService.listBackTra(param)
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
				.finally(() => { });
		}
	});
}



//给表单下拉项赋值
const setFormItem = (key, obj) => {
	if (obj && Object.keys(obj).length) {
		formconfig1.fromSchema?.forEach((item) => {
			if (item.prop === key) {
				//控制尾部按钮的
				if (item.loadData && obj.loadData) {
					let newBtnItems = null;
					if (obj.loadData.length != 0) {
						for (let key in obj.loadData) {
							item.loadData[key] = obj.loadData[key];
						}
					} else {
						item.loadData = obj.loadData;
					}
					newBtnItems = item.loadData;
					newBtnItems && (obj.loadData = newBtnItems);
				}
				Object.assign(item, obj);
			}
		});
	}
}


function getFromValue() {
	return freeEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
	freeEditRef?.value?.setFormValue(value);
}

function validate() {
	return freeEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
	freeEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
	return freeEditRef?.value?.getValue(key);
}
function getFormconfig() {
	return formconfig1;
}

defineExpose({
	getFromValue,
	setFormValue,
	validate,
	setValue,
	getValue,
	getFormconfig,
});
</script>

<style scoped></style>

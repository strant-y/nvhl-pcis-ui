<!-- 配置 -->
<template>
	<div class="check-list-container">
		<app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
			@page-change="handleQuery(false)" />
	</div>
</template>

<script setup lang="ts">
import { ref ,watch} from "vue";
import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore();
const user = ref(userStore.user);
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
	AppTableConfig,
	AppTableMethod,
	createTableEditConfig,
} from "@/shared/app-table-config";
import { FinService } from './service/fin.service';
import { log } from "console";
const finService = new FinService();
const tableRef = ref<AppTableMethod | null>(null);
const props = defineProps({
	data: Object,

});



watch(() => props.data, (newValue, oldValue) => {
	if(newValue){
		handleQuery(true)

	}
  // 处理变化
}, { deep: true });

// watchEffect()
const pageresult = reactive<Pageresult>({
	result: "",
	/** 数据列表 */
	list: [],
	/** 总数 */
	total: 0,
});
const tableconfig = reactive<AppTableConfig>(
	createTableEditConfig({
		title: '审核修改记录',
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
				prop: "cCrtCde",
				inputtype: "rtinput",
				title: "提交人",
			},
			{
				prop: "tCrtTm",
				inputtype: "rtinput",
				title: "提交时间",
			},
			{
				prop: "tOprTyp",
				inputtype: "rtselect",
				title: "操作类型",
				loadData:[
					{label: '未申请修改',value: "0"},
					{label: "提交",value :"1"},
					{label: '已通过',value: "2"},
					{label: '已退回', value: '3'}
				]
			},
			{
				prop: "cCheckOpn",
				inputtype: "rtinput",
				title: "审核意见",
			}
		],
	})
);
onMounted(async () => {
});
/** 查询 */
function handleQuery(flag?: boolean) {
	//模拟数据
	// pageresult.list = [{
	// 	CCustSeq: '111',
	// 	CPlyNo: '222',
	// 	CEdrNo: '333',
	// 	CStatus: '1',
	// 	CAcctNo: '1',
	// 	CCrtCde: '1',
	// 	CCustAccountNo: '1',
	// 	TCrtTm: '1',
	// 	COprTyp: '1',
	// 	CCheckOpn: '1',
	// 	CIspayPublic: '1',
	// 	CAcctNme: '1',
	// 	CId: '22'
	// }];
	const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
	const param = Object.assign({}, r, {
		// cachesCustSeq: '', //! 待补充
		cCustSeq:props.data.cCustSeq,
		CurrentUser: user.value['opCde'],
		CurrentUserOrg: user.value['companyId']
	});
	finService.listZjtrack(param)
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
</script>

<style scoped></style>

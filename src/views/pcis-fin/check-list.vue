<!-- 配置 -->
<template>
	<div class="check-list-container">
		<app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
			@page-change="handleQuery(false)"/>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
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
				prop: "CCustSeq",
				inputtype: "rtinput",
				title: "业务唯一流水号",
			},
			{
				prop: "CPlyNo",
				inputtype: "rtinput",
				title: "保单号",
			},
			{
				prop: "CEdrNo",
				inputtype: "rtinput",
				title: "批单号",
			},
			{
				prop: "CAcctNme",
				inputtype: "rtinput",
				title: "账户名",
			},
			{
				prop: "CAcctNo",
				inputtype: "rtinput",
				title: "账户",
			},
			{
				prop: "CCrtCde",
				inputtype: "rtinput",
				title: "提交人",
			},
			{
				prop: "TCrtTm",
				inputtype: "rtinput",
				title: "提交时间",
			},
			{
				prop: "COprTyp",
				inputtype: "rtinput",
				title: "操作类型",
			},
			{
				prop: "CCheckOpn",
				inputtype: "rtinput",
				title: "审核意见",
			}
		],
	})
);
onMounted(async () => {
  nextTick(()=>{
    handleQuery(true)
  })
});
/** 查询 */
function handleQuery(flag?: boolean) {
	//模拟数据
	pageresult.list = [{
		CCustSeq: '111',
		CPlyNo: '222',
		CEdrNo: '333',
		CStatus: '1',
		CAcctNo: '1',
		CCrtCde: '1',
		CCustAccountNo: '1',
		TCrtTm: '1',
		COprTyp: '1',
		CCheckOpn: '1',
		CIspayPublic: '1',
		CAcctNme: '1',
    CId:'22'
	}];
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const param = Object.assign({}, r, {
      CCustseq: '', //! 待补充
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

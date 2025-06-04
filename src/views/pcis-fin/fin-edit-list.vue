<!-- 配置 -->
<template>
	<div class="app-container">
		<app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
		<app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
			@page-change="handleQuery(false)" @selection-change="handleSelectionChange"/>
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
const multipleSelection = ref([]);
const startTm = moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format('YYYY-MM-DD')
const endTm = moment(new Date(Date.now())).format('YYYY-MM-DD')



const finEdit = defineAsyncComponent(() => import("./fin-edit.vue"));
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
          nextTick(()=>{
            freeEditRef.value?.setValue('tUnTmStart', startTm)
            freeEditRef.value?.setValue('tUnTmEnd', endTm)
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
        typeCode: "org_dpt",
				params: {'cDptCde': user.value['companyId']},
				showExBtn: true,
        //disabled: true,
				btnItems: {
					icon: "Search",
					type: "primary",
					func: () => {
						dzmodal
							.open(departmentTree, { type: "Issuer", data: {} })
							.then((res) => {
								if (res.type === "ok") {
                  const label = res.label
                  nextTick(()=>{
                    freeEditRef.value?.setValue('cDptCde', label)
                  })
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
const tableconfig = reactive<AppTableConfig>(
	createTableEditConfig({
    showSelection: true,
    isRadio: true,
		titleBtns: [
			createFreeButtonBase({
				id: "score",
				label: "修改",
				type: "success",
				func: function () {
          if (multipleSelection.value.length < 1 ) {
            ElMessage.warning('请选择一条记录');
            return ;
          }          
					dzmodal.open(finEdit, { type: "update" , data: multipleSelection.value[0] }).then((res) => {
						if (res.type === "ok") {
							handleQuery();
						}
					});
				},
			}),
		],
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
				prop: "CStatus",
				inputtype: "rtinput",
				title: "状态",
			},
			{
				prop: "CDepartmentCode",
				inputtype: "rtinput",
				title: "业务部门代码",
			},
			{
				prop: "CCustomerNameCn",
				inputtype: "rtinput",
				title: "收款客户名称",
			},
			{
				prop: "CCustAccountNo",
				inputtype: "rtinput",
				title: "收款客户账号",
			},
			{
				prop: "CBankProvince",
				inputtype: "rtinput",
				title: "开户行省",
			},
			{
				prop: "CBankCity",
				inputtype: "rtinput",
				title: "开户行市",
			},
			{
				prop: "CBankName",
				inputtype: "rtinput",
				title: "开户行名称",
			},
			{
				prop: "CIspayPublic",
				inputtype: "rtinput",
				title: "对公对私",
			},
			{
				prop: "CResult",
				inputtype: "rtinput",
				title: "退票原因",
			}
		],
	})
);
onMounted(async () => {
  nextTick(()=>{
    freeEditRef.value?.setValue('tUnTmStart', startTm)
    freeEditRef.value?.setValue('tUnTmEnd', endTm)
  })
});

// 绑定方法
const method = {
	func1: () => {
		console.log(getRules);
	},
};

const handleSelectionChange = (val: any[]) => {
  multipleSelection.value = val;
};
/** 查询 */
function handleQuery(flag?: boolean) {
	//模拟数据
	pageresult.list = [{
		CCustSeq: '111',
		CPlyNo: '222',
		CEdrNo: '333',
		CStatus: '1',
		CDepartmentCode: '1',
		CCustomerNameCn: '1',
		CCustAccountNo: '1',
		CBankProvince: '1',
		CBankCity: '1',
		CBankName: '1',
		CIspayPublic: '1',
		CResult: '1',
    CId:'22'
	}];
  freeEditRef.value?.validate().then((isValid) => {
    if (!isValid) {
      return false;
    } else {
      const form = freeEditRef.value?.getFromValue(); //获取表单数据
      if(!form.cPlyNo && !form.cEdrNo){
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
          sortField: 'name',
          CurrentUser: user.value['opCde'],
          CurrentUserOrg: user.value['companyId']
      });
      finService.getFinRebackList(param)
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
</script>

<style scoped></style>

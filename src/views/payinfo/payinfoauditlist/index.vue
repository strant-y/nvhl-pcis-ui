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
import { getListByCode } from '@/api/code-list-service';
const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
	AppTableConfig,
	AppTableMethod,
	createTableEditConfig,
} from "@/shared/app-table-config";
import { PcisQueryService } from '../service/pcis-query-service';
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { log } from "console";
const pcisQueryService = new PcisQueryService();
const dzmodal = useDzModal();
const departmentTree = defineAsyncComponent(
	() => import("@/components/common/DepartmentTree.vue")
);
import moment from 'moment';
import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore();
const user = ref(userStore.user);
const startTm = moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format('YYYY-MM-DD 00:00:00')
const endTm = moment(new Date(Date.now())).format('YYYY-MM-DD 23:59:59')
const multipleSelection = ref([]);
const cPayStatusList = [
  {value: '0', label: '待缴费'},
  {value: '1', label: '已缴费'},
  {value: '2', label: '修改缴费'},
];
const cCheckStsList = [
    {value: '00', label: '待缴费'},
    {value: '0', label: '待登记'},
    {value: '1', label: '待审核'},
    {value: '2', label: '待修改'},
    {value: '3', label: '审核通过'},
    {value: '4', label: '缴费成功'},
    {value: '5', label: '刷卡成功待重复确认'},
    {value: '6', label: '待确认'},
    {value: '7', label: '已登记'},
    {value: '9', label: '重复投保'},
];
const cPayTypList = ref([])
const payConfirmInfoChange = defineAsyncComponent(() => import("./pay-confirm-info-change.vue"));
const payConfirmInfoRegister = defineAsyncComponent(() => import("./pay-confirm-info-register.vue"));
const payConfirmInfoDetailRead = defineAsyncComponent(() => import("./pay-confirm-info-detail-read.vue"));
const tableRef = ref<AppTableMethod | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(
	createAppFreeEditConfig({
		title: "缴费信息查询",
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
						freeEditRef.value?.setValue('TUnTmStart', startTm)
						freeEditRef.value?.setValue('TUnTmEnd', endTm)
					  })
					},
				}),
		],
		fromSchema: [
			{
				prop: "AccDpt",
				inputtype: "rtselect",
				title: "机构部门",
				btnWidth: 10,
				itemWidth: 2,
				// rules: [getRules("required", {
        //   trigger: 'change'
        // })],
				params: { 'CDptCde': user.value['companyId'] }, 
				showExBtn: true,
				btnItems: {
					icon: "Search",
					type: "primary",
					func: () => {
						dzmodal
							.open(departmentTree, { type: "Issuer", data: {} })
							.then((res) => {
								if (res.type === "ok") {
								}
							});
					},
				},
			},
			{
				prop: "LoadSub",
				inputtype: "rtcheckbox",
				title: "是否包含下级",
				defaultValue: 1,
				keymap: {
				  y: 1,
				  n: 0,
				},
			},
			{
				prop: "CPayStatus",
				inputtype: "rtselect",
				rules: [getRules("required", {trigger: 'change'})],
        		typeCode: "WEB_BAS_CODELIST",
                codeParam: {'cParCde': 'DY1'},
				title: "缴费状态",
        		// defaultValue: '0'
			},
			{
				prop: "CKindNo",
				inputtype: "rtselect",
				title: "产品大类",
				typeCode: "KIND_LIST_GRT",
				params: {'cOperId': user.value['opCde'], 'cDptCde': user.value['companyId']},
			},
			{
				prop: "CProdNo",
				inputtype: "rtselect",
				title: "产品",
				typeCode: "PROD_LIST_GRT",
				params: {'cParCde': '', 'cOperId': user.value['opCde'], 'cDptCde': user.value['companyId']},
			},
			{
				prop: "CAppNmeInvest",
				inputtype: "rtinput",
				title: "投保人"
			},
			{
				prop: "CPayTyp",
				inputtype: "rtselect",
				title: "缴费类型",
				typeCode: "CHARGE_TYPE_CACHE",
				param: {'cCde': [ '2', '3', '5',  '99']},
			},
			{
				prop: "CCombinationNo",
				inputtype: "rtinput",
				title: "组合产品申请单号"
			},
			{
				prop: "CBillTyp",
				inputtype: "rtselect",
				title: "单据类型",
				loadData :[{value: '1', label: '投保单号'},
				  {value: '3', label: '支票号'},
				  {value: '4', label: '保单号'},
				  {value: '5', label: '交易号'},
				  {value: '6', label: '支付号'}
				],
        		defaultValue: '1',
			},
			{
				prop: "CBillNoStart",
				inputtype: "rtinput",
				title: "单据号起"
			},
			{
				prop: "CBillNoEnd",
				inputtype: "rtinput",
				title: "单据号止"
			},
			{
				prop: "CDateTyp",
				inputtype: "rtselect",
				title: "日期类型",
				loadData :[{value: '1', label: '核保日期'},
				  {value: '2', label: '起保日期'},
				  {value: '3', label: '缴费处理日期'}
				],
				// defaultValue: '1',
				rules: [getRules("required", {
				  trigger: 'change'
				})],
			},
			{
				prop: "TUnTmStart",
				inputtype: "rtdatepicker",
				title: "日期起期",
				type: 'date',
				rules: [getRules("required", {trigger: 'change'})],
				format: "YYYY-MM-DD 00:00:00",
				valueFormat: "YYYY-MM-DD 00:00:00",
				defaultValue: new Date(Date.now() - 6 * 1000 * 60 * 60 * 24),
				func: (val) => {
				  if (!!val) {
					const dates = moment(new Date(Date.parse(val))).format('YYYY-MM-DD 23:59:59');
					const endDates = moment(dates).add(6, 'day').format('YYYY-MM-DD 23:59:59');
					freeEditRef.value?.setValue('TUnTmEnd', endDates)
				  }
				}
			},
			{
				prop: "TUnTmEnd",
				inputtype: "rtdatepicker",
				title: "日期止期",
				type: 'date',
				rules: [getRules("required", {trigger: 'change'})],
				format: "YYYY-MM-DD 00:00:00",
				valueFormat: "YYYY-MM-DD 00:00:00",
				defaultValue: new Date(Date.now())
			},
			{
				prop: "CSlsNme",
				inputtype: "rtinput",
				title: "业务员名称"
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
    showSelection: true,
		titleBtns: [
      createFreeButtonBase({
				type: "primary",
				label: "缴费类型转换",
				func: async () => {
					  if (multipleSelection.value.length < 1 ) {
						ElMessage.warning('所选记录为空！');
						return ;
					  }
					  // if (multipleSelection.value.length > 30 ) {
					  //   ElMessage.warning('获取支付号 数量最大为30单！');
					  //   return ;
					  // }
					  gotoChangeSts()
				},
			}),
			createFreeButtonBase({
				type: "primary",
				label: "支票登记",
				func: async () => {
					dzmodal.open(payConfirmInfoRegister, { type: "" }).then((res) => {
						if (res.type === "ok") {
							console.log("审核")
						}
					});
				},
			}),
			// createFreeButtonBase({
			// 	type: "primary",
			// 	label: "导出Excel",
			// 	func: async () => {
			// 		console.log('导出Excel')
			// 	},
			// }),
			// createFreeButtonBase({
			// 	type: "primary",
			// 	label: "打印缴费通知书",
			// 	func: async () => {
			// 		console.log('打印缴费通知书')
			// 	},
			// }),
		],
		tableBtnType: "btn",
		tableBtnWidth: 150,
		// tableBtnPosition: "right",
		tableBtnFixed: "right",
		// tableBtn: [
			// createFreeButtonBase({
			// 	id: "score",
			// 	link: true,
			// 	tooltip: "详情",
			// 	type: "success",
			// 	size: "large",
			// 	icon: "View",
			// 	tableClick: (row) => {
			// 		dzmodal.open(payConfirmInfoDetailRead, { type: "view", data: row }).then((res) => {
			// 			if (res.type === "ok") {
			// 				console.log("详情")
			// 			}
			// 		});
			// 	},
			// }),
			// createFreeButtonBase({
			// 	id: "score",
			// 	link: true,
			// 	tooltip: "文档",
			// 	type: "success",
			// 	size: "large",
			// 	icon: "Document",
			// 	tableClick: (row) => {
          	// 		console.log("编辑")
			// 	},
			// }),
		// ],
		fromSchema: [
			{
				prop: "cAppNo",
				inputtype: "rtinput",
				title: "投保单号",
			},
			{
				prop: "nTms",
				inputtype: "rtinput",
				title: "期次",
			},
			{
				prop: "cAppNmeInvest",
				inputtype: "rtinput",
				title: "投保人名称",
			},
			{
				prop: "cPayTyp",
				inputtype: "rtinput",
				title: "缴费类型",
				formatter: (val)=>{
				  const result = cPayTypList.value.find(item => item.value === val);
				  return result ? result.label : val;
				}
			},
			{
				prop: "cPaySequence",
				inputtype: "rtinput",
				title: "无线pos缴费序号",
			},
			{
				prop: "nPrm",
				inputtype: "rtinput",
				title: "保费金额",
			},
			{
				prop: "nPayAmt",
				inputtype: "rtinput",
				title: "应缴金额",
			},
			{
				prop: "cCheckSts",
				inputtype: "rtinput",
				title: "处理状态",
				formatter: (val)=>{
				  const result = cCheckStsList.find(item => item.value === val);
				  return result ? result.label : val;
				}
			},
			{
				prop: "tBgnTm",
				inputtype: "rtinput",
				title: "起保日期",
			},
			{
				prop: "cUniqueNo",
				inputtype: "rtinput",
				title: "收据流水号",
			},
			{
				prop: "cBatchNo",
				inputtype: "rtinput",
				title: "批号",
			},
			{
				prop: "cPayStatus",
				inputtype: "rtinput",
				title: "缴费状态",
				formatter: (val)=>{
				  const result = cPayStatusList.find(item => item.value === val);
				  return result ? result.label : val;
				}
			},
			{
				prop: "tUdrTm",
				inputtype: "rtinput",
				title: "核保日期",
			},
			{
				prop: "cChargeCde",
				inputtype: "rtinput",
				title: "操作员",
			}
		],
	})
);
onMounted(async () => {
  nextTick(()=>{
    freeEditRef.value?.setValue('CPayStatus', '0')
    freeEditRef.value?.setValue('CDateTyp', '1')
    freeEditRef.value?.setValue('TUnTmStart', startTm)
    freeEditRef.value?.setValue('TUnTmEnd', endTm)
  })  
  getListByCode('WEB_BAS_CODELIST', {
      'cParCde': 'shoufeifangshi',
      'cIsValid': '1'
  }).then(res => {
    if (!!res && !!res['data']) {
      cPayTypList.value = res['data'];
    }
  }, error => {
      console.log('出错了', error);
      ElMessage.error('后台服务异常,请联系管理员');
  });
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
  freeEditRef.value?.validate().then((isValid) => {
    if (!isValid) {
      return false;
    } else {
      const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
      const s = freeEditRef.value?.getFromValue(); //获取表单数据
		console.log(r)
		console.log(s)
      const start = Date.parse(s.cTimeStart);
      const end = Date.parse(s.cTimeEnd);
      if (start - end > 0) {
          ElMessage.warning('日期起期不能大于日期止期');
          return;
      }
      if (end - start >= 31 * 1000 * 60 * 60 * 24) {
          ElMessage.warning('日期时间范围请控制在31天以内');
          return;
      }
      const param = Object.assign(s, r, {
        sortField: 'name',
        _allow_anonymous: true,
        CurrentUser: user.value['opCde'],
        CurrentUserOrg: user.value['companyId'],
        //codeListMap: this.codeListMap
      });
      console.log(param)
      pcisQueryService.getPayConfirmInfoList(param)
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
    }});
}
function gotoChangeSts() {
  let CUniqueNos = ''; // 所选项的流水号组合
  let CRelAppNos = ''; // 所选项的联合单号组合
  let cBatchNos = false; // 判断是否存在批号
  multipleSelection.value.forEach(item => {
    let cRelAppNo = '';
    if(item['cRelAppNo']) {
      cRelAppNo = item['cRelAppNo'];
    }
    if (item['cBatchNo']) {
        cBatchNos = true;
    }
    CUniqueNos = CUniqueNos === '' ? item['cUniqueNo'] : CUniqueNos + ',' + item['cUniqueNo'];
    CRelAppNos = CRelAppNos === '' ? cRelAppNo : CRelAppNos + ',' + cRelAppNo;   
  });
  if (cBatchNos) {
      ElMessage.warning('该单存在批号，不能进行缴费类型转换，请先清空批号！');
      return;
  }
  const param = { 
    CUniqueNo: CUniqueNos
  };
  pcisQueryService.befChangeSts(param)
    .then((res) => {
      // const { code, data, msg } = res;
      // if (200 === code) {
      //   if(msg === 'OK') {
      //     dzmodal.open(payConfirmInfoChange, { type: "check" , data:{
      //       CUniqueNos: CUniqueNos,
      //       CRelAppNos: CRelAppNos        
      //     }}).then((res) => {
      //       if (res.type === "ok") {
      //         console.log("审核")
      //       }
      //     });
      //   }
      // } else {
      //   ElMessage.error(msg);
      // }
    })
    .finally(() => { 
      dzmodal.open(payConfirmInfoChange, { type: "check" , data:{
        CUniqueNos: CUniqueNos,
        CRelAppNos: CRelAppNos
      }}).then((res) => {
        if (res.type === "ok") {
          console.log("审核")
        }
      });
    });
}
</script>

<style scoped></style>

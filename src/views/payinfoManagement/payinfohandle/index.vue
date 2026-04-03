<!-- 配置 -->
<template>
	<div class="app-container">
		<app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
		<app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
			@page-change="handleQuery(false)" @selection-change="handleSelectionChange">
			<!-- policyInfo 列的具名插槽 -->
			<template #column-cAppNo="{ row, column, index }">
                <div class="policy-info-cell">
                    <div v-if="row.combinedAppPlyNo && row.combinedAppPlyNo.cAppNo" class="policy-number-row">
                    <span>{{ row.combinedAppPlyNo.cAppNo }}</span>
                    <el-icon class="copy-icon" @click="copyText(row.combinedAppPlyNo.cAppNo)">
                        <DocumentCopy />
                    </el-icon>
                    </div>
                    <div v-if="row.combinedAppPlyNo && row.combinedAppPlyNo.cPlyNo" class="policy-number-row">
                    <span>{{ row.combinedAppPlyNo.cPlyNo }}</span>
                    <el-icon class="copy-icon" @click="copyText(row.combinedAppPlyNo.cPlyNo)">
                        <DocumentCopy />
                    </el-icon>
                    </div>
                </div>
            </template>
            <template #column-cAppNmeInvest="{ row, column, index }">
                <el-tooltip :content="row.cAppNmeInvest" placement="top">
                    <span v-html="row.cAppNmeInvest || ''" class="twoLine"></span>
                </el-tooltip>
            </template>
		</app-table>
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
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { log } from "console";
import { saveAs } from 'file-saver';
import { DocumentCopy } from "@element-plus/icons-vue";
import { useRoute, useRouter, RouteRecordRaw } from "vue-router";

import { codeListViewStore } from "@/store";



const pcisQueryService = new PcisQueryService();
const policyService = new PolicyService();
const dzmodal = useDzModal();
// const departmentTree = defineAsyncComponent(
// 	() => import("@/components/common/DepartmentTree.vue")
// );
import DepartmentTree from "@/pcis/prodRef/commodityRef/DepartmentTree.vue";
import moment from 'moment';
import { descryptParameter } from "@/utils/encipher.ts";
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
const router = useRouter();
const route = useRoute();
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
const payConfirmInfoChanges = defineAsyncComponent(() => import("./pay-confirm-info-changes.vue"));
const payConfirmInfoRegister = defineAsyncComponent(() => import("./pay-confirm-info-register.vue"));
const payConfirmInfoDetailRead = defineAsyncComponent(() => import("./pay-confirm-info-detail-read.vue"));
const tableRef = ref<AppTableMethod | null>(null);
let cTermNoList = ref<any>([]);  // 条款数据
let cTermNo = '';    // 条款编码
const env = import.meta.env;

function extractCode(str:string) {
  // 匹配 "P+数字" 或 "纯数字"
  const pattern = /^(P\d+|\d+)/;
  return str.match(pattern)?.[0] || "";
}


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
							freeEditRef.value?.setValue('CPayStatus', '0')
							freeEditRef.value?.setValue('CDateTyp', '1')
							freeEditRef.value?.setValue('LoadSub', 1)
							freeEditRef.value?.setValue('TUnTmStart', startTm)
							freeEditRef.value?.setValue('TUnTmEnd', endTm)
							freeEditRef.value?.setValue("AccDpt", user.value['companyId']);
							setFormItem("AccDpt", {
								loadData: [
										{
												label: user.value['companyId'] + ' ' + user.value['companyCnm'],
												value: user.value['companyId'],
										},
								], 
							});
							freeEditRef.value?.setValue('CBillTyp', '1');
							if(params.cAppNo) {
									freeEditRef.value?.setValue('CBillNoStart', params.cAppNo)
									freeEditRef.value?.setValue('CBillNoEnd', params.cAppNo)
							}
							freeEditRef.value?.setValue('isEcargo', '0');
					  })
					},
				}),
				createFreeButtonBase({
					label: "导出Excel",
					func: () => {
                        freeEditRef.value?.validate().then((isValid) => {
                            if (!isValid) {
                                return false;
                            } else {
                                const r = tableRef.value?.getPartnerPage(); //获取分页数据
                                const s = freeEditRef.value?.getFromValue(); //获取表单数据
                                const param = Object.assign(s, r, {
                                    sortField: 'name',
                                    _allow_anonymous: true,
                                    CurrentUser: user.value['opCde'],
                                    CurrentUserOrg: user.value['companyId'],
                                    CType:'queryPayConfrimList',
                                });
                                console.log(param)
                                param['pageSize']=1000
                                policyService.excelDown(param).then((res: any) => {
                                    if (res.size <= 0) {
                                        ElMessage.error({ message: '下载出错', duration: 3000 });
                                        return;
                                    }
                                    const fileName = `缴费信息.xls`;
                                    const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' });
                                    saveAs(blob, fileName);
                                }).catch((err: any) => {
                                    ElMessage.error({ message: err, duration: 3000 });
                                });
                            }});
					},
				}),
				createFreeButtonBase({
					label: "打印缴费通知书",
					func: () => {
                        if (multipleSelection.value.length < 1 ) {
                            ElMessage.warning('所选记录为空！');
                            return ;
                        }
                        if (multipleSelection.value.length > 1 ) {
                            ElMessage.warning('所选记录为只能为一条！');
                            return ;
                        }
                        let CAppNos = ''; // 所选项的流水号组合
                        let CProdNos = ''; // 所选项的流水号组合
                        let plyNo =''; //保单号
                        let CAppNo =''; //保单号
                        multipleSelection.value.forEach(item => {
                            CAppNos = CAppNos === '' ? item['cAppNo'] : CAppNos + ',' + item['cAppNo'];
                            CProdNos = CProdNos === '' ? item['cProdNo'] : CProdNos + ',' + item['cProdNo'];
													plyNo = item['cPlyNo'] ? item['cPlyNo'] : item['cAppNo'];
														CAppNo = item['cAppNo'];
                        });
                        const param = {
                            "CLanguage": 'C',
                            "CProdNo": CProdNos,
                            "CAppNoMulti": CAppNos,
                            "CPrnType": 'W',
														"CPrnFmp":"JFTZS",
														plyNo,
														CAppNo,
                        };
                        console.log(param)
                        pcisQueryService.smartbipreview(param)
                            .then((res) => {
                                const { code, data, msg } = res;
                                if (200 === code) {
                                  window.open(data, "_blank");
                                  //   ElMessage.success(msg);
                                  //   handleQuery();
                                } else {
                                    ElMessage.error(msg);
                                }
                            })
                            .finally(() => { });
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
				showExBtn: true,
                rules: [getRules("required", {trigger: 'change'})],
				btnItems: {
					icon: "Search",
					type: "primary",
					func: () => {
						dzmodal
							.open(DepartmentTree, { type: "Issuer", data: {} })
							.then((res) => {
                                if (res.body) {
                                    const selectObj = res.body;
                                    freeEditRef.value?.setValue("AccDpt", selectObj.id);
                                    setFormItem("AccDpt", {
                                        loadData: [
                                            {
                                                label: selectObj.id + ' ' + selectObj.name,
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
				prop: "LoadSub",
				inputtype: "rtcheckbox",
				title: "是否包含下级",
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
                clearable: true,
				params: {'cOperId': user.value['opCde'], 'cDptCde': user.value['companyId']},
                func: (val: any) => {
                    // // 更新产品下拉选
                    // setFormItem("CProdNo", {
                    //     codeParam: {
                    //         cParCde: val,
                    //         cOperId: user.value?.opCde,
                    //         cDptCde: user.value?.companyId,
                    //     },
                    // });
                    // freeEditRef.value?.setValue("CProdNo", null);
                        freeEditRef.value?.setValue("CProdNo","")
                        cTermNo = "";      // 重置条款编码
                        // cPard.value = val;
                       codeListStore
                    .queryCodeList({
                        codeListName: "TERM_LIST_IN_GUIDE_SEARCH",
                        codeListParam:{
                        cParCde: val,
                        cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
                        cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
                    },
                    })
                    .then((res) => {
                        cTermNoList.value = res;
                        setFormItem("CProdNo", {
                            loadData: res,
                        });
                    });

                },
			},
			{
				prop: "CProdNo",
				inputtype: "rtselect",
				title: "条款",
				// typeCode: "TERM_LIST_IN_GUIDE_NEW",
                // clearable: true,
				// params: {'cParCde': '', 'cOperId': user.value['opCde'], 'cDptCde': user.value['companyId']},
                     
              itemWidth: 1,
              rules: [{ type: "required" }],
              filterable: true,
                clearable: true,
                    func: (val:any) => {

                    if(val){
                            if(cTermNoList.value.length>0){
                                cTermNoList.value.forEach((ele) => {
                                    if(ele['value']  === val){
                                        cTermNo =extractCode(ele['label'])
                                    }
                                });
                            }  
                    } else {
                        cTermNo = "";
                    }
                    
                }
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
                clearable: true,
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
				loadData :[{value: '1', label: '申请单号'},
				  {value: '3', label: '支票号'},
				  {value: '4', label: '保单号'},
				  {value: '5', label: '交易号'},
				  {value: '6', label: '支付号'},
          {value: '7', label: '组合单号'}
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
			},
			{
				prop: "isEcargo",
				inputtype: "rtcheckbox",
				title: "是否协议",
				keymap: {
				  y: '1',
				  n: '0',
				},
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
	titleBtns: [
				createFreeButtonBase({
					type: "primary",
					label: "获取支付号",
					func: async () => {
						if (multipleSelection.value.length < 1 ) {
							ElMessage.warning('所选记录为空！');
							return ;
						}
						if (multipleSelection.value.some(item => item.cClntMrk == '0')) {
							ElMessage.warning('当前投保人性质为法人单位，根据监管要求，财务缴费审核请选择：支票审核。');
						}
						ElMessageBox.confirm("确认要获取支付号吗？", "提示", {
								confirmButtonText: "确定",
								cancelButtonText: "取消",
								type: "warning",
								lockScroll: false,
						}).then(() => {
								let CUniqueNos = ''; // 所选项的流水号组合
								multipleSelection.value.forEach(item => {
										CUniqueNos = CUniqueNos === '' ? item['cUniqueNo'] : CUniqueNos + ',' + item['cUniqueNo'];
								});
								const param = {
										"UserId": user.value['opCde'],
										"CompanyId": user.value['companyId'],
										"OpRelCde": user.value['opCde'],
										"CUniqueNo": CUniqueNos,
										"isEcargo": freeEditRef.value?.getFromValue().isEcargo || '0',
								};
								//这一块儿如果要校验缴费类型的话，请排除云南分公司
								console.log(param)
								pcisQueryService.getPaymentNo(param)
										.then((res) => {
												const { code, data, msg } = res;
												if (200 === code) {
														ElMessage.success(msg);
														handleQuery();
												} else {
														ElMessage.error(msg);
												}
										})
										.finally(() => { });
						});
					},
				}),
				createFreeButtonBase({
					type: "primary",
					label: "作废支付号",
					func: async () => {
						if (multipleSelection.value.length < 1 ) {
							ElMessage.warning('所选记录为空！');
							return ;
						}
                            let CPaySequencesData = false;
                            let CUniqueNoNotSame = false;
                            multipleSelection.value.forEach((item)=>{
                                if(!item['cPaySequence']){
                                 
                                    CPaySequencesData = true;
                                   
                                }
                                // 批量作废支付号选中的单子的支付号必须相同
                                if(item['cPaySequence'] !== multipleSelection.value[0]?.['cPaySequence']) {
                                    CUniqueNoNotSame = true;
                                }
                            })
                        if(CPaySequencesData){
                               ElMessage.warning('选中单据没有支付号！');
                               return false; 
                        }
                        if(CUniqueNoNotSame) {
                            ElMessage.warning('选中单据的支付号不相同！');
                            return false;
                        }

                        ElMessageBox.confirm("确认要作废支付号吗？", "提示", {
                            confirmButtonText: "确定",
                            cancelButtonText: "取消",
                            type: "warning",
                            lockScroll: false,
                        }).then(() => {
                            let CUniqueNos = ''; // 所选项的流水号组合
                            let CPaySequences = ''; // 所选项的流水号组合
                            multipleSelection.value.forEach(item => {
                                CPaySequences = CPaySequences === '' ? item['cPaySequence'] : CPaySequences + ',' + item['cPaySequence'];
                                CUniqueNos = CUniqueNos === '' ? item['cUniqueNo'] : CUniqueNos + ',' + item['cUniqueNo'];
                            });
                            const param = {
                                "CPaySequence": CPaySequences,
                                "CUniqueNo": CUniqueNos,
                                "isEcargo": freeEditRef.value?.getFromValue().isEcargo || '0',
                            };
                            console.log(param)
                            pcisQueryService.cancelPaymentNo(param)
                                .then((res) => {
                                    const { code, data, msg } = res;
                                    if (200 === code) {
                                        ElMessage.success(msg);
                                        handleQuery();
                                    } else {
                                        ElMessage.error(msg);
                                    }
                                })
                                .finally(() => { });
                        });
					},
				}),
				createFreeButtonBase({
					type: "primary",
					label: "查询支付状态",
					func: async () => {
						if (multipleSelection.value.length < 1 ) {
							ElMessage.warning('所选记录为空！');
							return ;
						}
                        let CUniqueNos = ''; // 所选项的流水号组合
                        let CPaySequences = ''; // 所选项的流水号组合
                        let isOpen =  false;
                        let message = '';
                        multipleSelection.value.forEach(item => {
                            if (item['cPaySequence']==''||item['cPaySequence']==null) {
                                isOpen = true;
                                message='查询支付号状态的操作，支付号不能为空!【申请单号='+item['cAppNo']+'】'
                                return;
                            }
                            CUniqueNos = CUniqueNos === '' ? item['cUniqueNo'] : CUniqueNos + ',' + item['cUniqueNo'];
                            CPaySequences = CPaySequences === '' ? item['cPaySequence'] : CPaySequences + ',' + item['cPaySequence'];
                        });
                        if (isOpen) {
                            ElMessage.warning(message);
                            return;
                        }
                        const param = {
                            "UserId": user.value['opCde'],
                            "CompanyId":  user.value['companyId'],
                            "OpRelCde": user.value['opCde'],
                            "CUniqueNo": CUniqueNos,
                            "CPaySequence":CPaySequences,
                            "isEcargo": freeEditRef.value?.getFromValue().isEcargo || '0',
                        };
                        console.log(param)
                        pcisQueryService.queryPaymentNo(param)
                            .then((res) => {
                                const { code, data, msg } = res;
                                if (200 === code) {
                                    ElMessage.success(msg);
                                } else {
                                    ElMessage.error(msg);
                                }
                            })
                            .finally(() => { });
					},
				}),
				createFreeButtonBase({
					type: "primary",
					label: "缴费类型转换",
					func: async () => {
                                // dzmodal.open(payConfirmInfoChanges, { type: "review" , data:{
                                //     }}).then((res) => {
                                //     if (res.type === "ok") {
                                //         handleQuery();
                                //     }
                                // });
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
					label: "见费出单退回",
					func: async () => {
						if (multipleSelection.value.length < 1 ) {
							ElMessage.warning('所选记录为空！');
							return ;
						}
                        ElMessageBox.confirm("确定做退回操作？", "提示", {
                            confirmButtonText: "确定",
                            cancelButtonText: "取消",
                            type: "warning",
                            lockScroll: false,
                        }).then(() => {
                            let CAppNos = '';
                            let CProdNos = '';
                            let CUniqueNos = ''; // 所选项的流水号组合
                            let CRelAppNos = '';
                            let isOpen =  false;
                            let message = '';
                            multipleSelection.value.forEach(item => {
                                CUniqueNos = CUniqueNos === '' ? item['cUniqueNo'] : CUniqueNos + ',' + item['cUniqueNo'];
                                CProdNos = CProdNos === '' ? item['cProdNo'] : CProdNos + ',' + item['cProdNo'];
                                let cRelAppNo = '';
                                if (!!item['cRelAppNo']) {
                                    cRelAppNo = item['cRelAppNo'];
                                }
                                CRelAppNos = CRelAppNos === '' ? cRelAppNo : CRelAppNos + '#' + cRelAppNo;
                                if (!!item['cPaySequence']) {
                                    isOpen = true;
                                    message = '该单存在支付号，不允许退回！\n【申请单号=' + item['cAppNo'] + '】';
                                    return;
                                }
                                if ('00' === item['cCheckSts'] && '0' === item['cPayStatus']) {
                                    CAppNos = CAppNos === '' ? item['cAppNo'] : CAppNos + '#' + item['cAppNo'];
                                } else if ('6' === item['cCheckSts'] && '0' === item['cPayStatus']) {
                                    CAppNos = CAppNos === '' ? item['cAppNo'] : CAppNos + '#' + item['cAppNo'];
                                } else {
                                    isOpen = true;
                                    const cPayTypArry = [{"label": "刷卡缴费", "value": "1"},{ "label": "在线支付","value": "18"},{"label": "支票缴费","value": "2"}].filter(x => x.value === item['cPayTyp']);
                                    const cPayTypCnm = cPayTypArry[0]['label'];
                                    const cCheckStsArry = cCheckStsList.filter(x => x.value === item['cCheckSts']);
                                    const cCheckStsCnm = cCheckStsArry[0]['label'];
                                    const cPayStatusArry = cPayStatusList.filter(x => x.value === item['cPayStatus']);
                                    const cPayStatusCnm = cPayStatusArry[0]['label'];

                                    message = '该单缴费类型:' + cPayTypCnm + ',处理状态:' + cCheckStsCnm + ',缴费状态:' + cPayStatusCnm + '，不允许退回！\n【申请单号=' + item['cAppNo'] + ',期次=' + item['nTms'] + '】';
                                    return;
                                }
                                // if (!!CRelAppNos) {
                                //     if (item['cProdNo'] === '060038') {
                                //         isOpen = true;
                                //         message = '所选记录包含联合单中的关联人身险单，不允许退回！\n联合单退回请操作087001财产险单【关联单号：' + item['cRelAppNo'] + '】';
                                //         return;
                                //     }
                                // }
                                // if (item['cRiFacMrk'] === '1' && item['cAppTyp'] === 'A') {
                                //     isOpen = true;
                                //     message = '申请单已进入再保流程，不允许进行‘见费出单退回’操作，如需退回，请线下联系再保部告知投保单号!！\n【申请单号=' + item['cAppNo'] + '】';
                                //     return;
                                // }
                            });

                    

                            if (isOpen) {
                                ElMessage.warning(message);
                                return;
                            }
                            const param = {
                                "CAppNos": CAppNos,
                                "CUniqueNos": CUniqueNos,
                                "isEcargo": freeEditRef.value?.getFromValue().isEcargo || '0',
                            };
                            console.log(param)
                            pcisQueryService.needFeeToBack(param)
                                .then((res) => {
                                    const { code, data, msg } = res;
                                    if (200 === code) {
                                        ElMessage.success(msg);
                                        handleQuery();
                                    } else {
                                        if(msg && msg.indexOf('申请单已进入再保流程，不允许进行‘见费出单退回’操作') > 0) {
                                            ElMessage.info(msg);
                                        } else {
                                            ElMessage.error(msg);
                                        }
                                    }
                                })
                                .finally(() => { });
                        }).catch(() => {});
					},
				}),
				createFreeButtonBase({
					type: "primary",
					label: "支票登记",
					func: async () => {
                        if (multipleSelection.value.length < 1 ) {
                            ElMessage.warning('所选记录为空！');
                            return ;
                        }
                        let CAppNos = '';
                        let CUniqueNos = ''; // 所选项的流水号组合

                        let isOpen =  false;
                        let message = '';
                        multipleSelection.value.forEach(item => {
                            if ('2' !== item['cPayTyp']) {
								isOpen = true;
                                message='该单缴费类型错误，只能对支票缴费的单进行支票登记！ 【申请单号='+item['cAppNo']+'】'
								return;
						  	}
						  	if ('1' == item['cCheckSts']) {
								isOpen = true;
                                message='该单处理状态为待审核状态！ 【申请单号='+item['cAppNo']+'】'
								return;
						  	}

                            CAppNos = CAppNos === '' ? item['cAppNo'] : CAppNos + ',' + item['cAppNo'];
                            CUniqueNos = CUniqueNos === '' ? item['cUniqueNo'] : CUniqueNos + ',' + item['cUniqueNo'];
                        });

                        // if (CCombinationFlag.size > 1) {
                        //  ElMessage.warning('组合产品不能和其他产品单据同时缴费');
                        //                 return;
                        // }



                        if (isOpen) {
                            ElMessage.warning(message);
                            return;
                        }

                        // CAppNos
                          if (CAppNos.indexOf(',') === -1) {
                            	dzmodal.open(payConfirmInfoRegister, { type: "edit",data:{   CAppNo: CAppNos,CUniqueNos: CUniqueNos} }).then((res) => {
                                    if (res.type === "ok") {
                                        console.log("审核")
                                    }
                                });

                          }else{
                                dzmodal.open(payConfirmInfoRegister, { type: "edit",
                                data:{   CAppNo: CAppNos,
                                    CUniqueNos: CUniqueNos,
                                    CAppNum:  multipleSelection.value.length
                                } }).then((res) => {
                                    if (res.type === "ok") {
                                        console.log("审核")
                                    }
                                });
                          }
                        // console.log('ssssss',CAppNos)
                        // console.log('ssssss',CUniqueNos)



					},
                    hidden: env.MODE === "prod" ? true : false
				}),
				createFreeButtonBase({
					type: "primary",
					label: "在线缴费",
					func: async () => {
                        console.log(652,multipleSelection.value)
                        if (multipleSelection.value.length < 1 ) {
                            ElMessage.warning('所选记录为空！');
                            return ;
                        }
                        let cPaySequences = ''; // 所选项的支付号
                        let isOpen =  false;
                        let message = ''; 
                        let CAppNos = '';
                        let CUniqueNos = '';  
                        const CCombinationFlag = new Set();
                        let combinationNo = '';
                        multipleSelection.value.forEach((item,i) => {
                            if ('18' !== item['cPayTyp']) {
                                isOpen = true;
                                message='该单缴费类型错误，只能对在线支付的单进行在线缴费！ 【申请单号='+item['cAppNo']+'】'
                                return;
                            }
                            if(!item['cPaySequence']) {
                                isOpen = true;
                                message='请先获取支付号！ 【申请单号='+item['cAppNo']+'】'
                                return;
                            }
                             multipleSelection.value.forEach((itemT,j) => {
                                // 校验多个单据币种是否相同
                                if (item['cCurNo'] !== itemT['cCurNo']  ) {
                                    isOpen = true;
                                    message='币种为同类型，才可以进行在线支付！【申请单号='+item['cAppNo']+'】'
                                    return ;
                                }
                                
                                 // 校验多个 支付号是否相同
                                if (item['cPaySequence'] !== itemT['cPaySequence']  ) {
                                    isOpen = true;
                                    message='相同[支付号]才可进行在线支付！申请单号：【申请单号='+item['cAppNo']+'】'
                                    return ;
                                }
                                // 校验是否相同单位  
                                if (item['cDptCde'] !== itemT['cDptCde']  ) {
                                    isOpen = true;
                                    message='不同分公司下单据不支持在线支付！【申请单号='+item['cAppNo']+'】'
                                    return ;
                                }

                             })
                            CAppNos = CAppNos === '' ? item['cAppNo'] : CAppNos + ',' + item['cAppNo'];
                            CUniqueNos = CUniqueNos === '' ? item['cUniqueNo'] : CUniqueNos + ',' + item['cUniqueNo'];
                            combinationNo = !!item['cCombinationNo'] ? item['cCombinationNo'] : 'noCombination';
                            CCombinationFlag.add(combinationNo);
                        }); 
 
                       if (CCombinationFlag.size > 1) {
                           ElMessage.warning('组合产品不能和其他产品单据同时缴费');
                            return;
                        }

                        if (isOpen) {
                            ElMessage.warning(message);
                            return;
                        }

                         cPaySequences = multipleSelection.value[0]['cPaySequence'];
                         const url = env.MODE === "prod" ? 'https://pay.yaic.com.cn/02/' : 'http://t.yaic.com.cn:12003/02/';
                        window.open(url + cPaySequences)
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
		tableBtnWidth: 95,
		tableBtnPosition: "right",
		tableBtnFixed: "right",
        fixed:true,
		tableBtn: [
			createFreeButtonBase({
				id: "score",
				link: true,
				tooltip: "查看缴费信息",
				type: "success",
				size: "large",
				icon: "View",
				tableClick: (row) => {
					dzmodal.open(payConfirmInfoDetailRead, { type: "view", data: row }).then((res) => {
						if (res.type === "ok") {
							console.log("详情")
						}
					});
				},
			}),
			createFreeButtonBase({
				id: "score",
				link: true,
				tooltip: "查看投保单信息",
				type: "success",
				size: "large",
				icon: "Document",
				tableClick: (row) => {
                    if(row.cPlyNo && (row.cPlyNo.slice(0,2) === "YY" || row.cPlyNo.slice(0,2) === "AY")) {
                        const en = { ...row, sence:'policy', cEcAgrAppNo: row.cEcAgrAppNo || row.cAppNo }
                        router.push({path: "/protocolManagement/enteringDtl", query: {param: JSON.stringify(en), type: 'view'}});
                    } else {
                        const en = JSON.stringify({
                            cAppNo: row['cAppNo'],
                            cAppTyp: row['cAppTyp'],
                            cCiMrk: row['cCiMrk'],
                            cEdrRsnBundleCde: row['cEdrRsnBundleCde'],
                            cProdNo: row['cProdNo'],
                            cGrpMrk: row['cGrpMrk'],
                            cDptCde: row['cDptCde'],
                            pageType: "readonly",
                            cTermNo:row['cTermNo'],
                            cTermNme:row['cTermNme'],
                            cPolicySource:row['cPolicySource'],
                        });
                        router.push({
                            path: "/pcisapp/myPage",
                            query: {
                                param: en,
                            },
                        });
                    }
				},
			}),
		],
		fromSchema: [
			{
				prop: "cAppNo",
				inputtype: "rtinput",
				title: "申请单号/保单号",
                lengthNum: 21,
                lengthIsNumber: true,
                slotName: "cAppNo",
                fixed: "left",
			},
			{
				prop: "nTms",
				inputtype: "rtinput",
				title: "期次",
                lengthNum: 2,
			},
			{
				prop: "cAppNmeInvest",
				inputtype: "rtinput",
				title: "投保人名称",
                slotName: "cAppNmeInvest",
                align: "left",
                lengthNum: 12,
			},
			{
				prop: "cPayTyp",
				inputtype: "rtselect",
				title: "缴费类型",
                lengthNum: 9,
                typeCode: "CHARGE_TYPE_CACHE",
                param: {'cCde': [ '2', '3', '5',  '99']},
				formatter: (val)=>{
				  const result = cPayTypList.value.find(item => item.value === val);
				  return result ? result.label : val;
				}
			},
			{
				prop: "cPaySequence",
				inputtype: "rtinput",
				title: "支付号",
                lengthNum: 8,
                lengthIsNumber: true,
			},
			{
				prop: "cPayEndTm",
				inputtype: "rtinput",
				title: "支付号有效止期",
                lengthNum: 17,
                lengthIsNumber: true,
			},
			{
				prop: "cCanPay",
				inputtype: "rtinput",
				title: "支付号状态",
                lengthNum: 5,
			},
			{
				prop: "nPrm",
				inputtype: "rtinput",
				title: "保费金额",
                lengthNum: 12,
                lengthIsNumber: true,
                align: "left"
			},
			{
				prop: "nPayAmt",
				inputtype: "rtinput",
				title: "应缴金额",
                lengthNum: 12,
                lengthIsNumber: true,
                align: "left"
			},
			{
				prop: "cCheckSts",
				inputtype: "rtselect",
				title: "处理状态",
                lengthNum: 9,
                align: "left",
				loadData:cCheckStsList,
				formatter: (val)=>{
				  const result = cCheckStsList.find(item => item.value === val);
				  return result ? result.label : val;
				}
			},
			{
				prop: "tBgnTm",
				inputtype: "rtinput",
				title: "起保日期",
                lengthNum: 17,
                lengthIsNumber: true,
			},
			{
				prop: "cUniqueNo",
				inputtype: "rtinput",
				title: "收据流水号",
                lengthNum: 11,
                lengthIsNumber: true,
			},
			{
				prop: "cBatchNo",
				inputtype: "rtinput",
				title: "批号",
                lengthNum: 11,
                lengthIsNumber: true,
			},
			{
				prop: "cPayStatus",
				inputtype: "rtselect",
				title: "缴费状态",
                lengthNum: 4,
                align: "left",
                typeCode: "WEB_BAS_CODELIST",
                codeParam: {'cParCde': 'DY1'},
				formatter: (val)=>{
				  const result = cPayStatusList.find(item => item.value === val);
				  return result ? result.label : val;
				}
			},
			{
				prop: "tUdrTm",
				inputtype: "rtinput",
				title: "核保日期",
                lengthNum: 17,
                lengthIsNumber: true,
			},
			{
				prop: "cChargeCde",
				inputtype: "rtinput",
				title: "操作员",
                lengthNum: 4,
                align: "left",
			}
		],
	})
);


const checkBatch = (cBatchNo : any)=> {
        if (cBatchNo === '' || cBatchNo === null) {
            return true;
        }
        const re = new RegExp('^[a-z]|[A-Z]$');
        const cBatchNoF = cBatchNo.substring(0, 1);
        if (re.test(cBatchNoF)) {
            return true;
        } else {
            return false;
        }
    }

    
const params = route.query.param
  ? JSON.parse(descryptParameter(route.query.param))
  : {};

onMounted(async () => {
  nextTick(()=>{
    freeEditRef.value?.setValue('CPayStatus', '0')
    freeEditRef.value?.setValue('CDateTyp', '1')
    freeEditRef.value?.setValue('LoadSub', 1)
    freeEditRef.value?.setValue('TUnTmStart', startTm)
    freeEditRef.value?.setValue('TUnTmEnd', endTm)
    freeEditRef.value?.setValue("AccDpt", user.value['companyId']);
    setFormItem("AccDpt", {
      loadData: [
          {
              label: user.value['companyId'] + ' ' + user.value['companyCnm'],
              value: user.value['companyId'],
          },
      ], 
    });
    freeEditRef.value?.setValue('CBillTyp', '1');
    if(params.cAppNo) {
        freeEditRef.value?.setValue('CBillNoStart', params.cAppNo)
        freeEditRef.value?.setValue('CBillNoEnd', params.cAppNo)
        handleQuery()
    }
    freeEditRef.value?.setValue('isEcargo', '0')
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
        cTermNo : cTermNo,   // 条款编码
        //codeListMap: this.codeListMap
      });


      console.log(param)
      pcisQueryService.getPayConfirmInfoList(param)
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
            pageresult.list = [];
            // pageresult.list = data.result;
            // pageresult.total = data.total;
            if (data && data.result) {
              const processedList = data.result.map((item: any) => {
                // 创建合并字段，用于在申请单号/保单号列中显示
                return {
                  ...item,
                  // 添加合并字段，用于显示申请单号和保单号
                  combinedAppPlyNo: {
                    cAppNo: item.cAppNo || '',
                    cPlyNo: item.cPlyNo || ''
                  }
                };
              });
              pageresult.list = processedList;
            }
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
  let CAppNos = ''; // 所选项的流水号组合
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
    CAppNos = CAppNos === '' ? item['cAppNo'] : CAppNos + ',' + item['cAppNo'];
    CRelAppNos = CRelAppNos === '' ? cRelAppNo : CRelAppNos + ',' + cRelAppNo;
  });
  if (cBatchNos) {
      ElMessage.warning('该单存在批号，不能进行缴费类型转换，请先清空批号！');
      return;
  }
  const param = { 
    CUniqueNo: CUniqueNos
  };


  console.log('zzz',multipleSelection.value )

  if(multipleSelection.value.length>1){
        dzmodal.open(payConfirmInfoChanges, { type: "check" , data:{
                CUniqueNos: CUniqueNos,
                CAppNos: CAppNos,
                CRelAppNos: CRelAppNos
            }}).then((res) => {
            if (res.type === "ok") {
                handleQuery();
            }
        });
   
  }else{


    dzmodal.open(payConfirmInfoChange, { type: "check" , data:{
                CUniqueNos: CUniqueNos,
                CAppNos: CAppNos,
                CRelAppNos: CRelAppNos
            }}).then((res) => {
            if (res.type === "ok") {
                handleQuery();
            }
        });
    }
  // pcisQueryService.befChangeSts(param)
  //   .then((res) => {
  //     // const { code, data, msg } = res;
  //     // if (200 === code) {
  //     //   if(msg === 'OK') {
  //     //     dzmodal.open(payConfirmInfoChange, { type: "review" , data:{
  //     //       CUniqueNos: CUniqueNos,
  //     //       CRelAppNos: CRelAppNos
  //     //     }}).then((res) => {
  //     //       if (res.type === "ok") {
  //     //         console.log("审核")
  //     //       }
  //     //     });
  //     //   }
  //     // } else {
  //     //   ElMessage.error(msg);
  //     // }
  //   })
  //   .finally(() => {
  //     dzmodal.open(payConfirmInfoChange, { type: "review" , data:{
  //       CUniqueNos: CUniqueNos,
  //       CRelAppNos: CRelAppNos
  //     }}).then((res) => {
  //       if (res.type === "ok") {
  //         console.log("审核")
  //       }
  //     });
  //   });
}
//给表单下拉项赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          for (let key in obj.btnItems) {
            item.btnItems[key] = obj.btnItems[key];
          }
        }else{
          Object.assign(item, obj);
        }
      }
    });
  }
}

// 添加 copyText 方法
const copyText = (text: any) => {
  if (!text) {
    ElMessage.warning('没有可复制的内容');
    return;
  }

  // 检查 navigator.clipboard 是否存在
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(
        () => {
          ElMessage.success('复制成功');
        },
        () => {
          ElMessage.error('复制失败');
        }
    );
  } else {
    // 使用 document.execCommand('copy') 方法作为备选方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      const result = document.execCommand('copy');
      if (result) {
        ElMessage.success('复制成功');
      } else {
        ElMessage.error('复制失败');
      }
    } catch (err) {
      ElMessage.error('复制失败，请稍后再试');
    } finally {
      document.body.removeChild(textarea); // 清理创建的 textarea 元素
    }
  }
};
</script>

<style scoped>
.copy-icon {
  margin-left: 5px;
  cursor: pointer;
  color: #409eff;
}

.policy-info-cell {
  display: flex;
  flex-direction: column;
}

.policy-number-row {
  display: flex;
  align-items: center;
  height: 16px;
}

.policy-number-row span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

:deep(.el-table__body .el-table__row .el-table__cell:first-child .cell) {
    white-space: break-spaces;
}
.twoLine {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-break: break-all;
  overflow: hidden;
}
</style>

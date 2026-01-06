<template>
<!-- <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
	@page-change="handleQuery(false)" /> -->
	<app-grid-edit v-model:gridEditConfig="tableconfig" ref="tableRef" />

<my-card v-model:cardConfig="cardConfig">
	<app-free-edit style="margin-top: 20px" v-model:freeEditConfig="formconfig1" ref="freeEditRef1" />
	<app-free-edit style="margin-top: 20px" v-model:freeEditConfig="formconfig2" ref="freeEditRef2" />
	<app-free-edit style="margin-top: 20px" v-model:freeEditConfig="formconfig3" ref="freeEditRef3" />
	<app-free-edit style="margin-top: 20px" v-model:freeEditConfig="formconfig4" ref="freeEditRef4" />
</my-card>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { yesOrNo, size, inputtype, typeMap, dateType, position } from "@/utils/utilKey";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { createFreeButtonBase } from "@/shared/button-config";
import {
	getButtonByFacKey,
	getFactorList,
	getInputGroupList,
	saveFactor,
	saveKindInfo,
} from "@/api/prod";
import {
	AppFreeEditConfig,
	AppFreeEditMethod,
	createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import {
	creatCardConfig,
} from "@/shared/mytemplate/card-config";
import {
	AppTableConfig,
	createTableEditConfig,
	MyTableMethod,
} from "@/shared/app-table-config";

import {
  AppGridEditConfig,
  AppGridEditMethod,
  createAppGridEditConfig,
  createGridFromUiConfig,
} from "@/shared/app-grid-edit-config";

import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { qryCustomer } from "@/api/query";
import { validateIdCard } from "@/typings/method-public";
// import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

// const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());


const props = defineProps({
	data: Object,
	type: String,
	idxParam:Object,
});


const opertaor = dataOpertaor(props.idxParam?.opertaorProps);
opertaor.init();
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
import { v4 as uuidv4 } from "uuid";
import { conforms, forEach } from "lodash";
const showBtnConfig = ref(false);
const showView = ref(false);

const freeEditRef1 = ref<AppFreeEditMethod | null>(null);
const freeEditRef2 = ref<AppFreeEditMethod | null>(null);
const freeEditRef3 = ref<AppFreeEditMethod | null>(null);
const freeEditRef4 = ref<AppFreeEditMethod | null>(null);
const freeEditRefBtn = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppGridEditMethod | null>(null);
const appTableShow = ref(false);
const policyService = new PolicyService();


const schemaMap = reactive<Record<string, any>>({
	rtinputgroup: [],
});
const cardConfig = reactive<CardConfig>(
	creatCardConfig({
		title: '投保人-法人扩展信息',
		showMyfromBtm: true
	})
)


const tableconfig = reactive<AppGridEditConfig>(
	createAppGridEditConfig({
		title: '投保人-客户受益所有人',
		// editList:['CSeqNo','CCusLnme','CCusFnme','TCerftBgnTm','CCusAddr'],
    // showSelection: true,  // 是否显示多选框
   		editFlag: true, //是否可以编辑
		// editList:['cOpgrpCnm','cName'],
		titleBtns: [
			createFreeButtonBase({
				type: "primary",
				label: "新增",
				func: async () => {
					let value = tableRef.value?.getFromValue() || []; // 确保 value 是数组
					let maxSeqNo = 0; // 初始设为 0，这样即使空数组，+1 后也是 1
					if (value.length > 0) {
						maxSeqNo = value.reduce((max, item) => {
							const val = item['nSeqNo'];
							return (typeof val === 'number' && !isNaN(val) && val > max) ? val : max;
						}, 0); // 初始值设为 0 更安全
					}
					const nextSeqNo = maxSeqNo + 1;
					tableRef.value?.addRowByData({ cGrpMrk: "0", nSeqNo: nextSeqNo });
				},
			}),
			createFreeButtonBase({
				type: "primary",
				label: "删除",
				func: async () => {
					const selData = tableRef?.value?.getSelectRow();
					if (!selData) {
						ElMessage.error("请选择要删除的数据!");
						return;
					}
					const editIndex = selData["_dataId"];
					tableRef?.value?.delRow(editIndex);

					
				},
			})
		],
		fromSchema: [
			// {
			// 	prop: "CSeqNo",
			// 	inputtype: "rtinput",
			// 	title: "序号",
			// 	disabled: true,
			// },
			{
				prop: "cCusLnme",
				inputtype: "rtinput",
				title: "姓",
				rules: [getRules("required", {})],
				func: (val: any) => {
					const data = tableRef?.value?.getSelectRow()
					checkUser(data);   // 调用客户信息接口
				}
			},
			{
				prop: "cCusFnme",
				inputtype: "rtinput",
				title: "名",
				rules: [getRules("required", {})],
				func: (val: any) => {
					const data = tableRef?.value?.getSelectRow()
					checkUser(data);   // 调用客户信息接口
				}
			},
			{
				prop: "cCerftCls",
				inputtype: "rtselect",
				typeCode: "NATURAL_CERTIFICATE_ALL",
				title: "证件类型",
				rules: [getRules("required", {})], 
				func: (val: any) => {
					if(val){
						setFieldRules('cCerftCde',val, tableRef)

						// setFieldRules('CCertfCde_A',val,freeEditRef1,formconfig1)
					}
					const data = tableRef?.value?.getSelectRow()
					checkUser(data);   // 调用客户信息接口
					//  if (val == "111") {
					// 	     setFormItem("cCerftCde", {
					// 			rules: [getRules("required", {}), getRules("idCard", {
					// 			})],
					// 		});

					//  }else  if (val == "01") {
					// 	// 统一社会信用代码
					// 	setFormItem("cCerftCde", {
					// 		rules: [getRules("required", {}),getRules("socialCode", {})],
					// 	});
					//  }else if(val =='07'){
					// 	// 护照 
					// 	setFormItem("cCerftCde", {
					// 		rules: [getRules("required", {}),getRules("passPort", {})],
					// 	});
					//  }
				}
			},
			{
				prop: "cCerftCde",
				inputtype: "rtinput",
				title: "证件号码",
				rules: [getRules("required", {})],
				func: (val: any) => {
					const data = tableRef?.value?.getSelectRow()
					checkUser(data);   // 调用客户信息接口
				}
			},
			{
				prop: "cCerftSex",
				inputtype: "rtSelectV2",
				title: "性别",
				rules: [getRules("required", {})],
				typeCode: "Sex_List",
			},
			{
				prop: "cCerftBirthday",
				inputtype: "rtdatepicker",
        type: "date",
				title: "出生日期",
				rules: [getRules("required", {})],
			},
			{
				prop: "cCerftNation",
				inputtype: "rtSelectV2",
				typeCode: "AREA_COUNTRY_CACHE",
				title: "国籍",
				rules: [getRules("required", {})],
			},
			{
				prop: "tCerftBgnTm",
				inputtype: "rtdatepicker",
				title: "证件有效起期",
				rules: [getRules("required", {})]
			},
			{
				prop: "tCerftEndTm",
				inputtype: "rtdatepicker",
				title: "证件有效止期",
				rules: [getRules("required", {})],
				
			},
			{
				prop: "cCusAddr",
				inputtype: "rtinput",
				title: "地址",
				rules: [getRules("required", {})]
			}
		],
	})
);

const formconfigData = {
	fromUi: {
		cols: 2
	},
	shadow: false,
	fromSchema: [
		{
			prop: 'CCusNme_A',
			title: '姓名',
			inputtype: "rtinput",
			clearable: true,
			rules: [getRules("required", {})],
		},
		{
			prop: 'CCertfCls_A',
			title: '证件类型',
			inputtype: "rtselect",
			typeCode: "NATURAL_CERTIFICATE_ALL",
			clearable: true,
			rules: [getRules("required", {})],
			func:(val:any)=>{
				if(val){
						setFieldRules('CCertfCde_A',val,freeEditRef1,formconfig1)
				}
			}
			
		},
		{
			prop: 'CCertfCde_A',
			title: '证件号码',
			rules: [getRules("required", {})],
			inputtype: "rtinput",
      		clearable: true,
		},
		{
			prop: 'TCertfBgnTm_A',
			title: '认证有效起期',
			inputtype: "rtdatepicker",
			clearable: true,
			rules: [getRules("required", {})],
			disabledDate: (time: Date) => {
					const disTime =freeEditRef1.value?.getValue('TCertfEndTm_A')
					if(disTime){
							return time.getTime() > new Date(disTime).getTime()
					}
			},
		},
		{
			prop: 'TCertfEndTm_A',
			title: '认证有效止期',
			inputtype: "rtdatepicker",
			clearable: true,
			rules: [getRules("required", {})],
			disabledDate: (time: Date) => {
					const disTime =freeEditRef1.value?.getValue('TCertfBgnTm_A')
					if(disTime){
						return time.getTime() < new Date(disTime).getTime()
					}
			},
		}
	]
}
const formconfigData2 = {
	fromUi: {
		cols: 2
	},
	shadow: false,
	fromSchema: [
		{
			prop: 'CCusNme_B',
			title: '姓名',
			inputtype: "rtinput",

			clearable: true,
			rules: [getRules("required", {})],
		},
		{
			prop: 'CCertfCls_B',
			title: '证件类型',
			inputtype: "rtselect",
			typeCode: "NATURAL_CERTIFICATE_ALL",
			clearable: true,
			rules: [getRules("required", {})],
			func:(val:any)=>{
				if(val){
						setFieldRules('CCertfCde_B',val,freeEditRef2,formconfig2)
				}
			}
		},
		{
			prop: 'CCertfCde_B',
			title: '证件号码',
			rules: [getRules("required", {})],
			inputtype: "rtinput",
      		clearable: true,
		},
		{
			prop: 'TCertfBgnTm_B',
			title: '认证有效起期',
			inputtype: "rtdatepicker",
			clearable: true,
			rules: [getRules("required", {})],
			disabledDate: (time: Date) => {
					const disTime =freeEditRef2.value?.getValue('TCertfEndTm_B')
					if(disTime){
							return time.getTime() > new Date(disTime).getTime()
					}
			},
			
		},
		{
			prop: 'TCertfEndTm_B',
			title: '认证有效止期',
			inputtype: "rtdatepicker",
			clearable: true,
			rules: [getRules("required", {})],
			disabledDate: (time: Date) => {
			 	const disTime =freeEditRef2.value?.getValue('TCertfBgnTm_B')
			 	if(disTime){
			 			return time.getTime() < new Date(disTime).getTime()
			 	}
			},
		}
	]
}
const formconfigData3 = {
	fromUi: {
		cols: 2
	},
	shadow: false,
	titleBtns: [
    createFreeButtonBase({
      type: "primary",
			label: "同法定代表人",
      func: () => {
        hasSameLegalRep('F');
      },
    })
  ],
	fromSchema: [
		{
			prop: 'CCusNme_C',
			title: '姓名',
			inputtype: "rtinput",
      clearable: true,
      rules: [getRules("required", {})],
		},
		{
			prop: 'CCertfCls_C',
			title: '证件类型',
			inputtype: "rtselect",
			typeCode: "NATURAL_CERTIFICATE_ALL",
      rules: [getRules("required", {})],
			clearable: true,
				func:(val:any)=>{
				if(val){
						setFieldRules('CCertfCde_C',val,freeEditRef3,formconfig3)
				}
			}
		},
		{
			prop: 'CCertfCde_C',
			title: '证件号码',
			rules: [getRules("required", {})],
      		clearable: true,
			inputtype: "rtinput"
		},
		{
			prop: 'TCertfBgnTm_C',
			title: '认证有效起期',
			inputtype: "rtdatepicker",
      clearable: true,
      rules: [getRules("required", {})],
	  		disabledDate: (time: Date) => {
					const disTime =freeEditRef3.value?.getValue('TCertfEndTm_C')
					if(disTime){
							return time.getTime() > new Date(disTime).getTime()
					}
			},
		},
		{
			prop: 'TCertfEndTm_C',
			title: '认证有效止期',
			inputtype: "rtdatepicker",
			clearable: true,
			rules: [getRules("required", {})],
				disabledDate: (time: Date) => {
					const disTime =freeEditRef3.value?.getValue('TCertfBgnTm_C')
					if(disTime){
						return time.getTime() < new Date(disTime).getTime()
					}
			},
		}
	]
}

const formconfigData4 = {
	fromUi: {
		cols: 2
	},
	shadow: false,
	titleBtns: [
    createFreeButtonBase({
      type: "primary",
			label: "同法定代表人",
      func: () => {
        hasSameLegalRep('SQ');
      },
    })
  ],
	fromSchema: [
		{
			prop: 'CCusNme_D',
			title: '姓名',
			inputtype: "rtinput",
      		rules: [getRules("required", {})],
			clearable: true,
		},
		{
			prop: 'CCertfCls_D',
			title: '证件类型',
			inputtype: "rtselect",
			typeCode: "NATURAL_CERTIFICATE_ALL",
      		rules: [getRules("required", {})],
			clearable: true,
			func:(val:any)=>{
				if(val){
						setFieldRules('CCertfCde_D',val,freeEditRef4,formconfig4)
				}

			}
		},
		{
			prop: 'CCertfCde_D',
			title: '证件号码',
			rules: [getRules("required", {})],	
			inputtype: "rtinput",
      		clearable: true,
		},
		{
			prop: 'TCertfBgnTm_D',
			title: '认证有效起期',
			inputtype: "rtdatepicker",
			rules: [getRules("required", {})],
			clearable: true,
			disabledDate: (time: Date) => {
					const disTime =freeEditRef4.value?.getValue('TCertfEndTm_D')
					if(disTime){
							return time.getTime() > new Date(disTime).getTime()
					}
			},
		},
		{
			prop: 'TCertfEndTm_D',
			title: '认证有效止期',
			inputtype: "rtdatepicker",
			rules: [getRules("required", {})],
			clearable: true,
			disabledDate: (time: Date) => {
						const disTime =freeEditRef4.value?.getValue('TCertfBgnTm_D')
						if(disTime){
							return time.getTime() < new Date(disTime).getTime()
						}
				},
			}
	]
}
const formconfig1 = reactive<AppFreeEditConfig>(
	createAppFreeEditConfig(Object.assign(formconfigData, {
		title: '控股股东或实际控制人：',
	}))
	
);
const formconfig2 = reactive<AppFreeEditConfig>(
	createAppFreeEditConfig(Object.assign(formconfigData2, {
		title: '法定代表人：',
	}))
);
const formconfig3 = reactive<AppFreeEditConfig>(
	createAppFreeEditConfig(Object.assign(formconfigData3, {
		title: '负责人：',
	}))
);
const formconfig4 = reactive<AppFreeEditConfig>(
	createAppFreeEditConfig(Object.assign(formconfigData4, {
		title: '授权代理人：',
	}))
);


const pageresult = reactive<Pageresult>({
	result: "",
	/** 数据列表 */
	list: [],
	/** 总数 */
	total: 0,
});



const ruleTypeMap: Record<string, string> = {
	"110001": "orgCode",      // 组织机构编码
	"01": "socialCode",   // 统一社会信用代码
    "111": "idCard",       // 身份证
  	"07": "passPort",     // 护照
    "553": "ariCard",          // 外国人证件号
};

// 类型守卫函数
const isValidRuleType = (value: string): value is keyof typeof ruleTypeMap => {
  return ruleTypeMap.hasOwnProperty(value);
};

// 身份校验封装
const setFieldRules  = (
	field: string,
  	value: string,
  	formRef: any,
	fconfig:any
  	// formRef: { value?: { clearValidate: (field: string) => void } } | null
) => {
  // 清除该字段的现有校验
  if(fconfig){
	  formRef?.value?.clearValidate(field);
  }
 // 获取对应的规则类型，默认无规则
 const ruleType = isValidRuleType(value) ? ruleTypeMap[value] : undefined;
  // 设置字段的校验规则
  setFormItem(field, {
    rules: ruleType ? [getRules(ruleType, {}),getRules("required", {})] : [getRules("required", {})]
  }, fconfig);
};



onMounted(async () => {

	getTableFun();
	let CAppNo = opertaor.getDataAll()['applicant']['Applicant.cAppNo'];   // 申请单号
	let params = {
			CAppNo: CAppNo,
			CCusFlag: 'Applicant',
	}
	if (!!props.data.cRsnCde && props.data.cRsnCde == 'BH') {
		let cPlyNo = opertaor.getDataAll()['applicant']['Applicant.cPlyNo'];   // 保单号
		params.CPlyNo = cPlyNo
	}
	policyService.getAMLExtendInfoByAppNo(params).then((response) => {
		let {code, data} = response
    if (code === 200) {
      if (response.data) {
		// 法人代表  1       B
		// 法定负责人 2   C
		// 授权代理人 3  D
		// 控股股东或实际控制人  4  A      4123
	
		freeEditRef1.value?.setValue('CCusNme_A', data[3].cCusNme);
		freeEditRef1.value?.setValue('CCertfCls_A', data[3].cCertfCls);
		freeEditRef1.value?.setValue('CCertfCde_A', data[3].cCertfCde);
		freeEditRef1.value?.setValue('TCertfBgnTm_A', data[3].tCertfBgnTm);
		freeEditRef1.value?.setValue('TCertfEndTm_A', data[3].tCertfEndTm);

		freeEditRef2.value?.setValue('CCusNme_B', data[0].cCusNme);
		freeEditRef2.value?.setValue('CCertfCls_B', data[0].cCertfCls);
		freeEditRef2.value?.setValue('CCertfCde_B', data[0].cCertfCde);
		freeEditRef2.value?.setValue('TCertfBgnTm_B', data[0].tCertfBgnTm);
		freeEditRef2.value?.setValue('TCertfEndTm_B', data[0].tCertfEndTm);

		freeEditRef3.value?.setValue('CCusNme_C', data[1].cCusNme);
		freeEditRef3.value?.setValue('CCertfCls_C', data[1].cCertfCls);
		freeEditRef3.value?.setValue('CCertfCde_C', data[1].cCertfCde);
		freeEditRef3.value?.setValue('TCertfBgnTm_C', data[1].tCertfBgnTm);
		freeEditRef3.value?.setValue('TCertfEndTm_C', data[1].tCertfEndTm);

		freeEditRef4.value?.setValue('CCusNme_D', data[2].cCusNme);
		freeEditRef4.value?.setValue('CCertfCls_D', data[2].cCertfCls);
		freeEditRef4.value?.setValue('CCertfCde_D', data[2].cCertfCde);
		freeEditRef4.value?.setValue('TCertfBgnTm_D', data[2].tCertfBgnTm);
		freeEditRef4.value?.setValue('TCertfEndTm_D', data[2].tCertfEndTm);
	  }
    } else {
      ElMessage.error('根据申请单号获取发票信息出现异常！');
    }
  }).catch(() => {
    ElMessage.error('根据申请单号获取发票信息出现异常！');
  });


});


// 收益所有人table信息
const getTableFun = async ()=>{
	console.log('121', opertaor.getDataAll())
	let CAppNo = opertaor.getDataAll()['applicant']['Applicant.cAppNo'];   // 申请单号
	let params = {
			CAppNo: CAppNo,
			CCusFlag: 'Applicant',
	}
	if (!!props.data.cRsnCde && props.data.cRsnCde == 'BH') {
		let cPlyNo = opertaor.getDataAll()['applicant']['Applicant.cPlyNo'];   // 保单号
		params.CPlyNo = cPlyNo
	}
	policyService.getAMLCusBnfcInfoByAppNo(params).then((response) => {
		let {code , data} = response
    if (code === 200) {
      if (data) {
				tableRef.value?.setFormValue(data)
      }
    } else {
      ElMessage.error('根据申请单号获取发票信息出现异常！');
    }
  }).catch(() => {
    ElMessage.error('根据申请单号获取发票信息出现异常！');
  });
}

// 绑定方法
const method = {
	func1: () => {
		console.log(getRules);
	},
	

};


const validateForms = async () => {
	let validationPromises  = [
		freeEditRef1.value?.validate(),
		freeEditRef2.value?.validate(),
		freeEditRef3.value?.validate(),
		freeEditRef4.value?.validate(),
	]
  return Promise.all(validationPromises);
};

const getMergedData = () => {
	let fromData1 = freeEditRef1.value?.getFromValue(); //获取表单数据
	let fromData2 = freeEditRef2.value?.getFromValue(); //获取表单数据
	let fromData3 = freeEditRef3.value?.getFromValue(); //获取表单数据
	let fromData4 = freeEditRef4.value?.getFromValue(); //获取表单数据
	 
	// console.log( {...fromData1,...fromData2,...fromData3,...fromData4,})

	let appInfo = {
		appFreeEdit:{...fromData1,...fromData2,...fromData3,...fromData4,},
		appGridEdit:{
			items: tableRef.value?.getFromValue()
		}
	}
 

	return appInfo;
};

// 按照现有格式，获取数据
const getdData = () => {
	let fromData1 = freeEditRef1.value?.getFromValue(); //获取表单数据
	let fromData2 = freeEditRef2.value?.getFromValue(); //获取表单数据
	let fromData3 = freeEditRef3.value?.getFromValue(); //获取表单数据
	let fromData4 = freeEditRef4.value?.getFromValue(); //获取表单数据
	 
	// console.log( {...fromData1,...fromData2,...fromData3,...fromData4,})

	let appInfo = {
		appFreeEdit: { fromData1, fromData2, fromData3, fromData4},
		appGridEdit: tableRef.value?.getFromValue()
	}
 

	return appInfo;
};

/* 获取全量表单数据 */
const getFrom = async () => {
	const results = await validateForms();
	const allValid = results.every(isValid => isValid);
	if (!allValid) {
		ElMessage.warning('请补全信息');
		return
  	}
  return   getMergedData(); // 返回合并的数据
};

/** 查询 */
function handleQuery(flag?: boolean) {
	console.log('查询了')
	//模拟数据
	pageresult.list = [{
		cOpgrpCnm: '角色名称',
		cName: '图表名称',
		cType: '1',
		cCode: '1',
	}];
	const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
	const s = freeEditRef.value?.getFromValue(); //获取表单数据
	const param = Object.assign(s, r);
	sysRolechatsMgrService.searchPlan(param)
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

function setFormItem(key: any, obj: any, tabName:any) {
  if (obj && Object.keys(obj).length) {
	tabName = tabName? tabName?.fromSchema :  tableconfig.fromSchema;
    tabName?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          for (let key in obj.btnItems) {
            item.btnItems[key] = obj.btnItems[key];
          }
        } else {
          Object.assign(item, obj);
        }
      }
    });
  }
}

// 防抖定时器
let debounceTimer = <any>null;
//  根据 客户姓 /名 / 被保人性质/ 证件类型 / 证件号码 获取客户信息
const checkUser = (data1) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
	//  只要4个有值 去请求客户信息
  if (data1.cCusLnme && data1.cCusFnme && data1.cGrpMrk !== null && data1.cCerftCls && data1.cCerftCde) {
		debounceTimer = setTimeout(() => {
				const param = {
					coustName: data1.cCusLnme+data1.cCusFnme,
					coustMrk: data1.cGrpMrk,
					coustType: data1.cCerftCls,
					coustCode: data1.cCerftCde,
					personnelType: "Applicant"
				}
				qryCustomer(param)
					.then((res) => {
						const { code, data, msg } = res;
						if (200 === code) {
							if (data) {
								idAnalysis(data[0]['Applicant.cCertfCde'],data1)
							}
						} else {

						}
					})
					.finally(() => { });
			}, 500); // 防抖延迟500ms
  }
};

const idAnalysis = (id: string, data1) => {
  const tabref = opertaor.getTableRefs();
  const applicantValue = tabref["applicant"].getFromValue();
  if (!validateIdCard(id) || (data1.cCerftCls !== '111' && data1.cCerftCls !== '553')) {
    return false
  }
  const birthYear = parseInt(id.substring(6, 10), 10);
  const birthMonth = parseInt(id.substring(10, 12), 10);
  const birthDay = parseInt(id.substring(12, 14), 10);
  const birthday = `${birthYear}-${birthMonth.toString().padStart(2, "0")}-${birthDay.toString().padStart(2, "0")}`;
  const sexCode = parseInt(id.substring(16, 17), 10);
  const sex = sexCode % 2 === 0 ? "2" : "1"; // 1: 男, 2: 女

	if (!data1.cCerftNation) {
		data1.cCerftNation = 'CHN' // 国籍
	}

	data1.cCerftNation = 'CHN' // 国籍
	data1.cCerftBirthday = birthday // 出生日期
	data1.cCerftSex = sex // 性别
};

// 同法定代表人
const hasSameLegalRep = (val) => {
	let fromData2 = freeEditRef2.value?.getFromValue(); //获取表单数据
	let fromData3 = freeEditRef3.value?.getFromValue(); //获取表单数据
	let fromData4 = freeEditRef4.value?.getFromValue(); //获取表单数据
	if (val == "F") { // 负责人
		let data = convertSuffix(fromData2, "B", "C")
		freeEditRef3.value?.setFormValue(data)
	} else if (val == "SQ") { // 授权代理人
		let data = convertSuffix(fromData2, "B", "D")
		freeEditRef4.value?.setFormValue(data)
	}
}

/**
 * 将 obj 中所有 _from 后缀的字段，同步到 targetObj 中对应的 _to 后缀字段
 * @param {Object} obj - 源对象（如包含 _B 字段）
 * @param {string} fromSuffix - 源后缀，如 'B'
 * @param {string} toSuffix   - 目标后缀，如 'C'
 */
const convertSuffix = (obj, fromSuffix = 'B', toSuffix = 'C') => {
  const result = {};
  const fromPattern = new RegExp(`_${fromSuffix}$`);
  const toSuffixStr = `_${toSuffix}`;

  for (const key in obj) {
    if (fromPattern.test(key)) {
      const newKey = key.replace(fromPattern, toSuffixStr);
      result[newKey] = obj[key];
    }
  }
  return result;
}
defineExpose({getFrom, getdData });
</script>

<style scoped></style>
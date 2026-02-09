<template>
  <div>
    <myCard :cardConfig="cardconfig" ref="cardRef">
      <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="distTableRef"
        @pageChange="method.handleQuery($event, true)"
        @selection-change="handleSelectionChange"
      >
        <template #title-info v-if="titleInfo">
          <div style="display: flex; align-items: end;margin-bottom: 5px">
            <span>成功：</span>
            <el-text class="mx-1" type="success">{{titleInfo.successes}}</el-text>
            <span style="margin-left: 10px">失败：</span>
            <el-text class="mx-1" type="danger">{{titleInfo.fails}}</el-text>
          </div>
        </template>
      </app-table>
    </myCard>
    <comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
import {
  createAppGridEditConfig,
} from "@/shared/app-grid-edit-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import {
  selectDist,
  checkAppBase,
  deleteDistCheck,
  deleteDist,
  distMapCollectCompKey,
} from "@/api/prod/index";
import { getAddressStr } from "@/api/query";
import { saveAs } from "file-saver";
import moment from "moment";
import { formInit } from "@/shared/from-init";
import { codeListViewStore } from "@/store";
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
const policyService = new PolicyService();
import { CardConfig, creatCardConfig, MyCardMethod } from "@/shared/mytemplate/card-config";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { useRoute } from "vue-router";
import { AppFreeEditMethod, createAppFreeEditConfig } from "@/shared/app-free-edit-config";
import {eventBus} from "@/utils/event-bus";
import { useValidator } from "@/typings/useValidator";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
import { getTgtDetailByDist, getTermDetailByDist } from "@/api/query";
import Decimal from "decimal.js";
const { getRules } = useValidator();


const route = useRoute();
const dialog = ref<DialogMethod | null>(null);
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const params = opertaor.getParam();
const emit = defineEmits(['savePlyInfo']);  
const btnDisabled = ref(false);

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
  compKey: {
    type: String
  }
});
const cardRef = ref<MyCardMethod | null>(null);
const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
const applicantEditRef = ref<AppFreeEditMethod | null>(null);
const distTableRef = ref<AppTableMethod | null>(null);
const cardconfig = ref<CardConfig>(creatCardConfig({}));
const formconfig1 = ref<Record<string, any>>({});
const tableconfig = ref<AppTableConfig>(createTableEditConfig());
let fileBase: string;
const titleInfo = ref<any>();
// 声明全局变量
let cComponentTableValue: string;

// 封装获取 cComponentTableValue 的逻辑
const getCComponentTableValue = (): string => {
  return props.compKey ? props.compKey.replace(/\d+/g, '') : "";
};

const mapAddr = {
  "AddressDist040001": {
    "Dist.JingyingAddress": "Dist.cDetailedAddress"
  },
  "AddressDist040005": {
    "Dist.SchoolAddressProp": "Dist.cDetailedAddress"
  },
  "AddressDist041001": {
    "Dist.JingYingAddress043009": "Dist.cDetailedAddress"
  },
  "AddressDist043020": {},
  "AdvertisementDist043011": {
    "Dist.JingyingAddress": "Dist.cDetailedAddress"
  },
  "ChargingDist049026": {
    "Dist.DetailAddrProp": "Dist.cDetailedAddress"
  },
  "DesignDist": {
    "Dist.ProjectDesignProp": "Dist.cProjectAddress"
  },
  "ParkingDist043005": {
    "Dist.JingyingAddress": "Dist.cDetailedAddress"
  },
  "PollutionDist043013": {
    "Dist.PropertyLocationProp": "Dist.cDetailedAddress"
  },
  "PortDist040021": {
    "Dist.JingyingAddress": "Dist.cDetailedAddress"
  },
  "ProjectDist043009": {
    "Dist.JingYingAddress043009": "Dist.cDetailedAddress"
  },
  "ProjectDist045001": {
    "Dist.EngineeringAddressProp": "Dist.cDetailedAddress"
  },
  "ProjectDist049035": {},
  "PropertyaddressDist010001": {
    "Dist.TgtAddressProp": "Dist.cPropertyAddress"
  },
  "PropertyaddressDist010004": {
    "Dist.TgtAddressProp": "Dist.cPropertyAddress"
  },
  "PropertyaddressDist010006": {
    "Dist.TgtAddressProp": "Dist.cPropertyAddress"
  },
  "PropertyaddressDist010021": {
    "Dist.cShowAddr": "Dist.cShowAddr"
  },
  "PropertyaddressDist080002": {
    "Dist.FamilyAddressAllProp": "Dist.cFamilyAddr"
  },
  "PropertyaddressDist080003": {
    "Dist.TgtAddressProp": "Dist.cPropertyAddress"
  },
  "PropertyaddressDist080027": {
    "Dist.TgtAddressProp": "Dist.cPropertyAddress"
  },
  "PropertyaddressDist089005": {
    "Dist.HomeAllProp": "Dist.cDetailedAddress"
  }
};

const distSummaryRef = ref(); // 汇总组件对象
const collectCompKey = ref(); // 汇总组件key
const formconfig11 = ref<any>({});
const oldPageSchema = ref<any>({});

const hiddenPage = ref<Array>(['VehicleDist040002']); //初始化需要隐藏的组件
const addedPlans = ref<string[]>([]);
const isQuery = ref(false)
const cProdNos = ['010001','010002','010003','010004','010020','070002'];

// 货物信息回填到标的信息的产品
const ProdNo = ref(['020001', '020002', '020003', '020004', '020005', '020006', '020007', '020009', '020011', '020013', '020015', '020016', '020017'])
let cRelatedInsuredflag = ref(false)  // 是否存在关联被保险人字段
watch(
    () => pageresult.list,
    async (newVal: any) => {
      if (newVal) {
        console.log('发生变化了。。。',newVal)
				// 043003产品的标的信息的“投保车辆总数”需要根据清单的数量自动带出
        if(route.params.param?.cProdNo === '043003') {
          opertaor.getTableRefByKey('tgt')?.setValue('Tgt.nInsuredCars', pageresult.list.length)
				}
				// 货物信息在满足这些产品时，需要回填到标的信息中
				if (ProdNo.value.includes(route.params.param.cProdNo)) {
					const param = opertaor.getParam();
					let app = "";
					if (opertaor.getDataAll()?.plyBase["Base.cAppNo"]) {
							app = opertaor.getDataAll().plyBase["Base.cAppNo"];
					} else if(param.cOrgAppNo){
							app = param.cOrgAppNo;
					} else if(param.pageType !== "copy") {
							app = param.cAppNo
					}
					let distParam = {};
					if(route.params.param?.pageName === "priceInquiry") {
						distParam['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
					} else {
						distParam['cAppNo'] = app;
					}
					let nAdditiveCoefficient = ''
					if (pageresult.list.length > 0) {
						nAdditiveCoefficient = pageresult.list[0]['Dist.nAdditiveCoefficient'] // 加成系数（%）
					}
					getTgtDetailByDist(distParam).then((res: any) => {
						if (res["code"] == "200") {
							const cTradeNum = res.data?.cTradeNum; // 贸易合同号
							const cLadingNum = res.data?.cLadingNum; // 提单号
							const cCreditNum = res.data?.cCreditNum; // 信用证号
							const cMarkLabel = res.data?.cMarkLabel; // 标记(唛头标签)
							const cPackageMethod = res.data?.cPackageMethod; // 包装方式
							const nInsuranceAmount = res.data?.nInsuranceAmount; // 保险金额
							const cInvoiceNum = res.data?.cInvoiceNum; // 发票号
							let tgtRef = opertaor.getTableRefByKey('tgt');
							tgtRef.setValue('Tgt.cTradeNum', cTradeNum);
							tgtRef.setValue('Tgt.cLadingNum', cLadingNum);
							tgtRef.setValue('Tgt.cCreditNum', cCreditNum);
							tgtRef.setValue('Tgt.cInvoiceNum', cInvoiceNum) 
							tgtRef.setValue('Tgt.cMarkLabel', cMarkLabel);
							tgtRef.setValue('Tgt.cPackageMethod', cPackageMethod);
							tgtRef.setValue('Tgt.nInsuranceAmount', nInsuranceAmount);
							tgtRef.setValue('Tgt.nAdditiveCoefficient', nAdditiveCoefficient);
						} else {
							ElMessage.error(res.msg);
						}
					})
				}
				if (!isQuery.value && !ProdNo.value.includes(route.params.param.cProdNo)) {
					eventBus.emit('goodsMxChange', newVal);
				}
				// 协议
        const prods = ['020001','020002','020003','020004','020005','020006','020007','020009','020011','020013','020015','020016','020017']
				if (props.pageSchema.title === '货物明细信息' && prods.includes(route.params.param.cProdNo)) {
						let tgtRef = opertaor.getTableRefByKey('cvrg');
            if(newVal.length>0){
							const paramA = {
								cPkId: newVal.map(item => item['Dist.cPkId'])
							};

							if(route.params.param?.pageName === "priceInquiry") {
								paramA['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"];
								if(!paramA['cInquiryNo']) return false
							}else {
								paramA['cAppNo'] = opertaor.getDataAll()?.plyBase["Base.cAppNo"];
								if(!paramA['cAppNo']) return false
							}
							getTermDetailByDist(paramA).then((res: any) => {
								if (res["code"] == "200") {
									const ids = newVal.map(item => item['Dist.nSeqNo']).join(',');
              		const codeNos = newVal.map(item => item['Dist.cCodeNo']).join(',');
									const cPkIds = newVal.map(item => item['Dist.cPkId']).join(',');
									tgtRef.setCargoSeq(codeNos, cPkIds, res.data?.nInsuranceAmount);
								} else {
									ElMessage.error(res.msg);
								}
							});
						} else {
							tgtRef.setCargoSeq('','','');
						}
						tgtRef.DistdataFlash('m0')
				}
				if (isQuery.value) return
				
        // 02开头的货物明细清单，关联标的信息
        if(cComponentTableValue == "CargoDist" && route.params.param?.cProdNo.startsWith('02') && opertaor.getTableRefByKey('cvrg')?.getFromValue()?.length > 0 && route.params.param?.pageType != "readonly"){
           method.getTgtDetailFn();
          //  emit('savePlyInfo');
          updateCvrgnInsuranceAmount()
        }
        // 010001, 010002, 010003, 010004, 010020产品地址编码根据清单内容下拉框展示
        const targetProducts = ['010001', '010002', '010003', '010004', '010020', '070002'];
        if(targetProducts.includes(route.params.param?.cProdNo)){
          if(props.compKey?.includes('DeductibleDist')) return;
          const cvrgRef = opertaor.getTableRefs()['cvrg'];
          const cComponentTable = props.compKey?.split('Dist')?.[0] + 'Dist';
          await cvrgRef?.getAddrSeqOptions(cComponentTable)
          cvrgRef?.refushCvrgInfo();
        }
        if(route.params.param?.cProdNo === '043009' && props.compKey === 'ProjectDist043009') {
          eventBus.emit('setMap-EmployeeDist043009', {
            code: 'Dist.cEmploymentAddress',
            list: pageresult.list.map((m: any) => {
              return {
                label: m['Dist.cDetailedAddress'],
                value: m['Dist.cPkId']
              }
            })
          });
        }
      }
    }
);
onMounted(async () => {
  // 初始化 cComponentTableValue
  cComponentTableValue = getCComponentTableValue();

  formconfig11.value = formInit(
      JSON.stringify({ ...props.pageSchema }),
      method,
      exRules
  );
  // 如果团个单标识为团单则展示关联被保险人，否则隐藏
  if(route.params.param?.cGrpMrk !== '1') {
    formconfig11.value.fromSchema = formconfig11.value.fromSchema.filter((item:any) => item.prop !== 'Dist.cRelatedInsured')
  }
  formconfig11.value.fromSchema?.forEach((item:any)=>{
    // 010006、019003 发动机号必填
    if(item['prop'] ==='Dist.cEngineNumber'){
      if(['019003', '010006'].includes(params.cProdNo)) {
        item['rules'] = [getRules("required", {})];
      } else {
        item['rules'] = item['rules'] ? item['rules'] : [];
      }
    }
    // 019003、080026 生产厂家必填
    if(item['prop'] ==='Dist.cProduceFactory'){
      if(['019003', '080026'].includes(params.cProdNo)) {
        item['rules'] = [getRules("required", {})];
      } else {
        item['rules'] = [];
      }
    }
    // 010006、019003 厂牌型号必填 010009 品牌型号必填
    if(item['prop'] ==='Dist.cBrandModel'){
      if(['010006', '019003', '010009'].includes(params.cProdNo)) {
        item['rules'] = [getRules("required", {})];
      } else {
        item['rules'] = item['rules'] ? item['rules'] : [];
      }
    }
    // 是否施工联合体选是，施工联合体成员必填
    if(item['prop'] === 'Dist.cUnionMembers') {
      eventBus.on('setMap-cUnionMembers', (data: any) => {
        if(data == '1') {
          item['rules'] = [getRules("required", {})];
        } else {
          item['rules'] = [];
        }
      })
    }
  })
  // if(params.cProdNo === '040003'){
  //   formconfig11.value.fromSchema?.forEach(item=>{
  //     if(item['prop'] ==='Dist.cProductType'){
  //       item['typeCode'] = 'Product_Type040003';
  //     }
  //   })
  // }

  if(props.compKey === 'VehicleDist040002') {
    formconfig11.value.fromSchema.forEach((item:any) => {
      if(item.prop === 'Dist.cPlanNo') {
        item.lengthNum = 5
      }
      if(item.prop === 'Dist.nInsuredSeats') {
        item.lengthNum = 8
      }
      if(item.prop === 'Dist.nApprovedSeats') {
        item.lengthNum = 8
      }
      if(item.prop === 'Dist.nApprovedWeight') {
        item.lengthNum = 7
      }
    })
  }

  if(params.cProdNo?.startsWith('01')) {
    formconfig11.value.fromSchema.forEach((item:any) => {
      if(item.prop === 'Dist.cZipCde') {
        item.lengthNum = 6
        item.lengthIsNumber = true
      }
    })
  }

  Object.assign(formconfig1.value, formconfig11.value);
  cardconfig.value.title = formconfig1.value.title;
  cardconfig.value.showMyfromBtm = formconfig1.value.showMyfromBtm;
  if(hiddenPage.value.indexOf(props.compKey) > -1) {
    cardRef.value.changeMyForm(false);  //初始化隐藏表单
  }
  console.log(cardconfig.value);
  if(formconfig1.value.distSchema&& formconfig1.value.distSchema.length > 0){
         formconfig1.value.distSchema.forEach((item:any)=>{
            if(item['prop'] === 'cPlateNumber'){
                item['rules'] = [getRules("vehiclePlate", {})];
            }
          
      })
    cardconfig.value.formconfig = createAppFreeEditConfig({
      fromSchema:formconfig1.value.distSchema,
      endBtnsPosition: "right",
      endBtns: [
        {
          icon: "search2",
          tooltip: "查询",
          func: () => {
			handleQuery()
          },
        },
        {
          icon: "RefreshRight",
          tooltip: "重置",
          func: () => {
            cardResetFn();
          },
        },
      ],
    });
    cardconfig.value.showEdit = true;

 

  }
  tableconfig.value.showEdit = true;
  tableconfig.value.showSelection = true;
  tableconfig.value.fixed = true;
  tableconfig.value.showExpand = formconfig1.value.showExpand;
  formconfig1.value.fromSchema.forEach((e: any)=>{  // 隐藏不需要显示在表格内的数据
    if(e.cShowLocation === '0'){
      e.isShow = false
    }
    return e;
  });
  tableconfig.value.fromSchema = formconfig1.value.fromSchema.map((item:any) => {
    if(item.prop === "Dist.nSeqNo" && item.title?.length > 0) {
      item.lengthNum = item.title?.length
    }
    return item;
  });
  tableconfig.value.formconfig = createAppGridEditConfig({
    titleBtns: formconfig1.value.titleBtns,
    // fromSchema: formconfig1.value.distSchema,
  });
  tableconfig.value.fromSchema.forEach( r => {
    if(r['prop'] === 'Dist.cVinCode'){  //调整车架号列宽
      r.width = '160';
    }
    // 关联实际用工地址列表展示
    if(r['prop'] === 'Dist.cEmploymentAddress'){
      eventBus.on('setMap-EmployeeDist043009', (data: any) => {
        if(data.list && data.list.length > 0) {
          r.loadData = data.list
          handleQuery()
        }
      })
    }
    // 关联项目地址列表展示
    if(r['prop'] === 'Dist.cProjectAddress'){
      eventBus.on('setMap-ProjectDist045001', (data: any) => {
        if(data.list && data.list.length > 0) {
          r.loadData = data.list
        }
      })
		}
		// 团单营业场所地址清单关联被保险人清单
		if (r['prop'] === 'Dist.cRelatedInsured') {
			cRelatedInsuredflag.value = true
      eventBus.on('setMap-AddressDist040001', (data: any) => {
        if(data.list && data.list.length > 0) {
          r.loadData = data.list
        }
      })
    }
		// 090001 免赔种类选择后 分项责任根据选中的免赔种类查询下拉选项
		if (r['prop'] === 'Dist.cItemLiability') {
			r.multiple = 1
			r.typeCode = ''
			let list = [{label: "财产损失", value: "01"}, {label: "人身意外", value: "02"}]
			codeListStore.queryCodeList({
				codeListName: 'mianpeileixing',
				codeListParam:{},
			})
				.then((res) => {
					list.push(...res)
					r.loadData = list
			});
    }
  });
  tableconfig.value.tableBtnType = "btn";
  tableconfig.value.tableBtnWidth = 150;
  tableconfig.value.tableBtnPosition = "right";
  tableconfig.value.isPage = true;
  if (formconfig11.value.editBtns && formconfig11.value.editBtns.length > 0) {
    let btns: any[] = [];
    btns = formconfig11.value.editBtns;
    if (btns && btns.length > 0) {
      tableconfig.value.tableBtn = btns;
    }
  }
 
  distMapCollectCompKey({
    cProdNo: route.params.param?.cProdNo,
    cComponentKey: props.compKey,
  }).then((res) => {
    collectCompKey.value = res;
    // 获取清单对应的汇总组件对象
    distSummaryRef.value = opertaor.getTableRefByKey(collectCompKey.value);
    if(distSummaryRef.value) {
      // 设置汇总组件里对应的清单vo
      distSummaryRef.value?.setDistCompKey(cComponentTableValue);
    }
    // 初始化页面数据
    method.handleQuery();
  });

  // 电梯信息清单
  let tgtRef = opertaor.getTableRefByKey('tgt');
  if(tgtRef){
    tgtRef.setValue("Tgt.nElevatorsNumber",pageresult.list.length)
  }
  if(distTableRef.value) {
    eventBus.on(`setMap-${props.compKey}`, addCodeListMap);
  }
  // 解决040002变更清单信息批改单暂存单打开时雇员清单职业类别出现不显示问题(是在获取批改项后职业类别显示内容消失，未找到原因所以只能在setUnDisabledByKeyList执行后调用查询方法让职业类别显示)
  if(route.params.param?.cProdNo === '040002' && (route.params.param?.pageType === "EDR_APP_NEW_SCENE" ||
      (route.params.param?.pageType == "TEMPORARY_DEPOSIT" && route.params.param?.cAppTyp == "E"))) {
    eventBus.on('setUnDisabledDone', (val:any) => {
      if(val) {
	      handleQuery()
      }
    })
	}
	// 被保人清单更新清单信息重新查询
	eventBus.on('insureDistEdit', (val: any) => {
		if(val) {
			handleQuery()
		}
	})
});

// const  modifyRules = (data, fieldValue)=> {
//     data.forEach(item => {
//         if (fieldValue === 0) {
//             // 如果 fieldValue 是 1，把所有 rules 改成 null
//             item.rules = null;

//         } else if (fieldValue === 1) {
//             // 如果 fieldValue 是 2，只为没有规则的字段添加必填规则
//             if (!item.rules || (item.rules && !item.rules.some(rule => rule.required === true && rule.message === '该项为必填项'))) {
//                 item.rules = [{ required: true, message: '该项为必填项', trigger: 'blur' }];
//             }
//         }
//     });
// }  Tgt.nEngineeringCost nEngineeringCostChange

function cardResetFn(){
  isQuery.value = false
	const tableEditRefs = cardRef.value;
	const s = tableEditRefs?.getFromValue(); //获取表单数据
	for (const k in s) {
			s[k] = null;
	}
	tableEditRefs?.setFormValue({...s})
	handleQuery()
}

// 绑定方法
const method = {
  func1: () => {},
  handleClose: (val) => {},

  // grid row 地址级联 初始化
  cOccupationalLevelOnInit: (data: any) => {
    const {value, rowData, config, itemRef} = data;
    if(!value || !rowData || !config || !itemRef) return;
    const AllOccup = rowData['Dist.AllOccup'];
    if( AllOccup.length < 3) return;
    codeListStore.queryCodeList({
      codeListName: "Occupt_ZYLB",
      codeListParam: {cParCde: AllOccup.at(-1)},
    }).then((res) => {
      //给表单下拉项赋值
      config.loadData = res;
    });
  },

  editmethod: (row: any) => {
    let cappNo = '';
    // 判断有无批改类型参数，有则是批单
    if(route.params.param?.cEdrType) {
    	const edrbase = opertaor.getFatherPage().getEdrbaseValue();
      cappNo = edrbase['EdrBase.cAppNo'];
    } else if(route.params.param?.pageName === "priceInquiry") {
      cappNo = opertaor.getDataAll().plyBase["Base.cInquiryNo"];
    } else {
      cappNo = opertaor.getDataAll().plyBase["Base.cAppNo"];
    }
    if (!cappNo) {
      ElMessage.warning('请先保存申请单'); // 提示用户保存投保单
      return;
    }else{
      dialog.value?.open(
        "distAdd",
        {
          fromSchema: tableconfig.value.fromSchema,
          title: "编辑",
          rowData: {
            ...row, 
            cProdNo: route.params.param?.cProdNo, 
            cRsnCde: route.params.param?.cRsnCde
          },
          tab: formconfig1.value.title,
          compKey: props.compKey,
          codeListMap: distTableRef.value?.getCodeListMap(),
          addedPlans: addedPlans.value, // 顺序数组
        },
        {
          isOk: (res: any) => {
            if (res.addedPlan) {
                addedPlans.value.push(res.addedPlan);
            }
            const queryParams = distTableRef.value?.getPartnerPage(false);
            handleQuery: method.handleQuery(queryParams);
          },
        },
        { width: "60" }
    );
    }
    
  },
  async delmethod(row: any) {
    let cappNo = '';

    // 判断有无批改类型参数，有则是批单
    if (route.params.param?.cEdrType) {
      const edrbase = opertaor.getFatherPage().getEdrbaseValue();
      cappNo = edrbase['EdrBase.cAppNo'];
    } else if (route.params.param?.pageName === "priceInquiry") {
      cappNo = opertaor.getDataAll().plyBase["Base.cInquiryNo"];
    } else {
      cappNo = opertaor.getDataAll().plyBase["Base.cAppNo"];
    }
    if (!cappNo) {
      ElMessage.warning('请先保存申请单'); // 提示用户保存投保单
      return;
    }
    const param = {
      cComponentTable: cComponentTableValue,
      cPkId: [row['Dist.cPkId']],
    }
    if (route.params.param?.pageName === "priceInquiry") {
      param['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
    } else {
      param['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
    }

    const res = await deleteDistCheck(param);
    const checkMsg = res.code === 500 ? res.msg : "是否确认删除选中的数据？";
    ElMessageBox.confirm(
        checkMsg,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
    ).then(async () => {
      // 02大类和01部分产品删除清单时需要先调用保存在执行删除操作，避免清单更新后刷新条款时丢失未保存的条款数据
      if((route.params.param?.cProdNo.startsWith('02') || cProdNos.includes(route.params.param?.cProdNo)) && !props.compKey?.includes('DeductibleDist')) {
        const savePlyInfo = await opertaor.getFatherPage().savePlyInfo();
        if(!savePlyInfo) return;
      }
      deleteDist(param).then((res: any) => {
        if (res.code === 200) {
          ElMessage.success("删除成功");
          const queryParams = distTableRef.value?.getPartnerPage(false);
          method.handleQuery(queryParams, true);
        } else {
          ElMessage.error(res.msg);
        }
      }).catch((err: any) => {
        ElMessage.error(err.msg);
      })
    });
  },


  //  042003 根据电梯条数反
  funcdistadd: () => {
    const alldata: any = opertaor.getDataAll();
    const param:any = {};
    if(route.params.param?.pageName === "priceInquiry") {
      param['cInquiryNo'] = opertaor.getDataAll()?.plyBase["Base.cInquiryNo"]
    } else if (route.params.param?.pageType === "EDR_APP_NEW_SCENE") {
    	const edrbase = opertaor.getFatherPage().getEdrbaseValue();
      param['cAppNo'] = edrbase["EdrBase.cAppNo"]
    } else {
      param['cAppNo'] = opertaor.getDataAll()?.plyBase["Base.cAppNo"]
    }

    let fromSchema = tableconfig.value.fromSchema;
    checkAppBase(param).then((res: any) => {
      if (res.code === 200) {
        dialog.value?.open(
            "distAdd",
            {
              fromSchema: fromSchema,
              title: "新增",
              tab: formconfig1.value.title,
              compKey: props.compKey,
              codeListMap: distTableRef.value?.getCodeListMap(),
              addedPlans: addedPlans.value, // 顺序数组
            },
            {
              isOk: (res: any) => {
                if (res.addedPlan) {
                    addedPlans.value.push(res.addedPlan);
                }
                const queryParams = distTableRef.value?.getPartnerPage(false);
                handleQuery: method.handleQuery(queryParams, true);
              },
            },
            { width: "60" }
        );
      } else {
        ElMessage.error("请先保存申请单!");
      }
    });
  },


  handleQuery: (queryParams: any = { pageNum: 1, pageSize: 10 }, isChange: boolean = false) => {
    distTableRef.value?.setPartnerPage(queryParams);
    let tgtRef = opertaor.getTableRefByKey('tgt');
		const s = cardRef.value?.getFromValue() || {};
		// 经营地址只选择省市区不输入详细地址获取表单值会带有undefined，这里处理一下
		for (let k in s) {
			if(s[k] && typeof s[k] === 'string' && s[k].indexOf('undefined') !== -1) {
				s[k] = s[k].replace('undefined', '')
			}
		}
    const param = opertaor.getParam();
    let app = "";
    if (opertaor.getDataAll()?.plyBase["Base.cAppNo"]) {
      app = opertaor.getDataAll().plyBase["Base.cAppNo"];
    } else if(param.cOrgAppNo){
      app = param.cOrgAppNo;
    } else if(param.pageType !== "copy") {
      app = param.cAppNo
    }
    const selData = {
      cAppNo: "",
			cComponentTable: cComponentTableValue,
            cClauseCode: route.params.param?.cTermNo, //条款编码  
            cProdNo: route.params.param?.cProdNo,  //产品号
			...formconfig1.value,
			...queryParams
    };
		selData.dist = JSON.parse(JSON.stringify(s))
    if(route.params.param?.pageName === "priceInquiry") {
      selData['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
			if(!selData['cInquiryNo']){
				return false
			}
    } else {
      selData['cAppNo'] = app;
			if(!selData['cAppNo']){
				return false
			}
    }
    if(route.params.param?.pageType && route.params.param?.pageType === "EDR_APP_NEW_SCENE") {
      selData.voType = "ply"
    }
		// 级联地址表格显示问题处理
		if(Object.keys(mapAddr).includes(props.compKey)) {
			const addrInput = mapAddr[props.compKey];
			const keys = Object.keys(addrInput)
			if(keys && keys.length>0) {
				const inputGroupKey = keys[0];
				const addrValueKey = addrInput[inputGroupKey];
				selData.dist[addrValueKey] = selData.dist[inputGroupKey];
			}
		}
    selectDist(selData).then((res: any) => {
      if (res.code === 200) {
        pageresult.list = [];
        pageresult.total = res.data.total;
        pageresult.list = res.data.data.map((item, index) => {
					let data:any = {}
					if(!!item['Dist.cMajorCategories'] || !!item['Dist.cMediumClassification'] || !!item['Dist.cOccupationalSubcategory']){
						data['Dist.AllOccup'] = [
                item['Dist.cMajorCategories'], item['Dist.cMediumClassification'], item['Dist.cOccupationalSubcategory']
            ]
					}
					if(!!item['Dist.tOpeningTime']){
						data['tOpeningTime'] = item['Dist.tOpeningTime']? moment(item['Dist.tOpeningTime']).format("YYYY-MM-DD"): null
					}
          // 免赔信息 保险责任级联
          if(!!item['Dist.cInsuranceDuty'] && !!item['Dist.cSuitScope']) {
            const key = props.pageSchema.fromSchema?.find((i:any) => i.prop.indexOf('Dist.cSuitScopeGroup') != -1)?.prop;
            if(key) {
              data[key] = data[key] || [];
              data[key][0] = item['Dist.cInsuranceDuty']
              data[key][1] = item['Dist.cSuitScope']
            }
          }
          
            console.log('pageresult.list',pageresult.list);
          return{
            ... item,
            ... data
          };
        });
       
        // 040005学生人数（人） 地址清单信息人数 回填
        if( props.compKey === 'AddressDist040005' ){
             if(pageresult.list.length>0){
                let peopleNumber: number | null = null;
              pageresult.list.forEach((item:any)=>{
                    peopleNumber+= item['Dist.nInsuredNumber']  || 0
              })
               tgtRef.setValue('Tgt.nStudentsNumber',peopleNumber)
             }
        }

        // 020001  货物数量 回填
        // if( props.compKey === 'CargoDist020001' ){
        //     if(pageresult.list.length>0){
        //         debugger
        //       let nGoodsNum: number | null = null;
        //         pageresult.list.forEach((item:any)=>{
        //               nGoodsNum+= item['Dist.nNum'] || 0
        //         })
        //       tgtRef.setValue('Tgt.nGoodsNum',nGoodsNum)
        //     }
        // }

        if(tgtRef !== undefined){
          tgtRef.setValue("Tgt.nElevatorsNumber",res.data.total)
        }

        // 043009 set 被保人关联关系、实际用工地址关联关系 下拉值
        if(props.compKey === 'ProjectDist043009'){
          const insured =  opertaor.getDataAll()['insured'];
          if(insured && insured['Insured.cInsuredCde']) {
            eventBus.emit('setMap-ProjectDist043009', {
              code: 'Dist.cRelatedInsured',
              list: [{
                value: insured['Insured.cInsuredCde'],
                label: insured['Insured.cInsuredNme']
              }]
            });
          }
          eventBus.emit('setMap-EmployeeDist043009', {
            code: 'Dist.cEmploymentAddress',
            list: pageresult.list.map((m: any) => {
              return {
                label: m['Dist.cDetailedAddress'],
                value: m['Dist.cPkId']
              }
            })
          });
        }

        // 045001 set 关联项目地址 下拉值
        if(props.compKey === 'ProjectDist045001'){
          eventBus.emit('setMap-ProjectDist045001', {
            code: 'Dist.cProjectAddress',
            list: pageresult.list.map((m: any) => {
              return {
                label: m['Dist.cDetailedAddress'],
                value: m['Dist.cPkId']
              }
            })
          });
				}

				// 040001 set 关联被保险人 下拉值
				if (cRelatedInsuredflag.value) {
					if(pageresult.list.length>0){
						pageresult.list.forEach((item: any) => {
							if (item['Dist.cRelatedInsured']) {
								item['Dist.cRelatedInsured'] = item['Dist.cRelatedInsured'].split(',')
							}
						})
					}
					const insuredDistData = opertaor.getTableRefs()['insuredDist']?.getFormValue() || [];
					const list = insuredDistData.length > 0 ? insuredDistData.map((i:any) => ({
						label: i['InsuredDist.cInsuredNme'],
						value: i['InsuredDist.cPkId']
						// value: i['InsuredDist.cInsuredCde']
					})) : []
					eventBus.emit('setMap-AddressDist040001', {
						code: 'Dist.cRelatedInsured',
						list
					});
        }
        // 刷新汇总表格
        if(distSummaryRef.value) {
          distSummaryRef.value?.handleQuery();
        }

        if(idxParam && isChange) { // 保存清单表格在屏幕中间
          idxParam.handleAnchorClick(undefined, `#${props.compKey}`);
        }

        if(cComponentTableValue == "CargoDist" && route.params.param?.cProdNo.startsWith('02') ){
           method.getTgtDetailFn();
        }
      }
    });
  },
  // distSummeryQuery: () => {
  //   syncDist({
  //     cComponentTable: "DistSummary",
  //     cAppNo: opertaor.getDataAll().plyBase["Base.cAppNo"],
  //   }).then((res) => {
  //     if (res.code == 200) {
  //       pageresult.list = [];
  //       pageresult.list = res.data;
  //       pageresult.list.forEach((item, index) => {
  //         item.nSeqNo = index + 1;
  //       });
  //     }
  //   });
  // },
  getTgtDetailFn:() => {
  
        // 询价转投保
        if(route.params.param?.pageType === "inquiryToApp") {
           return;
        } 

        const param = opertaor.getParam();
        let app = "";
        if (opertaor.getDataAll()?.plyBase["Base.cAppNo"]) {
            app = opertaor.getDataAll().plyBase["Base.cAppNo"];
        } else if(param.cOrgAppNo){
            app = param.cOrgAppNo;
        } else if(param.pageType !== "copy") {
            app = param.cAppNo
        }
        let distParam = {};
        if(route.params.param?.pageName === "priceInquiry") {
          distParam['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
        } else {
          distParam['cAppNo'] = app;
        }
        
        getTgtDetailByDist(distParam).then((res: any) => {
        if (res["code"] == "200") {
              nextTick(()=>{
                    setTimeout(()=>{
                         let tgtRef = opertaor.getTableRefByKey('tgt');
                        let cWaybillNumber = res.data?.cWaybillNumber;
                        let cGoodsNo = res.data?.cGoodsNo;
                        let nInvoicceValue = res.data?.nInvoiceValue;
                        let cInvoiceNum = res.data?.cInvoiceNum;
                        let nGoodsNum = res.data?.nGoodsNum;
                        tgtRef.setValue('Tgt.cWaybillNumber', cWaybillNumber)
												tgtRef.setValue('Tgt.cGoodsNo', cGoodsNo) // 货物名称
												tgtRef.setValue('Tgt.nInvoicceValue', nInvoicceValue) // 发票金额
                        tgtRef.setValue('Tgt.cInvoiceNum', cInvoiceNum) // 发票号
                        tgtRef.setValue('Tgt.nGoodsNum', nGoodsNum) // 货物数量
                    },100)
              })
        } else {
            ElMessage.error(res.msg);
        }
        });
  },
  carInfoAdd: () => {
    const param = {};
    if(route.params.param?.pageName === "priceInquiry") {
      param['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
    } else if (route.params.param?.pageType === "EDR_APP_NEW_SCENE") {
      param['cAppNo'] = opertaor.getDataAll().edrBase["Base.cAppNo"]
    } else {
      param['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
    }
    checkAppBase(param).then((res) => {
      if (res.code === 200 || route.params.param?.pageType === "E") {
        dialog.value?.open(
            "distAdd",
            {
              fromSchema: tableconfig.value.fromSchema,
              title: "新增",
              tab: formconfig1.value.title,
              compKey: props.compKey,
              codeListMap: distTableRef.value?.getCodeListMap(),
              addedPlans: addedPlans.value
            },
            {
              isOk: (res: any) => {
                if (res.addedPlan) {
                    addedPlans.value.push(res.addedPlan);
                }
                const queryParams = distTableRef.value?.getPartnerPage(false);
                handleQuery: method.handleQuery(queryParams);
              },
            },
            { width: "60" }
        );
      } else {
        ElMessage.error("请先保存申请单!");
      }
    });
  },
  //导出
  exportExcel: () => {
    let cappNo = '';
    // 判断有无批改类型参数，有则是批单
    if(route.params.param?.cEdrType) {
			const edrbase = opertaor.getFatherPage().getEdrbaseValue();
      cappNo = edrbase['EdrBase.cAppNo'];
    } else if(route.params.param?.pageName === "priceInquiry") {
      cappNo = opertaor.getDataAll().plyBase["Base.cInquiryNo"];
    } else {
      cappNo = opertaor.getDataAll().plyBase["Base.cAppNo"];
    }
    if (!cappNo) {
      ElMessage.warning('请先保存申请单'); // 提示用户保存投保单
      return;
    }
		const s = cardRef.value?.getFromValue(); // 查询参数
		// 经营地址只选择省市区不输入详细地址获取表单值会带有undefined，这里处理一下
		for (let k in s) {
			if(s[k] && typeof s[k] === 'string' && s[k].indexOf('undefined') !== -1) {
				s[k] = s[k].replace('undefined', '')
			}
		}
    let paramitem  = Object.assign({...getFatherPageOldProductResData()}, {
      cComponentTable: cComponentTableValue,
    },
		{ dist: s });
    if(route.params.param?.pageType && route.params.param?.pageType === "EDR_APP_NEW_SCENE") {
      paramitem.voType = "ply"
    }
    if(route.params.param?.pageName === "priceInquiry") {
      paramitem['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
    } else {
      paramitem['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
    }
    if(selectedRows.value.length > 0) {
      paramitem['cPkId'] = selectedRows.value.map((row: any) => row['Dist.cPkId']);
    }


		if(paramitem.dist?.['Dist.ProjectDesignProp']) {
			paramitem.dist['Dist.cProjectAddress'] = paramitem.dist['Dist.ProjectDesignProp']
		}

		// 级联地址表格显示问题处理
		if(Object.keys(mapAddr).includes(props.compKey)) {
			const addrInput = mapAddr[props.compKey];
			const keys = Object.keys(addrInput)
			if(keys && keys.length>0) {
				const inputGroupKey = keys[0];
				const addrValueKey = addrInput[inputGroupKey];
				paramitem.dist ? paramitem.dist[addrValueKey] = paramitem.dist?.[inputGroupKey] : '';
			}
		}
    policyService
        .exportDist(paramitem).then((res) => {
      if (res.size <= 0) {
        ElMessage.error({ message: "导出出错", duration: 3000 });
        return;
      }
      const fileName = decodeURIComponent(res.headers['content-disposition'].split('filename=')[1]);
      const blob = new Blob([res.data], {
        responseType:res.headers["content-type"]
        // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8",
      });
      saveAs(blob, fileName);
    })
  },
  //全量导入
  importExcel() {
    let cappNo = '';
    // 判断有无批改类型参数，有则是批单
    if(route.params.param?.cEdrType) {
    	const edrbase = opertaor.getFatherPage().getEdrbaseValue();
      cappNo = edrbase['EdrBase.cAppNo'];
    } else if(route.params.param?.pageName === "priceInquiry") {
      cappNo = opertaor.getDataAll().plyBase["Base.cInquiryNo"];
    } else {
      cappNo = opertaor.getDataAll().plyBase["Base.cAppNo"];
    }
    if (!cappNo) {
      ElMessage.warning('请先保存申请单'); // 提示用户保存投保单
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls, .xlsm'; // 支持的文件类型
    input.onchange = () => {
      if (input.files?.length) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
          const base64String = e.target?.result as string;

          // ✅ 此处赋值有效
          // fileBase = base64String.split(',')[1]; // 去掉 data:image/type;base64, 前缀

          // console.log(fileBase, "0000000"); // ✅ 此处可以正常打印 Base64 字符串

          // 构建参数并请求接口
          const params = {
            ...getFatherPageOldProductResData(),
            file: base64String, // ✅ 正确传入
            cComponentTable: cComponentTableValue,
          };
          if(route.params.param?.pageName === "priceInquiry") {
            params['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
          } else {
            params['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
          }
          
          // 02大类和01部分产品导入清单时需要先调用保存再执行操作，避免清单更新后刷新条款时丢失未保存的条款数据
          if((route.params.param?.cProdNo.startsWith('02') || cProdNos.includes(route.params.param?.cProdNo)) && !props.compKey?.includes('DeductibleDist')) {
            const savePlyInfo = await opertaor.getFatherPage().savePlyInfo();
            if(!savePlyInfo) return;
          }
          policyService.importDist(params).then((res) => {
            if (res.code === 200) {
              titleInfo.value = {
                successes: res.data.successes,
                fails: res.data.fails,
              };
              ElMessage.success(`导入完成：${res.data.msg}`);
              method.handleQuery();
            } else {
              ElMessage.error(res.msg || "全量导入失败");
            }
          }).catch((error) => {
            ElMessage.error("导入出错，请检查文件格式或内容");
            console.error("导入错误：", error);
          });
        };

        reader.onerror = (e) => {
          console.error("文件读取失败", e);
          ElMessage.error("文件读取失败");
        };
        reader.readAsDataURL(file); // 启动读取
      }
    };
    input.click(); // 触发文件选择对话框
  },
  // 增量导入
  importExcelIncrement: () => {
    let cappNo = '';
    if(btnDisabled.value === true) return;
    // 判断有无批改类型参数，有则是批单
    if(route.params.param?.cEdrType) {
    	const edrbase = opertaor.getFatherPage().getEdrbaseValue();
      cappNo = edrbase['EdrBase.cAppNo'];
    } else if(route.params.param?.pageName === "priceInquiry") {
      cappNo = opertaor.getDataAll().plyBase["Base.cInquiryNo"];
    } else {
      cappNo = opertaor.getDataAll().plyBase["Base.cAppNo"];
    }
    if (!cappNo) {
      ElMessage.warning('请先保存申请单'); // 提示用户保存投保单
      return;
    }
    btnDisabled.value = true

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls, .xlsm'; // 支持的文件类型
    input.onchange = () => {
      ElMessage.warning('正在导入中，请稍候…')
      if (input.files?.length) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
          const base64String = e.target?.result as string;

          // ✅ 此处赋值有效
          // fileBase = base64String.split(',')[1]; // 去掉 data:image/type;base64, 前缀

          // console.log(fileBase, "0000000"); // ✅ 此处可以正常打印 Base64 字符串

          // 构建参数并请求接口
          const params = {
						...getFatherPageOldProductResData(),
            file: base64String, // ✅ 正确传入
            cComponentTable: cComponentTableValue,
            cAppNo: opertaor.getDataAll().plyBase["Base.cAppNo"],
          };
          if(route.params.param?.pageName === "priceInquiry") {
            params['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
          }
          // 02大类和01部分产品导入清单时需要先调用保存再执行操作，避免清单更新后刷新条款时丢失未保存的条款数据
          if((route.params.param?.cProdNo.startsWith('02') || cProdNos.includes(route.params.param?.cProdNo)) && !props.compKey?.includes('DeductibleDist')) {
            const savePlyInfo = await opertaor.getFatherPage().savePlyInfo();
            if(!savePlyInfo) return;
          }
          policyService.importDistIncrement(params).then((res:any) => {
            btnDisabled.value = false
            if (res.code === 200) {
              titleInfo.value = {
                successes: res.data.successes,
                fails: res.data.fails,
              };
              ElMessage.success(`导入完成：${res.data.msg}`);
              method.handleQuery();
            } else {
              ElMessage.error(res.msg || "增量导入失败");
            }
          }).catch((error) => {
            ElMessage.error("导入出错，请检查文件格式或内容");
            console.error("导入错误：", error);
            btnDisabled.value = false
          });
        };

        reader.onerror = (e) => {
          ElMessage.error("文件读取失败");
          btnDisabled.value = false
        };

        reader.readAsDataURL(file); // 启动读取
      }
    };
    input.oncancel = () => {
      btnDisabled.value = false
    };
    input.click(); // 触发文件选择对话框
  },
  //全量模板下载-模板下载
  downloadTemp: () => {
    const param = {
      ...getFatherPageOldProductResData(),
    }
    formconfig11.value?.fromSchema?.forEach((item:any) => {
      const it = param.fromSchema.find((i:any) => i.prop === item.prop)
      if(item.rules && it) {
        it.rules = item.rules
      }
    })
    if(route.params.param?.pageName === "priceInquiry") {
      param['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
    } else {
      param['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
    }
    policyService
        .downloadDistTemplate(param)
        .then((res) => {
          if (res.size <= 0) {
            ElMessage.error({ message: "下载出错", duration: 3000 });
            return;
          }
          const fileName = decodeURIComponent(res.headers['content-disposition'].split('filename=')[1]);
          const blob = new Blob([res.data], {
            responseType:res.headers["content-type"]
            // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8",
          });
          saveAs(blob, fileName);
        })
        .catch(() => {
          ElMessage.error("模板下载失败");
        });
  },
  // 增量模板下载
  downloadIncrement: () => {
    const param = {
      ...getFatherPageOldProductResData(),
      cComponentTable: cComponentTableValue,
    }
    if(route.params.param?.pageName === "priceInquiry") {
      param['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
    } else {
      param['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
    }
    policyService
        .downloadDistTemplateIncrement(param)
        .then((res) => {
          if (res.data.size  <= 0) {
            ElMessage.error({ message: "未发现导入失败的异常数据！", duration: 3000 });
            return;
          }
          const fileName = decodeURIComponent(res.headers['content-disposition'].split('filename=')[1]);
          const blob = new Blob([res.data], {
            responseType:res.headers["content-type"]
            // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8",
          });
          saveAs(blob, fileName);
        })
        .catch((err) => {
          ElMessage.error(err.msg || "异常数据下载失败");
        });
  },
  setregistAdd(){
    const ads = distTableRef?.value?.getValue('Dist.AllProp');
    const a = distTableRef?.value?.getValue("Dist.cRegisterSuffixAddr") || "";
    if (ads) {
      getAddressStr({ address: ads }).then((res: any) => {
        const { code, data, msg } = res;
        if (code === 200) {
          const b = (data ? data['addStr'] : "") + a;
          setAddressStr("Dist.cClntAddr", b);
        }
      });
    } else {
      setAddressStr("Dist.cClntAddr", a);
    }
  },
  // 批量删除
  async batchDelete() {
    let cappNo = '';
    // 判断有无批改类型参数，有则是批单
    if(route.params.param?.cEdrType) {
    	const edrbase = opertaor.getFatherPage().getEdrbaseValue();
      cappNo = edrbase['EdrBase.cAppNo'];
    } else if(route.params.param?.pageName === "priceInquiry") {
      cappNo = opertaor.getDataAll().plyBase["Base.cInquiryNo"];
    } else {
      cappNo = opertaor.getDataAll().plyBase["Base.cAppNo"];
    }
    if (!cappNo) {
      ElMessage.warning('请先保存申请单'); // 提示用户保存投保单
      return;
    }
    if (selectedRows.value.length === 0) {
      ElMessage.warning("请先选择要删除的数据");
      return;
    }
    const param:any = {
      cComponentTable: cComponentTableValue,
      // cPkId: selectedRows.value.map((row: any) => row['Dist.cPkId']),
    }
    if (route.params.param?.pageName === "priceInquiry") {
      param['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
    } else {
      param['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
    }
    // 02大类和01部分产品删除清单时需要先调用保存再执行操作，避免清单更新后刷新条款时丢失未保存的条款数据
    if((route.params.param?.cProdNo.startsWith('02') || cProdNos.includes(route.params.param?.cProdNo)) && !props.compKey?.includes('DeductibleDist')) {
      const savePlyInfo = await opertaor.getFatherPage().savePlyInfo();
      if(!savePlyInfo) return;
    }
    // 增加是否删除全部判断，选是删除全部，选否删除选中项
    if (pageresult.total > 10 && selectedRows.value.length === 10) {
      ElMessageBox.confirm(
        "是否删除全部？",
        "提示",
        {
          confirmButtonText: "是",
          cancelButtonText: "否",
          type: "warning",
          distinguishCancelAndClose: true,// 区分关闭和取消
        }
      ).then(async () => {// 选是则删除所有清单数据 接口不传cPkId
        const res:any = await deleteDistCheck(param);
        deleteDist(param).then(async(res: any) => {
          if (res.code === 200) {
            ElMessage.success("删除成功");
            const queryParams = distTableRef.value?.getPartnerPage(false);
            method.handleQuery(queryParams, true);
          } else {
            ElMessage.error(res.msg);
          }
        }).catch((err:any) => {
          ElMessage.error(err.msg)
        })
      }).catch(async (action:any) => {// 选否则删除本页选中数据
        if(action === 'close') return; // 关闭不做任何操作
        param['cPkId'] = selectedRows.value.map((row: any) => row['Dist.cPkId']);
        const res:any = await deleteDistCheck(param);
        deleteDist(param).then(async(res: any) => {
          if (res.code === 200) {
            ElMessage.success("删除成功");
            const queryParams = distTableRef.value?.getPartnerPage(false);
            method.handleQuery(queryParams, true);
          } else {
            ElMessage.error(res.msg);
          }
        }).catch((err:any) => {
          ElMessage.error(err.msg)
        })
      });
    } else {
      param['cPkId'] = selectedRows.value.map((row: any) => row['Dist.cPkId']);
      const res:any = await deleteDistCheck(param);
      const checkMsg = res.code === 500 ? res.msg : "是否确认删除选中的数据？";

      ElMessageBox.confirm(
          checkMsg,
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
      ).then(() => {
        deleteDist(param).then(async(res: any) => {
          if (res.code === 200) {
            ElMessage.success("删除成功");
            const queryParams = distTableRef.value?.getPartnerPage(false);
            method.handleQuery(queryParams, true);
          } else {
            ElMessage.error(res.msg);
          }
        }).catch((err:any) => {
          ElMessage.error(err.msg)
        })
      });
    }
  }
};

// 复选框选中
const selectedRows = ref<any[]>([]);
function handleSelectionChange(selection: any) {
  selectedRows.value = selection;
}

watch(
  () => pageresult.list,
  async (item) => {
    if((route.params.param?.cProdNo === '040003' || route.params.param?.cProdNo === '059002') && cardconfig.value.title === "销售区域清单" && item.length > 0) {
      getSummary()
    }
    let totalList = pageresult.list;
    if(pageresult.total > 10) {
      const total = await getTableDataAll();
      if(total.length > 10) {
        totalList = total;
      }
    }
    // 043022 特种设备第三者责任保险 条款信息中：“投保设备数量”，需要根据<特种设备清单信息>进行汇总
    // 041014 特种设备责任险 条款信息中：“投保设备数量”，需要根据<特种设备清单信息>进行汇总 标的信息中：特种设备数量与清单数量一致
    if(route.params.param?.cProdNo === '043022' || route.params.param?.cProdNo === '041014') {
      const num = totalList.length || 0;
      opertaor.getTableRefs()['tgt']?.setValue('Tgt.nDevicesNumber',num);
      const interval = setInterval(() => {
        const cvrgData = opertaor.getTableRefs()['cvrg']?.getFromValue();
        if(cvrgData && cvrgData.length > 0) {
          clearInterval(interval)
          const nEquipmentCount:any = {};
          totalList.forEach((i:any) => {
            if(nEquipmentCount[i['Dist.cPlanNo']]) {
              nEquipmentCount[i['Dist.cPlanNo']] += 1
            } else {
              nEquipmentCount[i['Dist.cPlanNo']] = 1
            }
          })
          Object.keys(nEquipmentCount).forEach((item:any) => {
            const cTermNo = cvrgData.find((n:any) => n['Term.cPlanNo'] === item)?.['Term.cUniqueTermNo']
            opertaor.getTableRefs()['cvrg']?.setTermData({
              termNo:cTermNo,
              planNo:item,
              factorProp: 'Term.nEquipmentCount',
            },nEquipmentCount[item]);
          })
        }
      }, 500)
    }
    // 047003 非机动车第三者责任保险 标的信息中：“投保总座位数（座）”要素，由清单中“投保座位数”汇总；“投保总车辆数（个）”要素，由清单中总车辆汇总；
    if(route.params.param?.cProdNo === '047003') {
      const carNum = totalList.length || 0;
      const seatNum = totalList.map(item => Number(item['Dist.nInsuredSeats']) || 0).reduce((total, value) => total + value, 0)
      opertaor.getTableRefs()['tgt']?.setValue('Tgt.nTotalSeats',seatNum)
      opertaor.getTableRefs()['tgt']?.setValue('Tgt.nTotalCars',carNum)
    }
    // 049001 食品卫生责任险 条款中的关联地址数量根据清单进行汇总
    // 043005 机动车停车场责任险 条款信息中：关联地址数量、关联地址车位总数根据清单进行汇总
    // 043004 火灾公众责任险 条款中的关联地址数量根据清单进行汇总
    // 043011 户外广告媒体公众责任保险 条款信息中：“关联地址数量”，需要根据<标的地址清单>统计该方案下的地址数量；
    // 041011 食品安全责任险 条款中的关联地址数量根据清单进行汇总
    const nAddressCountProdNoMap = ['049001','043005','043004','043011','041011'];
    if(nAddressCountProdNoMap.includes(route.params.param?.cProdNo)) {
      const interval = setInterval(() => {
        const cvrgData = opertaor.getTableRefs()['cvrg']?.getFromValue();
        if(cvrgData && cvrgData.length > 0) {
          clearInterval(interval)
          const planNoNum:any = {};
          totalList.forEach((i:any) => {
            if(planNoNum[i['Dist.cPlanNo']]) {
              planNoNum[i['Dist.cPlanNo']] += 1
            } else {
              planNoNum[i['Dist.cPlanNo']] = 1
            }
          })
          Object.keys(planNoNum).forEach((item:any) => {
            const cTermNo = cvrgData.find((n:any) => n['Term.cPlanNo'] === item)?.['Term.cUniqueTermNo']
            opertaor.getTableRefs()['cvrg']?.setTermData({
              termNo:cTermNo,
              planNo:item,
              factorProp: 'Term.nAddressCount',
            },planNoNum[item]);
          })
          if(route.params.param?.cProdNo === '043005') {
            const parkingNum:any = {};
            totalList.forEach((i:any) => {
              if(parkingNum[i['Dist.cPlanNo']]) {
                parkingNum[i['Dist.cPlanNo']] += Number(i["Dist.nParkingNumber"]) || 0
              } else {
                parkingNum[i['Dist.cPlanNo']] = Number(i["Dist.nParkingNumber"]) || 0
              }
            })
            Object.keys(parkingNum).forEach((item:any) => {
              const cTermNo = cvrgData.find((n:any) => n['Term.cPlanNo'] === item)?.['Term.cUniqueTermNo']
              opertaor.getTableRefs()['cvrg']?.setTermData({
                termNo:cTermNo,
                planNo:item,
                factorProp: 'Term.nParkingTotal',
              },parkingNum[item]);
            })
          }
        }
      }, 500)
    }

    // 041007 条款中的关联被保险人数量由清单中的关联监护人进行汇总;被监护人数量由清单中的被监护人姓名汇总
    if(route.params.param?.cProdNo === '041007') {
      const num = totalList.length || 0;
      if(route.params.param?.cGrpMrk == "1") {
        opertaor.getTableRefs()['cvrg']?.setTermData({
          termNo:route.params.param?.cTermNo,
          planNo:'P1',
          factorProp: 'Term.nRelatedInsuredCount',
        },num);
      }
      opertaor.getTableRefs()['cvrg']?.setTermData({
        termNo:route.params.param?.cTermNo,
        planNo:'P1',
        factorProp: 'Term.nWardTotal',
      },num);
    }
    // 040021 标的信息 预估集装箱吞吐总量 预估散货吞吐总量的值根据清单中的对应字段进行汇总
    // 040021 条款信息中 关联地址数量 合计码头作业吞吐量(箱) 合计码头作业吞吐量(吨) 的值根据清单中的对应字段进行汇总
    if(route.params.param?.cProdNo === '040021') {
      const nContainerThroughput = totalList.map(item => Number(item['Dist.nBoxesNumber']) || 0).reduce((total, value) => total + value, 0)
      const nBulkThroughput = totalList.map(item => Number(item['Dist.nGoodsTonnage']) || 0).reduce((total, value) => total + value, 0)
      opertaor.getTableRefs()['tgt']?.setValue('Tgt.nContainerThroughput',nContainerThroughput)
      opertaor.getTableRefs()['tgt']?.setValue('Tgt.nBulkThroughput',nBulkThroughput)
      // 需要根据方案号进行分类汇总，并赋值到对应方案的条款中
      const cPlanNoObj:any = {};
      totalList.forEach((item:any) => {
        const cPlanNo = item['Dist.cPlanNo']
        const num1 = 1;
        const num2 = Number(item['Dist.nBoxesNumber']) || 0;
        const num3 = Number(item['Dist.nGoodsTonnage']) || 0;
        if(!cPlanNoObj[cPlanNo]) {
          cPlanNoObj[cPlanNo] = {};
        }
        cPlanNoObj[cPlanNo]['Term.nAddressCount'] = new Decimal(cPlanNoObj[cPlanNo]['Term.nAddressCount'] || 0).add(new Decimal(num1));
        cPlanNoObj[cPlanNo]['Term.nTerminalBox'] = new Decimal(cPlanNoObj[cPlanNo]['Term.nTerminalBox'] || 0).add(new Decimal(num2));
        cPlanNoObj[cPlanNo]['Term.nTerminalTon'] = new Decimal(cPlanNoObj[cPlanNo]['Term.nTerminalTon'] || 0).add(new Decimal(num3));
      })
      if(Object.keys(cPlanNoObj)?.length > 0) {
        Object.keys(cPlanNoObj).forEach((item:any) => {
          Object.keys(cPlanNoObj[item])?.forEach((i:any) => {
            opertaor.getTableRefs()['cvrg']?.setTermData({
              termNo:route.params.param?.cTermNo,
              planNo:item,
              factorProp: i,
            },cPlanNoObj[item][i]);
          })
        })
      }
    }
  }
)
const getSummary = async () => {
  let money = 0;
  let num = 0;
  const param = {};
  if(route.params.param?.pageName === "priceInquiry") {
    param.cInquiryNo = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
  } else if(route.params.param?.pageType === "EDR_APP_NEW_SCENE") {
    param.cAppNo = route.params.param?.cOrgAppNo;
  } else {
    param.cAppNo = route.params.param?.cAppNo || opertaor.getDataAll().plyBase["Base.cAppNo"]
  }
  await policyService.getEstimatedSalesAndEstimatedSalesQuantity(param).then((res:any) => {
    if(res.code === 200) {
      money = res.data.nEstimatedSales
      num = res.data.nEstimatedSalesQuantity
    }
  })
  const sums = ['','汇总','','',`总预计销售额 ${money}元`,`总预计销售量 ${num}件`]
  tableconfig.value.showSummary = true;
  tableconfig.value.summaryMethod = () => sums;
}

// 刷新保障信息
async function refreshCvrg() {
  // 如果是免赔信息则不刷新保障信息
  if(props.compKey?.includes('DeductibleDist')) return;
  if(route.params.param?.cProdNo.startsWith('02') || cProdNos.includes(route.params.param?.cProdNo)) {
    const cvrgRef = opertaor.getTableRefs()['cvrg'];
    try {
      const cComponentTable = props.compKey?.split('Dist')?.[0] + 'Dist';
      await cvrgRef?.getAddrSeqOptions(cComponentTable);
      cvrgRef?.refushCvrgInfo();
    } catch (ignore) {
    }
  }
}

function setUnDisabledByKeyList(key: any) {
  tableconfig.value.formconfig.endBtns?.forEach((item: any) => {
    if ("Btn_" + item.id === key) {
      item.hidden = false;
    }
  });
  tableconfig.value.formconfig.titleBtns?.forEach((item: any) => {
    if ("Btn_" + item.id === key) {
      item.hidden = false;
    }
  });
  tableconfig.value.tableBtn?.forEach((item: any) => {
    if ("Btn_" + item.id === key) {
      item.hidden = false;
    }
  });
}

function addCodeListMap (data: any) {
  distTableRef.value?.addCodeListMap(data);
}

function getFormconfig() {
  return {
    fromType: "custom",
  };
}
function setAddressStr(key: any, data: any) {
  applicantEditRef?.value?.setValue(key, data);
}
function getFromValue() {
  return applicantEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  applicantEditRef?.value?.setFormValue(value);
}

function validate() {
  return true;
}

function setValue(key: string, value: any) {
  applicantEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return applicantEditRef?.value?.getValue(key);
}

function getTableData() {
  return pageresult.list
}

async function getTableDataAll() {
  const s = cardRef.value?.getFromValue() || {};
  // 经营地址只选择省市区不输入详细地址获取表单值会带有undefined，这里处理一下
  for (let k in s) {
    if(s[k] && typeof s[k] === 'string' && s[k].indexOf('undefined') !== -1) {
      s[k] = s[k].replace('undefined', '')
    }
  }
  const param = opertaor.getParam();
  let app = "";
  if (opertaor.getDataAll()?.plyBase["Base.cAppNo"]) {
    app = opertaor.getDataAll().plyBase["Base.cAppNo"];
  } else if(param.cOrgAppNo){
    app = param.cOrgAppNo;
  } else if(param.pageType !== "copy") {
    app = param.cAppNo
  }
  const selData:any = {
    cAppNo: "",
    cComponentTable: cComponentTableValue,
    cClauseCode: route.params.param?.cTermNo, //条款编码  
    cProdNo: route.params.param?.cProdNo,  //产品号
    ...formconfig1.value,
    pageNum: 1,
    pageSize: 99999
  };
  selData.dist = JSON.parse(JSON.stringify(s))
  if(route.params.param?.pageName === "priceInquiry") {
    selData['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
    if(!selData['cInquiryNo']){
      return []
    }
  } else {
    selData['cAppNo'] = app;
    if(!selData['cAppNo']){
      return []
    }
  }
  if(route.params.param?.pageType && route.params.param?.pageType === "EDR_APP_NEW_SCENE") {
    selData.voType = "ply"
  }
  // 级联地址表格显示问题处理
  if(Object.keys(mapAddr).includes(props.compKey)) {
    const addrInput = mapAddr[props.compKey];
    const keys = Object.keys(addrInput)
    if(keys && keys.length>0) {
      const inputGroupKey = keys[0];
      const addrValueKey = addrInput[inputGroupKey];
      selData.dist[addrValueKey] = selData.dist[inputGroupKey];
    }
  }
  const res:any = await selectDist(selData);
  if (res.code === 200) {
    return res.data.data?.length > 0 ? res.data.data : []
  } else {
    ElMessage.error(res.msg)
    return []
  }
}

function setTableData(data: any, total:any) {
  pageresult.list = data.map((item: any, index: any) => {
		let dataNew:any = {}
		if(!!item['Dist.cMajorCategories'] || !!item['Dist.cMediumClassification'] || !!item['Dist.cOccupationalSubcategory']){
			dataNew['Dist.AllOccup'] = [
					item['Dist.cMajorCategories'], item['Dist.cMediumClassification'], item['Dist.cOccupationalSubcategory']
			]
		}
		if(!!item['Dist.tOpeningTime']){
			dataNew['tOpeningTime'] = item['Dist.tOpeningTime']? moment(item['Dist.tOpeningTime']).format("YYYY-MM-DD"): null
		}
    return{
      ... item,
			... dataNew,
      ... {
        nSeqNo: index + 1,
      }
    };
  });
  pageresult.total = total || 0;
}

function handleQuery() {
  isQuery.value = true
  const queryParams = distTableRef.value?.getPartnerPage(true);
  method.handleQuery(queryParams);
}

// 绑定特殊验证器
const exRules = {};

onUnmounted(() => {
  eventBus.off(`setMap-${props.compKey}`, addCodeListMap);
});

// 获取页面初始化的时候获取的组件配置信息
function getFatherPageOldProductResData() {
  if(opertaor.getFatherPage() && opertaor.getFatherPage().getOldProductResData() && opertaor.getFatherPage().getOldProductResData()[0]?.pageInfo) {
    oldPageSchema.value = opertaor.getFatherPage().getOldProductResData()[0]?.pageInfo.find((item: any) => item.pageCode === props.compKey).pageSchema || {};
    // 如果团个单标识为团单则展示关联被保险人，否则隐藏
    if(route.params.param?.cGrpMrk !== '1') {
      oldPageSchema.value.fromSchema = oldPageSchema.value.fromSchema.filter((item:any) => item.prop !== 'Dist.cRelatedInsured')
    }
    // 关联实际用工地址添加下拉选项
    if(props.compKey === 'EmployeeDist043009') {
      oldPageSchema.value.fromSchema.forEach((item: any) => {
        if(item.prop === 'Dist.cEmploymentAddress') {
          const list = opertaor.getTableRefByKey('ProjectDist043009')?.getTableData()
          item.loadData = list.length > 0 ? list.map((i:any) => ({
            label: i['Dist.cDetailedAddress'],
            value: i['Dist.cPkId']
          })) : []
        }
      });
		}
		// 团单营业场所地址清单关联被保险人清单
    if(cRelatedInsuredflag.value) {
			oldPageSchema.value.fromSchema.forEach((item: any) => {
        if(item.prop === 'Dist.cRelatedInsured') {
          const list = opertaor.getTableRefByKey('insuredDist')?.getTableData()
          item.loadData = list.length > 0 ? list.map((i:any) => ({
            label: i['InsuredDist.cInsuredNme'],
            value: i['InsuredDist.cPkId']
            // value: i['InsuredDist.cInsuredCde']
          })) : []
        }
      });
    }
  }
  return oldPageSchema.value;
}

function getFormConfig() {
  return tableconfig.value;
}

function setDisabledAll() {
  tableconfig.value.formconfig?.endBtns?.forEach((item: any) => {
    item.hidden = true;
  });
  tableconfig.value.formconfig?.titleBtns?.forEach((item: any) => {
    item.hidden = true;
  });
  tableconfig.value.tableBtn?.forEach((item: any) => {
    item.hidden = true;
  });
}

async function updateCvrgnInsuranceAmount() {
  const termref = opertaor.getTableRefByKey("cvrg");
  const cvrgData = termref?.getFromValue();
  const mainTermData = cvrgData.find((item:any) => item['Term.cRdrTyp'] === '0');
  const riskList = mainTermData?.['Term.riskList'];
  if(riskList?.length > 0) {
    const distDataAll = await getTableDataAll();
    riskList.forEach((item:any) => {
      const cDistCodeNo = item['TermRisktgt.cDistCodeNo']
      const nInsuranceAmount = distDataAll.find((i:any) => i['Dist.cCodeNo'] == cDistCodeNo)?.['Dist.nInsuranceAmount'];
      termref?.setTermData({
        termNo:mainTermData['Term.cUniqueTermNo'],
        planNo:mainTermData['Term.cPlanNo'],
        factorProp: 'TermRisktgt.nInsuranceAmount',
        riskNo: item['TermRisktgt.cLiabCode']
      },nInsuranceAmount);  
    })
  }
}

defineExpose({
  getValue,
  setValue,
  getFromValue,
  setFormValue,
  getFormconfig,
  setUnDisabledByKeyList,
  handleQuery,
  getTableData,
  setTableData,
  getFormConfig,
  setDisabledAll,
  getTableDataAll,
});
</script>

<style scoped>
:deep(.el-card__body .freeedit .searchbar .el-card__header) {
  display: none;
}
</style>

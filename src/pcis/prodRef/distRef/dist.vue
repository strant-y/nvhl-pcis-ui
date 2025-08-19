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
  AppGridEditMethod,
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
  deleteDist,
  distMapCollectCompKey,
  downloadDistTemplate,
  syncDist,
  exportDist
} from "@/api/prod/index";
import { getAddressStr } from "@/api/query";
import { saveAs } from "file-saver";
import moment from "moment";
import { formInit } from "@/shared/from-init";
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
const policyService = new PolicyService();
import { CardConfig, creatCardConfig, MyCardMethod } from "@/shared/mytemplate/card-config";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { useRoute } from "vue-router";
import { runInThisContext } from "vm";
import { AppFreeEditMethod, createAppFreeEditConfig } from "@/shared/app-free-edit-config";
import {eventBus} from "@/utils/event-bus";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const route = useRoute();
const dialog = ref<DialogMethod | null>(null);
const opertaor = dataOpertaor();
const params = opertaor.getParam(); 

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
  compKey: {
    type: String
  }
});
watch(
    () => opertaor.getTableRefs()['tgt']?.getFromValue()?.['Tgt.cIsinsuranceRegistered'],
    (n, o) => {
 
        if (n) {
          // 学生岗位 Dist.cJobType
            if(params.cProdNo === '043010'){
                  formconfig11.value.fromSchema?.forEach(item=>{
                          if(n == 1 && item.prop !=='Dist.nSeqNo'){
                            item['rules'] = [{ required: true, message: '该项为必填项', trigger: 'blur' }];
                          }else if(item.prop !=='Dist.nSeqNo' && item.prop !=='Dist.cJobType') {
                            item['rules'] =[];
                          }
                  })
            }
        }
    },
    {
        deep: true,
        immediate: true
    }
)
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
const idxParam = inject('idxParam');
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
  // if(params.cProdNo === '040003'){
  //   formconfig11.value.fromSchema?.forEach(item=>{
  //     if(item['prop'] ==='Dist.cProductType'){
  //       item['typeCode'] = 'Product_Type040003';
  //     }
  //   })
  // }


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
          label: "查询",
          type: "primary",
          func: () => {
						handleQuery()
          },
        },
        {
          label: "重置",
          type: "primary",
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
  formconfig1.value.fromSchema.forEach((e: any)=>{  // 隐藏不需要显示在表格内的数据
    if(e.cShowLocation === '0'){
      e.isShow = false
    }
    return e;
  });
  tableconfig.value.fromSchema = formconfig1.value.fromSchema.map((item:any) => {
    if(item.prop === "Dist.nSeqNo" || item.title === "序号") {
      item.width = 60
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
        }
      })
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
          rowData: row,
          tab: formconfig1.value.title,
          compKey: props.compKey,
          codeListMap: distTableRef.value?.getCodeListMap(),
        },
        {
          isOk: (res: any) => {
            const queryParams = distTableRef.value?.getPartnerPage(false);
            handleQuery: method.handleQuery(queryParams);
          },
        },
        { width: "60" }
    );
    }
    
  },
  delmethod: (row: any) => {
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
    const param = {
      cComponentTable: cComponentTableValue,
      cPkId: [row['Dist.cPkId']],
    }
    if(route.params.param?.pageName === "priceInquiry") {
      param['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
    } else {
      param['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
    }
    deleteDist(param).then((res: any) => {
      if (res.code === 200) {
        ElMessage.success("删除成功");
        const queryParams = distTableRef.value?.getPartnerPage(false);
        method.handleQuery(queryParams, true);
      }
    });
  },
  // 投保座位总数
  nSeatCapacityChange:(val:any)=>{
    console.log('111',val)
  },

  //  042003 根据电梯条数反
  funcdistadd: () => {
    const alldata: any = opertaor.getDataAll();
    const param:any = {};
    if(route.params.param?.pageName === "priceInquiry") {
      param['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
    } else if (route.params.param?.pageType === "EDR_APP_NEW_SCENE") {
    	const edrbase = opertaor.getFatherPage().getEdrbaseValue();
      param['cAppNo'] = edrbase["EdrBase.cAppNo"]
    } else {
      param['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
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
            },
            {
              isOk: (res: any) => {
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
			cProdNo: route.params.param.cProdNo,
			cComponentTable: cComponentTableValue,
            cClauseCode: route.params.param.cTermNo, //条款编码  
            cProdNo: route.params.param.cProdNo,  //产品号
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
          return{
            ... item,
            ... data
          };
        });
        // 040005学生人数（人） 地址清单信息人数 回填
        if( props.compKey === 'AddressDist040005' ){
             let peopleNumber: number | null = null;
              pageresult.list.forEach((item:any)=>{
                    peopleNumber+= item['Dist.nInsuredNumber']  || 0
              })
          tgtRef.setValue('Tgt.nStudentsNumber',peopleNumber)
        }

        // 020001  货物数量 回填
        if( props.compKey === 'CargoDist020001' ){
             let nGoodsNum: number | null = null;
              pageresult.list.forEach((item:any)=>{
                    nGoodsNum+= item['Dist.nNum'] || 0
              })
          tgtRef.setValue('Tgt.nGoodsNum',nGoodsNum)
        }




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

        // 刷新汇总表格
        if(distSummaryRef.value) {
          distSummaryRef.value?.handleQuery();
        }

        if(idxParam && isChange) { // 保存清单表格在屏幕中间
          idxParam.handleAnchorClick(undefined, `#${props.compKey}`);
        }
        // 刷新条款表格
        const termref = opertaor.getTableRefByKey("cvrg");
        const hasRel = res.data.hasRel;
        const hasPlan = res.data.hasPlan;
        const clauseValues = res.data.clauseValues;

        if(hasRel == false){
            return;
        }
        if(clauseValues.length == 0){
            return;
        }
        // 区分方案
        if(hasPlan){
            clauseValues.forEach(item => {
                termref.setTermData({
                    termNo: route.params.param.cTermNo,
                    planNo: item.planNo,
                    factorProp: item.field,
                }, item.countNumber);
            });
        } else{
            clauseValues.forEach(item => {
                termref.setTermData({
                    termNo: route.params.param.cTermNo,
                    factorProp: item.field,
                }, item.countNumber);
            });
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
            },
            {
              isOk: (res: any) => {
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
    getFatherPageOldProductResData();
		const s = cardRef.value?.getFromValue(); // 查询参数
		// 经营地址只选择省市区不输入详细地址获取表单值会带有undefined，这里处理一下
		for (let k in s) {
			if(s[k] && typeof s[k] === 'string' && s[k].indexOf('undefined') !== -1) {
				s[k] = s[k].replace('undefined', '')
			}
		}
    let paramitem  = Object.assign({...oldPageSchema.value}, {
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
				paramitem.dist[addrValueKey] = paramitem.dist[inputGroupKey];
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
    getFatherPageOldProductResData();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls, .xlsm'; // 支持的文件类型
    input.onchange = () => {
      if (input.files?.length) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
          const base64String = e.target?.result as string;

          // ✅ 此处赋值有效
          // fileBase = base64String.split(',')[1]; // 去掉 data:image/type;base64, 前缀

          // console.log(fileBase, "0000000"); // ✅ 此处可以正常打印 Base64 字符串

          // 构建参数并请求接口
          const params = {
            ...oldPageSchema.value,
            file: base64String, // ✅ 正确传入
            cComponentTable: cComponentTableValue,
          };
          if(route.params.param?.pageName === "priceInquiry") {
            params['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
          } else {
            params['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
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
          });addCi
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
    getFatherPageOldProductResData();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls, .xlsm'; // 支持的文件类型
    input.onchange = () => {
      if (input.files?.length) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
          const base64String = e.target?.result as string;

          // ✅ 此处赋值有效
          // fileBase = base64String.split(',')[1]; // 去掉 data:image/type;base64, 前缀

          // console.log(fileBase, "0000000"); // ✅ 此处可以正常打印 Base64 字符串

          // 构建参数并请求接口
          const params = {
						...oldPageSchema.value,
            file: base64String, // ✅ 正确传入
            cComponentTable: cComponentTableValue,
            cAppNo: opertaor.getDataAll().plyBase["Base.cAppNo"],
          };
          if(route.params.param?.pageName === "priceInquiry") {
            params['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
          }

          policyService.importDistIncrement(params).then((res) => {
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
          });
        };

        reader.onerror = (e) => {
          ElMessage.error("文件读取失败");
        };

        reader.readAsDataURL(file); // 启动读取
      }
    };
    input.click(); // 触发文件选择对话框
  },
  //全量模板下载-模板下载
  downloadTemp: () => {
    getFatherPageOldProductResData();
    const param = {
      ...oldPageSchema.value,
    }
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
    getFatherPageOldProductResData();
    const param = {
      ...oldPageSchema.value,
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
  batchDelete() {
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
    ElMessageBox.confirm(
      "是否确认删除选中的数据？",
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    ).then(() => {
      const param = {
        cComponentTable: cComponentTableValue,
        cPkId: selectedRows.value.map((row: any) => row['Dist.cPkId']),
      }
      if(route.params.param?.pageName === "priceInquiry") {
        param['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
      } else {
        param['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
      }
      deleteDist(param).then(async(res: any) => {
        if (res.code === 200) {
          ElMessage.success("删除成功");
          const queryParams = distTableRef.value?.getPartnerPage(false);
          method.handleQuery(queryParams, true);
        }
      });
    });
  }
};

// 复选框选中
const selectedRows = ref<any[]>([]);
function handleSelectionChange(selection: any) {
  selectedRows.value = selection;
}

watch(
  () => pageresult.list,
  (item) => {
    if(params.cProdNo === '040003' && cardconfig.value.title === "销售区域清单" && item.length > 0) {
      getSummary()
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
  }
}
function getFormConfig() {
  return tableconfig.value;
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
  getFormConfig
});
</script>

<style scoped></style>

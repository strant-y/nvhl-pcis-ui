<template>
  <div>
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
    <comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  AppTableConfig,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { useRoute } from "vue-router";
const route = useRoute();
import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";
import { saveDist } from "@/api/prod";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { codeListViewStore } from "@/store";
import {getAddressStr} from "@/api/query";
import {eventBus} from "@/utils/event-bus";
import {calculateAgeFromIdCard} from "@/utils/common";
import {DialogMethod} from "@/common/dzmodel/ComDialogConf";
import moment from "moment";
import { deductibleTemple,deductibleKey, fillTemplate } from "@/pcis/prodRef/cvrgRef/titleTemple";
import { validateIdCard } from "@/typings/method-public";
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const param = ref({});
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const dialog = ref<DialogMethod | null>(null);

const { getRules } = useValidator();
const tableRef = ref<MyTableMethod | null>(null);
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const params = opertaor.getParam();
const firstInvoiceCur = ref('');

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
  rowData: {
    type: Object,
    default: () => ({}),
  },
});

const init = ref(true)

const cComponentTable = computed(() => props.data.compKey ? props.data.compKey.replace(/\d+/g, '') : "");

const mapAddr = {
  "AddressDist040001": {
    "Dist.JingyingAddress": "Dist.cDetailedAddress"
  },
  "AddressDist040005": {
    "Dist.SchoolAddressProp": "Dist.cDetailedAddress"
  },
  "AddressDist041001": {
    // "Dist.JingYingAddress043009": "Dist.cDetailedAddress"
    "Dist.cDetailedAddress": "Dist.cDetailedAddress"
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

const dataParams = ref({});
const appNo = ref("");
const cGrpMrk = ref("");
const emits = defineEmits(["handleClose"]);
const formconfigdist = ref<Record<string, any>>({});
const formconfig1 = ref<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "新增信息",
    fromSchema: [],
    fromUi: createFromUiConfig({
      cols: 2,
    }),
    titleBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "确定",
        func: async () => {
            const productNo = route.params?.param?.cProdNo;
            const idNumber = getValue('Dist.cIdentificationNumber'); // 证件号码
            const tBirthDate = getValue('Dist.tBirthDate'); // 出生年月（假设字段名，需替换为实际字段）
 
            // 针对049020、041007产品进行二选一校验
            const targetProducts = ['049020', '041007'];
            if (targetProducts.includes(productNo)) {
              if (!idNumber && !tBirthDate) {
                ElMessage.error('出生年月和证件号码需至少填写一项');
                return; // 阻止后续保存逻辑
                }
            }
            // 047003、043003清单新增 车架号和车牌号码二选一
            const productsNoMap = ['047003','043003'];
            const cVinCode = getValue('Dist.cVinCode');
            const cPlateNumber = getValue('Dist.cPlateNumber')
            if (productsNoMap.includes(productNo)) {
              if (!cVinCode && !cPlateNumber) {
                ElMessage.error('车牌号码和车架号需至少填写一项');
                return; // 阻止后续保存逻辑
              }
            }
            const isValid = await freeEditRef.value?.validate();
            if(isValid){
            const s = freeEditRef.value?.getFromValue();
            if(!isObjectValid(s)){
              ElMessage.warning('所有字段都未填写请确认！')
              return false;
            }
            // 车辆清单信息
            if (s['Dist.nApprovedWeight'] && s['Dist.nApprovedWeight'] > 100000000000000000) {
                ElMessage.warning("核定载重不能超过 100 万吨，请重新输入")
                return false;
            }
            // 经营地址只选择省市区不输入详细地址获取表单值会带有undefined，这里处理一下
            for (let k in s) {
              if(s[k] && typeof s[k] === 'string' && s[k].indexOf('undefined') !== -1) {
                s[k] = s[k].replace('undefined', '')
              }
            }

            console.log('路由data‘',route.params)
            // return false;
            const params = Object.assign(
              {
                cProdNo: route.params.param.cProdNo,
                cComponentTable: cComponentTable.value,
                // cAppNo: appNo.value,
              },
              { dist: s }
            );
            if(params.dist['Dist.ProjectDesignProp']) {
              params.dist['Dist.cProjectAddress'] = params.dist['Dist.ProjectDesignProp']
            }
            if(route.params.param?.pageName === "priceInquiry") {
              params.cInquiryNo = opertaor.getDataAll().plyBase["Base.cInquiryNo"];
              params.dist['Dist.cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"];
            } else {
              params.cAppNo = opertaor.getDataAll().plyBase["Base.cAppNo"];
            }

						if(params.dist['Dist.tSalesTime']) {
              params.dist['Dist.tSalesTime'] = moment(params.dist['Dist.tSalesTime']).format("YYYY-MM-DD")
							}
						// AddressDist040001营业场所地址清单-Dist.cRelatedInsured关联被保险人
						if (params.dist['Dist.cRelatedInsured']) {
							params.dist['Dist.cRelatedInsured'] = params.dist['Dist.cRelatedInsured'].toString()
						}
            // 级联地址表格显示问题处理
            if(Object.keys(mapAddr).includes(props.data.compKey)) {
              const addrInput = mapAddr[props.data.compKey];
              const keys = Object.keys(addrInput)
              if(keys && keys.length>0) {
                const inputGroupKey = keys[0];
                const addrValueKey = addrInput[inputGroupKey];
                params.dist[addrValueKey] = params.dist[inputGroupKey];
              }
            }
            // 02大类和01部分产品保存清单时需要先调用保存再执行保存操作，避免清单更新后刷新条款时丢失未保存的条款数据
            const cProdNos = ['010001','010002','010003','010004','010020'];
            if((route.params.param?.cProdNo.startsWith('02') || cProdNos.includes(route.params.param?.cProdNo)) && !props.data.compKey?.includes('DeductibleDist')) {
              const savePlyInfo = await opertaor.getFatherPage().savePlyInfo();
              if(!savePlyInfo) return;
            }
            formconfig1.value.titleBtns[0].loading = true
            saveDist(params).then((res:any) => {
              formconfig1.value.titleBtns[0].loading = false
              if (res.code === 200) {
                // const cvrgRef = opertaor.getTableRefs()['cvrg'];
                // if(cvrgRef) {
                //   cvrgRef.refushCvrgInfo();
                // }
                ElMessage.success(res.msg);
                emits("handleClose");
                const addedPlan = getValue('Dist.cPlanNo');

                if(!!props.method.isOk && typeof props.method.isOk === 'function') {
                  props.method.isOk({...res, addedPlan});
                }
              } else {
                ElMessage.error(res.msg);
              }
            }).catch((err:any) => {
              formconfig1.value.titleBtns[0].loading = false
              ElMessage.error(err.msg);
            });
          }
          // freeEditRef.value?.validate().then(() => {
            
          // });
        },
      }),
      createFreeButtonBase({
        label: "取消",
        func: () => {
          emits("handleClose");
        },
      }),
    ],
  })
);
// 确定 非空校验：仅当所有属性都是空字符串时才拦截
const isObjectValid = (obj: any) => {
  if (Array.isArray(obj)) {
    return true;
  }

  if (!obj || typeof obj !== 'object' || !Object.keys(obj).length) {
    return false;
  }

  const values = Object.values(obj).map(v => {
    return typeof v === 'string' ? v.trim() : v;
  });
  const allEmpty = values.every(v => v == null || v === '');
  return !allEmpty;
};
onMounted(async () => {
  dataParams.value = opertaor.getDataAll();
  appNo.value = dataParams.value?.plyBase["Base.cAppNo"];
  cGrpMrk.value = route.params.param?.cGrpMrk;
  let newSchema = [];
  let cIs= opertaor.getTableRefs()['tgt']?.getFromValue()['Tgt.cIsinsuranceRegistered']  //  是否记名投保
  for(let i = 0; props.data.fromSchema && i < props.data.fromSchema.length; i++){
    let item = JSON.parse(JSON.stringify(props.data.fromSchema[i]));
    if(['Dist.AllOccup'].includes(item.prop)) {
      item["func"] = getDistoccupType;
    }else if (props.data.fromSchema[i]["func"]) {

    }
    if (props.data.fromSchema[i]["tableClick"]) {
      item["tableClick"] = props.data.fromSchema[i]["tableClick"];
    }

    // 040001产品 必填项问题
    if(item.prop =='Dist.cPlanNo' ||item.prop =='Dist.tOpeningTime' ||item.prop =='Dist.cLocationSigns' ||item.prop =='Dist.cFacilitySigns' ||item.prop =='Dist.cVenueSign' || item.prop =='Dist.cBuildingStructure'  ){
      item['rules'] = [{ required: true, message: '该项为必填项', trigger: 'blur' }];   
    }

    // 040002 证件号码 必填问题
    if( route.params.param.cProdNo == '040002' && item.prop =='Dist.cIdentificationNumber'){
         item['rules'] = [{ required: true, message: '该项为必填项', trigger: 'blur' }];
    }

    // 下面俩产品  出生年月 和 证号2选1   非必填
    const isCProdNo = ['049020','041007'].includes(route.params.param.cProdNo);
    if(isCProdNo  && item.prop =='Dist.cIdentificationNumber' ){
          item['rules'] = [];
    }
 
    if(item.cShowLocation === '1'){
      item["hidden"] = true;
    }
    if(item.prop ==='Dist.nSalesRevenue'){
      item['rules'] = [{ required: true, message: '该项为必填项', trigger: 'blur' },getRules("positiveNumber", {})];
    }
    // 车牌号校验 vehiclePlate
  if(item.prop =='Dist.cPlateNumber'){
     item['rules'] = [getRules("vehiclePlate", {})];
     item.iconInfo = "（新车未上牌，请在此录入【新车未上牌】）"
    }

    // 车架号校验
    // Dist.cVinCode  getRules   { rules: [getRules("faxNumber", {})] }
    // if(item.prop =='Dist.cVinCode'){
    //  item['rules'] = [getRules("required", {}), getRules("vinNumber", {})];
    // }
    // 043009 关联被保人
    if(item.prop === 'Dist.cRelatedInsured'){
      if(cGrpMrk.value === '1') {
        // const insured = opertaor.getDataAll()['insured'];
        // if (insured && insured['Insured.cInsuredCde']) {
        //   setTimeout(() => {
        //     setValue('Dist.cRelatedInsured', insured['Insured.cPkId']);
        //   }, 100);
        // }
				item["btnItems"]["func"] = cRelatedInsuredChange;
				item["btnItems"]["disabled"] = false;
      }else {
        item['rules'] = [];
        item["hidden"] = true;
      }
    }
     // 身份证类型自动回填年龄
    if(item.prop =='Dist.cIdentificationNumber'){
      item['func'] = (val: string) => {
        // 针对040005产品，自动回填出生年月
        if(route.params.param.cProdNo === '040005' && val && val.length === 18) {
          const birthDateFromId = val.substring(6, 14);
          const formattedBirthDate = `${birthDateFromId.substring(0, 4)}-${birthDateFromId.substring(4, 6)}-${birthDateFromId.substring(6, 8)}`;
          setValue('Dist.tBirthDate', formattedBirthDate);
          const age = calculateAgeFromIdCard(val);
          setValue('Dist.nAge', age);

        }
				if (val && val.length === 18) {
					 if (!validateIdCard(val) || getValue("Dist.cDocumentType") !== '111') {
						return false
					}
					const birthYear = parseInt(val.substring(6, 10), 10);
					const birthMonth = parseInt(val.substring(10, 12), 10);
					const birthDay = parseInt(val.substring(12, 14), 10);
					const birthday = `${birthYear}-${birthMonth.toString().padStart(2, "0")}-${birthDay.toString().padStart(2, "0")}`;
					const sexCode = parseInt(val.substring(16, 17), 10);
					const sex = sexCode % 2 === 0 ? "2" : "1"; // 1: 男, 2: 女
          const age = calculateAgeFromIdCard(val);
					if (route.params.param.cProdNo === '040019' || route.params.param.cProdNo === '047002') { 
						setValue("Dist.tBirthday", birthday);
						setValue("Dist.cGender", sex);
					}
          setValue('Dist.nAge', age);
        }
      }
    }

     // 针对040005产品 证件号码校验问题
    if(route.params.param.cProdNo === '040005' &&item.prop =='Dist.cIdentificationNumber'){
             item['rules'] = [getRules("idCard", {})];
    }
 
    // 040016 身份证必填
    if( route.params.param.cProdNo == '040016' && item.prop =='Dist.cIdentificationNumber' ){
        item['rules'] = [{ required: true, message: '该项为必填项', trigger: 'blur' }];
    }

        // 042003 证件号码 必填问题  Dist.cIdentificationNumber
    if( route.params.param.cProdNo == '042003' && item.prop =='Dist.cIdentificationNumber'){
         item['rules'] = [getRules("idCard", {})];
    }

    if(item.prop =='Dist.cEquipmentTypes'){
      item['btnItems']['func'] =  cEquipmentTypesFunc;
    }
        // 身份证类型自动回填年龄
    if(item.prop =='Dist.cDocumentType'){
      item['func'] =  cDocumentTypeChange;
    }
		// 040019 保全被申请人信息 身份证
		if (item.prop == 'Dist.cCertfCls') {
      item['func'] =  cCertfClsChange;
    }
		// 040019 保全被申请人信息 身份证
		if (route.params.param.cProdNo == '040019' && item.prop == 'Dist.cMobile') {
      item['rules'] = [getRules("phoneNo", {})];
    }
    if(item.prop == 'Dist.cInvoiceCur'){
        const distTableRef = opertaor.getTableRefByKey(props.data.compKey);
        const cargoList = distTableRef?.getTableData() || [];
        // 02开头的货物明细清单
        if(cComponentTable.value == "CargoDist" && route.params.param?.cProdNo.startsWith('02') && cargoList.length > 0 ){
            const firstRow = cargoList[0];
            firstInvoiceCur.value = firstRow['Dist.cInvoiceCur'] || 'CNY';
            // 已存在一条记录 → 后续新增只能选择该币种
            item.disabled = true;
            nextTick(() => setValue('Dist.cInvoiceCur', firstInvoiceCur.value))
        }
        item['func'] = InvoiceCurrencyChange;
    }

    if(item.prop =='Dist.nAdditiveCoefficient'){
      item['func'] =  nAdditiveCoefficientChange;
    }
    if(item.prop =='Dist.nInvoiceValue'){
      item['func'] =  nInvoiceValueChange;
    }
    if(item.prop =='Dist.cPrmCur'){
      item['func'] =  InsurancecurrencyChange;
    }
    if(item.prop =='Dist.nInsuranceAmount'){
      item['func'] =  nInsuranceAmountChange;
		}
		// 证件类型
		if(item.prop =='Dist.cIdType'){
      item['func'] =  cIdTypefun;
    }
    // if(item.prop =='Dist.HouseAreaProp'){
    //   item?.groupList.forEach(data => {
    //     data.rules = [{ required: true, message: '该项为必填项', trigger: 'blur' }];
    //   })
    // }

    // 电话校验
    if(item.prop =='Dist.cContactNumber'){
        item['rules'] = [getRules("phoneNo", {})];
    }
    // 联系方式
    if(item.prop =='Dist.cContactInformation'){
        item['rules'] = [getRules("phoneNo", {})];
    }

		// 邮编
		if(route.params.param.cProdNo?.startsWith('01')) {
      if(item.prop === 'Dist.cZipCde') {
        item.maxlength = 6
				item['rules'] = [
					getRules("required", {}),
        	getRules("signlessInt", {}),
        	getRules("specifyLength", { len: 6 }),
     	 	];
      }
  	}


    if(item.prop =='Dist.PropertyLocationProp'){
      item?.groupList.forEach(data => {
        data.rules = [{ required: true, message: '该项为必填项', trigger: 'blur' }];
      })
    }

    if(params.cEdrType === '1'){
      item.disabled = false;
      if(item.inputtype === 'rtinputgroup'){
        item.groupList.forEach(data => {
          data.disabled = false;
        })
      }
    }
    // if( route.params.param.cProdNo == '040016' && item.prop =='Dist.cDetailedAddress' ){
    //     item.disabled = true;
    // }
    // 实际用工地址清单新增 经营地址/房屋清单 房屋所在地址/营业场所地址清单043013 标的坐落地址
    // if(item.prop === 'Dist.JingYingAddress043009' || item.prop === 'Dist.HouseAreaProp' || item.prop === 'Dist.PropertyLocationProp'){
    //   item.groupList.forEach((data:any) => {
    //     if(data.prop === 'Dist.Prop') {
    //       data['func'] = setregistAdd;
    //     }
    //     if(data.prop === 'Dist.cSuffixAddr') {
    //       data['func'] = setregistAdd;
    //     }
    //   })
    // }
    if(item.inputtype === 'rtinputgroup' ){  // 地址组件,统一处理
      item.groupList.forEach((data:any) => {
        data['func'] = getAddressstr;
      })
    }
    if (item.prop === 'Dist.cPlanNo') {
      const termref = opertaor.getTableRefByKey('cvrg');
      const allPlans = termref.getPlanNo();   // 全部方案

      // 从父页面表格中获取已添加的方案
      const distTableRef = opertaor.getTableRefByKey(props.data.compKey);
      const getTableDataAll = await distTableRef?.getTableDataAll();
      const added = getTableDataAll?.length > 0 ? getTableDataAll.map((row:any) => row['Dist.cPlanNo']) : [];
      // 去重
      const uniqueAdded = [...new Set(added)]; 
      let nextIdx = 0;
      for(let j = 1; j < allPlans.length + 1; j++) {
        const planNo = 'P' + j;
        // 如果清单列表中没有某个方案号，则下一个方案号不可选 如：已添加[P1,P2],那么nextIdx = 2，第3个高亮，第4个置灰(3>2)
        if(!uniqueAdded.includes(planNo) || j === uniqueAdded.length) {
          nextIdx = j;   // 已添加的方案跳过
          break;
        }
      }

        item.typeCode = null;
        item.loadData = allPlans.map((p: any, idx: number) => ({
            ...p,
            disabled: idx > nextIdx     // 未开始
        }));
    }
    // 解决特种设备清单信息新增数据后点击编辑或新增，表单中特种设备种类的按钮无法点击
    if((route.params.param.cProdNo == '041014' || route.params.param.cProdNo == '043022') && item.prop =='Dist.cEquipmentTypes') {
      item.btnItems.disabled = false;
    }
    // 041007 如果证件号码为空，根据出生年月计算年龄
    if (item.prop === 'Dist.tBirthDate' && route.params.param.cProdNo == '041007') {
      item.func = (val:any) => {
        const cIdentificationNumber = getValue('Dist.cIdentificationNumber')
        if(val && !cIdentificationNumber) {
          const year = parseInt(val.split('-')[0])
          const month = parseInt(val.split('-')[1])
          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth() + 1;
          let age = currentYear - year;
          if(currentMonth < month) {// 如果当前月份 < 出生月份 年龄减1
            age--
          }
          setValue('Dist.nAge', age)
        }
      }
    }
    // 房屋建成日期不能大于投保日期
    if(item.prop === 'Dist.tCompletionDate' && route.params.param.cProdNo == '089005') {
      item.disabledDate = (time: Date) => {
        const tAppTm = opertaor.getDataAll().insrnc['Base.tAppTm'];
        return time.getTime() > new Date(tAppTm).getTime();
      }
      // 房屋使用年限 = 投保日期 - 房屋建成日期 向上取整
      item.func = (val:any) => {
        const tAppTm = opertaor.getDataAll().insrnc['Base.tAppTm'];
        const year = Math.ceil(moment(tAppTm).diff(moment(val), 'years', true));
        setValue('Dist.nServiceLife', year);
      }
    }
    // 090001 免赔种类选择后 分项责任根据选中的免赔种类查询下拉选项
    if(item.prop === 'Dist.cDeductibleClass' && route.params.param.cProdNo == '090001') {
      item.func = (val:any) => {
				if (!init.value) {
					setValue('Dist.cItemLiability', null)
				}
        if(val) {
          codeListStore
            .queryCodeList({
              codeListName: val == '02' ? 'mianpeileixing2' : 'mianpeileixing',
              codeListParam:{},
            })
						.then((res) => {
							setFormItem('Dist.cItemLiability', { loadData: res, multiple: val == '02' ? 0 : 1})
            });
        }
      }
    }
    // 免赔率、免赔额输入后自动生成免赔说明
    if(item.prop === 'Dist.nDductRate' || item.prop === 'Dist.nDductAmt') {
      item.func = (val:any) => {
        const nDductAmt = getValue("Dist.nDductAmt");
        const nDductRate = getValue("Dist.nDductRate");
        const k = (nDductAmt !== null && nDductAmt !== undefined ? '1':'0') + '' + (nDductRate !== null && nDductRate !== undefined ? '1':'0') ;
        const strt = deductibleTemple.value[k];
        if(strt){
          const filledString = fillTemplate(strt, {
            amount: nDductAmt,
            rate: nDductRate,
          });
          setValue("Dist.cDductDesc", filledString)
        } else {
          setValue("Dist.cDductDesc", "")
        }
      }
    }
    // 020018 运输范围省内运输时省份必填 车龄根据初登日期自动算出
    if(params?.cProdNo === '020018') {
      if(item.prop === 'Dist.cTransportScope') {
        item.func = (val:any) => {
          if(val === "Transport02001802") {// 省内运输 省份/直辖市必填
            setFormItem("Dist.cMunicipalityDirectly", { rules: [getRules("required", {})] })
          } else {
            setFormItem("Dist.cMunicipalityDirectly", { rules: [] })
          }
        }
      }
      if(item.prop === 'Dist.tRegistrationDate') {
        item.func = (val:any) => {
          if(val) {
            const days = Math.abs(moment(val).diff(moment(), 'days'));
            const age = (days / 365).toFixed(1);
            setValue("Dist.cVehicleAge", age)
          } else {
            setValue("Dist.cVehicleAge", "")
          }
        }
      }
    }
    if(item.prop === 'Dist.cInsuranceDuty') {
      item.func = (val:any) => {
        cInsuranceDutyChange(val)
      }
    }
    newSchema.push(item);
  }
  formconfig1.value.fromSchema = newSchema;
  
  formconfig1.value.title = props.data.title;
  if (props.data.title == "编辑") {
    setFormItem("Dist.nSeqNo", { disabled: true });
    setFormItem("Dist.nSalesRevenue", { disabled: true });
    // 如果 接口返回cSalesRegion 是字符串，需转成数组才能通过表单校验
    const salesKey = 'Dist.cSalesRegion';
    const raw = props.data.rowData[salesKey];
    if (typeof raw === 'string') {
        try {
            props.data.rowData[salesKey] = JSON.parse(raw);   // 转成数组
        } catch {
            props.data.rowData[salesKey] = props.data.rowData[salesKey];               
        }
    }
    // 02开头的产品，货物明细，批改原因是增加保额，减少保额，编辑弹窗只有发票金额和保险金额可编辑，其它置灰
    if(cComponentTable.value == "CargoDist" && props.data.rowData.cProdNo.startsWith('02') && (props.data.rowData.cRsnCde == '增加保额'|| props.data.rowData.cRsnCde == '减少保额')){
        setFormItem("Dist.cBillNum", { disabled: true });
        setFormItem("Dist.cCodeNo", { disabled: true });
        setFormItem("Dist.cGoodsNo", { disabled: true });
        setFormItem("Dist.cGoodsType", { disabled: true });
        setFormItem("Dist.cInvoiceCur", { disabled: true });
        setFormItem("Dist.cInvoiceNum", { disabled: true });
        setFormItem("Dist.cMarkLabel", { disabled: true });
        setFormItem("Dist.cNumUnit", { disabled: true });
        setFormItem("Dist.cPackageMethod", { disabled: true });
        setFormItem("Dist.cPrmCur", { disabled: true });
        setFormItem("Dist.cTradeNum", { disabled: true });
        setFormItem("Dist.nEdrPrjNo", { disabled: true });
        setFormItem("Dist.nInsuranceAmount", { disabled: true });
        setFormItem("Dist.nAmtExch", { disabled: true });
        setFormItem("Dist.nInvoiceExch", { disabled: true });
        setFormItem("Dist.nNum", { disabled: true });
        setFormItem("Dist.nRmbAmount", { disabled: true });
        setFormItem("Dist.nRmbLimit", { disabled: true });
        setFormItem("Dist.cRemarks", { disabled: true });
    }
    // 040001 变更清单信息时 方案号置灰
    if(props.data.rowData.cProdNo === '040001' && props.data.rowData.cRsnCde === "10"){
      setFormItem("Dist.cPlanNo", { disabled: true });
    }
    setTimeout(() => {
      freeEditRef.value?.setFormValue(props.data.rowData);
    }, 100);
  } else {
    // 010006 机动车辆类型默认其他
    if(route.params?.param?.cProdNo == '010006'){
      setValue("Dist.cVehicleType", "X")
    }
  }
  nextTick(() => {
    handelnInsuranceAmountList()
    // 同步dist组件中的codeListMap到表单中
		freeEditRef.value?.setCodeListMap(props.data.codeListMap);
		setTimeout(() => {
			init.value = false
    }, 500);
  })
});

  //根据获取的职业类别查询职业等级并绑定下拉框
const getDistoccupType = (val) => {
  if(!val || val.length < 3) return;
  codeListStore.queryCodeList({
    codeListName: "Occupt_ZYLB",
    codeListParam: {cParCde: val.at(-1)},
  }).then((res) => {
    const item = freeEditRef.value?.getFromSchemaItem('Dist.cOccupationalLevel')
    //给表单下拉项赋值
    item.itemConfig.loadData = res
    if(res.length > 0 ){  // 职业等级,默认给个值
      setValue('Dist.cOccupationalLevel', res[0].value);
    }
  });
}
// 020009 020011 020013 020016 保险金额根据发票金额带出，可修改 必填
// 020001、020002、020003、020004、020005、020006、020017 保险金额根据发票金额公式计算，不可修改，置灰 必填
const  isShownInsuranceAmount = ref(false)
const nInsuranceAmountListA = ['020009', '020011', '020013', '020016']
const nInsuranceAmountListB = ['020001','020002','020003','020004','020005','020006','020017']
const handelnInsuranceAmountList = ()=>{
  if(nInsuranceAmountListA.includes(params?.cProdNo)){
    isShownInsuranceAmount.value = true
    setFormItem('Dist.nInsuranceAmount',{disabled:false})
  }else if(nInsuranceAmountListB.includes(params?.cProdNo)){
    isShownInsuranceAmount.value = false
    // setFormItem('Dist.nInsuranceAmount',{disabled:true})
  }
}
const nInvoiceValueChange = (val:any)=>{
  const bonusRatioData =  getValue('Dist.nAdditiveCoefficient')
  const goodsValueData = getValue('Dist.nInvoiceValue')
  const nInvoiceExch = getValue('Dist.nInvoiceExch')
  if(nInvoiceExch && goodsValueData){
    setValue('Dist.nRmbAmount',Number(getValue('Dist.nInvoiceValue'))*getValue('Dist.nInvoiceExch'))
  }
  if(bonusRatioData && goodsValueData && !isShownInsuranceAmount.value){
    setValue('Dist.nInsuranceAmount',goodsValueData * (1 + bonusRatioData/100))
    setValue('Dist.nRmbLimit',Number(getValue('Dist.nInsuranceAmount'))*getValue('Dist.nAmtExch'))
  }else {
    setValue('Dist.nInsuranceAmount',val)
  }
  // 如果发票金额有值， 保险金额不可编辑，否则可编辑
  if(val) {
    setFormItem("Dist.nInsuranceAmount", { disabled: true })
  } else {
    setFormItem("Dist.nInsuranceAmount", { disabled: false })
  }
}
const nAdditiveCoefficientChange = (val:any)=>{
  const bonusRatioData =  getValue('Dist.nAdditiveCoefficient')
  const goodsValueData = getValue('Dist.nInvoiceValue')
  if(bonusRatioData && goodsValueData && !isShownInsuranceAmount.value){
    setValue('Dist.nInsuranceAmount',goodsValueData * (1 + bonusRatioData/100))
    setValue('Dist.nRmbLimit',Number(getValue('Dist.nInsuranceAmount'))*getValue('Dist.nAmtExch'))
  }
}
const InvoiceCurrencyChange = (val:any)=>{
  console.log('发票金额币种')
  if(!val) {
    setValue("Dist.nInvoiceExch", null); // 发票金额汇率
    setValue('Dist.cPrmCur',"") // 保险金额币种
    setValue('Dist.nRmbAmount',Number(getValue('Dist.nInvoiceValue'))) // 折人民币发票金额（元）
    const bonusRatioData =  getValue('Dist.nAdditiveCoefficient') // 加成系数（%）
    const goodsValueData = getValue('Dist.nInvoiceValue') // 发票金额
    if(bonusRatioData && goodsValueData && !isShownInsuranceAmount.value){
      setValue('Dist.nInsuranceAmount',goodsValueData * (1 + bonusRatioData/100)) // 保险金额
      setValue('Dist.nRmbLimit',Number(getValue('Dist.nInsuranceAmount'))*getValue('Dist.nAmtExch')) // 折人民币保险金额
    }
  } else if (val !== "CNY") {
    codeListStore
        .queryCodeList({
          codeListName: "WEB_BAS_CHGRATE",
          codeListParam: { value: val },
        })
        .then((res) => {
          console.log("0000000", res);
          setValue('Dist.cPrmCur',val)
          setValue("Dist.nAmtExch", res[0].currency_rate);
          setValue("Dist.nInvoiceExch", res[0].currency_rate);
          setValue('Dist.nRmbAmount',Number(getValue('Dist.nInvoiceValue'))*getValue('Dist.nInvoiceExch'))
          const bonusRatioData =  getValue('Dist.nAdditiveCoefficient')
          const goodsValueData = getValue('Dist.nInvoiceValue')
          if(bonusRatioData && goodsValueData && !isShownInsuranceAmount.value){
            setValue('Dist.nInsuranceAmount',goodsValueData * (1 + bonusRatioData/100))
            setValue('Dist.nRmbLimit',Number(getValue('Dist.nInsuranceAmount'))*getValue('Dist.nAmtExch'))
          }
        });
  } else {
    setValue('Dist.cPrmCur',val)
    setValue("Dist.nAmtExch", "1.000000");
    setValue("Dist.nInvoiceExch", "1.000000");
    setValue('Dist.nRmbAmount',Number(getValue('Dist.nInvoiceValue')))
    const bonusRatioData =  getValue('Dist.nAdditiveCoefficient')
    const goodsValueData = getValue('Dist.nInvoiceValue')
    if(bonusRatioData && goodsValueData && !isShownInsuranceAmount.value){
      setValue('Dist.nInsuranceAmount',goodsValueData * (1 + bonusRatioData/100))
      setValue('Dist.nRmbLimit',Number(getValue('Dist.nInsuranceAmount'))*getValue('Dist.nAmtExch'))
    }
  }
  // 发票金额币种如果有值，保险金额币种不可编辑，否则可编辑
  if(val) {
    setFormItem("Dist.cPrmCur", { disabled: true })
  } else {
    setFormItem("Dist.cPrmCur", { disabled: false })
  }
}
const nInsuranceAmountChange = (val:any)=>{
  if(val){
    setValue('Dist.nRmbLimit',Number(getValue('Dist.nInsuranceAmount'))*getValue('Dist.nAmtExch'))
  } else {
    setValue('Dist.nRmbLimit',null)
  }
}
const InsurancecurrencyChange = (val:any)=>{
  console.log('保险金额币种')
  if(!val) {
    setValue("Dist.nAmtExch", null);
    setValue('Dist.nRmbLimit',Number(getValue('Dist.nInsuranceAmount')))
  } else if (val !== "CNY") {
    codeListStore
        .queryCodeList({
          codeListName: "WEB_BAS_CHGRATE",
          codeListParam: { value: val },
        })
        .then((res) => {
          console.log("0000000", res);
          setValue("Dist.nAmtExch", res[0].currency_rate);
          setValue('Dist.nRmbLimit',Number(getValue('Dist.nInsuranceAmount'))*getValue('Dist.nAmtExch'))
        });
  } else {
    setValue("Dist.nAmtExch", "1.000000");
    setValue('Dist.nRmbLimit',Number(getValue('Dist.nInsuranceAmount')))
  }
}
const cEquipmentTypesFunc = ()=>{
  dialog.value?.open(
      "specialCateModal",
      {
        type: "show",
        method: {
          getdbClickData: (data) => {
            setFormItem("Dist.cEquipmentTypes", {
              loadData: [{ label: data.cnm, value: data.cde }],
            });
            setValue("Dist.cEquipmentTypes", `${data.cde}${data.cnm}`);
            dialog.value?.handleClose();
          },
        },
      },
      {},
      {  width: 85 }
  );
}
// 040019 保全被申请人信息 身份证
const cCertfClsChange = (val: any) => {
  const productNo = route.params?.param?.cProdNo; // 产品编号（兼容参数不存在的情况）
	if (!init.value) {
		setValue('Dist.cCertfCde', null);
	}
	clearValidate('Dist.cCertfCde')
  const baseRuleMap: Record<string, any[]> = {
    "111": [getRules("idCard", {})], // 身份证
    "01": [getRules("socialCode", {})], // 统一社会信用代码
    "553": [getRules("ariCard", {})], // 外国人证件号
    "110001": [getRules("orgCode", {})], // 组织机构编码
    '07': [getRules("passPort", {})], // 护照
    default: [] // 默认无规则
  };
  const baseRules = baseRuleMap[val] || baseRuleMap.default;
  const rules = baseRules // 非必填：仅基础规则
	setFormItem('Dist.cCertfCde', { rules });
};

// 证件类型change
const cDocumentTypeChange = (val: any) => {
  const cIs = opertaor.getTableRefs()['tgt']?.getFromValue()['Tgt.cIsinsuranceRegistered']; // 是否记名投保
  const productNo = route.params?.param?.cProdNo; // 产品编号（兼容参数不存在的情况）
	if (!init.value) {
		setValue('Dist.cIdentificationNumber', null);
		setValue('Dist.cGender', null);
		setValue('Dist.nAge', null);
		setValue('Dist.tBirthday', null);
	}
	clearValidate('Dist.cIdentificationNumber')
  const baseRuleMap: Record<string, any[]> = {
    "111": [getRules("idCard", {})], // 身份证
    "01": [getRules("socialCode", {})], // 统一社会信用代码
    "553": [getRules("ariCard", {})], // 外国人证件号
    "110001": [getRules("orgCode", {})], // 组织机构编码
    '07': [getRules("passPort", {})], // 护照
    default: [] // 默认无规则
  };

  const baseRules = baseRuleMap[val] || baseRuleMap.default;
  const isNonRequired =   productNo === '049020' ||   productNo === '041007' || cIs == '1';

  const rules = isNonRequired 
    ? baseRules // 非必填：仅基础规则
    : [...baseRules, getRules("required", {})]; // 必填：基础规则+required

  setFormItem('Dist.cIdentificationNumber', { rules });
  // 047002证件类型选
  if(productNo === '047002') {
    if(val === '111') {
      setFormItem("Dist.tBirthday", { disabled: true });
      setFormItem("Dist.cGender", { disabled: true });
      setFormItem('Dist.nAge', { disabled: true });
    } else {
      setFormItem("Dist.tBirthday", { disabled: false });
      setFormItem("Dist.cGender", { disabled: false });
      setFormItem('Dist.nAge', { disabled: false });
    }
  }
};

// 05产品-清单信息-证件类型
const cIdTypefun = (val: any) => {
	console.log('05产品-清单信息-证件类型', val)
	// 清除值、报错信息
	setValue('Dist.cIdNumber', null);
	clearValidate('Dist.cIdNumber')

	let baseRules: any[] = [];
	type RuleType = "orgCode" | "socialCode" | "idCard" | "passPort" | "ariCard" | "required";
	const ruleMap: Record<string, RuleType> = {
		"110001": "orgCode",
		"01": "socialCode", // 统一社会信用证代码
		"111": "idCard", // 居民身份证
		"07": "passPort", // 护照
		"553": "ariCard", // 外国人永久居留身份证
	};
	baseRules = ruleMap[val] ? [getRules(ruleMap[val], {})] : [];

	setFormItem("Dist.cIdNumber", {
		rules: baseRules,
	});
}

// 保险责任一级
function cInsuranceDutyChange(val:any){
  if(val === '02') {
    setFormItem('Dist.cSuitScope', { rules: [getRules("required", {})], disabled: false });
  } else {
    setFormItem('Dist.cSuitScope', { rules: [], disabled: true });
    setValue('Dist.cSuitScope', []);
  }
}

function getAddressstr(val:any, row: any, pitem: any){
  let getv1 = '';  //集联地址
  let getv2 = '';  //字符串地址
  let setv = '';  //需要设置的目标地址

  let r = false;
  formconfig1.value.fromSchema?.forEach((item: any) => { 
    if(r){
      setv = item;
      r = false;
    }
    if(item.inputtype === 'rtinputgroup'){
      for(let i = 0 ; i<item.groupList.length ; i++ ){
        if(pitem.prop === item.groupList[i].prop){
          r = true;
        }
      }
      if(r){
        getv1 = item.groupList.filter((it: any)=> it.inputtype === 'rtcascader');
        getv2 = item.groupList.filter((it: any)=> it.inputtype === 'rtinput');
      }
    }
  })
  setAddressBykey(getv1,getv2,setv);
}

function setAddressBykey(getv1: any, getv2: any , setv: any) {
   const a = freeEditRef?.value?.getValue(getv1[0]?.prop);
   const b = freeEditRef?.value?.getValue(getv2[0]?.prop);

   const setS = setv.prop;
   if (a) {
    getAddressStr({ address: a }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const c = (data ? data["addStr"] : "") + (b ? b: "");
        setValue(setS, c);
      }
    });
   }else{
    setValue(setS, b);
   }
};

const prodMap = {
  '040001':'Dist.cDetailedAddress'
}
function setregistByMapAdd() {
  let a = '';
  let b = '';
  if(!prodMap[params.cProdNo]){
    return ;
  }
  
  formconfig1.value.fromSchema?.forEach(item=>{
    if(item.inputtype === 'rtinputgroup'){
      
      item.groupList.forEach(data=>{
        if(data.inputtype === 'rtcascader'){
          a = freeEditRef?.value?.getValue(data.prop);
        }
        if(data.inputtype === 'rtinput'){
          b = freeEditRef?.value?.getValue(data.prop);
        }
      })
    }
  })
  if(a){
    getAddressStr({ address: a }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const c = (data ? data["addStr"] : "") + (b?b:'');
        setValue(prodMap[params.cProdNo], c);
      }
    });
  }else{
    setValue(prodMap[params.cProdNo], b);
  }
}
function setregistAdd() {
  const ads = freeEditRef?.value?.getValue("Dist.Prop");
  const a = freeEditRef?.value?.getValue("Dist.cSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        setValue("Dist.cDetailedAddress", b);
      }
    });
  } else {
    setValue("Dist.cDetailedAddress", a);
  }
}

//给表单赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.value.fromSchema?.forEach((item) => {
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


const cRelatedInsuredChange = () => {
    // const param = opertaor.getParam();
    dialog.value?.open(
      "cRelatedInsuredModal",
      {
        type: "show",
				data: {
					cAppNo: opertaor.getDataAll().plyBase["Base.cAppNo"] || '',
					selectedData: getValue("Dist.cRelatedInsured") || []
				},
        method: {
          getdbClickData: (data) => {
						let loadData = []
						let datavalue = []
						data.value.forEach((item)=>{
							// loadData.push({ label: item['InsuredDist.cInsuredNme'], value: item['InsuredDist.cInsuredCde'] })
							// datavalue.push(item['InsuredDist.cInsuredCde'])
							loadData.push({ label: item['InsuredDist.cInsuredNme'], value: item['InsuredDist.cPkId'] })
							datavalue.push(item['InsuredDist.cPkId'])
						})
						setValue("Dist.cRelatedInsured", datavalue);
						setFormItem("Dist.cRelatedInsured", { loadData });
            dialog.value?.handleClose();
          },
        },
      },
      {},
      { title: "关联被保险人", width: 85 }
    );
};

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
function clearValidate(key=null) {
  freeEditRef?.value?.clearValidate(key);
}
defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  clearValidate
});
</script>

<style scoped></style>

<template>
  <div>
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
    <comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
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
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { codeListViewStore } from "@/store";
import {getAddressStr} from "@/api/query";
import {eventBus} from "@/utils/event-bus";
import {calculateAgeFromIdCard} from "@/utils/common";
import {DialogMethod} from "@/common/dzmodel/ComDialogConf";
import moment from "moment";
const opertaor = dataOpertaor();
const param = ref({});
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const dialog = ref<DialogMethod | null>(null);

const { getRules } = useValidator();
const tableRef = ref<MyTableMethod | null>(null);
const codeListStore = codeListViewStore();
const params = opertaor.getParam();
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

const cComponentTable = computed(() => props.data.compKey ? props.data.compKey.replace(/\d+/g, '') : "");

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
          const isValid = await freeEditRef.value?.validate();
          if(isValid){



            const s = freeEditRef.value?.getFromValue();

            if(!isObjectValid(s)){
              ElMessage.warning('所有字段都未填写请确认！')
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
            saveDist(params).then((res) => {
              if (res.code === 200) {
                ElMessage.success(res.msg);
                emits("handleClose");
                if(!!props.method.isOk && typeof props.method.isOk === 'function') {
                  props.method.isOk(res);
                }
              } else {
                ElMessage.error(res.msg);
              }
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


// 确定 非空校验
const isObjectValid = (obj:any) => {
  if (Array.isArray(obj)) {
    return true; 
  }

  if (!obj || typeof obj !== 'object' || !Object.keys(obj).length) {
    return false;
  }
  return Object.values(obj).every(v => 
    v != null && (typeof v !== 'string' || v.trim() !== '')
  );
};
onMounted(() => {
  // console.log(333)   distAdd
  dataParams.value = opertaor.getDataAll();
  appNo.value = dataParams.value.plyBase["Base.cAppNo"];
  cGrpMrk.value = route.params.param.cGrpMrk;
  let newSchema = [];
  let cIs= opertaor.getTableRefs()['tgt']?.getFromValue()['Tgt.cIsinsuranceRegistered']  //  是否记名投保
  for(let i = 0; props.data.fromSchema && i < props.data.fromSchema.length; i++){


    // console.log('Dist.cPlateNumber',props.data.fromSchema)
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
    if( route.params.param.cProdNo == '042003' && item.prop =='Dist.cPlanNo' ){
             item['rules'] = [];
    }
    // 方案号下拉值
    if(item.prop == 'Dist.cPlanNo'){
      const termref = opertaor.getTableRefByKey("cvrg");
      
      item.typeCode = null;
      item.loadData = termref.getPlanNo();
    }

    if(item.prop =='Dist.cSchoolName'){
      item['rules'] = [{ required: true, message: '该项为必填项', trigger: 'blur' }];
    }



    if( route.params.param.cProdNo == '043010'){
      if(item.prop =='Dist.cJobType'){
        item['rules'] = [{ required: true, message: '该项为必填项', trigger: 'blur' }];
      }else if(   cIs == 1 && item.prop !=='Dist.nSeqNo'){
           item['rules'] = [{ required: true, message: '该项为必填项', trigger: 'blur' }];
      }else{
        item['rules'] = [];   
      }
    }

 
    // if(cIs == 1 && item.prop !=='Dist.nSeqNo'){
      
    // }else if(cIs == 0 && (item.prop !=='Dist.cSchoolName' && item.prop !=='Dist.cSchoolAddress')){
    //   item['rules'] =[];
      
    // }
 
    if(item.cShowLocation === '1'){
      item["hidden"] = true;
    }
    if(item.prop ==='Dist.nSalesRevenue'){
      item['rules'] = [{ required: true, message: '该项为必填项', trigger: 'blur' },getRules("positiveNumber", {})];
    }
    // 车牌号校验 vehiclePlate
  if(item.prop =='Dist.cPlateNumber'){
     item['rules'] = [getRules("vehiclePlate", {})];
    }

    // 车架号校验
    // Dist.cVinCode  getRules   { rules: [getRules("faxNumber", {})] }
    if(item.prop =='Dist.cVinCode'){
     item['rules'] = [getRules("vinNumber", {})];
    }
    // 043009 关联被保人
    if(item.prop === 'Dist.cRelatedInsured'){
      if(cGrpMrk.value === '1') {
        const insured = opertaor.getDataAll()['insured'];
        if (insured && insured['Insured.cInsuredCde']) {
          setTimeout(() => {
            setValue('Dist.cRelatedInsured', insured['Insured.cPkId']);
          }, 100);
        }
      }else {
        item['rules'] = [];
        item["hidden"] = true;
      }
    }

        // 身份证类型自动回填年龄
    if(item.prop =='Dist.cIdentificationNumber'){
      item['func'] = (val: string) => {
        if(val && val.length === 18 && getValue('Dist.cDocumentType') === '120001') {
          const age = calculateAgeFromIdCard(val);
          setValue('Dist.nAge', age);
        }
      }
      if(cIs == 1){
          item['rules'] = [getRules("idCard", {}),{ required: true, message: '该项为必填项', trigger: 'blur' }];
      }else{
          item['rules'] = [getRules("idCard", {})];
      }
    
    }
 
    // 040016 身份证必填
    if( route.params.param.cProdNo == '040016' && item.prop =='Dist.cIdentificationNumber' ){
        item['rules'] = [{ required: true, message: '该项为必填项', trigger: 'blur' }];
    }




    if(item.prop =='Dist.cEquipmentTypes'){
      item['btnItems']['func'] =  cEquipmentTypesFunc;
    }
        // 身份证类型自动回填年龄
    if(item.prop =='Dist.cDocumentType'){
      item['func'] =  cDocumentTypeChange;
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
    newSchema.push(item);
  }

  console.log('最终实现表单',newSchema)
  formconfig1.value.fromSchema = newSchema;
  
  formconfig1.value.title = props.data.title;
  if (props.data.title == "编辑") {
    setTimeout(() => {
      freeEditRef.value?.setFormValue(props.data.rowData);
    }, 100);
  } else {
  }
  nextTick(() => {
    // 同步dist组件中的codeListMap到表单中
    freeEditRef.value?.setCodeListMap(props.data.codeListMap);
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
  });
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
// 证件类型change
const cDocumentTypeChange =(val:any)=>{
  console.log(val)
   const item = freeEditRef.value?.getFromSchemaItem('Dist.cIdentificationNumber')
       clearValidate('Dist.cIdentificationNumber')  
    //  身份证
    if (val == "120001") { 
     item.itemConfig['rules'] = [ getRules("idCard", {}),...item.itemConfig['rules']];
    } else if ( val == "110007") {   
      // 统一社会信用代码校验
      item.itemConfig['rules'] = [getRules("socialCode", {}),...item.itemConfig['rules']];
    } else if(val == "19"){
      // 外国人证件号
      item.itemConfig['rules'] = [getRules("ariCard", {}),...item.itemConfig['rules']];
    } else if(val =='110001'){
      // 组织机构编码校验
      item.itemConfig['rules'] =[getRules("orgCode", {}),...item.itemConfig['rules']];
    } else {
      item.itemConfig['rules'] = [ getRules("isNull", {})];
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
   const a = freeEditRef?.value?.getValue(getv1[0].prop);
   const b = freeEditRef?.value?.getValue(getv2[0].prop);

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

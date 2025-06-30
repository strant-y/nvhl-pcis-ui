<template>
  <div>
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
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
const opertaor = dataOpertaor();
const param = ref({});
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const { getRules } = useValidator();
const tableRef = ref<MyTableMethod | null>(null);
const codeListStore = codeListViewStore();

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
            const params = Object.assign(
              {
                cProdNo: route.params.param.cProdNo,
                cComponentTable: cComponentTable.value,
                cAppNo: appNo.value,
              },
              { dist: s }
            );
            console.log('params', params)
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
const distContactList:Array<string> = ['Dist.PartProp','Tgt.cSuffixAddr','Dist.Prop','Dist.cSuffixAddr','Dist.JingyingProp','Dist.cDetailedAddress']

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
       console.log(item) 
    if(['Dist.AllOccup'].includes(item.prop)) {
      item["func"] = getDistoccupType;
    }else if (props.data.fromSchema[i]["func"]) {

    }
    if (props.data.fromSchema[i]["tableClick"]) {
      item["tableClick"] = props.data.fromSchema[i]["tableClick"];
    }


    if(cIs == 1 && item.prop !=='Dist.nSeqNo'){
        item['rules'] = [{ required: true, message: '该项为必填项', trigger: 'blur' }];
    }else if(cIs == 0 && (item.prop !=='Dist.cSchoolName' && item.prop !=='Dist.cSchoolAddress')){
      // item['rules'] =null;
    }
    // item["disabled"] = false;
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
      const insured =  opertaor.getDataAll()['insured'];
      if(insured && insured['Insured.cInsuredCde']) {
        setTimeout(() => {
          setValue('Dist.cRelatedInsured', insured);
        }, 100);

        
      }
    }
    // 043009 实际用工地址关联 团单才展示
    if(item.prop === 'Dist.cEmploymentAddress' && cGrpMrk.value !== '1'){
      item['rules'] = [];
      item["hidden"] = true;
    }
    // 身份证类型自动回填年龄
    if(item.prop =='Dist.cIdentificationNumber'){
      item['func'] = (val: string) => {
        if(val && val.length === 18 && getValue('Dist.cDocumentType') === '120001') {
          const age = calculateAgeFromIdCard(val);
          setValue('Dist.nAge', age);
        }
      }
    }

        // 身份证类型自动回填年龄
    if(item.prop =='Dist.cDocumentType'){
      item['func'] =  cDocumentTypeChange;
    }


    if(item.prop =='Dist.cSchoolName'){
      item['rules'] = [{ required: true, message: '该项为必填项', trigger: 'blur' }];
    }

    // 040001产品 必填项问题
    if(item.prop =='Dist.cPlanNo' ||item.prop =='Dist.tOpeningTime' ||item.prop =='Dist.cLocationSigns' ||item.prop =='Dist.cFacilitySigns' ||item.prop =='Dist.cVenueSign' || item.prop =='Dist.cBuildingStructure'  ){
      console.log('进啊2=',item.prop)
      item['rules'] = [{ required: true, message: '该项为必填项', trigger: 'blur' }];   
    }

 

    // 遍历groupList数组把函数赋值给fromSchema
    if (props.data.fromSchema[i]["groupList"] && props.data.fromSchema[i]["groupList"].length>0) {
      props.data.fromSchema[i]["groupList"].forEach((data:any,index:number,arr:any) =>{
        //  040001经营场所地址 040005 学校地址 040021 经营场所地址 042003 学校地址 043013 标的坐落地址 043020 房屋所在地区 045001工程项目地址
        if(distContactList.includes(data.prop)){
          item["groupList"][index]['func'] = function (){
            return setcDetailedAddress(arr,JSON.parse(JSON.stringify(props.data.fromSchema[i+1])))
          }
        }
      })
    }
    newSchema.push(item);
  }

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
const setcDetailedAddress = (prop:any,aftProp:any)=> {
  const ads = freeEditRef?.value?.getValue(prop[0].prop);
  const a = freeEditRef?.value?.getValue(prop[1].prop) || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        freeEditRef?.value?.setValue(aftProp.prop, b);
      }
    });
  } else {
    freeEditRef?.value?.setValue(aftProp.prop, a);
  }
};

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

// 证件类型change
const cDocumentTypeChange =(val:any)=>{
  console.log(val)
   const item = freeEditRef.value?.getFromSchemaItem('Dist.cIdentificationNumber')
    //  身份证
    if (val == "120001") { 
     item.itemConfig['rules'] = [ getRules("idCard", {})];
    } else if ( val == "110007") {   
      // 统一社会信用代码校验
      item.itemConfig['rules'] = [getRules("socialCode", {})];
    } else if(val == "19"){
      // 外国人证件号
      item.itemConfig['rules'] = [getRules("ariCard", {})];
    } else if(val =='110001'){
      // 组织机构编码校验
      item.itemConfig['rules'] =[getRules("orgCode", {})];
    } else {
      item.itemConfig['rules'] = [ getRules("isNull", {})];
    }
}


//给表单赋值
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

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>

<style scoped></style>

<template>
  <div>
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
  </div>
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { createFreeButtonBase } from "@/shared/button-config";
import { codeListViewStore, dataOpertaor } from "@/store";
import {getAddressStr} from "@/api/query";
import {FormPage} from "@/views/protocolManagement/utils/form-page";

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
  handleQuery: {
    type: Function,
    required: false,
  },
  rowData: {
    type: Object,
    default: () => ({}),
  },
});

const idxParam = inject('idxParam');
const formPage: FormPage = idxParam?.formPage;

const codeListStore = codeListViewStore();

const getCComponentTable = () => {
    return 'InsuredDist';
};
const cComponentTable = getCComponentTable();

const dataParams = ref({});
const emits = defineEmits(["handleClose"]);
const formconfig1 = ref<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "新增信息",
    fromSchema: [],
    fromUi: createFromUiConfig(props.data.fromUi),
    titleBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "确定",
        func: async () => {
          // const isValid = await freeEditRef.value?.validate();
          // if(isValid){
            const s = freeEditRef.value?.getFromValue();
            if(typeof props.method.isOk == 'function'){
              props.method.isOk(s);
              emits("handleClose");
              return;
            }
          // }
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
const distContactList:Array<string> = ['DistECargo.PartProp','Tgt.cSuffixAddr','DistECargo.Prop','DistECargo.cSuffixAddr','DistECargo.JingyingProp','DistECargo.cDetailedAddress']

onMounted(() => {
  dataParams.value = formPage.getAllFormData();

  let newSchema = [];

  for(let i = 0; props.data.fromSchema && i < props.data.fromSchema.length; i++){

    let item = JSON.parse(JSON.stringify(props.data.fromSchema[i]));
    if(['DistECargo.AllOccup'].includes(item.prop)) {
      item["func"] = getDistoccupType;
    }else if (props.data.fromSchema[i]["func"]) {

    }
    if (props.data.fromSchema[i]["tableClick"]) {
      item["tableClick"] = props.data.fromSchema[i]["tableClick"];
    }
    if(['ECargoGoodsTgt.nGoodsValue'].includes(item.prop)) {
      item["func"] = goodsValue;
    }
    if(['ECargoGoodsTgt.nAdditiveRatio'].includes(item.prop)) {
      item["func"] = bonusRatio;
    }
    if(['ECargoGoodsTgt.cPrmCur'].includes(item.prop)) {
      item["func"] = cAmtCurChange;
    }
    if(item.prop !=='DistECargo.nSeqNo'){
        item['rules'] = [{ required: true, message: '该项为必填项', trigger: 'blur' }];
    }else if(item.prop !=='DistECargo.cSchoolName' && item.prop !=='DistECargo.cSchoolAddress'){
      item['rules'] =null;
    }
    item["disabled"] = false;
    if(item.cShowLocation === '1'){
      item["hidden"] = true;
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
  } else if(props.data.title == '详情'){
    setTimeout(() => {
      freeEditRef.value?.setFormValue(props.data.rowData);
      freeEditRef.value?.setDisabledAll();
    }, 100);
  }
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
//总保额币种下拉事件
const cAmtCurChange = (val: any)=>{
  if (val !== "CNY") {
    codeListStore
        .queryCodeList({
          codeListName: "WEB_BAS_CHGRATE",
          codeListParam: { value: val },
        })
        .then((res) => {
          console.log("0000000", res);
          setValue("ECargoGoodsTgt.nAmtExch", res[0].currency_rate);
          setValue('ECargoGoodsTgt.nRmbLimit',Number(getValue('ECargoGoodsTgt.nInsuranceAmount'))*getValue('ECargoGoodsTgt.nAmtExch'))
        });
  } else {
    setValue("ECargoGoodsTgt.nAmtExch", "1.000000");
    setValue('ECargoGoodsTgt.nRmbLimit',Number(getValue('ECargoGoodsTgt.nInsuranceAmount')))
  }
}
const bonusRatio = (val:any)=>{
  const bonusRatioData =  getValue('ECargoGoodsTgt.nAdditiveRatio')
  const goodsValueData = getValue('ECargoGoodsTgt.nGoodsValue')
 if(bonusRatioData && goodsValueData){
    setValue('ECargoGoodsTgt.nInsuranceAmount',goodsValueData * (1 + bonusRatioData/100))
 }
}
const goodsValue = (val:any)=>{
  const bonusRatioData =  getValue('ECargoGoodsTgt.nAdditiveRatio')
  const goodsValueData = getValue('ECargoGoodsTgt.nGoodsValue')
  if(bonusRatioData && goodsValueData){
    setValue('ECargoGoodsTgt.nInsuranceAmount',goodsValueData * (1 + bonusRatioData/100))
  }
}
  //根据获取的职业类别查询职业等级并绑定下拉框
const getDistoccupType = (val) => {
  if(!val || val.length < 3) return;
  codeListStore.queryCodeList({
    codeListName: "Occupt_ZYLB",
    codeListParam: {cParCde: val.at(-1)},
  }).then((res) => {
    const item = freeEditRef.value?.getFromSchemaItem('DistECargo.cOccupationalLevel')
    //给表单下拉项赋值
    item.itemConfig.loadData = res
  });
};
const funcNdustryCate = () => {
    // const param = opertaor.getParam();
    dialog.value?.open(
      "ndustryCateModal",
      {
        type: "show",
        method: {
          getdbClickData: (data) => {
            setFormItem("ECargoApplicant.cTrdCde", {
              loadData: [{ label: data.cnm, value: data.cde }],
            });
           // setValue("Applicant.cTrdCde", data.cnm);
            setValue("ECargoApplicant.cTrdCde", data.cde);
            dialog.value?.handleClose();
          },
        },
      },
      {},
      { title: "国民经济行业分类", width: 85 }
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

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>

<style scoped></style>

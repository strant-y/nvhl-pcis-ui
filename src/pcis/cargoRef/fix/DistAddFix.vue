<template>
  <div>
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
		<comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
import { qryCustomer } from "@/api/query";
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
import moment from "moment";
const dialog = ref<DialogMethod | null>(null);
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";

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
          const isValid = await freeEditRef.value?.validate();
          if(isValid){
            const s = freeEditRef.value?.getFromValue();
            if(typeof props.method.isOk == 'function'){
              props.method.isOk(s);
              emits("handleClose");
              return;
            }
          }
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
    if(['ECargoInsuredDist.cInsuredNme'].includes(item.prop)) {
      item["func"] = funCheckUser;
    }
    if(['ECargoInsuredDist.cCertfCls'].includes(item.prop)) {
      item["func"] = InsuredCCertfCls;
    }
    if(['ECargoInsuredDist.cCertfCde'].includes(item.prop)) {
      item["func"] = cCertfCdeChange;
    }
    if(['ECargoInsuredDist.cLongendTyp'].includes(item.prop)) {
      item["func"] = tCertMrkChecked;
    }
    if(['ECargoInsuredDist.cIsSame'].includes(item.prop)) {
      item["func"] = isSameChange;
    }
    if(['ECargoInsuredDist.cRegisterAddress'].includes(item.prop)) {
      if(item.groupList.length>0){
        item.groupList[0]["func"] = getCountryInsured
        item.groupList[1]["func"] = getcSuffixAddr
      }
    }
    if(['ECargoInsuredDist.Address'].includes(item.prop)){
      if(item.groupList.length>0){
        item.groupList[0]["func"] = getAllPropInsured
        item.groupList[1]["func"] = getcRegisterSuffixAddr
      }
    }
		if(['ECargoInsuredDist.cOccupCde'].includes(item.prop)) {
      item["btnItems"]["func"] = cOccupCdeChange;
      item["btnItems"]["disabled"] = false;
    }
    if(['ECargoInsuredDist.cTrdCde'].includes(item.prop)) {
      item["btnItems"]["func"] = funcNdustryCate;
			item["btnItems"]["disabled"] = false;
    }
    // if(item.prop !=='DistECargo.nSeqNo'){
    //     item['rules'] = [{ required: true, message: '该项为必填项', trigger: 'blur' }];
    // }else if(item.prop !=='DistECargo.cSchoolName' && item.prop !=='DistECargo.cSchoolAddress'){
    //   item['rules'] =null;
    // }
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
	setTimeout(() => {
		let cCustRiskRank = getValue("ECargoInsuredDist.cCustRiskRank")
		if(!cCustRiskRank){
			setValue("ECargoInsuredDist.cCustRiskRank","925104");
		}
	}, 100);
  console.log(' formconfig1.value', formconfig1.value)
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
const tCertMrkChecked = (val:any)=>{
  if (val == "1") {
    setValue(
        "ECargoInsuredDist.tCertfEndDate",
        moment(new Date("2099-12-31")).format("YYYY-MM-DD HH:mm:ss")
    );
    setFormItem("ECargoInsuredDist.tCertfEndDate", { disabled: true });

  } else {
    setValue("ECargoInsuredDist.tCertfEndDate", "");
    setFormItem("ECargoInsuredDist.tCertfEndDate", { disabled: false });
  }
}
//  根据 客户名称 / 被保人性质/ 证件类型 / 证件号码 获取客户信息
const checkUser = () => {
  // 自定义录单 方案配置 模版 进入 可以查询用户信息
  // if (param.pageType !== "app" &&  param.pageType !== "copy" && param.pageType !== "template" && param.cAppStatus !=='1') {
  //   return false;
  // }
  const applicantValue = freeEditRef.value?.getFromValue()
//  只要4个有值 去请求客户信息
  if (
      applicantValue["ECargoInsuredDist.cInsuredNme"]&&
      applicantValue["ECargoInsuredDist.cCertfCls"] &&
      applicantValue["ECargoInsuredDist.cCertfCde"]
  ) {
    const param = {
      coustName: applicantValue["ECargoInsuredDist.cInsuredNme"],
      coustType:applicantValue["ECargoInsuredDist.cCertfCls"],
      coustCode: applicantValue["ECargoInsuredDist.cCertfCde"],
      personnelType:"ECargoInsuredDist"
      // personnelType:"Applicant"
    }
    qryCustomer(param)
        .then((res:any) => {
          const { code, data, msg } = res;
          if (200 === code) {
            if(data){
              console.log('客户数据', data)
              const result:any = {};
              // for (const key in data[0]) {
              // 	if (data[0].hasOwnProperty(key)) {
              // 仅替换以 "Applicant." 开头的键
              // if (key.startsWith('Applicant.')) {
              // 	const newKey = key.replace('Applicant.', 'ECargoApplicant.');
              // 	result[newKey] = data[0][key];
              // } else {
              // 	result[key] = data[0][key];
              // }
              // 	}
              // }
              Object.keys(result).forEach((key) => {
                if(result[key]){
                  setValue(key, result[key]);
                }
              });

              setValue('ECargoInsuredDist.cInsuredCde', data[0]['ECargoInsuredDist.cCargoAppCde']);
              let userId = getValue('ECargoInsuredDist.cCertfCde')
              idAnalysis(userId)
            }
          } else {
            // ElMessage.error(msg);
          }
        })
        .finally(() => {});
  }
};
// 解析身份证
const idAnalysis = (id:string)=>{
  const applicantValue = freeEditRef.value?.getFromValue() //tabref["AgreementApplicant"].getFormValue();
  if (  id.length !== 18 || (applicantValue["ECargoInsuredDist.cCertfCls"] !=='120001' && applicantValue["ECargoInsuredDist.cCertfCls"] !=='19')) {
    return false
  }
  const birthYear = parseInt(id.substring(6, 10), 10);
  const birthMonth = parseInt(id.substring(10, 12), 10);
  const birthDay = parseInt(id.substring(12, 14), 10);
  const birthday = `${birthYear}-${birthMonth.toString().padStart(2, "0")}-${birthDay.toString().padStart(2, "0")}`;
  const sexCode = parseInt(id.substring(16, 17), 10);
  const sex = sexCode % 2 === 0 ? "2" : "1"; // 1: 男, 2: 女
  const age = new Date().getFullYear() - birthYear;

  setValue("ECargoInsuredDist.cNation", "1"); // 国籍
  setValue("ECargoInsuredDist.tBirthday", birthday);
  setValue("ECargoInsuredDist.nAge", age);
  setValue("ECargoInsuredDist.cSex", sex);
}
const funCheckUser = (val:any)=>{
  checkUser();
}
// 证件类型change
 const InsuredCCertfCls =(val) => {
  checkUser();
}
// 证件号码change
const cCertfCdeChange =(val) => {
  checkUser();
}
const getCountryInsured = (val)=>{
  setregistAdd()
}
const getcSuffixAddr = (val)=>{
  setregistAdd()
}
const getAllPropInsured = (val)=>{
  setRegisterAdd()
}
const getcRegisterSuffixAddr = (val)=>{
  setRegisterAdd()
}
function setregistAdd() {
  const ads = getValue("ECargoInsuredDist.Prop");
  const a = getValue("ECargoInsuredDist.cSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        setValue("ECargoInsuredDist.cClntAddr", b);
      }
    });
  } else {
    setValue("ECargoInsuredDist.cClntAddr", a);
  }
}
//注册地市是否同上
const isSameChange = (val:any) => {
	if (val == "1") {
		const ads = getValue("ECargoInsuredDist.Prop");
		const a = getValue("ECargoInsuredDist.cSuffixAddr") || "";

		setValue("ECargoInsuredDist.RegisterProp", ads);
		setValue("ECargoInsuredDist.cRegisterSuffixAddr", a);
	}
}

function setRegisterAdd() {
  const ads = getValue("ECargoInsuredDist.RegisterProp");
  const a = getValue("ECargoInsuredDist.cRegisterSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        console.log(b);
        setValue("ECargoInsuredDist.cRegisteredcapDre", b);
      }
    });
  } else {
    setValue("ECargoInsuredDist.cRegisteredcapDre", a);
  }
}
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
            setFormItem("ECargoInsuredDist.cTrdCde", {
              loadData: [{ label: data.cnm, value: data.cde }],
            });
           // setValue("Applicant.cTrdCde", data.cnm);
            setValue("ECargoInsuredDist.cTrdCde", data.cde);
            dialog.value?.handleClose();
          },
        },
      },
      {},
      { title: "国民经济行业分类", width: 85 }
    );
};
const cOccupCdeChange = () => {
    // const param = opertaor.getParam();
    dialog.value?.open(
      "cOccupCdeModal",
      {
        type: "show",
        method: {
          getdbClickData: (data:any) => {
            setFormItem("ECargoInsuredDist.cOccupCde", {
              loadData: [{ label: `${data.cde} ${data.cnm}`, value: data.cde }],
            });
            setValue("ECargoInsuredDist.cOccupCde", data.cde);
            dialog.value?.handleClose();
          },
        },
      },
      {
        isOk: (selectdata: any) => {},
      },
      { title: "职业", width: 85 }
    );
}

//给表单下拉项赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.value.fromSchema?.forEach((item) => {
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

<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="applicantEditRef" />
  <comDialog ref="dialog"></comDialog>
  <input
    type="file"
    ref="fileInputRef"
    style="display: none"
    @change="handleFileChange"
  />
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { useProductStore } from "@/store/modules/prod";
const dialog = ref<DialogMethod | null>(null);
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const applicantEditRef = ref<AppFreeEditMethod | null>(null);
import { getAddressStr,qryCustomer } from "@/api/query";
const formconfig1 = reactive(createAppFreeEditConfig({}));
const formData = ref<any[]>([]);
const cClntAddr = ref<any>(null);
import { useRoute } from "vue-router";
const route = useRoute();
const fileInputRef = ref(null);
const fileInputType = ref();
import { readFile } from "@/api/file";
const tCertfDate = ref<any[]>([]);
const idxParam = inject('idxParam');
const formPage = idxParam?.formPage;

onMounted(() => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    getRules
  );
  console.log(3838, formconfig11);
  Object.assign(formconfig1, formconfig11);
  nextTick(() => {
    //是否小微企业，默认非必填、只读
    setFormItem("ECargoApplicant.cIsMicroEntpris", {
      rules: null,
      disabled: true,
    });
    // 处理邮编
    setFormItem("ECargoApplicant.cZipCde", {
      rules: [
        getRules("signlessInt", {}),
        getRules("specifyLength", { len: 6 }),
      ],
    });
    //移动手机校验
    setFormItem("ECargoApplicant.cMobile", { rules: [getRules("phoneNo", {})] });
    // 传真校验
    setFormItem("ECargoApplicant.cFax", { rules: [getRules("faxNumber", {})] });

    setFormItem("ECargoApplicant.cGreenIndustryCustomers",{disabled: true});
    setFormItem("ECargoApplicant.cGreenIndustryList",{disabled: true});

  });
});
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
        } else {
          Object.assign(item, obj);
        }
      }
    });
  }
}


// 绑定方法
const method = {
  // func demo
  funcquery: () => {},
  // 客户姓名
  funCheckUser:()=>{
  },
  funcconfirm: () => {
    applicantEditRef.value?.validate().then((isValid) => {
      if (isValid) {
        // handleQuery();
        ElMessage.success("客户信息已经存在");
      } else {
        ElMessage.error("请填写必填项");
      }
    });
  },
  funcreset: () => {
  },
    // 证件号码change
  cCertfCdeChange: (val) => {
    const cCertfCls = formPage.getFormDataById("AgreementApplicant")["ECargoApplicant.cCertfCls"];
    console.log(cCertfCls,"cCertfCls")
    if (cCertfCls == "120001") {
      if (val) {
        const certfCde = applicantEditRef.value?.getValue(
          "ECargoApplicant.cCertfCde"
        );
        if (certfCde && certfCde.length === 18) {
            // idAnalysis(val)
        }
      }
    }
    checkUser();
  },
  funcNdustryCate: () => {
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
  },
  cOccupCdeChange: () => {
    // const param = opertaor.getParam();
    dialog.value?.open(
      "cOccupCdeModal",
      {
        type: "show",
        method: {
          getdbClickData: (data) => {
            setFormItem("ECargoApplicant.cOccupCde", {
              loadData: [{ label: `${data.cde} ${data.cnm}`, value: data.cde }],
            });
            setValue("ECargoApplicant.cOccupCde", data.cde);
            dialog.value?.handleClose();
          },
        },
      },
      {
        isOk: (selectdata: any) => {},
      },
      { title: "职业", width: 85 }
    );
  },
    //常住地址
  getCountry: (val: any) => {
    setregistAdd();
  },
  //常住地址(input)
  getcSuffixAddr: (val: any) => {
    setregistAdd();
  },
  
  //常住地址
  getAllProp: (val: any) => {
    setRegisterAdd();
  },
  //注册地址(input)
  getcRegisterSuffixAddr: (val: any) => {
    setRegisterAdd();
  },
};


//  根据 客户名称 / 被保人性质/ 证件类型 / 证件号码 获取客户信息
const checkUser = () => {
  // 自定义录单 方案配置 模版 进入 可以查询用户信息  
  // if (param.pageType !== "app" &&  param.pageType !== "copy" && param.pageType !== "template" && param.cAppStatus !=='1') {
  //   return false;
  // }
const applicantValue = formPage.getFormDataById("AgreementApplicant")
//  只要4个有值 去请求客户信息
if (
  applicantValue["ECargoApplicant.cAppNme"]&&
  applicantValue["ECargoApplicant.cClntMrk"] !== null &&
  applicantValue["ECargoApplicant.cCertfCde"] &&
  applicantValue["ECargoApplicant.cCertfCls"]
) {
  const param = {
    coustName: applicantValue["ECargoApplicant.cAppNme"],
    coustMrk: applicantValue["ECargoApplicant.cClntMrk"],
    coustType:applicantValue["ECargoApplicant.cCertfCls"],
    coustCode: applicantValue["ECargoApplicant.cCertfCde"],
    personnelType:"ECargoApplicant"
  }
  qryCustomer(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        if(data){
          console.log('客户数据', data)
          //  tabref ['AgreementApplicant'].setFormValue(data[0])
          let userId = getValue('ECargoApplicant.cCertfCde')
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
      const applicantValue = formPage.getFormDataById("AgreementApplicant") //tabref["AgreementApplicant"].getFormValue();
      if (  id.length !== 18 || (applicantValue["ECargoApplicant.cCertfCls"] !=='120001' && applicantValue["ECargoApplicant.cCertfCls"] !=='19')) {
        return false
      }
          const birthYear = parseInt(id.substring(6, 10), 10);
          const birthMonth = parseInt(id.substring(10, 12), 10);
          const birthDay = parseInt(id.substring(12, 14), 10);
          const birthday = `${birthYear}-${birthMonth.toString().padStart(2, "0")}-${birthDay.toString().padStart(2, "0")}`;
          const sexCode = parseInt(id.substring(16, 17), 10);
          const sex = sexCode % 2 === 0 ? "2" : "1"; // 1: 男, 2: 女
          const age = new Date().getFullYear() - birthYear;

          setValue("ECargoApplicant.cNation", "1"); // 国籍
          setValue("ECargoApplicant.tBirthday", birthday);
          setValue("ECargoApplicant.nAge", age);
          setValue("ECargoApplicant.cSex", sex);
         
          clearValidate('ECargoApplicant.cCertfCde')  
}
function setregistAdd() {
  const ads = applicantEditRef?.value?.getValue("ECargoApplicant.ClntAddrProp");
  const a = applicantEditRef?.value?.getValue("ECargoApplicant.cSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        setAddressStr("ECargoApplicant.cClntAddr", b);
      }
    });
  } else {
    setAddressStr("ECargoApplicant.cClntAddr", a);
  }
}

function setRegisterAdd() {
  const ads = applicantEditRef?.value?.getValue("ECargoApplicant.RegisterProp");
  const a = applicantEditRef?.value?.getValue("ECargoApplicant.cRegisterSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        console.log(b);
        setAddressStr("ECargoApplicant.cRegisteredcapDre", b);
      }
    });
  } else {
    setAddressStr("ECargoApplicant.cRegisteredcapDre", a);
  }
}
function setAddressStr(key: any, data: any) {
  applicantEditRef?.value?.setValue(key, data);
}

function getFormValue() {
  return applicantEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  applicantEditRef?.value?.setFormValue(value);
}

function validate() {
  return applicantEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  applicantEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return applicantEditRef?.value?.getValue(key);
}
function getFormconfig() {
  return formconfig1;
}
function handleFileChange(event: Event) {
  const fileInput = event.target as HTMLInputElement;
}
function getFormConfig(){
  return formconfig1;
}
function setDisabledAll(isDisabled: boolean) {
  applicantEditRef?.value?.setDisabledAll(isDisabled);
}
defineExpose({
  getFormValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormConfig,
  setDisabledAll
});
</script>

<style scoped></style>

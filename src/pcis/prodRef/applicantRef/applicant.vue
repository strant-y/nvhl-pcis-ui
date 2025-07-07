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
import dayjs from "dayjs";
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
import moment from "moment";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { useProductStore } from "@/store/modules/prod";
const productStore = useProductStore();
const dialog = ref<DialogMethod | null>(null);
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
  compKey: {
    type: String,
    required: false,
  },
});

const applicantEditRef = ref<AppFreeEditMethod | null>(null);
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { getDefaultCompilerOptions } from "typescript";
import { getAddressStr,qryCustomer } from "@/api/query";
const opertaor = dataOpertaor();
const formconfig1 = reactive(createAppFreeEditConfig({}));
const formData = ref<any[]>([]);
const cClntAddr = ref<any>(null);
import { useRoute } from "vue-router";
const route = useRoute();
const param = opertaor.getParam();
const fileInputRef = ref(null);
const fileInputType = ref();
import { readFile } from "@/api/file";
const tCertfDate = ref<any[]>([]);
const  cWorkDptList =['310','320','330','340','350','360']  // 单位性质带企业的ID

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
    // setFormItem("Applicant.cIsMicroEntpris", {
    //   rules: null,
    //   disabled: true,
    // });
    //【国民经济行业分类】初始化必填，只有法人时才必填，现在个人也是必填了（老系统需求：040001/042002/043004/043005/043011五款产品不区分法人个人投保，国民经济行业分类都必填，其他产品只有法人才必填）
    const cProdNo = param.cProdNo;
    if (
      cProdNo === "040001" ||
      cProdNo === "042002" ||
      cProdNo === "043004" ||
      cProdNo === "043005" ||
      cProdNo === "043011"
    ) {
      setFormItem("Applicant.cTrdCde", { rules: null });
    }
    if (!cProdNo.startsWith("05")) {
      setFormItem("Applicant.cShareholderName", { hidden: true, rules: null });
      setFormItem("Applicant.cShareholderCode", { hidden: true, rules: null });
      setFormItem("Applicant.cShareholderNature", {
        hidden: true,
        rules: null,
      });
      setFormItem("Applicant.cShareholderCategory", {
        hidden: true,
        rules: null,
      });
    }

    // 处理邮编
    setFormItem("Applicant.cZipCde", {
        'maxlength':6,
      rules: [
        getRules("signlessInt", {}),
        getRules("specifyLength", { len: 6 }),
      ],
    });
    //移动手机校验
    setFormItem("Applicant.cMobile", { rules: [getRules("phoneNo", {})] });
    // 固话
    setFormItem("Applicant.cTel", { rules: [getRules("phone", {})] });
    // 传真校验
    setFormItem("Applicant.cFax", { rules: [getRules("faxNumber", {})] });

    
    if(param.cProdNo === '043009'){
      setFormItem("Applicant.cAgencyReason",{hidden: true});
      setFormItem("Applicant.cLegalRepresentative",{hidden: true});
      setFormItem("Applicant.cEnterpriseTel",{hidden: true});
    }
    
    setFormItem("Applicant.cGcidCode", {rules: [getRules("leiCode", {})]});
    // 关联交易审批单编号
    setFormItem("Applicant.cRelateNo", {rules: [getRules("txnApprovalNo", {})]});
   

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

// 解析身份证
const idAnalysis = (id:string)=>{
      const tabref = opertaor.getTableRefs();
      const applicantValue = tabref["applicant"].getFromValue();
      if (  id.length !== 18 || applicantValue["Applicant.cCertfCls"] !=='120001') {
        return false
      }
          const birthYear = parseInt(id.substring(6, 10), 10);
          const birthMonth = parseInt(id.substring(10, 12), 10);
          const birthDay = parseInt(id.substring(12, 14), 10);
          const birthday = `${birthYear}-${birthMonth.toString().padStart(2, "0")}-${birthDay.toString().padStart(2, "0")}`;
          const sexCode = parseInt(id.substring(16, 17), 10);
          const sex = sexCode % 2 === 0 ? "2" : "1"; // 1: 男, 2: 女
          const age = new Date().getFullYear() - birthYear;

          setValue("Applicant.cNation", "1"); // 国籍
          setValue("Applicant.tBirthday", birthday);
          setValue("Applicant.nAge", age);
          setValue("Applicant.cSex", sex);
         
          clearValidate('Applicant.cCertfCde')  
}



//  根据 客户名称 / 被保人性质/ 证件类型 / 证件号码 获取客户信息
const checkUser = () => {
  console.log('param',param)
// if (param.cRecordType !== 1 && param.cRecordType !== 2 ) {
//     return false;
//   }
 
  // 自定义录单 方案配置 模版 进入 可以查询用户信息  
  if (param.pageType !== "app" &&  param.pageType !== "copy" && param.pageType !== "template" && param.cAppStatus !=='1') {
    return false;
  }
const tabref = opertaor.getTableRefs();
const applicantValue = tabref["applicant"].getFromValue();
//  只要4个有值 去请求客户信息
if (
  applicantValue["Applicant.cAppNme"]&&
  applicantValue["Applicant.cClntMrk"] !== null &&
  applicantValue["Applicant.cCertfCde"] &&
  applicantValue["Applicant.cCertfCls"]
) {
  const param = {
    coustName: applicantValue["Applicant.cAppNme"],
    coustMrk: applicantValue["Applicant.cClntMrk"],
    coustType:applicantValue["Applicant.cCertfCls"],
    coustCode: applicantValue["Applicant.cCertfCde"],
    personnelType:"Applicant"
  }
  qryCustomer(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        if(data){
           tabref ['applicant'].setFormValue(data[0])

          let userId = getValue('Applicant.cCertfCde')
          idAnalysis(userId)
        }
        
            
      
      } else {
        // ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
};

// 绑定方法
const method = {
  // func demo
  funcquery: () => {
    const param = opertaor.getParam();
    dialog.value?.open(
      "querycustomerView",
      {
        type: "show",
        data: {
          cProdNo: param.cProdNo,
        },
      },
      {
        isOk: (selectdata: any) => {
          if (selectdata?.sel) {
            const selobj = JSON.parse(JSON.stringify(selectdata?.sel));
            const newobj = {};
            Object.keys(selobj).forEach((key) => {
              if (key != "_dataId") {
                const k = opertaor.firstCharLower(key);
                newobj["Applicant." + k] = selobj[key];
              }
            });
            newobj["Applicant.cAppNme"] = newobj["Applicant.cClntNme"];
            setFormValue(newobj);
            if (!param.initFlag) {
              setFormItem("Applicant.cAppNme", {
                disabled: true,
              });
              setFormItem("Applicant.cClntMrk", {
                disabled: true,
              });
              setFormItem("Applicant.cCertfCls", {
                disabled: true,
              });
              setFormItem("Applicant.cCertfCde", {
                disabled: true,
              });
            }
          }
        },
      },
      { title: "选择客户信息", width: 70 }
    );
  },
  // 客户姓名
  funCheckUser:()=>{
    checkUser();
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
  // 客户重置
  funcreset: () => {
    const tabref = opertaor.getTableRefs();
    const applicantValue = tabref["applicant"].getFromValue();
    const param = opertaor.getParam();
    for (const k in applicantValue) {
      // 反洗钱不清空
      if (k !== "Applicant.cCustRiskRank" && k !== "Insured.cCustRiskRank") {
        applicantValue[k] = null;
      }
    }

    if (!param.initFlag) {
      setFormItem("Applicant.cAppNme", {
        disabled: false,
      });
      setFormItem("Applicant.cClntMrk", {
        disabled: false,
      });
      setFormItem("Applicant.cCertfCls", {
        disabled: false,
      });
      setFormItem("Applicant.cCertfCde", {
        disabled: false,
      });
    }

    tCertfDate.value = [];
    tabref["applicant"].setFormValue(applicantValue);
  },

  cardTypeChange: (val) => {

       const tabref = opertaor.getTableRefs();
    const applicantValue = tabref["applicant"].getFromValue();
    console.log(val,applicantValue)
    checkUser();
    // 清除报错信息
    clearValidate('Applicant.cCertfCde')  
      // freeEditRef.value?.clearValidate('phoneNo');
    const param = opertaor.getParam();

    if (!param.initFlag) {
      setFormItem("Applicant.cNation", {
        disabled: false,
      });
      setFormItem("Applicant.tBirthday", {
        disabled: false,
      });
      setFormItem("Applicant.nAge", {
        disabled: false,
      });
      setFormItem("Applicant.cSex", {
        disabled: false,
      });
    }

    if (val == "120001") { 
      
      // setValue('Applicant.cCertfCde','')  //选身份证时清空
      setFormItem("Applicant.cCertfCde", {
        rules: [getRules("required", {}), getRules("idCard", {})],
      });
      setFormItem("Applicant.tCertfBgnDate", {
        rules: [getRules("required", {})],
      });

      setFormItem("Applicant.tCertfEndDate", {
        rules: [getRules("required", {})],
      });

      setValue("Applicant.cNation", "1"); // 国籍
      // setValue("Applicant.tBirthday", null);
      // setValue("Applicant.nAge", null);
      // setValue("Applicant.cSex", null);

      if (!param.initFlag) {
        setFormItem("Applicant.cNation", {
          disabled: true,
        });
        setFormItem("Applicant.tBirthday", {
          disabled: true,
        });
        setFormItem("Applicant.nAge", {
          disabled: true,
        });
        setFormItem("Applicant.cSex", {
          disabled: true,
        });
      }
    } else if (val == "110002") {
      setFormItem("Applicant.tCertfEndDate", {
        rules: [getRules("required", {})],
      });
        //证件类型是“营业执照”，参加社会统筹标志变化为必填
        // 参加社会统筹标志
        setFormItem("Applicant.cParticiinsocTyp", {
          rules: [getRules("required", {})],
        });
        
    } else if ( val == "110007") {   
      setFormItem("Applicant.tCertfBgnDate", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.tCertfEndDate", {
        rules: [getRules("required", {})],
      });

      // 统一社会信用代码校验
        setFormItem("Applicant.cCertfCde", {
        rules: [getRules("required", {}),getRules("socialCode", {})],
      });

            // 为法人  企业成立日期
      setFormItem("Applicant.tEstablishingDate", {
        rules: [getRules("required", {})],
      });
    } else if(val == "19"){
      // 外国人证件号
      setFormItem("Applicant.cCertfCde", {
        rules: [getRules("required", {}),getRules("ariCard", {})],
      });
    } else {
      setFormItem("Applicant.cCertfCde", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.tCertfBgnDate", { rules: null });
      setFormItem("Applicant.tCertfEndDate", { rules: null });
      // 参加社会统筹标志
      setFormItem("Applicant.cParticiinsocTyp", {
        rules: null,
      });
    }
  },
  //投保人性质(0是法人 1是个人)
  InsureChange: async (val) => {
    console.log('vvvvvvv',val)
    const param = opertaor.getParam();

    if (val == "0") {
      setFormItem("Applicant.tBirthday", {
        rules: null
      });
      setFormItem("Applicant.nAge", {
        rules: null
      });
      setFormItem("Applicant.cSex", {
        rules: null
      });
      // Applicant.cWorkDpt
      productStore.setcClntMrk(val);
      // 办理人
      setFormItem("Applicant.cCntrNme", { rules: [getRules("required", {})] });
      setFormItem("Applicant.tOperaterCertfEndTm", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.cOperaterCertfTyp", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.cOperaterCertfCde", {
        rules: [getRules("required", {})],
      });

      setFormItem("Applicant.cParticiinsocTyp", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.cCntrCertfCde", {
        rules: [getRules("required", {})],
      });

      
      if (!param.initFlag) {
        setFormItem("Applicant.cWorkDpt", {
        disabled: false,
      });
      setFormItem("Applicant.cIsMicroEntpris", {
        disabled: false,
      });
      setFormItem("Applicant.cIsIndvduBiz", {
        disabled: true,
      });
      // 是否绿色产业客户
      setFormItem("Applicant.cGreenIndustryCustomers", {
        disabled: false,
      });
      }
      setFormItem("Applicant.cWorkDpt", {
        rules: [getRules("required", {})],
      });
      //是否个体工商户
      setValue("Applicant.cIsIndvduBiz", "");
      // 是否绿色产业客户
      setFormItem("Applicant.cGreenIndustryCustomers", {
        rules: [getRules("required", {})],
      });

      // 参加社会统筹标志
      setFormItem("Applicant.cParticiinsocTyp", {
        rules: [getRules("required", {})],
      });
      //注册地址
      setFormItem("Applicant.cRegisteredcapDre", {
        rules: [getRules("required", {})],
      });
 
      //实名认证方式
      let cWorkDpt = getValue('Applicant.cWorkDpt')
      if(cWorkDptList.includes(cWorkDpt)){
          setFormItem("Applicant.cRealnameAuthType", {
            rules: [getRules("required", {})],
          });
      }else{
          setFormItem("Applicant.cRealnameAuthType", {
            rules: [],
          });
      }
   
 
   
      let cMobile = getValue('Applicant.cMobile');  // 移动 
      let cTel = getValue('Applicant.cTel');  // 固定电话    
      if(!cMobile &&  !cTel ){
         setFormItem("Applicant.cMobile", {
          rules: [getRules("required", {}), getRules("phoneNo", {})],
        });
      }else  if(cMobile){
        setFormItem("Applicant.cTel", { rules: [getRules("phone", {})] });
        setFormItem("Applicant.cMobile", { rules: [getRules("required", {}), getRules("phoneNo", {})]})
      } else if(cTel){
        setFormItem("Applicant.cTel", { rules: [getRules("required", {}),getRules("phone", {})] });
        setFormItem("Applicant.cMobile", { rules: [ getRules("phoneNo", {})]})
      }

      // 是否个体工商户
      setFormItem("Applicant.cIsIndvduBiz", {
        rules: [],
      });
         // 为法人 国民经济行业必填
      setFormItem("Applicant.cTrdCde", {
        rules: [getRules("required", {})],
      });

      // 性别 、年龄、生日个人必填
      setFormItem("Applicant.tBirthday", {
        rules: [],
      });
      setFormItem("Applicant.nAge", {
      rules: [],
      });
      setFormItem("Applicant.cSex", {
        rules: [],
      });


           codeListStore
        .queryCodeList({
          codeListName: "UN_NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          if (
            !res.some((item) =>
              Object.values(item).includes(getValue("Applicant.cCertfCls"))
            )
          ) {
            setValue("Applicant.cCertfCls", "");
          }
          setFormItem("Applicant.cCertfCls", {
            loadData: [],
          });
          setFormItem("Applicant.cCertfCls", {
            loadData: res,
            rules: [getRules("required", {})],
          });
        });
    } else {
      setFormItem("Applicant.tBirthday", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.nAge", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.cSex", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.cWorkDpt", { rules: null });
      setFormItem("Applicant.cIsMicroEntpris", {
        disabled: true,
      });
      //参加社会统筹标志
      setFormItem("Applicant.cParticiinsocTyp", {
        rules: null,
      });
      //注册地址
      setFormItem("Applicant.cRegisteredcapDre", { rules: null });
      //是否个体工商户
      setFormItem("Applicant.cIsIndvduBiz", {
        disabled: false,
      });
      // 是否绿色产业客户
      setFormItem("Applicant.cGreenIndustryCustomers", {
        rules: null,
        disabled: true,
      });

         // 是否绿色详情
      setFormItem("Applicant.cGreenIndustryList", {
        rules: null,
        disabled: true,
      });
      setValue("Applicant.cGreenIndustryCustomers", "");
      setValue("Applicant.cGreenIndustryList", "");

      // 为法人  企业成立日期
      setFormItem("Applicant.tEstablishingDate", {
        rules: null,
      });
 
      setValue("Applicant.cIsMicroEntpris", "");
      //是否分支机构
      setValue("Applicant.cIsBranch", "1");

      setFormItem("Applicant.cCntrNme", { rules: null });
      setFormItem("Applicant.tOperaterCertfEndTm", { rules: null });
      setFormItem("Applicant.cOperaterCertfTyp", { rules: null });
      setFormItem("Applicant.cOperaterCertfCde", { rules: null });

      setFormItem("Applicant.cCntrCertfCde", { rules: null });

      setFormItem("Applicant.cTrdCde", {
        rules: [],
      });

      //实名认证方式
      setFormItem("Applicant.cRealnameAuthType", {
        rules: [],
      });

      // 个人 移动电话必填  
      setFormItem("Applicant.cMobile", {
        rules: [ getRules("required", {}), getRules("phoneNo", {})],
      });
      setFormItem("Applicant.cTel", { rules: [getRules("phone", {})] });
      setFormItem("Applicant.cIsIndvduBiz", {
        rules: [getRules("required", {})],
      });

      // 性别 、年龄、生日个人必填
      setFormItem("Applicant.tBirthday", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.nAge", {
      rules: [getRules("required", {})],
      });
      setFormItem("Applicant.cSex", {
        rules: [getRules("required", {})],
      });

      codeListStore
        .queryCodeList({
          codeListName: "NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          if (
            !res.some((item) =>
              Object.values(item).includes(getValue("Applicant.cCertfCls"))
            )
          ) {
            setValue("Applicant.cCertfCls", "");
          }
          setFormItem("Applicant.cCertfCls", {
            loadData: [],
          });
          setFormItem("Applicant.cCertfCls", {
            loadData: res,
            rules: [getRules("required", {})],
          });
        });
    }

      checkUser();
  },
  //大股东性质change事件
  funcShareholderNature: (val) => {
    if (val == "1") {
      codeListStore
        .queryCodeList({
          codeListName: "NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          if (
            !res.some((item) =>
              Object.values(item).includes(
                getValue("Applicant.cShareholderCategory")
              )
            )
          ) {
            setValue("Applicant.cShareholderCategory", "");
          }
          setFormItem("Applicant.cShareholderCategory", {
            loadData: [],
          });
          setFormItem("Applicant.cShareholderCategory", {
            loadData: res,
          });
        });
    } else {
      codeListStore
        .queryCodeList({
          codeListName: "UN_NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          if (
            !res.some((item) =>
              Object.values(item).includes(
                getValue("Applicant.cShareholderCategory")
              )
            )
          ) {
            setValue("Applicant.cShareholderCategory", "");
          }
          setFormItem("Applicant.cShareholderCategory", {
            loadData: [],
          });
          setFormItem("Applicant.cShareholderCategory", {
            loadData: res,
          });
        });
    }
  },

  // 是否个体工商户
  cIsIndvduBizChange: (val: any) => {
    console.log('触发了',val)
    if (val == "1") {
      setFormItem("Applicant.cOccupCde", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.cTrdCde", {
        rules: [getRules("required", {})],
      });
    } else if(val == "0") {
      setFormItem("Applicant.cOccupCde", {
        rules: [],
      });
      setFormItem("Applicant.cTrdCde", {
        rules: [],
      });
    }
  },
  funcNdustryCate: () => {
    const param = opertaor.getParam();
    dialog.value?.open(
      "ndustryCateModal",
      {
        type: "show",
        method: {
          getdbClickData: (data) => {
            setFormItem("Applicant.cTrdCde", {
              loadData: [{ label: data.cnm, value: data.cde }],
            });
           // setValue("Applicant.cTrdCde", data.cnm);
            setValue("Applicant.cTrdCde", data.cde);
            dialog.value?.handleClose();
          },
        },
      },
      {},
      { title: "国民经济行业分类", width: 85 }
    );
  },
  cOccupCdeChange: () => {
    const param = opertaor.getParam();
    dialog.value?.open(
      "cOccupCdeModal",
      {
        type: "show",
        method: {
          getdbClickData: (data) => {
            setFormItem("Applicant.cOccupCde", {
              loadData: [{ label: `${data.cde} ${data.cnm}`, value: data.cde }],
            });
            setValue("Applicant.cOccupCde", data.cde);
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

  // 证件有效期长期标识
  tCertMrkChecked: (val:any) => {
    const param = opertaor.getParam();
    if (val == "1") {
      setValue(
        "Applicant.tCertfEndDate",
        moment(new Date("2099-12-31")).format("YYYY-MM-DD HH:mm:ss")
      );
        setFormItem("Applicant.tCertfEndDate", { disabled: true });

      // let cCertfCls = getValue('Applicant.cCertfCls');  // 证件类型   110007  120001
      // if(cCertfCls ==="120001" || cCertfCls ==="110008=7"){
      //     setFormItem("Applicant.tCertfBgnDate", {  rules: [getRules("required", {})],});
      //     setFormItem("Applicant.tCertfEndDate", { disabled: true , rules: [getRules("required", {})],});
      // }else{
      //   setFormItem("Applicant.tCertfBgnDate", {  rules: [],});
      //   setFormItem("Applicant.tCertfEndDate", { disabled: true , rules: [],});
      // }

    } else {
      if(tCertfDate.value.length>0){
        setValue("Applicant.tCertfBgnDate", tCertfDate.value[0] || "");
        setValue("Applicant.tCertfEndDate", tCertfDate.value[1] || "");
      }
        setFormItem("Applicant.tCertfEndDate", { disabled: false });
      
      // let cCertfCls = getValue('Applicant.cCertfCls');  // 证件类型   110007  120001
      // if(cCertfCls ==="120001" || cCertfCls ==="110008=7"){
      //     setFormItem("Applicant.tCertfBgnDate", {     rules: [getRules("required", {})],});
      //     setFormItem("Applicant.tCertfEndDate", {    rules: [getRules("required", {})],});

      // }else{
      //      setFormItem("Applicant.tCertfBgnDate", {     rules: []});
      //     setFormItem("Applicant.tCertfEndDate", {    rules: []});
      // }
    }
  },
  // 移动电话 切换
  mobileChange: (val) => {
    let cClntMrk =  getValue('Applicant.cClntMrk'); // 法人  1个人  0法人
 
    if (cClntMrk &&  val) {
      setFormItem("Applicant.cMobile", {
        rules: [getRules("required", {}), getRules("phoneNo", {})],
      });
      setFormItem("Applicant.cTel", { rules: [getRules("phone", {})] });
    }

    setValue('Applicant.cEnterpriseTel',val)
  },
  // 固定电话
  cTelChange: (val) => {
    let cClntMrk =  getValue('Applicant.cClntMrk'); // 法人  1个人  0法人
    let cMobile = getValue('Applicant.cMobile');  // 移动 

    if (cClntMrk =='0' && val && !cMobile) {
      setFormItem("Applicant.cTel", {
        rules: [getRules("phone", {}), getRules("required", {})],
      });
      setFormItem("Applicant.cMobile", { rules: getRules("phoneNo", {}) });
    }
  },
  emailChange: (val) => {
    if (val) {
      setFormItem("Applicant.cEmail", { rules: [getRules("email", {})] });
    }
  },
  cCountryChange: (val) => {
    setValue("Applicant.cCity", "");
    setValue("Applicant.cProvince", "");
    setValue("Applicant.cCounty", "");
    if (val) {
      codeListStore
        .queryCodeList({
          codeListName: "WEB_BAS_AREA",
          codeListParam: { cParCde: val, cType: "1" },
        })
        .then((res) => {
          const objData = {
            loadData: res,
          };
          setFormItem("Applicant.cProvince", objData);
        });
    }
  },
  cProvinceChange: (val) => {
    setValue("Applicant.cCity", "");
    setValue("Applicant.cCounty", "");
    if (val) {
      codeListStore
        .queryCodeList({
          codeListName: "WEB_BAS_AREA",
          codeListParam: { cParCde: val, cType: "2" },
        })
        .then((res) => {
          const objData = {
            loadData: res,
          };
          setFormItem("Applicant.cCity", objData);
        });
    }
  },
  cCityChange: (val) => {
    setValue("Applicant.cCounty", "");
    codeListStore
      .queryCodeList({
        codeListName: "WEB_BAS_AREA",
        codeListParam: { cParCde: val, cType: "3" },
      })
      .then((res) => {
        const objData = {
          loadData: res,
        };
        setFormItem("Applicant.cCounty", objData);
      });
  },
  handleClose: (val) => {},
  // 是否绿色产业客户change
  ApplicantIsGreen: (val) => {
    // 控制绿色产业细分列表是否必填
    if (val == "1") {
      setFormItem("Applicant.cGreenIndustryList", {
        rules: [getRules("required", {})],
        disabled: false,
      });
    } else {
      setFormItem("Applicant.cGreenIndustryList", { rules: null,  disabled: true, });
      setValue('Applicant.cGreenIndustryList','')
    }
  },
  // 证件号码change
  cCertfCdeChange: (val) => {

    const tabref = opertaor.getTableRefs();
    const cCertfCls = tabref["applicant"].getFromValue()["Applicant.cCertfCls"];
    if (cCertfCls == "120001") {
      if (val) {
        const certfCde = applicantEditRef.value?.getValue(
          "Applicant.cCertfCde"
        );
        if (certfCde && certfCde.length === 18) {
            // idAnalysis(val)
        }
      }
    }


    checkUser();
  },
  //注册地市是否同上
  isSameChange: (val) => {
    const param = opertaor.getParam();
    if (param.initFlag) {
      return ;
    }
    
    if (val == "1") {
      const ads = applicantEditRef?.value?.getValue("Applicant.AllProp");
      const a =
        applicantEditRef?.value?.getValue("Applicant.cRegisterSuffixAddr") ||
        "";

      applicantEditRef?.value?.setValue("Applicant.Prop", ads);
      applicantEditRef?.value?.setValue("Applicant.cSuffixAddr", a);
    } else {
    }
  },
  //注册地址
  getCountry: (val: any) => {
    setRegisterAdd();
  },
  //常住地址
  getAllProp: (val: any) => {
    setregistAdd();
  },
  //注册地址(input)
  getcSuffixAddr: (val: any) => {
    setRegisterAdd();
  },
  //常住地址(input)
  getcRegisterSuffixAddr: (val: any) => {
    setregistAdd();
  },
  // 读取身份证
  readIdCard: (val: any) => {
    fileInputRef.value?.click();
    fileInputType.value = "1";
  },
  // 读取外国人永久居留身份证
  readGreenCard: (val: any) => {
    fileInputRef.value?.click();
    fileInputType.value = "2";
  },
  // 单位性质
  cWorkDptChange:(val:any,lab:any)=>{
      console.log('单位性质',val,lab)
      let cClntMrk = getValue('Applicant.cClntMrk');  // 投保人性质 
      if(cWorkDptList.includes(val) && cClntMrk =='0'){
          //实名认证方式
          setFormItem("Applicant.cRealnameAuthType", {
            rules: [getRules("required", {})],
          });
      }else{
          setFormItem("Applicant.cRealnameAuthType", {
            rules: [],
          });
      }

      if(val =='350'){
        setFormItem("Applicant.cGcidCode", {
          rules: [getRules("required", {}),getRules("leiCode", {})],
        });
      }else if(val){
        setFormItem("Applicant.cGcidCode", {
          rules: [getRules("leiCode", {})],
        });
      }
  },
   // 办理人员证件种类
  cOperaterCertfTypChange:(val: any)=>{
    console.log(val)
    // 清除报错信息
    clearValidate('Applicant.cOperaterCertfCde')  

    //  身份证
    if (val == "120001") { 
        setFormItem("Applicant.cOperaterCertfCde", {
              rules: [getRules("idCard", {}),],
            });
    } else if ( val == "110007") {   
      // 统一社会信用代码校验
           setFormItem("Applicant.cOperaterCertfCde", {
              rules: [getRules("socialCode", {}),],
            });
    } else if(val == "19"){
      // 外国人证件号
           setFormItem("Applicant.cOperaterCertfCde", {
              rules: [getRules("ariCard", {}),],
            });
    } else if (val == "120002") {
      // 护照
   
      setFormItem("Applicant.cOperaterCertfCde", {
              rules: [getRules("passPort", {}),],
            });
    }else if(val =='110001'){
      // 组织机构编码校验
           setFormItem("Applicant.cOperaterCertfCde", {
              rules: [getRules("orgCode", {}),],
            });
    } else {
           setFormItem("Insured.cOperaterCertfCde", {
              rules: [],
            });
    }
  },
  // 证件有效起期
  tCertfBgnDateDisable:(date:any)=>{
    const fs = applicantEditRef.value?.getFromValue();
    if (fs && JSON.stringify(fs) !== '{}') {

      const endDate = new Date(fs["Applicant.tCertfEndDate"] || '')   // 结束时间 
      let minDate = dayjs(endDate).valueOf();
      return   date.getTime() > minDate
    }else{
        return true;
    }

  },
  // 证件有效止期
  tCertfEndDateDisable:(date:any)=>{
    const fs = applicantEditRef?.value?.getFromValue();
    if (fs && JSON.stringify(fs) !== '{}') {
      const startDate = new Date(fs["Applicant.tCertfBgnDate"]|| '')   // 开始时间   
      let maxDate = dayjs(startDate).valueOf();
        return   date.getTime() < maxDate
    }else{
        return true;
    }
  }
};

function setregistAdd() {
  const ads = applicantEditRef?.value?.getValue("Applicant.AllProp");
  const a =
    applicantEditRef?.value?.getValue("Applicant.cRegisterSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        setAddressStr("Applicant.cClntAddr", b);
      }
    });
  } else {
    setAddressStr("Applicant.cClntAddr", a);
  }
}

function setRegisterAdd() {
  const ads = applicantEditRef?.value?.getValue("Applicant.Prop");
  const a = applicantEditRef?.value?.getValue("Applicant.cSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        setAddressStr("Applicant.cRegisteredcapDre", b);
      }
    });
  } else {
    setAddressStr("Applicant.cRegisteredcapDre", a);
  }
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
  if (fileInput.files && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    // 处理文件上传逻辑
    const param = {
      file: file,
      type: fileInputType.value,
    };
    readFile(param)
      .then((res: any) => {
        if (res.code === 200 && res.data && res.data.result) {
          tCertfDate.value = [];
          if (fileInputType.value === "1") {
            // 身份证
            const result = res.data.result.item_list;
            const keys = result.map((item: any) => item.key);
            let cardInfo = {};
            keys.forEach((key: any) => {
              const value = result.find((item: any) => item.key === key).value;
              cardInfo[key] = value;
            });
            if (cardInfo["id_number"])
              setValue("Applicant.cCertfCde", cardInfo["id_number"]);
            if (cardInfo["name"])
              setValue("Applicant.cAppNme", cardInfo["name"]);
            if (cardInfo["sex"])
              setValue("Applicant.cSex", cardInfo["sex"] === "男" ? "1" : "2");
            if (cardInfo["date_of_birth"])
              setValue(
                "Applicant.tBirthday",
                cardInfo["date_of_birth"]
                  .replace(/(年|月)/g, "-")
                  .replace("日", "")
              );
            if (cardInfo["validate_date"]) {
              tCertfDate.value = cardInfo["validate_date"].split("-");
              setValue(
                "Applicant.tCertfBgnDate",
                cardInfo["validate_date"].split("-")[0]
              );
              if (cardInfo["validate_date"].split("-")[1] === "长期") {
                setValue("Applicant.cLongendTyp", "1");
              } else {
                setValue("Applicant.cLongendTyp", "0");
                setValue(
                  "Applicant.tCertfEndDate",
                  cardInfo["validate_date"].split("-")[1]
                );
              }
            }
            setValue("Applicant.cCertfCls", "120001");
            setValue("Applicant.cClntMrk", "1");
            if (cardInfo["id_number"])
              idAnalysis(cardInfo["id_number"])

          }
          if (fileInputType.value === "2") {
            // 外国人永久居留身份证
            const cardInfo = res.data.result.details;
            setValue("Applicant.cLongendTyp", "0");
            setValue(
              "Applicant.cCertfCde",
              cardInfo["id_number"]["value"] || null
            );
            setValue("Applicant.cAppNme", cardInfo["name"]["value"] || null);
            setValue(
              "Applicant.cSex",
              cardInfo["sex"]["value"]
                ? cardInfo["sex"]["value"].split("/")[0] === "男"
                  ? "1"
                  : "2"
                : null
            );
            setValue(
              "Applicant.tBirthday",
              cardInfo["date_of_birth"]["value"]
                ? cardInfo["date_of_birth"]["value"].replace(".", "-")
                : null
            );
            if (cardInfo["period_of_validity"]["value"]) {
              tCertfDate.value =
                cardInfo["period_of_validity"]["value"].split("-");
              setValue("Applicant.cLongendTyp", "0");
              setValue(
                "Applicant.tCertfBgnDate",
                cardInfo["period_of_validity"]["value"].split("-")[0] || null
              );
              setValue(
                "Applicant.tCertfEndDate",
                cardInfo["period_of_validity"]["value"].split("-")[1] || null
              );
            }
            setValue("Applicant.cCertfCls", "19");
            setValue("Applicant.cClntMrk", "1");
          }

           checkUser();
        }
      })
      .catch((err) => {
        ElMessage.error(err);
      });
    fileInputRef.value.value = ""; // 清空文件输入框的值
  }
}

function clearValidate(key=null) {
  applicantEditRef?.value?.clearValidate(key);
}
defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig,
  clearValidate,
  setFormItem
});
</script>

<style scoped></style>

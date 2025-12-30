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
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { useProductStore } from "@/store/modules/prod";
const productStore = useProductStore();
const dialog = ref<DialogMethod | null>(null);
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import {calculateAgeFromIdCard} from "@/utils/common";
import { reset } from "@/api/query";

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const applicantEditRef = ref<AppFreeEditMethod | null>(null);
import { getAddressStr,qryCustomer } from "@/api/query";
import dayjs from "dayjs";
const formconfig1 = reactive(createAppFreeEditConfig({}));
const fileInputRef = ref(null);
import moment from "moment/moment";
import {idxParamKey, useIdxParam} from "@/views/pcis/support/useIdxParam";
import { setCapitalRequiredRule, disablePastDates } from "@/utils/InsuranceCoverageRules";
import { validateIdCard } from "@/typings/method-public";

const idxParam = inject(idxParamKey, useIdxParam());
const formPage = idxParam?.formPage;
const param = idxParam.param;
const initFlag = computed(() => formPage.init);
const cWorkDptList =['310','320','330','340','350','360']  // 单位性质带企业的ID
onMounted(() => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    getRules
  );
  Object.assign(formconfig1, formconfig11);
  nextTick(() => {
    //是否小微企业，默认非必填、只读
    // setFormItem("ECargoApplicant.cIsMicroEntpris", {
    //   rules: null,
    //   disabled: true,
    // });
    setValue("ECargoApplicant.cNation", "CHN"); // 国籍默认中国
    // 客户名称增加校验规则
    setFormItem("ECargoApplicant.cAppNme", { rules: [getRules("required", {}), getRules("cAppNme", {})], });
    
    // 处理邮编
    setFormItem("ECargoApplicant.cZipCde", {
      'maxlength': 6,
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
    if(!getValue('ECargoApplicant.cCustRiskRank')){
      setValue('ECargoApplicant.cCustRiskRank','925104')
    }

    setFormItem("ECargoApplicant.cGcidCode", { rules: [getRules("leiCode", {})] });
    // 关联交易审批单编号
    setFormItem("ECargoApplicant.cRelateNo", { rules: [getRules("txnApprovalNo", {})] });
    // 经常居住地校验
    setFormItem("ECargoApplicant.cHabitualResidence", { rules: [getRules("valiAddress", {})] });
    // 证件号码
    // setFormItem("Applicant.cCertfCde", { minWidth: '165px' });
    if((param.pageType === "EDR_APP_NEW_SCENE" || param.pageType === "TEMPORARY_DEPOSIT") && (param.cTransMrk == '1' || param.cRsnCde === '99' || param.cEdrRsnBundle === '99' || param.cEdrRsnBundleCde === '99')) {
      setFormItem("ECargoApplicant.cCertfCls", { disabled: false });
      setFormItem("ECargoApplicant.cCertfCde", { disabled: false });
    }
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
const handelItemShow = (data:any)=>{
  // 遍历主数组
  data.forEach(item => {
    // 情况1: 直接存在rules属性
    if (item.rules && Array.isArray(item.rules)) {
      const hasRequiredRule = item.rules.some(rule =>
          rule.required === true
      );
      if (hasRequiredRule && item.prop) {
        setFormItem(item.prop,{hidden:false})
      }else {
        setFormItem(item.prop,{hidden:true})
      }
    }else if (!item.rules && item.groupList && Array.isArray(item.groupList)) {
      // debugger
      // 情况2: 存在groupList属性
      let hasRequiredInGroup = false;

      // 遍历groupList中的每个元素
      item.groupList.forEach(groupItem => {
        if (groupItem.rules && Array.isArray(groupItem.rules)) {
          const hasRequiredRule = groupItem.rules.some(rule =>
              rule.required === true
          );

          if (hasRequiredRule) {
            hasRequiredInGroup = true;
          }
        }
      });
      // 如果groupList中有任意一个元素满足条件，且外层对象有prop属性
      if (hasRequiredInGroup && item.prop) {
        setFormItem(item.prop,{hidden:false})
      }else {
        setFormItem(item.prop,{hidden:true})
      }
    }else {
      setFormItem(item.prop,{hidden:true})
    }
  });
}

// 绑定方法
const method = {
  // func demo
  funcquery: () => {},
  // 客户姓名
  funCheckUser:(val: any)=>{
		if (val) {
      setValue("ECargoApplicant.cAppNme", val.trim())// 去除首位空格
      checkUser();
    }
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
    const applicantValue = getFormValue();
    for (const k in applicantValue) {
      // 反洗钱不清空
      if (k !== "ECargoApplicant.cCustRiskRank") {
        applicantValue[k] = null;
      }
    }
    if (!initFlag.value) {
      setFormItem("ECargoApplicant.cAppNme", {
        disabled: false,
      });
      setFormItem("ECargoApplicant.cClntMrk", {
        disabled: false,
      });
      setFormItem("ECargoApplicant.cCertfCls", {
        disabled: false,
      });
      setFormItem("ECargoApplicant.cCertfCde", {
        disabled: false,
      });
      resetFn()
    }
    setFormValue(applicantValue);
  },
	// 证件类型
	cardTypeChange: (val:any) => {
    const personFields = ['cNation', 'tBirthday', 'nAge', 'cSex'];

    if (!initFlag.value) {
      checkUser();   // 调用客户信息接口
      clearValidate('ECargoApplicant.cCertfCde')  // 清除报错信息
    }
    if (!idxParam.readonly) {
      personFields.forEach(field => {
        setFormItem(`ECargoApplicant.${field}`, { disabled: false });
      });
    }

    setFormItem("ECargoApplicant.tCertfBgnDate", { rules: null });
    setFormItem("ECargoApplicant.tCertfEndDate", { rules: null });
    setFormItem("ECargoApplicant.tEstablishingDate", { rules: null });

    if (val == "111") {
      setFormItem("ECargoApplicant.cCertfCde", {
        rules: [getRules("required", {}), getRules("idCard", {})],
      });
      setFormItem("ECargoApplicant.tCertfBgnDate", {
        rules: [getRules("required", {})],
      });

      setFormItem("ECargoApplicant.tCertfEndDate", {
        rules: [getRules("required", {})],
      });
      setValue("ECargoApplicant.cNation", "CHN"); // 国籍

      personFields.forEach(field => {
        setFormItem(`ECargoApplicant.${field}`, { disabled: true });
      });

    } else if (val == "110002") {
      setFormItem("ECargoApplicant.tCertfEndDate", {
        rules: [getRules("required", {})],
      });
    } else if (val == "01") {
      setFormItem("ECargoApplicant.tCertfBgnDate", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.tCertfEndDate", {
        rules: [getRules("required", {})],
      });

      // 统一社会信用代码校验
      setFormItem("ECargoApplicant.cCertfCde", {
        rules: [getRules("required", {}), getRules("socialCode", {})],
      });

      // 为法人  企业成立日期
      setFormItem("ECargoApplicant.tEstablishingDate", {
        rules: [getRules("required", {})],
      });
    } else if (val === '07') {
      // 护照
      setFormItem("ECargoApplicant.cCertfCde", {
        rules: [getRules("required", {}), getRules("passPort", {})],
      });
    } else if (val == "553") {
      // 外国人证件号
      setFormItem("ECargoApplicant.cCertfCde", {
        rules: [getRules("required", {}), getRules("ariCard", {})],
      });
    } else {
      setFormItem("ECargoApplicant.cCertfCde", {
        rules: [getRules("required", {})],
      });
    }

    if (initFlag.value) return;

    // 切换清空
    if (val) {
      const fieldsToClear = ["ECargoApplicant.tBirthday", "ECargoApplicant.nAge", "ECargoApplicant.cCertfCde"];
      // 2. 循环赋值 null + 清除对应字段的校验错误
      fieldsToClear.forEach(field => {
        setValue(field, null);
        // 清除该字段的校验错误 
        setTimeout(() => {
          clearValidate(field);
        }, 10);
      });
    }
  },
  //证件有效期止期时间事件改变
  tCertfEndDateChange: (val:any) => {
    const tIssueTm = formPage.getFormDataById("AgreementBase")["ECargoBase.tIssueTm"] //签单日期
    const tinsrncBgnTm = formPage.getFormDataById("AgreementBase")["ECargoBase.tInsrncBgnTm"] //协议开始时间
    if (val && tIssueTm && tinsrncBgnTm) {
      const certfEndDate = new Date(val).getTime();
      const issueTm = new Date(tIssueTm).getTime();
      const insrncBgnTm = new Date(tinsrncBgnTm).getTime();
      if (certfEndDate < issueTm) {
        ElMessage.error("投保人证件有效期小于协议签单时间，请关注!");
        // setValue("Insured.tCertfEndDate", '');
      }
      if (certfEndDate < insrncBgnTm) {
        ElMessage.error("投保人证件有效期小于协议开始时间，请关注!");
      }
    }
  },
  //企业成立时间事件改变
  tEstablishingDateChange: (val:any) => {
    const tAppTm = formPage.getFormDataById("AgreementBase")["ECargoBase.tAppTm"]  //协议投保日期
    const tIssueTm = formPage.getFormDataById("AgreementBase")["ECargoBase.tIssueTm"] //签单日期
    if (val && tAppTm && tIssueTm) {
      const establishingDate = new Date(val).getTime();
      const appTm = new Date(tAppTm).getTime();
      const issueTm = new Date(tIssueTm).getTime();
      if (establishingDate > issueTm) {
        ElMessage.error("企业成立时间小于保单签单时间，请关注!");
      }
      if (establishingDate > appTm) {
        ElMessage.error("企业成立时间小于协议投保日期，请关注!");
      }
    }
  },
	//投保人性质(0是法人 1是个人)
  InsureChange: async (val:any) => {
    if (val == "0") {
      // 投保人是法人，出生日期、年龄、性别、职业类别、经营范围、婚姻状况隐藏,国籍必填可修改
      setFormItem("ECargoApplicant.tBirthday", {
        hidden: true,
        rules: null
      });
      setFormItem("ECargoApplicant.nAge", {
        hidden: true,
        rules: null
      });
      setFormItem("ECargoApplicant.cSex", {
        hidden: true,
        rules: null
      });
      setFormItem("ECargoApplicant.cNation", {
        rules: [getRules('required',{})],
      });
      setFormItem("ECargoApplicant.cOccupTyp", {
        hidden: true,
      });
      setFormItem("ECargoApplicant.cBusinessScope", {
        hidden: true,
      });
      setFormItem("ECargoApplicant.cMrgCde", {
        hidden: true,
        rules: null,
      });
      setFormItem("ECargoApplicant.cIsBranch", {
        hidden: false,
      });
      setFormItem("ECargoApplicant.cStkMrk", {
        hidden: false,
      });
      setCapitalRequiredRule(getValue, setFormItem, 'ECargoApplicant');
      clearValidate('ECargoApplicant.tBirthday')
      clearValidate('ECargoApplicant.nAge')
      clearValidate('ECargoApplicant.cSex')
      productStore.setcClntMrk(val);
      setFormItem("ECargoApplicant.cEnterpriseTel", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.cCntrCertfCde", {
        rules: [getRules("required", {})],
      });
      if (!initFlag.value) {
        setFormItem("ECargoApplicant.cWorkDpt", {
          disabled: false,
        });
        setFormItem("ECargoApplicant.cIsMicroEntpris", {
          disabled: false,
        });
        setFormItem("ECargoApplicant.cIsIndvduBiz", {
          disabled: true,
        });
        // 是否绿色产业客户
        setFormItem("ECargoApplicant.cGreenIndustryCustomers", {
          disabled: false,
        });
        // 绿色客户 如果为时就放开
        if (getValue('ECargoApplicant.cGreenIndustryCustomers') == '1') {
          setFormItem("ECargoApplicant.cGreenIndustryList", {
            rules: [getRules("required", {})],
            disabled: false,
          });
        }
        //是否个体工商户
        setValue("ECargoApplicant.cIsIndvduBiz", "");
      }
      setFormItem("ECargoApplicant.cWorkDpt", {
        rules: [getRules("required", {})],
      });
      // 是否绿色产业客户
      setFormItem("ECargoApplicant.cGreenIndustryCustomers", {
        rules: [getRules("required", {})],
      });
      // 参加社会统筹标志
      setFormItem("ECargoApplicant.cParticiinsocTyp", {
        rules: [getRules("required", {})],
      });
      // 注册地址
      setFormItem("ECargoApplicant.RegisterProp", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.cRegisterSuffixAddr", {
        rules: [getRules("required", {})],
      });
      // 单位性质 --为企业做必填校验
      const cWorkDpt = getValue('ECargoApplicant.cWorkDpt')
      const isSpecialCase = cWorkDptList.includes(cWorkDpt);
      const requiredRule = [getRules("required", {})];
      // 法定代表人/责任人
      setFormItem("ECargoApplicant.cLegalRepresentative", {
        rules: isSpecialCase ? requiredRule : []
      });
      // 企业成立日
      setFormItem("ECargoApplicant.tEstablishingDate", {
        rules: isSpecialCase ? requiredRule : []
      });
      let cMobile = getValue('ECargoApplicant.cMobile');  // 移动 
      let cTel = getValue('ECargoApplicant.cTel');  // 固定电话    
      if (!cMobile && !cTel) {
        setFormItem("ECargoApplicant.cMobile", {
          rules: [getRules("required", {}), getRules("phoneNo", {})],
        });
      } else if (cMobile) {
        setFormItem("ECargoApplicant.cTel", { rules: [getRules("phone", {})] });
        setFormItem("ECargoApplicant.cMobile", { rules: [getRules("required", {}), getRules("phoneNo", {})] })
      } else if (cTel) {
        setFormItem("ECargoApplicant.cTel", { rules: [getRules("required", {}), getRules("phone", {})] });
        setFormItem("ECargoApplicant.cMobile", { rules: [getRules("phoneNo", {})] })
      }
      // 是否个体工商户
      setFormItem("ECargoApplicant.cIsIndvduBiz", {
        rules: [],
      });
      // 为法人 国民经济行业必填
      setFormItem("ECargoApplicant.cTrdCde", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.cIsMicroEntpris", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.nRegisteredCapital", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.cFirmscaleTyp", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.cLegalRepresentative", {
        rules: [getRules("required", {})],
      });
      // 性别 、年龄、生日个人必填
      setFormItem("ECargoApplicant.tBirthday", {
        rules: [],
      });
      setFormItem("ECargoApplicant.nAge", {
        rules: [],
      });
      setFormItem("ECargoApplicant.cSex", {
        rules: [],
      });
      setFormItem("ECargoApplicant.cEdubackgroudTyp", {
        rules: [],
      });
      setFormItem("ECargoApplicant.nYearincomeNum", {
        rules: [],
      });
    } else {
      setFormItem("ECargoApplicant.tBirthday", {
        hidden: false,
      });
      setFormItem("ECargoApplicant.nAge", {
        hidden: false,
      });
      setFormItem("ECargoApplicant.cSex", {
        hidden: false,
      });
      setFormItem("ECargoApplicant.cNation", {
        rules: [],
      });
      setFormItem("ECargoApplicant.cOccupTyp", {
        hidden: false,
      });
      setFormItem("ECargoApplicant.cBusinessScope", {
        hidden: false,
      });
      setFormItem("ECargoApplicant.cMrgCde", {
        hidden: false,
        rules: [getRules("required", {})],
      });
      // 投保人是个人，是否分支机构、 股东客户隐藏
      setFormItem("ECargoApplicant.cIsBranch", {
        hidden: true,
      });
      setFormItem("ECargoApplicant.cStkMrk", {
        hidden: true,
      });
      setFormItem("ECargoApplicant.tBirthday", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.nAge", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.cSex", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.cWorkDpt", { rules: null });
      setFormItem("ECargoApplicant.cIsMicroEntpris", {
        disabled: true,
      });
      //参加社会统筹标志
      setFormItem("ECargoApplicant.cParticiinsocTyp", {
        rules: null,
      });
      //注册地址
      // setFormItem("ECargoApplicant.cRegisteredcapDre", { rules: null });
      setFormItem("ECargoApplicant.RegisterProp", {
        rules: null,
      });
      setFormItem("ECargoApplicant.cRegisterSuffixAddr", {
        rules: null,
			});
			if (!initFlag.value) {
      	//是否个体工商户
				setFormItem("ECargoApplicant.cIsIndvduBiz", {
					disabled: false,
				});
    	}
      // 是否绿色产业客户
      setFormItem("ECargoApplicant.cGreenIndustryCustomers", {
        rules: null,
        disabled: true,
      });
      // 是否绿色详情
      setFormItem("ECargoApplicant.cGreenIndustryList", {
        rules: null,
        disabled: true,
      });
      // 是否小微企业
      setFormItem("ECargoApplicant.cIsMicroEntpris", {
        rules: null,
        disabled: true,
      });
      // 为法人  企业成立日期
      setFormItem("ECargoApplicant.tEstablishingDate", {
        rules: null,
      });
      setFormItem("ECargoApplicant.cEnterpriseTel", {
        rules: [],
      });
      //是否分支机构
      if (!getValue('ECargoApplicant.cIsBranch')) {
        setValue("ECargoApplicant.cIsBranch", "1");
      }
      setFormItem("ECargoApplicant.cCntrNme", { rules: null });
      setFormItem("ECargoApplicant.tOperaterCertfEndTm", { rules: null });
      setFormItem("ECargoApplicant.cOperaterCertfTyp", { rules: null });
      setFormItem("ECargoApplicant.cOperaterCertfCde", { rules: null });
      setFormItem("ECargoApplicant.cCntrCertfCde", { rules: null });
      //实名认证方式
      setFormItem("ECargoApplicant.cRealnameAuthType", {
        rules: [],
      });
      // 法定代表人/责任人
      setFormItem("ECargoApplicant.cLegalRepresentative", {
        rules: []
      });
      // 个人 客户学历必填
      setFormItem("ECargoApplicant.cEdubackgroudTyp", {
        rules: [getRules("required", {})],
      });
      // 个人 年收入（单位：万元）必填
      setFormItem("ECargoApplicant.nYearincomeNum", {
        rules: [getRules("required", {})],
      });
      // 个人 移动电话必填  
      setFormItem("ECargoApplicant.cMobile", {
        rules: [getRules("required", {}), getRules("phoneNo", {})],
      });
      setFormItem("ECargoApplicant.cTel", { rules: [getRules("phone", {})] });
      setFormItem("ECargoApplicant.cIsIndvduBiz", {
        rules: [getRules("required", {})],
      });
      // 性别 、年龄、生日个人必填
      setFormItem("ECargoApplicant.tBirthday", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.nAge", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.cSex", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.cIsMicroEntpris", {
        rules: [],
      });
      setFormItem("ECargoApplicant.nRegisteredCapital", {
        rules: [],
      });
      setFormItem("ECargoApplicant.cFirmscaleTyp", {
        rules: [],
      });
      setFormItem("ECargoApplicant.cLegalRepresentative", {
        rules: [],
      });

      codeListStore
        .queryCodeList({
          codeListName: "NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          if (
            !res.some((item) =>
              Object.values(item).includes(getValue("ECargoApplicant.cCertfCls"))
            )
          ) {
            if (getValue('ECargoApplicant.cCertfCls')) {
              setValue("ECargoApplicant.cCertfCls", "");
            }

          }
          applicantEditRef.value?.addCodeListMap({
            code: "ECargoApplicant.cCertfCls",
            list: res
          })
        });
    }
    let co = 'NATURAL_CERTIFICATE_CACHE';

    if (val == '0') {
      co = 'UN_NATURAL_CERTIFICATE_CACHE';
    }

    // if (initFlag.value) {
      codeListStore
        .queryCodeList({
          codeListName: co,
          codeListParam: {},
        })
        .then((res) => {
          if (!res.some((item) => Object.values(item).includes(getValue("ECargoApplicant.cCertfCls")))) {
            setValue("ECargoApplicant.cCertfCls", "");
          }

          applicantEditRef.value?.addCodeListMap({
            code: "ECargoApplicant.cCertfCls",
            list: res
          })
          if (val === '0') {
            setValue('ECargoApplicant.cCertfCls', '01');  // 法人默认机构代码
          }
        });
    // }

    checkUser();
  },
  //大股东性质change事件
  funcShareholderNature: (val:any) => {
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
                getValue("ECargoApplicant.cShareholderCategory")
              )
            )
          ) {
            setValue("ECargoApplicant.cShareholderCategory", "");
          }
          setFormItem("ECargoApplicant.cShareholderCategory", {
            loadData: [],
          });
          setFormItem("ECargoApplicant.cShareholderCategory", {
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
                getValue("ECargoApplicant.cShareholderCategory")
              )
            )
          ) {
            setValue("ECargoApplicant.cShareholderCategory", "");
          }
          setFormItem("ECargoApplicant.cShareholderCategory", {
            loadData: [],
          });
          setFormItem("ECargoApplicant.cShareholderCategory", {
            loadData: res,
          });
        });
    }
  },
  // 是否个体工商户
  cIsIndvduBizChange:(val:any)=>{
    if(val === '1'){
      setFormItem("ECargoApplicant.cOccupCde", { btnItems: { disabled: false } });
      setFormItem("ECargoApplicant.cOccupCde", { hidden:false, rules: [getRules("required", {})] });
      setFormItem('ECargoApplicant.cTrdCde',{hidden:false,rules: [getRules("required", {})]})
      setFormItem("ECargoApplicant.cTrdCde", { btnItems: { disabled: false } });
    } else if (val == "0") {
      setFormItem("ECargoApplicant.cOccupCde", { rules: [] });
      setFormItem("ECargoApplicant.cTrdCde", { rules: [] });
      setFormItem("ECargoApplicant.cOccupCde", { btnItems: { disabled: true } });
      setFormItem("ECargoApplicant.cTrdCde", { btnItems: { disabled: true } });
      setValue("ECargoApplicant.cOccupCde", null);
      setValue("ECargoApplicant.cTrdCde", null);
    } else {
      setFormItem("ECargoApplicant.cOccupCde", { rules: [] });
      setFormItem("ECargoApplicant.cOccupCde", { btnItems: { disabled: true } });
      setFormItem('ECargoApplicant.cTrdCde',{rules:null})
      setFormItem("ECargoApplicant.cTrdCde", { btnItems: { disabled: false } });
    }
  },
  // 是否分支机构
  cIsBranchChange: (val: any) => {
    if (val) {
      setCapitalRequiredRule(getValue, setFormItem, 'ECargoApplicant');
    }
  },
  funcNdustryCate: () => {
    dialog.value?.open(
      "ndustryCateModal",
      {
        type: "show",
        method: {
          getdbClickData: (data:any) => {
            setFormItem("ECargoApplicant.cTrdCde", {
              loadData: [{ label: data.cnm, value: data.cde }],
            });
           // setValue("ECargoApplicant.cTrdCde", data.cnm);
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
    dialog.value?.open(
      "cOccupCdeModal",
      {
        type: "show",
        method: {
          getdbClickData: (data:any) => {
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
  // 证件有效期长期标识
  tCertMrkChecked:(val:any)=>{
    if (val == "1") {
      setValue(
        "ECargoApplicant.tCertfEndDate",
        moment(new Date("9999-12-31")).format("YYYY-MM-DD HH:mm:ss")
      );
      setFormItem("ECargoApplicant.tCertfEndDate", { disabled: true });
    } else {
      setValue("ECargoApplicant.tCertfEndDate", "");
      setFormItem("ECargoApplicant.tCertfEndDate", { disabled: false });
    }
  },
  // 移动电话 切换
  mobileChange: (val:any) => {
    let cClntMrk = getValue('ECargoApplicant.cClntMrk'); // 法人  1个人  0法人
    clearValidate('ECargoApplicant.cTel')
    if (cClntMrk && val) {
      setFormItem("ECargoApplicant.cMobile", {
        rules: [getRules("required", {}), getRules("phoneNo", {})],
      });
      setFormItem("ECargoApplicant.cTel", { rules: [getRules("phone", {})] });
    }
    setValue('ECargoApplicant.cEnterpriseTel', val)
  },
  // 固定电话
  cTelChange: (val:any) => {
    clearValidate('ECargoApplicant.cMobile')
    let cClntMrk = getValue('ECargoApplicant.cClntMrk'); // 法人  1个人  0法人
    let cMobile = getValue('ECargoApplicant.cMobile');  // 移动 

    if (cClntMrk == '0' && val && !cMobile) {
      setFormItem("ECargoApplicant.cTel", {
        rules: [getRules("phone", {}), getRules("required", {})],
      });
      setFormItem("ECargoApplicant.cMobile", { rules: getRules("phoneNo", {}) });
    }
  },
  emailChange: (val:any) => {
    if (val) {
      setFormItem("ECargoApplicant.cEmail", { rules: [getRules("email", {})] });
    }
  },
  cCountryChange: (val:any) => {
    setValue("ECargoApplicant.cCity", "");
    setValue("ECargoApplicant.cProvince", "");
    setValue("ECargoApplicant.cCounty", "");
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
          setFormItem("ECargoApplicant.cProvince", objData);
        });
    }
  },
  cProvinceChange: (val:any) => {
    setValue("ECargoApplicant.cCity", "");
    setValue("ECargoApplicant.cCounty", "");
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
          setFormItem("ECargoApplicant.cCity", objData);
        });
    }
  },
  cCityChange: (val:any) => {
    setValue("ECargoApplicant.cCounty", "");
    codeListStore
      .queryCodeList({
        codeListName: "WEB_BAS_AREA",
        codeListParam: { cParCde: val, cType: "3" },
      })
      .then((res) => {
        const objData = {
          loadData: res,
        };
        setFormItem("ECargoApplicant.cCounty", objData);
      });
  },
  // 是否绿色产业客户change
  ApplicantIsGreen:(val:any)=>{
    // 控制绿色产业细分列表是否必填
    if (val == "1") {
      setFormItem("ECargoApplicant.cGreenIndustryList", {
        rules: [getRules("required", {})],
        disabled: false,
      });
    } else {
      setFormItem("ECargoApplicant.cGreenIndustryList", { rules: [] });
      setFormItem("ECargoApplicant.cGreenIndustryList", { disabled: true });
      setValue('ECargoApplicant.cGreenIndustryList', '')
    }
  },
  // 证件号码change
  cCertfCdeChange: (val:any) => {
    const cCertfCls = formPage.getFormDataById("AgreementApplicant")["ECargoApplicant.cCertfCls"];
    if (cCertfCls == "111") {
      if (val) {
        const certfCde = applicantEditRef.value?.getValue(
          "ECargoApplicant.cCertfCde"
        );
        applicantEditRef.value?.validateField('ECargoApplicant.cCertfCde').then((isValid) => {

          if (isValid) {
            idAnalysis(val)
          }
        })
      }
    }
    checkUser();
  },
  //注册地市是否同上
   isSameChange : (val:any) => {
    if (val == "1") {
      const ads = getValue("ECargoApplicant.Prop");
      const a = getValue("ECargoApplicant.cSuffixAddr") || "";
      const b = getValue("ECargoApplicant.cClntAddr") || '';

      setValue("ECargoApplicant.RegisterProp", ads);
      setValue("ECargoApplicant.cRegisterSuffixAddr", a);
      setValue("ECargoApplicant.cRegisteredcapDre", b);
    }
  },
  //常住地址
  getCountry: (val: any,row:any) => {
    setregistAdd();
  },
  //常住地址(input)
  getcSuffixAddr: (val: any) => {
    setregistAdd();
  },
  
  //注册地址
  getAllProp: (val: any) => {
    setRegisterAdd();
  },
  //注册地址(input)
  getcRegisterSuffixAddr: (val: any) => {
    setRegisterAdd();
  },
  // 单位性质
  cWorkDptChange:(val:any)=>{
    const clientNature = getValue('ECargoApplicant.cClntMrk');
    const isSpecialCase = cWorkDptList.includes(val) && clientNature === '0';
    const requiredRule = [getRules("required", {})];

    setCapitalRequiredRule(getValue, setFormItem, 'ECargoApplicant');
    //实名认证方式
    setFormItem("ECargoApplicant.cRealnameAuthType", {
      rules: isSpecialCase ? requiredRule : []
    });
    // 法定代表人/责任人
    setFormItem("ECargoApplicant.cLegalRepresentative", {
      rules: isSpecialCase ? requiredRule : []
    });
    // 企业成立日
    setFormItem("ECargoApplicant.tEstablishingDate", {
      rules: isSpecialCase ? requiredRule : []
    });
    if (val =='310' || val =='320' || val =='330' || val =='340' || val =='350'|| val =='360') { 
      setFormItem("ECargoApplicant.nRegisteredCapital", {
        rules: [getRules("required", {})],
      });
      setFormItem("ECargoApplicant.cFirmscaleTyp", {
        rules: [getRules("required", {})],
      });
    }else{
      setFormItem("ECargoApplicant.nRegisteredCapital", {
        rules: []
      });
      setFormItem("ECargoApplicant.cFirmscaleTyp", {
        rules: []
      });
    }
    const leiCodeRule = [getRules("leiCode", {})];
    if (val === '350') {
      setFormItem("ECargoApplicant.cGcidCode", {
        rules: [...requiredRule, ...leiCodeRule]
      });
    } else if (val) {
      setFormItem("ECargoApplicant.cGcidCode", {
        rules: leiCodeRule
      });
    }
  },
  // 办理人员证件种类
  cOperaterCertfTypChange: (val: any) => {
    console.log('证件种类', val)
    if (!initFlag.value) {
      return;
    }
    // 清除报错信息
    clearValidate('ECargoApplicant.cOperaterCertfCde')
    let cClntMrk = getValue('ECargoApplicant.cClntMrk');  // 投保人性质 
    let baseRules: any[] = [];
    type RuleType = "orgCode" | "socialCode" | "idCard" | "passPort" | "ariCard" | "required";
    const ruleMap: Record<string, RuleType> = {
      "110001": "orgCode",
      "01": "socialCode",
      "111": "idCard",
      "07": "passPort",
      "553": "ariCard",
    };
    baseRules = ruleMap[val] ? [getRules(ruleMap[val],{})] : [];
    if (cClntMrk == '0') {
      baseRules = [getRules("required", {}), ...baseRules]
    }

    setFormItem("ECargoApplicant.cOperaterCertfCde", {
      rules: baseRules,
    });
  },
	// 大股东证件类型
	cShareholderCategoryChange: (val: any) => {
		console.log('大股东证件类型', val)
    if (!initFlag.value) {
      return;
    }
    // 清除报错信息
    clearValidate('ECargoApplicant.cShareholderCode')

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

    setFormItem("ECargoApplicant.cShareholderCode", {
      rules: baseRules,
		});
	},
  // 证件有效起期
  tCertfBgnDateDisable: (date: any) => {
    const fs = getFormValue();
    if (fs && JSON.stringify(fs) !== '{}') {

      const endDate = new Date(fs["ECargoApplicant.tCertfEndDate"] || '')   // 结束时间
      let minDate = dayjs(endDate).valueOf();
      return date.getTime() > minDate
    } else {
      return true;
    }

  },
  // 证件有效止期
  tCertfEndDateDisable: (date: any) => {
    const fs = getFormValue();
    if (fs && JSON.stringify(fs) !== '{}') {
      const startDate = new Date(fs["ECargoApplicant.tCertfBgnDate"] || '')   // 开始时间
      let maxDate = dayjs(startDate).valueOf();
      return date.getTime() < maxDate
    } else {
      return true;
    }
  },
  // 办理人证件有效止期 小于当前时间
  tOEndTmDisable: (date: any) => {
    return disablePastDates(date);
  },
  cIsBranch:(val:any)=>{
    //ECargoApplicant.cClntMrk 投保人性质 ，ECargoApplicant.cIsBranch 分支机构  ECargoApplicant.cWorkDpt 企业单位性质
    if ( (getValue('ECargoApplicant.cClntMrk') && getValue('ECargoApplicant.cClntMrk') === '0') && (getValue('ECargoApplicant.cIsBranch') && getValue('ECargoApplicant.cIsBranch') === '0') && (getValue('ECargoApplicant.cWorkDpt') && ['310','320','330','340','350','360'].includes(getValue('ECargoApplicant.cWorkDpt')))){
      setFormItem("ECargoApplicant.nRegisteredCapital", {
        hidden:false,
        rules: [getRules("required", {})],
      });
    }else {
      setFormItem("ECargoApplicant.nRegisteredCapital", {
        rules: null
      });
    }
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
    // personnelType:"Applicant"
  }
  qryCustomer(param)
    .then((res:any) => {
      const { code, data, msg } = res;
      if (200 === code) {
        if(data){
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
          
          setValue('ECargoApplicant.cAppCde', data[0]['ECargoApplicant.cCargoAppCde']);
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
  const applicantValue = formPage.getFormDataById("AgreementApplicant");

  if (!validateIdCard(id) || (applicantValue["ECargoApplicant.cCertfCls"] !== '111' && applicantValue["ECargoApplicant.cCertfCls"] !== '553')) {
    return false
  }
  const birthYear = parseInt(id.substring(6, 10), 10);
  const birthMonth = parseInt(id.substring(10, 12), 10);
  const birthDay = parseInt(id.substring(12, 14), 10);
  const birthday = `${birthYear}-${birthMonth.toString().padStart(2, "0")}-${birthDay.toString().padStart(2, "0")}`;
  const sexCode = parseInt(id.substring(16, 17), 10);
  const sex = sexCode % 2 === 0 ? "2" : "1"; // 1: 男, 2: 女
  const age = calculateAgeFromIdCard(id);
  if (!getValue("ECargoApplicant.cNation")) {
    setValue("ECargoApplicant.cNation", "CHN"); // 国籍
  }

  setValue("ECargoApplicant.tBirthday", birthday);
  setValue("ECargoApplicant.nAge", age);
  setValue("ECargoApplicant.cSex", sex);
  
  // clearValidate('ECargoApplicant.cCertfCde')  
}
function setregistAdd() {
  const ads = applicantEditRef?.value?.getValue("ECargoApplicant.Prop");
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
        setAddressStr("ECargoApplicant.cRegisteredcapDre", b);
      }
    });
  } else {
    setAddressStr("ECargoApplicant.cRegisteredcapDre", a);
  }
}

function resetFn() {
  const cEcAgrAppNo = formPage?.getComponentRefById('AgreementBase')?.getValue('ECargoBase.cEcAgrAppNo');
  if(!cEcAgrAppNo) return;
  const params = {
    type: 'E',
    param: cEcAgrAppNo,
    entity: 'ECargoApplicant'
  }
  reset(params).then(() => {
  }).catch((err:any) => {
    console.log(err)
  })
}

function clearValidate(key:any=null) {
  applicantEditRef?.value?.clearValidate(key);
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
function handleFileChange(event: Event) {
  const fileInput = event.target as HTMLInputElement;
}
function getFormConfig(){
  return formconfig1;
}
function setDisabledAll(isDisabled: boolean) {
  applicantEditRef?.value?.setDisabledAll(isDisabled);
}
function addProvide<T>(key: InjectionKey<T> | string, value: T)  {
  applicantEditRef?.value?.addProvide(key, value);
}
defineExpose({
  getFormValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormConfig,
  setDisabledAll,
  addProvide
});
</script>

<style scoped></style>

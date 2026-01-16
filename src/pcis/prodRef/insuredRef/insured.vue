<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="insuredEditRef" />
  <comDialog ref="dialog"></comDialog>
  <input type="file" ref="fileInputRef" style="display: none" @change="handleFileChange" />
  <el-dialog v-model="maindialogVisible" title="OCR识别">
    <el-form :model="formconfig" label-width="180px" :inline="true">
      <el-form-item label="OCR识别类型" prop="fileInputType" :rules="[getRules('required', {})]">
        <el-radio-group v-model="formconfig.fileInputType">
          <el-radio value="1">身份证</el-radio>
          <el-radio value="2">外国人永久居留身份证</el-radio>
          <el-radio value="3">营业执照</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="ok">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import dayjs from "dayjs";

const dialog = ref<DialogMethod | null>(null);
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { useValidator } from "@/typings/useValidator";
import moment from "moment";
import { codeListViewStore } from "@/store";
import { useProductStore } from "@/store/modules/prod";
import { getAddressStr, qryCustomer, reset } from "@/api/query";
import { idxParamKey, IdxParamProps, useIdxParam } from "@/views/pcis/support/useIdxParam";
import { descryptParameter, encryptParameter } from "@/utils/encipher";
import { useRouter, useRoute } from 'vue-router';
import { validateIdCard } from "@/typings/method-public";
import { calculateAgeFromIdCard } from "@/utils/common";
import { setCapitalRequiredRule, disablePastDates } from "@/utils/InsuranceCoverageRules";
const route = useRoute();
const query = ref(route.query);
const router = useRouter();
const routeParam = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}");



const productStore = useProductStore();
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
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
const { getRules } = useValidator();
const codeListStore = codeListViewStore();
const insuredEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive(createAppFreeEditConfig({}));
// import { useRoute } from "vue-router";
// const route = useRoute();
const fileInputRef: any = ref(null);
const formconfig = ref({
  fileInputType: ""
});
import { readFile } from "@/api/file";
import { dataParam } from "@/store/modules/dataParam";
const user = JSON.parse(sessionStorage.getItem("user"));
const tCertfDate = ref<any[]>([]);
const cWorkDptList = ['310', '320', '330', '340', '350', '360']  // 单位性质带企业的ID
const maindialogVisible = ref(false) // ocr识别弹框打开
const resetLogo = ref<any>(false);   // 重置标识
const param = opertaor.getParam();

onMounted(() => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules,
    getRules
  );
  Object.assign(formconfig1, formconfig11);
  nextTick(() => {
    //是否小微企业，默认非必填、只读
    // setFormItem("Insured.cIsMicroEntpris", {
    //   rules: null,
    //   disabled: true,
    // });
  });
  setValue("Insured.cNation", "CHN"); // 国籍默认中国
  setFormItem("Insured.cAppNme", { rules: [getRules("required", {}), getRules("cAppNme", {})], });
  //【国民经济行业分类】初始化必填，只有法人时才必填，现在个人也是必填了（老系统需求：040001/042002/043004/043005/043011五款产品不区分法人个人投保，国民经济行业分类都必填，其他产品只有法人才必填）
  const cProdNo = opertaor.getParam()?.cProdNo;
  if (
    cProdNo === "040001" ||
    cProdNo === "042002" ||
    cProdNo === "043004" ||
    cProdNo === "043005" ||
    cProdNo === "043011"
  ) {
    setFormItem("Insured.cTrdCde", { rules: [getRules("required", {})],btnItems: { disabled: false } });
  }
  if (cProdNo === '130003') {
    setFormItem("Insured.cGreenIndustryCustomers", { hidden: true, rules: null });
    setFormItem("Insured.cGreenIndustryList", { hidden: true, rules: null });
  }

  setFormItem("Insured.cSafetyStandardizationLevel", { hidden: true });
  setFormItem("Insured.cCreditRating", { hidden: true });
  setFormItem("Insured.cIsLargeMediumEnterprise", { hidden: true });
  // 处理邮编
  setFormItem("Insured.cZipCde", {
    'maxlength': 6,
    rules: [getRules("signlessInt", {}), getRules("specifyLength", { len: 6 })],
  });
  // 移动电话
  setFormItem("Insured.cMobile", { rules: [getRules("phoneNo", {})] });
  // 固话
  setFormItem("Insured.cTel", { rules: [getRules("phone", {})] });
  // 传真校验
  setFormItem("Insured.cFax", { rules: [getRules("faxNumber", {})] });
  // 法人身份证
  // setFormItem("Insured.cLegalCertfCde", { rules: [getRules("idCard", {})] });
  setFormItem("Insured.cGcidCode", {
    rules: [getRules("leiCode", {})],
  });
  // 关联交易审批单编号
  setFormItem("Insured.cRelateNo", { rules: [getRules("txnApprovalNo", {})] });

  // 营业执照号码
  // setFormItem("Insured.cBuslicenceNo", { rules: [getRules("businessLicense", {})] });

  // 组织机构代码
  // setFormItem("Insured.cOrganizationCode", {rules: [getRules("socialCode", {})]});
  // 经常居住地校验
  setFormItem("Insured.cHabitualResidence", { rules: [getRules("valiAddress", {})] });
  // 税务登记号
  // setFormItem("Insured.cTaxRegistrationNo", {rules: [getRules("taxValidation", {})]});
  // 证件号码
  // setFormItem("Insured.cCertfCde", { minWidth: '165px' });
  if((param.pageType === "EDR_APP_NEW_SCENE" || param.pageType === "TEMPORARY_DEPOSIT") && (param.cTransMrk == '1' || param.cRsnCde === '99' || param.cEdrRsnBundle === '99' || param.cEdrRsnBundleCde === '99')) {
    setFormItem("Insured.cCertfCls", { disabled: false });
    setFormItem("Insured.cCertfCde", { disabled: false });
  }
});
// function setFormItem(key: any, obj: any) {
//   if (obj && Object.keys(obj).length) {
//     formconfig1.fromSchema?.forEach((item) => {
//       if (item.prop === key) {
//         //控制尾部按钮的
//         if (item.btnItems && obj.btnItems) {
//           for (let key in obj.btnItems) {
//             item.btnItems[key] = obj.btnItems[key];
//           }
//         } else {
//           Object.assign(item, obj);
//         }
//       }
//     });
//   }
// }
function recursiveSetFormItem(items: FormItem[], targetKey: string, obj: Record<string, any>) {
  items.forEach((item) => {
    // 1. 如果当前项是分组（含groupList），先递归处理子项
    if (item.inputtype === 'rtinputgroup' && item.groupList && Array.isArray(item.groupList)) {
      recursiveSetFormItem(item.groupList, targetKey, obj);
    }

    // 2. 匹配到目标prop，执行赋值
    if (item.prop === targetKey) {
      if (item.btnItems && obj.btnItems) {
        Object.entries(obj.btnItems).forEach(([btnKey, value]) => {
          if (item.btnItems!.hasOwnProperty(btnKey)) {
            item.btnItems![btnKey] = value;
          }
        });
      }

      // 处理其他属性（包括rules必填规则）
      const { btnItems: _, ...otherProps } = obj;
      Object.assign(item, otherProps);
      if (otherProps.rules) {
        item.rules = otherProps.rules;
      }
    }
  });
}


function setFormItem(key: string, obj: Record<string, any>): void {
  if (!key || !obj || typeof obj !== 'object' || Object.keys(obj).length === 0) {
    return;
  }

  if (!formconfig1.fromSchema || !Array.isArray(formconfig1.fromSchema)) {
    return;
  }

  // 调用递归方法处理所有项（包括嵌套的groupList）
  recursiveSetFormItem(formconfig1.fromSchema, key, obj);
}
// 解析身份证
const idAnalysis = (id: string) => {
  const tabref = opertaor.getTableRefs();
  const insuredValue = tabref["insured"].getFromValue();
  if (!validateIdCard(id) || (insuredValue["Insured.cCertfCls"] !== '111' && insuredValue["Insured.cCertfCls"] !== '553')) {
    return false
  }

  const birthYear = parseInt(id.substring(6, 10), 10);
  const birthMonth = parseInt(id.substring(10, 12), 10);
  const birthDay = parseInt(id.substring(12, 14), 10);
  const birthday = `${birthYear}-${birthMonth.toString().padStart(2, "0")}-${birthDay.toString().padStart(2, "0")}`;
  const sexCode = parseInt(id.substring(16, 17), 10);
  const sex = sexCode % 2 === 0 ? "2" : "1"; // 1: 男, 2: 女
  // const age = new Date().getFullYear() - birthYear;
  const age = calculateAgeFromIdCard(id);
  if (!getValue("Insured.cNation")) {
    setValue("Insured.cNation", "CHN"); // 国籍
  }
  setValue("Insured.tBirthday", birthday);
  setValue("Insured.nAge", age);
  setValue("Insured.cSex", sex);

  clearValidate('Insured.cCertfCde')

}

// 防抖定时器
let debounceTimer = null;
//  根据 客户名称 / 被保人性质/ 证件类型 / 证件号码 获取客户信息
const checkUser = () => {
  const fieldsToValidate = ['Insured.cInsuredNme', 'Insured.cClntMrk', "Insured.cCertfCde", "Insured.cCertfCls"];
  // 自定义录单 方案配置 模版 进入 可以查询用户信息  
  if (!resetLogo.value && (routeParam.pageType !== "app" && routeParam.pageType !== "copy" && routeParam.pageType !== "template" && routeParam.cAppStatus !== '1')) {
    return false;
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  const tabref = opertaor.getTableRefs();
  const insuredValue = tabref["insured"].getFromValue();

  //  只要4个有值 去请求客户信息
  if (insuredValue["Insured.cInsuredNme"] &&
    insuredValue["Insured.cClntMrk"] !== null &&
    insuredValue["Insured.cCertfCde"] &&
    insuredValue["Insured.cCertfCls"]
  ) {

    insuredEditRef.value?.validateField(fieldsToValidate).then((isValid) => {

      if (isValid) {

        debounceTimer = setTimeout(() => {

          const param = {
            coustName: insuredValue["Insured.cInsuredNme"],
            coustMrk: insuredValue["Insured.cClntMrk"],
            coustType: insuredValue["Insured.cCertfCls"],
            coustCode: insuredValue["Insured.cCertfCde"],
            personnelType: "Insured"
          }
          qryCustomer(param)
            .then((res) => {
              const { code, data, msg } = res;
              if (200 === code) {
                if (data) {
                  if (data && data.length > 0) {
                    Object.keys(data[0]).forEach((key) => {
                      if (data[0][key]) {
                        setValue(key, data[0][key]);
                      }
                    });
                  }
                  let userId = getValue('Insured.cCertfCde')
                  idAnalysis(userId)
                }
              } else {
              }
            })
            .finally(() => { });

        }, 500)
      }
    })
  }
};

let isCoypBtn = ref<any>(false);    // 用来处理 同步被保人 清空问题
let isOcrEcho = false;          // OCR识别处理

// 绑定方法
const method = {
  func: () => { },
  func1: () => { },
  // 客户名称
  funCheckUser: (val: any) => {
    if (param.initFlag) {
      return;
    }
    if (val) {
      // 去除首位空格
      setValue("Insured.cInsuredNme", val.trim())

      checkUser(); // 根据名称  被保人性质 证件类型 证件号码查询用户信息
    }
  },
  funccopyvalue: () => {

    isCoypBtn.value = true; // 存储令牌

    try {

      const tabref = opertaor.getTableRefByKey("applicant");
      const applicantValue = tabref.getFromValue();
      const applicantCodeListMap = tabref?.getCodeListMap();
      if (applicantCodeListMap) {
        insuredEditRef.value?.addCodeListMap({
          code: 'Insured.cOccupCde',
          list: applicantCodeListMap['Applicant.cOccupCde']
        });
      }

      let insuredValue: any = {};

      // 同投保人时 客户信息需要禁用   客户名称 被保人性质 证件类型 证件号码  证件有效起 止期
      // insuredValue["Insured.cInsuredNme"] &&
      // insuredValue["Insured.cClntMrk"] !== null &&
      // insuredValue["Insured.cCertfCde"] &&
      // insuredValue["Insured.cCertfCls"]
      setFormItem('Insured.cInsuredNme', {
        disabled: true
      })
      setFormItem('Insured.cClntMrk', {
        disabled: true
      })
      setFormItem('Insured.cCertfCde', {
        disabled: true
      })
      setFormItem('Insured.cCertfCls', {
        disabled: true
      })
      setFormItem('Insured.tCertfBgnDate', {
        disabled: true
      })
      setFormItem('Insured.tCertfEndDate', {
        disabled: true
      })
      setFormItem('Insured.cLongendTyp', {
        disabled: true
      })
      for (const k in applicantValue) {
        if (k === "Applicant.cCertfCls") {
          setTimeout(() => {
            setValue("Insured.cCertfCls", applicantValue[k]);
          }, 0);
        } else if (k === "Applicant.cAppCde") {
          insuredValue["Insured.cInsuredCde"] = applicantValue[k];
        } else if (k === "Applicant.cAppNme") {
          insuredValue["Insured.cInsuredNme"] = applicantValue[k];
        } else if (k.startsWith("Applicant")) {
          const nk = k.replace("Applicant", "Insured");
          insuredValue[nk] = applicantValue[k];
        }
      }
      setFormValue(insuredValue);
    } finally {
      setTimeout(() => {
        isCoypBtn.value = false;
      }, 1000)
    }
  },
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
                newobj["Insured." + k] = selobj[key];
              }
            });

            newobj["Insured.cInsuredNme"] = newobj["Insured.cClntNme"];
            newobj["Insured.cInsuredCde"] = newobj["Insured.cAppCde"];
            setFormValue(newobj);
            if (!param.initFlag) {
              setFormItem("Insured.cInsuredNme", {
                disabled: true,
              });
              setFormItem("Insured.cClntMrk", {
                disabled: true,
              });
              setFormItem("Insured.cCertfCls", {
                disabled: true,
              });
              setFormItem("Insured.cCertfCde", {
                disabled: true,
              });
            }
          }
        },
      },
      { title: "选择客户信息", width: 85 }
    );
  },

  funcconfirm: () => {
    insuredEditRef.value?.validate().then((isValid) => {
      if (isValid) {
        // handleQuery();
        ElMessage.success("客户信息已经存在");
      } else {
        ElMessage.error("请填写必填项");
      }
    });
  },
  //证件有效期止期时间事件改变
  tCertfEndDateChange: (val) => {
    const tableData = opertaor.getTableRefs();
    const tcertfEndDate = tableData["insured"].getFromValue()["Insured.TcertfEndDate"]  //证件有效止期
    const tIssueTm = tableData["insrnc"].getFromValue()["Base.tIssueTm"] //签单日期
    const tinsrncBgnTm = tableData["insrnc"].getFromValue()["Base.tInsrncBgnTm"] //保险起期
    if (val && tIssueTm && tinsrncBgnTm) {
      // 统一转换为日期对象进行比较
      const certfEndDate = new Date(val).getTime();
      const issueTm = new Date(tIssueTm).getTime();
      const insrncBgnTm = new Date(tinsrncBgnTm).getTime();
      if (certfEndDate < issueTm) {
        ElMessage.error("被保人证件有效期小于保单签单时间，请关注!");
        setValue("Insured.tCertfEndDate", '');
      }
      if (certfEndDate < insrncBgnTm) {
        ElMessage.error("被保人证件有效期小于保单起保时间，请关注!");
      }
    }
  },
  //企业成立时间事件改变
  tEstablishingDateChange: (val) => {
    const tableParam = opertaor.getTableRefs();
    const tAppTm = tableParam["insrnc"].getFromValue()["Base.tAppTm"]  //投保日期
    const tIssueTm = tableParam["insrnc"].getFromValue()["Base.tIssueTm"]   //签单日期
    if (val && tAppTm && tIssueTm) {
      const establishingDate = new Date(val).getTime();
      const appTm = new Date(tAppTm).getTime();
      const issueTm = new Date(tIssueTm).getTime();
			const foundingDay = new Date('1949-10-01').getTime();
      if (establishingDate > issueTm) {
        ElMessage.error("企业成立时间小于保单签单时间，请关注!");
      }
      if (establishingDate > appTm) {
        ElMessage.error("企业成立时间小于投保日期，请重新填写!");
				setValue("Insured.tEstablishingDate", null);
				clearValidate('Insured.tEstablishingDate')  // 清除报错信息
			}
			const cClntMrk = getValue('Insured.cClntMrk'); // 法人  1个人  0法人
			const cWorkDpt = getValue('Insured.cWorkDpt')
			const isSpecialCase = cWorkDptList.includes(cWorkDpt);
			if (cClntMrk == '0' && !!isSpecialCase) {
				if (establishingDate < foundingDay) {
					ElMessage.error("企业成立时间大于1949-10-01，请重新填写!");
					setValue("Insured.tEstablishingDate", null);
					clearValidate('Insured.tEstablishingDate')  // 清除报错信息
				}
			}
    }
  },
  //被保人性质change事件
  cClntMrkFunc: (val) => {
    console.log(val)
    const param = opertaor.getParam();
    const tabref = opertaor.getTableRefs();
    const InsuredValue = tabref["insured"].getFromValue();
    if (param.initFlag) {
      if(val === "0") {
        codeListStore
          .queryCodeList({
            codeListName: 'UN_NATURAL_CERTIFICATE_CACHE',
            codeListParam: {},
          })
          .then((res) => {
            insuredEditRef.value?.addCodeListMap({
              code: "Insured.cCertfCls",
              list: res
            })
          });
      }
    }
    checkUser();
    // val  0法人 1个人
    if (val == "0") {
      // 被保人是法人，出生日期、年龄、性别、职业类别、经营范围、婚姻状况隐藏，国籍必填可修改
      setFormItem("Insured.tBirthday", {
        hidden: true,
      });
      setFormItem("Insured.nAge", {
        hidden: true,
      });
      setFormItem("Insured.cSex", {
        hidden: true,
      });
      setFormItem("Insured.cNation", {
        rules: [getRules('required',{})],
      });
      setFormItem("Insured.cOccupTyp", {
        hidden: true,
      });
      setFormItem("Insured.cBusinessScope", {
        hidden: true,
      });
      setFormItem("Insured.cMrgCde", {
        hidden: true,
        rules: null
      });
      setFormItem("Insured.cIsBranch", {
        hidden: false,
      });
      setFormItem("Insured.cStkMrk", {
        hidden: false,
      });
      //办理人 4要素  (0928需求法人时办理人人员姓名、证件类型、证件号码必填、有效止期非必填)
      // setFormItem("Insured.cCntrNme", { rules: [getRules("required", {})] });
      // setFormItem("Insured.tOperaterCertfEndTm", {
      //   rules: [getRules("required", {})],
      // });
      // setFormItem("Insured.cOperaterCertfTyp", {
      //   rules: [getRules("required", {})],
      // });
      // setFormItem("Insured.cOperaterCertfCde", {
      //   rules: [getRules("required", {})],
      // });
      setFormItem("Insured.cEnterpriseTel", {
        rules: [getRules("required", {})],
      });

      setCapitalRequiredRule(getValue, setFormItem, 'Insured');
      setFormItem("Insured.tBirthday", {
        rules: null
      });
      clearValidate('Insured.tBirthday')
      setFormItem("Insured.nAge", {
        rules: null
      });
      clearValidate('Insured.nAge')
      setFormItem("Insured.cSex", {
        rules: null
      });
      clearValidate('Insured.cSex')

      // setValue("Insured.cCertfCls", "");
      // setFormItem("Insured.cCntrNme", { rules: [getRules("required", {})] });
      setFormItem("Insured.cCntrCertfCde", {
        rules: [getRules("required", {})],
      });
      //是否个体工商户
      setValue("Insured.cIsIndvduBiz", "");
      setFormItem("Insured.cIsIndvduBiz", {
        rules: null,
      });
      // 是否绿色产业客户
      setFormItem("Insured.cGreenIndustryCustomers", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.cIsMicroEntpris", {
        disabled: false,
      });
      setFormItem("Insured.cIsIndvduBiz", {
        disabled: true,
      });
      setFormItem("Insured.cGreenIndustryCustomers", {
        disabled: false,
      });
      if (getValue('Insured.cGreenIndustryCustomers') == '1') {
        setFormItem("Insured.cGreenIndustryList", {
          rules: [getRules("required", {})],
          disabled: false,
        });
      }
      // 参加社会统筹标志
      setFormItem("Insured.cParticiinsocTyp", {
        rules: [getRules("required", {})],
      });
      // 注册地址
      // setFormItem("Insured.cRegisteredcapDre", {
      //   rules: [getRules("required", {})],
      // });
      setFormItem("Insured.RegisterProp", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.cRegisterSuffixAddr", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.cIsMicroEntpris", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.nRegisteredCapital", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.cFirmscaleTyp", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.cLegalRepresentative", {
        rules: [getRules("required", {})],
      });

      // 为法人 国民经济行业必填
      setFormItem("Insured.cTrdCde", {
        rules: [getRules("required", {})],
        btnItems: { disabled: false }
      });

      // 单位性质 --为企业做必填校验
      const cWorkDpt = getValue('Insured.cWorkDpt');
      const isSpecialCase = cWorkDptList.includes(cWorkDpt);
      const requiredRule = [getRules("required", {})];
      //实名认证方式
      setFormItem("Insured.cRealnameAuthType", {
        rules: isSpecialCase ? requiredRule : []
      });
      // 法定代表人/责任人
      setFormItem("Insured.cLegalRepresentative", {
        rules: isSpecialCase ? requiredRule : []
      });
      // 企业成立日
			if (!param.initFlag && !isSpecialCase) {
				setValue("Insured.tEstablishingDate", null);
				clearValidate('Insured.tEstablishingDate')  // 清除报错信息
			}
      setFormItem("Insured.tEstablishingDate", {
				disabled: !param.initFlag && isSpecialCase ? false : true,
        rules: isSpecialCase ? requiredRule : []
      });

      // 移动电话
      let cMobile = getValue('Insured.cMobile');  // 移动 
      let cTel = getValue('Insured.cTel');  // 固定电话    
      if (!cMobile && !cTel) {
        setFormItem("Insured.cMobile", {
          rules: [getRules("required", {}), getRules("phoneNo", {})],
        });
      } else if (cMobile) {
        setFormItem("Insured.cTel", { rules: [getRules("phone", {})] });
        setFormItem("Insured.cMobile", { rules: [getRules("required", {}), getRules("phoneNo", {})] })
      } else if (cTel) {
        setFormItem("Insured.cTel", { rules: [getRules("required", {}), getRules("phone", {})] });
        setFormItem("Insured.cMobile", { rules: [getRules("phoneNo", {})] })
      }

      // // 性别 、年龄、生日个人必填
      // setFormItem("Insured.tBirthday", {
      //   rules: []
      // });
      // setFormItem("Insured.nAge", {
      //   rules: []
      // });
      // setFormItem("Insured.cSex", {
      //   rules: []
      // });

      setFormItem("Insured.cEdubackgroudTyp", {
        rules: [],
      });
      setFormItem("Insured.nYearincomeNum", {
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
              Object.values(item).includes(getValue("Insured.cCertfCls"))
            )
          ) {
            // setValue("Insured.cCertfCls", "");
          }
          insuredEditRef.value?.addCodeListMap({
            code: "Insured.cCertfCls",
            list: res
          })
          setValue('Insured.cCertfCls', '01')
          // setFormItem("Insured.cCertfCls", {
          //   loadData: [],
          // });
          // setFormItem("Insured.cCertfCls", {
          //   loadData: res,
          //   rules: [getRules("required", {})],
          // });
        });

      setFormItem("Insured.cWorkDpt", {
        rules: [getRules("required", {})],
      });

      // cCntrNme 办理人  cOperaterCertfTyp办理证件  cOperaterCertfCde 办理人员证件号码  tOperaterCertfEndTm有效期
      // setFormItem("Insured.cCntrNme", {
      //   hidden: true,
      // });
      // setFormItem("Insured.cOperaterCertfTyp", {
      //   hidden: true,
      // });
      // setFormItem("Insured.cOperaterCertfCde", { 
      //   hidden: true,
      // });

      // setFormItem("Insured.tOperaterCertfEndTm", {
      //   hidden: true,
      // });
    } else {
      setFormItem("Insured.tBirthday", {
        hidden: false,
      });
      setFormItem("Insured.nAge", {
        hidden: false,
      });
      setFormItem("Insured.cSex", {
        hidden: false,
      });
      setFormItem("Insured.cNation", {
        rules: [],
      });
      setFormItem("Insured.cOccupTyp", {
        hidden: false,
      });
      setFormItem("Insured.cBusinessScope", {
        hidden: false,
      });
      setFormItem("Insured.cMrgCde", {
        hidden: false,
        rules: [getRules("required", {})],
      });
      // 被保人是个人，是否分支机构、 股东客户隐藏
      setFormItem("Insured.cIsBranch", {
        hidden: true,
      });
      setFormItem("Insured.cStkMrk", {
        hidden: true,
      });
      setFormItem("Insured.tBirthday", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.nAge", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.cSex", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.cEnterpriseTel", {
        rules: [],
      });
      setFormItem("Insured.cWorkDpt", {
        disabled: false,
      });
      setFormItem("Insured.cIsMicroEntpris", {
        disabled: true,
      });
      setFormItem("Insured.cIsIndvduBiz", {
        disabled: false,
      });
      setFormItem("Insured.cGreenIndustryCustomers", {
        disabled: true,
      });

      setFormItem("Insured.cCntrNme", { rules: null });
      setFormItem("Insured.tOperaterCertfEndTm", { rules: null });
      setFormItem("Insured.cOperaterCertfTyp", { rules: null });
      setFormItem("Insured.cOperaterCertfCde", { rules: null });


      //是否个体工商户
      setFormItem("Insured.cIsIndvduBiz", {
        rules: [getRules("required", {})],
      });

      // 单位性质
      setFormItem("Insured.cWorkDpt", { rules: null });

      //注册地址
      setFormItem("Insured.cRegisteredcapDre", { rules: null });
      setFormItem("Insured.RegisterProp", {
        rules: null,
      });
      setFormItem("Insured.cRegisterSuffixAddr", {
        rules: null,
      });

      // 是否绿色产业客户
      setFormItem("Insured.cGreenIndustryCustomers", {
        rules: null,
        disabled: true,
      });
      // 是否绿色详情
      setFormItem("Insured.cGreenIndustryList", {
        rules: null,
        disabled: true,
      });

      // 参加社会统筹标志
      setFormItem("Insured.cParticiinsocTyp", {
        rules: null,
      });


      //实名认证方式
      setFormItem("Insured.cRealnameAuthType", {
        rules: [],
      });
      // 法定代表人/责任人
      setFormItem("Insured.cLegalRepresentative", {
        rules: []
      });
      //企业成立日期
			if (!param.initFlag) { 
				setValue("Insured.tEstablishingDate", null);
				clearValidate('Insured.tEstablishingDate')  // 清除报错信息
			}
      setFormItem("Insured.tEstablishingDate", {
				disabled: true,
        rules: [],
      });

      setFormItem("Insured.cCntrNme", { rules: null });
      setFormItem("Insured.cCntrCertfCde", { rules: null });
      setFormItem("Insured.cIsMicroEntpris", {
        rules: [],
      });
      setFormItem("Insured.nRegisteredCapital", {
        rules: [],
      });
      setFormItem("Insured.cFirmscaleTyp", {
        rules: [],
      });
      setFormItem("Insured.cLegalRepresentative", {
        rules: [],
      });
      // 为法人 国民经济行业必填
      const cProdNo = param?.cProdNo;
      if (
        cProdNo === "040001" ||
        cProdNo === "042002" ||
        cProdNo === "043004" ||
        cProdNo === "043005" ||
        cProdNo === "043011"
      ) {
        setFormItem("Insured.cTrdCde", { rules: [getRules("required", {})],btnItems: { disabled: false } });
      } else {
        setFormItem("Insured.cTrdCde", {
          rules: null,
          btnItems: { disabled: true }
        });
      }

      //是否分支机构
      if (!getValue('Insured.cIsBranch')) {
        setValue("Insured.cIsBranch", "1");
      }


      // 个人 移动电话必填  
      setFormItem("Insured.cMobile", {
        rules: [getRules("required", {}), getRules("phoneNo", {})],
      });
      setFormItem("Insured.cTel", { rules: [getRules("phone", {})] });


      // // 性别 、年龄、生日个人必填
      // setFormItem("Insured.tBirthday", {
      //   rules: [getRules("required", {})]
      // });
      // setFormItem("Insured.nAge", {
      //   rules: [getRules("required", {})]
      // });
      // setFormItem("Insured.cSex", {
      //   rules: [getRules("required", {})]
      // });
      
      // 个人 客户学历必填
      setFormItem("Insured.cEdubackgroudTyp", {
        rules: [getRules("required", {})],
      });
      // 个人 年收入（单位：万元）必填
      setFormItem("Insured.nYearincomeNum", {
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
              Object.values(item).includes(getValue("Insured.cCertfCls"))
            )
          ) {
            if (getValue('Insured.cCertfCls')) {
              setValue("Insured.cCertfCls", "");
            }
          }
          insuredEditRef.value?.addCodeListMap({
            code: "Insured.cCertfCls",
            list: res
          })

        });
      // // 处理办理人  隐藏  
      // setFormItem("Insured.cCntrNme", {
      //   hidden: false,
      // });
      // setFormItem("Insured.cOperaterCertfTyp", {
      //   hidden: false,
      // });
      // setFormItem("Insured.cOperaterCertfCde", {
      //   hidden: false,
      // });

      // setFormItem("Insured.tOperaterCertfEndTm", {
      //   hidden: false,
      // });
    }
  },
  //大股东性质change事件
  funcShareholderNature: (val) => {
    if (param.initFlag) {
      if(val === "0") {
        codeListStore
          .queryCodeList({
            codeListName: 'UN_NATURAL_CERTIFICATE_CACHE',
            codeListParam: {},
          })
          .then((res) => {
            setFormItem("Insured.cShareholderCategory", {
              loadData: res,
            });
          });
      }
      return;
    }
    if (val == "1") {// 个人
      codeListStore
        .queryCodeList({
          codeListName: "NATURAL_CERTIFICATE_CACHE",
          codeListParam: {},
        })
        .then((res) => {
          if (
            !res.some((item) =>
              Object.values(item).includes(
                getValue("Insured.cShareholderCategory")
              )
            )
          ) {
            setValue("Insured.cShareholderCategory", "");
          }
          setFormItem("Insured.cShareholderCategory", {
            loadData: [],
          });
          setFormItem("Insured.cShareholderCategory", {
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
                getValue("Insured.cShareholderCategory")
              )
            )
          ) {
            setValue("Insured.cShareholderCategory", "");
          }
          setFormItem("Insured.cShareholderCategory", {
            loadData: [],
          });
          setFormItem("Insured.cShareholderCategory", {
            loadData: res,
          });
          setValue("Insured.cShareholderCategory", res[0]?.value)
        });
    }
  },
  // 是否个体工商户
  cIsIndvduBizChange: (val: any) => {
    if (val == "1") {
      setFormItem("Insured.cOccupCde", { rules: [getRules("required", {})] });
      setFormItem("Insured.cOccupCde", { btnItems: { disabled: false } });
      setFormItem("Insured.cTrdCde", { rules: [getRules("required", {})] });
      setFormItem("Insured.cTrdCde", { btnItems: { disabled: false } });
    } else if (val == "0") {
      setFormItem("Insured.cOccupCde", { rules: [] });
      setFormItem("Insured.cTrdCde", { rules: [] });
      setFormItem("Insured.cOccupCde", { btnItems: { disabled: true } });
      setFormItem("Insured.cTrdCde", { btnItems: { disabled: true } });
      setValue("Insured.cOccupCde", null);
      setValue("Insured.cTrdCde", null);
    } else {
      setFormItem("Insured.cOccupCde", { btnItems: { disabled: false } });
      setFormItem("Insured.cTrdCde", { btnItems: { disabled: false } });
      setFormItem("Insured.cTrdCde", { rules: [getRules("required", {})] })
    }
  },
  funcreset: () => {
    // 客户重置
    const param = opertaor.getParam();
    const tabref = opertaor.getTableRefs();
    const InsuredValue = tabref["insured"].getFromValue();
    for (const k in InsuredValue) {
      // 反洗钱不清空
      if (k !== "Applicant.cCustRiskRank" && k !== "Insured.cCustRiskRank") {
        InsuredValue[k] = null;
      }
    }
    if (!param.initFlag) {
      setFormItem("Insured.cInsuredNme", {
        disabled: false,
      });
      setFormItem("Insured.cClntMrk", {
        disabled: false,
      });
      setFormItem("Insured.cCertfCls", {
        disabled: false,
      });
      setFormItem("Insured.cCertfCde", {
        disabled: false,
      });
      setFormItem('Insured.tCertfBgnDate', {
        disabled: false
      })
      setFormItem('Insured.tCertfEndDate', {
        disabled: false
      })
      setFormItem('Insured.cLongendTyp', {
        disabled: false
      })
      resetFn()
    }
    resetLogo.value = true;
    tCertfDate.value = [];
    tabref["insured"].setFormValue(InsuredValue);
  },
  funcNdustryCate: () => {
    dialog.value?.open(
      "ndustryCateModal",
      {
        type: "show",
        method: {
          getdbClickData: (data) => {
            setFormItem("Insured.cTrdCde", {
              loadData: [{ label: data.cnm, value: data.cde }],
            });
            setValue("Insured.cTrdCde", data.cde);
            dialog.value?.handleClose();
          },
        },
      },
      {},
      { title: "国民经济行业分类", width: "70" }
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
            setFormItem("Insured.cOccupCde", {
              loadData: [{ label: data.cde + " " + data.cnm, value: data.cde }],
            });
            setValue("Insured.cOccupCde", data.cde);
            dialog.value?.handleClose();
          },
        },
      },
      {
        isOk: (selectdata: any) => { },
      },
      { title: "职业", width: 85 }
    );
  },
  tCertMrkChecked: (val) => {
    const param = opertaor.getParam();
    if (val == "1") {
      setValue(
        "Insured.tCertfEndDate",
        moment(new Date("9999-12-31")).format("YYYY-MM-DD HH:mm:ss")
      );
      // if (!param.initFlag) {
      setFormItem("Insured.tCertfEndDate", { disabled: true });
      // }

    } else {
      if (tCertfDate.value.length > 0) {
        setValue("Insured.tCertfBgnDate", tCertfDate.value[0] || "");
        setValue("Insured.tCertfEndDate", tCertfDate.value[1] || "");
      }

      if (!param.initFlag) {
        setFormItem("Insured.tCertfEndDate", { disabled: false });
      }

    }
  },
  mobileChange: (val) => {
    let cClntMrk = getValue('Insured.cClntMrk'); // 法人  1个人  0法人
    let cTel = getValue('Insured.cTel'); // 固定电话
		clearValidate('Insured.cTel')
    if (cClntMrk && val) {
      setFormItem("Insured.cMobile", {
        rules: [getRules("required", {}), getRules("phoneNo", {})],
      });
      setFormItem("Insured.cTel", { rules: [getRules("phone", {})] });
		}
		if (cClntMrk == '0' && !val && cTel) {
      setFormItem("Insured.cMobile", {
        rules: [getRules("phoneNo", {})],
      });
      setFormItem("Insured.cTel", { rules: [getRules("required", {}), getRules("phone", {})] });
    }
    // setValue('Insured.cEnterpriseTel', val)
  },
  // 固定电话
  cTelChange: (val) => {
    let cClntMrk = getValue('Insured.cClntMrk'); // 法人  1个人  0法人
    let cMobile = getValue('Insured.cMobile');  // 移动 

    if (cClntMrk == '0' && val && !cMobile) {
      setFormItem("Insured.cTel", {
        rules: [getRules("phone", {}), getRules("required", {})],
      });
      setFormItem("Insured.cMobile", { rules: getRules("phoneNo", {}) });
    }
  },
  // 是否绿色产业客户change
  InsuredIsGreen: (val) => {
    // 控制绿色产业细分列表是否必填
    if (val == "1") {
      setFormItem("Insured.cGreenIndustryList", {
        rules: [getRules("required", {})],
        disabled: false,
      });
    } else {
      setFormItem("Insured.cGreenIndustryList", { rules: null, disabled: true, });
      setValue('Insured.cGreenIndustryList', '')
    }
  },

  //证件类型change
  InsuredCCertfCls: (val: any) => {
    const param = opertaor.getParam();
    const isInit = param.initFlag; // 是否是初始化状态
      const personFields = ['cNation', 'tBirthday', 'nAge', 'cSex'];
  


  
    if (!isInit && !isOcrEcho) {
      checkUser(); // 调用客户信息接口
      clearValidate('Insured.cCertfCde'); // 清除报错信息
    }

    if (param.pageType!=="readonly") {
      personFields.forEach(field => {
        setFormItem(`Insured.${field}`, { disabled: false });
      });
    }
 

    setFormItem("Insured.tCertfBgnDate", { rules: null });
    setFormItem("Insured.tCertfEndDate", { rules: null });
    setFormItem("Insured.tEstablishingDate", { disabled: true, rules: null });
		clearValidate('Insured.tEstablishingDate')  // 清除报错信息

    if (val == "111") {
      setFormItem("Insured.cCertfCde", {
        rules: [getRules("required", {}), getRules("idCard", {

        })],
      });
      setFormItem("Insured.tCertfBgnDate", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.tCertfEndDate", {
        rules: [getRules("required", {})],
      });
      setValue("Insured.cNation", "CHN"); // 国籍

      personFields.forEach(field => {
        setFormItem(`Insured.${field}`, { disabled: true });
      });
    } else if (val == "110002") {
      setFormItem("Insured.tCertfBgnDate", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.cCertfCde", {
        rules: [getRules("required", {}), getRules("passPort", {})],
      });

    } else if (val == "01") {
      setFormItem("Insured.tCertfBgnDate", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.tCertfEndDate", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.cCertfCde", {
        rules: [getRules("required", {}), getRules("socialCode", {})],
      });
			// 为法人  企业成立日期
			setFormItem("Insured.tEstablishingDate", {
				disabled: false,
				rules: [getRules("required", {})],
			});



      // 税务登记证号
      // setFormItem("Insured.cTaxRegistrationNo", {
      //   disabled: true,
      // });
      // 组织机构代码
      // setFormItem("Insured.cOrganizationCode", {
      //   disabled: true,
      // });

    } else if (val === '07') {
      // 护照
      setFormItem("Insured.cCertfCde", {
        rules: [getRules("required", {}), getRules("passPort", {})],
      });

    } else if (val == "553") {
      // 外国人证件号
      setFormItem("Insured.cCertfCde", {
        rules: [getRules("required", {}), getRules("ariCard", {})],
      });
    } else {
      setFormItem("Insured.cCertfCde", {
        rules: [getRules("required", {})],
      });
    }

    // 回显不执行下方操作
    if (isInit || isCoypBtn.value || isOcrEcho) return;

    // 切换清空
    if (val) {
      const fieldsToClear = ["Insured.tBirthday", "Insured.nAge", "Insured.cCertfCde", "Insured.tEstablishingDate"];
      fieldsToClear.forEach(field => {
        setValue(field, null);
        setTimeout(() => {
          clearValidate(field);
        }, 10);
      });
    }
  },
  // 证件号码 change
  cCertfCdeChange: (val: any) => {
    const param = opertaor.getParam();
    if (param.initFlag) {
      return;
    }
    const tabref = opertaor.getTableRefs();
    const cCertfCls = tabref["insured"].getFromValue()["Insured.cCertfCls"];
    if (cCertfCls == "111") {
      if (val) {
        const certfCde = tabref["insured"].getFromValue()["Insured.cCertfCde"];
        insuredEditRef.value?.validateField('Insured.cCertfCde').then((isValid) => {
          if (isValid) {
            idAnalysis(val)
          }
        })
      }
    } else if (cCertfCls == '01') {
      // setValue('Insured.cTaxRegistrationNo', val)
      // setValue('Insured.cOrganizationCode', val)
    }
    checkUser();
  },
  emailChange: (val) => {
    if (val) {
      setFormItem("Insured.cEmail", { rules: [getRules("email", {})] });
    }
  },
  cCountryChange: (val) => {
    setValue("Insured.cCity", "");
    setValue("Insured.cProvince", "");
    setValue("Insured.cCounty", "");
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
          setFormItem("Insured.cProvince", objData);
        });
    }
  },
  cProvinceChange: (val) => {
    setValue("Insured.cCity", "");
    setValue("Insured.cCounty", "");
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
          setFormItem("Insured.cCity", objData);
        });
    }
  },
  cCityChange: (val) => {
    setValue("Insured.cCounty", "");
    codeListStore
      .queryCodeList({
        codeListName: "WEB_BAS_AREA",
        codeListParam: { cParCde: val, cType: "3" },
      })
      .then((res) => {
        const objData = {
          loadData: res,
        };
        setFormItem("Insured.cCounty", objData);
      });
  },


  //注册地市是否同上
  isSameChange: (val) => {
    const param = opertaor.getParam();
    if (param.initFlag) {
      return;
    }

    if (val == "1") {
      const ads = insuredEditRef?.value?.getValue("Insured.ClntAddrProp");
      const a =
        insuredEditRef?.value?.getValue("Insured.cSuffixAddr") || "";

      insuredEditRef?.value?.setValue("Insured.RegisterProp", ads);
      insuredEditRef?.value?.setValue("Insured.cRegisterSuffixAddr", a);
    }
  },
  hidPerson: () => {
    // productStore.$state.cClntMrk == "0";
    // setFormItem("Insured.cCntrNme", { hidden: false });
  },


  //注册地址
  getProp: (val: any) => {
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
  // 读取身份证
  readIdCard: (val: any) => {
    maindialogVisible.value = true
    // fileInputRef.value?.click();
    // formconfig.value.fileInputType = "1";
  },
  // 读取外国人永久居留身份证
  readGreenCard: (val: any) => {
    fileInputRef.value?.click();
    formconfig.value.fileInputType = "2";
  },

  // 是否分支机构
  cIsBranchChange: (val: any) => {
    if (val) {
      setCapitalRequiredRule(getValue, setFormItem, 'Insured');
    }

  },

  // 单位性质
  cWorkDptChange: (val: any) => {
    setCapitalRequiredRule(getValue, setFormItem, 'Insured');

    const clientNature = getValue('Insured.cClntMrk');
    const isSpecialCase = cWorkDptList.includes(val) && clientNature === '0';
    const requiredRule = [getRules("required", {})];
    //实名认证方式-20251013 实名认证方式都是非必填
    // setFormItem("Insured.cRealnameAuthType", {
    //   rules: isSpecialCase ? requiredRule : []
    // });
    // 法定代表人/责任人
    setFormItem("Insured.cLegalRepresentative", {
      rules: isSpecialCase ? requiredRule : []
    });
    // 企业成立日
    setFormItem("Insured.tEstablishingDate", {
			disabled: !param.initFlag && isSpecialCase ? false : true,
      rules: isSpecialCase ? requiredRule : []
		});
		if (!param.initFlag && !isSpecialCase) {
			setValue("Insured.tEstablishingDate", null);
			clearValidate('Insured.tEstablishingDate')  // 清除报错信息
		}
    if (val =='310' || val =='320' || val =='330' || val =='340' || val =='350'|| val =='360') { 
      setFormItem("Insured.nRegisteredCapital", {
        rules: [getRules("required", {})],
      });
      setFormItem("Insured.cFirmscaleTyp", {
        rules: [getRules("required", {})],
      });
    }else{
      setFormItem("Insured.nRegisteredCapital", {
        rules: []
      });
      setFormItem("Insured.cFirmscaleTyp", {
        rules: []
      });
    }

    const leiCodeRule = [getRules("leiCode", {})];
    if (val === '350') {
      setFormItem("Insured.cGcidCode", {
        rules: [...requiredRule, ...leiCodeRule]
      });
    } else if (val) {
      setFormItem("Insured.cGcidCode", {
        rules: leiCodeRule
      });
    }
  },

  // 办理人员证件种类
  cOperaterCertfTypChange: (val: any) => {
    // 清除报错信息
    clearValidate('Insured.cOperaterCertfCde')
    let cClntMrk = getValue('Insured.cClntMrk');  // 投保人性质 
    let baseRules: any[] = [];
    type RuleType = "orgCode" | "socialCode" | "idCard" | "passPort" | "ariCard" | "required";
    const ruleMap: Record<string, RuleType> = {
      "110001": "orgCode",
      "01": "socialCode",
      "111": "idCard",
      "07": "passPort",
      "553": "ariCard",
    };
    baseRules = ruleMap[val] ? [getRules(ruleMap[val], {})] : [];
    if (cClntMrk == '0') {
      baseRules = [getRules("required", {}), ...baseRules]
    }

    setFormItem("Insured.cOperaterCertfCde", {
      rules: baseRules,
    });
		if (param.initFlag || isCoypBtn.value || isOcrEcho) return;

    // 切换清空
    if (val) {
      const fieldsToClear = ["Insured.cOperaterCertfCde"];
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
	// 大股东证件类型
	cShareholderCategoryChange: (val: any) => {
		console.log('大股东证件类型', val)
		const param = opertaor.getParam();
    if (param.initFlag) {
      return;
    }
    // 清除报错信息
    clearValidate('Insured.cShareholderCode')

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
    baseRules = [getRules("required", {}), ...baseRules]

    setFormItem("Insured.cShareholderCode", {
      rules: baseRules,
		});
		// 回显不执行下方操作
		if (param.initFlag || isCoypBtn.value || isOcrEcho) return;
    // 切换清空
    if (val) {
      const fieldsToClear = ["Insured.cShareholderCode"];
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
  // 证件有效起期
  tCertfBgnDateDisable: (date: any) => {
    const fs = insuredEditRef?.value?.getFromValue();
    if (fs && JSON.stringify(fs) !== '{}') {
      // if (JSON.stringify(fs) !== '{}') {

      const endDate = new Date(fs["Insured.tCertfEndDate"] || '')   // 结束时间 
      let minDate = dayjs(endDate).valueOf();
      return date.getTime() > minDate
    } else {
      return true;
    }

  },
  // 证件有效止期
  tCertfEndDateDisable: (date: any) => {
    const fs = insuredEditRef?.value?.getFromValue();
    if (fs && JSON.stringify(fs) !== '{}') {
      const startDate = new Date(fs["Insured.tCertfBgnDate"] || '')   // 开始时间   

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
};

function setregistAdd() {
  const ads = insuredEditRef?.value?.getValue("Insured.ClntAddrProp");
  const a =
    insuredEditRef?.value?.getValue("Insured.cSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        setAddressStr("Insured.cClntAddr", b);
        setAddressStr("Insured.cHabitualResidence", b);
      }
    });
  } else {
    setAddressStr("Insured.cClntAddr", a);
    setAddressStr("Insured.cHabitualResidence", a);
  }
}

function setRegisterAdd() {
  const ads = insuredEditRef?.value?.getValue("Insured.RegisterProp");
  const a = insuredEditRef?.value?.getValue("Insured.cRegisterSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        setAddressStr("Insured.cRegisteredcapDre", b);
      }
    });
  } else {
    setAddressStr("Insured.cRegisteredcapDre", a);
  }
}

function setAddressStr(key: any, data: any) {
  insuredEditRef?.value?.setValue(key, data);
}

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return insuredEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  insuredEditRef?.value?.setFormValue(value);
}

function validate() {
  return insuredEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  insuredEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return insuredEditRef?.value?.getValue(key);
}
function getFormconfig() {
  return formconfig1;
}


function clearValidate(key = null) {
  insuredEditRef?.value?.clearValidate(key);
}

function handleFileChange(event: Event) {
  const fileInput = event.target as HTMLInputElement;
  if (fileInput.files && fileInput.files.length > 0) {
    isOcrEcho = true;

    const file = fileInput.files[0];
    // 处理文件上传逻辑
    const param = {
      file: file,
      type: formconfig.value.fileInputType,
    };
    readFile(param)
      .then((res: any) => {
        if (res.code === 200 && res.data && res.data.result) {
          tCertfDate.value = [];
          if (formconfig.value.fileInputType === "1") {
            // 身份证
            const result = res.data.result.item_list;
            const keys = result.map((item: any) => item.key);
            let cardInfo: any = {};
            keys.forEach((key: any) => {
              const value = result.find((item: any) => item.key === key).value;
              cardInfo[key] = value;
            });
            if (cardInfo["id_number"])
              setValue("Insured.cCertfCde", cardInfo["id_number"]);

            if (cardInfo["name"])
              setValue("Insured.cInsuredNme", cardInfo["name"]);
            if (cardInfo["sex"])
              setValue("Insured.cSex", cardInfo["sex"] === "男" ? "1" : "2");
            if (cardInfo["date_of_birth"])
              setValue(
                "Insured.tBirthday",
                cardInfo["date_of_birth"]
                  .replace(/(年|月)/g, "-")
                  .replace("日", "")
              );
            if (cardInfo["validate_date"]) {
              tCertfDate.value = cardInfo["validate_date"].split("-");
              setValue(
                "Insured.tCertfBgnDate",
                cardInfo["validate_date"].split("-")[0]?.replaceAll('.','-')
              );
              if (cardInfo["validate_date"].split("-")[1] === "长期") {
                setValue("Insured.cLongendTyp", "1");
              } else {
                setValue("Insured.cLongendTyp", "0");
                setValue(
                  "Insured.tCertfEndDate",
                  cardInfo["validate_date"].split("-")[1]?.replaceAll('.','-')
                );
              }
            }
            setValue("Insured.cCertfCls", "111");
            setValue("Insured.cClntMrk", "1");
            if (cardInfo["id_number"])
              idAnalysis(cardInfo["id_number"])
          }
          if (formconfig.value.fileInputType === "2") {
            // 外国人永久居留身份证
            const cardInfo = res.data.result.details;
            setValue(
              "Insured.cCertfCde",
              cardInfo["id_number"]["value"] || null
            );
            setValue("Insured.cInsuredNme", cardInfo["name"]["value"] || null);
            setValue(
              "Insured.cSex",
              cardInfo["sex"]["value"]
                ? cardInfo["sex"]["value"].split("/")[0] === "男"
                  ? "1"
                  : "2"
                : null
            );
            setValue(
              "Insured.tBirthday",
              cardInfo["date_of_birth"]["value"]
                ? cardInfo["date_of_birth"]["value"].replaceAll(".", "-")
                : null
            );
            if (cardInfo["period_of_validity"]["value"]) {
              tCertfDate.value =
                cardInfo["period_of_validity"]["value"].split("-")?.map((item: any) => (item.replaceAll(".", "-")));
              setValue("Insured.cLongendTyp", "0");
              setValue(
                "Insured.tCertfBgnDate",
                cardInfo["period_of_validity"]["value"].split("-")[0]?.replaceAll(".", "-") || null
              );
              setValue(
                "Insured.tCertfEndDate",
                cardInfo["period_of_validity"]["value"].split("-")[1]?.replaceAll(".", "-") || null
              );
            }
            setValue("Insured.cCertfCls", "553");
            setValue("Insured.cClntMrk", "1");
            const getCacheCodeLis = codeListStore.getCacheCodeListByCode('AREA_COUNTRY_CACHE{"cType":"0"}');
            const countryNm = cardInfo["nationality"].value?.split("/")[0] || null;
            const countryId = getCacheCodeLis?.find((item: any) => item.label === countryNm)?.value || null;
            setValue("Insured.cNation", countryId);
          }
          if (formconfig.value.fileInputType === "3") {
            // 营业执照
            const result = res.data.result.item_list;
            const keys = result.map((item: any) => item.key);
            let cardInfo: any = {};
            keys.forEach((key: any) => {
              const value = result.find((item: any) => item.key === key).value;
              cardInfo[key] = value;
            });
            console.log('营业执照’，', cardInfo)
            if (cardInfo["BizLicenseCreditCode"])
              setValue("Insured.cCertfCde", cardInfo["BizLicenseCreditCode"]); // // 证件号码
            if (cardInfo["BizLicenseCompanyName"])
              setValue("Insured.cInsuredNme", cardInfo["BizLicenseCompanyName"]); // 客户名称
            if (cardInfo["BizLicenseOperatingPeriod"]) {
              tCertfDate.value = cardInfo["BizLicenseOperatingPeriod"].split("至");
              setValue(
                "Insured.tCertfBgnDate",
                cardInfo["BizLicenseOperatingPeriod"].split("至")[0]?.replace(/[年|月|]/g, '-').replace(/日/g, '')
              );
              if (cardInfo["BizLicenseOperatingPeriod"].split("至")[1]?.includes("长期") || cardInfo["BizLicenseOperatingPeriod"].split("至")[1]?.includes("期限") || cardInfo["BizLicenseOperatingPeriod"].split("至")[1] === "年月日") {
                setValue("Insured.cLongendTyp", "1");
              } else {
                setValue("Insured.cLongendTyp", "0");
                setValue(
                  "Insured.tCertfEndDate",
                  cardInfo["BizLicenseOperatingPeriod"].split("至")[1]?.replace(/[年|月|]/g, '-').replace(/日/g, '')
                );
              }
            }
            setValue("Insured.cCertfCls", "01");
            setValue("Insured.cClntMrk", "0");
          }
          checkUser();
          formconfig.value.fileInputType = ""
          setTimeout(() => {
            isOcrEcho = false;
          }, 1000);
        }
      })
      .catch((err) => {
        formconfig.value.fileInputType = ""
        isOcrEcho = false;
        ElMessage.error(err);
      });
    fileInputRef.value.value = ""; // 清空文件输入框的值
  }
}

const terms = ['00425000277', '00425000278', '00425000279', '00425000280', '00425000281'];
function change403009(v) {
  if (terms.includes(v)) {
    setValue("Tgt.cInsuranceMethod", "613001");
    setFormItem("Insured.cSafetyStandardizationLevel", { hidden: false });
    setFormItem("Insured.cCreditRating", { hidden: false });
    setFormItem("Insured.cIsLargeMediumEnterprise", { hidden: false });
  }
}

// OCR识别弹框确认
function ok() {
  if (formconfig.value.fileInputType == "") {
    ElMessage.warning("请先选择OCR识别类型");
    return false
  }
  maindialogVisible.value = false
  fileInputRef.value?.click();
}

// OCR识别弹框取消
function cancel() {
  formconfig.value.fileInputType = ""
  maindialogVisible.value = false
}
function addProvide<T>(key: InjectionKey<T> | string, value: T) {
  insuredEditRef?.value?.addProvide(key, value);
}
// 客户重置
function resetFn() {
  const cAppNo = opertaor.getTableRefByKey('plyBase')?.getFromValue()?.['Base.cAppNo'];
  if(!param.cAppNo || !cAppNo) return;
  const params = {
    type: param.pageName === "priceInquiry" ? 'I' : 'A',
    param: param.pageName === "priceInquiry" ? param.cInquiryNo : param.cAppNo,
    entity: 'Insured'
  }
  reset(params).then(() => {
  }).catch((err:any) => {
    console.log(err)
  })
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig,
  clearValidate,
  setFormItem,
  change403009,
  addProvide
});
</script>

<style scoped></style>

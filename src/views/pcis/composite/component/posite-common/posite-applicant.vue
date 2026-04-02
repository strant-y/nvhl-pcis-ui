<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="applicantEditRef" />
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
import dayjs from "dayjs";
import { codeListViewStore } from "@/store";
import moment from "moment";
import { useValidator } from "@/typings/useValidator";
import { useProductStore } from "@/store/modules/prod";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { set } from "lodash";
import { validateIdCard } from "@/typings/method-public";
import { calculateAgeFromIdCard } from "@/utils/common";
import { setCapitalRequiredRule, disablePastDates } from "@/utils/InsuranceCoverageRules";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { getDefaultCompilerOptions } from "typescript";
import { getAddressStr, qryCustomer, reset } from "@/api/query";
import { idxParamKey, IdxParamProps, useIdxParam } from "@/views/pcis/support/useIdxParam";
import { listChrDepts } from "@/api/dept";
import { coverageHint } from "@/api/prod/index";
import { eventBus } from "@/utils/event-bus";

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
const productStore = useProductStore();
const dialog = ref<DialogMethod | null>(null);
const applicantEditRef = ref<AppFreeEditMethod | null>(null);
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const pageView = inject("pageView", ref(new CompositePageView()));
const formconfig1 = reactive(createAppFreeEditConfig({}));
const formData = ref<any[]>([]);
const cClntAddr = ref<any>(null);
import { useRoute } from "vue-router";
const route = useRoute();
const param = opertaor.getParam();
const fileInputRef: any = ref(null);
const formconfig = ref({
  fileInputType: "1"
});
import { readFile } from "@/api/file";
import {ref} from "vue";
import {CompositePageView, GroupForm} from "@/views/pcis/support/composite.types";
const tCertfDate = ref<any[]>([]);
const cWorkDptList = ['310', '320', '330', '340', '350', '360']  // 单位性质带企业的ID
const maindialogVisible = ref(false) // ocr识别弹框打开
const resetLogo = ref<any>(false);   // 重置标识
let isOcrEcho = false;   // OCR识别标志
let firstRealData = true;
let insuranceCoverageFlag = false;

onMounted(() => {
  const formconfig11 = formInit(
      JSON.stringify(props.pageSchema),
      method,
      getRules
  );
  // 投保人信息累计保额按钮 只在核保页面展示
  formconfig11.titleBtns?.forEach((item:any) => {
    if(item.id === "insurance_coverage") {
      if(param.pageType === "PLY_UW_PROCESS_SCENE" && param?.pageName !== "priceInquiry") {
        item.hidden = false
      } else {
        item.hidden = true
      }
    }
  })
  Object.assign(formconfig1, formconfig11);
  nextTick(async () => {
    console.log(formconfig1,'formconfig1formconfig1formconfig1formconfig1')
    //是否小微企业，默认非必填、只读
    // setFormItem("Applicant.cIsMicroEntpris", {
    //   rules: null,
    //   disabled: true,
    // });

    setValue("Applicant.cNation", "CHN"); // 国籍默认中国
    // 客户名称增加校验规则
    setFormItem("Applicant.cAppNme", { rules: [getRules("required", {}), getRules("cAppNme", {})], });
    //【国民经济行业分类】初始化必填，只有法人时才必填，现在个人也是必填了（老系统需求：040001/042002/043004/043005/043011五款产品不区分法人个人投保，国民经济行业分类都必填，其他产品只有法人才必填）
    const cProdNo = param.cProdNo;
    if (
        cProdNo === "040001" ||
        cProdNo === "042002" ||
        cProdNo === "043004" ||
        cProdNo === "043005" ||
        cProdNo === "043011"
    ) {
      setFormItem("Applicant.cTrdCde", { rules: [getRules("required", {})],btnItems: { disabled: false } });
    }
    if (cProdNo === '130003') {
      setFormItem("Applicant.cGreenIndustryCustomers", { hidden: true, rules: null });
      setFormItem("Applicant.cGreenIndustryList", { hidden: true, rules: null });
    }

    // 处理邮编
    setFormItem("Applicant.cZipCde", {
      'maxlength': 6,
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


    if (param.cProdNo === '043009') {
      setFormItem("Applicant.cAgencyReason", { hidden: true });
      setFormItem("Applicant.cEnterpriseTel", { hidden: true });
      // 福建分公司下的机构 法定代表人、经营范围必填
      await getDptCdeList();
      if(isFujianBranch.value) {
        setFormItem("Applicant.cLegalRepresentative", { hidden: false, rules: [getRules("required", {})] });
        setFormItem("Applicant.cBusinessScope", { hidden: false, rules: [getRules("required", {})] });
      } else {
        setFormItem("Applicant.cLegalRepresentative", { hidden: false });
        setFormItem("Applicant.cBusinessScope", { hidden: false });
      }
    }else{
      setFormItem("Applicant.cAgencyReason", { hidden: false });
      setFormItem("Applicant.cLegalRepresentative", { hidden: false });
      setFormItem("Applicant.cEnterpriseTel", { hidden: false });
    }

    setFormItem("Applicant.cGcidCode", { rules: [getRules("leiCode", {})] });
    // 关联交易审批单编号
    setFormItem("Applicant.cRelateNo", { rules: [getRules("txnApprovalNo", {})] });
    // 经常居住地校验
    setFormItem("Applicant.cHabitualResidence", { rules: [getRules("valiAddress", {})] });
    // 证件号码
    // setFormItem("Applicant.cCertfCde", { minWidth: '165px' });
    if((param.pageType === "EDR_APP_NEW_SCENE" || param.pageType === "TEMPORARY_DEPOSIT") && (param.cTransMrk == '1' || param.cRsnCde === '99' || param.cEdrRsnBundle === '99' || param.cEdrRsnBundleCde === '99')) {
      setFormItem("Applicant.cCertfCls", { disabled: false });
      setFormItem("Applicant.cCertfCde", { disabled: false });
    }
    // 职业下拉选项
    codeListStore
        .queryCodeList({
          codeListName: 'INDUSTRY_INQUIRY_EX',
          codeListParam: { value: getValue('Applicant.cOccupCde') },
        })
        .then((res:any) => {
          applicantEditRef.value?.addCodeListMap({
            code: "Applicant.cOccupCde",
            list: res.length > 0 ? res.map((item:any) => ({ label: `${item.value} ${item.label}`, value: item.value })) : [],
          })
        });
  });
});
// //给表单下拉项赋值
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

function recursiveSetFormItem(items: any[], targetKey: string, obj: Record<string, any>) {
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
  console.log('idAnalysis-tabref', tabref)
  const applicantValue = tabref["applicant"].getFromValue();

  if (!validateIdCard(id) || (applicantValue["Applicant.cCertfCls"] !== '111' && applicantValue["Applicant.cCertfCls"] !== '553')) {
    return false
  }
  const birthYear = parseInt(id.substring(6, 10), 10);
  const birthMonth = parseInt(id.substring(10, 12), 10);
  const birthDay = parseInt(id.substring(12, 14), 10);
  const birthday = `${birthYear}-${birthMonth.toString().padStart(2, "0")}-${birthDay.toString().padStart(2, "0")}`;
  const sexCode = parseInt(id.substring(16, 17), 10);
  const sex = sexCode % 2 === 0 ? "2" : "1"; // 1: 男, 2: 女
  const age = calculateAgeFromIdCard(id);
  if (!getValue("Applicant.cNation")) {
    setValue("Applicant.cNation", "CHN"); // 国籍
  }

  setValue("Applicant.tBirthday", birthday);
  setValue("Applicant.nAge", age);
  setValue("Applicant.cSex", sex);

  // clearValidate('Applicant.cCertfCde')
};
// 防抖定时器
let debounceTimer = <any>null;
//  根据 客户名称 / 被保人性质/ 证件类型 / 证件号码 获取客户信息
const checkUser = () => {
  const fieldsToValidate = ['Applicant.cAppNme', 'Applicant.cClntMrk', "Applicant.cCertfCde", "Applicant.cCertfCls"];

  // 自定义录单 方案配置 模版 进入 可以查询用户信息
  if (!resetLogo.value && (param.pageType !== "app" && param.pageType !== "copy" && param.pageType !== "template" && param.cAppStatus !== '1')) {
    return false;
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  const tabref = opertaor.getTableRefs();
  const applicantValue = tabref["applicant"].getFromValue();
  //  只要4个有值 去请求客户信息
  if (applicantValue["Applicant.cAppNme"] &&
      applicantValue["Applicant.cClntMrk"] !== null &&
      applicantValue["Applicant.cCertfCde"] &&
      applicantValue["Applicant.cCertfCls"]) {

    applicantEditRef.value?.validateField(fieldsToValidate).then((isValid) => {
      if (isValid) {
        debounceTimer = setTimeout(() => {
          const param = {
            coustName: applicantValue["Applicant.cAppNme"],
            coustMrk: applicantValue["Applicant.cClntMrk"],
            coustType: applicantValue["Applicant.cCertfCls"],
            coustCode: applicantValue["Applicant.cCertfCde"],
            personnelType: "Applicant"
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
                    // tabref ['applicant'].setFormValue(data[0])
                    let userId = getValue('Applicant.cCertfCde')
                    idAnalysis(userId)
                  }
                } else {

                }
              })
              .finally(() => { });


        }, 500); // 防抖延迟500ms
      }
    })
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
  funCheckUser: (val: any) => {
    if (param.initFlag) {
      return;
    }
    if (val) {
      setValue("Applicant.cAppNme", val.trim())// 去除首位空格

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
      resetFn()
    }
    resetLogo.value = true;
    tCertfDate.value = [];
    tabref["applicant"].setFormValue(applicantValue);
  },
  // 证件类型
  cardTypeChange: (val: any) => {
    const param = opertaor.getParam();
    const isInit = param.initFlag; // 是否是初始化状态
    const personFields = ['cNation', 'tBirthday', 'nAge', 'cSex'];
    console.log(33322, val, param)


    if (!isInit && !isOcrEcho) {
      checkUser();   // 调用客户信息接口
      clearValidate('Applicant.cCertfCde')  // 清除报错信息
    }

    if (param.pageType!=="readonly") {

      personFields.forEach(field => {
        setFormItem(`Applicant.${field}`, { disabled: false });
      });
    }



    setFormItem("Applicant.tCertfBgnDate", { rules: null });
    setFormItem("Applicant.tCertfEndDate", { rules: null });
    setFormItem("Applicant.tEstablishingDate", { disabled: true, rules: null });
    clearValidate('Applicant.tEstablishingDate')  // 清除报错信息

    if (val == "111") {
      setFormItem("Applicant.cCertfCde", {
        rules: [getRules("required", {}), getRules("idCard", {})],
      });
      setFormItem("Applicant.tCertfBgnDate", {
        rules: [getRules("required", {})],
      });

      setFormItem("Applicant.tCertfEndDate", {
        rules: [getRules("required", {})],
      });
      setValue("Applicant.cNation", "CHN"); // 国籍

      personFields.forEach(field => {
        setFormItem(`Applicant.${field}`, { disabled: true });
      });

    } else if (val == "110002") {
      setFormItem("Applicant.tCertfEndDate", {
        rules: [getRules("required", {})],
      });
    } else if (val == "01") {
      setFormItem("Applicant.tCertfBgnDate", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.tCertfEndDate", {
        rules: [getRules("required", {})],
      });

      // 统一社会信用代码校验
      setFormItem("Applicant.cCertfCde", {
        rules: [getRules("required", {}), getRules("socialCode", {})],
      });

      // 为法人  企业成立日期
      setFormItem("Applicant.tEstablishingDate", {
        disabled: false,
        rules: [getRules("required", {})],
      });
    } else if (val === '07') {
      // 护照
      setFormItem("Applicant.cCertfCde", {
        rules: [getRules("required", {}), getRules("passPort", {})],
      });
    } else if (val == "553") {
      // 外国人证件号
      setFormItem("Applicant.cCertfCde", {
        rules: [getRules("required", {}), getRules("ariCard", {})],
      });
    } else {
      setFormItem("Applicant.cCertfCde", {
        rules: [getRules("required", {})],
      });
    }



    if (isInit || isOcrEcho) return;

    // 切换清空
    if (val) {
      const fieldsToClear = ["Applicant.tBirthday", "Applicant.nAge", "Applicant.cCertfCde", "Applicant.tEstablishingDate"];
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
  //证件有效期开始时间事件改变
  tCertfBgnDateChange: (val) => {
    const tableData = opertaor.getTableRefs();
    const tcertfEndDate = tableData["applicant"].getFromValue()["Applicant.TcertfEndDate"]  //证件有效止期
    const tIssueTm = tableData["insrnc"].getFromValue()["Base.tIssueTm"] //签单日期
    const tinsrncBgnTm = tableData["insrnc"].getFromValue()["Base.TInsrncBgnTm"] //保险起期
  },
  //证件有效期止期时间事件改变
  tCertfEndDateChange: (val) => {
    const tableData = opertaor.getTableRefs();
    const tcertfEndDate = tableData["applicant"].getFromValue()["Applicant.tCertfEndDate"]  //证件有效止期
    const tIssueTm = tableData["insrnc"].getFromValue()["Base.tIssueTm"] //签单日期
    const tinsrncBgnTm = tableData["insrnc"].getFromValue()["Base.tInsrncBgnTm"] //保险起期
    if (val && tIssueTm && tinsrncBgnTm) {
      const certfEndDate = new Date(val).getTime();
      const issueTm = new Date(tIssueTm).getTime();
      const insrncBgnTm = new Date(tinsrncBgnTm).getTime();
      if (certfEndDate < issueTm) {
        ElMessage.error("投保人证件有效期小于保单签单时间，请关注!");
        setValue("Insured.tCertfEndDate", '');
      }
      if (certfEndDate < insrncBgnTm) {
        ElMessage.error("投保人证件有效期小于保单起保时间，请关注!");
      }
    }
  },
  //企业成立时间事件改变
  tEstablishingDateChange: (val: any) => {
    pageView.value.linkedOperation().executeFirst((operatorData, group: GroupForm) => {
      const tableParam = operatorData.getTableRefs();
      const tAppTm = tableParam["insrnc"].getFromValue()["Base.tAppTm"]  //投保日期
      const tIssueTm = tableParam["insrnc"].getFromValue()["Base.tIssueTm"]   //签单日期
      if (val && tAppTm && tIssueTm) {
        const establishingDate = new Date(val).getTime();
        const appTm = new Date(tAppTm).getTime();
        const issueTm = new Date(tIssueTm).getTime();
        const foundingDay = new Date('1949-10-01').getTime();;
        if (establishingDate > issueTm) {
          ElMessage.error("企业成立时间小于保单签单时间，请关注!");
        }
        if (establishingDate > appTm) {
          ElMessage.error("企业成立时间小于投保日期，请重新填写!");
          setValue("Applicant.tEstablishingDate", null);
          clearValidate('Applicant.tEstablishingDate')  // 清除报错信息
        }
        const cClntMrk = getValue('Applicant.cClntMrk'); // 法人  1个人  0法人
        const cWorkDpt = getValue('Applicant.cWorkDpt')
        const isSpecialCase = cWorkDptList.includes(cWorkDpt);
        if (cClntMrk == '0' && !!isSpecialCase) {
          if (establishingDate < foundingDay) {
            ElMessage.error("企业成立时间大于1949-10-01，请重新填写!");
            setValue("Applicant.tEstablishingDate", null);
            clearValidate('Applicant.tEstablishingDate')  // 清除报错信息
          }
        }
      }
    })
  },
  //投保人性质(0是法人 1是个人)
  InsureChange: (val) => {
    // if (val == "1") {
    //     setFormItem("Applicant.cIsMicroEntpris", { disabled: true }); // 是否小微企业
    //     setFormItem("Applicant.cGreenIndustryCustomers", { disabled: true }); // 是否绿色产业客户
    //     setFormItem("Applicant.cGreenIndustryList", { disabled: true }); // 是否绿色产业客户
    // }
    const param = opertaor.getParam();
    if (param.initFlag) {
      if(val === "0") {
        codeListStore
            .queryCodeList({
              codeListName: 'UN_NATURAL_CERTIFICATE_CACHE',
              codeListParam: {},
            })
            .then((res) => {
              applicantEditRef.value?.addCodeListMap({
                code: "Applicant.cCertfCls",
                list: res
              })
            });
      }
    }
    if (val === "0") {
      // 投保人是法人，出生日期、年龄、性别、职业类别、经营范围、婚姻状况隐藏,国籍必填可修改
      setFormItem("Applicant.tBirthday", {
        hidden: true,
      });
      setFormItem("Applicant.nAge", {
        hidden: true,
      });
      setFormItem("Applicant.cSex", {
        hidden: true,
      });
      setFormItem("Applicant.cNation", {
        rules: [getRules('required',{})],
      });
      setFormItem("Applicant.cOccupTyp", {
        hidden: true,
      });
      setFormItem("Applicant.cMrgCde", {
        hidden: true,
        rules: null,
      });
      setFormItem("Applicant.cIsBranch", {
        hidden: false,
      });
      setFormItem("Applicant.cStkMrk", {
        hidden: false,
      });
      setCapitalRequiredRule(getValue, setFormItem, 'Applicant');
      setFormItem("Applicant.tBirthday", {
        rules: null
      });
      clearValidate('Applicant.tBirthday')
      setFormItem("Applicant.nAge", {
        rules: null
      });
      clearValidate('Applicant.nAge')
      setFormItem("Applicant.cSex", {
        rules: null
      });
      clearValidate('Applicant.cSex')

      productStore.setcClntMrk(val);
      // 办理人(0928需求法人时办理人人员姓名、证件类型、证件号码必填、有效止期非必填)
      // setFormItem("Applicant.cCntrNme", { rules: [getRules("required", {})] });
      // setFormItem("Applicant.tOperaterCertfEndTm", {
      //   rules: [getRules("required", {})],
      // });
      // setFormItem("Applicant.cOperaterCertfTyp", {
      //   rules: [getRules("required", {})],
      // });
      // setFormItem("Applicant.cOperaterCertfCde", {
      //   rules: [getRules("required", {})],
      // });
      setFormItem("Applicant.cEnterpriseTel", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.cCntrCertfCde", {
        rules: [getRules("required", {})],
      });

      if (!param.initFlag) {
        setFormItem("Applicant.cWorkDpt", { // 单位性质
          disabled: false,
        });
        setFormItem("Applicant.cIsMicroEntpris", { // 是否小微企业
          disabled: false,
        });
        setFormItem("Applicant.cIsIndvduBiz", {
          disabled: true,
        });
        // 是否绿色产业客户
        setFormItem("Applicant.cGreenIndustryCustomers", {
          disabled: false,
        });

        // 绿色客户 如果为时就放开
        if (getValue('Applicant.cGreenIndustryCustomers') == '1') {
          setFormItem("Applicant.cGreenIndustryList", {
            rules: [getRules("required", {})],
            disabled: false,
          });
        }
        //是否个体工商户
        setValue("Applicant.cIsIndvduBiz", "");
      }
      setFormItem("Applicant.cWorkDpt", {
        rules: [getRules("required", {})],
      });
      // 是否绿色产业客户
      setFormItem("Applicant.cGreenIndustryCustomers", {
        rules: [getRules("required", {})],
      });

      // 参加社会统筹标志
      setFormItem("Applicant.cParticiinsocTyp", {
        rules: [getRules("required", {})],
      });
      //注册地址
      // setFormItem("Applicant.cRegisteredcapDre", {
      //   rules: [getRules("required", {})],
      // });

      // 注册地址
      setFormItem("Applicant.RegisterProp", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.cRegisterSuffixAddr", {
        rules: [getRules("required", {})],
      });

      // 单位性质 --为企业做必填校验
      const cWorkDpt = getValue('Applicant.cWorkDpt')
      const isSpecialCase = cWorkDptList.includes(cWorkDpt);
      const requiredRule = [getRules("required", {})];
      //实名认证方式-20251013 实名认证方式都是非必填
      // setFormItem("Applicant.cRealnameAuthType", {
      //   rules: isSpecialCase ? requiredRule : []
      // });
      // 法定代表人/责任人
      if(param.cProdNo === '043009' && isFujianBranch.value) {
        setFormItem("Applicant.cLegalRepresentative", { rules: [getRules("required", {})] });
        setFormItem("Applicant.cBusinessScope", { rules: [getRules("required", {})] });
      } else {
        setFormItem("Applicant.cLegalRepresentative", {
          rules: isSpecialCase ? requiredRule : []
        });
        setFormItem("Applicant.cBusinessScope", {
          hidden: true,
        });
      }
      // 企业成立日
      if (!param.initFlag && !isSpecialCase) {
        setValue("Applicant.tEstablishingDate", null);
        clearValidate('Applicant.tEstablishingDate')  // 清除报错信息
      }
      setFormItem("Applicant.tEstablishingDate", {
        disabled: !param.initFlag && isSpecialCase ? false : true,
        rules: isSpecialCase ? requiredRule : []
      });


      let cMobile = getValue('Applicant.cMobile');  // 移动
      let cTel = getValue('Applicant.cTel');  // 固定电话
      if (!cMobile && !cTel) {
        setFormItem("Applicant.cMobile", {
          rules: [getRules("required", {}), getRules("phoneNo", {})],
        });
      } else if (cMobile) {
        setFormItem("Applicant.cTel", { rules: [getRules("phone", {})] });
        setFormItem("Applicant.cMobile", { rules: [getRules("required", {}), getRules("phoneNo", {})] })
      } else if (cTel) {
        setFormItem("Applicant.cTel", { rules: [getRules("required", {}), getRules("phone", {})] });
        setFormItem("Applicant.cMobile", { rules: [getRules("phoneNo", {})] })
      }

      // 是否个体工商户
      setFormItem("Applicant.cIsIndvduBiz", {
        rules: [],
      });
      // 为法人 国民经济行业必填
      setFormItem("Applicant.cTrdCde", {
        rules: [getRules("required", {})],
        btnItems: { disabled: false }
      });
      setFormItem("Applicant.cIsMicroEntpris", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.nRegisteredCapital", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.cFirmscaleTyp", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.cLegalRepresentative", {
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
      setFormItem("Applicant.cEdubackgroudTyp", {
        rules: [],
      });
      setFormItem("Applicant.nYearincomeNum", {
        rules: [],
      });
    } else {

      setFormItem("Applicant.tBirthday", {
        hidden: false,
      });
      setFormItem("Applicant.nAge", {
        hidden: false,
      });
      setFormItem("Applicant.cSex", {
        hidden: false,
      });
      setFormItem("Applicant.cNation", {
        rules: [],
      });
      setFormItem("Applicant.cOccupTyp", {
        hidden: false,
      });
      setFormItem("Applicant.cBusinessScope", {
        hidden: false,
        rules: []
      });
      setFormItem("Applicant.cMrgCde", {
        hidden: false,
        rules: [getRules("required", {})],
      });
      // 投保人是个人，是否分支机构、 股东客户隐藏
      setFormItem("Applicant.cIsBranch", {
        hidden: true,
      });
      setFormItem("Applicant.cStkMrk", {
        hidden: true,
      });
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
      // setFormItem("Applicant.cRegisteredcapDre", { rules: null });
      setFormItem("Applicant.RegisterProp", {
        rules: null,
      });
      setFormItem("Applicant.cRegisterSuffixAddr", {
        rules: null,
      });
      if (!param.initFlag) {
        //是否个体工商户
        setFormItem("Applicant.cIsIndvduBiz", {
          disabled: false,
        });
        // 企业成立日期
        setValue("Applicant.tEstablishingDate", null);
        clearValidate('Applicant.tEstablishingDate')  // 清除报错信息
      }
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
      // 是否小微企业
      setFormItem("Applicant.cIsMicroEntpris", {
        rules: null,
        disabled: true,
      });
      // 为法人  企业成立日期
      setFormItem("Applicant.tEstablishingDate", {
        disabled: true,
        rules: null,
      });
      setFormItem("Applicant.cEnterpriseTel", {
        rules: [],
      });
      //是否分支机构
      if (!getValue('Applicant.cIsBranch')) {
        setValue("Applicant.cIsBranch", "1");
      }


      setFormItem("Applicant.cCntrNme", { rules: null });
      setFormItem("Applicant.tOperaterCertfEndTm", { rules: null });
      setFormItem("Applicant.cOperaterCertfTyp", { rules: null });
      setFormItem("Applicant.cOperaterCertfCde", { rules: null });

      setFormItem("Applicant.cCntrCertfCde", { rules: null });


      // 国民行业分类
      const cProdNo = param.cProdNo;
      if (
          cProdNo === "040001" ||
          cProdNo === "042002" ||
          cProdNo === "043004" ||
          cProdNo === "043005" ||
          cProdNo === "043011"
      ) {
        setFormItem("Applicant.cTrdCde", { rules: [getRules("required", {})],btnItems: { disabled: false } });

      } else {
        setFormItem("Applicant.cTrdCde", {
          rules: [],
          btnItems: { disabled: true }
        });
      }
      //实名认证方式
      setFormItem("Applicant.cRealnameAuthType", {
        rules: [],
      });
      // 法定代表人/责任人
      setFormItem("Applicant.cLegalRepresentative", {
        rules: []
      });
      // 个人 客户学历必填
      setFormItem("Applicant.cEdubackgroudTyp", {
        rules: [getRules("required", {})],
      });
      // 个人 年收入（单位：万元）必填
      setFormItem("Applicant.nYearincomeNum", {
        rules: [getRules("required", {})],
      });

      // 个人 移动电话必填
      setFormItem("Applicant.cMobile", {
        rules: [getRules("required", {}), getRules("phoneNo", {})],
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
      setFormItem("Applicant.cIsMicroEntpris", {
        rules: [],
      });
      setFormItem("Applicant.nRegisteredCapital", {
        rules: [],
      });
      setFormItem("Applicant.cFirmscaleTyp", {
        rules: [],
      });
      setFormItem("Applicant.cLegalRepresentative", {
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
                    Object.values(item).includes(getValue("Applicant.cCertfCls"))
                )
            ) {
              if (getValue('Applicant.cCertfCls')) {
                setValue("Applicant.cCertfCls", "");
              }

            }

            // setFormItem("Applicant.cCertfCls", {
            //   loadData: res,
            //   rules: [getRules("required", {})],
            // });
            applicantEditRef.value?.addCodeListMap({
              code: "Applicant.cCertfCls",
              list: res
            })
          });
    }
    let co = 'NATURAL_CERTIFICATE_CACHE';

    if (val == '0') {
      co = 'UN_NATURAL_CERTIFICATE_CACHE';
    }

    if (!param.initFlag) {
      codeListStore
          .queryCodeList({
            codeListName: co,
            codeListParam: {},
          })
          .then((res) => {
            if (!res.some((item) => Object.values(item).includes(getValue("Applicant.cCertfCls")))) {
              setValue("Applicant.cCertfCls", "");
            }

            applicantEditRef.value?.addCodeListMap({
              code: "Applicant.cCertfCls",
              list: res
            })
            if (val === '0') {
              setValue('Applicant.cCertfCls', '01');  // 法人默认机构代码
            }
          });
    }

    checkUser();
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
              setFormItem("Applicant.cShareholderCategory", {
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
            setValue("Applicant.cShareholderCategory", res[0]?.value)
          });
    }
  },

  // 是否个体工商户
  cIsIndvduBizChange: (val: any) => {
    if (val == "1") {

      setFormItem("Applicant.cOccupCde", { rules: [getRules("required", {})] });
      setFormItem("Applicant.cOccupCde", { btnItems: { disabled: false } });
      setFormItem("Applicant.cTrdCde", { rules: [getRules("required", {})] });
      setFormItem("Applicant.cTrdCde", { btnItems: { disabled: false } });
    } else if (val == "0") {
      setFormItem("Applicant.cOccupCde", { rules: [] });
      setFormItem("Applicant.cTrdCde", { rules: [] });
      setFormItem("Applicant.cOccupCde", { btnItems: { disabled: true } });
      setFormItem("Applicant.cTrdCde", { btnItems: { disabled: true } });
      setValue("Applicant.cOccupCde", null);
      setValue("Applicant.cTrdCde", null);
    } else {
      setFormItem("Applicant.cOccupCde", { btnItems: { disabled: false } });
      setFormItem("Applicant.cTrdCde", { btnItems: { disabled: false } });
      setFormItem("Applicant.cTrdCde", { rules: [getRules("required", {})] })
    }
  },
  // 是否分支机构
  cIsBranchChange: (val: any) => {
    if (val) {
      setCapitalRequiredRule(getValue, setFormItem, 'Applicant');
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
              applicantEditRef.value?.addCodeListMap({
                code: 'Applicant.cOccupCde',
                list: [{ label: `${data.cde} ${data.cnm}`, value: data.cde }]
              });
              setValue("Applicant.cOccupCde", data.cde);
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

  // 证件有效期长期标识
  tCertMrkChecked: (val: any) => {
    const param = opertaor.getParam();
    if (val == "1") {
      setValue(
          "Applicant.tCertfEndDate",
          moment(new Date("9999-12-31")).format("YYYY-MM-DD HH:mm:ss")
      );
      setFormItem("Applicant.tCertfEndDate", { disabled: true });

      // let cCertfCls = getValue('Applicant.cCertfCls');  // 证件类型   01  111
      // if(cCertfCls ==="111" || cCertfCls ==="110008=7"){
      //     setFormItem("Applicant.tCertfBgnDate", {  rules: [getRules("required", {})],});
      //     setFormItem("Applicant.tCertfEndDate", { disabled: true , rules: [getRules("required", {})],});
      // }else{
      //   setFormItem("Applicant.tCertfBgnDate", {  rules: [],});
      //   setFormItem("Applicant.tCertfEndDate", { disabled: true , rules: [],});
      // }

    } else {
      if (tCertfDate.value.length > 0) {
        setValue("Applicant.tCertfBgnDate", tCertfDate.value[0] || "");
        setValue("Applicant.tCertfEndDate", tCertfDate.value[1] || "");
      }
      setFormItem("Applicant.tCertfEndDate", { disabled: false });

      // let cCertfCls = getValue('Applicant.cCertfCls');  // 证件类型   01  111
      // if(cCertfCls ==="111" || cCertfCls ==="110008=7"){
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
    let cClntMrk = getValue('Applicant.cClntMrk'); // 法人  1个人  0法人
    let cTel = getValue('Applicant.cTel'); // 固定电话
    clearValidate('Applicant.cTel')
    if (cClntMrk && val) {
      setFormItem("Applicant.cMobile", {
        rules: [getRules("required", {}), getRules("phoneNo", {})],
      });
      setFormItem("Applicant.cTel", { rules: [getRules("phone", {})] });
    }
    if (cClntMrk == '0' && !val && cTel) {
      setFormItem("Applicant.cMobile", {
        rules: [getRules("phoneNo", {})],
      });
      setFormItem("Applicant.cTel", { rules: [getRules("required", {}), getRules("phone", {})] });
    }

    // setValue('Applicant.cEnterpriseTel', val)
  },
  // 固定电话
  cTelChange: (val) => {
    clearValidate('Applicant.cMobile')
    let cClntMrk = getValue('Applicant.cClntMrk'); // 法人  1个人  0法人
    let cMobile = getValue('Applicant.cMobile');  // 移动

    if (cClntMrk == '0' && val && !cMobile) {
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
  handleClose: (val) => { },
  // 是否绿色产业客户change
  ApplicantIsGreen: (val) => {
    // 控制绿色产业细分列表是否必填
    if (val == "1") {
      setFormItem("Applicant.cGreenIndustryList", {
        rules: [getRules("required", {})],
        disabled: false,
      });
    } else {
      setFormItem("Applicant.cGreenIndustryList", { rules: [] });
      setFormItem("Applicant.cGreenIndustryList", { disabled: true });
      setValue('Applicant.cGreenIndustryList', '')
    }
  },
  // 证件号码change
  cCertfCdeChange: (val: any) => {
    if (param.initFlag) {
      return;
    }
    const tabref = opertaor.getTableRefs();
    const cCertfCls = tabref["applicant"].getFromValue()["Applicant.cCertfCls"];
    if (cCertfCls == "111") {
      if (val) {
        const certfCde = applicantEditRef.value?.getValue(
            "Applicant.cCertfCde"
        );
        applicantEditRef.value?.validateField('Applicant.cCertfCde').then((isValid) => {

          if (isValid) {
            idAnalysis(val)
          }
        })
      }
    }


    checkUser();
  },
  //注册地市是否同上
  isSameChange: (val) => {
    const param = opertaor.getParam();
    if (param.initFlag) {
      return;
    }

    if (val == "1") {
      const ads = applicantEditRef?.value?.getValue("Applicant.ClntAddrProp");
      const a =
          applicantEditRef?.value?.getValue("Applicant.cSuffixAddr") ||
          "";
      applicantEditRef?.value?.setValue("Applicant.RegisterProp", ads);
      applicantEditRef?.value?.setValue("Applicant.cRegisterSuffixAddr", a);
    } else {
    }
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

  // 单位性质
  cWorkDptChange: (val: any) => {
    const clientNature = getValue('Applicant.cClntMrk');
    const isSpecialCase = cWorkDptList.includes(val) && clientNature === '0';
    const requiredRule = [getRules("required", {})];

    setCapitalRequiredRule(getValue, setFormItem, 'Applicant');
    //实名认证方式
    setFormItem("Applicant.cRealnameAuthType", {
      rules: isSpecialCase ? requiredRule : []
    });
    // 法定代表人/责任人
    if(param.cProdNo === '043009' && isFujianBranch.value) {
      setFormItem("Applicant.cLegalRepresentative", { rules: [getRules("required", {})] });
    } else {
      setFormItem("Applicant.cLegalRepresentative", {
        rules: isSpecialCase ? requiredRule : []
      });
    }
    // 企业成立日
    setFormItem("Applicant.tEstablishingDate", {
      disabled: !param.initFlag && isSpecialCase ? false : true,
      rules: isSpecialCase ? requiredRule : []
    });
    if (!param.initFlag && !isSpecialCase) {
      setValue("Applicant.tEstablishingDate", null);
      clearValidate('Applicant.tEstablishingDate')  // 清除报错信息
    }
    if (val =='310' || val =='320' || val =='330' || val =='340' || val =='350'|| val =='360') {
      setFormItem("Applicant.nRegisteredCapital", {
        rules: [getRules("required", {})],
      });
      setFormItem("Applicant.cFirmscaleTyp", {
        rules: [getRules("required", {})],
      });
    }else{
      setFormItem("Applicant.nRegisteredCapital", {
        rules: []
      });
      setFormItem("Applicant.cFirmscaleTyp", {
        rules: []
      });
    }


    const leiCodeRule = [getRules("leiCode", {})];
    if (val === '350') {
      setFormItem("Applicant.cGcidCode", {
        rules: [...requiredRule, ...leiCodeRule]
      });
    } else if (val) {
      setFormItem("Applicant.cGcidCode", {
        rules: leiCodeRule
      });
    }
  },
  // 办理人员证件种类
  cOperaterCertfTypChange: (val: any) => {
    console.log('证件种类', val)
    const param = opertaor.getParam();
    // if (param.initFlag) {
    //   return;
    // }
    // 清除报错信息
    clearValidate('Applicant.cOperaterCertfCde')
    let cClntMrk = getValue('Applicant.cClntMrk');  // 投保人性质
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

    setFormItem("Applicant.cOperaterCertfCde", {
      rules: baseRules,
    });
    if (param.initFlag || isOcrEcho) return;
    // 切换清空
    if (val) {
      const fieldsToClear = ["Applicant.cOperaterCertfCde"];
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
    clearValidate('Applicant.cShareholderCode')

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

    setFormItem("Applicant.cShareholderCode", {
      rules: baseRules,
    });
    if (param.initFlag || isOcrEcho) return;
    // 切换清空
    if (val) {
      const fieldsToClear = ["Applicant.cShareholderCode"];
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
    const fs = applicantEditRef.value?.getFromValue();
    if (fs && JSON.stringify(fs) !== '{}') {

      const endDate = new Date(fs["Applicant.tCertfEndDate"] || '')   // 结束时间
      let minDate = dayjs(endDate).valueOf();
      return date.getTime() > minDate
    } else {
      return true;
    }

  },
  // 证件有效止期
  tCertfEndDateDisable: (date: any) => {
    const fs = applicantEditRef?.value?.getFromValue();
    if (fs && JSON.stringify(fs) !== '{}') {
      const startDate = new Date(fs["Applicant.tCertfBgnDate"] || '')   // 开始时间
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
  // 累计保额按钮
  insuranceCoverageFunc:() => {
    if(!insuranceCoverageFlag) {
      insuranceCoverageFlag = true
      coverageHint({cAppNo: param.cAppNo}).then((res:any) => {
        if(res.code == '1') {
          ElMessage.warning({ message: res.message, duration: 3000 });
        } else {
          ElMessage.error(res.message)
        }
        insuranceCoverageFlag = false
      }).catch((err:any) => {
        ElMessage.error(err.message)
        insuranceCoverageFlag = false
      })
    }
  },
};

function setregistAdd() {
  const ads = applicantEditRef?.value?.getValue("Applicant.ClntAddrProp");
  const a = applicantEditRef?.value?.getValue("Applicant.cSuffixAddr") || "";
  if (ads) {
    getAddressStr({ address: ads }).then((res: any) => {
      const { code, data, msg } = res;
      if (code === 200) {
        const b = (data ? data["addStr"] : "") + a;
        setAddressStr("Applicant.cClntAddr", b);
        setAddressStr("Applicant.cHabitualResidence", b);
      }
    });
  } else {
    setAddressStr("Applicant.cClntAddr", a);
    setAddressStr("Applicant.cHabitualResidence", a);
  }
}

function setRegisterAdd() {
  const ads = applicantEditRef?.value?.getValue("Applicant.RegisterProp");
  const a = applicantEditRef?.value?.getValue("Applicant.cRegisterSuffixAddr") || "";
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
  // 一般批改投保人为个人时是否绿色产业客户、绿色产业细分列表不可编辑
  if(param.pageType === "EDR_APP_NEW_SCENE" || (param.pageType === "TEMPORARY_DEPOSIT" && param.cEdrType === '1')) {
    eventBus.on('setUnDisabledDone', () => {
      nextTick(() => {
        const cClntMrk = formconfig1.fromSchema?.find((item:any) => item.prop === 'Applicant.cClntMrk')
        if(cClntMrk?.disabled !== true) {
          method.InsureChange(value['Applicant.cClntMrk'])
        }
      })
    })
  }
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
                    cardInfo["validate_date"].split("-")[0]?.replaceAll('.','-')
                );
                if (cardInfo["validate_date"].split("-")[1] === "长期") {
                  setValue("Applicant.cLongendTyp", "1");
                } else {
                  setValue("Applicant.cLongendTyp", "0");
                  setValue(
                      "Applicant.tCertfEndDate",
                      cardInfo["validate_date"].split("-")[1]?.replaceAll('.','-')
                  );
                }
              }
              setValue("Applicant.cCertfCls", "111");
              setValue("Applicant.cClntMrk", "1");
              if (cardInfo["id_number"])
                idAnalysis(cardInfo["id_number"])

            }
            if (formconfig.value.fileInputType === "2") {
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
                      ? cardInfo["date_of_birth"]["value"].replaceAll(".", "-")
                      : null
              );
              if (cardInfo["period_of_validity"]["value"]) {
                tCertfDate.value =
                    cardInfo["period_of_validity"]["value"].split("-")?.map((item: any) => (item.replaceAll(".", "-")));
                setValue("Applicant.cLongendTyp", "0");
                setValue(
                    "Applicant.tCertfBgnDate",
                    cardInfo["period_of_validity"]["value"].split("-")[0]?.replaceAll(".", "-") || null
                );
                setValue(
                    "Applicant.tCertfEndDate",
                    cardInfo["period_of_validity"]["value"].split("-")[1]?.replaceAll(".", "-") || null
                );
              }
              setValue("Applicant.cCertfCls", "553");
              setValue("Applicant.cClntMrk", "1");
              const getCacheCodeLis = codeListStore.getCacheCodeListByCode('AREA_COUNTRY_CACHE{"cType":"0"}');
              const countryNm = cardInfo["nationality"].value?.split("/")[0] || null;
              const countryId = getCacheCodeLis?.find((item: any) => item.label === countryNm)?.value || null;
              setValue("Applicant.cNation", countryId);
            } else if (formconfig.value.fileInputType === "3") {
              // 营业执照
              const result = res.data.result.item_list;
              const keys = result.map((item: any) => item.key);
              let cardInfo: any = {};
              keys.forEach((key: any) => {
                const value = result.find((item: any) => item.key === key).value;
                cardInfo[key] = value;
              });
              if (cardInfo["BizLicenseCreditCode"])
                setValue("Applicant.cCertfCde", cardInfo["BizLicenseCreditCode"]); // 证件号码
              if (cardInfo["BizLicenseCompanyName"])
                setValue("Applicant.cAppNme", cardInfo["BizLicenseCompanyName"]); // 客户名称
              if (cardInfo["BizLicenseOperatingPeriod"]) {
                tCertfDate.value = cardInfo["BizLicenseOperatingPeriod"].split("至");
                setValue(
                    "Applicant.tCertfBgnDate",
                    cardInfo["BizLicenseOperatingPeriod"].split("至")[0]?.replace(/[年|月|]/g, '-').replace(/日/g, '') //证件有效起期
                );
                if (cardInfo["BizLicenseOperatingPeriod"].split("至")[1].includes("长期") || cardInfo["BizLicenseOperatingPeriod"].split("至")[1].includes("期限") || cardInfo["BizLicenseOperatingPeriod"].split("至")[1] === "年月日") { // 证件有效期长期标识
                  setValue("Applicant.cLongendTyp", "1");
                } else {
                  setValue("Applicant.cLongendTyp", "0");
                  setValue(
                      "Applicant.tCertfEndDate",
                      cardInfo["BizLicenseOperatingPeriod"].split("至")[1]?.replace(/[年|月|]/g, '-').replace(/日/g, '') //证件有效止期
                  );
                }
              }
              setValue("Applicant.cCertfCls", "01"); // 证件类型
              setValue("Applicant.cClntMrk", "0"); // 投保人性质
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

function clearValidate(key: string = undefined) {
  applicantEditRef?.value?.clearValidate(key);
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
  applicantEditRef?.value?.addProvide(key, value);
}
function getCodeListMap() {
  return applicantEditRef.value?.getCodeListMap();
}
// 客户重置
function resetFn() {
  const cAppNo = opertaor.getTableRefByKey('plyBase')?.getFromValue()?.['Base.cAppNo'];
  if(!param.cAppNo || !cAppNo) return;
  const params = {
    type: param.pageName === "priceInquiry" ? 'I' : 'A',
    param: param.pageName === "priceInquiry" ? param.cInquiryNo : param.cAppNo,
    entity: 'Applicant'
  }
  reset(params).then(() => {
  }).catch((err:any) => {
    console.log(err)
  })
}
// 查询分公司机构
const isFujianBranch = ref(false);
async function getDptCdeList() {
  const res = await listChrDepts({cDptCde: '0235010000000', cDptCls: '2'})
  if(res.data?.length > 0) {
    const cDptCdeList = res.data.map((item:any) => { return item.cDptCde})
    if(cDptCdeList.includes(param.cDptCde)) {
      isFujianBranch.value = true;
    }
  }
}

function getFormBtn() {
  return applicantEditRef?.value?.getFormBtn();
}
function setDisabledAll(isDisabled: boolean = true) {
  applicantEditRef?.value?.setDisabledAll(isDisabled);
  const formBtn = getFormBtn();
  if(formBtn && Object.keys(formBtn).length > 0) {
    Object.keys(formBtn).forEach((key: any) => {formBtn[key].hidden = isDisabled;})
  }
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
  addProvide,
  getCodeListMap,
  setDisabledAll
});
</script>

<style scoped></style>

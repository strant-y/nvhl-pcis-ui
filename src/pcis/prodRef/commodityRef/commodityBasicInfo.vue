<!-- 商品基本信息 -->
<template>
  <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";
import { saveCommodityBase, getCommodityBase } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();

import { useRoute } from "vue-router";
import { cp } from "fs";
import { eventBus } from '@/utils/event-bus'
import { useUserStore,useProductStore } from "@/store";
// import { useProductStore } from "@/store";
const productStore = useProductStore();


const tabref = opertaor.getTableRefByKey("permissionAllo");

const route = useRoute();
const router = useRouter();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");

const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "商品基本信息",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "保存", 
        func: async () => {
          console.log()
          const s = freeEditRef.value?.getFromValue(); //获取表单数据
          // setFormItem('cCommodityNo',data["data"]['cCommodityNo'])
          // setValue('cCommodityNo',1221)
          console.log('基本信息参数',s)
          saveCommodityBase(s)
            .then((res) => {
              const { code, data, msg } = res;
              if (200 === code) {
                console.log(data["data"],data["data"]['cCommodityNo'])
                                if(data['data']){
                  // setFormItem('cCommodityNo',data["data"]['cCommodityNo'])
                  setValue('cCommodityNo',data["data"]['cCommodityNo'])
                }
               
                // sessionStorage.setItem(
                //   "toMyPageData",
                //   JSON.stringify({
                //     ...{data:s},
                //     ...{ pageType: "app" },
                //     // ...{ dptItem: selectTreeItem.value },
                //   })
                // );
                ElMessage.success("保存成功");
              } else {
                ElMessage.error(msg);
              }
            })
            .finally(() => { });
        },
      }),
      createFreeButtonBase({
        label: "返回",
        func: () => {
          router.push({ path: "/goodsConfig/commodity-main" });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "险种大类",
        rules: [getRules("required", { change: true })],
        typeCode: "KIND_LIST_GRT",
        codeParam: {
          cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        },
        func: (val:any) => {
          // console.log('大类',tabref.getFromValue())
          // 险种大类
          if (!!val) { 
            eventBus.emit('cKindNo-change', val)
            // permissionAllo
            // tabref.getFromValue().cProdNo,


            // console.log('新变更的险类代码为', value);.
            // this.newKindNo.emit(value);


          }

        }
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "险种名称",
        rules: [getRules("required", {})],
        typeCode: "PROD_LIST_GRT",
        codeParam: {
          cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        },
      },
      {
        prop: "cCommodityNo",
        inputtype: "rtinput",
        title: "商品编号",
        disabled: true,
        // rules: [getRules("required", {})],
      },
      {
        prop: "cCommodityCn",
        inputtype: "rtinput",
        title: "商品名称",
        rules: [getRules("required", {})],
      },
      {
        prop: "cPlatformCn",
        inputtype: "rtinput",
        title: "平台名称",
        // rules: [getRules("required", {})],
      },
      {
        prop: "cCriterionTimeUnit",
        inputtype: "rtselect",
        title: "保险期间类型",
        typeCode: "RECEIVE_BANK_CATEGORY",
        codeParam: { cParCde: "CriterionUnit" },
        rules: [getRules("required", {})],
      },
      {
        prop: "nCriterionTime",
        inputtype: "rtinput",
        title: "标准承保期限",
        rules: [getRules("required", {})],
      },
      {
        prop: "cPolicyLimit",
        inputtype: "rtcheckbox",
        title: "产品承保限制",
      },
      {
        prop: "nLowInsureDays",
        inputtype: "rtnumber",
        title: "保险期限浮动区间起",
      },
      {
        prop: "nTopInsureDays",
        inputtype: "rtnumber",
        title: "保险期限浮动区间止",
      },
      {
        prop: "nSurrenderHour",
        inputtype: "rtnumber",
        title: "起保后可退保小时数",
      },
      {
        prop: "nDpdDays",
        inputtype: "rtnumber",
        title: "倒签单天数",
      },

      {
        prop: "cNeedfeeFlag",
        inputtype: "rtselect",
        title: " 是否见费出单",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "yes_no" },
        rules: [getRules("required", {})],


      },
      {
        prop: "cAutoUdr",
        inputtype: "rtselect",
        title: " 是否自动核保",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "yes_no" },
      },
      {
        prop: "cImmeffMrk",
        inputtype: "rtselect",
        title: " 是否实时出单",
        typeCode: "BAS_COMM_CODE_OUT_CDE",
        codeParam: { cParCde: "CImmeffMrk" },
        rules: [getRules("required", {})],
        // code: 'BAS_COMM_CODE_OUT_CDE',
        // param: {'cParCde': 'CImmeffMrk'},
      },
      {
        prop: "cMailMrk",
        inputtype: "rtselect",
        title: " 是否发送邮件",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "yes_no" },
      },
      {
        prop: "cPdfStyle",
        inputtype: "rtselect",
        title: " PDF电子保单样式",
        typeCode: "BAS_COMM_CODE_OUT_CDE",
        codeParam: { cParCde: "PdfStyle", cRemark: "" },
      },
      {
        prop: "nOnsaleRate",
        inputtype: "rtnumber",
        title: " 打折手续费系数",
        precision: 2,
        max: 999999.99,
        min: 0,
      },
      {
        prop: "cPayType",
        inputtype: "rtselect",
        title: "  支付方式",
        typeCode: "BAS_COMM_CODE_OUT_CDE",
        codeParam: { cParCde: "PayType" },
      },
      {
        prop: "cFeeTypeCde",
        inputtype: "rtselect",
        title: "  费用类型",
        typeCode: "BAS_COMM_CODE_OUT_CDE",
        codeParam: { cParCde: "FeeTypeCde" },
      },
      {
        prop: "nSentAcount",
        inputtype: "rtnumber",
        title: "合单上送笔数",
        max: 999999,
        min: 0,
      },
      {
        prop: "cMessageMrk",
        inputtype: "rtselect",
        title: "  是否发送短信",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "yes_no" },
        rules: [getRules("required", {})],
      },
      {
        prop: "cGrpCompany",
        inputtype: "rtinput",
        title: "  团单单位名称",
      },

      {
        prop: "cBankInfoId",
        inputtype: "rtselect",
        title: " 银行信息",
        loadData: [
          { value: "38", label: "38|去哪儿" },
          { value: "1480", label: "1480|去哪儿北京分公司" },
          { value: "281", label: "281|同程" },
          { value: "37", label: "37|同程" },
        ],
      },
      {
        prop: "cPrjCtgTyp",
        inputtype: "rtselect",
        title: " 项目大类",
        typeCode: "CPrjCtgTyp_List",
        codeParam: {
          CRangeCde: user.value.companyId,
          // cParCde: "-1", 
          cLev: "1"
        },
        func: (val: any) => {
          console.log('大类选择', val)
          if (val) {
            setFormItem('cPrjCtgMidTyp', {

              // typeCode: 'CPrjCtgTyp_List',
              // codeParam: { cParCde: "-1", cLev: "2" } ,
              typeCode: "CPrjCtgTyp_List",
              codeParam: {
                CRangeCde: user.value.companyId,
                cLev: "2",
                CParCde: val,
              },
            })
          }
        }
      },
      {
        prop: "cPerFlag",
        inputtype: "rtinput",
        title: " 项目大类内容",
      },
      {
        prop: "cPrjCtgMidTyp",
        inputtype: "rtselect",
        title: " 项目中类",
        // typeCode: "CPrjCtgTyp_List",
        // codeParam: { cParCde: "-1", cLev: "2" },
        func: (val: any) => {
          console.log('中类选择', val)
          if (val) {
            setFormItem('cPrjCtgSubTyp', {
              typeCode: 'CPrjCtgTyp_List',
              codeParam: {
                CRangeCde: user.value.companyId,
                cLev: "3",
                CParCde: val,
              },
            })
          }
        }
      },
      {
        prop: "cPrjCtgMidContent",
        inputtype: "rtinput",
        title: " 项目中类内容",
      },
      {
        prop: "cPrjCtgSubTyp",
        inputtype: "rtselect",
        title: " 项目小类",
        // typeCode: "CPrjCtgTyp_List",
        // codeParam: { cParCde: "-1", cLev: "3" },
      },
      {
        prop: "cPrjCtgSubContent",
        inputtype: "rtinput",
        title: " 项目小类内容",
      },
      {
        prop: "cIsTicket",
        inputtype: "rtselect",
        title: " 是否开具电子发票",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "isInvoice" },
        rules: [getRules("required", {})],
        // loadData: [
        //   {
        //     label: "是",
        //     value: "1",
        //   },
        //   {
        //     label: "否",
        //     value: "2",
        //   },
        // ],
      },
      {
        prop: "cCancelMrk",
        inputtype: "rtselect",
        title: "实时起保，是否可当日撤单",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "yes_no" },
      },
      {
        prop: "cIsInternet",
        inputtype: "rtselect",
        title: " 是否互联网业务",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "yes_no" },
        rules: [getRules("required", {})],
      },
      {
        prop: "cInternetShowName",
        inputtype: "rtinput",
        title: " 互联网销售平台备案名称",
      },
      {
        prop: "tBgnTm",
        inputtype: "rtdatepicker",
        title: "启用日期",
        rules: [getRules("required", {})],
      },
      {
        prop: "tEndTm",
        inputtype: "rtdatepicker",
        title: "失效日期",
        rules: [getRules("required", {})],
      },
      {
        prop: "cAffiliatedMrk",
        inputtype: "rtselect",
        title: "是否关联附属信息",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "yes_no" },
        defaultValue: '0',
        func:(val:any)=>{
          console.log("关联信息",val);
          productStore.setcAffiliatedMrk(val)
          // if(val ==='1'){
            
          // }
        }
      },
      {
        prop: "cCiMrk",
        inputtype: "rtselect",
        title: "联共保业务",
        typeCode: 'Joint_Insurance_Business',
        // loadData: [
        //                 {value: '0', label: '非共保业务'},
        //                 {value: '1', label: '外部共保我方主共_主联'},
        //                 {value: '2', label: '外部共保我方从共_主联'},
        //                 {value: '3', label: '外部共保我方主共_无联保'},
        //                 {value: '4', label: '外部共保我方从共_无联保'},
        //                 {value: '5', label: '司内联保_主联'}
        //             ],
        // defaultValue: '0'
      },
      {
        prop: "cBeginDateType",
        inputtype: "rtselect",
        title: "保险起期类型",
        loadData: [
          { value: '1', label: '默认日期类型' },
          { value: '2', label: '指定日期类型' },
          { value: '3', label: 'T+N日期类型' },
          { value: '4', label: '即时生效类型' },
          { value: '5', label: 'T+N小时类型' }
        ],
        rules: [getRules("required", {})],
      },
      {
        prop: "cIsPlanRule",
        inputtype: "rtselect",
        title: "是否取方案份数配置",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "yes_no" },
      },
      {
        prop: "cSpePlatTyp",
        inputtype: "rtinput",
        title: " 二级渠道来源",
      },
      {
        prop: "cIsAutoVerification",
        inputtype: "rtinput",
        title: " 是否自动核销",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "yes_no" },
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);


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
/**
 * 获取商品详情
 */
function handleQuery() {
  console.log("param", sessionStorage.getItem("user"));
  const newparam = { cCommodityNo: param.cCommodityNo };
  getCommodityBase(newparam)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        freeEditRef?.value?.setFormValue(data.data);
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => { });
}
function setDisa() {
  // formconfig1.fromSchema?.forEach((e) => {
  //   if (e.prop === "cProdNo" || e.prop === "cKindNo") {
  //     e.disabled = true;
  //   }
  // });
}

onMounted(() => {
  console.log("当前登录用户信息", sessionStorage.getItem("user"));
  const user = JSON.parse(sessionStorage.getItem("user")).opCde;
  console.log("当前登录用户信息546546456", user);
  if (param.editType === "edit") {
    handleQuery();
    // setDisa();
  }
});

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>

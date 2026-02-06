<template>
  <div>
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="edrbaseEditRef" />
  </div>
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { useValidator } from "@/typings/useValidator";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { NewUdrListService } from "@/views/pcis-new-udr-list/service/new-udr-list.service";
import { PcisQueryService } from "@/views/payinfoManagement/service/pcis-query-service";
import { codeListViewStore } from "@/store";
import dayjs from "dayjs";
import { debug } from "console";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
import { qryTerminationDataList, qryProdRuleList, queryLatestMrk, checkPlyChange } from "@/api/prod";
import Decimal from "decimal.js";

const pcisQueryService = new PcisQueryService();
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const { getRules } = useValidator();
const props = defineProps({
  // param: {
  //   type: [Object],
  // },
});
const params=opertaor.getParam();
const { getCUndrMrk, getBackClsList } = NewUdrListService();
const edrbaseEditRef = ref<AppFreeEditMethod | null>(null);
const user = JSON.parse(sessionStorage.getItem("user") || '{}');
const rebackDay = ref(0);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "批改信息",
    endBtnsPosition: "right",
    fromSchema: [
      
      {
        prop: "EdrBase.nSurrRate",
        inputtype: "rtnumber",
        title: "手续费比例",
        clearable: true,
        hidden: params["cEdrType"] ==='1',
        func: (v:any) => {
          if(v){
            if(v<0 || v>1){
              ElMessage.warning("批改信息的手续费比例 必须为0~1.0之间!")
              setValue('EdrBase.nSurrRate',0)
            }
          }
        },
      },
      {
        prop: "EdrBase.cRatioTyp",
        inputtype: "rtselect",
        title: "短期费率类型",
        // loadData: [
        //     {value: '1', label: '按月'},
        //     {value: '2', label: '按日'},
        //     {value: '3', label: '不计'},
        // ],
        // typeCode: "CRATIO_TYPE_CACHE",
        rules: [getRules("required", {})],
        clearable: true,
        defaultValue: "2",
        disabled: shouldDisableRatioTyp(params),
        func: (v) => {},
        hidden: params["cRsnCde"] === "c1" || params["cRsnCde"] === "s1"
      },
      {
        prop: "EdrBase.cDptCde",
        inputtype: "rtselect",
        title: "机构部门",
        loadData: [],
        rules: [getRules("required", {})],
        itemWidth: 1,
        valueSpan: 10,
        clearable: true,
        disabled:true
      },
     {
        prop: "EdrBase.cProdNo",
        inputtype: "rtselect",
        title: "产品",
        typeCode: "PROD_LIST_IN_GUIDE",
        clearable: true,
        disabled:true
     },
      {
        prop: "EdrBase.cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        disabled:true,
        func: (val:any) => {
          if(val?.length === 23) {// 历史数据补全的保单号是23位
            setFormItem("EdrBase.cRatioTyp", { 
              loadData: [
                { label: "按月", value: "1" },
                { label: "按日", value: "2" },
                { label: "不计", value: "3" },
              ],
            });
          } else {
            setFormItem("EdrBase.cRatioTyp", {
              typeCode: "CRATIO_TYPE_CACHE",
            })
          }
        }
      },
      {
        prop: "EdrBase.cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
        disabled:true
      },
      {
        prop: "EdrBase.cEdrNo",
        inputtype: "rtinput",
        title: "批单号",
        disabled:true
      },
      {
        prop: "EdrBase.nBefEdrAmt",
        inputtype: "rtinput",
        title: "原保额",
        disabled:true,
        // suffix: "元"
      },
      {
        prop: "EdrBase.nAmt",
        inputtype: "rtinput",
        title: "现保额",
        disabled:true,
        // suffix: "元"
      },
      {
        prop: "EdrBase.nAmtVar",
        inputtype: "rtinput",
        min:-999999999999,
        title: "保额变化",
        disabled:true,
        // suffix: "元"
      },
      {
        prop: "EdrBase.nBefEdrPrm",
        inputtype: "rtinput",
        title: "原保费",
        disabled:true,
        // suffix: "元"
      },
      {
        prop: "EdrBase.nPrm",
        inputtype: "rtinput",
        title: "现保费",
        disabled:true,
        // suffix: "元"
      },
      {
        prop: "EdrBase.nPrmVar",
        inputtype: "rtinput",
        min:-999999999999,
        title: "保费变化",
        disabled:true,
        // suffix: "元"
      },
      {
        // prop: "EdrBase.tNextEdrUdrTm",
        prop: "EdrBase.tEdrAppTm",
        inputtype: "rtdatepicker",
        format:"YYYY-MM-DD HH:mm:ss",
        type :"datetime",
        title: "批改申请日期",
        disabled:true
      },
      {
        // prop: "EdrBase.tNextEdrBgnTm",
        prop: "EdrBase.tEdrBgnTm",
        inputtype: "rtdatepicker",
        format:"YYYY-MM-DD HH:mm:ss",
        type :"datetime",
        title: "批单生效起期",
        func: async (v:any) => {
          if(v && !params.initFlag){
            const cPlyNo = edrbaseEditRef.value?.getValue("EdrBase.cPlyNo");
            if(opertaor.isEditScene()){
              // 查询配置的倒签天数
              rebackDay.value = 0;
              const param = {
                cDptCde: params.cDptCde,
                cRuleCde: 'RULE_01',
                cPrd: null,
                cProdNo: params.cProdNo,
              }
              const nDpdDays:any = await qryProdRuleList(param);
              if(nDpdDays.code === 200) {
                if(nDpdDays.data?.code == '1') {
                  if(nDpdDays.data?.result && nDpdDays.data?.result[0]?.cRuleValue) {
                    const cRuleValue = nDpdDays.data?.result[0]?.cRuleValue || 0;
                    rebackDay.value = cRuleValue > 0 ? cRuleValue : 0;
                  }
                } else {
                  ElMessage.error(nDpdDays.data?.message)
                  return;
                }
              } else {
                ElMessage.error(nDpdDays.msg)
                return;
              }
              const tEdrBgnTm = dayjs().add(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss');//批单生效起期默认为明天0点
              const newTEdrBgnTm = dayjs(tEdrBgnTm).subtract(rebackDay.value, 'day').format('YYYY-MM-DD HH:mm:ss');// 根据倒签天数算出可选择的最早的日期
              
              // 获取保单最新的保险起期和止期
              const plyInfo:any = await queryLatestMrk({ cPlyNo: cPlyNo });
              if(!plyInfo.data?.['tInsrncBgnTm'] || !plyInfo.data?.['tInsrncEndTm']) {
                edrbaseEditRef.value?.setValue("EdrBase.tEdrBgnTm", tEdrBgnTm);
                ElMessage.error(plyInfo.msg)
                return
              }
              const latestEdrBgnTm = dayjs(plyInfo.data?.['tInsrncBgnTm']).format('YYYY-MM-DD HH:mm:ss');
              const latestEdrEndTm = dayjs(plyInfo.data?.['tInsrncEndTm']).format('YYYY-MM-DD HH:mm:ss');
              if(dayjs(v).isBefore(dayjs(latestEdrBgnTm))) {
                ElMessage.warning('批改生效日期不能早于保险起期'+latestEdrBgnTm)
                edrbaseEditRef.value?.setValue("EdrBase.tEdrBgnTm", tEdrBgnTm);
                return;
              } else if(dayjs(v).isAfter(dayjs(latestEdrEndTm))) {
                ElMessage.warning('批改生效日期不能晚于保险止期'+latestEdrEndTm)
                edrbaseEditRef.value?.setValue("EdrBase.tEdrBgnTm", tEdrBgnTm);
                return;
              } else {
                if(params.cRsnCde == "s2") {// 一般退保 查看数据开关是否打开
                  const res:any = await qryTerminationDataList({ cAppNo: params.cAppNo, cOperType: 'SurBck' })
                  if(res?.code == 200 && res.data?.length > 0) {
                    if(res.data[0]?.cAppTyp === 'on') {
                      // 开关打开 不校验倒签天数
                      return;
                    }
                  }
                }
                if(dayjs(v).isBefore(dayjs(newTEdrBgnTm))) {
                  if(rebackDay.value > 0) {
                    ElMessage.warning("可倒签天数为"+rebackDay.value+"天,可倒签日期为"+newTEdrBgnTm)
                  } else {
                    ElMessage.warning("不允许倒签！")
                  }
                  edrbaseEditRef.value?.setValue("EdrBase.tEdrBgnTm", tEdrBgnTm);
                  return;
                }
              }
            }
          }
        },
        // rules: [getRules("required", {})],
        // disabled: params["cEdrType"]=='2'
      },
      {
        prop: "EdrBase.nRefundPrm",
        inputtype: "rtinput",
        title: "退保费",
        disabled: true,
        hidden: params.cRsnCde != "s1" && params.cRsnCde != "s2" ,
        rules: [getRules("required", {})],
        func: (val:any) => {
          const nBefEdrPrm = getValue('EdrBase.nBefEdrPrm')?.replaceAll(',','');
          if(new Decimal(val).gt(new Decimal(nBefEdrPrm))) {
            ElMessage.warning('退保费不能大于原保费！')
            setValue("EdrBase.nRefundPrm", nBefEdrPrm)
          } else if(params.cRsnCde == "s2" && !params.initFlag){
            setValue("EdrBase.nPrmVar", new Decimal(0).sub(new Decimal(val)))
            setValue("EdrBase.nPrm", new Decimal(nBefEdrPrm).add(new Decimal(getValue('EdrBase.nPrmVar'))))
            opertaor.getTableRefByKey('base').setValue('Base.nPrm',new Decimal(nBefEdrPrm).add(new Decimal(getValue('EdrBase.nPrmVar'))))
            opertaor.getTableRefByKey('base').setValue('Base.nPrmVar',new Decimal(0).sub(new Decimal(val)))
            nextTick(() => {
              opertaor.getFatherPage().afterCalcSurrenEdr()
            })
          }
        }
      },
      {
        prop: "EdrBase.nDelayNum",
        inputtype: "rtinput",
        title: "延长天数",
        disabled: true,
        // hidden:false ,
        hidden: params.cRsnCde != "FZ" && params.cRsnCde != "M1" ,
      },
      {
        prop: "EdrBase.tRepStopExtBgnTm",
        inputtype: "rtdatepicker",
        type: "datetime",
        title: "报停起期",
        rules: [getRules("required", {})],
        clearable: true,
        hidden: params.cRsnCde != "46",
        // disabledDate: (time: Date) => {
        //   const tInsrncBgnTm = params.tInsrncBgnTm;
        //   return time.getTime() < new Date(tInsrncBgnTm).getTime()
        // },
        format:"YYYY-MM-DD 00:00:00",
        valueFormat:"YYYY-MM-DD 00:00:00",
        func: (v) => {
          const tRepStopExtEndTm = getValue("EdrBase.tRepStopExtEndTm")
          const tInsrncBgnTm = opertaor.getTableRefByKey('insrnc')?.getValue('Base.tInsrncBgnTm')
          const tInsrncEndTm = opertaor.getTableRefByKey('insrnc')?.getValue('Base.tInsrncEndTm')
          if(v && tRepStopExtEndTm && new Date(v).getTime() > new Date(tRepStopExtEndTm).getTime()) {
            ElMessage.warning("报停起期不能晚于报停止期")
            setValue("EdrBase.tRepStopExtBgnTm", null)
          } else if(dayjs(v).isBefore(dayjs(tInsrncBgnTm)) || dayjs(v).isAfter(dayjs(tInsrncEndTm))) {
            ElMessage.warning("报停起期应该在保险起止期范围内")
            setValue("EdrBase.tRepStopExtBgnTm", null)
          } else if(v && tRepStopExtEndTm && lastInsrncEndTm.value) {
            // 根据报停起期和止期计算相差天数，然后延长保险止期相应天数
            getInsrncEndTm(v,tRepStopExtEndTm,tInsrncBgnTm,tInsrncEndTm)
          }
        },
      },
      {
        prop: "EdrBase.tRepStopExtEndTm",
        inputtype: "rtdatepicker",
        type: "datetime",
        title: "报停止期",
        rules: [getRules("required", {})],
        clearable: true,
        hidden: params.cRsnCde != "46",
        // disabledDate: (time: Date) => {
        //   const tInsrncEndTm = params.tInsrncEndTm;
        //   return time.getTime() > new Date(tInsrncEndTm).getTime()
        // },
        format:"YYYY-MM-DD 23:59:59",
        valueFormat:"YYYY-MM-DD 23:59:59",
        func: (v) => {
          const tRepStopExtBgnTm = getValue("EdrBase.tRepStopExtBgnTm")
          const tInsrncBgnTm = opertaor.getTableRefByKey('insrnc')?.getValue('Base.tInsrncBgnTm')
          const tInsrncEndTm = opertaor.getTableRefByKey('insrnc')?.getValue('Base.tInsrncEndTm')
          if(v && tRepStopExtBgnTm && new Date(v).getTime() < new Date(tRepStopExtBgnTm).getTime()) {
            ElMessage.warning("报停止期不能早于报停起期")
            setValue("EdrBase.tRepStopExtEndTm", null)
          } else if(dayjs(v).isBefore(dayjs(tInsrncBgnTm)) || dayjs(v).isAfter(dayjs(tInsrncEndTm))) {
            // ElMessage.warning("报停止期应该在保险起止期范围内")
            // setValue("EdrBase.tRepStopExtEndTm", null)
          } else if(v && tRepStopExtBgnTm && lastInsrncEndTm.value) {
            // 根据报停起期和止期计算相差天数，然后延长保险止期相应天数
            getInsrncEndTm(tRepStopExtBgnTm,v,tInsrncBgnTm,tInsrncEndTm)
          }
        },
      },
      {
        prop: "EdrBase.cAppPrsnNme",
        inputtype: "rtinput",
        title: "申请人",
      },
      {
        prop: "EdrBase.cEdrMrk",
        inputtype: "rtselect",
        title: "申请类型",
        loadData: [
          { value: "3", label: "客户申请" },
          { value: "4", label: "内部批改" },
          // { value: "6", label: "客户提供错误信息" },
          { value: "9", label: "其他" },
        ],
        rules: [getRules("required", {})],
        clearable: true,
        func: (v) => {},
      },
      {
        prop: "EdrBase.cEdrRsnBundleCde",
        inputtype: "rtselect",
        title: "批改原因",
        typeCode: "EDR_RSN_LIST_NEW",
        codeParam: {kindNo:params["cProdNo"]?.slice(0, 2), prodNo: params["cProdNo"] ,rsnTyp: params["cEdrType"],isGrp:params["cGrpMrk"] === "1" ? "1" : null,isPer: params["CGrpMrk"] === "1" ? "1" : null,calcMrk:params["cGrpMrk"]},
        rules: [getRules("required", {})],
        clearable: true,
        disabled: true,
        func: (v) => {
          if(v === '99'){
            // 如果批改原因是99时,则直接修改自己的下拉选显示具体内容
            setFormItem("EdrBase.cEdrRsnBundleCde", { typeCode:null,loadData: [{ value: "99", label: "历史数据补全" }] });
            setFormItem("EdrBase.cEdrRsnDetail", { loadData: [{value:'99',label:'历史数据补全'}] });
            setValue("EdrBase.cEdrRsnDetail", ['99']);
          }
        },
      },

      //  {
      //   prop: "EdrBase.NResvNum3",
      //   inputtype: "rtinput",
      //   title: "已延期天数",
      //    disabled:true,
      // },


      {
        prop: "EdrBase.cEdrRsnDetail",
        inputtype: "rtcheckboxgroup",
        title: "批改原因详细",
        itemWidth: 2,
        expand: true,
        disabled: true,
        // loadData: [
        // { label: "投保单", value: "cAppNo" },
        // { label: "保单", value: "cPlyNo" },
        // { label: "批单", value: "cEdrNo" },
        // { label: "批改序号", value: "c" },
        // { label: "机构", value: "cDptCnm" },
        // { label: "二级分公司", value: "cSecondDptCnm" },
        // { label: "产品", value: "cProdNmeCn" },
        // { label: "条款", value: "cTermNme" },
        // { label: "核保人", value: "cUdrNme" },
        // { label: "核保通过日期", value: "tUdrTm" },
        // { label: "状态", value: "cAppStatus" },
        // { label: "项目大类", value: "k" },
        // { label: "项目中类", value: "l" },
        // { label: "项目子类", value: "m" },
        // { label: "询价单号", value: "n" },
        // ],
      },
      {
        prop: "EdrBase.edrFormula",
        inputtype: "rtinput",
        type: "textarea",
        title: "批改公式",
        readonly: true,
        rows: 2,
        itemWidth: 2,
      },
      {
        prop: "EdrBase.cEdrCtnt",
        inputtype: "rtinput",
        type: "textarea",
        title: "批文",
        rows: 8,
        itemWidth: 2,
        rules: [getRules("maxLength", {len:5000})],
      },
      {
          prop: "EdrBase.cEdrType",
          inputtype: "rtinput",
          hidden:true,
      },
      {
          prop: "EdrBase.cacheKey",
          inputtype: "rtinput",
          hidden:true,
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);

// 判断是否应该禁用短期费率类型下拉框
function shouldDisableRatioTyp(params: any) {
  // 指定产品编码列表
  const specialProducts = [
    "040016", "059014", "059015", "070002", "043021", 
    "120008", "059018", "059017", "059016", "043020",
    "049019", "049020"
  ];
  
  // 判断当前产品是否在指定列表中且是批改场景
  return specialProducts.includes(params.cProdNo);
}

function getFromValue() {
  return edrbaseEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  const val = {
    ...value,
    "EdrBase.nBefEdrAmt": value["EdrBase.nBefEdrAmt"]?.toLocaleString(),
    "EdrBase.nAmt": value["EdrBase.nAmt"]?.toLocaleString(),
    "EdrBase.nAmtVar": value["EdrBase.nAmtVar"]?.toLocaleString(),
    "EdrBase.nBefEdrPrm": value["EdrBase.nBefEdrPrm"]?.toLocaleString(),
    "EdrBase.nPrm": value["EdrBase.nPrm"]?.toLocaleString(),
    "EdrBase.nPrmVar": value["EdrBase.nPrmVar"]?.toLocaleString(),
  }
  edrbaseEditRef?.value?.setFormValue(val);
}

function validate() {
  return edrbaseEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  if(key === "EdrBase.nBefEdrAmt" ||
    key === "EdrBase.nAmt" || 
    key === "EdrBase.nAmtVar" || 
    key === "EdrBase.nBefEdrPrm" || 
    key === "EdrBase.nPrm" || 
    key === "EdrBase.nPrmVar"
  ) {
    edrbaseEditRef?.value?.setValue(key, value.toLocaleString());
  } else {
    edrbaseEditRef?.value?.setValue(key, value);
  }
}

function getValue(key: string) {
  return edrbaseEditRef?.value?.getValue(key);
}
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
onMounted(() => {
  nextTick(() => {
    // 非涉费批改批改公式文本框隐藏
    if(params.cRsnCde === "FZ") {
      setFormItem("EdrBase.edrFormula", { hidden: true })
    }
    if(params.cRsnCde === "47") {
      setFormItem("EdrBase.edrFormula", { disabled: true })
    }
    setFormItem("EdrBase.cDptCde", {
        loadData: [
            { value: params.cDptCde, label: `${params.cDptCde} ${params.cDptCnm}` },
        ],
    });
    if(params["cEdrType"]!='1'){
        if(params["cEdrType"]=='3'){
            setFormItem("EdrBase.cEdrRsnDetail", { loadData: [{value:'s1',label:'全单退保'},{value:'s2',label:'一般退保'}] });
        }else if(params["cEdrType"]=='2'){
            setFormItem("EdrBase.cEdrRsnDetail", { loadData: [{value:'c1',label:'全单注销'}] });
        }
        setFormItem("EdrBase.cEdrRsnBundleCde", {typeCode:'', codeParam:'',loadData: [{value:'s1',label:'全单退保'},{value:'s2',label:'一般退保'},{value:'c1',label:'全单注销'}] });
    }else{
      if(params['cRsnCde'] !== "FZ") {
        const param = {
          rsnTyp: "1",
          kindNo: params["cProdNo"]?.slice(0,2),
          prodNo: params["cProdNo"],
          cTransMrk: params["cTransMrk"] || null
        }
        codeListStore
          .queryCodeList({
            codeListName: "EDR_RSN_LIST_NEW",
            codeListParam: param,
          })
          .then((res) => {
            setFormItem("EdrBase.cEdrRsnDetail", { loadData: res.filter((item:any) => item.value !== "FZ") });
          });
      } else if(params['cRsnCde'] !== '99'){
        const isGrp = params["cGrpMrk"] === "1" ? "1" : null;
        const isPer = params["CGrpMrk"] === "1" ? "1" : null;
        const param = {
            prodNo: params["cProdNo"],
            rsnTyp: params["cEdrType"],
            isGrp: isGrp,
            isPer: isPer,
            ZH: "ZH",
            FZ: "FZ",
        };
        if(params.cRsnCde=='FZ'){
            param["calcMrk"] = '0'
        }else{
          param["calcMrk"] = '1'
        }
        codeListStore
          .queryCodeList({
              codeListName: "EDR_RSN_LIST_FZ",
              codeListParam: param,
          })
          .then((res) => {
              setFormItem("EdrBase.cEdrRsnDetail", { loadData: res });
          });
      }
    }
    // // 批改申请日期
    // if(!getValue("EdrBase.tNextEdrUdrTm")) {
    //   setValue("EdrBase.tNextEdrUdrTm", dayjs().format("YYYY-MM-DD HH:mm:ss"))
    // }
    // // 批单生效起期
    // if(!getValue("EdrBase.tNextEdrBgnTm")) {
    //   setValue("EdrBase.tNextEdrBgnTm", dayjs().add(1,"day").format("YYYY-MM-DD 00:00:00"))
    // }
    if(params.cRsnCde === '46') {
      const getPlyNoInterval = setInterval(async ()=>{
        const cPlyNo = edrbaseEditRef.value?.getValue("EdrBase.cPlyNo");
        if(cPlyNo) {
          clearInterval(getPlyNoInterval)
          await getLastInsrncEndTm(cPlyNo)
        }
      },500)
    }
    
    // 根据数据控制开关设置条款中的可编辑项
    if(params.pageType === 'TEMPORARY_DEPOSIT' && params.cEdrType && params.cRsnCde === 's2') {
      qryTerminationDataList({ cAppNo: params.cAppNo, cOperType: 'SurPrm' }).then((res:any) => {
        if(res?.code == 200 && res.data?.length > 0) {
          if(res.data[0]?.cAppTyp === 'on') {
            setFormItem("EdrBase.nRefundPrm",{ disabled: false })
          }
        }
      })
    }
  });
});

const lastInsrncEndTm = ref('');
// 获取保单的保险止期
async function getLastInsrncEndTm (cPlyNo:any) {
  await pcisQueryService.getLastInsrncEndTm({cPlyNo: cPlyNo}).then((res:any) => {
    if(res.code == 200 && res.data) {
      lastInsrncEndTm.value = res.data
    } else {
      ElMessage.error(res.msg)
    }
  }).catch(err => {
    ElMessage.error(err.msg)
  })
}

function getInsrncEndTm(tRepStopExtBgnTm:any,tRepStopExtEndTm:any,tInsrncBgnTm:any,tInsrncEndTm:any) {
  const param = {
    CEdrRsnBundleCde: params["cRsnCde"],//批改原因
    tRepstopextBgnTm: tRepStopExtBgnTm,//报停起期
    tRepStopExtEndTm: tRepStopExtEndTm,//报停止期
    cPlyNo: params["cPlyNo"] || edrbaseEditRef.value?.getValue("EdrBase.cPlyNo"),//保单号
    tEdrBgnTm: getValue('EdrBase.tEdrBgnTm'),//批单生效起期
    tInsrncBgnTm: tInsrncBgnTm,//保险起期
    tInsrncEndTm: tInsrncEndTm,//保险止期
  }
  checkPlyChange(param).then((res:any) => {
    if(res.code === 200 && res.res?.tInsrncEndTm) {
      opertaor.getTableRefByKey('insrnc')?.setValue('Base.tInsrncEndTm', res.res?.tInsrncEndTm)
      nextTick(() => {
        opertaor.getTableRefByKey('insrnc')?.setValue('Base.cTmSysCde', res.res?.cTmSysCde)
      })
    } else {
      ElMessage.error(res.msg)
    }
  }).catch((err:any) => {
    ElMessage.error(err.msg)
  })
}

function getFormconfig() {
  return formconfig1;
}
function addProvide<T>(key: InjectionKey<T> | string, value: T)  {
  edrbaseEditRef?.value?.addProvide(key, value);
}
defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig,
  addProvide
});
</script>

<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="baseEditRef" />
  <comDialog ref="dialogRef"></comDialog>
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { codeListViewStore } from "@/store";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { formatDate } from "@/utils/date";
import { policyRatio } from "@/api/query";
import { useRoute } from "vue-router";
const route = useRoute();
import dayjs from "dayjs";
import { eventBus } from '@/utils/event-bus'
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
import { useValidator } from "@/typings/useValidator";
import {
  baseFormatKeys, CommonGroupId,
  CompositePageView,
  CustomStructure, GroupForm, joinFormDataByProdNo,
  peelFormDataByProdNo
} from "@/views/pcis/support/composite.types";
import {ref} from "vue";
const { getRules } = useValidator();
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const pageView = inject("pageView", ref(new CompositePageView()));
const opertaor = dataOpertaor(idxParam.opertaorProps);
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const dialogRef = ref<DialogMethod | null>(null);
const params = opertaor.getParam();
const param: any = route.params.param;
const props = defineProps({
  pageSchemaList: {
    type: [Object],
    required: true,
  },
  compKey: {
    type: String,
    required: false,
  },
});

const baseEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive(createAppFreeEditConfig({}));
const sessionData = ref();
const fixSpecData = ref([]); //存储已选择的特别约定数据
const structure = new CustomStructure()
// 需要分组的key
onMounted(async () => {
  const {pageSchema} = structure.diffGroupBuild(props.pageSchemaList[0].pageSchema, param.cProdDtlList, baseFormatKeys)
  const formconfig11 = formInit(
    JSON.stringify(pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
  
  if (sessionStorage.getItem("toMyPageData")) {
    sessionData.value = JSON.parse(sessionStorage.getItem("toMyPageData"));
  }
  setValue("Base.nAmtRmbExch", "1.000000");
  setValue("Base.nPrmRmbExch", "1.000000");
  setValue("Base.cCumulativeLimitManual", "0");
  setFormValue({
    "Base.nAmtRmbExch": "1.000000",
    "Base.nPrmRmbExch": "1.000000",
    "Base.cCumulativeLimitManual": "0"
  })
  // 隐藏短期费率类型
  setFormItem("Base.cRatioTyp", { 
    hidden: true
  });

   // 短期费率类型,以下产品只支持按日的短期费率类型
  const disabledProducts = [
    "040016", "059014", "059015", "070002", "043021", 
    "120008", "059018", "059017", "059016", "043020",
    "049019", "049020"
  ];
  
  const isDisabled = disabledProducts.includes(params.cProdNo);
  setFormItem("Base.cRatioTyp", { 
    disabled: isDisabled
  });
  if(params?.cRecordType === 9 || params.cPolicySource == 9){
    setFormItem('Base.cRatioTyp',{hidden:true})
    setFormItem('Base.nRatioCoef',{hidden:true})
  }
  nextTick(() => {
    setDisabledAll(true)
    setFormItem("Base.cFinTyp", {
      disabled: false
    });
  })
});


// 获取我司比例
const getOwnShare =()=>{
   let ownShare = 0;
   const data = opertaor.getDataAll();
   let ciArr = data['ci']
  //  const cCiMrk = data.plyBase?.['Base.cCiMrk'];
  if(ciArr && ciArr.length>0){
    ciArr.forEach((item:any)=>{
      const CDptMrk = item['Ci.cCoinsurerCde']
      if(!!CDptMrk && CDptMrk ==="327001"){
        ownShare  += Number(item['Ci.nCiShare'])
      } 
   })
  }
  return ownShare;
}


// 拆分事件
const nPayNumberFun = ()=>{
  if (param.cCombinationType === '2') {
    return ;
  }
  const tabref = opertaor.getTableRefs();
  const baseBefore = tabref["base"].getFromValue();
  const baseData = opertaor.getDataAll()['base']['needCalc'];
  pageView.value.linkedOperation([CommonGroupId, 'group-060030']).executeFirst((operator: any, group: GroupForm) => {
    const payinfoRef = operator.getTableRefByKey("payinfo").getFromValue();
    console.log('opertaor',baseData,opertaor.getDataAll(),baseBefore)
    if (!baseData && payinfoRef.length <1) {
      ElMessage.error("请先进行保费计算!");
      return false
    }
    if (Number(getValue("Base.nPayNum"))>12) {
      ElMessage.warning("拆分最多为12期！");
      return false
    }
    if(getValue("Base.nPayNum")!=''){

      // 多期情况 添加特约信息
      if(getValue('Base.cInstMrk') =='5')eventBus.emit('add-special');

      const data = opertaor.getDataAll();

      let nCiShare = Number(getOwnShare()) || 1 ;
      const totalAmount = Number(data['base']['Base.nPrm']);
      const splitCount =Number(data.base?.['Base.nPayNum'])

      const totalCent = Math.round(totalAmount * 100);
      const result = ref<number[]>([]);
      const quotient = Math.floor(totalCent / splitCount) ;
      const remainder = totalCent % splitCount;
      result.value = Array(splitCount).fill(quotient);
      if (remainder > 0) {
        result.value[splitCount-1] += remainder;
      }
      result.value = result.value.map(cent => parseFloat((cent / 100 ).toFixed(8)));
      let val= {}
      let valArr=[]
      let BgnTmDate = new Date(opertaor.getTableRefs()["insrnc"].getValue("Base.tAppTm"));
      let endTmDate = new Date(opertaor.getTableRefs()["insrnc"].getValue("Base.tInsrncBgnTm"));
      // 2. 兜底处理：如果初始结束时间早于开始时间，将其修正为“开始时间 + 3天”
      if (endTmDate < BgnTmDate) {
          endTmDate = new Date(BgnTmDate.getTime() + 3 * 24 * 60 * 60 * 1000);
      }

      let lastEndDate = null; // 专门用来记录上一期的结束时间
      for (let i = 0; i < Number(getValue("Base.nPayNum")); i++) {
        let startDate, endDate;
        if (i === 0) {
            // 第一期：使用原始的开始时间
            startDate = new Date(BgnTmDate);
            // 第一期的结束时间减1秒
            endDate = new Date(endTmDate.getTime() - 1000);
        } else {
            // 第二期及以后：开始时间 = 上一期结束时间 + 1秒
            startDate = new Date((lastEndDate as Date).getTime() + 1000);
            
            // 计算本期的结束时间：在上一期结束时间的基础上，增加15天或30天，再减1秒
            endDate = new Date(lastEndDate as Date);
            const daysToAdd = getValue("Base.cInstMrk") == '5' ? 15 : 30;
            endDate.setDate(endDate.getDate() + daysToAdd);
        }

        let tInsrncBgnTm = formatDate(startDate, 'yyyy-MM-dd HH:mm:ss')
        let tPayEndTm = formatDate(endDate,'yyyy-MM-dd HH:mm:ss')

				if (i === Number(getValue("Base.nPayNum")) - 1 && getValue("Base.cInstMrk") == '5') {
					// 获取 endDate 的日期部分，拼接固定的时间字符串
					tPayEndTm = dayjs(endDate).format("YYYY-MM-DD") + " 23:59:59"
				}
        val= { "_dataId": "",
          "Pay.nTms":i+1 ,
          "Pay.cPayorCde": opertaor.getTableRefs()["applicant"].getValue("Applicant.cAppCde"),
          "Pay.tPayBgnTm": tInsrncBgnTm,
          "Pay.tPayEndTm": tPayEndTm,
          "Pay.nOwnPrm":result.value[i]? parseFloat((result.value[i] * nCiShare ).toFixed(8)):0,   // 我司
          // "Pay.nOwnPrm": result.value[i] || 0 ,   // 我司
          "Pay.cPayorNme":opertaor.getTableRefs()["applicant"].getValue("Applicant.cAppNme"),
          "Pay.nPayablePrm": result.value[i] || 0, // 应收
          "Pay.nPrmVar": result.value[i]     // 差额
        }
        valArr.push(val)
        // 【关键】循环结束前，把本期的结束时间存起来，作为下一轮循环的“上一期结束时间”
        lastEndDate = endDate;
      }

      console.log('数据',valArr)

      opertaor.getTableRefByKey("payinfo").setFormValue(valArr);
    }

  })
}

// 绑定方法
const method = {
  func1: () => {
  },

  //缴费拆分按钮事件
  splitPayNumber() {
      nPayNumberFun();
 
  },
  //付费约定下拉事件
  cInstMrkChange(val: any) {
   const param = opertaor.getParam();

    if(val=='5'){
      setFormItem("Base.nPayNum", { disabled: false ,  max:12});
    }else if(val=='0'){
      setFormItem("Base.nPayNum", { disabled: true, });
      setValue('Base.nPayNum',1)
      nPayNumberFun();
    }
  },
  //争议处理选择事件
  cDisptSttlCdeChange(val){
    if(val=='A'){
      // setFormItem("Base.cDisptSttlOrg", { disabled: false,rules: [getRules("required", {})] });
      setFormItem("Base.cDisptSttlOrg", { rules: [getRules("required", {})] });
      setValue("Base.cDisptSttlOrg", "提交____仲裁委员会");
    }else{
      setFormItem("Base.cDisptSttlOrg", {rules: [] });
      setValue("Base.cDisptSttlOrg", "");   
    }
    
  },
  //总保费下拉事件
  cPrmCurChange: (val: any) => {
    if (val !== "CNY") {
      codeListStore
        .queryCodeList({
          codeListName: "WEB_BAS_CHGRATE",
          codeListParam: { value: val },
        })
        .then((res) => {
          setValue("Base.nPrmRmbExch", res[0].currency_rate);
        });
    } else {
      setValue("Base.nPrmRmbExch", "1.000000");
    }
  },
  //总保额币种下拉事件
  cAmtCurChange(val: any, row: any, item: any) {
    console.log('cAmtCurChange-item', item)
    if (val !== "CNY") {
      codeListStore
        .queryCodeList({
          codeListName: "WEB_BAS_CHGRATE",
          codeListParam: { value: val },
        })
        .then((res) => {
          setValue("Base.nAmtRmbExch", res[0].currency_rate, `group-${item.group}`);
        });
    } else {
      setValue("Base.nAmtRmbExch", "1.000000", `group-${item.group}`);
    }
  },
  //保额汇率标识change事件
  cInsExchCdeChange(val: any) {
    if (val == "0") {// 协议汇率
      setFormItem("Base.nAmtRmbExch", { disabled: false });
    } else {// 实时汇率
      setFormItem("Base.nAmtRmbExch", { disabled: true });
      // setValue("Base.nAmtRmbExch", "1.000000");
      const cAmtCur = getValue("Base.cAmtCur")
      if(cAmtCur) {
        method.cAmtCurChange(cAmtCur)
      }
    }
  },
  //保费汇率标识change事件
  cPremExchCdeChange(val: any) {
    if (val == "0") {
      setFormItem("Base.nPrmRmbExch", { disabled: false });
    } else {
      setFormItem("Base.nPrmRmbExch", { disabled: true });
      // setValue("Base.nPrmRmbExch", "1.000000");
      const cPrmCur = getValue("Base.cPrmCur")
      if(cPrmCur) {
        method.cPrmCurChange(cPrmCur)
      }
    }
  },
  // 特别约定ICON事件
  selectCUnfixSpc: () => {
    dialogRef.value?.open(
      "prdFixSpec",
      {
        type: "show",
        data: {
          cProdNo: sessionData.value?.cProdNo,
          fixSpecData: fixSpecData.value, //之前选中的数据数组
        },
        method: {
          getSelected: (params) => {
            if (params && params.length) {
              fixSpecData.value = params;
              let i = 1;
              // let cSpecNo = '';
              let cUnfixSpc = "";
              params.forEach((value) => {
                // cSpecNo = '' === cSpecNo ? value['PrdFixSpec.CSpecNo'] : cSpecNo + '$$' + value['PrdFixSpec.CSpecNo'];
                cUnfixSpc =
                  "" === cUnfixSpc
                    ? i + "." + value["PrdFixSpec.CNmeCn"]
                    : cUnfixSpc + "\n" + i + "." + value["PrdFixSpec.CNmeCn"];
                setValue("Base.cUnfixSpc", cUnfixSpc);
                i++;
              });
            }
            dialogRef.value?.handleClose();
          },
        },
      },
      {
        isOk: (selectdata: any) => {
        },
      },
      { title: "特别约定", width: 85 }
    );
  },
  // 短期费率类型
  cRatioTypChange:(val:any)=>{
    const tabref = opertaor.getTableRefs();
    const baseBefore = tabref["insrnc"].getFromValue();
    let prodNo = route.params.param.cProdNo;
    let param = {
      bgnTm: baseBefore["Base.tInsrncBgnTm"],
      endTm: baseBefore["Base.tInsrncEndTm"],
      prodNo,
      ratioType:val
    }
    policyRatio(param).then((res: any) => {
      const { code, data, msg } = res;      
      if (code === 200) {
        setValue("Base.nRatioCoef",Number(data).toFixed(6));
        }
    });
  },
  // 总保额(累计赔偿限额)change事件
  nAmtChange: (val: any) => {
    if (null != val) {
      const namtRmbExch = getValue('Base.nAmtRmbExch');
      if (!!namtRmbExch) {
        // 计算折人民币保额
        setValue("Base.nRmbAmt", numMulti(val, namtRmbExch));
      }
    }
  },
  // 总保费change事件
  nPrmChange: (val: any) => {
    if (null != val) {
      const nprmRmbExch = getValue('Base.nPrmRmbExch');
      if (!!nprmRmbExch) {
        // 计算折人民币保费
        setValue('Base.nRmbPrm', numMulti(val, nprmRmbExch))
      }
    }
  },
  aAmtChange:(val:any)=>{
    const namtExch = getValue('Base.nAmtRmbExch');
    if (!!namtExch) {
        // 计算折人民币保额
        setValue("Base.nRmbAmt", numMulti(namtExch, val));
      }
  },
  // 总保额(累计赔偿限额)汇率change事件
  nAmtRmbExchChange: (val: any) => {
    if (!!val) {
      const namt = getValue('Base.nAmt');
      if (!!namt) {
        // 计算折人民币保额
        setValue("Base.nRmbAmt", numMulti(namt, val));
      }
    }
  },
  // 总保额(累计赔偿限额) 是和否change事件
  nAmtLimitManualChange: (val: any) => {
    if(val == '0'){
        setFormItem("Base.nAmt", { disabled: true });
    } else{
        setFormItem("Base.nAmt", { disabled: false });
    }
  },
  // 总保费汇率change事件
  nPrmRmbExchChange: (val: any) => {
    if (!!val) {
      const nprm = getValue('Base.nPrm');
      if (!!nprm) {
        // 计算折人民币保费
        setValue("Base.nRmbPrm", numMulti(nprm, val));
      }
    }
  },
};

// 绑定特殊验证器
const exRules = {};


const getGroupKey = (key: string, groupId?: string) => {
  let ikey = key;
  if(groupId && baseFormatKeys.includes(key)) {
    ikey = `${groupId ? groupId.replace('group-', '') : ''}:${key}`
  }
  return ikey;
}

function getFromValue(groupId: string) {
  const fromData = baseEditRef?.value?.getFromValue();
  return peelFormDataByProdNo(fromData, groupId ? groupId.replace('group-', '') : '')
}

function setFormValue(value: any, groupId?: string) {
  const prodNos = []
  if(!groupId || groupId === CommonGroupId) {
    prodNos.push(...route.params?.param.cProdList)
  }else {
    prodNos.push(groupId ? groupId.replace('group-', '') : '')
  }
  const res = joinFormDataByProdNo(value, prodNos)
  baseEditRef?.value?.setFormValue(res);
}

function validate() {
  return baseEditRef?.value?.validate();
}

function setValue(key: string, value: any, groupId?: string) {
  if(!groupId) {
    route.params?.param.cProdList.forEach(prodNo => {
      baseEditRef?.value?.setValue(getGroupKey(key, `group-${prodNo}`), value);
    })
  }else {
    baseEditRef?.value?.setValue(getGroupKey(key, groupId), value);
  }
}

function getValue(key: string, groupId?: string) {
  return baseEditRef?.value?.getValue(getGroupKey(key, groupId));
}

//给表单赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      const keys = item.prop.split(":")
      const ikey = keys.length > 1 ? keys[1] : keys[0]
      if (key === ikey) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          for (let k in obj.btnItems) {
            item.btnItems[k] = obj.btnItems[k];
          }
        }else{
          Object.assign(item, obj);
        }
      }
    });
  }
}

function getFormconfig(){
  return formconfig1;
}

function numMulti(num1, num2) {
  let baseNum = 0;
  try {
    baseNum += num1.toString().split('.')[1].length;
  } catch (e) {
  }
  try {
    baseNum += num2.toString().split('.')[1].length;
  } catch (e) {
  }
  return Number(num1.toString().replace('.', '')) * Number(num2.toString().replace('.', '')) / Math.pow(10, baseNum);
}
function setDisabledAll(isDisabled: boolean = true) {
  baseEditRef?.value?.setDisabledAll(isDisabled);
}

function addProvide<T>(key: InjectionKey<T> | string, value: T)  {
  baseEditRef?.value?.addProvide(key, value);
}
defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig,
  nPayNumberFun,
  addProvide,
  setFormItem,
  setDisabledAll
});
</script>

<style scoped></style>

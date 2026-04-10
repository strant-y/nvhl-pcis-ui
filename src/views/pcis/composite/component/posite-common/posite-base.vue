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
  pageSchema: {
    type: [Object],
    required: true,
  },
  compKey: {
    type: String,
    required: false,
  },
});

const groupId: any = {value: null} // 当前groupId 不能用ref
const baseEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig1 = reactive(createAppFreeEditConfig({}));
const sessionData = ref();
const fixSpecData = ref([]); //存储已选择的特别约定数据
const structure = new CustomStructure()
// 需要分组的key
onMounted(async () => {
  const {pageSchema} = structure.diffGroupBuild(props.pageSchema, param.cProdDtlList, baseFormatKeys)
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
        for (let i = 0; i < Number(getValue("Base.nPayNum")); i++) {
          let BgnTmDate = new Date(opertaor.getTableRefs()["insrnc"].getValue("Base.tInsrncBgnTm"))   // 开始时间
          let startDate = new Date(BgnTmDate);
          let endDate = new Date(BgnTmDate)
          if (getValue("Base.cInstMrk")=='5') {
            startDate.setDate(BgnTmDate.getDate() + i * 15);
            endDate.setDate(BgnTmDate.getDate() + (i + 1) * 15);
          } else {
            startDate.setDate(BgnTmDate.getDate() + i * 30);
            endDate.setDate(BgnTmDate.getDate() + (i + 1) * 30);
          }

          let tInsrncBgnTm = formatDate(startDate, 'yyyy-MM-dd HH:mm:ss')
          // let tPayEndTm = formatDate(endDate,'yyyy-MM-dd HH:mm:ss')

          let tPayEndTm = dayjs(endDate).add(-1,'second').format("YYYY-MM-DD HH:mm:ss")
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

 
    if (param.initFlag) {
      return ;
    }
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
  cAmtCurChange(val: any) {
    if (val !== "CNY") {
      codeListStore
        .queryCodeList({
          codeListName: "WEB_BAS_CHGRATE",
          codeListParam: { value: val },
        })
        .then((res) => {
          setValue("Base.nAmtRmbExch", res[0].currency_rate);
        });
    } else {
      setValue("Base.nAmtRmbExch", "1.000000");
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


const getGroupKey = (key: string) => {
  let ikey = key;
  if(groupId.value && baseFormatKeys.includes(key)) {
    ikey = `${groupId.value ? groupId.value.replace('group-', '') : ''}:${key}`
  }
  return ikey;
}

function getFromValue() {
  const fromData = baseEditRef?.value?.getFromValue();
  return peelFormDataByProdNo(fromData, groupId.value ? groupId.value.replace('group-', '') : '')
}

function setFormValue(value: any) {
  const prodNos = []
  if(!groupId.value) {
    prodNos.push(...route.params?.param.cProdList)
    nextTick(() => {
      groupId.value = CommonGroupId
    })
  }else {
    prodNos.push(groupId.value ? groupId.value.replace('group-', '') : '')
  }
  const res = joinFormDataByProdNo(value, prodNos)
  baseEditRef?.value?.setFormValue(res);
}

function validate() {
  return baseEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  baseEditRef?.value?.setValue(getGroupKey(key), value);
}

function getValue(key: string) {
  return baseEditRef?.value?.getValue(getGroupKey(key));
}

//给表单赋值
function setFormItem(key: any, obj: any) {
  const ikey = getGroupKey(key)
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === ikey) {
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
function addProvide<T>(key: InjectionKey<T> | string, value: T)  {
  baseEditRef?.value?.addProvide(key, value);
}
const setGroupId = (id: string) => {
  if(groupId.value) {
    groupId.value = id
  }
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
  setGroupId
});
</script>

<style scoped></style>

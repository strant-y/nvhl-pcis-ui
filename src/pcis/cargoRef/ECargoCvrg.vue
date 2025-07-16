<template>
  <app-grid-edit :gridEditConfig="formconfig1" ref="cvrgEditRef" />
  <comDialog ref="dialog"></comDialog>
</template>

<script setup lang="ts">
import { formInit } from "@/shared/from-init";
import {
  AppGridEditMethod,
  createAppGridEditConfig,
} from "@/shared/app-grid-edit-config";
import { getProFactoryList } from "@/api/prod";
import {ref} from "vue";
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
import {DialogMethod} from "@/common/dzmodel/ComDialogConf";
const eCargoSelectTgtFix = defineAsyncComponent(
    () => import("./fix/SelectDistFix.vue")
);

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const idxParam = inject('idxParam');
const formPage = idxParam?.formPage;

const dialog = ref<DialogMethod | null>(null);
const cvrgEditRef = ref<AppGridEditMethod | null>(null);
const formconfig1 = reactive(createAppGridEditConfig({}));
const cClauseType = ref('');
const eCargoTermNo = ref('');

const handelCalculate = (row:any,selectData:any)=>{
  if(selectData.length > 0) {
    const nSeqNoJoin = selectData.map((item: any) => item['ECargoGoodsTgt.nSeqNo']).join(',')
    cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nCargoSeq',row['_dataId'] , nSeqNoJoin)
    const sum = selectData.reduce((total, current) => total + current['ECargoGoodsTgt.nRmbLimit'], 0);
    cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nInsuranceAmount',row['_dataId'] , sum)
    cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nRmbAmount',row['_dataId'] , sum * row['ECargoTerm.nOriginalRate'])
    if(row['ECargoTerm.nRateVal']){
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nInsuranceFee',row['_dataId'] , (row['ECargoTerm.nInsuranceAmount'] * row['ECargoTerm.nRateVal'])/1000)
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nRmbFee',row['_dataId'] , ((row['ECargoTerm.nInsuranceAmount'] * row['ECargoTerm.nRateVal'])/1000) * row['ECargoTerm.nFeeRate'])
    }
  }
}
onMounted(() => {
  const tableConfig = props.pageSchema;
  tableConfig.fromSchema.forEach((item: any) => {
    if(['Term.nSeqNo', 'Term.nCargoSeq'].includes(item.prop)) {
      item.disabled = true;
    }
  });
  const formconfig11 = formInit(
      JSON.stringify(tableConfig),
      method,
      exRules
  );
  
  Object.assign(formconfig1, formconfig11);
});

// 绑定方法
const method = {
  cAmountCurrencyChange:(val:any,row:any)=>{
    console.log(val,row)
    if (val !== "CNY") {
      codeListStore
          .queryCodeList({
            codeListName: "WEB_BAS_CHGRATE",
            codeListParam: { value: val },
          })
          .then((res) => {
            cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nOriginalRate',row['_dataId'] , res[0].currency_rate)
            cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nRmbAmount',row['_dataId'] , row['ECargoTerm.nInsuranceAmount'] * res[0].currency_rate)
          });
    } else {
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nOriginalRate',row['_dataId'] , "1.000000")
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nRmbAmount',row['_dataId'] , row['ECargoTerm.nInsuranceAmount'] * 1)
    }
  },
  nOriginalRateChange:(val:any,row:any)=>{
    if(val && row['ECargoTerm.nInsuranceAmount']){
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nRmbAmount',row['_dataId'] , row['ECargoTerm.nInsuranceAmount'] * val)
    }
  },
  nFeeRateChange:(val:any,row:any)=>{
    if(val && row['ECargoTerm.nInsuranceFee']){
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nRmbFee',row['_dataId'] , row['ECargoTerm.nInsuranceFee'] * val)
    }
  },
  cFeeCurrencyChange:(val:any,row:any)=>{
    console.log(val,row)
    if (val !== "CNY") {
      codeListStore
          .queryCodeList({
            codeListName: "WEB_BAS_CHGRATE",
            codeListParam: { value: val },
          })
          .then((res) => {
            cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nFeeRate',row['_dataId'] , res[0].currency_rate)
            cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nRmbFee',row['_dataId'] , row['ECargoTerm.nInsuranceFee'] * res[0].currency_rate)
          });
    } else {
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nFeeRate',row['_dataId'] , "1.000000")
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nRmbFee',row['_dataId'] , row['ECargoTerm.nInsuranceFee'] * 1)
    }
  },
  cInsExchCdeChange:(val:any,row:any)=>{
    val === '1' ? cvrgEditRef.value?.setFormSchema(row._dataId, "ECargoTerm.nOriginalRate", 'disabled', true) :cvrgEditRef.value?.setFormSchema(row._dataId, "ECargoTerm.nOriginalRate", 'disabled', false)
  },
  cPremExchCdeChange:(val:any,row:any)=>{
    val === '1' ? cvrgEditRef.value?.setFormSchema(row._dataId, "ECargoTerm.nFeeRate", 'disabled', true) :cvrgEditRef.value?.setFormSchema(row._dataId, "ECargoTerm.nFeeRate", 'disabled', false)
  },
  funcCvrgCargoAdd: () => {
    cvrgEditRef?.value?.addRow();
    const val = getFormValue();
    nextTick(()=>{
      val[val.length -1]['ECargoTerm.cAmountCurrency'] = 'CNY'
      val[val.length -1]['ECargoTerm.cFeeCurrency'] = 'CNY'
      val[val.length -1]['ECargoTerm.nOriginalRate'] = "1.000000"
      val[val.length -1]['ECargoTerm.nFeeRate'] = "1.000000"
      val[val.length -1]['ECargoTerm.cInsExchCde'] = "1"
      val[val.length -1]['ECargoTerm.cPremExchCde'] = "1"
      cvrgEditRef.value?.setFormSchema(val[val.length -1]._dataId, "ECargoTerm.nOriginalRate", 'disabled', true)
      cvrgEditRef.value?.setFormSchema(val[val.length -1]._dataId, "ECargoTerm.nFeeRate", 'disabled', true)
    })
    console.log('val', val)
    val.forEach((key: string, index: number) => {
      key['ECargoTerm.nSeqNo'] = index + 1
    });
  },
  funcCvrgCargoDel: () => {
    console.log('funcCvrgCargoDel')
    const selData = cvrgEditRef?.value?.getSelectRow()
    if (!selData) {
      ElMessage.warning("请选择要删除的数据!");
      return;
    }
    const editIndex = selData['_dataId'];
    cvrgEditRef?.value?.delRow(editIndex);
  },
  selecedTgt: () => {
    const row = cvrgEditRef?.value?.getSelectRow()
    console.log('row', row)
    if(!row) {
      ElMessage.warning("请选择一条数据!");
      return;
    }
    // debugger
    const cvrgList = cvrgEditRef?.value?.getFromValue();
    const list = cvrgList.filter((f: any) => f._dataId != row._dataId);
    const selectList = list.map((m: any) => m['ECargoTerm.nCargoSeq']).join(',').split(',');
    dialog.value?.open(
        eCargoSelectTgtFix,
        {
          selectedData: row, //需要把自定义的过滤掉，只传过去从模板中选择的
          selectList: selectList,
        },
        {
          getSelected(selectdata: any) {
            if(selectdata) {
              handelCalculate(row,selectdata)
              dialog.value?.handleClose()
            }
          }
        },
        {  width: 65 }
    );

  },
  //产品名称change
  cProductChange:(val)=>{
    eCargoTermNo.value = val;
    // const rowData = cvrgEditRef.value?.getSelectRow();
    // const rowId = rowData._dataId;
    // codeListStore
    //     .queryCodeList({
    //       codeListName: "TERM_LIST_02",
    //       codeListParam: { "cProdNo": val, cRdrTyp: "1" },
    //     })
    //     .then((res) => {
    //       console.log('res', res)
    //       cvrgEditRef.value?.addCodeListMap(
    //           { code: "ECargoTerm.cClauseName"+rowId,
    //             list: res,
    //           }
    //       );
    //     });
  },
  //条款类型change
  cClauseTypeChange:(val)=>{
    // cClauseType.value = val;
    const rowData = cvrgEditRef.value?.getSelectRow();
    const rowId = rowData._dataId;
    codeListStore
        .queryCodeList({
          codeListName: "TERM_LIST_02",
          codeListParam: { "cProdNo": eCargoTermNo, cRdrTyp: val },
        })
        .then((res) => {
          console.log('res', res)
          cvrgEditRef.value?.addCodeListMap(
              { code: "ECargoTerm.cClauseName"+rowId,
                list: res,
              }
          );
        });
  },
  //条款名称选择change
  cClauseChange:(val)=>{
    const rowData = cvrgEditRef.value?.getSelectRow();
    const rowId = rowData._dataId;
    codeListStore
        .queryCodeList({
          codeListName: "RISK_LIST_02",
          codeListParam: { "cTermNo": val, },
        })
        .then((res) => {
          cvrgEditRef.value?.addCodeListMap(
              { code: "ECargoTerm.cRiskName"+rowId,
                list: res,
              }
          );
        })

  },
  //原币保险金额change事件
  nInsuranceAmountChange:(val)=>{

  },
  //费率change事件
  nRateValChange:(val:any,row:any)=>{
    if(val){
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nInsuranceFee',row['_dataId'] , (row['ECargoTerm.nInsuranceAmount'] * val)/1000)
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nRmbFee',row['_dataId'] , ((row['ECargoTerm.nInsuranceAmount'] * val)/1000) * row['ECargoTerm.nFeeRate'])
    }
  },
};

// 绑定特殊验证器
const exRules = {};

function getFormValue() {
  return cvrgEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  cvrgEditRef?.value?.setFormValue(value);
}

function validate() {
  return cvrgEditRef?.value?.validate();
}

function getTableValue(rowId: number, key: string) {
  cvrgEditRef?.value?.getTableValue(rowId, key);
}

function getFormConfig() {
  return formconfig1;
}
//给表单赋值
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
function getFormBtn() {
  return cvrgEditRef?.value?.getFormBtn();
}
function getTableBtn() {
  return cvrgEditRef?.value?.getTableBtn();
}
function setDisabledAll(isDisabled: boolean) {
  cvrgEditRef?.value?.setDisabledAll(isDisabled);
}
defineExpose({
  getFormValue,
  setFormValue,
  validate,
  getTableValue,
  getFormConfig,
  setFormItem,
  getFormBtn,
  setDisabledAll,
  getTableBtn
});
</script>

<style scoped></style>

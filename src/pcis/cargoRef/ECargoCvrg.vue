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
    if(['ECargoTerm.cGroupIdx'].includes(item.prop)) {
      item.disableColEdit = true;
    }
  });
  const formconfig11 = formInit(
      JSON.stringify(tableConfig),
      method,
      exRules
  );

  formconfig1.stripe = false;
  formconfig1.spanMethod = spanMethod;
  formconfig1.currentChange = currentChange;
  formconfig1.showPosition = 'right';
  formconfig1.bottomBtn = {
    show: true,
    plain: true,
    type: 'primary',
    label: '新增分组',
    style: {
      width: '100%',
      color: '#999'
    },
    click: () => {
      method.addGroup()
    }
  };
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
  addGroup: () => {
    cvrgEditRef?.value?.addRow();
    const val = getFormValue();
    const getGroupIdx = () => {
      const bottomRow = val[val.length -2]
      if(bottomRow && bottomRow['ECargoTerm.cGroupIdx']) {
        const str = bottomRow['ECargoTerm.cGroupIdx'].replace('组', '');
        return `组${(Number.parseInt(str) + 1)}` ;
      }else {
        return '组1'
      }
    }
    nextTick(()=>{
      val[val.length -1]['ECargoTerm.cAmountCurrency'] = 'CNY'
      val[val.length -1]['ECargoTerm.cFeeCurrency'] = 'CNY'
      val[val.length -1]['ECargoTerm.nOriginalRate'] = "1.000000"
      val[val.length -1]['ECargoTerm.nFeeRate'] = "1.000000"
      val[val.length -1]['ECargoTerm.cInsExchCde'] = "1"
      val[val.length -1]['ECargoTerm.cPremExchCde'] = "1"
      val[val.length -1]['ECargoTerm.cGroupIdx'] = getGroupIdx()
      val[val.length -1]['ECargoTerm.nSeqNo'] = val.length;
      cvrgEditRef.value?.setFormSchema(val[val.length -1]._dataId, "ECargoTerm.nOriginalRate", 'disabled', true)
      cvrgEditRef.value?.setFormSchema(val[val.length -1]._dataId, "ECargoTerm.nFeeRate", 'disabled', true)
    });
  },
  funcCvrgCargoDel: () => {
    const selData = cvrgEditRef?.value?.getSelectRow()
    if (!selData) {
      ElMessage.warning("请选择要删除的数据!");
      return;
    }
    const atGroupIdxList = [...getFormValue()].filter((f: any) => f['ECargoTerm.cGroupIdx'] === selData['ECargoTerm.cGroupIdx']);
    if(atGroupIdxList.length > 1) {
      ElMessageBox.confirm('当前操作将会删除整个组的数据，是否删除？', {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        atGroupIdxList.forEach((item: any) => {
          cvrgEditRef?.value?.delRow(item['_dataId']);
        })
      }).catch(() => {
        // catch error
      })
    }
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
  cProductChange:(val: string, row: any)=>{
    const atGroupIdxList = [...getFormValue()].filter((f: any) => f['ECargoTerm.cGroupIdx'] === row['ECargoTerm.cGroupIdx']);
    const executeChange = () => {
      atGroupIdxList.forEach((item: any) => {
        if(item['_dataId'] === row['_dataId']) {
          // 保留当前行数据 清除字段值
          item['ECargoTerm.cAmountCurrency'] = 'CNY'
          item['ECargoTerm.cFeeCurrency'] = 'CNY'
          item['ECargoTerm.nOriginalRate'] = "1.000000"
          item['ECargoTerm.nFeeRate'] = "1.000000"
          item['ECargoTerm.cInsExchCde'] = "1"
          item['ECargoTerm.cPremExchCde'] = "1"
          item['ECargoTerm.cClauseName'] = ""
          item['ECargoTerm.cRiskNo'] = ""
        }else if(item['_dataId'] !== row['_dataId']) {
          // 产品变更后 删除同一个组内的其它行数据
          cvrgEditRef.value?.delRow(item['_dataId']);
        }
      })
    }
    if(atGroupIdxList.length > 1) {
      const f = atGroupIdxList.find(f => f['_dataId'] !== row['_dataId']);
      if(f['ECargoTerm.cProdNo'] === val) return;
      ElMessageBox.confirm('变更产品后将会清除该组内所有数据， 是否变更？', {
        confirmButtonText: "变更",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        executeChange();
      }).catch(() => {
        cvrgEditRef.value?.setValueByRowKey('ECargoTerm.cProdNo', row['_dataId'], f['ECargoTerm.cProdNo']);
      })
    }else {
      executeChange();
    }
  },
  //条款类型change
  cClauseTypeChange:(val, row)=>{
    setOptions("ECargoTerm.cClauseName", row._dataId, "TERM_LIST_02", { cProdNo:  row['ECargoTerm.cProdNo'], cRdrTyp: val });
  },
  //条款名称选择change
  cClauseChange:(val, row)=>{
    setOptions("ECargoTerm.cRiskNo", row._dataId, "RISK_LIST_02", { "cTermNo": val, });
  },
  cClauseNameOnInit:  (data: any) => {
    const {value, rowData, config, itemRef} = data;
    if (!value || !rowData || !config || !itemRef) return;
    const cProdNo = rowData['ECargoTerm.cProdNo'];
    const cClauseType = rowData['ECargoTerm.cClauseType'];
    setOptions("ECargoTerm.cClauseName", rowData._dataId, "TERM_LIST_02", { cProdNo: cProdNo, cRdrTyp: cClauseType });
    setOptions("ECargoTerm.cRiskNo", rowData._dataId, "RISK_LIST_02", { "cTermNo": value});
  },
  // 责任初始化事件
  cRiskNoOnInit: (data: any) => {
    const {value, rowData, config, itemRef} = data;
    if (!value || !rowData || !config || !itemRef) return;
    setOptions("ECargoTerm.cRiskNo", rowData._dataId, "RISK_LIST_02", { "cTermNo": rowData['ECargoTerm.cClauseName']});
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
  selectTrem: () => {
    const row = cvrgEditRef?.value?.getSelectRow()
    console.log('row', row)
    if(!row) {
      ElMessage.warning("请选择一条数据!");
      return;
    }
    if(!row['ECargoTerm.cProdNo'] || row['ECargoTerm.cProdNo'] === '') {
      ElMessage.warning("请先选择产品!");
      return;
    }
    const atGroupIdxList = [...getFormValue()].filter((f: any) => f['ECargoTerm.cGroupIdx'] === row['ECargoTerm.cGroupIdx']);
    const mainTerm: any = {
      riskList: [],
    };
    const clauseList: any[] = [mainTerm];
    atGroupIdxList.forEach((item: any) => {
      const cClauseType = item['ECargoTerm.cClauseType']
      const cClauseName = item['ECargoTerm.cClauseName']
      const cRiskNo = item['ECargoTerm.cRiskNo']
      const rowId = item['_dataId']
      if(cClauseType === '0' && !!cRiskNo) {
        mainTerm['Term.cRdrTyp'] = cClauseType;
        mainTerm['Term.cClauseCode'] = cClauseName;
        mainTerm['Term.cRowId'] = rowId;
        mainTerm.riskList.push({ "TermRisktgt.cLiabCode": cRiskNo });
      }else {
        clauseList.push({
          "Term.cRdrTyp": cClauseType,
          "Term.cClauseCode": cClauseName,
          "Term.cRowId": rowId,
        });
      }
    });
    dialog.value?.open(
        "addtremView",
        {
          type: "show",
          data: {
            cProdNo: row['ECargoTerm.cProdNo'],
            isselectData: clauseList,
            type: 'ECargo'
          },
        },
        {
          isOk: (selectdata: any) => {
            const addList: any[] = [];
            selectdata.forEach((item: any) => {
              if(item.children && item.children.length > 0) {
                for(const risk of item.children) {
                  const find = atGroupIdxList.find((d: any) => d['ECargoTerm.cClauseName'] === item.cTermNo && d['ECargoTerm.cRiskNo'] === risk.cRiskNo);
                  if(find) {
                    addList.push(find)
                  }else {
                    addList.push(buildRow({
                      cProdNo: row['ECargoTerm.cProdNo'],
                      cRiskNo: risk.cRiskNo,
                      cClauseType: item.cRdrTyp,
                      cClauseName: item.cTermNo,
                      cGroupIdx: row['ECargoTerm.cGroupIdx'],
                    }))
                  }
                }
              }else {
                const find = atGroupIdxList.find((d: any) => d['ECargoTerm.cClauseName'] === item.cTermNo && d['ECargoTerm.cClauseType'] === item.cRdrTyp);
                if(find) {
                  addList.push(find)
                }else {
                  addList.push(buildRow({
                    cProdNo: row['ECargoTerm.cProdNo'],
                    cClauseType: item.cRdrTyp,
                    cClauseName: item.cTermNo,
                    cGroupIdx: row['ECargoTerm.cGroupIdx'],
                  }))
                }
              }
            });
            const list: any[] = [...getFormValue()];
            // 替换数据
            const index = list.findIndex((f: any) => atGroupIdxList[0]['_dataId'] === f['_dataId']);
            list.splice(index, atGroupIdxList.length, ...addList);
            // 排序 保证合并单元格的规则正常进行
            list.sort((x, y) => {
              if (x.cGroupIdx !== y.cGroupIdx) {
                return x.cGroupIdx - y.cGroupIdx;  // 先按 groupIdx 升序
              }
              return x.cClauseType - y.cClauseType;
            })
            setFormValue(list)
          },
        },
        { title: "添加条款", width: 85 }
    );
  }
};

/**
 * 设置下拉列表
 * @param key
 * @param rowId
 * @param codeListName
 * @param codeListParam
 */
function setOptions(key: string, rowId: string, codeListName: string, codeListParam: any) {
  codeListStore.queryCodeList({
    codeListName: codeListName,
    codeListParam: {...codeListParam},
  }).then((res) => {
    cvrgEditRef.value?.addCodeListMap({
      code: key + rowId,
      list: res,
    });
  });
}


const buildRow = (data: any) => {
  const res: any = {};
  res['ECargoTerm.cAmountCurrency'] = 'CNY'
  res['ECargoTerm.cFeeCurrency'] = 'CNY'
  res['ECargoTerm.nOriginalRate'] = "1.000000"
  res['ECargoTerm.nFeeRate'] = "1.000000"
  res['ECargoTerm.cInsExchCde'] = "1"
  res['ECargoTerm.cPremExchCde'] = "1"
  res['ECargoTerm.cProdNo'] = data.cProdNo
  res['ECargoTerm.cClauseName'] = data.cClauseName
  res['ECargoTerm.cClauseType'] = data.cClauseType
  res['ECargoTerm.cGroupIdx'] = data.cGroupIdx
  res['ECargoTerm.cRiskNo'] = data.cRiskNo
  return res;
};

// 计算合并行数
const calculateSpans = (key: string, expandRowKeys: string[]) => {
  const idxArr: number[] = [];
  const list = getFormValue();

  if(list && list.length > 1) {
    let mergedRowIdx = 0;
    const isMerged = (prop: string,item1: any, item2: any, other: boolean = true): boolean => {
      const selectRow = cvrgEditRef.value?.getSelectRow();
      return other && !!item1[prop]
          && item1[prop] === item2[prop]
          && item1[prop] === item2[prop]
          && (expandRowKeys.length === 0 || (!expandRowKeys.includes(item1['_dataId'])) && !expandRowKeys.includes(item2['_dataId']))
          && (!selectRow || (selectRow._dataId !== item1._dataId && selectRow._dataId !== item2['_dataId']))
    };
    const mergedAction = (is: boolean, index: number) => {
      if (is) {
        idxArr[mergedRowIdx] += 1
        idxArr.push(0)
      }else {
        mergedRowIdx = index;
        idxArr.push(1)
      }
    }
    list.forEach((item: any, index: number) => {
      if (index === 0) {
        idxArr.push(1)
      } else if(key === 'cGroupIdx'){
        mergedAction(isMerged('ECargoTerm.cGroupIdx', item, list[index - 1]), index)
      } else if(key === 'cProdNo'){
        mergedAction(isMerged('ECargoTerm.cProdNo', item, list[index - 1]), index)
      }else if(key === 'cClauseType'){
        mergedAction(isMerged('ECargoTerm.cClauseType', item, list[index - 1], item['ECargoTerm.cGroupIdx'] === list[index - 1]['ECargoTerm.cGroupIdx']), index)
      }else if(key === 'cClauseName'){
        mergedAction(isMerged('ECargoTerm.cClauseName', item, list[index - 1], item['ECargoTerm.cGroupIdx'] === list[index - 1]['ECargoTerm.cGroupIdx']), index)
      }
    })
  }
  return idxArr;
}

const spanMethod = (obj: any, expandRowKeys: string[]) => {
  const { row, column, rowIndex, columnIndex } = obj;
  let list;
  if (columnIndex === 1) {
    list = calculateSpans('cGroupIdx', expandRowKeys)
  }else if (columnIndex === 2) {
    list = calculateSpans('cProdNo', expandRowKeys);
  }else if (columnIndex === 3) {
    list = calculateSpans('cClauseType', expandRowKeys);
  }else if (columnIndex === 4) {
    list = calculateSpans('cClauseName', expandRowKeys);
  }
  if(list && list.length > 0) {
    const idx = list[rowIndex]
    return idx > 0 ? { rowspan: idx, colspan: 1 } : { rowspan: 0, colspan: 0 }
  }
  return { rowspan: 1, colspan: 1 }
}

/**
 * 点击行后刷新表格数据 重新计算单元格合并数据
 * @param currentRow
 * @param oldCurrentRow
 */
const currentChange = (currentRow: any, oldCurrentRow: any) => {
  const list = getFormValue();
  setFormValue(list)
}

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

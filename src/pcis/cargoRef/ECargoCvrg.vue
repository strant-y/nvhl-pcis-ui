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
import {CommonConstants} from "@/constants/CommonConstants";
import {eventBus} from "@/utils/event-bus";
import cargoApi from "@/api/cargo";
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
const cRdrTyp = ref('');
const eCargoTermNo = ref('');

function isAllAValuesSame(arr:any,key:any) {
  // 检查是否有null或undefined和空的key
  if (arr.some(obj => obj[key] === null || obj[key] === undefined || obj[key] === '')) {
    return false;
  }
  const firstValue = arr[0][key];
  return arr.every(obj => obj[key] === firstValue);
}
const handelCalculate = (row:any,selectData:any)=>{
  if(selectData.length > 0) {
    if(isAllAValuesSame(selectData,'ECargoGoodsTgt.cPrmCur')){

      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.cFeeCurrency',row['_dataId'] , selectData[0]['ECargoGoodsTgt.cPrmCur'])
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.cOriginalCurrency',row['_dataId'] , selectData[0]['ECargoGoodsTgt.cPrmCur'])

      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nFeeRate',row['_dataId'] , selectData[0]['ECargoGoodsTgt.nAmtExch'])
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nOriginalRate',row['_dataId'] , selectData[0]['ECargoGoodsTgt.nAmtExch'])

      cvrgEditRef.value?.setFormSchema(row._dataId, "ECargoTerm.cFeeCurrency", 'hidden', false)
      cvrgEditRef.value?.setFormSchema(row._dataId, "ECargoTerm.cOriginalCurrency", 'hidden', false)
      cvrgEditRef.value?.setFormSchema(row._dataId, "ECargoTerm.nFeeRate", 'hidden', false)
      cvrgEditRef.value?.setFormSchema(row._dataId, "ECargoTerm.nOriginalRate", 'hidden', false)
    }else {
      ElMessage.error('请选择币种一样的货物')
      return
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nInsuranceAmount',row['_dataId'] , '')
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nInsuranceFee',row['_dataId'] , '')

      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.cFeeCurrency',row['_dataId'] , '')
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.cOriginalCurrency',row['_dataId'] , '')

      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nFeeRate',row['_dataId'] , '')
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nOriginalRate',row['_dataId'] , '')

      cvrgEditRef.value?.setFormSchema(row._dataId, "ECargoTerm.cFeeCurrency", 'hidden', true)
      cvrgEditRef.value?.setFormSchema(row._dataId, "ECargoTerm.cOriginalCurrency", 'hidden', true)
      cvrgEditRef.value?.setFormSchema(row._dataId, "ECargoTerm.nFeeRate", 'hidden', true)
      cvrgEditRef.value?.setFormSchema(row._dataId, "ECargoTerm.nOriginalRate", 'hidden', true)

    }
    const nSeqNoJoin = selectData.map((item: any) => item['ECargoGoodsTgt.cCodeNo']).join(',')
    cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nCargoSeq',row['_dataId'] , nSeqNoJoin)
    const cGoodsIds = selectData.map((item: any) => item['ECargoGoodsTgt.cPkId']).join(',')
    cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.cGoodsId',row['_dataId'] , cGoodsIds)
    const sum = selectData.reduce((total, current) => total + current['ECargoGoodsTgt.nInsuranceAmount'], 0);
    cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nInsuranceAmount',row['_dataId'] , toFixTwo(sum))
    cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nRmbAmount',row['_dataId'] , toFixTwo(sum * row['ECargoTerm.nOriginalRate']))
    if(row['ECargoTerm.nRateVal']){
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nInsuranceFee',row['_dataId'] , parseFloat(((row['ECargoTerm.nInsuranceAmount'] * row['ECargoTerm.nRateVal'])/1000).toFixed(2)))
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nRmbFee',row['_dataId'] , parseFloat((((row['ECargoTerm.nInsuranceAmount'] * row['ECargoTerm.nRateVal'])/1000) * row['ECargoTerm.nFeeRate']).toFixed(2)))
    }
  }
}
const handeReset = (row:any)=>{

      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nInsuranceAmount',row['_dataId'] , '')
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nInsuranceFee',row['_dataId'] , '')

      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nRmbAmount',row['_dataId'] , '')

      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.cFeeCurrency',row['_dataId'] , '')
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.cOriginalCurrency',row['_dataId'] , '')

      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nFeeRate',row['_dataId'] , '')
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nOriginalRate',row['_dataId'] , '')

      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nCargoSeq',row['_dataId'] , '')
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.cGoodsId',row['_dataId'] , '')

      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nRmbFee',row['_dataId'] , '')

}
const toFixTwo = (val:any)=> parseFloat(val.toFixed(2))

onMounted(() => {
  nextTick(()=>{
    eventBus.on('matterChange', matterChange)
  })
  const tableConfig = props.pageSchema;
  tableConfig.fromSchema.forEach((item: any) => {
    if(['ECargoTerm.cPlanNo'].includes(item.prop)) {
      item.disableColEdit = true;
    }
    if(['ECargoTerm.cGoodsId'].includes(item.prop)) {
      item.disabled = true;
      item.hidden = true;
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
    hidden: false,
    plain: true,
    type: 'primary',
    label: '新增分组',
    style: {
      width: '100%',
      color: '#999'
    },
    click: () => {
      ElMessageBox.prompt('','请输入组名', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputValidator: (value: string) => {
          if (!value || value.length < 2) {
            return '长度不小于2'
          }else{
            const list = [...getFormValue()];
            const f = list.filter((item: any) => item['ECargoTerm.cPlanNo'] === value);
            if(f && f.length > 0) {
              return '组名已存在'
            }
          }
          return true
        }
      }).then(({ value }) => { // 确认
        cvrgEditRef.value?.addRowByData(buildRow({
          cPlanNo: value
        }));
      }).catch(() => { // 取消

      });
    }
  };
  Object.assign(formconfig1, formconfig11);
  addProvide(CommonConstants.FORM_DATA_KEY, 'ECargoTerm.cPkId')
});
const getMatterList = async (val:any)=>{
  let  result:any = []
  const r = {
    pageNum: 1,
    pageSize: 9999
  }; //获取分页数据
  let param = Object.assign({cComponentTable:'ECargoGoodsTgt',cEcAgrAppNo:val || ''}, r);
  const res:any  = await cargoApi.selectDistNew(param)
  if(res.code === 200) {
    if(res.data.data.length > 0 ){
      result =  res.data.data
    }
  }
  return result || []
}
const matterChange = async (val:any)=>{
  //获取条款列表
  const cvrgList:any = getFormValue()
  if(!Array.isArray(cvrgList)) return
  if(cvrgList.length === 0) return
  // 获取货物列表
  if (!val) return
 const matterList:any =  await getMatterList(val)

  // 遍历对象数组A
  cvrgList.forEach((item:any) => {
    // 获取ECargoTerm.cGoodsId属性
    const cGoodsId = item['ECargoTerm.cGoodsId']
    // 用逗号拆分字符串并去除空格
    if(cGoodsId){
      const ids = cGoodsId.split(',')
      // 使用拆分后的ID数组过滤数组B
      const goodList = matterList.filter((data:any) => {
        // 将item.id转换为字符串进行比较
        return ids.includes(data['ECargoGoodsTgt.cPkId']);
      });
      if(goodList.length > 0){
        handelCalculate(item,goodList)
      }else{
        handeReset(item)
      }
      console.log('item',item)
      console.log('goodList',goodList)
    }
  });
  console.log('处理逻辑',matterList,cvrgList)
}
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
            cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nRmbAmount',row['_dataId'] , toFixTwo(row['ECargoTerm.nInsuranceAmount'] * res[0].currency_rate) )
          });
    } else {
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nOriginalRate',row['_dataId'] , "1.000000")
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nRmbAmount',row['_dataId'] ,toFixTwo(row['ECargoTerm.nInsuranceAmount'] * 1) )
    }
  },
  nOriginalRateChange:(val:any,row:any)=>{
    if(val && row['ECargoTerm.nInsuranceAmount']){
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nRmbAmount',row['_dataId'] , toFixTwo(row['ECargoTerm.nInsuranceAmount'] * val))
    }
  },
  nFeeRateChange:(val:any,row:any)=>{
    if(val && row['ECargoTerm.nInsuranceFee']){
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nRmbFee',row['_dataId'] , toFixTwo(row['ECargoTerm.nInsuranceFee'] * val))
    }
  },
  cFeeCurrencyChange:(val:any,row:any)=>{
    if(!val) return
    if (val !== "CNY") {
      codeListStore
          .queryCodeList({
            codeListName: "WEB_BAS_CHGRATE",
            codeListParam: { value: val },
          })
          .then((res) => {
            cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nFeeRate',row['_dataId'] , res[0].currency_rate)
            cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nRmbFee',row['_dataId'] , toFixTwo(row['ECargoTerm.nInsuranceFee'] * res[0].currency_rate))
          });
    } else {
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nFeeRate',row['_dataId'] , "1.000000")
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nRmbFee',row['_dataId'] , toFixTwo(row['ECargoTerm.nInsuranceFee'] * 1))
    }
  },
  cInsExchCdeChange:(val:any,row:any)=>{
    val === '1' ? cvrgEditRef.value?.setFormSchema(row._dataId, "ECargoTerm.nOriginalRate", 'disabled', true) :cvrgEditRef.value?.setFormSchema(row._dataId, "ECargoTerm.nOriginalRate", 'disabled', false)
  },
  cPremExchCdeChange:(val:any,row:any)=>{
    val === '1' ? cvrgEditRef.value?.setFormSchema(row._dataId, "ECargoTerm.nFeeRate", 'disabled', true) :cvrgEditRef.value?.setFormSchema(row._dataId, "ECargoTerm.nFeeRate", 'disabled', false)
  },
  funcCvrgCargoDel: () => {
    const selData = cvrgEditRef?.value?.getSelectRow()
    if (!selData) {
      ElMessage.warning("请选择要删除的数据!");
      return;
    }
    const atGroupIdxList = [...getFormValue()].filter((f: any) => f['ECargoTerm.cPlanNo'] === selData['ECargoTerm.cPlanNo']);
    const del = () => {
      atGroupIdxList.forEach((item: any) => {
        cvrgEditRef?.value?.delRow(item['_dataId']);
      })
    }
    if(atGroupIdxList.length > 1) {
      ElMessageBox.confirm('当前操作将会删除整个组的数据，是否删除？', {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        del()
      }).catch(() => {
        // catch error
      })
    }else {
      del()
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
    const selectList = list.map((m: any) => m['ECargoTerm.cGoodsId']).join(',').split(',');
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
        { title: "选择货物", width: 65 }
    );

  },
  //产品名称change
  cProductChange:(val: string, row: any)=>{
    const atGroupIdxList = [...getFormValue()].filter((f: any) => f['ECargoTerm.cPlanNo'] === row['ECargoTerm.cPlanNo']);
    const executeChange = () => {
      atGroupIdxList.forEach((item: any) => {
        if(item['_dataId'] === row['_dataId']) {
          // 保留当前行数据 清除字段值
          item['ECargoTerm.cOriginalCurrency'] = 'CNY'
          item['ECargoTerm.cFeeCurrency'] = 'CNY'
          item['ECargoTerm.nOriginalRate'] = "1.000000"
          item['ECargoTerm.nFeeRate'] = "1.000000"
          item['ECargoTerm.cInsExchCde'] = "1"
          item['ECargoTerm.cPremExchCde'] = "1"
          item['ECargoTerm.cClauseCode'] = ""
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
  cRdrTypChange:(val, row)=>{
    setOptions("ECargoTerm.cClauseCode", row._dataId, row['ECargoTerm.cRdrTyp'] === '0' ? "TERM_LIST_02" : "TERM_LIST_EX", { cProdNo:  row['ECargoTerm.cProdNo'], cRdrTyp: val });
  },
  // 责任初始化事件
  cRiskNoOnInit: (data: any) => {
    const {value, rowData, config, itemRef} = data;
    if (!value || !rowData || !config || !itemRef) return;
    setOptions("ECargoTerm.cRiskNo", rowData._dataId, "RISK_LIST_02", { "cTermNo": rowData['ECargoTerm.cClauseCode']});
  },
  //原币保险金额change事件
  nInsuranceAmountChange:(val)=>{

  },
  //费率change事件
  nRateValChange:(val:any,row:any)=>{
    if(val){
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nInsuranceFee',row['_dataId'] , toFixTwo((row['ECargoTerm.nInsuranceAmount'] * val)/1000))
      cvrgEditRef?.value?.setValueByRowKey('ECargoTerm.nRmbFee',row['_dataId'] , toFixTwo(((row['ECargoTerm.nInsuranceAmount'] * val)/1000) * row['ECargoTerm.nFeeRate']))
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
    const atGroupIdxList = [...getFormValue()].filter((f: any) => f['ECargoTerm.cPlanNo'] === row['ECargoTerm.cPlanNo']);
    const mainTerm: any = {
      riskList: [],
    };
    const clauseList: any[] = [mainTerm];
    atGroupIdxList.forEach((item: any) => {
      const cRdrTyp = item['ECargoTerm.cRdrTyp']
      const cClauseCode = item['ECargoTerm.cClauseCode']
      const cRiskNo = item['ECargoTerm.cRiskNo']
      const rowId = item['_dataId']
      if(cRdrTyp === '0' && !!cRiskNo) {
        mainTerm['Term.cRdrTyp'] = cRdrTyp;
        mainTerm['Term.cClauseCode'] = cClauseCode;
        mainTerm['Term.cRowId'] = rowId;
        mainTerm.riskList.push({ "TermRisktgt.cLiabCode": cRiskNo });
      }else {
        clauseList.push({
          "Term.cRdrTyp": cRdrTyp,
          "Term.cClauseCode": cClauseCode,
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
          isOk: async (selectdata: any) => {
            const addList: any[] = [];
            selectdata.forEach((item: any) => {
              if(item.children && item.children.length > 0) {
                for(const risk of item.children) {
                  const find = atGroupIdxList.find((d: any) => d['ECargoTerm.cClauseCode'] === item.cTermNo && d['ECargoTerm.cRiskNo'] === risk.cRiskNo);
                  if(find) {
                    addList.push(find)
                  }else {
                    addList.push(buildRow({
                      cProdNo: row['ECargoTerm.cProdNo'],
                      cRiskNo: risk.cRiskNo,
                      cRdrTyp: item.cRdrTyp,
                      cClauseCode: item.cTermNo,
                      cPlanNo: row['ECargoTerm.cPlanNo'],
                    }))
                  }
                }
              }else {
                const find = atGroupIdxList.find((d: any) => d['ECargoTerm.cClauseCode'] === item.cTermNo && d['ECargoTerm.cRdrTyp'] === item.cRdrTyp);
                if(find) {
                  addList.push(find)
                }else {
                  addList.push(buildRow({
                    cProdNo: row['ECargoTerm.cProdNo'],
                    cRdrTyp: item.cRdrTyp,
                    cClauseCode: item.cTermNo,
                    cPlanNo: row['ECargoTerm.cPlanNo'],
                  }))
                }
              }
            });
            const list: any[] = [...getFormValue()];
            // 替换数据
            const index = list.findIndex((f: any) => atGroupIdxList[0]['_dataId'] === f['_dataId']);

            const getClauseName = (rowData: any) => {
              return new Promise((resolve, reject) => {
                const cProdNo = rowData['ECargoTerm.cProdNo'];
                const cRdrTyp = rowData['ECargoTerm.cRdrTyp'];
                const cClauseCode = rowData['ECargoTerm.cClauseCode'];
                codeListStore.queryCodeList({
                  codeListName: cRdrTyp === '0' ? "TERM_LIST_02" : "TERM_LIST_EX",
                  codeListParam: { cProdNo: cProdNo, cRdrTyp: cRdrTyp },
                }).then((res) => {
                  resolve(res.find(f => f['value'] === cClauseCode)?.label)
                });
              })
            }
            for(const rowData of addList) {
              const name = await getClauseName(rowData)
              rowData['ECargoTerm.cClauseName'] = name;
            }
            cvrgEditRef.value?.spliceTableData(index, atGroupIdxList.length, listSort(addList));
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
  res['ECargoTerm.cOriginalCurrency'] = 'CNY'
  res['ECargoTerm.cFeeCurrency'] = 'CNY'
  res['ECargoTerm.nOriginalRate'] = "1.000000"
  res['ECargoTerm.nFeeRate'] = "1.000000"
  res['ECargoTerm.cInsExchCde'] = "1"
  res['ECargoTerm.cPremExchCde'] = "1"
  res['ECargoTerm.cProdNo'] = data.cProdNo
  res['ECargoTerm.cClauseCode'] = data.cClauseCode
  res['ECargoTerm.cRdrTyp'] = data.cRdrTyp
  res['ECargoTerm.cPlanNo'] = data.cPlanNo
  res['ECargoTerm.cRiskNo'] = data.cRiskNo
  return res;
};

const listSort = (list: any[]) => {
  // 创建比较器提高性能（特别对大数组）
  const collator = new Intl.Collator('zh-CN');
  // 排序 保证合并单元格的规则正常进行
  return list.sort((x, y) => {
    const groupCompare = collator.compare(x['ECargoTerm.cPlanNo'], y['ECargoTerm.cPlanNo'])
    if(groupCompare !== 0) {
      return 1;
    }
    return Number(x['ECargoTerm.cRdrTyp']) - Number(y['ECargoTerm.cRdrTyp'])
  })
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
      } else if(key === 'cPlanNo'){
        mergedAction(isMerged('ECargoTerm.cPlanNo', item, list[index - 1]), index)
      } else if(key === 'cProdNo'){
        mergedAction(isMerged('ECargoTerm.cProdNo', item, list[index - 1], item['ECargoTerm.cPlanNo'] === list[index - 1]['ECargoTerm.cPlanNo']), index)
      }else if(key === 'cRdrTyp'){
        mergedAction(isMerged('ECargoTerm.cRdrTyp', item, list[index - 1], item['ECargoTerm.cPlanNo'] === list[index - 1]['ECargoTerm.cPlanNo']), index)
      }else if(key === 'cClauseCode'){
        mergedAction(isMerged('ECargoTerm.cClauseCode', item, list[index - 1], item['ECargoTerm.cPlanNo'] === list[index - 1]['ECargoTerm.cPlanNo'] && item['ECargoTerm.cRdrTyp'] === list[index - 1]['ECargoTerm.cRdrTyp']), index)
      }
    })
  }
  return idxArr;
}

const spanMethod = (obj: any, expandRowKeys: string[]) => {
  const { row, column, rowIndex, columnIndex } = obj;
  let list;
  if (columnIndex === 1) {
    list = calculateSpans('cPlanNo', expandRowKeys)
  }else if (columnIndex === 2) {
    list = calculateSpans('cProdNo', expandRowKeys);
  }else if (columnIndex === 3) {
    list = calculateSpans('cRdrTyp', expandRowKeys);
  }else if (columnIndex === 4) {
    list = calculateSpans('cClauseCode', expandRowKeys);
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
  setFormValue(listSort(list))
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
  return new Promise(async resolve => {
    const list = getFormValue();
    if(!list || list.length === 0) {
      resolve(false);
    }
    const flag = await cvrgEditRef?.value?.validate();
    resolve(flag);
  })
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
function addProvide<T>(key: InjectionKey<T> | string, value: T)  {
  cvrgEditRef?.value?.addProvide(key, value);
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
  getTableBtn,
  addProvide
});
</script>

<style scoped></style>

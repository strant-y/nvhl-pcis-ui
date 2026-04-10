<template>
  <app-grid-edit :gridEditConfig="formconfig1" ref="planEditRef" />
  <comDialog ref="dialog"></comDialog>
</template>

<script setup lang="ts">
import { formInit } from "@/shared/from-init";
import {
  AppGridEditMethod,
  createAppGridEditConfig,
} from "@/shared/app-grid-edit-config";
import {ref} from "vue";
import {codeListViewStore, dataOpertaor} from "@/store";
import {DialogMethod} from "@/common/dzmodel/ComDialogConf";
import {CommonConstants} from "@/constants/CommonConstants";
import {idxParamKey, useIdxParam} from "@/views/pcis/support/useIdxParam";

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const idxParam = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const dialog = ref<DialogMethod | null>(null);
const planEditRef = ref<AppGridEditMethod | null>(null);
const formconfig1 = reactive<any>(createAppGridEditConfig({}));

onMounted(() => {
  const tableConfig = {
    editFlag: true,
    fromSchema: [],
    icon: "null",
    title: "方案数据",
    titleBtns: [],
  };
  tableConfig.fromSchema.forEach((item: any) => {
    if(item.readonly === 1) {
      item.disabled = true;
    }
    if(item.cShowLocation === '2') {
      item.isShow = false
    }
  });
  console.log('plan-tableConfig', tableConfig)
  const formconfig11 = formInit(
      JSON.stringify(tableConfig),
      method,
      exRules
  );

  formconfig1.stripe = false;
  formconfig1.spanMethod = spanMethod;
  formconfig1.currentChange = currentChange;
  formconfig1.showPosition = 'right';
  Object.assign(formconfig1, formconfig11);
  addProvide(CommonConstants.FORM_DATA_KEY, 'PlanBase.cPkId')
});

// 绑定方法
const method = {

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
  }).then((res: any) => {
    planEditRef.value?.addCodeListMap({
      code: key + rowId,
      list: res,
    });
  });
}


const listSort = (list: any[]) => {
  // 创建比较器提高性能（特别对大数组）
  const collator = new Intl.Collator('zh-CN');
  // 排序 保证合并单元格的规则正常进行
  return list.sort((x, y) => {
    const groupCompare = collator.compare(x['PlanBase.cPlanNo'], y['PlanBase.cPlanNo'])
    if(groupCompare !== 0) {
      return 1;
    }
    return Number(x['PlanBase.nSeqNo']) - Number(y['PlanBase.nSeqNo'])
  })
};

// 计算合并行数
const calculateSpans = (key: string, expandRowKeys: string[]) => {
  const idxArr: number[] = [];
  const list = getFromValue();

  if(list && list.length > 1) {
    let mergedRowIdx = 0;
    const isMerged = (prop: string,item1: any, item2: any, other: boolean = true): boolean => {
      const selectRow = planEditRef.value?.getSelectRow();
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
      } else if(key === 'cPlanNme'){
        mergedAction(isMerged('PlanBase.cPlanNme', item, list[index - 1]), index)
      } else if(key === 'nAppCopies'){
        mergedAction(isMerged('PlanBase.nPrm', item, list[index - 1], item['PlanBase.cPlanNme'] === list[index - 1]['PlanBase.cPlanNme']), index)
      } else if(key === 'nAppPersons'){
        mergedAction(isMerged('PlanBase.nAmt', item, list[index - 1], item['PlanBase.cPlanNme'] === list[index - 1]['PlanBase.cPlanNme']), index)
      } else if(key === 'nPrm'){
        mergedAction(isMerged('PlanBase.nPrm', item, list[index - 1], item['PlanBase.cPlanNme'] === list[index - 1]['PlanBase.cPlanNme']), index)
      } else if(key === 'nAmt'){
        mergedAction(isMerged('PlanBase.nAmt', item, list[index - 1], item['PlanBase.cPlanNme'] === list[index - 1]['PlanBase.cPlanNme']), index)
      }
    })
  }
  return idxArr;
}

const spanMethod = (obj: any, expandRowKeys: string[]) => {
  const { row, column, rowIndex, columnIndex } = obj;
  let list;
  if (columnIndex === 1) {
    list = calculateSpans('cPlanNme', expandRowKeys)
  } else if (columnIndex === 6) {
    list = calculateSpans('nAppCopies', expandRowKeys);
  } else if (columnIndex === 7) {
    list = calculateSpans('nAppPersons', expandRowKeys);
  } else if (columnIndex === 10) {
    list = calculateSpans('nPrm', expandRowKeys);
  } else if (columnIndex === 11) {
    list = calculateSpans('nAmt', expandRowKeys);
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
  const list = getFromValue();
  setFormValue(listSort(list))
}

// 绑定特殊验证器
const exRules = {};


function calculateData(list: any[]): any[] {
  let nPrm = 0;
  let nAmt = 0;
  let nAppPersons = 0;
  const yjxGrpMemberList = opertaor.getTableRefs()['yjxGrpMember'].getFormValue()
  if(yjxGrpMemberList) {
    nAppPersons = yjxGrpMemberList.length
  }
  const planList = [...list].map((item: any, index: number) => {
    const nSumPrm = item['PlanBase.nPerPrm'] * nAppPersons
    const nSumAmt = item['PlanBase.nPerAmt'] * nAppPersons
    nPrm += nSumPrm
    nAmt += nSumAmt
    return {
      ...item,
      ...{
        'PlanBase.nSumPrm': nSumPrm,
        'PlanBase.nSumAmt': nSumAmt,
        'PlanBase.nAppCopies': 1,
        'PlanBase.nAppPersons': nAppPersons,
        'PlanBase.nSeqNo': index + 1,
      }
    }
  });
  planList.forEach((item: any) => {
    item['PlanBase.nAmt'] = nAmt;
    item['PlanBase.nPrm'] = nPrm;
  })
  return planList
}

function refushData() {
  const list = calculateData(getFromValue())
  planEditRef?.value?.setFormValue(list);
}

function getFromValue() {
  return planEditRef?.value?.getFromValue();
}
function setFormValue(value: any) {
  const list = calculateData(value)
  planEditRef?.value?.setFormValue(list);
}

function validate() {
  return new Promise(async resolve => {
    const list = getFromValue();
    if(!list || list.length === 0) {
      resolve(false);
    }
    const flag = await planEditRef?.value?.validate();
    resolve(flag);
  })
}

function getTableValue(rowId: number, key: string) {
  planEditRef?.value?.getTableValue(rowId, key);
}

function getFormConfig() {
  return formconfig1;
}
//给表单赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item: any) => {
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
  return planEditRef?.value?.getFormBtn();
}
function getTableBtn() {
  return planEditRef?.value?.getTableBtn();
}
function setDisabledAll(isDisabled: boolean) {
  planEditRef?.value?.setDisabledAll(isDisabled);
}
function addProvide<T>(key: InjectionKey<T> | string, value: T)  {
  planEditRef?.value?.addProvide(key, value);
}
defineExpose({
  getFromValue,
  setFormValue,
  validate,
  getTableValue,
  getFormConfig,
  setFormItem,
  getFormBtn,
  setDisabledAll,
  getTableBtn,
  addProvide,
  refushData
});
</script>

<style scoped></style>

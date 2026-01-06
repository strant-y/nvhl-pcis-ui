<template >
  <app-grid-edit :gridEditConfig="formconfig1" ref="payinfoEditRef" />
</template>

<script setup lang="ts">
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useRoute } from "vue-router";
const route = useRoute();
import {
  AppGridEditMethod,
  createAppGridEditConfig,
} from "@/shared/app-grid-edit-config";
import { numAdd } from "@/utils/Math";

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

const idxParam = inject('idxParam');
const formPage = idxParam?.formPage;
const param = idxParam?.param;

const payinfoEditRef = ref<AppGridEditMethod | null>(null);
const formconfig1 = reactive(createAppGridEditConfig({}));
// ECargoBase.cCiMrk  联共保 字段   0 5非共保    1 2 主联   3 4 无联保  
// ECargoBase.nCiOwnPrm   我司保费

const watchSource = computed(() => {
  // const data = opertaor.getDataAll();
  // const cCiMrk = data.plyBase?.['ECargoBase.cCiMrk']; 
  // const nCiOwnPrm = ['1', '2', '3', '4'].includes(cCiMrk) ? parseInt( data.ciMasterAgreement?.['ECargoBase.nCiOwnPrm']).toFixed(2): parseInt( data.base?.['ECargoBase.nPrm']).toFixed(2) ;
  // // 返回“值类型”组合（而非新对象），避免引用变化导致的误触发
  // return [cCiMrk, nCiOwnPrm];
});

watch(
  watchSource,
  ([newCCiMrk, newNCiOwnPrm], [oldCCiMrk, oldNCiOwnPrm]) => {
        // console.log('watch’',newCCiMrk, newNCiOwnPrm,oldCCiMrk, oldNCiOwnPrm)
    if (newCCiMrk === oldCCiMrk && newNCiOwnPrm === oldNCiOwnPrm) {
      return; // 值没变，直接退出，不执行后续逻辑
    }
    nextTick(() => {
      nPrmFun();
    })
  },
  { deep: false, immediate: false }
);

// 我司保费变化后进行处理
const nPrmFun = () => {
  if (getFromValue()?.length > 0) {
    const data = formPage?.getAllFormData();
    // 比例
    let nCiShare = Number(getOwnShare()) || 1;
    const totalAmount = Number(data['base']['ECargoBase.nPrm']);
    const splitCount = Number(data.base?.['ECargoBase.nPayNum']) || 1
    const totalCent = Math.round(totalAmount * 100);
    const result = ref<number[]>([]);
    const quotient = Math.floor(totalCent / splitCount);
    const remainder = totalCent % splitCount;


    result.value = Array(splitCount).fill(quotient);
    if (remainder > 0) {
      result.value[0] += remainder;
    }

    result.value = result.value.map(cent => parseFloat((cent / 100).toFixed(2)));
    const formArray = getFromValue();
    const limitLength = Number(data['base']['ECargoBase.nPayNum']) || 0; // 示例: 3
  
    const modifiedArray = formArray.map((item: any, index: any) => {
      // 超出限制长度的元素：直接返回原对象（不修改）
      if (index >= limitLength) {
        return item;
      }
      return {
        ...item, // 保留原有其他属性
        "ECargoPay.nOwnPrm": item['ECargoPay.nPayablePrm'] ? parseFloat((item['ECargoPay.nPayablePrm'] * nCiShare ).toFixed(2)) : 0,
      };
    });

    const cCiMrk = ['0', '5'].includes(data.AgreementBase?.['ECargoBase.cCiMrk']);  // 是否   联共保
    if (!cCiMrk) {
      let num = modifiedArray.slice(0, -1).reduce((sum, item) => {
        const amount = Number(item['ECargoPay.nOwnPrm']) || 0;
        return sum + amount
      }, 0)

      const nCiOwnPrm = data.ciMasterAgreement?.['ECargoBase.nCiOwnPrm']   // 联共保 我司保费
      let differNum = nCiOwnPrm - num || 0// 差额

      // modifiedArray[splitCount - 1]['ECargoPay.nOwnPrm'] = modifiedArray[splitCount - 1]['ECargoPay.nOwnPrm'] + differNum
      modifiedArray[splitCount - 1]['ECargoPay.nOwnPrm'] = differNum
    }
    setFormValue(modifiedArray)
  }
}

// 获取我司比例
const getOwnShare = () => {

  let ownShare = 0;
  const data = formPage?.getAllFormData();
  let ciArr = data['ci']
  //  const cCiMrk = data.plyBase?.['ECargoBase.cCiMrk'];
  if (ciArr && ciArr.length > 0) {
    ciArr.forEach((item: any) => {
      const CDptMrk = item['Ci.cCoinsurerCde']
      if (!!CDptMrk && CDptMrk === "327001") {
        ownShare = numAdd(ownShare, item['Ci.nCiShare'])
      }
    })
  }
  return ownShare;
}

onMounted(() => {

  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
});

// 绑定方法
const method = {
  // func demo
  func1: () => { },
  funcpayadd: () => {
    const baseBefore = formPage?.getComponentRefById('AgreementBase')?.getFormValue();
    const applicantBefore = formPage?.getComponentRefById('AgreementApplicant')?.getFormValue();
    const insrncBefore = formPage?.getComponentRefById('AgreementFeeWarn')?.getFormValue();
    const val = getFromValue()
    if (baseBefore['ECargoBase.cInstMrk'] === '0' && val.length === 1) {
      ElMessage.error('付费约定为一次交清，只能录入一条！');
      return false;
    }
    if (val.length >= 12) {
      ElMessage.error('“缴费计划”不能超过12期！');
      return false;
    }
    payinfoEditRef?.value?.addRow();
    if (val) {
      let obj = {
        'ECargoPay.nTms': val.length,
        'ECargoPay.cPayorCde': applicantBefore['AgreementApplicant.cAppCde'] || null,
        'ECargoPay.cPayorNme': applicantBefore['AgreementApplicant.cAppNme'] || null,
        'ECargoPay.tPayBgnTm': insrncBefore['ECargoBase.tInsrncBgnTm'],
        'ECargoPay.tPayEndTm': insrncBefore['ECargoBase.tInsrncEndTm'],
        'ECargoPay.nOwnPrm': insrncBefore['ECargoBase.cPayWay'] === '01' ? baseBefore['ECargoBase.nCiOwnRmbReceivedPrm'] || 0 : baseBefore['ECargoBase.nCiOwnRmbPrm'] || 0,
      }
      val[val.length - 1] = { ...val[val.length - 1], ...obj }
    }

  },
  funcpaydel: () => {
    const selData = payinfoEditRef?.value?.getSelectRow()
    if (!selData) {
      ElMessage.error("请选择要删除的数据!");
      return;
    }
    const editIndex = selData['_dataId']

    payinfoEditRef?.value?.delRow(editIndex);
    const val = getFromValue()
    val.forEach((key, index) => {
      key['ECargoPay.nTms'] = index + 1;



    });
  },
  // 缴费计划
  nPayablePrmFun: (val: any) => {
    const data = formPage?.getAllFormData();
    const cCiMrk = ['0', '5'].includes(data.AgreementBase?.['ECargoBase.cCiMrk']);  // 是否   联共保
    let nCiShare = Number(getOwnShare()) || 1;
    let num = 0;
    getFromValue().forEach((item: any) => {
      item['ECargoPay.nPayablePrm'] = item['ECargoPay.nPayablePrm'] || 0;
      item['ECargoPay.nOwnPrm'] = item['ECargoPay.nPayablePrm'] ? parseFloat((item['ECargoPay.nPayablePrm'] * nCiShare ).toFixed(8)) : 0
      num += item['ECargoPay.nOwnPrm']
   })
    console.log('差额', getFromValue()[getFromValue().length - 1])
    if (!cCiMrk) {
      const nCiOwnPrm = data.ciMasterAgreement?.['ECargoBase.nCiOwnPrm']   // 联共保 我司保费
      let differNum = nCiOwnPrm - num // 差额
      getFromValue()[getFromValue().length - 1]['ECargoPay.nOwnPrm'] = getFromValue()[getFromValue().length - 1]['ECargoPay.nOwnPrm'] + differNum
    }
  }
};

// 绑定特殊验证器
const exRules = {};

function getFormValue() {
  return payinfoEditRef?.value?.getFromValue();
}

function getFromValue() {
  return payinfoEditRef?.value?.getFromValue();
}

function setDisabledAll(isDisabled: boolean) {
  payinfoEditRef?.value?.setDisabledAll(isDisabled);
}

function setFormValue(value: any) {
  payinfoEditRef?.value?.setFormValue(value);
}

function validate() {
  return payinfoEditRef?.value?.validate();
}

function getTableValue(rowId: number, key: string) {
  payinfoEditRef?.value?.getTableValue(rowId, key);
}

function getFormconfig() {
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
function addProvide<T>(key: InjectionKey<T> | string, value: T) {
  payinfoEditRef?.value?.addProvide(key, value);
}
defineExpose({
  getFormValue,
  setFormValue,
  validate,
  getTableValue,
  getFormconfig,
  setFormItem,
  // splitnPrm,
	addProvide,
	setDisabledAll,
});
</script>

<style scoped>
  ::v-deep .el-table td.el-table__cell div {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
  }


</style>

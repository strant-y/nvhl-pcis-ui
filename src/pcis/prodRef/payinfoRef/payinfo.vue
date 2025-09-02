<template>
  <app-grid-edit :gridEditConfig="formconfig1" ref="payinfoEditRef" />
</template>

<script setup lang="ts">
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useRoute } from "vue-router";
import { idxParamKey, IdxParamProps, useIdxParam } from "@/views/pcis/support/useIdxParam";

const route = useRoute();
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
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

const payinfoEditRef = ref<AppGridEditMethod | null>(null);
const formconfig1 = reactive(createAppGridEditConfig({}));
// Base.cCiMrk  联共保 字段   0 5非共保    1 2 主联   3 4 无联保  
// Base.nCiOwnPrm   我司保费

const watchSource = computed(() => {
  const data = opertaor.getDataAll();
  const cCiMrk = data.plyBase?.['Base.cCiMrk'];
  const nCiOwnPrm = ['1', '2', '3', '4'].includes(cCiMrk) ? data.ciMasterAgreement?.['Base.nCiOwnPrm'] : data.base?.['Base.nPrm'];
  // 返回“值类型”组合（而非新对象），避免引用变化导致的误触发
  return [cCiMrk, nCiOwnPrm];
});

watch(
  watchSource,
  ([newCCiMrk, newNCiOwnPrm], [oldCCiMrk, oldNCiOwnPrm]) => {
    if (newCCiMrk === oldCCiMrk && newNCiOwnPrm === oldNCiOwnPrm) {
      return; // 值没变，直接退出，不执行后续逻辑
    }
    if (['1', '2', '3', '4'].includes(newCCiMrk) && newCCiMrk !== oldCCiMrk) {
      // setFormItem()
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
    const data = opertaor.getDataAll();
    // 比例
    let nCiShare = Number(getOwnShare()) || 100;
    const totalAmount = Number(data['base']['Base.nPrm']);
    const splitCount = Number(data.base?.['Base.nPayNumber'])
    const totalCent = Math.round(totalAmount * 100);
    const result = ref<number[]>([]);
    const quotient = Math.floor(totalCent / splitCount);
    const remainder = totalCent % splitCount;
    result.value = Array(splitCount).fill(quotient);
    if (remainder > 0) {
      result.value[0] += remainder;
    }

    result.value = result.value.map(cent => parseFloat((cent / 100).toFixed(8)));
    const formArray = getFromValue();
    const limitLength = Number(data['base']['Base.nPayNumber']) || 0; // 示例: 3
    const modifiedArray = formArray.map((item: any, index: any) => {
      // 超出限制长度的元素：直接返回原对象（不修改）
      if (index >= limitLength) {
        return item;
      }
      return {
        ...item, // 保留原有其他属性
        "Pay.nOwnPrm": item['Pay.nPayablePrm'] ? parseFloat((item['Pay.nPayablePrm'] * (nCiShare / 100)).toFixed(8)) : 0,
      };
    });

    const cCiMrk = ['0', '5'].includes(data.plyBase?.['Base.cCiMrk']);  // 是否   联共保
    if (!cCiMrk) {
      let num = modifiedArray.reduce((sum, item) => {
        const amount = Number(item['Pay.nOwnPrm']) || 0;
        return sum + amount
      }, 0)

      const nCiOwnPrm = data.ciMasterAgreement?.['Base.nCiOwnPrm']   // 联共保 我司保费
      let differNum = nCiOwnPrm - num || 0// 差额

      modifiedArray[splitCount - 1]['Pay.nOwnPrm'] = modifiedArray[splitCount - 1]['Pay.nOwnPrm'] + differNum
    }

    setFormValue(modifiedArray)
  }
}

// 获取我司比例
const getOwnShare = () => {

  let ownShare = 0;
  const data = opertaor.getDataAll();
  let ciArr = data['ci']
  //  const cCiMrk = data.plyBase?.['Base.cCiMrk'];
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
    const tabref = opertaor.getTableRefs();
    const baseBefore = tabref["base"].getFromValue();
    const applicantBefore = tabref["applicant"].getFromValue();
    const insrncBefore = tabref["insrnc"].getFromValue();
    const val = getFromValue()
    if (baseBefore['Base.cInstMrk'] === '0' && val.length === 1) {
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
        'Pay.nTms': val.length,
        'Pay.cPayorCde': applicantBefore['Applicant.cAppCde'] || null,
        'Pay.cPayorNme': applicantBefore['Applicant.cAppNme'] || null,
        'Pay.tPayBgnTm': insrncBefore['Base.tInsrncBgnTm'],
        'Pay.tPayEndTm': insrncBefore['Base.tInsrncEndTm'],
        'Pay.nOwnPrm': baseBefore['Base.nPrm'],
      }
      val[val.length - 1] = { ...val[val.length - 1], ...obj }
      //   val.forEach((key, index) => {
      //     key['Pay.nTms'] = index + 1
      //     key['Pay.cPayorCde'] =applicantBefore['Applicant.cAppCde'] || null ;
      //     key['Pay.cPayorNme'] = applicantBefore['Applicant.cAppNme'] || null;
      //     key['Pay.tPayBgnTm'] = insrncBefore['Base.tInsrncBgnTm'];
      //     key['Pay.tPayEndTm'] = insrncBefore['Base.tInsrncEndTm'];
      //     // key['Pay.nOwnPrm'] = baseBefore['Base.nPrm'];
      // });
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
      key['Pay.nTms'] = index + 1;



    });
  },
  // 缴费计划
  nPayablePrmFun: (val: any) => {

    const data = opertaor.getDataAll();
    const cCiMrk = ['0', '5'].includes(data.plyBase?.['Base.cCiMrk']);  // 是否   联共保
    let nCiShare = Number(getOwnShare()) || 100;
    let num = 0;
    getFromValue().forEach((item: any) => {
      item['Pay.nPayablePrm'] = item['Pay.nPayablePrm'] || 0;
      item['Pay.nOwnPrm'] = item['Pay.nPayablePrm'] ? parseFloat((item['Pay.nPayablePrm'] * (nCiShare / 100)).toFixed(8)) : 0
      num += item['Pay.nOwnPrm']
      //  "Pay.nOwnPrm": item['Pay.nPayablePrm']?  parseFloat((item['Pay.nPayablePrm'] * (nCiShare/100) ).toFixed(2)):0,
    })
    console.log('差额', getFromValue()[getFromValue().length - 1])
    if (!cCiMrk) {
      const nCiOwnPrm = data.ciMasterAgreement?.['Base.nCiOwnPrm']   // 联共保 我司保费
      let differNum = nCiOwnPrm - num // 差额
      getFromValue()[getFromValue().length - 1]['Pay.nOwnPrm'] = getFromValue()[getFromValue().length - 1]['Pay.nOwnPrm'] + differNum
    }
  }
  // Pay.nPayablePrm
  //缴费止期控制
  // tPayEndTmDisabled: (date: any) => {
  //   return  date.getTime() <new Date( opertaor.getTableRefs()["insrnc"].getValue("Base.tInsrncEndTm").replace(/-/g, '/')).getTime()
  // },
};

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return payinfoEditRef?.value?.getFromValue();
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
  getFromValue,
  setFormValue,
  validate,
  getTableValue,
  getFormconfig,
  setFormItem,
  // splitnPrm,
  addProvide
});
</script>

<style scoped></style>

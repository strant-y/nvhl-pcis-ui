<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="agentTgtEditRef" />
</template>

<script setup lang="ts">
import {AppFreeEditMethod, createAppFreeEditConfig,} from "@/shared/app-free-edit-config";
import {formInit} from "@/shared/from-init";
import {dataOpertaor} from "@/store/modules/data-opertaor";
import {useProductStore} from "@/store/modules/prod";
import {useValidator} from "@/typings/useValidator";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
import { codeListViewStore } from "@/store";
const dzmodal = useDzModal();
const surveyInfo = defineAsyncComponent(
  () => import("@/views/comprehensive-query/modal/survey-info-modal.vue")
);
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());

const opertaor = dataOpertaor(idxParam.opertaorProps);
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const { getRules } = useValidator();
const productStore = useProductStore();
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

const agentTgtEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));

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
  func1: () => {},
  cCheckerCdeFunc: () => {
    dzmodal.open(surveyInfo, { type: "departure", data: {} }).then((res: any) => {
      if (res.type === "ok") {
        setValue("Tgt.cCheckerCde",res.body.cSryDoc);   // 代理人
        setValue("Tgt.cAddr",res.body.cAddr);   // 大洲
        // setValue("Tgt.cCountry",res.body.id);  // ?国家
        nextTick(()=>{
          setValue("Tgt.cAraCde",res.body.cAraCde); // ?国家
          nextTick(()=>{
            setValue("Tgt.cCtyCnm", res.body.cCtyCnm);  // 城市
            setValue("Tgt.cCode",  res.body.cSrvyCde);  // 城市
          })
        })
      };
    });
  },
  // 大洲
  cAddrChange: (val:any) => {
    setValue('Tgt.cAraCde','')
    if (val) {
      codeListStore.queryCodeList({
        codeListName: "Continent_Country",
        codeListParam: {cAddr: val},
      }).then((res) => {
        setFormItem('Tgt.cAraCde', { loadData: res })
      });
    } else {
      setFormItem('Tgt.cAraCde', { loadData: [] })
    }
  },
  // 国家
  cAraCdeChange: (val:any) => {
    setValue('Tgt.cCtyCnm','')
    if (val) {
      codeListStore.queryCodeList({
        codeListName: "Country_City",
        codeListParam: {cAddr: getValue('Tgt.cAddr'), cAraCde: val},
      }).then((res) => {
        setFormItem('Tgt.cCtyCnm', { loadData: res })
      });
    } else {
      setFormItem('Tgt.cCtyCnm', {loadData: []})
    }
  },
};
// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return agentTgtEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  agentTgtEditRef?.value?.setFormValue(value);
}

function validate() {
  return agentTgtEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  agentTgtEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return agentTgtEditRef?.value?.getValue(key);
}
const setFormItem = (key, obj) => {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.loadData && obj.loadData) {
          let newBtnItems = null;
          if (obj.loadData.length != 0) {
            for (let key in obj.loadData) {
              item.loadData[key] = obj.loadData[key];
            }
          } else {
            item.loadData = obj.loadData;
          }
          newBtnItems = item.loadData;
          newBtnItems && (obj.loadData = newBtnItems);
        }
        Object.assign(item, obj);
      }
    });
  }
}
function getFormconfig(){
  return formconfig1;
}
defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig
});
</script>

<style scoped></style>

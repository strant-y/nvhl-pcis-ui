<!-- 标的信息 -->
<template>
  <app-free-edit :freeEditConfig="formconfig1" ref="accidentPrevEditRef" />
  <comDialog ref="dialog"></comDialog>
</template>

<script setup lang="ts">
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useProductStore } from "@/store/modules/prod";
import { useValidator } from "@/typings/useValidator";
import { useRouter, useRoute } from 'vue-router';
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { getAddressStr } from "@/api/query";
import { codeListViewStore } from "@/store";
import { distRequiredMap } from '@/views/pcis/my-page/requiredDistMap';
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const route = useRoute();

const query = ref(route.query);
const router = useRouter();
const { getRules } = useValidator();

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const params = opertaor.getParam();
const productStore = useProductStore()
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const dialog = ref<DialogMethod | null>(null);

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
onMounted(() => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
});

const accidentPrevEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive(createAppFreeEditConfig({}));

// 绑定方法
const method = {
  
  func1: () => {
  },
  funccDetailsAccident: () => { 
    dialog.value?.open('detailsAccident', {
      selectedData: getValue("Tgt.cFinanceCde"), //需要把自定义的过滤掉，只传过去从模板中选择的
    },
      {
        getSelected(selectdata: any) {
          setValue("Tgt.cFinanceCde", selectdata.map(item => item.value).join(','))
          setValue("Tgt.cDetailsAccident", selectdata.map((item, index) => `${index + 1}. ${item.label}`).join('\n'))
        },
      }, { width: 45 });
  },
};

// 绑定特殊验证器
const exRules = {};
function getFromValue() {
  return accidentPrevEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  accidentPrevEditRef?.value?.setFormValue(value);
}

function validate() {
  return accidentPrevEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  accidentPrevEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return accidentPrevEditRef?.value?.getValue(key);
}
function clearValidate(key = null) {
  accidentPrevEditRef?.value?.clearValidate(key);
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
        } else {
          Object.assign(item, obj);
        }
      }
    });
  }
}

function getFormconfig() {
  return formconfig1;
}


defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig,
  clearValidate,
});
</script>

<style scoped></style>

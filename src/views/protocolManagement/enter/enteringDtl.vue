<!-- ECargo协议录入-->
<template>
  <detail-component :bth-list="bthList"/>
</template>
<script setup lang="ts">
import cargoApi from '@/api/cargo';
import {createFreeButtonBase, FreeButtonBase} from "@/shared/button-config";
import {FormPage} from "@/views/protocolManagement/utils/form-page";
import detailComponent from "../components/detail-component.vue";
import {EnteringCompList} from "@/views/protocolManagement/utils/types";

const props = defineProps({
  param: {
    type: Object,
  },
  type: {
    type: String
  }
});
const formPage = ref(new FormPage('enteringDtl'));
const resData = ref({});
const idxParam = reactive({
  formPage: formPage.value,
  param: { ...props.param, ...{}},
  user: JSON.parse(sessionStorage.getItem("user")),
  ciJiMrk: '0',
  readonly: computed(() => ['view'].includes(props.type)),
});
provide('idxParam', idxParam);

const bthList = ref<FreeButtonBase[]>([
  createFreeButtonBase({
    label: "保存",
    type: "primary",
    id: "save",
    func: () => {
      save();
    },
  }),
  createFreeButtonBase({
    label: "提交",
    type: "primary",
    id: "submit",
    func: () => {
      submit();
    },
  }),
]);

onBeforeMount(async () => {
  const res = await cargoApi.getECargoPageView({
      'compKeyList': EnteringCompList.map(item => item.tab)
  });
  console.log('getECargoPageView-res', res)
  const config = res.data;
  config[0].pageInfo.forEach((comp: any) => {
    const it = EnteringCompList.find(f => f.tab === comp.pageCode);
    comp['sort'] = it.sort;
  });
  // 排序
  config[0].pageInfo = config[0].pageInfo.sort((a, b) => a.sort - b.sort)
  // 页面初始化
  formPage.value?.setFormConfig(config);
  query();
  console.log('页面初始化',formPage.value)
});

onMounted(() => {
  console.log(idxParam.readonly);
});


function query() {
  cargoApi.init({
    ...idxParam.param,
    ...{}
  }).then((res: any) => {
    if(res.code === 200) {
      ElMessage.success('查询成功');
      formPage.value?.setAllFormData(res.data);
    }else {
      ElMessage.error(res.msg);
    }
  });
  if(idxParam.readonly === true) {
    formPage.value?.setPageReadOnly(true);
    const submitBtn = formPage.value?.getPageBtnRefById('submit')?.getConfig();
    submitBtn.disabled = true;
    const saveBtn = formPage.value?.getPageBtnRefById('save')?.getConfig();
    saveBtn.disabled = true;
  }
}

function save() {
  const allFromData = formPage.value?.getAllFormData();
  const user = JSON.parse(sessionStorage.getItem("user"));
  console.log('allFromData', allFromData);
  // ElMessage.warning('保存');
  cargoApi.save({
    ...allFromData,
    ...{},
    ...{user},
    sence:'save'
  }).then((res: any) => {
    if(res.code === 200) {
      ElMessage.success('保存成功')
      console.log('res', res);
      // console.log('000', formPage.value.getComponentConfigById("AgreementBase"))
      console.log('resss',res.res['composition']['ECargoBase'][0])
      resData.value = res.res['composition']['ECargoBase'][0]
      const agreementBaseRef = formPage.value?.getComponentRefById('AgreementBase')
      agreementBaseRef.setValue('ECargoBase.cEcAgrNo', resData.value['ECargoBase.cEcAgrNo'])
      agreementBaseRef.setValue('ECargoBase.cEcAgrAppNo', resData.value['ECargoBase.cEcAgrAppNo'])
      console.log('resData', resData.value);
    }else {
      ElMessage.success(res.msg);
    }
  });
}

function submit() {
  const allFromData = formPage.value?.getAllFormData();
  const user = JSON.parse(sessionStorage.getItem("user"));
  // ElMessage.warning('提交');

  // console.log("000",resData.value.ECargoBase);
  // 从 resData 提取所需字段并合并进 AgreementBase
  const { 
    'ECargoBase.cEcAgrNo': cEcAgrNo,
    'ECargoBase.cEcAgrAppNo': cEcAgrAppNo,
  } = resData.value?.ECargoBase || {}

  if (allFromData && allFromData.AgreementBase) {
    allFromData.AgreementBase = {
      ...allFromData.AgreementBase,
      'ECargoBase.cEcAgrNo': cEcAgrNo,
      'ECargoBase.cEcAgrAppNo': cEcAgrAppNo,
    };
  }
  cargoApi.submit({
    ...allFromData,
    ...{},
    ...{user},
    sence:'save'
  }).then((res: any) => {
    if(res.code === 200) {
      ElMessage.success('提交成功')
      formPage.value.setPageReadOnly(true);
      const submitBtn = formPage.value.getPageBtnRefById('submit')?.getConfig();
      submitBtn.disabled = true;
    }else {
      ElMessage.success(res.msg);
    }
  });
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
<style lang="scss" scoped>
</style>
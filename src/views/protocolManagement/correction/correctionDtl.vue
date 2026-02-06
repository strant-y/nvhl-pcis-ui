<!-- ECargo协议批改-->
<template>
  <detail-component :bth-list="bthList"/>
</template>
<script setup lang="ts">
import cargoApi from '@/api/cargo';
import {createFreeButtonBase, FreeButtonBase} from "@/shared/button-config";
import {FormPage} from "@/views/protocolManagement/utils/form-page";
import detailComponent from "../components/detail-component.vue";
import {CorrectionCompList} from "@/views/protocolManagement/utils/types";
import {idxParamKey} from "@/views/pcis/support/useIdxParam";

const props = defineProps({
  param: {
    type: Object,
  },
  type: {
    type: String
  }
});
const formPage = ref(new FormPage('correctionDtl'));
const idxParam = reactive({
  formPage: formPage.value,
  param: { ...props.param, ...{}},
  user: JSON.parse(sessionStorage.getItem("user")),
  ciJiMrk: '0',
  readonly: computed(() => ['view'].includes(props.type)),
});
provide(idxParamKey, idxParam);

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
    'compKeyList': CorrectionCompList.map(item => item.tab)
  });
  console.log('getECargoPageView-res', res)
  const config = res.data;
  config[0].pageInfo.forEach((comp: any) => {
    const it = CorrectionCompList.find(f => f.tab === comp.pageCode);
    comp['sort'] = it.sort;
  });
  // 排序
  config[0].pageInfo = config[0].pageInfo.sort((a, b) => a.sort - b.sort)
  // 页面初始化
  formPage.value?.setFormConfig(config);
  query();
});

onMounted(() => {

});

function query() {
  cargoApi.editInit({
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
    const submitBtn = formPage.value?.getPageBtnRefById('submit')?.getConfig()
    submitBtn.disabled = true;
    const saveBtn = formPage.value?.getPageBtnRefById('save')?.getConfig()
    saveBtn.disabled = true;
  }
}

function save() {
  const allFromData = formPage.value?.getAllFormData();
  console.log('allFromData', allFromData);
  // ElMessage.warning('保存');
  cargoApi.save({
    ...allFromData,
    ...{}
  }).then((res: any) => {
    if(res.code === 200) {
      ElMessage.success('保存成功')
    }else {
      ElMessage.success(res.msg);
    }
  });

  const agreementBaseRef = formPage.value?.getComponentRefById('AgreementBase');
  console.log('AgreementBaseRef', agreementBaseRef);
  const agreementDistInsuredRef = formPage.value?.getComponentRefById('AgreementDistInsured');
  const agreementCvrgRef = formPage.value?.getComponentRefById('AgreementCvrg');

  // const agreementDistGoodsRef = formPage.value?.getComponentRefById('AgreementSpecial');
  // const formBtn = agreementDistGoodsRef.getFormBtn();
  // const tableBtn = agreementCvrgRef.getTableBtn();
}


function submit() {
  const allFromData = formPage.value?.getAllFormData();
  ElMessage.warning('提交');
  cargoApi.editSubmit({
    ...allFromData,
    ...{}
  }).then((res: any) => {
    if(res.code === 200) {
      formPage.value?.setPageReadOnly(true);
      ElMessage.success('提交成功')
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
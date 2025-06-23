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
const idxParam = reactive({
  opertaorId: 'enteringDtl',
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
    formPage.value?.setPageReadOnly();
    const submitBtn = formPage.value?.getPageBtnRefById('submit')?.getConfig();
    submitBtn.disabled = true;
    const saveBtn = formPage.value?.getPageBtnRefById('save')?.getConfig();
    saveBtn.disabled = true;
  }
}

function save() {
  const allFromData = formPage.value?.getAllFormData();
  console.log('allFromData', allFromData);
  ElMessage.warning('保存');
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
  cargoApi.submit({
    ...allFromData,
    ...{}
  }).then((res: any) => {
    if(res.code === 200) {
      ElMessage.success('提交成功')
      formPage.value.setPageReadOnly();
      const submitBtn = formPage.value.getPageBtnRefById('submit')?.getConfig();
      submitBtn.disabled = true;
    }else {
      ElMessage.success(res.msg);
    }
  });
}

</script>
<style lang="scss" scoped>
</style>
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
});

onMounted(() => {
  console.log('formPage', formPage);
  formPage.value?.setAllFormData({});
});

function save() {
  const allFromData = formPage.value?.getAllFormData();
  console.log('allFromData', allFromData);
  ElMessage.warning('保存');

  const ref = formPage.value?.getComponentRefById('AgreementBase');
  console.log('ref', ref);

  const saveBtn = formPage.value?.getButtonRefById('save');
  if(saveBtn) {
    saveBtn.disabled = true;
  }
}

function submit() {
  const allFromData = formPage.value?.getAllFormData();
  ElMessage.warning('提交');
}

</script>
<style lang="scss" scoped>
</style>
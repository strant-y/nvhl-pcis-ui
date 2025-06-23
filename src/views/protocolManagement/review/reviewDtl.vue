<!-- ECargo协议审核-->
<template>
  <detailComponent :bth-list="bthList" :form-config/>
</template>
<script setup lang="ts">
import cargoApi from '@/api/cargo';
import {createFreeButtonBase, FreeButtonBase} from "@/shared/button-config";
import {FormPage} from "@/views/protocolManagement/utils/form-page";
import detailComponent from "../components/detail-component.vue";
import {ReviewCompList} from "@/views/protocolManagement/utils/types";

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
  ciJiMrk: '0',
  readonly: computed(() => ['view'].includes(props.type)),
});
provide('idxParam', idxParam);


const bthList = ref<FreeButtonBase[]>([
  createFreeButtonBase({
    label: "提交",
    type: "primary",
    id: "submit",
    func: () => {
      submit();
    },
  }),
]);


onBeforeMount(async() => {
  const res = await cargoApi.getECargoPageView({
    'compKeyList': ReviewCompList.map(item => item.tab)
  });
  console.log('getECargoPageView-res', res)
  const config = res.data;
  config[0].pageInfo.forEach((comp: any) => {
    const it = ReviewCompList.find(f => f.tab === comp.pageCode);
    comp['sort'] = it.sort;
    comp['readonly'] = it.readonly;
  });
  // 排序
  config[0].pageInfo = config[0].pageInfo.sort((a, b) => a.sort - b.sort)
  // 页面初始化
  formPage.value?.setFormConfig(config);
  query();
});

onMounted(() => {
  formPage.value?.setPageReadOnly(['AgreementReview']);
});

function query() {
  cargoApi.checkInit({
    ...formPage.param,
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
    formPage.value.setFormReadOnlyById('AgreementReview');
    const submitBtn = formPage.value?.getPageBtnRefById('submit')?.getConfig()
    submitBtn.disabled = true;
  }
}


function submit() {
  const allFromData = formPage.value?.getAllFormData();
  ElMessage.warning('提交');
  cargoApi.checkSubmit({
    ...allFromData,
    ...{}
  }).then((res: any) => {
    if(res.code === 200) {
      ElMessage.success('提交成功')
      formPage.value.setFormReadOnlyById('AgreementReview');
      const submitBtn = formPage.value.getPageBtnRefById('submit')?.getConfig();
      submitBtn.disabled = true;
    }else {
      ElMessage.success(res.msg);
    }
  });
}
</script>
<style lang="scss" scoped>
.bottom-items {
  height: 50px;
  background-color: #fff;
  display: flex;
  justify-content: end;
  align-items: center;
  padding-right: 20px;
}
.NavigaList_card {
  display: inline-block; /* 设置为行内块元素 */
  vertical-align: middle; /* 垂直居中 */
}
.card_ {
  margin-bottom: 10px;
}

/* 用于包含行内块元素的容器 */
.navi_container {
  line-height: 50px; /* 与容器的高度相同，实现垂直居中 */
}
:deep(.el-main) {
  padding: 10px 10px 10px 10px;
}
.publicStyle {
  color: red;
}
.mypage-app {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.dynamic-container {
  height: calc(100vh - $navbar-height - 60px - 90px);
  overflow: auto;
}
</style>
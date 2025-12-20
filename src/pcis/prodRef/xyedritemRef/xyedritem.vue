<template>
  <app-table
    :tableConfig="tableconfig"
    v-model:pageresult="pageresult"
    ref="edritemEditRef"
    @page-change="handleQuery(false)"
  />
</template>

<script setup lang="ts">
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";
import {idxParamKey, useIdxParam} from "@/views/pcis/support/useIdxParam";
import {
    getedrcmpitembyedrappnoorcachekey
} from "../../../api/query/index";
const idxParam = inject(idxParamKey, useIdxParam());
const formPage = idxParam?.formPage;
const params = idxParam.param;
const edritemEditRef = ref<AppTableMethod | null>(null);
const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
const user = JSON.parse(sessionStorage.getItem("user"));
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    title: "批改比较项",
    editList: ["cStatus"],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    // tableBtnPosition: "right",
    tableBtn: [],
    fromSchema: [
      {
        prop: "nSeqNo",
        inputtype: "rtinput",
        title: "序号",
      },
      {
        prop: "cTabNme",
        inputtype: "rtinput",
        title: "批改对象",
      },
      {
        prop: "cFldNme",
        inputtype: "rtinput",
        title: "批改项目",
      },
      {
        prop: "cOldVal",
        inputtype: "rtinput",
        title: "原值",
      },
      {
        prop: "cChgVal",
        inputtype: "rtinput",
        title: "变化值",
      },
      {
        prop: "cNewVal",
        inputtype: "rtinput",
        title: "新值",
      },
    ],
  })
);
//给表格表单项赋值
function setTableFormItem(key, obj) {
  if (obj && Object.keys(obj).length) {
    tableconfig.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        Object.assign(item, obj);
      }
    });
  }
}
function setDisa() {}

/** 查询 */
function handleQuery(flag?: boolean) {
  const cacheKey=params?.cacheKey
  const r = edritemEditRef.value?.getPartnerPage(flag); //获取分页数据
	let param;
	const cEcAgrAppNo = formPage?.getComponentRefById('AgreementBase')?.getValue('ECargoBase.cEcAgrAppNo');
  if(cacheKey){
      param = Object.assign({pageNo:r['pageNum'],CurrentUser:user.opCde,CurrentUserOrg:user.companyId,cacheKey:cacheKey}, r);
  }else{
      param = Object.assign({pageNo:r['pageNum'],CurrentUser:user.opCde,CurrentUserOrg:user.companyId,appNo:cEcAgrAppNo}, r);
  }
  getedrcmpitembyedrappnoorcachekey(param)
      .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
              pageresult.list = data.result;
              pageresult.total = data.total;
          } else {
              ElMessage.error(msg);
          }
      })
      .finally(() => {});
}

onMounted(() => {});

function getFormconfig(){
  return tableconfig;
}
defineExpose({
    getFormconfig,
    handleQuery
});
</script>

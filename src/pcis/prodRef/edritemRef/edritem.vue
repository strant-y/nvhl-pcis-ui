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
import {
    getedrcmpitembyedrappnoorcachekey
} from "../../../api/query/index";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const props = defineProps({
  // data: {
  //     type: Object,
  //     default: () => ({}),
  // },
  // method: {
  //     type: Object,
  //     default: () => ({}),
  // },
});
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const params=opertaor.getParam()
const edritemEditRef = ref<AppTableMethod | null>(null);
const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
const comName = ref(params.pageType == "PLY_UW_PROCESS_SCENE" && params.cPolicySource == '6' && params.cAppTyp != "E"? "比较项":"批改比较项")
const user = JSON.parse(sessionStorage.getItem("user"));
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    title: comName.value,
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
  const cacheKey=opertaor.getFatherPage().getcacheKey()
  const r = edritemEditRef.value?.getPartnerPage(flag); //获取分页数据
  let param;
  if(cacheKey){
      param = Object.assign({pageNo:r['pageNum'],CurrentUser:user.opCde,CurrentUserOrg:user.companyId,cacheKey:cacheKey}, r);
  }else{
      param = Object.assign({pageNo:r['pageNum'],CurrentUser:user.opCde,CurrentUserOrg:user.companyId,appNo:params.cAppNo}, r);
  }
  console.log(param)
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

<template>
  <div>
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
    />
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";

const { getRules } = useValidator();
import { ref, defineProps } from "vue";
const emits = defineEmits(["handleClose"]);

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
});
const tableRef = ref<AppTableMethod | null>(null);

import { createFreeButtonBase } from "@/shared/button-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { createAppGridEditConfig } from "@/shared/app-grid-edit-config";
import { table } from "console";
import { qryProdTermList } from "@/api/prod";
const formconfig = createAppGridEditConfig({
  title: "条款模版选择",
  titleBtns: [
    createFreeButtonBase({
      type: "primary",
      label: "查询",
      func: () => {
        handleQuery();
      },
    }),
    createFreeButtonBase({
      label: "返回",
      func:()=>{
        emits("handleClose");
      }
    }),
  ],
  fromSchema: [
    {
      prop: "cTermNo",
      inputtype: "rtinput",
      title: "模版代码",
    },
    {
      prop: "cNmeCn",
      inputtype: "rtinput",
      title: "模版名称",
    },
  ],
});
const tableconfig = ref<AppTableConfig>(
  createTableEditConfig({
    showEdit: true,
    fromSchema: [
      {
        prop: "cTermNo",
        inputtype: "rtinput",
        title: "条款模版编码",
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "条款模版名称",
      },
      {
        prop: "cRdrTyp",
        inputtype: "rtselect",
        title: "主条款/附加条款",
        typeCode: "WEB_SYS_RdrTyp",
        codeParam: { cParCde: "RdrTyp" },
      },
    ],
    formconfig: formconfig,
    rowDbClickFun:(r: any)=>{
      props.method.isOk(r);
      emits("handleClose");
    }
  })
);

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

/** 查询 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = tableRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r, {cEnableFlag:'1'});
  qryProdTermList(param)
    .then((res: any) => {
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

// 快速弹窗表单接口,参数有入参进行提供
onMounted(async () => {
  handleQuery();
});

defineExpose({});
</script>

<style scoped></style>

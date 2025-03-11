<template>
  <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
  <app-table
    :tableConfig="tableconfig"
    v-model:pageresult="pageresult"
    ref="tableRef"
    @page-change="handleQuery(false)"
  />
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { getPageList } from "@/api/prod";
import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
const { getRules } = useValidator();
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
const emits = defineEmits(["handleClose"]);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "国民经济行业分类",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery();
          // freeEditRef.value?.validate().then((isValid) => {
          //   if (isValid) {
          //     handleQuery();
          //   } else {
          //     ElMessage.error("请填写必填项");
          //   }
          // });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cSuperCde",
        inputtype: "rtselect",
        title: "一级分类",
        typeCode: "Industry_Category_List2",
        codeParam: { cParCde: "hangyefenlei2" },
        func: () => {},
      },
      {
        prop: "cMaxCde",
        inputtype: "rtselect",
        title: "二级分类",
        typeCode: "Industry_Category_List2",
        codeParam: { cParCde: "A" },
      },
      {
        prop: "cMidCde",
        inputtype: "rtselect",
        title: "三级分类",
        typeCode: "Industry_Category_List2",
        codeParam: { cParCde: "A01" },
      },
      {
        prop: "cCde",
        inputtype: "rtinput",
        title: "行业编码",
      },
      {
        prop: "cCnm",
        inputtype: "rtinput",
        title: "行业名称",
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    // editList: ["cStatus"],
    // tableBtnType: "btn",
    // tableBtnWidth: 220,
    // tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "submit",
        tooltip: "确认",
        link: true,
        type: "danger",
        icon: "Check",
        tableClick: async (row) => {},
      }),
    ],

    fromSchema: [
      {
        prop: "cCde",
        inputtype: "rtinput",
        title: "子行业代码",
      },
      {
        prop: "cCnm",
        inputtype: "rtinput",
        title: "子行业名称",
      },
      {
        prop: "cParCnm",
        inputtype: "rtinput",
        title: "父行业名称",
      },
    ],
  })
);

function getFromValue() {
  return freeEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  freeEditRef?.value?.setFormValue(value);
}

function validate() {
  return freeEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  freeEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return freeEditRef?.value?.getValue(key);
}
function setDisa() {}

/** 查询 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  getPageList(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = data;
        pageresult.total = data.totalCount;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}

onMounted(() => {});

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>

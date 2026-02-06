<template>
  <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
  <app-table
    :tableConfig="tableconfig"
    v-model:pageresult="pageresult"
    ref="tableRef"
    @page-change="handleQuery(false)"
    @row-click="handleRowClick" />
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
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
import { rsaEncoder } from "@/utils/encipher";
import { codeListViewStore } from "@/store";
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
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
         // handleQuery();
           freeEditRef.value?.validate().then((isValid) => {
             if (isValid) {
               handleQuery();
             } /*else {
               ElMessage.error("请填写必填项");
             }*/
           });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "bankNme",
        inputtype: "rtinput",
        title: "开户行名称",
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
        tableClick: async (row) => {
          props.data.method.getSelected(row)
        },
      }),
    ],

    fromSchema: [
      {
        prop: "label",
        inputtype: "rtinput",
        title: "开户行名称",
      },
      {
        // prop: "bankRelCde",
        prop: "value",
        inputtype: "rtinput",
        title: "银行联号",
      },
    ],
    rowDbClickFun(rowData) {
      props.data.method?.getSelected(rowData);
    },
  })
);
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          for (let key in obj.btnItems) {
            item.btnItems[key] = obj.btnItems[key];
          }
        }else{
          Object.assign(item, obj);
        }
      }
    });
  }
}
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
  const c = { codeListName: "CBankCdeList" };
  const param = Object.assign(c, {
    codeListParam: {
      bankNme:s.bankNme,
      pageNum:1,
      pageSize:10,
    }
  });
  getPageList(param).then((res) => {
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

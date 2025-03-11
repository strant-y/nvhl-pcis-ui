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
import { codeListViewStore } from "@/store";
import { rsaEncoder } from "@/utils/encipher";
const codeListStore = codeListViewStore();
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
    title: "",
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
        prop: "cMaxCde",
        inputtype: "rtselect",
        title: "行业大类",
        rules: [getRules("required", {})],
        typeCode: "Job_Description_List",
        codeParam: { cParCde: "JobDescription" },
        func: (val) => {
          setValue("cMidCde", "");
          if (val) {
            codeListStore
              .queryCodeList({
                codeListName: "Job_Description_List",
                codeListParam: { cParCde: val },
              })
              .then((res) => {
                const objData = {
                  loadData: res,
                };
                setFormItem("cMidCde", objData);
              });
          }
        },
      },
      {
        prop: "cMidCde",
        inputtype: "rtselect",
        title: "行业中类",
        rules: [getRules("required", {})],
        loadData: [],
        // func: (val) => {
        //   setValue("cMidCde", "");
        //   if (val) {
        //     codeListStore
        //       .queryCodeList({
        //         codeListName: "Industry_Category_List2",
        //         codeListParam: { cParCde: val },
        //       })
        //       .then((res) => {
        //         const objDate = {
        //           loadData: res,
        //         };
        //         setFormItem("cMidCde", objDate);
        //       });
        //   }
        // },
      },

      {
        prop: "cCde",
        inputtype: "rtinput",
        title: "工种代码",
      },
      {
        prop: "cCnm",
        inputtype: "rtinput",
        title: "工种名称",
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
        title: "工种代码",
      },
      {
        prop: "cCnm",
        inputtype: "rtinput",
        title: "工种名称",
      },
      {
        prop: "cCnm",
        inputtype: "rtinput",
        title: "父级名称",
      },
    ],
  })
);
function setFormItem(key, obj) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.loadData && obj.loadData) {
          let newBtnItems = null;
          if (obj.loadData.length != 0) {
            for (let key in obj.loadData) {
              item.loadData[key] = obj.loadData[key];
            }
          } else {
            item.loadData = obj.loadData;
          }
          newBtnItems = item.loadData;
          newBtnItems && (obj.loadData = newBtnItems);
        }
        Object.assign(item, obj);
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

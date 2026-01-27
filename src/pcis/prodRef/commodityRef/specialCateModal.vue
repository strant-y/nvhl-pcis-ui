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
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
import { rsaEncoder } from "@/utils/encipher";
import { codeListViewStore } from "@/store";
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
      title: "行业分类",
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
          prop: "cEquipmentCategory",
          inputtype: "rtselect",
          // rules: [getRules("required", {'message':'请选择特种设备门类'})],
          title: "特种设备门类",
          clearable:true,
          typeCode: "Equipment_Type_Level_One",
          codeParam: { cParCde: "teshushebeibianma" },
          func: (val) => {
            setValue("cClassGroup", "");
            // setValue("cSubclassType", "");
            if (val) {
							setFormItem("cClassGroup", { rules: [getRules("required", {})], });
              codeListStore
                  .queryCodeList({
                    codeListName: "Equipment_Type_Level_Two",
                    codeListParam: { cParCde: val },
                  })
                  .then((res) => {
                    const objData = {
                      loadData: res,
                    };
                    setFormItem("cClassGroup", objData);
                  });
						} else {
							setFormItem("cClassGroup", { rules: [] });
						}
          },
        },
        {
          prop: "cClassGroup",
          inputtype: "rtselect",
          title: "特种设备大类",
          // rules: [getRules("required", {'message':'请选择特种设备大类'})],
          loadData: [],
          clearable:true,
          func: (val) => {
            // setValue("cSubclassType", "");
            // if (val) {
              // codeListStore
                  // .queryCodeList({
                  //   codeListName: "Equipment_Type_Level_Three",
                  //   codeListParam: { cParCde: val },
                  // })
                  // .then((res) => {
                  //   const objDate = {
                  //     loadData: res,
                  //   };
                    // setFormItem("cSubclassType", objDate);
                  // });
            // }
          },
        },
        // {
        //   prop: "cSubclassType",
        //   inputtype: "rtselect",
        //   // rules: [getRules("required", {'message':'请选择特种设备中类'})],
        //   title: "特种设备中类",
        //   loadData: [],
        //   clearable:true

        // },
        // {
        //   prop: "cUsageNumber",
        //   inputtype: "rtinput",
        //   title: "特种设备编码",
        // },
        // {
        //   prop: "cSpecialEquipment",
        //   inputtype: "rtinput",
        //   title: "特种设备名称",
        // },
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
            props.data.method?.getdbClickData(row);
          },
        }),
      ],

      fromSchema: [
        {
          prop: "cde",
          inputtype: "rtinput",
          title: "行业编码",
        },
        {
          prop: "cnm",
          inputtype: "rtinput",
          title: "行业名称",
        },
        {
          prop: "parCnm",
          inputtype: "rtinput",
          title: "父行业名称",
        },
      ],
      rowDbClickFun(rowData) {
        props.data.method?.getdbClickData(rowData);
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
  const c = { codeListName: "Search_Equipment_List" };
  const param = Object.assign(c, {
    codeListParam: s,
    r,
    parCde: s.setFormItem,
  });
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

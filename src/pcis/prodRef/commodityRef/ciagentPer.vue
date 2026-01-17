<template>
  <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
  <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef" @page-change="handleQuery(false)"
    @row-click="handleRowClick" />
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
import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";
import {
  getBsnsTypList,
  getChaTypeList,
  getChaSubtypList,
  getPageList,
} from "@/api/code-list-service";
const { getRules } = useValidator();
// import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
// import { dataOpertaor } from "@/store";
// const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
// const opertaor = dataOpertaor(idxParam.opertaorProps);

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
          freeEditRef.value?.validate().then((isValid) => {
            if (isValid) {
              handleQuery();
            } else {
              ElMessage.error("请填写必填项");
            }
          });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CDptCde",
        inputtype: "rtinput",
        title: "机构部门",
        disabled: true,
      },
      {
        prop: "CChaMrk",
        inputtype: "rtselect",
        title: "业务类型",
        loadData: [
          { value: "0", label: "机构" },
          { value: "1", label: "个人" },
        ],
      },
      {
        prop: "CBsnsTyp",
        inputtype: "rtselect",
        title: "业务来源大类",
        loadData: [],
        rules: [getRules("required", {})],
        func: (val) => {
          if(val){
            getChaTypeList({ BsnsTyp: val, scene: "PLY_APP_NEW_SCENE" }).then(
              (res) => {
                if (null != res && null != res["code"]) {
                  if (res["code"] === 200) {
                    const obj = {
                      loadData: res.data,
                    };
                    setFormItem("CChaType", obj);
                  }
                }
              }
            );
          }
        },
      },
      {
        prop: "CChaType",
        inputtype: "rtselect",
        title: "业务来源中类",
        loadData: [],
        rules: [getRules("required", {})],
        func: (val) => {
          setValue("CChaSubtype", "");
          const params = {
            CChaType: val,
            flag: 1,
            scene: "PLY_APP_NEW_SCENE",
          };
          getChaSubtypList(params).then((res) => {
            if (null != res && null != res["code"]) {
              if (res["code"] === 200) {
                const obj = {
                  loadData: res.data,
                };
                setFormItem("CChaSubtype", obj);
              }
            }
          });
        },
      },
      {
        prop: "CChaSubtype",
        inputtype: "rtselect",
        title: "业务来源子类",
        loadData: [],
        rules: [getRules("required", {})],
      },
      {
        prop: "CChaCde",
        inputtype: "rtinput",
        title: "编码",
      },
      {
        prop: "CChaNme",
        inputtype: "rtinput",
        title: "代理(经纪)名称",
      },
    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    fromSchema: [
      {
        prop: "CBsnsTyp",
        inputtype: "rtselect",
        title: "业务来源大类",
        loadData: [
          {
            "label": "代理业务",
            "value": "19002"
          },
          {
            "label": "直销业务",
            "value": "19001"
          },
          {
            "label": "经纪业务",
            "value": "19003"
          }
        ],
      },
      {
        prop: "CChaType",
        inputtype: "rtselect",
        title: "业务来源中类",
        loadData: [
          {
            "label": "个人代理",
            "value": "1900201"
          },
          {
            "label": "兼业代理",
            "value": "1900202"
          },
          {
            "label": "专业代理",
            "value": "1900203"
          }
        ],
      },
      {
        prop: "CChaSubtype",
        inputtype: "rtselect",
        title: "业务来源子类",
        loadData: [
          {
            "label": "保险业兼业代理",
            "value": "1900202001"
          },
          {
            "label": "银行业兼业代理",
            "value": "1900202002"
          },
          {
            "label": "证券业兼业代理",
            "value": "1900202003"
          },
          {
            "label": "邮政业兼业代理",
            "value": "1900202004"
          },
          {
            "label": "民航系统",
            "value": "1900202005"
          },
          {
            "label": "铁路系统",
            "value": "1900202006"
          },
          {
            "label": "公路系统",
            "value": "1900202007"
          },
          {
            "label": "水运系统",
            "value": "1900202008"
          },
          {
            "label": "汽车销售与租赁",
            "value": "1900202009"
          },
          {
            "label": "汽车维修与服务",
            "value": "1900202010"
          },
          {
            "label": "机动车检验机构",
            "value": "1900202011"
          },
          {
            "label": "银保通",
            "value": "1900202012"
          },
          {
            "label": "物流公司",
            "value": "1900202013"
          },
          {
            "label": "担保、贷款公司",
            "value": "1900202014"
          },
          {
            "label": "金融租赁",
            "value": "1900202016"
          },
          {
            "label": "信托代理",
            "value": "1900202017"
          },
          {
            "label": "车友俱乐部代理",
            "value": "1900202018"
          },
          {
            "label": "其他兼业代理",
            "value": "1900202099"
          },
          {
            "label": "专业代理",
            "value": "1900203001"
          },{
            "label": "永安销售公司",
            "value": "1900203002"
          }
        ],
      },
      {
        prop: "CChaCde",
        inputtype: "rtinput",
        title: "代理编码",
      },
      {
        prop: "CChaNme",
        inputtype: "rtinput",
        title: "代理(经纪)名称",
      },
      {
        prop: "CAgtAgrItemCde",
        inputtype: "rtinput",
        title: "代理机构",
      },
      {
        prop: "CAgtAgrNo",
        inputtype: "rtinput",
        title: "代理(经纪)协议",
      },
      {
        prop: "CAgtAgrName",
        inputtype: "rtinput",
        title: "协议名称",
      },
    ],
    rowDbClickFun(rowData) {
      props.data.method?.getSelected(rowData);
      console.log("rowData", rowData);
    },
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
function setDisa() { }

//给表单下拉项赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          for (let key in obj.btnItems) {
            item.btnItems[key] = obj.btnItems[key];
          }
        } else {
          Object.assign(item, obj);
        }
      }
    });
  }
}

/** 查询 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  param.CProdNo = props.data.data.CProdNo;
  getAgencyBusinessList(param);
  pageresult.list = [
    // {
    //   CChaCde: 123,
    // },
  ];
}
/**
 * 调用api获取代理信息
 */
function getAgencyBusinessList(param?: any) {
  // 获取数据
  if (param.CChaSubtype === "030503") {
    getPageList("PERSONAL_AGENCY_LIST", param).then(
      (res) => {
        if (!!res && !!res["data"]) {
          pageresult.total = res["totalCount"];
          pageresult.list = res["data"];
        }
      },
      (error) => {
        console.log("出错了", error);
        ElMessage.error("后台服务异常,请联系管理员");
      }
    );
  } else if (param.CChaSubtype === "030504") {
    getPageList("INDEPENDENT_GENERATION_LIST", param).then(
      (res) => {
        if (!!res && !!res["data"]) {
          pageresult.total = res["totalCount"];
          pageresult.list = res["data"];
        }
      },
      (error) => {
        console.log("出错了", error);
        ElMessage.error("后台服务异常,请联系管理员");
      }
    );
  } else {
    getPageList("AGENCY_BUSINESS_LIST", param).then(
      (res) => {
        if (!!res && !!res["data"]) {
          pageresult.total = res["totalCount"];
          pageresult.list = res["data"];
        }
      },
      (error) => {
        console.log("出错了", error);
        ElMessage.error("后台服务异常,请联系管理员");
      }
    );
  }
}

// function handleRowClick(val) {
//   console.error(val);
// }

onMounted(() => {
    if(props.cTransMrk !== '1'){
      //业务来源大类下拉数据
      const params = {
        CDptCde: props.data.data.rowData['Ci.cDptCde'],
      };
      //查询大类数据，用于默认回显
      getBsnsTypList(params).then((res) => {
        if (null != res && null != res["code"]) {
          if (res["code"] === 200) {
            const obj = {
              loadData: res.data,
            };
            setFormItem("CBsnsTyp", obj);
            setValue("CBsnsTyp", props.data.data.cBsnsTyp);
            nextTick(() => {
              handleQuery();
            })
          }
        }
      });
    }
    
    nextTick(() => {
      setValue("CDptCde", props.data.data.rowData['Ci.cDptCde']);
    });
    //查询中类数据，用于默认回显  { BsnsTyp: val, scene: "PLY_APP_NEW_SCENE" }
    getChaTypeList({ BsnsTyp: props.data.data.cBsnsTyp, scene: "PLY_APP_NEW_SCENE" }).then((res) => {
      if (null != res && null != res["code"]) {
        if (res["code"] === 200) {
          const obj = {
            loadData: res.data,
          };
          setFormItem("CChaType", obj);
          setValue("CChaType", props.data.data.cChaType);
        }
      }
    });
    const paramSub = {
      CChaType: props.data.data.cChaType,
      flag: 1,

      scene: "PLY_APP_NEW_SCENE",
    };
    getChaSubtypList(paramSub).then((res) => {
      if (null != res && null != res["code"]) {
        if (res["code"] === 200) {
          const obj = {
            loadData: res.data,
          };
          setFormItem("CChaSubtype", obj);
          setValue("CChaSubtype", props.data.data.cChaSubtype);
        }
      }
    });
    nextTick(() => {
      setValue("CDptCde", props.data.data.rowData['Ci.cDptCde']);
    });
});

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>

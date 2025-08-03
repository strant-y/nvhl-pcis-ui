<!--商品配置-出单权限分配-业务员-->
<template>
  <el-dialog v-model="dialogVisible" title="" width="80%" @update:model-value="handleVisibleUpdate">
    <app-free-edit v-model:freeEditConfig="formconfig" ref="freeEditRef" />
    <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
      @page-change="handleQuery(false)" @selection-change="handleSelectionChange" />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <!-- <el-button type="primary" @click="handleSave">保存</el-button> -->
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useDzModal } from "@/common/dzmodel/DzModalService";
const showBtnConfig = ref(false);
const dialogVisible = ref(true);
const showView = ref(false);
const dzmodal = useDzModal();
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useRoute } from "vue-router";
import { createFreeButtonBase } from "@/shared/button-config";
const publicProblem = defineAsyncComponent(() => import("./PublicProblem.vue"));
import { descryptParameter, encryptParameter } from "@/utils/encipher";
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}");
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { ref, reactive } from "vue";
import { saveRiskInfo, getPageList } from "@/api/prod";
import {
  getBsnsTypList,
  getChaTypeList,
  getChaSubtypList,
  // getPageList,
} from "@/api/code-list-service";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const props = defineProps<{
  visible: boolean;
  data: object
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save"): void;
  (e: "ok", data: Object): void;
}>();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "代理查询",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: () => {
          // save();
          handleQuery();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CDptCde",
        // inputtype: "rtselect",
        inputtype: "rtinput",
        title: "机构代码",
      },
      {
        prop: "CChaMrk",
        inputtype: "rtselect",
        title: "业务类型",
        loadData: [{ value: '0', label: '机构' }, { value: '1', label: '个人' }]
      },
      {
        prop: "CBsnsTyp",
        inputtype: "rtselect",
        title: "业务来源大类",
        rules: [getRules("required", {})],
        func: (val: any) => {
          if (val) {
            setValue("CChaType", "");
            setValue("CChaSubtype", "");
            queryChaTypeList(val)
          }

          // getChaTypeList({ BsnsTyp: val, scene: "PLY_APP_NEW_SCENE" }).then(
          //   (res) => {
          //     if (null != res && null != res["code"]) {
          //       if (res["code"] === 200) {
          //         const obj = {
          //           loadData: res.data,
          //         };
          //         setFormItem("CChaType", obj);
          //       }
          //     }
          //   }
          // );
        },
      },
      {
        prop: "CChaType",
        inputtype: "rtselect",
        title: "渠道中级分类",
        rules: [getRules("required", {})],
        func: (val: any) => {
          if (val) {
            setValue("CChaSubtype", "");
            queryCChaSubtype(val)
          }

          // const params = {
          //   CChaType: val,
          //   flag: 1,
          //   scene: "PLY_APP_NEW_SCENE",
          // };
          // getChaSubtypList(params).then((res) => {
          //   if (null != res && null != res["code"]) {
          //     if (res["code"] === 200) {
          //       const obj = {
          //         loadData: res.data,
          //       };
          //       setFormItem("CChaSubtype", obj);
          //     }
          //   }
          // });
        },
      },
      {
        prop: "CChaSubtype",
        inputtype: "rtselect",
        title: "渠道子类",
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

// const handleSave = async () => {
//   const formData = freeEditRef.value?.getFromValue();
//   if (formData) {
//     try {
//       await saveRiskInfo(formData); //保存接口调用
//       ElMessage.success("保存成功");
//       emit("save");
//       // dialogVisible(false);
//     } catch (error) {
//       ElMessage.error("保存失败");
//     }
//   }
// };

const handleCancel = () => {
  dialogVisible.value = false;
};

const handleVisibleUpdate = (value: boolean) => {
  emit("update:visible", value);
};

const tableRef = ref<AppTableMethod | null>(null);
const pageresult = reactive<Pageresult>({
  result: "",
  list: [],
  total: 0,
});
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    // titleBtns: [
    //   createFreeButtonBase({
    //     id: "add-responsibility",
    //     label: "公共问题新增",
    //     type: "success",
    //     func: function () {
    //       dzmodal.open(publicProblem, { type: "add", data: {} }).then((res) => {
    //         if (res.type === "ok") {
    //           handleQuery();
    //         }
    //       });
    //     },
    //   }),
    // ],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        type: "danger",
        tooltip: "选择",
        icon: "Edit",
        link: true,
        tableClick: (row) => {
          emit("ok", row);
          dialogVisible.value = false;

        },
      }),
      createFreeButtonBase({
        id: "score",
        type: "danger",
        tooltip: "删除",
        icon: "Delete",
        link: true,
        tableClick: (row) => {
          //   delRiskRel(row)
          //     .then((res) => {
          //       const { code, data, msg } = res;
          //       if (200 === code) {
          //         ElMessage.success("删除成功");
          //         handleQuery();
          //       } else {
          //         ElMessage.error(msg);
          //       }
          //     })
          //     .finally(() => {});
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CBsnsTyp",
        inputtype: "rtselect",
        title: "渠道分类",
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
        inputtype: "rtinput",
        title: "渠道中级分类",
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
        inputtype: "rtinput",
        title: "渠道子类",
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
        prop: "CDptCnm",
        inputtype: "rtinput",
        title: "代理机构",
      },
      {
        prop: "CAgtAgrNo",
        inputtype: "rtinput",
        title: "代理(经纪)协议",
      },
    ],
  })
);


/** 查询 */
function handleQuery() {
  const r = tableRef.value?.getPartnerPage(); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const c = { codeListName: "AGENCY_BUSINESS_LIST" };
  // const c = { codeListName: "WEB_ORG_OPER_DPT_ALL" };
  // const param = Object.assign(s, r,c,{
  //   // "slsTyp": "020004",
  //   // "type": "operAll",
  // });
  // let obj = { "CDptCde": "0237020008900",
  //     "pagePos": 1,
  //     "pageSize": 5,
  //     "totalCount": 0}
  const param = Object.assign(c, {
    codeListParam: { ...r, ...s },

    // parCde: s.cMidCde,
  });

  console.log('参数', param)
  getPageList(param)
    .then((res) => {
      const { code, data, msg, totalCount } = res;
      if (200 === code) {
        pageresult.list = data;
        pageresult.total = totalCount

      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => { });
}

// 查询  渠道大类
const queryCBsnsTyp = () => {
  console.log('数据666',)
  let CDptCde = JSON.parse(sessionStorage.getItem("user")).companyId;
  const params = {
    CDptCde,
    CKindNo: props.data.cBsnsTyp,
  };
  getBsnsTypList(params).then((res) => {
    const { code, data, msg } = res;
    console.log(res)
    if (code === 200) {
      setFormItem("CBsnsTyp", {
        loadData: data
      });
      setValue("CBsnsTyp", props.data.cBsnsTyp);
    } else {
      ElMessage.error(msg);
    }
  });
}


// 查询  渠道中类
const queryChaTypeList = (val: any) => {

  getChaTypeList({ BsnsTyp: val, scene: '' }).then((res) => {
    const { code, data, msg } = res;
    console.log(res)
    if (code === 200) {
      setFormItem("CChaType", {
        loadData: data
      });
      // setValue("CChaType", props.data.cChaType);
    } else {
      ElMessage.error(msg);
    }
    //   if (null != res && null != res["code"]) {
    //     if (res["code"] === 200) {
    //       const obj = {
    //         loadData: res.data,
    //       };
    //       console.log("中类数据", obj);
    //       setFormItem("CChaType", obj);
    //       setValue("CChaType", props.data.data.cChaType);
    //     }
    //   }
  });
}

// 查询  渠道子类
const queryCChaSubtype = (val: any) => {
  const param = {
    CChaType: val,
    flag: 1,
    scene: ''
  };
  // setValue("CChaSubtype", '1900202002');
  getChaSubtypList(param).then((res) => {
    const { code, data, msg } = res;
    if (code === 200) {
      setFormItem("CChaSubtype", {
        loadData: data
      });
      // console.log('----',data,props.data.cChaSubType ==='1900202002'     )
      // setValue("CChaSubtype", props.data.cChaSubtype);
      // setTimeout(()=>{
      //   setValue("CChaSubtype", props.data.cChaSubtype);
      // },4000)

    } else {
      ElMessage.error(msg);
    }

    // if (null != res && null != res["code"]) {
    //   if (res["code"] === 200) {
    //     const obj = {
    //       loadData: res.data,
    //     };
    //     console.log("子类数据", res.data);
    //     setFormItem("CChaSubtype", obj);
    //     setValue("CChaSubtype", props.data.data.cChaSubtype);
    //   }
    // }
  });
}



onMounted(() => {
  console.log('data----', props.data)
  queryCBsnsTyp();
  queryChaTypeList();
  queryCChaSubtype();
  // queryCChaSubtype(props.data.cChaType)
  // setValue("CBsnsTyp", props.data.cBsnsTyp)
  // setValue("CChaType", props.data.cChaType)
  // setValue("CChaSubType", props.data.cChaSubType)


});

//给表单下拉项赋值
function setFormItem(key, obj) {
  if (obj && Object.keys(obj).length) {
    formconfig.fromSchema?.forEach((item) => {
      if (item.prop === key) {
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

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
});
</script>

<style scoped>
/* 确保样式与现有组件一致 */
</style>

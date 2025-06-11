<!-- 地点查询 弹框 -->

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
//   const publicProblem = defineAsyncComponent(() => import("./PublicProblem.vue"));
const route = useRoute();
const query = ref(route.query);
//   const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { ref, reactive } from "vue";
import { saveRiskInfo, getPageList, selCountryPort, addCountryPort } from "@/api/prod";
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
    title: "地点查询",
    endBtnsPosition: "center",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: () => {
          // save();
          handleQuery();
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "新增",
        func: () => {
          // save();
          // handleQuery();
          addFunc();
        },
      }),
    ],
    fromSchema: [

      {
        prop: "countryCn",
        // inputtype: "rtselect",
        inputtype: "rtinput",
        title: "国家中文名称",
      },
      {
        prop: "countryEn",
        inputtype: "rtinput",
        title: "国家英文名称",
        //   loadData: [{ value: '0', label: '机构' }, { value: '1', label: '个人' }]
      },
      {
        prop: "portCn",
        // inputtype: "rtselect",
        inputtype: "rtinput",
        title: "港口中文名称",
      },
      {
        prop: "portEn",
        inputtype: "rtinput",
        title: "港口英文名称",
        //   loadData: [{ value: '0', label: '机构' }, { value: '1', label: '个人' }]
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
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    fromSchema: [
      {
        prop: "countryCn",
        // inputtype: "rtselect",
        inputtype: "rtinput",
        title: "国家中文名称",
      },
      {
        prop: "countryEn",
        inputtype: "rtinput",
        title: "国家英文名称",
        //   loadData: [{ value: '0', label: '机构' }, { value: '1', label: '个人' }]
      },
      {
        prop: "portCn",
        // inputtype: "rtselect",
        inputtype: "rtinput",
        title: "港口中文名称",
      },
      {
        prop: "portEn",
        inputtype: "rtinput",
        title: "港口英文名称",
        //   loadData: [{ value: '0', label: '机构' }, { value: '1', label: '个人' }]
      },
    ],
    rowDbClickFun(rowData) {
      // props.data.method?.getdbClickData(rowData);

      console.log('选中数据', rowData)
      dialogVisible.value = false;
      emit("ok", rowData);

    },
  })
);

// 新增
const addFunc = () => {
  // ;addCountryPort
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = { ...s }
  console.log('参数', param)
  addCountryPort(param)
    .then((res) => {
      const { code, data, msg, totalCount } = res;
      
      if (200 == code) {
          ElMessage.success(msg);
        // pageresult.list = data;
        // pageresult.total = totalCount

      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => { });
}


/** 查询 */
function handleQuery() {
  const r = tableRef.value?.getPartnerPage(); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  // const c = { codeListName: "AGENCY_BUSINESS_LIST" };

  const param = {...r,...s }

  console.log('参数', param)


  // pageresult.list = [{
  //     CDptCde: '小日本',
  //     id:'250'
  // }];
  // pageresult.total = 1

  selCountryPort(param)
    .then((res) => {
      const { code, data, msg, totalCount } = res;
      if (200 == code) {
        pageresult.list = data;
        pageresult.total = 20

      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => { });
}

// 查询  渠道大类
const queryCBsnsTyp = () => {
  console.log('数据666',)
  // let CDptCde = JSON.parse(sessionStorage.getItem("user")).companyId;
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
  // queryCBsnsTyp();
  // queryChaTypeList();
  // queryCChaSubtype();
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
<!-- 检验代理人 查勘代理人 弹框 -->

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
import { carSelCountryPort } from "@/api/prod";
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
let cAddrData = null;
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save"): void;
  (e: "ok", data: Object): void;
}>();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "查勘代理人",
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
      createFreeButtonBase({
        // type: "primary",
        icon: "RefreshRight",
        label: "重置",
        func: () => {
          freeEditRef.value?.resetFields();
        },
      }),
    ],
    fromSchema: [


      {
        prop: "cAddr",
        inputtype: "rtselect",
        title: "大洲",
        typeCode: "Continent",
         clearable: true,
        func: (row: any) => {
          cAddrData = row;
          console.log('row', row)

        //  appTableShow.value = data === "rtinputgroup";
        //   const com = getSuperSchema(data);
        //   formconfig1.superFromSchema = com;
        //   showFactorList();


          if (row) {
            setFormItem('cAraCde', {
              typeCode: "Continent_Country",
              codeParam: { cAddr: row }
            })
          }
        },
      //    loadData: [
      //   { "value": "0", "label": "非共保业务" },
      //   { "value": "1", "label": "外部共保我方主共_主联" },
      //   { "value": "2", "label": "外部共保我方从共_主联" },
      //   { "value": "3", "label": "外部共保我方主共_无联保" },
      //   { "value": "4", "label": "外部共保我方从共_无联保" },
      //   { "value": "5", "label": "司内联保_主联" }
      // ]
        // odeParam: { cStatus: "1" },

      },
      {
        prop: "cAraCde",
        inputtype: "rtselect",
        title: "国家",
         clearable: true,
        func: (row: any) => {
          if (row) {
            setFormItem('cSrvyCde', {
              typeCode: "Country_City",
              codeParam: { cAddr: cAddrData, cAraCde: row }
            })
          }
        }
        // loadData: [],
        //  typeCode: "KIND_LIST_ALL",
        // codeParam: { cStatus: "1" },
      },
      {
        prop: "cSrvyCde",
        inputtype: "rtselect",
        title: "城市",
         clearable: true,
        // func: (row: any) => {
        //   if (row) {

        //   }
        // }
      },

    ],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);


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
        prop: "cSrvyCde",
        // inputtype: "rtselect",
        inputtype: "rtinput",
        title: "编码",
      },
      {
        prop: "cAddr",
        inputtype: "rtinput",
        title: "大洲",
      },
      {
        prop: "cAraCde",
        // inputtype: "rtselect",
        inputtype: "rtinput",
        title: "国家",
      },
      {
        prop: "cCtyCnm",
        inputtype: "rtinput",
        title: "城市",
      },
      {
        prop: "cWhlAraMrk",
        // inputtype: "rtinput",
        inputtype: "rtselect",
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "yes_no" },
        title: "全境代理人",
      },
      {
        prop: "cSryDoc",
        inputtype: "rtinput",
        title: "代理人信息",
      },
    ],
    rowDbClickFun(rowData) {
      console.log('选中数据', rowData)
      dialogVisible.value = false;
      emit("ok", rowData);

    },
    //   [
    // {
    //   prop: "CBsnsTyp",
    //   inputtype: "rtselect",
    //   title: "渠道分类",
    //   loadData: [
    //     {
    //       "label": "代理业务",
    //       "value": "19002"
    //     },
    //     {
    //       "label": "直销业务",
    //       "value": "19001"
    //     },
    //     {
    //       "label": "经纪业务",
    //       "value": "19003"
    //     }
    //   ],
    // },
    // {
    //   prop: "CChaType",
    //   inputtype: "rtinput",
    //   title: "渠道中级分类",
    //   loadData: [
    //     {
    //       "label": "个人代理",
    //       "value": "1900201"
    //     },
    //     {
    //       "label": "兼业代理",
    //       "value": "1900202"
    //     },
    //     {
    //       "label": "专业代理",
    //       "value": "1900203"
    //     }
    //   ],
    // },
    // {
    //   prop: "CChaSubtype",
    //   inputtype: "rtinput",
    //   title: "渠道子类",
    //   loadData: [
    //     {
    //       "label": "保险业兼业代理",
    //       "value": "1900202001"
    //     },
    //     {
    //       "label": "银行业兼业代理",
    //       "value": "1900202002"
    //     },
    //     {
    //       "label": "证券业兼业代理",
    //       "value": "1900202003"
    //     },
    //     {
    //       "label": "邮政业兼业代理",
    //       "value": "1900202004"
    //     },
    //     {
    //       "label": "民航系统",
    //       "value": "1900202005"
    //     },
    //     {
    //       "label": "铁路系统",
    //       "value": "1900202006"
    //     },
    //     {
    //       "label": "公路系统",
    //       "value": "1900202007"
    //     },
    //     {
    //       "label": "水运系统",
    //       "value": "1900202008"
    //     },
    //     {
    //       "label": "汽车销售与租赁",
    //       "value": "1900202009"
    //     },
    //     {
    //       "label": "汽车维修与服务",
    //       "value": "1900202010"
    //     },
    //     {
    //       "label": "机动车检验机构",
    //       "value": "1900202011"
    //     },
    //     {
    //       "label": "银保通",
    //       "value": "1900202012"
    //     },
    //     {
    //       "label": "物流公司",
    //       "value": "1900202013"
    //     },
    //     {
    //       "label": "担保、贷款公司",
    //       "value": "1900202014"
    //     },
    //     {
    //       "label": "金融租赁",
    //       "value": "1900202016"
    //     },
    //     {
    //       "label": "信托代理",
    //       "value": "1900202017"
    //     },
    //     {
    //       "label": "车友俱乐部代理",
    //       "value": "1900202018"
    //     },
    //     {
    //       "label": "其他兼业代理",
    //       "value": "1900202099"
    //     }
    //   ],
    //     },
    //     {
    //       prop: "CChaCde",
    //       inputtype: "rtinput",
    //       title: "代理编码",
    //     },
    //     {
    //       prop: "CChaNme",
    //       inputtype: "rtinput",
    //       title: "代理(经纪)名称",
    //     },
    //     {
    //       prop: "CDptCnm",
    //       inputtype: "rtinput",
    //       title: "代理机构",
    //     },
    //     {
    //       prop: "CAgtAgrNo",
    //       inputtype: "rtinput",
    //       title: "代理(经纪)协议",
    //     },
    //   ],
  })
);


/** 查询 */
function handleQuery() {
  const r = tableRef.value?.getPartnerPage(); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  // const c = { codeListName: "AGENCY_BUSINESS_LIST" };
  // const c = { codeListName: "WEB_ORG_OPER_DPT_ALL" };
  // const param = Object.assign(s, r,c,{
  //   // "slsTyp": "020004",
  //   // "type": "operAll",
  // });
  // let obj = { "CDptCde": "0237020008900",
  //     "pagePos": 1,
  //     "pageSize": 5,
  //     "totalCount": 0}
  const param = { ...r, ...s }
  // const param = Object.assign(  {
  //   codeListParam: { ...r, ...s },

  //   // parCde: s.cMidCde,
  // });

  console.log('参数', param)


  // pageresult.list = [{
  //   CDptCde: '小日本',
  //   id: '250'
  // }];
  // pageresult.total = 1

  carSelCountryPort(param).then((res) => {
    const { code, data, msg } = res;

    console.log('返回数据', data)
    if (200 === code) {
      pageresult.list = data;
      pageresult.total = 5

    } else {
      ElMessage.error(msg);
    }
  })
    .finally(() => { });
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
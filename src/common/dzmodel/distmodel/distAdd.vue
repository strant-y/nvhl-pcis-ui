<template>
  <div>
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
  </div>
</template>

<script setup lang="ts">
import {
  AppTableConfig,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { useRoute } from "vue-router";
const route = useRoute();
import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";
import { saveDist } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { codeListViewStore } from "@/store";
const opertaor = dataOpertaor();
const param = ref({});
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const { getRules } = useValidator();
const tableRef = ref<MyTableMethod | null>(null);
const codeListStore = codeListViewStore();

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
  handleQuery: {
    type: Function,
    required: false,
  },
  rowData: {
    type: Object,
    default: () => ({}),
  },
});
const getCComponentTable = () => {
  const cProdNo = route.params.param.cProdNo;
  if (cProdNo === "040001") return "AddressDist";
  if (cProdNo === "043002") return "VehicleDist";
  if (cProdNo === "040020") return "PersonnelDist";
  if (cProdNo === "042001") return "DesignDist";
  if (cProdNo === "042003") return "EducatorDist";
  if (cProdNo === "043001") return "ElevatorDist";
  if (cProdNo === "043007") return "VehicleDist";
  if (cProdNo === "043010") return "EducatorDist";
  if (cProdNo === "043013") return "PollutionDist";
  if (cProdNo === "043009") {
    switch (props.data.tab) {
      case "实际用工地址/工程项目地址清单":
        return "ProjectDist";
      case "从业人员清单":
        return "EmployeeDist";
      case "从业人员清单汇总":
        return "DistSummary";
      default:
        return "";
    }
  }
  if (cProdNo === "040002") {
    switch (props.data.tab) {
      case "雇员清单":
        return "EmployeeDist";
      case "雇员清单汇总":
        return "DistSummary";
      case "车辆清单":
        return "VehicleDist";
      case "车辆清单汇总":
        return "DistSummary";
      default:
        return "";
    }
  }
  if(cProdNo === "040003"){
    switch(props.data.tab){
      case "产品清单":
        return "ProductDist";
      case "销售区域清单":
        return "SalesDist";
      default:
        return "";
    }
  }
  if(cProdNo === "040005"){
    switch(props.data.tab){
      case "地址清单信息":
        return "AddressDist";
      case "人员清单":
        return "EducatorDist";
      default:
        return "";
    }
  }
  if(cProdNo === "043020"){
    switch(props.data.tab){
      case "房屋清单":
        return "AddressDist";
      case "家庭成员清单":
        return "FamilyDist";
      default:
        return "";
    }
  }
  if(cProdNo === "045001"){
    switch(props.data.tab){
      case "雇员清单信息":
        return "EmployeeDist";
      case "工程项目地址清单":
        return "ProjectDist";
      default:
        return "";
    }
  }
  return "";
};
const cComponentTable = getCComponentTable();

const dataParams = ref({});
const appNo = ref("");
const emits = defineEmits(["handleClose"]);
const formconfigdist = ref<Record<string, any>>({});
const formconfig1 = ref<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "新增信息",
    fromSchema: [],
    fromUi: createFromUiConfig({
      cols: 2,
    }),
    titleBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "确定",
        func: async () => {
          const isValid = await freeEditRef.value?.validate();
          if(isValid){
            const s = freeEditRef.value?.getFromValue();
            const params = Object.assign(
              {
                cProdNo: route.params.param.cProdNo,
                cComponentTable: cComponentTable,
                cAppNo: appNo.value,
              },
              { dist: s }
            );
            saveDist(params).then((res) => {
              if (res.code === 200) {
                ElMessage.success(res.msg);
                emits("handleClose");
                props.method.handleQuery();
              } else {
                ElMessage.error(res.msg);
              }
            });
          }
          // freeEditRef.value?.validate().then(() => {
            
          // });
        },
      }),
      createFreeButtonBase({
        label: "取消",
        func: () => {
          emits("handleClose");
        },
      }),
    ],
  })
);

onMounted(() => {
  dataParams.value = opertaor.getDataAll();
  appNo.value = dataParams.value.plyBase["Base.cAppNo"];
  
  let newSchema = [];
  let cIs= opertaor.getTableRefs()['tgt']?.getFromValue()['Tgt.cIsinsuranceRegistered']  //  是否记名投保
  for(let i = 0; props.data.fromSchema && i < props.data.fromSchema.length; i++){
    let item = JSON.parse(JSON.stringify(props.data.fromSchema[i]));
    if(['Dist.AllOccup'].includes(item.prop)) {
      item["func"] = getDistoccupType;
    }else if (props.data.fromSchema[i]["func"]) {
      item["func"] = props.data.fromSchema[i]["func"];
    }
    if (props.data.fromSchema[i]["tableClick"]) {
      item["tableClick"] = props.data.fromSchema[i]["tableClick"];
    }

    if(cIs == 1 && item.prop !=='Dist.nSeqNo'){
        item['rules'] = [{ required: true, message: '该项为必填项', trigger: 'blur' }];
    }else if(cIs == 0 && (item.prop !=='Dist.cSchoolName' && item.prop !=='Dist.cSchoolAddress')){
      item['rules'] =null;
    }
    item["disabled"] = false;
    newSchema.push(item);
  }

  formconfig1.value.fromSchema = newSchema;
  
  formconfig1.value.title = props.data.title;
  if (props.data.title == "编辑") {
    setTimeout(() => {
      freeEditRef.value?.setFormValue(props.data.rowData);
    }, 100);
  } else {
  }
});

  //根据获取的职业类别查询职业等级并绑定下拉框
const getDistoccupType = (val) => {
  if(!val || val.length < 3) return;
  codeListStore.queryCodeList({
    codeListName: "Occupt_ZYLB",
    codeListParam: {cParCde: val.at(-1)},
  }).then((res) => {
    const item = freeEditRef.value?.getFromSchemaItem('Dist.cOccupationalLevel')
    //给表单下拉项赋值
    item.itemConfig.loadData = res
  });
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

<style scoped></style>

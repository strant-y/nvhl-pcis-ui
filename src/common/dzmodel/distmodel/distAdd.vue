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
const opertaor = dataOpertaor();
const param = ref({});
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const { getRules } = useValidator();
const tableRef = ref<MyTableMethod | null>(null);
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
  if (cProdNo == "040001") {
    return "AddressDist";
  } else if (cProdNo == "040002") {
    if (title == "雇员清单") {
      return "EmployeeDist";
    } else if (title == "雇员清单汇总") {
      return "DistSummary";
    } else if (title == "车辆清单") {
      return "VehicleDist";
    } else if (title == "车辆清单汇总") {
      return "DistSummary";
    }
  } else if (cProdNo == "040003") {
    if(title == "产品清单"){
      return "ProductDist";
    }else if(title =="销售区域清单"){
      return "SalesDist";
    }
  } else if(cProdNo == "040005"){
    if(title =="地址清单信息"){
      return "AddressDist";
    }else if(title == "人员清单"){
      return "EducatorDist"
    }
  }else if(cProdNo == "040020"){
      return "PersonnelDist";
  }else if(cProdNo == "042001"){
      return "DesignDist"
  }else if(cProdNo == "042003"){
      return "EducatorDist"
  }else if(cProdNo == "043001"){
    return "ElevatorDist";
  } else if (cProdNo == "043002") {
    return "VehicleDist";
  } else if(cProdNo == "043007"){
    return "VehicleDist";
  }else if (cProdNo == "043009") {
    if (title == "实际用工地址/工程项目地址清单") {
      return "ProjectDist";
    } else if (title == "从业人员清单") {
      return "EmployeeDist";
    } else if (title == "从业人员清单汇总") {
      return "DistSummary";
    }
  }else if(cProdNo == "043010"){
    return "EducatorDist"
  } else if(cProdNo == "043013"){
    return "PollutionDist"
  }else if(cProdNo =="043020"){
    if(title =="房屋清单"){
      return "AddressDist"
    }else if(title =="家庭成员清单"){
      return "FamilyTgt"
    }
  }else if(cProdNo =="045001"){
    if(title =="雇员清单信息"){
      return "EmployeeDist"
    }else if(title =="工程项目地址清单"){
      return "ProjectDist"
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
        func: () => {
          freeEditRef.value?.validate().then(() => {
            const s = freeEditRef.value?.getFromValue();
            // const processedData = Object.keys(s).reduce(
            //   (acc, key) => {
            //     const newKey = key.replace(/^Dist\./, "");
            //     acc[newKey] = s[key];
            //     return acc;
            //   },
            //   {} as Record<string, any>
            // );
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
          });
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
  formconfig1.value.fromSchema = props.data.fromSchema;
  formconfig1.value.title = props.data.title;
  if (props.data.title == "编辑") {
    setTimeout(() => {
      freeEditRef.value?.setFormValue(props.data.rowData);
    }, 100);
  } else {
  }
});
</script>

<style scoped></style>

<template>
  <div>
    <myCard :cardConfig="cardconfig">
      <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="distTableRef"
      />
    </myCard>
    <comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
import {
  AppGridEditMethod,
  createAppGridEditConfig,
} from "@/shared/app-grid-edit-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import {
  selectDist,
  checkAppBase,
  deleteDist,
  downloadDistTemplate,
  syncDist,
} from "@/api/prod/index";
import { saveAs } from "file-saver";
import { formInit } from "@/shared/from-init";
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
const policyService = new PolicyService();
import { CardConfig, creatCardConfig } from "@/shared/mytemplate/card-config";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { useRoute } from "vue-router";
const route = useRoute();
const dialog = ref<DialogMethod | null>(null);
const opertaor = dataOpertaor();
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const distTableRef = ref<AppTableMethod | null>(null);
const cardconfig = ref<CardConfig>(creatCardConfig({}));
const formconfig1 = ref<Record<string, any>>({});
const tableconfig = ref<AppTableConfig>(createTableEditConfig());

// 声明全局变量
let cComponentTableValue: string;

// 封装获取 cComponentTableValue 的逻辑
const getCComponentTableValue = (cProdNo: string, title: string): string => {
  if (cProdNo == "040001") {
    return "AddressDist";
  } else if (cProdNo == "043002") {
    return "VehicleDist";
  } else if (cProdNo == "043009") {
    if (title == "实际用工地址/工程项目地址清单") {
      return "ProjectDist";
    } else if (title == "从业人员清单") {
      return "EmployeeDist";
    } else if (title == "从业人员清单汇总") {
      return "DistSummary";
    }
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
  }
  return "";
};

onMounted(async () => {
  const processedFromSchema = props.pageSchema.fromSchema.map((item) => {
    return Object.keys(item).reduce(
      (acc, key) => {
        if (typeof item[key] === "string" && item[key].startsWith("Dist.")) {
          acc[key] = item[key].replace(/^Dist\./, "");
        } else {
          acc[key] = item[key];
        }
        return acc;
      },
      {} as Record<string, any>
    );
  });
  const formconfig11 = formInit(
    JSON.stringify({ ...props.pageSchema, fromSchema: processedFromSchema }),
    method,
    exRules
  );
  Object.assign(formconfig1.value, formconfig11);
  cardconfig.value.title = formconfig1.value.title;
  tableconfig.value.showEdit = true;
  tableconfig.value.fromSchema = formconfig1.value.fromSchema;
  tableconfig.value.formconfig = createAppGridEditConfig({
    titleBtns: formconfig1.value.titleBtns,
    fromSchema: formconfig1.value.distSchema,
  });
  console.log(formconfig11.editBtns);
  if (formconfig11.editBtns && formconfig11.editBtns.length > 0) {
    tableconfig.value.tableBtnType = "btn";
    tableconfig.value.tableBtnWidth = 150;
    tableconfig.value.tableBtnPosition = "right";
    tableconfig.value.tableBtn = formconfig11.editBtns;
  }
  // 初始化 cComponentTableValue
  cComponentTableValue = getCComponentTableValue(
    route.params.param.cProdNo,
    formconfig1.value.title
  );
  setTimeout(() => {
    method.handleQuery();
  }, 500);
});

// 绑定方法
const method = {
  func1: () => {},
  handleClose: (val) => {},
  editmethod: (row: any) => {
    dialog.value?.open(
      "distAdd",
      {
        fromSchema: tableconfig.value.fromSchema,
        title: "编辑",
        rowData: row,
      },
      {
        isOk: (res: any) => {},
        handleQuery: method.handleQuery, // 新增：将 handleQuery 方法传递给 distAdd 组件
      },
      { width: "60" }
    );
  },
  delmethod: (row: any) => {
    deleteDist({
      cComponentTable: cComponentTableValue,
      cPkId: [row.cPkId],
    }).then((res: any) => {
      if (res.code === 200) {
        ElMessage.success("删除成功");
        method.handleQuery();
      }
    });
  },
  funcdistadd: () => {
    let baseFlag = opertaor.getDataAll().plyBase["Base.cAppNo"];
    checkAppBase({ cAppNo: baseFlag }).then((res) => {
      if (res.code === 200) {
        dialog.value?.open(
          "distAdd",
          {
            fromSchema: tableconfig.value.fromSchema,
            title: "新增",
            tab: formconfig1.value.title,
          },
          {
            isOk: (res: any) => {},
            handleQuery: method.handleQuery, // 新增：将 handleQuery 方法传递给 distAdd 组件
          },
          { width: "60" }
        );
      } else {
        ElMessage.error("请先保存申请单!");
      }
    });
  },
  handleQuery: () => {
    const param = opertaor.getParam();
    let app = '';
    if(param.cAppNo ){
      app = param.cAppNo;
    }else{
      app = opertaor.getDataAll().plyBase["Base.cAppNo"]
    }
    const selData = {
      cComponentTable: cComponentTableValue,
      cAppNo: app,
    };
    selectDist(selData).then((res) => {
      if (res.code === 200) {
        pageresult.list = [];
        pageresult.list = res.data;
        pageresult.list.forEach((item, index) => {
          item.nSeqNo = index + 1;
        });
      }
    });
  },
  distSummeryQuery: () => {
    syncDist({
      cComponentTable: cComponentTableValue,
      cAppNo: opertaor.getDataAll().plyBase["Base.cAppNo"],
    }).then((res) => {
      if (res.code == 200) {
        pageresult.list = [];
        pageresult.list = res.data;
        pageresult.list.forEach((item, index) => {
          item.nSeqNo = index + 1;
        });
      }
    });
  },
  carInfoAdd: () => {
    let baseFlag = opertaor.getDataAll().plyBase["Base.cAppNo"];
    checkAppBase({ cAppNo: baseFlag }).then((res) => {
      if (res.code === 200) {
        dialog.value?.open(
          "distAdd",
          {
            fromSchema: tableconfig.value.fromSchema,
            title: "新增",
            tab: formconfig1.value.title,
          },
          {
            isOk: (res: any) => {},
            handleQuery: method.handleQuery, //将 handleQuery 方法传递给 distAdd 组件
          },
          { width: "60" }
        );
      } else {
        ElMessage.error("请先保存申请单!");
      }
    });
  },
  //模板下载
  downloadTemp: () => {
    policyService
      .downloadDistTemplate(formconfig1.value)
      .then((res) => {
        if (res.size <= 0) {
          ElMessage.error({ message: "下载出错", duration: 3000 });
          return;
        }
        const fileName = `营业场所地址清单.xls`;
        const blob = new Blob([res.data], {
          responseType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8",
        });
        saveAs(blob, fileName);
      })
      .catch(() => {
        ElMessage.error("模板下载失败");
      });
  },
};

// 绑定特殊验证器
const exRules = {};
</script>

<style scoped></style>

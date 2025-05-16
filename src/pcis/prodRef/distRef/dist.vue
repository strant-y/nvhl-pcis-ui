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
  exportDist
} from "@/api/prod/index";
import { saveAs } from "file-saver";
import { formInit } from "@/shared/from-init";
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
const policyService = new PolicyService();
import { CardConfig, creatCardConfig } from "@/shared/mytemplate/card-config";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { useRoute } from "vue-router";
import { runInThisContext } from "vm";
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
  console.log(title,"title00000")
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

const formconfig11 = ref<any>({});
onMounted(async () => {
  console.log(tableconfig.value,"09999")
  // const processedFromSchema = props.pageSchema.fromSchema.map((item) => {
  //   return Object.keys(item).reduce(
  //     (acc, key) => {
  //       if (typeof item[key] === "string" && item[key].startsWith("Dist.")) {
  //         acc[key] = item[key].replace(/^Dist\./, "");
  //       } else {
  //         acc[key] = item[key];
  //       }
  //       return acc;
  //     },
  //     {} as Record<string, any>
  //   );
  // });
  formconfig11.value = formInit(
    // JSON.stringify({ ...props.pageSchema, fromSchema: processedFromSchema }),
    JSON.stringify({ ...props.pageSchema }),
    method,
    exRules
  );
  Object.assign(formconfig1.value, formconfig11.value);
  cardconfig.value.title = formconfig1.value.title;
  tableconfig.value.showEdit = true;
  tableconfig.value.fromSchema = formconfig1.value.fromSchema;
  tableconfig.value.formconfig = createAppGridEditConfig({
    titleBtns: formconfig1.value.titleBtns,
    fromSchema: formconfig1.value.distSchema,
  });
  tableconfig.value.tableBtnType = "btn";
  tableconfig.value.tableBtnWidth = 150;
  tableconfig.value.tableBtnPosition = "right";
  if (formconfig11.value.editBtns && formconfig11.value.editBtns.length > 0) {
    let btns: any[] = [];
    btns = formconfig11.value.editBtns.filter((btn: any) => !btn.hidden);
    if (btns && btns.length > 0) {
      tableconfig.value.tableBtn = btns;
    }
  }
  // 初始化 cComponentTableValue
  cComponentTableValue = getCComponentTableValue(
    route.params.param.cProdNo,
    formconfig1.value.title
  );
  setTimeout(() => {
    method.handleQuery();
  }, 500);

  // 电梯信息清单
  let tgtRef = opertaor.getTableRefByKey('tgt')
  tgtRef.setValue("Tgt.nElevatorsNumber",pageresult.list.length)
});

// const  modifyRules = (data, fieldValue)=> {
//     data.forEach(item => {
//         if (fieldValue === 0) {
//             // 如果 fieldValue 是 1，把所有 rules 改成 null
//             item.rules = null;

//         } else if (fieldValue === 1) {
//             // 如果 fieldValue 是 2，只为没有规则的字段添加必填规则
//             if (!item.rules || (item.rules && !item.rules.some(rule => rule.required === true && rule.message === '该项为必填项'))) {
//                 item.rules = [{ required: true, message: '该项为必填项', trigger: 'blur' }];
//             }
//         }
//     });
// }  Tgt.nEngineeringCost nEngineeringCostChange

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
      cPkId: [row['Dist.cPkId']],
    }).then((res: any) => {
      if (res.code === 200) {
        ElMessage.success("删除成功");
        method.handleQuery();
      }
    });
  },
  //  042003 根据电梯条数反
  funcdistadd: () => {
    console.log("22", opertaor.getTableRefs());
    let baseFlag = opertaor.getDataAll().plyBase["Base.cAppNo"];

    let fromSchema = tableconfig.value.fromSchema;
    let cIs= opertaor.getTableRefs()['tgt'].getFromValue()['Tgt.cIsinsuranceRegistered']  //  是否记名投保
    
    if(cIs == 1){
      fromSchema?.forEach((item,index) =>{
        // if(item.) Dist.nSeqNo   Dist.cPlanNo Dist.cPlanNo
        if(item.prop !=='Dist.nSeqNo'){
          item.rules = [{ required: true, message: '该项为必填项', trigger: 'blur' }];
        }
      })
    }else if(cIs == 0){
      fromSchema?.forEach((item,index) =>{
        if(item.prop !=='Dist.cSchoolName' && item.prop !=='Dist.cSchoolAddress'){
          item.rules =null;
        }
      })
    }

    checkAppBase({ cAppNo: baseFlag }).then((res) => {
      if (res.code === 200) {
        dialog.value?.open(
          "distAdd",
          {
            fromSchema: fromSchema,
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
    let tgtRef = opertaor.getTableRefByKey('tgt')
    const param = opertaor.getParam();
    console.log(param);
    let app = "";
    if (param.cOrgAppNo) {
      app = param.cOrgAppNo;
    } else {
      app = opertaor.getDataAll().plyBase["Base.cAppNo"];
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
        tgtRef.setValue("Tgt.nElevatorsNumber",res.data.length)
      }
    });
  },
  distSummeryQuery: () => {
    syncDist({
      cComponentTable: "DistSummary",
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
  //导出
  exportExcel: () => {
    let paramitem  = Object.assign(formconfig1.value, {
      cComponentTable: cComponentTableValue,
      cAppNo: opertaor.getDataAll().plyBase["Base.cAppNo"],
    });
    policyService
      .exportDist(paramitem).then((res) => {
        if (res.size <= 0) {
          ElMessage.error({ message: "导出出错", duration: 3000 });
          return;
        }
        const fileName = `营业场所地址清单.xls`;
        const blob = new Blob([res.data], {
          responseType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8",
        });
        saveAs(blob, fileName);
      })
  },
  //导入
  importDist() {
    policyService.importDist(formconfig1.value).then((res) => {
      ElMessage.success({ message: "导入成功", duration: 3000 });
    });
  },
  //根据获取的职业类别查询职业等级并绑定下拉框
  getDistoccupType:(val) => {
    codeListStore
        .queryCodeList({
          codeListName: "Occupt_ZYLB",
          codeListParam: {cParCde: val.at(-1)},
        })
        .then((res) => {
          console.log("职业等级下拉值",res);
        setFormItem("Dist.cOccupationalLevel", {
          loadData: res,
        });
    })
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
//给表单下拉项赋值
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
        console.log(`Updated item for key ${key}:`, item);
      }
    });
  }
}
function setUnDisabledByKeyList(key: any) {
  cardconfig.value.endBtns?.forEach((item: any) => {
    if ("Btn_" + item.id === key) {
      item.hidden = false;
    }
  });
  cardconfig.value.titleBtns?.forEach((item: any) => {
    if ("Btn_" + item.id === key) {
      item.hidden = false;
    }
  });
  // tableconfig.value.tableBtn?.forEach((item: any) => {
  //   if(item.id = key){
  //     item.hidden = false;
  //   }
  // });
  formconfig11.value.editBtns?.forEach((item: any) => {
    if ("Btn_" + item.id === key) {
      tableconfig.value.tableBtn?.push(item);
    }
  });
}

function getFormconfig() {
  return {
    fromType: "custom",
  };
}

// 绑定特殊验证器
const exRules = {};

defineExpose({
  getFormconfig,
  setUnDisabledByKeyList,
});
</script>

<style scoped></style>

<template>
  <div>
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="distTableRef"
    />
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
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const route = useRoute();
const dialog = ref<DialogMethod | null>(null);
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
  compKey: {
    type: String,
    required: false,
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
const formconfig1 = ref<Record<string, any>>({});
const tableconfig = ref<AppTableConfig>(createTableEditConfig());

// 声明全局变量
let cComponentTableValue: string;

// 封装获取 cComponentTableValue 的逻辑
const getCComponentTableValue = (cProdNo: string, title: string): string => {
  if (cProdNo == "040001") {
    return "AddressDist";
  } else if (cProdNo == "040002") {
    if (title == "雇员清单") {
      return "EmployeeDist";
    } else if (title == "雇员清单汇总") {
      return "EmployeeDist";
      // return "DistSummary";
    } else if (title == "车辆清单") {
      return "VehicleDist";
    } else if (title == "车辆清单汇总") {
      // return "DistSummary";
      return "VehicleDist";
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
        return "EmployeeDist";
      // return "DistSummary";
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
  formconfig11.value = formInit(
    JSON.stringify({ ...props.pageSchema }),
    method,
    exRules
  );
  formconfig11.value?.fromSchema.forEach((item:any) => {
    if(item.title === "投保从业人员人数") {
      item.width = 110
    }
    if(item.title === "方案号") {
      item.width = 80
    }
  })
  // 如果团个单标识为团单则展示关联被保险人，否则隐藏
  if(route.params.param?.cGrpMrk !== '1') {
    formconfig11.value.fromSchema = formconfig11.value.fromSchema.filter((item:any) => item.prop !== 'DistSummary.cRelatedInsured')
  }
  Object.assign(formconfig1.value, formconfig11.value);
  tableconfig.value.showEdit = true;
  tableconfig.value.fromSchema = formconfig1.value.fromSchema;
  tableconfig.value.formconfig = createAppGridEditConfig({
    titleBtns: formconfig1.value.titleBtns,
    fromSchema: formconfig1.value.distSchema,
  });
  tableconfig.value.tableBtnType = "btn";
  tableconfig.value.tableBtnWidth = 150;
  tableconfig.value.tableBtnPosition = "right";
  tableconfig.value.title = formconfig1.value.title;
  if (formconfig11.value.editBtns && formconfig11.value.editBtns.length > 0) {
    let btns: any[] = [];
    btns = formconfig11.value.editBtns.filter((btn: any) => !btn.hidden);
    if (btns && btns.length > 0) {
      tableconfig.value.tableBtn = btns;
    }
  }
  // 初始化 cComponentTableValue
  cComponentTableValue = getCComponentTableValue(
    route.params.param?.cProdNo,
    formconfig1.value.title
  );
  nextTick(() => {
    handleQuery();
  });
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
        handleQuery: handleQuery, // 新增：将 handleQuery 方法传递给 distAdd 组件
      },
      { width: "60" }
    );
  },
  delmethod: (row: any) => {
    const param = {
      cComponentTable: cComponentTableValue,
      cPkId: [row.cPkId],
    }
    if(route.params.param?.pageName === "priceInquiry") {
      param['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
    } else {
      param['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
    }
    deleteDist(param).then((res: any) => {
      if (res.code === 200) {
        ElMessage.success("删除成功");
        handleQuery();
      }
    });
  },
  funcdistadd: () => {
    const param = {};
    if(route.params.param?.pageName === "priceInquiry") {
      param['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
    } else {
      param['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
    }
    checkAppBase(param).then((res) => {
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
            handleQuery: handleQuery, // 新增：将 handleQuery 方法传递给 distAdd 组件
          },
          { width: "60" }
        );
      } else {
        ElMessage.error("请先保存申请单!");
      }
    });
  },
  distSummeryQuery: () => {
    query({
      cComponentTable: cComponentTableValue,
      cAppNo: opertaor.getDataAll().plyBase["Base.cAppNo"],
    });
  },
  carInfoAdd: () => {
    const param = {};
    if(route.params.param?.pageName === "priceInquiry") {
      param['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
    } else {
      param['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
    }
    checkAppBase(param).then((res) => {
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
            handleQuery: handleQuery, //将 handleQuery 方法传递给 distAdd 组件
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

const handleQuery = () => {
  const param = opertaor.getParam();
  let app = "";
  if (opertaor.getDataAll()?.plyBase["Base.cAppNo"]) {
    app = opertaor.getDataAll().plyBase["Base.cAppNo"];   
  } else if(param.cOrgAppNo){
    app = param.cOrgAppNo;
  } else if(param.pageType !== "copy") {
    app = param.cAppNo
  }
  const queryParam = {
    cComponentTable: distCompKey.value,
    ...{isSummary: '1'}
  }
  if(route.params.param?.pageName === "priceInquiry") {
    queryParam['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
  } else {
    queryParam['cAppNo'] = app;
  }
  if(route.params.param?.pageType && route.params.param?.pageType === "EDR_APP_NEW_SCENE") {
    queryParam['voType'] = "ply"
  }
  query(queryParam);
}

const query = (param: any) => {
  selectDist(param).then((res) => {
    if (res.code == 200) {
      pageresult.list = [];
      pageresult.list = res.data.data.map((item, index) => {
        return{
            ... item,
            ... {
                nSeqNo: index + 1,
                'DistSummary.AllOccup': [
                    item['DistSummary.cMajorCategories'], item['DistSummary.cMediumClassification'], item['DistSummary.cOccupationalSubcategory']
                ],
            }
        };
      });
      
      let cProdNo = route.params.param?.cProdNo;
      if (cProdNo == "040002" && param.cComponentTable !== 'VehicleDist') {
          if(pageresult.list.length>0){
            const termref = opertaor.getTableRefByKey("cvrg");
            interface Item {
              nInsuredHeadcount?: number | null | string;
            }
            // const countNumber: number = (pageresult.list as Item[]).reduce((sum, item) => {
            //   const value = Number(item['DistSummary.nInsuredHeadcount'] ?? 0);
            //   return sum + (isNaN(value) ? 0 : value);
            // }, 0);
            // // console.log('countNumber',countNumber)
            // termref?.setTermData({
            //   termNo:'00425000091',
            //   planNo:'P1',
            //   factorProp: 'Term.nInsuredCount',
            // },countNumber);   
            const planList = [...new Set(pageresult.list?.map((item:any) => item['DistSummary.cPlanNo']) || [])];
            planList.forEach((planNo:any) => {
              const list = pageresult.list?.filter((item:any) => item['DistSummary.cPlanNo'] === planNo) || [];
              const planCountNumber: number = (list as Item[])
              .filter((item:any) => item['DistSummary.cPlanNo'] === planNo)
              .reduce((sum, item:any) => {
                const value = Number(item['DistSummary.nInsuredHeadcount'] ?? 0);
                return sum + (isNaN(value) ? 0 : value);
              }, 0);
              termref?.setTermData({
                termNo:'00425000091',
                planNo:planNo,
                factorProp: 'Term.nInsuredCount',
              },planCountNumber);   
            });
        }
      }
    }
  });
}


function setUnDisabledByKeyList(key: any) {
  tableconfig.value.formconfig.endBtns?.forEach((item: any) => {
    if ("Btn_" + item.id === key) {
      item.hidden = false;
    }
  });
  tableconfig.value.formconfig.titleBtns?.forEach((item: any) => {
    if ("Btn_" + item.id === key) {
      item.hidden = false;
    }
  });
  tableconfig.value.tableBtn?.forEach((item: any) => {
    if ("Btn_" + item.id === key) {
      item.hidden = false;
    }
  });
}

function getFormconfig() {
  return {
    fromType: "custom",
  };
}

function setTableData(data: any) {
  if (data && data.length > 0) {
    pageresult.list = data.map((item:any, index:number) => {
      return{
        ... item,
        ... {
          nSeqNo: index + 1,
          'DistSummary.AllOccup': [
            item['DistSummary.cMajorCategories'], item['DistSummary.cMediumClassification'], item['DistSummary.cOccupationalSubcategory']
          ],
        }
      };
    });
  }
}

// 绑定特殊验证器
const exRules = {};
const distCompKey = ref<string>();
function setDistCompKey(key: string) {
  distCompKey.value = key;
}
defineExpose({
  getFormconfig,
  setUnDisabledByKeyList,
  handleQuery,
  setTableData,
  setDistCompKey
});
</script>
<style scoped>
:deep(.table-container > .el-card__header) {
  height: 32px;
  padding: 4px 0 4px 12px;
}
</style>

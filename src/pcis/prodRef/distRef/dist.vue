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
import { getAddressStr } from "@/api/query";
import { saveAs } from "file-saver";
import moment from "moment";
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
import { AppFreeEditMethod } from "@/shared/app-free-edit-config";
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
const applicantEditRef = ref<AppFreeEditMethod | null>(null);
const distTableRef = ref<AppTableMethod | null>(null);
const cardconfig = ref<CardConfig>(creatCardConfig({}));
const formconfig1 = ref<Record<string, any>>({});
const tableconfig = ref<AppTableConfig>(createTableEditConfig());

let fileBase: string;
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
      return "FamilyDist"
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
  formconfig1.value.fromSchema.forEach((e: any)=>{  // 隐藏不需要显示在表格内的数据
    if(e.cShowLocation === '0'){
      e.isShow = false
    }
    return e;
  });
  tableconfig.value.fromSchema = formconfig1.value.fromSchema;
  tableconfig.value.formconfig = createAppGridEditConfig({
    titleBtns: formconfig1.value.titleBtns,
    fromSchema: formconfig1.value.distSchema,
  });
  tableconfig.value.fromSchema.forEach( r => r['onInit'] = rowChange);
  tableconfig.value.tableBtnType = "btn";
  tableconfig.value.tableBtnWidth = 150;
  tableconfig.value.tableBtnPosition = "right";
    tableconfig.value.isPage = false;
  if (formconfig11.value.editBtns && formconfig11.value.editBtns.length > 0) {
    let btns: any[] = [];
    btns = formconfig11.value.editBtns;
    if (btns && btns.length > 0) {
      tableconfig.value.tableBtn = btns;
    }
  }
  tableconfig.value.isPage = false;
  // 初始化 cComponentTableValue
  cComponentTableValue = getCComponentTableValue(
    route.params.param.cProdNo,
    formconfig1.value.title
  );
  nextTick(() => {
    method.handleQuery();
  });

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
          tab: formconfig1.value.title
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
    const alldata: any = opertaor.getDataAll();
    let baseFlag = alldata['plyBase']["Base.cAppNo"];

    let fromSchema = tableconfig.value.fromSchema;

    checkAppBase({ cAppNo: baseFlag }).then((res: any) => {
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
    let app = "";
    if (param.cOrgAppNo) {
      app = param.cOrgAppNo;
    } else if(opertaor.getDataAll().plyBase["Base.cAppNo"]){
      app = opertaor.getDataAll().plyBase["Base.cAppNo"];
    } else {
      app = route.params.param.cAppNo
    }
    const selData = {
      cComponentTable: cComponentTableValue,
      cAppNo: app,
    };
    selectDist(selData).then((res: any) => {
      if (res.code === 200) {
        pageresult.list = [];
        pageresult.total = res.data.total;
        pageresult.list = res.data.data.map((item, index) => {
          return{
              ... item,
              ... {
                  nSeqNo: index + 1,
                  tOpeningTime: item['Dist.tOpeningTime']
                      ? moment(item['Dist.tOpeningTime']).format("YYYY-MM-DD")
                      : null,
                  'Dist.AllOccup': [
                      item['Dist.cMajorCategories'], item['Dist.cMediumClassification'], item['Dist.cOccupationalSubcategory']
                  ],
              }
          };
        });
        if(tgtRef !=undefined){
          tgtRef.setValue("Tgt.nElevatorsNumber",res.data.length)
        }

        // 刷新汇总表格
        let distSummary045001 = opertaor.getTableRefByKey('DistSummary045001')
        console.log('distSummary045001', distSummary045001)
        distSummary045001?.handleQuery();
      }
    });
  },
  // distSummeryQuery: () => {
  //   syncDist({
  //     cComponentTable: "DistSummary",
  //     cAppNo: opertaor.getDataAll().plyBase["Base.cAppNo"],
  //   }).then((res) => {
  //     if (res.code == 200) {
  //       pageresult.list = [];
  //       pageresult.list = res.data;
  //       pageresult.list.forEach((item, index) => {
  //         item.nSeqNo = index + 1;
  //       });
  //     }
  //   });
  // },
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
        const fileName = decodeURIComponent(res.headers['content-disposition'].split('filename=')[1]);
        const blob = new Blob([res.data], {
          responseType:res.headers["content-type"]
            // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8",
        });
        saveAs(blob, fileName);
      })
  },
  //导入
  importExcel() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls, .xlsm'; // 支持的文件类型
    input.onchange = () => {
      if (input.files?.length) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
        const base64String = e.target?.result as string;

        // ✅ 此处赋值有效
        // fileBase = base64String.split(',')[1]; // 去掉 data:image/type;base64, 前缀

        // console.log(fileBase, "0000000"); // ✅ 此处可以正常打印 Base64 字符串

        // 构建参数并请求接口
        const params = {
          ...formconfig1.value,
          file: base64String, // ✅ 正确传入
          cComponentTable: cComponentTableValue,
          cAppNo: opertaor.getDataAll().plyBase["Base.cAppNo"],
        };

        policyService.importDist(params).then((res) => {
          if (res.code === 200) {
            ElMessage.success("导入成功");
            method.handleQuery();
          } else {
            ElMessage.error(res.message || "导入失败");
          }
        }).catch((error) => {
          ElMessage.error("导入出错，请检查文件格式或内容");
          console.error("导入错误：", error);
        });
      };

      reader.onerror = (e) => {
        console.error("文件读取失败", e);
        ElMessage.error("文件读取失败");
      };

      reader.readAsDataURL(file); // 启动读取
      }
    };
    input.click(); // 触发文件选择对话框
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
        const fileName = decodeURIComponent(res.headers['content-disposition'].split('filename=')[1]);
        const blob = new Blob([res.data], {
          responseType:res.headers["content-type"]
            // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8",
        });
        saveAs(blob, fileName);
      })
      .catch(() => {
        ElMessage.error("模板下载失败");
      });
  },
setregistAdd(){
    const ads = distTableRef?.value?.getValue('Dist.AllProp');
    const a = distTableRef?.value?.getValue("Dist.cRegisterSuffixAddr") || "";
    if (ads) {
      getAddressStr({ address: ads }).then((res: any) => {
        const { code, data, msg } = res;
        if (code === 200) {
          const b = (data ? data['addStr'] : "") + a;
          setAddressStr("Dist.cClntAddr", b);
        }
      });
    } else {
      setAddressStr("Dist.cClntAddr", a);
    }
    console.log("清单级联事件触发")
  }
};

const rowChange = (data: any) => {
  const {value, rowData, config, itemRef} = data;
  if(!value || !rowData || !config || !itemRef) return;
  if('Dist.cOccupationalLevel' === config.prop){
    const AllOccup = rowData['Dist.AllOccup'];
    if( AllOccup.length < 3) return;
      codeListStore.queryCodeList({
        codeListName: "Occupt_ZYLB",
        codeListParam: {cParCde: AllOccup.at(-1)},
      }).then((res) => {
        //给表单下拉项赋值
        config.loadData = res;
      }); 
  }
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
function setAddressStr(key: any, data: any) {
  applicantEditRef?.value?.setValue(key, data);
}
function getFromValue() {
  return applicantEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  applicantEditRef?.value?.setFormValue(value);
}

function validate() {
  return true;
}

function setValue(key: string, value: any) {
  applicantEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return applicantEditRef?.value?.getValue(key);
}

function getTableData() {
  return pageresult.list
}

function setTableData(data: any) {
  pageresult.list = data.map((item: any, index: any) => {
    return{
        ... item,
        ... {
            nSeqNo: index + 1,
            tOpeningTime: item['Dist.tOpeningTime']
                ? moment(item['Dist.tOpeningTime']).format("YYYY-MM-DD")
                : null,
            'Dist.AllOccup': [
                item['Dist.cMajorCategories'], item['Dist.cMediumClassification'], item['Dist.cOccupationalSubcategory']
            ],
        }
    };
  });
}

// 绑定特殊验证器
const exRules = {};

defineExpose({
  getValue,
  setValue,
  getFromValue,
  setFormValue,
  getFormconfig,
  setUnDisabledByKeyList,
  handleQuery: method.handleQuery,
  getTableData,
  setTableData,
});
</script>

<style scoped></style>

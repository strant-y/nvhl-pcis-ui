<template>
  <div>
    <myCard :cardConfig="cardconfig">
      <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="distTableRef"
        @pageChange="method.handleQuery($event, true)"
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
  distMapCollectCompKey,
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
import {eventBus} from "@/utils/event-bus";
const route = useRoute();
const dialog = ref<DialogMethod | null>(null);
const opertaor = dataOpertaor();
const params = opertaor.getParam(); 
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
  compKey: {
    type: String
  }
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
const idxParam = inject('idxParam');
let fileBase: string;
// 声明全局变量
let cComponentTableValue: string;

// 封装获取 cComponentTableValue 的逻辑
const getCComponentTableValue = (): string => {
  return props.compKey ? props.compKey.replace(/\d+/g, '') : "";
};

const distSummaryRef = ref(); // 汇总组件对象
const collectCompKey = ref(); // 汇总组件key
const formconfig11 = ref<any>({});
onMounted(async () => {
  // 初始化 cComponentTableValue
  cComponentTableValue = getCComponentTableValue();

  formconfig11.value = formInit(
      JSON.stringify({ ...props.pageSchema }),
      method,
      exRules
  );
  if(params.cProdNo === '040003'){
    formconfig11.value.fromSchema?.forEach(item=>{
      if(item['prop'] ==='Dist.cProductType'){
        item['typeCode'] = 'Product_Type040003';
      }
    })
  }
  if(params.cProdNo === '043009'){
    formconfig11.value.fromSchema?.forEach(item=>{
      if(item['prop'] ==='Dist.cEmploymentAddress' && route.params.param?.cGrpMrk !== '1'){
        item.isShow = false;
      }
    })
  }
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
  tableconfig.value.fromSchema.forEach( r => {
    if(r['prop'] === 'Dist.cVinCode'){  //调整车架号列宽
      r.width = '160';
    }
  });
  tableconfig.value.tableBtnType = "btn";
  tableconfig.value.tableBtnWidth = 150;
  tableconfig.value.tableBtnPosition = "right";
  tableconfig.value.isPage = true;
  if (formconfig11.value.editBtns && formconfig11.value.editBtns.length > 0) {
    let btns: any[] = [];
    btns = formconfig11.value.editBtns;
    if (btns && btns.length > 0) {
      tableconfig.value.tableBtn = btns;
    }
  }
 
  distMapCollectCompKey({
    cProdNo: route.params.param?.cProdNo,
    cComponentKey: props.compKey,
  }).then((res) => {
    collectCompKey.value = res;
    // 获取清单对应的汇总组件对象
    distSummaryRef.value = opertaor.getTableRefByKey(collectCompKey.value);
    if(distSummaryRef.value) {
      // 设置汇总组件里对应的清单vo
      distSummaryRef.value?.setDistCompKey(cComponentTableValue);
    }
    // 初始化页面数据
    method.handleQuery();
  });

  // 电梯信息清单
  let tgtRef = opertaor.getTableRefByKey('tgt');
  if(tgtRef){
    tgtRef.setValue("Tgt.nElevatorsNumber",pageresult.list.length)
  }
  if(distTableRef.value) {
    eventBus.on(`setMap-${props.compKey}`, addCodeListMap);
  }
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

  // grid row 地址级联 初始化
  cOccupationalLevelOnInit: (data: any) => {
    const {value, rowData, config, itemRef} = data;
    if(!value || !rowData || !config || !itemRef) return;
    const AllOccup = rowData['Dist.AllOccup'];
    if( AllOccup.length < 3) return;
    codeListStore.queryCodeList({
      codeListName: "Occupt_ZYLB",
      codeListParam: {cParCde: AllOccup.at(-1)},
    }).then((res) => {
      //给表单下拉项赋值
      config.loadData = res;
    });
  },

  editmethod: (row: any) => {
    dialog.value?.open(
        "distAdd",
        {
          fromSchema: tableconfig.value.fromSchema,
          title: "编辑",
          rowData: row,
          tab: formconfig1.value.title,
          compKey: props.compKey,
          codeListMap: distTableRef.value?.getCodeListMap(),
        },
        {
          isOk: (res: any) => {
            const queryParams = distTableRef.value?.getPartnerPage(false);
            handleQuery: method.handleQuery(queryParams);
          },
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
        const queryParams = distTableRef.value?.getPartnerPage(false);
        method.handleQuery(queryParams, true);
      }
    });
  },
  //  042003 根据电梯条数反
  funcdistadd: () => {
    const alldata: any = opertaor.getDataAll();
    let baseFlag = alldata['plyBase']["Base.cAppNo"];

    let fromSchema = tableconfig.value.fromSchema;
    const tgt = opertaor.getTableRefByKey("tgt");
    if(!!tgt && tgt.getValue('Tgt.cIsRegistered') === '1'){
      fromSchema.forEach(item=>{
        item.rules = [{required: true, message: '该项为必填项', trigger: 'blur'}]
      })
    }else {
      fromSchema.forEach(item=>{
        if(item.prop=== 'Dist.cAssociatedGuardian' || item.prop === 'Dist.cWardName'){
          item.rules = [{required: true, message: '该项为必填项', trigger: 'blur'}]
        }else {
          item.rules = null
        }
      })
    }
    checkAppBase({ cAppNo: baseFlag }).then((res: any) => {
      if (res.code === 200) {
        dialog.value?.open(
            "distAdd",
            {
              fromSchema: fromSchema,
              title: "新增",
              tab: formconfig1.value.title,
              compKey: props.compKey,
              codeListMap: distTableRef.value?.getCodeListMap(),
            },
            {
              isOk: (res: any) => {
                const queryParams = distTableRef.value?.getPartnerPage(false);
                handleQuery: method.handleQuery(queryParams, true);
              },
            },
            { width: "60" }
        );
      } else {
        ElMessage.error("请先保存申请单!");
      }
    });
  },

  handleQuery: (queryParams: any = { pageNum: 1, pageSize: 10 }, isChange: boolean = false) => {
    let tgtRef = opertaor.getTableRefByKey('tgt')
    const param = opertaor.getParam();
    let app = "";
    if (param.cOrgAppNo) {
      app = param.cOrgAppNo;
    } else if(opertaor.getDataAll().plyBase["Base.cAppNo"]){
      app = opertaor.getDataAll().plyBase["Base.cAppNo"];
    } else {
      app = route.params.param?.cAppNo
    }
    const selData = {
      cComponentTable: cComponentTableValue,
      cAppNo: app,
      ...queryParams
    };
    selectDist(selData).then((res: any) => {
      if (res.code === 200) {
        pageresult.list = [];
        pageresult.total = res.data.total;
        pageresult.list = res.data.data.map((item, index) => {
          return{
            ... item,
            ... {
              // 序号全部由后端处理
              // 'Dist.nSeqNo': ((queryParams.pageNum - 1) * queryParams.pageSize) + index + 1,
              tOpeningTime: item['Dist.tOpeningTime']
                  ? moment(item['Dist.tOpeningTime']).format("YYYY-MM-DD")
                  : null,
              'Dist.AllOccup': [
                item['Dist.cMajorCategories'], item['Dist.cMediumClassification'], item['Dist.cOccupationalSubcategory']
              ],
            }
          };
        });

        if(tgtRef !== undefined){
          tgtRef.setValue("Tgt.nElevatorsNumber",res.data.total)
        }

        // 043009 set 被保人关联关系、实际用工地址关联关系 下拉值
        if(props.compKey === 'ProjectDist043009'){
          const insured =  opertaor.getDataAll()['insured'];
          if(insured && insured['Insured.cInsuredCde']) {
            eventBus.emit('setMap-ProjectDist043009', {
              code: 'Dist.cRelatedInsured',
              list: [{
                value: insured['Insured.cInsuredCde'],
                label: insured['Insured.cInsuredNme']
              }]
            });
          }
          eventBus.emit('setMap-EmployeeDist043009', {
            code: 'Dist.cEmploymentAddress',
            list: pageresult.list.map((m: any) => {
              return {
                label: m['Dist.cDetailedAddress'],
                value: m['Dist.cPkId']
              }
            })
          });
        }

        // 刷新汇总表格
        if(distSummaryRef.value) {
          distSummaryRef.value?.handleQuery();
        }

        if(idxParam && isChange) { // 保存清单表格在屏幕中间
          idxParam.handleAnchorClick(undefined, `#${props.compKey}`);
        }
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
              compKey: props.compKey,
              codeListMap: distTableRef.value?.getCodeListMap(),
            },
            {
              isOk: (res: any) => {
                const queryParams = distTableRef.value?.getPartnerPage(false);
                handleQuery: method.handleQuery(queryParams);
              },
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
  //全量导入
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
              ElMessage.success(`导入完成：${res.data.msg}`);
              method.handleQuery();
            } else {
              ElMessage.error(res.msg || "全量导入失败");
            }
          }).catch((error) => {
            ElMessage.error("导入出错，请检查文件格式或内容");
            console.error("导入错误：", error);
          });addCi
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
  // 增量导入
  importExcelIncrement: () => {
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

          policyService.importDistIncrement(params).then((res) => {
            if (res.code === 200) {
              ElMessage.success(`导入完成：${res.data.msg}`);
              method.handleQuery();
            } else {
              ElMessage.error(res.msg || "增量导入失败");
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
  //全量模板下载
  downloadTemp: () => {
    const param = {
      ...formconfig1.value,
      cAppNo: opertaor.getDataAll().plyBase["Base.cAppNo"],
    }
    policyService
        .downloadDistTemplate(param)
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
          ElMessage.error("全量模板下载失败");
        });
  },
  // 增量模板下载
  downloadIncrement: () => {
    const param = {
      ...formconfig1.value,
      cAppNo: opertaor.getDataAll().plyBase["Base.cAppNo"],
    }
    policyService
        .downloadDistTemplateIncrement(param)
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
          ElMessage.error("增量模板下载失败");
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
  },


};

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

function addCodeListMap (data: any) {
  distTableRef.value?.addCodeListMap(data);
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

function handleQuery() {
  const queryParams = distTableRef.value?.getPartnerPage(true);
  method.handleQuery(queryParams);
}

// 绑定特殊验证器
const exRules = {};

onUnmounted(() => {
  eventBus.off(`setMap-${props.compKey}`, addCodeListMap);
});

defineExpose({
  getValue,
  setValue,
  getFromValue,
  setFormValue,
  getFormconfig,
  setUnDisabledByKeyList,
  handleQuery,
  getTableData,
  setTableData,
});
</script>

<style scoped></style>

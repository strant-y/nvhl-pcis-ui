<template>
  <div>
      <app-table
          :tableConfig="tableconfig"
          v-model:pageresult="pageresult"
					@page-change="loadData(false)"
          ref="distTableRef"
          @selection-change="handleSelectionChange"
      />
    <comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
import {
  createAppGridEditConfig,
} from "@/shared/app-grid-edit-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import {
  copyDist,
  deleteDist,
} from "@/api/prod";
import {getAddressStr} from "@/api/query";
import moment from "moment";
import {formInit} from "@/shared/from-init";
import {codeListViewStore} from "@/store";

import {DialogMethod} from "@/common/dzmodel/ComDialogConf";
import {useRoute} from "vue-router";
import {AppFreeEditMethod} from "@/shared/app-free-edit-config";
import {saveAs} from "file-saver";
import cargoApi from "@/api/cargo";
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
import {eventBus} from "@/utils/event-bus";
import {idxParamKey, useIdxParam} from "@/views/pcis/support/useIdxParam";
const policyService = new PolicyService();
const cargoDistAdd = defineAsyncComponent(
    () => import("@/pcis/cargoRef/fix/DistAddFix.vue")
);

const route = useRoute();

const dialog = ref<DialogMethod | null>(null);
const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
  compKey: {
    type: String
  }
});

const idxParam = inject(idxParamKey, useIdxParam());

const formPage = idxParam?.formPage;
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
const applicantEditRef = ref<AppFreeEditMethod | null>(null);
const distTableRef = ref<AppTableMethod | null>(null);
const formconfig1 = ref<Record<string, any>>({});
const tableconfig = ref<AppTableConfig>(createTableEditConfig());

let fileBase: string;
// 声明全局变量
let cComponentTableValue: string;
// 封装获取 cComponentTableValue 的逻辑
const getCComponentTableValue = (): string => {
  return props.compKey ? props.compKey.replace(/\d+/g, '') : "";
};

const tabKey = computed(() => {
  if(props.compKey === 'AgreementDistInsured') {
    return 'ECargoInsured';
  }else {
    return 'ECargoDist';
  }
})
// 复选框选中
const selectedRows = ref<any[]>([]);
function handleSelectionChange(selection: any) {
  selectedRows.value = selection;
}
const formconfig11 = ref<any>({});
onMounted(async () => {
  formconfig11.value = formInit(
      // JSON.stringify({ ...props.pageSchema, fromSchema: processedFromSchema }),
      JSON.stringify({...props.pageSchema}),
      method,
      exRules
  );
  Object.assign(formconfig1.value, formconfig11.value);
  tableconfig.value.title =formconfig1.value.title;
  tableconfig.value.titleBtnPosition = 'right';
  tableconfig.value.showEdit = true;
  tableconfig.value.showSelection = true;
  formconfig1.value.fromSchema.forEach((e: any) => {  // 隐藏不需要显示在表格内的数据
    if (e.cShowLocation === '0') {
      e.isShow = false
    }
    return e;
  });
  tableconfig.value.fromSchema = formconfig1.value.fromSchema;
  tableconfig.value.formconfig = createAppGridEditConfig({
    titleBtns: formconfig1.value.titleBtns,
    fromSchema: formconfig1.value.distSchema,
  });
  if(props.pageSchema.fromUi) {
    tableconfig.value.fromUi['groupBy'] = props.pageSchema.fromUi['groupBy']
  }
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
  cComponentTableValue = getCComponentTableValue();
  nextTick(()=>{
    eventBus.on('transportChange', loadDatOne);
    eventBus.on('transportRefresh', transportRefresh);
    const agreementBaseRef = formPage?.getComponentRefById('AgreementBase')
    if(agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo')){
      loadData()
    }
  })
});
function hasPropertyWithValue(arr, property) {
  return Array.isArray(arr) && arr.some(obj =>
      obj && obj.hasOwnProperty(property) && obj[property] != null
  );
}
const transportRefresh = (val:any)=>{
  if(hasPropertyWithValue(pageresult.list,'ECargoTransportDist.cRowId')) return
  copyDist(val).then((res:any) => {
    if(res && res.code === 200) {
      loadDatOne(val.targetNo)
    } else {
      ElMessage.error(res.msg);
    }
  }).catch((err:any) => {
    ElMessage.error(err.msg);
  })
}
const loadDatOne = (val:any)=>{
  if(!val) return
  const r = distTableRef.value?.getPartnerPage(true); //获取分页数据
  let param = Object.assign({cComponentTable:'ECargoTransportDist',cEcAgrAppNo:val || ''}, r);
  cargoApi.selectDistNew(param).then((res: any) => {
    if(res.code === 200) {
      pageresult.list = res.data.data
      pageresult.total = res.data.total
    }else {
      ElMessage.success(res.msg);
    }
  })
}
const loadData = (flag = true)=>{
  const r = distTableRef.value?.getPartnerPage(flag); //获取分页数据
	const agreementBaseRef = formPage?.getComponentRefById('AgreementBase')
	let param = Object.assign({cComponentTable:cComponentTableValue,cEcAgrAppNo:agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo') || ''}, r);
	cargoApi.selectDistNew(param).then((res: any) => {
		if(res.code === 200) {
			if(res.data.data.length > 0 ){
				pageresult.list = res.data.data
				pageresult.total = res.data.total
			} else {
				pageresult.list = []
				pageresult.total = 0
			}
		}else {
			ElMessage.success(res.msg);
		}
	})
}

const saveTgt = async (res:any)=>{
  const agreementBaseRef = formPage?.getComponentRefById('AgreementBase')
  const newRow = {
    cComponentTable:cComponentTableValue,
    ECargoTransportDist:{...
          res,
      'ECargoTransportDist.cEcAgrNo':agreementBaseRef.getValue('ECargoBase.cEcAgrNo') || '',
    },
    cEcAgrAppNo:agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo') || ''
  };
  const result =  await cargoApi.saveDistNew(newRow)
  loadData()
}
// 绑定方法
const method = {
	// 详情
  viewmethod: (row: any) => {
    console.log('row', row)
    dialog.value?.open(
        cargoDistAdd,
        {
          fromSchema: tableconfig.value.fromSchema,
          fromUi: tableconfig.value.fromUi,
          title: "详情",
          rowData: row,
          compKey: props.pageSchema.compKey
        },
				{},
        {width: "60"}
    );
  },
	// 新增
  addmethod: (row: any) => {
		const agreementBaseRef = formPage?.getComponentRefById('AgreementBase')
    const cappNo  = agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo') || ''
    if (cappNo == '' || cappNo == undefined) {
      ElMessage.warning('请先保存投保单'); // 提示用户保存投保单
      return;
    }
    dialog.value?.open(
        cargoDistAdd,
        {
          fromSchema: tableconfig.value.fromSchema,
          fromUi: tableconfig.value.fromUi,
          title: "新增",
          rowData: row,
          compKey: props.pageSchema.compKey
        },
        {
          isOk: (res: any) => {
            saveTgt(res)
          },
        },
        {width: "60"}
    );
  },
	// 编辑
  editmethod: (row: any) => {
		const agreementBaseRef = formPage?.getComponentRefById('AgreementBase')
    const cappNo  = agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo') || ''
    if (cappNo == '' || cappNo == undefined) {
      ElMessage.warning('请先保存投保单'); // 提示用户保存投保单
      return;
    }
    dialog.value?.open(
        cargoDistAdd,
        {
          fromSchema: tableconfig.value.fromSchema,
          fromUi: tableconfig.value.fromUi,
          title: "编辑",
          rowData: row,
          compKey: props.pageSchema.compKey
        },
        {
          isOk: (res: any) => {
            saveTgt(res)
          },
        },
        {width: "60"}
    );
  },
	// 删除
  delmethod: (row: any) => {
    const agreementBaseRef = formPage?.getComponentRefById('AgreementBase')
    const cappNo  = agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo') || ''
    if (cappNo == '' || cappNo == undefined) {
      ElMessage.warning('请先保存投保单'); // 提示用户保存投保单
      return;
    }
		ElMessageBox.confirm(
        "是否确认删除当前数据？",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
    ).then(() => {
			const param = {
				cComponentTable: cComponentTableValue,
				cPkId: [row['ECargoTransportDist.cPkId']],
				cEcAgrAppNo:agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo') || ''
			}
			deleteDist(param).then((res: any) => {
				if (res.code === 200) {
					ElMessage.success("删除成功");
					loadData()
				}
			});
		}).catch(()=>{})
  },
	// 批量删除
  batchDelete() {
    if (selectedRows.value.length === 0) {
      ElMessage.warning("请先选择要删除的数据");
      return;
    }
    ElMessageBox.confirm(
        "是否确认删除选中的数据？",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
    ).then(() => {
      const param = {
        cComponentTable: cComponentTableValue,
        cPkId: selectedRows.value.map((row: any) => row['ECargoTransportDist.cPkId']),
        cEcAgrAppNo:''
      }
      const agreementBaseRef = formPage?.getComponentRefById('AgreementBase')
      param['cEcAgrAppNo'] = agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo') || ''
      deleteDist(param).then((res: any) => {
        if (res.code === 200) {
          ElMessage.success("删除成功");
          loadData()
        }
      });
    });
  },

  // 同投保人按钮点击事件
  applicantToInsured: () => {
    const appInfo = formPage.getFormDataById('AgreementApplicant');
    if(Object.keys(appInfo).length > 0) {
      const f = pageresult.list.filter((item: any) =>
          item['ECargoInsured.cCustomerName'] === appInfo['Applicant.cAppNme'] &&
          item['ECargoInsured.cIdentificationNumber'] === appInfo['Applicant.cCertfCde']
      );
      if(f.length > 0) {
        return;
      }
      setTableData([
        ...pageresult.list,
        ...[{
          ...{
            'ECargoInsured.nSeqNo': pageresult.list.length + 1,
            'ECargoInsured.cCustomerName': appInfo['Applicant.cAppNme'],
            'ECargoInsured.cIdentificationNumber': appInfo['Applicant.cCertfCde'],
            'ECargoInsured.cDocumentType': appInfo['Applicant.cCertfCls'],
            'ECargoInsured.cGender': appInfo['Applicant.cSex'],
            'ECargoInsured.nAge': appInfo['Applicant.nAge'],
          },
        }]
      ]);
    } else {
      ElMessage.warning('请先录入投保人信息！');
    }
  },

  handleQuery: () => {
    // let tgtRef = opertaor.getTableRefByKey('tgt')
    // const param = opertaor.getParam();
    // let app = "";
    // if (param.cOrgAppNo) {
    //   app = param.cOrgAppNo;
    // } else if (opertaor.getDataAll().plyBase["Base.cAppNo"]) {
    //   app = opertaor.getDataAll().plyBase["Base.cAppNo"];
    // } else {
    //   app = route.params.param.cAppNo
    // }
    // const selData = {
    //   cComponentTable: cComponentTableValue,
    //   cAppNo: app,
    // };
  },

  setregistAdd() {
    const ads = distTableRef?.value?.getValue('ECargoDist.AllProp');
    const a = distTableRef?.value?.getValue("ECargoDist.cRegisterSuffixAddr") || "";
    if (ads) {
      getAddressStr({address: ads}).then((res: any) => {
        const {code, data, msg} = res;
        if (code === 200) {
          const b = (data ? data['addStr'] : "") + a;
          setAddressStr("ECargoDist.cClntAddr", b);
        }
      });
    } else {
      setAddressStr("ECargoDist.cClntAddr", a);
    }
    console.log("清单级联事件触发")
  },
  cOccupationalLevelOnInit: (data: any) => {
    const {value, rowData, config, itemRef} = data;
    if (!value || !rowData || !config || !itemRef) return;
    const AllOccup = rowData['ECargoDist.AllOccup'];
    if (AllOccup.length < 3) return;
    codeListStore.queryCodeList({
      codeListName: "Occupt_ZYLB",
      codeListParam: {cParCde: AllOccup.at(-1)},
    }).then((res) => {
      //给表单下拉项赋值
      config.loadData = res;
    });
  },
	//导出
  exportExcel: () => {
    let paramitem  = Object.assign(formconfig1.value, {
      cComponentTable: cComponentTableValue,
    });
      const agreementBaseRef = formPage?.getComponentRefById('AgreementBase')
     paramitem['cEcAgrAppNo'] = agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo') || ''

    if(selectedRows.value.length > 0) {
      paramitem['cPkId'] = selectedRows.value.map((row: any) => row['ECargoTransportDist.cPkId']);
    }
    policyService
      .exportDist(paramitem).then((res:any) => {
      if (res.data.size <= 0) {
        ElMessage.error({ message: "导出出错", duration: 3000 });
        return;
      }
      const fileName = decodeURIComponent(res.headers['content-disposition']?.split('filename=')[1]);
      const blob = new Blob([res.data], {
        responseType: res.headers["content-type"]
      });
      saveAs(blob, fileName);
    })
  },
	// 模板下载
	downloadTemp: () => {
    const param = {
      ...formconfig1.value,
    }
    const agreementBaseRef = formPage?.getComponentRefById('AgreementBase')
    param['cEcAgrAppNo'] = agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo') || ''
    policyService
      .downloadDistTemplate(param)
      .then((res: any) => {
				if (res.size <= 0) {
					ElMessage.error({ message: "下载出错", duration: 3000 });
					return;
				}
				const fileName = decodeURIComponent(res.headers['content-disposition'].split('filename=')[1]);
				const blob = new Blob([res.data], {
					responseType :res.headers["content-type"]
				});
				saveAs(blob, fileName);
			})
			.catch(() => {
				ElMessage.error("模板下载失败");
			});
  },
	// 异常数据下载
  downloadIncrement: () => {
    let param  = Object.assign(formconfig1.value, {
      cComponentTable: cComponentTableValue,
    });
    const agreementBaseRef = formPage?.getComponentRefById('AgreementBase')
    param['cEcAgrAppNo'] = agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo') || ''
    policyService
			.downloadDistTemplateIncrement(param)
			.then((res) => {
				if (res.data.size  <= 0) {
					ElMessage.error({ message: "未发现导入失败的异常数据！", duration: 3000 });
					return;
				}
				const fileName = decodeURIComponent(res.headers['content-disposition'].split('filename=')[1]);
				const blob = new Blob([res.data], {
					responseType:res.headers["content-type"]
					// "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8",
				});
				saveAs(blob, fileName);
			})
			.catch((err) => {
				ElMessage.error(err.msg || "异常数据下载失败");
			});
  },
	// 导入
  importExcelIncrement: () => {
    const agreementBaseRef = formPage?.getComponentRefById('AgreementBase')
    const cappNo  = agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo') || ''
    if (cappNo == '' || cappNo == undefined) {
      ElMessage.warning('请先保存投保单'); // 提示用户保存投保单
      return;
    }
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
            cEcAgrAppNo:'',
						cEcAgrNo: '',
          };
          const agreementBaseRef = formPage?.getComponentRefById('AgreementBase')
          params['cEcAgrAppNo'] = agreementBaseRef.getValue('ECargoBase.cEcAgrAppNo') || ''
          params['cEcAgrNo'] = agreementBaseRef.getValue('ECargoBase.cEcAgrNo') || ''

          policyService.importDistIncrement(params).then((res:any) => {
            if (res.code === 200) {
              ElMessage.success(`导入完成：${res.data.msg}`);
              loadData()
            } else {
              ElMessage.error(res.msg || "增量导入失败");
            }
          }).catch((error) => {
            ElMessage.error("导入出错，请检查文件格式或内容");
          });
        };

        reader.onerror = (e) => {
          ElMessage.error("文件读取失败");
        };

        reader.readAsDataURL(file); // 启动读取
      }
    };
    input.click(); // 触发文件选择对话框
  },
};

// 绑定特殊验证器
const exRules = {};

function setValue(key: string, value: any) {
  distTableRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return distTableRef?.value?.getValue(key);
}

function setUnDisabledByKeyList(key: any) {
  tableconfig.value.formconfig?.endBtns?.forEach((item: any) => {
    if ("Btn_" + item.id === key) {
      item.hidden = false;
    }
  });
  tableconfig.value.formconfig?.titleBtns?.forEach((item: any) => {
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

function setTableData(data: any) {
  pageresult.list = data.map((item: any, index: any) => {
    return {
      ...item,
      ...{
        nSeqNo: index + 1,
        tOpeningTime: item['ECargoDist.tOpeningTime']
            ? moment(item['ECargoDist.tOpeningTime']).format("YYYY-MM-DD")
            : null,
        'ECargoDist.AllOccup': [
          item['ECargoDist.cMajorCategories'], item['ECargoDist.cMediumClassification'], item['ECargoDist.cOccupationalSubcategory']
        ],
      }
    };
  });
}

function setAddressStr(key: any, data: any) {
  applicantEditRef?.value?.setValue(key, data);
}

function getFormValue() {
  return pageresult.list;
}

function setFormValue(value: any) {
  setTableData(value);
}

function getFormConfig(){
  return tableconfig.value;
}
function validate() {
  return new Promise(resolve => {
    if(!pageresult.list || pageresult.list.length === 0) {
      if(idxParam && idxParam.handleAnchorClick) {
        idxParam.handleAnchorClick(undefined,`#${props.compKey}`)
      }
      resolve(false);
    }
    resolve(true);
  })
}
function getFormBtn() {
  return distTableRef?.value?.getFormBtn();
}
function getTableBtn() {
  return distTableRef?.value?.getTableBtn();
}
function setDisabledAll(isDisabled: boolean, noSet: string[] = []) {
  const tableBtn = getTableBtn();
  if(tableBtn && Object.keys(tableBtn).length > 0) {
    Object.keys(tableBtn).forEach((key: any) => {
      if(!noSet.includes(key)) {
        tableBtn[key].hidden = isDisabled;
      }
    });
  }
  const formBtn = getFormBtn();
  if(formBtn && Object.keys(formBtn).length > 0) {
    Object.keys(formBtn).forEach((key: any) => {
      if(!noSet.includes(key)) {
        formBtn[key].hidden = isDisabled;
      }
    })
  }
}
defineExpose({
  getValue,
  setValue,
  getFormValue,
  setFormValue,
  getFormConfig,
  validate,
  setUnDisabledByKeyList,
  handleQuery: method.handleQuery,
  setTableData,
  getFormBtn,
  setDisabledAll,
  getTableBtn
});
</script>

<style scoped></style>

<template>
  <div>
		<myCard :cardConfig="cardconfig" ref="cardRef">
      <app-table
          :tableConfig="tableconfig"
          v-model:pageresult="pageresult"
          ref="distTableRef"
					@page-change="loadData('',false)"
          @selection-change="handleSelectionChange"
      />
		</myCard>
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
import {AppFreeEditMethod, createAppFreeEditConfig} from "@/shared/app-free-edit-config";
import {saveAs} from "file-saver";
import cargoApi from "@/api/cargo";
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
import {eventBus} from "@/utils/event-bus";
import { idxParamKey, IdxParamProps, useIdxParam } from "@/views/pcis/support/useIdxParam";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useValidator } from "@/typings/useValidator";
import { CardConfig, creatCardConfig, MyCardMethod } from "@/shared/mytemplate/card-config";
const policyService = new PolicyService();
const cargoDistAdd = defineAsyncComponent(
    () => import("@/pcis/prodRef/insuredDistRef/fix/DistAddFix.vue")
);
const { getRules } = useValidator();
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

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());

const opertaor = dataOpertaor(idxParam.opertaorProps);
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
const cardconfig = ref<CardConfig>(creatCardConfig({}));
const formconfig1 = ref<Record<string, any>>({});
const tableconfig = ref<AppTableConfig>(createTableEditConfig());

let fileBase: string;
// 声明全局变量
let cComponentTableValue: string;

// 封装获取 cComponentTableValue 的逻辑
const getCComponentTableValue = (): string => {
  return props.compKey ? props.compKey.replace(/\d+/g, '') : "";
};

// 复选框选中
const selectedRows = ref<any[]>([]);
function handleSelectionChange(selection: any) {
  selectedRows.value = selection;
}

const formconfig11 = ref<any>({});
onMounted(async () => {
  console.log("props.compKey", props.compKey)
  formconfig11.value = formInit(
      JSON.stringify({...props.pageSchema}),
      method,
      exRules
  );
  Object.assign(formconfig1.value, formconfig11.value);
	cardconfig.value.title = formconfig1.value.title;
  cardconfig.value.showMyfromBtm = formconfig1.value.showMyfromBtm;
	if(formconfig1.value.distSchema&& formconfig1.value.distSchema.length > 0){
    formconfig1.value.distSchema.forEach((item:any)=>{
      if(item['prop'] === 'cPlateNumber'){
        item['rules'] = [getRules("vehiclePlate", {})];
      }
    })
    cardconfig.value.formconfig = createAppFreeEditConfig({
      fromSchema:formconfig1.value.distSchema,
      endBtnsPosition: "right",
      endBtns: [
        {
          icon: "search2",
          tooltip: "查询",
          func: () => {
						handleQuery()
          },
        },
        {
          icon: "RefreshRight",
          tooltip: "重置",
          func: () => {
            cardResetFn();
          },
        },
      ],
    });
    cardconfig.value.showEdit = true;
  }
  tableconfig.value.titleBtnPosition = 'right';
  tableconfig.value.showEdit = true;
  tableconfig.value.showSelection = true;
  formconfig1.value.fromSchema.forEach((e: any) => {  // 隐藏不需要显示在表格内的数据
    if (e.cShowLocation === '0') {
      e.isShow = false
    }
		if(e.prop === "InsuredDist.cCertfCls") {
      e.typeCode = "TYPE_OF_ID"
    }
    return e;
  });
  tableconfig.value.fromSchema = formconfig1.value.fromSchema;
  tableconfig.value.formconfig = createAppGridEditConfig({
    titleBtns: formconfig1.value.titleBtns,
    // fromSchema: formconfig1.value.distSchema,
  });
  if(props.pageSchema.fromUi) {
    tableconfig.value.fromUi['groupBy'] = props.pageSchema.fromUi['groupBy']
  }
  tableconfig.value.tableBtnType = "btn";
  tableconfig.value.tableBtnWidth = 150;
  tableconfig.value.tableBtnPosition = "right";
  // tableconfig.value.isPage = false;
  if (formconfig11.value.editBtns && formconfig11.value.editBtns.length > 0) {
    let btns: any[] = [];
    btns = formconfig11.value.editBtns;
    if (btns && btns.length > 0) {
      tableconfig.value.tableBtn = btns;
    }
  }
  // tableconfig.value.isPage = false;
  // 初始化 cComponentTableValue
  cComponentTableValue = getCComponentTableValue();
  nextTick(()=>{
    eventBus.on('insuredChange', loadDatOne);
		eventBus.on('insuredRefresh', insuredRefresh);
		const param = opertaor.getParam();
		let cAppNo = "";
    if (opertaor.getDataAll()['plyBase']['Base.cAppNo']) {
      cAppNo = opertaor.getDataAll()['plyBase']['Base.cAppNo'];
    } else if(param.cOrgAppNo){
      cAppNo = param.cOrgAppNo;
    } else if(param.pageType !== "copy") {
      cAppNo = param.cAppNo
    }
    if(cAppNo){
      loadData(cAppNo)
		}
  })
});
function hasPropertyWithValue(arr, property) {
  return Array.isArray(arr) && arr.some(obj =>
      obj && obj.hasOwnProperty(property) && obj[property] != null
  );
}
const insuredRefresh = (val:any)=>{
  if(hasPropertyWithValue(pageresult.list,'InsuredDist.cRowId')) return
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
  let param = Object.assign({cComponentTable:'InsuredDist',cAppNo:val || ''}, r);
  cargoApi.selectDistNew(param).then((res: any) => {
    if(res.code === 200) {
      pageresult.list = res.data.data
      pageresult.total = res.data.total
    }else {
      ElMessage.error(res.msg);
    }
  })
}
// 查询
const loadData = (cAppNodata = '',flag = true)=>{
  const r = distTableRef.value?.getPartnerPage(flag); //获取分页数据
	const cAppNo = opertaor.getDataAll()['plyBase']['Base.cAppNo'] || cAppNodata
	let param = Object.assign({
		cComponentTable:cComponentTableValue,
		cAppNo: cAppNo || ''
	}, r);
	pageresult.list = []
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
			ElMessage.error(res.msg);
		}
	})
}

// 更改
const saveTgt = async (res:any, flag)=>{
	const cAppNo = opertaor.getDataAll()['plyBase']['Base.cAppNo'] || ''
	const cEcAgrNo = opertaor.getDataAll()['plyBase']['Base.cEcAgrNo'] || ''
  const newRow = {
    cComponentTable:cComponentTableValue,
    InsuredDist:{
			...res,
      'InsuredDist.cEcAgrNo':cEcAgrNo || '',
    },
    cAppNo: cAppNo || ''
  };
	const result = await cargoApi.saveDistNew(newRow)
	if (result.code == 200) {
		loadData()
		ElMessage.success(`${flag}成功`);
		if (flag == '修改') {
			eventBus.emit('insureDistEdit', '1');
		}
	} else {
		ElMessage.error(result.msg ||`${flag}失败`);
	}
}
 function filterFromSchema(obj:any) {
  // 如果对象不存在或者没有fromSchema属性，直接返回
  if (!obj || !obj.fromSchema || !Array.isArray(obj.fromSchema)) {
    return obj;
  }
  // 创建新对象的浅拷贝
  const newObj = {...obj};
	newObj.fromSchema = newObj.fromSchema.map(item => {
    if (item.prop === 'InsuredDist.cCustRiskRank') {
      return {
        ...item,
        loadData: [
          {
            "label": "低风险",
            "value": "925104"
          }
        ],
        disabled:'0'
      };
    }
    return item;
  });
  return newObj;
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
          rowData: {...row},
          compKey: props.pageSchema.compKey
        },
				{},
        {width: "85"}
    );
  },
	// 新增
  addmethod: (row: any) => {    
		let cappNo = '';
    // 判断有无批改类型参数，有则是批单
    if(route.params.param?.cEdrType) {
    	const edrbase = opertaor.getFatherPage().getEdrbaseValue();
      cappNo = edrbase['EdrBase.cAppNo'];
    } else if(route.params.param?.pageName === "priceInquiry") {
      cappNo = opertaor.getDataAll().plyBase["Base.cInquiryNo"];
    } else {
      cappNo = opertaor.getDataAll().plyBase["Base.cAppNo"];
		}
		if (cappNo == '' || cappNo == undefined) {
      ElMessage.warning('请先保存申请单'); // 提示用户保存投保单
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
            saveTgt(res, '新增')
          },
        },
        {width: "85"}
    );
  },
	// 编辑
  editmethod: (row: any) => {
		let cappNo = '';
    // 判断有无批改类型参数，有则是批单
    if(route.params.param?.cEdrType) {
    	const edrbase = opertaor.getFatherPage().getEdrbaseValue();
      cappNo = edrbase['EdrBase.cAppNo'];
    } else if(route.params.param?.pageName === "priceInquiry") {
      cappNo = opertaor.getDataAll().plyBase["Base.cInquiryNo"];
    } else {
      cappNo = opertaor.getDataAll().plyBase["Base.cAppNo"];
		}
		if (cappNo == '' || cappNo == undefined) {
      ElMessage.warning('请先保存申请单'); // 提示用户保存投保单
      return;
		}
    dialog.value?.open(
        cargoDistAdd,
        {
          fromSchema: tableconfig.value.fromSchema,
          fromUi: tableconfig.value.fromUi,
          title: "编辑",
          rowData: {...row},
          compKey: props.pageSchema.compKey
        },
        {
          isOk: (res: any) => {
            saveTgt(res, '修改')
          },
        },
        {width: "85"}
    );
  },
  // 删除
  delmethod: (row: any) => {
		let cappNo = '';
    // 判断有无批改类型参数，有则是批单
    if(route.params.param?.cEdrType) {
    	const edrbase = opertaor.getFatherPage().getEdrbaseValue();
      cappNo = edrbase['EdrBase.cAppNo'];
    } else if(route.params.param?.pageName === "priceInquiry") {
      cappNo = opertaor.getDataAll().plyBase["Base.cInquiryNo"];
    } else {
      cappNo = opertaor.getDataAll().plyBase["Base.cAppNo"];
		}
		if (cappNo == '' || cappNo == undefined) {
      ElMessage.warning('请先保存申请单'); // 提示用户保存投保单
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
				cComponentTable:cComponentTableValue,
				cPkId: [row['InsuredDist.cPkId']],
				cAppNo: cappNo || '',
				cProdNo: route.params.param?.cProdNo,  //产品号
			}
			deleteDist(param).then((res: any) => {
				if (res.code === 200) {
					ElMessage.success("删除成功");
					loadData()
				} else {
					ElMessage.error(res.msg || '删除失败');
				}
			});
		}).catch((err) => {
		})
  },
	// 批量删除
	batchDelete() {
		let cappNo = '';
    // 判断有无批改类型参数，有则是批单
    if(route.params.param?.cEdrType) {
    	const edrbase = opertaor.getFatherPage().getEdrbaseValue();
      cappNo = edrbase['EdrBase.cAppNo'];
    } else if(route.params.param?.pageName === "priceInquiry") {
      cappNo = opertaor.getDataAll().plyBase["Base.cInquiryNo"];
    } else {
      cappNo = opertaor.getDataAll().plyBase["Base.cAppNo"];
		}
		if (cappNo == '' || cappNo == undefined) {
      ElMessage.warning('请先保存申请单'); // 提示用户保存投保单
      return;
		}
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
				cPkId: selectedRows.value.map((row: any) => row['InsuredDist.cPkId']),
				cAppNo: '',
				cProdNo: route.params.param?.cProdNo,  //产品号
			}
			param['cAppNo'] = opertaor.getDataAll()['plyBase']['Base.cAppNo'] || ''
			deleteDist(param).then((res: any) => {
				if (res.code === 200) {
					ElMessage.success("删除成功");
					loadData()
				} else {
					ElMessage.error(res.msg || '删除失败');
				}
			});
		}).catch((err) => {
		});
  },

	setregistAdd() {
    const ads = distTableRef?.value?.getValue('Dist.AllProp');
    const a = distTableRef?.value?.getValue("Dist.cRegisterSuffixAddr") || "";
    if (ads) {
      getAddressStr({address: ads}).then((res: any) => {
        const {code, data, msg} = res;
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
    const formconfig = filterFromSchema(formconfig1.value)
    let paramitem  = Object.assign(formconfig, {
			cComponentTable:cComponentTableValue,
    });

    paramitem['cAppNo'] = opertaor.getDataAll()['plyBase']['Base.cAppNo'] || ''

    if(selectedRows.value.length > 0) {
      paramitem['cPkId'] = selectedRows.value.map((row: any) => row['InsuredDist.cPkId']);
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
    const formconfig = filterFromSchema(formconfig1.value)
    const param = {
      ...formconfig,
    }
    param['cAppNo'] = opertaor.getDataAll()['plyBase']['Base.cAppNo'] || ''
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
			cComponentTable:cComponentTableValue,
    });
    param['cAppNo'] = opertaor.getDataAll()['plyBase']['Base.cAppNo'] || ''
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
    const formconfig = filterFromSchema(formconfig1.value)
    const cappNo  = opertaor.getDataAll()['plyBase']['Base.cAppNo'] || ''
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
            ...formconfig,
            file: base64String, // ✅ 正确传入
            cComponentTable: cComponentTableValue,
            cAppNo:'',
						cEcAgrNo: '',
          };
          params['cAppNo'] = opertaor.getDataAll()['plyBase']['Base.cAppNo'] || ''
          params['cEcAgrNo'] = opertaor.getDataAll()['plyBase']['Base.cEcAgrNo'] || ''

          policyService.importDistIncrement(params).then((res:any) => {
            if (res.code === 200) {
              ElMessage.success(`导入完成：${res.data.msg}`);
              loadData()
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
};

// 绑定特殊验证器
const exRules = {};

function getFormConfig() {
  return tableconfig.value;
}

async function getTableDataAll() {
  const s = cardRef.value?.getFromValue() || {};
  // 经营地址只选择省市区不输入详细地址获取表单值会带有undefined，这里处理一下
  for (let k in s) {
    if(s[k] && typeof s[k] === 'string' && s[k].indexOf('undefined') !== -1) {
      s[k] = s[k].replace('undefined', '')
    }
  }
  const param = opertaor.getParam();
  let app = "";
  if (opertaor.getDataAll()?.plyBase["Base.cAppNo"]) {
    app = opertaor.getDataAll().plyBase["Base.cAppNo"];
  } else if(param.cOrgAppNo){
    app = param.cOrgAppNo;
  } else if(param.pageType !== "copy") {
    app = param.cAppNo
  }
  const selData:any = {
    cAppNo: "",
    cComponentTable: cComponentTableValue,
    cClauseCode: route.params.param?.cTermNo, //条款编码  
    cProdNo: route.params.param?.cProdNo,  //产品号
    ...formconfig1.value,
    pageNum: 1,
    pageSize: 99999
  };
  selData.dist = JSON.parse(JSON.stringify(s))
  if(route.params.param?.pageName === "priceInquiry") {
    selData['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
    if(!selData['cInquiryNo']){
      return []
    }
  } else {
    selData['cAppNo'] = app;
    if(!selData['cAppNo']){
      return []
    }
  }
  if(route.params.param?.pageType && route.params.param?.pageType === "EDR_APP_NEW_SCENE") {
    selData.voType = "ply"
  }
  // 级联地址表格显示问题处理
  if(Object.keys(mapAddr).includes(props.compKey)) {
    const addrInput = mapAddr[props.compKey];
    const keys = Object.keys(addrInput)
    if(keys && keys.length>0) {
      const inputGroupKey = keys[0];
      const addrValueKey = addrInput[inputGroupKey];
      selData.dist[addrValueKey] = selData.dist[inputGroupKey];
    }
  }
  const res:any = await selectDist(selData);
  if (res.code === 200) {
    return res.data.data?.length > 0 ? res.data.data : []
  } else {
    ElMessage.error(res.msg)
    return []
  }
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
const cardRef = ref<MyCardMethod | null>(null);
function cardResetFn(){
	const tableEditRefs = cardRef.value;
	const s = tableEditRefs?.getFromValue(); //获取表单数据
	for (const k in s) {
			s[k] = null;
	}
	tableEditRefs?.setFormValue({...s})
	handleQuery()
}

function handleQuery(queryParams: any = { pageNum: 1, pageSize: 10 }) {
  distTableRef.value?.setPartnerPage(queryParams);
	const s = cardRef.value?.getFromValue() || {};
	// 经营地址只选择省市区不输入详细地址获取表单值会带有undefined，这里处理一下
	for (let k in s) {
		if(s[k] && typeof s[k] === 'string' && s[k].indexOf('undefined') !== -1) {
			s[k] = s[k].replace('undefined', '')
		}
	}
  const selData = {
    cAppNo: opertaor.getDataAll()['plyBase']['Base.cAppNo'] || '',
		cComponentTable: cComponentTableValue,
    cClauseCode: route.params.param?.cTermNo, //条款编码  
    cProdNo: route.params.param?.cProdNo,  //产品号
		...formconfig1.value,
		...queryParams
  };
	selData.InsuredDist = JSON.parse(JSON.stringify(s))
	cargoApi.selectDistNew(selData).then((res: any) => {
		if(res.code === 200) {
			if(res.data.data.length > 0 ){
				pageresult.list = res.data.data
				pageresult.total = res.data.total
			} else {
				pageresult.list = []
				pageresult.total = 0
			}
		}else {
			ElMessage.error(res.msg);
		}
	})
}

function setTableData(data: any) {
	pageresult.list = data.map((item: any, index: any) => {
		let dataNew:any = {}
		if(!!item['InsuredDist.cMajorCategories'] || !!item['InsuredDist.cMediumClassification'] || !!item['InsuredDist.cOccupationalSubcategory']){
			dataNew['InsuredDist.AllOccup'] = [
					item['InsuredDist.cMajorCategories'], item['InsuredDist.cMediumClassification'], item['InsuredDist.cOccupationalSubcategory']
			]
		}
		if(!!item['InsuredDist.tOpeningTime']){
			dataNew['tOpeningTime'] = item['InsuredDist.tOpeningTime']? moment(item['InsuredDist.tOpeningTime']).format("YYYY-MM-DD"): null
		}
    return{
      ... item,
			... dataNew,
      ... {
        nSeqNo: index + 1,
      }
    };
  });
  pageresult.total = total || 0;
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

function getFormValue() {
  return pageresult.list;
}

function getFormconfig() {
	return {
    fromType: "custom",
  };
}
function setDisabledAll(isDisabled: boolean, noSet: string[] = []) {
  tableconfig.value.formconfig?.endBtns?.forEach((item: any) => {
    item.hidden = true;
  });
  tableconfig.value.formconfig?.titleBtns?.forEach((item: any) => {
    item.hidden = true;
  });
  tableconfig.value.tableBtn?.forEach((item: any) => {
    item.hidden = true;
  });
}
defineExpose({
  getValue,
  setValue,
  getFormValue,
  setFormValue,
  getFormconfig,
  setUnDisabledByKeyList,
	handleQuery,
	getTableData,
  setTableData,
  getFormConfig,
  setDisabledAll,
  getTableDataAll,
});
</script>

<style scoped></style>

<!-- 特别约定组件 -->
<template>
  <div> 
    <myCard :cardConfig="cardconfig">
      <rttable v-model="formData" :item="tableconfig" ref="rttableFrom">
        <template #column-cSpecialContent="{row}">
          <div>{{ row.cSpecialContent }}</div>
        </template>
      </rttable>
    </myCard>
    <comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
import { CardConfig, creatCardConfig } from "@/shared/mytemplate/card-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { ref } from "vue";
import { getpSpecialAgreement } from "@/api/prod";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import { deleteFactorBykey, getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { eventBus } from '@/utils/event-bus'
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const formData = ref<any[]>([]);
const param = opertaor.getParam();
// const formData = reactive([]);
const dzmodal = useDzModal();
const dialog = ref<DialogMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
);
const specEdit = defineAsyncComponent(
  () => import("@/pcis/prodRef/commodityRef/prd-fix-spec-edit.vue")
);
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

const rttableFrom = ref<any>(null);
const parparam = opertaor.getParam();
const cardconfig = ref(creatCardConfig({}));
const moveUpTimer = ref(null);
const moveDownTimer = ref(null);
const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const originalData =  ref<any[]>([]);

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    // title: "特约信息",
    tableBtnType: "btn",
    tableBtnWidth: 96,
    tableBtnPosition: "right",
    fixed: true,
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑", 
        type: "success",
        size: "default",
        icon: "Edit",
        hideBtns: (row) => {
          // if (!row.cSpecialContent.includes("*")) return true;
           return row.cIfEdit !== '1';
        },
        tableClick: (row) => {
          console.log('param',row)
          if(originalData.value.length==0){
              originalData.value  =    deepClone(formData.value)
          }
          let param = {};
          if(row['cIfMust'] !== '9' && row['cIfFix'] !== '0') {
            
            let rid = row.cSpecialCode|| row.cSpecialCode
            const f = originalData.value.find(f => rid === f.cSpecialCode);
            // cSpecialContent
            Object.assign(param, f);
            
          }else {
            Object.assign(param, row)
          }

          if(row.editList && row.editList.length>0){
            param['editList'] = row.editList
          }
          console.log('param',param)
          dzmodal.open(specEdit, {
            type: "view",
            data: param,
            idxParam: idxParam,
            callback: (res: any) => {
              if (res.type === "ok") {
                // row.cSpecialContent = res.data.cSpecialContent
                // row['editList']= res.data['editList']

                 let list = formData.value;
                 const index = list.findIndex(
                    item => item.cSpecialCode === row.cSpecialCode && item.cPkId === row.cPkId && item.nSeqNo === row.nSeqNo
                  );
                    if (index !== -1) {
                      nextTick(()=>{
                        list[index]['cSpecialContent'] = res.data.cSpecialContent;
                        list[index]['editList'] =res.data['editList']
                        formData.value = list
                      })
                    }      
                }
            } })
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "删除",
        type: "danger",
        size: "default",
        icon: "Delete",
         hideBtns: (row) => {
          // if (!row.cSpecialContent.includes("*")) return true;
           return row.cIfMust === '1' || row.cSpecialCode == '34201122' || row.cSpecialCode == '34201123';
        },
        tableClick: (row) => {
           ElMessageBox.confirm(
            "是否确认删除数据？",
            "提示",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }
          ).then(() => {
              const list = formData.value;
              const i = list.findIndex((item) => item.cSpecNo === row.cSpecNo);
              rttableFrom.value.delRow(row._dataId);
  
              formData.value.forEach((item, index) => {
                item.index = index + 1;
              });
          });
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "上移",
        type: "success",
        size: "large",
        icon: "Top",
        hideBtns: (row) => {
          if (row.index == 1) return true;
        },
        tableClick: (row) => {
          moveUp(row.index - 1);
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "下移",
        type: "success",
        size: "large",
        icon: "Bottom",
        hideBtns: (row) => {
          if (row.index == formData.value.length) return true;
        },
        tableClick: (row) => {
          moveDown(row.index - 1);
        },
      }),
    ],
    fromSchema: [
      {
        prop: "index",
        inputtype: "rtinput",
        title: "序号",
        width: 35,
      },
      // {
      //   prop: "cIfEdit",
      //   inputtype: "rttag",
      //   title: "是否可编辑",
      //   width: 100,
      //   loadData: [
      //     {
      //       label: "可编辑",
      //       value: "0",
      //     },
      //     {
      //       label: "不可编辑",
      //       value: "1",
      //     },
      //   ],
      // },
      {
        prop: "cIfMust",
        inputtype: "rttag",
        title: "Tag",
        effect: "light",
        width: 80,
        loadData: [
          {
            label: "可选",
            value: "0",
          },
          {
            label: "必选",
            value: "1",
          },
          {
            label: "自定义",
            value: "2",
          },
        ],
      },
      // {
      //   prop: "cSpecialCode",
      //   inputtype: "rtinput",
      //   title: "特约代码",
      //   width: 180,
      // },
      {
        prop: "cSpecialContent",
        inputtype: "rtinput",
        title: "特约内容",
        align: "left",
        slotName: "cSpecialContent",
        //  width: 210,
      },
    ],
  })
);

const addData =()=>{
  let obj = [];
  let isAdd = true;
    formData.value.forEach((item)=>{
      if(item.cSpecialCode === "fenqi01"){
        isAdd = false;
      }
    })
    if(isAdd){
      ElMessage.warning("分期付费业务，需在特别约定中增加及时缴纳保费的提示信息");
      obj =[...formData.value, { 
        addIndex: 1,
        cIfEdit: "0",
        cIfFix: "1",
        cIfMust: "0",
        cSpecialCode: "fenqi01",
        isAdd:true,
        cSpecialContent: "各期保费应在约定的缴费止期前缴纳，超过约定止期未支付当期保费的，在未支付保费的期间发生保险事故的，本公司按照已缴纳保费及未到缴费期应交保费之和占总保费的比例进行赔偿。",
        // index: formData.value.length+1
      }]
       setFormValue(obj)
    } 
}

const changeSpecial =(val:any)=>{
  const newFormData = formData.value?.filter((item:any) => item.cSpecialCode !== '34201123' && item.cSpecialCode !== '34201122');
  if(val === '0') {// 一次交清
    newFormData.push(defaultData.value?.find((item:any) => item.cSpecialCode ==='34201123'))
  }
  if(val === '5') {// 多次交清
    newFormData.push(defaultData.value?.find((item:any) => item.cSpecialCode ==='34201122'))
  }
  setFormValue(newFormData)
}

// 获取默认信息
const defaultData = ref([]);
const refreshData = () => {
  // && parparam.cAppStatus !=='1' 暂存的不处理  parparam.pageType !== "copy" &&  
  // if (parparam.pageType !== "app" &&   parparam.pageType !== "template" ) {
  //   console.log('不是新单子')
  //   return false;
  // }
   const param = opertaor.getParam();
  const cProdNo = param.cProdNo;
  const cProdList = param.cProdList;
  const cDptCde = param.cDptCde || '';
  const tAppTm = opertaor.getDataAll().insrnc?.['Base.tAppTm']
  console.log('refreshData-param', param)
  const getResult = (result: any[]) => {
    let len = 0;
    let sel : any[] = [];
    defaultData.value.push(...result);
    const cInstMrk = opertaor.getTableRefByKey('base')?.getValue('Base.cInstMrk');
    if (parparam.pageType  == "app") {
      result.forEach((item: any,index:number) => {
        if(item["cIfMust"] == "1" || (cInstMrk == "0" && item.cSpecialCode == '34201123') || (cInstMrk == "5" && item.cSpecialCode == '34201122')) {
          item.index = len + 1;
          sel.push(item);
          len++;
        }
      });
      originalData.value.push(...deepClone(sel))
      formData.value.push(...sel)
    }else{
      originalData.value.push(...deepClone(result))
    }
  }
  // 查询列表数据
  const reqParam: any = {
    cDptCde: cDptCde,
    pageNum: 1,
    pageSize: 999,
    tAppTm: tAppTm
  }
  if(cProdList && cProdList.length > 0) { // 组合出单用
    reqParam.cProdNos = cProdList;
  } else {
    reqParam.cProdNo = cProdNo;
  }
  originalData.value = []
  formData.value = []
  defaultData.value = []
  console.log('getpSpecialAgreement-reqParam', reqParam)
  getpSpecialAgreement(reqParam).then((res) => {
    if (res.data?.result) {
      getResult(res.data.result)
    }
  });
};

onMounted(async () => {
    eventBus.on('add-special', addData)
    const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(cardconfig.value, formconfig11);
  formData.value = [];
  formData.value.forEach((item, index) => {
    item.index = index + 1;
  });
  const gettAppTm = setInterval(() => {
    const cInstMrk = opertaor.getTableRefByKey('base')?.getValue('Base.cInstMrk');
		if (opertaor.getDataAll().insrnc?.['Base.tAppTm'] && cInstMrk) {
			if (param.cRecordType != '9') {
				refreshData();
			}
      clearInterval(gettAppTm);
    }
  }, 500)
  eventBus.on('change-special', changeSpecial)
});
// 组件卸载时移除事件监听（避免内存泄漏）
onUnmounted(() => {
  eventBus.off('add-special', addData)
  eventBus.off('change-special', changeSpecial)
})

// 复制数据处理
const mergeArrays = (oldArr, newArr, key, fields)=>{
        if (!Array.isArray(oldArr) || oldArr.length === 0) {
          return newArr.map(item => ({ ...item }));
        }

        // 边界处理：如果新数组为空，返回空数组（或根据业务返回旧数组）
        if (!Array.isArray(newArr) || newArr.length === 0) {
          return [];
        }
        const isSameItem = (oldItem, newItem,key) => {
          if (key != null && key !== undefined && key !== '') {
            const oldValue = oldItem[key];
            const newValue = newItem[key];
            if (oldValue != null && oldValue !== "" && newValue != null && newValue !== "") {
              return oldValue == newValue;
            }
          }

          if (oldItem.cPkId != null && oldItem.cPkId !== undefined &&  oldItem.cPkId !== '' &&
              newItem.cPkId != null && newItem.cPkId !== undefined && newItem.cPkId !== '') {
            return oldItem.cPkId == newItem.cPkId;
          }

          if (oldItem.cRowId != null && oldItem.cRowId !== undefined && oldItem.cRowId !== '' && 
              newItem.cRowId != null && newItem.cRowId !== undefined && newItem.cRowId !== '') {
            return oldItem.cRowId == newItem.cRowId;
          }
          return false;
        };

      // 1. 以新数组为基准构建新数组
      return newArr.map(newItem => {
        const oldItem = oldArr.find(item => isSameItem(item, newItem,key));
        if (oldItem) {
          // 2. 左右都存在：左边数据为基础，用右边指定字段覆盖
          const mergedItem = { ...oldItem };
          fields.forEach(field => {
            if (newItem.hasOwnProperty(field)) {
              mergedItem[field] = newItem[field];
            }
          });
          return mergedItem;
        } else {
          // 3. 右边独有：直接返回右边项
          return { ...newItem };
        }
      });
  }


// 绑定方法
const method = {
  func1: () => {
  },
  //获取特约按钮
  getSpecialAgree: () => {
    const param = opertaor.getParam();
    console.log('getSpecialAgree', param)
    dialog.value?.open(
      "prdFixSpec",
      {
          cProdNo: param.cProdNo,
          cProdList: param.cProdList,
          cDptCde:param.cDptCde,
          selectedData: formData.value, //需要把自定义的过滤掉，只传过去从模板中选择的
          tAppTm: opertaor.getDataAll().insrnc?.['Base.tAppTm'],
        },
      {
        getSelected(selectdata: any) {
            let len = formData.value.length;
            const selectedData = selectdata.map((item:any) => ({...item, cSpecialContent: item.cLanguageCode === "en-US" ? item.cSpecialContentEn : item.cSpecialContent}))
            let sessionSpecialAgreement = JSON.parse(sessionStorage.getItem("getAppPolicyData") || "{}")?.['SpecialAgreement'] || [];
            sessionSpecialAgreement.forEach((item:any) => {
              if(!item.cLanguageCode) {
                item.cLanguageCode = "zh-CN"
              }
              // 为了防止复制出单获取特约时把sessionSpecialAgreement里的申请单号传过去导致保存后原单数据丢失
              if(item.cAppNo !== opertaor.getDataAll().plyBase?.['Base.cAppNo']) {
                delete item.cAppNo
                delete item.cPkId
              }
            })
            console.log('缓存问题',sessionSpecialAgreement )
            console.log('缓存问题2selectdata',selectedData )
            const result = mergeArrays(sessionSpecialAgreement, selectedData, 'cSpecialCode', ['cSpecialContent','cSpecialContentEn','cLanguageCode' ]);
            result.forEach((item: any,index:number) => {
              item.index = index + 1;
              len++;
            });
          
            console.log('新数据保存用---',result)
            originalData.value =deepClone(result)
            formData.value = result
          },
      },
      { title: "添加特约", width: 85 }
    );
  },
};
const handleSelectedData = (selectdata: any[]) => {
  selectdata.forEach((item: any) => {
    formData.value.push({
      index: formData.value.length + 1,
      cIfMust: "0", // 默认值，根据实际情况调整
      cSpecialCode: item['PrdFixSpec.CSpecNo'],
      cSpecialContent: item['PrdFixSpec.CNmeCn'],
    });
  });
  formData.value.forEach((item, index) => {
    item.index = index + 1;
  });
};
// 绑定特殊验证器
const exRules = {};

// 上移一行
const moveUp = async (index) => {
  const tableData = formData.value;
  if (index > 0) {
    [tableData[index], tableData[index - 1]] = [
      tableData[index - 1],
      tableData[index],
    ];
  }
  // 异步操作，解决tooltip卡住不消失问题
  if (moveUpTimer.value) {
    clearTimeout(moveUpTimer.value);
  }
  moveUpTimer.value = setTimeout(() => {
    tableData.forEach((item, index) => {
      item.index = index + 1;
    });
  }, 0);
};

// 下移一行
const moveDown = (index) => {
  const tableData = formData.value;
  if (index < tableData.length - 1) {
    [tableData[index], tableData[index + 1]] = [
      tableData[index + 1],
      tableData[index],
    ];
  }
  // 异步操作，解决tooltip卡住不消失问题
  if (moveDownTimer.value) {
    clearTimeout(moveDownTimer.value);
  }
  moveDownTimer.value = setTimeout(() => {
    tableData.forEach((item, index) => {
      item.index = index + 1;
    });
  }, 0);
};

function getFromValue() {
  return formData.value.map((item) => {
    const prefixedItem: { [key: string]: any } = {};
    for (const key in item) {
      if (item.hasOwnProperty(key)) {
        prefixedItem[`SpecialAgreement.${key}`] = item[key];
      }
    }
    return prefixedItem;
  });
}

function setFormValue(value: any) {
  if(value && value.length>0){
    let ind = 1;
    value.forEach(e => {
      Object.keys(e).forEach(key => {
        const newKey = key.replace('SpecialAgreement.', '');
        const v = e[key];
        delete e[key];
        e[newKey] = v;
      })
      e['index'] = ind++;
    });
  }
  rttableFrom?.value?.setFormValue(value);
  // Object.assign(formData.value, value);
  formData.value = value;
}

// 深拷贝
const  deepClone =(obj:any)=> {
  // 处理原始值和 null
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // 处理日期对象
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  // 处理数组
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  // 处理普通对象
  const clone = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  
  return clone;
}


function validate() {}

function setDisabledAll() {
  if (cardconfig.value.titleBtns && cardconfig.value.titleBtns.length > 0) {
    cardconfig.value.titleBtns.forEach((item: any) => {
      item.hidden = true;
    });
  }
  if (cardconfig.value.endBtns && cardconfig.value.endBtns.length > 0) {
    cardconfig.value.endBtns.forEach((item: any) => {
      item.hidden = true;
    });
  }
  tableconfig.tableBtn.forEach(element => {
    element.hidden = true;
  });
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

  let r = false;
  if(key === "Btn_getSpecial_btn"){
    r = true;
  }
  
  if(r){
    tableconfig.tableBtn.forEach(element => {
      element.hidden = false;
    });
  }
}
function getFormconfig() {
  return {
    fromType: "custom",
  };
}

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  getFormconfig,
  setDisabledAll,
  setUnDisabledByKeyList
});
</script>

<style scoped></style>

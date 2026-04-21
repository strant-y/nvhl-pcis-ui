<template>
  <myCard :cardConfig="cardconfig">
    <rttable v-model="formData" :item="tableconfig" ref="rttableFrom" >
			<!-- 定义插槽 -->
			<template #column-contentColumn="{ row }">
				<!-- 使用 v-html 渲染高亮，但数据本身 row.cDeductibleContent 依然是纯文本 -->
				<span v-html="highlightText(row)"></span>
			</template>
		</rttable>
  </myCard>
  <comDialog ref="dialog"></comDialog>
</template>

<script setup lang="ts">
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import {getPrdDeductible} from "@/api/prod/index";
import { useRoute } from "vue-router";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { CardConfig, creatCardConfig } from "@/shared/mytemplate/card-config";
import { createFreeButtonBase } from "@/shared/button-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const dzmodal = useDzModal();
const route = useRoute();
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
import {
  AppGridEditMethod,
  createAppGridEditConfig,
} from "@/shared/app-grid-edit-config";

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
  compKey: {
    type: String
  }
});

const deductibleFixEdit = defineAsyncComponent(() => import("@/pcis/prodRef/commodityRef/DeductibleFixEdit.vue"));


const formconfig1 = reactive(createAppGridEditConfig({}));
const dialog = ref<DialogMethod | null>(null);
const formData = ref<any[]>([]);
const rttableFrom = ref<any>(null);
const cardconfig = ref(creatCardConfig({}));
const moveUpTimer = ref(null);
const moveDownTimer = ref(null);
const originalData = ref<any[]>([]);
const parparam = opertaor.getParam();
const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

onMounted(()=>{
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(cardconfig.value, formconfig11);
  setTimeout(()=>{
    if(formData.value.length>0){
            formData.value.forEach((item, index) => {
              item.nSeqNo = index + 1;
              item.cDeductibleClass = item.cDeductibleCode;
                // prop: "cDeductibleClass",
        // prop: "cDeductibleCode",
          });
       }
  },3000)

  initOriginalData();
})

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    // title: "免赔信息",
    tableBtnType: "btn",
    tableBtnWidth: 96,
    tableBtnPosition: "right",
    align: "left",
    fixed: true,
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        hideBtns: (row) => {
          return row.cIfEdit !== '1';
        },
        tableClick: (row) => {
          let param = {};
          if(row['cIfMust'] !== '9') {               // cDeductibleContent
            let rid = row.cDeductibleCode || row.cDeductibleClass
            const f = originalData.value.find(f => rid === f.cDeductibleClass);
            Object.assign(param, f);
          }else {
            Object.assign(param, row)
          }

          if(row.editList && row.editList.length>0){
            param['editList'] = row.editList
          }
          dzmodal.open(deductibleFixEdit, { 
            type: "view", 
            data: param, 
            callback: (res: any) => {
              if (res.type === "ok") {
                 let list = formData.value;
                 const index = list.findIndex(
                    item => item._dataId === row._dataId
                  );
                  if (index !== -1) {
                    nextTick(()=>{
                      list[index]['cDeductibleContent'] = res.data.cDeductibleContent;
                      list[index]['editList'] =res.data['editList']
                      formData.value = list;
                    })
                  }      

              }
            }
          });
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "删除",
        type: "danger",
        size: "large",
        icon: "Delete",
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
              item.nSeqNo = index + 1;
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
          if (row.nSeqNo == 1) return true;
        },
        tableClick: (row) => {
          moveUp(row.nSeqNo - 1);
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
          if (row.nSeqNo == formData.value.length) return true;
        },
        tableClick: (row) => {
          moveDown(row.nSeqNo - 1);
        },
      }),
    ],
    fromSchema: [
      {
        prop: "nSeqNo",
        inputtype: "rtinput",
        title: "序号",
        width: 35,
      },
      {
        prop: "cIfMust",
        inputtype: "rttag",
        title: "是否可选",
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
            value: "9",
          },
        ],
      },
      // {
      //   prop: "cDeductibleClass",
      //   // prop: "cDeductibleCode",
      //   inputtype: "rtinput",
      //   title: "免赔条件ID",
      //   width: 180,
      // },
      {
        prop: "cDeductibleContent",
        inputtype: "rtinput",
        title: "免赔内容",
				align: "left",
				slotName: "contentColumn", // 2. 使用插槽渲染
      },
    ],
  })
);



const initOriginalData = ()=> {
  originalData.value = []
  const param = {
    pageNum: 1,
    pageSize: 999,
  }
  if(route.params.param?.cRecordType === 10) {
    param.cProdNos = route.params.param?.cProdList;
  }else {
    param.cProdNo = route.params.param?.cProdNo;
  }
  getPrdDeductible(param).then((res) => {
    if (res.data.result) {
      pageresult.list = [];
      originalData.value = res.data.result.map((item: any) => {
        return {
          cDeductibleClass: item.cDeductibleCode,
          cDeductibleContent: item.cDeductibleContent,
          cStatus: item.cStatus, //是否必选
          cIfMust: item.cIfMust, //是否必选
          cIfEdit: item.cIfEdit, //是否可修改
        }
      });
    }
  });
}


// 上移一行
const moveUp = async (index) => {
   console.log('上下----')
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
      item.nSeqNo = index + 1;
    });
  }, 0);
};

// 下移一行
const moveDown = (index) => {
  console.log('上下----')
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
      item.nSeqNo = index + 1;
    });
  }, 0);
};


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
// 复制数据处理
const mergeArrays = (oldArr, newArr, key, fields)=>{
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
  // func demo
  func1: () => {},
  funcdeDuctiadd: () => {
  },
  //获取免赔
  getDuductible: () => {

  },
  //查询免赔
  queryDeductible: () => {
    dialog.value?.open('deductibleFix', {
          cProdNo: route.params.param.cProdNo,
          cProdList: route.params.param.cProdList, // 组合出单用
          selectedData: formData.value, //需要把自定义的过滤掉，只传过去从模板中选择的
        },
        { 
          getSelected(selectdata: any) {
              let sessionSpecialAgreement = JSON.parse(sessionStorage.getItem("getAppPolicyData") || '{}')?.['deductibleDist'] || [];
              sessionSpecialAgreement.forEach((item:any) => {
                // 为了防止复制出单获取特约时把sessionSpecialAgreement里的申请单号传过去导致保存后原单数据丢失
                if(item.cAppNo !== opertaor.getDataAll().plyBase?.['Base.cAppNo']) {
                  delete item.cAppNo
                  delete item.cPkId
                }
              })
              const result = mergeArrays(sessionSpecialAgreement, selectdata, 'cDeductibleClass', ['cDeductibleContent']);
           
              const mergeAndNumberArraysPreserveOrder = (a: [], b: []): any[] => {
                const akeys = new Set(a.map(item => item.cDeductibleClass));
                const bkeys = new Set(b.map(item => item.cDeductibleClass));
                const aInB = a.filter(item => bkeys.has(item.cDeductibleClass));
                const bNotInA = b.filter(item => !akeys.has(item.cDeductibleClass));
                const merged = [...aInB, ...bNotInA];
              
                return merged.map((item: any, index: number) => ({
                  ...item,
                    nSeqNo: index + 1
                  }));
              }
            formData.value = mergeAndNumberArraysPreserveOrder(result, selectdata); 
          },
        }, 
        { title: "添加免赔条件", width: 85 });
  },
  funcpaydel: () => {
  },
};

// 绑定特殊验证器
const exRules = {};

function getFormconfig() {
  return {
    fromType: "custom",
  };
}

function getTableData() {
  return formData.value;
}

function setFormValue(value: any) {
  if(value && value.length>0){
    let ind = 1;
    value.forEach(e => {
      Object.keys(e).forEach(key => {
        const newKey = key.replace('DeductibleDist.', '');
        const v = e[key];
        delete e[key];
        if(newKey === 'cDeductibleClass') {
          e['cDeductibleCode'] = v;
        }else {
          e[newKey] = v;
        }
      })
    });
  }
  // Object.assign(formData.value, value);
  formData.value = value;
}

function getFromValue() {
  return formData.value.map((item) => {
    const prefixedItem: { [key: string]: any } = {};
    for (const key in item) {
      if (item.hasOwnProperty(key)) {
        if(key == 'cDeductibleCode') {
          prefixedItem[`DeductibleDist.cDeductibleClass`] = item[key];
        }else {
          prefixedItem[`DeductibleDist.${key}`] = item[key];
        }
      }
    }
    return prefixedItem;
  });
}

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
  if(key === "Btn_select_deductible_btn"){
    r = true;
  }
  
  if(r){
    tableconfig.tableBtn.forEach(element => {
      element.hidden = false;
    });
  }
}

const highlightText = (row: string) => {
	// 1. 获取原始文本
  let content = row.cDeductibleContent;
  if (!content) return '';

  // 定义关键词数组
  let keywords: string[] = [];

  // --- 逻辑分支 A: 优先检查 editList ---
  if (Array.isArray(row.editList) && row.editList.length > 0) {
    keywords = row.editList.map(String);
  } 
  // --- 逻辑分支 B: 如果没有 editList，检查 cDeductibleFee 系列字段 ---
  else {
    // 动态查找所有以 cDeductibleFee 开头的字段
    const feeKeys = Object.keys(row).filter(key => key.startsWith('cDeductibleFee'));
    
    const feeValues = feeKeys
      .map(key => row[key])
      .filter(val => val !== null && val !== undefined && val !== '');
      
    keywords = feeValues.map(String);
  }

  // 如果最终没有提取到任何关键词，直接返回原文本
  if (keywords.length === 0) return content;

  // --- 执行替换逻辑 (使用你提供的代码结构) ---
  
  // 为了防止 "12" 和 "123" 同时存在导致替换冲突，建议先按长度降序排序
  keywords.sort((a, b) => b.length - a.length);

  // 转义正则特殊字符的辅助函数
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  keywords.forEach((keyword: string) => {
    if (keyword) {
      // 关键点：使用 new RegExp 并加上 'g' (全局) 标志
      // 使用 escapeRegExp 防止数字以外的特殊字符破坏正则
      const regex = new RegExp(escapeRegExp(keyword), 'g');
      
      content = content.replace(regex, `<strong style="color: #F56C6C;">${keyword}</strong>`);
    }
  });

  return content;
}

defineExpose({
  getFromValue,
  setFormValue,
  getFormconfig,
  getTableData,
  setDisabledAll,
  setUnDisabledByKeyList
});
</script>

<style scoped></style>

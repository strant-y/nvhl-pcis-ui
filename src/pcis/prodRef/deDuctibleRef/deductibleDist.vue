<template>
  <myCard :cardConfig="cardconfig">
    <rttable v-model="formData" :item="tableconfig" ref="rttableFrom" />
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
const dzmodal = useDzModal();
const route = useRoute();
const opertaor = dataOpertaor();
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
  // setTimeout(()=>{
      // formData.value = [];
      // formData.value.forEach((item, index) => {
      //     item.nSeqNo = index + 1;
      // });

  // },2000)

  console.log('初始化--’',formData)
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
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    align: "left",
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
          console.log(11,row)
          let param = {};
          if(row['cIfMust'] !== '9') {               // cDeductibleContent
            let rid = row.cDeductibleCode|| row.cDeductibleClass
            const f = originalData.value.find(f => rid === f.cDeductibleClass);
            Object.assign(param, f);
            console.log(1,f)
            console.log(1,originalData.value)
          }else {
            Object.assign(param, row)
              console.log(2)
          }

          if(row.editList && row.editList.length>0){
            param['editList'] = row.editList
          }

          console.log('ddd',param)
          dzmodal.open(deductibleFixEdit, { 
            type: "view", 
            data: param, 
            callback: (res: any) => {
              if (res.type === "ok") {
                // row.cDeductibleContent = res.data.cDeductibleContent
                // row['editList']= res.data['editList']

                 let list = formData.value;
                 const index = list.findIndex(
                    item => item.cDeductibleClass === row.cDeductibleClass
                  );
                  if (index !== -1) {
                    nextTick(()=>{
                      list[index]['cDeductibleContent'] = res.data.cDeductibleContent;
                      list[index]['editList'] =res.data['editList']
                      formData.value = list
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
          console.log('1112')
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
        width: 100,
      },
      {
        prop: "cIfMust",
        inputtype: "rttag",
        title: "是否可选",
        width: 110,
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
      {
        prop: "cDeductibleClass",
        // prop: "cDeductibleCode",
        inputtype: "rtinput",
        title: "免赔条件ID",
        width: 180,
      },
      {
        prop: "cDeductibleContent",
        inputtype: "rtinput",
        title: "免赔内容",
        align: "left",
      },
    ],
  })
);



const initOriginalData = ()=> {
  const param = {
    cProdNo: route.params.param?.cProdNo,
    pageNum: 1,
    pageSize: 999,
  }
  console.log(332,)
  getPrdDeductible(param).then((res) => {
    console.log(12312,res)
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
          selectedData: formData.value, //需要把自定义的过滤掉，只传过去从模板中选择的
        },
        { 
          getSelected(selectdata: any) {
            const mergeAndNumberArraysPreserveOrder = (a: [], b: []): any[] => {
              const akeys = new Set(a.map(item => item.cDeductibleClass));
              const bkeys = new Set(b.map(item => item.cDeductibleClass));
              const aInB = a.filter(item => bkeys.has(item.cDeductibleClass));
              const bNotInA = b.filter(item => !akeys.has(item.cDeductibleClass));
              const merged = [...aInB, ...bNotInA];

              console.log('分别是什么',akeys,bkeys,aInB,bNotInA,merged)
              return merged.map((item: any, index: number) => ({
                ...item,
                nSeqNo: index + 1
              }));
            }
            formData.value = mergeAndNumberArraysPreserveOrder(formData.value, selectdata);
            console.log('66',formData.value)
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
  rttableFrom?.value?.setFormValue(value);
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

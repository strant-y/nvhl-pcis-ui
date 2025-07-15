<!-- 特别约定组件 -->
<template>
  <div> 
    <myCard :cardConfig="cardconfig">
      <rttable v-model="formData" :item="tableconfig" ref="rttableFrom" />
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
const opertaor = dataOpertaor();
const formData = ref<any[]>([]);
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
          // if (!row.cSpecialContent.includes("*")) return true;
           return row.cIfEdit !== '1';
        },
        tableClick: (row) => {
          if(originalData.value.length==0){
              originalData.value =    deepClone(formData.value)
          }
         
          console.log('row',row)
          console.log('1212', originalData.value )
          let param = {};
          if(row['cIfMust'] !== '9') {
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
          dzmodal.open(specEdit, { type: "view", data: param,
          callback: (res: any) => {
              if (res.type === "ok") {
                // row.cSpecialContent = res.data.cSpecialContent
                // row['editList']= res.data['editList']



                 let list = formData.value;
                 const index = list.findIndex(
                    item => item.cSpecialCode === row.cSpecialCode
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
        size: "large",
        icon: "Delete",
        tableClick: (row) => {
          const list = formData.value;
          const i = list.findIndex((item) => item.cSpecNo === row.cSpecNo);
          rttableFrom.value.delRow(row._dataId);
          // if (i !== -1) list.splice(i, 1);
          formData.value.forEach((item, index) => {
            item.index = index + 1;
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
        width: 100,
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
        //  width: 210,
      },
    ],
  })
);

const addData =()=>{
  let obj = [];
  let isAdd = true;
    formData.value.forEach((item)=>{
      if(item.add){
        isAdd = false;
      }
    })
    if(isAdd){
      obj =[...formData.value, {
        addIndex: 1,
        cIfEdit: "0",
        cIfFix: "2",
        cIfMust: "2",
        cSpecialCode: "",
        add:true,
        cSpecialContent: "各期保费应在约定的缴费止期前缴纳，超过约定止期未支付当期保费的，在未支付保费的期间发生保险事故的，本公司按照已缴纳保费及未到缴费期应交保费之和占总保费的比例进行赔偿。",
        // index: formData.value.length+1
      }]
       setFormValue(obj)
    } 
}

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

  setTimeout(()=>{
    // setDisabledAll()
     
  })
});
// 组件卸载时移除事件监听（避免内存泄漏）
onUnmounted(() => {
  eventBus.off('add-special', addData)
})


// 绑定方法
const method = {
  func1: () => {
  },
  //获取特约按钮
  getSpecialAgree: () => {
    const param = opertaor.getParam();
    dialog.value?.open(
      "prdFixSpec",
      {
          cProdNo: param.cProdNo,
          selectedData: formData.value, //需要把自定义的过滤掉，只传过去从模板中选择的
        },
      {
        getSelected(selectdata: any) {
            let len = formData.value.length;
            let sel : any[] = [];
            selectdata.forEach((item: any,index:number) => {
              item.index = index + 1;
              sel.push(item);
              len++;
            });
            originalData.value =    deepClone(sel)
            formData.value = sel
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
/** 查询 */
function handleQuery(flag?: boolean) {
  // const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  // const param = Object.assign(r);
  // getBasicKindList(param)
  //   .then((res) => {
  //     const { code, data, msg } = res;
  //     if (200 === code) {
  //       formData.value = [];
  //       formData.value = data.result;
  //       pageresult.total = data.total;
  //     } else {
  //       ElMessage.error(msg);
  //     }
  //   })
  //   .finally(() => {});
}
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
// function getFromValue() {
//   return formData.value;
// }
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

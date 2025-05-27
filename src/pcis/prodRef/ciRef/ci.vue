<template>
  <app-grid-edit :gridEditConfig="formconfig1" ref="freeEditRef" />
</template>

<script setup lang="ts">
import {
  AppGridEditMethod,
  createAppGridEditConfig,
} from "@/shared/app-grid-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
import { useRoute } from "vue-router";
const route = useRoute();
const param = route.params.param;
import { useProductStore } from "@/store/modules/prod";
const productStore = useProductStore();

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});

const rowData = ref(null)
const freeEditRef = ref<AppGridEditMethod | null>(null);
const formconfig1 = reactive(createAppGridEditConfig({}));

onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
  ciAdd();
  nextTick(() => {
    setFormItem("Ci.cDptCde", {
      loadData: [
        { value: param.cDptCde, label: `${param.cDptCde} ${param.cDptCnm}` },
      ],
    }); 
  });
});

// 绑定方法
const method = {
  ciAdd: () => {
    freeEditRef?.value?.addRow();
    const val=getFromValue()
    val.forEach((key,index) => { 
        key['Ci.nSeqNo']=index+1
    });
  },
  ciDelete:()=>{
    const selData=freeEditRef?.value?.getSelectRow()
      if (!selData) {
          ElMessage.error("请选择要删除的数据!");
          return;
      }
      const editIndex=selData['_dataId']
      freeEditRef?.value?.delRow(editIndex);
      const val=getFromValue()
      val.forEach((key,index) => {
          key['Ci.nSeqNo']=index+1
      });
  },
  cCoinsurerCdeChange:(val)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    if(val ==="327001"){
    codeListStore
        .queryCodeList({
          codeListName: "Comm_Code_LIST",
          codeListParam: { "CParCde": "subdpt", cParCde: "327001" },
        })
        .then((res) => {
          setFormItem("Ci.cSubDptCde", {
            loadData: res,
          });
        });
    }else {
      freeEditRef?.value?.setValueByRowKey("Ci.cSubDptCde",rowData._dataId,"")
      setFormItem("Ci.cSubDptCde", {loadData: [],});
      setFormItem("Ci.cSubDptCde", {
        loadData: [{ value: '1', label: '其他' }]
      });
    }
  },
  nCiShareChange:(val)=>{
    const rowDatas = freeEditRef.value?.getSelectRow();
    let value = parseFloat(val);
    // 如果输入值大于1，则限制为1
    if (value > 1) {
      freeEditRef?.value?.setValueByRowKey("Ci.nCiShare",rowDatas._dataId,parseFloat(1.00000000));
    }
    const nAmt =  parseFloat(productStore.nPrm) * parseFloat(val)
    const nPrm = parseFloat(productStore.nAmt) * parseFloat(val)
    freeEditRef?.value?.setValueByRowKey("Ci.nCiPrm",rowDatas._dataId,nAmt)
    freeEditRef?.value?.setValueByRowKey("Ci.nCiAmt",rowDatas._dataId,nPrm)
  }
};
//给表单下拉项赋值
const setFormItem = (key, obj) => {
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
      }
    });
  }
}

// 绑定特殊验证器
const exRules = {};

function getFromValue() {
  return freeEditRef?.value?.getFromValue();
}
function getSelectRow() {
  return freeEditRef?.value?.getSelectRow();
}
function setFormValue(value: any) {
  freeEditRef?.value?.setFormValue(value);
}
function setValueByRowKey(props:string ,rowId: any, value:any){
  return freeEditRef?.value?.setValueByRowKey(props,rowId,value);
}
function getRowById(rowId: string) {
  return freeEditRef?.value?.getRowById(rowId);
}
function validate() {
  return freeEditRef?.value?.validate();
}
function getTableValue(rowId: number, key: string) {
  freeEditRef?.value?.getTableValue(rowId, key);
}
function ciAdd() {
  if (freeEditRef.value) {
    freeEditRef.value.addRow(); // 添加新行
    const val=getFromValue()
    const num = 1
    val.forEach((key,index) => { 
        key['Ci.nSeqNo']= index+1;
        key['Ci.nCiShare'] = parseFloat(num.toFixed(8));
        //强制更新
        freeEditRef?.value?.setValueByRowKey('Ci.nCiShare',key._dataId,key['Ci.nCiShare'])
    });
  }
}

function getFormconfig(){
  return formconfig1;
}
defineExpose({
  getFromValue,
  setFormValue,
  getSelectRow,
  validate,
  setValueByRowKey,
  getRowById,
  getTableValue,
  getFormconfig,
});
</script>

<style scoped></style>

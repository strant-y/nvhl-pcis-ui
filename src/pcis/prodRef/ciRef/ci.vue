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
import { log } from "console";
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
  // ciAdd();
  nextTick(() => {
    freeEditRef?.value.forEach(row => {
      if (row["Ci.cCoinsurerCde"] !== "327001") {
        freeEditRef.value?.setRowFieldProp(
          row._dataId,
          "Ci.cSubDptCde",
          "loadData",
          [{ value: '1', label: '其他' }]
        );
      }
    });
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
    const val=getFromValue()
    const nCiAmt = parseFloat(productStore.nAmt)
    if(nCiAmt =="0"){
      ElMessage.warning("总保额为0");
      return;
    }
    freeEditRef?.value?.addRow();
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
  //机构部门下拉事件
  cCoinsurerCdeChange:(val)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData._dataId;
    if(val ==="327001"){
      freeEditRef?.value?.setValueByRowKey("Ci.cSubDptCde",rowId,"")
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
        freeEditRef?.value?.setValueByRowKey("Ci.cSubDptCde",rowId,"")
        freeEditRef.value?.setRowFieldProp(
          rowId,
          "Ci.cSubDptCde",
          "loadData",
          [{ value: '1', label: '其他' }]
        );
      }
  },
  //分公司下拉事件
  cSubDptCdeChange:(val)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData._dataId;
    freeEditRef?.value?.setValueByRowKey("Ci.cDptCde",rowId,"")
    codeListStore
        .queryCodeList({
          codeListName: "CDptCde_List",
          codeListParam: { "CDptCde": val },
        })
        .then((res) => {
          freeEditRef.value?.setRowFieldProp(
            rowId,
            "Ci.cDptCde",
            "loadData",
            res,
          );
        });
    
    
      
  },
  //出单标志下拉事件
  clssueMrkChange:  (val)=>{
    // const rowData = freeEditRef.value?.getSelectRow();
    // if(val ==="0" && rowData["Ci.cCoinsurerCde"] === "327001"){
    //     ElMessage.error("联保单出单方必须是主联单的分公司！")
    // }
    // nextTick(()=>{
    //     freeEditRef?.value?.setValueByRowKey("Ci.cIssueMrk",rowData._dataId,"1")
    //   })
  },
  nCiShareChange:(val)=>{
    const rowDatas = freeEditRef.value?.getSelectRow();
    let value = parseFloat(val);
    if (value > 1 || value == "") {
      freeEditRef?.value?.setValueByRowKey("Ci.nCiShare",rowDatas._dataId,parseFloat('1.00000000'));
    }
    const nPrm =  parseFloat(productStore.nPrm) * parseFloat(val)
    const nAmt = parseFloat(productStore.nAmt) * parseFloat(val)
    freeEditRef?.value?.setValueByRowKey("Ci.nCiPrm",rowDatas._dataId,nPrm)
    freeEditRef?.value?.setValueByRowKey("Ci.nCiAmt",rowDatas._dataId,nAmt)
    if(rowDatas["Ci.cCoinsurerCde"] == "327001"){
      opertaor.getTableRefByKey("ciMasterAgreement").setValue("Base.nJiJntAmt",nAmt)  //联保总保额
      opertaor.getTableRefByKey("ciMasterAgreement").setValue("Base.nJiJntPrm",nPrm) //联保总保费
      opertaor.getTableRefByKey("ourCompanyCiShare").setValue("Base.nCiOwnAmt",nAmt) //我司份额保额
      opertaor.getTableRefByKey("ourCompanyCiShare").setValue("Base.nCiOwnPrm",nPrm) //我司份额保费
    }
  },
  nPlyFeeRateChange:(val)=>{
    const rowDatas = freeEditRef.value?.getSelectRow();
    const nPlyFee = parseFloat(val) * parseFloat(rowDatas["Ci.nCiPrm"])
    freeEditRef?.value?.setValueByRowKey("Ci.nPlyFee",rowDatas._dataId,nPlyFee)
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
function setRowFieldProp(rowId: string, field: string, prop: string, value: any) {
  return freeEditRef?.value?.setRowFieldProp(rowId, field, prop, value);
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
        setFormItem("Ci.cDptCde", {
          loadData: [
            { value: param.cDptCde, label: `${param.cDptCde} ${param.cDptCnm}` },
          ],
        });
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
  setRowFieldProp,
  
});
</script>

<style scoped></style>

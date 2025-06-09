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
import { set } from "lodash";
const productStore = useProductStore();

const props = defineProps({
  pageSchema: {
    type: [Object],
    required: true,
  },
});
// const props = defineProps({
//   param: {
//     type: Object,
//   },
// });

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
  //一般批改，部分要素可编辑
  if (param.pageType === "EDR_APP_NEW_SCENE" &&  productStore.cCiMrk !== "0") {
    formconfig1.editFlag = true;
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === 'Ci.cChiefMrk' || item.prop === 'Ci.cIssueMrk') {
        item.disabled = true; // 设置为不可编辑
      } else {
        item.disabled = false; // 其他字段可以编辑
      }
    });
  }
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
    // freeEditRef.value?.setRowFieldProp(
    //       row._dataId,
    //       "Ci.cDptCde",
    //       "loadData",
    //       [{ value: param.cDptCde, label: `${param.cDptCde} ${param.cDptCnm}` }]
    //     );
    // setFormItem("Ci.cDptCde", {
    //   loadData: [
    //     { value: param.cDptCde, label: `${param.cDptCde} ${param.cDptCnm}` },
    //   ],
    // });
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
    const totalCiShare = val.reduce((sum, row) => sum + parseFloat(row['Ci.nCiShare'] || 0), 0);
    // 判断总和是否等于 1
    if (totalCiShare >= 1) {
      ElMessage.warning("共保总保额已被全部分完!不能新增");
      return;
    }

    // 新增行前计算剩余比例
    const remaining = (1 - totalCiShare).toFixed(8);

    freeEditRef?.value?.addRow();
    val.forEach((key,index) => { 
        key['Ci.nSeqNo']=index+1
    });

    // 设置新行的 Ci.nCiShare 为剩余比例
    const newRowId = val[val.length - 1]?._dataId;
    if (newRowId && parseFloat(remaining) > 0) {
      freeEditRef?.value?.setValueByRowKey("Ci.nCiShare", newRowId, remaining);
    }
    
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
  //共保公司下拉事件
  cCoinsurerCdeChange:(val)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData._dataId;
    if(productStore.cCiMrk == "5" && val !== "327001"){
      freeEditRef?.value?.setValueByRowKey("Ci.cCoinsurerCde",rowId,"")
      ElMessage.error("司内联保，不能录入除永安以外的其他公司！");
      return false;
    }
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
    //获取所有行数据
    const allRows = getFromValue();
    // 校验是否存在重复的 Ci.cSubDptCde
    const isDuplicate = allRows.some((row) => {
      // 排除当前行自身
      return row._dataId !== rowId && row["Ci.cSubDptCde"] === val;
    });
    if (isDuplicate) {
      ElMessage.error("联保子公司不能重复选择！");
      // 回退当前行的值
    freeEditRef?.value?.setValueByRowKey("Ci.cSubDptCde", rowId, "");
      return;
    }
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
  //主共标志下拉事件
  cChiefMrkChange:(val)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData._dataId;
    //获取所有行数据
    const allRows = getFromValue();
    // 
    const isDuplicate = allRows.some((row) => {
      // 排除当前行自身
      return row._dataId !== rowId && row["Ci.cChiefMrk"] === val;
    });
    if (isDuplicate) {
      ElMessage.error("主共方只能有一个！");
      // 回退当前行的值
    freeEditRef?.value?.setValueByRowKey("Ci.cChiefMrk", rowId, "");
      return;
    }
  },
  nCiShareChange:(val)=>{
    const rowDatas = freeEditRef.value?.getSelectRow();
    const rowId = rowDatas?._dataId;
    // 校验输入是否合法
    if (val > 1 || val <= 0) {
      ElMessage.warning("联共保比例必须大于0且不能超过1");
      freeEditRef?.value?.setValueByRowKey("Ci.nCiShare", rowId, parseFloat('1').toFixed(8));
      return;
    }

    // 计算当前所有行的总和（排除当前行）
    const allRows = getFromValue();
    const totalOther = allRows
      .filter(row => row._dataId !== rowId)
      .reduce((sum, row) => sum + parseFloat(row["Ci.nCiShare"] || 0), 0);
    // 如果当前值 + 其他行 >= 1，则限制当前行最大值为 1 - 其他行总和
    if (parseFloat(val) + totalOther > 1) {
      const maxVal = (1 - totalOther).toFixed(8);
      freeEditRef?.value?.setValueByRowKey("Ci.nCiShare", rowId, maxVal);
      return;
    }

    const nPrm =  productStore.nPrm * val
    const nAmt = productStore.nAmt * val
    freeEditRef?.value?.setValueByRowKey("Ci.nCiPrm",rowDatas._dataId,nPrm.toFixed(2))
    freeEditRef?.value?.setValueByRowKey("Ci.nCiAmt",rowDatas._dataId,nAmt.toFixed(2))

    if(rowDatas["Ci.cCoinsurerCde"] == "327001"){
      opertaor.getTableRefByKey("ciMasterAgreement").setValue("Base.nJiJntAmt",nPrm.toFixed(2))  //联保总保额
      opertaor.getTableRefByKey("ciMasterAgreement").setValue("Base.nJiJntPrm",nAmt.toFixed(2)) //联保总保费
      opertaor.getTableRefByKey("ourCompanyCiShare").setValue("Base.nCiOwnAmt",nAmt.toFixed(2)) //我司份额保额
      opertaor.getTableRefByKey("ourCompanyCiShare").setValue("Base.nCiOwnPrm",nAmt.toFixed(2)) //我司份额保费
    }
  },
  nPlyFeeRateChange:(val)=>{
    const rowDatas = freeEditRef.value?.getSelectRow();
    const nPlyFee = val * rowDatas["Ci.nCiPrm"]
    freeEditRef?.value?.setValueByRowKey("Ci.nPlyFee",rowDatas._dataId,nPlyFee)
  },
  //开户行大类改变
  cBankRelTypChange:(val)=>{
    const rowDatas = freeEditRef.value?.getSelectRow();
    freeEditRef.value?.setValueByRowKey("Ci.cBankAddr",rowDatas._dataId,val)
  },
  //开户行省改变
  cProvinceChange:(val)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData._dataId;
    freeEditRef?.value?.setValueByRowKey("Ci.cBankArea",rowId,"")
    freeEditRef.value?.setRowFieldProp(rowId,"Ci.cBankArea","loadData",[],);
    codeListStore
        .queryCodeList({
          codeListName: "CBankAreaList",
          codeListParam: { "areaprovince": val },
        })
        .then((res) => {
          freeEditRef.value?.setRowFieldProp(
            rowId,
            "Ci.cBankArea",
            "loadData",
            res,
          );
        });
  },
  //开户行市改变
  cCityChange:(val)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData._dataId;
    freeEditRef?.value?.setValueByRowKey("Ci.cCountryCde",rowId,"")
    codeListStore
        .queryCodeList({
          codeListName: "CBankCountyList",
          codeListParam: { "areaprovince": rowData['Ci.cBankArea'],"areaname":val },
        })
        .then((res) => {
          freeEditRef.value?.setRowFieldProp(
            rowId,
            "Ci.cBankCounty",
            "loadData",
            res,
          );
        });
        //Ci.cBankPro 省
        //Ci.cBankArea 市
        // Ci.cBankCounty  县
  },
  //开户行县改变
  cCountyChange:(val) => { 
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData._dataId;
    freeEditRef?.value?.setValueByRowKey("Ci.cBankCde",rowId,"")
    codeListStore
        .queryCodeList({
          codeListName: "CBankCountyList",
          codeListParam: { "areaprovince": rowData['Ci.cBankCounty'],"areaname":val },
        })
        .then((res) => {
          freeEditRef.value?.setRowFieldProp(
            rowId,
            "Ci.cBankCde",
            "loadData",
            res,
          );
        });
  },
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

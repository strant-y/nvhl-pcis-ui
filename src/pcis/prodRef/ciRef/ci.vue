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
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { useProductStore } from "@/store/modules/prod";
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
  console.log("url路由参数",param);
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
          // setFormItem("Ci.cSubDptCde", {
          //   loadData: res,
          // });
          freeEditRef.value?.setRowFieldProp(
            rowId,
            "Ci.cSubDptCde",
            "loadData",
            res,
          );
        });
        updateMasterAgreementValues();
    }else {
      freeEditRef?.value?.setValueByRowKey("Ci.cSubDptCde",rowId,"")
      freeEditRef.value?.setRowFieldProp(
        rowId,
        "Ci.cSubDptCde",
        "loadData",
        [{ value: '1', label: '其他' }]
      );
      updateMasterAgreementValues();
    }
  },
  //分公司下拉事件
  cSubDptCdeChange:(val)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData._dataId;
    //获取所有行数据
    // const allRws = getFromValue();
    // 校验是否存在重复的 Ci.cSubDptCde
    // const isDuplicate = allRows.some((row) => {
      // 排除当前行自身
      // return row._dataId !== rowId && row["Ci.cSubDptCde"] === val;
    // });
    // if (isDuplicate) {
    //   ElMessage.error("联保子公司不能重复选择！");
    //   // 回退当前行的值
    // freeEditRef?.value?.setValueByRowKey("Ci.cSubDptCde", rowId, "");
    //   return;
    // }
    // freeEditRef?.value?.setValueByRowKey("Ci.cDptCde",rowId,"")
    console.log("val",val);
    if(val === "1"){
      freeEditRef?.value?.setValueByRowKey("Ci.cDptCde",rowId,"")
      freeEditRef?.value?.setRowFieldProp(
        rowId,
        "Ci.cDptCde",
        "rules",
        [] 
      );
      } else {
        freeEditRef?.value?.setRowFieldProp(
          rowId,
          "Ci.cDptCde",
          "rules",
          [getRules("required", {})] // 使用 getRules 设置必填规则
        );
    }
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
  //出单机构下拉事件
  cDptCdeChange:(val)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData._dataId;

    // 获取所有行数据
    const allRows = getFromValue();

    // 校验是否存在重复的 Ci.cCoinsurerCde, Ci.cSubDptCde, Ci.cDptCde 组合
    const isDuplicate = allRows.some((row) => {
      // 排除当前行自身
      return row._dataId !== rowId &&
            row["Ci.cCoinsurerCde"] === rowData["Ci.cCoinsurerCde"] &&
            row["Ci.cSubDptCde"] === rowData["Ci.cSubDptCde"] &&
            row["Ci.cDptCde"] === val;
    });

    if (isDuplicate) {
      ElMessage.error("已经存在相同的共保公司、分公司和出单机构组合！");
      // 回退当前行的出单机构值
      freeEditRef?.value?.setValueByRowKey("Ci.cDptCde", rowId, "");
      return;
    }

  },
  //出单标志下拉事件
  clssueMrkChange:  (val)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData?._dataId;
    if (!rowData || !rowId) return;
    // if (productStore.cCiMrk === "2" || productStore.cCiMrk === "4") {
      // 获取所有行数据
      const allRows = getFromValue();
      // 检查是否已有其他行的 cIssueMrk 是 1
      const existingIssueMrk = allRows.some(
        (row) => row._dataId !== rowId && row["Ci.cIssueMrk"] === "1"
      );
      if (val === "1" && existingIssueMrk) {
        ElMessage.error("出单方有且只能有一个！");
        // 回退当前行的值
        freeEditRef?.value?.setValueByRowKey("Ci.cIssueMrk", rowId, "");
        return;
      }
    // }
    
  },
  //主共标志下拉事件
  cChiefMrkChange:(val)=>{
    //否0,1是
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData._dataId;
    //获取所有行数据
    const allRows = getFromValue();
    //
    if(val === "1"){
      
    }
    // const isDuplicate = allRows.some((row) => {
    //   // 排除当前行自身
    //   return row._dataId !== rowId && row["Ci.cChiefMrk"] === val;
    // });
    // if (isDuplicate) {
    //   ElMessage.error("主共方只能有一个！");
    //   // 回退当前行的值
    // freeEditRef?.value?.setValueByRowKey("Ci.cChiefMrk", rowId, "");
    //   return;
    // }
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

    if (rowDatas["Ci.cCoinsurerCde"] === "327001") {
      // 更新当前行的 Ci.nCiAmt 和 Ci.nCiPrm，并更新 ciMasterAgreement 的值
      const ciAmt = val * productStore.nAmt;
      const ciPrm = val * productStore.nPrm;

      freeEditRef?.value?.setValueByRowKey("Ci.nCiAmt", rowDatas._dataId, ciAmt.toFixed(2));
      freeEditRef?.value?.setValueByRowKey("Ci.nCiPrm", rowDatas._dataId, ciPrm.toFixed(2));
    }
    // 更新 ciMasterAgreement 的值
    updateMasterAgreementValues();
    // if(rowDatas["Ci.cCoinsurerCde"] == "327001"){
      // opertaor.getTableRefByKey("ciMasterAgreement").setValue("Base.nJiJntAmt",nPrm.toFixed(2))  //联保总保额
      // opertaor.getTableRefByKey("ciMasterAgreement").setValue("Base.nJiJntPrm",nAmt.toFixed(2)) //联保总保费
      // opertaor.getTableRefByKey("ourCompanyCiShare").setValue("Base.nCiOwnAmt",nAmt.toFixed(2)) //我司份额保额
      // opertaor.getTableRefByKey("ourCompanyCiShare").setValue("Base.nCiOwnPrm",nAmt.toFixed(2)) //我司份额保费
    // }
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
const updateMasterAgreementValues = () => {
  const allRows = getFromValue(); // 获取所有行数据
  let totalAmt = 0;
  let totalPrm = 0;

  // 遍历所有行，只处理 Ci.cCoinsurerCde === "327001" 的行
  allRows.forEach(row => {
    if (row["Ci.cCoinsurerCde"] === "327001") {
      const share = parseFloat(row["Ci.nCiShare"]) || 0;
      const nAmt = productStore.nAmt ? parseFloat(productStore.nAmt) : 0;
      const nPrm = productStore.nPrm ? parseFloat(productStore.nPrm) : 0;

      const ciAmt = share * nAmt;
      const ciPrm = share * nPrm;

      // 更新当前行的 Ci.nCiAmt 和 Ci.nCiPrm
      freeEditRef?.value?.setValueByRowKey("Ci.nCiAmt", row._dataId, ciAmt.toFixed(2));
      freeEditRef?.value?.setValueByRowKey("Ci.nCiPrm", row._dataId, ciPrm.toFixed(2));

      // 累加到总和
      totalAmt += ciAmt;
      totalPrm += ciPrm;
    }
  });
  // 设置到对应组件字段
  opertaor.getTableRefByKey("ciMasterAgreement").setValue("Base.nJiJntAmt", totalAmt.toFixed(2));
  opertaor.getTableRefByKey("ciMasterAgreement").setValue("Base.nJiJntPrm", totalPrm.toFixed(2));
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

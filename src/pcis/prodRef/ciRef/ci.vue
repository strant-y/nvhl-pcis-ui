<template>
  <app-grid-edit :gridEditConfig="formconfig1" ref="freeEditRef" />
  <comDialog ref="dialogRef"></comDialog>
</template>

<script setup lang="ts">
import {
  AppGridEditMethod,
  createAppGridEditConfig,
} from "@/shared/app-grid-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { checkCdeptByCdptCde, getNmeByCde } from "@/api/prod/index";
const opertaor = dataOpertaor();
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
import { useRoute } from "vue-router";
const route = useRoute();
const param = route.params.param;
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { useProductStore } from "@/store/modules/prod";
import CostInformation from "@/views/pcis-new-udr-list/pages/CostInformation.vue";
import { constantRoutes } from "@/router";
const productStore = useProductStore();
const dialogRef = ref<DialogMethod | null>(null);

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

const sessionData = ref(null);
const rowData = ref(null)
const freeEditRef = ref<AppGridEditMethod | null>(null);
const formconfig1 = reactive(createAppGridEditConfig({}));
const initFlag = computed(() => opertaor.getParam().initFlag);
let bankRelTypeArr: any[] = []; // 收款银行大类分解
onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
  //一般批改，部分要素可编辑
  const cCiMrkValue =  opertaor.getTableRefByKey("plyBase").getValue("Base.cCiMrk");
  setTimeout(() => {
    // if(param?.cAppTyp == 'A'){ //核保
    //   const tableList = getFromValue();
    //   tableList.forEach((item:any) => {
    //     const rowItem  =  freeEditRef.value?.getRowAllItemRefById(item._dataId)
    //     rowItem['Ci.cSlsCde']['btnItems'].disabled = true;
    //     rowItem['Ci.cBrkrCde']['btnItems'].disabled = true;
    //     rowItem['Ci.cBrkSlsCde']['btnItems'].disabled = true;
    //   })
    // }
  //   if (param?.pageType === "EDR_APP_NEW_SCENE" && cCiMrkValue !== "0" && cCiMrkValue =='5' && param.cRsnDetailCde.value == "FZ") {
  //     formconfig1.editFlag = true;
  //     formconfig1.fromSchema?.forEach((item) => {
  //       item.disabled = true;
  //   });
  // }else if(param?.pageType === "EDR_APP_NEW_SCENE" && cCiMrkValue !== "0" && cCiMrkValue !=='5' && param.cRsnDetailCde.value == "47"){
  //   const tableList = getFromValue();
  //   freeEditRef.value?.getRowAllItemRefById()
  //   tableList.forEach((item:any) => {
  //     const rowItem  =  freeEditRef.value?.getRowAllItemRefById(item._dataId)
  //     if(item['Ci.cChiefMrk'] == '1'){
  //       rowItem['Ci.nCiShare'].disabled = false
  //     }
  //     if(item['Ci.cChiefMrk'] == '0' && item['Ci.cCoinsurerCde'] !== '327001'){
  //       rowItem['Ci.nCiShare'].disabled = false
  //       rowItem['Ci.nPlyFeeRate'].disabled = false
  //       rowItem['Ci.cCoinsurerCde'].disabled = false
  //     }
  //     if(item['Ci.cChiefMrk'] == '0'){
  //       rowItem['Ci.nCiShare'].disabled = false
  //       rowItem['Ci.nPlyFeeRate'].disabled = false
  //     }
  //   })
  //   }
  }, 1000);
  setTimeout(() => {
    // if(param?.cAppTyp == 'A'){ //核保
    //   const tableList = getFromValue();
    //   tableList.forEach((item:any) => {
    //     const rowItem  =  freeEditRef.value?.getRowAllItemRefById(item._dataId)
    //     rowItem['Ci.cSlsCde']['btnItems'].disabled = true;
    //     rowItem['Ci.cBrkrCde']['btnItems'].disabled = true;
    //     rowItem['Ci.cBrkSlsCde']['btnItems'].disabled = true;
    //   })
    // }
  }, 2000);
  formconfig1.fromSchema?.forEach((item:any) => {
    if(item.prop === 'Ci.cCoinsurerCde') {
      item.minWidth = 240
    }
  })
});

// 绑定方法
const method = {
  ciAdd: () => {
    const dataList = getFromValue();
    // const cBsnsTyp = opertaor.getTableRefByKey("plyBase").getValue("Base.cBsnsTyp")
    const cCiMrkFlag = opertaor.getTableRefByKey("plyBase").getValue("Base.cCiMrk");
    const nCiAmt = parseFloat(productStore.nAmt)
    if(nCiAmt =="0"){
      ElMessage.warning("总保额为0");
      return;
    }
    const totalCiShare = dataList.reduce((sum, row) => sum + parseFloat(row['Ci.nCiShare'] || 0), 0);
    // 判断总和是否等于 1
    if (totalCiShare >= 100) {
      ElMessage.warning("共保总保额已被全部分完!不能新增");
      return;
    }
    // 新增行前计算剩余比例
    const remaining = (100 - totalCiShare).toFixed(8);
    const cChiefMrk = ['1', '3'].includes(cCiMrkFlag) ? '1' : '0';
    // const cSlsCde = opertaor.getTableRefByKey('plyBase').getValue('Base.cSlsId')
    if(dataList.length == 0){
        freeEditRef?.value?.addRowByData({
          'Ci.nSeqNo': dataList.length + 1,
          'Ci.nPlyFeeRate': '0.00',
          'Ci.nPlyFee': '0.00',
          'Ci.nComm': '0.00',
          'Ci.cSlsCde':"",
          "Ci.cBrkrCde":"",
          "Ci.cBrkSlsCde":"",
          'Ci.cChiefMrk': cChiefMrk,
          'Ci.cCoinsurerCde': '327001',
          'Ci.cSubDptCde': param.dptCde,
          'Ci.cDptCde': param.cDptCde,
      });
    }else{
      freeEditRef?.value?.addRowByData({
          'Ci.nSeqNo': dataList.length + 1,
          'Ci.nPlyFeeRate': '0.00',
          'Ci.nPlyFee': '0.00',
          'Ci.nComm': '0.00',
          'Ci.cSlsCde':"",
          "Ci.cBrkrCde":"",
          "Ci.cBrkSlsCde":"",
          'Ci.cChiefMrk': cChiefMrk,
          // 'Ci.cCoinsurerCde': '327001',
          // 'Ci.cSubDptCde': param.dptCde,
          // 'Ci.cDptCde': param.cDptCde,
      });
    }
    valideRequired()
    if(cCiMrkFlag == "2" || cCiMrkFlag == "4"){
      formconfig1.fromSchema?.forEach((item) => {
        if(item.prop == "Ci.nCiPrm"){
          item.disabled = false;
        }
      });
    }
    // 设置新行的 Ci.nCiShare 为剩余比例
    const newRowId = dataList[dataList.length - 1]?._dataId;
    if (newRowId && parseFloat(remaining) > 0) {
      freeEditRef?.value?.setValueByRowKey("Ci.nCiShare", newRowId, remaining);
    }
    updateMasterAgreementValues()
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
  // 共保公司下拉初始化事件 from-init 会自动绑定
  cCoinsurerCdeOnInit: (data: any) => {
    const {value, rowData, config, itemRef} = data;
    if(!rowData || !config || !itemRef) return;
    const rowId = rowData._dataId;
    if (value === "327001") {
      // 如果选择的是永安保险，加载对应的分公司列表
      codeListStore
          .queryCodeList({
            codeListName: "Comm_Code_LIST",
            codeListParam: { "CParCde": "subdpt", cParCde: "327001" },
          })
          .then((res) => {
            freeEditRef.value?.addCodeListMap({
              code:"Ci.cSubDptCde"+rowId,
              list:res,
            })
          });
    } else {
      freeEditRef.value?.addCodeListMap({
            code: "Ci.cSubDptCde"+rowId,
            list: [{ label: '其他',value: '1',  }]
          }
      );
    }
    updateMasterAgreementValues()
  },
  // 共保公司改变事件
  cCoinsurerCdeChange:(val)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const formTableData = getFromValue();
    const plyBasedata = opertaor.getTableRefByKey("plyBase").getFromValue();
    if (!rowData) return;
    const rowId = rowData._dataId;
    if(!initFlag.value){
      if (plyBasedata["Base.cCiMrk"] === "5" && val !== "327001") {
        freeEditRef?.value?.setValueByRowKey("Ci.cCoinsurerCde", rowId, "");
        ElMessage.error("司内联保，不能录入除永安以外的其他公司！");
        return false;
      }
      freeEditRef?.value?.setValueByRowKey("Ci.cSubDptCde", rowId, "");
      if(plyBasedata["Base.cBsnsTyp"] === '19001'){
        freeEditRef.value?.setRowFieldProp(
                rowData._dataId, "Ci.cDptCde", "rules", [getRules("required", {})]
        );
      }
    }
    if (val === "327001") {
      valideRequired()
      // 如果选择的是永安保险，加载对应的分公司列表
      codeListStore
        .queryCodeList({
          codeListName: "Comm_Code_LIST",
          codeListParam: { "CParCde": "subdpt", cParCde: "327001" },
        })
        .then((res) => {
          freeEditRef.value?.addCodeListMap(
              {code: "Ci.cSubDptCde"+rowId,
                list: res
              }
          );
        });
        if (plyBasedata["Base.cCiMrk"] === "3" || plyBasedata["Base.cCiMrk"] === "4") {
          const isYonganAlreadyPresent = formTableData.some(
            (row) => row._dataId !== rowId && row['Ci.cCoinsurerCde'] === "327001"
          );
          if (isYonganAlreadyPresent) {
            ElMessage.error('主（从）共无联保，我司只能录入一次！');
            freeEditRef.value?.setValueByRowKey("Ci.cCoinsurerCde", rowId, "");
            return;
          }
        }
    } else {
      // 非永安保险，设置默认值和其他数据
      freeEditRef.value?.addCodeListMap(
          {code: "Ci.cSubDptCde"+rowId,
            list: [{ label: '其他',value: '1',  }]
          }
      );
      freeEditRef?.value?.setValueByRowKey("Ci.cSubDptCde", rowId, "1");
      freeEditRef.value?.setValueByRowKey("Ci.cDptCde", rowId, "");
    }
    valideRequired()
    updateMasterAgreementValues()
  },

  // 分公司下拉初始化事件 from-init 会自动绑定
  cSubDptCdeOnInit: (data: any) => {
    const {value, rowData, config, itemRef} = data;
    // if(!rowData || !config || !itemRef) return;
    const rowId = rowData._dataId;
    if(value && value !== ""){
      codeListStore
          .queryCodeList({
            codeListName: "CDptCde_List",
            codeListParam: { "CDptCde": value },
          })
          .then((res) => {
            if(value !== '1'){
              freeEditRef.value?.addCodeListMap(
              {
                  code: "Ci.cDptCde"+rowId,
                  list: res
                }
              )
            }else{
              freeEditRef.value?.addCodeListMap(
              {
                  code: "Ci.cDptCde"+rowId,
                  list: []
                }
              )
            }
          });
    }
  },
  //分公司下拉事件
  cSubDptCdeChange:(val)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    // if (!rowData || !initFlag.value) return;
    const rowId = rowData._dataId;
    if(val !=""){
      codeListStore
        .queryCodeList({
          codeListName: "CDptCde_List",
          codeListParam: { "CDptCde": val },
        })
        .then((res) => {
          freeEditRef?.value?.setValueByRowKey("Ci.cDptCde", rowId, "");
          if(val !== '1'){
            freeEditRef.value?.addCodeListMap(
             {
                code: "Ci.cDptCde"+rowId,
                list: res
              }
            )
          }else{
            freeEditRef.value?.addCodeListMap(
             {
                code: "Ci.cDptCde"+rowId,
                list: []
              }
            )
          }
        });
    }
    onChiefMrkChange()
  },
  cContactTypChange:(val)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData._dataId;
    freeEditRef.value?.setRowFieldProp(
      rowId,
      "Ci.cContactTyp",
      "rules",
      [getRules("phoneNo", {})]
    );
  },
  //出单机构下拉事件
  cDptCdeChange:(val)=>{
    onChiefMrkChange()
    const rowData = freeEditRef.value?.getSelectRow();
    // if (!rowData || !initFlag.value) return;
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
    const cCiMrk = opertaor.getTableRefByKey("plyBase").getFromValue()
    if (!rowData || !rowId) return;
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
      if (val === "0") {
        if(cCiMrk["Base.cCiMrk"] == '1' || cCiMrk["Base.cCiMrk"] == '5'){
          if(rowData['Ci.cDptCde'] == param.cDptCde){
            ElMessage.error("联保单出单方必须是主联单的分公司！");
            freeEditRef?.value?.setValueByRowKey("Ci.cIssueMrk", rowId, "");
          }
        }
      }
      allRows.forEach((item:any) => {
        const rowItem  =  freeEditRef.value?.getRowAllItemRefById(item._dataId)
        if(item['Ci.cIssueMrk'] == '1'){
          rowItem['Ci.nPlyFeeRate'].disabled = true
        }else{
          rowItem['Ci.nPlyFeeRate'].disabled = false
        }
      })
  },
  //主共标志下拉事件
  cChiefMrkChange:(val)=>{
    //否0,是1
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData?._dataId;
    const cCiMrk = opertaor.getTableRefByKey("plyBase").getFromValue()
    if (!rowData || !rowId) return;
    const cCoinsurerCde = rowData["Ci.cCoinsurerCde"];
    // 我方主共或从共的情况
    if (cCiMrk["Base.cCiMrk"] === '2' || cCiMrk["Base.cCiMrk"] === '4') {
      // 情况1：如果选中的是“是”且是永安保险(327001)
      if ( val === "1" && cCoinsurerCde === "327001") {
        ElMessage.error("我方从共时主共保方不能是我司！");
        freeEditRef?.value?.setValueByRowKey("Ci.cChiefMrk", rowId, "");
        return;
      }
    }
    // 情况2：检查是否已有其他行的主共标志为“是”
      const allRows = getFromValue();
      const existingChief = allRows.some(
        (row) => row._dataId !== rowId && row["Ci.cChiefMrk"] === "1"
      );
      if (val === "1" && existingChief) {
        ElMessage.error("主共方只能有一个！");
        freeEditRef?.value?.setValueByRowKey("Ci.cChiefMrk", rowId, "");
        return;
      }
    // 我方从共时，主共保方必须是我司
    if (cCiMrk["Base.cCiMrk"] === '1' || cCiMrk["Base.cCiMrk"] === '3') {
      if (val === "1" && cCoinsurerCde !== "327001") {
        ElMessage.error("我方主共时主共保方必须是我司！");
        freeEditRef?.value?.setValueByRowKey("Ci.cChiefMrk", rowId, "");
        return;
      }
    }
  },
  //联共保比例
  nCiShareChange:(val)=>{
    const rowDatas = freeEditRef.value?.getSelectRow();
    const rowId = rowDatas?._dataId;
    // 校验输入是否合法
    const floatValue = parseFloat(val);
    if (!isNaN(floatValue) && isFinite(floatValue)) {
      // 判断是否是合法数字且不是 Infinity
      if (floatValue < 0 || floatValue > 100) {
        ElMessage.warning("联共保比例必须大于等于0且小于等于100");
        freeEditRef?.value?.setValueByRowKey("Ci.nCiShare", rowId, "");
        return;
      }
      const limitedValue = floatValue.toFixed(8); // 最多保留8位小数
      freeEditRef?.value?.setValueByRowKey("Ci.nCiShare", rowId, limitedValue);
    } else {
      ElMessage.error("请输入合法的数字");
      freeEditRef?.value?.setValueByRowKey("Ci.nCiShare", rowId, "");
    }
    // 计算当前所有行的总和（排除当前行）
    const allRows = getFromValue();
    const totalOther = allRows
      .filter(row => row._dataId !== rowId)
      .reduce((sum, row) => sum + parseFloat(row["Ci.nCiShare"] || 0), 0);
    // 如果当前值 + 其他行 >= 100，则限制当前行最大值为 100 - 其他行总和
    if (parseFloat(val) + totalOther > 100) {
      const maxVal = (100 - totalOther).toFixed(8);
      freeEditRef?.value?.setValueByRowKey("Ci.nCiShare", rowId, maxVal);
      return;
    }
    const cCiMrk = opertaor.getTableRefByKey("plyBase").getValue("Base.cCiMrk");
    if (cCiMrk === "2" || cCiMrk === "4") {
      updateMasterAgreementValues();
      const allData =  getFromValue();
      for (let i = 1; i < allData.length; i++) {
        const currentRow = allData[i];
        const previousRow = allData[i - 1];
        const currentPremium = parseFloat(currentRow["Ci.nCiPrm"] || 0);
        const previousPremium = parseFloat(previousRow["Ci.nCiPrm"] || 0);
        const diff = Math.abs(currentPremium - previousPremium);
        if (diff > 1) {
          ElMessage.error('联共保保费之间的误差不能大于1');
          break;
        }
      }
    }
    updateMasterAgreementValues();
    onChiefMrkChange()
    //根据新的联共保保费和出单费比例重新计算出单费用
    const updatedRowData = freeEditRef.value?.getSelectRow();
    const nPlyFeeRate = parseFloat(updatedRowData["Ci.nPlyFeeRate"] || 0);
    const nCiPrm = parseFloat(updatedRowData["Ci.nCiPrm"] || 0);
    const nPlyFee = nPlyFeeRate * nCiPrm;
    freeEditRef?.value?.setValueByRowKey("Ci.nPlyFee", updatedRowData._dataId, nPlyFee.toFixed(2));
  },
  //出单费比例
  nPlyFeeRateChange:(val)=>{
    const rowDatas = freeEditRef.value?.getSelectRow();
    const nPlyFee = val * rowDatas["Ci.nCiPrm"]
    freeEditRef?.value?.setValueByRowKey("Ci.nPlyFee",rowDatas._dataId,nPlyFee.toFixed(2))
  },
  //开户行大类改变
  cBankRelTypChange:(val)=>{
    const rowDatas = freeEditRef.value?.getSelectRow();
    bankRelTypeArr = val.split('_')
    freeEditRef.value?.setValueByRowKey("Ci.cBankAddr",rowDatas._dataId,bankRelTypeArr[1])
    freeEditRef.value?.setRowFieldProp(rowDatas._dataId, "Ci.cBankPro", "rules", [getRules("required", {})]);
    freeEditRef.value?.setRowFieldProp(rowDatas._dataId, "Ci.cBankArea", "rules", [getRules("required", {})]);
    freeEditRef.value?.setRowFieldProp(rowDatas._dataId,"Ci.cBankCnaps","disabled",true)
  },
  //开户行省改变
  cProvinceChange:(val,row)=>{
    setValueByRowKey("Ci.cBankArea",row._dataId,"")
    setValueByRowKey("Ci.cBankCounty",row._dataId,"")
    setOptions('Ci.cBankArea',row._dataId,'CBankAreaList',{ "areaprovince": val })
  },
  //开户行市改变
  cCityChange:(val,row)=>{
    setValueByRowKey("Ci.cBankCounty",row._dataId,"")
    setOptions('Ci.cBankCounty',row._dataId,'CBankCountyList',{ "areaname": val })
  },
  //开户行县改变
  cCountyChange:(val,row) => { 
    setOptions('Ci.cBankCde',row._dataId,'CBankCdeList',{ "banktypecod":bankRelTypeArr[3],"areacode":val })
  },
  //初始化省
  cBankProOnInit:(data:any)=>{
    const {value, rowData, config, itemRef} = data;
    if (!value || !rowData || !config || !itemRef) return;
    setOptions("Ci.cBankArea", rowData._dataId, "CBankAreaList",{ "areaprovince": value });
  },
  //初始化市
  cBankAreaOnInit:(data:any)=>{
    const {value, rowData, config, itemRef} = data;
    if (!value || !rowData || !config || !itemRef) return;
    setOptions('Ci.cBankCounty',rowData._dataId,'CBankCountyList',{ "areaname": value })
  },
  //初始化县
  cBankCountyOnInit:(data:any)=>{
    const {value, rowData, config, itemRef} = data;
    if (!value || !rowData || !config || !itemRef) return;
    setOptions('Ci.cBankCde',rowData._dataId,'CBankCdeList',{ "banktypecod":bankRelTypeArr[3],"areacode":value })
  },
    // 开户行    CNAPS号 开户行地址
  cBankCdeChange: (val: any) => {
    // if (val) {
      // let backAddr = val.split('_');
      // setValue('Ci.cBankCnaps', backAddr[0])
      // setValue('Ci.cBankAddr', backAddr[1])
    // }
    dialogRef.value?.open(
        "cBrkrCdeModal",
        {
          type: "show",
          data: {
            rowData:rowData,
          },
          method: {
            getSelected: (params) => {
              // freeEditRef.value?.setRowFieldProp(rowId,"Ci.cBrkrCde","loadData","")
              dialogRef.value?.handleClose();
            },
          },
        },
        {
          isOk: (selectdata: any) => {
            console.log("a", selectdata);
          },
        },
        { title: "银行信息", width: 85 }
      );
  },
  //业务员
  cSlsCdeChange:()=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData?._dataId;
    dialogRef.value?.open(
      "ciagentWorker",
      {
        type: "show",
        data: {
          rowData: rowData,
        },
        method: {
          getSelected: (params) => {
            freeEditRef.value?.setRowFieldProp(rowId,"Ci.cSlsCde","loadData",[{ label: `${params.CSlsCde}${params.CSlsNme}`, value: params.CSlsCde }])
            freeEditRef?.value?.setValueByRowKey("Ci.cSlsCde", rowId, params.CSlsCde);
            freeEditRef?.value?.setValueByRowKey("Ci.cSlsNme", rowId, params.CSlsNme);
            dialogRef.value?.handleClose();
          },
        },
      },
      {
        isOk: (selectdata: any) => {
          console.log("a", selectdata);
        },
      },
      { title: "业务员", width: 85 }
    );
  },
  //代理/经纪人
  cBrkrCdeChange:()=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData?._dataId;
    console.log("rowData", rowData);
    dialogRef.value?.open(
      "ciagentPer",
      {
        type: "show",
        data: {
          rowData:rowData,
        },
        method: {
          getSelected: (params) => {
            // freeEditRef?.value?.setValueByRowKey("Ci.cBrkrCde", rowId, params.CChaCde);
            freeEditRef.value?.setRowFieldProp(rowId,"Ci.cBrkrCde","loadData",[{ label: `${params.CChaCde}${params.CSlsNme}`, value: params.CChaCde }])
            freeEditRef.value?.setRowFieldProp("Ci.cBrkrCde",rowId,params.CChaCde)
            freeEditRef.value?.setRowFieldProp(rowId,"Ci.cBrkrCde","loadData",[])
            dialogRef.value?.handleClose();
          },
        },
      },
      {
        isOk: (selectdata: any) => {
          console.log("a", selectdata);
        },
      },
      { title: "代理查询", width: 85 }
    );
  },
  //代理业务员
  cBrkSlsCdeChange:()=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData?._dataId;
    dialogRef.value?.open(
      "ciagentWorker",
      {
        type: "show",
        data: {
          rowData: rowData,
        },
        method: {
          getSelected: (params) => {
            freeEditRef.value?.setRowFieldProp(rowId,"Ci.cBrkSlsCde","loadData",[{ label: `${params.CSlsCde}${params.CSlsNme}`, value: params.CSlsCde }])
            freeEditRef?.value?.setValueByRowKey("Ci.cBrkSlsCde", rowId, params.CSlsCde);
            dialogRef.value?.handleClose();
          },
        },
      },
      {
        isOk: (selectdata: any) => {
          console.log("a", selectdata);
        },
      },
      { title: "业务员", width: 85 }
    );
  },
};
const updateMasterAgreementValues = () => {
  const allRows = getFromValue(); // 获取所有行数据
  let totalAmt = 0;
  let totalPrm = 0;
  // 遍历所有行，只处理 Ci.cCoinsurerCde === "327001" 的行
  const res = opertaor.getDataAll();
  allRows.forEach(row => {
    if (row["Ci.cCoinsurerCde"] === "327001") {
      const share = parseFloat(row["Ci.nCiShare"])/100 || 0;
      const nAmt = res["base"]["Base.nAmt"] ? parseFloat(res["base"]["Base.nAmt"]) : 0;
      const nPrm = res["base"]["Base.nPrm"] ? parseFloat(res["base"]["Base.nPrm"]) : 0;
      const ciAmt = share * nAmt;
      const ciPrm = share * nPrm;
      // 更新当前行的 Ci.nCiAmt 和 Ci.nCiPrm
      freeEditRef?.value?.setValueByRowKey("Ci.nCiAmt", row._dataId, ciAmt.toFixed(2));
      freeEditRef?.value?.setValueByRowKey("Ci.nCiPrm", row._dataId, ciPrm.toFixed(2));
      // 累加到总和
      totalAmt += ciAmt;
      totalPrm += ciPrm;
      opertaor.getTableRefByKey("ciMasterAgreement").setValue("Base.nJiJntAmt", totalAmt.toFixed(2));  //联保总保额
      opertaor.getTableRefByKey("ciMasterAgreement").setValue("Base.nJiJntPrm", totalPrm.toFixed(2)); //联保总保费
      // opertaor.getTableRefByKey("ciMasterAgreement").setValue("Base.nCiJntAmt", totalAmt.toFixed(2));  //共保总保额
      // opertaor.getTableRefByKey("ciMasterAgreement").setValue("Base.nCiJntPrm", totalPrm.toFixed(2)); //共保总保费
    }else{
      // 非永安保险公司：仅更新该行的 Ci.nCiAmt 和 Ci.nCiPrm，不参与总和计算
      const share = parseFloat(row["Ci.nCiShare"])/100 || 0;
      const nAmt = res["base"]["Base.nAmt"] ? parseFloat(res["base"]["Base.nAmt"]) : 0;
      const nPrm = res["base"]["Base.nPrm"] ? parseFloat(res["base"]["Base.nPrm"]) : 0;

      const ciAmt = share * nAmt;
      const ciPrm = share * nPrm;

      // 更新当前行的 Ci.nCiAmt 和 Ci.nCiPrm
      freeEditRef?.value?.setValueByRowKey("Ci.nCiAmt", row._dataId, ciAmt.toFixed(2));
      freeEditRef?.value?.setValueByRowKey("Ci.nCiPrm", row._dataId, ciPrm.toFixed(2));
    }
  });
  // 设置到对应组件字段（仅使用永安保险的总和）
  allRows.forEach((row) => {
    if(row['Ci.cCoinsurerCde']){
      console.log(totalAmt,"totalAmt")
      opertaor.getTableRefByKey("ciMasterAgreement").setValue("Base.nJiJntAmt", totalAmt.toFixed(2));  //联保总保额
      opertaor.getTableRefByKey("ciMasterAgreement").setValue("Base.nJiJntPrm", totalPrm.toFixed(2)); //联保总保费
      // opertaor.getTableRefByKey("ciMasterAgreement").setValue("Base.nCiJntAmt", totalAmt.toFixed(2));  //共保总保额
      // opertaor.getTableRefByKey("ciMasterAgreement").setValue("Base.nCiJntPrm", totalPrm.toFixed(2));  //共保总保费
      opertaor.getTableRefByKey("ciMasterAgreement").setValue("Base.nCiOwnAmt", totalAmt.toFixed(2));  //我司分额保额
      opertaor.getTableRefByKey("ciMasterAgreement").setValue("Base.nCiOwnPrm", totalPrm.toFixed(2));  //我司份额保费
      // opertaor.getTableRefByKey("ourCompanyCiShare").setValue("Base.nCiOwnAmt", totalAmt.toFixed(2));  //我司分额保额
      // opertaor.getTableRefByKey("ourCompanyCiShare").setValue("Base.nCiOwnPrm", totalPrm.toFixed(2));  //我司份额保费
    }
  });
};
/**
 * 主共保标识、主联保标识、我司标识变化
 */
const onChiefMrkChange = () => {
  const rowData = freeEditRef.value?.getSelectRow();
  const rowId = rowData?._dataId;
  const cCiMrk = opertaor.getTableRefByKey("plyBase").getFromValue();
  if (!rowData || !rowId) return;
  const cCoinsurerCde = rowData["Ci.cCoinsurerCde"];  //获取当前行的联共保公司编码
  const cSubDptCde = rowData["Ci.cSubDptCde"];     //获取当前行的分公司
  const cDptCde = param.cDptCde;   // 获取出单机构编码(cDptCnm:浙江电网销团队)
  let cSelfMrkVal = '0';   // 本公司标识
  let cJiMrkVal = '0';     // 联保标识
  let cChiefMrkVal = '0';  // 共保标识
  const ciMrkValue = cCiMrk["Base.cCiMrk"]; // 获取联共保标识
  if (cCoinsurerCde === "327001") {
    if(rowData["Ci.cDptCde"] === cDptCde){
      cSelfMrkVal = '1';
      switch (ciMrkValue) {
        case "1":
        case "2":
        case "5":
          cJiMrkVal = '1'; // 主联方
          break;
        default:
          cJiMrkVal = '0'; // 从联方
    }
    switch (ciMrkValue) {
      case "3":
      case "1":
        cChiefMrkVal = '1'; // 主共方
        break;
      default:
        cChiefMrkVal = '0'; // 从共方
    }
    }else{
      cChiefMrkVal = '0';
      cJiMrkVal = '0';
      cSelfMrkVal = '0';
    }
    
  } else {
    switch (ciMrkValue) {
      case "2":
      case "4":
        // cChiefMrkVal = '1'; // 主共方（注释掉的代码表示不需要设置）
        break;
      default:
        cChiefMrkVal = '0'; // 从共方
    }
    cJiMrkVal = '2'; // 外部公司
    cSelfMrkVal = '0'; // 非本分公司
  }
    freeEditRef?.value?.setValueByRowKey("Ci.cSelfMrk", rowData._dataId, cSelfMrkVal );
    freeEditRef?.value?.setValueByRowKey("Ci.cJiMrk", rowData._dataId, cJiMrkVal );
    freeEditRef?.value?.setValueByRowKey("Ci.cChiefMrk", rowData._dataId, cChiefMrkVal );
};
// 初始化联共保信息
const initCiInfo = (data: any) => {
  const {cCiMrk} = data;
  const cChiefMrk = ['1', '3', '5'].includes(cCiMrk) ? '1' : '0';
  const dataList = getFromValue();
  if(dataList.length > 0) {
    setFormValue([]);
  }
  nextTick(() => {
    const cSlsId = opertaor.getTableRefByKey('plyBase').getValue('Base.cSlsId')
    const cBrkSlsCde = opertaor.getTableRefByKey('plyBase').getValue('Base.cBrkSlsCde')
    freeEditRef?.value?.addRowByData( {
      'Ci.nSeqNo': 1,
      'Ci.nCiShare': '100.00000000',
      'Ci.nPlyFeeRate': '0.00',
      'Ci.nPlyFee': '0.00',
      'Ci.nComm':'0.00',
      'Ci.cChiefMrk': cChiefMrk,
      'Ci.cIssueMrk': '1',
      'Ci.cCoinsurerCde': '327001',
      "Ci.cSubDptCde": param.dptCde,
      'Ci.cDptCde': param.cDptCde,
      'Ci.cSlsCde': cSlsId,
      'Ci.cBrkSlsCde': cBrkSlsCde,
    });
    valideRequired()
    onChiefMrkChange()
  });
};

//个性化校验封装方法
const valideRequired = ()=>{
  const cBsnsTyp = opertaor.getTableRefByKey('plyBase').getValue('Base.cBsnsTyp')
  const cCiMrkValue =  opertaor.getTableRefByKey("plyBase").getValue("Base.cCiMrk");
  setTimeout(()=>{ 
      const rowItems = getFromValue()
      for(const rowData of rowItems){
        if(cBsnsTyp == '19001'){
              freeEditRef.value?.setRowFieldProp(rowData._dataId, 'Ci.nComm', 'disabled', true)
              freeEditRef.value?.setRowFieldProp(
                rowData._dataId, "Ci.cSlsCde", "rules", [getRules("required", {})]
              );
              freeEditRef.value?.setRowFieldProp(
                rowData._dataId, "Ci.cBrkrCde", "rules", []
              );
              freeEditRef.value?.setRowFieldProp(
                  rowData._dataId, "Ci.cBrkSlsCde", "rules", []
              );
              freeEditRef.value?.setRowFieldProp(
                rowData._dataId, "Ci.cDptCde", "rules", [getRules("required", {})]
              );
          }else if(cBsnsTyp == '19002' || cBsnsTyp == '19003'){
            freeEditRef.value?.setRowFieldProp(rowData._dataId, 'Ci.nComm', 'disabled', false)
            freeEditRef.value?.setRowFieldProp(
                rowData._dataId, "Ci.cBrkrCde", "rules", [getRules("required", {})]
            );
            freeEditRef.value?.setRowFieldProp(
                rowData._dataId, "Ci.cSlsCde", "rules", []
            );
            freeEditRef.value?.setRowFieldProp(
                rowData._dataId, "Ci.cBrkSlsCde", "rules", [getRules("required", {})]
            );
          }
          if(rowData['Ci.cCoinsurerCde'] !=='327001'){
            freeEditRef.value?.setRowFieldProp(
                rowData._dataId, "Ci.cDptCde", "rules", []
            );
            freeEditRef.value?.setRowFieldProp(
                rowData._dataId, "Ci.cDptCde", "disabled", true
            );
            freeEditRef.value?.setRowFieldProp(rowData._dataId,"Ci.cSlsCde","rules",[])
            freeEditRef.value?.setRowFieldProp(rowData._dataId,"Ci.cBrkSlsCde","rules",[])
            freeEditRef.value?.setRowFieldProp(rowData._dataId,"Ci.cBrkrCde","rules",[])
            freeEditRef.value?.setRowFieldProp(
                rowData._dataId, "Ci.cSlsCde", "disabled", true
            );
            freeEditRef.value?.setRowFieldProp(
                rowData._dataId, "Ci.cBrkSlsCde", "disabled", true
            );
            freeEditRef.value?.setRowFieldProp(
                rowData._dataId, "Ci.cBrkrCde", "disabled", true
            );
            const rowItem =  freeEditRef.value?.getRowAllItemRefById(rowData._dataId)
            rowItem['Ci.cSlsCde']['btnItems'].disabled = true;
            rowItem['Ci.cBrkrCde']['btnItems'].disabled = true;
            rowItem['Ci.cBrkSlsCde']['btnItems'].disabled = true;
          }else{
            freeEditRef.value?.setRowFieldProp(
                rowData._dataId, "Ci.cDptCde", "rules", [getRules("required", {})]
            );
            freeEditRef.value?.setRowFieldProp(
                rowData._dataId, "Ci.cDptCde", "disabled", false
            );
            freeEditRef.value?.setRowFieldProp(
                rowData._dataId, "Ci.cSlsCde", "disabled", false
            );
            
            freeEditRef.value?.setRowFieldProp(
                rowData._dataId, "Ci.cBrkSlsCde", "disabled", false
            );
            freeEditRef.value?.setRowFieldProp(
                rowData._dataId, "Ci.cBrkrCde", "disabled", false
            );
            const rowItem =  freeEditRef.value?.getRowAllItemRefById(rowData._dataId)
            rowItem['Ci.cSlsCde']['btnItems'].disabled = false;
            rowItem['Ci.cBrkrCde']['btnItems'].disabled = false;
            rowItem['Ci.cBrkSlsCde']['btnItems'].disabled = false;
          }
          if(rowData['Ci.cIssueMrk'] == '1'){
            freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.nPlyFeeRate", "disabled", true );
          }else{
            freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.nPlyFeeRate", "disabled", false );
          }
          if(param?.cAppTyp == 'A'){ //核保
            const rowItem  =  freeEditRef.value?.getRowAllItemRefById(rowData._dataId)
            rowItem['Ci.cSlsCde']['btnItems'].disabled = true;
            rowItem['Ci.cBrkrCde']['btnItems'].disabled = true;
            rowItem['Ci.cBrkSlsCde']['btnItems'].disabled = true;
          }
          if (param?.pageType === "EDR_APP_NEW_SCENE" && cCiMrkValue !== "0" && cCiMrkValue =='5' && param.cRsnDetailCde.value == "FZ") {
            // formconfig1.editFlag = true;
            formconfig1.fromSchema?.forEach((item) => {
              item.disabled = true;
            });
          }
          if(param?.pageType === "EDR_APP_NEW_SCENE" && cCiMrkValue !== "0" && cCiMrkValue !=='5' && param.cRsnDetailCde.value == "47"){
              const rowItem  =  freeEditRef.value?.getRowAllItemRefById(rowData._dataId)
              if(rowData['Ci.cChiefMrk'] == '1'){
                rowItem['Ci.nCiShare'].disabled = false
              }
              if(rowData['Ci.cChiefMrk'] == '0' && rowData['Ci.cCoinsurerCde'] !== '327001'){
                rowItem['Ci.nCiShare'].disabled = false
                rowItem['Ci.nPlyFeeRate'].disabled = false
                rowItem['Ci.cCoinsurerCde'].disabled = false
              }
              if(rowData['Ci.cChiefMrk'] == '0'){
                rowItem['Ci.nCiShare'].disabled = false
                rowItem['Ci.nPlyFeeRate'].disabled = false
              }
          }
      }
  },500)
}
/**
 * 设置下拉列表
 * @param key
 * @param rowId
 * @param codeListName
 * @param codeListParam
 */
function setOptions(key: string, rowId: string, codeListName: string, codeListParam: any) {
  codeListStore.queryCodeList({
    codeListName: codeListName,
    codeListParam: {...codeListParam},
  }).then((res) => {
    freeEditRef.value?.addCodeListMap({
      code: key + rowId,
      list: res,
    });
  });
}
//更新业务员选中值到联共保业务员
const initcbusiner = (row:any) =>{
  const rowdata = getFromValue();
  if(rowdata.length >0){
    const rowId = rowdata[0]._dataId;
    setValueByRowKey('Ci.cSlsCde',rowId, `${row.cSlsId}${row.cSlsNme}`)
    setValueByRowKey('Ci.cSlsCde',rowId,row.cSlsId)
    setValueByRowKey('Ci.cSlsNme',rowId,row.cSlsNme)
    freeEditRef.value?.addCodeListMap({
      code:'Ci.cSlsCde'+rowId,
      list:row.loadData,
    })
  }
}
//更新代理业务员选中值到联共保代理业务员
const initProxySales = (row:any)=>{
  const rowData = getFromValue()
  console.log("代理业务员",row)
  if(rowData.length>0){
    const rowId = rowData[0]._dataId;
    setValueByRowKey('Ci.cBrkSlsCde',rowId,`${row.cSlsId}${row.CSlsNme}`)
    setValueByRowKey('Ci.cBrkSlsCde',rowId,row.cSlsId)
    setValueByRowKey('Ci.cSlsNme',rowId,row.CSlsNme)
    freeEditRef.value?.addCodeListMap({
      code:'Ci.cBrkSlsCde'+rowId,
      list:row.loadData,
    })
  }
}
//更新代理经纪人选中值到联共保代理经纪人
const intiAgentBroker = (row:any)=>{
  const rowData = getFromValue()
  if(rowData.length>0){
    const rowId = rowData[0]._dataId;
    setValueByRowKey('Ci.cBrkrCde',rowId,`${row.CChaCde}${row.CChaNme}`);
    freeEditRef.value?.addCodeListMap({
      code:'Ci.cBrkrCde'+rowId,
      list:rowData.loadData,
    })
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
  setTimeout(() => {
    const tableValue = getFromValue()
     tableValue.forEach(async elem => {
      if(!!elem["Ci.cSlsCde"] && elem["Ci.cSlsCde"] !== ""){
       const res = await codeListStore.queryCodeList({codeListName: "CSaleCde_List",
                  codeListParam: {
                    CSlsCde: elem['Ci.cSlsCde'],
                  },
                },)
                console.log("保费计算完毕",{
        code:"Ci.cSlsCde"+elem['_dataId'],
        list:res
        })
        freeEditRef.value?.addCodeListMap({
          code:"Ci.cSlsCde"+elem['_dataId'],
          list:res,
        })
      }else if(!!elem['Ci.cBrkSlsCde'] && elem['Ci.cBrkSlsCde'] !==""){
        const cbRes = await codeListStore.queryCodeList(
          {
            codeListName:"AGENCY_BUSINESS_LIST",
            codeListParam:{CDptCde:elem['Ci.cBrkSlsCde']}
          },)
          console.log("保费计算完毕",{
            code:"Ci.cBrkSlsCde"+elem['_dataId'],
            list:cbRes})
        freeEditRef.value?.addCodeListMap({
          code:"Ci.cBrkSlsCde"+elem['_dataId'],
          list:cbRes,
        })
      }else if(!!elem['Ci.cBrkrCde'] && elem['Ci.cBrkrCde'] !==""){
        // const cdeRes = await codeListStore.queryCodeList({codeListName:"AGENCY_BUSINESS_LIST",
        //   codeListParam:{
        //     CDptCde:elem['Ci.cBrkrCde'],
        //   }
        // })
      }
    });
  console.log('保费计算后',tableValue)
    valideRequired()
  }, 300);
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
function getFormconfig(){
  return formconfig1;
}
function addProvide<T>(key: InjectionKey<T> | string, value: T)  {
  freeEditRef?.value?.addProvide(key, value);
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
  initCiInfo,
  initcbusiner,
  initProxySales,
  intiAgentBroker,
  valideRequired,
  addProvide
});
</script>

<style scoped></style>

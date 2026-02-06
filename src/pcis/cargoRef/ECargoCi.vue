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
import { codeListViewStore } from "@/store";
const dialogRef = ref<DialogMethod | null>(null);
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useValidator } from "@/typings/useValidator";
import { number } from "echarts";
import {idxParamKey, useIdxParam} from "@/views/pcis/support/useIdxParam";
const { getRules } = useValidator();

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


const idxParam = inject(idxParamKey, useIdxParam());
const formPage = idxParam?.formPage;
const param = idxParam?.param;
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
const freeEditRef = ref<AppGridEditMethod | null>(null);
const formconfig1 = reactive(createAppGridEditConfig({}));
const initFlag = computed(() => formPage.init);

onMounted(async () => {
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
  formconfig1.fromSchema?.forEach((item:any) => {
    if(item.prop === 'ECargoCi.cCoinsurerCde') {
      item.minWidth = 240
    }
  })
  //一般批改，部分要素可编辑
  const cCiMrkValue = formPage.getFormDataById("AgreementBase")['ECargoBase.cCiMrk'];
  setTimeout(() => {
    if (param.pageType === "EDR_APP_NEW_SCENE" &&   cCiMrkValue !== "0") {
    formconfig1.editFlag = true;
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === 'ECargoCi.cChiefMrk' || item.prop === 'ECargoCi.cIssueMrk') {
        item.disabled = true; // 设置为不可编辑
      } else {
        item.disabled = false; // 其他字段可以编辑
      }
    });
  }
  }, 800);
});

// 绑定方法
const method = {
  addCiRow: () => {
    const dataList = getFormValue();
    const cCiMrkFlag = formPage.getFormDataById("AgreementBase")['ECargoBase.cCiMrk'];
    // const nCiAmt = parseFloat(productStore.nAmt)
    // if(param?.pageType !== "EDR_APP_NEW_SCENE" && nCiAmt =="0"){
    //   ElMessage.warning("总保额为0,请先进行保费计算!");
    //   return;
    // }
    const totalCiShare = dataList.reduce((sum, row) => sum + parseFloat(row['ECargoCi.nCiShare'] || 0), 0);
    // 判断总和是否等于 1
    if (totalCiShare >= 1) {
      ElMessage.warning("共保总保额已被全部分完!不能新增");
      return;
    }
    // 新增行前计算剩余比例
    const remaining = (1 - totalCiShare).toFixed(2);
    const cChiefMrk = ['1', '3','5'].includes(cCiMrkFlag) ? '1' : '0';
    if(dataList.length == 0){
        freeEditRef?.value?.addRowByData({
          'ECargoCi.nSeqNo': dataList.length + 1,
          'ECargoCi.nPlyFeeRate': '0.00',
          'ECargoCi.nPlyFee': '0.00',
          'ECargoCi.nComm': '0.00',
          'ECargoCi.cSlsId':"",
          "ECargoCi.cBrkrCde":"",
          "ECargoCi.cBrkSlsCde":"",
          'ECargoCi.cChiefMrk': '',
          'ECargoCi.cCoinsurerCde': '327001',
          'ECargoCi.cCiSubComp': param.dptCde,
          'ECargoCi.cDptCde': param.cDptCde,
      });
    }else{
      freeEditRef?.value?.addRowByData({
          'ECargoCi.nSeqNo': dataList.length + 1,
          'ECargoCi.nPlyFeeRate': '0.00',
          'ECargoCi.nPlyFee': '0.00',
          'ECargoCi.nComm': '0.00',
          'ECargoCi.cSlsId':"",
          "ECargoCi.cBrkrCde":"",
          "ECargoCi.cBrkSlsCde":"",
          'ECargoCi.cChiefMrk': '',
      });
    }
    valideRequired()
    if(cCiMrkFlag == "2" || cCiMrkFlag == "4"){
      formconfig1.fromSchema?.forEach((item) => {
        if(item.prop == "ECargoCi.nCiPrm"){
          item.disabled = false;
        }
      });
    }
    // 设置新行的 ECargoCi.nCiShare 为剩余比例
    const newRowId = dataList[dataList.length - 1]?._dataId;
    if (newRowId && Number(remaining) > 0) {
      freeEditRef?.value?.setValueByRowKey("ECargoCi.nCiShare", newRowId, remaining);
    }
    updateMasterAgreementValues()
  },
  ciDelete:()=>{
    const selData=freeEditRef?.value?.getSelectRow();
      if (!selData) {
          ElMessage.error("请选择要删除的数据!");
          return;
      }
      const editIndex=selData['_dataId'];
      freeEditRef?.value?.delRow(editIndex);
      const val = getFormValue();
      val.forEach((key,index) => {
          key['ECargoCi.nSeqNo']=index+1
      });
  },
  
  // 共保公司下拉初始化事件 from-init 会自动绑定
  cCoinsurerCdeOnInit: (data: any) => {
    const {value, rowData, config, itemRef} = data;
    console.log("000000",data)
    if(!rowData || !config || !itemRef) return;
    ciJiDptOptionsQuery(value, rowData);
    updateMasterAgreementValues()
  },
    // 共保公司改变事件
  cCoinsurerCdeChange:(val: string, row: any)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const formTableData = getFormValue();
    const plyBasedata = formPage.getComponentRefById("AgreementBase").getFormValue();
    if (!rowData) return;
    const rowId = rowData._dataId;

    freeEditRef?.value?.setValueByRowKey("dptCascader", rowId, []);
    freeEditRef?.value?.setValueByRowKey("ECargoCi.cCiSubComp", rowId, undefined);
    freeEditRef.value?.setValueByRowKey("ECargoCi.cDptCde", rowId, undefined);
    // 联保机构下拉选项查询
    ciJiDptOptionsQuery(val, row);
    if(!initFlag.value){
      if (plyBasedata["ECargoBase.cCiMrk"] === "5" && val !== "327001") {
        if(val !=''){
          freeEditRef?.value?.setValueByRowKey("ECargoCi.cCoinsurerCde", rowId, "");
          ElMessage.error("司内联保，不能录入除永安以外的其他公司！");
        }
        return false;
      }
      freeEditRef?.value?.setValueByRowKey("ECargoCi.cCiSubComp", rowId, "");
      if(plyBasedata["ECargoBase.cBsnsTyp"] === '19001'){
        freeEditRef.value?.setRowFieldProp(
                rowData._dataId, "ECargoCi.cDptCde", "rules", [getRules("required", {})]
        );
      }
    }
    if (val === "327001" && (plyBasedata["ECargoBase.cCiMrk"] === "3" || plyBasedata["ECargoBase.cCiMrk"] === "4")) {
      const isYonganAlreadyPresent = formTableData.some(
          (row) => row._dataId !== rowId && row['ECargoCi.cCoinsurerCde'] === "327001"
      );
      if (isYonganAlreadyPresent) {
        ElMessage.error('主（从）共无联保，我司只能录入一次！');
        freeEditRef.value?.setValueByRowKey("ECargoCi.cCoinsurerCde", rowId, "");
        return;
      }
    }
    const allRowTable = getFormValue();
      const isDouble = allRowTable.some((row: any) => {
        return row._dataId !== rowId &&
            row["ECargoCi.cCoinsurerCde"] === rowData["ECargoCi.cCoinsurerCde"] && 
            row["ECargoCi.cCoinsurerCde"] !=='327001'
      });
      if(isDouble)
      {
        ElMessage.error("已经存在相同的共保公司！");
        freeEditRef.value?.setValueByRowKey("ECargoCi.cCoinsurerCde", rowId, "");
        return;
      }  
    valideRequired();
    updateMasterAgreementValues()
  },
    //联保机构、出单机构 级联组件懒加载方法
  dptCascaderLazyLoad: (node: any, resolve: Function, row: any) => {
    const { level, value} = node;
    if(!!value && value !== ""){
      codeListStore.queryCodeList({
        codeListName: "CDptCde_List",
        codeListParam: { "CDptCde": value },
      }).then((res) => {
        const list = res.map((e: any) => {
          e.leaf = level === 1;
          return e;
        });
        resolve(list)
      });
    }else {
      resolve(false)
    }
  },
  // 联保机构、出单机构 级联选择change事件
  dptCascaderChange: (value: any[], rowData: any) => {
    const rowId = rowData._dataId;
    const oldSubDptCde = rowData["ECargoCi.cCiSubComp"]; // 原始分公司代码
    const oldDptCde = rowData["ECargoCi.cDptCde"];
    if(value && value.length > 0){
      const subDptCde = value[0]; // 分公司代码
      const dptCde = value[1]; // 出单机构代码
      freeEditRef.value?.setValueByRowKey("ECargoCi.cCiSubComp", rowId, subDptCde);
      freeEditRef.value?.setValueByRowKey("ECargoCi.cDptCde", rowId, dptCde);
      // 校验
      onChiefMrkChange();
      // 获取所有行数据
      const allRows = getFormValue();
      // 校验是否存在重复的 ECargoCi.cCoinsurerCde, ECargoCi.cCiSubComp, ECargoCi.cDptCde 组合
      const isDuplicate = allRows.some((row: any) => {
        // 排除当前行自身
        return row._dataId !== rowId &&
            row["ECargoCi.cCoinsurerCde"] === rowData["ECargoCi.cCoinsurerCde"] &&
            row["ECargoCi.cCiSubComp"] === rowData["ECargoCi.cCiSubComp"] &&
            row["ECargoCi.cDptCde"] === dptCde;
      });
      if (isDuplicate) {
        ElMessage.error("已经存在相同的共保公司、分公司和出单机构组合！");
        // 回退当前行的出单机构值
        freeEditRef?.value?.setValueByRowKey("ECargoCi.cDptCde", rowId, "");
        freeEditRef?.value?.setValueByRowKey("dptCascader", rowId, []);
        return;
      }
      } else {
        freeEditRef.value?.setValueByRowKey("ECargoCi.cCiSubComp", rowId, undefined);
        freeEditRef.value?.setValueByRowKey("ECargoCi.cDptCde", rowId, undefined);
      }
        
    // 如果级联选择器的值发生变化（分公司或出单机构任意一个发生变化），则清空当前行的业务员信息
    if(!initFlag.value){
      if (oldSubDptCde !== value?.[0] || oldDptCde !== value?.[1]) {
        // 清空业务员相关信息
        freeEditRef?.value?.setValueByRowKey("ECargoCi.cSlsId", rowId, "");
        freeEditRef?.value?.setValueByRowKey("ECargoCi.cSlsNme", rowId, "");
        freeEditRef?.value?.setValueByRowKey("ECargoCi.cBrkrCde", rowId, "");
        freeEditRef?.value?.setValueByRowKey("ECargoCi.cBrkSlsCde", rowId, "");
        // 重新校验必填规则
        valideRequired();
      }
    }
  },
    dptCascaderOnInit: (data: any) =>{
    const {value, rowData, config, itemRef} = data;
    if(!rowData || !config || !itemRef) return;
  },
  cContactTypChange:(val: any)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData._dataId;
    freeEditRef.value?.setRowFieldProp(
      rowId,
      "ECargoCi.cContactTyp",
      "rules",
      [getRules("phoneNo", {})]
    );
  },

  // 分公司下拉初始化事件 from-init 会自动绑定
  cSubDptCdeOnInit: (data: any) => {
    const {value, rowData, config, itemRef} = data;
    if(!rowData || !config || !itemRef) return;
    const rowId = rowData._dataId;
    if(value !=""){
      codeListStore
          .queryCodeList({
            codeListName: "CDptCde_List",
            codeListParam: { "CDptCde": value },
          })
          .then((res) => {
            freeEditRef.value?.setRowFieldProp(
                rowId,
                "ECargoCi.cDptCde",
                "loadData",
                res,
            );
          });
    }
  },
  //分公司下拉事件
  cSubDptCdeChange:(val)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    if (!rowData || !initFlag.value) return;
    const rowId = rowData._dataId;
    if(val !=""){
      codeListStore
        .queryCodeList({
          codeListName: "CDptCde_List",
          codeListParam: { "CDptCde": val },
        })
        .then((res) => {
          freeEditRef?.value?.setValueByRowKey("ECargoCi.cDptCde", rowId, "");
          freeEditRef.value?.setRowFieldProp(
            rowId,
            "ECargoCi.cDptCde",
            "loadData",
            res,
          );
        });
    }
    onChiefMrkChange()
  },
  //出单标志下拉事件
  clssueMrkChange: (val) => {
    //否0,是1
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData?._dataId;
    const cCiMrk = formPage.getFormDataById("AgreementBase")['ECargoBase.cCiMrk'];
    // const cCiMrk = opertaor.getTableRefByKey("ECargoBase").getFromValue()
    if (!rowData || !rowId) return;
    // 获取所有行数据
    const allRows = getFormValue();
    // 检查是否已有其他行的 cIssueMrk 是 1
    const existingIssueMrk = allRows.some(
      (row) => row._dataId !== rowId && row["ECargoCi.cIssueMrk"] === "1"
    );
    if (val === "1" && existingIssueMrk) {
      ElMessage.error("出单方有且只能有一个！");
      freeEditRef?.value?.setValueByRowKey("ECargoCi.cIssueMrk", rowId, "");
      return;
    }
    // 根据不同的联共保类型进行校验
    if (val === "1") {
      // 选择"是"时的校验 - 出单方必须是主联单的分公司
      if ((cCiMrk == '1' || cCiMrk == '5')
        && rowData['ECargoCi.cDptCde'] !== param.cDptCde) {
        ElMessage.error("联保单出单方必须是主联单的分公司！");
        freeEditRef?.value?.setValueByRowKey("ECargoCi.cIssueMrk", rowId, "");
        return;
      }
    } else if (val === "0") {
      // 选择"否"时的校验 - 联保单出单方必须是主联单的分公司
      if ((cCiMrk == '5' || cCiMrk == '3' || cCiMrk === '1')
        && rowData['ECargoCi.cDptCde'] == param.cDptCde) {
        ElMessage.error("联保单出单方必须是主联单的分公司！");
        freeEditRef?.value?.setValueByRowKey("ECargoCi.cIssueMrk", rowId, "");
        return;
      }
    }
    allRows.forEach((item: any) => {
      const rowItem = freeEditRef.value?.getRowAllItemRefById(item._dataId)
      if (item['ECargoCi.cIssueMrk'] == '1') {
        rowItem['ECargoCi.nPlyFeeRate'].disabled = true
        freeEditRef?.value?.setValueByRowKey("ECargoCi.nPlyFeeRate", rowId, "0.00");
      } else {
        rowItem['ECargoCi.nPlyFeeRate'].disabled = false
      }
    })
  },
  //主共标志下拉事件
  cChiefMrkChange:(val)=>{
    //否0,1是
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData?._dataId;
    const cCiMrk = formPage.getFormDataById("AgreementBase")['ECargoBase.cCiMrk'];
    if (!rowData || !rowId) return;
    const cCoinsurerCde = rowData["ECargoCi.cCoinsurerCde"];
    // 我方主共或从共的情况
    if (cCiMrk === '1' || cCiMrk === '3') {
      // 情况1：如果选中的是“是”且是永安保险(327001)
      if (rowData && val === "0" && cCoinsurerCde === "327001") {
        // ElMessage.error("我方从共时主共保方不能是我司！");
        ElMessage.error("我方主共时主共保方必须是我司！");
        freeEditRef?.value?.setValueByRowKey("ECargoCi.cChiefMrk", rowId, "");
        return;
      }
      // 情况2：检查是否已有其他行的主共标志为“是”
      const allRows = getFormValue();
      const existingChief = allRows.some(
        (row) => row._dataId !== rowId && row["ECargoCi.cChiefMrk"] === "1"
      );
      if (val === "1" && existingChief) {
        ElMessage.error("主共方只能有一个！");
        freeEditRef?.value?.setValueByRowKey("ECargoCi.cChiefMrk", rowId, "");
        return;
      }
    }
    // 我方从共时，主共保方必须是我司
    if (cCiMrk["ECargoBase.cCiMrk"] === '2' || cCiMrk["ECargoBase.cCiMrk"] === '4') {
      if (val === "1" && cCoinsurerCde !== "327001") {
        ElMessage.error("我方从共时主共保方不能是我司！");
        // ElMessage.error("我方主共时主共保方必须是我司！");
        freeEditRef?.value?.setValueByRowKey("ECargoCi.cChiefMrk", rowId, "");
        return;
      }
    }
  },
  //联共保比例
  nCiShareChange:(val)=>{
    const rowDatas = freeEditRef.value?.getSelectRow();
    const rowId = rowDatas?._dataId;
    // 校验输入是否合法
    if (val > 1 || val <= 0) {
      ElMessage.warning("联共保比例必须大于0且不能超过1");
      freeEditRef?.value?.setValueByRowKey("ECargoCi.nCiShare", rowId, parseFloat('1').toFixed(8));
      return;
    }
    // 计算当前所有行的总和（排除当前行）
    const allRows = getFormValue();
    const totalOther = allRows
      .filter(row => row._dataId !== rowId)
      .reduce((sum, row) => sum + parseFloat(row["ECargoCi.nCiShare"] || 0), 0);
    // 如果当前值 + 其他行 >= 1，则限制当前行最大值为 1 - 其他行总和
    if (parseFloat(val) + totalOther > 1) {
      const maxVal = (1 - totalOther).toFixed(8);
      freeEditRef?.value?.setValueByRowKey("ECargoCi.nCiShare", rowId, maxVal);
      return;
    }
    const cCiMrk = formPage.getFormDataById("AgreementBase")['ECargoBase.cCiMrk'];
    updateMasterAgreementValues();
  },
  //出单费比例
  nPlyFeeRateChange:(val)=>{
    const rowDatas = freeEditRef.value?.getSelectRow();
    const nPlyFee = val * rowDatas["ECargoCi.nCiPrm"]
    freeEditRef?.value?.setValueByRowKey("ECargoCi.nPlyFee",rowDatas._dataId,nPlyFee.toFixed(2))
  },
  //开户行大类改变
  cBankRelTypChange:(val)=>{
    const rowDatas = freeEditRef.value?.getSelectRow();
    freeEditRef.value?.setValueByRowKey("ECargoCi.cBankAddr",rowDatas._dataId,val)
  },
  //开户行省改变
  cProvinceChange:(val)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData._dataId;
    freeEditRef?.value?.setValueByRowKey("ECargoCi.cBankArea",rowId,"")
    freeEditRef.value?.setRowFieldProp(rowId,"ECargoCi.cBankArea","loadData",[],);
    codeListStore
        .queryCodeList({
          codeListName: "CBankAreaList",
          codeListParam: { "areaprovince": val },
        })
        .then((res) => {
          freeEditRef.value?.setRowFieldProp(
            rowId,
            "ECargoCi.cBankArea",
            "loadData",
            res,
          );
        });
  },
  //开户行市改变
  cCityChange:(val)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData._dataId;
    freeEditRef?.value?.setValueByRowKey("ECargoCi.cCountryCde",rowId,"")
    codeListStore
        .queryCodeList({
          codeListName: "CBankCountyList",
          codeListParam: { "areaprovince": rowData['ECargoCi.cBankArea'],"areaname":val },
        })
        .then((res) => {
          freeEditRef.value?.setRowFieldProp(
            rowId,
            "ECargoCi.cBankCounty",
            "loadData",
            res,
          );
        });
  },
  //开户行县改变
  cCountyChange:(val) => { 
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData._dataId;
    freeEditRef?.value?.setValueByRowKey("ECargoCi.cBankCde",rowId,"")
    codeListStore
        .queryCodeList({
          codeListName: "CBankCountyList",
          codeListParam: { "areaprovince": rowData['ECargoCi.cBankCounty'],"areaname":val },
        })
        .then((res) => {
          freeEditRef.value?.setRowFieldProp(
            rowId,
            "ECargoCi.cBankCde",
            "loadData",
            res,
          );
        });
  },
  //代理/经纪人
  cBrkrCdeChange:()=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData?._dataId;
    console.log("rowData", rowData);
    dialogRef.value?.open(
      "eCargociagentPer",
      {
        type: "show",
        data: {
          rowData: rowData,
        },
        method: {
          getSelected: (params) => {
            freeEditRef.value?.setRowFieldProp(rowId, "ECargoCi.cBrkrCde", "loadData", [{ label: `${params.CChaCde}${params.CChaNme}`, value: params.CChaCde }])
            setValueByRowKey("ECargoCi.cBrkrCde", rowId, params.CChaCde)
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
  //业务员
  cSlsCdeChange:()=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData?._dataId;
    dialogRef.value?.open(
      "eCargociagentWorker",
      {
        type: "show",
        data: {
          rowData: rowData,
        },
        method: {
          getSelected: (params) => {
            freeEditRef.value?.setRowFieldProp(rowId, "ECargoCi.cSlsId", "loadData", [{ label: `${params.CSlsCde}${params.CSlsNme}`, value: params.CSlsCde }])
            freeEditRef?.value?.setValueByRowKey("ECargoCi.cSlsId", rowId, params.CSlsCde);
            freeEditRef?.value?.setValueByRowKey("ECargoCi.cSlsNme", rowId, params.CSlsNme);
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
  //代理业务员
  cBrkSlsCdeChange:()=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData?._dataId;
    dialogRef.value?.open(
      "eCargociagentWorker",
      {
        type: "show",
        data: {
          rowData: rowData,
        },
        method: {
          getSelected: (params) => {
            freeEditRef.value?.setRowFieldProp(rowId, "ECargoCi.cBrkSlsCde", "loadData", [{ label: `${params.CSlsCde}${params.CSlsNme}`, value: params.CSlsCde }])
            freeEditRef?.value?.setValueByRowKey("ECargoCi.cBrkSlsCde", rowId, params.CSlsCde);
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
  const allRows = getFormValue(); // 获取所有行数据
  let totalAmt = 0;
  let totalPrm = 0;
  const nRecRemPrms =ref(0);
  // 遍历所有行，只处理 ECargoCi.cCoinsurerCde === "327001" 的行
  const res = formPage.getFormDataById("AgreementFeeWarn");
  const agreementBaseData = formPage.getComponentRefById("AgreementCiTcp")
  formPage.getComponentRefById("AgreementCiTcp").setValue("ECargoBase.cCiAgtNo", res["ECargoBase.cCiAgtNo"]);
  formPage.getComponentRefById("AgreementCiTcp").setValue("ECargoBase.nCiJntAmt", res["ECargoBase.nAmt"]);  //共保预估总保额
  formPage.getComponentRefById("AgreementCiTcp").setValue("ECargoBase.nCiJntPrm", res["ECargoBase.nPrm"]);
  allRows.forEach(row => {
    if (row["ECargoCi.cCoinsurerCde"] === "327001") {
      const share = Number(row["ECargoCi.nCiShare"]) || 0;
      const nAmt = res["ECargoBase.nAmt"] ? Number(res["ECargoBase.nAmt"]) : 0;
      const nPrm = res["ECargoBase.nPrm"] ? Number(res["ECargoBase.nPrm"]) : 0;
      const ciAmt = share * nAmt;
      const ciPrm = share * nPrm;
      // 更新当前行的 ECargoCi.nCiAmt 和 ECargoCi.nCiPrm
      freeEditRef?.value?.setValueByRowKey("ECargoCi.nCiAmt", row._dataId, ciAmt.toFixed(2));
      freeEditRef?.value?.setValueByRowKey("ECargoCi.nCiPrm", row._dataId, ciPrm.toFixed(2));
      // 累加到总和
      totalAmt += ciAmt;
      totalPrm += ciPrm;
      formPage.getComponentRefById("AgreementCiTcp").setValue("ECargoBase.nJiJntAmt", totalAmt.toFixed(2));  //联保总保额
      formPage.getComponentRefById("AgreementCiTcp").setValue("ECargoBase.nJiJntPrm", totalPrm.toFixed(2)); //联保总保费
      // nRecRemPrms = share* Number(res["ECargoBase.nReceivedPrm"] || '0')
      formPage.getComponentRefById("AgreementFeeWarn").setValue("ECargoBase.nCiOwnRmbReceivedPrm",share* Number(res["ECargoBase.nReceivedPrm"] || '0'))
      // formPage.getComponentRefById("AgreementFeeWarn").setValue("ECargoBase.nCiOwnRmbReceivedPrm",ciPrm)  //我司协议预收保费
      // const diffSub = ciPrm - res["ECargoBase.nWhRmbPrm"]
      // formPage.getComponentRefById("AgreementFeeWarn").setValue("ECargoBase.nRecRemPrm",diffSub)
      // ECargoBase.nWhRmbPrm //折人民币预扣保费
      // ECargoBase.nRecRemPrm  //协议剩余预收保费（人民币）
    }else{
      // 非永安保险公司：仅更新该行的 ECargoCi.nCiAmt 和 ECargoCi.nCiPrm，不参与总和计算
      const share = Number(row["ECargoCi.nCiShare"]) || 0;
      const nAmt = res["ECargoBase.nAmt"] ? Number(res["ECargoBase.nAmt"]) : 0;
      const nPrm = res["ECargoBase.nPrm"] ? Number(res["ECargoBase.nPrm"]) : 0;

      const ciAmt = share * nAmt;
      const ciPrm = share * nPrm;

      // 更新当前行的 ECargoCi.nCiAmt 和 ECargoCi.nCiPrm
      freeEditRef?.value?.setValueByRowKey("ECargoCi.nCiAmt", row._dataId, ciAmt.toFixed(2));
      freeEditRef?.value?.setValueByRowKey("ECargoCi.nCiPrm", row._dataId, ciPrm.toFixed(2));
    }
  });
  nextTick(()=>{
    const nAmtRmbExch = Number(res["ECargoBase.nAmtRmbExch"]) || 0;
    formPage.getComponentRefById("AgreementFeeWarn").setValue("ECargoBase.nCiOwnRmbPrm", (totalPrm * nAmtRmbExch).toFixed(2));
    formPage.getComponentRefById("AgreementFeeWarn").setValue("ECargoBase.nCiOwnRmbAmt", (totalAmt * nAmtRmbExch).toFixed(2));
    const resData = formPage.getFormDataById("AgreementFeeWarn")
    if(res['ECargoBase.cPayWay'] == '01'){ //YY
      //主共保：折人民币协议预收保费-折人民币预扣保费=协议剩余预收保费（人民币）
      if(Number(resData["ECargoBase.nReceivedPrm"] || '0') > Number(resData["ECargoBase.nPrm"] || '0')){
        const nRecRemPrm = Number((resData["ECargoBase.nRmbReceivedPrm"] || "0")) - Number((res["ECargoBase.nWhRmbPrm"] || '0'))
        formPage.getComponentRefById("AgreementFeeWarn").setValue("ECargoBase.nRecRemPrm",nRecRemPrm)
      }
      const nRecRemEstAmt = Number(resData["ECargoBase.nRmbAmt"] || '0')  - Number(resData["ECargoBase.nWhRmbAmt"] || '0') 
      formPage.getComponentRefById("AgreementFeeWarn").setValue("ECargoBase.nRecRemEstAmt",nRecRemEstAmt)
      //从共保：折人民币预收保费-折人民币预扣保费=折人民币剩余预收保费
      const nRecRemPrm = Number((resData["ECargoBase.nRmbReceivedPrm"] || "0")) - Number((res["ECargoBase.nWhRmbPrm"] || '0'))
      formPage.getComponentRefById("AgreementFeeWarn").setValue("ECargoBase.nRecRemPrm",nRecRemPrm)
      //折人民币我司预估保额-折人民币预扣保额=协议剩余实收(预估)保额（人民币）
      // if(Number(res["ECargoBase.nRecRemPrm"] || '0') > Number(res["ECargoBase.nCiOwnRmbPrm"] ||'0')){
      const nRecRemEstAmts = Number(res["ECargoBase.nCiOwnRmbAmt"] || '0')- Number(res["ECargoBase.nWhRmbAmt"] || '0')
      formPage.getComponentRefById("AgreementFeeWarn").setValue("ECargoBase.nRecRemEstAmt",nRecRemEstAmts);
      // formPage.getComponentRefById("AgreementFeeWarn").setValue("ECargoBase.nCiOwnRmbReceivedPrm",nRecRemPrms)  //我司协议预收保费
      const nRecRemPrms = formPage.getComponentRefById("AgreementFeeWarn").getValue("ECargoBase.nCiOwnRmbReceivedPrm")
      if(nRecRemPrms !=''|| nRecRemPrms != null || nRecRemPrms != undefined || nRecRemPrms != 0){
        const diffSub = nRecRemPrms -Number((res["ECargoBase.nWhRmbPrm"] || '0'))
        formPage.getComponentRefById("AgreementFeeWarn").setValue("ECargoBase.nRecRemPrm",diffSub)
      }
      // }
    }else{
      //主共保：
      //折人民币预估保费-折人民币预扣保费=协议剩余预收保费（人民币）
      const nRecRemPrm = Number(resData["ECargoBase.nRmbPrm"] || '0') - Number(resData["ECargoBase.nWhRmbPrm"])
      formPage.getComponentRefById("AgreementFeeWarn").setValue("ECargoBase.nRecRemPrm",nRecRemPrm)
      //折人民币预估保额-折人民币预扣保额=协议剩余实收(预估)保额（人民币）
      const nRecRemEstAmt = Number(resData["ECargoBase.nRmbAmt"] || '0') - Number(res["ECargoBase.nWhRmbAmt"] || '0')
      formPage.getComponentRefById("AgreementFeeWarn").setValue("ECargoBase.nRecRemEstAmt",nRecRemEstAmt)
      //从共保
      //折人民币我司预估保费-折人民币预扣保费=协议剩余预收保费（人民币）折人民币
      const nRecRemPrms = Number(resData["ECargoBase.nCiOwnRmbPrm"] || "0") - Number(resData["ECargoBase.nWhRmbPrm"] || '0')
      formPage.getComponentRefById("AgreementFeeWarn").setValue("ECargoBase.nRecRemPrm",nRecRemPrms)
      //折人民币我司预估保额-折人民币预扣保额=协议剩余实收(预估)保额（人民币）
      const nRecRemEstAmts = Number(resData["ECargoBase.nCiOwnRmbAmt"] || "0") - Number(res["ECargoBase.nWhRmbAmt"] || '0')
      formPage.getComponentRefById("AgreementFeeWarn").setValue("ECargoBase.nRecRemEstAmt",nRecRemEstAmts)
    }
  })
  // 设置到对应组件字段（仅使用永安保险的总和）
  allRows.forEach((row) => {
    if(row['ECargoCi.cCoinsurerCde']){
      console.log(totalAmt,"totalAmt")
      formPage.getComponentRefById("AgreementCiTcp").setValue("ECargoBase.nJiJntAmt", totalAmt.toFixed(2));  //联保总保额
      formPage.getComponentRefById("AgreementCiTcp").setValue("ECargoBase.nJiJntPrm", totalPrm.toFixed(2)); //联保总保费
      formPage.getComponentRefById("AgreementCiTcp").setValue("ECargoBase.nCiOwnAmt", totalAmt.toFixed(2));  //我司分额保额
      formPage.getComponentRefById("AgreementCiTcp").setValue("ECargoBase.nCiOwnPrm", totalPrm.toFixed(2));  //我司份额保费
    }
  });
};
/**
 * 主共保标识、主联保标识、我司标识变化
 */
const onChiefMrkChange = () => {
  const rowData = freeEditRef.value?.getSelectRow();
  const rowId = rowData?._dataId;
  const cCiMrk =  formPage.getComponentRefById("AgreementBase").getFormValue();
  // const aa = 
  if (!rowData || !rowId) return;
  const cCoinsurerCde = rowData["ECargoCi.cCoinsurerCde"];  //获取当前行的联共保公司编码
  const cSubDptCde = rowData["ECargoCi.cSubDptCde"];     //获取当前行的分公司
  const cDptCde = param.cDptCde;   // 获取出单机构编码(cDptCnm:浙江电网销团队)
  let cSelfMrkVal = '0';
  let cJiMrkVal = '0';
  let cChiefMrkVal = '0';
  const ciMrkValue = cCiMrk["ECargoBase.cCiMrk"]; // 获取联共保标识
  if (cCoinsurerCde === "327001") {
    if (rowData["ECargoCi.cDptCde"] === cDptCde) {
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
    } else {
      cChiefMrkVal = '0'; // 非本分公司
      cJiMrkVal = '0';    // 从联方
      cSelfMrkVal = '0';  // 从共方
    }
  } else{
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
  
  freeEditRef?.value?.setValueByRowKey("ECargoCi.cSelfMrk", rowData._dataId, cSelfMrkVal );
  freeEditRef?.value?.setValueByRowKey("ECargoCi.cJiMrk", rowData._dataId, cJiMrkVal );
  freeEditRef?.value?.setValueByRowKey("ECargoCi.cChiefMrk", rowData._dataId, cChiefMrkVal );
};
// 初始化联共保信息
const initCiInfo = (data: any) => {
  const {cCiMrk} = data;
  const cChiefMrk = ['1', '3','5'].includes(cCiMrk) ? '1' : '0';
  const dataList = getFormValue();
  if(dataList.length > 0) {
    setFormValue([]);
  }
  nextTick(() => {
    // const plyBase = formPage.getDataAll()['ECargoBase'];
    const plyBase = formPage.getFormDataById("AgreementBase");
    const cSlsId = plyBase['ECargoBase.cSlsId'];
    const cBrkSlsCde = plyBase['ECargoBase.cBrkSlsCde'];
    const cBrkrCde = plyBase['ECargoBase.cBrkrCde'];
    // 联保机构、出单机构 转 级联组件初始化
    const dptList = [];
    if(param['dptCde']) {
      dptList.push(param['dptCde']);
      if(param['cDptCde']) {
        dptList.push(param['cDptCde']);
      }
    }
    freeEditRef?.value?.addRowByData( {
      'ECargoCi.nSeqNo': 1,
      'ECargoCi.nCiShare': '1',
      'ECargoCi.nPlyFeeRate': '0.00',
      'ECargoCi.nPlyFee': '0.00',
      'ECargoCi.nComm':'0.00',
      'ECargoCi.cChiefMrk': cChiefMrk,
      'ECargoCi.cIssueMrk': '1',
      'ECargoCi.cCoinsurerCde': '327001',
      "ECargoCi.cCiSubComp": param.dptCde,
      'ECargoCi.cDptCde': param.cDptCde,
      'ECargoCi.cBrkrCde': cBrkrCde,
      'ECargoCi.cSlsId': cSlsId,
      'ECargoCi.cBrkSlsCde': cBrkSlsCde,
      'dptCascader' : dptList,
    });
    // 联保机构下拉选项查询
    ciJiDptOptionsQuery('327001', getFormValue()[0]);
    // 业务员加载
    slsCodeListLoad(getFormValue()[0]);
    onChiefMrkChange();
  });
};
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
  const rowdata = getFormValue();
  if(rowdata.length >0){
    const rowId = rowdata[0]._dataId;
    setValueByRowKey('ECargoCi.cSlsId',rowId,row.cSlsId)
    setValueByRowKey('ECargoCi.cSlsNme',rowId,row.cSlsNme)
    freeEditRef.value?.addCodeListMap({
      code:'ECargoCi.cSlsId'+rowId,
      list:row.loadData,
    })
  }
}
//更新代理业务员选中值到联共保代理业务员
const initProxySales = (row:any)=>{
  const rowData = getFormValue()
  console.log("代理业务员",row)
  if(rowData.length>0){
    const rowId = rowData[0]._dataId;
    setValueByRowKey('ECargoCi.cBrkSlsCde',rowId,row.cSlsId)
    freeEditRef.value?.addCodeListMap({
      code:'ECargoCi.cBrkSlsCde'+rowId,
      list: row.loadData,
    })
  }
}
//更新代理经纪人选中值到联共保代理经纪人
const intiAgentBroker = (row:any)=>{
  const rowData = getFormValue()
  if(rowData.length>0){
    const rowId = rowData[0]._dataId;
    setValueByRowKey('ECargoCi.cBrkrCde',rowId,row.CChaCde);
    freeEditRef.value?.addCodeListMap({
      code:'ECargoCi.cBrkrCde'+rowId,
      list:rowData.loadData,
    })
  }
};
/**
 * 代理业务员、代理经纪人 下拉值加载
 * @param row
 */
const slsCodeListLoad = (row: any) => {
  const rowId = row['_dataId'];
  const cSlsId = row['ECargoCi.cSlsId'];
  const cBrkSlsCde = row['ECargoCi.cBrkSlsCde'];
  const cBrkrCde = row['ECargoCi.cBrkrCde'];
  if(!!cSlsId && cSlsId !== ""){
    setOptions("ECargoCi.cSlsId", rowId, "CSaleCde_List", {CSlsCde: cSlsId});
  }
  if(!!cBrkSlsCde && cBrkSlsCde !==""){
    setOptions("ECargoCi.cBrkSlsCde", rowId, "WEB_ORG_SALES_BY_ID", {value: cBrkSlsCde});
  }
  if(!!cBrkrCde && cBrkrCde !==""){
    setOptions("ECargoCi.cBrkrCde", rowId, "WEB_CUS_CHA_BY_ID", {value: cBrkrCde});
  }
};
// 联保机构下拉查询
const ciJiDptOptionsQuery = async (val: string, row: any) => {
  const rowId = row._dataId;
  valideRequired()
  if (val === "327001") {
    // 如果选择的是永安保险，加载对应的分公司列表
    const list = await codeListStore.queryCodeList({
      codeListName: "Comm_Code_LIST",
      codeListParam: { "CParCde": "subdpt", cParCde: "327001" },
    });
    freeEditRef.value?.addCodeListMap({code: "dptCascader"+rowId, list: list});
  } else {
    // 非永安保险，设置默认值和其他数据
    const list = await codeListStore.queryCodeList({
      // codeListName: "CDptJointCde_List",
      codeListName: "66",
      codeListParam: {},
    });
    freeEditRef.value?.addCodeListMap(
        {code: "dptCascader"+rowId,
          list: list.map((item:any) => (
              {
                label: item.c_cnm, value: item.c_cde, leaf: true
              }
          ))
        }
    );
  }
  return true;
};
//个性化校验封装方法
const valideRequired = () => {
  const cBsnsTyp = formPage.getFormDataById('AgreementBase')['ECargoBase.cBsnsTyp']
  const cCiMrkValue = formPage.getFormDataById("AgreementBase")['ECargoBase.cCiMrk'];
  nextTick(() => {
    setTimeout(() => {
      const rowItems = getFormValue()
      for (const rowData of rowItems) {
        // 处理业务类型为19001（直销业务）的情况
        if (cBsnsTyp == '19001') {
          // freeEditRef.value?.setRowFieldProp(rowData._dataId, 'ECargoCi.nComm', 'disabled', true)
          // 直销业务：业务员必填
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "ECargoCi.cSlsId", "rules", [getRules("required", {})]
          );
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "ECargoCi.cSlsId", "disabled", false
          );
          // 直销业务：代理经纪人和代理业务员非必填且禁用
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "ECargoCi.cBrkrCde", "rules", []
          );
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "ECargoCi.cBrkSlsCde", "rules", []
          );
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "ECargoCi.cBrkrCde", "disabled", true
          );
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "ECargoCi.cBrkSlsCde", "disabled", true
          );
          const rowItem = freeEditRef.value?.getRowAllItemRefById(rowData._dataId)
          if (rowItem) {
            rowItem['ECargoCi.cBrkrCde']['btnItems'].disabled = true;
            rowItem['ECargoCi.cBrkSlsCde']['btnItems'].disabled = true;
          }
        }
        // 处理非直销业务（19002或19003）的情况
        else if (cBsnsTyp == '19002' || cBsnsTyp == '19003') {
          // freeEditRef.value?.setRowFieldProp(rowData._dataId, 'ECargoCi.nComm', 'disabled', true)
          // 非直销业务：代理经纪人和代理业务员必填
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "ECargoCi.cBrkrCde", "rules", [getRules("required", {})]
          );
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "ECargoCi.cBrkSlsCde", "rules", [getRules("required", {})]
          );
          // 非直销业务：业务员非必填且禁用
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "ECargoCi.cSlsId", "rules", []
          );
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "ECargoCi.cSlsId", "disabled", true
          );
          const rowItem = freeEditRef.value?.getRowAllItemRefById(rowData._dataId)
          if (rowItem) {
            rowItem['ECargoCi.cSlsId']['btnItems'].disabled = true;
          }
        }

        // 处理共保公司非永安（327001）的情况
        if (rowData['ECargoCi.cCoinsurerCde'] !== '327001') {
          // 业务员、代理业务员、代理经纪人都禁用且非必填
          freeEditRef.value?.setRowFieldProp(rowData._dataId, "ECargoCi.cSlsId", "rules", [])
          freeEditRef.value?.setRowFieldProp(rowData._dataId, "ECargoCi.cBrkSlsCde", "rules", [])
          freeEditRef.value?.setRowFieldProp(rowData._dataId, "ECargoCi.cBrkrCde", "rules", [])
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "ECargoCi.cSlsId", "disabled", true
          );
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "ECargoCi.cBrkSlsCde", "disabled", true
          );
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "ECargoCi.cBrkrCde", "disabled", true
          );

          // 出单机构非必填且禁用
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "ECargoCi.cDptCde", "rules", []
          );
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "ECargoCi.cDptCde", "disabled", true
          );
          freeEditRef.value?.setRowFieldProp(rowData._dataId, "ECargoCi.cPolicyNo", "disabled", false)
          const rowItem = freeEditRef.value?.getRowAllItemRefById(rowData._dataId)
          if (rowItem) {
            rowItem['ECargoCi.cSlsId']['btnItems'].disabled = true;
            rowItem['ECargoCi.cBrkrCde']['btnItems'].disabled = true;
            rowItem['ECargoCi.cBrkSlsCde']['btnItems'].disabled = true;
          }
        }
        // 处理共保公司为永安（327001）的情况
        else {
          // 只有在共保公司为永安时，才根据业务类型设置不同的规则
          if (cBsnsTyp == '19001') {
            // 直销业务：业务员必填且可编辑
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "ECargoCi.cSlsId", "rules", [getRules("required", {})]
            );
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "ECargoCi.cSlsId", "disabled", false
            );
            // 代理经纪人和代理业务员非必填且禁用
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "ECargoCi.cBrkrCde", "rules", []
            );
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "ECargoCi.cBrkSlsCde", "rules", []
            );
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "ECargoCi.cBrkrCde", "disabled", true
            );
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "ECargoCi.cBrkSlsCde", "disabled", true
            );
            const rowItem = freeEditRef.value?.getRowAllItemRefById(rowData._dataId)
            if (rowItem) {
              rowItem['ECargoCi.cSlsId']['btnItems'].disabled = false; // 放大镜按钮可编辑
              rowItem['ECargoCi.cBrkrCde']['btnItems'].disabled = true;
              rowItem['ECargoCi.cBrkSlsCde']['btnItems'].disabled = true;
            }
          } else {
            // 非直销业务：代理经纪人和代理业务员必填且可编辑
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "ECargoCi.cBrkrCde", "rules", [getRules("required", {})]
            );
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "ECargoCi.cBrkSlsCde", "rules", [getRules("required", {})]
            );
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "ECargoCi.cBrkrCde", "disabled", false
            );
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "ECargoCi.cBrkSlsCde", "disabled", false
            );
            // 业务员非必填且禁用
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "ECargoCi.cSlsId", "rules", []
            );
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "ECargoCi.cSlsId", "disabled", true
            );
            const rowItem = freeEditRef.value?.getRowAllItemRefById(rowData._dataId)
            if (rowItem) {
              rowItem['ECargoCi.cSlsId']['btnItems'].disabled = true;
              rowItem['ECargoCi.cBrkrCde']['btnItems'].disabled = false;
              rowItem['ECargoCi.cBrkSlsCde']['btnItems'].disabled = false;
            }
          }

          // 出单机构必填且可编辑
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "ECargoCi.cDptCde", "rules", [getRules("required", {})]
          );
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "ECargoCi.cDptCde", "disabled", false
          );
          freeEditRef.value?.setRowFieldProp(rowData._dataId, "ECargoCi.cPolicyNo", "disabled", true)
        }

        // 出单标志处理
        if (rowData['ECargoCi.cIssueMrk'] == '1') {
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "ECargoCi.nPlyFeeRate", "disabled", true);
        } else {
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "ECargoCi.nPlyFeeRate", "disabled", false);
        }
        // 特殊页面类型处理
        if (param?.pageType === "EDR_APP_NEW_SCENE" && cCiMrkValue !== "0" && cCiMrkValue == '5' && param.cRsnCde == "FZ") {
          formconfig1.fromSchema?.forEach((item) => {
            item.disabled = true;
          });
        }
        handleEdrAppNewSceneRules()
      }
    }, 300)
  });
}
/**
 * 处理EDR_APP_NEW_SCENE页面类型的特殊规则
 */
const handleEdrAppNewSceneRules = () => {
  const cCiMrkValue = formPage.getFormDataById("AgreementBase")['ECargoBase.cCiMrk'];
  const tableList = getFormValue();
  if (param?.pageType === "EDR_APP_NEW_SCENE" && cCiMrkValue !== "0" && cCiMrkValue !== '5' && param.cRsnCde == "47") {
    tableList.forEach((rowData: any) => {
      const rowItem = freeEditRef.value?.getRowAllItemRefById(rowData._dataId);
      if (rowItem) {
        if (rowData['ECargoCi.cChiefMrk'] == '1') {
          rowItem['ECargoCi.nCiShare'].disabled = false;
        }
        else if (rowData['ECargoCi.cChiefMrk'] == '0' && rowData['ECargoCi.cCoinsurerCde'] !== '327001') {
          rowItem['ECargoCi.nCiShare'].disabled = false;
          rowItem['ECargoCi.nPlyFeeRate'].disabled = false;
          rowItem['ECargoCi.cCoinsurerCde'].disabled = false;
        }
        else if (rowData['ECargoCi.cChiefMrk'] == '0') {
          rowItem['ECargoCi.nCiShare'].disabled = false;
          rowItem['ECargoCi.nPlyFeeRate'].disabled = false;
        }
      }
    });
  }
  //一般批改和注销
  if (param?.pageType === "EDR_APP_NEW_SCENE" && (param?.cEdrType == '2' || param?.cEdrType == '3' || param?.cRsnCde == 'FZ')) {
    console.log("paramcEdrType", param);
    const tableList = getFormValue();
    tableList?.forEach((rowD: any) => {
      const rowItems = freeEditRef.value?.getRowAllItemRefById(rowD._dataId);
      rowItems['ECargoCi.cSlsId']['btnItems'].disabled = true;
      rowItems['ECargoCi.cBrkrCde']['btnItems'].disabled = true;
      rowItems['ECargoCi.cBrkSlsCde']['btnItems'].disabled = true;
      rowItems['ECargoCi.nPlyFeeRate'].disabled = true;
    });
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop == "ECargoCi.cSlsId") {
        item.disabled = true;
      }
      item.disabled = true;
    });
  }

};

// 绑定特殊验证器
const exRules = {};

function getFormValue() {
  return freeEditRef?.value?.getFromValue();
}
function getSelectRow() {
  return freeEditRef?.value?.getSelectRow();
}
function setFormValue(value: any) {
  freeEditRef?.value?.setFormValue(value);
    setTimeout(() => {
    const tableValue = getFormValue()
    tableValue.forEach(async elem => {
      // 业务员加载
      slsCodeListLoad(elem);
      // 联保机构、出单机构 转 级联组件初始化
      if (elem['ECargoCi.cCiSubComp']) {
        const dptList = [];
        dptList.push(elem['ECargoCi.cCiSubComp']);
        if (elem['ECargoCi.cDptCde']) {
          dptList.push(elem['ECargoCi.cDptCde']);
        }
        elem['dptCascader'] = dptList;
      }
    });
    console.log('************ ci  setFormValue  -> ', tableValue)
    valideRequired()
  }, 500);
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
function setDisabledAll(isDisabled: boolean) {
  return freeEditRef?.value?.setDisabledAll(isDisabled);
}
function getFormconfig(){
  return formconfig1;
}
function addProvide<T>(key: InjectionKey<T> | string, value: T)  {
  freeEditRef?.value?.addProvide(key, value);
}
function setValue(key: string, value: any) {
  freeEditRef?.value?.setValue(key, value);
}
function getFormConfig() {
  return formconfig1;
}
defineExpose({
  getFormValue,
  setFormValue,
  getSelectRow,
  validate,
  setValueByRowKey,
  getRowById,
  getTableValue,
  setRowFieldProp,
  initCiInfo,
  setDisabledAll,
  getFormconfig,
  initcbusiner,
  initProxySales,
  intiAgentBroker,
  valideRequired,
  addProvide,
  getFormConfig,
  setValue,
  
});
</script>

<style scoped></style>

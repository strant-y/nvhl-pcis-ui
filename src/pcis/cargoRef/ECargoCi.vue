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
const codeListStore = codeListViewStore();
const dialogRef = ref<DialogMethod | null>(null);
import { dataOpertaor } from "@/store/modules/data-opertaor";

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


const idxParam = inject('idxParam');
const formPage = idxParam?.formPage;
const param = idxParam?.param;

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
    if(item.prop === 'Ci.cCoinsurerCde') {
      item.minWidth = 240
    }
  })
  //一般批改，部分要素可编辑
  const cCiMrkValue = formPage.getFormDataById("AgreementBase")['ECargoBase.cCiMrk'];
  setTimeout(() => {
    if (param.pageType === "EDR_APP_NEW_SCENE" &&   cCiMrkValue !== "0") {
    formconfig1.editFlag = true;
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === 'Ci.cChiefMrk' || item.prop === 'Ci.cIssueMrk') {
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
    debugger
    const dataList = getFromValue();
    const cCiMrkFlag = formPage.getFormDataById("AgreementBase")['ECargoBase.cCiMrk'];
    // const nCiAmt = parseFloat(productStore.nAmt)
    // if(param?.pageType !== "EDR_APP_NEW_SCENE" && nCiAmt =="0"){
    //   ElMessage.warning("总保额为0,请先进行保费计算!");
    //   return;
    // }
    const totalCiShare = dataList.reduce((sum, row) => sum + parseFloat(row['Ci.nCiShare'] || 0), 0);
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
          'Ci.nSeqNo': dataList.length + 1,
          'Ci.nPlyFeeRate': '0.00',
          'Ci.nPlyFee': '0.00',
          'Ci.nComm': '0.00',
          'Ci.cSlsId':"",
          "Ci.cBrkrCde":"",
          "Ci.cBrkSlsCde":"",
          'Ci.cChiefMrk': '',
          'Ci.cCoinsurerCde': '327001',
          'Ci.cCiSubComp': param.dptCde,
          'Ci.cDptCde': param.cDptCde,
      });
    }else{
      freeEditRef?.value?.addRowByData({
          'Ci.nSeqNo': dataList.length + 1,
          'Ci.nPlyFeeRate': '0.00',
          'Ci.nPlyFee': '0.00',
          'Ci.nComm': '0.00',
          'Ci.cSlsId':"",
          "Ci.cBrkrCde":"",
          "Ci.cBrkSlsCde":"",
          'Ci.cChiefMrk': '',
      });
    }
    // valideRequired()
    if(cCiMrkFlag == "2" || cCiMrkFlag == "4"){
      formconfig1.fromSchema?.forEach((item) => {
        if(item.prop == "Ci.nCiPrm"){
          item.disabled = false;
        }
      });
    }
    // 设置新行的 Ci.nCiShare 为剩余比例
    const newRowId = dataList[dataList.length - 1]?._dataId;
    if (newRowId && Number(remaining) > 0) {
      freeEditRef?.value?.setValueByRowKey("Ci.nCiShare", newRowId, remaining);
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
      const val = getFromValue();
      val.forEach((key,index) => {
          key['Ci.nSeqNo']=index+1
      });
  },
  // 共保公司下拉初始化事件 from-init 会自动绑定
  cCoinsurerCdeOnInit: (data: any) => {
    const {value, rowData, config, itemRef} = data;
    if(!rowData || !config || !itemRef) return;
    ciJiDptOptionsQuery(value, rowData);
    updateMasterAgreementValues()
  },
    // 共保公司改变事件
  cCoinsurerCdeChange:(val: string, row: any)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const formTableData = getFromValue();
    const plyBasedata = opertaor.getTableRefByKey("ECargoBase").getFromValue();
    if (!rowData) return;
    const rowId = rowData._dataId;

    freeEditRef?.value?.setValueByRowKey("dptCascader", rowId, []);
    freeEditRef?.value?.setValueByRowKey("Ci.cCiSubComp", rowId, undefined);
    freeEditRef.value?.setValueByRowKey("Ci.cDptCde", rowId, undefined);
    // 联保机构下拉选项查询
    ciJiDptOptionsQuery(val, row);
    if(!initFlag.value){
      if (plyBasedata["Base.cCiMrk"] === "5" && val !== "327001") {
        if(val !=''){
          freeEditRef?.value?.setValueByRowKey("Ci.cCoinsurerCde", rowId, "");
          ElMessage.error("司内联保，不能录入除永安以外的其他公司！");
        }
        return false;
      }
      freeEditRef?.value?.setValueByRowKey("Ci.cCiSubComp", rowId, "");
      if(plyBasedata["Base.cBsnsTyp"] === '19001'){
        freeEditRef.value?.setRowFieldProp(
                rowData._dataId, "Ci.cDptCde", "rules", [getRules("required", {})]
        );
      }
    }
    if (val === "327001" && (plyBasedata["Base.cCiMrk"] === "3" || plyBasedata["Base.cCiMrk"] === "4")) {
      const isYonganAlreadyPresent = formTableData.some(
          (row) => row._dataId !== rowId && row['Ci.cCoinsurerCde'] === "327001"
      );
      if (isYonganAlreadyPresent) {
        ElMessage.error('主（从）共无联保，我司只能录入一次！');
        freeEditRef.value?.setValueByRowKey("Ci.cCoinsurerCde", rowId, "");
        return;
      }
    }
    const allRowTable = getFromValue();
      const isDouble = allRowTable.some((row: any) => {
        return row._dataId !== rowId &&
            row["Ci.cCoinsurerCde"] === rowData["Ci.cCoinsurerCde"] && 
            row["Ci.cCoinsurerCde"] !=='327001'
      });
      if(isDouble)
      {
        ElMessage.error("已经存在相同的共保公司！");
        freeEditRef.value?.setValueByRowKey("Ci.cCoinsurerCde", rowId, "");
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
    const oldSubDptCde = rowData["Ci.cCiSubComp"]; // 原始分公司代码
    const oldDptCde = rowData["Ci.cDptCde"];
    if(value && value.length > 0){
      const subDptCde = value[0]; // 分公司代码
      const dptCde = value[1]; // 出单机构代码
      freeEditRef.value?.setValueByRowKey("Ci.cCiSubComp", rowId, subDptCde);
      freeEditRef.value?.setValueByRowKey("Ci.cDptCde", rowId, dptCde);
      // 校验
      onChiefMrkChange();
      // 获取所有行数据
      const allRows = getFromValue();
      // 校验是否存在重复的 Ci.cCoinsurerCde, Ci.cCiSubComp, Ci.cDptCde 组合
      const isDuplicate = allRows.some((row: any) => {
        // 排除当前行自身
        return row._dataId !== rowId &&
            row["Ci.cCoinsurerCde"] === rowData["Ci.cCoinsurerCde"] &&
            row["Ci.cCiSubComp"] === rowData["Ci.cCiSubComp"] &&
            row["Ci.cDptCde"] === dptCde;
      });
      if (isDuplicate) {
        ElMessage.error("已经存在相同的共保公司、分公司和出单机构组合！");
        // 回退当前行的出单机构值
        freeEditRef?.value?.setValueByRowKey("Ci.cDptCde", rowId, "");
        freeEditRef?.value?.setValueByRowKey("dptCascader", rowId, []);
        return;
      }
      } else {
        freeEditRef.value?.setValueByRowKey("Ci.cCiSubComp", rowId, undefined);
        freeEditRef.value?.setValueByRowKey("Ci.cDptCde", rowId, undefined);
      }
        
    // 如果级联选择器的值发生变化（分公司或出单机构任意一个发生变化），则清空当前行的业务员信息
    if(!initFlag.value){
      if (oldSubDptCde !== value?.[0] || oldDptCde !== value?.[1]) {
        // 清空业务员相关信息
        freeEditRef?.value?.setValueByRowKey("Ci.cSlsId", rowId, "");
        freeEditRef?.value?.setValueByRowKey("Ci.cSlsNme", rowId, "");
        freeEditRef?.value?.setValueByRowKey("Ci.cBrkrCde", rowId, "");
        freeEditRef?.value?.setValueByRowKey("Ci.cBrkSlsCde", rowId, "");
        
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
      "Ci.cContactTyp",
      "rules",
      [getRules("phoneNo", {})]
    );
  },
  //共保公司下拉事件
  cCoinsurerCdeChange:(val)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    if (!rowData || !initFlag.value) return;
    const rowId = rowData._dataId;
    const cCiMrk = formPage.getFormDataById("AgreementBase")['ECargoBase.cCiMrk'];
    if (cCiMrk["Base.cCiMrk"] == "5" && val !== "327001") {
      freeEditRef?.value?.setValueByRowKey("Ci.cCoinsurerCde", rowId, "");
      ElMessage.error("司内联保，不能录入除永安以外的其他公司！");
      return false;
    }
    freeEditRef?.value?.setValueByRowKey("Ci.cSubDptCde", rowId, "");
    if (val === "327001") {
      // 如果选择的是永安保险，加载对应的分公司列表
      codeListStore
        .queryCodeList({
          codeListName: "Comm_Code_LIST",
          codeListParam: { "CParCde": "subdpt", cParCde: "327001" },
        })
        .then((res) => {
          freeEditRef.value?.setRowFieldProp(
            rowId,
            "Ci.cSubDptCde",
            "loadData",
            res
          );
        });
      // updateMasterAgreementValues();
    } else {
      // 非永安保险，设置默认值和其他数据
      freeEditRef.value?.setRowFieldProp(
        rowId,
        "Ci.cSubDptCde",
        "loadData",
        [{ value: '1', label: '其他' }]
      );
      // updateMasterAgreementValues();
    }
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
                "Ci.cDptCde",
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
          freeEditRef?.value?.setValueByRowKey("Ci.cDptCde", rowId, "");
          freeEditRef.value?.setRowFieldProp(
            rowId,
            "Ci.cDptCde",
            "loadData",
            res,
          );
        });
    }
    // onChiefMrkChange()
  },
  //出单标志下拉事件
  clssueMrkChange:  (val)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData?._dataId;
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
  },
  //主共标志下拉事件
  cChiefMrkChange:(val)=>{
    //否0,1是
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData?._dataId;
    const cCiMrk = formPage.getFormDataById("AgreementBase")['ECargoBase.cCiMrk'];
    if (!rowData || !rowId) return;
    const cCoinsurerCde = rowData["Ci.cCoinsurerCde"];
    // 我方主共或从共的情况
    if (cCiMrk === '1' || cCiMrk === '3') {
      // 情况1：如果选中的是“是”且是永安保险(327001)
      if (rowData.length>1 && val === "1" && cCoinsurerCde === "327001") {
        ElMessage.error("我方从共时主共保方不能是我司！");
        freeEditRef?.value?.setValueByRowKey("Ci.cChiefMrk", rowId, "");
        return;
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
    }
    // 我方从共时，主共保方必须是我司
    if (cCiMrk["Base.cCiMrk"] === '2' || cCiMrk["Base.cCiMrk"] === '4') {
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
    const cCiMrk = formPage.getFormDataById("AgreementBase")['ECargoBase.cCiMrk'];
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
  //代理/经纪人
  cBrkrCdeChange:()=>{
    // if (getValue("Base.cBsnsTyp") && getValue("Base.cBsnsTyp") !== "19001") {
      dialogRef.value?.open(
        "agentPre",
        {
          type: "show",
          data: {
          },
          method: {
            getSelected: (params) => {
              // setFormItem("Ci.cBrkrCde", {
              //   loadData: [{ value: params.CChaCde, label: params.CChaNme }],
              // });
              // freeEditRef.value?.setRowFieldProp(rowId,"Ci.cBrkrCde","loadData","")
              dialogRef.value?.handleClose();
            },
          },
        },
        {
          isOk: (selectdata: any) => {
          },
        },
        { title: "代理查询", width: 85 }
      );
    // } else {
    //   ElMessage.warning("渠道分类--请选择非直销业务!");
    // }
  },
  //业务员
  cSlsCdeChange:()=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const rowId = rowData?._dataId;
    dialogRef.value?.open(
      "agentWorker",
      {
        type: "show",
        data: {},
        method: {
          getSelected: (params) => {
            freeEditRef.value?.setRowFieldProp(rowId,"Ci.cSlsCde","loadData",[{ label: params.CSlsNme, value: params.CSlsCde }])
            freeEditRef?.value?.setValueByRowKey("Ci.cSlsCde", rowId, params.CSlsCde);
            dialogRef.value?.handleClose();
          },
        },
      },
      {
        isOk: (selectdata: any) => {
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
      "agentWorker",
      {
        type: "show",
        data: {

        },
        method: {
          getSelected: (params) => {
            freeEditRef.value?.setRowFieldProp(rowId,"Ci.cBrkSlsCde","loadData",[{ label: params.CSlsNme, value: params.CSlsCde }])
            freeEditRef?.value?.setValueByRowKey("Ci.cBrkSlsCde", rowId, params.CSlsCde);
            dialogRef.value?.handleClose();
          },
        },
      },
      {
        isOk: (selectdata: any) => {
        },
      },
      { title: "业务员", width: 85 }
    );
  },
};

const updateMasterAgreementValues = () => {
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
  const cCoinsurerCde = rowData["Ci.cCoinsurerCde"];  //获取当前行的联共保公司编码
  const cSubDptCde = rowData["Ci.cSubDptCde"];     //获取当前行的分公司
  const cDptCde = param.cDptCde;   // 获取出单机构编码(cDptCnm:浙江电网销团队)
  let cSelfMrkVal = '0';
  let cJiMrkVal = '0';
  let cChiefMrkVal = '0';
  const ciMrkValue = cCiMrk["Base.cCiMrk"]; // 获取联共保标识

  if (cCoinsurerCde === "327001") {
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
  // const cChiefMrk = rowData["Ci.cChiefMrk"];
  // const cSelfMrk = rowData["Ci.cSelfMrk"];
  // const cJiMrk = rowData["Ci.cJiMrk"];
  freeEditRef?.value?.setValueByRowKey("Ci.cChiefMrk", rowData._dataId, cChiefMrkVal );
  freeEditRef?.value?.setValueByRowKey("Ci.cJiMrkVal", rowData._dataId, cJiMrkVal );
  freeEditRef?.value?.setValueByRowKey("Ci.cChiefMrkVal", rowData._dataId, cChiefMrkVal );
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
    freeEditRef?.value?.addRowByData( {
      // 'ECargoCi.nSeqNo': 1,
      // 'ECargoCi.nCiShare': '1.00000000',
      // 'ECargoCi.nPlyFeeRate': '0.00',
      // 'ECargoCi.nPlyFee': '0.00',
      // 'ECargoCi.cChiefMrk': cChiefMrk,
      // 'ECargoCi.cIssueMrk': '1',
      // 'ECargoCi.cCoinsurerCde': '327001',
    });
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
  const rowdata = getFromValue();
  if(rowdata.length >0){
    const rowId = rowdata[0]._dataId;
    setValueByRowKey('Ci.cSlsId',rowId,row.cSlsId)
    setValueByRowKey('Ci.cSlsNme',rowId,row.cSlsNme)
    freeEditRef.value?.addCodeListMap({
      code:'Ci.cSlsId'+rowId,
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
    setValueByRowKey('Ci.cBrkSlsCde',rowId,row.cSlsId)
    freeEditRef.value?.addCodeListMap({
      code:'Ci.cBrkSlsCde'+rowId,
      list: row.loadData,
    })
  }
}
//更新代理经纪人选中值到联共保代理经纪人
const intiAgentBroker = (row:any)=>{
  const rowData = getFromValue()
  if(rowData.length>0){
    const rowId = rowData[0]._dataId;
    setValueByRowKey('Ci.cBrkrCde',rowId,row.CChaCde);
    freeEditRef.value?.addCodeListMap({
      code:'Ci.cBrkrCde'+rowId,
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
  const cSlsId = row['Ci.cSlsId'];
  const cBrkSlsCde = row['Ci.cBrkSlsCde'];
  const cBrkrCde = row['Ci.cBrkrCde'];
  if(!!cSlsId && cSlsId !== ""){
    setOptions("Ci.cSlsId", rowId, "CSaleCde_List", {CSlsCde: cSlsId});
  }
  if(!!cBrkSlsCde && cBrkSlsCde !==""){
    setOptions("Ci.cBrkSlsCde", rowId, "WEB_ORG_SALES_BY_ID", {value: cBrkSlsCde});
  }
  if(!!cBrkrCde && cBrkrCde !==""){
    setOptions("Ci.cBrkrCde", rowId, "WEB_CUS_CHA_BY_ID", {value: cBrkrCde});
  }
};
// 联保机构下拉查询
const ciJiDptOptionsQuery = async (val: string, row: any) => {
  const rowId = row._dataId;
  // valideRequired()
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
function setDisabledAll(isDisabled: boolean) {
  return freeEditRef?.value?.setDisabledAll(isDisabled);
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
  setRowFieldProp,
  initCiInfo,
  setDisabledAll,
  // getFromValue,
  getFormconfig,
  initcbusiner,
  initProxySales,
  intiAgentBroker,
  // valideRequired,
  addProvide
});
</script>

<style scoped></style>

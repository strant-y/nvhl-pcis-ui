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
import { checkCdeptByCdptCde, getNmeByCde } from "@/api/prod";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());

const opertaor = dataOpertaor(idxParam.opertaorProps);
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
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
import { saveAs } from "file-saver";
import { fa } from "element-plus/es/locale";
import { debugPort } from "process";
import { debug } from "console";
const policyService = new PolicyService();
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
const oldPageSchema = ref<any>({});
const initFlag = computed(() => opertaor.getParam().initFlag);
let bankRelTypeArr: any[] = []; // 收款银行大类分解

// 声明全局变量
let cComponentTableValue: string;

// 封装获取 cComponentTableValue 的逻辑
const getCComponentTableValue = (): string => {
  return props.compKey ? props.compKey.replace(/\d+/g, '') : "";
};
onMounted(async () => {
	// 初始化 cComponentTableValue
  cComponentTableValue = getCComponentTableValue();
  const formconfig11 = formInit(
    JSON.stringify(props.pageSchema),
    method,
    exRules
  );
  Object.assign(formconfig1, formconfig11);
  //一般批改，部分要素可编辑
  const cCiMrkValue =  opertaor.getTableRefByKey("plyBase").getValue("Base.cCiMrk");
  setTimeout(() => {
    valideRequired();
    handleEdrAppNewSceneRules(); // 添加这行来确保规则被应用
  }, 3000);
  formconfig1.fromSchema?.forEach((item:any) => {
    if(item.prop === 'Ci.cCoinsurerCde') {
      item.minWidth = 240
    }
  })
	// 获取页面初始化的时候获取的组件配置信息
  if(opertaor.getFatherPage() && opertaor.getFatherPage().getOldProductResData() && opertaor.getFatherPage().getOldProductResData()[0]?.pageInfo) {
    oldPageSchema.value = opertaor.getFatherPage().getOldProductResData()[0]?.pageInfo.find((item: any) => item.pageCode === props.compKey).pageSchema || {};
    // 如果团个单标识为团单则展示关联被保险人，否则隐藏
    if(route.params.param?.cGrpMrk !== '1') {
      oldPageSchema.value.fromSchema = oldPageSchema.value.fromSchema.filter((item:any) => item.prop !== 'Dist.cRelatedInsured')
    }
  }
});

// 绑定方法
const method = {
  ciAdd: () => {
    const dataList = getFromValue();
    // const cBsnsTyp = opertaor.getTableRefByKey("plyBase").getValue("Base.cBsnsTyp")
    const cCiMrkFlag = opertaor.getTableRefByKey("plyBase").getValue("Base.cCiMrk");
    const nCiAmt = parseFloat(productStore.nAmt)
    if(param?.pageType !== "EDR_APP_NEW_SCENE" && nCiAmt =="0"){
      ElMessage.warning("总保额为0,请先进行保费计算!");
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
    const cChiefMrk = ['1', '3','5'].includes(cCiMrkFlag) ? '1' : '0';
    // const cSlsCde = opertaor.getTableRefByKey('plyBase').getValue('Base.cSlsId')
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
          // 'Ci.cCoinsurerCde': '327001',
          // 'Ci.cCiSubComp': param.dptCde,
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
    ciJiDptOptionsQuery(value, rowData);
    updateMasterAgreementValues()
  },
  // 共保公司改变事件
  cCoinsurerCdeChange:(val: string, row: any)=>{
    const rowData = freeEditRef.value?.getSelectRow();
    const formTableData = getFromValue();
    const plyBasedata = opertaor.getTableRefByKey("plyBase").getFromValue();
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
  //出单标志下拉事件
  clssueMrkChange:  (val)=>{
    //否0,是1
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
        freeEditRef?.value?.setValueByRowKey("Ci.cIssueMrk", rowId, "");
        return;
      }
      // if (val === "0") {
      //   if( cCiMrk["Base.cCiMrk"] == '5' ){
      //     if(rowData['Ci.cDptCde'] == param.cDptCde){
      //       ElMessage.error("联保单出单方必须是主联单的分公司！");
      //       freeEditRef?.value?.setValueByRowKey("Ci.cIssueMrk", rowId, "");
      //     }
      //   }
      //   if(cCiMrk["Base.cCiMrk"] == '3'){ 
      //     if(rowData['Ci.cDptCde'] === param.cDptCde){ 
      //       ElMessage.error("联保单出单方必须是主联单的分公司！");
      //       freeEditRef?.value?.setValueByRowKey("Ci.cIssueMrk", rowId, "");
      //     }
      //   }
      // }else{
      //   if(cCiMrk["Base.cCiMrk"] == '1' || cCiMrk["Base.cCiMrk"] == '5'){
      //     if(rowData['Ci.cDptCde'] !== param.cDptCde){
      //       ElMessage.error("联保单出单方必须是主联单的分公司！");
      //       freeEditRef?.value?.setValueByRowKey("Ci.cIssueMrk", rowId, "");
      //     }
      //   }
      // }
       // 根据不同的联共保类型进行校验
      if (val === "1") {
        // 选择"是"时的校验 - 出单方必须是主联单的分公司
        if ((cCiMrk["Base.cCiMrk"] == '1' || cCiMrk["Base.cCiMrk"] == '5') 
            && rowData['Ci.cDptCde'] !== param.cDptCde) {
          ElMessage.error("联保单出单方必须是主联单的分公司！");
          freeEditRef?.value?.setValueByRowKey("Ci.cIssueMrk", rowId, "");
          return;
        }
      } else if (val === "0") {
        // 选择"否"时的校验 - 联保单出单方必须是主联单的分公司
        if ((cCiMrk["Base.cCiMrk"] == '5' || cCiMrk["Base.cCiMrk"] == '3' || cCiMrk["Base.cCiMrk"] === '1') 
            && rowData['Ci.cDptCde'] == param.cDptCde) {
          ElMessage.error("联保单出单方必须是主联单的分公司！");
          freeEditRef?.value?.setValueByRowKey("Ci.cIssueMrk", rowId, "");
          return;
        }
      }
      allRows.forEach((item:any) => {
        const rowItem  =  freeEditRef.value?.getRowAllItemRefById(item._dataId)
        if(item['Ci.cIssueMrk'] == '1'){
          rowItem['Ci.nPlyFeeRate'].disabled = true
          freeEditRef?.value?.setValueByRowKey("Ci.nPlyFeeRate",rowId,"0.00");
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
    const cCiSubComp = rowData['Ci.cCiSubComp'];
    // 主共标志只能选否的条件
    if (rowData['Ci.cDptCde'] !== param.cDptCde && cCiMrk["Base.cCiMrk"] == '5') {
    // if (cCiMrk["Base.cCiMrk"] == '5') {
      if (val === "1") {
        ElMessage.error("司内联保时出单方必须是主联单的分公司！");
        freeEditRef?.value?.setValueByRowKey("Ci.cChiefMrk", rowId, "0");
        return;
      }
    }
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
      if(cCiMrk["Base.cCiMrk"] === '1'){
        if (val === "1" && existingChief) {
          ElMessage.error("主共方只能有一个！");
          freeEditRef?.value?.setValueByRowKey("Ci.cChiefMrk", rowId, "");
          return;
        }
      }
    // 我方从共时，主共保方必须是我司
    if (cCiMrk["Base.cCiMrk"] === '1' || cCiMrk["Base.cCiMrk"] === '3') {
      if (val === "1" && cCoinsurerCde !== "327001") {
        ElMessage.error("我方主共时主共保方必须是我司！");
        freeEditRef?.value?.setValueByRowKey("Ci.cChiefMrk", rowId, "");
        return;
      }
      if((val === "0" && cCiSubComp === param.dptCde)){
        ElMessage.error("我方主共时主共保方必须是我司！");
        freeEditRef?.value?.setValueByRowKey('Ci.cChiefMrk',rowId,"")
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
      // 修改范围为1-100之间
      if (floatValue < 1 || floatValue > 100) {
        ElMessage.warning("联共保比例必须大于等于1且小于等于100");
        freeEditRef?.value?.setValueByRowKey("Ci.nCiShare", rowId, "");
        return;
      }
      // 保留8位小数
      const limitedValue = floatValue.toFixed(8);
      freeEditRef?.value?.setValueByRowKey("Ci.nCiShare", rowId, limitedValue);
    } else {
      // 如果输入为空或其他非数字情况
      if (val === "" || val === null || val === undefined) {
        freeEditRef?.value?.setValueByRowKey("Ci.nCiShare", rowId, "");
        return;
      }
      ElMessage.error("请输入合法的数字");
      freeEditRef?.value?.setValueByRowKey("Ci.nCiShare", rowId, "");
      return;
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
      // updateMasterAgreementValues();
      // const allData =  getFromValue();
      // for (let i = 1; i < allData.length; i++) {
      //   const currentRow = allData[i];
      //   const previousRow = allData[i - 1];
      //   const currentPremium = parseFloat(currentRow["Ci.nCiPrm"] || 0);
      //   const previousPremium = parseFloat(previousRow["Ci.nCiPrm"] || 0);
      //   const diff = Math.abs(currentPremium - previousPremium);
      //   if (diff > 1) {
      //     ElMessage.error('联共保保费之间的误差不能大于1');
      //     break;
      //   }
      // }
    }
    updateMasterAgreementValues();
    // onChiefMrkChange()
    //根据新的联共保保费和出单费比例重新计算出单费用
    const updatedRowData = freeEditRef.value?.getSelectRow();
    const nPlyFeeRate = parseFloat(updatedRowData["Ci.nPlyFeeRate"] || 0);
    const nCiPrm = parseFloat(updatedRowData["Ci.nCiPrm"] || 0);
    const nPlyFee = nPlyFeeRate/100 * nCiPrm;
    freeEditRef?.value?.setValueByRowKey("Ci.nPlyFee", updatedRowData._dataId, nPlyFee.toFixed(2));
  },
  //出单费比例
  nPlyFeeRateChange:(val,row)=>{
    // 校验输入是否为有效数字
    if (val === "" || val === null || val === undefined) {
      freeEditRef?.value?.setValueByRowKey("Ci.nPlyFee", row._dataId, "");
      return;
    }
    // 将输入值转换为浮点数
    const floatValue = parseFloat(val);
    // 校验是否为有效数字
    if (isNaN(floatValue)) {
      ElMessage.warning("请输入有效的数字");
      // 重置为0
      freeEditRef?.value?.setValueByRowKey("Ci.nPlyFeeRate", row._dataId, "0.00");
      freeEditRef?.value?.setValueByRowKey("Ci.nPlyFee", row._dataId, "0.00");
      return;
    }
    // 限制出单费比例范围（0-100）
    if (floatValue < 0 || floatValue > 100) {
      ElMessage.warning("出单费比例应在0-100之间");
      freeEditRef?.value?.setValueByRowKey("Ci.nPlyFeeRate", row._dataId, "");
      freeEditRef?.value?.setValueByRowKey("Ci.nPlyFee", row._dataId, "0.00");
      return;
    }
    // 根据新的出单费比例和共保保费计算出单费用
    const nCiPrm = parseFloat(row["Ci.nCiPrm"] || 0);
    const nPlyFee = (floatValue / 100) * nCiPrm;
    // 出单费用保留2位小数
    freeEditRef?.value?.setValueByRowKey("Ci.nPlyFee", row._dataId, nPlyFee.toFixed(2));
  },
  //保单编号change事件
  cPolicyNoChange:(val, row)=>{
    // 校验保单编号只能包含数字和大写字母
    if (val) {
      // 只允许数字和大写字母
      const validPattern = /^[A-Z0-9]*$/;
      if (!validPattern.test(val)) {
        ElMessage.warning("保单编号只能包含数字和大写字母");
        // 清除非法字符，只保留数字和大写字母
        const cleanedValue = val.replace(/[^A-Z0-9]/g, '');
        const rowId = row._dataId;
        freeEditRef?.value?.setValueByRowKey("Ci.cPolicyNo", rowId, cleanedValue);
        return;
      }
      if(val.length > 30) {
        ElMessage.warning('保单编号不能超过30位');
        const rowId = row._dataId;
        freeEditRef?.value?.setValueByRowKey("Ci.cPolicyNo", rowId, '');
      }
    }
  },
  //开户行大类改变
  cBankRelTypChange:(val)=>{
    const rowDatas = freeEditRef.value?.getSelectRow();
    bankRelTypeArr = val.split('_')
    // freeEditRef.value?.setValueByRowKey("Ci.cBankAddr",rowDatas._dataId,bankRelTypeArr[1])
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
    console.log(12,val)
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
    if (val) {
      const rowData = freeEditRef.value?.getSelectRow();
      const rowId = rowData?._dataId;
      let backAddr = val.split('_');
      freeEditRef.value?.setValueByRowKey("Ci.cBankAddr",rowId,backAddr[1])
      freeEditRef.value?.setValueByRowKey("Ci.cBankCnaps",rowId,backAddr[0])
    }
    // const rowData = freeEditRef.value?.getSelectRow();
    // const rowId = rowData?._dataId;
    // dialogRef.value?.open(
    //     "cBrkrCdeModal",
    //     {
    //       type: "show",
    //       data: {
    //         rowData:rowData,
    //       },
    //       method: {
    //         getSelected: (params) => {
    //           console.log("params",params)
    //           freeEditRef.value?.setRowFieldProp(rowId,"Ci.cBankCde","loadData",[{ label: params.label, value: params.value }])
    //           freeEditRef.value?.setRowFieldProp(rowId,"Ci.cBankCde",params.value)
    //           dialogRef.value?.handleClose();
    //         },
    //       },
    //     },
    //     {
    //       isOk: (selectdata: any) => {
    //         console.log("a", selectdata);
    //       },
    //     },
    //     { title: "银行信息", width: 85 }
    //   );
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
            freeEditRef.value?.setRowFieldProp(rowId,"Ci.cSlsId","loadData",[{ label: `${params.CSlsCde}${params.CSlsNme}`, value: params.CSlsCde }])
            freeEditRef?.value?.setValueByRowKey("Ci.cSlsId", rowId, params.CSlsCde);
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
            freeEditRef.value?.setRowFieldProp(rowId,"Ci.cBrkrCde","loadData",[{ label: `${params.CChaCde}${params.CChaNme}`, value: params.CChaCde }])
            setValueByRowKey("Ci.cBrkrCde", rowId, params.CChaCde)
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
	// 联共保信息模板下载
	downloadCiTemplate:() =>{
    const baseMrk = opertaor.getTableRefByKey("plyBase")
    const cBsnsTyp = baseMrk.getValue("Base.cBsnsTyp")
		let param = {
      ...oldPageSchema.value,
      isAgent:!cBsnsTyp || cBsnsTyp === "19001" ? '0' : '1'
    }
    if(route.params.param?.pageName === "priceInquiry") {
      param['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
    } else {
      param['cAppNo'] = opertaor.getDataAll().plyBase["Base.cAppNo"]
    }
    policyService
        .downloadCiTemplate(param)
        .then((res:any) => {
          if (res.size <= 0) {
            ElMessage.error({ message: "下载出错", duration: 3000 });
            return;
          }
          const fileName = decodeURIComponent(res.headers['content-disposition'].split('filename=')[1]);
          const blob = new Blob([res.data], {
            responseType:res.headers["content-type"]
            // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8",
          });
          saveAs(blob, fileName);
        })
        .catch(() => {
          ElMessage.error("模板下载失败");
        });
	},
	// 联共保信息导入
	importCi:()=>{
		let cappNo = '';
    const edrbase = opertaor.getFatherPage().getEdrbaseValue();
    // 判断有无批改类型参数，有则是批单
    if(route.params.param?.cEdrType) {
      cappNo = edrbase['EdrBase.cAppNo'];
    } else if(route.params.param?.pageName === "priceInquiry") {
      cappNo = opertaor.getDataAll().plyBase["Base.cInquiryNo"];
    } else {
      cappNo = opertaor.getDataAll().plyBase["Base.cAppNo"];
    }
    if (!cappNo) {
      ElMessage.warning('请先保存申请单'); // 提示用户保存投保单
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls, .xlsm'; // 支持的文件类型
    input.onchange = () => {
      if (input.files?.length) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
          const base64String = e.target?.result as string;
          // 构建参数并请求接口
          const params = {
						...oldPageSchema.value,
            file: base64String, // ✅ 正确传入
            cComponentTable: cComponentTableValue,
            cAppNo: opertaor.getDataAll().plyBase["Base.cAppNo"],
          };
          if(route.params.param?.pageName === "priceInquiry") {
            params['cInquiryNo'] = opertaor.getDataAll().plyBase["Base.cInquiryNo"]
          }

          policyService.importCi(params).then((res:any) => {
            if (res.code === 200) {
            } else {
              ElMessage.error(res.msg || "增量导入失败");
            }
          }).catch((error) => {
            ElMessage.error("导入出错，请检查文件格式或内容");
            console.error("导入错误：", error);
          });
        };

        reader.onerror = (e) => {
          console.error("文件读取失败", e);
          ElMessage.error("文件读取失败");
        };
        reader.readAsDataURL(file); // 启动读取
      }
    };
    input.click(); // 触发文件选择对话框
	}
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
      opertaor.getTableRefByKey("ciMasterAgreement").setValue("Base.nCiOwnAmt", totalAmt.toFixed(2));  //我司分额保额
      opertaor.getTableRefByKey("ciMasterAgreement").setValue("Base.nCiOwnPrm", totalPrm.toFixed(2));  //我司份额保费
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
  const cSubDptCde = rowData["Ci.cCiSubComp"];     //获取当前行的分公司
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
        // case "5":
          cChiefMrkVal = '1'; // 主共方
          break;
        default:
          cChiefMrkVal = '0'; // 从共方
      }
    }else{
      cChiefMrkVal = '0'; // 非本分公司
      cJiMrkVal = '0';    // 从联方
      cSelfMrkVal = '0';  // 从共方
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
    freeEditRef?.value?.setValueByRowKey("Ci.cSelfMrk", rowData._dataId, cSelfMrkVal );  // 本公司标识
    freeEditRef?.value?.setValueByRowKey("Ci.cJiMrk", rowData._dataId, cJiMrkVal );   // 联保标识
    freeEditRef?.value?.setValueByRowKey("Ci.cChiefMrk", rowData._dataId, cChiefMrkVal );  // 共保标识
};
// 初始化联共保信息
const initCiInfo = (data: any) => {
  const {cCiMrk} = data;
  const cChiefMrk = ['1', '3','5'].includes(cCiMrk) ? '1' : '0';
  const dataList = getFromValue();
  if(dataList.length > 0) {
    setFormValue([]);
  }
  nextTick(() => {
    const allTab = opertaor.getDataAll()
    console.log('allTab', allTab)
    const plyBase = allTab['plyBase'];
    const cSlsId = plyBase['Base.cSlsId'];
    const cBrkSlsCde = plyBase['Base.cBrkSlsCde'];
    const cBrkrCde = plyBase['Base.cBrkrCde'];
    // 联保机构、出单机构 转 级联组件初始化
    const dptList = [];
    if(param['dptCde']) {
      dptList.push(param['dptCde']);
      if(param['cDptCde']) {
        dptList.push(param['cDptCde']);
      }
    }
    freeEditRef?.value?.addRowByData( {
      'Ci.nSeqNo': 1,
      'Ci.nCiShare': '100',
      'Ci.nPlyFeeRate': '0.00',
      'Ci.nPlyFee': '0.00',
      'Ci.nComm':'0.00',
      'Ci.cChiefMrk': cChiefMrk,
      'Ci.cIssueMrk': '1',
      'Ci.cCoinsurerCde': '327001',
      "Ci.cCiSubComp": param.dptCde,
      'Ci.cDptCde': param.cDptCde,
      'Ci.cBrkrCde': cBrkrCde,
      'Ci.cSlsId': cSlsId,
      'Ci.cBrkSlsCde': cBrkSlsCde,
      'dptCascader' : dptList,
    });
    // 联保机构下拉选项查询
    ciJiDptOptionsQuery('327001', getFromValue()[0]);
    // 业务员加载
    slsCodeListLoad(getFromValue()[0]);

    onChiefMrkChange();
  });
};

//个性化校验封装方法
const valideRequired = ()=>{
  const cBsnsTyp = opertaor.getTableRefByKey('plyBase').getValue('Base.cBsnsTyp')
  const cCiMrkValue =  opertaor.getTableRefByKey("plyBase").getValue("Base.cCiMrk");
  setTimeout(()=>{ 
      const rowItems = getFromValue()
      for(const rowData of rowItems){
        // 处理业务类型为19001（直销业务）的情况
        if(cBsnsTyp == '19001'){
          freeEditRef.value?.setRowFieldProp(rowData._dataId, 'Ci.nComm', 'disabled', true)
          // 直销业务：业务员必填
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.cSlsId", "rules", [getRules("required", {})]
          );
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.cSlsId", "disabled", false
          );
          // 直销业务：代理经纪人和代理业务员非必填且禁用
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.cBrkrCde", "rules", []
          );
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.cBrkSlsCde", "rules", []
          );
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.cBrkrCde", "disabled", true
          );
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.cBrkSlsCde", "disabled", true
          );
          const rowItem = freeEditRef.value?.getRowAllItemRefById(rowData._dataId)
          if (rowItem) {
            rowItem['Ci.cBrkrCde']['btnItems'].disabled = true;
            rowItem['Ci.cBrkSlsCde']['btnItems'].disabled = true;
          }
        }
        // 处理非直销业务（19002或19003）的情况
        else if(cBsnsTyp == '19002' || cBsnsTyp == '19003'){
          freeEditRef.value?.setRowFieldProp(rowData._dataId, 'Ci.nComm', 'disabled', false)
          // 非直销业务：代理经纪人和代理业务员必填
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.cBrkrCde", "rules", [getRules("required", {})]
          );
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.cBrkSlsCde", "rules", [getRules("required", {})]
          );
          // 非直销业务：业务员非必填且禁用
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.cSlsId", "rules", []
          );
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.cSlsId", "disabled", true
          );
          const rowItem = freeEditRef.value?.getRowAllItemRefById(rowData._dataId)
          if (rowItem) {
            rowItem['Ci.cSlsId']['btnItems'].disabled = true;
          }
        }
        
        // 处理共保公司非永安（327001）的情况
        if(rowData['Ci.cCoinsurerCde'] !=='327001'){
          // 业务员、代理业务员、代理经纪人都禁用且非必填
          freeEditRef.value?.setRowFieldProp(rowData._dataId, "Ci.cSlsId", "rules", [])
          freeEditRef.value?.setRowFieldProp(rowData._dataId, "Ci.cBrkSlsCde", "rules", [])
          freeEditRef.value?.setRowFieldProp(rowData._dataId, "Ci.cBrkrCde", "rules", [])
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.cSlsId", "disabled", true
          );
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.cBrkSlsCde", "disabled", true
          );
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.cBrkrCde", "disabled", true
          );
          
          // 出单机构非必填且禁用
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.cDptCde", "rules", []
          );
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.cDptCde", "disabled", true
          );
          freeEditRef.value?.setRowFieldProp(rowData._dataId,"Ci.cPolicyNo","disabled",false)
          const rowItem = freeEditRef.value?.getRowAllItemRefById(rowData._dataId)
          if (rowItem) {
            rowItem['Ci.cSlsId']['btnItems'].disabled = true;
            rowItem['Ci.cBrkrCde']['btnItems'].disabled = true;
            rowItem['Ci.cBrkSlsCde']['btnItems'].disabled = true;
          }
        }
        // 处理共保公司为永安（327001）的情况
        else{
          // 只有在共保公司为永安时，才根据业务类型设置不同的规则
          if (cBsnsTyp == '19001') {
            // 直销业务：业务员必填且可编辑
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "Ci.cSlsId", "rules", [getRules("required", {})]
            );
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "Ci.cSlsId", "disabled", false
            );
            // 代理经纪人和代理业务员非必填且禁用
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "Ci.cBrkrCde", "rules", []
            );
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "Ci.cBrkSlsCde", "rules", []
            );
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "Ci.cBrkrCde", "disabled", true
            );
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "Ci.cBrkSlsCde", "disabled", true
            );
            const rowItem = freeEditRef.value?.getRowAllItemRefById(rowData._dataId)
            if (rowItem) {
              rowItem['Ci.cSlsId']['btnItems'].disabled = false; // 放大镜按钮可编辑
              rowItem['Ci.cBrkrCde']['btnItems'].disabled = true;
              rowItem['Ci.cBrkSlsCde']['btnItems'].disabled = true;
            }
          } else {
            // 非直销业务：代理经纪人和代理业务员必填且可编辑
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "Ci.cBrkrCde", "rules", [getRules("required", {})]
            );
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "Ci.cBrkSlsCde", "rules", [getRules("required", {})]
            );
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "Ci.cBrkrCde", "disabled", false
            );
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "Ci.cBrkSlsCde", "disabled", false
            );
            // 业务员非必填且禁用
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "Ci.cSlsId", "rules", []
            );
            freeEditRef.value?.setRowFieldProp(
              rowData._dataId, "Ci.cSlsId", "disabled", true
            );
            const rowItem = freeEditRef.value?.getRowAllItemRefById(rowData._dataId)
            if (rowItem) {
              rowItem['Ci.cSlsId']['btnItems'].disabled = true;
              rowItem['Ci.cBrkrCde']['btnItems'].disabled = false;
              rowItem['Ci.cBrkSlsCde']['btnItems'].disabled = false;
            }
          }
          
          // 出单机构必填且可编辑
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.cDptCde", "rules", [getRules("required", {})]
          );
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.cDptCde", "disabled", false
          );
          freeEditRef.value?.setRowFieldProp(rowData._dataId,"Ci.cPolicyNo","disabled",true)
        }
        
        // 出单标志处理
        if(rowData['Ci.cIssueMrk'] == '1'){
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.nPlyFeeRate", "disabled", true );
        }else{
          freeEditRef.value?.setRowFieldProp(
            rowData._dataId, "Ci.nPlyFeeRate", "disabled", false );
        }
        // 特殊页面类型处理
        if (param?.pageType === "EDR_APP_NEW_SCENE" && cCiMrkValue !== "0" && cCiMrkValue =='5' && param.cRsnCde == "FZ") {
          formconfig1.fromSchema?.forEach((item) => {
            item.disabled = true;
          });
        }
        handleEdrAppNewSceneRules()
      }
  },700)
}
/**
 * 处理EDR_APP_NEW_SCENE页面类型的特殊规则
 */
const handleEdrAppNewSceneRules = () => {
  const cCiMrkValue = opertaor.getTableRefByKey("plyBase").getValue("Base.cCiMrk");
  const tableList = getFromValue();
  if (param?.pageType === "EDR_APP_NEW_SCENE" && cCiMrkValue !== "0" && cCiMrkValue !== '5' && param.cRsnCde == "47") {
    tableList.forEach((rowData: any) => {
      const rowItem = freeEditRef.value?.getRowAllItemRefById(rowData._dataId);
      if (rowItem) {
        if (rowData['Ci.cChiefMrk'] == '1') {
          rowItem['Ci.nCiShare'].disabled = false;
        }
        else if (rowData['Ci.cChiefMrk'] == '0' && rowData['Ci.cCoinsurerCde'] !== '327001') {
          rowItem['Ci.nCiShare'].disabled = false;
          rowItem['Ci.nPlyFeeRate'].disabled = false;
          rowItem['Ci.cCoinsurerCde'].disabled = false;
        }
        else if (rowData['Ci.cChiefMrk'] == '0') {
          rowItem['Ci.nCiShare'].disabled = false;
          rowItem['Ci.nPlyFeeRate'].disabled = false;
        }
      }
    });
  }
  //一般批改和注销
    if(param?.pageType === "EDR_APP_NEW_SCENE" && (param?.cEdrType == '2' || param?.cEdrType == '3')){
      const tableList = getFromValue();
      tableList?.forEach((rowD:any) => {
        const rowItems = freeEditRef.value?.getRowAllItemRefById(rowD._dataId);
        rowItems['Ci.cSlsId']['btnItems'].disabled = true;
        rowItems['Ci.cBrkrCde']['btnItems'].disabled = true;
        rowItems['Ci.cBrkSlsCde']['btnItems'].disabled = true;
      });
      formconfig1.fromSchema?.forEach((item) => {
        if(item.prop == "Ci.cSlsId"){
          item.disabled = true;
        }
        item.disabled = true;
      });
    }

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
  setTimeout(() => {
    const tableValue = getFromValue()
     tableValue.forEach(async elem => {
       // 业务员加载
      slsCodeListLoad(elem);
      // 联保机构、出单机构 转 级联组件初始化
      if(elem['Ci.cCiSubComp']) {
        const dptList = [];
        dptList.push(elem['Ci.cCiSubComp']);
        if(elem['Ci.cDptCde']) {
          dptList.push(elem['Ci.cDptCde']);
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

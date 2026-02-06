<!-- 风险单位划分 -->
<template>
  <el-dialog
    v-model="dialogVisible"
    width="80%"
    title="风险单位划分、风险累积及分保安排"
    :before-close="handleBeforeClose"
  >
    <!-- <el-card class="app-container"> -->
    <app-free-edit :freeEditConfig="formconfig" ref="freeEditRef" />
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef1" />
    <app-table
      :tableConfig="tableconfig1"
      v-model:pageresult="pageresult1"
      ref="tableRef1"
      @selection-change="handleSelectionChange"
      @page-change="handleQuery1(false)"
    />

    <app-table
      :tableConfig="tableconfig2"
      v-model:pageresult="pageresult2"
      ref="tableRef2"
      @row-click="handleRowClick2"
      @page-change="handleQuery2(false)"
    />

    <div class="footer-button-container" style="text-align: center">
      <span>
        <!-- <el-button
          class="custom-button"
          type="primary"
          @click="handleBeforeClose"
          >关闭</el-button
        > -->
      </span>
    </div>
    <!-- </el-card> -->
  </el-dialog>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store";
import { useValidator } from "@/typings/useValidator";
import { useRouter, useRoute } from "vue-router";
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });
const { getRules } = useValidator();

import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const freeEditRef1 = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import moment from "moment";
import { BASE, BASEBEFORE } from "@/constants/tab-constants";
import { NewUdrListService } from "@/views/pcis-new-udr-list/service/new-udr-list.service";
import { getListByCode } from "@/api/code-list-service";
const {
  tryCountInFoRI,
  saveData,
  riskUnitQuery,
  getReinsuredData,
  saveRiskData,
  riskQueryData,
  riskQueryDataXJ,
  queryComponentCodeList,
  getReinsuredDataXJ,
  tryCountInFoRIXJ,
  queryComponentCodeListXJ,
  riskUnitQueryXJ,
  saveDataXJ,
  downloadDistTemplate,
  importUnit,
  exportUnit,
} = NewUdrListService();
import { descryptParameter } from "@/utils/encipher.ts";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { codeListViewStore } from "@/store";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
import { saveAs } from "file-saver";
const dzmodal = useDzModal();
const route = useRoute();
const params = route.query.param
  ? JSON.parse(descryptParameter(route.query.param))
  : {};
const tableRef1 = ref<AppTableMethod | null>(null);
const tableRef2 = ref<AppTableMethod | null>(null);
const ViewContInfoComponent = defineAsyncComponent(
  () => import("@/views/pcis-new-udr-list/common/ViewContInfoComponent.vue")
);
const dataSet = ref<any>([]); // 数据集合
const retLmtSet = ref<any>([]); // 自留额集合
const index1 = ref(-1); // 第一个列表选中index
const index2 = ref(-1); // 第一个列表选中index
const selectRow1 = ref<any>({}); // 第一个列表选中行
const selectRow2 = ref<any>({}); // 第一个列表选中行
const CRiskLvlCde_Options = ref<any>([]); // 风险等级列表
const dialogVisible = ref(true);
const cAmtCurOptions = ref([]);
const cPrmCurOptions = ref([]);
const saveFlag = ref(false); // 是否保存了风险单位
const _dataSet = ref<any>([]);
const cInwdMrk = ref(""); // 临分标识
const addressOptions = ref([]); // 标的地址下拉选项
let nAmtVarInit = ref(null); // 我司保额变化初始值
let nPrmVarInit = ref(null); // 我司保费变化初始值
const tryCountDisabled = ref(false);

const props = defineProps({
  param: {
    type: [Object],
  },
  idxParam: {
    type: Object
  }
});
const opertaor = dataOpertaor(props.idxParam?.opertaorProps);

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "基本信息",
    fromUi: {
      cols: 2,
    },
    fromSchema: [
      {
        prop: "cCiMrk",
        inputtype: "rtselect",
        title: "共保标志",
        clearable: true,
        typeCode: "Joint_Insurance_Business",
        disabled: true,
      },
      {
        prop: "nCiShareInteger",
        inputtype: "rtnumber",
        title: "我司占比",
        precision: 2,
        clearable: true,
        suffix: "%",
        disabled: true,
      },
      {
        groupList: [
          {
            prop: "nAmt",
            inputtype: "rtnumber",
            title: "我司总保额",
            precision: 2,
            clearable: true,
            disabled: true,
          },
          {
            prop: "cAmtCur",
            inputtype: "rtselect",
            title: "",
            clearable: true,
            disabled: true,
            typeCode: "FIN_CUR_CACHE",
          },
        ],
        inputtype: "rtinputgroup",
        itemWidth: 1,
        prop: "nAmtGroup",
        title: "我司总保额",
      },
      {
        groupList: [
          {
            prop: "nPrm",
            inputtype: "rtnumber",
            title: "我司总保费",
            precision: 2,
            clearable: true,
            disabled: true,
          },
          {
            prop: "cPrmCur",
            inputtype: "rtselect",
            title: "",
            clearable: true,
            disabled: true,
            typeCode: "FIN_CUR_CACHE",
          },
        ],
        inputtype: "rtinputgroup",
        itemWidth: 1,
        prop: "nPrmGroup",
        title: "我司总保费",
      },
      {
        groupList: [
          {
            prop: "nAmtVar",
            inputtype: "rtnumber",
            title: "我司总保额变化量",
            precision: 2,
            clearable: true,
            disabled: true,
            defaultValue: "0",
          },
          {
            prop: "cAmtCur",
            inputtype: "rtselect",
            title: "",
            clearable: true,
            disabled: true,
            typeCode: "FIN_CUR_CACHE",
          },
        ],
        inputtype: "rtinputgroup",
        itemWidth: 1,
        prop: "nAmtVarGroup",
        title: "我司总保额变化量",
      },
      {
        groupList: [
          {
            prop: "nPrmVar",
            inputtype: "rtnumber",
            title: "我司总保费变化量",
            precision: 2,
            clearable: true,
            disabled: true,
            defaultValue: "0",
          },
          {
            prop: "cPrmCur",
            inputtype: "rtselect",
            title: "",
            clearable: true,
            disabled: true,
            typeCode: "FIN_CUR_CACHE",
          },
        ],
        inputtype: "rtinputgroup",
        itemWidth: 1,
        prop: "nPrmVarGroup",
        title: "我司总保费变化量",
      },
      {
        prop: "nAddedTax",
        inputtype: "rtnumber",
        title: "增值税额",
        precision: 2,
        disabled: true,
        hidden: true,
      },
      {
        prop: "nAddedTaxVar",
        inputtype: "rtnumber",
        title: "增值税额变化值",
        precision: 2,
        disabled: true,
        hidden: true,
      },
      {
        prop: "nNotaxPrm",
        inputtype: "rtnumber",
        title: "不含税保费",
        precision: 2,
        hidden: true,
      },
      {
        prop: "nNotaxPrmVar",
        inputtype: "rtnumber",
        title: "不含税保费变化值",
        precision: 2,
        hidden: true,
      },
      {
        prop: "nCiAmt",
        inputtype: "rtnumber",
        title: "共保保额",
        precision: 2,
        hidden: true,
      },
      {
        prop: "nCiPrm",
        inputtype: "rtnumber",
        title: "共保保费",
        precision: 2,
        hidden: true,
      },
      {
        prop: "nCiShare",
        inputtype: "rtnumber",
        title: "我司占比",
        precision: 2,
        clearable: true,
        suffix: "%",
        hidden: true,
      },
    ],
  })
);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "风险累积信息",
    fromUi: {
      cols: 2,
    },
    fromSchema: [
      {
        prop: "cRiskUnitNme",
        inputtype: "rtinput",
        title: "风险单位名称",
        rules: [getRules("required", {})],
        clearable: true,
        disabled: opertaor.getDataAll()?.cvrg?.[0]['Term.cUniqueTermNo'] === '0125111401',
        func: (val:any) => {
          pageresult1.list.forEach(item => {
            if(item.cPkId === selectRow1.value.cPkId) {
              item.cRiskUnitNme = val;
            }
          })
          if(selectRow1.value.cPkId) {
            selectRow1.value.cRiskUnitNme = val
          }
        }
      },
      {
        prop: "cRiskLvlCde",
        inputtype: "rtselect",
        title: "风险等级",
        rules: [getRules("required", {})],
        clearable: true,
        loadData: CRiskLvlCde_Options,
        disabled: opertaor.getDataAll()?.cvrg?.[0]['Term.cUniqueTermNo'] === '0125111401',
        func: (val: any) => {
          const selectedItem = CRiskLvlCde_Options.value.find(
            (item: any) => item.value === val
          );
          const nRetLmt = selectedItem?.nRetLmt;
          freeEditRef1.value?.setValue("nRetAmt", nRetLmt);
          pageresult1.list.forEach(item => {
            if(item.cPkId === selectRow1.value.cPkId) {
              item.nRetAmt = nRetLmt;
              item.cRiskLvlCde = val
              item.cRiskLvlNme = selectedItem?.label
            }
          })
          if(selectRow1.value.cPkId) {
            selectRow1.value.nRetAmt = nRetLmt
            selectRow1.value.cRiskLvlCde = val
            selectRow1.value.cRiskLvlNme = selectedItem?.label
          }
        },
      },
      {
        groupList: [
          {
            prop: "nAmtVar",
            inputtype: "rtnumber",
            title: "我司保额变化",
            precision: 2,
            clearable: true,
            disabled: true,
            func: (val: any) => {
              if(nAmtVarInit.value) {
                changeNamt(val);
                nAmtVarInit.value = val
              } else if (val) {
                nAmtVarInit.value = val
              }
            },
          },
          {
            prop: "cAmtCur",
            inputtype: "rtselect",
            title: "",
            clearable: true,
            disabled: true,
            typeCode: "FIN_CUR_CACHE",
          },
        ],
        inputtype: "rtinputgroup",
        itemWidth: 1,
        prop: "nAmtVarGroup",
        title: "我司保额变化",
      },
      {
        groupList: [
          {
            prop: "nPrmVar",
            inputtype: "rtnumber",
            title: "我司保费变化",
            precision: 2,
            clearable: true,
            disabled: true,
            func: (val: any) => {
              if(nPrmVarInit.value) {
                changePrm(val);
                nPrmVarInit.value = val
              } else if (val) {
                nPrmVarInit.value = val
              }
            },
          },
          {
            prop: "cPrmCur",
            inputtype: "rtselect",
            title: "",
            clearable: true,
            disabled: true,
            typeCode: "FIN_CUR_CACHE",
          },
        ],
        inputtype: "rtinputgroup",
        itemWidth: 1,
        prop: "nPrmVarGroup",
        title: "我司保费变化",
      },
      {
        prop: "nAmt",
        inputtype: "rtnumber",
        title: "我司保额",
        precision: 2,
        rules: [getRules("required", {})],
        clearable: true,
        disabled: true,
      },
      {
        prop: "nPrm",
        inputtype: "rtnumber",
        title: "我司保费",
        precision: 2,
        rules: [getRules("required", {})],
        clearable: true,
        disabled: true,
      },
      {
        prop: "nRetAmt",
        inputtype: "rtnumber",
        title: "自留额",
        precision: 2,
        rules: [getRules("required", {})],
        clearable: true,
        disabled: true,
        max: 999999999999999
      },
      {
        prop: "nMaxRetAmt",
        inputtype: "rtnumber",
        title: "法定自留额",
        precision: 2,
        clearable: true,
        disabled: true,
      },
      {
        groupList: [
          {
            prop: "nCiAmt",
            inputtype: "rtnumber",
            title: "共保保额",
            itemWidth: 0.5,
            precision: 2,
            clearable: true,
            disabled: true,
          },
          {
            prop: "cCiAmtCur",
            inputtype: "rtselect",
            title: "",
            itemWidth: 0.5,
            clearable: true,
            disabled: true,
            typeCode: "FIN_CUR_CACHE",
          },
        ],
        inputtype: "rtinputgroup",
        itemWidth: 1,
        prop: "nCiAmtGroup",
        title: "共保保额",
      },
      {
        groupList: [
          {
            prop: "nCiPrm",
            inputtype: "rtnumber",
            title: "共保保费",
            precision: 2,
            clearable: true,
            disabled: true,
          },
          {
            prop: "nCiPrmCur",
            inputtype: "rtselect",
            title: "",
            clearable: true,
            disabled: true,
            typeCode: "FIN_CUR_CACHE",
          },
        ],
        inputtype: "rtinputgroup",
        itemWidth: 1,
        prop: "nCiPrmGroup",
        title: "共保保费",
      },
      {
        prop: "nCiAmtVar",
        inputtype: "rtnumber",
        title: "共保总保额变化量",
        precision: 2,
        clearable: true,
        disabled: true,
      },
      {
        prop: "nCiPrmVar",
        inputtype: "rtnumber",
        title: "共保总保费变化量",
        precision: 2,
        clearable: true,
        disabled: true,
      },
      {
        prop: "cRemark",
        inputtype: "rtinput",
        title: "备注",
        type: "textarea",
        rows: 4,
        itemWidth: 2,
        clearable: true,
        hidden: true,
      },
      {
        prop: "nRmbChgRate",
        inputtype: "rtinput",
        title: "折人民币汇率",
        hidden: true,
      },
      {
        prop: "nRmbAmtVar",
        inputtype: "rtinput",
        title: "折人民币变化量",
        hidden: true,
      },
      {
        prop: "nRetPrpt",
        inputtype: "rtinput",
        title: "自留额比例",
        hidden: true,
      },
      {
        prop: "nRicurChgRate",
        inputtype: "rtinput",
        title: "折再保币种汇率",
        hidden: true,
      },
      {
        prop: "nNotaxPrm",
        inputtype: "rtnumber",
        title: "不含税保费",
        precision: 2,
        hidden: true,
      },
      {
        prop: "nNotaxPrmVar",
        inputtype: "rtnumber",
        title: "不含税保费变化值",
        precision: 2,
        hidden: true,
      },
      {
        prop: "nAddedTax",
        inputtype: "rtnumber",
        title: "增值税额",
        precision: 2,
        hidden: true,
      },
      {
        prop: "nAddedTaxVar",
        inputtype: "rtnumber",
        title: "增值税额变化值",
        precision: 2,
        hidden: true,
      },
      {
        prop: "nCiNotaxPrm",
        inputtype: "rtnumber",
        title: "共保不含税保费",
        precision: 2,
        hidden: true,
      },
      {
        prop: "nCiNotaxPrmVar",
        inputtype: "rtnumber",
        title: "共保不含税保费变化值",
        precision: 2,
        hidden: true,
      },
      {
        prop: "nCiAddedTax",
        inputtype: "rtnumber",
        title: "共保增值税额",
        precision: 2,
        hidden: true,
      },
      {
        prop: "nCiAddedTaxVar",
        inputtype: "rtnumber",
        title: "共保增值税额变化值",
        precision: 2,
        hidden: true,
      },
    ],
  })
);

// 风险单位信息 列表同步修改
function editListData1(index: number, key: any, value: any) {
  pageresult1.list[index][key] = value;
}

// 风险单位信息 修改表单项
function setFromSchemaItem(key: any, rules: any, disabled: any) {
  const items = freeEditRef1.value?.getFromSchemaItem(key);
  if (!disabled) items.disabled = disabled;
  if (rules) items.rules = rules;
}

//给表单下拉项赋值
const setFormItem = (key: any, obj: any) => {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if(item.inputtype === "rtinputgroup") {
        item.groupList.forEach((groupItem:any) => {
          if (groupItem.prop === key) {
            //控制尾部按钮的
            if (groupItem.loadData && obj.loadData) {
              let newBtnItems = null;
              if (obj.loadData.length != 0) {
                for (let key in obj.loadData) {
                  groupItem.loadData[key] = obj.loadData[key];
                }
              } else {
                groupItem.loadData = obj.loadData;
              }
              newBtnItems = groupItem.loadData;
              newBtnItems && (obj.loadData = newBtnItems);
            }
            Object.assign(groupItem, obj);
          }
        });
      } else
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

// 风险单位信息 列表
const pageresult1 = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
const tableconfig1 = reactive<AppTableConfig>(
  createTableEditConfig({
    title: "风险单位信息",
    editFlag: true,
    editList: opertaor.getDataAll()?.cvrg?.[0]['Term.cUniqueTermNo'] === '0125111401' ? [] : ["cDetailedAddress","cRemark"],
    tableBtnType: "btn",
    showSelection: opertaor.getDataAll()?.cvrg?.[0]['Term.cUniqueTermNo'] === '0125111401' ? false : true,
    titleBtns: [
      createFreeButtonBase({
        id: "btnSplit",
        label: "拆分",
        type: "success",
        disabled: opertaor.getDataAll()?.cvrg?.[0]['Term.cUniqueTermNo'] === '0125111401',
        func: () => {
          if (!selectRow1.value.cPkId)
            return ElMessage.warning("请选择一条风险单位");
          split();
        },
      }),
      createFreeButtonBase({
        id: "btnDelete",
        label: "删除",
        type: "success",
        disabled: opertaor.getDataAll()?.cvrg?.[0]['Term.cUniqueTermNo'] === '0125111401',
        func: () => {
          if (!selectRow1.value.cPkId) {
            return ElMessage.warning("请选择一条风险单位");
          } else if(pageresult1.list.length === 1) {
            return ElMessage.warning("风险单位数量剩余1条时不能删除");
          }
          deleteUnitList()
        },
      }),
      createFreeButtonBase({
        id: "btnSave",
        label: "保存风险单位",
        type: "success",
        disabled: opertaor.getDataAll()?.cvrg?.[0]['Term.cUniqueTermNo'] === '0125111401',
        func: () => {
          saveDatas();
        },
      }),
      createFreeButtonBase({
        id: "score",
        label: "分保试算",
        type: "success",
        disabled: opertaor.getDataAll()?.cvrg?.[0]['Term.cUniqueTermNo'] === '0125111401',
        func: () => {
          if (!selectRow1.value.cPkId)
            return ElMessage.warning("请选择一条风险单位");
          if(tryCountDisabled.value) return;
          tryCountInFoRIs(selectRow1.value);
        },
      }),
      createFreeButtonBase({
        id: "score",
        label: "工程险三者信息",
        type: "success",
        disabled: true,
        func: () => {},
      }),
      createFreeButtonBase({
        id: "downloadBtn",
        label: "下载模板",
        type: "success",
        func: () => {
          downLoadTemplate()
        },
      }),
      createFreeButtonBase({
        id: "importBtn",
        label: "导入",
        type: "success",
        func: () => {
          importTemplate()
        },
      }),
      createFreeButtonBase({
        id: "exportBtn",
        label: "导出",
        type: "success",
        func: () => {
          exportTemplate()
        },
      }),
    ],
    fromSchema: [
      {
        prop: "nSeqNo",
        inputtype: "rtinput",
        title: "序号",
        minWidth: 70,
        fixed: "left",
        readOnly: true,
      },
      {
        prop: "cDetailedAddress",
        inputtype: "rtSelectV2",
        title: "标的地址",
        minWidth: 300,
        func: (val:any, row:any) => {
          if(val) {
            const item = addressOptions.value.find((i:any) => i.cDetailedAddress === val);
            const sameItemList = addressOptions.value.filter((n:any) => n.cProvince === item.cProvince && n.cCity === item.cCity && n.cCounty === item.cCounty);
            if(sameItemList.length > 1) {
              ElMessageBox.alert('同一省、市、区/县下有多个相同标的地址，请确认是否合并', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
              })
            }
            row.cCountry = item.cCountry;
            row.cProvince = item.cProvince;
            row.cCity = item.cCity;
            row.cCounty = item.cCounty;
            row.cSuffixAddr = item.cSuffixAddr;
          } else {
            row.cCountry = ""
            row.cProvince = "";
            row.cCity = "";
            row.cCounty = "";
            row.cSuffixAddr = "";
          }
        }
      },
      {
        prop: "cRiskUnitNme",
        inputtype: "rtinput",
        title: "风险单位名称",
        minWidth: 180,
        fixed: "left",
        readOnly: true,
      },
      {
        prop: "cRiskLvlCde",
        inputtype: "rtSelectV2",
        title: "风险等级",
        minWidth: 180,
        readOnly: false,
        loadData: CRiskLvlCde_Options,
      },
      {
        prop: "cRiskLvlNme",
        inputtype: "rtinput",
        title: "风险等级",
        minWidth: 180,
        isShow: false,
      },
      {
        prop: "nAmt",
        inputtype: "rtnumber",
        title: "我司保额",
        minWidth: 180,
        readOnly: false,
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "我司保费",
        minWidth: 180,
        readOnly: false,
      },
      {
        prop: "nRetAmt",
        inputtype: "rtnumber",
        title: "自留额",
        minWidth: 180,
        readOnly: false,
        formatter:(val:any) => {
          return val ? Number(val).toFixed(2) : ""
        }
      },
      // {
      //   prop: "cRemark",
      //   inputtype: "rtinput",
      //   type: "textarea",
      //   title: "备注",
      //   minWidth: 180,
      // },
    ],
  })
);

// 合约分出情况 列表
const pageresult2 = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableconfig2 = reactive<AppTableConfig>(
  createTableEditConfig({
    title: "合约分出情况",
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "查看比例合约",
        type: "primary",
        hidden: true,
        func: () => {
          viewContInfo();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cId",
        inputtype: "rtinput",
        title: "合约标识号",
        minWidth: 180,
        fixed: "left",
        readOnly: true,
      },
      {
        prop: "cCnm",
        inputtype: "rtinput",
        title: "合约名称",
        minWidth: 180,
        readOnly: true,
      },
      {
        prop: "nAmt",
        inputtype: "rtnumber",
        title: "分出保额",
        minWidth: 180,
        readOnly: true,
      },
      {
        prop: "nPrm",
        inputtype: "rtnumber",
        title: "分出保费(批单非临分分出保费仅供参考)",
        minWidth: 350,
        readOnly: true,
      },
      {
        prop: "nprpt",
        inputtype: "rtinput",
        title: "分出比例(%)",
        minWidth: 180,
        readOnly: true,
        formatter:(val:any) => {
          if(val) {
            return (val * 100) + '%'
          }
        }
      },
    ],
  })
);

onMounted(async () => {
  init();
  // 获取基本信息
  getContData();

  // 获取风险单位划分列表数据
  getRiskData();
  // 查询风险等级
  queryRiskUnit();
  // 查询标的地址下拉选项
  queryAddress()
});

function init() {
  //批单不允许删除险位
  if (params.cAppTyp === "E") {
    tableconfig1.titleBtns.filter(
      (item) => item.id === "btnDelete"
    )[0].disabled = true;
  }
  //审核禁用拆分、删除、保存风险单位等按钮
  if (params.cAppTyp === "A" && cInwdMrk.value == "1") {
    tableconfig1.titleBtns?.forEach((item) => {
      if (
        item.id === "btnSplit" ||
        item.id === "btnSave" ||
        item.id === "btnDelete"
      ) {
        item.disabled = true;
      }
    });
  }
}

async function queryRiskUnit() {
  const beginTm = props.param?.insrnc["Base.tInsrncBgnTm"];
  const param = {
    cAppNo: params.cAppNo,
    cProdNo: params.cProdNo,
    cDptCde: user.value.companyId,
    tInsrncBgnTm: beginTm,
  };
  const riskUnitQueryInfo = params.pageName === "priceInquiry" ? await riskUnitQueryXJ(param) : await riskUnitQuery(param);
  if(riskUnitQueryInfo && riskUnitQueryInfo.code === "1" && riskUnitQueryInfo.data) {
    CRiskLvlCde_Options.value = riskUnitQueryInfo.data.map((item: any) => ({
      ...item,
      label: item.cRiskLvlCde + item.cRiskUnitNme,
      value: item.cRiskLvlCde,
    }));
  } else {
    ElMessage.error({ message: riskUnitQueryInfo.message, duration: 3000 });
  }
}

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

// 绑定特殊验证器
const exRules = {
  byrtInput: (rule: any, value: any, callback: any) => {
    // const r = freeEditRef.value?.getFromValue();
    // if (r["name"]) {
    //   callback();
    // } else {
    //   callback("姓名");
    // }
  },
};

// 拆分
function split() {
  const freeEditRef1Value = freeEditRef1.value?.getFromValue();
  const NAmt = freeEditRef1Value.nAmt; //当前保额
  const NPrm = freeEditRef1Value.nPrm; //当前保费
  const CCiMrk = freeEditRef1Value.cCiMrk; //共保类型
  const NotaxPrm = freeEditRef1Value.nNotaxPrm; //当前不含税保费
  const AddedTax = freeEditRef1Value.nAddedTax; //当前不含税保费
  let NCiAmt = 0.0; ////当前险位全单的共保保额
  let NCiPrm = 0.0; ////当前险位全单的共保保费
  let NCiAmtVar = 0.0; //当前险位全单的共保保额变化量
  let NCiPrmVar = 0.0; //当前险位全单的共保保费变化量
  let NCiNotaxPrm = 0.0; // 当前险位全单的共保不含税保费
  let NCiNotaxPrmVar = 0.0; // 当前险位全单的共保不含税保费变化量
  let NCiAddedTax = 0.0; // 当前险位全单的共保增值税
  let NCiAddedTaxVar = 0.0; // 当前险位全单的共保增值税变化量

  if (
    CCiMrk == "1" ||
    CCiMrk == "2" ||
    CCiMrk == "3" ||
    CCiMrk == "4" ||
    CCiMrk == "5"
  ) {
    //共保
    NCiAmt = freeEditRef1.value?.getValue("nCiAmt");
    NCiPrm = freeEditRef1.value?.getValue("nCiPrm");
    NCiAmtVar = freeEditRef1.value?.getValue("nCiAmtVar");
    NCiPrmVar = freeEditRef1.value?.getValue("nCiPrmVar");
    NCiNotaxPrm = freeEditRef1.value?.getValue("nCiNotaxPrm");
    NCiNotaxPrmVar = freeEditRef1.value?.getValue("nCiNotaxPrmVar");
    NCiAddedTax = freeEditRef1.value?.getValue("nCiAddedTax");
    NCiAddedTaxVar = freeEditRef1.value?.getValue("nCiAddedTaxVar");
  }
  if (NAmt == "") {
    ElMessage.error("保额不能为空!");
    return;
  }
  if (NPrm == "") {
    ElMessage.error("保费不能为空!");
    return;
  }
  //判断风险单位
  if (!checkEdrUnit()) {
    return;
  }
  //没有被选中的其它记录
  const arrData = pageresult1.list.filter(
    (item) => item.cPkId != selectRow1.value.cPkId
  );
  let unTotalAmt = 0.0; //没被选中的总保额
  let unTotalPrm = 0.0; //没被选中的总保费
  let unTotalCiAmt = 0.0; //没被选中的基于险位全单的共保总保额
  let unTotalCiPrm = 0.0; //没被选中的基于险位全单的共保总保费
  let unTotalCiAmtVar = 0.0;
  let unTotalCiPrmVar = 0.0;
  let unTotalNotaxPrm = 0.0;
  let unTotalAddedTax = 0.0;
  let unTotalNotaxPrmVar = 0.0;
  let unTotalAddedTaxVar = 0.0;
  let unTotalCiNotaxPrm = 0.0;
  let unTotalCiAddedTax = 0.0;
  let unTotalCiNotaxPrmVar = 0.0;
  let unTotalCiAddedTaxVar = 0.0;

  for (var i = 0; i < arrData.length; i++) {
    // var status = arrData[i].getAttribute("status");
    // if(status=="CANCELED" || status=="DELETED") continue;
    const oldAmt = arrData[i].nAmt;
    unTotalAmt = parseFloat(unTotalAmt) + parseFloat(oldAmt);
    const oldPrm = arrData[i].nPrm;
    unTotalPrm = parseFloat(unTotalPrm) + parseFloat(oldPrm);
    const oldNotaxPrm = arrData[i].nNotaxPrm;
    unTotalNotaxPrm = parseFloat(unTotalNotaxPrm) + parseFloat(oldNotaxPrm);
    const oldAddedTax = arrData[i].nAddedTax;
    unTotalAddedTax = parseFloat(unTotalAddedTax) + parseFloat(oldAddedTax);

    if (
      CCiMrk == "1" ||
      CCiMrk == "2" ||
      CCiMrk == "3" ||
      CCiMrk == "4" ||
      CCiMrk == "5"
    ) {
      //共保
      var oldCiAmt = arrData[i].nCiAmt;
      unTotalCiAmt = parseFloat(unTotalCiAmt) + parseFloat(oldCiAmt);
      var oldCiPrm = arrData[i].nCiPrm;
      unTotalCiPrm = parseFloat(unTotalCiPrm) + parseFloat(oldCiPrm);
      var oldCiAmtVar = arrData[i].nCiAmtVar;
      unTotalCiAmtVar = parseFloat(unTotalCiAmtVar) + parseFloat(oldCiAmtVar);
      var oldCiPrmVar = arrData[i].nCiPrmVar;
      unTotalCiPrmVar = parseFloat(unTotalCiPrmVar) + parseFloat(oldCiPrmVar);
      const oldCiNotaxPrm = arrData[i].nCiNotaxPrm;
      unTotalCiNotaxPrm = parseFloat(unTotalCiNotaxPrm) + parseFloat(oldCiNotaxPrm);
      const oldCiAddedTax = arrData[i].nCiAddedTax;
      unTotalCiAddedTax = parseFloat(unTotalCiAddedTax) + parseFloat(oldCiAddedTax);
      var oldCiNotaxPrmVar = arrData[i].nCiAmtVar;
      unTotalCiNotaxPrmVar = parseFloat(unTotalCiNotaxPrmVar) + parseFloat(oldCiNotaxPrmVar);
      var oldCiAddedTaxVar = arrData[i].nCiAddedTaxVar;
      unTotalCiAddedTaxVar = parseFloat(unTotalCiAddedTaxVar) + parseFloat(oldCiAddedTaxVar);
    }
  }

  const allAmt = parseFloat(NAmt) + parseFloat(unTotalAmt); //所有记录的总保额
  const allPrm = parseFloat(NPrm) + parseFloat(unTotalPrm); //所有记录的总保费
  const allNotaxPrm = parseFloat(NotaxPrm) + parseFloat(unTotalNotaxPrm); //所有记录的不含税保费
  const allAddedTax = parseFloat(AddedTax) + parseFloat(unTotalAddedTax); //所有记录的增值税费

  const totalAmt = freeEditRef.value?.getValue("nAmt");//总保额
  const totalPrm = freeEditRef.value?.getValue("nPrm");//总保费
  const totalNotaxPrm = freeEditRef.value?.getValue("nNotaxPrm");//总不含税保费
  const totalAddedTax = freeEditRef.value?.getValue("nAddedTax");//总增值税费

  let totalCiAmt = 0.0; //整单的共保总保额
  let totalCiPrm = 0.0; //整单的共保总保费
  let allCiAmt = 0.0; //当前记录的共保总保额和未选中的共保总保额
  let allCiPrm = 0.0; //当前记录的共保总保费和未选中的共保总保费
  let totalCiAmtVar = 0.0;
  let totalCiPrmVar = 0.0;
  let allCiAmtVar = 0.0;
  let allCiPrmVar = 0.0;

  let totalCiNotaxPrm = 0.0;
  let totalCiAddedTax = 0.0;
  let allCiNotaxPrm = 0.0;
  let allCiAddedTax = 0.0;
  let totalCiNotaxPrmVar = 0.0;
  let totalCiAddedTaxVar = 0.0;
  let allCiNotaxPrmVar = 0.0;
  let allCiAddedTaxVar = 0.0;

  if (
    CCiMrk == "1" ||
    CCiMrk == "2" ||
    CCiMrk == "3" ||
    CCiMrk == "4" ||
    CCiMrk == "5"
  ) {
    //共保
    totalCiAmt = freeEditRef1.value?.getValue("nCiAmt");
    totalCiPrm = freeEditRef1.value?.getValue("nCiPrm");
    allCiAmt = parseFloat(NCiAmt) + unTotalCiAmt;
    allCiPrm = parseFloat(NCiPrm) + unTotalCiPrm;
    totalCiAmtVar = freeEditRef1.value?.getValue("nCiAmtVar");
    totalCiPrmVar = freeEditRef1.value?.getValue("nCiPrmVar");
    allCiAmtVar = parseFloat(NCiAmtVar) + unTotalCiAmtVar;
    allCiPrmVar = parseFloat(NCiPrmVar) + unTotalCiPrmVar;

    totalCiNotaxPrm = freeEditRef1.value?.getValue("nCiNotaxPrm");
    totalCiAddedTax = freeEditRef1.value?.getValue("nCiAddedTax");
    allCiNotaxPrm = parseFloat(NCiNotaxPrm) + unTotalCiNotaxPrm;
    allCiAddedTax = parseFloat(NCiAddedTax) + unTotalCiAddedTax;
    totalCiNotaxPrmVar = freeEditRef1.value?.getValue("nCiNotaxPrmVar");
    totalCiAddedTaxVar = freeEditRef1.value?.getValue("nCiAddedTaxVar");
    allCiNotaxPrmVar = parseFloat(NCiNotaxPrmVar) + unTotalCiNotaxPrmVar;
    allCiAddedTaxVar = parseFloat(NCiAddedTaxVar) + unTotalCiAddedTaxVar;
  }

  if (parseFloat(allAmt) >= parseFloat(totalAmt)) {
    //所有记录的总保额大于总保额时，不允许拆分
    var tempAmt = parseFloat(totalAmt) - parseFloat(unTotalAmt);
    ElMessage.error(
      "当前要拆分的记录,保额不能大于:" + tempAmt.toFixed(2) + "！请您修改！"
    );
    return;
  }
  if (parseFloat(allPrm) >= parseFloat(totalPrm)) {
    //所有记录的总保费大于总保费时，不允许拆分
    var tempPrm = parseFloat(totalPrm) - parseFloat(unTotalPrm);
    ElMessage.error(
      "当前要拆分的记录,保费不能大于:" + tempPrm.toFixed(2) + "！请您修改！"
    );
    return;
  }

  //拆分时判断当前险位是否有输入风险单位名称及风险等级
  var CRiskUnitNme = freeEditRef1.value?.getValue("cRiskUnitNme");
  var CRiskLvlCde = freeEditRef1.value?.getValue("cRiskLvlCde");
  if (CRiskUnitNme == "" || CRiskUnitNme == null) {
    ElMessage.error("风险单位名称不能为空！！！");
    return;
  } else if (CRiskLvlCde == "" || CRiskLvlCde == null) {
    ElMessage.error("风险等级不能为空！！！");
    return;
  }

  const remAmt = (parseFloat(totalAmt) - parseFloat(allAmt)).toFixed(2);//要拆分的保额
  const remPrm = (parseFloat(totalPrm) - parseFloat(allPrm)).toFixed(2);//要拆分的保费
  const remNotaxPrm = (parseFloat(totalNotaxPrm) - parseFloat(allNotaxPrm)).toFixed(2);//要拆分的不含税保费
  const remAddedTax = (parseFloat(totalAddedTax) - parseFloat(allAddedTax)).toFixed(2);//要拆分的增值税

  const newRow = [{
    // ...selectRow1.value,
    ...freeEditRef1.value?.getFromValue(),
    nSeqNo: pageresult1.list.length + 1,
    cPkId: `newcPkid${pageresult1.list.length + 1}`,
    tCrtTm: "",
    tUpdTm: "",
    nAmt: remAmt,
    nAmtVar: remAmt,
    nPrm: remPrm,
    nPrmVar: remPrm,
    nNotaxPrm: remNotaxPrm,
    nNotaxPrmVar: remNotaxPrm,
    nAddedTax: remAddedTax,
    nAddedTaxVar: remAddedTax,
    cRiskUnitNme: "",
    cRiskLvlCde: null,
    _dataId: `newRow${pageresult1.list.length + 1}`,
    index: selectRow1.value.index + 1,
    nRetAmt: 0.00,
    cRemark: '',
  }]
  if (
    CCiMrk == "1" ||
    CCiMrk == "2" ||
    CCiMrk == "3" ||
    CCiMrk == "4" ||
    CCiMrk == "5"
  ) {
    //共保
    const remCiAmt = (parseFloat(totalCiAmt) - parseFloat(allCiAmt)).toFixed(2);//要拆分的共保保额
    const remCiPrm = (parseFloat(totalCiPrm) - parseFloat(allCiPrm)).toFixed(2);//要拆分的共保保费
    const remCiNotaxPrm = (parseFloat(totalCiNotaxPrm) - parseFloat(allCiNotaxPrm)).toFixed(2);//要拆分的共保不含税保费
    const remCiAddedTax = (parseFloat(totalCiAddedTax) - parseFloat(allCiAddedTax)).toFixed(2);//要拆分的共保增值税

    newRow[0].nCiAmt = remCiAmt;
    newRow[0].nCiAmtVar = remCiAmt;
    newRow[0].nCiPrm = remCiPrm;
    newRow[0].nCiPrmVar = remCiPrm;
    newRow[0].nCiNotaxPrm = remCiNotaxPrm;
    newRow[0].nCiNotaxPrmVar = remCiNotaxPrm;
    newRow[0].nCiAddedTax = remCiAddedTax;
    newRow[0].nCiAddedTaxVar = remCiAddedTax;
  }
  pageresult1.list = pageresult1.list.concat(newRow)
  const table = tableRef1.value;
  nextTick(() => {
    table.clearSelection();
    table.toggleRowSelection(newRow[0]);
  })
}

/**
 * 本次批单风险单位个数不能超过上一张报批单单的风险单位个数
 */
function checkEdrUnit() {
  // if(params.cAppTyp === "E"){
  //   tool.sendXmlByService(['<%=risk_unit%>'],"riskUnitBizAction","queryLastRiskUnit","<%=appNo%>");
  //   var edrUnit=tool.getResultMsg();
  //   if(edrUnit!=null){
  //     var rows = tool.getDW(risk_unit ).getFacade().getAllVisibleRows();//得到所有可视行
  //     if(rows.length>(edrUnit-1)){
  //       tool.alert("不允许超过上一张保批单的风险单位个数！");
  //       return false;
  //     }
  //     return true;
  //   } else {
  //     tool.alert("找不到上一次的保批单风险单位信息！");
  //     return false;
  //   }
  // }
  return true;
}

// 删除
function deleteUnitList() {
  const newList = pageresult1.list.filter((item:any) =>  item.cPkId != selectRow1.value.cPkId).map((item:any, index:any) => ({...item, nSeqNo: index + 1}))
  const freeEditRef1Value = freeEditRef1.value?.getFromValue();
  const CCiMrk = freeEditRef1Value.cCiMrk; //共保类型
  if(newList.length > 1) {
    if (
      CCiMrk == "1" ||
      CCiMrk == "2" ||
      CCiMrk == "3" ||
      CCiMrk == "4" ||
      CCiMrk == "5"
    ) {
      //共保
      const totalCiAmt = freeEditRef.value?.getValue("nCiAmt")
      const totalCiPrm = freeEditRef.value?.getValue("nCiPrm")
      const totalCiNotaxPrm = freeEditRef.value?.getValue("nCiNotaxPrm")
      const totalCiAddedTax = freeEditRef.value?.getValue("nCiAddedTax")
      const middleTotalCiAmt = newList.filter((item, index) => index < newList.length - 1).map(item => parseFloat(item.nCiAmt)).reduce((sum, num) => sum + num, 0)
      const middleTotalCiPrm = newList.filter((item, index) => index < newList.length - 1).map(item => parseFloat(item.nCiPrm)).reduce((sum, num) => sum + num, 0)
      const middleTotalCiNotaxPrm = newList.filter((item, index) => index < newList.length - 1).map(item => parseFloat(item.nCiNotaxPrm)).reduce((sum, num) => sum + num, 0)
      const middleTotalCiAddedTax = newList.filter((item, index) => index < newList.length - 1).map(item => parseFloat(item.nCiAddedTax)).reduce((sum, num) => sum + num, 0)
      const lastCiAmt = parseFloat(totalCiAmt) - middleTotalCiAmt;
      const lastCiPrm = parseFloat(totalCiPrm) - middleTotalCiPrm;
      const lastCiNotaxPrm = parseFloat(totalCiNotaxPrm) - middleTotalCiNotaxPrm;
      const lastCiAddedTax = parseFloat(totalCiAddedTax) - middleTotalCiAddedTax;
      newList[newList.length - 1].nCiAmt = lastCiAmt
      newList[newList.length - 1].nCiAmtVar = lastCiAmt
      newList[newList.length - 1].nCiPrm = lastCiPrm
      newList[newList.length - 1].nCiPrmVar = lastCiPrm
      newList[newList.length - 1].nCiNotaxPrm = lastCiNotaxPrm
      newList[newList.length - 1].nCiNotaxPrmVar = lastCiNotaxPrm
      newList[newList.length - 1].nCiAddedTax = lastCiAddedTax
      newList[newList.length - 1].nCiAddedTaxVar = lastCiAddedTax;
    }
    // 如果删除后列表数据大于1条，重新计算最后一条的保额和保费
    const totalAmt = freeEditRef.value?.getValue("nAmt")
    const totalPrm = freeEditRef.value?.getValue("nPrm")
    const totalNotaxPrm = freeEditRef.value?.getValue("nNotaxPrm")
    const totalAddedTax = freeEditRef.value?.getValue("nAddedTax")
    const middleTotalAmt = newList.filter((item, index) => index < newList.length - 1).map(item => parseFloat(item.nAmt)).reduce((sum, num) => sum + num, 0)
    const middleTotalPrm = newList.filter((item, index) => index < newList.length - 1).map(item => parseFloat(item.nPrm)).reduce((sum, num) => sum + num, 0)
    const middleTotalNotaxPrm = newList.filter((item, index) => index < newList.length - 1).map(item => parseFloat(item.nNotaxPrm)).reduce((sum, num) => sum + num, 0)
    const middleTotalAddedTax = newList.filter((item, index) => index < newList.length - 1).map(item => parseFloat(item.nAddedTax)).reduce((sum, num) => sum + num, 0)
    const lastAmt = parseFloat(totalAmt) - middleTotalAmt;
    const lastPrm = parseFloat(totalPrm) - middleTotalPrm;
    const lastNotaxPrm = parseFloat(totalNotaxPrm) - middleTotalNotaxPrm;
    const lastAddedTax = parseFloat(totalAddedTax) - middleTotalAddedTax;
    newList[newList.length - 1].nAmt = lastAmt
    newList[newList.length - 1].nAmtVar = lastAmt
    newList[newList.length - 1].nPrm = lastPrm
    newList[newList.length - 1].nPrmVar = lastPrm
    newList[newList.length - 1].nNotaxPrm = lastNotaxPrm
    newList[newList.length - 1].nNotaxPrmVar = lastNotaxPrm
    newList[newList.length - 1].nAddedTax = lastAddedTax
    newList[newList.length - 1].nAddedTaxVar = lastAddedTax
  } else if(newList.length === 1) {
    // 如果删除后列表数据等于1条，则列表中的保额和保费等于总保额和总保费
    if (
      CCiMrk == "1" ||
      CCiMrk == "2" ||
      CCiMrk == "3" ||
      CCiMrk == "4" ||
      CCiMrk == "5"
    ) {
      // 共保
      const totalCiAmt = freeEditRef.value?.getValue("nCiAmt")
      const totalCiPrm = freeEditRef.value?.getValue("nCiPrm")
      const totalCiNotaxPrm = freeEditRef.value?.getValue("nCiNotaxPrm")
      const totalCiAddedTax = freeEditRef.value?.getValue("nCiAddedTax")
      newList[0].nCiAmt = parseFloat(totalCiAmt)
      newList[0].nCiAmtVar = parseFloat(totalCiAmt)
      newList[0].nCiPrm = parseFloat(totalCiPrm)
      newList[0].nCiPrmVar = parseFloat(totalCiPrm)
      newList[0].nCiNotaxPrm = parseFloat(totalCiNotaxPrm)
      newList[0].nCiNotaxPrmVar = parseFloat(totalCiNotaxPrm)
      newList[0].nCiAddedTax = parseFloat(totalCiAddedTax)
      newList[0].nCiAddedTaxVar = parseFloat(totalCiAddedTax);
    }
    const totalAmt = freeEditRef.value?.getValue("nAmt")
    const totalPrm = freeEditRef.value?.getValue("nPrm")
    const totalNotaxPrm = freeEditRef.value?.getValue("nNotaxPrm")
    const totalAddedTax = freeEditRef.value?.getValue("nAddedTax")
    newList[0].nAmt = parseFloat(totalAmt)
    newList[0].nAmtVar = parseFloat(totalAmt)
    newList[0].nPrm = parseFloat(totalPrm)
    newList[0].nPrmVar = parseFloat(totalPrm)
    newList[0].nNotaxPrm = parseFloat(totalNotaxPrm)
    newList[0].nNotaxPrmVar = parseFloat(totalNotaxPrm)
    newList[0].nAddedTax = parseFloat(totalAddedTax)
    newList[0].nAddedTaxVar = parseFloat(totalAddedTax)
  }
  pageresult1.list = newList;
  // 清空选中数据
  selectRow1.value = {}
  // 只有选中才会有数据，所以删除需要重置表单
  freeEditRef1.value?.resetFields();
}

// 选中行
function handleSelectionChange(selection: any) {
  if (selection.length < 1) {
    selectRow1.value = {};
  } else if (selection.length > 1) {
    const table = tableRef1.value;
    if (table) {
      // 清除所有选中
      table.clearSelection();
      // 只选中当前行
      table.toggleRowSelection(selection[1], true);
    }
  } else {
    selectRow1.value = selection[0];
    freeEditRef1.value?.setFormValue({
      ...selection[0],
      nAmtVar: selection[0].nAmt,
      nPrmVar: selection[0].nPrm,
      cAmtCur: freeEditRef.value?.getValue("cAmtCur"),
      cPrmCur: freeEditRef.value?.getValue("cPrmCur"),
      cCiAmtCur: freeEditRef.value?.getValue("cAmtCur"),
      nCiPrmCur: freeEditRef.value?.getValue("cPrmCur"),
    });
    setFormItem("nAmtVar", { disabled: false });
    setFormItem("nPrmVar", { disabled: false });
    pageresult2.list = [];
  }
}

// 查询标的地址下拉选项
async function queryAddress() {
  const param = {
    cAppNo: params.cAppNo,
    cProdNo: params.cProdNo,
    cDptCde: user.value.companyId,
  }
  const queryComponentCodeInfo = params.pageName === "priceInquiry" ? await queryComponentCodeListXJ(param) : await queryComponentCodeList(param);
  if(queryComponentCodeInfo && queryComponentCodeInfo.code === '1') {
    if(queryComponentCodeInfo.data && queryComponentCodeInfo.data.length > 0) {
      addressOptions.value = queryComponentCodeInfo.data.map((item:any) => ({
        ...item,
        label: item.cDetailedAddress,
        value: item.cDetailedAddress,
      }))
      tableconfig1.fromSchema[1].loadData = addressOptions.value
    } else {
      // ElMessage.info(queryComponentCodeInfo.message)
    }
  } else {
    // ElMessage.error(queryComponentCodeInfo.message)
  }
}

function handleRowClick2(row: any) {
  selectRow2.value = row;
  index2.value = pageresult2.list.findIndex(
    (item: any) => item.NSeqNo === row.NSeqNo
  );
}

async function checkData() {
  setFromSchemaItem(
    "NAmt",
    [{ required: true, message: "请输入保额!", trigger: "blur" }],
    false
  );
  setFromSchemaItem(
    "NPrm",
    [{ required: true, message: "请输入保费!", trigger: "blur" }],
    false
  );
  setFromSchemaItem(
    "CRiskUnitNme",
    [{ required: true, message: "请输入风险单位名称!", trigger: "blur" }],
    false
  );
  setFromSchemaItem(
    "CRiskLvlCde",
    [{ required: true, message: "请输入风险等级!", trigger: "blur" }],
    false
  );

  let flag;
  //freeEditRef1 校验表单 返回布尔值
  flag = await freeEditRef1.value?.validate();
  if (!flag) {
    return false;
  }
  return true;
}

// 分保试算
async function tryCountInFoRIs(row: any) {
  if(!row.cRiskUnitNme) {
    ElMessage.error("风险单位名称不能为空")
    return
  }
  if(!row.cRiskLvlCde) {
    ElMessage.error("风险等级不能为空")
    return
  }
  if(addressOptions.value.length > 0 && !row.cDetailedAddress) {
    ElMessage.error("标的地址不能为空")
    return
  }
  // if(row.cDetailedAddress && !row.cRemark) {
  //   ElMessage.error("备注不能为空")
  //   return
  // }
  tryCountDisabled.value = true;
  pageresult2.list = [];
  const res = opertaor.getDataAll();
  const param = {
    cDocTyp: row.cDocTyp,// 单证类型 A 保单 E 批单
    cDptCde: row.cDptCde,// 机构代码
    cAppNo: params.cAppNo,// 申请单号
    nEdrPrjNo: row.nEdrPrjNo,// 批改序号
    cProdNo: row.cProdNo,// 产品编码
    nSplitSeq: row.nSeqNo,// 拆分序号
    cRiskLvlCde: row.cRiskLvlCde,// 风险等级代码
    cCiMrk: row.cCiMrk,// 共保方式
    // nCiPrpt: "",// 共保比例
    tInsrncBgnTm: res['insrnc']['Base.tInsrncBgnTm'],// 保险起期
    tInsrncEndTm: res['insrnc']['Base.tInsrncEndTm'],// 保险止期
    // tEdrBgnTm: "",// 批改生效起期 非必填
    // tEdrEndTm: "",// 批改生效止期 非必填
    cStockMrk: row.cStockMrk,// 股东业务标志
    cFacMrk: res['plyBase']['Base.cRiFacMrk'],// 临分标志(0 不需要临分 1 自主临分 2 强制临分)
    // cResvTxtl: "",// 是否农银代理业务(0 否 1 是)
    cAmtCur: freeEditRef.value?.getValue("cAmtCur"),// 保额币种
    nAmtChgRate: freeEditRef1.value?.getValue("nRmbChgRate"),// 保额币种汇率
    cPrmCur: freeEditRef.value?.getValue("cPrmCur"),// 保费币种
    nPrmChgRate: freeEditRef1.value?.getValue("nRmbChgRate"),// 保费币种汇率
    nAmt: row.nAmt,// 保额
    nAmtVar: row.nAmtVar,// 保额变化
    nPrm: row.nPrm,// 保费
    nPrmVar: row.nPrmVar,// 保费变化
    nNotaxPrm: row.nNotaxPrm,// 不含税保费
    // nNotaxPrmVar: row.nNotaxPrmVar || null,// 不含税保费变化值
    cTaxTyp: row.cTaxTyp,// 税种
    // cCollTyp: "",// 征收类型
    // cTgtCde: "",// 二级标的代码
    // cTgtCnm: "",// 二级标的名称
    // cLatestMrk: "",// 是否最新 0 否 1 是 非必传
    nRetLmt: row.nRetAmt,// 自留额
  };
  const tryCountInfo = params.pageName === "priceInquiry" ? await tryCountInFoRIXJ(param) : await tryCountInFoRI(param);
  if(tryCountInfo && tryCountInfo.code === "1" && tryCountInfo.data && tryCountInfo.data.item) {
    tryCountInfo.data.item.forEach((item:any) => {
      pageresult2.list = pageresult2.list.concat(item.value || [])
    })
  } else {
    ElMessage.error({ message: tryCountInfo.message, duration: 3000 });
  }
  tryCountDisabled.value = false;
}

// 查看比例合约
function viewContInfo() {
  dzmodal
    .open(ViewContInfoComponent, { type: "Issuer", data: {} })
    .then((res: any) => {
      if (res.type === "ok") {
      }
    });
}

// 保存风险单位
function saveDatas() {
  const CCiMrk = freeEditRef1.value?.getFromValue()?.cCiMrk; //共保类型
  let rows = pageresult1.list;
  let totalAmt = 0;
  let totalPrm = 0;
  let initCedWay = "";
  let CCiMainNo;
  let CCiMainMrk;
  let totalAddedTax = 0;
  let totalNotaxPrm = 0;
  let totalCiAmt = 0;
  let totalCiPrm = 0;
  let totalCiAddedTax = 0;
  let totalCiNotaxPrm = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if(!row.cRiskUnitNme) {
      ElMessage.error("风险单位名称不能为空")
      return
    }
    if(!row.cRiskLvlCde) {
      ElMessage.error("风险等级不能为空")
      return
    }
    if(addressOptions.value.length > 0 && !row.cDetailedAddress) {
      ElMessage.error("标的地址不能为空")
      return
    }
    // if(row.cDetailedAddress && !row.cRemark) {
    //   ElMessage.error("备注不能为空")
    //   return
    // }
    const amt = row.nAmt;
    const prm = row.nPrm;
    totalAmt = totalAmt + parseFloat(amt);
    totalPrm = totalPrm + parseFloat(prm);
    totalAddedTax = totalAddedTax + parseFloat(row.nAddedTax);
    totalNotaxPrm = totalNotaxPrm + parseFloat(row.nNotaxPrm);
    if (
      CCiMrk == "1" ||
      CCiMrk == "2" ||
      CCiMrk == "3" ||
      CCiMrk == "4" ||
      CCiMrk == "5"
    ) {
      totalCiAmt = totalCiAmt + parseFloat(row.nCiAmt);
      totalCiPrm = totalCiPrm + parseFloat(row.nCiPrm);
      totalCiAddedTax = totalCiAddedTax + parseFloat(row.nCiAddedTax);
      totalCiNotaxPrm = totalCiNotaxPrm + parseFloat(row.nCiNotaxPrm);
    }
  }
  if(totalAddedTax !== Number(freeEditRef.value?.getValue("nAddedTax"))) {
    const nAddedTax = Number(freeEditRef.value?.getValue("nAddedTax")) - pageresult1.list.slice(0,pageresult1.list.length - 1).map(i => i.nAddedTax).reduce((total, current) => total + current, 0)
    pageresult1.list[pageresult1.list.length - 1].nAddedTax = nAddedTax
    pageresult1.list[pageresult1.list.length - 1].nAddedTaxVar = nAddedTax
  }
  if(totalNotaxPrm !== Number(freeEditRef.value?.getValue("nNotaxPrm"))) {
    const nNotaxPrm = Number(freeEditRef.value?.getValue("nNotaxPrm")) - pageresult1.list.slice(0,pageresult1.list.length - 1).map(i => i.nNotaxPrm).reduce((total, current) => total + current, 0)
    pageresult1.list[pageresult1.list.length - 1].nNotaxPrm = nNotaxPrm
    pageresult1.list[pageresult1.list.length - 1].nNotaxPrmVar = nNotaxPrm
  }
  if (
    CCiMrk == "1" ||
    CCiMrk == "2" ||
    CCiMrk == "3" ||
    CCiMrk == "4" ||
    CCiMrk == "5"
  ) {
    if(totalCiAmt !== Number(freeEditRef.value?.getValue("nCiAmt"))) {
      const nCiAmt = Number(freeEditRef.value?.getValue("nCiAmt")) - pageresult1.list.slice(0,pageresult1.list.length - 1).map(i => i.nCiAmt).reduce((total, current) => total + current, 0)
      pageresult1.list[pageresult1.list.length - 1].nCiAmt = nCiAmt
      pageresult1.list[pageresult1.list.length - 1].nCiAmtVar = nCiAmt
    }
    if(totalCiPrm !== Number(freeEditRef.value?.getValue("nCiPrm"))) {
      const nCiPrm = Number(freeEditRef.value?.getValue("nCiPrm")) - pageresult1.list.slice(0,pageresult1.list.length - 1).map(i => i.nCiPrm).reduce((total, current) => total + current, 0)
      pageresult1.list[pageresult1.list.length - 1].nCiPrm = nCiPrm
      pageresult1.list[pageresult1.list.length - 1].nCiPrmVar = nCiPrm
    }
    if(totalCiAddedTax !== Number(freeEditRef.value?.getValue("nCiAddedTax"))) {
      const nCiAddedTax = Number(freeEditRef.value?.getValue("nCiAddedTax")) - pageresult1.list.slice(0,pageresult1.list.length - 1).map(i => i.nCiAddedTax).reduce((total, current) => total + current, 0)
      pageresult1.list[pageresult1.list.length - 1].nCiAddedTax = nCiAddedTax
      pageresult1.list[pageresult1.list.length - 1].nCiAddedTaxVar = nCiAddedTax
    }
    if(totalCiNotaxPrm !== Number(freeEditRef.value?.getValue("nCiNotaxPrm"))) {
      const nCiNotaxPrm = Number(freeEditRef.value?.getValue("nCiNotaxPrm")) - pageresult1.list.slice(0,pageresult1.list.length - 1).map(i => i.nCiNotaxPrm).reduce((total, current) => total + current, 0)
      pageresult1.list[pageresult1.list.length - 1].nCiNotaxPrm = nCiNotaxPrm
      pageresult1.list[pageresult1.list.length - 1].nCiNotaxPrmVar = nCiNotaxPrm
    }

  }
  var oldAmt = freeEditRef.value?.getValue("nAmt");
  var oldPrm = freeEditRef.value?.getValue("nPrm");
  if (
    totalAmt.toFixed(2) != parseFloat(oldAmt).toFixed(2) &&
    totalPrm.toFixed(2) != parseFloat(oldPrm).toFixed(2)
  ) {
    ElMessage.error(
      "总保额:" +
        oldAmt +
        ",当前所有保单风险单位记录保额总和为:" +
        totalAmt +
        ";\n总保费:" +
        oldPrm +
        ",当前所有保单风险单位记录保费总和为:" +
        totalPrm +
        ";\n请确保总保额和记录保额总和相等;总保费和记录保费总和相等时才能保存!"
    );
  } else if (
    parseFloat(totalAmt).toFixed(2) == parseFloat(oldAmt).toFixed(2) &&
    parseFloat(totalPrm).toFixed(2) != parseFloat(oldPrm).toFixed(2)
  ) {
    ElMessage.error(
      "总保费:" +
        oldPrm +
        ",当前所有保单风险单位记录保费总和为:" +
        totalPrm +
        ";\n请确保总保费和记录保费总和相等时才能保存!"
    );
  } else if (
    parseFloat(totalAmt).toFixed(2) != parseFloat(oldAmt).toFixed(2) &&
    parseFloat(totalPrm).toFixed(2) == parseFloat(oldPrm).toFixed(2)
  ) {
    ElMessage.error(
      "总保额:" +
        oldAmt +
        ",当前所有保单风险单位记录保额总和为:" +
        totalAmt +
        ";\n请确保总保额和记录保额总和相等时才能保存!"
    );
  } else {
    const param = opertaor.getFatherPage().getSaveDataParams();
    param[0].plyRiskUnitCvrgObjList = pageresult1.list.map((item:any) => {
      delete item.CProportion
      return item;
    });
    saveRiskData({ param })
      .then((result: any) => {
        if (result.code == "0") {
          ElMessage.success(result.message);
          // 更新是否保存标识
          saveFlag.value = true
          // 清空选中数据
          selectRow1.value = {}
          // 清空风险单位表单
          freeEditRef1.value?.resetFields();
          // 查询风险划分单位列表数据
          getRiskData()
        } else {
          ElMessage.error(result.message);
        }
      })
      .catch((error: any) => {
        ElMessage.error({ message: error, duration: 3000 });
      });
  }

  
}

async function getContData() {
  const param = {
    cAppNo: params.cAppNo,
    cCiMrk: params.cCiMrk,
  };
  const getReinsuredDataInfo = params.pageName === "priceInquiry" ? await getReinsuredDataXJ(param) : await getReinsuredData(param);
  if(getReinsuredDataInfo && getReinsuredDataInfo.code === "200") {
    if (getReinsuredDataInfo.data) {
      console.log("getContData", getReinsuredDataInfo.data);
      let data = {
        ...getReinsuredDataInfo.data,
        nCiShareInteger: getReinsuredDataInfo.data.cCiMrk !== "0" ? Number(getReinsuredDataInfo.data.nCiShare) * 100 : getReinsuredDataInfo.data.nCiShare,
      }
      // if(params.cCiMrk !== '0') {
      //   data = {
      //     ...res.data,
      //     nAmt: res.data.nCiAmt,
      //     nAmtVar: res.data.nCiAmtVar,
      //     nPrm: res.data.nCiPrm,
      //     nPrmVar: res.data.nCiPrmVar,
      //   }
      // } else {
      //   data = res.data
      // }
      freeEditRef.value?.setFormValue(data);
      cAmtCurOptions.value = [
        { label: data.cAmtCur, value: data.cAmtCur },
      ];
      cPrmCurOptions.value = [
        { label: data.cPrmCur, value: data.cPrmCur },
      ];
      nRmbChgRate(data.cAmtCur);
    }
  } else {
    ElMessage.error(getReinsuredDataInfo.message);
  }
}

// 获取风险单位划分列表数据
async function getRiskData() {
  const riskQueryInfo = params.pageName === "priceInquiry" ? await riskQueryDataXJ({ cAppNo: params.cAppNo }) : await riskQueryData({ cAppNo: params.cAppNo })
  if(riskQueryInfo && riskQueryInfo.code === "200") {
    pageresult1.list = riskQueryInfo.data.map((item: any, index: number) => ({
      ...item,
      index,
    }));
    _dataSet.value = riskQueryInfo.data;
  } else {
    ElMessage.error(riskQueryInfo.message);
  }
}

// 关闭弹框
const emit = defineEmits(['ok'])
const closeLoading = ref(false);
const handleBeforeClose = async (done:any) => {
  // 关闭弹框时如果保存过风险单位，需要调用再保保存险位接口，接口会返回标识
  if(closeLoading.value) return;
  closeLoading.value = true;
  if(saveFlag.value) {
    // 调用再保险位接口
    const { saveFlag, data } = await saveDataInfo() 
    closeLoading.value = false;
    if(!saveFlag) return
    emit('ok', {...data, tableList: pageresult1.list})
    done()
  } else {
    done()
  }
}

const saveDataInfo = async () => {
  let saveFlag = false;
  let data = {};
  const param = opertaor.getFatherPage().getSaveDataParams();
  param[0].plyRiskUnitCvrgObjList = pageresult1.list;

  const resInfo: any = params.pageName === "priceInquiry" ? await saveDataXJ({param}) : await saveData({param});
  if (resInfo["code"] === "1") {
    saveFlag = true;
    data = resInfo["data"]
  } else {
    ElMessage.error(resInfo["message"]);
  }

  return { saveFlag, data};
};

function getTotalNum(arr: any[]) {
  return arr.reduce((acc, item) => {
    return Number(acc) + Number(item);
  }, 0);
}

/**
 * 保额焦点失去事件
 * 当保额为“”，则给用户一个提示，然后重新输入。
 * 当当前总保额大于默认总保额时，则给用户一个提示并且重新输入。
 * 当当前总保额小于或等于默认总保额时，则计算出折人民币保额，自留额比例，保额变化，折人民币保额变化然后分别设置其值。
 * 注意  此处的参数nAmtVar 实际的意思为保额变化的值
 */
function changeNamt(nAmtVar: any, flag: any) {
  if(!selectRow1.value.cPkId) return;
  if (nAmtVar == null || nAmtVar == "") {
    ElMessage.error("保额不能为空!");
    return;
  } else if (nAmtVar == 0) {
    ElMessage.error("保额不能为0!");
    return;
  } else {
    freeEditRef1.value?.setValue("nAmt", parseFloat(nAmtVar));
    // 共保业务(计算保额和总保额的比例，根据比例计算共保保额的拆分金额)
    let nCiAmt = 0;
    const totalAmt = freeEditRef.value?.getValue("nAmt") // 总保费
    const totalCiAmt = freeEditRef.value?.getValue("nCiAmt") // 共保保额
    const nAmtRatio = parseFloat((parseFloat(nAmtVar) / parseFloat(totalAmt))) // 保额变化值与总保额的比例
    if(params.cCiMrk !== "0") {
      nCiAmt = parseFloat((parseFloat(totalCiAmt) * nAmtRatio).toFixed(2))
      selectRow1.value.nCiAmt = nCiAmt;
      selectRow1.value.nCiAmtVar = nCiAmt;
      freeEditRef1.value?.setValue("nCiAmt", nCiAmt);
      freeEditRef1.value?.setValue("nCiAmtVar", nCiAmt);
    }
    pageresult1.list.forEach(item => {
      if(item.cPkId === selectRow1.value.cPkId) {
        item.nAmt = parseFloat(nAmtVar);
        item.nAmtVar = parseFloat(nAmtVar);
        item.cProportion = nAmtRatio.toFixed(6);
        if(params.cCiMrk !== "0") {
          item.nCiAmt = nCiAmt
          item.nCiAmtVar = nCiAmt
        }
      }
    })
    selectRow1.value.nAmt = parseFloat(nAmtVar);
    selectRow1.value.nAmtVar = parseFloat(nAmtVar);
    selectRow1.value.cProportion = nAmtRatio.toFixed(6);
  }
}

// 计算折人民币汇率
function nRmbChgRate(val: any) {
  if (val !== "CNY") {
    codeListStore
      .queryCodeList({
        codeListName: "WEB_BAS_CHGRATE",
        codeListParam: { value: val },
      })
      .then((res) => {
        freeEditRef1.value?.setValue("nRmbChgRate", res[0].currency_rate);
      });
  } else {
    freeEditRef1.value?.setValue("nRmbChgRate", "1.000000");
  }
}

/**
 * 当riConfirmMrk为1时表时该页码为只读页面
 * 每选择一行时也应设置成只读
 */
function setRowReadOnly() {
  const CProdNo = params.CProdNo; //产品
  const CRiskLvlCde = freeEditRef1.value?.getValue("cRiskLvlCde");

  if (params.cAppTyp == "A") {
    // setFormItem('cRiskUnitNme',{ disabled: true })
    // setFormItem('cRiskLvlCde',{ disabled: true })
  }
  if ("010002" == CProdNo && "01065" == CRiskLvlCde) {
    freeEditRef1.value?.setDisabledAll();
    tableconfig1.titleBtns?.forEach((item) => {
      if (
        item.id === "btnSplit" ||
        item.id === "btnSave" ||
        item.id === "btnDelete"
      ) {
        item.disabled = true;
      }
    });
  }
}

/**
 * 保费焦点失去事件
 * 当保费为“”，则给用户一个提示，然后重新输入。
 * 当当前总保费大于默认总保费时，则给用户一个提示并且重新输入。
 * 当当前总保费小于或等于默认总保费时，则计算出折人民币保费。
 * 如果分出方式是毛保费方式，则计算出保费变化和折再保币种保费变化并设置其值。
 * 注意  新需求页面显示保费
 * nPrmVar 的意思是保费变化值
 */
function changePrm(nPrmVar: any, flag: any) {
  if(!selectRow1.value.cPkId) return;
  if (nPrmVar == null || nPrmVar == "") {
    ElMessage.error("保费不能为空!");
    return;
  } else if (nPrmVar == 0) {
    ElMessage.error("保费不能为0!");
    return;
  } else {
    freeEditRef1.value?.setValue("nPrm", parseFloat(nPrmVar));
    // 共保业务(计算保费和总保费的比例，根据比例计算共保保费的拆分金额)
    let nCiPrm = 0;
    let nCiNotaxPrm = 0;// 共保不含税保费
    let nCiAddedTax = 0;// 共保增值税
    let nNotaxPrm = 0;// 不含税保费
    let nAddedTax = 0;// 增值税

    const totalPrm = freeEditRef.value?.getValue("nPrm") // 总保费
    const totalNotaxPrm = freeEditRef.value?.getValue("nNotaxPrm") // 不含税保费
    const totalAddedTax = freeEditRef.value?.getValue("nAddedTax") // 增值税
    const nPrmRatio = parseFloat((parseFloat(nPrmVar) / parseFloat(totalPrm))) // 保费变化值与总保费的比例
    nAddedTax = parseFloat(financial(parseFloat(totalAddedTax) * nPrmRatio)) // 计算后的增值税
    nNotaxPrm = (parseFloat(nPrmVar) * 100 - parseFloat(nAddedTax) * 100)/100 // 计算后的不含税保费(保费 - 计算后的增值税)
    freeEditRef1.value?.setValue("nNotaxPrm", nNotaxPrm);
    freeEditRef1.value?.setValue("nNotaxPrmVar", nNotaxPrm);
    freeEditRef1.value?.setValue("nAddedTax", nAddedTax);
    freeEditRef1.value?.setValue("nAddedTaxVar", nAddedTax);
    if(params.cCiMrk !== "0") {
      const totalCiPrm = freeEditRef.value?.getValue("nCiPrm") // 共保保费
      const totalCiNotaxPrm = freeEditRef.value?.getValue("nCiNotaxPrm") // 共保不含税保费
      const totalCiAddedTax = freeEditRef.value?.getValue("nCiAddedTax") // 共保增值税
      nCiPrm = parseFloat(financial(parseFloat(totalCiPrm) * nPrmRatio))
      nCiAddedTax = parseFloat(financial(parseFloat(totalCiAddedTax) * nPrmRatio))
      nCiNotaxPrm = (parseFloat(nCiPrm) * 100 - parseFloat(nCiAddedTax) * 100)/100
      selectRow1.value.nCiPrm = nCiPrm;
      selectRow1.value.nCiPrmVar = nCiPrm;
      selectRow1.value.nCiAddedTax = nCiAddedTax;
      selectRow1.value.nCiAddedTaxVar = nCiAddedTax;
      selectRow1.value.nCiNotaxPrm = nCiNotaxPrm;
      selectRow1.value.nCiNotaxPrmVar = nCiNotaxPrm;
      freeEditRef1.value?.setValue("nCiPrm", nCiPrm);
      freeEditRef1.value?.setValue("nCiPrmVar", nCiPrm);
    }
    pageresult1.list.forEach(item => {
      if(item.cPkId === selectRow1.value.cPkId) {
        item.nPrm = parseFloat(nPrmVar);
        item.nPrmVar = parseFloat(nPrmVar);
        item.nNotaxPrm = nNotaxPrm;
        item.nNotaxPrmVar = nNotaxPrm;
        item.nAddedTax = nAddedTax;
        item.nAddedTaxVar = nAddedTax;
        if(params.cCiMrk !== "0") {
          item.nCiPrm = nCiPrm
          item.nCiPrmVar = parseFloat(nCiPrm);
          item.nCiNotaxPrm = nCiNotaxPrm;
          item.nCiNotaxPrmVar = nCiNotaxPrm;
          item.nCiAddedTax = nCiAddedTax;
          item.nCiAddedTaxVar = nCiAddedTax;
        }
      }
    })
    selectRow1.value.nPrm = parseFloat(nPrmVar);
    selectRow1.value.nPrmVar = parseFloat(nPrmVar);
    selectRow1.value.nNotaxPrm = nNotaxPrm;
    selectRow1.value.nNotaxPrmVar = nNotaxPrm;
    selectRow1.value.nAddedTax = nAddedTax;
    selectRow1.value.nAddedTaxVar = nAddedTax;

    //   if(nPrmVar == null || nPrmVar == '') {
    //     ElMessage.error("保费不能为空!");
    //     return;
    //   }else {
    //     const nRicurChgRate = freeEditRef1.value?.getValue("nRicurChgRate");//折再保币种汇率
    //     const nRiPrmVar = parseFloat(nPrmVar)*parseFloat(nRicurChgRate);//折再保币种保费变化
    //     freeEditRef1.value?.setValue("nRiPrmVar", nRiPrmVar);

    //     //重新获取rowIndex 因为存在险位序号为1 但是在页面上第二行展示  这样做成数据错误
    //     if(!selectRow1.value.nSeqNo){
    //       ElMessage.error("请选择一条数据修改 ");
    //       return  false;
    //     }
    //     const cCiMrk = freeEditRef.value?.getValue('cCiMrk');
    //     const allPrm = freeEditRef.value?.getValue('nPrm');//全单保费
    //     const allPrmVar = freeEditRef.value?.getValue('nPrmVar');//全单保费变化
    //     let allCiPrm = 0.0;//全单共保保费
    //     let allCiPrmVar = 0.0;//全单共保保费变化
    //     //营改增
    //     // var allNotaxPrm = tool.getAttrValue('<%=sum_unit%>','NNotaxPrm');//不含税保费
    //     // var allAddedTax = tool.getAttrValue('<%=sum_unit%>','NAddedTax');//增值税额
    //     // var allNotaxPrmVar = tool.getAttrValue('<%=sum_unit%>','NNotaxPrmVar');//不含税保费变化值
    //     // var allAddedTaxVar = tool.getAttrValue('<%=sum_unit%>','NAddedTaxVar');//增值税额变化值
    //     // var allCiNotaxPrm = tool.getAttrValue('<%=sum_unit%>','NCiNotaxPrm');//共保不含税保费
    //     // var allCiAddedTax = tool.getAttrValue('<%=sum_unit%>','NCiAddedTax');//共保增值税额
    //     // var allCiNotaxPrmVar = tool.getAttrValue('<%=sum_unit%>','NCiNotaxPrmVar');//共保不含税保费变化值
    //     // var allCiAddedTaxVar = tool.getAttrValue('<%=sum_unit%>','NCiAddedTaxVar');//共保增值税额变化值

    //     /* 营改增新增 */
    //     // var allNRiTaxPrm = tool.getAttrValue('<%=sum_unit%>','NRiTaxPrm');//应税保费
    //     // var allNRiTaxPrmVar = tool.getAttrValue('<%=sum_unit%>','NRiTaxPrmVar');//应税保费变化量
    //     // var allNRiNotaxPrm = tool.getAttrValue('<%=sum_unit%>','NRiNotaxPrm');//免税保费
    //     // var allNRiNotaxPrmVar = tool.getAttrValue('<%=sum_unit%>','NRiNotaxPrmVar');//免税保费变化量
    //     // var allNRiCiTaxPrm = tool.getAttrValue('<%=sum_unit%>','NRiCiTaxPrm');//共保应税保费
    //     // var allNRiCiTaxPrmVar = tool.getAttrValue('<%=sum_unit%>','NRiCiTaxPrmVar');//共保应税保费变化量
    //     // var allNRiCiNotaxPrm = tool.getAttrValue('<%=sum_unit%>','NRiCiNotaxPrm');//共保免税保费
    //     // var allNRiCiNotaxPrmVar = tool.getAttrValue('<%=sum_unit%>','NRiCiNotaxPrmVar');//共保免税保费变化量

    //     if(cCiMrk == '1' || cCiMrk =='2'||cCiMrk == '3' || cCiMrk =='4'|| cCiMrk =='5'){
    //       allCiPrm = freeEditRef1.value?.getValue('nCiPrm');
    //       allCiPrmVar = freeEditRef1.value?.getValue('nCiPrmVar');
    //     }
    //     if(params.cAppTyp === "A"){ //表示投保
    //       const nPrm = parseFloat(nPrmVar);//保费 = 保费变化
    //       const nRiPrm = (nPrm*parseFloat(nRicurChgRate)).toFixed(2);//折再保币种保费

    //       freeEditRef1.value?.setValue("nPrm",nPrm);
    //       freeEditRef1.value?.setValue("nRiPrm",nRiPrm);
    //       freeEditRef1.value?.setValue("nNetPrm",nPrm);//净保费

    //       if(flag==1){}else{
    //         if(cCiMrk == '1' || cCiMrk =='2'||cCiMrk == '3' || cCiMrk =='4'|| cCiMrk =='5'){
    //           //险位共保保费 = 险位保费/我司总保费 * 全单共保总保费
    //           const nCiPrm = (parseFloat(nPrm)/parseFloat(allPrm)*parseFloat(allCiPrm)).toFixed(2);
    //           freeEditRef1.value?.setValue('nCiPrm',nCiPrm);
    //           freeEditRef1.value?.setValue('nCiPrmVar',nCiPrm);
    //           //营改增
    //           // var NCiNotaxPrm = (parseFloat(nPrm)/parseFloat(allPrm)*parseFloat(allCiNotaxPrm)).toFixed(2);
    //           // var NCiAddedTax = (parseFloat(nPrm)/parseFloat(allPrm)*parseFloat(allCiAddedTax)).toFixed(2);
    //           // tool.setAttrValue(risk_unit,'NCiNotaxPrm',NCiNotaxPrm);
    //           // tool.setAttrValue(risk_unit,'NCiNotaxPrmVar',NCiNotaxPrm);
    //           // tool.setAttrValue(risk_unit,'NCiAddedTax',NCiAddedTax);
    //           // tool.setAttrValue(risk_unit,'NCiAddedTaxVar',NCiAddedTax);
    //           /*营改增新增 2018-07-13*/
    //           // var NRiCiTaxPrm = (parseFloat(nPrm)/parseFloat(allPrm)*parseFloat(allNRiCiTaxPrm)).toFixed(2);
    //           // var NRiCiNotaxPrm = (parseFloat(nPrm)/parseFloat(allPrm)*parseFloat(allNRiCiNotaxPrm)).toFixed(2);
    //           // tool.setAttrValue(risk_unit,'NRiCiTaxPrm',NRiCiTaxPrm);
    //           // tool.setAttrValue(risk_unit,'NRiCiTaxPrmVar',NRiCiTaxPrm);
    //           // tool.setAttrValue(risk_unit,'NRiCiNotaxPrm',NRiCiNotaxPrm);
    //           // tool.setAttrValue(risk_unit,'NRiCiNotaxPrmVar',NRiCiNotaxPrm);
    //         }
    //         //营改增
    //         // var NNotaxPrm = (parseFloat(nPrm)/parseFloat(allPrm)*parseFloat(allNotaxPrm)).toFixed(2);
    //         // var NAddedTax = (parseFloat(nPrm)/parseFloat(allPrm)*parseFloat(allAddedTax)).toFixed(2);
    //         // tool.setAttrValue(risk_unit,'NNotaxPrmVar',NNotaxPrm);
    //         // tool.setAttrValue(risk_unit,'NAddedTaxVar',NAddedTax);
    //         // tool.setAttrValue(risk_unit,'NNotaxPrm',NNotaxPrm);
    //         // tool.setAttrValue(risk_unit,'NAddedTax',NAddedTax);
    //         /*营改增新增 2018-07-13*/
    //         // var NRiTaxPrm = (parseFloat(nPrm)/parseFloat(allPrm)*parseFloat(allNRiTaxPrm)).toFixed(2);
    //         // var NRiNotaxPrm = (parseFloat(nPrm)/parseFloat(allPrm)*parseFloat(allNRiNotaxPrm)).toFixed(2);
    //         // tool.setAttrValue(risk_unit,'NRiTaxPrm',NRiTaxPrm);
    //         // tool.setAttrValue(risk_unit,'NRiTaxPrmVar',NRiTaxPrm);
    //         // tool.setAttrValue(risk_unit,'NRiNotaxPrm',NRiNotaxPrm);
    //         // tool.setAttrValue(risk_unit,'NRiNotaxPrmVar',NRiNotaxPrm);
    //       }

    //     }else{//表示批改
    // //       var oldNPrm = tool.getFieldOldValue(risk_unit, rowIndex, "NPrm");//原来保费值
    // //           var oldNPrmVar = tool.getFieldOldValue(risk_unit, rowIndex, "NPrmVar");//保费变化
    // //           oldNPrm = ("" == oldNPrm || null == oldNPrm) ? 0 : oldNPrm;
    // //           oldNPrmVar = ("" == oldNPrmVar || null == oldNPrmVar) ? 0 : oldNPrmVar;

    // //       //当前保费  = 现险位变化 - 原险位变化 + 原险位保费
    // //       var nPrmEdr = parseFloat(nPrmVar)-parseFloat(oldNPrmVar)+parseFloat(oldNPrm);
    // //       tool.setAttrValue(risk_unit,"NPrm",nPrmEdr);
    // //       var nRiPrmEdr = (parseFloat(nPrmEdr)*parseFloat(nRicurChgRate)).toFixed(2);//折再保保费
    // //       tool.setAttrValue(risk_unit,"NRiPrm",nRiPrmEdr);
    // //       tool.setAttrValue(risk_unit,"NNetPrm",nPrmEdr);//净保费
    // //       if(flag==1){}else{
    // //         if(cCiMrk == '1' || cCiMrk =='2'||cCiMrk == '3' || cCiMrk =='4'|| cCiMrk =='5'){
    // //           //共保保费变化 = 页面变动后的保费变化/我司总保费变化 * 共保总保费变化
    // //           var nCiPrmVarEdr = (parseFloat(nPrmVar)/parseFloat(allPrmVar)*parseFloat(allCiPrmVar)).toFixed(2);
    // //           tool.setAttrValue(risk_unit,'NCiPrmVar',nCiPrmVarEdr);
    // //           //险位共保保费  = 变化后险位共保保费变化 - 原险位共保保费变化 + 险位原共保保费
    // //           var oldCiPrmVar = tool.getFieldOldValue(risk_unit, rowIndex, "NCiPrmVar");
    // //           var oldCiPrm = tool.getFieldOldValue(risk_unit, rowIndex, "NCiPrm");
    // //           var nCiPrmEdr = parseFloat(nCiPrmVarEdr)-parseFloat(oldCiPrmVar)+parseFloat(oldCiPrm);
    // //           tool.setAttrValue(risk_unit,"NCiPrm",nCiPrmEdr);

    // //           var CiNotaxPrmVarEdr = (parseFloat(nPrmVar)/parseFloat(allPrmVar)*parseFloat(allCiNotaxPrmVar)).toFixed(2);
    // //           tool.setAttrValue(risk_unit,'NCiNotaxPrmVar',CiNotaxPrmVarEdr);
    // //           var oldCiNotaxPrmVar = tool.getFieldOldValue(risk_unit, rowIndex, "NCiNotaxPrmVar");
    // //           var oldCiNotaxPrm = tool.getFieldOldValue(risk_unit, rowIndex, "NCiNotaxPrm");
    // //           var CiNotaxPrmEdr = parseFloat(CiNotaxPrmVarEdr)-parseFloat(oldCiNotaxPrmVar)+parseFloat(oldCiNotaxPrm);
    // //           tool.setAttrValue(risk_unit,"NCiNotaxPrm",CiNotaxPrmEdr);

    // //           var CiNAddedTaxVarEdr = (parseFloat(nPrmVar)/parseFloat(allPrmVar)*parseFloat(allCiAddedTaxVar)).toFixed(2);

    // //           tool.setAttrValue(risk_unit,'NCiAddedTaxVar',CiNAddedTaxVarEdr);
    // //           var oldCiAddedTaxVar = tool.getFieldOldValue(risk_unit, rowIndex, "NCiAddedTaxVar");
    // //           var oldCiAddedTax = tool.getFieldOldValue(risk_unit, rowIndex, "NCiAddedTax");
    // //           var CiAddedTaxEdr = parseFloat(CiNAddedTaxVarEdr)-parseFloat(oldCiAddedTaxVar)+parseFloat(oldCiAddedTax);
    // //           tool.setAttrValue(risk_unit,"NCiAddedTax",CiAddedTaxEdr);

    // //           /*营改增 2018-07-13*/
    // //           var NRiCiTaxPrmVarEdr = (parseFloat(nPrmVar)/parseFloat(allPrmVar)*parseFloat(allNRiCiTaxPrmVar)).toFixed(2);
    // //           tool.setAttrValue(risk_unit,'NRiCiTaxPrmVar',NRiCiTaxPrmVarEdr);
    // //           var oldNRiCiTaxPrmVar = tool.getFieldOldValue(risk_unit, rowIndex, "NRiCiTaxPrmVar");
    // //           var oldNRiCiTaxPrm = tool.getFieldOldValue(risk_unit, rowIndex, "NRiCiTaxPrm");
    // //           var NRiCiTaxPrmEdr = parseFloat(NRiCiTaxPrmVarEdr)-parseFloat(oldNRiCiTaxPrmVar)+parseFloat(oldNRiCiTaxPrm);
    // //           tool.setAttrValue(risk_unit,"NRiCiTaxPrm",NRiCiTaxPrmEdr);

    // //           var NRiCiNotaxPrmVarEdr = (parseFloat(nPrmVar)/parseFloat(allPrmVar)*parseFloat(allNRiCiNotaxPrmVar)).toFixed(2);
    // //           tool.setAttrValue(risk_unit,'NRiCiNotaxPrmVar',NRiCiNotaxPrmVarEdr);
    // //           var oldNRiCiNotaxPrmVar = tool.getFieldOldValue(risk_unit, rowIndex, "NRiCiNotaxPrmVar");
    // //           var oldNRiCiNotaxPrm = tool.getFieldOldValue(risk_unit, rowIndex, "NRiCiNotaxPrm");
    // //           var NRiCiNotaxPrmEdr = parseFloat(NRiCiNotaxPrmVarEdr)-parseFloat(oldNRiCiNotaxPrmVar)+parseFloat(oldNRiCiNotaxPrm);
    // //           tool.setAttrValue(risk_unit,"NRiCiNotaxPrm",NRiCiNotaxPrmEdr);
    // //         }
    // //           //营改增
    // //       var NotaxPrmVarEdr = (parseFloat(nPrmVar)/parseFloat(allPrmVar)*parseFloat(allNotaxPrmVar)).toFixed(2);
    // //       tool.setAttrValue(risk_unit,'NNotaxPrmVar',NotaxPrmVarEdr);
    // //       var oldNotaxPrmVar = tool.getFieldOldValue(risk_unit, rowIndex, "NNotaxPrmVar");
    // //       var oldNotaxPrm = tool.getFieldOldValue(risk_unit, rowIndex, "NNotaxPrm");
    // //       var NotaxPrmEdr = parseFloat(NotaxPrmVarEdr)-parseFloat(oldNotaxPrmVar)+parseFloat(oldNotaxPrm);
    // //       tool.setAttrValue(risk_unit,"NNotaxPrm",NotaxPrmEdr);

    // //       var NAddedTaxVarEdr = (parseFloat(nPrmVar)/parseFloat(allPrmVar)*parseFloat(allAddedTaxVar)).toFixed(2);
    // //       tool.setAttrValue(risk_unit,'NAddedTaxVar',NAddedTaxVarEdr);
    // //       var oldAddedTaxVar = tool.getFieldOldValue(risk_unit, rowIndex, "NAddedTaxVar");
    // //       var oldAddedTax = tool.getFieldOldValue(risk_unit, rowIndex, "NAddedTax");
    // //       var AddedTaxEdr = parseFloat(NAddedTaxVarEdr)-parseFloat(oldAddedTaxVar)+parseFloat(oldAddedTax);
    // //       tool.setAttrValue(risk_unit,"NAddedTax",AddedTaxEdr);

    // //       /* 营改增 2018-07-13*/
    // //       var NRiTaxPrmVarEdr = (parseFloat(nPrmVar)/parseFloat(allPrmVar)*parseFloat(allNRiTaxPrmVar)).toFixed(2);
    // //       tool.setAttrValue(risk_unit,'NRiTaxPrmVar',NRiTaxPrmVarEdr);
    // //       var oldNRiTaxPrmVar = tool.getFieldOldValue(risk_unit, rowIndex, "NRiTaxPrmVar");
    // //       var oldNRiTaxPrm = tool.getFieldOldValue(risk_unit, rowIndex, "NRiTaxPrm");
    // //       var NRiTaxPrmEdr = parseFloat(NRiTaxPrmVarEdr)-parseFloat(oldNRiTaxPrmVar)+parseFloat(oldNRiTaxPrm);
    // //       tool.setAttrValue(risk_unit,"NRiTaxPrm",NRiTaxPrmEdr);

    // // var NRiNotaxPrmVarEdr = (parseFloat(nPrmVar)/parseFloat(allPrmVar)*parseFloat(allNRiNotaxPrmVar)).toFixed(2);
    // //       tool.setAttrValue(risk_unit,'NRiNotaxPrmVar',NRiNotaxPrmVarEdr);
    // //       var oldNRiNotaxPrmVar = tool.getFieldOldValue(risk_unit, rowIndex, "NRiNotaxPrmVar");
    // //       var oldNRiNotaxPrm = tool.getFieldOldValue(risk_unit, rowIndex, "NRiNotaxPrm");
    // //       var NRiNotaxPrmEdr = parseFloat(NRiNotaxPrmVarEdr)-parseFloat(oldNRiNotaxPrmVar)+parseFloat(oldNRiNotaxPrm);
    // //       tool.setAttrValue(risk_unit,"NRiNotaxPrm",NRiNotaxPrmEdr);

    // //       }
    //     }
    //     setRowReadOnly();
  }
}

const financial = (num:any, digit = 2)=> {
  if(Object.is(parseFloat(num), NaN)) {
    return num;
  }
  num = parseFloat(num);
  return (Math.round((num + Number.EPSILON) * Math.pow(10, digit)) / Math.pow(10, digit)).toFixed(digit);
}
// 下载模板
const downloadBtn:any = tableconfig1.titleBtns?.find((item:any) => item.id === 'downloadBtn')
function downLoadTemplate() {
  const param = {
    fromSchema: [
      { title: '风险单位名称', prop: 'cRiskUnitNme', inputtype: 'rtinput' },
      { title: '标的地址', prop: 'cDetailedAddress', inputtype: 'rtSelectV2', loadData: addressOptions.value },
      { title: '风险等级', prop: 'cRiskLvlCde', inputtype: 'rtSelectV2', loadData: CRiskLvlCde_Options.value },
      { title: '我司保额', prop: 'nAmt', inputtype: 'rtnumber' },
      { title: '我司保费', prop: 'nPrm', inputtype: 'rtnumber' },
      { title: '自留额', prop: 'nRetAmt', inputtype: 'rtnumber' },
    ],
    title: '风险单位划分'
  }
  downloadBtn.loading = true;
  downloadDistTemplate(param).then((res:any) => {
    downloadBtn.loading = false;
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
  }).catch((err:any) => {
    downloadBtn.loading = false;
    ElMessage.error(err.message || err)
  })
}
// 导入
const importBtn:any = tableconfig1.titleBtns?.find((item:any) => item.id === 'importBtn')
function importTemplate() {
  importBtn.loading = true

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx, .xls, .xlsm'; // 支持的文件类型
  input.onchange = () => {
    ElMessage.warning('正在导入中，请稍候…')
    if (input.files?.length) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = async (e) => {
        const base64String = e.target?.result as string;

        // ✅ 此处赋值有效
        // fileBase = base64String.split(',')[1]; // 去掉 data:image/type;base64, 前缀

        // console.log(fileBase, "0000000"); // ✅ 此处可以正常打印 Base64 字符串

        // 构建参数并请求接口
        const param:any = {
          file: base64String, // ✅ 正确传入
          cAppNo: params.cAppNo,
        };
        importUnit(param).then((res:any) => {
          importBtn.loading = false
          if (res.code === 200) {
            ElMessage.success(`导入完成：${res.data.msg}`);
            pageresult1.list = res.data.successList.map((item:any, index:any) => ({...item, nSeqNo: index + 1}))
          } else {
            ElMessage.error(res.msg || "导入失败");
          }
        }).catch((error) => {
          ElMessage.error("导入出错，请检查文件格式或内容");
          console.error("导入错误：", error);
          importBtn.loading = false
        });
      };

      reader.onerror = (e) => {
        ElMessage.error("文件读取失败");
        importBtn.loading = false
      };

      reader.readAsDataURL(file); // 启动读取
    }
  };
  input.oncancel = () => {
    importBtn.loading = false
  };
  input.click(); // 触发文件选择对话框
}
// 导出
const exportBtn:any = tableconfig1.titleBtns?.find((item:any) => item.id === 'exportBtn')
function exportTemplate() {
  exportBtn.loading = true;
  const param = {
    fromSchema: [
      { title: '风险单位名称', prop: 'cRiskUnitNme', inputtype: 'rtinput' },
      { title: '标的地址', prop: 'cDetailedAddress', inputtype: 'rtSelectV2', loadData: addressOptions.value },
      { title: '风险等级', prop: 'cRiskLvlCde', inputtype: 'rtSelectV2', loadData: CRiskLvlCde_Options.value },
      { title: '我司保额', prop: 'nAmt', inputtype: 'rtnumber' },
      { title: '我司保费', prop: 'nPrm', inputtype: 'rtnumber' },
      { title: '自留额', prop: 'nRetAmt', inputtype: 'rtnumber' },
    ],
    title: '风险单位划分',
    cAppNo: params.cAppNo,
  }
  exportUnit(param).then((res:any) => {
    exportBtn.loading = false;
    if (res.size <= 0) {
      ElMessage.error({ message: "导出出错", duration: 3000 });
      return;
    }
    const fileName = decodeURIComponent(res.headers['content-disposition'].split('filename=')[1]);
    const blob = new Blob([res.data], {
      responseType:res.headers["content-type"]
      // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8",
    });
    saveAs(blob, fileName);
  }).catch((err:any) => {
    exportBtn.loading = false;
    ElMessage.error(err.message || err)
  })
}
</script>

<style scoped>
.footer-button-container {
  text-align: right;
  padding: 10px 0 10px;
  margin-top: 20px;
}
:deep(form .el-col:nth-child(4) .el-form-item__label-wrap),
:deep(form .el-col:nth-child(6) .el-form-item__label-wrap),
:deep(form .el-col-6:nth-child(8) .el-form-item__label-wrap),
:deep(form .el-col-6:nth-child(10) .el-form-item__label-wrap),
:deep(form .el-col:nth-child(12) .el-form-item__label-wrap),
:deep(form .el-col:nth-child(14) .el-form-item__label-wrap) {
  margin-left: -20px !important;
}
:deep(.el-table__header-wrapper .el-table-column--selection .el-checkbox) {
  display: none;
}
</style>

<!-- 风险单位划分 -->
<template>
  <el-card class="app-container">
    <app-free-edit :freeEditConfig="formconfig" ref="freeEditRef" />
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef1" />
    
    <app-table
      :tableConfig="tableconfig1"
      v-model:pageresult="pageresult1"
      ref="tableRef1"
      @row-click="handleRowClick1"
      @page-change="handleQuery1(false)"
    />

    <app-table
      :tableConfig="tableconfig2"
      v-model:pageresult="pageresult2"
      ref="tableRef2"
      @row-click="handleRowClick2"
      @page-change="handleQuery2(false)"
    />

    <div class="footer-button-container">
      <span class="">
        <el-button class="custom-button">返回</el-button>
        <el-button type="primary" class="custom-button">保存</el-button>
      </span>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store";
import { useValidator } from "@/typings/useValidator";
import { useRouter, useRoute } from 'vue-router';
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: '',opCde: '' });
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
import moment from 'moment';
import {BASE, BASEBEFORE} from '@/constants/tab-constants';
import { NewUdrListService } from "@/views/pcis-new-udr-list/service/new-udr-list.service";
import { getListByCode } from '@/api/code-list-service';
const { tryCountInFoRI, saveData, riskUnitQuery } = NewUdrListService();
const dzmodal = useDzModal();
const route = useRoute();
const params = route.query.data ? JSON.parse(route.query.data) : {}
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
const selectRow2  = ref<any>({}); // 第一个列表选中行
const CRiskLvlCde_Options = ref([]); // 风险等级列表

const formconfig = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "基本信息",
    fromUi: {
      cols: 2
    },
    fromSchema: [
      {
        prop: "a",
        inputtype: "rtselect",
        title: "共保标志",
        clearable: true,
      },
      {
        prop: "b",
        inputtype: "rtnumber",
        title: "我司占比",
        clearable: true,
      },
      {
        prop: "c",
        inputtype: "rtnumber",
        title: "我司总保额",
        itemWidth: 0.5,
        clearable: true,
      },
      {
        prop: "NContChgRate",
        inputtype: "rtselect",
        title: "",
        itemWidth: 0.5,
        clearable: true,
      },
      {
        prop: "d",
        inputtype: "rtnumber",
        title: "我司总保费",
        itemWidth: 0.5,
        clearable: true,
      },
      {
        prop: "NContChgRate",
        inputtype: "rtselect",
        title: "",
        itemWidth: 0.5,
        clearable: true,
      },
      {
        prop: "e",
        inputtype: "rtnumber",
        title: "我司总保额变化量",
        itemWidth: 0.5,
        clearable: true,
      },
      {
        prop: "NContChgRate",
        inputtype: "rtselect",
        title: "",
        itemWidth: 0.5,
        clearable: true,
      },
      {
        prop: "f",
        inputtype: "rtnumber",
        title: "我司总保费变化量",
        itemWidth: 0.5,
        clearable: true,
      },
      {
        prop: "NContChgRate",
        inputtype: "rtselect",
        title: "",
        itemWidth: 0.5,
        clearable: true,
      },
    ]
  })
)

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "风险累积信息",
    fromUi: {
      cols: 2
    },
    // endBtnsPosition: "right",
    // endBtns: [
    //   createFreeButtonBase({
    //     type: "primary",
    //     label: "查询",
    //     func: async () => {
    //       handleQuery1();
    //     },
    //   }),
    //   createFreeButtonBase({
    //     label: "重置",
    //     func: () => {
    //       freeEditRef1.value?.setFormValue({
    //         cKindNo: "",
    //         cStatus: "",
    //       });
    //       handleQuery1();
    //       // freeEditRef.value?.resetForm();
    //     },
    //   }),
    // ],
    fromSchema: [
      {
        prop: "CRiskUnitNme",
        inputtype: "rtinput",
        title: "风险单位名称",
        rules: [getRules("required", {})],
        clearable: true,
        readOnly: true,
        disabled: true,
        func: (val) => {
          if (val) {
            // const nSeqNo = freeEditRef1.value?.getFromValue("NSeqNo");
            // if (nSeqNo) editListData1(index1.value, 'CRiskUnitNme', val);
          }
        }
      },
      {
        prop: "CRiskLvlCde",
        inputtype: "rtselect",
        title: "风险等级",
        rules: [getRules("required", {})],
        clearable: true,
        readOnly: true,
        disabled: true,
        func: (val) => {
          if (val) {
            // const nSeqNo = freeEditRef1.value?.getFromValue("NSeqNo");
            // if (nSeqNo) {
            //   editListData1(index1.value, 'CRiskLvlCde', val);
            //   for (const retlmt of retLmtSet.value) {
            //     if (retlmt.value === val) {
            //       freeEditRef1.value?.setFormValue({
            //         NRetAmt: retlmt.label,
            //       })
            //       pageresult1.list[index1.value].NRetAmt = retlmt.label;
            //     }
            //   }
            // }
          }
        }
      },
      {
        prop: "NRetAmt",
        inputtype: "rtnumber",
        title: "我司保额变化",
        itemWidth: 0.5,
        clearable: true,
      },
      {
        prop: "NContChgRate",
        inputtype: "rtselect",
        title: "",
        itemWidth: 0.5,
        clearable: true,
      },
      {
        prop: "NRetAmt",
        inputtype: "rtinput",
        title: "我司保费变化",
        itemWidth: 0.5,
        clearable: true,
      },
      {
        prop: "NContChgRate",
        inputtype: "rtselect",
        title: "",
        itemWidth: 0.5,
        clearable: true,
      },
      {
        prop: "NRetPrpt",
        inputtype: "rtnumber",
        title: "我司保额",
        rules: [getRules("required", {})],
        clearable: true,
      },
      {
        prop: "NFacEnterRetLmt",
        inputtype: "rtnumber",
        title: "我司保费",
        clearable: true,
      },
      {
        prop: "NFacEnterRetLmt",
        inputtype: "rtnumber",
        title: "自留额",
        rules: [getRules("required", {})],
        clearable: true,
      },
      {
        prop: "NFacEnterRetLmt",
        inputtype: "rtnumber",
        title: "法定自留额",
        clearable: true,
      },
      {
        prop: "NFacEnterRetLmt",
        inputtype: "rtinput",
        title: "共保保额",
        itemWidth: 0.5,
        clearable: true,
      },
      {
        prop: "NContChgRate",
        inputtype: "rtselect",
        title: "",
        itemWidth: 0.5,
        clearable: true,
      },
      {
        prop: "NFacEnterRetLmt",
        inputtype: "rtinput",
        title: "共保保费",
        itemWidth: 0.5,
        clearable: true,
      },
      {
        prop: "NContChgRate",
        inputtype: "rtselect",
        title: "",
        itemWidth: 0.5,
        clearable: true,
      },
      {
        prop: "NContaintaxPrmVar",
        inputtype: "rtnumber",
        title: "共保总保额变化量",
        clearable: true,
      },
      {
        prop: "NContaintaxPrmVar",
        inputtype: "rtnumber",
        title: "共保总保费变化量",
        clearable: true,
      },
      {
        prop: "CRemark",
        inputtype: "rtinput",
        title: "备注",
        type: "textarea",
        rows: 4,
        itemWidth: 2,
        clearable: true,
      },
    ],
  })
);


// 风险单位信息 列表同步修改
function editListData1(index: number,key: any,value: any) {
  pageresult1.list[index][key] = value;
}

// 风险单位信息 修改表单项
function setFromSchemaItem(key: any,rules: any, disabled: any) {
  const items = freeEditRef1.value?.getFromSchemaItem(key);
  if(!disabled) items.disabled = disabled;
  if(rules) items.rules = rules;
}

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
    tableBtnType: "btn",
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "拆分",
        type: "success",
        func: () => {
          if(index1.value == -1) return ElMessage.warning("请选择一条风险单位");
          getListByCode('select_status_type_by_cProdNo', { cProdNo: params.value.CProdNo }).then((res: any) => {
            if (res.code === 200) {
              if (res.data[0].cStatusType === 'A' || res.data[0].cStatusType === 'B') {
                ElMessage.error({ message: '每人保额或各险别的每人保额相同，不能拆分风险单位', duration: 3000 });
                return;
              } else {
                confirm();
              }
            } else {
              confirm();
            }
          });
        },
      }),
      createFreeButtonBase({
        id: "score",
        label: "删除",
        type: "success",
        func: () => {
          if(index1.value == -1) return ElMessage.warning("请选择一条风险单位");
          pageresult1.list.splice(index1.value, 1);
          index1.value = -1;
          // 只有选中才会有数据，所以删除需要重置表单
          freeEditRef1.value?.resetFields();
        },
      }),
      createFreeButtonBase({
        id: "score",
        label: "保存风险单位",
        type: "success",
        func: () => {
          if(index1.value == -1) return ElMessage.warning("请选择一条风险单位");
          saveDatas(pageresult1.list[index1.value])
        },
      }),
      createFreeButtonBase({
        id: "score",
        label: "分保试算",
        type: "success",
        func: () => {
          if(index1.value == -1) return ElMessage.warning("请选择一条风险单位");
          tryCountInFoRIs(pageresult1.list[index1.value])
        },
      }),
      createFreeButtonBase({
        id: "score",
        label: "工程险三者信息",
        type: "success",
        func: () => {
          
        },
      }),
    ],
    fromSchema: [
      {
        prop: "NSeqNo",
        inputtype: "rtinput",
        title: "序号",
        minWidth: 70,
        fixed: 'left',
        readOnly: true,
      },
      {
        prop: "CRiskUnitNme",
        inputtype: "rtinput",
        title: "风险单位名称",
        minWidth: 180,
        fixed: 'left',
        readOnly: true,
      },
      {
        prop: "CRiskLvlCde",
        inputtype: "rtinput",
        title: "风险等级",
        minWidth: 180,
        loadData: CRiskLvlCde_Options,
        readOnly: true,
      },
      {
        prop: "totalTaxAmt",
        inputtype: "rtnumber",
        title: "我司保额",
        minWidth: 180,
        readOnly: false,
      },
      {
        prop: "NRates",
        inputtype: "rtinput",
        title: "我司保费",
        minWidth: 180,
        readOnly: false,
      },
      {
        prop: "NContaintaxPrm",
        inputtype: "rtnumber",
        title: "自留额",
        minWidth: 180,
        readOnly: false,
      },
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
        func: () => {
          viewContInfo();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CContId",
        inputtype: "rtinput",
        title: "合约标识号",
        minWidth: 180,
        fixed: 'left',
        readOnly: true,
      },
      {
        prop: "CContCde",
        inputtype: "rtinput",
        title: "合约名称",
        minWidth: 180,
        readOnly: true,
      },
      {
        prop: "NCedAmt",
        inputtype: "rtnumber",
        title: "分出保额",
        minWidth: 180,
        readOnly: true,
      },
      {
        prop: "NCedPrm",
        inputtype: "rtnumber",
        title: "分出保费(批单非临分分出保费仅供参考)",
        minWidth: 350,
        readOnly: true,
      },
      {
        prop: "NCedPrpt",
        inputtype: "rtinput",
        title: "分出比例(%)",
        minWidth: 180,
        readOnly: true,
      },
    ],
  })
);

onMounted(async () => {
  pageresult1.list = [
    {
      // 设置全部假数据，基于表单
      NSeqNo: 1,
      CRiskUnitNme: '测试11111',
      CRiskLvlCde: 'A',
      NAmt: 1000000,
      CAmtCur: 'CNY',
      NPrm: 100000,
      CPrmCur: 'CNY',
      NRmbAmt: 1000000,
      NRmbChgRate: 1,
      CCedPrmWay: 'G',
      NRiPrm: 100000,
      CRiprmCur: 'CNY',
      NRicurChgRate: 1,
      NTaxAmt: 10000,
      NAmtVar: 10000,
      NPrmVar: 10000,
      NRates: 10,
      NCiPrm: 100000,
      CVatMrk: '0',
      CCiMrk: '0',
      NCiAmt: 1000000,
      NCiPrpt: 10,
      totalTaxAmt: 10000,
      NContaintaxPrm: 10000,
      NContaintaxPrmVar: 10000,
      NRetAmt: 100000,
      NRetPrpt: 10,
      CFacMrk: '0',
      NFacEnterRetLmt: 100000,
      CRemark: '备注',
    },
    {
      // 设置全部假数据，基于表单
      NSeqNo: 12,
      CRiskUnitNme: '1231231211',
      CRiskLvlCde: 'B',
      NAmt: 1000000,
      CAmtCur: 'CNY',
      NPrm: 100000,
      CPrmCur: 'CNY',
      NRmbAmt: 1000000,
      NRmbChgRate: 1,
      CCedPrmWay: 'N',
      NRiPrm: 100000,
      CRiprmCur: 'CNY',
      NRicurChgRate: 1,
      NTaxAmt: 10000,
      NAmtVar: 10000,
      NPrmVar: 10000,
      NRates: 10,
      NCiPrm: 100000,
      CVatMrk: '1',
      CCiMrk: '1',
      NCiAmt: 1000000,
      NCiPrpt: 10,
      totalTaxAmt: 10000,
      NContaintaxPrm: 10000,
      NContaintaxPrmVar: 10000,
      NRetAmt: 100000,
      NRetPrpt: 10,
      CFacMrk: '0',
      NFacEnterRetLmt: 100000,
      CRemark: '备注',
    }
  ];
  pageresult1.total = 1;

  pageresult2.list = [
    {
      NSeqNo: "1",
      CRiskUnitNme: "合约1",
      NCedAmt: "1000000",
      NCedPrm: "100000",
      NCedPrpt: "10",
      CContFlag: 'CP1',
    }
  ];
  pageresult2.total = 1;

  CRiskLvlCde_Options.value = [];
  // 挂账时间
  let tDueTm;
  if (params.value.CAppTyp === 'A') {
    const beginTm = operator.getEditerByName(BASEBEFORE, 'Base.TInsrncBgnTm').value;
    tDueTm = moment(beginTm).isBefore(moment(Date.now())) ? Date.now() : beginTm;
  }
  tDueTm = moment(tDueTm).format('YYYY/MM/DD');

  const param = {
    cAppNo: params.value.CAppNo,
    cProdNo: params.value.CProdNo,
    cDptCde: user.value.companyId,
    tInsrncBgnTm: tDueTm,
  };

  riskUnitQuery(param).then((result: any) => {
    if (result.code === '1' && result.data) {
      dataSet.value = result.data.PlyRiskUnitList;
      retLmtSet.value = result.data.cRiskLvlRetLmt; // 第二个 自留额集合
      // codeListMap.value = result.data.codeList; //原文件没用到，先不用
      CRiskLvlCde_Options.value = result.data.cRiskLvlCde;
      Object.assign(freeEditRef1.value?.getFromValue() , result.data.totalMap);

      dataSet.value.forEach((risks: any) => {
        pageresult1.list.push(risks);
      });
    } else if (result.code === '0') {
      ElMessage.error({ message: result.message, duration: 3000 });
    }
  }).catch((error: any) => {
    console.log('出错了', error);
    ElMessage.error({ message: '后台服务异常,请联系管理员', duration: 3000 });
  });
});

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

/** 查询 */
function handleQuery1(flag?: boolean) {
  const r = tableRef1.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef1.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  getBasicKindList(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult1.list = [];
        pageresult1.list = data.result;
        pageresult1.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
function handleQuery2(flag?: boolean) {
  const r = tableRef2.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef1.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  tryCountInFoRI(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult2.list = [];
        pageresult2.list = data.result;
        pageresult2.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}

// 选中行
function handleRowClick1(row: any) {
  selectRow1.value = row;
  index1.value = pageresult1.list.findIndex((item: any) => item.NSeqNo === row.NSeqNo);
  freeEditRef1.value?.setFormValue(row);
  setFromSchemaItem('CRiskUnitNme',null, false);
  setFromSchemaItem('CRiskLvlCde',null, false);
  setFromSchemaItem('NAmt',null, false);
  setFromSchemaItem('NPrm',null, false); 
}
function handleRowClick2(row: any) {
  selectRow2.value = row;
  index2.value = pageresult2.list.findIndex((item: any) => item.NSeqNo === row.NSeqNo);
}

async function checkData() {
  setFromSchemaItem('NAmt', [{ required: true, message: '请输入保额!', trigger: 'blur' }], false); 
  setFromSchemaItem('NPrm', [{ required: true, message: '请输入保费!', trigger: 'blur' }], false); 
  setFromSchemaItem('CRiskUnitNme', [{ required: true, message: '请输入风险单位名称!', trigger: 'blur' }], false); 
  setFromSchemaItem('CRiskLvlCde', [{ required: true, message: '请输入风险等级!', trigger: 'blur' }], false); 

  let flag;
  //freeEditRef1 校验表单 返回布尔值
  flag = await freeEditRef1.value?.validate();
  if (!flag) {
    return false;
  }
  return true;
}


// 拆分
async function confirm() {
  const flag = await checkData(); //校验
  if (!flag) {
    return;
  }

  const riskItems = pageresult1.list;
  const nowRiskData = freeEditRef1.value?.getFromValue();

  let sumPrm = 0.0;
  let sumAmt = 0.0;
  let sumTaxAmt = 0.0;
  let sumContaintaxPrm = 0.0;
  let sumContaintaxPrmVar = 0.0;

  const nSeqNo = nowRiskData.NSeqNo;

  riskItems.forEach((risk: any) => {
    if (nSeqNo !== risk.NSeqNo) {
      sumPrm += parseFloat(risk.NPrm);
      sumAmt += Number(parseFloat(risk.NAmt));
      sumTaxAmt += parseFloat(risk.NTaxAmt);
      sumContaintaxPrm += parseFloat(risk.NContaintaxPrm);
      sumContaintaxPrmVar += parseFloat(risk.NContaintaxPrmVar);
    }
  });
  sumAmt += Number(parseFloat(nowRiskData.NAmt+''));
  sumPrm += parseFloat(nowRiskData.NPrm+'');
  sumTaxAmt += parseFloat(nowRiskData.NTaxAmt+'');
  sumContaintaxPrm += parseFloat(nowRiskData.NContaintaxPrm+'');
  sumContaintaxPrmVar += parseFloat(nowRiskData.NContaintaxPrmVar+'');

  // 字段涉及的校验，之前的代码字段是2个，现在是1个，待核实
  // const totalAmt = freeConfig.totalAmt; //总保额 totalAmt 之前有，现在没了
  // const totalPrm = freeConfig.totalPrm; //净保费 totalPrm or NPrm
  // const totalTaxAmt = freeConfig.totalTaxAmt; //增值税 totalTaxAmt or NTaxAmt
  // const totalContaintaxPrm = freeConfig.totalContaintaxPrm; //毛保费 totalContaintaxPrm or NContaintaxPrm
  // const totalContaintaxPrmVar = freeConfig.totalContaintaxPrmVar; //毛保费变化 totalContaintaxPrmVar 之前有，现在没了

  // if (Number(totalAmt) <= sumAmt) {
  //   ElMessage.info({ message: `当前要拆分的记录,保额不能大于:${sumAmt}！请您修改！`, duration: 3000 });
  //   return;
  // }

  // if (Number(totalPrm) <= sumPrm) {
  //   ElMessage.info({ message: `当前要拆分的记录,保额不能大于:${sumPrm}！请您修改！`, duration: 3000 });
  //   return;
  // }

  // pageresult1.list[contractIndex.value] = nowRiskData;

  pageresult1.list = [];
  pageresult1.list = [...pageresult1.list];
  pageresult1.list.splice(0, pageresult1.list.length);

  for (const risks of pageresult1.list) {
    pageresult1.list.push(risks);
  }

  const newRiskData = { ...nowRiskData };

  // newRiskData.NAmt = Number((totalAmt - sumAmt).toFixed(2));
  // newRiskData.NPrm = Number((totalPrm - sumPrm).toFixed(2));
  // newRiskData.NTaxAmt = 0;
  // newRiskData.NContaintaxPrm = Number((Number(totalContaintaxPrm) - sumContaintaxPrm).toFixed(2));
  // newRiskData.NContaintaxPrmVar = Number((Number(totalContaintaxPrmVar) - sumContaintaxPrmVar).toFixed(2));

  newRiskData.NSeqNo = riskItems.length + 1;
  newRiskData.CRiskLvlCde = '';
  newRiskData.CRiskUnitNme = '';
  // newRiskData.CPkId = UUID();
  newRiskData.CPkId = '';

  // freeEditRef1.value.resetFields();

  // changePrm();
  // changeAmt();

  pageresult1.list.push(newRiskData);
}

// 修改保费
const changePrm = () => {
  // // 分出方式
  // const cCedPrmWay = freeEditRef2.value?.getValue('CCedPrmWay');
  // // 净保费
  // const nPrm = freeEditRef2.value?.getValue('NPrm');
  // // 折人民币汇率
  // const NRmbChgRate = freeEditRef1.value?.getValue('NRmbChgRate');
  // if (cCedPrmWay === 'G') {
  //   if (nPrm == null || nPrm === '') {
  //     ElMessage.info({ message: '保费不能为空!', duration: 3000 });
  //     return;
  //   } else {
  //     // 折再保币种保费
  //     const nRiPrm = Number((parseFloat(nPrm+'') * parseFloat(NRmbChgRate)).toFixed(2));
  //     freeEditRef2.value?.setValue('NRiPrm', nRiPrm);
  //     if ('PLY_UW_PROCESS_SCENE' === params.value.scene) {
  //       // 保费变化
  //       const nPrmVar = parseFloat(nPrm+'');
  //       // 折再保币种保费变化
  //       const nRiPrmVar = Number((parseFloat(nPrm+'') * parseFloat(NRmbChgRate)).toFixed(2));
  //       // 保费变化
  //       freeEditRef2.value?.setValue('NPrmVar', nPrmVar);
  //       // 折再保币种保费变化
  //       freeEditRef2.value?.setValue('NRiPrmVar', nRiPrmVar);
  //       // 设置净保费
  //       freeEditRef2.value?.setValue('NNetPrm', nPrm);
  //     }
  //   }
  // }

  // 之前是两个form，现在是一个，这里有问题
  // 计算增值税
  // const NAllPrm = freeEditRef1.value?.getValue('totalPrm');// 整单保费
  // const NAllTax = freeEditRef1.value?.getValue('totalTaxAmt');// 整单增值税
  // const thisTax = (parseFloat(nPrm+'') / parseFloat(NAllPrm+'') * parseFloat(NAllTax+'')).toFixed(2);
  // freeEditRef2.value?.setValue('NTaxAmt', thisTax);
  // // 计算毛保费
  // const NAllContaintaxPrm = freeEditRef1.value?.getValue('totalContaintaxPrm');// 整单毛保费
  // const thisContaintaxPrm = (parseFloat(nPrm+'') / parseFloat(NAllPrm+'') * parseFloat(NAllContaintaxPrm+'')).toFixed(2);
  // freeEditRef2.value?.setValue('NContaintaxPrm', thisContaintaxPrm);
  // // 计算毛保费变化量
  // const NAllContaintaxPrmVar = freeEditRef1.value?.getValue('totalContaintaxPrmVar');// 整单毛保费变化量
  // const thisContaintaxPrmVar = (parseFloat(nPrm+'') / parseFloat(NAllPrm+'') * parseFloat(NAllContaintaxPrmVar+'')).toFixed(2);
  // freeEditRef2.value?.setValue('NContaintaxPrmVar', thisContaintaxPrmVar);
}


// 修改保额
function changeAmt() {
  // const nAmt = freeEditRef2.value?.getValue('NAmt');
  // if (!nAmt) {
  //   ElMessage.info({ message: '保额不能为空!', duration: 3000 });
  //   return;
  // }

  // // 折人民币汇率
  // const nRmbChgRate = freeEditRef2.value?.getValue('NRmbChgRate');
  // // 计算出折人民币保额
  // const nRmbAmt = Number((parseFloat(nAmt+'') * parseFloat(nRmbChgRate)).toFixed(2));
  // // 自留额
  // const nRetAmt = freeEditRef2.value?.getValue('NRetAmt');
  // // 折人民币保额变化
  // freeEditRef2.value?.setValue('NRmbAmtVar', nRmbAmt);
  // // 折人民币保额
  // freeEditRef2.value?.setValue('nRmbAmt', nRmbAmt);

  // let nRetPrpt = 1.00;
  // if (Number(parseFloat(nRetAmt+'')) < Number(parseFloat(nRmbAmt+''))) {
  //   nRetPrpt = Number((parseFloat(nRetAmt+'') / parseFloat(nRmbAmt+'')).toFixed(2));
  // }
  // // 设置自留额比例
  // freeEditRef2.value?.setValue('NRetPrpt', nRetPrpt);

  // if ('PLY_UW_PROCESS_SCENE' === params.value.scene) {
  //   // 折人民币保额变化
  //   const nRmbAmtVar = Number((nAmt * parseFloat(nRmbChgRate)).toFixed(2));
  //   // 设置保额变化
  //   freeEditRef2.value?.setValue('NAmtVar', nAmt);
  //   // 设置折人民币保额变化
  //   freeEditRef2.value?.setValue('NRmbAmtVar', nRmbAmtVar);
  // }
}

// 分保试算
function tryCountInFoRIs(row: any) {
  pageresult2.list = [];
  const param = {
    cAppNo: user.value.companyId,
    nSeqNo: row.nSeqNo,
  };
  tryCountInFoRI(param).then((result: any) => {
    if (result.data) {
      dataSet.value = result.data;
      for (const contCed of dataSet.value) {
        // contCed['CContCde'] = 'CP1;CS3  分出成数合约';
        if (contCed.CContCde.indexOf(';') !== -1) {
          const array = contCed.CContCde.split(';');
          contCed.CContCde = array[1];
          contCed.CContFlag = array[0];
        }
        pageresult2.list.push(contCed);
      }
    }
  }).catch((error: any) => {
    console.log('出错了', error);
    ElMessage.error({ message: '后台服务异常,请联系管理员', duration: 3000 });
  });
}

// 查看比例合约
function viewContInfo() {
  if(Object.keys(selectRow2.value).length == 0) return ElMessage.info({ message: '请选择一条合约信息', duration: 3000 });
  if (selectRow2.value.CContFlag !== 'CP1' && selectRow2.value.CContFlag !== 'CP3') {
    ElMessage.info({ message: '请选择比例合约', duration: 3000 });
    return;
  }
  const data = {
    CAppNo: params.value?.CAppNo,
    param: params,
    contCed: selectRow2,
  }
  console.log('data',data)
  dzmodal
    .open(ViewContInfoComponent, { type: "Issuer", data })
    .then((res: any) => {
      if (res.type === "ok") {

      }
    });
}

// 保存风险单位
function saveDatas(row: any) {
  const riskDataList = pageresult1.list;
  let nAmt = 0.0;
  let nPrm = 0.0;
  riskDataList.forEach((data: any) => {
    nAmt += parseFloat(data.NAmt);
    nPrm += parseFloat(data.NPrm);
  });
  nPrm = Math.round(nPrm * 100) / 100;
  // const totalAmt = freeConfig.totalAmt; // 总保额
  // const totalPrm = freeConfig.totalPrm; // 净保费

  // if (totalAmt !== nAmt || totalPrm !== nPrm) {
  //   ElMessage.info({ message: '风险单位信息的保额或保费的总数需要与总保额或总保费相同才能进行保存操作' });
  //   return;
  // }

  const paramsData = {
    cAppNo: params.value.CAppNo,
    items: riskDataList.map((item: any) => ({
      ...item,
      CUpdCde: user.value.opCde,
      TUpdTm: new Date(),
    })),
  };

  saveData(paramsData).then((result: any) => {
    if (result.code) {
      dataSet.value = result.data;
      ElMessage.success({ message: result.message, duration: 3000 });
    }
  }).catch((error: any) => {
    console.log('出错了', error);
    ElMessage.error({ message: '后台服务异常,请联系管理员', duration: 3000 });
  });
};
</script>

<style scoped>
.footer-button-container {
  text-align: right;
  padding: 10px 0 10px;
  margin-top: 20px;
}
</style>

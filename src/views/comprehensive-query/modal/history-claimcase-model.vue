<!-- 综合查询-历史赔案 -->
<template>
  <div>
    <el-dialog v-model="maindialogVisible" width="65%" title="历史赔案">

      <el-tabs v-model="tabS" class="tabsSty" @tab-change="tabChangeTb">
        <el-tab-pane label="投保人" name="01">

        </el-tab-pane>
        <el-tab-pane label="被保人" name="02">
          <!-- <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef2" /> -->
        </el-tab-pane>

      </el-tabs>

      <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />

      <el-tabs v-model="activeTab" type="border-card" class="tabsSty" @tab-change="tabChange">
        <el-tab-pane label="车" name="01">

        </el-tab-pane>
        <el-tab-pane label="财" name="02">
          <!-- <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef2" /> -->
        </el-tab-pane>
        <el-tab-pane label="人" name="03">
          <!-- <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef3" /> -->
        </el-tab-pane>
      </el-tabs>
      <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef" />
    </el-dialog>
  </div>
  <!-- 查看明细 -->
  <el-dialog v-if="dialogVisible" v-model="dialogVisible" title="查看明细" width="90%">
    <app-table :tableConfig="tableconfig1" v-model:pageresult="pageresult1" ref="tableRef" />
  </el-dialog>

  <!-- 赔案明细 -->
  <el-dialog v-if="dialogVisibleDetail" v-model="dialogVisibleDetail" title="赔案明细" width="90%">
    <app-table :tableConfig="tableconfig2" v-model:pageresult="pageresult2" ref="tableRef" />
  </el-dialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { defineComponent, ref } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElTabs, ElTabPane, ElTable, ElTableColumn } from 'element-plus';

import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";

import { PcisQueryService } from "@/views/payinfoManagement/service/pcis-query-service";
import { defineEmits, onMounted } from "vue";

import { dataOpertaor } from "@/store/modules/data-opertaor";

const props = defineProps({
  idxParam: Object
});
const opertaor = dataOpertaor(props.idxParam?.opertaorProps);

const emits = defineEmits(["ok", "cancel"]);
const pcisQueryService = new PcisQueryService();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const { getRules } = useValidator();

const tabS = ref('01')
const activeTab = ref('01');
const detailTableData = ref();
const maindialogVisible = ref(true)
const dialogVisible = ref(false)
const dialogVisibleDetail = ref(false)
const yearData = ref({})   // 年度数据   01车  02财  03人

const fromSchema = {
  TBfromSchema: [
    {
      prop: "cAppNme",
      inputtype: "rtinput",
      title: "投保人名称",
      disabled: true,
    },
    {
      prop: "cCertfCls",
      // inputtype: "rtinput",
      title: "投保人证件类型",
      inputtype: "rtselect",
      typeCode: "ACCEPTING_OFFICER",
      disabled: true,
    },
    {
      prop: "cCertfCde",
      inputtype: "rtinput",
      title: "投保人证件号码",
      disabled: true,
    },
    {
      prop:"cClntMrk",
      inputtype: "rtselect",
      title: "投保人性质",
      disabled: true,
      loadData: [
        {
          label: "个人",
          value: "1"
        },
        {
          label: "法人",
          value: "0"
        }
      ]
    },
    {
      prop: "cCstomerType",
      inputtype: "rtselect",
      title: "查询类型",
      loadData: [
        { label: "投保人", value: "01" },
        { label: "被保人", value: "02" },
        { label: "投保人/被保人", value: "03" },
      ],
      // disabled: true,
    },
  ],

  BBfromSchema: [
    {
      prop: "cInsuredNme",
      inputtype: "rtinput",
      title: "被保人名称",
      disabled: true,
    },
    {
      prop: "cCertfCls",
      // inputtype: "rtinput",
      title: "被保人证件类型",
      inputtype: "rtselect",
      typeCode: "ACCEPTING_OFFICER",
      disabled: true,
    },
    {
      prop: "cCertfCde",
      inputtype: "rtinput",
      title: "被保人证件号码",
      disabled: true,
    },
    {
      prop:"cClntMrk",
      inputtype: "rtselect",
      title: "被保人性质",
      disabled: true,
      loadData: [
        {
          label: "个人",
          value: "1"
        },
        {
          label: "法人",
          value: "0"
        }
      ]
    },
    {
      prop: "cCstomerType",
      inputtype: "rtselect",
      title: "查询类型",
      // rules: [getRules("required", {})],
      loadData: [
        { label: "投保人", value: "01" },
        { label: "被保人", value: "02" },
        { label: "投保人/被保人", value: "03" },
      ],
      // disabled: true,
    },
  ]

}
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          // loadData()

          handleQuery();
        },
      }),
      createFreeButtonBase({
        type: "info",
        label: "返回",

        func: async () => {
          handleReturn()
        },
      }),
    ],
    fromSchema: fromSchema.TBfromSchema
    // [
    //   {
    //     prop: "policyHolderName",
    //     inputtype: "rtinput",
    //     title: "投保人名称",
    //     disabled: true,
    //   },
    //   {
    //     prop: "policyHolderId",
    //     // inputtype: "rtinput",
    //     title: "投保人证件类型",
    //     inputtype: "rtselect",
    //     typeCode: "NATURAL_CERTIFICATE_ALL",
    //     disabled: true,
    //   },
    //   {
    //     prop: "insuredName",
    //     inputtype: "rtinput",
    //     title: "投保人证件号码",
    //     // rules: [getRules("idCard", {})],
    //     disabled: true,
    //   },
    //   {
    //     prop: "insuredId",
    //     inputtype: "rtselect",
    //     title: "查询类型",
    //     // disabled: true,
    //   },
    // ],
  })
);

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});



const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    isPage: false,
    showSelection: false,
    tableBtnType: "btn",
    tableBtnWidth: 110,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "查看明细",
        type: "success",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          viewDetails(row)
        },
      }),
    ],
    fromSchema: [
      {
        prop: "year",
        inputtype: 'rtinput',
        title: "年度",
      },
      {
        prop: "nPrm",
        inputtype: 'rtinput',
				type: "number",
        title: "保费",
      },
      {
        prop: "claimAmount",
        inputtype: 'rtinput',
				type: "number",
        title: "总赔款金额",
      },
      {
        prop: "nPendAmt",
        inputtype: 'rtinput',
				type: "number",
        title: "总未决金额",
      },
      {
        prop: "acCidents",
        inputtype: 'rtinput',
        title: "出险次数(含注销和零结)",
      },
      {
        prop: "payRate",
        inputtype: 'rtinput',
        title: "赔付率(%)",
      },
    ],
  })
);

const pageresult1 = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 2,
});
const tableconfig1 = reactive<AppTableConfig>(
  createTableEditConfig({
    isPage: false,
    showSelection: false,
    tableBtnPosition: "right",
    titleBtns: [
      createFreeButtonBase({
        position: 'btn-bottom',
        id: "score",
        label: "返回",
        type: "info",
        func: function () {
          closeDetailDialog()
        },
      }),
    ],
    tableBtnType: "btn",
    tableBtnWidth: 110,

    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "查看明细",
        type: "success",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          viewClaimCaseDetails(row)
        },
      }),
    ],
    fromSchema: [
      {
        prop: "nSeqNo",
        inputtype: 'rtinput',
        title: "序号",
      },
      {
        prop: "cPlyNo",
        inputtype: 'rtinput',
        title: "保单号",
      },
      {
        prop: "cProdNo",
        inputtype: 'rtinput',
        title: "产品编码",
      },
      {
        prop: "cProdCnm",
        inputtype: 'rtinput',
        title: "产品名称(条款名称)",
      },
      {
        prop: "nPayAmt",
        inputtype: 'rtinput',
				type: "number",
        title: "赔款金额(不含费用)",
      },

      {
        prop: "nPendAmt",
        inputtype: 'rtinput',
				type: "number",
        title: "未决金额(不含费用)",
      },
      {
        prop: "tInsrncBgnTm",
        inputtype: 'rtinput',
        title: "保险起期",
      },
      {
        prop: "tInsrncEndTm",
        inputtype: 'rtinput',
        title: "保险止期",
      },
    ],
  })
);

const pageresult2 = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 2,
});


const tableconfig2 = reactive<AppTableConfig>(
  createTableEditConfig({
    isPage: false,
    showSelection: false,
    endBtnsPosition: "right",
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "返回",
        type: "info",
        func: function () {
          closeClaimCaseDetailDialog()
        },
      }),
    ],
    fromSchema: [
      {
        prop: "nSeqNo",
        inputtype: 'rtinput',
        title: "序号",
      },
      {
        prop: "cPlyNo",
        inputtype: 'rtinput',
        title: "保单号",
      },
      {
        prop: "cProdNo",
        inputtype: 'rtinput',
        title: "产品编码",
      },
      {
        prop: "cProdCnm",
        inputtype: 'rtinput',
        title: "产品名称(条款名称)",
      },
      {
        prop: "clmNo",
        inputtype: 'rtinput',
        title: "赔案号",
      },
      {
        prop: "nPayAmt",
        inputtype: 'rtinput',
				type: "number",
        title: "赔案金额",
      },
      {
        prop: "cAdtRsnCde",
        inputtype: 'rtinput',
        title: "出险原因",
      },
      {
        prop: "endcaseTime",
        inputtype: 'rtinput',
        title: "结案时间",
      },
      {
        prop: "cClmSts",
        inputtype: 'rtinput',
        title: "赔案状态",
      },
      {
        prop: "nPendAmt",
        inputtype: 'rtinput',
				type: "number",
        title: "未决金额(不含费用)",
      },
      {
        prop: "damageDate",
        inputtype: 'rtinput',
        title: "出险时间",
      },
      {
        prop: "tInsrncBgnTm",
        inputtype: 'rtinput',
        title: "保险起期",
      },
      {
        prop: "tInsrncEndTm",
        inputtype: 'rtinput',
        title: "保险止期",
      },
    ],
  })
);


onMounted(() => {

// freeEditRef.value?.setFormValue({
//         policyHolderName: "",
//         policyHolderId: "",
//         insuredName: "",
//         insuredId: "",
//         });
console.log(opertaor.getDataAll())
let DataAll = opertaor.getDataAll()['applicant']
nextTick(() => {
  freeEditRef.value?.setValue("cAppNme", DataAll['Applicant.cAppNme']);
  freeEditRef.value?.setValue("cCertfCls", DataAll['Applicant.cCertfCls']);
  freeEditRef.value?.setValue("cCertfCde", DataAll['Applicant.cCertfCde']);
  freeEditRef.value?.setValue("cClntMrk", DataAll['Applicant.cClntMrk']);
  freeEditRef.value?.setValue("cCstomerType", '01' );

  handleQuery();
})

});



// setTimeout(() => {
// pageresult.list = [
//   // Sample data
//   {
//     year: '2023',
//     premium: 10000,
//     totalClaimAmount: 5000,
//     outstandingAmount: 2000,
//     accidentCount: 3,
//     claimRate: '50%',
//   },
//   {
//     year: '2022',
//     premium: 12000,
//     totalClaimAmount: 6000,
//     outstandingAmount: 1000,
//     accidentCount: 2,
//     claimRate: '50%',
//   }
// ]



// }, 2000)



// 初始化年度查询
const handleQuery = () => {
  // let DataAll = opertaor.getDataAll()['applicant']['Applicant.cClntMrk']
  // let DataAll2 = opertaor.getDataAll()['insured']['Insured.cClntMrk'];
 

  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const r = tableRef.value?.getPartnerPage(); //获取分页数据

  
 
  let params = { ...s }
  if(s.cCstomerType=='01'){
    params.cClntMrk = opertaor.getDataAll()['applicant']['Applicant.cClntMrk'];
  }else{
    params.cClntMrk = opertaor.getDataAll()['insured']['Insured.cClntMrk'];
  }

  console.log('params', params)
  pcisQueryService.qryHistoryClaimYearAll(params).then((res: any) => {
    console.log('年度数据', res)


    if (res.code === 200) {
      if(res.data !==null){
        yearData.value = res.data
        // pageresult.list = res.data
        pageresult.list = res.data[activeTab.value]
      }else{
          ElMessage.success(res.msg )
      }
    } else {
      ElMessage.error({ message: res.msg, duration: 3000 });
    }
  });

}




const handleReturn = () => {
  maindialogVisible.value = false
};
const closeDetailDialog = () => {
  dialogVisible.value = false
}
const closeClaimCaseDetailDialog = () => {
  dialogVisibleDetail.value = false
}


// 第二个弹框 点击
const viewDetails = (row: any) => {
  // Handle view details button click
  console.log(row);
  dialogVisible.value = true

  // setTimeout(() => {
  //   pageresult1.list = [
  //     {
  //       year: '2023',
  //       premium: 10000,
  //       totalClaimAmount: 5000,
  //       outstandingAmount: 2000,
  //       accidentCount: 3,
  //       claimRate: '50%',
  //     },
  //     {
  //       year: '2022',
  //       premium: 12000,
  //       totalClaimAmount: 6000,
  //       outstandingAmount: 1000,
  //       accidentCount: 2,
  //       claimRate: '50%',
  //     },
  //   ]
  // }, 2000)
  console.log('第二row', row)
  let params = {
    ...row,
    ...freeEditRef.value?.getFromValue()
  }

  pcisQueryService.qryHistoryClaimYearDetail(params).then((res: any) => {
    console.log('详情数据', res)
    if (res.code === 200) {
      pageresult1.list = res.data

      // ElMessage.info({ message: res.msg, duration: 3000 });

    } else {
      ElMessage.error({ message: res.msg, duration: 3000 });
    }
  });

};

// 第三个弹框 条款明细按钮
const viewClaimCaseDetails = (row: any) => {
  console.log('条款明细按钮',row);
  dialogVisibleDetail.value = true
  

  let params = {
    ...row
  }
  pcisQueryService.qryHistoryClaimDetail(params).then((res: any) => {
    console.log('赔案明细', res)
    if (res.code === 200) {
      pageresult2.list = res.data

      // ElMessage.info({ message: res.msg, duration: 3000 });

    } else {
      ElMessage.error({ message: res.msg, duration: 3000 });
    }
  });
}

const tabChange = (name: any) => {
  console.log('name', name,yearData.value) //car property person
  pageresult.list= yearData.value[name]
  }


const tabChangeTb = (name: any) => {
  
  tabS.value = name
  activeTab.value = '01';

  if (name == '02') {
    formconfig1.fromSchema = fromSchema.BBfromSchema
    let DataAll = opertaor.getDataAll()['insured']
      nextTick(() => {
        freeEditRef.value?.setValue("cInsuredNme", DataAll['Insured.cInsuredNme']);
        freeEditRef.value?.setValue("cCertfCls", DataAll['Insured.cCertfCls']);
        freeEditRef.value?.setValue("cCertfCde", DataAll['Insured.cCertfCde']);
        freeEditRef.value?.setValue("cClntMrk", DataAll['Insured.cClntMrk']);
      })
  } else {
    formconfig1.fromSchema = fromSchema.TBfromSchema

    let DataAll = opertaor.getDataAll()['applicant']

    nextTick(() => {  
      freeEditRef.value?.setValue("cAppNme",DataAll['Applicant.cAppNme']);
      freeEditRef.value?.setValue("cCertfCls", DataAll['Applicant.cCertfCls']);
      freeEditRef.value?.setValue("cCertfCde", DataAll['Applicant.cCertfCde']);
      freeEditRef.value?.setValue("cClntMrk", DataAll['Applicant.cClntMrk']);

    })
    // console.log(332, DataAll)
  }


  freeEditRef.value?.setValue("cCstomerType", name );

  handleQuery()
}



</script>

<style scoped lang="scss">
.demo-form-inline {
  margin-bottom: 20px;
}

.tabsSty {
  margin-top: 10px;
}

.tableBtn {
  text-align: right;
  margin-bottom: 10px;
}
</style>

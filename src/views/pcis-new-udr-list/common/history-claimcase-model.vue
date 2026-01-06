<template>
  <div >
    <el-dialog  v-model="maindialogVisible" width="90%">
      <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
      <el-tabs v-model="activeTab" type="border-card" class="tabsSty" @tab-change="tabChange">
        <el-tab-pane label="车" name="car">
          <app-table
            :tableConfig="tableconfig"
            v-model:pageresult="pageresult"
            ref="tableRef"
          />
        </el-tab-pane>
        <el-tab-pane label="财" name="property">
          <app-table
            :tableConfig="tableconfig"
            v-model:pageresult="pageresult"
            ref="tableRef"
          />
        </el-tab-pane>
        <el-tab-pane label="人" name="person">
          <app-table
            :tableConfig="tableconfig"
            v-model:pageresult="pageresult"
            ref="tableRef"
          />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
  <!-- 查看明细 -->
  <el-dialog v-if="dialogVisible" v-model="dialogVisible" title="查看明细" width="90%">
    <app-table
        :tableConfig="tableconfig1"
        v-model:pageresult="pageresult1"
        ref="tableRef"
      />
  </el-dialog>

  <!-- 赔案明细 -->
  <el-dialog v-if="dialogVisibleDetail" v-model="dialogVisibleDetail" title="赔案明细" width="90%">
    <app-table
        :tableConfig="tableconfig2"
        v-model:pageresult="pageresult2"
        ref="tableRef"
      />
  </el-dialog>
</template>

<script setup lang="ts">
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
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);

const activeTab = ref('car');
const detailTableData = ref();
const maindialogVisible = ref(true)
const dialogVisible = ref(false)
const dialogVisibleDetail = ref(false)

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "",
        label: "返回",
        func: async () => {
          handleReturn()
        },
      }),
    ],
    fromSchema: [
      {
        prop: "policyHolderName",
        inputtype: "rtinput",
        title: "投保人名称",
        disabled: true,
      },
      {
        prop: "policyHolderId",
        inputtype: "rtinput",
        title: "投保人证件号码",
        disabled: true,
      },
      {
        prop: "insuredName",
        inputtype: "rtinput",
        title: "被保人名称",
        disabled: true,
      },
      {
        prop: "insuredId",
        inputtype: "rtinput",
        title: "被保人证件号码",
        disabled: true,
      },
    ],
  })
);

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 2,
});

setTimeout(() => {
  pageresult.list = [
  // Sample data
  {
    year: '2023',
    premium: 10000,
    totalClaimAmount: 5000,
    outstandingAmount: 2000,
    accidentCount: 3,
    claimRate: '50%',
  },
  {
    year: '2022',
    premium: 12000,
    totalClaimAmount: 6000,
    outstandingAmount: 1000,
    accidentCount: 2,
    claimRate: '50%',
  },
]
}, 2000)

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
        prop: "premium",
        inputtype: 'rtinput',
        title: "保费",
      },
      {
        prop: "totalClaimAmount",
        inputtype: 'rtinput',
        title: "总赔款金额",
      },
      {
        prop: "outstandingAmount",
        inputtype: 'rtinput',
        title: "总未决金额",
      },
      {
        prop: "accidentCount",
        inputtype: 'rtinput',
        title: "出险次数(含注销和零结)",
      },
      {
        prop: "claimRate",
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
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "返回",
        type: "",
        func: function () {
          closeDetailDialog()
        },
      }),
    ],
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
          viewClaimCaseDetails(row)
        },
      }),
    ],
    fromSchema: [
      {
        prop: "year",
        inputtype: 'rtinput',
        title: "序号",
      },
      {
        prop: "premium",
        inputtype: 'rtinput',
        title: "保单号",
      },
      {
        prop: "totalClaimAmount",
        inputtype: 'rtinput',
        title: "产品编码",
      },
      {
        prop: "outstandingAmount",
        inputtype: 'rtinput',
        title: "产品名称(条款名称)",
      },
      {
        prop: "accidentCount",
        inputtype: 'rtinput',
        title: "赔案号",
      },
      {
        prop: "claimRate",
        inputtype: 'rtinput',
        title: "赔案金额",
      },
      {
        prop: "accidentCount",
        inputtype: 'rtinput',
        title: "出险原因",
      },
      {
        prop: "claimRate",
        inputtype: 'rtinput',
        title: "结案时间",
      },
      {
        prop: "accidentCount",
        inputtype: 'rtinput',
        title: "赔案状态",
      },
      {
        prop: "claimRate",
        inputtype: 'rtinput',
        title: "未决金额(不含费用)",
      },
      {
        prop: "accidentCount",
        inputtype: 'rtinput',
        title: "出险时间",
      },
      {
        prop: "claimRate",
        inputtype: 'rtinput',
        title: "保险起期",
      },
      {
        prop: "accidentCount",
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
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "返回",
        type: "",
        func: function () {
          closeClaimCaseDetailDialog()
        },
      }),
    ],
    fromSchema: [
      {
        prop: "year",
        inputtype: 'rtinput',
        title: "序号",
      },
      {
        prop: "premium",
        inputtype: 'rtinput',
        title: "保单号",
      },
      {
        prop: "totalClaimAmount",
        inputtype: 'rtinput',
        title: "产品编码",
      },
      {
        prop: "outstandingAmount",
        inputtype: 'rtinput',
        title: "产品名称(条款名称)",
      },
      {
        prop: "accidentCount",
        inputtype: 'rtinput',
        title: "赔案号",
      },
      {
        prop: "claimRate",
        inputtype: 'rtinput',
        title: "赔案金额",
      },
      {
        prop: "accidentCount",
        inputtype: 'rtinput',
        title: "出险原因",
      },
      {
        prop: "claimRate",
        inputtype: 'rtinput',
        title: "结案时间",
      },
      {
        prop: "accidentCount",
        inputtype: 'rtinput',
        title: "赔案状态",
      },
      {
        prop: "claimRate",
        inputtype: 'rtinput',
        title: "未决金额(不含费用)",
      },
      {
        prop: "accidentCount",
        inputtype: 'rtinput',
        title: "出险时间",
      },
      {
        prop: "claimRate",
        inputtype: 'rtinput',
        title: "保险起期",
      },
      {
        prop: "accidentCount",
        inputtype: 'rtinput',
        title: "保险止期",
      },
    ],
  })
);


const handleReturn = () => {
  maindialogVisible.value = false
};
const closeDetailDialog = () => {
  dialogVisible.value = false
}
const closeClaimCaseDetailDialog = () => {
  dialogVisibleDetail.value = false
}

const viewDetails = (row: any) => {
  // Handle view details button click
  console.log(row);
  dialogVisible.value = true

  setTimeout(() => {
  pageresult1.list = [
  {
    year: '2023',
    premium: 10000,
    totalClaimAmount: 5000,
    outstandingAmount: 2000,
    accidentCount: 3,
    claimRate: '50%',
  },
  {
    year: '2022',
    premium: 12000,
    totalClaimAmount: 6000,
    outstandingAmount: 1000,
    accidentCount: 2,
    claimRate: '50%',
  },
]
}, 2000)
};

const viewClaimCaseDetails = (row: any) => {
  console.log(row);
  dialogVisibleDetail.value = true
}

const tabChange = (name) => {
  console.log('name', name) //car property person
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

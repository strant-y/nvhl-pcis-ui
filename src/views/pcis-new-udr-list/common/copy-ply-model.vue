<template>
  <el-dialog v-model="dialogVisible" width="90%">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
      @selection-change="handleSelectionChange"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { ElMessage, ElForm, ElFormItem, ElRadioGroup, ElRadio, ElSelect, ElOption, ElCascader, ElDatePicker, ElInput, ElButton, ElTable, ElTableColumn, ElPagination } from 'element-plus';
import { getListByCode } from '@/api/code-list-service';
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
import { AppKey } from '@/constants/api';
import { useUserStore } from "@/store/modules/user";
import { useValidator } from "@/typings/useValidator";
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

const props = defineProps({
  queryParam: {
    type: Object,
    required: true,
    default: () => {
      return {}
    }
  },
})
const emits = defineEmits(['ok'])
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const userStore = useUserStore();
const { getRules } = useValidator();
const policyService = new PolicyService();

const user = userStore.user

const dialogVisible = ref(true)

const C_ANTI_LNDER_RISK_APP = '0';
const C_ANTI_LNDER_RISK_PLY = '1';



const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    fromUi: {
      cols: 2
    },
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery()
        },
      }),
      createFreeButtonBase({
        label: "确认",
        func: () => {
          confirm()
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CAntiLnderRisk",
        inputtype: "rtradio",
        title: "单据",
        loadData :[
          { label:'投保单',value:1 },
          { label:'保单',value:0 },
        ],
        rules: [getRules("required", {})],
      },
      {
        prop: "CDptCde",
        inputtype: "rtselect",
        title: "出单机构",
        typeCode: "CDptCde_List",
        params: { CDptCde: user?.companyId },
        clearable: true,
        rules: [getRules("required", {})],
      },
      {
        prop: "CLoadSub",
        inputtype: "rtradio",
        title: "是否包含下级",
        loadData :[
          { label:'是',value:1 },
          { label:'否',value:0 },
        ]
      },
      {
        prop: "CKindNo",
        inputtype: "rtcascader",
        title: "产品大类",
        typeCode: "KIND_LIST_CACHE",
        param: { cOperId: user['opCde'], cDptCde: user['companyId'] },
        rules: [getRules("required", {})],
      },
      {
        prop: "CProdNo",
        inputtype: "rtcascader",
        title: "产品",
        typeCode: "PROD_LIST_GRT",
        param: { cParCde: '', cOperId: user['opCde'], cDptCde: user['companyId'] },
        rules: [getRules("required", {})],
      },
      {
        prop: "tm",
        inputtype: "rtdatepicker",
        title: "投保日期",
        type: "datetimerange",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
      },
      {
        prop: "CAppPlyNo",
        inputtype: "rtinput",
        title: "单号",
        clearable: true,
      },
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
        clearable: true,
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


const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    showSelection: true,
    isRadio: true,
    fromSchema: [
      {
        prop: "cDptCnm",
        inputtype: 'rtinput',
        title: "承保机构",
      },
      {
        prop: "cAppNo",
        inputtype: 'rtinput',
        title: "投保单号",
      },
      {
        prop: "cPlyNo",
        inputtype: 'rtinput',
        title: "保单号",
      },
      {
        prop: "cProdNmeCn",
        inputtype: 'rtinput',
        title: "产品",
      },
      {
        prop: "nPrm",
        inputtype: 'rtinput',
        title: "保费",
      },
      {
        prop: "cAppNme",
        inputtype: 'rtinput',
        title: "投保人名称",
      },
      {
        prop: "tAppTm",
        inputtype: 'rtinput',
        title: "投保申请日期",
      },
      {
        prop: "cAppStatus",
        inputtype: 'rtinput',
        title: "状态",
      },
    ],
  })
);



setTimeout(() => {
  pageresult.list = [
  {
    cDptCnm: '承保机构',
    cAppNo: '投保单号',
    cPlyNo: '保单号',
  },
  {
    cDptCnm: '承保机构2',
    cAppNo: '投保单号2',
    cPlyNo: '保单号2',
  }
]
}, 2000)


const selected = ref([]);
const displayData = ref('');
const selectedGrpMrk = ref('');
const selectedCiMrk = ref('');
const CAntiLnderRisk = ref('');


const handleQuery = (flag = true) => {
  submitForm(flag)
}
const handleSelectionChange = (selection) => {
  selected.value = selection
  displayData.value = selected.value[selected.value.length-1].cAppNo
  selectedGrpMrk.value = selected.value[selected.value.length-1].cGrpMrk;
  selectedCiMrk.value = selected.value[selected.value.length-1].cCiMrk;
}

onMounted(() => {
  
});

const submitForm = (flag) => {
  refreshData(flag);
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
    } else {
      console.log('error submit!!');
      return false;
    }
  });
};

const confirm = () => {
  if (!displayData.value) {
    ElMessage.warning('请选择一条记录');
    return;
  } else {
    console.log('选中的保单的团单标志为' + selectedGrpMrk.value + ', 投保向导中选择的团单标志为' + props.queryParam['Base.CGrpMrk']);
    if (selectedGrpMrk.value !== props.queryParam['Base.CGrpMrk']) {
      ElMessage.error('源保单和新单的团个单类型不同, 不允许复制');
      return;
    }
    console.log('选中的保单的共保方式为' + selectedCiMrk.value + ', 投保向导中选择的共保方式为' + props.queryParam['Base.CCiMrk']);
    if (selectedCiMrk.value !== props.queryParam['Base.CCiMrk']) {
      ElMessage.error('源保单和新单的共保方式不同, 不允许复制');
      return;
    }
    dialogVisible.value = false
    //关闭模态框并传递数据
    emits('ok', { CAppNo: displayData.value, CAntiLnderRisk: CAntiLnderRisk.value })
  }
};

const refreshData = async(flag = true) => {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const formData = freeEditRef.value?.getFromValue(); //获取表单数据
  console.log(formData);
  
  const data = formData
  

  // 查询时间段验证
  const startTemp = data.tm[0];
  if (!startTemp) {
    ElMessage.warning('投保起期不能为空');
    return;
  }
  const start = Date.parse(startTemp);
  const endTemp = data.tm[1];
  if (!endTemp) {
    ElMessage.warning('投保止期不能为空');
    return;
  }
  const end = Date.parse(endTemp);
  if (start - end > 0) {
    ElMessage.warning('投保起期不能大于投保止期');
    return;
  }
  let month = new Date(start).getMonth();
  let fullYear = new Date(start).getFullYear();
  if (month + 1 === 12) {
    month = -1;
    fullYear = fullYear + 1;
  }
  const newDay = new Date(fullYear, month + 1, 0);
  // 开始日期月份天数
  const totalDayNumOfMonth = newDay.getDate();
  // 结束时间为 开始时间 + 开始日期月份天数 - 1
  const deadLine = start + (totalDayNumOfMonth - 1) * 1000 * 60 * 60 * 24;
  if (end - deadLine > 0) {
    ElMessage.warning('投保时间范围请控制在1个月以内');
    return;
  }

  let ob = null;
  const param = Object.assign(formData, r, {
    sortField: null,
    sortOrder: null,
  });
  CAntiLnderRisk.value = data.CAntiLnderRisk;
  if (C_ANTI_LNDER_RISK_APP === data.CAntiLnderRisk) { // 投保单
    for (const k in data) {
      switch (k) {
        case 'CLoadSub':
          if (data[k]) {
            param['CLoadSub'] = 1;
          }
          break;
        case 'CAppPlyNo':
          param['CAppNo'] = data[k]; // 申请单号
          break;
        default:
          param[k] = data[k];
          break;
      }
    }
    ob = await policyService.getCopySrcAppPolicyList(param);
  } else if (C_ANTI_LNDER_RISK_PLY === data.CAntiLnderRisk) { // 保单
    for (const k in data) {
      switch (k) {
        case 'CLoadSub':
          if (data[k]) {
            param['CLoadSub'] = 1;
          }
          break;
        case 'CAppPlyNo':
          param['CPlyNo'] = data[k]; // 保单号
          break;
        default:
          param[k] = data[k];
          break;
      }
    }
    ob = await policyService.qryEndorseList(param);
  }
  if (ob) {
    ob.then((res: any) => {
      if (res && res.code) {
        if (res.code === 200) {
          const pageData = res.data;
          if (pageData) {
            pageresult.total = pageData.total;
            pageData.result.forEach((item: any) => {
              selected.value = []
            });
            pageresult.list = pageData.result;
          }
        } else {
          ElMessage.error(res.msg);
        }
      }
    }).catch((error: any) => {
      console.log('出错了', error);
      ElMessage.error('后台服务异常,请联系管理员');
    });
  }
};



</script>

<style scoped lang="scss">
.searchSty {
  padding: 25px 20px 15px 10px;
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 5px
}
</style>

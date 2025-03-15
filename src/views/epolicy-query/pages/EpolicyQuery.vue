<!-- 电子保单管理 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
      @selection-change="handleSelectionChange"
    />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store";
import { useValidator } from "@/typings/useValidator";
import { useRouter, useRoute } from 'vue-router';
const { getRules } = useValidator();
const route = useRoute();
import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { deleteFactorBykey, getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import moment from 'moment';
import { initMultiCodeList } from '@/api/code-list-service'; // 代码列表服务
import { getListByCode } from '@/api/code-list-service';
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
const policyService = new PolicyService();
import { PcisQueryService } from '@/views/payinfo/service/pcis-query-service';
const pcisQueryService = new PcisQueryService();
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId:'', opCde:'' })
const dzmodal = useDzModal();
// const kindEdit = defineAsyncComponent(() => import("./kindEdit.vue"));
const tableRef = ref<AppTableMethod | null>(null);
const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
);
const EpolicyQueryGrpDialog = defineAsyncComponent(
  // 团单个打
  () => import("../common/EpolicyQueryGrpDialog.vue")
);
const ElectronicInsurancePolicy = defineAsyncComponent(
  // 生成电子保单
  () => import("../common/ElectronicInsurancePolicy.vue")
);
const EpolicyGeneratElecInvoice = defineAsyncComponent(
  // 开具电子发票
  () => import("../common/EpolicyGeneratElecInvoice.vue")
);

const params = route.query.data ? JSON.parse(route.query.data) : {}
const dataSet = ref<any>([]); // 数据集合
const planSet = ref<any>([]); //结果集
 
const selectedRows = ref<any[]>([]);
const btnTitle = ref<any>([
  { label: "" },
  { label: ""},
])
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        id: "groupSingleFight",
        label: "团单个打电子保单",
        type: "primary",
        func: () => {
          createEPolicy();
        },
      }),
      createFreeButtonBase({
        id: "generatingEPolicy",
        label: '生成电子保单',
        type: "primary",
        func: () => {
          if(!freeEditRef.value?.getValue('CPlyTyp')){
            ElMessage.warning('请选择单证类型');
            return
          }
          if (selectedRows.value.length == 0) {
            ElMessage.warning({ message: '请选择一条记录！', duration: 3000 });
            return;
          }
          const data = {
            // cAppNo: planSet.value[0]['cAppNo'],
            plyTy: freeEditRef.value?.getValue('CPlyTyp'),
          }
          dzmodal.open(ElectronicInsurancePolicy, { type: "edit", ...data }).then((res) => {
            if (res.type === "ok") {
              handleQuery(true);
            }
          });
        },
      }),
      createFreeButtonBase({
        id: "downloadBLEPolicy",
        label: '电子保单下载',
        type: "primary",
        func: () => {
          downloadXLS();
        },
      }),
      createFreeButtonBase({
        id: "downElectronicPolicy",
        label: "电子保单获取",
        type: "warning",
        func: () => {
          downElectronicPolicy()
        },
      }),
      createFreeButtonBase({
        id: "generatElecInvoice",
        label: "开具电子发票",
        type: "warning",
        func: () => {
          generatElecInvoice();
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery();
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          freeEditRef.value?.setFormValue({
            cKindNo: "",
            cStatus: "",
          });
          handleQuery(true);
          // freeEditRef.value?.resetForm();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CDptCde",
        inputtype: "rtselect",
        title: "机构部门",
        btnWidth: 10,
        itemWidth: 2,
        rules: [getRules("required", {})],
        defaultValue: user.value.companyId,
        showExBtn: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            const data = { pid: user.value.companyId };
            dzmodal
              .open(departmentTree, { type: "Issuer", data: data })
              .then((res) => {
                if (res.type === "ok") {
                }
              });
          },
        },
      },
      {
        prop: "CLoadSub",
        inputtype: "rtcheckbox",
        title: "是否包含下级",
        defaultValue: 1,
        keymap: {
          y: 1, n: 0
        }
      },
      {
        prop: "CPlyTyp",
        inputtype: "rtselect",
        title: "单证类型",
        defaultValue: 'PLY',
        clearable: true,
        loadData :[
          { label:'电子保单',value:'PLY' },
          { label:'电子批单',value:'EDR' },
        ],
        func: (val: any) => {
          if(val == 'PLY') {
            formconfig1.endBtns[1].title = '生成电子保单'
            formconfig1.endBtns[2].title = '电子保单下载'
          }
          if(val == 'EDR') {
            formconfig1.endBtns[1].title = '生成电子批单'
            formconfig1.endBtns[2].title = '电子批单下载'
          }
        },
      },
      {
        prop: "CKindNo",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "WEB_SYS_STA_DICT",
        params: { cParCde: "use_mrk" },
        clearable: true,
      },
      {
        prop: "CProdNo",
        inputtype: "rtselect",
        title: "产品",
        typeCode: "PROD_LIST_GRT",
        params: { cParCde:'', cOperId: user.value.opCde, cDptCde: user.value.companyId },
        loadData:[],
        clearable: true,
      },
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        clearable: true,
      },
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
        clearable: true,
      },
      {
        prop: "CAppCertfCde",
        inputtype: "rtinput",
        title: "投保人证件号码",
        clearable: true,
      },
      {
        prop: "CAppNo",
        inputtype: "rtinput",
        title: "投保单号",
        clearable: true,
      },
      {
        prop: "CInsuredNme",
        inputtype: "rtinput",
        title: "被保人姓名",
        clearable: true,
      },
      {
        prop: "CInsuredCertfCde",
        inputtype: "rtinput",
        title: "被保人证件号码",
        clearable: true,
      },
      {
        prop: "CBatchNo",
        inputtype: "rtinput",
        title: "导入保单批次号",
        clearable: true,
      },
      {
        prop: "tm",
        inputtype: "rtdatepicker",
        title: "签单日期",
        itemWidth: 2,
        rules: [getRules("required", {})],
        clearable: true,
        type: "datetimerange",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        defaultValue: [
          moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format('YYYY-MM-DD 00:00:00'),
          moment(new Date()).format('YYYY-MM-DD 23:59:59')
        ],
      },
      {
        prop: "CProjectLabel",
        inputtype: "rtinput",
        title: "项目标签",
        clearable: true,
      },
      {
        prop: "CResvTxt5",
        inputtype: "rtinput",
        title: "车牌号",
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
  total: 0,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    showSelection: true,
    fromSchema: [
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "投保单号",
        minWidth: 180,
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        minWidth: 180,
      },
      {
        prop: "cEdrNo",
        inputtype: "rtinput",
        title: "批单号",
        minWidth: 180,
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人姓名",
        minWidth: 120,
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "保险费",
        minWidth: 120,
      },
      {
        prop: "cProdNmeCn",
        inputtype: "rtinput",
        title: "产品",
        minWidth: 120,
      },
      {
        prop: "cSlsNme",
        inputtype: "rtinput",
        title: "业务员名称",
        minWidth: 120,
      },
      {
        prop: "tAppTm",
        inputtype: "rtinput",
        title: "投保申请日期",
        minWidth: 180,
      },
      {
        prop: "tInsrncBgnTm",
        inputtype: "rtinput",
        title: "保险起期",
        minWidth: 120,
      },
      {
        prop: "tInsrncEndTm",
        inputtype: "rtinput",
        title: "保险止期",
        minWidth: 120,
      },
      {
        prop: "tUdrTm",
        inputtype: "rtinput",
        title: "核保日期",
        minWidth: 120,
      },
      // {
      //   prop: "cDptCde",
      //   inputtype: "rtinput",
      //   title: "承保机构",
      // },
      // {
      //   prop: "cMobile",
      //   inputtype: "rtinput",
      //   title: "投保人手机号",
      // },
      // {
      //   prop: "cEmail",
      //   inputtype: "rtinput",
      //   title: "投保人邮箱",
      // },
    ],
  })
);

onMounted(async () => {
  const codeParams = [
    {
      source: 'cAppTyp',
      codeListName: 'WEB_SYS_STA_DICT_CACHE',
      codeListParam: { cParCde: 'cAppTyp' },
    },
    {
      source: 'cAppStatus',
      codeListName: 'RECEIVE_BANK_CATEGORY',
      codeListParam: { cParCde: 'shenqingdanzhuangtai' },
    },
  ];
  initMultiCodeList({ params: codeParams }).then((res: any) => {
    if (res && res.code === 200 && res.data) {
      console.log('res.data',res.data)

    }
  }).catch((error) => {
    console.log('出错了', error);
    ElMessage.error('后台服务异常,请联系管理员'); // 显示错误消息
  });

  if (params && params.plyNo) {
    freeEditRef.value?.setValue("CDataTyp", params.ply);
    freeEditRef.value?.setValue("CPlyNo", params.plyNo); //设置保单号
  }
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
    const r = freeEditRef.value?.getFromValue();
    if (r["name"]) {
      callback();
    } else {
      callback("姓名");
    }
  },
};

/** 查询 */
function handleQuery(flag?: boolean) {
  freeEditRef.value?.validate().then((isValid) => {
		if (isValid) {
      const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
      const s = freeEditRef.value?.getFromValue(); //获取表单数据
      const tmArr = freeEditRef.value?.getValue("tm");
      const issueStartTemp = tmArr[0];
      const issueEndTemp = tmArr[1];
      const issueStart = Date.parse(issueStartTemp);
      // if (!issueStartTemp) {
      //   ElMessage.warning('签单起期不能为空');
      //   return;
      // }
      // if (!issueEndTemp) {
      //   ElMessage.warning('签单止期不能为空');
      //   return;
      // }
      const issueEnd = Date.parse(issueEndTemp);
      // if (issueStart - issueEnd > 0) {
      //   ElMessage.warning('签单起期不能大于签单止期');
      //   return;
      // }
      if (issueEnd - issueStart >= 31 * 1000 * 60 * 60 * 24) {
        ElMessage.warning('签单时间范围请控制在31天以内');
        return;
      }
      const cplyTyp = freeEditRef.value?.getValue("cplyTyp");
      const param = Object.assign({
        sortField: 'name',
        CAppTyp: cplyTyp === 'EDR' ? 'E' : 'A',
        SysCode: 'POLY_CASU',
        // sortOrder: _sortValue.value,
        TIssueBgnTm: issueStartTemp,
        TIssueEndTm: issueEndTemp,
        CurrentUser: user.value?.opCde,
        CurrentUserOrg: user.value?.companyId,
        CTgtObjTxtFld4: freeEditRef.value?.getValue("CResvTxt5"),
      },r,s);
      param['CAppNo'] = param['CAppNo'] || null;
      policyService.getEpolicyPolicyList(param).then((res: any) => {
        if (res && res.code === 200) {
          const pageData = res.data;
          if (pageData) {
            pageresult.list = pageData.list;
            pageresult.total = pageData.total;
          }
        }
      }).catch((err: any) => {
        ElMessage.error({ message: '后台服务异常,请联系管理员', duration: 3000 });
      });

    }
  });
}

// 选中事件
function handleSelectionChange(rows: any) {
  selectedRows.value = rows;
}


// 团单个打
function createEPolicy() {
  const CPlyTyp = freeEditRef.value?.getValue('CPlyTyp')
  if (!!CPlyTyp && 'EDR' === CPlyTyp) {
    ElMessage.warning({ message: '批单不支持团单个打，请切换单证类型！', duration: 3000 });
    return;
  }
  if (selectedRows.value.length == 0) {
    ElMessage.warning({ message: '请选择一条记录！', duration: 3000 });
    return;
  }
  getListByCode('PROD_LIST_IN_GUIDE', {'cParCde': '02', 'subProd': '1'}).then(res => {
    if(!!res && !!res.data){
      // 设置产品下拉列表数据 为res.data
      formconfig1.fromSchema[4].typeCode = ''
      formconfig1.fromSchema[4].loadData = res.data;
      let flag = false;
      for (let i = 0; i<res['data'].length;i++){
        if (res.data[i].value === selectedRows.value[0]['cProdNo'] ) {
          flag = true;
          break;
        }
      }
      if ('040056' !== selectedRows.value[0]['cProdNo'] && !flag) {
        ElMessage.warning({ message: '此产品暂未开发团单个打功能！', duration: 3000 });
        return;
      }

      const data = {
        // cAppNo: planSet.value[0]['cAppNo'],
        // cPlyNo: planSet.value[0]['cPlyNo'],
        // plyTy: freeEditRef.value?.getValue('CPlyTyp'),
        // cProdNo: planSet.value[0]['cProdNo'],
      }
      dzmodal.open(EpolicyQueryGrpDialog, { type: "edit", data: data }).then((res) => {
        if (res.type === "ok") {
          handleQuery(true);
        }
      });
    }
     
  })
}
// 电子保单下载
function downloadXLS(){
  const CPlyTyp = freeEditRef.value?.getValue('CPlyTyp')
  if ( CPlyTyp == null) {
    ElMessage.warning('请选择单证类型');
    return
  }
  if (selectedRows.value.length == 0) {
    ElMessage.warning({ message: '请选择一条记录！', duration: 3000 });
    return;
  }

  const data = {
      CPlyNo: selectedRows.value[0]['cPlyNo'],
      CEdrNo: selectedRows.value[0]['cEdrNo'],
      plyTy: CPlyTyp
  };
  policyService.downloadElePolicy(data).then((res: any) => {
    if (res.size <= 0) {
      if (CPlyTyp === 'PLY') {
        ElMessage.warning({ message: '电子保单未生成', duration: 3000 });
      } else if (CPlyTyp === 'EDR') {
        ElMessage.warning({ message: '电子批单未生成', duration: 3000 });
      }
      return;
    }
    let fileName = CPlyTyp === 'EDR'?
    `${selectedRows.value[0].cEdrNo}.pdf` : `${selectedRows.value[0].cPlyNo}.pdf`;
    // saveAs(res, decodeURI(fileName));
  }).catch((err: any) => {
    ElMessage.error('下载出错', err);
  });
}

// 电子保单获取
function downElectronicPolicy() {
  if (selectedRows.value.length == 0) {
    ElMessage.warning({ message: '请选择一条记录！', duration: 3000 });
    return;
  }
  const data = {
    CPlyNo: selectedRows.value[0].cPlyNo,
    CAppNo: selectedRows.value[0].cAppNo,
  };
  policyService.downElectronicPolicy(data).then((res: any) => {
    if (res.code === 200) {
      if (res.data !== null) {
        if (res.msg !== null && res.msg.indexOf('http') !== -1) {
          ElMessageBox.confirm('电子单证获取成功！是否下载到本地？', '提示', {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            const downUrl = res.msg.substring(res.msg.indexOf('http'), res.msg.length);
            window.open(downUrl);
          }).catch(() => {
            // 取消操作
            ElMessage.success({ message: res.msg, duration: 3000 });
          });
        }
      } else {
        ElMessage.warning({ message: res.msg, duration: 3000 });
      }
    } else {
      ElMessage.error({ message: res.msg, duration: 3000 });
    }
  });
}

// 开具电子发票
function generatElecInvoice() {
  if (selectedRows.value.length == 0) {
    ElMessage.warning({ message: '请选择一条记录！', duration: 3000 });
    return;
  }
  pcisQueryService.getlatestPlyInfo(selectedRows.value[0]).then((res: any) => {
    let data = {
      
    }
    if(res != null && res.data !== null){
      if(res.code === 200){
        data = {
          // cAppNo: planSet.value[0]['cAppNo'],
          // cPlyNo: planSet.value[0]['cPlyNo'],
          // cDptCde: planSet.value[0]['cDptCde'],
          // cAppName: res.data.GHDWMC,
          // cMobile: planSet.value[0]['cMobile'],
          // cEmail: planSet.value[0]['cEmail'],
          // plyTy: freeEditRef.value?.getValue('CPlyTyp'),
          // cEdrNo: planSet.value['0']['cEdrNo']
        }
      }else{
        data = {
          // cAppNo: planSet.value[0]['cAppNo'],
          // cPlyNo: planSet.value[0]['cPlyNo'],
          // cDptCde: planSet.value[0]['cDptCde'],
          // cAppName: planSet.value[0]['cAppNme'],
          // cMobile: planSet.value[0]['cMobile'],
          // cEmail: planSet.value[0]['cEmail'],
          // plyTy: freeEditRef.value?.getValue('CPlyTyp'),
          // cEdrNo: planSet.value['0']['cEdrNo']
        }
      }
    }else{
      data = {
        // cAppNo: planSet.value[0]['cAppNo'],
        // cPlyNo: planSet.value[0]['cPlyNo'],
        // cDptCde: planSet.value[0]['cDptCde'],
        // cAppName: planSet.value[0]['cAppNme'],
        // cMobile: planSet.value[0]['cMobile'],
        // cEmail: planSet.value[0]['cEmail'],
        // plyTy: freeEditRef.value?.getValue('CPlyTyp'),
        // cEdrNo: planSet.value['0']['cEdrNo']
      }
    }
    dzmodal.open(EpolicyGeneratElecInvoice, { type: "edit", data: data }).then((res) => {
      if (res.type === "ok") {
        handleQuery(true);
      }
    });
  });
}
</script>

<style scoped></style>

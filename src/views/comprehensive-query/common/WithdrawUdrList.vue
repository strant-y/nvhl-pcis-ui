<!-- 投保待撤回任务 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
    />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
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
import { NewUdrListService } from "@/views/pcis-new-udr-list/service/new-udr-list.service";
const { withdraw, getBackUdrList, getReturnUdrList, getWithdrawUdrList, getNewUdrList } = NewUdrListService();
const userStore = useUserStore() || ref({});
const user = ref(userStore.user) || ref({ companyId:'', opCde:'' })
const roles = userStore.user.roles || [];
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const TaskListVestige = defineAsyncComponent(
  () => import("@/views/pcis-new-udr-list/common/TaskListVestige.vue")
);
const udrType = ref('5');

const props = defineProps({
  refreshData: {
    type: Boolean,
    default: false
  }
})
const cPard = ref(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [
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
          // freeEditRef.value?.resetFields()
          freeEditRef.value?.setFormValue({
            CProdCatCde: null,
            prodNo: null,
            appCde: null,
            objId: null,
            dateRange: [
              moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format('YYYY-MM-DD 00:00:00'),
              moment(new Date()).format('YYYY-MM-DD 23:59:59')
            ]
          });
          handleQuery(true);
          // freeEditRef.value?.resetForm();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CProdCatCde",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "KIND_LIST_GRT",
        params: { cOperId: user.value.opCde, cDptCde: user.value.companyId },
        clearable: true,
        func:(val)=>{
          cPard.value = val;
          codeListStore
              .queryCodeList({
                  codeListName: "TERM_LIST_IN_GUIDE_NEW",
                  codeListParam:{
                  cParCde: cPard.value,
                  cOperId: user.value.opCde,
                  cDptCde: user.value.companyId,
              },
              })
              .then((res) => {
                  setFormItem("prodNo", {
                      loadData: res,
                  });
              });
        }
      },
      {
        prop: "prodNo",
        inputtype: "rtselect",
        title: "条款",
        // typeCode: "PROD_LIST_GRT",
        // params: { cParCde:'', cOperId: user.value.opCde, cDptCde: user.value.companyId },
        clearable: true,
      },
      {
        prop: "appCde",
        inputtype: "rtinput",
        title: "投保人",
        clearable: true,
      },
      {
        prop: "objId",
        inputtype: "rtinput",
        title: "申请单号",
        clearable: true,
      },
      {
        prop: "dateRange",
        inputtype: "rtdatepicker",
        title: "投保日期",
        itemWidth: 2,
        clearable: true,
        type: "datetimerange",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
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
    editFlag: true,
    editList: ["cStatus"],
    tableBtnType: "btn",
    tableBtnWidth: 120,
    tableBtnPosition: "right",
    tableBtnFixed: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "撤回",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row: any) => {
          handleWorkFlow(row);
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "承保流程",
        type: "danger",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          const data = {
            sysType: row.objExt,
            objId: row.objId,
          }
          dzmodal
            .open(TaskListVestige, { type: "Issuer", data: data })
            .then((res) => {
              if (res.type === "ok") {
                handleQuery(true);
              }
            });
        },
      }),
    ],

    fromSchema: [
      {
        prop: "objId",
        inputtype: "rtinput",
        title: "投保单号",
      },
      {
        prop: "uwDptName",
        inputtype: "rtinput",
        title: "承保机构",
      },
      {
        prop: "prodName",
        inputtype: "rtinput",
        title: "产品名称",
      },
      {
        prop: "appCde",
        inputtype: "rtinput",
        title: "投保人",
      },
      {
        prop: "bsTm1",
        inputtype: "rtdatepicker",
        title: "投保日期",
      },
      {
        prop: "preUserName",
        inputtype: "rtinput",
        title: "任务提交人",
      },
      {
        prop: "preDptName",
        inputtype: "rtinput",
        title: "任务提交部门",
        minWidth:220,
      },
      {
        prop: "crtTm",
        inputtype: "rtdatepicker",
        title: "提交时间",
      },
      {
        prop: "curtUserName",
        inputtype: "rtinput",
        title: "任务接收人",
      },
      {
        prop: "state",
        inputtype: "rtinput",
        title: "任务状态",
      },
    ],
  })
);

onMounted(async () => {
    freeEditRef.value?.setValue("dateRange", [
        moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format('YYYY-MM-DD 00:00:00'),
        moment(new Date()).format('YYYY-MM-DD 23:59:59')
    ]);
});

watch(
  () => props.refreshData,
  (n,o) => {
    // 自动刷新列表获取数据
    // pageresult.list = [
    //   {},{}
    // ]
    // pageresult.total = 2;
    // // 上面代码是仅用于本地调试
    // if(n) {
    //   console.log(n,'投保待撤回任务')
    //   // handleQuery(true);
    // }
  },
  { 
    deep: true,
    immediate: true
  },
);


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
  let roleCde = '';
  roles.forEach((res: any) => {
    roleCde = roleCde === '' ? res.COpgrpCde : roleCde + ',' + res.COpgrpCde;
  });

  const tmArr = freeEditRef.value?.getValue("dateRange");
  const issueStartTemp = tmArr[0];
  const issueEndTemp = tmArr[1];
  const issueStart = Date.parse(issueStartTemp);
  // if (!issueStartTemp) {
  //   ElMessage.warning('投保起期不能为空');
  //   return;
  // }
  // if (!issueEndTemp) {
  //   ElMessage.warning('投保止期不能为空');
  //   return;
  // }
  const issueEnd = Date.parse(issueEndTemp);
  // if (issueStart - issueEnd > 0) {
  //   ElMessage.warning('投保起期不能大于投保止期');
  //   return;
  // }
  if (issueEnd - issueStart >= 7 * 1000 * 60 * 60 * 24) {
    ElMessage.warning('投保时间范围请控制在7天以内');
    return;
  }

  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据

  const params = Object.assign({
    startBsTm1: issueStartTemp,
    endBsTm1: issueEndTemp,
    orgCde: user.value.companyId,
    roleCde: roleCde,
    operId: user.value.opCde,
    udrType: '5',
  }, s, r);
  delete params.dateRange;
  let udrData;
  if ('3' === udrType.value) {
    udrData = getBackUdrList(params);
  } else if ('4' === udrType.value) {
    udrData = getReturnUdrList(params);
  } else if ('5' === udrType.value) {
    udrData = getWithdrawUdrList(params);
  } else {
    udrData = getNewUdrList(params);
  }
  udrData.then((res) => {
    const { code, data, msg ,totalCount} = res;
    if (200 === code) {
      pageresult.list = [];
      pageresult.list = data;
      pageresult.total = totalCount;
    } else {
      ElMessage.error(msg);
    }
  })
  .finally(() => {});
}

// 工作流处理
function handleWorkFlow(row: any) {
  const { objId, curtTask } = row;
  const param = {
      taskId: curtTask,
      appNo: objId,
      user: user.value,
  };
  withdraw(param).then((result: any) => {
    if (result.code !== 200) {
      ElMessage.error({ message: result.msg, duration: 3000 });
    } else {
      if (result.msg === '撤回成功!') {
        ElMessage.success({ message: result.msg, duration: 6000 });
      } else {
        ElMessage.warning({ message: result.msg, duration: 6000 });
      }
      handleQuery(true);
    }
  }).catch((error: any) => {
    console.log('出错了', error);
    ElMessage.error({ message: '后台服务异常,请联系管理员', duration: 3000 });
  });
}
//给表单下拉项赋值
function setFormItem(key, obj) {
    if (obj && Object.keys(obj).length) {
        formconfig1.fromSchema?.forEach((item) => {
            if (item.prop === key) {
                Object.assign(item, obj);
            }
        });
    }
}
</script>

<style scoped></style>

<!-- 待修改单查询 -->
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
import { useRoute, useRouter, RouteRecordRaw } from "vue-router";
const { getRules } = useValidator();
const props = defineProps({
  homeJumpData: {
    type: Object
  },
  refreshData: {
    type: Boolean,
    default: false
  }
})
import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

import { codeListViewStore } from "@/store";
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype, JBPMState } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import {
    SCENE_EDR_APP_MODIFY_BOUNCED,
    SCENE_EDR_APP_MODIFY_BOUNCEDBEARER,
    SCENE_PLY_APP_MODIFY_BOUNCED
} from '@/constants/tab-constants';
import { useDzModal } from "@/common/dzmodel/DzModalService";
import moment from 'moment';
import { NewUdrListService } from "@/views/pcis-new-udr-list/service/new-udr-list.service";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
const { hasReceived, getBaseInfoByAppNo, delTmpPolicy, getBackUdrList, getReturnUdrList, getWithdrawUdrList, getNewUdrList } = NewUdrListService();
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId:'', opCde:'' })
const roles = userStore.user.roles || [];
const router = useRouter();
const route = useRoute();
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const TaskListVestige = defineAsyncComponent(
  () => import("@/views/pcis-new-udr-list/common/TaskListVestige.vue")
);
const udrType = ref('4');
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
        setValue("prodNo", "")
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
        defaultValue: [
          moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format('YYYY-MM-DD 00:00:00'),
          moment(new Date()).format('YYYY-MM-DD 23:59:59')
        ],
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
        tooltip: "接收",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {
          handleWorkFlow(row);
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "删除",
        type: "danger",
        size: "large",
        icon: "Delete",
        tableClick: (row) => {
          handleDelete(row.objId, row.id);
        },
      }),
    ],

    fromSchema: [
      {
        prop: "objId",
        inputtype: "rtinput",
        title: "申请单号",
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
        prop: "state",
        inputtype: "rtselect",
        title: "任务状态",
        loadData: JBPMState,
      },
    ],
  })
);

onMounted(async () => {
    freeEditRef.value?.setValue("dateRange", [
        moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format('YYYY-MM-DD 00:00:00'),
        moment(new Date()).format('YYYY-MM-DD 23:59:59')
    ]);
  if(props.homeJumpData && Object.keys(props.homeJumpData).length) {
    await nextTick()
    // 给投保日期赋值
    freeEditRef.value.setValue('dateRange', [props.homeJumpData.startBsTm1, props.homeJumpData.endBsTm1])
    if(props.homeJumpData.hasOwnProperty('objId')) { //申请单号
      freeEditRef.value.setValue('objId', props.homeJumpData.value.objId)
    }
    await nextTick()
    handleQuery(true) //跳转过来自动查数据
  }
});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

watch(
  () => props.refreshData,
  (n,o) => {
    // // 自动刷新列表获取数据
    // pageresult.list = [
    //   {},{}
    // ]
    // pageresult.total = 2;
    // // 上面代码是仅用于本地调试
    // if(n) {
    //   console.log(n,'待修改单查询')
    //   // handleQuery(true);
    // }
  },
  { 
    deep: true,
    immediate: true
  },
);


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
    // roleCde = roleCde === '' ? res.COpgrpCde : roleCde + ',' + res.COpgrpCde;
    roleCde = res
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
    udrType: '5'
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
    const { code, data, msg, totalCount } = res;
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

// 多选事件
function handleSelectionChange(selection: any) {
  console.log('selection',selection)
  removeIds.value = selection.map((item: any) => item.cPkId);
}

// 工作流处理
function handleWorkFlow(row: any) {
  const { objId, curtTask, state, prodNo, bsType } = row;
  const param = {
    taskId: curtTask,
    user: user.value,
  };
  hasReceived(param).then((result: any) => {
    if (result.code !== 200) {
      ElMessage.error({ message: result.msg, duration: 6000 });
    } else {
      if (result.msg === '成功') {
        getBaseInfoByAppNo({ appNo: objId }).then((r) => {
          if(r.code !== 200) {
            ElMessage.error({ message: r.msg, duration: 6000 });
          }else{
            if(bsType === 'A') {
              const en = JSON.stringify({
                scene: SCENE_PLY_APP_MODIFY_BOUNCED,
                cAppNo: objId,
                cProdNo: prodNo,
                taskId: curtTask,
                cAppTyp: bsType,
                cCiMrk: r.data.cCiMrk,
                cGrpMrk: r.data.cGrpMrk,
                cDptCde: r.data.cDptCde,
                cDptCnm:row.uwDptName,
                isPlan: r.data.cCardPlanNo ? 'Y' : null,
                pageType:'PLY_APP_MODIFY_BOUNCED_SCENE'
              });
              router.push({
                  path: "/pcisapp/myPage",
                  query: {
                      param: en,
                  },
              });
            }else{
              const en = JSON.stringify({
                // scene: SCENE_EDR_APP_MODIFY_BOUNCED,
                cAppNo: objId,
                cProdNo: prodNo,
                taskId: curtTask,
                cAppTyp: bsType,
                cCiMrk: r.data.cCiMrk,
                cRsnCde: r.data.cEdrRsnBundleCde,
                cEdrType: r.data.cEdrType,
                cGrpMrk: r.data.cGrpMrk,
                cDptCde: r.data.cDptCde,
                cDptCnm:row.uwDptName,
                isPlan: r.data.cCardPlanNo ? 'Y' : null,
                pageType:'EDR_APP_MODIFY_BOUNCED_SCENE'
              });
                router.push({
                    path: "/pcisapp/myPage",
                    query: {
                        param: en,
                    },
                });
            }
          }
        })
      } else {
        ElMessage.warning({ message: result.msg, duration: 6000 });
      }
    }
  }).catch((error: any) => {
    console.log('出错了', error);
    ElMessage.error({ message: '后台服务异常,请联系管理员', duration: 3000 });
  });
}

/** 删除 */
function handleDelete(objId: any,id: any) {
  if (null == objId || null == id) {
    ElMessage.error({ message: '必需参数为空', duration: 3000 });
    return;
  }

  ElMessageBox.confirm("该数据删除之后将无法恢复。", "确认要删除吗？", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(function () {
    delTmpPolicy({ cAppNo: objId, id: id }).then((result: any) => {
      if(result.code == 200){
        ElMessage.success({ message: result.msg, duration: 3000 });
        handleQuery(true);
      }else{
        ElMessage.error({ message: result.msg, duration: 6000 });
      }
    })
  });
}
//给表单下拉项赋值
function setFormItem(key: any, obj: any) {
  if (obj && Object.keys(obj).length) {
    formconfig1.fromSchema?.forEach((item) => {
      if (item.prop === key) {
        //控制尾部按钮的
        if (item.btnItems && obj.btnItems) {
          for (let key in obj.btnItems) {
            item.btnItems[key] = obj.btnItems[key];
          }
        }else{
          Object.assign(item, obj);
        }
      }
    });
  }
}
function setValue(key: string, value: any) {
    freeEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return freeEditRef?.value?.getValue(key);
}
defineExpose({
  setValue,
  getValue,
});
</script>

<style scoped></style>

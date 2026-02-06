<template>
  <el-dialog v-model="dialogVisible" width="70%">
    <el-config-provider :locale="locale">
      <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    </el-config-provider>
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
const applicantEditRef = ref<AppFreeEditMethod | null>(null);
import { defineComponent, ref, reactive, onMounted } from "vue";
import { getListByCode } from "@/api/code-list-service";
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
import { AppKey } from "@/constants/api";
import { useUserStore } from "@/store/modules/user";
import { useValidator } from "@/typings/useValidator";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

import { createFreeButtonBase } from "@/shared/button-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { listChrDepts } from "@/api/dept";
import dayjs from "dayjs";
import { useAppStore } from "@/store";
const appStore = useAppStore();
const locale = computed(() => appStore.locale);
import { cannotCopy } from '@/utils/cannotCopyPlyNo';

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => {{
      return {};
    }},
  },
});
const emits = defineEmits(["ok"]);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const userStore = useUserStore();
const { getRules } = useValidator();
const policyService = new PolicyService();
// const user = userStore.user
const user = ref(userStore.user);
import { SysOperatorMgrService } from "@/views/sys-right-basic/service/sys-operator-mgr.service";
const sysOperatorMgrService = new SysOperatorMgrService();

const dialogVisible = ref(true);

const C_ANTI_LNDER_RISK_APP = "0";
const C_ANTI_LNDER_RISK_PLY = "1";

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    fromUi: {
      cols: 2,
    },
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          freeEditRef.value?.validate().then((isValid:boolean) => {
            if (isValid) {
              handleQuery();
            }
          })
        }
      }),
      createFreeButtonBase({
        label: "确认",
        func: () => {
          confirm();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "queryType",
        inputtype: "rtradio",
        title: "单据",
        loadData: [
          { label: "投保单", value: '3' },
          { label: "保单", value: '2' },
        ],
        // defaultValue: 1,
        keymap: {
          y: 1,
          n: 0,
        },
        rules: [getRules("required", {})],
      },
      // {
      //   prop: "CDptCde",
      //   inputtype: "rtselect",
      //   title: "出单机构",
      //   typeCode: "CDptCde_List",
      //   params: { CDptCde: user?.companyId },
      //   clearable: true,
      //   rules: [getRules("required", {})],
      // },
      {
        prop: "dptCde",
        inputtype: "rtselect",
        title: "分公司",
        loadData: [],
        clearable: true,
        rules: [getRules("required", {})],
        func: (val: any) => {
          freeEditRef.value?.setValue("cDptCde", "");
          if (val) {
            getCDptCdeOptions(val);
          } else {
            setFormItem("cDptCde", {
              loadData: [],
            });
          }
        },
      },
      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "承保机构",
        loadData: [],
        clearable: true,
        rules: [getRules("required", {})],
      },
      {
        prop: "cLoadSub",
        inputtype: "rtcheckbox",
        title: "是否包含下级",
        defaultValue: 1,
        keymap: {
          y: 1,
          n: 0,
        },
      },
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "KIND_LIST_GRT",
        codeParam: { cOperId: user["opCde"], cDptCde: user["companyId"] },
        rules: [getRules("required", {})],
        clearable: true,
        func: (val: any) => {
          freeEditRef.value?.setValue("cProdNo", "");
          if (val) {
            setFormItem("cProdNo", {
              typeCode: "PROD_LIST_GRT",
              codeParam: {
                cParCde: val,
                cOperId: user["opCde"],
                cDptCde: user["companyId"],
              },
            });
          } else {
            setFormItem("cProdNo", {
              typeCode: "",
            });
          }
        },
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "产品",
        clearable: true,
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
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "单号",
        clearable: true,
      },
      {
        prop: "cAppNme",
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
  total: 0,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    showSelection: true,
    isRadio: true,
    fromSchema: [
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "承保机构",
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "产品",
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "保费",
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
      },
      {
        prop: "tAppTm",
        inputtype: "rtinput",
        title: "投保申请日期",
        formatter: (val: any) => {
          return val
            ? val.replace(/T/g, " ")
            : "";
        },
      },
      {
        prop: "cCnm",
        inputtype: "rtinput",
        title: "状态",
      },
    ],
  })
);

const selected:any = ref([]);
const displayData = ref("");
const selectedGrpMrk = ref("");
const selectedCiMrk = ref("");

const handleQuery = (flag = true) => {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const formData = freeEditRef.value?.getFromValue(); //获取表单数据
  // 查询时间段验证
  const startTemp = formData.tm ? formData.tm[0] : "";
  if (!startTemp) {
    ElMessage.warning("投保起期不能为空");
    return;
  }
  const start = Date.parse(startTemp);
  const endTemp = formData.tm && formData.tm[1] ? formData.tm[1] : "";
  if (!endTemp) {
    ElMessage.warning("投保止期不能为空");
    return;
  }
  const end = Date.parse(endTemp);
  if (start - end > 0) {
    ElMessage.warning("投保起期不能大于投保止期");
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
    ElMessage.warning("投保时间范围请控制在1个月以内");
    return;
  }
  const param = {
    pageSize: 10,
    pageNum: 1,
    ...r,
    ...formData,
    tAppTmStart: formData.tm ? formData.tm[0] : "",
    tAppTmEnd: formData.tm ? formData.tm[1] : "",
  }
  if(formData.queryType === '2') {
    // 保单
    param.cPlyNo = formData.cAppNo; // 保单号
    delete param.cAppNo;
  } 
  sysOperatorMgrService.qureyAppPolicyListForCopy(param).then((res: any) => {
    if (res && res.code === 200) {
      const pageData = res.data;
      if (pageData) {
        pageresult.total = pageData.total;
        pageresult.list = pageData.data;
      } else {
        pageresult.total = 0;
        pageresult.list = [];
      }
    } else {
      ElMessage.error(res.msg);
    }
  }).catch((error: any) => {
    ElMessage.error(error);
  });
};
const handleSelectionChange = (selection: any) => {
  if (selection.length < 1) {
    selected.value = [];
    displayData.value = "";
    selectedGrpMrk.value = "";
    selectedCiMrk.value = "";
  } else if (selection.length > 1) {
    const table = tableRef.value;
    if (table) {
      // 清除所有选中
      table.clearSelection();
      // 只选中当前行
      table.toggleRowSelection(selection[1], true);
    }
  } else {
    selected.value = selection;
    displayData.value = selected.value[0].cAppNo;
    selectedGrpMrk.value = selected.value[0].cGrpMrk;
    selectedCiMrk.value = selected.value[0].cCiMrk;
  }
};

const initDptTreeList = () => {
  let root = user.value["companyId"];
  // if (user.value && user.value.companyId) {
  //   root = user.value.companyId;
  // }
  const params = {
    pId: root,
  };
  sysOperatorMgrService
    .getOrgDptTreeNodeById(params)
    .then((res) => {
      if (res && res["data"]) {
        if (_nodes.value.length === 0) {
          _nodes.value = [];
        }
        const data = res["data"];
        if (res["data"]) {
          _nodes.value.push({
            id: root,
            name: res["data"]["name"],
            leaf: false,
          });
        }
      }
    })
    .catch((error) => {
      ElMessage.error("后台服务异常,请联系管理员");
    });
};

const initCDptCde = () => {
  if ("0200000000000" === userStore.user.companyId) {
    listChrDepts({ cDptCde: userStore.user.companyId, cDptCls: "1" }).then(
      (res: any) => {
        if (res.code === 200) {
          setFormItem("dptCde", {
            loadData: res.data.map((item: any) => ({
              value: item.cDptCde,
              label: item.cDptCnm,
            })),
          });
        }
      }
    );
  } else {
    setFormItem("dptCde", {
      loadData: [
        {
          value: userStore.user.companyId,
          label: userStore.user.companyCnm,
        },
      ],
    });
  }
};

const getCDptCdeOptions = (data: any) => {
  listChrDepts({ cDptRelCde: data, cSignDptMrk: "1", cDptCls: "2" })
    .then((res: any) => {
      if (res.code === 200) {
        setFormItem("cDptCde", {
          loadData: res.data.map((item: any) => ({
            value: item.cDptCde,
            label: item.cDptCnm,
          })),
        });
      }
    })
    .catch((err) => console.error(err));
};

onMounted(() => {
  nextTick(() => {
    freeEditRef.value?.setValue("queryType", '3');// 默认选中投保单
    freeEditRef.value?.setValue("dptCde", props.data.dptCde || null);
    freeEditRef.value?.setValue("cKindNo", props.data.cProdNo ? props.data.cProdNo.slice(0, 2) : null)
    freeEditRef.value?.setValue("tm", [dayjs().subtract(7, 'day').format("YYYY-MM-DD HH:mm:ss"), dayjs().format("YYYY-MM-DD HH:mm:ss")]);
    nextTick(() => {
      freeEditRef.value?.setValue("cDptCde", props.data.cDptCde || null);
      freeEditRef.value?.setValue("cProdNo", props.data.cProdNo || null);
    });
  })
  // initDptTreeList();
  initCDptCde();
});

const confirm = async () => {
  if (!displayData.value) {
    ElMessage.warning("请选择一条记录");
    return;
  } else {
    if (selectedGrpMrk.value !== props.data.cGrpMrk) {
      ElMessage.error("原保单和新单的团个单类型不同, 不允许复制");
      return;
    }
    if (selectedCiMrk.value !== props.data['plyBase']["Base.cCiMrk"]) {
      ElMessage.error("原保单和新单的共保方式不同, 不允许复制");
      return;
    }
    if (selected.value[0].cPlyNo?.length > 18) {
      ElMessage.error("历史数据的保单, 不允许复制");
      return;
    }
    if (cannotCopy(selected.value[0].cPlyNo)) {
      ElMessage.error("该保单不允许复制");
      return;
    }
    // 点击下一步前校验，如果data为true则继续，否则阻断并提示
    const queryProdDptCdeParam:any = { cDptCde:  user.value.companyId, cProdNo: selected.value[0].cProdNo }
    if(selected.value[0].cRenewMrk === "1") {
        queryProdDptCdeParam['cPlyNo'] = selected.value[0].cPlyNo
    }
    const queryProdDptCde:any = await policyService.queryProdDptCde(queryProdDptCdeParam)
    if(queryProdDptCde.data !== true) {
        ElMessage.error(queryProdDptCde.msg)
        return
    }
    dialogVisible.value = false;
    //关闭模态框并传递数据
    emits("ok", {
      cAppNo: displayData.value,
      queryType: freeEditRef.value?.getValue("queryType"),
      dptCde: freeEditRef.value?.getValue("dptCde"),
      cDptCde: freeEditRef.value?.getValue("cDptCde"),
      cProdNo: freeEditRef.value?.getValue("cProdNo"),
      cRenewMrk: selected.value[0].cRenewMrk,
      cGrpMrk: selectedGrpMrk.value,
      pageType:"copy",
      cCiMrk: selected.value[0].cCiMrk,//共保方式
      cDptCnm: selected.value[0].cDptCnm,//承保机构名称
      cTermNme: selected.value[0].cTermNme,//条款名称
      cTermNo: selected.value[0].cTermNo,// 条款code值
      cProdNme: selected.value[0].cProdNme,//产品名称
      cPolicySource: selected.value[0].cPolicySource,
    });
  }
};
function getFromValue() {
  return applicantEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  applicantEditRef?.value?.setFormValue(value);
}

function validate() {
  return applicantEditRef?.value?.validate();
}

function setValue(key: string, value: any) {
  applicantEditRef?.value?.setValue(key, value);
}

function getValue(key: string) {
  return applicantEditRef?.value?.getValue(key);
}
function getFormconfig() {
  return formconfig1;
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
        } else {
          Object.assign(item, obj);
        }
      }
    });
  }
}
defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  getFormconfig,
});
</script>

<style scoped lang="scss">
.searchSty {
  padding: 25px 20px 15px 10px;
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 5px;
}
:deep(.el-table__header .el-checkbox) {
  display: none;
}
</style>

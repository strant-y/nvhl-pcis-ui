<!-- 产品组合出单查询 -->
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
import { useRouter, useRoute } from "vue-router";
const { getRules } = useValidator();
const router = useRouter();
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
import { getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import moment from "moment";
import {
  SCENE_PLY_APP_MODIFY_UNSUBMIT,
  SCENE_TEMPORARY_DEPOSITBEARER,
  SCENE_EDR_APP_MODIFY_UNSUBMIT,
} from "@/constants/tab-constants";
import { PcisQueryService } from "@/views/payinfoManagement/service/pcis-query-service";
const pcisQueryService = new PcisQueryService();
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
);
const TaskListVestige = defineAsyncComponent(
  () => import("@/views/pcis-new-udr-list/common/TaskListVestige.vue")
);
const props = defineProps({
  refreshData: {
    type: Boolean,
    default: false,
  },
});
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
          freeEditRef.value?.setFormValue({
            dateRange: [
              moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format(
                "YYYY-MM-DD 00:00:00"
              ),
              moment(new Date()).format("YYYY-MM-DD 23:59:59"),
            ],
            orgCde: user.value.companyId,
            CLoadSub: 1,
            CCombinationNo: null,
            CAppNme: null,
            CAppStatus: null
          });
          setFormItem("orgCde", {loadData: [{
            label: user.value.companyCnm,
            value: user.value.companyId,
          }]});
          handleQuery(true);
          // freeEditRef.value?.resetForm();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "orgCde",
        inputtype: "rtselect",
        title: "核保机构",
        btnWidth: 10,
        itemWidth: 2,
        defaultValue: user.value.companyId,
        rules: [getRules("required", {})],
        showExBtn: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            dzmodal
              .open(departmentTree, { type: "Issuer", data: {} })
              .then((res:any) => {
                if (res.body) {
                  const selectObj = res.body;
                  let obj = {
                    loadData: [
                      {
                        label: selectObj.label,
                        value: selectObj.id,
                      },
                    ],
                  };
                  freeEditRef.value?.setValue(
                      "orgCde",
                      selectObj.id
                  );
                  setFormItem("orgCde", obj);
                }
              });
          },
        },
        loadData: [
          {
            label: user.value.companyCnm,
            value: user.value.companyId,
          }
        ]
      },
      {
        prop: "CLoadSub",
        inputtype: "rtcheckbox",
        title: "是否包含下级",
        defaultValue: 1,
        keymap: {
          y: 1,
          n: 0,
        },
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
          moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format(
            "YYYY-MM-DD 00:00:00"
          ),
          moment(new Date()).format("YYYY-MM-DD 23:59:59"),
        ],
      },
      {
        prop: "CCombinationNo",
        inputtype: "rtinput",
        title: "组合产品单号",
        clearable: true,
      },
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
        clearable: true,
      },
      {
        prop: "CAppStatus",
        inputtype: "rtselect",
        title: "状态",
        typeCode: "RECEIVE_BANK_CATEGORY",
        codeParam: { cParCde: "shenqingdanzhuangtai" },
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
    editFlag: true,
    editList: ["cStatus"],
    tableBtnType: "btn",
    tableBtnWidth: 160,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "查看",
        type: "info",
        size: "large",
        icon: "View",
        hideBtns: (row) => {
          if (row.cAppStatus == 3 || row.cAppStatus == 8) return false;
        },
        tableClick: (row) => {
          handleDetail(row);
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        hideBtns: (row) => {
          if (
            row.cAppStatus !== 1 &&
            row.cAppStatus !== 3 &&
            row.cAppStatus !== 8
          )
            return false;
        },
        tableClick: (row) => {
          handleEdit(row);
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "删除",
        type: "danger",
        size: "large",
        icon: "Delete",
        hideBtns: (row) => {
          if (
            row.cAppStatus !== 1 &&
            row.cAppStatus !== 3 &&
            row.cAppStatus !== 8
          )
            return false;
        },
        tableClick: (row) => {
          handleDelete(row);
        },
      }),
    ],

    fromSchema: [
      {
        prop: "cCombinationNo",
        inputtype: "rtinput",
        title: "组合产品单号",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "机构",
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人名称",
      },
      {
        prop: "tAppTm",
        inputtype: "redatepicker",
        title: "投保日期",
      },
      {
        prop: "nAmt",
        inputtype: "rtnumber",
        title: "保额",
      },
      {
        prop: "nPrm",
        inputtype: "rtnumber",
        title: "保费",
      },
    ],
  })
);

onMounted(async () => {});

watch(
  () => props.refreshData,
  (n, o) => {
    // 自动刷新列表获取数据
    pageresult.list = [
      {
        cAppStatus: 1,
        cCombinationNo: "组合产品单号",
        cDptCnm: "机构",
        cAppNme: "投保人名称",
        tAppTm: "2022-01-01",
        nAmt: "10000",
        nPrm: "1000",
      },
      {
        cAppStatus: 2,
        cCombinationNo: "组合产品单号",
        cDptCnm: "机构",
        cAppNme: "投保人名称",
        tAppTm: "2022-01-01",
        nAmt: "10000",
        nPrm: "1000",
      },
      {
        cAppStatus: 3,
        cCombinationNo: "组合产品单号",
        cDptCnm: "机构",
        cAppNme: "投保人名称",
        tAppTm: "2022-01-01",
        nAmt: "10000",
        nPrm: "1000",
      },
      {
        cAppStatus: 4,
        cCombinationNo: "组合产品单号",
        cDptCnm: "机构",
        cAppNme: "投保人名称",
        tAppTm: "2022-01-01",
        nAmt: "10000",
        nPrm: "1000",
      },
      {
        cAppStatus: 5,
        cCombinationNo: "组合产品单号",
        cDptCnm: "机构",
        cAppNme: "投保人名称",
        tAppTm: "2022-01-01",
        nAmt: "10000",
        nPrm: "1000",
      },
      {
        cAppStatus: 6,
        cCombinationNo: "组合产品单号",
        cDptCnm: "机构",
        cAppNme: "投保人名称",
        tAppTm: "2022-01-01",
        nAmt: "10000",
        nPrm: "1000",
      },
      {
        cAppStatus: 7,
        cCombinationNo: "组合产品单号",
        cDptCnm: "机构",
        cAppNme: "投保人名称",
        tAppTm: "2022-01-01",
        nAmt: "10000",
        nPrm: "1000",
      },
      {
        cAppStatus: 8,
        cCombinationNo: "组合产品单号",
        cDptCnm: "机构",
        cAppNme: "投保人名称",
        tAppTm: "2022-01-01",
        nAmt: "10000",
        nPrm: "1000",
      },
    ];
    pageresult.total = 8;
    // 上面代码是仅用于本地调试
    if (n) {
      console.log(n, "产品组合出单查询");
      // handleQuery(true);
    }
  },
  {
    deep: true,
    immediate: true,
  }
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
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
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
        ElMessage.warning("投保时间范围请控制在7天以内");
        return;
      }

      const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
      const s = freeEditRef.value?.getFromValue(); //获取表单数据
      const param = Object.assign(
        {
          TAppTmStart: issueStartTemp,
          TAppTmEnd: issueEndTemp,
          sortField: "name",
          CAppTyp: "A",
          // sortOrder: sortValue, //排序？
          CurrentUser: user.value.opCde,
          CurrentUserOrg: user.value.companyId,
        },
        s,
        r
      );
      pcisQueryService
        .getExpirationPolicyList(param)
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
            pageresult.list = [];
            pageresult.list = data.result;
            pageresult.total = data.total;
          }
        })
        .finally(() => {});
    }
  });
}

// 多选事件
function handleSelectionChange(selection: any) {
  console.log("selection", selection);
  removeIds.value = selection.map((item: any) => item.cPkId);
}

// 查看详情
function handleDetail(row: any) {
  const src = {
    scene: "SCENE_PLY_APP_MODIFY_UNSUBMIT",
    CCombiNo: row.cCombinationNo,
    CAppTyp: row.cAppTyp,
  };
  const en = JSON.stringify(src);
  router.push({
    path: "/index/pcis-combination-query/detail",
    query: {
      data: en,
    },
  });
}

// 编辑
function handleEdit(row: any) {
  const CAppTyp = row.cAppTyp;
  let scene = SCENE_PLY_APP_MODIFY_UNSUBMIT;
  if (CAppTyp === "E") {
    scene =
      row.cEdrRsnBundleCde === "BL"
        ? SCENE_TEMPORARY_DEPOSITBEARER
        : SCENE_EDR_APP_MODIFY_UNSUBMIT;
  }
  const src = {
    scene: scene,
    CCombiNo: row.cCombinationNo,
    CAppTyp: CAppTyp,
  };
  const en = JSON.stringify(src);
  router.push({
    path: "/index/pcis-combination-application/edit",
    query: {
      data: en,
    },
  });
}

// 删除
function handleDelete(row: any) {
  ElMessageBox.confirm("该数据删除之后将无法恢复。", "确认要删除吗？", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      pcisQueryService
        .delTmpCombinaton({ combinationNo: row.cCombinationNo })
        .then((res: any) => {
          if (res.code === 200) {
            ElMessage.info({ message: res.msg, duration: 3000 });
            handleQuery(true);
          } else {
            ElMessage.error({ message: res.msg, duration: 3000 });
          }
        });
    })
    .catch((err) => {
      console.log(err);
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
</script>

<style scoped></style>

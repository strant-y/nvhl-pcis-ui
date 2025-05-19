<!-- 保单到期查询 -->
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
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
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
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { SCENE_PLY_APP_READ } from "@/constants/tab-constants";
import { PcisQueryService } from "@/views/payinfoManagement/service/pcis-query-service";
const pcisQueryService = new PcisQueryService();
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });
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
          freeEditRef.value?.setFormValue({
            NExpirationDays: "",
            orgCde: user.value.companyId,
            CLoadSub: 1,
            cKindNo: null,
            cProdNo: null,
            CPlyNo: null
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
        rules: [{ type: "required" }],
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
        title: "包含下级机构",
        showKey: [5],
        defaultValue: 1,
        keymap: {
          y: 1,
          n: 0,
        },
      },
      {
        prop: "NExpirationDays",
        inputtype: "rtnumber",
        step: 1,
        max: 7,
        min: 0,
        defaultValue: 3,
        title: "保单到期剩余天数",
        rules: [getRules("required", {})],
        clearable: true,
        // func:(val)=>{
        //   if(val <= 8){
        //     console.log("9999999999",val)
        //   }
        // }
      },
      // {
      //   prop: "CKindNo",
      //   inputtype: "rtselect",
      //   title: "产品大类",
      //   typeCode: "KIND_LIST_GRT",
      //   params: { cOperId: user.value.opCde, cDptCde: user.value.companyId },
      //   clearable: true,
      // },
      // {
      //   prop: "CProdNo",
      //   inputtype: "rtselect",
      //   title: "条款",
      //   typeCode: "PROD_LIST_GRT",
      //   params: { cParCde:'', cOperId: user.value.opCde, cDptCde: user.value.companyId },
      //   clearable: true,
      // },
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "产品大类",
        itemWidth: 1,
        rules: [{ type: "required" }],
        typeCode: "KIND_LIST_GRT",
        child: "cProdNo",
        filterable: true,
        clearable: true,
        codeParam: {
          cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
          cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        },
        func: (val) => {
          cPard.value = val;
          codeListStore
            .queryCodeList({
                codeListName: "TERM_LIST_IN_GUIDE_NEW",
                codeListParam:{
                cParCde: cPard.value,
                cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
                cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
            },
            })
            .then((res) => {
                setFormItem("cProdNo", {
                    loadData: res,
                });
            });
        },
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "条款",
        itemWidth: 1,
        rules: [{ type: "required" }],
        filterable: true,
        clearable: true,
        // typeCode: "TERM_LIST_IN_GUIDE_NEW",
        // codeParam: {
        //   cParCde: cPard.value,
        //   cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
        //   cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
        // },
        func: (val) => {},
      },
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "保单号",
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
    tableBtnWidth: 90,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "查看",
        type: "danger",
        size: "large",
        icon: "View",
        tableClick: (row) => {
          showDetails(row);
        },
      }),
    ],

    fromSchema: [
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "机构",
      },
      {
        prop: "cTermNme",
        inputtype: "rtinput",
        title: "条款",
      },
      {
        prop: "nExpirationDays",
        inputtype: "rtinput",
        title: "保单到期剩余天数",
      },
    ],
  })
);

onMounted(async () => {});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

watch(
  () => props.refreshData,
  (n, o) => {
    // 自动刷新列表获取数据
    pageresult.list = [{}, {}];
    pageresult.total = 2;
    // 上面代码是仅用于本地调试
    if (n) {
      console.log(n, "保单到期查询");
      // handleQuery(true);
    }
  },
  {
    deep: true,
    immediate: true,
  }
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
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
      const s = freeEditRef.value?.getFromValue(); //获取表单数据
      const param = Object.assign(
        {
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

// 打开详情
function showDetails(row: any) {
  // const en = JSON.stringify({
  //   scene: SCENE_PLY_APP_READ,
  //   CAppNo: row.cAppNo,
  //   CCiMrk: row.cCiMrk,
  //   CProdNo: row.cProdNo,
  // });
  // router.push({
  //   path: '/index/pcis-query/plyDetails',
  //   query: { data: en }
  // });
  const data = row;
  router.push({
    path: "/pcis/my-page",
    query: {
      param: JSON.stringify({ ...data, ...{ pageType: "edit" } }),
    },
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

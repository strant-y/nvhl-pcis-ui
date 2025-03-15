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
import { useRouter, useRoute } from 'vue-router';
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
import { useDzModal } from "@/common/dzmodel/DzModalService";
import {SCENE_PLY_APP_READ} from '@/constants/tab-constants';
import { PcisQueryService } from "@/views/payinfo/service/pcis-query-service";
const pcisQueryService = new PcisQueryService();
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId:'', opCde:'' })
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
    default: false
  }
})
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
            NExpirationDays: 30,
            CDptCde: user.value.companyId,
            CLoadSub: 1,
          });
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
        title: "包含下级机构",
        showKey: [5],
        defaultValue: 1,
        keymap: {
          y: 1, n: 0
        }
      },
      {
        prop: "objday",
        inputtype: "rtnumber",
        step: 1,
        max: 7,
        min: 0,
        defaultValue: 3,
        title: "保单到期剩余天数",
        rules: [getRules("required", {})],
        clearable: true,
      },
      {
        prop: "CKindNo",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "KIND_LIST_GRT",
        params: { cOperId: user.value.opCde, cDptCde: user.value.companyId },
        clearable: true,
      },
      {
        prop: "CProdNo",
        inputtype: "rtselect",
        title: "条款",
        typeCode: "PROD_LIST_GRT",
        params: { cParCde:'', cOperId: user.value.opCde, cDptCde: user.value.companyId },
        clearable: true,
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
          showDetails(row)
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
        prop: "cProdNmeCn",
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
  (n,o) => {
    // 自动刷新列表获取数据
    pageresult.list = [
      {},{}
    ]
    pageresult.total = 2;
    // 上面代码是仅用于本地调试
    if(n) {
      console.log(n,'保单到期查询')
      // handleQuery(true);
    }
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
  freeEditRef.value?.validate().then((isValid) => {
		if (isValid) {
      const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
      const s = freeEditRef.value?.getFromValue(); //获取表单数据
      const param = Object.assign({
        CurrentUser: user.value.opCde,
        CurrentUserOrg: user.value.companyId
      },s, r);
      pcisQueryService.getExpirationPolicyList(param)
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
    })
}

// 打开详情
function showDetails(row: any) {
  const en = JSON.stringify({
    scene: SCENE_PLY_APP_READ,
    CAppNo: row.cAppNo,
    CCiMrk: row.cCiMrk,
    CProdNo: row.cProdNo,
  });
  router.push({
    path: '/index/pcis-query/plyDetails',
    query: { data: en }
  });
}
</script>

<style scoped></style>

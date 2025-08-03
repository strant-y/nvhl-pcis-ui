<!-- 配置 -->
<template>
  <div class="app-container">
    <el-tabs @tab-click="handleTabClick" v-model="activeName">
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.key"
        :label="tab.name"
        :name="tab.key"
      >
        <!--<div v-if="Number(tab.key) <= 4">-->
          <!--<app-free-edit-->
            <!--:freeEditConfig="formconfig1"-->
            <!--:ref="freeEditRef[Number(tab.key) - 1]"-->
          <!--/>-->
          <!--<app-table-->
            <!--:tableConfig="tableconfig"-->
            <!--v-model:pageresult="pageresult"-->
            <!--:ref="tableRef[Number(tab.key) - 1]"-->
            <!--@selection-change="handleSelectionChange"-->
            <!--@page-change="handleQuery(false)"-->
          <!--/>-->
        <!--</div>-->
        <template v-if="Number(tab.key) == 1">
          <Inquiry-Sheet
                  :refreshData="nowTab === 0 ? true : false"
                  :ref="freeEditRef[0]"
          ></Inquiry-Sheet>
        </template>
        <template v-if="Number(tab.key) == 2">
          <Applicant-Query
                  :refreshData="nowTab === 1 ? true : false"
                  :ref="freeEditRef[1]"
          ></Applicant-Query>
        </template>
        <template v-if="Number(tab.key) == 3">
          <Ply-Query
                  :refreshData="nowTab === 2 ? true : false"
                  :ref="freeEditRef[2]"
          ></Ply-Query>
        </template>
        <template v-if="Number(tab.key) == 4">
          <Edr-Query
                  :refreshData="nowTab === 3 ? true : false"
                  :ref="freeEditRef[3]"
          ></Edr-Query>
        </template>
        <template v-if="Number(tab.key) == 5">
          <withdraw-udrList
            :refreshData="nowTab === 4 ? true : false"
          ></withdraw-udrList>
        </template>
        <template v-if="Number(tab.key) == 6">
          <return-udrList
            :refreshData="nowTab === 5 ? true : false"
            :homeJumpData="homeJumpData"
          ></return-udrList>
        </template>
        <template v-if="Number(tab.key) == 7">
          <policy-expirationQuery
            :refreshData="nowTab === 6 ? true : false"
          ></policy-expirationQuery>
        </template>
        <template v-if="Number(tab.key) == 8">
          <search-batchImpDtl-model
            :refreshData="nowTab === 7 ? true : false"
          ></search-batchImpDtl-model>
        </template>
        <template v-if="Number(tab.key) == 9">
          <combination-query
            :refreshData="nowTab === 8 ? true : false"
          ></combination-query>
        </template>
        <template v-if="Number(tab.key) == 10">
          <e-policy-query
            :refreshData="nowTab === 9 ? true : false"
          ></e-policy-query>
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { AppKey } from "@/constants/api";
import { useUserStore } from "@/store";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

import { ref, watch } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
const freeEditRef = ref([
  ref<AppFreeEditMethod | null>(null),
  ref<AppFreeEditMethod | null>(null),
  ref<AppFreeEditMethod | null>(null),
  ref<AppFreeEditMethod | null>(null),
]);
import { createFreeButtonBase } from "@/shared/button-config";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
import { now } from "lodash";
import { useRoute } from "vue-router";
import moment, { localeData } from "moment";
import dayjs from "dayjs";
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });
const route = useRoute();
const router = useRouter();
const activeName = ref("3");
const queryType = ref("1");
const homeJumpData = ref({}); //接收首页的参数，用于查询条件回显

const tableRef = ref([
  ref<AppTableMethod | null>(null),
  ref<AppTableMethod | null>(null),
  ref<AppTableMethod | null>(null),
  ref<AppTableMethod | null>(null),
]);

// tab 页面切换 1-9
const InquirySheet = defineAsyncComponent(
    // 投保待撤回任务
    () => import("../common/InquirySheetQuery.vue")
);
// tab 页面切换 2-9
const ApplicantQuery = defineAsyncComponent(
    // 投保待撤回任务
    () => import("../common/ApplicantQuery.vue")
);
// tab 页面切换 3-9
const PlyQuery = defineAsyncComponent(
    // 综合查询保单
    () => import("../common/PlyQuery.vue")
);
// tab 页面切换 4-9
const EdrQuery = defineAsyncComponent(
    // 投保待撤回任务
    () => import("../common/EdrQuery.vue")
);
// tab 页面切换 5-9
const WithdrawUdrList = defineAsyncComponent(
  // 投保待撤回任务
  () => import("../common/WithdrawUdrList.vue")
);
const ReturnUdrList = defineAsyncComponent(
  // 待修改单查询
  () => import("../common/ReturnUdrList.vue")
);
const PolicyExpirationQuery = defineAsyncComponent(
  // 保单到期查询
  () => import("../common/PolicyExpirationQuery.vue")
);
const SearchBatchImpDtlModel = defineAsyncComponent(
  // 批量导入查询
  () => import("../common/SearchBatchImpDtlModel.vue")
);
const CombinationQuery = defineAsyncComponent(
  // 产品组合出单查询
  () => import("../common/CombinationQuery.vue")
);
const EPolicyQuery = defineAsyncComponent(
  // 生成电子保单查询
  () => import("../common/EPolicyQuery.vue")
);
const tabs = ref<Array<any>>([
  {
    name: "询价单",
    key: "1",
  },
  {
    name: "申请单",
    key: "2",
  },
  {
    name: "保单",
    key: "3",
  },
  {
    name: "批单",
    key: "4",
  },
  {
    name: "投保待撤回任务",
    key: "5",
  },
  {
    name: "待修改单查询",
    key: "6",
  },
  {
    name: "保单到期查询",
    key: "7",
  },
  // {
  //   name: "批量导入查询",
  //   key: "8",
  // },
  // {
  //   name: "产品组合出单查询",
  //   key: "9",
  // },
  {
    name: "生成电子保单查询",
    key: "10",
  }
]); //tabs数组
const currentTabName = ref("暂存任务"); //tabs默认值
const currentTabKey = ref(0); //tabs默认值
const nowTab = ref(1);

//tabs切换
const handleTabClick = (tab: any) => {
  queryType.value = tab.props.name;
  currentTabName.value = tab.props.label;
  const i = tabs.value.findIndex((item) => item.name === tab.props.label);
  currentTabKey.value = i;
  nowTab.value = i;
};

onMounted(async () => {
  //首页跳转过来的逻辑 Start
  if (sessionStorage.getItem(AppKey.query.pcis_query_app)) {
    //首页 暂存任务跳转过来的,选中投保单
    homeJumpData.value = JSON.parse(
      sessionStorage.getItem(AppKey.query.pcis_query_app)
    );
    activeName.value = "2";
    setTimeout(() => {
      freeEditRef.value[1].value[0].setValue("seeBilling", "A");
      freeEditRef.value[1].value[0].setValue("tIssueTm", [
        homeJumpData.value.TIssueTmStart,
        homeJumpData.value.TIssueTmEnd,
      ]);
      if (homeJumpData.value.hasOwnProperty("CAppNo")) {
        //申请单号
        freeEditRef.value[1].value[0].setValue(
          "cAppNo",
          homeJumpData.value.CAppNo
        );
      }
    }, 500)
  } else if (sessionStorage.getItem(AppKey.query.pcis_query_returnudrlist)) {
    //首页 待修改任务跳转过来的，选中待修改单
    homeJumpData.value = JSON.parse(
      sessionStorage.getItem(AppKey.query.pcis_query_returnudrlist)
    );
    activeName.value = "6";
  } else {
    setTimeout(() => {
      freeEditRef.value[0].value[0].setValue("tIssueTm", [
        dayjs(new Date()).subtract(3, "month").format("YYYY-MM-DD 00:00:00"),
        moment(new Date()).format("YYYY-MM-DD 23:59:59"),
      ]);
    }, 500);
  }
  //首页跳转过来的逻辑 End
});
onUnmounted(() => {
  //组件销毁，清除sessionStorage数据
  sessionStorage.getItem(AppKey.query.pcis_query_app) &&
    sessionStorage.removeItem(AppKey.query.pcis_query_app);
  sessionStorage.getItem(AppKey.query.pcis_query_returnudrlist) &&
    sessionStorage.removeItem(AppKey.query.pcis_query_returnudrlist);
});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};
</script>

<style scoped>
.app-container {
  padding: 6px 30px;
}
/* /deep/ .el-form {
  padding: 5px 30px;
} */
</style>

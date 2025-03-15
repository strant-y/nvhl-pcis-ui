<!-- 批量导入查询 -->
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
import {SCENE_PLY_APP_READ} from '@/constants/tab-constants';
import { NewUdrListService } from "@/views/pcis-new-udr-list/service/new-udr-list.service";
const { getBaseInfoByAppNo } = NewUdrListService();
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
const policyService = new PolicyService();
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId:'', opCde:'' })
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
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
          freeEditRef.value?.resetFields();
          handleQuery(true);
          // freeEditRef.value?.resetForm();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CBatchNo",
        inputtype: "rtinput",
        title: "批次号",
        clearable: true,
      },
      {
        prop: "CStatus",
        inputtype: "rtselect",
        title: "状态",
        clearable: true,
        loadData :[
          { label:'失败',value:'0' },
          { label:'成功',value:'1' },
        ]
      },
      {
        prop: "CApplicantNme",
        inputtype: "rtinput",
        title: "投保人名称",
        clearable: true,
      },
      {
        prop: "CAppNo",
        inputtype: "rtinput",
        title: "申请单号",
        clearable: true,
      },
      {
        prop: "CPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        clearable: true,
      },
      {
        prop: "CInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
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
        hideBtns: (row) => {
          console.log(row.cPlyNo,!!row.cPlyNo)
          if(!!row.cPlyNo) return false;
        },
        tableClick: (row) => {
          showDetails(row)
        },
      }),
    ],

    fromSchema: [
      {
        prop: "cBatchNo",
        inputtype: "rtinput",
        title: "批次号",
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "投保单号",
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
      },
      {
        prop: "cApplicantNme",
        inputtype: "rtinput",
        title: "投保人名称",
      },
      {
        prop: "cInsuredNme",
        inputtype: "rtinput",
        title: "被保人名称",
      },
      {
        prop: "cMsg",
        inputtype: "rtinput",
        title: "消息",
      },
      {
        prop: "cStatus",
        inputtype: "rtinput",
        title: "状态",
        formatter: (val) => {
					const CStatusList = [{value: '0', label: '失败'}, {value: '1', label: '成功'}]
          const result = CStatusList.find(item => item.value === val);
          return result ? result.label : val;
				}
      },
    ],
  })
);

onMounted(async () => {});

watch(
  () => props.refreshData,
  (n,o) => {
    // 自动刷新列表获取数据
    pageresult.list = [
      {
        cPlyNo: "保单号",
      },
      {
        cPlyNo: null,
      }
    ]
    pageresult.total = 2;
    // 上面代码是仅用于本地调试
    if(n) {
      console.log(n,'批量导入查询')
      // handleQuery(true);
    }
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
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign({
    pageNo: r.pageNo,
    pageSize: r.pageSize,
    // sortOrder
    CCrtCde: user.value.opCde
  },s, r);
  policyService.searchBatch(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = [];
        pageresult.list = data.result;
        pageresult.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}

// 打开详情
function showDetails(row: any) {
  getBaseInfoByAppNo({ appNo: row.cAppNo }).then((r) => {
    if(r.code !== 200) {
      ElMessage.error({ message: r.msg, duration: 6000 });
    }else{
      const en = JSON.stringify({
        scene: SCENE_PLY_APP_READ,
        CAppNo: row.cAppNo,
        CProdNo: row.cProdNo,
        CAppTyp: row.cAppTyp,
        CDptCde: row.cDptCde,
        CCiMrk: row.cCiMrk,
        CGrpMrk: row.cGrpMrk,
      });
      router.push({ path: '/index/pcis-query/detail', query: { data: en } });
    }
  })
}
</script>

<style scoped></style>

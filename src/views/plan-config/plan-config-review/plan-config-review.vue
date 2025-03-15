<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
      @page-change="handleQuery(false)" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import {  ElMessage } from 'element-plus';
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
import { useRouter } from 'vue-router';

import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { useValidator } from "@/typings/useValidator";
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const { getRules } = useValidator();

const router = useRouter()
const policyService = new PolicyService();
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
          handleQuery();
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          freeEditRef.value?.resetFields()
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CClntMrk",
        inputtype: "rtselect",
        title: "协议状态",
        typeCode: "RECEIVE_BANK_CATEGORY",
        params: { cParCde: 'appStatus' },
        clearable: true,
        rules: [getRules("required", {})],
        func: (val) => {
        }
      },
      {
        prop: "Base.cKindNo",
        inputtype: "rtcascader",
        title: "产品大类",
        typeCode: "KIND_LIST_CACHE",
        params: { cStatus: '1' },
        clearable: true,
        func: (val) => {
          const item = freeEditRef.value.getFromSchemaItem('PrdProdPlan.CProdNo')
          if(val) { //选择了产品大类作为参数上送
            item.params = {'cKindNo': val}
          } else {
            item.params = {}
          }
        }
      },
      {
        prop: "PrdProdPlan.CProdNo",
        inputtype: "rtcascader",
        title: "条款",
        clearable: true,
        typeCode: "PROD_LIST",
        params: {},
      },
      {
        prop: "PrdProdPlan.CPlanNo",
        inputtype: "rtinput",
        title: "方案编号",
        clearable: true,
      },
      {
        prop: "PrdProdPlan.CTplNme",
        inputtype: "rtinput",
        title: "方案名称",
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
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "处理",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {
          openEdit('update', row)
        },
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "取消接收",
        type: "danger",
        size: "large",
        icon: "Unlock",
        tableClick: (row) => {
          handlerReject(row)
        },
      }),
    ],
    fromSchema: [
      {
        prop: "PrdProdPlan.CPlanNo",
        inputtype: 'rtinput',
        title: "产品大类",
      },
      {
        prop: "PrdProdPlan.CPlanNme",
        inputtype: 'rtinput',
        title: "条款",
      },
      {
        prop: "PrdProdPlan.CDesc",
        inputtype: 'rtinput',
        title: "方案编号",
      },
      {
        prop: "PrdProdPlan.CDesc",
        inputtype: 'rtinput',
        title: "方案名称",
      },
      {
        prop: "PrdProdPlan.CDesc",
        inputtype: 'rtinput',
        title: "审核状态",
      },
      {
        prop: "PrdProdPlan.CDesc",
        inputtype: 'rtinput',
        title: "启用状态",
      },
      {
        prop: "PrdProdPlan.CDesc",
        inputtype: 'rtinput',
        title: "访问类型",
      },
      {
        prop: "PrdProdPlan.CDesc",
        inputtype: 'rtinput',
        title: "方案类型",
      },
    ],
  })
);




//处理
const openEdit = (type: string, row) => {
  router.push({
    path: '/plan-config/plan-info',
    query: { data: JSON.stringify({ type, rowData: row }) }
  })
};

const handlerReject = (row) => {
  //取消接收，调用接口，改变单据状态
}
//转小写
const firstCharUpper = (str: string) => {
  return str.replace(/\b(\w)(\w*)/g, function ($0, $1, $2) {
    return $1.toUpperCase() + $2;
  });
}
/*
* 将后台传入前台的对象中的每个属性的首字母转大写,并拼入模块名
*/
const dtofirstCharUpper = (map: any, key?: any) => {
  const data = {};
  if (key) {
    for (const k in map) {
      if (map[k] != null) {
        data[key + '.' + firstCharUpper(k)] = map[k];
      }
    }
  } else {
    for (const k in map) {
      if (map[k] != null) {
        data[firstCharUpper(k)] = map[k];
      }
    }
  }
  return data;
}

const handleQuery = (flag = true) => {
  freeEditRef.value?.validate().then((isValid) => {
    if(isValid) {
      refreshData(flag)
    } else {
      ElMessage.error("请填写必填项");
    }
  })
}

const refreshData = (reset = true) => {
  const r = tableRef.value?.getPartnerPage(reset); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  policyService.searchPlan(param).then(result => {
    if (result['code'] === 200) {
      ElMessage.success('查询成功');
      const pageData = result['res'];
      if (pageData) {
        pageresult.total = pageData.total;
        pageresult.list = [];
        pageData.result.forEach(value => {
          const data: any = dtofirstCharUpper(value, 'PrdProdPlan');
          pageresult.list.push(data);
        });
      }
    } else {
      ElMessage.error(result['msg']);
    }
  });
};

onMounted(() => {
});


</script>

<style scoped lang="scss">
.container {
  margin: 20px;
}
</style>
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
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { AccumulatedCargo } from '../service/accumulated-cargo';
import { getListByCode } from '@/api/code-list-service';
import { useUserStore } from "@/store/modules/user";

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
const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const userStore = useUserStore();
const user = ref<any>({});
user.value = userStore.user || {};
const accumulatedCargo = new AccumulatedCargo();
const title = ref(' ')
const tableTotal = ref(0)

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    fromUi: {
      cols: 3
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
          title.value = ' '
          freeEditRef.value?.resetFields()
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CClntMrk",
        inputtype: "rtselect",
        title: "风险累计方式",
        typeCode: "",
        loadData: [  //先写死，没有接口
          {
            label: '船舶险风险累计',
            value: '1'
          },
          {
            label: '货运险风险累计',
            value: '2'
          },
          {
            label: '船货风险累计',
            value: '3'
          }
        ],
        params: {},
        clearable: true,
        rules: [getRules("required", {})],
        func: (val) => {
          handleChange(val)
        }
      },
      {
        prop: "CCDate",
        inputtype: "rtdatepicker",
        title: "查询时间",
        type: "datetime",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        rules: [getRules("required", {})],
      },
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        title: "船名",
        clearable: true,
      },
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        title: "航次",
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
  total: 2,
});


const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    showSelection: false,
    title: title,
    fromSchema: [
      {
        prop: "cDptCnm",
        inputtype: 'rtinput',
        title: "保单号",
      },
      {
        prop: "cAppNo",
        inputtype: 'rtinput',
        title: "出单机构",
      },
      {
        prop: "cPlyNo",
        inputtype: 'rtinput',
        title: "被保险人",
      },
      {
        prop: "cProdNmeCn",
        inputtype: 'rtinput',
        title: "起运日期",
      },
      {
        prop: "nPrm",
        inputtype: 'rtinput',
        title: "船名",
      },
      {
        prop: "cAppNme",
        inputtype: 'rtinput',
        title: "航次",
      },
      {
        prop: "tAppTm",
        inputtype: 'rtinput',
        title: "起运地",
      },
      {
        prop: "cAppStatus",
        inputtype: 'rtinput',
        title: "目的地",
      },
      {
        prop: "cAppNme",
        inputtype: 'rtinput',
        title: "起保时间",
      },
      {
        prop: "tAppTm",
        inputtype: 'rtinput',
        title: "终保时间",
      },
      {
        prop: "cAppStatus",
        inputtype: 'rtinput',
        title: "保额/赔偿限额",
      },
    ],
  })
);

const handleQuery = (flag = true) => {
  submitForm(flag)
}


//风险累计方式change
const handleChange = (value: string) => {
  console.log('value', value);
  if (value == '1') {
    title.value = `船舶险累积保额/赔偿限额 ${tableTotal.value}`
  } else if (value == '2') {
    title.value = `货运险累积保额 ${tableTotal.value}`
  } else if (value == '3') {
    title.value = `船货累积保额 ${tableTotal.value}`
  }
}

const submitForm = (flag) => {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      refreshData(flag);
    } else {
      console.log('error submit!!');
      return false;
    }
  });
};

const refreshData = (flag = true) => {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const params = Object.assign(s, r)
  tableTotal.value = 0
  accumulatedCargo.qryList(params).then((res: any) => {
    loading.value = false;
    if (res.code === 200) {
      const pageData = res.data;
      if (pageData) {
        tableTotal.value = 0 //todo 联调时调整
        pageresult.total= pageData.total;
        pageresult.list = pageData.result;
      }
    }
  });
};


onMounted(() => {
  refreshData();
});

</script>

<style scoped lang="scss">
  .app-container{
    padding: 6px 30px;
  }
  ::v-deep(.el-form){
    padding: 5px 30px;
  }
</style>

<!-- 风险累积 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef1" />
    <app-table
      :tableConfig="tableconfig1"
      v-model:pageresult="pageresult1"
      ref="tableRef1"
      @selection-change="handleSelectionChange1"
      @page-change="handleQuery1(false)"
    />

    <app-free-edit :freeEditConfig="formconfig2" ref="freeEditRef2" />
    <app-table
      :tableConfig="tableconfig2"
      v-model:pageresult="pageresult2"
      ref="tableRef2"
      @selection-change="handleSelectionChange2"
      @page-change="handleQuery2(false)"
    />
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef1 = ref<AppFreeEditMethod | null>(null);
const freeEditRef2 = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { deleteFactorBykey, getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const tableRef1 = ref<AppTableMethod | null>(null);
const tableRef2 = ref<AppTableMethod | null>(null);
const removeIds1 = ref([]); // 删除用户ID集合 用于批量删除
const removeIds2 = ref([]); // 删除用户ID集合 用于批量删除
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "风险累积信息",
    // endBtnsPosition: "right",
    // endBtns: [
    //   createFreeButtonBase({
    //     type: "primary",
    //     label: "查询",
    //     func: async () => {
    //       handleQuery1();
    //     },
    //   }),
    //   createFreeButtonBase({
    //     label: "重置",
    //     func: () => {
    //       freeEditRef1.value?.setFormValue({
    //         cKindNo: "",
    //         cStatus: "",
    //       });
    //       handleQuery1();
    //       // freeEditRef.value?.resetForm();
    //     },
    //   }),
    // ],
    fromSchema: [
      {
        prop: "a",
        inputtype: "rtinput",
        title: "船名",
        clearable: true,
        readonly: true,
      },
      {
        prop: "b",
        inputtype: "rtnumber",
        title: "船舶险累积保额/赔偿限额",
        clearable: true,
        readonly: true,
      },
      {
        prop: "c",
        inputtype: "rtnumber",
        title: "船货累积保额",
        clearable: true,
        readonly: true,
      },
    ],
  })
);

const formconfig2 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "风险累积信息",
    // endBtnsPosition: "right",
    // endBtns: [
    //   createFreeButtonBase({
    //     type: "primary",
    //     label: "查询",
    //     func: async () => {
    //       handleQuery2();
    //     },
    //   }),
    //   createFreeButtonBase({
    //     label: "重置",
    //     func: () => {
    //       freeEditRef2.value?.setFormValue({
    //         cKindNo: "",
    //         cStatus: "",
    //       });
    //       handleQuery2();
    //       // freeEditRef.value?.resetForm();
    //     },
    //   }),
    // ],
    fromSchema: [
      {
        prop: "a",
        inputtype: "rtinput",
        title: "船名",
        clearable: true,
        readonly: true,
      },
      {
        prop: "b",
        inputtype: "rtinput",
        title: "船次",
        clearable: true,
        readonly: true,
      },
      {
        prop: "c",
        inputtype: "rtnumber",
        title: "货运险累积保额",
        clearable: true,
        readonly: true,
      },
    ],
  })
);

const pageresult1 = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableconfig1 = reactive<AppTableConfig>(
  createTableEditConfig({
    fromSchema: [
      {
        prop: "a",
        inputtype: "rtinput",
        title: "保单号",
        minWidth: 180,
        fixed: 'left',
      },
      {
        prop: "b",
        inputtype: "rtinput",
        title: "出单机构",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "被保险人",
        minWidth: 180,
      },
      {
        prop: "d",
        inputtype: "rtdatepicker",
        title: "起保时间",
        minWidth: 180,
      },
      {
        prop: "d",
        inputtype: "rtdatepicker",
        title: "终保时间",
        minWidth: 180,
      },
      {
        prop: "d",
        inputtype: "rtinput",
        title: "险种",
        minWidth: 180,
      },
      {
        prop: "d",
        inputtype: "rtinput",
        title: "船名",
        minWidth: 180,
      },
      {
        prop: "d",
        inputtype: "rtnumber",
        title: "保额/赔偿限额",
        minWidth: 180,
      },
    ],
  })
);

const pageresult2 = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableconfig2 = reactive<AppTableConfig>(
  createTableEditConfig({
    fromSchema: [
      {
        prop: "a",
        inputtype: "rtinput",
        title: "保单号",
        minWidth: 180,
        fixed: 'left',
      },
      {
        prop: "b",
        inputtype: "rtinput",
        title: "出单机构",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "被保险人",
        minWidth: 180,
      },
      {
        prop: "d",
        inputtype: "rtdatepicker",
        title: "起运时间",
        minWidth: 180,
      },
      {
        prop: "d",
        inputtype: "rtinput",
        title: "船名",
        minWidth: 180,
      },
      {
        prop: "d",
        inputtype: "rtinput",
        title: "船次",
        minWidth: 180,
      },
      {
        prop: "d",
        inputtype: "rtinput",
        title: "起运地",
        minWidth: 180,
      },
      {
        prop: "d",
        inputtype: "rtinput",
        title: "目的地",
        minWidth: 180,
      },
      {
        prop: "d",
        inputtype: "rtdatepicker",
        title: "起保时间",
        minWidth: 180,
      },
      {
        prop: "d",
        inputtype: "rtdatepicker",
        title: "终保时间",
        minWidth: 180,
      },
      {
        prop: "d",
        inputtype: "rtnumber",
        title: "保额/赔偿限额",
        minWidth: 180,
      },
    ],
  })
);

onMounted(async () => {
  // 船货累积保额 = 船舶险累积保额/赔偿限额+货运险累计保额
  freeEditRef1.value?.setValue('a', '测试');
  freeEditRef1.value?.setValue('b', 12.56);
  freeEditRef1.value?.setValue('c', 1231);
  const b = freeEditRef1.value?.getValue('b') || 0;
  const c = freeEditRef1.value?.getValue('c') || 0;
   
  console.log(b,c)
  freeEditRef2.value?.setFormValue({
    c: b + c
  })
});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

// 绑定特殊验证器
const exRules = {
  byrtInput: (rule: any, value: any, callback: any) => {
    // const r = freeEditRef.value?.getFromValue();
    // if (r["name"]) {
    //   callback();
    // } else {
    //   callback("姓名");
    // }
  },
};

/** 查询 */
function handleQuery1(flag?: boolean) {
  const r = tableRef1.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef1.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  getBasicKindList(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult1.list = [];
        pageresult1.list = data.result;
        pageresult1.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}
function handleQuery2(flag?: boolean) {
  const r = tableRef2.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef2.value?.getFromValue(); //获取表单数据
  const param = Object.assign(s, r);
  getBasicKindList(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult2.list = [];
        pageresult2.list = data.result;
        pageresult2.total = data.total;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}

// 多选事件
function handleSelectionChange1(selection: any) {
  console.log('selection',selection)
  removeIds1.value = selection.map((item: any) => item.cPkId);
}

function handleSelectionChange2(selection: any) {
  console.log('selection',selection)
  removeIds2.value = selection.map((item: any) => item.cPkId);
}
</script>

<style scoped></style>

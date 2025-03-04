<!-- 配置 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig1"
      v-model:pageresult="pageresult1"
      ref="tableRef"
      @selection-change="handleSelectionChange"
      @page-change="handleQuery(false)"
    />

    <app-free-edit :freeEditConfig="formconfig2" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig2"
      v-model:pageresult="pageresult2"
      ref="tableRef"
      @selection-change="handleSelectionChange"
      @page-change="handleQuery(false)"
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

const freeEditRef = ref<AppFreeEditMethod | null>(null);
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
const tableRef = ref<AppTableMethod | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "风险累计信息",
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
            cKindNo: "",
            cStatus: "",
          });
          handleQuery();
          // freeEditRef.value?.resetForm();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "a",
        inputtype: "rtinput",
        title: "船名",
        labelWidth: 200,
        clearable: true,
      },
      {
        prop: "b",
        inputtype: "rtinput",
        title: "船舶险累积保额/赔偿限额",
        clearable: true,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "船货累积保额",
        clearable: true,
      },
    ],
  })
);

const formconfig2 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "风险累计信息",
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
            cKindNo: "",
            cStatus: "",
          });
          handleQuery();
          // freeEditRef.value?.resetForm();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "a",
        inputtype: "rtinput",
        title: "船名",
        labelWidth: 200,
        clearable: true,
      },
      {
        prop: "b",
        inputtype: "rtinput",
        title: "船次",
        clearable: true,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "货运险累积保额",
        clearable: true,
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
    editFlag: true,

    fromSchema: [
      {
        prop: "a",
        inputtype: "rtinput",
        title: "保单号",
        minWidth: 180,
        fixed: "left",
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
        prop: "c",
        inputtype: "rtdatepicker",
        title: "起保时间",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtdatepicker",
        title: "终保时间",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "险种",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "船名",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
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
    editFlag: true,

    fromSchema: [
      {
        prop: "c",
        inputtype: "rtinput",
        title: "保单号",
        minWidth: 180,
      },
      {
        prop: "c",
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
        prop: "c",
        inputtype: "rtdatepicker",
        title: "起运时间",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "船名",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "船次",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "起运地",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtinput",
        title: "目的地",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtdatepicker",
        title: "起保时间",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtdatepicker",
        title: "终保时间",
        minWidth: 180,
      },
      {
        prop: "c",
        inputtype: "rtnumber",
        title: "保额/赔偿限额",
        minWidth: 180,
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
  const param = Object.assign(s, r);
  getBasicKindList(param)
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
</script>

<style scoped></style>

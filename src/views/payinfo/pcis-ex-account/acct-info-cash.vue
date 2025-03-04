<!-- 配置 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
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
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { log } from "console";
const dzmodal = useDzModal();
//const searchPlanEcargo = defineAsyncComponent(() => import("./search-plan-ecargo.vue"));
const tableRef = ref<AppTableMethod | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "确认",
        func: async () => {
          console.log("确认");
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          freeEditRef.value?.setFormValue({
            COpgrpCde: "",
          });
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "读取银行卡",
        func: async () => {
          console.log("读取银行卡");
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CAcctNo",
        inputtype: "rtinput",
        title: "收款人账号",
      },
      {
        prop: "CAcctNme",
        inputtype: "rtinput",
        title: "收款人户名",
      },
      // {
      // 	prop: "CBankRelCode",
      // 	inputtype: "rtinput",
      //   type: 'hidden',
      // },
      {
        prop: "CBankRelTyp",
        inputtype: "rtcascader",
        title: "收款银行大类",
        typeCode: "SELECT_CBANKRELTYP",
        func: function () {
          console.log("收款银行大类");
        },
      },
      {
        prop: "CBankLittle",
        inputtype: "rtselect",
        title: "银行小类",
        typeCode: "KIND_LIST_GRT",
      },
      {
        prop: "CBankCde",
        inputtype: "rtselect",
        title: "开户行",
        typeCode: "KIND_LIST_GRT",
      },
      {
        prop: "CBankCnaps",
        inputtype: "rtinput",
        title: "CNAPS号",
      },
      {
        prop: "CBankAddr",
        inputtype: "rtinput",
        title: "开户行地址",
      },
      {
        prop: "CPubPri",
        inputtype: "rtinput",
        title: "对公对私",
        loaddata: [
          { value: "1", label: "对公" },
          { value: "2", label: "对私" },
        ],
      },
      {
        prop: "CPubPri",
        inputtype: "rtinput",
        title: "支付类型",
        loaddata: [
          { value: "1", label: "正常支付" },
          { value: "2", label: "例外支付" },
        ],
      },
      // {
      // 	prop: "CEdrNo",
      // 	inputtype: "rtinput",
      //   type: 'hidden',
      // },
      // {
      // 	prop: "CUpdCde",
      // 	inputtype: "rtinput",
      //   type: 'hidden',
      // },
      // {
      // 	prop: "CAppNo",
      // 	inputtype: "rtinput",
      //   type: 'hidden',
      // },
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
</script>

<style scoped></style>

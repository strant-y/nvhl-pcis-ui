<!-- 配置 -->
<template>
  <div class="app-container">
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      :isPage="false"
    />
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
      <rt-button
        :item="{
          type: 'primary',
          label: '保存',
          func: () => {},
        }"
      />
    </div>
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
import { useFormLabelWidth } from "element-plus/es/components/form/src/utils";
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const isDisabled = ref(true); //判断表单是否可编辑
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "投保单费用信息",
    endBtnsPosition: "right",
    fromUi: {
      cols: 2,
    },
    fromSchema: [
      {
        prop: "ilog_c1",
        inputtype: "rtnumber",
        title: "ilog手续费比例",
        min: 0,
        max: 999999999999999999.99,
        step: 0.01,
        itemWidth: 1,
        labelWidth: 200,
        clearable: true,
      },
      {},
      {
        prop: "max_value",
        inputtype: "rtnumber",
        title: "销售手续费比例上限",
        min: 0,
        max: 999999999999999999.99,
        step: 0.01,
        itemWidth: 1,
        labelWidth: 200,
        clearable: true,
      },
      {
        prop: "min_value",
        inputtype: "rtnumber",
        title: "销售手续费比例下限",
        min: 0,
        max: 999999999999999999.99,
        step: 0.01,
        itemWidth: 1,
        labelWidth: 200,
        clearable: true,
      },
      {
        prop: "NFeePropSum",
        inputtype: "rtnumber",
        title: "比例合计",
        min: 0,
        max: 999999999999999999.99,
        step: 0.01,
        itemWidth: 1,
        labelWidth: 200,
        clearable: true,
      },
      {
        prop: "NPrmSum",
        inputtype: "rtnumber",
        title: "金额合计",
        min: 0,
        max: 999999999999999999.99,
        step: 0.01,
        itemWidth: 1,
        labelWidth: 200,
        clearable: true,
      },
      {
        prop: "f",
        inputtype: "rtnumber",
        title: "总公司下发二级机构费用政策比例",
        itemWidth: 1,
        labelWidth: 200,
        clearable: true,
        disabled: isDisabled,
      },
      {
        prop: "g",
        inputtype: "rtnumber",
        title: "二级机构下发三级机构的费用政策比例",
        itemWidth: 1,
        labelWidth: 200,
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
    title: "费用信息",
    editFlag: true,
    editList: ["NFeeProp"],
    // showSelection:true,
    // tableBtnType: "btn",
    // tableBtnWidth: 220,
    // tableBtnPosition: "right",
    // tableBtnFixed: "right",
    fromSchema: [
      {
        prop: "CTypCde",
        inputtype: "rtinput",
        title: "费用类型",
        minWidth: 180,
      },
      {
        prop: "NFeeProp",
        inputtype: "rtnumber",
        title: "比例(%)",
        minWidth: 180,
      },
      {
        prop: "NUpdFee",
        inputtype: "rtnumber",
        title: "金额",
        minWidth: 180,
      },
      {
        prop: "CFeeFlag",
        inputtype: "rtinput",
        title: "ILOG系统费用计算提示信息",
        minWidth: 260,
      },
    ],
  })
);

onMounted(async () => {
  formconfig1.value?.setFormValue({
    ilog_c1: 12,
    max_value: 0.0,
    min_value: 0.0,
    NFeePropSum: 0.0,
    NPrmSum: 0.0,
  });
  pageresult.list = [
    {
      CTypCde: "费用类型11",
      NFeeProp: 12,
      NUpdFee: 33,
      CFeeFlag: "ILOG系统费用计算提示",
    },
    {
      CTypCde: "费用类型22",
      NFeeProp: 12.78,
      NUpdFee: 1231.0,
      CFeeFlag: "ILOG系统费信息",
    },
  ];
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
    const r = freeEditRef.value?.getFromValue();
    if (r["name"]) {
      callback();
    } else {
      callback("姓名");
    }
  },
};

// 判断是否可编辑
function checkDisabled(key: string) {
  return true;
}

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

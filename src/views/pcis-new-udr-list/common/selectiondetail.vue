<!-- SECTION设置 -->
<template>
  <el-dialog v-model="dialogVisible" width="60%" title="合约SECTION设置">
    <div>
      <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
      
      <app-table
        :tableConfig="tableconfig1"
        v-model:pageresult="pageresult1"
        ref="tableRef1"
        @page-change="handleQuery1(false)"
      />

      <app-table
        :tableConfig="tableconfig2"
        v-model:pageresult="pageresult2"
        ref="tableRef2"
        @page-change="handleQuery2(false)"
      />

    </div>
    <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
      <rt-button
        :item="{
          type: 'primary',
          label: '返回',
          func: () => {
            dialogVisible = false;
          },
        }"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store/modules/user";
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
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId:'', opCde:'' })
const dialogVisible = ref(true);
const dzmodal = useDzModal();

const tableRef1 = ref<AppTableMethod | null>(null);
const tableRef2 = ref<AppTableMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "核保任务查询",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery1();handleQuery2();
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          freeEditRef.value?.resetFields();
          handleQuery1(true);handleQuery2(true);
          // freeEditRef.value?.resetForm();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CContId",
        inputtype: "rtinput",
        title: "合约标识号",
        itemWidth: 1.5,
        clearable: true,
      },
      {
        prop: "CContId",
        inputtype: "rtselect",
        title: "合约名称",
        itemWidth: 1.5,
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
    title: "合约SECTION",
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "新增",
        type: "success",
        func: () => {
        },
      }),
      createFreeButtonBase({
        id: "score",
        label: "删除",
        type: "warning",
        func: () => {
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CContId",
        inputtype: "rtinput",
        title: "SECTION名",
      },
      {
        prop: "CContId",
        inputtype: "rtinput",
        title: "再保公司",
      },
      {
        prop: "CContId",
        inputtype: "rtinput",
        title: "手续费率(%)",
        minWidth: 120,
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
    title: "合约SECTION险种关联表",
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "新增",
        type: "success",
        func: () => {
        },
      }),
      createFreeButtonBase({
        id: "score",
        label: "删除",
        type: "warning",
        func: () => {
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CContId",
        inputtype: "rtinput",
        title: "险种代码",
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
function handleQuery1(flag?: boolean) {
  const r = tableRef1.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
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

/** 查询 */
function handleQuery2(flag?: boolean) {
  const r = tableRef2.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
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
</script>

<style scoped></style>

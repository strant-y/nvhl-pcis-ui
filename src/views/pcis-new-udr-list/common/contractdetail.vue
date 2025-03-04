<!-- 配置 -->
<template>
  <el-dialog v-model="dialogVisible" width="90%" title="合约明细">
    <div>
      <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
      <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @page-change="handleQuery(false)"
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
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });
const dialogVisible = ref(true);
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "核保任务查询",
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
        prop: "CContId",
        inputtype: "rtinput",
        title: "合约标识号",
        clearable: true,
      },
      {
        prop: "CContCde",
        inputtype: "rtinput",
        title: "合约名称",
        clearable: true,
      },
      {
        prop: "TContBgnTm",
        inputtype: "rtdatepicker",
        title: "起始日期",
        clearable: true,
      },
      {
        prop: "TContEndTm",
        inputtype: "rtdatepicker",
        title: "终止日期",
        clearable: true,
      },
      {
        prop: "CProdNo",
        inputtype: "rtcascader",
        title: "产品/险种",
        typeCode: "PROD_LIST_IN_GUIDE",
        params: {
          cParCde: "",
          cOperId: user.value.opCde,
          cDptCde: user.value.companyId,
        },
        clearable: true,
      },
      {
        prop: "CRiskLvlCde",
        inputtype: "rtselect",
        title: "风险等级",
        clearable: true,
        lodaData: [],
      },
      {
        prop: "CRiCom",
        inputtype: "rtselect",
        title: "再保公司",
        clearable: true,
        lodaData: [],
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
    fromSchema: [
      {
        prop: "CContId",
        inputtype: "rtinput",
        title: "合约标识号",
      },
      {
        prop: "CContCde",
        inputtype: "rtinput",
        title: "合约名称",
      },
      {
        prop: "TContBgnTm",
        inputtype: "rtdatepicker",
        title: "起始日期",
      },
      {
        prop: "TContEndTm",
        inputtype: "rtdatepicker",
        title: "终止日期",
      },
      {
        prop: "CRikindNo",
        inputtype: "rtinput",
        title: "险种大类",
      },
      {
        prop: "CProdNo",
        inputtype: "rtinput",
        title: "产品/险种",
      },
      {
        prop: "CRiskLvlCde",
        inputtype: "rtinput",
        title: "风险等级",
      },
      {
        prop: "CRiCom",
        inputtype: "rtinput",
        title: "再保公司",
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

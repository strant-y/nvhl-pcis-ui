<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <el-card style="margin-top: 20px">
      <risk-info :isAdd="isAdd"></risk-info>
    </el-card>
    <el-card style="margin-top: 20px" v-if="isAdd">
      <review-info></review-info>
    </el-card>
    <div style="text-align: right; margin-top: 20px" v-if="!isAdd">
      <el-button type="primary" @click="save">保存</el-button>
      <el-button type="primary" @click="saveAndSubmit"
        >保存并提交审核</el-button
      >
      <el-button @click="goBack">返回</el-button>
    </div>
    <div style="text-align: right; margin-top: 20px" v-else>
      <el-button type="primary" @click="submit">提交</el-button>
      <el-button @click="goBack">返回</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getListByCode } from "@/api/code-list-service";
import { Search } from "@element-plus/icons-vue";
import { AppKey } from "@/constants/api";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { useValidator } from "@/typings/useValidator";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";

import OrgDptModel from "@/components/common/DepartmentTree.vue";
import RiskInfo from "./risk-info/risk-info.vue";
//审核详情得状态等
import ReviewInfo from "./review-info/review-info.vue";

const { getRules } = useValidator();
const dzmodal = useDzModal();
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const routeQryParams = route.query.data ? JSON.parse(route.query.data) : {};
const isAdd = ref(routeQryParams.type !== "add");
const user = userStore.user;
const greenDetailRule = ref([]);
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    fromUi: {
      cols: 2,
    },
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "保存",
        disabled: isAdd,
        func: async () => {
          saveData();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CAppNme",
        inputtype: "rtselect",
        title: "机构部门",
        disabled: true,
        showExBtn: true,
        btnWidth: 5,
        itemWidth: 2,
        btnItems: {
          icon: "Search",
          type: "primary",
          disabled: isAdd,
          func: () => {
            dzmodal.open(OrgDptModel, {}).then((res) => {
              if (res.type === "ok") {
              }
            });
          },
        },
        rules: [getRules("required", {})],
      },
      {
        prop: "Base.cKindNo",
        inputtype: "rtcascader",
        title: "产品大类",
        typeCode: "KIND_LIST_CACHE",
        params: { cStatus: "1" },
        disabled: isAdd,
        clearable: true,
        rules: [getRules("required", {})],
        func: (val) => {},
      },
      {
        prop: "PrdProdPlan.CProdNo",
        inputtype: "rtcascader",
        title: "条款",
        disabled: isAdd,
        clearable: true,
        typeCode: "PROD_LIST",
        rules: [getRules("required", {})],
        params: {},
      },
      {
        prop: "PrdProdPlan.CPlanNo",
        inputtype: "rtinput",
        title: "方案编号",
        disabled: isAdd,
        clearable: true,
      },
      {
        prop: "PrdProdPlan.CTplNme",
        inputtype: "rtinput",
        title: "方案名称",
        disabled: isAdd,
        rules: [getRules("required", {})],
        clearable: true,
      },
      {
        prop: "CAppNme",
        inputtype: "rtselect",
        title: "方案类型",
        disabled: isAdd,
        clearable: true,
        rules: [getRules("required", {})],
        typeCode: "", //暂时无接口
        params: {},
      },
      {
        prop: "CAppNme",
        inputtype: "rtselect",
        title: "方案用途",
        disabled: isAdd,
        clearable: true,
        rules: [getRules("required", {})],
        typeCode: "", //暂时无接口
        params: {},
      },
      {
        prop: "CCDate",
        inputtype: "rtdatepicker",
        title: "启用日期",
        type: "datetime",
        rules: [getRules("required", {})],
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        disabled: isAdd,
      },
      {
        prop: "CCDate",
        inputtype: "rtdatepicker",
        title: "失效日期",
        rules: [getRules("required", {})],
        type: "datetime",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        disabled: isAdd,
      },
      {
        prop: "CAppNme",
        inputtype: "rtselect",
        title: "计算保费公式",
        disabled: isAdd,
        clearable: true,
        rules: [getRules("required", {})],
        typeCode: "", //暂时无接口
        params: {},
      },
      {
        prop: "CAppNme",
        inputtype: "rtselect",
        title: "是否保密",
        disabled: isAdd,
        clearable: true,
        rules: [getRules("required", {})],
        typeCode: "", //暂时无接口
        params: {},
      },
      {
        prop: "CAppNme",
        inputtype: "rtselect",
        title: "保险期间类型",
        disabled: isAdd,
        clearable: true,
        typeCode: "", //暂时无接口
        params: {},
      },
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        title: "标准承保期限",
        type: "number",
        disabled: isAdd,
        clearable: true,
      },
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        title: "保险期限浮动区间起",
        disabled: isAdd,
        clearable: true,
      },
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        title: "保险期限浮动区间止",
        disabled: isAdd,
        clearable: true,
      },
      {
        prop: "CAppNme",
        inputtype: "rtselect",
        title: "是否绿色产业客户",
        disabled: isAdd,
        clearable: true,
        typeCode: "", //暂时无接口
        params: {},
        func: (val) => {
          if (val === "1") {
            //当选择是的时候绿色产业细分列表必输
            greenDetailRule.value = [getRules("required", {})];
          } else {
            greenDetailRule.value = [];
          }
        },
      },
      {
        prop: "CAppNme",
        inputtype: "rtselect",
        title: "绿色产业细分列表",
        disabled: isAdd,
        clearable: true,
        rules: greenDetailRule,
        typeCode: "", //暂时无接口
        params: {},
      },
      {
        prop: "CAppNme",
        inputtype: "rtselect",
        title: "是否调用智能风控",
        disabled: isAdd,
        clearable: true,
        typeCode: "", //暂时无接口
        params: {},
      },
      {
        prop: "CAppNme",
        inputtype: "rtselect",
        title: "分公司出单配置",
        itemWidth: 2,
        disabled: isAdd,
        clearable: true,
        typeCode: "", //暂时无接口
        params: {},
      },
      {
        prop: "CAppNme",
        inputtype: "rtselect",
        title: "是否有特约",
        disabled: isAdd,
        clearable: true,
        typeCode: "", //暂时无接口
        params: {},
      },
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        type: "textarea",
        title: "特别约定",
        rows: 4,
        itemWidth: 2,
        clearable: true,
        disabled: isAdd,
        showExBtn: true,
        btnWidth: 5,
        btnItems: {
          icon: "Search",
          type: "primary",
          disabled: isAdd,
          func: () => {
            dzmodal.open(OrgDptModel, {}).then((res) => {
              if (res.type === "ok") {
              }
            });
          },
        },
      },
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        type: "textarea",
        title: "备注",
        rows: 4,
        placeholder: "请填写预计使用本方案的渠道、代理、代理业务员信息",
        itemWidth: 2,
        disabled: isAdd,
        clearable: true,
      },
    ],
  })
);

//form表单部分保存
const saveData = () => {
  //保存
};

//总的保存
const save = () => {
  //调用保存接口
};
const saveAndSubmit = () => {
  //调用保存并提交接口
};
const goBack = () => {
  //返回上个页面
  router.go(-1);
};

//审核的提交
const submit = () => {
  //提交
};

onMounted(() => {});
</script>

<style scoped lang="scss"></style>

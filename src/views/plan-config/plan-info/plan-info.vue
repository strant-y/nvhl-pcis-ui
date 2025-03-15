<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <el-card style="margin-top: 20px;">
      <risk-info :isAdd="isAdd"></risk-info>
    </el-card>
    <el-card style="margin-top: 20px;" v-if="isAdd">
      <review-info ></review-info>
    </el-card>
    <div style="text-align: right;margin-top: 20px;" v-if="!isAdd">
      <el-button type="primary" @click="save">保存</el-button>
      <el-button type="primary" @click="saveAndSubmit">保存并提交审核</el-button>
      <el-button @click="goBack">返回</el-button>
    </div>
    <div style="text-align: right;margin-top: 20px;" v-else>
      <el-button type="primary" @click="submit">提交</el-button>
      <el-button @click="goBack">返回</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getListByCode } from '@/api/code-list-service';
import { Search } from '@element-plus/icons-vue'
import { AppKey } from '@/constants/api';
import { useRouter, useRoute } from 'vue-router';
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

import OrgDptModel from '@/components/common/DepartmentTree.vue';
import RiskInfo from './risk-info/risk-info.vue'
//审核详情得状态等
import ReviewInfo from './review-info/review-info.vue';

import PrdFixSpec from '../com/prd-fix-spec.vue'

const { getRules } = useValidator();
const dzmodal = useDzModal();
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const userStore = useUserStore();
const router = useRouter()
const route = useRoute()
const routeQryParams = route.query.data ? JSON.parse(route.query.data) : {}
const isAdd = ref((routeQryParams.type !== 'add'))
const user = userStore.user;
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    fromUi: {
      cols: 2
    },
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "保存",
        disabled: isAdd,
        func: async () => {
          saveData()
        },
      }),
      
    ],
    fromSchema: [
      {
        prop: "CDptCde",
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
            dzmodal.open(OrgDptModel, {})
            .then((res) => {
              if (res.type === "ok") {
              }
            });
          }
        },
        rules: [getRules("required", {})],
      },
      {
        prop: "cKindNo",
        inputtype: "rtcascader",
        title: "险种大类",
        typeCode: "KIND_LIST_CACHE", //产品大类的接口
        params: { cStatus: '1' },
        disabled: isAdd,
        clearable: true,
        rules: [getRules("required", {})],
        func: (val) => {
          const item = freeEditRef.value.getFromSchemaItem('cProdNo')
          if(val) { //选择了产品大类作为参数上送
            item.params = {'cKindNo': val}
          } else {
            item.params = {}
          }
        }
      },
      {
        prop: "cProdNo",
        inputtype: "rtcascader",
        title: "险种名称",
        disabled: isAdd,
        clearable: true,
        typeCode: "PROD_LIST", //条款的接口
        rules: [getRules("required", {})],
        params: {},
      },
      {
        prop: "cPlanNo",
        inputtype: "rtinput",
        title: "方案编号",
        disabled: true,
        clearable: true,
      },
      {
        prop: "cPlanCn",
        inputtype: "rtinput",
        title: "方案名称",
        disabled: isAdd,
        rules: [getRules("required", {})],
        clearable: true,
      },
      {
        prop: "cRationType",
        inputtype: "rtselect",
        title: "方案类型",
        disabled: isAdd,
        clearable: true,
        rules: [getRules("required", {})],
        typeCode: "BAS_COMM_CODE_OUT_CDE", //暂时无接口
        params: {'cParCde': 'CRationType'},
      },
      {
        prop: "cOrigin",
        inputtype: "rtselect",
        title: "方案用途",
        disabled: isAdd,
        clearable: true,
        rules: [getRules("required", {})],
        // typeCode: "", //暂时无接口
        // params: {},
        loadData: [
            {value: 'core', label: '核心专用'},
            {value: 'channel', label: '渠道专用'},
            {value: 'public', label: '核心渠道公用'},
        ]
      },
      {
        prop: "tBgnTm",
        inputtype: "rtdatepicker",
        title: "启用日期",
        type: "datetime",
        rules: [getRules("required", {})],
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        disabled: isAdd,
      },
      {
        prop: "tEndTm",
        inputtype: "rtdatepicker",
        title: "失效日期",
        rules: [getRules("required", {})],
        type: "datetime",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        disabled: isAdd,
      },
      {
        prop: "cCalcFormula",
        inputtype: "rtselect",
        title: "计算保费公式",
        disabled: isAdd,
        clearable: true,
        rules: [getRules("required", {})],
        loadData: [
            {value: '1', label: '固定保额保费'},
            {value: '2', label: '根据费率表计算'},
            {value: '3', label: '根据公式计算'},
            // {value: '1', label: '定险别/保额保费不校验'},
            // {value: '2', label: '非定费非定保险期间(不校验)'},
            // {value: '3', label: '非定额非定费率计算公式'},
            // {value: '4', label: '定额计算公式'},
            // {value: '5', label: '非定险别/保额保费不校验'},
            // {value: '6', label: '保额保费不校验'},
            // {value: '7', label: '非定额非定保费(不校验)'},
        ],
        // typeCode: "", //暂时无接口
        // params: {},
      },
      {
        prop: "cAccessType",
        inputtype: "rtselect",
        title: "是否保密",
        disabled: isAdd,
        clearable: true,
        rules: [getRules("required", {})],
        typeCode: "BAS_COMM_CODE_OUT_CDE", //暂时无接口
        params: {'cParCde': 'CAccessType'},
      },
      {
        prop: "cCriterionTimeUnit",
        inputtype: "rtselect",
        title: "保险期间类型",
        disabled: isAdd,
        clearable: true,
        typeCode: "RECEIVE_BANK_CATEGORY", //暂时无接口
        params: {'cParCde': 'CriterionUnit'},
      },
      {
        prop: "nCriterionTime",
        inputtype: "rtinput",
        title: "标准承保期限",
        type: "number",
        disabled: isAdd,
        clearable: true,
      },
      {
        prop: "nLowInsureDays",
        inputtype: "rtinput",
        title: "保险期限浮动区间起",
        disabled: isAdd,
        clearable: true,
      },
      {
        prop: "nTopInsureDays",
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
          //获取 绿色产业细分列表 配置项
          const item = freeEditRef.value?.getFromSchemaItem('greenDetailList')
          if(val === '1') { //当选择是的时候绿色产业细分列表必输
            item['disabled'] = false
            item['rules'] = [getRules("required", {})]
          } else {
            item['disabled'] = true
            item['rules'] = []
          }
        }
      },
      {
        prop: "greenDetailList",
        inputtype: "rtselect",
        title: "绿色产业细分列表",
        disabled: isAdd,
        clearable: true,
        rules: [],
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
        prop: "cShowDpt",
        inputtype: "rtselect",
        title: "分公司出单配置",
        itemWidth: 2,
        disabled: isAdd,
        clearable: true,
        typeCode: "BRANCH_ID_LIST", //暂时无接口
        params: {},
      },
      {
        prop: "cSpecMrk",
        inputtype: "rtselect",
        title: "是否有特约",
        disabled: isAdd,
        clearable: true,
        typeCode: "WEB_SYS_STA_DICT", //暂时无接口
        params: {'cParCde': 'yes_no'},
      },
      {
        prop: "cSpecContent",
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
            dzmodal.open(PrdFixSpec, {
              data: {
                cProdNo: freeEditRef.value?.getValue('cProdNo'),
                fixSpecData: freeEditRef.value?.getValue('CSpecNo') //之前选中的数据数组
              }
            }).then((res) => {
              if (res.type === "ok") {
                let i = 1;
                let cSpecNo = '';
                let cUnfixSpc = '';
                res.body.forEach(value => {
                    cSpecNo = '' === cSpecNo ? value['PrdFixSpec.CSpecNo'] : cSpecNo + '$$' + value['PrdFixSpec.CSpecNo'];
                    cUnfixSpc = '' === cUnfixSpc ? i + '.' + value['PrdFixSpec.CNmeCn'] : cUnfixSpc + '\n' + i + '.' + value['PrdFixSpec.CNmeCn'];
                    freeEditRef.value?.setValue('cSpecContent', cUnfixSpc)
                    freeEditRef.value?.setValue('CSpecNo', cSpecNo)
                    i++;
                });
              }
            });
          }
        },
      },
      {
        prop: "cRemark",
        inputtype: "rtinput",
        type: "textarea",
        title: "备注",
        rows: 4,
        placeholder: "请填写预计使用本方案的渠道、代理、代理业务员信息",
        itemWidth: 2,
        disabled: isAdd,
        clearable: true,
      },
      {
        prop: "CSpecNo",
        inputtype: "rtinput",
        title: "",
        type: 'hidden'
      },

    ],
  })
);

//form表单部分保存
const saveData = () => {
  freeEditRef.value?.validate().then((isValid) => {
    if(isValid) {
      //调用接口

    } else {
      ElMessage.error("请填写必填项");
    }
  })
}

//总的保存
const save = () => {
  //调用保存接口
}
const saveAndSubmit = () => {
  //调用保存并提交接口
}
const goBack = () => {
  //返回上个页面
  router.go(-1)
}

//审核的提交
const submit = () => {
  //提交
}

onMounted(() => {
  
});
</script>

<style scoped lang="scss"></style>

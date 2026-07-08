<template>
  <div class="app-container">
    <!--<el-card>-->
    <!--<underwriteRef ref="underwrite"></underwriteRef>-->
    <!--</el-card>-->
    <el-card>
      <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    </el-card>
    <el-card style="margin-top: 20px;">
      <template #header>
        <span class="module-title">特约信息</span>
      </template>
      <plan-special-agreement-list ref="specialEditRef" />
    </el-card>
    <el-card style="margin-top: 20px;">
    
      <template v-for="(pageConfig, v) in formconfig2" :key="formconfig2RenderKey + '-' + v">
        <div class="card_" v-for="(k, i) in pageConfig?.pageInfo" :key="formconfig2RenderKey + '-' + i"
          :id="(k.pageKey === 'dist' || k.pageKey === 'distSummary') ? k.pageCode : k.pageKey">
          <component v-if="currentIndex >= i" :ref="(res) => {
            const pageK = (k.pageKey === 'dist' || k.pageKey === 'distSummary') ? k.pageCode : k.pageKey
            opertaor.addTableRef(pageK, res);
          }
            " :is="k.pageType === 'custom' ? k.pageCode : k.pageKey + '-ref'
              " :pageSchema="k.pageSchema" />
        </div>
      </template>
    </el-card>

    <div v-if="!props.goodsType">
      <el-card style="margin-top: 20px;" v-if="isReviewPage">
        <review-info ref="reviewInfoRef"></review-info>
      </el-card>
      <div style="text-align: right;margin-top: 20px;" v-if="!isReviewPage">
        <div style="text-align: right;margin-top: 20px;" v-if="pageMode !== 'view'">
          <el-button type="primary" @click="save">保存</el-button>
          <el-button type="primary" @click="saveAndSubmit">保存并提交审核</el-button>
          <el-button @click="goBack">返回</el-button>
        </div>
        <div style="text-align: right;margin-top: 20px;" v-else>
          <el-button @click="goBack">返回</el-button>
        </div>
      </div>
      <div style="text-align: right;margin-top: 20px;" v-else>
        <template v-if="pageMode === 'handle'">
          <el-button type="primary" @click="submit">提交</el-button>
          <el-button @click="goBack">返回</el-button>
        </template>
        <template v-else>
          <el-button @click="goBack">返回</el-button>
        </template>
      </div>
      <el-card style="margin-top: 20px;" v-if="payinfo">
        <app-grid-edit :gridEditConfig="formconfig3" ref="payinfoEditRef" />
      </el-card>
    </div>
   
  </div>
 
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick, onBeforeMount, computed, onBeforeUnmount, onActivated, onDeactivated } from 'vue';
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
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
import { getProductPage, getRenewalAppPolicy } from "../../../api/prod/index";
import OrgDptModel from '@/components/common/DepartmentTree.vue';
import RiskInfo from './risk-info/risk-info.vue'
//审核详情得状态等
import ReviewInfo from './review-info/review-info.vue';
import { dataOpertaor } from "@/store/modules/data-opertaor";
import PlanSpecialAgreementList from "../com/plan-special-agreement-list.vue";
import DepartmentTree from "@/pcis/prodRef/commodityRef/DepartmentTree.vue";
import {
  AppGridEditMethod,
  createAppGridEditConfig,
} from "@/shared/app-grid-edit-config";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
import {dataParam} from "@/store/modules/dataParam";
const { getRules } = useValidator();
const dzmodal = useDzModal();
const freeEditRef = ref<AppFreeEditMethod | null>(null);
type SpecialEditMethod = {
  getFromValue?: () => Record<string, any>;
  getValue?: (key: string) => any;
  setValue?: (key: string, value: any) => void;
  setFormValue?: (value: any) => void;
  setDisabledAll?: (disabled?: boolean) => void;
  validate?: () => Promise<boolean> | boolean;
};
const specialEditRef = ref<SpecialEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const userStore = useUserStore();
const router = useRouter()
const props = defineProps({
  data: {
    type: Object,
  },
  goodsData: Object,
  goodsType: String,
});

type PageMode = "view" | "handle" | "add" | "edit" | "copy";

const routeQryParams = ref<any>(props.data);
const rawPageType = ref<any>(routeQryParams.value?.type);
const pageMode = ref<PageMode>("edit");
const isReviewPage = computed(() => ["handle", "under", "view"].includes(rawPageType.value));

function initPageMode() {
  rawPageType.value = routeQryParams.value?.type;
  pageMode.value =
    rawPageType.value === "handle" || rawPageType.value === "under"
      ? "handle"
      : rawPageType.value === "view" || rawPageType.value === "planConfigview"
        ? "view"
        : rawPageType.value === "planConfigAdd"
          ? "add"
          : rawPageType.value === "planConfigupdate"
            ? "edit"
            : rawPageType.value === "planConfigCopy"
              ? "copy"
              : "edit";
}

initPageMode();

watch(
  () => props.data,
  (val) => {
    routeQryParams.value = val;
    initPageMode();
    nextTick(() => {
      syncRouteTitle();
      applyPageReadonlyState();
    });
  },
  { deep: true, immediate: true }
);
const user = ref(userStore.user);
const reviewInfoRef = ref(null);
const policyService = new PolicyService();
// 当前加载的组件索引
const currentIndex = ref(0);

const route = useRoute();
const idxParam: IdxParamProps = {
  opertaorProps: { id: route.name },
  cdeListViewProps: { id: route.name },
  // handleAnchorClick: handleAnchorClick,
};
provide(idxParamKey, idxParam);
const opertaor = dataOpertaor(idxParam.opertaorProps);
const formconfig2 = opertaor.getTableConfig();
const payinfoEditRef = ref<AppGridEditMethod | null>(null);

const formconfig2RenderKey = ref(0);
let renderInterval: any = null;

if (formconfig2.length === 0) {
  formconfig2.push({ pageInfo: [] });
}


const getPageRowData = () =>
  props.goodsType === "goods" ? props.goodsData : routeQryParams.value?.rowData;

const getPlanFormValue = () =>
  Object.assign(
    {},
    freeEditRef.value?.getFromValue?.() || {},
    specialEditRef.value?.getFromValue?.() || {}
  );

const getPageConfigParam = (data?) => {
  const pageRowData = data || {};
  const sourceRowData = getPageRowData() || {};
  const formValue = getPlanFormValue();

  return {
    CProdNo:
      pageRowData.cProdNo ||
      pageRowData.CProdNo ||
      formValue.cProdNo ||
      formValue.CProdNo ||
      sourceRowData.cProdNo ||
      sourceRowData.CProdNo,
    CGrpMrk:
      pageRowData.cGrpMrk ||
      pageRowData.CGrpMrk ||
      formValue.cGrpMrk ||
      formValue.CGrpMrk ||
      sourceRowData.cGrpMrk ||
      sourceRowData.CGrpMrk,
  };
};

const getPlanBaseDetail = (result: any) => {
  const payload = result?.data?.data;
  if (Array.isArray(payload)) {
    return payload[0] || {};
  }
  return payload && typeof payload === "object" ? payload : {};
};

const waitForTableRefReady = async (key: string, retries = 20, delay = 50) => {
  for (let index = 0; index < retries; index++) {
    await nextTick();
    const tableRef = opertaor.getTableRefByKey(key);
    if (tableRef?.setFormValue) {
      return tableRef;
    }
    await new Promise((resolve) => window.setTimeout(resolve, delay));
  }
  return null;
};

const applyCvrgData = async (cvrgData: any) => {
  if (!Array.isArray(cvrgData) || cvrgData.length === 0) {
    return;
  }
  const cvrgRef = await waitForTableRefReady("cvrg");
  if (!cvrgRef) {
    console.warn("cvrg ref is not ready, skip initial data apply");
    return;
  }
  opertaor.setDataAll({ cvrg: cvrgData });
};

const setPlanFormValue = (value: any) => {
  freeEditRef.value?.setFormValue(value);
  specialEditRef.value?.setFormValue(value);
};


 
let payinfo = ref(false)
// const formconfig3 = reactive(createAppGridEditConfig({}));


watch(
  () => props.goodsData,
  (newVal,oldVal) => {
    if (props.goodsType == 'goods') {
      if (newVal) {
        initPage(newVal);
      }
    }
  },
  {
    deep: true,
    // immediate:true
  }
);

opertaor.setParam(getPageRowData());
onBeforeMount(async() => {
});
/**
 * 数据初始化
 * @param data
 */
const initPage = async (data?) => {
  const param = getPageConfigParam(data);
  if (!param.CProdNo || !param.CGrpMrk) {
    return;
  }

  try {
    const getProductRes = await getProductPage(param);
    const rawPageConfig = getProductRes?.data;
    const formconfig21 =
      typeof rawPageConfig === "string" ? JSON.parse(rawPageConfig) : rawPageConfig;

    if (!Array.isArray(formconfig21) || formconfig21.length === 0) {
      ElMessage.error("页面配置信息为空，请检查产品页面配置");
      formconfig2.splice(0, formconfig2.length, { pageInfo: [] });
      formconfig2RenderKey.value++;
      currentIndex.value = 0;
      return;
    }

    const firstPageInfo = Array.isArray(formconfig21[0]?.pageInfo)
      ? formconfig21[0].pageInfo.filter((item) => item.pageKey == "cvrg")
      : [];
    formconfig21[0].pageInfo = firstPageInfo;
    formconfig2.splice(0, formconfig2.length, ...formconfig21);
    formconfig2RenderKey.value++;
    await nextTick();
    renderComponents();
  } catch (error) {
    console.error("initPage getProductPage error:", error, param);
    ElMessage.error("页面配置信息加载失败");
    formconfig2.splice(0, formconfig2.length, { pageInfo: [] });
    formconfig2RenderKey.value++;
    currentIndex.value = 0;
  }
};
/**
 * 逐个渲染组件
 */
function renderComponents() {
  if (renderInterval) {
    clearInterval(renderInterval);
    renderInterval = null;
  }
  currentIndex.value = 0;
  renderInterval = setInterval(() => {
    const pageLength = formconfig2[0]?.pageInfo?.length ?? 0;
    if (currentIndex.value < pageLength - 1) {
      currentIndex.value++;
    } else {
      // loadAfter(); //页面加载完成之后,再加载后续所需的事件
      clearInterval(renderInterval);
      renderInterval = null;
    }
  }, 100); // 延迟组件渲染,增加页面响应效率
  console.log(formconfig2)
}
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
        func: () => {
          saveData()
        },
      }),

    ],
    fromSchema: [
      {
        prop: "cDptCde",
        inputtype: "rtselect",
        title: "机构部门",
        disabled: true,
        showExBtn: true,
        btnWidth: 5,
        itemWidth: 2,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            dzmodal
              .open(DepartmentTree, { type: "Issuer", data: {} })
              .then((res) => {
                if (res.body) {
                  const selectObj = res.body;
                  freeEditRef.value?.setValue("cDptCde", selectObj.id);
                  setFormItem("cDptCde", {
                    loadData: [
                      {
                        label: selectObj.name,
                        value: selectObj.id,
                      },
                    ],
                  });
                }
              });
          },
        },
        rules: [getRules("required", {})],
      },
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "KIND_LIST_GRT", //产品大类的接口
        codeParam: {
          cOperId: user.value?.opCde,
          cDptCde: user.value?.companyId,
        },
        clearable: true,
        child: "cProdNo",
        disabled: true,
        rules: [getRules("required", {})],
        func: (val) => {
        }
      },
      {
        prop: "cProdNo",
        inputtype: "rtselect",
        title: "产品名称",
        clearable: true,
        disabled: true,
        typeCode: "PROD_LIST_IN_GUIDE", //条款的接口
        rules: [getRules("required", {})],
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
        rules: [getRules("required", {})],
        clearable: true,
      },
      {
        prop: "cRationType",
        inputtype: "rtselect",
        title: "方案类型",
        clearable: true,
        rules: [getRules("required", {})],
        typeCode: "BAS_COMM_CODE_OUT_CDE",
        codeParam: { 'cParCde': 'CRationType' },
      },
      {
        prop: "cOrigin",
        inputtype: "rtselect",
        title: "方案用途",
        clearable: true,
        rules: [getRules("required", {})],
        // typeCode: "", //暂时无接口
        // params: {},
        loadData: [
          { value: 'core', label: '核心专用' },
          { value: 'channel', label: '渠道专用' },
          { value: 'public', label: '核心渠道公用' },
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
      },
      {
        prop: "tEndTm",
        inputtype: "rtdatepicker",
        title: "失效日期",
        rules: [getRules("required", {})],
        type: "datetime",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
      },
      {
        prop: "cCalcFormula",
        inputtype: "rtselect",
        title: "计算保费公式",
        clearable: true,
        rules: [getRules("required", {})],
        loadData: [
          { value: '1', label: '固定保额保费' },
          // { value: '2', label: '根据费率表计算' },
          { value: '3', label: '根据公式计算' },
          // {value: '1', label: '定险别/保额保费不校验'},
          // {value: '2', label: '非定费非定保险期间(不校验)'},
          // {value: '3', label: '非定额非定费率计算公式'},
          // {value: '4', label: '定额计算公式'},
          // {value: '5', label: '非定险别/保额保费不校验'},
          // {value: '6', label: '保额保费不校验'},
          // {value: '7', label: '非定额非定保费(不校验)'},
        ],
        func: (v: any) => {
          if (v == 3) {
            payinfo.value = true;
          } else {
            payinfo.value = false;
          }
        },
        // typeCode: "", //暂时无接口
        // params: {},
      },
      {
        prop: "cAccessType",
        inputtype: "rtselect",
        title: "是否保密",
        clearable: true,
        rules: [getRules("required", {})],
        typeCode: "BAS_COMM_CODE_OUT_CDE",
        codeParam: { 'cParCde': 'CAccessType' },
      },
      {
        prop: "cCiMrk",
        inputtype: "rtselect",
        title: "联共保业务",
        clearable: true,
        defaultValue: '0',
        loadData: [
          { value: '0', label: '非共保业务' },
          { value: '1', label: '外部共保我方主共_主联' },
          { value: '2', label: '外部共保我方从共_主联' },
          { value: '3', label: '外部共保我方主共_无联保' },
          { value: '4', label: '外部共保我方从共_无联保' },
          { value: '5', label: '司内联保_主联' },
        ],
      },
      {
        prop: "cIsUseTerm",
        inputtype: "rtselect",
        title: "是否使用方案配置条款",
        clearable: true,
        loadData: [
          { value: '1', label: '使用方案配置' },
          { value: '2', label: '使用外部传输' },
        ],
      },
      {
        prop: "cCriterionTimeUnit",
        inputtype: "rtselect",
        title: "保险期间类型",
        clearable: true,
        typeCode: "RECEIVE_BANK_CATEGORY",
        codeParam: { 'cParCde': 'CriterionUnit' },
      },
      {
        prop: "nCriterionTime",
        inputtype: "rtinput",
        title: "标准承保期限",
        type: "number",
        clearable: true,
      },
      {
        prop: "nLowInsureDays",
        inputtype: "rtinput",
        title: "保险期限浮动区间起",
        clearable: true,
      },
      {
        prop: "nTopInsureDays",
        inputtype: "rtinput",
        title: "保险期限浮动区间止",
        clearable: true,
      },
      {
        prop: "CAppNme",
        inputtype: "rtselect",
        title: "是否绿色产业客户",
        clearable: true,
        typeCode: "", //暂时无接口
        params: {},
        func: (val) => {
          //获取 绿色产业细分列表 配置项
          const item = freeEditRef.value?.getFromSchemaItem('greenDetailList')
          if (val === '1') { //当选择是的时候绿色产业细分列表必输
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
        clearable: true,
        rules: [],
        typeCode: "", //暂时无接口
        params: {},
      },
      {
        prop: "CAppNme",
        inputtype: "rtselect",
        title: "是否调用智能风控",
        clearable: true,
        typeCode: "", //暂时无接口
        params: {},
      },
      {
        prop: "cShowDpt",
        inputtype: "rtselect",
        title: "分公司出单配置",
        itemWidth: 2,
        clearable: true,
        typeCode: "BRANCH_ID_LIST", //暂时无接口
        params: {},
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
        clearable: true,
      },
      {
        prop: "cRemark",
        inputtype: "rtinput",
        type: "textarea",
        title: "备注",
        rows: 4,
        placeholder: "请填写预计使用本方案的渠道、代理、代理业务员信息",
        itemWidth: 2,
        clearable: true,
      },

    ],
  })
);

const formconfig3 = reactive<AppFreeEditConfig>(
  createAppGridEditConfig({
    "title": "添加计算公式",
    "editFlag": true,
    endBtnsPosition: 'right',
    "titleBtns": [
      createFreeButtonBase({
        "size": "default",
        "label": "新增",
        "type": "primary",
        func: (v: any) => {
          let cPlanNo = freeEditRef.value?.getValue("cPlanNo");
          if (cPlanNo == null || cPlanNo === undefined) {
            ElMessage.error("方案编号不能为空");
            return;
          }
          payinfoEditRef?.value?.addRow();
          const val = getFromValue()
          val.forEach((key, index) => {
            key['nSeqNo'] = index + 1;
            key['cPlanNo'] = cPlanNo
          });
        }
      }),
      createFreeButtonBase({
        type: "primary",
        label: "删除",
        func: () => {
          const selData = payinfoEditRef?.value?.getSelectRow()
          if (!selData) {
            ElMessage.error("请选择要删除的数据!");
            return;
          }
          const editIndex = selData['_dataId']
          if (!selData["cPkId"] || !selData) {
            ElMessage.error(" 主键为空！请重新点击查询。");
            return;
          }
          ElMessageBox.confirm("是否要删除此行？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              // 删除逻辑
              const param = {
                id: selData["cPkId"]
              };
              policyService.deleteFormulaById(param).then((res: any) => {
                const { code, data, msg } = res;
                // if (null != res && null != code) {
                if (code === 200) {

                  if ('1' === data['code']) { // 删除成功
                    ElMessage.success("删除成功");
                    payinfoEditRef?.value?.delRow(editIndex);
                  } else {
                    ElMessage.error(msg);
                  }
                }

              })

            })
            .catch(() => {
              // 取消删除

            });
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "删除所有",
        func: () => {
          ElMessageBox.confirm("是否要删除所有行？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              let cPlanNo = freeEditRef.value?.getValue("cPlanNo");
              const param = {
                cPlanNo: cPlanNo
              };
              policyService.deleteCvrgFormulaByPlanNo(param).then((res: any) => {
                const { code, data, msg } = res;
                if (code === 200) {
                  if ('1' === data['code']) { // 删除成功
                      ElMessage.success("删除所有成功");
                    initData();
                  } else {
                    ElMessage.error(msg);
                  }
                }

              })

            })
            .catch(() => {
              // 取消删除

            });


        },
      }),

      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: () => {
          let cPlanNo = freeEditRef.value?.getValue("cPlanNo");
          if (!!cPlanNo) {
            initData();
          } else {
            ElMessage.error("方案号不存在!");

          }
        },
      }),


    ],
    endBtns: [
      createFreeButtonBase({
        "size": "default",
        "label": "保存",
        "type": "primary",
        func: async (v: any) => {
          saveProdDataFun()
        }
      }),
    ],
    fromSchema: [{

      "prop": "nSeqNo",
      "inputtype": "rtnumber",
      rules: [getRules("required", {})],
      "disabled": 1,
      "title": "序号"
    }, {

      // "readonly": 1,
      "prop": "cPlanNo",
      "inputtype": "rtinput",
      "title": "方案号",
      "disabled": 1,
      rules: [getRules("required", {})],
      func: (v: any) => {
      }
    },
    {
      "prop": "cCvrgNo",
      "inputtype": "rtinput",
      "title": "条款代码",
      func: (v: any) => {
      }
    },
    
    
    {

      // "readonly": 1,
      "prop": "cAmtFormula",
      "inputtype": "rtinput",
      "rules": [{
        "type": "required"
      }],
      "title": "保额计算公式",


    }, {

      "prop": "cPrmFormula",
      "inputtype": "rtinput",
      // "disabled": 0,
      "title": "保费计算公式",

    }, {
      "prop": "cPerPrmFormula",
      "inputtype": "rtinput",
      "rules": [{
        "type": "required"
      }],
      "disabled": 0,
      "title": "每人保费计算公式",

    }, {
      "prop": "cRateFormula",
      "disabledDate": "tPayEndTmDisabled",
      "inputtype": "rtinput",
      "rules": [{
        "type": "required"
      }],
      "disabled": 0,
      "title": "费率计算公式",

    }, {
      "prop": "cTab",
      "inputtype": "rtinput",
      "title": '取值组件（逗号分隔）',
    },

    {
      "prop": "nStartDay",
      "inputtype": "rtinput",
      "title": '开始天数',
    }, {
      "prop": "nEndDay",
      "inputtype": "rtinput",
      "title": '结束天数',
    },
    {
      "prop": "nVerifyStart",
      "inputtype": "rtinput",
      "title": '核定座位起',
    },
    {
      "prop": "nVerifyEnd",
      "inputtype": "rtinput",
      "title": '核定座位止',
    }


    ]
  })
)


const initData = () => {
  let cPlanNo = freeEditRef.value?.getValue("cPlanNo");
  const param = {
    cPlanNo: cPlanNo
  };

  policyService.getPlanCvrgFormulaInfo(param).then((res: any) => {
    const { code, data, msg } = res;
    if (null != res && null != code) {
      if (code === 200) {
        if (data) {

          let setData = data;
          for(let i =0;i<setData.length;i++){
            setData[i].nSeqNo = i+1;
          }
          setFormValue(setData)

        }
      }
    }
  })

}

//  添加公式 保存
const saveProdDataFun = async () => {
  let cPlanNo = freeEditRef.value?.getValue("cPlanNo");
  if (cPlanNo == null || cPlanNo === undefined) {
    ElMessage.error("方案编号不能为空");
    return;
  }


  const param = Object.assign({
    cPlanNo: freeEditRef.value?.getValue("cPlanNo")

  }, { items: getFromValue() });


  policyService.savePlanCvrgFormula(param).then((res: any) => {
    const { code, data, msg } = res;
    if (null != res && null != code) {
      if (code === 200) {
        if (data.code === '1') { // 保存成功
          ElMessage.success("保存成功");
          let setData = data['data'];
          for(let i =0;i<setData.length;i++){
            setData[i].nSeqNo = i+1;
          }

          setFormValue(setData)
          // for (const i in data['data']) {
          //   // const row = initGuidParam(data['data'][i]);
          //   // this.form.editRow(+i, row);
          // }
        } else {
          ElMessage.error(msg);
        }
      }
    }

  })
}



//form表单部分保存
const saveData = async (call?) => {
  const [isBasicValid, isSpecialValid] = await Promise.all([
    freeEditRef.value?.validate?.() ?? Promise.resolve(true),
    specialEditRef.value?.validate?.() ?? Promise.resolve(true),
  ]);
  if (!isBasicValid || !isSpecialValid) {
    ElMessage.error("请填写必填项");
    return;
  }

  const param = Object.assign(getPlanFormValue());
  if (!!call) {
    param["cUndrStatus"] = "1";
  }

  const result = await policyService.saveOrUpdatePlan(param);
  if (result["code"] !== 200) {
    ElMessage.error(result["msg"]);
    return;
  }

  setPlanFormValue(result.data.data);

  const saveCvrgOk = await save();
  if (!saveCvrgOk) {
    return;
  }

  if (!!call) {
    call();
  } else {
    ElMessage.success(result["data"]["message"]);
  }
};

//总的保存
const save = async () => {
  //调用保存接口
  const res = opertaor.getDataAll();
  res['cPlanNo'] = freeEditRef.value?.getValue("cPlanNo");
  console.log(res, 455454)
  const result = await policyService.savePlanCvrg(res);
  if (result["code"] === 200) {
    const ops = { cvrg: result.data.cvrg };
    opertaor.setDataAll(ops);
    ElMessage.success(result["msg"]);
    return true;
  }
  ElMessage.error(result["msg"]);
  return false;
};
const saveAndSubmit = () => {
  //调用保存并提交接口
  const call = () => {
    const res = {}
    res['cRelNo'] = freeEditRef.value?.getValue("cPlanNo");
    res['cUndrStatus'] = '1';
    res['cUndrDesc'] = '提交审核';
    res['cType'] = 'PLAN';
    policyService.addProcessUndr(res).then(result => {
      if (result['code'] === 200) {
        if (result['data']['code'] == '1') {
          ElMessage.success(result['data']['message']);
        } else {
          ElMessage.error(result['data']['message']);
        }
      } else {
        ElMessage.error(result['msg']);
      }
    });
  };
  saveData(call)
}
const goBack = () => {
  //返回上个页面
  router.go(-1)
}

//审核的提交
const submit = () => {
  //提交
  const s = reviewInfoRef.value.getFromValue(); //获取表单数据
  const res = Object.assign(s);
  res['cRelNo'] = freeEditRef.value?.getValue("cPlanNo");
  res['id'] = routeQryParams.value?.rowData?.cPkId;
  res['cType'] = 'PLAN';
  policyService.processApprove(res).then(result => {
    if (result['code'] === 200) {
      if (result['data']['code'] == '1') {
        ElMessage.success(result['data']['message']);
      } else {
        ElMessage.error(result['data']['message']);
      }
    } else {
      ElMessage.error(result['msg']);
    }
  });
}

const isPlanConfigPage = computed(() =>
  ["planConfigAdd", "planConfigupdate", "planConfigview", "planConfigCopy"].includes(rawPageType.value)
);

const getRouteTitle = () => {
  const paramsTitle = Array.isArray(route.params?.title) ? route.params.title[0] : route.params?.title;
  const queryTitle = Array.isArray(route.query?.title) ? route.query.title[0] : route.query?.title;
  return (paramsTitle as string) || (queryTitle as string) || "";
};

const breadcrumbTitle = computed(() => {
  const routeTitle = getRouteTitle();
  if (routeTitle) {
    return routeTitle;
  }
  if (isReviewPage.value) {
    return pageMode.value === "handle" ? "方案审核 - 处理" : "方案审核 - 查看";
  }
  if (isPlanConfigPage.value) {
    return pageMode.value === "add"
      ? "方案配置 - 新增"
      : pageMode.value === "edit"
        ? "方案配置 - 修改"
        : pageMode.value === "copy"
          ? "方案配置 - 复制"
          : pageMode.value === "view"
            ? "方案配置 - 查看"
            : "";
  }
  return "";
});

const titleRouteRecord = ref<any>(null);
const originalRouteTitle = ref<any>(undefined);
function restoreRouteTitle() {
  const record = titleRouteRecord.value;
  if (record?.meta && originalRouteTitle.value !== undefined) {
    record.meta.title = originalRouteTitle.value;
  }
}
function syncRouteTitle() {
  const lastRouteRecord = route.matched?.[route.matched.length - 1];
  if (lastRouteRecord?.meta) {
    titleRouteRecord.value = lastRouteRecord;
    if (originalRouteTitle.value === undefined) {
      originalRouteTitle.value = lastRouteRecord.meta.title;
    }
  }

  const title = breadcrumbTitle.value;

  if (titleRouteRecord.value?.meta) {
    titleRouteRecord.value.meta.title = title || originalRouteTitle.value;
  }
}

function applyPageReadonlyState() {
  const disablePlan = pageMode.value === "view" || isReviewPage.value || props.goodsType === "goods";
  if (disablePlan) {
    freeEditRef.value?.setDisabledAll();
    specialEditRef.value?.setDisabledAll();
    opertaor.setDisabledAll();
  }

  if (pageMode.value === "view" || pageMode.value === "handle") {
    payinfoEditRef.value?.setDisabledAll(true);
  }

  if (pageMode.value === "view") {
    reviewInfoRef.value?.setDisabledAll?.(true);
  }
}

onBeforeUnmount(() => {
  restoreRouteTitle();
});

onActivated(() => {
  initPageMode();
  syncRouteTitle();
  nextTick(() => {
    applyPageReadonlyState();
  });
});

onDeactivated(() => {
  restoreRouteTitle();
});

onMounted(async() => {
  nextTick(() => {
    syncRouteTitle();
    if (rawPageType.value == 'planConfigAdd') {
      if(getPageRowData()){
        initPage(getPageRowData());
      }
      nextTick(() => {
        freeEditRef.value?.setValue("cKindNo", routeQryParams.value?.rowData?.cKindNo);
        freeEditRef.value?.setValue("cProdNo", routeQryParams.value?.rowData?.cProdNo);
        specialEditRef.value?.setValue?.("cProdNo", routeQryParams.value?.rowData?.cProdNo);
      });
    } else {
      let param = {
        cPlanNo: getPageRowData()?.cPlanNo
      };

      policyService.getPlanBase(param).then(async result => {
        if (result['code'] === 200 && result?.data?.code === "1") {
          const detailData = getPlanBaseDetail(result);
          setPlanFormValue(detailData)
          await initPage({
            ...(getPageRowData() || {}),
            ...detailData,
          });
          if (rawPageType.value === 'planConfigCopy') {
            nextTick(() => {
              freeEditRef.value?.setValue("cPkId", null);
              freeEditRef.value?.setValue("cPlanNo", "");
              freeEditRef.value?.setValue("cUndrStatus", "0");
            });
          }

          // 根据公式计算弹框
          payinfo.value = detailData.cCalcFormula == 3 ? true : false;
          // payinfo.value = true
          if (payinfo.value) {
            initData();
          }

        } else {
          ElMessage.error(result?.data?.message || result['msg']);
        }
      });
      policyService.getPlanCvrg(param).then(async result => {
        if (result['code'] === 200) {
          await applyCvrgData(result.data.cvrg);
        } else {
          ElMessage.error(result['msg']);
        }
      });
    }
    // || props.type == 'goods'
    nextTick(() => {
      applyPageReadonlyState();
    });
  });
});

watch(
  () => payinfo.value,
  () => {
    nextTick(() => {
      applyPageReadonlyState();
    });
  }
);

watch(
  () => [route.params?.title, route.query?.title],
  () => {
    nextTick(() => {
      syncRouteTitle();
    });
  }
);
//给表单下拉项赋值
function setFormItem(prop: string, config: any) {
  formconfig1.fromSchema?.forEach((item) => {
    if (item.prop === prop) {
      Object.assign(item, config);
    }
  });
}



function getFromValue() {
  return payinfoEditRef?.value?.getFromValue();
}

function setFormValue(value: any) {
  payinfoEditRef?.value?.setFormValue(value);
}

function validate() {
  return payinfoEditRef?.value?.validate();
}

function getTableValue(rowId: number, key: string) {
  payinfoEditRef?.value?.getTableValue(rowId, key);
}


defineExpose({
  getFromValue,
  setFormValue,
  validate,
  getTableValue,
});
</script>

<style scoped lang="scss">
.module-title {
  font-weight: 600;
}
</style>

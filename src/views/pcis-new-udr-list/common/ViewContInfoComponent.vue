<!-- 配置 -->
<template>
  <el-dialog v-model="dialogVisible" width="90%" title="查看比例合约">
    <div>
      <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef1" />

      <app-table
        :tableConfig="tableconfig1"
        v-model:pageresult="pageresult1"
        ref="tableRef1"
        @selection-change="handleSelectionChange1"
        @page-change="handleQuery1(false)"
      />

      <app-table
        :tableConfig="tableconfig2"
        v-model:pageresult="pageresult2"
        ref="tableRef2"
        @selection-change="handleSelectionChange2"
        @page-change="handleQuery2(false)"
      />

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
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useRoute, useRouter, RouteRecordRaw } from "vue-router";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const router = useRouter();
const route = useRoute();
import { ref, watch, defineProps, defineEmits, onMounted } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
const props = defineProps({
  contCed: {
    type: Object,
    default: () => ({}),
  },
  CAppNo: {
    type: String,
    default: "",
  },
  param: {
    type: Object,
    default: () => ({}),
  },
});
const emits = defineEmits(["ok", "cancel"]);
const freeEditRef1 = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { deleteFactorBykey, getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { NewUdrListService } from "@/views/pcis-new-udr-list/service/new-udr-list.service";
const { viewContInfo } = NewUdrListService();
import moment from "moment";
const dialogVisible = ref(true);
const contFlag = ref("");
const modalParams = {
  cAppNo: props.CAppNo,
  contFlag: contFlag.value,
  basicList: freeEditRef1.value?.getFromValue(),
};
console.log("modalParams", modalParams);
const dzmodal = useDzModal();
const tableRef1 = ref<AppTableMethod | null>(null);
const tableRef2 = ref<AppTableMethod | null>(null);
const removeIds1 = ref([]); // 删除用户ID集合 用于批量删除
const removeIds2 = ref([]); // 删除用户ID集合 用于批量删除
const contractdetail = defineAsyncComponent(
  () => import("@/views/pcis-new-udr-list/common/contractdetail.vue")
);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "合约明细",
        func: async () => {
          dzmodal
            .open(contractdetail, { type: "Issuer", data: {} })
            .then((res) => {
              if (res.type === "ok") {
              }
            });
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
        prop: "CContiMrk",
        inputtype: "rtcheckbox",
        title: "续转",
        clearable: true,
      },
      {
        prop: "COrigContId",
        inputtype: "rtinput",
        title: "原合约标识号",
        clearable: true,
      },
      {
        prop: "CContCde",
        inputtype: "rtinput",
        title: "合约名称",
        clearable: true,
      },
      {
        prop: "CContDesc",
        inputtype: "rtinput",
        title: "合约描述",
        clearable: true,
      },
      {
        prop: "NContEdrPrjNo",
        inputtype: "rtnumber",
        title: "合同批改次数",
        clearable: true,
      },
      {
        prop: "NSectionNo",
        inputtype: "rtnumber",
        title: "合同分项号",
        clearable: true,
      },
      {
        prop: "CContractNo",
        inputtype: "rtinput",
        title: "合同号",
        clearable: true,
      },
      {
        prop: "TContOrigBgnTm",
        inputtype: "rtinput",
        title: "合同起期",
        clearable: true,
      },
      {
        prop: "TContOrigEndTm",
        inputtype: "rtinput",
        title: "合同止期",
        clearable: true,
      },
      {
        prop: "CDptCde",
        inputtype: "rtinput",
        title: "合约分出机构",
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
        title: "结束日期",
        clearable: true,
      },
      {
        prop: "CRicalMrk",
        inputtype: "rtselect",
        title: "分保基础",
        clearable: true,
        loadData: [
          { label: "风险单位", value: "R" },
          { label: "保单", value: "P" },
        ],
      },
      {
        prop: "CRiprmMrk",
        inputtype: "rtselect",
        title: "保费基础",
        clearable: true,
        loadData: [
          { label: "毛保费", value: "G" },
          { label: "净保费", value: "N" },
        ],
      },
      {
        prop: "CStlTyp",
        inputtype: "rtselect",
        title: "结清类型",
        clearable: true,
        loadData: [
          { label: "按合同终止日", value: "0" },
          { label: "按责任终止日", value: "1" },
        ],
      },
      {
        prop: "TContSignTm",
        inputtype: "rtdatepicker",
        title: "合约签订日期",
        clearable: true,
      },
      {
        prop: "CUwYear",
        inputtype: "rtinput",
        title: "业务年度",
        clearable: true,
      },
      {
        prop: "CAccCycle",
        inputtype: "rtselect",
        title: "账单周期",
        clearable: true,
        loadData: [
          { label: "月", value: "M" },
          { label: "季度", value: "Q" },
          { label: "半年", value: "H" },
          { label: "年", value: "Y" },
        ],
      },
      {
        prop: "CContStatus",
        inputtype: "rtselect",
        title: "合约状态",
        clearable: true,
        loadData: [
          { label: "未审核", value: "T" },
          { label: "已审核", value: "E" },
          { label: "已终止", value: "P" },
        ],
      },
      {
        prop: "NQsPrpt",
        inputtype: "rtnumber",
        title: "默认成数比例",
        clearable: true,
      },
      {
        prop: "NCashlossBgn",
        inputtype: "rtinput",
        title: "现金赔款起点",
        clearable: true,
      },
      {
        prop: "TLogoutTm",
        inputtype: "rtinput",
        title: "合同注销时限",
        clearable: true,
      },
      {
        prop: "NActCommRate",
        inputtype: "rtinput",
        title: "合约默认手续费率(不含税)",
        clearable: true,
      },
      {
        prop: "NCommRateLine",
        inputtype: "rtinput",
        title: "默认溢额手续费率",
        clearable: true,
      },
      {
        prop: "NDutyRate",
        inputtype: "rtnumber",
        title: "营业税率",
        clearable: true,
      },
      {
        prop: "NMngfeeRate",
        inputtype: "rtnumber",
        title: "管理费率",
        clearable: true,
      },
      {
        prop: "NLine",
        inputtype: "rtinput",
        title: "默认线数",
        clearable: true,
      },
      {
        prop: "CContCur",
        inputtype: "rtselect",
        title: "合约币种",
        clearable: true,
        typeCode: "FIN_CUR_CACHE_TWO",
        param: {},
      },
      {
        prop: "NContChgRate",
        inputtype: "rtnumber",
        title: "折人民币汇率",
        clearable: true,
      },
      {
        prop: "NContLmt",
        inputtype: "rtnumber",
        title: "默认合约限额",
        clearable: true,
      },
      {
        prop: "CChiefRicom",
        inputtype: "rtinput",
        title: "首席再保人",
        clearable: true,
      },
      {
        prop: "NChiefShare",
        inputtype: "rtnumber",
        title: "首席再保人份额",
        clearable: true,
      },
      {
        prop: "NBillDunningDays",
        inputtype: "rtdatepicker",
        title: "账单缴费期限",
        clearable: true,
      },
      {
        prop: "CRemark",
        inputtype: "rtinput",
        title: "备注",
        clearable: true,
      },
      {
        prop: "NFeeAmt",
        inputtype: "rtinput",
        title: "合约起点",
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
    title: "",
    fromSchema: [
      {
        prop: "NLossRatio",
        inputtype: "rtinput",
        title: "赔付率(%)",
        minWidth: 180,
        fixed: "left",
      },
      {
        prop: "NActCommRate",
        inputtype: "rtinput",
        title: "手续费率(%)",
        minWidth: 180,
      },
      {
        prop: "NDutyRate",
        inputtype: "rtinput",
        title: "营业税率",
        minWidth: 180,
      },
      {
        prop: "CHasTaxMrk",
        inputtype: "rtinput",
        title: "手续费是否含税",
        minWidth: 180,
      },
      {
        prop: "NMarginRate",
        inputtype: "rtinput",
        title: "再保人准备金比例(%)",
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
    title: "",
    fromSchema: [
      {
        prop: "CComCnm",
        inputtype: "rtinput",
        title: "再保公司",
        minWidth: 180,
        fixed: "left",
      },
      {
        prop: "CBrkrMrk",
        inputtype: "rtinput",
        title: "公司类型",
        minWidth: 180,
      },
      {
        prop: "NSharePrpt",
        inputtype: "rtinput",
        title: "参与比例",
        minWidth: 180,
      },
    ],
  })
);

watch(
  () => props.contCed,
  (newValue) => {
    contFlag.value = newValue["CContFlag"];
  }
);

onMounted(async () => {
  if (props.contCed.value["CContFlag"] === "CP1") {
    freeEditRef1.value?.setValue("NCommRateLine", "");
    freeEditRef1.value?.setValue("NLine", "");
  }

  let tDueTm;
  if (props.param.value["CAppTyp"] === "A") {
    const beginTm = route.query["Base.TInsrncBgnTm"] as string;
    tDueTm = moment(beginTm).isBefore(moment(Date.now()))
      ? Date.now()
      : beginTm;
  }
  tDueTm = moment(tDueTm).format("YYYY-MM-DD");

  const param = {
    cAppNo: props.CAppNo,
    cProdNo: props.param["CProdNo"],
    cContId: props.contCed["CContId"],
    tDueTm: tDueTm,
  };

  // 调用接口
  viewContInfo(param)
    .then((result: any) => {
      if (result) {
        // 基本信息
        Object.assign(
          freeEditRef1.value?.getFromValue(),
          result["data"]["contMainVOMap"]
        );
        // 合约浮动手续费
        tableRef1.value = result["data"]["floatCommList"];
        // 再保公司参与比例
        tableRef2.value = result["data"]["comShareList"];
        // 合约险种限额
        // if (props.contCed['CContFlag'] === 'CP3') {
        //   blendContractInsurance.value = result['data']['contQuotaList'];
        // }
        // if (props.contCed['CContFlag'] === 'CP1') {
        //   contractInsurance.value = result['data']['contQuotaList'];
        // }
      }
    })
    .catch(() => {
      ElMessage.error({ message: "后台服务异常,请联系管理员", duration: 3000 });
    });
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
  console.log("selection", selection);
  removeIds1.value = selection.map((item: any) => item.cPkId);
}

function handleSelectionChange2(selection: any) {
  console.log("selection", selection);
  removeIds2.value = selection.map((item: any) => item.cPkId);
}
</script>

<style scoped></style>

<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
    />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted } from "vue";
import { Search } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { AccumulatedCargo } from "../../service/accumulated-cargo";
import { getListByCode, getBsnsTypList } from "@/api/code-list-service";
import { useUserStore } from "@/store/modules/user";
import moment from "moment";
// 操作员弹框
import OrgSalesList from "./org-sales-list/org-sales-list.vue";
//机构部门弹框
import OrgDptModel from "@/components/common/DepartmentTree.vue";

import { useDzModal } from "@/common/dzmodel/DzModalService";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { useValidator } from "@/typings/useValidator";
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
const { getRules } = useValidator();
const dzmodal = useDzModal();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const userStore = useUserStore();
const user = ref<any>(userStore.user);

const businessOptions = ref<any>([]);
const accumulatedCargo = new AccumulatedCargo();
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
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
          freeEditRef.value?.resetFields();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CClntMrk",
        inputtype: "rtinput",
        title: "预约协议号",
        clearable: true,
      },
      {
        prop: "CCDate",
        inputtype: "rtinput",
        title: "投保人名称",
        clearable: true,
      },
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        title: "被保人名称",
        clearable: true,
      },
      {
        prop: "CAppNme",
        inputtype: "rtselect",
        title: "协议状态",
        clearable: true,
        typeCode: "", //暂时无接口
        params: {},
      },
      {
        prop: "CAppNme",
        inputtype: "rtselect",
        title: "操作员名称",
        showExBtn: true,
        disabled: true,
        btnItems: {
          icon: "Search",
          type: "primary",
          func: () => {
            dzmodal.open(OrgSalesList, {}).then((res) => {
              if (res.type === "ok") {
                console.log(res.body);
                freeEditRef.value?.setValue("CAppNme", res.body?.CSlsNme);
              }
            });
          },
        },
      },
      {
        prop: "CAppNme",
        inputtype: "rtselect",
        title: "归属机构名称",
        showExBtn: true,
        disabled: true,
        btnItems: {
          icon: "Search",
          type: "primary",
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
        inputtype: "rtselect",
        title: "业务来源",
        clearable: true,
        loadData: businessOptions,
        typeCode: "", //暂时无接口
        params: {},
      },
      {
        prop: "CAppNme",
        inputtype: "rtdatepicker",
        title: "生效日期",
        type: "daterange",
        format: "YYYY-MM-DD",
        valueFormat: "YYYY-MM-DD",
        func: (val) => {
          handleDateChange(val);
        },
      },
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        title: "代理人代码",
        clearable: true,
      },
      {
        prop: "CAppDate",
        inputtype: "rtdatepicker",
        title: "录入日期",
        type: "daterange",
        format: "YYYY-MM-DD",
        valueFormat: "YYYY-MM-DD",
        func: (val) => {
          handleInputDateChange(val);
        },
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
    showSelection: false,
    fromSchema: [
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "序号",
        showIndex: true,
        fixed: "left",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "二级机构",
        fixed: "left",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "三级机构",
        fixed: "left",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "协议号",
        fixed: "left",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "申请单号",
        fixed: "left",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "保单号",
        fixed: "left",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "投保人",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "被保人",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "协议起期",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "协议止期",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "操作员",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "输入日期",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "预估总保费",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "预估总保额",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "运输上限(每次)",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "最低保费",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "最低保费",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "预扣保额",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "协议剩余实收(预估)保额",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "预收保费",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "预扣保费",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "协议剩余实收(预估)保费",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "协议状态",
      },
    ],
  })
);

const handleDateChange = (value) => {
  let startDate,
    endDate = "";
  startDate = moment(new Date(value[0])).format("YYYY-MM-DD");
  endDate = moment(new Date(value[1])).format("YYYY-MM-DD");
  console.log("时间", startDate, endDate);
};

const handleInputDateChange = (value) => {
  let startDate,
    endDate = "";
  startDate = moment(new Date(value[0])).format("YYYY-MM-DD");
  endDate = moment(new Date(value[1])).format("YYYY-MM-DD");
  console.log("时间", startDate, endDate);
};

const handleQuery = (flag) => {
  submitForm(flag);
};

const submitForm = (flag) => {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      refreshData(flag);
    } else {
      console.log("error submit!!");
      return false;
    }
  });
};

const refreshData = (reset = true) => {
  const r = tableRef.value?.getPartnerPage(reset); //获取分页数据
  const s = freeEditRef.value?.getFromValue();
  const params = Object.assign(s, r);
  accumulatedCargo.qryList(params).then((res: any) => {
    if (res.code === 200) {
      const pageData = res.data;
      if (pageData) {
        pageresult.total = pageData.total;
        pageresult.list = pageData.result;
      }
    }
  });
};

onMounted(() => {
  const ops = {
    CDptCde: freeEditRef.value?.getValue("CDptCde"),
    CKindNo: "",
  };
  //业务类型
  getBsnsTypList(ops).then((res: any) => {
    if (null != res && null != res["code"]) {
      if (res["code"] === 200) {
        businessOptions.value = res.data;
      }
    }
  });
  refreshData();
});
</script>

<style scoped lang="scss">
.custom-modal {
  width: 1000px;
}

.inlineForm {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  position: relative;
}

.clo-2 {
  flex: 0 0 50%;
  max-width: 50%;
}

.clo-3 {
  flex: 0 0 33%;
  max-width: 33%;
}

.clo-4 {
  flex: 0 0 25%;
  max-width: 25%;
}

.col-button {
  flex: 0 0 100%;
}
</style>
<style lang="scss">
.addRoleConfirmPop {
  .el-message-box__container {
    display: block;
  }
}
.app-container{
  padding: 6px 30px;
}
::v-deep(.el-form){
  padding: 5px 30px;
}
</style>

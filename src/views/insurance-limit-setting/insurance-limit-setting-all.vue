<template>
  <div class="app-container">
    <app-free-edit
      v-model:freeEditConfig="formconfig1"
      ref="freeEditRef"
      @update-datas="fromUpdata"
    />
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
import { ElMessage } from "element-plus";
import { InsuranceLimit } from "./service/index";
import { getListByCode } from "@/api/code-list-service";
import { AppKey } from "@/constants/api";
// import { BaseCheck } from '@/utils/base-check';
import AddOrEdit from "./components/addOrEdit.vue";

import { useUserStore } from "@/store/modules/user";
import { useValidator } from "@/typings/useValidator";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const userStore = useUserStore();
const { getRules } = useValidator();
const CCertfClsType = ref("INSURE_NATURE_CACHE"); //客户证件类型字段请求数据字典的type值
const CCertfClsType2 = ref("INSURE_NATURE_CACHE"); //股东证件类型字段请求数据字典的type值
const CCertfCdeRules = ref([getRules("required", {})]);

const selected = ref<string | number>("");
const user = ref<any>({});
user.value = userStore.user || {};
const insuranceLimit = new InsuranceLimit();
const currentAction = ref("新增"); // add  update

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
          freeEditRef.value?.setFormValue({
            COperId: "",
            CDptCde: "",
          });
          handleQuery();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CClntMrk",
        inputtype: "rtselect",
        title: "客户性质",
        clearable: true,
        typeCode: "INSURE_NATURE_CACHE",
        param: {},
        func: (val) => {
          handleNatureChange(val);
        },
      },
      {
        prop: "CCertfCls",
        inputtype: "rtselect",
        title: "客户证件类型",
        clearable: true,
        typeCode: CCertfClsType,
        param: {},
        func: (val) => {
          handleCertificateChange(val);
        },
      },
      {
        prop: "CCertfCde",
        inputtype: "rtinput",
        title: "客户证件号码",
        clearable: true,
        rules: CCertfCdeRules,
      },
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        title: "客户名称",
        clearable: true,
      },
      {
        prop: "CClntMrk",
        inputtype: "rtselect",
        title: "股东性质",
        clearable: true,
        typeCode: "INSURE_NATURE_CACHE",
        param: {},
        func: (val) => {
          handleNatureChange2(val);
        },
      },
      {
        prop: "CCertfCls",
        inputtype: "rtselect",
        title: "股东证件类型",
        clearable: true,
        typeCode: CCertfClsType2,
        param: {},
      },
      {
        prop: "CCertfCde",
        inputtype: "rtinput",
        title: "股东证件号码",
        clearable: true,
      },
      {
        prop: "CAppNme",
        inputtype: "rtinput",
        title: "股东名称",
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
    showSelection: false,
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "新增",
        type: "success",
        func: function () {
          openEdit("新增");
        },
      }),
    ],
    tableBtnType: "btn",
    tableBtnWidth: 110,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {
          openEdit("修改", row.cOpgrpCde);
        },
      }),
    ],

    fromSchema: [
      {
        prop: "cOpgrpMemo",
        inputtype: "rtinput",
        title: "序号",
      },
      {
        prop: "cOpgrpMemo",
        inputtype: "rtinput",
        title: "客户性质",
      },
      {
        prop: "cOpgrpMemo",
        inputtype: "rtinput",
        title: "客户证件类型",
      },
      {
        prop: "cOpgrpMemo",
        inputtype: "rtinput",
        title: "客户证件号码",
      },
      {
        prop: "cOpgrpMemo",
        inputtype: "rtinput",
        title: "客户名称",
      },
      {
        prop: "cOpgrpMemo",
        inputtype: "rtinput",
        title: "股东性质",
      },
      {
        prop: "cOpgrpMemo",
        inputtype: "rtinput",
        title: "股东证件类型",
      },
      {
        prop: "cOpgrpMemo",
        inputtype: "rtinput",
        title: "股东证件号码",
      },
      {
        prop: "cOpgrpMemo",
        inputtype: "rtinput",
        title: "股东名称",
      },
      {
        prop: "cOpgrpMemo",
        inputtype: "rtinput",
        title: "保额/限额",
      },
    ],
  })
);

// // 证件号码
// const idCard = (rule: any, value: any, callback: any) => {
//   return BaseCheck.idCard(value) ? callback(BaseCheck.idCard(value)): callback();
// }
// //统一社会信用代码校验
// const socialCode = (rule: any, value: any, callback: any) => {
//   return BaseCheck.socialCode(value)?callback(BaseCheck.socialCode(value)):callback();
// }
// //组织机构校验
// const orgCode = (rule: any, value: any, callback: any) => {
//   return BaseCheck.orgCode(value)?callback(BaseCheck.orgCode(value)):callback();
// }
// /**
//  *自然人姓名
//  */
//  const perName = (rule: any, value: any, callback: any) => {
//   return BaseCheck.perName(value)?callback(BaseCheck.perName(value)):callback();
// }
const rules = reactive({
  CClntMrk: [{ required: true, message: "不能为空!", trigger: "change" }],
  CCertfCls: [{ required: true, message: "不能为空!", trigger: "change" }],
  CCertfCde: [
    { required: true, message: "不能为空!", trigger: "blur" },
    // { validator: idCard, trigger: 'blur' },
    { max: 20, message: "长度不能超过 20 个字符", trigger: "blur" },
  ],
  CAppNme: [
    { required: true, message: "不能为空!", trigger: "blur" },
    // { validator: perName, trigger: 'blur' },
    { max: 50, message: "长度不能超过 50 个字符", trigger: "blur" },
  ],
});

const handleQuery = (flag = true) => {
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
  insuranceLimit.qryList(params).then((res: any) => {
    if (res.code === 200) {
      const pageData = res.data;
      if (pageData) {
        pageresult.total = pageData.total;
        pageresult.list = pageData.result;
      }
    }
  });
};

//客户性质  根据个人/法人选择 展示不同的证件类型投标人性质
const handleNatureChange = (value: string) => {
  if (value === "1") {
    CCertfClsType.value = "NATURAL_CERTIFICATE_CACHE";
  } else if (value === "0") {
    CCertfClsType.value = "UN_NATURAL_CERTIFICATE_CACHE";
  }
};

//股东性质  根据个人/法人选择 展示不同的证件类型投标人性质
const handleNatureChange2 = (value: string) => {
  if (value === "1") {
    CCertfClsType.value2 = "NATURAL_CERTIFICATE_CACHE";
  } else if (value === "0") {
    CCertfClsType.value2 = "UN_NATURAL_CERTIFICATE_CACHE";
  }
};

//证件类型change
const handleCertificateChange = (value: string) => {
  freeEditRef.value?.setValue("CCertfCde", ""); //清空客户证件号码值
  freeEditRef.value.clearValidate("CCertfCde"); //客户证件号码
  if (value == "120001") {
    CCertfCdeRules.value = [getRules("idCard", {}), getRules("required", {})];
  } else if (value == "110005") {
    CCertfCdeRules.value = [
      getRules("required", {}),
      getRules("socialCode", {}),
    ];
  } else if (value == "110001") {
    CCertfCdeRules.value = [getRules("required", {}), getRules("orgCode", {})];
  } else {
    CCertfCdeRules.value = [getRules("required", {})];
  }
};

const openEdit = (type: string, id?: string) => {
  if (type === "修改" && !id) {
    ElMessage.warning("请选择一条记录");
    return;
  }
  currentAction.value = type;
  selected.value = id;
  dzmodal
    .open(AddOrEdit, { actionType: currentAction, pageType: "all" })
    .then((res) => {
      if (res.type === "ok") {
        console.log("dzmodel", res.body);
      }
    });
};

onMounted(() => {
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
</style>

<!-- 缴费信息审核-详情 -->
<template>
  <el-dialog v-model="dialogVisible" width="90%">
    <div>
      <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" @update-datas="fromUpdata" />
      <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
        <rt-button :item="{
          type: 'primary',
          label: '审核通过',
          func: () => {
            passInfo();
          },
        }" />

        <rt-button :item="{
          type: 'primary',
          label: '支票退回',
          func: () => {
            backInfo();
          },
        }" />
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store";
import { useValidator } from "@/typings/useValidator";
import { yesOrNo, size, inputtype, typeMap, dateType } from "@/utils/utilKey";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { createFreeButtonBase } from "@/shared/button-config";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import {
  AppTableConfig,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";

const props = defineProps({
  data: Object,
  type: String,
  CChqueNo: {
    type: String,
    default: "",
  },
});
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
import { v4 as uuidv4 } from "uuid";
import { useRoute, useRouter, RouteRecordRaw } from "vue-router";
const router = useRouter();
const route = useRoute();
import { SCENE_PAY_CONFIRM_INFO_REGISTER } from "@/constants/tab-constants";
import { PcisQueryService } from "@/views/payinfoManagement/service/pcis-query-service";
const pcisQueryService = new PcisQueryService();

const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
);
const bankList = defineAsyncComponent(() => import("./bankList.vue"));
const jsonArrayEdit = defineAsyncComponent(
  () => import("@/common/dzmodel/jsonArrayEdit.vue")
);
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });

const showBtnConfig = ref(false);
const dialogVisible = ref(true);
const showView = ref(false);
const dzmodal = useDzModal();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const freeLookRef = ref<AppFreeEditMethod | null>(null);
const freeEditRefBtn = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const appTableShow = ref(false);

function fromUpdata(newData: any) {
  const jsonObj = getFrom();
  if (jsonObj) {
    jsonObj.func = null;
    if (jsonObj.loadData) {
      jsonObj.loadData = JSON.parse(jsonObj.loadData);
    }
    if (jsonObj.showExBtn === "1") {
      jsonObj.showExBtn = true;
      jsonObj.btnItems = createFreeButtonBase(jsonObj.btn);
      jsonObj.btnWidth = jsonObj.btn?.btnWidth;
    } else {
      jsonObj.showExBtn = false;
    }
    if (jsonObj.required === "1") {
      jsonObj.rules = [getRules("required", {})];
    }
    if (
      jsonObj.inputtype === "rtinputgroup" ||
      jsonObj.inputtype === "rttable"
    ) {
      return;
    }
    jsonObj.func = null; // 方法去掉,不让预览触发事件
  }
}
const schemaMap = reactive<Record<string, any>>({
  rtinputgroup: [],
});

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "缴费信息审核",
    fromSchema: [
      {
        prop: "cRegDptCde",
        inputtype: "rtselect",
        typeCode: "PLYDPT_LIST",
        disabled: true,
        // param: { cIsValid: '1', userOrg: user.value.companyId },
        title: "业务机构",
        itemWidth: 2,
        disabled: true,
      },
      {
        prop: "cAppNum",
        inputtype: "rtinput",
        title: "选择单数",
        disabled: true,
      },
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
        rules: [getRules("required", {})],
        disabled: true,
      },
      {
        prop: "cPayNme",
        inputtype: "rtinput",
        title: "出票人",
        disabled: true,
      },
      {
        prop: "cChequeNo",
        inputtype: "rtinput",
        title: "支票号",
        defaultValue: props.CChqueNo,
        disabled: true,
      },

      {
        prop: "nPayAmt",
        inputtype: "rtnumber",
        title: "(收据)金额",
        disabled: true,

      },
      {
        prop: "nTax",
        inputtype: "rtnumber",
        title: "车船税",
        disabled: true,
      },
      {
        prop: "nPrm",
        inputtype: "rtnumber",
        title: "实收金额",
        disabled: true,
      },

      {
        prop: "tChargeTm",
        inputtype: "rtdatepicker",
        title: "收票时间",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        // rules: [getRules("required", {})],
      },


      {
        prop: "cChargeCde",
        inputtype: "rtinput",
        title: "(收据)收款人",
        disabled: true,
      },
      // {
      //   prop: "cSeqNo",
      //   inputtype: "rtinput",
      //   title: "付款人账号",
      // },
      // {
      //   prop: "cSeqNo",
      //   inputtype: "rtinput",
      //   title: "单证号",
      // },
      // {
      //   prop: "cSeqNo",
      //   inputtype: "rtinput",
      //   title: "付款人账号",
      // },
      // {
      //   prop: "cSeqNo",
      //   inputtype: "rtinput",
      //   title: "付款人账号",
      // },

      {
        prop: "cCHeckPsn",
        inputtype: "rtinput",
        title: "审核人",
        disabled: true,
      },
      {
        prop: "nStampTax",
        inputtype: "rtnumber",
        title: "印花税",
        disabled: true,
        // rules: [getRules("required", {})],
      },
      // {
      //   prop: "CProvinces",
      //   inputtype: "rtcascader",
      //   typeCode: "WEB_BAS_AREA",
      //   param: { cParCde: '1', cType: '1' },
      //   title: "开户行省",
      //   // rules: [getRules("required", {})],
      // },
      // {
      //   prop: "CCity",
      //   inputtype: "rtcascader",
      //   // typeCode: "WEB_BAS_AREA",
      //   // param: { cParCde: '0', cType: '2' },
      //   title: "开户行市",
      //   // rules: [getRules("required", {})],
      // },
      // {
      //   prop: "CBankCounty",
      //   inputtype: "rtcascader",
      //   // typeCode: "WEB_BAS_AREA",
      //   // param: { cParCde: '0', cType: '3' },
      //   title: "开户行县",
      //   // rules: [getRules("required", {})],
      // },
      // {
      //   prop: "cascaderarea",
      //   inputtype: "rtcascader",
      //   title: "开户行",
      //   // rules: [required()],
      //   typeCode: "getarealist",
      //   codeParam: { cParCde: "1" },
      //   // loadData:[{"label":"中国","value":"1"}],
      //   cascaderprops: ["cProvinces", "cCity", "cBankCounty"],
      //   showExBtn: false,
      //   maxlevel: 3,
      //   btnWidth: 30,
      //   // btnItems: createFreeButtonBase({
      //   //     label: "测试塞值",
      //   //     func: function () {
      //   //         freeEditRef.value?.setFormValue({
      //   //             'CProvinces':'120000',
      //   //             'CCity':'120102',
      //   //             'CBankCounty':'120102'
      //   //         });
      //   //         const t = freeEditRef.value?.getFromValue();
      //   //         console.log(t);
      //   //     },
      //   // }),
      // },
      // {
      //   prop: "cBankNme",
      //   inputtype: "rtselect",
      //   title: "收款银行大类",
      //   // rules: [getRules("required", {})],
      //   typeCode: "SELECT_CBANKRELTYP",
      //   params: { cParCde: ["0", "1", "2", "3", "4", "5", "6", "7", "9"] },
      // },
      // {
      //   prop: "cBankcode",
      //   inputtype: "rtinput",
      //   title: "开户行",
      //   // rules: [getRules("required", {})],
      //   showExBtn: true,
      //   btnItems: {
      //     icon: "Search",
      //     type: "primary",
      //     func: () => {
      //       dzmodal
      //         .open(bankList, {
      //           type: "Issuer",
      //           data: { CBankNme: freeEditRef.value?.getValue("CBankNme") },
      //         })
      //         .then((res) => {
      //           if (res.type === "ok") {
      //             // res.data 为返回的数据
      //             freeEditRef.value?.setValue(
      //               "CBankcode",
      //               res.data.bankCde + "_" + res.data.bankName
      //             );
      //             freeEditRef.value?.setValue("CBankAddr", res.data.bankName);
      //             freeEditRef.value?.setValue("CBankCnaps", res.data.bankCde);
      //           }
      //         });
      //     },
      //   },
      // },
      // {
      //   prop: "cBankCnaps",
      //   inputtype: "rtinput",
      //   title: "CNAPS号",
      // },
      // {
      //   prop: "cBankAddr",
      //   inputtype: "rtinput",
      //   title: "开户行地址",
      // },
      // {
      //   prop: "cPubPri",
      //   inputtype: "rtselect",
      //   title: "对公对私",
      //   rules: [getRules("required", {})],
      //   loadData: [
      //     { label: "对公", value: "1" },
      //     { label: "对私", value: "2" },
      //   ],
      // },
      // {
      //   prop: "cBankCde",
      //   inputtype: "rtinput",
      //   // typeCode: "BANK_QUERY",
      //   // param: { CdptCde: user.value.companyId },
      //   title: "收款人账号",
      //   rules: [getRules("required", {})],
      // },   
      {
        prop: "tChargeTm",
        inputtype: "rtdatepicker",
        title: "到账时间",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        // rules: [getRules("required", {})],
      },
      {
        prop: "cCurtainNo",
        inputtype: "rtinput",
        title: "银行到账通知单号",
        disabled: true,
      },
      // CUniqueNo TUpdTm CAppTyp 这三个需要询问，因为原文件是隐藏的字段
      {
        prop: "cCheckOpn",
        inputtype: "rtinput",
        title: "审核意见",
        type: "textarea",
        rows: 4,
        itemWidth: 3,
        // defaultValue: '同意',
        rules: [getRules("required", {})],

      },
    ],
    showSuperior: true,
    superFromSchema: [],
  })
);

// 小数点格式化
function numberFormat(value: any, precision: number) {
  let res = "0.00";
  if (value) {
    res = `${Number(value).toFixed(precision)}`;
  } else {
    res = `${Number(res).toFixed(precision)}`;
  }
  return res;
}

// 加载缴费信息明细
function loadPayConfirmInfo(param) {
  console.log(param);
  pcisQueryService
    .loadPayConfirmInfo(param)
    .then((res: any) => {
      const { code, data, msg } = res;
      if (res.code === 200) {
        const data = res["data"];
        console.log("eeeeeeee", data);
        // const newdata = {};
        // Object.keys(data).forEach((key) => {
        //     const k = firstCharUpper(key);
        //     newdata[k] = data[key];
        // });
        freeEditRef.value?.setFormValue(data);
        freeEditRef.value?.setValue("CCheckOpn", "同意");
      }
    })
    .catch((error: any) => {
      ElMessage.error({ message: "连接失败！" + error, duration: 3000 });
    });
}

// 支票通过
function passInfo() {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      const s = freeEditRef.value?.getFromValue(); //获取表单数据
      pcisQueryService
        .payConfirmInfoAudit(s)
        .then((res: any) => {
          if (res.code !== 200) {
            ElMessage.error({ message: res.msg, duration: 3000 });
          } else {
            ElMessage.success({
              message: "审核通过，" + res.msg,
              duration: 3000,
            });
            emits("ok", {});
          }
        })
        .catch((error: any) => {
          console.log("出错了", error);
          ElMessage.error({
            message: "后台服务异常,请联系管理员",
            duration: 3000,
          });
        });
    } else {
      ElMessage.error("请填写必填项");
    }
  });
}
// 支票回退
function backInfo() {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      const s = freeEditRef.value?.getFromValue(); //获取表单数据
      pcisQueryService
        .payConfirmInfoBack(s)
        .then((res: any) => {
          if (res.code !== 200) {
            ElMessage.error({ message: res.msg, duration: 3000 });
          } else {
            ElMessage.success({ message: "支票退回成功", duration: 3000 });
            emits("ok", {});
          }
        })
        .catch((error: any) => {
          console.log("出错了", error);
          ElMessage.error({
            message: "后台服务异常,请联系管理员",
            duration: 3000,
          });
        });
    } else {
      ElMessage.error("请填写必填项");
    }
  });
}

onMounted(async () => {
  nextTick(() => {
    const param = {
      CUniqueNo: props.data.cUniqueNo,
    };
    loadPayConfirmInfo(param);
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
    const r = freeEditRef.value?.getFromValue();
    if (r["name"]) {
      callback();
    } else {
      callback("姓名");
    }
  },
};

/* 获取全量表单数据 */
function getFrom() {
  let s = freeEditRef.value?.getFromValue(); //获取表单数据
  if (showBtnConfig.value) {
    s["showExBtn"] = "1";
  } else {
    s["showExBtn"] = "0";
  }
  if (s) {
    const param = Object.assign(s);
    if (props.type === "edit") {
      param["cPkId"] = props.data.cPkId;
    }
    if (freeEditRefBtn.value) {
      let btnjson = freeEditRefBtn.value?.getFromValue();
      btnjson.initid = uuidv4().replace(/-/g, "");
      param["btn"] = btnjson;
    }
    if (tableRef.value) {
      const tabjson = tableRef.value?.getFromValue();
      let selectList = tabjson.filter((item: any) => item.isChecked === "1");
      param["tabjson"] = selectList;
    }
    return param;
  }
}
/**
 * 首字母转换大写
 * @param {string} str
 * @returns {string}
 */
function firstCharUpper(str: string) {
  return str.replace(/\b(\w)(\w*)/g, function ($0, $1, $2) {
    return $1.toUpperCase() + $2;
  });
}
</script>

<style scoped></style>

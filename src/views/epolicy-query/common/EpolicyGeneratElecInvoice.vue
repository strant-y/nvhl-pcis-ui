<template>
  <el-dialog v-model="dialogVisible" width="90%" title="开具电子发票">
    <div>
      <app-free-edit
        v-model:freeEditConfig="formconfig1"
        ref="freeEditRef"
        @update-datas="fromUpdata"
      />
      <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
        <rt-button
          :item="{
            type: 'primary',
            label: '下载',
            func: () => {
              down();
            },
          }"
        />

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
import { useValidator } from "@/typings/useValidator";
import { yesOrNo, size, inputtype, typeMap, dateType } from "@/utils/utilKey";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { createFreeButtonBase } from "@/shared/button-config";
import {
  getButtonByFacKey,
  getFactorList,
  getInputGroupList,
  saveFactor,
  saveKindInfo,
} from "@/api/prod";
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
  cDptCde: String,
});
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
import { v4 as uuidv4 } from "uuid";
const jsonArrayEdit = defineAsyncComponent(
  () => import("@/common/dzmodel/jsonArrayEdit.vue")
);

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

const allForm = ref<Array<any>>([
  {
    prop: "cPlyNo",
    inputtype: "rtinput",
    title: "保单号",
    showKey: [0, 1, 2],
  },
  {
    prop: "phoneNo",
    inputtype: "rtinput",
    title: "手机号",
    maxlength: 11,
    showKey: [0, 1, 2],
    rules: [getRules("required", {}), getRules("phoneNo", {})],
  },
  {
    prop: "eMailMsg",
    inputtype: "rtinput",
    title: "电子邮箱",
    showKey: [0, 1, 2],
    rules: [getRules("required", {}), getRules("email", {})],
  },
  {
    prop: "draweetypeValue",
    inputtype: "rtselect",
    title: "受票方类型",
    showKey: [0, 1, 2],
    rules: [getRules("required", {})],
    loadData: [
      { label: "个人", value: "1" },
      { label: "企业", value: "2" },
    ],
    func: (val: any) => {
      formObj.notWaitObj.fromSchema.value = [];
      // 开票类型 开票类型 0 时需要显示 原发票号码YFPHM 原发票代码YFPDM
      allForm.value.map((item: any, index: number) => {
        const isVal = item.showKey.findIndex(
          (vals: any) =>
            vals == val ||
            (freeEditRef?.value?.getValue("FPLX") == 0 &&
              (item.prop == "YFPHM" || item.prop == "YFPDM"))
        );
        if (isVal !== -1) formObj.notWaitObj.fromSchema.value.push(item);
      });
    },
  },
  {
    prop: "spfmc",
    inputtype: "rtinput",
    title: "受票方名称",
    showKey: [0, 1, 2],
  },
  {
    prop: "spfsbh",
    inputtype: "rtinput",
    title: "受票方识别号",
    showKey: [2],
  },
  {
    prop: "spfyhzh",
    inputtype: "rtinput",
    title: "受票方银行账号",
    showKey: [2],
  },
  {
    prop: "spfyhdzdh",
    inputtype: "rtinput",
    title: "受票方地址/电话",
    showKey: [2],
  },
  {
    prop: "kpry",
    inputtype: "rtselect",
    title: "开票人员",
    showKey: [0, 1, 2],
    rules: [getRules("required", {})],
    typeCode: "KPRY_CNM_BY_DPTCDE",
    params: { CDptCde: props.cDptCde },
    clearable: true,
  },
  {
    prop: "skry",
    inputtype: "rtinput",
    title: "收款人员",
    showKey: [0, 1, 2],
    rules: [getRules("required", {})],
  },
  {
    prop: "fhry",
    inputtype: "rtinput",
    title: "复核人员",
    showKey: [0, 1, 2],
    rules: [getRules("required", {})],
  },
  {
    prop: "FPLX",
    inputtype: "rtselect",
    title: "开票类型",
    showKey: [0, 1, 2],
    rules: [getRules("required", {})],
    loadData: [
      { label: "发票红冲", value: "0" },
      { label: "开具发票", value: "1" },
    ],
    func: (val: any) => {
      console.log("val", val);
      formObj.notWaitObj.fromSchema.value = [];
      allForm.value.map((item: any, index: number) => {
        const isVal = item.showKey.findIndex((vals: any) => vals == val);
        if (isVal !== -1) formObj.notWaitObj.fromSchema.value.push(item);
      });

      console.log(formObj.notWaitObj.fromSchema);
    },
  },
  {
    prop: "YFPHM",
    inputtype: "rtinput",
    title: "原发票号码",
    showKey: [0],
  },
  {
    prop: "YFPDM",
    inputtype: "rtinput",
    title: "原发票代码",
    showKey: [0],
  },
]);

const formObj = {
  notWaitObj: {
    endBtnsPosition: "right",
    endBtns: [],
    fromSchema: ref<any>([]),
    showSuperior: true,
    superFromSchema: [],
  },
};

let formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig(formObj.notWaitObj)
);

onMounted(async () => {
  // 初始化表单
  allForm.value.map((item: any, index: number) => {
    const isVal = item.showKey.findIndex((vals: any) => vals == 1);
    if (isVal !== -1) formObj.notWaitObj.fromSchema.value.push(item);
  });
  if (props.type === "edit" && props.data) {
    setTimeout(() => {
      freeEditRef.value?.setFormValue(props.data);
    }, 50);
  }
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

/** 下载 */
function down() {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      const formParam = getFrom();
      // const param = Object.assign({ type: props.type }, formParam);
      // saveKindInfo(param)
      //   .then((res) => {
      //     const { code, data, msg } = res;
      //     if (200 === code) {
      //       emits("ok", {});
      //       ElMessage.success("保存成功");
      //       dialogVisible.value = false;
      //     } else {
      //       ElMessage.error(msg);
      //     }
      //   })
      //   .finally(() => {});
    } else {
      ElMessage.error("请填写必填项");
    }
  });
}

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
</script>

<style scoped></style>

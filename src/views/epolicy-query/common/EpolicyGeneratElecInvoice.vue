<!-- 开具电子发票 -->
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
              downloadInvoice();
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
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import {
  AppTableConfig,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
const policyService = new PolicyService();
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

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [],
    fromSchema: [
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
        defaultValue: props.data.cPlyNo,
      },
      {
        prop: "phoneNo",
        inputtype: "rtinput",
        title: "手机号",
        maxlength: 11,
        rules: [
          getRules("required", {}),
          getRules("phoneNo", {})
        ],
        defaultValue: props.data.cMobile,
      },
      {
        prop: "eMailMsg",
        inputtype: "rtinput",
        title: "电子邮箱",
        rules: [
          getRules("required", {}),
          getRules("email", {})
        ],
        defaultValue: props.data.cEmail,
      },
      {
        prop: "draweetypeValue",
        inputtype: "rtselect",
        title: "受票方类型",
        rules: [getRules("required", {})],
        loadData:[
          { label: "个人",value: "1" },
          { label: "企业",value: "2" },
        ],
        defaultValue: '1',
        func: (val: any) => {
          freeEditRef.value?.clearValidate('spfsbh');
          freeEditRef.value?.clearValidate('spfyhzh');
          freeEditRef.value?.clearValidate('spfyhdzdh');
          const items1 = freeEditRef.value?.getFromSchemaItem('spfsbh');
          const items2 = freeEditRef.value?.getFromSchemaItem('spfyhzh');
          const items3 = freeEditRef.value?.getFromSchemaItem('spfyhdzdh');
          if (val === '2') {
            items1.type = 'show';
            items2.type = 'show';
            items3.type = 'show';
            items1.rules = [getRules("required", {})];
            items2.rules = [getRules("required", {})];
            items3.rules = [getRules("required", {})];
          }else{
            items1.type = 'hidden';
            items2.type = 'hidden';
            items3.type = 'hidden';
            items1.rules = [];
            items2.rules = [];
            items3.rules = [];
            freeEditRef.value?.setValue('spfsbh', '');
            freeEditRef.value?.setValue('spfyhzh', '');
            freeEditRef.value?.setValue('spfyhdzdh', '');
          }
        }
      },
      {
        prop: "spfmc",
        inputtype: "rtinput",
        title: "受票方名称",
        defaultValue: props.data.CAppName
      },
      {
        type: "hidden",
        prop: "spfsbh",
        inputtype: "rtinput",
        title: "受票方识别号",
      },
      {
        type: "hidden",
        prop: "spfyhzh",
        inputtype: "rtinput",
        title: "受票方银行账号",
      },
      {
        type: "hidden",
        prop: "spfyhdzdh",
        inputtype: "rtinput",
        title: "受票方地址/电话",
      },
      {
        prop: "kpry",
        inputtype: "rtselect",
        title: "开票人员",
        rules: [getRules("required", {})],
        typeCode: "KPRY_CNM_BY_DPTCDE",
        params: { CDptCde: props.cDptCde },
        clearable: true,
      },
      {
        prop: "skry",
        inputtype: "rtinput",
        title: "收款人员",
        rules: [getRules("required", {})],
      },
      {
        prop: "fhry",
        inputtype: "rtinput",
        title: "复核人员",
        rules: [getRules("required", {})],
      },
      {
        prop: "FPLX",
        inputtype: "rtselect",
        title: "开票类型",
        rules: [getRules("required", {})],
        loadData:[
          { label: "发票红冲",value: "0" },
          { label: "开具发票",value: "1" },
        ],
        defaultValue: '1',
        func: (val: any) => {
          freeEditRef.value?.clearValidate('YFPHM');
          freeEditRef.value?.clearValidate('YFPDM');
          const items1 = freeEditRef.value?.getFromSchemaItem('YFPHM');
          const items2 = freeEditRef.value?.getFromSchemaItem('YFPDM');
          if (val === '0') {
            items1.type = 'show';
            items2.type = 'show';
            items1.rules = [getRules("required", {})];
            items2.rules = [getRules("required", {})];
          }else{
            items1.type = 'hidden';
            items2.type = 'hidden';
            items1.rules = [];
            items2.rules  = [];
            freeEditRef.value?.setValue('YFPHM', '');
            freeEditRef.value?.setValue('YFPDM', '');
          }
        }
      },
      {
        type: "hidden",
        prop: "YFPHM",
        inputtype: "rtinput",
        title: "原发票号码",
      },
      {
        type: "hidden",
        prop: "YFPDM",
        inputtype: "rtinput",
        title: "原发票代码",
      }
    ],
    showSuperior: true,
    superFromSchema: [],
  })
);

onMounted(async () => {
  
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
function downloadInvoice() {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      const formData = freeEditRef.value?.getFromValue();
      const param = {
        ...formData,
      };
      policyService.validEleInvoiceFile(param).then((res: any) => {
        if (res.code === 200) {
          window.open(res.data, '_blank');
        } else {
          ElMessage.warning({ message: res.msg, duration: 3000 });
        }
        emits('ok');
      }).catch((err: any) => {
        ElMessage.error({ message: err.msg, duration: 3000 });
        console.log('出错啦', err.msg);
        emits('ok');
      });
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

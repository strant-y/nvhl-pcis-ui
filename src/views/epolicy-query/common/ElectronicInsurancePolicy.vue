<!-- 生成电子保单 -->
<template>
  <el-dialog v-model="dialogVisible" width="90%" title="生成电子保单">
    <div>
      <app-free-edit
        v-model:freeEditConfig="formconfig1"
        ref="freeEditRef"
      />
      <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
        <rt-button
          :item="{
            type: 'primary',
            label: '确认',
            func: () => {
              createEPolicy();
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
  type: String,
  cAppNo: String,
  plyTy: String,
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
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "预览打印",
        func: async () => {
          
        },
      }),
    ],
    fromSchema: [
      {
        prop: "note",
        inputtype: "rtselect",
        title: "是否发送短信",
        rules: [getRules("required", {})],
        loadData:[
          { label: "是",value: "1" },
          { label: "否",value: "0" },
        ],
        func: (val) => {
          // 清除报错信息
          freeEditRef.value?.clearValidate('phoneNo');
          freeEditRef.value?.clearValidate('msgData');
          const items1 = freeEditRef.value?.getFromSchemaItem('phoneNo');
          const items2 = freeEditRef.value?.getFromSchemaItem('msgData');
          if (val === '1') {
            items1.rules = [
              getRules("required", {}),
              getRules("phoneNo", {})
            ];
            items2.rules = [getRules("required", {})]
          } else {
            freeEditRef.value?.setValue('phoneNo', '');
            freeEditRef.value?.setValue('msgData', '');
            items1.rules = []
            items2.rules = []
          }
        }
      },
      {
        prop: "eMail",
        inputtype: "rtselect",
        title: "是否发送邮件",
        rules: [getRules("required", {})],
        loadData:[
          { label: "是",value: "1" },
          { label: "否",value: "0" },
        ],
        func: (val) => {
          // 清除报错信息
          freeEditRef.value?.clearValidate('eMailMsg');
          const items = freeEditRef.value?.getFromSchemaItem('eMailMsg');
          if (val === '1') {
            items.rules = [
              getRules("required", {}),
              getRules("email", {})
            ]
          } else {
            freeEditRef.value?.setValue('eMailMsg', '');
            items.rules = []
          }
        }
      },
      {
        prop: "phoneNo",
        inputtype: "rtinput",
        title: "手机号",
        maxlength: 11,
      },
      {
        prop: "eMailMsg",
        inputtype: "rtinput",
        title: "邮箱",
      },
      {
        prop: "msgData",
        inputtype: "rtinput",
        title: "短信内容",
      },
    ],
    showSuperior: true,
    superFromSchema: [],
  })
);

onMounted(async () => {
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

/** 查询 */
function createEPolicy() {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      const formData = freeEditRef.value?.getFromValue();
      const param = {
        cAppNo: props.cAppNo,
        plyTy: props.plyTy,
        ...formData,
      };
      policyService.generatingEPolicy(param).then((res: any) => {
        if (res.code === 200) {
          ElMessage.success({ message: res.msg, duration: 3000 });
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

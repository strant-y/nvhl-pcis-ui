<template>
  <el-dialog v-model="dialogVisible" width="90%" title="生成团单个打电子保单">
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
            label: '确认',
            func: () => {
              save();
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
import { ref, watch, defineProps, defineEmits, onMounted } from "vue";
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
  type: String,
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
const tableRef = ref<AppTableMethod | null>(null);
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

const formEmail = ref<Array<any>>([]);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    fromSchema: [
      {
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
      },
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
      },
      {
        prop: "cTgtObjTxtFld29",
        inputtype: "rtinput",
        title: "子团单号",
      },
      {
        prop: "cEdrNo",
        inputtype: "rtinput",
        title: "批单号",
      },
      {
        prop: "cVoucherNo",
        inputtype: "rtinput",
        title: "电子凭证号",
      },
      {
        prop: "phoneNo",
        inputtype: "rtinput",
        title: "手机号",
        maxlength: 11,
        rules: [
          getRules("phoneNo", {})
        ],
      },
      {
        prop: "note",
        inputtype: "rtselect",
        title: "是否发送短信",
        rules: [getRules("required", {})],
        loadData:[
          { label: "是",value: "1" },
          { label: "否",value: "0" },
        ]
      },
      {
        prop: "msgData",
        inputtype: "rtinput",
        title: "短信内容",
      },
      {
        prop: "eMail",
        inputtype: "rtselect",
        title: "是否发送邮件",
        loadData:[
          { label: "是",value: "1" },
          { label: "否",value: "0" },
        ],
        func: (val: any) => {
          if(val=='1') {
            const obj = {
              prop: "eMailMsg",
              inputtype: "rtinput",
              title: "邮箱",
              rules: [
                getRules("required", {}),
                getRules("email", {})
              ],
            };
            formconfig1.fromSchema?.push(obj)
          }else{
            const index = formconfig1.fromSchema?.findIndex((item: any) => item.prop === "eMailMsg");
            if(index !== -1) {
              freeEditRef.value?.setFormValue({
                eMailMsg: ""
              });
              formconfig1.fromSchema?.splice(index, 1);
            }
             
          }
          console.log(formEmail.value.length)
        }
      },
    ],
    showSuperior: true,
    superFromSchema: [],
  })
);

// watch(
//   () => freeEditRef.value?.getValue("eMail"),
//   (n,o) => {
//     statusValue.value = n;
     
//   },
//   { deep: true }
// );

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
function save() {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      const formParam = getFrom();
      const param = Object.assign({ type: props.type }, formParam);
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

/** 查询 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  console.log(r,s)
  const param = Object.assign(s, r);
  // 获取接口
  // getBasicKindList(param)
  //   .then((res) => {
  //     const { code, data, msg } = res;
  //     if (200 === code) {
  //       pageresult.list = [];
  //       pageresult.list = data.result;
  //       pageresult.total = data.total;
  //     } else {
  //       ElMessage.error(msg);
  //     }
  //   })
  //   .finally(() => {});
}
</script>

<style scoped></style>

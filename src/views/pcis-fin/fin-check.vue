<template>
  <el-dialog v-model="dialogVisible" width="90%" :title="'资金退票修改'">
    <div>
      <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
      <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
        <rt-button
          :item="{
            type: 'primary',
            label: '提交',
            func: () => {
              save();
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
  type: String,
});
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
import { v4 as uuidv4 } from "uuid";
const showBtnConfig = ref(false);
const dialogVisible = ref(true);
const showView = ref(false);

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const freeLookRef = ref<AppFreeEditMethod | null>(null);
const freeEditRefBtn = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const appTableShow = ref(false);

const schemaMap = reactive<Record<string, any>>({
  rtinputgroup: [],
});
// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "资金退票审核",
    fromSchema: [
      {
        prop: "",
        inputtype: "rtselect",
        typeCode: "",
        title: "收款人姓名",
        readOnly: true,
        disabled: true,
      },
      {
        prop: "",
        title: "收款人账号",
        inputtype: "rtinput",
        readOnly: true,
        disabled: true,
      },
      {
        prop: "",
        inputtype: "rtselect",
        title: "收款银行大类",
        typeCode: "",
        readOnly: true,
        disabled: true,
      },
      {
        prop: "",
        inputtype: "rtselect",
        title: "开户行省",
        typeCode: "",
        readOnly: true,
        disabled: true,
      },
      {
        prop: "",
        inputtype: "rtselect",
        title: "开户行市",
        typeCode: "",
        readOnly: true,
        disabled: true,
      },
      {
        prop: "",
        inputtype: "rtselect",
        title: "开户行县",
        typeCode: "",
        readOnly: true,
        disabled: true,
      },
      {
        prop: "",
        inputtype: "rtselect",
        title: "开户银行",
        typeCode: "",
        readOnly: true,
        disabled: true,
      },
      {
        prop: "",
        inputtype: "rtinput",
        title: "CNAPS号",
      },
      {
        prop: "",
        title: "开户行地址",
        inputtype: "rtinput",
      },
      {
        prop: "",
        title: "对公对私",
        inputtype: "rtinput",
        readOnly: true,
        disabled: true,
      },
      {
        prop: "",
        title: "状态",
        inputtype: "rtselect",
        rules: [getRules("required", {})],
        loadData: [
          { label: "同意", value: 1 },
          { label: "不同意", value: 0 },
        ],
      },
      {
        prop: "",
        title: "审核意见",
        type: "textarea",
        inputtype: "rtinput",
      },
    ],
  })
);
onMounted(async () => {
  if (props.type === "edit" && props.data) {
    setTimeout(() => {
      freeEditRef.value?.setFormValue(props.data);
    }, 50);
  }
});

/** 查询 */
function save() {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      const formParam = getFrom();
      const param = Object.assign({ type: props.type }, formParam);
      saveKindInfo(param)
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
            emits("ok", {});
            ElMessage.success("保存成功");
            dialogVisible.value = false;
          } else {
            ElMessage.error(msg);
          }
        })
        .finally(() => {});
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

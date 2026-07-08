<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="90%">
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
            label: '保存',
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
import { formatActionTitle } from "@/utils/action-title";
import { yesOrNo, size, inputtype, typeMap, dateType } from "@/utils/utilKey";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { computed, ref, defineProps } from "vue";
import { createFreeButtonBase } from "@/shared/button-config";
import {
  getButtonByFacKey,
  getFactorList,
  getInputGroupList,
  saveFactor,
  savePrdFixSpecInfo,
} from "@/api/prod";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

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
const dialogTitle = computed(() => formatActionTitle(props.type, "特约配置"));

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const freeLookRef = ref<AppFreeEditMethod | null>(null);
const freeEditRefBtn = ref<AppFreeEditMethod | null>(null);

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
    console.log(jsonObj);
    formconfiglook.fromSchema = [jsonObj];
  }
}
const schemaMap = reactive<Record<string, any>>({
  rtinputgroup: [],
});

const formconfiglook = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "实时预览",
    production: true,
    productionTitle: "仅非inputgroup以及table组件支持实时预览功能",
    fromSchema: [],
  })
);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "特约配置",
    fromSchema: [
      {
        prop: "cSpecNo",
        inputtype: "rtinput",
        title: "特约代码",
        disabled: true,
        // rules: [getRules("required", {})],
      },
      {
        prop: "cNmeEn",
        inputtype: "rtinput",
        title: "英文名称",
        rules: [getRules("required", {})],
      },
      {
        prop: "cStatus",
        inputtype: "rtselect",
        title: "启用标识",
        rules: [getRules("required", {})],
        typeCode: "WEB_SYS_STA_DICT",
        codeParam: { cParCde: "use_mrk" },
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        type: "textarea",
        title: "特约内容",
        itemWidth: 2,
        rules: [getRules("required", {})],
      },
    ],
    showSuperior: true,
    superFromSchema: [],
  })
);
onMounted(async () => {
  if (props.type === "edit" || props.type === "copy") {
    const dataObj = props.data;
    setTimeout(() => {
      freeEditRef.value?.setFormValue(dataObj);
      if (props.type === "copy") {
        freeEditRef.value?.setValue("cSpecNo", "");
      }
    }, 50);
  }
});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

function getSuperSchema(data: string) {
  if (data != "rtinputgroup" && data != "rttable") {
    showView.value = true;
  } else {
    showView.value = false;
  }
  if (schemaMap[data]) {
    return schemaMap[data];
  } else {
    return null;
  }
}
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
      const param = Object.assign({ type: props.type === "copy" ? "add" : props.type }, formParam);
      savePrdFixSpecInfo(param)
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
  // inputgroup 莫名其妙初始化值被改了
  if (showBtnConfig.value) {
    s["showExBtn"] = "1";
  } else {
    s["showExBtn"] = "0";
  }
  console.log(s);
  if (s) {
    const param = Object.assign(s);
    if (props.type === "edit") {
      //编辑状态下,将主键原封不动的送回后端,用于更新
      param["cPkId"] = props.data.cPkId;
    }
    if (freeEditRefBtn.value) {
      let btnjson = freeEditRefBtn.value?.getFromValue();
      btnjson.initid = uuidv4().replace(/-/g, "");
      param["btn"] = btnjson;
    }
    return param;
  }
}
</script>

<style scoped></style>

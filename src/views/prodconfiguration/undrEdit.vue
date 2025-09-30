<template>
  <el-dialog v-model="dialogVisible" width="90%">
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
import { yesOrNo, size, inputtype, typeMap, dateType } from "@/utils/utilKey";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { ref, defineProps } from "vue";
import { createFreeButtonBase } from "@/shared/button-config";
import { getButtonByFacKey, saveUndrClsInfo, getUndrClsInfo } from "@/api/prod";
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
  }
}
const schemaMap = reactive<Record<string, any>>({
  rtinputgroup: [],
});

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "核保级别新增",
    fromSchema: [
      {
        prop: "cUndrClsCde",
        inputtype: "rtinput",
        title: "核保级别代码",
        maxlength: 6,
        rules: [getRules("required", {})],
      },
      {
        prop: "cUndrClsCnm",
        inputtype: "rtinput",
        title: "核保级别名称",
        rules: [getRules("required", {})],
      },
      {
        prop: "cUndrClsEnm",
        inputtype: "rtinput",
        title: "英文名称",
      },
      {
        prop: "nLevel",
        inputtype: "rtinput",
        title: "级别",
        maxlength: 4,
      },
      {
        prop: "cChiefFlg",
        inputtype: "rtinput",
        title: "首席标识",
        defaultValue: "0",
        maxlength: 1,
      },
    ],
    showSuperior: true,
    superFromSchema: [],
  })
);
onMounted(async () => {
  if (props.type === "edit") {
    const inputType = props.data.cFactorInputtype;
    const showExBtn = props.data.cFactorShowExBtn;
    getUndrClsInfo({ cUndrClsCde: props.data.cUndrClsCde })
      .then((res) => {
        const { code, data, msg } = res;
        if (200 === code) {
          freeEditRef.value?.setFormValue(data);
        } else {
          ElMessage.error(msg);
        }
      })
      .finally(() => {});
  } else {
    setTimeout(() => {
      freeEditRef.value?.setFormValue({ cChiefFlg: "0" });
    }, 100);
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
  const param = getFrom();
  const newparam = Object.assign(param, { type: "add" });
  saveUndrClsInfo(newparam)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        emits("ok", {});
        ElMessage.success("保存成功");
        this.dialogVisible = false;
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
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

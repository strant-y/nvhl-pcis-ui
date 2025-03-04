<template>
  <el-dialog v-model="dialogVisible" width="90%">
    <div>
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
    title: "批量导入",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "导入",
        func: async () => {
          console.log("导入");
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "下载模板",
        func: async () => {
          console.log("下载模板");
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          console.log("查询");
        },
      }),
    ],
    fromSchema: [
      {
        prop: "",
        inputtype: "rtinput",
        title: "方案名称",
      },
      {
        prop: "",
        inputtype: "rtselect",
        title: "产品大类",
        typeCode: "KIND_LIST_GRT",
        params: {},
      },
      {
        prop: "",
        inputtype: "rtselect",
        title: "产品",
        typeCode: "WEB_SYS_STA_DICT",
      },
    ],
    showSuperior: true,
    superFromSchema: [],
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
    isPage: "false",
    showSelection: true,
    fromSchema: [
      {
        prop: "CPlanNme",
        inputtype: "rtinput",
        title: "方案名称",
      },
      {
        prop: "CDesc",
        inputtype: "rtinput",
        title: "方案说明",
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
</script>

<style scoped></style>

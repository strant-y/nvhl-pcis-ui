<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="90%">
    <div>
      <app-free-edit
        v-model:freeEditConfig="formconfiglook"
        v-if="showView"
        ref="freeLookRef"
      />
      <app-free-edit
        v-model:freeEditConfig="formconfig1"
        ref="freeEditRef"
        @update-datas="fromUpdata"
      />
      <app-free-edit
        v-if="showBtnConfig"
        v-model:freeEditConfig="formconfig2"
        ref="freeEditRefBtn"
        @update-datas="fromUpdata"
      />
      <rt-mytable
        v-if="appTableShow"
        :tableConfig="tableconfig"
        ref="tableRef"
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
const dialogTitle = computed(() => formatActionTitle(props.type, "要素配置"));

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
    if (!!jsonObj.codeParam && typeof jsonObj.codeParam === "string") {
      jsonObj.codeParam = JSON.parse(jsonObj.codeParam);
    }
    jsonObj.func = null; // 方法去掉,不让预览触发事件
    formconfiglook.fromSchema = [jsonObj];
  }
}
const schemaMap = reactive<Record<string, any>>({
  rtinput: [
    {
      prop: "size",
      inputtype: "rtselect",
      title: "要素尺寸",
      loadData: size,
    },
    {
      prop: "type",
      inputtype: "rtselect",
      title: "type类型",
      loadData: typeMap.rtinput,
      func:(val: any)=>{
        let f = "0";
        if(val=== "number"){
          f = "1";
        }

        formconfig1.superFromSchema?.forEach((item: any) => {
          if (item.prop === "max" || item.prop === "min" || item.prop === "precision") {
            item.hidden = f === "1" ? false : true;
          }
        });
      }
    },
    {
      prop: "placeholder",
      inputtype: "rtinput",
      title: "输入框占位文本",
    },
    {
      prop: "func",
      inputtype: "rtinput",
      title: "绑定方法名",
    },
    {
      prop: "clearable",
      inputtype: "rtselect",
      title: "是否显示清除按钮",
      loadData: yesOrNo,
    },
    {
      prop: "prefix",
      inputtype: "rtinput",
      title: "前缀符号",
    },
    {
      prop: "suffix",
      inputtype: "rtinput",
      title: "后缀符号",
    },
    {
      prop: "min",
      inputtype: "rtnumber",
      title: "最小值",
      hidden: true,
    },
    {
      prop: "max",
      inputtype: "rtnumber",
      title: "最大值",
      hidden: true,
    },
    {
      prop: "precision",
      inputtype: "rtnumber",
      title: "数值精度",
      hidden: true,
    },
    {
      prop: "required",
      inputtype: "rtselect",
      title: "是否必填",
      loadData: yesOrNo,
    },
    {
      prop: "disabled",
      inputtype: "rtselect",
      title: "初始化disabled",
      loadData: yesOrNo,
    },
    {
      prop: "readonly",
      inputtype: "rtselect",
      title: "初始化readonly",
      loadData: yesOrNo,
    },
    {
      prop: "showExBtn",
      inputtype: "rtselect",
      title: "是否显示扩展按钮",
      loadData: yesOrNo,
      func: (v) => {
        if (v === "1") {
          showBtnConfig.value = true;
        } else {
          showBtnConfig.value = false;
        }
      },
    },
    {
      prop: "showWordLimit",
      inputtype: "rtselect",
      title: "是否显示剩余字段",
      loadData: yesOrNo,
    },
    {
      prop: "maxlength",
      inputtype: "rtnumber",
      title: "文本最大长度",
    },
  ],
  rtselect: [
    {
      prop: "size",
      inputtype: "rtselect",
      title: "要素尺寸",
      loadData: size,
    },
    {
      prop: "placeholder",
      inputtype: "rtinput",
      title: "输入框占位文本",
    },
    {
      prop: "func",
      inputtype: "rtinput",
      title: "绑定方法名",
    },
    {
      prop: "typeCode",
      inputtype: "rtinput",
      title: "codeKey",
    },
    {
      prop: "filterable",
      inputtype: "rtselect",
      title: "是否支持模糊查询",
      loadData: yesOrNo,
    },
    {
      prop: "clearable",
      inputtype: "rtselect",
      title: "是否显示清除按钮",
      loadData: yesOrNo,
    },
    {
      prop: "multiple",
      inputtype: "rtselect",
      title: "是否可以多选",
      loadData: yesOrNo,
    },
    {
      prop: "required",
      inputtype: "rtselect",
      title: "是否必填",
      loadData: yesOrNo,
    },
    {
      prop: "tag",
      inputtype: "rtselect",
      title: "是否tag模式",
      loadData: yesOrNo,
    },
    {
      prop: "disabled",
      inputtype: "rtselect",
      title: "初始化disabled",
      loadData: yesOrNo,
    },
    {
      prop: "showExBtn",
      inputtype: "rtselect",
      title: "是否显示扩展按钮",
      loadData: yesOrNo,
      func: (v) => {
        if (v === "1") {
          showBtnConfig.value = true;
        } else {
          showBtnConfig.value = false;
        }
      },
    },
    {
      prop: "loadData",
      inputtype: "rtinput",
      type: "textarea",
      itemWidth: 2,
      title: "初始化数据",
      showExBtn: true,
      btnWidth: 10,
      readonly: true,
      btnItems: createFreeButtonBase({
        icon: "Edit",
        func: () => {
          const ck = freeEditRef.value?.getValue("loadData");
          dzmodal
            .open(jsonArrayEdit, {
              data: ck,
              inititle: ["label", "value"],
            })
            .then((res) => {
              if (res.type === "ok") {
                freeEditRef.value?.setValue("loadData", res.body);
              }
            });
        },
      }),
    },
    {
      prop: "codeParam",
      inputtype: "rtinput",
      type: "textarea",
      itemWidth: 2,
      title: "code参数",
      showExBtn: true,
      btnWidth: 10,
      readonly: true,
      btnItems: createFreeButtonBase({
        icon: "Edit",
        func: () => {
          setCodeParam();
        },
      }),
    },
  ],
  rtSelectV2: [
    {
      prop: "size",
      inputtype: "rtselect",
      title: "要素尺寸",
      loadData: size,
    },
    {
      prop: "placeholder",
      inputtype: "rtinput",
      title: "输入框占位文本",
    },
    {
      prop: "func",
      inputtype: "rtinput",
      title: "绑定方法名",
    },
    {
      prop: "typeCode",
      inputtype: "rtinput",
      title: "codeKey",
    },
    {
      prop: "filterable",
      inputtype: "rtselect",
      title: "是否支持模糊查询",
      loadData: yesOrNo,
    },
    {
      prop: "clearable",
      inputtype: "rtselect",
      title: "是否显示清除按钮",
      loadData: yesOrNo,
    },
    {
      prop: "multiple",
      inputtype: "rtselect",
      title: "是否可以多选",
      loadData: yesOrNo,
    },
    {
      prop: "required",
      inputtype: "rtselect",
      title: "是否必填",
      loadData: yesOrNo,
    },
    {
      prop: "tag",
      inputtype: "rtselect",
      title: "是否tag模式",
      loadData: yesOrNo,
    },
    {
      prop: "disabled",
      inputtype: "rtselect",
      title: "初始化disabled",
      loadData: yesOrNo,
    },
    {
      prop: "showExBtn",
      inputtype: "rtselect",
      title: "是否显示扩展按钮",
      loadData: yesOrNo,
      func: (v) => {
        if (v === "1") {
          showBtnConfig.value = true;
        } else {
          showBtnConfig.value = false;
        }
      },
    },
    {
      prop: "loadData",
      inputtype: "rtinput",
      type: "textarea",
      itemWidth: 2,
      title: "初始化数据",
      showExBtn: true,
      btnWidth: 10,
      readonly: true,
      btnItems: createFreeButtonBase({
        icon: "Edit",
        func: () => {
          const ck = freeEditRef.value?.getValue("loadData");
          dzmodal
            .open(jsonArrayEdit, {
              data: ck,
              inititle: ["label", "value"],
            })
            .then((res) => {
              if (res.type === "ok") {
                freeEditRef.value?.setValue("loadData", res.body);
              }
            });
        },
      }),
    },
    {
      prop: "codeParam",
      inputtype: "rtinput",
      type: "textarea",
      itemWidth: 2,
      title: "code参数",
      showExBtn: true,
      btnWidth: 10,
      readonly: true,
      btnItems: createFreeButtonBase({
        icon: "Edit",
        func: () => {
          setCodeParam();
        },
      }),
    },
  ],
  rtcascader: [
    {
      prop: "size",
      inputtype: "rtselect",
      title: "要素尺寸",
      loadData: size,
    },
    {
      prop: "placeholder",
      inputtype: "rtinput",
      title: "输入框占位文本",
    },
    {
      prop: "func",
      inputtype: "rtinput",
      title: "绑定方法名",
    },
    {
      prop: "typeCode",
      inputtype: "rtinput",
      title: "codeKey",
    },
    {
      prop: "filterable",
      inputtype: "rtselect",
      title: "是否支持模糊查询",
      loadData: yesOrNo,
    },
    {
      prop: "clearable",
      inputtype: "rtselect",
      title: "是否显示清除按钮",
      loadData: yesOrNo,
    },
    {
      prop: "checkStrictly",
      inputtype: "rtselect",
      title: "任意一级可选",
      loadData: yesOrNo,
    },
    {
      prop: "required",
      inputtype: "rtselect",
      title: "是否必填",
      loadData: yesOrNo,
    },
    {
      prop: "tag",
      inputtype: "rtselect",
      title: "是否tag模式",
      loadData: yesOrNo,
    },
    {
      prop: "disabled",
      inputtype: "rtselect",
      title: "初始化disabled",
      loadData: yesOrNo,
    },
    {
      prop: "showExBtn",
      inputtype: "rtselect",
      title: "是否显示扩展按钮",
      loadData: yesOrNo,
      func: (v) => {
        if (v === "1") {
          showBtnConfig.value = true;
        } else {
          showBtnConfig.value = false;
        }
      },
    },
    {
      prop: "loadData",
      inputtype: "rtinput",
      type: "textarea",
      itemWidth: 2,
      title: "初始化数据",
      showExBtn: true,
      btnWidth: 10,
      readonly: true,
      btnItems: createFreeButtonBase({
        icon: "Edit",
        func: () => {
          const ck = freeEditRef.value?.getValue("loadData");
          dzmodal
            .open(jsonArrayEdit, {
              data: ck,
              inititle: ["label", "value"],
            })
            .then((res) => {
              if (res.type === "ok") {
                freeEditRef.value?.setValue("loadData", res.body);
              }
            });
        },
      }),
    },
    {
      prop: "codeParam",
      inputtype: "rtinput",
      type: "textarea",
      itemWidth: 2,
      title: "code参数",
      showExBtn: true,
      btnWidth: 10,
      readonly: true,
      btnItems: createFreeButtonBase({
        icon: "Edit",
        func: () => {
          setCodeParam();
        },
      }),
    },
    {
      prop: "cascaderprops",
      inputtype: "rtinput",
      type: "textarea",
      itemWidth: 2,
      title: "参数映射",
      showExBtn: true,
      btnWidth: 10,
      readonly: true,
      btnItems: createFreeButtonBase({
        icon: "Edit",
        func: () => {
          const ck = JSON.parse(freeEditRef.value?.getValue("cascaderprops"));
          let newData: any = [];
          if (ck && ck.length > 0) {
            ck.forEach((e: any) => {
              newData.push({
                label: e,
              });
            });
          }
          dzmodal
            .open(jsonArrayEdit, {
              data:
                newData && newData.length > 0
                  ? JSON.stringify(newData)
                  : undefined,
              inititle: ["label"],
            })
            .then((res) => {
              if (res.type === "ok") {
                let bodys: any[] = [];
                const list = JSON.parse(res.body);
                if (list && list.length > 0) {
                  list.forEach((e: any) => {
                    bodys.push(e.label);
                  });
                }
                freeEditRef.value?.setValue(
                  "cascaderprops",
                  JSON.stringify(bodys)
                );
              }
            });
        },
      }),
    },
  ],
  rtnumber: [
    {
      prop: "size",
      inputtype: "rtselect",
      title: "要素尺寸",
      loadData: size,
    },
    {
      prop: "placeholder",
      inputtype: "rtinput",
      title: "输入框占位文本",
    },
    {
      prop: "func",
      inputtype: "rtinput",
      title: "绑定方法名",
    },
    {
      prop: "clearable",
      inputtype: "rtselect",
      title: "是否显示清除按钮",
      loadData: yesOrNo,
    },
    {
      prop: "required",
      inputtype: "rtselect",
      title: "是否必填",
      loadData: yesOrNo,
    },
    {
      prop: "min",
      inputtype: "rtnumber",
      title: "最小值",
    },
    {
      prop: "max",
      inputtype: "rtnumber",
      title: "最大值",
    },
    {
      prop: "step",
      inputtype: "rtnumber",
      title: "计步器步长",
      precision: 4,
    },
    {
      prop: "stepStrictly",
      inputtype: "rtselect",
      title: "是否只能输入 step 的倍数",
      loadData: yesOrNo,
    },
    {
      prop: "precision",
      inputtype: "rtnumber",
      title: "数值精度",
    },
    {
      prop: "prefix",
      inputtype: "rtinput",
      title: "前缀符号",
    },
    {
      prop: "suffix",
      inputtype: "rtinput",
      title: "后缀符号",
    },
    {
      prop: "disabled",
      inputtype: "rtselect",
      title: "初始化disabled",
      loadData: yesOrNo,
    },
    {
      prop: "readonly",
      inputtype: "rtselect",
      title: "初始化readonly",
      loadData: yesOrNo,
    },
    {
      prop: "showExBtn",
      inputtype: "rtselect",
      title: "是否显示扩展按钮",
      loadData: yesOrNo,
      func: (v) => {
        if (v === "1") {
          showBtnConfig.value = true;
        } else {
          showBtnConfig.value = false;
        }
      },
    },
  ],
  rtdatepicker: [
    {
      prop: "size",
      inputtype: "rtselect",
      title: "要素尺寸",
      loadData: size,
    },
    {
      prop: "placeholder",
      inputtype: "rtinput",
      title: "输入框占位文本",
    },
    {
      prop: "func",
      inputtype: "rtinput",
      title: "绑定方法名",
    },
    {
      prop: "clearable",
      inputtype: "rtselect",
      title: "是否显示清除按钮",
      loadData: yesOrNo,
    },
    {
      prop: "disabledDate",
      inputtype: "rtinput",
      title: "禁用时间绑定",
    },
    {
      prop: "format",
      inputtype: "rtinput",
      title: "日期格式化",
    },
    {
      prop: "valueFormat",
      inputtype: "rtinput",
      title: "数据格式化",
    },
    {
      prop: "required",
      inputtype: "rtselect",
      title: "是否必填",
      loadData: yesOrNo,
    },
    {
      prop: "type",
      inputtype: "rtselect",
      title: "时间框类型",
      clearable: true,
      loadData: dateType,
    },
    {
      prop: "disabled",
      inputtype: "rtselect",
      title: "初始化disabled",
      loadData: yesOrNo,
    },
    {
      prop: "readonly",
      inputtype: "rtselect",
      title: "初始化readonly",
      loadData: yesOrNo,
    },
    {
      prop: "showExBtn",
      inputtype: "rtselect",
      title: "是否显示扩展按钮",
      loadData: yesOrNo,
      func: (v) => {
        if (v === "1") {
          showBtnConfig.value = true;
        } else {
          showBtnConfig.value = false;
        }
      },
    },
  ],
  rtswitch: [
    {
      prop: "size",
      inputtype: "rtselect",
      title: "要素尺寸",
      loadData: size,
    },
    {
      prop: "func",
      inputtype: "rtinput",
      title: "绑定方法名",
    },
    {
      prop: "activeText",
      inputtype: "rtinput",
      title: "打开时文字描述",
    },
    {
      prop: "inactiveText",
      inputtype: "rtinput",
      title: "关闭时文字描述",
    },
    {
      prop: "inlinePrompt",
      inputtype: "rtselect",
      title: "描述是否在内部",
      loadData: yesOrNo,
    },
    {
      prop: "required",
      inputtype: "rtselect",
      title: "是否必填",
      loadData: yesOrNo,
    },
    {
      prop: "disabled",
      inputtype: "rtselect",
      title: "初始化disabled",
      loadData: yesOrNo,
    },
    {
      prop: "readonly",
      inputtype: "rtselect",
      title: "初始化readonly",
      loadData: yesOrNo,
    },
  ],
  rtradio: [
    {
      prop: "size",
      inputtype: "rtselect",
      title: "要素尺寸",
      loadData: size,
    },
    {
      prop: "func",
      inputtype: "rtinput",
      title: "绑定方法名",
    },
    {
      prop: "typeCode",
      inputtype: "rtinput",
      title: "codeKey",
    },
    {
      prop: "border",
      inputtype: "rtselect",
      title: "是否带边框",
      loadData: yesOrNo,
    },
    {
      prop: "required",
      inputtype: "rtselect",
      title: "是否必填",
      loadData: yesOrNo,
    },
    {
      prop: "disabled",
      inputtype: "rtselect",
      title: "初始化disabled",
      loadData: yesOrNo,
    },
    {
      prop: "readonly",
      inputtype: "rtselect",
      title: "初始化readonly",
      loadData: yesOrNo,
    },
    {
      prop: "loadData",
      inputtype: "rtinput",
      type: "textarea",
      itemWidth: 2,
      title: "初始化数据",
      showExBtn: true,
      btnWidth: 10,
      readonly: true,
      btnItems: createFreeButtonBase({
        icon: "Edit",
        func: () => {
          const ck = freeEditRef.value?.getValue("loadData");
          dzmodal
            .open(jsonArrayEdit, {
              data: ck,
              inititle: ["label", "value"],
            })
            .then((res) => {
              if (res.type === "ok") {
                freeEditRef.value?.setValue("loadData", res.body);
              }
            });
        },
      }),
    },
    {
      prop: "showExBtn",
      inputtype: "rtselect",
      title: "是否显示扩展按钮",
      loadData: yesOrNo,
      func: (v) => {
        if (v === "1") {
          showBtnConfig.value = true;
        } else {
          showBtnConfig.value = false;
        }
      },
    },
    {
      prop: "codeParam",
      inputtype: "rtinput",
      type: "textarea",
      itemWidth: 2,
      title: "code参数",
      showExBtn: true,
      btnWidth: 10,
      readonly: true,
      btnItems: createFreeButtonBase({
        icon: "Edit",
        func: () => {
          setCodeParam();
        },
      }),
    },
  ],
  rttag: [
    {
      prop: "size",
      inputtype: "rtselect",
      title: "要素尺寸",
      loadData: size,
    },
    {
      prop: "typeCode",
      inputtype: "rtinput",
      title: "codeKey",
    },
    {
      prop: "effect",
      inputtype: "rtselect",
      title: "主题",
      loadData: [
        {
          label: "dark",
          value: "dark",
        },
        {
          label: "light",
          value: "light",
        },
        {
          label: "plain",
          value: "plain",
        },
      ],
    },
    {
      prop: "round",
      inputtype: "rtselect",
      title: "是否为圆形",
      loadData: yesOrNo,
    },
    {
      prop: "loadData",
      inputtype: "rtinput",
      type: "textarea",
      itemWidth: 2,
      title: "初始化数据",
      showExBtn: true,
      btnWidth: 10,
      readonly: true,
      btnItems: createFreeButtonBase({
        icon: "Edit",
        func: () => {
          const ck = freeEditRef.value?.getValue("loadData");
          dzmodal
            .open(jsonArrayEdit, {
              data: ck,
              inititle: ["label", "value", "color"],
            })
            .then((res) => {
              if (res.type === "ok") {
                freeEditRef.value?.setValue("loadData", res.body);
              }
            });
        },
      }),
    },
  ],
  rtcheckbox: [
    {
      prop: "size",
      inputtype: "rtselect",
      title: "要素尺寸",
      loadData: size,
    },
    {
      prop: "func",
      inputtype: "rtinput",
      title: "绑定方法名",
    },
    {
      prop: "trueValue",
      inputtype: "rtinput",
      title: "true时值",
      rules: [getRules("required", {})],
    },
    {
      prop: "falseValue",
      inputtype: "rtinput",
      title: "false时值",
      rules: [getRules("required", {})],
    },
    {
      prop: "border",
      inputtype: "rtselect",
      title: "是否带边框",
      loadData: yesOrNo,
    },
    {
      prop: "required",
      inputtype: "rtselect",
      title: "是否必填",
      loadData: yesOrNo,
    },
    {
      prop: "disabled",
      inputtype: "rtselect",
      title: "初始化disabled",
      loadData: yesOrNo,
    },
    {
      prop: "readonly",
      inputtype: "rtselect",
      title: "初始化readonly",
      loadData: yesOrNo,
    },
    {
      prop: "showExBtn",
      inputtype: "rtselect",
      title: "是否显示扩展按钮",
      loadData: yesOrNo,
      func: (v) => {
        if (v === "1") {
          showBtnConfig.value = true;
        } else {
          showBtnConfig.value = false;
        }
      },
    },
  ],
  rtcheckboxgroup: [
    {
      prop: "size",
      inputtype: "rtselect",
      title: "要素尺寸",
      loadData: size,
    },
    {
      prop: "func",
      inputtype: "rtinput",
      title: "绑定方法名",
    },
    {
      prop: "typeCode",
      inputtype: "rtinput",
      title: "codeKey",
    },
    {
      prop: "type",
      inputtype: "rtselect",
      title: "主题",
      loadData: [
        {
          label: "checkbox",
          value: "checkbox",
        },
        {
          label: "button",
          value: "button",
        },
      ],
    },
    {
      prop: "loadData",
      inputtype: "rtinput",
      type: "textarea",
      itemWidth: 2,
      title: "初始化数据",
      showExBtn: true,
      btnWidth: 10,
      readonly: true,
      btnItems: createFreeButtonBase({
        icon: "Edit",
        func: () => {
          const ck = freeEditRef.value?.getValue("loadData");
          dzmodal
            .open(jsonArrayEdit, {
              data: ck,
              inititle: ["label", "value"],
            })
            .then((res) => {
              if (res.type === "ok") {
                freeEditRef.value?.setValue("loadData", res.body);
              }
            });
        },
      }),
    },
    {
      prop: "codeParam",
      inputtype: "rtinput",
      type: "textarea",
      itemWidth: 2,
      title: "code参数",
      showExBtn: true,
      btnWidth: 10,
      readonly: true,
      btnItems: createFreeButtonBase({
        icon: "Edit",
        func: () => {
          setCodeParam();
        },
      }),
    },
  ],
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

const formconfig2 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "尾部按钮配置",
    fromSchema: [
      {
        prop: "label",
        inputtype: "rtinput",
        title: "按钮内容",
      },
      {
        prop: "size",
        inputtype: "rtselect",
        title: "按钮尺寸",
        loadData: size,
      },
      {
        prop: "type",
        inputtype: "rtselect",
        title: "按钮类型",
        loadData: typeMap.rttag,
      },
      {
        prop: "func",
        inputtype: "rtinput",
        title: "绑定方法名",
      },
      {
        prop: "tableClick",
        inputtype: "rtinput",
        title: "table层事件绑定",
      },
      {
        prop: "icon",
        inputtype: "rtinput",
        title: "按钮图标",
        showExBtn: true,
        btnWidth: 20,
        btnItems: createFreeButtonBase({
          icon: "Paperclip",
          popover: "selectIconPopover",
          popoverWidth: 500,
          position: "top-start",
        }),
      },
      {
        prop: "link",
        inputtype: "rtselect",
        title: "是否链接按钮",
        loadData: yesOrNo,
      },
      {
        prop: "tooltip",
        inputtype: "rtinput",
        title: "悬浮文字提示",
      },
      {
        prop: "iconSize",
        inputtype: "rtselect",
        title: "图标尺寸",
        loadData: size,
      },
      {
        prop: "buttonColor",
        inputtype: "rtinput",
        type: "color",
        title: "按钮自定义底色",
      },
      {
        prop: "iconColor",
        inputtype: "rtinput",
        type: "color",
        title: "按钮图标自定义底色",
      },
      {
        prop: "btnWidth",
        inputtype: "rtinput",
        title: "按钮占用宽度",
      },
    ],
  })
);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "要素配置",
    // endBtnsPosition: "right",
    // endBtns: [
    //   createFreeButtonBase({
    //     type: "primary",
    //     label: "保存",
    //     func: () => {
    //       save();
    //     },
    //   }),
    // ],
    fromSchema: [
      {
        prop: "inputtype",
        inputtype: "rtselect",
        title: "要素类型",
        placeholder: "请选择",
        rules: [getRules("required", {})],
        loadData: inputtype,
        func: (data: any) => {
          appTableShow.value = data === "rtinputgroup";
          const com = getSuperSchema(data);
          formconfig1.superFromSchema = com;
          showFactorList();
        },
      },
      {
        prop: "tab",
        inputtype: "rtselect",
        title: "所属tab",
        typeCode: "tablist",
        rules: [getRules("required", {})],
        func: () => {
          showFactorList();
        },
      },
      {
        prop: "prop",
        inputtype: "rtinput",
        title: "要素key",
        rules: [getRules("required", {})],
      },
      {
        prop: "title",
        inputtype: "rtinput",
        title: "要素名称",
      },
      {
        prop: "itemWidth",
        inputtype: "rtnumber",
        title: "占据列",
      },
      {
        prop: "notes",
        inputtype: "rtinput",
        title: "注释方法",
      },
    ],
    superFromShow: "要素详情",
    superFromClose: "要素详情",
    showSuperior: true,
    superFromSchema: [],
  })
);
onMounted(async () => {
  if (props.type === "edit" || props.type === "copy") {
    const inputType = props.data.cFactorInputtype;
    const showExBtn = props.data.cFactorShowExBtn;
    const com = getSuperSchema(inputType);
    if (showExBtn && showExBtn === "1") {
      showBtnConfig.value = true;
      getButtonByFacKey({ cFactorKey: props.data.cPkId })
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code && data.length > 0) {
            const dataObj = data[0];
            const edit = {};
            Object.keys(dataObj).forEach((k) => {
              if (k.startsWith("cButton")) {
                let key = k.replace("cButton", "");
                key = key.charAt(0).toLowerCase() + key.slice(1);
                edit[key] = dataObj[k];
              }
            });
            freeEditRefBtn.value?.setFormValue(edit);
          } else {
            ElMessage.error(msg);
          }
        })
        .finally(() => {});
    }
    formconfig1.superFromSchema = com;
    setTimeout(() => {
      const edit = {};
      Object.keys(props.data).forEach((k) => {
        if (k.startsWith("cFactor")) {
          let key = k.replace("cFactor", "");
          key = key.charAt(0).toLowerCase() + key.slice(1);
          edit[key] = props.data[k];
        }
      });
      freeEditRef.value?.setFormValue(edit);
      if (props.type === "copy") {
        freeEditRef.value?.setValue("factorProp", "");
      }
      setTimeout(() => {
        if (inputType === "rtinputgroup") {
          appTableShow.value = true;
          showFactorList();
        }
      }, 50);
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

function showFactorList() {
  if (appTableShow.value && freeEditRef.value?.getValue("tab")) {
    getInputGroupList({
      factorTab: freeEditRef.value?.getValue("tab"),
      parentKey: props.data?.cPkId,
    })
      .then((res) => {
        const { code, data, msg } = res;
        if (200 === code) {
          if (data) {
            Object.keys(data).forEach((i) => {
              if (data[i].cFactorParentKey) {
                data[i].isChecked = "1";
              }
            });
            tableRef.value?.setFormValue(data);
          }
        } else {
          ElMessage.error(msg);
        }
      })
      .finally(() => {});
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
  saveFactor(param)
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
    if (tableRef.value) {
      const tabjson = tableRef.value?.getFromValue();
      let selectList = tabjson.filter((item: any) => item.isChecked === "1");
      param["tabjson"] = selectList;
    }
    return param;
  }
}

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    editFlag: true,
    editList: ["cFactorPersent"],
    fromSchema: [
      {
        prop: "icon",
        inputtype: "rtIcon",
        icon: "Rank",
        iconSize: "16",
        title: "排序",
        dragFlag: true,
        tableBtnWidth: 40,
      },
      {
        prop: "isChecked",
        inputtype: "rtcheckbox",
        title: "选中",
        keymap: {
          y: "1",
          n: "2",
        },
      },
      {
        prop: "cFactorInputtype",
        inputtype: "rtselect",
        title: "要素类型",
        loadData: inputtype,
      },
      {
        prop: "cFactorProp",
        inputtype: "rtinput",
        title: "要素key",
      },
      {
        prop: "cFactorTitle",
        inputtype: "rtinput",
        title: "要素名称",
      },
      {
        prop: "cFactorPersent",
        inputtype: "rtnumber",
        title: "占比",
        tableBtnWidth: 80,
      },
    ],
  })
);

function setCodeParam() {
  const convertObjectToArray = (obj: { [key: string]: any }) => {
    const result: { key: string; value: any }[] = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result.push({ key: key, value: obj[key] });
      }
    }
    return result.length === 0 ? undefined : result;
  };
  const ppp = convertObjectToArray(
    JSON.parse(freeEditRef.value?.getValue("codeParam"))
  );
  dzmodal
    .open(jsonArrayEdit, {
      data: !ppp || ppp.length === 0 ? undefined : JSON.stringify(ppp),
      inititle: ["key", "value"],
    })
    .then((res) => {
      if (res.type === "ok") {
        let s = undefined;
        const list = JSON.parse(res.body);
        if (!!list && list.length > 0) {
          s = list
            .map((m) => {
              const r = {};
              r[m.key] = m.value;
              return r;
            })
            .reduce((acc, obj) => {
              return { ...acc, ...obj };
            });
        }
        freeEditRef.value?.setValue("codeParam", JSON.stringify(s));
      }
    });
}
</script>

<style scoped></style>

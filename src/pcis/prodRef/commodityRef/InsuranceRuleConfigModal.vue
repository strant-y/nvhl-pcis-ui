<!-- 规则配置弹窗 - 参考 factorEdit 模式，使用 AppFreeEdit + 动态 superFromSchema -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="90%"
    :close-on-click-modal="false"
    append-to-body
    @close="handleCancel"
  >
    <div>
      <!-- 要素信息预览 -->
      <app-free-edit
        v-model:freeEditConfig="formconfigLook"
        v-if="showView"
        ref="freeLookRef"
      />
      <!-- 规则配置表单 -->
      <app-free-edit
        v-model:freeEditConfig="formconfig1"
        ref="freeEditRef"
        @update-datas="fromUpdata"
      />
      <!-- 保存按钮 -->
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
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useValidator } from "@/typings/useValidator";
import { formatActionTitle } from "@/utils/action-title";
import { yesOrNo, inputtype, dateType } from "@/utils/utilKey";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
const { getRules } = useValidator();

const emits = defineEmits(["ok", "cancel"]);

const props = defineProps<{
  data: any;
}>();

const dialogVisible = ref(true);
const dialogTitle = computed(() => formatActionTitle("edit", "规则配置"));

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const freeLookRef = ref<AppFreeEditMethod | null>(null);
const showView = ref(false);

/** 当前要素的 inputtype */
const currentInputtype = ref<string>("");

/** 类型映射标签 */
const inputtypeMap: Record<string, string> = inputtype.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {} as Record<string, string>);

/**
 * 各 inputtype 对应的规则配置字段 —— 参考 factorEdit schemaMap
 */
const schemaMap = reactive<Record<string, any[]>>({
  rtinput: [
    {
      prop: "placeholder",
      inputtype: "rtinput",
      title: "输入框占位文本",
    },
    {
      prop: "clearable",
      inputtype: "rtselect",
      title: "是否显示清除按钮",
      loadData: yesOrNo,
    },
    {
      prop: "maxLength",
      inputtype: "rtnumber",
      title: "文本最大长度",
    },
    {
      prop: "regex",
      inputtype: "rtinput",
      title: "正则表达式",
      itemWidth: 2,
      placeholder: "如: ^[A-Za-z]+$",
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
  ],
  rtselect: [
    {
      prop: "typeCode",
      inputtype: "rtinput",
      title: "codeKey",
    },
    {
      prop: "placeholder",
      inputtype: "rtinput",
      title: "输入框占位文本",
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
  rtSelectV2: [
    {
      prop: "typeCode",
      inputtype: "rtinput",
      title: "codeKey",
    },
    {
      prop: "placeholder",
      inputtype: "rtinput",
      title: "输入框占位文本",
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
  rtcascader: [
    {
      prop: "typeCode",
      inputtype: "rtinput",
      title: "codeKey",
    },
    {
      prop: "placeholder",
      inputtype: "rtinput",
      title: "输入框占位文本",
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
  rtnumber: [
    {
      prop: "placeholder",
      inputtype: "rtinput",
      title: "输入框占位文本",
    },
    {
      prop: "clearable",
      inputtype: "rtselect",
      title: "是否显示清除按钮",
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
      title: "是否只能输入step的倍数",
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
  ],
  rtdatepicker: [
    {
      prop: "placeholder",
      inputtype: "rtinput",
      title: "输入框占位文本",
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
      prop: "dateType",
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
  ],
  rtswitch: [
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
  rttag: [
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
        { label: "dark", value: "dark" },
        { label: "light", value: "light" },
        { label: "plain", value: "plain" },
      ],
    },
    {
      prop: "round",
      inputtype: "rtselect",
      title: "是否为圆形",
      loadData: yesOrNo,
    },
  ],
  rtcheckbox: [
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
  rtcheckboxgroup: [
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
        { label: "checkbox", value: "checkbox" },
        { label: "button", value: "button" },
      ],
    },
  ],
  rtinputgroup: [],
});

/** 实时预览表单 */
const formconfigLook = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "实时预览",
    production: true,
    productionTitle: "预览当前要素的显示效果",
    fromSchema: [],
  })
);

/** 主表单配置 —— 基本规则配置 */
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "规则配置",
    fromSchema: [
      {
        prop: "cFactorProp",
        inputtype: "rtinput",
        title: "要素key",
        disabled: true,
      },
      {
        prop: "cFactorTitle",
        inputtype: "rtinput",
        title: "要素名称",
        disabled: true,
      },
      {
        prop: "cFactorInputtype",
        inputtype: "rtselect",
        title: "要素类型",
        readonly: true,
        loadData: inputtype,
      },
      {
        prop: "defaultValue",
        inputtype: "rtinput",
        title: "默认值",
      },
      {
        prop: "required",
        inputtype: "rtselect",
        title: "是否必填",
        loadData: yesOrNo,
      },
      {
        prop: "extJson",
        inputtype: "rtinput",
        title: "Json",
        type: "textarea",
        rows: 3,
        itemWidth: 3,
        placeholder: '扩展配置, 如: {"key": "value"}',
        rules: [
          {
            validator: (rule: any, value: any, callback: any) => {
              if (value === null || value === undefined || String(value).trim() === "") {
                callback();
                return;
              }
              try {
                JSON.parse(String(value));
                callback();
              } catch (e) {
                callback(new Error("请输入正确的JSON格式"));
              }
            },
            trigger: "blur",
          },
        ],
      },
    ],
    superFromShow: "要素详情配置",
    superFromClose: "要素详情配置",
    showSuperior: true,
    superFromSchema: [],
  })
);

/** 根据 inputtype 获取对应的 superFromSchema */
function getSuperSchema(data: string) {
  if (data !== "rtinputgroup" && data !== "rttable") {
    showView.value = true;
  } else {
    showView.value = false;
  }
  return schemaMap[data] || [];
}

/** 表单数据更新回调 —— 更新预览 */
function fromUpdata(newData: any) {
  const jsonObj = { ...newData };
  if (jsonObj.inputtype) {
    jsonObj.func = null;
    if (jsonObj.required === "1") {
      jsonObj.rules = [getRules("required", {})];
    }
    formconfigLook.fromSchema = [jsonObj];
  }
}

// 初始化：从 props.data 获取当前要素和已有配置
watch(
  () => props.data,
  (val) => {
    if (val) {
      currentInputtype.value = val.cFactorInputtype || "rtinput";
      const com = getSuperSchema(currentInputtype.value);
      formconfig1.superFromSchema = com;
      // 回填表单数据
      setTimeout(() => {
        const formData: any = {
          cFactorProp: val.cFactorProp || "",
          cFactorTitle: val.cFactorTitle || "",
          cFactorInputtype: val.cFactorInputtype || "",
          defaultValue: val.config?.defaultValue || "",
          required: val.config?.required ? "1" : "0",
          extJson: val.config?.extJson || "",
        };
        // 回填 superFromSchema 字段
        if (val.config) {
          const superFields = com || [];
          superFields.forEach((field: any) => {
            if (val.config[field.prop] !== undefined) {
              formData[field.prop] = val.config[field.prop];
            }
          });
        }
        freeEditRef.value?.setFormValue(formData);
        // 更新预览
        const previewObj: any = {
          ...formData,
          inputtype: currentInputtype.value,
          prop: val.cFactorProp,
          title: val.cFactorTitle,
        };
        fromUpdata(previewObj);
      }, 50);
    }
  },
  { immediate: true }
);

/** 保存配置 */
function save() {
  const s = freeEditRef.value?.getFromValue();
  if (s) {
    const configData: any = {
      defaultValue: s.defaultValue || "",
      required: s.required === "1",
      extJson: s.extJson || "",
    };
    // 收集 superFromSchema 字段
    const com = schemaMap[currentInputtype.value] || [];
    com.forEach((field: any) => {
      if (s[field.prop] !== undefined) {
        configData[field.prop] = s[field.prop];
      }
    });
    emits("ok", configData);
    dialogVisible.value = false;
  }
}

function handleCancel() {
  dialogVisible.value = false;
  emits("cancel");
}
</script>

<style scoped>
.rule-config-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}
.element-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-color-primary);
}
</style>

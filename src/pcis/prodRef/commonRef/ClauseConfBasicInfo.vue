<template>
  <div class="" style="padding-bottom: 6px">
    <app-free-edit
      v-model:freeEditConfig="formconfig1"
      :key="formconfig1.fromSchema"
      ref="freeEditRef"
    />
    <comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { createFreeButtonBase } from "@/shared/button-config";
import { formatActionTitle } from "@/utils/action-title";
import { useValidator } from "@/typings/useValidator";
import { getPrdTermInfo, qryProdTermList, savePrdTermInfo } from "@/api/prod";
import { nextTick, onMounted, reactive, ref, watch } from "vue";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { dataParam } from "@/store/modules/dataParam";
import { closeCurrentTagAndBack } from "@/utils/common";

const UI_MAIN_CLAUSE = "1";
const UI_ADDITIONAL_CLAUSE = "2";
const LEGACY_MAIN_CLAUSE = "0";
const LEGACY_ADDITIONAL_CLAUSE = "1";

const yesNoOptions = [
  { label: "是", value: "1" },
  { label: "否", value: "0" },
];
const zeroOneOptions = [
  { label: "0-否", value: "0" },
  { label: "1-是", value: "1" },
];
const clauseTypeOptions = [
  { label: "1-主险", value: UI_MAIN_CLAUSE },
  { label: "2-附加险", value: UI_ADDITIONAL_CLAUSE },
];
const productFlagOptions = [
  { label: "1-新增", value: "1" },
  { label: "U1-修订-报送", value: "U1" },
  { label: "U2-修订-新增", value: "U2" },
];
const platformOptions = [
  { label: "1-自主注册平台", value: "1" },
  { label: "2-电子化报备", value: "2" },
  { label: "3-其他", value: "3" },
];
const reportTypeOptions = [
  { label: "2-备案制", value: "2" },
  { label: "3-注册制", value: "3" },
];
const eastOptions = [
  { label: "1-是", value: "1" },
  { label: "0-否", value: "0" },
];
const saleStatusOptions = [
  { label: "1-在售", value: "1" },
  { label: "2-停售", value: "2" },
];
const propertyTypeOptions = [{ label: "1-普通型", value: "1" }];
const agricultureOptions = [
  { label: "1-是", value: "1" },
  { label: "2-否", value: "2" },
];

const paramparam = dataParam();
const param = paramparam.getParam();
const dialog = ref<DialogMethod | null>(null);
const { getRules } = useValidator();
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const emit = defineEmits([
  "clause-type-change",
  "term-data-loaded",
  "term-saved",
]);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: formatActionTitle(param?.type, "条款基本信息"),
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "success",
        label: "条款要素绑定",
        func: async () => {
          const cTermNo = freeEditRef.value?.getValue("cTermNo");
          dialog.value?.open(
            "termFactorConfig",
            { type: "show", data: { cTermNo } },
            { isOk: () => {} },
            { title: "条款要素绑定", width: 75 },
          );
        },
      }),
      createFreeButtonBase({
        type: "success",
        label: "条责分组关联",
        func: async () => {
          const cTermNo = freeEditRef.value?.getValue("cTermNo");
          dialog.value?.open(
            "termRiskGroupConfig",
            { type: "show", data: { cTermNo } },
            { isOk: () => {} },
            { title: "条款责任分组关联", width: 75 },
          );
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "保存",
        func: async () => {
          const isValid = await freeEditRef.value?.validate();
          if (!isValid) {
            ElMessage.error("请填写必填项");
            return;
          }

          const formData = freeEditRef.value?.getFromValue();
          const datas = buildSaveData(formData || {});
          datas.type = param?.type === "copy" ? "add" : param?.type;
          savePrdTermInfo(datas)
            .then((res) => {
              const { code, data, msg } = res;
              if (code === 200) {
                freeEditRef.value?.setFormValue({ cTermNo: data });
                ElMessage.success("保存成功");
                if (param?.type === "copy") {
                  nextTick(() => emit("term-saved", data));
                }
              } else {
                ElMessage.error(msg);
              }
            })
            .finally(() => {});
        },
      }),
      createFreeButtonBase({
        label: "返回",
        func: () => closeCurrentTagAndBack(),
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo",
        inputtype: "rtselect",
        title: "险类代码",
        typeCode: "KIND_LIST_GRT",
        codeParam: { cStatus: "1" },
        rules: [getRules("required", { change: true })],
        func: () => updateConditionalVisibility(),
      },
      {
        prop: "cEastClassCode",
        inputtype: "rtselect",
        title: "EAST险类",
        typeCode: "WEB_BAS_CODELIST",
        codeParam: { cParCde: "EastClass" },
        filterable: true,
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cTermNo",
        inputtype: "rtinput",
        title: "条款代码",
        maxlength: 50,
        disabled: param?.type === "edit",
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "条款名称",
        maxlength: 150,
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cRdrTyp",
        inputtype: "rtselect",
        title: "条款类型",
        loadData: clauseTypeOptions,
        rules: [getRules("required", { change: true })],
        func: (value: any) => {
          emit("clause-type-change", toUiClauseType(value));
        },
      },
      {
        prop: "cEnableFlag",
        inputtype: "rtselect",
        title: "启用标志",
        loadData: [
          { label: "启用", value: "1" },
          { label: "停用", value: "0" },
        ],
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cProdFlag",
        inputtype: "rtselect",
        title: "产品标识",
        loadData: productFlagOptions,
        rules: [getRules("required", { change: true })],
        func: () => updateConditionalVisibility(),
      },
      {
        prop: "cOriginalProdNo",
        inputtype: "rtautocomplete",
        title: "修订的原产品关联号",
        maxlength: 50,
        triggerOnFocus: false,
        fetchSuggestions: fetchOriginalProductSuggestions,
        hidden: true,
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "cVersionNo",
        inputtype: "rtinput",
        title: "当前版本号",
        maxlength: 3,
        readonly: true,
        placeholder: "000",
      },
      {
        prop: "cClauseRegistPlatform",
        inputtype: "rtselect",
        title: "条款备案平台",
        loadData: platformOptions,
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cClauseReportType",
        inputtype: "rtselect",
        title: "条款报送类型",
        loadData: reportTypeOptions,
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cRegisteredNo",
        inputtype: "rtinput",
        title: "注册号",
        maxlength: 50,
      },
      {
        prop: "cFilingNo",
        inputtype: "rtinput",
        title: "备案号",
        maxlength: 50,
      },
      {
        prop: "cIsEast",
        inputtype: "rtselect",
        title: "是否EAST产品上报",
        loadData: eastOptions,
        clearable: true,
        func: () => updateConditionalVisibility(),
      },
      {
        prop: "cRegisterDate",
        inputtype: "rtdatepicker",
        title: "注册日期",
        type: "date",
        valueFormat: "YYYY-MM-DD",
        format: "YYYY-MM-DD",
        hidden: true,
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "tFilingTm",
        inputtype: "rtdatepicker",
        title: "备案日期",
        type: "date",
        valueFormat: "YYYY-MM-DD",
        format: "YYYY-MM-DD",
        hidden: true,
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "tFeedbackTm",
        inputtype: "rtdatepicker",
        title: "反馈日期",
        type: "date",
        valueFormat: "YYYY-MM-DD",
        format: "YYYY-MM-DD",
      },
      {
        prop: "cReportFileNo",
        inputtype: "rtinput",
        title: "报送文件编号",
      },
      {
        prop: "termRateUpper",
        inputtype: "rtnumber",
        title: "备案费率上限",
        precision: 8,
      },
      {
        prop: "termRateLower",
        inputtype: "rtnumber",
        title: "备案费率下限",
        precision: 8,
      },
      {
        prop: "costRateUpper",
        inputtype: "rtnumber",
        title: "保司费率上限",
        precision: 8,
      },
      {
        prop: "costRateLower",
        inputtype: "rtnumber",
        title: "保司费率下限",
        precision: 8,
      },
      {
        prop: "cRateFilepath",
        inputtype: "rtinput",
        title: "费率附件下载路径",
      },
      {
        prop: "tSaleStartTm",
        inputtype: "rtdatepicker",
        title: "备案起售日期",
        type: "date",
        valueFormat: "YYYY-MM-DD",
        format: "YYYY-MM-DD",
        hidden: true,
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "tSaleEndTm",
        inputtype: "rtdatepicker",
        title: "备案停售日期",
        type: "date",
        valueFormat: "YYYY-MM-DD",
        format: "YYYY-MM-DD",
        placeholder: "支持 9999-12-31",
        hidden: true,
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cSaleStatus",
        inputtype: "rtselect",
        title: "产品销售状态",
        loadData: saleStatusOptions,
        readonly: true,
      },
      {
        prop: "tStopUseTm",
        inputtype: "rtdatepicker",
        title: "条款停止使用时间",
        type: "datetime",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        format: "YYYY-MM-DD HH:mm:ss",
        hidden: true,
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cAreaRange",
        inputtype: "rtselect",
        title: "经营区域",
        typeCode: "WEB_BAS_AREA",
        codeParam: { cType: "3" },
        multiple: true,
        filterable: true,
        clearable: true,
      },
      {
        prop: "cIsInternet",
        inputtype: "rtselect",
        title: "是否互联网",
        loadData: yesNoOptions,
      },
      {
        prop: "cIsGroup",
        inputtype: "rtselect",
        title: "是否团单",
        loadData: yesNoOptions,
      },
      {
        prop: "isDutyfree",
        inputtype: "rtselect",
        title: "是否免税",
        loadData: zeroOneOptions,
      },
      {
        prop: "cIsFromCommon",
        inputtype: "rtselect",
        title: "是否从共条款",
        loadData: yesNoOptions,
      },
      {
        prop: "cAgriculturalType",
        inputtype: "rtselect",
        title: "农险产品类型",
        typeCode: "WEB_BAS_CODELIST",
        codeParam: { cParCde: "AgriculturalType" },
        filterable: true,
        hidden: true,
        rules: [getRules("required", { change: true })],
      },
      {
        prop: "cPropertyType",
        inputtype: "rtselect",
        title: "财产险产品类型",
        loadData: propertyTypeOptions,
      },
      {
        prop: "cPolicyFlag",
        inputtype: "rtselect",
        title: "政策性保险标志",
        loadData: zeroOneOptions,
        func: () => updateConditionalVisibility(),
      },
      {
        prop: "cSubsidyRate",
        inputtype: "rtinput",
        title: "政府保费补贴比例",
        type: "number",
        maxlength: 8,
        hidden: true,
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "cAgricultureFlag",
        inputtype: "rtselect",
        title: "涉农标志",
        loadData: agricultureOptions,
      },
      {
        prop: "cVirtualFlag",
        inputtype: "rtselect",
        title: "产品虚标标志",
        loadData: zeroOneOptions,
        readonly: true,
      },
      {
        prop: "cApprovalNo",
        inputtype: "rtinput",
        title: "关联审批申请单号",
        maxlength: 50,
        rules: [getRules("required", { blur: true })],
      },
      {
        prop: "cClauseUrl",
        inputtype: "rtinput",
        title: "条款附件链接",
        maxlength: 1000,
      },
      {
        prop: "cDesc",
        inputtype: "rtinput",
        type: "textarea",
        title: "条款描述",
        rows: 4,
        itemWidth: 3,
      },
    ],
    fromUi: createFromUiConfig({ cols: 3 }),
  }),
);

function updateConditionalVisibility() {
  const productFlag = String(getValue("cProdFlag") || "");
  const eastFlag = String(getValue("cIsEast") || "");
  const productKind = String(getValue("cKindNo") || "").padStart(2, "0");
  const policyFlag = String(getValue("cPolicyFlag") || "");
  const saleStatus = String(getValue("cSaleStatus") || "");

  setFormItem("cOriginalProdNo", {
    hidden: !["U1", "U2"].includes(productFlag),
  });
  const eastRequired = eastFlag === "1";
  ["cRegisterDate", "tFilingTm", "tSaleStartTm", "tSaleEndTm"].forEach(
    (field) => {
      setFormItem(field, { hidden: !eastRequired });
    },
  );
  setFormItem("cAgriculturalType", {
    hidden: !["20", "21", "22"].includes(productKind),
  });
  setFormItem("cSubsidyRate", { hidden: policyFlag !== "1" });
  setFormItem("tStopUseTm", { hidden: saleStatus !== "2" });
}

function setFormItem(key: string, value: Record<string, any>) {
  const item = formconfig1.fromSchema?.find((schema) => schema.prop === key);
  if (item) {
    Object.assign(item, value);
  }
}

function getValue(key: string) {
  return freeEditRef.value?.getValue(key);
}

function setValue(key: string, value: any, noupdate = false) {
  freeEditRef.value?.setValue(key, value, noupdate);
}

function getFromValue() {
  return freeEditRef.value?.getFromValue();
}

function setFormValue(value: any) {
  freeEditRef.value?.setFormValue(value);
}

function validate() {
  return freeEditRef.value?.validate();
}

function toUiClauseType(value: any) {
  const clauseType = value == null ? value : String(value);
  if (clauseType === LEGACY_MAIN_CLAUSE) return UI_MAIN_CLAUSE;
  return clauseType;
}

function normalizeLoadedClauseType(value: any) {
  const clauseType = value == null ? value : String(value);
  if (clauseType === LEGACY_MAIN_CLAUSE) return UI_MAIN_CLAUSE;
  if (clauseType === LEGACY_ADDITIONAL_CLAUSE) return UI_ADDITIONAL_CLAUSE;
  return clauseType;
}

function toApiClauseType(value: any) {
  const clauseType = value == null ? value : String(value);
  if (clauseType === UI_MAIN_CLAUSE) return LEGACY_MAIN_CLAUSE;
  if (clauseType === UI_ADDITIONAL_CLAUSE) return LEGACY_ADDITIONAL_CLAUSE;
  return clauseType;
}

function normalizeAreaValue(value: any) {
  if (Array.isArray(value)) return value;
  if (value == null || value === "") return [];
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // 按普通分隔字符串继续处理
      }
    }
    return trimmed
      .split(/[,，]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [value];
}

function normalizeLoadedData(data: any) {
  const normalized = { ...(data || {}) };
  const aliases: Record<string, string[]> = {
    cEastClassCode: ["classCode"],
    cVersionNo: ["versionNo"],
    cOriginalProdNo: ["originalProductNo"],
    cClauseRegistPlatform: ["clauseRegistPlatform"],
    cClauseReportType: ["clauseReportType"],
    cIsEast: ["validIndEast"],
    cRegisterDate: ["registDate"],
    tFilingTm: ["recordDate"],
    tSaleStartTm: ["saleStartDate"],
    tSaleEndTm: ["saleEndDate"],
    tStopUseTm: ["ProposeSaleStopDate", "proposeSaleStopDate"],
    cAreaRange: ["saleDistrict"],
    cAgriculturalType: ["agriculturalType"],
    cPropertyType: ["propertyType"],
    isDutyfree: ["taxFlag"],
    cPolicyFlag: ["policyFlag"],
    cAgricultureFlag: ["isAgriculture"],
    cVirtualFlag: ["virtualInd"],
    cClauseUrl: ["clauseUrl"],
    cRegisteredNo: ["registNo"],
    cFilingNo: ["recordNumber"],
    cRdrTyp: ["kindInd"],
  };

  Object.entries(aliases).forEach(([target, sources]) => {
    if (normalized[target] == null) {
      const source = sources.find((key) => normalized[key] != null);
      if (source) normalized[target] = normalized[source];
    }
  });
  normalized.cRdrTyp = normalizeLoadedClauseType(normalized.cRdrTyp);
  normalized.cAreaRange = normalizeAreaValue(normalized.cAreaRange);
  return normalized;
}

function buildSaveData(formData: any) {
  const data = { ...(formData || {}) };
  data.cRdrTyp = toApiClauseType(data.cRdrTyp);
  if (Array.isArray(data.cAreaRange)) {
    data.cAreaRange = data.cAreaRange.join(",");
  }
  return data;
}

function fetchOriginalProductSuggestions(
  query: string,
  callback: (suggestions: any[]) => void,
) {
  const keyword = query?.trim();
  if (!keyword) {
    callback([]);
    return;
  }
  qryProdTermList({
    cTermNo: keyword,
    cEnableFlag: "1",
    pageNum: 1,
    pageSize: 20,
  })
    .then((res: any) => {
      const list = res?.data?.result || res?.data?.list || [];
      callback(
        list.map((item: any) => ({
          value: item.cTermNo,
          label: `${item.cTermNo || ""}${item.cNmeCn ? ` ${item.cNmeCn}` : ""}`,
        })),
      );
    })
    .catch(() => callback([]));
}

function handleQuery() {
  const cPkId = param?.row?.cPkId;
  if (!cPkId) return;
  getPrdTermInfo({ cPkId, pageNum: 1, pageSize: 10 })
    .then((res) => {
      const { code, data, msg } = res;
      if (code !== 200) {
        ElMessage.error(msg);
        return;
      }
      setTimeout(() => {
        const normalized = normalizeLoadedData(data);
        setFormValue(normalized);
        updateConditionalVisibility();
        emit("clause-type-change", normalized.cRdrTyp);
        if (param?.type === "copy") {
          nextTick(() => emit("term-data-loaded"));
        }
      }, 100);
    })
    .finally(() => {});
}

function clearCopyTermNo() {
  if (param?.type === "copy") {
    setValue("cTermNo", null);
  }
}

function setDisa() {
  if (param?.type === "edit") {
    setFormItem("cTermNo", { disabled: true });
  }
}

watch(
  () => [
    getValue("cRdrTyp"),
    getValue("cProdFlag"),
    getValue("cIsEast"),
    getValue("cKindNo"),
    getValue("cPolicyFlag"),
    getValue("cSaleStatus"),
  ],
  () => {
    updateConditionalVisibility();
    const clauseType = getValue("cRdrTyp");
    if (clauseType != null) {
      emit("clause-type-change", toUiClauseType(clauseType));
    }
  },
  { immediate: true },
);

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  clearCopyTermNo,
});

onMounted(() => {
  if (param?.type === "edit" || param?.type === "copy") {
    setDisa();
    handleQuery();
  } else {
    setFormValue({
      cEnableFlag: "1",
      cProdFlag: "1",
      cIsEast: "0",
      cPropertyType: "1",
      cVirtualFlag: "0",
      cIsInternet: "0",
      cIsGroup: "0",
      isDutyfree: "0",
      cIsFromCommon: "0",
      cPolicyFlag: "0",
      cAgricultureFlag: "2",
    });
    updateConditionalVisibility();
  }
});
</script>

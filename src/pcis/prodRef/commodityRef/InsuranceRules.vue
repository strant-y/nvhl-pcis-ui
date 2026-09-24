<!-- 投保规则组件 - 使用 AppFreeEdit 渲染表单，与商品基本信息组件风格一致 -->
<template>
  <div class="componenFrom">
    <!-- 有配置内容: 动态表单(按分类分组展示) -->
    <app-free-edit
      v-if="finalSelection.length > 0"
      v-model:freeEditConfig="formconfig1"
      ref="freeEditRef"
    />

    <!-- 无配置内容: 空状态 -->
    <el-card v-else shadow="hover" class="rule-empty-card">
      <template #header>
        <el-row justify="space-between">
          <el-col :span="4">
            <span class="card-title-style">投保规则</span>
          </el-col>
          <el-col :span="20" style="text-align: right">
            <el-button v-if="!isDisabled" text type="primary" @click="openMainModal">
              <el-icon><Edit /></el-icon>
              编辑配置
            </el-button>
          </el-col>
        </el-row>
      </template>
      <div class="rule-empty-state">
       
        <p class="rule-empty-title">暂无配置内容</p>
        <p class="rule-empty-hint">点击右上角"编辑配置"按钮添加要素</p>
      </div>
    </el-card>

    <!-- 要素选择弹窗 -->
    <InsuranceRuleSelectModal
      v-if="showSelectModal"
      :data="{ finalSelection }"
      @ok="confirmSelection"
      @cancel="showSelectModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, inject, nextTick, computed, watch } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";
import InsuranceRuleSelectModal from "./InsuranceRuleSelectModal.vue";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { idxParamKey, IdxParamProps, useIdxParam } from "@/views/pcis/support/useIdxParam";
import { useRoute } from "vue-router";
import { descryptParameter } from "@/utils/encipher";
import { saveRuleFactorConfig, queryRuleFactorConfig } from "@/api/prod";
import { getDictOptions } from "@/api/dict";
import { Edit, Plus } from "@element-plus/icons-vue";

const { getRules } = useValidator();

const props = defineProps({
  /** 业务单号(商品页=cCommodityNo值, 方案页=cPlanNo值); 为空时回退读取路由query中的cCommodityNo(向后兼容) */
  bizNo: { type: String, default: "" },
  /** 页面模式 add/edit/copy/view/handle...; 为空时回退读取路由query中的editType(向后兼容) */
  mode: { type: String, default: "" },
});

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}");

/** 生效业务单号: 优先 props.bizNo, 回退路由 query 的 cCommodityNo */
const effectiveBizNo = computed(() => props.bizNo || param.cCommodityNo || "");
/** 生效页面模式: 优先 props.mode, 回退路由 query 的 editType */
const effectiveMode = computed(() => props.mode || param.editType || "");

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const showSelectModal = ref(false);
const isDisabled = ref(false);
const finalSelection = ref<any[]>([]);

/** tab分类编码→名称映射 */
const tabNameMap = ref<Record<string, string>>({});

/** 加载所属tab字典, 用于分组标题显示 */
function loadTabNames() {
  getDictOptions("tablist")
    .then((res: any) => {
      const { code, data } = res;
      if (200 === code && data) {
        data.forEach((d: any) => {
          tabNameMap.value[d.value] = d.label;
        });
        // 字典加载完成后刷新分组标题
        if (finalSelection.value.length > 0) {
          buildGroups();
        }
      }
    })
    .finally(() => {});
}

/** 根据 finalSelection 的分类(cFactorTab)构建 groupBy 分组, 标题含要素数量 */
function buildGroups() {
  const groupMap = new Map<string, number>();
  finalSelection.value.forEach((item) => {
    const tab = item.cFactorTab || "";
    if (tab) groupMap.set(tab, (groupMap.get(tab) || 0) + 1);
  });
  formconfig1.fromUi!.groupBy = [...groupMap.entries()].map(([id, count]) => ({
    id,
    title: `${tabNameMap.value[id] || id} (${count}项)`,
  }));
}

/** 编辑配置按钮 */
const editBtn = createFreeButtonBase({
  label: "编辑配置",
  type: "text",
  icon: "Edit",
  func: () => {
    if (!isDisabled.value) {
      openMainModal();
    }
  },
});

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "投保规则",
    titleBtns: [editBtn],
    fromSchema: [],
    fromUi: createFromUiConfig({
      cols: 3,
    }),
  })
);

/** 打开要素选择弹窗 */
function openMainModal() {
  showSelectModal.value = true;
}

/** 确认选择 */
function confirmSelection(selectedItems: any[]) {
  finalSelection.value = selectedItems;
  showSelectModal.value = false;
  rebuildForm();
  // 确认配置后立即调用保存接口; 此时 finalSelection 为权威数据
  // (表单值回填在 nextTick 中尚未完成, 不走 saveRuleConfig 的表单同步)
  const cRuleCode = effectiveBizNo.value;
  if (cRuleCode) {
    doSaveRuleConfig(cRuleCode).then((ok) => {
      if (ok) {
        ElMessage.success("投保规则保存成功");
      }
    });
  }
}

/**
 * 根据 finalSelection 动态构建 fromSchema 并回填表单值
 * 将要素的 cFactorInputtype 映射为 AppFreeEdit 的 inputtype
 * 将 config 中的校验/样式属性映射为 schema 属性
 */
function rebuildForm() {
  formconfig1.fromSchema = finalSelection.value.map((item) => {
    const cfg = item.config || {};
    const schemaItem: any = {
      prop: item.cFactorProp,
      inputtype: item.cFactorInputtype,
      title: item.cFactorTitle,
      // 投保规则表单仅用于展示配置内容, 不可输入(配置请在"规则配置"弹窗中进行)
      disabled: true,
    };

    // ---- 分组标识(按所属tab分类展示) ----
    if (item.cFactorTab) schemaItem.group = item.cFactorTab;

    // ---- 规则提示标签 ----
    const tags: Array<{ label: string; type: string }> = [];
    if (cfg.required) tags.push({ label: "必填", type: "danger" });
    if (cfg.regex)
      tags.push({
        label: cfg.regex.length > 18 ? cfg.regex.substring(0, 18) + "..." : cfg.regex,
        type: "warning",
      });
    if (cfg.minLength) tags.push({ label: `≥${cfg.minLength}字符`, type: "info" });
    if (cfg.maxLength) tags.push({ label: `≤${cfg.maxLength}字符`, type: "info" });
    if (cfg.min !== null && cfg.min !== undefined && cfg.min !== "")
      tags.push({ label: `最小值: ${cfg.min}`, type: "info" });
    if (cfg.max !== null && cfg.max !== undefined && cfg.max !== "")
      tags.push({ label: `最大值: ${cfg.max}`, type: "info" });
    if (cfg.stepStrictly === "1") tags.push({ label: "仅整数", type: "warning" });
    if (tags.length) schemaItem.ruleTags = tags;

    // ---- 通用属性 ----
    if (cfg.placeholder) schemaItem.placeholder = cfg.placeholder;
    if (cfg.clearable === "1") schemaItem.clearable = true;
    if (cfg.disabled === "1") schemaItem.disabled = true;
    if (cfg.readonly === "1") schemaItem.readonly = true;
    if (cfg.required) schemaItem.rules = [getRules("required", {})];

    // ---- rtinput 特有 ----
    if (cfg.maxLength) schemaItem.maxlength = cfg.maxLength;
    if (cfg.prefix) schemaItem.prefix = cfg.prefix;
    if (cfg.suffix) schemaItem.suffix = cfg.suffix;

    // ---- rtnumber 特有 ----
    if (cfg.min !== null && cfg.min !== undefined) schemaItem.min = cfg.min;
    if (cfg.max !== null && cfg.max !== undefined) schemaItem.max = cfg.max;
    if (cfg.step) schemaItem.step = cfg.step;
    if (cfg.precision !== null && cfg.precision !== undefined)
      schemaItem.precision = cfg.precision;
    if (cfg.stepStrictly === "1") schemaItem.stepStrictly = true;

    // ---- rtselect / rtSelectV2 特有 ----
    if (cfg.typeCode) schemaItem.typeCode = cfg.typeCode;
    if (cfg.filterable === "1") schemaItem.filterable = true;
    if (cfg.multiple === "1") schemaItem.multiple = true;

    // ---- rtcascader 特有 ----
    if (cfg.checkStrictly === "1") schemaItem.checkStrictly = true;

    // ---- rtdatepicker 特有 ----
    if (cfg.format) schemaItem.format = cfg.format;
    if (cfg.valueFormat) schemaItem.valueFormat = cfg.valueFormat;
    if (cfg.dateType) schemaItem.type = cfg.dateType;

    // ---- rtswitch 特有 ----
    if (cfg.activeText) schemaItem.activeText = cfg.activeText;
    if (cfg.inactiveText) schemaItem.inactiveText = cfg.inactiveText;
    if (cfg.inlinePrompt === "1") schemaItem.inlinePrompt = true;

    // ---- rtradio / rtcheckbox 特有 ----
    if (cfg.border === "1") schemaItem.border = true;

    // ---- rtcheckbox 特有 ----
    if (cfg.trueValue !== undefined && cfg.trueValue !== "")
      schemaItem.trueValue = cfg.trueValue;
    if (cfg.falseValue !== undefined && cfg.falseValue !== "")
      schemaItem.falseValue = cfg.falseValue;

    // ---- rttag 特有 ----
    if (cfg.effect) schemaItem.effect = cfg.effect;
    if (cfg.round === "1") schemaItem.round = true;

    return schemaItem;
  });

  // 刷新分组展示
  buildGroups();

  // 回填表单值
  nextTick(() => {
    const formData: any = {};
    finalSelection.value.forEach((item) => {
      formData[item.cFactorProp] = item.config?.defaultValue ?? "";
    });
    freeEditRef.value?.setFormValue(formData);
    if (isDisabled.value) {
      freeEditRef.value?.setDisabledAll(true);
    }
  });
}

/** 将表单值同步回 finalSelection 的 config.defaultValue */
function syncFormToSelection() {
  const formValues = freeEditRef.value?.getFromValue() || {};
  finalSelection.value.forEach((item) => {
    if (item.config) {
      item.config.defaultValue = formValues[item.cFactorProp];
    }
  });
}

/** 后端规则要素配置记录 → 组件内 finalSelection 结构 */
function mapConfigToSelection(item: any) {
  let config: any = {};
  if (item.cFactorJson) {
    try {
      config = JSON.parse(item.cFactorJson);
    } catch (e) {
      config = {};
    }
  }
  // cFactorDefault 为独立存储的默认值, 优先于 JSON 中的 defaultValue
  config.defaultValue = item.cFactorDefault ?? config.defaultValue ?? "";
  return {
    cPkId: item.cFactorKey,
    cFactorProp: item.cFactorProp || "",
    cFactorTitle: item.cFactorTitle || "",
    cFactorInputtype: item.cFactorInputtype || "rtinput",
    cFactorTab: item.cGroup || "",
    // 保留 rel 结构字段, 保存时原样回传
    cExpand: item.cExpand || "",
    cShowLocation: item.cShowLocation || "",
    cTableWidth: item.cTableWidth || "",
    cSysConfig: item.cSysConfig || "",
    config,
  };
}

/** 查询规则要素配置(投保规则回显) */
function handleQuery() {
  const bizNo = effectiveBizNo.value;
  if (!bizNo) {
    return;
  }
  queryRuleFactorConfig({ cRuleCode: bizNo })
    .then((res) => {
      const { code, data, msg } = res;
      if (code === 200 || code === "0") {
        if (Array.isArray(data) && data.length > 0) {
          finalSelection.value = [...data]
            .sort((a, b) => (a.cSortingNo || 0) - (b.cSortingNo || 0))
            .map(mapConfigToSelection);
          rebuildForm();
        }
      } else {
        ElMessage.error(msg || res.message);
      }
    })
    .finally(() => {});
}

// ============= defineExpose 契约方法 =============

/**
 * 保存规则要素配置(POST /saveRuleFactorConfig)
 * @param ruleCode 规则编码(商品号/方案号), 不传则使用 effectiveBizNo
 * @returns 是否保存成功
 */
function saveRuleConfig(ruleCode?: string): Promise<boolean> {
  const cRuleCode = ruleCode || effectiveBizNo.value;
  if (!cRuleCode) {
    return Promise.resolve(false);
  }
  // 先把当前表单值同步回 config.defaultValue
  syncFormToSelection();
  return doSaveRuleConfig(cRuleCode);
}

/** 以当前 finalSelection 为权威数据执行保存(不做表单同步) */
function doSaveRuleConfig(cRuleCode: string): Promise<boolean> {
  const factorConfigs = finalSelection.value.map((item, index) => ({
    cFactorKey: item.cPkId || "",
    cGroup: item.cFactorTab || "",
    cSortingNo: index + 1,
    cExpand: item.cExpand || "",
    cShowLocation: item.cShowLocation || "",
    cTableWidth: item.cTableWidth || "",
    cSysConfig: item.cSysConfig || "",
    cFactorDefault: item.config?.defaultValue ?? "",
    cFactorJson: item.config ? JSON.stringify(item.config) : "",
  }));
  return saveRuleFactorConfig({ cRuleCode, factorConfigs }).then((res) => {
    const { code } = res;
    if (code === 200 || code === "0") {
      return true;
    }
    ElMessage.error(res.msg || res.message || "投保规则保存失败");
    return false;
  });
}

function getFromValue() {
  syncFormToSelection();
  return {
    ruleElements: finalSelection.value,
  };
}

function setFormValue(value: any) {
  if (value && value.ruleElements) {
    finalSelection.value = value.ruleElements;
  } else if (Array.isArray(value)) {
    finalSelection.value = value;
  }
  rebuildForm();
}

function validate() {
  return freeEditRef.value?.validate() || Promise.resolve(true);
}

function setValue(key: string, value: any) {
  if (key === "ruleElements") {
    finalSelection.value = value;
    rebuildForm();
  }
}

function getValue(key: string) {
  if (key === "ruleElements") {
    return finalSelection.value;
  }
  return null;
}

function setDisabledAll() {
  isDisabled.value = true;
  editBtn.disabled = true;
  nextTick(() => {
    freeEditRef.value?.setDisabledAll(true);
  });
}

onMounted(() => {
  loadTabNames();
  const m = effectiveMode.value;
  if (m !== "add" && m) {
    handleQuery();
    if (m !== "edit" && m !== "copy") {
      setDisabledAll();
    }
  }
});

// 业务单号异步到达时(如方案页 cPlanNo 延迟加载)补充加载规则数据
watch(
  () => props.bizNo,
  (val, oldVal) => {
    if (val && val !== oldVal && effectiveMode.value !== "add") {
      handleQuery();
    }
  }
);

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  setDisabledAll,
  saveRuleConfig,
});
</script>

<style scoped>
/* 空状态卡片头部与 app-free-edit 保持一致 */
.rule-empty-card :deep(.el-card__header) {
  height: 32px;
  padding: 4px 0 4px 12px;
}
.rule-empty-card :deep(.el-card__header .el-row) {
  align-items: center;
}
.rule-empty-card :deep(.el-card__body) {
  padding: 10px 20px;
}
.rule-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
}
.rule-empty-icon {
  color: var(--el-text-color-placeholder);
  margin-bottom: 12px;
}
.rule-empty-title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0 0 4px;
}
.rule-empty-hint {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin: 0;
}

/* 分组标题(所属tab)美化: 主色左竖线 + 浅色底, 与 ProdSidebar 风格一致 */
.componenFrom :deep(.rt_group) {
  display: flex;
  align-items: center;
  margin: 14px 0 10px;
  padding: 5px 12px;
  background: var(--el-color-primary-light-9);
  border-left: 3px solid var(--el-color-primary);
  border-radius: 4px;
}
.componenFrom :deep(.rt_group_title) {
  font-weight: 600;
  font-size: 13px;
  color: var(--el-text-color-primary);
  line-height: 20px;
}
</style>

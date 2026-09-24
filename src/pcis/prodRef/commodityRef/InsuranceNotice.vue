<!-- 投保须知组件 - 资料配置样式 -->
<template>
  <div class="insurance-notice-panel componenFrom">
    <!-- 顶部操作区：返回 + 标题 + 保存 -->
    <div class="data-config-header">
      <div class="header-back-title">
    
        <span class="divider-line"></span>
        <span class="config-title">投保须知</span>
      </div>
      <div class="header-actions" v-if="!disabledAll">
        <el-button type="primary" :loading="saveLoading" @click="onSave">保存</el-button>
      </div>
    </div>

    <!-- 资料配置表单 -->
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="data-config-form"
      :disabled="disabledAll"
    >
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="资料类型" prop="dataType">
            <el-select v-model="formData.dataType" placeholder="请选择资料类型" style="width: 100%">
              <el-option
                v-for="opt in dataTypeOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="资料名称" prop="dataName">
            <el-input v-model="formData.dataName" placeholder="请输入资料名称" maxlength="100" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="资料格式" prop="dataFormat">
            <div class="format-select-wrap">
              <el-select v-model="formData.dataFormat" placeholder="请选择资料格式">
                <el-option
                  v-for="opt in dataFormatOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
              <el-tooltip
                content="支持的资料格式,默认为 pdf 文件"
                placement="top"
                :show-after="100"
              >
                <el-icon class="format-tip"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="资料" prop="fileName">
            <div class="file-upload-wrap">
              <div class="file-name-text" :title="formData.fileName || ''">
                {{ formData.fileName || "" }}
              </div>
              <el-upload
                v-if="!disabledAll"
                :show-file-list="false"
                :auto-upload="false"
                accept=".pdf"
                :on-change="handleFileChange"
              >
                <el-button type="primary" plain>上传</el-button>
              </el-upload>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 文件预览区 -->
    <div class="file-preview-section">
      <div class="preview-title-row">
        <span class="preview-title">文件预览</span>
        <div class="preview-actions" v-if="formData.fileName">
          <el-tooltip content="下载" placement="top">
            <el-icon class="action-icon" @click="onDownload"><Download /></el-icon>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-icon class="action-icon danger" @click="onRemove"><Delete /></el-icon>
          </el-tooltip>
        </div>
      </div>
      <div class="preview-content">
        <div v-if="!formData.fileName" class="preview-empty">
          <el-icon class="empty-icon"><Document /></el-icon>
          <span>暂无文件预览</span>
        </div>
        <div v-else class="preview-pdf-placeholder">
          <!-- 样式优先:不接入真实预览,只展示 PDF 占位卡片 -->
          <el-icon class="pdf-icon"><Document /></el-icon>
          <div class="pdf-meta">
            <div class="pdf-name">{{ formData.fileName }}</div>
            <div class="pdf-tip">样式占位 - 待接入 PDF 预览组件</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 兼容旧版:关联/自定义多条须知弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editDialogTitle"
      width="680px"
      destroy-on-close
    >
      <el-form label-width="120px">
        <el-form-item label="投保须知内容" required>
          <el-input
            v-model="editForm.cSpecContent"
            type="textarea"
            :rows="6"
            maxlength="4000"
            show-word-limit
            placeholder="请输入投保须知内容"
            :disabled="isEditMode"
          />
        </el-form-item>
        <template v-if="isEditMode">
          <el-form-item label="是否可编辑">
            <el-checkbox v-model="editFormCIfEdit" true-value="1" false-value="0" />
          </el-form-item>
          <el-form-item label="是否必选">
            <el-checkbox v-model="editFormCIfMust" true-value="1" false-value="0" />
          </el-form-item>
          <el-form-item label="是否固定">
            <el-checkbox v-model="editFormCIfFix" true-value="1" false-value="0" />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editSubmitLoading" @click="saveEditDialog">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import {
  ArrowLeft,
  Delete,
  Document,
  Download,
  QuestionFilled,
} from "@element-plus/icons-vue";
import { useRoute } from "vue-router";
import { descryptParameter } from "@/utils/encipher";
import {
  qryRefPlanAndSpecList,
  unAssociationPlanSpec,
  editPlanSpecStatus,
  saveCustomPlanSpec,
} from "@/api/prod";

type NoticeSource = "0" | "1";

interface NoticeListItem {
  cSpecNo: string;
  cSpecContent: string;
  source: NoticeSource;
  cPkId?: string;
  cIfEdit?: string;
  cIfMust?: string;
  cIfFix?: string;
  cStatus?: string;
}

interface DataConfigForm {
  dataType: string;
  dataName: string;
  dataFormat: string;
  fileName: string;
  fileUrl?: string;
}

const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}");

const emit = defineEmits<{
  (e: "back"): void;
}>();

/** 生效业务单号: 商品页用 cCommodityNo */
const effectiveBizNo = computed(() => param.cCommodityNo || "");

/* ===== 资料配置表单 ===== */
const formRef = ref<FormInstance>();
const formData = reactive<DataConfigForm>({
  dataType: "insuranceNotice",
  dataName: "投保须知",
  dataFormat: "pdf",
  fileName: "河南微货车投保须知.pdf",
  fileUrl: "",
});

// 资料类型选项 - 默认只提供"投保须知",样式优先,后续接接口
const dataTypeOptions = [
  { label: "投保须知", value: "insuranceNotice" },
];

// 资料格式选项
const dataFormatOptions = [
  { label: "pdf 文件", value: "pdf" },
];

const formRules: FormRules<DataConfigForm> = {
  dataType: [{ required: true, message: "请选择资料类型", trigger: "change" }],
  dataName: [{ required: true, message: "请输入资料名称", trigger: "blur" }],
  dataFormat: [{ required: true, message: "请选择资料格式", trigger: "change" }],
  fileName: [{ required: true, message: "请上传资料文件", trigger: "change" }],
};

const saveLoading = ref(false);

function handleFileChange(file: any) {
  // 样式阶段:只回填文件名,不真正上传
  formData.fileName = file?.name || "";
  formData.fileUrl = "";
}

function onBack() {
  // 样式阶段:不绑定真实跳转,父组件可监听此事件
  emit("back");
}

function onDownload() {
  // 样式阶段:占位
  ElMessage.info("样式占位 - 待接入下载接口");
}

function onRemove() {
  if (!formData.fileName) return;
  ElMessageBox.confirm("确定要删除该资料文件吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      formData.fileName = "";
      formData.fileUrl = "";
      ElMessage.success("删除成功");
    })
    .catch(() => {});
}

async function onSave() {
  // 样式阶段:不真正调后端,只做前端校验与提示
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch {
    return;
  }
  saveLoading.value = true;
  try {
    // 模拟保存(样式优先)
    await new Promise((r) => setTimeout(r, 300));
    ElMessage.success("保存成功(样式占位)");
  } finally {
    saveLoading.value = false;
  }
}

/* ===== 兼容旧版:关联/自定义须知列表 ===== */
const disabledAll = ref(false);
const noticeList = ref<NoticeListItem[]>([]);
const editDialogVisible = ref(false);
const editMode = ref<"custom" | "edit">("custom");
const editIndex = ref(-1);
const editSubmitLoading = ref(false);
const editForm = reactive<NoticeListItem>({
  cSpecNo: "",
  cSpecContent: "",
  source: "1",
  cPkId: "",
  cIfEdit: "0",
  cIfMust: "0",
  cIfFix: "0",
  cStatus: "0",
});

const editFormCIfEdit = ref("0");
const editFormCIfMust = ref("0");
const editFormCIfFix = ref("0");

const editDialogTitle = computed(() => {
  if (editMode.value === "custom") return "自定义投保须知";
  return "编辑投保须知";
});

const isEditMode = computed(() => editMode.value === "edit");

function normalizeText(content: unknown) {
  return String(content ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(" ");
}

function updateFieldsFromList() {
  // 无需额外标识,列表数据由后端管理
}

function getFromValue() {
  return {
    dataConfig: { ...formData },
    noticeList: noticeList.value,
  };
}

function getValue(key: string) {
  if (key === "dataConfig") return { ...formData };
  if (key === "noticeList") return noticeList.value;
  return null;
}

function setValue(key: string, value: any) {
  if (key === "dataConfig" && value && typeof value === "object") {
    Object.assign(formData, value);
    return;
  }
  if (key === "noticeList" && Array.isArray(value)) {
    noticeList.value = value;
  }
}

function setDisabledAll(disabled = true) {
  disabledAll.value = disabled;
}

async function validate() {
  if (!formRef.value) return true;
  try {
    await formRef.value.validate();
    return true;
  } catch {
    return false;
  }
}

function setFormValue(value: any) {
  if (!value || typeof value !== "object") return;
  if (value.dataConfig && typeof value.dataConfig === "object") {
    Object.assign(formData, value.dataConfig);
  }
}

/**
 * 查询已关联投保须知列表并刷新本地列表
 * 延用关联特约接口 qryRefPlanAndSpecList,以 cCommodityNo 作为业务单号
 */
async function refreshNoticeList() {
  const bizNo = effectiveBizNo.value;
  if (!bizNo) {
    noticeList.value = [];
    return;
  }
  try {
    const listRes = await qryRefPlanAndSpecList({
      CPlanNo: bizNo,
      CSpecialCode: "",
      CSpecialName: "",
      pageNo: 1,
      pageSize: 9999,
    });
    const refList =
      listRes?.code === 200
        ? listRes.data?.result || listRes.data?.data || []
        : [];
    const backendItems: NoticeListItem[] = refList
      .map((item: any) => {
        const isCustom = String(item?.cSource ?? "0") === "1";
        return {
          cSpecNo: String(item?.cSpecialCode ?? "").trim(),
          cSpecContent: normalizeText(item?.cSpecialContent),
          source: (isCustom ? "1" : "0") as NoticeSource,
          cPkId: String(item?.cPkId ?? "").trim(),
          cIfEdit: String(item?.cIfEdit ?? "0"),
          cIfMust: String(item?.cIfMust ?? "0"),
          cIfFix: String(item?.cIfFix ?? "0"),
          cStatus: String(item?.cStatus ?? "0"),
        };
      })
      .filter((item) => item.cSpecNo || item.cSpecContent);
    noticeList.value = backendItems;
    updateFieldsFromList();
  } catch (e) {
    console.error("查询已关联投保须知列表失败:", e);
  }
}

/** 新增投保须知 - 暂用自定义弹窗输入 */
function handleAddNotice() {
  const bizNo = effectiveBizNo.value;
  if (!bizNo) {
    ElMessage.error("商品编号为空,请先保存商品");
    return;
  }
  openEditDialog("custom");
}

function openEditDialog(mode: "custom" | "edit", row?: NoticeListItem, index = -1) {
  editMode.value = mode;
  editIndex.value = index;
  editForm.cSpecNo = row?.cSpecNo || "";
  editForm.cSpecContent = row?.cSpecContent || "";
  editForm.source = row?.source || "1";
  editForm.cPkId = row?.cPkId || "";
  editForm.cIfEdit = row?.cIfEdit || "0";
  editForm.cIfMust = row?.cIfMust || "0";
  editForm.cIfFix = row?.cIfFix || "0";
  editForm.cStatus = row?.cStatus || "0";
  editFormCIfEdit.value = editForm.cIfEdit;
  editFormCIfMust.value = editForm.cIfMust;
  editFormCIfFix.value = editForm.cIfFix;
  editDialogVisible.value = true;
}

async function saveEditDialog() {
  // 编辑已有投保须知
  if (isEditMode.value) {
    if (!editForm.cPkId) {
      // 本地未保存的自定义投保须知(无主键),直接本地更新
      const content = normalizeText(editForm.cSpecContent);
      if (!content) {
        ElMessage.error("请输入投保须知内容");
        return;
      }
      if (editIndex.value > -1) {
        noticeList.value.splice(editIndex.value, 1, {
          cSpecNo: editForm.cSpecNo,
          cSpecContent: content,
          source: editForm.source,
          cPkId: editForm.cPkId,
          cIfEdit: editFormCIfEdit.value,
          cIfMust: editFormCIfMust.value,
          cIfFix: editFormCIfFix.value,
          cStatus: editForm.cStatus,
        });
      }
      updateFieldsFromList();
      editDialogVisible.value = false;
      return;
    }

    // 有主键:调用 editPlanSpecStatus 修改状态
    const reqParam = {
      CPkId: editForm.cPkId,
      CIfEdit: editFormCIfEdit.value,
      CIfMust: editFormCIfMust.value,
      CIfFix: editFormCIfFix.value,
    };

    editSubmitLoading.value = true;
    try {
      const res = await editPlanSpecStatus(reqParam);
      if (res?.code === 200) {
        ElMessage.success("修改成功");
        editDialogVisible.value = false;
        await refreshNoticeList();
      } else {
        ElMessage.error(res?.msg || res?.data?.message || "修改失败");
      }
    } catch (e) {
      ElMessage.error("修改失败");
    } finally {
      editSubmitLoading.value = false;
    }
    return;
  }

  // 自定义投保须知新增:调用 saveCustomPlanSpec 接口保存到后端
  const content = normalizeText(editForm.cSpecContent);
  if (!content) {
    ElMessage.error("请输入投保须知内容");
    return;
  }

  const bizNo = effectiveBizNo.value;
  if (!bizNo) {
    ElMessage.error("商品编号为空,请先保存商品");
    return;
  }

  editSubmitLoading.value = true;
  try {
    const userInfo = JSON.parse(sessionStorage.getItem("user") || "{}");
    const reqParam = {
      CPlanNo: bizNo,
      CPlanCn: "",
      CSpecialContent: content,
      userId: userInfo.opCde || "",
    };

    const res = await saveCustomPlanSpec(reqParam);
    if (res?.code === 200) {
      ElMessage.success("保存成功");
      editDialogVisible.value = false;
      await refreshNoticeList();
    } else {
      ElMessage.error(res?.msg || res?.data?.message || "保存失败");
    }
  } catch (e) {
    ElMessage.error("保存失败");
  } finally {
    editSubmitLoading.value = false;
  }
}

/**
 * 删除投保须知
 * - 已保存到后端的(有主键):调用 unAssociationPlanSpec 取关
 * - 本地未保存的:本地删除
 */
function handleDelete(index: number) {
  const item = noticeList.value[index];
  if (!item) return;

  ElMessageBox.confirm("是否确认删除该投保须知?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    if (item.cPkId) {
      try {
        const res = await unAssociationPlanSpec([item.cPkId]);
        if (res?.code === 200) {
          ElMessage.success("删除成功");
          await refreshNoticeList();
        } else {
          ElMessage.error(res?.msg || "删除失败");
        }
      } catch (e) {
        ElMessage.error("删除失败");
      }
      return;
    }
    // 本地删除
    noticeList.value.splice(index, 1);
    updateFieldsFromList();
  });
}

/**
 * 保存投保须知配置
 * @param ruleCode 业务单号(商品编号),不传则使用 effectiveBizNo
 * @returns 是否保存成功
 */
function saveRuleConfig(ruleCode?: string): Promise<boolean> {
  const bizNo = ruleCode || effectiveBizNo.value;
  if (!bizNo) {
    return Promise.resolve(false);
  }
  // 投保须知数据由组件内部管理(新增/删除时即时调用后端接口)
  // 此处仅刷新列表确保数据同步
  return refreshNoticeList().then(() => true);
}

onMounted(() => {
  const m = param.editType;
  if (m !== "add" && m) {
    refreshNoticeList();
    if (m !== "edit" && m !== "copy") {
      setDisabledAll();
    }
  }
});

defineExpose({
  getFromValue,
  getValue,
  setValue,
  setDisabledAll,
  setFormValue,
  validate,
  refreshNoticeList,
  saveRuleConfig,
});
</script>

<style scoped lang="scss">
.insurance-notice-panel {
  background: #ffffff;
  padding: 16px 20px;
  border-radius: 4px;
  min-height: calc(100vh - 200px);

  /* ===== 顶部操作区 ===== */
  .data-config-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;

    .header-back-title {
      display: flex;
      align-items: center;
      gap: 12px;

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: var(--el-color-primary);
        font-size: 14px;
        cursor: pointer;
        user-select: none;

        &:hover {
          opacity: 0.85;
        }

        .el-icon {
          font-size: 14px;
        }
      }

      .divider-line {
        width: 1px;
        height: 14px;
        background: var(--el-border-color);
      }

      .config-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .header-actions {
      :deep(.el-button) {
        min-width: 80px;
      }
    }
  }

  /* ===== 资料配置表单 ===== */
  .data-config-form {
    margin-top: 4px;

    :deep(.el-form-item) {
      margin-bottom: 18px;
    }

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: var(--el-text-color-regular);
    }

    .format-select-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;

      // el-select 组件根节点需用 :deep 命中,配合 flex 撑满剩余宽度
      :deep(.el-select) {
        flex: 1 1 0%;
        min-width: 0;
        width: auto;
      }

      .format-tip {
        flex: 0 0 auto;
        color: #c0c4cc;
        cursor: help;
        font-size: 14px;
        transition: color 0.2s;

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }

    .file-upload-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;

      .file-name-text {
        flex: 1;
        min-width: 0;
        padding: 0 12px;
        height: 32px;
        line-height: 32px;
        color: var(--el-text-color-regular);
        background: #f5f7fa;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 4px;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  /* ===== 文件预览区 ===== */
  .file-preview-section {
    margin-top: 8px;

    .preview-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);

      .preview-title {
        font-size: 14px;
        color: var(--el-text-color-primary);
        font-weight: 500;
      }

      .preview-actions {
        display: flex;
        gap: 12px;

        .action-icon {
          font-size: 16px;
          color: var(--el-text-color-secondary);
          cursor: pointer;
          transition: color 0.2s;

          &:hover {
            color: var(--el-color-primary);
          }

          &.danger:hover {
            color: var(--el-color-danger);
          }
        }
      }
    }

    .preview-content {
      margin-top: 12px;
      min-height: 460px;
      background: #ffffff;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;

      .preview-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        color: var(--el-text-color-placeholder);

        .empty-icon {
          font-size: 64px;
          color: #dcdfe6;
        }
      }

      .preview-pdf-placeholder {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 24px 32px;
        border-radius: 6px;
        background: #fafbfc;
        border: 1px dashed var(--el-border-color);

        .pdf-icon {
          font-size: 48px;
          color: var(--el-color-danger);
        }

        .pdf-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;

          .pdf-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--el-text-color-primary);
          }

          .pdf-tip {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }
    }
  }
}

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
<!-- 免责信息组件 - 用于商品配置，参照关联特约组件开发，延用关联特约接口 -->
<template>
  <div class="disclaimer-info-panel componenFrom">
    <el-card shadow="hover" class="disclaimer-card">
      <template #header>
        <el-row justify="space-between">
          <el-col :span="4">
            <span class="card-title-style">免责信息</span>
          </el-col>
          <el-col :span="20" style="text-align: right" v-if="!disabledAll">
            <el-button type="success" @click="handleAddDisclaimer">新增免责信息</el-button>
            <el-button type="success" @click="openEditDialog('custom')">自定义免责信息</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table :data="disclaimerList" max-height="400px" border class="disclaimer-table" empty-text="暂无免责信息">
        <el-table-column label="序号" width="70" align="center">
          <template #default="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="cSpecContent" label="免责内容" min-width="420" align="left" />
        <el-table-column label="来源" width="100" align="center">
          <template #default="{ row }">
            {{ row.source === "0" ? "关联" : "自定义" }}
          </template>
        </el-table-column>
        <el-table-column v-if="!disabledAll" label="操作" width="200" align="center" fixed="right">
          <template #default="{ row, $index }">
            <el-button link type="primary" @click="openEditDialog('edit', row, $index)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="editDialogVisible"
      :title="editDialogTitle"
      width="680px"
      destroy-on-close
    >
      <el-form label-width="120px">
        <el-form-item label="免责内容" required>
          <el-input
            v-model="editForm.cSpecContent"
            type="textarea"
            :rows="6"
            maxlength="4000"
            show-word-limit
            placeholder="请输入免责内容"
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
import { ElMessage, ElMessageBox } from "element-plus";
import { useRoute } from "vue-router";
import { descryptParameter } from "@/utils/encipher";
import {
  qryRefPlanAndSpecList,
  unAssociationPlanSpec,
  editPlanSpecStatus,
  saveCustomPlanSpec,
} from "@/api/prod";

type DisclaimerSource = "0" | "1";

interface DisclaimerListItem {
  cSpecNo: string;
  cSpecContent: string;
  source: DisclaimerSource;
  cPkId?: string;
  cIfEdit?: string;
  cIfMust?: string;
  cIfFix?: string;
  cStatus?: string;
}

const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}");

/** 生效业务单号: 商品页用 cCommodityNo */
const effectiveBizNo = computed(() => param.cCommodityNo || "");

const disabledAll = ref(false);
const disclaimerList = ref<DisclaimerListItem[]>([]);
const editDialogVisible = ref(false);
const editMode = ref<"custom" | "edit">("custom");
const editIndex = ref(-1);
const editSubmitLoading = ref(false);
const editForm = reactive<DisclaimerListItem>({
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
  if (editMode.value === "custom") return "自定义免责信息";
  return "编辑免责信息";
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
  // 无需额外标识，列表数据由后端管理
}

function getFromValue() {
  return {
    disclaimerList: disclaimerList.value,
  };
}

function getValue(key: string) {
  if (key === "disclaimerList") return disclaimerList.value;
  return null;
}

function setValue(key: string, value: any) {
  if (key === "disclaimerList" && Array.isArray(value)) {
    disclaimerList.value = value;
  }
}

function setDisabledAll(disabled = true) {
  disabledAll.value = disabled;
}

function validate() {
  return Promise.resolve(true);
}

function setFormValue(value: any) {
  if (!value || typeof value !== "object") return;
  // 列表数据由 refreshDisclaimerList 从后端获取
}

/**
 * 查询已关联免责信息列表并刷新本地列表
 * 延用关联特约接口 qryRefPlanAndSpecList，以 cCommodityNo 作为业务单号
 */
async function refreshDisclaimerList() {
  const bizNo = effectiveBizNo.value;
  if (!bizNo) {
    disclaimerList.value = [];
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
    const backendItems: DisclaimerListItem[] = refList
      .map((item: any) => {
        const isCustom = String(item?.cSource ?? "0") === "1";
        return {
          cSpecNo: String(item?.cSpecialCode ?? "").trim(),
          cSpecContent: normalizeText(item?.cSpecialContent),
          source: (isCustom ? "1" : "0") as DisclaimerSource,
          cPkId: String(item?.cPkId ?? "").trim(),
          cIfEdit: String(item?.cIfEdit ?? "0"),
          cIfMust: String(item?.cIfMust ?? "0"),
          cIfFix: String(item?.cIfFix ?? "0"),
          cStatus: String(item?.cStatus ?? "0"),
        };
      })
      .filter((item) => item.cSpecNo || item.cSpecContent);
    disclaimerList.value = backendItems;
    updateFieldsFromList();
  } catch (e) {
    console.error("查询已关联免责信息列表失败:", e);
  }
}

/** 新增免责信息 - 暂用自定义弹窗输入 */
function handleAddDisclaimer() {
  const bizNo = effectiveBizNo.value;
  if (!bizNo) {
    ElMessage.error("商品编号为空，请先保存商品");
    return;
  }
  openEditDialog("custom");
}

function openEditDialog(mode: "custom" | "edit", row?: DisclaimerListItem, index = -1) {
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
  // 编辑已有免责信息
  if (isEditMode.value) {
    if (!editForm.cPkId) {
      // 本地未保存的自定义免责信息（无主键），直接本地更新
      const content = normalizeText(editForm.cSpecContent);
      if (!content) {
        ElMessage.error("请输入免责内容");
        return;
      }
      if (editIndex.value > -1) {
        disclaimerList.value.splice(editIndex.value, 1, {
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

    // 有主键：调用 editPlanSpecStatus 修改状态
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
        await refreshDisclaimerList();
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

  // 自定义免责信息新增：调用 saveCustomPlanSpec 接口保存到后端
  const content = normalizeText(editForm.cSpecContent);
  if (!content) {
    ElMessage.error("请输入免责内容");
    return;
  }

  const bizNo = effectiveBizNo.value;
  if (!bizNo) {
    ElMessage.error("商品编号为空，请先保存商品");
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
      await refreshDisclaimerList();
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
 * 删除免责信息
 * - 已保存到后端的（有主键）：调用 unAssociationPlanSpec 取关
 * - 本地未保存的：本地删除
 */
function handleDelete(index: number) {
  const item = disclaimerList.value[index];
  if (!item) return;

  ElMessageBox.confirm("是否确认删除该免责信息？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    if (item.cPkId) {
      try {
        const res = await unAssociationPlanSpec([item.cPkId]);
        if (res?.code === 200) {
          ElMessage.success("删除成功");
          await refreshDisclaimerList();
        } else {
          ElMessage.error(res?.msg || "删除失败");
        }
      } catch (e) {
        ElMessage.error("删除失败");
      }
      return;
    }
    // 本地删除
    disclaimerList.value.splice(index, 1);
    updateFieldsFromList();
  });
}

/**
 * 保存免责信息配置
 * @param ruleCode 业务单号(商品编号)，不传则使用 effectiveBizNo
 * @returns 是否保存成功
 */
function saveRuleConfig(ruleCode?: string): Promise<boolean> {
  const bizNo = ruleCode || effectiveBizNo.value;
  if (!bizNo) {
    return Promise.resolve(false);
  }
  // 免责信息数据由组件内部管理（新增/删除时即时调用后端接口）
  // 此处仅刷新列表确保数据同步
  return refreshDisclaimerList().then(() => true);
}

onMounted(() => {
  const m = param.editType;
  if (m !== "add" && m) {
    refreshDisclaimerList();
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
  refreshDisclaimerList,
  saveRuleConfig,
});
</script>

<style scoped lang="scss">
.disclaimer-info-panel {
  .disclaimer-card {
    .card-title-style {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .disclaimer-table {
    width: 100%;
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

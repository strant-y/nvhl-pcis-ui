<template>
  <div class="health-declaration-panel">
    <div class="toolbar" v-if="!disabledAll">
      <el-button type="success" @click="handleAddHealth">新增健康告知</el-button>
      <el-button type="success" @click="openEditDialog('custom')">自定义健康告知</el-button>
    </div>

    <el-table :data="healthList" max-height="400px" border class="health-table" empty-text="暂无健康告知信息">
      <el-table-column label="序号" width="70" align="center">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="cHealthContent" label="健康告知内容" min-width="420" align="left" />
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

    <el-dialog
      v-model="editDialogVisible"
      :title="editDialogTitle"
      width="680px"
      destroy-on-close
    >
      <el-form label-width="120px">
        <el-form-item label="健康告知内容" required>
          <el-input
            v-model="editForm.cHealthContent"
            type="textarea"
            :rows="6"
            maxlength="4000"
            show-word-limit
            placeholder="请输入健康告知内容"
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

type HealthSource = "0" | "1";

interface HealthListItem {
  cHealthNo: string;
  cHealthContent: string;
  source: HealthSource;
  cPkId?: string;
  cIfEdit?: string;
  cIfMust?: string;
  cStatus?: string;
}

const formModel = reactive({
  cHealthMrk: "0",
  cProdNo: "",
  cPlanNo: "",
  cPlanCn: "",
});

const disabledAll = ref(false);
const healthList = ref<HealthListItem[]>([]);
const editDialogVisible = ref(false);
const editMode = ref<"custom" | "edit">("custom");
const editIndex = ref(-1);
const editSubmitLoading = ref(false);
const editForm = reactive<HealthListItem>({
  cHealthNo: "",
  cHealthContent: "",
  source: "1",
  cPkId: "",
  cIfEdit: "0",
  cIfMust: "0",
  cStatus: "0",
});

/** 编辑弹窗中状态勾选项 */
const editFormCIfEdit = ref("0");
const editFormCIfMust = ref("0");

const editDialogTitle = computed(() => {
  if (editMode.value === "custom") return "自定义健康告知";
  return "编辑健康告知";
});

/** 当前是否为编辑已有健康告知（edit 模式） */
const isEditMode = computed(() => editMode.value === "edit");

function normalizeText(content: unknown) {
  return String(content ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(" ");
}

/** 根据 healthList 更新 cHealthMrk 标识 */
function updateFieldsFromList() {
  formModel.cHealthMrk = healthList.value.length > 0 ? "1" : "0";
}

function getFromValue() {
  return {
    cHealthMrk: formModel.cHealthMrk,
  };
}

function getValue(key: string) {
  return (formModel as Record<string, any>)[key];
}

function setValue(key: string, value: any) {
  (formModel as Record<string, any>)[key] = value ?? "";
}

function setDisabledAll(disabled = true) {
  disabledAll.value = disabled;
}

function validate() {
  return Promise.resolve(true);
}

function setFormValue(value: any) {
  if (!value || typeof value !== "object") {
    return;
  }

  formModel.cHealthMrk = String(value.cHealthMrk ?? formModel.cHealthMrk ?? "0");
  formModel.cProdNo = String(value.cProdNo ?? value.CProdNo ?? formModel.cProdNo ?? "");
  formModel.cPlanNo = String(value.cPlanNo ?? value.CPlanNo ?? formModel.cPlanNo ?? "");
  formModel.cPlanCn = String(value.cPlanCn ?? value.CPlanCn ?? formModel.cPlanCn ?? "");
}

/**
 * 查询已关联方案健康告知列表并刷新本地列表
 */
async function refreshHealthList() {
  if (!formModel.cPlanNo) {
    healthList.value = [];
    updateFieldsFromList();
    return;
  }
  // TODO: 替换为实际的健康告知查询接口
  // try {
  //   const listRes = await qryRefPlanAndHealthList({
  //     CPlanNo: formModel.cPlanNo,
  //     pageNo: 1,
  //     pageSize: 9999,
  //   });
  //   const refList = listRes?.code === 200 ? listRes.data?.result || [] : [];
  //   healthList.value = refList.map(...);
  //   updateFieldsFromList();
  // } catch (e) {
  //   console.error("查询已关联方案健康告知列表失败:", e);
  // }
}

/** 新增健康告知 */
function handleAddHealth() {
  if (!formModel.cPlanNo) {
    ElMessage.error("方案编号为空，请先保存方案");
    return;
  }
  // TODO: 打开新增健康告知弹窗
  // dzmodal.open(AddHealthDeclarationModal, { ... }).then(...)
}

function openEditDialog(mode: "custom" | "edit", row?: HealthListItem, index = -1) {
  editMode.value = mode;
  editIndex.value = index;
  editForm.cHealthNo = row?.cHealthNo || "";
  editForm.cHealthContent = row?.cHealthContent || "";
  editForm.source = row?.source || "1";
  editForm.cPkId = row?.cPkId || "";
  editForm.cIfEdit = row?.cIfEdit || "0";
  editForm.cIfMust = row?.cIfMust || "0";
  editForm.cStatus = row?.cStatus || "0";
  editFormCIfEdit.value = editForm.cIfEdit;
  editFormCIfMust.value = editForm.cIfMust;
  editDialogVisible.value = true;
}

/**
 * 确认编辑
 * - 编辑模式（edit）：修改状态字段
 * - 自定义新增（custom）：保存到后端
 */
async function saveEditDialog() {
  // 编辑已有健康告知
  if (isEditMode.value) {
    if (!editForm.cPkId) {
      // 本地未保存的自定义健康告知（无主键），直接本地更新
      const content = normalizeText(editForm.cHealthContent);
      if (!content) {
        ElMessage.error("请输入健康告知内容");
        return;
      }
      if (editIndex.value > -1) {
        healthList.value.splice(editIndex.value, 1, {
          cHealthNo: editForm.cHealthNo,
          cHealthContent: content,
          source: editForm.source,
          cPkId: editForm.cPkId,
          cIfEdit: editFormCIfEdit.value,
          cIfMust: editFormCIfMust.value,
          cStatus: editForm.cStatus,
        });
      }
      updateFieldsFromList();
      editDialogVisible.value = false;
      return;
    }

    // TODO: 有主键时调用后端接口修改状态
    // const param = { CPkId: editForm.cPkId, CIfEdit: editFormCIfEdit.value, CIfMust: editFormCIfMust.value };
    // const res = await editPlanHealthStatus(param);
    editDialogVisible.value = false;
    await refreshHealthList();
    return;
  }

  // 自定义健康告知新增
  const content = normalizeText(editForm.cHealthContent);
  if (!content) {
    ElMessage.error("请输入健康告知内容");
    return;
  }

  if (!formModel.cPlanNo) {
    ElMessage.error("方案编号为空，请先保存方案");
    return;
  }

  // TODO: 调用后端接口保存自定义健康告知
  // const param = { CPlanNo: formModel.cPlanNo, CPlanCn: formModel.cPlanCn, CHealthContent: content, userId };
  // const res = await saveCustomPlanHealth(param);

  // 暂时本地添加
  editSubmitLoading.value = true;
  try {
    healthList.value.push({
      cHealthNo: "",
      cHealthContent: content,
      source: "1",
      cPkId: "",
      cIfEdit: editFormCIfEdit.value,
      cIfMust: editFormCIfMust.value,
      cStatus: "0",
    });
    updateFieldsFromList();
    ElMessage.success("保存成功");
    editDialogVisible.value = false;
  } finally {
    editSubmitLoading.value = false;
  }
}

/**
 * 删除健康告知
 * - 已保存到后端的（有主键）：调用后端接口删除
 * - 本地未保存的：本地删除
 */
function handleDelete(index: number) {
  const item = healthList.value[index];
  if (!item) {
    return;
  }

  ElMessageBox.confirm("是否确认删除该健康告知？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    if (item.cPkId) {
      // TODO: 调用后端接口删除
      // const res = await unAssociationPlanHealth([item.cPkId]);
      healthList.value.splice(index, 1);
      updateFieldsFromList();
      ElMessage.success("删除成功");
      return;
    }

    // 本地删除
    healthList.value.splice(index, 1);
    updateFieldsFromList();
  });
}

/**
 * 复制模式下，将当前健康告知列表绑定到新方案
 */
async function bindHealthToPlan(newCPlanNo: string, newCPlanCn: string) {
  if (!newCPlanNo) {
    return;
  }

  formModel.cPlanNo = newCPlanNo;
  formModel.cPlanCn = newCPlanCn || formModel.cPlanCn || "";

  if (healthList.value.length === 0) {
    return;
  }

  // TODO: 调用后端接口将健康告知绑定到新方案
  // 暂时保留本地数据，清除旧主键
  healthList.value = healthList.value.map((item) => ({ ...item, cPkId: "" }));
  await refreshHealthList();
}

defineExpose({
  getFromValue,
  getValue,
  setValue,
  setDisabledAll,
  setFormValue,
  validate,
  refreshHealthList,
  bindHealthToPlan,
});
</script>

<style scoped lang="scss">
.health-declaration-panel {
  .toolbar {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-bottom: 12px;
  }

  .health-table {
    width: 100%;
  }
}
</style>

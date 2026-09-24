<template>
  <div class="special-agreement-panel">
    <div class="toolbar" v-if="!disabledAll">
      <el-button type="success" @click="handleRelatedSpecialAgree">关联特约</el-button>
      <el-button type="success" @click="handleAddSpecial">新增特约</el-button>
      <el-button type="success" @click="openEditDialog('custom')">自定义特约</el-button>
    </div>

    <el-table :data="specialList" max-height="400px" border class="special-table" empty-text="暂无特约信息">
      <el-table-column label="序号" width="70" align="center">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="cSpecContent" label="特约内容" min-width="420" align="left" />
      <el-table-column label="来源" width="100" align="center">
        <template #default="{ row }">
          {{ row.source === "0" ? "关联" : "自定义" }}
        </template>
      </el-table-column>
      <el-table-column v-if="!disabledAll" label="操作" width="260" align="center" fixed="right">
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
      <el-form label-width="100px">
        <el-form-item label="特约内容" required>
          <el-input
            v-model="editForm.cSpecContent"
            type="textarea"
            :rows="6"
            maxlength="4000"
            show-word-limit
            placeholder="请输入特约内容"
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
          <el-form-item label="是否固定特约">
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
import { useDzModal } from "@/common/dzmodel/DzModalService";
import {
  qryRefPlanAndSpecList,
  unAssociationPlanSpec,
  editPlanSpecStatus,
  saveCustomPlanSpec,
  associationPlanSpec,
} from "@/api/prod";
import RelatedSpecialAgreeModal from "./RelatedSpecialAgreeModal.vue";
import AddSpecialAgreeModal from "./AddSpecialAgreeModal.vue";

type SpecialSource = "0" | "1";

interface SpecialListItem {
  cSpecNo: string;
  cSpecContent: string;
  source: SpecialSource;
  cPkId?: string;
  cIfEdit?: string;
  cIfMust?: string;
  cIfFix?: string;
  cStatus?: string;
}

const dzmodal = useDzModal();

const formModel = reactive({
  cSpecMrk: "0",
  cProdNo: "",
  cPlanNo: "",
  cPlanCn: "",
});

const disabledAll = ref(false);
const specialList = ref<SpecialListItem[]>([]);
const editDialogVisible = ref(false);
const editMode = ref<"custom" | "edit">("custom");
const editIndex = ref(-1);
const editSubmitLoading = ref(false);
const editForm = reactive<SpecialListItem>({
  cSpecNo: "",
  cSpecContent: "",
  source: "1",
  cPkId: "",
  cIfEdit: "0",
  cIfMust: "0",
  cIfFix: "0",
  cStatus: "0",
});

/** 编辑弹窗中状态勾选项（el-checkbox 需要 ref 类型绑定 true-value/false-value） */
const editFormCIfEdit = ref("0");
const editFormCIfMust = ref("0");
const editFormCIfFix = ref("0");

const editDialogTitle = computed(() => {
  if (editMode.value === "custom") return "自定义特约";
  return "编辑特约";
});

/** 当前是否为编辑已有特约（edit 模式），编辑时特约内容只读，通过 editPlanSpecStatus 修改状态 */
const isEditMode = computed(() => editMode.value === "edit");

function normalizeText(content: unknown) {
  return String(content ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(" ");
}

/** 根据 specialList 更新 cSpecMrk 标识（是否有特约） */
function updateFieldsFromList() {
  formModel.cSpecMrk = specialList.value.length > 0 ? "1" : "0";
}

/** 保存时不再返回 cSpecContent/CSpecNo，特约数据完全由后端关联表管理 */
function getFromValue() {
  return {
    cSpecMrk: formModel.cSpecMrk,
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

  formModel.cSpecMrk = String(value.cSpecMrk ?? formModel.cSpecMrk ?? "0");
  formModel.cProdNo = String(value.cProdNo ?? value.CProdNo ?? formModel.cProdNo ?? "");
  formModel.cPlanNo = String(value.cPlanNo ?? value.CPlanNo ?? formModel.cPlanNo ?? "");
  formModel.cPlanCn = String(value.cPlanCn ?? value.CPlanCn ?? formModel.cPlanCn ?? "");

  // 特约列表由 refreshSpecialList 从后端 qryRefPlanAndSpecList 获取，不从前端字段重建
}

/**
 * 查询已关联方案特约列表并刷新本地列表
 * 完全以后端 qryRefPlanAndSpecList 返回为准，不保留本地未保存的特约
 */
async function refreshSpecialList() {
  if (!formModel.cPlanNo) {
    specialList.value = [];
    updateFieldsFromList();
    return;
  }
  try {
    const listRes = await qryRefPlanAndSpecList({
      CPlanNo: formModel.cPlanNo,
      CSpecialCode: "",
      CSpecialName: "",
      pageNo: 1,
      pageSize: 9999,
    });
    const refList =
      listRes?.code === 200
        ? listRes.data?.result || listRes.data?.data || []
        : [];
    const backendItems: SpecialListItem[] = refList
      .map((item: any) => {
        const isCustom = String(item?.cSource ?? "0") === "1";
        return {
          cSpecNo: String(item?.cSpecialCode ?? "").trim(),
          cSpecContent: normalizeText(item?.cSpecialContent),
          source: (isCustom ? "1" : "0") as SpecialSource,
          cPkId: String(item?.cPkId ?? "").trim(),
          cIfEdit: String(item?.cIfEdit ?? "0"),
          cIfMust: String(item?.cIfMust ?? "0"),
          cIfFix: String(item?.cIfFix ?? "0"),
          cStatus: String(item?.cStatus ?? "0"),
        };
      })
      .filter((item) => item.cSpecNo || item.cSpecContent);
    // 完全以后端返回为准，不保留本地未保存的特约
    specialList.value = backendItems;
    updateFieldsFromList();
  } catch (e) {
    console.error("查询已关联方案特约列表失败:", e);
  }
}

/** 关联特约 - 打开关联特约弹窗，确定时调用 associationPlanSpec 接口保存，成功后回调 qryRefPlanAndSpecList 刷新列表 */
function handleRelatedSpecialAgree() {
  if (!formModel.cProdNo) {
    ElMessage.error("产品号为空，无法查询特约列表");
    return;
  }
  if (!formModel.cPlanNo) {
    ElMessage.error("方案编号为空，请先保存方案");
    return;
  }
  dzmodal
    .open(RelatedSpecialAgreeModal, {
      data: {
        cProdNo: formModel.cProdNo,
        cPlanNo: formModel.cPlanNo,
      },
    })
    .then((res) => {
      if (res.type === "ok") {
        refreshSpecialList();
      }
    });
}

/** 新增特约 - 打开新增特约弹窗，确定时调用 saveAssociationPlanSpec 接口保存，成功后刷新列表回显 */
function handleAddSpecial() {
  if (!formModel.cPlanNo) {
    ElMessage.error("方案编号为空，请先保存方案");
    return;
  }
  dzmodal
    .open(AddSpecialAgreeModal, {
      data: {
        cProdNo: formModel.cProdNo,
        cPlanNo: formModel.cPlanNo,
      },
    })
    .then((res) => {
      if (res.type === "ok") {
        refreshSpecialList();
      }
    });
}

function openEditDialog(mode: "custom" | "edit", row?: SpecialListItem, index = -1) {
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
  // 同步勾选框 ref
  editFormCIfEdit.value = editForm.cIfEdit;
  editFormCIfMust.value = editForm.cIfMust;
  editFormCIfFix.value = editForm.cIfFix;
  editDialogVisible.value = true;
}

/**
 * 确认编辑
 * - 编辑模式（edit）：无论关联还是自定义，统一调用 editPlanSpecStatus 修改状态字段
 * - 自定义新增（custom）：调用 saveCustomPlanSpec 保存到后端
 */
async function saveEditDialog() {
  // 编辑已有特约：统一调用 editPlanSpecStatus 修改状态
  if (isEditMode.value) {
    if (!editForm.cPkId) {
      // 本地未保存的自定义特约（无主键），直接本地更新
      const content = normalizeText(editForm.cSpecContent);
      if (!content) {
        ElMessage.error("请输入特约内容");
        return;
      }
      if (editIndex.value > -1) {
        specialList.value.splice(editIndex.value, 1, {
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
    const param = {
      CPkId: editForm.cPkId,
      CIfEdit: editFormCIfEdit.value,
      CIfMust: editFormCIfMust.value,
      CIfFix: editFormCIfFix.value,
    };

    editSubmitLoading.value = true;
    try {
      const res = await editPlanSpecStatus(param);
      if (res?.code === 200) {
        ElMessage.success("修改成功");
        editDialogVisible.value = false;
        await refreshSpecialList();
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

  // 自定义特约新增：调用 saveCustomPlanSpec 接口持久化到后端
  const content = normalizeText(editForm.cSpecContent);
  if (!content) {
    ElMessage.error("请输入特约内容");
    return;
  }

  if (!formModel.cPlanNo) {
    ElMessage.error("方案编号为空，请先保存方案");
    return;
  }

  editSubmitLoading.value = true;
  try {
    const userInfo = JSON.parse(sessionStorage.getItem("user") || "{}");
    const param = {
      CPlanNo: formModel.cPlanNo,
      CPlanCn: formModel.cPlanCn || "",
      CSpecialContent: content,
      userId: userInfo.opCde || "",
    };

    const res = await saveCustomPlanSpec(param);
    if (res?.code === 200) {
      ElMessage.success("保存成功");
      editDialogVisible.value = false;
      await refreshSpecialList();
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
 * 删除特约
 * - 已保存到后端的特约（有主键）：调用 unAssociationPlanSpec 取关，成功后刷新列表
 * - 本地未保存的自定义特约（无主键）：本地删除
 */
function handleDelete(index: number) {
  const item = specialList.value[index];
  if (!item) {
    return;
  }

  ElMessageBox.confirm("是否确认删除该特约？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    // 已保存到后端的特约（含关联和自定义，有主键）：调用取关接口
    if (item.cPkId) {
      try {
        const res = await unAssociationPlanSpec([item.cPkId]);
        if (res?.code === 200) {
          ElMessage.success("删除成功");
          await refreshSpecialList();
        } else {
          ElMessage.error(res?.msg || "删除失败");
        }
      } catch (e) {
        ElMessage.error("删除失败");
      }
      return;
    }

    // 自定义特约：本地删除
    specialList.value.splice(index, 1);
    updateFieldsFromList();
  });
}

/**
 * 复制模式下，将当前特约列表绑定到新方案
 * 根据来源分别调用：
 * - 关联特约（source="0"）：有特约代码 cSpecNo，调用 associationPlanSpec 批量关联到新方案
 * - 自定义特约（source="1"）：无特约代码，调用 saveCustomPlanSpec 逐条保存到新方案
 * 完成后刷新列表获取新主键
 */
async function bindSpecialToPlan(newCPlanNo: string, newCPlanCn: string) {
  if (!newCPlanNo) {
    return;
  }

  // 更新方案编号和名称
  formModel.cPlanNo = newCPlanNo;
  formModel.cPlanCn = newCPlanCn || formModel.cPlanCn || "";

  // 无特约数据，无需绑定
  if (specialList.value.length === 0) {
    return;
  }

  const userInfo = JSON.parse(sessionStorage.getItem("user") || "{}");
  const userId = userInfo.opCde || "";

  // 按来源分类：source="0" 为关联特约，source="1" 为自定义特约
  const templateItems = specialList.value.filter(
    (item) => item.source === "0" && item.cSpecNo
  );
  const customItems = specialList.value.filter(
    (item) => item.source === "1"
  );

  // 关联特约：调用 associationPlanSpec 批量关联到新方案
  if (templateItems.length > 0) {
    const webPlanSpecialAgreementList = templateItems.map((item) => ({
      cSpecialCode: item.cSpecNo,
      cSpecialName: "",
      cSpecialContent: item.cSpecContent,
      cIfEdit: item.cIfEdit || "0",
      cIfMust: item.cIfMust || "0",
      cIfFix: item.cIfFix || "0",
      cStatus: "0",
    }));
    try {
      await associationPlanSpec({
        CPlanNo: newCPlanNo,
        userId,
        webPlanSpecialAgreementList,
      });
    } catch (e) {
      console.error("复制-关联特约绑定失败:", e);
    }
  }

  // 自定义特约：调用 saveCustomPlanSpec 逐条保存到新方案
  for (const item of customItems) {
    try {
      await saveCustomPlanSpec({
        CPlanNo: newCPlanNo,
        CPlanCn: formModel.cPlanCn,
        CSpecialContent: item.cSpecContent,
        userId,
      });
    } catch (e) {
      console.error("复制-自定义特约绑定失败:", e);
    }
  }

  // 清除旧主键，从后端刷新获取新主键
  specialList.value = specialList.value.map((item) => ({ ...item, cPkId: "" }));
  await refreshSpecialList();
}

defineExpose({
  getFromValue,
  getValue,
  setValue,
  setDisabledAll,
  setFormValue,
  validate,
  refreshSpecialList,
  bindSpecialToPlan,
});
</script>

<style scoped lang="scss">
.special-agreement-panel {
  .toolbar {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-bottom: 12px;
  }

  .special-table {
    width: 100%;
  }
}
</style>

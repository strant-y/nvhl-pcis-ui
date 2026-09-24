<!-- 健康告知组件 - 用于商品配置，参考 InsuranceRules.vue 接口模式 -->
<template>
  <div class="componenFrom">
    <el-card shadow="hover" class="health-card">
      <template #header>
        <el-row justify="space-between">
          <el-col :span="4">
            <span class="card-title-style">健康告知</span>
          </el-col>
          <el-col :span="20" style="text-align: right">
            <el-button v-if="!isDisabled" type="success" @click="openAddDialog">
              <el-icon><Plus /></el-icon>
              新增健康告知
            </el-button>
          </el-col>
        </el-row>
      </template>

      <el-table :data="healthList" max-height="400px" border class="health-table" empty-text="暂无健康告知信息">
        <el-table-column label="序号" width="70" align="center">
          <template #default="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="cHealthContent" label="健康告知内容" min-width="420" align="left" />
        <el-table-column label="是否可编辑" width="120" align="center">
          <template #default="{ row }">
            {{ row.cIfEdit === "1" ? "是" : "否" }}
          </template>
        </el-table-column>
        <el-table-column label="是否必选" width="120" align="center">
          <template #default="{ row }">
            {{ row.cIfMust === "1" ? "是" : "否" }}
          </template>
        </el-table-column>
        <el-table-column v-if="!isDisabled" label="操作" width="150" align="center" fixed="right">
          <template #default="{ row, $index }">
            <el-button link type="primary" @click="openEditDialog(row, $index)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑健康告知弹窗 -->
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
          />
        </el-form-item>
        <el-form-item label="是否可编辑">
          <el-checkbox v-model="editFormCIfEdit" true-value="1" false-value="0" />
        </el-form-item>
        <el-form-item label="是否必选">
          <el-checkbox v-model="editFormCIfMust" true-value="1" false-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editSubmitLoading" @click="saveEditDialog">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, inject, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import { idxParamKey, IdxParamProps, useIdxParam } from "@/views/pcis/support/useIdxParam";
import { useRoute } from "vue-router";
import { descryptParameter } from "@/utils/encipher";
import { saveRuleFactorConfig, queryRuleFactorConfig } from "@/api/prod";

interface HealthItem {
  cPkId: string;
  cHealthContent: string;
  cIfEdit: string;
  cIfMust: string;
  cSortingNo: number;
}

const props = defineProps({
  /** 业务单号(商品页=cCommodityNo值); 为空时回退读取路由query中的cCommodityNo(向后兼容) */
  bizNo: { type: String, default: "" },
  /** 页面模式 add/edit/copy/view/handle...; 为空时回退读取路由query中的editType */
  mode: { type: String, default: "" },
});

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}");

/** 生效业务单号: 优先 props.bizNo, 回退路由 query 的 cCommodityNo */
const effectiveBizNo = computed(() => props.bizNo || param.cCommodityNo || "");
/** 生效页面模式: 优先 props.mode, 回退路由 query 的 editType */
const effectiveMode = computed(() => props.mode || param.editType || "");

const isDisabled = ref(false);
const healthList = ref<HealthItem[]>([]);
const editDialogVisible = ref(false);
const editMode = ref<"add" | "edit">("add");
const editIndex = ref(-1);
const editSubmitLoading = ref(false);

const editForm = reactive<HealthItem>({
  cPkId: "",
  cHealthContent: "",
  cIfEdit: "0",
  cIfMust: "0",
  cSortingNo: 0,
});

const editFormCIfEdit = ref("0");
const editFormCIfMust = ref("0");

const editDialogTitle = computed(() => {
  return editMode.value === "add" ? "新增健康告知" : "编辑健康告知";
});

function normalizeText(content: unknown) {
  return String(content ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(" ");
}

/** 查询健康告知配置(规则要素配置接口) */
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
          healthList.value = [...data]
            .sort((a, b) => (a.cSortingNo || 0) - (b.cSortingNo || 0))
            .map((item: any) => ({
              cPkId: item.cFactorKey || "",
              cHealthContent: item.cFactorDefault || "",
              cIfEdit: item.cIfEdit || "0",
              cIfMust: item.cIfMust || "0",
              cSortingNo: item.cSortingNo || 0,
            }));
        }
      } else {
        ElMessage.error(msg || res.message);
      }
    })
    .finally(() => {});
}

/** 保存健康告知配置(规则要素配置接口) */
function saveRuleConfig(ruleCode?: string): Promise<boolean> {
  const cRuleCode = ruleCode || effectiveBizNo.value;
  if (!cRuleCode) {
    return Promise.resolve(false);
  }
  const factorConfigs = healthList.value.map((item, index) => ({
    cFactorKey: item.cPkId || "",
    cGroup: "",
    cSortingNo: index + 1,
    cExpand: "",
    cShowLocation: "",
    cTableWidth: "",
    cSysConfig: "",
    cFactorDefault: item.cHealthContent,
    cFactorJson: JSON.stringify({
      cIfEdit: item.cIfEdit,
      cIfMust: item.cIfMust,
    }),
  }));
  return saveRuleFactorConfig({ cRuleCode, factorConfigs }).then((res) => {
    const { code } = res;
    if (code === 200 || code === "0") {
      return true;
    }
    ElMessage.error(res.msg || res.message || "健康告知保存失败");
    return false;
  });
}

function openAddDialog() {
  editMode.value = "add";
  editIndex.value = -1;
  editForm.cPkId = "";
  editForm.cHealthContent = "";
  editForm.cIfEdit = "0";
  editForm.cIfMust = "0";
  editForm.cSortingNo = healthList.value.length + 1;
  editFormCIfEdit.value = "0";
  editFormCIfMust.value = "0";
  editDialogVisible.value = true;
}

function openEditDialog(row: HealthItem, index: number) {
  editMode.value = "edit";
  editIndex.value = index;
  editForm.cPkId = row.cPkId;
  editForm.cHealthContent = row.cHealthContent;
  editForm.cIfEdit = row.cIfEdit;
  editForm.cIfMust = row.cIfMust;
  editForm.cSortingNo = row.cSortingNo;
  editFormCIfEdit.value = row.cIfEdit;
  editFormCIfMust.value = row.cIfMust;
  editDialogVisible.value = true;
}

async function saveEditDialog() {
  const content = normalizeText(editForm.cHealthContent);
  if (!content) {
    ElMessage.error("请输入健康告知内容");
    return;
  }

  if (editMode.value === "add") {
    healthList.value.push({
      cPkId: "",
      cHealthContent: content,
      cIfEdit: editFormCIfEdit.value,
      cIfMust: editFormCIfMust.value,
      cSortingNo: healthList.value.length + 1,
    });
  } else {
    if (editIndex.value > -1) {
      healthList.value.splice(editIndex.value, 1, {
        cPkId: editForm.cPkId,
        cHealthContent: content,
        cIfEdit: editFormCIfEdit.value,
        cIfMust: editFormCIfMust.value,
        cSortingNo: editForm.cSortingNo,
      });
    }
  }

  // 保存到后端
  const cRuleCode = effectiveBizNo.value;
  if (cRuleCode) {
    editSubmitLoading.value = true;
    try {
      const ok = await saveRuleConfig(cRuleCode);
      if (ok) {
        ElMessage.success("健康告知保存成功");
        editDialogVisible.value = false;
      }
    } finally {
      editSubmitLoading.value = false;
    }
  } else {
    ElMessage.success("保存成功");
    editDialogVisible.value = false;
  }
}

function handleDelete(index: number) {
  const item = healthList.value[index];
  if (!item) return;

  ElMessageBox.confirm("是否确认删除该健康告知？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    healthList.value.splice(index, 1);
    // 重新排序
    healthList.value.forEach((it, i) => {
      it.cSortingNo = i + 1;
    });
    // 保存到后端
    const cRuleCode = effectiveBizNo.value;
    if (cRuleCode) {
      const ok = await saveRuleConfig(cRuleCode);
      if (ok) {
        ElMessage.success("删除成功");
      }
    } else {
      ElMessage.success("删除成功");
    }
  });
}

// ============= defineExpose 契约方法 =============

function getFromValue() {
  return {
    healthItems: healthList.value,
  };
}

function setFormValue(value: any) {
  if (value && value.healthItems) {
    healthList.value = value.healthItems;
  } else if (Array.isArray(value)) {
    healthList.value = value;
  }
}

function validate() {
  return Promise.resolve(true);
}

function setValue(key: string, value: any) {
  if (key === "healthItems") {
    healthList.value = value;
  }
}

function getValue(key: string) {
  if (key === "healthItems") {
    return healthList.value;
  }
  return null;
}

function setDisabledAll() {
  isDisabled.value = true;
}

onMounted(() => {
  const m = effectiveMode.value;
  if (m !== "add" && m) {
    handleQuery();
    if (m !== "edit" && m !== "copy") {
      setDisabledAll();
    }
  }
});

// 业务单号异步到达时补充加载
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

<style scoped lang="scss">
.componenFrom {
  .health-card {
    .card-title-style {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .health-table {
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

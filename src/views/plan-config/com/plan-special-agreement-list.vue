<template>
  <div class="special-agreement-panel">
    <div class="toolbar" v-if="!disabledAll">
      <el-button type="primary" @click="handleAddTemplate">模板特约</el-button>
      <el-button type="success" @click="openEditDialog('custom')">自定义特约</el-button>
    </div>

    <el-table :data="specialList" border class="special-table" empty-text="暂无特约信息">
      <el-table-column label="序号" width="70" align="center">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="cSpecContent" label="特约内容" min-width="420" align="left" />
      <el-table-column label="来源" width="100" align="center">
        <template #default="{ row }">
          {{ row.source === "template" ? "模板" : "自定义" }}
        </template>
      </el-table-column>
      <el-table-column v-if="!disabledAll" label="操作" width="260" align="center" fixed="right">
        <template #default="{ row, $index }">
          <el-button link type="primary" @click="openEditDialog('edit', row, $index)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete($index)">删除</el-button>
          <el-button link type="primary" :disabled="$index === 0" @click="moveItem($index, -1)">上移</el-button>
          <el-button
            link
            type="primary"
            :disabled="$index === specialList.length - 1"
            @click="moveItem($index, 1)"
          >
            下移
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="editDialogVisible"
      :title="editDialogTitle"
      width="680px"
      destroy-on-close
    >
      <el-form label-width="90px">
        <el-form-item label="特约内容" required>
          <el-input
            v-model="editForm.cSpecContent"
            type="textarea"
            :rows="6"
            maxlength="4000"
            show-word-limit
            placeholder="请输入特约内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEditDialog">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import PrdFixSpec from "./prd-fix-spec.vue";
import { codeListViewStore } from "@/store";
import { idxParamKey, IdxParamProps, useIdxParam } from "@/views/pcis/support/useIdxParam";

type SpecialSource = "template" | "custom";

interface SpecialListItem {
  cSpecNo: string;
  cSpecContent: string;
  source: SpecialSource;
}

interface TemplateItem {
  cSpecNo: string;
  cNmeCn: string;
  cNmeEn?: string;
}

const dzmodal = useDzModal();
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);

const formModel = reactive({
  cSpecMrk: "0",
  cSpecContent: "",
  CSpecNo: "",
  cProdNo: "",
});

const disabledAll = ref(false);
const specialList = ref<SpecialListItem[]>([]);
const editDialogVisible = ref(false);
const editMode = ref<"custom" | "edit">("custom");
const editIndex = ref(-1);
const editForm = reactive<SpecialListItem>({
  cSpecNo: "",
  cSpecContent: "",
  source: "custom",
});

const templateCache = new Map<string, TemplateItem[]>();
const templateMap = ref<Record<string, TemplateItem>>({});

const editDialogTitle = computed(() => (editMode.value === "custom" ? "新增特约" : "编辑特约"));

function normalizeText(content: unknown) {
  return String(content ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(" ");
}

function parseCodes(value: unknown) {
  return String(value ?? "")
    .split("$$")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseContentLines(value: unknown) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/^\s*\d+\.\s*/, "").trim())
    .filter(Boolean);
}

function updateFieldsFromList() {
  formModel.cSpecMrk = specialList.value.length > 0 ? "1" : "0";
  formModel.CSpecNo = specialList.value
    .filter((item) => item.source === "template" && item.cSpecNo)
    .map((item) => item.cSpecNo)
    .join("$$");
  formModel.cSpecContent = specialList.value
    .map((item, index) => `${index + 1}.${normalizeText(item.cSpecContent)}`)
    .join("\n");
}

async function loadTemplateMap(prodNo?: string) {
  const targetProdNo = String(prodNo || formModel.cProdNo || "").trim();
  if (!targetProdNo) {
    templateMap.value = {};
    return;
  }
  if (templateCache.has(targetProdNo)) {
    templateMap.value = templateCache.get(targetProdNo)!.reduce<Record<string, TemplateItem>>((acc, item) => {
      acc[item.cSpecNo] = item;
      return acc;
    }, {});
    return;
  }
  const list = await codeListStore.queryCodeList(
    {
      codeListName: "FIX_SPEC_LIST",
      codeListParam: {
        cProdNo: targetProdNo,
      },
    },
    false,
    true
  );
  const normalizedList = Array.isArray(list)
    ? list
        .map((item: any) => ({
          cSpecNo: String(item?.cSpecNo ?? item?.value ?? ""),
          cNmeCn: String(item?.cNmeCn ?? item?.label ?? ""),
          cNmeEn: String(item?.cNmeEn ?? ""),
        }))
        .filter((item) => item.cSpecNo)
    : [];
  templateCache.set(targetProdNo, normalizedList);
  templateMap.value = normalizedList.reduce<Record<string, TemplateItem>>((acc, item) => {
    acc[item.cSpecNo] = item;
    return acc;
  }, {});
}

async function rebuildListFromFields() {
  const codeList = parseCodes(formModel.CSpecNo);
  if (formModel.cProdNo) {
    try {
      await loadTemplateMap(formModel.cProdNo);
    } catch (error) {
      console.error("load special template list failed:", error);
      templateMap.value = {};
    }
  }

  const templateItems = codeList.map<SpecialListItem>((code) => {
    const template = templateMap.value[code];
    return {
      cSpecNo: code,
      cSpecContent: normalizeText(template?.cNmeCn || ""),
      source: "template",
    };
  });

  const templateMatchMap = new Map<string, number[]>();
  templateItems.forEach((item, index) => {
    const key = normalizeText(item.cSpecContent);
    if (!key) {
      return;
    }
    const indexes = templateMatchMap.get(key) || [];
    indexes.push(index);
    templateMatchMap.set(key, indexes);
  });

  const matchedTemplateIndex = new Set<number>();
  const nextList: SpecialListItem[] = [];
  parseContentLines(formModel.cSpecContent).forEach((line) => {
    const key = normalizeText(line);
    const indexes = templateMatchMap.get(key) || [];
    const matchIndex = indexes.find((index) => !matchedTemplateIndex.has(index));
    if (matchIndex !== undefined) {
      nextList.push({
        ...templateItems[matchIndex],
        cSpecContent: key,
      });
      matchedTemplateIndex.add(matchIndex);
      return;
    }
    nextList.push({
      cSpecNo: "",
      cSpecContent: key,
      source: "custom",
    });
  });

  templateItems.forEach((item, index) => {
    if (!matchedTemplateIndex.has(index)) {
      nextList.push(item);
    }
  });

  specialList.value = nextList;
  updateFieldsFromList();
}

function getFromValue() {
  return {
    cSpecMrk: formModel.cSpecMrk,
    cSpecContent: formModel.cSpecContent,
    CSpecNo: formModel.CSpecNo,
  };
}

function getValue(key: string) {
  return (formModel as Record<string, any>)[key];
}

function setValue(key: string, value: any) {
  (formModel as Record<string, any>)[key] = value ?? "";
  if (key === "cSpecContent" || key === "CSpecNo" || key === "cProdNo") {
    rebuildListFromFields();
  }
}

function setDisabledAll(disabled = true) {
  disabledAll.value = disabled;
}

function validate() {
  return Promise.resolve(true);
}

function setFormValue(value: any) {
  if (!value || typeof value !== "object") {
    specialList.value = [];
    updateFieldsFromList();
    return;
  }

  formModel.cSpecMrk = String(value.cSpecMrk ?? formModel.cSpecMrk ?? "0");
  formModel.cSpecContent = String(value.cSpecContent ?? "");
  formModel.CSpecNo = String(value.CSpecNo ?? "");
  formModel.cProdNo = String(value.cProdNo ?? value.CProdNo ?? formModel.cProdNo ?? "");

  rebuildListFromFields();
}

async function handleAddTemplate() {
  if (!formModel.cProdNo) {
    ElMessage.error("产品号为空，无法查询特约列表");
    return;
  }
  dzmodal
    .open(PrdFixSpec, {
      data: {
        cProdNo: formModel.cProdNo,
        fixSpecData: formModel.CSpecNo,
      },
    })
    .then(async (res) => {
      if (res.type !== "ok" || !Array.isArray(res.body)) {
        return;
      }
      await loadTemplateMap(formModel.cProdNo);
      const existCodes = new Set(
        specialList.value.filter((item) => item.source === "template" && item.cSpecNo).map((item) => item.cSpecNo)
      );
      res.body.forEach((value: any) => {
        const cSpecNo = String(value?.["PrdFixSpec.CSpecNo"] ?? "").trim();
        const cSpecContent = normalizeText(value?.["PrdFixSpec.CNmeCn"]);
        if (!cSpecNo || existCodes.has(cSpecNo)) {
          return;
        }
        specialList.value.push({
          cSpecNo,
          cSpecContent,
          source: "template",
        });
        existCodes.add(cSpecNo);
      });
      updateFieldsFromList();
    });
}

function openEditDialog(mode: "custom" | "edit", row?: SpecialListItem, index = -1) {
  editMode.value = mode;
  editIndex.value = index;
  editForm.cSpecNo = row?.cSpecNo || "";
  editForm.cSpecContent = row?.cSpecContent || "";
  editForm.source = row?.source || "custom";
  editDialogVisible.value = true;
}

function saveEditDialog() {
  const content = normalizeText(editForm.cSpecContent);
  if (!content) {
    ElMessage.error("请输入特约内容");
    return;
  }

  if (editMode.value === "edit" && editIndex.value > -1) {
    specialList.value.splice(editIndex.value, 1, {
      cSpecNo: editForm.cSpecNo,
      cSpecContent: content,
      source: editForm.source,
    });
  } else {
    specialList.value.push({
      cSpecNo: "",
      cSpecContent: content,
      source: "custom",
    });
  }

  updateFieldsFromList();
  editDialogVisible.value = false;
}

function handleDelete(index: number) {
  ElMessageBox.confirm("是否确认删除该特约？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    specialList.value.splice(index, 1);
    updateFieldsFromList();
  });
}

function moveItem(index: number, offset: -1 | 1) {
  const targetIndex = index + offset;
  if (targetIndex < 0 || targetIndex >= specialList.value.length) {
    return;
  }
  const nextList = [...specialList.value];
  [nextList[index], nextList[targetIndex]] = [nextList[targetIndex], nextList[index]];
  specialList.value = nextList;
  updateFieldsFromList();
}

defineExpose({
  getFromValue,
  getValue,
  setValue,
  setDisabledAll,
  setFormValue,
  validate,
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

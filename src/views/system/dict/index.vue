<!--字典类型-->
<script setup lang="ts">
import {
  getDictTypePage,
  getDictTypeForm,
  addDictType,
  updateDictType,
  deleteDictTypes,
} from "@/api/dict";

import { DictTypePageVO, DictTypeQuery, DictTypeForm } from "@/api/dict/types";

defineOptions({
  name: "DictType",
  inheritAttrs: false,
});

const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<DictTypeQuery>({
  pageNum: 1,
  pageSize: 10,
});

const dictTypeList = ref<DictTypePageVO[]>();

const dialog = reactive({
  title: "",
  visible: false,
});

const formData = reactive<DictTypeForm>({
});

const rules = reactive({
  cDictName: [{ required: true, message: "请输入字典类型名称", trigger: "change" }],
  cDictCode: [{ required: true, message: "请输入字典类型编码", trigger: "change" }],
  cDictStatic: [{ required: true, message: "请选择字典状态", trigger: "change" }],
});

/** 查询 */
function handleQuery() {
  loading.value = true;
  getDictTypePage(queryParams)
    .then((res) => {
      const {code,data,msg} = res;
      if(200===code){
        dictTypeList.value = data.result;
        total.value = data.total;
      }else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

/**
 * 重置查询
 */
function resetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

/** 行复选框选中  */
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.cPkId);
}

/**
 * 打开字典类型表单弹窗
 *
 * @param dicTypeId 字典类型ID
 */
function openDialog(row: DictTypePageVO) {
  dialog.visible = true;
  if (!!row) {
    dialog.title = "修改字典类型";
    Object.assign(formData, row);
  } else {
    dialog.title = "新增字典类型";
  }
}

/** 字典类型表单提交 */
function handleSubmit() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      loading.value = false;
      const dictTypeId = formData.cPkId;
      if (dictTypeId) {
        updateDictType(formData)
          .then((res) => {
            const {code, data, msg} = res
            if(200 === code && data) {
              ElMessage.success(msg);
              closeDialog();
              handleQuery();
            }else {
              ElMessage.error(msg);
            }
          })
          .finally(() => (loading.value = false));
      } else {
        addDictType(formData).then((res) => {
          const {code, data, msg} = res;
            if(200 === code && data) {
              ElMessage.success(msg);
              closeDialog();
              handleQuery();
            }else {
              ElMessage.error(msg);
            }
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

/** 关闭字典类型弹窗 */
function closeDialog() {
  dialog.visible = false;
  resetForm();
}

/**  重置字典类型表单 */
function resetForm() {
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.cPkId = undefined;
  formData.cDictCode = undefined;
  formData.cDictName = undefined;
  formData.cDictStatic = undefined;
  formData.cIsCache = undefined;
  formData.cMark = undefined;
}

/** 删除字典类型 */
function handleDelete(dictTypeId?: string) {
  const dictTypeIds = [dictTypeId || ids.value].join(",");
  if (!dictTypeIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }
  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteDictTypes({ids: dictTypeIds}).then((res) => {
      const {code,msg,data} = res;
      if(200 === code) {
        if(data) {
          ElMessage.success("删除成功");
        }else {
          ElMessage.success("删除失败！");
        }
      }else {
        ElMessage.error(msg);
      }
      resetQuery();
    });
  });
}

const dictDataDialog = reactive({
  title: "",
  visible: false,
});

const selectedDictType = reactive({ cPkId: "" }); // 当前选中的字典类型

/** 打开字典数据弹窗 */
function openDictDialog(row: DictTypePageVO) {
  dictDataDialog.visible = true;
  dictDataDialog.title = "【" + row.cDictName + "】字典数据";

  selectedDictType.cPkId = row.cPkId;
}

/**  关闭字典数据弹窗 */
function closeDictDialog() {
  dictDataDialog.visible = false;
}

</script>

<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="字典编码" prop="cDictCode">
          <el-input
            v-model="queryParams.cDictCode"
            placeholder="字典编码"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="字典名称" prop="cDictName">
          <el-input
            v-model="queryParams.cDictName"
            placeholder="字典名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery()"
            ><i-ep-search />搜索</el-button
          >
          <el-button @click="resetQuery()"><i-ep-refresh />重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never" class="table-container">
      <template #header>
        <el-button
          v-hasPerm="['sys:dict_type:add']"
          type="success"
          @click="openDialog()"
          ><i-ep-plus />新增</el-button
        >
        <el-button
          v-hasPerm="['sys:dict_type:delete']"
          type="danger"
          :disabled="ids.length === 0"
          @click="handleDelete()"
          ><i-ep-delete />删除</el-button
        >
      </template>
      <el-table
        v-loading="loading"
        highlight-current-row
        :data="dictTypeList"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="字典名称" prop="cDictName" width="200" align="center"/>
        <el-table-column label="字典编码" prop="cDictCode" width="200" align="center"/>
        <el-table-column label="状态" align="center" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.cDictStatic === '1'" type="success">启用</el-tag>
            <el-tag v-else type="info">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="cMark" align="center" />
        <el-table-column label="操作" align="center" width="220">
          <template #default="scope">
            <el-tooltip
              class="box-item"
              effect="light"
              content="字典数据"
              placement="top-start">
             <el-button
              type="success"
              link
              size="small"
              @click.stop="openDictDialog(scope.row)"
              ><i-ep-Collection /></el-button>
             </el-tooltip>
             <el-tooltip
              class="box-item"
              effect="light"
              content="编辑"
              placement="top-start">
             <el-button
              v-hasPerm="['sys:dict_type:edit']"
              type="primary"
              link
              size="small"
              @click.stop="openDialog(scope.row)"
              ><i-ep-edit /></el-button>
             </el-tooltip>
             <el-tooltip
              class="box-item"
              effect="light"
              content="删除"
              placement="top-start">
              <el-button
              v-hasPerm="['sys:dict_type:delete']"
              type="danger"
              link
              size="small"
              @click.stop="handleDelete(scope.row.cPkId)"
              ><i-ep-delete /></el-button>
             </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery"
      />
    </el-card>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      class="system-dialog-scroll"
      @close="closeDialog"
    >
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="字典名称" prop="cDictName">
          <el-input v-model="formData.cDictName" placeholder="请输入字典名称"/>
        </el-form-item>
        <el-form-item label="字典编码" prop="cDictCode">
          <el-input v-model="formData.cDictCode" placeholder="请输入字典编码" />
        </el-form-item>
        <el-form-item label="状态" prop="cDictStatic">
          <el-radio-group v-model="formData.cDictStatic">
            <el-radio value="1">启用</el-radio>
            <el-radio value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否缓存" prop="cIsCache">
          <el-radio-group v-model="formData.cIsCache">
            <el-radio value="1">是</el-radio>
            <el-radio value="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="cMark">
          <el-input
            v-model="formData.cMark"
            type="textarea"
            placeholder="字典类型备注"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!--字典数据弹窗-->
    <el-dialog
      v-model="dictDataDialog.visible"
      :title="dictDataDialog.title"
      width="1000px"
      class="system-dialog-scroll"
      @close="closeDictDialog"
    >
      <dict-item
        v-model:cParentId="selectedDictType.cPkId"
      />
    </el-dialog>
  </div>
</template>

<style scoped>
.system-dialog-scroll :deep(.el-dialog__body) {
  max-height: 400px;
  overflow: auto;
}
</style>

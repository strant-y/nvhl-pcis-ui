<!-- 字典数据 -->
<script setup lang="ts">
import {
  getDictPage,
  getDictFormData,
  addDict,
  updateDict,
  deleteDict,
} from "@/api/dict";
import { DictPageVO, DictForm, DictQuery } from "@/api/dict/types";

defineOptions({
  name: "DictData",
  inheritAttrs: false,
});

const props = defineProps({
  cParentId: {
    type: String,
    default: () => {
      return "";
    },
  },
});

watch(
  () => props.cParentId,
  (newVal: string) => {
    queryParams.cParentId = newVal;
    formData.cParentId = newVal;
    resetQuery();
  }
);

const dataFormRef = ref(ElForm);

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<DictQuery>({
  pageNum: 1,
  pageSize: 10,
  cParentId: props.cParentId,
});

const dictList = ref<DictPageVO[]>();

const dialog = reactive({
  title: "",
  visible: false,
});

const formData = reactive<DictForm>({
  cParentId: props.cParentId,
});

const rules = reactive({
  cDictLabel: [{ required: true, message: "请输入字典名称", trigger: "change" }],
  cDictValue: [{ required: true, message: "请输入字典值", trigger: "change" }],
});

/**
 * 查询
 */
function handleQuery() {
  if (queryParams.cParentId) {
    loading.value = true;
    getDictPage(queryParams)
      .then((res) => {
        if(res.data.code == 500){
          ElMessage.error(res.data.message);
        }
        dictList.value = res.data.result;
        total.value = res.data.total;
      })
      .finally(() => (loading.value = false));
  }
}

/**
 * 重置查询
 */
function resetQuery() {
  queryParams.pageNum = 1;
  handleQuery();
}

/**
 * 行checkbox change事件
 *
 * @param selection
 */
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.cPkId);
}

/**
 * 打开字典表单弹窗
 *
 * @param dictId 字典ID
 */
function openDialog(row: DictPageVO) {
  dialog.visible = true;
  if (!!row) {
    dialog.title = "修改字典";
    Object.assign(formData, row);
  } else {
    dialog.title = "新增字典";
  }
}

/**
 * 字典表单提交
 */
function handleSubmit() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      loading.value = false;
      const dictId = formData.cPkId;
      if (dictId) {
        updateDict(formData)
          .then((res) => {
            if (res.code == 200){
                ElMessage.success(res.msg); 
                closeDialog();
                resetQuery();
            }else{
              ElMessage.error(res.msg);
            }
          })
          .finally(() => (loading.value = false));
      } else {
        addDict(formData)
          .then((res) => {
            if (res.code == 200){
              ElMessage.success(res.msg); 
               closeDialog();
               resetQuery();
            }else{
              ElMessage.error(res.msg);
            }
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

/**
 * 关闭弹窗
 */
function closeDialog() {
  dialog.visible = false;
  resetForm();
}

/**
 * 重置表单
 */
function resetForm() {
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();

  formData.cPkId = undefined;
  formData.cParentId = props.cParentId;
  formData.cDictLabel = undefined;
  formData.cDictStatic = undefined;
  formData.cMark = undefined;
  formData.cDictValue = undefined;
}

/**
 * 删除字典
 */
function handleDelete(dictId?: string) {
  const dictIds = [dictId || ids.value].join(",");
  if (!dictIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteDict(dictIds).then((res) => {
      if (res.code == 200){
          ElMessage.success(res.msg);
          resetQuery();
      }else{
        ElMessage.error(res.msg);
      }
     
    });
  });
}

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <el-button
          v-hasPerm="['sys:dict:add']"
          type="success"
          @click="openDialog()"
          ><i-ep-plus />新增</el-button
        >
        <el-button
          v-hasPerm="['sys:dict:delete']"
          type="danger"
          :disabled="ids.length === 0"
          @click="handleDelete()"
          ><i-ep-delete />删除</el-button
        >
      </template>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="dictList"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="字典名" prop="cDictLabel" width="300" align="center" />
        <el-table-column label="字典值" prop="cDictValue" align="center"/>
        <el-table-column label="状态" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.cDictStatic === '1'" type="success">启用</el-tag>
            <el-tag v-else type="info">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" align="center">
          <template #default="scope">
            <el-tooltip
              class="box-item"
              effect="light"
              content="编辑"
              placement="top-start">
              <el-button
              v-hasPerm="['sys:dict:edit']"
              type="primary"
              link
              @click="openDialog(scope.row)"
              ><i-ep-edit /></el-button>
             </el-tooltip>
             <el-tooltip
              class="box-item"
              effect="light"
              content="删除"
              placement="top-start">
               <el-button
              v-hasPerm="['sys:dict:delete']"
              type="danger"
              link
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

    <!-- 表单弹窗 -->
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
        label-width="100px"
      >
        <el-form-item label="字典名" prop="cDictLabel">
          <el-input v-model="formData.cDictLabel" placeholder="字典名" />
        </el-form-item>
        <el-form-item label="字典值" prop="cDictValue">
          <el-input v-model="formData.cDictValue" placeholder="字典值" />
        </el-form-item>
        <el-form-item label="排序" prop="cSort">
          <el-input-number
            v-model="formData.cSort"
            style="width: 100px"
            controls-position="right"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="状态" prop="cDictStatic">
          <el-radio-group v-model="formData.cDictStatic">
            <el-radio value="1">正常</el-radio>
            <el-radio value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.system-dialog-scroll :deep(.el-dialog__body) {
  max-height: 400px;
  overflow: auto;
}
</style>

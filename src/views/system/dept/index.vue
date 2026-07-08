<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 部门树 -->
      <el-col :lg="6" :xs="6" class="mb-[12px]">
        <dept-tree v-model="queryParams.cDptCde" @confirm="dptConfirm" />
      </el-col>
      <el-col :lg="18" :xs="18">
        <div class="search-container">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="机构代码" prop="cDptCde">
              <el-input
                v-model="queryParams.cDptCde"
                placeholder="机构代码"
                disabled
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item
              label="是否包含下级"
              prop="subordinate"
              @keyup.enter="handleQuery"
            >
              <el-radio-group v-model="queryParams.subordinate">
                <el-radio :value="true">是</el-radio>
                <el-radio :value="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="机构名称" prop="cDptCnm">
              <el-input
                v-model="queryParams.cDptCnm"
                placeholder="机构名称"
                disabled
                @keyup.enter="handleQuery"
              />
            </el-form-item>
          </el-form>
          <div class="search-button">
            <el-button class="filter-item" type="primary" @click="handleQuery">
              <i-ep-search />
              搜索
            </el-button>
            <el-button @click="resetQuery"> <i-ep-refresh />重置 </el-button>
          </div>
        </div>
        <el-card shadow="never" class="table-container">
          <el-table v-loading="loading" :data="deptList" border>
            <el-table-column prop="cDptCde" label="机构代码" align="center" />
            <el-table-column prop="cDptCnm" label="机构名称" align="center" />
            <!-- <el-table-column prop="cDptCls" label="机构类型" align="center">
              <template #default="scope">
                {{ deptClsMap[String(scope.row.cDptCls ?? "")] || "-" }}
              </template>
            </el-table-column> -->
            <el-table-column label="成立时间" align="center">
              <template #default="{ row }">
                <div>{{ formatDate(row.tFndTm, "yyyy-MM-dd") }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="cIsValid" label="状态" align="center">
              <template #default="scope">
                <el-tag v-if="String(scope.row.cIsValid) === '1'" type="success"
                  >正常</el-tag
                >
                <el-tag v-else type="info">禁用</el-tag>
              </template>
            </el-table-column>

            <el-table-column label="操作" align="center" width="200px">
              <template #default="scope">
                <el-tooltip
                  class="box-item"
                  effect="light"
                  content="查看"
                  placement="top-start"
                >
                  <el-button
                    v-hasPerm="['sys:dept:edit']"
                    type="primary"
                    link
                    size="small"
                    @click.stop="openDialog(scope.row)"
                    ><i-ep-view
                  /></el-button>
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
      </el-col>
    </el-row>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="1000px"
      class="system-dialog-scroll"
      @closed="closeDialog"
    >
      <el-form
        ref="deptFormRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
        :disabled="dialog.readonly"
      >
        <el-row justify="space-between">
          <el-col :span="8">
            <el-form-item label="机构代码" prop="cDptCde" class="!w-[300px]">
              <el-input v-model="formData.cDptCde" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="机构名称" prop="cDptCnm" class="!w-[300px]">
              <el-input v-model="formData.cDptCnm" />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="8">
            <el-form-item label="机构类别" prop="cDptCls" class="!w-[300px]">
              <el-select v-model="formData.cDptCls">
                <el-option label="机构" value="1" />
                <el-option label="部门" value="2" />
                <el-option label="室" value="3" />
              </el-select>
            </el-form-item>
          </el-col> -->
        </el-row>
        <el-row justify="space-between">
          <el-col :span="8">
            <el-form-item label="部门类别" prop="cDptAttr" class="!w-[300px]">
              <el-select v-model="formData.cDptAttr">
                <el-option label="远程出单点" value="014203" />
                <el-option label="营销服务部" value="014107" />
                <el-option label="集团" value="014100" />
                <el-option label="总公司" value="014101" />
                <el-option label="省会型分公司" value="014102" />
                <el-option label="都市型分公司" value="014103" />
                <el-option label="中心支公司" value="014104" />
                <el-option label="营业部" value="014105" />
                <el-option label="支公司 " value="014106" />
                <el-option label="行政管理部门" value="014201" />
                <el-option label="内设营业机构" value="014191" />
                <el-option label="内设业务部门" value="014202" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系人" prop="cCtctPrsn" class="!w-[300px]">
              <el-input v-model="formData.cCtctPrsn" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系电话" prop="cTel" class="!w-[300px]">
              <el-input v-model="formData.cTel" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row justify="space-between">
          <el-col :span="8">
            <el-form-item label="成立时间" prop="tFndTm" class="!w-[300px]">
              <el-date-picker
                v-model="formData.tFndTm"
                placeholder="成立时间"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <!-- <el-button type="primary" @click="handleSubmit"> 确 定 </el-button> -->
          <el-button @click="closeDialog"> 取 消 </el-button>
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

<script setup lang="ts">
import {
  getDeptForm,
  deleteDept,
  updateDept,
  addDept,
  getDeptOptions,
  listDepts,
  listChrDepts,
} from "@/api/dept";

import { DeptVO, DeptForm, DeptQuery } from "@/api/dept/types";
import { formatDate } from "@/utils/date";

defineOptions({
  name: "Dept",
  inheritAttrs: false,
});

const queryFormRef = ref(ElForm);
const deptFormRef = ref(ElForm);

const loading = ref(false);
const dialog = reactive({
  title: "",
  visible: false,
  readonly: true,
});
const total = ref(0); // 数据总数

const queryParams = reactive<DeptQuery>({
  pageNum: 1,
  pageSize: 10,
  subordinate: true,
});
const deptList = ref<DeptVO[]>([]);

const deptOptions = ref<OptionType[]>();

const formData = reactive<DeptForm>({});

const deptClsMap: Record<string, string> = {
  "1": "机构",
  "2": "部门",
  "3": "室",
};

const rules = reactive({
  cSnrDpt: [{ required: true, message: "上级机构不能为空", trigger: "change" }],
  cDptCde: [{ required: true, message: "机构代码不能为空", trigger: "change" }],
  cDptCnm: [{ required: true, message: "机构名称不能为空", trigger: "change" }],
  cDptCls: [
    { required: true, message: "机构类别不能为空", trigger: "change" },
  ],
  tFndTm: [{ required: true, message: "成立时间不能为空", trigger: "change" }],
});

/**
 * 选中机构时触发 回填机构名
 * */
function dptConfirm(data: { label: string }) {
  queryParams.cDptCnm = data.label;
}

/** 查询 */
function handleQuery() {
  loading.value = true;
  listDepts(queryParams)
    .then((res) => {
      if (res.code == 200) {
        deptList.value = res.data.list;
        total.value = res.data.total;
      } else {
        ElMessage.error(res.msg);
      }
      loading.value = false;
    })
    .finally(() => {
      loading.value = false;
    });
}

/**重置查询 */
function resetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

/**
 * 打开弹窗
 *
 * @param parentId 父部门ID
 * @param deptId 部门ID
 */
async function openDialog(row: DeptVO) {
  dialog.visible = true;
  if (row.cDptCde) {
    dialog.title = "查看部门";
    Object.assign(formData, row);
  } else {
    Object.assign(formData, null);
    dialog.title = "新增部门";
  }
}

/** 表单提交 */
function handleSubmit() {
  deptFormRef.value.validate((valid: any) => {
    if (valid) {
      const deptId = formData.id;
      loading.value = true;
      if (deptId) {
        updateDept(deptId, formData)
          .then(() => {
            ElMessage.success("修改成功");
            closeDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        addDept(formData)
          .then(() => {
            ElMessage.success("新增成功");
            closeDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

/** 关闭弹窗 */
function closeDialog() {
  dialog.visible = false;
  resetForm();
}

/** 重置表单  */
function resetForm() {
  deptFormRef.value.resetFields();
  deptFormRef.value.clearValidate();
}
</script>

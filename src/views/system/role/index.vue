<script setup lang="ts">
import {
  getRolePage,
  updateRole,
  addRole,
  deleteRoles,
  getRoleMenuIds,
  updateRoleMenus,
} from "@/api/role";
import { listMenusOptionsApi } from "@/api/menu";

import { RolePageVO, RoleForm, RoleQuery } from "@/api/role/types";

defineOptions({
  name: "Role",
  inheritAttrs: false,
});

const queryFormRef = ref(ElForm);
const roleFormRef = ref(ElForm);
const menuRef = ref(ElTree);

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<RoleQuery>({
  pageNum: 1,
  pageSize: 10,
});

const roleList = ref<RolePageVO[]>();

const dialog = reactive({
  title: "",
  visible: false,
});

const formData = reactive<RoleForm>({});

const rules = reactive({
  cOpgrpCnm: [{ required: true, message: "请输入角色名称", trigger: "change" }],
  cOpgrpMemo: [
    { required: true, message: "请输入角色编码", trigger: "change" },
  ],
  cRoleLevl: [{ required: true, message: "请输入角色级别", trigger: "change" }],
});

const roleMap: Record<string, string> = {
  "0": "总公司",
  "1": "分公司",
};

const menuDialogVisible = ref(false);

const menuList = ref<OptionType[]>([]);

interface CheckedRole {
  /**
   * 角色编码
   */
  cOpgrpCde: string;

  /**
   * 角色名称
   */
  cOpgrpCnm: string;
}
const checkedRole = reactive<CheckedRole>({
  cOpgrpCde: "",
  cOpgrpCnm: "",
});

/** 查询 */
function handleQuery() {
  loading.value = true;
  getRolePage(queryParams)
    .then((res) => {
      roleList.value = res.data.result;
      total.value = res.data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}
/** 重置查询 */
function resetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

/** 行checkbox 选中事件 */
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.cOpgrpCde);
}

/** 打开角色表单弹窗 */
function openDialog(row?: RolePageVO) {
  dialog.visible = true;
  if (!!row) {
    dialog.title = "修改角色";
    Object.assign(formData, row);
  } else {
    dialog.title = "新增角色";
  }
}

/** 角色保存提交 */
function handleSubmit() {
  roleFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const roleId = formData.cOpgrpCde;
      if (roleId) {
        updateRole(formData)
          .then((res) => {
            if (res.data.code === "1") {
              closeDialog();
              resetQuery();
              ElMessage.success(res.data.message);
            } else {
              ElMessage.error(res.data.message);
            }
          })
          .finally(() => (loading.value = false));
      } else {
        addRole(formData)
          .then((res) => {
            if (res.data.code === "1") {
              closeDialog();
              resetQuery();
              ElMessage.success(res.data.message);
            } else {
              ElMessage.error(res.data.message);
            }
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

/** 关闭表单弹窗 */
function closeDialog() {
  dialog.visible = false;
  resetForm();
}

/** 重置表单 */
function resetForm() {
  roleFormRef.value.resetFields();
  roleFormRef.value.clearValidate();
  formData.cOpgrpCde = undefined;
  formData.cOpgrpCnm = undefined;
  formData.cOpgrpMemo = undefined;
  formData.cRoleLevl = undefined;
}

/** 删除角色 */
function handleDelete(roleId?: string) {
  const cOpgrpCde = [roleId || ids.value].join(",");
  if (!cOpgrpCde) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    loading.value = true;
    deleteRoles(cOpgrpCde)
      .then((res) => {
        if (res.data.code === "1") {
          ElMessage.success(res.data.message);
          resetQuery();
        } else {
          ElMessage.error(res.data.message);
        }
      })
      .finally(() => (loading.value = false));
  });
}

/** 打开分配菜单弹窗 */
function openMenuDialog(row: RolePageVO) {
  const roleId = row.cOpgrpCde;
  if (roleId) {
    checkedRole.cOpgrpCde = roleId;
    checkedRole.cOpgrpCnm = row.cOpgrpCnm;
    menuDialogVisible.value = true;
    loading.value = true;

    // 获取所有的菜单
    listMenusOptionsApi({ keywords: "0", queryType: "role-allot" }).then(
      (response) => {
        menuList.value = response.data;
        // 回显角色已拥有的菜单
        getRoleMenuIds(roleId)
          .then((res) => {
            const { msg, data, code } = res;
            const checkedMenuIds = data["data"] ?? [];
            checkedMenuIds.forEach((menuId: string) =>
              menuRef.value.setChecked(menuId, true, false)
            );
          })
          .finally(() => {
            loading.value = false;
          });
      }
    );
  }
}

/** 角色分配菜单保存提交 */
function handleRoleMenuSubmit() {
  const roleId = checkedRole.cOpgrpCde;
  if (roleId) {
    const checkedMenuIds: string[] = menuRef.value
      .getCheckedNodes(false, true)
      .map((node: any) => node.value);

    loading.value = true;
    updateRoleMenus(roleId, checkedMenuIds)
      .then((res) => {
        const { data, code, msg } = res;
        if (code === 200) {
          ElMessage.success(msg);
        } else {
          ElMessage.error(msg);
        }
        menuDialogVisible.value = false;
        resetQuery();
      })
      .finally(() => {
        loading.value = false;
      });
  }
}
</script>

<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="cOpgrpCde" label="角色代码">
          <el-input
            v-model="queryParams.cOpgrpCde"
            placeholder="角色代码"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item prop="cOpgrpCnm" label="角色名称">
          <el-input
            v-model="queryParams.cOpgrpCnm"
            placeholder="角色名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery"
            ><i-ep-search />搜索</el-button
          >
          <el-button @click="resetQuery"><i-ep-refresh />重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never" class="table-container">
      <template #header>
        <el-button
          v-hasPerm="['sys:role:add']"
          type="success"
          @click="openDialog()"
          ><i-ep-plus />新增</el-button
        >
        <el-button
          v-hasPerm="['sys:role:delete']"
          type="danger"
          :disabled="ids.length === 0"
          @click="handleDelete()"
          ><i-ep-delete />删除</el-button
        >
      </template>

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="roleList"
        highlight-current-row
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="角色名称" prop="cOpgrpCnm" align="center" />
        <el-table-column label="角色代码" prop="cOpgrpCde" align="center" />
        <el-table-column
          label="角色描述"
          width="300"
          prop="cOpgrpMemo"
          align="center"
        />
        <el-table-column label="角色级别" prop="cRoleLevl" align="center">
          <template #default="scope">
            {{ roleMap[scope.row.cRoleLevl] }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <el-tooltip
              class="box-item"
              effect="light"
              content="分配权限"
              placement="top-start"
            >
              <el-button
                v-hasPerm="['sys:role:allot']"
                type="success"
                size="small"
                link
                @click="openMenuDialog(scope.row)"
                ><i-ep-position
              /></el-button>
            </el-tooltip>
            <el-tooltip
              class="box-item"
              effect="light"
              content="编辑"
              placement="top-start"
            >
              <el-button
                v-hasPerm="['sys:role:edit']"
                type="primary"
                size="small"
                link
                @click="openDialog(scope.row)"
                ><i-ep-edit
              /></el-button>
            </el-tooltip>
            <el-tooltip
              class="box-item"
              effect="light"
              content="删除"
              placement="top-start"
            >
              <el-button
                class="app-button-margin5"
                v-hasPerm="['sys:role:delete']"
                type="danger"
                size="small"
                link
                @click="handleDelete(scope.row.cOpgrpCde)"
                ><i-ep-delete
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

    <!-- 角色表单弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      class="system-dialog-scroll"
      @close="closeDialog"
    >
      <el-form
        ref="roleFormRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="cOpgrpCnm">
          <el-input v-model="formData.cOpgrpCnm" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="cOpgrpMemo">
          <el-input
            v-model="formData.cOpgrpMemo"
            placeholder="请输入角色描述"
          />
        </el-form-item>

        <el-form-item label="角色级别" prop="cRoleLevl">
          <el-select v-model="formData.cRoleLevl">
            <el-option label="总公司" value="0" />
            <el-option label="分公司" value="1" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分配菜单弹窗  -->
    <el-dialog
      v-model="menuDialogVisible"
      :title="'【' + checkedRole.cOpgrpCnm + '】权限分配'"
      width="800px"
      class="system-dialog-scroll"
    >
      <el-scrollbar v-loading="loading" max-height="600px">
        <el-tree
          ref="menuRef"
          node-key="value"
          class="menu-tree"
          show-checkbox
          :data="menuList"
          :default-expand-all="true"
        >
          <template #default="{ data }">
            {{ data.label }}
          </template>
        </el-tree>
      </el-scrollbar>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleRoleMenuSubmit"
            >确 定</el-button
          >
          <el-button @click="menuDialogVisible = false">取 消</el-button>
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
.menu-tree{
   max-height: 400px;
  overflow: auto;
}

:deep(.el-tree-node__expand-icon) {
  font-size: 18px;
}
</style>

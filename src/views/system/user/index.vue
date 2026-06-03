<!-- 用户管理 -->
<template>
  <div class="app-container">
    <el-row :gutter="20">
       <el-col :lg="6" :xs="6" class="mb-[12px]">
        <dept-tree v-model="queryParams.companyId" @confirm="dptConfirm"/>
      </el-col>
      <el-col :lg="18" :xs="18">
        <div class="search-container">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item prop="companyId" label="归属机构">
              <el-input
                v-model="queryParams.companyId"
                placeholder="机构代码"
                disabled
              />
            </el-form-item>
            <el-form-item
              label="是否包含下级"
              prop="subordinate"
              @keyup.enter="handleQuery"
            >
              <el-radio-group
                v-model="queryParams.subordinate"
                @change="onMenuTypeChange"
              >
                <el-radio :value="'1'">是</el-radio>
                <el-radio :value="'0'">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="工号" prop="opCde">
              <el-input
                v-model="queryParams.opCde"
                placeholder="工号"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="姓名" prop="opCnm">
              <el-input
                v-model="queryParams.opCnm"
                placeholder="姓名"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item label="状态" prop="cIsValid">
              <el-select
                v-model="queryParams.cIsValid"
                placeholder="全部"
                clearable
              >
                <el-option label="启用" value="1" />
                <el-option label="禁用" value="0" />
              </el-select>
            </el-form-item>
          </el-form>
          <div class="search-button">
            <el-button type="primary" @click="handleQuery"
              ><i-ep-search />搜索</el-button
            >
            <el-button @click="resetQuery"> <i-ep-refresh />重置</el-button>
          </div>
        </div>
        <el-card shadow="never" class="table-container">
          <template #header>
            <div class="flex justify-between">
              <div>
                <el-button
                  v-hasPerm="['sys:user:add']"
                  type="success"
                  @click="openDialog()"
                  ><i-ep-plus />新增</el-button
                >
                <!-- <el-button
                  v-hasPerm="['sys:user:delete']"
                  type="danger"
                  :disabled="removeIds.length === 0"
                  @click="handleDelete()"
                  ><i-ep-delete />删除</el-button
                >  -->
              </div>
            </div>
          </template>
          <el-table
            v-loading="loading"
            :data="pageData"
            border
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              key="opCde"
              label="员工工号"
              align="center"
              prop="opCde"
            />
            <el-table-column
              key="opCnm"
              label="员工名称"
              align="center"
              prop="opCnm"
            />
            <el-table-column
              label="归属机构"
              width="200"
              align="center"
              prop="cDptCnm"
            />

            <el-table-column label="状态" align="center" prop="cIsValid">
              <template #default="scope">
                <el-tag :type="scope.row.cIsValid == 1 ? 'success' : 'info'">{{
                  scope.row.cIsValid == 1 ? "启用" : "禁用"
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" align="center">
              <template #default="scope">
                <el-tooltip
                  class="box-item"
                  effect="light"
                  content="重置密码"
                  placement="top-start"
                >
                  <el-button
                    v-hasPerm="['sys:user:reset_pwd']"
                    type="warning"
                    size="small"
                    link
                    @click="resetPassword(scope.row)"
                    ><i-ep-refresh-left
                  /></el-button>
                </el-tooltip>
                <el-tooltip
                  class="box-item"
                  effect="light"
                  content="权限编辑"
                  placement="top-start"
                >
                  <el-button
                    v-hasPerm="['sys:user:edit']"
                    type="success"
                    link
                    size="small"
                    @click="openDialog(scope.row)"
                    ><i-ep-edit
                  /></el-button>
                </el-tooltip>
                <!-- <el-tooltip
                  class="box-item"
                  effect="light"
                  content="删除"
                  placement="top-start">
                  <el-button
                  v-hasPerm="['sys:user:delete']"
                  type="danger"
                  link
                  size="small"
                  @click="handleDelete(scope.row.cPkId)"
                  ><i-ep-delete /></el-button>
                </el-tooltip> -->
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



    <!-- 弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      :width="dialog.width"
      append-to-body
      @close="closeDialog"
    >
      <!-- 用户新增/编辑表单 -->
      <el-form
        ref="userFormRef"
        :model="formData"
        label-width="80px"
        :rules="rules"
      >
        <el-row justify="space-around">
          <el-col :span="12">
            <el-form-item label="员工工号" style="margin-left: 5%" prop="opCde">
              <el-input
                v-model="formData.opCde"
                disabled
                placeholder="员工工号"
                style="width: 80%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="员工名称" prop="opCnm">
              <el-input
                v-model="formData.opCnm"
                disabled
                placeholder="员工名称"
                style="width: 80%"
              />
              <el-button
                type="primary"
                style="width: 20%"
                v-if="isAdd"
                @click="showselectEmp()"
                >选择</el-button
              >
            </el-form-item>
          </el-col>
        </el-row>
        <el-row justify="space-around">
          <el-col :span="12">
            <el-form-item
              label="性别"
              style="margin-left: 5%; width: 80%"
              prop="cSex"
            >
              <dictionary
                v-model="formData.cSex"
                disabled
                type-code="SexType"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="证件类型" style="width: 84%" prop="cCtfctTyp">
              <dictionary
                v-model="formData.cCtfctTyp"
                disabled
                type-code="CUserCertificateType"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row justify="space-around">
          <el-col :span="12">
            <el-form-item
              label="证件号码"
              style="margin-left: 5%"
              prop="cCtfctNo"
            >
              <el-input
                v-model="formData.cCtfctNo"
                disabled
                placeholder="证件号码"
                style="width: 80%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="cMobile">
              <el-input
                v-model="formData.cMobile"
                placeholder="手机号码"
                disabled
                maxlength="11"
                style="width: 80%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- <el-row justify="space-around">
            <el-col :span="24">
              <el-form-item label="角色" style="margin-left:2.5%"  prop="roleIds">
                  <el-select v-model="formData.roleIds" style="width:91.5%" multiple placeholder="请选择">
                    <el-option
                      v-for="item in roleList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
            </el-col>
          </el-row> -->
        <el-row justify="space-around">
          <el-col :span="11">
            <el-form-item
              label="密码起止期"
              label-width="100px"
              required
              prop="tPwdStrtTm"
            >
              <el-date-picker
                class="!w-[302px]"
                v-model="formData.tPwdStrtTm"
                type="date"
                placeholder="密码起期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="2" class="text-center">
            <span class="text-gray-500">~</span>
          </el-col>
          <el-col :span="11">
            <el-form-item label-width="0px" prop="tPwdEndTm">
              <el-date-picker
                class="!w-[302px]"
                v-model="formData.tPwdEndTm"
                type="date"
                placeholder="密码止期"
                value-format="YYYY-MM-DD 23:59:59"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row justify="space-around">
          <el-col :span="12">
            <el-form-item label="状态" style="margin-left: 5%" prop="cIsValid">
              <el-radio-group v-model="formData.cIsValid" style="width: 80%">
                <el-radio value="1">启用</el-radio>
                <el-radio value="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" />
        </el-row>
        <el-row>
          <el-col>
            <el-card class="box-card">
              <template #header>
                <div class="card-header">
                  <span>权限绑定</span>
                  <el-button type="primary" size="small" @click="addItem"
                    ><el-icon><ZoomIn /></el-icon
                  ></el-button>
                </div>
              </template>
              <el-table :data="formData.roles" table-layout="fixed">
                <el-table-column prop="cDptCde" label="机构" width="200">
                  <template #default="scope">
                    <dept v-model="scope.row.cDptCde" />
                  </template>
                </el-table-column>
                <el-table-column prop="cRoleCde" label="角色">
                  <template #default="scope">
                    <el-select
                      v-model="scope.row.cRoleCde"
                      style="width: 91.5%"
                      multiple
                      placeholder="请选择"
                    >
                      <el-option
                        v-for="item in roleList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="删除" width="55">
                  <template #default="scope">
                    <i-ep-delete @click="deleteItem(scope.row)" />
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </el-form>

      <!-- 弹窗底部操作按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "User",
  inheritAttrs: false,
});

import {
  getUserPage,
  getUserForm,
  deleteUsers,
  addUser,
  updateUser,
  resetUserPassword,
  downloadTemplateApi,
  exportUser,
  importUser,
} from "@/api/user";
import { getDeptOptions } from "@/api/dept";
import { getRoleOptions } from "@/api/role";
import { v4 as uuidv4 } from "uuid";

import { UserForm, UserQuery, UserPageVO } from "@/api/user/types";
import type { UploadInstance } from "element-plus";
import { genFileId } from "element-plus";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import moment from "moment";

const queryFormRef = ref(ElForm); // 查询表单
const userFormRef = ref(ElForm); // 用户表单
const uploadRef = ref<UploadInstance>(); // 上传组件
const editRow = ref(0);

const dzmodal = useDzModal();
const selectEmp = defineAsyncComponent(
  () => import("./components/selec-emp.vue")
);

const loading = ref(false); //  加载状态
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const user = JSON.parse(sessionStorage.getItem("user"));
const queryParams = reactive<UserQuery>({
  pageNum: 1,
  pageSize: 10,
  subordinate: "1",
  companyId: user.companyId,
});
const dateTimeRange = ref("");
const total = ref(0); // 数据总数
const pageData = ref<UserPageVO[]>(); // 用户分页数据
const roleList = ref<OptionType[]>(); // 角色下拉数据源
const isAdd = ref(false); //弹出窗口是否为新增人员

// 弹窗对象
const dialog = reactive({
  visible: false,
  width: 800,
  title: "",
});

// 用户表单数据
const formData = reactive<UserForm>({});

const rules = reactive({
  opCde: [{ required: true, message: "请输入员工工号", trigger: "change" }],
  opCnm: [{ required: true, message: "请输入员工姓名", trigger: "change" }],
  tPwdStrtTm: [
    { required: true, message: "请输入密码起期", trigger: "change" },
  ],
  tPwdEndTm: [{ required: true, message: "请输入密码止期", trigger: "change" }],
  cIsValid: [{ required: true, message: "请输入状态", trigger: "change" }],
  roleIds: [
    { type: Array, required: true, message: "请选择角色", trigger: "change" },
  ],
});

/** 查询 */
function handleQuery() {
  loading.value = true;
  getUserPage(queryParams)
    .then((res) => {
      pageData.value = res.data.result;
      total.value = res.data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 重置查询 */
function resetQuery() {
  queryFormRef.value.resetFields();
  dateTimeRange.value = "";
  queryParams.pageNum = 1;
  handleQuery();
}

/** 行选中 */
function handleSelectionChange(selection: any) {
  removeIds.value = selection.map((item: any) => item.cPkId);
}

/** 重置密码 */
function resetPassword(row: { [key: string]: any }) {
  if (row.cIsValid === "0") {
    ElMessage.error("启用后才可以进行密码重置");
    return;
  }
  ElMessageBox.prompt("请输入用户「" + row.opCnm + "」的新密码", "重置密码", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  }).then(({ value }) => {
    if (!value) {
      ElMessage.warning("请输入新密码");
      return false;
    }
    resetUserPassword(row.opCde, value).then((res) => {
      if (res.code == 200) {
        ElMessage.success("密码重置成功，新密码是：" + value);
      } else {
        ElMessage.error(res.msg);
      }
    });
  });
}

function showselectEmp() {
  dzmodal
    .open(selectEmp, { dialog: { title: "选择员工信息" }, data: formData })
    .then((res) => {
      if (res.type === "ok") {
        const rebody = res.body;
        Object.assign(formData, rebody.res);
      }
    });
}

/** 加载角色下拉数据源 */
async function loadRoleOptions() {
  getRoleOptions().then((response) => {
    roleList.value = response.data.data;
  });
}
/**
 * 打开弹窗
 *
 * @param type 弹窗类型  用户表单：user-form | 用户导入：user-import
 */
async function openDialog(row: UserPageVO) {
  dialog.visible = true;
  // 用户表单弹窗
  await loadRoleOptions();
  if (!!row) {
    isAdd.value = false;
		dialog.title = "修改用户";
		row.tPwdStrtTm = moment(row.tPwdStrtTm).format("YYYY-MM-DD");
		row.tPwdEndTm = moment(row.tPwdEndTm).format("YYYY-MM-DD 23:59:59");
    Object.assign(formData, row);
  } else {
    isAdd.value = true;
    const today = moment();
    const now = today.format("YYYY-MM-DD");
    formData.tPwdStrtTm = now;
    formData.cIsValid = "1";
    dialog.title = "新增用户";
  }
  setTimeout(() => {
    userFormRef.value.clearValidate();
  }, 100);
}

/**
 * 关闭弹窗
 *
 * @param type 弹窗类型  用户表单：user-form | 用户导入：user-import
 */
function closeDialog() {
  dialog.visible = false;
  userFormRef.value.resetFields();
  userFormRef.value.clearValidate();
  formData.cIsValid = undefined;
  formData.cCtfctNo = undefined;
  formData.cCtfctTyp = undefined;
  formData.cSex = undefined;
  formData.opCde = undefined;
  formData.opCnm = undefined;
  formData.cPkId = undefined;
  formData.tPwdStrtTm = undefined;
  formData.tPwdEndTm = undefined;
  formData.roleIds = [];
  formData.roles = [];
}

function addItem() {
  if (!formData.roles) {
    formData.roles = [];
  }
  const pkId = uuidv4().replace(/-/g, "");
  formData.roles[formData.roles.length] = {
    cDptCde: "",
    cRoleCde: [],
    cPkId: pkId,
  };
  editRow.value = formData.roles.length;
}

function deleteItem(row) {
  formData.roles = formData.roles.filter((item) => item.cPkId !== row.cPkId);
}

/** 表单提交 */
const handleSubmit = useThrottleFn(() => {
  const s = formData.roles?.filter(
    (item) =>
      !item.cDptCde || item.cRoleCde.length === 0 || item.cRoleCde === ""
  );
  if (!s || s.length > 0) {
    ElMessage.error("权限绑定,机构与角色不能为空!");
    return;
  }
  userFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const param = Object.assign(formData, { isAdd: isAdd.value ? "1" : "0" });
      updateUser(param)
        .then((res) => {
          if (res.code == 200) {
            ElMessage.success("修改用户成功");
            closeDialog();
            // resetQuery();
            handleQuery();
          } else {
            ElMessage.error(res.msg);
          }
        })
        .finally(() => (loading.value = false));
    }
  });
}, 3000);

/** 删除用户 */
function handleDelete(id?: string) {
  const userIds = [id || removeIds.value].join(",");
  if (!userIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除用户?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(function () {
    deleteUsers(userIds).then((res) => {
      if (res.code == 200) {
        ElMessage.success("删除成功");
        resetQuery();
      } else {
        ElMessage.error(res.msg);
      }
    });
  });
}

/**
 * 选中机构时触发 回填机构名
 * */
function dptConfirm(data) {
  queryParams.cDptCnm = data.label;
  queryParams.opCde = "";
  queryParams.opCnm = "";
  queryParams.cIsValid = "";
  pageData.value = [];
  total.value = 0;
}
</script>

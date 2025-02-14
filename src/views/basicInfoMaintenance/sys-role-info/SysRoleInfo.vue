<template>
  <div class="searchbar el-card table-container">
    <div class="el-card__header">
      <span class="el-card__header__title">角色信息查询</span>
    </div>
  </div>
  <div class="search-container search-container2">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="角色代码" prop="COpgrpCde">
        <el-input
          v-model="form.COpgrpCde"
          placeholder="请输入角色代码"
        ></el-input>
      </el-form-item>
      <el-form-item label="角色名称" prop="COpgrpCnm">
        <el-input
          v-model="form.COpgrpCnm"
          placeholder="请输入角色名称"
        ></el-input>
      </el-form-item>
    </el-form>
    <div class="search-button">
      <el-button type="primary" @click="submitForm">查询</el-button>
      <el-button @click="resetForm">重置</el-button>
    </div>
  </div>

  <el-table
    ref="multipleTableRef"
    stripe
    :data="dataSet"
    border
    style="width: 100%"
    @row-click="handleRowClick"
  >
    <el-table-column label="#" width="55" align="center">
      <template #default="scope">
        <el-checkbox
          v-model="scope.row.checked"
          @change="checkboxChange(scope.row)"
        ></el-checkbox>
      </template>
    </el-table-column>
    <el-table-column
      prop="cOpgrpCde"
      label="角色代码"
      width="180"
      align="center"
    ></el-table-column>
    <el-table-column
      prop="cOpgrpCnm"
      label="角色名称"
      width="180"
      align="center"
    ></el-table-column>
    <el-table-column
      prop="cOpgrpMemo"
      label="角色描述"
      align="center"
    ></el-table-column>
  </el-table>

  <el-pagination
    background
    class="pagination"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
    :current-page="current"
    :page-sizes="[10, 20, 30, 40]"
    :page-size="pageSize"
    layout="prev, pager, next"
    :total="total"
  >
  </el-pagination>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElMessage,
} from "element-plus";
// import { SysRoleMgrService } from "@/views/sys-right-basic/service/sys-role-mgr.service";
// import { getListByCode } from "@/api/code-list-service";
// import { SessionStoreService } from "@/api/session-store.service";
import { getSysRoleList } from "@/api/basicInfo";

export default defineComponent({
  components: {
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
    ElTable,
    ElTableColumn,
    ElPagination,
  },
  setup(props, { emit }) {
    const formRef = ref(null);
    const form = ref({
      COpgrpCde: "",
      COpgrpCnm: "",
    });
    const rules = ref({
      COpgrpCde: [
        { required: false, message: "请输入角色代码", trigger: "blur" },
      ],
      COpgrpCnm: [
        { required: false, message: "请输入角色名称", trigger: "blur" },
      ],
    });
    const dataSet = ref([
      { cOpgrpCde: 1, checked: false },
      { cOpgrpCde: 12, checked: false },
    ]);
    const loading = ref(true);
    const total = ref(1);
    const current = ref(1);
    const pageSize = ref(10);
    const selected = ref({});
    const roleLevl = ref("");
    const user = ref<any>({});
    const roles = ref([]);
    const multipleTableRef = ref(null);
    const selection = ref<any>([]);

    // const sysRoleMgrService = new SysRoleMgrService();

    const submitForm = () => {
      formRef.value.validate((valid: boolean) => {
        if (valid) {
          refreshData(true);
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    };

    const resetForm = () => {
      formRef.value.resetFields();
    };

    const handleRowClick = (row: any) => {
      const oldKey = selected.value[row.cOpgrpCde];
      selected.value[row.cOpgrpCde] = true;
      if (oldKey) {
        selected.value[oldKey] = false;
      }
      emit("getOpgrpCde", row.cOpgrpCde);
    };

    const handleSizeChange = (val: number) => {
      pageSize.value = val;
      refreshData();
    };

    const handleCurrentChange = (val: number) => {
      current.value = val;
      refreshData();
    };

    const refreshData = (reset = false) => {
      //   if (reset && current.value !== 1) {
      //     current.value = 1;
      //   }
      loading.value = true;
      const params = {
        pageNo: 1,
        pageSize: 10,
        cRoleLevl: "0",
        cOpgrpCde: null,
        cOpgrpCnm: null,
        // ...getFormData(),
      };
      getSysRoleList(params).then((res: any) => {
        loading.value = false;
        if (res.code === 200) {
          const pageData = res.data;
          if (pageData) {
            total.value = pageData.total;
            pageData.result.forEach((item: any) => {
              selected.value[item.cOpgrpCde] = false;
              item.checked = false;
            });
            dataSet.value = pageData.result;
          }
        } else if (res.code === 500) {
          ElMessage.error(res.msg);
        }
      });
    };

    const getFormData = () => {
      return form.value;
    };

    const checkboxChange = (row) => {
      dataSet.value.forEach((item) => {
        item.checked = false;
      });
      row.checked = !row.checked;
    };

    onMounted(() => {
      //   user.value = SessionStoreService.get(AppKey.user) || {};
      //   roles.value = SessionStoreService.get(AppKey.roles) || [];

      let roleCde = "";
      roles.value.forEach((res: any) => {
        roleCde = roleCde === "" ? res : roleCde + "','" + res;
      });

      //   getListByCode("getRoleLevl", {
      //     cOperId: user.value.opCde,
      //     cDptCde: user.value.companyId,
      //   }).then(
      //     (res: any) => {
      //       if (res.code === 200 && res.data.length > 0) {
      //         roleLevl.value = res.data[0].roleLevl;
      //       }
      //     },
      //     (error: any) => {
      //       console.log("出错了", error);
      //       ElMessage.error("后台服务异常,请联系管理员");
      //     }
      //   );

      //   refreshData();
    });

    return {
      multipleTableRef,
      formRef,
      form,
      rules,
      dataSet,
      loading,
      total,
      current,
      pageSize,
      selected,
      roleLevl,
      user,
      roles,
      submitForm,
      resetForm,
      handleRowClick,
      checkboxChange,
      handleSizeChange,
      handleCurrentChange,
      refreshData,
      getFormData,
    };
  },
});
</script>

<style scoped>
.actived {
  background-color: #f0f9eb;
}

.searchbar.el-card {
  margin: 0;
  .el-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: var(--el-card-header-bg-color);
    border-bottom: 1px solid #ebeef5;
  }

  .el-card__header__title {
    font-size: 16px;
  }
}
</style>

<!-- 用户管理 -->
<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="绑定帐号" style="margin-left:5%"  prop="opCde">
          <el-input
            v-model="queryParams.opPhone"
            placeholder="绑定帐号"
            style="width:80%"
          />
        </el-form-item>
        <el-form-item label="被保人姓名" style="margin-left:5%"  prop="opCde">
          <el-input
            v-model="queryParams.opNme"
            placeholder="被保人姓名"
            style="width:80%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="cIsUsage">
          <el-select
            v-model="queryParams.cIsUsage"
            placeholder="全部"
            clearable
          >
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="search-button">
        <el-button type="primary" @click="handleQuery(false)"
        ><i-ep-search />搜索</el-button>
        <el-button>
        <i-ep-refresh />重置</el-button>
      </div>
    </div>

    <el-card shadow="never" class="table-container">
      <el-table
        v-loading="loading"
        :data="pageData"
        border
      >
        <el-table-column
          key="cUserName"
          label="绑定帐号"
          align="center"
          prop="cUserName"
        />
        <el-table-column
          key="cUserShow"
          label="被保人姓名"
          align="center"
          prop="cUserShow"
        />

        <el-table-column label="状态" align="center" prop="cIsUsage">
          <template #default="scope">
            <el-tag :type="scope.row.cIsUsage == 1 ? 'success' : 'info'">{{
              scope.row.cIsUsage == 1 ? "启用" : "禁用"
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template #default="scope">
            <el-tooltip
              class="box-item"
              effect="light"
              content="取消绑定"
              placement="top-start">
              <el-button
                type="danger"
                link
                @click="changeType(scope.row, 'delete')"
                ><el-icon><Connection /></el-icon></el-button>
            </el-tooltip>
            <el-tooltip
              class="box-item"
              effect="light"
              :content="scope.row.cIsUsage == '1' ? '禁用' : '启用' "
              placement="top-start">
              <template v-if="scope.row.cIsUsage === '1' ">
                <el-button
                type="warning"
                @click="changeType(scope.row, '0')"
                link ><el-icon><Failed /></el-icon></el-button>
              </template>
              <template v-else >
                <el-button
                type="success"
                @click="changeType(scope.row, '1')"
                link ><el-icon><List /></el-icon></el-button>
              </template>
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
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Other",
});

import {
  getOtherList, updateOtherUser,
} from "@/api/user";

const user = JSON.parse(sessionStorage.getItem("user"));
const queryParams = ref<{}>({
  pageNum: 1,
  pageSize: 10,
  cIsUsage: '1',
  companyId : user.companyId
});
const loading = ref(false); //  加载状态
const total = ref(0); // 数据总数
const pageData = ref<[]>(); // 用户分页数据

const handleQuery = (queryType = true) =>{
  if(!queryType){
    queryParams.value.pageNum = 1;
    queryParams.value.pageSize = 10;
  }
  loading.value = true;
  getOtherList(queryParams.value)
  .then(( res ) => {
    if(res.code === 200){
      pageData.value = res.data.result;
      total.value = res.data.total;
    }
  })
  .finally(() => {
    loading.value = false;
  });
}

const changeType = (row: any ,typ: any) => {
  const param = Object.assign(row,{typ:typ});
  updateOtherUser(param)
  .then(( res ) => {
    if(res.code === 200){
      ElMessage.success("修改成功");
      handleQuery();
    }
  })
  .finally(() => {
  });
}

</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

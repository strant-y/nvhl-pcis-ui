<script setup lang="ts">
import { getPlatformPage } from "@/api/prevention";
import { PreventionPageVO, PreventionQuery } from "@/api/prevention/types";
import { TaskQuery } from "@/api/task/types";
defineOptions({
  name: "platform",
  inheritAttrs: false,
});

const queryFormRef = ref(ElForm);
const roleFormRef = ref(ElForm);
const menuRef = ref(ElTree);

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<PreventionQuery>({
  pageNum: 1,
  pageSize: 10,
});

const preventionList = ref<PreventionPageVO[]>();

const dialog = reactive({
  title: "",
  visible: false,
});



function openMenuDialog(row: PreventionPageVO) {}
/** 查询 */
function handleQuery() {
  // loading.value = true;
  // getPlatformPage(queryParams)
  //   .then(({ data }) => {
  //     preventionList.value = data.list;
  //     total.value = data.total;
  //   })
  //   .finally(() => {
  //     loading.value = false;
  //   });
}

/** 重置查询 */
function resetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

</script>

<template>
  <div class="app-container">
    <div class="search-container" >
      <el-form
        ref="formRef"
        :model="queryParams"
        :inline="true"
      >
        <el-form-item prop="cDptCde" label="机构">
          <dept v-model="queryParams.cDptCde"/>
        </el-form-item>
        <el-form-item prop="cSafetyNo" label="任务号">
          <el-input
            v-model="queryParams.cSafetyNo"
            placeholder="任务号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item prop="name" label="公司名称">
          <el-input
            v-model="queryParams.name"
            placeholder="公司名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item prop="expert" label="平台名称">
          <el-input
            v-model="queryParams.expert"
            placeholder="平台名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <dictionary
            class="qryForm-select-size"
            v-model="queryParams.status"
            type-code="UPLOADSTATUS"
            :multiple= "true"
          />
        </el-form-item>
      </el-form>
      <div class="search-button">
          <el-button type="primary" @click="handleQuery"
            ><i-ep-search />搜索</el-button>
          <el-button @click="resetQuery"><i-ep-refresh />重置</el-button>
      </div>
      
    </div>

    <el-card shadow="never" class="table-container">
      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="preventionList"
        highlight-current-row
        border
      >
        <el-table-column label="平台名称" prop="expert" align="center" />
        <el-table-column label="机构" prop="institution" align="center" />
        <el-table-column label="任务号" prop="keywords" align="center"/>
        <el-table-column label="公司名称" prop="name" align="center"/>
        <el-table-column label="状态" prop="status" align="center"/>
        <el-table-column label="描述" prop="partner" align="center"/>
        <el-table-column label="上传时间" prop="apptime" align="center" />
        <el-table-column fixed="right" label="操作" align="center">
          <template #default="scope">
            <el-tooltip
              class="box-item"
              effect="light"
              content="重传"
              placement="top-start">
             <el-button
              type="warning"
              size="small"
              link
              v-show="scope.row.status == '上传失败'"
            ><i-ep-position /></el-button>
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

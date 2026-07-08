<!--模板管理-->
<script setup lang="ts">

import { getTemplateList, deleteTemplate } from "@/api/basicInfo";
import { DictTypePageVO, DictTypeQuery, DictTypeForm } from "@/api/dict/types";
import { useRouter, useRoute } from "vue-router";
import { codelistQuery } from "@/api/dict";
const router = useRouter();

defineOptions({
  name: "template",
  inheritAttrs: false,
});
const queryFormRef = ref(ElForm);
const loading = ref(false);
const total = ref(0);

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  cTplNme: '',
  cKindNo: '',
  cProdNo: '',
});
const templateList = ref<DictTypePageVO[]>();
const cKindNoList = ref<OptionType[]>([]);
const cProdNoList = ref<OptionType[]>([]);
const formData = reactive<DictTypeForm>({});

onMounted(() => {
  handleQuery();
  refreshData();
});

const refreshData = () => {
  const param = {
    codeListName: "KIND_LIST_GRT",
    codeListParam: null
  }
  // 查询列表数据
  codelistQuery(param).then((response) => {
    if (response.code === 200) {
      cKindNoList.value = response.data; 
    } else {
      ElMessage.error(response.msg);
    }
  });
};

const changecKindNo = (val:string) => {
  const param = {
    codeListName: "PROD_LIST",
    codeListParam:{"cParCde": val}
  }
  // 查询列表数据
  codelistQuery(param).then((response) => {
    if (response.code === 200) {
      cProdNoList.value = response.data; 
    } else {
      ElMessage.error(response.msg);
    }
  });
};

/** 查询 */
function handleQuery() {
  loading.value = true;
  // 转换参数格式
  const requestParams = {
    pageNo: queryParams.pageNo,
    pageSize: queryParams.pageSize,
    "PrdProdTemplate.CTplNme": queryParams.cTplNme,
    "Base.cKindNo": queryParams.cKindNo,
    "PrdProdTemplate.CProdNo": queryParams.cProdNo,
    "PrdProdTemplate.CCrtCde": "02000001"
  };
  getTemplateList(requestParams)
    .then((res) => {
        const {code,data,msg} = res;
        if(200===code){
            templateList.value = res.res;
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
 * 重置
 */
function resetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNo = 1;
  handleQuery();
}

function handleSelectionChange(_: any) {}

// 编辑
function jumpPage(row: any) {
    router.push({
        path: "/pcisapp/myPage",
        query: {
          param: JSON.stringify({ ...row, ...{ pageType: "template", cPkId: row.cPkId } }),
        },
    });
}

/** 删除 */
function handleDelete(typeId?: string) {
  ElMessageBox.confirm("确认删除这条数据吗?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteTemplate({cPkId: typeId}).then((res) => {
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
</script>

<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="模板名称" prop="cTplNme">
          <el-input
            v-model="queryParams.cTplNme"
            placeholder="模板名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="产品大类" prop="cKindNo">
          <el-select
            v-model="queryParams.cKindNo"
            @change="changecKindNo(queryParams.cKindNo)"
            placeholder="请选择"
            filterable
            clearable>
            <el-option v-for="item in cKindNoList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品" prop="cProdNo">
          <el-select
            v-model="queryParams.cProdNo"
            placeholder="产品"
            filterable
            clearable>
            <el-option v-for="item in cProdNoList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
      </el-form>
       <div style="display: flex; justify-content: flex-end;">
          <el-button type="primary" @click="handleQuery"><i-ep-search />搜索</el-button>
          <el-button @click="resetQuery"> <i-ep-refresh />重置</el-button>
       </div>
    </div>
    <el-card shadow="never" class="table-container">
      <el-table
        v-loading="loading"
        highlight-current-row
        :data="templateList"
        border
        @selection-change="handleSelectionChange">

        <el-table-column label="模板名称" prop="cTplNme" align="center"/>
        <el-table-column label="说明" prop="cDesc" align="center"/>
        <el-table-column label="操作" align="center" width="220">
          <template #default="scope">
             <el-tooltip
              class="box-item"
              effect="light"
              content="编辑"
              placement="top-start">
             <el-button
              type="primary"
              link
              size="small"
              @click.stop="jumpPage(scope.row)"
              ><i-ep-edit /></el-button>
             </el-tooltip>
             <el-tooltip
              class="box-item"
              effect="light"
              content="删除"
              placement="top-start">
              <el-button
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
        v-model:page="queryParams.pageNo"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery"
      />
    </el-card>
  </div>
</template>

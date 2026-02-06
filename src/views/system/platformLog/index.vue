<!--平台日志管理-->
<script setup lang="ts">
import { useRouter } from "vue-router";
import { getPlatformList } from "@/api/query";
import request from "@/utils/request";
import { DocumentCopy } from "@element-plus/icons-vue";
import { saveAs } from "file-saver";

const router = useRouter();

defineOptions({
  name: "platformLog",
  inheritAttrs: false,
});

const queryFormRef = ref(ElForm);
const loading = ref(false);
const exportLoading = ref(false);
const total = ref(0);

// 格式化日期时间为 yyyy-MM-dd HH:mm:ss
const formatDateTime = (date: Date | string) => {
  let d: Date;
  if (typeof date === 'string') {
    d = new Date(date);
  } else {
    d = date;
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setTime(start.getTime() - 3600 * 1000 * 24 * 7); // 7天前
  return [formatDateTime(start), formatDateTime(end)];
};

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  cAppNo: '',
  cPlyNo: '',
  cTyp: 'A',
  addressType: 'sd',
  tStartTm: '',
  tEndTm: '',
});

const dateRange = ref(getDefaultDateRange());

const cTypOptions = [
  { label: '保单', value: 'A' },
  { label: '批单', value: 'E' }
];

const addressTypeOptions = [
  { label: '四川', value: 'sc' },
  { label: '山东危货', value: 'wy' },
  { label: '浙江', value: 'zj' },
  { label: '其他', value: 'sd' }
];

const platformLogList = ref([]);

onMounted(() => {
  // 初始化时间范围
  dateRange.value = getDefaultDateRange();
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.tStartTm = dateRange.value[0];
    queryParams.tEndTm = dateRange.value[1];
  }
  handleQuery();
});

const handleDateRangeChange = (val: any) => {
  if (val && val.length === 2) {
    // 日期选择器返回的已经是格式化后的字符串
    queryParams.tStartTm = val[0];
    queryParams.tEndTm = val[1];
  } else {
    queryParams.tStartTm = '';
    queryParams.tEndTm = '';
  }
};

const formatcSucMrk = (status: number | string) => {
  const statusMap: Record<string, string> = {
    '1': '成功',
    '0': '未上传',
    '9': '失败'
  };
  return statusMap[String(status)] || '-';
};

const formatDocType = (type: string) => {
  const typeMap: Record<string, string> = {
    'A': '保单',
    'E': '批单'
  };
  return typeMap[type] || type;
};

function handleQuery() {
  loading.value = true;
  const requestParams = {
    pageNum: queryParams.pageNum,
    pageSize: queryParams.pageSize,
    cAppNo: queryParams.cAppNo,
    cPlyNo: queryParams.cPlyNo,
    cTyp: queryParams.cTyp,
    addressType: queryParams.addressType,
    tStartTm: queryParams.tStartTm,
    tEndTm: queryParams.tEndTm,
  };
  getPlatformList(requestParams)
    .then((res) => {
      const { code, data, msg, total: resTotal } = res;
      if (code === 200) {
        platformLogList.value = data;
        total.value = resTotal ?? data.length ?? 0;
      } else {
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
  dateRange.value = getDefaultDateRange();
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.tStartTm = dateRange.value[0];
    queryParams.tEndTm = dateRange.value[1];
  } else {
    queryParams.tStartTm = '';
    queryParams.tEndTm = '';
  }
  queryParams.pageNum = 1;
  queryParams.cTyp = 'A';
  queryParams.addressType = 'sd';
  handleQuery();
}

/**
 * 导出
 */
function handleExport() {
  const requestParams = {
    cAppNo: queryParams.cAppNo,
    cPlyNo: queryParams.cPlyNo,
    cTyp: queryParams.cTyp,
    addressType: queryParams.addressType,
    tStartTm: queryParams.tStartTm,
    tEndTm: queryParams.tEndTm,
  };

  exportLoading.value = true;
  request.post('/policy/exportPlatformList', requestParams, {
    responseType: 'blob'
  }).then((res: any) => {
    exportLoading.value = false;
    if (!res.data || (res.data.size && res.data.size <= 0)) {
      ElMessage.error({ message: '下载出错', duration: 3000 });
      return;
    }
    const fileName = `平台日志.xlsx`;
    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
  }).catch((err: any) => {
    exportLoading.value = false;
    ElMessage.error({ message: err?.message || '导出失败', duration: 3000 });
  });
}

/**
 * 复制文本
 */
const copyText = (text: any) => {
  if (!text) {
    ElMessage.warning('没有可复制的内容');
    return;
  }

  // 检查 navigator.clipboard 是否存在
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(
      () => {
        ElMessage.success('复制成功');
      },
      () => {
        ElMessage.error('复制失败');
      }
    );
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      ElMessage.success('复制成功');
    } catch (err) {
      ElMessage.error('复制失败');
    }
    document.body.removeChild(textarea);
  }
};
</script>

<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="申请单号" prop="cPlyNo">
          <el-input
              v-model="queryParams.cPlyNo"
              placeholder="申请单号"
              clearable
          />
        </el-form-item>
        <el-form-item label="保单号" prop="cAppNo">
          <el-input
            v-model="queryParams.cAppNo"
            placeholder="保单号"
            clearable
          />
        </el-form-item>
        <el-form-item label="单据类型" prop="cTyp">
          <el-select
            v-model="queryParams.cTyp"
            placeholder="请选择"
            filterable
            clearable>
            <el-option
              v-for="item in cTypOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="平台" prop="addressType">
          <el-select
            v-model="queryParams.addressType"
            placeholder="请选择"
            filterable>
            <el-option
              v-for="item in addressTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间区间" prop="dateRange">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="handleDateRangeChange"
          />
        </el-form-item>
      </el-form>
      <div style="display: flex; justify-content: flex-end;">
        <el-button type="primary" @click="handleQuery"><i-ep-search />搜索</el-button>
        <el-button @click="resetQuery"> <i-ep-refresh />重置</el-button>
        <el-button type="success" :loading="exportLoading" @click="handleExport"><i-ep-download />导出</el-button>
      </div>
    </div>
    <el-card shadow="never" class="table-container">
      <el-table
          v-loading="loading"
          highlight-current-row
          :data="platformLogList"
          border>

        <el-table-column label="申请单号/保单号" align="center" width="200">
          <template #default="scope">
            <div class="policy-info-cell">
              <div v-if="scope.row.cAppNo || scope.row.CAppNo" class="policy-number-row">
                <span>{{ scope.row.cAppNo || scope.row.CAppNo }}</span>
                <el-icon class="copy-icon"
                         @click="copyText(scope.row.cAppNo || scope.row.CAppNo)">
                  <DocumentCopy />
                </el-icon>
              </div>
              <div v-if="scope.row.cPlyNo || scope.row.CPlyNo" class="policy-number-row">
                <span>{{ scope.row.cPlyNo || scope.row.CPlyNo }}</span>
                <el-icon class="copy-icon"
                         @click="copyText(scope.row.cPlyNo || scope.row.CPlyNo)">
                  <DocumentCopy />
                </el-icon>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="单据类型" prop="cTyp" align="center" width="100">
          <template #default="scope">
            {{ formatDocType(scope.row.cTyp || scope.row.CTyp) }}
          </template>
        </el-table-column>
        <el-table-column label="是否成功" align="center" width="100">
          <template #default="scope">
            <el-tag :type="formatcSucMrk(scope.row)">
              {{ formatcSucMrk(scope.row.cSucMrk || scope.row.CSucMrk) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="平台返回信息" align="center" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.cPlatRetMsg || scope.row.CPlatRetMsg }}
          </template>
        </el-table-column>
        <el-table-column label="平台返回错误信息" align="center" show-overflow-tooltip min-width="300">
          <template #default="scope">
            {{ scope.row.cPlatErrMsg || scope.row.CPlatErrMsg }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间/更新时间" align="center" width="200">
          <template #default="scope">
            <div class="policy-info-cell">
              <div v-if="scope.row.tCrtTm || scope.row.TCrtTm" class="policy-number-row">
                <span>{{ scope.row.tCrtTm || scope.row.TCrtTm }}</span>
              </div>
              <div v-if="scope.row.tUpdTm || scope.row.TUpdTm" class="policy-number-row">
                <span>{{ scope.row.tUpdTm || scope.row.TUpdTm }}</span>
              </div>
            </div>
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

<style scoped lang="scss">
.policy-info-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.policy-number-row {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1.5;

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    text-align: center;
  }
}

.copy-icon {
  cursor: pointer;
  color: #409eff;
  margin-left: 5px;
}
</style>


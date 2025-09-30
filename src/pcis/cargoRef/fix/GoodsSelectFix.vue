<template>
  <div class="exchange-rate-container">
    <el-form :model="rateDetail" :rules="rules" ref="formRef">
      <el-form-item label="汇率标识" prop="cExchCde">
        <el-select v-model="rateDetail.cExchCde" style="width: 200px">
          <el-option label="实时汇率" value="1" />
          <el-option label="协议汇率" value="0" />
        </el-select>
        <el-button
            v-if="rateDetail.cExchCde === '0'"
            type="primary"
            @click="addNewRow"
            style="margin-left: 10px"
        >
          新增
        </el-button>
      </el-form-item>
    </el-form>

    <div v-if="rateDetail.cExchCde === '0'" class="table-wrapper">
      <el-table
          :data="rateDetail.nAmtExch"
          border
          style="width: 100%"
          height="300px"
          class="no-gap-table"
      >
        <el-table-column prop="currency" label="币种">
          <template #default="{ row }">
            <el-select
                v-model="row.label"
                placeholder="请选择币种"
                filterable
                style="width: 100%"
            >
              <el-option
                  v-for="item in availableCurrencies(row)"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column prop="rate" label="汇率">
          <template #default="{ row }">
            <el-input-number
                v-model="row.value"
                :precision="8"
                :step="0.0001"
                :min="0.0001"
                controls-position="right"
                style="width: 100%"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" >
          <template #default="{ row, $index }">
            <el-button
                size="small"
                type="danger"
                @click="deleteRow($index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="footer">
      <el-button type="primary" @click="saveAll">保存</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import cargoApi from "@/api/cargo";
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
});
const rateDetail = ref({
  cExchCde: '1',
  nAmtExch:[],
  cPrmCur:[]
})

const rules = {
  cExchCde: [{ required: true, message: '请选择汇率标识', trigger: 'change' }]
}

const currencies = ref([
  { value: 'USD', label: '美元' },
  { value: 'EUR', label: '欧元' },
  { value: 'JPY', label: '日元' },
  { value: 'GBP', label: '英镑' },
  { value: 'CNY', label: '人民币' },
  { value: 'HKD', label: '港币' },
  { value: 'AUD', label: '澳元' },
  { value: 'CAD', label: '加元' }
])


// 获取可用币种
const availableCurrencies = computed(() => {
  return (row) => {
    const usedCurrencies = rateDetail.value.nAmtExch
        .filter(item => item !== row && item.label)
        .map(item => item.label)
    return currencies.value.filter(c => !usedCurrencies.includes(c.value))
  }
})
onMounted( async () => {
  const data =  await cargoApi.queryPlan({
    "codeListName": "FIN_CUR_CACHE",
    "codeListParam": {}
  })
  if(data.code == 200){
    currencies.value = data.data
  }else{
    ElMessage.error(data.msg);
    return
  }
  const result =  await cargoApi.getRate({cEcAgrAppNo:props.data.cEcAgrAppNo})
  if(result.code == 200){
      rateDetail.value = result.data.data[0].rateDetail
  }else{
    ElMessage.error(result.msg);
    return
  }
});
// 获取币种标签
const getCurrencyLabel = (value) => {
  const currency = currencies.value.find(c => c.value === value)
  return currency ? currency.label : value
}

// 新增行
const addNewRow = () => {
  rateDetail.value.nAmtExch.push({
    value: '',
    label: ''
  })
}

// 删除行
const deleteRow = (index) => {
  ElMessageBox.confirm("此操作将删除该数据, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
      .then(() => {
        rateDetail.value.nAmtExch.splice(index, 1)
        ElMessage.success('删除成功')
        // 可以在这里调用 API 删除数据
      })
      .catch(() => {
        // 取消删除
      });
}

// 保存所有
const saveAll =async () => {
  if (rateDetail.value.cExchCde === '' || rateDetail.value.cExchCde === null || rateDetail.value.cExchCde === undefined) {
    ElMessage.warning('请先选择汇率')
    return
  }

  const result =  await cargoApi.saveRate({cEcAgrAppNo:props.data.cEcAgrAppNo,...rateDetail.value})
  if(result.code === 200){
    ElMessage.success(result.msg);
    if(typeof props.method.isOk == 'function'){
      props.method.isOk('success');
      return;
    }
  }else{
    ElMessage.error(result.msg);
    return
  }
}
</script>

<style scoped>
.exchange-rate-container {
  padding: 20px;
  max-width: 800px;
}

.table-wrapper {
  margin: 20px 0;
}

.footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 完全无间隔表格样式 */
:deep(.no-gap-table) {
  border-collapse: collapse;
  border-spacing: 0;
}

:deep(.no-gap-table .el-table__header-wrapper),
:deep(.no-gap-table .el-table__body-wrapper) {
  border: 1px solid var(--el-table-border-color);
}

:deep(.no-gap-table .el-table__header-wrapper) {
  border-bottom: none;
}

:deep(.no-gap-table th.el-table__cell),
:deep(.no-gap-table td.el-table__cell) {
  border-right: 1px solid var(--el-table-border-color) !important;
  border-bottom: 1px solid var(--el-table-border-color) !important;
  padding: 8px 0;
}

:deep(.no-gap-table th.el-table__cell:first-child),
:deep(.no-gap-table td.el-table__cell:first-child) {
  border-left: 1px solid var(--el-table-border-color) !important;
}

:deep(.no-gap-table .el-table__inner-wrapper::before),
:deep(.no-gap-table .el-table__inner-wrapper::after) {
  display: none;
}

:deep(.no-gap-table .el-table__header tr th:last-child),
:deep(.no-gap-table .el-table__body tr td:last-child) {
  border-right: 1px solid var(--el-table-border-color) !important;
}

/* 调整表头样式 */
:deep(.no-gap-table .el-table__header th) {
  background-color: #f5f7fa;
  font-weight: bold;
}

/* 调整操作按钮间距 */
:deep(.no-gap-table .el-button + .el-button) {
  margin-left: 8px;
}
</style>
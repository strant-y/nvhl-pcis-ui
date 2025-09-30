<template>
  <div class="echarts-tree-container">
    <!-- 查询表单 -->
    <el-form 
      :model="formModel"
      ref="formRef"
      label-width="120px"
      class="query-form"
    >
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="产品大类" prop="CKindNo">
            <el-cascader
              v-model="formModel.CKindNo"
              :options="kindOptions"
              :props="cascaderProps"
              clearable
              @change="handleKindChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="产品" prop="CProdNo">
            <el-cascader
              v-model="formModel.CProdNo"
              :options="prodOptions"
              :props="cascaderProps"
              clearable
              @change="handleProdChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="条款代码" prop="CTermNo">
            <el-input
              v-model="formModel.CTermNo"
              clearable
              @change="handleTermChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="险别代码" prop="CCvrgNo">
            <el-input
              v-model="formModel.CCvrgNo"
              clearable
              @change="handleCvrgChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="责任代码" prop="CRiskNo">
            <el-input
              v-model="formModel.CRiskNo"
              clearable
              @change="handleRiskChange"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- ECharts 图表 -->
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useUserStore } from "@/store/modules/user";
import { EchartsService } from '../service/echarts/echarts.service'
import { AppKey } from '@/constants/api'
const userStore = useUserStore();
interface FormModel {
  CKindNo?: string[]
  CProdNo?: string[]
  CTermNo?: string
  CCvrgNo?: string
  CRiskNo?: string
  CDataTyp?: string
}

// 响应式数据
const formRef = ref<FormInstance>()
const chartRef = ref<HTMLDivElement>()
const chartInstance = ref<echarts.ECharts>()
const formModel = ref<FormModel>({})
const loading = ref(false)
const kindOptions = ref([])
const prodOptions = ref([])
const echartsService = new EchartsService()

// 级联选择器配置
const cascaderProps = {
  value: 'value',
  label: 'label',
  children: 'children'
}

// 获取用户信息
const user = userStore.user

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chartInstance.value = echarts.init(chartRef.value)
  }
}

// 处理产品大类变化
const handleKindChange = (value: string[]) => {
  if (value) {
    formModel.value.CTermNo = ''
    formModel.value.CCvrgNo = ''
    formModel.value.CRiskNo = ''
  }
}

// 处理产品变化
const handleProdChange = (value: string[]) => {
  if (value) {
    formModel.value.CTermNo = ''
    formModel.value.CCvrgNo = ''
    formModel.value.CRiskNo = ''
  }
}

// 处理条款代码变化
const handleTermChange = (value: string) => {
  if (value) {
    formModel.value.CKindNo = []
    formModel.value.CCvrgNo = ''
    formModel.value.CRiskNo = ''
  }
}

// 处理险别代码变化
const handleCvrgChange = (value: string) => {
  if (value) {
    formModel.value.CKindNo = []
    formModel.value.CTermNo = ''
    formModel.value.CRiskNo = ''
  }
}

// 处理责任代码变化
const handleRiskChange = (value: string) => {
  if (value) {
    formModel.value.CKindNo = []
    formModel.value.CTermNo = ''
    formModel.value.CCvrgNo = ''
  }
}

// 获取产品树数据
const getPrdTreeData = async (params: any) => {
  try {
    loading.value = true
    const res = await echartsService.getPrdTreeList(params)
    if (res?.code === 200) {
      renderChart(res.data)
    }
  } catch (error) {
    ElMessage.error('获取产品树数据失败')
  } finally {
    loading.value = false
  }
}

// 获取条款树数据
const getTermTreeData = async (params: any) => {
  try {
    loading.value = true
    const res = await echartsService.getTermTreeList(params)
    if (res?.code === 200) {
      renderChart(res.data)
    }
  } catch (error) {
    ElMessage.error('获取条款树数据失败')
  } finally {
    loading.value = false
  }
}

// 获取险别树数据
const getCvrgTreeData = async (params: any) => {
  try {
    loading.value = true
    const res = await echartsService.getCvrgTreeList(params)
    if (res?.code === 200) {
      renderChart(res.data)
    }
  } catch (error) {
    ElMessage.error('获取险别树数据失败')
  } finally {
    loading.value = false
  }
}

// 获取责任树数据
const getRiskTreeData = async (params: any) => {
  try {
    loading.value = true
    const res = await echartsService.getRiskTreeList(params)
    if (res?.code === 200) {
      renderChart(res.data)
    }
  } catch (error) {
    ElMessage.error('获取责任树数据失败')
  } finally {
    loading.value = false
  }
}

// 渲染图表
const renderChart = (data: any) => {
  const option = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    series: [
      {
        type: 'tree',
        data: [data],
        top: '1%',
        left: '20%',
        bottom: '1%',
        right: '20%',
        symbolSize: 7,
        label: {
          position: 'left',
          verticalAlign: 'middle',
          align: 'right',
          fontSize: 9
        },
        leaves: {
          label: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left'
          }
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750
      }
    ]
  }
  chartInstance.value?.setOption(option)
}

// 查询
const handleQuery = async () => {
  const params = {
    CurrentUser: user['opCde'],
    CurrentUserOrg: user['companyId'],
    ...formModel.value
  }

  if (!formModel.value.CProdNo && !formModel.value.CTermNo &&
      !formModel.value.CCvrgNo && !formModel.value.CRiskNo) {
    ElMessage.warning('产品代码、条款代码、险别代码、责任代码不能都为空')
    return
  }

  if (formModel.value.CProdNo) {
    await getPrdTreeData(params)
  }
  if (formModel.value.CTermNo) {
    await getTermTreeData(params)
  }
  if (formModel.value.CCvrgNo) {
    await getCvrgTreeData(params)
  }
  if (formModel.value.CRiskNo) {
    await getRiskTreeData(params)
  }
}

// 重置
const handleReset = () => {
  formRef.value?.resetFields()
  formModel.value.CDataTyp = 'app'
}

// 生命周期钩子
onMounted(() => {
  initChart()
  handleQuery()
})
</script>

<style lang="scss" scoped>
.echarts-tree-container {
  padding: 20px;
  
  .query-form {
    margin-bottom: 20px;
  }

  .chart-container {
    width: 100%;
    height: 700px;
  }
}
</style>

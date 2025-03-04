<template>
  <div class="ratiosm" style="display: flex;">
    <el-col :sm="16" :offset="1" style="padding-top: 20px;" class="sub_index">
      <el-button-group style="display: block;">
        <el-button v-for="chat in chats" :key="chat.type" :type="chartActive === chat.type ? 'primary' : ''"
          @click="initChartRecordProd(chat.type)">
          {{ chat.name }}
        </el-button>
      </el-button-group>
      <div class="banner-chart-one">
        <div ref="recordChart" :style="{ width: chartWidth, height: chartHeight }"></div>
      </div>
    </el-col>

    <el-col v-if="pieChartConfig" :sm="6" :xs="0" :offset="1" class="bgwhite total-right">
      <h3 class="chart-title">{{ pieChartConfig.name }}</h3>
      <p class="chart-tab">
        <a :class="{ active: 'd' === pieChartActive }" @click="initChartPieRecProd(pieChartConfig.type, 'd')">今日</a>
        <a :class="{ active: 'w' === pieChartActive }" @click="initChartPieRecProd(pieChartConfig.type, 'w')">本周</a>
        <a :class="{ active: 'm' === pieChartActive }" @click="initChartPieRecProd(pieChartConfig.type, 'm')">本月</a>
      </p>
      <div class="banner-chart-two">
        <div ref="pieChart" :style="{ width: chartWidth, height: chartHeighttwo }"></div>
      </div>
      <div class="record-total">
        <!-- <p class="record-p">{{ totalChartConfig.title?.d }}<br/>{{ personalStaticsData.d }}</p>
        <p class="record-p">{{ totalChartConfig.title?.w }}<br/>{{ personalStaticsData.w }}</p>
        <p class="record-p">{{ totalChartConfig.title?.m }}<br/>{{ personalStaticsData.m }}</p> -->
        <p class="record-p">今日总录单<br />{{ personalStaticsData.d }}</p>
        <p class="record-p">本周总录单<br />{{ personalStaticsData.w }}</p>
        <p class="record-p">本月总录单<br />{{ personalStaticsData.m }}</p>
      </div>
    </el-col>
  </div>

  <el-col :xs="22" :offset="1" style="padding-top: 20px;" class="ratioxs">
    <el-button-group>
      <el-button v-for="chat in chats" :key="chat.type" :type="chartActive === chat.type ? 'primary' : ''"
        @click="initChartRecordProd(chat.type)">
        {{ chat.name }}
      </el-button>
    </el-button-group>
    <div class="banner-chart-one">
      <div ref="recordChartXs" :style="{ width: chartWidth, height: chartHeight }"></div>
    </div>
  </el-col>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'
import { EchartsService, ChartConfig } from '@/views/charts/service/echarts/echarts.service'
import { useUserStore } from "@/store";

export default defineComponent({
  name: 'EchartsView',
  setup() {
    const userStore = useUserStore();

    const chartWidth = ref('100%')
    const chartHeight = ref('250px')
    const chartHeighttwo = ref('150px')
    const optionsMapCity = ref<EChartsOption>({})
    const titleMapCity = ref('')
    const optionsMapProvince = ref<EChartsOption>({})
    const titleMapProvince = ref('')
    const optionsPieProd = ref<EChartsOption>({})
    const titlePieProd = ref('')
    const optionsBarTMProd = ref<EChartsOption>({})
    const titleBarTMProd = ref('')
    const optionsBarOrgProd = ref<EChartsOption>({})
    const titleBarOrgProd = ref('')
    const optionsBarChaProd = ref<EChartsOption>({})
    const titleBarChaProd = ref('')
    const optionsRecordProd = ref<EChartsOption>({})
    const optionsPieRecProd = ref<EChartsOption>({})
    const chartActive = ref('')
    const pieChartActive = ref('d')
    const personalStaticsData = ref({
      d: 0,
      w: 0,
      m: 0
    })
    const echartsService = new EchartsService()
    const user = ref(userStore.user) || ref({})
    const roles = ref(userStore.user.roles)
    // const chats = ref([])
    const chats = ref([{ name: "出单量统计图", type: 'primary' }, { name: "保费统计图", type: '' }])
    // const pieChartConfig = ref(null)
    const pieChartConfig = ref({ name: "渠道出单量统计图", type: 'primary' })
    const totalChartConfig = ref<any>({})

    const { getEchartsData, getRoleChatsList } = echartsService

    // ECharts实例
    const recordChart = ref<HTMLElement | null>(null)
    const pieChart = ref<HTMLElement | null>(null)
    const recordChartXs = ref<HTMLElement | null>(null)

    let recordChartInstance: ECharts | null = null
    let pieChartInstance: ECharts | null = null
    let recordChartXsInstance: ECharts | null = null

    // 初始化ECharts实例
    const initECharts = () => {
      nextTick(() => {
        if (recordChart.value) {
          recordChartInstance = echarts.init(recordChart.value)
          recordChartInstance.setOption(optionsRecordProd.value)
          console.log('11111111111111111')
        }
        if (pieChart.value) {
          pieChartInstance = echarts.init(pieChart.value)
          pieChartInstance.setOption(optionsPieRecProd.value)
          console.log('222222222222222')
        }
        if (recordChartXs.value) {
          recordChartXsInstance = echarts.init(recordChartXs.value)
          recordChartXsInstance.setOption(optionsRecordProd.value)
          console.log('333333333333333')
        }
      })
    }
    const init = () => {
      // chats.value = [];
      if (roles.value && roles.value.length > 0) {
        const role = roles.value;
        if (role) {
          getRoleChatsList({
            pageNo: 1,
            pageSize: 10,
            COpgrpCde: role
          }).then((res: any) => {
            if (null != res && null != res['code']) {
              if (res['code'] === 200) {
                if (chats.value.length > 0) {
                  chats.value = [];
                }
                const pageData = res.data;
                if (pageData && pageData.result) {
                  pageData.result.forEach(item => {
                    if (!!item && !!item['cType']) {
                      // 构造图表
                      let titles = ''
                      switch (item['cType']) {
                        case 'L':
                          chats.value.push(new ChartConfig({
                            name: item['cName'],
                            type: item['cCode']
                          }));
                          break;
                        case 'RT':
                          pieChartConfig.value = new ChartConfig({
                            name: item['cName'],
                            type: item['cCode'],
                          });
                          initChartPieRecProd(item['cCode'], 'd'); // 右上饼图
                          break;
                        case 'RB':
                          totalChartConfig.value = new ChartConfig({
                            name: item['cName'],
                            type: item['cCode']
                          });
                          titles = item['cName'].split(',');
                          totalChartConfig.value.title = {
                            d: titles[0],
                            w: titles[1],
                            m: titles[2]
                          };
                          initPersonalStatics(item['cCode']); // 右下字
                          break;
                      }
                      // 加载图表数据
                      if (chats.value.length > 0) {
                        initChartRecordProd(chats.value[0].type);
                      }
                    }
                  });
                }
              }
            }
          });
        }
      }
    }


    // 监听图表选项变化
    watch(optionsRecordProd, (newOptions: EChartsOption) => {
      if (recordChartInstance) {
        recordChartInstance.setOption(newOptions)
      }
      if (recordChartXsInstance) {
        recordChartXsInstance.setOption(newOptions)
      }
    })

    watch(optionsPieRecProd, (newOptions: EChartsOption) => {
      if (pieChartInstance) {
        pieChartInstance.setOption(newOptions)
      }
    })

    // 组件挂载时初始化图表
    onMounted(() => {
      initECharts()
      init()
    })

    // 窗口大小变化时重置图表
    window.addEventListener('resize', () => {
      if (recordChartInstance) {
        recordChartInstance.resize()
      }
      if (pieChartInstance) {
        pieChartInstance.resize()
      }
      if (recordChartXsInstance) {
        recordChartXsInstance.resize()
      }
    })
    /**
     * 个人出单统计
     */
    const initPersonalStatics = (typ) => {
      const param = {
        'type': typ,
        'currentUser': user.value['opCde'],
        'currentOrg': user.value['companyId']
      };
      echartsService.getEchartsData(param)
        .then(result => {
          if (result['dataMapList']) {
            if (null != result['dataMapList'][0]) {
              personalStaticsData.value.d = result['dataMapList'][0];
            }
            if (null != result['dataMapList'][1]) {
              personalStaticsData.value.w = result['dataMapList'][1];
            }
            if (null != result['dataMapList'][2]) {
              personalStaticsData.value.m = result['dataMapList'][2];
            }
          } else {
            personalStaticsData.value.d = 0;
            personalStaticsData.value.w = 0;
            personalStaticsData.value.m = 0;
          }
        }, error => {
          console.log('err: ', error);
          ElMessage.error('后台服务异常,请联系管理员:' + error)
        });
    }
    /**
     * banner部分产品出单统计
     * */
    const initChartRecordProd = (type: string) => {
      chartActive.value = type
      const param = {
        type: 'countMoneyAtRecord',
        currentUser: user.value ? user.value.opCde : '',
        currentOrg: user.value ? user.value.companyId : '',
        recordType: type
      }
      const data = [
        {
          name: '02-01',
          value: 100
        },
        {
          name: '06-10',
          value: 500
        },
        {
          name: '12-02',
          value: 1000
        }
      ]
      optionsRecordProd.value = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        color: [
          '#f57c11'
        ],
        grid: {
          left: '0',
          right: '3%',
          bottom: '5%',
          top: '5%',
          // height: 150,
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          axisLabel: {
            show: true,
            color: '#fff'
          },
          axisLine: { // x轴的颜色和宽度
            lineStyle: {
              color: '#fff',
              width: 1
            }
          },
          boundaryGap: false,
          data: data.map((item: any) => item.name)
        }],
        yAxis: [{
          type: 'value',
          axisLabel: { // y轴的字体样式
            show: true,
            color: '#fff'
          },
          axisLine: { // y轴的颜色和宽度
            lineStyle: {
              color: '#fff',
              width: 0
            }
          }
        }],
        series: [{
          type: 'line',
          stack: '总量',
          areaStyle: {},
          data: data.map((item: any) => item.value)
        }]
      }
      getEchartsData(param).then(result => {
        const data = result.dataMapList
        const totals = new Array<number>();
        const days = new Array<string>();
        if (result['dataMapList']) {
          result['dataMapList'].forEach((v) => {
            totals.push(v['TOTAL']);
            days.push(v['DAY']);
          });
        }
        titleBarTMProd.value = '12个月中全部产品含税保费统计 单位:万元';
        optionsRecordProd.value = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#6a7985'
              }
            }
          },
          color: [
            '#f57c11'
          ],
          grid: {
            left: '0',
            right: '3%',
            bottom: '5%',
            top: '5%',
            // height: 150,
            containLabel: true
          },
          xAxis: [{
            type: 'category',
            axisLabel: {
              show: true,
              color: '#fff'
            },
            axisLine: { // x轴的颜色和宽度
              lineStyle: {
                color: '#fff',
                width: 1
              }
            },
            boundaryGap: false,
            data: days
          }],
          yAxis: [{
            type: 'value',
            axisLabel: { // y轴的字体样式
              show: true,
              color: '#fff'
            },
            axisLine: { // y轴的颜色和宽度
              lineStyle: {
                color: '#fff',
                width: 0
              }
            }
          }],
          series: [{
            type: 'line',
            stack: '总量',
            areaStyle: {},
            data: totals
          }]
        }
      }).catch(error => {
        console.log('err: ', error)
        ElMessage.error('后台服务异常,请联系管理员:' + error)
      })
    }
    /**
     * banner全部渠道产品统计
     * */
    const initChartPieRecProd = (type: string, timeType: string) => {
      pieChartActive.value = timeType
      const param = {
        type: 'countMoneyAtPie',
        currentUser: user.value ? user.value.opCde : '',
        currentOrg: user.value ? user.value.companyId : '',
        recordType: type,
        timeType: timeType
      }

      //todo假数据
      optionsPieRecProd.value = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        color: [
          '#38a2db',
          '#32c5e9',
          '#ffdb5b',
          '#ff9e7e',
          '#67e1e3',
          '#fb7193',
          '#9d96f5',
          '#e062ae',
          '#9fe6b8',
          '#e790d2'
        ],
        legend: {
          orient: 'vertical',
          align: 'left',
          left: '70',
          top: '25',
          textStyle: {
            color: '#fff',
          },
          data: ['name1', 'name2', 'name3']
        },
        series: [{
          name: '单量：',
          type: 'pie',
          radius: ['50%', '70%'],
          center: ['65%', '50%'],
          avoidLabelOverlap: false,
          label: {
            // show: false,
            position: 'center',
            // formatter: '{b}: {c} ({d}%)',
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 100, name: 'name1' },
            { value: 600, name: 'name2' },
            { value: 800, name: 'name3' },
          ]
        }]
      }

      getEchartsData(param).then(result => {
        const data = new Array<any>();
        const name = new Array<string>();
        if (result['dataMapList']) {
          result['dataMapList'].forEach((v) => {
            name.push(v['name']);
            data.push({ value: +v['total'], name: v['name'] });
          });
        }
        titlePieProd.value = '全部产品含税保费统计 单位:万元';
        optionsPieRecProd.value = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          color: [
            '#38a2db',
            '#32c5e9',
            '#ffdb5b',
            '#ff9e7e',
            '#67e1e3',
            '#fb7193',
            '#9d96f5',
            '#e062ae',
            '#9fe6b8',
            '#e790d2'
          ],
          legend: {
            orient: 'vertical',
            align: 'left',
            top: '25',
            textStyle: {
              color: '#fff',
            },
            data: name
          },
          series: [{
            name: '单量：',
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['65%', '50%'],
            avoidLabelOverlap: false,
            label: {
              // show: false,
              position: 'center',
              show: true,
              fontSize: '16',
              fontWeight: 'bold'
            },
            labelLine: {
              show: false
            },
            data: data
          }]
        }
      }).catch(error => {
        console.log('err: ', error)
        ElMessage.error('后台服务异常,请联系管理员:' + error)
      })
    }

    return {
      recordChart,
      pieChart,
      recordChartXs,
      chartWidth,
      chartHeight,
      chartHeighttwo,
      optionsMapCity,
      titleMapCity,
      optionsMapProvince,
      titleMapProvince,
      optionsPieProd,
      titlePieProd,
      optionsBarTMProd,
      titleBarTMProd,
      optionsBarOrgProd,
      titleBarOrgProd,
      optionsBarChaProd,
      titleBarChaProd,
      optionsRecordProd,
      optionsPieRecProd,
      chartActive,
      pieChartActive,
      personalStaticsData,
      user,
      roles,
      chats,
      pieChartConfig,
      totalChartConfig,
      initChartRecordProd,
      initChartPieRecProd
    }
  }
})
</script>

<style lang="scss" scoped>
/*.banner-chart-one{*/
/*height:200px;*/
/*}*/
.bgwhite {
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 0 5px 5px 0;
  height: 310px;
}

.chart-title {
  color: #fff;
  text-align: center;
  line-height: 20px;
  // padding-top: 20px;
}

.chart-tab {
  width: 223px;
  margin: 10px auto;
  padding-left: 35px;
}

.chart-tab a {
  font-size: 12px;
  background: rgba(0, 0, 0, 0.2);
  display: inline-block;
  padding: 2px 3px;
  margin-right: 28px;
  color: #fff;
}

.chart-tab a.active {
  font-size: 12px;
  background: #fc9a26;
  color: #fff;
}

.banner-chart-two {
  margin-left: 30px;
}

.banner-chart-one {
  opacity: 0.8;
  filter: alpha(opacity=80)
}

.record-total {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff
}

.record-total .record-p {
  width: 33.33%;
  display: inline-block;
  font-size: 14px;
  line-height: 24px;
  text-align: center;
  background: url('@/assets/img/linearwhite.png') right center no-repeat;
  float: left;
}

@media (max-width: 1400px) {
  .bgwhite {
    height: 260px;
  }

  .banner-chart-two {
    margin-top: -15px;
  }
}

@media (max-width: 992px) {
  .total-right {

    //display: none;
    .record-total .record-p {
      font-size: 12px;
    }
  }

  .ratiosm {
    display: none;
  }
}

@media (min-width: 992px) {
  .ratioxs {
    display: none;
  }

}
</style>

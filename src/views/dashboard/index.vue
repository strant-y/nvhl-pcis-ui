<template>
  <div class="dashboard-container">
    <div class="home">
      <div class="top-box">
        <div class="top-title1">财险承保系统</div>
        <div class="top-title2">智能高效助力承保，精准把控风险，让财险业务开展更顺畅无忧</div>
        <div class="top-search">
          <rtinput v-model="searchValue" :item="searchItem" />
          <rtButton :item="searchBtnItem" />
        </div>
        <div class="top-menu">
          <div class="menu-label">
            <i class="flex-center fast-edit">
              <el-button
                title="修改快捷菜单"
                type="primary"
                @click="openShortcutEdit"
                circle
                plain
                icon="Edit"
                size="small"
              />
            </i>
            热搜菜单:
          </div>
          <div class="top-menu-list">
            <span v-for="item in shorMenuList" :key="item.name">{{item.name}}</span>
          </div>
        </div>
      </div>
      <div class="center-box">
        <div class="center-content1">
          <div class="title-box">
            <div class="title-line">
              <span class="title">统计图</span>
              <img class="icon" :src="labelIcon" alt="">
            </div>
          </div>
          <div class="statistic-tab-box">
            <el-tabs @tab-click="handleStatisticTabClick">
              <el-tab-pane v-for="tab in statisticTabList" :key="tab" :label="tab">
              </el-tab-pane>
            </el-tabs>
            <!-- <span v-for="item in statisticTabList" :key="item" class="tab-item" @click="handleTabClick(item)">{{ item }}</span> -->
          </div>
          <div class="content-details-box">
            <div class="content-details">
              <span class="round"></span>
              <span class="details-title">今日总录单：</span>
              <span class="details-content">{{ dayTotalRecords }}单</span>
            </div>
            <div class="content-details">
              <span class="round"></span>
              <span class="details-title">本周总录单：</span>
              <span class="details-content">{{ weekTotalRecords }}单</span>
            </div>
            <div class="content-details">
              <span class="round"></span>
              <span class="details-title">本月总录单：</span>
              <span class="details-content">{{ monthTotalRecords }}单</span>
            </div>
            <!-- <div class="content-details">
              <span class="round"></span>
              <span class="details-title">总占比录单：</span>
              <span class="details-content">7.70%</span>
            </div> -->
          </div>
          <div class="content-charts-box">
            <div class="tab-box">
              <div class="tab-btns">
                <rtButton :item="issueBtnItem"/>
                <rtButton :item="nPrmBtnItem"/>
              </div>
            </div>
            <div class="echarts-box">
              <div ref="ecahrtsRef" class="echarts-container" :style="{ width: chartWidth, height: chartHeight }"></div>
            </div>
          </div>
        </div>
        <div class="center-content2">
          <div class="user-box">
            <img :src="headIcon" alt="">
            <div class="user-info">
              <div class="user-name">{{ user.opCnm }}</div>
              <rtButton :item="{label:'出单测试',size: 'small'}" />
            </div>
          </div>
          <div class="content-list-box">
            <div class="list-title">
              <div class="title-line">
                <span class="title">消息通知</span>
                <img class="icon" :src="labelIcon" alt="">
              </div>
              <rtButton :item="{label:'查看全部',type:'text'}" />
            </div>
            <div class="list-content">
              <div class="list-content-item" v-for="item in noticeList" :key="item.id">
                <div class="item-title">
                  <span class="title">{{ item.title }}</span>
                  <span class="point"></span>
                </div>
                <div class="item-content">{{ item.description }}</div>
              </div>
            </div>
          </div>
          <!-- <div class="content-list-box">
            <div class="list-title">
              <div class="title-line">
                <span class="title">待办事项</span>
                <img class="icon" :src="labelIcon" alt="">
              </div>
              <rtButton :item="{label:'查看全部',type:'text'}" />
            </div>
            <div class="list-content">
              <div class="list-content-item">
                <div class="item-title">
                  <span class="title">永安保险好物节</span>
                  <span class="point"></span>
                </div>
                <div class="item-content">大撒打发斯蒂芬撒打发斯蒂芬大师傅</div>
              </div>
              <div class="list-content-item">
                <div class="item-title">
                  <span class="title">永安保险好物节</span>
                  <span class="point"></span>
                </div>
                <div class="item-content">大撒打发斯蒂芬撒打发斯蒂芬大师傅</div>
              </div>
            </div>
          </div> -->
        </div>
      </div>
      <div class="bottom-box">
        <div class="title-box">
          <div class="title-line">
            <span class="title">出单任务</span>
            <img class="icon" :src="labelIcon" alt="">
          </div>
          <rtButton :item="moreBtnItem" />
        </div>
        <div class="table-box">
          <div class="tabs-box">
            <el-tabs @tab-click="handleTabClick">
              <el-tab-pane v-for="tab in tabs" :key="tab.name" :label="tab.name">
              </el-tab-pane>
            </el-tabs>
          </div>
          <div class="table">
            <app-table :key="currentTabName" :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
            @row-click="(row) => toQuery2(row, tab)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'
import { EchartsService, ChartConfig } from '@/views/charts/service/echarts/echarts.service'
import {useSettingsStore, useUserStore} from "@/store";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { tableObj, tab1, tab2 } from "./mapObj"
import moment from "moment";
import { PcisQueryService } from '@/views/dashboard/service/v1.service';
const pcisQueryService = new PcisQueryService();
import { useRouter } from "vue-router";
const router = useRouter();
import { AppKey } from '@/constants/api';
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { statisticProps } from 'element-plus';
const dzmodal = useDzModal();
const shortMenuDialog = defineAsyncComponent(() =>
  import("./components/shortMenuDialog.vue")
);


defineOptions({
  name: "Dashboard",
  inheritAttrs: false,
});

const searchValue = ref("");
const searchItem = {
  prop: "cQueryStr",
  inputtype: "rtinput",
  title: "",
  placeholder: "输入投保单号进行查询",
  itemWidth: 2,
  prefixIcon: "Search"
}
const searchBtnItem = {
  label: "投保单查询",
  type: "primary",
  func: () => {
    handleSearch(searchValue.value);
  },
}
const issueBtnItem = ref({
  label: "出单统计图",
  type: 'primary',
  func: () => {
    ecahrtsBtnIndex.value = 0
    echartsOptions.legend.data = ['每月出单量', '每月出单量同比']
    echartsOptions.series[0].name = '每月出单量'
    echartsOptions.series[1].name = '每月出单量同比'
    handleRefreshEcharts()
  },
})
const nPrmBtnItem = ref({
  label: "保费统计图",
  type: 'default',
  func: () => {
    ecahrtsBtnIndex.value = 1
    echartsOptions.legend.data = ['每月保费量', '每月保费量同比']
    echartsOptions.series[0].name = '每月保费量'
    echartsOptions.series[1].name = '每月保费量同比'
    handleRefreshEcharts()
  },
})
const moreBtnItem = ref({
  type:'text',
  label:'查看更多',
  func: () => {
    toQuery(moreurl.value)
  }
})
const labelIcon = "/src/assets/img/9.svg"
const ecahrtsRef = ref(null)
let ecahrtsRefInstance: ECharts | null = null
const chartWidth = ref('100%')
const chartHeight = ref('300px')
const userStore = useUserStore();
const user = userStore.user;
const roles = user.roles;
const currentTabName = ref('暂存任务') //tabs默认值
const isOperate = ref(false) //管理员 出单岗
const isAudit = ref(false) //  核保岗
const moreurl = ref('');
const shortListData = ref(null)  // 第二模块tabl列表数据
const headIcon = `/src/assets/images/${userStore.user.cCssStyle === '2' ? '0' : '1'}_.png`
const shorMenuList = ref([])// 快捷菜单列表

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
let tableconfig = reactive<AppTableConfig>(
  createTableEditConfig(tableObj.notWaitObj)
);

const echartsService = new EchartsService()
const { getAnalysis } = echartsService
const ecahrtsBtnIndex = ref(0)
const echartsOptions = reactive({
  barWidth: "10px",
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
    left: '5%',
    right: '5%',
    bottom: '25%',
    top: '5%',
    // height: 150,
    containLabel: true
  },
  legend: {
    data: ['每月出单量', '每月出单量同比'],
    bottom: 0,
    show: true,
  },
  xAxis: [{
    type: 'category',
    name: "月份",
    axisLabel: {
      show: true,
      // color: 'red'
    },
    axisLine: { // x轴的颜色和宽度
      lineStyle: {
        // color: 'red',
        width: 1
      }
    },
    boundaryGap: false,
    data: []
  }],
  yAxis: [
    {
      type: 'value',
      name: "总量",
      min: 0,
      // max: 1000,
      axisLabel: { // y轴的字体样式
        show: true,
        // color: 'red'
      },
      axisLine: { // y轴的颜色和宽度
        lineStyle: {
          
          width: 0
        }
      }
    },
    {
      type: 'value',
      name: "占比",
      min: 0,
      // max: 50,
      axisLabel: { // y轴的字体样式
        show: true,
        // color: 'red'
      },
      axisLine: { // y轴的颜色和宽度
        lineStyle: {
          // color: 'yellow',
          width: 0
        }
      }
    }
  ],
  series: [
    {
      type: 'bar',
      name: '每月出单量',
      data: [],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'red'// 起始颜色
          }, {
              offset: 1,
              color: 'white' // 结束颜色
          }]),
      barBorderRadius: [5, 5, 5, 5]
      }
    },
    {
      type: 'line',
      name: '每月出单量同比',
      yAxisIndex: 1,
      data: [],
      itemStyle: {
        color: 'yellow'
      }
    },
  ]
})
const tabs = ref<Array<any>>([]); //tabs数组
const statisticTabList = ref<Array<any>>([]);
const tabDataMap = ref({});
const currentTab = ref("");
// 今日总录单
const dayTotalRecords = computed(() => {
  const currentItem = tabDataMap.value[currentTab.value] || [];
  const dayInfo = currentItem.find((item:any) => item.unit === "day")
  const num = dayInfo ? dayInfo.num : 0
  return num
})
// 本周总录单
const weekTotalRecords = computed(() => {
  const currentItem = tabDataMap.value[currentTab.value] || [];
  const dayInfo = currentItem.find((item:any) => item.unit === "week")
  const num = dayInfo ? dayInfo.num : 0
  return num
})
// 本月总录单
const monthTotalRecords = computed(() => {
  const currentItem = tabDataMap.value[currentTab.value] || [];
  const dayInfo = currentItem.find((item:any) => item.unit === "month")
  const num = dayInfo ? dayInfo.num : 0
  return num
})

function init() {
  if(!ecahrtsRefInstance) {
    ecahrtsRefInstance = echarts.init(ecahrtsRef.value)
  }
  getOrderInfo()
}

function getOrderInfo() {
   getAnalysis({type:'ply_total'}).then((res:any) => {
    if(res.code === 200) {
      tabDataMap.value = res.dataMap;
      const keys = Object.keys(res.dataMap);
      currentTab.value = keys[0];
      statisticTabList.value = keys
      handleRefreshEcharts()
    } else {
      ElMessage.error(res.msg)
    }
  }).catch(err => {
    ElMessage.error(err)
  })
}

function handleStatisticTabClick(tab:any) {
  currentTab.value = tab.props.label
  handleRefreshEcharts()
}

function handleRefreshEcharts() {
  if(ecahrtsBtnIndex.value === 0) {
    issueBtnItem.value.type = "primary"
    nPrmBtnItem.value.type = "default"
  } else {
    issueBtnItem.value.type = "default"
    nPrmBtnItem.value.type = "primary"
  }
  const param = {
    type: ecahrtsBtnIndex.value === 0 ? 'ply' : 'fee'
  }
  getAnalysis(param).then((res:any) => {
    if(res.code === 200) {
      const data = res.dataMap[currentTab.value] || [];
      echartsOptions.xAxis[0].data = data.map((item:any) => item.item)
      echartsOptions.series[0].data = data.map((item:any) => item.value)
      echartsOptions.series[1].data = data.map((item:any) => item.rate)
      ecahrtsRefInstance?.setOption(echartsOptions)
    } else {
      ElMessage.error(res.msg)
    }
  }).catch(err => {
    ElMessage.error(err)
  })
}

onMounted(() => {
  init()
  initRoles()
  getNoticeData()
});

const initRoles = () => {
  tabs.value = [];
  getData(user, roles)
};
const getData = (user: any, roles: any = []) => {
  let roleCde = '';
  if (roles)
    roles.forEach((res: any) => {
      // if (res === 'ROLE_00000196' || res === 'ROLE_00000324' || res === 'ROLE_00000001') {
      // 出岗  ROLE_00000008
      console.log(res,'权限编码')
      if (res === 'ROLE_00000008') {
        isOperate.value = true;
        tabs.value = tab1;
          moreurl.value = "/query/application-querys"
      }
      // 核保
      if (res === 'ROLE_00000152') {
        tableconfig = reactive<AppTableConfig>(
          createTableEditConfig(tableObj.saveObj)
        );
        moreurl.value = "/pcis-new-udr-list/PendUdrList"
        isAudit.value = true;
        tabs.value = tab2;
      }
      roleCde = roleCde === '' ? res : `${roleCde},${res}`;
    });
  const paramzc = {
    pageNum: 1,
    pageSize: 6,
    udrType: 1,
    CAppStatus: '1',
    CurrentUser: user.opCde,
    CurrentUserOrg: user.companyId,
    TAppTmEnd: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
    TAppTmStart: moment(new Date(Date.now())).subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss'),
  };
  const paramhbzc = {
    pageNum: 1,
    pageSize: 6,
    companyId: user.companyId,
    orgCde: user.companyId,
    roleCde: roleCde,
    operId: user.opCde,
    startBsTm1: moment(new Date(Date.now())).subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss'),
    endBsTm1: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
    inNextDpt: '1',
    udrType: '0',
  };
  const paramdx = {
    pageNum: 1,
    pageSize: 6,
    roleCde: roleCde,
    operId: user.opCde,
    startBsTm1: moment(new Date(Date.now())).subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss'),
    endBsTm1: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
    orgCde: user.companyId,
    udrType: '4',
    inNextDpt: '1',
  };
  const param = {
    paramdx: paramdx,
    paramhbzc: paramhbzc,
    // paramdh: paramdh,
    paramzc: paramzc,
  };
  console.log('首页参数', param)
  pcisQueryService.getPolicyShortList(param).then((res: any) => {
    
    console.log('首页table数据', res)
    if (res && res.code === 200) {
      shortListData.value = res.data
      console.log('岗位--', isOperate.value , isAudit.value)
      // 管理员  出单岗
      if (isOperate.value) {
        pageresult.list = res.data.stagingList;
        pageresult.total = res.data.stagingList.length;
      }
      //审核员  核保岗
      if (isAudit.value) {
        tabs.value = tab2;
        pageresult.list = res.data.udrStagingList;
        pageresult.total = res.data.udrStagingList.length;
      }
    }
  });
};

const toChange = (url: string) => {
  moreurl.value = url;
};

//tabs切换
const handleTabClick = (tab: any) => {
  currentTabName.value = tab.props.label
  let url = ''
  const clickedTabData = tabs.value.find(t => t.name === tab.props.label);
  if (isOperate.value) {
    tableconfig = reactive<AppTableConfig>(
      createTableEditConfig(tableObj[clickedTabData.tableObj])
    )
    nextTick(() => {
      pageresult.list = shortListData.value[clickedTabData.refName] || []
      pageresult.total = shortListData.value[clickedTabData.refName].length  || 0
    });
  }
  if (isAudit.value) {
    tableconfig = reactive<AppTableConfig>(
      createTableEditConfig(tableObj[clickedTabData.tableObj])
    )
    nextTick(() => {
      pageresult.list = shortListData.value[clickedTabData.refName] || []
      pageresult.total = shortListData.value[clickedTabData.refName].length  || 0
      });
    // if (currentTabName.value == '暂存任务') {
    //   console.log(668,tableObj,clickedTabData)
    //   tableconfig = reactive<AppTableConfig>(
    //     createTableEditConfig(tableObj[clickedTabData.tableObj])
    //   )
    // } else {
    //   tableconfig = reactive<AppTableConfig>(
    //     createTableEditConfig(tableObj[clickedTabData.tableObj])
    //   )
    // }
  }
  tabs.value.forEach(item => {
    if (item.name === tab.props.label) {
      url = item.url
    }
  })
  toChange(url);
};

//点击更多按钮事件
const toQuery = (url: string) => {
  if (isOperate.value) { //出单员
    //暂存任务 （综合查询-投保单）、待修改任务 （综合查询-待修改单查询）
    if (url === '/query/application-querys') {
      let param = {
        CurrentUser: user.opCde,
        CurrentUserOrg: user.companyId,
        CAppStatus: '1',
        TIssueTmStart: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
        TIssueTmEnd: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
      };
      if (currentTabName.value == '待修改任务') {
        param = Object.assign({
          CurrentUser: user.opCde,
          CurrentUserOrg: user.companyId,
          startBsTm1: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
          endBsTm1: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
        });
        sessionStorage.setItem(AppKey.query.pcis_query_returnudrlist, JSON.stringify(param));
      } else {
        sessionStorage.setItem(AppKey.query.pcis_query_app, JSON.stringify(param));
      }
      router.push({ path: url });
    } else if (url === '/RenewalManagement/renewal-management') { //待续保 （续保管理）
      const param = Object.assign({
        CurrentUser: user.opCde,
        CurrentUserOrg: user.companyId,
        startBsTm1: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
        endBsTm1: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
      });
      sessionStorage.setItem('renewPolicy', JSON.stringify(param));
      router.push({ path: url });
    }
  } else if (isAudit.value) {
    if (url === '/pcis-new-udr-list/PendUdrList') { //核保员 （核保任务查询）
      let param = Object.assign({
        CurrentUser: user.opCde,
        CurrentUserOrg: user.companyId,
        startCrtTm: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
        TAppTmEnd: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
        startBsTm1: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
        endBsTm1: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
      });
      if (currentTabName.value == '暂存任务') {
        param.type = 'temp'
      } else {
        param.type = 'edit'
      }
      sessionStorage.setItem(AppKey.query.pcis_query_newudrlist, JSON.stringify(param));
      router.push({ path: url });
    }
  }
};
//table的row-click事件
const toQuery2 = (data: any) => {
  console.log('toQuery2', data)
  if (isOperate.value) { //出单员
    if (currentTabName.value === '暂存任务') {
      const param = Object.assign({
        CurrentUser: user.opCde,
        CurrentUserOrg: user.companyId,
        CAppNo: data['cAppNo'],
        TIssueTmStart: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
        TIssueTmEnd: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
      });
      sessionStorage.setItem(AppKey.query.pcis_query_app, JSON.stringify(param));
      router.push({ path: '/query/application-querys' });
    } else if (currentTabName.value === '待修改任务') {
      const param = Object.assign({
        CurrentUser: user.opCde,
        CurrentUserOrg: user.companyId,
        objId: data['cAppNo'],
        startBsTm1: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
        endBsTm1: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
      });
      sessionStorage.setItem(AppKey.query.pcis_query_returnudrlist, JSON.stringify(param));
      router.push({ path: '/query/application-querys' });
    } else if (currentTabName.value === '待续保') {
      const param = Object.assign({
        CurrentUser: user.opCde,
        CurrentUserOrg: user.companyId,
        objId: data['cAppNo'],
        startBsTm1: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
        endBsTm1: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
      });
      sessionStorage.setItem('renewPolicy', JSON.stringify(param));
      router.push({ path: '/RenewalManagement/renewal-management' });
    }
  } else if (isAudit.value) { //核保员
    if (currentTabName.value === '暂存任务') {
      const param = Object.assign({
        type: 'temp',
        CurrentUser: user.opCde,
        CurrentUserOrg: user.companyId,
        objId: data['cAppNo'],
        startCrtTm: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
        TAppTmEnd: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
        startBsTm1: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
        endBsTm1: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
      });
      sessionStorage.setItem(AppKey.query.pcis_query_newudrlist, param);
      router.push({ path: '/pcis-new-udr-list/PendUdrList' });
    } else if (currentTabName.value === '修改单') {
      const param = Object.assign({
        type: 'edit',
        CurrentUser: user.opCde,
        CurrentUserOrg: user.companyId,
        objId: data['cAppNo'],
        startCrtTm: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
        TAppTmEnd: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
        startBsTm1: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
        endBsTm1: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
      });
      sessionStorage.setItem(AppKey.query.pcis_query_newudrlist, param);
      router.push({ path: '/pcis-new-udr-list/PendUdrList' });
    }
  }
};

// 输入框查询
function handleSearch(val:any) {
  if (isOperate.value) { //出单员
    const param = Object.assign({
      CurrentUser: user.opCde,
      CurrentUserOrg: user.companyId,
      CAppNo: val,
      TIssueTmStart: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
      TIssueTmEnd: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
    });
    sessionStorage.setItem(AppKey.query.pcis_query_app, JSON.stringify(param));
    router.push({ path: '/query/application-querys' });
  } else if (isAudit.value) { //核保员
    const param = Object.assign({
      type: 'temp',
      CurrentUser: user.opCde,
      CurrentUserOrg: user.companyId,
      objId: val,
      startCrtTm: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
      TAppTmEnd: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
      startBsTm1: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
      endBsTm1: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
    });
    sessionStorage.setItem(AppKey.query.pcis_query_newudrlist, param);
    router.push({ path: '/pcis-new-udr-list/PendUdrList' });
  }
}

// 编辑快捷菜单
function openShortcutEdit() {
  dzmodal.open(shortMenuDialog, { type: "", data: {} }).then((res:any) => {
    if (res.type === "ok") {
      shorMenuList.value = res.body
    } 
  });
}

// 获取消息通知数据
const noticeList = ref([])
function getNoticeData() {
  let param = {
    CReceiver: user.opCde,
    CState: '0',
    CType: '0',
    limit: 10
  }
  pcisQueryService.getNotifyByReceiver(param).then((res: any) => {
    console.log('消息数据', res)
    if (res.code === 200 && res.data.code === '1') {
      noticeList.value = res.data.result
    }
  })
}

// 窗口大小变化时重置图表
window.addEventListener('resize', () => {
  if(ecahrtsRefInstance) {
    ecahrtsRefInstance.resize()
  }
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  position: absolute;
  width: 100%;
  height: 100%;

  .home {
    width: 100%;
    height: 100%;
    background-color: #fff;
    background-image: url('@/assets/img/home_bg.png');
    background-size: 100% 24.06667rem;
    background-position: top;
    background-repeat: no-repeat;
    padding: 1.5rem 7rem;
    overflow-y: auto;

    .top-box {
      width: 100%;
      margin-bottom: 1.5rem;

      .top-title1 {
        width: 100%;
        font-size: 2rem;
        font-weight: 600;
        color: #333;
        margin-bottom: .6rem;
      }

      .top-title2 {
        font-size: .8rem;
        color: #333;
        margin-bottom: 2rem;
      }

      .top-search {
        width: 100%;
        height: 3.2rem;
        display: flex;
        align-items: center;
        background: #FFFFFF;

        :deep(.el-input__wrapper) {
          box-shadow: none;
        }

        .el-button {
          margin-right: 10px;
        }
      }

      .top-menu {
        display: flex;
        padding: 20px 0;
        color: #333;
        font-weight: bold;
        .menu-label {
          display: flex;
        }
        .top-menu-list {
          span {
            margin-left: 20px;
            cursor: pointer;
            &:hover {
              color: var(--el-color-primary);
            }
          }
        }
      }
    }

    .center-box {
      width: 100%;
      display: flex;
      margin-bottom: 1.5rem;
      justify-content: space-between;

      .center-content1 {
        width: 75%;
        background: #fff;
        box-shadow: 0 0 .4rem #0000001a;
        border-radius: 5px;
        padding: 2rem;
        display: flex;
        flex-direction: column;

        .title-box {
          .title {
            font-size: 1.2rem;
            color: #333333;
            font-weight: 600;
            margin-right: 8px;
          }
          .icon {
            width: 1.2rem;
          }
        }

        .statistic-tab-box {
          margin: 10px 0;
          color: #666;
          display: flex;
          .tab-item {
            margin-right: 10px;
            cursor: pointer;
            &:hover {
              color: var(--el-color-primary);
            }
          }
        }

        .content-details-box {
          display: grid;
          grid-template-columns: 1fr 1fr;
          color: #666;

          .content-details {
            display: flex;
            align-items: center;
            margin: 10px 10px 10px 0;

            .round {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background-color: #d9d9d9;
              margin-right: 10px;
            }
          }
        }
        .content-charts-box {
          .tab-box {
            display: flex;
            justify-content: end;
            align-items: center;
            margin: 20px 0;
            color: #666;
          }
        }
      }

      .center-content2 {
        width: 24%;
        background: #fff;
        box-shadow: 0 0 .4rem #0000001a;
        border-radius: 5px;
        padding: 2rem 1rem;
        display: flex;
        flex-direction: column;
        .user-box {
          display: flex;
          align-items: center;
          img {
            width: 80px;
          }
          .user-info {
            .user-name {
              font-size: 18px;
              font-weight: bold;
            }
            .el-button {
              color: var(--el-color-primary);
              border-color: var(--el-color-primary);
            }
          }
        }
        .content-list-box {
          .list-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .title {
              color: #333;
              font-weight: bold;
              margin-right: 5px;
              font-size: 18px;
            }
          }
          .list-content {
            .list-content-item {
              padding: 10px;
              .item-title {
                display: flex;
                align-items: center;
                color: #333;
                .point {
                  width: 6px;
                  height: 6px;
                  background: var(--el-color-primary);
                  border-radius: 50%;
                  margin-left: 5px;
                }
              }
              .item-content {
                font-size: 14px;
                color: #999;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-top: 5px;
              }
            }
          }
        }
      }
    }
    .bottom-box {
      width: 100%;
      background: #fff;
      box-shadow: 0 0 .4rem #0000001a;
      border-radius: 5px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      .title-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .title {
          font-size: 1.2rem;
          color: #333333;
          font-weight: 600;
          margin-right: 8px;
        }
        .icon {
          width: 1.2rem;
        }
      }
      .table-box {
        .table {
          display: flex;
          flex-direction: column;
        }
      }
    }
  }
}

.custom-hint {
  font-size: 13px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  text-align: center;
  align-items: center
}


/* 首页banner部分 */
.subbanner {
  padding: 0 16px;
  background: url('@/assets/img/bannerbg.jpg') no-repeat;
  background-size: cover;
  background-position: center;
  width: 100%;
  position: relative;
  margin-top: 0;
  padding: 1.3rem 0;

  .chart-main {
    width: 100%;
    height: 310px;
    background-color: rgba(255, 255, 255, 0.25);
    border-radius: 5px;
  }
}

.index-blk {
  background: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  //padding:20px;
  border-radius: 5px;
  margin-top: 20px;
  min-height: 350px;
}

.sty {
  // color: #f57c10;
  color: var(--el-color-primary);
  font-size: var(--el-font-size-base);
}

.sty:hover {
  // color: #f57c10;
  color: var(--el-color-primary);
}

.more {
  position: absolute;
  top: var(--el-card-padding);
  right: var(--el-card-padding);
}
</style>

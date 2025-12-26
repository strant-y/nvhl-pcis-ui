<template>
  <div class="dashboard-container">
    <div class="home">
      <div class="code-box" style="position: absolute;right: 3px;">
        <div class="code-inner-box">
          <span>移动端二维码：</span>
          <img class="code-img" src="@/assets/img/dashbord/prod-QRCode.png" alt="" v-if="env.MODE === 'prod'">
          <img class="code-img" src="@/assets/img/dashbord/QRCode.png" alt="" v-else>
        </div>
        <div class="code-inner-box">
          <span>在线缺陷平台：</span>
          <div>
            <a :href="platformUrl" target="_blank" class="link">缺陷平台</a>
          </div>
        </div>
      </div>
      <div class="top-box">
<!--        <div style="display: flex;justify-content: space-between;">-->
<!--          <div>-->
<!--            <div class="top-title1">财产险承保系统</div>-->
<!--            <div class="top-title2">-->
<!--              智能高效助力承保，精准把控风险，让财险业务开展更顺畅无忧-->
<!--            </div>-->
<!--          </div>-->
<!--          <div class="code-box">-->
<!--            <div class="code-inner-box">-->
<!--                <span class="title">移动端二维码：</span>-->
<!--                <img class="code-img" src="@/assets/img/dashbord/QRCode.png" alt="">-->
<!--            </div>-->
<!--            <div class="code-inner-box">-->
<!--                <span class="title">在线缺陷平台: </span>-->
<!--                <div>-->
<!--                  <a :href="platformUrl" target="_blank" class="link">点击跳转</a>-->
<!--                </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
        <div class="top-search">
          <rtinput v-model="searchValue" :item="searchItem" />
          <rtButton :item="searchBtnItem" style="width: 150px;letter-spacing: 20px;height: 2.5rem;margin-right: 3px;border-radius: 3px;" />
        </div>
        <!-- <div class="top-menu">
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
            <span class="hot-menu-label">快捷菜单:</span>
          </div>
          <div class="top-menu-list">
            <el-tag
              class="top-menu-text"
              v-for="tag in shorMenuList"
              :type="tag.type"
              :key="tag.name"
              @click="$router.push(tag.url)"
            >
              {{tag.name.replace('事故预防','')}}
            </el-tag>
          </div>
        </div> -->
      </div>
      <div class="bottom-box">
        <div class="title-box">
          <div class="title-line">
            <span class="title">工作台</span>
            <img class="icon" :src="labelIcon" alt="" />
          </div>
          <rtButton :item="moreBtnItem" />
        </div>
        <div class="table-box">
          <div class="tabs-box">
            <el-tabs @tab-click="handleTabClick">
              <el-tab-pane
                v-for="tab in tabs"
                :key="tab.name"
                :label="tab.name"
              >
              </el-tab-pane>
            </el-tabs>
          </div>
          <div :class="['table', clickedTabData.refName]">
            <app-table
              :key="currentTabName"
              :tableConfig="tableconfig"
              v-model:pageresult="pageresult"
              ref="tableRef"
              @pageChange="handlePageChange"
            >
              <template #column-cInquiryNoInfo="{ row, column, index }">
                <div class="policy-info-cell" v-if="row.baseType === '询价'">
                  <div v-if="row.cAppNo" class="policy-number-row">
                    <span v-html="row.cAppNo"></span>
                    <el-icon class="copy-icon" @click="copyText(row.cAppNo)">
                      <DocumentCopy />
                    </el-icon>
                  </div>
                  <div v-if="row.cInquiryNoInfo" class="policy-number-row">
                    <span
                      v-html="row.cInquiryNo"
                      class="primmaryColor"
                    ></span>
                    <el-icon
                      class="copy-icon"
                      @click="copyText(row.cInquiryNo)"
                    >
                      <DocumentCopy />
                    </el-icon>
                  </div>
                </div>
              </template>
              <template #column-cPlyNoInfo="{ row, column, index }">
                <div class="policy-info-cell" v-if="row.baseType === '投保'">
                  <div v-if="row.cAppNo" class="policy-number-row">
                    <span
                      v-html="row.cAppNo"
                      class="primmaryColor"
                    ></span>
                    <el-icon class="copy-icon" @click="copyText(row.cAppNo)">
                      <DocumentCopy />
                    </el-icon>
                  </div>
                  <div v-if="row.cPlyNo" class="policy-number-row">
                    <span v-html="row.cPlyNo"></span>
                    <el-icon class="copy-icon" @click="copyText(row.cPlyNo)">
                      <DocumentCopy />
                    </el-icon>
                  </div>
                </div>
              </template>
              <template #column-cEdrNoInfo="{ row, column, index }">
                <div class="policy-info-cell" v-if="row.baseType === '批改'">
                  <div v-if="row.cAppNo" class="policy-number-row">
                    <span
                      v-html="row.cAppNo"
                      class="primmaryColor"
                    ></span>
                    <el-icon class="copy-icon" @click="copyText(row.cAppNo)">
                      <DocumentCopy />
                    </el-icon>
                  </div>
                  <div v-if="row.cEdrNo" class="policy-number-row">
                    <span v-html="row.cEdrNo"></span>
                    <el-icon class="copy-icon" @click="copyText(row.cEdrNo)">
                      <DocumentCopy />
                    </el-icon>
                  </div>
                </div>
              </template>
              <template #column-cAppNoInfo="{ row, column, index }">
                <div class="policy-info-cell">
                  <div class="policy-number-row" v-if="row.cAppNo">
                    <span
                      v-html="row.cAppNo"
                      :class="row.baseType !== '询价' ? 'primmaryColor' : ''"
                    ></span>
                    <el-icon
                      class="copy-icon"
                      @click="copyText(row.cAppNo)"
                      v-if="row.cAppNo"
                    >
                      <DocumentCopy />
                    </el-icon>
                  </div>
                  <div class="policy-number-row" v-if="row.cInquiryNo">
                    <span
                      v-html="row.cInquiryNo"
                      class="primmaryColor"
                    ></span>
                    <el-icon
                      class="copy-icon"
                      @click="copyText(row.cInquiryNo)"
                      v-if="row.cInquiryNo"
                    >
                      <DocumentCopy />
                    </el-icon>
                  </div>
                </div>
              </template>
              <template #column-cPlyNo="{ row, column, index }">
                <div class="policy-info-cell">
                  <div v-if="row.cPlyNo" class="policy-number-row">
                    <span
                      v-html="row.cPlyNo"
                      class="primmaryColor"
                    ></span>
                    <el-icon class="copy-icon" @click="copyText(row.cPlyNo)">
                      <DocumentCopy />
                    </el-icon>
                  </div>
                </div>
              </template>
            </app-table>
          </div>
        </div>
      </div>
      <div class="center-box">
        <div class="center-content1">
          <div class="title-box">
            <div class="title-line">
              <span class="title">统计图</span>
              <img class="icon" :src="labelIcon" alt="" />
            </div>
          </div>
          <div class="statistic-tab-box">
            <el-tabs @tab-click="handleStatisticTabClick">
              <el-tab-pane
                v-for="tab in statisticTabList"
                :key="tab"
                :label="tab"
              >
              </el-tab-pane>
            </el-tabs>
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
            <div class="echarts-box">
              <div class="echarts-content">
                <div class="echarts-title">
                  <span>总量统计图</span>
                  <el-button-group>
                    <el-button
                      @click="changeEchartsType('1')"
                      :type="ecahrtsOptionsType === '1' ? 'primary' : ''"
                      >饼状图</el-button
                    >
                    <el-button
                      @click="changeEchartsType('0')"
                      :type="ecahrtsOptionsType === '0' ? 'primary' : ''"
                      >柱状图</el-button
                    >
                  </el-button-group>
                </div>
                <div
                  ref="ecahrtsRef"
                  class="echarts-container"
                  :style="{ width: chartWidth, height: chartHeight }"
                ></div>
              </div>
              <div class="echarts-content">
                <div class="echarts-title">
                  <span>保费统计图</span>
                  <el-button-group>
                    <el-button
                      @click="changeEcharts1Type('1')"
                      :type="ecahrtsOptions1Type === '1' ? 'primary' : ''"
                      >饼状图</el-button
                    >
                    <el-button
                      @click="changeEcharts1Type('0')"
                      :type="ecahrtsOptions1Type === '0' ? 'primary' : ''"
                      >柱状图</el-button
                    >
                  </el-button-group>
                </div>
                <div
                  ref="ecahrtsRef1"
                  class="echarts-container"
                  :style="{ width: chartWidth, height: chartHeight }"
                ></div>
              </div>
              <div class="echarts-list">
                <div style="margin-bottom: 18px;">
                  <span>保费月份</span>
                  <span>保费（万元）</span>
                </div>
                <div v-for="item in echartsOptionsData1[currentTab]" :key="item.item">
                  <span class="month">{{ item.item }}</span>
                  <span class="nPrm">{{ item.value > 0 ? (item.value / 10000).toFixed(2) : item.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- <div class="center-content2">
          <div class="user-box">
            <img :src="headIcon" alt="">
            <div class="user-info">
              <div class="user-name">{{ user.opCnm }}</div>
               <el-tag v-if="cOpgrpCnm">{{ cOpgrpCnm }}</el-tag>
            </div>
          </div> -->
        <!-- 暂时隐藏消息通知 -->
        <!-- <div class="content-list-box">
            <div class="list-title">
              <div class="title-line">
                <span class="title">消息通知</span>
                <img class="icon" :src="labelIcon" alt="">
              </div>
              <rtButton :item="{label:'查看全部',type:'text'}" />
            </div>
            <div class="list-content">
              <template v-if="noticeList.length > 0">
                <div class="list-content-item" v-for="item in noticeList" :key="item.id">
                  <div class="item-title">
                    <span class="title">{{ item.title }}</span>
                    <span class="point"></span>
                  </div>
                  <el-tooltip :content="item.description + item.dataId ? '【申请单号：' + item.dataId + ' 】' : item.cEdrNo ? '【批单号：' + item.cEdrNo + ' 】' : item.cplyNo ? '【保单号：' + item.cplyNo + ' 】' : ''">
                    <div class="item-content">
                      {{ item.description }}
                      <template v-if="item.dataId">【申请单号：{{ item.dataId }}】</template>
                      <template v-if="item.cEdrNo">【批单号：{{ item.cEdrNo }}】</template>
                      <template v-if="item.cplyNo">【保单号：{{ item.cplyNo }}】</template>
                    </div>
                  </el-tooltip>
                </div>
              </template>
              <template v-else>
                <div style="font-size: 16px;text-align: center;margin-top: 50%;">暂无消息</div>
              </template>
            </div>
          </div> -->
        <!-- <div>
              <div class="code-box">
                <div class="code-inner-box">
                    <span class="title">移动端二维码：</span>
                    <img class="code-img" src="@/assets/img/dashbord/QRCode.png" alt="">
                </div>
                <div class="code-inner-box">
                    <span class="title">在线缺陷平台: </span>
                    <div>
                      <a :href="platformUrl" target="_blank" class="link">点击跳转</a>
                    </div>
                </div>
              </div>
          </div> -->
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
            </div>
          </div> -->
        <!-- </div> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import type { ECharts, EChartsOption } from "echarts";
import {
  EchartsService,
  ChartConfig,
} from "@/views/charts/service/echarts/echarts.service";
import { useSettingsStore, useUserStore } from "@/store";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { tableObj, tab1, tab2 } from "./mapObj";
import moment from "moment";
import { PcisQueryService } from "@/views/dashboard/service/v1.service";
const pcisQueryService = new PcisQueryService();
import { useRouter } from "vue-router";
const router = useRouter();
import { AppKey } from "@/constants/api";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { statisticProps } from "element-plus";
const dzmodal = useDzModal();
const shortMenuDialog = defineAsyncComponent(
  () => import("./components/shortMenuDialog.vue")
);
import { getShortcutDataList, updateShortRoute } from "@/api/menu";
import { NewUdrListService } from "@/views/pcis-new-udr-list/service/new-udr-list.service";
const {
  hasReceived,
  getBaseInfoByAppNo,
  checkEdrPocly,
  getBackUdrList,
  getNewUdrList,
  getInquiryNewUdrList,
  backInquiryUdrList,
  getBaseInfoByInquiryNo,
  withdraw,
} = NewUdrListService();
import { SCENE_PLY_APP_MODIFY_BOUNCED } from "@/constants/tab-constants";
import {
  deleteFactorBykey,
  exportRenewalInsurance,
  findRenewalInsurance,
  getBasicKindList,
  getPolicy,
} from "@/api/prod";
import { getListByCode } from "@/api/code-list-service";
import {
  SCENE_EDR_APP_MODIFY_UNSUBMIT,
  SCENE_PLAN_READ,
  SCENE_PLY_APP_MODIFY_UNSUBMIT,
  SCENE_PLY_APP_READ,
  SCENE_PLY_APP_READBEARER,
  SCENE_TEMPORARY_DEPOSITBEARER,
  SCENE_PLAN_UW_PROCESS,
  SCENE_PLY_UW_PROCESS,
  SCENE_PLY_UW_PROCESSBEARER,
} from "@/constants/tab-constants";
import dayjs from "dayjs";
import { getAppPolicyList, getInquiryPolicyList } from "@/api/query";
import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
const policyService = new PolicyService();
import { delTmpPolicy, delInquiryPolicy } from "@/api/query";
import { createFreeButtonBase } from "@/shared/button-config";

defineOptions({
  name: "Dashboard",
  inheritAttrs: false,
});

const searchValue = ref("");
const searchItem = {
  prop: "cQueryStr",
  inputtype: "rtinput",
  title: "",
  placeholder: "询价/投保/批改申请单号 询价单号 保单号 批单号 产品名称 条款名称 投/被保人名称 投/被保人证件号码",
  itemWidth: 30,
  prefixIcon: "Search",
};
const searchBtnItem = reactive({
  label: "搜索",
  type: "primary",
  loading: false,
  func: () => {
    handleSearch(searchValue.value);
  },
});
const issueBtnItem = ref({
  label: "出单统计图",
  type: "primary",
  func: () => {
    ecahrtsBtnIndex.value = 0;
    echartsOptions.legend.data = ["每月出单量", "每月出单量同比"];
    echartsOptions.series[0].name = "每月出单量";
    echartsOptions.series[1].name = "每月出单量同比";
    handleRefreshEcharts();
  },
});
const nPrmBtnItem = ref({
  label: "保费统计图",
  type: "default",
  func: () => {
    ecahrtsBtnIndex.value = 1;
    echartsOptions.legend.data = ["每月保费量", "每月保费量同比"];
    echartsOptions.series[0].name = "每月保费量";
    echartsOptions.series[1].name = "每月保费量同比";
    handleRefreshEcharts();
  },
});
const moreBtnItem = ref({
  type: "text",
  label: "查看更多",
  func: () => {
    toQuery(moreurl.value);
  },
});
const labelIcon = "/src/assets/img/slash.png";

const env = import.meta.env;
const platformUrl = env.MODE === "prod" ? 'https://yfpt-devops.yaic.com.cn:30011/plugin/Nq98Zt7s/3HjTkVPb/EXeviQzu/latest/modules/about-blank-Pv2J/index.html?orgUUID=Nq98Zt7s&teamUUID=3HjTkVPb&appID=EXeviQzu&origin=https%3A%2F%2Fyfpt-devops.yaic.com.cn%3A30011&formId=68f5e3f9f367b2000104542a&projectId=Pi2GPKuRX7dZ4TCs&access_type=1': 'https://yfpt-devops.yaic.com.cn:30011/plugin/Nq98Zt7s/3HjTkVPb/EXeviQzu/latest/modules/about-blank-Pv2J/index.html?orgUUID=Nq98Zt7s&teamUUID=3HjTkVPb&appID=EXeviQzu&origin=https%3A%2F%2Fyfpt-devops.yaic.com.cn%3A30011&formId=68633ed3e2156d0001578d68&projectId=Pi2GPKuRX7dZ4TCs&access_type=1';

const ecahrtsRef = ref(null);
let ecahrtsRefInstance: ECharts | null = null;
const ecahrtsRef1 = ref(null);
let ecahrtsRefInstance1: ECharts | null = null;
const chartWidth = ref("100%");
const chartHeight = ref("400px");
const userStore = useUserStore();
const user = userStore.user;
const roles = user.roles;
const userItem = JSON.parse(sessionStorage.getItem("user") || "{}");
const cOpgrpCnm =
  userItem.roles && userItem.roles[0] ? userItem.roles[0].cOpgrpCnm : "";
const currentTabName = ref(""); //tabs默认值
const isOperate = ref(false); //管理员 出单岗
const isAudit = ref(false); //  核保岗
const moreurl = ref("");
const shortListData = ref(null); // 第二模块tabl列表数据
const headIcon = `/src/assets/images/${userStore.user.cCssStyle === "2" ? "0" : "1"}_.png`;
const shorMenuList = ref([]); // 快捷菜单列表
const cPayTypList = ref([]);
const ecahrtsOptionsType = ref("1");
const ecahrtsOptions1Type = ref("1");

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
// 申请单号、保单号增加双击事件
Object.keys(tableObj).forEach((i: any) => {
  const tableBtnObj:any = {};
  if(i === "notWaitObj") {
    tableBtnObj['tableBtnPosition'] = "right"
    tableBtnObj['fixed'] = true
    tableBtnObj['tableBtnWidth'] = 40
    tableBtnObj['tableBtn'] = [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "删除",
        type: "danger",
        size: "large",
        icon: "Delete",
        tableClick: (row:any) => {
          ElMessageBox.confirm("确认删除数据?", "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }).then(async function () {
            const delResult =
              row.baseType === "询价"
                ? delInquiryPolicy({ cInquiryNo: row.cInquiryNo })
                : delTmpPolicy({ cAppNo: row.cAppNo });
            delResult.then((res: any) => {
              if (null != res && null != res["code"]) {
                if (res["code"] === 200) {
                  ElMessage.success({ message: res.msg, duration: 3000 });
                  getIssueTableData();
                } else {
                  ElMessage.error({ message: res.msg, duration: 3000 });
                }
              }
            });
          });
        },
      }),
    ]
  }
  if(i === "submittedObj") {
    tableBtnObj['tableBtnPosition'] = "right"
    tableBtnObj['fixed'] = true
    tableBtnObj['tableBtnWidth'] = 40
    tableBtnObj['tableBtn'] = [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "撤回",
        type: "success",
        size: "large",
        icon: "return",
        hideBtns: (row: any) => {
          if (row.taskStatus == "已提核" && row.hasReceived === "未接收") {
            return false;
          } else {
            return true;
          }
        },
        tableClick: (row) => {
          const { cAppNo, curtTask, cInquiryNo } = row;
          const param = {
            taskId: curtTask,
            appNo: row.baseType === '询价' ? cInquiryNo : cAppNo,
            user: user,
          };
          withdraw(param)
            .then((result: any) => {
              if (result.code !== 200) {
                ElMessage.error({ message: result.msg, duration: 3000 });
              } else {
                if (result.msg?.includes('成功')) {
                  ElMessage.success({ message: result.msg, duration: 3000 });
                  getIssueTableData();
                } else {
                  ElMessage.warning({ message: result.msg, duration: 3000 });
                }
              }
            })
            .catch((error: any) => {
              ElMessage.error({ message: error.msg, duration: 3000 });
            });
        },
      }),
    ]
  }
  Object.assign(tableObj[i], tableBtnObj)
});
let tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    ...tableObj.notWaitObj,
    rowDbClickFun:(row:any)=> toQuery2(row)
  })
);

const echartsService = new EchartsService();
const { getAnalysis } = echartsService;
const ecahrtsBtnIndex = ref(0);
// 总量统计图-柱状图
const echartsOptions = reactive({
  barWidth: "15px",
  tooltip: {
    trigger: "axis",
    backgroundColor: 'var(--rt-bg-color)',
    borderColor: 'var(--el-color-primary)',
    textStyle: {
      color: 'var(--el-text-color)' // 提示框文字颜色
    },
    axisPointer: {
      type: "none",
      label: {
        backgroundColor: "#6a7985",
      },
    },
  },
  color: ["#f57c11"],
  grid: {
    left: "5%",
    right: "5%",
    bottom: "10%",
    top: "10%",
    // height: 150,
    containLabel: true,
  },
  legend: {
    data: ["每月出单量", "每月出单量同比"],
    bottom: 0,
    show: true,
    textStyle: {
      color: 'var(--el-text-color)' // 提示框文字颜色
    },
  },
  xAxis: [
    {
      type: "category",
      name: "月份",
      axisLabel: {
        show: true,
        // color: 'red'
      },
      axisLine: {
        // x轴的颜色和宽度
        lineStyle: {
          // color: 'red',
          width: 1,
        },
      },
      boundaryGap: true,
      data: [],
    },
  ],
  yAxis: [
    {
      type: "value",
      name: "总量",
      min: 0,
      // max: 1000,
      axisLabel: {
        // y轴的字体样式
        show: true,
        // color: 'red'
      },
      axisLine: {
        // y轴的颜色和宽度
        lineStyle: {
          width: 0,
        },
      },
    },
    {
      type: "value",
      name: "占比",
      min: 0,
      // max: 50,
      axisLabel: {
        // y轴的字体样式
        show: true,
        // color: 'red'
      },
      axisLine: {
        // y轴的颜色和宽度
        lineStyle: {
          // color: 'yellow',
          width: 0,
        },
      },
    },
  ],
  series: [
    {
      type: "bar",
      name: "每月出单量",
      data: [],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: "#729CFD", // 起始颜色
          },
          {
            offset: 1,
            color: "#326FFD", // 结束颜色
          },
        ]),
        barBorderRadius: [5, 5, 5, 5],
      },
    },
    {
      type: "bar",
      name: "每月出单量同比",
      yAxisIndex: 1,
      data: [],
      itemStyle: {
        color: "#68D3F8",
        barBorderRadius: [5, 5, 5, 5],
      },
    },
  ],
});
// 总量统计图-饼状图
const echartsOptionsPie = reactive({
  title: {
    text: "",
    subtext: "",
    left: "center",
  },
  tooltip: {
    trigger: "item",
    formatter: "{a} <br/>{b} : {c} ({d}%)",
    backgroundColor: 'var(--rt-bg-color)',
    borderColor: 'var(--el-color-primary)',
    textStyle: {
      color: 'var(--el-text-color)' // 提示框文字颜色
    }
  },
  legend: {
    left: "center",
    top: "bottom",
    textStyle: {
      color: 'var(--el-text-color)' // 提示框文字颜色
    },
  },
  series: [
    {
      name: "每月出单量",
      type: "pie",
      radius: "60%",
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.5)",
        },
      },
      itemStyle: {
        normal: {
          color: function (colors:any) {
            var colorList = [
              '#3f77e4',
              '#6794E8',
              '#79A0EB',
              '#89ABED',
              '#9AB8F0',
              '#ABC3F2',
              '#BCCFF5',
              '#CCDBF7',
              '#bcd0f4',
              '#afdcef',
              '#9adcec',
              '#58C5E0',
            ];
            return colorList[colors.dataIndex];
          },
        },
      },
      data: [],
    },
  ],
  graphic: {
    type: "text", // 图形类型为文本
    left: "center", // 文本位置，居中显示
    top: "30%", // 文本位置，居中显示
    style: {
      text: "每月出单量", // 要显示的文字内容
      fontSize: 14, // 文字大小
      fill: "#333", // 文字颜色
    },
  },
});
// 保费统计图-柱状图
const echartsOptions1 = reactive({
  barWidth: "15px",
  tooltip: {
    trigger: "axis",
    backgroundColor: 'var(--rt-bg-color)',
    borderColor: 'var(--el-color-primary)',
    textStyle: {
      color: 'var(--el-text-color)' // 提示框文字颜色
    },
    axisPointer: {
      type: "none",
      label: {
        backgroundColor: "#6a7985",
      },
    },
  },
  color: ["#f57c11"],
  grid: {
    left: "5%",
    right: "5%",
    bottom: "10%",
    top: "10%",
    // height: 150,
    containLabel: true,
  },
  legend: {
    data: ["每月保费量", "每月保费量同比"],
    bottom: 0,
    show: true,
    textStyle: {
      color: 'var(--el-text-color)' // 提示框文字颜色
    },
  },
  xAxis: [
    {
      type: "category",
      name: "月份",
      axisLabel: {
        show: true,
        // color: 'red'
      },
      axisLine: {
        // x轴的颜色和宽度
        lineStyle: {
          // color: 'red',
          width: 1,
        },
      },
      boundaryGap: true,
      data: [],
    },
  ],
  yAxis: [
    {
      type: "value",
      name: "保费",
      min: 0,
      // max: 1000,
      axisLabel: {
        // y轴的字体样式
        show: true,
        // color: 'red'
      },
      axisLine: {
        // y轴的颜色和宽度
        lineStyle: {
          width: 0,
        },
      },
    },
    {
      type: "value",
      name: "占比",
      min: 0,
      // max: 50,
      axisLabel: {
        // y轴的字体样式
        show: true,
        // color: 'red'
      },
      axisLine: {
        // y轴的颜色和宽度
        lineStyle: {
          // color: 'yellow',
          width: 0,
        },
      },
    },
  ],
  series: [
    {
      type: "bar",
      name: "每月保费量",
      data: [],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: "#729CFD", // 起始颜色
          },
          {
            offset: 1,
            color: "#326FFD", // 结束颜色
          },
        ]),
        barBorderRadius: [5, 5, 5, 5],
      },
    },
    {
      type: "bar",
      name: "每月保费量同比",
      yAxisIndex: 1,
      data: [],
      itemStyle: {
        color: "#68D3F8",
        barBorderRadius: [5, 5, 5, 5],
      },
    },
  ],
});
// 保费统计图-饼状图
const echartsOptions1Pie = reactive({
  title: {
    text: "",
    subtext: "",
    left: "center",
  },
  tooltip: {
    trigger: "item",
    formatter: "{a} <br/>{b} : {c} ({d}%)",
    backgroundColor: 'var(--rt-bg-color)',
    borderColor: 'var(--el-color-primary)',
    textStyle: {
      color: 'var(--el-text-color)' // 提示框文字颜色
    }
  },
  legend: {
    left: "center",
    top: "bottom",
    textStyle: {
      color: 'var(--el-text-color)' // 提示框文字颜色
    },
  },
  series: [
    {
      name: "每月保费量",
      type: "pie",
      radius: "60%",
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.5)",
        },
      },
      itemStyle: {
        normal: {
          color: function (colors:any) {
            var colorList = [
              '#3f77e4',
              '#6794E8',
              '#79A0EB',
              '#89ABED',
              '#9AB8F0',
              '#ABC3F2',
              '#BCCFF5',
              '#CCDBF7',
              '#bcd0f4',
              '#afdcef',
              '#9adcec',
              '#58C5E0',
            ];
            return colorList[colors.dataIndex];
          },
        },
      },
      data: [],
    },
  ],
  graphic: {
    type: "text", // 图形类型为文本
    left: "center", // 文本位置，居中显示
    top: "30%", // 文本位置，居中显示
    style: {
      text: "每月保费量", // 要显示的文字内容
      fontSize: 14, // 文字大小
      fill: "#333", // 文字颜色
    },
  },
});
const tabs = ref<Array<any>>([]); //tabs数组
const statisticTabList = ref<Array<any>>([]);
const tabDataMap:any = ref({});
const currentTab = ref("核心出单");
// 今日总录单
const dayTotalRecords = computed(() => {
  const currentItem = tabDataMap.value[currentTab.value] || [];
  const dayInfo = currentItem.find((item: any) => item.unit === "day");
  const num = dayInfo ? dayInfo.num : 0;
  return num;
});
// 本周总录单
const weekTotalRecords = computed(() => {
  const currentItem = tabDataMap.value[currentTab.value] || [];
  const dayInfo = currentItem.find((item: any) => item.unit === "week");
  const num = dayInfo ? dayInfo.num : 0;
  return num;
});
// 本月总录单
const monthTotalRecords = computed(() => {
  const currentItem = tabDataMap.value[currentTab.value] || [];
  const dayInfo = currentItem.find((item: any) => item.unit === "month");
  const num = dayInfo ? dayInfo.num : 0;
  return num;
});

function init() {
  if (!ecahrtsRefInstance) {
    ecahrtsRefInstance = echarts.init(ecahrtsRef.value);
    ecahrtsRefInstance1 = echarts.init(ecahrtsRef1.value);
  }
  getOrderInfo();
  handleRefreshEcharts();
}

function getOrderInfo() {
  (async () => {
    try {
      const res: any = await getAnalysis({ type: "ply_total", cDptCde: user.companyId });
      if (res.code === 200) {
        tabDataMap.value = res.dataMap;
        const keys = Object.keys(res.dataMap).filter(
            (item: any) =>
                item === "核心出单" ||
                item === "复制出单" ||
                item === "模板出单" ||
                item === "方案出单" ||
                item === "询价转投保"
        );
        keys.splice(0, 0, keys.splice(keys.indexOf("核心出单"), 1)[0]);
        currentTab.value = keys[0];
        statisticTabList.value = keys;
      } else {
        ElMessage.error(res.msg);
      }
    } catch (err) {
      ElMessage.error(err);
    }
  })();
}

function handleStatisticTabClick(tab: any) {
  currentTab.value = tab.props.label;
  (async () => {
    await handleRefreshEcharts();
  })();
}

const echartsOptionsData = ref([]);
const echartsOptionsData1 = ref([]);
async function handleRefreshEcharts() {
  if (ecahrtsBtnIndex.value === 0) {
    issueBtnItem.value.type = "primary";
    nPrmBtnItem.value.type = "default";
  } else {
    issueBtnItem.value.type = "default";
    nPrmBtnItem.value.type = "primary";
  }
  if (echartsOptionsData.value.length < 1) {
    const param = {
      // type: ecahrtsBtnIndex.value === 0 ? 'ply' : 'fee'
      type: "ply",
      cDptCde: user.companyId,
    };
    try {
      const res: any = await getAnalysis(param);
      if (res.code === 200) {
        echartsOptionsData.value = res.dataMap;
        const data = res.dataMap[currentTab.value] || [];
        echartsOptions.xAxis[0].data = data.map((item: any) => item.item);
        echartsOptions.series[0].data = data.map((item: any) => item.value);
        echartsOptions.series[1].data = data.map((item: any) => item.rate);
        // 饼状图
        echartsOptionsPie.series[0].data = data.map((item: any) => ({
          name: item.item,
          value: item.value,
        }));
        echartsOptionsPie.legend.data = data.map((item: any) => item.item);
        ecahrtsRefInstance?.clear();
        ecahrtsRefInstance?.setOption(
          ecahrtsOptionsType.value === "0"
            ? echartsOptions
            : echartsOptionsPie
        );
      } else {
        ElMessage.error(res.msg);
      }
    } catch (err) {
      ElMessage.error(err);
    }
  } else {
    echartsOptions.xAxis[0].data = echartsOptionsData.value[
        currentTab.value
        ].map((item: any) => item.item);
    echartsOptions.series[0].data = echartsOptionsData.value[
        currentTab.value
        ].map((item: any) => item.value);
    echartsOptions.series[1].data = echartsOptionsData.value[
        currentTab.value
        ].map((item: any) => item.rate);
    // 饼状图
    echartsOptionsPie.series[0].data = echartsOptionsData.value[
        currentTab.value
        ].map((item: any) => ({
      name: item.item,
      value: item.value,
    }));
    echartsOptionsPie.legend.data = echartsOptionsData.value[
        currentTab.value
        ].map((item: any) => item.item);
    ecahrtsRefInstance?.clear();
    ecahrtsRefInstance?.setOption(
        ecahrtsOptionsType.value === "0" ? echartsOptions : echartsOptionsPie
    );
  }
  if (echartsOptionsData1.value.length < 1) {
    const param1 = {
      type: "fee",
      cDptCde: user.companyId,
    };
    try {
      const res: any = await getAnalysis(param1);
      if (res.code === 200) {
        echartsOptionsData1.value = res.dataMap;
        const data = res.dataMap[currentTab.value] || [];
        echartsOptions1.xAxis[0].data = data.map((item: any) => item.item);
        echartsOptions1.series[0].data = data.map((item: any) => item.value);
        echartsOptions1.series[1].data = data.map((item: any) => item.rate);
        // 饼状图
        echartsOptions1Pie.series[0].data = data.map((item: any) => ({
          name: item.item,
          value: item.value,
        }));
        echartsOptions1Pie.legend.data = data.map((item: any) => item.item);
        ecahrtsRefInstance1?.clear();
        ecahrtsRefInstance1?.setOption(
          ecahrtsOptions1Type.value === "0"
            ? echartsOptions1
            : echartsOptions1Pie
        );
      } else {
        ElMessage.error(res.msg);
      }
    } catch (err) {
      ElMessage.error(err);
    }
  } else {
    echartsOptions1.xAxis[0].data = echartsOptionsData1.value[
        currentTab.value
        ].map((item: any) => item.item);
    echartsOptions1.series[0].data = echartsOptionsData1.value[
        currentTab.value
        ].map((item: any) => item.value);
    echartsOptions1.series[1].data = echartsOptionsData1.value[
        currentTab.value
        ].map((item: any) => item.rate);
    // 饼状图
    echartsOptions1Pie.series[0].data = echartsOptionsData1.value[
        currentTab.value
        ].map((item: any) => ({
      name: item.item,
      value: item.value,
    }));
    echartsOptions1Pie.legend.data = echartsOptionsData1.value[
        currentTab.value
        ].map((item: any) => item.item);
    ecahrtsRefInstance1?.clear();
    ecahrtsRefInstance1?.setOption(
        ecahrtsOptions1Type.value === "0" ? echartsOptions1 : echartsOptions1Pie
    );
  }
}

function changeEchartsType(type: any) {
  ecahrtsOptionsType.value = type;
  if (type === "0") {
    ecahrtsRefInstance?.clear();
    ecahrtsRefInstance?.setOption(echartsOptions);
  } else {
    ecahrtsRefInstance?.clear();
    ecahrtsRefInstance?.setOption(echartsOptionsPie);
  }
}

function changeEcharts1Type(type: any) {
  ecahrtsOptions1Type.value = type;
  if (type === "0") {
    ecahrtsRefInstance1?.clear();
    ecahrtsRefInstance1?.setOption(echartsOptions1);
  } else {
    ecahrtsRefInstance1?.clear();
    ecahrtsRefInstance1?.setOption(echartsOptions1Pie);
  }
}

onMounted(() => {
  init();
  initRoles();
  getNoticeData();
  getShortMenuList();
  getCpayTypList();
});

const initRoles = () => {
  tabs.value = [];
  getData(user, roles);
};
const getData = (user: any, roles: any = []) => {
  let roleCde = "";
  if (roles)
    roles.forEach((res: any) => {
      // if (res === 'ROLE_00000196' || res === 'ROLE_00000324' || res === 'ROLE_00000001') {
      // 出岗  ROLE_00000008
      console.log(res, "权限编码");
      if (res === "ROLE_00000008" || res === "ROLE_00000563") {
        isOperate.value = true;
        tabs.value = tab1;
        moreurl.value = "/pcis-new-udr-list/orderProcessing";
      }
      // 核保
      if (res === "ROLE_00000152") {
        tableconfig = reactive<AppTableConfig>(
          createTableEditConfig({
            ...tableObj.unUdrObj,
            rowDbClickFun:(row:any)=> toQuery2(row),
          })
        );
        moreurl.value = "/pcis-new-udr-list/PendUdrListQuery";
        isAudit.value = true;
        tabs.value = tab2;
      }
      roleCde = roleCde === "" ? res : `${roleCde},${res}`;
    });
  // 核保岗
  if (isAudit.value) {
    getAuditTableData();
    currentTabName.value = tabs.value[0].name;
  } else {
    getIssueTableData();
    currentTabName.value = tabs.value[0].name;
  }
};

const toChange = (url: string) => {
  moreurl.value = url;
};

//tabs切换
let clickedTabData = ref({ udrType: "0", refName: "stagingList" });
const handleTabClick = (tab: any) => {
  pageresult.list = [];
  pageresult.total = 0;
  currentTabName.value = tab.props.label;
  let url = "";
  clickedTabData.value = tabs.value.find((t) => t.name === tab.props.label);
  pageData.value.pageNum = 1;
  if (isOperate.value) {
    tableconfig = reactive<AppTableConfig>(
      createTableEditConfig({
        ...tableObj[clickedTabData.value.tableObj],
        rowDbClickFun:(row:any)=> toQuery2(row),
      })
    );
    getIssueTableData();
  }
  if (isAudit.value) {
    tableconfig = reactive<AppTableConfig>(
      createTableEditConfig({
        ...tableObj[clickedTabData.value.tableObj],
        rowDbClickFun:(row:any)=> toQuery2(row),
      })
    );
    getAuditTableData();
  }
  tabs.value.forEach((item) => {
    if (item.name === tab.props.label) {
      url = item.url;
    }
  });
  toChange(url);
};
// 核保岗获取待办列表数据
const pageData = ref({
  pageSize: 10,
  pageNum: 1,
  cDptCde: user.companyId,
});
function getAuditTableData() {
  let getList = null;
  const udrType = clickedTabData.value.udrType;
  if (udrType === "3") {
    // 核保退回
    getList = pcisQueryService.getReturnedTask(pageData.value);
  } else if (udrType === "4") {
    // 核保通过
    getList = pcisQueryService.getApprovedTask(pageData.value);
  } else if (udrType === "1") {
    // 暂存任务
    const param = {};
    getList = pcisQueryService.getDraftTask(pageData.value);
  } else {
    getList = pcisQueryService.getNewUdrList(pageData.value);
  }
  const tmMap = ['crtTm','tUdrTm']
  getList
    .then((res: any) => {
      if (res && res.code === 200) {
        pageresult.list = res.data.map((item:any) => {
          tmMap.forEach((i:any) => {
            if(item[i]) {
              item[i] = item[i].replace(/T/g, ' ')
            }
          })
          return item;
        }) || [];
        pageresult.total = res.total || 0;
      } else {
        ElMessage.error({ message: res.msg, duration: 3000 });
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.msg);
    });
}
// 待办列表页码点击事件
function handlePageChange(data: any) {
  pageData.value = {...pageData.value, ...data};
  if (isAudit.value) {
    getAuditTableData();
  }
  if (isOperate.value) {
    getIssueTableData();
  }
}
// 出单岗获取列表数据
function getIssueTableData() {
  let getList = null;
  const refNm = clickedTabData.value.refName;
  if (refNm === "stagingList") {
    getList = pcisQueryService.selectDraftTask(pageData.value);
  } else if (refNm === "submittedList") {
    getList = pcisQueryService.selectSubmittedTask(pageData.value);
  } else if (refNm === "reviseList") {
    getList = pcisQueryService.selectPendingModificationTask(pageData.value);
  } else if (refNm === "pendingPaymentList") {
    getList = pcisQueryService.selectPendingPaymentTask(pageData.value);
  } else if (refNm === "renewalList") {
    getList = pcisQueryService.selectPendingRenewalTask(pageData.value);
  }
  const tmMap = ['tAppTm','tInsrncBgnTm','tInsrncEndTm',]
  getList
    ?.then((res: any) => {
      if (res && res.code === 200) {
        pageresult.list = res.data.map((item:any) => {
          tmMap.forEach((i:any) => {
            if(item[i]) {
              item[i] = item[i].replace(/T/g, ' ')
            }
          })
          return item;
        }) || [];
        pageresult.total = res.total || 0;
      } else {
        ElMessage.error({ message: res.msg, duration: 3000 });
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.msg);
    });
}

//点击更多按钮事件
const toQuery = (url: string) => {
  if (isOperate.value) {
    //出单员
    //暂存任务 （综合查询-投保单）、待修改任务 （综合查询-待修改单查询） 
    if (url === "/pcis-new-udr-list/orderProcessing") {
      let param = {};
      if(currentTabName.value == "暂存任务") {
        param = { taskStatus: '1' }
      } else if(currentTabName.value == "已提交任务") {
        param = { taskStatus: '2' }
      } else if(currentTabName.value == "待修改任务") {
        param = { taskStatus: '3' }
      } else if(currentTabName.value == "待续保") {
        param = { taskStatus: '5' }
      }
      sessionStorage.setItem(
        'navToOrderProcessing',
        JSON.stringify(param)
      );
    }
    router.push({ path: url });
  } else if (isAudit.value) {
    if (url === "/pcis-new-udr-list/PendUdrListQuery") {
      let param = {};
      if(currentTabName.value == "待核保任务") {
        param = { udrType: '1' }
      } else if(currentTabName.value == "暂存任务") {
        param = { udrType: '2' }
      } else if(currentTabName.value == "核保退回任务") {
        param = { udrType: '4' }
      } else if(currentTabName.value == "核保通过任务") {
        param = { udrType: '5' }
      }
      sessionStorage.setItem(
        'navToOrderUdrListQuery',
        JSON.stringify(param)
      );
      router.push({ path: url });
    }
  }
};
//table的row-click事件
const toQuery2 = (data: any) => {
  const row = { ...data };
  if (isOperate.value) {
    //出单员
    if (currentTabName.value === "暂存任务") {
      if (data.baseType === "投保") {
        const queryParam = {
          pageSize: 10,
          pageNum: 1,
          cLoadSub: "1",
          cDataTyp: "app",
          queryType: "1",
          cAppNo: data.cAppNo,
        };
        getAppPolicyList(queryParam).then((res: any) => {
          if (res.data?.result && res.data?.result.length > 0) {
            const data = res.data?.result[0];
            router.push({
              path: "/pcisapp/myPage",
              query: {
                param: JSON.stringify({
                  ...data,
                  ...{ pageType: "TEMPORARY_DEPOSIT" },
                }),
              },
            });
          }
        });
      } else if (data.baseType === "询价") {
        const queryParam = {
          pageSize: 10,
          pageNum: 1,
          cLoadSub: "1",
          cDataTyp: "app",
          queryType: "1",
          cInquiryNo: data.cInquiryNo,
          tAppTmStart: dayjs()
            .subtract(3, "month")
            .format("YYYY-MM-DD 00:00:00"),
          tAppTmEnd: dayjs().format("YYYY-MM-DD 23:59:59"),
        };
        getInquiryPolicyList(queryParam).then((res: any) => {
          if (res.data?.result && res.data?.result.length > 0) {
            const data = res.data?.result[0];
            router.push({
              path: "/pcisapp/pricePage",
              query: {
                param: JSON.stringify({
                  ...data,
                  ...{
                    pageType: "TEMPORARY_DEPOSIT",
                    pageName: "priceInquiry",
                  },
                }),
              },
            });
          }
        });
      } else if (data.baseType === "批改") {
        getAppPolicyList({
          cAppNo: data.cAppNo,
          pageSize: 10,
          pageNum: 1,
          cLoadSub: "1",
          cDataTyp: "app",
          queryType: "1",
        }).then((res: any) => {
          if (res.data?.result && res.data?.result.length > 0) {
            const data = res.data?.result[0];
            if (data["cEdrRsnBundleCde"]) {
              data.cRsnCde = data["cEdrRsnBundleCde"];
            }
            router.push({
              path: "/pcisapp/myPage",
              query: {
                param: JSON.stringify({
                  ...data,
                  ...{ pageType: "TEMPORARY_DEPOSIT" },
                }),
              },
            });
          }
        });
      }
    } else if (currentTabName.value === "已提交任务") {
      if (row.baseType === "询价") {
        const requestParam = {
          pageSize: 10,
          pageNum: 1,
          cLoadSub: "1",
          cDataTyp: "app",
          queryType: "1",
          cInquiryNo: data.cInquiryNo,
          tAppTmStart: dayjs()
            .subtract(3, "month")
            .format("YYYY-MM-DD 00:00:00"),
          tAppTmEnd: dayjs().format("YYYY-MM-DD 23:59:59"),
        };
        getInquiryPolicyList(requestParam).then((res: any) => {
          if (res.data && res.data.length > 0) {
            const data = res.data?.result[0];
            showDetails(data, row.baseType);
          }
        });
      } else {
        getAppPolicyList({
          cAppNo: data.cAppNo,
          pageSize: 10,
          pageNum: 1,
          cLoadSub: "1",
          queryType: "1",
          cDataTyp: "app",
        }).then((res: any) => {
          if (res.data?.result && res.data?.result.length > 0) {
            const data = res.data?.result[0];
            router.push({
              path: "/pcisapp/pcisappView",
              query: {
                param: JSON.stringify({ ...data, ...{ pageType: "readonly" } }),
              },
            });
          }
        });
      }
    } else if (currentTabName.value === "待修改任务") {
      const queryParam = {
        pageSize: 10,
        pageNum: 1,
        cLoadSub: "1",
        cDataTyp: "app",
        queryType: "1",
        cAppNo: data.cAppNo,
      };
      getAppPolicyList(queryParam).then((res: any) => {
        if (res.data?.result && res.data?.result.length > 0) {
          const data = res.data?.result[0];
          router.push({
            path: "/pcisapp/myPage",
            query: {
              param: JSON.stringify({
                ...data,
                ...{ pageType: "TEMPORARY_DEPOSIT" },
              }),
            },
          });
        }
      });
    } else if (currentTabName.value === "待续保") {
      getPolicy({ cPlyNo: row.cPlyNo, queryTyp: "orig" })
        .then((res: any) => {
          const { code, res: data, msg } = res;
          if (200 === code) {
            router.push({
              path: "/pcisapp/myPage",
              query: {
                param: JSON.stringify({
                  ...handleArray(data.composition.plyBase[0]),
                  ...{
                    cDptCnm: row.cDptCnm,
                    cTermNme: row.cTermNme,
                    cTermNo: row.cTermNo,
                  },
                  ...{ pageType: "orig" },
                }),
              },
            });
            sessionStorage.setItem(
              "toMyPageData",
              JSON.stringify({
                ...JSON.parse(sessionStorage.getItem("toMyPageData")),
                ...{ pageType: "orig" },
              })
            );
          } else {
            ElMessage.error(msg);
          }
        })
        .finally(() => {});
    } else if (currentTabName.value === "待缴费") {
      router.push({
        path: "/payinfoManagement/payinfohandle",
        query: {
          param: JSON.stringify({ cAppNo: data.cAppNo }),
        },
      });
    }
  } else if (isAudit.value) {
    //核保员
    if (currentTabName.value === "暂存任务") {
      if (row.baseType === "询价") {
        const requestParam = {
          pageSize: 10,
          pageNum: 1,
          companyId: user.companyId,
          operId: user.opCde,
          inNextDpt: "1",
          udrType: "1",
          orgCde: "0200000000000",
          objId: row.cInquiryNo,
          roleCde: "ROLE_00000152",
        };
        getInquiryNewUdrList(requestParam).then((res: any) => {
          if (res.data && res.data.length > 0) {
            const data = res.data[0];
            handleClickStagingList(data, "1", "询价");
          }
        });
      } else {
        const requestParam = {
          pageSize: 10,
          pageNum: 1,
          companyId: user.companyId,
          operId: user.opCde,
          inNextDpt: "1",
          udrType: "1",
          orgCde: "0200000000000",
          objId: row.cAppNo,
          roleCde: "ROLE_00000152",
        };
        getNewUdrList(requestParam).then((res: any) => {
          if (res.data && res.data.length > 0) {
            const data = res.data[0];
            handleClickStagingList(data, "1");
          }
        });
      }
    } else if (currentTabName.value === "待核保任务") {
      if (row.baseType === "询价") {
        const requestParam = {
          pageSize: 10,
          pageNum: 1,
          companyId: user.companyId,
          operId: user.opCde,
          inNextDpt: "1",
          udrType: "0",
          orgCde: "0200000000000",
          objId: row.cInquiryNo,
          roleCde: "ROLE_00000152",
        };
        getInquiryNewUdrList(requestParam).then((res: any) => {
          if (res.data && res.data.length > 0) {
            const data = res.data[0];
            handleClickStagingList(data, "0", "询价");
          }
        });
      } else {
        const requestParam = {
          pageSize: 10,
          pageNum: 1,
          companyId: user.companyId,
          operId: user.opCde,
          inNextDpt: "1",
          udrType: "0",
          orgCde: "0200000000000",
          objId: row.cAppNo,
          roleCde: "ROLE_00000152",
        };
        getNewUdrList(requestParam).then((res: any) => {
          if (res.data && res.data.length > 0) {
            const data = res.data[0];
            handleClickStagingList(data, "0");
          }
        });
      }
    } else if (currentTabName.value === "核保退回任务") {
      if (row.baseType === "询价") {
        const requestParam = {
          pageSize: 10,
          pageNum: 1,
          companyId: user.companyId,
          operId: user.opCde,
          udrType: "3",
          objId: row.cInquiryNo,
          roleCde: "ROLE_00000152",
          isInquiry: "1",
        };
        backInquiryUdrList(requestParam).then((res: any) => {
          if (res.data && res.data.length > 0) {
            const data = res.data[0];
            showDetails(data, row.baseType);
          }
        });
      } else {
        const requestParam = {
          pageSize: 10,
          pageNum: 1,
          companyId: user.companyId,
          operId: user.opCde,
          udrType: "3",
          objId: row.cAppNo,
          roleCde: "ROLE_00000152",
          CLoadSub: 1,
        };
        getBackUdrList(requestParam).then((res: any) => {
          if (res.data && res.data.length > 0) {
            const data = res.data[0];
            showDetails(data);
          }
        });
      }
    } else {
      if (row.baseType === "询价") {
        const requestParam = {
          pageSize: 10,
          pageNum: 1,
          cLoadSub: "1",
          cDataTyp: "app",
          queryType: "1",
          cInquiryNo: data.cInquiryNo,
          tAppTmStart: dayjs()
            .subtract(3, "month")
            .format("YYYY-MM-DD 00:00:00"),
          tAppTmEnd: dayjs().format("YYYY-MM-DD 23:59:59"),
        };
        getInquiryPolicyList(requestParam).then((res: any) => {
          if (res.data && res.data?.result.length > 0) {
            const data = res.data?.result[0];
            showDetails(data, row.baseType);
          }
        });
      } else {
        const requestParam = {
          pageSize: 10,
          pageNum: 1,
          objId: data.cAppNo,
          udrType: "4",
          CAppStatus: "5",
          bsType: "A",
          CLoadSub: "1",
          sortField: "name",
          TAppTmStart: "2025-07-28 00:00:00",
          tAppTmEnd: "2025-08-27 00:00:00",
          sortOrder: null,
          orgCde: user.companyId,
          CurrentUser: user.opCde,
          CurrentUserOrg: user.companyId,
          findPlan: true,
        };
        getAppPolicyList(requestParam).then((res: any) => {
          if (res.data && res.data?.result.length > 0) {
            const data = res.data?.result[0];
            showDetails(data);
          }
        });
      }
    }
  }
};

// 输入框查询
function handleSearch(val: any) {
  searchBtnItem.loading = true;
  if (isOperate.value) {
    //出单员
    const param = Object.assign({
      CurrentUser: user.opCde,
      CurrentUserOrg: user.companyId,
      CAppNo: val,
      TIssueTmStart: moment(new Date(Date.now()))
        .subtract(6, "day")
        .format("YYYY-MM-DD HH:mm:ss"),
      TIssueTmEnd: moment(new Date(Date.now())).format("YYYY-MM-DD HH:mm:ss"),
    });
    sessionStorage.setItem(
      AppKey.query.pcis_query_search,
      JSON.stringify(param)
    );
    searchBtnItem.loading = false;
    router.push({ path: "/query/classification-querys" });
  } else if (isAudit.value) {
    //核保员
    const param = Object.assign({
      type: "temp",
      CurrentUser: user.opCde,
      CurrentUserOrg: user.companyId,
      objId: val,
      startCrtTm: moment(new Date(Date.now()))
        .subtract(6, "day")
        .format("YYYY-MM-DD HH:mm:ss"),
      TAppTmEnd: moment(new Date(Date.now())).format("YYYY-MM-DD HH:mm:ss"),
      startBsTm1: moment(new Date(Date.now()))
        .subtract(6, "day")
        .format("YYYY-MM-DD HH:mm:ss"),
      endBsTm1: moment(new Date(Date.now())).format("YYYY-MM-DD HH:mm:ss"),
    });
    sessionStorage.setItem(
      AppKey.query.pcis_query_newudrlist,
      JSON.stringify(param)
    );
    searchBtnItem.loading = false;
    router.push({ path: "/pcis-new-udr-list/PendUdrListQuery" });
  }
}

// 编辑快捷菜单
function openShortcutEdit() {
  dzmodal
    .open(shortMenuDialog, { type: "", data: shortcutDataList.value })
    .then((res: any) => {
      if (res.type === "ok") {
        shorMenuList.value = res.body;
      }
    });
}

// 获取消息通知数据
const noticeList = ref([]);
function getNoticeData() {
  let param = {
    CReceiver: user.opCde,
    CState: "0",
    CType: "0",
    limit: 10,
  };
  pcisQueryService.getNotifyByReceiver(param).then((res: any) => {
    console.log("消息数据", res);
    if (res.code === 200 && res.data.code === "1") {
      noticeList.value = res.data.result;
    }
  });
}

// 获取热搜菜单
const shortcutDataList = ref([]);
const tagType = ["primary", "success", "info", "warning", "danger"]; // 标签类型
function getShortMenuList() {
  getShortcutDataList().then((res: any) => {
    if (res.code == 200) {
      shortcutDataList.value = res.data;
      shorMenuList.value = [];
      res.data.forEach((d: any, i: boolean) => {
        if (d.select && shorMenuList.value.length < 5) {
          shorMenuList.value.push({
            name: d.label,
            type: tagType[(i % 5) + 1],
            url: d.url,
          });
        }
      });
    }
  });
}

const handleArray = (obj: any) => {
  // 创建一个新的对象，并移除"Base."前缀
  let newObj = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      // 通过字符串操作去掉前缀
      let newKey = key.replace("Base.", "");
      newObj[newKey] = obj[key];
    }
  }
  return newObj;
};

function getCpayTypList() {
  getListByCode("WEB_BAS_CODELIST", {
    cParCde: "shoufeifangshi",
    cIsValid: "1",
  }).then(
    (res) => {
      if (!!res && !!res["data"]) {
        cPayTypList.value = res["data"];
      }
    },
    (error) => {
      console.log("出错了", error);
      // ElMessage.error('后台服务异常,请联系管理员');
    }
  );
}
// 待核保任务、暂存任务行点击
function handleClickStagingList(row: any, state?: string, baseType?: string) {
  if (state === "0") {
    // 未接收
    const {
      objId,
      curtTask,
      bsType,
      prodNo,
      cRelateBusi,
      cEdrRsnBundleCde,
      plyNo,
      cTermNme,
      cTermNo,
    } = row;
    // 关联交易业务，接收时给出提示
    if (
      cRelateBusi &&
      cEdrRsnBundleCde !== "s1" &&
      cEdrRsnBundleCde !== "s2" &&
      cEdrRsnBundleCde !== "c1"
    ) {
      ElMessageBox.alert(
        "该笔业务为关联交易业务，请检查是否已上传【关联交易审批单】！",
        "提示",
        {
          confirmButtonText: "确认",
        }
      );
    }

    if (bsType === "P") {
      // 方案不校验倒签
      if ("000000" === prodNo) {
        const param = {
          taskId: curtTask,
          user: user,
        };
        const flag = hasReceived(param);
        flag.then((result) => {
          if (200 !== result["code"]) {
            ElMessage.error({ message: result.msg, duration: 3000 });
          } else {
            const data = {
              CPlanNo: objId,
              TaskId: curtTask,
              scene: SCENE_PLAN_UW_PROCESS,
              CProdNo: "000000",
              cAppTyp: row.bsType,
              cTermNme: row.cTermNme,
              cTermNo: row.cTermNo,
              cPolicySource: row.cPolicySource,
              cRelateBusi: row.cRelateBusi,
              cEdrRsnBundleCde: row.cEdrRsnBundleCde,
            };
            const en = JSON.stringify(data);
            router.push({
              path: "/pcisapp/myPage",
              query: {
                param: en,
              },
            });
          }
        });
      } else {
        handleReceived(row, baseType);
      }
    } else if (bsType === "E" && !!plyNo) {
      checkEdrPocly({ CPlyNo: plyNo }).then(async (res) => {
        if (!!res && !!res["code"]) {
          if (res["code"] === 200 && res["msg"].indexOf("出险时间") > 0) {
            const confirmRes = await ElMessageBox.confirm(
              res.msg + "\n是否继续核保？",
              "提示",
              {
                confirmButtonText: "确认",
                cancelButtonText: "取消",
                type: "info",
              }
            ).catch(() => false);
            if (!confirmRes) {
              return;
            }
          }
          handleReceived(row, baseType);
        }
      });
    } else {
      handleReceived(row, baseType);
    }
  } else {
    updateUdrDetail(row, baseType);
  }
}

function handleReceived(row: any, baseType?: string) {
  const param = {
    taskId: row.curtTask,
    user: user,
  };

  hasReceived(param)
    .then((result: any) => {
      if (result.code !== 200) {
        ElMessage.error({ message: result.msg, duration: 3000 });
      } else {
        if (row.bsType === "P") {
          const en = JSON.stringify({
            CPlanNo: row.objId,
            TaskId: row.curtTask,
            "Base.CProdNo": row.prodNo,
            scene: SCENE_PLAN_UW_PROCESS,
            cAppTyp: row.bsType,
            cTermNo: row.cTermNo,
            cTermNme: row.cTermNme,
            cProdNmeCn: row.prodName,
            cPolicySource: row.cPolicySource,
            cRelateBusi: row.cRelateBusi,
            cEdrRsnBundleCde: row.cEdrRsnBundleCde,
          });
          router.push({
            path: "/pcisapp/myPage",
            query: {
              param: en,
            },
          });
        } else {
          // 详情
          updateUdrDetail(row, baseType);
        }
      }
    })
    .catch((error: any) => {
      console.log("出错了", error);
      ElMessage.error({
        message: "后台服务异常,请联系管理员",
        duration: 3000,
      });
    });
}

function updateUdrDetail(row: any, baseType?: string) {
  const getBaseInfo =
    baseType === "询价"
      ? getBaseInfoByInquiryNo({ inquiryNo: row.objId })
      : getBaseInfoByAppNo({ appNo: row.objId });
  getBaseInfo.then((r: any) => {
    if (r.code !== 200) {
      ElMessage.error({ message: r.msg, duration: 6000 });
    } else {
      if (row.bsType === "A") {
        if (baseType === "询价") {
          const en = JSON.stringify({
            // scene: SCENE_PLY_UW_PROCESS,
            cAppNo: row.cAppNo,
            cInquiryNo: row.objId,
            taskId: row.curtTask,
            cAppTyp: row.bsType,
            cProdNo: row.prodNo,
            cCiMrk: r.data.cCiMrk,
            cGrpMrk: r.data.cGrpMrk,
            cDptCde: r.data.cDptCde,
            cDptCnm: row.uwDptName,
            pageType: "PLY_UW_PROCESS_SCENE",
            sysType: row.objExt,
            plyNo: row.plyNo === "*" ? "" : row.plyNo,
            cTermNo: row.cTermNo,
            cTermNme: row.cTermNme,
            cProdNmeCn: row.prodName,
            pageName: "priceInquiry",
          });
          router.push({
            path: "/pcisapp/pricePage",
            query: {
              param: en,
            },
          });
        } else {
          const en = JSON.stringify({
            // scene: SCENE_PLY_UW_PROCESS,
            cAppNo: row.objId,
            taskId: row.curtTask,
            cAppTyp: row.bsType,
            cProdNo: row.prodNo,
            cCiMrk: r.data.cCiMrk,
            cGrpMrk: r.data.cGrpMrk,
            cDptCde: r.data.cDptCde,
            cDptCnm: row.uwDptName,
            pageType: "PLY_UW_PROCESS_SCENE",
            sysType: row.objExt,
            plyNo: row.plyNo === "*" ? "" : row.plyNo,
            cTermNo: row.cTermNo,
            cTermNme: row.cTermNme,
            cProdNmeCn: row.prodName,
          });
          router.push({
            path: "/pcisapp/myPage",
            query: {
              param: en,
            },
          });
        }
      } else {
        const en = JSON.stringify({
          scene:
            r.data.cEdrRsnBundleCde === "BL"
              ? SCENE_PLY_UW_PROCESSBEARER
              : SCENE_PLY_UW_PROCESS,
          cAppNo: row.objId,
          taskId: row.curtTask,
          cAppTyp: row.bsType,
          cProdNo: row.prodNo,
          cCiMrk: r.data.cCiMrk,
          cRsnCde: r.data.cEdrRsnBundleCde,
          cEdrType: r.data.cEdrType,
          cGrpMrk: r.data.cGrpMrk,
          cDptCde: r.data.cDptCde,
          cDptCnm: row.uwDptName,
          pageType: "PLY_UW_PROCESS_SCENE",
          sysType: row.objExt,
          plyNo: row.plyNo,
          cTermNo: row.cTermNo,
          cTermNme: row.cTermNme,
          cProdNmeCn: row.prodName,
        });
        router.push({
          path: "/pcisapp/myPage",
          query: {
            param: en,
          },
        });
      }
    }
  });
}

function showDetails(row: any, type?: any) {
  let cAppTyp = row.bsType ? row.bsType : row.cAppTyp;
  if (cAppTyp === "P") {
    if (row.cProdNo === "000000") {
      const param = {
        CPlanNo: row.cAppNo,
        CPlanMrk: row.cPlanMrk,
        scene: SCENE_PLAN_READ,
      };
      const en = JSON.stringify(param);
      router.push({
        path: "/index/pcis-combination/configPlan/combination-main",
        query: { data: en },
      });
    } else {
      const en = JSON.stringify({
        CPlanNo: row.cAppNo,
        // 'Base.CProdNo': plan['PrdProdPlan.CProdNo'],
        // 'Base.CGrpMrk': plan['PrdProdPlan.CGrpMrk'],
        CPlanMrk: row.cPlanMrk,
        "Base.CProdNo": row.cProdNo,
        "Base.CGrpMrk": row.cGrpMrk,
        scene: SCENE_PLAN_READ,
      });
      router.push({
        path: "/index/sys-right-basic/configPlan/detail",
        query: { data: en },
      });
    }
  } else {
    const getBaseInfo =
      type === "询价"
        ? getBaseInfoByInquiryNo({ inquiryNo: row.objId || row.cInquiryNo })
        : getBaseInfoByAppNo({ appNo: row.objId || row.cAppNo });
    getBaseInfo.then((r: any) => {
      if (r.code !== 200) {
        ElMessage.error({ message: r.msg, duration: 6000 });
      } else {
        if (cAppTyp === "A") {
          const p: any = {
            taskId: row.curtTask,
            cAppTyp: row.bsType ? row.bsType : row.cAppTyp,
            cProdNo: row.prodNo ? row.prodNo : row.cProdNo,
            cCiMrk: r.data.cCiMrk,
            cGrpMrk: r.data.cGrpMrk,
            cDptCde: r.data.cDptCde,
            cDptCnm: row.uwDptName ? row.uwDptName : row.cDptCnm,
            pageType: "UW_READ_SCENE",
            cTermNme: row.cTermNme,
            cTermNo: row.cTermNo,
            cProdNmeCn: row.prodName,
            cPolicySource: row.cPolicySource,
          };
          if (type === "询价") {
            p["cInquiryNo"] = row.objId ? row.objId : row.cInquiryNo;
            p["pageName"] = "priceInquiry";
          } else {
            p["cAppNo"] = row.objId ? row.objId : row.cAppNo;
          }
          const en = JSON.stringify(p);
          router.push({
            path: type === "询价" ? "/pcisapp/pricePage" : "/pcisapp/myPage",
            query: {
              param: en,
            },
          });
        } else {
          const p: any = {
            taskId: row.curtTask,
            cAppTyp: row.bsType ? row.bsType : row.cAppTyp,
            cProdNo: row.prodNo ? row.prodNo : row.cProdNo,
            cCiMrk: r.data.cCiMrk,
            cRsnCde: r.data.cEdrRsnBundleCde,
            cEdrType: r.data.cEdrType,
            cGrpMrk: r.data.cGrpMrk,
            cDptCde: r.data.cDptCde,
            cDptCnm: row.uwDptName ? row.uwDptName : row.cDptCnm,
            pageType: "UW_READ_SCENE",
            cTermNme: row.cTermNme,
            cTermNo: row.cTermNo,
            cProdNmeCn: row.prodName,
            cPolicySource: row.cPolicySource,
          };
          if (type === "询价") {
            p["cInquiryNo"] = row.objId ? row.objId : row.cInquiryNo;
            p["pageName"] = "priceInquiry";
          } else {
            p["cAppNo"] = row.objId ? row.objId : row.cAppNo;
          }
          const en = JSON.stringify(p);
          router.push({
            path: type === "询价" ? "/pcisapp/pricePage" : "/pcisapp/myPage",
            query: {
              param: en,
            },
          });
        }
      }
    });
  }
}

// 添加 copyText 方法
const copyText = (text: any) => {
  if (!text) {
    ElMessage.warning("没有可复制的内容");
    return;
  }

  // 检查 navigator.clipboard 是否存在
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(
      () => {
        ElMessage.success("复制成功");
      },
      () => {
        ElMessage.error("复制失败");
      }
    );
  } else {
    // 使用 document.execCommand('copy') 方法作为备选方案
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      const result = document.execCommand("copy");
      if (result) {
        ElMessage.success("复制成功");
      } else {
        ElMessage.error("复制失败");
      }
    } catch (err) {
      ElMessage.error("复制失败，请稍后再试");
    } finally {
      document.body.removeChild(textarea); // 清理创建的 textarea 元素
    }
  }
};

// 窗口大小变化时重置图表
window.addEventListener("resize", () => {
  if (ecahrtsRefInstance) {
    ecahrtsRefInstance.resize();
  }
  if (ecahrtsRefInstance1) {
    ecahrtsRefInstance1.resize();
  }
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  position: absolute;
  width: 100%;
  height: 100%;

  .home {
    width: 100%;
    height: 100%;
    background-image: var(--dashboard-bg);
    background-size: 100% 24.06667rem;
    background-position: top;
    padding: 0.8rem 6.5rem 0.8rem 4rem;
    overflow-y: auto;

    .top-box {
      width: 100%;
      margin-bottom: 0.5rem;

      .top-title1 {
        font-weight: 600;
        margin-bottom: 6px;
        font-size: 34px;
        color: var(--el-text-color);
        line-height: 48px;
      }

      .top-title2 {
        font-weight: 600;
        margin-bottom: 1.5rem;
        font-size: 16px;
        color: var(--el-text-color);
        line-height: 22px;
      }

      .top-search {
        width: 75%;
        height: 3rem;
        display: flex;
        align-items: center;
        background: var(--rt-bg-color);
        border: var(--el-mypage-right-menu-border-color) 1px solid;
        min-width: 840px;

        :deep(.el-input__wrapper) {
          box-shadow: none;
        }

        :deep(.el-button) {
          margin-right: 10px;
          font-size: 18px;
        }
        :deep(.el-button>span) {
          padding-left: 20px;
        }
        &:hover{
          border: 1px var(--el-color-primary) solid;
        }
      }

      .top-menu {
        display: flex;
        padding: 15px 0;
        color: var(--el-text-color);
        font-weight: bold;
        .menu-label {
          display: flex;
          align-items: center;
          .hot-menu-label {
            margin-left: 5px;
          }
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
      // margin-bottom: 1.5rem;
      justify-content: space-between;

      .center-content1 {
        width: 100%;
        background-color: var(--rt-bg-color);
        // box-shadow: 0 0 0.4rem #0000001a;
        box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.1);
        border-radius: 5px;
        padding: 1rem 1.5rem;
        display: flex;
        flex-direction: column;

        .title-box {
          .title-line {
            display: flex;
            align-items: center;
            .title {
              font-size: 18px;
              color: var(--el-text-color);
              font-weight: 600;
              margin-right: 5px;
              line-height: 25px;
            }
            .icon {
              width: 18px;
              height: 11px;
            }
          }
        }

        .statistic-tab-box {
          margin: 10px 0;
          color: var(--el-text-color);
          display: flex;
          :deep(.el-tabs__item) {
            font-size: 15px;
            line-height: 24px;
            color: var(--el-text-color);
            &.is-active,&:hover {
              color: var(--el-color-primary);
            }
          }
          .tab-item {
            margin-right: 10px;
            cursor: pointer;
          }
        }

        .content-details-box {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          color: var(--el-text-color);

          .content-details {
            display: flex;
            align-items: center;
            margin: 10px 10px 10px 0;
            font-size: 16px;
            justify-content: center;
            .round {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background-color: var(--rt-bg-color);
              margin-right: 10px;
            }
            .details-title {
              color: var(--el-text-color);
            }
            .details-content {
              color: var(--el-text-color);
            }
            &:first-child {
              justify-content: left;
            }
            &:last-child {
              justify-content: right;
            }
          }
        }
        .content-charts-box {
          margin-top: 10px;
          .echarts-box {
            display: flex;
            // justify-content: space-between;
            .echarts-content {
              width: calc(50% - 120px);
              margin-right: 20px;
            }
            .echarts-list {
              font-size: 16px;
              color: var(--el-text-color);
              width: 200px;
              div {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                .month::before {
                  content: '';
                  width: 12px;
                  height: 12px;
                  border-radius: 6px;
                  background: var(--rt-bg-color);
                  display: inline-block;
                  margin-right: 10px;
                  color: var(--el-text-color);
                }
              }
            }
          }
          .tab-box {
            display: flex;
            justify-content: end;
            align-items: center;
            margin: 20px 0;
            color: var(--el-text-color);
          }
          .echarts-title {
            font-size: 16px;
            color: var(--el-text-color);
            line-height: 22px;
            font-weight: 500;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }
      }

      .center-content2 {
        width: 24%;
        //background: #fff;
        background-color: var(--rt-bg-color);
        box-shadow: 0 0 0.4rem #0000001a;
        border-radius: 5px;
        padding: 1rem;
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
          height: 310px;
          // overflow-y: auto;
          display: flex;
          flex-direction: column;
          .list-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .title {
              color: var(--el-text-color);
              font-weight: bold;
              margin-right: 5px;
              font-size: 18px;
            }
          }
          .list-content {
            flex: 1;
            overflow: auto;
            .list-content-item {
              padding: 10px;
              .item-title {
                display: flex;
                align-items: center;
                color: var(--el-text-color);
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
                color: var(--el-text-color);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-top: 5px;
              }
            }
          }
        }
        .code-box {
          height: 100px;
          .code-inner-box {
            display: flex;
            align-items: center; /* 垂直居中 */
            justify-content: flex-start; /* 左对齐 */
            gap: 16px; /*间距*/
            padding: 16px 14px;
            .code-img {
              width: 28%;
              height: 28%;
            }
            .link {
              color: var(--el-color-primary);
              text-decoration: none;
              padding-left: 6px;
            }
            a:hover {
              text-decoration: underline;
            }
          }
        }
      }
    }
    .bottom-box {
      width: 100%;
      //background: #fff;
      background-color: var(--rt-bg-color);
      // box-shadow: 0 0 0.4rem #0000001a;
      box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      padding: 10px 20px;
      display: flex;
      flex-direction: column;
      margin-bottom: 1.5rem;
      .title-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .title-line {
          display: flex;
          align-items: center;
          .title {
            font-size: 18px;
            color: var(--el-text-color);
            font-weight: 600;
            margin-right: 5px;
            line-height: 25px;
          }
          .icon {
            width: 18px;
            height: 11px;
          }
        }
      }
      .table-box {
        .table {
          display: flex;
          flex-direction: column;
          :deep(.el-table) {
            th.el-table__cell {
              background: var(--rt-bg-color);
            }
          }
        }
        .tabs-box {
          :deep(.el-tabs__item) {
            font-size: 15px;
            line-height: 24px;
            color: var(--el-text-color);
            &.is-active,&:hover {
              color: var(--el-color-primary);
            }
          }
        }
        .searchbar {
          border: none;
          box-shadow: none;
          :deep(.el-card) {
            --el-card-border-color: transparent;
            .el-card__header {
              display: none;
            }
            .el-card__body {
              padding: 0;
            }
          }
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
  align-items: center;
}

/* 首页banner部分 */
.subbanner {
  padding: 0 16px;
  background: url("@/assets/img/bannerbg.jpg") no-repeat;
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
  background: var(--rt-bg-color);
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

.copy-icon {
  margin-left: 5px;
  cursor: pointer;
  color: var(--el-color-primary);
}

.policy-info-cell {
  display: flex;
  flex-direction: column;
  // gap: 4px;
}

.policy-number-row {
  display: flex;
  align-items: center;
  line-height: 16px;
}

.policy-number-row span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.primmaryColor {
  color: var(--el-color-primary);
  cursor: pointer;
}

:deep(.stagingList .el-table__body .el-table__row td:nth-child(2) .el-text),
:deep(.submittedList .el-table__body .el-table__row td:nth-child(2) .el-text),
:deep(.reviseList .el-table__body .el-table__row td:nth-child(2) .el-text),
:deep(
  .pendingPaymentList .el-table__body .el-table__row td:nth-child(1) .el-text
),
:deep(.renewalList .el-table__body .el-table__row td:nth-child(1) .el-text),
:deep(.unUdrList .el-table__body .el-table__row td:nth-child(2) .el-text),
:deep(.udrStagingList .el-table__body .el-table__row td:nth-child(2) .el-text),
:deep(.udrReturnList .el-table__body .el-table__row td:nth-child(2) .el-text) {
  color: var(--el-color-primary);
  cursor: pointer;
}

.code-box {
  // height: 100px;
  .code-inner-box {
    display: flex;
    align-items: center; /* 垂直居中 */
    justify-content: flex-start; /* 左对齐 */
    // gap: 16px; /*间距*/
    // padding: 16px 14px;
    flex-direction: column;
    margin-bottom: 10px;
    .code-img {
      width: 64px;
    }
    .link {
      color: var(--el-color-primary);
      text-decoration: none;
      // padding-left: 6px;
    }
    a:hover {
      text-decoration: underline;
    }
    .title {
      width: 98px;
    }
  }
}
:deep(.methodColumn) {
  grid-template-columns: repeat(1, 1fr);
}
:deep(.el-text.is-truncated) {
  vertical-align: middle;
}
</style>

<template>
  <div class="dashboard-container">
    <el-row class="mb-2">
      <el-col>
        <home-header ref="homeHeaderRef" @search="shortcutSearch" @msgHandle="msgHandle" />
      </el-col>
    </el-row>
    <div class="subbanner">
      <div class="chart-main">
        <Echarts />
      </div>
    </div>

    <el-row>
      <el-col :md="24">
        <el-card v-if="isOperate || isAudit" shadow="never" class="index-blk" style="position: relative;">

          <el-tabs @tab-click="handleTabClick">
            <el-tab-pane v-for="tab in tabs" :key="tab.name" :label="tab.name">
            </el-tab-pane>
          </el-tabs>

          <app-table :key="currentTabName" :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
            @row-click="(row) => toQuery2(row, tab)" />

          <div class="more">
            <a @click="toQuery(moreurl)" class="sty">更多>></a>
          </div>
          
 
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import moment from "moment";

import Echarts from '@/views/charts/echarts/echartsComponent.vue';
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";

import { AppKey } from '@/constants/api';
import { PcisQueryService } from '@/views/dashboard/service/v1.service';

defineOptions({
  name: "Dashboard",
  inheritAttrs: false,
});
const userStore = useUserStore();
const user = ref(userStore.user)
const ops = user.value.ops;
const roles = ref(userStore.user.roles)
const topStatic = ref<Array<any>>([]);
const router = useRouter();
const homeHeaderRef = ref();

const pcisQueryService = new PcisQueryService();
const _current = ref(1);
const _pageSize = ref(6);
const moreurl = ref('');
const tabs = ref<Array<any>>([]); //tabs数组
const currentTabName = ref('暂存任务') //tabs默认值
// const isOperate = ref(false)  //管理员
//todo  假数据先写死
const isOperate = ref(false) //管理员 出单岗
const isAudit = ref(false) //  核保岗
const shortListData = ref(null)  // 第二模块tabl列表数据

let pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableObj = {
  // 出单--暂存任务
  notWaitObj: {
    fromSchema: [
      {
        // prop: "cAppNo",
        // inputtype: "rtinput",
        prop: "cAppNo",
        inputtype: "rtinput",
        title: "申请单号",
      },
      {
        prop: "cAppTyp",
        inputtype: "rtselect",
        title: "类型",
        loadData: [
          { value: "A", label: "投保单" },
          { value: "E", label: "批单" },
        ],
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人",
      },
      {
        prop: "tAppTm",
        inputtype: "rtinput",
        title: "投保日期",
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "保费",
      },
      {
        prop: "cOperCnm",
        inputtype: "rtinput",
        title: "操作员",
      },
      {
        prop: "cAppStatus",
        title: "状态",
        inputtype: "rtselect",
        typeCode: "RECEIVE_BANK_CATEGORY",
        codeParam: { cParCde: "shenqingdanzhuangtai" },
      },
    ],
  },
  // 出单--待修改任务
  notReviseObj: {
    fromSchema: [
      {
        // prop: "cAppNo",
        // inputtype: "rtinput",
        prop: "objId",
        inputtype: "rtinput",
        title: "申请单号",
      },
      {
        prop: "bsType",
        inputtype: "rtselect",
        title: "类型",
        loadData: [
          { value: "A", label: "投保单" },
          { value: "E", label: "批单" },
        ],
      },
      {
        prop: "appCde",
        inputtype: "rtinput",
        title: "投保人",
      },
      {
        prop: "crtTm",
        inputtype: "rtinput",
        title: "投保日期",
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "保费",
      },
      {
        prop: "operName",
        inputtype: "rtinput",
        title: "操作员",
      },
      {
        prop: "cAppStatus",
        title: "状态",
        inputtype: "rtselect",
        typeCode: "RECEIVE_BANK_CATEGORY",
        codeParam: { cParCde: "shenqingdanzhuangtai" },
      },
    ],
  },

  //出单-待续保
  waitObj: {
    fromSchema: [
      {
        prop: "cPlyNo",
        inputtype: "rtinput",
        title: "保单号",
      },
      {
        prop: "nPrm",
        inputtype: "rtinput",
        title: "保费",
      },
      {
        prop: "cAppNme",
        inputtype: "rtinput",
        title: "投保人",
      },
      {
        prop: "cMobile",
        inputtype: "rtinput",
        title: "投保人联系电话",
      },
      {
        prop: "tInsrncBgnTm",
        inputtype: "rtinput",
        title: "保险起期",
      },
      {
        prop: "tInsrncEndTm",
        inputtype: "rtinput",
        title: "保险止期",
      },
      {
        prop: "nExpirationDays",
        inputtype: "rtinput",
        title: "终保倒计时(天)",
      },
    ],
  },
  //核保员-暂存任务
  saveObj: {
    fromSchema: [
      {
        prop: "uwDptName",
        inputtype: "rtinput",
        title: "出单机构",
      },
      {
        prop: "appCde",
        inputtype: "rtinput",
        title: "投保人",
      },
      {
        prop: "prodName",
        inputtype: "rtinput",
        title: "险种",
      },
      {
        prop: "objId",
        inputtype: "rtinput",
        title: "申请单号",
      }
    ],
  },
  //核保员-修改单
  editObj: {
    fromSchema: [
      {
        prop: "uwDptName",
        inputtype: "rtinput",
        title: "出单机构",
      },
      {
        prop: "appCde",
        inputtype: "rtinput",
        title: "申请单号",
      },
      {
        prop: "prodName",
        inputtype: "rtinput",
        title: "险种",
      },
      {
        prop: "cAppStatus",
        inputtype: "rtinput",
        title: "状态",
      }
    ],
  }
}
// 出岗 tab
let tab1 = [{
  name: '暂存任务',
  refName: 'stagingList',
  tableObj: 'notWaitObj',
  url: '/query/application-querys',
},
{
  name: '待修改任务',
  refName: 'reviseList',
  tableObj: "notReviseObj",
  url: '/query/application-querys',
},
{
  name: '待续保',
  refName: 'renewalList',
  tableObj: 'waitObj',
  url: '/RenewalManagement/renewal-management',
}
]

// 核保tab
let tab2 = [{
  name: '暂存任务',
  refName: 'udrStagingList',
  tableObj: 'saveObj',
  url: '/pcis-new-udr-list/PendUdrList',
},
{
  name: '待修改任务',
  refName: 'udrReturnList',
  tableObj: "editObj",
  url: '/pcis-new-udr-list/PendUdrList',
}
]


let tableconfig = reactive<AppTableConfig>(
  createTableEditConfig(tableObj.notWaitObj)
);

// 待办跳转
const itemHandle = (item) => {
  const param = JSON.stringify({ queryType: item.state });
  router.push({ path: item.pageRoute, query: { param: param } });
}

const shortcutSearch = (searchParams) => {
  router.push({
    path: `/query/comprehensive`,
    query: {
      param: JSON.stringify({
        queryParam: searchParams
      })
    }
  });
};
//点击更多按钮事件
const toQuery = (url: string) => {
  if (isOperate.value) { //出单员
    //暂存任务 （综合查询-投保单）、待修改任务 （综合查询-待修改单查询）
    if (url === '/query/application-querys') {
      let param = {
        CurrentUser: user.value.opCde,
        CurrentUserOrg: user.value.companyId,
        CAppStatus: '1',
        TIssueTmStart: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
        TIssueTmEnd: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
      };
      if (currentTabName.value == '待修改任务') {
        param = Object.assign({
          CurrentUser: user.value.opCde,
          CurrentUserOrg: user.value.companyId,
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
        CurrentUser: user.value.opCde,
        CurrentUserOrg: user.value.companyId,
        startBsTm1: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
        endBsTm1: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
      });
      sessionStorage.setItem('renewPolicy', JSON.stringify(param));
      router.push({ path: url });
    }
  } else if (isAudit.value) {
    if (url === '/pcis-new-udr-list/PendUdrList') { //核保员 （核保任务查询）
      let param = Object.assign({
        CurrentUser: user.value.opCde,
        CurrentUserOrg: user.value.companyId,
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
const toQuery2 = (data: any, tab: any) => {
  aaa = true
  console.log('toQuery2', data, tab)
  if (isOperate.value) { //出单员
    if (tab.name === '暂存任务') {
      const param = Object.assign({
        CurrentUser: user.value.opCde,
        CurrentUserOrg: user.value.companyId,
        CAppNo: data['cAppNo'],
        TIssueTmStart: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
        TIssueTmEnd: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
      });
      sessionStorage.setItem(AppKey.query.pcis_query_app, JSON.stringify(param));
      router.push({ path: '/query/application-querys' });
    } else if (tab.name === '待修改任务') {
      const param = Object.assign({
        CurrentUser: user.value.opCde,
        CurrentUserOrg: user.value.companyId,
        objId: data['cAppNo'],
        startBsTm1: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
        endBsTm1: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
      });
      sessionStorage.setItem(AppKey.query.pcis_query_returnudrlist, JSON.stringify(param));
      router.push({ path: '/query/application-querys' });
    } else if (tab.name === '待续保') {
      const param = Object.assign({
        CurrentUser: user.value.opCde,
        CurrentUserOrg: user.value.companyId,
        objId: data['cAppNo'],
        startBsTm1: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
        endBsTm1: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
      });
      sessionStorage.setItem('renewPolicy', JSON.stringify(param));
      router.push({ path: '/RenewalManagement/renewal-management' });
    }
  } else if (isAudit.value) { //核保员
    if (tab.name === '暂存任务') {
      const param = Object.assign({
        type: 'temp',
        CurrentUser: user.value.opCde,
        CurrentUserOrg: user.value.companyId,
        objId: data['cAppNo'],
        startCrtTm: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
        TAppTmEnd: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
        startBsTm1: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
        endBsTm1: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
      });
      sessionStorage.setItem(AppKey.query.pcis_query_newudrlist, param);
      router.push({ path: '/pcis-new-udr-list/PendUdrList' });
    } else if (tab.name === '修改单') {
      const param = Object.assign({
        type: 'edit',
        CurrentUser: user.value.opCde,
        CurrentUserOrg: user.value.companyId,
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
const initRoles = () => {
  tabs.value = [];
  getData(user.value, roles.value)
};


const getData = (user: any, roles: any = []) => {
  let roleCde = '';
  console.log(332, Array.isArray(roles), roles)
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

  console.log(338, tabs.value)
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
        console.log(res.data)
        pageresult.list = res.data.stagingList;
        pageresult.total = res.data.stagingList.length;
        console.log('666', tabs.value, isOperate.value, isAudit.value)
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
  console.log(41,pageresult)
  console.log(667, tab.props.label)
 


  currentTabName.value = tab.props.label
  let url = ''
  const clickedTabData = tabs.value.find(t => t.name === tab.props.label);
  console.log(clickedTabData)
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

onMounted(() => {

  initRoles();
  router.afterEach((to, from) => {
    if (to.path !== from.path) {
      initRoles();
    }
  });
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  position: relative;
  padding: 8px;

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .github-corner {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    border: 0;
  }

  .user-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .msg-container {
    height: 100%;

    .msg-title {
      display: flex;
      align-items: center;
      cursor: pointer;

      span {
        font-size: 14px;
        color: #fff;
        margin-left: -10px;
      }

      .el-badge {
        margin-left: 10px;
      }
    }

  }

  .user-name {
    font-size: 14px;
    margin-top: 5px;
    color: var(--el-text-color);
  }

  .data-box {
    display: flex;
    justify-content: space-between;
    padding: 20px;
    font-weight: bold;
    color: var(--el-text-color-regular);
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
    box-shadow: var(--el-box-shadow-dark);
  }

  .svg-icon {
    fill: currentcolor !important;
  }

  .shortcut {
    width: 100%;
    height: 157px;

    padding: 5px;
    border-radius: var(--el-card-border-radius);
    border: 1px solid var(--el-card-border-color);
    background-color: var(--el-card-bg-color);
    overflow: hidden;
    color: var(--el-text-color-primary);
    transition: var(--el-transition-duration);

    --el-card-border-color: var(--el-border-color-light);
    --el-card-border-radius: 4px;
    --el-card-padding: 20px;
    --el-card-bg-color: var(--el-fill-color-blank);

    box-shadow: var(--el-box-shadow-light);
  }

  .shortcut_top {
    padding-top: 5px;
    height: 50px;
    border-bottom: 1px solid var(--el-card-border-color);
    background-color: var(--el-card-bg-color);
  }

  .shortcut_search {
    padding: 10px 2px 2px 2px;
  }

  .shortcut_search_input {
    padding-left: 10px;
    padding-right: 10px;
    width: 100%;
    text-align: end;
  }

  .tag_ {
    cursor: pointer;
  }

  .edit_tag {
    padding-left: 15px;
    border-left: 1px solid var(--el-card-border-color);
    background-color: var(--el-card-bg-color);
  }

  .dialog_ {
    text-align: center;
    align-items: center;
    justify-content: center;
  }

  .dialog_text {
    text-align: center;
    align-items: center;
    justify-content: center;
  }

  .dialog_button {
    width: 100%;
    height: 45px;
    margin-top: 20px;
    border-top: 1px solid var(--el-card-border-color);
    padding-right: 21px;
    text-align: end;
  }

  .drawer-page {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .fast-menu {
    bottom: 7px;
    position: absolute;
    width: 100%;
  }

  :deep(.user-card) {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background: linear-gradient(to right, var(--el-color-primary), var(--menu-background));

    .el-card__body {
      padding-left: 0;
      padding-right: 0;

      .span_text__ {
        width: 93px;
        color: var(--el-text-color);
      }
    }
  }

  :deep(.card-container) {
    box-shadow: none;

    .el-card__header {
      padding: 0;
    }

    .header-card {
      height: 45px;
      align-items: center;
      padding-left: 10px;
      padding-right: 10px;
      display: flex;
    }

    .bg-color-ready {
      background-color: #C2EAA2 !important;

      &:hover {
        font-weight: bold;
      }
    }

    .bg-color-doing {
      background-color: #F49E60 !important;

      &:hover {
        font-weight: bold;
      }
    }

    .bg-color-complete {
      background-color: #FAE093 !important;

      &:hover {
        font-weight: bold;
      }
    }
  }

  .content-container {
    margin-top: -8px;
    height: 150px;
    overflow: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;

    :deep(.el-card__header) {
      padding: 0;
    }

    .item-title {
      cursor: pointer;
    }
  }

  .content-container::-webkit-scrollbar {
    display: none;
  }

  // #27d7a8 #9880e0 #e16e67

  .custom-items-content {
    &:hover {
      background-color: rgba(241, 241, 241, 0.51);
      color: var(--el-color-primary);
      font-weight: bold;
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

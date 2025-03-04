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
        <el-card shadow="never" class="index-blk" style="position: relative;">
          <el-tabs @tab-click="handleTabClick">
            <el-tab-pane v-for="tab in tabs" :key="tab.name" :label="tab.name">
              <app-table :key="currentTabName" :tableConfig="tableconfig" v-model:pageresult="tab.content"
                ref="tableRef" @row-click="(row) => toQuery2(row, tab)" />
            </el-tab-pane>
          </el-tabs>
          <div style="display: block; position: absolute; top: 30px; right: 20px;">
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
const isOperate = ref(false) //管理员
const isAudit = ref(true) // 审核员

const tableObj = {
  // 非核保员-非待续保
  notWaitObj: {
    fromSchema: [
      {
        prop: "cAppNo",
        inputtype: "table",
        title: "申请单号",
      },
      {
        prop: "cAppNo",
        inputtype: "table",
        title: "类型",
      },
      {
        prop: "cAppNme",
        inputtype: "table",
        title: "投保人",
      },
      {
        prop: "tAppTm",
        inputtype: "table",
        title: "投保日期",
      },
      {
        prop: "cAppNo",
        inputtype: "table",
        title: "保费",
      },
      {
        prop: "cAppNo",
        inputtype: "table",
        title: "操作员",
      },
      {
        prop: "cAppNo",
        inputtype: "table",
        title: "状态",
      },
    ],
  },
  //非核保员-待续保
  waitObj: {
    fromSchema: [
      {
        prop: "cAppNo",
        inputtype: "table",
        title: "保单号",
      },
      {
        prop: "cAppNo",
        inputtype: "table",
        title: "保费",
      },
      {
        prop: "cAppNme",
        inputtype: "table",
        title: "投保人",
      },
      {
        prop: "tAppTm",
        inputtype: "table",
        title: "投保人联系电话",
      },
      {
        prop: "cAppNo",
        inputtype: "table",
        title: "保险起期",
      },
      {
        prop: "cAppNo",
        inputtype: "table",
        title: "保险止期",
      },
      {
        prop: "cAppNo",
        inputtype: "table",
        title: "终保倒计时(天)",
      },
    ],
  },
  //核保员-暂存任务
  saveObj: {
    fromSchema: [
      {
        prop: "cAppNo",
        inputtype: "table",
        title: "出单机构",
      },
      {
        prop: "cAppNo",
        inputtype: "table",
        title: "投保人",
      },
      {
        prop: "cAppNo",
        inputtype: "table",
        title: "险种",
      },
      {
        prop: "cAppNme",
        inputtype: "table",
        title: "申请单号",
      }
    ],
  },
  //核保员-修改单
  editObj: {
    fromSchema: [
      {
        prop: "cAppNo",
        inputtype: "table",
        title: "出单机构",
      },
      {
        prop: "cAppNo",
        inputtype: "table",
        title: "申请单号",
      },
      {
        prop: "cAppNo",
        inputtype: "table",
        title: "险种",
      },
      {
        prop: "cAppNme",
        inputtype: "table",
        title: "状态",
      }
    ],
  }
}
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
    if (url === '/comprehensive-query/application-querys') { 
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
      if(currentTabName.value == '暂存任务') {
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
      router.push({ path: '/comprehensive-query/application-querys' });
    } else if (tab.name === '待修改任务') {
      const param = Object.assign({
        CurrentUser: user.value.opCde,
        CurrentUserOrg: user.value.companyId,
        objId: data['cAppNo'],
        startBsTm1: moment(new Date(Date.now())).subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
        endBsTm1: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
      });
      sessionStorage.setItem(AppKey.query.pcis_query_returnudrlist, JSON.stringify(param));
      router.push({ path: '/comprehensive-query/application-querys' });
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
    } else if(tab.name === '修改单') {
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
  roles.forEach((res: any) => {
    if (res === 'ROLE_00000196' || res === 'ROLE_00000324' || res === 'ROLE_00000001') {
      isOperate.value = true;
    }
    if (res === 'ROLE_00000152') {
      isAudit.value = true;
    }
    roleCde = roleCde === '' ? res : `${roleCde},${res}`;
  });
  const paramzc = {
    pageNo: 1,
    pageSize: 6,
    CAppStatus: '1',
    CurrentUser: user.opCde,
    CurrentUserOrg: user.companyId,
    TAppTmEnd: moment(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'),
    TAppTmStart: moment(new Date(Date.now())).subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss'),
  };
  const paramdh = {
    pageNo: 1,
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
    pageNo: 1,
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
    paramdh: paramdh,
    paramzc: paramzc,
  };
  tabs.value = [];
  // /policy/getPolicyShortList
  pcisQueryService.getPolicyShortList(param).then((res: any) => {
    if (res && res.code === 200) {
      const zcdata: any[] = [];
      const dxdata: any[] = [];
      const dhdata: any[] = [];
      // 管理员
      if (isOperate.value) {
        moreurl.value = "/comprehensive-query/application-querys"
        if (res.data.shortList) {
          res.data.shortList.forEach((data: any) => {
            if (zcdata.length === 6) {
              return;
            }
            if (zcdata.length < 6) {
              zcdata.push(data);
            }
          });
        }
        tabs.value.push({
          name: '暂存任务',
          content: zcdata,
          url: '/comprehensive-query/application-querys',
        });
        if (res.data.returnUdr) {
          res.data.returnUdr.forEach((data: any) => {
            if (dxdata.length === 6) {
              return;
            }
            if (dxdata.length < 6) {
              const newdxdata = {
                cAppNo: data.objId,
                cAppNme: data.appCde,
                tAppTm: data.crtTm,
              };
              dxdata.push(newdxdata);
            }
          });
        }
        tabs.value.push({
          name: '待修改任务',
          content: dxdata,
          url: '/comprehensive-query/application-querys',
        });
        tabs.value.push({
          name: '待续保',
          content: dxdata,
          url: '/RenewalManagement/renewal-management',
        });
      }
      //审核员
      if (isAudit.value) {
        moreurl.value = "/pcis-new-udr-list/PendUdrList"
        if (res.data.newUdrMap) {
          res.data.newUdrMap.forEach((data: any) => {
            if (dhdata.length === 6) {
              return;
            }
            if (dhdata.length < 6) {
              const newdhdata = {
                cAppNo: data.objId,
                cAppNme: data.appCde,
                tAppTm: data.crtTm,
              };
              dhdata.push(newdhdata);
            }
          });
        }
        tabs.value.push({
          name: '暂存任务',
          content: dhdata,
          url: '/pcis-new-udr-list/PendUdrList',
        });
        tabs.value.push({
          name: '修改单',
          content: dhdata,
          url: '/pcis-new-udr-list/PendUdrList',
        });
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
  if (isOperate.value) {
    if (currentTabName.value == '待续保') {
      tableconfig = reactive<AppTableConfig>(
        createTableEditConfig(tableObj.waitObj)
      )
    } else {
      tableconfig = reactive<AppTableConfig>(
        createTableEditConfig(tableObj.notWaitObj)
      )
    }
  }
  if (isAudit.value) {
    if (currentTabName.value == '暂存任务') {
      tableconfig = reactive<AppTableConfig>(
        createTableEditConfig(tableObj.saveObj)
      )
    } else {
      tableconfig = reactive<AppTableConfig>(
        createTableEditConfig(tableObj.editObj)
      )
    }
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
  height: 350px;
}

.sty {
  color: #f57c10;
}

.sty:hover {
  color: #f57c10;
}
</style>

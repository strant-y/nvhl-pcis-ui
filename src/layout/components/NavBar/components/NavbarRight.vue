<template>
  <div class="flex">
    <template v-if="device !== 'mobile'">
      <!--全屏 -->
      <!-- <div class="setting-word" @click="downWord">
        <el-icon>
          <Memo />
        </el-icon>
        操作手册
      </div> -->


      <div class="setting-item" @click="toggle">
        <svg-icon :icon-class="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" />
      </div>

      <!-- 消息 -->
      <div ref="buttonRef" class="setting-word"  
        style="position: relative;display: inline-block;">
        <el-icon style="font-size: 20px; ">
          <bell />
        </el-icon>
        <div class="badge" v-if="total > 0">{{ total }}</div>
      </div>



      <el-popover ref="popoverRef" :virtual-ref="buttonRef" trigger="click" virtual-triggering :width="350">

        <div class="tab-box">
          <div v-for="(tab, index) in tabs" :key="index" class="tab-btn" :class="{ active: currentTab === tab }"
            @click="switchTab(tab)">
            {{ tab }}
          </div>
        </div>
        <div style="border-bottom: 1px solid #cccccc;"></div>


        <div style="max-height: 500px; overflow: auto;" v-if="currentTab == '消息'" class="mes-box">
          <ul v-if="mesList.length > 0">
            <li v-for="item in mesList" :key="item">
              <div style="  padding: 0 5px;">
                <img src="@/assets/icons/letter.svg" width="30px" alt="My Icon"
                  style="padding: 5px; border-radius: 50%; background: #f8fdb4; display: flex; align-items: center; justify-content: center;" />
              </div>
              <div>
                <div style="font-weight: 600; cursor: pointer;" @click="JumpClick(item)">【{{ item.title }}】</div>
                <div style="font-size: 12px; padding-top: 5px;">{{ item.description }}

                  <span v-if="item.dataId">【申请单号：{{ item.dataId }}】</span>
                  <span v-if="item.cEdrNo">【批单号：{{ item.cEdrNo }}】</span>
                  <span v-if="item.cplyNo">【保单号：{{ item.cplyNo }}】</span>


                </div>
                <div
                  style="font-size: 12px; display: flex; align-items: center; justify-content: space-between; padding-top: 5px;">
                  <span v-if="item.operId">提交人：{{ item.operId }}</span>
                  <span>{{ item.datetime }}</span>
                </div>

              </div>

            </li>
            <li v-if="hasMoreItems" @click="loadMore" class="more">查看更多</li>
          </ul>

          <div v-else-if="mesList.length == 0" class="no-data">
            暂无消息~

          </div>

        </div>

        <div v-else-if="currentTab == '公告'" class="mes-box">

          <div class="no-data">
            暂无公告~

          </div>
        </div>

      </el-popover>


      <!-- 
  <el-popover
    placement="top-start"
    title="Title"
    :width="200"
    trigger="hover"
    content="this is content, this is content, this is content"
  >
    <template #reference>
      <el-button class="m-2">Hover to activate</el-button>
    </template>
</el-popover> -->


      <!-- 布局大小 -->
      <!-- <el-tooltip content="布局大小" effect="dark" placement="bottom">
        <size-select class="setting-item" />
      </el-tooltip> -->

      <!-- 语言选择 -->
      <!-- <lang-select class="setting-item" /> -->
    </template>

    <!-- 用户头像 -->
    <el-dropdown class="setting-item" trigger="click">
      <div class="flex-center h100% p10px">
        <img v-if="userStore.user.cCssStyle === '0'" class="rounded-full mr-10px w24px w24px"
          src="/src/assets/images/0_.png" />
        <img v-else-if="userStore.user.cCssStyle === '1'" class="rounded-full mr-10px w24px w24px"
          src="/src/assets/images/1_.png" />
        <el-icon v-else><User /></el-icon>
        <span style="margin-left: 0.3rem;">{{ userStore.user.opCnm }}</span>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="openShortcutEdit"> <el-icon><Menu /></el-icon>
            <span>快捷菜单</span></el-dropdown-item>
          <el-dropdown-item @click="openDialog" v-if="userStore.user.src == null"> <el-icon><Lock /></el-icon>
            <span>修改密码</span></el-dropdown-item>
          <el-dropdown-item @click="clearRedisCache" v-if="showRedisCache">清除redis缓存</el-dropdown-item>
          <el-dropdown-item @click="logout"> <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span></el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <template v-if="showChangeDpt">
      <el-select class="v1-select-input" v-model="selectDpt" placeholder="当前机构" @change="changeDpt">
        <el-option v-for="item in dptList" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </template>

    <!-- 设置 -->
    <template v-if="defaultSettings.showSettings">
      <div class="setting-item" @click="settingStore.settingsVisible = true">
        <svg-icon icon-class="setting" />
      </div>
    </template>
  </div>
  <el-dialog v-model="dialog.visible" :title="dialog.title" :width="dialog.width" :close-on-click-modal="false"
    @close="closeDialog">
    <el-form ref="formRef" :model="formData">
      <el-row justify="space-around">
        <el-col :span="18">
          <el-form-item>
            <el-input v-model="formData.oldPassword" placeholder="原密码" type="password" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row justify="space-around">
        <el-col :span="18">
          <el-form-item>
            <el-input v-model="formData.password" placeholder="新密码" type="password" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row justify="space-around">
        <el-col :span="18">
          <el-form-item>
            <el-input v-model="formData.confirmPassword" placeholder="确认密码" type="password" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="dialogSubmit">确 定</el-button>
        <el-button @click="closeDialog">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { unref } from "vue";
import {
  useAppStore,
  useTagsViewStore,
  useUserStore,
  useSettingsStore,
} from "@/store";
import { redisCache } from "@/api/dict";
import defaultSettings from "@/settings";
import { updateUserPassword, changeDptToken } from "@/api/user";
import { download } from "@/utils/request";
import { LocalBaseApi } from "@/api/config";
import { PcisQueryService } from '@/views/dashboard/service/v1.service';
// import { PcisQueryService } from "@/views/payinfoManagement/service/pcis-query-service";

import { useRouter, useRoute } from "vue-router";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const shortMenuDialog = defineAsyncComponent(
  () => import("@/views/dashboard/components/shortMenuDialog.vue")
);
import { getShortcutDataList, updateShortRoute } from "@/api/menu";



const pcisQueryService = new PcisQueryService();

const appStore = useAppStore();
const tagsViewStore = useTagsViewStore();
const userStore = useUserStore();
const settingStore = useSettingsStore();
const { isFullscreen, toggle } = useFullscreen();
const route = useRoute();
const router = useRouter();
const showRedisCache = ref(false);
const selectDpt = ref('');
const dptList = ref([]);
const showChangeDpt = ref(true);
const user = JSON.parse(sessionStorage.getItem("user"));
// 设备类型：desktop-宽屏设备 || mobile-窄屏设备
const device = computed(() => appStore.device);
const tabs = ['消息', '公告'];
const currentTab = ref(tabs[0]);
const buttonRef = ref()
const popoverRef = ref()



const mesList = ref([])
// const mesList = ref(arr.value.slice(0, 3))
const currentIndex = ref(3); // 当前索引，用于加载更多
let total = ref(0);  // 总条数
// ref(allItems.value.slice(0, 3));
const hasMoreItems = computed(() => total.value > mesList.value.length);

const loadMore = () => {
  // const nextItems = arr.value.slice(currentIndex.value, currentIndex.value + 999); // 每次加载10条数据
  // mesList.value.push(...nextItems);
  currentIndex.value = total.value;


  loadData()
};

onMounted(() => {
  selectDpt.value = user.companyId;
  dptList.value = user.opOrgs;
  const rus = userStore.user.roles?.find(r => r === 'ROLE_00000007')
  if (rus) {
    showRedisCache.value = true;
  }
  if (userStore.user.src === 'other') {     // 外部登录账户,不可切换机构
    showChangeDpt.value = false;
  }
  loadData()
  getShortMenuList()
});


// 初始化 消息数据内容
const loadData = () => {
  let param = {
    CReceiver: user.opCde,
    // roles: user.roles,
    CState: '0',
    CType: '0',
    limit: currentIndex.value
  }
  pcisQueryService.getNotifyByReceiver(param).then((res: any) => {
    if (res && res.code === 200) {
      mesList.value = res.data.result;
      total.value = res.data.total;

    }


  })

}

const showPopover = () => {
  unref(popoverRef).popperRef?.delayHide?.()
  // visible2.value = !visible2.value; // 切换弹出框显示
};

// 点击跳转查询
const JumpClick = (row: any) => {
  // router.push({
  //   // path: '/index/new-udr-list/newudrlist',
  //   name: `application-querys`,
  //   query: {
  //     appNo: row.dataId
  //   }
  // });


  // router.push({
  //    path: '/pcis-new-udr-list/PendUdrList',
  //    query: {
  //       uniqueNo: row.dataId
  //     }
  //  });

  // if ('提醒' === row.title) { 

  if (!!row.extra) {
    switch (row.extra) {
      case 'P2': {
        if ('申请核保' === row.title) {
          router.push({
            path: '/index/new-udr-list/newudrlist',
            // name: `application-querys`,
            query: {
              appNo: row.dataId
            }
          });
          // this.router.navigate(['/index/new-udr-list/newudrlist'], {queryParams: {appNo: item.dataId}});

        }
        break;
      }
      case 'P4': {
        router.push({
          path: '/pcis-new-udr-list/PendUdrList',
          query: {
            uniqueNo: row.dataId
          }
        });
        // if ('支票缴费提核' === item.title) {
        // router.push({
        //   path:'/index/new-udr-list/newudrlist',
        //   // name: `application-querys`,
        //   query: {
        //     appNo: row.dataId
        //   }
        // });
        // this.router.navigate(['/index/payinfo/getpayinfoauditlist'], {queryParams: {uniqueNo: item.dataId}});
        // }
        break;
      }
      case 'P5': {
        // if ('生成保单' === item.title) {
        //     const plyNo = item.description.match(/\d+/)[0];
        //     this.router.navigate(['/index/pcis-query/app'], {queryParams: {plyNo: plyNo}});
        // }
        break;
      }
    }
    if ('todo' === row.status) {
      const param = { CPkId: row.dataId, CState: row.extra };
      change(param);
    }
  }
  // }



  // router.push({ path: 'comprehensive' });
  // router.push({
  //                       // path: '/pcis/my-page',
  //                       path: '/pcis/my-page',
  //                           query: {
  //                              dataid:id
  //                           },
  //                       });
}

// 修改消息状态
const change = (param: any) => {
  pcisQueryService.changeStatus(param).then((res: any) => {
  // const notifyData = this.notifyService.changeStatus(param);
  // notifyData.subscribe((res: any) => {
      // this.loading = false;
      
      if (null != res && null != res['code']) {
          if (res['code'] === 200) {
              if (!!res.data) {
                  // this.loadData();
                  // this.msg.success(`状态变更成功`, { nzDuration: 3000 });
              }
          }
      }
  });
}

const changeDpt = () => {
  const label = user.opOrgs?.find((r: any) => r.value === selectDpt.value);
  user.companyCnm = label.label;
  user.companyId = selectDpt.value;
  changeDptToken(user).then(res => {
    const { tokenType, token, user } = res;
    sessionStorage.setItem("user", JSON.stringify(user));
    sessionStorage.setItem("token", tokenType + token);
    sessionStorage.setItem("opOrg", user.companyId);
    router.push({ path: "/" }).then(() => {
      window.location.reload();
    });
  })
}

const downWord = () => {
  let url = `/down/handBook`;
  download(url, {}, '安责险事故预防平台操作手册.docx');
}
const formData = reactive({
  userId: userStore.user.opCde,
  oldPassword: undefined,
  password: undefined,
  confirmPassword: undefined,
});
// 弹窗对象
const dialog = reactive({
  visible: false,
  type: "add",
  width: 400,
  title: "修改密码",
});

/** 打开弹窗 */
function openDialog() {
  dialog.visible = true;
}

/** 关闭表单弹窗 */
function closeDialog() {
  dialog.visible = false;
}

/**
 * 弹框提交 确认
 * */
function dialogSubmit() {
  if (!!formData.confirmPassword && !!formData.password) {
    if (formData.confirmPassword === formData.password) {
      updateUserPassword(formData).then((res) => {
        if (res.code == 200) {
          ElMessage.success(res.msg);
          closeDialog();
        } else {
          ElMessage.error(res.msg);
        }

      });
    } else {
      ElMessage.warning("两次输入密码不一致");
    }
  }
}
function clearRedisCache() {
  redisCache().then((res) => {
    if (res.code == 200) {
      ElMessage.success(res.msg);
    } else {
      ElMessage.error(res.msg);
    }
  })
}
/**
 * 注销
 */
function logout() {
  ElMessageBox.confirm("确定注销并退出系统吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    lockScroll: false,
  }).then(() => {
    const href = window.location.href;
    const code = href.slice(href.indexOf("?") + 1, href.indexOf("&")).split("=");
    if(code && code.length > 0 && code[0] === "code" && code[1]) {
      window.location.replace("http://sso.iam-test.yaic.com.cn/oidc/session/end")
    } else {
      userStore
        .logout()
        .then(() => {
          tagsViewStore.delAllViews();
        })
        .then(() => {
          router.push(`/login?redirect=${route.fullPath}`);
        });
    }
  });
}

// tab切换
const switchTab = (tab) => {
  currentTab.value = tab; // 切换当前选中的 Tab
};

const shortcutDataList = ref([])
function getShortMenuList() {
  getShortcutDataList().then((res: any) => {
    if (res.code == 200) {
      shortcutDataList.value = res.data.filter((item:any) => item.cOpAct !== "Layout");
    }
  });
}
const emits = defineEmits(["shortMenu"])

// 编辑快捷菜单
function openShortcutEdit() {
  dzmodal
    .open(shortMenuDialog, { type: "", data: shortcutDataList.value })
    .then((res: any) => {
      if (res.type === "ok") {
        emits("shortMenu")
      }
    });
}
</script>
<style lang="scss" scoped>
.setting-item {
  display: inline-block;
  min-width: 40px;
  height: $navbar-height;
  line-height: $navbar-height;
  color: var(--el-text-color);
  text-align: center;
  cursor: pointer;

  &:hover {
    background: rgb(0 0 0 / 10%);
  }
}

.setting-word {
  display: inline-block;
  min-width: 40px;
  margin-right: 10px;
  height: $navbar-height;
  line-height: $navbar-height;
  color: var(--el-text-color);
  text-align: center;
  cursor: pointer;
  font-size: 14px;

  :deep(.el-icon) {
    font-size: 14px;
    display: inline-block !important;
  }

  &:hover {
    background: rgb(0 0 0 / 10%);
  }
}

.layout-top,
.layout-mix {

  .setting-item,
  .el-icon {
    color: var(--el-text-color);
  }
}

.dark .setting-item:hover {
  background: rgb(255 255 255 / 20%);
}

:deep(.v1-select-input) {
  width: 150px;
  margin: auto;

  .el-select__wrapper {
    text-align: end;
    background-color: transparent;
    box-shadow: none;
  }

  .el-select__placeholder,.el-select__caret {
    color: #333333;
  }
}


.badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: red;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.tab-box {
  display: flex;
  justify-self: center;
  font-size: 12px;

  .tab-btn {
    margin: 0 10px;
    padding: 2px 5px 4px;
    border-bottom: 2px solid transparent;
    transition: color 0.3s, border-color 0.3s;
    cursor: pointer;
  }

  .active {
    border-bottom: 2px solid red;
    color: chocolate;
  }
}


// 消息弹框
.mes-box {
  min-height: 200px;

  li {
    display: flex;
    border-bottom: solid 1px #ccc;
    padding: 10px 3px;

  }


  .more {
    cursor: pointer;
    height: 30px;
    width: 100%;
    border-bottom: none;
    display: flex;
    justify-content: center;
  }

  .mes-centre {
    min-height: 300px;
  }

  .no-data {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 90px;
  }
}
</style>

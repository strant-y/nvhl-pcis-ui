<template>
  <div class="flex">
    <template v-if="device !== 'mobile'">
      <!--全屏 -->
      <div class="setting-word" @click="downWord">
        <el-icon><Memo /></el-icon>
        操作手册
      </div>
      <div class="setting-item" @click="toggle">
        <svg-icon
          :icon-class="isFullscreen ? 'fullscreen-exit' : 'fullscreen'"
        />
      </div>

      <!-- 布局大小 -->
      <!-- <el-tooltip content="布局大小" effect="dark" placement="bottom">
        <size-select class="setting-item" />
      </el-tooltip> -->

      <!-- 语言选择 -->
      <!-- <lang-select class="setting-item" /> -->
    </template>

    <!-- 用户头像 -->
    <el-dropdown class="setting-item" trigger="click" >
      <div class="flex-center h100% p10px">
        <img v-if="userStore.user.cCssStyle === '0'"
          class="rounded-full mr-10px w24px w24px"
          src="/src/assets/images/0_.png"
        />
        <img v-else-if="userStore.user.cCssStyle === '1'"
          class="rounded-full mr-10px w24px w24px"
          src="/src/assets/images/1_.png"
        />
        <span>{{ userStore.user.opCnm }}</span>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="openDialog" v-if="userStore.user.src == null">修改密码</el-dropdown-item>
          <el-dropdown-item @click="clearRedisCache" v-if="showRedisCache" >清除redis缓存</el-dropdown-item>
          <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <template  v-if="showChangeDpt" >
      <el-select class="v1-select-input"  v-model="selectDpt" placeholder="当前机构"
       @change="changeDpt">
        <el-option
          v-for="item in dptList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </template>

    <!-- 设置 -->
    <template v-if="defaultSettings.showSettings">
      <div class="setting-item" @click="settingStore.settingsVisible = true">
        <svg-icon icon-class="setting" />
      </div>
    </template>
  </div>
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    :width="dialog.width"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <el-form  ref="formRef" :model="formData">
      <el-row justify="space-around" >
        <el-col :span="18">
          <el-form-item>
            <el-input
              v-model="formData.oldPassword"
              placeholder="原密码"
              type="password"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row justify="space-around" >
        <el-col :span="18">
          <el-form-item>
            <el-input
              v-model="formData.password"
              placeholder="新密码"
              type="password"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row justify="space-around" >
        <el-col :span="18">
          <el-form-item>
            <el-input
              v-model="formData.confirmPassword"
              placeholder="确认密码"
              type="password"
            />
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
import {
  useAppStore,
  useTagsViewStore,
  useUserStore,
  useSettingsStore,
} from "@/store";
import { redisCache } from "@/api/dict";
import defaultSettings from "@/settings";
import {updateUserPassword , changeDptToken } from "@/api/user";
import { download } from "@/utils/request";
import { LocalBaseApi } from "@/api/config";
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
onMounted(()=>{
  selectDpt.value = user.companyId;
  dptList.value = user.opOrgs;
  const rus = userStore.user.roles?.find( r => r==='ROLE_00000007')
  if(rus){
    showRedisCache.value = true;
  }
  if(userStore.user.src === 'other'){     // 外部登录账户,不可切换机构
    showChangeDpt.value = false;
  }
});
const changeDpt = ()=>{
  const label = user.opOrgs?.find( (r : any) => r.value === selectDpt.value);
  user.companyCnm = label.label;
  user.companyId = selectDpt.value;
  changeDptToken(user).then(res => {
    const {tokenType, token, user} = res;
    sessionStorage.setItem("user",JSON.stringify(user));
    sessionStorage.setItem("token", tokenType + token);
    sessionStorage.setItem("opOrg", user.companyId);
    router.push({ path: "/" }).then(()=>{
      window.location.reload();
    });
  })
}

const downWord = () => {
  let url = `/down/handBook`;
  download(url,{},'安责险事故预防平台操作手册.docx');
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
  console.log(formData)
  if (!!formData.confirmPassword && !!formData.password) {
    if(formData.confirmPassword === formData.password){
      updateUserPassword(formData).then((res) => {
      if (res.code == 200){
        ElMessage.success(res.msg);
        closeDialog();
      }else{
        ElMessage.error(res.msg);
      }

    });
    }else{
      ElMessage.warning("两次输入密码不一致");
    }
  }
}
function clearRedisCache(){
  redisCache().then((res)=>{
    if (res.code == 200){
        ElMessage.success(res.msg);
      }else{
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
    userStore
      .logout()
      .then(() => {
        tagsViewStore.delAllViews();
      })
      .then(() => {
        router.push(`/login?redirect=${route.fullPath}`);
      });
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
  :deep(.el-icon){
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
  margin-top: 10px;
  .el-select__wrapper {
    text-align: end;
    background-color: transparent;
    box-shadow: none;
  }
}

</style>

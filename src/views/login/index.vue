<template>
  <div class="login-container">
    <el-row class="login-container-img">
      <div class="login-left">
      <!-- Logo -->
      <div class="logo">
        <!-- <img src="../../assets/images/logo.png" alt="logo" /> -->
      </div>
      <!-- 系统名称 -->
      <div class="system-name">
        <div class="name-cn">
          <span class="text-class">软通财产保险承保系统</span>
        </div>
        <div class="name-en">
          <span class="text-en">IsoftStone Property Insurance Underwriting System</span>
        </div>
      </div>
    </div>
      <div class="login-container-form" >
        <el-card class="login-card">
            <h2>账号登录</h2>
        <el-form
          v-if="inside"
          ref="loginFormRef"
          :model="loginData"
          :rules="loginRules"
          class="login-form"
          label-position="top"
        >
          <!-- 用户名 -->
          <el-form-item prop="username">
            <div class="flex-y-center w-full">
              <span class="icon-box">
                <svg-icon icon-class="user" class="mx-2" />
              </span>
              <el-input
                ref="username"
                v-model="loginData.username"
                :placeholder="$t('login.username')"
                name="username"
                size="large"
                :disabled="verifyFlag"
                @keyup.enter="handleLogin"
              />
            </div>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item prop="password">
            <div class="flex-y-center w-full">
              <span class="icon-box">
                <el-icon class="mx-2"><Lock /></el-icon>
              </span>
              <el-input
                v-model="loginData.password"
                :placeholder="$t('login.password')"
                type="password"
                name="password"
                @keyup.enter="handleLogin"
                size="large"
                show-password
                :disabled="verifyFlag"
              />
            </div>
          </el-form-item>
          <!-- 验证码 -->
          <el-form-item v-if="verifyFlag" prop="captchaCode">
            <div class="flex-y-center w-full">
              <span class="icon-box captcha-icon-box">
                <svg-icon icon-class="captcha" class="mx-2" />
              </span>
              <el-input
                v-model="loginData.captchaCode"
                auto-complete="off"
                size="large"
                class="flex-1"
                :placeholder="$t('login.captCode')"
                @keyup.enter="verifyCode"
              />
              <!-- 验证码-->
              <span style="width: 72px;text-align: right;">
                <el-button
                  v-if="verifyTime === 0"
                  class="mr-1 w-72px"
                  :loading="loading"
                  type="primary"
                  size="small"
                  plain
                  @click="getCaptcha"
                  >获取验证码</el-button
                >
                <el-tag v-else disabled class="mr-1 " type="primary"
                  >{{ verifyTime }}秒</el-tag
                >
              </span>
            </div>
          </el-form-item>
          <!-- <el-checkbox> 30天内免登录</el-checkbox> -->
          <!-- 登录按钮 -->
          <el-button
            v-if="!verifyFlag"
            :loading="loading"
            type="primary"
            size="large"
            class="w-full"
            @click.prevent="handleLogin"
            >{{ $t("login.login") }}
          </el-button>
          <!-- 验证码 提交按钮 -->
          <el-button
            v-if="verifyFlag"
            :loading="loading"
            type="primary"
            size="large"
            class="w-full"
            @click.prevent="verifyCode"
            >{{ $t("login.submit") }}
          </el-button>
        </el-form>
        <!-- <el-tab-pane label="第三方登录" name="threePartyLogin"> -->
        <el-form
          v-else
          ref="thirdPartyRef"
          :model="thirdPartyData"
          :rules="thirdPartyRules"
          class="login-form"
          label-position="top"
        >
          <!-- 手机号 -->
          <el-form-item prop="mobile">
            <div class="flex-y-center w-full">
              <span class="icon-box">
                <el-icon class="mx-2"><Iphone /></el-icon>
              </span>
              <el-input
                v-model="thirdPartyData.mobile"
                :placeholder="$t('login.mobile')"
                name="mobile"
                size="large"
                class="h-[48px] w-[79%]"
                :disabled="verifyFlag"
                @keyup.enter="thirdPartyLogin"
              />
            </div>
          </el-form-item>
          <!-- 图形验证码-->
          <el-form-item prop="imageCaptchaCode" v-if="!verifyFlag">
            <div class="flex-y-center w-full justify-between">
              <span class="icon-box">
                <el-icon class="mx-2"><Lock /></el-icon>
              </span>
              <el-input
                v-model="thirdPartyData.imageCaptchaCode"
                :placeholder="$t('login.imageCaptchaCode')"
                name="imageCaptcha"
                auto-complete="off"
                size="large"
                class="flex-1 mr-1"
                @keyup.enter="thirdPartyLogin"
              />
              <imagCaptcha
                class="mr-1"
                ref="imagCaptchaRef"
                :width="100"
                title="点击刷新"
              />
            </div>
          </el-form-item>
          <!-- 验证码 -->
          <el-form-item v-if="verifyFlag" prop="captchaCode">
            <div class="flex-y-center w-full">
              <span class="icon-box">
                <svg-icon icon-class="captcha" class="mx-2" />
              </span>
              <el-input
                v-model="thirdPartyData.captchaCode"
                auto-complete="off"
                size="large"
                class="flex-1"
                :placeholder="$t('login.captchaCode')"
                @keyup.enter="verifyCode"
              />
              <!---->
              <!-- 验证码-->
              <el-button
                v-if="verifyTime === 0"
                class="mr-1 w-72px"
                :loading="loading"
                type="primary"
                size="small"
                plain
                @click="getCaptcha"
                >获取验证码</el-button
              >
              <el-tag v-else disabled class="mr-1" type="primary"
                >{{ verifyTime }}秒</el-tag
              >
            </div>
          </el-form-item>
          <!-- 登录按钮 -->
          <el-button
            v-if="!verifyFlag"
            :loading="loading"
            type="primary"
            size="large"
            class="w-full"
            @click.prevent="thirdPartyLogin"
            >{{ $t("login.login") }}
          </el-button>
          <!-- 验证码 提交按钮 -->
          <el-button
            v-if="verifyFlag"
            :loading="loading"
            type="primary"
            size="large"
            class="w-full"
            @click.prevent="verifyCode"
            >{{ $t("login.submit") }}
          </el-button>
          
        </el-form>
        <!-- <el-checkbox v-model="agreeTerms">已阅读并同意《用户服务协议》和《隐私政策》</el-checkbox> -->
      </el-card>
    </div>
  </el-row>
    <!-- <el-button type="primary" @click="test" >测试</el-button> -->
    <!-- ICP备案 -->
    <!-- <div class="absolute bottom-1 text-[10px] text-center" v-show="icpVisible">
      <p>2005-2024 版权所有 软通动力信息技术（集团）股份有限公司 版权所有</p>
    </div> -->
    <CopyRight style="position: absolute;border: none;background: transparent;bottom: 0;" />
    <third-party-dialog
      v-if="dialogShow"
      v-model:dialogShow="dialogShow"
      :username="thirdPartyData.mobile"
    />
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore, useUserStore, useAppStore } from "@/store";
import { getCaptchaApi } from "@/api/auth";
import { LoginData } from "@/api/auth/types";
import { Sunny, Moon } from "@element-plus/icons-vue";
import { LocationQuery, LocationQueryValue, useRoute } from "vue-router";
import router from "@/router";
import defaultSettings from "@/settings";
import { ThemeEnum } from "@/enums/ThemeEnum";
import thirdPartyDialog from "./components/thirdPartyDialog.vue";
import imagCaptcha from "./components/ImagCaptcha.vue";

const inside = ref(true);
const tabList = ref([
  { id: 1, name: "内部登录" },
  { id: 2, name: "第三方登录" },
]);
const curIndex = ref(0);
const dialogShow = ref(false);
const thirdPartyRef = ref(null);
const imagCaptchaRef = ref(null);
// Stores
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const appStore = useAppStore();

// Internationalization
const { t } = useI18n();

// Reactive states
const isDark = ref(settingsStore.theme === ThemeEnum.DARK);
const icpVisible = ref(true);
const loading = ref(false); // 按钮loading
const isCapslock = ref(false); // 是否大写锁定
const captchaBase64 = ref(); // 验证码图片Base64字符串
const loginFormRef = ref(ElForm); // 登录表单ref
const { height } = useWindowSize();

const loginData = ref<LoginData>({
  username: "",
  password: "",
});
const thirdPartyData = ref({
  mobile: "",
});
const prefix = appStore.language === "en" ? "Please enter " : "请输入";
const thirdPartyRules = reactive({
  mobile: [
    {
      required: true,
      trigger: "blur",
      message: `${prefix}${t("login.mobile")}`,
    },
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
  imageCaptchaCode: [
    {
      required: true,
      message: `${prefix}${t("login.imageCaptchaCode")}`,
      trigger: "change",
    },
  ],
  captchaCode: [
    {
      required: true,
      trigger: "blur",
      validator: (rule: any, value: any, callback: any) => {
        if (!value) {
          rule.message = "请输入短信验证码";
          callback(new Error("短信验证码不能为空！"));
        } else {
          callback();
        }
      },
      message: `${prefix}${t("login.captchaCode")}`,
    },
  ],
});
const loginRules = computed(() => {
  return {
    username: [
      {
        required: true,
        trigger: "change",
        message: `${prefix}${t("login.username")}`,
      },
    ],
    password: [
      {
        required: true,
        trigger: "change",
        validator: (rule: any, value: any, callback: any) => {
          if (value.length < 3) {
            callback(new Error("The password can not be less than 6 digits"));
          } else {
            callback();
          }
        },
        message: `${prefix}${t("login.password")}`,
      },
    ],
    captchaCode: [
      {
        required: true,
        trigger: "blur",
        validator: (rule: any, value: any, callback: any) => {
          if (!value) {
            rule.message = "请输入验证码";
            callback(new Error("验证码不能为空！"));
          } else {
            callback();
          }
        },
        message: `${prefix}${t("login.captchaCode")}`,
      },
    ],
  };
});
const tabHandle = (index) => {
  curIndex.value = index;
  inside.value = index === 1 ? false : true;
  verifyFlag.value = false;
  thirdPartyData.value.imageCaptchaCode = undefined;
  getCaptchaParam.value = { inside: inside.value };
};
const changeInside = (e) => {
  verifyFlag.value = false;
};
/**
 * 获取验证码
 */
const getCaptchaParam = ref({});
function getCaptcha(param) {
  thirdPartyData.value.captchaCode = "";
  Object.assign(getCaptchaParam.value, param);
  getCaptchaParam.value.inside = inside.value;
  // 获取验证码
  getCaptchaApi(getCaptchaParam.value)
    .then((res) => {
      const { code, msg, data } = res;
      if (200 === code) {
        if (!inside.value) {
          verifyData.value.serial = data.serial;
        }
        // 设置倒计时值为60秒
        verifyTime.value = 60;
        verifyCountZero();
        ElMessage.success(msg);
      } else {
        verifyTime.value = 0;
        ElMessage.error(msg);
      }
    })
    .catch((err) => console.log(err))
    .finally(() => (loading.value = false));
}

/**
 * 登录
 */
const verifyFlag = ref(false);
const verifyData = ref({
  phoneNO: null,
  serial: null,
});
function handleLogin() {
  loginFormRef.value.validate((valid: boolean) => {
    if (valid) {
      loading.value = true;
      userStore
        .login(loginData.value)
        .then((res) => {
          const { msg, code, phoneNO, serial } = res;
          verifyData.value.serial = serial;
          verifyData.value.phoneNO = phoneNO;
          if (200 === code) {
            verifyFlag.value = true;
            // 获取验证码
            getCaptcha({ serial: serial });
          } else {
            ElMessage.error(msg || "系统出错");
          }
        })
        .catch(() => {})
        .finally(() => {
          loading.value = false;
        });
    }
  });
}
const thirdPartyLogin = () => {
  if (!thirdPartyData.value.imageCaptchaCode) {
    ElMessage.warning("请输入图片中的验证码！");
  }
  thirdPartyRef.value.validate((valid: boolean) => {
    if (valid) {
      // 图形验证码验证
      const flag = imagCaptchaRef.value.validate(
        thirdPartyData.value.imageCaptchaCode
      );
      if (flag) {
        loading.value = true;
        verifyFlag.value = true;
        getCaptcha(thirdPartyData.value);
      } else {
        thirdPartyData.value.imageCaptchaCode = undefined;
        ElMessage.error("验证码有误，请重新输入！");
        setTimeout(() => {
          thirdPartyRef.value.clearValidate(["imageCaptchaCode"]);
        }, 100);
      }
    }
  });
};
/**
 * 验证码校验
 * */
function verifyCode() {
  let params = {
    code: "",
    serial: verifyData.value.serial,
  };
  // 内部
  if (inside.value) {
    params.code = loginData.value.captchaCode;
    // 验证码
    loginFormRef.value.validate((valid: boolean) => {
      if (valid) {
        userStore.verifyCode(params);
      }
    });
  } else {
    params.code = thirdPartyData.value.captchaCode;
    thirdPartyRef.value.validate((valid: boolean) => {
      if (valid) {
        userStore.verifyCode(params).then((res) => {
          if (res.data && res.data.biudUser && res.data.biudUser === "0") {
            ElMessageBox.confirm("该用户未绑定，请先完成绑定再继续", "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }).then(() => {
              dialogShow.value = true;
            });
          }
        });
      }
    });
  }
}

/**
 * 验证码倒计时
 **/
const verifyTime = ref<number>(0);
function verifyCountZero() {
  const timer = setInterval(() => {
    if (0 < verifyTime.value) {
      verifyTime.value--;
    } else {
      clearInterval(timer); // 倒计时结束，清除定时器
    }
  }, 1000); // 每秒执行一次倒计时逻辑
}

/**
 * 主题切换
 */

const toggleTheme = () => {
  const newTheme =
    settingsStore.theme === ThemeEnum.DARK ? ThemeEnum.DEFAULT : ThemeEnum.DARK;
  settingsStore.changeTheme(newTheme);
};
/**
 * 根据屏幕宽度切换设备模式
 */

watchEffect(() => {
  if (height.value < 600) {
    icpVisible.value = false;
  } else {
    icpVisible.value = true;
  }
});

onMounted(() => {});
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  background: url("@/assets/images/logo1.png") no-repeat center center /cover;

  .login-container-img {
    display: flex; /* 确保 .login-container-img 也是 Flex 容器 */
    width: 100%;
    height: 100%;
  }

  .login-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 20px;

    .logo {
      img {
        width: 200px; // 根据实际Logo大小调整
        height: auto;
      }
    }

    .system-name {
      position: absolute;
      top: 50%; // 垂直居中
      left: 50%; // 水平居中
      transform: translate(-50%, -50%); // 精确垂直居中调整
      text-align: center;
      .name-cn, .name-en {
        display: block; // 确保换行
      }
      .text-class {
        font-size: 32px;
        font-weight: bold;
        color: #3a76c6;
      }
      .text-en {
        font-size: 15px;
        color: #3a76c6;
      }
    }
  }

  .login-container-form {
    width: 400px; // 登录表单宽度
    margin-left: auto; // 靠右展示
    display: flex;
    align-items: center; // 垂直居中
    height: 100%;
    position: static; /* 移除 position 干扰 */
    float: none; /* 移除 float 干扰 */
    margin-right: 50px; // 在最右侧留有50px的空间

    .login-card {
      margin: auto; // 垂直居中
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      background-color: #fff;

      h2 {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20px;
        color: #141414;
        font-weight: 600;
        margin: 25px 0;
      }

      .login-form {
        width: 100%;
        padding: 0 12px 22px;
      }

      :deep(.el-card__body) {
        padding: 10px;
      }
    }
  }
}

.el-form-item {
  border: 1px solid #d0d2d9;
  border-radius: 8px;
  .icon-box {
    border-radius: 8px 0 0 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 21%;
    height: 48px;
    font-size: 18px;
    // background-color: #e3e3e3;
    &.captcha-icon-box {
      width: calc(21% - 10.5px);
    }
  }
}

:deep(.el-input) {
  .el-input__wrapper {
    padding: 0 15px 0 0;
    background-color: transparent;
    box-shadow: none;
    &.is-focus,
    &:hover {
      box-shadow: none !important;
    }

    input:-webkit-autofill {
      transition: background-color 1000s ease-in-out 0s;
    }
  }
  .el-input__suffix {
    width: 22px;
  }
}

.tab-container {
  height: 48px;
  background-color: #f8f8f8;
  border-radius: 12px;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
  .tab-item {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s linear;
  }
  .active {
    background-color: #fff;
    color: #3a76c6;
    border-radius: 12px;
  }
}

.getCaptcha_ {
  cursor: pointer;
}
</style>

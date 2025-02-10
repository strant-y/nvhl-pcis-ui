<template>
  <div class="login-container">
    <el-row class="login-container-img">
      <el-col class="logo-img">
        <img src="../../assets/images/logo.png" alt="logo" />
      </el-col>
      <el-col class="logo-text">
        <el-row><span class="text-class">财产保险</span>承保系统</el-row>
        <el-row class="text-en"
          ><span class="text-class">Property Insurance </span>Underwriting System
          </el-row
        >
      </el-col>

      <el-col class="ewm-img">
        <el-row>
          <div
            style="display: flex; flex-direction: column; align-items: center"
          >
            <img
              width="100"
              height="100"
              src="../../assets/images/m_ui_ewm.png"
              alt="移动端入口"
            />
            <div class="w-200px text-center mt-5">
              <span>请使用手机扫描二维码进入移动端事故预防平台</span>
            </div>
          </div>
        </el-row>
      </el-col>
    </el-row>
    <div class="login-container-form">
      <!-- 登录表单 -->
      <el-card
        class="!border-none !bg-transparent !rounded-4% w-100 <sm:w-85 card_self"
      >
        <div>
          <h2>你好，欢迎使用平台</h2>
        </div>
        <el-row class="tab-container" justify="center">
          <el-col
            class="tab-item"
            :class="curIndex === index ? 'active' : ''"
            :span="12"
            v-for="(item, index) in tabList"
            :key="item.id"
            @click="tabHandle(index)"
          >
            <el-row justify="center">{{ item.name }}</el-row>
          </el-col>
          <!-- <el-col class="tab-item" :span="12">
        <el-row justify="center">第三方登录</el-row>
      </el-col> -->
        </el-row>
        <!-- <el-tabs v-model="activeName" @tab-click="changeInside">
        <el-tab-pane label="内部登录" name="inside" bor> -->
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
                class="h-[48px] w-[79%]"
                :disabled="verifyFlag"
                @keyup.enter="handleLogin"
              />
            </div>
          </el-form-item>
          <!-- 密码 -->
          <!-- <el-tooltip
              :visible="isCapslock"
              content="Caps lock is On"
              placement="right"
            > -->
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
                class="h-[48px] pr-3 w-[79%]"
                show-password
                :disabled="verifyFlag"
              />
            </div>
          </el-form-item>
          <!-- </el-tooltip> -->
          <!-- 验证码 -->
          <el-form-item v-if="verifyFlag" prop="captchaCode">
            <div class="flex-y-center w-full">
              <span class="icon-box">
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
        <!-- </el-tab-pane> -->
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
        <!-- </el-tab-pane> -->
        <!-- </el-tabs> -->
      </el-card>
    </div>

    <!-- <el-button type="primary" @click="test" >测试</el-button> -->
    <!-- ICP备案 -->
    <!-- <div class="absolute bottom-1 text-[10px] text-center" v-show="icpVisible">
      <p>2005-2024 版权所有 软通动力信息技术（集团）股份有限公司 版权所有</p>
    </div> -->
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
  display: flex;
  .login-container-img {
    width: 60%;
    height: 100vh;
    background: url("@/assets/images/login-new-bg.png") no-repeat center center /
      cover;
    .logo-img {
      display: flex;
      margin: 80px 0 0 150px;
      img {
        width: 300px;
        height: 75px;
        margin-left: -20px;
      }
    }
    .logo-text {
      font-size: 38px;
      font-weight: 500;
      margin: 100px 0 0 150px;
      letter-spacing: 2px;
      .text-en {
        font-size: 20px;
      }
      .text-class {
        color: #ff8c00;
      }
    }
    .ewm-img {
      margin: 50px 0 0 150px;
      letter-spacing: 2px;
    }
  }
  .login-container-form {
    width: 40%;
    margin: 10% 0 0 10%;
    h2 {
      margin-left: 16px;
      text-align: center;
    }
    .el-card.is-always-shadow {
      box-shadow: none;
    }
    .el-card__body {
      padding-top: 0;
    }
    .login-form {
      margin-top: 20px;
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
      background-color: #e3e3e3;
    }
  }
  :deep(.el-input) {
    .el-input__wrapper {
      padding: 0 0 0 15px;
      background-color: transparent;
      box-shadow: none;
      &.is-focus,
      &:hover {
        box-shadow: none !important;
      }

      input:-webkit-autofill {
        /* 通过延时渲染背景色变相去除背景颜色 */
        transition: background-color 1000s ease-in-out 0s;
      }
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
      color: #ff8c00;
      border-radius: 12px;
    }
  }
}

.getCaptcha_ {
  cursor: pointer;
}
</style>

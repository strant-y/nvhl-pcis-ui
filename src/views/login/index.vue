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
          <span class="text-class">永安财产保险承保系统</span>
        </div>
        <div class="name-en">
          <span class="text-en">Yong'an Property Insurance Underwriting System</span>
        </div>
      </div>
    </div>
		<div class="login-container-form" >
		<el-tabs v-model="activeTab" v-show="showLoginCard" stretch class="login-tabs" @tab-click="handleTabClick">
        <!-- 账号密码登录 -->
        <el-tab-pane label="账号密码登录" name="account">
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
            <div class="input_item__ flex-y-center w-full">
              <span class="icon-box">
                <svg-icon icon-class="user" class="mx-2" />
              </span>
              <el-input
                ref="username"
                v-model="loginData.username"
                :placeholder="$t('login.username')"
                name="username"
                size="large"
                @keyup.enter="handleLogin"
                @change="handleLoginChange"
              />
            </div>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item prop="password">
            <div class="input_item__ flex-y-center w-full">
              <span class="icon-box">
                <el-icon class="mx-2"><Lock /></el-icon>
              </span>
              <el-input
                v-model="loginData.password"
                :placeholder="$t('login.password')"
                :type="passwordType"
                name="password"
                @keyup.enter="handleLogin"
                size="large"
                @change="handleLoginChange"
              >
                <template #suffix>
                  <span @mousedown="showPassword" @mouseup="hidePassword" @mouseleave="hidePassword">
                    <el-icon v-if="passwordType === 'text'"><View /></el-icon>
                    <el-icon v-else><Hide /></el-icon>
                  </span>
                </template>
              </el-input>
            </div>
          </el-form-item>
          <!-- 验证码 -->
          <el-form-item v-if="verifyFlag" prop="captchaCode">
            <div class="input_item__ flex-y-center w-full">
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
					<div class="option">
            <el-checkbox v-model="remember" label="记住账户" size="small" />
            <a class="forgot" @click="forgetPwd">忘记密码？</a>
          </div>
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
            <div class="input_item__ flex-y-center w-full">
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
            <div class="input_item__ flex-y-center w-full justify-between">
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
            <div class="input_item__ flex-y-center w-full">
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
   
	</el-tab-pane>
	<!-- 手机验证码登录 -->
	<el-tab-pane label="手机验证码登录" name="mobile">
		<el-card class="login-card">
        <h2>手机号登录</h2>
        <el-form
          ref="thirdPartyRef"
          :model="thirdPartyData"
          :rules="thirdPartyRules"
          class="login-form"
          label-position="top"
        >
          <!-- 手机号 -->
          <el-form-item prop="mobile">
            <div class="input_item__ flex-y-center w-full">
              <span class="icon-box">
                <el-icon class="mx-2"><Iphone /></el-icon>
              </span>
              <el-input
                v-model="thirdPartyData.mobile"
                :placeholder="$t('login.mobile')"
                name="mobile"
                size="large"
                @keyup.enter="thirdPartyLogin"
              />
            </div>
          </el-form-item>
					<!-- 图形验证码-->
          <el-form-item prop="imageCaptchaCode" v-if="!verifyFlag">
            <div class="input_item__ flex-y-center w-full justify-between">
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
          <el-form-item  v-if="verifyFlag" prop="captchaCode">
            <div class="input_item__ flex-y-center w-full">
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
            @click.prevent="phoneNumberLogin"
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
      </el-card>
	</el-tab-pane>
</el-tabs>
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
		<!-- 验证码校验 -->
		<el-dialog
			v-model="isVisible"
			title="验证码校验"
			width="450px"
			append-to-body
			:destroy-on-close="true"
			:close-on-click-modal="false"
			@close="isVisible = false"
		>
			<el-form
				ref="loginFormrRef"
				:model="loginData"
				:rules="loginRules"
				class="login-form"
				label-position="top"
			>
				<!-- 用户名 -->
				<el-form-item prop="username" style="background-color:#f7f7f7">
					<div class="input_item__ flex-y-center w-full">
						<span class="icon-box">
							<svg-icon icon-class="user" class="mx-2" />
						</span>
						<el-input
							ref="username"
							v-model="loginData.username"
							name="username"
							size="large"
							disabled
						/>
					</div>
				</el-form-item>
				<!-- 验证码 -->
				<el-form-item prop="captchaCode">
					<div class="input_item__ flex-y-center w-full">
						<span class="icon-box captcha-icon-box">
							<svg-icon icon-class="captcha" class="mx-2" />
						</span>
						<el-input
							ref="captchaCode"
							v-model="loginData.captchaCode"
							auto-complete="off"
							size="large"
							class="flex-1"
							placeholder="验证码"
						/>
						<!-- 验证码-->
						<span style="width: 72px; text-align: right">
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
						</span>
					</div>
				</el-form-item>
				<!-- 验证按钮 -->
				<el-button
					:loading="loading"
					type="primary"
					size="large"
					class="w-full"
					@click.prevent="handleSubmit"
					>验证
				</el-button>
			</el-form>
		</el-dialog>
		<!-- 密码修改 -->
		<el-dialog
    v-model="isModifyPwd"
    title="密码修改"
    :close-on-click-modal="false"
    width="640px"
    @close="handleClose"
    class="password-dialog"
  >
    <div class="password-container">
      <el-alert
        v-if="error"
        type="error"
        :title="error"
        show-icon
        class="mb-lg"
      />

      <div class="password-tips">
        <span>提示：请键入新密码，然后再次键入新密码进行确认。</span>
        <br />
        <span>修改密码默认生效期为三个月</span>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="20px"
        class="password-form"
      >
        <!-- 账户名（只读） -->
        <el-form-item style="background-color:#f7f7f7">
          <el-input
            v-model="form.usercde"
            placeholder="账户名"
            :disabled="true"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
				<!-- 原密码（条件显示） -->
        <el-form-item v-if="overduePwdVerify" prop="oldPassword">
          <el-input
            v-model="form.oldPassword"
            placeholder="原密码"
            type="password"
            size="large"
						prefix-icon="Lock"
          />
        </el-form-item>
        <!-- 新密码（带强度提示） -->
        <el-form-item prop="newPwd">
          <el-popover
            placement="right"
            trigger="focus"
            v-model:visible="passwordPopoverVisible"
            :width="240"
            popper-class="password-strength-popover"
          >
            <template #reference>
              <el-input
                v-model="form.newPwd"
                placeholder="新密码"
                type="password"
                size="large"
                prefix-icon="Lock"
                @input="checkPasswordStrength"
              />
            </template>
            <div class="password-strength-content">
              <div :class="`strength-indicator ${status}`">
                强度：{{ statusText }}
              </div>
              <div class="progress-container">
                <el-progress
                  :percentage="progress"
                  :stroke-width="6"
                  :status="progressStatus"
                  show-text
                />
              </div>
              <p class="strength-hint">
                请至少输入 8 个字符。请不要使用容易被猜到的密码。
              </p>
            </div>
          </el-popover>
        </el-form-item>

        <!-- 确认新密码 -->
        <el-form-item prop="confirmNewPwd" :rules="confirmRule">
          <el-input
            v-model="form.confirmNewPwd"
            placeholder="确认新密码"
            type="password"
            size="large"
            prefix-icon="Lock"
          />
        </el-form-item>
      </el-form>

      <div class="password-actions">
        <el-button
          type="primary"
          size="large"
          :loading="loading3"
          @click="savePwd"
          class="password-btn"
        >
          确认修改
        </el-button>
      </div>
    </div>
  </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore, useUserStore, useAppStore } from "@/store";
import { getCaptchaApi, getOperInfoApi, forgetAndModifyPasswordApi, verifyCodeApi } from "@/api/auth";
import { LoginData } from "@/api/auth/types";
import { Sunny, Moon } from "@element-plus/icons-vue";
import { LocationQuery, LocationQueryValue, useRoute } from "vue-router";
import router from "@/router";
import defaultSettings from "@/settings";
import {ThemeEnum, ThemeSuitedColorEnum} from "@/enums/ThemeEnum";
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
const passwordType = ref("password"); // 密码类型
const isMouseDown = ref(false); // 鼠标按下状态
const remember = ref(false); // 记住密码
const showPassword = () => {
  passwordType.value = "text";
  isMouseDown.value = true
};
const hidePassword = () => {
  if(isMouseDown.value) {
    passwordType.value = "password";
    isMouseDown.value = false
  }
};
const showLoginCard = ref(true); // 是否显示登录卡片

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
	getCaptchaParam.value = {}
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
					const { msg, code, phoneNO, serial, src } = res;
					if (200 == code) {
						verifyData.value.serial = serial;
						verifyData.value.phoneNO = phoneNO;
						if ('密码不在有效期内' == msg) {
							ElMessage.error('密码不在有效期内,请验证后修改密码！');
							overduePwdVerify.value = true;
							isVisible.value = true
							// 获取验证码
							getCaptcha({ serial: serial });
							return false
						}
						// remember me ---记住账户
						if (true === remember.value) {
							localStorage.setItem("RemenberMe", loginData.value.username);
						} else {
							localStorage.removeItem("RemenberMe");
						}
						const param = src === '0' ? loginData.value.username : phoneNO;
						account.value = param;
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
  if (inside.value && activeTab.value == "account") {
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

onMounted(() => {
  // 从平台过来的 隐藏登陆卡片
  const href = window.location.href;
  const code = href.slice(href.indexOf("?") + 1, href.indexOf("&")).split("=")[1];
  if(code) {
    showLoginCard.value = false;
    userStore.verifyCode(code)
  }

  // 登录页 清除深色模式 根据当前的主题颜色匹配主题
  const settingsStore = useSettingsStore();
  Object.keys(ThemeSuitedColorEnum).forEach((key: any) => {
    if(ThemeSuitedColorEnum[key] === settingsStore.themeColor) {
      settingsStore.changeTheme(key);
    }
  });
	if(localStorage.getItem("RemenberMe")){
		const RemenberMeData = localStorage.getItem("RemenberMe")
		remember.value = RemenberMeData? true : false
		loginData.value.username = RemenberMeData
	}
});

function handleLoginChange() {
  verifyFlag.value = false;
  if(loginData.value.captchaCode) {
    loginData.value.captchaCode = "";
  }
}

/**
 * 忘记密码
 */
const loginFormrRef = ref(ElForm); // 忘记密码验证表单ref
const isVisible = ref(false)
const forgetPwdVerify = ref(false)
const account = ref('11111')
const forgetPwd = () => {
	loginFormRef.value?.validateField('username').then((valid: boolean) => {
    if (valid) {
			getOperInfoApi(loginData.value)
			.then((res) => {
				const { msg, code, phoneNO, serial, src} = res;
				verifyData.value.serial = serial;
				verifyData.value.phoneNO = phoneNO;
				const param = src === '0' ? loginData.value.username : phoneNO;
				if (200 === code && !!serial) {
					account.value = param;
					isVisible.value = true;
					forgetPwdVerify.value = true;
          // 获取验证码
          getCaptcha({ serial: serial, Changepassword: '1' });
				} else {
					ElMessage.error(msg || "系统出错");
				}
			})
			.catch(() => {})
			.finally(() => {
			});
    }
  });
}

/**
 * 忘记密码短信验证码校验提交
 */
const isModifyPwd = ref(false)
const form = ref({
	usercde: '',
	oldPassword: '',
	newPwd: '',
	confirmNewPwd: '',
})
const handleSubmit = () => {
  loginFormrRef.value?.validateField('captchaCode').then((valid: boolean) => {
    if (valid) {
      loading.value = true;
			// 验证类型
			let verifyType = 'login';
			if (forgetPwdVerify.value) { // 忘记密码验证
        verifyType = 'forget';
			} else if (overduePwdVerify.value) {
				verifyType = 'overdue';
			}
      const params = {
				serial: verifyData.value.serial,
        code: loginData.value.captchaCode || '',
				verifyType,
      };
			verifyCodeApi(params).then((res) => {
				if (null != res && null != res['code'] && res['code'] == 200) {
					// 忘记密码或密码过期验证通过弹出修改密码框
					if (forgetPwdVerify.value || overduePwdVerify.value) {
						form.value.usercde = loginData.value.username;
						form.value.oldPassword = '';
						form.value.newPwd = '';
						form.value.confirmNewPwd = '';
						isModifyPwd.value = true;
					}
					loading.value = false;
				} else {
        	ElMessage.error(msg);
      	}
			}).catch((err) => console.log(err))
			.finally(() => (loading.value = false));;
    }
  });
};

// 表单引用
const formRef = ref(null);
// 数据状态
const error = ref('');
const loading3 = ref(false);
const overduePwdVerify = ref(false);
const passwordPopoverVisible = ref(false);

// 密码强度计算
const status = computed(() => {
  if (!form.value.newPwd) return 'weak';
  if (form.value.newPwd.length < 8) return 'weak';
  
  // 强度规则：数字+字母+特殊字符
  const hasDigit = /\d/.test(form.value.newPwd);
  const hasLetter = /[a-zA-Z]/.test(form.value.newPwd);
  const hasSpecial = /[^a-zA-Z0-9]/.test(form.value.newPwd);
  
  if (hasDigit && hasLetter && hasSpecial) return 'strong';
  if (hasDigit || hasLetter) return 'medium';
  return 'weak';
});

const progress = computed(() => {
  if (!form.value.newPwd) return 0;
  if (form.value.newPwd.length < 8) return 20;
  return Math.min(form.value.newPwd.length * 10, 100);
});

const statusText = computed(() => {
  return {
    weak: '太短',
    medium: '中',
    strong: '强',
  }[status.value];
});

const progressStatus = computed(() => {
  return {
    weak: 'exception',
    medium: 'warning',
    strong: 'success',
  }[status.value];
});

// 表单验证规则
const rules = {
  oldPassword: [
    { required: true, message: '请输入原密码！', trigger: 'blur' },
  ],
  newPwd: [
    { required: true, message: '请输入新密码！', trigger: 'blur' },
    { min: 8, message: '密码长度至少8位', trigger: 'blur' },
  ],
  confirmNewPwd: [
    { required: true, message: '请确认新密码！', trigger: 'blur' },
  ],
};

const confirmRule = [
  { required: true, message: '请确认新密码！', trigger: 'blur' },
  {
    validator: (rule, value) => {
      if (value !== form.value.newPwd) {
        return Promise.reject('两次输入的密码不匹配！');
      }
      return Promise.resolve();
    },
    trigger: 'blur',
  },
];

// 方法
const checkPasswordStrength = () => {
  // 强度提示在输入时自动更新
  passwordPopoverVisible.value = !!form.value.newPwd;
};

const savePwd = async () => {
  try {
    const valid = await formRef.value.validate();
		if (!valid) return;

		let type = null;
		if (forgetPwdVerify.value) {
				type = 'forget';
		}
		const userparam = {
			userId: form.value.usercde,
			oldPassword: form.value.oldPassword,
			password: form.value.newPwd,
			serial: verifyData.value.serial,
			code: loginData.value.captchaCode || '',
			type: type,
		};
    
    loading3.value = true;
    error.value = '';

		forgetAndModifyPasswordApi(userparam).then((res) => {
			const { msg, code, phoneNO, serial, src} = res;
			if (200 == code ) {
				isModifyPwd.value = false;
				isVisible.value = false;
				forgetPwdVerify.value = false;
				overduePwdVerify.value = false;
    		ElMessage.success('密码修改成功！');
			} else {
				ElMessage.error(msg || "系统出错");
			}
		})
  } catch (err) {
    error.value = '密码修改失败，请重试';
  } finally {
    loading3.value = false;
  }
};

const handleClose = () => {
  isModifyPwd.value = false;
  error.value = '';
  form.value = {
    usercde: form.value.usercde,
    oldPassword: '',
    newPwd: '',
    confirmNewPwd: '',
  };
};

const activeTab = ref("account"); // 默认选中账号登录
const phoneNumberRef = ref(null);
// tabs标签页切换
const handleTabClick = (tab) => {
  activeTab.value = tab.name;
  // 可在此重置某些状态（如清空验证码倒计时等）
}

// 手机验证码登录提交
const phoneNumberLogin = () => {
	if (!thirdPartyData.value.imageCaptchaCode) {
    ElMessage.warning("请输入图片中的验证码！");
  }
  thirdPartyRef.value.validate((valid: boolean) => {
		if (valid) {
			const flag = imagCaptchaRef.value.validate(
        thirdPartyData.value.imageCaptchaCode
			);
			if (flag) {
				loading.value = true;
				userStore.login(thirdPartyData.value).then((res) => {
					const { msg, code, phoneNO, serial, src } = res;
					if (200 == code) {
						verifyFlag.value = true;
						verifyData.value.serial = serial;
						verifyData.value.phoneNO = phoneNO
						getCaptcha({ ...thirdPartyData.value,serial });
					} else {
						ElMessage.error(msg || "系统出错");
					}
				})
				.catch(() => {})
				.finally(() => {
					loading.value = false;
				});
      } else {
        thirdPartyData.value.imageCaptchaCode = undefined;
        ElMessage.error("验证码有误，请重新输入！");
        setTimeout(() => {
          thirdPartyRef.value.clearValidate(["imageCaptchaCode"]);
        }, 100);
      }
    }
  });
}
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
			width: 300px;
      margin: auto; // 垂直居中
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      background-color: #fff;
      border: 1px solid #e4e4e4;
      h2 {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20px;
        color: #333;
        font-weight: 600;
        margin: 25px 0;
      }

      .login-form {
        width: 100%;
        padding: 0 12px 22px;
        :deep(.el-form-item__content) {
          flex-direction: column;
        }
        :deep(.el-form-item__error) {
          width: 100%;
          height: 0;
          transform: translate(0, 2px);
          padding: 0;
          text-align: left;
        }
      }

      :deep(.el-card__body) {
        padding: 10px;
      }
    }
  }
}

:deep(.el-tabs){
	.el-tabs__nav-wrap::after {
		height: 1px;
	}
	.el-tabs__item {
		font-size: 16px;
		font-weight: 700;
	}
}

:deep(.el-form-item) {
  border: 1px solid #d0d2d9;
  border-radius: 8px;
  // width: 243px;

  .icon-box {
    border-radius: 8px 0 0 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 21%;
    height: 48px;
    font-size: 18px;
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
    .el-input__inner {
      color: #333 !important;
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

.option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot {
  color: #3a76c6;
}

.password-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 30px;
  }
}

.password-container {
  padding: 0 10px;
}

.password-tips {
  margin-bottom: 24px;
  color: #606266;
  font-size: 14px;
}

.password-form {
  margin-bottom: 24px;
}

.password-strength-popover {
  padding: 10px 0;
}

.strength-indicator {
  font-weight: 500;
  margin-bottom: 8px;
}

.strength-indicator.weak {
  color: #ff4d4f;
}

.strength-indicator.medium {
  color: #faad14;
}

.strength-indicator.strong {
  color: #52c41a;
}

.progress-container {
  margin-bottom: 12px;
}

.strength-hint {
  color: #909399;
  font-size: 12px;
  margin: 0;
}

.password-actions {
  text-align: center;
}

.password-btn {
  width: 100%;
}
</style>

import {AxiosPromise} from "axios";
import {LoginData, LoginResult} from "./types";
import {post} from "@/utils/http";
import {rsaEncoder} from "@/utils/encipher";

/**
 * 登录API
 *
 * @param data {LoginData}
 * @returns
 */
export function loginApi(data: LoginData): AxiosPromise<LoginResult> {
  return post(`/login`,{
      source: rsaEncoder(JSON.stringify({
        username: data.username,
        passwd: data.password
      }))
  })
}



/**
 * 验证码校验
 * @param data
 * @returns
 */
export function verifyCodeApi(data): AxiosPromise<LoginResult> {
  const href = window.location.href;
  if(href.indexOf("code=") > 0) {
    return post('/unifiedPlatform',
      {source: {key: 'source', value: data}}
    );
  } else {
    return post('/verifyCode',
      {source: data}
    );
  }
}


/**
 * 获取验证码
 */
export function getCaptchaApi(param) {
  return post(`/getCaptcha`,{source: param});
}

/**
 * 根据token获取用户信息
 */
export function resolveTokenApi(param) {
  return post(`/resolveToken`, {source: param});
}

/**
 * 忘记密码
 */
export function getOperInfoApi(param) {
  return post(`/getOperInfo`, {source: param});
}

/**
 * 修改密码
 */
export function forgetAndModifyPasswordApi(param) {
  return post(`/forgetAndModifyPassword`, {source: param});
}



/**
 * 注销API
 */
export function logoutApi() {
  return post('/logOut',{source: null});
}
// 临时测试
/*export function logoutApi() {
  return post('http://10.12.18.114:8082/beauty-api/logout', { source: null }); // 指定完整URL
}*/
/**
 * 绑定用户
 */
export function bindUser(param) {
  return post('/bindUser',{source: param});
}

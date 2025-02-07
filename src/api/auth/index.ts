import request from "@/utils/request";
import { AxiosPromise } from "axios";
import { CaptchaResult, LoginData, LoginResult } from "./types";
import {post,del} from "@/utils/http";
import {rsaEncoder} from "@/utils/encipher";
import {AppBaseApi,LocalBaseApi} from "@/api/config"

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
  return post('/verifyCode',
    {source: data}
  );
}


/**
 * 获取验证码
 */
export function getCaptchaApi(param) {
  return post(`/getCaptcha`,{source: param});
}





/**
 * 注销API
 */
export function logoutApi() {
  return post('/logout',{source: null});
}

/**
 * 绑定用户
 */
export function bindUser(param) {
  return post('/bindUser',{source: param});
}

import { AxiosPromise } from "axios";
import { post } from "@/utils/http";
import { LocalBaseApi } from "../config";
import request from "@/utils/request";

const QUERY = "/query/";

/**
 * 根据大类查询产品列表
 * @param queryParams
 */
export function getProdInfoList(queryParams: any): AxiosPromise<any> {
    return post(`${QUERY}getProdInfoList`, queryParams);
}
  
/**
 * 查询保单数据
 * @param queryParams
 */
export function getPlyInfo(queryParams: any): AxiosPromise<any> {
    return post(`${QUERY}getPlyInfo`, queryParams);
}

/**
 * 获取投保单号
 * @param queryParams
 */
export function generatelSingleNo(queryParams: any): AxiosPromise<any> {
    return post(`/policy/generatelSingleNo`, queryParams);
}

/**
 * 投保单保费计算
 * @param queryParams
 */
export function appCalc(queryParams: any): AxiosPromise<any> {
    return post(`/policy/calc`, queryParams);
}

/**
 * 投保单申请核保
 * @param queryParams
 */
export function submitToUndr(queryParams: any): AxiosPromise<any> {
    return post(`/policy/submit`, queryParams);
}

/**
 * 投保单列表查询
 * @param queryParams
 */
export function getAppPolicyList(queryParams: any): AxiosPromise<any> {
    return post(`/policy/getAppPolicyList`, queryParams);
}

/**
 * 保单列表查询
 * @param queryParams
 */
export function qryEndorseList(queryParams: any): AxiosPromise<any> {
    return post(`/edr/qryEndorseList`, queryParams);
}

/**
 * 投保单详情查询
 * @param queryParams
 */
export function getAppPolicy(queryParams: any): AxiosPromise<any> {
    let url = '';
    if (!!queryParams['scene'] && 'EDR_APP_NEW_SCENE' === queryParams['scene']) {
        url = `/policy/getPolicy`;
    } else {
        url = `/policy/getAppPolicy`;
    }
    return post(url, queryParams);
}
/**
 * 保存申请单详细信息
 * @param queryParams
 */
export function saveAppPlyInfo(queryParams: any): AxiosPromise<any> {
    return post(`policy/save`, queryParams);
}

/**
 * 保存批改单详细信息
 * @param queryParams
 */
export function saveEdrAppPlyInfo(queryParams: any): AxiosPromise<any> {
    return post(`/policy/saveEdr`, queryParams);
}

/**
 * 生成批文
 * @param queryParams
 */
export function getEndorseChange(queryParams: any): AxiosPromise<any> {
    return post(`/edr/getEndorseChange`, queryParams);
}
  
/**
 * 查询申请单列表
 * @param queryParams
 */
export function getAppPlyList(queryParams: any): AxiosPromise<any> {
    return post(`${QUERY}getAppPlyList`, queryParams);
}
  
/**
 * 查询申请单详细信息
 * @param queryParams
 */
export function getAppPlyInfoByAppNo(queryParams: any): AxiosPromise<any> {
    return post(`${QUERY}getAppPlyInfoByAppNo`, queryParams);
}

/**
 * 查询客户信息
 * @param queryParams
 */
export function genCusConInfoBusinessList(queryParams: any): AxiosPromise<any> {
    return post(`policy/genCusConInfoBusinessList`, queryParams);
}

/**
 * 投保单核保信息 提交
 */
export function submitUnderwriting(queryParams: any) {
    return request.post('/policy/undr', queryParams);
}

/**
 * 批单核保信息 提交
 */
export function submitUnderwritingEdr(queryParams: any) {
    return request.post('/policy/undrEdr', queryParams);
}

import { AxiosPromise } from "axios";
import { post } from "@/utils/http";
import { LocalBaseApi } from "../config";

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
 * 保存申请单详细信息
 * @param queryParams
 */
export function saveAppPlyInfo(queryParams: any): AxiosPromise<any> {
    return post(`policy/save`, queryParams);
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

  


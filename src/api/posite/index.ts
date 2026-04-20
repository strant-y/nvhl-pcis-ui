import { AxiosPromise } from "axios";
import { post } from "@/utils/http";

/**
 * 组合出单api
 */

const PageBaseUrl: string = "/policy";

//查询
function queryPositeInfo(queryParams: any): AxiosPromise<any> {
    return post(`${PageBaseUrl}/getCombinationDetail`, queryParams);
}
//保费计算
function appCombinationCalc(queryParams: any): AxiosPromise<any> {
    return post(`${PageBaseUrl}/appCombinationCalc`, queryParams);
}
//保存
function savePositeInfo(queryParams: any): AxiosPromise<any> {
    return post(`${PageBaseUrl}/saveCombination`, queryParams);
}
//申请核保
function submitCombination(queryParams: any): AxiosPromise<any> {
    return post(`${PageBaseUrl}/submitCombination`, queryParams);
}
//意健险方案信息获取
function getYjxPlanInfo(queryParams: any): AxiosPromise<any> {
    return post(`/channel/getPlanInfo`, queryParams);
}
//查询组合方案数据
function getCombinationPlan(queryParams: any): AxiosPromise<any> {
    return post(`/policy/getCombinationPlan`, queryParams);
}
//查询财险方案数据
function getPlanByCombinationPlanNo(queryParams: any): AxiosPromise<any> {
    return post(`/policy/getPlanByCombinationPlanNo`, queryParams);
}

export default {
    queryPositeInfo,
    appCombinationCalc,
    savePositeInfo,
    submitCombination,
    getYjxPlanInfo,
    getCombinationPlan,
    getPlanByCombinationPlanNo
}


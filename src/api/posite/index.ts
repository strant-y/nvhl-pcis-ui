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

export default {
    queryPositeInfo,
    appCombinationCalc,
    savePositeInfo,
    submitCombination
}


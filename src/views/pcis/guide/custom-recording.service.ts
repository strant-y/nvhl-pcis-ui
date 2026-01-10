// import request from '@/utils/request';
import {AxiosPromise} from "axios";
import {post} from "@/utils/http";
import {get} from "@/utils/http";
import {del} from "@/utils/http";
import { LocalBaseApi } from "../config";

/**
 * 投保	自定义录单
 *
 * @param queryParams
 */
export function getProdEnableList(queryParams: any): AxiosPromise<any> {
    return post(`/proddef/getProdEnableList`, queryParams);
}
export function qryUserCommonTerm(queryParams: any): AxiosPromise<any> {
    return post(`/userTerm/qryUserCommonTerm`, queryParams);
}
export function userUnionTerm(queryParams: any): AxiosPromise<any> {
    return post(`/userTerm/userUnionTerm`, queryParams);
}
export function unUserUnUntionTerm(queryParams: any): AxiosPromise<any> {
    return post(`/userTerm/unUserUnUntionTerm`, queryParams);
}
//根据续保单号查询
export function getPolicy(queryParams: any): AxiosPromise<any> {
    return post(`/policy/getPolicy`, queryParams);
}

export function checkRenewalDpt(queryParams: any): AxiosPromise<any> {
    return post(`/policy/checkRenewalDpt`, queryParams);
}

export function getAppPolicyComponent(queryParams: any): AxiosPromise<any> {
    return post(`policy/getAppPolicyComponent`, queryParams);
}

export function getAppPolicyForRenewal(queryParams: any): AxiosPromise<any> {
    return post(`policy/getAppPolicyForRenewal`, queryParams);
}

export function getECargoPolicyComponent(queryParams: any): AxiosPromise<any> {
	return post(`policy/getECargoPolicyComponent`, queryParams);
}

export function getECargoPolicyForRenewal(queryParams: any): AxiosPromise<any> {
	return post(`policy/getECargoPolicyForRenewal`, queryParams);
}

export function getECargoPolicyPayment(queryParams: any): AxiosPromise<any> {
	return post(`policy/getECargoPolicyPayment`, queryParams);
}

export function downloadPlanTemplate(queryParams: any): AxiosPromise<any> {
	return post(`policyTemplate/downloadPlanTemplate`, queryParams, {
        responseType: 'blob'
    });
}

export function importPlan(queryParams: any): AxiosPromise<any> {
	return post(`policyTemplate/importPlan`, queryParams);
}


/*
 * 投保	自定义录单
 */
// export class CustomRecordingService {
//   getProdEnableListUrl = 'proddef/getProdEnableList'; // 获取条款列表
//     /**
//      * @Title: 获取条款列表
//      * @Description:
//      * @date 2018/4/16 15:10
//      * @author pflir@isoftstone.com
//      * @params:
//      */
//     getProdEnableList(ops) {
//         return request.get(`${this.getProdEnableListUrl}`,{
//           params: ops || {},
//         });
//     }
// }

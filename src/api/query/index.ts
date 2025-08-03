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

export function getAddressStr(queryParams: any): AxiosPromise<any> {
    return post(`${QUERY}getAddressStr`, queryParams);
}

/**
 * 获取申请单号
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
 * es查询
 * @param queryParams
 */
export function queryInsuredList(queryParams: any): AxiosPromise<any> {
    return post(`/policy/queryInsuredList`, queryParams);
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
 * 批改保费计算
 * **/

export function calcEdr(queryParams: any): AxiosPromise<any> {
    return post(`/policy/calcEdr`, queryParams);
}

/**
 * 退保保费计算
 * **/

export function calcSurrenEdr(queryParams: any): AxiosPromise<any> {
    return post(`/policy/calcSurrenEdr`, queryParams);
}

/**
 * 退保保存
 * **/

export function saveSurrenEdr(queryParams: any): AxiosPromise<any> {
    return post(`/policy/saveSurrenEdr`, queryParams);
}

/**
 * 批改单申请核保(退保、注销)
 * **/

export function submitEdrSurrender(queryParams: any): AxiosPromise<any> {
    return post(`/policy/submitEdrSurrender`, queryParams);
}

/**
 * 批改申请核保
 * **/

export function submitEdrToUndr(queryParams: any): AxiosPromise<any> {
    return post(`/policy/submitEdr`, queryParams);
}

/**
 * 一般批改生成批文
 * @param queryParams
 */
export function getEndorseChange(queryParams: any): AxiosPromise<any> {
    return post(`/edr/getEndorseChange`, queryParams);
}

/**
 * 退保生成批文
 * @param queryParams
 */
export function getSurrenderPrecis(queryParams: any): AxiosPromise<any> {
    return post(`edr/getSurrenderPrecis`, queryParams);
}

/**
 * 获取批改项
 * @param queryParams
 */
export function getEdrRsnItem(queryParams: any): AxiosPromise<any> {
    return post(`/edr/getEdrRsnItem`, queryParams);
}

/**
 * 获取条款批改项
 * @param queryParams
 */
export function getEdrRsnTermItem(queryParams: any): AxiosPromise<any> {
    return post(`/edr/getEdrRsnTermItem`, queryParams);
}

/**
 * 获取批改比较项
 * @param queryParams
 */
export function getedrcmpitembyedrappnoorcachekey(queryParams: any): AxiosPromise<any> {
    return post(`/edr/get-edr-cmp-item-by-edr-appno-or-cachekey`, queryParams);
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

/**
 * 综合查询删除暂存单
 */
export function delTmpPolicy(queryParams: any) {
    return request.post('/policy/delTmpPolicy', queryParams);
}

/**
 * 承保-短期费率类型
 */
export function policyRatio(queryParams: any) {
    return request.post('/policy/ratio', queryParams);
}
/**
 * 承保-查询客户信息 （全量）
 */
export function qryCustomer(queryParams: any) {
    return request.post('/policy/qryCustomer', queryParams);
}

/**
 * 询价-投保单保费计算
 * @param queryParams
 */
export function calculatePremium(queryParams: any): AxiosPromise<any> {
    return post(`/inquiry/calculatePremium`, queryParams);
}

/**
 * 复制出单-查询原保单数据
 * @param queryParams
 */
export function getAppPolicyForCopy(queryParams: any): AxiosPromise<any> {
    return post(`/policy/getAppPolicyForCopy`, queryParams);
}

/**
 * 询价-投保单保存
 * @param queryParams
 */
export function saveInquiry(queryParams: any): AxiosPromise<any> {
    return post(`/inquiry/save`, queryParams);
}

/**
 * 询价-投保单申请核保
 * @param queryParams
 */
export function submitInquiry(queryParams: any): AxiosPromise<any> {
    return post(`/inquiry/submit`, queryParams);
}

/**
 * 询价-核保保存
 * @param queryParams
 */
export function submitUnderwrite(queryParams: any): AxiosPromise<any> {
    return post(`/inquiry/submitUnderwrite`, queryParams);
}

/**
 * 综合查询-询价单查询
 * @param queryParams
 */
export function getInquiryPolicyList(queryParams: any): AxiosPromise<any> {
    return post(`/policy/getInquiryPolicyList`, queryParams);
}


/**
 * 综合查询-询价单删除
 * @param queryParams
 */
export function delInquiryPolicy(queryParams: any): AxiosPromise<any> {
    return post(`/policy/delInquiryPolicy`, queryParams);
}

/**
 * 询价-获取询价单数据
 * @param queryParams
 */
export function getInquiryPolicy(queryParams: any): AxiosPromise<any> {
    return post(`/policy/getInquiryPolicy`, queryParams);
}

/**
 * 询价-风勘之后判断是否可以核保
 * @param queryParams
 */
export function getisAllDone(queryParams: any): AxiosPromise<any> {
	return post(`/risk/isAllDone`, queryParams);
}

/**
 * 询价/录单-申请核保根据单号判断是否灰黑名单
 * @param queryParams
 */
export function isUndrClsBlackList(queryParams: any): AxiosPromise<any> {
	return post(`risk/isUndrClsBlackList`, queryParams);
}

/**
 * 协议/录单-根据协议号、产品代码、条款代码、被保人id查询被保人信息和条款信息
 * @param queryParams
 */
export function queryEcargoRelevancePolicyDetails(queryParams: any): AxiosPromise<any> {
	return post(`/ecargo/queryEcargoRelevancePolicyDetails`, queryParams);
}
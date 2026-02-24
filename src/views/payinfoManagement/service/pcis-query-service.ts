import { AxiosPromise } from 'axios'
import { post } from '@/utils/http'
import request from '@/utils/request'
import { del } from '@/utils/http'

/**
 * 查询服务
 */
export class PcisQueryService {

    randomUserUrl = 'https://api.randomuser.me/';
    qryAppPolicyUrl = 'policy/getAppPolicyList';
    qryAppPlyInfoUrl = 'policy/getAppPolicyInfoList';
    qryChannalPolicyUrl = 'policy/getChannalBaseList';
    qryChannalConfigUrl = 'orgempmgr/queryChannalConfig';
    qryColConfigUrl = 'orgempmgr/queryColConfig';
    updateColConfigUrl = 'orgempmgr/updateColConfig';
    qryPayConfirmInfoAuditUrl = 'policy/getPayConfirmInfoAuditList';
    payConfirmInfoAuditUrl = 'policy/payConfirmInfoAudit';
    qryPayConfirmInfoUrl = 'policy/getPayConfirmInfoList';
    payConfirmInfoRegisterUrl = 'policy/payConfirmInfoRegister';
    payConfirmInfoSubmitUrl = 'policy/payConfirmInfoSubmit';
    loadPayConfirmInfoUrl = 'policy/getPayConfirmInfo';
    delTmpPolicyUrl = 'policy/delTmpPolicy'; // 暂存单删除
    payConfirmInfoBackUrl = 'policy/payConfirmInfoBack';
    qryEndorseUrl = 'edr/qryEndorseList'; // 带批改单查询URL
    qryPolicyLatestListUrl = 'edr/qryPolicyLatestList'; // 最新保批单列表查询
    qryPolicyShortUrl = 'policy/getPolicyShortList';
    getUndrOpnListUrl = 'policy/getUndrOpnList'; // 获取核保信息列表
    isExistInAlldbUrl = 'policy/isExistInAlldb';
    qryExpirationPolicyUrl = 'policy/getExpirationPolicyList';
    qryEpolicyPolicyListUrl = 'edr/getPolicyList'; // 电子保单列表查询
    queryEmpEpolicyPolicyListUrl = 'edr/getEmpPolicyList'; // 查询雇主责任保批单列表信息
    generatingEPolicyUrl = 'epolicy/generatingEPolicy';// 生成电子保单
    downloadEPolicyUrl = 'epolicy/downloadData';// 下载电子保单
    batchDownloadEPolicyUrl = 'epolicy/batchDownloadEPolicy';// 批量下载电子保单
    qryDiaryListUrl = 'policy/getDiaryList';
    qryChangeFeeListUrl = 'edr/qryChangeFeeList';
    loadFeeInfoUrl = 'edr/getFeeInfo';
    qryChangeFeeRecordUrl = 'edr/qryChangeFeeRecord';
    qryHistoryClaimUrl = 'policy/qryHistoryClaim';
    expHistoryClaimUrl = 'policy/expHistoryClaim';
    qryInsuredListUrl = 'es/queryInsuredList';
    getlatestPlyInfoUrl = 'policy/getlatestPlyInfo';
    qryTerminationInfoUrl = 'policy/qryTerminationInfo';

    qryTerminationDataListUrl = 'oa/qryTerminationDataList';
    dealTerminationDataUrl = 'oa/dealTerminationData';
    createClaimLinkUrl = 'policy/createClaimLink';
    updateFundInfoStateURL = 'policy/updateFundInfoState';
    qryPayFaildListUrl = 'cash/qryPayFaildList'; // 获取支付失败的异常账户列表
    qryAppCustomerPolicyUrl = 'policy/getAppPolicyListByCustomerInfo';
    qryCustomerEquityPolicyUrl = 'policy/getCustomerEquityInfo';
    qryNotifyByReceiver = '/notify/getNotifyByReceiver';  // 消息提醒
    HistoryClaimYearAll = '/policy/qryHistoryClaimYearAll'; // 历史赔案-年度
    HistoryClaimYearDetail = '/policy/qryHistoryClaimYearDetail'; // 历史赔案-年度明细
    HistoryClaimDetail = '/policy/qryHistoryClaimDetail'; // 历史赔案-赔案明细

    /**
     * 查询客户权益
     */
    getCustomerEquity(ops: any): AxiosPromise<any> {
        return post(`${this.qryCustomerEquityPolicyUrl}`, ops);
    }

    /**
     * 根据客户信息查询投保单
     */
    getAppPolicyListByCustomerInfo(ops: any): AxiosPromise<any> {
        return post(`${this.qryAppCustomerPolicyUrl}`, ops);
    }

    /**
     * 投保单/保单查询
     */
    getAppPolicyList(ops: any): AxiosPromise<any> {
        return post(`${this.qryAppPolicyUrl}`, ops);
    }

    getAppPolicyInfoList(ops: any): AxiosPromise<any> {
        return post(`${this.qryAppPlyInfoUrl}`, ops);
    }

    /**
     * 渠道统计保/批查询
     */
    getChannalPolicyList(ops: any): AxiosPromise<any> {
        return post(`${this.qryChannalPolicyUrl}`, ops);
    }

    /**
     * 渠道统权限查询
     */
    getChannalConfig(ops: any): AxiosPromise<any> {
        return post(`${this.qryChannalConfigUrl}`, ops);
    }

    /**
     * 组合产品投保单查询
     */
    queryCombinationPage(ops: any): AxiosPromise<any> {
        return post(`policy/queryCombinationPage`, ops);
    }

    /**
     * 首页暂存，待修改单，待核保单查询
     */
    getPolicyShortList(ops: any): AxiosPromise<any> {
        return post(`${this.qryPolicyShortUrl}`, ops);
    }

    /**
     * 获取列行为信息
     */
    getColConfig(ops: any): AxiosPromise<any> {
        return post(`${this.qryColConfigUrl}`, ops);
    }

    /**
     * 更新列行为信息
     */
    updateColConfig(ops: any): AxiosPromise<any> {
        return post(`${this.updateColConfigUrl}`, ops);
    }

    /**
     * 缴费信息处理列表
     */
    getPayConfirmInfoList(ops: any): AxiosPromise<any> {
        return post(`${this.qryPayConfirmInfoUrl}`, ops);
    }

    /**
     * 查询保费接口表
     */
    qryPrmDueList(ops: any): AxiosPromise<any> {
        return post(`${this.qryPayFaildListUrl}`, ops)
    }
    /**
     * 账户信息上传
     * @param ops
     */
    accountExDispose(ops: any): AxiosPromise<any> {
        return post(`cash/accountExDispose`, ops)
    }
    /**
     * 根据组合产品单号获取基本申请单号
     */
    getAppNoAndUniqueNoByCombination(ops: any): AxiosPromise<any> {
        return post(`policy/getAppNoAndUniqueNoByCombination`, ops);
    }

    /**
     * 信息登记前的验证
     */
    checkBefChequeRegister(ops: any): AxiosPromise<any> {
        return post(`policy/checkBefChequeRegister`, ops);
    }

    /**
     * 见费出单退回组装所有交易号（包含联合单）
     */
    relFeeBackOpr(ops: any): AxiosPromise<any> {
        return post(`policy/relFeeBackOpr`, ops);
    }

    /**
     * 缴费信息登记
     */
    payConfirmInfoReistster(ops: any): AxiosPromise<any> {
        return post(`${this.payConfirmInfoRegisterUrl}`, ops);
    }

    /**
     * 缴费信息提核
     */
    payConfirmInfoSubmit(ops: any): AxiosPromise<any> {
        return post(`${this.payConfirmInfoSubmitUrl}`, ops);
    }

    /**
     * 缴费信息待审核列表查询
     */
    getPayConfirmInfoAuditList(ops: any): AxiosPromise<any> {
        return post(`${this.qryPayConfirmInfoAuditUrl}`, ops);
    }

    /**
     * 获取缴费地址
     */
    getOnlineUrl(ops: any): AxiosPromise<any> {
        return post('pay/onlinePay', ops);
    }

    /**
     * 缴费信息审核
     */
    payConfirmInfoAudit(ops: any): AxiosPromise<any> {
        return post(`${this.payConfirmInfoAuditUrl}`, ops);
    }

    /**
     * 缴费信息退回
     */
    payConfirmInfoBack(ops: any): AxiosPromise<any> {
        return post(`${this.payConfirmInfoBackUrl}`, ops);
    }

    /**
     * 加载缴费信息详情
     * @param ops
     * @returns {Observable<any>}
     */
    loadPayConfirmInfo(ops: any): AxiosPromise<any> {
        return post(`${this.loadPayConfirmInfoUrl}`, ops);
    }

    /**
     * 提交支付
     */
    submitToPay(param) {
        return post('alipay/goAlipay', { source: JSON.stringify(param) });
    }

    /**
     * 提交支付,并生成保批单
     */
    submitToPayGenerate(param) {
        return post('alipay/goAlipayGenerate', { source: JSON.stringify(param) });
    }

    /**
     * 获取保单批改次数
     */
    getEdrPrjNo(ops: any): AxiosPromise<any> {
        return post('policy/getPolicy', ops);
    }

    /**
     *
     * @param param
     */
    getPlyBaseInfoByAppNo(param) {
        return post('policy/getPlyBaseInfoByAppNo', { source: JSON.stringify(param) });
    }

    /**
     *
     * @param param
     */
    getOldPlyByPlyNo(param) {
        return post('policy/getPlyBaseInfoByAppNo', { source: JSON.stringify(param) });
    }

    /**
     * 保单团单人数获取
     */
    getGrpMemberCountByAppNo(param) {
        return post('grpmember/getGrpMemberCountByAppNo', { source: JSON.stringify(param) });
    }

    /**
     * 获取前一次批单的保单人数
     */
    getPreGrpMemberCount(param) {
        return post('grpmember/getNTgtNumFld8', { source: JSON.stringify(param) });
    }

    /**
     * 批单获取批改的团单人数
     */
    getEdrGrpMemberCount(param) {
        return post('grpmember/getEdrGrpMemberCount', { source: JSON.stringify(param) });
    }

    /**
     * 单据类型获取
     */
    getPrnType(param) {
        return post('smartbi/getPrnType', { source: JSON.stringify(param) });
    }

    /**
     * 单证打印模板获取
     */
    getPrintBeanTemplate(param) {
        return post('smartbi/getPrintBeanTemplate', { source: JSON.stringify(param) });
    }

    /**
     * 获取最小印刷号
     */
    getMinPrnNo(param) {
        return post('smartbi/getMinPrnNo', { source: JSON.stringify(param) });
    }

    /**
     * 单证预览
     */
    smartbipreview(param) {
        return post('smartbi/printView', { source: JSON.stringify(param) });
    }

    /**
     * 打印销号
     * @param param
     */
    consumePrnNo(param) {
        return post('smartbi/consumePrnNo', { source: JSON.stringify(param) });
    }

    /**
     * 获取最新申请单号
     */
    getLastAppNo(param) {
        return post('smartbi/getLastAppNo', { source: JSON.stringify(param) });
    }

    /**
     * 获取原始申请单号
     */
    getOldAppNo(param) {
        return post('smartbi/getOldAppNo', { source: JSON.stringify(param) });
    }

    /**
     * 服务卡校验
     */
    checkCard(param) {
        return post('smartbi/checkCard', { source: JSON.stringify(param) });
    }

    /**
     * @Title: 暂存单删除
     * @Description:
     * @date 2018/3/27 15:22
     * @author pfyangf@isoftstone.com
     * @params:
     */
    delTmpPolicy(ops: any): AxiosPromise<any> {
        return post(this.delTmpPolicyUrl, ops);
    }

    /**
     * @Title: 暂存组合产品申请单删除
     * @Description:
     * @date 2019-07-23 pfyangf@isoftstone.com
     * @params:
     */
    delTmpCombinaton(ops: any): AxiosPromise<any> {
        return post(`policy/delTmpCombinaton`, ops);
    }

    /**
     * 缴费类型转换
     */
    changePayType(param) {
        return post('policy/changePayType', { source: JSON.stringify(param) });
    }

    /**
     * 清空支付宝订单号
     */
    clearCBatchNo(param) {
        return post('policy/clearCBatchNo', { source: JSON.stringify(param) });
    }

    /**
     * 获取支付号
     */
    getPaymentNo(param) {
        return post('policy/getPaymentNo', { source: JSON.stringify(param) });
    }

    /**
     * 作废支付号
     */
    cancelPaymentNo(param) {
        return post('policy/cancelPaymentNo', { source: JSON.stringify(param) });
    }

    /**
     * 解除锁定
     */
    unLock(param) {
        return post('policy/unLock', { source: JSON.stringify(param) });
    }

    /**
     * 缴费类型转换前的验证
     */
    befChangeSts(param) {
        return post('policy/befChangeSts', { source: JSON.stringify(param) });
    }

    /**
     * 判断该订单号下的所有申请单是否都选中
     */
    checkBefPayOrCancelOrUnLock(param) {
        return post('policy/checkBefPayOrCancelOrUnLock', { source: JSON.stringify(param) });
    }

    /**
     * 查询支付状态
     */
    queryPaymentNo(param) {
        return post('policy/queryPaymentNo', { source: JSON.stringify(param) });
    }

    /**
     * 见费出单退回
     */
    needFeeToBack(param) {
        return post('policy/needFeeToBack', { source: JSON.stringify(param) });
    }

    /**
     * 见费出单退回车驾意删除老核心数据
     */
    deleteV6Policy(param) {
        return post('policy/deleteV6Policy', { source: JSON.stringify(param) });
    }

    /**
     * 核保信息列表
     * @param param
     * @returns {Observable<any>}
     */
    getUndrOpnList(param) {
        return post(this.getUndrOpnListUrl, { source: JSON.stringify(param) });
    }

    /**
     * 待批改单查询(保单)
     */
    qryEndorseList(ops: any): AxiosPromise<any> {
        return post(`${this.qryEndorseUrl}`, ops);
    }

    /**
     * 最新保批单列表查询
     */
    qryPolicyLatestList(ops: any): AxiosPromise<any> {
        return post(`${this.qryPolicyLatestListUrl}`, ops);
    }

    /**
     * 查询是否同步到总库
     */
    isExistInAlldb(ops: any): AxiosPromise<any> {
        return post(`${this.isExistInAlldbUrl}`, ops);
    }

    /**
     * 保单到期查询
     */
    getExpirationPolicyList(ops: any): AxiosPromise<any> {
        return post(`${this.qryExpirationPolicyUrl}`, ops);
    }

    /**
     * 查询雇主责任保批单列表
     * @param ops
     * @returns
     */
    queryEmpEPolicyList(ops: any): AxiosPromise<any> {
        return post(`${this.queryEmpEpolicyPolicyListUrl}`, ops)
    }

    /**
     * 电子保单列表查询 
     * @param ops
     * @returns
     */
    getEpolicyPolicyList(ops: any): AxiosPromise<any> {
        return post(`${this.qryEpolicyPolicyListUrl}`, ops)
    }

    /**
     * 生成电子保单
     * @param ops 
     * @returns 
     */
    generatingEPolicy(ops: any): AxiosPromise<any> {
        return post(`${this.generatingEPolicyUrl}`, ops)
    }

    /**
     * 下载电子保单
     * @param ops 
     * @returns 
     */
    downloadEPolicy(ops: any) {
        return request.post(`${this.downloadEPolicyUrl}`, ops, {
            responseType: 'blob'
        });
    }

    /**
     * 下载电子保单
     * @param ops 
     * @returns 
     */
    batchDownloadEPolicy(ops: any) {
        return request.post(`${this.batchDownloadEPolicyUrl}`, ops, {
            timeout: 120000,
            responseType: 'blob'
        });
    }

    /**
     * 操作日志查询
     */
    getDiaryList(ops: any): AxiosPromise<any> {
        return post(`${this.qryDiaryListUrl}`, ops);
    }
    /**
     * 手续费待修改列表查询
     */
    getChangeFeeList(ops: any): AxiosPromise<any> {
        return post(`${this.qryChangeFeeListUrl}`, ops);
    }

    /**
     * 加载费用信息详情
     * @param ops
     * @returns {Observable<any>}
     */
    loadFeeInfo(ops: any): AxiosPromise<any> {
        return post(`${this.loadFeeInfoUrl}`, ops);
    }

    /**
     * 修改费用信息
     */
    changeFee(param) {
        console.log(param);
        return post('edr/changeFee', param);
    }

    /**
     * 变更费用比例记录
     */
    qryChangeFeeRecord(ops: any): AxiosPromise<any> {
        return post(`${this.qryChangeFeeRecordUrl}`, ops);
    }

    /**
     * 查询历史赔案
     */
    qryHistoryClaim(ops: any): AxiosPromise<any> {
        return post(`${this.qryHistoryClaimUrl}`, ops);
    }

    /**
     * 导出历史赔案
     * @param ops
     * @returns {Observable<Blob>}
     */
    exportHistoryClaim(ops: any): AxiosPromise<any> {
        return post(`${this.expHistoryClaimUrl}`, {}, {
            params: ops,
            responseType: 'blob'
        });
    }

    /**
     * ES 被保人查询
     */
    getInsuredList(ops: any): AxiosPromise<any> {
        return post(`${this.qryInsuredListUrl}`, ops);
    }

    /**
     * Excel保单导入查询
     */
    queryExcelImpList(ops: any): AxiosPromise<any> {
        return post('policy/queryExcelImpList', ops);
    }

    /**
     * 资金到账查询
     */
    queryCapitalList(params) {
        return post('policy/queryCapitalList', params);
    }

    /**
     * 查询数据处理任务
     */
    qryTerminationDataList(ops: any): AxiosPromise<any> {
        return post(`${this.qryTerminationDataListUrl}`, ops);
    }

    /**
     * 操作数据处理开关
     */
    dealTerminationData(ops: any): AxiosPromise<any> {
        return post(`${this.dealTerminationDataUrl}`, ops);
    }

    /**
     * 根据保单号查询最新保单基础信息
     */
    getlatestPlyInfo(ops: any): AxiosPromise<any> {
        return post(`${this.getlatestPlyInfoUrl}`, ops);
    }

    /**
     * 根据保单号查询数据开关信息
     */
    qryTerminationInfo(ops: any): AxiosPromise<any> {
        return post(`${this.qryTerminationInfoUrl}`, ops);
    }

    /**
     * 获取理赔token地址
     * @param data
     */
    createClaimLink(ops: any): AxiosPromise<any> {
        return post(`${this.createClaimLinkUrl}`, ops);
    }

    /**
     * 更新相应id的资金到账信息状态为state
     * @param ops
     */
    updateFundInfoState(ops: any): AxiosPromise<any> {
        return post(`${this.updateFundInfoStateURL}`, ops);
    }

    /**
     * saveUpdateChannalState
     * @param ops
     */
    saveUpdateChannalState(ops: any): AxiosPromise<any> {
        return post(`policy/saveUpdateChannalState`, ops);
    }

    /**
     * saveUpdateChannalState
     * @param ops
     */
    saveCiPolicy(ops: any): AxiosPromise<any> {
        return post(`policy/saveCiPolicy`, ops);
    }


    // 消息信息 顶部导航喇叭
    getNotifyByReceiver(ops: any): AxiosPromise<any> {
        return post(`${this.qryNotifyByReceiver}`, ops)
    }

    // 历史赔案 年度
    qryHistoryClaimYearAll(ops: any): AxiosPromise<any> {
        return post(`${this.HistoryClaimYearAll}`, ops)
    }
    // 历史赔案 年度明细
    qryHistoryClaimYearDetail(ops: any): AxiosPromise<any> {
        return post(`${this.HistoryClaimYearDetail}`, ops)
    }
    // 历史赔案 赔案明细
    qryHistoryClaimDetail(ops: any): AxiosPromise<any> {
        return post(`${this.HistoryClaimDetail}`, ops)
    }
    // 单据打印 根据单号查询详情接口
    getAppPolicy(ops: any): AxiosPromise<any> {
        return post(`policy/getAppPolicy`, ops);
    }
    // 获取投保险种
    getCvrgByAppNo(ops: any): AxiosPromise<any> {
        return post(`policy/getCvrgByAppNo`, ops);
    }


    // 发起风勘 
    sendTaskCreat(ops: any): AxiosPromise<any> {
        return post(`risk/sendTaskCreat`, ops);
    }
    // 风勘查询
    getTaskList(ops: any): AxiosPromise<any> {
        return post(`risk/getTaskList`, ops);
    }
    // 风勘查询-获取风勘任务详情
    getTaskUrl(ops: any): AxiosPromise<any> {
        return post(`risk/getTaskUrl`, ops);
    }
    /**
     * 协议号查询
     */
    queryEcargoRelevancePolicy(ops: any): AxiosPromise<any> {
        return post(`/ecargo/queryEcargoRelevancePolicy`, ops);
    }
    /**
     * 产品编码查询
     */
    queryEcargoRelevancePolicyTermProd(ops: any): AxiosPromise<any> {
        return post(`ecargo/queryEcargoRelevancePolicyTermProd`, ops);
    }
    /**
     * 被保人查询
     */
    queryEcargoRelevancePolicyInsured(ops: any): AxiosPromise<any> {
        return post(`ecargo/queryEcargoRelevancePolicyInsured`, ops);
    }
    /**
     * 报停展期批改查询保单的保险止期
     */
    getLastInsrncEndTm(ops: any): AxiosPromise<any> {
        return post(`policy/getLastInsrncEndTm`, ops);
    }
    /**
     * 缴费通知书查询缴费期数
     */
    getgetNTms(ops: any): AxiosPromise<any> {
        return post(`smartbi/getNTms`, ops);
    }
    /**
     * 出单任务处理-询价-意见反馈保存
     */
    inquiryFeedback(ops: any): AxiosPromise<any> {
        return post(`policy/inquiryFeedback`, ops);
    }
}

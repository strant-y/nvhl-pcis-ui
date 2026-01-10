import request from '@/utils/request'
import { SCENE_EDR_APP_NEW, SCENE_PLY_APP_ADD_NORECORD } from '@/constants/tab-constants';

/**
 * 登录
 */
export class PolicyService {

    qryAppPlyUrl = '/policy/getAppPolicy';
    qryAppPolicyUrl = '/policy/getAppPolicyList';
    qryCopySrcAppPolicyUrl = '/policy/getCopySrcAppPolicyList';
    getPolicyTypeUrl = '/policy/getPolicyType'; // 获取申请单类型
    qryEndorseUrl = '/edr/qryEndorseList'; // 带批改单查询URL
    qrySysOperatorListUrl = '/rolemgr/getSysOperatorList'; // 获取操作员信息列表

    getRefCvrgByCvrgUrl = '/proddef/getRefCvrgByCvrg'; // 根据主险代码获取关联险别代码

    getPolicyListUrl = '/edr/getPolicyList'; // 保单查询 生成电子保单页面
    queryAppGrpMemberListUrl = '/epolicy/queryAppGrpMemberList'; // 团单成员
    queryTgtObjectListUrl = '/epolicy/queryTgtObjectList'; // 04成员信息

    checkFeeWindowTypeUrl = '/policy/checkFeeWindowType'; // 查看费用窗口类型
    getAppFeeInfoUrl = '/policy/getAppFeeInfo'; // 获取费用类型
    getAppFeeBetwYaicUrl = '/policy/getAppFeeBetwYaic'; // 查询手续费 区间
    getAppFeeUrl = '/policy/getAppFee'; // 根据申请单号获取费用信息
    getAppFeeInfoNewUrl = '/policy/getAppFeeInfoNew'; // 获取费用类型
    getOcFeeInfoUrl = '/policy/getOcFeeInfo'; // 获取费用类型
    getCombinationAppFee = '/policy/getCombinationAppFeeList'; // 获取组合产品费用类型
    getAppFeeBetwNewUrl = '/policy/getAppFeeBetwNew'; // 查询手续费 区间
    getIlogC1Url = '/policy/getIlogC1'; // 获取ilog原始C1
    generatelSingleNoUrl = '/policy/generatelSingleNo'; // 预生成保单号
    qryNFullExchUrl = '/policy/qryNFullExch'; // 查询历史信息(往年赔付率、满期赔付率)
    expNFullExchUrl = '/policy/expNFullExch'; // 导出历史信息(往年赔付率、满期赔付率)
    // 查询（任务轨迹）
    qryTaskVestigeUrl = '/underwriting/query/taskVestige';
    getUnbindHealthNotifyUrl = '/proddef/getUnbindHealthNotify'; // 获取待绑定健康告知列表

    selectTotalSalaryUrl = '/policy/selectTotalSalary';  //  工资总额 -- 列表
    saveTotalSalaryUrl = '/policy/saveTotalSalary'  // 工资总额 -- 保存


    /**
     * 保单保费计算
     * @param  {[type]}          policy [description]
     * @return {Observable<any>}           [description]
     */
    appCalc(policy) {
        if (policy['Base']['Base.CCardPlanNo']) {
            return request.post('/policy/calcToB', policy);
        } else {
            return request.post('/policy/calc', policy);
        }
    }

    getPlanFeeInfo(policy) {
        return request.post('/policy/getPlanFeeInfo', policy);
    }
    getCvrgFeeInfo(policy) {
        return request.post('/policy/getCvrgFeeInfo', policy);
    }

    getSrvyAgent(policy) {
        return request.post('/policy/getSrvyAgent', policy);
    }

    /**
     * 提交方案审核
     * @param policy
     */
    submitPlan(policy) {
        return request.post('/plan/submit', policy);
    }

    /**
     * 组合产品申请单保费计算
     * @param  {[type]}          policy [description]
     * @return {Observable<any>}           [description]
     */
    appCombinationCalc(policy) {
        return request.post('/policy/appCombinationCalc', policy);
    }

    /**
     * 一般批改批单保费计算
     * @param  {[type]}          policy [description]
     * @return {Observable<any>}           [description]
     */
    appCalcEdr(policy) {
        return request.post('/policy/calcEdr', policy);
    }

    /**
     * 退保注销保费计算
     * @param  {[type]}          policy [description]
     * @return {Observable<any>}           [description]
     */
    calcSurrenEdr(policy) {
        return request.post('/policy/calcSurrenEdr', policy);
    }

    /**
     * 保单保存
     * @param  {[type]}          policy [description]
     * @return {Observable<any>}           [description]
     */
    saveApplication(policy) {
        return request.post('/policy/save', policy);
    }

    /**
     * 组合产品出单保存
     * @param  {[type]}          policy [description]
     * @return {Observable<any>}           [description]
     */
    saveCombination(policy) {
        return request.post('/policy/save-combination', policy);
    }

    /**
     * 一般批改批单保存
     * @param  {[type]}          policy [description]
     * @return {Observable<any>}           [description]
     */
    saveApplicationEdr(policy) {
        return request.post('/policy/saveEdr', policy);
    }

    /**
     * 退保注销批单保存
     * @param  {[type]}          policy [description]
     * @return {Observable<any>}           [description]
     */
    saveSurrenEdr(policy) {
        return request.post('/policy/saveSurrenEdr', policy);
    }

    /**
     * 投保单申请核保
     * @param  {[type]}          policy [description]
     * @return {Observable<any>}           [description]
     */
    submitToUndr(param) {
        return request.post('/policy/submit', param);
    }

    /**
     * 组合产品投保单申请核保
     * @param  {[type]}          policy [description]
     * @return {Observable<any>}           [description]
     */
    submitCombination(param) {
        return request.post('/policy/submitCombination', param);
    }

    /**
     *
     * @param param
     */
    addCUnfixSpc(param) {
        return request.post('/policy/addCUnfixSpc', param);
    }


    /**
     * 批改单申请核保
     * @param  {[type]}          policy [description]
     * @return {Observable<any>}           [description]
     */
    submitEdrToUndr(param) {
        return request.post('/policy/submitEdr', param);
    }

    /**
     * 批改单申请核保(退保、注销)
     * @param  {[type]}          policy [description]
     * @return {Observable<any>}           [description]
     */
    submitEdrToUndrSurrender(param) {
        return request.post('/policy/submitEdrSurrender', param);
    }

    /**
     * IE退
     * @param  {[type]}          policy [description]
     * @return {Observable<any>}           [description]
     */
    ieSurrender(param) {
        return request.post('/policy/ieSurrender', param);
    }

    /**
     * 投保单核保信息 提交
     */
    submitUnderwriting(underWriteParam) {
        return request.post('/policy/undr', underWriteParam);
    }

    /**
     * 投保单核保信息 提交（方案）
     */
    submitUnderwritingPlan(underWriteParam) {
        return request.post('/policy/undrPlan', underWriteParam);
    }

    /**
     * 批单核保信息 提交
     */
    submitUnderwritingEdr(underWriteParam) {
        return request.post('/policy/undrEdr', underWriteParam);
    }
    /**
     * 强制临分
     */
    queryRiFacMrk(param) {
        return request.post('/reinsured/queryRiFacMrk', param);
    }
    /**
     * 查询临分状态
     */
    queryCRiFacMrk(param) {
        return request.post('/reinsured/queryCRiFacMrk', param);
    }
    /**
     * 查询临分状态
     */
    queryFacSts(param) {
        return request.post('/reinsured/queryFacSts', param);
    }

    /**
     * 加载投保单详细
     * @param ops
     * @returns {Observable<any>}
     */
    loadAppPly(ops) {
        let url = '';
        if (!!ops['scene'] && (SCENE_EDR_APP_NEW === ops['scene'] || SCENE_PLY_APP_ADD_NORECORD === ops['scene'])) {
            url = `/policy/getPolicy`;
        } else {
            url = `${this.qryAppPlyUrl}`;
        }
        return request.post(url, ops)

    }

    /**
     * 加载组合产品详细
     * @param ops
     * @returns {Observable<any>}
     */
    loadCombinationDetail(ops) {
        return request.post(`/policy/getCombinationDetail`, ops)

    }

    /**
     * 加载保单明细
     * @param ops
     * @returns {Observable<any>}
     */
    loadPly(ops) {
        return request.post(`/policy/getPolicy`, ops)

    }

    /**
     * 根据主险代码获取关联险别代码
     * @param ops
     * @returns {Observable<any>}
     */
    getRefCvrgByCvrg(ops) {
        return request.post(`${this.getRefCvrgByCvrgUrl}`, ops)

    }

    /**
     * 模板查询
     * @param {any} data
     * @returns {Observable<Object>}
     */
    searchTemplate(data = null) {
        return request.post('/template/list', data);
    }

    /**
     * 删除模板
     * @param cPkId
     * @returns {Observable<Object>}
     */
    deleteTemplate(cPkId) {
        return request.post('/template/delete', { cPkId: cPkId });
    }

    /**
     * 保存或修改模板
     * @param data
     * @returns {Observable<Object>}
     */
    saveOrUpdateTemplate(data) {
        return request.post('/template/save', data);
    }

    /**
     * 获取单个模板
     * @param cPkId
     * @returns {Observable<Object>}
     */
    getTemplate(cPkId) {
        return request.post('/template/get', { cPkId: cPkId });
    }

    /**
     * 投保单/保单查询
     */
    getAppPolicyList(ops) {
        return request.post(`${this.qryAppPolicyUrl}`, ops)

    }

    /**
     * 复制出单时查询源单
     */
    getCopySrcAppPolicyList(ops) {
        return request.post(`${this.qryCopySrcAppPolicyUrl}`, ops)

    }

    /**
     * 待批改单查询(保单)
     */
    qryEndorseList(ops) {
        return request.post(`${this.qryEndorseUrl}`, ops)

    }

    /**
     * @Title: 获取申请单类型
     * @Description:
     * @date 2018/3/15 16:08
     * @author pfyangf@isoftstone.com
     * @params:
     */
    getPolicyType(ops) {
        return request.post(`${this.getPolicyTypeUrl}`, ops)

    }


    /**
     * 影像信息上传
     * @param data
     * @returns {Observable<Object>}
     */
    imageInfoUpload(data) {
        return request.post(`/image/uploadDocInfo`, data);
    }

    /**
     * 影像信息预览
     * @param data
     * @returns {Observable<Object>}
     */
    imageInfoShow(data) {
        return request.post(`/image/showMainDocInfo`, data);
    }

    /**
     * 团单 保存 投保单
     * @param data
     * @returns {Observable<Object>}
     */
    grpMemberSaveApp(data) {
        return request.post(`/grpmember/saveapp`, data);
    }

    /**
     * 团单 保存 批单
     * @param data
     * @returns {Observable<Object>}
     */
    grpMemberSaveEdr(data) {
        return request.post(`/grpmember/saveedr`, data);
    }

    /**
     * 团单 list 保存 投保单
     * @param data
     * @returns {Observable<Object>}
     */
    grpMemberSaveListApp(data) {
        return request.post(`/grpmember/savelistapp`, data);
    }

    /**
     * 团单 list 保存 批单
     * @param data
     * @returns {Observable<Object>}
     */
    grpMemberSaveListEdr(data) {
        return request.post(`/grpmember/savelistedr`, data);
    }

    /**
     * 团单 列表 查询
     * @param data
     * @returns {Observable<Object>}
     */
    grpMemberList(data) {
        return request.post(`/grpmember/list`, data);
    }
    /**
     * 本次批改团单 列表 查询
     * @param data
     * @returns {Observable<Object>}
     */
    queryEdrGrpmemberList(data) {
        return request.post(`/grpmember/queryEdrGrpmemberList`, data);
    }

    /**
     * 团单 列表 查询
     * @param data
     * @returns {Observable<Object>}
     */
    grpMemberPlanCount(data) {
        return request.post(`/grpmember/getPlanCount`, data);
    }

    /**
     * 团单 列表 查询
     * @param data
     * @returns {Observable<Object>}
     */
    grpMemberNum(data) {
        return request.post(`/grpmember/grpmembernum`, data);
    }

    /**
     * 根据id获取团单成员的变更记录
     * @param data
     * @returns {Observable<Object>}
     */
    getMemberHistoryById(data) {
        return request.post(`/grpmember/get-member-history-by-id`, data);
    }

    /**
     * 团单下载
     * @param data
     * @returns {Observable<Blob>}
     */
    excelChannalDown(data) {
        return request.post(`/excel/channalDown`, data, {
            params: data,
            responseType: 'blob'
        });
    }

    /**
     * 团单下载
     * @param data
     * @returns {Observable<Blob>}
     */
    excelDown(data) {
        return request.post(`/excel/write`, data, {
            params: data,
            responseType: 'blob'
        });
    }

    searchFileDown(data) {
        return request.post(`/excel/searchFileDown `, data, {
            responseType: 'blob'
        });
    }

    ieQueryFileDown(data) {
        return request.post(`/excel/ieQueryFileDown`, data, {
            params: data,
            responseType: 'blob'
        });
    }
    /**
     * 团单下载(配置模板)
     * @param data
     * @returns {Observable<Blob>}
     */
    excelDownload(data) {
        return request.post(`/grpmember/write`, {}, {
            params: data,
            responseType: 'blob'
        });
    }

    /**
     * 电子保单下载
     * @param data
     * @returns {Observable<Blob>}
     */
    downloadData(data) {
        return request.post(`/epolicy/downloadData`, {}, {
            params: data,
            responseType: 'blob'
        });
    }
    downloadElePolicy(data) {
        return request.post(`/epolicy/downloadElePolicy`, {}, {
            params: data,
            responseType: 'blob'
        });
    }

    downElectronicPolicy(data) {
        return request.post(`/epolicy/downElectronicPolicy`, data);
    }

    generatElecInvoice(data) {
        return request.post(`/epolicy/generatElecInvoice`, data);
    }

    /**
     * 验证电子发票是否生成
     * @param data
     */
    validEleInvoiceFile(data) {
        return request.post(`/epolicy/validEleInvoiceFile`, data);
    }

    /**
     * 下载电子发票
     * @param data
     */
    downloadElecInvoice(data) {
        return request.post(`/epolicy/downloadElecInvoice`, data, {
            responseType: 'blob'
        });
    }

    /**
     * 获取批次信息
     * @param data
     * @returns {Observable<Object>}
     */
    getBatchInfo(data) {
        return request.post(`/grpmember/get-batch-info`, data);
    }

    /**
     * 保存方案
     * @param data
     * @returns {Observable<Object>}
     */
    saveOrUpdatePlan(data) {
        return request.post('/plan/savePlanBase', data);
    }

    /**
     * 保存方案(险别信息)
     * @param data
     * @returns {Observable<Object>}
     */
    savePlanCvrg(data) {
        return request.post('/plan/savePlanCvrg', data);
    }

    /**
     * 查询方案列表
     * @param {any} data
     * @returns {Observable<Object>}
     */
    searchPlan(data = null) {
        return request.post('/plan/getPlanBasePage', data);
    }

    /**
     * 查询方案详情
     * @param {any} data
     * @returns {Observable<Object>}
     */
    getPlanBase(data = null) {
        return request.post('/plan/getPlanBase', data);
    }

    /**
     * 查询方案详情险别信息
     * @param {any} data
     * @returns {Observable<Object>}
     */
    getPlanCvrg(data = null) {
        return request.post('/plan/getPlanCvrg', data);
    }

    /**
     * 方案提交审核
     * @param {any} data
     * @returns {Observable<Object>}
     */
    addProcessUndr(data = null) {
        return request.post('/plan/addProcessUndr', data);
    }
    /**
     * 方案接收
     * @param {any} data
     * @returns {Observable<Object>}
     */
    accept(data = null) {
        return request.post('/plan/accept', data);
    }

    /**
     * 方案取消接收
     * @param {any} data
     * @returns {Observable<Object>}
     */
    unAccept(data = null) {
        return request.post('/plan/unAccept', data);
    }

    /**
     * 方案审核
     * @param {any} data
     * @returns {Observable<Object>}
     */
    processApprove(data = null) {
        return request.post('/plan/processApprove', data);
    }

    /**
     * 方案审核列表查询
     * @param {any} data
     * @returns {Observable<Object>}
     */
    qryUndrPlanBaseList(data = null) {
        return request.post('/plan/qryUndrPlanBaseList', data);
    }
    
     /**
     * 保存公式信息
     * @param {any} data
     * @returns {Observable<Object>}
     */
    //  
    savePlanCvrgFormula(data = null) {
        return request.post('/plan/savePlanCvrgFormula', data);
    }


        /**
     * 功能描述: 获取方案关联公式信息
     *  
     *  
     */
    getPlanCvrgFormulaInfo(data = null) {
        return request.post('plan/getPlanCvrgFormulaInfo', data);
    }

    /**
     * 关联方案--根据主键删除公式表 
     * 
     */
    deleteFormulaById(data = null) {
        return request.post('plan/deleteFormulaById', data);
    }

      /**
     * 关联方案--根据方案号山删除全部 公式表 
     * 
     */

      deleteCvrgFormulaByPlanNo(data = null) {
        return request.post('plan/deleteCvrgFormulaByPlanNo', data);
        
      }
       


    /**
     * 修改方案状态
     * @param {any} data
     * @returns {Observable<Object>}
     */
    updatePlanStatus(data) {
        return request.post('/plan/updatePlanStatusByCPlanNo', data);
    }

    /**
     * 获取单个方案
     * @param cPkId
     * @returns {Observable<Object>}
     */
    getPlan(cPkId) {
        return request.post('/plan/get', { cPkId: cPkId });
    }

    /**
     * 获取单个方案
     * @param cPkId
     * @returns {Observable<Object>}
     */
    getPlanByNo(CPlanNo) {
        return request.post('/plan/getByCPlanNo', { CPlanNo: CPlanNo });
    }

    /**
     * 查询方案列表
     * @param {any} data
     * @returns {Observable<Object>}
     */
    searchPlanPolicy(data = null) {
        return request.post('/plan/listByDptCde', data);
    }

    /**
     * 查询外部方案列表
     * @param {any} data
     * @returns {Observable<Object>}
     */
    searchOutPlanPolicy(data = null) {
        return request.post('/plan/listByDptUser', data);
    }


    /**
     * 删除方案
     * @param cPkId
     * @returns {Observable<Object>}
     */
    deletePlan(cPkId) {
        return request.post('/plan/delete', { cPkId: cPkId });
    }

    /**
     * 保单保存
     * @param  {[type]}          policy [description]
     * @return {Observable<any>}           [description]
     */
    planSaveApplication(policy) {
        return request.post('/policy/savePlan', policy);
    }

    /**
     * 保单保存多条 一步出单
     * @param  {[type]}          policy [description]
     * @return {Observable<any>}           [description]
     */
    planListSaveApplication(policy) {
        return request.post('/plan/save/list', policy);
    }

    /**
     * 查询方案导入信息列表
     * @param {any} data
     * @returns {Observable<Object>}
     */
    searchBatch(data = null) {
        return request.post('/plan/batch/list', data);
    }

    /**
     * 根据申请单号获取保单基本信息
     * @param ops
     * @returns {Observable<any>}
     */
    getBaseInfoByAppNo(ops) {
        return request.post('policy/getBaseInfoByAppNo', ops)

    }

    /**
     * 文件下载
     * @param data
     * @returns {Observable<HttpResponse<Blob>>}
     */
    imageInfoDown(data) {
        return request.get(`/file/down`, {
            params: data || {},
            responseType: 'blob',
            observe: 'response'
        });
    }

    /**
     * 本周出单统计
     * @param ops
     * @returns {Observable<Object>}
     */
    countPolicyThisWeek(ops) {
        return request.post('policy/countPolicyThisWeek', ops);
    }


    /**
     * 获取操作员信息列表
     * @param data
     * @returns {Observable<any>}
     */
    getUserList(data) {
        return request.post(`${this.qrySysOperatorListUrl}`, data);
    }


    /**
     * 费用信息保存
     * @param data
     * @returns {Observable<Object>}
     */
    feeInfoSave(data) {
        return request.post(`/policy/feeInfoSave`, data);
    }

    /**
     * 费用信息 列表查询
     * @param data
     * @returns {Observable<Object>}
     */
    feeInfoList(data) {
        return request.post(`/policy/feeInfoList`, data);
    }


    /**
     * 方案配置列表
     * @param cPkId
     * @returns {Observable<Object>}
     */
    getUsrPlan(data) {
        return request.post('/usrPlan/list', data);
    }

    /**
     * 方案配置保存
     * @param cPkId
     * @returns {Observable<Object>}
     */
    saveUsrPlan(data) {
        return request.post('/usrPlan/save', data);
    }

    /**
     * 方案配置删除
     * @param cPkId
     * @returns {Observable<Object>}
     */
    deleteUsrPlan(cPkId) {
        return request.post('/usrPlan/delete', { cPkId: cPkId });
    }

    /**
     * 根据选择的代理协议获取手续费率上下限
     * @param ops
     * @returns {Observable<Object>}
     */
    getAppFeeBetw(ops) {
        return request.post('policy/getAppFeeBetw', ops);
    }

    /**
     * 根据产品、机构获取见费出单配置信息  暂停使用
     * @param ops
     * @returns {Observable<Object>}
     */
    init_isJfcd(ops) {
        return request.post('policy/isGotoPayseemoney', ops);
    }
    /**
     * 根据产品、机构获取见费出单配置信息
     * @param ops
     * @returns {Observable<Object>}
     */
    loadProdRuleInfoByDptCde(ops) {
        return request.post('proddef/loadProdRuleInfoByDptCde', ops);
    }

    // ------- 人员清单 ------- //
    getMemberPageData(ops) {
        return request.post('member/load-member-page-data', ops);
    }

    getMemberViewData(ops) {
        return request.post('member/load-member-view-data', ops);
    }

    saveMemberData(ops) {
        return request.post('member/save-member-data', ops);
    }


    // voucherList
    saveVoucherMemberData(ops) {
        return request.post('vouchermember/save-member-data', ops);
    }
    getVoucherMemberPageData(ops) {
        return request.post('vouchermember/load-member-page-data', ops);
    }

    deleteVoucherByCPkId(ops) {
        return request.post('vouchermember/deleteByCPkId', ops);
    }

    delVoucherListByCAppNo(ops) {
        return request.post('vouchermember/delTgtObjByCAppNo', ops);
    }


    deleteMemberData(ops) {
        return request.post('member/delete-member-data', ops);
    }

    deleteByCPkId(ops) {
        return request.post('member/deleteByCPkId', ops);
    }

    delTgtObjByCAppNo(ops) {
        return request.post('member/delTgtObjByCAppNo', ops);
    }

    generatingEPolicy(ops) {
        return request.post('epolicy/generatingEPolicy', ops);
    }

    generatingGrpEPolicy(ops) {
        return request.post('epolicy/generatingGrpEPolicy', ops);
    }

    validDownloadEPolicy(ops) {
        return request.post('epolicy/validDownloadEPolicy', ops);
    }

    downloadTemplate(ops) {
        return request.post(`/member/download`, ops, {
            responseType: 'blob'
        });
    }

    getEpolicyPolicyList(ops) {
        return request.post(`${this.getPolicyListUrl}`, ops)

    }

    queryAppGrpMemberList(ops) {
        return request.post(`${this.queryAppGrpMemberListUrl}`, ops)

    }

    queryTgtObjectList(ops) {
        return request.post(`${this.queryTgtObjectListUrl}`, ops)

    }


    /**
     * 保存共保客户信息
     * @param ops
     * @returns {Observable<Object>}
     */
    saveCiCoinsurer(ops) {
        return request.post('ci/save-ci-coinsurer', ops);
    }

    /**
     * 根据证件类型，证件号码获取ECIF共保数据
     * @param ops
     * @returns {Observable<Object>}
     */
    getCiCoinsurerByECIF(ops) {
        return request.post('ci//get-ci-coinsurer-byEcif', ops);
    }
    /**
     * 根据证件类型，证件号码获取共保数据
     * @param ops
     * @returns {Observable<Object>}
     */
    getCiCoinsurerByCertf(ops) {
        return request.post('ci/get-ci-coinsurer-by-certf', ops);
    }

    /**
     * 根据参数类型代码获取静态字典值
     * @param ops
     * @returns {Observable<Object>}
     */
    getSysStaDictCdeByParCde(ops) {
        return request.post('codelist/getSysStaDictCdeByParCde', ops);
    }

    checkFeeWindowType(ops) {
        return request.post(`${this.checkFeeWindowTypeUrl}`, ops)

    }

    getAppFeeInfo(ops) {
        return request.post(`${this.getAppFeeInfoUrl}`, ops)

    }

    getAppFeeBetwYaic(ops) {
        return request.post(`${this.getAppFeeBetwYaicUrl}`, ops)

    }

    getAppFee(ops) {
        return request.post(`${this.getAppFeeUrl}`, ops)

    }

    getAppFeeInfoNew(ops) {
        return request.post(`${this.getAppFeeInfoNewUrl}`, ops)

    }

    /**
     * 开口保单费用信息
     * @param ops
     */
    getOcFeeInfoNew(ops) {
        return request.post(`${this.getOcFeeInfoUrl}`, ops)

    }

    /**
     * 组合产品获取费用信息
     * @param ops
     */
    getCombinationAppFeeList(ops) {
        return request.post(`${this.getCombinationAppFee}`, ops)

    }

    getAppFeeBetwNew(ops) {
        return request.post(`${this.getAppFeeBetwNewUrl}`, ops)

    }
    getIlogC1(ops) {
        return request.post(`${this.getIlogC1Url}`, ops)

    }
    saveAppFeeInfo_new(ops) {
        return request.post(`/policy/saveAppFeeInfo_new`, ops)

    }
    saveCvrgAppFeeInfo(ops) {
        return request.post(`/policy/saveCvrgAppFeeInfo`, ops)

    }
    checkAppFeeInfo_new(ops) {
        return request.post(`/policy/checkAppFeeInfo_new`, ops)

    }

    saveOcFeeInfo(ops) {
        return request.post(`/policy/saveOcFeeInfo`, ops)

    }

    saveAppFeeInfo(ops) {
        return request.post(`/policy/saveAppFeeInfo`, ops)

    }

    updateIIogFee(ops) {
        return request.post(`/policy/updateIIogFee`, ops)

    }

    genCusConInfoBusinessList(ops) {
        return request.post(`/policy/genCusConInfoBusinessList`, ops)

    }

    getFamilyInfo(ops) {
        return request.post(`/policy/getFamilyInfo`, ops)

    }

    /**
     * 核保员查询客户信息
     * @param ops
     */
    getCusConInfoBusinessList(ops) {
        return request.post(`/policy/getCusConInfoBusinessList`, ops)

    }

    getRelationDataInfo(ops) {
        return request.post(`/policy/getRelationDataInfo`, ops)

    }

    detectCustomer(ops) {
        return request.post(`/policy/detectCustomer`, ops)

    }

    saveExcelInfo(ops) {
        return request.post(`/grpmember/saveExcelInfo`, ops)

    }
    generatelSingleNo(ops) {
        return request.post(`${this.generatelSingleNoUrl}`, ops)

    }

    saveTaxInfo(data) {
        console.log('保存投保单的发票信息' + data);
        return request.post('/policy/saveTaxInfo', data);
    }

    getTaxInfoByAppNo(appNo) {
        return request.post('/policy/getTaxInfoByAppNo', {
            'CAppNo': appNo
    });
    }

/**
 * 根据申请单号获取发票信息数量
 * @param appNo
 */
// getTaxInfoNumByAppNo(appNo) {
//     return request.post('/policy/getTaxInfoNumByAppNo',  {
//             'CAppNo': appNo});
// }

/**
 * 反洗钱校验
 * @param appNo
 */
validateAML(param) {
    return request.post('/policy/validateAml', param);
}

/**
 * 保存反洗钱扩展信息
 * @param data
 */
saveAMLExtendInfo(data) {
    console.log('保存反洗钱扩展信息' + data);
    return request.post('/policy/saveAMLExtendInfo', data);
}
 

// 反洗钱扩展信息查询  投保人 被保人通用
getAMLExtendInfoByAppNo(ops) {
    return request.post('/policy/getAMLExtendInfoByAppNo', ops);
}

// 反洗钱受益人所有人信息 table
getAMLCusBnfcInfoByAppNo(ops) {
    return request.post('/policy/getAMLCusBnfcInfoByAppNo', ops);
}

/**
 * 获取反洗钱黑名单信息
 * @param appNo
 */
getAmlBlackListByAppNo(appNo: string) {
    return request.post('/policy/getAmlBlackListByAppNo', {
        'CAppNo': appNo
    })
}

/***
 * 注销 退保条件下 查询反洗钱客户信息页面信息
 * @param edrAppNo
 */
getAMLInsOrAppInfoByAppNo(edrAppNo: string) {
    return request.post('/policy/getAMLInsOrAppInfoByAppNo', {
        'CAppNo': edrAppNo
    });
}

/**
 * 获取有效投保单数量
 * @param appNo
 */
getValidPlyCount(data) {
    return request.post('/policy/getValidPlyCount', data);
    }

/**
 * 根据团单成员获取团单有效投保单数量
 * @param appNo
 */
getGroupValidPlyCount(data) {
    return request.post('/policy/getGroupValidPlyCount', data);
    }

/**
 * 查询历史信息(往年赔付率、满期赔付率)
 * @param ops
 * @returns {Observable<any>}
 */
qryNFullExch(ops) {
    return request.post(`${this.qryNFullExchUrl}`, ops)

}

/**
 * 导出历史信息(往年赔付率、满期赔付率)
 * @param ops
 * @returns {Observable<Blob>}
 */
exportFullExch(ops) {
    return request.post(`${this.expNFullExchUrl}`, ops, {
        params: ops,
        responseType: 'blob'
    });
}

/**
 *  查询风险信息
 * @param param
 */
getSCPlatRiskQust(param) {
    return request.post('policy/getSCplatRiskQust', param);
}

/**
 * 校验反洗钱身份证有效期
 * @param param
 */
checkCusExtendInfo(param) {
    return request.post('policy/checkCusExtendInfo', param);
}


/**
 * 判断投保人或者被保人姓名是否在恐怖组织名单表中存在
 * @param param
 */
checkBelongToTerrorist(param) {
    return request.post('policy/checkBelongToTerrorist', param);
}

/**
 * 判断是否高风险国家
 * @param param
 */
checkBelongToRiskCountry(param) {
    return request.post('policy/checkBelongToRiskCountry', param);
}

/**
 *  山东平台团单风险信息查询
 * @param param
 */
getSDplatRiskQust(param) {
    return request.post('policy/getSDplatRiskQust', param);
}

/**
 * 代理人员、业务人员查询
 * @param ops
 * @returns {Observable<any>}
 */
getWebOrgSelsList(ops) {
    return request.post(`/policy/getWebOrgSelsList`, ops)

}

/**
 * 申请核保获取风险信息
 * @param ops
 */
getRiskWarnList(ops) {
    return request.post(`/policy/getRiskWarnList`, ops)

}

/**
 * 代理人员、业务人员查询（商品）
 * @param ops
 * @returns {Observable<any>}
 */
getWebOrgSelsListForCommodity(ops) {
    return request.post(`/policy/getWebOrgSelsListForCommodity`, ops)

}

// 查询 （任务轨迹）
getTaskVestige(ops) {
    return request.post(`${this.qryTaskVestigeUrl}`, { params: ops })

}

// 根据保单号查询原始申请单号
getCAppNoByPlyNo(ops) {
    return request.post(`/policy/getCAppNoByPlyNo`, ops)

}

// 根据产品编号查出产品大类后面文字
getcategory(ops) {
    return request.post(`/proddef/get`, ops)

}



/**
 *  获取顶级机构节点
 * @param ops
 * @returns {Observable<any>}
 */
getOrgDptTreeNodeById(ops) {
    return request.post(`/rolemgr/getOrgDptTreeNodeById`, ops)
}

/**
 *  根据机构id获取下级机构列表
 * @param ops
 * @returns {Observable<any>}
 */
getOrgDptTreeListByPid(ops) {
    return request.post(`/rolemgr/getOrgDptTreeListByPid`, ops)
}

/**
 * 获取产品健康告知列表
 * @param ops
 * @returns {Observable<any>}
 */
getUnbindHealthNotify(ops) {
    return request.post(`${this.getUnbindHealthNotifyUrl}`, ops)

}

/**
 * 根据保单号获取影像上传方式
 * @param CPlyNo
 */
getImageUploadModeByPlyNo(data) {
    return request.post('/policy/getImageUploadModeByPlyNo', data);
    }

/**
 * 根据保单号修改影像上传方式
 * @param CPlyNo
 */
updateImageUploadModeByPlyNo(data) {
    return request.post('/policy/updateImageUploadModeByPlyNo', data);
    }

// 根据申请单号查询部分投保单基本信息
qryAppBaseInfoByAppNo(ops) {
    return request.post(`/policy/qryAppBaseInfoByAppNo`, ops)

}
/**
 * 判断投保人是否存量客户
 * @param param
 */
validateStockCus(param) {
    return request.post('policy/validateStockCus', param);
}

/**
 * 团单 删除
 * @param data
 * @returns {Observable<Object>}
 */
grpMemberDelete(data) {
    return request.post(`/grpmember/delete`, data);
}

/***
 * 删除全部人员清单
 * @param appNo
 */
deleteAll(data) {
    return request.post(`/grpmember/deleteAll`, data);
}


/**
 * 判断产品是否配置倒签规则
 * @param param
 * cProdNo 产品号
 * tInsrncBgnTm 保险起期
 */
getProdBackdating(param) {
    return request.post('policy/getProdBackdating', param);
}

/**
 * 批单随原保单临分时核保通过调用临分提交
 * @param param
 */
checkLiberty(ops) {
    return request.post('reinsured/checkLiberty', ops);
}

/**
 * 校验批单与原单险别应免税
 * @param param
 */
validateEdrCvrgIsTax(param) {
    return request.post('/policy/validateEdrCvrgIsTax', param);
}

/**
 * 校验临分批单是否存在临分信息
 * @param param
 */
validateEdrRiInfo(appNo) {
    return request.post('/policy/validateEdrRiInfo', {
        'CAppNo': appNo
    })
    }

/**
 * 电子报价单保单下载
 * @param data
 * @returns {Observable<Blob>}
 */
downloadEcargoData(data) {
    return request.post(`/epolicy/downloadEcargoData`, {}, {
        params: data,
        responseType: 'blob'
    });
}

savePolicyExtInfo(appNo) {
    return request.post('/policy/savePolicyExtInfo', {
        'CAppNo': appNo
    })
    }

queryCSaleGrpNme(CAppNo) {
    return request.post('/policy/queryExtInfo', {
        'CAppNo': CAppNo
    });
}
validateAllAmtPrm(CAppNo, nAmt, nPrm) {
    return request.post('/policy/validateAllAmtPrm', {
        'cAppNo': CAppNo,
        'nAmt': nAmt,
        'nPrm': nPrm,
    });
}

/**
 * 查询门店编码-根据渠道编码获得
 * @param CChaCde
 * @returns {Observable<Blob>}
 */
queryCDptCdeOld(CChaCde) {
    return request.post('/policy/queryCDptCdeOld', {
        'CChaType': CChaCde
    });
}

/**
 * 保存门店编码
 * @param CDptCdeOld
 * @returns {Observable<Blob>}
 */
saveCDptCdeOld(CDptCdeOld, CAppNo) {
    return request.post('/policy/saveCDptCdeOld', {
        'CDptCdeOld': CDptCdeOld,
        'CAppNo': CAppNo
    });
}
/**
 *
 * @param param
 */
saveSignOut(ops) {
    return request.post('plan/saveSignOut', ops);
}

validateToUndrSignCom(param) {
    return request.post('/policy/validateToUndrSignCom', param)
}

signSubmitInfo(policy) {
    return request.post('/policy/signSubmitInfo', policy);
}

submitCombinationPlan(policy) {
    return request.post('/plan/submitCombinationPlan', policy);
}

getRiInfoByPlanNo(policy) {
    return request.post('/plan/getRiInfoByPlanNo', policy);
}

/**
 * 投保单核保信息 提交
 */
undrCombinationPlan(underWriteParam) {
    return request.post('/policy/undrCombinationPlan', underWriteParam);
}

/**
 * 获取险别的年龄限制
 * @param  {[type]}          policy [description]
 * @return {Observable<any>}           [description]
 */
getInsuredAge(param) {
    return request.post('/policy/getInsuredAge', param)
}

/**
 * 投保单校验
 * @param  {[type]}          policy [description]
 * @return {Observable<any>}           [description]
 */
validateToUndr(param) {
    return request.post('/policy/validate', param)

}

/**
 * 影像上传
 * @param ops
 * @returns {Observable<Object>}
 */
uploadImages(data) {
    return request.post('appbiz/uploadImages', data);
}

/**
 * 获取问题人员清单记录
 * @param data
 * @returns {Observable<Object>}
 */
getIssuesList(data) {
    return request.post(`/policy/getIssuesList`, data);
}

/**
 * 保单保存
 * @param  {[type]}          policy [description]
 * @return {Observable<any>}           [description]
 */
saveCombinationPlan(policy) {
    return request.post('/policy/saveCombinationPlan', policy);
}

/**
 * 家庭成员信息查询
 * @param data
 * @returns {Observable<Object>}
 */
getFamilyList(data) {
    return request.post('grpmember/getFamilyList', data);
}
/**
 * 新增家庭成员信息
 * @param data
 * @returns {Observable<Object>}
 */
saveFamilyInfo(data) {
    return request.post('grpmember/saveFamilyInfo', data);
}
/**
 * 删除家庭成员信息
 * @param data
 * @returns {Observable<Object>}
 */
deleteFamilyInfo(data) {
    return request.post('grpmember/deleteFamilyInfo', data);
}

//获取总保额总保费
getNPrmNAmtOfSum(param) {
    return request.post('/policy/getNPrmNAmtOfSum', param);
}

//获取产品功能状态
getProdFunInfo(param){
    return request.post('/proddef/getProdFunInfo', param);
}
//清单全量模板下载
downloadDistTemplate(data) {
  return request.post(`/policy/downloadDistTemplate`, data, {
      responseType: 'blob'
  });
}
//联共保信息模板下载
downloadCiTemplate(data) {
  return request.post(`/policy/downloadCiTemplate`, data, {
      responseType: 'blob'
  });
}
//清单增量模板下载
downloadDistTemplateIncrement(data) {
    return request.post(`/policy/downloadDistTemplateIncrement`, data, {
        responseType: 'blob'
    });
}
//清单导出
exportDist(data) {
  return request.post(`/policy/exportDist`, data, {
      responseType: 'blob'
  });
}
//清单增量导入
importDist(data) {
    return request.post(`/policy/importDist`, data);
}
//清单全量导入
importDistIncrement(param){
    return request.post('/policy/importDistIncrement', param);
}
//联共保信息导入
importCi(param){
	return request.post('/policy/importCi', param);
}
listImage(data) {
    return request.post('image/listImage', data);
}

// 获取销售区域清单汇总数据
getEstimatedSalesAndEstimatedSalesQuantity(param){
    return request.post('/policy/getEstimatedSalesAndEstimatedSalesQuantity', param);
}

// 删除险位
delRisk(param){
    return request.post('/reinsured/delRisk', param);
}

/**
 * 查询临分状态-询价核保
 */
queryCRiFacMrkXJ(param) {
    return request.post('/reinsured/queryCRiFacMrkXJ', param);
}

/**
 * 强制临分-询价
 */
queryRiFacMrkXJ(param) {
    return request.post('/reinsured/queryRiFacMrkXJ', param);
}

/**
 * 查询临分状态-询价
 */
queryFacStsXJ(param) {
    return request.post('/reinsured/queryFacStsXJ', param);
}

// 删除险位-询价
delRiskXJ(param){
    return request.post('/reinsured/delRiskXJ', param);
}

/**
 * 批单随原保单临分时核保通过调用临分提交-询价
 * @param param
 */
checkLibertyXJ(ops) {
    return request.post('reinsured/checkLibertyXJ', ops);
}

/**
 * 出单下一步前校验接口
 * @param param
 */
queryProdDptCde(ops) {
    return request.post('/policy/queryProdDptCde', ops);
}

/**
 * 缴费计划导出
 * @param ops
 */
exportWebappPayToExcel(data) {
  return request.post(`/query/exportWebappPayToExcel`, data, {
      responseType: 'blob'
  });
}


// 工资总额列表
selectTotalSalary(data) {
    return request.post(`${this.selectTotalSalaryUrl}`, data);
  }
// 工资总额-保存
saveTotalSalary(data) {
    return request.post(`${this.saveTotalSalaryUrl}`, data);
}
	
// 个人代理查询业务员信息
getPrivateSelsList(data) {
	return request.post(`/policy/getPrivateSelsList`, data);
	}
	
// 协议出单下一步校验协议号
queryECargoPayString(ops) {
	return request.post(`/payment/queryECargoPayString`, ops)
}
// // 工资总额-
// selectTotalSalary(data) {
//     return request.post(`${this.selectTotalSalaryUrl}`, data);
//   }
}

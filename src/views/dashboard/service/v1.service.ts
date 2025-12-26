import request from "@/utils/request";

export class PcisQueryService {

    qryPolicyShortUrl = '/policy/getPolicyShortList';
    qryNotifyByReceiver = '/notify/getNotifyByReceiver';
    changeStatusUrl = 'notify/changeStatus'; 
    qryNewUdrListUrl = 'task/getPendingTask';
    queryBackUdrListUrl = 'underwriting/query/backUdrList';
    qryAppPolicyUrl = 'policy/getAppPolicyList';
    

     /**
     * 本周出单统计
     * @param ops
     * @returns {Observable<Object>}
     */
     countPolicyThisWeek(ops) {
        return request.post('/policy/countPolicyThisWeek', ops);
    }
    /**
     * 首页暂存，待修改单，待核保单查询
     */
    getPolicyShortList(ops) {
        return request.post(`${this.qryPolicyShortUrl}`, ops)
    }

    // 变革已读/未读状态
    changeStatus(ops) {
        return request.post(`${this.changeStatusUrl}`, ops)
    }

    
    // 消息信息 顶部导航喇叭
    getNotifyByReceiver(ops){
        return request.post(`${this.qryNotifyByReceiver}`,ops)
    }
		
		// 公告信息 顶部导航喇叭
    getBulletinByUserAndDpt(ops){
        return request.post(`bulletin/getBulletinByUserAndDpt`,ops)
    }
    
    /**
     * 待核保查询-核保岗
     */
    getNewUdrList(ops: any) {
        return request.post(`${this.qryNewUdrListUrl}`, ops);
    }

    /**
     * 暂存查询-核保岗
     */
    getDraftTask(ops: any) {
        return request.post(`task/getDraftTask`, ops);
    }
    
    /**
     * 核保退回查询-核保岗
     */
    getReturnedTask(ops: any) {
        return request.post(`task/getReturnedTask`, ops);
    }
    
    /**
     * 核保通过查询-核保岗
     */
    getApprovedTask(ops: any): AxiosPromise<any> {
        return request.post(`task/getApprovedTask`, ops);
    }

    /**
     * 暂存任务-出单岗
     */
    selectDraftTask(ops: any) {
        return request.post(`task/selectDraftTask`, ops);
    }

    /**
     * 已提交任务-出单岗
     */
    selectSubmittedTask(ops: any) {
        return request.post(`task/selectSubmittedTask`, ops);
    }

    /**
     * 待修改任务-出单岗
     */
    selectPendingModificationTask(ops: any) {
        return request.post(`task/selectPendingModificationTask`, ops);
    }

    /**
     * 待缴费任务-出单岗
     */
    selectPendingPaymentTask(ops: any) {
        return request.post(`task/selectPendingPaymentTask`, ops);
    }

    /**
     * 待续保任务-出单岗
     */
    selectPendingRenewalTask(ops: any) {
        return request.post(`task/selectPendingRenewalTask`, ops);
    }
}

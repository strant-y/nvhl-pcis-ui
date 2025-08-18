import request from "@/utils/request";

export class PcisQueryService {

    qryPolicyShortUrl = '/policy/getPolicyShortList';
    qryNotifyByReceiver = '/notify/getNotifyByReceiver';
    changeStatusUrl = 'notify/changeStatus'; 
    qryNewUdrListUrl = 'underwriting/query/newUdrList';
    queryBackUdrListUrl = 'underwriting/query/backUdrList';
    

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
    
    /**
     * 待核保查询，暂存查询
     */
    getNewUdrList(ops: any) {
        return request.post(`${this.qryNewUdrListUrl}`, ops);
    }
    
    /**
     * 核保退回查询
     */
    getBackUdrList(ops: any) {
        return request.post(`${this.queryBackUdrListUrl}`, ops);
    }
}

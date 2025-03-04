import request from "@/utils/request";

export class PcisQueryService {

    qryPolicyShortUrl = '/policy/getPolicyShortList';
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
}

import request from '@/utils/request';

/**
 * 批改相关查询服务
 */
export class PcisEdrQueryService {

    qryEndorseUrl = '/edr/qryEndorseList'; // 待批改单查询URL
    validEndorseUrl = '/edr/validEndorse'; // 批改前的验证
    validAddRecordUrl = '/edr/validAddRecord'; // 补录前的验证
    validAddNoRecordUrl = '/edr/validAddNoRecord'; // 补录前的验证
    findTInsrncBgnTmUrl = '/edr/findTInsrncBgnTm'; // 不记名补录前的时间查询


    /**
     * 待批改单查询
     */
    qryEndorseList(ops) {
        return request.post(`${this.qryEndorseUrl}`, ops)
    }

    /**
     * 补录前的验证
     */
    validAddRecord(ops) {
        return request.post(`${this.validAddRecordUrl}`, {source: JSON.stringify(ops)})
    }

    /**
     * 不记名补录前的验证
     */
    validAddNoRecord(ops) {
        return request.post(`${this.validAddNoRecordUrl}`, {source: JSON.stringify(ops)})
    }

    /**
     * 批改前的验证
     */
    validEndorse(ops) {
        return request.post(`${this.validEndorseUrl}`, {source: JSON.stringify(ops)})
    }

    findTInsrncBgnTm(ops) {
        return request.post(`${this.findTInsrncBgnTmUrl}`, {source: JSON.stringify(ops)})
    }
}

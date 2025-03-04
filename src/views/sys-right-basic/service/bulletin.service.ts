import request from "@/utils/request";

export class BulletinService {

    queryBulletinListUrl = '/bulletin/queryBulletinList'; // 获取公告列表
    deleteBulletinUrl = '/bulletin/deleteBulletin'; // 删除公告
    saveBulletinUrl = '/bulletin/saveBulletin'; // 保存公告
    getBulletinInfoUrl = '/bulletin/getBulletinInfo'; // 获取公告
    changeBulletinStatusUrl = '/bulletin/changeBulletinStatus'; // 变更公告状态

    queryIntegralRuleListUrl = '/IntegralRule/getIntegralRuleList'; // 查询积分规则列表
    saveIntegralRuleUrl = '/IntegralRule/editIntegralRuleInfo'; // 保存积分规则
    queryIntegralEquityListUrl = '/IntegralEquity/getIntegralEquityList'; // 查询积分权益列表
    saveIntegralEquityUrl = '/IntegralEquity/editIntegralEquityInfo'; // 保存积分权益


    // 获取积分规则列表
    queryIntegralRuleList(ops) {
        return request.post(`${this.queryIntegralRuleListUrl}`, ops)
            
    }
    // 保存积分规则
    saveIntegralRule(ops) {
        return request.post(`${this.saveIntegralRuleUrl}`, ops)
            
    }
    // 获取积分权益列表
    queryIntegralEquityList(ops) {
        return request.post(`${this.queryIntegralEquityListUrl}`, ops)
            
    }
    // 保存积分权益
    saveIntegralEquity(ops) {
        return request.post(`${this.saveIntegralEquityUrl}`, ops)
            
    }

    /**
     * 功能描述: 获取公告列表
     * @auther: pfyangf@isoftstone.com
     * @date: 2018/7/9 16:40
     */
    queryBulletinList(ops) {
        return request.post(`${this.queryBulletinListUrl}`, ops)
            
    }

    /**
     * 功能描述: 删除公告
     * @auther: pfyangf@isoftstone.com
     * @date: 2018/7/9 16:55
     */
    deleteBulletin(ops) {
        return request.post(`${this.deleteBulletinUrl}`, ops)
            
    }

    /**
     * 功能描述: 保存公告
     * @auther: pfyangf@isoftstone.com
     * @date: 2018/7/9 16:54
     */
    saveBulletin(ops) {
        return request.post(`${this.saveBulletinUrl}`, ops)
            
    }

    /**
     * 功能描述: 获取公告信息
     * @auther: pfyangf@isoftstone.com
     * @date: 2018/7/9 17:17
     */
    getBulletinInfo(ops) {
        return request.post(`${this.getBulletinInfoUrl}`, ops)
            
    }

    /**
     * 功能描述: 变更公告状态
     * @auther: pfyangf@isoftstone.com
     * @date: 2018/7/10 9:36
     */
    changeBulletinStatus(ops) {
        return request.post(`${this.changeBulletinStatusUrl}`, ops)
            
    }

}

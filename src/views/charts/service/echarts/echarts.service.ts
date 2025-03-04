import request from "@/utils/request";

/**
 * 登录
 */
export class EchartsService {

    getRoleChatsListUrl = '/chatsmgr/qryCommodityBasePage'; // 获取角色视图配置列表
    getPrdTreeListUrl = '/proddef/getPrdTreeList'; // 获取产品树
    getTermTreeListUrl = '/proddef/getTermTreeList'; // 获取产品树
    getCvrgTreeListUrl = '/proddef/getCvrgTreeList'; // 获取产品树
    getRiskTreeListUrl = '/proddef/getRiskTreeList'; // 获取产品树

    /**
     * 图表查询
     * @param  {[type]}
     * @return {Observable<any>}           [description]
     */
    getEchartsData(ops) {
        return request.post('/policy/getStatistics', ops);
    }

    /**
     * 获取角色视图配置列表
     * @param ops
     * @returns {Observable<any>}
     */
    getRoleChatsList(ops) {
        return request.post('/chatsmgr/qryCommodityBasePage', ops);
    }

    /**
     * 产品责任维度查询
     * @param ops
     * @returns {Observable<any>}
     */
    getPrdTreeList(ops) {
        return request.post(`${this.getPrdTreeListUrl}`, ops);
    }

    getTermTreeList(ops) {
        return request.post(`${this.getTermTreeListUrl}`, ops);
    }

    getCvrgTreeList(ops) {
        return request.post(`${this.getCvrgTreeListUrl}`, ops);
    }

    getRiskTreeList(ops) {
        return request.post(`${this.getRiskTreeListUrl}`, ops);
    }

}

/**
 * 图标配置对象
 */
export class ChartConfig {
    name: string; // 图表名称
    type: string; // 图表类型
    title: ChartTitle; // 图表类型

    constructor(options: {
        name: string,
        type: string,
        title?: ChartTitle
    }) {
        this.name = null != options.name ? options.name : null;
        this.type = null != options.type ? options.type : null;
        this.title = null != options.title ? options.title : null;
    }
}

export interface ChartTitle {
    d?: string; // 天
    w?: string; // 周
    m?: string; // 月
}

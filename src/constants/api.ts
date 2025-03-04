// export const AppBaseUrl = './';
export const AppBaseUrl = 'http://114.116.152.146:9080/beauty-api-nvhl/';
// export const AppBaseUrl = 'http://192.168.31.81:9080/beauty-api-nvhl/';
export const LocalAppBaseUrl = 'http://127.0.0.1:9080/beauty-api/';
/**
 * 请求contentType
 */
export const CONTENT_TYPE = 'application/json'

/**
 * 请求超时时间
 */
export const REQUEST_TIMEOUT = 200000
/**
 * 请求成功状态码
 */
export const SUCCESS_CODE = 200
/**
 * 是否根据headers->content-type自动转换数据格式
 */
export const TRANSFORM_REQUEST_DATA = true
/**
 * 默认HTTP拦截器，其注册细节见 `app.module.ts`
 */

export const key = 'key_header';

export const AppKey = {
    RemenberMe: '__RemenberMe',
    payload: '__payload',
    user: '__user',
    token: '__token',
    roles: '__roles',
    ops: '__ops',
    opOrg: '__opOrg',
    wsSionId: '__wsSionId',
    shortcutMenu: '__shortcutMenu',
    bulletinMenu: '__bulletinMenu',
    currentOpOrg: '__currentOpOrg',
    lt: '__lt',
    query: {
        pcis_query_app: '_index_pcis-query_app', // 综合查询
        pcis_query_endorse: '_index_qryEndorseList', // 一般批改查询
        pcis_query_returnudrlist: '_index_returnUdrList', // 核保退回查询
        pcis_query_newudrlist: '_index_newudrlist', // 待核保查询
        pcis_query_pendudrlist: '_index_pendudrlist', // 核保暂存查询
        pcis_query_insured: '_index_insuredlist', // 核保暂存查询
        pcis_channal_query_app: '_index_pcis_channal_query_app', // 渠道查询查询
    },
    commodityQuery: {
        commodity_query_main: '_index_commodity_main', // 商品配置主页
        commodity_query_undr: '_index_commodity_undr', // 商品配置审核
        commodity_query_deploy: '_index_commodity_deploy', // 商品发布
        commodity_query_grantcode: '_index_commodity_grantcode' // 业务员二维码分配
    }
};

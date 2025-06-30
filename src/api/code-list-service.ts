// 导入必要的模块和依赖
import request from '@/utils/request'; // 导入axios实例


/**
 * @Title: CodeList服务
 * @Description: 处理代码列表操作的服务
 * @date 2025/01/09
 * @author pfyangf@isoftstone.com
 */

// 根据字典类型获取字典值列表
export function getListByCode(type: any, param?: any, parent?: any) {
    let cparcde;
    if (parent) {
        if (type === 'PROD_LIST') {
            cparcde = { 'cKindNo': parent };
            param = { ...param, ...cparcde }; // 使用对象展开运算符进行合并
        } else {
            if (param['cParCde'] != null) {
                param['cParCde'] = parent;
            }
        }
    }
    // 发送POST请求以根据字典类型获取字典值列表
    return request.post(
        `/codelist/query`,
        {
            'codeListName': type,
            'codeListParam': param
        }
    );
}

// 模态窗口获取数据列表
export function getPropListByCode(type: any, param?: any) {
    // 发送POST请求以获取属性列表
    return request.post(
        `/codelist/queryPage`,
        {
            'codeListName': type,
            'codeListParam': param
        }
    );
}

// 获取树形结构数据
export function getTreetByCode(type: any, param?: any) {
    // 发送POST请求以获取树形结构数据
    return request.post(
        `/codelist/queryTree`,
        {
            'codeListName': type,
            'codeListParam': param
        }
    );
}

// 获取分页列表
export function getPageList(type: any, param?: any) {
    // 发送POST请求以获取分页列表
    return request.post(
        `/codelist/queryPage`,
        {
            'codeListName': type,
            'codeListParam': param
        }
    );
}

// 根据code和val解析字典值
export function getNmeByCde(ops: any) {
    // 发送POST请求以根据code和val解析字典值
    return request.post(
        `/edr/getNmeByCde`,
        {
            source: JSON.stringify(ops)
        }
    );
}

// 初始化多代码列表
export function initMultiCodeList(ops: any) {
    // 发送POST请求以初始化多代码列表
    return request.post(
        `/codelist/initMultiCodeList`,
        {
            params: JSON.stringify(ops)
        }
    );
}

// 业务来源
export function getBsnsTypList(ops: any) {
    // 发送POST请求以获取业务来源列表
    return request.post(
        `/policy/getBsnsTypList`,
        {
            source: JSON.stringify(ops)
        }
    );
}

// 渠道中级分类
export function getChaTypeList(ops: any) {
    // 发送POST请求以获取渠道中级分类列表
    return request.post(
        `/policy/getChaTypeList`,
        {
            source: JSON.stringify(ops)
        }
    );
}

// 渠道子类信息
export function getChaSubtypList(ops: any) {
    // 发送POST请求以获取渠道子类信息列表
    return request.post(
        `/policy/getChaSubtypList`,
        {
            source: JSON.stringify(ops)
        }
    );
}

// 根据操作机构带出业务员
export function getSlsList(ops: any) {
    // 发送POST请求以根据操作机构带出业务员列表
    return request.post(
        `/policy/getSlsList`,
        {
            source: JSON.stringify(ops)
        }
    );
}

// 错误处理
export function handleError(error: any) {
    const errMsg = error.message ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : '服务器错误';
    console.error(errMsg); // 将错误消息记录到控制台
    throw new Error(errMsg); // 抛出错误
}
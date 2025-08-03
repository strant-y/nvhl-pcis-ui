import {AxiosPromise} from "axios";
import {post} from "@/utils/http";
import {del} from "@/utils/http";
/**
 * 获取角色信息列表
 *
 * @param queryParams
 */
export function getSysRoleList(queryParams: any): AxiosPromise<any> {
    return post(`/role/getSysRoleList`, queryParams);
}

/**
 * 模板查询信息列表
 *
 * @param queryParams
 */
export function getTemplateList(queryParams: any): AxiosPromise<any> {
    return post(`/template/list`, queryParams);
}

/**
 * 模板删除
 *
 * @param queryParams
 */
export function deleteTemplate(queryParams: any): AxiosPromise<any> {
    return post(`/template/delete`, queryParams);
}



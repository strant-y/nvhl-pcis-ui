import {post} from "@/utils/http";
import type { ApiResult } from "@/types/api";
/**
 * 获取角色信息列表
 *
 * @param queryParams
 */
export function getSysRoleList(queryParams: any): Promise<ApiResult<any>> {
    return post(`/role/getSysRoleList`, queryParams);
}

/**
 * 模板查询信息列表
 *
 * @param queryParams
 */
export function getTemplateList(queryParams: any): Promise<ApiResult<any>> {
    return post(`/template/list`, queryParams);
}

/**
 * 模板删除
 *
 * @param queryParams
 */
export function deleteTemplate(queryParams: any): Promise<ApiResult<any>> {
    return post(`/template/delete`, queryParams);
}

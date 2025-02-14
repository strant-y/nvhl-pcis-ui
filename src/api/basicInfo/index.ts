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
import request from "@/utils/request";
import { AxiosPromise } from "axios";
import { RoleQuery, RolePageResult, RoleForm } from "./types";
import {post,get} from "@/utils/http";
import {LocalBaseApi} from "@/api/config";

/**
 * 获取角色分页数据
 *
 * @param queryParams
 */
export function getRolePage(
  queryParams?: RoleQuery
): AxiosPromise<RolePageResult> {
  return post(`/role/getSysRoleList`,queryParams)
}

/**
 * 分配菜单权限给角色
 * @param queryParams
 */
export function updateRoleMenus(roleId: string,opCdeList: string[]): AxiosPromise<any> {
  return post('/role/roleMenusAllot',{roleCde: roleId,opCdeList: opCdeList});
}

/**
 * 获取角色的菜单ID集合
 * @param queryParams
 */
export function getRoleMenuIds(roleCde: string): AxiosPromise<string[]> {
  return post('/role/roleMenuIds', {roleCde: roleCde});
}


/**
 * 获取角色下拉数据
 * @param queryParams
 */
export function getRoleOptions(): AxiosPromise<OptionType[]> {
  return get('/role/roleOptionsList');

}


/**
 * 添加角色
 *
 * @param data
 */
export function addRole(data: RoleForm) {
  return post(`/role/saveRoleInfo`,data)
}

/**
 * 更新角色
 *
 * @param id
 * @param data
 */
export function updateRole(data: RoleForm) {
  return post(`/role/saveRoleInfo`,data)
}

/**
 * 删除角色，多个以英文逗号(,)分割
 *
 * @param ids
 */
export function deleteRoles(ids: string) {
  return post(`/role/delRoleInfo`,{roleIds : ids})

}

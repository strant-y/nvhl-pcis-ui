import { RoleQuery, RolePageResult, RoleForm } from "./types";
import { post, get } from "@/utils/http";
import type { ApiResult } from "@/types/api";

interface LegacyMsgResult {
  code: string;
  message: string;
}

/**
 * 获取角色分页数据
 *
 * @param queryParams
 */
export function getRolePage(
  queryParams?: RoleQuery
): Promise<ApiResult<RolePageResult>> {
  return post(`/role/getSysRoleList`, queryParams);
}

export function updateRoleMenus(
  roleId: string,
  opCdeList: string[]
): Promise<ApiResult<unknown>> {
  return post("/role/roleMenusAllot", { roleCde: roleId, opCdeList: opCdeList });
}

export function getRoleMenuIds(
  roleCde: string
): Promise<ApiResult<Record<string, string[]>>> {
  return post("/role/roleMenuIds", { roleCde: roleCde });
}


export function getRoleOptions(): Promise<ApiResult<{ data: OptionType[] }>> {
  return get("/role/roleOptionsList");

}


/**
 * 添加角色
 *
 * @param data
 */
export function addRole(data: RoleForm) {
  return post<LegacyMsgResult>(`/role/saveRoleInfo`, data);
}

/**
 * 更新角色
 *
 * @param id
 * @param data
 */
export function updateRole(data: RoleForm) {
  return post<LegacyMsgResult>(`/role/saveRoleInfo`, data);
}

/**
 * 删除角色，多个以英文逗号(,)分割
 *
 * @param ids
 */
export function deleteRoles(ids: string) {
  return post<LegacyMsgResult>(`/role/delRoleInfo`, { roleIds: ids });

}

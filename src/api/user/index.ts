import request from "@/utils/request";
import type { AxiosResponse } from "axios";
import { UserForm, UserInfo, UserPageVO, UserQuery } from "./types";
import { post } from "@/utils/http";
import type { ApiResult } from "@/types/api";


export function getUserInfoApi(
  params: Record<string, unknown>
): Promise<ApiResult<UserInfo>> {
  return post("/userInfo", params);
}


/**
 * 获取用户分页列表
 *
 * @param queryParams
 */
export function getUserPage(
  queryParams: UserQuery
): Promise<ApiResult<PageResult<UserPageVO[]>>> {
  return post("/getUserList", queryParams);
}

/**
 * 获取用户表单详情
 *
 * @param userId
 */
export function getUserForm(userId: number): Promise<ApiResult<UserForm>> {
  return request<any, ApiResult<UserForm>>({
    url: "/api/v1/users/" + userId + "/form",
    method: "get",
  });
}

/**
 * 添加用户
 *
 * @param data
 */
export function addUser(data: any) {
  return post("/saveUser", data);

}

/**
 * 修改用户
 *
 * @param data
 */
export function updateUser(data: UserForm) {
  return post("/saveUser", data);

}

/**
 * 修改用户密码
 *
 * @param id
 * @param password
 */
export function resetUserPassword(id: string | number, password: string) {
  return post("/resetPassword", { id: id, password: password });
}

export function updateUserPassword(formData: any) {
  return post("/modifyPassword", formData);
}

export function changeDptToken(formData: any) {
  return post("/changeDptToken", formData);
}
/**
 * 删除用户
 *
 * @param ids
 */
export function deleteUsers(ids: string) {
  return post("/delUser", { ids: ids });

}

/**
 * 获取个人绑定数据
 */
export function getOtherList(formData: any) {
  return post("/getOtherList", formData);

}

/**
 * 获取个人绑定数据
 */
export function updateOtherUser(formData: any) {
  return post("/updateOtherUser", formData);

}

/**
 * 下载用户导入模板
 *
 * @returns
 */
export function downloadTemplateApi() {
  return request<ArrayBuffer, AxiosResponse<ArrayBuffer>>({
    url: "/api/v1/users/template",
    method: "get",
    responseType: "arraybuffer",
  });
}

/**
 * 导出用户
 *
 * @param queryParams
 * @returns
 */
export function exportUser(queryParams: UserQuery) {
  return request<ArrayBuffer, AxiosResponse<ArrayBuffer>>({
    url: "/api/v1/users/_export",
    method: "get",
    params: queryParams,
    responseType: "arraybuffer",
  });
}

/**
 * 导入用户
 *
 * @param file
 */
export function importUser(deptId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return request<any, ApiResult<unknown>>({
    url: "/api/v1/users/_import",
    method: "post",
    params: { deptId: deptId },
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

import request from "@/utils/request";
import { DeptForm, DeptQuery, DeptVO } from "./types";
import { post } from "@/utils/http";
import type { ApiResult } from "@/types/api";

interface DeptListData {
  list: DeptVO[];
  total: number;
}


/**
 * 部门树形表格
 *
 * @param queryParams
 */
export function listDepts(queryParams?: DeptQuery): Promise<ApiResult<DeptListData>> {
  return post(`/dpt/dptList`, queryParams);

}

/**
 * 部门树形表格
 * @param param{
 * cDptRelCde 关系码
 * cDptCde 上级机构编码
 * cDptCls
 * cSignDptMrk
 * }
 */
export function listChrDepts(param?: any): Promise<ApiResult<DeptVO[]>> {
  return post(`/dpt/dptChrList`, param);
}

/**
 * 部门结构
 *
 * @param queryParams
 */
export function deptLists(
  cDptCde?: string
): Promise<ApiResult<{ cDptRelCde: string }>> {
  return post(`/dpt/deptLists`, { cDptCde: cDptCde });
}


/**
 * 部门下拉列表
 */
export function getDeptOptions(
  queryParam: string
): Promise<ApiResult<OptionType[]>> {
  return post(`/dpt/dptOptionsList`, { queryParam: queryParam });
}



/**
 * 获取部门详情
 *
 * @param id
 */
export function getDeptForm(id: number): Promise<ApiResult<DeptForm>> {
  return request<any, ApiResult<DeptForm>>({
    url: "/api/v1/dept/" + id + "/form",
    method: "get",
  });
}

/**
 * 新增部门
 *
 * @param data
 */
export function addDept(data: DeptForm) {
  return request<any, ApiResult<unknown>>({
    url: "/api/v1/dept",
    method: "post",
    data: data,
  });
}

/**
 *  修改部门
 *
 * @param id
 * @param data
 */
export function updateDept(id: number, data: DeptForm) {
  return request<any, ApiResult<unknown>>({
    url: "/api/v1/dept/" + id,
    method: "put",
    data: data,
  });
}

/**
 * 删除部门
 *
 * @param ids
 */
export function deleteDept(ids: string) {
  return request<any, ApiResult<unknown>>({
    url: "/api/v1/dept/" + ids,
    method: "delete",
  });
}

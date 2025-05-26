import request from "@/utils/request";
import { AxiosPromise } from "axios";
import { DeptForm, DeptQuery, DeptVO } from "./types";
import {post,get} from "@/utils/http";
import { LocalBaseApi } from "../config";


/**
 * 部门树形表格
 *
 * @param queryParams
 */
export function listDepts(queryParams?: DeptQuery): AxiosPromise<DeptVO[]> {
  return post(`/dpt/dptList`,queryParams)

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
export function listChrDepts(param?: any): AxiosPromise<DeptVO[]> {
  return post(`/dpt/dptChrList`, param)
}

/**
 * 部门结构
 *
 * @param queryParams
 */
export function deptLists(cDptCde?: string): AxiosPromise<DeptVO[]> {
  return post(`/dpt/deptLists`,{cDptCde:cDptCde})
}


/**
 * 部门下拉列表
 */
export function getDeptOptions(queryParam: string): AxiosPromise<OptionType[]> {
  return post(`/dpt/dptOptionsList`,{queryParam: queryParam})
}



/**
 * 获取部门详情
 *
 * @param id
 */
export function getDeptForm(id: number): AxiosPromise<DeptForm> {
  return request({
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
  return request({
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
  return request({
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
  return request({
    url: "/api/v1/dept/" + ids,
    method: "delete",
  });
}

import request from "@/utils/request";
import {
  DictTypeQuery,
  DictTypePageResult,
  DictTypeForm,
  DictQuery,
  DictForm,
  DictPageResult,
} from "./types";
import { post, get } from "@/utils/http";
import type { ApiResult } from "@/types/api";

/**
 * 字典类型分页列表
 *
 * @param queryParams
 */
export function getDictTypePage(
  queryParams: DictTypeQuery
): Promise<ApiResult<DictTypePageResult>> {
  return post(`/dict/getSysDictList`, queryParams);
}

export function redisCache(): Promise<ApiResult<unknown>> {
  return post(`/dict/redisCache`, {});
}


/**
 * 添加字典类型
 * @param params
 */
export function addDictType(params: DictTypeForm) {
  return post(`/dict/addDictType`, params);
}


/**
 * 修改字典类型
 * @param id
 * @param data
 */
export function updateDictType(data: DictTypeForm) {
  return post(`/dict/updateDictType`, data);
}


/**
 * 删除字典类型
 */
export function deleteDictTypes(
  params: Record<string, unknown>
): Promise<ApiResult<unknown>> {
  return post(`/dict/deleteDictTypes`, params);
}

/**
 * 下拉框value值
 *
 * @param queryParams
 */
export function findDropDownBoxList(queryCodeList: any) {
  return post(`/dict/dictOptionsList`, queryCodeList);
}

/**
 * 获取字典类型的数据项
 *
 * @param typeCode 字典类型编码
 */
export function getDictOptions(
  typeCode: string
): Promise<ApiResult<OptionType[]>> {
  return post(`/dict/dictOptions`, { dictType: typeCode });
}

/**
 * 根据codelist获取对应码值
 *
 * @param param 字典参数 包含codeListName codelist参数以及codeListParam参数
 */
export function codelistQuery(param: any): Promise<ApiResult<OptionType[]>> {
  return post(`/codelist/query`, param);
}

/**
 * 获取字典类型的数据项
 *
 * @param typeCode 字典类型编码
 */
export function getDictOptionsUnAuthor(
  typeCode: string
): Promise<ApiResult<OptionType[]>> {
  return post(`dict/dictOptionsUnAuthor`, { dictType: typeCode });
}

/**
 * 字典类型表单数据
 *
 * @param id
 */
export function getDictTypeForm(id: number): Promise<ApiResult<DictTypeForm>> {
  return request<any, ApiResult<DictTypeForm>>({
    url: "/api/v1/dict/types/" + id + "/form",
    method: "get",
  });
}



/**
 * 字典分页列表
 */
export function getDictPage(
  queryParams: DictQuery
): Promise<ApiResult<DictPageResult>> {
  return post(`/dict/getDictDelList`, queryParams);
}

/**
 * 获取字典表单数据
 *
 * @param id
 */
export function getDictFormData(id: number): Promise<ApiResult<DictForm>> {
  return request<any, ApiResult<DictForm>>({
    url: "/api/v1/dict/" + id + "/form",
    method: "get",
  });
}

/**
 * 新增字典
 *
 * @param data
 */
export function addDict(data: DictForm) {
  return post(`/dict/saveOptions`, data);
}

/**
 * 修改字典项
 *
 * @param id
 * @param data
 */
export function updateDict( data: DictForm) {
  return post(`/dict/saveOptions`, data);

}

/**
 * 删除字典
 *
 * @param ids 字典项ID，多个以英文逗号(,)分割
 */
export function deleteDict(ids: string) {
  return post(`/dict/delOptions`, { ids: ids });

}

/**
 * 风险项字典查询
 */
export function getRiskDownList(param: any): Promise<ApiResult<unknown>> {
  return post(`/query/getRiskDownList`, param);

}

/**
 * 获取风险明细模版
 */
export function getRiskMapList(param: any): Promise<ApiResult<unknown>> {
  return post(`/query/getRiskMapList`, param);
}

/**
 * 获取用户信息功能
 */
export function getEmpList(param: any): Promise<ApiResult<unknown>> {
  return post(`/getEmpList`, param);
}
/**
 * 获取制裁国家名单
 *
 */
export function sanctionCountry(param: any): Promise<ApiResult<OptionType[]>> {
  return post(`/cargoInsurance/sanctionCountry`, param);
}
/**
 * 获取水险再保提示
 *
 */
export function insurancePolicies(): Promise<ApiResult<OptionType[]>> {
  return get(`/cargoInsurance/insurancePolicies`);
}

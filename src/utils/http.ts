import request from "@/utils/request";
import type { ApiResult } from "@/types/api";


// get
export function get<T>(url: string, params?: any): Promise<ApiResult<T>> {
  return request.get<T, ApiResult<T>>(url, { params });
}

// post
// export function post<T>(url: string, data?: any): Promise<T> {
//   return request.post<T>(url, data);
// }
export function post<T>(
  url: string,
  data?: any,
  config?: any
): Promise<ApiResult<T>> {
  return request.post<T, ApiResult<T>>(url, data, config);
}

// put
export function put<T>(url: string, data?: any): Promise<ApiResult<T>> {
  return request.put<T, ApiResult<T>>(url, data);
}

//delete
export function del<T>(url: string): Promise<ApiResult<T>> {
  return request.delete<T, ApiResult<T>>(url);
}

/**
 * 上传文件
 * @param file
 * @param url
 */
export function uploadFile<T>(url: string, file: File): Promise<ApiResult<T>> {
  const formData = new FormData();
  formData.append("file", file);
  return request<any, ApiResult<T>>({
    url: url,
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

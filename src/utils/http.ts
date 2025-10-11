import request from "@/utils/request";


// get
export function get<T>(url: string, params?: any): Promise<T> {
  return request.get<T>(url, { params });
}

// post
// export function post<T>(url: string, data?: any): Promise<T> {
//   return request.post<T>(url, data);
// }
export function post<T>(url: string, data?: any, config?: any): Promise<T> {
  return request.post<T>(url, data, config);
}

// put
export function put<T>(url: string, data?: any): Promise<T> {
  return request.put<T>(url, data);
}

//delete
export function del<T>(url: string): Promise<T> {
  return request.delete<T>(url);
}

/**
 * 上传文件
 * @param file
 * @param url
 */
export function uploadFile<T>(url: string, file: File): Promise<T> {
  const formData = new FormData();
  formData.append("file", file);
  return request({
    url: url,
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}



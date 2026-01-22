import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { useUserStoreHook } from "@/store/modules/user";
import { reqParamsEncrypt,bodyEncrypt } from "./encipher";
import {AppBaseApi,LocalBaseApi} from "@/api/config"




// 创建 axios 实例
const service = axios.create({
    baseURL: AppBaseApi,
    timeout: 50000,
    headers: {"Content-Type": "application/json;charset=utf-8"},
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 调本地处理
    const url = config.url;
    if (url?.includes(LocalBaseApi)) {
      config.url = url.replace(LocalBaseApi, '');
      config.baseURL = LocalBaseApi
    }

    const accessToken = sessionStorage.getItem("token");
    const opOrg = sessionStorage.getItem("opOrg");
    if (accessToken) {
      config.headers.Authorization = accessToken;
    }
    if (opOrg) {
      config.headers.Department = opOrg;
    }
    // 文件上传 不加密
    if(config.headers['Content-Type'] === 'multipart/form-data'){
      return config;
    }
    // 打包 加密
    try {
      let param = config.data;
      if(!!param && !param.source){
        param = {
          source: JSON.stringify(param)
        }
      }
      // console.log('请求参数',param);
      config.data = reqParamsEncrypt(param)
    }catch (e){
      ElMessage.error(e);
      throw '加密参数发生异常：' + e;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use( (response: AxiosResponse) => {
    const { status, statusText, data } = response;
    if ( status === 200 ) {
      // 响应数据为二进制流处理(Excel导出)
      if (response.data instanceof Blob) {
        return response;
      }
      if (data.code === 401) {
        ElMessageBox.confirm(data.msg, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          const userStore = useUserStoreHook();
          userStore.logout().then(() => {
            location.reload();
          });
        });
      }
      return data;
    }
    
    ElMessage.error( statusText || "系统出错");
    return Promise.reject(new Error(statusText || "Error"));
  },
  (error: any) => {
    if (!!error.response && error.response.data) {
      const { code, msg } = error.response.data;
      // token 过期,重新登录
      if (code === 401) {
        ElMessageBox.confirm(msg, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          const userStore = useUserStoreHook();
          userStore.logout().then(() => {
            location.reload();
          });
        });
      } else {
        // sessionStorage.setItem("token", "");
        ElMessage.error(msg || "系统出错");
      }
    }else {
			const isCanceled = error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED';
			if (isCanceled) {
				// 请求被取消（超时）
				ElMessage.warning('请求超时，请稍后重试');
			} else {
				ElMessage.error(error)
			}
    }
    return Promise.reject(error.message);
  }
);

export function download(url,params,filename) {
  const data = service.post( url, params, {responseType:'blob'});
  
  data.then((res) => {
    const blob = new Blob([res.data]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const contdis = res.headers['content-disposition'];
    link.download = filename;
    if(contdis){
      const conf = contdis.split("filename=")[1]
                .split(';')[0];
      const file = decodeURI(conf);
      link.download = file;
    }
    link.target= '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }).catch(error => {
    console.error(error);
    ElMessage.error('文件下载异常！');
  })
}
// 导出 axios 实例
export default service;

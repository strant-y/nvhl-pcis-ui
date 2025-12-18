import request from "@/utils/request";
import {AxiosPromise} from "axios";
import {FileInfo, UploadFileData} from "./types";
import {get, post} from "@/utils/http";
import { LocalBaseApi } from "../config";

/**
 * 上传文件
 * @param fileData
 */
export function platUploadFile(fileData: any): AxiosPromise {
  return request({
    url:  `/platClient/upload`,
    method: "post",
    data: fileData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

/**
 * 获取特批申请信息
 * @param fileData
 */
export function getplatData(data: any): AxiosPromise {
  return post(`/platClient/getplatData`,data);
}


/**
 * 特批结果查询
 * @param fileData
 */
export function specialSearchResult(data: any): AxiosPromise {
  return post(`/platClient/specialSearchResult`,data);
}

/**
 * 特批结果查询
 * @param fileData
 */
export function specialApply(data: any): AxiosPromise {
  return post(`/platClient/specialApply`,data);
}


import request from "@/utils/request";
import {AxiosPromise} from "axios";
import {FileInfo, UploadFileData} from "./types";
import {get, post} from "@/utils/http";
import { LocalBaseApi } from "../config";

/**
 * 上传文件
 * @param fileData
 */
export function uploadFileApi(fileData: UploadFileData): AxiosPromise<FileInfo> {
  const formData = new FormData();
  formData.append("file", fileData.file);
  formData.append("type", fileData.type);
  formData.append("cSafetyNo", fileData.cSafetyNo);
  return request({
    url:  `/image/upload`,
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

/**
 * 服务商信息导入
 * @param fileData
 */
export function importServiceStone(fileData: any): AxiosPromise<FileInfo> {
  const formData = new FormData();
  formData.append("file", fileData.file);
  formData.append("importType", fileData.importType);
  return request({
    url:  `/servicestore/importServiceStone`,
    method: "post",
    data: fileData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}


/**
 * 删除文件
 * @param fileInfo 文件对象 FileInfo
 */
export function deleteFileApi(fileInfo?: FileInfo) {
  return post(`/image/delete`, fileInfo);
}

/**
 * 预览文件
 * @param fileInfo 文件对象 FileInfo
 */
export function previewFile(url: string) {
  return get(url);
}

/**
 * 读取身份证(身份证、外国人永久居留身份证)
 * @param fileData
 */
export function readFile(fileData: UploadFileData): AxiosPromise<FileInfo> {
  const formData = new FormData();
  formData.append("file", fileData.file);
  formData.append("type", fileData.type);
  return request({
    url:  `/ocr/readFile`,
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

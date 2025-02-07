import {UploadFile} from "element-plus";
/**
 * 文件API类型声明
 */
export interface FileInfo extends UploadFile{
  cFileType?: string;
  cFileName?: string;
  cFileUrl?: string;
  cPkId?: string;
  cSafetyNo?: string;
  fileId?: string;
  type?: string;
  cTaskLink?: string;
  cRemark?: string;
  cClassification?: string;
  cCrtCde?: string;
  tCrtTm?: Date;
  cUpdCde?: string;
  tUpdTm?: Date;
  cTransfer?: string;
  tTransferTm?: Date;
}


/**
 * 组件初始化对象
 */
export interface FileData{
  cSafetyNo?: string;
  fileId?: string;
  filesList?: FileInfo[];
}


/**
 * 文件上传对象
 */
export interface UploadFileData{
  cSafetyNo?: string;
  file?: File;
  type?: string;
}





import axios from 'axios';
import {AxiosPromise} from "axios";
import {post} from "@/utils/http";

/**
 * 出单任务处理-查询
 *
 * @param queryParams
 */
export function selectTask(queryParams: any): AxiosPromise<any> {
    return post(`/task/work/selectTask`, queryParams);
}

/**
 * 核保任务查询
 *
 * @param queryParams
 */
export function getAppTask(queryParams: any): AxiosPromise<any> {
    return post(`/task/getAppTask`, queryParams);
}

/**
 * 询价任务查询
 *
 * @param queryParams
 */
export function getInquiryTask(queryParams: any): AxiosPromise<any> {
    return post(`/task/getInquiryTask`, queryParams);
}

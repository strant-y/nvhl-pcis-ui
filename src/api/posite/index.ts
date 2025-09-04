import { AxiosPromise } from "axios";
import { post } from "@/utils/http";

/**
 * 组合出单api
 */

const PageBaseUrl: string = "/posite";

//查询
function queryPositeInfo(queryParams: any): AxiosPromise<any> {
    return post(`${PageBaseUrl}/queryPositeInfo`, queryParams);
}
//保存
function savePositeInfo(queryParams: any): AxiosPromise<any> {
    return post(`${PageBaseUrl}/savePositeInfo`, queryParams);
}

export default {
    queryPositeInfo,
    savePositeInfo
}


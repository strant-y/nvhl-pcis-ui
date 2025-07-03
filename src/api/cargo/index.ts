import { AxiosPromise } from "axios";
import { post } from "@/utils/http";

const DistBaseUrl: string = "/cargoDist";
const PageBaseUrl: string = "/ecargo";

// 获取EAcrgo页面配置
function getECargoPageView(queryParams: any): AxiosPromise<any> {
    return post(`/prod/getECargoPageView`, queryParams);
}

//协议查询
function query(queryParams: any): AxiosPromise<any> {
    return post(`${PageBaseUrl}/query`, queryParams);
}

//新增清单保存
function saveDist(queryParams: any): AxiosPromise<any> {
    return post(`${DistBaseUrl}/saveDist`, queryParams);
}
//查询清单
function selectDist(queryParams: any): AxiosPromise<any> {
    return post(`${DistBaseUrl}/selectDist`, queryParams);
}
//删除清单
function deleteDist(queryParams: any): AxiosPromise<any> {
    return post(`${DistBaseUrl}/deleteDist`, queryParams);
}

//协议录入、批改页面 保存
function save(queryParams: any): AxiosPromise<any> {
    return post(`${PageBaseUrl}/saveEcargo`, queryParams);
}
//协议录入页面 提交
function submit(queryParams: any): AxiosPromise<any> {
    return post(`${PageBaseUrl}/saveEcargo`, queryParams);
}
//协议批改页面 提交
function editSubmit(queryParams: any): AxiosPromise<any> {
    return post(`${PageBaseUrl}/editSubmit`, queryParams);
}
//协议审核页面 提交
function checkSubmit(queryParams: any): AxiosPromise<any> {
    return post(`${PageBaseUrl}/saveEcargo`, queryParams);
}

//协议录入页面 初始化
function init(queryParams: any): AxiosPromise<any> {
    return post(`${PageBaseUrl}/init`, queryParams);
}
//协议批改页面 初始化
function editInit(queryParams: any): AxiosPromise<any> {
    return post(`${PageBaseUrl}/editInit`, queryParams);
}
//协议审核页面 初始化
function checkInit(queryParams: any): AxiosPromise<any> {
    return post(`${PageBaseUrl}/checkInit`, queryParams);
}

export default {
    saveDist,
    selectDist,
    deleteDist,
    save,
    submit,
    editSubmit,
    checkSubmit,
    checkInit,
    editInit,
    // init,
    query,
    getECargoPageView
}


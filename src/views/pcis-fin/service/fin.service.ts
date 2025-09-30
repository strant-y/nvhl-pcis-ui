import {AxiosPromise} from "axios";
import {post} from "@/utils/http";
import {del} from "@/utils/http";
/**
 * 查询服务
 */
export class FinService {

    /**
     * 查询审核通过的退票信息
     * @param ops
     * @returns {Observable<any>}
     */
    listBackTra(ops: any): AxiosPromise<any> {
        return post(`/fin/listBackTra`, ops)
    }

    listZjtrack(ops: any): AxiosPromise<any> {
        return post(`/fin/listZjtrack`, ops)
    }

    getFinRebackList(ops: any): AxiosPromise<any> {
        return post(`/fin/getFinRebackList`, ops)
    }

    getEditFinReback(ops: any): AxiosPromise<any> {
        return post(`/fin/getEditFinReback`, ops)
    }

    getCheckFinReback(ops: any): AxiosPromise<any> {
        return post(`/fin/getCheckFinReback`, ops)
    }

    saveFinReback(ops: any): AxiosPromise<any> {
        return post(`/fin/saveFinReback`, ops)
    }

    comitFinReback(ops: any): AxiosPromise<any> {
        return post(`/fin/comitFinReback`, ops)
    }

}

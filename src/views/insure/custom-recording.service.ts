// import request from '@/utils/request';
import {AxiosPromise} from "axios";
import {post} from "@/utils/http";
import {get} from "@/utils/http";
import {del} from "@/utils/http";
import { LocalBaseApi } from "../config";

/**
 * 投保	自定义录单
 *
 * @param queryParams
 */
export function getProdEnableList(queryParams: any): AxiosPromise<any> {
    return get(`/proddef/getProdEnableList`, queryParams);
}

/*
 * 投保	自定义录单
 */
// export class CustomRecordingService {
//   getProdEnableListUrl = 'proddef/getProdEnableList'; // 获取条款列表
//     /**
//      * @Title: 获取条款列表
//      * @Description:
//      * @date 2018/4/16 15:10
//      * @author pflir@isoftstone.com
//      * @params:
//      */
//     getProdEnableList(ops) {
//         return request.get(`${this.getProdEnableListUrl}`,{
//           params: ops || {},
//         });
//     }
// }

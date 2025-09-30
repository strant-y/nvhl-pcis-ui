import {AxiosPromise} from "axios";
import {post} from "@/utils/http";
import {del} from "@/utils/http";


export class SysOrgDptMgrService {
    qryOrgDptListUrl = 'orgdptmgr/queryOrgDptList'; // 获取机构部门信息列表
    loadOrgDptInfoUrl = 'orgdptmgr/loadOrgDptInfo'; // 获取机构部门信息列表
    saveOrgDptInfoUrl = 'orgdptmgr/saveOrgDptInfo'; // 保存机构部门信息
    changeOrgDptStatusUrl = 'orgdptmgr/changeOrgDptStatus'; // 变更机构部门有效状态

    /**
     * @Title: 查询机构部门信息列表
     * @Description:
     * @date 2018/5/15
     * @author pflir@isoftstone.com
     * @params:
     */
    qryOrgDptList(ops: any): AxiosPromise<any> {
        return post(`${this.qryOrgDptListUrl}`, ops);
    }
    /**
     * @Title: 加载机构部门信息
     * @Description:
     * @date 2018/5/15
     * @author pflir@isoftstone.com
     * @params:
     */
    loadOrgDptInfo(ops: any): AxiosPromise<any> {
        return post(`${this.loadOrgDptInfoUrl}`, ops);
    }
    /**
     * @Title: 保存机构部门信息
     * @Description:
     * @date 2018/5/16
     * @author pflir@isoftstone.com
     * @params:
     */
    saveOrgDptInfo(ops: any): AxiosPromise<any> {
        return post(`${this.saveOrgDptInfoUrl}`, ops);
    }
    /**
     * @Title: 变更机构部门有效状态
     * @Description:
     * @date 2018/5/16
     * @author pflir@isoftstone.com
     * @params:
     */
    changeOrgDptStatus(ops: any): AxiosPromise<any> {
        return post(`${this.changeOrgDptStatusUrl}`, ops);
    }
}

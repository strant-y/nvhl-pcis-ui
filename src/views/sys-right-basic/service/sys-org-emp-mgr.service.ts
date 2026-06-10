import request from '@/axios';
import {AppBaseUrl} from '@/constants/api';

import {AxiosPromise} from "axios";
import {post} from "@/utils/http";
import {del} from "@/utils/http";

export class SysOrgEmpMgrService {
    qryOrgEmpListUrl = 'orgempmgr/getSysOrgEmpList'; // 获取员工信息列表
    queryChannalOrgEmpUrl = 'orgempmgr/queryChannalOrgEmp'; // 获取渠道配置员工信息列表
    configChannalOrgEmpUrl = 'orgempmgr/configChannalOrgEmp'; // 配置渠道配置员工信息列表
    saveChannalOrgEmpUrl = 'orgempmgr/saveChannalOrgEmp'; // 保存渠道配置员工信息
    qryWdConfigListUrl = 'orgempmgr/getWdConfigList'; // 获取网点信息列表
    changeWdConfigUrl = 'orgempmgr/changeWdConfig'; // 修改网点信息
    deleteWdConfigUrl = 'orgempmgr/deleteWdConfig'; // 删除获取网点信息
    insertWdConfigUrl = 'orgempmgr/insertWdConfig'; // 新增获取网点信息
    loadOrgEmpInfoUrl = 'orgempmgr/loadOrgEmpInfo'; // 加载员工信息
    loadIeOrgEmpInfoUrl = 'orgempmgr/loadIeOrgEmpInfo'; // 加载IE员工信息
    saveOrgEmpInfoUrl = 'orgempmgr/saveOrgEmpInfo'; // 保存员工信息
    changeOrgEmpStatusUrl = 'orgempmgr/changeOrgEmpStatus'; // 变更员工就职状态

    /**
     * @Title: 查询员工信息列表
     * @params:
     */
    queryChannalOrgEmp(ops: any): AxiosPromise<any> {
        return post(`${this.queryChannalOrgEmpUrl}`, ops);
    }

    /**
     * @Title: 配置员工信息列表
     * @params:
     */
    configChannalOrgEmp(ops: any): AxiosPromise<any> {
        return post(`${this.configChannalOrgEmpUrl}`, ops);
    }

    saveChannalOrgEmp(ops: any): AxiosPromise<any> {
        return post(`${this.saveChannalOrgEmpUrl}`, ops);
    }

    /**
     * @Title: 查询员工信息列表
     * @Description:
     * @date 2018/6/5
     * @author pflir@isoftstone.com
     * @params:
     */
    qryOrgEmpList(ops: any): AxiosPromise<any> {
        return post(`${this.qryOrgEmpListUrl}`, ops);
    }
    /**
     * @Title: 查询员工信息列表
     * @Description:
     * @author zhchenq@isoftstone.com
     * @params:
     */
    qryWdConfigList(ops: any): AxiosPromise<any> {
        return post(`${this.qryWdConfigListUrl}`, ops);
    }
    changeWdConfig(ops: any): AxiosPromise<any> {
        return post(`${this.changeWdConfigUrl}`, ops);
    }
    deleteWdConfig(ops: any): AxiosPromise<any> {
        return post(`${this.deleteWdConfigUrl}`, ops);
    }
    insertWdConfig(ops: any): AxiosPromise<any> {
        return post(`${this.insertWdConfigUrl}`, ops);
    }

    /**
     * @Title: 加载机构部门信息
     * @Description:
     * @date 2018/5/15
     * @author pflir@isoftstone.com
     * @params:
     */
    loadOrgEmpInfo(ops: any): AxiosPromise<any> {
        return post(`${this.loadOrgEmpInfoUrl}`, ops);
    }

    loadOrgEmpIeInfo(ops: any): AxiosPromise<any> {
        return post(`${this.loadIeOrgEmpInfoUrl}`, ops);
    }
    /**
     * @Title: 保存机构部门信息
     * @Description:
     * @date 2018/5/16
     * @author pflir@isoftstone.com
     * @params:
     */
    saveOrgEmpInfo(ops: any): AxiosPromise<any> {
        return post(`${this.saveOrgEmpInfoUrl}`, ops);
    }
    /**
     * @Title: 变更机构部门有效状态
     * @Description:
     * @date 2018/5/16
     * @author pflir@isoftstone.com
     * @params:
     */
    changeOrgEmpStatus(ops: any): AxiosPromise<any> {
        return post(`${this.changeOrgEmpStatusUrl}`, ops);
    }

    /**
     * @Title: 查询协议操作员关系
     * @Description:
     * @date 2018/5/16
     * @author pflir@isoftstone.com
     * @params:
     */
    queryOcExtOperRel(ops: any): AxiosPromise<any> {
        return post("ecargo/queryOcExtOperRel", ops);
    }

    /**
     * @Title: ie员工关联协议单批量保存
     * @Description:
     * @date 2018/5/16
     * @author pflir@isoftstone.com
     * @params:
     */
    batchSaveOcExtOperRel(ops: any): AxiosPromise<any> {
        return post("ecargo/batchSaveOcExtOperRel", ops);
    }

     /**
     * @Title: ie员工关联协议单批量删除
     * @Description:
     * @date 2018/5/16
     * @author pflir@isoftstone.com
     * @params:
     */
     logicalDeleteOcExtOperRel(ops: any): AxiosPromise<any> {
        return post("ecargo/logicalDeleteOcExtOperRel", ops);
    }
}

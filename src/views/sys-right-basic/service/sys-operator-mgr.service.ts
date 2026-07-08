import request from '@/utils/request';
import type { ApiResult } from '@/types/api';

/*
 * 操作员管理服务
 */
export class SysOperatorMgrService {
    qrySysOperatorListUrl = '/operatormgr/getSysOperatorList'; // 获取操作员信息列表
    qryOrgDptTreeListUrl = '/rolemgr/getOrgDptTreeList'; // 获取组织机构树信息列表
    qryOrgEmpListUrl = '/operatormgr/getOrgEmpList'; // 获取员工信息列表
    qrySysOpDptListUrl = '/operatormgr/getSysOpDptList'; // 获取操作机构列表
    saveOperatorInfoUrl = '/operatormgr/saveOperatorInfo'; // 保存操作员信息
    loadOrgOperatorInfoUrl = '/operatormgr/loadOrgOperatorInfo'; // 加载操作员信息
    changeOperatorStatusUrl = '/operatormgr/changeOperatorStatus'; // 加载操作员信息
    qryUsrRoleListUrl = '/role/getUsrRoleList'; // 获取操作员角色列表信息
    qryGrtOperatorListUrl = '/role/qryGrtOperatorList'; // 操作权限：获取操作员信息列表
    getUsrRoleTreeListUrl = '/operatormgr/getUsrRoleTreeList'; // 操作权限： 获取角色列表
    saveUsrRoleListUrl = '/role/saveUsrRoleList'; // 操作权限： 保存用户角色列表
    delUsrRoleInfoUrl = '/role/delUsrRole'; // 操作权限： 删除用户角色列表
    resetPasswordUrl = '/operatormgr/resetPassword'; // 操作员配置：重置密码
    getUsrProdListUrl = '/role/getUsrProdList'; // 产品权限：获取产品权限列表
    getUsrProdTreeListUrl = '/operatormgr/getUsrProdTreeList'; // 产品权限：获取产品列表
    saveUsrProdListUrl = '/role/saveUsrProdList'; // 产品权限：保存获取产品权限列表
    delUsrProdInfoUrl = '/role/delUsrProd'; // 操作权限： 删除产品权限
    delUsrProdListUrl = '/role/delUsrProdList'; // 操作权限： 删除产品权限
    getUsrDptListUrl = '/operatormgr/getUsrDptList'; // 机构权限：获取机构权限列表
    saveUsrDptListUrl = '/operatormgr/saveUsrDptList'; // 机构权限：保存获取机构权限列表
    delUsrDptInfoUrl = '/package.jsonoperatormgr/delUsrDpt'; // 机构权限： 删除机构权限
    delUsrDptListUrl = '/operatormgr/delUsrDptList'; // 机构权限： 批量删除机构权限
    getUserAssociateRolesUrl = '/role/getUserAssociateRolesListByUserId'; // 机构权限： 批量删除机构权限
    getUsrProdByUsrAndDptUrl = '/role/getUsrProdByUsrAndDpt'; // 产品权限： 根据用户和机构获取用户产品权限
    dataSynchronizationUrl = 'proddef/dataSynchronization'; // 数据同步
    qureyAppPolicyListForCopyUrl = '/policy/qureyAppPolicyListForCopy'; // 复制出单查询

    /**
     * @Title: 获取操作员信息列表
     * @Description:
     * @date 2018/5/2 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    qrySysOperatorList(ops) {
        return request.post(`${this.qrySysOperatorListUrl}`, ops);
    }

    /**
     * @Title: 获取组织机构树信息列表
     * @Description:
     * @date 2018/5/2 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    getOrgDptTreeList(ops) {
        return request.post(`${this.qryOrgDptTreeListUrl}`, ops);
    }

    /**
     * @Title: 获取员工信息列表
     * @Description:
     * @date 2018/5/2 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    qryOrgEmpList(ops) {
        return request.post(`${this.qryOrgEmpListUrl}`, ops);
    }

    /**
     * @Title: 获取组织机构树信息列表
     * @Description:
     * @date 2018/5/3 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    qrySysOpDptList(ops) {
        return request.post(`${this.qrySysOpDptListUrl}`, ops);
    }

    /**
     * @Title: 保存操作员信息
     * @Description:
     * @date 2018/4/23 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    saveOperatorInfo(ops) {
        return request.post(`${this.saveOperatorInfoUrl}`, ops);
    }

    /**
     * @Title: 加载操作员及操作机构信息
     * @Description:
     * @date 2018/5/4 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    loadOrgOperatorInfo(ops) {
        return request.post(`${this.loadOrgOperatorInfoUrl}`, ops);
    }

    /**
     * @Title: 变更操作员启用状态
     * @Description:
     * @date 2018/4/9 10:46
     * @author jysuna@isoftstone.com
     * @params:
     */
    changeOperatorStatus(ops) {
        return request.post(`${this.changeOperatorStatusUrl}`, ops)
            ;
    }

    /**
     * @Title: 获取操作员角色信息
     * @Description:
     * @date 2018/5/5 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    qryGrtOperatorList(ops) {
        return request.post(`${this.qryGrtOperatorListUrl}`, ops);
    }

    /**
     * @Title: 操作权限：获取操作员角色列表信息
     * @Description:
     * @date 2018/5/5 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    getUsrRoleTreeList(ops) {
        return request.post(`${this.getUsrRoleTreeListUrl}`, ops);
    }

    /**
     * @Title: 获取操作员角色信息
     * @Description:
     * @date 2018/5/5 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    qryUsrRoleList(ops) {
        return request.post(`${this.qryUsrRoleListUrl}`, ops);
    }

    /**
     * @Title: 保存操作员角色信息
     * @Description:
     * @date 2018/5/09 17:10
     * @author pflir@isoftstone.com
     * @params:
     */
    saveUsrRoleList(ops) {
        return request.post(`${this.saveUsrRoleListUrl}`, ops);
    }

    /**
     * @Title: 删除操作员角色信息
     * @Description:
     * @date 2018/5/09 17:10
     * @author pflir@isoftstone.com
     * @params:
     */
    delUsrRoleInfo(ops) {
        return request.post(`${this.delUsrRoleInfoUrl}`, ops);
    }

    /**
     * @Title: 重置密码
     * @Description:
     * @date 2018/5/10 20:21
     * @author pfyangf@isoftstone.com
     * @params:
     */

    resetPassword(ops) {
        return request.post(`${this.resetPasswordUrl}`, ops);
    }

    /**
     * @Title: 获取操作员产品权限列表信息
     * @Description:
     * @date 2018/5/10 10:10
     * @author pflir@isoftstone.com
     * @params:
     */
    getUsrProdList(ops) {
        return request.post(`${this.getUsrProdListUrl}`, ops);
    }

    /**
     * @Title: 产品权限：获取产品列表信息
     * @Description:
     * @date 2018/5/5 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    getUsrProdTreeList(ops) {
        return request.post(`${this.getUsrProdTreeListUrl}`, ops);
    }

    /**
     * @Title: 保存操作产品权限信息
     * @Description:
     * @date 2018/5/10 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    saveUsrProdList(ops) {
        return request.post(`${this.saveUsrProdListUrl}`, ops);
    }

    /**
     * @Title: 删除操作产品权限信息
     * @Description:
     * @date 2018/5/10 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    delUsrProdInfo(ops) {
        return request.post(`${this.delUsrProdInfoUrl}`, ops);
    }

    /**
     * @Title: 删除操作产品权限信息
     * @Description:
     * @date 2018/5/10 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    delUsrProdList(ops) {
        return request.post(`${this.delUsrProdListUrl}`, ops);
    }

    /**
     * @Title: 获取操作员机构权限列表信息
     * @Description:
     * @date 2018/5/14 10:10
     * @author pflir@isoftstone.com
     * @params:
     */
    getUsrDptList(ops) {
        return request.post(`${this.getUsrDptListUrl}`, ops);
    }

    /**
     * @Title: 删除操作员机构权限信息
     * @Description:
     * @date 2018/5/14 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    delUsrDptInfo(ops) {
        return request.post(`${this.delUsrDptInfoUrl}`, ops);
    }

    /**
     * @Title: 批量删除操作员机构权限信息
     * @Description:
     * @date 2018/5/14 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    delUsrDptList(ops) {
        return request.post(`${this.delUsrDptListUrl}`, ops);
    }

    /**
     * @Title: 保存操作员机构权限信息
     * @Description:
     * @date 2018/5/14
     * @author pflir@isoftstone.com
     * @params:
     */
    saveUsrDptList(ops) {
        return request.post(`${this.saveUsrDptListUrl}`, ops);
    }

    /**
     *
     * 功能描述: 根据用户主键获取用户角色关联信息
     *
     * @param: 用户ID
     * @return: 角色列表
     * @auther: pfyangf@isoftstone.com
     * @date: 2018/7/6 10:58
     */
    getUserAssociateRoles(ops) {
        return request.post(`${this.getUserAssociateRolesUrl}`, ops);
    }

    /**
     * 功能描述: 产品权限: 根据用户和机构获取用户产品权限
     * @auther: pfyangf@isoftstone.com
     * @date: 2018/7/9 9:35
     */
    getUsrProdByUsrAndDpt(ops) {
        return request.post(`${this.getUsrProdByUsrAndDptUrl}`, ops);
    }

    /**
     *  获取顶级机构节点
     * @param ops
     * @returns {Observable<any>}
     */
    getOrgDptTreeNodeById(ops) {
        return request.post<any, ApiResult<any>>(`role/getOrgDptTreeNodeById`, ops);
    }
    /**
     *  根据机构id获取下级机构列表
     * @param ops
     * @returns {Observable<any>}
     */
    getOrgDptTreeListByPid(ops) {
        return request.post<any, ApiResult<any>>(`role/getOrgDptTreeListByPid`, ops);
    }
    /**
     * @Title: 数据同步
     * @Description:
     * @date 2018/4/12 16:17
     * @author jysuna@isoftstone.com
     * @params:
     */
    dataSynchronization(ops) {
        return request.post(`${this.dataSynchronizationUrl}`, ops)
    }
    
    /**
     *  复制出单弹框查询
     * @param ops
     * @returns {Observable<any>}
     */
    qureyAppPolicyListForCopy(ops) {
        return request.post(`${this.qureyAppPolicyListForCopyUrl}`, ops);
    }
}

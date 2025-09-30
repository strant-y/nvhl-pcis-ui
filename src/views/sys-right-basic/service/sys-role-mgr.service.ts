import request from '@/utils/request';

/*
 * 角色管理服务
 */
export class SysRoleMgrService {
    qrySysRoleListUrl = 'rolemgr/getSysRoleList'; // 获取角色信息列表
    saveRoleInfoUrl = 'rolemgr/saveRoleInfo'; // 保存角色信息
    delRoleInfoUrl = 'rolemgr/delRoleInfo'; // 删除角色信息
    qrySysRoleOpListUrl = 'role/getSysRoleOpList'; // 获取角色操作权限信息列表
    qryGrtOpListUrl = 'rolemgr/getOpTreeList'; // 获取操作权限树列表
    saveRoleOpListUrl = 'rolemgr/saveRoleOpList'; // 保存角色操作权限信息列表
    qryRoleUsrListUrl = 'rolemgr/getSysRoleOperatorList'; // 获取角色操作用户信息列表
    qryOrgDptTreeListUrl = 'rolemgr/getOrgDptTreeList'; // 获取组织机构树信息列表
    qryUsrListUrl = 'rolemgr/getSysOperatorList'; // 获取操作员信息列表
    saveRoleUsrListUrl = 'rolemgr/saveRoleUsrList'; // 保存角色用户信息列表
    delRoleUsrUrl = 'rolemgr/delRoleUsr'; // 删除角色用户信息
    loadSysRoleOpListUrl = 'rolemgr/loadSysRoleOpList'; // 加载角色操作权限信息
    getOpTreeListByRoleIdUrl = 'rolemgr/getOpTreeListByRoleId'; // 根据角色代码获取操作节点列表
    getRoleUsrListByRoleIdUrl = 'rolemgr/getRoleUsrListByRoleId'; // 根据角色代码获取角色用户信息列表


    /**
     * @Title: 获取角色信息列表
     * @Description:
     * @date 2018/4/16 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    qrySysRoleList(ops) {
        return request.post(`${this.qrySysRoleListUrl}`, ops);
    }

    /**
     * @Title: 保存角色信息
     * @Description:
     * @date 2018/4/17 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    saveRoleInfo(ops) {
        return request.post(`${this.saveRoleInfoUrl}`, ops);
    }

    /**
     * @Title: 删除角色信息
     * @Description:
     * @date 2018/4/25 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    delRoleInfo(ops) {
        return request.post(`${this.delRoleInfoUrl}`, ops);
    }

    /**
     * @Title: 获取角色操作权限信息列表
     * @Description:
     * @date 2018/4/18 10:10
     * @author pflir@isoftstone.com
     * @params:
     */
    qrySysRoleOpList(ops) {
        return request.post(`${this.qrySysRoleOpListUrl}`, ops);
    }

    /**
     * @Title: 获取角色操作权限信息列表
     * @Description:
     * @date 2018/4/18 10:10
     * @author pflir@isoftstone.com
     * @params:
     */

    qryGrtOpList(ops) {
        return request.post(`${this.qryGrtOpListUrl}`, ops);
    }

    /**
     * @Title: 加载角色操作权限信息列表
     * @Description:
     * @date 2018/4/18 10:10
     * @author pflir@isoftstone.com
     * @params:
     */

    loadSysRoleOpList(ops) {
        return request.post(`${this.loadSysRoleOpListUrl}`, ops);
    }

    /**
     * @Title: 保存角色操作权限信息列表
     * @Description:
     * @date 2018/4/19 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    saveRoleOpList(ops) {
        return request.post(`${this.saveRoleOpListUrl}`, ops);
    }

    /**
     * @Title: 获取角色用户信息列表
     * @Description:
     * @date 2018/4/23 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    qryRoleUsrList(ops) {
        return request.post(`${this.qryRoleUsrListUrl}`, ops);
    }

    /**
     * @Title: 删除角色用户信息
     * @Description:
     * @date 2018/4/25 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    delRoleUsr(ops) {
        return request.post(`${this.delRoleUsrUrl}`, ops);
    }

    /**
     * @Title: 获取组织机构树信息列表
     * @Description:
     * @date 2018/4/23 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    getOrgDptTreeList(ops) {
        return request.post(`${this.qryOrgDptTreeListUrl}`, ops);
    }

    /**
     * @Title: 获取操作员信息列表
     * @Description:
     * @date 2018/4/23 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    qryUsrList(ops) {
        return request.post(`${this.qryUsrListUrl}`, ops);
    }

    /**
     * @Title: 保存角色用户信息列表
     * @Description:
     * @date 2018/4/19 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    saveRoleUsrList(ops) {
        return request.post(`${this.saveRoleUsrListUrl}`, ops);
    }

    /**
     *  根据角色代码获取操作节点列表
     * @param ops
     * @returns {Observable<any>}
     */
    getOpTreeListByRoleId(ops) {
        return request.post(`${this.getOpTreeListByRoleIdUrl}`, ops);
    }
    /**
     *  根据角色代码获取角色用户信息列表
     * @param ops
     * @date 2018/7/11 15:10
     * @author pflir@isoftstone.com
     */
    getRoleUsrListByRoleId(ops) {
        return request.post(`${this.getRoleUsrListByRoleIdUrl}`, ops);
    }

}

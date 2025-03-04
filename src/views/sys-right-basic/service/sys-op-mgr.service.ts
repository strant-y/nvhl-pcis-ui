import {AxiosPromise} from "axios";
import {post} from "@/utils/http";
import {del} from "@/utils/http";
/*
 * 操作员管理服务
 */
export class SysOpMgrService {
    qrySysOpListUrl = 'role/qrySysOpList'; // 获取操作菜单信息列表
    initOpTreeListUrl = 'role/initOpTreeList'; // 获取操作菜单树列表
    loadSysOpInfoUrl = 'role/loadSysOpInfo'; // 加载操作菜单信息
    delSysOpInfoUrl = 'role/delSysOpInfo'; // 删除操作菜单信息
    saveSysOpInfoUrl = 'role/saveSysOpInfo'; // 保存操作菜单信息

    /**
     * @Title: 获取操作菜单树列表
     * @Description:
     * @date 2018/12/4 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    initOpTreeList(ops: any): AxiosPromise<any> {
        return post(`${this.initOpTreeListUrl}`, ops);
    }
    /**
     * @Title: 查询操作菜单列表
     * @Description:
     * @date 2018/12/4 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    qrySysOpList(ops: any): AxiosPromise<any> {
        return post(`${this.qrySysOpListUrl}`, ops);
    }
    /**
     * @Title: 加载操作菜单信息
     * @Description:
     * @date 2018/12/4 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    loadSysOpInfo(ops: any): AxiosPromise<any> {
        return post(`${this.loadSysOpInfoUrl}`, ops);
    }

    /**
     * @Title: 删除操作菜单信息
     * @Description:
     * @date 2018/12/4  20:20
     * @author pfyangf@isoftstone.com
     * @params:
     */
    delSysOpInfo(ops: any): AxiosPromise<any> {
        return post(`${this.delSysOpInfoUrl}`, ops);
    }

    /**
     * @Title: 保存操作菜单信息
     * @Description:
     * @date 2018/12/4
     * @author pflir@isoftstone.com
     * @params:
     */
    saveSysOpInfo(ops: any): AxiosPromise<any> {
        return post(`${this.saveSysOpInfoUrl}`, ops);
    }
}

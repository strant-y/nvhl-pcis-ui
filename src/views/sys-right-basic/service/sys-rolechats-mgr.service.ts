import {AxiosPromise} from "axios";
import {post} from "@/utils/http";
import {del} from "@/utils/http";
/*
 * 操作员管理服务
 */
export class SysRolechatsMgrService {

    getRoleChatsListUrl = 'chatsmgr/qryCommodityBasePage'; // 获取角色视图配置列表
    saveRoleChatsInfoUrl = 'chatsmgr/saveRoleChatsInfo'; // 保存角色视图配置信息
    loadRoleChatsInfoUrl = 'chatsmgr/loadRoleChatsInfo'; // 加载角色视图配置信息
    delRoleChatsByIdUrl = 'chatsmgr/delRoleChatsById'; // 删除角色视图配置信息
    /**
     * 获取角色视图配置列表
     * @param ops
     * @returns {Observable<any>}
     */
    getRoleChatsList(ops: any): AxiosPromise<any> {
        return post(`${this.getRoleChatsListUrl}`, ops);
    }
    /**
     * 保存角色视图配置信息
     * @param ops
     * @returns {Observable<any>}
     */
    saveRoleChatsInfo(ops: any): AxiosPromise<any> {
        return post(`${this.saveRoleChatsInfoUrl}`, ops);
    }

    /**
     * 加载角色视图配置信息
     * @param ops
     * @returns {Observable<any>}
     */
    loadRoleChatsInfo(ops: any): AxiosPromise<any> {
        return post(`${this.loadRoleChatsInfoUrl}`, ops);
    }

    /**
     * 删除角色视图配置信息
     * @param ops
     * @returns {Observable<any>}
     */
    delRoleChatsById(ops: any): AxiosPromise<any> {
        return post(`${this.delRoleChatsByIdUrl}`, ops);
    }
}

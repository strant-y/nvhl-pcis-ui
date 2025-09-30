import request from '@/utils/request';

/*
 * 角色管理服务
 */
export class AccumulatedCargo {

    /**
     * @Title: 获取列表
     * @Description:
     * @params:
     */
    // 'insurance/list'  胡乱写的
    qryList(ops) {
        return request.post('/insurance/list', {source: JSON.stringify(ops)});
    }

}

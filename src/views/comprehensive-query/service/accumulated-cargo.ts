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
    cumulativeRiskList(ops) {
      return request.post('/policy/cumulativeRiskList', {source: JSON.stringify(ops)});
    }

}

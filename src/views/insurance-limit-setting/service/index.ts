import request from '@/utils/request';

/*
 * 角色管理服务
 */
export class InsuranceLimit {

    /**
     * @Title: 获取列表
     * @Description:
     * @params:
     */
    // 'insurance/list'  胡乱写的
    qryList(ops) {
        return request.post('/insurance/list', ops);
    }

     /**
     * @Title: 保存
     * @Description:
     * @params:
     */
    // 'insurance/list'  胡乱写的
    saveData(ops) {
      return request.post('/insurance/save', ops);
  }
}

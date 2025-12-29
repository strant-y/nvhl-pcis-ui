import request from '@/utils/request';

/*
 * 单一和全部产品共同使用下面接口
 */
export class InsuranceLimit {

  /**
   * @Title: 获取列表
   * @Description:
   * @params:
   */
  qryList(ops) {
    return request.post('/custShare/getCustShareCondition', ops);
  }

  /**
  * @Title: 保存/修改 type  save/update
  * @Description:
  * @params: 
  */
  saveData(ops) {
    return request.post('/custShare/saveWebCustShareCoverage', ops);
  }
  /**
    * @Title: 删除
    * @Description:
    * @params:
    */
  delData(ops) {
    return request.post('/custShare/logicDelete', ops);
  }
  /**
    * @Title: 详情
    * @Description:
    * @params:
    */
  getDetail(ops) {
    return request.post('/custShare/getOneCustShar', ops);
  }
  /**
    * @Title: 获取新增按钮显示权限
    * @Description:
    * @params:
    */
  jurisdictionInsert(ops) {
    return request.post('/custShare/jurisdictionInsert', ops);
  }
}

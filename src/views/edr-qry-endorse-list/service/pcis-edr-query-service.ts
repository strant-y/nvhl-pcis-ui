import request from '@/utils/request';

/**
 * 批改相关查询服务
 */
export class PcisEdrQueryService {

  qryEndorseUrl = '/edr/qryEndorseList'; // 待批改单查询URL
  validEndorseUrl = '/edr/validEndorse'; // 批改前的验证
  xyvalidEndorseUrl = '/edr/ecargoValidEndorse'; // 协议批改前的验证
  validAddRecordUrl = '/edr/validAddRecord'; // 补录前的验证
  validAddNoRecordUrl = '/edr/validAddNoRecord'; // 补录前的验证
  findTInsrncBgnTmUrl = '/edr/findTInsrncBgnTm'; // 不记名补录前的时间查询
  getRelationDataInfoUrl = '/policy/getRelationDataInfo'; //额度明细查询
  getEdrCiRelUrl = '/policy/getEdrCiRel'; //据保单号获取联共保信息
  updateEdrCiInfoByPkIdUrl = '/policy/updateEdrCiInfoByPkId'; //据保单号修改影像上传方式

  /**
   * 待批改单查询
   */
  qryEndorseList(ops) {
    return request.post(`${this.qryEndorseUrl}`, ops)
  }

  /**
   * 补录前的验证
   */
  validAddRecord(ops) {
    return request.post(`${this.validAddRecordUrl}`, { source: JSON.stringify(ops) })
  }

  /**
   * 不记名补录前的验证
   */
  validAddNoRecord(ops) {
    return request.post(`${this.validAddNoRecordUrl}`, { source: JSON.stringify(ops) })
  }

  /**
   * 批改前的验证
   */
  validEndorse(ops) {
    return request.post(`${this.validEndorseUrl}`, { source: JSON.stringify(ops) })
  }
  /**
   * 协议批改前的验证
   */
  validEndorsexy(ops) {
    return request.post(`${this.xyvalidEndorseUrl}`, { source: JSON.stringify(ops) })
  }
  findTInsrncBgnTm(ops) {
    return request.post(`${this.findTInsrncBgnTmUrl}`, { source: JSON.stringify(ops) })
  }

  /**
     * 额度明细查询
     */
  getRelationDataInfo(ops) {
    return request.post(`${this.getRelationDataInfoUrl}`, { source: JSON.stringify(ops) })
  }
  /**
     * 变更联共保保单编号  查询
     */
  getEdrCiRel(ops) {
    return request.post(`${this.getEdrCiRelUrl}`, { source: JSON.stringify(ops) })
  }
  /**
     * 变更联共保保单编号 保存
     */
  updateEdrCiInfoByPkId(ops) {
    return request.post(`${this.updateEdrCiInfoByPkIdUrl}`, { source: JSON.stringify(ops) })
  }
 
}

import request from '@/utils/request';

/*
 * 投保	自定义录单
 */
export class CustomRecordingService {
  getProdEnableListUrl = 'proddef/getProdEnableList'; // 获取条款列表


    /**
     * @Title: 获取条款列表
     * @Description:
     * @date 2018/4/16 15:10
     * @author pflir@isoftstone.com
     * @params:
     */
    getProdEnableList(ops) {
        return request.get(`${this.getProdEnableListUrl}`,{
          params: ops || {},
        });
    }

}

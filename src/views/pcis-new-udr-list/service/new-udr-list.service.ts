// Import necessary modules and constants
import axios from 'axios';
// import { AppBaseUrl } from '@/constants/api';

import {AxiosPromise} from "axios";
import {post} from "@/utils/http";

/**
 * 核保查询相关服务
 */
export const NewUdrListService = () => {
  // 查询（待核保、暂存、上报）
  const qryNewUdrListUrl = 'underwriting/query/newUdrList';
  // 查询 （退回）
  const qryBackUdrListUrl = 'underwriting/query/backUdrList';
  // 查询 （待修改）
  const qryReturnUdrListUrl = 'underwriting/query/returnUdrList';
  // 查询 （撤回）
  const qryWithdrawUdrListUrl = 'underwriting/query/withdrawUdrList';
  // 查询（任务轨迹）
  const qryTaskVestigeUrl = 'underwriting/query/taskVestige';
  // 接收任务
  const hasReceivedUrl = 'workflow/hasReceived';
  // 一般批改，核保岗校验
  const checkEdrPoclyUrl = 'edr/checkEdrPocly';
  // 获取核保选项
  const getCUndrMrkUrl = 'policy/getCUndrMrk';
  // 获取退回人员
  const getBackClsListUrl = 'policy/getBackClsList';
  // 解除接收任务
  const removeReceivedUrl = 'workflow/removeReceived';
  // 撤回任务
  const withdrawUrl = 'workflow/withdraw';
  // 暂存单删除
  const delTmpPolicyUrl = 'policy/delTmpPolicy';
  // 根据申请单号获取批改类型
  const getBaseInfoByAppNoUrl = 'policy/getBaseInfoByAppNo';
  // 临分提交
  const facIntoRIUrl = 'underwriting/query/facIntoRI';
  // 临分分入查询
  const facPlyQueryUrl = 'underwriting/query/facPlyQuery';
  // 风险单位信息查询
  const riskUnitQueryUrl = 'reinsured/riskUnitQuery';
  // 保存风险单位时调用gateway后端地址路径
  const saveDataUrl = 'reinsured/saveData';
  // 价税分离信息查看时调用gateway后端地址路径
  const taxQueryUrl = 'underwriting/taxQuery';
  // 分保试算
  const tryCountInFoRIUrl = 'reinsured/tryCount';
  // 风险累积信息查询
  const queryRiskAddInfoUrl = 'underwriting/queryRiskAddInfoUrl';
  // 查看合约价税分离
  const checkedContractTaxUrl = 'underwriting/checkedContractTaxUrl';
  // 查看比例合约
  const viewContInfoUrl = 'reinsured/viewContInfoUrl';
  const queryContDtlUrl = 'reinsured/queryContDtl';

  // 是否预约分保
  const getOilOCContsUrl = 'reinsured/getOilOCConts';
  // 预约分保保存
  const saveOCContsUrl = 'reinsured/saveOCConts';
  // 临分提交
  const checkLibertyUrl = 'reinsured/checkLiberty';
  // 关联交易
  const getRelateBusUrl = 'policy/getRelateBus';
  // 预约分保删除
  const deleteOCContsUrl = 'reinsured/deleteOCConts';
  // 在线签名核保信息
  const getUdrOpnInfo = 'policy/getUdrOpnInfo';
  // 风险责任划分弹框查询信息
  const getReinsuredContData = 'reinsured/queryContData';
  // 再保比例分保合同除外责任接口
  const queryRiskCodelistUrl = 'reinsured/queryRiskCodelist';

  // 查询（待核保、暂存、上报）
  const getNewUdrList = async (ops: any) => {
    try {
      return post(`${qryNewUdrListUrl}`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  // 查询 （退回）
  const getBackUdrList = async (ops: any) => {
    try {
      return post(`${qryBackUdrListUrl}`, ops)
    } catch (error) {
      return handleError(error);
    }
  }

  // 查询 （待修改）
  const getReturnUdrList = async (ops: any) => {
    try {
      return post(`${qryReturnUdrListUrl}`, ops)
    } catch (error) {
      return handleError(error);
    }
  }

  // 查询 （撤回）
  const getWithdrawUdrList = async (ops: any) => {
    try {
      return post(`${qryWithdrawUdrListUrl}`, ops)
    } catch (error) {
      return handleError(error);
    }
  }

  // 查询 （任务轨迹）
  const getTaskVestige = async (ops: any) => {
    try {
      return post(`${qryTaskVestigeUrl}`, ops)
    } catch (error) {
      return handleError(error);
    }
  }

  // 接收
  const hasReceived = async (ops: any) => {
    try {
      return post(`${hasReceivedUrl}`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  // 一般批改，核保前校验
  const checkEdrPocly = async (ops: any) => {
    try {
      return post(`${checkEdrPoclyUrl}`, ops);
    } catch (error) {
      return handleError(error);
    }
  }
  // 获取核保选项
  const getCUndrMrk = async (ops: any) => {
    try {
      if(ops.cInquiryNo) {// 询价核保
        return post(`inquiry/getCUndrMrk`, ops);
      } else {
        return post(`${getCUndrMrkUrl}`, ops);
      }
    } catch (error) {
      return handleError(error);
    }
  }
  // 获取退回到指定核保级别人员
  const getBackClsList = async (ops: any) => {
    try {
      return post(`${getBackClsListUrl}`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  // 解除接收
  const removeReceived = async (ops: any) => {
    try {
      return post(`${removeReceivedUrl}`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  // 撤回任务
  const withdraw = async (ops: any) => {
    try {
      return post(`${withdrawUrl}`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * @Title: 暂存单删除
   * @Description:
   * @date 2018/3/27 15:22
   * @author pfyangf@isoftstone.com
   * @params:
   */
  const delTmpPolicy = async (ops: any) => {
    try {
      return post(`${delTmpPolicyUrl}`, ops)
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * 根据申请单号获取批改原因代码
   * @param ops
   * @returns {Observable<any>}
   */
  const getBaseInfoByAppNo = async (ops: any) => {
    try {
      return post(`${getBaseInfoByAppNoUrl}`, ops)
    } catch (error) {
      return handleError(error);
    }
  }

  const facIntoRI = async (ops: any) => {
    try {
      return post(`${facIntoRIUrl}`, ops)
    } catch (error) {
      return handleError(error);
    }
  }
  // 查看比例合约
  const viewContInfo1 = async (ops: any) => {
    try {
      return post(`${viewContInfoUrl}`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * 临分分入查询
   */
  const facPlyQuery = async (ops: any) => {
    try {
      return post(`${facPlyQueryUrl}`, ops)
    } catch (error) {
      return handleError(error);
    }
  }

  // 点击划分风险单位按钮调用再保接口
  const riskUnitQuery = async (ops: any) => {
    try {
      return post(`${riskUnitQueryUrl}`, ops);
    } catch (error) {
      return handleError(error);
    }
  }
  // 保存风险单位
  const saveData = async (ops: any) => {
    try {
      return post(`${saveDataUrl}`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  // 价税分离查看
  const taxQuery = async (ops: any) => {
    try {
      return post(`${taxQueryUrl}`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  // 分保试算
  const tryCountInFoRI = async (ops: any) => {
    try {
      return post(`${tryCountInFoRIUrl}`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  // 风险累积查询
  const queryRiskAddInfo = async (ops: any) => {
    try {
      return post(`${queryRiskAddInfoUrl}`, ops);
    } catch (error) {
      return handleError(error);
    }
  };

  // 查看合约价税分离
  const checkedContractTax = async (ops: any) => {
    try {
      return post(`${checkedContractTaxUrl}`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  // 查看比例合约
  const viewContInfo = async (ops: any) => {
    try {
      return post(`${viewContInfoUrl}`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  const queryContDtl = async (ops: any) => {
    try {
      return post(`${queryContDtlUrl}`, ops)
    } catch (error) {
      return handleError(error);
    }
  }

  const getOilOCConts = async (ops: any) => {
    try {
      return post(`${getOilOCContsUrl}`, ops)
    } catch (error) {
      return handleError(error);
    }
  }

  const saveOCConts = async (ops: any) => {
    try {
      return post(`${saveOCContsUrl}`, ops)
    } catch (error) {
      return handleError(error);
    }
  }

  const deleteOCConts = async (ops: any) => {
    try {
      return post(`${deleteOCContsUrl}`, ops)
    } catch (error) {
      return handleError(error);
    }
  }

  const checkLiberty = async (ops: any) => {
    try {
      return post(`${checkLibertyUrl}`, ops)
    } catch (error) {
      return handleError(error);
    }
  }

  const getRelateBus = async (ops: any) => {
    try {
      return post(`${getRelateBusUrl}`, ops)
    } catch (error) {
      return handleError(error);
    }
  }

  // 获取历史核保信息
  const getUdrOpn = async (ops: any) => {
    try {
      return post(`${getUdrOpnInfo}`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  // Error handling function
  const handleError = (error: any) => {
    const errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    throw new Error(errMsg);
  };

  // 获取风险责任划分弹框基本信息
  const getReinsuredData = async (ops: any) => {
    try {
      return post(`${getReinsuredContData}`, ops);
    } catch (error) {
      return handleError(error);
    }
  };

  // 再保比例分保合同除外责任接口
  const queryRiskCodelist = async (ops: any) => {
    try {
      return post(`${queryRiskCodelistUrl}`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  // 保存风险单位
  const saveRiskData = async (ops: any) => {
    try {
      return post(`/reinsured/saveRiskData`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  //查询风险单位划分
  const riskQueryData = async (ops: any) => {
    try {
      return post(`/reinsured/riskQueryData`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  // 查询标的地址下拉选项
  const queryComponentCodeList = async (ops: any) => {
    try {
      return post(`reinsured/queryComponentCodeList`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  // 询价查询（待核保）
  const getInquiryNewUdrList = async (ops: any) => {
    try {
      return post(`underwriting/query/newUdrInquiryList`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  // 询价查询根据询价单号查询基本信息
  const getBaseInfoByInquiryNo = async (ops: any) => {
    try {
      return post(`policy/getBaseInfoByInquiryNo`, ops);
    } catch (error) {
      return handleError(error);
    }
  }
  
  // 询价查询（核保退回）
  const backInquiryUdrList = async (ops: any) => {
    try {
      return post(`underwriting/query/backInquiryUdrList`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  // 询价查询（核保通过）
  const getInquiryPolicyList = async (ops: any) => {
    try {
      return post(`policy/getInquiryPolicyList`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  //查询风险单位划分-询价
  const riskQueryDataXJ = async (ops: any) => {
    try {
      return post(`/reinsured/riskQueryDataXJ`, ops);
    } catch (error) {
      return handleError(error);
    }
  }
  
  // 获取风险责任划分弹框基本信息-询价
  const getReinsuredDataXJ = async (ops: any) => {
    try {
      return post(`/reinsured/queryContDataXJ`, ops);
    } catch (error) {
      return handleError(error);
    }
  };

  // 再保比例分保合同除外责任接口-询价
  const queryRiskCodelistXJ = async (ops: any) => {
    try {
      return post(`/reinsured/queryRiskCodelistXJ`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  // 分保试算-询价
  const tryCountInFoRIXJ = async (ops: any) => {
    try {
      return post(`/reinsured/tryCountXJ`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  // 查询标的地址下拉选项-询价
  const queryComponentCodeListXJ = async (ops: any) => {
    try {
      return post(`reinsured/queryComponentCodeListXJ`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  // 点击划分风险单位按钮调用再保接口-询价
  const riskUnitQueryXJ = async (ops: any) => {
    try {
      return post(`reinsured/riskUnitQueryXJ`, ops);
    } catch (error) {
      return handleError(error);
    }
  }

  // 保存风险单位-询价
  const saveDataXJ = async (ops: any) => {
    try {
      return post('reinsured/saveDataXJ', ops);
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * 出单任务处理-查询
   *
   * @param queryParams
   */
  const selectTask = async (queryParams: any): AxiosPromise<any> => {
    return post(`/task/work/selectTask`, queryParams);
  }
  
  /**
   * 核保任务查询
   *
   * @param queryParams
   */
  const getAppTask = async (queryParams: any): AxiosPromise<any> => {
    return post(`/task/getAppTask`, queryParams);
  }
  
  /**
   * 询价任务查询
   *
   * @param queryParams
   */
  const getInquiryTask = async (queryParams: any): AxiosPromise<any> => {
    return post(`/task/getInquiryTask`, queryParams);
  }

  /**
   * 历史单查询
   *
   * @param queryParams
   */
  const getHistoryList = async (queryParams: any): AxiosPromise<any> => {
    return post(`/policy/getHistoryList`, queryParams);
  }

  /**
   * 险位信息查询
   *
   * @param queryParams
   */
  const riskQueryDataPage = async (queryParams: any): AxiosPromise<any> => {
    return post(`/reinsured/riskQueryDataPage`, queryParams);
  }

  /**
   * 风险单位下载模板
   *
   * @param queryParams
   */
  const downloadDistTemplate = async (queryParams: any): AxiosPromise<any> => {
    return post(`/policy/downloadDistTemplate`, queryParams, {
      responseType: 'blob'
    });
  }

  /**
   * 风险单位导入
   *
   * @param queryParams
   */
  const importUnit = async (queryParams: any): AxiosPromise<any> => {
    return post(`/reinsured/importUnit`, queryParams);
  }

  /**
   * 风险单位导出
   *
   * @param queryParams
   */
  const exportUnit = async (queryParams: any): AxiosPromise<any> => {
    return post(`/policy/exportUnit`, queryParams, {
      responseType: 'blob'
    });
  }

  return {
    getNewUdrList,
    getBackUdrList,
    getReturnUdrList,
    getWithdrawUdrList,
    getTaskVestige,
    hasReceived,
    checkEdrPocly,
    getCUndrMrk,
    getBackClsList,
    removeReceived,
    withdraw,
    delTmpPolicy,
    getBaseInfoByAppNo,
    facIntoRI,
    viewContInfo1,
    facPlyQuery,
    riskUnitQuery,
    saveData,
    taxQuery,
    tryCountInFoRI,
    queryRiskAddInfo,
    checkedContractTax,
    viewContInfo,
    queryContDtl,
    getOilOCConts,
    saveOCConts,
    deleteOCConts,
    checkLiberty,
    getRelateBus,
    getUdrOpn,
    getReinsuredData,
    queryRiskCodelist,
    saveRiskData,
    riskQueryData,
    queryComponentCodeList,
    getInquiryNewUdrList,
    getBaseInfoByInquiryNo,
    backInquiryUdrList,
    getInquiryPolicyList,
    riskQueryDataXJ,
    getReinsuredDataXJ,
    queryRiskCodelistXJ,
    tryCountInFoRIXJ,
    queryComponentCodeListXJ,
    riskUnitQueryXJ,
    saveDataXJ,
    selectTask,
    getAppTask,
    getInquiryTask,
    getHistoryList,
    riskQueryDataPage,
    downloadDistTemplate,
    importUnit,
    exportUnit,
  };
}

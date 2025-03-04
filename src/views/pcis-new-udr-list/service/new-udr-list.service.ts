// Import necessary modules and constants
import axios from 'axios';
// import { AppBaseUrl } from '@/constants/api';

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

  // 查询（待核保、暂存、上报）
  const getNewUdrList = async (ops: any) => {
    try {
      const response = await axios.post(`${qryNewUdrListUrl}`, { params: ops });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  // 查询 （退回）
  const getBackUdrList = async (ops: any) => {
    try {
      const response = await axios.post(`${qryBackUdrListUrl}`, { params: ops })
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  // 查询 （待修改）
  const getReturnUdrList = async (ops: any) => {
    try {
      const response = await axios.post(`${qryReturnUdrListUrl}`, { params: ops })
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  // 查询 （撤回）
  const getWithdrawUdrList = async (ops: any) => {
    try {
      const response = await axios.post(`${qryWithdrawUdrListUrl}`, { params: ops })
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  // 查询 （任务轨迹）
  const getTaskVestige = async (ops: any) => {
    try {
      const response = await axios.post(`${qryTaskVestigeUrl}`, { params: ops })
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  // 接收
  const hasReceived = async (ops: any) => {
    try {
      const response = await axios.post(`${hasReceivedUrl}`, { source: JSON.stringify(ops) });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  // 一般批改，核保前校验
  const checkEdrPocly = async (ops: any) => {
    try {
      const response = await axios.post(`${checkEdrPoclyUrl}`, { source: JSON.stringify(ops) });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }
  // 获取核保选项
  const getCUndrMrk = async (ops: any) => {
    try {
      const response = await axios.post(`${getCUndrMrkUrl}`, { source: JSON.stringify(ops) });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }
  // 获取退回到指定核保级别人员
  const getBackClsList = async (ops: any) => {
    try {
      const response = await axios.post(`${getBackClsListUrl}`, { source: JSON.stringify(ops) });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  // 解除接收
  const removeReceived = async (ops: any) => {
    try {
      const response = await axios.post(`${removeReceivedUrl}`, { source: JSON.stringify(ops) });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  // 撤回任务
  const withdraw = async (ops: any) => {
    try {
      const response = await axios.post(`${withdrawUrl}`, { source: JSON.stringify(ops) });
      return response.data;
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
      const response = await axios.post(`${delTmpPolicyUrl}`, { source: JSON.stringify(ops) })
      return response.data;
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
      const response = await axios.post(`${getBaseInfoByAppNoUrl}`, { source: JSON.stringify(ops) })
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  const facIntoRI = async (ops: any) => {
    try {
      const response = await axios.post(`${facIntoRIUrl}`, { source: JSON.stringify(ops) })
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }
  // 查看比例合约
  const viewContInfo1 = async (ops: any) => {
    try {
      const response = await axios.post(`${viewContInfoUrl}`, { source: JSON.stringify(ops) });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * 临分分入查询
   */
  const facPlyQuery = async (ops: any) => {
    try {
      const response = await axios.post(`${facPlyQueryUrl}`, { source: JSON.stringify(ops) })
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  // 点击划分风险单位按钮调用再保接口
  const riskUnitQuery = async (ops: any) => {
    try {
      const response = await axios.post(`${riskUnitQueryUrl}`, { source: JSON.stringify(ops) });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }
  // 保存风险单位
  const saveData = async (ops: any) => {
    try {
      const response = await axios.post(`${saveDataUrl}`, { source: JSON.stringify(ops) });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  // 价税分离查看
  const taxQuery = async (ops: any) => {
    try {
      const response = await axios.post(`${taxQueryUrl}`, { source: JSON.stringify(ops) });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  // 分保试算
  const tryCountInFoRI = async (ops: any) => {
    try {
      const response = await axios.post(`${tryCountInFoRIUrl}`, { source: JSON.stringify(ops) });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  // 风险累积查询
  const queryRiskAddInfo = async (ops: any) => {
    try {
      const response = await axios.post(`${queryRiskAddInfoUrl}`, { source: JSON.stringify(ops) });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  };

  // 查看合约价税分离
  const checkedContractTax = async (ops: any) => {
    try {
      const response = await axios.post(`${checkedContractTaxUrl}`, { source: JSON.stringify(ops) });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  // 查看比例合约
  const viewContInfo = async (ops: any) => {
    try {
      const response = await axios.post(`${viewContInfoUrl}`, { source: JSON.stringify(ops) });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  const queryContDtl = async (ops: any) => {
    try {
      const response = await axios.post(`${queryContDtlUrl}`, { source: JSON.stringify(ops) })
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  const getOilOCConts = async (ops: any) => {
    try {
      const response = await axios.post(`${getOilOCContsUrl}`, { source: JSON.stringify(ops) })
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  const saveOCConts = async (ops: any) => {
    try {
      const response = await axios.post(`${saveOCContsUrl}`, { source: JSON.stringify(ops) })
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  const deleteOCConts = async (ops: any) => {
    try {
      const response = await axios.post(`${deleteOCContsUrl}`, { source: JSON.stringify(ops) })
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  const checkLiberty = async (ops: any) => {
    try {
      const response = await axios.post(`${checkLibertyUrl}`, { source: JSON.stringify(ops) })
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  const getRelateBus = async (ops: any) => {
    try {
      const response = await axios.post(`${getRelateBusUrl}`, { source: JSON.stringify(ops) })
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  // 获取历史核保信息
  const getUdrOpn = async (ops: any) => {
    try {
      const response = await axios.post(`${getUdrOpnInfo}`, { source: JSON.stringify(ops) });
      return response.data;
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
  };
}

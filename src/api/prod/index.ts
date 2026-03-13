import { AxiosPromise } from "axios";
import { post } from "@/utils/http";
import { get } from "@/utils/http";
import { del } from "@/utils/http";
import { LocalBaseApi } from "../config";
import request from '@/utils/request'
/**
 * 获取要素列表
 *
 * @param queryParams
 */
export function getFactorList(queryParams: any): AxiosPromise<any> {
  return post(`/prod/getFactorList`, queryParams);
}

export function getInputGroupList(queryParams: any): AxiosPromise<any> {
  return post(`/prod/getInputGroupList`, queryParams);
}

/**
 * 获取尾部按钮信息
 *
 * @param queryParams
 */
export function getButtonByFacKey(queryParams: any): AxiosPromise<any> {
  return post(`/prod/getButtonByFacKey`, queryParams);
}

/**
 * 删除要素信息
 *
 * @param queryParams
 */
export function deleteFactorBykey(queryParams: any): AxiosPromise<any> {
  return post(`/prod/deleteFactorBykey`, queryParams);
}

/**
 * 保存要素信息
 *
 * @param queryParams
 */
export function saveFactor(queryParams: any): AxiosPromise<any> {
  return post(`/prod/saveFactor`, queryParams);
}

export function saveDistfrom(queryParams: any): AxiosPromise<any> {
  return post(`/prod/saveDistfrom`, queryParams);
}

export function getPrdTermByProd(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/getPrdTermByProd`, queryParams);
}

export function getFactorTermByProd(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/getFactorTermByProd`, queryParams);
}

/**
 * 获取组件信息列表
 *
 * @param queryParams
 */
export function getComponentList(queryParams: any): AxiosPromise<any> {
  return post(`/prod/getComponentList`, queryParams);
}

/**
 * 获取组件信息列表
 *
 * @param queryParams
 */
export function queryPageComponents(queryParams: any): AxiosPromise<any> {
  return post(`/prod/queryPageComponents`, queryParams);
}
/**
 * 配置批改比较项
 * **/
export function initProdEdrRsnItemList(queryParams: any): AxiosPromise<any> {
  return post(`proddef/initProdEdrRsnItemList`, queryParams);
}
/**
 * 配置批改比较项保存
 * **/
export function saveProdEdrRsnItemList(queryParams: any): AxiosPromise<any> {
  return post(`proddef/saveProdEdrRsnItemList`, queryParams);
}
/**
 * 获取全部组件信息
 *
 * @param queryParams
 */
export function queryPageComponentList(queryParams: any): AxiosPromise<any> {
  return post(`/prod/queryPageComponentList`, queryParams);
}

export function queryFactorListByComCode(queryParams: any): AxiosPromise<any> {
  return post(`/prod/queryFactorListByComCode`, queryParams);
}

/**
 * 获取组件信息列表
 *
 * @param queryParams
 */
export function getProdList(queryParams: any): AxiosPromise<any> {
  return post(`/prod/getProdList`, queryParams);
}

/**
 * 获取组件信息列表
 *
 * @param queryParams
 */
export function savePageComonent(queryParams: any): AxiosPromise<any> {
  return post(`/prod/savePageComonent`, queryParams);
}

/**
 * 保存产品基本信息
 *
 * @param queryParams
 */
export function saveProdInfo(queryParams: any): AxiosPromise<any> {
  return post(`/prod/saveProdInfo`, queryParams);
}
/**
 * 获取产品信息大对象
 *
 * @param queryParams
 */
export function getProdInfos(queryParams: any): AxiosPromise<any> {
  return post(`/prod/getProdInfos`, queryParams);
}
/**
 * 获取产品信息详情
 *
 * @param queryParams
 */
export function getProducts(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/get`, queryParams);
}
/**
 * 获取商品计划列表
 *
 * @param queryParams
 */
export function queryCommodityPlanList(queryParams: any): AxiosPromise<any> {
  return post(`/commodity/queryCommodityPlanList`, queryParams);
}
/**
 * 获取商品详情
 *
 * @param queryParams
 */
export function getCommodityBase(queryParams: any): AxiosPromise<any> {
  return post(`/commodity/getCommodityBase`, queryParams);
}

/**
 * 保存产品页面信息
 *
 * @param queryParams
 */
export function saveProdPages(queryParams: any): AxiosPromise<any> {
  return post(`/prod/saveProdPages`, queryParams);
}

/**
 * 获取组件要素列表,绑定组件要素
 *
 * @param queryParams
 */
export function querySelectorList(queryParams: any): AxiosPromise<any> {
  return post(`/prod/querySelectorList`, queryParams);
}

/**
 * 根据组件Key获取组件相关信息
 * @param queryParams
 * @returns
 */
export function getComponentByKey(queryParams: any): AxiosPromise<any> {
  return post(`/prod/getComponentByKey`, queryParams);
}

/**
 * 根据组件Key获取组件相关信息
 * @param queryParams
 * @returns
 */
export function getComponentViewByKey(queryParams: any): AxiosPromise<any> {
  return post(`/prod/getComponentViewByKey`, queryParams);
}

/**
 * 根据组件tab进行全量跟新组件
 * @param queryParams 
 * @returns 
 */
export function releaseByComptype(queryParams: any): AxiosPromise<any> {
  return post(`/prod/releaseByComptype`, queryParams);
}

/**
 * 根据组件Key获取组件相关信息
 * @param queryParams
 * @returns
 */
export function getPageViewByPage(queryParams: any): AxiosPromise<any> {
  return post(`/prod/getPageViewByPage`, queryParams);
}

export function copyComponent(queryParams: any): AxiosPromise<any> {
  return post(`/prod/copyComponent`, queryParams);
}

/**
 * 保存组件配置
 *
 * @param queryParams
 */
export function saveComponent(queryParams: any): AxiosPromise<any> {
  return post(`/prod/saveComponent`, queryParams);
}

/**
 * 保存组件配置
 *
 * @param queryParams
 */
export function SaveComponentFactors(queryParams: any): AxiosPromise<any> {
  return post(`/prod/SaveComponentFactors`, queryParams);
}

/**
 * 发布页面配置
 *
 * @param queryParams
 */
export function releasePage(queryParams: any): AxiosPromise<any> {
  return post(`/prod/releasePage`, queryParams);
}

/**
 * 
 * @param queryParams 全量产品更新
 * @returns 
 */
export function releaseAllPage(queryParams: any): AxiosPromise<any> {
  return post(`/prod/releaseAllPage`, queryParams);
}

/**
 * savePage
 *
 * @param queryParams
 */
export function saveAll(queryParams: any): AxiosPromise<any> {
  return post(`/prod/saveAll`, queryParams);
}

/**
 * getPage
 *
 * @param queryParams
 */
export function getProductPage(queryParams: any): AxiosPromise<any> {
  return post(`/prod/getProductPage`, queryParams);
}

/**
 * 获取险类列表
 *
 * @param queryParams
 */
export function getBasicKindList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/getBasicKindList`, queryParams);
}
/**
 * 查询数据处理任务
 */
export function qryTerminationDataList(queryParams: any): AxiosPromise<any> {
  return post(`/oa/qryTerminationDataList`, queryParams);
}

/**
 * 操作数据处理开关
 */
export function dealTerminationData(ops: any): AxiosPromise<any> {
    return post(`oa/dealTerminationData`, ops);
}
/**
 * 修改险类状态
 *
 * @param queryParams
 */
export function changeKindStatus(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/changeKindStatus`, queryParams);
}
/**
 * 提交审核
 *
 * @param queryParams
 */
export function auditSubmit(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/auditSubmit`, queryParams);
}
export function changeSpecStatus(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/changeSpecStatus`, queryParams);
}
/**
 * 修改责任状态
 *
 * @param queryParams
 */
export function changeRiskStatus(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/changeRiskStatus`, queryParams);
}
/**
 * 修改条款启用禁用状态
 *
 * @param queryParams
 */
export function changeTermStatus(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/changeTermStatus`, queryParams);
}

/**
 * 保存险类信息
 *
 * @param queryParams
 */
export function saveKindInfo(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/saveKindInfo`, queryParams);
}
/**
 * 修改批改原因启用禁用状态
 *
 * @param queryParams
 */
export function changeProdEdrRsnStatus(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/changeProdEdrRsnStatus`, queryParams);
}

/**
 * 责任配置列表
 *
 * @param queryParams
 */
export function getBasicRiskList(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/getBasicRiskList`, queryParams);
}

/**
 * 编辑保存责任配置信息
 *
 * @param queryParams
 */
export function saveRiskInfo(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/saveRiskInfo`, queryParams);
}

   

/**
 * 特约配置列表
 *
 * @param queryParams
 */
export function qryProdFixSpecList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/qryProdFixSpecList`, queryParams);
}

/**
 * 编辑保存特约配置信息
 *
 * @param queryParams
 */
export function savePrdFixSpecInfo(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/savePrdFixSpecInfo`, queryParams);
}

/**
 * 险别配置列表
 *
 * @param queryParams
 */
export function getCvrgList(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/getCvrgList`, queryParams);
}

/**
 * 条款配置信息获取信息
 *
 * @param queryParams
 */
export function getTRFactorJson(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/getTRFactorJson`, queryParams);
}

export function qryProdTermCf(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/qryProdTermCf`, queryParams);
}

export function qryProdRelTermRiskList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/qryProdRelTermRiskList`, queryParams);
}
export function qryRelTermList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/qryRelTermList`, queryParams);
}
export function saveGroupInfo(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/saveGroupInfo`, queryParams);
}

export function getGroupInfo(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/getGroupInfo`, queryParams);
}

export function getTitleInfoByGroup(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/getTitleInfoByGroup`, queryParams);
}

export function saveTermColByTerm(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/saveTermColByTerm`, queryParams);
}

/**
 * 条款配置信息获取
 *
 * @param queryParams
 */
export function getTRFactorList(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/getTRFactorList`, queryParams);
}

export function getTermFactorInfo(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/getTermFactorInfo`, queryParams);
}

export function saveTermFactorInfo(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/saveTermFactorInfo`, queryParams);
}

/**
 * 保存条则要素关系信息
 *
 * @param queryParams
 */
export function saveTRFactorList(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/saveTRFactorList`, queryParams);
}


/**
 * 编辑保存特约配置信息
 *
 * @param queryParams
 */
export function saveInruanceTypeBasicInfo(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/save`, queryParams);
}

/**
 * 险别配置-关联责任列表
 * @param queryParams
 * @returns
 */
export function getCvrgRiskRelList(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/getCvrgRiskRelList`, queryParams);
}
/**
 * 条款配置-关联责任弹框列表
 * @param queryParams
 * @returns
 */
export function queryTermRiskRelList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/queryTermRiskRelList`, queryParams);
}
/* 条款配置-关联责任列表*/
export function saveTermRiskRel(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/saveTermRiskRel`, queryParams);
}

/**
 * 险别配置-删除关联责任列表
 * @param queryParams
 * @returns
 */
export function delRiskRel(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/delRiskRel`, queryParams);
}
/* 条款配置-删除关联附加险列表*/
export function deleteTermRel(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/deleteTermRel`, queryParams);
}
/* 删除险别配置-关联责任列表*/
export function deleteTermRiskRel(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/deleteTermRiskRel`, queryParams);
}
/* 获取条款配置-条款详情*/
export function getPrdTermInfo(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/getPrdTermInfo`, queryParams);
}
/* 条款预览-条款详情*/
export function viewPdfProposal(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/viewPdfProposal`, queryParams, { responseType: 'blob' });
}
/* 条款预览-条款详情*/
export function viewPdfProposalPost(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/viewPdfProposal`, queryParams);
}
/**
 * 条款配置-关联附加条款列表
 * @param queryParams
 * @returns
 */
export function queryTermRelList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/queryTermRelList`, queryParams);
}
/* 条款配置-关联附加条款按钮弹框列表*/
export function queryTermToRelList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/queryTermToRelList`, queryParams);
}

/**
 * 险别配置-关联责任弹框列表
 * @param queryParams
 * @returns
 */
export function getRiskList(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/getRiskList`, queryParams);
}

/**
 * 险别配置-关联责任弹框中的大类代码下拉列表
 * @param queryParams
 * @returns
 */
export function query(queryParams: any): AxiosPromise<any> {
  return post(`/codelist/query`, queryParams);
}
export function queryPlan(queryParams: any): AxiosPromise<any> {
  return post(`/codelist/query`, queryParams);
}

/**
 * 险别配置-关联责任弹框中列表选中行保存
 * @param queryParams
 * @returns
 */
export function saveCvrgRiskRel(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/saveCvrgRiskRel`, queryParams);
}

/**
 * 险别配置-关联条款列表
 *
 * @param queryParams
 */
export function qryProdTermList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/qryProdTermList`, queryParams);
}

/**
 * 险别配置-修改关联条款弹框中内容保存
 * @param queryParams
 * @returns
 */
export function saveCvrgRelTerm(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/saveCvrgRelTerm`, queryParams);
}

/**
 * 险别配置-增加条款弹框中内容保存
 *
 * @param queryParams
 */
export function savePrdTermInfo(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/savePrdTermInfo`, queryParams);
}

/**
 * 险别配置-删除条款
 *
 * @param queryParams
 */
export function delTermById(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/delTermById`, queryParams);
}

/**
* 险别配置-附加险列表
*
* @param queryParams
*/
export function getCvrgRelList(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/getCvrgRelList`, queryParams);
}

/**
 * 险别配置-附加险弹框中内容待保存列表
 *
 * @param queryParams
 */
export function getCvrgToRelList(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/getCvrgToRelList`, queryParams);
}

/**
 * 产品工厂-列表查询
 *
 * @param queryParams
 */
export function getProFactoryList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/getProdList`, queryParams);
}
/**
 * 产品工厂-产品已关联主条款列表
 *
 * @param queryParams
 */
export function qryProdRelTermList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/qryProdRelTermList`, queryParams);
}
/**
 * 产品工厂-列表内修改某一行状态
 */
export function changeStatus(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/changeStatus`, queryParams);
}

/**
 * 产品工厂-基本信息保存
 *
 * @param queryParams
 */
export function saveProInfo(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/save`, queryParams);
}

/**
 * 产品工厂-复制
 *
 * @param queryParams
 */
export function copyProInfo(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/copy`, queryParams);
}

/**
 * 产品工厂-关联主险查询/关联附加险查询
 *
 * @param queryParams
 */
export function qryProdRelCvrgList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/qryProdRelCvrgList`, queryParams);
}

/**
 * 产品工厂-关联附加险保存
 *
 * @param queryParams
 */
export function associationCvrg(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/associationCvrg`, queryParams);
}
export function associationTerm(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/associationTerm`, queryParams);
}
export function unAssociationTerm(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/unAssociationTerm`, queryParams);
}
/**
 * 产品工厂-关联附加险保存
 *
 * @param queryParams
 */
export function saveCvrgRel(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/saveCvrgRel`, queryParams);
}
export function saveTermRel(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/saveTermRel`, queryParams);
}

/**
 * 产品工厂-关联特别约定查询
 *
 * @param queryParams
 */
export function qryRefProdAndSpecList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/qryRefProdAndSpecList`, queryParams);
}
/**
 * 产品工厂-关联特别约定修改
 *
 * @param queryParams
 */
export function editSpecStatus(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/editSpecStatus`, queryParams);
}
export function unAssociationSpec(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/unAssociationSpec`, queryParams);
}

/**
 * 产品工厂-关联特别约定弹框列表查询
 *
 * @param queryParams
 */
export function getUnbindSpecRefProd(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/getUnbindSpecRefProd`, queryParams);
}

/**
 * 产品工厂-关联特别约定弹框保存
 *
 * @param queryParams
 */
export function associationSpec(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/associationSpec`, queryParams);
}

/**
 * 产品工厂-新增特别约定弹框保存
 *
 * @param queryParams
 */
export function saveAssociationSpec(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/saveAssociationSpec`, queryParams);
}

/**
 * 产品工厂-查询关联健康告知
 *
 * @param queryParams
 */
export function getUnbindHealthNotify(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/getUnbindHealthNotify`, queryParams);
}

/**
 * 产品工厂-新增关联健康告知弹框保存
 *
 * @param queryParams
 */
export function saveHealthNotifyRel(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/saveHealthNotifyRel`, queryParams);
}
/**
 * 产品工厂-删除关联健康告知
 *
 * @param queryParams
 */
export function delHealthNotify(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/delHealthNotify`, queryParams);
}

/**
 * 产品工厂-新增关联健康告知
 *
 * @param queryParams
 */
export function saveHealthNotify(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/saveHealthNotify`, queryParams);
}

/**
 * 查询产品业务规则列表
 *
 * @param queryParams  /proddef/qryProdRuleList
 */                             
export function qryPrdProdRuleList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/qryPrdProdRuleList`, queryParams);
}


/**
 * 产品工厂-查询业务规则
 *
 * @param queryParams
 */
export function qryRefProdAndRuleList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/qryRefProdAndRuleList`, queryParams);
}

/**
 * 产品工厂-新增业务规则
 *
 * @param queryParams
 */
export function savePrdRuleInfo(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/savePrdRuleInfo`, queryParams);
}                     

/**
 * 产品工厂-删除业务规则
 *
 * @param queryParams
 */
export function delPrdRuleInfo(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/delPrdRuleInfo`, queryParams);
}

/**
 * 产品工厂-查询关联保费计算规则
 *
 * @param queryParams
 */
export function qryVersionInfoList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/qryVersionInfoList`, queryParams);
}

/**
 * 产品工厂-新增保费计算规则
 *
 * @param queryParams
 */
export function saveVersionInfo(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/saveVersionInfo`, queryParams);
}
export function delVersionById(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/delVersionById`, queryParams);
}

/**
 * 产品工厂-查询见费出单规则
 *
 * @param queryParams
 */
export function qryPaySeemoneyConfigList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/qryPaySeemoneyConfigList`, queryParams);
}
export function delPaySeemoneyConfigById(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/delPaySeemoneyConfigById`, queryParams);
}

/**
 * 产品工厂-新增见费出单规则
 *
 * @param queryParams
 */
export function savePaySeemoneyConfigInfo(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/savePaySeemoneyConfigInfo`, queryParams);
}

/**
 * 产品工厂-查询费率表信息
 *
 * @param queryParams
 */
export function qryProdCvrgFeeInfoPage(queryParams: any): AxiosPromise<any> {
  return post(`/plan/qryProdCvrgFeeInfoPage`, queryParams);
}
/**
 * 产品工厂-查询费率表信息
 *
 * @param queryParams
 */
export function qryProdTermFeeInfoPage(queryParams: any): AxiosPromise<any> {
  return post(`/plan/qryProdTermFeeInfoPage`, queryParams);
}
/**
 * 产品工厂-删除费率表信息
 */
export function delProdPlanCvrgFeeInfoById(queryParams: any): AxiosPromise<any> {
  return post(`/plan/delProdPlanCvrgFeeInfoById`, queryParams);
}
/**
 * 产品工厂-删除费率表信息
 */
export function deleteFeeRateByProdNo(queryParams: any): AxiosPromise<any> {
  return post(`/plan/deleteFeeRateByProdNo`, queryParams);
}

/**
 * 产品工厂-费率信息保存
 *
 * @param queryParams
 */
export function saveProdPlanCvrgFeeInfo(queryParams: any): AxiosPromise<any> {
  return post(`/plan/saveProdPlanCvrgFeeInfo`, queryParams);
}
/**
 * 产品工厂-机构税率信息保存
 *
 * @param queryParams
 */
export function saveProdTaxRateInfo(queryParams: any): AxiosPromise<any> {
  return post(`/plan/saveProdTaxRateInfo`, queryParams);
}
/**
 * 产品工厂-机构税率信息删除
 *
 * @param queryParams
 */
export function delProdTaxRateInfoById(queryParams: any): AxiosPromise<any> {
  return post(`/plan/delProdTaxRateInfoById`, queryParams);
}

/**
 * 产品工厂-机构税率信息删除全部
 *
 * @param queryParams
 */
export function deleteProdTaxRateByProdNo(queryParams: any): AxiosPromise<any> {
  return post(`/plan/deleteProdTaxRateByProdNo`, queryParams);
}
/**
 * 产品工厂-查询机构税率信息
 *
 * @param queryParams
 */
export function qryProdTaxRateInfoPage(queryParams: any): AxiosPromise<any> {
  return post(`/plan/qryProdTaxRateInfoPage`, queryParams);
}

/**
 * 产品工厂-关联批改保费计算公式列表查询
 *
 * @param queryParams
 */
export function getEdrFormulaRel(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/getEdrFormulaRel`, queryParams);
}
/**
 * 产品工厂-删除批改保费计算公式
 *
 * @param queryParams
 */
export function delEdrFormulaRel(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/delEdrFormulaRel`, queryParams);
}

/**
 * 产品工厂-新增批改保费计算公式弹框保存
 *
 * @param queryParams
 */
export function saveEdrFormula(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/saveEdrFormula`, queryParams);
}

/**
 * 产品工厂-关联批改保费计算公式弹框保存
 *
 * @param queryParams
 */
export function saveEdrFormulaRel(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/saveEdrFormulaRel`, queryParams);
}

/**
 * 产品工厂-计划配置查询
 *
 * @param queryParams
 */
export function getPlanBasePage(queryParams: any): AxiosPromise<any> {
  return post(`/plan/getPlanBasePage`, queryParams);
}

/**
 * 产品工厂-核保人批量任职配置列表查询
 *
 * @param queryParams
 */
export function qryBatchUndrDtyList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/qryBatchUndrDtyList`, queryParams);
}

export function delBatchUndrDtyInfo(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/delBatchUndrDtyInfo`, queryParams);
}
export function delSelectedUndrDtyInfo(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/delSelectedUndrDtyInfo`, queryParams);
}

/**
 * 商品配置列表查询
 *
 * @param queryParams
 */
export function qryCommodityBasePage(queryParams: any): AxiosPromise<any> {
  return post(`/commodity/qryCommodityBasePage`, queryParams);
}

/**
 * 商品审核列表查询
 *
 * @param queryParams
 */
export function queryCommodityUndrList(queryParams: any): AxiosPromise<any> {
  return post(`/commodity/queryCommodityUndrList`, queryParams);
}

/**
 * 核保级别列表查询
 *
 * @param queryParams
 */
export function qryUndrClsList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/qryUndrClsList`, queryParams);
}

/**
 * 批改项配置列表查询
 *
 * @param queryParams
 */
export function qryProdEdrRsnItemList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/qryProdEdrRsnItemList`, queryParams);
}

/**
 * 批改项配置删除
 *
 * @param queryParams
 */
export function delProdEdrRsnItem(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/delProdEdrRsnItem`, queryParams);
}

/**
 * 批改原因配置列表查询
 *
 * @param queryParams
 */
export function qryProdEdrRsnList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/qryProdEdrRsnList`, queryParams);
}

/**
 * 批改原因配置保存
 *
 * @param queryParams
 */
export function saveProdEdrRsnInfo(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/saveProdEdrRsnInfo`, queryParams);
}

/**
 * 核保级别配置保存
 *
 * @param queryParams
 */
export function saveUndrClsInfo(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/saveUndrClsInfo`, queryParams);
}

/**
 * excel模板配置列表查询
 *
 * @param queryParams
 */
export function excelList(queryParams: any): AxiosPromise<any> {
  return post(`/excelTemplateConfig/list`, queryParams);
}

/**
 * excel模板配置删除
 *
 * @param queryParams
 */
export function exceldelete(queryParams: any): AxiosPromise<any> {
  return post(`/excelTemplateConfig/delete`, queryParams);
}

/**
 * 险别配置-附加险列表删除
 *
 * @param queryParams
 */
export function delCvrgRel(queryParams: any): AxiosPromise<any> {
  return post(`/cvrgdef/delCvrgRel`, queryParams);
}

/**
 * excel模板配置保存
 *
 * @param queryParams
 */
export function excelsave(queryParams: any): AxiosPromise<any> {
  return post(`/excelTemplateConfig/save`, queryParams);
}


/**
 * 查询联共保信息配置列表
 *
 * @param queryParams
 */
export function pageFindPlanCiSNLBByParams(queryParams: any): AxiosPromise<any> {
  return post(`/plan/pageFindPlanCiSNLBByParams`, queryParams);
}


/**
 * 查询组织部门树列表
 *
 * @param queryParams
 */
export function getOrgDptTreeListByPid(queryParams: any): AxiosPromise<any> {
  return post(`/rolemgr/getOrgDptTreeListByPid`, queryParams);
}

/**
 * 查询分保配置列表
 *
 * @param queryParams
 */
export function queryReinsuranceData(queryParams: any): AxiosPromise<any> {
  return post(`/reinsurance/queryReinsuranceData`, queryParams);
}

/**
 *联共保业务规则配置-查询组织树列表
 *
 * @param queryParams
 */
export function getOrgDptTreeNodeById(queryParams: any): AxiosPromise<any> {
  return post(`/role/getOrgDptTreeNodeById`, queryParams);
}

/**
 *分保查询-新增-查询
 *
 * @param queryParams
 */
export function getListByCommodityNoPlanNo(queryParams: any): AxiosPromise<any> {
  return post(`/reinsurance/getListByCommodityNoPlanNo`, queryParams);
}

/**
 *商品配置保存
 *
 * @param queryParams
 */
export function saveCommodityBase(queryParams: any): AxiosPromise<any> {
  return post(`/commodity/saveCommodityBase`, queryParams);
}

/**
 *产品工厂-关联条款-删除
 *
 * @param queryParams
 */
export function unAssociationCvrg(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/unAssociationCvrg`, queryParams);
}

/**
 *产品工厂-业务规则-删除
 *
 * @param queryParams
 */
export function delProdRuleById(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/delProdRuleById`, queryParams);
}

export function initMultiCodeList(queryParams: any): AxiosPromise<any> {
  return post(`/codelist/initMultiCodeList`, queryParams);
}

/**
 *产品工厂新增-关联主险-关联险别弹框列表查询
 *
 * @param queryParams
 */
export function getUnbindCvrgRefProd(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/getUnbindCvrgRefProd`, queryParams);
}
/**
 *产品工厂新增-关联主条款-关联主条款弹框列表查询
 *
 * @param queryParams
 */
export function getUnbindTermRefProd(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/getUnbindTermRefProd`, queryParams);
}
/**
 *产品审核-提交审核
 *
 * @param queryParams
 */
export function saveProdAudit(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/saveProdAudit`, queryParams);
}
/* 上传费率表-删除所有 */
export function deleteCvrgFeeByProdNo(queryParams: any): AxiosPromise<any> {
  return post(`/plan/deleteFeeRateByProdNo`, queryParams);
}
/* 核保级别修改 */
export function getUndrClsInfo(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/getUndrClsInfo`, queryParams);
}
/* 批改原因配置-编辑-查询详情 */
export function getProdEdrRsnInfo(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/getProdEdrRsnInfo`, queryParams);
}
/* 核保级别配置-删除 */
export function delUndrClsById(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/delUndrClsById`, queryParams);
}
/* 国民经济行业分类 */
export function getPageList(queryParams: any): AxiosPromise<any> {
  return post(`/codelist/queryPage`, queryParams);
}
/**
 * 得当前承保机构的分公司编码。如：北京02、天津27、重庆15
 */
export function checkCdeptByCdptCde(queryParams: any): AxiosPromise<any> {
  return post('/policy/checkCdeptByCdptCde', queryParams);
}

// 根据code和val解析字典值
export function getNmeByCde(ops: any): AxiosPromise<any> {
  // 发送POST请求以根据code和val解析字典值
  return post(`/edr/getNmeByCde`, ops);
}
/**
 * 获取特约
 * @param queryParams 
 * @returns 
 */
export function getpSpecialAgreement(queryParams: any): AxiosPromise<any> {
  return post('/proddef/getpSpecialAgreement', queryParams);
}
/**
 * 获取产品列表
 * @param queryParams 
 * @returns 
 */
export function getProdEnableList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/getProdEnableList`, queryParams);
}
export function expExcelUndrDty(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/expExcelUndrDty`, queryParams);
}
//费用信息
export function getAppFeeInfoNewUrl(queryParams: any): AxiosPromise<any> {
  return post(`/policy/getAppFeeInfoNew`, queryParams);
}
//查询费用信息中的费率上下限
export function getAppFeeBetwNew(queryParams: any): AxiosPromise<any> {
  return post(`/policy/getAppFeeBetwNew`, queryParams);
}
//根据申请单号获取获取ilog原始C1 
export function getIlogC1(queryParams: any): AxiosPromise<any> {
  return post(`/policy/getIlogC1`, queryParams);
}
//判断费用窗口类型
export function checkFeeWindowType(queryParams: any): AxiosPromise<any> {
  return post(`/policy/checkFeeWindowType`, queryParams);
}
//根据申请单号获取费用信息
export function getAppFee(queryParams: any): AxiosPromise<any> {
  return post(`/policy/getAppFee`, queryParams);
}
//保存投保费用信息修改
export function saveAppFeeInfo_new(queryParams: any): AxiosPromise<any> {
  return post(`/policy/saveAppFeeInfo_new`, queryParams);
}
//保存投保费用信息修改
export function updateIIogFee(queryParams: any): AxiosPromise<any> {
  return post(`/policy/updateIIogFee`, queryParams);
}

export function gettypflag(queryParams: any): AxiosPromise<any> {
  return post(`/policy/gettypflag`, queryParams);
}
//费用信息比较
export function compareAppFeeInfo(queryParams: any): AxiosPromise<any> {
  return post(`/policy/compareAppFeeInfo`, queryParams);
}

//
export function getRenewalAppPolicy(queryParams: any): AxiosPromise<any> {
  return post(`/policy/getPolicy`, queryParams);
}
//新增清单保存
export function saveDist(queryParams: any): AxiosPromise<any> {
  return post(`/policy/saveDist`, queryParams);
}
//查询清单
export function selectDist(queryParams: any): AxiosPromise<any> {
  return post(`/policy/selectDist`, queryParams);
}
//查询清单对应汇总组件key
export function distMapCollectCompKey(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/getDistSummaryComponentKeyByDistComponentKeyAndProdNo`, queryParams);
}
//删除清单校验
export function deleteDistCheck(queryParams: any): AxiosPromise<any> {
  return post(`/policy/deleteDistCheck`, queryParams);
}
//删除清单
export function deleteDist(queryParams: any): AxiosPromise<any> {
  return post(`/policy/deleteDist`, queryParams);
}
//
export function checkAppBase(queryParams: any): AxiosPromise<any> {
  return post(`/policy/checkAppBase`, queryParams);
}


export function downloadDistTemplate(queryParams: any): AxiosPromise<any> {
  return post(`/policy/downloadDistTemplate`, queryParams);
}
export function syncDist(queryParams: any): AxiosPromise<any> {
  return post(`/policy/syncDist`, queryParams);
}
export function exportDist(queryParams: any): AxiosPromise<any> {
  return post(`/policy/exportDist`, queryParams);
}
//免赔接口查询
export function getPrdDeductible(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/getPrdDeductible`, queryParams);
}
//免赔费率系数
export function ratio(queryParams: any): AxiosPromise<any> {
  return post(`/policy/ratio`, queryParams);
}

/**
 * 产品业务规则配置-查询业务规则
 *
 * @param queryParams
 */
export function qryProdRuleList(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/qryProdRuleList`, queryParams);
}

/**
 * 产品业务规则配置-新增/修改业务规则
 *
 * @param queryParams
 */
export function saveProdRuleInfo(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/saveProdRuleInfo`, queryParams);
}          

/**
 * 核保人批量任职配置-配置-保存
 *
 * @param queryParams
 */
export function saveBatchUndrDtyInfo(queryParams: any): AxiosPromise<any> {
  return post(`/proddef/saveBatchUndrDtyInfo`, queryParams);
}


/**
 * 联共保信息配置--新增
 *
 * @param queryParams   /beauty-api/plan/savePlanCiInfo
 */
export function savePlanCiInfo(queryParams: any): AxiosPromise<any> {
  return post(`/plan/savePlanCiInfo`, queryParams);
}

/**
 * 联保信息配置  --根据主键删除
 * 
 */
 export function deletePlanCiInfoById(queryParams: any): AxiosPromise<any> {
  return post(`/plan/deletePlanCiInfoById`, queryParams);
}
/**
 * 商品配置  --关联附属信息-新增
 * 
 */
 export function saveCommodityAttached(queryParams: any): AxiosPromise<any> {
  return post(`/commodity/saveCommodityAttached`, queryParams);
}



/**
 * 商品配置  --选择方案 分保校验
 * 
 */
export function commodityBaseOperatorCheck(queryParams: any): AxiosPromise<any> {
  return post(`/commodity/commodityBaseOperatorCheck`, queryParams);
}
/**
 * 商品配置  --选择方案  保存2
 * 
 */
export function saveCommodityPlan(queryParams: any): AxiosPromise<any> {
  return post(`/commodity/saveCommodityPlan`, queryParams);
}


/**
 * 商品配置  --选择方案  删除单条
 * 
 */
export function deleteCommodityPlan(queryParams: any): AxiosPromise<any> {
  return post(`/commodity/deleteCommodityPlan`, queryParams);
}

/**
 * 商品配置  --选择方案  保存别名
 * 
 */
export function saveCommodityPlanTermDisPlayNme(queryParams: any): AxiosPromise<any> {
  return post(`/commodity/saveCommodityPlanTermDisPlayNme`, queryParams);
}
/**
 * 商品配置  --选择方案  编辑查询
 * 
 */
export function queryPlanTermByCommodityNo(queryParams: any): AxiosPromise<any> {
  return post(`/commodity/queryPlanTermByCommodityNo`, queryParams);
}

/**
 * 商品配置  --投保规则   保存投保规则
 * 
 */
export function saveRule(queryParams: any): AxiosPromise<any> {
  return post(`/commodity/saveRule`, queryParams);
}

/**
 * 商品配置  --投保规则   获取投保规则
 * 
 */
export function getCommodityRule(queryParams: any): AxiosPromise<any> {
  return post(`/commodity/getCommodityRule`, queryParams);
}
 

/**
 * 商品配置  --保存并提交按钮
 * 
 */
export function addProcessUndr(queryParams: any): AxiosPromise<any> {
  return post(`/commodity/addProcessUndr`, queryParams);
}
 
/**
 * 商品配置  --提交（审核）
 * 
 */
export function processApprove(queryParams: any): AxiosPromise<any> {
  return post(`/plan/processApprove`, queryParams);
}
 
/**
 * 商品配置  -- 查询 商品配置流程状态
 * 
 */
export function getProcessInfo(queryParams: any): AxiosPromise<any> {
  return post(`/plan/getProcessInfo`, queryParams);
}
 


/**
 * 复制出单-批量保存清单
 * 
 */
export function saveDistBatch(queryParams: any): AxiosPromise<any> {
  return post(`/policy/saveDistBatch`, queryParams);
}

/**
 * 产品配置明细-询价页面保存
 * 
 */
export function saveInquiryPage(queryParams: any): AxiosPromise<any> {
  return post(`/prod/saveInquiryPage`, queryParams);
}

/**
 * 产品配置明细-询价页面查询
 * 
 */
export function getInquiryPage(queryParams: any): AxiosPromise<any> {
  return post(`/prod/getInquiryPage`, queryParams);
}

/**
 * 产品配置明细-询价页面-组件关联保存按钮
 * 
 */
export function saveInquiryPageComponent(queryParams: any): AxiosPromise<any> {
  return post(`/prod/saveInquiryPageComponent`, queryParams);
}

/**
 * 产品配置明细-询价页面-组件关联查询
 * 
 */
export function queryInquiryPageComponents(queryParams: any): AxiosPromise<any> {
  return post(`/prod/queryInquiryPageComponents`, queryParams);
}

/**
 * 产品配置明细-询价页面-组件要素绑定查询
 * 
 */
export function queryInquiryPageComponentList(queryParams: any): AxiosPromise<any> {
  return post(`/prod/queryInquiryPageComponentList`, queryParams);
}

/**
 * 产品配置明细-询价页面-组件要素绑定发布
 * 
 */
export function releaseInquiryPage(queryParams: any): AxiosPromise<any> {
  return post(`/prod/releaseInquiryPage`, queryParams);
}

/**
 * 询价录单-出单页面查询配置
 * 
 */
export function getReleaseInquiryPage(queryParams: any): AxiosPromise<any> {
  return post(`/prod/getReleaseInquiryPage`, queryParams);
}

/**
 * 地点查询--查询
 *
 */
export function selCountryPort(queryParams: any): AxiosPromise<any> {
  return post(`/countPort/selCountryPort`, queryParams);
}

/**
 * 地点查询--新增
 *
 */
export function addCountryPort(queryParams: any): AxiosPromise<any> {
  return post(`/countPort/addCountryPort`, queryParams);
}
/**
 * 代理人查询
 *
 */
export function carSelCountryPort(queryParams: any): AxiosPromise<any> {
  return post(`/cargoInsurance/selCountryPort`, queryParams);
}
/**
 * 获取自定义续保列表
 *
 * @param queryParams
 */
export function findRenewalInsurance(queryParams: any): AxiosPromise<any> {
    return post(`/policy/findRenewalInsurance`, queryParams);
}
/**
 * 获取协议续保列表
 *
 * @param queryParams
 */
export function findECargoRenewalInsurance(queryParams: any): AxiosPromise<any> {
	return post(`/policy/findECargoRenewalInsurance`, queryParams);
}

/**
 * 续保管理---自定义续保列表导出
 *
 * @param queryParams
 */
export function exportRenewalInsurance(data:any) {
  return request.post(`/policy/exportRenewalInsurance`, data, { responseType: 'blob'});
}

/**
 * 续保管理---协议续保列表导出
 *
 * @param queryParams
 */
export function exportECargoRenewalInsurance(data:any) {
  return request.post(`/policy/exportECargoRenewalInsurance`, data, { responseType: 'blob'});
}
/**
 * 一键续保
 *
 * @param queryParams
 */
export function getPolicy(queryParams: any): AxiosPromise<any> {
    return post(`/policy/getPolicy`, queryParams);
}
// 根据code和val解析字典值
export function getEdrNmeByCde(queryParams: any): AxiosPromise<any> {
    return post(`/edr/getNmeByCde`, queryParams);
}


/**
 * 复制清单信息
 *
 * @param queryParams
 */
export function copyDist(queryParams: any): AxiosPromise<any> {
  return post(`/policy/copyDist`, queryParams);
}

/**
 * 额度信息获取机构
 *
 * @param queryParams
 */
export function getDpt(queryParams: any): AxiosPromise<any> {
  return post(`/policy/getDpt`, queryParams);
}

/**
 * 核保提交前校验是否需要划分风险单位
 *
 * @param queryParams
 */
export function checkoutn(queryParams: any): AxiosPromise<any> {
  return post(`/reinsured/checkoutn`, queryParams);
}

/**
 * 申请核保校验清单必填
 *
 * @param queryParams
 */
export function checkDistForSubmit(queryParams: any): AxiosPromise<any> {
  return post(`/policy/checkDistForSubmit`, queryParams);
}

// 查询当前商品可延期次数校验
export function getDelayCount(queryParams: any): AxiosPromise<any> {
  return post(`/policy/getDelayCount`, queryParams);
}

 
// 查询当前商品可延期天数校验
export function getNewSysDays(queryParams: any): AxiosPromise<any> {
  return post(`/policy/getNewSysDays`, queryParams);
}
//  Off 判断接口
export function checkCancelM1IsOff(queryParams: any): AxiosPromise<any> {
  return post(`/policy/checkCancelM1IsOff`, queryParams);
}

// ilog强制转人工查询
export function getEfcManual(queryParams: any): AxiosPromise<any> {
  return post(`/policy/getEfcManual`, queryParams);
}

// ilog强制转人工提交
export function setEfcManual(queryParams: any): AxiosPromise<any> {
  return post(`/policy/setEfcManual`, queryParams);
}

// 联供保信息变更批改判断当前数据是否实收
export function queryPayString(queryParams: any): AxiosPromise<any> {
  return post(`/payment/queryPayString`, queryParams);
}

// 获取财产险/机损险保单号下拉选项
export function queryCAssPlyNo(queryParams: any): AxiosPromise<any> {
  return post(`/underwriting/query/queryCAssPlyNo`, queryParams);
}

// 获取累计保额信息
export function coverageHint(queryParams: any): AxiosPromise<any> {
  return post(`/custShare/coverageHint`, queryParams);
}

// 获取累计保额信息-标的信息
export function queryNrmbAmt(queryParams: any): AxiosPromise<any> {
  return post(`custShare/queryNrmbAmt`, queryParams);
}

// 获取保费修改上下限
export function getPremiumAdjustmentRange(): AxiosPromise<any> {
  return post(`/policy/getPremiumAdjustmentRange`, {});
}

// 建设工程信息根据保险凭证类别查询详细
export function getProductTemplate(queryParams: any): AxiosPromise<any> {
  return post(`/policy/getProductTemplate`, queryParams);
}

// 核保风险累计查询
export function getCumulativeRisk(queryParams: any): AxiosPromise<any> {
  return post(`/policy/getCumulativeRisk`, queryParams);
}

// 查询保单最新保险起止期
export function queryLatestMrk(queryParams: any): AxiosPromise<any> {
  return post(`/reinsured/queryLatestMrk`, queryParams);
}

// 报停展期批改获取新的保险止期和保险天数
export function checkPlyChange(queryParams: any): AxiosPromise<any> {
  return post(`/policy/checkPlyChange`, queryParams);
}

// 核保获取上次比较数据
export function getCompareAppFeeInfo(queryParams: any): AxiosPromise<any> {
  return post(`/policy/getCompareAppFeeInfo`, queryParams);
}

// 检查产品分级信息(销售资质级别)
export function checkProdGrade(queryParams: any): AxiosPromise<any> {
  return post(`/policy/checkProdGrade`, queryParams);
}

/* 操作手册详情*/
export function viewManual(): AxiosPromise<any> {
	return post(`/proddef/viewManual`, {}, { responseType: 'blob' });
}

export function getOaTermination(queryParams: any): AxiosPromise<any> {
  return post(`/policy/getOaTermination`, queryParams);
}

export function checkTgtEmployeeNumber(queryParams: any): AxiosPromise<any> {
  return post(`/policy/checkTgtEmployeeNumber`, queryParams);
}

// Excel导入出单查询
export function selectImportRecord(queryParams: any): AxiosPromise<any> {
  return post(`/policyTemplate/selectImportRecord`, queryParams);
}
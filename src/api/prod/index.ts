import {AxiosPromise} from "axios";
import {post} from "@/utils/http";
import {del} from "@/utils/http";

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
 * 保存险类信息
 *
 * @param queryParams
 */
export function saveKindInfo(queryParams: any): AxiosPromise<any> {
    return post(`/proddef/saveKindInfo`, queryParams);
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

/**
 * 产品工厂-关联特别约定查询
 *
 * @param queryParams
 */
export function qryRefProdAndSpecList(queryParams: any): AxiosPromise<any> {
    return post(`/proddef/qryRefProdAndSpecList`, queryParams);
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
 * 产品工厂-删除费率表信息
 */
export function delProdPlanCvrgFeeInfoById(queryParams: any): AxiosPromise<any> {
    return post(`/plan/delProdPlanCvrgFeeInfoById`, queryParams);
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
 * 查询产品业务规则列表
 *
 * @param queryParams
 */
export function qryProdRuleList(queryParams: any): AxiosPromise<any> {
    return post(`/proddef/qryProdRuleList`, queryParams);
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

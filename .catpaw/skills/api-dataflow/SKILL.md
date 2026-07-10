---
name: api-dataflow
description: nvhl-pcis-ui API 接口域清单与产品/商品管理数据流，包括核心 API 分类、数据回填流程与商品审核状态机
---

# API 接口与数据流

## API 接口域清单（src/api/prod/index.ts）

该文件 1600+ 行，是两个核心模块的 API 层。遇到接口问题时优先全文搜索函数名。

### 产品管理接口

| 接口 | 功能 |
|------|------|
| `getProFactoryList` | 产品列表分页查询 |
| `saveProInfo` / `getProducts` / `getProdInfos` | 产品基本信息保存/查询 |
| `changeStatus` / `auditSubmit` / `saveProdAudit` | 启用状态/提交审核/保存审核意见 |
| `releaseAllPage` | 全产品组件更新 |
| `qryProdRelTermList` / `unAssociationTerm` | 产品关联条款查询/解除 |
| `qryRefProdAndSpecList` / `unAssociationSpec` | 产品关联特别约定查询/删除 |
| `qryRefProdAndRuleList` / `delPrdRuleInfo` | 关联业务规则查询/删除 |
| `qryVersionInfoList` / `delVersionById` | 保费计算版本查询/删除 |
| `getPlanBasePage` | 计划配置分页 |
| `qryProdTermFeeInfoPage` / `delProdPlanCvrgFeeInfoById` / `deleteFeeRateByProdNo` | 费率配置查询/单条删除/全量删除 |
| `qryProdTaxRateInfoPage` / `delProdTaxRateInfoById` / `deleteProdTaxRateByProdNo` | 机构税率查询/单条删除/全量删除 |
| `getEdrFormulaRel` / `delEdrFormulaRel` | 批改保费计算公式查询/删除 |
| `qryPaySeemoneyConfigList` / `delPaySeemoneyConfigById` | 见费出单配置查询/删除 |
| `saveProdPages` / `getPageViewByPage` | 页面配置保存/查询 |
| `getCvrgRiskRelList` / `delRiskRel` | 责任险别关联查询/删除 |
| `qryProdTermList` | 产品条款列表 |

### 商品管理接口

| 接口 | 功能 |
|------|------|
| `qryCommodityBasePage` | 商品列表分页查询 |
| `saveCommodityBase` / `getCommodityBase` | 商品保存/查询 |
| `commodityBaseOperatorCheck` | 商品操作校验（再保分保配置校验） |
| `queryCommodityPlanList` / `deleteCommodityPlan` / `saveCommodityPlan` | 商品方案查询/删除/保存 |
| `saveCommodityPlanTermDisPlayNme` | 保存方案条款显示名称 |
| `saveRule` / `getCommodityRule` | 投保规则保存/查询 |
| `queryPlan` | 查询可选方案列表 |
| `processApprove` / `getProcessInfo` / `addProcessUndr` | 审核提交/查询审核流程/新增审核 |
| `getEdrNmeByCde` | 按编码查询名称（机构/出单员等） |
| `checkProdGrade` | 销售资质校验 |

## 产品管理数据流

```
prodFactory.vue (列表)
  │  router.push → query: { editType: 'add'|'edit'|'view'|'copy', prod, prodNo, title }
  ▼
prodFactoryInfo.vue (详情)
  │  provide(idxParam) → dataOpertaor({ id: route.name })
  │  setTableConfig([prodaudit?, prodInfo, relatedMainInsurance, specialAgreement, prodComponent])
  │  渐进式渲染（currentIndex 每 100ms +1）
  │  edit/copy 模式 → getProdInfos(param) → setData(data)
  │
  ├── prodInfo ← 核心组件，cProdNo 供其他组件引用
  │     └── opertaor.getTableRefByKey("prodInfo").getFromValue().cProdNo
  ├── relatedMainInsurance ← 依赖 prodInfo.cProdNo
  ├── specialAgreement ← 依赖 prodInfo.cProdNo
  ├── prodComponent ← 依赖 prodInfo.cProdNo
  └── prodaudit ← 依赖 param.prod.cProdNo（仅审核模式）
```

## 商品管理数据流

```
commodity-main.vue (列表)
  │  router.push → query: { editType, cCommodityNo, title }（query.param 加密）
  ▼
commodityEdit.vue (详情)
  │  provide(idxParam) → dataOpertaor({ id: route.name })
  │  descryptParameter(query.param) → queryParam
  │  setTableConfig([commodityBasicInfo, choosePlan, permissionAllo, InsuranceRules, TestReport?, ReviewComments?])
  │
  ├── commodityBasicInfo ← 核心组件，cCommodityNo 供其他组件引用
  │     ├── cKindNo 联动 cProdNo 码表（eventBus.emit('cKindNo-change')）
  │     └── cPrjCtgTyp → cPrjCtgMidTyp → cPrjCtgSubTyp 三级联动
  ├── choosePlan ← 依赖 commodityBasicInfo.cCommodityNo
  ├── permissionAllo ← 依赖 commodityBasicInfo 数据
  ├── InsuranceRules ← 仅当 cPolicyLimit 为是时保存
  ├── TestReport ← 条件显示
  └── ReviewComments ← 仅 handle/review 模式

  保存流程：
  saveAll(call?) → validateForm() → commodityBaseOperatorCheck() → save(call, param)
    → saveCommodityBase → 若 cPolicyLimit → InsuranceSaveData() → 若有 call → 审核流程
```

## 商品审核多级状态机

```
一级审核(cUndrStatus=1) → 发测试(2) / 发测试-信息补充(3) / 驳回(0)
二级审核(cUndrStatus=4) → 提交发布(5) / 驳回至测试(2) / 驳回至测试-信息补充(3)
IT审核(cUndrStatus=5)   → 已发布(6)
```

### 商品状态值速查

| 状态值 | 含义 |
|--------|------|
| 0 | 草稿/禁用 |
| 1 | 一级审核 |
| 2 | 待测试 |
| 3 | 测试中 |
| 4 | 二级审核 |
| 5 | IT审核 |
| 6 | 已发布 |

## 产品管理扩展组件

以下组件已注册但在其他配置页面使用（条款配置、责任配置等）：

| 注册名 | 文件 | 说明 |
|--------|------|------|
| `relatedBusinessRulesRef` | `commonRef/RelatedBusinessRules.vue` | 关联业务规则 |
| `relatedPremCalcuRulesRef` | `commonRef/RelatedPremCalcuRules.vue` | 关联保费计算规则 |
| `planConfigrationRef` | `commonRef/PlanConfigration.vue` | 计划配置 |
| `rateConfigurationRef` | `commonRef/RateConfiguration.vue` | 费率配置 |
| `InstituTaxRateAllocatRef` | `commonRef/InstituTaxRateAllocat.vue` | 机构税率配置 |
| `clauseConfRef` | `clauseConfRef/clauseConf.vue` | 条款配置列表 |
| `cvrgRef` | `cvrgRef/cvrg.vue` | 责任/险别表格 |

> 统一模式：查询表单 + 分页表格 + 弹窗新增/编辑 + 行内删除，都依赖 `prodInfo.cProdNo` 作为关联键。

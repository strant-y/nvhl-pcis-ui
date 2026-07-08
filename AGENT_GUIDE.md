# nvhl-pcis-ui 系统速览（Agent Guide）

本文目标是让新加入的开发者或自动化 Agent 在最短时间内理解该前端系统的结构、关键机制与核心业务模块，并能快速定位代码入口与改动点。

## 1. 项目定位

- 项目名称：nvhl-pcis-ui
- 类型：后台管理系统（Vue 3 + Vite + TypeScript），在 `vue3-element-admin` 模板基础上深度定制
- 核心业务域：
  - `prodFactory`：产品配置/产品管理（产品要素、组件、责任、条款、特约、产品等）
  - `goodsConfig`：商品/方案配置（商品基本信息、选择方案、出单权限分配、投保规则、审核等）

## 2. 快速启动与构建

- Node：>= 18
- 包管理：pnpm（`package.json` 含 `preinstall: only-allow pnpm`）

常用命令（见 [package.json](file:///d:/work/productFactory/nvhl-pcis-ui/package.json)）：

```bash
pnpm install

# 启动（多环境）
pnpm dev
pnpm uat
pnpm verification
pnpm pre
pnpm prod

# 构建（多环境）
pnpm build:dev
pnpm build:uat
pnpm build:verification
pnpm build:pre
pnpm build:prod
```

多环境代理：
- `vite.config.ts` 根据 mode 切换 proxy target（见 [vite.config.ts](file:///d:/work/productFactory/nvhl-pcis-ui/vite.config.ts#L19-L85)）

## 3. 关键目录结构（只列与理解系统强相关部分）

- `src/main.ts`：应用入口、插件注册、全局组件注册（见 [main.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/main.ts)）
- `src/router/`：路由创建 + push/replace 扩展（query 加密、componentKey 注入）（见 [router/index.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/router/index.ts)）
- `src/plugins/permission.ts`：路由守卫（token/角色/动态路由注入/路由参数解密）（见 [permission.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/plugins/permission.ts)）
- `src/store/`：Pinia（用户、权限路由、标签页、业务态缓存等）
- `src/utils/request.ts`：Axios 实例 + 请求/响应拦截（token、部门、参数加密、401 处理、Blob 下载）（见 [request.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/utils/request.ts)）
- `src/api/`：按域划分接口；产品/商品配置主要集中在 `src/api/prod/index.ts`
- `src/views/`：页面（后端动态路由的 component 字段映射到这里的 `.vue` 文件）
- `src/pcis/prodRef/`：动态业务组件注册表（产品/商品配置页面通过 `pageRef` 动态渲染子模块）（见 [prodRef.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/pcis/prodRef/prodRef.ts)）
- `src/shared/`、`src/components/`、`src/common/`：二次封装的通用能力（表单、表格、弹窗、popover、tooltip 等）

## 4. 应用启动流程（从入口到可用页面）

1) 启动入口：`createApp(App)` → 注册 store/directive/i18n 等 → `setupPermission()` 注册守卫 → `app.use(router).mount('#app')`
   - 同时会 `app.use(prodRef)` 注册“动态子页面组件”（见 [main.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/main.ts#L26-L44)）

2) 登录与鉴权：
   - token 存在于 `sessionStorage.token`
   - 未登录访问非白名单路由会跳转 `/login`（见 [permission.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/plugins/permission.ts#L8-L83)）
   - 支持携带 `?token=...` 的外部跳转：检测到 query.token 后会写入 sessionStorage 并执行 `resolveToken`（见 [permission.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/plugins/permission.ts#L64-L75)）

3) 动态路由注入（非常关键）：
   - 登录后若本地没有 roles，会先 `getUserInfo()` 再 `permissionStore.generateRoutes(roles)`
   - `generateRoutes` 会调用后端接口 `GET /menus-interface/menuRoutesList` 获取菜单路由树（见 [menu/index.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/api/menu/index.ts#L57-L62)、[permission store](file:///d:/work/productFactory/nvhl-pcis-ui/src/store/modules/permission.ts#L84-L95)）
   - 后端返回的 `component` 字段会映射到 `src/views/${component}.vue`
     - 通过 `import.meta.glob("../../views/**/**.vue")` 加载（见 [permission store](file:///d:/work/productFactory/nvhl-pcis-ui/src/store/modules/permission.ts#L6-L57)）

## 5. 路由参数加密/解密与 componentKey

该项目对路由 query 做了统一处理，影响所有“页面跳转传参”。

- 发送端（push/replace）：
  - 重写了 `router.push` / `router.replace`：
    - 自动注入 `componentKey`（用于 Tabs/KeepAlive 等场景区分页面实例）
    - 对 query（排除 `encrypted/componentKey`）做加密
  - 见 [router/index.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/router/index.ts#L71-L130)

- 接收端（afterEach）：
  - 统一对 `to.query` 做解密，并解析为 `to.params`（见 [permission.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/plugins/permission.ts#L113-L122)）

开发建议：
- 如果你在页面里看到 `route.query.xxx` 值异常（像乱码/密文），优先确认：该参数是否属于统一加密体系、是否被 afterEach 解密替换。

## 6. 核心页面组织方式：锚点侧栏 + 动态子组件

### 6.1 动态子组件注册表：prodRef

- `src/pcis/prodRef/prodRef.ts` 将多个子模块注册为全局组件（见 [prodRef.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/pcis/prodRef/prodRef.ts#L127-L253)）
- 组件名采用 `camelCase`（例如 `prodauditRef`），在模板里可以使用等价的 `kebab-case`（例如 `prodaudit-ref`）

### 6.2 产品详情页：prodFactoryInfo.vue

- 页面将多个业务段落配置为 `pageInfo`，通过 `<component :is="k.pageRef + '-ref'" />` 动态渲染
- `editType` 为 `edit/copy` 时会调用修改查询接口回填数据（见 [prodFactoryInfo.vue](file:///d:/work/productFactory/nvhl-pcis-ui/src/views/prodconfiguration/prodFactoryInfo.vue#L187-L214)）
- copy 回填会清理主键（示例清除 `cProdNo`）：`createCopyData(datas[k], ["cProdNo"])`（见同文件）

### 6.3 商品详情页：commodityEdit.vue

- 同样采用 `pageInfo + <component :is="pageRef + '-ref'">` 组合页面（见 [commodityEdit.vue](file:///d:/work/productFactory/nvhl-pcis-ui/src/views/goodsConfig/commodityEdit.vue#L105-L165)）
- 通过加密参数 `route.query.param` 传递复杂编辑参数，并在页面内解密为 `queryParam`（见 [commodityEdit.vue](file:///d:/work/productFactory/nvhl-pcis-ui/src/views/goodsConfig/commodityEdit.vue#L102-L104)）

### 6.4 dataOpertaor：统一管理“页面段落配置 + 子组件引用”

多个页面通过 `dataOpertaor({ id: route.name })`：
- 存储 `tableConfig`（页面段落配置）
- 存储 `tableRefs`（每个子组件的 ref）
- 提供 `getTableRefByKey/setDataAll/getDataAll` 等能力，用于“跨段落汇总保存/统一回填”

见 [data-opertaor.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/store/modules/data-opertaor.ts#L20-L80)。

dataOpertaor 完整 API：

| 方法 | 说明 |
|------|------|
| `setTableConfig(config)` | 设置页面段落配置（pageInfo 数组） |
| `getTableConfig()` | 获取页面段落配置 |
| `addTableRef(key, ref)` | 注册子组件 ref（模板 `:ref` 回调中调用） |
| `getTableRefByKey(key)` | **最常用**：按 pageKey 获取其他子组件 ref，直接调用其暴露的方法 |
| `setDataAll(data)` | 遍历所有 ref 调 `setFormValue`，统一回填 |
| `getDataAll()` | 遍历所有 ref 调 `getFromValue`，统一取数（自动跳过非联共保场景的 ci 组件） |
| `validateAll()` | 遍历所有 ref 调 `validate`，返回 `Promise<boolean>`，失败时自动 ElMessage 提示段落名 |
| `setDisabledAll(keys?)` | 遍历所有 ref 设为只读（表单改 disabled、表格改 editFlag、自定义调 setDisabledAll） |
| `setUnDisabledByKeyList(list)` | 按字段名解禁特定控件（批改场景使用） |
| `setParam(params)` / `getParam()` | 页面级参数存取 |
| `setFatherPage(page)` / `getFatherPage()` | 父页面信息存取 |
| `convertData(result)` | 将后端扁平数据按 pageInfo 结构拆分为各段落数据 |
| `mapSetData(data)` | 反向：从 pageInfo schema 抽离字段拼回 |
| `init()` | 清空所有状态（页面切换时调用） |
| `isEditScene()` / `isReadOnlyScene()` | 判断当前场景是否可编辑/只读 |

> 注意：dataOpertaor 使用 `localStorage` 持久化 `tableConfig/tableRefs/param/fatherPage`，路由切换时 `permission.ts` 的 `beforeEach` 会调 `clearDataOpertaorByPageKey(to.name)` 清理上一页缓存。

### 6.5 子组件统一接口契约（defineExpose 模式）

所有被 `dataOpertaor` 管理的子组件 **必须** 通过 `defineExpose` 暴露以下方法（接口契约统一，实现细节各异）：

```typescript
defineExpose({
  getFromValue(),        // 获取表单数据 → 供 getDataAll / 保存时取数
  setFormValue(data),    // 回填表单数据 → 供 setDataAll / 编辑回显
  validate(),            // 表单验证 → 供 validateAll
  setValue(key, val),    // 设置单个字段值 → 供跨组件联动
  getValue(key),         // 获取单个字段值
  setFormItem(key, config), // 动态修改表单项配置（部分组件有）
  setDisabledAll(),      // 全部禁用（部分组件有）
  getTableValue(),       // 获取表格数据（表格类组件有）
});
```

这是整个架构的核心设计——**接口契约统一，实现细节各异**。dataOpertaor 不关心具体组件类型，统一通过这套接口进行回填、取数、验证、禁用。

### 6.6 依赖注入链（idxParam）

详情页与子组件之间通过 `provide/inject` 传递 `idxParam`，确保所有子组件获取到同一个 `dataOpertaor` 和 `codeListViewStore` 实例：

```
详情页（prodFactoryInfo / commodityEdit）
  │  const idxParam = { opertaorProps: { id: route.name }, cdeListViewProps: { id: route.name } }
  │  provide(idxParamKey, idxParam)
  │
  ▼
子组件（prodaudit / prodInfo / specialAgreement / ...）
  │  const idxParam = inject(idxParamKey, useIdxParam())
  │  const opertaor = dataOpertaor(idxParam.opertaorProps)  // ← 同一个 store 实例
  │  const tabref = opertaor.getTableRefByKey("prodInfo")    // ← 跨组件获取数据
```

关键文件：
- `idxParamKey` 定义：`src/views/pcis/support/useIdxParam.ts`
- `useIdxParam()` 是安全降级：当组件不在 provide 上下文中时返回空参数

## 7. HTTP 与接口调用约定

- Axios 封装：见 [request.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/utils/request.ts)
  - Token：`sessionStorage.token` → `Authorization` header
  - 部门：`sessionStorage.opOrg` → `Department` header
  - 请求体加密：
    - 非 multipart 请求会将原 data 包装为 `{ source: JSON.stringify(param) }` 并加密后发送
  - 401：弹窗提示并触发 logout + reload

- 动态路由接口：`GET /menus-interface/menuRoutesList`（见 [menu/index.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/api/menu/index.ts#L57-L62)）
- 产品/商品配置接口：集中在 `src/api/prod/index.ts`（入口多、体积大，遇到接口优先全文搜索函数名）

## 8. 公共状态（Pinia）

Store 安装入口：`src/store/index.ts`（`createPinia()` + `pinia-plugin-persist`）（见 [store/index.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/store/index.ts#L1-L21)）。

常见公共状态与定位：
- 应用壳状态：`useAppStore`
  - 侧边栏开关、语言、Element Plus locale、组件尺寸、混合模式顶部菜单激活项等（见 [app.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/store/modules/app.ts#L9-L89)）
- 登录用户态：`useUserStore`
  - 用户信息、角色 roles、按钮权限 perms、登录/登出与 token 写入（见 [user.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/store/modules/user.ts)）
- 权限与动态路由：`usePermissionStore`
  - 拉取后端菜单路由树并动态挂载 views 组件；维护 `routes/mixLeftMenus`（见 [permission.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/store/modules/permission.ts#L38-L113)）
- 多标签页/缓存：`useTagsViewStore`
  - `visitedViews/cachedViews`；标题支持从 `query.title` 或加密参数解析的 `title` 动态生成（见 [tagsView.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/store/modules/tagsView.ts#L12-L46)）
- 产品域共享状态：`useProductStore`
  - 产品/商品配置场景常用标志位（如联共保、保费/保额等），用于跨组件联动（见 [prod.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/store/modules/prod.ts#L8-L72)）
- 页面分段统一编排：`dataOpertaor`
  - 多段落页面的 `tableConfig/tableRefs/param` 容器，用于“统一回填/统一取数/跨段落保存”（见 [data-opertaor.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/store/modules/data-opertaor.ts#L20-L80)）

## 9. 公共组件与基础设施

### 9.1 通用组件分层

- `src/components/`：通用 UI 组件（面包屑、分页、上传、富文本、树、drawer 等）
- `src/components/common/`：通用业务组件（例如特别约定、部门树等），通常可跨业务模块复用
- `src/shared/`：动态表单/动态表格体系（表单渲染器 + 表单项组件库），更偏“基础设施/平台能力”
- `src/common/`：更底层的通用能力（弹窗服务、popover、tooltip 等）

### 9.2 动态表单/表格体系（shared）

全局注册入口：`app.use(shareds)`（见 [main.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/main.ts#L38-L42)）。

`src/shared/shared.ts` 将动态表单/表格相关组件统一注册为全局组件（见 [shared.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/shared/shared.ts#L1-L65)）：
- 表单基础：`AppFreeEdit`、`AppGridEdit`
- 动态表单：`DynamicForms` + `FromItem`
- 表单项组件：`rtinput/rtselect/rttable/rtUpload/...`

定位建议：
- 看到 `pageSchema/fromSchema/inputtype` 之类结构，优先去 `src/shared/` 查对应渲染逻辑与控件实现。

### 9.3 全局弹窗服务（DzModal）

全局注册入口：`app.use(DzModal)`（见 [main.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/main.ts#L38-L44)）。

能力定位：
- `useDzModal().open(component, props)` 动态渲染弹窗组件，并以 Promise 返回关闭结果（见 [DzModalService.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/common/dzmodel/DzModalService.ts#L9-L39)）

### 9.4 事件总线（Event Bus）

- 轻量事件总线：`src/utils/event-bus.ts`（见 [event-bus.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/utils/event-bus.ts#L1-L22)）
- 常见使用：跨组件/跨 store 通知关闭标签页等（示例见 [tagsView.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/store/modules/tagsView.ts#L1-L6)）

### 9.5 指令：按钮/角色级权限

全局指令注册：`setupDirective(app)`（见 [directive/index.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/directive/index.ts#L1-L10)）

- `v-hasPerm="['perm1','perm2']"`：无权限时直接移除 DOM（见 [directive/permission](file:///d:/work/productFactory/nvhl-pcis-ui/src/directive/permission/index.ts#L7-L32)）
- `v-hasRole="['role1','role2']"`：角色不匹配时移除 DOM（见 [directive/permission](file:///d:/work/productFactory/nvhl-pcis-ui/src/directive/permission/index.ts#L37-L59)）

## 10. 业务模块速览（面向定位改动点）

### 10.1 prodFactory（产品管理/产品工厂）

- 列表入口：`src/views/prodconfiguration/prodFactory.vue`
  - 查询条件：产品大类（`KIND_LIST_GRT`）、产品编码、产品名称、启用标识、审核状态
  - 行操作：编辑（审核中不可见）、查看、提交审核、复制
  - 特殊功能：全产品组件更新（弹窗选个单/团单/全部 → `releaseAllPage`）
  - 启用/禁用：表格内联 `rtswitch`，防抖调 `changeStatus`
- 详情入口（新增/修改/复制共用）：`src/views/prodconfiguration/prodFactoryInfo.vue`
  - 采用**渐进式渲染**：`currentIndex` 每隔 100ms 递增，避免一次性渲染所有组件导致卡顿
  - `editType` 为 `edit/copy` 时调 `getProdInfos(param)` 获取全量数据回填
  - copy 回填会清理主键：`createCopyData(datas[k], ["cProdNo"])`
  - 子模块组件注册：`src/pcis/prodRef/prodRef.ts`

**产品详情页段落配置（pageInfo）与组件映射：**

| pageKey | 标题 | 组件文件 | 类型 | 核心API | 说明 |
|---------|------|----------|------|---------|------|
| `prodaudit` | 产品审核 | `commonRef/prodaudit.vue` | 纯表单 | `saveProdAudit` | 仅审核模式（`type === "approve"`）显示；字段：审核意见（通过/退回）、说明 |
| `prodInfo` | 产品基本信息 | `commonRef/prodInfo.vue` | 纯表单 | `saveProInfo`、`getProducts` | 20+ 字段：业务大类、产品大类编码、产品编码、中英文名称、标准承保期限、长短期标志、个/团单标识、组合产品、生效/失效日期等；`edit` 模式禁用 `cProdNo`，`view` 全部禁用 |
| `relatedMainInsurance` | 关联主条款 | `commonRef/relatedMainInsurance.vue` | 表单+表格 | `qryProdRelTermList`、`unAssociationTerm` | 依赖 `prodInfo.cProdNo`；弹窗 `MaininsuranceModal` 关联条款；复制模式有 `assertCopyTargetReady()` 校验 |
| `specialAgreement` | 关联特别约定 | `commonRef/specialAgreement.vue` | 表单+多选表格 | `qryRefProdAndSpecList`、`unAssociationSpec` | 支持批量删除；弹窗：`RelatedSpecialAgree`（关联）、`AddSpecialAgreeModal`（新增）、`UpdateSpecialAgreement`（修改） |
| `prodComponent` | 页面组件绑定 | `commonRef/prodComponent.vue` | 可编辑表格 | `saveProdPages`、`getPageViewByPage` | 弹窗：`prodPageComponent`（组件关联）、`prodPageComFactor`（要素绑定）；支持页面预览 |

**产品管理已注册但当前页面未启用的扩展组件**（在其他配置页面使用，如条款配置、责任配置等页面）：

| 注册名 | 文件 | 说明 |
|--------|------|------|
| `relatedBusinessRulesRef` | `commonRef/RelatedBusinessRules.vue` | 关联业务规则（按机构配置：分期付款、倒签天数、自动核保等），API：`qryRefProdAndRuleList`/`delPrdRuleInfo` |
| `relatedPremCalcuRulesRef` | `commonRef/RelatedPremCalcuRules.vue` | 关联保费计算规则（版本管理），API：`qryVersionInfoList`/`delVersionById` |
| `planConfigrationRef` | `commonRef/PlanConfigration.vue` | 计划配置（方案管理），API：`getPlanBasePage` |
| `rateConfigurationRef` | `commonRef/RateConfiguration.vue` | 费率配置（费率表：保额/保费/费率/年龄区间），API：`qryProdTermFeeInfoPage`/`delProdPlanCvrgFeeInfoById`/`deleteFeeRateByProdNo` |
| `InstituTaxRateAllocatRef` | `commonRef/InstituTaxRateAllocat.vue` | 机构税率配置，API：`qryProdTaxRateInfoPage`/`delProdTaxRateInfoById`/`deleteProdTaxRateByProdNo` |
| `assoCorrPreCalculFormulaRef` | `commonRef/AssoCorrPreCalculFormula.vue` | 关联批改保费计算公式，API：`getEdrFormulaRel`/`delEdrFormulaRel` |
| `relatedPayOrderConfRef` | `commonRef/RelatedPayOrderConf.vue` | 关联见费出单配置，API：`qryPaySeemoneyConfigList`/`delPaySeemoneyConfigById` |
| `relatedResponsRef` | `commonRef/relatedRespons.vue` | 关联责任，API：`getCvrgRiskRelList`/`delRiskRel` |
| `relatedAdditionalInsRef` | `commonRef/relatedAdditionalIns.vue` | 关联附加险 |
| `relatedTermsRef` | `commonRef/relatedTerms.vue` | 关联条款（依赖 `inruranceTypeBasicInfo` 组件），API：`qryProdTermList` |
| `clauseConfRef` | `clauseConfRef/clauseConf.vue` | 条款配置列表，API：`qryProdTermList`；弹窗：`ClauseConfAdd`/`AddTermModal`/`EditTermModal`/`RelatedTermsModal` |
| `cvrgRef` | `cvrgRef/cvrg.vue` | 责任/险别表格（由 `pageSchema` props 动态驱动，通过 `formInit()` 生成配置） |
| `webPlyTermCommon` | `cvrgRef/plyTermCommon.vue` | 通用条款组件（主条款列表 + 公共条款，含互斥逻辑 `mutualExclusionClause`） |

> 这些扩展组件的统一模式：查询表单 + 分页表格 + 弹窗新增/编辑 + 行内删除，都依赖 `prodInfo.cProdNo` 作为关联键。

### 10.2 goodsConfig（商品/方案配置）

- 列表入口：`src/views/goodsConfig/commodity-main.vue`
  - 查询条件：产品大类、产品名称、商品编号、商品名称、状态、商品类型、平台名称
  - 行操作：编辑（仅状态 0/3/6 可见）、提交审核（仅状态 2 可见）、查看、复制
- 典型详情页：`src/views/goodsConfig/commodityEdit.vue`
  - 通过加密参数 `route.query.param` 传递复杂编辑参数，页面内 `descryptParameter` 解密为 `queryParam`
  - 底部按钮区域根据 `editType` 动态显示：`add/edit/copy/upload` → 保存 + 保存并提交；`handle` → 提交审核；其他 → 仅返回

**商品详情页段落配置（pageInfo）与组件映射：**

| pageKey | 标题 | 组件文件 | 类型 | 核心API | 说明 |
|---------|------|----------|------|---------|------|
| `commodityBasicInfo` | 商品基本信息 | `commodityRef/commodityBasicInfo.vue` | 纯表单(40+字段) | `saveCommodityBase`、`getCommodityBase` | 产品关联（cKindNo→cProdNo 联动）、保险期间、出单控制、通知配置、支付/费用、项目分类（三级联动）、发票/互联网、联共保、推送配置等；`edit` 禁用 cKindNo/cProdNo/cAffiliatedMrk |
| `choosePlan` | 选择方案 | `commodityRef/ChonsePlan.vue` | 表单+表格+弹窗 | `queryCommodityPlanList`、`deleteCommodityPlan`、`commodityBaseOperatorCheck` | 依赖 `commodityBasicInfo.cCommodityNo`；弹窗 `planConfigurationAdd`（选择）、`planConfigurationEdit`（编辑别名）；删除前校验再保分保；内嵌 `planInfo` 弹窗查看方案详情 |
| `permissionAllo` | 出单权限分配 | `commodityRef/PermissionAllo.vue` | 复杂表单(含弹窗选择器) | `checkProdGrade` | 弹窗：`DepartmentTree`（机构树）、`OrderIssuer`（出单员）、`Salesman`（业务员）、`Agent`（代理人）、`agentWorker`（代理业务员）；`checkProdGradeChange()` 校验销售资质 |
| `InsuranceRules` | 投保规则 | `commodityRef/InsuranceRules.vue` | 纯表单 | `getCommodityRule`、`saveRule` | 份数上限、被保人年龄/性别/社保、投保人年龄；仅当 `commodityBasicInfo.cPolicyLimit` 为是时才保存 |
| `TestReport` | 测试报告 | `commodityRef/TestReport.vue` | 纯表单 | - | 字段：`cTestReport`（textarea）；条件显示：根据商品状态和操作类型 |
| `ReviewComments` | 审核意见 | `commodityRef/ReviewComments.vue` | 纯表单 | `processApprove`、`getProcessInfo` | 仅 `handle/review` 模式显示；审核意见选项根据当前审核状态动态变化 |

**商品管理弹窗组件清单：**

| 弹窗组件 | 说明 |
|----------|------|
| `commodityRef/DepartmentTree.vue` | 机构部门树选择（懒加载 el-tree，支持搜索） |
| `commodityRef/OrderIssuer.vue` | 出单员选择（查询+表格） |
| `commodityRef/Salesman.vue` | 业务员/产险专员选择 |
| `commodityRef/Agent.vue` | 代理人/经纪人选择 |
| `commodityRef/agentWorker.vue` | 代理业务员选择 |
| `commodityRef/planConfigurationAdd.vue` | 选择方案弹窗（API：`queryPlan`/`saveCommodityPlan`） |
| `commodityRef/planConfigurationEdit.vue` | 修改方案别名弹窗（API：`saveCommodityPlanTermDisPlayNme`） |
| `commodityRef/DeductibleFix.vue` | 免赔条件选择（双Tab：已有选择+智能文本拆分） |
| `commodityRef/prd-fix-spec.vue` | 特别约定选择（双Tab：已有选择+智能文本拆分，支持中英文） |

### 10.3 商品审核多级状态机

商品审核采用多级审核流程，`ReviewComments` 组件的审核意见选项根据当前状态动态变化：

```
一级审核(cUndrStatus=1) → 发测试(2) / 发测试-信息补充(3) / 驳回(0)
二级审核(cUndrStatus=4) → 提交发布(5) / 驳回至测试(2) / 驳回至测试-信息补充(3)
IT审核(cUndrStatus=5)   → 已发布(6)
```

- 审核流程入口：`commodityEdit.vue` 的 `processinfoQuery()` 方法调 `getProcessInfo` 获取当前状态
- 审核提交：`reViewClick()` 方法调 `processApprove` 提交
- 保存并提交：`saveAllSubmit()` → `saveAll(call)` → `save(call, param)` → `saveCommodityBase` → `addProcessUndr`

### 10.4 组件设计模式分类

项目中所有子组件可归纳为 4 种设计模式：

| 模式 | 基础设施 | 特点 | 代表组件 |
|------|----------|------|----------|
| **纯表单型** | `AppFreeEdit` | 通过 `fromSchema` 配置驱动渲染，支持验证/回填/禁用 | prodInfo、commodityBasicInfo、InsuranceRules、ReviewComments、TestReport、prodaudit |
| **表单+表格型** | `AppFreeEdit` + `AppTable` | 上方查询表单 + 下方分页表格 + 行操作 + 弹窗 | relatedMainInsurance、specialAgreement、RelatedBusinessRules、RateConfiguration 等 |
| **可编辑表格型** | `AppGridEdit` | 直接在表格中编辑，支持新增/删除行 | prodComponent、cvrg |
| **动态渲染型** | `formInit()` + `AppGridEdit` | 由 JSON Schema（`pageSchema` props）驱动，字段完全动态 | cvrg（通过 `pageSchema` props）、plyTermCommon |

### 10.5 跨组件通信机制总结

| 机制 | 使用场景 | 示例 |
|------|----------|------|
| `dataOpertaor.getTableRefByKey()` | 最常用：子组件直接获取其他子组件 ref 调用其方法 | `opertaor.getTableRefByKey("prodInfo").getFromValue().cProdNo` |
| `dataParam.getParam()` | 子组件获取父页面传入的参数（editType、prod 等） | `const param = dataparam.getParam()` |
| `eventBus.emit/on` | 跨组件事件通知 | `eventBus.emit('cKindNo-change', val)` 商品大类变化通知 |
| `provide/inject(idxParamKey)` | 依赖注入保持 store 实例一致 | 见 6.6 节 |
| `DzModal.open().then()` | 弹窗返回数据的 Promise 式通信 | `dzmodal.open(MaininsuranceModal, {...}).then(res => { if(res.type==='ok') ... })` |

### 10.6 复制模式的特殊校验逻辑

产品管理中的关联类组件（relatedMainInsurance、specialAgreement 等）在复制模式下有统一的校验模式：

```typescript
// 获取源产品编码（从路由参数）
function getSourceProdNo() { return param?.prodNo || param?.prod?.cProdNo || ""; }
// 获取目标产品编码（从 prodInfo 组件表单）
function getTargetProdNo() { return tabref?.getFromValue?.()?.cProdNo || ""; }
// 获取当前生效的产品编码
function getActiveProdNo() {
  if (param.editType === "edit") return getSourceProdNo();
  if (param.editType === "copy") return getTargetProdNo() && getTargetProdNo() !== getSourceProdNo() ? getTargetProdNo() : getSourceProdNo();
  return getTargetProdNo();
}
// 复制模式校验：必须先保存新产品编码才能操作关联数据
function assertCopyTargetReady() {
  if (param.editType !== "copy") return true;
  if (!getTargetProdNo() || getTargetProdNo() === getSourceProdNo()) {
    ElMessage.error("复制模式请先录入并保存新的产品编码后操作!");
    return false;
  }
  return true;
}
```

所有关联操作（关联条款、关联特约等）在执行前都会先调 `assertCopyTargetReady()` 校验。

### 10.7 API 接口域清单（src/api/prod/index.ts）

该文件 1600+ 行，是两个模块的核心 API 层。按功能域分类的主要接口：

**产品管理：**

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

**商品管理：**

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

> 定位建议：遇到接口问题时，优先在 `src/api/prod/index.ts` 中全文搜索函数名。

## 11. “复制（Copy）”功能统一原则（项目级约束）

复制功能在本项目中遵循统一的设计原则（用于快速扩展到多个配置模块）：

- Copy = Edit Data + Add Permission + Add Save
  - 数据回填：走“修改查询/详情接口”拿到完整数据（对齐 Edit）
  - 控件权限：按“新增态”处理（复制态必须 100% 可编辑，不能沿用 Edit/View 的禁用逻辑）
  - 保存行为：走“新增接口”，且必须清理原记录主键/唯一标识，防止覆盖或唯一键冲突
- 主键清理工具：`createCopyData(row, clearKeys)` 默认会清除 `id/uuid/configId/prodId/versionId/cPkId` 等，并支持额外传入字段（见 [copy.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/utils/copy.ts#L1-L32)）
- 标题规范：弹窗或跳转页面标题统一为 `操作类型-模块名称`（例如：`复制-组件设计`）
- 路由传参：跳转到详情页（例如 `prodFactoryInfo`/`plan-info`）时需携带 `query.title` 驱动面包屑/标签标题

## 12. 常见开发任务定位指南

### 12.1 新增一个“动态段落组件”（可被 pageRef 渲染）

1) 在 `src/pcis/prodRef/**` 下创建组件（或复用已有组件）
2) 在 [prodRef.ts](file:///d:/work/productFactory/nvhl-pcis-ui/src/pcis/prodRef/prodRef.ts) 中 import 并加入 `componentMap`，key 形如 `xxxRef`
3) 在目标页面（如 `prodFactoryInfo.vue` / `commodityEdit.vue`）的 `pageInfo` 中加入：
   - `pageKey`：锚点 id
   - `pageTtile`：侧栏显示标题
   - `pageRef`：不带 `Ref` 的前缀（例如 `xxx`），页面通过 `xxx-ref` 渲染到 `xxxRef`

### 12.2 新增一个“可被后端菜单配置的页面”

1) 在 `src/views/**` 下创建页面文件，路径需与后端返回的 `component` 字段一致：
   - 后端 `component: "goodsConfig/commodityEdit"` → 前端文件必须存在 `src/views/goodsConfig/commodityEdit.vue`
2) 确保路由 meta/权限字段与后端菜单一致
3) 角色路由注入逻辑由 permission store 统一完成（见 [permission store](file:///d:/work/productFactory/nvhl-pcis-ui/src/store/modules/permission.ts#L38-L67)）

## 13. 产品管理与商品管理数据流速查

### 13.1 产品管理数据流

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

### 13.2 商品管理数据流

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
  │     └── getTableValue() 供父组件验证方案列表非空 + cSaleName 非空
  ├── permissionAllo ← 依赖 commodityBasicInfo 数据
  │     └── checkProdGradeChange() 销售资质校验
  ├── InsuranceRules ← 仅当 cPolicyLimit 为是时保存（saveRule 由父组件调）
  ├── TestReport ← 条件显示（根据商品状态）
  └── ReviewComments ← 仅 handle/review 模式（审核状态机动态选项）

  保存流程：
  saveAll(call?) → validateForm() → commodityBaseOperatorCheck() → save(call, param)
    → saveCommodityBase → 若 cPolicyLimit → InsuranceSaveData() → 若有 call → 审核流程
```

### 13.3 商品状态值速查

| 状态值 | 含义 |
|--------|------|
| 0 | 草稿/禁用 |
| 1 | 一级审核 |
| 2 | 待测试 |
| 3 | 测试中 |
| 4 | 二级审核 |
| 5 | IT审核 |
| 6 | 已发布 |

---

如需进一步扩展，可补充：组合出单（posite）模块分析、批改（edr）模块分析、系统权限管理模块详细说明。

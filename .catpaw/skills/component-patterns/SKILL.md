---
name: component-patterns
description: nvhl-pcis-ui 组件设计模式，包括动态子组件注册表、dataOpertaor 编排、defineExpose 接口契约、依赖注入链与跨组件通信机制
---

# 组件设计模式与架构约定

## 动态子组件注册表：prodRef

- `src/pcis/prodRef/prodRef.ts` 将多个子模块注册为全局组件
- 组件名采用 `camelCase`（例如 `prodauditRef`），模板中使用 `kebab-case`（例如 `prodaudit-ref`）

## 核心页面组织方式：锚点侧栏 + 动态子组件

详情页将多个业务段落配置为 `pageInfo`，通过 `<component :is="k.pageRef + '-ref'" />` 动态渲染。

### 产品详情页（prodFactoryInfo.vue）

| pageKey | 标题 | 组件文件 | 类型 |
|---------|------|----------|------|
| `prodaudit` | 产品审核 | `commonRef/prodaudit.vue` | 纯表单 |
| `prodInfo` | 产品基本信息 | `commonRef/prodInfo.vue` | 纯表单 |
| `relatedMainInsurance` | 关联主条款 | `commonRef/relatedMainInsurance.vue` | 表单+表格 |
| `specialAgreement` | 关联特别约定 | `commonRef/specialAgreement.vue` | 表单+多选表格 |
| `prodComponent` | 页面组件绑定 | `commonRef/prodComponent.vue` | 可编辑表格 |

### 商品详情页（commodityEdit.vue）

| pageKey | 标题 | 组件文件 | 类型 |
|---------|------|----------|------|
| `commodityBasicInfo` | 商品基本信息 | `commodityRef/commodityBasicInfo.vue` | 纯表单(40+字段) |
| `choosePlan` | 选择方案 | `commodityRef/ChonsePlan.vue` | 表单+表格+弹窗 |
| `permissionAllo` | 出单权限分配 | `commodityRef/PermissionAllo.vue` | 复杂表单 |
| `InsuranceRules` | 投保规则 | `commodityRef/InsuranceRules.vue` | 纯表单 |
| `TestReport` | 测试报告 | `commodityRef/TestReport.vue` | 纯表单 |
| `ReviewComments` | 审核意见 | `commodityRef/ReviewComments.vue` | 纯表单 |

## dataOpertaor：统一管理"页面段落配置 + 子组件引用"

`dataOpertaor({ id: route.name })` 提供：

| 方法 | 说明 |
|------|------|
| `setTableConfig(config)` | 设置页面段落配置 |
| `getTableConfig()` | 获取页面段落配置 |
| `addTableRef(key, ref)` | 注册子组件 ref |
| `getTableRefByKey(key)` | **最常用**：按 pageKey 获取其他子组件 ref |
| `setDataAll(data)` | 遍历所有 ref 调 `setFormValue`，统一回填 |
| `getDataAll()` | 遍历所有 ref 调 `getFromValue`，统一取数 |
| `validateAll()` | 遍历所有 ref 调 `validate`，返回 `Promise<boolean>` |
| `setDisabledAll(keys?)` | 遍历所有 ref 设为只读 |
| `setParam(params)` / `getParam()` | 页面级参数存取 |
| `convertData(result)` | 将后端扁平数据按 pageInfo 结构拆分 |
| `mapSetData(data)` | 从 pageInfo schema 抽离字段拼回 |
| `init()` | 清空所有状态 |

> 注意：dataOpertaor 使用 `localStorage` 持久化，路由切换时 `beforeEach` 会清理上一页缓存。

## 子组件统一接口契约（defineExpose 模式）

所有被 `dataOpertaor` 管理的子组件 **必须** 通过 `defineExpose` 暴露以下方法：

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

**核心设计原则：接口契约统一，实现细节各异。**

## 依赖注入链（idxParam）

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
- `useIdxParam()` 是安全降级：组件不在 provide 上下文中时返回空参数

## 组件设计模式分类

| 模式 | 基础设施 | 特点 | 代表组件 |
|------|----------|------|----------|
| **纯表单型** | `AppFreeEdit` | `fromSchema` 配置驱动渲染 | prodInfo、commodityBasicInfo、InsuranceRules |
| **表单+表格型** | `AppFreeEdit` + `AppTable` | 查询表单 + 分页表格 + 行操作 + 弹窗 | relatedMainInsurance、specialAgreement |
| **可编辑表格型** | `AppGridEdit` | 表格中直接编辑 | prodComponent、cvrg |
| **动态渲染型** | `formInit()` + `AppGridEdit` | JSON Schema（`pageSchema`）驱动 | cvrg、plyTermCommon |

## 跨组件通信机制

| 机制 | 使用场景 | 示例 |
|------|----------|------|
| `dataOpertaor.getTableRefByKey()` | 最常用：子组件获取其他子组件 ref | `opertaor.getTableRefByKey("prodInfo").getFromValue().cProdNo` |
| `dataParam.getParam()` | 子组件获取父页面传入的参数 | `const param = dataparam.getParam()` |
| `eventBus.emit/on` | 跨组件事件通知 | `eventBus.emit('cKindNo-change', val)` |
| `provide/inject(idxParamKey)` | 依赖注入保持 store 实例一致 | 见依赖注入链 |
| `DzModal.open().then()` | 弹窗返回数据的 Promise 式通信 | `dzmodal.open(MaininsuranceModal, {...}).then(res => ...)` |

## 新增动态段落组件步骤

1. 在 `src/pcis/prodRef/**` 下创建组件
2. 在 `prodRef.ts` 中 import 并加入 `componentMap`，key 形如 `xxxRef`
3. 在目标页面的 `pageInfo` 中加入 `pageKey`、`pageTtile`、`pageRef`

---
name: dev-conventions
description: nvhl-pcis-ui 开发规范与约定，包括复制功能统一原则、主键清理、标题规范、路由传参与常见开发任务定位指南
---

# 开发规范与约定

## 复制（Copy）功能统一原则

复制功能在本项目中遵循统一的设计原则（用于快速扩展到多个配置模块）：

**Copy = Edit Data + Add Permission + Add Save**

1. **数据回填**：走"修改查询/详情接口"拿到完整数据（对齐 Edit）
2. **控件权限**：按"新增态"处理（复制态必须 100% 可编辑，不能沿用 Edit/View 的禁用逻辑）
3. **保存行为**：走"新增接口"，且必须清理原记录主键/唯一标识，防止覆盖或唯一键冲突

### 主键清理工具

`createCopyData(row, clearKeys)` 默认清除 `id/uuid/configId/prodId/versionId/cPkId` 等，并支持额外传入字段。

文件位置：`src/utils/copy.ts`

### 标题规范

弹窗或跳转页面标题统一为 `操作类型-模块名称`（例如：`复制-组件设计`）

### 路由传参

跳转到详情页时需携带 `query.title` 驱动面包屑/标签标题。

## 复制模式的特殊校验逻辑

产品管理中的关联类组件在复制模式下有统一的校验模式：

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

## 常见开发任务定位指南

### 新增一个"动态段落组件"（可被 pageRef 渲染）

1. 在 `src/pcis/prodRef/**` 下创建组件（或复用已有组件）
2. 在 `prodRef.ts` 中 import 并加入 `componentMap`，key 形如 `xxxRef`
3. 在目标页面的 `pageInfo` 中加入：
   - `pageKey`：锚点 id
   - `pageTtile`：侧栏显示标题
   - `pageRef`：不带 `Ref` 的前缀（例如 `xxx`），页面通过 `xxx-ref` 渲染到 `xxxRef`

### 新增一个"可被后端菜单配置的页面"

1. 在 `src/views/**` 下创建页面文件，路径需与后端返回的 `component` 字段一致：
   - 后端 `component: "goodsConfig/commodityEdit"` → 前端文件必须存在 `src/views/goodsConfig/commodityEdit.vue`
2. 确保路由 meta/权限字段与后端菜单一致
3. 角色路由注入逻辑由 permission store 统一完成

### 新增子组件时的 defineExpose 契约

所有被 `dataOpertaor` 管理的子组件必须暴露：

```typescript
defineExpose({
  getFromValue(),      // 获取表单数据
  setFormValue(data),  // 回填表单数据
  validate(),          // 表单验证
  setValue(key, val),  // 设置单个字段值
  getValue(key),       // 获取单个字段值
});
```

## 商品管理弹窗组件清单

| 弹窗组件 | 说明 |
|----------|------|
| `commodityRef/DepartmentTree.vue` | 机构部门树选择（懒加载 el-tree，支持搜索） |
| `commodityRef/OrderIssuer.vue` | 出单员选择（查询+表格） |
| `commodityRef/Salesman.vue` | 业务员/产险专员选择 |
| `commodityRef/Agent.vue` | 代理人/经纪人选择 |
| `commodityRef/agentWorker.vue` | 代理业务员选择 |
| `commodityRef/planConfigurationAdd.vue` | 选择方案弹窗 |
| `commodityRef/planConfigurationEdit.vue` | 修改方案别名弹窗 |
| `commodityRef/DeductibleFix.vue` | 免赔条件选择（双Tab） |
| `commodityRef/prd-fix-spec.vue` | 特别约定选择（双Tab，支持中英文） |

## 动态表单/表格体系（shared）

全局注册入口：`app.use(shareds)`（`src/main.ts`）

`src/shared/shared.ts` 注册的组件：
- 表单基础：`AppFreeEdit`、`AppGridEdit`
- 动态表单：`DynamicForms` + `FromItem`
- 表单项组件：`rtinput/rtselect/rttable/rtUpload/...`

定位建议：看到 `pageSchema/fromSchema/inputtype` 结构时，优先去 `src/shared/` 查对应渲染逻辑。

## 全局弹窗服务（DzModal）

```typescript
const dzmodal = useDzModal();
dzmodal.open(Component, { props }).then(res => {
  if (res.type === 'ok') { /* 处理确认 */ }
});
```

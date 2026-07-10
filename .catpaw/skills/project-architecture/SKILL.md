---
name: project-architecture
description: nvhl-pcis-ui 项目架构概览，包括技术栈、启动流程、动态路由、鉴权机制与核心目录结构
---

# nvhl-pcis-ui 项目架构概览

## 项目定位

- **项目名称**：nvhl-pcis-ui
- **类型**：后台管理系统（Vue 3 + Vite + TypeScript），在 `vue3-element-admin` 模板基础上深度定制
- **核心业务域**：
  - `prodFactory`：产品配置/产品管理（产品要素、组件、责任、条款、特约、产品等）
  - `goodsConfig`：商品/方案配置（商品基本信息、选择方案、出单权限分配、投保规则、审核等）

## 快速启动与构建

- Node：>= 18
- 包管理：pnpm（`package.json` 含 `preinstall: only-allow pnpm`）

```bash
pnpm install
pnpm dev        # 开发环境
pnpm uat        # UAT 环境
pnpm verification
pnpm pre
pnpm prod
pnpm build:dev  # 构建各环境
```

多环境代理：`vite.config.ts` 根据 mode 切换 proxy target。

## 关键目录结构

- `src/main.ts`：应用入口、插件注册、全局组件注册
- `src/router/`：路由创建 + push/replace 扩展（query 加密、componentKey 注入）
- `src/plugins/permission.ts`：路由守卫（token/角色/动态路由注入/路由参数解密）
- `src/store/`：Pinia（用户、权限路由、标签页、业务态缓存等）
- `src/utils/request.ts`：Axios 实例 + 请求/响应拦截
- `src/api/`：按域划分接口；产品/商品配置主要集中在 `src/api/prod/index.ts`
- `src/views/`：页面（后端动态路由的 component 字段映射到这里的 `.vue` 文件）
- `src/pcis/prodRef/`：动态业务组件注册表
- `src/shared/`、`src/components/`、`src/common/`：二次封装的通用能力

## 应用启动流程

1. `createApp(App)` → 注册 store/directive/i18n 等 → `setupPermission()` 注册守卫 → `app.use(router).mount('#app')`
2. 登录与鉴权：token 存在于 `sessionStorage.token`，未登录访问非白名单路由跳转 `/login`
3. 动态路由注入：登录后 `getUserInfo()` → `generateRoutes(roles)` → 调用 `GET /menus-interface/menuRoutesList` → 后端返回 `component` 映射到 `src/views/${component}.vue`

## 路由参数加密/解密

- **发送端**：重写 `router.push`/`router.replace`，自动注入 `componentKey`，对 query 做加密
- **接收端**：`afterEach` 统一对 `to.query` 做解密，解析为 `to.params`
- 开发建议：如果 `route.query.xxx` 值异常（密文），确认是否属于统一加密体系

## HTTP 与接口调用约定

- Token：`sessionStorage.token` → `Authorization` header
- 部门：`sessionStorage.opOrg` → `Department` header
- 请求体加密：非 multipart 请求将 data 包装为 `{ source: JSON.stringify(param) }` 并加密
- 401：弹窗提示并触发 logout + reload

## 公共状态（Pinia）

- `useAppStore`：侧边栏开关、语言、Element Plus locale、组件尺寸
- `useUserStore`：用户信息、角色 roles、按钮权限 perms、登录/登出
- `usePermissionStore`：拉取后端菜单路由树并动态挂载
- `useTagsViewStore`：多标签页/缓存
- `useProductStore`：产品域共享状态（联共保、保费/保额等）
- `dataOpertaor`：多段落页面的统一编排容器

## 公共组件与基础设施

- `src/components/`：通用 UI 组件（面包屑、分页、上传、富文本等）
- `src/components/common/`：通用业务组件
- `src/shared/`：动态表单/动态表格体系（`AppFreeEdit`、`AppGridEdit`、`DynamicForms` 等）
- `src/common/`：弹窗服务（DzModal）、popover、tooltip
- 全局指令：`v-hasPerm`（按钮权限）、`v-hasRole`（角色权限）
- 事件总线：`src/utils/event-bus.ts`

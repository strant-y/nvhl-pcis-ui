
# 侧边栏 UI 优化需求文档
文件位置：D:\work\productFactory\nvhl-pcis-ui\src\views\prodconfiguration\prodFactoryInfo.vue
## 一、任务目标

请优化prodFactoryInfo页面左侧侧边栏（Sidebar/Menu）的 UI 样式。

当前项目技术栈：

- Vue3
- TypeScript
- Element Plus
- SCSS
- 企业后台管理系统


优化目标：

将当前传统后台蓝色菜单风格，升级为：

> 飞书（Feishu）+ Ant Design Pro + 企业 SaaS 后台风格


要求：

- 保留现有菜单功能
- 不修改菜单数据结构
- 不修改路由逻辑
- 不影响权限控制
- 只优化 UI、布局、交互体验


---

# 二、当前问题分析

当前侧边栏存在以下问题：

## 1. 颜色过重

目前：

- 整个侧边栏蓝色背景
- 白色文字


问题：

- 页面视觉中心被侧边栏抢占
- 长时间使用容易疲劳
- 与当前白色卡片内容区域不协调


优化：

改为：

- 白色背景
- 浅灰边框
- 蓝色作为强调色


---



# 二、整体设计规范


## 1. Sidebar尺寸


展开状态：

```css
width:220px;
````

折叠状态：

```css
width:64px;
```

高度：

```css
height:100vh;
```

---

# 四、颜色规范

## Sidebar背景

```css
background:#FFFFFF;
```

## 边框

```css
border-right:1px solid #E5E6EB;
```

## 普通菜单文字

```css
color:#4E5969;
```

## 菜单文字

```css
color:#1D2129;
font-weight:600;
```

## Hover状态

背景：

```css
background:#F2F3F5;
```

文字：

```css
color:#1D2129;
```

## 激活状态

背景：

```css
background:#E8F3FF;
```

文字：

```css
color:#3370FF;
font-weight:600;
```

左侧增加蓝色标识：

```css
width:3px;
background:#3370FF;
```

---


# 菜单样式规范

## 菜单项高度

统一：

```css
height:40px;
line-height:40px;
```

---

## 菜单左右间距

```css
margin:4px 12px;
```

---

## 圆角

```css
border-radius:6px;
```

---

## 字体

普通菜单：

```css
font-size:14px;
font-weight:400;
```

激活：

```css
font-weight:600;
```

---

# 八、菜单图标优化

要求：

图标大小：

```css
font-size:16px;
```

普通颜色：

```css
color:#86909C;
```

激活颜色：

```css
color:#3370FF;
```

图标和文字距离：

```css
margin-right:10px;
```

---

# 九、激活菜单效果

当前选中菜单：

例如：

```
产品基本信息
```

效果：

```
┌──────────────────┐
│▌ 📄 产品基本信息 │
└──────────────────┘
```

实现：

```css
.el-menu-item.is-active {

background:#E8F3FF;

color:#3370FF;

}


.el-menu-item.is-active::before {

content:"";

width:3px;

height:20px;

background:#3370FF;

border-radius:2px;

}

```

---






# 折叠菜单

支持：

展开：

```
📦 产品管理

   产品配置
```

折叠：

```
📦

📄

⚙

```

折叠动画：

```css
transition:width .2s ease;
```

---

# 十三、底部收起按钮

位置：

Sidebar底部。

样式：

```css
height:40px;

border-top:1px solid #E5E6EB;

```

图标：

展开：

```
<

```

折叠：

```
>

```

---

# 十四、交互效果

## Hover

增加过渡：

```css
transition:

background-color .2s ease;

color .2s ease;

```

---

## 激活

动画：

不要突兀。

要求：

* 背景渐变
* 左侧标识平滑出现

---

# 十五、不要出现的效果

禁止：

❌ 整块深蓝背景

❌ 白色文字铺满

❌ 大面积高亮

❌ 菜单高度过高

❌ 强阴影

❌ 复杂渐变

---

# 十六、最终视觉目标

最终效果接近：

* 飞书后台
* Ant Design Pro
* 字节企业后台

特点：

* 简洁
* 轻量
* 高级
* 长时间使用舒适

---

# 十七、代码要求

修改要求：

1. 把修改后的侧栏封装为组件，在引用到页面



2. 样式统一放：



3. 使用 SCSS变量管理颜色

例如：

```scss
$primary-color:#3370FF;

$text-color:#4E5969;

$border-color:#E5E6EB;

```

4. 不允许：

* 修改接口
* 修改菜单数据
* 修改权限逻辑
* 修改路由

---

# 十八、完成后输出

请输出：

1. 修改后的 Sidebar.vue

2. 修改后的 SCSS

3. 修改说明

4. 修改前后效果对比

5. 是否存在兼容问题

```

---


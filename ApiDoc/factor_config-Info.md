# 要素配置接口文档

> 模块：`nvhl-pcis-prod-definition-impl`
> Controller：`FactorConfigController`
> 创建时间：2026-07-22
> 涉及新表：`web_page_factor_config`（页面级）、`web_rule_factor_config`（规则级）

---

## 一、背景说明

要素主表 `web_factor_items` 是全局共享的定义表，不同产品/页面/方案对同一要素需要不同的默认值和JSON配置。
新增两张中间表实现"页面级覆盖"和"规则级绑定+配置"，要素主表不做任何修改。

| 中间表 | 关联维度 | 基础结构 | 存储内容 | 回显叫法 |
|--------|---------|---------|---------|---------|
| `web_page_factor_config` | 产品 + 页面 + 组件 + 要素 | 独立结构 | 默认值 + JSON（覆盖） | 页面配置 |
| `web_rule_factor_config` | 规则编码 + 要素 | 基于 web_component_item_rel | 要素选择 + 排序 + 分组 + 折叠 + 显示位置 + 宽度 + 作用域 + 默认值 + JSON | 投保规则展示 |

### web_rule_factor_config 与 web_component_item_rel 的关系

`web_rule_factor_config` 基于 `web_component_item_rel` 的字段结构，区别如下：

| 对比项 | web_component_item_rel | web_rule_factor_config |
|--------|----------------------|------------------------|
| 分组字段 | c_component_key（组件key） | **c_rule_code（规则编码）** |
| 原有字段 | c_factor_key, c_group, c_sorting_no, c_expand, c_show_location, c_table_width, c_sys_config | 全部保留 |
| 新增字段 | 无 | **c_factor_default, c_factor_json** |
| 删除条件 | WHERE c_component_key = ? | WHERE c_rule_code = ? |

---

## 二、页面级要素配置

### 2.1 保存页面要素配置

**接口地址**：`POST /savePageFactorConfig`

**接口说明**：按产品+页面+组件维度，保存要素的默认值和JSON配置。采用先删后插全量替换模式。

**操作表**：`web_page_factor_config`

**请求参数**：

```json
{
  "cProdNo": "741852",
  "cPageCode": "028af4c1a2f34f2e97574a703939c9ae",
  "cComponentCode": "BankDist120005",
  "factorConfigs": [
    {
      "cFactorKey": "00058c3f7aeb444cb229a6a3d099e022",
      "cFactorDefault": "默认货物名称",
      "cFactorJson": "{\"disabled\": false}"
    }
  ]
}
```

**请求字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| cProdNo | String | 是 | 产品编码 |
| cPageCode | String | 是 | 页面主键 |
| cComponentCode | String | 是 | 组件key |
| factorConfigs | Array | 是 | 要素配置列表 |
| factorConfigs[].cFactorKey | String | 是 | 要素key |
| factorConfigs[].cFactorDefault | String | 否 | 默认值（页面级覆盖） |
| factorConfigs[].cFactorJson | String | 否 | JSON配置（页面级覆盖） |

**响应示例**：

```json
{
  "code": "0",
  "message": "success"
}
```

---

### 2.2 查询页面要素配置

**接口地址**：`POST /queryPageFactorConfig`

**请求参数**：

```json
{
  "cProdNo": "741852",
  "cPageCode": "028af4c1a2f34f2e97574a703939c9ae",
  "cComponentCode": "BankDist120005"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| cProdNo | String | 是 | 产品编码 |
| cPageCode | String | 是 | 页面主键 |
| cComponentCode | String | 否 | 组件key，为空查全部 |

**响应示例**：

```json
{
  "code": "0",
  "message": "success",
  "data": [
    {
      "cPkId": "a1b2c3d4...",
      "cProdNo": "741852",
      "cPageCode": "028af4c1...",
      "cComponentCode": "BankDist120005",
      "cFactorKey": "00058c3f...",
      "cFactorDefault": "默认货物名称",
      "cFactorJson": "{\"disabled\": false}",
      "cSortingNo": 1,
      "cFactorProp": "Tgt.cGoodsNo",
      "cFactorTitle": "货物名称",
      "cFactorInputtype": "rtinput"
    }
  ]
}
```

---

## 三、规则级要素配置（方案/商品）

### 3.1 保存规则要素配置

**接口地址**：`POST /saveRuleFactorConfig`

**接口说明**：按规则编码（方案或商品）维度，保存要素的选择及全部配置。采用先删后插全量替换模式（按 c_rule_code 删除）。基于 `web_component_item_rel` 结构，`c_component_key` 替换为 `c_rule_code`，额外增加 `c_factor_default` 和 `c_factor_json`。回显为"投保规则展示"。

**操作表**：`web_rule_factor_config`

**请求参数**：

```json
{
  "cRuleCode": "PLAN001",
  "factorConfigs": [
    {
      "cFactorKey": "00058c3f7aeb444cb229a6a3d099e022",
      "cGroup": "",
      "cSortingNo": 1,
      "cExpand": "",
      "cShowLocation": "",
      "cTableWidth": "",
      "cSysConfig": "",
      "cFactorDefault": "默认货物名称",
      "cFactorJson": "{\"disabled\": false}"
    },
    {
      "cFactorKey": "0075f3b34a5411f0b066fa163e3db1d5",
      "cGroup": "basic",
      "cSortingNo": 2,
      "cExpand": "0",
      "cShowLocation": "1",
      "cTableWidth": "200px",
      "cSysConfig": "000",
      "cFactorDefault": "",
      "cFactorJson": ""
    }
  ]
}
```

**请求字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| cRuleCode | String | 是 | 规则编码（方案编码或商品编码） |
| factorConfigs | Array | 是 | 要素配置列表 |
| factorConfigs[].cFactorKey | String | 是 | 要素key（web_factor_items.c_pk_id） |
| factorConfigs[].cGroup | String | 否 | 分组名（同 rel 表 c_group） |
| factorConfigs[].cSortingNo | Integer | 否 | 排序号（前端传入，不传则自动递增） |
| factorConfigs[].cExpand | String | 否 | 表格时是否显示在折叠框中（同 rel 表 c_expand） |
| factorConfigs[].cShowLocation | String | 否 | 清单类型显示位置（同 rel 表 c_show_location） |
| factorConfigs[].cTableWidth | String | 否 | 要素宽度（同 rel 表 c_table_width） |
| factorConfigs[].cSysConfig | String | 否 | 系统作用域，3位字符分别代表核心/询价/移动端（同 rel 表 c_sys_config） |
| factorConfigs[].cFactorDefault | String | 否 | 默认值（**新增字段**） |
| factorConfigs[].cFactorJson | String | 否 | JSON配置（**新增字段**） |

**响应示例**：

```json
{
  "code": "0",
  "message": "success"
}
```

**操作逻辑**：
1. `DELETE FROM web_rule_factor_config WHERE c_rule_code = ?`
2. `INSERT INTO web_rule_factor_config (...)` 批量插入

---

### 3.2 查询规则要素配置

**接口地址**：`POST /queryRuleFactorConfig`

**接口说明**：查询指定规则编码下的所有要素配置，LEFT JOIN要素主表返回要素定义信息。用于"投保规则展示"回显。

**请求参数**：

```json
{
  "cRuleCode": "PLAN001"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| cRuleCode | String | 是 | 规则编码（方案编码或商品编码） |

**响应示例**：

```json
{
  "code": "0",
  "message": "success",
  "data": [
    {
      "cPkId": "a1b2c3d4...",
      "cRuleCode": "PLAN001",
      "cFactorKey": "00058c3f...",
      "cGroup": "",
      "cSortingNo": 1,
      "cExpand": "",
      "cShowLocation": "",
      "cTableWidth": "",
      "cSysConfig": "",
      "cFactorDefault": "默认货物名称",
      "cFactorJson": "{\"disabled\": false}",
      "cFactorProp": "Tgt.cGoodsNo",
      "cFactorTitle": "货物名称",
      "cFactorInputtype": "rtinput"
    }
  ]
}
```

**响应字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| cPkId | String | 配置记录主键 |
| cRuleCode | String | 规则编码 |
| cFactorKey | String | 要素key |
| cGroup | String | 分组名 |
| cSortingNo | Long | 排序号 |
| cExpand | String | 表格时是否显示在折叠框中 |
| cShowLocation | String | 清单类型显示位置 |
| cTableWidth | String | 要素宽度 |
| cSysConfig | String | 系统作用域 |
| cFactorDefault | String | 默认值（null表示未设置） |
| cFactorJson | String | JSON配置（null表示未设置） |
| cFactorProp | String | 要素prop（来自web_factor_items主表） |
| cFactorTitle | String | 要素标题（来自web_factor_items主表） |
| cFactorInputtype | String | 要素输入类型（来自web_factor_items主表） |

---

## 四、表结构

### 4.1 web_page_factor_config（页面要素配置表）

| 列名 | 类型 | 可空 | 说明 |
|------|------|------|------|
| c_pk_id | varchar(50) PK | 否 | 主键(UUID) |
| c_prod_no | varchar(10) | 是 | 产品编码 |
| c_page_code | varchar(50) | 是 | 页面主键 |
| c_component_code | varchar(50) | 是 | 组件key |
| c_factor_key | varchar(50) | 是 | 要素key |
| c_factor_default | varchar(500) | 是 | 默认值(页面级覆盖) |
| c_factor_json | text | 是 | JSON配置(页面级覆盖) |
| c_sorting_no | integer | 是 | 排序号 |
| t_crt_tm | timestamp | 是 | 创建时间 |
| t_upd_tm | timestamp | 是 | 最后修改时间 |

### 4.2 web_rule_factor_config（规则要素配置表）

> 基于 `web_component_item_rel` 结构，`c_component_key` 替换为 `c_rule_code`，新增 `c_factor_default` 和 `c_factor_json`

| 列名 | 类型 | 可空 | 说明 | 对应 rel 表字段 |
|------|------|------|------|----------------|
| c_pk_id | varchar(50) PK | 否 | 主键(UUID) | c_pk_id |
| c_rule_code | varchar(20) | 是 | 规则编码(方案或商品编码) | ~~c_component_key~~（替换） |
| c_factor_key | varchar(50) | 是 | 要素key | c_factor_key |
| c_group | varchar(20) | 是 | 分组名 | c_group |
| c_sorting_no | integer | 是 | 排序号(前端传入) | c_sorting_no |
| c_expand | varchar(2) | 是 | 表格时是否显示在折叠框中 | c_expand |
| c_show_location | varchar(2) | 是 | 清单类型显示位置 | c_show_location |
| c_table_width | varchar(10) | 是 | 要素宽度 | c_table_width |
| c_sys_config | varchar(10) | 是 | 系统作用域 | c_sys_config |
| c_factor_default | varchar(500) | 是 | 默认值 | **新增** |
| c_factor_json | text | 是 | JSON配置 | **新增** |
| t_crt_tm | timestamp | 是 | 创建时间 | - |
| t_upd_tm | timestamp | 是 | 最后修改时间 | - |

---

## 五、DDL（待内网执行）

> `web_rule_factor_config` 表需要补充 `web_component_item_rel` 的字段，删掉 `c_component_code`

```sql
-- 1. 删掉 c_component_code
ALTER TABLE web_rule_factor_config DROP COLUMN c_component_code;

-- 2. 加上 rel 表的字段
ALTER TABLE web_rule_factor_config ADD COLUMN c_group varchar(20);
ALTER TABLE web_rule_factor_config ADD COLUMN c_expand varchar(2);
ALTER TABLE web_rule_factor_config ADD COLUMN c_show_location varchar(2);
ALTER TABLE web_rule_factor_config ADD COLUMN c_table_width varchar(10);
ALTER TABLE web_rule_factor_config ADD COLUMN c_sys_config varchar(10);

-- 3. 加注释
COMMENT ON COLUMN web_rule_factor_config.c_group IS '分组名';
COMMENT ON COLUMN web_rule_factor_config.c_expand IS '表格时是否显示在折叠框中';
COMMENT ON COLUMN web_rule_factor_config.c_show_location IS '清单类型显示位置';
COMMENT ON COLUMN web_rule_factor_config.c_table_width IS '要素宽度';
COMMENT ON COLUMN web_rule_factor_config.c_sys_config IS '系统作用域（3位：核心/询价/移动端，0=有效，1=免验证，2=无效，为空默认全有效）';
```

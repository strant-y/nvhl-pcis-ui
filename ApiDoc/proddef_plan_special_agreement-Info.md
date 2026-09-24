# proddef 方案特约管理接口

## 接口说明

方案特约（`web_plan_special_agreement`）管理接口，提供方案与特约的关联、取关、状态修改、新增并绑定等功能。与产品特约（`associationSpec`）模式一致，通过 Feign 远程调用 `nvhl-pcis-prod-definition-impl-ct` 微服务。

---

## 接口列表

| # | 接口名称 | URL | 方法 |
|---|----------|-----|------|
| 1 | 已关联方案特约列表 | `/proddef/qryRefPlanAndSpecList` | POST |
| 2 | 待关联方案特约列表 | `/proddef/getUnbindSpecRefPlan` | POST |
| 3 | 关联方案特约 | `/proddef/associationPlanSpec` | POST |
| 4 | 取关方案特约 | `/proddef/unAssociationPlanSpec` | POST |
| 5 | 修改方案特约状态 | `/proddef/editPlanSpecStatus` | POST |
| 6 | 新增并绑定方案特约 | `/proddef/saveAssociationPlanSpec` | POST |
| 7 | 自定义方案特约 | `/proddef/saveCustomPlanSpec` | POST |

> **完整URL前缀**: `http://localhost:9080/beauty-api`（端口 `9080`，上下文路径 `/beauty-api`，Controller 前缀 `proddef`）

---

## 通用说明

### 请求体格式

所有接口请求体均为 `R` 对象（继承自 `JSONObject`），参数通过 `params` 节点传递：

```json
{
  "params": {
    "CPlanNo": "PLAN2026010001",
    ...
  }
}
```

> 取关接口（`unAssociationPlanSpec`）例外，参数通过 `source` 节点传递 JSON 字符串。

### 外层响应结构（R 对象）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `code` | Integer | 状态码，`200` 表示成功，`500` 表示失败 |
| `msg` | String | 失败时返回错误提示信息（仅失败时存在） |
| `data` | Object | 成功时返回数据（仅成功时存在） |

### BasePageDTO 业务状态码

| code | 说明 |
|------|------|
| `"1"` | 业务处理成功 |
| `"0"` | 业务处理异常 |

---

## 1. 已关联方案特约列表

### 接口信息

| 项目 | 说明 |
|------|------|
| **接口URL** | `/proddef/qryRefPlanAndSpecList` |
| **请求方式** | `POST` |
| **Content-Type** | `application/json` |
| **接口描述** | 分页查询方案已关联的特约列表，支持按特约代码、特约名称筛选 |
| **Controller** | `com.isoftstone.pcis.nvhl.module.prod.controller.ProdDefController#qryRefPlanAndSpecList` |
| **Service** | `com.isoftstone.pcis.nvhl.module.prod.service.ProdDefServiceImpl#qryRefPlanAndSpecList` |
| **Feign** | `com.isoftstone.pcis.nvhl.api.ProductDefinitionService#qryRefPlanAndSpecList` |
| **远端服务** | `nvhl-pcis-prod-definition-impl-ct` → `PlanController#qryRefPlanAndSpecList` |

### 请求参数

| 参数名 | 类型 | 是否必填 | 说明 |
|--------|------|----------|------|
| `CPlanNo` | String | **是** | 方案编码 |
| `CSpecialCode` | String | 否 | 特约代码（模糊查询） |
| `CSpecialName` | String | 否 | 特约名称（模糊查询） |
| `pageNo` | Integer | 否 | 当前页码，默认 1 |
| `pageSize` | Integer | 否 | 每页显示数量，默认 10 |

### 请求示例

```json
{
  "params": {
    "CPlanNo": "PLAN2026010001",
    "CSpecialCode": "",
    "CSpecialName": "",
    "pageNo": 1,
    "pageSize": 10
  }
}
```

### 响应参数

#### data 结构（BasePageDTO）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `code` | String | 业务状态码，`"1"` 成功 |
| `message` | String | 提示信息 |
| `data` | List&lt;WebPlanSpecRelPageQueryResultDTO&gt; | 已关联特约列表 |
| `total` | Integer | 总记录数 |
| `pageNum` | Integer | 当前页码 |
| `pageSize` | Integer | 每页显示数量 |

#### data 列表元素字段（WebPlanSpecRelPageQueryResultDTO）

| 字段名 | 类型 | 数据库字段 | 说明 |
|--------|------|------------|------|
| `cPkId` | String | `c_pk_id` | 主键 |
| `nSeqNo` | Integer | `n_seq_no` | 序号 |
| `cPlanNo` | String | `c_plan_no` | 方案编码 |
| `cPlanCn` | String | `c_plan_cn` | 方案名称 |
| `cSpecialCode` | String | `c_special_code` | 特约代码 |
| `cSpecialName` | String | `c_special_name` | 特约名称 |
| `cSpecialContent` | String | `c_special_content` | 特约内容 |
| `cStatus` | String | `c_status` | 是否修改（1是 0否） |
| `cIfEdit` | String | `c_if_edit` | 是否可编辑（1是 0否） |
| `cIfMust` | String | `c_if_must` | 是否必选（1是 0否） |
| `cIfFix` | String | `c_if_fix` | 是否固定特约（1是 0否） |
| `cSource` | String | `c_source` | 来源（0-关联 1-自定义） |
| `tCrtTm` | LocalDateTime | `t_crt_tm` | 创建时间 |
| `tUpdTm` | LocalDateTime | `t_upd_tm` | 修改时间 |

### 响应示例

```json
{
  "code": 200,
  "data": {
    "code": "1",
    "message": "成功",
    "data": [
      {
        "cPkId": "psa-001",
        "nSeqNo": 1,
        "cPlanNo": "PLAN2026010001",
        "cPlanCn": "企业财产综合保险方案",
        "cSpecialCode": "SPEC001",
        "cSpecialName": "免赔额特约",
        "cSpecialContent": "每次事故绝对免赔额为人民币5000元",
        "cStatus": "0",
        "cIfEdit": "1",
        "cIfMust": "0",
        "cIfFix": "0",
        "cSource": "0",
        "tCrtTm": "2026-07-17T10:30:00",
        "tUpdTm": "2026-07-17T10:30:00"
      }
    ],
    "total": 1,
    "pageNum": 1,
    "pageSize": 10
  }
}
```

---

## 2. 待关联方案特约列表

### 接口信息

| 项目 | 说明 |
|------|------|
| **接口URL** | `/proddef/getUnbindSpecRefPlan` |
| **请求方式** | `POST` |
| **Content-Type** | `application/json` |
| **接口描述** | 分页查询方案待关联的特约列表（从特约基础表排除已关联的） |
| **Controller** | `com.isoftstone.pcis.nvhl.module.prod.controller.ProdDefController#getUnbindSpecRefPlan` |
| **Service** | `com.isoftstone.pcis.nvhl.module.prod.service.ProdDefServiceImpl#getUnbindSpecRefPlan` |
| **Feign** | `com.isoftstone.pcis.nvhl.api.ProductDefinitionService#getUnbindSpecRefPlan` |
| **远端服务** | `nvhl-pcis-prod-definition-impl-ct` → `PlanController#getUnbindSpecRefPlan` |

### 请求参数

| 参数名 | 类型 | 是否必填 | 说明 |
|--------|------|----------|------|
| `CProdNo` | String | 否 | 产品代码 |
| `CPlanNo` | String | **是** | 方案编码（用于排除已关联的特约） |
| `CSpecNo` | String | 否 | 特约代码（模糊查询） |
| `CNmeCn` | String | 否 | 特约名称（模糊查询） |
| `CNmeEn` | String | 否 | 特约英文名称（模糊查询） |
| `CDptCde` | String | 否 | 机构编码 |
| `pageNo` | Integer | 否 | 当前页码，默认 1 |
| `pageSize` | Integer | 否 | 每页显示数量，默认 10 |

### 请求示例

```json
{
  "params": {
    "CPlanNo": "PLAN2026010001",
    "CProdNo": "PROD001",
    "CSpecNo": "",
    "CNmeCn": "",
    "pageNo": 1,
    "pageSize": 10
  }
}
```

### 响应参数

#### data 列表元素字段（WebPrdFixSpecQueryResultDTO）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `cSpecNo` | String | 特约代码 |
| `cRelSpecNo` | String | 关联特约代码 |
| `cSpecrelPkId` | String | 关联主键 |
| `cNmeCn` | String | 特约内容 |
| `cNmeEn` | String | 特约英文名称 |
| `cStatus` | String | 启用状态（1启用 0禁用） |
| `cIfEdit` | String | 是否可修改（1可修改 0不可修改） |
| `cIfMust` | String | 是否必选（1是 0否） |
| `cIfFix` | String | 是否固定特约（1是 0否） |
| `tUpdTm` | Date | 更新日期 |

### 响应示例

```json
{
  "code": 200,
  "data": {
    "code": "1",
    "message": "成功",
    "data": [
      {
        "cSpecNo": "SPEC002",
        "cRelSpecNo": "",
        "cSpecrelPkId": "",
        "cNmeCn": "盗窃风险扩展特约",
        "cNmeEn": "Theft Risk Extension",
        "cStatus": "1",
        "cIfEdit": "1",
        "cIfMust": "0",
        "cIfFix": "0",
        "tUpdTm": "2026-06-15"
      }
    ],
    "total": 1,
    "pageNum": 1,
    "pageSize": 10
  }
}
```

---

## 3. 关联方案特约

### 接口信息

| 项目 | 说明 |
|------|------|
| **接口URL** | `/proddef/associationPlanSpec` |
| **请求方式** | `POST` |
| **Content-Type** | `application/json` |
| **接口描述** | 将一个或多个特约关联到指定方案 |
| **Controller** | `com.isoftstone.pcis.nvhl.module.prod.controller.ProdDefController#associationPlanSpec` |
| **Service** | `com.isoftstone.pcis.nvhl.module.prod.service.ProdDefServiceImpl#associationPlanSpec` |
| **Feign** | `com.isoftstone.pcis.nvhl.api.ProductDefinitionService#associationPlanSpec` |
| **远端服务** | `nvhl-pcis-prod-definition-impl-ct` → `PlanController#associationPlanSpec` |

### 请求参数

| 参数名 | 类型 | 是否必填 | 说明 |
|--------|------|----------|------|
| `CPlanNo` | String | **是** | 方案编码 |
| `userId` | String | 否 | 用户ID（用于记录创建人） |
| `webPlanSpecialAgreementList` | List&lt;Object&gt; | **是** | 特约关联列表 |

#### webPlanSpecialAgreementList 元素字段（WebPlanSpecialAgreement）

| 字段名 | 类型 | 是否必填 | 说明 |
|--------|------|----------|------|
| `cSpecialCode` | String | **是** | 特约代码 |
| `cSpecialName` | String | 否 | 特约名称 |
| `cSpecialContent` | String | 否 | 特约内容 |
| `cIfEdit` | String | 否 | 是否可编辑（1是 0否） |
| `cIfMust` | String | 否 | 是否必选（1是 0否） |
| `cIfFix` | String | 否 | 是否固定特约（1是 0否） |
| `cStatus` | String | 否 | 是否修改（1是 0否） |

### 请求示例

```json
{
  "params": {
    "CPlanNo": "PLAN2026010001",
    "userId": "user001",
    "webPlanSpecialAgreementList": [
      {
        "cSpecialCode": "SPEC002",
        "cSpecialName": "盗窃风险扩展特约",
        "cSpecialContent": "本保险扩展承保盗窃风险",
        "cIfEdit": "1",
        "cIfMust": "0",
        "cIfFix": "0",
        "cStatus": "0"
      }
    ]
  }
}
```

### 响应示例

```json
{
  "code": 200,
  "data": 1
}
```

> `data` 为成功插入的记录数。

---

## 4. 取关方案特约

### 接口信息

| 项目 | 说明 |
|------|------|
| **接口URL** | `/proddef/unAssociationPlanSpec` |
| **请求方式** | `POST` |
| **Content-Type** | `application/json` |
| **接口描述** | 批量取关方案已关联的特约（物理删除关联记录） |
| **Controller** | `com.isoftstone.pcis.nvhl.module.prod.controller.ProdDefController#unAssociationPlanSpec` |
| **Service** | `com.isoftstone.pcis.nvhl.module.prod.service.ProdDefServiceImpl#unAssociationPlanSpec` |
| **Feign** | `com.isoftstone.pcis.nvhl.api.ProductDefinitionService#unAssociationPlanSpec` |
| **远端服务** | `nvhl-pcis-prod-definition-impl-ct` → `PlanController#unAssociationPlanSpec` |

### 请求参数

> 参数通过 `source` 节点传递，值为 JSON 数组字符串。

| 参数名 | 类型 | 是否必填 | 说明 |
|--------|------|----------|------|
| `source` | String | **是** | 要取关的主键ID列表，JSON数组格式 |

### 请求示例

```json
{
  "source": "[\"psa-001\",\"psa-002\"]"
}
```

### 响应示例

```json
{
  "code": 200,
  "data": "成功"
}
```

---

## 5. 修改方案特约状态

### 接口信息

| 项目 | 说明 |
|------|------|
| **接口URL** | `/proddef/editPlanSpecStatus` |
| **请求方式** | `POST` |
| **Content-Type** | `application/json` |
| **接口描述** | 修改方案特约的状态（如是否修改、是否可编辑、是否必选等） |
| **Controller** | `com.isoftstone.pcis.nvhl.module.prod.controller.ProdDefController#editPlanSpecStatus` |
| **Service** | `com.isoftstone.pcis.nvhl.module.prod.service.ProdDefServiceImpl#editPlanSpecStatus` |
| **Feign** | `com.isoftstone.pcis.nvhl.api.ProductDefinitionService#editPlanSpecStatus` |
| **远端服务** | `nvhl-pcis-prod-definition-impl-ct` → `PlanController#editPlanSpecStatus` |

### 请求参数

| 参数名 | 类型 | 是否必填 | 说明 |
|--------|------|----------|------|
| `CPkId` | String | **是** | 方案特约主键ID |
| `CStatus` | String | 否 | 是否修改（1是 0否） |
| `CIfEdit` | String | 否 | 是否可编辑（1是 0否） |
| `CIfMust` | String | 否 | 是否必选（1是 0否） |
| `CIfFix` | String | 否 | 是否固定特约（1是 0否） |

### 请求示例

```json
{
  "params": {
    "CPkId": "psa-001",
    "CStatus": "1",
    "CIfEdit": "1"
  }
}
```

### 响应示例

```json
{
  "code": 200,
  "data": {
    "code": "1",
    "message": "成功"
  }
}
```

---

## 6. 新增并绑定方案特约

### 接口信息

| 项目 | 说明 |
|------|------|
| **接口URL** | `/proddef/saveAssociationPlanSpec` |
| **请求方式** | `POST` |
| **Content-Type** | `application/json` |
| **接口描述** | 新建一条特约并直接绑定到指定方案（一步完成新增+关联） |
| **Controller** | `com.isoftstone.pcis.nvhl.module.prod.controller.ProdDefController#saveAssociationPlanSpec` |
| **Service** | `com.isoftstone.pcis.nvhl.module.prod.service.ProdDefServiceImpl#saveAssociationPlanSpec` |
| **Feign** | `com.isoftstone.pcis.nvhl.api.ProductDefinitionService#saveAssociationPlanSpec` |
| **远端服务** | `nvhl-pcis-prod-definition-impl-ct` → `PlanController#saveAssociationPlanSpec` |

### 请求参数

| 参数名 | 类型 | 是否必填 | 说明 |
|--------|------|----------|------|
| `CProdNo` | String | 否 | 产品代码 |
| `CPlanNo` | String | **是** | 方案编码 |
| `CNmeCn` | String | **是** | 特约内容（不能为空） |
| `CNmeEn` | String | 否 | 特约英文名称 |
| `CStatus` | String | 否 | 启用状态（1启用 0禁用） |

### 请求示例

```json
{
  "params": {
    "CProdNo": "PROD001",
    "CPlanNo": "PLAN2026010001",
    "CNmeCn": "本保险不承保因地震造成的直接损失",
    "CNmeEn": "Earthquake Exclusion",
    "CStatus": "1"
  }
}
```

### 响应示例

```json
{
  "code": 200,
  "data": "成功"
}
```

---

## 7. 自定义方案特约

### 接口信息

| 项目 | 说明 |
|------|------|
| **接口URL** | `/proddef/saveCustomPlanSpec` |
| **请求方式** | `POST` |
| **Content-Type** | `application/json` |
| **接口描述** | 自定义方案特约，不存特约基础表（无特约代码、无特约名称），只有特约内容，直接存入方案特约中间表 `web_plan_special_agreement`，`c_source = 1` 标记为自定义 |
| **Controller** | `com.isoftstone.pcis.nvhl.module.prod.controller.ProdDefController#saveCustomPlanSpec` |
| **Service** | `com.isoftstone.pcis.nvhl.module.prod.service.ProdDefServiceImpl#saveCustomPlanSpec` |
| **Feign** | `com.isoftstone.pcis.nvhl.api.ProductDefinitionService#saveCustomPlanSpec` |
| **远端服务** | `nvhl-pcis-prod-definition-impl-ct` → `PlanController#saveCustomPlanSpec` |

### 业务说明

与「新增并绑定方案特约」（接口6）的区别：

| 对比项 | 接口6 `saveAssociationPlanSpec` | 接口7 `saveCustomPlanSpec` |
|--------|-------------------------------|---------------------------|
| 是否存特约基础表 | ✅ 存 `web_prd_fix_spec` | ❌ 不存 |
| 是否有特约代码 | ✅ 自动生成 | ❌ 无 |
| 是否有特约名称 | ✅ 有 | ❌ 无 |
| 特约内容来源 | 参数 `CNmeCn` | 参数 `CSpecialContent` |
| `c_source` 值 | `0`（关联） | `1`（自定义） |

### 请求参数

| 参数名 | 类型 | 是否必填 | 说明 |
|--------|------|----------|------|
| `CPlanNo` | String | **是** | 方案编码 |
| `CPlanCn` | String | 否 | 方案名称 |
| `CSpecialContent` | String | **是** | 特约内容 |
| `CIfEdit` | String | 否 | 是否可编辑（1是 0否），默认 `0` |
| `CIfMust` | String | 否 | 是否必选（1是 0否），默认 `0` |
| `CIfFix` | String | 否 | 是否固定特约（1是 0否），默认 `0` |
| `userId` | String | 否 | 用户ID（用于记录创建人，为空时取当前登录用户） |

### 请求示例

```json
{
  "params": {
    "CPlanNo": "PLAN2026010001",
    "CPlanCn": "企业财产综合保险方案",
    "CSpecialContent": "本保单特别约定：被保险人发生保险事故后，需在48小时内通知保险人，否则保险人有权拒赔。",
    "CIfEdit": "1",
    "CIfMust": "1",
    "CIfFix": "0",
    "userId": "user001"
  }
}
```

### 响应参数

#### data 结构（ResponseDTO&lt;String&gt;）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `code` | String | 业务状态码，`"1"` 成功 |
| `message` | String | 提示信息 |
| `data` | String | 成功时返回 `null` |

### 响应示例

#### 成功响应

```json
{
  "code": 200,
  "data": {
    "code": "1",
    "message": "自定义方案特约保存成功",
    "data": null
  }
}
```

#### 失败响应（方案编码为空）

```json
{
  "code": 500,
  "data": {
    "code": "0",
    "message": "方案编码不能为空",
    "data": null
  }
}
```

#### 失败响应（特约内容为空）

```json
{
  "code": 500,
  "data": {
    "code": "0",
    "message": "特约内容不能为空",
    "data": null
  }
}
```

### 数据库写入结果

调用成功后，`web_plan_special_agreement` 表新增一条记录：

| 字段名 | 写入值 |
|--------|--------|
| `c_pk_id` | UUID（去横线） |
| `c_plan_no` | 请求参数 `CPlanNo` |
| `c_plan_cn` | 请求参数 `CPlanCn` |
| `c_special_code` | `NULL`（自定义无特约代码） |
| `c_special_name` | `NULL`（自定义无特约名称） |
| `c_special_content` | 请求参数 `CSpecialContent` |
| `c_if_edit` | 请求参数 `CIfEdit`，默认 `0` |
| `c_if_must` | 请求参数 `CIfMust`，默认 `0` |
| `c_if_fix` | 请求参数 `CIfFix`，默认 `0` |
| `c_source` | `1`（自定义） |
| `c_crt_cde` | 请求参数 `userId` 或当前登录用户 |
| `t_crt_tm` | 当前时间 |
| `c_upd_cde` | 同 `c_crt_cde` |
| `t_upd_tm` | 当前时间 |

---

## 调用链路

```
前端请求
  └── ProdDefController (@RequestMapping "proddef")
        └── ProdDefServiceImpl
              └── ProductDefinitionService (Feign 远程调用)
                    └── nvhl-pcis-prod-definition-impl-ct 服务
                          └── PlanController
                                └── PlanService / PlanServiceImpl
                                      └── WebPlanSpecialAgreementMapper (MyBatis-Plus)
                                            └── web_plan_special_agreement 表
```

---

## 相关数据表

### web_plan_special_agreement（方案特约表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `c_pk_id` | VARCHAR | 主键 |
| `n_seq_no` | INT | 序号 |
| `c_plan_no` | VARCHAR | 方案编码 |
| `c_plan_cn` | VARCHAR | 方案名称 |
| `c_plan_en` | VARCHAR | 方案英文名称 |
| `c_special_code` | VARCHAR | 特约代码 |
| `c_special_name` | VARCHAR | 特约名称 |
| `c_special_content` | VARCHAR | 特约内容 |
| `c_status` | VARCHAR | 是否修改（1是 0否） |
| `c_crt_cde` | VARCHAR | 创建人 |
| `t_crt_tm` | DATETIME | 创建时间 |
| `c_upd_cde` | VARCHAR | 修改人 |
| `t_upd_tm` | DATETIME | 修改时间 |
| `c_if_edit` | VARCHAR | 是否可编辑（1是 0否） |
| `c_if_must` | VARCHAR | 是否必选（1是 0否） |
| `c_if_fix` | VARCHAR | 是否固定特约（1是 0否） |
| `c_source` | CHAR(1) | 来源（0-关联 1-自定义），默认 `0` |
| `c_yuliu_1` ~ `c_yuliu_8` | VARCHAR | 预留字段（String） |
| `n_yuliu_1` ~ `n_yuliu_5` | DECIMAL | 预留字段（DECIMAL） |
| `t_yuliu_1` ~ `t_yuliu_3` | DATETIME | 预留字段（Datetime） |
| `c_language_code` | VARCHAR | 语言代码（zh-CN / en-US） |

---

## 相关实体类与 DTO

| 类名 | 包路径 | 说明 |
|------|--------|------|
| `WebPlanSpecialAgreement` | `com.isoftstone.pcis.policy.entity` | 方案特约实体类（对应 `web_plan_special_agreement` 表） |
| `WebPlanSpecialAgreementMapper` | `com.isoftstone.pcis.policy.mapper` | MyBatis-Plus Mapper 接口 |
| `WebPlanSpecRelPageQueryParamDTO` | `com.isoftstone.pcis.dto` | 已关联特约列表查询参数 |
| `WebPlanSpecRelPageQueryResultDTO` | `com.isoftstone.pcis.dto` | 已关联特约列表返回结果 |
| `WebPlanSpecRelPageSaveParamDTO` | `com.isoftstone.pcis.dto` | 关联特约保存参数 |
| `WebPrdFixSpecQueryParamDTO` | `com.isoftstone.pcis.dto` | 待关联特约查询参数 |
| `WebPrdFixSpecQueryResultDTO` | `com.isoftstone.pcis.dto` | 待关联特约返回结果 |
| `WebPrdFixSpecAssociationSaveParamDTO` | `com.isoftstone.pcis.dto` | 新增并绑定特约参数 |
| `WebPlanCustomSpecSaveParamDTO` | `com.isoftstone.pcis.dto` | 自定义方案特约保存参数 |

---

## 备注

- 所有接口通过 Feign 远程调用 `nvhl-pcis-prod-definition-impl-ct` 微服务。
- `BasePageDTO.code` 为 `"1"` 时表示业务成功，Controller 层据此判断并组装 `R` 响应对象。
- 方案特约与产品特约（`associationSpec`）模式完全一致，区别在于产品特约关联产品（`CProdNo`），方案特约关联方案（`CPlanNo`）。
- 取关接口的参数通过 `source` 节点传递 JSON 字符串，与其他接口的 `params` 节点不同，需注意前端适配。
- `c_source` 字段用于区分特约来源：`0` = 从特约基础表关联（接口3/接口6），`1` = 自定义特约（接口7）。
- 自定义特约（接口7）不写入特约基础表 `web_prd_fix_spec`，`c_special_code` 和 `c_special_name` 为 `NULL`。
- 已关联方案特约列表（接口1）的返回结果中新增 `cSource` 字段，前端可据此区分关联特约与自定义特约。

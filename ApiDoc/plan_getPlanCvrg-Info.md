# plan/getPlanCvrg 获取方案关联险别信息

## 接口说明

根据方案号获取方案关联的险别（条款）信息列表，返回的数据经过 `ViewComponentHelper.convertVOToViewDataPlanCvrg` 转换，按前台组件格式组装后返回。

## 接口信息

| 项目 | 说明 |
|------|------|
| **接口URL** | `/plan/getPlanCvrg` |
| **请求方式** | `POST` |
| **Content-Type** | `application/json` |
| **接口描述** | 根据方案号（CPlanNo）获取方案关联险别信息，返回险别条款列表，每个条款包含条款编码、条款名称、保费、保额、费率、赔偿限额等字段，以及关联的条责标信息（riskList） |
| **Controller** | `com.isoftstone.pcis.nvhl.module.app.controller.PlanController#getPlanCvrg` |
| **Service** | `com.isoftstone.pcis.nvhl.api.PlanService#getPlanCvrg`（Feign 远程调用，服务名：`nvhl-pcis-prod-definition-impl-ct`） |

---

## 请求参数

请求体为 `R` 对象（继承自 `JSONObject`），参数通过 `params` 或 `source` 节点传递。

| 参数名 | 类型 | 是否必填 | 说明 |
|--------|------|----------|------|
| `CPlanNo` | String | **是** | 方案号，方案唯一标识 |
| `pageNo` | Integer | 否 | 当前页码 |
| `pageSize` | Integer | 否 | 每页显示数量 |

### 请求示例

```json
{
  "params": {
    "CPlanNo": "PLAN2026010001"
  }
}
```

---

## 响应参数

### 外层响应结构（R 对象）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `code` | Integer | 状态码，`200` 表示成功，`500` 表示失败 |
| `msg` | String | 失败时返回错误提示信息（仅失败时存在） |
| `data` | Object | 成功时返回转换后的险别信息（仅成功时存在） |

### BasePageDTO 结构（Service 层返回）

> Controller 层在获取到 `BasePageDTO` 后，判断 `code` 是否为 `"1"`，若成功则调用 `ViewComponentHelper.convertVOToViewDataPlanCvrg()` 对 `data` 列表进行格式转换。

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `code` | String | 业务状态码，`"1"` 表示成功，`"0"` 表示异常 |
| `message` | String | 提示信息 |
| `result` | List&lt;Map&lt;String, Object&gt;&gt; | 险别信息列表 |
| `data` | List&lt;Map&lt;String, Object&gt;&gt; | 险别信息列表（与 result 内容一致） |
| `total` | Integer | 总记录数 |
| `pageNum` | Integer | 当前页码 |
| `pageSize` | Integer | 每页显示数量 |

### data 字段结构（转换后的响应数据）

> 经过 `ViewComponentHelper.convertVOToViewDataPlanCvrg` 转换后，返回 `Map<String, List<Map<String, Object>>>` 结构，key 固定为 `"cvrg"`。

```json
{
  "cvrg": [
    {
      "Term.cPkId": "...",
      "Term.cClauseCode": "...",
      "Term.cClauseName": "...",
      "Term.riskList": [
        {
          "TermRisktgt.cPkId": "...",
          "TermRisktgt.cLiabCode": "...",
          ...
        }
      ]
    }
  ]
}
```

#### cvrg 列表元素字段

> 对应数据库表 `web_plan_base` 关联的 `web_plan_term` 表，实体类 `com.isoftstone.pcis.policy.entity.WebPlanTerm`。所有字段名以 `Term.` 为前缀。

| 字段名 | 类型 | 数据库字段 | 说明 |
|--------|------|------------|------|
| `Term.cPkId` | String | `c_pk_id` | 主键 |
| `Term.cPlanConfigNo` | String | `c_plan_config_no` | 方案配置号 |
| `Term.cClauseCode` | String | `c_clause_code` | 条款编码 |
| `Term.cClauseName` | String | `c_clause_name` | 条款名称 |
| `Term.cClauseCategory` | String | `c_clause_category` | 条款类别 |
| `Term.cPlanNo` | String | `c_plan_no` | 方案号 |
| `Term.nInsuredCount` | Integer | `n_insured_count` | 投保人数 |
| `Term.nAddressCount` | Integer | `n_address_count` | 关联地址数量 |
| `Term.nPileCount` | Integer | `n_pile_count` | 关联充电桩数量 |
| `Term.nPilePremium` | Double | `n_pile_premium` | 每桩保险费 |
| `Term.nAddressPremium` | Double | `n_address_premium` | 单位地址保费（元） |
| `Term.nTotalPremium` | Double | `n_total_premium` | 总保费（元） |
| `Term.nAccidentLimit` | Double | `n_accident_limit` | 每次事故赔偿限额 |
| `Term.nInsuranceFee` | Double | `n_insurance_fee` | 保险费 |
| `Term.nPremiumNet` | Double | `n_premium_net` | 不含税保费 |
| `Term.nVatAmount` | Double | `n_vat_amount` | 增值税 |
| `Term.nDeductibleAmount` | Double | `n_deductible_amount` | 免赔额 |
| `Term.nDeductibleRate` | Double | `n_deductible_rate` | 免赔率 |
| `Term.cDeductibleNote` | String | `c_deductible_note` | 免赔说明 |
| `Term.cRemarkInfo` | String | `c_remark_info` | 备注 |
| `Term.nPropertyLimit` | Double | `n_property_limit` | 每次事故财产损失赔偿限额 |
| `Term.nInjuryLimit` | Double | `n_injury_limit` | 每次事故人身伤亡赔偿限额 |
| `Term.nPersonLimit` | Double | `n_person_limit` | 每人赔偿限额 |
| `Term.nMedicalLimit` | Double | `n_medical_limit` | 每人医疗费用赔偿限额 |
| `Term.nInsuranceAmount` | Double | `n_insurance_amount` | 保险金额/累计赔偿限额 |
| `Term.nAdjustFactor` | Double | `n_adjust_factor` | 调整系数（%） |
| `Term.cRateMethod` | String | `c_rate_method` | 费率计算方式 |
| `Term.nRateVal` | Double | `n_rate_val` | 费率（值） |
| `Term.cRateUnit` | String | `c_rate_unit` | 费率单位 |
| `Term.nCalcPrm` | Double | `n_calc_prm` | 折后保费（计算保费） |
| `Term.nBefPrm` | Double | `n_bef_prm` | 折前保费 |
| `Term.nBasePrm` | Double | `n_base_prm` | 基准保险费 |
| `Term.cRdrTyp` | String | `c_rdr_typ` | 主附险标识（`0` 主险，`1` 附加险，`2` 扩展责任） |
| `Term.cIsCommon` | String | `c_is_common` | 是否公共条款条责 |
| `Term.nSeqNo` | Integer | `n_seq_no` | 序号 |
| `Term.cUniqueTermNo` | String | `c_unique_term_no` | 条款唯一编码 |
| `Term.cWebsite` | String | `c_website` | 条款链接 |

> 以上仅列出常用字段，`WebPlanTerm` 实体包含 200+ 个字段（含各类赔偿限额、保费、费率等），完整字段定义请参考 [web_plan_trem-Info.md](./web_plan_trem-Info.md)。

#### riskList 列表元素字段（Term.riskList）

> 对应数据库表 `web_plan_term_risktgt`，实体类 `com.isoftstone.pcis.policy.entity.WebPlanTermRisktgt`。所有字段名以 `TermRisktgt.` 为前缀。由 `WebPlanTerm.webPlanTermRisktgtList` 字段转换而来。

| 字段名 | 类型 | 数据库字段 | 说明 |
|--------|------|------------|------|
| `TermRisktgt.cPkId` | String | `c_pk_id` | 主键 |
| `TermRisktgt.cPlanConfigNo` | String | `c_plan_config_no` | 方案配置号 |
| `TermRisktgt.cClauseCode` | String | `c_clause_code` | 条款编码 |
| `TermRisktgt.cClauseName` | String | `c_clause_name` | 条款名称 |
| `TermRisktgt.cClauseCategory` | String | `c_clause_category` | 条款类别 |
| `TermRisktgt.cLiabCode` | String | `c_liab_code` | 责任编码 |
| `TermRisktgt.cLiabName` | String | `c_liab_name` | 责任名称 |
| `TermRisktgt.nAccidentLimit` | Double | `n_accident_limit` | 每次事故赔偿限额 |
| `TermRisktgt.nInsuranceFee` | Double | `n_insurance_fee` | 保险费 |
| `TermRisktgt.nPremiumNet` | Double | `n_premium_net` | 不含税保费 |
| `TermRisktgt.nVatAmount` | Double | `n_vat_amount` | 增值税 |

> 以上仅列出常用字段，`WebPlanTermRisktgt` 实体同样包含大量字段，完整定义请参考实体类源码。

---

## 响应示例

### 成功响应

```json
{
  "code": 200,
  "data": {
    "cvrg": [
      {
        "Term.cPkId": "term-001",
        "Term.cPlanConfigNo": "CONFIG001",
        "Term.cClauseCode": "CLAUSE001",
        "Term.cClauseName": "企业财产损失保险",
        "Term.cClauseCategory": "01",
        "Term.cPlanNo": "PLAN2026010001",
        "Term.nInsuredCount": 100,
        "Term.nTotalPremium": 50000.00,
        "Term.nAccidentLimit": 10000000.00,
        "Term.nInsuranceFee": 50000.00,
        "Term.nPremiumNet": 47169.81,
        "Term.nVatAmount": 2830.19,
        "Term.nInsuranceAmount": 50000000.00,
        "Term.nRateVal": 0.001,
        "Term.cRateUnit": "1",
        "Term.nCalcPrm": 50000.00,
        "Term.nBefPrm": 50000.00,
        "Term.cRdrTyp": "0",
        "Term.nSeqNo": 1,
        "Term.cUniqueTermNo": "UNIQUE001",
        "Term.riskList": [
          {
            "TermRisktgt.cPkId": "risktgt-001",
            "TermRisktgt.cClauseCode": "CLAUSE001",
            "TermRisktgt.cLiabCode": "LIAB001",
            "TermRisktgt.cLiabName": "火灾爆炸责任",
            "TermRisktgt.nAccidentLimit": 10000000.00,
            "TermRisktgt.nInsuranceFee": 30000.00,
            "TermRisktgt.nPremiumNet": 28301.89,
            "TermRisktgt.nVatAmount": 1698.11
          },
          {
            "TermRisktgt.cPkId": "risktgt-002",
            "TermRisktgt.cClauseCode": "CLAUSE001",
            "TermRisktgt.cLiabCode": "LIAB002",
            "TermRisktgt.cLiabName": "自然灾害责任",
            "TermRisktgt.nAccidentLimit": 8000000.00,
            "TermRisktgt.nInsuranceFee": 20000.00,
            "TermRisktgt.nPremiumNet": 18867.92,
            "TermRisktgt.nVatAmount": 1132.08
          }
        ]
      },
      {
        "Term.cPkId": "term-002",
        "Term.cClauseCode": "CLAUSE002",
        "Term.cClauseName": "公众责任保险",
        "Term.cClauseCategory": "02",
        "Term.cPlanNo": "PLAN2026010001",
        "Term.nTotalPremium": 20000.00,
        "Term.nAccidentLimit": 5000000.00,
        "Term.nInsuranceAmount": 10000000.00,
        "Term.cRdrTyp": "1",
        "Term.nSeqNo": 2,
        "Term.riskList": []
      }
    ]
  }
}
```

### 失败响应

```json
{
  "code": 500,
  "msg": "获取方案关联险别信息失败"
}
```

---

## 状态码说明

| 状态码 | 说明 |
|--------|------|
| `200` | 接口调用成功 |
| `500` | 接口调用失败 |

### BasePageDTO 业务状态码

| code | 说明 |
|------|------|
| `"1"` | 业务处理成功（FLAG_TRUE） |
| `"0"` | 业务处理异常 |

---

## 数据转换逻辑

Controller 层获取到 Service 返回的 `BasePageDTO<Map<String,Object>>` 后，通过 `ViewComponentHelper.convertVOToViewDataPlanCvrg()` 方法进行格式转换：

1. 遍历险别列表（terms），将每条记录的字段名添加 `Term.` 前缀。
2. 如果字段名为 `webPlanTermRisktgtList`（条责标信息列表），则转换为 `Term.riskList`：
   - 遍历条责标列表，将每个条责标字段名添加 `TermRisktgt.` 前缀。
3. 最终将转换后的列表放入 `Map` 中，key 为 `"cvrg"`。

```java
// Controller 中的转换逻辑
Map<String,List<Map<String,Object>>> cvrg = ViewComponentHelper.convertVOToViewDataPlanCvrg(
    (List<Map<String,Object>>)data.getData()
);
r.put("data", cvrg);
```

```java
// ViewComponentHelper.convertVOToViewDataPlanCvrg 核心转换逻辑
public static Map<String,List<Map<String,Object>>> convertVOToViewDataPlanCvrg(List<Map<String,Object>> terms) {
    Map<String,List<Map<String,Object>>> result = new HashMap<>();
    List<Map<String,Object>> componentList = new ArrayList<>();
    for (Map<String,Object> value : terms) {
        Map<String,Object> map = new HashMap<>();
        JSONObject json = (JSONObject) JSONObject.toJSON(value);
        for (Entry<String, Object> e : json.entrySet()) {
            if ("webPlanTermRisktgtList".equals(e.getKey())) {
                // 条责标列表转换：webPlanTermRisktgtList -> Term.riskList
                JSONArray riskList = (JSONArray) e.getValue();
                JSONArray riskListNew = new JSONArray();
                for (int i = 0; i < riskList.size(); i++) {
                    JSONObject risk = riskList.getJSONObject(i);
                    JSONObject riskNew = new JSONObject();
                    for (Entry<String,Object> riskEntry : risk.entrySet()) {
                        riskNew.put("TermRisktgt." + riskEntry.getKey(), riskEntry.getValue());
                    }
                    riskListNew.add(riskNew);
                }
                map.put("Term.riskList", riskListNew);
            } else {
                // 普通字段转换：fieldName -> Term.fieldName
                map.put("Term." + e.getKey(), e.getValue());
            }
        }
        componentList.add(map);
    }
    result.put("cvrg", componentList);
    return result;
}
```

---

## 相关实体类

### WebPlanTerm（方案条款信息表）

```java
package com.isoftstone.pcis.policy.entity;

@TableName("web_plan_term")
@ApiModel(value = "WebPlanTerm对象", description = "方案条款信息表")
public class WebPlanTerm implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty("主键")
    @TableId("c_pk_id")
    private String cPkId;

    @ApiModelProperty("方案配置号")
    @TableField("c_plan_config_no")
    private String cPlanConfigNo;

    @ApiModelProperty("条款编码")
    @TableField("c_clause_code")
    private String cClauseCode;

    @ApiModelProperty("条款名称")
    @TableField("c_clause_name")
    private String cClauseName;

    @ApiModelProperty("条款类别")
    @TableField("c_clause_category")
    private String cClauseCategory;

    @ApiModelProperty("方案号(条款、条责标内部使用)")
    @TableField("c_plan_no")
    private String cPlanNo;

    @ApiModelProperty("投保人数")
    @TableField("n_insured_count")
    private Integer nInsuredCount;

    @ApiModelProperty("总保费（元）")
    @TableField("n_total_premium")
    private Double nTotalPremium;

    @ApiModelProperty("每次事故赔偿限额")
    @TableField("n_accident_limit")
    private Double nAccidentLimit;

    @ApiModelProperty("保险费")
    @TableField("n_insurance_fee")
    private Double nInsuranceFee;

    @ApiModelProperty("不含税保费")
    @TableField("n_premium_net")
    private Double nPremiumNet;

    @ApiModelProperty("增值税")
    @TableField("n_vat_amount")
    private Double nVatAmount;

    @ApiModelProperty("保险金额/累计赔偿限额")
    @TableField("n_insurance_amount")
    private Double nInsuranceAmount;

    @ApiModelProperty("费率（值）")
    @TableField("n_rate_val")
    private Double nRateVal;

    @ApiModelProperty("折后保费,计算保费")
    @TableField("n_calc_prm")
    private Double nCalcPrm;

    @ApiModelProperty("折前保费")
    @TableField("n_bef_prm")
    private Double nBefPrm;

    @ApiModelProperty("主附险标识 0-主险 1-附加险 2-扩展责任")
    @TableField("c_rdr_typ")
    private String cRdrTyp;

    @ApiModelProperty("序号")
    @TableField("n_seq_no")
    private Integer nSeqNo;

    @ApiModelProperty("条款唯一编码")
    @TableField("c_unique_term_no")
    private String cUniqueTermNo;

    @ApiModelProperty("条款链接")
    @TableField("c_website")
    private String cWebsite;

    @Schema(description = "方案条责标信息List")
    @TableField(exist = false)
    private List<WebPlanTermRisktgt> webPlanTermRisktgtList;

    // WebPlanTerm 实体包含 200+ 个字段（含各类赔偿限额、保费、费率等）
    // 完整字段定义请参考 web_plan_trem-Info.md

    // getter / setter 省略
}
```

### WebPlanTermRisktgt（方案条责标信息表）

```java
package com.isoftstone.pcis.policy.entity;

@TableName("web_plan_term_risktgt")
@ApiModel(value = "WebPlanTermRisktgt对象", description = "方案条责标信息表")
public class WebPlanTermRisktgt implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty("主键")
    @TableId("c_pk_id")
    private String cPkId;

    @ApiModelProperty("方案配置号")
    @TableField("c_plan_config_no")
    private String cPlanConfigNo;

    @ApiModelProperty("条款编码")
    @TableField("c_clause_code")
    private String cClauseCode;

    @ApiModelProperty("条款名称")
    @TableField("c_clause_name")
    private String cClauseName;

    @ApiModelProperty("条款类别")
    @TableField("c_clause_category")
    private String cClauseCategory;

    @ApiModelProperty("责任编码")
    @TableField("c_liab_code")
    private String cLiabCode;

    @TableField("c_liab_name")
    private String cLiabName;

    @ApiModelProperty("每次事故赔偿限额")
    @TableField("n_accident_limit")
    private Double nAccidentLimit;

    @ApiModelProperty("保险费")
    @TableField("n_insurance_fee")
    private Double nInsuranceFee;

    @ApiModelProperty("不含税保费")
    @TableField("n_premium_net")
    private Double nPremiumNet;

    @ApiModelProperty("增值税")
    @TableField("n_vat_amount")
    private Double nVatAmount;

    // 完整字段定义请参考实体类源码

    // getter / setter 省略
}
```

---

## 调用链路

```
前端请求
  └── PlanController#getPlanCvrg (@RequestBody R p)
        └── planService.getPlanCvrg(p.getParams())  [Feign 远程调用]
              └── nvhl-pcis-prod-definition-impl-ct 服务
                    └── 查询 web_plan_term 表（关联 web_plan_term_risktgt）
                          └── 返回 BasePageDTO<Map<String,Object>>
                                └── Controller 判断 code == "1"
                                      └── ViewComponentHelper.convertVOToViewDataPlanCvrg(data.getData())
                                            └── 字段名添加 "Term." / "TermRisktgt." 前缀
                                                  └── 返回 Map<String, List<Map<String,Object>>> (key="cvrg")
```

## 备注

- 该接口通过 Feign 远程调用 `nvhl-pcis-prod-definition-impl-ct` 微服务获取数据。
- `BasePageDTO.code` 为 `"1"` 时表示业务成功，Controller 层据此判断并组装 `R` 响应对象。
- 返回数据经过 `ViewComponentHelper.convertVOToViewDataPlanCvrg()` 转换，所有险别字段以 `Term.` 为前缀，条责标字段以 `TermRisktgt.` 为前缀。
- `WebPlanTerm` 实体包含 200+ 个字段，完整字段定义请参考 [web_plan_trem-Info.md](./web_plan_trem-Info.md)。
- 该接口需要配合 `plan/getPlanBase` 接口使用，`getPlanBase` 获取方案基本信息，`getPlanCvrg` 获取方案关联的险别条款信息。

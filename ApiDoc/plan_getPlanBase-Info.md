# plan/getPlanBase 获取方案详情

## 接口说明

根据方案号获取方案基本信息详情，返回方案基础表的完整数据。

## 接口信息

| 项目 | 说明 |
|------|------|
| **接口URL** | `/plan/getPlanBase` |
| **请求方式** | `POST` |
| **Content-Type** | `application/json` |
| **接口描述** | 根据方案号（CPlanNo）获取方案基本信息，包括方案名称、产品代码、审核状态、启用状态、特约信息、保险期间配置等 |
| **Controller** | `com.isoftstone.pcis.nvhl.module.app.controller.PlanController#getPlanBase` |
| **Service** | `com.isoftstone.pcis.nvhl.api.PlanService#getPlanBase`（Feign 远程调用，服务名：`nvhl-pcis-prod-definition-impl-ct`） |

---

## 请求参数

请求体为 `R` 对象（继承自 `JSONObject`），参数通过 `params` 或 `source` 节点传递。

| 参数名 | 类型 | 是否必填 | 说明 |
|--------|------|----------|------|
| `CPlanNo` | String | **是** | 方案号，方案唯一标识 |

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
| `data` | Object | 成功时返回 `ResponseDTO` 对象（仅成功时存在） |

### ResponseDTO 结构（data 字段内容）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `code` | String | 业务状态码，`"1"` 表示成功，`"0"` 表示异常 |
| `message` | String | 提示信息 |
| `detail` | String | 详细操作信息 |
| `cDptCde` | String | 操作机构 |
| `cOperId` | String | 操作人 |
| `data` | Object | 方案基本信息（Map 结构，字段详见下表） |

### 方案基本信息字段（ResponseDTO.data）

> 对应数据库表 `web_plan_base`，实体类 `com.isoftstone.pcis.policy.entity.WebPlanBase`

| 字段名 | 类型 | 数据库字段 | 说明 |
|--------|------|------------|------|
| `cPlanNo` | String | `c_plan_no` | 方案代码（主键） |
| `cPlanCn` | String | `c_plan_cn` | 方案名称 |
| `cPlanEn` | String | `c_plan_en` | 方案英文名称 |
| `tUpdTm` | Date | `t_upd_tm` | 修改时间 |
| `cUpdCde` | String | `c_upd_cde` | 修改人 |
| `cCrtCde` | String | `c_crt_cde` | 创建人 |
| `tCrtTm` | Date | `t_crt_tm` | 创建时间 |
| `cTyp` | String | `c_typ` | 是否固定方案（`1` 固定方案，`2` 自选方案） |
| `cUndrStatus` | String | `c_undr_status` | 审核状态（`0` 暂存，`1` 待审核，`2` 已审核） |
| `cEnableStatus` | String | `c_enable_status` | 启用状态（`0` 禁用，`1` 启用） |
| `cAccessType` | String | `c_access_type` | 访问类型（`0` 保密，`1` 公开） |
| `cDptCde` | String | `c_dpt_cde` | 机构代码 |
| `cKindNo` | String | `c_kind_no` | 险种大类代码 |
| `cProdNo` | String | `c_prod_no` | 产品代码 |
| `tBgnTm` | Date | `t_bgn_tm` | 启用日期 |
| `tEndTm` | Date | `t_end_tm` | 失效日期 |
| `cSpecMrk` | String | `c_spec_mrk` | 是否有特约 |
| `cCalcFormula` | String | `c_calc_formula` | 计算保费公式 |
| `cSpecNo` | String | `c_spec_no` | 特约编号 |
| `cSpecContent` | String | `c_spec_content` | 特约内容 |
| `cRemark` | String | `c_remark` | 备注 |
| `cOrigin` | String | `c_origin` | 方案来源（`core` 核心，`channel` 渠道） |
| `cOldPlanNo` | String | `c_old_plan_no` | 历史方案号 |
| `cRationType` | String | `c_ration_type` | 方案类型 |
| `cCiMrk` | String | `c_ci_mrk` | 联共保业务标识（`0` 非共保业务，`1` 外部共保我方主共_主联，`2` 外部共保我方从共_主联，`3` 外部共保我方主共_无联保，`4` 外部共保我方从共_无联保，`5` 司内联保_主联） |
| `cCriterionTimeUnit` | String | `c_criterion_time_unit` | 保险期间类型 |
| `nCriterionTime` | Double | `n_criterion_time` | 标准承保期限 |
| `nLowInsureDays` | Double | `n_low_insure_days` | 保险期限浮动区间起 |
| `nTopInsureDays` | Double | `n_top_insure_days` | 保险期限浮动区间止 |
| `cShowDpt` | String | `c_show_dpt` | 按分公司展示，多个分公司使用英文逗号分隔 |
| `cIsSinosure` | String | `c_is_sinosure` | 是否调用中保信智能风控（`1` 是，`0` 否） |
| `cResvTxt1` | String | `c_resv_txt_1` | 是否绿色产业客户 |
| `cResvTxt2` | String | `c_resv_txt_2` | 绿色产业细分列表 |
| `cResvTxt3` | String | `c_resv_txt_3` | 预留文本字段3 |
| `cHeadPeriod` | String | `c_head_period` | 头周期 |
| `cTmLoanTrm` | String | `c_tm_loan_trm` | 借款期限 |
| `cIsUseTerm` | String | `c_is_use_term` | 是否使用方案配置条款（`1` 使用方案配置，`2` 使用外部传输） |

---

## 响应示例

### 成功响应

```json
{
  "code": 200,
  "data": {
    "code": "1",
    "message": "成功",
    "detail": null,
    "cDptCde": "DPT001",
    "cOperId": "USER001",
    "data": {
      "cPlanNo": "PLAN2026010001",
      "cPlanCn": "企业财产综合保险方案",
      "cPlanEn": "EnterprisePropertyInsurancePlan",
      "tUpdTm": "2026-06-15 10:30:00",
      "cUpdCde": "USER001",
      "cCrtCde": "USER001",
      "tCrtTm": "2026-01-10 09:00:00",
      "cTyp": "1",
      "cUndrStatus": "2",
      "cEnableStatus": "1",
      "cAccessType": "1",
      "cDptCde": "DPT001",
      "cKindNo": "P01",
      "cProdNo": "PROD20260001",
      "tBgnTm": "2026-01-01 00:00:00",
      "tEndTm": "2026-12-31 23:59:59",
      "cSpecMrk": "1",
      "cCalcFormula": "PREMIUM=SUM_INSURED*RATE",
      "cSpecNo": "SPEC001",
      "cSpecContent": "特别约定内容...",
      "cRemark": "备注信息",
      "cOrigin": "core",
      "cOldPlanNo": "",
      "cRationType": "01",
      "cCiMrk": "0",
      "cCriterionTimeUnit": "Y",
      "nCriterionTime": 1.0,
      "nLowInsureDays": 365.0,
      "nTopInsureDays": 365.0,
      "cShowDpt": "DPT001,DPT002",
      "cIsSinosure": "0",
      "cResvTxt1": "",
      "cResvTxt2": "",
      "cResvTxt3": "",
      "cHeadPeriod": "",
      "cTmLoanTrm": "",
      "cIsUseTerm": "1"
    }
  }
}
```

### 失败响应

```json
{
  "code": 500,
  "msg": "未找到对应的方案信息"
}
```

---

## 状态码说明

| 状态码 | 说明 |
|--------|------|
| `200` | 接口调用成功 |
| `500` | 接口调用失败 |

### ResponseDTO 业务状态码

| code | 说明 |
|------|------|
| `"1"` | 业务处理成功（FLAG_TRUE） |
| `"0"` | 业务处理异常 |

---

## 相关实体类

```java
package com.isoftstone.pcis.policy.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import java.io.Serializable;
import java.util.Date;

/**
 * <p>
 * 方案基本信息
 * </p>
 *
 * @author baomidou
 * @since 2025-05-17
 */
@TableName("web_plan_base")
@Schema(name = "WebPlanBase")
public class WebPlanBase implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "方案代码")
    @TableId("c_plan_no")
    private String cPlanNo;

    @Schema(description = "方案名称")
    @TableField("c_plan_cn")
    private String cPlanCn;

    @Schema(description = "方案英文名称")
    @TableField("c_plan_en")
    private String cPlanEn;

    @Schema(description = "修改时间")
    @TableField("t_upd_tm")
    private Date tUpdTm;

    @Schema(description = "修改人")
    @TableField("c_upd_cde")
    private String cUpdCde;

    @Schema(description = "创建人")
    @TableField("c_crt_cde")
    private String cCrtCde;

    @Schema(description = "创建时间")
    @TableField("t_crt_tm")
    private Date tCrtTm;

    @Schema(description = "是否固定方案1 固定方案, 2 自选方案)")
    @TableField("c_typ")
    private String cTyp;

    @Schema(description = "审核状态(0 暂存, 1待审核, 2 已审核)")
    @TableField("c_undr_status")
    private String cUndrStatus;

    @Schema(description = "启用状态(0 禁用, 1 启用)")
    @TableField("c_enable_status")
    private String cEnableStatus;

    @Schema(description = "访问类型(0 保密. 1 公开)")
    @TableField("c_access_type")
    private String cAccessType;

    @Schema(description = "机构代码")
    @TableField("c_dpt_cde")
    private String cDptCde;

    @Schema(description = "险种大类代码")
    @TableField("c_kind_no")
    private String cKindNo;

    @Schema(description = "险种名称")
    @TableField("c_prod_no")
    private String cProdNo;

    @Schema(description = "启用日期")
    @TableField("t_bgn_tm")
    private Date tBgnTm;

    @Schema(description = "失效日期")
    @TableField("t_end_tm")
    private Date tEndTm;

    @Schema(description = "是否有特约")
    @TableField("c_spec_mrk")
    private String cSpecMrk;

    @Schema(description = "计算保费公式")
    @TableField("c_calc_formula")
    private String cCalcFormula;

    @Schema(description = "特约编号")
    @TableField("c_spec_no")
    private String cSpecNo;

    @TableField("c_spec_content")
    private String cSpecContent;

    @Schema(description = "备注")
    @TableField("c_remark")
    private String cRemark;

    @Schema(description = "方案来源 核心core,渠道channel")
    @TableField("c_origin")
    private String cOrigin;

    @Schema(description = "历史方案号")
    @TableField("c_old_plan_no")
    private String cOldPlanNo;

    @Schema(description = "方案类型")
    @TableField("c_ration_type")
    private String cRationType;

    @Schema(description = "联共保业务0 :非共保业务 1 :外部共保我方主共_主联 2 :外部共保我方从共_主联 3 :外部共保我方主共_无联保 4 :外部共保我方从共_无联保 5 :司内联保_主联")
    @TableField("c_ci_mrk")
    private String cCiMrk;

    @Schema(description = "保险期间类型")
    @TableField("c_criterion_time_unit")
    private String cCriterionTimeUnit;

    @Schema(description = "标准承保期限")
    @TableField("n_criterion_time")
    private Double nCriterionTime;

    @Schema(description = "保险期限浮动区间起")
    @TableField("n_low_insure_days")
    private Double nLowInsureDays;

    @Schema(description = "保险期限浮动区间止")
    @TableField("n_top_insure_days")
    private Double nTopInsureDays;

    @Schema(description = "按分公司展示，多个分公司中间使用英文逗号")
    @TableField("c_show_dpt")
    private String cShowDpt;

    @Schema(description = "是否调用中保信智能风控 1:是 0:否")
    @TableField("c_is_sinosure")
    private String cIsSinosure;

    @Schema(description = "是否绿色产业客户")
    @TableField("c_resv_txt_1")
    private String cResvTxt1;

    @Schema(description = "绿色产业细分列表")
    @TableField("c_resv_txt_2")
    private String cResvTxt2;

    @Schema(description = "预留文本字段3")
    @TableField("c_resv_txt_3")
    private String cResvTxt3;

    @Schema(description = "头周期")
    @TableField("c_head_period")
    private String cHeadPeriod;

    @Schema(description = "借款期限")
    @TableField("c_tm_loan_trm")
    private String cTmLoanTrm;

    @Schema(description = "是否使用方案配置条款 1:使用方案配置,2:使用外部传输")
    @TableField("c_is_use_term")
    private String cIsUseTerm;

    // getter / setter 省略
}
```

---

## 数据库表定义

```sql
-- public.web_plan_base 定义

-- Drop table
-- DROP TABLE public.web_plan_base;

CREATE TABLE public.web_plan_base (
    c_plan_no          varchar(50)  COLLATE "utf8_general_ci" NOT NULL,
    c_plan_cn          varchar(200) COLLATE "utf8_general_ci" NULL,
    c_plan_en          varchar(200) COLLATE "utf8_general_ci" NULL,
    t_upd_tm           datetime NULL,
    c_upd_cde          varchar(50)  COLLATE "utf8_general_ci" NULL,
    c_crt_cde          varchar(50)  COLLATE "utf8_general_ci" NULL,
    t_crt_tm           datetime NULL,
    c_typ              varchar(10)  COLLATE "utf8_general_ci" NULL,
    c_undr_status      varchar(10)  COLLATE "utf8_general_ci" NULL,
    c_enable_status    varchar(10)  COLLATE "utf8_general_ci" NULL,
    c_access_type      varchar(10)  COLLATE "utf8_general_ci" NULL,
    c_dpt_cde          varchar(50)  COLLATE "utf8_general_ci" NULL,
    c_kind_no          varchar(50)  COLLATE "utf8_general_ci" NULL,
    c_prod_no          varchar(50)  COLLATE "utf8_general_ci" NULL,
    t_bgn_tm           datetime NULL,
    t_end_tm           datetime NULL,
    c_spec_mrk         varchar(10)  COLLATE "utf8_general_ci" NULL,
    c_calc_formula     varchar(500) COLLATE "utf8_general_ci" NULL,
    c_spec_no          varchar(50)  COLLATE "utf8_general_ci" NULL,
    c_spec_content     text         COLLATE "utf8_general_ci" NULL,
    c_remark           text         COLLATE "utf8_general_ci" NULL,
    c_origin           varchar(20)  COLLATE "utf8_general_ci" NULL,
    c_old_plan_no      varchar(50)  COLLATE "utf8_general_ci" NULL,
    c_ration_type      varchar(50)  COLLATE "utf8_general_ci" NULL,
    c_ci_mrk           varchar(10)  COLLATE "utf8_general_ci" NULL,
    c_criterion_time_unit varchar(10) COLLATE "utf8_general_ci" NULL,
    n_criterion_time   numeric(20, 2) NULL,
    n_low_insure_days  numeric(20, 2) NULL,
    n_top_insure_days  numeric(20, 2) NULL,
    c_show_dpt         varchar(500) COLLATE "utf8_general_ci" NULL,
    c_is_sinosure      varchar(10)  COLLATE "utf8_general_ci" NULL,
    c_resv_txt_1       varchar(500) COLLATE "utf8_general_ci" NULL,
    c_resv_txt_2       varchar(500) COLLATE "utf8_general_ci" NULL,
    c_resv_txt_3       varchar(500) COLLATE "utf8_general_ci" NULL,
    c_head_period      varchar(50)  COLLATE "utf8_general_ci" NULL,
    c_tm_loan_trm      varchar(50)  COLLATE "utf8_general_ci" NULL,
    c_is_use_term      varchar(10)  COLLATE "utf8_general_ci" NULL,
    CONSTRAINT pk_web_plan_base PRIMARY KEY (c_plan_no)
);
```

---

## 调用链路

```
前端请求
  └── PlanController#getPlanBase (@RequestBody R p)
        └── planService.getPlanBase(p.getParams())  [Feign 远程调用]
              └── nvhl-pcis-prod-definition-impl-ct 服务
                    └── 查询 web_plan_base 表
                          └── 返回 ResponseDTO (data 为 Map 结构)
```

## 备注

- 该接口通过 Feign 远程调用 `nvhl-pcis-prod-definition-impl-ct` 微服务获取数据。
- `ResponseDTO.code` 为 `"1"` 时表示业务成功，Controller 层据此判断并组装 `R` 响应对象。
- 返回的方案基本信息数据为 `Map` 结构（非直接反序列化为 `WebPlanBase` 实体），字段名与实体属性名一致。

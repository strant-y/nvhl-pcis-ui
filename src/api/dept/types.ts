/**
 * 部门查询参数
 */
export interface DeptQuery {
  cDptCde?: string;
  cDptCnm?: string;
  subordinate?: string;
}

/**
 * 部门类型
 */
export interface DeptVO {
  /**
   * 子部门
   */
  children?: DeptVO[];
  /**
   * 部门ID
   */
  cDptCde?: string;
  /**
   * 部门名称
   */
  cDptCnm?: string;
  /**
   * 父部门ID
   */
  cSnrDpt?: string;
  /**
   * 状态(1:启用；0:禁用)
   */
  cIsValid?: string;

  cDptCls?: string;

  cDptAttr?: string;
  
  cZipCde?: string;
  
  cCtctPrsn?: string;

  cTel?: string;

  tFndTm?: string;
}

/**
 * 部门表单类型
 */
export interface DeptForm {
  /**
   * 子部门
   */
  children?: DeptVO[];
  /**
   * 部门ID
   */
  cDptCde?: string;
  /**
   * 部门名称
   */
  cDptCnm?: string;
  /**
   * 父部门ID
   */
  cSnrDpt?: string;
  /**
   * 状态(1:启用；0:禁用)
   */
  cIsValid?: string;

  cDptCls?: string;

  cDptAttr?: string;
  
  cZipCde?: string;
  
  cCtctPrsn?: string;

  cTel?: string;

  tFndTm?: string;
}

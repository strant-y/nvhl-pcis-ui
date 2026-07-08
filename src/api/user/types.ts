
export interface UserInfo {
  opCde?: string;
  opCnm?: string;
  cCssStyle?: string;
  perms: string[];
  cIsValid?: boolean;
  roles?: string[];
  companyId?: string;
  companyCnm?:string;
}

/**
 * 登录用户信息
 */
export interface LoginUserInfo extends UserInfo{
  /**所属组织机构id**/
  companyId: string;
  /**用户Id/登录名**/
  opCde: string;
  /**用户姓名**/
  opCnm: string;
  /**用户别名**/
  opRelCde: string;
  /**上级部门**/
  dptRelCde: string;
  /**操作机构**/
  opOrgs: object[];
  agent: string; //user-agent
  /**用户电话**/
  phoneNO: string;
  /**密码起止期**/
  TPwdStrtTm: Date;
  TPwdEndTm: Date;
}


/**
 * 用户查询对象类型
 */
export interface UserQuery extends PageQuery {
  companyId?: string;
  cDptCnm?: string;
  cIsValid?: string;
  opCde?: string;
  opCnm?: string;
  subordinate?: string;
}

/**
 * 用户分页对象
 */
export interface UserPageVO {
  /**
   * 部门名称
   */
  cDptCnm?: string;

  /**
   * 性别
   */
  cSex?: string;
  /**
   * 用户ID
   */
  opCde?: string;
  /**
   * 手机号
   */
  cMobile?: string;
  /**
   * 用户昵称
   */
  opCnm?: string;
  /**
   * 角色名称，多个使用英文逗号(,)分割
   */
  roleNames?: string;
  /**
   * 用户状态(1:启用;0:禁用)
   */
  cIsValid?: string;

  tPwdStrtTm?: string;

  tPwdEndTm?: string;

  cPkId?: string;

}

export interface UserRoleBindVO {
  cDptCde: string;
  cRoleCde: string[];
  cPkId: string;
}

/**
 * 用户表单类型
 */
export interface UserForm {

  cPkId?: string;
  /**
   * 部门ID
   */
  companyId?: string;

  /**
   * 性别
   */
  cSex?: string;

  cCtfctTyp?: string;
  cCtfctNo?: string;

  cMobile?:string;
  /**
   * 用户ID
   */
  opCde?: string;
  /**
   * 昵称
   */
  opCnm?: string;
  /**
   * 角色ID集合
   */
  roleIds?: string[];
  roles?: UserRoleBindVO[];
  /**
   * 用户状态(1:正常;0:禁用)
   */
  cIsValid?: string;

  tPwdStrtTm?: string;

  tPwdEndTm?: string;
}

/**
 * 角色查询参数
 */
export interface RoleQuery extends PageQuery {
  cOpgrpCde?: string;
  cOpgrpCnm?: string;
}

/**
 * 角色分页对象
 */
export interface RolePageVO {
  /**
   * 角色编码
   */
  cOpgrpCde: string;

  /**
   * 角色名称
   */
  cOpgrpCnm: string;

  /**
   * 角色说明
   */
  cOpgrpMemo: string;

  /**
   * 角色级别
   */
  cRoleLevl: string;

}

/**
 * 角色分页
 */
export type RolePageResult = PageResult<RolePageVO[]>;

/**
 * 角色表单对象
 */
export interface RoleForm {

  /**
   * 角色编码
   */
  cOpgrpCde?: string;

  /**
   * 角色名称
   */
  cOpgrpCnm?: string;

  /**
   * 角色说明
   */
  cOpgrpMemo?: string;

  /**
   * 角色级别
   */
  cRoleLevl?: string;


}

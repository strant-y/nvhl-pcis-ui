/**
 * 字典类型查询参数
 */
export interface DictTypeQuery extends PageQuery {
  /**
   * 关键字(字典类型编码)
   */
  cDictCode?: string;

  /**
   *关键字(字典类型名词)
   */
  cDictName?: string;
}

/**
 * 字典类型分页对象
 */
export interface DictTypePageVO {

  cPkId: string;
  /**
   * 类型编码
   */
  cDictCode: string;
  /**
   * 类型名称
   */
  cDictName: string;
  /**
   * 状态(1:启用;0:禁用)
   */
  cDictStatic?: string;
  /**
   * 备注
   */
  cMark?: string;
}

/**
 * 字典分页项类型声明
 */
export type DictTypePageResult = PageResult<DictTypePageVO[]>;

/**
 * 字典表单类型声明
 */
export interface DictTypeForm {

  /**
   * 主键
   */
  cPkId?: string;
  /**
   * 类型名称
   */
  cDictName?: string;
  /**
   * 类型编码
   */
  cDictCode?: string;
  /**
   * 类型状态：1:启用;0:禁用
   */
  cDictStatic?: string;
  /**
   * 备注
   */
  cMark?: string;
  /**
   * 是否缓存
   */
  cIsCache?: string;
}

/**
 * 字典查询参数
 */
export interface DictQuery extends PageQuery {
  /**
   * 字典类型编码
   */
  cParentId?: string;
}

/**
 * 字典分页对象
 */
export interface DictPageVO {

  cPkId?: string;
  cParentId?: string;
  /**
   * 字典名称
   */
  cDictLable?: string;
  /**
   * 状态(1:启用;0:禁用)
   */
  cDictStatic?: string;
  /**
   * 字典值
   */
  cDictValue?: string;
}

/**
 * 字典分页
 */
export type DictPageResult = PageResult<DictPageVO[]>;

/**
 * 字典表单
 */
export interface DictForm {

  cPkId?: string;

  cParentId?: string;
  /**
   * 字典名称
   */
  cDictLabel?: string;
  /**
   * 状态(1:启用;0:禁用)
   */
  cDictStatic?: string;
  /**
   * 值
   */
  cDictValue?: string;

  /**
   * 备注
   */
  cMark?: string;
}

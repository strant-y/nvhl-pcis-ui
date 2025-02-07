import { MenuTypeEnum } from "@/enums/MenuTypeEnum";

/**
 * 菜单查询参数类型
 */
export interface MenuQuery {
  keywords?: string;
  subordinate?: boolean;
  queryType?: string;
}

/**
 * 菜单视图对象类型
 */
export interface MenuVO {

  /**
   * 菜单ID
   */
  cOpCde?: string;
  /**
   * 父菜单ID
   */
  cParentCde?: string;
  /**
   * 菜单名称
   */
  cOpCnm?: string;
  /**
   * 跳转目标
   */
  cTarget: string;
  /**
   * 菜单图标
   */
  cOpImg?: string;
  /**
   * 菜单级别
   */
  cOpLevl?: string;
  /**
   * 排序
   */
  nOpOrder: number;
  /**
   * 页面 组件路径
   * 按钮 权限标识
   */
  cOpAct?: string;
  /**
   * 路由路径
   */
  cOpRouteCde?: string;
  /**
   * 跳转路由路径
   */
  redirect?: string;

  /**
   * 菜单类型
   */
  cOpType: MenuTypeEnum;

  /**
   * 菜单说明
   */
  cOpMemo: string;

  /**
   * 权限标识
   */
  cPerm?: string;
  /**
   * 【菜单】是否开启页面缓存
   */
  keepAlive?: number;

  /**
   * 【目录】只有一个子路由是否始终显示
   */
  alwaysShow?: number;


  /**
   * 子菜单
   */
  children?: MenuVO[];
  // /**
  //  * 组件路径
  //  */
  // component?: string;
  // /**
  //  * ICON
  //  */
  // icon?: string;
  // /**
  //  * 菜单ID
  //  */
  // id?: number;
  // /**
  //  * 菜单名称
  //  */
  // name?: string;
  // /**
  //  * 父菜单ID
  //  */
  // parentId?: number;
  // /**
  //  * 按钮权限标识
  //  */
  // perm?: string;
  // /**
  //  * 跳转路径
  //  */
  // redirect?: string;
  // /**
  //  * 路由名称
  //  */
  // routeName?: string;
  // /**
  //  * 路由相对路径
  //  */
  // routePath?: string;
  // /**
  //  * 菜单排序(数字越小排名越靠前)
  //  */
  // sort?: number;
  // /**
  //  * 菜单类型
  //  */
  // type?: MenuTypeEnum;
  // /**
  //  * 菜单是否可见(1:显示;0:隐藏)
  //  */
  // visible?: number;
}

/**
 * 菜单表单对象类型
 */
export interface MenuForm {
  /**
   * 菜单ID
   */
  cOpCde?: string;
  /**
   * 父菜单ID
   */
  cParentCde?: string;
  /**
   * 菜单名称
   */
  cOpCnm?: string;
  /**
   * 跳转路由
   */
  cSkipRoute?: string;
  /**
   * 菜单图标
   */
  cOpImg?: string;
  /**
   * 菜单级别
   */
  cOpLevl?: string;
  /**
   * 排序
   */
  nOpOrder: number;
  /**
   * 页面 组件路径
   * 按钮 权限标识
   */
  cOpAct?: string;
  /**
   * 路由路径
   */
  cOpRouteCde?: string;
  /**
   * 菜单类型
   */
  cOpType?: MenuTypeEnum;

  /**
   * 菜单说明
   */
  cOpMemo?: string;

  /**
   * 权限标识
   */
  cPerm?: string;
  /**
   * 显示状态
   */
  cDisplayStatus?: string;
  /**
   * 【菜单】是否开启页面缓存
   */
  keepAlive?: number;

  /**
   * 【目录】只有一个子路由是否始终显示
   */
  alwaysShow?: number;
}

/**
 * 菜单下拉
 */
export interface MenuOptionsVO {
  value?: string;
  label?: string;
  children?: MenuOptionsVO[];
}


/**
 * 菜单路由
 */
export interface MenuRoutesVO {
  path?: string;
  component?: string;
  name?: string;
  meta: {
    title?: string;
    hidden?: boolean;
    roles: [],
    keepAlive: true,
  },
  children: MenuRoutesVO[]
}


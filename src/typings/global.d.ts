declare global {
  /**
   * 分页查询参数
   */
  interface PageQuery {
    pageNum: number;
    pageSize: number;
  }

  /**
   * 分页响应对象
   */
  interface PageResult<T> {
    result: any;
    /** 数据列表 */
    list: T;
    /** 总数 */
    total: number;
  }

  /**
   * 分页响应对象
   */
  interface Pageresult<> {
    result: any;
    /** 数据列表 */
    list: Array<any>;
    /** 总数 */
    total: number;
  }

  /**
   * 页签对象
   */
  interface TagView {
    /** 页签名称 */
    name: string;
    /** 页签标题 */
    title: string;
    /** 页签路由路径 */
    path: string;
    /** 页签路由完整路径 */
    fullPath: string;
    /** 页签图标 */
    icon?: string;
    /** 是否固定页签 */
    affix?: boolean;
    /** 是否开启缓存 */
    keepAlive?: boolean;
    /** 路由查询参数 */
    query?: any;
    /** 是否显示*/
    hidden?: boolean;
    /** 缓存组件的名称*/
    cachedKey?: string;
  }

  /**
   * 系统设置
   */
  interface AppSettings {
    /** 系统标题 */
    title: string;
    /** 系统版本 */
    version: string;
    /** 是否显示设置 */
    showSettings: boolean;
    /** 是否固定头部 */
    fixedHeader: boolean;
    /** 是否显示多标签导航 */
    tagsView: boolean;
    /** 是否显示侧边栏Logo */
    sidebarLogo: boolean;
    /** 导航栏布局(left|top|mix) */
    layout: string;
    /** 主题颜色 */
    themeColor: string;
    /** 主题模式(dark|light) */
    theme: string;
    /** 布局大小(default |large |small) */
    size: string;
    /** 语言( zh-cn| en) */
    language: string;
    /** 是否开启水印 */
    watermarkEnabled: boolean;
    /** 水印内容 */
    watermarkContent: string;
  }

  /**
   * 组件数据源
   */
  interface OptionType {
    /** 值 */
    value?: string | number;
    /** 文本 */
    label?: string;
    /** 排序 */
    sort?: number;
    /** 子列表  */
    children?: OptionType[];
  }

  interface MyTableMethod {
    getPartnerPage?: (flag?: boolean) => PageQuery & Record<string, any>;
    setPartnerPage?: (params: PageQuery) => void;
    getFromValue?: () => any;
    setFormSchema?: (rowId: string, props: any, schama: any, value: any) => any;
    setValueByRowKey?: (props: string, rowId: any, value: any) => any;
    getselectionData?: () => any;
    getRowAllItemRefById?: (id: string) => any;
    clearSelection?: () => void;
    toggleRowSelection?: (row: any, selected: boolean) => void;
    getFormBtn?: () => any;
    getTableBtn?: () => any;
    getCodeListMap?: () => any;
    addCodeListMap?: (data: any) => void;
    setCodeListMap?: (map: any) => void;
    setRowFieldProp?: (rowId: string, field: string, prop: string, value: any) => any;
    getTableValues?: () => any;
  }
}
export {};

import { FreeButtonBase } from "./button-config";

export interface AppGridEditConfig {
  fromType?: "grid" | "free" | "custom" | null | undefined;
  id?: string; // 表单主键
  title?: string | null | undefined; // 功能标题
  production?: boolean; //标题是否显示tooltip
  productionTitle?: string; //标题内容
  fromUi?: any | null; // formUi配置
  fromSchema?: any[] | null; // 表单元素列表
  showBtn?: boolean; // 显示按钮 默认true
  shadow?: boolean; // 显示边框阴影 默认true
  showMyfrom?: boolean; //是否隐藏信息
  showMyfromBtm?: boolean; //是否显示折叠切换按钮
  titleBtns?: Array<FreeButtonBase>; //标题处按钮
  endBtns?: Array<FreeButtonBase>; //结尾处按钮
  tableBtnTitle?: string; //表格操作列title;
  tableBtn?: Array<FreeButtonBase>; //表格内按钮
  tableBtnPosition?: "left" | "right" | null; // 表格操作按钮所在位置
  tableBtnType?: "icon" | "text" | "btn"; // 表格操作按钮类型(文本/图标)
  endBtnsPosition?: "left" | "right" | "center"; // 结尾处按钮位置
  tableBtnWidth?: string | number;
  editFlag?: boolean; //是否可编辑
  editList?: Array<any>; //指定可编辑列
  showExpand?: boolean; // 是否显示扩展列
  showSelection?: boolean; //是否显示多选列

  dragFlag?: boolean; // mytable模式下,是否可以拖动
  rowDbClickFun?: (rowData) => void;
}

export interface AppGridEditMethod {
  getFromValue: () => any;
  setFormValue: (data: any) => void;
  validate: () => any;
  getTableValue: () => any;
  addRow: () => any;
  delRow: (editIndex) => any;
  addRowByData: (rowData) => any;
  getSelectRow: () => any;
  tableExvalidate: () => any;
  setDisabledAll: (isDisabled: boolean) => void;
  setFormSchema: (rowId: string, props: any, schama: any, value: any) => void;
  setValueByRowKey:(props:string ,rowId: any, value:any) => void;
  getRowById:(rowId: string) => void;
  setRowFieldProp: (rowId: string, field: string, prop: string, value: any) => void,
  getFormBtn: () => any;
  getTableBtn: () => any;
  getCodeListMap: () => any;
  setCodeListMap: (map: any) => void;
  addCodeListMap: (data: any) => void;
  getRowAllItemRefById: (rowId: string) => any;
  spliceTableData: (index: number, delCount: number, list: any[]) => any[];
  addProvide: <T> (key: InjectionKey<T> | string, value: T) => void;
}

export function createAppGridEditConfig(
  config: AppGridEditConfig = {}
): AppGridEditConfig {
  return {
    fromType: 'grid',
    id: config.id || `ID${new Date().getTime()}`,
    title: config.title || null,
    showBtn: config.showBtn || true,
    shadow: config.shadow || true,
    showMyfrom: config.showMyfrom || true,
    showMyfromBtm: config.showMyfromBtm || false,
    production: config.production || false,
    productionTitle: config.productionTitle || "",
    fromSchema: config.fromSchema || [],
    titleBtns: config.titleBtns || [],
    endBtns: config.endBtns || [],
    tableBtn: config.tableBtn || [],
    tableBtnTitle: config.tableBtnTitle || "操作",
    endBtnsPosition: config.endBtnsPosition || "center",
    editFlag: config.editFlag || false,
    editList: config.editList || [],
    showExpand: config.showExpand || false,
    tableBtnPosition: config.tableBtnPosition || null,
    tableBtnType: config.tableBtnType || "btn",
    tableBtnWidth: config.tableBtnWidth || "100",
    showSelection: config.showSelection || false,
    fromUi: createGridFromUiConfig(config.fromUi),
    dragFlag: config.dragFlag || false,
    rowDbClickFun: config.rowDbClickFun || null,
  };
}

export interface GridFromUiConfig {
  cols?: 1 | 2 | 3 | 4 | 6 | 8 | 12; // 表单主键
  labelWidth?: string | "auto"; //label长度
  labelPosition?: "left" | "right" | "top"; //label位置
  size?: "large" | "default" | "small"; //表单号
  showTitleBar?: boolean;  // 是否显示标题栏
}
export function createGridFromUiConfig(
  config: GridFromUiConfig = {}
): GridFromUiConfig {
  return {
    cols: config.cols || 3,
    labelWidth: config.labelWidth || "auto",
    labelPosition: config.labelPosition || "right",
    size: config.size || "default",
    showTitleBar: config.showTitleBar ===null || config.showTitleBar === undefined ? true : config.showTitleBar,
  };
}

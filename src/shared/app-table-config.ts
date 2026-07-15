import { FreeButtonBase } from "./button-config";
import { AppGridEditConfig } from "@/shared/app-grid-edit-config";

export interface AppTableConfig {

  id?: string; // 表单主键
  title?: string | null | undefined; // 功能标题
  fixedHeader?: boolean; // 是否固定表头
  fixed?: boolean;  // 是否固定编辑列
  production?: boolean; //标题是否显示tooltip
  productionTitle?: string; //标题内容
  fromUi?: any | null; // formUi配置
  fromSchema?: Array<any> | null; // 表单元素列表
  showBtn?: boolean; // 显示按钮 默认true
  shadow?: boolean; // 显示边框阴影 默认true
  titleBtns?: Array<FreeButtonBase>; //标题处按钮
  tableBtn?: Array<FreeButtonBase>; //表格内按钮
  titleBtnPosition?: "left" | "right" | null; // 表格操作按钮所在位置
  tableBtnPosition?: "left" | "right" | null; // 表格操作按钮所在位置
  tableBtnTitle?: string; //表格操作列title;
  tableBtnType?: "icon" | "text" | "btn"; // 表格操作按钮类型(文本/图标)
  tableBtnWidth?: string | number;
  endBtns?: Array<FreeButtonBase>; //结尾处按钮
  endBtnsPosition?: "left" | "right" | "center"; // 结尾处按钮位置
  dragFlag?: boolean;
  editFlag?: boolean;
  isPage?: boolean | string; //是否分页
  editList?: Array<any>; //指定可编辑列
  showSelection?:boolean; //行多选
  showEdit?: boolean; //是否显示查询表单
  formconfig?: AppGridEditConfig | null;  //表单配置
  maxHeight?: string;
  rowDbClickFun?: (rowData) => void;
  columnWidthByCalc?: boolean;
}

export interface AppTableMethod {
  getPartnerPage: (flag?: boolean) => any;
  getFromValue: () => any;
  setFormSchema: (rowId: string, props: any, schama: any, value: any) => void;
  setValueByRowKey:(props:string ,rowId: any, value:any) => void;
  getRowById:(rowId: string) => void;
  getselectionData:() => any;
  getFormBtn: () => any;
  getTableBtn: () => any;
  getCodeListMap: () => any;
  getTableValues:() => any;
  setCodeListMap: (map: any) => void;
  addCodeListMap: (data: any) => void;
  setRowFieldProp: (rowId: string, field: string, prop: string, value: any) => void;
}
export interface MyTableMethod {
  addRow: (arg: any) => any;
  getSelectRow: () => any;
  getPartnerPage: (flag?: boolean) => any;
  getFormData: () => any;
  updateOption: (rowId: string, propKey: string, newOption: Array<any>) => void;
  getFromValue: () => any;
  setFormValue: (data: any) => void;
  getTableValue(): () => any;
  removeRow: (dataId: string) => any;
  setValueByRowKey:(props:string ,rowId: any, value:any) => void; // (prop: 要素key, rowId: 行Id, value: 值)
  deleteByRowKey:(rowId: any) => void;
  getRowById:(rowId: string) => void;
  getselectionData:() => any;
}
export function createTableEditConfig(
  config: AppTableConfig = {}
): AppTableConfig {
  return {
    fromType: 'table',
    id: config.id || `ID${new Date().getTime()}`,
    title: config.title || null,
    showBtn: config.showBtn || true,
    shadow: config.shadow || true,
    fixed: config.fixed || false,
    fixedHeader: config.fixedHeader || false,
    production: config.production || false,
    productionTitle: config.productionTitle || "",
    fromSchema: config.fromSchema || [],
    titleBtns: config.titleBtns || [],
    tableBtn: config.tableBtn || [],
    tableBtnTitle: config.tableBtnTitle || "操作",
    titleBtnPosition: config.titleBtnPosition || 'left',
    tableBtnPosition: config.tableBtnPosition || null,
    tableBtnType: config.tableBtnType || "btn",
    tableBtnWidth: config.tableBtnWidth || "100",
    endBtnsPosition: config.endBtnsPosition || "center",
    endBtns: config.endBtns || [],
    dragFlag: config.dragFlag || false,
    editFlag: config.editFlag || false,
    editList: config.editList || [],
    isPage: config.isPage || true,
    fromUi: createTableUiConfig(config.fromUi),
    showSelection: config.showSelection || false,
    showEdit: config.showEdit || false,
    formconfig: config.formconfig || null,
    maxHeight: config.maxHeight || '435px',
    rowDbClickFun: config.rowDbClickFun || null,
    stripe: config.stripe,
    border: config.border,
    columnWidthByCalc: config.columnWidthByCalc,
  };
}

export interface TableUiConfig {
  cols?: 1 | 2 | 3 | 4 | 6 | 8 | 12; // 表单主键
  labelWidth?: string | "auto"; //label长度
  labelPosition?: "left" | "right" | "top"; //label位置
  size?: "large" | "default" | "small"; //表单号
  groupBy?: any[];
}
export function createTableUiConfig(config: TableUiConfig = {}): TableUiConfig {
  return {
    cols: config.cols || 3,
    labelWidth: config.labelWidth || "auto",
    labelPosition: config.labelPosition || "right",
    size: config.size || "default",
    groupBy: config.groupBy || [],
  };
}

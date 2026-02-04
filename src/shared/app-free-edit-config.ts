import { FreeButtonBase } from "./button-config";

export interface AppFreeEditConfig {
  fromType?: "grid" | "free" | "custom" | null | undefined;
  id?: string; // 表单主键
  title?: string | null | undefined; // 功能标题
  defaultValue?: any | null;
  production?: boolean; //标题是否显示tooltip
  productionTitle?: string; //标题内容
  fromUi?: any | null; // formUi配置
  superFromUi?: any | null; // 高级查询formUi配置
  fromSchema?: Array<any> | null; // 表单元素列表
  superFromSchema?: Array<any> | null; // 高级查询表单元素列表
  superFromShow?: string | null; // 高级查询显示
  superFromClose?: string | null; // 高级查询关闭
  showBtn?: boolean; // 显示按钮 默认true
  shadow?: boolean; // 显示边框阴影 默认true
  showSuperior?: boolean; // 显示高级查询菜单
  showMyfrom?: boolean; //是否隐藏信息
  showMyfromBtm?: boolean; //是否显示折叠切换按钮
  titleBtns?: Array<FreeButtonBase>; //标题处按钮
  endBtns?: Array<FreeButtonBase>; //结尾处按钮
  endBtnsPosition?: "left" | "right" | "center"; // 结尾处按钮位置
}

export interface AppFreeEditMethod {
  getFromValue: () => any;
  setFormValue: (data: any,noupdate?: boolean) => void; // 设置表单值 noupdate:限制不触发update方法
  validate: () => any;
  setValue: (key: any, value: any, noupdate?: boolean) => void;
  getValue: (key: any) => any;
  clearValidate: (key: string | null ) => any;
  setDisabledAll: (isDisabled: boolean) => void;
  resetFields: () => void;
  getFormBtn: () => any;
  getCodeListMap: () => any;
  setCodeListMap: (map: any) => void;
  addCodeListMap: (data: any) => void;
  addProvide: <T> (key: InjectionKey<T> | string, value: T) => void;
  validateField: (fields: string | string[]) => Promise<boolean>;
  getFromSchemaItem: (id: string) => any;
}
export function createAppFreeEditConfig(
  config: AppFreeEditConfig = {}
): AppFreeEditConfig {
  return {
    fromType:'free',
    id: config.id || `ID${new Date().getTime()}`,
    title: config.title || null,
    defaultValue: config.defaultValue || {},
    showBtn: config.showBtn || true,
    showSuperior: config.showSuperior || false,
    shadow: config.shadow || true,
    showMyfrom: config.showMyfrom || true,
    showMyfromBtm: config.showMyfromBtm || false,
    production: config.production || false,
    productionTitle: config.productionTitle || "",
    superFromShow: config.superFromShow || "点击打开",
    superFromClose: config.superFromClose || "点击折叠",
    fromSchema: config.fromSchema || [],
    superFromSchema: config.superFromSchema || [],
    titleBtns: config.titleBtns || [],
    endBtns: config.endBtns || [],
    endBtnsPosition: config.endBtnsPosition || "center",
    fromUi: createFromUiConfig(config.fromUi),
    superFromUi: createFromUiConfig(config.superFromUi),
  };
}

export interface FromUiConfig {
  cols?: 1 | 2 | 3 | 4 | 6 | 8 | 12; // 表单主键
  labelWidth?: string | "auto"; //label长度
  labelPosition?: "left" | "right" | "top"; //label位置
  size?: "large" | "default" | "small"; //表单号
  showMessage?: "1"| "0"; // 是否显示验证异常信息,默认显示需要显示
  groupBy?: any[];
  showTitleBar?: boolean;  // 是否显示标题栏
}
export function createFromUiConfig(config: FromUiConfig = {showTitleBar: true}): FromUiConfig {
  return {
    cols: config.cols || 3,
    labelWidth: config.labelWidth || "auto",
    labelPosition: config.labelPosition || "right",
    size: config.size || "default",
    showMessage: config.showMessage || "1",
    groupBy: config.groupBy || [],
    showTitleBar: config.showTitleBar ===null || config.showTitleBar === undefined ? true : config.showTitleBar,
  };
}

export interface AppFreeEditRefs {
  getFormData?: () => any;
  setFormValue?: (id: any, value: any) => any;
}

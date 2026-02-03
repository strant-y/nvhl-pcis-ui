export interface CardConfig {
  id?: string | null | undefined; // 按钮id
  title?: string | null | undefined; // 功能标题
  production?: boolean; //标题是否显示tooltip
  productionTitle?: string; //标题内容
  showBtn?: boolean; // 显示按钮 默认true
  shadow?: boolean; // 显示边框阴影 默认true
  superFromShow?: string | null; // 高级查询显示
  superFromClose?: string | null; // 高级查询关闭
  showEdit?: boolean; //是否显示表单
  showMyfrom?: boolean; //是否隐藏信息
  titleClass?: string;  //自定义标题class
  showInTitle?: boolean; //是否显示折叠切换按钮
  showMyfromBtm?: boolean; //是否显示折叠切换按钮
  titleBtns?: Array<FreeButtonBase>; //标题处按钮
  tableBtn?: Array<FreeButtonBase>; //表格内按钮
  endBtns?: Array<FreeButtonBase>; //结尾处按钮
  endBtnsPosition?: "left" | "right" | "center"; // 结尾处按钮位置
  showTitleBar?: boolean;// 是否显示title层
  formconfig?:AppEditEditConfig | null;  //表单配置
}

export interface MyCardMethod {
  getFromValue: () => any;
  setFormValue: (data: any,noupdate?: boolean) => void; // 设置表单值 noupdate:限制不触发update方法
  validate: () => any;
  setValue: (key: any, value: any) => void;
  getValue: (key: any) => any;
  clearValidate: (key: string | null ) => any;
  setDisabledAll: (isDisabled: boolean) => void;
  resetFields: () => void;
}

export function creatCardConfig(
  config: CardConfig = {}
): CardConfig {
  return {
    id: config.id || null,
    title: config.title || null,
    showBtn: config.showBtn || true,
    shadow: config.shadow || true,
    showEdit: config.showEdit || false,
    showMyfrom: config.showMyfrom ?? true,
    showMyfromBtm: config.showMyfromBtm || false,
    showInTitle: config.showInTitle || false,
    production: config.production || false,
    tableBtn: config.tableBtn || [],
    titleClass:config.titleClass || null,
    productionTitle: config.productionTitle || "",
    superFromShow: config.superFromShow || "点击打开",
    superFromClose: config.superFromClose || "点击折叠",
    titleBtns: config.titleBtns || [],
    endBtns: config.endBtns || [],
    showTitleBar: config.showTitleBar || true,
    endBtnsPosition: config.endBtnsPosition || "center",
    formconfig: config.formconfig || null,
    
  };
}
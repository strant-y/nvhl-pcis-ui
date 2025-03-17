export interface CardConfig {
  title?: string | null | undefined; // 功能标题
  production?: boolean; //标题是否显示tooltip
  productionTitle?: string; //标题内容
  showBtn?: boolean; // 显示按钮 默认true
  shadow?: boolean; // 显示边框阴影 默认true
  superFromShow?: string | null; // 高级查询显示
  superFromClose?: string | null; // 高级查询关闭
  showMyfrom?: boolean; //是否隐藏信息
  showInTitle?: boolean; //是否显示折叠切换按钮
  showMyfromBtm?: boolean; //是否显示折叠切换按钮
  titleBtns?: Array<FreeButtonBase>; //标题处按钮
  endBtns?: Array<FreeButtonBase>; //结尾处按钮
  endBtnsPosition?: "left" | "right" | "center"; // 结尾处按钮位置
}

export function creatCardConfig(
  config: CardConfig = {}
): CardConfig {
  return {
    title: config.title || null,
    showBtn: config.showBtn || true,
    shadow: config.shadow || true,
    showMyfrom: config.showMyfrom || true,
    showMyfromBtm: config.showMyfromBtm || false,
    showInTitle: config.showInTitle || false,
    production: config.production || false,
    productionTitle: config.productionTitle || "",
    superFromShow: config.superFromShow || "点击打开",
    superFromClose: config.superFromClose || "点击折叠",
    titleBtns: config.titleBtns || [],
    endBtns: config.endBtns || [],
    endBtnsPosition: config.endBtnsPosition || "center",
  };
}
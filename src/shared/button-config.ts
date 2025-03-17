

export class FreeButtonBase {
  id?: string | undefined | null; // 按钮id
  label?: string | undefined | null; // 按钮名称
  type?:
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | undefined; // 按钮类型
  size?: "large" | "default" | "small" | undefined;
  span?: number; // 按钮所占栅格 默认2
  disabled?: boolean;
  func?: (...args: any[]) => any; // click触发函数
  tableClick?: (...args: any[]) => any; // 专用于tableclick,与本身click区分,参数从table层获取
  loading?: boolean; // 加载状态
  position?: string; // 表示按钮的位置,默认是往右，设置为'btn-left'居左
  tooltip?: string | undefined | null;
  icon?: string | undefined | null;
  link?: boolean; //是否为链接按钮
  iconSize?: string | undefined | null;
  buttonColor?: string | undefined | null;
  iconColor?: string | undefined | null;
  popover?: string | undefined | null; //弹出框映射
  popoverWidth?: number | undefined | null; //弹出框宽度
  showKey?: Array; //显示数组合集，需要与数据匹配是否包含 findIndex方法
  beginLoading?: () => void;
  endLoading?: () => void;
}

export function createFreeButtonBase(
  config: FreeButtonBase = { type: "info", size: "default" }
): FreeButtonBase {
  const button = {
    id: config.id || null,
    label: config.label || null,
    type: config.type || "default",
    size: config.size || "default",
    icon: config.icon || null,
    iconSize: config.iconSize || "16",
    span: config.span || 2,
    func: typeof config.func === "function" ? config.func : () => {},
    hideBtns: typeof config.hideBtns === "function" ? config.hideBtns : () => {},
    tableClick:
      typeof config.tableClick === "function" ? config.tableClick : () => {},
    loading: config.loading || false,
    link: config.link || false,
    tooltip: config.tooltip || null,
    disabled: config.disabled || false,
    position: config.position || "btn-top",
    buttonColor: config.buttonColor || null,
    popover: config.popover || null,
    popoverWidth: config.popoverWidth || null,
    iconColor: config.iconColor || null,
    showKey: config.showKey || [],
    beginLoading: () => {
      button.loading = true;
    },
    endLoading: () => {
      button.loading = false;
    },
  };

  return button;
}

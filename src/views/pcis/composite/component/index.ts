// 定义锚点项类型
interface AnchorItem {
    id: string;
    title: string;
    icon?: string;
    href?: string;
    expanded?: boolean;
    children: AnchorItem[]; // 可选属性，必须确保使用前初始化
}

export type {AnchorItem}
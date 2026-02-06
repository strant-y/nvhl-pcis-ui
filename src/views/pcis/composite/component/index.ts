// 定义锚点项类型
interface AnchorItem {
    id: string;
    title: string;
    icon?: string;
    href?: string;
    expanded?: boolean;
    tabKey?: string;
    children: AnchorItem[]; // 可选属性，必须确保使用前初始化
}

interface GroupForm {
    groupId: string;
    pageInfo: any[];
    params: any;
    showGroupId: boolean;
    [key: string]: any;
}


export type {AnchorItem, GroupForm}
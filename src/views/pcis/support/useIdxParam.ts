import {CodeListViewProps, OpertaorProps} from "@/store";

export const idxParamKey: string = 'idxParam';

export interface IdxParamProps {
    opertaorProps: OpertaorProps; // dataOpertaor缓存工具初始化必要参数
    cdeListViewProps: CodeListViewProps; // cdeListView缓存工具初始化必要参数
    [key: string]: any | Function;
}

/**
 * 安全获取获取idxParam
 * @returns IdxParamProps
 * @param option
 */
export const useIdxParam = (option: any = {}) :IdxParamProps => {
    const params = ref({
        opertaorProps: {},
        cdeListViewProps: {id: 'default'},
        ...option,
    });
    return params.value;
};

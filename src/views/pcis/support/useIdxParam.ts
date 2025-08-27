import {OpertaorProps} from "@/store";

export const idxParamKey: string = 'idxParam';

export interface IdxParamProps {
    opertaorProps: OpertaorProps; // dataOpertaor缓存工具初始化必要参数
    [key: string]: any;
}

/**
 * 安全获取获取idxParam
 * @returns IdxParamProps
 * @param option
 */
export const useIdxParam = (option: any = {}) :IdxParamProps => {
    const params = ref<any>({
        id: null,
        ...option,
    });
    return params.value as IdxParamProps;
};

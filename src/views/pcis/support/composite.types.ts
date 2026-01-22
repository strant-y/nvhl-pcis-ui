import {getProductPage} from "@/api/prod";
import {AnchorItem, GroupForm} from "@/views/pcis/composite/component";
import {CommonConstants} from "@/constants/CommonConstants";
import {dataOpertaor} from "@/store";
import {getData} from "@/pcis/prodRef/dataInit";

/**
 * 公共分组ID
 */
export const CommonGroupId = "group-000000";

export const OpertaorPosit = "posit";

/**
 * 组合出单申请
 */
export const POSITE_PAGE_TYPE_APP =  "positeApp";
/**
 * 组合出单暂存
 */
export const POSITE_PAGE_TYPE_SAVE =  "positeSave";
/**
 * 组合出单核保
 */
export const POSITE_PAGE_TYPE_UNDR =  "positeUndr";
/**
 * 组合出单批改
 */
export const POSITE_PAGE_TYPE_EDR =  "positeEdr";
/**
 * 组合出单只读
 */
export const POSITE_PAGE_TYPE_READ =  "positeRead";

/**
 * 公共组件映射
 */
export const CommonComponentMap = new Map<string, string>();
// CommonComponentMap.set("base", 'positeBase');
CommonComponentMap.set('applicant', 'positeApplicant');
CommonComponentMap.set('insured', 'positeInsured');
CommonComponentMap.set('plyBase', 'positePlybase');
// CommonComponentMap.set('ci', 'positeCi');

export interface CompositePageConfigType {
    pageConfig: GroupForm[],
    anchorConfig: AnchorItem[]
}

/**
 * 组合产品出单页面视图工具
 */
export class CompositePageView {
    public anchorConfig = reactive<AnchorItem[]>(new Array<AnchorItem>());
    public pageConfig = reactive<GroupForm[]>(new Array<GroupForm>());
    public pageParams = reactive<any>({});
    // 页面创建之前调用
    public beforeCreation?: (config: CompositePageConfigType) => Promise<CompositePageConfigType>;

    constructor() {
        this.anchorConfig = reactive<AnchorItem[]>(new Array<AnchorItem>());
        this.pageConfig = reactive<GroupForm[]>(new Array<GroupForm>());
        this.allDataFormat = this.allDataFormat.bind(this);
    }

    /**
     * 数据格式化处理
     * @param id
     * @param res
     */
    allDataFormat = (id: string, res: any): any => {
        if(!id || !res || !this.pageConfig) return undefined;
        const data = {...res}
        const config: GroupForm | undefined = this.pageConfig.find((f: GroupForm) => f.groupId === id)
        if (config) {
            if(data) {
                const item = config.params
                const props = ['cAppNo', 'cPlyNo', 'cCombinationNo'];
                const formatList: any[] = [
                    {key: 'plyBase', pr: 'Base'},
                    {key: 'base', pr: 'Base'},
                    {key: 'applicant', pr: 'Applicant'},
                    {key: 'insured', pr: 'Insured'},
                ];
                formatList.forEach(format => {
                    if(data[format.key]) {
                        props.forEach(prop => {
                            data[format.key][format.pr + '.' + prop] = item[prop]
                        })
                    }
                })
            }
        }
        return data
    }

    /**
     * 设置路由参数
     * @param params
     */
    setPageParams(params: any) {
        Object.assign(this.pageParams, params);
    }

    /**
     * 页面构造方法
     * @param list
     */
    buildPage(list: any[]) {
        console.log('### buildPage-list', list);
        return new Promise((resolve, reject) => {
            const params: any[] = list.map((item: any) => {
                return {
                    CProdNo: item.cProdNo,
                    CGrpMrk: item.cGrpMrk,
                    CProdNme: item.cProdNme,
                    CTermNo: item.cTermNo,
                }
            });
            const reqList: any = [];
            params.forEach((item: any) => reqList.push(this.reqPageJson(item)));
            Promise.all(reqList).then(async (arrResult: any) => {
                const productSchemasMap: any = {};
                const compList: any[] = [];
                arrResult.forEach((obj: any) => {
                    const [[key, value]] = Object.entries(obj);
                    productSchemasMap[key] = value as Array<any>;
                    compList.push(productSchemasMap[key]);
                });
                console.log('compList', compList)
                const commonList = this.mergeViews(compList)
                    .filter((item: any) => CommonComponentMap.has(item['pageKey']))
                    .map((common: any) => { // 替换公共组件 pageCode
                        const pageKey = common['pageKey'];
                        if(CommonComponentMap.has(pageKey)) {
                            common['pageCode'] = CommonComponentMap.get(pageKey);
                        }
                        common['id'] = `_${['dist', 'distSummary'].includes(common.pageKey)  ? common.pageCode : common.pageKey}-000000`
                        return common;
                    });
                console.log('commonList', commonList)
                const config = this.structureConfig(productSchemasMap, list, commonList);
                console.log('### buildPage-config ', config);
                // 加载前的回调
                if(this.beforeCreation) {
                    const modifConfig = await this.beforeCreation({...config});
                    console.log('beforeCreation result: ', modifConfig);
                    Object.assign(config, modifConfig);
                }
                // 新增或替换组
                if(this.anchorConfig.length === 0) {
                    this.anchorConfig.push(...config.anchorConfig);
                }else {
                    const oldAnchorIdList = this.anchorConfig.map((anchor: AnchorItem) => anchor.id);
                    const newAnchorIdList = config.anchorConfig.map((anchor: AnchorItem) => anchor.id);
                    const delAnchorIdList = oldAnchorIdList.filter((f: string) => !newAnchorIdList.includes(f));
                    this.delAnchorConfig(delAnchorIdList);
                    config.anchorConfig.forEach((anchor: AnchorItem) => {
                        const idx = this.anchorConfig.findIndex((item: AnchorItem) => item.id === anchor.id);
                        if(idx !== -1) {
                            this.anchorConfig.splice(idx, 1, anchor);
                        }else {
                            this.anchorConfig.push(anchor);
                        }
                    })
                }
                if(this.pageConfig.length === 0) {
                    this.pageConfig.push(...config.pageConfig);
                }else {
                    const oldGroupIdList = this.pageConfig.map((group: GroupForm) => group.groupId);
                    const newGroupIdList = config.pageConfig.map((group: GroupForm) => group.groupId);
                    const delAnchorIdList = oldGroupIdList.filter((f: string) => !newGroupIdList.includes(f));
                    this.delGroupConfig(delAnchorIdList);
                    config.pageConfig.forEach((group: GroupForm) => {
                        const idx = this.pageConfig.findIndex((item: GroupForm) => item.groupId === group.groupId);
                        if(idx !== -1) {
                            this.pageConfig.splice(idx, 1, group);
                        }else {
                            this.pageConfig.push(group);
                        }
                    });
                }
                this.installDataOpertaor();
                resolve({
                    code: 200,
                    config: {
                        pageConfig: [...this.pageConfig],
                        anchorConfig: [...this.anchorConfig]
                    }
                });
            });
        });
    }

    private delAnchorConfig(anchorIds: string[]) {
        anchorIds.forEach((anchorId: string) => {
            const idx = this.anchorConfig.findIndex((anchor: AnchorItem) => anchor.id === anchorId);
            if(idx !== -1) {
                this.anchorConfig.splice(idx, 1); // 删除当前元素
            }
        });
    }
    private delGroupConfig(groupIds: string[]) {
        groupIds.forEach((groupId: string) => {
            const idx = this.pageConfig.findIndex((item: any) => item.groupId === groupId);
            if(idx !== -1) {
                this.pageConfig.splice(idx, 1); // 删除当前元素
            }
        });
    }

    private structureConfig(data: any, list: any[], commonList: any[]): CompositePageConfigType {
        const structure: GroupForm[] = [];
        const anchorList: AnchorItem[] = [];

        // 组件列表
        structure.push({
            groupId: CommonGroupId,
            showGroupId: false,
            pageInfo: commonList,
            params: {
                ...this.pageParams,
                cGrpMrk: "0",
                cProdNme: "公共信息",
                cProdNo: "000000",
                cTermNo: "0000000000",
            },
        });
        const productFromSchemas = this.parseSelfProductFromSchemas(data, list, commonList);
        structure.push(...productFromSchemas);

        // 锚点列表
        anchorList.push({
            id: 'list',
            title: '产品信息',
            expanded: true,
            children: [{
                id: 'positeList',
                title: '产品信息',
                href: '#positeList',
                expanded: true,
                children: []
            }]
        });
        structure.forEach((config: any, index: number) => {
            const anchor: AnchorItem = {
                id: config.params.cProdNo,
                title: index !== 0 ? `${config.params.cProdNo}-${config.params.cProdNme}` : config.params.cProdNme,
                expanded: true,
                children: config.pageInfo.map((item: any) => {
                    const id = `_${item.pageKey === 'dist' || item.pageKey === 'distSummary' ? item.pageCode : item.pageKey}-${config.params.cProdNo}`;
                    const childrenItem: AnchorItem = {
                        id: id,
                        title: index !== 0 ? `${config.params.cProdNo}-${item.pageTtile}` : item.pageTtile,
                        icon: item.icon,
                        expanded: true,
                        href: `#${id}`,
                        children: []
                    };
                    return childrenItem;
                }),
            };
            anchorList.push({...anchor});
        });

        return {
            pageConfig: structure,
            anchorConfig: anchorList
        };
    }

    private parseSelfProductFromSchemas(data: any, list: any[], commonList: any[]) {
        const commonCodes = commonList.map((item: any) => item['pageCode']);
        const productFromSchemas = [];
        for (const [key, value] of Object.entries(data)) {
            const cProdNo = key as string;
            const pageComponents = value as Array<any>;
            const prodInfo = list.find(item => item.cProdNo === cProdNo);
            const pageInfo = pageComponents.filter((item: any) => {
                if(CommonComponentMap.has(item.pageKey)) {
                    return !commonCodes.includes(CommonComponentMap.get(item.pageKey));
                }
                // 暂时屏蔽联共保组件
                if(['ci', 'ciMasterAgreement', 'ourCompanyCiShare'].includes(item.pageKey)) {
                    return false
                }
                return !commonCodes.includes(item.pageCode)
            });
            productFromSchemas.push({
                groupId: `group-${prodInfo.cProdNo}`,
                showGroupId: false,
                pageInfo: pageInfo.map((item: any) => {
                    item['id'] = `_${item.pageKey === 'dist' || item.pageKey === 'distSummary' ? item.pageCode : item.pageKey}-${prodInfo.cProdNo}`;
                    return item;
                }),
                params: {...this.pageParams, ...prodInfo}
            });
        }
        return productFromSchemas;
    }

    /** fromSchema合并函数 */
    private mergeFromSchemas(fromSchemas: any[][]): any[] {
        const merged: any[] = [];
        const existingProp = new Set<string>();
        for (const schemaArray of fromSchemas) {
            for (const item of schemaArray) {
                // 确保prop存在且为字符串
                if (typeof item.prop !== CommonConstants.TYPE_OF_STRING) {
                    console.warn("无效的prop，跳过 - ", item);
                    continue;
                }
                // 跳过重复prop
                if (!existingProp.has(item.prop)) {
                    existingProp.add(item.prop);
                    merged.push(item);
                }
            }
        }
        return merged;
    }

    private getNonExcludedProp<T extends object>(obj: T, excludeKeys: (keyof T)[] = []): Partial<T> {
        const result: Partial<T> = {};
        Object.keys(obj).forEach(key => {
            if (!excludeKeys.includes(key as keyof T)) {
                result[key as keyof T] = obj[key as keyof T];
            }
        });
        return result;
    }

    private mergeViews(viewsArrays: any[][]): any[] {
        const pageCodeSets = viewsArrays.map(views => {
            const codes = new Set<string>();
            views.forEach(view => codes.add(view.pageCode));
            return codes;
        });
        const intersection = pageCodeSets.reduce((prev, current) => {
            return new Set([...prev].filter(code => current.has(code)));
        }, pageCodeSets[0] || new Set());
        const pageCodeData = new Map<string, {
            fromSchemas: any[][],
            baseViewProp: Partial<any>,
            basePageSchemaProp: Partial<any>
        }>();
        intersection.forEach(code => {
            const baseView = viewsArrays.flat().find(view => view.pageCode === code);
            if (baseView) {
                pageCodeData.set(code, {
                    fromSchemas: [],
                    baseViewProp: this.getNonExcludedProp(baseView, ['pageSchema']),
                    basePageSchemaProp: this.getNonExcludedProp(baseView.pageSchema, ['fromSchema'])
                });
            }
        });
        for (const views of viewsArrays) {
            for (const view of views) {
                if (intersection.has(view.pageCode)) {
                    const data = pageCodeData.get(view.pageCode);
                    if (data) {
                        // 验证fromSchema是否为数组
                        if (!Array.isArray(view.pageSchema.fromSchema)) {
                            console.error(`pageCode=${view.pageCode}的fromSchema不是数组，跳过：`, view.pageSchema.fromSchema);
                            continue;
                        }
                        data.fromSchemas.push(view.pageSchema.fromSchema);
                    }
                }
            }
        }
        return Array.from(pageCodeData.entries()).map(([pageCode, data]) => ({
            ...data.baseViewProp,
            pageCode,
            pageSchema: {
                ...data.basePageSchemaProp,
                fromSchema: this.mergeFromSchemas(data.fromSchemas)
            }
        })) as any[];
    }


    /**请求指定产品的页面配置数据**/
    private async reqPageJson(param: any) {
        const result: any = {};
        const {CProdNo, CGrpMrk} = param;
        const sessionInfo = sessionStorage.getItem(CProdNo + '_' + CGrpMrk);
        if(!sessionInfo) {
            const productPage = await getProductPage(param);
            const data = JSON.parse(productPage.data);
            result[param.CProdNo] = data[0].pageInfo;
            // 存入当前会话session 下一次获取优先从session里拿
            sessionStorage.setItem(CProdNo + '_' + CGrpMrk, JSON.stringify(data[0].pageInfo));
        }else {
            result[param.CProdNo] = JSON.parse(sessionInfo);
        }
        return result;
    }

    /**
     * 初始化dataOpertaor工具
     */
    private installDataOpertaor() {
        for(const group of this.pageConfig) {
            try {
                const opertaor = this.getDataOpertaorByGroupId(group.groupId);
                opertaor.init();
                opertaor.setParam({sysDist: 'PCIS', ...group.params});
            } catch (e) {
                console.warn(`page group ${group.groupId} init error: `, e);
            }
        }
    }

    initPageData() {
        for(const group of this.pageConfig) {
            try {
                const opertaor = this.getDataOpertaorByGroupId(group.groupId);
                nextTick(() => {
                    const idata = getData(opertaor);
                    const initData = opertaor.mapSetData(idata);
                    opertaor.setDataAll(initData);
                });
            } catch (e) {
                console.warn(`initPageData group ${group.groupId} init error: `, e);
            }
        }
    }

    /**
     * 更新页面参数
     */
    updatePageParams(param: any, list: any[]) {
        list.forEach((prod: any) => {
            if(prod.cProdNo !== '000000') {
                const config: GroupForm | undefined = this.pageConfig.find((f: GroupForm) => f.groupId === `group-${prod.cProdNo}`)
                if (config) {
                    config.params = {
                        ...param,
                        cPlyNo: prod.cPlyNo,
                        cAppNo: prod.cAppNo,
                        cCombinationNo: prod.cCombinationNo,
                    }
                }
            }
        })
    }

    /**
     * 在公共组件里 操作其它产品dataOpertaor的方法
     * @param fun
     * @param exclude 需要排除的groupId
     * fun(param1, parma2) 需要操作的逻辑方法; param1: dataOpertaor(group.groupId)，parma2：pageConfig forEach item
     */
    linkedOperation(fun: Function, exclude: string[] = [CommonGroupId]) {
        if(fun && typeof fun === CommonConstants.TYPE_OF_FUNCTION) {
            for(const group of this.pageConfig) {
                if(!exclude || !exclude.includes(group.groupId)) {
                    const opertaor = this.getDataOpertaorByGroupId(group.groupId);
                    fun(opertaor, group);
                }
            }
        }else {
            console.warn('！！！ linkedOperation方法参数异常');
        }
    }

    getDataOpertaorByProdNo(prodNo: string, params: any = {}) {
        return dataOpertaor({id: `group-${prodNo}`, type: OpertaorPosit, allDataFormat: this.allDataFormat, ...params});
    }
    getDataOpertaorByGroupId(groupId: string, params: any = {}) {
        return dataOpertaor({id: groupId, type: OpertaorPosit, allDataFormat: this.allDataFormat, ...params});
    }

    /**
     * 校验所有组件
     */
    validateAll(): Promise<{validate: boolean, result: Record<string, any>}> {
        return new Promise(async (resolve, reject) => {
            let validate = true;
            const result: Record<string, any> = {};
            for(const group of this.pageConfig) {
                const groupId = group.groupId;
                const oertaor = this.getDataOpertaorByGroupId(groupId);
                if(oertaor) {
                    const vald = await oertaor.validateAll(false);
                    result[groupId] = vald;
                    if(!vald) {
                        validate = false;
                    }
                }
            }
            resolve({validate, result});
        })
    }

    /**
     * 获取所有表单的数据
     */
    getPageAllData() {
        const result: any = {};
        for(const group of this.pageConfig) {
            const groupId = group.groupId;
            const groupArr = groupId.split('-');
            const cProdNo = groupArr[1];
            const oertaor = this.getDataOpertaorByGroupId(groupId);
            if(oertaor) {
                result[cProdNo] = oertaor.getDataAll();
            }
        }
        return result;
    }

    /**
     * set所有产品表单的数据
     */
    setPageAllData(data: any) {
        if(data) {
            for (const group of this.pageConfig) {
                const groupId = group.groupId;
                const key = groupId.replace('group-', '');
                const oertaor = this.getDataOpertaorByGroupId(groupId);
                if (oertaor && data[key]) {
                    oertaor.setDataAll(data[key] ? data[key] : {});
                }
            }
        }else {
            console.error('setPageAllData(data: any) param wrong !!!');
        }
    }

    /**
     * 页面只读设置
     */
    setPageDisabledAll() {
        for(const group of this.pageConfig) {
            const oertaor = this.getDataOpertaorByGroupId(group.groupId);
            if(oertaor) {
                oertaor.setDisabledAll();
            }
        }
    }
    /**
     * 批改项设置
     */
    setPageUnDisabledByKeyList(list: any[]) {
        if(list && list.length > 0) {
            for(const group of this.pageConfig) {
                const oertaor = this.getDataOpertaorByGroupId(group.groupId);
                if(oertaor) {
                    oertaor.setUnDisabledByKeyList(list);
                }
            }
        }
    }

}

export type {GroupForm};
import {getProductPage} from "@/api/prod";
import {AnchorItem, GroupForm} from "@/views/pcis/composite/component";
import {CommonConstants} from "@/constants/CommonConstants";
import {clearCodeListViewByPageKey, clearDataOpertaorByPageKey, codeListViewStore, dataOpertaor} from "@/store";
import {getData} from "@/pcis/prodRef/dataInit";
import {initMultiCodeList} from "@/api/code-list-service";
import cargoApi from "@/api/cargo";

/**
 * 公共分组ID
 */
export const CommonGroupId = "group-000000";

// 组合出单场景
export const OpertaorPosit = "posit";

/**
 * 自定义组件类型
 */
export const CommonCustomCompType = "common-custom";

/**
 * 意健险组件
 */
const YjxPositCompMap = new Map<string, string[]>();
YjxPositCompMap.set('P26000176', ['yjxPlan060030', 'GrpMemberYjx060030']);

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
export interface CompositePageConfigType {
    pageConfig: GroupForm[],
    anchorConfig: AnchorItem[]
}

/**
 * @param callback(param1, parma2) 需要操作的逻辑方法; param1: dataOpertaor(group.groupId)，parma2：pageConfig forEach item
 */
export type LinkedCallbackType = (callback: (operator: any, group: GroupForm) => void) => void;
export interface LinkedOperationReturnType {
    /**
     * 执行遍历回调
     * @type LinkedCallbackType
     */
    executeForEach: LinkedCallbackType

    /**
     * 执行第一条
     * @type LinkedCallbackType
     */
    executeFirst: LinkedCallbackType
}

/**
 * 组合产品出单页面视图工具
 */
export class CompositePageView {
    public autoAssignTabKeys = reactive<string[]>([]) // 需要自动赋值检测的组件key
    public hiddenCompKeys = reactive<string[]>([]) // 需要隐藏的组件key
    public discardCompKeys = reactive<string[]>([]) // 需要删除的组件key
    public customCommonCompKeys = reactive<string[]>([]) // 需要自定义的公共组件key
    public activeAnchorId = reactive({value: ''}) // 窗口锚点当前激活的组件id
    public anchorConfig = reactive<AnchorItem[]>(new Array<AnchorItem>());
    public pageParams = reactive<any>({});
    public pageConfig = reactive<GroupForm[]>(new Array<GroupForm>());
    // 页面创建之前调用
    public beforeCreation?: (config: CompositePageConfigType) => Promise<CompositePageConfigType>;

    constructor() {
        this.activeAnchorId = reactive({value: ''})
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
                const props = ['cAppNo', 'cPlyNo', 'cCombinationNo', 'cPkId'];
                const formatList: any[] = [
                    {key: 'plyBase', pr: 'Base'},
                    {key: 'base', pr: 'Base'},
                    {key: 'applicant', pr: 'Applicant'},
                    {key: 'insured', pr: 'Insured'},
                ];
                formatList.forEach(format => {
                    if(data[format.key]) {
                        props.forEach(prop => {
                            const val = !item[prop] || item[prop] === '' ? undefined : item[prop];
                            data[format.key][format.pr + '.' + prop] = val;
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
                    CKindNo: item.cKindNo,
                    CGrpMrk: item.cGrpMrk,
                    CProdNo: item.cProdNo,
                    CProdNme: item.cProdNme,
                    CPlanNo: item.cPlanNo,
                    CPlanNme: item.cPlanNme,
                    CTermNo: item.cTermNo,
                }
            });
            const reqList: any = [];
            params.forEach((item: any) => {
                reqList.push(this.reqPageJson(item)); // 请求页面配置数据
                this.clear(item.CProdNo);  // 清除store
            });
            Promise.all(reqList).then(async (arrResult: any) => {
                const productSchemasMap: any = {};
                const compList: any[] = [];
                arrResult.forEach((obj: any) => {
                    const [[key, value]] = Object.entries(obj);
                    productSchemasMap[key] = value as Array<any>;
                    compList.push(productSchemasMap[key]);
                });
                const commonList = this.mergeViews(compList)
                    .filter((item: any) =>
                        CommonComponentMap.has(item['pageKey']) &&
                        !this.discardCompKeys.includes(item['pageKey'])
                    )
                    .map((common: any) => { // 替换公共组件 pageCode
                        const pageKey = common['pageKey'];
                        if(CommonComponentMap.has(pageKey)) {
                            common['pageCode'] = CommonComponentMap.get(pageKey);
                        }
                        common['id'] = `_${['dist', 'distSummary'].includes(common.pageKey)  ? common.pageCode : common.pageKey}-000000`
                        return common;
                    });
                // 设置需要自定义的公共组件
                this.setCustomCommonComp(commonList, arrResult)
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
                await this.installCodeListViewAndInit();
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

    private setCustomCommonComp(commonList: any[], pageList: any[]) {
        const resList: any[] = [];
        this.customCommonCompKeys.forEach(commonKey => {
            const resComp: any = {
                icon: "null",
                pageCode: commonKey,
                pageSchemaList: [],
                pageType: "common-custom"
            }
            pageList.forEach((obj: any) => {
                const [[key, value]] = Object.entries(obj);
                const prodNo = key as string;
                const compList = value as Array<any>;
                const comp = compList.find(item => [item.pageTable, item.pageKey, item.pageCode].includes(commonKey))
                if(comp) {
                    resComp.pageKey = commonKey
                    resComp.pageTtile = comp.pageTtile
                    resComp.pageTable = comp.pageTable
                    resComp.id = `_${comp.commonKey}-${prodNo}`
                    resComp.pageSchemaList.push({
                        cProdNo: prodNo,
                        ...comp
                    })
                }
            });
            resList.push(resComp)
        })
        console.log('resList', resList)
        commonList.push(...resList)
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
                cProdList: list.map(p => p.cProdNo)
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
            const cKindNo = config.params.cKindNo;
            const cProdNo = config.params.cProdNo;
            const cProdNme = config.params.cProdNme;
            const cPlanNo = config.params.cPlanNo;
            const cPlanNme = config.params.cPlanNme;

            const anchor: AnchorItem = {
                id: cProdNo,
                title: index !== 0 ? `${cProdNo}-${config.params.cProdNme}` : config.params.cProdNme,
                expanded: true,
                children: config.pageInfo
                    .filter((item: any) => !this.hiddenCompKeys.includes(item['pageKey']))
                    .map((item: any) => {
                    const id = `_${item.pageKey === 'dist' || item.pageKey === 'distSummary' ? item.pageCode : item.pageKey}-${cProdNo}`;
                    const childrenItem: AnchorItem = {
                        id: id,
                        title: index !== 0 ? `${cProdNo}-${item.pageTtile}` : item.pageTtile,
                        icon: item.icon,
                        expanded: true,
                        tabKey: item.pageKey === 'dist' || item.pageKey === 'distSummary' ? item.pageCode : item.pageKey,
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
                const compKeys = [item.pageTable, item.pageKey, item.pageCode]
                if(CommonComponentMap.has(item.pageKey)) {
                    return !commonCodes.includes(CommonComponentMap.get(item.pageKey));
                }
                // 暂时屏蔽联共保组件
                if(this.discardCompKeys.some(k => compKeys.includes(k))) {
                    return false
                }
                // 去除自定义公共组件
                if(this.customCommonCompKeys.some(k => compKeys.includes(k))) {
                    return false
                }
                return !commonCodes.includes(item.pageCode)
            });
            productFromSchemas.push({
                groupId: `group-${prodInfo.cProdNo}`,
                showGroupId: false,
                pageInfo: pageInfo.map((item: any) => {
                    item['id'] = `_${
                        item.pageType === CommonCustomCompType ? item.pageTable :
                            (item.pageKey === 'dist' || item.pageKey === 'distSummary' ? item.pageCode : item.pageKey)
                    }-${prodInfo.cProdNo}`;
                    return item;
                }),
                params: {...this.pageParams, ...prodInfo}
            });
        }
        return productFromSchemas;
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

    private mergeViews(viewsList: any[][]): any[] {
        const viewsArrays: any[][] = viewsList
            .filter(item => !YjxPositCompMap.keys().some(key => YjxPositCompMap.get(key)?.includes(item[0].pageCode)))
            .map((item: any[]) => {
                return item.filter(i => CommonComponentMap.has(i.pageKey));
            });
        const pageCodeSets = viewsArrays.map(views => {
            const codes = new Set<string>();
            views.forEach(view => codes.add(view.pageKey));
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
            const baseView = viewsArrays.flat().find(view => view.pageKey === code);
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
                if (intersection.has(view.pageKey)) {
                    const data = pageCodeData.get(view.pageKey);
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
                fromSchema: mergeFromSchemas(data.fromSchemas)
            }
        })) as any[];
    }


    /**请求指定产品的页面配置数据**/
    private async reqPageJson(param: any) {
        const result: any = {};
        const {CKindNo, CProdNo, CGrpMrk, CPlanNo} = param;
        const key = CKindNo === '06' ? CPlanNo : CProdNo;
        const reqKey = key  + '_' + CGrpMrk;
        const sessionInfo = sessionStorage.getItem(reqKey);
        if(!sessionInfo) {
            let data;
            if(CKindNo === '06') { //  意健险组件获取
                const productPage = await cargoApi.getECargoPageView({
                    'compKeyList': YjxPositCompMap.get(key)
                });
                data = productPage.data;
            }else {
                const productPage = await getProductPage(param);
                data = JSON.parse(productPage.data);
            }

            if(!data) {
                ElMessage.error(`页面配置信息获取失败-${reqKey}`);
                throw new Error('页面配置信息获取失败 -> ', data)
            }
            result[param.CProdNo] = data[0].pageInfo;
            // 存入当前会话session 下一次获取优先从session里拿
            sessionStorage.setItem(reqKey, JSON.stringify(data[0].pageInfo));
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

    /**
     * 初始化所有产品的codelist
     * @private
     */
    private async installCodeListViewAndInit() {
        const setAllCodeList = (groupForm: GroupForm) => {
            const codeListStore = codeListViewStore({id: groupForm.groupId});
            const isDisabled = (v: any) => {
                if (
                    v === true ||
                    v === 1 ||
                    v === "1"
                ) {
                    return true;
                } else {
                    return false;
                }
            }
            const codeList: any = {};
            const pageInfo = groupForm.pageInfo
            if(pageInfo){
                for(let i = 0; i < pageInfo.length; i++){
                    if(['acctinfo','ci','ourCompanyCiShare'].includes(pageInfo[i]['pageKey'])){
                        continue;
                    }
                    const schema = pageInfo[i].pageSchema;
                    if(schema && schema.fromSchema && schema.fromSchema.length>0){
                        for(let j = 0; j < schema.fromSchema.length; j++){
                            const sc = schema.fromSchema[j];
                            if((sc.inputtype === 'rtSelectV2' || sc.inputtype === 'rtselect') && !isDisabled(sc.disabled) && sc.typeCode){
                                const k = sc.typeCode + (sc.codeParam?sc.codeParam:'');
                                const m = {codeListName:sc.typeCode,codeListParam:sc.codeParam,source:k};
                                codeList[k] = m;
                            }
                        }
                    }
                }
            }
            const codeparam: any[] = [];
            Object.keys(codeList).forEach(res =>{
                if(res !== "Occupt_ZYLB") {
                    codeparam.push(codeList[res]);
                }
            });
            return new Promise((resolve, reject) => {
                initMultiCodeList(codeparam).then((result: any) => {
                    if(result.code === 200) {
                        for(let i = 0; i < result.data.length ; i++){
                            codeListStore.setOptionsToCacheMap(result.data[i]['key'],result.data[i]['data']);
                        }
                    }
                    resolve(true)
                })
            })
        }

        const initList: any[] = [];
        this.pageConfig.forEach(group => initList.push(setAllCodeList(group)));
        const list = await Promise.all(initList);
        console.log('installCodeListViewAndInit-list', list)
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
     * @param exclude 需要排除的groupId
     * @return LinkedOperationReturnType
     */
    linkedOperation(exclude: string[] = [CommonGroupId]): LinkedOperationReturnType {
        const groupList = this.pageConfig.filter(f => !exclude || !exclude.includes(f.groupId))
        return {
            executeForEach: (callback: (operator: any, group: GroupForm) => void) => {
                groupList.forEach(item => {
                    const opertaor = this.getDataOpertaorByGroupId(item.groupId);
                    callback(opertaor, item);
                })
            },
            executeFirst: (callback: (operator: any, group: GroupForm) => void) => {
                const findLastGroup = groupList[0]
                if(findLastGroup) {
                    const opertaor = this.getDataOpertaorByGroupId(findLastGroup.groupId);
                    callback(opertaor, findLastGroup);
                } else {
                    console.warn('first group not found');
                }
            }
        } as LinkedOperationReturnType;
    }

    getDataOpertaorByProdNo(prodNo: string, params: any = {}) {
        return dataOpertaor({
            id: `group-${prodNo}`,
            type: OpertaorPosit,
            allDataFormat: this.allDataFormat,
            ...params
        });
    }
    getDataOpertaorByGroupId(groupId: string, params: any = {}) {
        return dataOpertaor({
            id: groupId,
            type: OpertaorPosit,
            allDataFormat: this.allDataFormat,
            ...params
        });
    }

    /**
     * 校验所有组件
     */
    validateAll(): Promise<{validate: boolean, result: Record<string, any>}> {
        return new Promise(async (resolve, reject) => {
            const result: Record<string, any> = {};
            for(const group of this.pageConfig) {
                const groupId = group.groupId;
                const oertaor = this.getDataOpertaorByGroupId(groupId);
                if(oertaor) {
                    const vald = await oertaor.validateAll();
                    result[groupId] = vald;
                    if(!vald) {
                        resolve({validate: false, result});
                    }
                }
            }
            resolve({validate: true, result: {}});
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
            const opertaor = this.getDataOpertaorByGroupId(groupId);
            if(opertaor) {
                result[cProdNo] = opertaor.getDataAll();
            }
        }

        // 意健险数据组装
        const prod06No = Object.keys(result).find(key => key.startsWith('06'))
        if(prod06No && result[prod06No]) {
            const prodDefNo = Object.keys(result).find(key => key !== '000000' && key !== prod06No)
            const prod06Keys = Object.keys(result[prod06No]);
            prodDefNo &&
            ['plyBase', 'base', 'applicant', 'insured'].forEach(key => {
                if(!prod06Keys.includes(key)) {
                    result[prod06No][key] = result[prodDefNo][key]
                }
            })
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
                const tabs = oertaor.getTableRefs()
                const titleBtnComps = ['payinfo', 'applicant', 'insured']
                titleBtnComps.forEach(key => {
                    if(tabs && tabs[key] && tabs[key].setDisabledAll) {
                        tabs[key].setDisabledAll(true)
                    }
                })
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

    clear(prodNo?: string) {
        console.log('################### clear', prodNo)
        if(!prodNo) {
            this.pageConfig.forEach((item: GroupForm) => {
                clearDataOpertaorByPageKey(item.groupId);
                clearCodeListViewByPageKey(item.groupId);
            })
        }else {
            const groupId = `group-${prodNo}`
            clearDataOpertaorByPageKey(groupId);
            clearCodeListViewByPageKey(groupId);
        }
    }

}


export const baseFormatKeys = [
    'Base.groupAmtCur',
    'Base.groupPrmCur',
    'Base.nAccidentLimit',
    'Base.nRmbAmt',
    'Base.nRmbPrm',
    'Base.nModifiedAccidentLimit',
    'Base.nAmt',
    'Base.nPerLimit',
    'Base.cCumulativeLimitManual',
    'Base.cAccidentLimitManual',
    'Base.nCumulativeLimitModified',
    'Base.cAmtCur',
    'Base.nPrm',
    'Base.cPrmCur'
];

/**
 * 自定义组件结构构建
 */
export class CustomStructure {

    constructor() {

    }

    /**
     * 根据组件的pageKey分组合并组件
     * @param compKey
     * @param schemaList
     */
    groupBuild(compKey?: string, schemaList?: any[]) {
        console.log(compKey, schemaList)

        if(schemaList && schemaList.length > 0) {
            const schemaGroup = this.groupByPageKey(schemaList, 'pageKey')
            console.log('schemaGroup', schemaGroup)
            const resultSchemaList: any[] = []
            Object.entries(schemaGroup).forEach(([key, schema], index) => {
                console.log(index, key, schema)
                const resultSchema: any = {}
                if(schema && schema.length > 0) {
                    Object.assign(resultSchema, schema[0])
                }
                // 合并组件要素
                if(schema && schema.length > 1) {
                    const mergeSchemas = mergeFromSchemas(schema.map((m: any) => [...m.pageSchema.fromSchema]))
                    resultSchema['pageSchema'].fromSchema = mergeSchemas
                }
                resultSchemaList.push(resultSchema)
            })
            return resultSchemaList;
        }
        return undefined
    }

    groupByPageKey(items: any[], groupKey: string): Record<string, any[]> {
        return items.reduce((groups, item) => {
            const key = item[groupKey];
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {} as Record<string, any[]>);
    }

    /**
     * 组件差异要素分组处理
     * @param pageSchema
     * @param prodList
     */
    diffGroupBuild(pageSchema: any, prodList: any[], formatKeys: string[]) {
        console.log('pageSchema', pageSchema)
        console.log('prodList', prodList)
        const groupByList = prodList
            .filter((prod: any) => prod.cKindNo !== '06')
            .map((prod: any) => {
            return {
                id: prod.cProdNo,
                title: `${prod.cProdNo} ${prod.cProdNme}`
            }
        })
        const resultFromSchema: any[] = []
        const resultPageSchema: any = {
            ...pageSchema,
            fromUi: {
                ...pageSchema.fromUi,
                groupBy: [...groupByList, {id: '000000', title: '公共信息'}]
            },
            fromSchema: resultFromSchema
        }
        const copyFromSchema = [...pageSchema.fromSchema]
        const formatPropList = copyFromSchema.filter((prop: any) => formatKeys.includes(prop.prop))
        const formatPropFun = (prodNo: string, item: any) => {
            const resItem = {...item}
            resItem.group = prodNo
            if(resItem.inputtype === 'rtinputgroup') {
                resItem.groupList = resItem.groupList.map((group: any) => formatPropFun(prodNo, group))
            }else {
                resItem.prop = `${prodNo}:${resItem.prop}`
            }
            return resItem;
        }

        prodList
            .filter((prod: any) => prod.cKindNo !== '06')
            .forEach((prod: any) => {
            const result = formatPropList.map((item: any) => {
                return formatPropFun(prod.cProdNo, item)
            })
            resultFromSchema.push(...result)
        })
        const commonFromSchema = copyFromSchema
            .filter((prop: any) => !formatKeys.includes(prop.prop))
            .map(item => {
                return {
                    ...item,
                    group: '000000'
                }
            })
        resultFromSchema.push(...commonFromSchema)
        console.log('resultPageSchema', resultPageSchema)
        return {
            pageSchema: resultPageSchema
        }
    }

}

/**
 * fromSchema合并函数
 * @param fromSchemas
 */
function mergeFromSchemas(fromSchemas: any[][]): any[] {
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
            }else if(item.rules && item.rules.length > 0) { // 有任意产品必填的 就需必填
                merged.splice(merged.findIndex((f: any) => item.prop === f.prop), 1, item);
            }
        }
    }
    return merged;
}

export function peelFormDataByProdNo(formData: any, prodNo: string): any {
    const resultData: any = {};
    if(formData) {
        Object.entries(formData).forEach(([key, value]) => {
            if(key.includes(prodNo)) {
                resultData[key.replace(`${prodNo}:`, '')] = value
            }else if(!key.includes(':')) {
                resultData[key] = value
            }
        })
    }
    return resultData
}

export function joinFormDataByProdNo(formData: any, prodNos: string[]): any {
    const resultData: any = {};
    if(formData) {
        Object.entries(formData).forEach(([key, value]) => {
            if(baseFormatKeys.includes(key)) {
                prodNos.forEach(prodNo => {
                    resultData[`${prodNo}:${key}`] = value
                })
            }else {
                resultData[key] = value
            }
        })
    }
    return resultData
}




export type {GroupForm};
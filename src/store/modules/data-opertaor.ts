import { defineStore } from "pinia";
import { useProductStore, useTagsViewStore } from "@/store";
import { eventBus } from "@/utils/event-bus";
import {CommonCustomCompType, OpertaorPosit} from "@/views/pcis/support/composite.types";

interface OpertaorProps {
    // 唯一键
    id: string;
    // 类型
    type?: string;
    // 格式化页面数据
    allDataFormat?: (id: string, pageData: any) => any
    // 自定义公共组件场景获取pageInfo
    convertGetCommonConfig?: (id: string) => any
}

type StoreCache = Map<string, ReturnType<typeof defineStore>>
const dataOpertaorMap: StoreCache = new Map();

export const dataOpertaor = (props: OpertaorProps) => {
    const {id, type,  allDataFormat, convertGetCommonConfig} = props;
    return storeFactory(id, defineStore(`dataOpertaor-${id}`, () => {

        const productStore = useProductStore();
        const tableConfig = reactive<Array<any>>([]);
        const tableRefs = reactive<Record<string, any>>({});
        const param = reactive<any>({});
        const fatherPage = reactive<any>({});

        const setFatherPage = (page: any) => {
            Object.assign(fatherPage, page);
        };

        const getFatherPage = () => {
            return fatherPage;
        };
        const setParam = (params: any) => {
            Object.assign(param, params);
        };

        const getParam = () => {
            return param;
        };
        const setTableConfig = (config: any) => {
            Object.assign(tableConfig, config);
        };

        const getTableConfig = () => {
            return tableConfig;
        };

        const setTableRefs = (tablerefs: any) => {
            Object.assign(tableRefs, tablerefs);
        };
        const getTableRefs = () => {
            return tableRefs;
        };
        const getTableRefByKey = (key: string) => {
            return tableRefs[key];
        };
        const init = () => {
            Object.assign(param, {});
            Object.assign(tableConfig, {});
            Object.assign(tableRefs, {});
        };
        const addTableRef = (key: string, tableref: any) => {
            tableRefs[key] = tableref;
        };

        const setDataAll = (alldata: any) => {
            param.initFlag = true;
            Object.keys(alldata).forEach((key) => {
                if (tableRefs[key] && tableRefs[key].setFormValue && Object.keys(alldata[key]).length != 0) {
                    tableRefs[key].setFormValue(alldata[key], id);
                }
            });
            nextTick(() => {
                param.initFlag = false;
            });
        };

        const getDataAll = () => {
            const keys = Object.keys(tableRefs);
            const res = {};
            const ci = productStore.checkCiMrk();
            keys.forEach(key => {
                try {
                    if (!ci && (key === 'ci' || key === 'ciMasterAgreement' || key === 'ourCompanyCiShare')) {
                        //: 再保时,不再获取这3个组件的数据
                    } else {
                        res[key] = JSON.parse(JSON.stringify(tableRefs[key].getFromValue(id)));
                    }
                } catch (error) {
                    // console.log('方法不存在或出现错误，跳过执行');
                }
            });
            console.log(`############## -> getDataAll() ${id}`)
            // 组合出单场景
            if(type === OpertaorPosit) {
                if(allDataFormat && typeof allDataFormat === 'function') {
                    const allFData = allDataFormat(id, res)
                    if(allFData) return allFData;
                }
            }
            return res;
        };
        const setReadOnly = (formconfig: any) => {
            formconfig.forEach(page => {
                if (page.pageInfo && page.pageInfo.length > 0) {
                    page.pageInfo.forEach(info => {
                        const fsch = info.pageSchema;
                        setread(fsch);
                    })
                }
            });
        }

        const readTab = ['plyBase','base','payinfo'];
        const readAppProp = ['Applicant.cAppNme','Applicant.cClntMrk','Applicant.cCertfCls','Applicant.cCertfCde',
                             'Insured.cInsuredNme','Insured.cClntMrk','Insured.cCertfCls','Insured.cCertfCde',
                             'Base.tInsrncBgnTm','Base.tInsrncEndTm'
                            ];
        const setAddData = (formconfig: any) => {
            console.log('数据补全');

            formconfig.forEach(page => {
                if (page.pageInfo && page.pageInfo.length > 0) {
                    page.pageInfo.forEach(info => {
                        const fsch = info.pageSchema;
                        if(readTab.includes(info.pageKey)){
                            setread(info.pageSchema);
                        }
                        if(info.pageKey === 'base'){
                            fsch.editFlag = true;
                            fsch.fromSchema.forEach(item => {
                                if(item.prop === 'Base.nAccidentLimit'){  //单独放开,每次事故赔偿限额字段
                                    item.disabled = false;
                                }
                            })
                        }
                        if(info.pageKey === 'plyBase'){
                            fsch.editFlag = true;
                            fsch.fromSchema.forEach(item => {
                                if(item.prop === 'Base.cSlsId'){          //单独放开,业务员编号
                                    item.disabled = false;
                                }
                            })
                        }
                        if(info.pageKey === 'applicant' || info.pageKey === 'insured' || info.pageKey === 'insrnc'){
                            fsch.fromSchema.forEach(item => {
                                if(readAppProp.includes(item.prop)){
                                    item.disabled = 1;
                                }
                            })
                        }
                        if(info.pageKey === 'applicant' || info.pageKey === 'insured' || info.pageKey === 'cvrg'){
                            if (fsch.titleBtns && fsch.titleBtns.length > 0) {
                                fsch.titleBtns.forEach((item) => {
                                    if(item.id !== 'selectGoods'){
                                        item.hidden = true;
                                    }
                                    
                                });
                            }
                            if (fsch.endBtns && fsch.endBtns.length > 0) {
                                fsch.endBtns.forEach((item) => {
                                    item.hidden = true;
                                });
                            }
                        }
                    })
                }
            });
        }

        const setread = (fsch: any) => {
            fsch.editFlag = false;
            if (fsch.fromSchema && fsch.fromSchema.length > 0) {
                fsch.fromSchema.forEach(f => {
                    if (f.inputtype === 'rtinputgroup') {
                        f.groupList.forEach((gkey: any) => {
                            gkey.disabled = true;
                        });
                    } else {
                        f.disabled = true;
                    }
                    if (f.btnItems) {
                        f.btnItems.disabled = true;
                    }

                });
            }
            if (
                fsch.titleBtns &&
                fsch.titleBtns.length > 0
            ) {
                fsch.titleBtns.forEach((item) => {
                    item.hidden = true;
                });
            }
            if (fsch.endBtns && fsch.endBtns.length > 0) {
                fsch.endBtns.forEach((item) => {
                    item.hidden = true;
                });
            }
            if (fsch.editBtns && fsch.editBtns.length > 0) {
                fsch.editBtns.forEach((item) => {
                    item.hidden = true;
                });
            }
        }
        const setDisabledAll = (targetKeys?: string[]) => {
						// 如果传了 targetKeys，只处理这些 key；否则处理所有 key
						const keysToProcess = targetKeys && targetKeys.length > 0
						? targetKeys.filter(key => tableRefs.hasOwnProperty(key)) // 确保 key 存在
						: Object.keys(tableRefs);
            keysToProcess.forEach(key => {
                if (tableRefs[key] && tableRefs[key].getFormconfig) {
                    // 配置层面已经实现只读,这里不再实现
                    const f = tableRefs[key].getFormconfig();
                    if (f.fromType === 'free') {  // 表单模式时,修改表单disabled实现只读
                        if (f.fromSchema && f.fromSchema.length > 0) {
                            f.fromSchema.forEach(f => {
                                if (f.inputtype === 'rtinputgroup') {
                                    f.groupList.forEach((gkey: any) => {
                                        gkey.disabled = true;
                                    });
                                } else {
                                    f.disabled = true;
                                }
                                if (f.btnItems) {
                                    f.btnItems.disabled = true;
                                }

                            });
                        }
                    } else if (f.fromType === 'grid') { // 表格模式时,修改表格属性,实现只读
                        f.editFlag = false;
                    } else 
                    if (f.fromType === 'custom') {
                        if (tableRefs[key].setDisabledAll) {
                            tableRefs[key].setDisabledAll();
                        }
                    }
                }
            });
        }
        const setUnDisabledByKeyList = (list: any[], cRsnCde?: any, cProdNo?: any) => {
            if (list && list.length > 0) {
                list.forEach((item: string) => {
                    Object.keys(tableRefs).forEach(key => {
                        // 批改原因为变更清单、增加清单、减少清单时，清单才能放开，其他批改原因放开时需要区分免赔和清单
												// 02大类除了020014、020018以外产品，清单放开限制
												// 010022变更被保人信息把 客户清单信息批改项放开
                        if(!['10','ZQ','JQ','83'].includes(cRsnCde) && key.includes('Dist') && !['DeductibleDist','CustomerDist010022'].includes(key) && (!cProdNo?.startsWith('02') || ['020014','020018'].includes(cProdNo))) return;
                        if (tableRefs[key] && tableRefs[key].getFormconfig) {
                            const conf = tableRefs[key].getFormconfig();
                            if (!item.startsWith('Btn_')) { // 非按钮控制
                                if (conf.fromType === 'free') {  // 表单模式时,修改表单disabled实现只读
                                    if (conf.fromSchema && conf.fromSchema.length > 0) {
                                        conf.fromSchema.forEach(f => {
                                            if (f.prop === item) {
                                                if (f.inputtype === 'rtinputgroup') {
                                                f.groupList.forEach((gkey: any) => {
                                                    gkey.disabled = false;
                                                });
                                                }else if(f.btnItems){
                                                    f.btnItems.disabled = false;
                                                }
                                                else{
                                                    // console.log(f);
                                                    f.disabled = false;
                                                }
                                            }
                                        });
                                    }
                                } else if (conf.fromType === 'grid') { // 表格模式时,修改表格属性,实现只读
                                    if (conf.fromSchema && conf.fromSchema.length > 0) {
                                        conf.fromSchema.forEach(gf => {
                                            if (gf.prop === item) {
                                                gf.disabled = false;
                                                conf.editList.push(gf.prop);
                                            }
                                        });
                                    }
                                }
                            } else {// 按钮控制
                                if (conf.fromType !== 'custom') {
                                    if (
                                        conf.titleBtns &&
                                        conf.titleBtns.length > 0
                                    ) {
                                        conf.titleBtns.forEach((t) => {
                                            if ('Btn_' + t.id === item) {
                                                t.hidden = false;
                                            }
                                        });
                                    }
                                    if (conf.endBtns && conf.endBtns.length > 0) {
                                        conf.endBtns.forEach((t) => {
                                            if ('Btn_' + t.id === item) {
                                                t.hidden = false;
                                            }
                                        });
                                    }
                                } else {
                                    tableRefs[key].setUnDisabledByKeyList(item);
                                }

                            }
                        }
                    })
                })
            } else {
                Object.keys(tableRefs).forEach(key => {
                    if (tableRefs[key] && tableRefs[key].getFormconfig) {
                        const conf = tableRefs[key].getFormconfig();
                        if (conf.fromType === 'custom') {
                            tableRefs[key].setUnDisabledByKeyList();
                        }
                    }
                })
            }
            eventBus.emit('setUnDisabledDone', true)
        }

        const mapSetData = (data) => {
            const res1 = {}; //临时存放抽离数据
            const pageInfo = [...tableConfig[0]['pageInfo']];
            const schema = {};

            if(type === OpertaorPosit) {
                // 组合出单场景 载入自定义公共组件
                if(convertGetCommonConfig && typeof convertGetCommonConfig === 'function') {
                    const comps = convertGetCommonConfig(id)
                    if(comps) {
                        pageInfo.push(...comps)
                    }
                }
            }

            pageInfo.forEach((k) => {
                const pageKey = k["pageKey"];
                if (!data[pageKey]) {
                res1[pageKey] = {};
                schema[pageKey] = k["pageSchema"];
                }
            });

            Object.keys(res1)?.forEach((k) => {
                const sc = schema[k];
                if (sc && sc["fromSchema"] && sc["fromSchema"].length > 0) {
                const fromSchema = sc["fromSchema"];
                fromSchema.forEach((f) => {
                    if (f.inputtype === "rtinputgroup") {
                    const grouplist = f.groupList;
                    if (grouplist && grouplist.length > 0) {
                        grouplist.forEach((g) => {
                        const gprop = g["prop"]; // 抽离需要的数据
                        const gd = getDatabykey(gprop, data);
                        if (gd) {
                            res1[k][gprop] = gd;
                        }
                        });
                    }
                    } else {
                    const prop = f["prop"]; // 抽离需要的数据
                    const d = getDatabykey(prop, data);
                    if (d) {
                        res1[k][prop] = d;
                    }
                    }
                });
                }
            });

            return res1;
        };

        const getDatabykey = (key: string, data: any) => {
            let r = null;
            Object.keys(data).forEach((d) => {
                if (d === key) {
                    r = data[d];
                }
            });
            return r;
        }
        /**
         * @Title: 转换数据
         * result 页面数据
         */
        const convertData = (result: any) => {
            const res = {};
            const data = result['res']['composition'];
            const res1: any = {};  //临时存放抽离数据
            const pageInfo = [...tableConfig[0]['pageInfo']];
            const schema: any = {};

            if(type === OpertaorPosit) {
                // 组合出单场景 载入自定义公共组件
                if(convertGetCommonConfig && typeof convertGetCommonConfig === 'function') {
                    const comps = convertGetCommonConfig(id)
                    if(comps) {
                        pageInfo.push(...comps)
                    }
                }
            }
            pageInfo.forEach((k: any) => {
                const pageKey = k['pageKey'];
                if (!data[pageKey]) {
                    res1[pageKey] = {};
                    schema[pageKey] = k['pageSchema'];
                }
            });
            Object.keys(res1)?.forEach(k => {
                const sc = schema[k];
                if (sc && sc['fromSchema'] && sc['fromSchema'].length > 0) {
                    const fromSchema = sc['fromSchema'];
                    fromSchema.forEach(f => {
                        if (f.inputtype === 'rtinputgroup') {
                            const grouplist = f.groupList;
                            if (grouplist && grouplist.length > 0) {
                                grouplist.forEach(g => {
                                    const gprop = g['prop']; // 抽离需要的数据
                                    const gd = getDataByKey(gprop, data);
                                    if (gd == 0 || gd) {
                                        res1[k][gprop] = gd;
                                    }
                                })
                            }
                        } else {
                            const prop = f['prop']; // 抽离需要的数据
                            const d = getDataByKey(prop, data);
                            if (d == 0 || d) {
                                res1[k][prop] = d;
                            }
                        }
                    });
                }
            });
            pageInfo.forEach((k) => {
                const tab = k['pageType']; // 根据key获取tab 然后判断是否是GridEdit或FreeEdit
                const voNme = k['pageKey'];
                let da = {};
                if (res1[voNme]) {
                    da = res1[voNme];
                } else {
                    if (!!tab && 'free' === tab) {
                        da = (data[voNme] instanceof Array && data[voNme].length > 0) ? data[voNme][0] : data[voNme];
                    } else
                        if (!!tab && 'grid' === tab) {
                            da = data[voNme];
                        } else
                            if (!!tab && 'custom' === tab) {
                                da = data[voNme];
                            }
                }
                res[voNme] = da;
            });
            return res;
        }
        const getDataByKey = (key: string, data: any) => {
            let r = null;
            Object.keys(data).forEach((k) => {
                if (data[k] && data[k].length > 0) {
                    Object.keys(data[k][0]).forEach((d) => {
                        if (d === key) {
                            r = data[k][0][d];
                            delete data[k][0][d];
                        }
                    });
                }
            });
            return r;
        }
        const validateAll = async (): Promise<boolean> => {
            // 1. 收集所有验证Promise并保留对应key
            const entries = Object.entries(tableRefs); // 保留[key, ref]的映射关系
            const ci = productStore.checkCiMrk();
            const validationPromises = entries.map(([key, ref]) => {
                if (key === 'cvrg') {
                    return null;
                } else if (!ci && (key === 'ci' || key === 'ciMasterAgreement' || key === 'ourCompanyCiShare')) {
                    return null;
                } else {
                    return ref?.validate?.(id)
                }
            });
            let cv = true;
            if(tableRefs['cvrg']) {
                // 险别验证独立完成
                cv = await tableRefs['cvrg'].validate();
            }
            // 2. 等待所有Promise完成并关联结果与key
            const results = await Promise.all(validationPromises);
            // 3. 关联每个结果与对应的key
            const resultMapping = entries.map(([key, ref], index) => (
                {
                    key,
                    result: results[index],
                    refs: ref
                }));

            const pageObj = getTableConfig();
            // 4. 汇总结果（示例：收集所有失败的key）
            const failedKeys = resultMapping
                .filter(item => item.result === false)
                .map(item => {
                    console.log("失败的表单key:" + item.key);

                    pageObj.forEach((page: any) =>{
                        const info = page.pageInfo;
                        info.forEach((i: any) =>{
                            if(i.pageKey === item.key){
                                ElMessage.error(i.pageTtile + '存在验证失败数据，请确认！');
                            }
                        })
                    })
                    return item.key
                });

                if(!cv){
                    ElMessage.error('保障信息存在验证失败数据，请确认！');
                }
            // 5. 返回验证结果和失败详情
            const isValid = failedKeys.length === 0;
            return isValid && cv;
        }
        /**
         * 首字母转换小写
         */
        const firstCharLower = (str: string) => {
            return str.replace(/\b(\w)(\w*)/g, function ($0, $1, $2) {
                return $1.toLowerCase() + $2;
            });
        }
        /** 判断场景是否可编辑 */
        const isEditScene = () => {
            if(param.pageType === "TEMPORARY_DEPOSIT" || param.pageType === "EDR_APP_NEW_SCENE" ){
                return true;
            }else{
                return false;
            }
        }
        /** 判断场景是否只读 */
        const isReadOnlyScene = () => {
            const param = getParam();
            if(param.pageType === "readonly" || param.pageType === "UW_READ_SCENE"){
                return true;
            }else{
                return false;
            }
        }
        const getProps = () => {
            return props;
        }
        return {
            setTableConfig,
            getTableConfig,
            setTableRefs,
            getTableRefs,
            getTableRefByKey,
            init,
            addTableRef,
            setDataAll,
            getDataAll,
            setParam,
            getParam,
            convertData,
            setFatherPage,
            getFatherPage,
            firstCharLower,
            setDisabledAll,
            setAddData,
            setUnDisabledByKeyList,
            validateAll,
            setReadOnly,
            mapSetData,
            isEditScene,
            isReadOnlyScene,
            getProps
        };
    },
    {
        persist: {
            enabled: true,
            strategies: [
                {
                    storage: localStorage,
                    paths: ["tableConfig", "tableRefs", "param", "fatherPage"],
                },
            ],
        },
    })
);
}

/**
 * 缓存清理
 * @param pageKey 
 */
export function clearDataOpertaorByPageKey(pageKey: string) {
    const del = (key: string) => {
        const store = dataOpertaorMap.get(key);
        store?.$dispose?.();
        dataOpertaorMap.delete(key);
    }
    if(pageKey === 'posite-page') {
        dataOpertaorMap.keys().forEach(key => {
            if(key.startsWith('group-')) {
                del(key)
            }
        })
    }else if (dataOpertaorMap.has(pageKey)) {
        del(pageKey)
    }
}


/**
 * 缓存管理
 */
function storeFactory(
    storeId?: string,
    newStore?: ReturnType<typeof defineStore>
) {
    // const tagsViewStore = useTagsViewStore();
    // const { selectedView } = toRefs(tagsViewStore);
    // const pageKey = selectedView.value?.name;
    const pageKey = storeId;
    const storeRef = ref();
    if(!pageKey) {
        storeRef.value = {};
    }else if (dataOpertaorMap.has(pageKey)) {
        storeRef.value = dataOpertaorMap.get(pageKey)
    }else if (newStore) {
        storeRef.value = newStore();
        dataOpertaorMap.set(pageKey, storeRef.value);
    }
    return storeRef.value;
}


export type {OpertaorProps};

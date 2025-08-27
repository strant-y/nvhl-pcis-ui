import { defineStore } from "pinia";
import { useProductStore, useTagsViewStore } from "@/store";

interface OpertaorProps {
    id: string;
    type?: string;
}

type StoreCache = Map<string, ReturnType<typeof defineStore>>
const dataOpertaorMap: StoreCache = new Map();

export const dataOpertaor = (props: OpertaorProps) => {
    const {id, type} = props;
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
                    tableRefs[key].setFormValue(alldata[key]);
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
                        res[key] = JSON.parse(JSON.stringify(tableRefs[key].getFromValue()));
                    }
                } catch (error) {
                    // console.log('方法不存在或出现错误，跳过执行');
                }
            });
            return res;
        };
        const setReadOnly = (formconfig: any) => {
            formconfig.forEach(page => {
                if (page.pageInfo && page.pageInfo.length > 0) {
                    page.pageInfo.forEach(info => {
                        const fsch = info.pageSchema;
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
                    })
                }
            });
        }
        const setDisabledAll = () => {
            Object.keys(tableRefs).forEach(key => {
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
                    // if (
                    //     f.titleBtns &&
                    //     f.titleBtns.length > 0
                    // ) {
                    //     f.titleBtns.forEach((item) => {
                    //         item.hidden = true;
                    //     });
                    // }
                    // if (f.endBtns && f.endBtns.length > 0) {
                    //     f.endBtns.forEach((item) => {
                    //         item.hidden = true;
                    //     });
                    // }
                }
            });
        }
        const setUnDisabledByKeyList = (list: any[]) => {
            if (list && list.length > 0) {
                list.forEach((item: string) => {
                    Object.keys(tableRefs).forEach(key => {
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
        }

        const mapSetData = (data) => {
            const res1 = {}; //临时存放抽离数据
            const pageInfo = tableConfig[0]["pageInfo"];
            const schema = {};
            pageInfo.forEach((k) => {
                const pageKey = k["pageKey"];
                if (!data[pageKey]) {
                res1[pageKey] = {};
                schema[pageKey] = k["pageSchema"];
                }
            });

            Object.keys(res1)?.forEach((k) => {
                const sc = schema[k];
                if (sc["fromSchema"] && sc["fromSchema"].length > 0) {
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
         */
        const convertData = (result) => {
            const res = {};
            const data = result['res']['composition'];
            const res1 = {};  //临时存放抽离数据
            const pageInfo = tableConfig[0]['pageInfo'];
            const schema = {};
            pageInfo.forEach((k) => {
                const pageKey = k['pageKey'];
                if (!data[pageKey]) {
                    res1[pageKey] = {};
                    schema[pageKey] = k['pageSchema'];
                }
            });
            Object.keys(res1)?.forEach(k => {
                const sc = schema[k];
                if (sc['fromSchema'] && sc['fromSchema'].length > 0) {
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
                    return ref?.validate?.()
                }
            });
            // 险别验证独立完成
            const cv = await tableRefs['cvrg'].validate();
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
                    ElMessage.error('条款信息存在验证失败数据，请确认！');
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
            setUnDisabledByKeyList,
            validateAll,
            setReadOnly,
            mapSetData,
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
    if (dataOpertaorMap.has(pageKey)) {
        const store = dataOpertaorMap.get(pageKey);
        store?.$dispose?.();
        dataOpertaorMap.delete(pageKey);
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
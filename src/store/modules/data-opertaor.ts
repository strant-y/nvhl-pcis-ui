import en from "@/lang/package/en";
import path from "path";
import { defineStore } from "pinia";

export const dataOpertaor = defineStore(
    "dataOpertaor",
    () => {
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
            Object.assign(tableConfig, {});
            Object.assign(tableRefs, {});
        };
        const addTableRef = (key: string, tableref: any) => {
            tableRefs[key] = tableref;
        };

        const setDataAll = (alldata: any) => {
            Object.keys(alldata).forEach((key) => {
                if (tableRefs[key] && tableRefs[key].setFormValue && Object.keys(alldata[key]).length != 0) {
                    tableRefs[key].setFormValue(alldata[key]);
                }
            });
        };

        const getDataAll = () => {
            const keys = Object.keys(tableRefs);
            const res = {};
            keys.forEach(key => {
                try {
                    res[key] = JSON.parse(JSON.stringify(tableRefs[key].getFromValue()));
                } catch (error) {
                    console.log('方法不存在或出现错误，跳过执行');
                }
            });
            return res;
        };
        const setDisabledAll = () => {
            Object.keys(tableRefs).forEach(key => {
                if (tableRefs[key] && tableRefs[key].getFormconfig) {
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
                    } else if (f.fromType === 'custom') {
                        tableRefs[key].setDisabledAll();
                    }
                    if (
                        f.titleBtns &&
                        f.titleBtns.length > 0
                    ) {
                        f.titleBtns.forEach((item) => {
                            item.hidden = true;
                        });
                    }
                    if (f.endBtns && f.endBtns.length > 0) {
                        f.endBtns.forEach((item) => {
                            item.hidden = true;
                        });
                    }
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
                                            if (f.inputtype === 'rtinputgroup') {
                                                f.groupList.forEach((gkey: any) => {
                                                    if (gkey.prop === item) {
                                                        gkey.disabled = false;
                                                    }
                                                });
                                            } else {
                                                if (f.prop === item) {
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
                            }
                        }
                    })
                })
            }
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
                        const prop = f['prop']; // 抽离需要的数据
                        const d = getDataByKey(prop, data);
                        if (d) {
                            res1[k][prop] = d;
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
            const validationPromises = entries.map(([key, ref]) => ref?.validate?.());

            // 2. 等待所有Promise完成并关联结果与key
            const results = await Promise.all(validationPromises);
            // 3. 关联每个结果与对应的key
            const resultMapping = entries.map(([key, ref], index) => (
                {
                    key,
                    result: results[index],
                    refs: ref
                }));

            // 4. 汇总结果（示例：收集所有失败的key）
            const failedKeys = resultMapping
                .filter(item => item.result !== true)
                .map(item => {
                    console.log("失败的表单key:" + item.key);
                    return item.key
                });

            // 5. 返回验证结果和失败详情
            const isValid = failedKeys.length === 0;

            return isValid;
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
    }
);

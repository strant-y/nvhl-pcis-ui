import {FreeButtonBase} from "@/shared/button-config";
import {AppFreeEditMethod} from "@/shared/app-free-edit-config";
import {AppGridEditMethod} from "@/shared/app-grid-edit-config";
import {AppTableMethod, MyTableMethod} from "@/shared/app-table-config";
import {CommonConstants} from "@/constants/CommonConstants";

export class FormPage {

    private componentRefMap = new Map<string, AppFreeEditMethod | AppGridEditMethod | AppTableMethod | MyTableMethod | any>();
    private buttonRefMap = new Map<string, FreeButtonBase | any>();
    private formConfig= new Array<any>();
    private initial: boolean = false;
    private readonly soleKey: string;

    constructor(pageId: string) {
        this.soleKey = pageId;
        // this.initial = true;
    }

    get config() {
        return this.formConfig;
    }
    get init() {
        return this.initial;
    }
    get constraint() {
        return this.soleKey;
    }
    setFormConfig(config: any) {
        this.formConfig.push(...config);
    }

    // 存储组件ref
    setComponentRef(componentCode: string, componentRef: any) {
        this.componentRefMap.set(componentCode, componentRef);
    }
    // 存储按钮ref
    setButtonRef(buttonId: string, buttonRef: FreeButtonBase | any) {
        this.buttonRefMap.set(buttonId, buttonRef);
    }

    /**
     * 获取指定组件的数据
     * @param id componentCode 组件唯一键
     */
    getFormDataById(id: string) {
        const comp = this.componentRefMap.get(id);
        if(comp && comp.getFormValue()) {
            return markRaw(comp.getFormValue());
        }else {
            return null;
        }
    }

    /**
     * 获取指定组件ref
     * @param id componentCode 组件唯一键
     */
    getComponentRefById(id: string): AppFreeEditMethod | AppGridEditMethod | AppTableMethod | MyTableMethod | any{
        return this.componentRefMap.get(id);
    }

    /**
     * 获取指定组件的配置信息
     * @param id
     */
    getComponentConfigById(id: string) {
        const comp = this.componentRefMap.get(id);
        if(comp) {
            return comp.getFormConfig()
        }else {
            return null
        }
    }

    /**
     * 获取指定组件的button
     * @param id
     */
    getFromBtnById(id: string) {
        const comp = this.componentRefMap.get(id);
        if(comp) {
            return comp.getFormBtn();
        }
        return null;
    }


    /**
     * 获取指定按钮ref
     * @param id
     */
    getPageBtnRefById(id: string) {
        return this.buttonRefMap.get(id);
    }


    /**
     * set指定组件的数据
     * @param id componentCode 组件唯一键
     * @param formData 组件绑定的值
     */
    setFormDataById(id: string, formData: any) {
        const comp = this.componentRefMap.get(id);
        if (comp) {
            comp.setFormValue(formData)
        } else {
        }
    }

    /**
     * 获取组件配置信息
     * @param id
     */
    getFormConfigById(id: string) {
        const comp = this.componentRefMap.get(id);
        if(comp) {
            return comp.getFormConfig();
        }else {
            return null;
        }
    }


    /**
     * 设置指定组件只读模式
     * @param id
     */
    setFormReadOnlyById(id: string, isDisabled: boolean) {
        nextTick(() => {
            const comp = this.componentRefMap.get(id);
            if (comp && comp.setDisabledAll) {
                comp.setDisabledAll(isDisabled);
            }
        });
    }

    /**
     * 设置页面只读模式
     * @param isDisabled
     * @param noSet 不需要设置只读的组件key数组
     * @param callback
     */
    setPageReadOnly(isDisabled: boolean, noSet: any[] = [], callback: any = undefined) {
        try{
            const keys = this.componentRefMap.keys();
            for (const key of keys) {
                if (noSet.includes(key)) continue;
                this.setFormReadOnlyById(key, isDisabled)
            }

            // const btnKeys = this.buttonRefMap.keys();
            // for (const key of btnKeys) {
            //     if(noSet.includes(key)) continue;
            //     const btnConfig = this.getPageBtnRefById(key);
            //     if(btnConfig) {
            //         btnConfig.disabled = true;
            //     }
            // }
            if (callback && callback.success && typeof callback.success === CommonConstants.TYPE_OF_FUNCTION) {
                callback.success()
            }
        } catch (e) {
            if(callback && callback.error && typeof callback.error === CommonConstants.TYPE_OF_FUNCTION) {
                callback.error(e);
            }else {
                throw e;
            }
        }
    }


    /**
     * 校验所有表单
     */
    validateAll(filter: string[] = []): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                const compKeys = this.componentRefMap.keys();
                for (const key of compKeys) {
                    if(filter.includes(key)) {
                        continue;
                    }
                    const comp = this.componentRefMap.get(key);
                    if (comp && comp.validate) {
                        const validate = await comp.validate();
                        if (!validate) {
                            const cfg = comp.getFormConfig();
                            resolve({
                                flag: false,
                                msg: `校验失败，请检查 ${cfg.title} ！`
                            });
                            return;
                        }
                    }
                }
                resolve({
                    flag: true
                })
            } catch (e) {
                resolve({
                    flag: false,
                    msg: `校验异常: ${e} ！`
                })
            }
        });
    }

    /**
     * 给所有组件set要比对的数据
     * @param AllData
     */
    setAllCompPrimevalData(AllData: any) {
        try {
            const keys = Object.keys(AllData);
            for (const key of keys) {
                const comp = this.componentRefMap.get(key);
                if (comp != null && comp != undefined && comp.addProvide) {
                    comp.addProvide(CommonConstants.PRIMEVAL_FORM_DAT_KEY, AllData[key])
                }
            }
        } catch (e) {
        }
    }

    /**
     * set所有指定组件的数据
     * @param AllData
     * @param callback
     */
    setAllFormData(AllData: any, callback: any = undefined) {
        try {
            const keys = Object.keys(AllData);
						this.initial = true;
            for (const key of keys) {
                const comp = this.componentRefMap.get(key);
                if (comp) {
                    comp.setFormValue(AllData[key]);
                } else {
                }
            }
            if (callback && callback.success && typeof callback.success === CommonConstants.TYPE_OF_FUNCTION) {
                callback.success(this.getAllFormData())
                setTimeout(() => {
                    this.initial = false;
                }, 3000)
            }
        } catch (e) {
            if(callback && callback.error && typeof callback.error === CommonConstants.TYPE_OF_FUNCTION) {
                callback.error(e);
            }else {
                throw e;
            }
        }
    }

    /**
     * 获取页面所有组件的数据
     */
    getAllFormData() {
        const allFormData: any = {};
        const compKeys = this.componentRefMap.keys();
        try {
            for (const key of compKeys) {
                try {
                    const comp = this.componentRefMap.get(key);
                    let formData = undefined;
                    if (comp && typeof comp.getFormValue === CommonConstants.TYPE_OF_FUNCTION) {
                        const data = comp.getFormValue();
                        if (data) {
                            if (Array.isArray(data)) {
                                formData = [...data];
                            } else {
                                formData = {...data};
                            }
                        }
                    } else {
                        throw new Error(' comp is undefined or getFormValue is not defined');
                    }
                    allFormData[key] = formData;
                } catch (e) {
                    console.error(e);
                    throw new Error('compKey for ' + key + e?.message)
                }
            }
        } catch (e) {
            ElMessage.error("加载异常，"+e?.message);
            throw e;
        }
        return allFormData;
    }

    /**
     * 设置批改项
     * @param list
     */
    setUnDisabledByKeyList(list: any[]){
        if (list && list.length > 0) {
            for(const edrItem of list) {
                const item = edrItem["cEdrItem"];
                const itemType = edrItem["cOperTyp"];
                const key = edrItem["cComponentKey"];
                const comp = this.componentRefMap.get(key);
                if (comp && comp.getFormConfig) {
                    const conf = comp.getFormConfig();
                    if (itemType === "M") { // 非按钮控制
                        if (conf.fromType === CommonConstants.FORM_EDIT_TYPE_FREE) {  // 表单模式时,修改表单disabled实现只读
                            if (conf.fromSchema && conf.fromSchema.length > 0) {
                                conf.fromSchema.forEach(f => {
                                    if (f.prop === item) {
                                        if (f.inputtype === CommonConstants.RT_ITEM_TYPE_INPUTGROUP) {
                                            f.groupList.forEach((gkey: any) => {
                                                gkey.disabled = false;
                                            });
                                        }else {
                                            f.disabled = false;
                                        }
                                    }
                                });
                            }
                        } else if (conf.fromType === CommonConstants.FORM_EDIT_TYPE_GRID) { // 表格模式时,修改表格属性,实现只读
                            if (conf.fromSchema && conf.fromSchema.length > 0) {
                                conf.fromSchema.forEach(gf => {
                                    if (gf.prop === item) {
                                        conf.editList.push(gf.prop);
                                    }
                                });
                            }
                        }
                    } else if(itemType === "B"){ // 按钮控制
                        if (conf.fromType === CommonConstants.FORM_EDIT_TYPE_CUSTOM) {
                            if(comp.setUnDisabledByKeyList) {
                                comp.setUnDisabledByKeyList(item);
                            }else {
                            }
                        }else {
                            if(comp.getFormBtn) {
                                const formBtn = comp.getFormBtn();
                                if (formBtn && formBtn[item]) {
                                    formBtn[item].hidden = false;
                                }
                            }else if([CommonConstants.FORM_EDIT_TYPE_FREE].includes(conf.fromType)) {
                            }
                            if(comp.getTableBtn) {
                                const tableBtn = comp.getTableBtn();
                                if (tableBtn && tableBtn[item]) {
                                    tableBtn[item].hidden = false;
                                }
                            }else if([CommonConstants.FORM_EDIT_TYPE_TABLE].includes(conf.fromType)){
                            }
                        }
                    }
                }
            }
        } else {
            const keys = this.componentRefMap.keys();
            for(const key of keys) {
                const comp = this.componentRefMap.get(key);
                if (comp && comp.getFormConfig) {
                    const conf = comp.getFormConfig();
                    if (conf.fromType === CommonConstants.FORM_EDIT_TYPE_CUSTOM) {
                        comp.setUnDisabledByKeyList();
                    }
                }
            }
        }
    }
		
		/**
		 * @Title: 转换数据
		 */
		convertData(result){
			const res = {};
			const data = result['data']['composition'];
			const res1 = {};  //临时存放抽离数据
			const pageInfo = this.formConfig[0]['pageInfo'];
			const schema = {};
			pageInfo.forEach((k) => {
				let pageKey = k['pageKey'];
					if (pageKey == 'SpecialAgreement') pageKey = 'ECargoSpecialAgreement'
					if (pageKey == 'ECargoPayinfo') pageKey = 'ECargoPay'
					if (pageKey == 'ECargoInsured') pageKey = 'ECargoInsuredDist'
					if (pageKey == 'ECargoTgtSummary') pageKey = 'ECargoDistSummary'
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
															const gd = this.getDataByKey(gprop, data);
															if (gd == 0 || gd) {
																	res1[k][gprop] = gd;
															}
													})
											}
									} else {
											const prop = f['prop']; // 抽离需要的数据
											const d = this.getDataByKey(prop, data);
											if (d == 0 || d) {
													res1[k][prop] = d;
											}
									}
							});
					}
			});
			pageInfo.forEach((k) => {
					const tab = k['pageType']; // 根据key获取tab 然后判断是否是GridEdit或FreeEdit
					let voNme = k['pageKey'];
					const voCde = k['pageCode'];
					let da = {};
					if (voNme == 'SpecialAgreement') voNme = 'ECargoSpecialAgreement'
					if (voNme == 'ECargoPayinfo') voNme = 'ECargoPay'
					if (voNme == 'ECargoInsured') voNme = 'ECargoInsuredDist'
					if (voNme == 'ECargoTgtSummary') voNme = 'ECargoDistSummary'
					if (res1[voNme]) {
							da = res1[voNme];
					} else {
							if (!!tab && 'free' === tab) {
									// da = (data[voNme] instanceof Array && data[voNme].length > 0) ? data[voNme][0] : data[voNme];
									da = data[voNme];
							} else
									if (!!tab && 'grid' === tab) {
											da = data[voNme];
									} else
											if (!!tab && 'custom' === tab) {
													da = data[voNme];
											}
					}
					res[voCde] = da;
			});
			return res;
		}
		getDataByKey(key: string, data: any){
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
}
import {FreeButtonBase} from "@/shared/button-config";
import {AppFreeEditMethod} from "@/shared/app-free-edit-config";
import {AppGridEditMethod} from "@/shared/app-grid-edit-config";
import {AppTableMethod, MyTableMethod} from "@/shared/app-table-config";

export class FormPage {

    private componentRefMap = new Map<string, AppFreeEditMethod | AppGridEditMethod | AppTableMethod | MyTableMethod | any>();
    private buttonRefMap = new Map<string, FreeButtonBase | any>();
    private formConfig= new Array<any>();
    private initial: boolean = false;

    constructor(pageId: string) {
        this.initial = true;
    }


    get config() {
        return this.formConfig;
    }
    get init() {
        return this.initial;
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
        nextTick(() => {
            const comp = this.componentRefMap.get(id);
            if (comp) {
                comp.setFormValue(formData)
            } else {
                console.error('Could not find componentRef for id ' + id)
            }
        })
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
    setFormReadOnlyById(id: string) {
        nextTick(() => {
            const comp = this.componentRefMap.get(id);
            if (comp) {
                comp.setDisabledAll();
            }
        });
    }

    /**
     * 设置页面只读模式
     * @param id
     * @param noSet 不需要设置只读的组件key数组
     */
    setPageReadOnly(noSet: any[] = []) {
        nextTick(() => {
            const keys = this.componentRefMap.keys();
            for (const key of keys) {
                if (noSet.includes(key)) continue;
                this.setFormReadOnlyById(key)
            }
        });
        const btnKeys = this.buttonRefMap.keys();
        // for (const key of btnKeys) {
        //     const btnConfig = this.getPageBtnRefById(key);
        //     if(btnConfig) {
        //         btnConfig.disabled = true;
        //     }
        // }
    }


    /**
     * set所有指定组件的数据
     * @param AllData
     */
    setAllFormData(AllData: any) {
        nextTick(() => {
            const keys = Object.keys(AllData);
            for(const key of keys) {
                const comp = this.componentRefMap.get(key);
                if(comp) {
                    comp.setFormValue(AllData[key]);
                }else {
                    console.error('Could not find componentRef for id ' + key)
                }
            }
            this.initial = false;
        })
    }

    /**
     * 获取页面所有组件的数据
     */
    getAllFormData() {
        const allFormData: any = {};
        const compKeys = this.componentRefMap.keys();
        for (const key of compKeys) {
            const comp = this.componentRefMap.get(key);
            let formData = undefined;
            if (comp) {
                const data = comp.getFormValue();
                formData = data ? markRaw(data) : undefined;
            }
            allFormData[key] = formData;
        }
        return allFormData;
    }

}
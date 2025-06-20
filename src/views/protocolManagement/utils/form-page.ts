import {FreeButtonBase} from "@/shared/button-config";
import {AppFreeEditMethod} from "@/shared/app-free-edit-config";
import {AppGridEditMethod} from "@/shared/app-grid-edit-config";
import {AppTableMethod, MyTableMethod} from "@/shared/app-table-config";

export class FormPage {

    private componentRefMap = new Map<string, AppFreeEditMethod | AppGridEditMethod | AppTableMethod | MyTableMethod | any>();
    private buttonRefMap = new Map<string, FreeButtonBase>();
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
        console.log('this.formConfig', this.formConfig)
    }

    getComponentConfigById(id: string) {
    }

    // 存储组件ref
    setComponentRef(componentCode: string, componentRef: any) {
        this.componentRefMap.set(componentCode, componentRef);
    }
    // 存储按钮ref
    setButtonRef(buttonId: string, buttonRef: FreeButtonBase) {
        this.buttonRefMap.set(buttonId, buttonRef);
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
                const data = comp.getFromValue();
                formData = data ? markRaw(data) : undefined;
            }
            allFormData[key] = formData;
        }
        return allFormData;
    }

    /**
     * 获取指定组件的数据
     * @param id componentCode 组件唯一键
     */
    getFormDataById(id: string) {
        const comp = this.componentRefMap.get(id);
        if(comp && comp.getFromValue()) {
            return markRaw(comp.getFromValue());
        }else {
            return null;
        }
    }

    /**
     * 获取指定组件ref
     * @param id componentCode 组件唯一键
     */
    getComponentRefById(id: string) {
        return this.componentRefMap.get(id);
    }


    /**
     * 获取指定按钮ref
     * @param id
     */
    getButtonRefById(id: string) {
        return this.buttonRefMap.get(id);
    }


    /**
     * set指定组件的数据
     * @param id componentCode 组件唯一键
     * @param formData 组件绑定的值
     */
    setFormDataById(id: string, formData: any) {
        const comp = this.componentRefMap.get(id);
        if(comp) {
            comp.setFormValue(formData)
        }else {
            console.error('Could not find componentRef for id ' + id)
        }
    }

    /**
     * set所有指定组件的数据
     * @param AllData
     */
    setAllFormData(AllData: any) {
        const keys = Object.keys(AllData);
        for(const key of keys) {
            const comp = this.componentRefMap.get(key);
            if(comp) {
                comp.setFormValue(AllData[key]);
            }else {
                console.error('Could not find componentRef for id ' + key)
            }
        }
        nextTick(() => {
            this.initial = false;
        })
    }



}
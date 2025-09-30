export class CommonConstants {

    /**
     * 变量类型 function
     */
    static readonly TYPE_OF_FUNCTION: string = 'function';
    /**
     * 变量类型 object
     */
    static readonly TYPE_OF_OBJECT: string = 'object';
    /**
     * 变量类型 string
     */
    static readonly TYPE_OF_STRING: string = 'string';
    /**
     * 变量类型 number
     */
    static readonly TYPE_OF_NUMBER: string = 'number';


    /**
     * 组件类型 free 表单
     */
    static readonly FORM_EDIT_TYPE_FREE: string = 'free';
    /**
     * 组件类型 grid 可编辑的表格
     */
    static readonly FORM_EDIT_TYPE_GRID: string = 'grid';
    /**
     * 组件类型 table 表格
     */
    static readonly FORM_EDIT_TYPE_TABLE: string = 'table';
    /**
     * 组件类型 CUSTOM 自定义
     */
    static readonly FORM_EDIT_TYPE_CUSTOM: string = 'custom';

    /**
     * 要素类型 input输入框
     */
    static readonly RT_ITEM_TYPE_INPUT: string = 'rtinput';
    /**
     * 要素类型 select下拉选项
     */
    static readonly RT_ITEM_TYPE_SELECT: string = 'rtselect';
    /**
     * 要素类型 selectV2 虚拟数据 下拉选项 性能更佳
     */
    static readonly RT_ITEM_TYPE_SELECT_V2: string = 'rtSelectV2';
    /**
     * 要素类型 组合框
     */
    static readonly RT_ITEM_TYPE_INPUTGROUP: string = 'rtinputgroup';
    /**
     * 要素类型 checkbox
     */
    static readonly RT_ITEM_TYPE_CHECKBOX: string = 'rtcheckbox';
    /**
     * 要素类型 数字输入框
     */
    static readonly RT_ITEM_TYPE_NUMBER: string = 'rtnumber';
    /**
     * 要素类型 级联输入框
     */
    static readonly RT_ITEM_TYPE_CASCADER: string = 'rtcascader';


    /**
     * 表单数据的主键
     */
    static readonly FORM_DATA_KEY: string = "formKey";
    /**
     * 表单静态数据 - 与动态数据做对比用
     */
    static readonly PRIMEVAL_FORM_DAT_KEY: string = "primevalForm";
    /**
     * 要素绑定的值与静态数据不一致
     */
    static readonly ITEM_CHANGE_CLASS_NAME: string = "form-item-change";
    /**
     * 要素绑定的值与静态数据一直
     */
    static readonly ITEM_UNCHANGE_CLASS_NAME: string = "form-item-unchange";


}
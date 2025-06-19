import { useValidator } from "@/typings/useValidator";
import { createFreeButtonBase, FreeButtonBase } from "./button-config";
import {
  createGridFromUiConfig,
  GridFromUiConfig,
} from "./app-grid-edit-config";
import { createFromUiConfig } from "./app-free-edit-config";
const { getRules } = useValidator();

/**
 * 初始化表单组件对象
 * @param str 初始化表单样式
 * @param method 带入需要映射的方法
 * @param exRules 额外的规则
 * @returns 返回可渲染表单样式
 */
export function formInit(
  str: string,
  method: { [key: string]: Function },
  exRules: { [key: string]: any }
) {
  const newObj =  JSON.parse(str, function (key, value, ) {
    const parent = this; // `this` 就是当前属性的父对象
    // 按钮绑定
    if (
      key === "titleBtns" ||
      key === "endBtns" ||
      key === "tableBtn"
    ) {
      const btns: FreeButtonBase[] = [];
      for (let i = 0; i < value.length; i++) {
        btns.push(createFreeButtonBase(value[i]));
      }
      return btns;
    }
    if (key === "btnItems") {
      return createFreeButtonBase(value);
    }
    if( ["loadData","codeParam"].includes(key) && typeof value === "string") {  //解决部分场景,json字符串为不是对象的问题
      return JSON.parse(value);
    }
    // 规则绑定 --移至外部处理
    // if (key === "rules") {
    //   const rules = [];
    //   console.log(str);
    //   for (let i = 0; i < value.length; i++) {
    //     const rulesItem = value[i];
    //     // 如果有自定义规则,则使用自定义规则,否则去规则库查找
    //     if (exRules[rulesItem.type]) {
    //       rules.push({
    //         validator: exRules[rulesItem.type],
    //         trigger: rulesItem.trigger,
    //       });
    //     } else {
    //       const rul = getRules(rulesItem.type, rulesItem);
    //       if (rul) {
    //         rules.push(rul);
    //       }
    //     }
    //   }
    //   return rules;
    // }
    // 样式绑定
    if (key === "fromUi" || key === "superFromUi") {
      const fromUi: GridFromUiConfig = createFromUiConfig(value);
      return fromUi;
    }
    // 方法绑定
    if (key === "func"  || key === "disabledDate"|| key === "tableClick" || key === "onInit") {
      const inputTypeList = ['rtinput', 'rtSelect', 'rtSelectV2', 'rtcheckbox', 'rtcascader'];
      // 给指定要素绑定默认初始化方法
      if(inputTypeList.includes(parent.inputtype) && !!parent.prop && !parent.onInit) {
        const propArr = parent.prop.split('\.');
        const propName = propArr.length > 1 ? propArr[propArr.length - 1] : propArr[0] ;
        const onInitKey = propName + 'OnInit';
        parent.onInit = method[onInitKey as keyof typeof method];
      }
      // 确保 value 是 method 对象的键之一
      const funcKey = value as keyof typeof method;
      return method[funcKey];
    }
    return value;
  });

  if(newObj.fromSchema && newObj.fromSchema.length>0){
    newObj.fromSchema = newObj.fromSchema.map(item=>{
      if(item.rules && item.rules.length>0){
          const rules = [];
          for (let i = 0; i < item.rules.length; i++) {
            const rulesItem = item.rules[i];
            // 如果有自定义规则,则使用自定义规则,否则去规则库查找
            if (exRules[rulesItem.type]) {
              rules.push({
                validator: exRules[rulesItem.type],
                trigger: rulesItem.trigger,
              });
            } else {
              if(item.inputtype === 'rtinput' || item.inputtype === 'rtnumber' ){
                rulesItem.trigger = 'blur';
              }
              const rul = getRules(rulesItem.type, rulesItem);
              if (rul) {
                rules.push(rul);
              }
            }
          }
          item.rules = rules;
      }
      return item;
    })
  }
  return newObj;
}

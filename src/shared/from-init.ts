import { useValidator } from "@/typings/useValidator";
import { createFreeButtonBase, FreeButtonBase } from "./button-config";
import {
  createGridFromUiConfig,
  GridFromUiConfig,
} from "./app-grid-edit-config";
import { createFromUiConfig } from "./app-free-edit-config";
import { idxParamKey, IdxParamProps, useIdxParam } from "@/views/pcis/support/useIdxParam";
import { dataOpertaor } from "@/store/modules/data-opertaor";

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
  const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
  const opertaor = dataOpertaor(idxParam.opertaorProps);
  const params = opertaor.getParam();
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
    if (key === "func"  || key === "disabledDate"|| key === "tableClick" || key === "onInit" || key === "notes") {
      const inputTypeList = ['rtinput', 'rtSelect', 'rtSelectV2', 'rtcheckbox', 'rtcascader'];
      // 给指定要素绑定默认初始化方法
      if(inputTypeList.includes(parent.inputtype) && !!parent.prop && !parent.onInit) {
        const propArr = parent.prop.split('\.');
        const propName = propArr.length > 1 ? propArr[propArr.length - 1] : propArr[0] ;
        const onInitKey = propName + 'OnInit';
        parent.onInit = method[onInitKey as keyof typeof method];
      }
      if(['rtcascader'].includes(parent.inputtype) && !!parent.prop && !parent.lazyLoad) {
        const propArr = parent.prop.split('\.');
        const propName = propArr.length > 1 ? propArr[propArr.length - 1] : propArr[0] ;
        const lazyLoadKey = propName + 'LazyLoad';
        parent.lazyLoad = method[lazyLoadKey as keyof typeof method];
      }
      // 确保 value 是 method 对象的键之一
      const funcKey = value as keyof typeof method;
      return method[funcKey];
    }
    return value;
  });

  if(newObj.fromSchema && newObj.fromSchema.length>0){
    newObj.fromSchema = newObj.fromSchema.filter(item=>{
      let checkKey = null;
      const csc = item.cSysConfig;
      if(params.sysDist === 'PCIS'){    // 核心出单，标记有效性
        if(csc && csc.length > 0) {
          checkKey = csc.charAt(0);
        }
      }else if(params.sysDist === 'PRICE'){
        if(csc && csc.length > 1) {
          checkKey = csc.charAt(1);
        }
      }
      // 协议录入暂不考虑，协议录入使用的配置独立化了
      // else if(params.sysDist === 'ENTERDING'){ 
      //   if(csc && csc.length > 2) {
      //     checkKey = csc.substring(2,1);
      //   }
      // }
      if(checkKey === '2'){  // 无效,删除自己
        return false; // 过滤掉这个项
      }
      if(checkKey === '1'){  // 清除,校验内容
        item.rules = null;
      }
      if(item.cShowLocation === '2' ){    //位置隐藏的设置
        item.hidden = true;
      }
      if(item.cShowLocation === '3' ){    //位置折叠的设置
        item.expand = true;
        newObj.showExpand = true;
      }
      if(item.cTableWidth){    //调整表格要素,宽度
        item.width = Number(item.cTableWidth);
      }
      if(item.inputtype === 'rtinputgroup' ){
        if(item.groupList && item.groupList.length>0){
          item.groupList = item.groupList.map(gitem=>{
            if(gitem.rules && gitem.rules.length>0){
              const rules = [];
              for (let i = 0; i < gitem.rules.length; i++) {
                const rulesItem = gitem.rules[i];
                // 如果有自定义规则,则使用自定义规则,否则去规则库查找
                if (exRules[rulesItem.type]) {
                  rules.push({
                    validator: exRules[rulesItem.type],
                    trigger: rulesItem.trigger,
                  });
                } else {
                  if(gitem.inputtype === 'rtinput' || gitem.inputtype === 'rtnumber' ){
                    rulesItem.trigger = 'blur';
                  }
                  const rul = getRules(rulesItem.type, rulesItem);
                  if (rul) {
                    rules.push(rul);
                  }
                } 
              }
              gitem.rules = rules;
            }
            return gitem;
          })
        }
      }else if(item.rules && item.rules.length>0){
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
      return true;
    })
  }
  console.log(newObj.fromSchema);
  return newObj;
}

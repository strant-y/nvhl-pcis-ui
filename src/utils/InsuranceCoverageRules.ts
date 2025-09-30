// 投被保一些通用规则

import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
/**
 * 注册资本必填规则工具
 * getValue - 获取表单字段值的方法（需外部传入，保持与业务一致）
 * setFormItem - 设置表单字段规则的方法（需外部传入）
 * prefix - 字段前缀（'Applicant' 或 'Insured'）
 */
export const setCapitalRequiredRule = (getValue, setFormItem, prefix) => {
  const cWorkDptList = ["310", "320", "330", "340", "350", "360"];
  const fieldNames = {
    cIsBranch: `${prefix}.cIsBranch`, // 是否分支机构
    cWorkDpt: `${prefix}.cWorkDpt`, // 单位性质
    cClntMrk: `${prefix}.cClntMrk`, // 投保人/被保人性质
    nRegisteredCapital: `${prefix}.nRegisteredCapital`, // 注册资本
  };
  const cClntMrk = getValue(fieldNames.cClntMrk); // 投/被保人性质
  const cIsBranch = getValue(fieldNames.cIsBranch); // 是否分支机构
  const cWorkDpt = getValue(fieldNames.cWorkDpt); // 单位性质
//    console.log(6666,cClntMrk,cIsBranch,cWorkDpt)
// 是否分支机构为"否" && 单位性质属于企业列表 &&投/被保人性质为"法人"
  const isCapitalRequired =
    cIsBranch === "0" &&               
    cWorkDptList.includes(cWorkDpt) &&  
    cClntMrk === "0";                
    setFormItem(fieldNames.nRegisteredCapital, {
        rules: isCapitalRequired ? [getRules("required", {})] : [],
    });
};




/**
 * 公共时间控件禁用方法：禁止选择小于当前时间的日期
 * @param date - 待检查的日期
 * @returns boolean - true表示禁用（不可选），false表示可选
 */
export const disablePastDates = (date: Date): boolean => {
  // 处理无效日期
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return true;
  }

  // 获取当前时间（精确到当天0点，忽略时分秒）
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 日期小于当前时间则禁用
  return date.getTime() < today.getTime();
};


 
export default {
  setCapitalRequiredRule,
};
import Clipboard from "clipboard";
import { descryptParameter, encryptParameter } from "@/utils/encipher";

/**
 * 复制功能
 * @param text 要复制的文本
 * @param msg 文本名
 */
export function copyText (text: string, msg?: string) {
  const clipboard = new Clipboard('.copy-button', {
    text: () => text
  });

  clipboard.on('success', (e) => {
    if(!!msg){
      ElMessage.success(`${msg}复制成功！`);
    }
    clipboard.destroy();
  });

  clipboard.on('error', (e) => {
    if(!!msg){
      ElMessage.error(`${msg}复制失败！`);
    }
    clipboard.destroy();
  });
  clipboard.onClick({ currentTarget: document.querySelector('.copy-button') });
}

/**
 * 路由参数解析方法
 * @param query 路由参数
 * @returns 
 */
export function descryptParameterToQuery(query): any {
  const isJsonString = (str: string): boolean => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }
  const data = {
    JMquery: {}, // 加密后的路由参数
    JSONquery: {}, // json格式路由参数
    ParseParams: {} // 解析后的路由参数
  }
  if(Object.keys(query).length === 0) return data;
  for (const key in query) {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      if (key !== 'encrypted') {
        const p = query[key];
        const keyData = descryptParameter(query[key]);
        if (!!keyData) {
          data.JMquery[key] = p;
          data.JSONquery[key] = keyData;
          data.ParseParams[key] = isJsonString(keyData) ? JSON.parse(keyData) : keyData;
        }
      }
    }
  }
  return data;
}
/**
 * 根据身份证号计算年龄
 * @param idCard 身份证号（18位）
 * @returns 年龄（周岁）
 */
export function calculateAgeFromIdCard(idCard: string): number {
  if (!idCard || idCard.length !== 18) {
    throw new Error("Invalid ID card number");
  }

  // 提取出生年月日（YYYYMMDD）
  const birthDateStr = idCard.substring(6, 14);
  const birthYear = parseInt(birthDateStr.substring(0, 4), 10);
  const birthMonth = parseInt(birthDateStr.substring(4, 6), 10);
  const birthDay = parseInt(birthDateStr.substring(6, 8), 10);

  // 获取当前日期
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 月份从0开始，需+1
  const currentDay = currentDate.getDate();

  // 计算年龄
  let age = currentYear - birthYear;

  // 如果当前月份 < 出生月份，或者月份相同但当前日 < 出生日，则年龄减1（未过生日）
  if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
    age--;
  }

  return age;
}

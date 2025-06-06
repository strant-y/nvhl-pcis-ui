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
  const data = {
    JMquery: {}, // 加密后的路由参数
    JSONquery: {}, // json格式路由参数
    ParseParams: {} // 解析后的路由参数
  }
  for (const key in query) {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      if (key !== 'encrypted') {
        const p = query[key];
        const keyData = descryptParameter(query[key]);
        if (!!keyData) {
          data.JMquery[key] = p;
          data.JSONquery[key] = keyData;
          data.ParseParams[key] = JSON.parse(keyData);
        }
      }
    }
  }
  return data;
}

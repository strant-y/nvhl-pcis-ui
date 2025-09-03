import Clipboard from "clipboard";
import { descryptParameter, encryptParameter } from "@/utils/encipher";
import {CommonConstants} from "@/constants/CommonConstants";
import {Tooltip} from "@/common/dztooltip/tooltipOptions";

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
export function descryptParameterToQuery(query: any): any {
  const isJsonString = (str: string): boolean => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };
  const data: any = {
    JMquery: {}, // 加密后的路由参数
    JSONquery: {}, // json格式路由参数
    ParseParams: {} // 解析后的路由参数
  }
  if(Object.keys(query).length === 0) return data;
  for (const key in query) {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      // 页签切换后路由参数会变成加密状态，所以添加或情况判断再次解密保证页面读取prop.param正常
      if ((!['encrypted'].includes(key) && query[key]) || (key === 'encrypted' && query[key] && typeof query['param'] !== 'object')) {
        let keyData = query[key];
        if(!['componentKey'].includes(key) && typeof keyData === CommonConstants.TYPE_OF_STRING && keyData.length > 1) {
          keyData = descryptParameter(query[key]);
        }
        if (!!keyData) {
          data.JMquery[key] = query[key];
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

/**
 * 检测页面是否在滚动
 * @param delay
 */
export function useScrollDetection(delay = 50) {
  const isScrolling = ref(false);
  let scrollTimeout: number | null = null;

  const handleScroll = () => {
    isScrolling.value = true;

    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    scrollTimeout = window.setTimeout(() => {
      isScrolling.value = false;
    }, delay);
  };

  onMounted(() => {
    window.addEventListener('scroll', handleScroll);
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
  });

  return isScrolling.value;
}

/**
 * 滚动到指定#id
 */
export function scrollByDomId(targetId: string, location: "center" | "end" | "nearest" | "start" = "start") {
  // 获取目标元素的ID
  if (targetId) {
    // 手动实现平滑滚动效果
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: location
      });
    }
  }
}


/**
 * Tooltip提示
 * @param event 点击的元素
 * @param value 显示内容
 * @param mouseleaveClose 离开当前元素自动关闭
 */
export function showTooltip(event: MouseEvent, value: any, mouseleaveClose: boolean = true) {
  if (event && event.currentTarget) {
    const res = Tooltip.show({
      content: value,
      duration: 5000,
      showArrow: true,
      effect: 'dark',
      offset: 20
    }, event);
    if(mouseleaveClose) {
      const closeListener = () => {
        event.currentTarget?.removeEventListener('mouseleave', closeListener);
        setTimeout(() => {
          res.close();
        }, 500)
      };
      event.currentTarget?.addEventListener('mouseleave', closeListener);
    }
    return res;
  }
  return {};
}

/**
 * 判断内容是否超出
 * @param event 点击的元素
 * @param value 显示内容
 */
export function checkIfTruncated(event: MouseEvent, value: any) {
  if (event && event.currentTarget) {
    const element: any = event.currentTarget;
    if(element.scrollWidth > element.clientWidth) {
      showTooltip(event, value);
    }
  }
}
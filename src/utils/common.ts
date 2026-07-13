import Clipboard from "clipboard";
import { descryptParameter, encryptParameter, descryptParameterRouter } from "@/utils/encipher";
import {CommonConstants} from "@/constants/CommonConstants";
import {Tooltip} from "@/common/dztooltip/tooltipOptions";
import { useTagsViewStore } from "@/store";
import router from "@/router";

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
          keyData = descryptParameterRouter(query[key]);
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
 * 证件号性别提取逻辑
 */
export function validateAndGetGender(idNumber: string): string {
  // 长度检查
  if (!idNumber || idNumber.trim().length !== 18) {
    throw new Error('身份证号长度必须为18位')
  }
  // 去除首尾空格
  const cleaned = idNumber.trim();
  // 正则检查：前17位为数字，最后一位可能是数字或X（18位时）
  const pattern15 = /^[1-9]\d{13}\d$/;           // 15位全数字
  const pattern18 = /^[1-9]\d{16}[\dXx]$/;      // 18位，最后可为数字或X/x

  let isValidFormat = false;
  let genderChar: string;

  if (cleaned.length === 15) {
    if (pattern15.test(cleaned)) {
      isValidFormat = true;
      // 15位身份证：最后一位为性别位
      genderChar = cleaned.charAt(14);
    }
  } else {
    if (pattern18.test(cleaned)) {
      isValidFormat = true;
      // 18位身份证：第17位（倒数第二位）为性别位
      genderChar = cleaned.charAt(16);
    }
  }

  if (!isValidFormat) {
    return '0';
  }

  // 性别判断：奇数男，偶数女
  const genderNum = parseInt(genderChar, 10);
  if (isNaN(genderNum)) {
    return '0';
  }

  return genderNum % 2 === 1 ? '1' : '2';
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
        block: location,
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
        }, 300)
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
  if(!value || value === '') return;
  if (event && event.currentTarget) {
    const element: any = event.currentTarget;
    if(element.scrollWidth > element.clientWidth) {
      showTooltip(event, value);
    }
  }
}


// 将对象的属性首字母转换为小写
export function lowercaseKeys<T extends object>(
    obj: T
): { [K in keyof T as Uncapitalize<string & K>]: T[K] } {
  // 创建一个新的对象
  const newObj = {} as { [K in keyof T as Uncapitalize<string & K>]: T[K] };
  // 遍历原始对象的属性
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // 将属性名的首字母转换为小写，并赋值
      const newKey = (key.charAt(0).toLowerCase() +
          key.slice(1)) as Uncapitalize<string & K>;
      newObj[newKey] = obj[key];
    }
  }
  return newObj;
}


/**
 * 根据分辨率适配form-item的label宽度
 */
export function updateLabelWidth(): string {
  let maxLabelWidth;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scaleRatio = window.devicePixelRatio;
  const displayPercentage = Math.round(scaleRatio * 100);
  let px;
  // 不同缩放比率适配
  if(displayPercentage <= 110) {
    px = 200;
  }else if(displayPercentage <= 150) {
    px = 180;
  }else if(displayPercentage <= 175)  {
    px = 160
  }else {
    px = 140
  }
  // 不同分辨率适配
  if(viewportWidth < 1280) {
    maxLabelWidth = px - 50 + 'px';
  } else if(viewportWidth < 1700) {
    maxLabelWidth = px - 30 + 'px';
  } else if (viewportWidth <= 1920) {
    maxLabelWidth = px + 'px';
  } else if(viewportWidth >= 1920 && viewportWidth <= 3840) {
    maxLabelWidth = px + 80 + 'px';
  } else if(viewportWidth > 3840 && viewportWidth <= 5120 ) {
    maxLabelWidth = px + 160 + 'px';
  }else {
    maxLabelWidth = px + 240 + 'px';
  }
  return maxLabelWidth;
}

/**
 * 关闭当前标签页（面包屑）并返回上一页
 * 不依赖 selectedView 和浏览器 history，刷新或侧边导航后也能正常工作
 * @param path 可选，指定跳转路径；不传则自动跳转到上一个标签页
 */
export function closeCurrentTagAndBack(path?: string) {
  const tagsViewStore = useTagsViewStore();
  const currentRoute = router.currentRoute.value;
  // 从 visitedViews 中按 path 匹配当前页对应的标签
  let currentView = tagsViewStore.visitedViews.find(
    (v: TagView) => v.path === currentRoute.path
  );
  // 如果按 path 没找到，尝试用 fullPath 匹配
  if (!currentView) {
    currentView = tagsViewStore.visitedViews.find(
      (v: TagView) => v.fullPath === currentRoute.fullPath
    );
  }
  // 如果仍然没找到，尝试用 selectedView
  if (!currentView && tagsViewStore.selectedView) {
    currentView = tagsViewStore.selectedView;
  }

  if (currentView) {
    tagsViewStore.delView(currentView).then((res: any) => {
      if (path) {
        router.push(path);
      } else {
        // 跳转到剩余标签中的最后一个
        const latestView = res.visitedViews.slice(-1)[0];
        if (latestView && latestView.path) {
          if (latestView.keepAlive) {
            router.replace({ path: latestView.path, query: latestView.query });
          } else {
            router.push({ path: latestView.path, query: latestView.query });
          }
        } else {
          router.push("/");
        }
      }
    });
  } else {
    // 兜底：未找到当前标签，尝试用 selectedView 通过 eventBus 关闭
    if (tagsViewStore.selectedView) {
      tagsViewStore.back();
    } else if (path) {
      router.push(path);
    } else {
      router.go(-1);
    }
  }
}
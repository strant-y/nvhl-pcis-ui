// 一些公共的方法

// 身份证校验 总
function validateIdCard(idCard) {
  // 空值校验
  if (!idCard || typeof idCard !== 'string') {
    return false;
  }

  // 去除空格
  idCard = idCard.trim();

  // 15位身份证校验
  if (idCard.length === 15) {
    return validate15IdCard(idCard);
  }

  // 18位身份证校验
  if (idCard.length === 18) {
    return validate18IdCard(idCard);
  }

  // 长度不符合
  return false;
}

/**
 * 校验15位身份证号码
 * @param {string} idCard - 15位身份证号码
 * @returns {boolean}
 */
function validate15IdCard(idCard) {
  // 15位身份证号码正则表达式
  const regex = /^[1-9]\d{5}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}$/;
  
  // 正则校验
  if (!regex.test(idCard)) {
    return false;
  }

  // 校验年份（15位身份证年份只有后两位，默认补19）
  const year = parseInt('19' + idCard.substr(6, 2), 10);
  const month = parseInt(idCard.substr(8, 2), 10);
  const day = parseInt(idCard.substr(10, 2), 10);
  
  // 检查日期有效性
  return isValidDate(year, month, day);
}

/**
 * 校验18位身份证号码
 * @param {string} idCard - 18位身份证号码
 * @returns {boolean}
 */
function validate18IdCard(idCard) {
  // 18位身份证号码正则表达式
  const regex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/;
  
  // 正则校验
  if (!regex.test(idCard)) {
    return false;
  }

  // 校验年份
  const year = parseInt(idCard.substr(6, 4), 10);
  const month = parseInt(idCard.substr(10, 2), 10);
  const day = parseInt(idCard.substr(12, 2), 10);
  
  // 检查日期有效性
  if (!isValidDate(year, month, day)) {
    return false;
  }

  // 校验码验证
  return verifyCheckCode(idCard);
}

/**
 * 验证日期有效性
 * @param {number} year - 年份
 * @param {number} month - 月份
 * @param {number} day - 日期
 * @returns {boolean}
 */
function isValidDate(year, month, day) {
  // 检查月份范围
  if (month < 1 || month > 12) {
    return false;
  }

  // 每月天数
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // 闰年处理
  if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
    daysInMonth[1] = 29; // 闰年2月有29天
  }

  // 检查日期范围
  return day >= 1 && day <= daysInMonth[month - 1];
}

/**
 * 验证18位身份证的校验码
 * @param {string} idCard - 18位身份证号码
 * @returns {boolean}
 */
function verifyCheckCode(idCard) {
  // 身份证号码前17位
  const id17 = idCard.substr(0, 17);
  
  // 加权因子
  const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  
  // 校验码对应表
  const verifyCodeMap = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  // 计算校验码
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(id17.charAt(i), 10) * factor[i];
  }
  
  // 计算模值
  const mod = sum % 11;
  
  // 获取校验码
  const expectedCode = verifyCodeMap[mod];
  
  // 比较校验码（不区分大小写）
  const actualCode = idCard.charAt(17).toUpperCase();
  
  return expectedCode === actualCode;
}


export {
  validateIdCard
};

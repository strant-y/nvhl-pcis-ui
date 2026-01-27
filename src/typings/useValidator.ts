import { indexOf } from "lodash";

type Callback = (error?: string | Error | undefined) => void;

/**
 * 出口一个验证器工具函数
 * 提供了一些常用的验证规则生成方法
 */
export const useValidator = () => {
  /**
   * 生成一个必填项验证规则
   * @param message 验证失败时的提示信息 如果未提供则使用默认值
   * @param trigger 触发验证的方式 如果未提供则使用默认值 'change'
   * @returns 返回一个必填项验证规则对象
   */
  const required = (trigger?: string, message?: string) => {
    return {
      required: true,
      message: message || "该项为必填项",
      trigger: trigger || "blur",
    };
  };

  /**
   * 创建一个配置对象，用于定义数字范围和相关的验证信息
   *
   * @param min 最小值，定义了允许的数字范围的下限
   * @param max 最大值，定义了允许的数字范围的上限
   * @param message 可选参数，自定义验证失败时的错误信息
   *                如果未提供，则使用默认消息
   * @param trigger 可选参数，定义了触发验证的条件
   *                如果未提供，则默认在失去焦点时触发验证
   *
   * @returns 返回一个对象，包含min、max、message和trigger四个属性
   *          该对象用于描述一个数字范围及其验证信息
   */
  const numbtween = (
    min: number,
    max: number,
    message?: string,
    trigger?: string
  ) => {
    return {
      min: min,
      max: max,
      message: message || "请输入介于" + min + "和" + max + "之间的数字",
      trigger: trigger || "blur",
    };
  };

  /**
   * 创建一个枚举输入验证器配置对象
   *
   * @param enums - 可接受的枚举值数组，用于验证输入是否合法
   * @param message - 当输入值不在枚举列表中时显示的错误消息如果未提供，则生成一个默认消息
   * @param trigger - 触发验证的事件类型默认为"blur"，即失去焦点时触发验证
   * @returns 返回一个配置对象，用于在输入验证中指定枚举值、错误消息和触发方式
   */
  const inputenum = (enums?: any, message?: string, trigger?: string) => {
    return {
      type: "enum",
      enum: enums,
      message: message || "仅能输入" + enums,
      trigger: trigger || "blur",
    };
  };

  /**
   * 获取手机号码的验证规则
   *
   * 此函数用于返回一个对象，该对象包含了手机号码的验证模式、错误提示信息和触发验证的时机
   * 主要用于表单验证中，确保用户输入的手机号码符合中国大陆的手机号码格式
   *
   * @returns {Object} 返回一个包含手机号码验证规则的对象
   */
  const phoneNo = () => {
    return {
      pattern:
        /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/,
      message: "请输入正确的手机号",
      trigger: "blur",
    };
  };

   // 手机号或固定电话二选一正则
const contactPhone = () => {
  return {
    pattern: /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$|^\d{3,4}-\d{7,8}(-\d{1,4})?$/,
    message: "请输入正确的手机号或固定电话",
    trigger: "blur"
  };
};

  /**
  * 邮箱的验证规则
  *
  * 此函数用于返回一个对象，该对象包含了邮箱的验证模式、错误提示信息和触发验证的时机
  * 主要用于表单验证中，确保用户输入的邮箱符合格式
  *
  * @returns {Object} 返回一个包含邮箱验证规则的对象
  */
  const email = () => {
    return {
      pattern:
        /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
      message: "请输入正确格式的邮箱",
      trigger: "blur",
    };
  }

  const signlessInt = () => {
    return {
      pattern: /^\d+$/,
      message: "只能输入正整数",
      trigger: "blur",
    };
  }
  const positiveNumber = () => {
    return {
      pattern:/^\d+(\.\d+)?$/,
      message: "只能输入正数",
      trigger: "blur",
    };
  }
  const specifyLength = (num) => {
    const regex = new RegExp(`^\\d{${num}}$`);
    return {
      pattern: regex,
      message: `只能输入${num}位字符`,
      trigger: "blur",
    };
  }

  const maxLength = (num) => {
    // const regex = new RegExp(`^.{0,${num}}$`);
    // return {
    //   pattern: regex,
    //   message: `最多输入${num}个字符`,
    //   trigger: "blur",
    // }
    return {
      validator: (rule, value, callback) => {
        if(value && value.length > num) {
          callback(`最多输入${num}个字符`);
        } else {
          callback();
        }
      },
      trigger: 'blur'
    };
  }

  /**
   * 固话
   */
  const phone = () => {
    return {
      pattern:
        /^(([0\+]\d{2,3}-)?(0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/,
      // message: "固话号码格式不对,格式如0511-4405222 或 010-87888822",
      message: "请输入正确的固话号码",
      trigger: "blur",
    };
  }
  //身份证号校验
  const idCard = () => {
    const ERRORS = [
      '验证通过',
      '身份证号码位数不对',
      '身份证号码出生日期超出范围或含有非法字符',
      '身份证号码校验错误',
      '身份证地区非法',
      '身份证录入字母需大写'
    ];
    const AREA = {
      11: '北京',
      12: '天津',
      13: '河北',
      14: '山西',
      15: '内蒙古',
      21: '辽宁',
      22: '吉林',
      23: '黑龙江',
      31: '上海',
      32: '江苏',
      33: '浙江',
      34: '安徽',
      35: '福建',
      36: '江西',
      37: '山东',
      41: '河南',
      42: '湖北',
      43: '湖南',
      44: '广东',
      45: '广西',
      46: '海南',
      50: '重庆',
      51: '四川',
      52: '贵州',
      53: '云南',
      54: '西藏',
      61: '陕西',
      62: '甘肃',
      63: '青海',
      64: '宁夏',
      65: '新疆',
      71: '台湾',
      81: '香港',
      82: '澳门',
      91: '国外'
    };

    return {
      validator: (rule, value, callback) => {
        if (value === null || value === '' || value ===undefined) {
          callback();
          return;
        }
        let Y, JYM;
        let S, M;
        let ereg;
        let idcard_array = value.split('');
        // 地区检验
        if (AREA[parseInt(value.substr(0, 2), 10)] == null) {
          callback(new Error(ERRORS[4]));
          return;
        }
        // 身份号码位数及格式检验
        switch (value.length) {
          case 15:
            if ((parseInt(value.substr(6, 2), 10) + 1900) % 4 === 0 || ((parseInt(value.substr(6, 2), 10) + 1900) % 100 === 0 && (parseInt(value.substr(6, 2), 10) + 1900) % 4 === 0)) {
              ereg = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}$/; // 测试出生日期的合法性
            } else {
              ereg = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}$/; // 测试出生日期的合法性
            }
            if (ereg.test(value)) {
              callback();
            } else {
              callback(new Error(ERRORS[2]));
            }
            break;
          case 18:
            if (parseInt(value.substr(6, 4), 10) % 4 === 0 || (parseInt(value.substr(6, 4), 10) % 100 === 0 && parseInt(value.substr(6, 4), 10) % 4 === 0)) {
              ereg = /^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}[0-9Xx]$/; // 闰年出生日期的合法性正则表达式
            } else {
              ereg = /^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}[0-9Xx]$/; // 平年出生日期的合法性正则表达式
            }
            if (ereg.test(value)) {
              // 计算校验位
              S = (parseFloat(idcard_array[0]) + parseFloat(idcard_array[10])) * 7
                + (parseFloat(idcard_array[1]) + parseFloat(idcard_array[11])) * 9
                + (parseFloat(idcard_array[2]) + parseFloat(idcard_array[12])) * 10
                + (parseFloat(idcard_array[3]) + parseFloat(idcard_array[13])) * 5
                + (parseFloat(idcard_array[4]) + parseFloat(idcard_array[14])) * 8
                + (parseFloat(idcard_array[5]) + parseFloat(idcard_array[15])) * 4
                + (parseFloat(idcard_array[6]) + parseFloat(idcard_array[16])) * 2
                + parseFloat(idcard_array[7]) * 1
                + parseFloat(idcard_array[8]) * 6
                + parseFloat(idcard_array[9]) * 3;
              Y = S % 11;
              M = 'F';
              JYM = '10X98765432';
              M = JYM.substr(Y, 1); // 判断校验位
              // 检测ID的校验位
              if (M === idcard_array[17]) {
                callback();
              } else {
                if ('x' === idcard_array[17]) {
                  callback(new Error(ERRORS[5]));
                } else {
                  callback(new Error(ERRORS[3]));
                }
              }
            } else {
              callback(new Error(ERRORS[2]));
            }
            break;
          default:
            callback(new Error(ERRORS[1]));
        }
      },
      trigger: 'blur'
    };
  };
  //统一社会信用编码校验
  const socialCode = () => {
      return {
      pattern: /^[123456789ANY][0-9A-HJ-NPQRTUWXY]{17}$/,
      // message: "不是有效的统一社会信用编码！",
      message: "格式有误，请输入正确格式！",
      trigger: "blur"
    };
  };
  //组织机构编码校验
  const orgCode = () => {
    return {
      validator: (rule, value, callback) => {
        if(!value) {
          callback()
          return
        }
        const values = value.split('-');
        const ws = [3, 7, 9, 10, 5, 8, 4, 2];
        const str = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const reg = /^([0-9A-Z]){8}$/;

        if (!reg.test(values[0])) {
          callback(new Error('不是有效的组织机构编码！'));
          return;
        }

        let sum = 0;
        for (let i = 0; i < 8; i++) {
          sum += str.indexOf(values[0].charAt(i)) * ws[i];
        }

        const C9 = 11 - (sum % 11);
        const YC9 = values[1] + '';
        let C9_str;
        if (C9 === 11) {
          C9_str = '0';
        } else if (C9 === 10) {
          C9_str = 'X';
        } else {
          C9_str = C9 + '';
        }

        if (YC9 !== C9_str) {
          callback(new Error('不是有效的组织机构编码！'));
        } else {
          callback();
        }
      },
      message: '不是有效的组织机构编码！',
      trigger: 'blur'
    };
  };

  // 金额校验
  const validateAmout = (maxIntegerLength, maxDecimalLength) => {
    return {
      validator: (rule, value, callback) => {
        const reg = /^[0-9]*\.?[0-9]*$/;
        const regex = new RegExp(
          `^([1-9]\\d{0,${maxIntegerLength - 1}}|0)(\\.\\d{1,${maxDecimalLength}})?$`
        );

        if (!reg.test(value)) {
          callback(new Error('请输入数字'));
        } else if (value <= 0 || !regex.test(value)) {
          callback(
            new Error(
              `请输入大于 0 的数字，整数部分最大 ${maxIntegerLength} 位，小数部分最大 ${maxDecimalLength} 位`
            )
          );
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  };

  // 护照
  const passPort = () => {
    return {
          pattern: /^[a-zA-Z0-9]{5,20}$/,
          message: "护照号码格式不正确（5-20位字母或数字）",
          trigger: "blur"
    };
};
// 外国人永久居留身份证校验
const ariCard = () => {
  return {
    pattern: /^[A-Z9][0-9A-Z]{14}([0-9A-Z]{3})?$/,
    message: "必须为15位或18位，且首位只能是大写字母或9",
    trigger: "blur"
  };
};

// 营业执照校验
const businessLicense = () => {
  return {
      validator: (rule, value, callback) => {
       if (value === null || value === '' || value ===undefined) {
          callback();
          return;
        }
          const businessLicense = value;
          if ((businessLicense.length !== 15) && (businessLicense.length !== 18)) {
              callback(new Error('营业执照号码必须是十五位或十八位'));
          } else if (businessLicense.indexOf(' ') >= 0) {
              callback(new Error('营业执照号码中不能带有空格'));
          } else {
              callback();
          }
      },
      trigger: 'blur'
  };
};


/**
 * 车牌号校验规则（仅格式验证，不含空值校验）
 * @param {Object} [options] - 配置选项
 * @param {string} [options.message] - 通用错误提示
 * @param {string} [options.normalMessage] - 普通车牌错误提示
 * @param {string} [options.newEnergyMessage] - 新能源车牌错误提示
 * @param {boolean} [options.allowSpecial] - 是否允许特殊车牌（使、领等）
 * @returns {Object} - 验证规则
 */
const vehiclePlate = (options = {}) => {
  const { 
    message = "请输入正确的车牌号",
    normalMessage = "普通车牌号格式应为：省份简称+字母+5位数字/字母",
    newEnergyMessage = "请输入正确的车牌号",
    allowSpecial = false
  } = options;
  
  // 省份简称列表（包含特殊区域）
  const provinceChars = allowSpecial 
    ? "京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领" 
    : "京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼";
  
  return {
    validator: (rule, value, callback) => {
         if (value === null || value === '' || value ===undefined) {
          callback();
          return;
        }
      const formattedValue = value.trim().toUpperCase();
      
      // 普通车牌正则表达式
      const normalPattern = new RegExp(
        `^[${provinceChars}][A-HJ-NP-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{0,1}$`
      );
      
      // 新能源车牌正则表达式
      const newEnergyPattern = new RegExp(
         /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼]{1}[A-Z]{1}(?:[DF][A-HJ-NP-Z0-9]{5}|[A-HJ-NP-Z0-9]{5}[DF])$/
        //  `/^([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}(([0-9]{5}[DF])|([DF]([A-HJ-NP-Z0-9])[0-9]{4})))|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1})$/`
      );
      // const newEnergyLicenseRegex = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼]{1}[A-Z]{1}(?:[DF][A-HJ-NP-Z0-9]{5}|[A-HJ-NP-Z0-9]{5}[DF])$/;
      
      // 验证逻辑
      if (normalPattern.test(formattedValue) || formattedValue === '新车未上牌') {
        callback();
      } else if (formattedValue.length === 7 || formattedValue.length === 8) {// 临时修改车牌号校验规则
        callback();
      } else {
        callback(new Error(message));
      }
    },
    trigger: "blur"
  };
};

/**
 * 车架号(VIN)格式验证器
 *
 */
const vinNumber = () => {
  return {
    pattern: /^[A-HJ-NPR-Z0-9]{17}$/,
    message: "车架号必须为17位且仅包含大写字母和数字",
    trigger: "blur"
  };
};
// 传真校验
const faxNumber = () => {
  return {
    // pattern: /^(\+?\d{1,3}[- ]?)?\d{2,4}[- ]?\d{7,8}$/,
    pattern: /^(\+?\d{1,3}[- ]?)?(\d{2,4}[- ]?)?\d{7,8}([- ]?\d{1,6})?$/,
    message: "请输入正确格式的传真号码（如：+86-10-12345678）",
    trigger: "blur"
  };
};

// 联系方式 手机或者固定电话
  const contactInformation = () => {
    return {
      pattern: /^(1[3-9]\d{9}|0\d{2,3}-?\d{7,8}(-?\d{1,4})?)$/,
      message: "请输入正确格式的联系方式",
      trigger: "blur"
    };
  };
/**
 * 全球法人识别编码（LEI）校验规则
 * @returns {Object} - 校验规则配置
 */
const leiCode = () => {
  return {
    pattern: /^[A-Z0-9]{4}[0-9]{2}[A-Z0-9]{12}[0-9]{2}$/,
    message: "LEI编码格式不正确",
    trigger: "blur"
  };
};

// 道路运输经营许可证校验规则
const roadTransportLicense = (options = {}) => {
  const { 
    message = "请输入有效的证件号",
    lengthMessage = "证件号长度应为1-100位" // 调整长度提示
  } = options;
  
  return {
    validator: (rule, value, callback) => {
      if (!value) return callback(); // 空值由required处理
      const val = value.trim();
      
      // 仅允许字母、数字、汉字（移除了括号和连字符等符号）
      const pattern = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/;
      
      // 基本格式校验
      if (!pattern.test(val)) {
        return callback(new Error(message + "（仅允许字母、数字、汉字）"));
      }
      
      // 长度校验（调整为1-100位）
      if (val.length < 1 || val.length > 100) {
        return callback(new Error(lengthMessage));
      }
      
      callback(); // 校验通过
    },
    trigger: "blur"
  };
};


 
/**
 * 网络预约出租汽车经营许可证验证规则
 */
const onlineTaxiLicense = () => {
  return {
    pattern: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼]{1,2}交运管网约出租许\d{4}\d{6,10}号$/,
    message: "许可证格式应为：地区代码+交运管+网约出租+许+年份+编号+号，如京交运管网约出租许2023000001号",
    // message: "网约车经营许可证格式有误！",
    trigger: "blur"
  };
};

/**
 * 网络预约出租汽车运输证正则校验规则
 * @returns {Object} - 校验规则配置
 */
const onlineTaxiTransportLicense = () => {
  return {
    pattern: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼]{1}[A-HJ-NP-Z]{1}[A-HJ-NP-Z0-9]{5}运管备[0-9]{4}[A-Z0-9]{6,10}$/,
    message: "运输证格式应为：车牌前缀+运管备+年份+编号，如京A12345运管备2023000001",
    trigger: "blur"
  };
};

/**
 * 关联交易审批单编号校验规则
 * @returns {Object} - 验证规则配置
 */
const txnApprovalNo = () => {
  return {
    // 支持格式：
    // 1. 公司代码-年份-月份-流水号（如：CT-2025-06-001）
    // 2. 公司代码_年份_月份_流水号（如：CT_2025_06_001）
    // 3. 公司代码年份月份流水号（如：CT202506001）
    pattern: /^[A-Z0-9]{2,6}(-|_|)?\d{4}(-|_|)?\d{1,2}(-|_|)?\d{3,6}$/,
    message: "审批单编号有误（如：CT-2025-06-001 或 CT202506001）",
    trigger: "blur"
  };
};


  // 空值校验 用来处理底部校验出异常提示后清空问题
  const isNull = () => {
     return {
     validator: (rule, value, callback) => {
       callback();
      },
      trigger: "blur"
    }
  };

const valiAddress = (options = {}) => {
  const { 
    required = true,
    minLength = 5,
    maxLength = 200,
    enhanced = false,
    message = '请输入有效的地址信息'
  } = options;
  
  // 基础地址字符合法性校验
  const basicPattern = /^[\u4e00-\u9fa5a-zA-Z0-9()（）\-\.\/\s,，号楼单元层]+$/;
  
  // 修复后的增强版正则：
  // 1. 支持直辖市（如北京市、上海市）、省、自治区、特别行政区
  // 2. 允许中间层级（市/区/县）可选（适应直辖市无地级市的情况）
  // 3. 放宽街道乡镇级的匹配
  const enhancedPattern = /^(.*?(省|自治区|直辖市|特别行政区)|北京市|上海市|天津市|重庆市)(.*?(市|区|县|旗|自治州|地区|盟))?(.*?(街道|镇|乡|苏木|民族乡))?(.*?(村|社区|路|街|巷|胡同|弄|号|小区|大厦|楼)).*$/;
  
  return {
    validator: (rule, value, callback) => {
      if ((value === null || value === '' || value === undefined)) {
   
        return callback();
      }
      
      const trimmedValue = value.trim();
      
      if (trimmedValue.length < minLength) {
        return callback(new Error(`地址长度不能少于${minLength}个字符`));
      }
      
      if (trimmedValue.length > maxLength) {
        return callback(new Error(`地址长度不能超过${maxLength}个字符`));
      }
      
      // if (!basicPattern.test(trimmedValue)) {
      //   return callback(new Error('地址包含不支持的特殊字符'));
      // }
      
      // 增强模式校验（修复后可通过"北京市海淀区..."这类地址）
      if (enhanced && !enhancedPattern.test(trimmedValue)) {
        return callback(new Error('请输入包含省/市、区/县、街道/乡镇及详细地址的完整信息'));
      }
      
      callback();
    },
    trigger: 'blur'
  };
};


// 支票号正则校验
const chequeNumberValidation = () => {
  return {
      pattern: /^\d{8}(\d{2})?$/,
      message: "支票号应为8位或10位数字（仅支持纯数字）",
      trigger: "blur"
    }
};
 
// 非法字符校验
const accountValidation = () => {
  return {
      pattern: /^[^\!@#\$%\^&\*\(\)_\+\{\}\|:"\<\>\?`~\\\[\];',./]+$/,
      message: '请输入正确号码',
      trigger: "blur"
    }
};
// 税务登记号
const taxValidation = () => {
  return {
   
      pattern: /^[a-zA-Z0-9]{15,20}$/, 
      message: "税务登记号应为15-20位数字或字母",
      trigger: "blur"
    }
};

/**
 * 银行卡
 */
const bankNum = () => {
  return {
    pattern: /^(\d{9,26})$/,
    message: "收款人账号 银行卡号格式不对!",
    trigger: "blur"
  }
}

/**
 * 客户名称
 */
const cAppNme = () => {
  return {
    pattern: /^[\u4e00-\u9fa5\u00B7,a-zA-Z()（）\s\.]{2,}$/,
    // pattern: /^[\u4e00-\u9fa5\u00B7,a-zA-Z()（）\s\d,#&'@+=\/\\[\]\u00a0-\u00ff.-]{2,200}$/iu,
    message: "客户名称 只允许为 中文和·和,和.或者 字母、空格和括号，且字母汉字长度至少2个",
    trigger: "blur"
  }
}

/**
 * 不允许包含 *
 */
const NoAsterisk = (sym) => {
	return {
		validator: (rule, value, callback) => {
			if (value && value.includes(sym)) {
				callback(new Error(`内容不能包含 "${sym}" 字符`))
			} else {
				callback()
			}
		},

		trigger: 'blur'
	};
}

  const getRules = (type: any, param: any) => {
    if (type === "required") {
      return required(param.trigger, param.message);
    }
    if (type === "numbtween") {
      return numbtween(param.min, param.max, param.trigger, param.message);
    }
    if (type === "inputenum") {
      return inputenum(param.enums, param.trigger, param.message);
    }
    if (type === "phoneNo") {
      return phoneNo();
    }
    if (type === "contactPhone") {
      return contactPhone();
    }
    if (type === "email") {
      return email();
    }
    if (type === "idCard") {
      return idCard()
    }
    if (type === "socialCode") {
      return socialCode()
    }
    if (type === "orgCode") {
      return orgCode()
    }
    if (type === 'signlessInt') {
      return signlessInt()
    }
    if (type === 'specifyLength') {
      return specifyLength(param.len)
    }
    if(type === 'maxLength') {
      return maxLength(param.len)
    }
    if (type === 'phone') {
      return phone()
    }
    if (type === 'validateAmout') {
      return validateAmout(param.maxIntegerLength, param.maxDecimalLength)
    }
    if(type === 'passPort') {
      return passPort()
    }
    if(type === 'ariCard') {
      return ariCard()
    }
    if(type == 'businessLicense') {
      return businessLicense()
    }
    if(type == 'vehiclePlate') {
      return vehiclePlate()
    }
    if(type == 'vinNumber') {
      return vinNumber()
    }
    if(type == 'faxNumber') {
      return faxNumber()
    }
    if(type == 'positiveNumber') {
      return positiveNumber()
    }
    if(type == 'leiCode') {
      return leiCode()
    }
    if(type == 'roadTransportLicense') {
      return roadTransportLicense()
    }
    if(type == 'onlineTaxiLicense') {
      return onlineTaxiLicense()
    }
    if(type == 'onlineTaxiTransportLicense') {
      return onlineTaxiTransportLicense()
    }
    if(type == 'txnApprovalNo') {
      return txnApprovalNo()
    }
    if(type == 'isNull') {
      return isNull()
    }
    if(type == 'valiAddress') {
      return valiAddress()
    }
    if(type == 'chequeNumberValidation') {
      return chequeNumberValidation()
    }
    if(type == 'accountValidation') {
      return accountValidation()
    }
    if(type == 'taxValidation') {
      return taxValidation()
    }
    if(type == 'contactInformation') {
      return contactInformation()
    }
    if(type == 'bankNum') {
      return bankNum()
    }
    if(type == 'cAppNme') {
      return cAppNme()
    }
    if(type == 'NoAsterisk') {
      return NoAsterisk(param.sym)
    }
  };
  const validorMap = {
    required: required,
    numbtween: numbtween,
    inputenum: inputenum,
    phoneNo: phoneNo,
  };

  return {
    getRules,
  };
};

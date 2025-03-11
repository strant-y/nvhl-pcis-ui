type Callback = (error?: string | Error | undefined) => void;

/**
 * 出口一个验证器工具函数
 * 提供了一些常用的验证规则生成方法
 */
export const useValidator = () => {
  /**
   * 生成一个必填项验证规则
   * @param message 验证失败时的提示信息 如果未提供则使用默认值
   * @param trigger 触发验证的方式 如果未提供则使用默认值 'blur'
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
  const specifyLength = (num) => {
    const regex = new RegExp(`^\\d{${num}}$`);
    return {
      pattern: regex,
      message: `只能输入${num}位字符`,
      trigger: "blur",
    };
  }

  const maxLength = (num) => {
    const regex = new RegExp(`^.{0,${num}}$`);
    return {
      pattern: regex,
      message: `最多输入${num}个字符`,
      trigger: "blur",
    }
  }

  /**
   * 固话
   */
  const phone = () => {
    return {
      pattern:
        /^(([0\+]\d{2,3}-)?(0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/,
      message: "固话号码格式不对或后七位或者八位不能重复,格式如0511-4405222 或 010-87888822",
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
        if (value === null || value === '') {
          callback();
          return;
        }
        let Y, JYM;
        let S, M;
        let ereg;
        let idcard_array = value.split('');
        console.log("idcard_array",idcard_array);
        
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
    const isEmptyInputValue = (value) => {
      return value === null || value === undefined || value === '';
    };

    const isUpperCase = (str) => {
      return str === str.toUpperCase();
    };

    return {
      validator: (rule, value, callback) => {
        if (isEmptyInputValue(value)) {
          callback();
          return;
        }
        // 输入转换大写
        let socialCode = value;
        if (!isUpperCase(socialCode)) {
          socialCode = socialCode.toUpperCase();
        }
        const patrn = /^(11|12|13|19|51|52|53|59|91|92|93|Y1)[A-Z0-9]{3,18}$/;
        // 18位校验及大写校验
        if ((socialCode.length !== 18) || (!patrn.test(socialCode))) {
          callback(new Error('不是有效的统一社会信用编码！'));
        } else {
          callback();
        }
      },
      message: '不是有效的统一社会信用编码！',
      trigger: 'blur'
    };
  };
  //统一组织机构编码校验
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
          callback(new Error('不是有效的统一组织机构编码！'));
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
          callback(new Error('不是有效的统一组织机构编码！'));
        } else {
          callback();
        }
      },
      message: '不是有效的统一组织机构编码！',
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
        validator: (rule, value, callback) => {
            const passPort = value;
            if (passPort.length!== 9) {
                callback(new Error('护照号码必须是九位！'));
            } else if (passPort.indexOf(' ') >= 0) {
                callback(new Error('护照号码中不能带有空格'));
            } else {
                callback();
            }
        },
        trigger: 'blur'
    };
};

// 外国人永久居留身份证校验
const ariCard = () => {
  return {
      validator: (rule, value, callback) => {
          const ariCard = value;
          if (ariCard.length!== 15) {
              callback(new Error('外国人永久居留身份证号码必须是十五位'));
          } else if (ariCard.indexOf(' ') >= 0) {
              callback(new Error('外国人永久居留身份证号码中不能带有空格'));
          } else {
              callback();
          }
      },
      trigger: 'blur'
  };
};

// 营业执照校验
const businessLicense = () => {
  return {
      validator: (rule, value, callback) => {
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

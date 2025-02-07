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

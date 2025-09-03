interface OpertaorType {
  getTableRefByKey: (key: string) => {
    getFromValue: () => PayPlanItem[]; // 缴费计划列表类型
    getValue?: (field: string) => string | number | null; // 保险区间字段值
  };
}

//定义缴费计划单项类型
export interface PayPlanItem {
  'Pay.tPayBgnTm'?: string | number | null; // 缴费起期
  'Pay.tPayEndTm'?: string | number | null; // 缴费止期
  [key: string]: any; // 兼容其他字段
}

//  定义函数入参类型
interface CheckPayPlanParams {
  opertaor: OpertaorType; 
}

/**
 * 检查缴费计划时间是否超出保险区间
 * @param  opertaor 工具
 */
export const checkPayPlanValidity = ({ opertaor }: CheckPayPlanParams): boolean => {
  try {
    const payPlanList = opertaor.getTableRefByKey("payinfo").getFromValue();
    const insuranceStart = opertaor.getTableRefByKey("insrnc")?.getValue?.('Base.tInsrncBgnTm');
    const insuranceEnd = opertaor.getTableRefByKey("insrnc")?.getValue?.('Base.tInsrncEndTm');

    //日期转换工具函数
    const toValidDate = (dateValue: string | number | null | undefined): Date => {
      if (dateValue == null || (typeof dateValue === 'string' && !dateValue.trim())) {
        return new Date(NaN);
      }
      if (typeof dateValue === 'number') {
        const minTimestamp = new Date('1900-01-01').getTime();
        const maxTimestamp = new Date('2100-12-31').getTime();
        return dateValue >= minTimestamp && dateValue <= maxTimestamp 
          ? new Date(dateValue) 
          : new Date(NaN);
      }
      // 字符串类型 → 直接转换
      const parsedDate = new Date(dateValue);
      return !isNaN(parsedDate.getTime()) ? parsedDate : new Date(NaN);
    };

    //校验保险区间本身是否有效
    const insStartDate = toValidDate(insuranceStart);
    const insEndDate = toValidDate(insuranceEnd);
    if (isNaN(insStartDate.getTime()) || isNaN(insEndDate.getTime()) || insStartDate > insEndDate) {
      return true; 
    }

    // 遍历校验每个缴费计划
    for (const plan of payPlanList) {
      const payStart = toValidDate(plan['Pay.tPayBgnTm']);
      const payEnd = toValidDate(plan['Pay.tPayEndTm']);

      // 缴费日期格式无效
      if (isNaN(payStart.getTime()) || isNaN(payEnd.getTime())) {
        return true;
      }

      // 缴费起期 > 缴费止期（核心校验）
      if (payStart > payEnd) {
        return true;
      }

      //  缴费区间超出保险区间
      if (payStart < insStartDate || payEnd > insEndDate) {
        return true;
      }
    }
    return false;
  } catch (error) {
    return true; 
  }
};


export default {
  checkPayPlanValidity,
};